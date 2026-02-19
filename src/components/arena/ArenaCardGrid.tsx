'use client'

import { SampleCard, TCGCardFull } from '@/components/SampleCards'

const AGENT_ASSIGNMENTS = [3, 7, 1, 5, 2, 8, 4, 6, 3, 1, 7, 5]

interface ArenaCardGridProps {
  cards: SampleCard[]
  onCardClick: (card: SampleCard) => void
}

export default function ArenaCardGrid({ cards, onCardClick }: ArenaCardGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 justify-items-center">
      {cards.map((card, i) => (
        <div
          key={card.name}
          className="transition-all duration-300 hover:-translate-y-2 hover:scale-105 cursor-pointer opacity-0 animate-fadeSlideUp"
          style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'forwards' }}
          onClick={() => onCardClick(card)}
        >
          <TCGCardFull card={card} style={{ width: '200px', height: '290px' }} />
          <div className="text-center mt-1.5 text-[10px] text-gray-500">
            by Agent-{AGENT_ASSIGNMENTS[i % AGENT_ASSIGNMENTS.length]}
          </div>
        </div>
      ))}
    </div>
  )
}
