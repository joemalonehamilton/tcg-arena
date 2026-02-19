'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useAccount } from 'wagmi'
import { GameEngine, CardInstance, makeCardInstance, GameState } from '@/lib/game-engine'
import { aiPlayTurn, aiShouldMulligan, aiAssignBlocks, type Difficulty } from '@/lib/ai-opponent'
import PageBackground from '@/components/PageBackground'
import { calculateRewards, addRewardsToCollection, type Reward } from '@/lib/game-rewards'
import { ELO_CONFIG } from '@/lib/token-economy'
import { getBalance, initBalance } from '@/lib/token-store'
import { applyLocalElo, getLocalElo, updateWalletElo } from '@/lib/elo-store'
import { ABILITY_DESCRIPTIONS as ABILITY_DESCS } from '@/lib/ability-descriptions'
import { SFX } from '@/lib/sound-effects'
import { updateQuestProgress, getDailyQuests, claimQuest } from '@/lib/daily-quests'
import { sampleCards, monadMonsterCards } from '@/components/SampleCards'
import { DEFAULT_EMOTES } from '@/lib/emotes'
import StarterPackClaim from '@/components/StarterPackClaim'
import { getActiveSynergies } from '@/lib/synergies'

const ABILITY_ICONS: Record<string, string> = {
  'Flash Finality': '⚡', 'Sandwich Attack': '🥪', 'Rug Pull': '🪤',
  'Diamond Hands': '💎', 'MEV Extract': '⛏️', 'Gas Optimization': '⛽',
  'Fork': '🔀', 'Liquidate': '💀', '51% Attack': '👑',
  'Airdrop': '🪂', 'Stake': '🔒', 'Bridge': '🌉',
  'Mempool': '⏳', 'Consensus': '🤝', 'Revert': '↩️',
  'Parallel Execution': '⚙️', 'Block Reward': '🏆', 'Slippage': '📉',
}

const ACTIVE_ABILITIES = ['Fork', 'Liquidate', 'Consensus']

// Card image lookup
const CARD_IMAGES: Record<string, string> = {}
;[...sampleCards, ...monadMonsterCards].forEach(c => {
  if (c.imageUrl) CARD_IMAGES[c.name] = c.imageUrl
})

function loadSavedDeck(): CardInstance[] | null {
  try {
    const saved = localStorage.getItem('tcg-active-deck')
    if (!saved) return null
    const deck = JSON.parse(saved)
    if (!Array.isArray(deck) || deck.length < 10) return null
    return deck.map((c: any) => makeCardInstance({
      name: c.name, cost: c.cost, power: c.power, toughness: c.toughness,
      abilities: c.abilities || [], rarity: c.rarity || 'common',
    }))
  } catch { return null }
}

function buildDeck(): CardInstance[] {
  // Try to load saved deck first
  const saved = loadSavedDeck()
  if (saved) return saved

  // Fallback: random deck
  const allCards = [...sampleCards, ...monadMonsterCards]
  const shuffled = allCards.sort(() => Math.random() - 0.5)
  return shuffled.slice(0, 15).map(c => makeCardInstance(c))
}

// ─── Floating damage numbers ───
function FloatingNumber({ value, x, y, color }: { value: string; x: number; y: number; color: string }) {
  return (
    <div className="fixed pointer-events-none z-50 animate-float-up font-black text-3xl"
      style={{ left: x, top: y, color, textShadow: `0 0 10px ${color}` }}>
      {value}
    </div>
  )
}

