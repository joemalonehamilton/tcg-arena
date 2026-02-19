/**
 * In-memory database for MVP.
 */

import type { Card, Agent, Proposal, Season, ActivityEvent } from '@/types'

export const cards = new Map<string, Card>()
export const agents = new Map<string, Agent>()
export const proposals = new Map<string, Proposal>()
export const activity: ActivityEvent[] = []

// API key → agent ID lookup
export const apiKeyIndex = new Map<string, string>()

let currentSeason: Season = {
  id: 'season-0',
  state: 'WAITING',
  cardCount: 0,
  agentCount: 0,
}

export function getSeason(): Season {
  return currentSeason
}

export function setSeason(s: Season): void {
  currentSeason = s
}

// === Rounds system ===

export interface Round {
  id: string
  name: string
  theme: string
  status: 'upcoming' | 'active' | 'completed'
  startsAt: string
  endsAt: string
  totalVotes: number
  cardCount: number
}

export interface RoundCard {
  id: string
  roundId: string
  name: string
  type: string
  subtype: string
  cost: number
  power: number | null
  toughness: number | null
  abilities: string[]
  flavor: string
  rarity: string
  artDescription: string
  votes: number
}

export interface Vote {
  id: string
  roundId: string
  cardId: string
  agentId: string
  reasoning: string
  critiques: { cardId: string; score: number; critique: string }[]
  timestamp: number
}

export const rounds = new Map<string, Round>()
export const roundCards = new Map<string, RoundCard>()
export const votes: Vote[] = []

// Agent API keys for voting (agentId → apiKey)
export const agentApiKeys = new Map<string, string>([
  ['agent-art-critic', 'agent:agent-art-critic'],
  ['agent-meta-gamer', 'agent:agent-meta-gamer'],
  ['agent-lore-master', 'agent:agent-lore-master'],
  ['agent-deg-trader', 'agent:agent-deg-trader'],
  ['agent-design-sage', 'agent:agent-design-sage'],
])

