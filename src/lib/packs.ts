import { sampleCards, monadMonsterCards, type SampleCard } from '@/components/SampleCards'
import { rollGrade, type Grade, type GradeInfo } from '@/lib/grading'

export interface PackCard {
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

export interface Pack {
  id: string
  name: string
  cost: number
  cardCount: number
  guaranteedRarity?: string
}

const allCards = [...sampleCards, ...monadMonsterCards]

function toPackCard(c: SampleCard): PackCard {
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

function pickByRarity(pool: SampleCard[], rarity: string): PackCard {
  const filtered = pool.filter(c => c.rarity === rarity)
  return toPackCard(filtered[Math.floor(Math.random() * filtered.length)])
}

function pickWeighted(pool: SampleCard[]): PackCard {
  const r = Math.random()
  let rarity: string
  // Legendary = 0.01% (1/10000), Rare = 2%, Uncommon = 18%, Common = ~80%
  if (r < 0.7992) rarity = 'common'
  else if (r < 0.9792) rarity = 'uncommon'
  else if (r < 0.9999) rarity = 'rare'
  else rarity = 'legendary'
  const filtered = pool.filter(c => c.rarity === rarity)
  if (filtered.length === 0) return pickWeighted(pool)
  return toPackCard(filtered[Math.floor(Math.random() * filtered.length)])
}

export function openPack(packType: string): PackCard[] {
  switch (packType) {
    case 'standard': {
      // 5 cards: 3 common, 1 uncommon, 1 weighted (mostly common/uncommon)
      const cards: PackCard[] = []
      for (let i = 0; i < 3; i++) cards.push(pickByRarity(allCards, 'common'))
      cards.push(pickByRarity(allCards, 'uncommon'))
      cards.push(pickWeighted(allCards))
      return cards
    }
    case 'premium': {
      // 5 cards: 2 uncommon, 2 rare, 1 weighted with slightly better odds
      const cards: PackCard[] = []
      for (let i = 0; i < 2; i++) cards.push(pickByRarity(allCards, 'uncommon'))
      for (let i = 0; i < 2; i++) cards.push(pickByRarity(allCards, 'rare'))
      // Premium last slot: 0.1% legendary (1/1000)
      cards.push(Math.random() < 0.001 ? pickByRarity(allCards, 'legendary') : pickByRarity(allCards, 'rare'))
      return cards
    }
    case 'monad': {
      // 3 cards: all weighted from monad pool
      const pool = monadMonsterCards
      const cards: PackCard[] = []
      for (let i = 0; i < 3; i++) cards.push(pickWeighted(pool))
      return cards
    }
    default:
      return openPack('standard')
  }
}

export function getAvailablePacks(): Pack[] {
  // Costs are dynamic — use getPackCost() from token-economy.ts for actual prices
  // These are base costs for display reference only
  return [
    { id: 'standard', name: 'Standard Pack', cost: 5000, cardCount: 5, guaranteedRarity: 'uncommon' },
    { id: 'premium', name: 'Premium Pack', cost: 15000, cardCount: 5, guaranteedRarity: 'rare' },
    { id: 'monad', name: 'Monad Pack', cost: 10000, cardCount: 3 },
  ]
}
