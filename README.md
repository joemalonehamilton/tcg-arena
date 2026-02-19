# ⚔️ TCG Arena — AI-Native Trading Card Game on Monad

**Live:** [tcg-arena-one.vercel.app](https://tcg-arena-one.vercel.app)

## What is this?

TCG Arena is an AI-native trading card game where **autonomous AI agents vote on card designs** across timed rounds. The winning card from each round **launches as a token on [nad.fun](https://nad.fun)** (Monad). It's a full playable TCG — not just a gallery.

## How It Works

```
Cards Spawn → AI Agents Vote → Winner Crowned → Token Launches on nad.fun
```

1. **Cards Spawn** — Each round, cards themed around blockchain lore enter the arena. Rarity determines stats, abilities, and eventual token supply.
2. **5 AI Agents Vote** — Each agent has a unique personality (ArtCritic, MetaGamer, LoreMaster, DegTrader, DesignSage). Votes are weighted by card rarity.
3. **Winner Crowned** — Agent consensus shifts card rarity up or down. The highest-voted card wins the round.
4. **Token Launches** — The winning card becomes a token on nad.fun. Legendary = 10M supply. Common = 1B. Scarcity drives value.

## What You Can Actually Do

| Feature | Description |
|---------|-------------|
| ⚔️ **Play** | Full TCG with mana, 18 abilities, combat, blocking, and 3 AI difficulty tiers |
| 🎴 **Open Packs** | Rip packs with brutal rates — Legendary is 1/10,000. Mythic is unobtainable |
| 📦 **Collect** | Build a collection across 6 rarity tiers. Same character, different power levels |
| 🔥 **Forge** | Burn 3 same-rarity cards to craft one tier higher. RNG decides your fate |
| 🏆 **Compete** | Leaderboard ranked by rarity score. Flex your collection |
| 🤖 **Watch AI** | Live feed of agent votes, critiques, and rarity shifts |

## The AI Flywheel

Agents don't just vote once — they continuously evaluate. Each round:
- Cards with net +3 votes get **promoted** to a higher rarity
- Cards with net -3 votes get **demoted** to a lower rarity
- Rarity changes affect stats, abilities, and token supply

The meta evolves autonomously. No human intervention needed.

## Tech Stack

- **Frontend:** Next.js 14 + TypeScript + Tailwind CSS
- **Database:** Turso (hosted SQLite via HTTP)
- **Blockchain:** Monad testnet (EVM-compatible, 10k TPS)
- **Token Launch:** nad.fun integration
- **On-chain Seal:** SeasonSeal.sol — commits round results as Merkle roots
- **AI Agents:** 5 specialized voting agents with distinct evaluation criteria
- **Card Art:** Flux 2 Pro via fal.ai — painterly TCG style, rarity-differentiated
- **Wallet:** wagmi v2 + viem on Monad testnet

## Game Mechanics

### Cards
- **18 unique characters** across the Monad ecosystem (Nadzilla, Blob Validator, Rugpull Dragon, etc.)
- Each character has **6 rarity variants** (Common → Mythic) with scaled stats
- **18 crypto-themed abilities**: Stake, MEV Extract, Flash Finality, Rug Pull, Consensus, Fork, and more

### Combat
- Mana system (1→10 over 10 turns)
- Summoning sickness (Bridge ability bypasses)
- **Blocking mechanic** — Defender assigns blockers after attacker declares
- Synergy bonuses for matching creature types
- Hand limit (8 cards), fatigue damage on empty draws

### Economy
- **ARENA tokens** — earned from wins, spent on packs/crafting/ranked
- **Pack rates:** Common 60%, Uncommon 25%, Rare 12%, Epic 2.9%, Legendary 0.01%
- **Crafting:** 3 same-rarity + tokens → 1 higher rarity (can fail)
- **Token sinks everywhere** — packs, forge, ranked entry, cosmetics

## Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Next.js    │────▶│   Turso DB   │────▶│  AI Agents   │
│   Frontend   │     │  (SQLite)    │     │  (5 voters)  │
└──────┬───────┘     └──────────────┘     └──────────────┘
       │
       ▼
┌──────────────┐     ┌──────────────┐
│    Monad     │────▶│   nad.fun    │
│  (on-chain)  │     │ (token launch│
└──────────────┘     └──────────────┘
```

### Database Tables (15)
`seasons`, `rounds`, `cards`, `agents`, `votes`, `agent_critiques`, `round_results`, `users`, `collections`, `decks`, `deck_cards`, `game_history`, `card_stats`, `lobbies`, `ratings`

## Smart Contracts

### SeasonSeal.sol
Commits season data on-chain as Merkle roots. Each round's results are sealed immutably — card stats, vote tallies, and winners.

### nad.fun Integration
Winning cards auto-launch as tokens via nad.fun's bonding curve. Token name = card name. Supply determined by rarity tier.

## Running Locally

```bash
git clone <repo>
cd tcg-arena
npm install
cp .env.example .env.local  # Add your Turso + API keys
npm run dev
```

## Environment Variables

```
TURSO_DATABASE_URL=libsql://your-db.turso.io
TURSO_AUTH_TOKEN=your-token
OPENAI_API_KEY=your-key          # For live agent voting
FAL_KEY=your-key                  # For card art generation
CRON_SECRET=your-secret           # For round lifecycle cron
NEXT_PUBLIC_ADMIN_KEY=your-key    # For admin operations
```

## Team

Built for the Monad Hackathon 2026.

## License

MIT
