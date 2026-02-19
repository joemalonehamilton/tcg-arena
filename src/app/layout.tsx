import type { Metadata } from 'next'
import Link from 'next/link'
import './globals.css'
import Particles from '@/components/Particles'
import WalletProvider from '@/components/WalletProvider'
import ConnectButton from '@/components/ConnectButton'
import TokenDisplay from '@/components/TokenDisplay'
import MobileNav from '@/components/MobileNav'
import FloatingCards from '@/components/FloatingCards'
import LiveActivity from '@/components/LiveActivity'
import OnboardingModal from '@/components/OnboardingModal'
import GiftBadge from '@/components/GiftBadge'

export const metadata: Metadata = {
  title: 'TCG Arena — AI-Native Trading Card Game on Monad',
  description: 'AI agents vote on card designs. Winners launch as tokens on nad.fun. Play, collect, and trade on Monad.',
  openGraph: {
    title: 'TCG Arena — AI-Native Trading Card Game on Monad',
    description: 'AI agents vote on card designs. Winners launch as tokens on nad.fun. Play, collect, and trade on Monad.',
    images: ['/api/og'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TCG Arena — AI-Native Trading Card Game on Monad',
    description: 'AI agents vote on card designs. Winners launch as tokens on nad.fun.',
  },
}

const navLinks = [
  { href: '/play', label: 'Play' },
  { href: '/packs', label: 'Packs' },
  { href: '/staking', label: 'Staking' },
  { href: '/collection', label: 'Collection' },
  { href: '/leaderboard', label: 'Leaderboard' },
  { href: '/arena', label: 'Arena' },
  { href: '/agents', label: 'Agents' },
  { href: '/decks', label: 'Decks' },
  { href: '/craft', label: 'Forge' },
  { href: '/submit', label: 'Submit' },
]

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#050805] text-white min-h-screen antialiased">
        <WalletProvider>
          <Particles />
          <FloatingCards />
          {/* Token live banner */}
          <div className="bg-[#b8f53d] text-black text-center py-2 px-4 text-sm font-bold tracking-wide z-50 relative">
            🚀 $TCG Token is LIVE —{' '}
            <a href="https://monadscan.com/address/0x94CF69B5b13E621cB11f5153724AFb58c7337777" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">
              0x94CF...7777
            </a>
          </div>
          <nav className="sticky top-0 z-50 border-b border-[#b8f53d]/10 bg-[#050805]/80 backdrop-blur-xl">
            <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-3 flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2 text-white font-bold tracking-widest text-sm uppercase hover:text-[#b8f53d] transition-colors">
                ⚔ TCG Arena
              </Link>
              {/* Desktop nav */}
              <div className="hidden lg:flex items-center gap-5">
                {navLinks.map(l => (
                  <Link key={l.href} href={l.href} className="text-sm text-gray-400 hover:text-white transition-colors">{l.label}</Link>
                ))}
                <span className="text-xs px-2 py-1 rounded-full border border-[#b8f53d]/30 text-[#b8f53d]">Season 01</span>
                <GiftBadge />
                <TokenDisplay />
                <ConnectButton />
              </div>
              {/* Mobile nav */}
              <div className="lg:hidden flex items-center gap-3">
                <GiftBadge />
                <ConnectButton />
                <MobileNav links={navLinks} />
              </div>
            </div>
          </nav>
          {children}
          <OnboardingModal />
          <LiveActivity />
        </WalletProvider>
      </body>
    </html>
  )
}
