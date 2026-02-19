/**
 * Demo agent for TCG Arena.
 * Run: npx tsx src/demo-agent.ts
 * Requires the server running on port 3001.
 */

const BASE = 'http://localhost:3001/api'
const ADMIN_KEY = 'tcg-admin-key'

async function api(path: string, opts?: RequestInit) {
  const res = await fetch(`${BASE}${path}`, opts)
  const data = await res.json()
  if (!res.ok) throw new Error(`${res.status}: ${JSON.stringify(data)}`)
  return data
}

async function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms))
}

async function main() {
  console.log('🎴 TCG Arena Demo Agent starting...\n')

  // 1. Register
  console.log('📝 Registering agent...')
  const agent = await api('/agents', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'DemoForge',
      description: 'A demo agent that crafts creative cards for testing.',
    }),
  })
  console.log(`✅ Registered as "${agent.name}" (ID: ${agent.id})`)
  console.log(`🔑 API Key: ${agent.apiKey}\n`)

  // 2. Check season status, start if WAITING
  let season = await api('/season')
  console.log(`📊 Season state: ${season.state}`)

  if (season.state === 'WAITING') {
    console.log('🚀 Starting season (1 hour for demo)...')
    season = await api('/season', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ADMIN_KEY}`,
      },
      body: JSON.stringify({ durationHours: 1 }),
    })
    console.log(`✅ Season started: ${season.id}\n`)
  }

  // 3. Wait for ACTIVE
  while (season.state !== 'ACTIVE') {
    console.log(`⏳ Waiting for ACTIVE state (currently: ${season.state})...`)
    await sleep(2000)
    season = await api('/season')
  }

  // 4. Submit card proposals
  const cards = [
    {
      name: 'Chromatic Dragon',
      type: 'creature',
      cost: 8,
      power: 7,
      toughness: 6,
      rarity: 'legendary',
      abilities: ['Flying', 'When Chromatic Dragon enters, deal 3 damage to target creature'],
      flavor: 'Its scales shimmer with the light of a thousand suns.',
    },
    {
      name: 'Mana Rift',
      type: 'spell',
      cost: 3,
      rarity: 'rare',
      abilities: ['Draw 2 cards. Discard 1 card.'],
      flavor: 'The fabric of reality tears, revealing secrets within.',
    },
    {
      name: 'Stone Sentinel',
      type: 'creature',
      cost: 2,
      power: 2,
      toughness: 3,
      rarity: 'common',
      abilities: ['Defender'],
      flavor: 'Unmoved by time, unyielding to force.',
    },
    {
      name: 'Ethereal Blade',
      type: 'artifact',
      cost: 4,
      rarity: 'uncommon',
      abilities: ['Equipped creature gets +2/+1'],
      flavor: 'Forged from moonlight and memory.',
    },
    {
      name: 'Volcanic Terrain',
      type: 'terrain',
      cost: 5,
      rarity: 'rare',
      abilities: ['All creatures take 1 damage at end of turn'],
      flavor: 'The ground itself rebels against those who tread upon it.',
    },
    {
      name: 'Whispering Shade',
      type: 'creature',
      cost: 3,
      power: 3,
      toughness: 2,
      rarity: 'uncommon',
      abilities: ['When Whispering Shade deals damage, opponent discards a card'],
      flavor: 'It speaks in voices long forgotten.',
    },
  ]

  const acceptedCards: string[] = []

  for (const card of cards) {
    console.log(`🃏 Proposing: ${card.name} (${card.rarity} ${card.type})`)
    try {
      const proposal = await api('/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: agent.id,
          action: 'propose_card',
          data: card,
        }),
      })
      console.log(`   → ${proposal.status}${proposal.reason ? ': ' + proposal.reason : ''}`)
      if (proposal.status === 'accepted') {
        // Find the card ID from the proposals endpoint
        const { proposals } = await api('/proposals')
        const accepted = proposals.find(
          (p: any) => p.id === proposal.id && p.status === 'accepted'
        )
        if (accepted) acceptedCards.push(proposal.id)
      }
    } catch (err: any) {
      console.log(`   → Error: ${err.message}`)
    }
    await sleep(500)
  }

  console.log('')

  // 5. Get actual card IDs from the cards endpoint
  const allProposals = await api('/proposals')
  const cardIds: string[] = []

  // Fetch agents to get card list
  const agentsRes = await api('/agents')
  console.log(`👥 ${agentsRes.length} agents registered\n`)

  // 6. Add lore to first card we can find
  // Get cards via season check
  season = await api('/season')
  if (season.cardCount > 0) {
    console.log('📖 Adding lore to cards...')
    // We need to get card IDs - they're in proposal data after acceptance
    // For demo, just submit lore proposals referencing what we know
    for (const p of allProposals.proposals.slice(0, 2)) {
      if (p.status === 'accepted' && p.action === 'propose_card') {
        try {
          const loreProposal = await api('/proposals', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              agentId: agent.id,
              action: 'add_lore',
              data: {
                lore: 'In the age before the Sundering, this power was whispered of only in dreams.',
              },
            }),
          })
          console.log(`   → Lore proposal: ${loreProposal.status}`)
        } catch (err: any) {
          console.log(`   → Lore error: ${err.message}`)
        }
      }
    }
    console.log('')
  }

  // 7. Vote on proposals
  console.log('🗳️  Voting on proposals...')
  for (const p of allProposals.proposals.slice(0, 3)) {
    try {
      const vote = await api('/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: agent.id,
          action: 'vote',
          data: {
            proposalId: p.id,
            accept: true,
          },
        }),
      })
      console.log(`   → Voted on ${p.id.slice(0, 8)}: ${vote.status}`)
    } catch (err: any) {
      console.log(`   → Vote error: ${err.message}`)
    }
    await sleep(300)
  }

  // 8. Final status
  console.log('\n📊 Final Status:')
  season = await api('/season')
  console.log(`   Season: ${season.state}`)
  console.log(`   Cards: ${season.cardCount}`)
  console.log(`   Agents: ${season.agentCount}`)

  const finalProposals = await api('/proposals')
  const accepted = finalProposals.proposals.filter((p: any) => p.status === 'accepted').length
  const rejected = finalProposals.proposals.filter((p: any) => p.status === 'rejected').length
  console.log(`   Proposals: ${finalProposals.proposals.length} total (${accepted} accepted, ${rejected} rejected)`)

  console.log('\n🎴 Demo agent complete!')
}

main().catch(err => {
  console.error('❌ Demo agent failed:', err.message)
  process.exit(1)
})
