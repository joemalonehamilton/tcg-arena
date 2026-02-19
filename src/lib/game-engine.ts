/**
 * TCG Arena Game Engine v2 — Deep strategy card game
 * 
 * Core loop: Draw → Main (play cards, use abilities) → Attack (declare attackers) → Block (opponent assigns blockers) → Resolve → End
 * 
 * Key design pillars:
 * - Simple rules, deep decisions
 * - Strong interaction (blocking, instant abilities)
 * - Meaningful resource system (mana ramp, ability costs)
 * - Healthy variance (draw RNG, but skill wins long-term)
 */

import { getActiveSynergies } from './synergies'

export interface CardInstance {
  id: string
  name: string
  cost: number
  power: number
  toughness: number
  currentPower: number
  currentToughness: number
  abilities: string[]
  rarity: string
  canAttack: boolean
  hasAttacked: boolean
  tapped: boolean
  usedAbility?: boolean
  revertUsed?: boolean
  consensusBonus?: number
  stakeCounters?: number
  mempoolDelay?: number // turns until abilities activate
  shieldTurns?: number  // Diamond Hands shield charges
}

export interface PlayerState {
  hp: number
  mana: number
  maxMana: number
  hand: CardInstance[]
  deck: CardInstance[]
  board: CardInstance[]
  graveyard: CardInstance[]
}

export interface GameState {
  players: [PlayerState, PlayerState]
  turn: number
  activePlayer: number
  phase: 'draw' | 'main' | 'attack' | 'block' | 'resolve' | 'end'
  log: string[]
  gameOver: boolean
  winner: number | null
  pendingAttacks: { attackerIdx: number; targetIdx?: number }[] // targetIdx = creature or undefined = face
  pendingBlocks: { blockerIdx: number; attackerIdx: number }[]  // defender's assignments
  waitingForBlocks: boolean
}

export interface CombatResult {
  attackerIdx: number
  defenderIdx?: number
  attackerDied: boolean
  defenderDied: boolean
  damageToPlayer: number
}

export type ActionType = 'playCard' | 'attack' | 'useAbility' | 'endPhase' | 'assignBlock' | 'confirmBlocks'
export interface Action {
  type: ActionType
  handIndex?: number
  creatureIndex?: number
  targetIndex?: number
  abilityName?: string
  blockerIndex?: number
  attackerIndex?: number
}

