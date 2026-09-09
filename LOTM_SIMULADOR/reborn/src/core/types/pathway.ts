export const CANONICAL_PATHWAYS = [
  'FOOL',
  'DOOR',
  'ERROR',
  'VISIONARY',
  'SUN',
  'TYRANT',
  'WHITE_TOWER',
  'HANGED_MAN',
  'DARKNESS',
  'DEATH',
  'TWILIGHT_GIANT',
  'RED_PRIEST',
  'DEMONESS',
  'BLACK_EMPEROR',
  'JUSTICIAR',
  'CHAINED',
  'ABYSS',
  'MOON',
  'MOTHER',
  'PARAGON',
  'HERMIT',
  'WHEEL_OF_FORTUNE'
] as const;

export type CanonicalPathwayId = typeof CANONICAL_PATHWAYS[number];

export interface SequenceFormula {
  mainIngredients: string[];
  supplementaryIngredients: string[];
  potionAppearance?: string;
}

export interface SequenceData {
  sequenceNumber: number;
  name: string;
  abilities: string[];
  actingMethods: string[];
  formula: SequenceFormula;
  ritual: string | null;
  characteristicAppearance?: string;
}

export interface PathwayCompendium {
  id: CanonicalPathwayId;
  displayName: string;
  sequences: Record<number, SequenceData>;
  mythicalCreatureForm?: string;
}

