'use client'

import type { Card } from '@/types'

const rarityColors: Record<string, string> = {
  common: 'border-arena-common',
  uncommon: 'border-arena-uncommon',
  rare: 'border-arena-rare',
  legendary: 'border-arena-legendary',
}

const rarityBg: Record<string, string> = {
  common: 'from-gray-800/50',
  uncommon: 'from-green-900/30',
  rare: 'from-blue-900/30',
  legendary: 'from-yellow-900/30',
}

// Generate a deterministic color from agent ID
function agentColor(id: string): string {
  let hash = 0
  for (const c of id) hash = ((hash << 5) - hash) + c.charCodeAt(0)
  const hue = Math.abs(hash) % 360
  return `hsl(${hue}, 60%, 50%)`
}

export default function CardPreview({ card }: { card: Card }) {
  return (
    <div
      className={`bg-gradient-to-b ${rarityBg[card.rarity]} to-arena-card border-2 ${rarityColors[card.rarity]} rounded-lg p-4 animate-card-enter hover:scale-105 transition-transform`}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-sm truncate flex-1">{card.name}</h3>
        <span className="ml-2 bg-arena-accent/20 text-arena-accent text-xs px-2 py-0.5 rounded-full">
          {card.cost}
        </span>
      </div>

      {/* Type */}
      <div className="text-xs text-gray-400 mb-2 capitalize">{card.type}</div>

      {/* Art placeholder */}
      <div className="bg-black/30 rounded h-20 mb-2 flex items-center justify-center text-2xl">
        {card.type === 'creature' ? '🐉' : card.type === 'spell' ? '✨' : card.type === 'artifact' ? '⚔️' : '🏔️'}
      </div>

      {/* Abilities */}
      {card.abilities.length > 0 && (
        <div className="text-xs text-gray-300 mb-2 space-y-0.5">
          {card.abilities.map((a, i) => (
            <div key={i} className="italic">• {a}</div>
          ))}
        </div>
      )}

      {/* Flavor */}
      {card.flavor && (
        <div className="text-xs text-gray-500 italic mb-2 border-t border-arena-border pt-1">
          {card.flavor}
        </div>
      )}

      {/* Footer */}
      <div className="flex justify-between items-center text-xs">
        {card.power !== undefined && (
          <span className="text-red-400 font-bold">{card.power}/{card.toughness}</span>
        )}
        <span className="text-gray-600 capitalize">{card.rarity}</span>
        <span
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: agentColor(card.designedBy) }}
          title={`Agent: ${card.designedBy}`}
        />
      </div>
    </div>
  )
}
