/**
 * Advanced TCG Mechanics — Type advantages, traps, evolution, chain resolution
 * Layered on top of game-engine.ts
 */

/**
 * TYPE ADVANTAGE SYSTEM (Rock-Paper-Scissors style)
 * 
 * Creature → Spell → Artifact → Creature
 * (Creatures overpower spells, spells counter artifacts, artifacts break creatures)
 * 
 * Advantage: deal 1.5x damage
 * Disadvantage: deal 0.75x damage
 * Neutral: 1x damage
 */
export type CardCategory = 'creature' | 'spell' | 'artifact' | 'terrain'

const ADVANTAGE_MAP: Record<string, string> = {
  creature: 'spell',    // creatures beat spells
  spell: 'artifact',    // spells beat artifacts
  artifact: 'creature', // artifacts beat creatures
}

const DISADVANTAGE_MAP: Record<string, string> = {
  creature: 'artifact',
  spell: 'creature',
  artifact: 'spell',
}

export function getTypeMultiplier(attackerType: string, defenderType: string): number {
  const atkCategory = parseCategory(attackerType)
  const defCategory = parseCategory(defenderType)
  
  if (ADVANTAGE_MAP[atkCategory] === defCategory) return 1.5
  if (DISADVANTAGE_MAP[atkCategory] === defCategory) return 0.75
  return 1.0
}

export function getTypeAdvantageLabel(attackerType: string, defenderType: string): string | null {
  const mult = getTypeMultiplier(attackerType, defenderType)
  if (mult > 1) return '⚡ SUPER EFFECTIVE'
  if (mult < 1) return '🛡️ NOT VERY EFFECTIVE'
  return null
}

function parseCategory(type: string): string {
  const lower = type.toLowerCase()
  if (lower.includes('spell')) return 'spell'
  if (lower.includes('artifact')) return 'artifact'
  if (lower.includes('terrain')) return 'terrain'
  return 'creature' // default
}

/**
 * TRAP / COUNTER SYSTEM (YuGiOh inspired)
 * 
 * Set cards face-down during main phase. They trigger automatically on opponent's turn.
 */
export interface TrapCard {
  id: string
  name: string
  triggerCondition: TrapTrigger
  effect: TrapEffect
}

export type TrapTrigger = 
  | 'on_attack'        // when opponent attacks
  | 'on_play'          // when opponent plays a card
  | 'on_ability'       // when opponent uses an ability
  | 'on_damage'        // when you take damage

export type TrapEffect =
  | { type: 'destroy'; target: 'attacker' | 'strongest' | 'random' }
  | { type: 'bounce'; target: 'attacker' | 'last_played' } // return to hand
  | { type: 'damage'; amount: number; target: 'all_enemies' | 'attacker' }
  | { type: 'buff'; amount: number; target: 'all_allies' | 'weakest' }
  | { type: 'negate' } // cancel the triggering action

export const TRAP_CARDS: TrapCard[] = [
  { id: 'mirror-revert', name: 'Mirror Revert', triggerCondition: 'on_attack', effect: { type: 'bounce', target: 'attacker' } },
  { id: 'gas-explosion', name: 'Gas Explosion', triggerCondition: 'on_play', effect: { type: 'damage', amount: 3, target: 'all_enemies' } },
  { id: 'consensus-shield', name: 'Consensus Shield', triggerCondition: 'on_damage', effect: { type: 'buff', amount: 2, target: 'all_allies' } },
  { id: 'flash-liquidation', name: 'Flash Liquidation', triggerCondition: 'on_attack', effect: { type: 'destroy', target: 'strongest' } },
  { id: 'mempool-block', name: 'Mempool Block', triggerCondition: 'on_ability', effect: { type: 'negate' } },
]

/**
 * EVOLUTION SYSTEM
 * 
 * Play a base creature, then "evolve" it into a rare/legendary form mid-game.
 * Costs extra mana. The evolved form keeps the base's damage/enchantments.
 */
export interface EvolutionPath {
  baseCharacterId: string
  evolvedForm: {
    rarity: string
    extraCost: number // additional mana to evolve
    powerBonus: number
    toughnessBonus: number
    newAbilities: string[]
    artSuffix: string
  }[]
}

