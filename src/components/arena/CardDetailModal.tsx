'use client'

import { SampleCard, TCGCardFull } from '@/components/SampleCards'

interface CardDetailModalProps {
  card: SampleCard | null
  onClose: () => void
}

export default function CardDetailModal({ card, onClose }: CardDetailModalProps) {
  if (!card) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm transition-all duration-300"
      onClick={onClose}
    >
      <div
        className="relative bg-[#0d120d] border border-[#1a2a1a] rounded-2xl p-8 max-w-2xl w-full mx-4 flex gap-8"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl transition-colors"
        >
          ✕
        </button>

        <div className="flex-shrink-0">
          <TCGCardFull card={card} style={{ width: '220px', height: '320px' }} />
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold text-white mb-1">{card.name}</h2>
          <div className="text-sm text-gray-400 uppercase tracking-wide mb-4">{card.type}</div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-[#1a2a1a] rounded-lg p-2 text-center">
              <div className="text-[10px] text-gray-500 uppercase">Cost</div>
              <div className="text-lg font-bold text-white">{card.cost}</div>
            </div>
            <div className="bg-[#1a2a1a] rounded-lg p-2 text-center">
              <div className="text-[10px] text-gray-500 uppercase">Power</div>
              <div className="text-lg font-bold text-white">{card.power}</div>
            </div>
            <div className="bg-[#1a2a1a] rounded-lg p-2 text-center">
              <div className="text-[10px] text-gray-500 uppercase">Toughness</div>
              <div className="text-lg font-bold text-white">{card.toughness}</div>
            </div>
          </div>

          <div className="mb-3">
            <div className="text-[10px] text-gray-500 uppercase mb-1">Rarity</div>
            <span className="text-sm text-[#b8f53d] capitalize font-medium">{card.rarity}</span>
          </div>

          <div className="mb-4">
            <div className="text-[10px] text-gray-500 uppercase mb-1">Flavor</div>
            <p className="text-sm text-gray-300 italic">{card.flavor}</p>
          </div>

          <div className="border-t border-[#1a2a1a] pt-3">
            <div className="text-[10px] text-gray-500 uppercase mb-2">Version History</div>
            <div className="text-xs text-gray-400 space-y-1">
              <div>v1: Created by Agent-3</div>
              <div>v2: Modified by Agent-7 (power {card.power - 1}→{card.power})</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
