# TCG Arena — Full Codebase Audit
**Date:** 2026-02-17  
**Auditor:** Plablem  

---

## 🔴 CRITICAL Issues

### 1. Payment Verification Race Condition — Can Mint Multiple Times Per Payment
**File:** `src/app/api/pulls/mint/route.ts`  
**Issue:** The dedup check uses `txHash` from the client, but `txHash` is the **payment tx** (user's transfer to treasury), not the mint tx. The payment verification scans the last ~100 blocks for ANY qualifying transfer. If a user calls `/api/pulls/mint` rapidly with the same txHash before the first mint completes, the dedup check (`SELECT 1 FROM card_pulls WHERE tx_hash = ?`) may not catch it due to async timing — the first INSERT hasn't committed yet.  
**Impact:** Double/triple minting from a single payment.  
**Fix:** Use a DB-level unique constraint on `tx_hash` column, or add `INSERT ... ON CONFLICT DO NOTHING` pattern with immediate return.

### 2. Payment Verification Only Checks Last ~100 Blocks
**File:** `src/app/api/pulls/mint/route.ts` (line ~40-70)  
**Issue:** `verifyPayment()` only looks at the last 100 blocks for Transfer events. On Monad (fast block times), 100 blocks = seconds. If there's any delay between user paying and the mint request arriving (network lag, slow UI), the payment could be outside the window.  
**Impact:** Legitimate payments failing verification — "cards disappearing" (the original bug report symptom).  
**Fix:** Increase block range significantly (e.g., 1000+ blocks) or use the txHash to look up the specific transaction receipt instead.

### 3. Hardcoded Admin Key — `tcg-admin-key`
**Files:** `src/app/api/seal/route.ts`, `src/app/api/season/route.ts`  
**Issue:** Admin auth key is hardcoded as `'tcg-admin-key'` in source code (deployed to Vercel, visible in build output). Anyone can trigger season seals or start new seasons.  
**Impact:** Anyone can manipulate game seasons.  
**Fix:** Move to env var (`process.env.ADMIN_API_KEY`).

### 4. No Auth on Community Card/Agent Approve/Reject
**Files:** `src/app/api/community/cards/[id]/approve/route.ts`, `reject/route.ts`, `community/agents/[id]/approve/route.ts`, `reject/route.ts`  
**Issue:** Zero authentication. Anyone can POST to approve/reject community cards and agents.  
**Impact:** Complete takeover of community content pipeline.  
**Fix:** Add admin auth check (API key or wallet verification).

### 5. No Auth on ELO Updates
**File:** `src/app/api/elo/route.ts`  
**Issue:** POST endpoint accepts `{ wallet, won, difficulty }` with no auth. Anyone can boost their ELO by sending `{ wallet: "0x...", won: true, difficulty: "degen" }` repeatedly.  
**Impact:** Leaderboard manipulation.  
**Fix:** Verify the game was actually played (check game_history), or use server-side ELO updates only.

### 6. No Auth on Game Creation/Updates
**Files:** `src/app/api/game/route.ts`, `src/app/api/game/[id]/route.ts`  
**Issue:** Anyone can create fake games and set arbitrary winners via PUT.  
**Impact:** Fake game history, stats manipulation.  
**Fix:** Verify caller is a participant; validate game state server-side.

---

## 🟠 HIGH Issues

### 7. TCG Token Address Mismatch
**Files:** `src/lib/tcg-token.ts` vs `src/app/api/pulls/mint/route.ts`  
**Issue:** `tcg-token.ts` exports `TCG_TOKEN_ADDRESS = '0x94CF69B5...'` but the mint route hardcodes `TCG_TOKEN = '0x94CF69B5b13E621cB11f5153724AFb58c7337777'`. These match currently, but having two sources of truth is a maintenance risk.  
**Fix:** Import from `tcg-token.ts` everywhere.

### 8. TREASURY = REWARD_POOL = Same Wallet
**Files:** `src/app/api/pulls/mint/route.ts`, `src/app/api/rewards/pool/route.ts`  
**Issue:** Treasury address (`0xb929...`) is also the reward pool wallet. The mint route burns 50% of pack cost FROM treasury. The reward distribution also sends FROM treasury. These compete for the same balance.  
**Fix:** Separate treasury and reward pool wallets, or at minimum track allocations in DB.

### 9. Lobby/PvP No Turn Timeout Enforcement
**File:** `src/app/api/lobby/[code]/route.ts`  
**Issue:** `turn_deadline` is set but never checked/enforced. A player can stall forever.  
**Fix:** Add cron or check that auto-forfeits if deadline passed.

### 10. Collection Page Shows Stale Cache, No Invalidation
**File:** `src/app/collection/page.tsx`  
**Issue:** Tries `/api/pulls/cache` first. If cached data exists for the wallet, uses it without checking freshness. New mints won't show until cache is manually refreshed via POST.  
**Fix:** Always fall through to live query after showing cache, or add a cache-bust parameter after pack opening (e.g., redirect with `?t=timestamp`).

### 11. Referral Revenue Not Actually Paid Out
**Files:** `src/app/api/pulls/mint/route.ts`, `src/app/api/referrals/route.ts`  
**Issue:** Referrals are logged to DB, and the GET endpoint calculates `totalEarned: count * 0.05`, but no TCG tokens are actually transferred to the referrer. It's just a display number.  
**Fix:** Either implement actual referral payouts or clearly label as "upcoming."

---

## 🟡 MEDIUM Issues

### 12. Deck CRUD Has No Ownership Verification
**File:** `src/app/api/decks/route.ts`  
**Issue:** PUT/DELETE don't verify the caller owns the deck. Anyone with a deck_id can modify or delete another user's deck.  
**Fix:** Check `user_id` matches the deck owner.

### 13. Lobby Join Has No Rate Limit
**File:** `src/app/api/lobby/[code]/route.ts`  
**Issue:** No rate limiting on lobby actions. Could spam state updates.  
**Fix:** Add rate limiting or request signing.

### 14. `openPack()` Client-Side RNG — Cards Known Before Mint
**File:** `src/lib/packs.ts`  
**Issue:** Card selection (`openPack()`) runs client-side with `Math.random()`. Users can predict/manipulate pulls. The same cards are then sent to the mint endpoint. A user could modify the request to mint whatever cards they want (e.g., all legendaries).  
**Impact:** Users can mint arbitrary rarity cards.  
**Fix:** Move card generation server-side in the mint endpoint. Client should only send `packType`, not the cards.

### 15. Referrals Route Uses Raw Turso HTTP Instead of Shared Client
**File:** `src/app/api/referrals/route.ts`  
**Issue:** Duplicates the Turso HTTP client instead of importing from `@/lib/turso`. Also calls `ensureTable()` on every request (CREATE TABLE IF NOT EXISTS).  
**Fix:** Use shared `execute()` from turso.ts. Run migrations separately.

### 16. Reward Distribution Has No Replay Protection
**File:** `src/app/api/rewards/distribute/route.ts`  
**Issue:** No tracking of when distributions happened. Could be called multiple times in a week, draining the pool.  
**Fix:** Log distributions with timestamps; check last distribution date before allowing another.

### 17. `DEPLOYER_PRIVATE_KEY` Used for Both Minting and Reward Distribution  
**Files:** `src/app/api/pulls/mint/route.ts`, `src/app/api/rewards/distribute/route.ts`  
**Issue:** Same key controls NFT minting and token transfers. If compromised, attacker gets both capabilities.  
**Fix:** Use separate keys with minimal permissions.

---

## 🟢 LOW Issues

### 18. Dead `collections` API Route
**File:** `src/app/api/collections/route.ts`  
**Issue:** Reads/writes to a `collections` DB table, but the collection page reads from on-chain NFTs. This endpoint appears unused.  
**Fix:** Remove or document as deprecated.

### 19. `leaderboard/route.ts` Uses DB-Based ELO
**File:** `src/app/api/leaderboard/route.ts`  
**Issue:** Queries `users` and `game_history` tables for leaderboard. But the leaderboard page (`/leaderboard`) likely uses the NFT-based scoring from `/api/pulls`. Two competing leaderboard systems.  
**Fix:** Consolidate or clearly separate "ELO leaderboard" vs "Collection leaderboard."

### 20. Missing `REWARDS_API_SECRET` Will Block Distributions
**File:** `src/app/api/rewards/distribute/route.ts`  
**Issue:** If `REWARDS_API_SECRET` env var isn't set, `!apiSecret` is true and ALL distribution calls fail with 401.  
**Fix:** Document required env vars; add setup verification.

### 21. Season Manager Is In-Memory
**File:** `src/lib/season-manager.ts` (referenced by seal/season routes)  
**Issue:** Season state likely stored in module-level variables. On Vercel serverless, each request could get a fresh instance. Season state would be lost between invocations.  
**Fix:** Persist season state in Turso DB.

### 22. `og/[cardName]/route.tsx` — Potential XSS in OG Image
**File:** `src/app/api/og/[cardName]/route.tsx`  
**Issue:** Card name from URL param rendered into OG image without sanitization.  
**Fix:** Sanitize input.

---

## 📋 Required Environment Variables
Based on audit, these env vars must be set on Vercel:
- `TURSO_DATABASE_URL` ✅
- `TURSO_AUTH_TOKEN` ✅  
- `DEPLOYER_PRIVATE_KEY` ✅
- `REWARDS_API_SECRET` ⚠️ (may not be set)
- `SEASON_SEAL_ADDRESS` (has fallback default)
- `OPENAI_API_KEY` (for AI agents)

---

## 🎯 Priority Fix Order

1. **#14 — Client-side card generation** (users can mint arbitrary cards) — CRITICAL
2. **#2 — Payment verification block window too small** — CRITICAL  
3. **#1 — Mint dedup race condition** — CRITICAL
4. **#3 — Hardcoded admin key** — CRITICAL
5. **#4 — No auth on approve/reject** — CRITICAL
6. **#5 — No auth on ELO** — CRITICAL
7. **#10 — Stale cache on collection page** — HIGH (UX)
8. **#8 — Treasury/reward pool same wallet** — HIGH
9. **#16 — Reward distribution replay** — MEDIUM
10. **#12 — Deck ownership** — MEDIUM
