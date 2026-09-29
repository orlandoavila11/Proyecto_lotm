-- Migración 007: Economía Victoriana, Calidad de Inventario, Transacciones y Ascenso de Secuencia
-- Sostiene el bucle material de la libra, telemetría de hesitación y tolerancia Kill-9 para la Escena del Trago

ALTER TABLE characters ADD COLUMN rent_debt_active INTEGER NOT NULL DEFAULT 0 CHECK (rent_debt_active IN (0, 1));
ALTER TABLE characters ADD COLUMN rent_debt_amount INTEGER NOT NULL DEFAULT 0;
ALTER TABLE characters ADD COLUMN rent_debt_note TEXT DEFAULT NULL;

ALTER TABLE inventory_items ADD COLUMN quality TEXT NOT NULL DEFAULT 'PRISTINE' CHECK (quality IN ('PRISTINE', 'DAMAGED', 'CONTAMINATED'));

CREATE TABLE IF NOT EXISTS market_transactions (
  id TEXT PRIMARY KEY,
  character_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('BUY', 'SELL', 'CURE')),
  item_code TEXT,
  quality TEXT,
  pence_amount INTEGER NOT NULL,
  day INTEGER NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS ascension_telemetry (
  id TEXT PRIMARY KEY,
  character_id TEXT NOT NULL,
  target_sequence INTEGER NOT NULL,
  target_pathway TEXT NOT NULL,
  outcome TEXT NOT NULL CHECK (outcome IN ('SUCCESS', 'RAMPAGE')),
  presented_at INTEGER NOT NULL,
  confirmed_at INTEGER NOT NULL,
  hesitation_ms INTEGER NOT NULL,
  preparation_score INTEGER NOT NULL,
  quality_average TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS ascension_state (
  character_id TEXT PRIMARY KEY,
  current_step TEXT NOT NULL CHECK (current_step IN ('CHECKLIST_IN_PROGRESS', 'TRAGO_PRESENTED', 'COMPLETED', 'FAILED')),
  presented_at INTEGER,
  checklist_json TEXT NOT NULL DEFAULT '{}',
  formula_id TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE
);
