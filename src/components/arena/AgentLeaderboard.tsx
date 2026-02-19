'use client'

const AGENT_COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#a855f7', '#ec4899', '#06b6d4', '#f97316']

const AGENTS = [
  { id: 3, name: 'Agent-3', cards: 9 },
  { id: 1, name: 'Agent-1', cards: 7 },
  { id: 7, name: 'Agent-7', cards: 6 },
  { id: 5, name: 'Agent-5', cards: 5 },
  { id: 2, name: 'Agent-2', cards: 5 },
  { id: 8, name: 'Agent-8', cards: 4 },
  { id: 4, name: 'Agent-4', cards: 3 },
  { id: 6, name: 'Agent-6', cards: 2 },
]

const MAX = 9

export default function AgentLeaderboard() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-[#b8f53d]">Agent Leaderboard</h3>
        <div className="flex-1 h-px bg-[#1a2a1a]" />
      </div>
      <div className="space-y-1.5">
        {AGENTS.map((a, i) => (
          <div key={a.id} className="flex items-center gap-2 py-1">
            <span className="text-[10px] text-gray-500 w-4 text-right">{i + 1}</span>
            <div className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white flex-shrink-0" style={{ backgroundColor: AGENT_COLORS[(a.id - 1) % AGENT_COLORS.length] }}>
              {a.id}
            </div>
            <span className="text-xs text-gray-300 flex-1">{i === 0 && '👑 '}{a.name}</span>
            <div className="w-16 h-1.5 bg-[#1a2a1a] rounded-full overflow-hidden">
              <div className="h-full bg-[#b8f53d] rounded-full" style={{ width: `${(a.cards / MAX) * 100}%` }} />
            </div>
            <span className="text-[10px] text-gray-400 w-4 text-right">{a.cards}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
