'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAccount } from 'wagmi'
import { TOKEN_COSTS } from '@/lib/token-economy'

const TOKEN_REWARDS = { WIN_PVP: 50, LOSS_PVP: 10, WIN_STREAK_3: 200 }
import { getBalance, spend, earn, initBalance } from '@/lib/token-store'

interface RankedStats {
  elo: number
  games: number
  wins: number
  losses: number
  streak: number
  rank: string
  rankIcon: string
}

function getRank(elo: number): { name: string; icon: string; color: string } {
  if (elo >= 1500) return { name: 'Diamond', icon: '💎', color: '#60a5fa' }
  if (elo >= 1300) return { name: 'Gold', icon: '🥇', color: '#f59e0b' }
  if (elo >= 1100) return { name: 'Silver', icon: '🥈', color: '#9ca3af' }
  return { name: 'Bronze', icon: '🥉', color: '#cd7f32' }
}

export default function RankedPage() {
  const { address } = useAccount()
  const [balance, setBalance] = useState(0)
  const [stats, setStats] = useState<RankedStats | null>(null)
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    initBalance()
    setBalance(getBalance())

    // Fetch ranked stats from local (simulated for now)
    const saved = localStorage.getItem('tcg-ranked-stats')
    if (saved) {
      setStats(JSON.parse(saved))
    } else {
      const initial: RankedStats = {
        elo: 1000, games: 0, wins: 0, losses: 0, streak: 0,
        rank: 'Bronze', rankIcon: '🥉',
      }
      setStats(initial)
      localStorage.setItem('tcg-ranked-stats', JSON.stringify(initial))
    }
  }, [])

  const startRankedSearch = () => {
    if (!spend(TOKEN_COSTS.RANKED_ENTRY)) {
      setError(`Need ${TOKEN_COSTS.RANKED_ENTRY} TCG tokens to enter ranked!`)
      return
    }
    setBalance(getBalance())
    setSearching(true)
    setError('')

    // Simulate matchmaking (would be real queue in production)
    setTimeout(() => {
      // For now, redirect to AI game with ranked flag
      window.location.href = '/play?ranked=true'
    }, 2000)
  }

  if (!stats) return null
  const rank = getRank(stats.elo)
  const winrate = stats.games > 0 ? Math.round((stats.wins / stats.games) * 100) : 0

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col items-center justify-center">
      <Link href="/play" className="absolute top-4 left-4 text-gray-500 text-sm hover:text-white">← Back</Link>

      {/* Rank display */}
      <div className="text-center mb-8">
        <div className="text-7xl mb-3">{rank.icon}</div>
        <div className="text-3xl font-bold mb-1" style={{ color: rank.color }}>{rank.name}</div>
        <div className="text-gray-400">ELO: <span className="text-white font-bold">{stats.elo}</span></div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-4 gap-3 mb-8 w-full max-w-md">
        {[
          { label: 'Games', value: stats.games, icon: '🎮' },
          { label: 'Wins', value: stats.wins, icon: '🏆' },
          { label: 'Winrate', value: `${winrate}%`, icon: '📊' },
          { label: 'Streak', value: stats.streak > 0 ? `+${stats.streak}` : stats.streak, icon: stats.streak > 0 ? '🔥' : '❄️' },
        ].map(s => (
          <div key={s.label} className="bg-white/[0.03] border border-white/10 rounded-xl p-3 text-center">
            <div className="text-lg mb-0.5">{s.icon}</div>
            <div className="text-lg font-bold">{s.value}</div>
            <div className="text-[10px] text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Rank ladder */}
      <div className="flex gap-2 mb-8">
        {[
          { name: 'Bronze', elo: 0, icon: '🥉', color: '#cd7f32' },
          { name: 'Silver', elo: 1100, icon: '🥈', color: '#9ca3af' },
          { name: 'Gold', elo: 1300, icon: '🥇', color: '#f59e0b' },
          { name: 'Diamond', elo: 1500, icon: '💎', color: '#60a5fa' },
        ].map(r => (
          <div key={r.name}
            className={`px-4 py-2 rounded-lg border text-center transition ${stats.elo >= r.elo ? 'border-white/20 bg-white/5' : 'border-white/5 opacity-30'}`}
          >
            <div className="text-xl">{r.icon}</div>
            <div className="text-[10px]" style={{ color: r.color }}>{r.name}</div>
            <div className="text-[9px] text-gray-500">{r.elo}+</div>
          </div>
        ))}
      </div>

      {/* Queue button */}
      <div className="text-center">
        <div className="text-xs text-gray-500 mb-2">Entry fee: {TOKEN_COSTS.RANKED_ENTRY} 🪙 TCG</div>
        <button
          onClick={startRankedSearch}
          disabled={searching}
          className={`px-10 py-4 rounded-xl font-bold text-lg transition ${searching ? 'bg-gray-700 text-gray-400' : 'bg-[#b8f53d] text-black hover:bg-[#d4ff6e] hover:scale-105'}`}
        >
          {searching ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin">⚔️</span> Finding opponent...
            </span>
          ) : (
            '⚔️ Enter Ranked Queue'
          )}
        </button>
        <div className="text-xs text-gray-600 mt-2">Balance: {balance} 🪙</div>
        {error && <div className="text-red-400 text-sm mt-2">{error}</div>}

        {/* Rewards info */}
        <div className="mt-6 bg-white/[0.02] border border-white/5 rounded-xl p-4 max-w-xs text-left">
          <div className="text-xs text-gray-500 uppercase mb-2">Ranked Rewards</div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">Win</span>
              <span className="text-[#b8f53d]">+{TOKEN_REWARDS.WIN_PVP} 🪙 +25 ELO</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Loss</span>
              <span className="text-red-400">+{TOKEN_REWARDS.LOSS_PVP} 🪙 -25 ELO</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">3-Win Streak</span>
              <span className="text-yellow-400">+{TOKEN_REWARDS.WIN_STREAK_3} 🪙 bonus</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
