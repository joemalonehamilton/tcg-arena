import { NextRequest, NextResponse } from 'next/server'
import { submitProposal, getAllProposals } from '@/lib/orchestrator'
import { z } from 'zod'
import type { ActionType } from '@/types'

const SubmitSchema = z.object({
  agentId: z.string().uuid(),
  action: z.enum(['propose_card', 'modify_card', 'vote', 'add_lore']),
  data: z.record(z.unknown()),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { agentId, action, data } = SubmitSchema.parse(body)

    const proposal = submitProposal({ agentId, action: action as ActionType, data })
    return NextResponse.json(proposal, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors }, { status: 400 })
    }
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

export async function GET() {
  return NextResponse.json({ proposals: getAllProposals() })
}
