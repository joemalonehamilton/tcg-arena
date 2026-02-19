'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'

interface StarterCard {
  name: string
  rarity: string
}

export default function StarterPackClaim() {
  const { address } = useAccount()
  const [claimed, setClaimed] = useState<boolean | null>(null)
  const [claiming, setClaiming] = useState(false)
  const [cards, setCards] = useState<StarterCard[]>([])
  const [showCards, setShowCards] = useState(false)

  useEffect(() => {
    if (!address) { setClaimed(null); return }
    fetch(`/api/starter-pack?wallet=${address}`)
      .then(r => r.json())
      .then(data => setClaimed(data.claimed))
      .catch(() => setClaimed(false))
  }, [address])

  if (!address || claimed === null || claimed === true) return null

  const handleClaim = async () => {
    setClaiming(true)
    try {
      const res = await fetch('/api/starter-pack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet: address }),
      })
      const data = await res.json()
      if (data.cards) {
        setCards(data.cards)
        setShowCards(true)
        setClaimed(true)
        // Also save to local collection
        try {
          const existing = JSON.parse(localStorage.getItem('tcg-collection') || '[]')
          const newCollection = [...existing, ...data.cards.map((c: StarterCard) => ({
            name: c.name, rarity: c.rarity, cost: 1 + Math.floor(Math.random() * 3),
            power: 1 + Math.floor(Math.random() * 3), toughness: 1 + Math.floor(Math.random() * 3),
            abilities: [], owned: true,
          }))]
          localStorage.setItem('tcg-collection', JSON.stringify(newCollection))
        } catch {}
      }
    } catch {} finally { setClaiming(false) }
  }

  if (showCards) {
    return (
      <div className="bg-[#b8f53d]/10 border-2 border-[#b8f53d]/30 rounded-2xl p-6 text-center animate-card-enter">
        <div className="text-2xl mb-2">🎁 Starter Pack Opened!</div>
        <div className="flex gap-3 justify-center flex-wrap mb-4">
          {cards.map((c, i) => {
            const color = c.rarity === 'rare' ? '#a855f7' : '#6b7280'
            return (
              <div key={i} className="w-24 p-3 rounded-xl border-2 text-center animate-slide-in"
                style={{ borderColor: color, background: '#12121f', animationDelay: `${i * 100}ms` }}>
                <div className="text-[10px] uppercase font-black mb-1" style={{ color }}>{c.rarity}</div>
                <div className="text-xs font-bold text-white">{c.name}</div>
              </div>
            )
          })}
        </div>
        <p className="text-gray-500 text-xs">Cards added to your collection!</p>
      </div>
    )
  }

  return (
    <button onClick={handleClaim} disabled={claiming}
      className="w-full p-4 bg-[#b8f53d]/10 border-2 border-[#b8f53d]/30 rounded-2xl hover:bg-[#b8f53d]/20 transition-all text-center group animate-pulse">
      <div className="text-2xl mb-1">🎁</div>
      <div className="text-[#b8f53d] font-black text-lg">{claiming ? 'Opening...' : 'Claim Free Starter Pack'}</div>
      <div className="text-xs text-gray-500">5 common cards + chance at a rare!</div>
    </button>
  )
}
