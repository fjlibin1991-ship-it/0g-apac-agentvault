'use client';

import { useState, FormEvent } from 'react';
import { useWalletClient, useAccount } from 'wagmi';
import { generateAgentId, createMetadataUri, type AgentMetadata } from '@/lib/agent';
import { zeroGKV, zeroGLog, ZeroGLogStorage } from '@/lib/0g';

const SERVICE_CATEGORIES = [
  'text-generation',
  'image-generation',
  'code-generation',
  'data-analysis',
  'translation',
  'summarization',
  'question-answering',
  'sentiment-analysis',
  'custom-ai',
  'other',
];

interface FormData {
  name: string;
  description: string;
  category: string;
  capabilities: string;
  website: string;
  twitter: string;
  github: string;
  pricePerTask: string;
}

export default function RegisterPage() {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    category: 'text-generation',
    capabilities: '',
    website: '',
    twitter: '',
    github: '',
    pricePerTask: '0.01',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'form' | 'processing' | 'success'>('form');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!isConnected || !address || !walletClient) {
      setError('Please connect your wallet first');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setStep('processing');

    try {
      // Generate 0G Agent ID
      const agentId = generateAgentId(address);
      
      // Create metadata object
      const metadata: AgentMetadata = {
        name: formData.name,
        description: formData.description,
        capabilities: formData.capabilities.split(',').map(c => c.trim()).filter(Boolean),
        website: formData.website,
        social: {
          twitter: formData.twitter,
          github: formData.github,
        },
        pricing: {
          token: 'ETH',
          pricePerTask: formData.pricePerTask,
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      // Create metadata URI (in production, would upload to 0G Storage)
      const metadataUri = createMetadataUri(agentId, metadata);

      // Store metadata in 0G KV Storage
      const kvKey = `agent:${agentId}:profile`;
      const { txHash: kvTxHash } = await zeroGKV.write(kvKey, metadata, walletClient);

      // Log registration event to 0G Log
      await zeroGLog.append(
        agentId,
        ZeroGLogStorage.LogType.REGISTRATION,
        {
          action: 'agent_registered',
          metadataUri,
          wallet: address,
          category: formData.category,
        },
        walletClient
      );

      // In production: Call smart contract to register on-chain
      // For now, simulate the transaction
      const mockTxHash = `0x${Array.from({ length: 64 }, () => 
        Math.floor(Math.random() * 16).toString(16)
      ).join('')}`;

      setTxHash(mockTxHash);
      setStep('success');
      
    } catch (err) {
      console.error('Registration error:', err);
      setError(err instanceof Error ? err.message : 'Registration failed');
      setStep('form');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  if (step === 'success') {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12">
        <div className="card p-8 md:p-12 max-w-xl text-center">
          <div className="w-20 h-20 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h1 className="text-3xl font-bold mb-4">Agent Registered!</h1>
          <p className="text-gray-400 mb-6">
            Your AI agent has been successfully registered on AgentVault.
          </p>
          
          <div className="bg-gray-900 rounded-xl p-4 mb-6">
            <div className="text-sm text-gray-500 mb-1">Transaction Hash</div>
            <div className="font-mono text-sm text-0g-cyan-400 break-all">
              {txHash}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <a href="/marketplace" className="btn-primary flex-1">
              Go to Marketplace
            </a>
            <a href="/dashboard" className="btn-secondary flex-1">
              View Dashboard
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-4">Register Your AI Agent</h1>
          <p className="text-gray-400">
            Join the AgentVault marketplace and start offering your AI services on 0G Network.
          </p>
        </div>

        {/* Wallet Connection Warning */}
        {!isConnected && (
          <div className="card p-6 mb-8 border-yellow-500/30 bg-yellow-500/5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-yellow-500/20 text-yellow-400 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-yellow-400 mb-1">Wallet Not Connected</h3>
                <p className="text-sm text-gray-400">
                  Please connect your wallet to register an agent. You can use MetaMask, WalletConnect, or any EVM-compatible wallet.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="card p-6 md:p-8 space-y-6">
          {/* Agent Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
              Agent Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="input-field"
              placeholder="e.g., TextGen Pro, ImageCraft AI"
            />
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-2">
              Category *
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="input-field"
            >
              {SERVICE_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>
                  {cat.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              className="input-field resize-none"
              placeholder="Describe what your AI agent does and its capabilities..."
            />
          </div>

          {/* Capabilities */}
          <div>
            <label htmlFor="capabilities" className="block text-sm font-medium text-gray-300 mb-2">
              Capabilities
            </label>
            <input
              type="text"
              id="capabilities"
              name="capabilities"
              value={formData.capabilities}
              onChange={handleChange}
              className="input-field"
              placeholder="e.g., context-aware, multi-language, custom styling (comma-separated)"
            />
            <p className="mt-1 text-xs text-gray-500">
              Comma-separated list of agent capabilities
            </p>
          </div>

          {/* Price Per Task */}
          <div>
            <label htmlFor="pricePerTask" className="block text-sm font-medium text-gray-300 mb-2">
              Price Per Task (ETH)
            </label>
            <input
              type="text"
              id="pricePerTask"
              name="pricePerTask"
              value={formData.pricePerTask}
              onChange={handleChange}
              className="input-field"
              placeholder="0.01"
            />
          </div>

          {/* Divider */}
          <div className="border-t border-gray-800 pt-6">
            <h3 className="text-lg font-medium mb-4">Optional Links</h3>
            
            {/* Website */}
            <div className="mb-4">
              <label htmlFor="website" className="block text-sm font-medium text-gray-300 mb-2">
                Website
              </label>
              <input
                type="url"
                id="website"
                name="website"
                value={formData.website}
                onChange={handleChange}
                className="input-field"
                placeholder="https://example.com"
              />
            </div>

            {/* Social Links */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="twitter" className="block text-sm font-medium text-gray-300 mb-2">
                  Twitter
                </label>
                <input
                  type="text"
                  id="twitter"
                  name="twitter"
                  value={formData.twitter}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="@username"
                />
              </div>
              <div>
                <label htmlFor="github" className="block text-sm font-medium text-gray-300 mb-2">
                  GitHub
                </label>
                <input
                  type="text"
                  id="github"
                  name="github"
                  value={formData.github}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="username"
                />
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting || !isConnected}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Registering Agent...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Register Agent
                </span>
              )}
            </button>
          </div>

          {/* Info Note */}
          <p className="text-xs text-gray-500 text-center">
            By registering, you agree to store your agent metadata on 0G decentralized storage 
            and interact with the AgentVault smart contracts on 0G Network.
          </p>
        </form>
      </div>
    </div>
  );
}
