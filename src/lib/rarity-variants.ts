/**
 * Rarity Variants — Same character, different rarity tiers
 * Each monster has 4 art variants with increasingly detailed/rare art.
 * Agent votes push cards UP or DOWN the rarity ladder over time.
 */

export interface RarityVariant {
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary' | 'mythic'
  artSuffix: string // appended to base image filename
  artStyle: string // prompt modifier for art generation
  statMultiplier: number // multiplier on base stats
  abilitySlots: number // how many abilities this variant gets
  borderEffect: string // CSS effect
  dropRate: number // % chance in packs
}

export const RARITY_VARIANTS: RarityVariant[] = [
  {
    rarity: 'common',
    artSuffix: '',
    artStyle: 'simple flat colors, minimal detail, sketch-like',
    statMultiplier: 0.7,
    abilitySlots: 1,
    borderEffect: 'none',
    dropRate: 50,
  },
  {
    rarity: 'uncommon',
    artSuffix: '-uc',
    artStyle: 'more detailed, richer colors, slight glow effects',
    statMultiplier: 0.85,
    abilitySlots: 2,
    borderEffect: 'border-glow-green',
    dropRate: 30,
  },
  {
    rarity: 'rare',
    artSuffix: '-rare',
    artStyle: 'highly detailed, dynamic pose, energy effects, dramatic lighting',
    statMultiplier: 1.0,
    abilitySlots: 2,
    borderEffect: 'border-glow-purple',
    dropRate: 15,
  },
  {
    rarity: 'legendary',
    artSuffix: '-leg',
    artStyle: 'maximum detail, full scene, particle effects, holographic quality, epic composition',
    statMultiplier: 1.2,
    abilitySlots: 3,
    borderEffect: 'holographic-shimmer',
    dropRate: 5,
  },
  {
    rarity: 'mythic',
    artSuffix: '-mythic',
    artStyle: 'transcendent, reality-breaking detail, divine composition, chromatic aberration, otherworldly energy, cinematic masterpiece',
    statMultiplier: 1.5,
    abilitySlots: 4,
    borderEffect: 'mythic-crimson-pulse',
    dropRate: 0,
  },
]

/**
 * Base characters — each can exist at any rarity tier
 */
export interface BaseCharacter {
  id: string
  name: string
  type: string
  baseCost: number
  basePower: number
  baseToughness: number
  allAbilities: string[] // full ability pool, variants pick from this
  flavor: string
  lore: string
  round: string
  imageBase: string // base filename without extension
}

