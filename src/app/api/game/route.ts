import { NextRequest, NextResponse } from 'next/server'
import { execute } from '@/lib/turso'

export async function POST(req: NextRequest) {
  const { player1_id, deck_id, opponent_type } = await req.json()
  if (!player1_id) return NextResponse.json({ error: 'player1_id required' }, { status: 400 })

  const id = crypto.randomUUID()
  await execute(
    'INSERT INTO game_history (id, player1_id, player1_deck_id, player2_type) VALUES (?, ?, ?, ?)',
    [id, player1_id, deck_id || null, opponent_type || 'ai']
  )

  return NextResponse.json({ id, player1_id, opponent_type: opponent_type || 'ai' })
}
