const { ethers } = require('ethers');
const fs = require('fs');
const provider = new ethers.JsonRpcProvider('https://rpc.monad.xyz');
const TARGET = '0x939e55c96b3d665352a7478053d57430a97709f9';
const data = JSON.parse(fs.readFileSync('/Users/kevinhe/.openclaw/workspace/tcg-wallets/wallets_v2.json'));
const wallets = [...data.intermediaries, ...data.end_wallets];

async function main() {
  let total = 0n;
  let success = 0;
  for (let i = 0; i < wallets.length; i++) {
    const w = new ethers.Wallet(wallets[i].private_key, provider);
    try {
      const bal = await provider.getBalance(w.address);
      if (bal < ethers.parseEther('0.001')) { continue; }
      const gasPrice = (await provider.getFeeData()).gasPrice;
      const gasLimit = 21000n;
      const gasCost = gasPrice * gasLimit;
      const sendAmt = bal - gasCost * 2n; // 2x buffer
      if (sendAmt <= 0n) { continue; }
      console.log(`[${i+1}/${wallets.length}] ${w.address} → ${ethers.formatEther(sendAmt)} MON`);
      const tx = await w.sendTransaction({ to: TARGET, value: sendAmt, gasLimit });
      await tx.wait();
      console.log(`  ✅ ${tx.hash}`);
      total += sendAmt;
      success++;
    } catch(e) { console.log(`  ❌ ${e.message?.slice(0,80)}`); }
    await new Promise(r => setTimeout(r, 400));
  }
  console.log(`\nDone: ${success} wallets, ${ethers.formatEther(total)} MON sent to ${TARGET}`);
}
main().catch(console.error);
