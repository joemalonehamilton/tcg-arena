/**
 * Versioned card set state management.
 * Tracks canonical cards and version history.
 */

import { cards, getSeason, setSeason } from './db'
import type { Card } from '@/types'
import type { CardInput } from './card-schema'

let setVersion = 0

// Version history: cardId → array of past versions
const versionHistory = new Map<string, Card[]>()

export function getSetVersion(): number {
  return setVersion
}

export function getAllCards(): Card[] {
  return Array.from(cards.values())
}

export function getCard(id: string): Card | undefined {
  return cards.get(id)
}

export function getCardHistory(id: string): Card[] {
  return versionHistory.get(id) ?? []
}

export function getCardsByAgent(agentId: string): Card[] {
  return Array.from(cards.values()).filter(c => c.designedBy === agentId)
}

export function addCard(input: CardInput, agentId: string): Card {
  const now = Date.now()
  const card: Card = {
    id: crypto.randomUUID(),
    ...input,
    abilities: input.abilities ?? [],
    flavor: input.flavor ?? '',
    designedBy: agentId,
    version: 1,
    createdAt: now,
    modifiedAt: now,
  }

  cards.set(card.id, card)
  versionHistory.set(card.id, [])
  setVersion++

  const season = getSeason()
  setSeason({ ...season, cardCount: cards.size })

  return card
}

export function modifyCard(cardId: string, changes: Partial<CardInput>, agentId: string): Card {
  const existing = cards.get(cardId)
  if (!existing) throw new Error(`Card not found: ${cardId}`)

  // Save current version to history
  const history = versionHistory.get(cardId) ?? []
  history.push({ ...existing })
  versionHistory.set(cardId, history)

  const updated: Card = {
    ...existing,
    ...changes,
    version: existing.version + 1,
    modifiedAt: Date.now(),
  }

  cards.set(cardId, updated)
  setVersion++
  return updated
}

export function getSetSnapshot(): { version: number; cards: Card[]; timestamp: number } {
  return {
    version: setVersion,
    cards: getAllCards(),
    timestamp: Date.now(),
  }
}

export async function generateSealedJson(): Promise<{ json: string; hash: string }> {
  const snapshot = getSetSnapshot()
  const json = JSON.stringify(snapshot, null, 2)
  const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(json))
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hash = '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  return { json, hash }
}
