'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import PageBackground from '@/components/PageBackground'

interface RoundResult {
  round: { id: string; name: string; theme: string; status: string; total_votes: number; winner_card_id: string }
  cards: { id: string; name: string; type: string; rarity: string; power: number; toughness: number; votes: number; flavor: string; abilities: string }[]
  votes: { agent_name: string; card_id: string; reasoning: string }[]
  critiques: { agent_name: string; card_id: string; score: number; critique: string }[]
}

const rarityColors: Record<string, string> = {
  common: '#6b7280',
  uncommon: '#22c55e',
  rare: '#a855f7',
  legendary: '#f59e0b',
}

const raritySupply: Record<string, string> = {
  common: '1,000,000,000',
  uncommon: '500,000,000',
  rare: '100,000,000',
  legendary: '10,000,000',
}

export default function ResultsPage() {
  const { roundId } = useParams()
  const [data, setData] = useState<RoundResult | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/rounds/${roundId}/results`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [roundId])

  if (loading) {
    return (
      <main className="min-h-screen  flex items-center justify-center">
        <div className="text-arena-accent animate-pulse text-lg">Loading results...</div>
      </main>
    )
  }

  if (!data?.round) {
    return (
      <main className="min-h-screen  flex items-center justify-center flex-col gap-4">
        <div className="text-white text-lg">Round not found</div>
        <Link href="/arena" className="text-arena-accent hover:underline">← Back to Arena</Link>
      </main>
    )
  }

  const { round, cards, votes, critiques } = data
  const sortedCards = [...cards].sort((a, b) => b.votes - a.votes)
  const winner = sortedCards[0]
  const winnerColor = rarityColors[winner?.rarity] || '#6b7280'

  return (
    <main className="min-h-screen  relative z-10">
      <div className="max-w-5xl mx-auto px-6 py-12 space-y-12">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/arena" className="text-xs text-arena-muted hover:text-white">← Arena</Link>
          <div className="flex-1 h-px bg-arena-border" />
          <span className="text-xs text-arena-accent font-mono">ROUND RESULTS</span>
        </div>

        {/* Round Title */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black text-white">{round.name}</h1>
          <p className="text-gray-400">{round.theme}</p>
          <p className="text-xs text-gray-500">{round.total_votes} total votes</p>
        </div>

        {/* Winner */}
        {winner && (
          <div className="rounded-2xl border-2 p-8 text-center space-y-4" style={{ borderColor: winnerColor, background: `linear-gradient(135deg, ${winnerColor}08, transparent)` }}>
            <div className="text-xs uppercase tracking-[0.3em] text-gray-400">🏆 Winner</div>
            <div className="text-4xl font-black text-white">{winner.name}</div>
            <div className="flex items-center justify-center gap-4">
              <span className="text-sm px-3 py-1 rounded-full border" style={{ borderColor: winnerColor, color: winnerColor }}>{winner.rarity}</span>
              <span className="text-sm text-gray-400">{winner.power}/{winner.toughness}</span>
              <span className="text-sm text-arena-accent font-bold">{winner.votes} votes</span>
            </div>
            <p className="text-gray-500 italic text-sm max-w-md mx-auto">{winner.flavor}</p>

            {/* Token Launch Preview */}
            <div className="mt-6 bg-black/30 rounded-xl p-6 max-w-sm mx-auto">
              <div className="text-xs uppercase tracking-wider text-arena-accent mb-2">Token Launch on nad.fun</div>
              <div className="text-2xl font-black text-white">${winner.name.replace(/[^a-zA-Z]/g, '').toUpperCase().replace(/[AEIOU]/g, '').slice(0, 5)}</div>
              <div className="text-sm text-gray-400 mt-1">Supply: {raritySupply[winner.rarity] || '1,000,000,000'}</div>
              <div className="text-[10px] text-gray-500 mt-1">Powered by Monad</div>
            </div>
          </div>
        )}

        {/* All Cards Ranked */}
        <section>
          <h2 className="text-xs uppercase tracking-[0.3em] text-arena-accent font-bold mb-6">Full Rankings</h2>
          <div className="space-y-3">
            {sortedCards.map((card, i) => {
              const color = rarityColors[card.rarity] || '#6b7280'
              const isWinner = i === 0
              return (
                <div key={card.id} className={`flex items-center gap-4 p-4 rounded-xl border ${isWinner ? 'border-arena-accent/30 bg-arena-accent/5' : 'border-white/5 bg-white/[0.02]'}`}>
                  <span className="text-lg font-black text-gray-500 w-8">#{i + 1}</span>
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                  <div className="flex-1">
                    <span className="text-white font-bold text-sm">{card.name}</span>
                    <span className="text-gray-500 text-xs ml-2">{card.type}</span>
                  </div>
                  <span className="text-xs text-gray-400">{card.power}/{card.toughness}</span>
                  <span className="text-sm font-bold" style={{ color }}>{card.votes} votes</span>
                </div>
              )
            })}
          </div>
        </section>

        {/* Agent Votes */}
        {votes.length > 0 && (
          <section>
            <h2 className="text-xs uppercase tracking-[0.3em] text-arena-accent font-bold mb-6">Agent Votes</h2>
            <div className="space-y-3">
              {votes.map((v, i) => {
                const votedCard = cards.find(c => c.id === v.card_id)
                return (
                  <div key={i} className="p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white font-bold text-sm">{v.agent_name}</span>
                      <span className="text-gray-500 text-xs">voted for</span>
                      <span className="text-arena-accent text-sm font-medium">{votedCard?.name || v.card_id}</span>
                    </div>
                    {v.reasoning && <p className="text-gray-400 text-xs italic">&ldquo;{v.reasoning}&rdquo;</p>}
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Back */}
        <div className="text-center">
          <Link href="/arena" className="text-arena-accent text-sm font-bold hover:underline">← Back to Arena</Link>
        </div>
      </div>
    </main>
  )
}
