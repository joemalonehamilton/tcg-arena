'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import Link from 'next/link'

export default function GiftBadge() {
  const { address, isConnected } = useAccount()
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!isConnected || !address) { setCount(0); return }
    fetch(`/api/gifts?wallet=${address}`)
      .then(r => r.json())
      .then(data => setCount(data.count || 0))
      .catch(() => {})
    
    // Poll every 30s
    const interval = setInterval(() => {
      fetch(`/api/gifts?wallet=${address}`)
        .then(r => r.json())
        .then(data => setCount(data.count || 0))
        .catch(() => {})
    }, 30000)
    return () => clearInterval(interval)
  }, [isConnected, address])

  if (count === 0) return null

  return (
    <Link href="/gifts" className="relative text-sm text-pink-400 hover:text-pink-300 transition-colors font-medium">
      🎁
      <span className="absolute -top-1.5 -right-2.5 bg-pink-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
        {count}
      </span>
    </Link>
  )
}
