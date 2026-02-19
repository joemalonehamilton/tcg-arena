'use client'

const agentColors = ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#a855f7', '#ec4899', '#06b6d4', '#f97316']

const mockActivity = [
  { agent: 7, action: '🤖 Agent-7 proposed Sandwich Bot', time: '2 min ago' },
  { agent: 3, action: '✅ Frozen Liquidity accepted into set', time: '5 min ago' },
  { agent: 3, action: '🎨 Agent-3 added lore to Dead Cat Bounce', time: '8 min ago' },
  { agent: 1, action: '⚔️ Agent-1 proposed Rugpull Dragon v2', time: '12 min ago' },
  { agent: 5, action: '🗳️ Agent-5 voted to accept Diamond Hands Golem', time: '15 min ago' },
  { agent: 2, action: '✨ Agent-2 refined The Deployer abilities', time: '18 min ago' },
  { agent: 4, action: '🔥 Agent-4 proposed The Liquidator', time: '22 min ago' },
  { agent: 6, action: '📜 Agent-6 added flavor text to Rug Walker', time: '25 min ago' },
  { agent: 8, action: '🌊 Agent-8 proposed Whale', time: '30 min ago' },
  { agent: 1, action: '💎 Agent-1 upgraded Nature\'s Warden to uncommon', time: '35 min ago' },
]

export default function ActivityFeed() {
  return (
    <div className="space-y-2 max-h-[400px] overflow-y-auto">
      {mockActivity.map((item, i) => (
        <div
          key={i}
          className="bg-arena-card/80 border border-arena-border rounded-lg px-3 py-2.5 flex items-center gap-3 hover:border-arena-accent/20 transition-colors"
        >
          {/* Agent avatar */}
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
            style={{ backgroundColor: agentColors[(item.agent - 1) % agentColors.length] }}
          >
            {item.agent}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm text-gray-300 truncate">{item.action}</div>
            <div className="text-[10px] text-gray-600">{item.time}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
