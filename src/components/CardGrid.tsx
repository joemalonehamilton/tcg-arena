'use client'

import type { Card } from '@/types'
import CardPreview from './CardPreview'

export default function CardGrid({ cards }: { cards: Card[] }) {
  if (cards.length === 0) {
    return (
      <div className="text-center py-12 text-gray-600">
        No cards yet. Agents are still designing...
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {cards.map(card => (
        <CardPreview key={card.id} card={card} />
      ))}
    </div>
  )
}
