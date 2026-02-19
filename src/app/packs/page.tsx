'use client'

import { useState, useEffect, useCallback } from 'react'
import { openPack, getAvailablePacks, type PackCard } from '@/lib/packs'
import { sampleCards, monadMonsterCards, TCGCardFull, type SampleCard } from '@/components/SampleCards'
import { getPackCost, getPriceTier, SPEND_SPLIT } from '@/lib/token-economy'
import { SFX } from '@/lib/sound-effects'
import PageBackground from '@/components/PageBackground'
import { useTCGBalance } from '@/hooks/useTCGBalance'
import { useWriteContract, useWaitForTransactionReceipt, useSwitchChain, useChainId } from 'wagmi'
import { TCG_TOKEN_ADDRESS, TCG_TOKEN_ABI, TREASURY_ADDRESS } from '@/lib/tcg-token'
import { parseEther } from 'viem'
import { monadMainnet } from '@/lib/wagmi-config'

const allSampleCards = [...sampleCards, ...monadMonsterCards]
const totalUniqueCards = allSampleCards.length

const packData: Record<string, {
  gradient: string; glow: string; icon: string; hoverGlow: string;
  particles: string; tagline: string; features: string[]
}> = {
  standard: {
    gradient: 'linear-gradient(145deg, #0d1b3e 0%, #1a2d5e 30%, #0f3460 60%, #1a1a3e 100%)',
    glow: 'rgba(59,130,246,0.35)',
    hoverGlow: 'rgba(59,130,246,0.6)',
    icon: '🃏',
    particles: '#3b82f6',
    tagline: 'The classic. 5 cards, endless possibilities.',
    features: ['5 cards per pack', '1 Uncommon+ guaranteed', 'Best value per card'],
  },
  premium: {
    gradient: 'linear-gradient(145deg, #1a0a3e 0%, #4c1d95 30%, #7c3aed 50%, #2d1065 100%)',
    glow: 'rgba(168,85,247,0.4)',
    hoverGlow: 'rgba(168,85,247,0.7)',
    icon: '💎',
    particles: '#a855f7',
    tagline: 'Higher floor. Higher ceiling. Higher stakes.',
    features: ['5 cards per pack', '2 Rares guaranteed', '10x legendary odds'],
  },
  monad: {
    gradient: 'linear-gradient(145deg, #0a1f0a 0%, #14532d 30%, #7c3aed 60%, #1a0a2e 100%)',
    glow: 'rgba(74,222,128,0.35)',
    hoverGlow: 'rgba(74,222,128,0.6)',
    icon: '🟣',
    particles: '#4ade80',
    tagline: 'Monad-exclusive creatures. Concentrated power.',
    features: ['3 cards per pack', 'Monad pool only', 'Higher rare chance'],
  },
}

const rarityColors: Record<string, string> = {
  common: '#6b7280', uncommon: '#22c55e', rare: '#a855f7', legendary: '#f59e0b', mythic: '#ef4444',
}

function findSampleCard(packCard: PackCard): SampleCard | undefined {
  return allSampleCards.find(c => c.name === packCard.name)
}

type Phase = 'select' | 'shaking' | 'opening' | 'reveal' | 'done'

