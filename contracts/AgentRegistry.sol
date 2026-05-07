// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title AgentRegistry
 * @notice Registry for AI agents with 0G Agent ID and reputation tracking
 * @dev Stores agent metadata URI and reputation score on-chain
 */
contract AgentRegistry is Ownable, ReentrancyGuard {
    
    /// @notice Emitted when a new agent registers
    event AgentRegistered(address indexed agentAddress, bytes32 indexed agentId, string metadataURI);
    
    /// @notice Emitted when agent metadata is updated
    event AgentMetadataUpdated(address indexed agentAddress, bytes32 indexed agentId, string metadataURI);
    
    /// @notice Emitted when agent reputation changes
    event ReputationUpdated(address indexed agentAddress, bytes32 indexed agentId, int256 delta, uint256 newScore);

    /// @notice Emitted when agent is deactivated
    event AgentDeactivated(address indexed agentAddress, bytes32 indexed agentId);

    /// @notice Agent structure
    struct Agent {
        bytes32 agentId;
        string metadataURI;
        uint256 reputation;
        bool isActive;
        uint256 registeredAt;
        uint256 totalServices;
    }

    /// @notice Mapping from agent address to Agent structure
    mapping(address => Agent) public agents;
    
    /// @notice Mapping from agent ID to agent address (for reverse lookup)
    mapping(bytes32 => address) public agentIdToAddress;
    
    /// @notice Mapping to check if address is registered
    mapping(address => bool) public isRegistered;

    /// @notice Minimum reputation score
    uint256 public constant MIN_REPUTATION = 0;
    
    /// @notice Maximum reputation score
    uint256 public constant MAX_REPUTATION = 10000;
    
    /// @notice Base reputation for new agents
    uint256 public constant BASE_REPUTATION = 100;

    /**
     * @notice Register a new AI agent
     * @param agentId The 0G Agent ID (bytes32 hash)
     * @param metadataURI URI pointing to agent metadata on 0G Storage
     */
    function registerAgent(bytes32 agentId, string calldata metadataURI) external nonReentrant {
        require(agentId != bytes32(0), "AgentRegistry: invalid agent ID");
        require(bytes(metadataURI).length > 0, "AgentRegistry: empty metadata URI");
        require(!isRegistered[msg.sender], "AgentRegistry: already registered");
        require(agentIdToAddress[agentId] == address(0), "AgentRegistry: agent ID already exists");

        Agent storage agent = agents[msg.sender];
        agent.agentId = agentId;
        agent.metadataURI = metadataURI;
        agent.reputation = BASE_REPUTATION;
        agent.isActive = true;
        agent.registeredAt = block.timestamp;
        agent.totalServices = 0;

        isRegistered[msg.sender] = true;
        agentIdToAddress[agentId] = msg.sender;

        emit AgentRegistered(msg.sender, agentId, metadataURI);
    }

    /**
     * @notice Update agent metadata URI
     * @param metadataURI New metadata URI
     */
    function updateMetadata(string calldata metadataURI) external {
        require(isRegistered[msg.sender], "AgentRegistry: not registered");
        require(bytes(metadataURI).length > 0, "AgentRegistry: empty metadata URI");

        Agent storage agent = agents[msg.sender];
        agent.metadataURI = metadataURI;

        emit AgentMetadataUpdated(msg.sender, agent.agentId, metadataURI);
    }

    /**
     * @notice Update agent reputation score
     * @param agent Address of the agent
     * @param delta Change in reputation (positive or negative)
     */
    function updateReputation(address agent, int256 delta) external onlyOwner nonReentrant {
        require(isRegistered[agent], "AgentRegistry: agent not registered");
        
        Agent storage agentData = agents[agent];
        int256 newReputation = int256(agentData.reputation) + delta;
        
        // Clamp reputation to valid range
        if (newReputation < int256(MIN_REPUTATION)) {
            newReputation = int256(MIN_REPUTATION);
        } else if (newReputation > int256(MAX_REPUTATION)) {
            newReputation = int256(MAX_REPUTATION);
        }
        
        agentData.reputation = uint256(newReputation);
        
        emit ReputationUpdated(agent, agentData.agentId, delta, agentData.reputation);
    }

    /**
     * @notice Adjust reputation by a specific value (public version for marketplace feedback)
     * @param agent Address of the agent
     * @param rating Rating change (typically -5 to +10)
     */
    function adjustReputation(address agent, uint256 rating) external {
        require(isRegistered[agent], "AgentRegistry: agent not registered");
        require(rating <= 100, "AgentRegistry: invalid rating value");

        Agent storage agentData = agents[agent];
        int256 change = int256(rating) - 50; // Convert 0-100 to -50 to +50
        int256 newReputation = int256(agentData.reputation) + change;
        
        if (newReputation < int256(MIN_REPUTATION)) {
            newReputation = int256(MIN_REPUTATION);
        } else if (newReputation > int256(MAX_REPUTATION)) {
            newReputation = int256(MAX_REPUTATION);
        }
        
        agentData.reputation = uint256(newReputation);
        
        emit ReputationUpdated(agent, agentData.agentId, change, agentData.reputation);
    }

    /**
     * @notice Deactivate an agent
     */
    function deactivateAgent() external {
        require(isRegistered[msg.sender], "AgentRegistry: not registered");
        
        Agent storage agent = agents[msg.sender];
        agent.isActive = false;
        
        emit AgentDeactivated(msg.sender, agent.agentId);
    }

    /**
     * @notice Get agent information by address
     * @param agentAddress Address of the agent
     * @return Agent struct
     */
    function getAgent(address agentAddress) external view returns (Agent memory) {
        require(isRegistered[agentAddress], "AgentRegistry: agent not found");
        return agents[agentAddress];
    }

    /**
     * @notice Get agent address by agent ID
     * @param agentId The 0G Agent ID
     * @return Address of the agent
     */
    function getAgentById(bytes32 agentId) external view returns (address) {
        address agentAddress = agentIdToAddress[agentId];
        require(agentAddress != address(0), "AgentRegistry: agent ID not found");
        return agentAddress;
    }

    /**
     * @notice Increment total services count for an agent
     * @param agent Address of the agent
     */
    function incrementServiceCount(address agent) external {
        require(isRegistered[agent], "AgentRegistry: agent not registered");
        agents[agent].totalServices++;
    }

    /**
     * @notice Check if an address is a registered agent
     * @param agentAddress Address to check
     * @return bool True if registered
     */
    function checkRegistration(address agentAddress) external view returns (bool) {
        return isRegistered[agentAddress];
    }

    /**
     * @notice Get all registered agents count
     * @dev This iterates through events - for production, maintain a counter
     * @return uint256 Estimated count (based on events)
     */
    function getRegisteredCount() external view returns (uint256) {
        // In production, maintain a counter mapping
        return 0; // Placeholder - would need indexed counter
    }
}
