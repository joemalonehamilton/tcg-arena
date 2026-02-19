import { NextRequest, NextResponse } from 'next/server'
import { execute } from '@/lib/turso'
import { getPackCost } from '@/lib/token-economy'
import { openPackServer } from '@/lib/packs-server'

const NFT_CONTRACT = '0x1931c88707Eb36e0EF3e235589724Ce7faEa0889'
const RPC_URL = 'https://rpc.monad.xyz'
const DEPLOYER_KEY = (process.env.DEPLOYER_PRIVATE_KEY || '').trim().replace(/\\n/g, '')
const ADMIN_KEY = process.env.TCG_ADMIN_KEY || ''

/**
 * POST /api/pulls/gift — gift packs to a wallet
 * 
 * Two modes:
 * 1. Admin gift (free): requires admin API key, no payment needed
 *    Body: { recipient, packType, count?, adminKey }
 * 
 * 2. Friend gift (paid): sender pays TCG, cards go to recipient
 *    Body: { recipient, packType, sender, txHash }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { recipient, packType, count, adminKey, sender, txHash } = body

    if (!recipient || !packType) {
      return NextResponse.json({ error: 'recipient and packType required' }, { status: 400 })
    }

    // Validate recipient is a valid address
    if (!/^0x[a-fA-F0-9]{40}$/.test(recipient)) {
      return NextResponse.json({ error: 'Invalid recipient address' }, { status: 400 })
    }

    if (!DEPLOYER_KEY) {
      return NextResponse.json({ error: 'Minting not configured' }, { status: 503 })
    }

    const isAdminGift = !!adminKey
    const packCount = Math.min(isAdminGift ? (count || 1) : 1, 5) // max 5 packs at once

    // --- Admin gift mode ---
    if (isAdminGift) {
      if (!ADMIN_KEY || adminKey !== ADMIN_KEY) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }
    // --- Friend gift mode ---
    else {
      if (!sender || !txHash) {
        return NextResponse.json({ error: 'sender and txHash required for friend gifts' }, { status: 400 })
      }

      // Dedup check
      const dupCheck = await execute(`SELECT 1 FROM card_pulls WHERE tx_hash = ? LIMIT 1`, [txHash])
      if (dupCheck.rows?.length) {
        return NextResponse.json({ error: 'Transaction already used' }, { status: 403 })
      }

      // Verify payment via tx receipt
      const cost = getPackCost(packType)
      const senderLower = sender.toLowerCase().replace('0x', '').padStart(64, '0')
      const treasuryTarget = '0xb929Be8f1e0Fb962471d8EbcD9899b09f0BD65eC'.toLowerCase().replace('0x', '').padStart(64, '0')
      const transferTopic = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
      const TCG_TOKEN = '0x94CF69B5b13E621cB11f5153724AFb58c7337777'

      const receiptRes = await fetch(RPC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', method: 'eth_getTransactionReceipt', id: 1, params: [txHash] }),
      })
      const receiptData = await receiptRes.json()
      const receipt = receiptData.result

      if (!receipt) {
        return NextResponse.json({ error: 'Transaction not yet confirmed' }, { status: 403 })
      }
      if (receipt.status !== '0x1') {
        return NextResponse.json({ error: 'Transaction failed on-chain' }, { status: 403 })
      }

      const minAmount = BigInt(Math.floor(cost * 0.9)) * BigInt(10 ** 18)
      let paymentFound = false
      for (const log of (receipt.logs || [])) {
        if (log.address?.toLowerCase() !== TCG_TOKEN.toLowerCase()) continue
        if (log.topics?.[0] !== transferTopic) continue
        const from = log.topics[1]?.slice(2)?.toLowerCase()
        const to = log.topics[2]?.slice(2)?.toLowerCase()
        const amount = BigInt(log.data || '0x0')
        if (from === senderLower && to === treasuryTarget && amount >= minAmount) {
          paymentFound = true
          break
        }
      }

      if (!paymentFound) {
        return NextResponse.json({ error: 'Payment not verified' }, { status: 403 })
      }
    }

    // Mint cards for each pack
    const { Wallet, JsonRpcProvider, Contract } = await import('ethers')
    const provider = new JsonRpcProvider(RPC_URL)
    const signer = new Wallet(DEPLOYER_KEY, provider)
    const abi = ['function mintBatch(address to, string[] names, string[] rarities, uint8[] grades, string packType) returns (uint256[])']
    const nftContract = new Contract(NFT_CONTRACT, abi, signer)

    const allMintedCards: any[] = []
    const allTokenIds: number[] = []
    const recipientLower = recipient.toLowerCase()

    for (let p = 0; p < packCount; p++) {
      const serverCards = openPackServer(packType)
      const names = serverCards.map(c => c.name)
      const rarities = serverCards.map(c => c.rarity)
      const grades = serverCards.map(c => c.grade)

      const tx = await nftContract.mintBatch(recipient, names, rarities, grades, packType)
      const receipt = await tx.wait()

      const mintTopic = '0xcdc4a2297e1719bc0efbbd70efbf867f20801457f89caef0ba2e23b00a8d415e'
      const tokenIds: number[] = []
      for (const log of receipt.logs) {
        if (log.topics[0] === mintTopic) {
          tokenIds.push(Number(BigInt(log.topics[1])))
        }
      }

      for (let i = 0; i < serverCards.length; i++) {
        const card = serverCards[i]
        const nftId = tokenIds[i] ?? null
        await execute(
          `INSERT INTO card_pulls (wallet_address, card_name, rarity, grade, pack_type, nft_token_id, tx_hash, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
          [recipientLower, card.name, card.rarity, card.grade, packType, nftId, isAdminGift ? `admin-gift-${Date.now()}-${p}-${i}` : txHash]
        )
        allMintedCards.push({
          name: card.name,
          rarity: card.rarity,
          grade: card.grade,
          tokenId: nftId,
        })
        if (nftId !== null) allTokenIds.push(nftId)
      }
    }

    // Store gift in DB for claim/notification flow
    const senderAddr = isAdminGift ? 'TCG Arena' : (sender || 'unknown')
    try {
      await execute(
        `CREATE TABLE IF NOT EXISTS gifts (
          id TEXT PRIMARY KEY,
          sender TEXT NOT NULL,
          recipient TEXT NOT NULL,
          pack_type TEXT NOT NULL,
          cards TEXT NOT NULL,
          claimed INTEGER DEFAULT 0,
          created_at TEXT DEFAULT (datetime('now')),
          claimed_at TEXT
        )`
      )
      const cardsPerPack = packType === 'monad' ? 3 : 5
      for (let p = 0; p < packCount; p++) {
        const packCards = allMintedCards.slice(p * cardsPerPack, (p + 1) * cardsPerPack)
        const giftId = crypto.randomUUID()
        await execute(
          `INSERT INTO gifts (id, sender, recipient, pack_type, cards) VALUES (?, ?, ?, ?, ?)`,
          [giftId, senderAddr, recipientLower, packType, JSON.stringify(packCards)]
        )
      }
    } catch (giftErr) {
      console.error('Gift DB write error:', giftErr)
    }

    return NextResponse.json({
      success: true,
      recipient,
      packType,
      packsGifted: packCount,
      totalCards: allMintedCards.length,
      cards: allMintedCards,
      tokenIds: allTokenIds,
      mode: isAdminGift ? 'admin' : 'friend',
    })
  } catch (err) {
    console.error('Gift mint error:', err)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Gift failed' }, { status: 500 })
  }
}
