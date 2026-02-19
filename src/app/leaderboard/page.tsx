'use client'

import { useState, useEffect } from 'react'
import ArenaHeader from '@/components/arena/ArenaHeader'
import PageBackground from '@/components/PageBackground'

interface LeaderboardEntry {
  rank: number
  wallet: string
  score: number
  cards: number
  legendaries: number
  psa10s: number
  bestCard: string
  bestRarity: string
}

const rarityColors: Record<string, string> = {
  common: '#6b7280',
  uncommon: '#22c55e',
  rare: '#a855f7',
  legendary: '#f59e0b',
  mythic: '#ef4444',
}

export default function LeaderboardPage() {
  const [players, setPlayers] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Try cached data first (instant), fall back to live
    fetch('/api/pulls/cache')
      .then(r => r.json())
      .then(data => {
        const entries = (data.leaderboard || []).map((p: any, i: number) => ({
          ...p,
          rank: i + 1,
        }))
        if (entries.length > 0) {
          setPlayers(entries)
          setLoading(false)
        } else {
          // No cache, fall back to live (slow)
          return fetch('/api/pulls?leaderboard=1')
            .then(r => r.json())
            .then(liveData => {
              const liveEntries = (liveData.leaderboard || []).map((p: any, i: number) => ({
                ...p,
                rank: i + 1,
              }))
              setPlayers(liveEntries)
              setLoading(false)
            })
        }
      })
      .catch(() => setLoading(false))
  }, [])

  const totalCards = players.reduce((s, p) => s + p.cards, 0)
  const totalLegendaries = players.reduce((s, p) => s + p.legendaries, 0)
  const totalPSA10s = players.reduce((s, p) => s + p.psa10s, 0)

  return (
    <main className="min-h-screen relative z-10">
      <PageBackground variant="leaderboard" />
      <ArenaHeader />
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 space-y-8">

        <div className="text-center">
          <h1 className="text-4xl font-black text-white mb-2">🏆 Collection Leaderboard</h1>
          <p className="text-gray-500 text-sm">Ranked by collection rarity score — rarer cards & higher PSA grades = more points</p>
        </div>

        {/* Stats banner */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Collectors', value: players.length, icon: '👥' },
            { label: 'Cards Pulled', value: totalCards, icon: '🃏' },
            { label: 'Legendaries Found', value: totalLegendaries, icon: '✨' },
          ].map(s => (
            <div key={s.label} className="bg-white/[0.02] border border-white/10 rounded-xl p-4 text-center">
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-2xl font-black text-white">{s.value.toLocaleString()}</div>
              <div className="text-[10px] text-gray-500 uppercase tracking-wider">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Leaderboard */}
        {loading ? (
          <div className="text-center py-16 text-gray-500">Loading...</div>
        ) : players.length === 0 ? (
          <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-12 text-center">
            <div className="text-5xl mb-4">🃏</div>
            <h2 className="text-white font-bold text-xl mb-2">No collectors yet</h2>
            <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">
              Open packs to start building your collection and climb the leaderboard.
            </p>
            <a href="/packs" className="inline-block px-6 py-3 bg-[#b8f53d] text-black font-bold rounded-xl hover:bg-[#d4ff6e] transition">
              Open Packs →
            </a>
          </div>
        ) : (
          <div className="space-y-2">
            {players.map((player) => {
              const isTop3 = player.rank <= 3
              const shortWallet = `${player.wallet.slice(0, 6)}...${player.wallet.slice(-4)}`

              return (
                <div
                  key={player.wallet}
                  className={`flex items-center gap-4 p-4 rounded-xl border transition-all hover:border-white/20 ${
                    isTop3 ? 'bg-[#b8f53d]/5 border-[#b8f53d]/20' : 'bg-white/[0.02] border-white/5'
                  }`}
                >
                  {/* Rank */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-lg ${
                    player.rank === 1 ? 'bg-[#f59e0b]/20 text-[#f59e0b]' :
                    player.rank === 2 ? 'bg-gray-400/20 text-gray-300' :
                    player.rank === 3 ? 'bg-orange-700/20 text-orange-500' :
                    'bg-white/5 text-gray-500'
                  }`}>
                    {player.rank === 1 ? '👑' : player.rank === 2 ? '🥈' : player.rank === 3 ? '🥉' : player.rank}
                  </div>

                  {/* Wallet + stats */}
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-bold text-sm truncate">{shortWallet}</div>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                      <span>{player.cards} cards</span>
                      {player.legendaries > 0 && (
                        <span className="text-[#f59e0b]">✨ {player.legendaries} legendary</span>
                      )}
                      {player.psa10s > 0 && (
                        <span className="text-yellow-300">💎 {player.psa10s} PSA 10</span>
                      )}
                    </div>
                  </div>

                  {/* Best card */}
                  {player.bestCard && (
                    <div className="hidden sm:block text-right">
                      <div className="text-xs font-medium" style={{ color: rarityColors[player.bestRarity] || '#6b7280' }}>
                        {player.bestCard}
                      </div>
                      <div className="text-[10px] text-gray-600">Best Pull</div>
                    </div>
                  )}

                  {/* Score */}
                  <div className="text-right">
                    <div className={`text-xl font-black ${
                      player.score >= 1000 ? 'text-[#f59e0b]' :
                      player.score >= 500 ? 'text-[#a855f7]' :
                      player.score >= 100 ? 'text-[#b8f53d]' : 'text-gray-400'
                    }`}>{player.score.toLocaleString()}</div>
                    <div className="text-[10px] text-gray-500">points</div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Scoring system */}
        <div className="bg-white/[0.02] border border-white/10 rounded-xl p-6">
          <h3 className="text-white font-bold text-sm mb-3">Scoring System</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            {[
              { rarity: 'Common', points: '1 pt', color: '#6b7280' },
              { rarity: 'Uncommon', points: '5 pts', color: '#22c55e' },
              { rarity: 'Rare', points: '25 pts', color: '#a855f7' },
              { rarity: 'Legendary', points: '200 pts', color: '#f59e0b' },
            ].map(r => (
              <div key={r.rarity}>
                <span className="font-bold" style={{ color: r.color }}>{r.rarity}</span>
                <div className="text-gray-500">{r.points}</div>
              </div>
            ))}
          </div>
          <div className="mt-3 text-xs text-gray-500">
            <span className="text-yellow-300 font-bold">PSA Grade Multipliers:</span>{' '}
            PSA 10 = 10x · PSA 9 = 3x · PSA 8 = 1.5x
          </div>
          <p className="text-[10px] text-gray-600 mt-2">
            A PSA 10 Legendary is worth 2,000 points. Chase the rares. 🔥
          </p>
        </div>
      </div>
    </main>
  )
}
