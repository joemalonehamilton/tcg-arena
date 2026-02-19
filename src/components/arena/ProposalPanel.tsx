'use client'

const AGENT_COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#a855f7', '#ec4899', '#06b6d4', '#f97316']

const PROPOSALS = [
  { id: 1, agent: 3, action: "wants to add 'Void Serpent'", type: 'NEW' as const, yes: 7, no: 2, time: '2:34', status: 'VOTING' as const },
  { id: 2, agent: 7, action: "wants to modify 'Rugpull Dragon' power 6→7", type: 'MODIFY' as const, yes: 5, no: 3, time: '4:12', status: 'VOTING' as const },
  { id: 3, agent: 1, action: "wants to add lore to 'Dead Cat Bounce'", type: 'LORE' as const, yes: 9, no: 1, time: '0:00', status: 'ACCEPTED' as const },
  { id: 4, agent: 5, action: "wants to add 'Storm Herald'", type: 'NEW' as const, yes: 3, no: 6, time: '0:00', status: 'REJECTED' as const },
  { id: 5, agent: 2, action: "wants to modify 'Sandwich Bot' toughness 2→3", type: 'MODIFY' as const, yes: 4, no: 4, time: '1:07', status: 'VOTING' as const },
]

const STATUS_COLORS = { VOTING: 'text-yellow-400', ACCEPTED: 'text-green-400', REJECTED: 'text-red-400' }
const TYPE_COLORS = { NEW: 'bg-blue-500/20 text-blue-400', MODIFY: 'bg-purple-500/20 text-purple-400', LORE: 'bg-amber-500/20 text-amber-400' }

export default function ProposalPanel() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-[#b8f53d]">Active Proposals</h3>
        <div className="flex-1 h-px bg-[#1a2a1a]" />
      </div>
      <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
        {PROPOSALS.map(p => {
          const total = p.yes + p.no
          const pct = total > 0 ? (p.yes / total) * 100 : 50
          return (
            <div key={p.id} className="bg-[#0d120d] border border-[#1a2a1a] rounded-lg px-3 py-2.5 transition-all duration-300 hover:border-[#2a3a2a]">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0" style={{ backgroundColor: AGENT_COLORS[(p.agent - 1) % AGENT_COLORS.length] }}>
                  {p.agent}
                </div>
                <div className="flex-1 text-xs text-gray-300 truncate">Agent-{p.agent} {p.action}</div>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${TYPE_COLORS[p.type]}`}>{p.type}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-red-900/40 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-[10px] text-gray-400">👍{p.yes} 👎{p.no}</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                {p.status === 'VOTING' && <span className="text-[10px] text-gray-500">{p.time} left</span>}
                {p.status !== 'VOTING' && <span />}
                <span className={`text-[10px] font-bold ${STATUS_COLORS[p.status]}`}>{p.status}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
