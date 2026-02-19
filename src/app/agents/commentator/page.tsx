'use client'

import PageBackground from '@/components/PageBackground'
import { useState } from 'react'
import Link from 'next/link'

const SAMPLE_REPLAY = [
  'Player 1 plays Mempool Lurker (2 mana)',
  'Player 2 plays BFT Crab (3 mana)',
  'Player 1 plays Gremlin MEV (2 mana), Sandwich Attack steals 2 power from BFT Crab',
  'Player 2 plays Block Bunny (1 mana), draws a card from Airdrop',
  'Player 1 plays Phantom Finalizer (4 mana), attacks face with Mempool Lurker for 3',
  'Player 2 plays Monadium (5 mana), Consensus gives all creatures +1 power',
  'Player 1 attacks with everything, Phantom Finalizer uses Flash Finality to destroy Monadium',
  'Player 2 plays Whale (6 mana), blocks Gremlin MEV, attacks face for 7. Player 1 at 6 HP',
  'Player 1 plays Rugpull Dragon (5 mana), Rug Pull steals 3 power from Whale',
  'Player 2 swings with Whale + BFT Crab for lethal. GG.',
]

const moodColor: Record<string, string> = {
  neutral: '#6b7280', excited: '#22c55e', impressed: '#3b82f6', hype: '#f59e0b', analysis: '#a855f7', closing: '#ef4444',
}

function getHypeColor(level: number): string {
  if (level >= 9) return '#ef4444'
  if (level >= 7) return '#f59e0b'
  if (level >= 5) return '#22c55e'
  if (level >= 3) return '#3b82f6'
  return '#6b7280'
}

interface CommentaryTurn {
  turn: number
  player: string
  action: string
  commentary: string
  hypeLevel: number
}

interface CommentaryResult {
  turns: CommentaryTurn[]
  mvpCard: string
  mvpReason: string
  gameRating: string
  summary: string
}

