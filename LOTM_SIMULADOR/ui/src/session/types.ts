import type { TimeSlot, SanityTier, CorruptionTier, RuinaTier, AnchorItem } from '../features/types';

export interface PublicWalletProjection {
  pounds: number;
  soli: number;
  pence: number;
  rawPence: number;
  displayText: string;
}

export interface PublicSomaticsProjection {
  sanityTier: SanityTier;
  candleDescription: string;
  corruptionTier: CorruptionTier;
  mirrorDescription: string;
  ruinaTier: RuinaTier;
  woodDescription: string;
}

export interface PublicCharacterProjection {
  id: string;
  name: string;
  pathway: string;
  pathwayDisplayName: 'The Fool' | 'Visionary';
  sequence: number;
  sequenceTitle: string; // e.g. "Vidente (Secuencia 9)", "Payaso (Secuencia 8)"
  profession: string;
  originTitle: string;
  district: string;
  wallet: PublicWalletProjection;
  somatics: PublicSomaticsProjection;
  initialBurden: {
    type: 'DEUDA' | 'SECRETO';
    description: string;
    details: string;
  };
  anchors: AnchorItem[];
  policeSuspicionText: string;
  churchSuspicionText: string;
}

export interface PublicCalendarProjection {
  day: number;
  slot: number;
  slotName: TimeSlot;
  narrative?: string;
}

export interface PublicBattleProjection {
  battleId: string;
  status: 'ONGOING' | 'VICTORY' | 'DEFEAT' | 'FLED' | 'RAMPAGE_TERMINAL';
  turnCount: number;
  turnLog: string[];
  player: {
    id: string;
    name: string;
    currentHp: number;
    maxHp: number;
    currentSpirituality: number;
    maxSpirituality: number;
    position: { x: number; y: number };
    ap: number;
    maxAp: number;
  };
  enemy: {
    id: string;
    name: string;
    currentHp: number;
    maxHp: number;
    position: { x: number; y: number };
    opacityState: 'VELADO' | 'VISLUMBRADO' | 'DESCIFRADO';
    revealedAbilities: string[];
    // Secret unrevealed abilities are excluded by public projection
  };
  availableSkills: Array<{
    id: string;
    name: string;
    apCost: number;
    spiritualityCost: number;
    description: string;
  }>;
}

export interface PublicCaseProjection {
  instanceId: string;
  caseId: string;
  title: string;
  status: string;
  discoveredClues: Array<{
    id: string;
    title: string;
    description: string;
    source: string;
    discoveredAtDay: number;
  }>;
  connectedEdges: Array<{
    clueA: string;
    clueB: string;
    relation: string;
  }>;
  testedHypotheses: Array<{
    hypothesisId: string;
    isCorrect: boolean;
  }>;
}

export interface PublicAscensionProjection {
  canDrink: boolean;
  formulaReady: boolean;
  ingredientsReady: boolean;
  digestionReady: boolean;
  prepReady: boolean;
  doors: {
    door1_formula?: { passed: boolean; message: string };
    door2_ingredients?: { passed: boolean; message: string };
    door3_digestion?: { passed: boolean; message: string };
    door4_preparation?: { passed: boolean; message: string };
    door5_ritual?: { passed: boolean; message: string };
  };
}
