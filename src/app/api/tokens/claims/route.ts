import { NextRequest, NextResponse } from 'next/server'
import { execute } from '@/lib/turso'

// GET /api/tokens/claims?since=<ISO timestamp>
// Returns recent on-chain claim transactions
export async function GET(req: NextRequest) {
  const since = req.nextUrl.searchParams.get('since') || new Date(Date.now() - 3600000).toISOString()
  
  try {
    const result = await execute(
      `SELECT t.id, t.amount, t.reason, t.created_at, u.wallet_address 
       FROM token_transactions t 
       JOIN users u ON u.id = t.user_id 
       WHERE t.reason LIKE 'Claimed on-chain%' AND t.created_at > ?
       ORDER BY t.created_at DESC 
       LIMIT 50`,
      [since]
    )
    
    return NextResponse.json({ claims: result.rows || [] })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch claims' }, { status: 500 })
  }
}
