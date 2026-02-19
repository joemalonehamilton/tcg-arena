'use client'

import PageBackground from '@/components/PageBackground'
import { useState, useEffect } from 'react'
import Link from 'next/link'

const MOCK_REPORT = {
  week: 'Week 1 — Season 01',
  topArchetypes: [
    { name: 'MEV Aggro', tier: 'S', winrate: '58%', keyCards: ['Gremlin MEV', 'Mempool Lurker', 'Phantom Finalizer'], description: 'Fastest deck. Steals stats and kills before turn 6.' },
    { name: 'Consensus Control', tier: 'A', winrate: '54%', keyCards: ['Blob Validator', 'Octoracle', 'Whale'], description: 'Grinds value with Consensus and Oracle. Wins the long game.' },
    { name: 'Rug Midrange', tier: 'A', winrate: '52%', keyCards: ['Rugpull Dragon', 'The Deployer', 'Shard Wyrm'], description: 'Balanced threats with Rug Pull disruption.' },
    { name: 'Frozen Stall', tier: 'B', winrate: '48%', keyCards: ['Frozen Liquidity', 'Monadium', 'BFT Crab'], description: 'Stalls with Freeze and walls. Can\'t close games.' },
  ],
  risingCards: [
    { name: 'Gremlin MEV', reason: 'Sandwich ability dominates aggro mirrors' },
    { name: 'Whale', reason: 'Pump ability creates unanswerable board states' },
  ],
  fallingCards: [
    { name: 'Dead Cat Bounce', reason: 'Bounce is too slow in current aggro meta' },
    { name: 'Rug Walker', reason: 'Stats too low for its cost in competitive play' },
  ],
  topCards: [
    { name: 'Gremlin MEV', usageRate: '72%', winrate: '59%' },
    { name: 'Phantom Finalizer', usageRate: '65%', winrate: '56%' },
    { name: 'Block Bunny', usageRate: '61%', winrate: '53%' },
  ],
  metaInsight: 'Aggro dominates the early Season 01 meta. MEV-based strategies punish slow starts, but Consensus Control is gaining ground as players learn to tech against early pressure.',
}

const tierColors: Record<string, string> = { S: '#ef4444', A: '#f59e0b', B: '#3b82f6', C: '#6b7280' }

export default function MetaPage() {
  const [report, setReport] = useState(MOCK_REPORT)
  const [loading, setLoading] = useState(true)
  const [isLive, setIsLive] = useState(false)

  useEffect(() => {
    fetch('/api/agents/meta')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data && data.topArchetypes) {
          setReport(data)
          setIsLive(true)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <main className="min-h-screen relative z-10">
      <PageBackground variant="agents" />
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-10 space-y-8 relative z-10">
        <Link href="/agents" className="text-gray-500 hover:text-white text-sm">← Agents</Link>

        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-blue-500/15 border-2 border-blue-500/40 flex items-center justify-center text-3xl">📈</div>
          <div>
            <h1 className="text-3xl font-black text-white">Meta Analyst</h1>
            <p className="text-gray-500 text-sm">
              Weekly metagame report
              {isLive && <span className="ml-2 text-green-400 text-xs">● LIVE AI</span>}
              {loading && <span className="ml-2 text-yellow-400 text-xs animate-pulse">Loading...</span>}
            </p>
          </div>
        </div>

        <div className="text-sm text-gray-400 font-bold">{report.week}</div>

        {/* Top Archetypes */}
        <div className="space-y-3">
          <h2 className="text-white font-bold text-sm uppercase tracking-wider">Top Archetypes</h2>
          {report.topArchetypes?.map((arch, i) => (
            <div key={i} className="bg-white/[0.02] border border-white/10 rounded-xl p-5 hover:border-white/20 transition-all">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black"
                    style={{ backgroundColor: (tierColors[arch.tier] || '#6b7280') + '20', color: tierColors[arch.tier] || '#6b7280', border: `2px solid ${tierColors[arch.tier] || '#6b7280'}40` }}>
                    {arch.tier}
                  </span>
                  <span className="text-white font-bold">{arch.name}</span>
                </div>
                <span className="text-[#b8f53d] font-bold text-sm">{arch.winrate} WR</span>
              </div>
              <p className="text-gray-500 text-xs mb-2">{arch.description}</p>
              <div className="flex gap-2 flex-wrap">
                {arch.keyCards?.map((c, j) => (
                  <span key={j} className="text-[10px] bg-white/5 border border-white/10 rounded px-2 py-0.5 text-gray-400">{c}</span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Rising / Falling */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-5">
            <h3 className="text-green-400 font-bold text-sm mb-3">📈 Rising</h3>
            {report.risingCards?.map((c, i) => (
              <div key={i} className="mb-2">
                <div className="text-white text-sm font-bold">{c.name}</div>
                <div className="text-gray-500 text-xs">{c.reason}</div>
              </div>
            ))}
          </div>
          <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-5">
            <h3 className="text-red-400 font-bold text-sm mb-3">📉 Falling</h3>
            {report.fallingCards?.map((c, i) => (
              <div key={i} className="mb-2">
                <div className="text-white text-sm font-bold">{c.name}</div>
                <div className="text-gray-500 text-xs">{c.reason}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Cards */}
        <div className="bg-white/[0.02] border border-white/10 rounded-xl p-5">
          <h3 className="text-white font-bold text-sm mb-3">🏆 Most Played Cards</h3>
          {report.topCards?.map((c, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
              <div className="flex items-center gap-3">
                <span className="text-gray-600 text-xs w-4">{i + 1}</span>
                <span className="text-white text-sm font-bold">{c.name}</span>
              </div>
              <div className="flex gap-4 text-xs">
                <span className="text-gray-400">{c.usageRate} usage</span>
                <span className="text-[#b8f53d]">{c.winrate} WR</span>
              </div>
            </div>
          ))}
        </div>

        {/* Insight */}
        <div className="bg-white/[0.02] border border-[#b8f53d]/20 rounded-xl p-5">
          <h3 className="text-[#b8f53d] font-bold text-sm mb-2">💡 Meta Insight</h3>
          <p className="text-gray-400 text-sm leading-relaxed">{report.metaInsight}</p>
        </div>
      </div>
    </main>
  )
}
