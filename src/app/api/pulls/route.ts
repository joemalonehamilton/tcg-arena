import { NextRequest, NextResponse } from 'next/server'

const NFT_CONTRACT = '0x1931c88707Eb36e0EF3e235589724Ce7faEa0889'
const RPC_URL = 'https://rpc.monad.xyz'

// Rarity point values
const RARITY_POINTS: Record<string, number> = {
  common: 1,
  uncommon: 5,
  rare: 25,
  legendary: 200,
  mythic: 2000,
}

function gradeMultiplier(grade: number): number {
  if (grade === 10) return 10
  if (grade === 9) return 3
  if (grade === 8) return 1.5
  return 1
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

// Batch RPC call — send multiple calls in one request
// Monad RPC has 25 req/s limit — each call in a batch counts separately
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
  for (const r of arr) {
    if (r.result) byId[r.id] = r.result
  }
  return calls.map((_, i) => byId[i] ?? null)
}

// Throttled sequential batching with retry — respects 25 req/s limit
async function rpcThrottled(allCalls: { method: string; params: any[] }[]): Promise<any[]> {
  const BATCH_SIZE = 10
  const results: any[] = new Array(allCalls.length).fill(null)
  for (let i = 0; i < allCalls.length; i += BATCH_SIZE) {
    const chunk = allCalls.slice(i, i + BATCH_SIZE)
    const batch = await rpcBatch(chunk)
    for (let j = 0; j < batch.length; j++) results[i + j] = batch[j]
    if (i + BATCH_SIZE < allCalls.length) await sleep(500)
  }
  // Retry any nulls (rate-limited calls)
  const nullIdxs = results.map((r, i) => r === null ? i : -1).filter(i => i >= 0)
  if (nullIdxs.length > 0) {
    await sleep(1200) // wait for rate limit to reset
    const retryCalls = nullIdxs.map(i => allCalls[i])
    for (let i = 0; i < retryCalls.length; i += BATCH_SIZE) {
      const chunk = retryCalls.slice(i, i + BATCH_SIZE)
      const batch = await rpcBatch(chunk)
      for (let j = 0; j < batch.length; j++) {
        if (batch[j]) results[nullIdxs[i + j]] = batch[j]
      }
      if (i + BATCH_SIZE < retryCalls.length) await sleep(500)
    }
  }
  return results
}

async function rpcCall(method: string, params: any[]) {
  const [result] = await rpcBatch([{ method, params }])
  return result
}

// Read totalSupply
async function getTotalSupply(): Promise<number> {
  const result = await rpcCall('eth_call', [
    { to: NFT_CONTRACT, data: '0x18160ddd' },
    'latest',
  ])
  return Number(BigInt(result || '0x0'))
}

// Read ownerOf(tokenId)
async function getOwner(tokenId: number): Promise<string> {
  const id = tokenId.toString(16).padStart(64, '0')
  const result = await rpcCall('eth_call', [
    { to: NFT_CONTRACT, data: '0x6352211e' + id },
    'latest',
  ])
  return '0x' + (result || '').slice(26).toLowerCase()
}

// Decode a string from ABI-encoded data given a word index containing the byte-offset pointer
function decodeString(hex: string, wordIndex: number): string {
  // Read the byte-offset pointer at wordIndex
  const pointer = Number('0x' + hex.slice(wordIndex * 64, wordIndex * 64 + 64))
  // pointer is byte offset from start → convert to hex char offset
  const lenStart = pointer * 2
  const len = Number('0x' + hex.slice(lenStart, lenStart + 64))
  const dataStart = lenStart + 64
  const dataHex = hex.slice(dataStart, dataStart + len * 2)
  const bytes = new Uint8Array(len)
  for (let i = 0; i < len; i++) {
    bytes[i] = parseInt(dataHex.slice(i * 2, i * 2 + 2), 16)
  }
  return new TextDecoder().decode(bytes)
}

// Read cards(tokenId) — returns (name, rarity, grade, packType)
// cards(uint256) selector = 0x8dc10768
async function getCard(tokenId: number): Promise<{ name: string; rarity: string; grade: number; packType: string } | null> {
  const id = tokenId.toString(16).padStart(64, '0')
  try {
    const result = await rpcCall('eth_call', [
      { to: NFT_CONTRACT, data: '0x8dc10768' + id },
      'latest',
    ])
    if (!result || result === '0x' || result.length < 130) return null
    // Strip 0x prefix
    const data = result.slice(2)
    // ABI: (string name, string rarity, uint8 grade, string packType)
    // Word 0: offset to name, Word 1: offset to rarity, Word 2: grade, Word 3: offset to packType
    const grade = Number('0x' + data.slice(128, 192))
    const name = decodeString(data, 0)
    const rarity = decodeString(data, 1)
    const packType = decodeString(data, 3)
    return { name, rarity, grade, packType }
  } catch {
    return null
  }
}

