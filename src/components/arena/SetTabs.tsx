'use client'

interface SetTabsProps {
  activeTab: string
  onTabChange: (tab: string) => void
  counts: Record<string, number>
}

const TABS = ['All Cards', 'Creatures', 'Spells', 'Artifacts', 'Terrains']

export default function SetTabs({ activeTab, onTabChange, counts }: SetTabsProps) {
  return (
    <div className="w-full max-w-[1600px] mx-auto px-6 py-3 flex gap-1 overflow-x-auto">
      {TABS.map(tab => {
        const active = activeTab === tab
        const count = counts[tab] ?? 0
        return (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`px-4 py-2 text-sm font-medium transition-all duration-300 border-b-2 whitespace-nowrap ${
              active
                ? 'text-[#b8f53d] border-[#b8f53d]'
                : 'text-gray-400 border-transparent hover:text-gray-200 hover:border-gray-600'
            }`}
          >
            {tab} ({count})
          </button>
        )
      })}
    </div>
  )
}
