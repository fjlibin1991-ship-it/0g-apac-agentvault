/**
 * 0G Storage Integration
 * @description TypeScript SDK for 0G Storage KV and Log operations
 * @see docs.0g.ai
 */

import { sha256 } from 'viem';

// 0G Storage Configuration
const ZG_STORAGE_CONFIG = {
  rpcUrl: process.env.NEXT_PUBLIC_0G_RPC_URL || 'https://rpc.0g.ai',
  storageContract: process.env.NEXT_PUBLIC_0G_STORAGE_CONTRACT || '0x...',
  logContract: process.env.NEXT_PUBLIC_0G_LOG_CONTRACT || '0x...',
  gateway: process.env.NEXT_PUBLIC_0G_GATEWAY || 'https://gateway.0g.ai',
};

/**
 * KV Storage Operations
 * 0G KV Storage for structured data (agent metadata, service listings)
 */
export class ZeroGKVStorage {
  private rpcUrl: string;
  private gateway: string;

  constructor(config?: Partial<typeof 0G_STORAGE_CONFIG>) {
    this.rpcUrl = config?.rpcUrl || 0G_STORAGE_CONFIG.rpcUrl;
    this.gateway = config?.gateway || 0G_STORAGE_CONFIG.gateway;
  }

  /**
   * Generate a storage key for agent data
   * @param agentId Agent's 0G Agent ID
   * @param type Data type (profile, service, etc.)
   * @param id Optional specific ID
   */
  static generateKey(agentId: string, type: string, id?: string): string {
    if (id) {
      return `agent:${agentId}:${type}:${id}`;
    }
    return `agent:${agentId}:${type}`;
  }

