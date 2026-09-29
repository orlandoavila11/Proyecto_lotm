-- Migración 009: Integridad de Comandos, Secuencias Persistentes e Idempotencia

CREATE TABLE IF NOT EXISTS entity_sequences (
  prefix TEXT PRIMARY KEY,
  last_val INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS command_receipts (
  command_id TEXT PRIMARY KEY,
  character_id TEXT NOT NULL,
  command_type TEXT NOT NULL,
  payload_hash TEXT NOT NULL,
  response_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_command_receipts_char ON command_receipts(character_id);

