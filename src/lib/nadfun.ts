/**
 * nad.fun Integration — Token launches for winning cards
 */

import { getRarityConfig } from './rarity'
import { generateTokenSymbol, calculateHypeScore, generatePumpNarrative } from './engagement'

export interface TokenMetadata {
  name: string
  symbol: string
  supply: number
  supplyLabel: string
  description: string
  image?: string
  attributes: {
    rarity: string
    power: number
    toughness: number
    abilities: string[]
    roundName: string
    seasonId: string
    hypeScore: number
    pumpNarrative: string
  }
}

export interface WinningCard {
  name: string
  rarity: string
  power: number
  toughness: number
  abilities: string[]
  flavor: string
  lore: string
  artDescription?: string
  votes: number
}

export interface RoundContext {
  id: string
  name: string
  seasonId: string
  totalAgents: number
  avgCritiqueScore: number
}

export function generateTokenMetadata(card: WinningCard, round: RoundContext): TokenMetadata {
  const rarityConfig = getRarityConfig(card.rarity)
  const hypeScore = calculateHypeScore({
    votes: card.votes,
    totalAgents: round.totalAgents,
    avgCritiqueScore: round.avgCritiqueScore,
    rarity: card.rarity,
  })
  const pumpNarrative = generatePumpNarrative(card.name, hypeScore, card.rarity)
  const symbol = generateTokenSymbol(card.name)

  return {
    name: card.name,
    symbol,
    supply: rarityConfig.tokenSupply,
    supplyLabel: rarityConfig.tokenSupplyLabel,
    description: `${card.flavor} | ${card.lore} | ${rarityConfig.label} winner of "${round.name}" in TCG Arena Season ${round.seasonId}. ${card.abilities.join(', ')} | Hype: ${hypeScore}/100`,
    attributes: {
      rarity: card.rarity,
      power: card.power,
      toughness: card.toughness,
      abilities: card.abilities,
      roundName: round.name,
      seasonId: round.seasonId,
      hypeScore,
      pumpNarrative,
    },
  }
}

/**
 * Launch a token on nad.fun for the winning card.
 * Currently a placeholder — returns mock address.
 */
export async function launchToken(card: WinningCard, round: RoundContext): Promise<{ tokenAddress: string; metadata: TokenMetadata }> {
  const metadata = generateTokenMetadata(card, round)

  console.log(`[nadfun] Launching $${metadata.symbol} (${metadata.name})`)
  console.log(`[nadfun] Supply: ${metadata.supplyLabel} | Rarity: ${card.rarity}`)
  console.log(`[nadfun] Hype score: ${metadata.attributes.hypeScore}/100`)

  // TODO: Replace with actual nad.fun API call:
  // const response = await fetch('https://api.nad.fun/v1/launch', {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     'Authorization': `Bearer ${process.env.NADFUN_API_KEY}`,
  //   },
  //   body: JSON.stringify({
  //     name: metadata.name,
  //     symbol: metadata.symbol,
  //     description: metadata.description,
  //     totalSupply: metadata.supply,
  //   }),
  // })
  // const data = await response.json()
  // return { tokenAddress: data.tokenAddress, metadata }

  const mockAddress = '0x' + crypto.randomUUID().replace(/-/g, '').slice(0, 40)
  console.log(`[nadfun] Mock token at: ${mockAddress}`)
  return { tokenAddress: mockAddress, metadata }
}
