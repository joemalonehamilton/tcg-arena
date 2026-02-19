/**
 * Card Abilities System — Crypto-themed game mechanics
 */

export type AbilityType = 'passive' | 'active' | 'triggered' | 'on-death'

export interface Ability {
  name: string
  type: AbilityType
  description: string
  icon: string // emoji
}

export const ABILITIES: Record<string, Ability> = {
  'Flash Finality': {
    name: 'Flash Finality',
    type: 'active',
    description: 'Instant kill on attack if you have initiative.',
    icon: '⚡',
  },
  'Sandwich Attack': {
    name: 'Sandwich Attack',
    type: 'triggered',
    description: 'Steal 2 power from adjacent cards when played.',
    icon: '🥪',
  },
  'Rug Pull': {
    name: 'Rug Pull',
    type: 'on-death',
    description: 'Destroy self, deal damage equal to power to all enemies.',
    icon: '🪤',
  },
  'Diamond Hands': {
    name: 'Diamond Hands',
    type: 'passive',
    description: 'Cannot be destroyed by effects, only combat.',
    icon: '💎',
  },
  'MEV Extract': {
    name: 'MEV Extract',
    type: 'passive',
    description: 'Gain +1 power each turn while in play.',
    icon: '⛏️',
  },
  'Gas Optimization': {
    name: 'Gas Optimization',
    type: 'passive',
    description: 'Costs 1 less for each card you control.',
    icon: '⛽',
  },
  'Fork': {
    name: 'Fork',
    type: 'active',
    description: 'Create a copy of this card with -1/-1.',
    icon: '🔀',
  },
  'Liquidate': {
    name: 'Liquidate',
    type: 'active',
    description: 'Destroy target card with power less than this card\'s toughness.',
    icon: '💀',
  },
  '51% Attack': {
    name: '51% Attack',
    type: 'triggered',
    description: 'If you control majority of creatures, gain +3/+3.',
    icon: '👑',
  },
  'Airdrop': {
    name: 'Airdrop',
    type: 'triggered',
    description: 'When played, draw 2 cards.',
    icon: '🪂',
  },
  'Stake': {
    name: 'Stake',
    type: 'active',
    description: 'Tap to gain +1/+1 counter each turn. Untap loses all counters.',
    icon: '🔒',
  },
  'Bridge': {
    name: 'Bridge',
    type: 'passive',
    description: 'Move between zones without paying movement cost.',
    icon: '🌉',
  },
  'Mempool': {
    name: 'Mempool',
    type: 'active',
    description: 'Delay target card\'s ability by 1 turn.',
    icon: '⏳',
  },
  'Consensus': {
    name: 'Consensus',
    type: 'active',
    description: 'All your creatures gain +1/+0 until end of turn.',
    icon: '🤝',
  },
  'Revert': {
    name: 'Revert',
    type: 'triggered',
    description: 'Undo the last action taken.',
    icon: '↩️',
  },
  'Parallel Execution': {
    name: 'Parallel Execution',
    type: 'passive',
    description: 'Can attack and use abilities in the same turn.',
    icon: '⚙️',
  },
  'Block Reward': {
    name: 'Block Reward',
    type: 'triggered',
    description: 'Gain 1 life when any creature enters play.',
    icon: '🏆',
  },
  'Slippage': {
    name: 'Slippage',
    type: 'triggered',
    description: 'When attacked, attacker loses 1 power permanently.',
    icon: '📉',
  },
}

export function getAbility(name: string): Ability | undefined {
  return ABILITIES[name]
}

export function getAbilitiesByType(type: AbilityType): Ability[] {
  return Object.values(ABILITIES).filter(a => a.type === type)
}
