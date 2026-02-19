import { NextRequest, NextResponse } from 'next/server'
import { execute } from '@/lib/turso'

// GET /api/tokens?wallet=0x... — get balance (legacy, reads from DB)
export async function GET(req: NextRequest) {
  const wallet = req.nextUrl.searchParams.get('wallet')
  if (!wallet) return NextResponse.json({ balance: 0 })

  try {
    const result = await execute(
      `SELECT id, token_balance FROM users WHERE LOWER(wallet_address) = ?`,
      [wallet.toLowerCase()]
    )

    if (!result.rows?.length) {
      return NextResponse.json({ balance: 0, registered: false })
    }

    const row = result.rows[0]
    return NextResponse.json({
      balance: Number(row.token_balance) || 0,
      registered: true,
      userId: row.id,
    })
  } catch (err) {
    return NextResponse.json({ balance: 0, error: err instanceof Error ? err.message : 'DB error' })
  }
}

// POST /api/tokens — DISABLED (legacy off-chain token system)
export async function POST() {
  return NextResponse.json({ error: 'This endpoint has been retired. Use on-chain TCG tokens.' }, { status: 410 })
}
