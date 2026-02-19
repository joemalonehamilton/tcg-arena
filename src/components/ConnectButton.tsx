'use client'

import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { useEffect } from 'react'

export default function ConnectButton() {
  const { address, isConnected } = useAccount()
  const { connect } = useConnect()
  const { disconnect } = useDisconnect()

  // Register user on connect
  useEffect(() => {
    if (isConnected && address) {
      fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet_address: address }),
      }).catch(() => {})
    }
  }, [isConnected, address])

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 bg-white/5 border border-arena-accent/30 rounded-lg px-3 py-1.5">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-arena-accent font-mono">
            {address.slice(0, 6)}...{address.slice(-4)}
          </span>
        </div>
        <button
          onClick={() => disconnect()}
          className="text-xs text-gray-500 hover:text-white transition px-2 py-1"
        >
          ✕
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => connect({ connector: injected() })}
      className="bg-arena-accent text-black text-xs font-bold px-4 py-1.5 rounded-lg hover:bg-arena-accent/80 transition"
    >
      Connect Wallet
    </button>
  )
}
