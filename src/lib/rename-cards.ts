/**
 * Rename cards in the Turso database.
 * Run: TURSO_DATABASE_URL=... TURSO_AUTH_TOKEN=... npx tsx src/lib/rename-cards.ts
 */
import { execute, batch } from './turso';

const renames: { sql: string; args: string[] }[] = [
  // Round 3 - Monad Monsters (name only)
  { sql: "UPDATE cards SET name = ? WHERE name = ? AND round_id = 'round-3'", args: ['Monadium', 'Monadium Golem'] },
  { sql: "UPDATE cards SET name = ? WHERE name = ? AND round_id = 'round-3'", args: ['Octoracle', 'Tentacle Oracle'] },
  { sql: "UPDATE cards SET name = ? WHERE name = ? AND round_id = 'round-3'", args: ['BFT Crab', 'Consensus Crab'] },

  // Round 1 - Creatures of the Abyss (name + flavor)
  { sql: "UPDATE cards SET name = ?, flavor = ? WHERE name = ? AND round_id = 'round-1'", args: ['Rugpull Dragon', 'It pumps before it dumps. Every time.', 'Infernal Drake'] },
  { sql: "UPDATE cards SET name = ?, flavor = ? WHERE name = ? AND round_id = 'round-1'", args: ['The Deployer', 'One contract to rule them all.', 'Arcane Sorcerer'] },
  { sql: "UPDATE cards SET name = ?, flavor = ? WHERE name = ? AND round_id = 'round-1'", args: ['Sandwich Bot', 'You never see it coming. But your slippage does.', 'Shadow Assassin'] },
  { sql: "UPDATE cards SET name = ?, flavor = ? WHERE name = ? AND round_id = 'round-1'", args: ['Frozen Liquidity', 'Your funds aren\'t lost. They\'re just... unavailable.', 'Frost Wyrm'] },
  { sql: "UPDATE cards SET name = ?, flavor = ? WHERE name = ? AND round_id = 'round-1'", args: ['Seed Phrase Treant', 'Twelve words. Twelve branches. Don\'t lose either.', 'Nature\'s Warden'] },
  { sql: "UPDATE cards SET name = ?, flavor = ? WHERE name = ? AND round_id = 'round-1'", args: ['Redcandle Witch', 'She doesn\'t predict the dip. She IS the dip.', 'Blood Moon Witch'] },

  // Round 2 - Arcane Arsenal (name + flavor)
  { sql: "UPDATE cards SET name = ?, flavor = ? WHERE name = ? AND round_id = 'round-2'", args: ['Ser Greencandle', 'He only shows up on good days.', 'Paladin of Light'] },
  { sql: "UPDATE cards SET name = ?, flavor = ? WHERE name = ? AND round_id = 'round-2'", args: ['The Liquidator', 'Your margin called. He answered.', 'Thunder Titan'] },
  { sql: "UPDATE cards SET name = ?, flavor = ? WHERE name = ? AND round_id = 'round-2'", args: ['Diamond Hands Golem', 'It literally cannot let go.', 'Crystal Golem'] },
  { sql: "UPDATE cards SET name = ?, flavor = ? WHERE name = ? AND round_id = 'round-2'", args: ['Rug Walker', 'It walks between projects. None of them survive.', 'Void Walker'] },
  { sql: "UPDATE cards SET name = ?, flavor = ? WHERE name = ? AND round_id = 'round-2'", args: ['Dead Cat Bounce', 'It always comes back. But never as high.', 'Phoenix Reborn'] },
  { sql: "UPDATE cards SET name = ?, flavor = ? WHERE name = ? AND round_id = 'round-2'", args: ['Whale', 'The ocean moves when it moves.', 'Abyssal Leviathan'] },
];

async function run() {
  console.log('Renaming cards...');
  await batch(renames);
  console.log('Done! Verifying...');
  const result = await execute('SELECT round_id, name, flavor FROM cards ORDER BY round_id, name');
  for (const row of result.rows) {
    console.log(`  [${(row as any).round_id}] ${(row as any).name} — ${(row as any).flavor?.substring(0, 50)}`);
  }
}

run().catch(console.error);
