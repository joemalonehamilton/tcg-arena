import { NextRequest, NextResponse } from 'next/server'
import { execute, batch } from '@/lib/turso'

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('user_id')
  if (!userId) return NextResponse.json({ error: 'user_id required' }, { status: 400 })
  const { rows } = await execute('SELECT * FROM collections WHERE user_id = ? ORDER BY obtained_at DESC', [userId])
  return NextResponse.json(rows)
}

export async function POST(req: NextRequest) {
  const { user_id, cards } = await req.json()
  if (!user_id || !cards?.length) return NextResponse.json({ error: 'user_id and cards required' }, { status: 400 })

  const stmts = cards.map((c: { card_name: string; rarity: string; obtained_from?: string }) => ({
    sql: 'INSERT INTO collections (id, user_id, card_name, rarity, obtained_from) VALUES (?, ?, ?, ?, ?)',
    args: [crypto.randomUUID(), user_id, c.card_name, c.rarity, c.obtained_from || 'pack'],
  }))

  await batch(stmts)
  return NextResponse.json({ ok: true, added: cards.length })
}
