// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./AgentRegistry.sol";

/**
 * @title ServiceMarketplace
 * @notice Marketplace for AI agent services
 * @dev Allows agents to list services and customers to place orders
 */
contract ServiceMarketplace is Ownable, ReentrancyGuard {
    
    /// @notice Emitted when a new service is listed
    event ServiceListed(
        bytes32 indexed serviceId, 
        address indexed agent, 
        uint256 price, 
        string metadataURI
    );
    
    /// @notice Emitted when a service is updated
    event ServiceUpdated(bytes32 indexed serviceId, uint256 newPrice, string metadataURI);
    
    /// @notice Emitted when a service is deactivated
    event ServiceDeactivated(bytes32 indexed serviceId);
    
    /// @notice Emitted when an order is placed
    event OrderPlaced(
        bytes32 indexed orderId, 
        bytes32 indexed serviceId, 
        address indexed buyer, 
        uint256 price
    );
    
    /// @notice Emitted when an order is completed
    event OrderCompleted(bytes32 indexed orderId);
    
    /// @notice Emitted when an order is cancelled
    event OrderCancelled(bytes32 indexed orderId);

    /// @notice Order status enum
    enum OrderStatus { 
        None, 
        Placed, 
        InProgress, 
        Completed, 
        Cancelled 
    }

    /// @notice Service structure
    struct Service {
        bytes32 serviceId;
        address agent;
        uint256 price;
        string metadataURI;
        bool isActive;
        uint256 totalOrders;
        uint256 createdAt;
    }

    /// @notice Order structure
    struct Order {
        bytes32 orderId;
        bytes32 serviceId;
        address buyer;
        address agent;
        uint256 price;
        OrderStatus status;
        uint256 createdAt;
        uint256 completedAt;
    }

    /// @notice Reference to AgentRegistry contract
    AgentRegistry public agentRegistry;
    
    /// @notice Mapping from service ID to Service
    mapping(bytes32 => Service) public services;
    
    /// @notice Mapping from order ID to Order
    mapping(bytes32 => Order) public orders;
    
    /// @notice Mapping from agent to their services
    mapping(address => bytes32[]) public agentServices;
    
    /// @notice Mapping from buyer to their orders
    mapping(address => bytes32[]) public buyerOrders;
    
    /// @notice Service ID to agent mapping
    mapping(bytes32 => address) public serviceToAgent;
    
    /// @notice Minimum service price (in wei)
    uint256 public constant MIN_PRICE = 0;
    
    /// @notice Maximum service price (in wei)
    uint256 public constant MAX_PRICE = 1000 ether;

    /**
     * @notice Constructor
     * @param _agentRegistry Address of the AgentRegistry contract
     */
    constructor(address _agentRegistry) {
        require(_agentRegistry != address(0), "ServiceMarketplace: invalid registry address");
        agentRegistry = AgentRegistry(_agentRegistry);
    }

    /**
     * @notice List a new service
     * @param serviceId Unique service ID (bytes32 hash)
     * @param price Price in wei
     * @param metadataURI URI to service metadata on 0G Storage
     */
    function listService(
        bytes32 serviceId, 
        uint256 price, 
        string calldata metadataURI
    ) external nonReentrant {
        require(serviceId != bytes32(0), "ServiceMarketplace: invalid service ID");
        require(price >= MIN_PRICE, "ServiceMarketplace: price below minimum");
        require(price <= MAX_PRICE, "ServiceMarketplace: price above maximum");
        require(bytes(metadataURI).length > 0, "ServiceMarketplace: empty metadata URI");
        require(services[serviceId].agent == address(0), "ServiceMarketplace: service ID exists");
        require(agentRegistry.checkRegistration(msg.sender), "ServiceMarketplace: caller not registered");

        Service storage service = services[serviceId];
        service.serviceId = serviceId;
        service.agent = msg.sender;
        service.price = price;
        service.metadataURI = metadataURI;
        service.isActive = true;
        service.totalOrders = 0;
        service.createdAt = block.timestamp;

        serviceToAgent[serviceId] = msg.sender;
        agentServices[msg.sender].push(serviceId);
        
        // Increment agent's service count in registry
        agentRegistry.incrementServiceCount(msg.sender);

        emit ServiceListed(serviceId, msg.sender, price, metadataURI);
    }

    /**
     * @notice Update an existing service
     * @param serviceId Service ID to update
     * @param newPrice New price in wei
     * @param newMetadataURI New metadata URI
     */
    function updateService(
        bytes32 serviceId, 
        uint256 newPrice, 
        string calldata newMetadataURI
    ) external nonReentrant {
        require(services[serviceId].agent == msg.sender, "ServiceMarketplace: not service owner");
        require(newPrice >= MIN_PRICE, "ServiceMarketplace: price below minimum");
        require(newPrice <= MAX_PRICE, "ServiceMarketplace: price above maximum");

        Service storage service = services[serviceId];
        service.price = newPrice;
        service.metadataURI = newMetadataURI;

        emit ServiceUpdated(serviceId, newPrice, newMetadataURI);
    }

    /**
     * @notice Deactivate a service
     * @param serviceId Service ID to deactivate
     */
    function deactivateService(bytes32 serviceId) external {
        require(services[serviceId].agent == msg.sender, "ServiceMarketplace: not service owner");
        
        services[serviceId].isActive = false;
        
        emit ServiceDeactivated(serviceId);
    }

    /**
     * @notice Place an order for a service
     * @param serviceId Service ID to order
     * @param orderId Unique order ID
     * @return Order struct
     */
    function placeOrder(bytes32 serviceId, bytes32 orderId) external nonReentrant returns (Order memory) {
        require(serviceId != bytes32(0), "ServiceMarketplace: invalid service ID");
        require(orderId != bytes32(0), "ServiceMarketplace: invalid order ID");
        require(orders[orderId].buyer == address(0), "ServiceMarketplace: order ID exists");
        
        Service storage service = services[serviceId];
        require(service.isActive, "ServiceMarketplace: service not active");
        require(service.agent != msg.sender, "ServiceMarketplace: cannot order own service");

        Order storage order = orders[orderId];
        order.orderId = orderId;
        order.serviceId = serviceId;
        order.buyer = msg.sender;
        order.agent = service.agent;
        order.price = service.price;
        order.status = OrderStatus.Placed;
        order.createdAt = block.timestamp;

        service.totalOrders++;
        buyerOrders[msg.sender].push(orderId);

        emit OrderPlaced(orderId, serviceId, msg.sender, service.price);
        
        return order;
    }

    /**
     * @notice Mark order as in progress
     * @param orderId Order ID
     */
    function startOrder(bytes32 orderId) external {
        Order storage order = orders[orderId];
        require(order.agent == msg.sender, "ServiceMarketplace: not service provider");
        require(order.status == OrderStatus.Placed, "ServiceMarketplace: invalid order state");
        
        order.status = OrderStatus.InProgress;
    }

    /**
     * @notice Mark order as completed
     * @param orderId Order ID
     */
    function completeOrder(bytes32 orderId) external {
        Order storage order = orders[orderId];
        require(order.agent == msg.sender || order.buyer == msg.sender, "ServiceMarketplace: not authorized");
        require(order.status == OrderStatus.InProgress, "ServiceMarketplace: order not in progress");
        
        order.status = OrderStatus.Completed;
        order.completedAt = block.timestamp;

        // Update agent reputation positively
        agentRegistry.adjustReputation(order.agent, 60); // Above average

        emit OrderCompleted(orderId);
    }

    /**
     * @notice Cancel an order
     * @param orderId Order ID
     */
    function cancelOrder(bytes32 orderId) external {
        Order storage order = orders[orderId];
        require(order.buyer == msg.sender, "ServiceMarketplace: not buyer");
        require(order.status == OrderStatus.Placed, "ServiceMarketplace: cannot cancel");

        order.status = OrderStatus.Cancelled;

        emit OrderCancelled(orderId);
    }

    /**
     * @notice Get service by ID
     * @param serviceId Service ID
     * @return Service struct
     */
    function getService(bytes32 serviceId) external view returns (Service memory) {
        return services[serviceId];
    }

    /**
     * @notice Get order by ID
     * @param orderId Order ID
     * @return Order struct
     */
    function getOrder(bytes32 orderId) external view returns (Order memory) {
        return orders[orderId];
    }

    /**
     * @notice Get all services for an agent
     * @param agent Agent address
     * @return Array of service IDs
     */
    function getAgentServices(address agent) external view returns (bytes32[] memory) {
        return agentServices[agent];
    }

    /**
     * @notice Get all orders for a buyer
     * @param buyer Buyer address
     * @return Array of order IDs
     */
    function getBuyerOrders(address buyer) external view returns (bytes32[] memory) {
        return buyerOrders[buyer];
    }

    /**
     * @notice Get orders by status for an agent
     * @param agent Agent address
     * @param status Order status to filter
     * @return Array of matching order IDs
     */
    function getOrdersByStatus(address agent, OrderStatus status) external view returns (bytes32[] memory) {
        bytes32[] memory allOrders = agentServices[agent];
        uint256 count = 0;
        
        // First pass to count matching orders
        for (uint256 i = 0; i < allOrders.length; i++) {
            if (orders[allOrders[i]].status == status) {
                count++;
            }
        }
        
        // Second pass to collect matching orders
        bytes32[] memory result = new bytes32[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < allOrders.length; i++) {
            if (orders[allOrders[i]].status == status) {
                result[index] = allOrders[i];
                index++;
            }
        }
        
        return result;
    }

    /**
     * @notice Get active services count
     * @param agent Agent address
     * @return Count of active services
     */
    function getActiveServicesCount(address agent) external view returns (uint256) {
        bytes32[] memory allServices = agentServices[agent];
        uint256 count = 0;
        for (uint256 i = 0; i < allServices.length; i++) {
            if (services[allServices[i]].isActive) {
                count++;
            }
        }
        return count;
    }
}
