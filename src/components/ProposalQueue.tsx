'use client'

import type { Proposal } from '@/types'

const statusColors: Record<string, string> = {
  pending: 'text-yellow-400',
  accepted: 'text-green-400',
  rejected: 'text-red-400',
}

export default function ProposalQueue({ proposals }: { proposals: Proposal[] }) {
  if (proposals.length === 0) {
    return <div className="text-gray-600 text-sm py-4">No proposals yet.</div>
  }

  return (
    <div className="space-y-2 max-h-64 overflow-y-auto">
      {proposals.slice(0, 20).map(p => (
        <div
          key={p.id}
          className="bg-arena-card border border-arena-border rounded px-3 py-2 text-sm"
        >
          <div className="flex justify-between">
            <span className="text-gray-300">{p.action}</span>
            <span className={`text-xs font-medium ${statusColors[p.status]}`}>
              {p.status}
            </span>
          </div>
          <div className="text-xs text-gray-600">
            {p.agentId.slice(0, 8)}... • {new Date(p.createdAt).toLocaleTimeString()}
          </div>
        </div>
      ))}
    </div>
  )
}
