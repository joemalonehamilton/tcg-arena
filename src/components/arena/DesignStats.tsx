'use client'

// Updated stats to match actual card distribution
const TYPE_STATS = [
  { label: 'Creatures', count: 22, color: '#ef4444', max: 24 },
  { label: 'Artifacts', count: 1, color: '#a855f7', max: 24 },
  { label: 'Spells', count: 1, color: '#3b82f6', max: 24 },
]

const RARITY_STATS = [
  { label: 'Common', count: 8, color: '#6b7280' },
  { label: 'Uncommon', count: 8, color: '#22c55e' },
  { label: 'Rare', count: 4, color: '#a855f7' },
  { label: 'Legendary', count: 4, color: '#f59e0b' },
]

// Mana curve — count of cards at each cost (MetaGamer suggestion)
const MANA_CURVE = [
  { cost: 1, count: 2 },
  { cost: 2, count: 3 },
  { cost: 3, count: 3 },
  { cost: 4, count: 3 },
  { cost: 5, count: 3 },
  { cost: 6, count: 4 },
  { cost: 7, count: 1 },
  { cost: 8, count: 3 },
  { cost: 9, count: 2 },
]

const maxCurve = Math.max(...MANA_CURVE.map(m => m.count))

export default function DesignStats() {
  const total = TYPE_STATS.reduce((s, x) => s + x.count, 0)
  return (
    <div className="space-y-4">
      {/* Type Distribution */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-[#b8f53d]">Card Types</h3>
          <div className="flex-1 h-px bg-[#1a2a1a]" />
        </div>
        <div className="space-y-2">
          {TYPE_STATS.map(s => (
            <div key={s.label} className="flex items-center gap-2">
              <span className="text-xs text-gray-400 w-20">{s.label}</span>
              <div className="flex-1 h-2 bg-[#1a2a1a] rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(s.count / s.max) * 100}%`, backgroundColor: s.color }} />
              </div>
              <span className="text-xs text-gray-300 w-6 text-right">{s.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Rarity Distribution */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-[#b8f53d]">Rarity</h3>
          <div className="flex-1 h-px bg-[#1a2a1a]" />
        </div>
        <div className="flex gap-2">
          {RARITY_STATS.map(r => (
            <div key={r.label} className="flex-1 text-center">
              <div className="text-lg font-black" style={{ color: r.color }}>{r.count}</div>
              <div className="text-[9px] text-gray-500 uppercase">{r.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Mana Curve (MetaGamer) */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-[#b8f53d]">Mana Curve</h3>
          <div className="flex-1 h-px bg-[#1a2a1a]" />
        </div>
        <div className="flex items-end gap-1 h-16">
          {MANA_CURVE.map(m => (
            <div key={m.cost} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full rounded-t" style={{
                height: `${(m.count / maxCurve) * 48}px`,
                background: m.count >= 3 ? '#b8f53d' : m.count >= 2 ? '#b8f53d80' : '#b8f53d40',
              }} />
              <span className="text-[9px] text-gray-500">{m.cost}</span>
            </div>
          ))}
        </div>
        <div className="text-center text-[10px] text-gray-600 mt-1">Cost →</div>
      </div>

      <div className="text-center text-sm text-gray-400">
        Total: <span className="text-white font-bold">{total}</span> cards across 3 rounds
      </div>
    </div>
  )
}
