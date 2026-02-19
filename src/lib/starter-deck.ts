/**
 * Starter deck — given to new players automatically.
 * 15 cards: 6 common, 4 uncommon, 3 rare, 2 legendary
 * Good mana curve with varied abilities.
 */

export interface StarterCard {
  name: string
  quantity: number
}

export function getStarterDeck(): StarterCard[] {
  return [
    // Commons (6) — cheap drops
    { name: 'Gas Gremlin', quantity: 2 },
    { name: 'Block Bunny', quantity: 2 },
    { name: 'Mempool Lurker', quantity: 1 },
    { name: 'Blob Validator', quantity: 1 },
    // Uncommons (4) — mid-game
    { name: 'Ser Greencandle', quantity: 1 },
    { name: 'Sandwich Bot', quantity: 1 },
    { name: 'BFT Crab', quantity: 1 },
    { name: 'Octoracle', quantity: 1 },
    // Rares (3) — power plays
    { name: 'Rugpull Dragon', quantity: 1 },
    { name: 'The Deployer', quantity: 1 },
    { name: 'Shard Wyrm', quantity: 1 },
    // Legendaries (2) — finishers
    { name: 'Frozen Liquidity', quantity: 1 },
    { name: 'Phantom Finalizer', quantity: 1 },
  ]
}

export function grantStarterDeck() {
  try {
    const existing = localStorage.getItem('tcg-decks')
    const decks = existing ? JSON.parse(existing) : []
    if (decks.some((d: { name: string }) => d.name === 'Starter Deck')) return false

    // Grant cards to collection
    const saved = localStorage.getItem('tcg-collection')
    const collection: Record<string, number> = saved ? JSON.parse(saved) : {}
    const starterCards = getStarterDeck()
    starterCards.forEach(sc => {
      collection[sc.name] = Math.max(collection[sc.name] || 0, sc.quantity)
    })
    localStorage.setItem('tcg-collection', JSON.stringify(collection))

    // Create the deck
    const deck = {
      id: crypto.randomUUID(),
      name: 'Starter Deck',
      cards: starterCards,
      createdAt: new Date().toISOString(),
    }
    decks.push(deck)
    localStorage.setItem('tcg-decks', JSON.stringify(decks))
    return true
  } catch {
    return false
  }
}
