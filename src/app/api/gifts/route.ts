import { NextRequest, NextResponse } from 'next/server'
import { execute } from '@/lib/turso'

async function ensureTable() {
  await execute(`CREATE TABLE IF NOT EXISTS gifts (
    id TEXT PRIMARY KEY,
    sender TEXT NOT NULL,
    recipient TEXT NOT NULL,
    pack_type TEXT NOT NULL,
    cards TEXT NOT NULL,
    claimed INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    claimed_at TEXT
  )`)
}

// GET /api/gifts?wallet=0x... — get pending (unclaimed) gifts for a wallet
export async function GET(req: NextRequest) {
  const wallet = req.nextUrl.searchParams.get('wallet')
  if (!wallet) return NextResponse.json({ error: 'wallet required' }, { status: 400 })

  await ensureTable()
  const { rows } = await execute(
    'SELECT * FROM gifts WHERE LOWER(recipient) = ? AND claimed = 0 ORDER BY created_at DESC',
    [wallet.toLowerCase()]
  )

  const gifts = rows.map(r => ({
    ...r,
    cards: JSON.parse(r.cards as string),
  }))

  return NextResponse.json({ gifts, count: gifts.length })
}
