'use client';

import { ReactNode } from 'react';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// 0G Network configuration
const 0gChain = {
  id: 0,
  name: '0G Network',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.0g.ai'] },
    public: { http: ['https://rpc.0g.ai'] },
  },
  blockExplorers: {
    default: { name: '0G Explorer', url: 'https://explorer.0g.ai' },
  },
};

const wagmiConfig = createConfig({
  chains: [mainnet, sepolia, 0gChain as any],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [0gChain.id]: http('https://rpc.0g.ai'),
  },
  connectors: [],
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
    },
  },
});

export function Web3Provider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
