/**
 * Server-safe pack opening — no React dependencies.
 * Used by /api/pulls/mint for authoritative card generation.
 */
import { sampleCards, monadMonsterCards, type CardData } from '@/lib/card-data'
import { rollGrade, type Grade, type GradeInfo } from '@/lib/grading'

export interface ServerPackCard {
  name: string
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary' | 'mythic'
  imageUrl: string
  power: number
  toughness: number
  cost: number
  type: string
  abilities: string[]
  flavor: string
  grade: Grade
  gradeInfo: GradeInfo
}

const allCards = [...sampleCards, ...monadMonsterCards]

function toPackCard(c: CardData): ServerPackCard {
  const gi = rollGrade()
  return {
    name: c.name,
    rarity: c.rarity,
    imageUrl: c.imageUrl || '',
    power: c.power + gi.statBonus,
    toughness: c.toughness + gi.statBonus,
    cost: c.cost,
    type: c.type,
    abilities: c.abilities,
    flavor: c.flavor,
    grade: gi.grade,
    gradeInfo: gi,
  }
}

function pickByRarity(pool: CardData[], rarity: string): ServerPackCard {
  const filtered = pool.filter(c => c.rarity === rarity)
  return toPackCard(filtered[Math.floor(Math.random() * filtered.length)])
}

function pickWeighted(pool: CardData[]): ServerPackCard {
  const r = Math.random()
  let rarity: string
  if (r < 0.7992) rarity = 'common'
  else if (r < 0.9792) rarity = 'uncommon'
  else if (r < 0.9999) rarity = 'rare'
  else rarity = 'legendary'
  const filtered = pool.filter(c => c.rarity === rarity)
  if (filtered.length === 0) return pickWeighted(pool)
  return toPackCard(filtered[Math.floor(Math.random() * filtered.length)])
}

export function openPackServer(packType: string): ServerPackCard[] {
  switch (packType) {
    case 'standard': {
      const cards: ServerPackCard[] = []
      for (let i = 0; i < 3; i++) cards.push(pickByRarity(allCards, 'common'))
      cards.push(pickByRarity(allCards, 'uncommon'))
      cards.push(pickWeighted(allCards))
      return cards
    }
    case 'premium': {
      const cards: ServerPackCard[] = []
      for (let i = 0; i < 2; i++) cards.push(pickByRarity(allCards, 'uncommon'))
      for (let i = 0; i < 2; i++) cards.push(pickByRarity(allCards, 'rare'))
      cards.push(Math.random() < 0.001 ? pickByRarity(allCards, 'legendary') : pickByRarity(allCards, 'rare'))
      return cards
    }
    case 'monad': {
      const pool = monadMonsterCards
      const cards: ServerPackCard[] = []
      for (let i = 0; i < 3; i++) cards.push(pickWeighted(pool))
      return cards
    }
    default:
      return openPackServer('standard')
  }
}
