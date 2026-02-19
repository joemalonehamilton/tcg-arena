import { NextRequest, NextResponse } from 'next/server'
import { execute } from '@/lib/turso'

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return code
}

// Create lobby
export async function POST(req: NextRequest) {
  try {
    const { host_id, host_deck } = await req.json()
    if (!host_id) return NextResponse.json({ error: 'host_id required' }, { status: 400 })

    const code = generateCode()
    await execute(
      'INSERT INTO lobbies (code, host_id, host_deck, status) VALUES (?, ?, ?, ?)',
      [code, host_id, host_deck || null, 'waiting']
    )

    return NextResponse.json({ code, status: 'waiting' })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: 'Failed to create lobby', details: message }, { status: 500 })
  }
}

// List open lobbies (for matchmaking)
export async function GET() {
  const { rows } = await execute(
    "SELECT code, host_id, created_at FROM lobbies WHERE status = 'waiting' ORDER BY created_at DESC LIMIT 20",
    []
  )
  return NextResponse.json(rows)
}
