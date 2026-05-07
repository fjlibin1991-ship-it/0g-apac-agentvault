'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';

type Tab = 'overview' | 'services' | 'orders' | 'escrow';

const MOCK_DASHBOARD = {
  agentId: '0g_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6',
  name: 'My AI Agent',
  reputation: 1850,
  tier: 'silver',
  totalEarnings: '12.543',
  activeOrders: 3,
  completedOrders: 156,
  totalServices: 4,
  registeredAt: '2024-01-15',
};

const MOCK_SERVICES = [
  {
    serviceId: 'svc_1234567890abcdef',
    name: 'Text Generation API',
    status: 'active',
    price: '0.005',
    orders: 45,
    rating: 4.8,
  },
  {
    serviceId: 'svc_2234567890abcdef',
    name: 'Content Writing',
    status: 'active',
    price: '0.008',
    orders: 23,
    rating: 4.6,
  },
  {
    serviceId: 'svc_3234567890abcdef',
    name: 'Translation Service',
    status: 'paused',
    price: '0.003',
    orders: 12,
    rating: 4.9,
  },
];

const MOCK_ORDERS = [
  {
    orderId: 'ord_1234567890abcdef',
    service: 'Text Generation API',
    buyer: '0x1234...5678',
    price: '0.005',
    status: 'in_progress',
    date: '2024-01-20',
  },
  {
    orderId: 'ord_2234567890abcdef',
    service: 'Content Writing',
    buyer: '0xabcd...efgh',
    price: '0.008',
    status: 'completed',
    date: '2024-01-19',
  },
  {
    orderId: 'ord_3234567890abcdef',
    service: 'Text Generation API',
    buyer: '0x9876...5432',
    price: '0.005',
    status: 'pending',
    date: '2024-01-21',
  },
];

const MOCK_ESCROW = [
  {
    orderId: 'ord_1234567890abcdef',
    amount: '0.005',
    state: 'deposited',
    daysInEscrow: 2,
  },
  {
    orderId: 'ord_4234567890abcdef',
    amount: '0.012',
    state: 'disputed',
    daysInEscrow: 5,
  },
];

function formatReputation(score: number): string {
  return (score / 100).toFixed(1);
}

function getTierColor(tier: string): string {
  const colors: Record<string, string> = {
    bronze: 'text-amber-400 border-amber-500 bg-amber-500/10',
    silver: 'text-gray-300 border-gray-400 bg-gray-500/10',
    gold: 'text-yellow-400 border-yellow-500 bg-yellow-500/10',
    platinum: 'text-gray-100 border-gray-300 bg-gray-500/10',
  };
  return colors[tier] || colors.bronze;
}

function getStatusBadge(status: string): { label: string; className: string } {
  const statuses: Record<string, { label: string; className: string }> = {
    active: { label: 'Active', className: 'badge-green' },
    paused: { label: 'Paused', className: 'badge-yellow' },
    pending: { label: 'Pending', className: 'badge-yellow' },
    in_progress: { label: 'In Progress', className: 'badge-cyan' },
    completed: { label: 'Completed', className: 'badge-green' },
    cancelled: { label: 'Cancelled', className: 'bg-gray-500/20 text-gray-400' },
  };
  return statuses[status] || { label: status, className: 'badge-purple' };
}

function getEscrowStateBadge(state: string): { label: string; className: string } {
  const states: Record<string, { label: string; className: string }> = {
    deposited: { label: 'Deposited', className: 'badge-cyan' },
    released: { label: 'Released', className: 'badge-green' },
    disputed: { label: 'Disputed', className: 'badge-yellow' },
    refunded: { label: 'Refunded', className: 'bg-gray-500/20 text-gray-400' },
  };
  return states[state] || { label: state, className: 'badge-purple' };
}

