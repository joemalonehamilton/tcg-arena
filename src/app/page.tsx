'use client'

import Link from 'next/link'
import HeroSection from '@/components/HeroSection'
import Tutorial, { useTutorial } from '@/components/Tutorial'
import { sampleCards, TCGCardFull } from '@/components/SampleCards'
import Footer from '@/components/Footer'
import PageBackground from '@/components/PageBackground'

const howItWorks = [
  { num: 1, emoji: '🪙', title: 'Buy $TCG', desc: 'Buy TCG tokens on nad.fun DEX. Hold tokens in your wallet for yield boost multipliers up to 3x.' },
  { num: 2, emoji: '🃏', title: 'Open Packs', desc: '50% of every pack purchase is burned forever (price goes up). 50% goes to the reward pool (pays you).' },
  { num: 3, emoji: '💎', title: 'Collect NFTs', desc: 'Every card pull is a unique NFT with PSA grading. Rarer cards + higher grades = more yield from the pool.' },
  { num: 4, emoji: '💰', title: 'Earn Weekly', desc: 'Your NFT collection earns TCG rewards every week. Early stakers earn the highest rates. The pool grows with every pack opened.' },
]

const stats = [
  { value: '50%', label: 'Burned Per Pack' },
  { value: '50%', label: 'To Reward Pool' },
  { value: '10%', label: 'Weekly Pool Rate' },
  { value: '3x', label: 'Max Hold Boost' },
]

const agents = [
  { name: 'ArtCritic', emoji: '🎨', specialty: 'Visual Design', color: '#e74c3c', desc: 'Judges aesthetics, composition, and visual storytelling' },
  { name: 'MetaGamer', emoji: '🎮', specialty: 'Game Balance', color: '#3498db', desc: 'Evaluates card mechanics, combos, and meta impact' },
  { name: 'LoreMaster', emoji: '📚', specialty: 'Narrative', color: '#9b59b6', desc: 'Rates flavor text, lore depth, and worldbuilding' },
  { name: 'DegTrader', emoji: '📈', specialty: 'Meme Value', color: '#f39c12', desc: 'Hunts virality, ticker appeal, and degen hype factor' },
  { name: 'DesignSage', emoji: '🧙', specialty: 'Card Design', color: '#1abc9c', desc: 'Analyzes ability synergies, rarity balance, and design cohesion' },
]

const featuredCardNames = ['Nadzilla', 'Whale', 'Rugpull Dragon', 'Phantom Finalizer']

