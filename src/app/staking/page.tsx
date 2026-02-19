'use client'

import { useState, useEffect } from 'react'
import ArenaHeader from '@/components/arena/ArenaHeader'
import PageBackground from '@/components/PageBackground'
import { RARITY_POINTS, gradeMultiplier, SPEND_SPLIT, STAKING_CONFIG, getPriceTier, getDistributionRate, getHoldingBoost, HOLDING_BOOST_TIERS } from '@/lib/token-economy'
import { useTCGBalance } from '@/hooks/useTCGBalance'

interface CardData {
  tokenId: number
  name: string
  rarity: string
  grade: number
  packType: string
}

const rarityColors: Record<string, string> = {
  common: '#6b7280',
  uncommon: '#22c55e',
  rare: '#a855f7',
  legendary: '#f59e0b',
  mythic: '#ef4444',
}

export default function StakingPage() {
  const { balance, isConnected, address } = useTCGBalance()
  const [cards, setCards] = useState<CardData[]>([])
  const [loading, setLoading] = useState(true)
  const [poolBalance, setPoolBalance] = useState(STAKING_CONFIG.INITIAL_POOL_SEED)
  const [totalStakedScore, setTotalStakedScore] = useState(1)
  const [totalStakers, setTotalStakers] = useState(0)
  const [burnedTotal, setBurnedTotal] = useState(0)
  const [referralCode, setReferralCode] = useState('')
  const [copied, setCopied] = useState(false)

  const distRate = getDistributionRate()
  const priceTier = getPriceTier()
  const holdingBoost = getHoldingBoost(balance)
  const weeklyDistribution = poolBalance * distRate.rate

  useEffect(() => {
    if (!address) { setLoading(false); return }
    setReferralCode(`https://tcgarena.fun?ref=${address.slice(0, 10)}`)
    fetch(`/api/pulls?wallet=${address}`)
      .then(r => r.json())
      .then(data => { setCards(data.cards || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [address])

  useEffect(() => {
    Promise.all([
      fetch('/api/rewards/pool').then(r => r.json()).catch(() => null),
      fetch('/api/pulls?leaderboard=1').then(r => r.json()).catch(() => null),
    ]).then(([pool, lb]) => {
      if (pool) { setPoolBalance(pool.poolBalance || 0); setBurnedTotal(pool.burnedTotal || 0) }
      const leaderboard = lb?.leaderboard || []
      setTotalStakedScore(leaderboard.reduce((s: number, p: any) => s + p.score, 0) || 1)
      setTotalStakers(leaderboard.length)
    })
  }, [])

  const userScore = cards.reduce((total, card) => {
    return total + (RARITY_POINTS[card.rarity] || 1) * gradeMultiplier(card.grade)
  }, 0)

  const boostedScore = userScore * holdingBoost.multiplier
  const userShare = boostedScore / (totalStakedScore || 1)
  const estimatedWeekly = weeklyDistribution * userShare
  const estimatedDaily = estimatedWeekly / 7
  const estimatedMonthly = estimatedWeekly * 4

  const copyReferral = () => {
    navigator.clipboard.writeText(referralCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <main className="min-h-screen relative z-10">
      <PageBackground variant="leaderboard" />
      <ArenaHeader />
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 space-y-8">

        {/* Hero */}
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-3">💰 Earn TCG</h1>
          <p className="text-gray-400 text-lg max-w-lg mx-auto mb-4">
            Open packs. Collect NFTs. Earn weekly rewards. Hold TCG for bonus yield.
          </p>
          
          {/* Big APY callout */}
          <div className="inline-flex flex-col items-center bg-gradient-to-r from-[#b8f53d]/10 to-[#f59e0b]/10 border border-[#b8f53d]/30 rounded-2xl px-8 py-4">
            <div className="text-[#b8f53d] font-black text-3xl md:text-4xl">{distRate.label}</div>
            <div className="text-gray-400 text-sm mt-1">Pool distribution rate · {priceTier.label} pricing active</div>
          </div>
        </div>

        {/* How It Works — 3 steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { step: '1', icon: '🪙', title: 'Buy TCG', desc: 'Buy $TCG on nad.fun DEX. Hold it for yield boost.' },
            { step: '2', icon: '🃏', title: 'Open Packs', desc: '50% burned (price up), 50% goes to reward pool.' },
            { step: '3', icon: '💰', title: 'Earn Weekly', desc: 'Your NFT collection earns from the pool every week.' },
          ].map(s => (
            <div key={s.step} className="bg-white/[0.03] border border-white/10 rounded-xl p-5 text-center">
              <div className="text-3xl mb-2">{s.icon}</div>
              <div className="text-white font-bold mb-1">{s.title}</div>
              <div className="text-gray-500 text-xs">{s.desc}</div>
            </div>
          ))}
        </div>

        {/* Pool Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Reward Pool', value: poolBalance >= 1e6 ? `${(poolBalance / 1e6).toFixed(1)}M` : poolBalance.toLocaleString(), icon: '🏦', sub: 'TCG' },
            { label: 'Weekly Payout', value: weeklyDistribution >= 1e6 ? `${(weeklyDistribution / 1e6).toFixed(2)}M` : Math.floor(weeklyDistribution).toLocaleString(), icon: '📊', sub: `TCG (${(distRate.rate * 100).toFixed(0)}% of pool)` },
            { label: 'Total Burned', value: burnedTotal >= 1e6 ? `${(burnedTotal / 1e6).toFixed(1)}M` : burnedTotal.toLocaleString(), icon: '🔥', sub: 'TCG forever' },
            { label: 'Stakers', value: totalStakers.toString(), icon: '👥', sub: 'collectors earning' },
          ].map(s => (
            <div key={s.label} className="bg-white/[0.02] border border-white/10 rounded-xl p-4 text-center">
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-xl font-black text-white">{s.value}</div>
              <div className="text-[10px] text-gray-500 uppercase tracking-wider">{s.label}</div>
              <div className="text-[9px] text-gray-600">{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Your Earnings */}
        {isConnected ? (
          <div className="bg-gradient-to-r from-[#b8f53d]/5 to-[#f59e0b]/5 border border-[#b8f53d]/20 rounded-2xl p-6 md:p-8">
            <h2 className="text-white font-bold text-xl mb-5">Your Earnings</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <div>
                <div className="text-gray-500 text-xs mb-1">NFT Cards</div>
                <div className="text-white font-black text-2xl">{cards.length}</div>
              </div>
              <div>
                <div className="text-gray-500 text-xs mb-1">Rarity Score</div>
                <div className="text-[#b8f53d] font-black text-2xl">{userScore.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-gray-500 text-xs mb-1">TCG Held</div>
                <div className="text-white font-black text-2xl">{balance >= 1e6 ? `${(balance/1e6).toFixed(1)}M` : balance.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-gray-500 text-xs mb-1">Boost</div>
                <div className={`font-black text-2xl ${holdingBoost.multiplier > 1 ? 'text-[#f59e0b]' : 'text-gray-500'}`}>
                  {holdingBoost.emoji} {holdingBoost.label}
                </div>
              </div>
              <div>
                <div className="text-gray-500 text-xs mb-1">Effective Score</div>
                <div className="text-[#b8f53d] font-black text-2xl">{boostedScore.toLocaleString()}</div>
              </div>
            </div>

            {/* Earnings breakdown */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-black/20 rounded-xl p-4 text-center">
                <div className="text-[#f59e0b] font-black text-2xl">{estimatedDaily < 1 ? '<1' : Math.floor(estimatedDaily).toLocaleString()}</div>
                <div className="text-gray-500 text-xs">TCG / day</div>
              </div>
              <div className="bg-black/20 rounded-xl p-4 text-center border border-[#f59e0b]/20">
                <div className="text-[#f59e0b] font-black text-2xl">{estimatedWeekly < 1 ? '<1' : Math.floor(estimatedWeekly).toLocaleString()}</div>
                <div className="text-gray-500 text-xs">TCG / week</div>
              </div>
              <div className="bg-black/20 rounded-xl p-4 text-center">
                <div className="text-[#f59e0b] font-black text-2xl">{estimatedMonthly < 1 ? '<1' : Math.floor(estimatedMonthly).toLocaleString()}</div>
                <div className="text-gray-500 text-xs">TCG / month</div>
              </div>
            </div>

            {/* Pool share bar */}
            <div className="bg-black/20 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-500 text-xs">Your pool share</span>
                <span className="text-white font-bold">{(userShare * 100).toFixed(userShare < 0.01 ? 4 : 2)}%</span>
              </div>
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-[#b8f53d] rounded-full transition-all" style={{ width: `${Math.min(100, userShare * 100)}%` }} />
              </div>
            </div>

            {/* Next tier nudge */}
            {holdingBoost.nextTier && (
              <div className="mt-4 bg-[#f59e0b]/5 border border-[#f59e0b]/20 rounded-xl p-4">
                <p className="text-[#f59e0b] text-sm">
                  ⚡ Hold <strong>{holdingBoost.nextTier.min.toLocaleString()} TCG</strong> to unlock <strong>{holdingBoost.nextTier.multiplier}x yield</strong> — you need {Math.max(0, holdingBoost.nextTier.min - balance).toLocaleString()} more TCG
                </p>
              </div>
            )}

            {cards.length === 0 && !loading && (
              <div className="mt-4 text-center">
                <p className="text-gray-500 text-sm mb-3">No NFTs yet — open packs to start earning</p>
                <a href="/packs" className="inline-block px-6 py-3 bg-[#b8f53d] text-black font-bold rounded-xl hover:bg-[#d4ff6e] transition">
                  Open Packs →
                </a>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-12 text-center">
            <div className="text-5xl mb-4">🔗</div>
            <h2 className="text-white font-bold text-xl mb-2">Connect Wallet to See Earnings</h2>
            <p className="text-gray-500 text-sm">Your NFT collection earns TCG automatically every week</p>
          </div>
        )}

        {/* TCG Holding Boost Tiers */}
        <div className="bg-white/[0.02] border border-white/10 rounded-xl p-6">
          <h3 className="text-white font-bold text-sm mb-4">🚀 TCG Holding Boost</h3>
          <p className="text-gray-500 text-xs mb-4">Hold TCG in your wallet to multiply your NFT yield. The more you hold, the more you earn.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {HOLDING_BOOST_TIERS.filter(t => t.min > 0).map(tier => (
              <div key={tier.min} className={`rounded-xl p-4 text-center border ${
                balance >= tier.min ? 'bg-[#b8f53d]/10 border-[#b8f53d]/30' : 'bg-white/[0.02] border-white/5'
              }`}>
                <div className="text-2xl mb-1">{tier.emoji}</div>
                <div className={`font-black text-lg ${balance >= tier.min ? 'text-[#b8f53d]' : 'text-gray-500'}`}>{tier.label}</div>
                <div className="text-gray-500 text-xs mt-1">Hold {(tier.min/1000).toFixed(0)}K+ TCG</div>
                {balance >= tier.min && <div className="text-[#b8f53d] text-[10px] mt-1 font-bold">✓ Active</div>}
              </div>
            ))}
          </div>
        </div>

        {/* Referral System */}
        {isConnected && (
          <div className="bg-white/[0.02] border border-white/10 rounded-xl p-6">
            <h3 className="text-white font-bold text-sm mb-2">🔗 Referral Program</h3>
            <p className="text-gray-500 text-xs mb-4">Share your link — earn 5% of every pack your referrals open, added to your yield.</p>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={referralCode}
                className="flex-1 bg-black/30 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm font-mono"
              />
              <button
                onClick={copyReferral}
                className="px-4 py-2.5 bg-[#b8f53d] text-black font-bold rounded-lg hover:bg-[#d4ff6e] transition text-sm"
              >
                {copied ? '✓ Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        )}

        {/* Your Cards */}
        {cards.length > 0 && (
          <div>
            <h3 className="text-white font-bold text-sm mb-3">Your Earning Cards ({cards.length})</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {cards.sort((a, b) => {
                const scoreA = (RARITY_POINTS[a.rarity] || 1) * gradeMultiplier(a.grade)
                const scoreB = (RARITY_POINTS[b.rarity] || 1) * gradeMultiplier(b.grade)
                return scoreB - scoreA
              }).map(card => {
                const score = (RARITY_POINTS[card.rarity] || 1) * gradeMultiplier(card.grade)
                return (
                  <div key={card.tokenId} className="bg-white/[0.02] border border-white/5 rounded-xl p-3 hover:border-white/20 transition">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold" style={{ color: rarityColors[card.rarity] }}>{card.rarity}</span>
                      <span className={`text-[10px] font-bold ${card.grade >= 9 ? 'text-yellow-400' : card.grade === 8 ? 'text-green-400' : 'text-gray-600'}`}>
                        PSA {card.grade}
                      </span>
                    </div>
                    <div className="text-white text-sm font-bold truncate">{card.name}</div>
                    <div className="text-[#b8f53d] text-xs font-bold mt-1">{score} pts</div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Scoring System */}
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
            <span className="text-yellow-300 font-bold">PSA Multipliers:</span>{' '}
            PSA 10 = 10x · PSA 9 = 3x · PSA 8 = 1.5x
          </div>
          <p className="text-gray-600 text-[10px] mt-2">
            Example: A PSA 10 Legendary = 200 × 10 = 2,000 points. With 3x holding boost = 6,000 effective points.
          </p>
        </div>
      </div>
    </main>
  )
}
