'use client'

import { useState, useEffect, useCallback } from 'react'

interface CommunityAgent {
  id: string; name: string; emoji: string; personality: string; specialty: string;
  creator_wallet: string; status: string; votes_for: number; votes_against: number; api_key: string;
}

interface CommunityCard {
  id: string; name: string; rarity: string; ability_name: string; ability_desc: string;
  creator_wallet: string; status: string; votes_for: number; votes_against: number;
}

export default function AdminPage() {
  const [agents, setAgents] = useState<CommunityAgent[]>([])
  const [cards, setCards] = useState<CommunityCard[]>([])
  const [loading, setLoading] = useState(true)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const [agentsRes, cardsRes] = await Promise.all([
        fetch('/api/community/agents'),
        fetch('/api/community/cards'),
      ])
      const agentsData = await agentsRes.json()
      const cardsData = await cardsRes.json()
      setAgents(agentsData.agents || [])
      setCards(cardsData.cards || [])
    } catch (err) {
      console.error(err)
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  async function handleAction(type: 'agents' | 'cards', id: string, action: 'approve' | 'reject') {
    await fetch(`/api/community/${type}/${id}/${action}`, { method: 'POST' })
    fetchAll()
  }

  const pending = (items: { status: string }[]) => items.filter(i => i.status === 'pending' || i.status === 'voting')
  const approved = (items: { status: string }[]) => items.filter(i => i.status === 'approved')

  const statusColor: Record<string, string> = {
    pending: 'bg-yellow-500/15 text-yellow-400',
    voting: 'bg-blue-500/15 text-blue-400',
    approved: 'bg-green-500/15 text-green-400',
    rejected: 'bg-red-500/15 text-red-400',
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto space-y-10">
        <h1 className="text-3xl font-black">🛡️ Admin Panel</h1>

        {/* Pending Agents */}
        <section>
          <h2 className="text-xl font-bold text-yellow-400 mb-4">Pending Agents ({pending(agents).length})</h2>
          {pending(agents).length === 0 && <p className="text-gray-500 text-sm">No pending agents</p>}
          <div className="space-y-3">
            {pending(agents).map(a => (
              <div key={a.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">{a.emoji || '🤖'}</span>
                      <span className="font-bold">{a.name}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${statusColor[a.status]}`}>{a.status}</span>
                      {a.specialty && <span className="text-[10px] text-gray-500">{a.specialty}</span>}
                    </div>
                    <p className="text-gray-400 text-xs mt-1">{a.personality}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => handleAction('agents', a.id, 'approve')}
                      className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-xs font-bold rounded-lg transition">✅ Approve</button>
                    <button onClick={() => handleAction('agents', a.id, 'reject')}
                      className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg transition">❌ Reject</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Pending Cards */}
        <section>
          <h2 className="text-xl font-bold text-blue-400 mb-4">Pending Cards ({pending(cards).length})</h2>
          {pending(cards).length === 0 && <p className="text-gray-500 text-sm">No pending cards</p>}
          <div className="space-y-3">
            {pending(cards).map(c => (
              <div key={c.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold">{c.name}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${statusColor[c.status]}`}>{c.status}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400 font-bold capitalize">{c.rarity}</span>
                    </div>
                    {c.ability_desc && <p className="text-gray-400 text-xs">✨ {c.ability_desc}</p>}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => handleAction('cards', c.id, 'approve')}
                      className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-xs font-bold rounded-lg transition">✅ Approve</button>
                    <button onClick={() => handleAction('cards', c.id, 'reject')}
                      className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg transition">❌ Reject</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Approved Agents */}
        <section>
          <h2 className="text-xl font-bold text-green-400 mb-4">Approved Agents ({approved(agents).length})</h2>
          {approved(agents).length === 0 && <p className="text-gray-500 text-sm">No approved agents yet</p>}
          <div className="space-y-3">
            {approved(agents).map(a => (
              <div key={a.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{a.emoji || '🤖'}</span>
                  <span className="font-bold">{a.name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-green-500/15 text-green-400">approved</span>
                  {a.specialty && <span className="text-[10px] text-gray-500">{a.specialty}</span>}
                </div>
                <p className="text-gray-400 text-xs mt-1">{a.personality?.slice(0, 120)}...</p>
                {a.api_key && <p className="text-[10px] text-gray-600 mt-1 font-mono">API Key: {a.api_key}</p>}
              </div>
            ))}
          </div>
        </section>

        {/* Approved Cards */}
        <section>
          <h2 className="text-xl font-bold text-green-400 mb-4">Approved Cards ({approved(cards).length})</h2>
          {approved(cards).length === 0 && <p className="text-gray-500 text-sm">No approved cards yet</p>}
          <div className="space-y-3">
            {approved(cards).map(c => (
              <div key={c.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="flex items-center gap-2">
                  <span className="font-bold">{c.name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-green-500/15 text-green-400">approved</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400 font-bold capitalize">{c.rarity}</span>
                </div>
                {c.ability_desc && <p className="text-gray-400 text-xs mt-1">✨ {c.ability_desc}</p>}
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
