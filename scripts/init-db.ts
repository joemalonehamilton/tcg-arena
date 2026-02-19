/**
 * Combined init: setup tables + seed data.
 * Run: npx tsx scripts/init-db.ts
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { batch, execute } from '../src/lib/turso';

async function setupTables() {
  console.log('=== Setting up tables ===');
  const schemaPath = join(__dirname, '..', 'src', 'lib', 'schema.sql');
  const schema = readFileSync(schemaPath, 'utf-8');

  const statements = schema
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  await batch(statements.map(sql => ({ sql: sql + ';', args: [] })));
  console.log(`Created ${statements.length} tables.`);
}

async function seedData() {
  console.log('=== Seeding data ===');
  // Import and run seed
  await import('../src/lib/seed');
}

async function main() {
  await setupTables();
  await seedData();
  console.log('=== Init complete ===');
}

main().catch(console.error);
