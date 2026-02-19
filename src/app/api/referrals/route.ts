import { NextRequest, NextResponse } from 'next/server'

const TURSO_URL = process.env.TURSO_DATABASE_URL || ''
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN || ''

async function tursoExec(sql: string, args: any[] = []) {
  const res = await fetch(`${TURSO_URL}/v2/pipeline`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TURSO_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requests: [
        { type: 'execute', stmt: { sql, args: args.map(a => ({ type: 'text', value: String(a) })) } },
        { type: 'close' },
      ],
    }),
  })
  return res.json()
}

// Ensure referrals table exists
async function ensureTable() {
  await tursoExec(`CREATE TABLE IF NOT EXISTS referrals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    referrer TEXT NOT NULL,
    referred TEXT NOT NULL,
    pack_type TEXT,
    tcg_amount REAL DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    UNIQUE(referrer, referred, created_at)
  )`)
}

// POST /api/referrals — log a referral pack purchase
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const { referrer, referred, packType, tcgAmount } = body

  if (!referrer || !referred) {
    return NextResponse.json({ error: 'Missing referrer or referred' }, { status: 400 })
  }

  await ensureTable()
  await tursoExec(
    'INSERT INTO referrals (referrer, referred, pack_type, tcg_amount) VALUES (?, ?, ?, ?)',
    [referrer.toLowerCase(), referred.toLowerCase(), packType || 'standard', tcgAmount || 0]
  )

  return NextResponse.json({ ok: true })
}

// GET /api/referrals?wallet=0x... — get referral stats for a wallet
export async function GET(req: NextRequest) {
  const wallet = req.nextUrl.searchParams.get('wallet')
  if (!wallet) return NextResponse.json({ error: 'Missing wallet' }, { status: 400 })

  await ensureTable()
  const result = await tursoExec(
    'SELECT COUNT(*) as count, COALESCE(SUM(tcg_amount), 0) as total_tcg FROM referrals WHERE referrer = ?',
    [wallet.toLowerCase()]
  )

  const rows = result?.results?.[0]?.response?.result?.rows || []
  const row = rows[0] || []

  return NextResponse.json({
    referrals: Number(row[0]?.value || 0),
    totalEarned: Number(row[1]?.value || 0) * 0.05, // 5% of referred spend
    totalReferred: Number(row[0]?.value || 0),
  })
}
