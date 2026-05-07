import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Web3Provider } from '@/components/providers/Web3Provider';
import { QueryProvider } from '@/components/providers/QueryProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AgentVault | AI Agent Marketplace on 0G',
  description: 'Discover, register, and transact with AI agents on the decentralized 0G network. Secure escrow, reputation tracking, and seamless service discovery.',
  keywords: ['AI agents', '0G Network', 'decentralized marketplace', 'agent registration', 'smart contracts', 'escrow'],
  authors: [{ name: 'AgentVault Team' }],
  openGraph: {
    title: 'AgentVault | AI Agent Marketplace',
    description: 'The premier marketplace for AI agents on 0G Network',
    type: 'website',
    locale: 'en_US',
    siteName: 'AgentVault',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AgentVault | AI Agent Marketplace',
    description: 'Discover and transact with AI agents on 0G Network',
    creator: '@agentvault',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} bg-gray-950 text-gray-100 antialiased`}>
        <QueryProvider>
          <Web3Provider>
            <div className="min-h-screen flex flex-col">
              {/* Header */}
              <header className="sticky top-0 z-50 border-b border-gray-800 bg-gray-950/80 backdrop-blur-xl">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                  {/* Logo */}
                  <a href="/" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-0g-purple-500 to-0g-cyan-500 flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span className="font-bold text-lg tracking-tight group-hover:text-0g-purple-400 transition-colors">
                      AgentVault
                    </span>
                  </a>

                  {/* Navigation */}
                  <nav className="hidden md:flex items-center gap-6">
                    <a href="/marketplace" className="text-sm text-gray-400 hover:text-white transition-colors">
                      Marketplace
                    </a>
                    <a href="/register" className="text-sm text-gray-400 hover:text-white transition-colors">
                      Register Agent
                    </a>
                    <a href="/dashboard" className="text-sm text-gray-400 hover:text-white transition-colors">
                      Dashboard
                    </a>
                  </nav>

                  {/* Wallet Connect */}
                  <div className="flex items-center gap-3">
                    <Web3ConnectButton />
                  </div>
                </div>
              </header>

              {/* Main Content */}
              <main className="flex-1">
                {children}
              </main>

              {/* Footer */}
              <footer className="border-t border-gray-800 bg-gray-900/50">
                <div className="container mx-auto px-4 py-8">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>Built on</span>
                      <span className="text-0g-cyan-500 font-medium">0G Network</span>
                      <span>for the</span>
                      <span className="text-0g-purple-400 font-medium">APAC Hackathon</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <a href="#" className="hover:text-white transition-colors">Documentation</a>
                      <a href="#" className="hover:text-white transition-colors">GitHub</a>
                      <a href="#" className="hover:text-white transition-colors">Discord</a>
                    </div>
                  </div>
                </div>
              </footer>
            </div>
          </Web3Provider>
        </QueryProvider>
      </body>
    </html>
  );
}

// Simple wallet connect button component
function Web3ConnectButton() {
  return (
    <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-0g-purple-600 to-0g-purple-500 hover:from-0g-purple-500 hover:to-0g-purple-400 text-white text-sm font-medium transition-all duration-200 shadow-lg shadow-0g-purple-500/25">
      Connect Wallet
    </button>
  );
}
