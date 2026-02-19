'use client'

import { useState, useEffect } from 'react'

interface Activity {
  wallet: string
  action: string
  detail: string
  timestamp: number
}

const BURN_ADDRESS = '0x000000000000000000000000000000000000dead'
const TCG_TOKEN = '0x94CF69B5b13E621cB11f5153724AFb58c7337777'
const NFT_CONTRACT = '0x1931c88707Eb36e0EF3e235589724Ce7faEa0889'
const RPC_URL = 'https://rpc.monad.xyz'

// Transfer event topic
const TRANSFER_TOPIC = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
// CardMinted event topic
const CARD_MINTED_TOPIC = '0xcdc4a2297e1719bc0efbbd70efbf867f20801457f89caef0ba2e23b00a8d415e'

export default function LiveActivity() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    async function fetchRecent() {
      try {
        // Get latest block
        const blockRes = await fetch(RPC_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jsonrpc: '2.0', method: 'eth_blockNumber', id: 1 }),
        })
        const blockData = await blockRes.json()
        const latestBlock = parseInt(blockData.result, 16)
        const fromBlock = '0x' + Math.max(0, latestBlock - 5000).toString(16)

        // Fetch TCG token burns (transfers to dead address)
        const burnRes = await fetch(RPC_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0', method: 'eth_getLogs', id: 2,
            params: [{
              address: TCG_TOKEN,
              fromBlock,
              toBlock: 'latest',
              topics: [TRANSFER_TOPIC, null, '0x000000000000000000000000000000000000000000000000000000000000dead'],
            }],
          }),
        })
        const burnData = await burnRes.json()

        // Fetch NFT mints
        const mintRes = await fetch(RPC_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0', method: 'eth_getLogs', id: 3,
            params: [{
              address: NFT_CONTRACT,
              fromBlock,
              toBlock: 'latest',
              topics: [CARD_MINTED_TOPIC],
            }],
          }),
        })
        const mintData = await mintRes.json()

        const acts: Activity[] = []

        // Parse burns
        for (const log of (burnData.result || [])) {
          const wallet = '0x' + (log.topics[1] || '').slice(26)
          const amountHex = log.data || '0x0'
          const amount = Number(BigInt(amountHex) / BigInt(10 ** 18))
          if (amount > 0) {
            acts.push({
              wallet,
              action: '🔥 Burned',
              detail: `${amount.toLocaleString()} TCG`,
              timestamp: parseInt(log.blockNumber, 16),
            })
          }
        }

        // Parse mints
        for (const log of (mintData.result || [])) {
          const tokenId = parseInt(log.topics[1], 16)
          const wallet = '0x' + (log.topics[2] || '').slice(26)
          acts.push({
            wallet,
            action: '🎴 Minted',
            detail: `Card #${tokenId}`,
            timestamp: parseInt(log.blockNumber, 16),
          })
        }

        // Sort by block (most recent first) and take last 10
        acts.sort((a, b) => b.timestamp - a.timestamp)
        setActivities(acts.slice(0, 10))
      } catch {}
    }

    fetchRecent()
    const interval = setInterval(fetchRecent, 30000)
    return () => clearInterval(interval)
  }, [])

  if (activities.length === 0 || !visible) return null

  return (
    <div className="fixed bottom-4 right-4 z-40 w-80">
      <div className="bg-[#0a0f0a]/95 backdrop-blur-xl border border-[#b8f53d]/20 rounded-xl overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-4 py-2 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[#b8f53d] rounded-full animate-pulse" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">Live Activity</span>
          </div>
          <button onClick={() => setVisible(false)} className="text-gray-500 hover:text-white text-xs">✕</button>
        </div>
        <div className="max-h-64 overflow-y-auto">
          {activities.map((act, i) => {
            const short = `${act.wallet.slice(0, 6)}...${act.wallet.slice(-4)}`
            return (
              <div key={`${act.timestamp}-${i}`} className="flex items-center gap-3 px-4 py-2 border-b border-white/[0.03] hover:bg-white/[0.02]">
                <span className="text-sm">{act.action.split(' ')[0]}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-white font-medium truncate">{short} {act.action.split(' ').slice(1).join(' ')}</div>
                  <div className="text-[10px] text-gray-500">{act.detail}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
