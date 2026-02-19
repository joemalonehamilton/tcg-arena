'use client'

import { sampleCards, TCGCardFull } from './SampleCards'

export default function CardShowcase() {
  const featured = [sampleCards[2], sampleCards[1], sampleCards[0]] // Paladin, Arcane, Infernal

  return (
    <div className="relative w-[340px] h-[360px] flex items-center justify-center">
      {featured.map((card, i) => {
        const rotations = [-12, 0, 12]
        const offsets = [-55, 0, 55]
        const zIndexes = [1, 2, 3]
        return (
          <div
            key={card.name}
            className="absolute transition-transform duration-300 hover:scale-105"
            style={{
              transform: `rotate(${rotations[i]}deg) translateX(${offsets[i]}px)`,
              zIndex: zIndexes[i],
              filter: i === 2 ? 'none' : 'brightness(0.85)',
            }}
          >
            <TCGCardFull card={card} style={{ width: '180px', height: '260px' }} />
          </div>
        )
      })}
    </div>
  )
}
