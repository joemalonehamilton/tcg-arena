interface TCGCardProps {
  name: string
  cost: number
  power: number
  toughness: number
  gradient: string
  borderColor: string
  rotation?: number
  zIndex?: number
  offsetX?: number
}

export default function TCGCard({
  name, cost, power, toughness, gradient, borderColor, rotation = 0, zIndex = 0, offsetX = 0,
}: TCGCardProps) {
  return (
    <div
      className="w-48 h-72 rounded-xl overflow-hidden shadow-2xl flex-shrink-0 absolute"
      style={{
        border: `3px solid ${borderColor}`,
        transform: `rotate(${rotation}deg) translateX(${offsetX}px)`,
        zIndex,
        background: '#111811',
      }}
    >
      {/* Cost */}
      <div className="absolute top-2 left-2 w-8 h-8 rounded-full bg-black/80 border border-white/30 flex items-center justify-center text-white font-bold text-sm z-10">
        {cost}
      </div>

      {/* Art */}
      <div className="h-[60%] w-full" style={{ background: gradient }} />

      {/* Name bar */}
      <div className="bg-black/90 px-3 py-1.5 border-t border-b" style={{ borderColor }}>
        <span className="text-white text-xs font-bold uppercase tracking-wide">{name}</span>
      </div>

      {/* Body */}
      <div className="flex-1 bg-[#111811] p-2 relative h-[calc(40%-2rem)]">
        <div className="text-[10px] text-arena-muted italic">Creature</div>
        {/* Power/Toughness */}
        <div
          className="absolute bottom-2 right-2 w-10 h-7 rounded flex items-center justify-center text-white font-bold text-xs"
          style={{ background: borderColor }}
        >
          {power}/{toughness}
        </div>
      </div>
    </div>
  )
}
