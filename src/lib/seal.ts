/**
 * Hash generation + Monad anchoring logic.
 */

import { generateSealedJson } from './artifact-store'
import { launchToken } from './nadfun'
import { getSeason } from './db'

export async function sealCurrentSet(): Promise<{ hash: string; txHash: string; tokenAddress?: string }> {
  const { hash } = await generateSealedJson()
  const txHash = await anchorOnMonad(hash)

  // nad.fun token launch after seal
  const season = getSeason()
  let tokenAddress: string | undefined
  try {
    const result = await launchToken(
      { name: 'Season Winner', rarity: 'legendary', power: 0, toughness: 0, abilities: [], flavor: '', lore: '', votes: 0 },
      { id: season.id, name: 'Season Seal', seasonId: season.id, totalAgents: season.agentCount, avgCritiqueScore: 7 }
    )
    tokenAddress = result.tokenAddress
  } catch (err) {
    console.error('[seal] Token launch failed (non-fatal):', err)
  }

  return { hash, txHash, tokenAddress }
}

export async function anchorOnMonad(hash: string): Promise<string> {
  // TODO: Real Monad integration
  // const provider = new ethers.JsonRpcProvider(process.env.MONAD_RPC_URL)
  // const wallet = new ethers.Wallet(process.env.MONAD_PRIVATE_KEY!, provider)
  // const contract = new ethers.Contract(process.env.SEASON_SEAL_CONTRACT!, ABI, wallet)
  // const tx = await contract.seal(hash, ipfsURI, agentCount, cardCount)
  // return (await tx.wait()).hash

  console.log(`[seal] Would anchor hash ${hash} on Monad`)
  return '0x' + crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '').slice(0, 32)
}
