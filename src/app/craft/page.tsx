'use client'

import PageBackground from '@/components/PageBackground'

const FORGE_RECIPES = [
  { input: ['Common', 'Common', 'Common'], output: 'Uncommon', cost: 50, successRate: '80%', color: '#22c55e' },
  { input: ['Uncommon', 'Uncommon', 'Uncommon'], output: 'Rare', cost: 150, successRate: '60%', color: '#a855f7' },
  { input: ['Rare', 'Rare', 'Rare'], output: 'Epic', cost: 400, successRate: '40%', color: '#3b82f6' },
  { input: ['Epic', 'Epic', 'Epic'], output: 'Legendary', cost: 1000, successRate: '15%', color: '#f59e0b' },
]

const FORGE_FEATURES = [
  { emoji: '🔥', title: 'Sacrifice to Ascend', desc: 'Burn 3 cards of the same rarity to forge one of the next tier. The sacrificed cards are gone forever.' },
  { emoji: '🎲', title: 'RNG Decides', desc: 'Each forge has a success rate. Failed forges still burn your cards. High risk, high reward.' },
  { emoji: '⚡', title: 'Preserve Abilities', desc: 'Forged cards inherit one random ability from the sacrificed cards, plus gain new ones from higher rarity.' },
  { emoji: '💎', title: 'Unique Marks', desc: 'Forged cards get a special "Forged" badge visible in your collection and on the leaderboard.' },
]

const rarityColors: Record<string, string> = {
  Common: '#6b7280', Uncommon: '#22c55e', Rare: '#a855f7', Epic: '#3b82f6', Legendary: '#f59e0b',
}

export default function CraftPage() {
  return (
    <main className="min-h-screen relative z-10">
      <PageBackground variant="forge" />
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-10 space-y-10">
        {/* Header */}
        <div className="text-center">
          <div className="text-6xl mb-4">🔥</div>
          <h1 className="text-4xl font-black text-white mb-3">Card Forge</h1>
          <div className="inline-block px-4 py-2 rounded-full border border-[#b8f53d]/30 text-[#b8f53d] text-sm font-bold mb-4">
            Coming in Season 02
          </div>
          <p className="text-gray-400 max-w-lg mx-auto text-sm">
            Sacrifice cards to forge higher rarities. Every forge is a gamble — 
            failed attempts burn your cards forever.
          </p>
        </div>

        {/* How Forging Works */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {FORGE_FEATURES.map(f => (
            <div key={f.title} className="bg-white/[0.02] border border-white/10 rounded-xl p-5">
              <div className="text-2xl mb-2">{f.emoji}</div>
              <h3 className="text-white font-bold text-sm mb-1">{f.title}</h3>
              <p className="text-gray-500 text-xs leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Forge Recipes Table */}
        <div>
          <h2 className="text-xs uppercase tracking-[0.3em] text-[#b8f53d] font-bold mb-4">Forge Recipes</h2>
          <div className="space-y-3">
            {FORGE_RECIPES.map((r, i) => (
              <div key={i} className="bg-white/[0.02] border border-white/10 rounded-xl p-4 flex flex-col sm:flex-row items-center gap-4">
                {/* Input */}
                <div className="flex items-center gap-2">
                  {r.input.map((rarity, j) => (
                    <span key={j} className="text-xs font-bold px-3 py-1.5 rounded-lg border" style={{ 
                      color: rarityColors[rarity], 
                      borderColor: rarityColors[rarity] + '40',
                      backgroundColor: rarityColors[rarity] + '10',
                    }}>
                      {rarity}
                    </span>
                  ))}
                </div>
                
                <span className="text-gray-600 text-lg">→</span>
                
                {/* Output */}
                <span className="text-sm font-black px-4 py-1.5 rounded-lg" style={{ 
                  color: r.color, 
                  backgroundColor: r.color + '15',
                  border: `2px solid ${r.color}40`,
                }}>
                  {r.output}
                </span>
                
                <div className="flex-1" />
                
                {/* Stats */}
                <div className="flex items-center gap-4 text-xs">
                  <span className="text-gray-500">Cost: <span className="text-[#b8f53d] font-bold">{r.cost} 🪙</span></span>
                  <span className="text-gray-500">Success: <span className="text-white font-bold">{r.successRate}</span></span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Visual mockup of forge UI */}
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-8">
          <h2 className="text-xs uppercase tracking-[0.3em] text-[#b8f53d] font-bold mb-6 text-center">Preview</h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-6">
            {/* 3 input slots */}
            {[1, 2, 3].map(n => (
              <div key={n} className="w-28 h-40 rounded-xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center gap-2 bg-white/[0.02]">
                <span className="text-3xl opacity-30">🃏</span>
                <span className="text-[10px] text-gray-600 uppercase tracking-wider">Slot {n}</span>
              </div>
            ))}
            
            {/* Arrow */}
            <div className="text-3xl text-[#b8f53d] font-black">→</div>
            
            {/* Output */}
            <div className="w-28 h-40 rounded-xl border-2 border-[#b8f53d]/30 flex flex-col items-center justify-center gap-2 bg-[#b8f53d]/5 relative">
              <span className="text-3xl">✨</span>
              <span className="text-[10px] text-[#b8f53d] uppercase tracking-wider font-bold">Result</span>
              <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#b8f53d] text-black text-[10px] font-black flex items-center justify-center">?</div>
            </div>
          </div>
          
          {/* Fake forge button */}
          <div className="text-center mt-8">
            <div className="inline-block px-8 py-3 rounded-full bg-white/5 text-gray-600 font-bold text-sm cursor-not-allowed">
              🔥 Forge — Available Season 02
            </div>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex justify-center gap-4">
          <a href="/packs" className="px-6 py-3 bg-[#b8f53d] text-black font-bold rounded-xl hover:bg-[#d4ff6e] transition-all text-sm">
            🎴 Open Packs Now
          </a>
          <a href="/collection" className="px-6 py-3 bg-white/5 border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 transition-all text-sm">
            📦 My Collection
          </a>
        </div>
      </div>
    </main>
  )
}
