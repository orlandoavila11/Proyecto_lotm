/**
 * BOTÓN SEMÁNTICO DE HOTSPOT INTERACTIVO — PATH TO GODHOOD (BRIEF-10.VISUAL-R2)
 * Cumple hit-area >= 44x44px, foco de latón visible y modo Atención diegético.
 */

import React, { forwardRef } from 'react';
import type { HotspotContract } from './types';

interface HotspotButtonProps {
  contract: HotspotContract;
  isAttentionActive: boolean;
  isFocused: boolean;
  onActivate: (id: HotspotContract['id']) => void;
  onFocus: (id: HotspotContract['id']) => void;
  children?: React.ReactNode;
}

export const HotspotButton = forwardRef<HTMLButtonElement, HotspotButtonProps>(({
  contract,
  isAttentionActive,
  isFocused,
  onActivate,
  onFocus,
  children
}, ref) => {
  const { id, accessibleName, restingLabel, bounds, disabledReason, isUrgent } = contract;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!disabledReason) {
      onActivate(id);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!disabledReason) {
        onActivate(id);
      }
    }
  };

  return (
    <button
      ref={ref}
      type="button"
      id={id}
      aria-label={accessibleName}
      aria-description={restingLabel}
      disabled={Boolean(disabledReason)}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onFocus={() => onFocus(id)}
      style={{
        position: 'absolute',
        left: `${bounds.x}px`,
        top: `${bounds.y}px`,
        width: `${bounds.width}px`,
        height: `${bounds.height}px`,
        zIndex: contract.depthLayer === 1 ? 'var(--z-furniture, 15)' : 'var(--z-objects, 20)',
        cursor: disabledReason ? 'not-allowed' : 'pointer',
        minWidth: '44px',
        minHeight: '44px',
        pointerEvents: 'auto',
        backgroundColor: 'transparent',
        border: 'none',
        padding: 0
      }}
      className={`group bg-transparent border-0 p-0 text-left select-none outline-none lotm-focus-ring transition-transform duration-200 ${
        isFocused ? 'scale-[1.02]' : 'hover:scale-[1.01]'
      }`}
    >
      {/* Contenido Visual del Objeto */}
      <div className="w-full h-full relative flex items-center justify-center">
        {children}

        {/* Indicador de Urgencia Primaria sutil */}
        {isUrgent && (
          <div 
            className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#851c22] border border-[#d4af37] animate-pulse shadow-[0_0_8px_rgba(212,175,55,0.6)]" 
            title="Llamada prioritaria de la estancia"
          />
        )}
      </div>

      {/* Etiqueta de Modo Atención o Hover (≤ 7 palabras) */}
      <div
        className={`absolute left-1/2 -bottom-7 -translate-x-1/2 whitespace-nowrap px-2.5 py-1 rounded bg-[#100e0b]/95 border border-[#8c733e] text-[#ede4d1] font-serif text-[11px] tracking-wide pointer-events-none transition-all duration-200 shadow-[0_4px_12px_rgba(0,0,0,0.85)] z-40 ${
          isAttentionActive || isFocused
            ? 'opacity-100 translate-y-0 visible'
            : 'opacity-0 translate-y-1 invisible group-hover:opacity-100 group-hover:translate-y-0 group-hover:visible'
        }`}
      >
        <span className="italic">{restingLabel}</span>
      </div>
    </button>
  );
});

HotspotButton.displayName = 'HotspotButton';
