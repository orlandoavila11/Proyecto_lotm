-- Migración 005: Trayectoria Somática, Ruina Permanente, Anclas Tipadas, Cicatrices, Susurros [S] y Rampage Events (Brief-06)

-- 1. Acumulador de Ruina y Estado Terminal en characters
ALTER TABLE characters ADD COLUMN ruina INTEGER NOT NULL DEFAULT 0 CHECK (ruina >= 0);
ALTER TABLE characters ADD COLUMN terminal_state TEXT DEFAULT NULL CHECK (terminal_state IN (NULL, 'ALIVE', 'DEAD', 'LOST', 'TRANSFORMED', 'NPC_CONVERTED', 'SPECIAL_END'));

-- 2. Tabla anchors v2 con tipología de Brief-06 y soporte de fuerza 0 (destruida)
CREATE TABLE IF NOT EXISTS anchors_v2 (
  id TEXT PRIMARY KEY,
  character_id TEXT NOT NULL,
  title TEXT NOT NULL,
  strength INTEGER NOT NULL CHECK (strength >= 0 AND strength <= 100),
  category TEXT NOT NULL DEFAULT 'CIVILIAN_ROUTINE',
  type TEXT NOT NULL DEFAULT 'ROUTINE',
  name TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  damage_count INTEGER NOT NULL DEFAULT 0,
  is_destroyed INTEGER NOT NULL DEFAULT 0 CHECK (is_destroyed IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE
);

INSERT OR IGNORE INTO anchors_v2 (id, character_id, title, strength, category, type, name, description, damage_count, is_destroyed, created_at)
  SELECT id, character_id, title, strength, category, 'ROUTINE', title, '', 0, 0, created_at FROM anchors;

DROP TABLE anchors;
ALTER TABLE anchors_v2 RENAME TO anchors;

-- 3. Tabla de Cicatrices permanentes (Scars)
CREATE TABLE IF NOT EXISTS character_scars (
  id TEXT PRIMARY KEY,
  character_id TEXT NOT NULL,
  scar_code TEXT NOT NULL,
  name TEXT NOT NULL,
  narrative TEXT NOT NULL,
  origin_anchor_id TEXT,
  is_severe INTEGER NOT NULL DEFAULT 0 CHECK (is_severe IN (0, 1)),
  mechanics_json TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_scars_character_id ON character_scars(character_id);

-- 4. Registro de compras de susurros [S] (Auditoría irrefutable de precios cobrados)
CREATE TABLE IF NOT EXISTS somatics_whisper_purchases (
  id TEXT PRIMARY KEY,
  character_id TEXT NOT NULL,
  dilemma_id TEXT NOT NULL,
  choice_id TEXT NOT NULL,
  price_paid_json TEXT NOT NULL,
  advantage_granted_json TEXT NOT NULL,
  day INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE
);

-- 5. Tabla de Eventos de Rampage (Mini-expediente del yo persistido)
CREATE TABLE IF NOT EXISTS rampage_events (
  id TEXT PRIMARY KEY,
  character_id TEXT NOT NULL,
  trigger_reason TEXT NOT NULL,
  start_day INTEGER NOT NULL,
  end_day INTEGER NOT NULL,
  hours_skipped INTEGER NOT NULL,
  damaged_anchor_id TEXT,
  district_impact_json TEXT NOT NULL,
  case_impact_json TEXT NOT NULL,
  reconstruction_dossier_json TEXT NOT NULL,
  wake_narrative TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_rampage_character_id ON rampage_events(character_id);