export default function PacksPage() {
  const { balance: tokenBalance, isConnected, address, refetch: refetchBalance } = useTCGBalance()
  const { writeContractAsync } = useWriteContract()
  const { switchChainAsync } = useSwitchChain()
  const chainId = useChainId()
  const packs = getAvailablePacks()
  const [phase, setPhase] = useState<Phase>('select')
  const [selectedPack, setSelectedPack] = useState<string | null>(null)
  const [cards, setCards] = useState<PackCard[]>([])
  const [revealedCount, setRevealedCount] = useState(0)
  const [collection, setCollection] = useState<Record<string, number>>({})
  const [legendaryFlash, setLegendaryFlash] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const [hoveredPack, setHoveredPack] = useState<string | null>(null)
  const [giftMode, setGiftMode] = useState(false)
  const [giftAddress, setGiftAddress] = useState('')
  const [giftPending, setGiftPending] = useState(false)
  const [giftResult, setGiftResult] = useState<{ success: boolean; message: string } | null>(null)

  // Collection is now on-chain only — no localStorage
  const [referrer, setReferrer] = useState<string | null>(null)

  // Read referral from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const ref = params.get('ref')
    if (ref) setReferrer(ref)
  }, [])

  const uniqueCount = Object.keys(collection).length
  const priceTier = getPriceTier()

  const handleOpenPack = useCallback(async (packId: string) => {
    const cost = getPackCost(packId)
    if (!isConnected || !address) {
      alert('Connect your wallet first!')
      return
    }
    if (tokenBalance < cost) {
      alert(`Not enough TCG! Need ${cost.toLocaleString()} TCG, you have ${tokenBalance.toLocaleString()}`)
      return
    }
    let paymentTxHash: string | undefined
    try {
      // Ensure user is on Monad chain
      if (chainId !== monadMainnet.id) {
        try {
          await switchChainAsync({ chainId: monadMainnet.id })
        } catch {
          alert('Please switch to Monad network in your wallet')
          return
        }
      }
      // Single transaction — send full cost to treasury
      // Server-side splits: 50% burned from treasury, 50% stays as reward pool
      paymentTxHash = await writeContractAsync({
        address: TCG_TOKEN_ADDRESS,
        abi: TCG_TOKEN_ABI,
        functionName: 'transfer',
        args: [TREASURY_ADDRESS, parseEther(String(cost))],
        chainId: monadMainnet.id,
      })
      refetchBalance()
    } catch (err: any) {
      if (err?.message?.includes('User rejected')) return
      alert('Transaction failed: ' + (err?.shortMessage || err?.message || 'Unknown error'))
      return
    }
    setSelectedPack(packId)
    setPhase('shaking')
    setCards([])
    setRevealedCount(0)
    const shakeInterval = setInterval(() => SFX.packShake(), 200)

    // Start minting server-side immediately (cards generated on server)
    const mintPromise = (address && paymentTxHash)
      ? fetch('/api/pulls/mint', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            wallet: address,
            packType: packId,
            referrer: referrer || undefined,
            txHash: paymentTxHash,
          }),
        }).then(r => r.json()).catch(() => null)
      : Promise.resolve(null)

    setTimeout(async () => {
      clearInterval(shakeInterval)
      SFX.packOpen()
      setPhase('opening')

      // Wait for server response with actual cards
      const mintResult = await mintPromise

      setTimeout(() => {
        let newCards: PackCard[]
        if (mintResult?.success && mintResult.cards?.length) {
          // Use server-generated cards (authoritative)
          newCards = mintResult.cards.map((c: any) => ({
            name: c.name,
            rarity: c.rarity,
            imageUrl: c.imageUrl || '',
            power: c.power || 0,
            toughness: c.toughness || 0,
            cost: c.cost || 0,
            type: c.type || '',
            abilities: c.abilities || [],
            flavor: c.flavor || '',
            grade: c.grade,
            gradeInfo: c.gradeInfo || { grade: c.grade, label: '', shortLabel: `PSA ${c.grade}`, statBonus: 0, borderCSS: '', badgeColor: 'bg-zinc-700 text-white', glow: 'none', emoji: '' },
          }))
        } else {
          // Fallback: show client-side cards if mint failed (display only, not minted)
          newCards = openPack(packId)
          console.error('Mint failed, showing preview cards only:', mintResult?.error)
          // Show error to user
          setTimeout(() => {
            alert('⚠️ Card minting failed: ' + (mintResult?.error || 'Unknown error. Your TCG was sent but cards were not minted. Contact support.'))
          }, 2000)
        }
        setCards(newCards)
        setPhase('reveal')

        newCards.forEach((card, i) => {
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
          setCollection(prev => {
            const next = { ...prev }
            newCards.forEach(c => { next[c.name] = (next[c.name] || 0) + 1 })
            return next
          })
        }, (newCards.length + 1) * 600)
      }, 800)
    }, 1400)
  }, [isConnected, address, tokenBalance, writeContractAsync, refetchBalance])

  const handleReset = () => {
    setPhase('select')
    setSelectedPack(null)
    setCards([])
    setRevealedCount(0)
  }

  const handleGiftPack = useCallback(async (packId: string) => {
    if (!giftAddress || !/^0x[a-fA-F0-9]{40}$/.test(giftAddress)) {
      alert('Enter a valid wallet address (0x...)')
      return
    }
    if (giftAddress.toLowerCase() === address?.toLowerCase()) {
      alert("That's your own wallet! Just open a pack normally.")
      return
    }
    const cost = getPackCost(packId)
    if (!isConnected || !address) {
      alert('Connect your wallet first!')
      return
    }
    if (tokenBalance < cost) {
      alert(`Not enough TCG! Need ${cost.toLocaleString()} TCG`)
      return
    }

    setGiftPending(true)
    setGiftResult(null)

    let paymentTxHash: string | undefined
    try {
      if (chainId !== monadMainnet.id) {
        try { await switchChainAsync({ chainId: monadMainnet.id }) } catch { alert('Please switch to Monad network'); setGiftPending(false); return }
      }
      paymentTxHash = await writeContractAsync({
        address: TCG_TOKEN_ADDRESS,
        abi: TCG_TOKEN_ABI,
        functionName: 'transfer',
        args: [TREASURY_ADDRESS, parseEther(String(cost))],
        chainId: monadMainnet.id,
      })
      refetchBalance()
    } catch (err: any) {
      if (err?.message?.includes('User rejected')) { setGiftPending(false); return }
      alert('Transaction failed: ' + (err?.shortMessage || err?.message || 'Unknown error'))
      setGiftPending(false)
      return
    }

    try {
      const res = await fetch('/api/pulls/gift', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient: giftAddress,
          packType: packId,
          sender: address,
          txHash: paymentTxHash,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setGiftResult({ success: true, message: `🎁 Gifted ${data.totalCards} cards to ${giftAddress.slice(0, 6)}...${giftAddress.slice(-4)}!` })
      } else {
        setGiftResult({ success: false, message: data.error || 'Gift failed' })
      }
    } catch {
      setGiftResult({ success: false, message: 'Network error' })
    }
    setGiftPending(false)
  }, [giftAddress, address, isConnected, tokenBalance, chainId, writeContractAsync, switchChainAsync, refetchBalance])

  return (
    <div className="min-h-screen relative overflow-hidden">
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
        @keyframes legendaryBurst {
          0% { transform: scale(1); box-shadow: 0 0 0 rgba(245,158,11,0); }
          50% { transform: scale(1.08); box-shadow: 0 0 60px rgba(245,158,11,0.8); }
          100% { transform: scale(1); box-shadow: 0 0 30px rgba(245,158,11,0.3); }
        }
        @keyframes sparkle {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          100% { transform: translateY(-60px) scale(0); opacity: 0; }
        }
        @keyframes screenFlash {
          0% { opacity: 0.6; }
          100% { opacity: 0; }
        }
        @keyframes rarePulse {
          0%, 100% { box-shadow: 0 0 20px rgba(168,85,247,0.3); }
          50% { box-shadow: 0 0 40px rgba(168,85,247,0.7); }
        }
        @keyframes packFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes packGlow {
          0%, 100% { filter: brightness(1); }
          50% { filter: brightness(1.15); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes fadeInUp {
          0% { transform: translateY(20px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        @keyframes particleFloat {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          20% { opacity: 1; }
          100% { transform: translateY(-120px) translateX(20px); opacity: 0; }
        }
      `}</style>

      {/* Ambient background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#b8f53d]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-[120px]" />
      </div>

      {/* PSA 10 diamond rain */}
      {(phase === 'reveal' || phase === 'done') && cards.some((c, i) => c.grade === 10 && i < revealedCount) && (
        <div className="fixed inset-0 z-40 pointer-events-none">
          {[...Array(16)].map((_, i) => (
            <div key={i} className="absolute text-yellow-300 text-2xl"
              style={{ left: `${5 + Math.random() * 90}%`, top: `${10 + Math.random() * 80}%`,
                animation: `sparkle ${1 + Math.random()}s ease-out ${Math.random() * 0.5}s infinite` }}>💎</div>
          ))}
        </div>
      )}

      {/* Screen flash */}
      {legendaryFlash && (
        <div className="fixed inset-0 z-50 pointer-events-none bg-yellow-400/30" style={{ animation: 'screenFlash 0.6s ease-out forwards' }} />
      )}

      <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-8 md:py-16 relative z-10">

        {/* Card Art Banner */}
        <div className="relative mb-8 -mt-4 rounded-2xl overflow-hidden h-48 md:h-56">
          <div className="absolute inset-0 flex items-center justify-center gap-[-20px]">
            {['nadzilla', 'whale', 'rugpull-dragon', 'phantom-finalizer', 'monadium', 'the-deployer', 'octoracle'].map((card, i) => (
              <div key={card} className="w-32 md:w-40 h-44 md:h-52 rounded-xl overflow-hidden flex-shrink-0 -mx-4 md:-mx-3"
                style={{
                  transform: `rotate(${(i - 3) * 8}deg) translateY(${Math.abs(i - 3) * 10}px)`,
                  opacity: 0.35 - Math.abs(i - 3) * 0.04,
                  filter: 'blur(1px) saturate(1.2)',
                }}>
                <img src={`/cards/${card}.jpg`} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#060a06] via-[#060a06]/60 to-[#060a06]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#060a06] via-transparent to-[#060a06]" />
        </div>

        {/* Hero Header */}
        <div className="text-center mb-12" style={{ animation: 'fadeInUp 0.6s ease-out' }}>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-3">
            <span className="text-white">Open </span>
            <span className="text-[#b8f53d]">Packs</span>
          </h1>
          <p className="text-gray-400 text-base md:text-lg max-w-xl mx-auto mb-6">
            Rip packs. Chase rarities. Every card is PSA graded on pull.
          </p>

          {/* Token balance + collection */}
          <div className="flex justify-center items-center gap-4 flex-wrap">
            <div className="bg-white/5 backdrop-blur border border-[#b8f53d]/20 rounded-full px-5 py-2.5 flex items-center gap-2">
              <span className="text-[#b8f53d] text-lg">🪙</span>
              {isConnected ? (
                <>
                  <span className="text-white font-bold text-lg">{tokenBalance.toLocaleString()}</span>
                  <span className="text-gray-500 text-xs">TCG</span>
                </>
              ) : (
                <span className="text-gray-500 text-sm">Connect Wallet</span>
              )}
            </div>
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-full px-4 py-2.5 flex items-center gap-2">
              <span className="text-gray-400 text-sm">📦 {uniqueCount}/{totalUniqueCards} collected</span>
            </div>
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="bg-white/5 backdrop-blur border border-white/10 rounded-full px-4 py-2.5 text-gray-400 text-sm hover:border-[#b8f53d]/30 hover:text-[#b8f53d] transition-all"
            >
              {showInfo ? '✕ Hide' : 'ℹ️ Drop Rates'}
            </button>
            <button
              onClick={() => { setGiftMode(!giftMode); setGiftResult(null) }}
              className={`bg-white/5 backdrop-blur border rounded-full px-4 py-2.5 text-sm transition-all ${giftMode ? 'border-pink-500/50 text-pink-400' : 'border-white/10 text-gray-400 hover:border-pink-500/30 hover:text-pink-400'}`}
            >
              {giftMode ? '✕ Cancel Gift' : '🎁 Gift Pack'}
            </button>
          </div>

          {/* Price Tier Banner */}
          <div className="mt-4 inline-flex items-center gap-3 bg-[#b8f53d]/10 border border-[#b8f53d]/30 rounded-full px-5 py-2">
            <span className="text-[#b8f53d] font-black text-sm">{priceTier.label}</span>
            <span className="text-gray-400 text-xs">·</span>
            <span className="text-gray-400 text-xs">{priceTier.nextTier}</span>
            <span className="text-gray-400 text-xs">·</span>
            <span className="text-gray-500 text-[10px]">
              🔥 {Math.round(SPEND_SPLIT.BURN * 100)}% burned · 💰 {Math.round(SPEND_SPLIT.REWARD_POOL * 100)}% to staker rewards
            </span>
          </div>
          
          {/* Ponzinomics callout */}
          <div className="mt-3 flex items-center gap-2 text-gray-500 text-xs">
            <span>Every pack you open → half burned forever, half pays stakers</span>
            <a href="/staking" className="text-[#b8f53d] hover:underline font-bold">See your earnings →</a>
          </div>
        </div>

        {/* Drop Rates Panel */}
        {showInfo && (
          <div className="mb-12 max-w-4xl mx-auto" style={{ animation: 'fadeInUp 0.3s ease-out' }}>
            <div className="bg-white/[0.03] backdrop-blur border border-white/10 rounded-2xl p-6 md:p-8">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Rarity Rates */}
                <div>
                  <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#b8f53d]" /> Card Rarity Rates
                  </h3>
                  <div className="space-y-2.5">
                    {[
                      { rarity: 'Common', rate: '~80%', color: '#6b7280', bar: 80 },
                      { rarity: 'Uncommon', rate: '~18%', color: '#22c55e', bar: 18 },
                      { rarity: 'Rare', rate: '~2%', color: '#a855f7', bar: 8 },
                      { rarity: 'Legendary', rate: '0.01%', color: '#f59e0b', bar: 2 },
                      { rarity: 'Mythic', rate: '0% (unobtainable)', color: '#ef4444', bar: 0 },
                    ].map(r => (
                      <div key={r.rarity} className="flex items-center gap-3">
                        <span className="text-xs font-bold w-20 text-right" style={{ color: r.color }}>{r.rarity}</span>
                        <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${r.bar}%`, backgroundColor: r.color }} />
                        </div>
                        <span className="text-gray-500 text-xs w-24">{r.rate}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-gray-600 text-[11px] mt-3">Standard pack weighted slot. Premium packs have boosted rare/legendary odds.</p>
                </div>

                {/* PSA Grades */}
                <div>
                  <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-yellow-400" /> PSA Grading System
                  </h3>
                  <div className="space-y-2">
                    {[
                      { grade: 'PSA 10', label: 'Gem Mint', rate: '1%', color: '#facc15', emoji: '💎', note: '+1/+1 stats, 10x value' },
                      { grade: 'PSA 9', label: 'Mint', rate: '5%', color: '#60a5fa', emoji: '✨', note: '3x craft value' },
                      { grade: 'PSA 8', label: 'Near Mint', rate: '15%', color: '#4ade80', emoji: '🟢', note: '1.5x craft value' },
                      { grade: 'PSA 7', label: 'Excellent', rate: '30%', color: '#6b7280', emoji: '', note: 'Standard' },
                      { grade: 'PSA 6', label: 'Good', rate: '25%', color: '#52525b', emoji: '', note: '' },
                      { grade: 'PSA 5', label: 'Fair', rate: '24%', color: '#3f3f46', emoji: '', note: '' },
                    ].map(g => (
                      <div key={g.grade} className="flex items-center gap-3 py-1">
                        <span className="text-xs font-black w-14" style={{ color: g.color }}>{g.grade}</span>
                        <span className="text-gray-400 text-xs w-20">{g.label}</span>
                        <span className="text-gray-600 text-xs w-10 text-right">{g.rate}</span>
                        {g.note && <span className="text-gray-600 text-[10px] ml-1">— {g.note}</span>}
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-3 bg-yellow-400/5 border border-yellow-400/10 rounded-lg">
                    <p className="text-yellow-400/80 text-[11px]">
                      💎 <strong>PSA 10 Legendary</strong> = 1 in 1,000,000 pulls. If you hit one, screenshot it.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Gift Pack Panel */}
        {giftMode && phase === 'select' && (
          <div className="mb-8 max-w-lg mx-auto" style={{ animation: 'fadeInUp 0.3s ease-out' }}>
            <div className="bg-pink-500/5 backdrop-blur border border-pink-500/20 rounded-2xl p-6">
              <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                <span>🎁</span> Gift a Pack
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                Send a pack to a friend! You pay, they get the cards minted to their wallet.
              </p>
              <input
                type="text"
                value={giftAddress}
                onChange={e => setGiftAddress(e.target.value)}
                placeholder="Recipient wallet address (0x...)"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-pink-500/50 font-mono mb-3"
              />
              {giftResult && (
                <div className={`text-sm mb-3 px-3 py-2 rounded-lg ${giftResult.success ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                  {giftResult.message}
                </div>
              )}
              {giftPending && (
                <div className="text-sm text-gray-400 mb-3 flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-pink-500/30 border-t-pink-500 rounded-full animate-spin" />
                  Minting gift cards...
                </div>
              )}
              <p className="text-gray-600 text-xs">
                Select a pack below to gift it. Same price — cards go to the recipient.
              </p>
            </div>
          </div>
        )}

        {/* Pack Selection */}
        {phase === 'select' && (
          <div className="flex flex-col items-center gap-10" style={{ animation: 'fadeInUp 0.4s ease-out 0.1s both' }}>
            <div className="flex flex-wrap justify-center gap-6 md:gap-8">
              {packs.map((pack, idx) => {
                const p = packData[pack.id]
                const isHovered = hoveredPack === pack.id
                return (
                  <button
                    key={pack.id}
                    onClick={() => giftMode ? handleGiftPack(pack.id) : handleOpenPack(pack.id)}
                    onMouseEnter={() => setHoveredPack(pack.id)}
                    onMouseLeave={() => setHoveredPack(null)}
                    className="group relative cursor-pointer transition-all duration-500"
                    style={{ animation: `fadeInUp 0.5s ease-out ${0.1 + idx * 0.1}s both` }}
                  >
                    {/* Pack card */}
                    <div
                      className="relative w-[180px] h-[270px] sm:w-[220px] sm:h-[330px] rounded-2xl border border-white/10 overflow-hidden transition-all duration-500"
                      style={{
                        background: p.gradient,
                        boxShadow: isHovered
                          ? `0 20px 60px ${p.hoverGlow}, 0 0 0 1px rgba(255,255,255,0.1), inset 0 1px 0 rgba(255,255,255,0.1)`
                          : `0 8px 40px ${p.glow}`,
                        animation: 'packFloat 4s ease-in-out infinite, packGlow 3s ease-in-out infinite',
                        animationDelay: `${idx * 0.5}s`,
                        transform: isHovered ? 'translateY(-8px) scale(1.03)' : 'none',
                      }}
                    >
                      {/* Shimmer overlay */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                        style={{
                          background: 'linear-gradient(110deg, transparent 25%, rgba(255,255,255,0.05) 50%, transparent 75%)',
                          backgroundSize: '200% 100%',
                          animation: 'shimmer 2s linear infinite',
                        }} />

                      {/* Floating particles */}
                      <div className="absolute inset-0 overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                        {[...Array(6)].map((_, i) => (
                          <div key={i} className="absolute w-1 h-1 rounded-full"
                            style={{
                              backgroundColor: p.particles,
                              left: `${15 + Math.random() * 70}%`,
                              bottom: '0%',
                              animation: `particleFloat ${2 + Math.random() * 2}s ease-out ${Math.random() * 2}s infinite`,
                            }} />
                        ))}
                      </div>

                      {/* Content */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4 z-10">
                        <div className="text-5xl sm:text-6xl mb-2 transition-transform duration-300 group-hover:scale-110">{p.icon}</div>
                        <div className="text-white font-black text-lg sm:text-xl tracking-wide">{pack.name}</div>
                        <p className="text-gray-400/70 text-[10px] sm:text-xs text-center leading-relaxed px-2">{p.tagline}</p>

                        {/* Features */}
                        <div className="space-y-1 mt-1">
                          {p.features.map((f, fi) => (
                            <div key={fi} className="flex items-center gap-1.5 text-[10px] text-gray-500">
                              <span className="text-[#b8f53d]">✓</span> {f}
                            </div>
                          ))}
                        </div>

                        {/* Price */}
                        <div className="mt-3 bg-black/30 backdrop-blur rounded-full px-4 py-1.5 border border-white/10">
                          <span className="text-[#b8f53d] font-black text-sm">{getPackCost(pack.id).toLocaleString()} 🪙</span>
                        </div>
                      </div>

                      {/* Bottom edge glow */}
                      <div className="absolute bottom-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                        style={{ background: p.particles, boxShadow: `0 0 20px ${p.particles}` }} />
                    </div>

                    {/* "OPEN" label on hover */}
                    <div className="absolute -bottom-8 left-0 right-0 text-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-y-0 translate-y-2">
                      <span className={`font-black text-xs tracking-[0.3em] uppercase ${giftMode ? 'text-pink-400' : 'text-[#b8f53d]'}`}>{giftMode ? 'Click to Gift' : 'Click to Open'}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Shaking Pack */}
        {(phase === 'shaking' || phase === 'opening') && selectedPack && (
          <div className="flex justify-center items-center h-[400px]">
            <div className="relative">
              {/* Glow behind pack */}
              <div className="absolute inset-0 rounded-2xl blur-2xl" style={{
                background: packData[selectedPack].hoverGlow,
                animation: 'pulseGlow 1s ease-in-out infinite',
                transform: 'scale(1.3)',
              }} />
              <div
                className="relative w-[180px] h-[270px] sm:w-[220px] sm:h-[330px] rounded-2xl border border-white/20"
                style={{
                  background: packData[selectedPack].gradient,
                  boxShadow: `0 20px 60px ${packData[selectedPack].hoverGlow}`,
                  animation: phase === 'shaking' ? 'packShake 1.4s ease-in-out' : 'packTear 0.8s ease-out forwards',
                }}
              >
                <div className="flex flex-col items-center justify-center h-full gap-4">
                  <div className="text-6xl">{packData[selectedPack].icon}</div>
                  <div className="text-white font-black tracking-wider text-lg">
                    {phase === 'shaking' ? 'Opening...' : '✨'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Card Reveal */}
        {(phase === 'reveal' || phase === 'done') && cards.length > 0 && (
          <div>
            <div className="flex flex-wrap justify-center gap-4 md:gap-5 mb-10">
              {cards.map((card, i) => {
                const isRevealed = i < revealedCount
                const sampleCard = findSampleCard(card)
                const isLeg = card.rarity === 'legendary'
                const isRare = card.rarity === 'rare'
                const isPSA10 = card.grade === 10

                return (
                  <div key={`${card.name}-${i}`} className="relative">
                    {/* Sparkles for legendary / PSA 10 */}
                    {(isLeg || isPSA10) && isRevealed && (
                      <>
                        {[...Array(8)].map((_, si) => (
                          <div key={si} className="absolute text-yellow-400 text-xs pointer-events-none z-30"
                            style={{
                              left: `${15 + Math.random() * 70}%`, bottom: '50%',
                              animation: `sparkle ${0.8 + Math.random() * 0.5}s ease-out ${Math.random() * 0.5}s infinite`,
                            }}>✦</div>
                        ))}
                      </>
                    )}

                    {isRevealed && sampleCard ? (
                      <div
                        className={`relative ${card.gradeInfo?.borderCSS || ''}`}
                        style={{
                          animation: isPSA10
                            ? 'cardFlip 0.6s ease-out, cardSlideIn 0.5s ease-out, legendaryBurst 1s ease-out 0.3s'
                            : isLeg
                            ? 'cardFlip 0.6s ease-out, cardSlideIn 0.5s ease-out, legendaryBurst 1s ease-out 0.3s'
                            : isRare
                            ? 'cardFlip 0.6s ease-out, cardSlideIn 0.5s ease-out, rarePulse 2s ease-in-out infinite'
                            : 'cardFlip 0.6s ease-out, cardSlideIn 0.5s ease-out',
                        }}
                      >
                        <TCGCardFull card={sampleCard} />
                        {/* PSA Grade Badge */}
                        {card.grade >= 8 && (
                          <div className={`absolute -top-3 -left-3 z-40 ${card.gradeInfo?.badgeColor || 'bg-zinc-700 text-white'} text-[10px] font-black px-2 py-0.5 rounded-md shadow-lg`}>
                            {card.gradeInfo?.emoji} PSA {card.grade}
                          </div>
                        )}
                        {card.grade < 8 && (
                          <div className="absolute -top-2 -left-2 z-40 bg-zinc-800/80 text-zinc-500 text-[9px] font-bold px-1.5 py-0.5 rounded">
                            PSA {card.grade}
                          </div>
                        )}
                        {collection[card.name] && collection[card.name] > 0 && (
                          <div className="absolute -top-2 -right-2 z-40 bg-gray-800 border border-gray-600 text-white text-[10px] font-bold w-6 h-6 rounded-full flex items-center justify-center">
                            x{collection[card.name] + 1}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div
                        className="w-[160px] h-[260px] sm:w-[220px] sm:h-[340px] rounded-xl border border-white/5"
                        style={{
                          background: 'linear-gradient(135deg, #0a0f0a, #111611)',
                          boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                        }}
                      >
                        <div className="flex items-center justify-center h-full">
                          <div className="w-8 h-8 border-2 border-white/10 border-t-[#b8f53d]/50 rounded-full animate-spin" />
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Pull Summary */}
            {phase === 'done' && (
              <div className="text-center space-y-6" style={{ animation: 'fadeInUp 0.4s ease-out' }}>
                {/* Grade summary */}
                <div className="flex justify-center gap-3 flex-wrap">
                  {cards.map((card, i) => (
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
                  <button onClick={handleReset}
                    className="px-8 py-3 rounded-xl bg-[#b8f53d]/10 border border-[#b8f53d]/30 text-[#b8f53d] font-bold tracking-wider hover:bg-[#b8f53d]/20 hover:border-[#b8f53d]/50 transition-all duration-300">
                    Open Another Pack
                  </button>
                  <button
                    onClick={() => {
                      const bestCard = [...cards].sort((a, b) => {
                        const order = ['common', 'uncommon', 'rare', 'legendary', 'mythic']
                        return order.indexOf(b.rarity) - order.indexOf(a.rarity)
                      })[0]
                      const gradeText = bestCard?.grade >= 9 ? ` (PSA ${bestCard.grade} ${bestCard.gradeInfo?.label})` : ''
                      const text = bestCard
                        ? `🎴 Just pulled a ${bestCard.rarity.toUpperCase()} ${bestCard.name}${gradeText} from a pack on TCG Arena! ⚔️\n\nAI agents vote on card designs. Winners become tokens on @moaborz\n\nhttps://tcgarena.fun`
                        : `🎴 Opening packs on TCG Arena! ⚔️\n\nhttps://tcgarena.fun`
                      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank')
                    }}
                    className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-400 font-bold tracking-wider hover:bg-white/10 hover:text-white transition-all duration-300">
                    🐦 Share Pull
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Collection Tracker */}
        {uniqueCount > 0 && phase === 'select' && (
          <div className="mt-16 border-t border-white/5 pt-8" style={{ animation: 'fadeInUp 0.5s ease-out 0.3s both' }}>
            <h3 className="text-center text-gray-500 text-xs uppercase tracking-widest mb-4">Your Collection</h3>
            <div className="flex flex-wrap justify-center gap-2 max-w-3xl mx-auto">
              {Object.entries(collection).map(([name, count]) => {
                const card = allSampleCards.find(c => c.name === name)
                return (
                  <span key={name}
                    className="text-[10px] px-2.5 py-1 rounded-full border backdrop-blur"
                    style={{
                      borderColor: card ? `${rarityColors[card.rarity]}40` : '#6b728040',
                      color: card ? rarityColors[card.rarity] : '#6b7280',
                      backgroundColor: card ? `${rarityColors[card.rarity]}08` : 'transparent',
                    }}>
                    {name} {count > 1 && `×${count}`}
                  </span>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
