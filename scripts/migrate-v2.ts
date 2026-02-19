/**
 * Migration v2 — Users, Collections, Decks, Game History, Card Stats
 */

const TURSO_URL = 'https://tcg-arena-prodzy.aws-us-west-2.turso.io';
const TURSO_TOKEN = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NzA4NDk4MTgsImlkIjoiYTlhNTFlZGUtN2ZkZi00ZWIyLWJkYzItYmM3MTQ0NTA4YTMyIiwicmlkIjoiOTdhMzI0ODAtNGQxMC00ZTg3LWJjODEtOTAwN2UzMjYwMzQyIn0.kEUXSL0sA0v_xtQd8FeDWjNiYzrA1ClX3P0sUIg7GN5TCjDJyoTDU3RA5meaNh99jEEre9B6BV8-j9Rj9t-5Dw';

const statements = [
  `CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    wallet_address TEXT UNIQUE,
    username TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS collections (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    card_name TEXT NOT NULL,
    rarity TEXT NOT NULL,
    obtained_from TEXT DEFAULT 'pack',
    obtained_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`,
  `CREATE TABLE IF NOT EXISTS decks (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`,
  `CREATE TABLE IF NOT EXISTS deck_cards (
    id TEXT PRIMARY KEY,
    deck_id TEXT NOT NULL,
    card_name TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    FOREIGN KEY (deck_id) REFERENCES decks(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS game_history (
    id TEXT PRIMARY KEY,
    player1_id TEXT NOT NULL,
    player2_id TEXT,
    player2_type TEXT DEFAULT 'ai',
    winner_id TEXT,
    player1_deck_id TEXT,
    player2_deck_id TEXT,
    turns INTEGER,
    duration_seconds INTEGER,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (player1_id) REFERENCES users(id)
  )`,
  `CREATE TABLE IF NOT EXISTS card_stats (
    card_name TEXT PRIMARY KEY,
    games_played INTEGER DEFAULT 0,
    games_won INTEGER DEFAULT 0
  )`,
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
    headers: {
      Authorization: `Bearer ${TURSO_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ requests }),
  });

  if (!res.ok) {
    console.error('Migration failed:', await res.text());
    process.exit(1);
  }

  const data = await res.json();
  console.log('✅ Migration v2 complete — 6 tables created');
  console.log(JSON.stringify(data.results?.map((r: any) => r.type), null, 2));
}

run();
