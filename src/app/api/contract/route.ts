import { NextResponse } from 'next/server'

const CONTRACT_ADDRESS = (process.env.SEASON_SEAL_ADDRESS || '0x5900E83003F6c3Dc13f0fD719EB161ffB4974f80').replace(/[\s\n\r]/g, '')
const MONAD_EXPLORER = 'https://monadscan.com'

export async function GET() {
  try {
    // Read Season 01 data from the contract via RPC
    const provider = 'https://rpc.monad.xyz'

    // Call totalSeasons() — selector 0xd5b47fd8
    const totalRes = await fetch(provider, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0', method: 'eth_call', id: 1,
        params: [{ to: CONTRACT_ADDRESS, data: '0xd5b47fd8' }, 'latest']
      }),
      cache: 'no-store',
    })
    const totalData = await totalRes.json()
    const totalSeasons = parseInt(totalData.result, 16)

    // Get Season 0 data if exists
    let season01 = null
    if (totalSeasons > 0) {
      // getSeason(0) — selector 0xa43d8654
      const seasonRes = await fetch(provider, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0', method: 'eth_call', id: 2,
          params: [{
            to: CONTRACT_ADDRESS,
            data: '0xa43d86540000000000000000000000000000000000000000000000000000000000000000'
          }, 'latest']
        }),
        cache: 'no-store',
      })
      const seasonData = await seasonRes.json()

      if (seasonData.result && seasonData.result !== '0x') {
        const hex = seasonData.result.slice(2)
        // Struct layout: offset(w0) + cardSetHash(w1) + ipfsURI_offset(w2) + timestamp(w3) + agentCount(w4) + cardCount(w5) + ipfsLen(w6) + ipfsData(w7)
        const w = (i: number) => hex.slice(i * 64, (i + 1) * 64)
        const cardSetHash = '0x' + w(1)
        const timestamp = parseInt(w(3), 16)
        const agentCount = parseInt(w(4), 16)
        const cardCount = parseInt(w(5), 16)

        season01 = { cardSetHash, timestamp, agentCount, cardCount }
      }
    }

    return NextResponse.json({
      contract: CONTRACT_ADDRESS,
      explorer: `${MONAD_EXPLORER}/address/${CONTRACT_ADDRESS}`,
      chain: 'Monad',
      chainId: 143,
      totalSeasons,
      season01,
      sealTx: '0x29e2e7a8b136659b6aebb871f31320ef1d25e6f2281d17b5ab01adbc179aa560',
      sealExplorer: `${MONAD_EXPLORER}/tx/0x29e2e7a8b136659b6aebb871f31320ef1d25e6f2281d17b5ab01adbc179aa560`,
    })
  } catch (err) {
    return NextResponse.json({
      contract: CONTRACT_ADDRESS,
      explorer: `${MONAD_EXPLORER}/address/${CONTRACT_ADDRESS}`,
      chain: 'Monad',
      chainId: 143,
      error: err instanceof Error ? err.message : 'Failed to read contract',
    })
  }
}
