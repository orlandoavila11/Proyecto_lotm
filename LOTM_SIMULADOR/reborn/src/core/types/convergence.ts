import { RuinaTier } from './somatics.js';

export type ConvergenceEventType = 
  | 'PUBLIC_COMBAT' 
  | 'ASCENSION' 
  | 'ECCLESIASTICAL_DILEMMA' 
  | 'WHISPER_PURCHASE' 
  | 'DECAY';

export type ConvergenceEncounterType = 
  | 'SKIRMISH' 
  | 'UNCOMFORTABLE_WITNESS' 
  | 'SECONDARY_CLUE';

export interface ConvergenceEncounterResult {
  occurred: boolean;
  effectiveIndex: number;
  rollChance: number;
  rollValue: number;
  dominantSefira: string;
  encounterPool: string;
  isDominantMatching: boolean;
  encounterType?: ConvergenceEncounterType;
  combatantId?: string;
  combatantName?: string;
  description: string;
}

export interface IncursionResult {
  incursionTriggered: boolean;
  incursionId?: string;
  squadCombatants: string[];
  narrativeWarning: string;
}

export interface IncursionResolution {
  status: 'RESOLVED' | 'FLED' | 'DEFEAT';
  suspicionPurged: number;
  previousSuspicion: number;
  currentSuspicion: number;
  narrativeLog: string;
}
