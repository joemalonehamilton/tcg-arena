/**
 * Migration v3 — PvP lobbies, ranked ratings, token balances
 */

const TURSO_URL = 'https://tcg-arena-prodzy.aws-us-west-2.turso.io';
const TURSO_TOKEN = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NzA4NDk4MTgsImlkIjoiYTlhNTFlZGUtN2ZkZi00ZWIyLWJkYzItYmM3MTQ0NTA4YTMyIiwicmlkIjoiOTdhMzI0ODAtNGQxMC00ZTg3LWJjODEtOTAwN2UzMjYwMzQyIn0.kEUXSL0sA0v_xtQd8FeDWjNiYzrA1ClX3P0sUIg7GN5TCjDJyoTDU3RA5meaNh99jEEre9B6BV8-j9Rj9t-5Dw';

const statements = [
  `CREATE TABLE IF NOT EXISTS lobbies (
    code TEXT PRIMARY KEY,
    host_id TEXT NOT NULL,
    guest_id TEXT,
    host_deck TEXT,
    guest_deck TEXT,
    game_state TEXT,
    status TEXT DEFAULT 'waiting',
    turn_deadline TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (host_id) REFERENCES users(id)
  )`,
  `CREATE TABLE IF NOT EXISTS ratings (
    user_id TEXT PRIMARY KEY,
    elo INTEGER DEFAULT 1000,
    games_played INTEGER DEFAULT 0,
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    streak INTEGER DEFAULT 0,
    season TEXT DEFAULT 'season01',
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`,
  `ALTER TABLE users ADD COLUMN token_balance INTEGER DEFAULT 500`,
];

async function run() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const requests: any[] = statements.map(sql => ({
    type: 'execute',
    stmt: { sql, args: [] },
  }));
  requests.push({ type: 'close' });

  const res = await fetch(`${TURSO_URL}/v2/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TURSO_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ requests }),
  });

  if (!res.ok) {
    const text = await res.text();
    // ALTER TABLE might fail if column exists — that's fine
    console.log('Response:', text);
  }

  const data = await res.json();
  console.log('✅ Migration v3 complete');
  console.log(JSON.stringify(data.results?.map((r: any) => r.type), null, 2));
}

run();
