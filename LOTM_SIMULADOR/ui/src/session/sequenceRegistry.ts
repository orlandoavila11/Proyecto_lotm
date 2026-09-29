/**
 * REGISTRO CANÓNICO DE NOMBRES Y TÍTULOS DE SECUENCIAS
 * Garantiza resolución determinista y erradica el emparejamiento erróneo de títulos.
 * (e.g. Fool 8 siempre es Payaso, jamás Vidente).
 */

export const APPROVED_SEQUENCE_NAMES: Record<string, Record<number, string>> = {
  FOOL: {
    9: 'Vidente',
    8: 'Payaso',
    7: 'Mago',
    6: 'Hombre Sin Rostro',
    5: 'Maestro de Marionetas',
    4: 'Bribón Bizarro'
  },
  VISIONARY: {
    9: 'Espectador',
    8: 'Telépata',
    7: 'Psiquiatra',
    6: 'Hipnotizador',
    5: 'Caminante de Sueños',
    4: 'Manipulador'
  }
};

export function normalizePathwayKey(pathway: string): 'FOOL' | 'VISIONARY' {
  const upper = (pathway || '').toUpperCase().trim();
  if (upper.includes('FOOL') || upper.includes('SEER')) {
    return 'FOOL';
  }
  return 'VISIONARY';
}

export function resolvePathwayDisplayName(pathway: string): 'The Fool' | 'Visionary' {
  const norm = normalizePathwayKey(pathway);
  return norm === 'FOOL' ? 'The Fool' : 'Visionary';
}

export function resolveSequenceNameOnly(pathway: string, sequence: number): string {
  const norm = normalizePathwayKey(pathway);
  const name = APPROVED_SEQUENCE_NAMES[norm]?.[sequence];
  if (name) return name;
  return norm === 'FOOL' ? 'Iniciado del Misterio' : 'Observador Neutral';
}

export function resolveSequenceTitle(pathway: string, sequence: number): string {
  const name = resolveSequenceNameOnly(pathway, sequence);
  return `${name} (Secuencia ${sequence})`;
}
