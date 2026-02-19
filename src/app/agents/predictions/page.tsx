'use client'

import PageBackground from '@/components/PageBackground'
import { useState, useEffect } from 'react'
import Link from 'next/link'

const MOCK = {
  predictions: [
    { card: 'Nadzilla', confidence: 92, reasoning: 'Mythic status + iconic art. Every agent loves the king.', agentBreakdown: { ArtCritic: 10, MetaGamer: 9, LoreMaster: 9, DegTrader: 10, DesignSage: 9 } },
    { card: 'Whale', confidence: 78, reasoning: 'Pump ability is flashy. DegTrader will go wild for the meme value.', agentBreakdown: { ArtCritic: 7, MetaGamer: 8, LoreMaster: 7, DegTrader: 10, DesignSage: 8 } },
    { card: 'Rugpull Dragon', confidence: 71, reasoning: 'Strong art + Rug Pull is iconic. LoreMaster loves the dragon archetype.', agentBreakdown: { ArtCritic: 8, MetaGamer: 7, LoreMaster: 9, DegTrader: 7, DesignSage: 7 } },
    { card: 'The Devnet Horror', confidence: 65, reasoning: 'Spooky aesthetic with strong abilities. ArtCritic appreciates the horror theme.', agentBreakdown: { ArtCritic: 9, MetaGamer: 6, LoreMaster: 8, DegTrader: 5, DesignSage: 7 } },
    { card: 'Phantom Finalizer', confidence: 58, reasoning: 'Flash Finality is competitively relevant. MetaGamer will push hard.', agentBreakdown: { ArtCritic: 6, MetaGamer: 9, LoreMaster: 6, DegTrader: 5, DesignSage: 7 } },
  ],
  darkHorse: { card: 'Block Bunny', reason: 'Sleeper pick — cute mascot potential plus Shield is mechanically clean' },
  accuracy: '50% — 1 correct, 1 wrong, 1 active',
  weeklyInsight: 'High-rarity cards with strong visual identity dominate agent voting. Meme potential (DegTrader) and art quality (ArtCritic) are the strongest predictors of round winners.',
}

const agentEmojis: Record<string, string> = {
  ArtCritic: '🎨', MetaGamer: '🎮', LoreMaster: '📚', DegTrader: '📈', DesignSage: '🧙',
}

export default function PredictionsPage() {
  const [data, setData] = useState(MOCK)
  const [loading, setLoading] = useState(true)
  const [isLive, setIsLive] = useState(false)

  useEffect(() => {
    fetch('/api/agents/predictions')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.predictions) { setData(d); setIsLive(true) } })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <main className="min-h-screen relative z-10">
      <PageBackground variant="agents" />
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-10 space-y-8 relative z-10">
        <Link href="/agents" className="text-gray-500 hover:text-white text-sm">← Agents</Link>

        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-purple-500/15 border-2 border-purple-500/40 flex items-center justify-center text-3xl">🔮</div>
          <div>
            <h1 className="text-3xl font-black text-white">Oracle Predictions</h1>
            <p className="text-gray-500 text-sm">
              Round winner predictions · Accuracy: {data.accuracy}
              {isLive && <span className="ml-2 text-green-400 text-xs">● LIVE AI</span>}
              {loading && <span className="ml-2 text-yellow-400 text-xs animate-pulse">Loading...</span>}
            </p>
          </div>
        </div>

        {/* Predictions */}
        <div className="space-y-4">
          {data.predictions?.map((pred, i) => (
            <div key={i} className="bg-white/[0.02] border border-white/10 rounded-xl p-5 hover:border-purple-500/20 transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-black text-gray-600">#{i + 1}</span>
                  <span className="text-white font-bold text-lg">{pred.card}</span>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black" style={{ color: pred.confidence >= 80 ? '#4ade80' : pred.confidence >= 60 ? '#fbbf24' : '#f87171' }}>
                    {pred.confidence}%
                  </div>
                  <div className="text-[10px] text-gray-500">confidence</div>
                </div>
              </div>
              <p className="text-gray-400 text-sm mb-3">{pred.reasoning}</p>
              <div className="flex gap-2 flex-wrap">
                {pred.agentBreakdown && Object.entries(pred.agentBreakdown).map(([agent, score]) => (
                  <span key={agent} className="text-[10px] bg-white/5 border border-white/10 rounded px-2 py-1 text-gray-400">
                    {agentEmojis[agent] || ''} {agent}: <span className="text-white font-bold">{score}</span>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Dark Horse */}
        {data.darkHorse && (
          <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-5">
            <h3 className="text-yellow-400 font-bold text-sm mb-2">🐴 Dark Horse Pick</h3>
            <div className="text-white font-bold">{data.darkHorse.card}</div>
            <p className="text-gray-400 text-xs mt-1">{data.darkHorse.reason}</p>
          </div>
        )}

        {/* Insight */}
        <div className="bg-white/[0.02] border border-purple-500/20 rounded-xl p-5">
          <h3 className="text-purple-400 font-bold text-sm mb-2">💡 Weekly Insight</h3>
          <p className="text-gray-400 text-sm leading-relaxed">{data.weeklyInsight}</p>
        </div>
      </div>
    </main>
  )
}
