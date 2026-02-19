import { GameCard, cloneCard } from './types'

export function buildDeck(cardPool: GameCard[], deckSize: number = 20): GameCard[] {
  const deck: GameCard[] = []
  const cardCounts = new Map<string, number>()

  // Separate by type
  const creatures = cardPool.filter(c => c.type === 'creature')
  const spells = cardPool.filter(c => c.type === 'spell')
  const other = cardPool.filter(c => c.type === 'artifact' || c.type === 'terrain')

  const targetCreatures = Math.round(deckSize * 0.6)
  const targetSpells = Math.round(deckSize * 0.25)
  const targetOther = deckSize - targetCreatures - targetSpells

  // Build mana curve for creatures: prefer a spread
  const addCards = (pool: GameCard[], count: number) => {
    // Sort by cost for curve
    const sorted = [...pool].sort((a, b) => a.cost - b.cost)
    let added = 0

    // Pass 1: one of each
    for (const card of sorted) {
      if (added >= count) break
      const n = cardCounts.get(card.name) || 0
      if (n >= 2) continue
      const c = cloneCard(card)
      c.id = crypto.randomUUID()
      deck.push(c)
      cardCounts.set(card.name, n + 1)
      added++
    }

    // Pass 2: fill with second copies, prefer low-cost
    for (const card of sorted) {
      if (added >= count) break
      const n = cardCounts.get(card.name) || 0
      if (n >= 2) continue
      const c = cloneCard(card)
      c.id = crypto.randomUUID()
      deck.push(c)
      cardCounts.set(card.name, n + 1)
      added++
    }
  }

  addCards(creatures, targetCreatures)
  addCards(spells, targetSpells)
  addCards(other, targetOther)

  // If deck is short, add more creatures
  while (deck.length < deckSize && creatures.length > 0) {
    const card = creatures[Math.floor(Math.random() * creatures.length)]
    const n = cardCounts.get(card.name) || 0
    if (n < 2) {
      const c = cloneCard(card)
      c.id = crypto.randomUUID()
      deck.push(c)
      cardCounts.set(card.name, n + 1)
    } else {
      break
    }
  }

  return deck
}
