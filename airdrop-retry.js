// Retry airdrop for failed + remaining holders
const holders = require('./holders.json');

const API_BASE = 'https://tcgarena.fun';
const ADMIN_KEY = 'tcg-secret-admin-2026';
const PACK_TYPE = 'standard';

const EXCLUDE = new Set([
  '0xb929be8f1e0fb962471d8ebcd9899b09f0bd65ec',
  '0xa6e213507b2d10586d1c906b3297f849225ff981',
  '0x000000000000000000000000000000000000dead',
  '0xd30ba9421af215aecfdcab69cb4cd4ddf5681d8e',
  '0x0006776a8b00db9ac842b3f926513cf49473e000',
]);

// Already done successfully
const DONE = new Set([
  '0x4d095c36ea743dcc2515c132ce8ac2287c9f3fa6',
  '0x939e55c96b3d665352a7478053d57430a97709f9',
  '0x38de598fb927e0e7eeb83df73df6cb7d1e6ed688',
  '0x13e1e3d1cc511aa43bb8ed3d75a70f22b2f76f99',
  '0xc7942be92b9530c5fbfe6e3575675fcb2f824c05',
  '0x5007ddf292e683b15a4e21e95a1bf99bd6a87e7d',
  '0x7e80a7b427798122ec14098f59bda2234653b5a5',
  '0x73a87286e7372de610deb6b7d3cbb6111ef2c27c',
  '0xbffe8178097da230b519b99e9bfedc2b7e11c542',
  '0x9bd0312a3ede060aba705d69046116d184e9734f',
  '0x91a422f73de372ad873a28854f4b282b6ee4af73',
  '0x9c11977bc4d12e77773a200a6235d76dd58bb678',
  '0xa0c625e75372095e43be1e8ebb350652a239ef53',
  '0x00d6708962685bdd559fbff5d7b937a61ae064fd',
  '0x4c35fa795e1c4526ccdd564906cf0f03a583589f',
  '0xcb32ba81b18e1289be061776d7817ba19c6a83d5',
  '0x6d906089899ff6638f2889475932813645bee010',
  '0x874a1b0f2ba4a37e7886e5e26c54857571df42ad',
  '0x0e5a2e624d4d63b7729f61af4e38aea711bc25b7',
  '0x0823480cac322a3a5277141769c46ba16a986e56',
]);

const eligible = holders.filter(x => 
  !EXCLUDE.has(x.a.toLowerCase()) && 
  !DONE.has(x.a.toLowerCase()) && 
  parseInt(x.q) >= 1
);

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function giftPack(recipient, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(`${API_BASE}/api/pulls/gift`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipient, packType: PACK_TYPE, count: 1, adminKey: ADMIN_KEY })
      });
      const data = await res.json();
      if (!res.ok) {
        console.error(`  FAIL attempt ${attempt}: ${data.error || res.status}`);
        if (attempt < retries) { await sleep(15000); continue; }
        return null;
      }
      return data;
    } catch (e) {
      console.error(`  ERROR attempt ${attempt}: ${e.message}`);
      if (attempt < retries) await sleep(15000);
    }
  }
  return null;
}

async function main() {
  console.log(`=== TCG Arena Airdrop RETRY ===`);
  console.log(`Remaining: ${eligible.length} holders`);
  console.log(`Delay: 8s between mints`);
  console.log('');

  let success = 0, fail = 0;
  const failed = [];

  for (let i = 0; i < eligible.length; i++) {
    const h = eligible[i];
    console.log(`[${i+1}/${eligible.length}] Gifting to ${h.a} (${h.q} TCG)...`);
    
    const result = await giftPack(h.a);
    if (result) {
      const tokenIds = result.tokenIds || [];
      console.log(`  ✅ Success! Cards: ${result.cards?.length || '?'}, TokenIds: ${tokenIds.join(',') || 'n/a'}`);
      success++;
    } else {
      console.log(`  ❌ Failed`);
      fail++;
      failed.push(h.a);
    }

    if (i < eligible.length - 1) await sleep(8000);
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
