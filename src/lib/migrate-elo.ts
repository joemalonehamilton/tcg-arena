/**
 * Migration: Add elo_rating and starter_pack_claimed columns to users table
 * Run: npx tsx src/lib/migrate-elo.ts
 */

import { execute } from './turso'

async function migrate() {
  console.log('Adding elo_rating column...')
  try {
    await execute('ALTER TABLE users ADD COLUMN elo_rating INTEGER DEFAULT 1000', [])
    console.log('✅ elo_rating added')
  } catch (e: any) {
    if (e.message?.includes('duplicate column')) console.log('⏭ elo_rating already exists')
    else console.error('❌', e.message)
  }

  console.log('Adding starter_pack_claimed column...')
  try {
    await execute('ALTER TABLE users ADD COLUMN starter_pack_claimed INTEGER DEFAULT 0', [])
    console.log('✅ starter_pack_claimed added')
  } catch (e: any) {
    if (e.message?.includes('duplicate column')) console.log('⏭ starter_pack_claimed already exists')
    else console.error('❌', e.message)
  }

  console.log('Done!')
}

migrate().catch(console.error)
