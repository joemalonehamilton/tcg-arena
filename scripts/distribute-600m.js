/**
 * Distribute 600M TCG from 30 end_wallets → 30 nadfun_wallets (clean)
 * Each end_wallet sends its full TCG balance to its paired nadfun_wallet
 */

const { ethers } = require('ethers');
const fs = require('fs');

const RPC = 'https://rpc.monad.xyz';
const TCG = '0x94CF69B5b13E621cB11f5153724AFb58c7337777';
const ERC20_ABI = [
  'function balanceOf(address) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
];

const provider = new ethers.JsonRpcProvider(RPC);

const endWallets = JSON.parse(
  fs.readFileSync('/Users/kevinhe/.openclaw/workspace/tcg-wallets/wallets_v2.json', 'utf8')
).end_wallets;

const nadfunWallets = JSON.parse(
  fs.readFileSync('/Users/kevinhe/.openclaw/workspace/tcg-wallets/nadfun_wallets.json', 'utf8')
);

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  console.log(`Distributing from ${endWallets.length} end_wallets → ${nadfunWallets.length} nadfun_wallets\n`);

  if (endWallets.length !== nadfunWallets.length) {
    console.error('Wallet count mismatch!');
    process.exit(1);
  }

  let totalMoved = 0n;
  let success = 0;
  let failed = 0;

  for (let i = 0; i < endWallets.length; i++) {
    const from = endWallets[i];
    const to = nadfunWallets[i];

    try {
      const wallet = new ethers.Wallet(from.private_key, provider);
      const token = new ethers.Contract(TCG, ERC20_ABI, wallet);

      // Check balance
      const balance = await token.balanceOf(from.address);
      if (balance === 0n) {
        console.log(`[${i + 1}/30] ${from.address} → SKIP (0 balance)`);
        continue;
      }

      const balanceFormatted = Number(balance / 10n ** 18n);
      console.log(`[${i + 1}/30] ${from.address} → ${to.address} | ${balanceFormatted.toLocaleString()} TCG`);

      // Check MON for gas
      const monBal = await provider.getBalance(from.address);
      if (monBal < ethers.parseEther('0.001')) {
        console.log(`  ⚠️  No MON for gas, skipping`);
        failed++;
        continue;
      }

      // Transfer full balance
      const tx = await token.transfer(to.address, balance);
      console.log(`  ✅ tx: ${tx.hash}`);
      await tx.wait();
      totalMoved += balance;
      success++;
    } catch (err) {
      console.log(`  ❌ Error: ${err.message?.slice(0, 100)}`);
      failed++;
    }

    // Rate limit
    await sleep(600);
  }

  console.log(`\n=== DONE ===`);
  console.log(`Success: ${success} | Failed: ${failed}`);
  console.log(`Total moved: ${Number(totalMoved / 10n ** 18n).toLocaleString()} TCG`);
}

main().catch(console.error);
