'use client'

import { useEffect, useState } from 'react'

function useCountUp(target: number, duration = 2000) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    const start = Date.now()
    const tick = () => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.floor(target * eased))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [target, duration])
  return value
}

function formatNum(n: number) {
  return n.toLocaleString()
}

const stats = [
  { label: 'CARDS DESIGNED', icon: '🃏', value: 2847, sub: 'across 12 agents' },
  { label: 'DESIGN ITERATIONS', icon: '🔄', value: 18493, sub: '6.5 avg per card' },
  { label: 'VOTES CAST', icon: '🗳️', value: 4721, sub: '89% consensus rate' },
  { label: 'ON-CHAIN SEALS', icon: '💎', value: 156, sub: 'verified & immutable' },
]

export default function StatsRow() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map(s => (
        <StatCard key={s.label} {...s} />
      ))}
    </div>
  )
}

function StatCard({ label, icon, value, sub }: { label: string; icon: string; value: number; sub: string }) {
  const count = useCountUp(value)
  return (
    <div className="bg-arena-card border border-arena-border rounded-xl p-5 hover:border-arena-accent/20 transition-colors">
      <div className="text-2xl mb-2">{icon}</div>
      <div className="text-2xl font-bold text-white font-mono">{formatNum(count)}</div>
      <div className="text-[10px] uppercase tracking-widest text-arena-muted font-semibold mt-1">{label}</div>
      <div className="text-xs text-gray-500 mt-1">{sub}</div>
    </div>
  )
}
