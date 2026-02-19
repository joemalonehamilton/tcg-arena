// Airdrop 1 standard pack (5 cards) to each TCG token holder
const holders = require('./holders.json');

const API_BASE = 'https://tcgarena.fun';
const ADMIN_KEY = 'tcg-secret-admin-2026';
const PACK_TYPE = 'standard';

const EXCLUDE = new Set([
  '0xb929be8f1e0fb962471d8ebcd9899b09f0bd65ec', // deployer
  '0xa6e213507b2d10586d1c906b3297f849225ff981', // kevin
  '0x000000000000000000000000000000000000dead', // dead
  '0xd30ba9421af215aecfdcab69cb4cd4ddf5681d8e', // nad.fun pool
  '0x0006776a8b00db9ac842b3f926513cf49473e000', // contract
]);

const eligible = holders.filter(x => !EXCLUDE.has(x.a.toLowerCase()) && parseInt(x.q) >= 1);

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function giftPack(recipient, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(`${API_BASE}/api/pulls/gift`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient,
          packType: PACK_TYPE,
          count: 1,
          adminKey: ADMIN_KEY
        })
      });
      const data = await res.json();
      if (!res.ok) {
        console.error(`  FAIL ${recipient}: ${data.error || res.status}`);
        if (data.error?.includes('insufficient') && attempt < retries) {
          console.error(`  Gas issue, waiting 10s...`);
          await sleep(10000);
          continue;
        }
        return null;
      }
      return data;
    } catch (e) {
      console.error(`  ERROR ${recipient} attempt ${attempt}: ${e.message}`);
      if (attempt < retries) await sleep(5000);
    }
  }
  return null;
}

async function main() {
  console.log(`=== TCG Arena Airdrop ===`);
  console.log(`Eligible holders: ${eligible.length}`);
  console.log(`Pack type: ${PACK_TYPE} (5 cards each)`);
  console.log(`Total NFTs to mint: ${eligible.length * 5}`);
  console.log('');

  let success = 0, fail = 0;
  const failed = [];

  for (let i = 0; i < eligible.length; i++) {
    const h = eligible[i];
    console.log(`[${i+1}/${eligible.length}] Gifting to ${h.a} (${h.q} TCG)...`);
    
    const result = await giftPack(h.a);
    if (result) {
      const tokenIds = result.tokenIds || result.cards?.map(c => c.tokenId) || [];
      console.log(`  ✅ Success! Cards: ${result.cards?.length || '?'}, TokenIds: ${tokenIds.join(',') || 'n/a'}`);
      success++;
    } else {
      console.log(`  ❌ Failed`);
      fail++;
      failed.push(h.a);
    }

    // Small delay between mints to avoid nonce issues
    if (i < eligible.length - 1) await sleep(3000);
  }

  console.log('');
  console.log(`=== DONE ===`);
  console.log(`Success: ${success}/${eligible.length}`);
  console.log(`Failed: ${fail}`);
  if (failed.length) {
    console.log('Failed addresses:');
    failed.forEach(a => console.log(`  ${a}`));
  }
}

main().catch(e => { console.error(e); process.exit(1); });
