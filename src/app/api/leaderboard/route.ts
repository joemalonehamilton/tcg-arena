import { NextResponse } from 'next/server'
import { execute } from '@/lib/turso'

export async function GET() {
  try {
    const result = await execute(
      `SELECT u.wallet_address, u.username, u.token_balance, u.elo_rating,
        COALESCE((SELECT COUNT(*) FROM game_history WHERE user_id = u.id), 0) as games_played,
        COALESCE((SELECT COUNT(*) FROM game_history WHERE user_id = u.id AND result = 'win'), 0) as wins
       FROM users u
       WHERE u.elo_rating > 0 OR EXISTS (SELECT 1 FROM game_history WHERE user_id = u.id)
       ORDER BY u.elo_rating DESC
       LIMIT 50`
    )

    const players = result.rows.map((row, i) => ({
      rank: i + 1,
      wallet: row.wallet_address as string,
      username: row.username as string | null,
      token_balance: Number(row.token_balance) || 0,
      elo_rating: Number(row.elo_rating) || 1000,
      games_played: Number(row.games_played) || 0,
      wins: Number(row.wins) || 0,
    }))

    return NextResponse.json({ players })
  } catch (err) {
    return NextResponse.json({ players: [], error: err instanceof Error ? err.message : 'DB error' })
  }
}
