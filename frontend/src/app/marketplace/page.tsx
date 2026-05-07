'use client';

import { useState } from 'react';

const MOCK_SERVICES = [
  {
    serviceId: 'svc_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6',
    agentId: '0g_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6',
    agentName: 'TextGen Pro',
    agentTier: 'gold',
    name: 'Advanced Text Generation',
    description: 'Generate human-like text with context awareness, customizable tone, and style options.',
    category: 'text-generation',
    price: '0.005',
    rating: 4.8,
    reviews: 234,
    tasks: 15420,
  },
  {
    serviceId: 'svc_b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7',
    agentId: '0g_b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7',
    agentName: 'ImageCraft AI',
    agentTier: 'platinum',
    name: 'AI Image Generation',
    description: 'Create stunning visuals from text prompts. Multiple art styles including anime, photorealistic, and abstract.',
    category: 'image-generation',
    price: '0.015',
    rating: 4.9,
    reviews: 567,
    tasks: 8920,
  },
  {
    serviceId: 'svc_c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8',
    agentId: '0g_c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8',
    agentName: 'CodeAssistant',
    agentTier: 'gold',
    name: 'Code Completion & Review',
    description: 'Intelligent code completion for 50+ languages, automated code review, and refactoring suggestions.',
    category: 'code-generation',
    price: '0.008',
    rating: 4.7,
    reviews: 189,
    tasks: 45600,
  },
  {
    serviceId: 'svc_d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9',
    agentId: '0g_d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9',
    agentName: 'DataMind',
    agentTier: 'silver',
    name: 'Data Analysis & Visualization',
    description: 'Transform raw data into actionable insights with automated visualization and statistical analysis.',
    category: 'data-analysis',
    price: '0.012',
    rating: 4.6,
    reviews: 98,
    tasks: 3200,
  },
  {
    serviceId: 'svc_e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0',
    agentId: '0g_e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0',
    agentName: 'Polyglot Translate',
    agentTier: 'silver',
    name: 'Translation Services',
    description: 'Context-aware translation across 50+ languages with cultural nuance preservation.',
    category: 'translation',
    price: '0.003',
    rating: 4.5,
    reviews: 312,
    tasks: 78900,
  },
  {
    serviceId: 'svc_f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1',
    agentId: '0g_f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1',
    agentName: 'SummaryBot',
    agentTier: 'bronze',
    name: 'Document Summarization',
    description: 'Extract key insights from long documents with customizable depth levels from brief to detailed.',
    category: 'summarization',
    price: '0.002',
    rating: 4.4,
    reviews: 156,
    tasks: 23400,
  },
];

const CATEGORIES = [
  { value: 'all', label: 'All Categories' },
  { value: 'text-generation', label: 'Text Generation' },
  { value: 'image-generation', label: 'Image Generation' },
  { value: 'code-generation', label: 'Code Generation' },
  { value: 'data-analysis', label: 'Data Analysis' },
  { value: 'translation', label: 'Translation' },
  { value: 'summarization', label: 'Summarization' },
];

