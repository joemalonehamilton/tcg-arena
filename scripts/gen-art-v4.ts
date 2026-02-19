/**
 * Generate all card art v4 — Rarity-differentiated art styles
 * Kevin approved test samples 2026-02-12
 * 
 * Style tiers:
 * - Low-cost creatures (1-2): COMMON ink sketch style
 * - Mid-cost creatures (3-4): UNCOMMON stylized painterly
 * - High-cost creatures (5-6): RARE cinematic painting
 * - Boss creatures (7-8): LEGENDARY/MYTHIC hyper-detailed
 */

import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'

const FAL_KEY = '27bf6530-adf8-403c-bd17-7aa55063ccbb:419aff16f1b93ecea2f6cdbd7fddd75e'
const OUT_DIR = join(__dirname, '..', 'public', 'cards')

const COMMON = `rough ink sketch illustration, concept art style, visible pen strokes, limited color palette mostly black and gray with one accent color, raw and unpolished, quick gestural drawing energy, manga influence, NOT photorealistic, sketch on weathered parchment paper texture, trading card game art, no text no words no letters`

const UNCOMMON = `stylized digital character art, expressive cartoon-meets-painterly style, bold outlines with rich colors, character showing personality and attitude, dynamic pose with expression, cel-shaded lighting, thick confident brushstrokes, vibrant saturated colors, like Hades or Supergiant Games art style, trading card game illustration, no text no words no letters`

const RARE = `cinematic digital painting, dramatic action scene, dynamic composition with strong diagonals, volumetric lighting and particles, motion blur on action elements, movie poster quality, highly detailed environment, epic sense of scale, dramatic color grading, professional fantasy concept art, trading card game illustration, no text no words no letters`

const LEGENDARY = `hyper-detailed golden age illustration, intricate fine detail like Alphonse Mucha meets fantasy, ornate decorative elements, rich gold and jewel tones, every surface has texture, luminous quality, museum-quality oil painting technique in digital form, masterwork trading card art, no text no words no letters`

const MYTHIC = `transcendent cosmic digital art, reality-breaking composition, chromatic aberration and prismatic light, mix of hyperrealistic and abstract, god-like presence, the character IS the universe, dark background with explosions of impossible color, album cover art meets trading card game, absolutely iconic unforgettable image, no text no words no letters`

interface Card { filename: string; prompt: string }

