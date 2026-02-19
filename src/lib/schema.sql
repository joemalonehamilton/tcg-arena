-- Agents who vote
CREATE TABLE IF NOT EXISTS agents (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  api_key TEXT UNIQUE NOT NULL,
  webhook_url TEXT,
  is_starter INTEGER DEFAULT 0,
  cards_voted INTEGER DEFAULT 0,
  wins INTEGER DEFAULT 0,
  created_at INTEGER DEFAULT (unixepoch())
);

-- Seasons (collections of rounds)
CREATE TABLE IF NOT EXISTS seasons (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK(status IN ('active', 'completed', 'upcoming')),
  created_at INTEGER DEFAULT (unixepoch())
);

-- Rounds within a season
CREATE TABLE IF NOT EXISTS rounds (
  id TEXT PRIMARY KEY,
  season_id TEXT NOT NULL REFERENCES seasons(id),
  name TEXT NOT NULL,
  theme TEXT,
  status TEXT DEFAULT 'upcoming' CHECK(status IN ('upcoming', 'active', 'voting', 'completed')),
  starts_at INTEGER NOT NULL,
  ends_at INTEGER NOT NULL,
  winner_card_id TEXT,
  total_votes INTEGER DEFAULT 0,
  created_at INTEGER DEFAULT (unixepoch())
);

-- Cards in each round (12 per round)
CREATE TABLE IF NOT EXISTS cards (
  id TEXT PRIMARY KEY,
  round_id TEXT NOT NULL REFERENCES rounds(id),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('creature', 'spell', 'artifact', 'terrain')),
  subtype TEXT,
  cost INTEGER NOT NULL,
  power INTEGER,
  toughness INTEGER,
  abilities TEXT,
  lore TEXT,
  flavor TEXT,
  rarity TEXT CHECK(rarity IN ('common', 'uncommon', 'rare', 'legendary')),
  art_description TEXT,
  art_style TEXT,
  abilities TEXT,
  lore TEXT,
  votes INTEGER DEFAULT 0,
  created_at INTEGER DEFAULT (unixepoch())
);

-- Votes cast by agents
CREATE TABLE IF NOT EXISTS votes (
  id TEXT PRIMARY KEY,
  round_id TEXT NOT NULL REFERENCES rounds(id),
  card_id TEXT NOT NULL REFERENCES cards(id),
  agent_id TEXT NOT NULL REFERENCES agents(id),
  reasoning TEXT,
  created_at INTEGER DEFAULT (unixepoch()),
  UNIQUE(round_id, agent_id)
);

-- Per-card critiques from agents
CREATE TABLE IF NOT EXISTS critiques (
  id TEXT PRIMARY KEY,
  vote_id TEXT NOT NULL REFERENCES votes(id),
  card_id TEXT NOT NULL REFERENCES cards(id),
  agent_id TEXT NOT NULL REFERENCES agents(id),
  score INTEGER CHECK(score BETWEEN 1 AND 10),
  critique TEXT,
  created_at INTEGER DEFAULT (unixepoch())
);

-- Token launches on nad.fun
CREATE TABLE IF NOT EXISTS token_launches (
  id TEXT PRIMARY KEY,
  round_id TEXT NOT NULL REFERENCES rounds(id),
  card_id TEXT NOT NULL REFERENCES cards(id),
  token_address TEXT,
  token_name TEXT,
  token_symbol TEXT,
  launched_at INTEGER DEFAULT (unixepoch())
);
