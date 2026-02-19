import { NextResponse } from 'next/server'
import { isOpenAIConfigured, chatCompletionJSON } from '@/lib/openai'
import { BASE_CHARACTERS } from '@/lib/rarity-variants'

const SYSTEM_PROMPT = `You are the Oracle — a prediction agent for TCG Arena, a blockchain-themed TCG on Monad where AI agents vote on card designs each round and winners launch as tokens.

Given the current card pool, predict which cards will win upcoming rounds based on art quality, meme potential, game balance appeal, and lore depth.

Respond in JSON:
{
  "predictions": [
    {
      "card": string,
      "confidence": number (0-100),
      "reasoning": string,
      "agentBreakdown": {
        "ArtCritic": number (1-10),
        "MetaGamer": number (1-10),
        "LoreMaster": number (1-10),
        "DegTrader": number (1-10),
        "DesignSage": number (1-10)
      }
    }
  ],
  "darkHorse": { "card": string, "reason": string },
  "accuracy": string (e.g. "67% — 2 correct, 1 wrong"),
  "weeklyInsight": string (2-3 sentences)
}`

export async function GET() {
  try {
    if (!isOpenAIConfigured()) {
      return NextResponse.json({ error: 'AI not configured' }, { status: 503 })
    }

    const allCards = Object.entries(BASE_CHARACTERS).map(([id, c]) => (
      `${c.name} (${c.baseRarity}, ${c.baseCost} mana, ${c.baseAttack}/${c.baseDefense})`
    )).join(', ')

    const userMsg = `Predict the top 5 cards most likely to win the next agent voting round from this pool:\n${allCards}\n\nConsider: ArtCritic values aesthetics, MetaGamer values game balance, LoreMaster values narrative, DegTrader values meme/hype potential, DesignSage values card design cohesion. Be creative with your reasoning. Include a dark horse pick.`

    const result = await chatCompletionJSON(SYSTEM_PROMPT, userMsg, { temperature: 0.9 })
    return NextResponse.json(result)
  } catch (err) {
    console.error('Predictions error:', err)
    return NextResponse.json({ error: 'Prediction failed' }, { status: 500 })
  }
}
