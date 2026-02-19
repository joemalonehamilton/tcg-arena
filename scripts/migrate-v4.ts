/**
 * Migration v4 — Add token_balance to users table
 * Tokens are earned through gameplay, not given for free
 */

const TURSO_URL = process.env.TURSO_DATABASE_URL || 'libsql://tcg-arena-prodzy.aws-us-west-2.turso.io'
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN || 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NzA4NDk4MTgsImlkIjoiYTlhNTFlZGUtN2ZkZi00ZWIyLWJkYzItYmM3MTQ0NTA4YTMyIiwicmlkIjoiOTdhMzI0ODAtNGQxMC00ZTg3LWJjODEtOTAwN2UzMjYwMzQyIn0.kEUXSL0sA0v_xtQd8FeDWjNiYzrA1ClX3P0sUIg7GN5TCjDJyoTDU3RA5meaNh99jEEre9B6BV8-j9Rj9t-5Dw'

async function tursoExec(sql: string) {
  const url = TURSO_URL.replace('libsql://', 'https://') + '/v2/pipeline'
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TURSO_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requests: [
        { type: 'execute', stmt: { sql } },
        { type: 'close' },
      ],
    }),
  })
  const data = await res.json()
  console.log(`SQL: ${sql.slice(0, 80)}...`)
  console.log(`Result:`, JSON.stringify(data).slice(0, 200))
  return data
}

async function main() {
  console.log('=== Migration v4: Token Economy ===\n')

  // Add token_balance column (default 0 — must earn tokens)
  await tursoExec(`ALTER TABLE users ADD COLUMN token_balance INTEGER DEFAULT 0`)

  // Create token_transactions table for audit trail
  await tursoExec(`CREATE TABLE IF NOT EXISTS token_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    amount INTEGER NOT NULL,
    reason TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`)

  console.log('\n✅ Migration v4 complete')
}

main().catch(console.error)
