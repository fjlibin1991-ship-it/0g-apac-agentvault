/**
 * 0G Storage Integration — AgentVault
 * Uses @0g/storage-sdk StorageClient for KV and Log operations
 * KV layer: agent profiles, service listings (millisecond query)
 * Log layer: reputation history, review records (immutable audit trail)
 */

import { StorageClient } from "@0g/storage-sdk";

const STORAGE_RPC = process.env.NEXT_PUBLIC_0G_STORAGE_RPC || "https://rpc-testnet.0g.ai";
const STORAGE_CONTRACT = process.env.NEXT_PUBLIC_0G_STORAGE_CONTRACT || "0x...";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AgentProfile {
  address: string;
  agentId: string;       // bytes32 as string
  name: string;
  description: string;
  capabilities: string[];
  pricing: string;       // e.g. "$0.01 per request"
  endpoint?: string;     // API endpoint for the agent
  reputation: number;
  totalSessions: number;
  registeredAt: number;
}

export interface ServiceListing {
  id: string;
  agentId: string;
  name: string;
  description: string;
  price: string;
  capabilityTags: string[];
  endpoint: string;
  active: boolean;
  createdAt: number;
}

export interface ReputationEvent {
  agentId: string;
  sessionId: string;
  rating: number;        // 0-100
  change: number;         // +/- delta applied to reputation
  reason: string;
  timestamp: number;
}

// ---------------------------------------------------------------------------
// KV Storage (agent profiles, service listings)
// ---------------------------------------------------------------------------

const AGENT_PREFIX = "agentvault:agent:";
const SERVICE_PREFIX = "agentvault:service:";

export async function registerAgentOnChain(profile: AgentProfile): Promise<string> {
  const client = new StorageClient(STORAGE_RPC, STORAGE_CONTRACT);
  const key = `${AGENT_PREFIX}${profile.address}`;
  await client.set({ key, value: JSON.stringify(profile) });
  return key;
}

export async function getAgentProfile(address: string): Promise<AgentProfile | null> {
  const client = new StorageClient(STORAGE_RPC, STORAGE_CONTRACT);
  const result = await client.get(`${AGENT_PREFIX}${address}`);
  if (!result || !result.value) return null;
  return JSON.parse(result.value) as AgentProfile;
}

export async function updateAgentProfile(address: string, updates: Partial<AgentProfile>): Promise<void> {
  const existing = await getAgentProfile(address);
  if (!existing) throw new Error("Agent not found");
  const client = new StorageClient(STORAGE_RPC, STORAGE_CONTRACT);
  await client.set({
    key: `${AGENT_PREFIX}${address}`,
    value: JSON.stringify({ ...existing, ...updates }),
  });
}

export async function listAgents(): Promise<AgentProfile[]> {
  const client = new StorageClient(STORAGE_RPC, STORAGE_CONTRACT);
  const keys = await client.keys(AGENT_PREFIX, 500);
  const agents: AgentProfile[] = [];
  for (const key of keys) {
    const result = await client.get(key);
    if (result?.value) agents.push(JSON.parse(result.value) as AgentProfile);
  }
  return agents.sort((a, b) => b.reputation - a.reputation);
}

export async function registerService(service: ServiceListing): Promise<string> {
  const client = new StorageClient(STORAGE_RPC, STORAGE_CONTRACT);
  const key = `${SERVICE_PREFIX}${service.id}`;
  await client.set({ key, value: JSON.stringify(service) });
  return key;
}

export async function getService(serviceId: string): Promise<ServiceListing | null> {
  const client = new StorageClient(STORAGE_RPC, STORAGE_CONTRACT);
  const result = await client.get(`${SERVICE_PREFIX}${serviceId}`);
  if (!result || !result.value) return null;
  return JSON.parse(result.value) as ServiceListing;
}

export async function listServicesByAgent(agentId: string): Promise<ServiceListing[]> {
  const client = new StorageClient(STORAGE_RPC, STORAGE_CONTRACT);
  const keys = await client.keys(SERVICE_PREFIX, 200);
  const services: ServiceListing[] = [];
  for (const key of keys) {
    const result = await client.get(key);
    if (result?.value) {
      const s = JSON.parse(result.value) as ServiceListing;
      if (s.agentId === agentId && s.active) services.push(s);
    }
  }
  return services;
}

// ---------------------------------------------------------------------------
// Log Storage (reputation events — append-only)
// ---------------------------------------------------------------------------

const REPUTATION_LOG_KEY = "agentvault:reputation_log";

export async function appendReputationEvent(event: ReputationEvent): Promise<void> {
  const client = new StorageClient(STORAGE_RPC, STORAGE_CONTRACT);
  await client.append(REPUTATION_LOG_KEY, JSON.stringify(event));
}

export async function getReputationHistory(agentId: string, limit = 100): Promise<ReputationEvent[]> {
  const client = new StorageClient(STORAGE_RPC, STORAGE_CONTRACT);
  const entries = await client.readLog(REPUTATION_LOG_KEY, limit);
  return entries
    .map((e: string) => JSON.parse(e) as ReputationEvent)
    .filter((e: ReputationEvent) => e.agentId === agentId)
    .sort((a: ReputationEvent, b: ReputationEvent) => a.timestamp - b.timestamp);
}
