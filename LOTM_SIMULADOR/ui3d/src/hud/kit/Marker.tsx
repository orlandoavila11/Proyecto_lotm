import { Anchored } from '../../engine/react';
import type { Vec2 } from '../../engine/types';

/** Marcador de destino de V02: rótulo enmarcado + rombo de latón clavado en la lámina. */
export function Marker({ at, label, active, onClick, onHover }: {
  at: Vec2;
  label: string;
  active?: boolean;
  onClick: () => void;
  onHover?: (h: boolean) => void;
}) {
  return (
    <Anchored at={at} offset={[0, 13]}>
      <button
        type="button"
        className="marker"
        aria-pressed={active}
        onClick={onClick}
        onMouseEnter={() => onHover?.(true)}
        onMouseLeave={() => onHover?.(false)}
        onFocus={() => onHover?.(true)}
        onBlur={() => onHover?.(false)}
      >
        <span className="marker__tag">{label}</span>
        <svg className="marker__pin" viewBox="0 0 26 26" aria-hidden="true">
          <rect x="3" y="3" width="20" height="20" rx="4" fill="rgba(12,10,9,0.85)" stroke="var(--gold)" strokeWidth="1.1" />
          <path d="M13 6.5 L19.5 13 L13 19.5 L6.5 13 Z" fill="none" stroke="currentColor" strokeWidth="1.4" />
          <path d="M13 10 L16 13 L13 16 L10 13 Z" fill="currentColor" />
        </svg>
      </button>
    </Anchored>
  );
}
