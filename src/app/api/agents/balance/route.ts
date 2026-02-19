import { NextResponse } from 'next/server'
import { isOpenAIConfigured, chatCompletionJSON } from '@/lib/openai'
import { BASE_CHARACTERS } from '@/lib/rarity-variants'
const SYSTEM_PROMPT = `You are the Balance Council — a game balance analyst for TCG Arena, a blockchain-themed TCG on Monad.

Analyze the card pool for balance issues. Consider mana cost vs stats, ability power level, rarity appropriateness, and potential degenerate combos.

Key abilities: Shield (absorbs first hit), Haste (attacks immediately), Consensus (+1/+1 per ally), Stake (gains +1/+1 each turn), Flash Finality (can't be blocked), Sandwich (steals +2/+0 on attack), Oracle (draw a card), Freeze (skip target's next attack), Rug Pull (steal 2 attack from enemy), Bridge (give +2/+2 to ally), Pump (+3/+3 until end of turn), Exploit (destroy creature with less attack), Bounce (return creature to hand), Mempool (copy attack/defense of adjacent), Genesis (summon 1/1 token), Drain (heal for damage dealt), Trample (excess damage hits face), Burn (deal 2 damage on play).

Respond in JSON:
{
  "overperforming": [
    { "card": string, "severity": "watch"|"warning"|"critical", "reason": string, "suggestion": string }
  ],
  "underperforming": [
    { "card": string, "severity": "watch"|"warning"|"critical", "reason": string, "suggestion": string }
  ],
  "healthyCards": [string],
  "balanceScore": number (1-10, 10 = perfectly balanced),
  "summary": string (2-3 sentence balance assessment)
}`

export async function GET() {
  try {
    if (!isOpenAIConfigured()) {
      return NextResponse.json({ error: 'AI not configured' }, { status: 503 })
    }

    const allCards = Object.entries(BASE_CHARACTERS).map(([id, c]) => (
      `${c.name}: ${c.baseCost} mana, ${c.baseAttack}/${c.baseDefense}, ${c.baseRarity}, abilities: [${(c.abilities || []).join(', ')}]`
    )).join('\n')

    const userMsg = `Analyze this card pool for balance:\n${allCards}\n\nBe critical. Flag anything that feels too strong or too weak for its cost/rarity. Consider ability synergies and degenerate combos.`

    const result = await chatCompletionJSON(SYSTEM_PROMPT, userMsg, { temperature: 0.7 })
    return NextResponse.json(result)
  } catch (err) {
    console.error('Balance error:', err instanceof Error ? err.message : err)
    return NextResponse.json({ error: 'Analysis failed', detail: err instanceof Error ? err.message : String(err) }, { status: 500 })
  }
}