  /**
   * Write data to 0G KV Storage
   * @param key Storage key
   * @param value JSON-serializable value
   * @param signer Wallet client for signing
   */
  async write(
    key: string,
    value: Record<string, unknown>,
    signer: { signMessage: (msg: { message: string }) => Promise<string> }
  ): Promise<{ txHash: string; storageProof: string }> {
    const data = JSON.stringify(value);
    const dataHash = await this.hashData(data);
    
    // Create signed write proof
    const message = JSON.stringify({
      action: 'kv_write',
      key,
      data_hash: dataHash,
      timestamp: Date.now(),
    });
    
    const signature = await signer.signMessage({ message });
    
    // Submit to 0G Storage Network
    const response = await fetch(`${this.gateway}/api/v1/kv/write`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        key,
        data,
        signature,
        timestamp: Date.now(),
      }),
    });

    if (!response.ok) {
      throw new Error(`0G Storage write failed: ${response.statusText}`);
    }

    const result = await response.json();
    return {
      txHash: result.tx_hash,
      storageProof: result.proof,
    };
  }

  /**
   * Read data from 0G KV Storage
   * @param key Storage key
   */
  async read(key: string): Promise<Record<string, unknown> | null> {
    const response = await fetch(`${this.gateway}/api/v1/kv/read/${encodeURIComponent(key)}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error(`0G Storage read failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data as Record<string, unknown>;
  }

  /**
   * Update existing data in KV Storage
   * @param key Storage key
   * @param value New value (merged with existing)
   */
  async update(
    key: string,
    value: Record<string, unknown>,
    signer: { signMessage: (msg: { message: string }) => Promise<string> }
  ): Promise<{ txHash: string; storageProof: string }> {
    // First read existing data
    const existing = await this.read(key);
    const merged = existing ? { ...existing, ...value, updatedAt: Date.now() } : { ...value, createdAt: Date.now() };
    
    return this.write(key, merged, signer);
  }

  /**
   * Delete data from KV Storage
   * @param key Storage key
   * @param signer Wallet client for signing
   */
  async delete(
    key: string,
    signer: { signMessage: (msg: { message: string }) => Promise<string> }
  ): Promise<{ txHash: string }> {
    const message = JSON.stringify({
      action: 'kv_delete',
      key,
      timestamp: Date.now(),
    });
    
    const signature = await signer.signMessage({ message });
    
    const response = await fetch(`${this.gateway}/api/v1/kv/delete`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, signature }),
    });

    if (!response.ok) {
      throw new Error(`0G Storage delete failed: ${response.statusText}`);
    }

    const result = await response.json();
    return { txHash: result.tx_hash };
  }

  /**
   * List keys by prefix
   * @param prefix Key prefix to search
   */
  async listKeys(prefix: string): Promise<string[]> {
    const response = await fetch(
      `${this.gateway}/api/v1/kv/keys?prefix=${encodeURIComponent(prefix)}`,
      { method: 'GET' }
    );

    if (!response.ok) {
      throw new Error(`0G Storage list failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.keys as string[];
  }

  /**
   * Hash data for storage proof
   * @param data String data to hash
   */
  private async hashData(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const dataBytes = encoder.encode(data);
    const hashBytes = await crypto.subtle.digest('SHA-256', dataBytes);
    const hashArray = Array.from(new Uint8Array(hashBytes));
    return '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
}

/**
 * Log Storage Operations
 * 0G Log Storage for append-only reputation and event logs
 */
export class ZeroGLogStorage {
  private rpcUrl: string;
  private gateway: string;

  constructor(config?: Partial<typeof 0G_STORAGE_CONFIG>) {
    this.rpcUrl = config?.rpcUrl || 0G_STORAGE_CONFIG.rpcUrl;
    this.gateway = config?.gateway || 0G_STORAGE_CONFIG.gateway;
  }

  /**
   * Log entry types
   */
  static LogType = {
    REPUTATION: 'reputation',
    REVIEW: 'review',
    RATING: 'rating',
    COMPLETION: 'completion',
    DISPUTE: 'dispute',
    REGISTRATION: 'registration',
  } as const;

  /**
   * Append a log entry to 0G Storage Log
   * @param agentId Agent's 0G Agent ID
   * @param logType Type of log entry
   * @param data Log data
   * @param signer Wallet client for signing
   */
  async append(
    agentId: string,
    logType: string,
    data: Record<string, unknown>,
    signer: { signMessage: (msg: { message: string }) => Promise<string> }
  ): Promise<{ txHash: string; logIndex: bigint }> {
    const logEntry = {
      agentId,
      type: logType,
      data,
      timestamp: Date.now(),
      merkle_path: '', // To be filled by 0G Log contract
    };

    const message = JSON.stringify({
      action: 'log_append',
      agent_id: agentId,
      log_type: logType,
      data_hash: await this.hashData(JSON.stringify(logEntry)),
      timestamp: Date.now(),
    });

    const signature = await signer.signMessage({ message });

    const response = await fetch(`${this.gateway}/api/v1/log/append`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agentId,
        logType,
        entry: logEntry,
        signature,
      }),
    });

    if (!response.ok) {
      throw new Error(`0G Log append failed: ${response.statusText}`);
    }

    const result = await response.json();
    return {
      txHash: result.tx_hash,
      logIndex: BigInt(result.log_index),
    };
  }

  /**
   * Get log entries for an agent
   * @param agentId Agent's 0G Agent ID
   * @param logType Optional filter by log type
   * @param limit Maximum entries to return
   */
  async getLogs(
    agentId: string,
    logType?: string,
    limit: number = 100
  ): Promise<Array<{
    index: bigint;
    type: string;
    data: Record<string, unknown>;
    timestamp: number;
    txHash: string;
  }>> {
    let url = `${this.gateway}/api/v1/log/${agentId}?limit=${limit}`;
    if (logType) {
      url += `&type=${logType}`;
    }

    const response = await fetch(url, { method: 'GET' });

    if (!response.ok) {
      throw new Error(`0G Log read failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.logs.map((log: { index: string; type: string; data: Record<string, unknown>; timestamp: number; tx_hash: string }) => ({
      index: BigInt(log.index),
      type: log.type,
      data: log.data,
      timestamp: log.timestamp,
      txHash: log.tx_hash,
    }));
  }

  /**
   * Get reputation history for an agent
   * @param agentId Agent's 0G Agent ID
   */
  async getReputationHistory(agentId: string): Promise<Array<{
    change: number;
    reason: string;
    timestamp: number;
  }>> {
    const logs = await this.getLogs(agentId, ZeroGLogStorage.LogType.REPUTATION);
    return logs.map(log => ({
      change: log.data.change as number,
      reason: log.data.reason as string,
      timestamp: log.timestamp,
    }));
  }

  /**
   * Verify log proof for a specific entry
   * @param agentId Agent's 0G Agent ID
   * @param index Log index to verify
   */
  async verifyProof(agentId: string, index: bigint): Promise<boolean> {
    const response = await fetch(
      `${this.gateway}/api/v1/log/verify/${agentId}/${index.toString()}`,
      { method: 'GET' }
    );

    if (!response.ok) {
      return false;
    }

    const result = await response.json();
    return result.valid as boolean;
  }

  /**
   * Hash data for log proof
   */
  private async hashData(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const dataBytes = encoder.encode(data);
    const hashBytes = await crypto.subtle.digest('SHA-256', dataBytes);
    const hashArray = Array.from(new Uint8Array(hashBytes));
    return '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
}

// Export singleton instances
export const zeroGKV = new ZeroGKVStorage();
export const zeroGLog = new ZeroGLogStorage();

// Export configuration
export { 0G_STORAGE_CONFIG };