// Initialize mock data
function initRounds() {
  const now = new Date()
  const r1End = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000)
  const r2End = new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000)
  const r1Start = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)
  const r2Start = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000)

  rounds.set('round-1', {
    id: 'round-1', name: 'Creatures of the Abyss', theme: 'creature', status: 'active',
    startsAt: r1Start.toISOString(), endsAt: r1End.toISOString(), totalVotes: 0, cardCount: 12,
  })
  rounds.set('round-2', {
    id: 'round-2', name: 'Arcane Arsenal', theme: 'spell/artifact', status: 'active',
    startsAt: r2Start.toISOString(), endsAt: r2End.toISOString(), totalVotes: 0, cardCount: 12,
  })

  // Round 1: 12 creature cards
  const r1Cards: Omit<RoundCard, 'roundId' | 'votes'>[] = [
    { id: 'r1c1', name: 'Whale', type: 'creature', subtype: 'Sea Serpent', cost: 7, power: 8, toughness: 6, abilities: ['Trample', 'When enters: draw 2 cards'], flavor: 'The ocean floor trembles at its passing.', rarity: 'legendary', artDescription: 'A massive serpentine creature rising from a deep ocean trench, bioluminescent scales glowing blue-green, tentacles reaching toward a sinking ship above.' },
    { id: 'r1c2', name: 'Void Crawler', type: 'creature', subtype: 'Horror', cost: 3, power: 2, toughness: 4, abilities: ['Deathtouch', 'Cannot be blocked by creatures with power 3 or less'], flavor: 'It moves between the cracks in reality.', rarity: 'rare', artDescription: 'A spindly, multi-limbed creature emerging from a tear in space, dark purple energy leaking from its joints, eyeless face with rows of needle teeth.' },
    { id: 'r1c3', name: 'Coral Witch', type: 'creature', subtype: 'Merfolk Wizard', cost: 4, power: 3, toughness: 3, abilities: ['When enters: target creature gets -2/-2 until end of turn', 'Tap: scry 1'], flavor: 'She weaves curses from living reef.', rarity: 'uncommon', artDescription: 'A merfolk woman with coral growing from her shoulders and crown, casting a spell with glowing turquoise energy, surrounded by tiny reef fish.' },
    { id: 'r1c4', name: 'Brine Ghoul', type: 'creature', subtype: 'Zombie Fish', cost: 2, power: 3, toughness: 1, abilities: ['Haste', 'At end of turn, sacrifice this creature'], flavor: 'Dead fish tell no tales, but they still bite.', rarity: 'common', artDescription: 'A rotting fish-humanoid hybrid lurching forward with glowing green eyes, seaweed draped over its skeletal frame, water dripping from exposed bones.' },
    { id: 'r1c5', name: 'Tidecaller Empress', type: 'creature', subtype: 'Elemental Noble', cost: 6, power: 5, toughness: 5, abilities: ['Flying', 'Other creatures you control get +1/+1', 'When dies: create 3 1/1 Water Elemental tokens'], flavor: 'The tides answer to her alone.', rarity: 'legendary', artDescription: 'A regal figure made of living water hovering above crashing waves, wearing a crown of frozen sea foam, commanding columns of water that form soldiers.' },
    { id: 'r1c6', name: 'Anglerfiend', type: 'creature', subtype: 'Deep One', cost: 4, power: 4, toughness: 3, abilities: ['Flash', 'When enters: exile target creature until this leaves play'], flavor: 'Its light promises salvation. Its jaws deliver oblivion.', rarity: 'rare', artDescription: 'A deep-sea anglerfish demon with a glowing lure shaped like a golden coin, massive jaws open wide, swimming through pitch-black water with tiny terrified fish fleeing.' },
    { id: 'r1c7', name: 'Barnacle Brute', type: 'creature', subtype: 'Crustacean Warrior', cost: 3, power: 4, toughness: 2, abilities: ['First Strike'], flavor: 'Encrusted with the hulls of a hundred shipwrecks.', rarity: 'common', artDescription: 'A hulking humanoid covered in barnacles and ship debris, wielding an anchor as a weapon, standing on a rocky shore with storm clouds behind.' },
    { id: 'r1c8', name: 'Pressure Drake', type: 'creature', subtype: 'Dragon Fish', cost: 5, power: 4, toughness: 4, abilities: ['Flying', 'When attacks: deal 2 damage to target creature'], flavor: 'Born where sunlight dies and pressure crushes steel.', rarity: 'rare', artDescription: 'A dragon-like deep-sea creature with translucent skin showing its skeleton, fin-wings spread wide, breathing a beam of pressurized water that cuts through rock.' },
    { id: 'r1c9', name: 'Jellyspore Colony', type: 'creature', subtype: 'Jellyfish Fungus', cost: 2, power: 0, toughness: 4, abilities: ['Defender', 'When dealt damage: create a 1/1 Spore token', 'Tap: gain 1 life'], flavor: 'Touch it and it multiplies. Ignore it and it spreads.', rarity: 'uncommon', artDescription: 'A cluster of bioluminescent jellyfish fused with mushroom caps, floating in a cave filled with spore clouds, tendrils reaching out in all directions.' },
    { id: 'r1c10', name: 'Shipbreaker Kraken', type: 'creature', subtype: 'Kraken', cost: 8, power: 10, toughness: 10, abilities: ['Trample', 'Cannot be countered', 'When enters: tap all creatures opponents control'], flavor: 'Maps mark its territory with one word: Death.', rarity: 'legendary', artDescription: 'An enormous kraken wrapping its tentacles around three galleons simultaneously, eye the size of a ship\'s hull glowing crimson, storm raging above.' },
    { id: 'r1c11', name: 'Tidal Imp', type: 'creature', subtype: 'Imp', cost: 1, power: 1, toughness: 1, abilities: ['When enters: look at top card of opponent\'s deck'], flavor: 'Annoying. Persistent. Everywhere.', rarity: 'common', artDescription: 'A tiny blue imp with fish fins for ears, surfing on a small wave, sticking its tongue out mischievously, holding a stolen scroll.' },
    { id: 'r1c12', name: 'Maelstrom Hydra', type: 'creature', subtype: 'Hydra Elemental', cost: 6, power: 5, toughness: 5, abilities: ['When enters: choose a number. Create that many +1/+1 counters, then mill that many cards', 'Regenerate'], flavor: 'Each head drinks from a different current.', rarity: 'rare', artDescription: 'A five-headed hydra made of swirling water and kelp, each head a different color of ocean — deep blue, green, black, teal, white — rising from a whirlpool.' },
  ]

  for (const c of r1Cards) {
    roundCards.set(c.id, { ...c, roundId: 'round-1', votes: 0 })
  }

  // Round 2: 6 spells + 6 artifacts
  const r2Cards: Omit<RoundCard, 'roundId' | 'votes'>[] = [
    { id: 'r2c1', name: 'Arcane Detonation', type: 'spell', subtype: 'Sorcery', cost: 4, power: null, toughness: null, abilities: ['Deal 5 damage divided among any number of targets'], flavor: 'The explosion was just the beginning.', rarity: 'rare', artDescription: 'A massive arcane explosion in a wizard\'s tower, purple and gold energy radiating outward, books and artifacts flying through the air, a shocked wizard shielding their eyes.' },
    { id: 'r2c2', name: 'Chrono Splice', type: 'spell', subtype: 'Instant', cost: 3, power: null, toughness: null, abilities: ['Take an extra turn after this one', 'Exile this card'], flavor: 'Yesterday\'s mistake becomes tomorrow\'s advantage.', rarity: 'legendary', artDescription: 'A mage splitting a clock face in half with their bare hands, time energy spiraling in both directions, one side showing day and the other night.' },
    { id: 'r2c3', name: 'Mana Siphon', type: 'spell', subtype: 'Enchantment', cost: 2, power: null, toughness: null, abilities: ['Whenever opponent casts a spell, gain 1 mana'], flavor: 'Your power feeds my ambition.', rarity: 'uncommon', artDescription: 'Glowing tendrils of energy being pulled from one mage to another through a dark portal, the victim weakening while the caster grows stronger.' },
    { id: 'r2c4', name: 'Reality Fracture', type: 'spell', subtype: 'Sorcery', cost: 5, power: null, toughness: null, abilities: ['Each player shuffles their hand into their deck, then draws 7 cards', 'Exile all tokens'], flavor: 'When the world breaks, everyone starts over.', rarity: 'rare', artDescription: 'The fabric of reality shattering like glass, multiple dimensions visible through the cracks, two planeswalkers standing on opposite sides of the fracture.' },
    { id: 'r2c5', name: 'Whisper of Doom', type: 'spell', subtype: 'Instant', cost: 1, power: null, toughness: null, abilities: ['Target creature gets -3/-3 until end of turn'], flavor: 'Some words kill quieter than swords.', rarity: 'common', artDescription: 'A shadowy figure whispering into a warrior\'s ear, dark smoke curling from their lips, the warrior\'s armor beginning to crack and corrode.' },
    { id: 'r2c6', name: 'Elemental Convergence', type: 'spell', subtype: 'Sorcery', cost: 6, power: null, toughness: null, abilities: ['Create a 4/4 Fire, Water, Earth, and Air elemental token (4 tokens total)'], flavor: 'Four become one army.', rarity: 'legendary', artDescription: 'Four elemental forces spiraling together in a vortex — fire, water, earth, and wind — each forming into a distinct warrior shape at the center of a ritual circle.' },
    { id: 'r2c7', name: 'Spellweaver\'s Loom', type: 'artifact', subtype: 'Equipment', cost: 3, power: null, toughness: null, abilities: ['Equipped creature gets +1/+1 and "spells you cast cost 1 less"', 'Equip: 2'], flavor: 'Thread by thread, power takes shape.', rarity: 'rare', artDescription: 'An ornate magical loom floating in the air, threads of pure mana being woven into spell patterns, runes glowing along its golden frame.' },
    { id: 'r2c8', name: 'Obsidian Monolith', type: 'artifact', subtype: 'Monument', cost: 4, power: null, toughness: null, abilities: ['Tap: add 2 mana of any one color', 'When tapped, each player loses 1 life'], flavor: 'Power always comes at a price.', rarity: 'uncommon', artDescription: 'A towering black obsidian obelisk in a desert, dark energy pulsing from cracks in its surface, dead vegetation in a circle around its base, storm clouds gathering above.' },
    { id: 'r2c9', name: 'Mirror of Echoes', type: 'artifact', subtype: 'Relic', cost: 2, power: null, toughness: null, abilities: ['When a creature enters under opponent\'s control, create a 1/1 copy token'], flavor: 'Every summon, doubled. Every threat, answered.', rarity: 'rare', artDescription: 'An ornate standing mirror reflecting a distorted version of the battlefield, ghostly copies of creatures stepping out of the mirror surface, silver frame decorated with eyes.' },
    { id: 'r2c10', name: 'Void Compass', type: 'artifact', subtype: 'Tool', cost: 1, power: null, toughness: null, abilities: ['Tap: look at the top 3 cards of your deck. Put 1 in hand and the rest on bottom'], flavor: 'It points toward what you need, not where you want to go.', rarity: 'uncommon', artDescription: 'A compass with a needle made of dark energy, floating above a wizard\'s palm, the compass face showing symbols instead of directions, faint star map visible within.' },
    { id: 'r2c11', name: 'Golem Foundry', type: 'artifact', subtype: 'Forge', cost: 5, power: null, toughness: null, abilities: ['At the start of your turn: create a 2/2 Golem artifact creature token', 'Sacrifice 3 Golems: draw 3 cards'], flavor: 'An army forged one body at a time.', rarity: 'rare', artDescription: 'A massive dwarven forge with conveyor belts carrying incomplete golem bodies, molten metal pouring into molds, finished golems marching out the other end, sparks flying everywhere.' },
    { id: 'r2c12', name: 'Crown of the Archmage', type: 'artifact', subtype: 'Equipment', cost: 6, power: null, toughness: null, abilities: ['Equipped creature gets +3/+3 and has hexproof', 'Spells you cast can\'t be countered', 'Equip: 4'], flavor: 'To wear it is to command reality itself.', rarity: 'legendary', artDescription: 'A floating crown made of crystallized mana, seven gemstones each a different color orbiting it, arcane sigils projected in the air around it, divine light streaming down.' },
  ]

  for (const c of r2Cards) {
    roundCards.set(c.id, { ...c, roundId: 'round-2', votes: 0 })
  }
}

initRounds()

// SSE clients
export const wsClients = new Set<(msg: string) => void>()

export function broadcast(data: unknown): void {
  const msg = JSON.stringify(data)
  for (const send of wsClients) {
    try { send(msg) } catch { /* client disconnected */ }
  }
}

export function addActivity(event: Omit<ActivityEvent, 'id' | 'timestamp'>): ActivityEvent {
  const entry: ActivityEvent = {
    ...event,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
  }
  activity.unshift(entry)
  if (activity.length > 200) activity.length = 200
  broadcast({ type: 'activity', payload: entry })
  return entry
}
