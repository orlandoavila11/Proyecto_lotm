/**
 * TOOLTIP — INFORMACIÓN CONTEXTUAL DIEGÉTICA Y ACCESIBLE (PROMPT P04)
 * Pistas contextuales que respetan la Ley del Objeto (≤ 7 palabras en reposo).
 * Soporta navegación por teclado y lectores de pantalla (role="tooltip").
 */

import React, { useState } from 'react';

export interface TooltipProps {
  content: string;
  badge?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  children: React.ReactElement<any>;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  badge,
  position = 'top',
  children
}) => {
  const [visible, setVisible] = useState(false);

  const positionStyles: Record<string, string> = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  };

  const childWithEvents = React.cloneElement(children, {
    onMouseEnter: () => setVisible(true),
    onMouseLeave: () => setVisible(false),
    onFocus: () => setVisible(true),
    onBlur: () => setVisible(false),
    'aria-describedby': visible ? 'lotm-tooltip' : undefined
  });

  return (
    <div className="relative inline-flex items-center">
      {childWithEvents}
      {visible && (
        <div
          id="lotm-tooltip"
          role="tooltip"
          className={[
            'absolute z-50 px-3 py-1.5 bg-[#120e0a] border border-[#8c733e] text-[#ede4d1] text-xs font-serif rounded shadow-xl whitespace-nowrap pointer-events-none transition-opacity duration-150',
            positionStyles[position]
          ].join(' ')}
        >
          {badge && (
            <span className="text-[#d4af37] font-semibold mr-1.5 uppercase tracking-wider text-[10px]">
              [{badge}]
            </span>
          )}
          <span>{content}</span>
        </div>
      )}
    </div>
  );
};

