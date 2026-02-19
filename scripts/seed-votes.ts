/**
 * Seed real AI agent votes directly into Turso DB
 * Runs locally, calls OpenAI + Turso directly
 */

const SITE = 'https://tcg-arena-one.vercel.app'
const TURSO_URL = 'https://tcg-arena-prodzy.aws-us-west-2.turso.io'
const TURSO_TOKEN = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NzA4NDk4MTgsImlkIjoiYTlhNTFlZGUtN2ZkZi00ZWIyLWJkYzItYmM3MTQ0NTA4YTMyIiwicmlkIjoiOTdhMzI0ODAtNGQxMC00ZTg3LWJjODEtOTAwN2UzMjYwMzQyIn0.kEUXSL0sA0v_xtQd8FeDWjNiYzrA1ClX3P0sUIg7GN5TCjDJyoTDU3RA5meaNh99jEEre9B6BV8-j9Rj9t-5Dw'
const OPENAI_KEY = process.env.OPENAI_API_KEY || ''

const AGENTS = [
  { id: 'agent-art-critic', name: 'ArtCritic', personality: 'You evaluate TCG cards on artistic merit, visual design, and aesthetic appeal. Bold compositions and thematic coherence matter most.' },
  { id: 'agent-meta-gamer', name: 'MetaGamer', personality: 'You evaluate TCG cards on competitive viability. Mana efficiency, ability synergies, and meta impact drive your picks.' },
  { id: 'agent-lore-master', name: 'LoreMaster', personality: 'You evaluate TCG cards on lore and narrative depth. How cards fit the Monad blockchain ecosystem story matters most.' },
  { id: 'agent-deg-trader', name: 'DegTrader', personality: 'You evaluate cards like a crypto degen. Which cards make the best meme tokens? Which tickers would trend? Meme potential is king.' },
  { id: 'agent-design-sage', name: 'DesignSage', personality: 'You evaluate cards on game design elegance. Clean mechanics, appropriate complexity, and interesting decisions matter most.' },
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

async function callOpenAI(personality: string, prompt: string): Promise<string> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_KEY}` },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'system', content: personality }, { role: 'user', content: prompt }],
      temperature: 0.8, max_tokens: 2000,
      response_format: { type: 'json_object' },
    }),
  })
  if (!res.ok) throw new Error(`OpenAI ${res.status}`)
  const data = await res.json()
  return data.choices[0].message.content
}

async function main() {
  if (!OPENAI_KEY) { console.error('Set OPENAI_API_KEY env var'); process.exit(1) }

  const roundsRes = await fetch(`${SITE}/api/rounds/active`)
  const { rounds } = await roundsRes.json()
  console.log(`${rounds.length} active rounds\n`)

  for (const agent of AGENTS) {
    console.log(`=== ${agent.name} ===`)
    
    for (const round of rounds) {
      const cardsRes = await fetch(`${SITE}/api/rounds/${round.id}/cards`)
      const { cards } = await cardsRes.json()

      const cardDescs = cards.map((c: any, i: number) => {
        const stats = c.power !== null ? `${c.power}/${c.toughness}` : 'N/A'
        return `[${c.id}] "${c.name}" — Cost:${c.cost}, Stats:${stats}, Rarity:${c.rarity}, Abilities:${c.abilities||'None'}`
      }).join('\n')

      const prompt = `Judge Round "${round.name}" (${round.theme}), ${cards.length} cards:\n\n${cardDescs}\n\nPick your favorite and critique each. Return JSON:\n{"favoriteCardId":"<id>","reasoning":"<why 1-2 sentences>","critiques":[{"cardId":"<id>","score":<1-10>,"critique":"<brief>"}]}`

      try {
        const response = await callOpenAI(agent.personality, prompt)
        const parsed = JSON.parse(response)
        
        // Insert vote into DB
        const voteId = `vote-${agent.id}-${round.id}`
        await tursoExec(
          `INSERT OR REPLACE INTO votes (id, round_id, card_id, agent_id, score, reasoning, created_at) VALUES (?, ?, ?, ?, 10, ?, datetime('now'))`,
          [voteId, round.id, parsed.favoriteCardId, agent.id, parsed.reasoning]
        )

        // Update card vote count
        await tursoExec(`UPDATE cards SET votes = votes + 1 WHERE id = ?`, [parsed.favoriteCardId])

        // Insert critiques
        for (const c of (parsed.critiques || [])) {
          const critiqueId = `critique-${agent.id}-${c.cardId}`
          await tursoExec(
            `INSERT OR REPLACE INTO agent_critiques (id, agent_id, card_id, round_id, score, critique, created_at) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
            [critiqueId, agent.id, c.cardId, round.id, String(c.score), c.critique]
          )
        }

        console.log(`  ✅ ${round.name}: voted ${parsed.favoriteCardId} — "${parsed.reasoning.slice(0, 60)}..."`)
      } catch (err) {
        console.log(`  ❌ ${round.name}: ${err}`)
      }
    }
    console.log()
  }

  // Show results
  console.log('=== Final Vote Counts ===')
  const result = await tursoExec('SELECT c.name, c.votes, c.round_id FROM cards WHERE CAST(c.votes AS INTEGER) > 0 ORDER BY CAST(c.votes AS INTEGER) DESC')
  const rows = result.results?.[0]?.response?.result?.rows || []
  for (const r of rows) {
    console.log(`  ${r[0].value}: ${r[1].value} votes (${r[2].value})`)
  }
}

main().catch(console.error)
