'use client'

export interface SampleCard {
  name: string
  cost: number
  power: number
  toughness: number
  type: string
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary' | 'mythic'
  flavor: string
  abilities: string[]
  lore: string
  gradient: string
  artElements: React.ReactNode
  glowColor: string
  imageUrl?: string
  votes?: number
}

// ─── Round 1 & 2 Cards (Abyss + Arsenal) ───

export const sampleCards: SampleCard[] = [
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
    gradient: 'linear-gradient(135deg, #7f1d1d, #dc2626, #f97316, #fbbf24)',
    glowColor: 'rgba(239,68,68,0.4)',
    artElements: null,
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
    gradient: 'linear-gradient(135deg, #1e1b4b, #5b21b6, #7c3aed, #a78bfa)',
    glowColor: 'rgba(139,92,246,0.4)',
    artElements: null,
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
    gradient: 'linear-gradient(135deg, #78350f, #f59e0b, #fbbf24, #fffbeb)',
    glowColor: 'rgba(245,158,11,0.4)',
    artElements: null,
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
    gradient: 'linear-gradient(135deg, #0a0a0a, #1a0a2e, #3b0764, #7f1d1d)',
    glowColor: 'rgba(127,29,29,0.4)',
    artElements: null,
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
    gradient: 'linear-gradient(135deg, #0c4a6e, #0ea5e9, #67e8f9, #ecfeff)',
    glowColor: 'rgba(14,165,233,0.4)',
    artElements: null,
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
    gradient: 'linear-gradient(135deg, #14532d, #16a34a, #22c55e, #4ade80)',
    glowColor: 'rgba(34,197,94,0.4)',
    artElements: null,
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
    gradient: 'linear-gradient(135deg, #1e3a5f, #2563eb, #facc15, #eab308)',
    glowColor: 'rgba(250,204,21,0.4)',
    artElements: null,
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
    gradient: 'linear-gradient(135deg, #1a0000, #450a0a, #7f1d1d, #991b1b)',
    glowColor: 'rgba(153,27,27,0.4)',
    artElements: null,
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
    gradient: 'linear-gradient(135deg, #701a75, #c026d3, #06b6d4, #22d3ee, #a3e635)',
    glowColor: 'rgba(192,38,211,0.4)',
    artElements: null,
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
    gradient: 'linear-gradient(135deg, #030712, #0f0520, #1e1b4b, #4c1d95)',
    glowColor: 'rgba(76,29,149,0.5)',
    artElements: null,
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
    gradient: 'linear-gradient(135deg, #9a3412, #ea580c, #f97316, #fbbf24, #fef3c7)',
    glowColor: 'rgba(249,115,22,0.5)',
    artElements: null,
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
    gradient: 'linear-gradient(135deg, #042f2e, #0d4f4f, #0891b2, #164e63)',
    glowColor: 'rgba(8,145,178,0.4)',
    artElements: null,
  },
]

// ─── Round 3: Monad Monsters ───

export const monadMonsterCards: SampleCard[] = [
  {
    name: 'Nadzilla',
    imageUrl: '/cards/nadzilla.jpg',
    cost: 10, power: 10, toughness: 8, // mythic: 18 total
    type: 'Creature — Dragon/Kaiju',
    rarity: 'mythic',
    abilities: ['Flash Finality', 'Parallel Execution', '51% Attack'],
    lore: 'The apex predator of the Monad ecosystem. Nadzilla processes prey in parallel — by the time you see it, you\'re already finalized.',
    flavor: '"The first block was its footstep. The second was everything else."',
    gradient: 'linear-gradient(135deg, #581c87, #7c3aed, #4ade80)',
    glowColor: 'rgba(255,0,64,0.5)',
    artElements: null,
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
    gradient: 'linear-gradient(135deg, #a855f7, #c4b5fd, #9333ea)',
    glowColor: 'rgba(168,85,247,0.3)',
    artElements: null,
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
    gradient: 'linear-gradient(135deg, #312e81, #9333ea, #e879f9)',
    glowColor: 'rgba(147,51,234,0.4)',
    artElements: null,
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
    gradient: 'linear-gradient(135deg, #6b21a8, #d946ef, #facc15)',
    glowColor: 'rgba(217,70,239,0.4)',
    artElements: null,
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
    gradient: 'linear-gradient(135deg, #1e293b, #6b21a8, #22c55e)',
    glowColor: 'rgba(34,197,94,0.4)',
    artElements: null,
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
    gradient: 'linear-gradient(135deg, #3b0764, #7c3aed, #22d3ee)',
    glowColor: 'rgba(124,58,237,0.4)',
    artElements: null,
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
    gradient: 'linear-gradient(135deg, #a855f7, #8b5cf6, #a3e635)',
    glowColor: 'rgba(163,230,53,0.3)',
    artElements: null,
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
    gradient: 'linear-gradient(135deg, #581c87, #d946ef, #d8b4fe)',
    glowColor: 'rgba(217,70,239,0.5)',
    artElements: null,
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
    gradient: 'linear-gradient(135deg, #9333ea, #6366f1, #581c87)',
    glowColor: 'rgba(99,102,241,0.3)',
    artElements: null,
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
    gradient: 'linear-gradient(135deg, #6b21a8, #8b5cf6, #86efac)',
    glowColor: 'rgba(134,239,172,0.3)',
    artElements: null,
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
    gradient: 'linear-gradient(135deg, #8b5cf6, #d8b4fe, #f9a8d4)',
    glowColor: 'rgba(216,180,254,0.3)',
    artElements: null,
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
    gradient: 'linear-gradient(135deg, #581c87, #7f1d1d, #9333ea)',
    glowColor: 'rgba(127,29,29,0.4)',
    artElements: null,
  },
]

