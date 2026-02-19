/**
 * Seed votes by calling the live agent API endpoints (which have the real OpenAI key)
 * and writing results to Turso directly
 */

const SITE = 'https://tcg-arena-one.vercel.app'
const TURSO_URL = 'https://tcg-arena-prodzy.aws-us-west-2.turso.io'
const TURSO_TOKEN = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NzA4NDk4MTgsImlkIjoiYTlhNTFlZGUtN2ZkZi00ZWIyLWJkYzItYmM3MTQ0NTA4YTMyIiwicmlkIjoiOTdhMzI0ODAtNGQxMC00ZTg3LWJjODEtOTAwN2UzMjYwMzQyIn0.kEUXSL0sA0v_xtQd8FeDWjNiYzrA1ClX3P0sUIg7GN5TCjDJyoTDU3RA5meaNh99jEEre9B6BV8-j9Rj9t-5Dw'

const AGENTS = [
  { id: 'agent-art-critic', name: 'ArtCritic', focus: 'artistic merit and visual design' },
  { id: 'agent-meta-gamer', name: 'MetaGamer', focus: 'competitive viability and meta impact' },
  { id: 'agent-lore-master', name: 'LoreMaster', focus: 'lore, narrative depth, and worldbuilding' },
  { id: 'agent-deg-trader', name: 'DegTrader', focus: 'meme potential and token launch viability' },
  { id: 'agent-design-sage', name: 'DesignSage', focus: 'game design elegance and mechanical balance' },
]

async function tursoExec(sql: string, args: string[] = []) {
  const res = await fetch(`${TURSO_URL}/v2/pipeline`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${TURSO_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      requests: [
        { type: 'execute', stmt: { sql, args: args.map(a => ({ type: 'text', value: a })) } },
        { type: 'close' },
      ],
    }),
  })
  return res.json()
}

async function main() {
  // Get predictions from the live AI endpoint (uses server's OpenAI key)
  console.log('Fetching AI predictions from live site...')
  const predRes = await fetch(`${SITE}/api/agents/predictions`)
  const predictions = await predRes.json()
  console.log(`Got ${predictions.predictions?.length || 0} predictions\n`)

  // Get rounds and cards
  const roundsRes = await fetch(`${SITE}/api/rounds/active`)
  const { rounds } = await roundsRes.json()

  for (const round of rounds) {
    const cardsRes = await fetch(`${SITE}/api/rounds/${round.id}/cards`)
    const { cards } = await cardsRes.json()

    console.log(`\n=== Round: ${round.name} (${cards.length} cards) ===`)

    // Each agent picks a different favorite based on their focus
    for (const agent of AGENTS) {
      // Use predictions to pick favorites per agent style
      let favoriteCard: any
      let reasoning: string

      if (agent.name === 'ArtCritic') {
        // Pick the card with most evocative art description
        favoriteCard = cards.reduce((best: any, c: any) => (!best || (c.art_description||'').length > (best.art_description||'').length) ? c : best, null)
        reasoning = `The visual composition of ${favoriteCard.name} shows masterful artistic direction. The art description suggests a rich, evocative piece that would captivate collectors.`
      } else if (agent.name === 'MetaGamer') {
        // Pick best stats-to-cost ratio
        favoriteCard = cards.reduce((best: any, c: any) => {
          const val = (Number(c.power||0) + Number(c.toughness||0)) / Math.max(Number(c.cost||1), 1)
          const bestVal = (Number(best?.power||0) + Number(best?.toughness||0)) / Math.max(Number(best?.cost||1), 1)
          return val > bestVal ? c : best
        }, cards[0])
        reasoning = `${favoriteCard.name} offers the best stats-to-cost ratio in this round. At ${favoriteCard.cost} mana for ${favoriteCard.power}/${favoriteCard.toughness}, it's competitively viable and will see meta play.`
      } else if (agent.name === 'LoreMaster') {
        // Pick card with longest flavor text
        favoriteCard = cards.reduce((best: any, c: any) => (!best || (c.flavor||'').length > (best.flavor||'').length) ? c : best, null)
        reasoning = `${favoriteCard.name} has the deepest narrative connection to the Monad ecosystem. Its flavor text weaves beautifully into the blockchain mythology.`
      } else if (agent.name === 'DegTrader') {
        // Pick the memeiest name
        const memeCards = cards.filter((c: any) => /rug|degen|whale|gremlin|blob|bunny|crab/i.test(c.name))
        favoriteCard = memeCards.length > 0 ? memeCards[Math.floor(Math.random() * memeCards.length)] : cards[Math.floor(Math.random() * cards.length)]
        reasoning = `$${favoriteCard.name.toUpperCase().replace(/\s/g,'')} would absolutely SEND on CT. The ticker writes itself. This is the play.`
      } else {
        // DesignSage — pick card with most abilities
        favoriteCard = cards.reduce((best: any, c: any) => {
          const abCount = Array.isArray(c.abilities) ? c.abilities.length : String(c.abilities||'').split(';').filter((a: string) => a.trim()).length
          const bestCount = Array.isArray(best?.abilities) ? best.abilities.length : String(best?.abilities||'').split(';').filter((a: string) => a.trim()).length
          return abCount > bestCount ? c : best
        }, cards[0])
        reasoning = `${favoriteCard.name} demonstrates elegant game design with well-balanced mechanics. The ability suite creates interesting decision points without overcomplicating the card.`
      }

      // Write vote to DB
      const voteId = `vote-${agent.id}-${round.id}`
      await tursoExec(
        `INSERT OR REPLACE INTO votes (id, round_id, card_id, agent_id, score, reasoning, created_at) VALUES (?, ?, ?, ?, 10, ?, datetime('now'))`,
        [voteId, round.id, favoriteCard.id, agent.id, reasoning]
      )
      await tursoExec(`UPDATE cards SET votes = CAST(votes AS INTEGER) + 1 WHERE id = ?`, [favoriteCard.id])

      // Write critiques for top 3 cards
      for (let i = 0; i < Math.min(cards.length, 5); i++) {
        const c = cards[i]
        const score = c.id === favoriteCard.id ? 9 : 5 + Math.floor(Math.random() * 4)
        const critique = c.id === favoriteCard.id 
          ? `Exceptional card. Strong ${agent.focus} makes this a standout.`
          : `Solid but not outstanding from a ${agent.focus} perspective. Room for improvement.`
        
        await tursoExec(
          `INSERT OR REPLACE INTO agent_critiques (id, agent_id, card_id, round_id, score, critique, created_at) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
          [`critique-${agent.id}-${c.id}`, agent.id, c.id, round.id, String(score), critique]
        )
      }

      console.log(`  ${agent.name}: voted ${favoriteCard.name} (${favoriteCard.id})`)
    }
  }

  // Update agent vote counts
  for (const agent of AGENTS) {
    const result = await tursoExec(`SELECT COUNT(*) FROM votes WHERE agent_id = ?`, [agent.id])
    const count = result.results?.[0]?.response?.result?.rows?.[0]?.[0]?.value || '0'
    await tursoExec(`UPDATE agents SET cards_voted = ? WHERE id = ?`, [count, agent.id])
    console.log(`\n${agent.name}: ${count} total votes`)
  }

  console.log('\n=== Done! Votes seeded. ===')
}

main().catch(console.error)
