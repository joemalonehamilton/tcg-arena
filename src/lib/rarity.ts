/**
 * Rarity Economics — distribution rules, vote weights, token supply caps
 */

export interface RarityConfig {
  label: string
  color: string
  borderColor: string
  voteMultiplier: number
  tokenSupply: number
  tokenSupplyLabel: string
  description: string
  statRange: { min: number; max: number } // power+toughness total
  costRange: { min: number; max: number }
  abilitiesCount: { min: number; max: number }
  perRound: number // how many of this rarity per 12-card round
}

export const RARITY_CONFIG: Record<string, RarityConfig> = {
  common: {
    label: 'Common',
    color: '#9ca3af',
    borderColor: '#6b7280',
    voteMultiplier: 1,
    tokenSupply: 1_000_000_000,
    tokenSupplyLabel: '1B',
    description: 'The backbone of every set. Solid, reliable, abundant.',
    statRange: { min: 2, max: 4 },
    costRange: { min: 1, max: 3 },
    abilitiesCount: { min: 1, max: 1 },
    perRound: 4,
  },
  uncommon: {
    label: 'Uncommon',
    color: '#22c55e',
    borderColor: '#22c55e',
    voteMultiplier: 1.5,
    tokenSupply: 500_000_000,
    tokenSupplyLabel: '500M',
    description: 'A step above. Interesting mechanics, stronger stats.',
    statRange: { min: 5, max: 8 },
    costRange: { min: 3, max: 5 },
    abilitiesCount: { min: 1, max: 2 },
    perRound: 4,
  },
  rare: {
    label: 'Rare',
    color: '#a855f7',
    borderColor: '#a855f7',
    voteMultiplier: 2,
    tokenSupply: 100_000_000,
    tokenSupplyLabel: '100M',
    description: 'Powerful and scarce. These define the meta.',
    statRange: { min: 8, max: 12 },
    costRange: { min: 5, max: 7 },
    abilitiesCount: { min: 2, max: 3 },
    perRound: 2,
  },
  legendary: {
    label: 'Legendary',
    color: '#f59e0b',
    borderColor: '#f59e0b',
    voteMultiplier: 3,
    tokenSupply: 10_000_000,
    tokenSupplyLabel: '10M',
    description: 'Ultra-scarce. Game-warping. Token launch material.',
    statRange: { min: 12, max: 17 },
    costRange: { min: 7, max: 10 },
    abilitiesCount: { min: 2, max: 3 },
    perRound: 2,
  },
  mythic: {
    label: 'Mythic',
    color: '#ff0040',
    borderColor: '#ff0040',
    voteMultiplier: 5,
    tokenSupply: 1_000_000,
    tokenSupplyLabel: '1M',
    description: 'One per season. The card that defines an era. Unobtainable through packs.',
    statRange: { min: 16, max: 20 },
    costRange: { min: 9, max: 10 },
    abilitiesCount: { min: 3, max: 4 },
    perRound: 0,
  },
}

export function getRarityConfig(rarity: string): RarityConfig {
  return RARITY_CONFIG[rarity] || RARITY_CONFIG.common
}

export function getWeightedVoteCount(votes: number, rarity: string): number {
  return votes * getRarityConfig(rarity).voteMultiplier
}
