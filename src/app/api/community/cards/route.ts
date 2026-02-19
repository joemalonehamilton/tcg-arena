import { NextRequest, NextResponse } from 'next/server';
import { execute } from '@/lib/turso';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, rarity, ability_name, ability_desc, creator_wallet } = body;
    if (!name) {
      return NextResponse.json({ error: 'name required' }, { status: 400 });
    }
    const id = crypto.randomUUID();
    await execute(
      'INSERT INTO community_cards (id, name, rarity, ability_name, ability_desc, creator_wallet) VALUES (?, ?, ?, ?, ?, ?)',
      [id, name, rarity || 'common', ability_name || null, ability_desc || null, creator_wallet || null]
    );
    return NextResponse.json({ id, name, status: 'voting' }, { status: 201 });
  } catch (err) {
    console.error('Community card submit error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const status = req.nextUrl.searchParams.get('status');
    let result;
    if (status) {
      result = await execute('SELECT * FROM community_cards WHERE status = ? ORDER BY created_at DESC', [status]);
    } else {
      result = await execute('SELECT * FROM community_cards ORDER BY created_at DESC', []);
    }
    return NextResponse.json({ cards: result.rows });
  } catch (err) {
    console.error('Community cards list error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
