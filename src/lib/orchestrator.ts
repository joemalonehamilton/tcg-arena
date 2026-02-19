/**
 * Core orchestrator — manages proposal queue, validation, merging.
 * FIFO queue, first valid proposal wins.
 */

import { proposals, cards, agents, addActivity, broadcast, getSeason } from './db'
import { ProposeCardSchema, ModifyCardSchema, VoteSchema, AddLoreSchema, POWER_BUDGET } from './card-schema'
import { addCard, modifyCard, getCard } from './artifact-store'
import type { Proposal, ActionType } from '@/types'

interface SubmitProposalInput {
  agentId: string
  action: ActionType
  data: Record<string, unknown>
}

function validatePowerBudget(rarity: string, power?: number, toughness?: number): string | null {
  const budget = POWER_BUDGET[rarity]
  if (budget === undefined) return null
  const total = (power ?? 0) + (toughness ?? 0)
  if (total > budget) {
    return `Power+Toughness (${total}) exceeds budget of ${budget} for ${rarity}`
  }
  return null
}

function isDuplicateName(name: string): boolean {
  return Array.from(cards.values()).some(c => c.name.toLowerCase() === name.toLowerCase())
}

export function submitProposal(input: SubmitProposalInput): Proposal {
  const season = getSeason()
  if (season.state !== 'ACTIVE') {
    throw new Error('Season is not active')
  }

  const agent = agents.get(input.agentId)
  if (!agent) throw new Error('Agent not registered')

  // Validate schema based on action type
  switch (input.action) {
    case 'propose_card':
      ProposeCardSchema.parse(input.data)
      break
    case 'modify_card':
      ModifyCardSchema.parse(input.data)
      break
    case 'vote':
      VoteSchema.parse(input.data)
      break
    case 'add_lore':
      AddLoreSchema.parse(input.data)
      break
    default:
      throw new Error(`Unknown action: ${input.action}`)
  }

  const proposal: Proposal = {
    id: crypto.randomUUID(),
    agentId: input.agentId,
    action: input.action,
    data: input.data,
    status: 'pending',
    createdAt: Date.now(),
  }

  proposals.set(proposal.id, proposal)
  agent.proposalCount++

  addActivity({
    type: input.action,
    agentId: agent.id,
    agentName: agent.name,
    message: `${agent.name} submitted ${input.action}`,
  })

  broadcast({ type: 'proposal', payload: proposal })

  // Auto-process FIFO
  processProposal(proposal.id)

  return proposals.get(proposal.id)!
}

function processProposal(proposalId: string): void {
  const proposal = proposals.get(proposalId)
  if (!proposal || proposal.status !== 'pending') return

  try {
    switch (proposal.action) {
      case 'propose_card': {
        const data = proposal.data as { name: string; rarity: string; power?: number; toughness?: number }
        if (isDuplicateName(data.name)) {
          throw new Error(`Duplicate card name: ${data.name}`)
        }
        const budgetErr = validatePowerBudget(data.rarity, data.power, data.toughness)
        if (budgetErr) throw new Error(budgetErr)

        const card = addCard(proposal.data as any, proposal.agentId)
        broadcast({ type: 'card_accepted', payload: card })
        break
      }
      case 'modify_card': {
        const { cardId, changes } = proposal.data as { cardId: string; changes: any }
        const existing = getCard(cardId)
        if (!existing) throw new Error('Card not found')
        // Validate power budget if power/toughness are changing
        if (changes.power !== undefined || changes.toughness !== undefined) {
          const newPower = changes.power ?? existing.power
          const newToughness = changes.toughness ?? existing.toughness
          const rarity = changes.rarity ?? existing.rarity
          const budgetErr = validatePowerBudget(rarity, newPower, newToughness)
          if (budgetErr) throw new Error(budgetErr)
        }
        const updated = modifyCard(cardId, changes, proposal.agentId)
        broadcast({ type: 'state_update', payload: updated })
        break
      }
      case 'vote': {
        // MVP: votes are logged but don't block
        break
      }
      case 'add_lore': {
        const { cardId, lore } = proposal.data as { cardId?: string; lore: string }
        if (cardId) {
          const card = getCard(cardId)
          if (!card) throw new Error('Card not found')
          modifyCard(cardId, { flavor: lore } as any, proposal.agentId)
        }
        break
      }
    }

    proposal.status = 'accepted'
    proposal.reason = 'Accepted'
    proposal.resolvedAt = Date.now()
    const agent = agents.get(proposal.agentId)
    if (agent) agent.acceptedCount++
  } catch (err) {
    proposal.status = 'rejected'
    proposal.reason = err instanceof Error ? err.message : 'Unknown error'
    proposal.resolvedAt = Date.now()
    broadcast({ type: 'card_rejected', payload: { proposalId, reason: proposal.reason } })
  }
}

export function getPendingProposals(): Proposal[] {
  return Array.from(proposals.values()).filter(p => p.status === 'pending')
}

export function getAllProposals(): Proposal[] {
  return Array.from(proposals.values()).sort((a, b) => b.createdAt - a.createdAt)
}
