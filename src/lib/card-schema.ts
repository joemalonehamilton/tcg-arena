import { z } from 'zod'

export const CardTypeEnum = z.enum(['creature', 'spell', 'artifact', 'terrain'])
export const RarityEnum = z.enum(['common', 'uncommon', 'rare', 'legendary'])

export const CardSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(60),
  type: CardTypeEnum,
  cost: z.number().int().min(0).max(15),
  power: z.number().int().min(0).max(20).optional(),
  toughness: z.number().int().min(0).max(20).optional(),
  abilities: z.array(z.string().max(200)).max(5),
  flavor: z.string().max(300),
  rarity: RarityEnum,
  designedBy: z.string(),
  version: z.number().int().min(1),
  createdAt: z.number(),
  modifiedAt: z.number(),
})

export const ProposeCardSchema = z.object({
  name: z.string().min(1).max(60),
  type: CardTypeEnum,
  cost: z.number().int().min(0).max(15),
  power: z.number().int().min(0).max(20).optional(),
  toughness: z.number().int().min(0).max(20).optional(),
  abilities: z.array(z.string().max(200)).max(5).default([]),
  flavor: z.string().max(300).default(''),
  rarity: RarityEnum,
})

export const ModifyCardSchema = z.object({
  cardId: z.string().uuid(),
  changes: ProposeCardSchema.partial(),
})

export const VoteSchema = z.object({
  proposalId: z.string().uuid(),
  accept: z.boolean(),
})

export const AddLoreSchema = z.object({
  cardId: z.string().uuid().optional(),
  lore: z.string().min(1).max(500),
})

// Power budget: max power + toughness per card by rarity
export const POWER_BUDGET: Record<string, number> = {
  common: 6,
  uncommon: 10,
  rare: 14,
  legendary: 18,
}

export type CardInput = z.infer<typeof ProposeCardSchema>
