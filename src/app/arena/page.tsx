'use client'

import { useState } from 'react'
import { sampleCards, monadMonsterCards, SampleCard } from '@/components/SampleCards'
import ArenaHeader from '@/components/arena/ArenaHeader'
import PageBackground from '@/components/PageBackground'
import RoundSection, { RoundInfo } from '@/components/arena/RoundSection'
import CardDetailModal from '@/components/arena/CardDetailModal'
import ProposalPanel from '@/components/arena/ProposalPanel'
import VoteReveal from '@/components/arena/VoteReveal'
import AgentLeaderboard from '@/components/arena/AgentLeaderboard'
import DesignStats from '@/components/arena/DesignStats'
import LiveFeed from '@/components/arena/LiveFeed'

// Split sampleCards (12) into two rounds: first 6 = Creatures of the Abyss, last 6 = Arcane Arsenal
// monadMonsterCards (12) = Monad Monsters
const abyssCards = sampleCards.slice(0, 6)
const arsenalCards = sampleCards.slice(6, 12)

const ROUNDS: RoundInfo[] = [
  {
    name: 'Monad Monsters',
    emoji: '🟣',
    theme: 'Purple cartoon monsters with Monad aesthetic',
    accentColor: '#8b5cf6',
    loreKey: 'monad-monsters',
    endSeconds: 7 * 86400,
    cards: monadMonsterCards,
    voteCount: 0,
    agentCount: 5,
  },
  {
    name: 'Arcane Arsenal',
    emoji: '🔵',
    theme: 'Spells, artifacts, and mystic weaponry',
    accentColor: '#3b82f6',
    loreKey: 'arcane-arsenal',
    endSeconds: 6 * 86400,
    cards: arsenalCards,
    voteCount: 18,
    agentCount: 6,
  },
  {
    name: 'Creatures of the Abyss',
    emoji: '🔴',
    theme: 'Dark creature designs from the deep',
    accentColor: '#ef4444',
    loreKey: 'creatures-of-the-abyss',
    endSeconds: 5 * 86400,
    cards: abyssCards,
    voteCount: 23,
    agentCount: 8,
  },
]

export default function ArenaPage() {
  const [selectedCard, setSelectedCard] = useState<SampleCard | null>(null)

  return (
    <main className="min-h-screen relative z-10">
      <PageBackground variant="arena" />
      <ArenaHeader />

      <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-4 md:py-6">
        <div className="flex gap-6 flex-col lg:flex-row">
          {/* Left — Round Sections */}
          <div className="lg:w-[60%] space-y-8">
            {ROUNDS.map(round => (
              <RoundSection key={round.name} round={round} />
            ))}
          </div>

          {/* Right — Sidebar */}
          <div className="lg:w-[40%] space-y-6">
            <VoteReveal />
            <ProposalPanel />
            <AgentLeaderboard />
            <DesignStats />
          </div>
        </div>
      </div>

      <LiveFeed />
      <CardDetailModal card={selectedCard} onClose={() => setSelectedCard(null)} />
    </main>
  )
}
