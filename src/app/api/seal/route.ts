import { NextRequest, NextResponse } from 'next/server'
import { triggerSeal } from '@/lib/season-manager'

const ADMIN_KEY = process.env.TCG_ADMIN_KEY || ''

export async function POST(req: NextRequest) {
  try {
    if (!ADMIN_KEY) return NextResponse.json({ error: 'Admin key not configured' }, { status: 503 })
    const auth = req.headers.get('authorization') ?? ''
    if (auth !== `Bearer ${ADMIN_KEY}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const season = await triggerSeal()
    return NextResponse.json(season)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