export default function DashboardPage() {
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  // Mock connected state for demo
  const mockIsConnected = true;
  const mockAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f5bD84';

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'services', label: 'Services', count: MOCK_SERVICES.length },
    { key: 'orders', label: 'Orders', count: MOCK_ORDERS.length },
    { key: 'escrow', label: 'Escrow', count: MOCK_ESCROW.length },
  ];

  return (
    <div className="min-h-[calc(100vh-64px)] py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
          <p className="text-gray-400">
            Manage your AI agent, services, and transactions
          </p>
        </div>

        {/* Wallet Warning */}
        {(!mockIsConnected || !mockAddress) && (
          <div className="card p-8 text-center mb-8 border-yellow-500/30 bg-yellow-500/5">
            <div className="w-16 h-16 rounded-full bg-yellow-500/20 text-yellow-400 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">Wallet Not Connected</h2>
            <p className="text-gray-400 mb-4">
              Connect your wallet to view your agent dashboard
            </p>
            <button className="btn-primary">
              Connect Wallet
            </button>
          </div>
        )}

        {/* Connected Dashboard */}
        {mockIsConnected && mockAddress && (
          <>
            {/* Agent Overview Card */}
            <div className="card p-6 mb-8">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-0g-purple-500 to-0g-cyan-500 flex items-center justify-center text-3xl font-bold">
                    A
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="text-2xl font-bold">{MOCK_DASHBOARD.name}</h2>
                      <span className={`badge border ${getTierColor(MOCK_DASHBOARD.tier)}`}>
                        {MOCK_DASHBOARD.tier}
                      </span>
                    </div>
                    <p className="text-gray-500 font-mono text-sm mb-2">
                      {MOCK_DASHBOARD.agentId}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span>Registered: {MOCK_DASHBOARD.registeredAt}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        {formatReputation(MOCK_DASHBOARD.reputation)} reputation
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-0g-cyan-400">{MOCK_DASHBOARD.totalEarnings}</div>
                    <div className="text-sm text-gray-500">ETH Earned</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-0g-purple-400">{MOCK_DASHBOARD.completedOrders}</div>
                    <div className="text-sm text-gray-500">Orders</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white">{MOCK_DASHBOARD.activeOrders}</div>
                    <div className="text-sm text-gray-500">Active</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-800 mb-8">
              <div className="flex gap-8">
                {tabs.map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`pb-4 px-2 font-medium transition-colors relative ${
                      activeTab === tab.key
                        ? 'text-white'
                        : 'text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {tab.label}
                      {tab.count !== undefined && (
                        <span className="px-2 py-0.5 rounded-full bg-gray-800 text-xs">
                          {tab.count}
                        </span>
                      )}
                    </span>
                    {activeTab === tab.key && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-0g-purple-500 to-0g-cyan-500" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Quick Stats */}
                <div className="card p-6">
                  <h3 className="text-lg font-semibold mb-4">Performance Overview</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-500/20 text-green-400 flex items-center justify-center">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <span className="text-gray-300">Completed Orders</span>
                      </div>
                      <span className="text-xl font-bold">{MOCK_DASHBOARD.completedOrders}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-0g-cyan-500/20 text-0g-cyan-400 flex items-center justify-center">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                          </svg>
                        </div>
                        <span className="text-gray-300">Active Orders</span>
                      </div>
                      <span className="text-xl font-bold">{MOCK_DASHBOARD.activeOrders}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-0g-purple-500/20 text-0g-purple-400 flex items-center justify-center">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                        </div>
                        <span className="text-gray-300">Total Services</span>
                      </div>
                      <span className="text-xl font-bold">{MOCK_DASHBOARD.totalServices}</span>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="card p-6">
                  <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                  <div className="space-y-4">
                    {MOCK_ORDERS.slice(0, 3).map(order => {
                      const statusBadge = getStatusBadge(order.status);
                      return (
                        <div key={order.orderId} className="flex items-center justify-between p-4 bg-gray-900/50 rounded-xl">
                          <div>
                            <div className="font-medium">{order.service}</div>
                            <div className="text-sm text-gray-500">{order.date}</div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`badge ${statusBadge.className}`}>
                              {statusBadge.label}
                            </span>
                            <span className="font-semibold">{order.price} ETH</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'services' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold">Your Services</h3>
                  <button className="btn-primary text-sm">
                    + Add Service
                  </button>
                </div>
                {MOCK_SERVICES.map(service => {
                  const statusBadge = getStatusBadge(service.status);
                  return (
                    <div key={service.serviceId} className="card p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-0g-purple-500/20 to-0g-cyan-500/20 flex items-center justify-center">
                            <svg className="w-6 h-6 text-0g-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                          </div>
                          <div>
                            <div className="font-semibold">{service.name}</div>
                            <div className="text-sm text-gray-500 font-mono">{service.serviceId.slice(0, 20)}...</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <div className="flex items-center gap-1 text-sm text-gray-400 mb-1">
                              <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              {service.rating}
                            </div>
                            <div className="text-xs text-gray-500">{service.orders} orders</div>
                          </div>
                          <span className={`badge ${statusBadge.className}`}>
                            {statusBadge.label}
                          </span>
                          <div className="text-right">
                            <div className="text-xl font-bold">{service.price}</div>
                            <div className="text-xs text-gray-500">ETH/task</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-4">Order History</h3>
                {MOCK_ORDERS.map(order => {
                  const statusBadge = getStatusBadge(order.status);
                  return (
                    <div key={order.orderId} className="card p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold mb-1">{order.service}</div>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="font-mono">{order.orderId.slice(0, 20)}...</span>
                            <span>•</span>
                            <span>Buyer: {order.buyer}</span>
                            <span>•</span>
                            <span>{order.date}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={`badge ${statusBadge.className}`}>
                            {statusBadge.label}
                          </span>
                          <span className="text-xl font-bold">{order.price} ETH</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {activeTab === 'escrow' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-4">Escrow Status</h3>
                {MOCK_ESCROW.map(escrow => {
                  const stateBadge = getEscrowStateBadge(escrow.state);
                  return (
                    <div key={escrow.orderId} className="card p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-mono text-sm mb-1">{escrow.orderId}</div>
                          <div className="text-sm text-gray-500">
                            In escrow for {escrow.daysInEscrow} days
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={`badge ${stateBadge.className}`}>
                            {stateBadge.label}
                          </span>
                          <span className="text-xl font-bold">{escrow.amount} ETH</span>
                          {escrow.state === 'disputed' && (
                            <button className="btn-secondary text-sm py-2">
                              Resolve
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {/* Total Escrow Summary */}
                <div className="card p-6 bg-gradient-to-r from-0g-purple-500/10 to-0g-cyan-500/10 border-0g-purple-500/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-lg font-semibold">Total in Escrow</div>
                      <div className="text-sm text-gray-400">Available for release</div>
                    </div>
                    <div className="text-3xl font-bold gradient-text">
                      0.017 ETH
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
