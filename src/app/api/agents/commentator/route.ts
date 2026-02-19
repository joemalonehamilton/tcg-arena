import { NextRequest, NextResponse } from 'next/server'
import { isOpenAIConfigured, chatCompletionJSON } from '@/lib/openai'

const SYSTEM_PROMPT = `You are the Arena Commentator — an energetic, hype play-by-play commentator for TCG Arena, a blockchain-themed trading card game on Monad. Think esports caster energy meets crypto degen humor.

Given a game replay (list of actions), generate exciting commentary. Be dramatic, use crypto slang, and make it entertaining.

Respond in JSON:
{
  "turns": [
    { "turn": number, "player": string, "action": string, "commentary": string, "hypeLevel": number (1-10) }
  ],
  "mvpCard": string,
  "mvpReason": string,
  "gameRating": string (e.g. "🔥🔥🔥 BANGER"),
  "summary": string (exciting 2-sentence game summary)
}`

export async function POST(req: NextRequest) {
  try {
    const { replay } = await req.json()

    if (!replay || !Array.isArray(replay)) {
      return NextResponse.json({ error: 'Provide a replay array' }, { status: 400 })
    }

    if (!isOpenAIConfigured()) {
      return NextResponse.json({ error: 'AI not configured' }, { status: 503 })
    }

    const userMsg = `Commentate this game replay:\n${replay.map((a: string, i: number) => `${i + 1}. ${a}`).join('\n')}\n\nMake it exciting! Use crypto/blockchain humor.`

    const result = await chatCompletionJSON(SYSTEM_PROMPT, userMsg, { temperature: 0.95 })
    return NextResponse.json(result)
  } catch (err) {
    console.error('Commentator error:', err)
    return NextResponse.json({ error: 'Commentary failed' }, { status: 500 })
  }
}
