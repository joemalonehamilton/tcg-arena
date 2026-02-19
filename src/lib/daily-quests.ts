/**
 * Daily Quests — engagement hooks that drive gameplay + token economy
 */

export interface Quest {
  id: string
  title: string
  description: string
  target: number
  reward: number // ARENA tokens
  type: 'games' | 'wins' | 'damage' | 'cards_played' | 'abilities' | 'craft' | 'packs'
  icon: string
}

// Pool of possible daily quests — 3 are assigned each day
const QUEST_POOL: Quest[] = [
  { id: 'play3', title: 'Battle Ready', description: 'Play 3 games', target: 3, reward: 15, type: 'games', icon: '⚔️' },
  { id: 'win2', title: 'Victorious', description: 'Win 2 games', target: 2, reward: 25, type: 'wins', icon: '🏆' },
  { id: 'dmg50', title: 'Heavy Hitter', description: 'Deal 50 total damage', target: 50, reward: 20, type: 'damage', icon: '💥' },
  { id: 'cards15', title: 'Card Slinger', description: 'Play 15 cards in games', target: 15, reward: 15, type: 'cards_played', icon: '🃏' },
  { id: 'abilities5', title: 'Ability Master', description: 'Use 5 abilities', target: 5, reward: 20, type: 'abilities', icon: '✨' },
  { id: 'craft1', title: 'Forgekeeper', description: 'Craft 1 card', target: 1, reward: 30, type: 'craft', icon: '🔥' },
  { id: 'pack2', title: 'Pack Rat', description: 'Open 2 packs', target: 2, reward: 10, type: 'packs', icon: '📦' },
  { id: 'win_degen', title: 'Degen Slayer', description: 'Beat Degen AI', target: 1, reward: 40, type: 'wins', icon: '💀' },
  { id: 'dmg100', title: 'Devastator', description: 'Deal 100 total damage', target: 100, reward: 35, type: 'damage', icon: '🔥' },
  { id: 'play5', title: 'Grinder', description: 'Play 5 games', target: 5, reward: 25, type: 'games', icon: '📊' },
]

export interface DailyQuestState {
  date: string
  quests: { quest: Quest; progress: number; claimed: boolean }[]
}

function getDateKey(): string {
  return new Date().toISOString().split('T')[0]
}

function seededShuffle(arr: Quest[], seed: number): Quest[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    seed = (seed * 16807) % 2147483647
    const j = seed % (i + 1);
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function getDailyQuests(): DailyQuestState {
  const dateKey = getDateKey()
  const storageKey = 'tcg-daily-quests'

  try {
    const saved = localStorage.getItem(storageKey)
    if (saved) {
      const state: DailyQuestState = JSON.parse(saved)
      if (state.date === dateKey) return state
    }
  } catch {}

  // Generate new quests for today (seeded by date for consistency)
  const seed = dateKey.split('-').reduce((a, b) => a + parseInt(b), 0) * 31337
  const shuffled = seededShuffle(QUEST_POOL, seed)
  const todayQuests = shuffled.slice(0, 3)

  const state: DailyQuestState = {
    date: dateKey,
    quests: todayQuests.map(q => ({ quest: q, progress: 0, claimed: false })),
  }

  localStorage.setItem(storageKey, JSON.stringify(state))
  return state
}

export function updateQuestProgress(type: string, amount: number = 1): void {
  const state = getDailyQuests()
  let changed = false
  for (const q of state.quests) {
    if (q.quest.type === type && !q.claimed) {
      q.progress = Math.min(q.progress + amount, q.quest.target)
      changed = true
    }
  }
  if (changed) {
    localStorage.setItem('tcg-daily-quests', JSON.stringify(state))
  }
}

export function claimQuest(questId: string): number {
  const state = getDailyQuests()
  const quest = state.quests.find(q => q.quest.id === questId)
  if (!quest || quest.claimed || quest.progress < quest.quest.target) return 0

  quest.claimed = true
  localStorage.setItem('tcg-daily-quests', JSON.stringify(state))
  return quest.quest.reward
}
