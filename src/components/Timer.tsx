'use client'

import { useEffect, useState } from 'react'

interface TimerProps {
  endsAt: number
}

export default function Timer({ endsAt }: TimerProps) {
  const [remaining, setRemaining] = useState(0)

  useEffect(() => {
    const tick = () => setRemaining(Math.max(0, endsAt - Date.now()))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [endsAt])

  const hours = Math.floor(remaining / 3600000)
  const minutes = Math.floor((remaining % 3600000) / 60000)
  const seconds = Math.floor((remaining % 60000) / 1000)

  const pad = (n: number) => n.toString().padStart(2, '0')

  return (
    <div className="bg-arena-card border border-arena-border rounded-xl p-6 animate-pulse-glow">
      <div className="text-center">
        <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Time Remaining</div>
        <div className="text-5xl font-mono font-bold tracking-wider">
          <span className="text-arena-accent">{pad(hours)}</span>
          <span className="text-gray-600">:</span>
          <span className="text-arena-accent">{pad(minutes)}</span>
          <span className="text-gray-600">:</span>
          <span className="text-arena-accent">{pad(seconds)}</span>
        </div>
      </div>
    </div>
  )
}
