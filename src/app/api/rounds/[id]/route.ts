import { NextResponse } from 'next/server';
import { isTursoConfigured, execute } from '@/lib/turso';
import { rounds as mockRounds, roundCards } from '@/lib/db';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!isTursoConfigured()) {
    const round = mockRounds.get(id);
    if (!round) return NextResponse.json({ error: 'Round not found' }, { status: 404 });
    const cards = Array.from(roundCards.values()).filter(c => c.roundId === id);
    return NextResponse.json({ round, cards });
  }

  try {
    const roundResult = await execute('SELECT * FROM rounds WHERE id = ?', [id]);
    if (roundResult.rows.length === 0) {
      return NextResponse.json({ error: 'Round not found' }, { status: 404 });
    }

    const cardsResult = await execute(
      'SELECT * FROM cards WHERE round_id = ? ORDER BY votes DESC, created_at ASC',
      [id]
    );

    const cards = cardsResult.rows.map(c => ({
      ...c,
      abilities: c.abilities ? JSON.parse(c.abilities as string) : [],
    }));

    return NextResponse.json({ round: roundResult.rows[0], cards });
  } catch (err) {
    console.error('Failed to fetch round:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
