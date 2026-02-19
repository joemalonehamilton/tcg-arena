/**
 * Token Economy v2 — Ponzi Flywheel
 * 
 * Pack prices escalate over time (cheap first 2 days, then ramp)
 * Pack spend split: 60% burn, 20% reward pool, 20% treasury
 * NFT holders earn yield from reward pool based on collection rarity score
 */

// Launch date — first 2 days are "early bird" pricing
export const LAUNCH_DATE = new Date('2026-02-14T00:00:00Z')

// Base pack prices (early bird — first 2 days)
const BASE_PRICES = {
  standard: 5_000,
  premium: 15_000,
  monad: 10_000,
} as const

// Price escalation schedule (multiplier by day)
// Day 0-1: 1x (early bird)
// Day 2-3: 2x  
// Day 4-6: 5x
// Day 7-13: 10x
// Day 14+: 20x (and continues to grow)
function getPriceMultiplier(now?: Date): number {
  const current = now || new Date()
  const elapsed = current.getTime() - LAUNCH_DATE.getTime()
  const days = Math.max(0, Math.floor(elapsed / (1000 * 60 * 60 * 24)))
  
  if (days < 2) return 1      // Early bird
  if (days < 4) return 2      // Ramp up
  if (days < 7) return 5      // Getting serious
  if (days < 14) return 10    // Premium territory
  if (days < 30) return 20    // High roller
  return 20 + Math.floor((days - 30) / 7) * 5  // Keeps growing weekly
}

// Get current price tier info
export function getPriceTier(now?: Date): { multiplier: number; label: string; nextTier: string; daysLeft: number } {
  const current = now || new Date()
  const elapsed = current.getTime() - LAUNCH_DATE.getTime()
  const days = Math.max(0, Math.floor(elapsed / (1000 * 60 * 60 * 24)))
  const multiplier = getPriceMultiplier(current)
  
  if (days < 2) {
    const hoursLeft = Math.max(0, Math.ceil((2 * 24 * 60 * 60 * 1000 - elapsed) / (1000 * 60 * 60)))
    return { multiplier, label: '🔥 EARLY BIRD', nextTier: `Prices 2x in ${hoursLeft}h`, daysLeft: 2 - days }
  }
  if (days < 4) return { multiplier, label: 'Phase 2', nextTier: 'Prices 5x soon', daysLeft: 4 - days }
  if (days < 7) return { multiplier, label: 'Phase 3', nextTier: 'Prices 10x soon', daysLeft: 7 - days }
  if (days < 14) return { multiplier, label: 'Phase 4', nextTier: 'Prices 20x soon', daysLeft: 14 - days }
  return { multiplier, label: `Season ${Math.floor(days / 7)}`, nextTier: 'Prices increase weekly', daysLeft: 0 }
}

// Pack spend split — 50/50 burn/rewards, no treasury cut
export const SPEND_SPLIT = {
  BURN: 0.5,        // 50% burned (0xdead)
  REWARD_POOL: 0.5, // 50% to reward pool
  TREASURY: 0,      // no treasury cut
} as const

// Staking config
export const STAKING_CONFIG = {
  INITIAL_POOL_SEED: 500_000_000, // 500M TCG reward pool
  DISTRIBUTION_INTERVAL: 'weekly',
  MIN_CARDS_TO_STAKE: 1,
} as const

// Dynamic distribution rate — front-loaded, decreases over time
// Returns weekly % of pool to distribute
export function getDistributionRate(now?: Date): { rate: number; label: string } {
  const current = now || new Date()
  const elapsed = current.getTime() - LAUNCH_DATE.getTime()
  const weeks = Math.max(0, Math.floor(elapsed / (1000 * 60 * 60 * 24 * 7)))

  if (weeks < 2) return { rate: 0.10, label: '10% weekly (Early Bonus!)' }
  if (weeks < 4) return { rate: 0.07, label: '7% weekly' }
  if (weeks < 8) return { rate: 0.05, label: '5% weekly' }
  return { rate: 0.03, label: '3% weekly (Sustainable)' }
}

// TCG holding boost tiers — hold TCG in wallet to multiply NFT yield
export const HOLDING_BOOST_TIERS = [
  { min: 500_000, multiplier: 3, label: '3x Yield', emoji: '🔥' },
  { min: 100_000, multiplier: 2, label: '2x Yield', emoji: '⚡' },
  { min: 50_000, multiplier: 1.5, label: '1.5x Yield', emoji: '✨' },
  { min: 0, multiplier: 1, label: '1x Yield', emoji: '' },
] as const

