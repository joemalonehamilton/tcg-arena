import { NextRequest, NextResponse } from 'next/server'
import { execute } from '@/lib/turso'

// Get lobby state
export async function GET(_req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  const { rows } = await execute('SELECT * FROM lobbies WHERE code = ?', [code.toUpperCase()])
  if (!rows[0]) return NextResponse.json({ error: 'not found' }, { status: 404 })

  const lobby = rows[0]
  return NextResponse.json({
    code: lobby.code,
    host_id: lobby.host_id,
    guest_id: lobby.guest_id,
    status: lobby.status,
    game_state: lobby.game_state ? JSON.parse(lobby.game_state as string) : null,
    turn_deadline: lobby.turn_deadline,
    updated_at: lobby.updated_at,
  })
}

// Join lobby / Submit action / Update state
export async function POST(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  const body = await req.json()
  const { action } = body

  const { rows } = await execute('SELECT * FROM lobbies WHERE code = ?', [code.toUpperCase()])
  if (!rows[0]) return NextResponse.json({ error: 'not found' }, { status: 404 })
  const lobby = rows[0]

  // Join
  if (action === 'join') {
    const { guest_id, guest_deck } = body
    if (!guest_id) return NextResponse.json({ error: 'guest_id required' }, { status: 400 })
    if (lobby.status !== 'waiting') return NextResponse.json({ error: 'lobby not available' }, { status: 400 })
    if (lobby.host_id === guest_id) return NextResponse.json({ error: 'cannot join own lobby' }, { status: 400 })

    await execute(
      "UPDATE lobbies SET guest_id = ?, guest_deck = ?, status = 'playing', updated_at = datetime('now') WHERE code = ?",
      [guest_id, guest_deck || null, code.toUpperCase()]
    )
    return NextResponse.json({ ok: true, status: 'playing' })
  }

  // Update game state
  if (action === 'update_state') {
    const { game_state, status } = body
    const deadline = new Date(Date.now() + 60000).toISOString() // 60s turn timer
    await execute(
      "UPDATE lobbies SET game_state = ?, status = COALESCE(?, status), turn_deadline = ?, updated_at = datetime('now') WHERE code = ?",
      [JSON.stringify(game_state), status || null, deadline, code.toUpperCase()]
    )
    return NextResponse.json({ ok: true })
  }

  // End game
  if (action === 'end') {
    const { winner_id } = body
    await execute(
      "UPDATE lobbies SET status = 'finished', updated_at = datetime('now') WHERE code = ?",
      [code.toUpperCase()]
    )

    // Create game history entry
    const gameId = crypto.randomUUID()
    await execute(
      'INSERT INTO game_history (id, player1_id, player2_id, player2_type, winner_id) VALUES (?, ?, ?, ?, ?)',
      [gameId, lobby.host_id, lobby.guest_id, 'pvp', winner_id || null]
    )

    // Update ELO ratings
    if (winner_id && lobby.host_id && lobby.guest_id) {
      const loserId = winner_id === lobby.host_id ? lobby.guest_id : lobby.host_id
      // Simple ELO: winner +25, loser -25
      await execute(
        `INSERT INTO ratings (user_id, elo, games_played, wins, streak)
         VALUES (?, 1025, 1, 1, 1)
         ON CONFLICT(user_id) DO UPDATE SET
           elo = elo + 25, games_played = games_played + 1, wins = wins + 1,
           streak = CASE WHEN streak > 0 THEN streak + 1 ELSE 1 END,
           updated_at = datetime('now')`,
        [winner_id]
      )
      await execute(
        `INSERT INTO ratings (user_id, elo, games_played, losses, streak)
         VALUES (?, 975, 1, 1, -1)
         ON CONFLICT(user_id) DO UPDATE SET
           elo = MAX(100, elo - 25), games_played = games_played + 1, losses = losses + 1,
           streak = CASE WHEN streak < 0 THEN streak - 1 ELSE -1 END,
           updated_at = datetime('now')`,
        [loserId]
      )
    }

    return NextResponse.json({ ok: true, game_id: gameId })
  }

  return NextResponse.json({ error: 'unknown action' }, { status: 400 })
}
