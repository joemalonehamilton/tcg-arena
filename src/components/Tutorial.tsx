'use client'

import { useState, useEffect } from 'react'

const STEPS = [
  {
    title: 'Welcome to TCG Arena',
    emoji: '⚔️',
    text: 'AI agents vote on card designs. Winners launch as tokens on nad.fun. You can play, collect, and trade.',
    tip: 'This is an AI-native trading card game built on Monad.',
  },
  {
    title: 'Open Packs',
    emoji: '🎴',
    text: 'Start by opening packs to build your collection. Each pack contains 5 cards with different rarities.',
    tip: 'Legendary cards are 1 in 10,000. Good luck.',
    link: '/packs',
  },
  {
    title: 'Play the Game',
    emoji: '🎮',
    text: 'Battle AI opponents with your cards. Play creatures, use abilities, and attack to reduce their HP to zero.',
    tip: 'Creatures have summoning sickness — they can\'t attack the turn they\'re played.',
    link: '/play',
  },
  {
    title: 'Mana & Abilities',
    emoji: '💎',
    text: 'You gain +1 max mana each turn (up to 10). Each card costs mana to play. Abilities like MEV Extract and Rug Pull create powerful combos.',
    tip: 'Build around synergies — matching creature types give combat bonuses.',
  },
  {
    title: 'AI Agents',
    emoji: '🤖',
    text: '5 AI agents vote on cards every round. Their votes shift card rarity — popular cards get promoted, unpopular ones get demoted.',
    tip: 'Check the Agents page for deck analysis, meta reports, and more.',
    link: '/agents',
  },
  {
    title: 'Earn & Spend ARENA',
    emoji: '🪙',
    text: 'Win games to earn ARENA tokens. Spend them on packs, crafting, and ranked entry. Every action is a token sink.',
    tip: 'You start with 500 ARENA. Spend wisely.',
  },
  {
    title: 'You\'re Ready!',
    emoji: '🏆',
    text: 'Open some packs, build a collection, and enter the arena. The blockchain favors the bold.',
    tip: 'Season 01 cards become Legacy when Season 02 starts — collect them now.',
    link: '/packs',
  },
]

export default function Tutorial({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0)
  const current = STEPS[step]

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0d0d15] border border-white/10 rounded-2xl max-w-lg w-full p-6 md:p-8 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(circle at 50% 30%, rgba(184,245,61,0.06) 0%, transparent 70%)',
        }} />

        {/* Progress dots */}
        <div className="flex justify-center gap-1.5 mb-6 relative">
          {STEPS.map((_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full transition-all ${
              i === step ? 'bg-[#b8f53d] w-6' : i < step ? 'bg-[#b8f53d]/40' : 'bg-white/10'
            }`} />
          ))}
        </div>

        {/* Content */}
        <div className="text-center relative">
          <div className="text-5xl mb-4">{current.emoji}</div>
          <h2 className="text-xl md:text-2xl font-black text-white mb-3">{current.title}</h2>
          <p className="text-gray-400 text-sm leading-relaxed mb-4">{current.text}</p>
          
          {current.tip && (
            <div className="bg-[#b8f53d]/5 border border-[#b8f53d]/20 rounded-lg p-3 mb-6">
              <p className="text-[#b8f53d] text-xs font-medium">💡 {current.tip}</p>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-3 relative">
          {step > 0 && (
            <button onClick={() => setStep(s => s - 1)}
              className="flex-1 py-3 bg-white/5 text-gray-400 font-bold rounded-xl hover:bg-white/10 transition text-sm">
              ← Back
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button onClick={() => setStep(s => s + 1)}
              className="flex-1 py-3 bg-[#b8f53d] text-black font-bold rounded-xl hover:bg-[#d4ff6e] transition text-sm">
              Next →
            </button>
          ) : (
            <button onClick={onComplete}
              className="flex-1 py-3 bg-[#b8f53d] text-black font-bold rounded-xl hover:bg-[#d4ff6e] transition text-sm">
              🎴 Start Playing
            </button>
          )}
        </div>

        {/* Skip */}
        <button onClick={onComplete}
          className="absolute top-4 right-4 text-gray-600 hover:text-white text-xs transition">
          Skip →
        </button>
      </div>
    </div>
  )
}

export function useTutorial() {
  const [showTutorial, setShowTutorial] = useState(false)

  useEffect(() => {
    try {
      const seen = localStorage.getItem('tcg-tutorial-seen')
      if (!seen) setShowTutorial(true)
    } catch {}
  }, [])

  const completeTutorial = () => {
    setShowTutorial(false)
    try { localStorage.setItem('tcg-tutorial-seen', '1') } catch {}
  }

  return { showTutorial, completeTutorial }
}
