-- Migración 001: Esquema inicial de persistencia relacional
CREATE TABLE IF NOT EXISTS characters (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  pathway TEXT NOT NULL,
  sequence INTEGER NOT NULL CHECK (sequence >= 0 AND sequence <= 9),
  current_health INTEGER NOT NULL CHECK (current_health >= 0),
  max_health INTEGER NOT NULL CHECK (max_health > 0),
  current_spirituality INTEGER NOT NULL CHECK (current_spirituality >= 0),
  max_spirituality INTEGER NOT NULL CHECK (max_spirituality > 0),
  sanity INTEGER NOT NULL CHECK (sanity >= 0 AND sanity <= 100),
  corruption INTEGER NOT NULL CHECK (corruption >= 0 AND corruption <= 100),
  digestion_progress REAL NOT NULL CHECK (digestion_progress >= 0.0 AND digestion_progress <= 100.0),
  raw_pence INTEGER NOT NULL DEFAULT 7200,
  current_location TEXT NOT NULL DEFAULT 'Backlund - Distrito de Cherwood',
  current_day INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS personas (
  id TEXT PRIMARY KEY,
  character_id TEXT NOT NULL,
  legal_name TEXT NOT NULL,
  profession TEXT NOT NULL,
  social_class TEXT NOT NULL CHECK (social_class IN ('POOR', 'WORKING_CLASS', 'MIDDLE_CLASS', 'ARISTOCRAT')),
  district TEXT NOT NULL,
  police_suspicion INTEGER NOT NULL DEFAULT 5 CHECK (police_suspicion >= 0 AND police_suspicion <= 100),
  church_suspicion INTEGER NOT NULL DEFAULT 5 CHECK (church_suspicion >= 0 AND church_suspicion <= 100),
  human_anchors INTEGER NOT NULL DEFAULT 35 CHECK (human_anchors >= 0 AND human_anchors <= 100),
  is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  is_compromised INTEGER NOT NULL DEFAULT 0 CHECK (is_compromised IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS anchors (
  id TEXT PRIMARY KEY,
  character_id TEXT NOT NULL,
  title TEXT NOT NULL,
  strength INTEGER NOT NULL CHECK (strength >= 1 AND strength <= 100),
  category TEXT NOT NULL CHECK (category IN ('FAMILY', 'CIVILIAN_ROUTINE', 'DIARY', 'BELIEF', 'BOND')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS inventory_items (
  id TEXT PRIMARY KEY,
  character_id TEXT NOT NULL,
  item_code TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('INGREDIENT', 'CHARACTERISTIC', 'POTION', 'SEALED_ARTIFACT', 'CONSUMABLE', 'DOCUMENT', 'WEAPON')),
  grade INTEGER CHECK (grade IN (0, 1, 2, 3)),
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity >= 1),
  metadata_json TEXT DEFAULT '{}',
  is_equipped INTEGER NOT NULL DEFAULT 0 CHECK (is_equipped IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS acting_records (
  id TEXT PRIMARY KEY,
  character_id TEXT NOT NULL,
  pathway TEXT NOT NULL,
  sequence INTEGER NOT NULL,
  dilemma_id TEXT NOT NULL,
  choice_id TEXT NOT NULL,
  digestion_gained REAL NOT NULL,
  sanity_delta INTEGER NOT NULL,
  day INTEGER NOT NULL,
  narrative_log TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS investigation_cases (
  id TEXT PRIMARY KEY,
  character_id TEXT NOT NULL,
  case_code TEXT NOT NULL,
  title TEXT NOT NULL,
  district TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('OPEN', 'EVIDENCE_COLLECTED', 'READY_FOR_DEDUCTION', 'SOLVED', 'FAILED', 'COVERED_UP')),
  culprit_name TEXT NOT NULL,
  verdict_action TEXT,
  reward_pence INTEGER NOT NULL DEFAULT 0,
  created_day INTEGER NOT NULL,
  FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS investigation_clues (
  id TEXT PRIMARY KEY,
  case_id TEXT NOT NULL,
  clue_code TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  clue_type TEXT NOT NULL CHECK (clue_type IN ('FORENSIC', 'SPIRITUAL', 'TESTIMONY', 'DOCUMENT')),
  is_discovered INTEGER NOT NULL DEFAULT 0 CHECK (is_discovered IN (0, 1)),
  FOREIGN KEY (case_id) REFERENCES investigation_cases(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS districts (
  id TEXT PRIMARY KEY,
  city TEXT NOT NULL DEFAULT 'Backlund',
  district_name TEXT NOT NULL,
  tension_level INTEGER NOT NULL DEFAULT 10 CHECK (tension_level >= 0 AND tension_level <= 100),
  inquisitorial_alert INTEGER NOT NULL DEFAULT 10 CHECK (inquisitorial_alert >= 0 AND inquisitorial_alert <= 100),
  convergence_index INTEGER NOT NULL DEFAULT 5 CHECK (convergence_index >= 0 AND convergence_index <= 100),
  last_incident_day INTEGER DEFAULT 0
);
