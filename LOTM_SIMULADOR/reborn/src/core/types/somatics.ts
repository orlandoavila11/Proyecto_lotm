export type SanityTier = 
  | 'LUCID'              // 80 - 100: Mente lúcida y serena
  | 'NERVOUS_TENSION'    // 50 - 79: Tensión nerviosa, sombras en el rabillo del ojo
  | 'HALLUCINATING'      // 25 - 49: Alucinaciones auditivas y visuales frecuentes
  | 'NEAR_COLLAPSE'      // 10 - 24: Al borde de la pérdida de control
  | 'RAMPAGING';         // 0 - 9: Mutación aberrante inminente o en curso

export type CorruptionTier = 
  | 'PRISTINE'           // 0 - 9: Cuerpo astral limpio
  | 'LATENT_MURMURS'     // 10 - 29: Murmullos débiles procedentes del cosmos
  | 'ASTRAL_STRAIN'      // 30 - 59: Residuos de voluntades ajenas en el espíritu
  | 'MUTATING'           // 60 - 84: Deformaciones biológicas perceptibles (UMBRAL 60)
  | 'CORRUPTED_VESSEL';  // 85 - 100: Receptáculo consumido por entidades superiores

export type RuinaTier =
  | 'INTEGRO'            // 0: Sin fisuras ontológicas
  | 'MARCADO'            // 1 - 19: El velo de la identidad ha sido rozado
  | 'EROSIONADO'         // 20 - 49: Pérdida perceptible de memoria y anclaje
  | 'ROTO'               // 50 - 79: Fractura del yo humano; la bestia se asoma
  | 'PERDIDO';           // 80+: Inercia irreversible hacia el mito o la nada

export type AnchorType = 'PERSON' | 'LOCATION' | 'ROLE' | 'CONVICTION' | 'ROUTINE';

export interface AnchorModel {
  id: string;
  characterId: string;
  type: AnchorType;
  name: string;
  description: string;
  strength: number;
  damageCount: number;
  isDestroyed: boolean;
  createdAt?: string;
}

export interface ScarMechanic {
  hook: string;
  target: string;
  value: number;
  description: string;
}

export interface CharacterScar {
  id: string;
  characterId: string;
  scarCode: string;
  name: string;
  narrative: string;
  originAnchorId?: string;
  isSevere: boolean;
  mechanics: ScarMechanic[];
  createdAt?: string;
}

export type WhisperPriceType = 'CORRUPTION' | 'MEMORY_RELATION' | 'MEMORY_COMPENDIUM' | 'ANCHOR_DAMAGE';

export interface WhisperPrice {
  type: WhisperPriceType;
  amount?: number;
  penalty?: number;
  blockCount?: number;
  description: string;
}

export type TerminalDestiny = 'ALIVE' | 'DEAD' | 'LOST' | 'TRANSFORMED' | 'NPC_CONVERTED' | 'SPECIAL_END';

export interface SomaticsState {
  currentHealth: number;
  maxHealth: number;
  currentSpirituality: number;
  maxSpirituality: number;
  sanity: number;
  corruption: number;
  ruina?: number;
  digestionProgress: number;
  anchorStrength: number;
  terminalState?: TerminalDestiny | null;
}

export interface SomaticsEvaluation {
  sanityTier: SanityTier;
  sanityDescription: string;
  corruptionTier: CorruptionTier;
  corruptionDescription: string;
  ruina: number;
  ruinaTier: RuinaTier;
  ruinaDescriptor: string;
  convergenceBonus: number;
  somaticFlags: string[];
  isRampaging: boolean;
  terminalState: TerminalDestiny | null;
  canSafelyConsumePotion: boolean;
  blockers: string[];
}
