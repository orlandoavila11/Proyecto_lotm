-- ====================================================================
-- LOTM_ENGINE_REBORN: ESQUEMA RELACIONAL SQLITE ESTRICTO
-- Sistema de Persistencia Transaccional para la Quinta Época (S9 a S7)
-- ====================================================================

PRAGMA foreign_keys = ON;

-- 1. PERSONAJES PRINCIPALES
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
  raw_pence INTEGER NOT NULL DEFAULT 7200, -- 7200 peniques = £30 libras iniciales
  current_location TEXT NOT NULL DEFAULT 'Backlund - Distrito de Cherwood',
  current_day INTEGER NOT NULL DEFAULT 1,
  ruina INTEGER NOT NULL DEFAULT 0 CHECK (ruina >= 0),
  terminal_state TEXT DEFAULT NULL CHECK (terminal_state IN (NULL, 'ALIVE', 'DEAD', 'LOST', 'TRANSFORMED', 'NPC_CONVERTED', 'SPECIAL_END')),
  rent_debt_active INTEGER NOT NULL DEFAULT 0 CHECK (rent_debt_active IN (0, 1)),
  rent_debt_amount INTEGER NOT NULL DEFAULT 0,
  rent_debt_note TEXT DEFAULT NULL,
  origin_id TEXT DEFAULT NULL,
  current_slot INTEGER NOT NULL DEFAULT 0 CHECK (current_slot >= 0 AND current_slot <= 3),
  work_attendance_weekly INTEGER NOT NULL DEFAULT 0,
  consecutive_work_missed INTEGER NOT NULL DEFAULT 0,
  prologue_step TEXT NOT NULL DEFAULT 'COMPLETED' CHECK (prologue_step IN ('INTRO', 'BENEFACTOR_LETTER', 'TUTORIAL_DILEMMA', 'TUTORIAL_CLUE', 'POTION_CHOICE', 'FIRST_DRINK', 'COMPLETED')),
  prologue_data_json TEXT NOT NULL DEFAULT '{}',
  salary_pence INTEGER NOT NULL DEFAULT 240,
  employer_name TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 2. IDENTIDADES CIVILES (DOBLE VIDA)
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

-- 3. ANCLAS DE HUMANIDAD
CREATE TABLE IF NOT EXISTS anchors (
  id TEXT PRIMARY KEY,
  character_id TEXT NOT NULL,
  title TEXT NOT NULL,
  strength INTEGER NOT NULL CHECK (strength >= 0 AND strength <= 100),
  category TEXT NOT NULL DEFAULT 'ROUTINE',
  type TEXT NOT NULL DEFAULT 'ROUTINE',
  name TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  damage_count INTEGER NOT NULL DEFAULT 0,
  is_destroyed INTEGER NOT NULL DEFAULT 0 CHECK (is_destroyed IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE
);

-- 3.1 CICATRICES PERMANENTES
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

-- 3.2 REGISTRO DE COMPRAS DE SUSURROS [S]
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

-- 3.3 EVENTOS DE RAMPAGE
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

-- 4. INVENTARIO Y ARTEFACTOS
CREATE TABLE IF NOT EXISTS inventory_items (
  id TEXT PRIMARY KEY,
  character_id TEXT NOT NULL,
  item_code TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('INGREDIENT', 'CHARACTERISTIC', 'POTION', 'SEALED_ARTIFACT', 'CONSUMABLE', 'DOCUMENT', 'WEAPON')),
  grade INTEGER CHECK (grade IN (0, 1, 2, 3)),
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity >= 1),
  metadata_json TEXT DEFAULT '{}',
  quality TEXT NOT NULL DEFAULT 'PRISTINE' CHECK (quality IN ('PRISTINE', 'DAMAGED', 'CONTAMINATED')),
  is_equipped INTEGER NOT NULL DEFAULT 0 CHECK (is_equipped IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE
);

-- 5. REGISTRO DE ACTUACIÓN Y DILEMAS
CREATE TABLE IF NOT EXISTS acting_records (
  id TEXT PRIMARY KEY,
  character_id TEXT NOT NULL,
  pathway TEXT NOT NULL,
  sequence INTEGER NOT NULL,
  dilemma_id TEXT NOT NULL,
  choice_id TEXT NOT NULL,
  digestion_gained REAL NOT NULL,
  sanity_delta INTEGER NOT NULL,
  alignment INTEGER DEFAULT 0,
  acting_weight REAL DEFAULT 1.0,
  decay_applied REAL DEFAULT 1.0,
  day INTEGER NOT NULL,
  narrative_log TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE
);

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

-- 6. CASOS DE INVESTIGACIÓN POLICIAL/MÍSTICA
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

-- 7. PISTAS Y EVIDENCIAS
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

-- 8. DISTRITOS URBANOS Y CONVERGENCIA
CREATE TABLE IF NOT EXISTS districts (
  id TEXT PRIMARY KEY,
  city TEXT NOT NULL DEFAULT 'Backlund',
  district_name TEXT NOT NULL,
  tension_level INTEGER NOT NULL DEFAULT 10 CHECK (tension_level >= 0 AND tension_level <= 100),
  inquisitorial_alert INTEGER NOT NULL DEFAULT 10 CHECK (inquisitorial_alert >= 0 AND inquisitorial_alert <= 100),
  convergence_index INTEGER NOT NULL DEFAULT 5 CHECK (convergence_index >= 0 AND convergence_index <= 100),
  last_incident_day INTEGER DEFAULT 0
);

-- 9. TRANSACCIONES DE MERCADO Y CURAS
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

-- 10. TELEMETRÍA DE HESITACIÓN DE ASCENSO
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

-- 11. ESTADO PERSISTENTE DE ASCENSO (KILL-9 TOLERANCE)
CREATE TABLE IF NOT EXISTS ascension_state (
  character_id TEXT PRIMARY KEY,
  current_step TEXT NOT NULL CHECK (current_step IN ('CHECKLIST_IN_PROGRESS', 'TRAGO_PRESENTED', 'COMPLETED', 'FAILED')),
  presented_at INTEGER,
  checklist_json TEXT NOT NULL DEFAULT '{}',
  formula_id TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE
);

-- 12. LOG CRONOLÓGICO DE EVENTOS DEL CALENDARIO
CREATE TABLE IF NOT EXISTS calendar_log (
  id TEXT PRIMARY KEY,
  character_id TEXT NOT NULL,
  day INTEGER NOT NULL,
  slot INTEGER NOT NULL,
  event_type TEXT NOT NULL,
  subsystem TEXT NOT NULL,
  step_order INTEGER NOT NULL DEFAULT 0,
  details_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE
);

-- 13. HISTORIAL DE EVENTOS DE IDENTIDAD
CREATE TABLE IF NOT EXISTS identity_event_history (
  id TEXT PRIMARY KEY,
  character_id TEXT NOT NULL,
  event_id TEXT NOT NULL,
  event_category TEXT NOT NULL,
  chosen_option_index INTEGER NOT NULL,
  day INTEGER NOT NULL,
  slot INTEGER NOT NULL,
  stat_outcome_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE
);