// ─── Card Rendering ───

const rarityBorders: Record<string, string> = {
  common: '#6b7280',
  uncommon: '#22c55e',
  rare: '#a855f7',
  legendary: '#f59e0b',
  mythic: '#ff0040',
}

const abilityColors: Record<string, string> = {
  passive: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  active: 'bg-green-500/20 text-green-300 border-green-500/30',
  triggered: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  'on-death': 'bg-red-500/20 text-red-300 border-red-500/30',
}

// Inline ability type lookup (avoid importing from lib in client component)
const ABILITY_TYPES: Record<string, string> = {
  'Flash Finality': 'active', 'Sandwich Attack': 'triggered', 'Rug Pull': 'on-death',
  'Diamond Hands': 'passive', 'MEV Extract': 'passive', 'Gas Optimization': 'passive',
  'Fork': 'active', 'Liquidate': 'active', '51% Attack': 'triggered',
  'Airdrop': 'triggered', 'Stake': 'active', 'Bridge': 'passive',
  'Mempool': 'active', 'Consensus': 'active', 'Revert': 'triggered',
  'Parallel Execution': 'passive', 'Block Reward': 'triggered', 'Slippage': 'triggered',
}

const ABILITY_ICONS: Record<string, string> = {
  'Flash Finality': '⚡', 'Sandwich Attack': '🥪', 'Rug Pull': '🪤',
  'Diamond Hands': '💎', 'MEV Extract': '⛏️', 'Gas Optimization': '⛽',
  'Fork': '🔀', 'Liquidate': '💀', '51% Attack': '👑',
  'Airdrop': '🪂', 'Stake': '🔒', 'Bridge': '🌉',
  'Mempool': '⏳', 'Consensus': '🤝', 'Revert': '↩️',
  'Parallel Execution': '⚙️', 'Block Reward': '🏆', 'Slippage': '📉',
}

// Ability descriptions for tooltips (DesignSage suggestion)
const ABILITY_DESCS: Record<string, string> = {
  'Flash Finality': 'Instant kill on attack with initiative',
  'Sandwich Attack': 'Steal 2 power from adjacent cards',
  'Rug Pull': 'On death: deal power as damage to all enemies',
  'Diamond Hands': 'Immune to effect destruction',
  'MEV Extract': '+1 power each turn while in play',
  'Gas Optimization': 'Costs 1 less per card you control',
  'Fork': 'Create a -1/-1 copy of this card',
  'Liquidate': 'Destroy card with power < your toughness',
  '51% Attack': '+3/+3 if you control majority of creatures',
  'Airdrop': 'Draw 2 cards when played',
  'Stake': 'Tap for +1/+1; untap loses counters',
  'Bridge': 'Free zone movement',
  'Mempool': 'Delay target ability by 1 turn',
  'Consensus': 'All creatures gain +1/+0 this turn',
  'Revert': 'Undo the last action',
  'Parallel Execution': 'Attack + ability in same turn',
  'Block Reward': '+1 life when any creature enters',
  'Slippage': 'Attacker loses 1 power permanently',
}

