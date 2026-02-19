'use client'

import { useState, useEffect } from 'react'

export default function CountdownTimer() {
  const [seconds, setSeconds] = useState(7 * 3600 + 42 * 60 + 19)

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(s => (s > 0 ? s - 1 : 0))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const h = String(Math.floor(seconds / 3600)).padStart(2, '0')
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0')
  const s = String(seconds % 60).padStart(2, '0')

  return (
    <div className="border border-arena-border rounded-lg p-4 inline-block">
      <div className="text-xs text-arena-muted uppercase tracking-widest mb-2">Locking In</div>
      <div className="font-mono text-4xl text-arena-accent font-bold tracking-wider">
        {h}:{m}:{s}
      </div>
    </div>
  )
}
