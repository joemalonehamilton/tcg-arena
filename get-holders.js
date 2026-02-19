// Get all TCG token holders from Transfer events
const RPC_URL = 'https://rpc.monad.xyz'
const TCG_TOKEN = '0x94CF69B5b13E621cB11f5153724AFb58c7337777'
const TRANSFER_TOPIC = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
const ZERO = '0x0000000000000000000000000000000000000000'

// Wallets to exclude from airdrop (deployer, treasury, dead, etc)
const EXCLUDE = new Set([
  '0xb929be8f1e0fb962471d8ebcd9899b09f0bd65ec', // deployer
  '0xa6e213507b2d10586d1c906b3297f849225ff981', // kevin
  '0x0000000000000000000000000000000000000000',
  '0x000000000000000000000000000000000000dead',
])

async function rpc(method, params) {
  const r = await fetch(RPC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params })
  })
  const j = await r.json()
  if (j.error) throw new Error(JSON.stringify(j.error))
  return j.result
}

async function main() {
  // Get all Transfer events in chunks
  const latestBlock = await rpc('eth_blockNumber', [])
  console.error(`Latest block: ${parseInt(latestBlock, 16)}`)
  
  const allLogs = []
  const chunkSize = 100000
  const latest = parseInt(latestBlock, 16)
  
  for (let from = 0; from <= latest; from += chunkSize) {
    const to = Math.min(from + chunkSize - 1, latest)
    try {
      const logs = await rpc('eth_getLogs', [{
        address: TCG_TOKEN,
        topics: [TRANSFER_TOPIC],
        fromBlock: '0x' + from.toString(16),
        toBlock: '0x' + to.toString(16)
      }])
      allLogs.push(...logs)
      if (logs.length > 0) console.error(`Blocks ${from}-${to}: ${logs.length} transfers`)
    } catch (e) {
      console.error(`Error at ${from}-${to}: ${e.message}`)
      // Try smaller chunks
      const smallChunk = 10000
      for (let sf = from; sf <= to; sf += smallChunk) {
        const st = Math.min(sf + smallChunk - 1, to)
        try {
          const logs = await rpc('eth_getLogs', [{
            address: TCG_TOKEN,
            topics: [TRANSFER_TOPIC],
            fromBlock: '0x' + sf.toString(16),
            toBlock: '0x' + st.toString(16)
          }])
          allLogs.push(...logs)
        } catch (e2) {
          console.error(`  Sub-error at ${sf}-${st}: ${e2.message}`)
        }
      }
    }
  }
  
  console.error(`Total transfer events: ${allLogs.length}`)
  
  // Build balances from transfers
  const balances = {}
  for (const log of allLogs) {
    const from = '0x' + log.topics[1].slice(26).toLowerCase()
    const to = '0x' + log.topics[2].slice(26).toLowerCase()
    const value = BigInt(log.data)
    
    if (!balances[from]) balances[from] = 0n
    if (!balances[to]) balances[to] = 0n
    balances[from] -= value
    balances[to] += value
  }
  
  // Filter positive balances, exclude known wallets
  const holders = Object.entries(balances)
    .filter(([addr, bal]) => bal > 0n && !EXCLUDE.has(addr))
    .sort((a, b) => (b[1] > a[1] ? 1 : -1))
  
  console.error(`\nHolders with balance: ${holders.length}`)
  console.error(`\nAddress,Balance`)
  
  // Output as JSON for the airdrop script
  const result = holders.map(([addr, bal]) => ({
    address: addr,
    balance: bal.toString()
  }))
  
  console.log(JSON.stringify(result, null, 2))
}

main().catch(e => { console.error(e); process.exit(1) })
