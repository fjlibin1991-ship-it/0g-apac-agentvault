// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title Escrow
 * @notice Secure payment escrow with dispute resolution
 * @dev Deposits, releases, disputes, and refunds for service orders
 */
contract Escrow is Ownable, ReentrancyGuard {
    
    /// @notice Emitted when funds are deposited
    event Deposited(
        bytes32 indexed orderId, 
        address indexed buyer, 
        uint256 amount
    );
    
    /// @notice Emitted when funds are released to seller
    event Released(
        bytes32 indexed orderId, 
        address indexed seller, 
        uint256 amount
    );
    
    /// @notice Emitted when dispute is raised
    event Disputed(
        bytes32 indexed orderId, 
        address indexed raisedBy
    );
    
    /// @notice Emitted when dispute is resolved
    event DisputedResolved(
        bytes32 indexed orderId, 
        uint256 buyerPercent, 
        uint256 sellerPercent
    );
    
    /// @notice Emitted when refund is processed
    event Refunded(
        bytes32 indexed orderId, 
        address indexed buyer, 
        uint256 amount
    );

    /// @notice Escrow state enum
    enum EscrowState {
        None,
        Deposited,
        Released,
        Disputed,
        Resolved,
        Refunded
    }

    /// @notice Escrow details structure
    struct EscrowDetail {
        bytes32 orderId;
        address buyer;
        address seller;
        uint256 amount;
        EscrowState state;
        uint256 depositedAt;
        uint256 releasedAt;
        uint256 disputedAt;
        address disputedBy;
    }

    /// @notice Mapping from order ID to EscrowDetail
    mapping(bytes32 => EscrowDetail) public escrows;
    
    /// @notice Mapping to track if address has active escrow
    mapping(address => bytes32[]) public buyerEscrows;
    mapping(address => bytes32[]) public sellerEscrows;
    
    /// @notice Dispute arbiter address
    address public arbiter;

    /// @notice Authorized callers (e.g. ServiceMarketplace) that can release/refund
    mapping(address => bool) public authorizedCallers;

    /// @notice Platform fee percentage (in basis points, 100 = 1%)
    uint256 public platformFeeBps = 250; // 2.5%
    
    /// @notice Address to receive platform fees
    address public platformWallet;

    /**
     * @notice Constructor
     * @param _arbiter Initial arbiter address for disputes
     * @param _platformWallet Platform wallet for fee collection
     */
    constructor(address _arbiter, address _platformWallet) {
        require(_arbiter != address(0), "Escrow: invalid arbiter address");
        require(_platformWallet != address(0), "Escrow: invalid platform wallet");
        arbiter = _arbiter;
        platformWallet = _platformWallet;
    }

    /**
     * @notice Deposit funds into escrow for an order
     * @param orderId Unique order ID
     * @param seller Address of the service provider
     */
    function deposit(bytes32 orderId, address seller) external payable nonReentrant {
        require(orderId != bytes32(0), "Escrow: invalid order ID");
        require(seller != address(0), "Escrow: invalid seller address");
        require(seller != msg.sender, "Escrow: cannot escrow with self");
        require(msg.value > 0, "Escrow: zero deposit");
        require(escrows[orderId].state == EscrowState.None, "Escrow: order already exists");

        EscrowDetail storage escrow = escrows[orderId];
        escrow.orderId = orderId;
        escrow.buyer = msg.sender;
        escrow.seller = seller;
        escrow.amount = msg.value;
        escrow.state = EscrowState.Deposited;
        escrow.depositedAt = block.timestamp;

        buyerEscrows[msg.sender].push(orderId);
        sellerEscrows[seller].push(orderId);

        emit Deposited(orderId, msg.sender, msg.value);
    }

    /**
     * @notice Authorize a contract to release/refund escrows
     * @param caller Contract address to authorize
     */
    function authorizeCaller(address caller) external onlyOwner {
        authorizedCallers[caller] = true;
    }

    /**
     * @notice Revoke authorization from a contract
     * @param caller Contract address to revoke
     */
    function revokeCaller(address caller) external onlyOwner {
        authorizedCallers[caller] = false;
    }

    /**
     * @notice Release funds from escrow to seller (buyer or authorized marketplace)
     * @param orderId Order ID to release
     */
    function release(bytes32 orderId) external nonReentrant {
        EscrowDetail storage escrow = escrows[orderId];
        require(escrow.state == EscrowState.Deposited, "Escrow: not deposited");
        require(
            escrow.buyer == msg.sender || authorizedCallers[msg.sender],
            "Escrow: not buyer or authorized"
        );

        uint256 amount = escrow.amount;
        uint256 fee = (amount * platformFeeBps) / 10000;
        uint256 sellerAmount = amount - fee;

        escrow.state = EscrowState.Released;
        escrow.releasedAt = block.timestamp;

        // Transfer to seller
        (bool successSeller, ) = escrow.seller.call{value: sellerAmount}("");
        require(successSeller, "Escrow: seller transfer failed");

        // Transfer platform fee
        (bool successFee, ) = platformWallet.call{value: fee}("");
        require(successFee, "Escrow: fee transfer failed");

        emit Released(orderId, escrow.seller, sellerAmount);
    }

    /**
     * @notice Raise a dispute
     * @param orderId Order ID to dispute
     */
    function dispute(bytes32 orderId) external nonReentrant {
        EscrowDetail storage escrow = escrows[orderId];
        require(escrow.state == EscrowState.Deposited, "Escrow: not deposited");
        require(escrow.buyer == msg.sender || escrow.seller == msg.sender, "Escrow: not authorized");

        escrow.state = EscrowState.Disputed;
        escrow.disputedAt = block.timestamp;
        escrow.disputedBy = msg.sender;

        emit Disputed(orderId, msg.sender);
    }

    /**
     * @notice Resolve a dispute (only arbiter)
     * @param orderId Order ID to resolve
     * @param buyerPercent Percentage to refund buyer (0-100)
     */
    function resolveDispute(bytes32 orderId, uint256 buyerPercent) external nonReentrant {
        require(msg.sender == arbiter, "Escrow: not arbiter");
        require(buyerPercent <= 100, "Escrow: invalid percentage");

        EscrowDetail storage escrow = escrows[orderId];
        require(escrow.state == EscrowState.Disputed, "Escrow: not disputed");

        uint256 amount = escrow.amount;
        uint256 buyerAmount = (amount * buyerPercent) / 100;
        uint256 sellerAmount = amount - buyerAmount;

        escrow.state = EscrowState.Resolved;

        if (buyerAmount > 0) {
            (bool successBuyer, ) = escrow.buyer.call{value: buyerAmount}("");
            require(successBuyer, "Escrow: buyer refund failed");
        }

        if (sellerAmount > 0) {
            (bool successSeller, ) = escrow.seller.call{value: sellerAmount}("");
            require(successSeller, "Escrow: seller refund failed");
        }

        escrow.releasedAt = block.timestamp;

        emit DisputedResolved(orderId, buyerPercent, 100 - buyerPercent);
    }

    /**
     * @notice Refund buyer (buyer, arbiter, or authorized marketplace)
     * @param orderId Order ID to refund
     */
    function refund(bytes32 orderId) external nonReentrant {
        EscrowDetail storage escrow = escrows[orderId];
        require(escrow.state == EscrowState.Deposited, "Escrow: not deposited");
        require(
            escrow.buyer == msg.sender || msg.sender == arbiter || authorizedCallers[msg.sender],
            "Escrow: not authorized"
        );

        uint256 amount = escrow.amount;
        escrow.state = EscrowState.Refunded;

        (bool success, ) = escrow.buyer.call{value: amount}("");
        require(success, "Escrow: refund failed");

        emit Refunded(orderId, escrow.buyer, amount);
    }

    /**
     * @notice Update arbiter address
     * @param newArbiter New arbiter address
     */
    function updateArbiter(address newArbiter) external onlyOwner {
        require(newArbiter != address(0), "Escrow: invalid arbiter");
        arbiter = newArbiter;
    }

    /**
     * @notice Update platform fee
     * @param newFeeBps New fee in basis points
     */
    function updatePlatformFee(uint256 newFeeBps) external onlyOwner {
        require(newFeeBps <= 1000, "Escrow: fee too high"); // Max 10%
        platformFeeBps = newFeeBps;
    }

    /**
     * @notice Update platform wallet
     * @param newWallet New wallet address
     */
    function updatePlatformWallet(address newWallet) external onlyOwner {
        require(newWallet != address(0), "Escrow: invalid wallet");
        platformWallet = newWallet;
    }

    /**
     * @notice Get escrow details
     * @param orderId Order ID
     * @return EscrowDetail struct
     */
    function getEscrow(bytes32 orderId) external view returns (EscrowDetail memory) {
        return escrows[orderId];
    }

    /**
     * @notice Get escrows by buyer
     * @param buyer Buyer address
     * @return Array of order IDs
     */
    function getBuyerEscrows(address buyer) external view returns (bytes32[] memory) {
        return buyerEscrows[buyer];
    }

    /**
     * @notice Get escrows by seller
     * @param seller Seller address
     * @return Array of order IDs
     */
    function getSellerEscrows(address seller) external view returns (bytes32[] memory) {
        return sellerEscrows[seller];
    }

    /**
     * @notice Get escrow state for an order
     * @param orderId Order ID
     * @return EscrowState enum value
     */
    function getEscrowState(bytes32 orderId) external view returns (EscrowState) {
        return escrows[orderId].state;
    }

    /**
     * @notice Get total escrowed amount for an address
     * @param user Address to check
     * @param asBuyer True for buyer view, false for seller view
     * @return Total amount
     */
    function getTotalEscrowed(address user, bool asBuyer) external view returns (uint256) {
        bytes32[] storage userEscrows = asBuyer ? buyerEscrows[user] : sellerEscrows[user];
        uint256 total = 0;
        
        for (uint256 i = 0; i < userEscrows.length; i++) {
            EscrowDetail storage escrow = escrows[userEscrows[i]];
            if (escrow.state == EscrowState.Deposited || escrow.state == EscrowState.Disputed) {
                if (asBuyer) {
                    total += escrow.amount;
                } else {
                    // Seller's share after platform fee
                    total += escrow.amount - (escrow.amount * platformFeeBps) / 10000;
                }
            }
        }
        
        return total;
    }

    /**
     * @notice Check if order has active escrow
     * @param orderId Order ID
     * @return bool True if escrow exists and is active
     */
    function hasActiveEscrow(bytes32 orderId) external view returns (bool) {
        EscrowState state = escrows[orderId].state;
        return state == EscrowState.Deposited || state == EscrowState.Disputed;
    }
}
