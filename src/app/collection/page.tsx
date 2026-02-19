'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import PageBackground from '@/components/PageBackground'
import { sampleCards, monadMonsterCards, TCGCardFull, type SampleCard } from '@/components/SampleCards'
import { useAccount } from 'wagmi'

const allCards = [...sampleCards, ...monadMonsterCards]
type Rarity = 'all' | 'common' | 'uncommon' | 'rare' | 'legendary' | 'mythic'

const rarityColors: Record<string, string> = {
  common: '#6b7280', uncommon: '#22c55e', rare: '#a855f7', legendary: '#f59e0b', mythic: '#ff0040',
}

interface NFTCard {
  tokenId: number
  name: string
  rarity: string
  grade: number
  packType: string
}

export default function CollectionPage() {
  const { address, isConnected } = useAccount()
  const [nftCards, setNftCards] = useState<NFTCard[]>([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<Rarity>('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!isConnected || !address) { setNftCards([]); return }
    setLoading(true)
    const addrLower = address.toLowerCase()
    // Show cache immediately, then refresh with live data
    fetch('/api/pulls/cache')
      .then(r => r.json())
      .then(data => {
        const cached = data.walletCards?.[addrLower]
        if (cached?.length) setNftCards(cached)
      })
      .catch(() => {})
    // Always fetch live on-chain data
    fetch(`/api/pulls?wallet=${address}`)
      .then(r => r.json())
      .then(live => { setNftCards(live.cards || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [isConnected, address])

  // Build collection from NFT data
  const collection = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const nft of nftCards) {
      counts[nft.name] = (counts[nft.name] || 0) + 1
    }
    return counts
  }, [nftCards])

  const ownedCards = useMemo(() => {
    return allCards
      .filter(c => (collection[c.name] || 0) > 0)
      .filter(c => filter === 'all' || c.rarity === filter)
      .filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()))
  }, [collection, filter, search])

  const totalOwned = nftCards.length
  const uniqueOwned = Object.keys(collection).length

  const rarityBreakdown = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const nft of nftCards) {
      counts[nft.rarity] = (counts[nft.rarity] || 0) + 1
    }
    return counts
  }, [nftCards])

  const filters: Rarity[] = ['all', 'common', 'uncommon', 'rare', 'legendary', 'mythic']

  return (
    <div className="min-h-screen text-white relative">
      <PageBackground variant="collection" />
      {/* Header */}
      <div className="border-b border-white/5 bg-black/30">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <Link href="/" className="text-gray-500 text-sm hover:text-white transition">← Back</Link>
            <h1 className="text-2xl font-bold mt-1">My Collection</h1>
          </div>
          <div className="flex gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-arena-accent">{totalOwned}</div>
              <div className="text-gray-500">Total Cards</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{uniqueOwned}/{allCards.length}</div>
              <div className="text-gray-500">Unique</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{allCards.length > 0 ? Math.round((uniqueOwned / allCards.length) * 100) : 0}%</div>
              <div className="text-gray-500">Complete</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        {/* Rarity breakdown bar */}
        <div className="flex gap-3 mb-4">
          {['common', 'uncommon', 'rare', 'legendary', 'mythic'].map(r => (
            <div key={r} className="flex items-center gap-1.5 text-xs">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: rarityColors[r] }} />
              <span className="text-gray-400 capitalize">{r}</span>
              <span className="font-bold" style={{ color: rarityColors[r] }}>{rarityBreakdown[r] || 0}</span>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-2 items-center mb-6 flex-wrap">
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${filter === f ? 'bg-arena-accent text-black' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
            >
              {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search cards..."
            className="ml-auto bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-arena-accent/50 w-48"
          />
        </div>

        {/* Cards grid */}
        {ownedCards.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-xl font-bold mb-2">No cards yet</h2>
            <p className="text-gray-500 mb-4">Open some packs to start your collection!</p>
            <Link href="/packs" className="inline-block bg-arena-accent text-black font-bold px-6 py-2 rounded-lg hover:bg-arena-accent/80 transition">
              Open Packs →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {ownedCards.map(card => (
              <div key={card.name} className="relative">
                <TCGCardFull card={card} style={{ width: '100%', height: 'auto', aspectRatio: '220/340' }} />
                {/* Quantity badge */}
                <div className="absolute top-1 right-1 z-40 bg-black/80 border border-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  x{collection[card.name]}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
