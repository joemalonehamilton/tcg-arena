/**
 * Seed Round 3: Monad Monsters — Purple cartoon monsters with Monad blockchain aesthetic.
 * Run: npx tsx src/lib/seed-round3.ts
 */

import { execute, batch } from './turso';

const SEASON_ID = 'season-01';
const ROUND_ID = 'round-3';

const now = Math.floor(Date.now() / 1000);
const sevenDays = now + 7 * 24 * 60 * 60;

const cards = [
  { id: 'r3c1', name: 'Nadzilla', type: 'creature', subtype: 'Dragon/Kaiju', cost: 9, power: 8, toughness: 7, abilities: '["Parallel Processing: Attack twice per turn","When Nadzilla enters, all other creatures lose 2 toughness"]', flavor: 'The first block was its footstep. The second was everything else.', rarity: 'legendary', art_style: 'bg-gradient-to-br from-purple-900 via-violet-600 to-green-400', art_description: 'A massive purple cartoon kaiju with glowing green Monad eyes, crystalline purple scales, tiny arms, big goofy grin with sharp teeth, green blockchain data streaming from its back' },
  { id: 'r3c2', name: 'Blob Validator', type: 'creature', subtype: 'Slime', cost: 2, power: 1, toughness: 3, abilities: '["Consensus: Gets +1/+1 for each other Blob you control"]', flavor: 'It validates blocks by sitting on them. Surprisingly effective.', rarity: 'common', art_style: 'bg-gradient-to-br from-purple-400 via-violet-300 to-purple-600', art_description: 'A cute round purple blob with one big googly eye, tiny smile, sitting on a glowing green block, dripping purple goo' },
  { id: 'r3c3', name: 'Phantom Finalizer', type: 'creature', subtype: 'Ghost/Spirit', cost: 5, power: 4, toughness: 3, abilities: '["Finality: When this creature deals damage, it can\'t be reversed","Flying"]', flavor: "Once it touches you, there's no rollback.", rarity: 'rare', art_style: 'bg-gradient-to-br from-indigo-900 via-purple-600 to-fuchsia-400', art_description: 'A spooky but cute purple ghost with glowing green finality runes, trailing purple mist, cartoonish wide eyes, floating above a chain of blocks' },
  { id: 'r3c4', name: 'Gremlin MEV', type: 'creature', subtype: 'Gremlin', cost: 3, power: 3, toughness: 2, abilities: '["Front-run: Attacks before other creatures in combat","Haste"]', flavor: 'It always cuts in line. Always.', rarity: 'uncommon', art_style: 'bg-gradient-to-br from-purple-700 via-fuchsia-500 to-yellow-400', art_description: 'A mischievous purple gremlin with big pointy ears, wearing a tiny hacker hoodie, running really fast with speed lines, holding stolen golden coins' },
  { id: 'r3c5', name: 'Monadium', type: 'creature', subtype: 'Golem/Construct', cost: 6, power: 5, toughness: 6, abilities: '["Parallel Execution: Can block two creatures simultaneously","Defender"]', flavor: 'Built from the first testnet. Runs on pure throughput.', rarity: 'rare', art_style: 'bg-gradient-to-br from-slate-800 via-purple-700 to-green-500', art_description: 'A massive purple stone golem with green Monad circuit patterns carved into its body, glowing green eyes, chunky cartoon proportions, standing guard' },
  { id: 'r3c6', name: 'Octoracle', type: 'creature', subtype: 'Octopus/Seer', cost: 4, power: 2, toughness: 4, abilities: '["Prediction: Look at the top 3 cards, put 1 back","Reach"]', flavor: 'Eight arms, eight predictions. Seven are usually right.', rarity: 'uncommon', art_style: 'bg-gradient-to-br from-purple-800 via-violet-500 to-cyan-400', art_description: 'A cute purple cartoon octopus with a wizard hat, each tentacle holding a different glowing orb, big curious eyes, floating in a purple void' },
  { id: 'r3c7', name: 'Gas Guzzler', type: 'creature', subtype: 'Beast', cost: 1, power: 2, toughness: 1, abilities: '["Cheap: Costs 1 less if you played another creature this turn"]', flavor: 'It eats gas fees for breakfast. Literally.', rarity: 'common', art_style: 'bg-gradient-to-br from-purple-500 via-violet-400 to-lime-300', art_description: 'A tiny purple cartoon monster with a huge mouth, chomping on green gas clouds, round body, stubby legs, always hungry expression' },
  { id: 'r3c8', name: 'Shard Wyrm', type: 'creature', subtype: 'Dragon/Serpent', cost: 8, power: 7, toughness: 5, abilities: '["Sharding: Create a 2/2 Shard token when this attacks","Flying","Trample"]', flavor: 'Each scale is a shard. Each shard is a world.', rarity: 'legendary', art_style: 'bg-gradient-to-br from-purple-900 via-fuchsia-600 to-purple-300', art_description: 'A long serpentine purple dragon made of crystalline purple shards, each shard glowing differently, cartoonish face with big fangs and swirly eyes, cosmic purple background' },
  { id: 'r3c9', name: 'Mempool Lurker', type: 'creature', subtype: 'Fish/Horror', cost: 2, power: 1, toughness: 2, abilities: '["Pending: Enters tapped. Untaps at your next upkeep."]', flavor: 'It waits in the mempool. Watching. Waiting. Mostly waiting.', rarity: 'common', art_style: 'bg-gradient-to-br from-purple-600 via-indigo-500 to-purple-800', art_description: 'A derpy purple anglerfish with a glowing green lure, swimming through a pool of purple transaction data, goofy underbite, big round eyes' },
  { id: 'r3c10', name: 'BFT Crab', type: 'creature', subtype: 'Crab', cost: 3, power: 2, toughness: 4, abilities: '["Byzantine Fault Tolerance: Can\'t be destroyed if you control 3+ creatures"]', flavor: 'It only agrees to die if two-thirds of the crabs agree first.', rarity: 'uncommon', art_style: 'bg-gradient-to-br from-purple-700 via-violet-400 to-green-300', art_description: 'A grumpy purple cartoon crab with one big claw and one small claw, wearing tiny green Monad goggles, armored purple shell with green circuit lines' },
  { id: 'r3c11', name: 'Block Bunny', type: 'creature', subtype: 'Rabbit', cost: 1, power: 1, toughness: 1, abilities: '["Speed: First strike","When Block Bunny dies, draw a card"]', flavor: '400ms to finality. 200ms to hop.', rarity: 'common', art_style: 'bg-gradient-to-br from-violet-400 via-purple-300 to-pink-300', art_description: 'An adorable tiny purple bunny with huge ears that look like antennae, sitting on a green glowing block, big sparkly eyes, speed lines behind it' },
  { id: 'r3c12', name: 'The Devnet Horror', type: 'creature', subtype: 'Eldritch/Bug', cost: 7, power: 6, toughness: 6, abilities: '["Buggy: When this enters, flip a coin. Heads: destroy target creature. Tails: destroy this instead.","Menace"]', flavor: 'It emerged from an unhandled exception. No one filed a bug report.', rarity: 'rare', art_style: 'bg-gradient-to-br from-purple-900 via-red-900 to-purple-600', art_description: 'A terrifying but cartoonish purple eldritch horror made of glitchy purple pixels, multiple mismatched eyes, tentacles made of broken code, error messages floating around it' },
];