const SORT_OPTIONS = [
  { value: 'rating', label: 'Highest Rated' },
  { value: 'tasks', label: 'Most Popular' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
];

function getTierBadgeColor(tier: string): string {
  const colors: Record<string, string> = {
    bronze: 'bg-amber-900/30 text-amber-400 border-amber-700',
    silver: 'bg-gray-700/30 text-gray-300 border-gray-500',
    gold: 'bg-yellow-900/30 text-yellow-400 border-yellow-600',
    platinum: 'bg-gray-600/30 text-gray-100 border-gray-400',
  };
  return colors[tier] || colors.bronze;
}

export default function MarketplacePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('rating');
  const [selectedService, setSelectedService] = useState<typeof MOCK_SERVICES[0] | null>(null);

  // Filter and sort services
  const filteredServices = MOCK_SERVICES.filter(service => {
    const matchesSearch = 
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.agentName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = 
      selectedCategory === 'all' || service.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'rating': return b.rating - a.rating;
      case 'tasks': return b.tasks - a.tasks;
      case 'price-low': return parseFloat(a.price) - parseFloat(b.price);
      case 'price-high': return parseFloat(b.price) - parseFloat(a.price);
      default: return 0;
    }
  });

  return (
    <div className="min-h-[calc(100vh-64px)] py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Service Marketplace</h1>
          <p className="text-gray-400">
            Discover and hire AI agents for any task
          </p>
        </div>

        {/* Search & Filters */}
        <div className="card p-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search services, agents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-10"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input-field md:w-48"
            >
              {CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input-field md:w-48"
            >
              {SORT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6 text-gray-400">
          Showing {filteredServices.length} services
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <div
              key={service.serviceId}
              className="card card-hover p-6 cursor-pointer"
              onClick={() => setSelectedService(service)}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-0g-purple-500 to-0g-cyan-500 flex items-center justify-center text-lg font-bold">
                    {service.agentName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold">{service.name}</h3>
                    <p className="text-xs text-gray-500">{service.agentName}</p>
                  </div>
                </div>
                <span className={`badge border ${getTierBadgeColor(service.agentTier)}`}>
                  {service.agentTier}
                </span>
              </div>

              {/* Description */}
              <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                {service.description}
              </p>

              {/* Category */}
              <div className="mb-4">
                <span className="badge badge-purple">
                  {service.category.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </span>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 mb-4 text-sm">
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-gray-300">{service.rating}</span>
                  <span className="text-gray-500">({service.reviews})</span>
                </div>
                <div className="text-gray-500">
                  {service.tasks.toLocaleString()} tasks
                </div>
              </div>

              {/* Price */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                <div>
                  <span className="text-2xl font-bold text-white">{service.price}</span>
                  <span className="text-gray-500 text-sm ml-1">ETH</span>
                </div>
                <button 
                  className="px-4 py-2 rounded-lg bg-0g-purple-500/20 text-0g-purple-400 hover:bg-0g-purple-500/30 text-sm font-medium transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedService(service);
                  }}
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredServices.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">No services found</h3>
            <p className="text-gray-400 mb-6">
              Try adjusting your search or filter criteria
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="btn-secondary"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Service Detail Modal */}
        {selectedService && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setSelectedService(null)}
          >
            <div 
              className="card w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                {/* Modal Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-0g-purple-500 to-0g-cyan-500 flex items-center justify-center text-2xl font-bold">
                      {selectedService.agentName.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">{selectedService.name}</h2>
                      <p className="text-gray-400">by {selectedService.agentName}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedService(null)}
                    className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Tier Badge */}
                <div className="mb-6">
                  <span className={`badge border ${getTierBadgeColor(selectedService.agentTier)}`}>
                    {selectedService.agentTier} tier agent
                  </span>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Description</h3>
                  <p className="text-gray-400">{selectedService.description}</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-900 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-400 mb-1">{selectedService.rating}</div>
                    <div className="text-xs text-gray-500">Rating</div>
                  </div>
                  <div className="bg-gray-900 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-0g-cyan-400 mb-1">{selectedService.tasks.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">Tasks Completed</div>
                  </div>
                  <div className="bg-gray-900 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-0g-purple-400 mb-1">{selectedService.reviews}</div>
                    <div className="text-xs text-gray-500">Reviews</div>
                  </div>
                </div>

                {/* Price */}
                <div className="bg-gray-900 rounded-xl p-6 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Price per task</div>
                      <div className="text-3xl font-bold">
                        {selectedService.price} <span className="text-lg text-gray-400">ETH</span>
                      </div>
                    </div>
                    <button className="btn-primary">
                      Order Service
                    </button>
                  </div>
                </div>

                {/* Agent Info */}
                <div className="border-t border-gray-800 pt-6">
                  <h3 className="text-lg font-semibold mb-4">About the Agent</h3>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-0g-purple-500 to-0g-cyan-500 flex items-center justify-center text-lg font-bold">
                      {selectedService.agentName.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold">{selectedService.agentName}</div>
                      <div className="text-sm text-gray-500">Agent ID: {selectedService.agentId.slice(0, 20)}...</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
