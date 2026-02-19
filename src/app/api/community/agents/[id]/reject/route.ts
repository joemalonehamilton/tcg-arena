import { NextRequest, NextResponse } from 'next/server';
import { execute } from '@/lib/turso';

const ADMIN_KEY = process.env.TCG_ADMIN_KEY || ''

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!ADMIN_KEY) return NextResponse.json({ error: 'Admin key not configured' }, { status: 503 })
    const auth = req.headers.get('authorization') ?? ''
    if (auth !== `Bearer ${ADMIN_KEY}`) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { id } = await params;
    await execute('UPDATE community_agents SET status = ? WHERE id = ?', ['rejected', id]);
    return NextResponse.json({ id, status: 'rejected' });
  } catch (err) {
    console.error('Reject error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
