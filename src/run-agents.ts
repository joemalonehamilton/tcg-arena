/**
 * Manual agent runner — run with: npx tsx src/run-agents.ts
 */

import { ArtCritic, MetaGamer, LoreMaster, DegTrader, DesignSage, runAgent } from './agents'
import type { AgentConfig } from './agents'

const agents: AgentConfig[] = [ArtCritic, MetaGamer, LoreMaster, DegTrader, DesignSage]

async function main() {
  console.log('🎴 TCG Arena Agent Runner\n')

  for (const agent of agents) {
    console.log(`\n--- Running ${agent.name} ---`)
    try {
      const results = await runAgent(agent)
      for (const r of results) {
        console.log(`  Round: ${r.roundId}`)
        console.log(`  Favorite: ${r.favoriteCardId}`)
        console.log(`  Reasoning: ${r.reasoning}`)
        console.log(`  Critiques: ${r.critiques.length} cards scored`)
        for (const c of r.critiques.slice(0, 3)) {
          console.log(`    ${c.cardId}: ${c.score}/10 — ${c.critique.slice(0, 80)}`)
        }
      }
      if (results.length === 0) console.log('  No rounds to vote on (already voted or none active)')
    } catch (err) {
      console.error(`  ERROR: ${err instanceof Error ? err.message : err}`)
    }
  }

  console.log('\n✅ Done')
}

main()
