-- Migración 002: Persistencia transaccional de combates (eliminación de memoria volátil)
CREATE TABLE IF NOT EXISTS battles (
  id TEXT PRIMARY KEY,
  character_id TEXT NOT NULL,
  state_json TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('ONGOING', 'VICTORY', 'DEFEAT', 'FLED')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_battles_char_status ON battles(character_id, status);

