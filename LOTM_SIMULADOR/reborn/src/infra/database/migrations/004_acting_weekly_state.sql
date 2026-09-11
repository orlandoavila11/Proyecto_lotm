-- Migración 004: Persistencia de estado semanal de Acting y descomposición de dilemas (Brief-05)
ALTER TABLE acting_records ADD COLUMN alignment INTEGER DEFAULT 0;
ALTER TABLE acting_records ADD COLUMN acting_weight REAL DEFAULT 1.0;
ALTER TABLE acting_records ADD COLUMN decay_applied REAL DEFAULT 1.0;

CREATE TABLE IF NOT EXISTS acting_weekly_states (
  character_id TEXT PRIMARY KEY,
  current_week INTEGER NOT NULL DEFAULT 1,
  coherence REAL NOT NULL DEFAULT 0.0,
  variety_penalty REAL NOT NULL DEFAULT 0.0,
  instability_flag INTEGER NOT NULL DEFAULT 0 CHECK (instability_flag IN (0, 1)),
  loss_of_self_risk_flag INTEGER NOT NULL DEFAULT 0 CHECK (loss_of_self_risk_flag IN (0, 1)),
  weekly_records_json TEXT NOT NULL DEFAULT '[]',
  history_json TEXT NOT NULL DEFAULT '[]',
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_acting_records_char_day ON acting_records(character_id, day);
