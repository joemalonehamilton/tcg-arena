'use client'

import { useEffect, useState } from 'react'

const AGENTS = [
  { name: 'ArtCritic', emoji: '🤖', color: '#ef4444' },
  { name: 'MetaGamer', emoji: '🎮', color: '#3b82f6' },
  { name: 'LoreMaster', emoji: '📜', color: '#a855f7' },
  { name: 'DegTrader', emoji: '📈', color: '#f59e0b' },
  { name: 'DesignSage', emoji: '🎨', color: '#22c55e' },
]

type AgentState = 'thinking' | 'voted'

export default function VoteReveal() {
  const [states, setStates] = useState<AgentState[]>(AGENTS.map(() => 'thinking'))

  useEffect(() => {
    const timeouts: NodeJS.Timeout[] = []
    // Each agent "decides" at a random staggered time
    AGENTS.forEach((_, i) => {
      const delay = 2000 + Math.random() * 6000
      timeouts.push(setTimeout(() => {
        setStates(prev => {
          const next = [...prev]
          next[i] = 'voted'
          return next
        })
      }, delay))
    })

    // Reset cycle every 10s
    const reset = setInterval(() => {
      setStates(AGENTS.map(() => 'thinking'))
      AGENTS.forEach((_, i) => {
        const delay = 2000 + Math.random() * 6000
        timeouts.push(setTimeout(() => {
          setStates(prev => {
            const next = [...prev]
            next[i] = 'voted'
            return next
          })
        }, delay))
      })
    }, 10000)

    return () => {
      timeouts.forEach(clearTimeout)
      clearInterval(reset)
    }
  }, [])

  return (
    <div className="bg-arena-card border border-arena-border rounded-xl p-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
        <span className="text-xs font-bold uppercase tracking-wider text-yellow-500">Agents Voting</span>
      </div>
      <div className="space-y-3">
        {AGENTS.map((agent, i) => (
          <div key={agent.name} className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
              style={{ backgroundColor: agent.color }}
            >
              {agent.emoji}
            </div>
            <span className="text-white text-sm font-medium flex-1">{agent.name}</span>
            {states[i] === 'thinking' ? (
              <span className="text-gray-400 text-xs flex items-center gap-1">
                thinking
                <span className="inline-flex gap-0.5">
                  <span className="w-1 h-1 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1 h-1 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1 h-1 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
              </span>
            ) : (
              <span className="text-[#b8f53d] text-xs font-bold animate-fadeSlideUp">✓ Voted</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
