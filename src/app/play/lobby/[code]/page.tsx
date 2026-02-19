'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useAccount } from 'wagmi'
import { GameEngine, CardInstance, makeCardInstance, GameState } from '@/lib/game-engine'
import { sampleCards, monadMonsterCards } from '@/components/SampleCards'
import { getActiveSynergies } from '@/lib/synergies'

type LobbyStatus = 'loading' | 'waiting' | 'matched' | 'playing' | 'finished' | 'error'

const ABILITY_ICONS: Record<string, string> = {
  'Flash Finality': '⚡', 'Sandwich Attack': '🥪', 'Rug Pull': '🪤',
  'Diamond Hands': '💎', 'MEV Extract': '⛏️', 'Gas Optimization': '⛽',
  'Fork': '🔀', 'Liquidate': '💀', '51% Attack': '👑',
  'Airdrop': '🪂', 'Stake': '🔒', 'Bridge': '🌉',
  'Mempool': '⏳', 'Consensus': '🤝', 'Revert': '↩️',
  'Parallel Execution': '⚙️', 'Block Reward': '🏆', 'Slippage': '📉',
}
const ACTIVE_ABILITIES = ['Fork', 'Liquidate', 'Consensus', 'Stake', 'Mempool']

const CARD_IMAGES: Record<string, string> = {}
;[...sampleCards, ...monadMonsterCards].forEach(c => { if (c.imageUrl) CARD_IMAGES[c.name] = c.imageUrl })

function buildDeck(): CardInstance[] {
  const allCards = [...sampleCards, ...monadMonsterCards]
  return allCards.sort(() => Math.random() - 0.5).slice(0, 15).map(c => makeCardInstance(c))
}

// Seeded RNG so both players get same decks from same seed
function seededShuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    seed = (seed * 16807) % 2147483647
    const j = seed % (i + 1);
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function buildSeededDeck(seed: number): CardInstance[] {
  const allCards = [...sampleCards, ...monadMonsterCards]
  return seededShuffle(allCards, seed).slice(0, 15).map(c => makeCardInstance(c))
}

