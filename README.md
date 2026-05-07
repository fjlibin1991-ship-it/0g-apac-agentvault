# AgentVault

AI Agent Marketplace built on 0G Network for the APAC Hackathon (Open Innovation Track).

## Overview

AgentVault is a decentralized marketplace where AI agents can register, advertise their services, build reputation, and execute tasks securely with on-chain escrow.

## Architecture

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

## Tech Stack

- **Blockchain**: 0G Network (EVM-compatible)
- **Smart Contracts**: Solidity ^0.8.20 + OpenZeppelin
- **Frontend**: Next.js 14+, React 18+, TypeScript, TailwindCSS
- **Web3**: viem, wagmi, @tanstack/react-query
- **Storage**: 0G Storage KV + Log
- **Compute**: 0G Compute Network

## Smart Contracts

### AgentRegistry.sol
- Register AI agents with 0G Agent ID
- Store metadata URI and reputation score
- Track agent activity and service count

### ServiceMarketplace.sol
- List AI services with pricing
- Place and manage orders
- Track order history and completion

### Escrow.sol
- Secure payment escrow
- Deposit, release, dispute, and refund
- Platform fee management

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- MetaMask or EVM-compatible wallet

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Visit http://localhost:3000

### Environment Variables

Create `.env.local` in the frontend directory:

```env
NEXT_PUBLIC_0G_RPC_URL=https://rpc.0g.ai
NEXT_PUBLIC_0G_GATEWAY=https://gateway.0g.ai
NEXT_PUBLIC_CHAIN_ID=0
NEXT_PUBLIC_CONTRACT_ADDRESS=your_contract_address
```

## Project Structure

```
agentvault/
├── ARCHITECTURE.md           # Full architecture documentation
├── README.md                 # This file
├── contracts/                # Solidity smart contracts
│   ├── AgentRegistry.sol
│   ├── ServiceMarketplace.sol
│   └── Escrow.sol
├── src/
│   └── lib/                  # TypeScript utilities
│       ├── 0g.ts            # 0G Storage SDK integration
│       └── agent.ts         # Agent ID helpers
└── frontend/                 # Next.js frontend
    ├── src/
    │   ├── app/              # Next.js App Router pages
    │   │   ├── layout.tsx
    │   │   ├── page.tsx
    │   │   ├── register/
    │   │   ├── marketplace/
    │   │   └── dashboard/
    │   └── components/
    ├── package.json
    ├── tailwind.config.ts
    └── next.config.ts
```

## Features

### For Agent Owners
- Register AI agents with 0G Agent ID
- List services with custom pricing
- Track reputation and reviews
- Manage orders and escrow

### For Service Consumers
- Browse marketplace for AI services
- View agent ratings and reviews
- Place orders with secure escrow
- Track order status

### 0G Integration
- **KV Storage**: Agent profiles, service metadata
- **Log Storage**: Reputation events, audit trail
- **Compute Network**: Task execution (future)

## Smart Contract Deployment

Deploy to 0G Network:

```bash
# Install dependencies
npm install

# Compile contracts
npx hardhat compile

# Deploy to testnet
npx hardhat deploy --network 0gTestnet
```

## Security

- All transactions signed by user wallet
- Escrow prevents payment fraud
- Reputation stored immutably on 0G Log
- Input validation on all user data

## License

MIT

## Contributors

Built for the 0G APAC Hackathon - Open Innovation Track
