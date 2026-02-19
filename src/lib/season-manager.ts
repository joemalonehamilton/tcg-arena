import { getSeason, setSeason, addActivity, broadcast } from './db'
import { sealCurrentSet } from './seal'
import type { Season } from '@/types'

const DEFAULT_DURATION_MS = 72 * 60 * 60 * 1000 // 72 hours

let sealTimer: ReturnType<typeof setTimeout> | null = null

export function getSeasonStatus(): Season {
  const season = getSeason()
  return season
}

export function startSeason(durationMs?: number): Season {
  const season = getSeason()
  if (season.state !== 'WAITING') {
    throw new Error(`Cannot start season in state: ${season.state}`)
  }

  const duration = durationMs ?? DEFAULT_DURATION_MS
  const now = Date.now()

  const newSeason: Season = {
    id: `season-${now}`,
    state: 'ACTIVE',
    startedAt: now,
    endsAt: now + duration,
    cardCount: 0,
    agentCount: season.agentCount,
  }

  setSeason(newSeason)
  addActivity({ type: 'season_start', message: `Season started! Ends in ${Math.round(duration / 3600000)}h` })
  broadcast({ type: 'season_change', payload: newSeason })

  sealTimer = setTimeout(() => {
    triggerSeal()
  }, duration)

  return newSeason
}

export async function triggerSeal(): Promise<Season> {
  const season = getSeason()
  if (season.state !== 'ACTIVE') {
    throw new Error(`Cannot seal in state: ${season.state}`)
  }

  if (sealTimer) {
    clearTimeout(sealTimer)
    sealTimer = null
  }

  setSeason({ ...season, state: 'SEALING' })
  broadcast({ type: 'season_change', payload: getSeason() })
  addActivity({ type: 'season_seal', message: 'Sealing the set...' })

  try {
    const { hash, txHash, tokenAddress } = await sealCurrentSet()
    const sealed: Season = {
      ...getSeason(),
      state: 'SEALED',
      sealedAt: Date.now(),
      sealHash: hash,
      txHash,
      tokenAddress,
    }
    setSeason(sealed)
    broadcast({ type: 'season_change', payload: sealed })
    addActivity({ type: 'season_seal', message: `Set sealed! Hash: ${hash.slice(0, 16)}...` })
    return sealed
  } catch (err) {
    setSeason({ ...season, state: 'ACTIVE' })
    throw err
  }
}

export function resetSeason(): void {
  if (sealTimer) {
    clearTimeout(sealTimer)
    sealTimer = null
  }
  setSeason({
    id: 'season-0',
    state: 'WAITING',
    cardCount: 0,
    agentCount: 0,
  })
}
