import { SomaticsState, SomaticsEvaluation, SanityTier, CorruptionTier } from '../types/somatics.js';

export class SomaticsEngine {
  /**
   * Evalúa el estado somático actual del Beyonder y genera diagnósticos clínicos y místicos.
   */
  public static evaluate(state: SomaticsState): SomaticsEvaluation {
    const sanityTier = this.getSanityTier(state.sanity);
    const corruptionTier = this.getCorruptionTier(state.corruption);
    const isRampaging = state.sanity <= 5 || state.corruption >= 90;

    const blockers: string[] = [];
    if (state.digestionProgress < 100) {
      blockers.push(`Poción previa sin digerir completamente (${state.digestionProgress.toFixed(1)}%/100%).`);
    }
    if (state.sanity < 50) {
      blockers.push(`Estabilidad mental insuficiente (${state.sanity}%). Exige al menos 50% para resistir la disonancia de una nueva poción.`);
    }
    if (state.corruption >= 40) {
      blockers.push(`Corrupción astral peligrosa (${state.corruption}%). El cuerpo astral debe purificarse antes de ingerir más características.`);
    }

    return {
      sanityTier,
      sanityDescription: this.getSanityNarrative(sanityTier),
      corruptionTier,
      corruptionDescription: this.getCorruptionNarrative(corruptionTier),
      isRampaging,
      canSafelyConsumePotion: blockers.length === 0,
      blockers
    };
  }

  public static getSanityTier(sanity: number): SanityTier {
    if (sanity >= 80) return 'LUCID';
    if (sanity >= 50) return 'NERVOUS_TENSION';
    if (sanity >= 25) return 'HALLUCINATING';
    if (sanity >= 10) return 'NEAR_COLLAPSE';
    return 'RAMPAGING';
  }

  public static getCorruptionTier(corruption: number): CorruptionTier {
    if (corruption < 10) return 'PRISTINE';
    if (corruption < 30) return 'LATENT_MURMURS';
    if (corruption < 60) return 'ASTRAL_STRAIN';
    if (corruption < 85) return 'MUTATING';
    return 'CORRUPTED_VESSEL';
  }

  public static applySanityDelta(state: SomaticsState, delta: number): SomaticsState {
    let effectiveDelta = delta;

    // Las anclas de humanidad amortiguan las caídas graves de sanidad
    if (delta < 0 && state.anchorStrength > 30) {
      const mitigationFactor = (state.anchorStrength - 30) / 100 * 0.4; // Hasta 28% de reducción de daño mental
      effectiveDelta = Math.min(-1, Math.round(delta * (1 - mitigationFactor)));
    }

    const newSanity = Math.max(0, Math.min(100, state.sanity + effectiveDelta));
    return {
      ...state,
      sanity: newSanity
    };
  }

  public static applyCorruptionDelta(state: SomaticsState, delta: number): SomaticsState {
    const newCorr = Math.max(0, Math.min(100, state.corruption + delta));
    return {
      ...state,
      corruption: newCorr
    };
  }

  public static applyDigestionGain(state: SomaticsState, gain: number): SomaticsState {
    const newDig = Math.max(0, Math.min(100, state.digestionProgress + gain));
    return {
      ...state,
      digestionProgress: Number(newDig.toFixed(2))
    };
  }

  public static consumeCalmingItem(state: SomaticsState, sanityRestore: number): SomaticsState {
    return {
      ...state,
      sanity: Math.min(100, state.sanity + sanityRestore)
    };
  }

  private static getSanityNarrative(tier: SanityTier): string {
    switch (tier) {
      case 'LUCID':
        return 'Tus pensamientos son ordenados y precisos. El frío de la niebla no turba tu razón.';
      case 'NERVOUS_TENSION':
        return 'Sientes fatiga ocular y una ligera opresión en las sienes. El mundo parece esconder miradas en las esquinas.';
      case 'HALLUCINATING':
        return 'Escuchas susurros sibilantes cada vez que el agua gotea. Sombras amorfas reptan por el rabillo del ojo.';
      case 'NEAR_COLLAPSE':
        return 'Tu cuerpo astral convulsiona. Vasos sanguíneos estallan en tu piel. La voluntad de las características pugna por desgarrarte.';
      case 'RAMPAGING':
        return '¡PÉRDIDA DE CONTROL INMINENTE! Tu consciencia humana se extingue. La masa de carne y tentáculos reclama tu anatomía.';
    }
  }

  private static getCorruptionNarrative(tier: CorruptionTier): string {
    switch (tier) {
      case 'PRISTINE':
        return 'Tu cuerpo astral vibra con serenidad; no hay rastros de voluntades cósmicas hostiles.';
      case 'LATENT_MURMURS':
        return 'Ecos distantes de deidades dormidas raspan tenuemente la periferia de tus sueños.';
      case 'ASTRAL_STRAIN':
        return 'La contaminación cósmica mancha tu aura con destellos púrpuras y viscosos.';
      case 'MUTATING':
        return 'Protuberancias y escamas anómalas brotan bajo tu piel. Tu sangre exhala un hedor metálico.';
      case 'CORRUPTED_VESSEL':
        return '¡CONSUMIDO! Tu alma es un títere hueco listo para el descenso de una entidad del vacío exterior.';
    }
  }
}

