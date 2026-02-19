import { NextRequest, NextResponse } from 'next/server'
import { execute } from '@/lib/turso'
import { ELO_CONFIG, calculateEloChange } from '@/lib/token-economy'

export async function GET(req: NextRequest) {
  const wallet = req.nextUrl.searchParams.get('wallet')
  if (!wallet) return NextResponse.json({ elo: ELO_CONFIG.STARTING_ELO })

  try {
    const result = await execute(
      `SELECT elo_rating FROM users WHERE wallet_address = ?`,
      [wallet.toLowerCase()]
    )
    if (!result.rows?.length) {
      return NextResponse.json({ elo: ELO_CONFIG.STARTING_ELO })
    }
    return NextResponse.json({ elo: Number(result.rows[0].elo_rating) || ELO_CONFIG.STARTING_ELO })
  } catch {
    return NextResponse.json({ elo: ELO_CONFIG.STARTING_ELO })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { wallet, won, difficulty, gameId } = await req.json()
    if (!wallet || won === undefined || !difficulty) {
      return NextResponse.json({ error: 'wallet, won, difficulty required' }, { status: 400 })
    }

    // Require a valid game ID to prevent ELO manipulation
    if (gameId) {
      const gameCheck = await execute('SELECT id, winner_id FROM game_history WHERE id = ?', [gameId])
      if (!gameCheck.rows?.length) {
        return NextResponse.json({ error: 'Invalid game ID' }, { status: 400 })
      }
    }

    const walletLower = wallet.toLowerCase()
    const change = calculateEloChange(won, difficulty)

    // Ensure user exists
    const userResult = await execute(
      `SELECT id, elo_rating FROM users WHERE wallet_address = ?`,
      [walletLower]
    )

    let currentElo: number

    if (!userResult.rows?.length) {
      const userId = `user-${walletLower.slice(2, 10)}`
      await execute(
        `INSERT INTO users (id, wallet_address, token_balance, elo_rating) VALUES (?, ?, 0, ?)`,
        [userId, walletLower, ELO_CONFIG.STARTING_ELO]
      )
      currentElo = ELO_CONFIG.STARTING_ELO
    } else {
      currentElo = Number(userResult.rows[0].elo_rating) || ELO_CONFIG.STARTING_ELO
    }

    const newElo = Math.max(ELO_CONFIG.MIN_ELO, currentElo + change)

    await execute(
      `UPDATE users SET elo_rating = ? WHERE wallet_address = ?`,
      [newElo, walletLower]
    )

    return NextResponse.json({ elo: newElo, change, previous: currentElo })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 })
  }
}
