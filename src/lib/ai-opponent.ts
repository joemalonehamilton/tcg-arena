/**
 * AI Opponent v2 — Handles blocking, Stake, Mempool
 */

import { GameEngine, Action, CardInstance } from './game-engine'

export type Difficulty = 'rookie' | 'veteran' | 'degen'

function cardValue(c: CardInstance): number {
  return c.currentPower + c.currentToughness + c.abilities.length * 2
}

function threatValue(c: CardInstance): number {
  let v = c.currentPower * 2 + c.currentToughness
  if (c.abilities.includes('MEV Extract')) v += 5 // grows every turn
  if (c.abilities.includes('Flash Finality')) v += 4
  if (c.abilities.includes('Rug Pull')) v += 3
  if (c.abilities.includes('51% Attack')) v += 3
  if (c.abilities.includes('Revert')) v += 2
  return v
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

/** Rookie: random valid actions */
function rookieDecide(engine: GameEngine): Action {
  const actions = engine.getValidActions()
  if (actions.length === 0) return { type: 'endPhase' }
  
  // Even rookie should confirm blocks
  if (engine.state.phase === 'block') {
    // 50% chance to block with each creature
    const blockActions = actions.filter(a => a.type === 'assignBlock')
    if (blockActions.length > 0 && Math.random() > 0.5) {
      return pickRandom(blockActions)
    }
    return { type: 'confirmBlocks' }
  }
  
  return pickRandom(actions)
}

/** Veteran: priority-based with blocking logic */
function veteranDecide(engine: GameEngine): Action {
  const state = engine.state
  const ap = state.activePlayer
  const p = state.players[ap]
  const opp = state.players[ap === 0 ? 1 : 0]
  const actions = engine.getValidActions()
  if (actions.length <= 1) return actions[0] || { type: 'endPhase' }

  // ─── BLOCKING PHASE ───
  if (state.phase === 'block') {
    const blockActions = actions.filter(a => a.type === 'assignBlock')
    
    if (blockActions.length > 0) {
      // Block the most threatening attacker with the smallest viable blocker
      const dpIdx = engine['opponent'](ap) // defender's index
      const dBoard = state.players[dpIdx].board
      const aBoard = state.players[ap].board
      
      for (const ba of blockActions) {
        const blocker = dBoard[ba.blockerIndex!]
        const atkPendingIdx = ba.attackerIndex!
        const atkBoardIdx = state.pendingAttacks[atkPendingIdx]?.attackerIdx
        const attacker = aBoard[atkBoardIdx]
        
        if (!blocker || !attacker) continue
        
        // Block if: blocker survives and kills attacker, OR attacker would kill us
        const blockerSurvives = blocker.currentToughness > attacker.currentPower
        const attackerDies = attacker.currentToughness <= blocker.currentPower
        const attackerIsDangerous = attacker.currentPower >= 3
        
        if (blockerSurvives || (attackerDies && attackerIsDangerous)) {
          return ba
        }
        
        // Block with small creatures to save HP if attacker is big
        if (attacker.currentPower >= 4 && blocker.currentPower <= 2) {
          return ba
        }
      }
    }
    
    return { type: 'confirmBlocks' }
  }

  if (state.phase === 'main') {
    // Priority 1: Liquidate most dangerous enemy
    const liquidates = actions.filter(a => a.abilityName === 'Liquidate')
    if (liquidates.length > 0) {
      const best = liquidates.sort((a, b) => threatValue(opp.board[b.targetIndex!]) - threatValue(opp.board[a.targetIndex!]))[0]
      return best
    }

    // Priority 2: Mempool the most dangerous enemy ability user
    const mempools = actions.filter(a => a.abilityName === 'Mempool')
    if (mempools.length > 0) {
      const target = mempools.sort((a, b) => threatValue(opp.board[b.targetIndex!]) - threatValue(opp.board[a.targetIndex!]))[0]
      return target
    }

    // Priority 3: Consensus if 2+ creatures
    if (p.board.length >= 2) {
      const consensus = actions.find(a => a.abilityName === 'Consensus')
      if (consensus) return consensus
    }

    // Priority 4: Play highest value card
    const plays = actions.filter(a => a.type === 'playCard')
    if (plays.length > 0) {
      const sorted = plays.sort((a, b) => {
        const ca = p.hand[a.handIndex!]
        const cb = p.hand[b.handIndex!]
        const effA = cardValue(ca) + (engine.getEffectiveCost(ap, ca) / Math.max(1, p.mana)) * 3
        const effB = cardValue(cb) + (engine.getEffectiveCost(ap, cb) / Math.max(1, p.mana)) * 3
        return effB - effA
      })
      return sorted[0]
    }

    // Priority 5: Stake if board is stable (no immediate threat)
    if (opp.board.length <= p.board.length) {
      const stakes = actions.filter(a => a.abilityName === 'Stake')
      if (stakes.length > 0) return stakes[0]
    }

    // Priority 6: Fork best creature
    const forks = actions.filter(a => a.abilityName === 'Fork')
    if (forks.length > 0) {
      const best = forks.sort((a, b) => cardValue(p.board[b.creatureIndex!]) - cardValue(p.board[a.creatureIndex!]))[0]
      return best
    }

    return { type: 'endPhase' }
  }

  if (state.phase === 'attack') {
    const attacks = actions.filter(a => a.type === 'attack')
    if (attacks.length === 0) return { type: 'endPhase' }

    // 51% bonus: go face
    const has51 = p.board.some(c => c.abilities.includes('51% Attack'))
    if (has51 && p.board.length > opp.board.length) {
      const faceAttacks = attacks.filter(a => a.targetIndex === undefined)
      if (faceAttacks.length > 0) return faceAttacks[0]
    }

    // Favorable trades: kill their creature without losing ours
    for (const atk of attacks) {
      if (atk.targetIndex !== undefined) {
        const attacker = p.board[atk.creatureIndex!]
        const defender = opp.board[atk.targetIndex]
        if (defender && attacker.currentPower >= defender.currentToughness && attacker.currentToughness > defender.currentPower) {
          return atk
        }
      }
    }

    // Go face with big creatures
    const faceAttacks = attacks.filter(a => {
      if (a.targetIndex !== undefined) return false
      const c = p.board[a.creatureIndex!]
      return c && c.currentPower >= 2
    })
    if (faceAttacks.length > 0) return faceAttacks[0]

    // If no blockers, attack with everything
    if (opp.board.filter(c => !c.tapped).length === 0) {
      const face = attacks.find(a => a.targetIndex === undefined)
      if (face) return face
    }

    return { type: 'endPhase' }
  }

  return { type: 'endPhase' }
}

/** Degen: veteran + smarter blocking + better sequencing */
function degenDecide(engine: GameEngine): Action {
  const state = engine.state
  const actions = engine.getValidActions()
  if (actions.length <= 1) return actions[0] || { type: 'endPhase' }

  // For blocking, always make optimal blocks
  if (state.phase === 'block') {
    return veteranDecide(engine) // veteran blocking is already good
  }

  if (state.phase === 'attack') return veteranDecide(engine)

  // Main phase: maximize board value
  const ap = state.activePlayer
  const p = state.players[ap]
  const opp = state.players[ap === 0 ? 1 : 0]
  const abilities = actions.filter(a => a.type === 'useAbility')
  const plays = actions.filter(a => a.type === 'playCard')

  // Liquidate biggest threat first
  const liquidates = abilities.filter(a => a.abilityName === 'Liquidate')
  if (liquidates.length > 0) {
    const sorted = liquidates.sort((a, b) => threatValue(opp.board[b.targetIndex!]) - threatValue(opp.board[a.targetIndex!]))
    return sorted[0]
  }

  // Mempool their strongest ability user
  const mempools = abilities.filter(a => a.abilityName === 'Mempool')
  if (mempools.length > 0) {
    const target = mempools.sort((a, b) => threatValue(opp.board[b.targetIndex!]) - threatValue(opp.board[a.targetIndex!]))[0]
    if (target && threatValue(opp.board[target.targetIndex!]) > 6) return target
  }

  // Play cards: maximize mana efficiency
  if (plays.length > 0) {
    let bestAction = plays[0]
    let bestVal = 0
    for (const play of plays) {
      const card = p.hand[play.handIndex!]
      const cost = engine.getEffectiveCost(ap, card)
      const val = cardValue(card) + cost * 1.5
      if (val > bestVal && cost <= p.mana) {
        bestVal = val
        bestAction = play
      }
    }
    return bestAction
  }

  // Consensus if 3+ creatures
  if (p.board.length >= 3) {
    const consensus = abilities.find(a => a.abilityName === 'Consensus')
    if (consensus) return consensus
  }

  // Stake if safe
  if (opp.board.length < p.board.length) {
    const stakes = abilities.filter(a => a.abilityName === 'Stake')
    if (stakes.length > 0) return stakes[0]
  }

  // Fork strongest
  const fork = abilities.find(a => a.abilityName === 'Fork')
  if (fork) return fork

  return veteranDecide(engine)
}

export function aiDecide(engine: GameEngine, difficulty: Difficulty = 'veteran'): Action {
  switch (difficulty) {
    case 'rookie': return rookieDecide(engine)
    case 'veteran': return veteranDecide(engine)
    case 'degen': return degenDecide(engine)
  }
}

/** AI assigns blocks (called when it's the AI's turn to block) */
export function aiAssignBlocks(engine: GameEngine, difficulty: Difficulty): void {
  let safety = 0
  while (engine.state.waitingForBlocks && !engine.state.gameOver && safety++ < 15) {
    const action = aiDecide(engine, difficulty)
    if (action.type === 'assignBlock') {
      engine.assignBlock(action.blockerIndex!, action.attackerIndex!)
    } else if (action.type === 'confirmBlocks') {
      engine.advancePhase() // confirmBlocks + endTurn
      break
    } else {
      break
    }
  }
}

/** Run full AI turn */
export function aiPlayTurn(engine: GameEngine, difficulty: Difficulty = 'veteran'): Action[] {
  const actions: Action[] = []
  let safety = 0

  // Main phase
  while (engine.state.phase === 'main' && !engine.state.gameOver && safety++ < 25) {
    const action = aiDecide(engine, difficulty)
    actions.push(action)

    if (action.type === 'endPhase') {
      engine.advancePhase()
      break
    }
    if (action.type === 'playCard') {
      engine.playCard(engine.state.activePlayer, action.handIndex!)
    } else if (action.type === 'useAbility') {
      engine.useAbility(action.creatureIndex!, action.targetIndex)
    }
  }

  // Attack phase
  safety = 0
  while (engine.state.phase === 'attack' && !engine.state.gameOver && safety++ < 20) {
    const action = aiDecide(engine, difficulty)
    actions.push(action)

    if (action.type === 'endPhase') {
      engine.advancePhase()
      break
    }
    if (action.type === 'attack') {
      engine.declareAttack(action.creatureIndex!, action.targetIndex)
    }
  }

  // If we triggered blocking, AI needs to handle it in the play page
  // (blocking is handled separately via aiAssignBlocks)

  return actions
}

export function aiShouldMulligan(hand: CardInstance[]): boolean {
  return !hand.some(c => c.cost <= 3)
}
