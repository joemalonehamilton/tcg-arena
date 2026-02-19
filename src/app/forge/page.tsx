'use client'

import { useState, useEffect } from 'react'
import { TCGCardFull, sampleCards, monadMonsterCards, SampleCard } from '@/components/SampleCards'
import Link from 'next/link'
import PageBackground from '@/components/PageBackground'

interface CollectionCard extends SampleCard {
  instanceId: string
  characterId: string
  count: number
}

const RARITY_ORDER = ['common', 'uncommon', 'rare', 'legendary'] as const
const RARITY_COLORS: Record<string, string> = {
  common: '#6b7280', uncommon: '#22c55e', rare: '#a855f7', legendary: '#f59e0b',
}
const RARITY_NEXT: Record<string, string> = {
  common: 'uncommon', uncommon: 'rare', rare: 'legendary',
}
const FORGE_SUCCESS: Record<string, number> = {
  common: 100, uncommon: 85, rare: 60,
}

export default function ForgePage() {
  const [collection, setCollection] = useState<Record<string, Record<string, number>>>({})
  const [selectedChar, setSelectedChar] = useState<string | null>(null)
  const [selectedRarity, setSelectedRarity] = useState<string | null>(null)
  const [forging, setForging] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
  const [totalBurned, setTotalBurned] = useState(0)

  // Load collection from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('tcg-collection')
    if (saved) {
      setCollection(JSON.parse(saved))
    } else {
      // Seed with starter cards for demo
      const starter: Record<string, Record<string, number>> = {}
      const allCards = [...sampleCards, ...monadMonsterCards]
      allCards.forEach(card => {
        const charId = card.name.toLowerCase().replace(/\s+/g, '-')
        if (!starter[charId]) starter[charId] = {}
        // Give 5 commons, 2 uncommons, 1 rare of each
        starter[charId]['common'] = 5
        starter[charId]['uncommon'] = 2
        starter[charId]['rare'] = 1
      })
      setCollection(starter)
      localStorage.setItem('tcg-collection', JSON.stringify(starter))
    }
    const burned = parseInt(localStorage.getItem('tcg-total-burned') || '0')
    setTotalBurned(burned)
  }, [])

  const saveCollection = (c: Record<string, Record<string, number>>) => {
    setCollection(c)
    localStorage.setItem('tcg-collection', JSON.stringify(c))
  }

  const allCards = [...sampleCards, ...monadMonsterCards]

  const getCharId = (card: SampleCard) => card.name.toLowerCase().replace(/\s+/g, '-')
  const getCount = (charId: string, rarity: string) => collection[charId]?.[rarity] || 0

  const canForge = (charId: string, rarity: string) => {
    if (rarity === 'legendary') return false
    return getCount(charId, rarity) >= 3
  }

  const doForge = async () => {
    if (!selectedChar || !selectedRarity) return
    if (!canForge(selectedChar, selectedRarity)) return

    setForging(true)
    setResult(null)

    // Animation delay
    await new Promise(r => setTimeout(r, 1500))

    const successRate = FORGE_SUCCESS[selectedRarity] || 100
    const roll = Math.random() * 100
    const success = roll <= successRate
    const nextRarity = RARITY_NEXT[selectedRarity]

    const newCollection = { ...collection }
    if (!newCollection[selectedChar]) newCollection[selectedChar] = {}

    // Always burn 3 inputs
    newCollection[selectedChar][selectedRarity] = (newCollection[selectedChar][selectedRarity] || 0) - 3
    const newBurned = totalBurned + 3

    if (success && nextRarity) {
      newCollection[selectedChar][nextRarity] = (newCollection[selectedChar][nextRarity] || 0) + 1
      setResult({
        success: true,
        message: `🔥 FORGED! 3x ${selectedRarity} → 1x ${nextRarity}! (${3 - 1} cards permanently burned)`,
      })
    } else {
      setResult({
        success: false,
        message: `💀 FORGE FAILED! 3 cards burned forever. (${successRate}% chance — unlucky)`,
      })
    }

    setTotalBurned(newBurned)
    localStorage.setItem('tcg-total-burned', String(newBurned))
    saveCollection(newCollection)
    setForging(false)
  }

  // Unique characters
  const characters = allCards.reduce<{ card: SampleCard; charId: string }[]>((acc, card) => {
    const charId = getCharId(card)
    if (!acc.find(c => c.charId === charId)) acc.push({ card, charId })
    return acc
  }, [])

  return (
    <main className="min-h-screen relative z-10">
      <PageBackground variant="forge" />
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/arena" className="text-xs text-gray-500 hover:text-white">← Arena</Link>
          <span className="text-xs uppercase tracking-[0.3em] text-[#b8f53d] font-bold">🔥 Card Forge</span>
          <div className="flex-1 h-px bg-[#1a2a1a]" />
          <span className="text-xs text-red-400">🔥 {totalBurned} cards burned forever</span>
        </div>

        {/* How it works */}
        <div className="bg-white/[0.02] border border-white/10 rounded-xl p-6">
          <h2 className="text-white font-bold text-sm uppercase tracking-wider mb-3">The Burn Forge</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-400">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔥</span>
              <div>
                <div className="text-white font-bold">3 Commons → 1 Uncommon</div>
                <div>100% success rate</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚡</span>
              <div>
                <div className="text-white font-bold">3 Uncommons → 1 Rare</div>
                <div>85% success — cards burned on fail</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">👑</span>
              <div>
                <div className="text-white font-bold">3 Rares → 1 Legendary</div>
                <div>60% success — cards burned on fail</div>
              </div>
            </div>
          </div>
          <div className="mt-3 text-[10px] text-gray-500 border-t border-white/5 pt-3">
            📊 From 100 commons → ~2 legendaries. That&apos;s a 98% burn rate. Supply only goes down.
          </div>
        </div>

        {/* Character Grid */}
        <div>
          <h2 className="text-xs uppercase tracking-[0.3em] text-[#b8f53d] font-bold mb-4">Your Collection</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {characters.map(({ card, charId }) => {
              const isSelected = selectedChar === charId
              return (
                <div
                  key={charId}
                  className={`bg-white/[0.02] border rounded-xl p-4 cursor-pointer transition-all ${isSelected ? 'border-[#b8f53d] bg-[#b8f53d]/5' : 'border-white/10 hover:border-white/20'}`}
                  onClick={() => { setSelectedChar(charId); setSelectedRarity(null); setResult(null) }}
                >
                  <div className="text-white font-bold text-sm mb-2">{card.name}</div>
                  <div className="flex gap-2">
                    {RARITY_ORDER.map(r => {
                      const count = getCount(charId, r)
                      return (
                        <div key={r} className="flex-1 text-center">
                          <div className="text-lg font-black" style={{ color: count > 0 ? RARITY_COLORS[r] : '#333' }}>{count}</div>
                          <div className="text-[8px] text-gray-600 uppercase">{r.slice(0, 3)}</div>
                        </div>
                      )
                    })}
                  </div>
                  {/* Forge options */}
                  {isSelected && (
                    <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
                      {['common', 'uncommon', 'rare'].map(r => {
                        const can = canForge(charId, r)
                        const count = getCount(charId, r)
                        return (
                          <button
                            key={r}
                            disabled={!can || forging}
                            onClick={(e) => { e.stopPropagation(); setSelectedRarity(r); setResult(null) }}
                            className={`w-full text-xs py-2 px-3 rounded-lg transition-all ${
                              can
                                ? selectedRarity === r
                                  ? 'bg-[#b8f53d] text-black font-bold'
                                  : 'bg-white/10 text-white hover:bg-white/20'
                                : 'bg-white/5 text-gray-600 cursor-not-allowed'
                            }`}
                          >
                            {count}/3 {r} → {RARITY_NEXT[r]} ({FORGE_SUCCESS[r]}%)
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Forge Action */}
        {selectedChar && selectedRarity && (
          <div className="fixed bottom-0 left-0 right-0 bg-[#0a0f0a]/95 backdrop-blur border-t border-white/10 p-6 z-50">
            <div className="max-w-6xl mx-auto flex items-center justify-between">
              <div>
                <div className="text-white font-bold">
                  Forge 3x {selectedRarity} {characters.find(c => c.charId === selectedChar)?.card.name}
                  → 1x {RARITY_NEXT[selectedRarity]}
                </div>
                <div className="text-xs text-gray-400">
                  Success rate: {FORGE_SUCCESS[selectedRarity]}% · Cards burned on {selectedRarity !== 'common' ? 'fail' : 'success only'}
                </div>
              </div>
              <div className="flex items-center gap-4">
                {result && (
                  <span className={`text-sm font-bold ${result.success ? 'text-[#b8f53d]' : 'text-red-400'}`}>
                    {result.message}
                  </span>
                )}
                <button
                  onClick={doForge}
                  disabled={forging || !canForge(selectedChar, selectedRarity)}
                  className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${
                    forging
                      ? 'bg-orange-500/50 text-white animate-pulse'
                      : 'bg-[#b8f53d] text-black hover:bg-[#a8e52d]'
                  }`}
                >
                  {forging ? '🔥 FORGING...' : '🔥 FORGE'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
