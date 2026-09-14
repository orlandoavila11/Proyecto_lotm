/**
 * Path to Godhood — Tipos Canónicos de la UI Diegética (BRIEF-10)
 * Ningún término mecánico expuesto al jugador.
 */

export type SanityTier = 'BRILLANTE' | 'VACILANTE' | 'CREPITANTE' | 'AHOGADA_EN_CERA';
export type CorruptionTier = 'AZOGUE_LIMPIO' | 'VAHO_TENUE' | 'REFLEJOS_DESFASADOS' | 'EL_REFLEJO_NO_PARPADEA';
export type RuinaTier = 'INTEGRO' | 'MARCADO' | 'EROSIONADO' | 'ROTO' | 'PERDIDO';
export type ActingCoherenceTier = 'COHERENTE' | 'TENSO' | 'ALIENADO' | 'FRACTURADO';

export type TimeSlot = 'MAÑANA' | 'TARDE' | 'NOCHE' | 'MADRUGADA';
export type DayOfWeek = 'LUNES' | 'MARTES' | 'MIÉRCOLES' | 'JUEVES' | 'VIERNES' | 'SÁBADO' | 'DOMINGO';

export type ConnectionType = 'ACUSA' | 'EXPLICA' | 'LOCALIZA' | 'CONTRADICE';

export interface AnchorItem {
  id: string;
  tipo: 'persona' | 'lugar' | 'rol' | 'convicción' | 'rutina';
  nombre: string;
  descripcion: string;
  fuerza: 'FIRME' | 'TENUE' | 'QUEBRADIZA';
}

export interface ClueItem {
  id: string;
  code: string;
  title: string;
  description: string;
  source: string;
  discoveredDay: number;
}

export interface ClueConnection {
  id: string;
  fromClueId: string;
  toClueId: string;
  type: ConnectionType;
  notes: string;
}

export interface InvestigationCase {
  id: string;
  title: string;
  district: string;
  status: 'ABIERTO' | 'RESUELTO' | 'ARCHIVADO';
  clues: ClueItem[];
  connections: ClueConnection[];
  hypotheses: string[];
  closedSources: { sourceName: string; reason: string }[];
}

export interface ActingLogEntry {
  id: string;
  day: number;
  principle: string;
  choiceTaken: string;
  narrativeOutcome: string;
}

export interface MarketProduct {
  id: string;
  name: string;
  category: 'INGREDIENTE' | 'BOTICARIO' | 'LIBRO';
  rarity: 'COMÚN' | 'INUSUAL' | 'RARO' | 'PROHIBIDO';
  priceDescription: string;
  costPence: number;
  description: string;
  purityNote: string;
}

export interface CombatantDiegetic {
  id: string;
  name: string;
  isPlayer: boolean;
  x: number;
  y: number;
  opacityState: 'VELADO' | 'VISLUMBRADO' | 'DESCIFRADO';
  vitalityDescription: string;
  stanceDescription: string;
  revealedIntent?: string;
}

export interface CharacterDiegetic {
  id: string;
  name: string;
  profession: string;
  originTitle: string;
  district: string;
  pathwayName: string;
  sequenceTitle: string;
  initialBurden: {
    type: 'DEUDA' | 'SECRETO';
    description: string;
    details: string;
  };
  somatics: {
    sanityTier: SanityTier;
    candleDescription: string;
    corruptionTier: CorruptionTier;
    mirrorDescription: string;
    ruinaTier: RuinaTier;
    woodDescription: string;
  };
  walletText: string;
  actingCoherence: ActingCoherenceTier;
  actingFeedback: string;
  actingDiary: ActingLogEntry[];
  anchors: AnchorItem[];
  policeSuspicionText: string;
  churchSuspicionText: string;
}
