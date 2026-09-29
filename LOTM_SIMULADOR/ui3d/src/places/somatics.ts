import { useEffect } from 'react';
import type { SomaticsEvaluation } from '../api/types';
import { CandleFlame } from '../engine/effects';
import { useStage } from '../engine/react';
import { useSession } from '../session/store';

/**
 * Ley del Objeto: cada franja somática se traduce en un estado físico de la escena.
 *  candle     vigor de la llama (cordura)
 *  mirror     amplitud del azogue (corrupción)
 *  saturation color del mundo (ruina)
 */
export function somaticsVisual(s: SomaticsEvaluation) {
  const candle = { LUCID: 1, NERVOUS_TENSION: 0.78, HALLUCINATING: 0.55, NEAR_COLLAPSE: 0.33, RAMPAGING: 0.15 }[s.sanityTier] ?? 1;
  const mirror = { PRISTINE: 0.18, LATENT_MURMURS: 0.45, ASTRAL_STRAIN: 0.85, MUTATING: 1.4, CORRUPTED_VESSEL: 2.2 }[s.corruptionTier] ?? 0.2;
  const saturation = { INTEGRO: 1, MARCADO: 0.94, EROSIONADO: 0.82, ROTO: 0.66, PERDIDO: 0.5 }[s.ruinaTier] ?? 1;
  return { candle, mirror, saturation };
}

/** Aplica el estado somático confirmado a las velas, el azogue y el color del lugar cargado. */
export function useSomaticScene(ready: boolean) {
  const stage = useStage();
  const somatics = useSession((s) => s.snapshot?.somatics);
  useEffect(() => {
    if (!stage || !ready || !somatics) return;
    const v = somaticsVisual(somatics);
    for (const e of stage.ambientEffects) if (e instanceof CandleFlame) e.setVigor(v.candle);
    // la luz 0 de cada interior es su vela o quinqué principal
    stage.plate.lightStateGain[0] = 0.55 + v.candle * 0.45;
    stage.plate.uMirror.value = v.mirror;
    stage.plate.uSaturation.value = v.saturation;
  }, [stage, ready, somatics]);
}
