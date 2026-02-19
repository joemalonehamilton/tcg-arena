'use client'

import Image from 'next/image'
import { usePathname } from 'next/navigation'

const CARD_IMAGES = [
  'nadzilla', 'whale', 'rugpull-dragon', 'phantom-finalizer',
  'the-deployer', 'monadium', 'octoracle', 'shard-wyrm',
  'frozen-liquidity', 'gremlin-mev', 'the-devnet-horror', 'gas-guzzler',
]

interface FloatingCard {
  id: string
  image: string
  left: string
  top: string
  rotation: number
  scale: number
  opacity: number
  delay: string
  duration: string
  blur: number
}

function generateCards(): FloatingCard[] {
  // Deterministic positions — no Math.random on render to avoid hydration mismatch
  const positions: Array<{left: string; top: string; rot: number; scale: number; opacity: number; blur: number}> = [
    { left: '-4%', top: '8%', rot: -15, scale: 0.7, opacity: 0.06, blur: 2 },
    { left: '92%', top: '15%', rot: 12, scale: 0.55, opacity: 0.05, blur: 3 },
    { left: '-6%', top: '35%', rot: -22, scale: 0.6, opacity: 0.05, blur: 2 },
    { left: '94%', top: '42%', rot: 18, scale: 0.65, opacity: 0.06, blur: 2 },
    { left: '-3%', top: '58%', rot: 8, scale: 0.5, opacity: 0.04, blur: 3 },
    { left: '90%', top: '65%', rot: -10, scale: 0.55, opacity: 0.05, blur: 3 },
    { left: '-5%', top: '82%', rot: -20, scale: 0.6, opacity: 0.05, blur: 2 },
    { left: '93%', top: '88%', rot: 15, scale: 0.5, opacity: 0.04, blur: 3 },
  ]

  return positions.map((pos, i) => ({
    id: `float-${i}`,
    image: CARD_IMAGES[i % CARD_IMAGES.length],
    left: pos.left,
    top: pos.top,
    rotation: pos.rot,
    scale: pos.scale,
    opacity: pos.opacity,
    delay: `${i * 0.5}s`,
    duration: `${20 + i * 3}s`,
    blur: pos.blur,
  }))
}

const cards = generateCards()

export default function FloatingCards() {
  const pathname = usePathname()
  // Don't show on play page (clutters the game board)
  if (pathname === '/play') return null

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-[1]">
      {cards.map((card) => (
        <div
          key={card.id}
          className="absolute animate-card-drift"
          style={{
            left: card.left,
            top: card.top,
            transform: `rotate(${card.rotation}deg) scale(${card.scale})`,
            opacity: card.opacity,
            filter: `blur(${card.blur}px)`,
            animationDelay: card.delay,
            animationDuration: card.duration,
          }}
        >
          <div className="w-[180px] h-[250px] rounded-xl overflow-hidden border border-white/5 shadow-2xl shadow-black/30">
            <Image
              src={`/cards/${card.image}.jpg`}
              alt=""
              width={180}
              height={250}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        </div>
      ))}
    </div>
  )
}