export const BASE_CHARACTERS: BaseCharacter[] = [
  // Monad Monsters
  { id: 'nadzilla', name: 'Nadzilla', type: 'Creature — Dragon/Kaiju', baseCost: 8, basePower: 7, baseToughness: 6, allAbilities: ['Flash Finality', 'Parallel Execution', '51% Attack'], flavor: '"The first block was its footstep."', lore: 'The apex predator of the Monad ecosystem.', round: 'Monad Monsters', imageBase: 'nadzilla' },
  { id: 'blob-validator', name: 'Blob Validator', type: 'Creature — Slime', baseCost: 2, basePower: 1, baseToughness: 2, allAbilities: ['Block Reward', 'Consensus', 'Stake'], flavor: '"Validates by sitting on them."', lore: 'A sentient blob of consensus data.', round: 'Monad Monsters', imageBase: 'blob-validator' },
  { id: 'phantom-finalizer', name: 'Phantom Finalizer', type: 'Creature — Ghost/Spirit', baseCost: 5, basePower: 4, baseToughness: 3, allAbilities: ['Flash Finality', 'Revert', 'Mempool'], flavor: '"No rollback."', lore: 'A ghost in the consensus layer.', round: 'Monad Monsters', imageBase: 'phantom-finalizer' },
  { id: 'gremlin-mev', name: 'Gremlin MEV', type: 'Creature — Gremlin', baseCost: 3, basePower: 3, baseToughness: 2, allAbilities: ['MEV Extract', 'Sandwich Attack', 'Slippage'], flavor: '"Always cuts in line."', lore: 'Exploits parallel execution paths.', round: 'Monad Monsters', imageBase: 'gremlin-mev' },
  { id: 'monadium', name: 'Monadium', type: 'Creature — Golem/Construct', baseCost: 6, basePower: 5, baseToughness: 5, allAbilities: ['Parallel Execution', 'Consensus', 'Diamond Hands'], flavor: '"Runs on pure throughput."', lore: 'Forged from pure Monad throughput.', round: 'Monad Monsters', imageBase: 'monadium' },
  { id: 'octoracle', name: 'Octoracle', type: 'Creature — Octopus/Seer', baseCost: 4, basePower: 2, baseToughness: 3, allAbilities: ['Airdrop', 'Mempool', 'Fork'], flavor: '"Seven are usually right."', lore: 'Reads the future from transaction patterns.', round: 'Monad Monsters', imageBase: 'octoracle' },
  { id: 'gas-guzzler', name: 'Gas Guzzler', type: 'Creature — Beast', baseCost: 1, basePower: 1, baseToughness: 1, allAbilities: ['Gas Optimization', 'MEV Extract', 'Slippage'], flavor: '"Eats gas for breakfast."', lore: 'Feeds on gas fees.', round: 'Monad Monsters', imageBase: 'gas-guzzler' },
  { id: 'shard-wyrm', name: 'Shard Wyrm', type: 'Creature — Dragon/Serpent', baseCost: 7, basePower: 6, baseToughness: 5, allAbilities: ['Fork', 'Bridge', 'Liquidate'], flavor: '"Each shard is a world."', lore: 'Exists across multiple realities.', round: 'Monad Monsters', imageBase: 'shard-wyrm' },
  { id: 'mempool-lurker', name: 'Mempool Lurker', type: 'Creature — Fish/Horror', baseCost: 2, basePower: 1, baseToughness: 2, allAbilities: ['Mempool', 'Slippage', 'Sandwich Attack'], flavor: '"Watching. Waiting."', lore: 'Waits in the pending transaction queue.', round: 'Monad Monsters', imageBase: 'mempool-lurker' },
  { id: 'bft-crab', name: 'BFT Crab', type: 'Creature — Crab', baseCost: 3, basePower: 2, baseToughness: 3, allAbilities: ['Consensus', 'Slippage', 'Diamond Hands'], flavor: '"Two-thirds must agree."', lore: 'A Byzantine crab.', round: 'Monad Monsters', imageBase: 'bft-crab' },
  { id: 'block-bunny', name: 'Block Bunny', type: 'Creature — Rabbit', baseCost: 1, basePower: 1, baseToughness: 1, allAbilities: ['Bridge', 'Airdrop', 'Gas Optimization'], flavor: '"200ms to hop."', lore: 'The fastest creature on Monad.', round: 'Monad Monsters', imageBase: 'block-bunny' },
  { id: 'devnet-horror', name: 'The Devnet Horror', type: 'Creature — Eldritch/Bug', baseCost: 5, basePower: 4, baseToughness: 4, allAbilities: ['Revert', 'Fork', 'Rug Pull'], flavor: '"Unhandled exception."', lore: 'Emerged from an unhandled exception.', round: 'Monad Monsters', imageBase: 'the-devnet-horror' },
  // Abyss + Arsenal
  { id: 'rugpull-dragon', name: 'Rugpull Dragon', type: 'Creature — Dragon', baseCost: 7, basePower: 5, baseToughness: 5, allAbilities: ['Rug Pull', 'MEV Extract', 'Liquidate'], flavor: '"Pumps before it dumps."', lore: 'Born from a thousand dead projects.', round: 'Creatures of the Abyss', imageBase: 'rugpull-dragon' },
  { id: 'the-deployer', name: 'The Deployer', type: 'Creature — Human Wizard', baseCost: 5, basePower: 3, baseToughness: 4, allAbilities: ['Fork', 'Gas Optimization', 'Airdrop'], flavor: '"One contract to rule them all."', lore: 'The first to write code into the Abyss.', round: 'Creatures of the Abyss', imageBase: 'the-deployer' },
  { id: 'frozen-liquidity', name: 'Frozen Liquidity', type: 'Creature — Dragon', baseCost: 8, basePower: 6, baseToughness: 6, allAbilities: ['Diamond Hands', 'Liquidate', 'Revert'], flavor: '"Funds unavailable."', lore: 'Born when billions froze overnight.', round: 'Creatures of the Abyss', imageBase: 'frozen-liquidity' },
  { id: 'whale', name: 'Whale', type: 'Creature — Leviathan', baseCost: 8, basePower: 6, baseToughness: 7, allAbilities: ['51% Attack', 'Consensus', 'Liquidate'], flavor: '"The ocean moves when it moves."', lore: 'The deepest pocket in the ocean.', round: 'Arcane Arsenal', imageBase: 'whale' },
  { id: 'dead-cat-bounce', name: 'Dead Cat Bounce', type: 'Creature — Phoenix', baseCost: 7, basePower: 5, baseToughness: 5, allAbilities: ['Revert', 'Airdrop', 'MEV Extract'], flavor: '"Always comes back."', lore: 'Dies with every crash, rises with every rally.', round: 'Arcane Arsenal', imageBase: 'dead-cat-bounce' },
  { id: 'rug-walker', name: 'Rug Walker', type: 'Creature — Eldritch', baseCost: 8, basePower: 7, baseToughness: 5, allAbilities: ['Rug Pull', 'Bridge', 'Flash Finality'], flavor: '"None of them survive."', lore: 'Walks between chains.', round: 'Arcane Arsenal', imageBase: 'rug-walker' },
]

/**
 * Generate a card instance at a specific rarity from a base character
 */
export function generateVariant(char: BaseCharacter, rarity: 'common' | 'uncommon' | 'rare' | 'legendary' | 'mythic') {
  const variant = RARITY_VARIANTS.find(v => v.rarity === rarity)!
  const abilities = char.allAbilities.slice(0, variant.abilitySlots)

  return {
    id: `${char.id}-${rarity}`,
    name: char.name,
    type: char.type,
    rarity,
    cost: Math.max(1, Math.round(char.baseCost * variant.statMultiplier)),
    power: Math.max(1, Math.round(char.basePower * variant.statMultiplier)),
    toughness: Math.max(1, Math.round(char.baseToughness * variant.statMultiplier)),
    abilities,
    flavor: char.flavor,
    lore: char.lore,
    round: char.round,
    imageUrl: `/cards/${char.imageBase}.jpg`, // TODO: rarity-specific art
  }
}

/**
 * Agent Flywheel — agents push cards up/down rarity based on votes
 */
export interface RarityVote {
  agentId: string
  cardId: string
  direction: 'up' | 'down'
  reasoning: string
}

export function calculateRarityShift(currentRarity: string, votes: RarityVote[]): string {
  const upVotes = votes.filter(v => v.direction === 'up').length
  const downVotes = votes.filter(v => v.direction === 'down').length
  const net = upVotes - downVotes

  const rarityOrder = ['common', 'uncommon', 'rare', 'legendary']
  const currentIndex = rarityOrder.indexOf(currentRarity)

  if (net >= 3 && currentIndex < 3) return rarityOrder[currentIndex + 1]
  if (net <= -3 && currentIndex > 0) return rarityOrder[currentIndex - 1]
  return currentRarity
}
