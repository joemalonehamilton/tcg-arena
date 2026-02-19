import { NextRequest, NextResponse } from 'next/server'
import { execute, batch } from '@/lib/turso'

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('user_id')
  if (!userId) return NextResponse.json({ error: 'user_id required' }, { status: 400 })

  const { rows: decks } = await execute('SELECT * FROM decks WHERE user_id = ? ORDER BY updated_at DESC', [userId])

  // Fetch cards for each deck
  const result = await Promise.all(decks.map(async (d) => {
    const { rows: cards } = await execute('SELECT card_name, quantity FROM deck_cards WHERE deck_id = ?', [d.id as string])
    return { ...d, cards }
  }))

  return NextResponse.json(result)
}

export async function POST(req: NextRequest) {
  const { user_id, name, cards } = await req.json()
  if (!user_id || !name) return NextResponse.json({ error: 'user_id and name required' }, { status: 400 })

  const deckId = crypto.randomUUID()
  const stmts = [
    { sql: 'INSERT INTO decks (id, user_id, name) VALUES (?, ?, ?)', args: [deckId, user_id, name] },
    ...(cards || []).map((c: { card_name: string; quantity: number }) => ({
      sql: 'INSERT INTO deck_cards (id, deck_id, card_name, quantity) VALUES (?, ?, ?, ?)',
      args: [crypto.randomUUID(), deckId, c.card_name, c.quantity || 1],
    })),
  ]

  await batch(stmts)
  return NextResponse.json({ id: deckId, name, cards })
}

export async function PUT(req: NextRequest) {
  const { deck_id, name, cards } = await req.json()
  if (!deck_id) return NextResponse.json({ error: 'deck_id required' }, { status: 400 })

  const stmts: { sql: string; args: unknown[] }[] = []

  if (name) {
    stmts.push({ sql: "UPDATE decks SET name = ?, updated_at = datetime('now') WHERE id = ?", args: [name, deck_id] })
  }

  if (cards) {
    stmts.push({ sql: 'DELETE FROM deck_cards WHERE deck_id = ?', args: [deck_id] })
    cards.forEach((c: { card_name: string; quantity: number }) => {
      stmts.push({
        sql: 'INSERT INTO deck_cards (id, deck_id, card_name, quantity) VALUES (?, ?, ?, ?)',
        args: [crypto.randomUUID(), deck_id, c.card_name, c.quantity || 1],
      })
    })
    stmts.push({ sql: "UPDATE decks SET updated_at = datetime('now') WHERE id = ?", args: [deck_id] })
  }

  if (stmts.length) await batch(stmts)
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const { deck_id } = await req.json()
  if (!deck_id) return NextResponse.json({ error: 'deck_id required' }, { status: 400 })
  await batch([
    { sql: 'DELETE FROM deck_cards WHERE deck_id = ?', args: [deck_id] },
    { sql: 'DELETE FROM decks WHERE id = ?', args: [deck_id] },
  ])
  return NextResponse.json({ ok: true })
}
