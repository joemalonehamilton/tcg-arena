// TCG Arena - Game Types

export interface GameCard {
  id: string
  name: string
  type: 'creature' | 'spell' | 'artifact' | 'terrain'
  cost: number
  power: number | null
  toughness: number | null
  abilities: Keyword[]
  currentPower?: number
  currentToughness?: number
  tapped: boolean
  summoningSick: boolean
}

export interface Player {
  id: string
  name: string
  hp: number
  maxMana: number
  currentMana: number
  deck: GameCard[]
  hand: GameCard[]
  board: GameCard[]
  graveyard: GameCard[]
}

export interface GameState {
  players: [Player, Player]
  currentPlayerIndex: 0 | 1
  turn: number
  phase: Phase
  winner: string | null
  log: GameEvent[]
}

export type Phase = 'draw' | 'main' | 'combat_declare' | 'combat_block' | 'combat_resolve' | 'main2' | 'end'

export interface GameEvent {
  turn: number
  player: string
  action: string
  details: string
}

export type Keyword = 'flying' | 'haste' | 'defender' | 'trample' | 'first_strike' | 'menace' | 'reach'

export interface TurnDecisions {
  cardsToPlay: string[]        // card ids to play in main phase
  attackerIds: string[]        // creature ids to attack with
  blocks: BlockAssignment[]    // how to block
  cardsToPlayPhase2: string[]  // cards to play in main phase 2
}

export interface BlockAssignment {
  blockerId: string
  attackerId: string
}

export interface GameResult {
  winner: string
  loser: string
  turns: number
  log: GameEvent[]
  finalState: GameState
}

export interface MatchResult {
  deck1Wins: number
  deck2Wins: number
  games: GameResult[]
  avgTurns: number
}

export interface TournamentResult {
  rankings: { cardName: string; wins: number; losses: number; winRate: number }[]
  mvpCards: { name: string; kills: number; damageDealt: number }[]
  matchResults: { deck1Name: string; deck2Name: string; result: MatchResult }[]
}

export function cloneCard(card: GameCard): GameCard {
  return { ...card, abilities: [...card.abilities] }
}

export function clonePlayer(player: Player): Player {
  return {
    ...player,
    deck: player.deck.map(cloneCard),
    hand: player.hand.map(cloneCard),
    board: player.board.map(cloneCard),
    graveyard: player.graveyard.map(cloneCard),
  }
}

export function cloneState(state: GameState): GameState {
  return {
    ...state,
    players: [clonePlayer(state.players[0]), clonePlayer(state.players[1])],
    log: [...state.log],
  }
}

export function makeCard(partial: {
  name: string
  type: GameCard['type']
  cost: number
  power?: number | null
  toughness?: number | null
  abilities?: Keyword[]
}): GameCard {
  return {
    id: crypto.randomUUID(),
    name: partial.name,
    type: partial.type,
    cost: partial.cost,
    power: partial.power ?? null,
    toughness: partial.toughness ?? null,
    abilities: partial.abilities ?? [],
    tapped: false,
    summoningSick: false,
  }
}
