import { NextResponse } from 'next/server'
import { isOpenAIConfigured, chatCompletionJSON } from '@/lib/openai'
import { BASE_CHARACTERS } from '@/lib/rarity-variants'
const SYSTEM_PROMPT = `You are the Meta Analyst — an expert on TCG Arena metagame trends. You analyze the current card pool of a blockchain-themed TCG on Monad.

Cards have: name, cost (mana), attack, defense, rarity, and abilities like Shield, Haste, Consensus, Stake, Flash Finality, Sandwich, Oracle, Freeze, Rug Pull, Bridge, Pump, Exploit, Bounce, Mempool, Genesis, Drain, Trample, Burn.

Generate a weekly meta report. Respond in JSON:
{
  "week": string (e.g. "Week 3 — Season 01"),
  "topArchetypes": [
    { "name": string, "tier": "S"|"A"|"B"|"C", "winrate": string, "keyCards": [string], "description": string }
  ],
  "risingCards": [{ "name": string, "reason": string }],
  "fallingCards": [{ "name": string, "reason": string }],
  "topCards": [{ "name": string, "usageRate": string, "winrate": string }],
  "metaInsight": string (2-3 sentences on the current meta state)
}`

export async function GET() {
  try {
    if (!isOpenAIConfigured()) {
      return NextResponse.json({ error: 'AI not configured' }, { status: 503 })
    }

    const allCards = Object.entries(BASE_CHARACTERS).map(([id, c]) => (
      `${c.name} (${c.baseCost} mana, ${c.baseAttack}/${c.baseDefense}, ${c.baseRarity}, abilities: ${(c.abilities || []).join(', ') || 'none'})`
    )).join('\n')

    const userMsg = `Generate a meta report for this card pool:\n${allCards}\n\nAssume ~5000 games played this week. Be creative with the archetypes and make it feel like a real competitive metagame analysis.`

    const result = await chatCompletionJSON(SYSTEM_PROMPT, userMsg, { temperature: 0.9 })
    return NextResponse.json(result)
  } catch (err) {
    console.error('Meta Analyst error:', err instanceof Error ? err.message : err)
    return NextResponse.json({ error: 'Report failed', detail: err instanceof Error ? err.message : String(err) }, { status: 500 })
  }
}
