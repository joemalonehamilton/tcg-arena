/**
 * Card Forging / Burning System — The Ponzinomic Engine
 * 
 * BURN MECHANICS:
 * - 3 cards of same character + same rarity → 1 card of next rarity tier
 * - Match entry: burn 1 common card
 * - Agent condemn: agents can vote to permanently burn cards from supply
 * 
 * FLYWHEEL:
 * Open packs → Get cards → Play TCG (burn entry fee) → Win packs
 * → Burn 3x cards to forge rarer version → Rarer cards = scarcer tokens
 * → Token pumps → More players → More burns → Supply death spiral (bullish)
 */

export interface OwnedCard {
  id: string // unique instance id
  characterId: string
  name: string
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary' | 'mythic'
  imageUrl: string
  power: number
  toughness: number
  cost: number
  type: string
  abilities: string[]
  flavor: string
}

export interface ForgeRecipe {
  inputRarity: string
  inputCount: number
  outputRarity: string
  successRate: number // 0-1, legendary forge can fail
  burnOnFail: boolean // do you lose the cards if forge fails?
}

export const FORGE_RECIPES: ForgeRecipe[] = [
  { inputRarity: 'common', inputCount: 3, outputRarity: 'uncommon', successRate: 1.0, burnOnFail: false },
  { inputRarity: 'uncommon', inputCount: 3, outputRarity: 'rare', successRate: 0.85, burnOnFail: true },
  { inputRarity: 'rare', inputCount: 3, outputRarity: 'legendary', successRate: 0.6, burnOnFail: true },
]

export interface ForgeResult {
  success: boolean
  inputsBurned: OwnedCard[]
  output: OwnedCard | null
  message: string
}

/**
 * Attempt to forge cards into a higher rarity
 */
export function forgeCards(cards: OwnedCard[]): ForgeResult {
  if (cards.length < 3) {
    return { success: false, inputsBurned: [], output: null, message: 'Need 3 cards to forge' }
  }

  // All must be same character and same rarity
  const charId = cards[0].characterId
  const rarity = cards[0].rarity
  if (!cards.every(c => c.characterId === charId && c.rarity === rarity)) {
    return { success: false, inputsBurned: [], output: null, message: 'All cards must be same character and same rarity' }
  }

  if (rarity === 'legendary') {
    return { success: false, inputsBurned: [], output: null, message: 'Cannot forge beyond Legendary' }
  }

  const recipe = FORGE_RECIPES.find(r => r.inputRarity === rarity)!
  const roll = Math.random()
  const success = roll <= recipe.successRate

  if (success) {
    const newRarity = recipe.outputRarity as OwnedCard['rarity']
    const statMult = newRarity === 'uncommon' ? 1.15 : newRarity === 'rare' ? 1.3 : 1.5
    const abilityCount = newRarity === 'uncommon' ? 2 : newRarity === 'rare' ? 2 : 3

    const output: OwnedCard = {
      id: `forged-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      characterId: charId,
      name: cards[0].name,
      rarity: newRarity,
      imageUrl: cards[0].imageUrl, // TODO: rarity-specific art
      power: Math.round(cards[0].power * statMult),
      toughness: Math.round(cards[0].toughness * statMult),
      cost: cards[0].cost,
      type: cards[0].type,
      abilities: cards[0].abilities.slice(0, abilityCount),
      flavor: cards[0].flavor,
    }

    return {
      success: true,
      inputsBurned: cards.slice(0, 3),
      output,
      message: `🔥 FORGE SUCCESS! 3x ${rarity} ${cards[0].name} → 1x ${newRarity} ${cards[0].name}! Supply burned.`,
    }
  } else {
    return {
      success: false,
      inputsBurned: recipe.burnOnFail ? cards.slice(0, 3) : [],
      output: null,
      message: `💀 FORGE FAILED! ${recipe.burnOnFail ? '3 cards burned forever.' : 'Cards returned.'} (${Math.round(recipe.successRate * 100)}% chance)`,
    }
  }
}

/**
 * Calculate match entry cost
 */
export function getMatchEntryCost(): { rarity: string; count: number } {
  return { rarity: 'common', count: 1 }
}

/**
 * Supply tracking
 */
export interface SupplySnapshot {
  character: string
  common: number
  uncommon: number
  rare: number
  legendary: number
  totalBurned: number
}

/**
 * Agent Condemn — agents vote to burn cards from circulation
 * If 3+ agents vote to condemn, card is burned
 */
export interface CondemnVote {
  agentId: string
  cardId: string
  reason: string
}

export function shouldCondemn(votes: CondemnVote[]): boolean {
  return votes.length >= 3
}

/**
 * The Ponzinomic Math:
 * 
 * Starting with 100 commons of a character:
 * → Forge to uncommon: 100 / 3 = 33 uncommons (67 burned)
 * → Forge to rare: 33 / 3 = 11 rares × 0.85 success = ~9 rares (24 burned, some lost to fails)
 * → Forge to legendary: 9 / 3 = 3 attempts × 0.6 success = ~2 legendaries (7+ burned)
 * 
 * From 100 commons → ~2 legendaries. That's 98% burn rate.
 * 
 * Plus match entry burns, plus agent condemns.
 * Supply only goes down. Price only goes up. (in theory)
 */
