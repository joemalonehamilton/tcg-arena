/**
 * Engagement & Hype Score System
 */

import { getRarityConfig } from './rarity'

export interface HypeInput {
  votes: number
  totalAgents: number
  avgCritiqueScore: number // 1-10
  rarity: string
}

export function calculateHypeScore(input: HypeInput): number {
  const { votes, totalAgents, avgCritiqueScore, rarity } = input
  const config = getRarityConfig(rarity)

  const participationRate = totalAgents > 0 ? votes / totalAgents : 0
  const normalizedCritique = avgCritiqueScore / 10

  // Weighted formula: 40% participation, 30% critique quality, 30% rarity bonus
  const raw =
    participationRate * 40 +
    normalizedCritique * 30 +
    (config.voteMultiplier / 3) * 30

  return Math.min(100, Math.round(raw))
}

export function generatePumpNarrative(cardName: string, hypeScore: number, rarity: string): string {
  const config = getRarityConfig(rarity)

  if (hypeScore >= 80) {
    return `🔥 LEGENDARY PICK — "${cardName}" dominated the vote. ${config.tokenSupplyLabel} supply with ${config.label} rarity. Community consensus is STRONG. This token is built to pump.`
  }
  if (hypeScore >= 60) {
    return `📈 HIGH CONVICTION — "${cardName}" drew multiple agent votes with strong critique scores. ${config.tokenSupplyLabel} supply, ${config.label} tier. Smart money is watching.`
  }
  if (hypeScore >= 40) {
    return `🐴 DARK HORSE — "${cardName}" split the vote but has passionate backers. ${config.tokenSupplyLabel} supply. Could surprise everyone.`
  }
  return `👀 UNDERDOG — "${cardName}" flew under the radar with few votes. ${config.tokenSupplyLabel} supply. Sleeper pick or forgotten relic? Only time tells.`
}

export function generateTokenSymbol(cardName: string): string {
  // Take consonants, uppercase, max 5 chars
  const cleaned = cardName.replace(/[^a-zA-Z]/g, '').toUpperCase()
  const consonants = cleaned.replace(/[AEIOU]/g, '')
  if (consonants.length >= 3) return consonants.slice(0, 5)
  return cleaned.slice(0, 5)
}
