/**
 * ELO Rating Store — hybrid local/server system
 * Connected wallet: ELO persisted to DB
 * No wallet: localStorage for demo play
 */

import { ELO_CONFIG, calculateEloChange } from './token-economy'

const ELO_KEY = 'tcg-elo-rating'

// --- Local ELO (no wallet) ---

export function getLocalElo(): number {
  if (typeof window === 'undefined') return ELO_CONFIG.STARTING_ELO
  try {
    const saved = localStorage.getItem(ELO_KEY)
    return saved ? parseInt(saved, 10) : ELO_CONFIG.STARTING_ELO
  } catch {
    return ELO_CONFIG.STARTING_ELO
  }
}

export function setLocalElo(elo: number): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(ELO_KEY, String(Math.max(ELO_CONFIG.MIN_ELO, elo)))
}

export function applyLocalElo(won: boolean, difficulty: 'rookie' | 'veteran' | 'degen'): number {
  const change = calculateEloChange(won, difficulty)
  const newElo = Math.max(ELO_CONFIG.MIN_ELO, getLocalElo() + change)
  setLocalElo(newElo)
  return change
}

// --- Wallet-connected ELO (DB-backed) ---

export async function fetchWalletElo(wallet: string): Promise<number> {
  try {
    const res = await fetch(`/api/elo?wallet=${wallet}`)
    const data = await res.json()
    return data.elo ?? ELO_CONFIG.STARTING_ELO
  } catch {
    return ELO_CONFIG.STARTING_ELO
  }
}

export async function updateWalletElo(
  wallet: string,
  won: boolean,
  difficulty: 'rookie' | 'veteran' | 'degen'
): Promise<{ elo: number; change: number }> {
  try {
    const res = await fetch('/api/elo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wallet, won, difficulty }),
    })
    const data = await res.json()
    return { elo: data.elo ?? ELO_CONFIG.STARTING_ELO, change: data.change ?? 0 }
  } catch {
    return { elo: ELO_CONFIG.STARTING_ELO, change: 0 }
  }
}