export const EVOLUTION_PATHS: EvolutionPath[] = [
  {
    baseCharacterId: 'nadzilla',
    evolvedForm: [
      { rarity: 'rare', extraCost: 3, powerBonus: 2, toughnessBonus: 2, newAbilities: ['Parallel Execution'], artSuffix: '-evolved' },
      { rarity: 'legendary', extraCost: 5, powerBonus: 4, toughnessBonus: 3, newAbilities: ['Parallel Execution', 'Rug Pull'], artSuffix: '-mega' },
    ],
  },
  {
    baseCharacterId: 'blob-validator',
    evolvedForm: [
      { rarity: 'uncommon', extraCost: 2, powerBonus: 1, toughnessBonus: 2, newAbilities: ['Consensus'], artSuffix: '-evolved' },
      { rarity: 'rare', extraCost: 4, powerBonus: 3, toughnessBonus: 4, newAbilities: ['Consensus', 'Diamond Hands'], artSuffix: '-mega' },
    ],
  },
  {
    baseCharacterId: 'gremlin-mev',
    evolvedForm: [
      { rarity: 'rare', extraCost: 3, powerBonus: 2, toughnessBonus: 1, newAbilities: ['Liquidate'], artSuffix: '-evolved' },
    ],
  },
  {
    baseCharacterId: 'rugpull-dragon',
    evolvedForm: [
      { rarity: 'legendary', extraCost: 4, powerBonus: 3, toughnessBonus: 3, newAbilities: ['Flash Finality', 'Rug Pull'], artSuffix: '-mega' },
    ],
  },
]

/**
 * CHAIN RESOLUTION (MTG stack inspired)
 * 
 * When multiple abilities trigger at once, they go on a "chain"
 * and resolve in reverse order (last in, first out).
 */
export interface ChainLink {
  source: string // card name
  ability: string
  target?: string
  priority: number // higher = resolves first in ties
}

export function resolveChain(chain: ChainLink[]): ChainLink[] {
  // Sort by priority (highest first), then reverse insertion order
  return [...chain].sort((a, b) => b.priority - a.priority)
}

/**
 * MATCH REWARDS — What you earn from playing
 */
export interface MatchReward {
  xpPerCard: number
  packsEarned: number
  packType: string
  streakBonus: string | null
  conditionLoss: number
}

export function calculateMatchRewards(
  won: boolean,
  turnsPlayed: number,
  creaturesKilled: number,
  currentStreak: number
): MatchReward {
  const baseXP = won ? 70 : 25
  const xpPerCard = baseXP + creaturesKilled * 10 + turnsPlayed * 2
  
  const packsEarned = won ? 1 : 0
  const packType = currentStreak >= 5 ? 'premium' : 'standard'
  
  const streakBonus = won && currentStreak >= 3
    ? currentStreak >= 10 ? '👑 10-STREAK! Legendary Pack!'
    : currentStreak >= 7 ? '🔥 7-STREAK! Monad Pack!'
    : currentStreak >= 5 ? '⚡ 5-STREAK! Premium Pack!'
    : '🎯 3-STREAK! Bonus Pack!'
    : null

  return {
    xpPerCard,
    packsEarned: won ? (currentStreak >= 3 ? 2 : 1) : 0,
    packType,
    streakBonus,
    conditionLoss: 5, // every match costs 5 condition
  }
}

/**
 * DECK BUILDING RULES
 */
export const DECK_RULES = {
  minCards: 20,
  maxCards: 30,
  maxCopies: 3, // max 3 of same card (any rarity)
  maxLegendary: 3, // max 3 legendaries per deck
  requiredTypes: ['creature'], // must have at least 1 creature
}

export function validateDeck(cards: { name: string; rarity: string; type: string }[]): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (cards.length < DECK_RULES.minCards) errors.push(`Need at least ${DECK_RULES.minCards} cards (have ${cards.length})`)
  if (cards.length > DECK_RULES.maxCards) errors.push(`Max ${DECK_RULES.maxCards} cards (have ${cards.length})`)
  
  // Check copy limits
  const nameCounts: Record<string, number> = {}
  cards.forEach(c => { nameCounts[c.name] = (nameCounts[c.name] || 0) + 1 })
  Object.entries(nameCounts).forEach(([name, count]) => {
    if (count > DECK_RULES.maxCopies) errors.push(`Max ${DECK_RULES.maxCopies} copies of ${name} (have ${count})`)
  })
  
  // Check legendary limit
  const legendaryCount = cards.filter(c => c.rarity === 'legendary').length
  if (legendaryCount > DECK_RULES.maxLegendary) errors.push(`Max ${DECK_RULES.maxLegendary} legendaries (have ${legendaryCount})`)
  
  // Check required types
  const hasCreature = cards.some(c => c.type.toLowerCase().includes('creature'))
  if (!hasCreature) errors.push('Deck must contain at least 1 creature')
  
  return { valid: errors.length === 0, errors }
}
