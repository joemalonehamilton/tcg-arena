/**
 * Art style test v4 — Different style per rarity tier
 */

import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'

const FAL_KEY = '27bf6530-adf8-403c-bd17-7aa55063ccbb:419aff16f1b93ecea2f6cdbd7fddd75e'
const OUT_DIR = join(__dirname, '..', 'public', 'cards-v4-test')

const COMMON_STYLE = `rough ink sketch illustration, concept art style, visible pen strokes, limited color palette mostly black and gray with one accent color, raw and unpolished, quick gestural drawing energy, manga influence, NOT photorealistic, sketch on weathered parchment paper texture, trading card game art`

const UNCOMMON_STYLE = `stylized digital character art, expressive cartoon-meets-painterly style, bold outlines with rich colors, character showing personality and attitude, dynamic pose with expression, cel-shaded lighting, thick confident brushstrokes, vibrant saturated colors, like Hades or Supergiant Games art style, trading card game illustration`

const RARE_STYLE = `cinematic digital painting, dramatic action scene, dynamic composition with strong diagonals, volumetric lighting and particles, motion blur on action elements, movie poster quality, highly detailed environment, epic sense of scale, dramatic color grading, professional fantasy concept art, trading card game illustration`

const LEGENDARY_STYLE = `hyper-detailed golden age illustration, intricate fine detail like Alphonse Mucha meets fantasy, ornate decorative elements, rich gold and jewel tones, every surface has texture, luminous quality, museum-quality oil painting technique in digital form, masterwork trading card art`

const MYTHIC_STYLE = `transcendent cosmic digital art, reality-breaking composition, chromatic aberration and prismatic light, mix of hyperrealistic and abstract, god-like presence, the character IS the universe, dark background with explosions of impossible color, album cover art meets trading card game, absolutely iconic unforgettable image`

interface TestCard { filename: string; prompt: string; rarity: string }

const testCards: TestCard[] = [
  { rarity: 'COMMON', filename: 'test-common-gas-gremlin.jpg',
    prompt: `${COMMON_STYLE}, a small fat gremlin creature with huge mouth gobbling wisps of green energy, messy and chaotic, scrappy little monster, green accent color on black ink, funny unhinged expression` },
  { rarity: 'UNCOMMON', filename: 'test-uncommon-sandwich-bot.jpg',
    prompt: `${UNCOMMON_STYLE}, a menacing robot with multiple mechanical arms, red LED eyes, hunched forward predatory stance, each arm holding stolen coin or token, smug cocky expression, dark purple and red color scheme` },
  { rarity: 'RARE', filename: 'test-rare-rugpull-dragon.jpg',
    prompt: `${RARE_STYLE}, massive crimson dragon mid-flight pulling a golden rug away from crumbling castle of gold coins, treasure scattering everywhere, dragon has devilish grin, volcanic sky, the moment of the rug pull captured in action` },
  { rarity: 'LEGENDARY', filename: 'test-legendary-frozen-liquidity.jpg',
    prompt: `${LEGENDARY_STYLE}, ancient ice dragon partially entombed in massive glacier, millions of frozen coins and crypto tokens visible in blue ice, one eye blazing with cold fire, aurora borealis reflected in ice, extraordinary detail, imprisoned power about to break free` },
  { rarity: 'MYTHIC', filename: 'test-mythic-nadzilla.jpg',
    prompt: `${MYTHIC_STYLE}, NADZILLA the ultimate crypto kaiju god, colossal dragon-kaiju hybrid dwarfing mountains, body simultaneously solid and made of swirling purple cosmos and green blockchain data streams, reality cracks around it, each scale contains a tiny universe, green energy beams erupting from scales, sky splits open revealing void of space, absolute peak power fantasy` },
]

async function generateCard(card: TestCard): Promise<void> {
  console.log(`\n🎨 Generating ${card.rarity}: ${card.filename}...`)

  // Submit to queue
  const submitRes = await fetch('https://queue.fal.run/fal-ai/flux-pro/v1.1', {
    method: 'POST',
    headers: { Authorization: `Key ${FAL_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: card.prompt, image_size: { width: 768, height: 1024 }, num_images: 1, safety_tolerance: '5' }),
  })

  const submitData = await submitRes.json()
  const statusUrl = submitData.status_url
  const responseUrl = submitData.response_url

  if (!statusUrl) { console.error('  ❌ No status URL:', JSON.stringify(submitData)); return }
  console.log(`  ⏳ Queued: ${submitData.request_id}`)

  // Poll for completion
  for (let i = 0; i < 60; i++) {
    await new Promise(r => setTimeout(r, 3000))
    const statusRes = await fetch(statusUrl, { headers: { Authorization: `Key ${FAL_KEY}` } })
    const status = await statusRes.json()

    if (status.status === 'COMPLETED') {
      // Fetch result
      const resultRes = await fetch(responseUrl, { headers: { Authorization: `Key ${FAL_KEY}` } })
      const result = await resultRes.json()
      const imageUrl = result.images?.[0]?.url
      if (!imageUrl) { console.error('  ❌ No image URL in result'); return }

      const imgRes = await fetch(imageUrl)
      const buffer = Buffer.from(await imgRes.arrayBuffer())
      const outPath = join(OUT_DIR, card.filename)
      writeFileSync(outPath, buffer)
      console.log(`  ✅ Saved: ${outPath} (${Math.round(buffer.length / 1024)}KB)`)
      return
    }

    if (status.status === 'FAILED') { console.error('  ❌ Generation failed'); return }
    process.stdout.write('.')
  }
  console.error('  ❌ Timeout')
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true })
  console.log('🎨 Art Style Test v4 — 5 cards, different style per rarity')

  for (const card of testCards) {
    await generateCard(card)
  }

  console.log('\n✅ All done! Check public/cards-v4-test/')
}

main().catch(console.error)
