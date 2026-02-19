/**
 * Update cards in Turso with image URLs.
 * Run: TURSO_DATABASE_URL=... TURSO_AUTH_TOKEN=... npx tsx src/lib/update-card-images.ts
 */
import { execute, batch } from './turso';

const slugMap: Record<string, string> = {
  'Nadzilla': 'nadzilla',
  'Blob Validator': 'blob-validator',
  'Phantom Finalizer': 'phantom-finalizer',
  'Gremlin MEV': 'gremlin-mev',
  'Monadium': 'monadium',
  'Octoracle': 'octoracle',
  'Gas Guzzler': 'gas-guzzler',
  'Shard Wyrm': 'shard-wyrm',
  'Mempool Lurker': 'mempool-lurker',
  'BFT Crab': 'bft-crab',
  'Block Bunny': 'block-bunny',
  'The Devnet Horror': 'the-devnet-horror',
  'Rugpull Dragon': 'rugpull-dragon',
  'The Deployer': 'the-deployer',
  'Sandwich Bot': 'sandwich-bot',
  'Frozen Liquidity': 'frozen-liquidity',
  'Seed Phrase Treant': 'seed-phrase-treant',
  'Redcandle Witch': 'redcandle-witch',
  'Ser Greencandle': 'ser-greencandle',
  'The Liquidator': 'the-liquidator',
  'Diamond Hands Golem': 'diamond-hands-golem',
  'Rug Walker': 'rug-walker',
  'Dead Cat Bounce': 'dead-cat-bounce',
  'Whale': 'whale',
};

async function main() {
  // Get all cards
  const { rows } = await execute('SELECT id, name FROM cards');
  console.log(`Found ${rows.length} cards in DB`);

  const updates = rows
    .filter(r => slugMap[r.name as string])
    .map(r => ({
      sql: 'UPDATE cards SET art_style = ? WHERE id = ?',
      args: [`/cards/${slugMap[r.name as string]}.jpg`, r.id],
    }));

  if (updates.length === 0) {
    console.log('No matching cards found');
    return;
  }

  console.log(`Updating ${updates.length} cards...`);
  await batch(updates);
  console.log('Done!');

  // Verify
  const { rows: check } = await execute('SELECT name, art_style FROM cards WHERE art_style LIKE ?', ['/cards/%']);
  check.forEach(r => console.log(`  ${r.name}: ${r.art_style}`));
}

main().catch(console.error);
