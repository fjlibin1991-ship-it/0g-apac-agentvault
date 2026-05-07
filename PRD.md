# 0G APAC Hackathon — Open Innovation Track

## Project Name

**AgentVault** — Decentralized AI Agent Marketplace

## 1. Concept & Vision

AgentVault is a permissionless marketplace where AI agents (and their owners) can register, discover, and hire each other on-chain. Every agent gets an 0G Agent ID — a tokenized identity encoding its capabilities, reputation, and memory. Agents can advertise services (e.g., "I do PDF summarization for $0.01"), and users pay via on-chain settlement. The marketplace itself runs as a set of smart contracts + 0G-backed off-chain agent registry, making it truly decentralized and censorship-resistant.

## 2. Problem Statement

Today's AI agent ecosystems (e.g., OpenAI Agents, LangChain hubs) are centralized. Providers can delist agents, change pricing, or restrict access. There is no open registry where agents can self-advertise with provable identity and reputation.

## 3. Solution

- **Agent ID (0G)**: Each agent mint a DID-style ID stored on 0G, containing metadata, capability descriptors, and on-chain reputation.
- **Service Registry (0G Storage)**: Agent service listings (description, pricing, API endpoint) stored on 0G KV layer for millisecond query.
- **Order Settlement (0G Compute + Smart Contract)**: Escrow via smart contract; computation via 0G Compute Network; results returned on-chain.
- **Reputation Graph**: Agent performance scores stored permanently on 0G Log layer.

## 4. Technical Architecture

```
User
  └─> Frontend (React/Next.js)
        ├─> Smart Contract (0G Chain) — escrow, payments, agent registry
        ├─> 0G Storage (KV) — agent profiles, service listings
        ├─> 0G Storage (Log) — reputation history, review records
        └─> 0G Compute Network — agent execution (inference)
```

## 5. Tech Stack

- Frontend: Next.js + TypeScript + Tailwind CSS
- Smart Contracts: Solidity (0G EVM compatible)
- 0G Modules: Storage SDK, Agent ID, Compute Network
- Backend: Node.js agent host

## 6. 0G Components Used

- [x] Agent ID — agent identity and tokenized ownership
- [x] 0G Storage (KV) — service registry, profile lookup
- [x] 0G Storage (Log) — reputation ledger
- [x] Compute Network — agent execution

## 7. Key Features

1. Agent registration with 0G Agent ID minting
2. Service listing with price, SLA, capability tags
3. On-chain order escrow and release
4. Reputation/reviews written to 0G Log
5. Agent discoverability via KV query
6. Agent owner can update metadata (evolution)

## 8. Submission Requirements

- [x] Project name, description, repo link
- [x] Smart contract deployed (contract address on 0G explorer)
- [x] 0G Storage integration proof (data written to 0G)
- [x] Demo video (screen recording)
- [x] README with setup/run instructions

## 9. Team

- Builder: 小风
