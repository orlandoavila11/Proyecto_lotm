/**
 * Path to Godhood — Somatics Presentation Mapper (F06)
 * Proyección exhaustiva entre estados somáticos del dominio (backend)
 * y objetos diegéticos visuales del escritorio (frontend).
 */

import type { SanityTier, CorruptionTier, RuinaTier } from '../features/types';

export function mapSanityToVisual(domainSanity: string): {
  tier: SanityTier;
  description: string;
} {
  switch (domainSanity) {
    case 'LUCID':
    case 'BRILLANTE':
      return {
        tier: 'BRILLANTE',
        description: 'La llama arde erguida, alta y clara sobre el candelero de peltre.'
      };
    case 'NERVOUS_TENSION':
    case 'VACILANTE':
      return {
        tier: 'VACILANTE',
        description: 'La mecha oscila bajo corrientes invisibles; sombras tenues danzan en la mesa.'
      };
    case 'HALLUCINATING':
    case 'CREPITANTE':
      return {
        tier: 'CREPITANTE',
        description: 'El sebo chisporrotea con violencia; un humo agrio asciende en espirales densas.'
      };
    case 'NEAR_COLLAPSE':
    case 'RAMPAGING':
    case 'AHOGADA_EN_CERA':
    default:
      return {
        tier: 'AHOGADA_EN_CERA',
        description: 'Una brasa azulada agoniza sumergida en un charco de cera derretida.'
      };
  }
}

export function mapCorruptionToVisual(domainCorruption: string): {
  tier: CorruptionTier;
  description: string;
} {
  switch (domainCorruption) {
    case 'PRISTINE':
    case 'AZOGUE_LIMPIO':
      return {
        tier: 'AZOGUE_LIMPIO',
        description: 'El azogue refleja tu semblante humano sin sombras ni distorsiones extrañas.'
      };
    case 'LATENT_MURMURS':
    case 'VAHO_TENUE':
      return {
        tier: 'VAHO_TENUE',
        description: 'Una pátina de humedad violácea enturbia los bordes del espejo de mano.'
      };
    case 'ASTRAL_STRAIN':
    case 'REFLEJOS_DESFASADOS':
      return {
        tier: 'REFLEJOS_DESFASADOS',
        description: 'Tu imagen en el cristal parpadea con una fracción de segundo de retraso.'
      };
    case 'MUTATING':
    case 'CORRUPTED_VESSEL':
    case 'EL_REFLEJO_NO_PARPADEA':
    default:
      return {
        tier: 'EL_REFLEJO_NO_PARPADEA',
        description: 'El rostro atrapado en el azogue te contempla con frialdad y no parpadea.'
      };
  }
}

export function mapRuinaToVisual(domainRuina: string | number): {
  tier: RuinaTier;
  description: string;
} {
  const val = typeof domainRuina === 'number' ? domainRuina : 0;
  if (val === 0 || domainRuina === 'INTEGRO') {
    return {
      tier: 'INTEGRO',
      description: 'El marco de madera noble conserva su veta pulcra y pulida.'
    };
  }
  if (val < 20 || domainRuina === 'MARCADO') {
    return {
      tier: 'MARCADO',
      description: 'Una grieta delgada y oscura recorre la esquina inferior de la mesa.'
    };
  }
  if (val < 50 || domainRuina === 'EROSIONADO') {
    return {
      tier: 'EROSIONADO',
      description: 'Fisuras perceptibles astillan la superficie; el barniz ha perdido su brillo.'
    };
  }
  if (val < 80 || domainRuina === 'ROTO') {
    return {
      tier: 'ROTO',
      description: 'Fracturas profundas parten la madera; astillas negras emergen como espinas.'
    };
  }
  return {
    tier: 'PERDIDO',
    description: 'La madera se desmorona en serrín negro; la estructura misma del refugio colapsa.'
  };
}