function HpBar({ hp, max = 20 }: { hp: number; max?: number }) {
  const pct = Math.max(0, (hp / max) * 100)
  const color = hp > 14 ? 'bg-green-500' : hp > 7 ? 'bg-yellow-500' : 'bg-red-500'
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-400">HP</span>
        <span className="text-white font-black">{hp}/{max}</span>
      </div>
      <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function ManaBar({ current, max }: { current: number; max: number }) {
  return (
    <div className="flex gap-1 items-center">
      {Array.from({ length: max }).map((_, i) => (
        <div key={i} className={`w-4 h-4 rounded-full border-2 transition-all ${i < current ? 'bg-blue-400 border-blue-300' : 'bg-gray-800 border-gray-600'}`} />
      ))}
      <span className="text-xs text-blue-300 ml-1 font-bold">{current}/{max}</span>
    </div>
  )
}

function PvPCard({ card, onClick, isActive, isOpponent, small }: {
  card: CardInstance; onClick?: () => void; isActive?: boolean; isOpponent?: boolean; small?: boolean
}) {
  const borderColor = { common: '#6b7280', uncommon: '#22c55e', rare: '#a855f7', legendary: '#f59e0b', mythic: '#ff0040' }[card.rarity] || '#6b7280'
  const imageUrl = CARD_IMAGES[card.name]
  const w = small ? 'w-[90px] h-[130px]' : 'w-[120px] h-[170px]'

  return (
    <div onClick={onClick}
      className={`relative ${w} rounded-xl border-2 flex flex-col cursor-pointer transition-all duration-300 overflow-hidden
        ${isActive ? 'ring-2 ring-[#b8f53d] scale-110 z-10' : 'hover:scale-105'}
        ${card.hasAttacked ? 'brightness-75' : ''}
      `}
      style={{ borderColor, background: '#12121f' }}>
      {imageUrl && <div className="absolute inset-0 opacity-30"><Image src={imageUrl} alt="" fill className="object-cover" sizes="120px" /></div>}
      <div className="absolute -top-1 -left-1 w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-[10px] font-black z-10 border-2 border-blue-400">{card.cost}</div>
      <div className="relative px-1.5 pt-3 pb-0.5 text-[9px] font-bold text-white truncate z-[1]">{card.name}</div>
      <div className="relative flex-1 px-1 flex flex-wrap gap-0.5 content-start z-[1]">
        {card.abilities.map(ab => (
          <span key={ab} className="text-[7px] bg-black/60 rounded px-1 py-0.5 text-gray-200">{ABILITY_ICONS[ab] || '✦'}</span>
        ))}
      </div>
      <div className="relative flex justify-between px-1.5 py-1 bg-black/60 z-[1]">
        <span className={`text-xs font-black ${card.currentPower > card.power ? 'text-green-400' : 'text-orange-300'}`}>⚔️{card.currentPower}</span>
        <span className={`text-xs font-black ${card.currentToughness < card.toughness ? 'text-red-400' : 'text-blue-300'}`}>🛡️{card.currentToughness}</span>
      </div>
      {card.hasAttacked && <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-20"><span className="text-gray-400 text-lg">💤</span></div>}
    </div>
  )
}

export default function LobbyPage() {
  const { code } = useParams()
  const router = useRouter()
  const { address } = useAccount()
  const [lobbyStatus, setLobbyStatus] = useState<LobbyStatus>('loading')
  const [lobby, setLobby] = useState<Record<string, unknown> | null>(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [playerIndex, setPlayerIndex] = useState<0 | 1>(0) // 0 = host, 1 = guest
  const engineRef = useRef<GameEngine | null>(null)
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [selectedCreature, setSelectedCreature] = useState<number | null>(null)
  const [abilityMode, setAbilityMode] = useState<{ creatureIdx: number; ability: string } | null>(null)
  const [turnTimer, setTurnTimer] = useState(60)
  const [winner, setWinner] = useState<string | null>(null)
  const [gameStarted, setGameStarted] = useState(false)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const logRef = useRef<HTMLDivElement>(null)

  const userId = address || 'anonymous'

  const refresh = useCallback(() => {
    if (engineRef.current) setGameState({ ...engineRef.current.state })
  }, [])

  // Fetch lobby state
  const fetchLobby = useCallback(async () => {
    try {
      const res = await fetch(`/api/lobby/${code}`)
      if (!res.ok) { setLobbyStatus('error'); setError('Lobby not found'); return }
      const data = await res.json()
      setLobby(data)

      if (data.status === 'waiting') setLobbyStatus('waiting')
      else if (data.status === 'playing' && !gameStarted) setLobbyStatus('matched')
      else if (data.status === 'finished') {
        setLobbyStatus('finished')
        if (pollRef.current) clearInterval(pollRef.current)
      }

      // Determine player index
      if (data.host_id === userId) setPlayerIndex(0)
      else if (data.guest_id === userId) setPlayerIndex(1)

      // If game is in progress and we have remote state, sync it
      if (data.game_state && gameStarted && engineRef.current) {
        const remoteState = data.game_state as GameState
        const localState = engineRef.current.state
        // Only update if remote has more turns or it's the opponent's move
        if (remoteState.turn > localState.turn || remoteState.activePlayer !== playerIndex) {
          engineRef.current.state = remoteState
          refresh()
        }
      }
    } catch {
      // Silently retry
    }
  }, [code, userId, gameStarted, playerIndex, refresh])

  // Poll
  useEffect(() => {
    fetchLobby()
    pollRef.current = setInterval(fetchLobby, 2000)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [fetchLobby])

  // Turn timer
  useEffect(() => {
    if (!gameStarted || !gameState || gameState.gameOver) return
    setTurnTimer(60)
    const t = setInterval(() => {
      setTurnTimer(prev => {
        if (prev <= 1) {
          // Auto-pass on timeout
          if (engineRef.current && gameState.activePlayer === playerIndex) {
            engineRef.current.advancePhase()
            if (engineRef.current.state.phase === 'attack') engineRef.current.advancePhase()
            syncState()
            refresh()
          }
          return 60
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [gameStarted, gameState?.turn, gameState?.activePlayer])

  // Auto-scroll log
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
  }, [gameState?.log.length])

  // Sync state to server
  const syncState = useCallback(async () => {
    if (!engineRef.current) return
    try {
      await fetch(`/api/lobby/${code}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_state',
          game_state: engineRef.current.state,
        }),
      })
    } catch {}
  }, [code])

  // Join lobby
  const joinLobby = async () => {
    try {
      const res = await fetch(`/api/lobby/${code}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'join', guest_id: userId }),
      })
      if (res.ok) fetchLobby()
      else {
        const data = await res.json()
        setError(data.error || 'Failed to join')
      }
    } catch { setError('Failed to join lobby') }
  }

  // Start the game
  const startGame = useCallback(async () => {
    // Use lobby code as seed so both players get same decks
    const seed = String(code).split('').reduce((a, c) => a + c.charCodeAt(0), 0) * 31337
    const d1 = buildSeededDeck(seed)
    const d2 = buildSeededDeck(seed + 1)
    engineRef.current = new GameEngine(d1, d2)
    setGameStarted(true)
    setLobbyStatus('playing')
    refresh()
    await syncState()
  }, [code, refresh, syncState])

  // Game over detection
  useEffect(() => {
    if (!gameState?.gameOver || winner) return
    const winnerId = gameState.winner === 0 ? lobby?.host_id : lobby?.guest_id
    setWinner(winnerId as string)
    // Report result
    fetch(`/api/lobby/${code}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'end', winner_id: winnerId }),
    }).catch(() => {})
  }, [gameState?.gameOver, gameState?.winner, winner, lobby, code])

  // Game actions
  const isMyTurn = gameState ? gameState.activePlayer === playerIndex : false
  const myPlayer = gameState?.players[playerIndex]
  const oppPlayer = gameState?.players[playerIndex === 0 ? 1 : 0]

  const handlePlayCard = (handIndex: number) => {
    if (!engineRef.current || !isMyTurn || engineRef.current.state.phase !== 'main') return
    const success = engineRef.current.playCard(playerIndex, handIndex)
    if (success) { refresh(); syncState() }
  }

  const handleCreatureClick = (boardIndex: number, isOpponent: boolean) => {
    if (!engineRef.current || !isMyTurn) return

    if (abilityMode && isOpponent) {
      engineRef.current.useAbility(abilityMode.creatureIdx, boardIndex)
      setAbilityMode(null)
      refresh(); syncState()
      return
    }

    if (engineRef.current.state.phase === 'attack' && !isOpponent) {
      const c = myPlayer?.board[boardIndex]
      if (c && c.canAttack && !c.hasAttacked) {
        if (selectedCreature === boardIndex) {
          engineRef.current.declareAttack(boardIndex)
          setSelectedCreature(null)
          refresh(); syncState()
        } else {
          setSelectedCreature(boardIndex)
        }
      }
    } else if (engineRef.current.state.phase === 'attack' && isOpponent && selectedCreature !== null) {
      engineRef.current.declareAttack(selectedCreature, boardIndex)
      setSelectedCreature(null)
      refresh(); syncState()
    }
  }

  const handleAbility = (creatureIdx: number, ability: string) => {
    if (!engineRef.current || !isMyTurn) return
    if (ability === 'Liquidate' || ability === 'Mempool') {
      setAbilityMode({ creatureIdx, ability })
      return
    }
    engineRef.current.useAbility(creatureIdx)
    refresh(); syncState()
  }

  const handleAdvancePhase = () => {
    if (!engineRef.current || !isMyTurn) return
    engineRef.current.advancePhase()
    setSelectedCreature(null)
    refresh(); syncState()
  }

  const isHost = lobby?.host_id === userId
  const isGuest = lobby?.guest_id === userId

  // ─── LOADING ───
  if (lobbyStatus === 'loading') {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-gray-400 animate-pulse text-xl">Loading lobby...</div>
      </div>
    )
  }

  // ─── ERROR ───
  if (lobbyStatus === 'error') {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center gap-4">
        <div className="text-red-400 text-2xl font-bold">❌ {error}</div>
        <Link href="/play" className="text-gray-500 hover:text-[#b8f53d] transition">← Back to Play</Link>
      </div>
    )
  }

  // ─── WAITING ───
  if (lobbyStatus === 'waiting') {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center gap-6">
        <div className="text-gray-500 text-sm tracking-widest uppercase">Lobby Code</div>
        <div className="text-5xl font-mono font-black text-[#b8f53d] tracking-[0.3em] bg-white/5 px-8 py-4 rounded-2xl border border-[#b8f53d]/20">
          {String(code).toUpperCase()}
        </div>
        <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/play/lobby/${code}`); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
          className="text-xs text-gray-500 hover:text-[#b8f53d] transition">
          {copied ? '✅ Copied!' : '📋 Copy invite link'}
        </button>

        {isHost ? (
          <div className="text-center">
            <div className="text-xl text-white font-bold mb-2">Waiting for opponent...</div>
            <div className="text-gray-500 text-sm">Share the code with a friend</div>
            <div className="mt-6 flex items-center gap-4 justify-center">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-[#b8f53d] animate-pulse" />
                <span className="text-white font-mono text-sm">{String(lobby?.host_id).slice(0, 10)}...</span>
                <span className="text-[#b8f53d] text-xs">(You)</span>
              </div>
              <span className="text-gray-600 font-black">VS</span>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-gray-700 animate-pulse" />
                <span className="text-gray-600 text-sm">Waiting...</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="text-2xl text-white font-black mb-6">Join this battle?</div>
            <button onClick={joinLobby}
              className="px-10 py-4 bg-[#b8f53d] text-black font-black rounded-xl text-xl hover:bg-[#d4ff6e] transition-all hover:scale-105">
              ⚔️ Join Battle
            </button>
            {error && <div className="mt-3 text-red-400 text-sm">{error}</div>}
          </div>
        )}
        <Link href="/play" className="text-gray-600 text-sm hover:text-white mt-4">← Back</Link>
      </div>
    )
  }

  // ─── MATCHED — ready to start ───
  if (lobbyStatus === 'matched') {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center gap-6">
        <div className="text-4xl text-[#b8f53d] font-black animate-card-enter">⚔️ MATCHED!</div>
        <div className="flex items-center gap-4 justify-center">
          <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl">
            <div className="w-4 h-4 rounded-full bg-[#b8f53d]" />
            <span className="text-white text-sm font-mono">{String(lobby?.host_id).slice(0, 10)}...</span>
            {isHost && <span className="text-[#b8f53d] text-xs">(You)</span>}
          </div>
          <span className="text-gray-500 font-black text-xl">VS</span>
          <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl">
            <div className="w-4 h-4 rounded-full bg-purple-500" />
            <span className="text-white text-sm font-mono">{String(lobby?.guest_id).slice(0, 10)}...</span>
            {isGuest && <span className="text-purple-400 text-xs">(You)</span>}
          </div>
        </div>
        <button onClick={startGame}
          className="px-12 py-4 bg-[#b8f53d] text-black font-black rounded-xl text-xl hover:bg-[#d4ff6e] transition-all hover:scale-105 shadow-lg shadow-[#b8f53d]/30">
          🎮 Start Game
        </button>
        <div className="text-gray-600 text-xs">ELO is on the line. Play your best.</div>
      </div>
    )
  }

  // ─── FINISHED ───
  if (lobbyStatus === 'finished' || (gameState?.gameOver && winner)) {
    const iWon = (gameState?.winner === playerIndex)
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center gap-6">
        <div className={`text-6xl font-black ${iWon ? 'text-[#b8f53d]' : 'text-red-500'}`}>
          {iWon ? '🏆 VICTORY' : '💀 DEFEAT'}
        </div>
        <div className="text-gray-400 text-lg">{iWon ? 'ELO +25' : 'ELO -25'}</div>
        <div className="flex gap-4 mt-4">
          <Link href="/play" className="px-8 py-3 bg-[#b8f53d] text-black font-black rounded-xl hover:bg-[#d4ff6e] transition">Play Again</Link>
          <Link href="/leaderboard" className="px-8 py-3 bg-white/5 text-gray-400 rounded-xl hover:bg-white/10 transition">Leaderboard</Link>
        </div>
      </div>
    )
  }

  // ─── PLAYING ───
  if (!gameState || !myPlayer || !oppPlayer) return null

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex">
      <div className="flex-1 flex flex-col p-4 gap-2">
        {/* Opponent */}
        <div className="flex items-center gap-4 px-4 py-2 rounded-xl bg-white/[0.02]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-lg">
              {playerIndex === 0 ? '👤' : '🏠'}
            </div>
            <div className="text-sm text-gray-300 font-bold">
              {playerIndex === 0 ? String(lobby?.guest_id).slice(0, 8) : String(lobby?.host_id).slice(0, 8)}...
            </div>
          </div>
          <div className="flex-1 max-w-xs"><HpBar hp={oppPlayer.hp} /></div>
          <ManaBar current={gameState.activePlayer !== playerIndex ? oppPlayer.mana : 0} max={oppPlayer.maxMana} />
          <span className="text-xs text-gray-500">🃏{oppPlayer.hand.length}</span>
        </div>

        {/* Opponent hand (face down) */}
        <div className="flex justify-center gap-1 h-8">
          {oppPlayer.hand.map((_, i) => (
            <div key={i} className="w-6 h-8 rounded bg-gradient-to-br from-purple-900/80 to-gray-800/80 border border-purple-700/30" />
          ))}
        </div>

        {/* Opponent board */}
        <div className="flex justify-center gap-3 min-h-[170px] items-end px-4">
          {oppPlayer.board.map((card, i) => (
            <PvPCard key={card.id} card={card} isOpponent
              onClick={() => handleCreatureClick(i, true)}
              isActive={abilityMode !== null || (selectedCreature !== null && gameState.phase === 'attack')} />
          ))}
          {oppPlayer.board.length === 0 && <div className="text-gray-700 text-sm italic py-12">No creatures</div>}
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 py-1">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#b8f53d]/40 to-transparent" />
          <div className="flex items-center gap-3">
            <span className="text-[#b8f53d] font-black text-sm">T{gameState.turn}</span>
            <span className={`text-[10px] px-3 py-1 rounded-full font-bold uppercase ${isMyTurn ? 'bg-[#b8f53d]/20 text-[#b8f53d]' : 'bg-gray-700/50 text-gray-500'}`}>
              {isMyTurn ? gameState.phase : 'opponent\'s turn'}
            </span>
            <span className={`text-xs font-mono ${turnTimer <= 10 ? 'text-red-400 animate-pulse' : 'text-gray-500'}`}>
              ⏱️{turnTimer}s
            </span>
          </div>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#b8f53d]/40 to-transparent" />
        </div>

        {/* Synergies */}
        {myPlayer.board.length >= 2 && (() => {
          const synergies = getActiveSynergies(myPlayer.board.map(c => c.name), myPlayer.board.map(c => c.abilities))
          if (synergies.length === 0) return null
          return (
            <div className="flex justify-center gap-2">
              {synergies.map(s => (
                <div key={s.id} className="bg-[#b8f53d]/10 border border-[#b8f53d]/20 text-[#b8f53d] text-[10px] px-3 py-1 rounded-full font-bold">
                  {s.icon} {s.name}
                </div>
              ))}
            </div>
          )
        })()}

        {/* My board */}
        <div className="flex justify-center gap-3 min-h-[170px] items-start px-4">
          {myPlayer.board.map((card, i) => (
            <PvPCard key={card.id} card={card}
              onClick={() => handleCreatureClick(i, false)}
              isActive={selectedCreature === i} />
          ))}
          {myPlayer.board.length === 0 && <div className="text-gray-700 text-sm italic py-12">Play cards from your hand</div>}
        </div>

        {/* My hand */}
        <div className="flex justify-center gap-1 mt-1 pb-1">
          {myPlayer.hand.map((card, i) => {
            const cost = engineRef.current?.getEffectiveCost(playerIndex, card) ?? card.cost
            const canPlay = isMyTurn && gameState.phase === 'main' && cost <= myPlayer.mana && myPlayer.board.length < 5
            return (
              <div key={card.id} onClick={() => canPlay && handlePlayCard(i)}
                className={`${canPlay ? 'cursor-pointer hover:scale-110 hover:-translate-y-3' : 'opacity-40 cursor-not-allowed'} transition-all`}>
                <PvPCard card={card} small />
              </div>
            )
          })}
        </div>

        {/* Player bar */}
        <div className="flex items-center gap-4 px-4 py-2 rounded-xl bg-white/[0.02]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#b8f53d]/20 flex items-center justify-center text-lg">
              {playerIndex === 0 ? '🏠' : '👤'}
            </div>
            <div className="text-sm text-[#b8f53d] font-bold">You</div>
          </div>
          <div className="flex-1 max-w-xs"><HpBar hp={myPlayer.hp} /></div>
          <ManaBar current={myPlayer.mana} max={myPlayer.maxMana} />

          {isMyTurn && !gameState.gameOver && (
            <button onClick={handleAdvancePhase}
              className={`px-5 py-2.5 font-black rounded-xl text-sm transition-all hover:scale-105 ${
                gameState.phase === 'main' ? 'bg-orange-500 text-white' : 'bg-[#b8f53d] text-black'
              }`}>
              {gameState.phase === 'main' ? '⚔️ Attack' : '⏭ End Turn'}
            </button>
          )}

          {abilityMode && (
            <div className="text-yellow-400 text-xs animate-pulse font-bold">
              🎯 Select target for {abilityMode.ability}
              <button onClick={() => setAbilityMode(null)} className="ml-2 text-gray-400 hover:text-white">✕</button>
            </div>
          )}
          {selectedCreature !== null && gameState.phase === 'attack' && (
            <div className="text-[#b8f53d] text-xs animate-pulse font-bold">⚔️ Click enemy or click again for face</div>
          )}
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-56 bg-[#0d0d15] border-l border-gray-800/50 flex flex-col">
        <div className="p-3 border-b border-gray-800/50">
          <h3 className="text-[#b8f53d] font-black text-sm">📜 Battle Log</h3>
        </div>
        <div ref={logRef} className="flex-1 overflow-y-auto p-3 space-y-1 text-[10px] text-gray-500">
          {gameState.log.map((entry, i) => (
            <div key={i} className={`leading-relaxed ${
              entry.startsWith('---') || entry.startsWith('\n') ? 'text-[#b8f53d]/70 font-bold mt-2' :
              entry.includes('wins') ? 'text-yellow-400 font-bold' :
              entry.includes('destroyed') ? 'text-red-400' :
              entry.includes('played') ? 'text-[#b8f53d]/70' : ''
            }`}>{entry}</div>
          ))}
        </div>
        <div className="p-3 border-t border-gray-800/50 text-[10px] text-gray-600 space-y-1">
          <div>Your deck: {myPlayer.deck.length} | Grave: {myPlayer.graveyard.length}</div>
          <div>Enemy deck: {oppPlayer.deck.length}</div>
          <div className="text-[#b8f53d] font-bold">PvP — ELO on the line</div>
        </div>
      </div>
    </div>
  )
}
