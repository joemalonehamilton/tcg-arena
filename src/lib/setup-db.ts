/**
 * Setup database tables from schema.sql.
 * Run: npx tsx src/lib/setup-db.ts
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { batch } from './turso';

async function setup() {
  console.log('Setting up TCG Arena database tables...');

  const __filename2 = fileURLToPath(import.meta.url);
  const __dirname2 = dirname(__filename2);
  const schemaPath = join(__dirname2, 'schema.sql');
  console.log('Reading schema from:', schemaPath);
  const schema = readFileSync(schemaPath, 'utf-8');

  // Remove comment lines, split on semicolons, filter empty
  const cleaned = schema.replace(/--.*$/gm, '');
  const statements = cleaned
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  await batch(statements.map(sql => ({ sql: sql + ';', args: [] })));

  console.log(`Created ${statements.length} tables.`);
}

setup().catch(console.error);
