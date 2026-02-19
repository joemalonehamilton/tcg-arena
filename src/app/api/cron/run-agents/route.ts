import { NextResponse } from 'next/server';
import { ArtCritic, MetaGamer, LoreMaster, DegTrader, DesignSage, runAgent } from '@/agents';
import type { AgentConfig, AgentResult } from '@/agents';
import { isTursoConfigured, execute } from '@/lib/turso';
import { checkAndUpdateRounds } from '@/lib/round-lifecycle';
import { votes } from '@/lib/db';

const allAgents: AgentConfig[] = [ArtCritic, MetaGamer, LoreMaster, DegTrader, DesignSage];

export async function GET(req: Request) {
  // Verify cron secret
  const auth = req.headers.get('Authorization');
  const secret = process.env.CRON_SECRET;
  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const lifecycleLogs: string[] = [];

  // Step 1: Update round statuses
  if (isTursoConfigured()) {
    try {
      const logs = await checkAndUpdateRounds();
      lifecycleLogs.push(...logs);
      console.log('[Cron] Lifecycle updates:', logs);
    } catch (err) {
      console.error('[Cron] Lifecycle check failed:', err);
      lifecycleLogs.push(`Lifecycle error: ${err}`);
    }
  }

  // Step 2: Run starter agents
  const summary: { agent: string; status: string; results?: AgentResult[]; error?: string }[] = [];

  for (const agent of allAgents) {
    try {
      let existingVoteCount = 0;
      if (isTursoConfigured()) {
        const result = await execute(
          'SELECT COUNT(*) as cnt FROM votes WHERE agent_id = ?',
          [agent.agentId]
        );
        existingVoteCount = Number(result.rows[0]?.cnt || 0);
      } else {
        existingVoteCount = votes.filter(v => v.agentId === agent.agentId).length;
      }

      console.log(`[Cron] Running ${agent.name} (${existingVoteCount} existing votes)`);
      const results = await runAgent(agent);
      summary.push({ agent: agent.name, status: 'ok', results });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[Cron] ${agent.name} failed:`, msg);
      summary.push({ agent: agent.name, status: 'error', error: msg });
    }
  }

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    lifecycleLogs,
    summary,
  });
}
