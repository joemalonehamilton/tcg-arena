/**
 * Card Progression & Grinding System
 * 
 * Cards gain XP from matches → level up → stronger stats + enchantment slots
 * Cards degrade with use → need repair (burn sink)
 * Win streaks → bonus rewards
 */

export interface CardProgression {
  cardId: string
  characterId: string
  level: number // 1-10
  xp: number
  xpToNext: number
  condition: number // 100 = mint, 0 = broken (can't use)
  enchantments: Enchantment[]
  enchantmentSlots: number // unlocked via leveling
  gamesPlayed: number
  wins: number
  killCount: number // creatures destroyed in combat
}

export interface Enchantment {
  id: string
  name: string
  type: 'stat' | 'ability' | 'cosmetic'
  description: string
  effect: {
    powerBonus?: number
    toughnessBonus?: number
    costReduction?: number
    abilityGrant?: string
    xpMultiplier?: number
  }
  burnCost: number // cards to burn to craft this enchantment
}

// XP per level (exponential curve)
export const XP_TABLE = [
  0,    // level 1
  100,  // level 2
  250,  // level 3
  500,  // level 4
  1000, // level 5
  2000, // level 6
  4000, // level 7
  7500, // level 8
  12000,// level 9
  20000,// level 10 (max)
]

// Stat bonuses per level
export const LEVEL_BONUSES: Record<number, { power: number; toughness: number; slots: number }> = {
  1: { power: 0, toughness: 0, slots: 0 },
  2: { power: 0, toughness: 1, slots: 0 },
  3: { power: 1, toughness: 1, slots: 1 },
  4: { power: 1, toughness: 1, slots: 1 },
  5: { power: 1, toughness: 2, slots: 1 }, // milestone: first enchantment slot
  6: { power: 2, toughness: 2, slots: 2 },
  7: { power: 2, toughness: 3, slots: 2 },
  8: { power: 3, toughness: 3, slots: 2 },
  9: { power: 3, toughness: 4, slots: 3 },
  10: { power: 4, toughness: 5, slots: 3 }, // max: +4/+5 and 3 enchantment slots
}

// Available enchantments (crafted by burning cards)
export const ENCHANTMENTS: Enchantment[] = [
  {
    id: 'power-crystal',
    name: 'Power Crystal',
    type: 'stat',
    description: '+2 power',
    effect: { powerBonus: 2 },
    burnCost: 2, // burn 2 cards to craft
  },
  {
    id: 'iron-shell',
    name: 'Iron Shell',
    type: 'stat',
    description: '+2 toughness',
    effect: { toughnessBonus: 2 },
    burnCost: 2,
  },
  {
    id: 'gas-reducer',
    name: 'Gas Reducer',
    type: 'stat',
    description: '-1 mana cost',
    effect: { costReduction: 1 },
    burnCost: 3,
  },
  {
    id: 'xp-boost',
    name: 'XP Accelerator',
    type: 'cosmetic',
    description: '2x XP from matches',
    effect: { xpMultiplier: 2 },
    burnCost: 1,
  },
  {
    id: 'diamond-coating',
    name: 'Diamond Coating',
    type: 'ability',
    description: 'Grants Diamond Hands ability',
    effect: { abilityGrant: 'Diamond Hands' },
    burnCost: 5, // expensive — powerful ability
  },
  {
    id: 'mev-injector',
    name: 'MEV Injector',
    type: 'ability',
    description: 'Grants MEV Extract ability',
    effect: { abilityGrant: 'MEV Extract' },
    burnCost: 4,
  },
  {
    id: 'fork-module',
    name: 'Fork Module',
    type: 'ability',
    description: 'Grants Fork ability',
    effect: { abilityGrant: 'Fork' },
    burnCost: 4,
  },
]

/**
 * XP rewards from match events
 */
export const XP_REWARDS = {
  matchPlayed: 20,
  matchWon: 50,
  creatureKilled: 10,
  abilityUsed: 5,
  damageDealt: 2, // per point of damage
  surviveMatch: 15, // card survived the whole game
}

/**
 * Condition degradation — cards wear out
 */
export const CONDITION_LOSS_PER_MATCH = 5 // lose 5 condition per match played
export const REPAIR_COST = 1 // burn 1 card to repair 50 condition
export const MIN_CONDITION_TO_PLAY = 20 // can't use cards below 20 condition

/**
 * Calculate XP earned from a match
 */
export function calculateMatchXP(
  won: boolean,
  creaturesKilled: number,
  abilitiesUsed: number,
  damageDealt: number,
  survived: boolean,
  xpMultiplier: number = 1
): number {
  let xp = XP_REWARDS.matchPlayed
  if (won) xp += XP_REWARDS.matchWon
  xp += creaturesKilled * XP_REWARDS.creatureKilled
  xp += abilitiesUsed * XP_REWARDS.abilityUsed
  xp += damageDealt * XP_REWARDS.damageDealt
  if (survived) xp += XP_REWARDS.surviveMatch
  return Math.round(xp * xpMultiplier)
}

