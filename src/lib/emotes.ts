/**
 * In-game emotes — used during matches
 */

export interface Emote {
  id: string
  emoji: string
  text: string
  category: 'taunt' | 'respect' | 'react'
}

export const DEFAULT_EMOTES: Emote[] = [
  { id: 'gm', emoji: '☀️', text: 'GM', category: 'respect' },
  { id: 'gg', emoji: '🤝', text: 'GG', category: 'respect' },
  { id: 'nice', emoji: '👏', text: 'Nice play', category: 'respect' },
  { id: 'think', emoji: '🤔', text: 'Hmm...', category: 'react' },
  { id: 'rekt', emoji: '💀', text: 'REKT', category: 'taunt' },
  { id: 'pump', emoji: '📈', text: 'PUMP IT', category: 'taunt' },
]

export const PREMIUM_EMOTES: Emote[] = [
  { id: 'rug', emoji: '🪤', text: 'RUG PULL', category: 'taunt' },
  { id: 'diamond', emoji: '💎', text: 'DIAMOND HANDS', category: 'respect' },
  { id: 'moon', emoji: '🌙', text: 'TO THE MOON', category: 'taunt' },
  { id: 'cope', emoji: '🧢', text: 'COPE', category: 'taunt' },
  { id: 'wagmi', emoji: '🫡', text: 'WAGMI', category: 'respect' },
  { id: 'ngmi', emoji: '📉', text: 'NGMI', category: 'taunt' },
]
