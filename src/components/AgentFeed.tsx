'use client'

import type { ActivityEvent } from '@/types'

const typeIcons: Record<string, string> = {
  propose_card: '🃏',
  modify_card: '✏️',
  vote: '🗳️',
  add_lore: '📜',
  season_start: '🚀',
  season_seal: '🔒',
  agent_register: '🤖',
}

export default function AgentFeed({ events }: { events: ActivityEvent[] }) {
  if (events.length === 0) {
    return <div className="text-gray-600 text-sm py-4">No activity yet.</div>
  }

  return (
    <div className="space-y-2 max-h-96 overflow-y-auto">
      {events.map(event => (
        <div
          key={event.id}
          className="bg-arena-card border border-arena-border rounded px-3 py-2 text-sm flex items-start gap-2"
        >
          <span>{typeIcons[event.type] ?? '📌'}</span>
          <div className="flex-1 min-w-0">
            <span className="text-gray-300">{event.message}</span>
            <div className="text-xs text-gray-600 mt-0.5">
              {new Date(event.timestamp).toLocaleTimeString()}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