async function seed() {
  console.log('Seeding Round 3: Monad Monsters...');

  // Check if round already exists
  const existing = await execute('SELECT id FROM rounds WHERE id = ?', [ROUND_ID]);
  if (existing.rows.length > 0) {
    console.log('Round 3 already exists, skipping.');
    return;
  }

  const stmts: { sql: string; args: unknown[] }[] = [];

  // Round
  stmts.push({
    sql: 'INSERT INTO rounds (id, season_id, name, theme, status, starts_at, ends_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    args: [ROUND_ID, SEASON_ID, 'Monad Monsters', 'Purple cartoon monsters with Monad blockchain aesthetic', 'active', now, sevenDays],
  });

  // Cards
  for (const c of cards) {
    stmts.push({
      sql: 'INSERT INTO cards (id, round_id, name, type, subtype, cost, power, toughness, abilities, flavor, rarity, art_description, art_style) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      args: [c.id, ROUND_ID, c.name, c.type, c.subtype, c.cost, c.power, c.toughness, c.abilities, c.flavor, c.rarity, c.art_description, c.art_style],
    });
  }

  await batch(stmts);
  console.log(`Seeded round "${ROUND_ID}" with ${cards.length} cards.`);

  // Verify
  const roundCheck = await execute('SELECT id, name, status FROM rounds WHERE id = ?', [ROUND_ID]);
  console.log('Round:', roundCheck.rows);
  const cardCheck = await execute('SELECT COUNT(*) as count FROM cards WHERE round_id = ?', [ROUND_ID]);
  console.log('Card count:', cardCheck.rows);
}

seed().catch(console.error);
