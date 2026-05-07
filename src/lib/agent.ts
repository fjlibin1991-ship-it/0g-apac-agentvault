/**
 * 0G Agent ID Utilities
 * @description Helper functions for 0G Agent ID generation and validation
 */

import { keccak256, toBytes, encodePacked, parseEther } from 'viem';

/**
 * Agent metadata structure stored in 0G Storage
 */
export interface AgentMetadata {
  name: string;
  description: string;
  capabilities: string[];
  avatar?: string;
  banner?: string;
  website?: string;
  social?: {
    twitter?: string;
    github?: string;
    telegram?: string;
  };
  pricing?: {
    token: string;
    pricePerTask: string;
    minCommitment?: string;
  };
  createdAt: number;
  updatedAt: number;
}

/**
 * Service metadata structure
 */
export interface ServiceMetadata {
  name: string;
  description: string;
  category: ServiceCategory;
  inputs: {
    name: string;
    type: string;
    description: string;
    required: boolean;
  }[];
  outputs: {
    name: string;
    type: string;
    description: string;
  }[];
  pricing: {
    token: string;
    price: string;
    currency?: string;
  };
  estimatedDuration?: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

/**
 * Service categories
 */
export type ServiceCategory = 
  | 'text-generation'
  | 'image-generation'
  | 'code-generation'
  | 'data-analysis'
  | 'translation'
  | 'summarization'
  | 'question-answering'
  | 'sentiment-analysis'
  | 'custom-ai'
  | 'other';

/**
 * Generate a deterministic 0G Agent ID from wallet address and salt
 * @param walletAddress Ethereum wallet address
 * @param salt Optional salt for uniqueness
 */
export function generateAgentId(walletAddress: string, salt?: string): string {
  const timestamp = Date.now().toString();
  const input = encodePacked(
    ['address', 'string', 'string'],
    [walletAddress as `0x${string}`, salt || '', timestamp]
  );
  
  const hash = keccak256(input);
  return `0g_${hash.slice(2, 34)}`; // Format: 0g_ + 32 hex chars
}

/**
 * Generate a deterministic Service ID
 * @param agentId Agent's 0G Agent ID
 * @param serviceName Name of the service
 * @param version Service version
 */
export function generateServiceId(agentId: string, serviceName: string, version: number = 1): string {
  const input = encodePacked(
    ['string', 'string', 'uint256'],
    [agentId, serviceName, BigInt(version)]
  );
  
  const hash = keccak256(input);
  return `svc_${hash.slice(2, 34)}`;
}

/**
 * Generate a deterministic Order ID
 * @param serviceId Service ID
 * @param buyerAddress Buyer's wallet address
 * @param timestamp Order timestamp
 */
export function generateOrderId(serviceId: string, buyerAddress: string, timestamp?: number): string {
  const time = timestamp || Date.now();
  const input = encodePacked(
    ['string', 'address', 'uint256'],
    [serviceId, buyerAddress as `0x${string}`, BigInt(time)]
  );
  
  const hash = keccak256(input);
  return `ord_${hash.slice(2, 34)}`;
}

/**
 * Validate 0G Agent ID format
 * @param agentId Agent ID to validate
 */
export function isValidAgentId(agentId: string): boolean {
  return /^0g_[a-f0-9]{32}$/i.test(agentId);
}

/**
 * Validate Service ID format
 * @param serviceId Service ID to validate
 */
export function isValidServiceId(serviceId: string): boolean {
  return /^svc_[a-f0-9]{32}$/i.test(serviceId);
}

/**
 * Validate Order ID format
 * @param orderId Order ID to validate
 */
export function isValidOrderId(orderId: string): boolean {
  return /^ord_[a-f0-9]{32}$/i.test(orderId);
}

/**
 * Parse Agent ID from metadata URI
 * @param metadataURI IPFS or HTTP URI
 */
export function parseAgentIdFromUri(metadataURI: string): string | null {
  // Handle ipfs:// protocol
  if (metadataURI.startsWith('ipfs://')) {
    const cid = metadataURI.replace('ipfs://', '');
    return `ipfs_${cid.slice(0, 32)}`;
  }
  
  // Handle https://
  if (metadataURI.startsWith('https://')) {
    const pathParts = metadataURI.split('/');
    const lastPart = pathParts[pathParts.length - 1];
    if (lastPart && lastPart.length > 0) {
      return lastPart.replace('.json', '');
    }
  }
  
  return null;
}

/**
 * Create metadata URI for agent
 * @param agentId Agent's 0G Agent ID
 * @param metadata Agent metadata
 */
export function createMetadataUri(agentId: string, metadata: AgentMetadata): string {
  // In production, this would upload to IPFS or 0G Storage
  const jsonString = JSON.stringify(metadata);
  const encoded = btoa(jsonString);
  return `https://storage.0g.ai/${agentId}/metadata.json#${encoded}`;
}

/**
 * Create metadata URI for service
 * @param serviceId Service ID
 * @param metadata Service metadata
 */
export function createServiceMetadataUri(serviceId: string, metadata: ServiceMetadata): string {
  const jsonString = JSON.stringify(metadata);
  const encoded = btoa(jsonString);
  return `https://storage.0g.ai/services/${serviceId}/metadata.json#${encoded}`;
}

/**
 * Format reputation score for display
 * @param reputation Raw reputation value
 * @param decimals Decimal places
 */
export function formatReputation(reputation: number, decimals: number = 1): string {
  const normalized = reputation / 100; // Base is 100
  return normalized.toFixed(decimals);
}

/**
 * Calculate agent tier from reputation
 * @param reputation Reputation score
 */
export function getAgentTier(reputation: number): {
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  multiplier: number;
  color: string;
} {
  if (reputation >= 5000) {
    return { tier: 'platinum', multiplier: 2.0, color: '#E5E4E2' };
  } else if (reputation >= 3000) {
    return { tier: 'gold', multiplier: 1.5, color: '#FFD700' };
  } else if (reputation >= 1500) {
    return { tier: 'silver', multiplier: 1.2, color: '#C0C0C0' };
  }
  return { tier: 'bronze', multiplier: 1.0, color: '#CD7F32' };
}

/**
 * Estimate gas for contract interactions
 * @param operation Operation type
 */
export function estimateGas(operation: 'register' | 'listService' | 'placeOrder' | 'escrow'): bigint {
  const baseGas: Record<string, number> = {
    register: 150000,
    listService: 100000,
    placeOrder: 120000,
    escrow: 80000,
  };
  
  return BigInt(baseGas[operation] || 100000);
}

/**
 * Get explorer URL for transaction
 * @param txHash Transaction hash
 * @param chainId Network chain ID
 */
export function getExplorerUrl(txHash: string, chainId: number = 0): string {
  const explorers: Record<number, string> = {
    0: 'https://explorer.0g.ai',
    1: 'https://etherscan.io',
    137: 'https://polygonscan.com',
  };
  
  const baseUrl = explorers[chainId] || explorers[0];
  return `${baseUrl}/tx/${txHash}`;
}

/**
 * Get agent profile URL
 * @param agentId Agent ID
 */
export function getAgentProfileUrl(agentId: string): string {
  return `/agent/${agentId}`;
}

/**
 * Get service URL
 * @param serviceId Service ID
 */
export function getServiceUrl(serviceId: string): string {
  return `/service/${serviceId}`;
}

/**
 * Truncate address for display
 * @param address Wallet address
 * @param startChars Characters to show at start
 * @param endChars Characters to show at end
 */
export function truncateAddress(
  address: string, 
  startChars: number = 6, 
  endChars: number = 4
): string {
  if (address.length <= startChars + endChars) {
    return address;
  }
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

/**
 * Format token amount for display
 * @param amount Amount in wei
 * @param symbol Token symbol
 */
export function formatTokenAmount(amount: bigint, symbol: string = 'ETH'): string {
  const ether = Number(amount) / 1e18;
  if (ether < 0.001) {
    return `< 0.001 ${symbol}`;
  }
  return `${ether.toFixed(4)} ${symbol}`;
}