let _idCounter = 0
function uid(): string {
  return `card_${++_idCounter}_${Math.random().toString(36).slice(2, 6)}`
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function makeCardInstance(c: { name: string; cost: number; power: number; toughness: number; abilities: string[]; rarity: string }): CardInstance {
  return {
    id: uid(),
    name: c.name,
    cost: c.cost,
    power: c.power,
    toughness: c.toughness,
    currentPower: c.power,
    currentToughness: c.toughness,
    abilities: [...c.abilities],
    rarity: c.rarity,
    canAttack: false,
    hasAttacked: false,
    tapped: false,
    usedAbility: false,
    revertUsed: false,
    stakeCounters: 0,
    mempoolDelay: 0,
    shieldTurns: 0,
  }
}

export class GameEngine {
  state: GameState

  constructor(deck1: CardInstance[], deck2: CardInstance[]) {
    const d1 = shuffle(deck1)
    const d2 = shuffle(deck2)

    const makePlayer = (deck: CardInstance[]): PlayerState => {
      const hand = deck.splice(0, 4)
      return { hp: 20, mana: 1, maxMana: 1, hand, deck, board: [], graveyard: [] }
    }

    this.state = {
      players: [makePlayer(d1), makePlayer(d2)],
      turn: 1,
      activePlayer: 0,
      phase: 'draw',
      log: ['⚔️ Game started!'],
      gameOver: false,
      winner: null,
      pendingAttacks: [],
      pendingBlocks: [],
      waitingForBlocks: false,
    }
    this.drawCard(0)
    this.state.phase = 'main'
  }

  private log(msg: string) {
    this.state.log.push(msg)
  }

  private opponent(p: number): number {
    return p === 0 ? 1 : 0
  }

  drawCard(player: number): void {
    const p = this.state.players[player]
    if (p.deck.length === 0) {
      p.hp -= 2  // Fatigue ramps — makes long games dangerous
      this.log(`💀 Player ${player + 1} has no cards! Takes 2 fatigue damage.`)
      this.checkGameOver()
      return
    }
    const card = p.deck.shift()!
    if (p.hand.length >= 8) {
      // Hand size limit — forces you to play cards
      this.log(`🔥 Player ${player + 1} burned ${card.name} (hand full)!`)
      p.graveyard.push(card)
      return
    }
    p.hand.push(card)
    this.log(`📥 Player ${player + 1} drew ${card.name}`)
  }

  getEffectiveCost(player: number, card: CardInstance): number {
    const p = this.state.players[player]
    let cost = card.cost
    // Gas Optimization: -1 cost per creature you control (min 1)
    if (card.abilities.includes('Gas Optimization')) {
      cost = Math.max(1, cost - p.board.length)
    }
    return cost
  }

  playCard(player: number, handIndex: number): boolean {
    if (this.state.phase !== 'main') return false
    if (player !== this.state.activePlayer) return false
    const p = this.state.players[player]
    if (handIndex < 0 || handIndex >= p.hand.length) return false
    if (p.board.length >= 5) return false

    const card = p.hand[handIndex]
    const cost = this.getEffectiveCost(player, card)
    if (p.mana < cost) return false

    p.mana -= cost
    p.hand.splice(handIndex, 1)
    card.canAttack = false
    card.hasAttacked = false
    card.usedAbility = false
    card.stakeCounters = 0
    card.mempoolDelay = 0
    p.board.push(card)
    this.log(`🃏 Player ${player + 1} played ${card.name} (${cost} mana)`)

    this.triggerOnPlay(player, card)
    this.checkGameOver()
    return true
  }

  private triggerOnPlay(player: number, card: CardInstance): void {
    const opp = this.opponent(player)
    const oppBoard = this.state.players[opp].board

    // Airdrop: draw 2 cards
    if (card.abilities.includes('Airdrop')) {
      this.drawCard(player)
      this.drawCard(player)
      this.log(`🪂 ${card.name}: Airdrop — drew 2 cards!`)
    }

    // Sandwich Attack: steal 2 power from a random enemy
    if (card.abilities.includes('Sandwich Attack') && oppBoard.length > 0) {
      const targetIdx = Math.floor(Math.random() * oppBoard.length)
      const victim = oppBoard[targetIdx]
      const stolen = Math.min(2, victim.currentPower)
      victim.currentPower = Math.max(0, victim.currentPower - stolen)
      card.currentPower += stolen
      this.log(`🥪 ${card.name}: Sandwich Attack — stole ${stolen} power from ${victim.name}!`)
    }

    // Block Reward: all your other Block Reward creatures heal 1
    for (const c of this.state.players[player].board) {
      if (c.id !== card.id && c.abilities.includes('Block Reward')) {
        this.state.players[player].hp += 1
        this.log(`🏆 ${c.name}: Block Reward — you gain 1 life!`)
      }
    }

    // Bridge: this creature can attack immediately (no summoning sickness)
    if (card.abilities.includes('Bridge')) {
      card.canAttack = true
      this.log(`🌉 ${card.name}: Bridge — ready to attack immediately!`)
    }
  }

  // ─── ATTACK PHASE ───

  declareAttack(attackerIndex: number, targetCreatureIndex?: number): void {
    if (this.state.phase !== 'attack') return
    const ap = this.state.activePlayer
    const board = this.state.players[ap].board
    if (attackerIndex < 0 || attackerIndex >= board.length) return
    const attacker = board[attackerIndex]
    if (!attacker.canAttack || attacker.hasAttacked || attacker.tapped) return

    attacker.hasAttacked = true
    this.state.pendingAttacks.push({
      attackerIdx: attackerIndex,
      targetIdx: targetCreatureIndex,
    })

    if (targetCreatureIndex !== undefined) {
      const target = this.state.players[this.opponent(ap)].board[targetCreatureIndex]
      this.log(`⚔️ ${attacker.name} attacks ${target?.name || 'unknown'}!`)
    } else {
      this.log(`⚔️ ${attacker.name} attacks face!`)
    }
  }

  // Assign a blocker (defender phase)
  assignBlock(blockerIndex: number, attackerIndex: number): boolean {
    if (!this.state.waitingForBlocks) return false
    const dp = this.opponent(this.state.activePlayer)
    const dBoard = this.state.players[dp].board
    if (blockerIndex < 0 || blockerIndex >= dBoard.length) return false
    const blocker = dBoard[blockerIndex]
    if (blocker.tapped) return false

    // Can only block face attacks
    const attack = this.state.pendingAttacks[attackerIndex]
    if (!attack || attack.targetIdx !== undefined) return false // already targeting a creature

    // Remove existing block assignment for this blocker
    this.state.pendingBlocks = this.state.pendingBlocks.filter(b => b.blockerIdx !== blockerIndex)
    this.state.pendingBlocks.push({ blockerIdx: blockerIndex, attackerIdx: attackerIndex })

    const attacker = this.state.players[this.state.activePlayer].board[attack.attackerIdx]
    this.log(`🛡️ ${blocker.name} blocks ${attacker?.name || 'attacker'}!`)
    return true
  }

  // Confirm all blocks and resolve combat
  confirmBlocks(): void {
    if (!this.state.waitingForBlocks) return
    this.state.waitingForBlocks = false
    this.state.phase = 'resolve'
    this.resolveAttacks()
  }

  getSynergyBonus(player: number): { power: number; toughness: number; synergies: string[] } {
    const board = this.state.players[player].board
    const names = board.map(c => c.name)
    const abilities = board.map(c => c.abilities)
    const active = getActiveSynergies(names, abilities)
    const power = active.reduce((sum, s) => sum + s.powerBonus, 0)
    const toughness = active.reduce((sum, s) => sum + s.toughnessBonus, 0)
    return { power, toughness, synergies: active.map(s => `${s.icon} ${s.name}`) }
  }

  resolveAttacks(): CombatResult[] {
    const results: CombatResult[] = []
    const ap = this.state.activePlayer
    const dp = this.opponent(ap)
    const aBoard = this.state.players[ap].board
    const dBoard = this.state.players[dp].board

    const synergy = this.getSynergyBonus(ap)
    if (synergy.synergies.length > 0) {
      this.log(`✨ Synergies: ${synergy.synergies.join(', ')}`)
    }

    for (let ai = 0; ai < this.state.pendingAttacks.length; ai++) {
      const atk = this.state.pendingAttacks[ai]
      const attacker = aBoard[atk.attackerIdx]
      if (!attacker) continue

      // Check if this attacker is blocked
      const block = this.state.pendingBlocks.find(b => b.attackerIdx === ai)

      // Flash Finality: if attacking face and unblocked, destroy strongest enemy creature
      if (atk.targetIdx === undefined && !block && attacker.abilities.includes('Flash Finality') && dBoard.length > 0) {
        const target = dBoard
          .filter(c => !c.abilities.includes('Diamond Hands'))
          .sort((a, b) => (b.currentPower + b.currentToughness) - (a.currentPower + a.currentToughness))[0]
        if (target) {
          this.log(`⚡ ${attacker.name}: Flash Finality — destroyed ${target.name}!`)
          this.destroyCreature(dp, dBoard.indexOf(target))
          results.push({ attackerIdx: atk.attackerIdx, attackerDied: false, defenderDied: true, damageToPlayer: 0 })
          continue
        }
      }

      if (atk.targetIdx !== undefined && atk.targetIdx < dBoard.length) {
        // Directed attack at a creature
        const defender = dBoard[atk.targetIdx]
        this.resolveCombat(attacker, defender, ap, dp, atk, results, synergy)
      } else if (block) {
        // Blocked face attack
        const blocker = dBoard[block.blockerIdx]
        if (blocker) {
          this.resolveCombat(attacker, blocker, ap, dp, atk, results, synergy)
        }
      } else {
        // Unblocked face damage
        const dmg = attacker.currentPower + synergy.power
        this.state.players[dp].hp -= dmg
        this.log(`💥 ${attacker.name} deals ${dmg} damage to Player ${dp + 1}!${synergy.power > 0 ? ` (+${synergy.power} synergy)` : ''}`)
        results.push({ attackerIdx: atk.attackerIdx, attackerDied: false, defenderDied: false, damageToPlayer: dmg })
      }
    }

    this.cleanupDead(ap)
    this.cleanupDead(dp)
    this.state.pendingAttacks = []
    this.state.pendingBlocks = []
    this.checkGameOver()
    return results
  }

  private resolveCombat(
    attacker: CardInstance, defender: CardInstance,
    ap: number, dp: number,
    atk: { attackerIdx: number; targetIdx?: number },
    results: CombatResult[],
    synergy: { power: number; toughness: number; synergies: string[] }
  ): void {
    // Slippage: attacker permanently loses 1 power
    if (defender.abilities.includes('Slippage')) {
      attacker.currentPower = Math.max(0, attacker.currentPower - 1)
      attacker.power = Math.max(0, attacker.power - 1)
      this.log(`📉 ${defender.name}: Slippage — ${attacker.name} loses 1 power permanently!`)
    }

    const atkDmg = Math.max(0, attacker.currentPower + synergy.power)
    const defDmg = defender.currentPower
    defender.currentToughness -= atkDmg
    attacker.currentToughness -= defDmg

    const defDied = defender.currentToughness <= 0
    const atkDied = attacker.currentToughness <= 0

    this.log(`⚔️ Combat: ${attacker.name} (${atkDmg} dmg) vs ${defender.name} (${defDmg} dmg)${defDied ? ` — ${defender.name} dies!` : ''}${atkDied ? ` — ${attacker.name} dies!` : ''}`)

    results.push({
      attackerIdx: atk.attackerIdx,
      defenderIdx: atk.targetIdx,
      attackerDied: atkDied,
      defenderDied: defDied,
      damageToPlayer: 0,
    })
  }

  private cleanupDead(player: number): void {
    const board = this.state.players[player].board
    for (let i = board.length - 1; i >= 0; i--) {
      if (board[i].currentToughness <= 0) {
        this.destroyCreature(player, i)
      }
    }
  }

  private destroyCreature(player: number, boardIndex: number): void {
    const board = this.state.players[player].board
    const creature = board[boardIndex]
    if (!creature) return

    // Revert: return to hand instead of dying (one-time)
    if (creature.abilities.includes('Revert') && !creature.revertUsed) {
      creature.revertUsed = true
      creature.currentToughness = creature.toughness
      creature.currentPower = creature.power
      creature.canAttack = false
      creature.hasAttacked = false
      creature.stakeCounters = 0
      board.splice(boardIndex, 1)
      this.state.players[player].hand.push(creature)
      this.log(`↩️ ${creature.name}: Revert — returned to hand instead of dying!`)
      return
    }

    // Rug Pull: on death, deal power damage to all enemies
    if (creature.abilities.includes('Rug Pull') && creature.currentPower > 0) {
      const opp = this.opponent(player)
      const oppBoard = this.state.players[opp].board
      const dmg = Math.max(1, creature.power) // use base power
      this.log(`🪤 ${creature.name}: Rug Pull — deals ${dmg} damage to all enemies!`)
      for (const c of oppBoard) {
        if (!c.abilities.includes('Diamond Hands')) {
          c.currentToughness -= dmg
        }
      }
      // Also hit face for half
      this.state.players[opp].hp -= Math.ceil(dmg / 2)
      this.log(`🪤 Rug Pull splash: ${Math.ceil(dmg / 2)} damage to Player ${opp + 1}!`)
    }

    board.splice(boardIndex, 1)
    this.state.players[player].graveyard.push(creature)
    this.log(`💀 ${creature.name} was destroyed!`)
  }

  useAbility(creatureIndex: number, targetIndex?: number): boolean {
    if (this.state.phase !== 'main') return false
    const ap = this.state.activePlayer
    const p = this.state.players[ap]
    const opp = this.opponent(ap)
    const oppBoard = this.state.players[opp].board
    if (creatureIndex < 0 || creatureIndex >= p.board.length) return false
    const creature = p.board[creatureIndex]

    if (creature.usedAbility && !creature.abilities.includes('Parallel Execution')) return false
    if (creature.mempoolDelay && creature.mempoolDelay > 0) {
      this.log(`⏳ ${creature.name} is delayed by Mempool — abilities locked!`)
      return false
    }

    // Fork: create a -1/-1 copy (costs 2 mana)
    if (creature.abilities.includes('Fork') && p.board.length < 5 && p.mana >= 2) {
      p.mana -= 2
      const copy: CardInstance = {
        ...creature,
        id: uid(),
        currentPower: Math.max(1, creature.currentPower - 1),
        currentToughness: Math.max(1, creature.currentToughness - 1),
        power: Math.max(1, creature.power - 1),
        toughness: Math.max(1, creature.toughness - 1),
        canAttack: false,
        hasAttacked: false,
        tapped: false,
        usedAbility: false,
        abilities: creature.abilities.filter(a => a !== 'Fork'),
        stakeCounters: 0,
        mempoolDelay: 0,
      }
      p.board.push(copy)
      creature.usedAbility = true
      this.log(`🔀 ${creature.name}: Fork — created a ${copy.currentPower}/${copy.currentToughness} copy!`)
      return true
    }

    // Liquidate: destroy enemy with power < this toughness
    if (creature.abilities.includes('Liquidate') && targetIndex !== undefined) {
      if (targetIndex < 0 || targetIndex >= oppBoard.length) return false
      const target = oppBoard[targetIndex]
      if (target.currentPower >= creature.currentToughness) {
        this.log(`❌ Can't Liquidate — ${target.name} is too powerful!`)
        return false
      }
      if (target.abilities.includes('Diamond Hands')) {
        this.log(`💎 ${target.name} has Diamond Hands — immune to Liquidate!`)
        return false
      }
      creature.usedAbility = true
      this.log(`💀 ${creature.name}: Liquidate — destroyed ${target.name}!`)
      this.destroyCreature(opp, targetIndex)
      this.cleanupDead(opp)
      return true
    }

    // Consensus: all your creatures get +1/+0 until end of turn
    if (creature.abilities.includes('Consensus')) {
      creature.usedAbility = true
      for (const c of p.board) {
        c.currentPower += 1
        c.consensusBonus = (c.consensusBonus || 0) + 1
      }
      this.log(`🤝 ${creature.name}: Consensus — all creatures gain +1 power!`)
      return true
    }

    // Stake: tap to gain +1/+1 counter permanently (but creature can't attack while staked)
    if (creature.abilities.includes('Stake') && !creature.tapped) {
      creature.tapped = true
      creature.canAttack = false
      creature.stakeCounters = (creature.stakeCounters || 0) + 1
      creature.currentPower += 1
      creature.currentToughness += 1
      creature.power += 1
      creature.toughness += 1
      creature.usedAbility = true
      this.log(`🔒 ${creature.name}: Stake — gained +1/+1 (${creature.stakeCounters} total)! Tapped.`)
      return true
    }

    // Mempool: delay a target enemy's abilities for 2 turns (costs 1 mana)
    if (creature.abilities.includes('Mempool') && targetIndex !== undefined && p.mana >= 1) {
      if (targetIndex < 0 || targetIndex >= oppBoard.length) return false
      const target = oppBoard[targetIndex]
      p.mana -= 1
      target.mempoolDelay = 2
      creature.usedAbility = true
      this.log(`⏳ ${creature.name}: Mempool — delayed ${target.name}'s abilities for 2 turns!`)
      return true
    }

    return false
  }

  advancePhase(): void {
    if (this.state.phase === 'main') {
      this.state.phase = 'attack'
      this.log(`⚔️ Player ${this.state.activePlayer + 1} enters attack phase`)
    } else if (this.state.phase === 'attack') {
      if (this.state.pendingAttacks.length > 0) {
        // Check if any face attacks that could be blocked
        const faceAttacks = this.state.pendingAttacks.filter(a => a.targetIdx === undefined)
        const defenderBoard = this.state.players[this.opponent(this.state.activePlayer)].board
        const untappedBlockers = defenderBoard.filter(c => !c.tapped)

        if (faceAttacks.length > 0 && untappedBlockers.length > 0) {
          // Defender gets to assign blockers
          this.state.waitingForBlocks = true
          this.state.phase = 'block'
          this.log(`🛡️ Player ${this.opponent(this.state.activePlayer) + 1} may assign blockers...`)
          return
        } else {
          // No blocking possible — resolve directly
          this.state.phase = 'resolve'
          this.resolveAttacks()
        }
      }
      this.endTurn()
    } else if (this.state.phase === 'block') {
      this.confirmBlocks()
      this.endTurn()
    } else if (this.state.phase === 'resolve') {
      this.endTurn()
    }
  }

  endTurn(): void {
    const ap = this.state.activePlayer
    const p = this.state.players[ap]

    // Remove consensus bonuses from active player
    for (const c of p.board) {
      if (c.consensusBonus) {
        c.currentPower -= c.consensusBonus
        c.consensusBonus = 0
      }
    }
    // Also clean any stale consensus on opponent (safety)
    for (const c of this.state.players[this.opponent(ap)].board) {
      if (c.consensusBonus) {
        c.currentPower -= c.consensusBonus
        c.consensusBonus = 0
      }
    }

    // Resolve any remaining pending attacks
    if (this.state.pendingAttacks.length > 0) {
      this.resolveAttacks()
    }

    // Switch player
    const np = this.opponent(ap)
    this.state.activePlayer = np
    this.state.turn++

    const nextP = this.state.players[np]
    nextP.maxMana = Math.min(10, nextP.maxMana + 1)
    nextP.mana = nextP.maxMana

    // Untap and reset creatures
    for (const c of nextP.board) {
      c.canAttack = true
      c.hasAttacked = false
      // Staked creatures stay tapped
      if (!c.abilities.includes('Stake') || !c.tapped) {
        c.tapped = false
      }
      c.usedAbility = false

      // MEV Extract: +1 power each turn
      if (c.abilities.includes('MEV Extract')) {
        c.currentPower += 1
        this.log(`⛏️ ${c.name}: MEV Extract — power now ${c.currentPower}!`)
      }

      // Mempool delay countdown
      if (c.mempoolDelay && c.mempoolDelay > 0) {
        c.mempoolDelay--
        if (c.mempoolDelay === 0) {
          this.log(`⏳ ${c.name}: Mempool delay expired — abilities unlocked!`)
        }
      }
    }

    // 51% Attack: check for each creature
    for (const c of nextP.board) {
      if (c.abilities.includes('51% Attack')) {
        const oppBoard = this.state.players[this.opponent(np)].board
        if (nextP.board.length > oppBoard.length) {
          c.currentPower = c.power + 3
          c.currentToughness = c.toughness + 3
          this.log(`👑 ${c.name}: 51% Attack — majority control! +3/+3`)
        } else {
          c.currentPower = c.power
          c.currentToughness = c.toughness
        }
      }
    }

    // Draw phase
    this.state.phase = 'draw'
    this.drawCard(np)
    this.state.phase = 'main'
    this.state.pendingAttacks = []
    this.state.pendingBlocks = []
    this.state.waitingForBlocks = false

    this.log(`\n--- Turn ${this.state.turn} | Player ${np + 1} | ${nextP.mana} mana ---`)
    this.checkGameOver()
  }

  getValidActions(): Action[] {
    const actions: Action[] = []
    const ap = this.state.activePlayer
    const p = this.state.players[ap]
    const opp = this.state.players[this.opponent(ap)]

    if (this.state.phase === 'main') {
      // Play cards from hand
      p.hand.forEach((card, i) => {
        const cost = this.getEffectiveCost(ap, card)
        if (p.mana >= cost && p.board.length < 5) {
          actions.push({ type: 'playCard', handIndex: i })
        }
      })
      // Use abilities
      p.board.forEach((c, i) => {
        const canUse = !c.usedAbility || c.abilities.includes('Parallel Execution')
        const notDelayed = !c.mempoolDelay || c.mempoolDelay <= 0
        if (!canUse || !notDelayed) return

        if (c.abilities.includes('Fork') && p.board.length < 5 && p.mana >= 2) {
          actions.push({ type: 'useAbility', creatureIndex: i, abilityName: 'Fork' })
        }
        if (c.abilities.includes('Liquidate')) {
          opp.board.forEach((t, ti) => {
            if (t.currentPower < c.currentToughness && !t.abilities.includes('Diamond Hands')) {
              actions.push({ type: 'useAbility', creatureIndex: i, targetIndex: ti, abilityName: 'Liquidate' })
            }
          })
        }
        if (c.abilities.includes('Consensus') && !c.usedAbility) {
          actions.push({ type: 'useAbility', creatureIndex: i, abilityName: 'Consensus' })
        }
        if (c.abilities.includes('Stake') && !c.tapped) {
          actions.push({ type: 'useAbility', creatureIndex: i, abilityName: 'Stake' })
        }
        if (c.abilities.includes('Mempool') && p.mana >= 1) {
          opp.board.forEach((_, ti) => {
            actions.push({ type: 'useAbility', creatureIndex: i, targetIndex: ti, abilityName: 'Mempool' })
          })
        }
      })
      actions.push({ type: 'endPhase' })
    }

    if (this.state.phase === 'attack') {
      p.board.forEach((c, i) => {
        if (c.canAttack && !c.hasAttacked && !c.tapped) {
          actions.push({ type: 'attack', creatureIndex: i }) // face
          opp.board.forEach((_, di) => {
            actions.push({ type: 'attack', creatureIndex: i, targetIndex: di })
          })
        }
      })
      actions.push({ type: 'endPhase' })
    }

    if (this.state.phase === 'block' && this.state.waitingForBlocks) {
      // Blocking actions for the defending player
      const dp = this.opponent(ap)
      const dBoard = this.state.players[dp].board
      const faceAttacks = this.state.pendingAttacks
        .map((a, i) => ({ ...a, idx: i }))
        .filter(a => a.targetIdx === undefined)

      dBoard.forEach((c, bi) => {
        if (!c.tapped) {
          faceAttacks.forEach(fa => {
            actions.push({ type: 'assignBlock', blockerIndex: bi, attackerIndex: fa.idx })
          })
        }
      })
      actions.push({ type: 'confirmBlocks' })
    }

    return actions
  }

  private checkGameOver(): void {
    if (this.state.players[0].hp <= 0) {
      this.state.gameOver = true
      this.state.winner = 1
      this.log('🏆 Player 2 wins!')
    } else if (this.state.players[1].hp <= 0) {
      this.state.gameOver = true
      this.state.winner = 0
      this.log('🏆 Player 1 wins!')
    }
  }

  isGameOver(): boolean {
    return this.state.gameOver
  }

  getWinner(): number | null {
    return this.state.winner
  }
}
