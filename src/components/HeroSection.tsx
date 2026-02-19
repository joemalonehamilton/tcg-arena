'use client'

import Link from 'next/link'
import CardShowcase from './CardShowcase'

export default function HeroSection() {
  return (
    <div className="relative border border-arena-border rounded-2xl p-6 md:p-12 flex flex-col lg:flex-row items-center gap-8 bg-arena-card/50 overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none" style={{background: 'radial-gradient(ellipse at 60% 50%, rgba(184,245,61,0.06) 0%, transparent 70%)'}} />
      <div className="absolute inset-0 pointer-events-none" style={{background: 'radial-gradient(ellipse at 20% 80%, rgba(168,85,247,0.04) 0%, transparent 60%)'}} />

      {/* Left */}
      <div className="flex-1 space-y-6 relative z-10 text-center lg:text-left">
        <div>
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-arena-accent font-bold mb-3 bg-arena-accent/10 px-3 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-arena-accent animate-pulse" />
            600M TCG Reward Pool — Live
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase text-white tracking-tight leading-[0.95]">
            Open Packs.<br />
            <span className="text-arena-accent">50% Burns.</span><br />
            <span className="text-gray-400 text-3xl md:text-4xl lg:text-5xl">Holders Get Paid.</span>
          </h1>
          <p className="text-gray-400 mt-4 text-sm md:text-base leading-relaxed max-w-lg mx-auto lg:mx-0">
            Every pack you open <span className="text-white font-semibold">burns half the TCG forever</span>. 
            NFT card holders earn weekly rewards from a 600M token pool. 
            Pack prices <span className="text-arena-accent font-semibold">go up every few days</span> — early buyers win.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start">
          <Link href="/packs" className="w-full sm:w-auto inline-block bg-arena-accent text-black font-bold px-8 py-3.5 rounded-full text-sm uppercase tracking-wider hover:brightness-110 hover:shadow-[0_0_20px_rgba(184,245,61,0.3)] transition-all text-center">
            🎴 Open Packs
          </Link>
          <a href="https://nad.fun/token/0x94CF69B5b13E621cB11f5153724AFb58c7337777" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto inline-block border border-arena-accent text-arena-accent font-bold px-8 py-3.5 rounded-full text-sm uppercase tracking-wider hover:bg-arena-accent hover:text-black transition-all text-center">
            💰 Buy $TCG
          </a>
          <Link href="/collection" className="w-full sm:w-auto inline-block border border-white/20 text-gray-300 font-bold px-8 py-3.5 rounded-full text-sm uppercase tracking-wider hover:border-white/40 hover:text-white transition-all text-center">
            My Cards →
          </Link>
        </div>

        <div className="flex items-center gap-4 justify-center lg:justify-start text-xs text-gray-500">
          <span className="flex items-center gap-1.5">
            <span className="text-red-500">🔥</span>
            50% Burn on Every Pack
          </span>
          <span>·</span>
          <span>Prices Escalate Weekly</span>
          <span>·</span>
          <span>Built on Monad</span>
        </div>
      </div>

      {/* Right */}
      <div className="flex-1 flex flex-col items-center gap-4 relative z-10">
        <CardShowcase />
      </div>
    </div>
  )
}
