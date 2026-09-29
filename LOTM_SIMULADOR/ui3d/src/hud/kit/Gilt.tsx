import { useLayoutEffect, useRef, useState, type ReactElement } from 'react';

/**
 * Marco dorado vectorial del Atlas. Se dibuja en SVG al tamaño real del elemento (sin deformar esquinas):
 *  - panel:     filete exterior, filete interior fino y esquinas a inglete con escuadra
 *  - button:    doble filete con esquinas achaflanadas
 *  - cartouche: filete fino, ganchos en las esquinas y rombos arriba/abajo
 *  - hairline:  un solo filete
 */
export type GiltVariant = 'panel' | 'button' | 'cartouche' | 'hairline';

interface GiltProps {
  variant?: GiltVariant;
  /** rombo centrado en el borde superior / inferior */
  diamondTop?: boolean;
  diamondBottom?: boolean;
  /** tono para paneles de pergamino (latón oscurecido) */
  tone?: 'gold' | 'bronze';
  glow?: boolean;
}

export function Gilt({ variant = 'panel', diamondTop, diamondBottom, tone = 'gold', glow }: GiltProps) {
  const ref = useRef<SVGSVGElement>(null);
  const [size, setSize] = useState<[number, number]>([0, 0]);

  useLayoutEffect(() => {
    const el = ref.current?.parentElement;
    if (!el) return;
    const measure = () => setSize([el.offsetWidth, el.offsetHeight]);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const [w, h] = size;
  const stroke = tone === 'gold' ? 'var(--gold)' : '#6e5430';
  const hi = tone === 'gold' ? 'var(--gold-hi)' : '#8a6a3c';
  const parts: ReactElement[] = [];

  if (w > 0 && h > 0) {
    if (variant === 'panel') {
      const o = 1;
      const c = 26;
      parts.push(<rect key="o" x={o} y={o} width={w - 2 * o} height={h - 2 * o} fill="none" stroke={stroke} strokeWidth={1.6} />);
      // filetes interiores laterales, como en el Atlas
      const i = 8;
      parts.push(<line key="il" x1={i} y1={c + 8} x2={i} y2={h - c - 8} stroke={stroke} strokeWidth={0.9} opacity={0.75} />);
      parts.push(<line key="ir" x1={w - i} y1={c + 8} x2={w - i} y2={h - c - 8} stroke={stroke} strokeWidth={0.9} opacity={0.75} />);
      corners(w, h).forEach(([x, y, sx, sy], k) =>
        parts.push(
          <g key={`c${k}`} transform={`translate(${x} ${y}) scale(${sx} ${sy})`} stroke={hi} fill="none" strokeLinecap="square">
            <path d={`M-4 ${c} L-4 -4 L${c} -4`} strokeWidth={1.6} />
            <path d="M-4 -4 L 14 14" strokeWidth={1.2} />
            <path d={`M 6 ${c - 6} L 6 6 L ${c - 6} 6`} strokeWidth={1} opacity={0.85} />
            <path d="M 14 14 m -3 0 l 3 -3 l 3 3 l -3 3 z" strokeWidth={1} fill={hi} />
          </g>
        )
      );
    } else if (variant === 'button') {
      const ch = 9;
      const outer = chamfer(1, 1, w - 2, h - 2, ch);
      const inner = chamfer(6, 6, w - 12, h - 12, ch - 3);
      parts.push(<path key="o" d={outer} fill="none" stroke={hi} strokeWidth={1.5} />);
      parts.push(<path key="i" d={inner} fill="none" stroke={stroke} strokeWidth={0.9} opacity={0.8} />);
    } else if (variant === 'cartouche') {
      parts.push(<rect key="o" x={1} y={1} width={w - 2} height={h - 2} fill="none" stroke={stroke} strokeWidth={1.3} />);
      corners(w, h).forEach(([x, y, sx, sy], k) =>
        parts.push(
          <g key={`c${k}`} transform={`translate(${x} ${y}) scale(${sx} ${sy})`} stroke={hi} fill="none">
            <path d="M-5 12 C -5 2, 2 -5, 12 -5" strokeWidth={1.3} />
            <path d="M-5 -5 l 7 7" strokeWidth={1.1} />
          </g>
        )
      );
    } else {
      parts.push(<rect key="o" x={0.5} y={0.5} width={w - 1} height={h - 1} rx={3} fill="none" stroke={stroke} strokeWidth={1} />);
    }
    if (diamondTop) parts.push(<Diamond key="dt" x={w / 2} y={1} color={hi} />);
    if (diamondBottom) parts.push(<Diamond key="db" x={w / 2} y={h - 1} color={hi} />);
  }

  return (
    <svg
      ref={ref}
      className="gilt"
      width={w}
      height={h}
      viewBox={`0 0 ${Math.max(w, 1)} ${Math.max(h, 1)}`}
      aria-hidden="true"
      style={glow ? { filter: 'drop-shadow(0 0 8px rgba(236,202,130,0.5))' } : undefined}
    >
      {parts}
    </svg>
  );
}

function corners(w: number, h: number): [number, number, number, number][] {
  return [
    [0, 0, 1, 1],
    [w, 0, -1, 1],
    [0, h, 1, -1],
    [w, h, -1, -1]
  ];
}

function chamfer(x: number, y: number, w: number, h: number, c: number) {
  return `M${x + c} ${y} H${x + w - c} L${x + w} ${y + c} V${y + h - c} L${x + w - c} ${y + h} H${x + c} L${x} ${y + h - c} V${y + c} Z`;
}

export function Diamond({ x, y, color, size = 6 }: { x: number; y: number; color: string; size?: number }) {
  return (
    <path
      d={`M${x} ${y - size} L${x + size} ${y} L${x} ${y + size} L${x - size} ${y} Z`}
      fill="var(--ebony)"
      stroke={color}
      strokeWidth={1.3}
    />
  );
}

/** Filete con rombo central — separa título y cuerpo en todos los paneles. */
export function Divider({ width = '100%', tone = 'gold', style }: { width?: string | number; tone?: 'gold' | 'bronze'; style?: React.CSSProperties }) {
  const color = tone === 'gold' ? 'var(--gold)' : '#7a5d35';
  return (
    <div className="divider" style={{ width, color, ...style }} aria-hidden="true">
      <svg width="16" height="16" viewBox="0 0 16 16">
        <path d="M8 2 L14 8 L8 14 L2 8 Z" fill="none" stroke="currentColor" strokeWidth="1.4" />
      </svg>
    </div>
  );
}