function ManaGem({ filled }: { filled: boolean }) {
  return (
    <div className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${
      filled
        ? 'bg-blue-400 border-blue-300 shadow-[0_0_8px_rgba(96,165,250,0.6)]'
        : 'bg-gray-800 border-gray-600'
    }`} />
  )
}

function ManaBar({ current, max }: { current: number; max: number }) {
  return (
    <div className="flex gap-1 items-center">
      {Array.from({ length: max }).map((_, i) => (
        <ManaGem key={i} filled={i < current} />
      ))}
      <span className="text-xs text-blue-300 ml-1 font-bold">{current}/{max}</span>
    </div>
  )
}

function HpBar({ hp, max = 20, shaking }: { hp: number; max?: number; shaking?: boolean }) {
  const pct = Math.max(0, (hp / max) * 100)
  const color = hp > 14 ? 'bg-green-500' : hp > 7 ? 'bg-yellow-500' : 'bg-red-500 animate-pulse'
  const glow = hp > 14 ? 'shadow-green-500/30' : hp > 7 ? 'shadow-yellow-500/30' : 'shadow-red-500/50'
  return (
    <div className={`w-full ${shaking ? 'animate-shake' : ''}`}>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-400">HP</span>
        <span className={`font-black ${hp <= 5 ? 'text-red-400' : 'text-white'}`}>{hp}/{max}</span>
      </div>
      <div className={`h-3 bg-gray-800 rounded-full overflow-hidden shadow-inner ${glow}`}>
        <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function BoardCard({
  card, onClick, onAbility, isActive, isOpponent, isAttacking, isNew, isTargetable, canAttackNow,
}: {
  card: CardInstance; onClick?: () => void; onAbility?: (ability: string) => void
  isActive?: boolean; isOpponent?: boolean; isAttacking?: boolean; isNew?: boolean
  isTargetable?: boolean; canAttackNow?: boolean
}) {
  const [hovered, setHovered] = useState(false)
  const borderColor = { common: '#6b7280', uncommon: '#22c55e', rare: '#a855f7', legendary: '#f59e0b', mythic: '#ff0040' }[card.rarity] || '#6b7280'
  const activeAbilities = card.abilities.filter(a => ACTIVE_ABILITIES.includes(a))
  const imageUrl = CARD_IMAGES[card.name]

  return (
    <div className="relative group">
      <div
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={`relative w-[120px] h-[170px] rounded-xl border-2 flex flex-col cursor-pointer transition-all duration-300 overflow-hidden
          ${isActive ? 'ring-2 ring-[#b8f53d] scale-110 z-10' : 'hover:scale-105 hover:z-10'}
          ${isAttacking ? 'animate-attack-slam shadow-lg shadow-red-500/50' : ''}
          ${isNew ? 'animate-slide-in' : ''}
          ${card.hasAttacked ? 'brightness-75' : ''}
        `}
        style={{ borderColor, background: '#12121f' }}
      >
        {/* Card art background */}
        {imageUrl && (
          <div className="absolute inset-0 opacity-30">
            <Image src={imageUrl} alt="" fill className="object-cover" sizes="120px" />
          </div>
        )}

        {/* Cost gem */}
        <div className="absolute -top-1 -left-1 w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-black z-10 border-2 border-blue-400 shadow-lg shadow-blue-500/30">
          {card.cost}
        </div>

        {/* Rarity indicator */}
        <div className="absolute top-0 right-0 w-2 h-8 rounded-bl-lg" style={{ background: borderColor }} />

        {/* Name */}
        <div className="relative px-2 pt-3 pb-1 text-[10px] font-bold text-white truncate drop-shadow-lg z-[1]">{card.name}</div>

        {/* Abilities */}
        <div className="relative flex-1 px-1.5 flex flex-wrap gap-0.5 content-start z-[1]">
          {card.abilities.map(ab => (
            <span key={ab} className="text-[8px] bg-black/60 backdrop-blur-sm rounded px-1 py-0.5 text-gray-200" title={ab}>
              {ABILITY_ICONS[ab] || '✦'}
            </span>
          ))}
        </div>

        {/* Active ability buttons */}
        {!isOpponent && activeAbilities.length > 0 && onAbility && !card.usedAbility && (
          <div className="relative px-1 pb-0.5 flex flex-wrap gap-0.5 z-[1]">
            {activeAbilities.map(ab => (
              <button key={ab} onClick={(e) => { e.stopPropagation(); onAbility(ab) }}
                className="text-[7px] bg-[#b8f53d]/20 text-[#b8f53d] rounded px-1.5 py-0.5 hover:bg-[#b8f53d]/50 border border-[#b8f53d]/40 font-bold transition-all">
                {ABILITY_ICONS[ab]} {ab}
              </button>
            ))}
          </div>
        )}

        {/* Stats bar */}
        <div className="relative flex justify-between px-2 py-1.5 bg-black/60 z-[1]">
          <span className={`text-sm font-black ${card.currentPower > card.power ? 'text-green-400' : card.currentPower < card.power ? 'text-red-400' : 'text-orange-300'}`}>
            ⚔️{card.currentPower}
          </span>
          <span className={`text-sm font-black ${card.currentToughness < card.toughness ? 'text-red-400' : 'text-blue-300'}`}>
            🛡️{card.currentToughness}
          </span>
        </div>

        {/* Attacked overlay */}
        {card.hasAttacked && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-20">
            <span className="text-gray-400 text-lg">💤</span>
          </div>
        )}

        {/* Can attack indicator */}
        {canAttackNow && !card.hasAttacked && (
          <div className="absolute inset-0 rounded-xl ring-2 ring-[#b8f53d] animate-pulse z-20 pointer-events-none">
            <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] bg-[#b8f53d] text-black font-black px-2 py-0.5 rounded-full whitespace-nowrap">
              TAP TO ATTACK
            </div>
          </div>
        )}

        {/* Targetable (enemy) indicator */}
        {isTargetable && (
          <div className="absolute inset-0 rounded-xl ring-2 ring-red-500 animate-pulse z-20 pointer-events-none">
            <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] bg-red-500 text-white font-black px-2 py-0.5 rounded-full whitespace-nowrap">
              CLICK TO ATTACK
            </div>
          </div>
        )}
      </div>

      {/* Tooltip on hover */}
      {hovered && (
        <div className={`absolute ${isOpponent ? 'top-full mt-2' : 'bottom-full mb-2'} left-1/2 -translate-x-1/2 w-56 bg-[#1a1a2e] border border-gray-600 rounded-xl p-3 z-50 shadow-2xl pointer-events-none`}>
          <div className="text-xs font-bold text-white mb-1">{card.name}</div>
          <div className="text-[10px] uppercase font-bold mb-2" style={{ color: borderColor }}>{card.rarity}</div>
          <div className="space-y-1.5">
            {card.abilities.map(ab => (
              <div key={ab} className="text-[10px] text-gray-300">
                <div className="flex items-center gap-1">
                  <span>{ABILITY_ICONS[ab] || '✦'}</span>
                  <span className="font-bold text-white">{ab}</span>
                </div>
                {ABILITY_DESCS[ab] && <div className="text-[9px] text-gray-500 ml-4 mt-0.5">{ABILITY_DESCS[ab]}</div>}
              </div>
            ))}
          </div>
          <div className="mt-2 pt-2 border-t border-gray-700 flex justify-between text-xs">
            <span className="text-orange-300">⚔️ {card.currentPower}/{card.power}</span>
            <span className="text-blue-300">🛡️ {card.currentToughness}/{card.toughness}</span>
          </div>
        </div>
      )}
    </div>
  )
}

function HandCard({ card, onClick, canPlay, index, total }: {
  card: CardInstance; onClick: () => void; canPlay: boolean; index: number; total: number
}) {
  const [hovered, setHovered] = useState(false)
  const borderColor = { common: '#6b7280', uncommon: '#22c55e', rare: '#a855f7', legendary: '#f59e0b', mythic: '#ff0040' }[card.rarity] || '#6b7280'
  const imageUrl = CARD_IMAGES[card.name]

  // Fan-out effect
  const mid = (total - 1) / 2
  const offset = index - mid
  const rotate = offset * 3
  const translateY = Math.abs(offset) * 8

  return (
    <div className="relative" style={{ zIndex: hovered ? 50 : index }}>
      <div
        onClick={canPlay ? onClick : undefined}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={`relative w-[100px] h-[145px] rounded-xl border-2 flex flex-col transition-all duration-300 overflow-hidden
          ${canPlay ? 'hover:scale-125 hover:-translate-y-8 cursor-pointer hover:shadow-xl hover:shadow-[#b8f53d]/30 hover:rotate-0' : 'opacity-40 cursor-not-allowed grayscale'}
        `}
        style={{
          borderColor: canPlay ? borderColor : '#333',
          background: '#12121f',
          transform: hovered ? undefined : `rotate(${rotate}deg) translateY(${translateY}px)`,
        }}
      >
        {/* Card art */}
        {imageUrl && (
          <div className="absolute inset-0 opacity-25">
            <Image src={imageUrl} alt="" fill className="object-cover" sizes="100px" />
          </div>
        )}

        <div className="absolute -top-1 -left-1 w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-[10px] font-black z-10 border-2 border-blue-400">
          {card.cost}
        </div>
        <div className="relative px-1.5 pt-3 pb-0.5 text-[9px] font-bold text-white truncate z-[1]">{card.name}</div>
        <div className="relative flex-1 px-1.5 flex flex-wrap gap-0.5 content-start z-[1]">
          {card.abilities.slice(0, 3).map(ab => (
            <span key={ab} className="text-[7px] bg-black/60 rounded px-1 py-0.5 text-gray-200">{ABILITY_ICONS[ab] || '✦'}</span>
          ))}
        </div>
        <div className="relative flex justify-between px-1.5 py-1 bg-black/50 z-[1]">
          <span className="text-[10px] font-black text-orange-300">⚔️{card.power}</span>
          <span className="text-[10px] font-black text-blue-300">🛡️{card.toughness}</span>
        </div>
      </div>
    </div>
  )
}

type Phase = 'menu' | 'difficulty' | 'mulligan' | 'playing' | 'gameover'

interface GameStats {
  damageDealt: number
  cardsPlayed: number
  abilitiesUsed: number
  turns: number
}

interface FloatText {
  id: number; value: string; x: number; y: number; color: string
}

