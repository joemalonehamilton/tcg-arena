/**
 * Token balance store — hybrid system
 * Connected wallet: balance from DB (server-side, persistent)
 * No wallet: localStorage for demo play, starts at 0
 */

const STORAGE_KEY = 'tcg-token-balance'
const WALLET_KEY = 'tcg-connected-wallet'

// --- Local balance (no wallet connected) ---

export function getBalance(): number {
  if (typeof window === 'undefined') return 0
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? parseInt(saved, 10) : 0
  } catch {
    return 0
  }
}

export function setBalance(amount: number): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, String(Math.max(0, amount)))
}

export function spend(amount: number): boolean {
  const bal = getBalance()
  if (bal < amount) return false
  setBalance(bal - amount)
  return true
}

export function earn(amount: number): void {
  setBalance(getBalance() + amount)
}

export function initBalance(): void {
  if (typeof window === 'undefined') return
  if (!localStorage.getItem(STORAGE_KEY)) {
    setBalance(0) // Start at 0 — earn through gameplay
  }
}

// --- Wallet-connected balance (DB-backed) ---

export function getConnectedWallet(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(WALLET_KEY)
}

export function setConnectedWallet(wallet: string | null): void {
  if (typeof window === 'undefined') return
  if (wallet) {
    localStorage.setItem(WALLET_KEY, wallet)
  } else {
    localStorage.removeItem(WALLET_KEY)
  }
}

export async function fetchWalletBalance(wallet: string): Promise<number> {
  try {
    const res = await fetch(`/api/tokens?wallet=${wallet}`)
    const data = await res.json()
    return data.balance || 0
  } catch {
    return 0
  }
}

export async function spendFromWallet(wallet: string, amount: number, reason: string): Promise<{ success: boolean; balance: number }> {
  try {
    const res = await fetch('/api/tokens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wallet, amount, reason, type: 'spend' }),
    })
    const data = await res.json()
    if (data.error) return { success: false, balance: data.balance || 0 }
    return { success: true, balance: data.balance }
  } catch {
    return { success: false, balance: 0 }
  }
}

export async function earnToWallet(wallet: string, amount: number, reason: string): Promise<number> {
  try {
    const res = await fetch('/api/tokens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wallet, amount, reason, type: 'earn' }),
    })
    const data = await res.json()
    return data.balance || 0
  } catch {
    return 0
  }
}