// GET /api/pulls?leaderboard=1 — leaderboard from on-chain NFTs
// GET /api/pulls?wallet=0x... — wallet's cards from on-chain
export async function GET(req: NextRequest) {
  const wallet = req.nextUrl.searchParams.get('wallet')
  const leaderboard = req.nextUrl.searchParams.get('leaderboard')

  const total = await getTotalSupply()

  if (leaderboard) {
    const scores: Record<string, { score: number; cards: number; legendaries: number; psa10s: number; bestCard: string; bestRarity: string; bestScore: number }> = {}
    const debug = req.nextUrl.searchParams.get('debug') === '1'
    const debugLog: string[] = []

    // Build all RPC calls (2 per token: ownerOf + cards)
    const allCalls: { method: string; params: any[] }[] = []
    for (let j = 0; j < total; j++) {
      const id = j.toString(16).padStart(64, '0')
      allCalls.push({ method: 'eth_call', params: [{ to: NFT_CONTRACT, data: '0x6352211e' + id }, 'latest'] })
      allCalls.push({ method: 'eth_call', params: [{ to: NFT_CONTRACT, data: '0x8dc10768' + id }, 'latest'] })
    }

    const results = await rpcThrottled(allCalls)
    if (debug) debugLog.push(`total calls: ${allCalls.length}, nulls: ${results.filter(r => r === null).length}`)

    for (let j = 0; j < total; j++) {
      const ownerResult = results[j * 2]
      const cardResult = results[j * 2 + 1]

      if (!ownerResult || !cardResult) {
        if (debug) debugLog.push(`token ${j}: skip owner=${!!ownerResult} card=${!!cardResult}`)
        continue
      }
      const owner = '0x' + (ownerResult || '').slice(26).toLowerCase()
      if (!owner || owner === '0x0000000000000000000000000000000000000000') continue

      try {
        const data = (cardResult as string).slice(2)
        if (data.length < 192) { if (debug) debugLog.push(`token ${j}: data too short ${data.length}`); continue }
        const grade = Number('0x' + data.slice(128, 192))
        const name = decodeString(data, 0)
        const rarity = decodeString(data, 1)
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
      } catch (e: any) { if (debug) debugLog.push(`token ${j}: decode error ${e.message}`); continue }
    }

    const lb = Object.entries(scores)
      .map(([w, data]) => ({ wallet: w, ...data }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 50)

    return NextResponse.json({ leaderboard: lb, totalNFTs: total, ...(debug ? { debug: debugLog } : {}) })
  }

  if (wallet) {
    const walletLower = wallet.toLowerCase()
    const cards: any[] = []

    const wCalls: { method: string; params: any[] }[] = []
    for (let j = 0; j < total; j++) {
      const id = j.toString(16).padStart(64, '0')
      wCalls.push({ method: 'eth_call', params: [{ to: NFT_CONTRACT, data: '0x6352211e' + id }, 'latest'] })
      wCalls.push({ method: 'eth_call', params: [{ to: NFT_CONTRACT, data: '0x8dc10768' + id }, 'latest'] })
    }
    const wResults = await rpcThrottled(wCalls)
    for (let j = 0; j < total; j++) {
      const owner = '0x' + ((wResults[j * 2] || '') as string).slice(26).toLowerCase()
      if (owner !== walletLower) continue
        try {
          const data = (wResults[j * 2 + 1] as string).slice(2)
          if (data.length < 192) continue
          const grade = Number('0x' + data.slice(128, 192))
          const name = decodeString(data, 0)
          const rarity = decodeString(data, 1)
          const packType = decodeString(data, 3)
          cards.push({ tokenId: j, name, rarity, grade, packType })
        } catch { continue }
    }

    return NextResponse.json({ cards, total: cards.length })
  }

  return NextResponse.json({ error: 'Provide wallet or leaderboard=1', totalNFTs: total }, { status: 400 })
}

// Keep POST for backward compat (redirects to mint)
export async function POST() {
  return NextResponse.json({ error: 'Use /api/pulls/mint instead' }, { status: 301 })
}
