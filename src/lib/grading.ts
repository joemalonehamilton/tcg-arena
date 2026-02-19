/**
 * PSA-Style Card Grading System
 * Every card pulled from a pack gets a condition grade.
 * Higher grades = rarer, visual upgrades, stat bonuses, collector value.
 */

export type Grade = 10 | 9 | 8 | 7 | 6 | 5

export interface GradeInfo {
  grade: Grade
  label: string
  shortLabel: string
  chance: number // cumulative threshold
  statBonus: number // +attack/+toughness
  borderCSS: string
  badgeColor: string
  glow: string
  emoji: string
}

export const GRADES: GradeInfo[] = [
  {
    grade: 10,
    label: 'Gem Mint',
    shortLabel: 'PSA 10',
    chance: 0.01, // 1%
    statBonus: 1,
    borderCSS: 'ring-2 ring-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.6)]',
    badgeColor: 'bg-yellow-400 text-black',
    glow: 'rgba(250,204,21,0.6)',
    emoji: '💎',
  },
  {
    grade: 9,
    label: 'Mint',
    shortLabel: 'PSA 9',
    chance: 0.06, // 5%
    statBonus: 0,
    borderCSS: 'ring-2 ring-blue-400 shadow-[0_0_12px_rgba(96,165,250,0.4)]',
    badgeColor: 'bg-blue-400 text-black',
    glow: 'rgba(96,165,250,0.4)',
    emoji: '✨',
  },
  {
    grade: 8,
    label: 'Near Mint',
    shortLabel: 'PSA 8',
    chance: 0.21, // 15%
    statBonus: 0,
    borderCSS: 'ring-1 ring-green-400/50',
    badgeColor: 'bg-green-600 text-white',
    glow: 'rgba(74,222,128,0.2)',
    emoji: '🟢',
  },
  {
    grade: 7,
    label: 'Excellent',
    shortLabel: 'PSA 7',
    chance: 0.51, // 30%
    statBonus: 0,
    borderCSS: '',
    badgeColor: 'bg-zinc-600 text-white',
    glow: 'none',
    emoji: '',
  },
  {
    grade: 6,
    label: 'Good',
    shortLabel: 'PSA 6',
    chance: 0.76, // 25%
    statBonus: 0,
    borderCSS: '',
    badgeColor: 'bg-zinc-700 text-zinc-300',
    glow: 'none',
    emoji: '',
  },
  {
    grade: 5,
    label: 'Fair',
    shortLabel: 'PSA 5',
    chance: 1.0, // 24%
    statBonus: 0,
    borderCSS: '',
    badgeColor: 'bg-zinc-800 text-zinc-400',
    glow: 'none',
    emoji: '',
  },
]

export function rollGrade(): GradeInfo {
  const r = Math.random()
  for (const g of GRADES) {
    if (r < g.chance) return g
  }
  return GRADES[GRADES.length - 1]
}

export function getGradeInfo(grade: Grade): GradeInfo {
  return GRADES.find(g => g.grade === grade) || GRADES[GRADES.length - 1]
}

/** Combined rarity label e.g. "PSA 10 Legendary" */
export function gradeRarityLabel(grade: Grade, rarity: string): string {
  const info = getGradeInfo(grade)
  if (grade >= 8) return `${info.shortLabel} ${rarity.charAt(0).toUpperCase() + rarity.slice(1)}`
  return rarity.charAt(0).toUpperCase() + rarity.slice(1)
}

/** Multiplier for token value / crafting cost based on grade */
export function gradeValueMultiplier(grade: Grade): number {
  switch (grade) {
    case 10: return 10
    case 9: return 3
    case 8: return 1.5
    case 7: return 1
    case 6: return 0.8
    case 5: return 0.5
  }
}