export function TCGCardFull({ card, className = '', style = {} }: { card: SampleCard; className?: string; style?: React.CSSProperties }) {
  const borderColor = rarityBorders[card.rarity]
  const isMythic = card.rarity === 'mythic'
  const isLegendary = card.rarity === 'legendary'
  const isRare = card.rarity === 'rare'
  const isCommon = card.rarity === 'common'
  const isUncommon = card.rarity === 'uncommon'
  const isBasic = isCommon || isUncommon
  const isElite = isMythic || isLegendary

  return (
    <div
      className={`relative rounded-xl overflow-hidden flex-shrink-0 transition-all duration-300 group ${isMythic ? 'animate-mythic-glow' : isLegendary ? 'animate-legendary-glow' : ''} ${className}`}
      style={{
        width: '220px',
        height: '340px',
        border: isMythic ? '4px solid #ff0040' : isLegendary ? '3px solid #f59e0b' : isRare ? '2px solid #a855f7' : isUncommon ? `1px solid ${borderColor}80` : `1px solid rgba(255,255,255,0.1)`,
        background: '#0d120d',
        boxShadow: isMythic
          ? `0 0 40px rgba(255,0,64,0.6), 0 0 80px rgba(255,0,64,0.3), inset 0 0 40px rgba(255,0,64,0.15)`
          : isLegendary
          ? `0 0 30px rgba(245,158,11,0.5), 0 0 60px rgba(245,158,11,0.2), inset 0 0 30px rgba(245,158,11,0.1)`
          : isRare
          ? `0 0 20px rgba(168,85,247,0.3), inset 0 0 20px rgba(168,85,247,0.1)`
          : isUncommon
          ? `0 2px 10px rgba(0,0,0,0.3)`
          : `0 1px 4px rgba(0,0,0,0.2)`,
        ...style,
      }}
    >
      {/* Mythic animated crimson border glow + intense holographic shimmer */}
      {isMythic && (
        <>
          <div className="absolute inset-0 rounded-xl pointer-events-none z-30" style={{
            background: 'conic-gradient(from 0deg, #ff0040, #ff6b00, #ffffff, #ff0040, #ff6b00, #ffffff, #ff0040)',
            opacity: 0.2,
            animation: 'spin 3s linear infinite',
          }} />
          <div className="absolute inset-0 rounded-xl pointer-events-none z-30 opacity-60 group-hover:opacity-100 transition-opacity duration-500" style={{
            background: 'linear-gradient(135deg, transparent 15%, rgba(255,0,64,0.3) 30%, rgba(255,255,255,0.25) 50%, rgba(255,107,0,0.3) 70%, transparent 85%)',
            backgroundSize: '300% 300%',
            animation: 'shimmer 2s ease-in-out infinite',
          }} />
          {/* Double floating particles */}
          <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="absolute w-1 h-1 rounded-full" style={{
                backgroundColor: i % 2 === 0 ? '#ff0040' : '#ffffff',
                left: `${8 + i * 7.5}%`,
                animation: `float ${1.5 + i * 0.2}s ease-in-out infinite`,
                animationDelay: `${i * 0.25}s`,
                opacity: 0.8,
                bottom: '10%',
              }} />
            ))}
          </div>
        </>
      )}
      {/* Legendary animated golden border glow + holographic shimmer */}
      {isLegendary && (
        <>
          <div className="absolute inset-0 rounded-xl pointer-events-none z-30" style={{
            background: 'conic-gradient(from 0deg, #f59e0b, #fbbf24, #f59e0b, #fde68a, #f59e0b)',
            opacity: 0.15,
            animation: 'spin 4s linear infinite',
          }} />
          <div className="absolute inset-0 rounded-xl pointer-events-none z-30 opacity-40 group-hover:opacity-80 transition-opacity duration-500" style={{
            background: 'linear-gradient(135deg, transparent 20%, rgba(255,215,0,0.2) 35%, rgba(255,255,255,0.15) 50%, rgba(255,215,0,0.2) 65%, transparent 80%)',
            backgroundSize: '300% 300%',
            animation: 'shimmer 3s ease-in-out infinite',
          }} />
          {/* Floating particles */}
          <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="absolute w-1 h-1 rounded-full bg-yellow-400" style={{
                left: `${15 + i * 14}%`,
                animation: `float ${2 + i * 0.3}s ease-in-out infinite`,
                animationDelay: `${i * 0.4}s`,
                opacity: 0.6,
                bottom: '10%',
              }} />
            ))}
          </div>
        </>
      )}
      {/* Rare purple glow */}
      {isRare && (
        <div className="absolute inset-0 rounded-xl pointer-events-none z-20 opacity-0 group-hover:opacity-50 transition-opacity duration-500" style={{
          background: 'linear-gradient(135deg, transparent 30%, rgba(168,85,247,0.15) 50%, transparent 70%)',
          backgroundSize: '200% 200%',
          animation: 'shimmer 4s ease-in-out infinite',
        }} />
      )}

      {/* Vote badge */}
      {card.votes !== undefined && card.votes > 0 && (
        <div className="absolute top-2 right-2 z-20 bg-green-500/90 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-lg">
          {card.votes} 🗳️
        </div>
      )}

      {/* Cost circle — inner glow for rare+ only */}
      <div className="absolute top-2 left-2 w-8 h-8 rounded-full bg-black/80 flex items-center justify-center text-white font-bold text-sm z-10"
        style={{ border: `${(isElite || isRare) ? '2px' : '1px'} solid ${(isElite || isRare) ? borderColor : 'rgba(255,255,255,0.2)'}`, boxShadow: (isElite || isRare) ? `0 0 8px ${borderColor}60` : 'none' }}>
        {card.cost}
      </div>

      {/* Art area — 55% for more visual impact (ArtCritic) */}
      <div className="relative h-[55%] w-full overflow-hidden" style={{ background: card.imageUrl ? undefined : card.gradient }}>
        {card.imageUrl ? (
          <img src={card.imageUrl} alt={card.name} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0" style={{ background: card.gradient }} />
        )}
        <div className="absolute inset-0" style={{background: 'linear-gradient(to bottom, transparent 60%, #0d120d)'}} />
        {/* Inner frame border — rare+ only */}
        {!isBasic && <div className="absolute inset-1 rounded pointer-events-none" style={{ border: `1px solid ${borderColor}20` }} />}
      </div>

      {/* Name bar */}
      <div className="px-3 py-1 border-t border-b" style={{ borderColor: isBasic ? 'rgba(255,255,255,0.05)' : borderColor, background: isBasic ? 'transparent' : `linear-gradient(90deg, ${borderColor}15, transparent)` }}>
        <span className="text-white text-xs font-bold uppercase tracking-wider">{card.name}</span>
      </div>

      {/* Body */}
      <div className="px-3 py-1 flex-1 relative overflow-hidden">
        <div className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">{card.type}</div>

        {/* Ability pills with tooltip (DesignSage) */}
        {card.abilities && card.abilities.length > 0 && (
          <div className="flex flex-wrap gap-0.5 mb-0.5">
            {card.abilities.map((ab) => {
              const aType = ABILITY_TYPES[ab] || 'passive'
              const colorClass = abilityColors[aType] || abilityColors.passive
              const icon = ABILITY_ICONS[ab] || '✦'
              return (
                <span key={ab} title={ABILITY_DESCS[ab] || ab} className={`text-[7px] px-1.5 py-0.5 rounded-full border cursor-help ${colorClass} whitespace-nowrap`}>
                  {icon} {ab}
                </span>
              )
            })}
          </div>
        )}

        <div className="text-[8px] text-gray-500 italic leading-relaxed line-clamp-2">{card.flavor}</div>
      </div>

      {/* Lore overlay on hover (LoreMaster) */}
      {card.lore && (
        <div className="absolute inset-0 bg-black/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 pointer-events-none z-30">
          <div className="text-xs text-white font-bold mb-1">{card.name}</div>
          <div className="text-[10px] text-gray-300 leading-relaxed mb-2">{card.lore}</div>
          <div className="flex flex-wrap gap-1">
            {card.abilities?.map((ab) => (
              <span key={ab} className="text-[8px] text-arena-accent bg-arena-accent/10 px-1.5 py-0.5 rounded-full">
                {ABILITY_ICONS[ab]} {ab}
              </span>
            ))}
          </div>
          <div className="mt-2 text-[10px] text-gray-500">{card.power}/{card.toughness} · {card.rarity} · Cost {card.cost}</div>
        </div>
      )}

      {/* Power/Toughness */}
      <div
        className="absolute bottom-2 right-2 px-2 py-1 rounded text-white font-bold text-xs z-10"
        style={{ background: isBasic ? 'rgba(255,255,255,0.1)' : `linear-gradient(135deg, ${borderColor}, ${borderColor}cc)`, boxShadow: isBasic ? 'none' : '0 2px 8px rgba(0,0,0,0.3)' }}
      >
        {card.power}/{card.toughness}
      </div>

      {/* Rarity gem — only rare+ gets the glow */}
      <div className="absolute bottom-2 left-2 z-10">
        <div className={`${isMythic ? 'w-3 h-3' : 'w-2.5 h-2.5'} rounded-full ${isElite ? 'animate-pulse' : ''}`} style={{ backgroundColor: isBasic ? 'rgba(255,255,255,0.2)' : borderColor, boxShadow: isBasic ? 'none' : `0 0 ${isMythic ? '14' : isLegendary ? '10' : '6'}px ${borderColor}` }} />
      </div>

      {/* Hover glow — rare+ only */}
      {!isBasic && <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-xl" style={{boxShadow: `inset 0 0 40px ${card.glowColor}`}} />}
    </div>
  )
}
