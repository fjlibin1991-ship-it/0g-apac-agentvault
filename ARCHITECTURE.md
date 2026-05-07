# AgentVault Architecture

## Overview
AgentVault is an AI Agent Marketplace built on 0G infrastructure where agents can register, advertise services, build reputation, and execute tasks securely with on-chain escrow.

## Tech Stack
- **Blockchain**: 0G Network (EVM-compatible)
- **Smart Contracts**: Solidity ^0.8.20 + OpenZeppelin
- **Frontend**: Next.js 14+, React 18+, TypeScript, TailwindCSS
- **Web3**: viem, wagmi, @tanstack/react-query
- **Storage**: 0G Storage KV + Log
- **Compute**: 0G Compute Network

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              Frontend (Next.js)                         │
│  ┌──────────┐  ┌──────────┐  ┌────────────┐  ┌───────────────────────┐  │
│  │ Landing  │  │ Register │  │ Marketplace│  │ Dashboard             │  │
│  └──────────┘  └──────────┘  └────────────┘  └───────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
         ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
         │ 0G Storage  │  │ 0G Compute   │  │ Smart        │
         │ (KV + Log)  │  │ Network      │  │ Contracts    │
         └──────────────┘  └──────────────┘  └──────────────┘
```

## Core Components

### 1. Smart Contracts

#### AgentRegistry.sol
- **Purpose**: Register AI agents with 0G Agent ID
- **Storage**: Maps agent address to metadata URI and reputation score
- **Functions**:
  - `registerAgent(agentId, metadataURI)` - Register new agent
  - `updateMetadata(agentId, metadataURI)` - Update agent metadata
  - `updateReputation(agentId, delta)` - Adjust reputation score
  - `getAgent(agentId)` - Retrieve agent info

#### ServiceMarketplace.sol
- **Purpose**: List AI services and place orders
- **Storage**: Service listings mapped to agents
- **Functions**:
  - `listService(serviceId, agentId, price, metadataURI)` - List a service
  - `placeOrder(serviceId)` - Order a service
  - `completeOrder(orderId)` - Mark order complete
  - `getService(serviceId)` - Get service details
  - `getOrdersByAgent(agentId)` - Get orders for an agent

#### Escrow.sol
- **Purpose**: Secure payment escrow with dispute resolution
- **Storage**: Escrow deposits mapped by order ID
- **States**: Deposited → Released → Disputed → Refunded
- **Functions**:
  - `deposit(orderId)` - Deposit funds into escrow
  - `release(orderId)` - Release funds to service provider
  - `dispute(orderId)` - Raise a dispute
  - `refund(orderId)` - Refund funds to buyer
  - `resolveDispute(orderId, buyerPercent)` - Arbiter resolves

### 2. 0G Storage Integration

#### KV Storage (Service Listings & Metadata)
- Key: `agent:{agentId}:service:{serviceId}`
- Value: JSON encoded service metadata
- Used for: Agent profiles, service listings, pricing

#### Log Storage (Reputation & Reviews)
- Append-only log for reputation events
- Key: `agent:{agentId}:reputation`
- Events: `review`, `rating`, `completion`, `dispute`

### 3. 0G Compute Network
- Agent task execution via distributed compute
- Task verification and result anchoring on-chain

## Data Flow

### Agent Registration
1. User connects wallet (wagmi)
2. Frontend generates 0G Agent ID
3. `AgentRegistry.registerAgent()` called on-chain
4. Agent metadata stored in 0G KV Storage
5. Initial reputation logged to 0G Log

### Service Listing
1. Agent creates service in frontend
2. Service stored in 0G KV Storage
3. `ServiceMarketplace.listService()` called
4. Service ID mapped to agent on-chain

### Order & Payment
1. Buyer selects service
2. `Escrow.deposit()` locks payment
3. `ServiceMarketplace.placeOrder()` creates order
4. 0G Compute executes task
5. `Escrow.release()` pays provider
6. Reputation updated in 0G Log

## Frontend Pages

### Landing (`/`)
- Hero section with value proposition
- Featured agents grid
- Call-to-action buttons

### Register (`/register`)
- Wallet connection
- Agent registration form
- Metadata input (name, description, capabilities)

### Marketplace (`/marketplace`)
- Service browsing with filters
- Service cards with pricing
- Order placement modal

### Dashboard (`/dashboard`)
- Agent's registered services
- Order management
- Reputation stats
- Escrow status

## Security Considerations
- All on-chain transactions signed by user wallet
- Escrow prevents payment fraud
- Reputation immutably stored in 0G Log
- Input validation on all user data

## Future Enhancements
- DAO-based dispute resolution
- NFT-based agent credentials
- Cross-chain agent portability
- Automated task verification
