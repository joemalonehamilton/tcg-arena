import { NextRequest, NextResponse } from 'next/server'
import { getSeasonStatus, startSeason } from '@/lib/season-manager'

const ADMIN_KEY = process.env.TCG_ADMIN_KEY || ''

export async function GET() {
  const season = getSeasonStatus()
  const timeRemaining = season.endsAt ? Math.max(0, season.endsAt - Date.now()) : undefined
  return NextResponse.json({ ...season, timeRemaining })
}

export async function POST(req: NextRequest) {
  try {
    if (!ADMIN_KEY) return NextResponse.json({ error: 'Admin key not configured' }, { status: 503 })
    const auth = req.headers.get('authorization') ?? ''
    if (auth !== `Bearer ${ADMIN_KEY}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json().catch(() => ({}))
    const durationHours = body.durationHours ?? 72
    const season = startSeason(durationHours * 60 * 60 * 1000)
    return NextResponse.json(season)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
