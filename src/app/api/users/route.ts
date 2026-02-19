import { NextRequest, NextResponse } from 'next/server'
import { execute } from '@/lib/turso'

export async function GET(req: NextRequest) {
  const wallet = req.nextUrl.searchParams.get('wallet')
  if (!wallet) return NextResponse.json({ error: 'wallet required' }, { status: 400 })
  const { rows } = await execute('SELECT * FROM users WHERE wallet_address = ?', [wallet])
  return NextResponse.json(rows[0] || null)
}

export async function POST(req: NextRequest) {
  const { wallet_address, username } = await req.json()
  if (!wallet_address) return NextResponse.json({ error: 'wallet_address required' }, { status: 400 })

  // Upsert
  const { rows } = await execute('SELECT * FROM users WHERE wallet_address = ?', [wallet_address])
  if (rows[0]) return NextResponse.json(rows[0])

  const id = crypto.randomUUID()
  await execute('INSERT INTO users (id, wallet_address, username) VALUES (?, ?, ?)', [id, wallet_address, username || null])
  return NextResponse.json({ id, wallet_address, username })
}
