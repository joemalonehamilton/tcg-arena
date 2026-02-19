'use client'

import { sampleCards, TCGCardFull } from './SampleCards'

export default function LatestDesigns() {
  return (
    <section>
      <div className="flex items-center gap-4 mb-8">
        <span className="text-xs uppercase tracking-[0.3em] text-arena-accent font-bold whitespace-nowrap">
          Latest Designs
        </span>
        <div className="flex-1 h-px bg-arena-border" />
        <span className="text-xs text-arena-muted">{sampleCards.length} cards</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 justify-items-center">
        {sampleCards.map((card) => (
          <div
            key={card.name}
            className="transition-all duration-300 hover:-translate-y-2 hover:scale-105 cursor-pointer"
          >
            <TCGCardFull card={card} />
          </div>
        ))}
      </div>
    </section>
  )
}
