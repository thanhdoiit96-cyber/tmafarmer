CREATE TABLE IF NOT EXISTS farm_accounts (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS farm_account_sessions (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  device_id TEXT,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  FOREIGN KEY(account_id) REFERENCES farm_accounts(id)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS farm_account_links (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL,
  room_code TEXT NOT NULL,
  farm_id TEXT NOT NULL,
  is_primary INTEGER NOT NULL DEFAULT 0,
  last_used_at INTEGER NOT NULL,
  UNIQUE(account_id, room_code, farm_id),
  FOREIGN KEY(account_id) REFERENCES farm_accounts(id)
);
