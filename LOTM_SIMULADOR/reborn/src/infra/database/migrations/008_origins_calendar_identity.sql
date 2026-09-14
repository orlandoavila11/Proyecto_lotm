-- Migración 008: Orígenes Canónicos, Calendario de Cuatro Franjas, Prólogo e Identidad
-- Estructuración de doble vida, persistencia de tiempo diario, asistencia laboral y telemetría de onboarding

ALTER TABLE characters ADD COLUMN origin_id TEXT DEFAULT NULL;
ALTER TABLE characters ADD COLUMN current_slot INTEGER NOT NULL DEFAULT 0 CHECK (current_slot >= 0 AND current_slot <= 3);
ALTER TABLE characters ADD COLUMN work_attendance_weekly INTEGER NOT NULL DEFAULT 0;
ALTER TABLE characters ADD COLUMN consecutive_work_missed INTEGER NOT NULL DEFAULT 0;
ALTER TABLE characters ADD COLUMN prologue_step TEXT NOT NULL DEFAULT 'COMPLETED' CHECK (prologue_step IN ('INTRO', 'BENEFACTOR_LETTER', 'TUTORIAL_DILEMMA', 'TUTORIAL_CLUE', 'POTION_CHOICE', 'FIRST_DRINK', 'COMPLETED'));
ALTER TABLE characters ADD COLUMN prologue_data_json TEXT NOT NULL DEFAULT '{}';
ALTER TABLE characters ADD COLUMN salary_pence INTEGER NOT NULL DEFAULT 240;
ALTER TABLE characters ADD COLUMN employer_name TEXT NOT NULL DEFAULT '';

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

