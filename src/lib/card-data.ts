// Server-safe card data — no React dependencies
// Auto-extracted from SampleCards.tsx

export interface CardData {
  name: string
  cost: number
  power: number
  toughness: number
  type: string
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary' | 'mythic'
  flavor: string
  abilities: string[]
  lore: string
  imageUrl?: string
}

export const sampleCards: CardData[] = [
  // ── Creatures of the Abyss (Round 1) ──
  {
    name: 'Rugpull Dragon',
    imageUrl: '/cards/rugpull-dragon.jpg',
    cost: 7, power: 5, toughness: 5, // rare: 10 total
    type: 'Creature — Dragon',
    rarity: 'rare',
    abilities: ['Rug Pull', 'MEV Extract'],
    lore: 'Born from the ashes of a thousand dead projects. It feeds on broken promises and liquidity pools drained dry.',
    flavor: '"It pumps before it dumps. Every time."',
    
    
    
  },
  {
    name: 'The Deployer',
    imageUrl: '/cards/the-deployer.jpg',
    cost: 6, power: 4, toughness: 5, // rare: 9 total
    type: 'Creature — Human Wizard',
    rarity: 'rare',
    abilities: ['Fork', 'Gas Optimization'],
    lore: 'The first to write code into the Abyss. Some say his contracts still run in blocks no explorer can find.',
    flavor: '"One contract to rule them all."',
    
    
    
  },
  {
    name: 'Ser Greencandle',
    imageUrl: '/cards/ser-greencandle.jpg',
    cost: 4, power: 3, toughness: 3, // uncommon: 6 total
    type: 'Creature — Human Knight',
    rarity: 'uncommon',
    abilities: ['Consensus', 'Block Reward'],
    lore: 'A knight who only appears during bull runs. His armor glows with the light of a thousand green candles.',
    flavor: '"He only shows up on good days."',
    
    
    
  },
  {
    name: 'Sandwich Bot',
    imageUrl: '/cards/sandwich-bot.jpg',
    cost: 3, power: 3, toughness: 2, // uncommon: 5 total
    type: 'Creature — Construct',
    rarity: 'uncommon',
    abilities: ['Sandwich Attack'],
    lore: 'It lurks in the mempool, waiting for the perfect swap to front-run. By the time you notice, your slippage is gone.',
    flavor: '"You never see it coming. But your slippage does."',
    
    
    
  },
  {
    name: 'Frozen Liquidity',
    imageUrl: '/cards/frozen-liquidity.jpg',
    cost: 9, power: 7, toughness: 7, // legendary: 14 total
    type: 'Creature — Dragon',
    rarity: 'legendary',
    abilities: ['Diamond Hands', 'Liquidate', 'Revert'],
    lore: 'A titan of the deep pools, born when billions in TVL froze overnight. It exhales absolute zero — nothing escapes its liquidity lock.',
    flavor: '"Your funds aren\'t lost. They\'re just... unavailable."',
    
    
    
  },
  {
    name: 'Seed Phrase Treant',
    imageUrl: '/cards/seed-phrase-treant.jpg',
    cost: 2, power: 1, toughness: 3, // common: 4 total
    type: 'Creature — Elemental',
    rarity: 'common',
    abilities: ['Stake'],
    lore: 'It grows one branch for each word. Lose a branch, lose everything. Twelve words, twelve chances.',
    flavor: '"Twelve words. Twelve branches. Don\'t lose either."',
    
    
    
  },
  // ── Arcane Arsenal (Round 2) ──
  {
    name: 'The Liquidator',
    imageUrl: '/cards/the-liquidator.jpg',
    cost: 6, power: 5, toughness: 5, // rare: 10 total
    type: 'Creature — Giant',
    rarity: 'rare',
    abilities: ['Liquidate', '51% Attack'],
    lore: 'Forged from cascading liquidation events, The Liquidator embodies the chain reaction that wipes leveraged positions clean.',
    flavor: '"Your margin called. He answered."',
    
    
    
  },
  {
    name: 'Redcandle Witch',
    imageUrl: '/cards/redcandle-witch.jpg',
    cost: 4, power: 3, toughness: 3, // uncommon: 6 total
    type: 'Creature — Human Warlock',
    rarity: 'uncommon',
    abilities: ['Slippage', 'Mempool'],
    lore: 'She reads the charts backwards. Every red candle she lights brings another portfolio to ruin.',
    flavor: '"She doesn\'t predict the dip. She IS the dip."',
    
    
    
  },
  {
    name: 'Diamond Hands Golem',
    imageUrl: '/cards/diamond-hands-golem.jpg',
    cost: 5, power: 4, toughness: 4, // uncommon: 8 total
    type: 'Artifact Creature — Golem',
    rarity: 'uncommon',
    abilities: ['Diamond Hands'],
    lore: 'An artifact from the Arsenal vaults, built to hold and never sell. Its crystalline grip has outlasted bear markets and rug pulls alike.',
    flavor: '"It literally cannot let go."',
    
    
    
  },
  {
    name: 'Rug Walker',
    imageUrl: '/cards/rug-walker.jpg',
    cost: 9, power: 8, toughness: 5, // legendary: 13 total
    type: 'Creature — Eldritch',
    rarity: 'legendary',
    abilities: ['Rug Pull', 'Bridge', 'Flash Finality'],
    lore: 'It walks between chains, leaving dead protocols in its wake. No audit can detect it. No multisig can stop it.',
    flavor: '"It walks between projects. None of them survive."',
    
    
    
  },
  {
    name: 'Dead Cat Bounce',
    imageUrl: '/cards/dead-cat-bounce.jpg',
    cost: 6, power: 4, toughness: 5, // rare: 9 total
    type: 'Creature — Phoenix',
    rarity: 'rare',
    abilities: ['Revert', 'Airdrop'],
    lore: 'It dies with every crash and rises with every relief rally. Each resurrection is weaker than the last, but it always comes back.',
    flavor: '"It always comes back. But never as high."',
    
    
    
  },
  {
    name: 'Whale',
    imageUrl: '/cards/whale.jpg',
    cost: 8, power: 6, toughness: 8, // legendary: 14 total
    type: 'Creature — Leviathan',
    rarity: 'legendary',
    abilities: ['51% Attack', 'Consensus', 'Liquidate'],
    lore: 'The deepest pocket in the ocean. When the Whale moves, markets follow — not by choice, but by gravity.',
    flavor: '"The ocean moves when it moves."',
    
    
    
  },
]

