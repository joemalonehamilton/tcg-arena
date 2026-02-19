/**
 * Generate card art using fal.ai Flux 2 Pro — Memetic NFT style
 * Usage: FAL_KEY=xxx npx tsx scripts/gen-art.ts
 */

import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'

const FAL_KEY = process.env.FAL_KEY!
const OUT_DIR = join(__dirname, '..', 'public', 'cards')

interface CardArt {
  filename: string
  prompt: string
}

// Style: think Pudgy Penguins meets Pepe meets Pokemon cards — cute, bold, memey, iconic
const S = `memetic internet culture art style, bold flat colors, thick black outlines, kawaii chibi character, expressive cartoon face with big eyes, sticker art aesthetic, NFT PFP collectible style, minimal background, clean vector-like illustration, funny and chaotic energy, meme coin mascot vibes, no text no words no letters`

const cards: CardArt[] = [
  // Round 1: Creatures of the Abyss
  { filename: 'rugpull-dragon.jpg', prompt: `${S}, a chubby red dragon wearing a top hat and monocle pulling a rug out from under you, smug evil grin, bags of money flying, red and gold colors, scammer energy` },
  { filename: 'the-deployer.jpg', prompt: `${S}, a hooded wizard frog (like pepe) with glowing purple hands typing on a floating holographic keyboard, deploying code, purple magic aura, hacker vibes` },
  { filename: 'ser-greencandle.jpg', prompt: `${S}, a tiny knight in golden armor riding a giant green candlestick chart like a horse, holding a green flag, triumphant pose, bull market energy, green and gold` },
  { filename: 'sandwich-bot.jpg', prompt: `${S}, a sneaky robot shaped like a sandwich with evil red LED eyes, mechanical arms grabbing coins from both sides, dark purple background, villain energy` },
  { filename: 'frozen-liquidity.jpg', prompt: `${S}, a massive ice whale frozen inside a giant blue ice cube with coins and tokens trapped inside, sad frozen expression, icy blue and white, locked liquidity meme` },
  { filename: 'seed-phrase-treant.jpg', prompt: `${S}, a small happy tree creature with 12 glowing leaves, each leaf has a tiny symbol, hugging itself protectively, green and brown, cute forest spirit, seed phrase guardian` },

  // Round 2: Arcane Arsenal  
  { filename: 'the-liquidator.jpg', prompt: `${S}, a giant muscular bull with lightning bolt horns smashing through a wall of red candles, angry powerful expression, yellow lightning everywhere, liquidation cascade energy` },
  { filename: 'redcandle-witch.jpg', prompt: `${S}, a cute goth witch cat with a pointed hat surrounded by floating red candles, casting a hex that makes charts go down, dark red and black, bearish magic` },
  { filename: 'diamond-hands-golem.jpg', prompt: `${S}, a chunky robot made entirely of sparkling diamonds giving two thumbs up, refusing to sell, diamond hands emoji energy, rainbow prismatic shine, HODL forever` },
  { filename: 'rug-walker.jpg', prompt: `${S}, a creepy cute shadow creature made of void and darkness with multiple glowing purple eyes walking across a bridge between two destroyed worlds, eldritch but adorable` },
  { filename: 'dead-cat-bounce.jpg', prompt: `${S}, a cat with angel wings and a halo bouncing on a trampoline made of a price chart, going up then down, orange tabby cat, phoenix fire trail, hopium energy` },
  { filename: 'whale.jpg', prompt: `${S}, an enormous blue whale wearing a crown and gold chain necklace, swimming through an ocean of green coins, rich whale energy, deep blue and gold, market mover` },

  // Round 3: Monad Monsters
  { filename: 'nadzilla.jpg', prompt: `${S}, a cute purple baby godzilla kaiju with green glowing eyes stomping through a tiny blockchain city, purple and green color scheme, powerful but adorable, monad purple aesthetic` },
  { filename: 'blob-validator.jpg', prompt: `${S}, a happy round purple slime blob sitting on top of a glowing green cube, simple cute face with dot eyes and smile, purple and lavender, validating blocks by squishing them` },
  { filename: 'phantom-finalizer.jpg', prompt: `${S}, a cute purple ghost with a green glowing stamp hovering over documents, stamping FINAL on everything it touches, ethereal purple wisps, bureaucratic ghost energy` },
  { filename: 'gremlin-mev.jpg', prompt: `${S}, a tiny purple gremlin creature with huge pointed ears stealing gold coins from a conveyor belt, mischievous grin, purple and gold, speed lines showing it moving fast` },
  { filename: 'monadium.jpg', prompt: `${S}, a chunky purple and green crystal golem robot with circuit board patterns, standing in a power pose, glowing green energy core in chest, solid and powerful` },
  { filename: 'octoracle.jpg', prompt: `${S}, a mystical purple octopus wearing a fortune teller turban, each tentacle holding a different glowing orb, one eye bigger than the other, psychic vibes, purple and teal` },
  { filename: 'gas-guzzler.jpg', prompt: `${S}, a round purple hamster-like creature with its mouth wide open eating green gas pump nozzles, always hungry, purple with green drool, silly and gluttonous` },
  { filename: 'shard-wyrm.jpg', prompt: `${S}, a long serpentine dragon made of purple crystal shards and prisms, each segment a different shade of purple and pink, majestic but cute, crystalline beauty` },
  { filename: 'mempool-lurker.jpg', prompt: `${S}, a creepy cute purple anglerfish with one big green glowing lure light, hiding in dark water, watching and waiting, deep purple, single green eye glowing` },
  { filename: 'bft-crab.jpg', prompt: `${S}, a tough armored purple crab with green glowing claws in a boxing stance, wearing tiny boxing gloves, ready to fight, byzantine shell patterns, purple and green` },
  { filename: 'block-bunny.jpg', prompt: `${S}, the cutest tiny purple bunny rabbit with oversized ears sitting on a glowing green block, sparkle effects, speed lines behind it, fast bunny energy, kawaii maximum` },
  { filename: 'the-devnet-horror.jpg', prompt: `${S}, a glitchy corrupted creature made of broken purple pixels and red error symbols, half-formed face glitching in and out, digital nightmare but somehow cute, vaporwave horror` },
]

