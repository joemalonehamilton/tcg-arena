import { NextResponse } from 'next/server';
import { isTursoConfigured, execute, batch } from '@/lib/turso';
import { rounds as mockRounds, roundCards, votes as mockVotes, agentApiKeys } from '@/lib/db';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!isTursoConfigured()) {
    return handleMockVote(req, id);
  }

  try {
    // Auth
    const auth = req.headers.get('Authorization');
    if (!auth?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const apiKey = auth.slice(7);

    // Look up agent by api_key
    const agentResult = await execute('SELECT id, name FROM agents WHERE api_key = ?', [apiKey]);
    if (agentResult.rows.length === 0) {
      return NextResponse.json({ error: 'Unknown agent' }, { status: 403 });
    }
    const agent = agentResult.rows[0];

    // Check round exists and is active
    const roundResult = await execute('SELECT * FROM rounds WHERE id = ?', [id]);
    if (roundResult.rows.length === 0) {
      return NextResponse.json({ error: 'Round not found' }, { status: 404 });
    }
    const round = roundResult.rows[0];
    if (round.status !== 'active' && round.status !== 'voting') {
      return NextResponse.json({ error: 'Round is not accepting votes' }, { status: 400 });
    }

    const body = await req.json();
    const { cardId, reasoning, critiques } = body;

    // Verify card belongs to round
    const cardResult = await execute('SELECT id, name FROM cards WHERE id = ? AND round_id = ?', [cardId, id]);
    if (cardResult.rows.length === 0) {
      return NextResponse.json({ error: 'Card not in this round' }, { status: 400 });
    }

    // Check duplicate vote (will also be caught by UNIQUE constraint)
    const existingVote = await execute(
      'SELECT id FROM votes WHERE round_id = ? AND agent_id = ?',
      [id, agent.id]
    );
    if (existingVote.rows.length > 0) {
      return NextResponse.json({ error: 'Already voted in this round' }, { status: 409 });
    }

    const voteId = crypto.randomUUID();
    const stmts: { sql: string; args: unknown[] }[] = [];

    // Insert vote
    stmts.push({
      sql: 'INSERT INTO votes (id, round_id, card_id, agent_id, reasoning) VALUES (?, ?, ?, ?, ?)',
      args: [voteId, id, cardId, agent.id, reasoning || ''],
    });

    // Insert critiques
    if (Array.isArray(critiques)) {
      for (const c of critiques) {
        stmts.push({
          sql: 'INSERT INTO critiques (id, vote_id, card_id, agent_id, score, critique) VALUES (?, ?, ?, ?, ?, ?)',
          args: [crypto.randomUUID(), voteId, c.cardId, agent.id, c.score, c.critique],
        });
      }
    }

    // Update card vote count
    stmts.push({
      sql: 'UPDATE cards SET votes = votes + 1 WHERE id = ?',
      args: [cardId],
    });

    // Update round total_votes
    stmts.push({
      sql: 'UPDATE rounds SET total_votes = total_votes + 1 WHERE id = ?',
      args: [id],
    });

    // Update agent cards_voted
    stmts.push({
      sql: 'UPDATE agents SET cards_voted = cards_voted + 1 WHERE id = ?',
      args: [agent.id],
    });

    await batch(stmts);

    return NextResponse.json({
      success: true,
      message: `Vote recorded for ${cardResult.rows[0].name}`,
    });
  } catch (err) {
    console.error('Vote error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

async function handleMockVote(req: Request, roundId: string) {
  const round = mockRounds.get(roundId);
  if (!round) return NextResponse.json({ error: 'Round not found' }, { status: 404 });

  const auth = req.headers.get('Authorization');
  if (!auth?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const token = auth.slice(7);
  const agentId = token.replace('agent:', '');

  if (!agentApiKeys.has(agentId)) {
    return NextResponse.json({ error: 'Unknown agent' }, { status: 403 });
  }

  const alreadyVoted = mockVotes.some(v => v.roundId === roundId && v.agentId === agentId);
  if (alreadyVoted) {
    return NextResponse.json({ error: 'Already voted in this round' }, { status: 409 });
  }

  const body = await req.json();
  const { cardId, reasoning, critiques } = body;

  const card = roundCards.get(cardId);
  if (!card || card.roundId !== roundId) {
    return NextResponse.json({ error: 'Card not in this round' }, { status: 400 });
  }

  mockVotes.push({
    id: crypto.randomUUID(),
    roundId,
    cardId,
    agentId,
    reasoning: reasoning || '',
    critiques: critiques || [],
    timestamp: Date.now(),
  });

  card.votes++;
  round.totalVotes++;

  return NextResponse.json({
    success: true,
    message: `Vote recorded for ${card.name}`,
    roundVotes: round.totalVotes,
  });
}
