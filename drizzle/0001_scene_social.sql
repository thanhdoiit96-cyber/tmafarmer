CREATE TABLE IF NOT EXISTS farm_presence (
  room TEXT NOT NULL,
  player TEXT NOT NULL,
  scene TEXT NOT NULL,
  x REAL NOT NULL,
  y REAL NOT NULL,
  facing TEXT NOT NULL,
  walking INTEGER NOT NULL,
  seen INTEGER NOT NULL,
  PRIMARY KEY (room, player)
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS farm_presence_scene ON farm_presence(room, scene, seen);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS farm_chat (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  room TEXT NOT NULL,
  player TEXT NOT NULL,
  scene TEXT NOT NULL,
  text TEXT NOT NULL,
  sent INTEGER NOT NULL,
  nonce TEXT NOT NULL,
  UNIQUE (room, player, nonce)
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS farm_chat_scene ON farm_chat(room, scene, id);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS farm_chat_sender ON farm_chat(room, player, sent);
