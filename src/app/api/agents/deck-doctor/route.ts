import { NextRequest, NextResponse } from 'next/server'
import { isOpenAIConfigured, chatCompletionJSON } from '@/lib/openai'
import { BASE_CHARACTERS } from '@/lib/rarity-variants'
const SYSTEM_PROMPT = `You are the Deck Doctor — an expert TCG Arena deck analyst. You analyze decks for a blockchain-themed trading card game on Monad.

Cards have: name, cost (mana), attack, defense, rarity (common/uncommon/rare/legendary/mythic), and abilities.

Key abilities: Shield, Haste, Consensus (+1/+1 per ally), Stake (+1/+1 each turn), Flash Finality (unblockable), Sandwich (steal +2/+0), Oracle (draw), Freeze, Rug Pull (steal 2 atk), Bridge (+2/+2 to ally), Pump (+3/+3 temp), Exploit (destroy weaker), Bounce, Mempool (copy stats), Genesis (summon token), Drain, Trample, Burn (2 dmg on play).

Respond in JSON with this exact structure:
{
  "overallScore": number (1-10),
  "archetype": string (e.g. "MEV Aggro", "Consensus Control", "Midrange"),
  "strengths": [string, string, string],
  "weaknesses": [string, string, string],
  "manaCurve": { "low": number, "mid": number, "high": number },
  "swaps": [{ "out": string, "in": string, "reason": string }],
  "analysis": string (2-3 sentences overall assessment)
}`

export async function POST(req: NextRequest) {
  try {
    const { cards } = await req.json()

    if (!cards || !Array.isArray(cards) || cards.length === 0) {
      return NextResponse.json({ error: 'Provide a cards array' }, { status: 400 })
    }

    if (!isOpenAIConfigured()) {
      return NextResponse.json({ error: 'AI not configured' }, { status: 503 })
    }

    // Build card context
    const allCards = Object.entries(BASE_CHARACTERS).map(([id, c]) => ({
      id, name: c.name, cost: c.baseCost, attack: c.baseAttack, defense: c.baseDefense,
      rarity: c.baseRarity, abilities: c.abilities,
    }))

    const deckCards = cards.map((name: string) => {
      const found = allCards.find(c => c.name.toLowerCase() === name.toLowerCase())
      return found || { name, cost: '?', attack: '?', defense: '?', rarity: 'unknown', abilities: [] }
    })

    const userMsg = `Analyze this deck (${deckCards.length} cards):\n${deckCards.map(c => `- ${c.name} (${c.cost} mana, ${c.attack}/${c.defense}, ${c.rarity}, abilities: ${Array.isArray(c.abilities) ? c.abilities.join(', ') : 'none'})`).join('\n')}\n\nAll available cards for swap suggestions:\n${allCards.map(c => `${c.name} (${c.cost} mana, ${c.attack}/${c.defense}, ${c.rarity})`).join(', ')}`

    const result = await chatCompletionJSON(SYSTEM_PROMPT, userMsg)
    return NextResponse.json(result)
  } catch (err) {
    console.error('Deck Doctor error:', err)
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })
  }
}
