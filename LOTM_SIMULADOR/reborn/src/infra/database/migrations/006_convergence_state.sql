-- Migración 006: Estado y Persistencia Transaccional de Convergencia e Incursiones
-- Garantiza tolerancia Kill-9 para incidentes de convergencia y allanamientos de Halcones Nocturnos

CREATE TABLE IF NOT EXISTS convergence_events (
  id TEXT PRIMARY KEY,
  character_id TEXT NOT NULL,
  district_id TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('PUBLIC_COMBAT', 'ASCENSION', 'ECCLESIASTICAL_DILEMMA', 'WHISPER_PURCHASE', 'DECAY')),
  index_delta INTEGER NOT NULL,
  resulting_index INTEGER NOT NULL,
  day INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS pending_incursions (
  id TEXT PRIMARY KEY,
  character_id TEXT NOT NULL UNIQUE,
  district_id TEXT NOT NULL,
  squad_type TEXT NOT NULL DEFAULT 'NIGHTHAWKS_SQUAD',
  church_suspicion_snapshot INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('PENDING', 'ENGAGED', 'RESOLVED', 'FLED')),
  day INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE
);
