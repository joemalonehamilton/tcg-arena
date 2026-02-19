/**
 * Shared agent logic for TCG Arena AI judges.
 */

export interface AgentConfig {
  name: string
  personality: string
  agentId: string
  visionModel: string
}

export interface CardData {
  id: string
  name: string
  type: string
  subtype: string
  cost: number
  power: number | null
  toughness: number | null
  abilities: string[]
  flavor: string
  rarity: string
  artDescription: string
  votes: number
}

export interface CardCritique {
  cardId: string
  score: number
  critique: string
}

export interface AgentResult {
  agentName: string
  roundId: string
  favoriteCardId: string
  reasoning: string
  critiques: CardCritique[]
}

const BASE_URL = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3001')

export async function runAgent(config: AgentConfig): Promise<AgentResult[]> {
  const results: AgentResult[] = []

  // Fetch active rounds
  const roundsRes = await fetch(`${BASE_URL}/api/rounds/active`)
  if (!roundsRes.ok) throw new Error(`Failed to fetch rounds: ${roundsRes.status}`)
  const { rounds } = await roundsRes.json()

  for (const round of rounds) {
    // Get cards for this round
    const cardsRes = await fetch(`${BASE_URL}/api/rounds/${round.id}/cards`)
    if (!cardsRes.ok) {
      console.error(`[${config.name}] Failed to fetch cards for round ${round.id}`)
      continue
    }
    const { cards } = (await cardsRes.json()) as { cards: CardData[] }

    // Build prompt with card metadata
    const cardDescriptions = cards.map((c, i) => {
      const stats = c.power !== null ? `${c.power}/${c.toughness}` : 'N/A'
      return `Card ${i + 1} [${c.id}]: "${c.name}" — ${c.type}/${c.subtype}, Cost: ${c.cost}, Stats: ${stats}, Rarity: ${c.rarity}
  Abilities: ${c.abilities.join('; ') || 'None'}
  Flavor: "${c.flavor}"
  Art: ${c.artDescription}`
    }).join('\n\n')

    const prompt = `${config.personality}

You are judging Round "${round.name}" (theme: ${round.theme}) with ${cards.length} cards.

${cardDescriptions}

Evaluate each card from your perspective. Return a JSON object with:
{
  "favoriteCardId": "<id of your top pick>",
  "reasoning": "<why you chose this card as your favorite>",
  "critiques": [
    { "cardId": "<card id>", "score": <1-10>, "critique": "<your brief assessment>" }
  ]
}

Return ONLY valid JSON, no markdown fences.`

    // Call vision model
    const response = await callVisionModel(config, prompt)

    // Parse response
    let parsed: { favoriteCardId: string; reasoning: string; critiques: CardCritique[] }
    try {
      parsed = JSON.parse(response)
    } catch {
      // Try to extract JSON from response
      const match = response.match(/\{[\s\S]*\}/)
      if (!match) {
        console.error(`[${config.name}] Failed to parse response for round ${round.id}`)
        continue
      }
      parsed = JSON.parse(match[0])
    }

    // Submit vote
    const voteRes = await fetch(`${BASE_URL}/api/rounds/${round.id}/vote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer agent:${config.agentId}`,
      },
      body: JSON.stringify({
        cardId: parsed.favoriteCardId,
        reasoning: parsed.reasoning,
        critiques: parsed.critiques,
      }),
    })

    if (!voteRes.ok) {
      const err = await voteRes.text()
      console.error(`[${config.name}] Vote failed for round ${round.id}: ${err}`)
      continue
    }

    const result: AgentResult = {
      agentName: config.name,
      roundId: round.id,
      favoriteCardId: parsed.favoriteCardId,
      reasoning: parsed.reasoning,
      critiques: parsed.critiques,
    }
    results.push(result)
    console.log(`[${config.name}] Voted for ${parsed.favoriteCardId} in round ${round.id}`)
  }

  return results
}

export async function callVisionModel(config: AgentConfig, prompt: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('OPENAI_API_KEY not set')

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: config.visionModel,
      messages: [
        { role: 'system', content: config.personality },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: 'json_object' },
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`OpenAI API error: ${res.status} ${err}`)
  }

  const data = await res.json()
  return data.choices[0].message.content
}
