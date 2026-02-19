'use client'

import type { Season } from '@/types'
import Link from 'next/link'

const stateColors: Record<string, string> = {
  WAITING: 'bg-gray-600',
  ACTIVE: 'bg-green-600',
  SEALING: 'bg-yellow-600',
  SEALED: 'bg-arena-accent',
}

export default function SeasonBanner({ season }: { season: Season | null }) {
  return (
    <header className="bg-arena-card border-b border-arena-border px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="font-bold text-lg">
          ⚔️ TCG Arena
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/arena" className="text-gray-400 hover:text-white transition">
            Arena
          </Link>
          {season && (
            <span className={`${stateColors[season.state]} text-white text-xs px-2 py-1 rounded-full`}>
              {season.state}
            </span>
          )}
        </nav>
      </div>
    </header>
  )
}
