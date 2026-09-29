import { useLayoutEffect, useRef } from 'react';
import { useHudScale, useStage } from '../../engine/react';
import type { Vec2 } from '../../engine/types';

/**
 * Línea guía dorada de V03: une el panel de inspección con el punto exacto de la lámina donde está la
 * evidencia. Se recalcula cada frame porque la cámara respira.
 */
export function LeaderLine({ from, to }: { from: Vec2; to: Vec2 }) {
  const stage = useStage();
  const hud = useHudScale();
  const line = useRef<SVGLineElement>(null);
  const dot = useRef<SVGCircleElement>(null);
  const toRef = useRef(to);
  toRef.current = to;

  useLayoutEffect(() => {
    if (!stage) return;
    const update = () => {
      const [x, y] = stage.project(toRef.current);
      const tx = x / hud;
      const ty = y / hud;
      line.current?.setAttribute('x2', String(tx));
      line.current?.setAttribute('y2', String(ty));
      dot.current?.setAttribute('cx', String(tx));
      dot.current?.setAttribute('cy', String(ty));
    };
    update();
    return stage.on((e) => e.type === 'frame' && update()) as () => void;
  }, [stage, hud]);

  return (
    <svg className="passthrough fade-in" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible' }} aria-hidden="true">
      <line ref={line} x1={from[0]} y1={from[1]} x2={from[0]} y2={from[1]} stroke="var(--gold-hi)" strokeWidth="1.6" opacity="0.9" />
      <circle cx={from[0]} cy={from[1]} r="5" fill="var(--ebony)" stroke="var(--gold-hi)" strokeWidth="1.4" />
      <circle ref={dot} r="6.5" fill="var(--gold-hi)" style={{ filter: 'drop-shadow(0 0 6px rgba(236,202,130,0.9))' }} />
    </svg>
  );
}