export default function CommentatorPage() {
  const [playing, setPlaying] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<CommentaryResult | null>(null)
  const [visibleTurns, setVisibleTurns] = useState(0)
  const [isLive, setIsLive] = useState(false)

  const startCommentary = async () => {
    setPlaying(true)
    setLoading(true)
    setResult(null)
    setVisibleTurns(0)
    setIsLive(false)

    try {
      const res = await fetch('/api/agents/commentator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ replay: SAMPLE_REPLAY }),
      })

      if (res.ok) {
        const data = await res.json()
        setResult(data)
        setIsLive(true)
        setLoading(false)
        // Reveal turns one by one
        let i = 0
        const interval = setInterval(() => {
          i++
          setVisibleTurns(i)
          if (i >= (data.turns?.length || 0)) clearInterval(interval)
        }, 1800)
        return
      }
    } catch {}

    // Fallback to sample data
    setLoading(false)
    setIsLive(false)
    const fallback: CommentaryResult = {
      turns: SAMPLE_REPLAY.map((action, i) => ({
        turn: i + 1,
        player: i % 2 === 0 ? 'Player 1' : 'Player 2',
        action,
        commentary: getFallbackCommentary(i),
        hypeLevel: Math.min(3 + Math.floor(i * 0.8), 10),
      })),
      mvpCard: 'Whale',
      mvpReason: 'Massive 7-damage swing that sealed the game',
      gameRating: '🔥🔥🔥 BANGER',
      summary: 'An aggressive MEV opener met its match against a patient control strategy. Whale drops on turn 8 and its all over — control wins this one.',
    }
    setResult(fallback)
    let i = 0
    const interval = setInterval(() => {
      i++
      setVisibleTurns(i)
      if (i >= fallback.turns.length) clearInterval(interval)
    }, 2000)
  }

  return (
    <main className="min-h-screen relative z-10">
      <PageBackground variant="agents" />
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-10 space-y-8">
        <div className="flex items-center gap-3">
          <Link href="/agents" className="text-gray-500 hover:text-white text-sm">← Agents</Link>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-yellow-500/15 border-2 border-yellow-500/40 flex items-center justify-center text-3xl">🎙️</div>
          <div>
            <h1 className="text-3xl font-black text-white">Match Commentator</h1>
            <p className="text-gray-500 text-sm">AI-powered play-by-play commentary · 3 🪙</p>
          </div>
          {isLive && (
            <span className="text-[10px] text-green-400 bg-green-400/10 border border-green-400/20 px-2 py-0.5 rounded-full font-bold">● LIVE AI</span>
          )}
        </div>

        {!playing ? (
          <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-8 text-center">
            <div className="text-5xl mb-4">🎬</div>
            <h2 className="text-white font-bold text-xl mb-2">Watch AI Commentary</h2>
            <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">
              The Match Commentator watches replays and provides play-by-play analysis, 
              highlighting key decisions, missed plays, and clutch moments.
            </p>
            <button onClick={startCommentary}
              className="px-8 py-3 bg-yellow-500 text-black font-bold rounded-xl hover:bg-yellow-400 transition-all">
              ▶️ Start Commentary
            </button>
          </div>
        ) : loading ? (
          <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-8 text-center">
            <div className="text-4xl mb-4 animate-pulse">🎙️</div>
            <p className="text-gray-400">Commentator is analyzing the replay...</p>
          </div>
        ) : result && (
          <div className="space-y-3">
            <div className="bg-white/[0.02] border border-white/10 rounded-xl p-4 flex items-center justify-between">
              <span className="text-white font-bold text-sm">🎙️ {isLive ? 'Live AI Commentary' : 'Sample Commentary'} — MEV Aggro vs Consensus Control</span>
              <span className="text-[10px] text-gray-500 uppercase tracking-wider animate-pulse">
                {visibleTurns < result.turns.length ? '● LIVE' : '● FINISHED'}
              </span>
            </div>

            {result.turns.slice(0, visibleTurns).map((c, i) => (
              <div key={i} className="bg-white/[0.02] border border-white/10 rounded-xl p-4 animate-[fadeIn_0.5s_ease-out]"
                style={{ borderLeftWidth: 3, borderLeftColor: getHypeColor(c.hypeLevel) }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ 
                    color: getHypeColor(c.hypeLevel), 
                    backgroundColor: getHypeColor(c.hypeLevel) + '15' 
                  }}>
                    Turn {c.turn}
                  </span>
                  <span className="text-[10px] text-gray-600">{c.player}</span>
                  <div className="flex gap-0.5 ml-auto">
                    {Array.from({ length: Math.min(c.hypeLevel, 10) }).map((_, j) => (
                      <span key={j} className="text-[8px]">🔥</span>
                    ))}
                  </div>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">{c.commentary}</p>
              </div>
            ))}

            {visibleTurns >= result.turns.length && (
              <div className="space-y-3 pt-2">
                {/* Game summary card */}
                <div className="bg-[#b8f53d]/5 border border-[#b8f53d]/20 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-white font-bold">Game Rating</span>
                    <span className="text-lg">{result.gameRating}</span>
                  </div>
                  <p className="text-gray-300 text-sm mb-3">{result.summary}</p>
                  <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                    <span className="text-[10px] text-gray-500 uppercase">MVP</span>
                    <span className="text-[#b8f53d] font-bold text-sm">{result.mvpCard}</span>
                    <span className="text-gray-500 text-xs">— {result.mvpReason}</span>
                  </div>
                </div>

                <div className="text-center">
                  <button onClick={() => { setPlaying(false); setResult(null); setVisibleTurns(0) }}
                    className="px-6 py-2 bg-white/5 text-gray-400 rounded-xl hover:bg-white/10 transition text-sm font-bold">
                    Watch Again
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}

function getFallbackCommentary(turn: number): string {
  const comments = [
    'And we\'re off! Mempool Lurker drops turn 2 — classic aggro opener. This thing steals power if left unchecked!',
    'BFT Crab enters the arena! Slippage is going to punish those greedy plays. Smart defensive pick.',
    'OH! Gremlin MEV hits and immediately Sandwich Attacks for 2 power! BFT Crab is looking thin.',
    'Block Bunny — the crypto rabbit! Airdrop draws a card. Value town!',
    'Phantom Finalizer is HERE. Flash Finality is LIVE. 3 damage to face from Lurker — Player 2 at 17.',
    'MONADIUM DROPS! Consensus gives EVERYTHING +1. The board just leveled up!',
    'All-in attack! Flash Finality deletes Monadium! But at what cost?',
    'WHALE. WHALE ON BOARD. 7 damage to face?! Player 1 at 6 HP, this is getting spicy!',
    'Rugpull Dragon tries to steal back momentum — Rug Pull yanks 3 power from Whale but is it enough?',
    'GG! Whale + BFT Crab swing for lethal. Control wins this one! What a BANGER of a game!',
  ]
  return comments[turn] || 'Incredible play!'
}
