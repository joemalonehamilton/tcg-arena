import { GameCard, makeCard } from './types'
import { runFullGame } from './engine'
import { buildDeck } from './deck-builder'

// Sample card pool inspired by Monad monsters + other rounds
const cardPool: GameCard[] = [
  // Creatures - cheap
  makeCard({ name: 'Blob Validator', type: 'creature', cost: 1, power: 1, toughness: 2, abilities: [] }),
  makeCard({ name: 'Gas Guzzler', type: 'creature', cost: 2, power: 2, toughness: 2, abilities: [] }),
  makeCard({ name: 'Shard Sprite', type: 'creature', cost: 1, power: 1, toughness: 1, abilities: ['flying'] }),
  makeCard({ name: 'Consensus Crab', type: 'creature', cost: 2, power: 1, toughness: 3, abilities: ['defender'] }),
  makeCard({ name: 'Mempool Mouse', type: 'creature', cost: 1, power: 1, toughness: 1, abilities: ['haste'] }),

  // Creatures - mid
  makeCard({ name: 'Block Builder', type: 'creature', cost: 3, power: 3, toughness: 3, abilities: [] }),
  makeCard({ name: 'Chain Golem', type: 'creature', cost: 4, power: 4, toughness: 3, abilities: ['trample'] }),
  makeCard({ name: 'Finality Phoenix', type: 'creature', cost: 4, power: 3, toughness: 2, abilities: ['flying', 'haste'] }),
  makeCard({ name: 'Merkle Guardian', type: 'creature', cost: 3, power: 2, toughness: 4, abilities: ['reach'] }),
  makeCard({ name: 'Rollup Rider', type: 'creature', cost: 3, power: 3, toughness: 2, abilities: ['first_strike'] }),

  // Creatures - expensive
  makeCard({ name: 'Nadzilla', type: 'creature', cost: 7, power: 7, toughness: 7, abilities: ['trample'] }),
  makeCard({ name: 'Monad Titan', type: 'creature', cost: 8, power: 8, toughness: 8, abilities: ['trample', 'menace'] }),
  makeCard({ name: 'Parallel Wyrm', type: 'creature', cost: 6, power: 5, toughness: 5, abilities: ['flying'] }),
  makeCard({ name: 'Execution Dragon', type: 'creature', cost: 5, power: 5, toughness: 4, abilities: ['flying', 'first_strike'] }),

  // Spells
  makeCard({ name: 'Lightning Bolt', type: 'spell', cost: 1, power: 3, toughness: null, abilities: [] }),
  makeCard({ name: 'Chain Heal', type: 'spell', cost: 2, power: null, toughness: 4, abilities: [] }),
  makeCard({ name: 'Forked Strike', type: 'spell', cost: 3, power: 4, toughness: null, abilities: [] }),
  makeCard({ name: 'Reorg Blast', type: 'spell', cost: 5, power: 6, toughness: null, abilities: [] }),

  // Artifacts
  makeCard({ name: 'Validator Shield', type: 'artifact', cost: 2, power: null, toughness: null, abilities: [] }),
  makeCard({ name: 'Speed Boots', type: 'artifact', cost: 3, power: null, toughness: null, abilities: [] }),

  // Terrains
  makeCard({ name: 'Monad Nexus', type: 'terrain', cost: 4, power: null, toughness: null, abilities: [] }),
]

// Build two decks
const deck1 = buildDeck(cardPool, 20)
const deck2 = buildDeck(cardPool, 20)

console.log('=== TCG ARENA - BATTLE SIMULATION ===\n')
console.log(`Deck 1 (${deck1.length} cards): ${deck1.map(c => c.name).join(', ')}`)
console.log(`Deck 2 (${deck2.length} cards): ${deck2.map(c => c.name).join(', ')}`)
console.log('\n--- BATTLE BEGIN ---\n')

const result = runFullGame(deck1, deck2)

// Print log
let lastTurn = 0
for (const event of result.log) {
  if (event.turn !== lastTurn) {
    console.log(`\n=== Turn ${event.turn} ===`)
    lastTurn = event.turn
  }
  console.log(`  ${event.details}`)
}

console.log(`\n--- RESULT ---`)
console.log(`Winner: ${result.winner}`)
console.log(`Loser: ${result.loser}`)
console.log(`Total turns: ${result.turns}`)
console.log(`Final HP: Player 1 = ${result.finalState.players[0].hp}, Player 2 = ${result.finalState.players[1].hp}`)
