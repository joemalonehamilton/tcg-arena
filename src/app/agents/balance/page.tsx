'use client'

import PageBackground from '@/components/PageBackground'
import { useState, useEffect } from 'react'
import Link from 'next/link'

const MOCK = {
  overperforming: [
    { card: 'Gremlin MEV', severity: 'warning', reason: 'Sandwich steals too much value for a 2-cost', suggestion: 'Reduce stolen stats to +1/+0' },
    { card: 'Phantom Finalizer', severity: 'watch', reason: 'Flash Finality makes it hard to interact with', suggestion: 'Consider increasing cost to 5' },
  ],
  underperforming: [
    { card: 'Rug Walker', severity: 'warning', reason: '4 mana for 3/3 is below rate even with Exploit', suggestion: 'Buff to 4/3 or reduce cost to 3' },
    { card: 'Dead Cat Bounce', severity: 'watch', reason: 'Bounce too slow in current meta', suggestion: 'Add +1/+0 on bounce trigger' },
  ],
  healthyCards: ['Block Bunny', 'Octoracle', 'Whale', 'BFT Crab'],
  balanceScore: 7,
  summary: 'The card pool is reasonably balanced but MEV-based aggro strategies are slightly overtuned. Low-cost creatures with stat-stealing abilities create snowball scenarios.',
}

const severityColors: Record<string, string> = { watch: '#3b82f6', warning: '#f59e0b', critical: '#ef4444' }

export default function BalancePage() {
  const [data, setData] = useState(MOCK)
  const [loading, setLoading] = useState(true)
  const [isLive, setIsLive] = useState(false)

  useEffect(() => {
    fetch('/api/agents/balance')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.overperforming) { setData(d); setIsLive(true) } })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <main className="min-h-screen relative z-10">
      <PageBackground variant="agents" />
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-10 space-y-8 relative z-10">
        <Link href="/agents" className="text-gray-500 hover:text-white text-sm">← Agents</Link>

        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-yellow-500/15 border-2 border-yellow-500/40 flex items-center justify-center text-3xl">⚖️</div>
          <div>
            <h1 className="text-3xl font-black text-white">Balance Council</h1>
            <p className="text-gray-500 text-sm">
              Card balance analysis
              {isLive && <span className="ml-2 text-green-400 text-xs">● LIVE AI</span>}
              {loading && <span className="ml-2 text-yellow-400 text-xs animate-pulse">Loading...</span>}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-4xl font-black" style={{ color: data.balanceScore >= 7 ? '#4ade80' : data.balanceScore >= 5 ? '#fbbf24' : '#f87171' }}>
              {data.balanceScore}/10
            </div>
            <div className="text-[10px] text-gray-500 uppercase">Balance Score</div>
          </div>
          <p className="text-gray-400 text-sm flex-1">{data.summary}</p>
        </div>

        {/* Overperforming */}
        <div className="space-y-3">
          <h2 className="text-red-400 font-bold text-sm uppercase tracking-wider">⬆️ Overperforming</h2>
          {data.overperforming?.map((c, i) => (
            <div key={i} className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-bold">{c.card}</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ color: severityColors[c.severity], backgroundColor: severityColors[c.severity] + '20' }}>
                  {c.severity}
                </span>
              </div>
              <p className="text-gray-400 text-xs mb-1">{c.reason}</p>
              <p className="text-yellow-400/70 text-xs">💡 {c.suggestion}</p>
            </div>
          ))}
        </div>

        {/* Underperforming */}
        <div className="space-y-3">
          <h2 className="text-blue-400 font-bold text-sm uppercase tracking-wider">⬇️ Underperforming</h2>
          {data.underperforming?.map((c, i) => (
            <div key={i} className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-bold">{c.card}</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ color: severityColors[c.severity], backgroundColor: severityColors[c.severity] + '20' }}>
                  {c.severity}
                </span>
              </div>
              <p className="text-gray-400 text-xs mb-1">{c.reason}</p>
              <p className="text-green-400/70 text-xs">💡 {c.suggestion}</p>
            </div>
          ))}
        </div>

        {/* Healthy */}
        <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-5">
          <h3 className="text-green-400 font-bold text-sm mb-3">✅ Healthy Cards</h3>
          <div className="flex gap-2 flex-wrap">
            {data.healthyCards?.map((c, i) => (
              <span key={i} className="text-sm bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-1 text-green-300">{c}</span>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
