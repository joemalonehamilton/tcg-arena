import { NextResponse } from 'next/server';
import { isTursoConfigured } from '@/lib/turso';
import { getActiveRounds } from '@/lib/round-lifecycle';
import { rounds as mockRounds } from '@/lib/db';

export async function GET() {
  if (!isTursoConfigured()) {
    const active = Array.from(mockRounds.values()).filter(r => r.status === 'active');
    return NextResponse.json({ rounds: active });
  }

  try {
    const rounds = await getActiveRounds();
    return NextResponse.json({ rounds });
  } catch (err) {
    console.error('Failed to fetch active rounds:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
