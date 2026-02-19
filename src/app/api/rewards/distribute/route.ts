import { NextRequest, NextResponse } from 'next/server'
import { createWalletClient, http, parseEther } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'

const TCG_TOKEN = '0x94CF69B5b13E621cB11f5153724AFb58c7337777'
const NFT_CONTRACT = '0x1931c88707Eb36e0EF3e235589724Ce7faEa0889'
const RPC_URL = 'https://rpc.monad.xyz'
const REWARD_POOL_WALLET = '0xb929Be8f1e0Fb962471d8EbcD9899b09f0BD65eC'

const RARITY_POINTS: Record<string, number> = {
  common: 1, uncommon: 5, rare: 25, legendary: 200, mythic: 2000,
}

function gradeMultiplier(grade: number): number {
  if (grade === 10) return 10
  if (grade === 9) return 3
  if (grade === 8) return 1.5
  return 1
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

async function rpcBatch(calls: { method: string; params: any[] }[]): Promise<any[]> {
  const body = calls.map((c, i) => ({ jsonrpc: '2.0', method: c.method, id: i, params: c.params }))
  const res = await fetch(RPC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    cache: 'no-store',
  })
  const results = await res.json()
  const arr = Array.isArray(results) ? results : [results]
  const byId: Record<number, any> = {}
  for (const r of arr) { if (r.result) byId[r.id] = r.result }
  return calls.map((_, i) => byId[i] ?? null)
}

async function rpcThrottled(allCalls: { method: string; params: any[] }[]): Promise<any[]> {
  const BATCH_SIZE = 10
  const results: any[] = new Array(allCalls.length).fill(null)
  for (let i = 0; i < allCalls.length; i += BATCH_SIZE) {
    const chunk = allCalls.slice(i, i + BATCH_SIZE)
    const batch = await rpcBatch(chunk)
    for (let j = 0; j < batch.length; j++) results[i + j] = batch[j]
    if (i + BATCH_SIZE < allCalls.length) await sleep(550)
  }
  // Retry nulls
  const nullIdxs = results.map((r, i) => r === null ? i : -1).filter(i => i >= 0)
  if (nullIdxs.length > 0) {
    await sleep(1200)
    const retryCalls = nullIdxs.map(i => allCalls[i])
    for (let i = 0; i < retryCalls.length; i += BATCH_SIZE) {
      const chunk = retryCalls.slice(i, i + BATCH_SIZE)
      const batch = await rpcBatch(chunk)
      for (let j = 0; j < batch.length; j++) {
        if (batch[j]) results[nullIdxs[i + j]] = batch[j]
      }
      if (i + BATCH_SIZE < retryCalls.length) await sleep(550)
    }
  }
  return results
}

function decodeString(hex: string, wordIndex: number): string {
  const pointer = Number('0x' + hex.slice(wordIndex * 64, wordIndex * 64 + 64))
  const lenStart = pointer * 2
  const len = Number('0x' + hex.slice(lenStart, lenStart + 64))
  const dataStart = lenStart + 64
  const dataHex = hex.slice(dataStart, dataStart + len * 2)
  const bytes = new Uint8Array(len)
  for (let i = 0; i < len; i++) bytes[i] = parseInt(dataHex.slice(i * 2, i * 2 + 2), 16)
  return new TextDecoder().decode(bytes)
}

async function getPoolBalance(): Promise<number> {
  const padded = REWARD_POOL_WALLET.slice(2).toLowerCase().padStart(64, '0')
  const [result] = await rpcBatch([{
    method: 'eth_call',
    params: [{ to: TCG_TOKEN, data: '0x70a08231' + padded }, 'latest'],
  }])
  return Number(BigInt(result || '0x0')) / 1e18
}

