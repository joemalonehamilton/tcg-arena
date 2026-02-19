import { NextRequest, NextResponse } from 'next/server'
import { execute, batch } from '@/lib/turso'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { rows } = await execute('SELECT * FROM game_history WHERE id = ?', [id])
  if (!rows[0]) return NextResponse.json({ error: 'not found' }, { status: 404 })
  return NextResponse.json(rows[0])
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { winner_id, turns, duration_seconds, cards_played } = await req.json()

  await execute(
    'UPDATE game_history SET winner_id = ?, turns = ?, duration_seconds = ? WHERE id = ?',
    [winner_id || null, turns || 0, duration_seconds || 0, id]
  )

  // Update card stats
  if (cards_played && Array.isArray(cards_played)) {
    const stmts = cards_played.map((c: { name: string; won: boolean }) => ({
      sql: `INSERT INTO card_stats (card_name, games_played, games_won)
            VALUES (?, 1, ?)
            ON CONFLICT(card_name) DO UPDATE SET
              games_played = games_played + 1,
              games_won = games_won + ?`,
      args: [c.name, c.won ? 1 : 0, c.won ? 1 : 0],
    }))
    if (stmts.length) await batch(stmts)
  }

  return NextResponse.json({ ok: true })
}
