import { sampleCards, monadMonsterCards } from '@/components/SampleCards'

const allCards = [...sampleCards, ...monadMonsterCards]

export interface Reward {
  name: string
  rarity: string
}

function pickRandom(rarity: string): Reward | null {
  const pool = allCards.filter(c => c.rarity === rarity)
  if (!pool.length) return null
  const card = pool[Math.floor(Math.random() * pool.length)]
  return { name: card.name, rarity: card.rarity }
}

export function calculateRewards(won: boolean, turns: number): Reward[] {
  const rewards: Reward[] = []

  if (won) {
    // Win: 1 uncommon + 1 common
    const uc = pickRandom('uncommon')
    const co = pickRandom('common')
    if (uc) rewards.push(uc)
    if (co) rewards.push(co)
  } else {
    // Loss: 1 common
    const co = pickRandom('common')
    if (co) rewards.push(co)
  }

  // Bonus: 10+ turns → extra common
  if (turns >= 10) {
    const bonus = pickRandom('common')
    if (bonus) rewards.push(bonus)
  }

  return rewards
}

export function addRewardsToCollection(rewards: Reward[]) {
  try {
    const saved = localStorage.getItem('tcg-collection')
    const collection: Record<string, number> = saved ? JSON.parse(saved) : {}
    rewards.forEach(r => {
      collection[r.name] = (collection[r.name] || 0) + 1
    })
    localStorage.setItem('tcg-collection', JSON.stringify(collection))
    return collection
  } catch {
    return {}
  }
}
