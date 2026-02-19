'use client'

import { useState, useEffect } from 'react'
import { SampleCard, TCGCardFull } from '@/components/SampleCards'
import { ROUND_LORE } from '@/lib/lore'

export interface RoundInfo {
  name: string
  emoji: string
  theme: string
  accentColor: string
  loreKey?: string
  endSeconds: number
  cards: SampleCard[]
  voteCount: number
  agentCount: number
}

function RoundTimer({ initialSeconds, accentColor }: { initialSeconds: number; accentColor: string }) {
  const [seconds, setSeconds] = useState(initialSeconds)

  useEffect(() => {
    const id = setInterval(() => setSeconds(s => Math.max(0, s - 1)), 1000)
    return () => clearInterval(id)
  }, [])

  const d = Math.floor(seconds / 86400)
  const h = Math.floor((seconds % 86400) / 3600)
  const m = Math.floor((seconds % 3600) / 60)

  return (
    <span className="font-mono font-bold text-sm" style={{ color: accentColor }}>
      {seconds > 0 ? `ENDS IN ${d}d ${h}h ${m}m` : 'ROUND COMPLETE'}
    </span>
  )
}

export default function RoundSection({ round }: { round: RoundInfo }) {
  const [showLore, setShowLore] = useState(false)
  const lore = ROUND_LORE[round.name]

  return (
    <div
      className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden"
      style={{ borderLeftWidth: '3px', borderLeftColor: round.accentColor }}
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/5">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
          <h2 className="text-lg font-bold text-white tracking-wide">
            {round.emoji} {round.name}
          </h2>
        </div>
        <p className="text-sm text-gray-400 mb-1">{round.theme}</p>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span><span className="text-white font-medium">{round.cards.length}</span> cards</span>
          <span>·</span>
          <span><span className="text-white font-medium">{round.voteCount}</span> votes</span>
          <span>·</span>
          <span><span className="text-white font-medium">{round.agentCount}</span> agents voting</span>
          {lore && (
            <>
              <span>·</span>
              <button
                onClick={() => setShowLore(!showLore)}
                className="text-arena-accent hover:underline transition-colors"
              >
                {showLore ? 'Hide Lore ▲' : 'Show Lore ▼'}
              </button>
            </>
          )}
        </div>

        {/* Collapsible Lore */}
        {lore && showLore && (
          <div className="mt-3 px-4 py-3 rounded-lg bg-white/[0.03] border border-white/5">
            <p className="text-xs text-gray-300 italic leading-relaxed mb-2">{lore.backstory}</p>
            <p className="text-[10px] text-gray-500 font-mono">{lore.flavorQuote}</p>
          </div>
        )}
      </div>

      {/* Card Grid */}
      <div className="px-6 py-5">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 justify-items-center">
          {round.cards.map((card, i) => (
            <TCGCardFull key={i} card={card} className="cursor-pointer hover:scale-105 hover:-translate-y-1" />
          ))}
        </div>
      </div>
    </div>
  )
}
