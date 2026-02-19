import { NextRequest, NextResponse } from 'next/server'
import { execute } from '@/lib/turso'
import { getPackCost } from '@/lib/token-economy'
import { openPackServer } from '@/lib/packs-server'

const NFT_CONTRACT = '0x1931c88707Eb36e0EF3e235589724Ce7faEa0889'
const TCG_TOKEN = '0x94CF69B5b13E621cB11f5153724AFb58c7337777'
const BURN_ADDRESS = '0x000000000000000000000000000000000000dEaD'
const TREASURY_ADDRESS = '0xb929Be8f1e0Fb962471d8EbcD9899b09f0BD65eC'
const RPC_URL = 'https://rpc.monad.xyz'
const DEPLOYER_KEY = (process.env.DEPLOYER_PRIVATE_KEY || '').trim().replace(/\\n/g, '')

// Verify payment by looking up the specific transaction receipt
async function verifyPayment(txHash: string, wallet: string, packType: string): Promise<{ verified: boolean; error?: string }> {
  const cost = getPackCost(packType)
  const walletLower = wallet.toLowerCase().replace('0x', '').padStart(64, '0')
  const treasuryTarget = TREASURY_ADDRESS.toLowerCase().replace('0x', '').padStart(64, '0')
  const transferTopic = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'

  try {
    // Get the specific transaction receipt — no block window issues
    const receiptRes = await fetch(RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', method: 'eth_getTransactionReceipt', id: 1, params: [txHash] }),
    })
    const receiptData = await receiptRes.json()
    const receipt = receiptData.result

    if (!receipt) {
      // TX might still be pending — try a few times
      return { verified: false, error: 'Transaction not yet confirmed. Try again in a few seconds.' }
    }

    if (receipt.status !== '0x1') {
      return { verified: false, error: 'Transaction failed on-chain' }
    }

    // Verify the TX is on the TCG token contract
    const minAmount = BigInt(Math.floor(cost * 0.9)) * BigInt(10 ** 18)

    for (const log of (receipt.logs || [])) {
      if (log.address?.toLowerCase() !== TCG_TOKEN.toLowerCase()) continue
      if (log.topics?.[0] !== transferTopic) continue

      const from = log.topics[1]?.slice(2)?.toLowerCase()
      const to = log.topics[2]?.slice(2)?.toLowerCase()
      const amount = BigInt(log.data || '0x0')

      if (from === walletLower && to === treasuryTarget && amount >= minAmount) {
        return { verified: true }
      }
    }

    return { verified: false, error: `No qualifying payment found in tx ${txHash}` }
  } catch (err) {
    console.error('Payment verification error:', err)
    return { verified: false, error: 'Payment verification failed - try again' }
  }
}

/**
 * POST /api/pulls/mint — generate cards server-side + mint NFTs
 * Body: { wallet, packType, txHash }
 * Cards are generated SERVER-SIDE (not from client) to prevent manipulation.
 * Verifies payment on-chain via tx receipt, then mints each card as an ERC-721 NFT.
 */
export async function POST(req: NextRequest) {
  try {
    const { wallet, packType, referrer, txHash } = await req.json()
    if (!wallet || !packType || !txHash) {
      return NextResponse.json({ error: 'wallet, packType, txHash required' }, { status: 400 })
    }

    // Dedup: check if txHash already used (DB-level defense)
    const dupCheck = await execute(`SELECT 1 FROM card_pulls WHERE tx_hash = ? LIMIT 1`, [txHash])
    if (dupCheck.rows?.length) {
      return NextResponse.json({ error: 'Transaction already used for minting' }, { status: 403 })
    }

    if (!DEPLOYER_KEY) {
      return NextResponse.json({ error: 'Minting not configured' }, { status: 503 })
    }

    // Verify payment on-chain via tx receipt (not block scanning)
    const payment = await verifyPayment(txHash, wallet, packType)
    if (!payment.verified) {
      return NextResponse.json({ error: 'Payment not verified: ' + payment.error }, { status: 403 })
    }

    // Generate cards SERVER-SIDE — prevents client manipulation
    const serverCards = openPackServer(packType)

    const { Wallet, JsonRpcProvider, Contract } = await import('ethers')
    const provider = new JsonRpcProvider(RPC_URL)
    const signer = new Wallet(DEPLOYER_KEY, provider)

    const abi = [
      'function mintBatch(address to, string[] names, string[] rarities, uint8[] grades, string packType) returns (uint256[])',
    ]
    const nftContract = new Contract(NFT_CONTRACT, abi, signer)

    const names = serverCards.map(c => c.name)
    const rarities = serverCards.map(c => c.rarity)
    const grades = serverCards.map(c => c.grade)

    const tx = await nftContract.mintBatch(wallet, names, rarities, grades, packType)
    const receipt = await tx.wait()

    // Parse CardMinted events to get token IDs
    const mintTopic = '0xcdc4a2297e1719bc0efbbd70efbf867f20801457f89caef0ba2e23b00a8d415e'
    const tokenIds: number[] = []
    for (const log of receipt.logs) {
      if (log.topics[0] === mintTopic) {
        tokenIds.push(Number(BigInt(log.topics[1])))
      }
    }

    // Log each pull to DB with NFT token ID
    const walletLower = wallet.toLowerCase()
    for (let i = 0; i < serverCards.length; i++) {
      const card = serverCards[i]
      const nftId = tokenIds[i] ?? null
      await execute(
        `INSERT INTO card_pulls (wallet_address, card_name, rarity, grade, pack_type, nft_token_id, tx_hash, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
        [walletLower, card.name, card.rarity, card.grade, packType, nftId, txHash]
      )
    }

    // Server-side burn: send 50% of pack cost from treasury to 0xdead
    const cost = getPackCost(packType)
    const burnAmount = Math.floor(cost * 0.5)
    try {
      const tcgAbi = ['function transfer(address to, uint256 amount) returns (bool)']
      const tcgContract = new Contract(TCG_TOKEN, tcgAbi, signer)
      const burnTx = await tcgContract.transfer(BURN_ADDRESS, BigInt(burnAmount) * BigInt(10 ** 18))
      await burnTx.wait()
    } catch (burnErr) {
      console.error('Server-side burn failed (non-critical):', burnErr)
    }

    // Log referral if provided
    if (referrer && referrer !== walletLower) {
      try {
        await execute(
          `INSERT INTO referrals (referrer, referred, pack_type, tcg_amount) VALUES (?, ?, ?, ?)`,
          [referrer.toLowerCase(), walletLower, packType, cost]
        )
      } catch { /* table might not exist yet, non-critical */ }
    }

    return NextResponse.json({
      success: true,
      cards: serverCards.map((c, i) => ({
        name: c.name,
        rarity: c.rarity,
        grade: c.grade,
        gradeInfo: c.gradeInfo,
        imageUrl: c.imageUrl,
        power: c.power,
        toughness: c.toughness,
        cost: c.cost,
        type: c.type,
        abilities: c.abilities,
        flavor: c.flavor,
        tokenId: tokenIds[i] ?? null,
      })),
      txHash: receipt.hash,
      tokenIds,
      explorer: `https://monadscan.com/tx/${receipt.hash}`,
      nftContract: NFT_CONTRACT,
    })
  } catch (err) {
    console.error('Mint error:', err)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Mint failed' }, { status: 500 })
  }
}
