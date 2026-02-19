/**
 * Sell TCG tokens on nad.fun DEX Router for MON
 * Creates volume on the chart for every pack purchase
 */

const TCG_TOKEN = '0x94CF69B5b13E621cB11f5153724AFb58c7337777'
const DEX_ROUTER = '0x0B79d71AE99528D1dB24A4148b5f4F865cc2b137'
const LENS = '0x7e78A8DE94f21804F7a17F4E8BF9EC2c872187ea'
const RPC_URL = 'https://rpc.monad.xyz'
const DEPLOYER_KEY = (process.env.DEPLOYER_PRIVATE_KEY || '').trim().replace(/\\n/g, '')

export async function sellTCGOnDex(amount: bigint): Promise<{ txHash: string } | null> {
  if (!DEPLOYER_KEY || amount <= 0n) return null

  try {
    const { Wallet, JsonRpcProvider, Contract } = await import('ethers')
    const provider = new JsonRpcProvider(RPC_URL)
    const signer = new Wallet(DEPLOYER_KEY, provider)
    const deployerAddress = await signer.getAddress()

    // 1. Get expected MON output from Lens
    const lens = new Contract(LENS, [
      'function getAmountOut(address token, uint256 amountIn, bool isBuy) view returns (address router, uint256 amountOut)',
    ], provider)

    const [router, expectedMon] = await lens.getAmountOut(TCG_TOKEN, amount, false) // false = sell

    // 2. Approve DEX Router to spend TCG
    const tcg = new Contract(TCG_TOKEN, [
      'function approve(address spender, uint256 amount) returns (bool)',
      'function allowance(address owner, address spender) view returns (uint256)',
    ], signer)

    const allowance = await tcg.allowance(deployerAddress, DEX_ROUTER)
    if (allowance < amount) {
      const approveTx = await tcg.approve(DEX_ROUTER, amount * 10n) // approve extra
      await approveTx.wait()
    }

    // 3. Sell on DEX Router
    const dexRouter = new Contract(DEX_ROUTER, [
      'function sell((uint256 amountIn, uint256 amountOutMin, address token, address to, uint256 deadline)) returns (uint256 amountOut)',
    ], signer)

    const minMon = (expectedMon * 95n) / 100n // 5% slippage
    const deadline = Math.floor(Date.now() / 1000) + 300

    const sellTx = await dexRouter.sell({
      amountIn: amount,
      amountOutMin: minMon,
      token: TCG_TOKEN,
      to: deployerAddress,
      deadline,
    })
    const receipt = await sellTx.wait()

    console.log(`[dex-sell] Sold ${Number(amount / BigInt(10**18))} TCG for MON. TX: ${receipt.hash}`)
    return { txHash: receipt.hash }
  } catch (err) {
    console.error('[dex-sell] Failed:', err)
    return null
  }
}
