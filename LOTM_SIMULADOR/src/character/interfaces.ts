import { 
  ThreatLevel, 
  FormulaStatus, 
  BossType, 
  FactionReputation, 
  CurrencyWallet, 
  Stat, 
  Anchor,
  CombatActionType,
  StatusEffectType
} from './types';

export { 
  ThreatLevel, 
  FormulaStatus, 
  BossType, 
  FactionReputation, 
  CurrencyWallet, 
  Stat, 
  Anchor,
  CombatActionType,
  StatusEffectType 
};

export interface StatusEffect {
  type: StatusEffectType;
  durationTurns: number;
  potency: number;
}

export interface CombatTurnResult {
  actionTaken: CombatActionType;
  damageDealt: number;
  spiritualitySpent: number;
  corruptionGained: number;
  logMessage: string;
}

export interface WorldEventData {
  id: string;
  name: string;
  category: string;
  description: string;
  relatedEntities?: string[];
  possibleOutcomes?: string[];
}

export interface IngredientRequirement {
  name: string;
  quantity?: number;
  itemType?: string;
}

export interface RecipeFormula {
  status?: FormulaStatus;
  mainIngredients: (IngredientRequirement | string)[];
  supplementaryIngredients: string[];
  ritual?: string | { title?: string; description?: string; requirements?: string[] } | null;
  potionAppearance?: string;
}

export interface SequenceData {
  sequenceNumber: number;
  name: string;
  abilities?: string[];
  actingMethods?: string[];
  actingMethod?: string | string[];
  formulaStatus?: FormulaStatus;
  formula?: RecipeFormula;
  mainIngredients?: (IngredientRequirement | string)[];
  supplementaryIngredients?: string[];
  ritual?: any;
  digestionRequirement?: number;
  characteristicAppearance?: string;
}

export interface MonsterData {
  id: string;
  name: string;
  recommendedSequence: number;
  threatLevel?: ThreatLevel;
  pathwayRelated?: string;
  dropItems: string[];
  locations: string[];
  bossType?: BossType;
}

export interface SealedArtifactOrigin {
  pathway?: string;
  sequence?: number | string;
  source?: string;
}

export interface SealedArtifactData {
  id: string;
  name: string;
  grade: number | string;
  origin?: SealedArtifactOrigin | string;
  appearance?: string;
  abilities: string[];
  negativeEffects: string[];
  status?: string;
}

export interface QuestData {
  id: string;
  title: string;
  sequence: number;
  description: string;
  objectives: string[];
  rewards: {
    pounds: number;
    actingDigestBonus?: number;
    sanityBonus?: number;
    lootChance?: number;
  };
  riskLevel?: string;
  tags?: string[];
}

export interface TarotMemberData {
  id: string;
  name: string;
  tarotTitle: string;
  pathway: string;
  highestKnownSequence: number;
  organization: string;
  status: string;
}

export type Sequence = SequenceData;
export type SealedArtifact = SealedArtifactData;

export interface Pathway {
  pathwayName: string;
  sequences: Map<number, SequenceData> | SequenceData[];
}