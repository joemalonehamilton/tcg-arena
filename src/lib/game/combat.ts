import { GameState, GameCard, BlockAssignment, cloneState } from './types'

function hasAbility(card: GameCard, ability: string): boolean {
  return card.abilities.includes(ability as any)
}

function getPower(card: GameCard): number {
  return card.currentPower ?? card.power ?? 0
}

function getToughness(card: GameCard): number {
  return card.currentToughness ?? card.toughness ?? 0
}

function log(state: GameState, player: string, action: string, details: string) {
  state.log.push({ turn: state.turn, player, action, details })
}

export function declareAttackers(state: GameState, attackerIds: string[]): GameState {
  state = cloneState(state)
  const player = state.players[state.currentPlayerIndex]

  for (const id of attackerIds) {
    const card = player.board.find(c => c.id === id)
    if (!card) continue
    if (card.type !== 'creature') continue
    if (card.tapped) continue
    if (card.summoningSick) continue
    if (hasAbility(card, 'defender')) continue
    card.tapped = true
    log(state, player.name, 'attack', `${player.name} attacks with ${card.name} (${getPower(card)}/${getToughness(card)})`)
  }

  state.phase = 'combat_block'
  return state
}

export function declareBlockers(state: GameState, blocks: BlockAssignment[]): GameState {
  state = cloneState(state)
  const defender = state.players[state.currentPlayerIndex === 0 ? 1 : 0]
  const attacker = state.players[state.currentPlayerIndex]

  // Validate blocks
  for (const block of blocks) {
    const blocker = defender.board.find(c => c.id === block.blockerId)
    const attackerCard = attacker.board.find(c => c.id === block.attackerId)
    if (!blocker || !attackerCard) continue
    if (blocker.type !== 'creature') continue
    if (blocker.tapped) continue

    // Flying check
    if (hasAbility(attackerCard, 'flying') && !hasAbility(blocker, 'flying') && !hasAbility(blocker, 'reach')) {
      continue
    }

    log(state, defender.name, 'block', `${defender.name} blocks ${attackerCard.name} with ${blocker.name}`)
  }

  state.phase = 'combat_resolve'
  return state
}