export default function PlayPage() {
  const { address } = useAccount()
  const [phase, setPhase] = useState<Phase>('menu')
  const [difficulty, setDifficulty] = useState<Difficulty>('veteran')
  const engineRef = useRef<GameEngine | null>(null)
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [selectedCreature, setSelectedCreature] = useState<number | null>(null)
  const [abilityMode, setAbilityMode] = useState<{ creatureIdx: number; ability: string } | null>(null)
  const [mulliganHand, setMulliganHand] = useState<CardInstance[]>([])
  const [rewards, setRewards] = useState<Reward[]>([])
  const [eloChange, setEloChange] = useState(0)
  const [stats, setStats] = useState<GameStats>({ damageDealt: 0, cardsPlayed: 0, abilitiesUsed: 0, turns: 0 })
  const logRef = useRef<HTMLDivElement>(null)
  const [activeEmote, setActiveEmote] = useState<string | null>(null)
  const [aiEmote, setAiEmote] = useState<string | null>(null)
  const [shakePlayer, setShakePlayer] = useState(false)
  const [shakeOpponent, setShakeOpponent] = useState(false)
  const [blockMode, setBlockMode] = useState(false)
  const [selectedBlocker, setSelectedBlocker] = useState<number | null>(null)
  const [showRules, setShowRules] = useState(false)
  const [floatingTexts, setFloatingTexts] = useState<FloatText[]>([])
  const [showTurnBanner, setShowTurnBanner] = useState(false)
  const [prevHp, setPrevHp] = useState<[number, number]>([20, 20])
  const [newCards, setNewCards] = useState<Set<string>>(new Set())
  const floatIdRef = useRef(0)
  const boardRef = useRef<HTMLDivElement>(null)

  const refresh = useCallback(() => {
    if (engineRef.current) {
      const state = { ...engineRef.current.state }
      setGameState(state)
      // Persist game to survive tab switches
      try {
        localStorage.setItem('tcg-active-game', JSON.stringify({
          state,
          difficulty,
          stats,
          phase: 'playing',
          timestamp: Date.now(),
        }))
      } catch {}
    }
  }, [difficulty, stats])

  // Restore game from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('tcg-active-game')
      if (!saved) return
      const data = JSON.parse(saved)
      // Only restore if less than 30 min old
      if (Date.now() - data.timestamp > 30 * 60 * 1000) {
        localStorage.removeItem('tcg-active-game')
        return
      }
      if (data.state && data.phase === 'playing' && !data.state.gameOver) {
        // Reconstruct engine from saved state
        const engine = new GameEngine([], [])
        engine.state = data.state
        engineRef.current = engine
        setGameState(data.state)
        setDifficulty(data.difficulty || 'veteran')
        setStats(data.stats || { damageDealt: 0, cardsPlayed: 0, abilitiesUsed: 0, turns: 0 })
        setPrevHp([data.state.players[0].hp, data.state.players[1].hp])
        setPhase('playing')
      }
    } catch {}
  }, [])

  // Spawn floating damage number
  const spawnFloat = useCallback((value: string, color: string, xOffset = 0) => {
    const id = ++floatIdRef.current
    const x = (window.innerWidth / 2) + xOffset + (Math.random() * 40 - 20)
    const y = window.innerHeight / 2
    setFloatingTexts(prev => [...prev, { id, value, x, y, color }])
    setTimeout(() => setFloatingTexts(prev => prev.filter(f => f.id !== id)), 1000)
  }, [])

  // Detect HP changes for shake + floating numbers
  useEffect(() => {
    if (!gameState) return
    const [p1hp, p2hp] = [gameState.players[0].hp, gameState.players[1].hp]
    if (p1hp < prevHp[0]) {
      setShakePlayer(true)
      spawnFloat(`-${prevHp[0] - p1hp}`, '#ef4444', 0)
      setTimeout(() => setShakePlayer(false), 400)
    }
    if (p2hp < prevHp[1]) {
      setShakeOpponent(true)
      spawnFloat(`-${prevHp[1] - p2hp}`, '#ef4444', 0)
      setTimeout(() => setShakeOpponent(false), 400)
    }
    setPrevHp([p1hp, p2hp])
  }, [gameState?.players[0]?.hp, gameState?.players[1]?.hp])

  // Show turn banner
  useEffect(() => {
    if (!gameState || gameState.gameOver) return
    if (gameState.activePlayer === 0 && gameState.turn > 1) {
      SFX.turnStart()
      setShowTurnBanner(true)
      setTimeout(() => setShowTurnBanner(false), 1200)
    }
  }, [gameState?.activePlayer, gameState?.turn])

  // Auto-scroll log
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
  }, [gameState?.log.length])

  const initGame = useCallback((diff: Difficulty) => {
    setDifficulty(diff)
    const d1 = buildDeck()
    const d2 = buildDeck()
    engineRef.current = new GameEngine(d1, d2)

    const aiHand = engineRef.current.state.players[1].hand
    if (aiShouldMulligan(aiHand)) {
      const p = engineRef.current.state.players[1]
      p.deck.push(...p.hand)
      p.hand = []
      p.deck = p.deck.sort(() => Math.random() - 0.5)
      p.hand = p.deck.splice(0, 4)
    }

    setMulliganHand([...engineRef.current.state.players[0].hand])
    setPhase('mulligan')
    setStats({ damageDealt: 0, cardsPlayed: 0, abilitiesUsed: 0, turns: 0 })
    setRewards([])
    setPrevHp([20, 20])
    setNewCards(new Set())
    refresh()
  }, [refresh])

  const doMulligan = useCallback((keep: boolean) => {
    if (!engineRef.current) return
    if (!keep) {
      const p = engineRef.current.state.players[0]
      p.deck.push(...p.hand)
      p.hand = []
      p.deck = p.deck.sort(() => Math.random() - 0.5)
      p.hand = p.deck.splice(0, 4)
    }
    setPhase('playing')
    refresh()
  }, [refresh])

  // AI turn with slight delay for drama
  useEffect(() => {
    if (phase !== 'playing' || !gameState || gameState.gameOver) return
    if (gameState.activePlayer !== 1) return
    // Skip if player needs to block
    if (gameState.waitingForBlocks) return
    // If stuck on resolve phase, advance it
    if (gameState.phase === 'resolve') {
      const t = setTimeout(() => {
        if (!engineRef.current) return
        engineRef.current.advancePhase()
        refresh()
      }, 500)
      return () => clearTimeout(t)
    }

    const t = setTimeout(() => {
      if (!engineRef.current) return
      const prevBoard = engineRef.current.state.players[1].board.length
      aiPlayTurn(engineRef.current, difficulty)
      const newBoard = engineRef.current.state.players[1].board
      if (newBoard.length > prevBoard) {
        const ids = new Set(newBoard.slice(prevBoard).map(c => c.id))
        setNewCards(ids)
        setTimeout(() => setNewCards(new Set()), 500)
      }
      refresh()
    }, 800)
    return () => clearTimeout(t)
  }, [phase, gameState?.activePlayer, gameState?.turn, gameState?.gameOver, gameState?.phase, gameState?.waitingForBlocks, difficulty, refresh])

  // AI blocking (when player attacks and AI needs to assign blockers)
  useEffect(() => {
    if (!gameState || !engineRef.current) return
    if (gameState.waitingForBlocks && gameState.activePlayer === 0) {
      const t = setTimeout(() => {
        if (!engineRef.current) return
        aiAssignBlocks(engineRef.current, difficulty)
        refresh()
      }, 1000)
      return () => clearTimeout(t)
    }
  }, [gameState?.waitingForBlocks, gameState?.activePlayer, difficulty, refresh])

  // Player needs to block (when AI attacks face and player has untapped creatures)
  useEffect(() => {
    if (!gameState) return
    if (gameState.waitingForBlocks && gameState.activePlayer === 1) {
      setBlockMode(true)
    } else {
      setBlockMode(false)
      setSelectedBlocker(null)
    }
  }, [gameState?.waitingForBlocks, gameState?.activePlayer])

  // Game over
  useEffect(() => {
    if (phase === 'playing' && gameState?.gameOver) {
      const won = gameState.winner === 0
      setTimeout(() => won ? SFX.victory() : SFX.defeat(), 300)
      const turns = gameState.turn
      const r = calculateRewards(won, turns)
      addRewardsToCollection(r)
      setRewards(r)
      setStats(s => ({ ...s, turns }))

      // Award ELO instead of tokens
      if (address) {
        updateWalletElo(address, won, difficulty).then(({ change }) => setEloChange(change))
      } else {
        const change = applyLocalElo(won, difficulty)
        setEloChange(change)
      }

      updateQuestProgress('games', 1)
      if (won) updateQuestProgress('wins', 1)
      updateQuestProgress('damage', stats.damageDealt)
      updateQuestProgress('cards_played', stats.cardsPlayed)
      updateQuestProgress('abilities', stats.abilitiesUsed)

      localStorage.removeItem('tcg-active-game')
      setTimeout(() => setPhase('gameover'), 600)
    }
  }, [phase, gameState?.gameOver, gameState?.winner, gameState?.turn, difficulty])

  const handlePlayCard = (handIndex: number) => {
    const eng = engineRef.current
    if (!eng || eng.state.activePlayer !== 0 || phase !== 'playing') return
    const card = eng.state.players[0].hand[handIndex]
    if (!card) return
    const success = eng.playCard(0, handIndex)
    if (success) {
      SFX.playCard()
      setStats(s => ({ ...s, cardsPlayed: s.cardsPlayed + 1 }))
      // Mark as new for animation
      const played = eng.state.players[0].board.find(c => c.name === card.name && !newCards.has(c.id))
      if (played) {
        setNewCards(prev => new Set([...prev, played.id]))
        setTimeout(() => setNewCards(prev => { const n = new Set(prev); n.delete(played.id); return n }), 500)
      }
      spawnFloat(card.name, '#b8f53d')
    }
    refresh()
  }

  const handleCreatureClick = (boardIndex: number, isOpponent: boolean) => {
    const eng = engineRef.current
    if (!eng || phase !== 'playing') return

    // Blocking mode: player assigns blockers
    if (blockMode && !isOpponent) {
      if (selectedBlocker === boardIndex) {
        setSelectedBlocker(null) // deselect
      } else {
        setSelectedBlocker(boardIndex)
      }
      return
    }
    if (blockMode && isOpponent && selectedBlocker !== null) {
      // Assign this blocker to that attacker
      const faceAttacks = eng.state.pendingAttacks
        .map((a, i) => ({ ...a, idx: i }))
        .filter(a => a.targetIdx === undefined)
      // Find which pending attack index this enemy creature corresponds to
      const attackIdx = faceAttacks.findIndex(fa => {
        const atkCreature = eng.state.players[1].board[fa.attackerIdx]
        return atkCreature === eng.state.players[1].board[eng.state.pendingAttacks[fa.idx].attackerIdx]
      })
      if (attackIdx >= 0) {
        eng.assignBlock(selectedBlocker, faceAttacks[attackIdx].idx)
        setSelectedBlocker(null)
        refresh()
      }
      return
    }

    if (eng.state.activePlayer !== 0) return

    if (abilityMode) {
      if (isOpponent) {
        eng.useAbility(abilityMode.creatureIdx, boardIndex)
        setAbilityMode(null)
        setStats(s => ({ ...s, abilitiesUsed: s.abilitiesUsed + 1 }))
        refresh()
      }
      return
    }

    if (eng.state.phase === 'attack' && !isOpponent) {
      const c = eng.state.players[0].board[boardIndex]
      if (c && c.canAttack && !c.hasAttacked) {
        // Select creature — don't auto-attack face on double click
        setSelectedCreature(boardIndex)
      }
    } else if (eng.state.phase === 'attack' && isOpponent && selectedCreature !== null) {
      // Click enemy creature = directed attack
      SFX.attack()
      eng.declareAttack(selectedCreature, boardIndex)
      setSelectedCreature(null)
      refresh()
    }
  }

  const handleConfirmBlocks = () => {
    if (!engineRef.current || !blockMode) return
    engineRef.current.advancePhase() // this calls confirmBlocks + endTurn
    setBlockMode(false)
    setSelectedBlocker(null)
    refresh()
  }

  const handleAbility = (creatureIdx: number, ability: string) => {
    const eng = engineRef.current
    if (!eng || eng.state.activePlayer !== 0 || phase !== 'playing') return
    if (ability === 'Liquidate') {
      setAbilityMode({ creatureIdx, ability })
      return
    }
    eng.useAbility(creatureIdx)
    setStats(s => ({ ...s, abilitiesUsed: s.abilitiesUsed + 1 }))
    spawnFloat(`✨ ${ability}`, '#b8f53d')
    refresh()
  }

  const handleAdvancePhase = () => {
    const eng = engineRef.current
    if (!eng || eng.state.activePlayer !== 0 || phase !== 'playing') return
    eng.advancePhase()
    setSelectedCreature(null)
    refresh()
  }

  const router = useRouter()
  const [joinCode, setJoinCode] = useState('')
  const [creatingLobby, setCreatingLobby] = useState(false)

  const createLobby = async () => {
    if (!address) { alert('Connect wallet first'); return }
    setCreatingLobby(true)
    try {
      const res = await fetch('/api/lobby', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ host_id: address }),
      })
      const data = await res.json()
      router.push(`/play/lobby/${data.code}`)
    } catch { setCreatingLobby(false) }
  }

  const joinLobby = () => {
    if (joinCode.length >= 4) router.push(`/play/lobby/${joinCode.toUpperCase()}`)
  }

  // ─── MENU ───
  if (phase === 'menu') {
    return (
      <div className="min-h-screen  flex flex-col items-center justify-center gap-8 relative overflow-hidden">
        {/* Background grid */}
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #b8f53d 1px, transparent 0)', backgroundSize: '40px 40px' }} />

        <div className="relative z-10 text-center">
          <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#b8f53d] to-[#22c55e] mb-2">⚔️ TCG ARENA</h1>
          <p className="text-gray-500 text-lg tracking-wider">AI-POWERED CRYPTO CARD BATTLES</p>
        </div>

        <div className="flex gap-5 mt-4 relative z-10">
          <button onClick={() => setPhase('difficulty')}
            className="w-56 p-6 bg-white/[0.02] border-2 border-[#b8f53d]/30 rounded-2xl hover:border-[#b8f53d] hover:bg-[#b8f53d]/5 hover:scale-105 transition-all text-left group">
            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">🤖</div>
            <div className="font-black text-white text-lg mb-1">vs AI</div>
            <div className="text-xs text-gray-500 leading-relaxed">3 difficulty tiers. Practice strategies. Earn rewards.</div>
          </button>

          <div className="w-56 p-6 bg-white/[0.02] border-2 border-purple-500/20 rounded-2xl text-left opacity-60 relative">
            <div className="absolute top-3 right-3 text-[10px] uppercase tracking-wider font-bold text-purple-400 bg-purple-500/20 px-2 py-0.5 rounded-full">Coming Soon</div>
            <div className="text-4xl mb-3">⚔️</div>
            <div className="font-black text-white text-lg mb-1">vs Friend</div>
            <div className="text-xs text-gray-600 leading-relaxed">PvP lobbies with turn-based sync. Challenge your friends.</div>
          </div>

          <div className="w-56 p-6 bg-white/[0.02] border-2 border-yellow-500/20 rounded-2xl text-left opacity-60 relative">
            <div className="absolute top-3 right-3 text-[10px] uppercase tracking-wider font-bold text-yellow-400 bg-yellow-500/20 px-2 py-0.5 rounded-full">Coming Soon</div>
            <div className="text-4xl mb-3">🏆</div>
            <div className="font-black text-white text-lg mb-1">Ranked</div>
            <div className="text-xs text-gray-600 leading-relaxed">ELO matchmaking. 10 🪙 entry. Climb the ladder.</div>
          </div>
        </div>

        {/* Quick links */}
        <div className="flex gap-3 mt-4 relative z-10">
          <Link href="/decks" className="px-5 py-2.5 bg-white/5 text-gray-400 rounded-xl text-sm hover:bg-white/10 hover:text-white transition font-medium">📝 Decks</Link>
          <Link href="/packs" className="px-5 py-2.5 bg-white/5 text-gray-400 rounded-xl text-sm hover:bg-white/10 hover:text-white transition font-medium">📦 Packs</Link>
          <Link href="/collection" className="px-5 py-2.5 bg-white/5 text-gray-400 rounded-xl text-sm hover:bg-white/10 hover:text-white transition font-medium">🃏 Collection</Link>
          <Link href="/craft" className="px-5 py-2.5 bg-white/5 text-gray-400 rounded-xl text-sm hover:bg-white/10 hover:text-white transition font-medium">🔥 Forge</Link>
        </div>

        {/* Starter pack claim */}
        <div className="relative z-10 w-56">
          <StarterPackClaim />
        </div>

        {/* ELO rating */}
        <div className="mt-2 text-gray-500 text-sm relative z-10">
          📊 {typeof window !== 'undefined' ? getLocalElo() : 1000} ELO {!address && <span className="text-yellow-500/60">(connect wallet to save)</span>}
        </div>
      </div>
    )
  }

  // ─── DIFFICULTY SELECT ───
  if (phase === 'difficulty') {
    const diffs: { id: Difficulty; name: string; icon: string; desc: string; color: string; reward: string }[] = [
      { id: 'rookie', name: 'Rookie', icon: '🌱', desc: 'Random plays. Learn the ropes. Good for first games.', color: '#22c55e', reward: '+15 ELO' },
      { id: 'veteran', name: 'Veteran', icon: '⚔️', desc: 'Calculates threats. Prioritizes value. Punishes bad plays.', color: '#f59e0b', reward: '+25 ELO' },
      { id: 'degen', name: 'Degen', icon: '💀', desc: 'Optimal play. Look-ahead AI. Maximum efficiency. GL.', color: '#ff0040', reward: '+40 ELO' },
    ]
    return (
      <div className="min-h-screen  flex flex-col items-center justify-center gap-6">
        <h2 className="text-4xl font-black text-white">Choose Your Opponent</h2>
        <p className="text-gray-500">Higher difficulty = better rewards</p>
        <div className="flex gap-5">
          {diffs.map(d => (
            <button key={d.id} onClick={() => initGame(d.id)}
              className="w-60 p-8 rounded-2xl border-2 bg-white/[0.02] hover:bg-white/[0.05] transition-all hover:scale-105 text-left group"
              style={{ borderColor: `${d.color}40` }}>
              <div className="text-5xl mb-4 group-hover:scale-125 transition-transform">{d.icon}</div>
              <div className="font-black text-xl mb-1" style={{ color: d.color }}>{d.name}</div>
              <div className="text-xs text-gray-400 leading-relaxed mb-3">{d.desc}</div>
              <div className="text-xs font-bold px-2 py-1 rounded-full inline-block" style={{ background: `${d.color}20`, color: d.color }}>
                Win: {d.reward}
              </div>
            </button>
          ))}
        </div>
        <button onClick={() => { localStorage.removeItem('tcg-active-game'); setPhase('menu') }} className="mt-4 text-gray-600 text-sm hover:text-white transition">← Back to menu</button>
      </div>
    )
  }

  // ─── MULLIGAN ───
  if (phase === 'mulligan') {
    return (
      <div className="min-h-screen  flex flex-col items-center justify-center gap-6">
        <h2 className="text-3xl font-black text-white">Opening Hand</h2>
        <p className="text-gray-400 text-sm">Keep these cards or mulligan for a fresh draw</p>
        <div className="flex gap-4">
          {mulliganHand.map((card, i) => {
            const borderColor = { common: '#6b7280', uncommon: '#22c55e', rare: '#a855f7', legendary: '#f59e0b', mythic: '#ff0040' }[card.rarity] || '#6b7280'
            const imageUrl = CARD_IMAGES[card.name]
            return (
              <div key={card.id} className="w-36 h-52 rounded-xl border-2 flex flex-col overflow-hidden animate-slide-in relative"
                style={{ borderColor, background: '#12121f', animationDelay: `${i * 100}ms` }}>
                {imageUrl && (
                  <div className="absolute inset-0 opacity-20">
                    <Image src={imageUrl} alt="" fill className="object-cover" sizes="144px" />
                  </div>
                )}
                <div className="relative p-3 flex flex-col flex-1 z-[1]">
                  <div className="text-blue-400 text-xs font-bold mb-1">Cost {card.cost}</div>
                  <div className="text-white text-sm font-black mb-2">{card.name}</div>
                  <div className="flex-1 flex flex-wrap gap-1 content-start">
                    {card.abilities.map(ab => (
                      <span key={ab} className="text-[8px] bg-black/50 rounded px-1.5 py-0.5 text-gray-200">{ABILITY_ICONS[ab]} {ab}</span>
                    ))}
                  </div>
                  <div className="text-xs text-gray-300 mt-2">⚔️{card.power} / 🛡️{card.toughness}</div>
                </div>
              </div>
            )
          })}
        </div>
        <div className="flex gap-4 mt-6">
          <button onClick={() => doMulligan(true)}
            className="px-10 py-3 bg-[#b8f53d] text-black font-black rounded-xl hover:bg-[#d4ff6e] transition-all hover:scale-105 text-lg">
            ✅ Keep
          </button>
          <button onClick={() => doMulligan(false)}
            className="px-10 py-3 bg-red-500/20 text-red-400 border-2 border-red-500/30 font-black rounded-xl hover:bg-red-500/30 transition-all hover:scale-105 text-lg">
            🔄 Mulligan
          </button>
        </div>
      </div>
    )
  }

  // ─── GAME OVER ───
  if (phase === 'gameover' && gameState) {
    const won = gameState.winner === 0
    return (
      <div className="min-h-screen  flex flex-col items-center justify-center gap-6 relative overflow-hidden">
        {/* Victory/defeat bg effect */}
        <div className={`absolute inset-0 ${won ? 'bg-gradient-to-b from-[#b8f53d]/10 to-transparent' : 'bg-gradient-to-b from-red-900/20 to-transparent'}`} />
        
        {/* Floating particles for victory */}
        {won && Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="absolute w-2 h-2 rounded-full bg-[#b8f53d] animate-float-up opacity-0"
            style={{
              left: `${5 + Math.random() * 90}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }} />
        ))}

        <div className={`relative text-5xl sm:text-7xl font-black ${won ? 'text-[#b8f53d] drop-shadow-[0_0_30px_rgba(184,245,61,0.5)]' : 'text-red-500 drop-shadow-[0_0_30px_rgba(239,68,68,0.5)]'} animate-card-enter`}>
          {won ? '🏆 VICTORY' : '💀 DEFEAT'}
        </div>
        <div className="text-gray-400 text-sm sm:text-lg relative">{won ? 'The blockchain favors the bold.' : 'Rekt. Try again.'}</div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mt-4 relative">
          {[
            { label: 'Turns', value: stats.turns, icon: '🔄' },
            { label: 'Damage', value: stats.damageDealt, icon: '⚔️' },
            { label: 'Cards', value: stats.cardsPlayed, icon: '🃏' },
            { label: 'Abilities', value: stats.abilitiesUsed, icon: '✨' },
          ].map((s, i) => (
            <div key={s.label} className="bg-white/[0.03] border border-white/10 rounded-xl p-5 text-center animate-slide-in"
              style={{ animationDelay: `${i * 100}ms` }}>
              <div className="text-3xl mb-2">{s.icon}</div>
              <div className="text-3xl font-black text-white">{s.value}</div>
              <div className="text-xs text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* ELO change */}
        {eloChange !== 0 && (
          <div className={`${eloChange > 0 ? 'bg-[#b8f53d]/10 border-[#b8f53d]/30' : 'bg-red-500/10 border-red-500/30'} border-2 rounded-xl px-8 py-4 flex items-center gap-3 animate-slide-in relative`} style={{ animationDelay: '400ms' }}>
            <span className="text-3xl">📊</span>
            <span className={`${eloChange > 0 ? 'text-[#b8f53d]' : 'text-red-400'} font-black text-2xl`}>
              {eloChange > 0 ? '+' : ''}{eloChange} ELO
            </span>
          </div>
        )}

        {/* Rewards */}
        {rewards.length > 0 && (
          <div className="mt-4 relative">
            <h3 className="text-lg font-black text-white text-center mb-3">🎁 Card Rewards</h3>
            <div className="flex gap-3">
              {rewards.map((r, i) => {
                const color = { common: '#6b7280', uncommon: '#22c55e', rare: '#a855f7', legendary: '#f59e0b', mythic: '#ff0040' }[r.rarity] || '#6b7280'
                return (
                  <div key={i} className="w-40 p-4 rounded-xl border-2 text-center animate-slide-in"
                    style={{ borderColor: color, background: '#12121f', animationDelay: `${(i + 5) * 150}ms` }}>
                    <div className="text-xs uppercase font-black mb-1" style={{ color }}>{r.rarity}</div>
                    <div className="text-sm font-bold text-white">{r.name}</div>
                    <div className="text-[10px] text-gray-500 mt-1">Added to collection</div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-3 mt-6 relative justify-center">
          <button onClick={() => initGame(difficulty)}
            className="px-8 py-3 bg-[#b8f53d] text-black font-black rounded-xl hover:bg-[#d4ff6e] transition-all hover:scale-105">
            🔄 Play Again
          </button>
          <button onClick={() => {
            const text = won
              ? `⚔️ Just won a ${difficulty} match on TCG Arena in ${stats.turns} turns! 🏆\n\n${stats.damageDealt} damage dealt, ${stats.cardsPlayed} cards played\n\nhttps://tcgarena.fun/play`
              : `💀 Got rekt by the ${difficulty} AI on TCG Arena after ${stats.turns} turns\n\nCan you do better? ⚔️\n\nhttps://tcgarena.fun/play`
            window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank')
          }}
            className="px-6 py-3 bg-blue-500/20 border border-blue-500/40 text-blue-400 font-bold rounded-xl hover:bg-blue-500/30 transition">
            🐦 Share
          </button>
          <button onClick={() => setPhase('difficulty')}
            className="px-6 py-3 bg-white/5 text-gray-400 font-bold rounded-xl hover:bg-white/10 transition">
            Change Difficulty
          </button>
          <button onClick={() => setPhase('menu')}
            className="px-6 py-3 bg-white/5 text-gray-400 font-bold rounded-xl hover:bg-white/10 transition">
            🏠 Menu
          </button>
        </div>
      </div>
    )
  }

  // ─── PLAYING ───
  if (!gameState) return null
  const player = gameState.players[0]
  const opponent = gameState.players[1]
  const isMyTurn = gameState.activePlayer === 0 || (gameState.waitingForBlocks && gameState.activePlayer === 1)

  return (
    <div className="min-h-screen flex flex-col lg:flex-row relative">
      <PageBackground variant="play" />
      {/* Floating damage numbers */}
      {floatingTexts.map(f => (
        <FloatingNumber key={f.id} value={f.value} x={f.x} y={f.y} color={f.color} />
      ))}

      {/* YOUR TURN banner */}
      {showTurnBanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="text-6xl font-black text-[#b8f53d] animate-turn-flash drop-shadow-[0_0_30px_rgba(184,245,61,0.5)]">
            YOUR TURN
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col p-4 gap-2" ref={boardRef}>
        {/* ═══ OPPONENT AREA ═══ */}
        <div className={`flex items-center gap-4 px-4 py-2 rounded-xl bg-white/[0.02] ${shakeOpponent ? 'animate-shake' : ''}`}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-lg">🤖</div>
            <div className="text-sm text-gray-300 font-bold capitalize">{difficulty} AI</div>
          </div>
          <div className="flex-1 max-w-xs"><HpBar hp={opponent.hp} shaking={shakeOpponent} /></div>
          <ManaBar current={gameState.activePlayer === 1 ? opponent.mana : 0} max={opponent.maxMana} />
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>🃏 {opponent.hand.length}</span>
            <span>📚 {opponent.deck.length}</span>
          </div>
        </div>

        {/* Opponent hand (face down) */}
        <div className="flex justify-center gap-1 h-10">
          {opponent.hand.map((_, i) => (
            <div key={i} className="w-7 h-10 rounded-md bg-gradient-to-br from-purple-900/80 to-gray-800/80 border border-purple-700/30 shadow-inner" />
          ))}
        </div>

        {/* Opponent board */}
        <div className="flex justify-center gap-1 sm:gap-3 min-h-[120px] sm:min-h-[180px] items-end px-2 sm:px-8">
          {opponent.board.map((card, i) => (
            <BoardCard key={card.id} card={card} isOpponent
              onClick={() => handleCreatureClick(i, true)}
              isActive={abilityMode !== null || (selectedCreature !== null && gameState.phase === 'attack')}
              isTargetable={selectedCreature !== null && gameState.phase === 'attack'}
              isNew={newCards.has(card.id)} />
          ))}
          {opponent.board.length === 0 && <div className="text-gray-700 text-sm italic py-16">No creatures in play</div>}
        </div>

        {/* AI emote */}
        {aiEmote && (
          <div className="flex justify-center">
            <div className="bg-purple-500/20 border border-purple-500/30 text-purple-300 text-sm px-4 py-1.5 rounded-full animate-card-enter font-medium">
              🤖 {aiEmote}
            </div>
          </div>
        )}

        {/* ═══ BATTLEFIELD DIVIDER + ATTACK INSTRUCTIONS ═══ */}
        <div className="flex flex-col items-center gap-2 py-2">
          <div className="flex items-center gap-4 w-full">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#b8f53d]/40 to-transparent" />
            <div className="flex items-center gap-3">
              <span className="text-[#b8f53d] font-black text-sm">T{gameState.turn}</span>
              <span className={`text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider ${
                isMyTurn ? 'bg-[#b8f53d]/20 text-[#b8f53d] border border-[#b8f53d]/30' : 'bg-gray-700/50 text-gray-500'
              }`}>
                {gameState.phase}
              </span>
              {!isMyTurn && !gameState.gameOver && (
                <span className="text-xs text-gray-500 animate-pulse">AI thinking...</span>
              )}
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#b8f53d]/40 to-transparent" />
          </div>

          {/* Big attack instruction banner */}
          {isMyTurn && gameState.phase === 'attack' && selectedCreature === null && player.board.some(c => c.canAttack && !c.hasAttacked) && (
            <div className="bg-red-500/15 border border-red-500/40 text-red-300 px-6 py-2.5 rounded-xl text-sm font-bold animate-pulse flex items-center gap-2">
              ⚔️ TAP A CREATURE TO ATTACK — or End Turn to skip
            </div>
          )}
          {isMyTurn && gameState.phase === 'attack' && selectedCreature !== null && (
            <div className="bg-[#b8f53d]/15 border border-[#b8f53d]/40 text-[#b8f53d] px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-3">
              <span>⚔️ {gameState.players[0].board[selectedCreature]?.name} ready!</span>
              <button onClick={() => {
                const eng = engineRef.current
                if (!eng) return
                const c = eng.state.players[0].board[selectedCreature]
                SFX.attack()
                eng.declareAttack(selectedCreature)
                setSelectedCreature(null)
                if (c) setStats(s => ({ ...s, damageDealt: s.damageDealt + c.currentPower }))
                refresh()
              }} className="px-4 py-1.5 bg-red-600 text-white text-xs font-black rounded-lg hover:bg-red-500 shadow-lg shadow-red-500/30 animate-pulse">
                🔥 ATTACK FACE
              </button>
              <span className="text-xs text-gray-400">or click an enemy creature</span>
              <button onClick={() => setSelectedCreature(null)} className="text-gray-500 hover:text-white text-xs ml-1">✕</button>
            </div>
          )}
          {isMyTurn && gameState.phase === 'main' && (
            <div className="text-gray-500 text-xs">
              Play cards from your hand, then press End Turn to attack
            </div>
          )}
        </div>

        {/* Player emote */}
        {activeEmote && (
          <div className="flex justify-center">
            <div className="bg-[#b8f53d]/20 border border-[#b8f53d]/30 text-[#b8f53d] text-sm px-4 py-1.5 rounded-full animate-card-enter font-medium">
              {activeEmote}
            </div>
          </div>
        )}

        {/* Active synergies */}
        {player.board.length >= 2 && (() => {
          const synergies = getActiveSynergies(player.board.map(c => c.name), player.board.map(c => c.abilities))
          if (synergies.length === 0) return null
          return (
            <div className="flex justify-center gap-2">
              {synergies.map(s => (
                <div key={s.id} className="bg-[#b8f53d]/10 border border-[#b8f53d]/20 text-[#b8f53d] text-[10px] px-3 py-1 rounded-full font-bold">
                  {s.icon} {s.name}: {s.effect}
                </div>
              ))}
            </div>
          )
        })()}

        {/* Player board */}
        <div className="flex justify-center gap-1 sm:gap-3 min-h-[120px] sm:min-h-[180px] items-start px-2 sm:px-8">
          {player.board.map((card, i) => (
            <BoardCard key={card.id} card={card}
              onClick={() => handleCreatureClick(i, false)}
              onAbility={(ab) => handleAbility(i, ab)}
              isActive={selectedCreature === i}
              canAttackNow={isMyTurn && gameState.phase === 'attack' && card.canAttack && !card.hasAttacked && selectedCreature === null}
              isNew={newCards.has(card.id)} />
          ))}
          {player.board.length === 0 && <div className="text-gray-700 text-sm italic py-16">Play cards from your hand</div>}
        </div>

        {/* Player hand */}
        <div className="flex justify-center gap-1 mt-1 pb-1">
          {player.hand.map((card, i) => {
            const cost = engineRef.current?.getEffectiveCost(0, card) ?? card.cost
            return (
              <HandCard key={card.id} card={card}
                onClick={() => handlePlayCard(i)}
                canPlay={isMyTurn && gameState.phase === 'main' && cost <= player.mana && player.board.length < 5}
                index={i} total={player.hand.length} />
            )
          })}
        </div>

        {/* ═══ PLAYER STATUS BAR ═══ */}
        <div className={`flex items-center gap-4 px-4 py-2 rounded-xl bg-white/[0.02] ${shakePlayer ? 'animate-shake' : ''}`}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#b8f53d]/20 flex items-center justify-center text-lg">👤</div>
            <div className="text-sm text-[#b8f53d] font-bold">You</div>
          </div>
          <div className="flex-1 max-w-xs"><HpBar hp={player.hp} shaking={shakePlayer} /></div>
          <ManaBar current={player.mana} max={player.maxMana} />

          {/* Phase button */}
          {blockMode && (
            <button onClick={handleConfirmBlocks}
              className="px-5 py-2.5 font-black rounded-xl text-sm transition-all hover:scale-105 bg-blue-500 text-white hover:bg-blue-400 shadow-lg shadow-blue-500/30 animate-pulse">
              🛡️ Confirm Blocks
            </button>
          )}
          {isMyTurn && !gameState.gameOver && !blockMode && (
            <button onClick={handleAdvancePhase}
              className={`px-5 py-2.5 font-black rounded-xl text-sm transition-all hover:scale-105 ${
                gameState.phase === 'main'
                  ? 'bg-orange-500 text-white hover:bg-orange-400 shadow-lg shadow-orange-500/30'
                  : 'bg-[#b8f53d] text-black hover:bg-[#d4ff6e] shadow-lg shadow-[#b8f53d]/30'
              }`}>
              {gameState.phase === 'main' ? '⚔️ Attack' : '⏭ End Turn'}
            </button>
          )}

          {/* Emotes */}
          <div className="flex gap-0.5">
            {DEFAULT_EMOTES.slice(0, 5).map(e => (
              <button key={e.id} onClick={() => {
                setActiveEmote(`${e.emoji} ${e.text}`)
                setTimeout(() => setActiveEmote(null), 2000)
                if (e.category === 'taunt') {
                  setTimeout(() => {
                    const responses = ['💀 REKT', '🤔 Hmm...', '📈 PUMP IT', '🤝 GG', '🥪 Sandwiched']
                    setAiEmote(responses[Math.floor(Math.random() * responses.length)])
                    setTimeout(() => setAiEmote(null), 2000)
                  }, 800)
                }
              }} className="text-base hover:scale-150 transition-all hover:drop-shadow-lg" title={e.text}>
                {e.emoji}
              </button>
            ))}
          </div>

          {/* Context hints */}
          {abilityMode && (
            <div className="text-yellow-400 text-xs animate-pulse font-bold">
              🎯 Select target for {abilityMode.ability}
              <button onClick={() => setAbilityMode(null)} className="ml-2 text-gray-400 hover:text-white">✕</button>
            </div>
          )}
          {selectedCreature !== null && gameState.phase === 'attack' && (
            <div className="flex items-center gap-2">
              <div className="text-[#b8f53d] text-xs font-bold">
                ⚔️ {gameState.players[0].board[selectedCreature]?.name} selected —
              </div>
              <button onClick={() => {
                const eng = engineRef.current
                if (!eng) return
                const c = eng.state.players[0].board[selectedCreature]
                SFX.attack()
                eng.declareAttack(selectedCreature)
                setSelectedCreature(null)
                if (c) setStats(s => ({ ...s, damageDealt: s.damageDealt + c.currentPower }))
                refresh()
              }} className="px-3 py-1 bg-red-600 text-white text-xs font-black rounded-lg hover:bg-red-500 animate-pulse">
                🔥 Go Face
              </button>
              <div className="text-gray-400 text-xs">or click enemy creature</div>
              <button onClick={() => setSelectedCreature(null)} className="text-gray-500 hover:text-white text-xs">✕</button>
            </div>
          )}
          {blockMode && (
            <div className="text-blue-400 text-xs animate-pulse font-bold">
              🛡️ Select your creature then click an attacker to block. Click "Confirm Blocks" when done.
            </div>
          )}
        </div>
      </div>

      {/* ═══ RULES MODAL ═══ */}
      {showRules && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setShowRules(false)}>
          <div className="bg-[#12121f] border border-gray-700 rounded-2xl p-6 max-w-lg max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-black text-[#b8f53d] mb-4">📖 How to Play</h2>
            <div className="space-y-3 text-sm text-gray-300">
              <div><span className="text-white font-bold">🎯 Goal:</span> Reduce opponent&apos;s HP to 0.</div>
              <div><span className="text-white font-bold">💎 Mana:</span> Gain +1 max mana each turn (up to 10). Spend mana to play cards.</div>
              <div><span className="text-white font-bold">🃏 Turns:</span> Draw → Play cards → Attack → Opponent blocks → Resolve → End</div>
              <div><span className="text-white font-bold">⚔️ Attacking:</span> Click your creature, then click enemy creature (targeted) or click again (face damage). Creatures have summoning sickness (can&apos;t attack the turn they&apos;re played).</div>
              <div><span className="text-white font-bold">🛡️ Blocking:</span> When enemy attacks face, you can assign your untapped creatures as blockers to intercept damage.</div>
              <div><span className="text-white font-bold">📚 Hand limit:</span> 8 cards max. Excess cards are burned.</div>
              <div><span className="text-white font-bold">💀 Fatigue:</span> No cards left to draw? Take 2 damage per draw.</div>
              <h3 className="text-white font-bold mt-4 mb-2">✨ Abilities</h3>
              <div className="space-y-1.5 text-xs">
                <div>⚡ <b>Flash Finality</b> — Unblocked face attack destroys strongest enemy creature</div>
                <div>🥪 <b>Sandwich Attack</b> — On play, steal 2 power from random enemy</div>
                <div>🪤 <b>Rug Pull</b> — On death, deals base power to all enemies + half to face</div>
                <div>💎 <b>Diamond Hands</b> — Immune to ability destruction (only dies in combat)</div>
                <div>⛏️ <b>MEV Extract</b> — +1 power each turn (snowballs!)</div>
                <div>⛽ <b>Gas Optimization</b> — Costs 1 less per creature you control</div>
                <div>🔀 <b>Fork</b> — Pay 2 mana: create a -1/-1 copy</div>
                <div>💀 <b>Liquidate</b> — Destroy enemy with less power than your toughness</div>
                <div>👑 <b>51% Attack</b> — +3/+3 if you control more creatures than opponent</div>
                <div>🪂 <b>Airdrop</b> — On play, draw 2 cards</div>
                <div>🔒 <b>Stake</b> — Tap to permanently gain +1/+1 (can&apos;t attack while staked)</div>
                <div>🌉 <b>Bridge</b> — No summoning sickness (attacks immediately)</div>
                <div>⏳ <b>Mempool</b> — Pay 1 mana: lock enemy&apos;s abilities for 2 turns</div>
                <div>🤝 <b>Consensus</b> — All your creatures get +1 power this turn</div>
                <div>↩️ <b>Revert</b> — Returns to hand instead of dying (once)</div>
                <div>⚙️ <b>Parallel Execution</b> — Can attack AND use abilities same turn</div>
                <div>🏆 <b>Block Reward</b> — You gain 1 life when a creature enters your board</div>
                <div>📉 <b>Slippage</b> — Attackers permanently lose 1 power when hitting this</div>
              </div>
            </div>
            <button onClick={() => setShowRules(false)} className="mt-4 w-full py-2 bg-[#b8f53d] text-black font-bold rounded-lg">Got it</button>
          </div>
        </div>
      )}

      {/* ═══ SIDEBAR ═══ */}
      <div className="w-full lg:w-60 h-48 lg:h-auto bg-[#0d0d15] border-t lg:border-t-0 lg:border-l border-gray-800/50 flex flex-col">
        <div className="p-3 border-b border-gray-800/50 flex justify-between items-center">
          <h3 className="text-[#b8f53d] font-black text-sm">📜 Battle Log</h3>
          <button onClick={() => setShowRules(true)} className="text-xs text-gray-500 hover:text-[#b8f53d] transition">📖 Rules</button>
        </div>
        <div ref={logRef} className="flex-1 overflow-y-auto p-3 space-y-1 text-[10px] text-gray-500 scrollbar-thin">
          {gameState.log.map((entry, i) => (
            <div key={i} className={`leading-relaxed ${
              entry.startsWith('---') ? 'text-[#b8f53d]/70 font-bold mt-2 border-t border-gray-800/30 pt-1' :
              entry.includes('wins') ? 'text-yellow-400 font-bold text-xs' :
              entry.includes('destroyed') ? 'text-red-400' :
              entry.includes('drew') ? 'text-blue-400/60' :
              entry.includes('played') ? 'text-[#b8f53d]/70' :
              ''
            }`}>
              {entry}
            </div>
          ))}
        </div>

        {/* Quick stats */}
        <div className="p-3 border-t border-gray-800/50 space-y-1 text-[10px] text-gray-600">
          <div className="flex justify-between"><span>Your deck</span><span>{player.deck.length} cards</span></div>
          <div className="flex justify-between"><span>Your grave</span><span>{player.graveyard.length} cards</span></div>
          <div className="flex justify-between"><span>Enemy deck</span><span>{opponent.deck.length} cards</span></div>
          <div className="flex justify-between"><span>Damage dealt</span><span className="text-orange-400">{stats.damageDealt}</span></div>
        </div>
      </div>
    </div>
  )
}
