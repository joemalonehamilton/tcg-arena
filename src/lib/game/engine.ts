import {
  GameState, GameCard, GameEvent, GameResult, TurnDecisions,
  cloneState, cloneCard,
} from './types'
import { declareAttackers, declareBlockers, resolveCombat } from './combat'
import { makeDecisions, makeBlockDecisions } from './ai-player'

function log(state: GameState, player: string, action: string, details: string) {
  state.log.push({ turn: state.turn, player, action, details })
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function createGame(deck1: GameCard[], deck2: GameCard[]): GameState {
  const d1 = shuffle(deck1.map(cloneCard))
  const d2 = shuffle(deck2.map(cloneCard))

  // Draw initial hands of 3
  const hand1 = d1.splice(0, 3)
  const hand2 = d2.splice(0, 3)

  return {
    players: [
      { id: 'p1', name: 'Player 1', hp: 20, maxMana: 0, currentMana: 0, deck: d1, hand: hand1, board: [], graveyard: [] },
      { id: 'p2', name: 'Player 2', hp: 20, maxMana: 0, currentMana: 0, deck: d2, hand: hand2, board: [], graveyard: [] },
    ],
    currentPlayerIndex: 0,
    turn: 1,
    phase: 'draw',
    winner: null,
    log: [],
  }
}

export function isGameOver(state: GameState): boolean {
  return state.winner !== null
}

function checkWinner(state: GameState): GameState {
  if (state.players[0].hp <= 0 && state.players[1].hp <= 0) {
    state.winner = state.players[state.currentPlayerIndex === 0 ? 1 : 0].id
  } else if (state.players[0].hp <= 0) {
    state.winner = state.players[1].id
  } else if (state.players[1].hp <= 0) {
    state.winner = state.players[0].id
  }
  return state
}

function drawPhase(state: GameState): GameState {
  const player = state.players[state.currentPlayerIndex]
  if (player.deck.length > 0) {
    const card = player.deck.shift()!
    player.hand.push(card)
    log(state, player.name, 'draw', `${player.name} draws ${card.name}`)
  } else {
    player.hp -= 1
    log(state, player.name, 'fatigue', `${player.name} takes 1 fatigue damage (HP: ${player.hp})`)
    checkWinner(state)
  }
  return state
}

function manaPhase(state: GameState): GameState {
  const player = state.players[state.currentPlayerIndex]
  if (player.maxMana < 10) player.maxMana++
  player.currentMana = player.maxMana
  log(state, player.name, 'mana', `${player.name} has ${player.currentMana} mana`)
  return state
}

function playCards(state: GameState, cardIds: string[]): GameState {
  const player = state.players[state.currentPlayerIndex]

  for (const id of cardIds) {
    const idx = player.hand.findIndex(c => c.id === id)
    if (idx === -1) continue
    const card = player.hand[idx]
    if (card.cost > player.currentMana) continue

    player.currentMana -= card.cost
    player.hand.splice(idx, 1)

    if (card.type === 'spell') {
      player.graveyard.push(card)
      log(state, player.name, 'cast', `${player.name} casts ${card.name} (${card.cost} mana)`)
      // Spell effects: deal damage equal to power to opponent, or heal
      if (card.power && card.power > 0) {
        const opponent = state.players[state.currentPlayerIndex === 0 ? 1 : 0]
        opponent.hp -= card.power
        log(state, player.name, 'spell_damage', `${card.name} deals ${card.power} damage to ${opponent.name} (HP: ${opponent.hp})`)
        checkWinner(state)
      }
      if (card.toughness && card.toughness > 0) {
        player.hp = Math.min(20, player.hp + card.toughness)
        log(state, player.name, 'spell_heal', `${card.name} heals ${player.name} for ${card.toughness} (HP: ${player.hp})`)
      }
    } else {
      card.summoningSick = card.type === 'creature' && !card.abilities.includes('haste')
      player.board.push(card)
      log(state, player.name, 'play', `${player.name} plays ${card.name} (${card.cost} mana)${card.type === 'creature' ? ` [${card.power}/${card.toughness}]` : ''}`)
    }
  }

  return state
}

function endPhase(state: GameState): GameState {
  const player = state.players[state.currentPlayerIndex]
  // Remove summoning sickness
  for (const card of player.board) {
    if (card.summoningSick) card.summoningSick = false
    if (card.tapped && card.type === 'creature') card.tapped = false
  }
  return state
}

export function playTurn(state: GameState, decisions: TurnDecisions): GameState {
  state = cloneState(state)
  const player = state.players[state.currentPlayerIndex]

  // Draw
  state.phase = 'draw'
  state = drawPhase(state)
  if (isGameOver(state)) return state

  // Mana
  state = manaPhase(state)

  // Main phase 1
  state.phase = 'main'
  state = playCards(state, decisions.cardsToPlay)
  if (isGameOver(state)) return state

  // Combat
  if (decisions.attackerIds.length > 0) {
    state.phase = 'combat_declare'
    state = declareAttackers(state, decisions.attackerIds)

    // Defender decides blocks
    const defId = state.players[state.currentPlayerIndex === 0 ? 1 : 0].id
    const blocks = makeBlockDecisions(state, defId, decisions.attackerIds)

    state = declareBlockers(state, blocks)
    state = resolveCombat(state, decisions.attackerIds, blocks)
    checkWinner(state)
    if (isGameOver(state)) return state
  }

  // Main phase 2
  state.phase = 'main2'
  state = playCards(state, decisions.cardsToPlayPhase2)
  if (isGameOver(state)) return state

  // End
  state.phase = 'end'
  state = endPhase(state)

  // Switch player
  state.currentPlayerIndex = state.currentPlayerIndex === 0 ? 1 : 0
  if (state.currentPlayerIndex === 0) state.turn++

  return state
}

export function runFullGame(deck1: GameCard[], deck2: GameCard[]): GameResult {
  let state = createGame(deck1, deck2)
  const MAX_TURNS = 50

  while (!isGameOver(state) && state.turn <= MAX_TURNS) {
    const player = state.players[state.currentPlayerIndex]
    const decisions = makeDecisions(state, player.id)
    state = playTurn(state, decisions)
  }

  if (!state.winner) {
    // Tie-break: lower HP loses
    state.winner = state.players[0].hp >= state.players[1].hp ? 'p1' : 'p2'
  }

  const winner = state.players.find(p => p.id === state.winner)!
  const loser = state.players.find(p => p.id !== state.winner)!

  return {
    winner: winner.name,
    loser: loser.name,
    turns: state.turn,
    log: state.log,
    finalState: state,
  }
}
