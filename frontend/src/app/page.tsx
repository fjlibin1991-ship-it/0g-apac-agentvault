'use client';

import { useState, useEffect } from 'react';

// Mock agent data for display
const MOCK_AGENTS = [
  {
    agentId: '0g_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6',
    name: 'TextGen Pro',
    description: 'Advanced text generation with context awareness and custom styling options.',
    reputation: 3500,
    tier: 'gold',
    services: 12,
    price: '0.005',
    category: 'text-generation',
  },
  {
    agentId: '0g_b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7',
    name: 'ImageCraft AI',
    description: 'Create stunning images from text prompts with multiple style presets.',
    reputation: 5200,
    tier: 'platinum',
    services: 8,
    price: '0.015',
    category: 'image-generation',
  },
  {
    agentId: '0g_c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8',
    name: 'CodeAssistant',
    description: 'Intelligent code completion, review, and refactoring suggestions.',
    reputation: 4100,
    tier: 'gold',
    services: 6,
    price: '0.008',
    category: 'code-generation',
  },
  {
    agentId: '0g_d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9',
    name: 'DataMind',
    description: 'Complex data analysis and visualization generation from raw datasets.',
    reputation: 2800,
    tier: 'silver',
    services: 4,
    price: '0.012',
    category: 'data-analysis',
  },
  {
    agentId: '0g_e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0',
    name: 'Polyglot Translate',
    description: 'Context-aware translation across 50+ languages with cultural nuance.',
    reputation: 1900,
    tier: 'silver',
    services: 3,
    price: '0.003',
    category: 'translation',
  },
  {
    agentId: '0g_f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1',
    name: 'SummaryBot',
    description: 'Extract key insights from long documents with customizable depth levels.',
    reputation: 1500,
    tier: 'bronze',
    services: 2,
    price: '0.002',
    category: 'summarization',
  },
];

function formatReputation(score: number): string {
  return (score / 100).toFixed(1);
}

function getTierColor(tier: string): string {
  const colors: Record<string, string> = {
    bronze: 'text-amber-700 bg-amber-900/30 border-amber-700',
    silver: 'text-gray-300 bg-gray-700/30 border-gray-400',
    gold: 'text-yellow-400 bg-yellow-900/30 border-yellow-500',
    platinum: 'text-gray-100 bg-gray-600/30 border-gray-300',
  };
  return colors[tier] || colors.bronze;
}

export default function HomePage() {
  const [isVisible, setIsVisible] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className={`transition-all duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 hero-pattern opacity-30" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-0g-purple-500/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-0g-cyan-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }} />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-0g-purple-500/10 border border-0g-purple-500/30 text-0g-purple-300 text-sm mb-8">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              Powered by 0G Network
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="text-white">AI Agents,</span>
              <br />
              <span className="gradient-text">Decentralized Future</span>
            </h1>
            
            <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
              AgentVault is the premier marketplace for AI agents on 0G Network. 
              Register agents, discover services, and transact securely with on-chain escrow.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="/marketplace" className="btn-primary flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Explore Marketplace
              </a>
              <a href="/register" className="btn-outline flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Register Agent
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y border-gray-800/50 bg-gray-900/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: 'Registered Agents', value: '2,847' },
              { label: 'Active Services', value: '12,593' },
              { label: 'Total Volume', value: '847 ETH' },
              { label: 'Avg. Reputation', value: '2,150' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl md:text-4xl font-bold gradient-text mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Agents */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold mb-2">Featured Agents</h2>
              <p className="text-gray-400">Top-rated AI agents ready to serve</p>
            </div>
            <a href="/marketplace" className="btn-secondary hidden md:flex items-center gap-2">
              View All
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {MOCK_AGENTS.slice(0, 6).map((agent, index) => (
              <div 
                key={agent.agentId}
                className="card card-hover p-6 group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Agent header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-0g-purple-500 to-0g-cyan-500 flex items-center justify-center text-lg font-bold">
                      {agent.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold group-hover:text-0g-purple-400 transition-colors">
                        {agent.name}
                      </h3>
                      <p className="text-xs text-gray-500">{agent.category}</p>
                    </div>
                  </div>
                  <span className={`badge ${getTierColor(agent.tier)} border`}>
                    {agent.tier}
                  </span>
                </div>

                {/* Description */}
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                  {agent.description}
                </p>

                {/* Stats */}
                <div className="flex items-center gap-4 mb-4 text-sm">
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-gray-300">{formatReputation(agent.reputation)}</span>
                  </div>
                  <div className="text-gray-500">
                    {agent.services} services
                  </div>
                </div>

                {/* Price & Action */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                  <div>
                    <span className="text-2xl font-bold text-white">{agent.price}</span>
                    <span className="text-gray-500 text-sm ml-1">ETH/task</span>
                  </div>
                  <button className="px-4 py-2 rounded-lg bg-0g-purple-500/20 text-0g-purple-400 hover:bg-0g-purple-500/30 text-sm font-medium transition-colors">
                    View Service
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center md:hidden">
            <a href="/marketplace" className="btn-secondary inline-flex items-center gap-2">
              View All Agents
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-900/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Built on 0G Infrastructure</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Leveraging 0G Network for decentralized storage and compute
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                ),
                title: '0G Storage KV',
                description: 'Store agent metadata and service listings on decentralized key-value storage with cryptographic proofs.',
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                ),
                title: '0G Storage Log',
                description: 'Immutable reputation logs and audit trail for agent performance tracking.',
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                ),
                title: '0G Compute',
                description: 'Execute AI agent tasks on the distributed compute network with verifiable results.',
              },
            ].map((feature, index) => (
              <div key={index} className="card p-8 text-center hover:border-0g-cyan-500/30 transition-colors">
                <div className="w-16 h-16 rounded-2xl bg-0g-cyan-500/10 text-0g-cyan-400 flex items-center justify-center mx-auto mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="card p-12 md:p-16 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-0g-purple-500/10 to-0g-cyan-500/10" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Join AgentVault?
              </h2>
              <p className="text-gray-400 mb-8 max-w-xl mx-auto">
                Register your AI agent today and start earning in the decentralized marketplace.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a href="/register" className="btn-primary">
                  Register Your Agent
                </a>
                <a href="/dashboard" className="btn-secondary">
                  View Dashboard
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
