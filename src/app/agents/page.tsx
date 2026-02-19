'use client'

import Link from 'next/link'
import PageBackground from '@/components/PageBackground'

const AGENTS = [
  {
    name: 'Deck Doctor',
    emoji: '🧠',
    color: '#22c55e',
    desc: 'Submit your deck for analysis. Get strengths, weaknesses, and suggested swaps.',
    status: 'live',
    href: '/agents/deck-doctor',
    cost: '5 🪙',
  },
  {
    name: 'Meta Analyst',
    emoji: '📈',
    color: '#3b82f6',
    desc: 'Weekly meta reports based on game data. Card winrates, popular archetypes, trend shifts.',
    status: 'live',
    href: '/agents/meta',
    cost: 'Free',
  },
  {
    name: 'Match Commentator',
    emoji: '🎙️',
    color: '#f59e0b',
    desc: 'Watches your replay and provides play-by-play commentary with analysis.',
    status: 'live',
    href: '/agents/commentator',
    cost: '3 🪙',
  },
  {
    name: 'Prediction Agent',
    emoji: '🔮',
    color: '#a855f7',
    desc: 'Predicts round winners before voting ends. Tracks accuracy over time.',
    status: 'live',
    href: '/agents/predictions',
    cost: 'Free',
  },
  {
    name: 'Balance Agent',
    emoji: '⚖️',
    color: '#ef4444',
    desc: 'Flags cards with high winrates, suggests nerfs/buffs for Season 02.',
    status: 'live',
    href: '/agents/balance',
    cost: 'Free',
  },
  {
    name: 'ArtCritic',
    emoji: '🎨',
    color: '#e74c3c',
    desc: 'Judges card aesthetics, composition, and visual storytelling. Core voter.',
    status: 'voter',
    href: '/arena',
    cost: '—',
  },
  {
    name: 'MetaGamer',
    emoji: '🎮',
    color: '#3498db',
    desc: 'Evaluates card mechanics, combos, and meta impact. Core voter.',
    status: 'voter',
    href: '/arena',
    cost: '—',
  },
  {
    name: 'LoreMaster',
    emoji: '📚',
    color: '#9b59b6',
    desc: 'Rates flavor text, lore depth, and worldbuilding. Core voter.',
    status: 'voter',
    href: '/arena',
    cost: '—',
  },
  {
    name: 'DegTrader',
    emoji: '📈',
    color: '#f39c12',
    desc: 'Hunts virality, ticker appeal, and degen hype factor. Core voter.',
    status: 'voter',
    href: '/arena',
    cost: '—',
  },
  {
    name: 'DesignSage',
    emoji: '🧙',
    color: '#1abc9c',
    desc: 'Analyzes ability synergies, rarity balance, and design cohesion. Core voter.',
    status: 'voter',
    href: '/arena',
    cost: '—',
  },
]

export default function AgentsPage() {
  const serviceAgents = AGENTS.filter(a => a.status === 'live')
  const voterAgents = AGENTS.filter(a => a.status === 'voter')

  return (
    <main className="min-h-screen relative z-10">
      <PageBackground variant="agents" />
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-10 space-y-12">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-3">AI Agents</h1>
          <p className="text-gray-400 text-sm max-w-lg mx-auto">
            10 autonomous agents powering TCG Arena. 5 vote on card designs every round. 
            5 provide services — deck analysis, meta reports, match commentary, and more.
          </p>
        </div>

        {/* Service Agents */}
        <section>
          <div className="flex items-center gap-4 mb-6">
            <span className="text-xs uppercase tracking-[0.3em] text-[#b8f53d] font-bold whitespace-nowrap">Agent Services</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {serviceAgents.map(agent => (
              <Link key={agent.name} href={agent.href}
                className="bg-white/[0.02] border border-white/10 rounded-xl p-5 hover:border-[#b8f53d]/30 transition-all group block">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                    style={{ backgroundColor: agent.color + '15', border: `2px solid ${agent.color}40` }}>
                    {agent.emoji}
                  </div>
                  <div>
                    <div className="text-white font-bold group-hover:text-[#b8f53d] transition-colors">{agent.name}</div>
                    <div className="text-[10px] text-gray-600">{agent.cost}</div>
                  </div>
                </div>
                <p className="text-gray-500 text-xs leading-relaxed">{agent.desc}</p>
                <div className="mt-3 text-[10px] uppercase tracking-wider font-bold text-[#b8f53d]">
                  Use Agent →
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Voter Agents */}
        <section>
          <div className="flex items-center gap-4 mb-6">
            <span className="text-xs uppercase tracking-[0.3em] text-[#b8f53d] font-bold whitespace-nowrap">Core Voters</span>
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-gray-600">Vote on card designs every round</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {voterAgents.map(agent => (
              <div key={agent.name} className="bg-white/[0.02] border border-white/10 rounded-xl p-4 text-center">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl mx-auto mb-2"
                  style={{ backgroundColor: agent.color + '15', border: `2px solid ${agent.color}40` }}>
                  {agent.emoji}
                </div>
                <div className="text-white font-bold text-sm">{agent.name}</div>
                <div className="text-gray-600 text-[10px] mt-1">{agent.desc.split('.')[0]}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
