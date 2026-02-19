'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function ArenaHeader() {
  const [seconds, setSeconds] = useState(7 * 3600 + 42 * 60 + 19)

  useEffect(() => {
    const id = setInterval(() => setSeconds(s => Math.max(0, s - 1)), 1000)
    return () => clearInterval(id)
  }, [])

  const h = String(Math.floor(seconds / 3600)).padStart(2, '0')
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0')
  const s = String(seconds % 60).padStart(2, '0')

  return (
    <div className="w-full bg-[#0a0f0a] border-b border-[#1a2a1a] px-6 py-4">
      <div className="max-w-[1600px] mx-auto flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-xs uppercase tracking-[0.3em] text-[#b8f53d] font-bold font-mono hover:text-white transition-colors">⚔️ TCG Arena</Link>
          <div className="flex items-center gap-3">
            <Link href="/packs" className="text-xs text-gray-400 hover:text-white transition-colors uppercase tracking-wider">Packs</Link>
            <Link href="/staking" className="text-xs text-[#b8f53d] hover:text-white transition-colors uppercase tracking-wider font-bold">💰 Earn</Link>
            <Link href="/leaderboard" className="text-xs text-gray-400 hover:text-white transition-colors uppercase tracking-wider">Leaderboard</Link>
            <Link href="/collection" className="text-xs text-gray-400 hover:text-white transition-colors uppercase tracking-wider">Collection</Link>
            <Link href="/arena" className="text-xs text-gray-400 hover:text-white transition-colors uppercase tracking-wider">Arena</Link>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-400 uppercase tracking-wider">Round ends</span>
          <span className="font-mono text-xl text-[#b8f53d] font-bold">{h}:{m}:{s}</span>
        </div>
      </div>
    </div>
  )
}
