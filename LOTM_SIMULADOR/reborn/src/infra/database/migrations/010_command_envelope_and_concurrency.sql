-- Migración 010: Sobre de Comandos, Concurrencia y Control de Revisión (P02)

-- Añadir columna de revisión a la tabla characters si no existe
-- En SQLite 3.35+, ALTER TABLE ADD COLUMN admite DEFAULT
ALTER TABLE characters ADD COLUMN revision INTEGER NOT NULL DEFAULT 1;

-- Añadir columna de revisión a la tabla command_receipts
ALTER TABLE command_receipts ADD COLUMN revision INTEGER DEFAULT 1;

-- Índices de consulta y rendimiento para recibos transaccionales
CREATE INDEX IF NOT EXISTS idx_command_receipts_type ON command_receipts(command_type);
CREATE INDEX IF NOT EXISTS idx_command_receipts_created ON command_receipts(created_at);
