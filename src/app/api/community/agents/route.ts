import { NextRequest, NextResponse } from 'next/server';
import { execute } from '@/lib/turso';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, emoji, personality, specialty, creator_wallet } = body;
    if (!name || !personality) {
      return NextResponse.json({ error: 'name and personality required' }, { status: 400 });
    }
    const id = crypto.randomUUID();
    await execute(
      'INSERT INTO community_agents (id, name, emoji, personality, specialty, creator_wallet) VALUES (?, ?, ?, ?, ?, ?)',
      [id, name, emoji || null, personality, specialty || null, creator_wallet || null]
    );
    return NextResponse.json({ id, name, status: 'pending' }, { status: 201 });
  } catch (err) {
    console.error('Community agent submit error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const status = req.nextUrl.searchParams.get('status');
    let result;
    if (status) {
      result = await execute('SELECT * FROM community_agents WHERE status = ? ORDER BY created_at DESC', [status]);
    } else {
      result = await execute('SELECT * FROM community_agents ORDER BY created_at DESC', []);
    }
    return NextResponse.json({ agents: result.rows });
  } catch (err) {
    console.error('Community agents list error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
