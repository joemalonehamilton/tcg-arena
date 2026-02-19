'use client'

import { useTCGBalance } from '@/hooks/useTCGBalance'

export default function TokenDisplay() {
  const { balance, isConnected, isLoading } = useTCGBalance()

  if (!isConnected) {
    return (
      <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5">
        <span className="text-sm">🪙</span>
        <span className="text-gray-500 text-sm">—</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1.5 bg-white/5 border border-[#b8f53d]/20 rounded-lg px-3 py-1.5">
      <span className="text-sm">🪙</span>
      <span className="text-[#b8f53d] font-bold text-sm">
        {isLoading ? '...' : balance.toLocaleString()}
      </span>
      <span className="text-[10px] text-gray-500">TCG</span>
    </div>
  )
}
