import { GameCard, MatchResult, TournamentResult, makeCard } from './types'
import { runFullGame } from './engine'
import { buildDeck } from './deck-builder'

export function simulateMatch(deck1: GameCard[], deck2: GameCard[], games: number = 10): MatchResult {
  const results = []
  let d1Wins = 0
  let d2Wins = 0
  let totalTurns = 0

  for (let i = 0; i < games; i++) {
    const result = runFullGame(deck1, deck2)
    results.push(result)
    if (result.winner === 'Player 1') d1Wins++
    else d2Wins++
    totalTurns += result.turns
  }

  return {
    deck1Wins: d1Wins,
    deck2Wins: d2Wins,
    games: results,
    avgTurns: totalTurns / games,
  }
}

export function simulateTournament(
  cards: GameCard[],
  gamesPerMatch: number = 10
): TournamentResult {
  // Build a deck around each unique card as the "star"
  const uniqueNames = [...new Set(cards.map(c => c.name))]
  const decks = new Map<string, GameCard[]>()

  for (const name of uniqueNames) {
    const starCards = cards.filter(c => c.name === name)
    const otherCards = cards.filter(c => c.name !== name)
    // Build deck with star card + others
    const pool = [...starCards, ...starCards, ...otherCards] // double up star card
    decks.set(name, buildDeck(pool, 20))
  }

  const wins = new Map<string, number>()
  const losses = new Map<string, number>()
  const matchResults: TournamentResult['matchResults'] = []

  for (const name of uniqueNames) {
    wins.set(name, 0)
    losses.set(name, 0)
  }

  // Round robin
  const names = [...uniqueNames]
  for (let i = 0; i < names.length; i++) {
    for (let j = i + 1; j < names.length; j++) {
      const d1 = decks.get(names[i])!
      const d2 = decks.get(names[j])!
      const result = simulateMatch(d1, d2, gamesPerMatch)

      matchResults.push({ deck1Name: names[i], deck2Name: names[j], result })

      wins.set(names[i], (wins.get(names[i]) || 0) + result.deck1Wins)
      losses.set(names[i], (losses.get(names[i]) || 0) + result.deck2Wins)
      wins.set(names[j], (wins.get(names[j]) || 0) + result.deck2Wins)
      losses.set(names[j], (losses.get(names[j]) || 0) + result.deck1Wins)
    }
  }

  const rankings = names.map(name => {
    const w = wins.get(name) || 0
    const l = losses.get(name) || 0
    return { cardName: name, wins: w, losses: l, winRate: w / (w + l) || 0 }
  }).sort((a, b) => b.winRate - a.winRate)

  return {
    rankings,
    mvpCards: rankings.slice(0, 3).map(r => ({ name: r.cardName, kills: 0, damageDealt: 0 })),
    matchResults,
  }
}