export function getHoldingBoost(tcgBalance: number): { multiplier: number; label: string; emoji: string; nextTier?: { min: number; multiplier: number } } {
  for (let i = 0; i < HOLDING_BOOST_TIERS.length; i++) {
    const tier = HOLDING_BOOST_TIERS[i]
    if (tcgBalance >= tier.min) {
      const nextTier = i > 0 ? HOLDING_BOOST_TIERS[i - 1] : undefined
      return {
        multiplier: tier.multiplier,
        label: tier.label,
        emoji: tier.emoji,
        nextTier: nextTier ? { min: nextTier.min, multiplier: nextTier.multiplier } : undefined,
      }
    }
  }
  return { multiplier: 1, label: '1x Yield', emoji: '' }
}

// Rarity point values (for leaderboard + staking weight)
export const RARITY_POINTS: Record<string, number> = {
  common: 1,
  uncommon: 5,
  rare: 25,
  legendary: 200,
  mythic: 2000,
}

// PSA grade multipliers
export function gradeMultiplier(grade: number): number {
  if (grade === 10) return 10
  if (grade === 9) return 3
  if (grade === 8) return 1.5
  return 1
}

// Calculate collection rarity score
export function calculateRarityScore(cards: { rarity: string; grade: number }[]): number {
  return cards.reduce((total, card) => {
    const base = RARITY_POINTS[card.rarity] || 1
    return total + base * gradeMultiplier(card.grade)
  }, 0)
}

// Get current pack cost with escalation
export function getPackCost(packType: string, now?: Date): number {
  const base = BASE_PRICES[packType as keyof typeof BASE_PRICES] || BASE_PRICES.standard
  return base * getPriceMultiplier(now)
}

// Get all pack costs
export function getAllPackCosts(now?: Date): Record<string, number> {
  const mult = getPriceMultiplier(now)
  return {
    standard: BASE_PRICES.standard * mult,
    premium: BASE_PRICES.premium * mult,
    monad: BASE_PRICES.monad * mult,
  }
}

// Calculate spend split amounts
export function calculateSpendSplit(totalCost: number): { burn: number; rewardPool: number; treasury: number } {
  const burn = Math.floor(totalCost * SPEND_SPLIT.BURN)
  return {
    burn,
    rewardPool: totalCost - burn, // rest goes to reward pool
    treasury: 0,
  }
}

// Estimate daily yield for a given rarity score
// yield = (your score / total staked score) * daily pool distribution
export function estimateDailyYield(
  yourScore: number, 
  totalStakedScore: number, 
  dailyPoolDistribution: number
): number {
  if (totalStakedScore === 0) return 0
  return (yourScore / totalStakedScore) * dailyPoolDistribution
}

// Legacy exports for backward compat
export const TOKEN_COSTS = {
  PACK_STANDARD: BASE_PRICES.standard,
  PACK_PREMIUM: BASE_PRICES.premium,
  PACK_MONAD: BASE_PRICES.monad,
  RANKED_ENTRY: 1000,
  REMATCH_FEE: 500,
  CRAFT_UNCOMMON: 2500,
  CRAFT_RARE: 7500,
  CRAFT_LEGENDARY: 20000,
  CRAFT_MYTHIC: 0,
  DECK_REVIEW: 2000,
  META_REPORT: 1000,
  CARD_FOIL: 3000,
  DECK_SLEEVE: 5000,
  EMOTE_PACK: 1500,
  MINT_COMMON: 1000,
  MINT_UNCOMMON: 2500,
  MINT_RARE: 10000,
  MINT_LEGENDARY: 50000,
  MINT_MYTHIC: 200000,
} as const

export const ELO_CONFIG = {
  STARTING_ELO: 1000,
  WIN: { rookie: 15, veteran: 25, degen: 40 },
  LOSS: { rookie: -10, veteran: -15, degen: -20 },
  MIN_ELO: 0,
} as const

export function calculateEloChange(won: boolean, difficulty: 'rookie' | 'veteran' | 'degen'): number {
  return won ? ELO_CONFIG.WIN[difficulty] : ELO_CONFIG.LOSS[difficulty]
}

export function canAfford(balance: number, cost: number): boolean {
  return balance >= cost
}

export interface CraftRecipe {
  input: { rarity: string; count: number }
  output: { rarity: string }
  tokenCost: number
}

export const CRAFT_RECIPES: CraftRecipe[] = [
  { input: { rarity: 'common', count: 3 }, output: { rarity: 'uncommon' }, tokenCost: TOKEN_COSTS.CRAFT_UNCOMMON },
  { input: { rarity: 'uncommon', count: 3 }, output: { rarity: 'rare' }, tokenCost: TOKEN_COSTS.CRAFT_RARE },
  { input: { rarity: 'rare', count: 3 }, output: { rarity: 'legendary' }, tokenCost: TOKEN_COSTS.CRAFT_LEGENDARY },
]
