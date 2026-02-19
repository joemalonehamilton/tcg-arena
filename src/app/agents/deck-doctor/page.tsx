'use client'

import PageBackground from '@/components/PageBackground'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getBalance, spend, initBalance } from '@/lib/token-store'

const SAMPLE_DECKS: Record<string, { name: string; cards: string[] }> = {
  'mev-aggro': {
    name: 'MEV Aggro Rush',
    cards: ['Gremlin MEV', 'Gremlin MEV', 'Mempool Lurker', 'Mempool Lurker', 'Gas Guzzler', 'Gas Guzzler', 'Block Bunny', 'Block Bunny', 'BFT Crab', 'Phantom Finalizer', 'Phantom Finalizer', 'The Deployer', 'Dead Cat Bounce', 'Blob Validator', 'Rugpull Dragon'],
  },
  'consensus-control': {
    name: 'Consensus Control',
    cards: ['Octoracle', 'Octoracle', 'Blob Validator', 'Blob Validator', 'Monadium', 'Shard Wyrm', 'Shard Wyrm', 'Frozen Liquidity', 'Frozen Liquidity', 'BFT Crab', 'BFT Crab', 'The Devnet Horror', 'Whale', 'Block Bunny', 'Block Bunny'],
  },
}

interface Analysis {
  overallScore: number
  archetype: string
  strengths: string[]
  weaknesses: string[]
  manaCurve: { low: number; mid: number; high: number }
  swaps: Array<{ out: string; in: string; reason: string }>
  analysis: string
}

export default function DeckDoctorPage() {
  const [selectedDeck, setSelectedDeck] = useState<string | null>(null)
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [balance, setBalance] = useState(500)

  useEffect(() => { initBalance(); setBalance(getBalance()) }, [])

  const analyze = async (deckId: string) => {
    const deck = SAMPLE_DECKS[deckId]
    if (!deck) return

    if (!spend(5)) { setError('Not enough TCG tokens!'); return }
    setBalance(getBalance())
    setSelectedDeck(deckId)
    setLoading(true)
    setError(null)
    setAnalysis(null)

    try {
      const res = await fetch('/api/agents/deck-doctor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cards: deck.cards }),
      })
      if (!res.ok) throw new Error('Analysis failed')
      const data = await res.json()
      setAnalysis(data)
    } catch (err) {
      setError('AI analysis failed — showing mock data')
      setAnalysis({
        overallScore: 7.2,
        archetype: 'Aggro',
        strengths: ['Excellent early curve', 'Strong MEV synergy combos', 'Flash Finality as a closer'],
        weaknesses: ['No defensive options', 'No card draw — runs out of gas', 'Weak to wide boards'],
        manaCurve: { low: 8, mid: 4, high: 3 },
        swaps: [{ out: 'BFT Crab', in: 'Shard Wyrm', reason: 'Better mid-game threat' }],
        analysis: 'A focused aggro deck with strong early pressure but limited late-game options.',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen relative z-10">
      <PageBackground variant="agents" />
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-10 space-y-8 relative z-10">
        <div className="flex items-center gap-3">
          <Link href="/agents" className="text-gray-500 hover:text-white text-sm">← Agents</Link>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-green-500/15 border-2 border-green-500/40 flex items-center justify-center text-3xl">🧠</div>
          <div>
            <h1 className="text-3xl font-black text-white">Deck Doctor</h1>
            <p className="text-gray-500 text-sm">AI-powered deck analysis · 5 🪙 per analysis · Balance: {balance} 🪙</p>
          </div>
        </div>

        {!analysis && !loading ? (
          <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-8">
            <h2 className="text-white font-bold mb-4">Select a deck to analyze</h2>
            <div className="grid gap-3 mb-6">
              {Object.entries(SAMPLE_DECKS).map(([id, deck]) => (
                <button key={id} onClick={() => analyze(id)}
                  className="p-4 bg-white/[0.03] border border-white/10 rounded-xl text-left hover:border-green-500/30 transition-all">
                  <div className="text-white font-bold">{deck.name}</div>
                  <div className="text-gray-500 text-xs mt-1">{deck.cards.length} cards</div>
                  <div className="text-gray-600 text-xs mt-1 truncate">{deck.cards.join(', ')}</div>
                </button>
              ))}
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
          </div>
        ) : loading ? (
          <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-12 text-center">
            <div className="text-4xl mb-4 animate-pulse">🧠</div>
            <div className="text-white font-bold mb-2">Analyzing your deck...</div>
            <div className="text-gray-500 text-sm">The Deck Doctor is evaluating mana curve, synergies, and weaknesses</div>
          </div>
        ) : analysis ? (
          <div className="space-y-6">
            <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-white font-black text-xl">{SAMPLE_DECKS[selectedDeck!]?.name}</div>
                  <div className="text-gray-500 text-xs">{analysis.archetype}</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-black" style={{ color: analysis.overallScore >= 7 ? '#4ade80' : analysis.overallScore >= 5 ? '#fbbf24' : '#f87171' }}>
                    {analysis.overallScore}
                  </div>
                  <div className="text-[10px] text-gray-500 uppercase">Score</div>
                </div>
              </div>
              <p className="text-gray-400 text-sm">{analysis.analysis}</p>

              <div className="flex items-end gap-2 h-16 mt-4">
                {Object.entries(analysis.manaCurve).map(([label, count]) => (
                  <div key={label} className="flex-1 flex flex-col items-center gap-1">
                    <div className="text-[10px] text-gray-500">{count}</div>
                    <div className="w-full rounded-sm bg-[#b8f53d]/30" style={{ height: Math.max(4, (count as number) * 6) }} />
                    <div className="text-[10px] text-gray-600">{label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-5">
              <h3 className="text-green-400 font-bold text-sm mb-3">✅ Strengths</h3>
              <div className="space-y-2">
                {analysis.strengths.map((s, i) => (
                  <div key={i} className="text-gray-300 text-sm flex gap-2"><span>•</span><span>{s}</span></div>
                ))}
              </div>
            </div>

            <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-5">
              <h3 className="text-red-400 font-bold text-sm mb-3">⚠️ Weaknesses</h3>
              <div className="space-y-2">
                {analysis.weaknesses.map((w, i) => (
                  <div key={i} className="text-gray-300 text-sm flex gap-2"><span>•</span><span>{w}</span></div>
                ))}
              </div>
            </div>

            <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-5">
              <h3 className="text-blue-400 font-bold text-sm mb-3">💡 Suggested Swaps</h3>
              <div className="space-y-3">
                {analysis.swaps.map((s, i) => (
                  <div key={i} className="bg-white/[0.02] rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-red-400 text-xs font-bold line-through">{s.out}</span>
                      <span className="text-gray-600">→</span>
                      <span className="text-green-400 text-xs font-bold">{s.in}</span>
                    </div>
                    <p className="text-gray-500 text-xs">{s.reason}</p>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={() => { setAnalysis(null); setSelectedDeck(null) }}
              className="w-full py-3 bg-white/5 text-gray-400 font-bold rounded-xl hover:bg-white/10 transition-all text-sm">
              Analyze Another Deck
            </button>
          </div>
        ) : null}
      </div>
    </main>
  )
}