const cards: Card[] = [
  // ===== LOW-COST (1-2 mana) — COMMON ink sketch style =====
  { filename: 'gas-guzzler.jpg',
    prompt: `${COMMON}, a fat round creature with impossibly wide mouth inhaling streams of green energy gas, bloated belly, scrappy, green accent on black ink, swamp setting sketched loosely` },
  { filename: 'block-bunny.jpg',
    prompt: `${COMMON}, a tiny rabbit with oversized ears sitting on a floating cube, speed lines trailing behind, cute but sketchy, green accent color, simple starfield background` },
  { filename: 'mempool-lurker.jpg',
    prompt: `${COMMON}, an anglerfish creature lurking in pitch black depths, single glowing green lure dangling, barely visible sharp teeth, horror vibe, green bioluminescent accent on dark ink` },
  { filename: 'blob-validator.jpg',
    prompt: `${COMMON}, a translucent blob slime creature sitting on a crystal cube, simple and cute, gelatinous texture, purple accent color on black ink sketch, mushroom background loosely drawn` },

  // ===== MID-COST (3-4 mana) — UNCOMMON stylized painterly =====
  { filename: 'gremlin-mev.jpg',
    prompt: `${UNCOMMON}, a cunning goblin-gremlin clutching stolen gold coins in a dark cave, sharp-toothed mischievous grin, purple and gold color scheme, crouched predatory pose` },
  { filename: 'bft-crab.jpg',
    prompt: `${UNCOMMON}, a battle-scarred armored crab with massive iridescent claws, standing defiant on rocks at sunset, purple shell plates, warrior energy, bold outlines` },
  { filename: 'octoracle.jpg',
    prompt: `${UNCOMMON}, a mystical deep-sea octopus with galaxy-pattern purple tentacles, each holding a glowing prophecy orb, underwater temple background, wise ancient eyes, teal and purple palette` },

  // ===== HIGH-COST (5-6 mana) — RARE cinematic painting =====
  { filename: 'phantom-finalizer.jpg',
    prompt: `${RARE}, an ethereal ghost samurai made of swirling purple mist and green spirit fire, wielding a spectral katana, floating above ancient ruins, cherry blossoms of data particles, haunting action scene` },
  { filename: 'monadium.jpg',
    prompt: `${RARE}, a towering crystal golem made of dark purple obsidian with glowing green circuitry running through cracks, standing in a lightning storm, green energy core pulsing in chest, epic scale` },
  { filename: 'the-devnet-horror.jpg',
    prompt: `${RARE}, a nightmarish entity emerging from a cracked computer screen, half digital half organic, purple glitch pixels forming a screaming face, red error codes swirling, cosmic horror, dramatic lighting` },
  { filename: 'the-deployer.jpg',
    prompt: `${RARE}, a mysterious cloaked figure with glowing purple arcane symbols floating around hands, face hidden in shadow except piercing violet eyes, runic altar with holographic code projected above, dramatic composition` },
  { filename: 'dead-cat-bounce.jpg',
    prompt: `${RARE}, a magnificent phoenix cat with nine tails of orange and gold flames, rising from ashes shaped like a crashing price chart, determined fierce expression, ember particles, dramatic warm lighting` },

  // ===== BOSS TIER (7-8 mana) — LEGENDARY hyper-detailed =====
  { filename: 'rugpull-dragon.jpg',
    prompt: `${LEGENDARY}, massive crimson dragon sitting on a throne of gold coins and broken chains, one claw pulling away a golden rug revealing a black void beneath, volcanic hellscape, intricate scales, greed incarnate` },
  { filename: 'shard-wyrm.jpg',
    prompt: `${LEGENDARY}, a magnificent serpentine dragon made of prismatic purple and pink crystal shards, coiling through a dimensional rift, each crystal scale refracting rainbow light, ornate and otherworldly` },
  { filename: 'frozen-liquidity.jpg',
    prompt: `${LEGENDARY}, ancient ice dragon partially entombed in massive glacier, millions of frozen coins visible in blue ice, one eye blazing with cold fire, aurora borealis reflected in ice, extraordinary detail, imprisoned power` },
  { filename: 'whale.jpg',
    prompt: `${LEGENDARY}, a colossal cosmic whale swimming through space, body covered in constellation patterns and bioluminescent markings, smaller fish in its wake, a tiny planet for scale, deep blue and gold, ornate celestial details` },
  { filename: 'rug-walker.jpg',
    prompt: `${LEGENDARY}, a cosmic eldritch entity walking between collapsing dimensional portals, body made of living void with purple nebula patterns and countless tiny stars, leaving destruction in its wake, incomprehensible scale, lovecraftian beauty, ornate details` },

  // ===== MYTHIC (Nadzilla only) =====
  { filename: 'nadzilla.jpg',
    prompt: `${MYTHIC}, NADZILLA the ultimate crypto kaiju god, colossal dragon-kaiju hybrid dwarfing mountains, body simultaneously solid and made of swirling purple cosmos and green blockchain data streams, reality cracks around it, each scale contains a tiny universe, green energy beams erupting from scales, sky splits open revealing void of space, absolute peak power fantasy` },
]

async function generateCard(card: Card): Promise<void> {
  console.log(`\n🎨 Generating: ${card.filename}...`)

  const submitRes = await fetch('https://queue.fal.run/fal-ai/flux-pro/v1.1', {
    method: 'POST',
    headers: { Authorization: `Key ${FAL_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: card.prompt, image_size: { width: 768, height: 1024 }, num_images: 1, safety_tolerance: '5' }),
  })

  const submitData = await submitRes.json()
  const statusUrl = submitData.status_url
  const responseUrl = submitData.response_url

  if (!statusUrl) { console.error(`  ❌ No status URL: ${JSON.stringify(submitData)}`); return }
  console.log(`  ⏳ Queued: ${submitData.request_id}`)

  for (let i = 0; i < 90; i++) {
    await new Promise(r => setTimeout(r, 3000))
    const statusRes = await fetch(statusUrl, { headers: { Authorization: `Key ${FAL_KEY}` } })
    const status = await statusRes.json()

    if (status.status === 'COMPLETED') {
      const resultRes = await fetch(responseUrl, { headers: { Authorization: `Key ${FAL_KEY}` } })
      const result = await resultRes.json()
      const imageUrl = result.images?.[0]?.url
      if (!imageUrl) { console.error('  ❌ No image URL in result'); return }

      const imgRes = await fetch(imageUrl)
      const buffer = Buffer.from(await imgRes.arrayBuffer())
      writeFileSync(join(OUT_DIR, card.filename), buffer)
      console.log(`  ✅ ${card.filename} (${Math.round(buffer.length / 1024)}KB)`)
      return
    }

    if (status.status === 'FAILED') { console.error('  ❌ Generation failed'); return }
    process.stdout.write('.')
  }
  console.error('  ❌ Timeout')
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true })
  console.log(`🎨 Generating ALL ${cards.length} cards with v4 rarity-tiered art styles...\n`)

  // Process in batches of 3
  for (let i = 0; i < cards.length; i += 3) {
    const batch = cards.slice(i, i + 3)
    console.log(`\n--- Batch ${Math.floor(i/3)+1}/${Math.ceil(cards.length/3)} ---`)
    await Promise.all(batch.map(c => generateCard(c)))
  }

  console.log('\n\n✅ All 18 cards generated! Check public/cards/')
}

main().catch(console.error)
