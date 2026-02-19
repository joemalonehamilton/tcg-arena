import { NextResponse } from 'next/server'
import { getDistributionRate } from '@/lib/token-economy'

const TCG_TOKEN = '0x94CF69B5b13E621cB11f5153724AFb58c7337777'
const REWARD_POOL_WALLET = '0xb929Be8f1e0Fb962471d8EbcD9899b09f0BD65eC' // treasury doubles as reward pool for now
const BURN_ADDRESS = '0x000000000000000000000000000000000000dEaD'
const RPC_URL = 'https://rpc.monad.xyz'

async function getBalance(address: string): Promise<number> {
  const padded = address.slice(2).toLowerCase().padStart(64, '0')
  const res = await fetch(RPC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0', method: 'eth_call', id: 1,
      params: [{ to: TCG_TOKEN, data: '0x70a08231' + padded }, 'latest'],
    }),
    cache: 'no-store',
  })
  const data = await res.json()
  return Number(BigInt(data.result || '0x0')) / 1e18
}

// GET /api/rewards/pool — return reward pool stats
export async function GET() {
  const [poolBalance, burnedTotal] = await Promise.all([
    getBalance(REWARD_POOL_WALLET),
    getBalance(BURN_ADDRESS),
  ])

  const { rate, label: rateLabel } = getDistributionRate()
  const weeklyDistribution = poolBalance * rate
  const dailyDistribution = weeklyDistribution / 7

  return NextResponse.json({
    poolBalance,
    burnedTotal,
    dailyDistribution,
    weeklyDistribution,
    distributionRate: rate,
    distributionLabel: rateLabel,
    poolWallet: REWARD_POOL_WALLET,
  })
}
