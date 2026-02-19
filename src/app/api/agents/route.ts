import { NextRequest, NextResponse } from 'next/server';
import { isTursoConfigured, execute } from '@/lib/turso';
import { agents, apiKeyIndex, getSeason, setSeason, addActivity, broadcast } from '@/lib/db';
import type { Agent } from '@/types';
import { z } from 'zod';

const RegisterSchema = z.object({
  name: z.string().min(1).max(40),
  description: z.string().max(200).default(''),
  webhook_url: z.string().url().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = RegisterSchema.parse(body);

    if (!isTursoConfigured()) {
      return handleMockRegister(parsed);
    }

    // Check name uniqueness
    const existing = await execute('SELECT id FROM agents WHERE LOWER(name) = LOWER(?)', [parsed.name]);
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: 'Agent name taken' }, { status: 409 });
    }

    const id = crypto.randomUUID();
    const apiKey = `tcg_${crypto.randomUUID()}`;

    await execute(
      'INSERT INTO agents (id, name, description, api_key, webhook_url) VALUES (?, ?, ?, ?, ?)',
      [id, parsed.name, parsed.description, apiKey, parsed.webhook_url || null]
    );

    return NextResponse.json({ id, name: parsed.name, apiKey }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors }, { status: 400 });
    }
    console.error('Agent registration error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function GET() {
  if (!isTursoConfigured()) {
    const list = Array.from(agents.values()).map(({ apiKey: _k, ...rest }) => rest);
    return NextResponse.json(list);
  }

  try {
    const result = await execute(
      'SELECT id, name, description, is_starter, cards_voted, wins, created_at FROM agents ORDER BY created_at ASC'
    );
    return NextResponse.json(result.rows);
  } catch (err) {
    console.error('Failed to list agents:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

function handleMockRegister(parsed: { name: string; description: string; webhook_url?: string }) {
  for (const a of agents.values()) {
    if (a.name.toLowerCase() === parsed.name.toLowerCase()) {
      return NextResponse.json({ error: 'Agent name taken' }, { status: 409 });
    }
  }

  const apiKey = `tcg-${crypto.randomUUID()}`;
  const agent: Agent = {
    id: crypto.randomUUID(),
    name: parsed.name,
    description: parsed.description,
    apiKey,
    registeredAt: Date.now(),
    proposalCount: 0,
    acceptedCount: 0,
  };

  agents.set(agent.id, agent);
  apiKeyIndex.set(apiKey, agent.id);

  const season = getSeason();
  setSeason({ ...season, agentCount: agents.size });

  addActivity({
    type: 'agent_register',
    agentId: agent.id,
    agentName: agent.name,
    message: `${agent.name} joined the arena`,
  });

  broadcast({ type: 'agent_joined', payload: { id: agent.id, name: agent.name } });

  return NextResponse.json({ id: agent.id, apiKey, name: agent.name, description: agent.description }, { status: 201 });
}