// POST /api/rewards/distribute — calculate and execute weekly distribution
// Protected by API key
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const apiKey = body.apiKey || req.headers.get('x-api-key')
  
  const deployerKey = process.env.DEPLOYER_PRIVATE_KEY
  const apiSecret = process.env.REWARDS_API_SECRET
  if (!apiSecret || apiKey !== apiSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const dryRun = body.dryRun === true

  // 1. Get total NFT supply
  const [tsResult] = await rpcBatch([{
    method: 'eth_call',
    params: [{ to: NFT_CONTRACT, data: '0x18160ddd' }, 'latest'],
  }])
  const totalSupply = Number(BigInt(tsResult || '0x0'))

  if (totalSupply === 0) {
    return NextResponse.json({ error: 'No NFTs minted yet', totalSupply: 0 })
  }

  // 2. Get all owners + card data
  const allCalls: { method: string; params: any[] }[] = []
  for (let j = 0; j < totalSupply; j++) {
    const id = j.toString(16).padStart(64, '0')
    allCalls.push({ method: 'eth_call', params: [{ to: NFT_CONTRACT, data: '0x6352211e' + id }, 'latest'] })
    allCalls.push({ method: 'eth_call', params: [{ to: NFT_CONTRACT, data: '0x8dc10768' + id }, 'latest'] })
  }
  const results = await rpcThrottled(allCalls)

  // 3. Calculate scores per wallet
  const scores: Record<string, number> = {}
  for (let j = 0; j < totalSupply; j++) {
    const ownerResult = results[j * 2]
    const cardResult = results[j * 2 + 1]
    if (!ownerResult || !cardResult) continue

    const owner = '0x' + (ownerResult as string).slice(26).toLowerCase()
    if (owner === '0x0000000000000000000000000000000000000000') continue
    // Skip reward pool wallet itself
    if (owner === REWARD_POOL_WALLET.toLowerCase()) continue

    try {
      const data = (cardResult as string).slice(2)
      if (data.length < 192) continue
      const grade = Number('0x' + data.slice(128, 192))
      const rarity = decodeString(data, 1)
      const points = (RARITY_POINTS[rarity] || 1) * gradeMultiplier(grade)
      scores[owner] = (scores[owner] || 0) + points
    } catch { continue }
  }

  // 3b. Get TCG balances for holding boost
  const wallets = Object.keys(scores)
  const balanceCalls: { method: string; params: any[] }[] = wallets.map(w => ({
    method: 'eth_call',
    params: [{ to: TCG_TOKEN, data: '0x70a08231' + w.slice(2).padStart(64, '0') }, 'latest'],
  }))
  const balResults = await rpcThrottled(balanceCalls)
  const tcgBalances: Record<string, number> = {}
  wallets.forEach((w, i) => {
    tcgBalances[w] = balResults[i] ? Number(BigInt(balResults[i])) / 1e18 : 0
  })

  // Apply holding boost to scores
  const boostedScores: Record<string, number> = {}
  for (const [wallet, score] of Object.entries(scores)) {
    const bal = tcgBalances[wallet] || 0
    const boost = bal >= 500000 ? 3 : bal >= 100000 ? 2 : bal >= 50000 ? 1.5 : 1
    boostedScores[wallet] = score * boost
  }

  const totalScore = Object.values(boostedScores).reduce((s, v) => s + v, 0)
  if (totalScore === 0) {
    return NextResponse.json({ error: 'No staked score found', totalSupply })
  }

  // 4. Get pool balance and calculate distribution using dynamic rate
  const poolBalance = await getPoolBalance()
  // Dynamic rate: 10% weeks 1-2, 7% weeks 3-4, 5% weeks 5-8, 3% week 9+
  const LAUNCH = new Date('2026-02-14T00:00:00Z').getTime()
  const weeks = Math.max(0, Math.floor((Date.now() - LAUNCH) / (7 * 24 * 60 * 60 * 1000)))
  const rate = weeks < 2 ? 0.10 : weeks < 4 ? 0.07 : weeks < 8 ? 0.05 : 0.03
  const weeklyDistribution = poolBalance * rate

  if (weeklyDistribution < 1) {
    return NextResponse.json({ error: 'Pool too small for distribution', poolBalance })
  }

  // 5. Calculate payouts using boosted scores
  const payouts = Object.entries(boostedScores)
    .map(([wallet, score]) => ({
      wallet,
      score,
      rawScore: scores[wallet] || 0,
      tcgHeld: tcgBalances[wallet] || 0,
      boost: score / (scores[wallet] || 1),
      share: score / totalScore,
      amount: Math.floor((score / totalScore) * weeklyDistribution),
    }))
    .filter(p => p.amount >= 1) // min 1 TCG
    .sort((a, b) => b.amount - a.amount)

  if (dryRun) {
    return NextResponse.json({
      dryRun: true,
      poolBalance,
      weeklyDistribution,
      totalScore,
      totalStakers: payouts.length,
      payouts: payouts.slice(0, 50),
      totalPayout: payouts.reduce((s, p) => s + p.amount, 0),
    })
  }

  // 6. Execute transfers from pool wallet
  const account = privateKeyToAccount(`0x${deployerKey}` as `0x${string}`)
  const client = createWalletClient({
    account,
    chain: { id: 143, name: 'Monad', nativeCurrency: { name: 'MON', symbol: 'MON', decimals: 18 }, rpcUrls: { default: { http: [RPC_URL] } } },
    transport: http(RPC_URL),
  })

  const txResults: { wallet: string; amount: number; txHash?: string; error?: string }[] = []

  for (const payout of payouts) {
    try {
      const hash = await client.writeContract({
        address: TCG_TOKEN as `0x${string}`,
        abi: [{
          name: 'transfer',
          type: 'function',
          stateMutability: 'nonpayable',
          inputs: [{ name: 'to', type: 'address' }, { name: 'amount', type: 'uint256' }],
          outputs: [{ name: '', type: 'bool' }],
        }],
        functionName: 'transfer',
        args: [payout.wallet as `0x${string}`, parseEther(String(payout.amount))],
      })
      txResults.push({ wallet: payout.wallet, amount: payout.amount, txHash: hash })
      await sleep(600) // rate limit
    } catch (err: any) {
      txResults.push({ wallet: payout.wallet, amount: payout.amount, error: err.message?.slice(0, 100) })
    }
  }

  return NextResponse.json({
    success: true,
    poolBalance,
    weeklyDistribution,
    totalScore,
    totalStakers: payouts.length,
    totalPayout: payouts.reduce((s, p) => s + p.amount, 0),
    results: txResults,
  })
}
