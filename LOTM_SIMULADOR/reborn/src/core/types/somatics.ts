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
  | 'MUTATING'           // 60 - 84: Deformaciones biológicas perceptibles
  | 'CORRUPTED_VESSEL';  // 85 - 100: Receptáculo consumido por entidades superiores

export interface SomaticsState {
  currentHealth: number;
  maxHealth: number;
  currentSpirituality: number;
  maxSpirituality: number;
  sanity: number;
  corruption: number;
  digestionProgress: number;
  anchorStrength: number;
}

export interface SomaticsEvaluation {
  sanityTier: SanityTier;
  sanityDescription: string;
  corruptionTier: CorruptionTier;
  corruptionDescription: string;
  isRampaging: boolean;
  canSafelyConsumePotion: boolean;
  blockers: string[];
}

