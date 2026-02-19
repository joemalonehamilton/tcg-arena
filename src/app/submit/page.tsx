'use client'

import { useState, useEffect, useCallback } from 'react'
import PageBackground from '@/components/PageBackground'

type Tab = 'agents' | 'cards' | 'seasons'

interface CommunityAgent {
  id: string; name: string; emoji: string; personality: string; specialty: string;
  creator_wallet: string; status: string; votes_for: number; votes_against: number; created_at: number;
}

interface CommunityCard {
  id: string; name: string; rarity: string; ability_name: string; ability_desc: string;
  creator_wallet: string; status: string; votes_for: number; votes_against: number; created_at: number;
}

const AGENT_TEMPLATES = [
  { name: 'Hype Beast', emoji: '🔥', personality: 'Only cares about viral potential. Rates based on Twitter memeability, CT appeal, and whether degens will ape.', specialty: 'Virality' },
  { name: 'Whale Watcher', emoji: '🐋', personality: 'Analyzes from a big-money perspective. Which cards would whales accumulate? Token economics maximalist.', specialty: 'Economics' },
  { name: 'Lore Weaver', emoji: '📜', personality: 'Deep worldbuilder. Evaluates how cards fit into the Monad ecosystem narrative. Interconnected stories matter.', specialty: 'Narrative' },
]

const SEASON_TIMELINE = [
  { season: 1, status: 'active', cards: 18, startDate: 'Feb 2026', endDate: 'Mar 2026', theme: 'The Convergence', desc: 'The original 18 Monad creatures emerge from the blockchain.' },
  { season: 2, status: 'upcoming', cards: '12+', startDate: 'Mar 2026', endDate: 'Apr 2026', theme: 'The Fork', desc: 'New creatures arrive. Community-submitted cards and agents join the arena. Season 01 cards become Legacy.' },
  { season: 3, status: 'planned', cards: '???', startDate: 'Apr 2026', endDate: '???', theme: 'TBD', desc: 'Shaped by Season 02 outcomes. Agent votes determine which Legacy cards return.' },
]