export const monadMonsterCards: CardData[] = [
  {
    name: 'Nadzilla',
    imageUrl: '/cards/nadzilla.jpg',
    cost: 10, power: 10, toughness: 8, // mythic: 18 total
    type: 'Creature — Dragon/Kaiju',
    rarity: 'mythic',
    abilities: ['Flash Finality', 'Parallel Execution', '51% Attack'],
    lore: 'The apex predator of the Monad ecosystem. Nadzilla processes prey in parallel — by the time you see it, you\'re already finalized.',
    flavor: '"The first block was its footstep. The second was everything else."',
    
    
    
  },
  {
    name: 'Blob Validator',
    imageUrl: '/cards/blob-validator.jpg',
    cost: 2, power: 1, toughness: 3, // common: 4
    type: 'Creature — Slime',
    rarity: 'common',
    abilities: ['Block Reward'],
    lore: 'A sentient blob of consensus data. It validates blocks simply by absorbing them. Surprisingly effective.',
    flavor: '"It validates blocks by sitting on them. Surprisingly effective."',
    
    
    
  },
  {
    name: 'Phantom Finalizer',
    imageUrl: '/cards/phantom-finalizer.jpg',
    cost: 6, power: 5, toughness: 4, // rare: 9
    type: 'Creature — Ghost/Spirit',
    rarity: 'rare',
    abilities: ['Flash Finality', 'Revert'],
    lore: 'A ghost in the consensus layer. Once the Phantom touches a block, it\'s final — no rollback, no appeal, no second chance.',
    flavor: '"Once it touches you, there\'s no rollback."',
    
    
    
  },
  {
    name: 'Gremlin MEV',
    imageUrl: '/cards/gremlin-mev.jpg',
    cost: 3, power: 3, toughness: 2, // uncommon: 5
    type: 'Creature — Gremlin',
    rarity: 'uncommon',
    abilities: ['MEV Extract', 'Sandwich Attack'],
    lore: 'Even on Monad, MEV finds a way. This gremlin exploits parallel execution paths, extracting value from every fork in the road.',
    flavor: '"It always cuts in line. Always."',
    
    
    
  },
  {
    name: 'Monadium',
    imageUrl: '/cards/monadium.jpg',
    cost: 6, power: 5, toughness: 6, // rare: 11
    type: 'Creature — Golem/Construct',
    rarity: 'rare',
    abilities: ['Parallel Execution', 'Consensus'],
    lore: 'A construct forged from pure Monad throughput. Each limb processes a different transaction. It doesn\'t walk — it pipelines.',
    flavor: '"Built from the first testnet. Runs on pure throughput."',
    
    
    
  },
  {
    name: 'Octoracle',
    imageUrl: '/cards/octoracle.jpg',
    cost: 4, power: 2, toughness: 4, // uncommon: 6
    type: 'Creature — Octopus/Seer',
    rarity: 'uncommon',
    abilities: ['Airdrop', 'Mempool'],
    lore: 'Eight tentacles, eight data feeds. The Octoracle reads the future from transaction patterns — and it\'s usually right.',
    flavor: '"Eight arms, eight predictions. Seven are usually right."',
    
    
    
  },
  {
    name: 'Gas Guzzler',
    imageUrl: '/cards/gas-guzzler.jpg',
    cost: 1, power: 1, toughness: 1, // common: 2
    type: 'Creature — Beast',
    rarity: 'common',
    abilities: ['Gas Optimization'],
    lore: 'A small creature that feeds on gas fees. On Monad, where gas is cheap, it\'s always hungry.',
    flavor: '"It eats gas fees for breakfast. Literally."',
    
    
    
  },
  {
    name: 'Shard Wyrm',
    imageUrl: '/cards/shard-wyrm.jpg',
    cost: 6, power: 5, toughness: 4, // rare: 9
    type: 'Creature — Dragon/Serpent',
    rarity: 'rare',
    abilities: ['Fork', 'Bridge'],
    lore: 'Each scale is a shard of a parallel execution thread. The Wyrm exists across multiple realities simultaneously.',
    flavor: '"Each scale is a shard. Each shard is a world."',
    
    
    
  },
  {
    name: 'Mempool Lurker',
    imageUrl: '/cards/mempool-lurker.jpg',
    cost: 2, power: 1, toughness: 2, // common: 3
    type: 'Creature — Fish/Horror',
    rarity: 'common',
    abilities: ['Mempool'],
    lore: 'It waits in the pending transaction queue, patient as death. On Monad, the wait is short — but it\'s always there.',
    flavor: '"It waits in the mempool. Watching. Waiting. Mostly waiting."',
    
    
    
  },
  {
    name: 'BFT Crab',
    imageUrl: '/cards/bft-crab.jpg',
    cost: 3, power: 2, toughness: 4, // uncommon: 6
    type: 'Creature — Crab',
    rarity: 'uncommon',
    abilities: ['Consensus', 'Slippage'],
    lore: 'A Byzantine crab that can only be defeated if two-thirds of all crabs agree. Good luck getting crabs to agree on anything.',
    flavor: '"It only agrees to die if two-thirds of the crabs agree first."',
    
    
    
  },
  {
    name: 'Block Bunny',
    imageUrl: '/cards/block-bunny.jpg',
    cost: 1, power: 1, toughness: 1, // common: 2
    type: 'Creature — Rabbit',
    rarity: 'common',
    abilities: ['Bridge'],
    lore: 'The fastest creature on Monad. It hops between blocks in 400ms, carrying tiny transactions in its cheeks.',
    flavor: '"400ms to finality. 200ms to hop."',
    
    
    
  },
  {
    name: 'The Devnet Horror',
    imageUrl: '/cards/the-devnet-horror.jpg',
    cost: 5, power: 4, toughness: 4, // uncommon: 8
    type: 'Creature — Eldritch/Bug',
    rarity: 'uncommon',
    abilities: ['Revert', 'Fork'],
    lore: 'It emerged from an unhandled exception on devnet. No one filed a bug report. Now it\'s everyone\'s problem.',
    flavor: '"It emerged from an unhandled exception. No one filed a bug report."',
    
    
    
  },
]
