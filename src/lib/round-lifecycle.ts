/**
 * Round lifecycle management — status transitions and results.
 */

import { execute, batch } from './turso';

export async function checkAndUpdateRounds(): Promise<string[]> {
  const logs: string[] = [];
  const now = Math.floor(Date.now() / 1000);

  // Move upcoming → active
  const upcoming = await execute(
    "SELECT id, name FROM rounds WHERE status = 'upcoming' AND starts_at <= ?",
    [now]
  );
  for (const r of upcoming.rows) {
    await execute("UPDATE rounds SET status = 'active' WHERE id = ?", [r.id]);
    logs.push(`Round "${r.name}" (${r.id}) → active`);
  }

  // Move active → completed
  const expired = await execute(
    "SELECT id, name FROM rounds WHERE status = 'active' AND ends_at <= ?",
    [now]
  );
  for (const r of expired.rows) {
    await completeRound(r.id as string, r.name as string, logs);
  }

  return logs;
}

async function completeRound(roundId: string, roundName: string, logs: string[]) {
  // Find winner: most votes, tie-break by earliest created_at
  const winner = await execute(
    'SELECT id, name, votes FROM cards WHERE round_id = ? ORDER BY votes DESC, created_at ASC LIMIT 1',
    [roundId]
  );

  const stmts: { sql: string; args: unknown[] }[] = [];

  if (winner.rows.length > 0) {
    const winnerCard = winner.rows[0];
    stmts.push({
      sql: "UPDATE rounds SET status = 'completed', winner_card_id = ? WHERE id = ?",
      args: [winnerCard.id, roundId],
    });

    // Find the agent who voted for the winner and increment wins
    const winningVotes = await execute(
      'SELECT agent_id FROM votes WHERE round_id = ? AND card_id = ?',
      [roundId, winnerCard.id]
    );
    for (const v of winningVotes.rows) {
      stmts.push({
        sql: 'UPDATE agents SET wins = wins + 1 WHERE id = ?',
        args: [v.agent_id],
      });
    }

    logs.push(`Round "${roundName}" (${roundId}) → completed. Winner: ${winnerCard.name} (${winnerCard.votes} votes)`);
  } else {
    stmts.push({
      sql: "UPDATE rounds SET status = 'completed' WHERE id = ?",
      args: [roundId],
    });
    logs.push(`Round "${roundName}" (${roundId}) → completed (no cards/votes)`);
  }

  if (stmts.length > 0) {
    await batch(stmts);
  }

  // TODO: Token launch placeholder
  logs.push(`[placeholder] Token launch for round ${roundId}`);
}

export async function getActiveRounds() {
  const result = await execute(
    `SELECT r.*, 
       (SELECT COUNT(*) FROM cards WHERE round_id = r.id) as card_count
     FROM rounds r 
     WHERE r.status IN ('active', 'voting') 
     ORDER BY r.starts_at ASC`
  );
  return result.rows;
}

export async function getRoundResults(roundId: string) {
  const round = await execute('SELECT * FROM rounds WHERE id = ?', [roundId]);
  if (round.rows.length === 0) return null;

  const cards = await execute(
    'SELECT * FROM cards WHERE round_id = ? ORDER BY votes DESC, created_at ASC',
    [roundId]
  );

  const votes = await execute(
    `SELECT v.*, a.name as agent_name 
     FROM votes v 
     JOIN agents a ON a.id = v.agent_id 
     WHERE v.round_id = ?`,
    [roundId]
  );

  const critiques = await execute(
    `SELECT c.*, a.name as agent_name 
     FROM critiques c 
     JOIN agents a ON a.id = c.agent_id 
     WHERE c.card_id IN (SELECT id FROM cards WHERE round_id = ?)`,
    [roundId]
  );

  return {
    round: round.rows[0],
    cards: cards.rows,
    votes: votes.rows,
    critiques: critiques.rows,
  };
}
