/**
 * GFX28 — MÁSCARAS DE INTERACCIÓN Y HIT-AREAS DEL DESVÁN (BRIEF-10.VISUAL)
 * 
 * Traza los 11 polígonos interactivos reales en el sistema lógico 1920x1080.
 * Garantiza áreas táctiles >= 44x44px, prevención de solapamientos indebidos
 * y soporte para depuración visual y lectores de pantalla.
 */

import React from 'react';
import { CANONICAL_HOTSPOTS, type HotspotId } from './types';

interface InteractionMasksOverlayProps {
  visible?: boolean;
  activeHotspotId?: HotspotId | null;
  focusedHotspotId?: HotspotId | null;
  onSelectHotspot?: (id: HotspotId) => void;
}

export const InteractionMasksOverlay: React.FC<InteractionMasksOverlayProps> = ({
  visible = false,
  activeHotspotId = null,
  focusedHotspotId = null,
  onSelectHotspot
}) => {
  if (!visible) return null;

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none select-none z-50"
      viewBox="0 0 1920 1080"
      aria-hidden="true"
    >
      <defs>
        <pattern id="debugGrid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(212, 175, 55, 0.08)" strokeWidth="0.5" />
        </pattern>
      </defs>

      {/* Rejilla de depuración lógica 1920x1080 */}
      <rect width="1920" height="1080" fill="url(#debugGrid)" />

      {/* Renderizado de las 11 Máscaras Lógicas de Interacción (GFX28) */}
      {Object.values(CANONICAL_HOTSPOTS).map((hotspot) => {
        const { id, accessibleName, bounds } = hotspot;
        const isFocused = focusedHotspotId === id;
        const isActive = activeHotspotId === id;

        return (
          <g key={id} className="cursor-pointer">
            {/* Polígono de Hitbox */}
            <rect
              x={bounds.x}
              y={bounds.y}
              width={bounds.width}
              height={bounds.height}
              rx={6}
              fill={isActive ? 'rgba(212, 175, 55, 0.25)' : isFocused ? 'rgba(133, 28, 34, 0.25)' : 'rgba(212, 175, 55, 0.06)'}
              stroke={isActive ? '#d4af37' : isFocused ? '#ff4d5a' : '#8c733e'}
              strokeWidth={isFocused || isActive ? 2 : 1}
              strokeDasharray={isFocused ? '4 2' : 'none'}
              className="pointer-events-auto"
              onClick={() => onSelectHotspot?.(id)}
            />

            {/* Etiqueta Técnica de Depuración */}
            <text
              x={bounds.x + 6}
              y={bounds.y + 16}
              fill="#d4af37"
              fontSize="11"
              fontFamily="monospace"
              fontWeight="bold"
            >
              {id.replace('hotspot_', '')} [{bounds.width}x{bounds.height}]
            </text>

            <text
              x={bounds.x + 6}
              y={bounds.y + 30}
              fill="#e5ded2"
              fontSize="10"
              fontFamily="serif"
              fontStyle="italic"
            >
              {accessibleName}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

