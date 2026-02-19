export const COLORS = {
  bg: '#0a0f0a',
  accent: '#b8f53d',
  accentDim: 'rgba(184,245,61,0.15)',
  white: '#ffffff',
  gray: '#6b7280',
  darkGray: '#1a2a1a',
  
  // Rarity
  common: '#6b7280',
  uncommon: '#22c55e',
  rare: '#a855f7',
  epic: '#3b82f6',
  legendary: '#f59e0b',
  mythic: '#ff0040',
} as const

export const RARITY_GLOW: Record<string, string> = {
  common: '0 0 20px rgba(107,114,128,0.3)',
  uncommon: '0 0 30px rgba(34,197,94,0.4)',
  rare: '0 0 40px rgba(168,85,247,0.5)',
  epic: '0 0 50px rgba(59,130,246,0.5)',
  legendary: '0 0 60px rgba(245,158,11,0.6), 0 0 120px rgba(245,158,11,0.2)',
  mythic: '0 0 80px rgba(255,0,64,0.7), 0 0 160px rgba(255,0,64,0.3)',
}

export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

export function easeOutBack(t: number): number {
  const c1 = 1.70158
  const c3 = c1 + 1
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
}
