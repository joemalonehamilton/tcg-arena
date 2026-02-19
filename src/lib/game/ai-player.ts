import { GameState, GameCard, TurnDecisions, BlockAssignment, Keyword } from './types'

function hasAbility(card: GameCard, ability: Keyword): boolean {
  return card.abilities.includes(ability)
}

function getPower(card: GameCard): number {
  return card.currentPower ?? card.power ?? 0
}

function getToughness(card: GameCard): number {
  return card.currentToughness ?? card.toughness ?? 0
}

function canAttack(card: GameCard): boolean {
  return card.type === 'creature' && !card.tapped && !card.summoningSick && !hasAbility(card, 'defender')
}

export function makeDecisions(state: GameState, playerId: string): TurnDecisions {
  const playerIdx = state.players.findIndex(p => p.id === playerId)
  const player = state.players[playerIdx]
  const opponent = state.players[playerIdx === 0 ? 1 : 0]

  // Main phase: play cards, prioritize highest cost first (greedy)
  const cardsToPlay = pickCardsToPlay(player.hand, player.currentMana)

  // Simulate mana after playing
  let manaLeft = player.currentMana
  for (const id of cardsToPlay) {
    const card = player.hand.find(c => c.id === id)
    if (card) manaLeft -= card.cost
  }

  // Combat: pick attackers
  const attackerIds = pickAttackers(player, opponent)

  // Phase 2: play remaining affordable cards
  const playedIds = new Set(cardsToPlay)
  const remainingHand = player.hand.filter(c => !playedIds.has(c.id))
  const cardsToPlayPhase2 = pickCardsToPlay(remainingHand, manaLeft)

  return {
    cardsToPlay,
    attackerIds,
    blocks: [], // blocks are decided when defending
    cardsToPlayPhase2,
  }
}

export function makeBlockDecisions(state: GameState, defenderId: string, attackerIds: string[]): BlockAssignment[] {
  const defIdx = state.players.findIndex(p => p.id === defenderId)
  const defender = state.players[defIdx]
  const attacker = state.players[defIdx === 0 ? 1 : 0]

  const availableBlockers = defender.board.filter(
    c => c.type === 'creature' && !c.tapped
  )

  const attackingCards = attackerIds
    .map(id => attacker.board.find(c => c.id === id))
    .filter((c): c is GameCard => c != null)
    .sort((a, b) => getPower(b) - getPower(a)) // block biggest threats first

  const blocks: BlockAssignment[] = []
  const usedBlockers = new Set<string>()

  for (const atk of attackingCards) {
    // Skip if flying and we have no flyers/reach
    const validBlockers = availableBlockers.filter(b => {
      if (usedBlockers.has(b.id)) return false
      if (hasAbility(atk, 'flying') && !hasAbility(b, 'flying') && !hasAbility(b, 'reach')) return false
      return true
    })

    if (validBlockers.length === 0) continue

    // Block if the attacker would deal significant damage
    if (getPower(atk) >= 3 || defender.hp <= getPower(atk) + 3) {
      // Find a blocker that can survive or trade favorably
      const goodBlocker = validBlockers.find(b => getToughness(b) > getPower(atk))
        || validBlockers.find(b => getPower(b) >= getToughness(atk)) // can trade
        || (getPower(atk) >= 4 ? validBlockers[0] : null) // chump block big threats

      if (goodBlocker) {
        // Handle menace: need 2 blockers
        if (hasAbility(atk, 'menace')) {
          const others = validBlockers.filter(b => b.id !== goodBlocker.id && !usedBlockers.has(b.id))
          if (others.length > 0) {
            blocks.push({ blockerId: goodBlocker.id, attackerId: atk.id })
            blocks.push({ blockerId: others[0].id, attackerId: atk.id })
            usedBlockers.add(goodBlocker.id)
            usedBlockers.add(others[0].id)
          }
        } else {
          blocks.push({ blockerId: goodBlocker.id, attackerId: atk.id })
          usedBlockers.add(goodBlocker.id)
        }
      }
    }
  }

  return blocks
}

function pickCardsToPlay(hand: GameCard[], mana: number): string[] {
  // Sort by cost descending — play expensive cards first
  const playable = hand
    .filter(c => c.cost <= mana)
    .sort((a, b) => {
      // Prefer creatures, then by cost descending
      if (a.type === 'creature' && b.type !== 'creature') return -1
      if (b.type === 'creature' && a.type !== 'creature') return 1
      return b.cost - a.cost
    })

  const result: string[] = []
  let remaining = mana

  for (const card of playable) {
    if (card.cost <= remaining) {
      result.push(card.id)
      remaining -= card.cost
      // Add small randomness: 15% chance to stop playing early
      if (Math.random() < 0.15 && result.length >= 2) break
    }
  }

  return result
}

function pickAttackers(player: { board: GameCard[] }, opponent: { board: GameCard[]; hp: number }): string[] {
  const candidates = player.board.filter(canAttack)
  const opponentBlockers = opponent.board.filter(c => c.type === 'creature' && !c.tapped)
  const weakestBlockerToughness = opponentBlockers.length > 0
    ? Math.min(...opponentBlockers.map(getToughness))
    : Infinity

  const attackers: string[] = []

  for (const c of candidates) {
    const power = getPower(c)
    const toughness = getToughness(c)

    // Always attack if opponent has no blockers
    if (opponentBlockers.length === 0) {
      attackers.push(c.id)
      continue
    }

    // Attack if flying and opponent has no flyers/reach
    if (hasAbility(c, 'flying')) {
      const canBeBlocked = opponentBlockers.some(b => hasAbility(b, 'flying') || hasAbility(b, 'reach'))
      if (!canBeBlocked) {
        attackers.push(c.id)
        continue
      }
    }

    // Attack if power is high enough to be worth the risk
    if (power >= weakestBlockerToughness || power >= 3) {
      // Don't attack with low toughness creatures into bigger blockers (unless we have trample)
      const wouldDie = opponentBlockers.some(b => getPower(b) >= toughness)
      if (!wouldDie || hasAbility(c, 'trample') || power >= 4) {
        attackers.push(c.id)
        continue
      }
    }

    // If opponent is low HP, go all in
    if (opponent.hp <= 8) {
      attackers.push(c.id)
      continue
    }

    // 20% random aggression
    if (Math.random() < 0.2) {
      attackers.push(c.id)
    }
  }

  return attackers
}
