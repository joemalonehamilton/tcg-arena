import fs from 'fs';
import path from 'path';

const cards = [
  // Monad Monsters (round-3)
  { slug: 'nadzilla', prompt: 'massive purple cartoon kaiju dragon with glowing green eyes, sharp teeth goofy grin, tiny arms, crystalline purple scales, green blockchain data streaming from back, TCG card art, fantasy illustration, vibrant purple and green, digital painting, dark background' },
  { slug: 'blob-validator', prompt: 'cute round purple blob monster with one big googly eye, tiny smile, sitting on glowing green cube, dripping purple goo, adorable, TCG card art, cartoon style, vibrant purple, digital painting, dark background' },
  { slug: 'phantom-finalizer', prompt: 'spooky cute purple ghost with glowing green runes, trailing purple mist, wide cartoon eyes, floating above chain of blocks, ethereal, TCG card art, fantasy illustration, purple and green, digital painting, dark background' },
  { slug: 'gremlin-mev', prompt: 'mischievous small purple gremlin with big pointy ears, wearing tiny hacker hoodie, running fast with speed lines, holding golden coins, sneaky expression, TCG card art, cartoon style, purple and yellow, digital painting, dark background' },
  { slug: 'monadium', prompt: 'massive purple stone golem with green circuit patterns carved into body, glowing green eyes, chunky cartoon proportions, standing guard pose, TCG card art, fantasy illustration, purple and green, digital painting, dark background' },
  { slug: 'octoracle', prompt: 'cute purple cartoon octopus wearing wizard hat, each tentacle holding different glowing orb, big curious eyes, floating in purple void, mystical, TCG card art, fantasy illustration, purple and cyan, digital painting, dark background' },
  { slug: 'gas-guzzler', prompt: 'tiny purple cartoon monster with enormous mouth chomping green gas clouds, round body, stubby legs, always hungry expression, cute and funny, TCG card art, cartoon style, purple and lime green, digital painting, dark background' },
  { slug: 'shard-wyrm', prompt: 'long serpentine purple dragon made of crystalline purple shards, each shard glowing, cartoon face with big fangs and swirly eyes, cosmic background, TCG card art, fantasy illustration, purple and pink, digital painting, dark background' },
  { slug: 'mempool-lurker', prompt: 'derpy purple anglerfish with glowing green lure, swimming through pool of purple data, goofy underbite, big round eyes, underwater scene, TCG card art, cartoon style, purple and green, digital painting, dark background' },
  { slug: 'bft-crab', prompt: 'grumpy purple cartoon crab with one big claw one small claw, wearing tiny green goggles, armored shell with green circuit lines, tough expression, TCG card art, cartoon style, purple and green, digital painting, dark background' },
  { slug: 'block-bunny', prompt: 'adorable tiny purple bunny with huge ears like antennae, sitting on green glowing block, big sparkly eyes, speed lines behind it, fast and cute, TCG card art, cartoon style, violet and green, digital painting, dark background' },
  { slug: 'the-devnet-horror', prompt: 'terrifying but cartoonish purple eldritch horror made of glitchy pixels, multiple mismatched eyes, tentacles made of broken code, error messages floating, TCG card art, horror cartoon style, purple and red, digital painting, dark background' },
  // Creatures of the Abyss (round-1)
  { slug: 'rugpull-dragon', prompt: 'menacing red and orange dragon breathing fire downward, greedy expression, hoarding gold coins, flames and destruction, evil grin, TCG card art, fantasy illustration, red and orange, digital painting, dark background' },
  { slug: 'the-deployer', prompt: 'mysterious dark wizard in black robes holding a glowing smart contract scroll, arcane symbols floating, hooded figure, powerful aura, TCG card art, fantasy illustration, dark blue and purple, digital painting, dark background' },
  { slug: 'sandwich-bot', prompt: 'sleek dark purple mechanical assassin robot with glowing red eyes, dual blades, lurking in shadows, cyberpunk style, stealthy, TCG card art, sci-fi fantasy, purple and red, digital painting, dark background' },
  { slug: 'frozen-liquidity', prompt: 'massive ice dragon trapped in crystal prison, frozen mid-roar, ice shards everywhere, blue and white, cold and beautiful, TCG card art, fantasy illustration, ice blue and white, digital painting, dark background' },
  { slug: 'seed-phrase-treant', prompt: 'ancient tree creature with 12 glowing word-leaves, bark armor, wise ancient face in trunk, roots spreading, forest guardian, TCG card art, fantasy illustration, green and brown, digital painting, dark background' },
  { slug: 'redcandle-witch', prompt: 'dark witch with red glowing eyes under blood moon, crimson robes, casting hex with red energy, spooky beautiful, TCG card art, fantasy illustration, red and black, digital painting, dark background' },
  // Arcane Arsenal (round-2)
  { slug: 'ser-greencandle', prompt: 'noble knight in shining golden armor holding green glowing candle sword, heroic pose, cape flowing, righteous aura, TCG card art, fantasy illustration, gold and green, digital painting, dark background' },
  { slug: 'the-liquidator', prompt: 'massive storm giant crackling with lightning, towering over city, electric blue eyes, destructive power, dramatic clouds, TCG card art, fantasy illustration, electric blue and yellow, digital painting, dark background' },
  { slug: 'diamond-hands-golem', prompt: 'crystal golem made of diamonds and gems, prismatic rainbow reflections, powerful stance, hands clenched into fists that sparkle, TCG card art, fantasy illustration, rainbow prismatic, digital painting, dark background' },
  { slug: 'rug-walker', prompt: 'ethereal dark figure walking between dimensions, void energy, cosmic horror, tattered cloak dissolving into nothing, starfield background, TCG card art, fantasy illustration, deep purple and black, digital painting, dark background' },
  { slug: 'dead-cat-bounce', prompt: 'phoenix made of orange and gold fire rising from ashes, dramatic resurrection pose, flames and embers everywhere, TCG card art, fantasy illustration, orange gold and white, digital painting, dark background' },
  { slug: 'whale', prompt: 'enormous deep sea leviathan, bioluminescent blue and teal, ancient and powerful, ocean depth background, massive scale, awe-inspiring, TCG card art, fantasy illustration, deep blue and teal, digital painting, dark background' },
];

const outDir = path.join(__dirname, '../../public/cards');

async function downloadImage(slug: string, prompt: string) {
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=512&height=768&nologo=true`;
  const outPath = path.join(outDir, `${slug}.jpg`);
  
  if (fs.existsSync(outPath) && fs.statSync(outPath).size > 10000) {
    console.log(`[SKIP] ${slug} already exists`);
    return;
  }

  console.log(`[DL] ${slug}...`);
  const res = await fetch(url);
  if (!res.ok) {
    console.error(`[ERR] ${slug}: ${res.status}`);
    return;
  }
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(outPath, buf);
  console.log(`[OK] ${slug} (${(buf.length/1024).toFixed(0)}KB)`);
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  for (const card of cards) {
    await downloadImage(card.slug, card.prompt);
    await new Promise(r => setTimeout(r, 3000));
  }
  console.log('Done!');
}

main();