async function generateImage(card: CardArt): Promise<void> {
  console.log(`Generating: ${card.filename}...`)

  const res = await fetch('https://fal.run/fal-ai/flux-pro/v1.1', {
    method: 'POST',
    headers: {
      'Authorization': `Key ${FAL_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: card.prompt,
      image_size: { width: 768, height: 1024 },
      num_images: 1,
      safety_tolerance: '5',
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error(`Failed ${card.filename}: ${res.status} ${err}`)
    return
  }

  const data = await res.json()

  if (data.images?.[0]?.url) {
    await downloadImage(data.images[0].url, card.filename)
  } else {
    console.error(`Unexpected response for ${card.filename}:`, JSON.stringify(data).slice(0, 200))
  }
}

async function downloadImage(url: string, filename: string): Promise<void> {
  const res = await fetch(url)
  const buffer = Buffer.from(await res.arrayBuffer())
  const outPath = join(OUT_DIR, filename)
  writeFileSync(outPath, buffer)
  console.log(`  ✓ ${filename} (${(buffer.length / 1024).toFixed(0)}KB)`)
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true })
  console.log(`Generating ${cards.length} cards with Flux 2 Pro (memetic style)...\n`)

  for (let i = 0; i < cards.length; i += 3) {
    const batch = cards.slice(i, i + 3)
    await Promise.all(batch.map(c => generateImage(c)))
    console.log(`--- Batch ${Math.floor(i/3)+1}/${Math.ceil(cards.length/3)} done ---\n`)
  }

  console.log('✅ All cards generated!')
}

main().catch(console.error)
