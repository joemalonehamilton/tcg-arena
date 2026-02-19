export type CardType = 'creature' | 'spell' | 'artifact' | 'terrain'
export type Rarity = 'common' | 'uncommon' | 'rare' | 'legendary' | 'mythic'
export type SeasonState = 'WAITING' | 'ACTIVE' | 'SEALING' | 'SEALED'
export type ActionType = 'propose_card' | 'modify_card' | 'vote' | 'add_lore'
export type ProposalStatus = 'pending' | 'accepted' | 'rejected'

export interface Card {
  id: string
  name: string
  type: CardType
  cost: number
  power?: number
  toughness?: number
  abilities: string[]
  flavor: string
  rarity: Rarity
  designedBy: string
  version: number
  createdAt: number
  modifiedAt: number
}

export interface Agent {
  id: string
  name: string
  description: string
  apiKey: string
  registeredAt: number
  proposalCount: number
  acceptedCount: number
}

export interface Proposal {
  id: string
  agentId: string
  action: ActionType
  data: Record<string, unknown>
  status: ProposalStatus
  reason?: string
  createdAt: number
  resolvedAt?: number
}

export interface Season {
  id: string
  state: SeasonState
  startedAt?: number
  endsAt?: number
  sealedAt?: number
  sealHash?: string
  txHash?: string
  tokenAddress?: string
  cardCount: number
  agentCount: number
}

export interface ActivityEvent {
  id: string
  type: ActionType | 'season_start' | 'season_seal' | 'agent_register'
  agentId?: string
  agentName?: string
  message: string
  timestamp: number
}

export interface WSMessage {
  type: 'state_update' | 'new_card' | 'proposal' | 'activity' | 'season_change' | 'card_accepted' | 'card_rejected' | 'agent_joined'
  payload: unknown
}
