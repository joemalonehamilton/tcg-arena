'use client'

import PageBackground from '@/components/PageBackground'

const DECK_RULES = [
  { emoji: '📏', title: '15-20 Cards', desc: 'Every deck must have between 15 and 20 cards. Tight lists win games.' },
  { emoji: '✌️', title: 'Max 2 Copies', desc: 'Run up to 2 copies of any card. Mythic cards are limited to 1.' },
  { emoji: '⚡', title: 'Mana Curve', desc: 'Balance low-cost and high-cost cards. The deck builder shows your mana distribution.' },
  { emoji: '🔗', title: 'Synergy Score', desc: 'Cards with matching types and abilities get synergy bonuses in combat.' },
]

const SAMPLE_ARCHETYPES = [
  { 
    name: 'MEV Aggro', color: '#ef4444', emoji: '⚡',
    desc: 'Fast, aggressive deck built around MEV Extract and Sandwich Attack. Overwhelm opponents before they stabilize.',
    cards: ['Gremlin MEV', 'Mempool Lurker', 'Gas Guzzler', 'Block Bunny'],
  },
  { 
    name: 'Consensus Control', color: '#3b82f6', emoji: '🛡️',
    desc: 'Defensive strategy using Consensus and Stake to build an unstoppable board over time.',
    cards: ['Monadium', 'Blob Validator', 'BFT Crab', 'Ser Greencandle'],
  },
  { 
    name: 'Rug Midrange', color: '#a855f7', emoji: '🪤',
    desc: 'Disruption-heavy midrange with Rug Pull and Liquidate to remove threats while building pressure.',
    cards: ['Rugpull Dragon', 'Rug Walker', 'The Deployer', 'Dead Cat Bounce'],
  },
  { 
    name: 'Big Finishers', color: '#f59e0b', emoji: '👑',
    desc: 'Ramp into massive threats. Survive the early game and drop bombs that end it.',
    cards: ['Nadzilla', 'Whale', 'Frozen Liquidity', 'Shard Wyrm'],
  },
]

export default function DecksPage() {
  return (
    <main className="min-h-screen relative z-10">
      <PageBackground variant="decks" />
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-10 space-y-10">
        {/* Header */}
        <div className="text-center">
          <div className="text-6xl mb-4">🃏</div>
          <h1 className="text-4xl font-black text-white mb-3">Deck Builder</h1>
          <div className="inline-block px-4 py-2 rounded-full border border-[#b8f53d]/30 text-[#b8f53d] text-sm font-bold mb-4">
            Coming in Season 02
          </div>
          <p className="text-gray-400 max-w-lg mx-auto text-sm">
            Build custom decks from your collection, craft strategies around synergies, 
            and take them into ranked matches. For now, the game draws from all your cards.
          </p>
        </div>

        {/* Deck Rules */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {DECK_RULES.map(r => (
            <div key={r.title} className="bg-white/[0.02] border border-white/10 rounded-xl p-5">
              <div className="text-2xl mb-2">{r.emoji}</div>
              <h3 className="text-white font-bold text-sm mb-1">{r.title}</h3>
              <p className="text-gray-500 text-xs leading-relaxed">{r.desc}</p>
            </div>
          ))}
        </div>

        {/* Archetypes */}
        <div>
          <h2 className="text-xs uppercase tracking-[0.3em] text-[#b8f53d] font-bold mb-4">Meta Archetypes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SAMPLE_ARCHETYPES.map(arch => (
              <div key={arch.name} className="bg-white/[0.02] border rounded-xl p-5" style={{ borderColor: arch.color + '30' }}>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{arch.emoji}</span>
                  <h3 className="font-black text-white">{arch.name}</h3>
                </div>
                <p className="text-gray-500 text-xs leading-relaxed mb-3">{arch.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {arch.cards.map(c => (
                    <span key={c} className="text-[10px] px-2 py-1 rounded-full bg-white/5 text-gray-400 border border-white/10">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Visual mockup */}
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-8">
          <h2 className="text-xs uppercase tracking-[0.3em] text-[#b8f53d] font-bold mb-6 text-center">Builder Preview</h2>
          <div className="flex flex-col md:flex-row gap-6">
            {/* Collection side */}
            <div className="flex-1">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-3">Your Collection</div>
              <div className="grid grid-cols-4 gap-2">
                {Array.from({ length: 8 }, (_, i) => (
                  <div key={i} className="aspect-[3/4] rounded-lg border border-white/10 bg-white/[0.02] flex items-center justify-center">
                    <span className="text-xl opacity-20">🃏</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Deck side */}
            <div className="w-px bg-white/10 hidden md:block" />
            <div className="flex-1">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-3">Your Deck (0/20)</div>
              <div className="grid grid-cols-4 gap-2">
                {Array.from({ length: 8 }, (_, i) => (
                  <div key={i} className="aspect-[3/4] rounded-lg border-2 border-dashed border-white/10 flex items-center justify-center">
                    <span className="text-lg opacity-10">+</span>
                  </div>
                ))}
              </div>
              {/* Mana curve preview */}
              <div className="mt-4">
                <div className="text-[10px] text-gray-600 uppercase tracking-wider mb-2">Mana Curve</div>
                <div className="flex items-end gap-1 h-12">
                  {[3, 5, 4, 3, 2, 1].map((h, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full rounded-sm bg-[#b8f53d]/20" style={{ height: h * 8 }} />
                      <span className="text-[8px] text-gray-600">{i + 1}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="text-center mt-6">
            <div className="inline-block px-8 py-3 rounded-full bg-white/5 text-gray-600 font-bold text-sm cursor-not-allowed">
              🃏 Deck Builder — Available Season 02
            </div>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex justify-center gap-4">
          <a href="/play" className="px-6 py-3 bg-[#b8f53d] text-black font-bold rounded-xl hover:bg-[#d4ff6e] transition-all text-sm">
            ⚔️ Play Now
          </a>
          <a href="/collection" className="px-6 py-3 bg-white/5 border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 transition-all text-sm">
            📦 My Collection
          </a>
        </div>
      </div>
    </main>
  )
}
