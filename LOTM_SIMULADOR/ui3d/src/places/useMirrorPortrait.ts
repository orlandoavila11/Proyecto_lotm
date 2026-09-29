import { useEffect } from 'react';
import { assetUrl } from '../assets';
import { MirrorPortrait } from '../engine/props';
import { useStage } from '../engine/react';
import type { Vec2 } from '../engine/types';
import { useSession } from '../session/store';
import { somaticsVisual } from './somatics';

/**
 * El espejo devuelve el rostro civil del origen del jugador; el azogue lo enturbia según la corrupción.
 * Si aún no existe el retrato, el espejo conserva su reflejo pintado.
 */
export function useMirrorPortrait(ready: boolean, mirror: { center: Vec2; rx: number; ry: number }) {
  const stage = useStage();
  const snapshot = useSession((s) => s.snapshot);
  const origin = snapshot?.character.origin_id;
  const corruption = snapshot ? somaticsVisual(snapshot.somatics).mirror : 0.2;

  useEffect(() => {
    if (!stage || !ready || !origin) return;
    const url = assetUrl(`art/portraits/portrait_${origin}.webp`);
    if (!url) return;
    let alive = true;
    let portrait: MirrorPortrait | null = null;
    stage.texture(url).then((tex) => {
      if (!alive) return;
      portrait = new MirrorPortrait(mirror.center, mirror.rx, mirror.ry, tex);
      portrait.uCorruption.value = corruption;
      stage.attach(portrait);
    });
    return () => {
      alive = false;
      if (portrait) stage.detach(portrait);
    };
  }, [stage, ready, origin, mirror, corruption]);
}
