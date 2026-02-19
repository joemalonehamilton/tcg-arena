const { Wallet, JsonRpcProvider, Contract, parseEther } = require('ethers')
const fs = require('fs')

const RPC_URL = 'https://rpc.monad.xyz'
const TCG_TOKEN = '0x94CF69B5b13E621cB11f5153724AFb58c7337777'
const TREASURY = '0xb929Be8f1e0Fb962471d8EbcD9899b09f0BD65eC'
const TARGET_TOTAL = 500_000_000 // 500M TCG to move

const ERC20_ABI = [
  'function transfer(address to, uint256 amount) returns (bool)',
  'function balanceOf(address) view returns (uint256)',
]

async function main() {
  const provider = new JsonRpcProvider(RPC_URL)
  const wallets = JSON.parse(fs.readFileSync('/Users/kevinhe/.openclaw/workspace/tcg-wallets/wallets_v2.json'))
  const endWallets = wallets.end_wallets

  // Get all balances first
  console.log('Checking balances...')
  const balances = []
  for (const w of endWallets) {
    const signer = new Wallet(w.private_key, provider)
    const tcg = new Contract(TCG_TOKEN, ERC20_ABI, signer)
    const bal = await tcg.balanceOf(w.address)
    const balNum = Number(bal / BigInt(10**18))
    balances.push({ address: w.address, key: w.private_key, balance: balNum, balanceWei: bal })
    console.log(`  ${w.address}: ${balNum.toLocaleString()} TCG`)
    await new Promise(r => setTimeout(r, 500))
  }

  const totalAvailable = balances.reduce((s, b) => s + b.balance, 0)
  console.log(`\nTotal available: ${totalAvailable.toLocaleString()} TCG`)
  console.log(`Target to move: ${TARGET_TOTAL.toLocaleString()} TCG`)
  
  // Calculate how much each wallet sends (proportional, keeping ~100M total)
  const keepTotal = totalAvailable - TARGET_TOTAL
  const keepPerWallet = Math.floor(keepTotal / balances.length)
  
  console.log(`Keeping ~${keepPerWallet.toLocaleString()} per wallet (${keepTotal.toLocaleString()} total)\n`)

  let totalMoved = 0
  let txCount = 0

  for (const w of balances) {
    const sendAmount = w.balance - keepPerWallet
    if (sendAmount <= 0) {
      console.log(`  ${w.address.slice(0,10)}... skip (balance ${w.balance.toLocaleString()} <= keep ${keepPerWallet.toLocaleString()})`)
      continue
    }

    try {
      const signer = new Wallet(w.key, provider)
      const tcg = new Contract(TCG_TOKEN, ERC20_ABI, signer)
      const amountWei = BigInt(sendAmount) * BigInt(10**18)
      
      console.log(`  ${w.address.slice(0,10)}... sending ${sendAmount.toLocaleString()} TCG...`)
      const tx = await tcg.transfer(TREASURY, amountWei)
      await tx.wait()
      console.log(`    ✓ TX: ${tx.hash}`)
      totalMoved += sendAmount
      txCount++
      await new Promise(r => setTimeout(r, 1000)) // rate limit
    } catch (err) {
      console.log(`    ✗ ERROR: ${err.message?.slice(0, 80)}`)
    }
  }

  console.log(`\nDone! Moved ${totalMoved.toLocaleString()} TCG in ${txCount} transactions`)
}

main().catch(console.error)
