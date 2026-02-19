import { NextRequest, NextResponse } from 'next/server'
import { execute } from '@/lib/turso'

// POST /api/gifts/claim — mark a gift as claimed (after reveal animation)
export async function POST(req: NextRequest) {
  const { giftId, wallet } = await req.json()
  if (!giftId || !wallet) return NextResponse.json({ error: 'giftId and wallet required' }, { status: 400 })

  const { rows } = await execute('SELECT * FROM gifts WHERE id = ? AND LOWER(recipient) = ? AND claimed = 0', [giftId, wallet.toLowerCase()])
  if (!rows.length) return NextResponse.json({ error: 'Gift not found or already claimed' }, { status: 404 })

  await execute("UPDATE gifts SET claimed = 1, claimed_at = datetime('now') WHERE id = ?", [giftId])

  return NextResponse.json({ success: true, giftId })
}
