import { NextRequest, NextResponse } from 'next/server'
import { execute } from '@/lib/turso'

// GET /api/pulls/cache — return cached leaderboard + collection data (fast)
// POST /api/pulls/cache — refresh the cache from on-chain (slow, called by cron)

const NFT_CONTRACT = '0x1931c88707Eb36e0EF3e235589724Ce7faEa0889'
const RPC_URL = 'https://rpc.monad.xyz'

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

async function ensureTable() {
  await execute(`CREATE TABLE IF NOT EXISTS leaderboard_cache (
    id INTEGER PRIMARY KEY DEFAULT 1,
    data TEXT NOT NULL,
    updated_at TEXT DEFAULT (datetime('now'))
  )`)
}

// GET — return cached data (instant)
export async function GET() {
  try {
    await ensureTable()
    const result = await execute('SELECT data, updated_at FROM leaderboard_cache WHERE id = 1')
    if (result.rows?.length) {
      const data = JSON.parse(result.rows[0].data as string)
      return NextResponse.json({
        ...data,
        cached: true,
        cachedAt: result.rows[0].updated_at,
      })
    }
    return NextResponse.json({ leaderboard: [], totalNFTs: 0, cached: false })
  } catch {
    return NextResponse.json({ leaderboard: [], totalNFTs: 0, cached: false })
  }
}

// POST — refresh cache from on-chain
export async function POST() {
  try {
    // Get total supply
    const [tsResult] = await rpcBatch([{
      method: 'eth_call',
      params: [{ to: NFT_CONTRACT, data: '0x18160ddd' }, 'latest'],
    }])
    const total = Number(BigInt(tsResult || '0x0'))

    if (total === 0) {
      return NextResponse.json({ refreshed: true, totalNFTs: 0 })
    }

    // Fetch all owners + cards
    const allCalls: { method: string; params: any[] }[] = []
    for (let j = 0; j < total; j++) {
      const id = j.toString(16).padStart(64, '0')
      allCalls.push({ method: 'eth_call', params: [{ to: NFT_CONTRACT, data: '0x6352211e' + id }, 'latest'] })
      allCalls.push({ method: 'eth_call', params: [{ to: NFT_CONTRACT, data: '0x8dc10768' + id }, 'latest'] })
    }
    const results = await rpcThrottled(allCalls)

    // Build leaderboard + per-wallet card lists
    const scores: Record<string, { score: number; cards: number; legendaries: number; psa10s: number; bestCard: string; bestRarity: string; bestScore: number }> = {}
    const walletCards: Record<string, any[]> = {}

    for (let j = 0; j < total; j++) {
      const ownerResult = results[j * 2]
      const cardResult = results[j * 2 + 1]
      if (!ownerResult || !cardResult) continue

      const owner = '0x' + (ownerResult as string).slice(26).toLowerCase()
      if (owner === '0x0000000000000000000000000000000000000000') continue

      try {
        const data = (cardResult as string).slice(2)
        if (data.length < 192) continue
        const grade = Number('0x' + data.slice(128, 192))
        const name = decodeString(data, 0)
        const rarity = decodeString(data, 1)
        const packType = decodeString(data, 3)
        const points = (RARITY_POINTS[rarity] || 1) * gradeMultiplier(grade)

        if (!scores[owner]) scores[owner] = { score: 0, cards: 0, legendaries: 0, psa10s: 0, bestCard: '', bestRarity: 'common', bestScore: 0 }
        scores[owner].score += points
        scores[owner].cards++
        if (rarity === 'legendary' || rarity === 'mythic') scores[owner].legendaries++
        if (grade === 10) scores[owner].psa10s++
        if (points > scores[owner].bestScore) {
          scores[owner].bestCard = name
          scores[owner].bestRarity = rarity
          scores[owner].bestScore = points
        }

        if (!walletCards[owner]) walletCards[owner] = []
        walletCards[owner].push({ tokenId: j, name, rarity, grade, packType })
      } catch { continue }
    }

    const leaderboard = Object.entries(scores)
      .map(([w, data]) => ({ wallet: w, ...data }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 100)

    const cacheData = { leaderboard, totalNFTs: total, walletCards }

    // Write to DB
    await ensureTable()
    await execute(
      `INSERT INTO leaderboard_cache (id, data, updated_at) VALUES (1, ?, datetime('now'))
       ON CONFLICT(id) DO UPDATE SET data = ?, updated_at = datetime('now')`,
      [JSON.stringify(cacheData), JSON.stringify(cacheData)]
    )

    return NextResponse.json({ refreshed: true, totalNFTs: total, collectors: leaderboard.length })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Cache refresh failed' }, { status: 500 })
  }
}
