/**
 * Regenerate ONLY legendary cards with ultra-premium art
 * These need to look like "THAT'S HIM" - epic, aura, god-tier
 */

import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'

const FAL_KEY = process.env.FAL_KEY!
const OUT_DIR = join(__dirname, '..', 'public', 'cards')

interface CardArt { filename: string; prompt: string }

const LEGENDARY_STYLE = `masterpiece digital painting, ultra detailed, cinematic dramatic lighting, god rays, ethereal glow, aura of power radiating from character, particle effects, lens flare, epic fantasy card game art like the most expensive Magic the Gathering card, 8k quality, volumetric lighting, atmospheric depth, character surrounded by energy and light, imposing presence, THIS IS THE FINAL BOSS energy, no text no words no card frame`

const cards: CardArt[] = [
  { filename: 'nadzilla.jpg', prompt: `${LEGENDARY_STYLE}, an ENORMOUS purple dragon kaiju towering over a destroyed cyberpunk city, bioluminescent green veins pulsing across its entire body like circuitry, green nuclear energy pouring from its open jaws illuminating everything, lightning striking around it, its eyes are twin green suns, debris and buildings floating in its gravitational field, the sky is torn apart revealing code beneath reality, absolute apex predator energy, purple and neon green` },
  
  { filename: 'frozen-liquidity.jpg', prompt: `${LEGENDARY_STYLE}, a COLOSSAL ice dragon deity frozen in the act of emerging from a glacier the size of a mountain, one massive eye glowing brilliant blue through layers of ancient ice, billions of tiny frozen coins and crystals visible trapped in the ice creating a galaxy of wealth, aurora borealis spiraling directly from its horns into the sky, the frozen ocean beneath it cracking from its power, everything is crystalline blue and white and silver, imprisoned god energy` },
  
  { filename: 'shard-wyrm.jpg', prompt: `${LEGENDARY_STYLE}, a magnificent serpentine dragon made ENTIRELY of prismatic crystal shards, each individual scale is a perfect crystal catching and refracting light into rainbow caustics across the entire scene, coiling through a dimensional rift between two colliding galaxies, its body stretches infinitely through space, where its crystals touch they create new stars, purple and pink and iridescent, reality bending around its form, cosmic serpent god` },
  
  { filename: 'rug-walker.jpg', prompt: `${LEGENDARY_STYLE}, an incomprehensible ELDRITCH ENTITY walking between collapsing dimensional portals, its body is made of living void — a silhouette of absolute darkness filled with swirling purple nebulae and dying stars, hundreds of glowing purple eyes scattered across its impossible geometry, reality literally unraveling in threads where it walks, destroyed worlds floating in its wake like dust, lovecraftian cosmic horror of unimaginable scale, deep purple and void black with star-white eyes` },
  
  { filename: 'dead-cat-bounce.jpg', prompt: `${LEGENDARY_STYLE}, a DIVINE phoenix-cat hybrid engulfed in a supernova of orange and gold flames, nine blazing tails each longer than a city block streaming behind it, rising from an ocean of ashes that stretches to the horizon, its eyes are pure white-hot fire, the sky above splits between burning orange dawn and stellar night, feathers made of pure solar plasma, each wing beat creates shockwaves visible in the air, rebirth incarnate, ultimate comeback energy` },
  
  { filename: 'whale.jpg', prompt: `${LEGENDARY_STYLE}, a COSMIC LEVIATHAN whale of impossible size swimming through the fabric of space itself, its body covered in constellation patterns that are ACTUAL STARS, a crown of golden light orbiting its head, entire galaxies reflected in its ancient wise eye, schools of smaller luminous creatures following in its gravitational wake, a tiny planet Earth visible for scale showing how incomprehensibly massive it is, deep blue and gold and starlight, god of the ocean and space, market mover of reality itself` },

  { filename: 'rugpull-dragon.jpg', prompt: `${LEGENDARY_STYLE}, a TERRIFYING crimson dragon the size of a skyscraper sitting on a MOUNTAIN of gold coins and stolen treasure that fills an entire volcanic caldera, wearing a cracked obsidian crown with ruby eyes, one massive claw pulling away a golden carpet revealing an endless black void of absolute nothing beneath, molten gold dripping from its fangs, the volcano erupting behind it, red lightning in black clouds, ultimate greed dragon, pure menace and wealth, crimson and gold and hellfire` },
]

async function generateImage(card: CardArt): Promise<void> {
  console.log(`🔥 Generating LEGENDARY: ${card.filename}...`)
  const res = await fetch('https://fal.run/fal-ai/flux-pro/v1.1', {
    method: 'POST',
    headers: { 'Authorization': `Key ${FAL_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: card.prompt, image_size: { width: 768, height: 1024 }, num_images: 1, safety_tolerance: '5' }),
  })
  if (!res.ok) { console.error(`Failed ${card.filename}: ${res.status} ${await res.text()}`); return }
  const data = await res.json()
  if (data.images?.[0]?.url) {
    const imgRes = await fetch(data.images[0].url)
    const buffer = Buffer.from(await imgRes.arrayBuffer())
    writeFileSync(join(OUT_DIR, card.filename), buffer)
    console.log(`  👑 ${card.filename} (${(buffer.length / 1024).toFixed(0)}KB)`)
  }
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true })
  console.log(`Regenerating ${cards.length} LEGENDARY cards with god-tier art...\n`)
  // Run 2 at a time for legendaries (want max quality)
  for (let i = 0; i < cards.length; i += 2) {
    const batch = cards.slice(i, i + 2)
    await Promise.all(batch.map(c => generateImage(c)))
    console.log('')
  }
  console.log('👑 All legendaries regenerated!')
}

main().catch(console.error)
