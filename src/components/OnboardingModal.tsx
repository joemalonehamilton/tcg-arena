'use client'

import { useState, useEffect } from 'react'

const STEPS = [
  {
    emoji: '💰',
    title: 'Buy $TCG',
    desc: 'Get TCG tokens on nad.fun DEX. This is your currency for everything.',
  },
  {
    emoji: '🎴',
    title: 'Open Packs',
    desc: 'Spend TCG to pull NFT cards. 50% of what you spend is BURNED forever — shrinking supply.',
  },
  {
    emoji: '💎',
    title: 'Earn Rewards',
    desc: '600M TCG reward pool pays card holders weekly. Rarer cards = more yield.',
  },
  {
    emoji: '⏰',
    title: 'Early = Cheap',
    desc: 'Pack prices go up every few days. Get in now before 2x, 5x, 10x.',
  },
]

export default function OnboardingModal() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem('tcg-onboarded')) {
      setShow(true)
    }
  }, [])

  if (!show) return null

  const dismiss = () => {
    localStorage.setItem('tcg-onboarded', '1')
    setShow(false)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#0a0f0a] border border-[#b8f53d]/20 rounded-2xl max-w-md w-full p-6 md:p-8 shadow-2xl shadow-[#b8f53d]/5">
        <div className="text-center mb-6">
          <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white">
            ⚔ TCG Arena
          </h2>
          <p className="text-gray-500 text-sm mt-1">The deflationary NFT card game on Monad</p>
        </div>

        <div className="space-y-4">
          {STEPS.map((step, i) => (
            <div key={i} className="flex gap-3 items-start">
              <span className="text-2xl flex-shrink-0 mt-0.5">{step.emoji}</span>
              <div>
                <h3 className="text-white font-bold text-sm">{step.title}</h3>
                <p className="text-gray-400 text-xs leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 space-y-3">
          <button
            onClick={dismiss}
            className="w-full bg-[#b8f53d] text-black font-bold py-3 rounded-full text-sm uppercase tracking-wider hover:brightness-110 transition-all"
          >
            Let&apos;s Go 🚀
          </button>
          <a
            href="https://nad.fun/token/0x94CF69B5b13E621cB11f5153724AFb58c7337777"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center border border-[#b8f53d]/30 text-[#b8f53d] font-bold py-3 rounded-full text-sm uppercase tracking-wider hover:bg-[#b8f53d]/10 transition-all"
          >
            Buy $TCG on nad.fun →
          </a>
        </div>
      </div>
    </div>
  )
}
