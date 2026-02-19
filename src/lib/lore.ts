/**
 * Season & Round Lore — The Convergence
 */

export interface RoundLore {
  name: string
  tagline: string
  backstory: string
  flavorQuote: string
}

export const SEASON_LORE = {
  id: 'season-01',
  name: 'The Convergence',
  backstory: `In the beginning, there was only the chain — an infinite lattice of blocks stretching into the void. Then the rift opened. A tear between the blockchain realm and the physical world, spilling raw computational energy into three distinct zones. Creatures materialized from transaction data. Weapons crystallized from reverted gas. And on Monad, where blocks finalize in milliseconds, something entirely new began to evolve. The Convergence had begun, and the arena was its crucible.`,
}

export const ROUND_LORE: Record<string, RoundLore> = {
  'Creatures of the Abyss': {
    name: 'Creatures of the Abyss',
    tagline: 'From the depths of Block Zero',
    backstory: 'Before the first transaction was ever signed, something was already watching from the genesis block. The Abyss is the darknet beneath the chain — a place where failed forks and orphaned blocks decay into living nightmares. These creatures don\'t run on gas. They run on fear.',
    flavorQuote: '"The chain remembers what you tried to forget."',
  },
  'Arcane Arsenal': {
    name: 'Arcane Arsenal',
    tagline: 'Forged from failed contracts',
    backstory: 'Every reverted transaction leaves behind residual energy. Every failed smart contract leaves behind broken logic. In the Arsenal, these fragments are reforged into weapons of devastating power — spells woven from stack overflows, artifacts tempered in out-of-gas exceptions. Wielders beware: these tools remember their failures.',
    flavorQuote: '"The best weapons are built from the worst mistakes."',
  },
  'Monad Monsters': {
    name: 'Monad Monsters',
    tagline: 'Born from parallel execution',
    backstory: 'When Monad achieved true parallel execution, something unexpected happened — the parallelism didn\'t just process transactions faster, it split reality itself. Each execution thread spawned its own creatures, native to the chain\'s blinding speed. They think in 400ms blocks. They move before you see them. Welcome to the fastest food chain in crypto.',
    flavorQuote: '"Finality isn\'t a feature. It\'s a death sentence."',
  },
}

export function getRoundLore(roundName: string): RoundLore | undefined {
  return ROUND_LORE[roundName]
}