export function resolveCombat(
  state: GameState,
  attackerIds: string[],
  blocks: BlockAssignment[]
): GameState {
  state = cloneState(state)
  const atkPlayer = state.players[state.currentPlayerIndex]
  const defPlayer = state.players[state.currentPlayerIndex === 0 ? 1 : 0]

  // Build block map: attackerId -> blockerIds
  const blockMap = new Map<string, string[]>()
  for (const b of blocks) {
    // Validate blocker exists and is valid
    const blocker = defPlayer.board.find(c => c.id === b.blockerId && c.type === 'creature' && !c.tapped)
    const attackerCard = atkPlayer.board.find(c => c.id === b.attackerId)
    if (!blocker || !attackerCard) continue
    if (hasAbility(attackerCard, 'flying') && !hasAbility(blocker, 'flying') && !hasAbility(blocker, 'reach')) continue

    const existing = blockMap.get(b.attackerId) || []
    existing.push(b.blockerId)
    blockMap.set(b.attackerId, existing)
  }

  // Validate menace
  for (const [atkId, blockerIds] of blockMap.entries()) {
    const atk = atkPlayer.board.find(c => c.id === atkId)
    if (atk && hasAbility(atk, 'menace') && blockerIds.length < 2) {
      blockMap.delete(atkId) // not enough blockers, attack goes through
    }
  }

  const deadAttackers: string[] = []
  const deadBlockers: string[] = []

  // First strike phase
  for (const atkId of attackerIds) {
    const atk = atkPlayer.board.find(c => c.id === atkId)
    if (!atk || !hasAbility(atk, 'first_strike')) continue

    const blockerIds = blockMap.get(atkId)
    if (!blockerIds || blockerIds.length === 0) continue

    let remainingPower = getPower(atk)
    for (const bId of blockerIds) {
      if (remainingPower <= 0) break
      const blocker = defPlayer.board.find(c => c.id === bId)
      if (!blocker) continue
      const dmg = Math.min(remainingPower, getToughness(blocker))
      remainingPower -= dmg
      const newTough = getToughness(blocker) - getPower(atk)
      if (newTough <= 0) {
        deadBlockers.push(bId)
        log(state, atkPlayer.name, 'kill', `${atk.name} (first strike) kills ${blocker.name}`)
      } else {
        blocker.currentToughness = newTough
      }
    }

    // Trample with first strike
    if (hasAbility(atk, 'trample') && remainingPower > 0 && blockerIds.length > 0) {
      defPlayer.hp -= remainingPower
      log(state, atkPlayer.name, 'trample', `${atk.name} tramples for ${remainingPower} damage`)
    }
  }

  // Remove dead blockers from blocking before normal damage
  for (const [atkId, blockerIds] of blockMap.entries()) {
    blockMap.set(atkId, blockerIds.filter(id => !deadBlockers.includes(id)))
  }

  // Normal combat damage
  for (const atkId of attackerIds) {
    const atk = atkPlayer.board.find(c => c.id === atkId)
    if (!atk || deadAttackers.includes(atkId)) continue

    const blockerIds = blockMap.get(atkId)

    if (!blockerIds || blockerIds.length === 0) {
      // Unblocked — damage to player
      defPlayer.hp -= getPower(atk)
      log(state, atkPlayer.name, 'damage', `${atk.name} deals ${getPower(atk)} damage to ${defPlayer.name} (HP: ${defPlayer.hp})`)
      continue
    }

    // Deal damage to blockers (skip if first_strike already handled attack)
    if (!hasAbility(atk, 'first_strike')) {
      let remainingPower = getPower(atk)
      for (const bId of blockerIds) {
        const blocker = defPlayer.board.find(c => c.id === bId)
        if (!blocker) continue
        const bTough = getToughness(blocker)
        if (remainingPower >= bTough) {
          deadBlockers.push(bId)
          remainingPower -= bTough
          log(state, atkPlayer.name, 'kill', `${atk.name} kills ${blocker.name}`)
        } else {
          blocker.currentToughness = bTough - remainingPower
          remainingPower = 0
        }
      }

      if (hasAbility(atk, 'trample') && remainingPower > 0) {
        defPlayer.hp -= remainingPower
        log(state, atkPlayer.name, 'trample', `${atk.name} tramples for ${remainingPower} damage to ${defPlayer.name}`)
      }
    }

    // Blockers deal damage back to attacker
    let totalBlockerDmg = 0
    for (const bId of blockerIds) {
      if (deadBlockers.includes(bId)) continue
      const blocker = defPlayer.board.find(c => c.id === bId)
      if (!blocker) continue
      totalBlockerDmg += getPower(blocker)
    }
    if (totalBlockerDmg >= getToughness(atk)) {
      deadAttackers.push(atkId)
      const survivingBlocker = blockerIds.find(id => !deadBlockers.includes(id))
      const blockerName = survivingBlocker ? defPlayer.board.find(c => c.id === survivingBlocker)?.name : 'blockers'
      log(state, defPlayer.name, 'kill', `${blockerName} kills ${atk.name}`)
    } else if (totalBlockerDmg > 0) {
      atk.currentToughness = getToughness(atk) - totalBlockerDmg
    }
  }

  // Move dead creatures to graveyards
  for (const id of deadAttackers) {
    const idx = atkPlayer.board.findIndex(c => c.id === id)
    if (idx >= 0) {
      const [card] = atkPlayer.board.splice(idx, 1)
      atkPlayer.graveyard.push(card)
    }
  }
  for (const id of [...new Set(deadBlockers)]) {
    const idx = defPlayer.board.findIndex(c => c.id === id)
    if (idx >= 0) {
      const [card] = defPlayer.board.splice(idx, 1)
      defPlayer.graveyard.push(card)
    }
  }

  state.phase = 'main2'
  return state
}
