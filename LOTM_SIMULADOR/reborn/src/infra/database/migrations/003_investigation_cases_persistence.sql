-- Migración 003: Persistencia transaccional de instancias de casos de investigación (Fase 1 · Brief-04)
CREATE TABLE IF NOT EXISTS investigation_case_instances (
  id TEXT PRIMARY KEY,
  character_id TEXT NOT NULL,
  case_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('DORMANT', 'ACTIVE', 'RESOLVED', 'EXPIRED')),
  state_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_case_instances_char_status ON investigation_case_instances(character_id, status);
CREATE INDEX IF NOT EXISTS idx_case_instances_case_char ON investigation_case_instances(case_id, character_id);

