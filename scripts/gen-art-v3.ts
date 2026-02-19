/**
 * Generate card art v3 — Consistent TCG art style like professional card games
 * Painterly digital art with depth, NOT flat sticker style
 */

import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'

const FAL_KEY = process.env.FAL_KEY!
const OUT_DIR = join(__dirname, '..', 'public', 'cards')

interface CardArt { filename: string; prompt: string }

// Professional TCG art style — think Magic the Gathering meets Pokemon meets crypto culture
const S = `professional trading card game illustration, detailed digital painting, painterly style with visible brushstrokes, dramatic lighting, rich saturated colors, character portrait with dynamic pose, fantasy card game art quality, detailed background environment, NOT flat NOT vector NOT clipart NOT sticker, painted illustration style similar to Magic the Gathering card art, masterwork quality, no text no words no letters no card frame`

const cards: CardArt[] = [
  // Monad Monsters — purple/green theme
  { filename: 'nadzilla.jpg', prompt: `${S}, a fearsome purple dragon kaiju with bioluminescent green veins across its scales, standing in a destroyed neon city at night, green energy crackling from its jaws, purple and green color palette, imposing and powerful, kaiju movie poster quality` },
  { filename: 'blob-validator.jpg', prompt: `${S}, an adorable translucent purple slime creature perched atop a glowing emerald crystal cube, the slime reflects light like glass, mushroom forest background, soft purple ambient lighting, cute but detailed painterly style` },
  { filename: 'phantom-finalizer.jpg', prompt: `${S}, an ethereal ghost samurai made of swirling purple mist and green spirit fire, wielding a spectral katana, floating above ancient ruins, cherry blossoms made of data particles, haunting beauty` },
  { filename: 'gremlin-mev.jpg', prompt: `${S}, a cunning purple goblin-gremlin in a leather vest covered in stolen gold coins, perched on a pile of treasure in a dark cavern, glowing golden eyes, mischievous sharp-toothed grin, torchlight illumination` },
  { filename: 'monadium.jpg', prompt: `${S}, a towering crystal golem made of dark purple obsidian with glowing green circuitry running through cracks in its body, standing in a lightning storm, green energy core pulsing in chest, epic scale` },
  { filename: 'octoracle.jpg', prompt: `${S}, a mystical deep-sea octopus with galaxy-pattern purple tentacles, each holding a different glowing prophecy orb, floating in an underwater temple with bioluminescent coral, wise ancient eyes, teal and purple` },
  { filename: 'gas-guzzler.jpg', prompt: `${S}, a chubby purple creature like a mix between a hippo and a piranha, mouth impossibly wide open inhaling streams of green energy, sitting in a swamp of glowing green liquid, comical but painted with detail` },
  { filename: 'shard-wyrm.jpg', prompt: `${S}, a magnificent serpentine dragon made entirely of prismatic purple and pink crystal shards, coiling through a dimensional rift, each crystal scale refracting rainbow light, majestic and otherworldly` },
  { filename: 'mempool-lurker.jpg', prompt: `${S}, a terrifying deep-sea anglerfish creature with dark purple skin lurking in pitch black depths, single green bioluminescent lure glowing eerily, barely visible sharp teeth, horror movie underwater lighting` },
  { filename: 'bft-crab.jpg', prompt: `${S}, a battle-scarred armored crab with purple iridescent shell plates and massive glowing green claws, standing defiantly on a rocky shore at sunset, barnacles and scars showing age, warrior crab energy` },
  { filename: 'block-bunny.jpg', prompt: `${S}, a small magical purple rabbit with oversized ears that glow at the tips, sitting on a floating green data block, speed afterimages trailing behind showing incredible speed, starfield background, cute but epic` },
  { filename: 'the-devnet-horror.jpg', prompt: `${S}, a nightmarish entity emerging from a cracked computer screen, half digital half organic, purple glitch pixels forming a screaming face with red error codes swirling around it, dark room with monitor glow, cosmic horror` },

  // Creatures of the Abyss — red/dark theme
  { filename: 'rugpull-dragon.jpg', prompt: `${S}, a massive crimson dragon sitting on a throne of gold coins and broken chains, wearing a cracked crown, one claw pulling away a golden rug revealing a black void beneath, volcanic hellscape background, greed incarnate` },
  { filename: 'the-deployer.jpg', prompt: `${S}, a mysterious cloaked figure with glowing purple arcane symbols floating around their hands, face hidden in shadow except for piercing violet eyes, standing at a runic altar with holographic code projected above, dark sorcerer energy` },
  { filename: 'ser-greencandle.jpg', prompt: `${S}, a noble golden-armored knight mounted on a rearing horse made of pure green candlestick energy, holding a banner that blazes with green fire, sunrise battlefield background, triumphant heroic pose` },
  { filename: 'sandwich-bot.jpg', prompt: `${S}, a sinister mechanical automaton with a humanoid frame built from dark steel and red LEDs, multiple mechanical arms extending from its back each holding stolen coins, dark factory background with steam, menacing` },
  { filename: 'frozen-liquidity.jpg', prompt: `${S}, an ancient ice dragon encased in a glacier of frozen blue liquid, coins and tokens visible trapped in the ice, one eye slowly opening with blue fire, arctic cavern with aurora borealis visible through ice ceiling` },
  { filename: 'seed-phrase-treant.jpg', prompt: `${S}, an ancient wise tree entity with a face carved from bark, exactly twelve glowing branches each bearing a luminous rune-leaf, deep enchanted forest with fireflies, warm green and gold lighting, guardian spirit` },

  // Arcane Arsenal — blue/gold theme
  { filename: 'the-liquidator.jpg', prompt: `${S}, a titan made of storm clouds and golden lightning, fists crackling with electrical energy, standing in the eye of a thunderstorm above a destroyed city, blue-grey clouds with golden lightning bolts, god of destruction` },
  { filename: 'redcandle-witch.jpg', prompt: `${S}, a beautiful dark sorceress with flowing black hair and red eyes, surrounded by floating red candles that drip blood-red wax, casting dark magic from a grimoire, gothic cathedral background, dark elegance` },
  { filename: 'diamond-hands-golem.jpg', prompt: `${S}, a massive golem forged from raw diamond crystal, light refracting through its entire body creating rainbow caustics, in a crystal cave, fists clenched in determination, prismatic and beautiful` },
  { filename: 'rug-walker.jpg', prompt: `${S}, a cosmic eldritch entity walking between collapsing dimensional portals, body made of living void with purple nebula patterns and countless tiny stars, leaving destruction in its wake, incomprehensible scale, lovecraftian beauty` },
  { filename: 'dead-cat-bounce.jpg', prompt: `${S}, a magnificent phoenix cat with nine tails made of orange and gold flames, rising from a pile of ashes shaped like a price chart, determined fierce expression, ember particles floating upward, rebirth energy, warm dramatic lighting` },
  { filename: 'whale.jpg', prompt: `${S}, a colossal cosmic whale swimming through space, body covered in constellation patterns and bioluminescent markings, smaller fish following in its wake, a tiny planet visible for scale, deep blue and gold, majestic beyond measure` },
]

async function generateImage(card: CardArt): Promise<void> {
  console.log(`Generating: ${card.filename}...`)
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
    console.log(`  ✓ ${card.filename} (${(buffer.length / 1024).toFixed(0)}KB)`)
  } else {
    console.error(`No image for ${card.filename}`)
  }
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true })
  console.log(`Generating ${cards.length} cards with Flux 2 Pro (TCG painterly style)...\n`)
  for (let i = 0; i < cards.length; i += 3) {
    const batch = cards.slice(i, i + 3)
    await Promise.all(batch.map(c => generateImage(c)))
    console.log(`--- Batch ${Math.floor(i/3)+1}/${Math.ceil(cards.length/3)} done ---\n`)
  }
  console.log('✅ All cards generated!')
}

main().catch(console.error)
