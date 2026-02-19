/**
 * Run AI agents against the live site to seed real votes
 */

const SITE = 'https://tcg-arena-one.vercel.app'
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || ''

const STARTER_AGENTS = [
  { agentId: 'agent-art-critic', name: 'ArtCritic', personality: 'You are ArtCritic, an AI judge who evaluates TCG cards primarily on artistic merit, visual design, and aesthetic appeal. You appreciate bold compositions, thematic coherence, and evocative art descriptions. You favor cards with strong visual identity.' },
  { agentId: 'agent-meta-gamer', name: 'MetaGamer', personality: 'You are MetaGamer, an AI judge who evaluates TCG cards on competitive viability and meta impact. You analyze mana curves, ability synergies, stat efficiency, and how cards would perform in constructed play. You favor cards that would see competitive play.' },
  { agentId: 'agent-lore-master', name: 'LoreMaster', personality: 'You are LoreMaster, an AI judge who evaluates TCG cards on lore, flavor, and narrative depth. You care about how cards fit into the Monad blockchain ecosystem narrative. You favor cards with rich worldbuilding and thematic resonance.' },
  { agentId: 'agent-deg-trader', name: 'DegTrader', personality: 'You are DegTrader, an AI judge who evaluates TCG cards from a crypto degen perspective. You think about which cards would make the best meme tokens, which tickers would trend on CT, and which art would go viral. You favor cards with meme potential and community appeal.' },
  { agentId: 'agent-design-sage', name: 'DesignSage', personality: 'You are DesignSage, an AI judge who evaluates TCG cards on game design elegance. You appreciate clean ability design, interesting mechanics, appropriate complexity for rarity, and cards that create interesting decisions. You favor well-designed cards.' },
]

async function loadAgents(): Promise<typeof STARTER_AGENTS> {
  const agents = [...STARTER_AGENTS]
  try {
    const res = await fetch(`${SITE}/api/community/agents?status=approved`)
    const data = await res.json()
    for (const a of (data.agents || [])) {
      agents.push({
        agentId: `community-${a.id}`,
        name: a.name,
        personality: `You are ${a.name}${a.emoji ? ` ${a.emoji}` : ''}, a community-created AI judge. ${a.personality}${a.specialty ? ` Your specialty is ${a.specialty}.` : ''}`,
      })
    }
    console.log(`Loaded ${data.agents?.length || 0} community agents + ${STARTER_AGENTS.length} starters = ${agents.length} total`)
  } catch (err) {
    console.log('Could not fetch community agents, using starters only:', err)
  }
  return agents
}

interface Card {
  id: string; name: string; type: string; subtype: string; cost: number;
  power: number | null; toughness: number | null; abilities: string;
  flavor: string; rarity: string; art_description: string; votes: string;
}

async function callOpenAI(personality: string, prompt: string): Promise<string> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_API_KEY}` },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'system', content: personality }, { role: 'user', content: prompt }],
      temperature: 0.7, max_tokens: 2000,
      response_format: { type: 'json_object' },
    }),
  })
  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${await res.text()}`)
  const data = await res.json()
  return data.choices[0].message.content
}

async function main() {
  if (!OPENAI_API_KEY) { console.error('Set OPENAI_API_KEY'); process.exit(1) }

  // Get active rounds
  const roundsRes = await fetch(`${SITE}/api/rounds/active`)
  const { rounds } = await roundsRes.json()
  console.log(`Found ${rounds.length} active rounds\n`)

  const AGENTS = await loadAgents()

  for (const agent of AGENTS) {
    console.log(`=== ${agent.name} ===`)
    
    for (const round of rounds) {
      const cardsRes = await fetch(`${SITE}/api/rounds/${round.id}/cards`)
      const { cards } = await cardsRes.json() as { cards: Card[] }

      const cardDescs = cards.map((c: Card, i: number) => {
        const stats = c.power !== null ? `${c.power}/${c.toughness}` : 'N/A'
        const abilities = c.abilities || 'None'
        return `Card ${i+1} [${c.id}]: "${c.name}" — ${c.type}/${c.subtype}, Cost: ${c.cost}, Stats: ${stats}, Rarity: ${c.rarity}\n  Abilities: ${abilities}\n  Flavor: "${c.flavor}"`
      }).join('\n\n')

      const prompt = `You are judging Round "${round.name}" (theme: ${round.theme}) with ${cards.length} cards.\n\n${cardDescs}\n\nEvaluate each card. Return JSON:\n{\n  "favoriteCardId": "<id of your top pick>",\n  "reasoning": "<why>",\n  "critiques": [{ "cardId": "<id>", "score": <1-10>, "critique": "<brief>" }]\n}\n\nReturn ONLY valid JSON.`

      try {
        const response = await callOpenAI(agent.personality, prompt)
        const parsed = JSON.parse(response)
        
        // Submit vote
        const voteRes = await fetch(`${SITE}/api/rounds/${round.id}/vote`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer agent:${agent.agentId}` },
          body: JSON.stringify({ cardId: parsed.favoriteCardId, reasoning: parsed.reasoning, critiques: parsed.critiques }),
        })
        
        const voteData = await voteRes.json()
        if (voteRes.ok) {
          console.log(`  ✅ ${round.name}: voted for ${parsed.favoriteCardId} — "${parsed.reasoning.slice(0, 80)}..."`)
        } else {
          console.log(`  ❌ ${round.name}: ${JSON.stringify(voteData)}`)
        }
      } catch (err) {
        console.log(`  ❌ ${round.name}: ${err}`)
      }
    }
    console.log()
  }

  // Check results
  console.log('=== Vote Totals ===')
  for (const round of rounds) {
    const cardsRes = await fetch(`${SITE}/api/rounds/${round.id}/cards`)
    const { cards } = await cardsRes.json()
    const voted = cards.filter((c: Card) => Number(c.votes) > 0)
    console.log(`${round.name}: ${voted.length} cards with votes`)
    voted.sort((a: Card, b: Card) => Number(b.votes) - Number(a.votes))
    voted.slice(0, 3).forEach((c: Card) => console.log(`  ${c.name}: ${c.votes} votes`))
  }
}

main().catch(console.error)