export default function SubmitPage() {
  const [tab, setTab] = useState<Tab>('agents')
  const [agentName, setAgentName] = useState('')
  const [agentEmoji, setAgentEmoji] = useState('')
  const [agentPersonality, setAgentPersonality] = useState('')
  const [agentSpecialty, setAgentSpecialty] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [communityAgents, setCommunityAgents] = useState<CommunityAgent[]>([])
  const [communityCards, setCommunityCards] = useState<CommunityCard[]>([])

  // Card form state
  const [cardName, setCardName] = useState('')
  const [cardRarity, setCardRarity] = useState('rare')
  const [cardAbility, setCardAbility] = useState('')
  const [cardLore, setCardLore] = useState('')
  const [submittingCard, setSubmittingCard] = useState(false)

  const fetchAgents = useCallback(async () => {
    try {
      const res = await fetch('/api/community/agents')
      const data = await res.json()
      setCommunityAgents(data.agents || [])
    } catch {}
  }, [])

  const fetchCards = useCallback(async () => {
    try {
      const res = await fetch('/api/community/cards')
      const data = await res.json()
      setCommunityCards(data.cards || [])
    } catch {}
  }, [])

  useEffect(() => { fetchAgents(); fetchCards() }, [fetchAgents, fetchCards])

  async function submitAgent() {
    if (!agentName || !agentPersonality) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/community/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: agentName, emoji: agentEmoji, personality: agentPersonality, specialty: agentSpecialty }),
      })
      if (res.ok) {
        setAgentName(''); setAgentEmoji(''); setAgentPersonality(''); setAgentSpecialty('')
        fetchAgents()
      }
    } finally { setSubmitting(false) }
  }

  async function submitCard() {
    if (!cardName) return
    setSubmittingCard(true)
    try {
      const res = await fetch('/api/community/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: cardName, rarity: cardRarity, ability_name: cardAbility.split(' — ')[0] || cardAbility, ability_desc: cardAbility, creator_wallet: null }),
      })
      if (res.ok) {
        setCardName(''); setCardRarity('rare'); setCardAbility(''); setCardLore('')
        fetchCards()
      }
    } finally { setSubmittingCard(false) }
  }

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      approved: 'bg-green-500/15 text-green-400',
      pending: 'bg-yellow-500/15 text-yellow-400',
      voting: 'bg-blue-500/15 text-blue-400',
      rejected: 'bg-red-500/15 text-red-400',
    }
    const labels: Record<string, string> = {
      approved: '✅ Approved', pending: '⏳ Pending', voting: '🗳️ Voting', rejected: '❌ Rejected',
    }
    return <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${styles[status] || styles.pending}`}>{labels[status] || status}</span>
  }

  return (
    <main className="min-h-screen relative z-10">
      <PageBackground variant="submit" />
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 space-y-8">
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-black text-white mb-3">Community Hub</h1>
          <p className="text-gray-400 text-sm max-w-lg mx-auto">
            Submit agents, propose cards, and shape the future of TCG Arena. 
            Community votes determine what goes live each season.
          </p>
        </div>

        <div className="flex justify-center gap-2">
          {(['agents', 'cards', 'seasons'] as Tab[]).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${
                tab === t ? 'bg-[#b8f53d] text-black' : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}>
              {t === 'agents' ? '🤖 Agents' : t === 'cards' ? '🃏 Cards' : '📅 Seasons'}
            </button>
          ))}
        </div>

        {/* ═══ AGENTS TAB ═══ */}
        {tab === 'agents' && (
          <div className="space-y-8">
            <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
              <h2 className="text-white font-bold text-lg mb-1">Submit an Agent</h2>
              <p className="text-gray-500 text-xs mb-6">Design an AI personality that will vote on card designs. If the community approves, your agent goes live next season.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Agent Name</label>
                  <input type="text" value={agentName} onChange={e => setAgentName(e.target.value)}
                    placeholder="e.g. RugDetector"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#b8f53d]/50" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Emoji</label>
                  <input type="text" value={agentEmoji} onChange={e => setAgentEmoji(e.target.value)}
                    placeholder="🚨"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#b8f53d]/50" />
                </div>
              </div>
              <div className="mb-4">
                <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Specialty</label>
                <input type="text" value={agentSpecialty} onChange={e => setAgentSpecialty(e.target.value)}
                  placeholder="e.g. Risk Analysis, Synergies, Aesthetics..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#b8f53d]/50" />
              </div>
              <div className="mb-4">
                <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Personality & Voting Criteria</label>
                <textarea value={agentPersonality} onChange={e => setAgentPersonality(e.target.value)}
                  placeholder="Describe how this agent evaluates cards. What does it prioritize? What's its personality like? What would it say in critiques?"
                  rows={4}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#b8f53d]/50 resize-none" />
              </div>
              <button onClick={submitAgent} disabled={submitting || !agentName || !agentPersonality}
                className="w-full py-3 bg-[#b8f53d] text-black font-bold rounded-xl hover:bg-[#d4ff6e] transition-all text-sm disabled:opacity-50">
                {submitting ? 'Submitting...' : 'Submit Agent for Community Vote'}
              </button>
            </div>

            <div>
              <h3 className="text-xs uppercase tracking-[0.3em] text-[#b8f53d] font-bold mb-4">Need Inspiration?</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {AGENT_TEMPLATES.map(t => (
                  <button key={t.name} onClick={() => { setAgentName(t.name); setAgentEmoji(t.emoji); setAgentPersonality(t.personality); setAgentSpecialty(t.specialty) }}
                    className="bg-white/[0.02] border border-white/10 rounded-xl p-4 text-left hover:border-[#b8f53d]/30 transition-all">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">{t.emoji}</span>
                      <span className="text-white font-bold text-sm">{t.name}</span>
                    </div>
                    <p className="text-gray-500 text-xs leading-relaxed">{t.personality}</p>
                    <div className="mt-2 text-[10px] text-[#b8f53d]">Click to use template →</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs uppercase tracking-[0.3em] text-[#b8f53d] font-bold mb-4">Community Submissions</h3>
              <div className="space-y-3">
                {communityAgents.length === 0 && (
                  <div className="bg-white/[0.02] border border-white/10 rounded-xl p-8 text-center">
                    <div className="text-3xl mb-3">🤖</div>
                    <p className="text-gray-400 text-sm">No community agents submitted yet. Be the first!</p>
                  </div>
                )}
                {communityAgents.map(agent => (
                  <div key={agent.id} className="bg-white/[0.02] border border-white/10 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="flex items-center gap-3 flex-1">
                      <span className="text-2xl">{agent.emoji || '🤖'}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-bold">{agent.name}</span>
                          {statusBadge(agent.status)}
                        </div>
                        <p className="text-gray-500 text-xs mt-1">{agent.personality?.slice(0, 120)}...</p>
                        <div className="text-[10px] text-gray-600 mt-1">{agent.specialty && `${agent.specialty} · `}{agent.creator_wallet ? `by ${agent.creator_wallet.slice(0, 8)}...` : 'Anonymous'}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-center">
                        <div className="text-lg font-black text-[#b8f53d]">{Number(agent.votes_for) || 0}</div>
                        <div className="text-[10px] text-gray-600">votes</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══ CARDS TAB ═══ */}
        {tab === 'cards' && (
          <div className="space-y-8">
            <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
              <h2 className="text-white font-bold text-lg mb-1">Propose a Card</h2>
              <p className="text-gray-500 text-xs mb-6">Design a new card for Season 02. If approved by community vote + agent evaluation, it enters the next season&apos;s card pool.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Card Name</label>
                  <input type="text" value={cardName} onChange={e => setCardName(e.target.value)} placeholder="e.g. Flash Loan Fairy"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#b8f53d]/50" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Suggested Rarity</label>
                  <select value={cardRarity} onChange={e => setCardRarity(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#b8f53d]/50">
                    <option value="common">Common</option>
                    <option value="uncommon">Uncommon</option>
                    <option value="rare">Rare</option>
                    <option value="legendary">Legendary</option>
                  </select>
                </div>
              </div>
              <div className="mb-4">
                <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Ability</label>
                <input type="text" value={cardAbility} onChange={e => setCardAbility(e.target.value)} placeholder="e.g. Borrow — Temporarily steal an enemy creature for one turn"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#b8f53d]/50" />
              </div>
              <div className="mb-4">
                <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Lore / Description</label>
                <textarea value={cardLore} onChange={e => setCardLore(e.target.value)} placeholder="What's the story behind this creature?"
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#b8f53d]/50 resize-none" />
              </div>
              <button onClick={submitCard} disabled={submittingCard || !cardName}
                className="w-full py-3 bg-[#b8f53d] text-black font-bold rounded-xl hover:bg-[#d4ff6e] transition-all text-sm disabled:opacity-50">
                {submittingCard ? 'Submitting...' : 'Submit Card Proposal'}
              </button>
            </div>

            <div>
              <h3 className="text-xs uppercase tracking-[0.3em] text-[#b8f53d] font-bold mb-4">Proposed Cards</h3>
              <div className="space-y-3">
                {communityCards.length === 0 && (
                  <div className="bg-white/[0.02] border border-white/10 rounded-xl p-8 text-center">
                    <div className="text-3xl mb-3">🃏</div>
                    <p className="text-gray-400 text-sm">No community cards proposed yet. Be the first!</p>
                  </div>
                )}
                {communityCards.map(card => (
                  <div key={card.id} className="bg-white/[0.02] border border-white/10 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white font-bold">{card.name}</span>
                        {statusBadge(card.status)}
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400 font-bold capitalize">{card.rarity}</span>
                      </div>
                      {card.ability_desc && <p className="text-gray-400 text-xs">✨ {card.ability_desc}</p>}
                      <div className="text-[10px] text-gray-600 mt-1">{card.creator_wallet ? `by ${card.creator_wallet.slice(0, 8)}...` : 'Anonymous'}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-center">
                        <div className="text-lg font-black text-[#b8f53d]">{Number(card.votes_for) || 0}</div>
                        <div className="text-[10px] text-gray-600">votes</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-5">
              <h3 className="text-blue-400 font-bold text-sm mb-3">How Card Approval Works</h3>
              <div className="space-y-2 text-gray-400 text-xs">
                <p>1. <span className="text-white font-bold">Community votes</span> — cards need 50+ votes to enter agent review</p>
                <p>2. <span className="text-white font-bold">Agent evaluation</span> — all 5 core agents score the card on their criteria</p>
                <p>3. <span className="text-white font-bold">Balance check</span> — Balance Agent evaluates if the ability is fair</p>
                <p>4. <span className="text-white font-bold">Art generation</span> — approved cards get Flux 2 Pro artwork</p>
                <p>5. <span className="text-white font-bold">Season inclusion</span> — final cards enter the next season&apos;s card pool</p>
              </div>
            </div>
          </div>
        )}

        {/* ═══ SEASONS TAB ═══ */}
        {tab === 'seasons' && (
          <div className="space-y-8">
            <div className="space-y-4">
              {SEASON_TIMELINE.map(s => (
                <div key={s.season} className={`bg-white/[0.02] border rounded-2xl p-6 ${
                  s.status === 'active' ? 'border-[#b8f53d]/30' : 'border-white/10'
                }`}>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-black text-white">S{String(s.season).padStart(2, '0')}</span>
                      <div>
                        <div className="text-white font-bold">{s.theme}</div>
                        <div className="text-gray-500 text-xs">{s.startDate} — {s.endDate}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        s.status === 'active' ? 'bg-[#b8f53d]/15 text-[#b8f53d]' :
                        s.status === 'upcoming' ? 'bg-blue-500/15 text-blue-400' :
                        'bg-gray-500/15 text-gray-400'
                      }`}>
                        {s.status === 'active' ? '● Live' : s.status === 'upcoming' ? '◷ Upcoming' : '○ Planned'}
                      </span>
                      <span className="text-sm font-bold text-gray-400">{s.cards} cards</span>
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