export default function Home() {
  const allCards = [...sampleCards]
  const featuredCards = allCards.filter(c => featuredCardNames.includes(c.name))
  const { showTutorial, completeTutorial } = useTutorial()

  return (
    <main className="min-h-screen flex flex-col relative z-10">
      <PageBackground variant="arena" />
      {showTutorial && <Tutorial onComplete={completeTutorial} />}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10 flex-1 space-y-12 md:space-y-20 w-full">
        {/* Hero */}
        <HeroSection />

        {/* Quick Actions */}
        <section>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { href: '/play', emoji: '⚔️', title: 'Play', desc: 'Battle AI opponents with your deck', color: '#e74c3c' },
              { href: '/packs', emoji: '🎴', title: 'Open Packs', desc: 'Pull cards — 50% of spend is burned', color: '#b8f53d' },
              { href: '/staking', emoji: '💰', title: 'Staking', desc: 'Earn weekly TCG from the reward pool', color: '#f59e0b' },
              { href: '/collection', emoji: '💎', title: 'My Collection', desc: 'View your NFT cards & rarity scores', color: '#a855f7' },
            ].map((a) => (
              <Link key={a.href} href={a.href} className="bg-arena-card border border-arena-border rounded-xl p-5 md:p-6 hover:border-arena-accent/40 hover:-translate-y-1 transition-all group block">
                <div className="text-3xl md:text-4xl mb-3 group-hover:scale-110 transition-transform inline-block">{a.emoji}</div>
                <h3 className="text-white font-black text-base md:text-lg uppercase tracking-wide mb-1">{a.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{a.desc}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section>
          <div className="flex items-center gap-4 mb-6 md:mb-8">
            <span className="text-xs uppercase tracking-[0.3em] text-arena-accent font-bold whitespace-nowrap">How It Works</span>
            <div className="flex-1 h-px bg-arena-border" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {howItWorks.map((step) => (
              <div key={step.num} className="bg-arena-card border border-arena-border rounded-xl p-5 md:p-6 hover:border-arena-accent/30 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-8 h-8 rounded-full bg-arena-accent/10 border border-arena-accent/30 flex items-center justify-center text-arena-accent font-bold text-sm">
                    {step.num}
                  </span>
                  <span className="text-2xl">{step.emoji}</span>
                </div>
                <h3 className="text-white font-bold text-sm uppercase tracking-wide mb-2">{step.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Stats */}
        <section>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {stats.map((s) => (
              <div key={s.label} className="bg-arena-card border border-arena-border rounded-xl p-4 md:p-6 text-center hover:border-arena-accent/20 transition-colors">
                <div className="text-3xl md:text-4xl font-black text-arena-accent mb-1">{s.value}</div>
                <div className="text-[10px] md:text-xs text-gray-500 uppercase tracking-wider">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Reward Pool CTA */}
        <section className="relative">
          <div className="bg-gradient-to-r from-[#b8f53d]/5 via-[#f59e0b]/5 to-[#b8f53d]/5 border border-[#b8f53d]/20 rounded-2xl p-8 md:p-12 text-center">
            <div className="text-5xl mb-4">🏦</div>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-2">500,000,000 TCG</h2>
            <p className="text-[#b8f53d] font-bold text-lg mb-1">Reward Pool — Funded & Live</p>
            <p className="text-gray-400 text-sm mb-6 max-w-lg mx-auto">
              10% distributed weekly to NFT holders. Open packs, collect cards, earn yield. 
              Early stakers earn the highest rates before they drop.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-6">
              <div className="bg-black/30 rounded-xl px-5 py-3 border border-white/10">
                <div className="text-[#f59e0b] font-black text-2xl">50M</div>
                <div className="text-gray-500 text-[10px] uppercase">Weekly Payout</div>
              </div>
              <div className="bg-black/30 rounded-xl px-5 py-3 border border-white/10">
                <div className="text-[#b8f53d] font-black text-2xl">10%</div>
                <div className="text-gray-500 text-[10px] uppercase">Weekly Rate</div>
              </div>
              <div className="bg-black/30 rounded-xl px-5 py-3 border border-white/10">
                <div className="text-white font-black text-2xl">3x</div>
                <div className="text-gray-500 text-[10px] uppercase">Max Hold Boost</div>
              </div>
            </div>
            <a href="/staking" className="inline-block px-8 py-3 bg-[#b8f53d] text-black font-black rounded-xl hover:bg-[#d4ff6e] transition text-lg">
              Start Earning →
            </a>
          </div>
        </section>

        {/* Featured Cards */}
        <section>
          <div className="flex items-center gap-4 mb-6 md:mb-8">
            <span className="text-xs uppercase tracking-[0.3em] text-arena-accent font-bold whitespace-nowrap">Featured Cards</span>
            <div className="flex-1 h-px bg-arena-border" />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 justify-items-center">
            {featuredCards.map((card) => (
              <div key={card.name} className="transition-all duration-300 hover:-translate-y-2 hover:scale-105 cursor-pointer w-full max-w-[200px]">
                <TCGCardFull card={card} />
              </div>
            ))}
          </div>
          <div className="text-center mt-6 md:mt-8">
            <Link href="/arena" className="text-arena-accent text-sm font-bold hover:underline">
              See all cards in the Arena →
            </Link>
          </div>
        </section>

        {/* AI Agents */}
        <section>
          <div className="flex items-center gap-4 mb-6 md:mb-8">
            <span className="text-xs uppercase tracking-[0.3em] text-arena-accent font-bold whitespace-nowrap">AI Judges</span>
            <div className="flex-1 h-px bg-arena-border" />
            <span className="text-xs text-gray-600">{agents.length} agents voting each round</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
            {agents.map((agent) => (
              <div key={agent.name} className="bg-arena-card border border-arena-border rounded-xl p-4 flex flex-col items-center gap-2 text-center hover:border-arena-accent/20 transition-colors">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl" style={{ backgroundColor: agent.color + '20', border: `2px solid ${agent.color}50` }}>
                  {agent.emoji}
                </div>
                <div>
                  <div className="text-white font-bold text-sm">{agent.name}</div>
                  <div className="text-gray-600 text-[10px] mt-1 leading-relaxed hidden sm:block">{agent.desc}</div>
                </div>
                <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full" style={{ color: agent.color, backgroundColor: agent.color + '15' }}>
                  {agent.specialty}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Token Economics */}
        <section>
          <div className="flex items-center gap-4 mb-6 md:mb-8">
            <span className="text-xs uppercase tracking-[0.3em] text-arena-accent font-bold whitespace-nowrap">Token Economics</span>
            <div className="flex-1 h-px bg-arena-border" />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {[
              { rarity: 'Common', color: '#6b7280', supply: '1B', mult: '1x', desc: 'High supply, meme territory' },
              { rarity: 'Uncommon', color: '#22c55e', supply: '500M', mult: '1.5x', desc: 'Moderate scarcity' },
              { rarity: 'Rare', color: '#a855f7', supply: '100M', mult: '2x', desc: 'Scarce and powerful' },
              { rarity: 'Legendary', color: '#f59e0b', supply: '10M', mult: '3x', desc: 'Ultra-scarce. Pump fuel.' },
            ].map((r) => (
              <div key={r.rarity} className="bg-arena-card border rounded-xl p-4" style={{ borderColor: r.color + '30' }}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: r.color }} />
                  <span className="text-white font-bold text-sm">{r.rarity}</span>
                </div>
                <div className="text-xl md:text-2xl font-black mb-0.5" style={{ color: r.color }}>{r.supply}</div>
                <div className="text-[10px] text-gray-600 uppercase">Token Supply</div>
                <div className="mt-2 text-xs text-gray-500 hidden sm:block">{r.desc}</div>
                <div className="mt-1 text-[10px] text-arena-accent">Vote weight: {r.mult}</div>
              </div>
            ))}
          </div>
        </section>

        {/* On-Chain */}
        <section>
          <div className="flex items-center gap-4 mb-6 md:mb-8">
            <span className="text-xs uppercase tracking-[0.3em] text-arena-accent font-bold whitespace-nowrap">On-Chain</span>
            <div className="flex-1 h-px bg-arena-border" />
            <span className="text-xs text-gray-600">Monad Mainnet</span>
          </div>
          <div className="bg-arena-card border border-arena-border rounded-xl p-5 md:p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-purple-500/20 border border-purple-500/40 flex items-center justify-center">🟣</div>
              <div>
                <div className="text-white font-bold text-sm">SeasonSeal Contract</div>
                <div className="text-gray-500 text-xs">Season card sets sealed on Monad · Winner tokens launched on nad.fun</div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="bg-white/[0.02] rounded-lg p-3">
                <div className="text-gray-500 mb-1">SeasonSeal Contract</div>
                <a href="https://monadscan.com/address/0x5900E83003F6c3Dc13f0fD719EB161ffB4974f80" target="_blank" rel="noopener"
                  className="text-[#b8f53d] font-mono text-[11px] hover:underline break-all">
                  0x5900E83003F6c3Dc13f0fD719EB161ffB4974f80
                </a>
              </div>
              <div className="bg-white/[0.02] rounded-lg p-3">
                <div className="text-gray-500 mb-1">$NADZ Token (nad.fun)</div>
                <a href="https://nad.fun/token/0x7b29cCeb42DE1237aa9E5D0c7b0D68a74a7d7777" target="_blank" rel="noopener"
                  className="text-[#b8f53d] font-mono text-[11px] hover:underline break-all">
                  0x7b29cCeb42DE1237aa9E5D0c7b0D68a74a7d7777
                </a>
              </div>
              <div className="bg-white/[0.02] rounded-lg p-3">
                <div className="text-gray-500 mb-1">Season 01 Seal TX</div>
                <a href="https://monadscan.com/tx/0x9dc76cc95c8897fec947d1f762529b7c006c2797802bcec87399d9e7d24ad51f" target="_blank" rel="noopener"
                  className="text-[#b8f53d] font-mono text-[11px] hover:underline break-all">
                  0x9dc76cc...ad51f
                </a>
              </div>
              <div className="bg-white/[0.02] rounded-lg p-3">
                <div className="text-gray-500 mb-1">Token Launch TX</div>
                <a href="https://monadscan.com/tx/0x25dd924c74bf08bfc78571944446a9e2336dcc66acd90a38cf69867c91e5fb8b" target="_blank" rel="noopener"
                  className="text-[#b8f53d] font-mono text-[11px] hover:underline break-all">
                  0x25dd924...5fb8b
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center py-8 md:py-12">
          <h2 className="text-2xl md:text-3xl font-black text-white mb-3">Ready to play?</h2>
          <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">Open packs, build a collection, battle the AI, and watch agents shape the meta in real time.</p>
          <div className="flex flex-col sm:flex-row items-center gap-3 justify-center">
            <Link href="/play" className="w-full sm:w-auto bg-arena-accent text-black font-bold px-10 py-3.5 rounded-full text-sm uppercase tracking-wider hover:brightness-110 hover:shadow-[0_0_20px_rgba(184,245,61,0.3)] transition-all text-center">
              ⚔️ Start Playing
            </Link>
            <Link href="/packs" className="w-full sm:w-auto border border-arena-accent text-arena-accent font-bold px-10 py-3.5 rounded-full text-sm uppercase tracking-wider hover:bg-arena-accent hover:text-black transition-all text-center">
              🎴 Open Packs
            </Link>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  )
}
