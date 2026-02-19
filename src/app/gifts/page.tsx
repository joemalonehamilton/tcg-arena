'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import Link from 'next/link'
import PageBackground from '@/components/PageBackground'
import { sampleCards, monadMonsterCards, TCGCardFull, type SampleCard } from '@/components/SampleCards'
import { SFX } from '@/lib/sound-effects'

const allSampleCards = [...sampleCards, ...monadMonsterCards]

interface GiftCard {
  name: string
  rarity: string
  grade: number
  tokenId: number | null
}

interface Gift {
  id: string
  sender: string
  recipient: string
  pack_type: string
  cards: GiftCard[]
  created_at: string
}

type Phase = 'inbox' | 'shaking' | 'opening' | 'reveal' | 'done'

const packIcons: Record<string, string> = {
  standard: '🃏',
  premium: '💎',
  monad: '🟣',
}

const packNames: Record<string, string> = {
  standard: 'Standard Pack',
  premium: 'Premium Pack',
  monad: 'Monad Pack',
}

export default function GiftsPage() {
  const { address, isConnected } = useAccount()
  const [gifts, setGifts] = useState<Gift[]>([])
  const [loading, setLoading] = useState(false)
  const [phase, setPhase] = useState<Phase>('inbox')
  const [activeGift, setActiveGift] = useState<Gift | null>(null)
  const [revealedCount, setRevealedCount] = useState(0)
  const [legendaryFlash, setLegendaryFlash] = useState(false)

  useEffect(() => {
    if (!isConnected || !address) return
    setLoading(true)
    fetch(`/api/gifts?wallet=${address}`)
      .then(r => r.json())
      .then(data => { setGifts(data.gifts || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [isConnected, address])

  const handleClaim = (gift: Gift) => {
    setActiveGift(gift)
    setRevealedCount(0)
    setPhase('shaking')

    const shakeInterval = setInterval(() => SFX.packShake(), 200)

    setTimeout(() => {
      clearInterval(shakeInterval)
      SFX.packOpen()
      setPhase('opening')

      setTimeout(() => {
        setPhase('reveal')

        gift.cards.forEach((card, i) => {
          setTimeout(() => {
            setRevealedCount(prev => prev + 1)
            if (card.grade === 10 || card.rarity === 'legendary') {
              SFX.legendaryReveal()
              setLegendaryFlash(true)
              setTimeout(() => setLegendaryFlash(false), 600)
            } else if (card.rarity === 'rare' || card.grade === 9) {
              SFX.rareReveal()
            } else {
              SFX.draw()
            }
          }, (i + 1) * 600)
        })

        setTimeout(() => {
          setPhase('done')
          // Mark as claimed
          fetch('/api/gifts/claim', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ giftId: gift.id, wallet: address }),
          }).catch(() => {})
          // Remove from list
          setGifts(prev => prev.filter(g => g.id !== gift.id))
        }, (gift.cards.length + 1) * 600)
      }, 800)
    }, 1400)
  }

  const handleBack = () => {
    setPhase('inbox')
    setActiveGift(null)
    setRevealedCount(0)
  }

  const rarityColors: Record<string, string> = {
    common: '#6b7280', uncommon: '#22c55e', rare: '#a855f7', legendary: '#f59e0b', mythic: '#ef4444',
  }

  return (
    <div className="min-h-screen text-white relative">
      <PageBackground variant="packs" />

      <style jsx>{`
        @keyframes packShake {
          0%, 100% { transform: rotate(0deg) scale(1); }
          10% { transform: rotate(-3deg) scale(1.02); }
          20% { transform: rotate(3deg) scale(1.04); }
          30% { transform: rotate(-4deg) scale(1.06); }
          40% { transform: rotate(4deg) scale(1.08); }
          50% { transform: rotate(-5deg) scale(1.1); }
          60% { transform: rotate(5deg) scale(1.08); }
          70% { transform: rotate(-3deg) scale(1.06); }
          80% { transform: rotate(3deg) scale(1.04); }
          90% { transform: rotate(-1deg) scale(1.02); }
        }
        @keyframes packTear {
          0% { clip-path: inset(0); opacity: 1; transform: scale(1); }
          50% { clip-path: inset(0 0 50% 0); opacity: 0.7; transform: scale(1.1); }
          100% { clip-path: inset(50% 50% 50% 50%); opacity: 0; transform: scale(1.3); }
        }
        @keyframes cardFlip {
          0% { transform: perspective(800px) rotateY(180deg) scale(0.5); opacity: 0; }
          50% { transform: perspective(800px) rotateY(90deg) scale(0.8); opacity: 0.5; }
          100% { transform: perspective(800px) rotateY(0deg) scale(1); opacity: 1; }
        }
        @keyframes cardSlideIn {
          0% { transform: translateY(100px) scale(0.3); opacity: 0; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes fadeInUp {
          0% { transform: translateY(20px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes screenFlash {
          0% { opacity: 0.6; }
          100% { opacity: 0; }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
      `}</style>

      {legendaryFlash && (
        <div className="fixed inset-0 z-50 pointer-events-none bg-yellow-400/30" style={{ animation: 'screenFlash 0.6s ease-out forwards' }} />
      )}

      <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-16 relative z-10">

        {/* Inbox */}
        {phase === 'inbox' && (
          <div style={{ animation: 'fadeInUp 0.4s ease-out' }}>
            <div className="flex items-center gap-3 mb-8">
              <Link href="/packs" className="text-gray-500 text-sm hover:text-white transition">← Packs</Link>
            </div>
            <h1 className="text-4xl font-black mb-2">
              <span className="text-white">Gift </span>
              <span className="text-pink-400">Inbox</span>
              <span className="text-3xl ml-3">🎁</span>
            </h1>
            <p className="text-gray-400 mb-8">Packs gifted to you. Open them to reveal your cards!</p>

            {!isConnected ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🔗</div>
                <p className="text-gray-500">Connect your wallet to see gifts</p>
              </div>
            ) : loading ? (
              <div className="text-center py-20">
                <div className="w-8 h-8 border-2 border-white/10 border-t-pink-500 rounded-full animate-spin mx-auto" />
              </div>
            ) : gifts.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">📭</div>
                <h2 className="text-xl font-bold mb-2">No pending gifts</h2>
                <p className="text-gray-500 mb-4">When someone sends you a pack, it&apos;ll show up here!</p>
                <Link href="/packs" className="inline-block bg-pink-500/10 border border-pink-500/30 text-pink-400 font-bold px-6 py-2 rounded-lg hover:bg-pink-500/20 transition">
                  Gift a Pack to a Friend →
                </Link>
              </div>
            ) : (
              <div className="grid gap-4">
                {gifts.map(gift => (
                  <div key={gift.id} className="bg-white/[0.03] backdrop-blur border border-pink-500/20 rounded-2xl p-6 flex items-center gap-6 hover:border-pink-500/40 transition group">
                    <div className="text-5xl">{packIcons[gift.pack_type] || '🃏'}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-white font-bold text-lg">{packNames[gift.pack_type] || 'Pack'}</h3>
                        <span className="text-pink-400/60 text-xs">🎁 Gift</span>
                      </div>
                      <p className="text-gray-500 text-sm">
                        From <span className="text-gray-300 font-mono">{gift.sender === 'TCG Arena' ? '✨ TCG Arena' : `${gift.sender.slice(0, 6)}...${gift.sender.slice(-4)}`}</span>
                        <span className="mx-2">·</span>
                        {gift.cards.length} cards inside
                      </p>
                    </div>
                    <button
                      onClick={() => handleClaim(gift)}
                      className="bg-pink-500/10 border border-pink-500/30 text-pink-400 font-bold px-6 py-3 rounded-xl hover:bg-pink-500/20 hover:border-pink-500/50 transition-all group-hover:scale-105"
                    >
                      Open Gift 🎁
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Shaking / Opening */}
        {(phase === 'shaking' || phase === 'opening') && activeGift && (
          <div className="flex flex-col justify-center items-center h-[500px]">
            <p className="text-pink-400 text-sm mb-6 font-medium">
              🎁 Gift from {activeGift.sender === 'TCG Arena' ? '✨ TCG Arena' : `${activeGift.sender.slice(0, 6)}...${activeGift.sender.slice(-4)}`}
            </p>
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl blur-2xl bg-pink-500/30" style={{ animation: 'pulseGlow 1s ease-in-out infinite', transform: 'scale(1.3)' }} />
              <div
                className="relative w-[220px] h-[330px] rounded-2xl border border-pink-500/30"
                style={{
                  background: 'linear-gradient(145deg, #1a0a2e 0%, #4c1d55 30%, #ec4899 60%, #1a0a2e 100%)',
                  boxShadow: '0 20px 60px rgba(236,72,153,0.4)',
                  animation: phase === 'shaking' ? 'packShake 1.4s ease-in-out' : 'packTear 0.8s ease-out forwards',
                }}
              >
                <div className="flex flex-col items-center justify-center h-full gap-4">
                  <div className="text-6xl">🎁</div>
                  <div className="text-white font-black tracking-wider text-lg">
                    {phase === 'shaking' ? 'Opening...' : '✨'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Card Reveal */}
        {(phase === 'reveal' || phase === 'done') && activeGift && (
          <div>
            <p className="text-center text-pink-400 text-sm mb-6 font-medium">
              🎁 Gift from {activeGift.sender === 'TCG Arena' ? '✨ TCG Arena' : `${activeGift.sender.slice(0, 6)}...${activeGift.sender.slice(-4)}`}
            </p>
            <div className="flex flex-wrap justify-center gap-4 md:gap-5 mb-10">
              {activeGift.cards.map((card, i) => {
                const isRevealed = i < revealedCount
                const sampleCard = allSampleCards.find(c => c.name === card.name)

                return (
                  <div key={`${card.name}-${i}`} className="relative">
                    {isRevealed && sampleCard ? (
                      <div style={{ animation: 'cardFlip 0.6s ease-out, cardSlideIn 0.5s ease-out' }}>
                        <TCGCardFull card={sampleCard} />
                        <div className={`absolute -top-2 -left-2 z-40 ${card.grade >= 9 ? 'bg-yellow-400 text-black' : card.grade === 8 ? 'bg-green-600 text-white' : 'bg-zinc-800/80 text-zinc-500'} text-[9px] font-bold px-1.5 py-0.5 rounded`}>
                          PSA {card.grade}
                        </div>
                      </div>
                    ) : (
                      <div className="w-[160px] h-[260px] sm:w-[220px] sm:h-[340px] rounded-xl border border-white/5" style={{ background: 'linear-gradient(135deg, #0a0f0a, #111611)' }}>
                        <div className="flex items-center justify-center h-full">
                          <div className="w-8 h-8 border-2 border-white/10 border-t-pink-500/50 rounded-full animate-spin" />
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {phase === 'done' && (
              <div className="text-center space-y-6" style={{ animation: 'fadeInUp 0.4s ease-out' }}>
                <div className="flex justify-center gap-3 flex-wrap">
                  {activeGift.cards.map((card, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-xs">
                      <span style={{ color: rarityColors[card.rarity] }}>●</span>
                      <span className="text-gray-500">{card.name}</span>
                      <span className={`font-bold ${card.grade >= 9 ? 'text-yellow-400' : card.grade === 8 ? 'text-green-400' : 'text-gray-600'}`}>
                        PSA {card.grade}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-center gap-3">
                  <button onClick={handleBack} className="px-8 py-3 rounded-xl bg-pink-500/10 border border-pink-500/30 text-pink-400 font-bold tracking-wider hover:bg-pink-500/20 transition-all">
                    {gifts.length > 0 ? 'Open Next Gift' : 'Back to Inbox'}
                  </button>
                  <Link href="/collection" className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-400 font-bold tracking-wider hover:bg-white/10 hover:text-white transition-all">
                    View Collection →
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
