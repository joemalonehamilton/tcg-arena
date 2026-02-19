/**
 * Card Synergy System — combos that reward smart deckbuilding
 * When synergy conditions are met, bonus effects trigger
 */

export interface Synergy {
  id: string
  name: string
  description: string
  icon: string
  // Condition: cards needed on board/in play
  condition: (boardNames: string[], boardAbilities: string[][]) => boolean
  // Effect description shown to player
  effect: string
  // Stat bonuses when active
  powerBonus: number
  toughnessBonus: number
}

export const SYNERGIES: Synergy[] = [
  {
    id: 'mev_sandwich',
    name: 'MEV Combo',
    description: 'Have MEV Extract + Sandwich Attack on board',
    icon: '🥪⛏️',
    condition: (_, abilities) => {
      const flat = abilities.flat()
      return flat.includes('MEV Extract') && flat.includes('Sandwich Attack')
    },
    effect: '+2 power to all your creatures',
    powerBonus: 2,
    toughnessBonus: 0,
  },
  {
    id: 'consensus_stake',
    name: 'Proof of Stake',
    description: 'Have Consensus + Stake + Diamond Hands on board',
    icon: '🤝🔒💎',
    condition: (_, abilities) => {
      const flat = abilities.flat()
      return flat.includes('Consensus') && flat.includes('Stake') && flat.includes('Diamond Hands')
    },
    effect: '+1/+2 to all your creatures',
    powerBonus: 1,
    toughnessBonus: 2,
  },
  {
    id: 'parallel_flash',
    name: 'Parallel Finality',
    description: 'Have Parallel Execution + Flash Finality on board',
    icon: '⚙️⚡',
    condition: (_, abilities) => {
      const flat = abilities.flat()
      return flat.includes('Parallel Execution') && flat.includes('Flash Finality')
    },
    effect: '+3 power to creatures with either ability',
    powerBonus: 3,
    toughnessBonus: 0,
  },
  {
    id: 'dragon_pack',
    name: 'Dragon\'s Fury',
    description: 'Control 2+ Dragon-type creatures',
    icon: '🐉🐉',
    condition: (names) => {
      // Cards with "Dragon" in name
      const dragons = names.filter(n =>
        n.includes('Dragon') || n.includes('Wyrm') || n.includes('Nadzilla')
      )
      return dragons.length >= 2
    },
    effect: '+2/+1 to all your creatures',
    powerBonus: 2,
    toughnessBonus: 1,
  },
  {
    id: 'monad_swarm',
    name: 'Monad Swarm',
    description: 'Control 4+ creatures',
    icon: '🟣🟣🟣🟣',
    condition: (names) => names.length >= 4,
    effect: '+1/+1 to all your creatures',
    powerBonus: 1,
    toughnessBonus: 1,
  },
  {
    id: 'defi_degen',
    name: 'DeFi Degen Stack',
    description: 'Have Rug Pull + Liquidate + Bridge on board',
    icon: '🪤💀🌉',
    condition: (_, abilities) => {
      const flat = abilities.flat()
      return flat.includes('Rug Pull') && flat.includes('Liquidate') && flat.includes('Bridge')
    },
    effect: '+2 power, opponent creatures get -1 toughness',
    powerBonus: 2,
    toughnessBonus: 0,
  },
]

export function getActiveSynergies(
  boardNames: string[],
  boardAbilities: string[][]
): Synergy[] {
  return SYNERGIES.filter(s => s.condition(boardNames, boardAbilities))
}
