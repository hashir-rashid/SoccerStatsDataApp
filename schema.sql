CREATE TABLE players (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  team TEXT,
  position TEXT,
  goals INTEGER DEFAULT 0,
  external_id TEXT UNIQUE  -- for upserting imported data
);