/**
 * Check if card can level up
 */
export function checkLevelUp(prog: CardProgression): { leveled: boolean; newLevel: number } {
  if (prog.level >= 10) return { leveled: false, newLevel: prog.level }
  if (prog.xp >= XP_TABLE[prog.level]) {
    return { leveled: true, newLevel: prog.level + 1 }
  }
  return { leveled: false, newLevel: prog.level }
}

/**
 * Get effective stats for a card (base + level + enchantments)
 */
export function getEffectiveStats(
  basePower: number,
  baseToughness: number,
  baseCost: number,
  prog: CardProgression
): { power: number; toughness: number; cost: number; bonusAbilities: string[] } {
  const levelBonus = LEVEL_BONUSES[prog.level] || LEVEL_BONUSES[1]
  
  let powerBonus = levelBonus.power
  let toughnessBonus = levelBonus.toughness
  let costReduction = 0
  const bonusAbilities: string[] = []

  for (const ench of prog.enchantments) {
    if (ench.effect.powerBonus) powerBonus += ench.effect.powerBonus
    if (ench.effect.toughnessBonus) toughnessBonus += ench.effect.toughnessBonus
    if (ench.effect.costReduction) costReduction += ench.effect.costReduction
    if (ench.effect.abilityGrant) bonusAbilities.push(ench.effect.abilityGrant)
  }

  return {
    power: basePower + powerBonus,
    toughness: baseToughness + toughnessBonus,
    cost: Math.max(1, baseCost - costReduction),
    bonusAbilities,
  }
}

/**
 * Win streak bonuses
 */
export const STREAK_REWARDS: Record<number, string> = {
  3: '🎁 Bonus Standard Pack',
  5: '🎁 Bonus Premium Pack + 2x XP next match',
  7: '🔥 Bonus Monad Pack + exclusive card back',
  10: '👑 Legendary Pack + "Degen" title',
}

/**
 * Seasonal content structure
 */
export interface Season {
  id: string
  number: number
  name: string
  theme: string
  story: string
  newCharacters: string[] // character IDs introduced this season
  exclusiveRewards: string[] // only earnable this season
  startsAt: number
  endsAt: number
  rankedTiers: RankedTier[]
}

export interface RankedTier {
  name: string
  minElo: number
  rewards: string[]
  icon: string
}

export const RANKED_TIERS: RankedTier[] = [
  { name: 'Bronze', minElo: 0, icon: '🥉', rewards: ['5 Standard Packs'] },
  { name: 'Silver', minElo: 1200, icon: '🥈', rewards: ['3 Premium Packs', 'Silver Card Back'] },
  { name: 'Gold', minElo: 1500, icon: '🥇', rewards: ['5 Premium Packs', 'Gold Card Back', 'Exclusive Common'] },
  { name: 'Diamond', minElo: 1800, icon: '💎', rewards: ['3 Monad Packs', 'Diamond Card Back', 'Exclusive Rare'] },
  { name: 'Degen', minElo: 2100, icon: '👑', rewards: ['10 Monad Packs', 'Animated Card Back', 'Exclusive Legendary', 'Season Title'] },
]

/**
 * Season 01 story
 */
export const SEASON_01: Season = {
  id: 'season-01',
  number: 1,
  name: 'The Convergence',
  theme: 'The rift opens between blockchain and reality',
  story: `The chain was silent for millennia. Then Block Zero ignited. A rift tore between the blockchain realm and the physical world, spilling raw computational energy across three zones. From the Abyss came ancient horrors — creatures that existed before the first transaction. The Arsenal crystallized weapons from failed contracts and reverted gas. And on Monad, where blocks finalize in milliseconds, entirely new species evolved from parallel execution threads. The Convergence has begun. Choose your deck. Enter the arena. Only the strongest cards will survive — and launch as tokens.`,
  newCharacters: ['nadzilla', 'blob-validator', 'phantom-finalizer', 'gremlin-mev', 'monadium', 'octoracle', 'gas-guzzler', 'shard-wyrm', 'mempool-lurker', 'bft-crab', 'block-bunny', 'devnet-horror', 'rugpull-dragon', 'the-deployer', 'frozen-liquidity', 'whale', 'dead-cat-bounce', 'rug-walker'],
  exclusiveRewards: ['Convergence Card Back', 'Season 01 Title', 'Holographic Nadzilla'],
  startsAt: Date.now(),
  endsAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
  rankedTiers: RANKED_TIERS,
}
