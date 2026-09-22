/**
 * GFX27 — CINCO NIVELES DE GRIETAS DE RUINA SOBRE LA MESA (BRIEF-10.VISUAL)
 * 
 * Implementa las 5 máscaras vectoriales SVG acumulativas del estado de Ruina:
 * 1. INTEGRO (Nivel 0): Caoba pulcra sin fisuras.
 * 2. MARCADO (Nivel 1): Hendidura inicial fina en la esquina.
 * 3. EROSIONADO (Nivel 2): Ramificaciones que siguen la veta de madera hacia el centro.
 * 4. ROTO (Nivel 3): Fracturas profundas con sombras astrales oscuras.
 * 5. PERDIDO (Nivel 4): Deterioro severo del tablero sin comprometer la solidez de los objetos.
 * 
 * Ley de Prosa Diegética: Cero números o porcentajes visibles.
 */

import React, { useState } from 'react';
import type { RuinaTier } from '../../types';

interface DeskCracksOverlayProps {
  tier: RuinaTier;
  description?: string;
}

export const DeskCracksOverlay: React.FC<DeskCracksOverlayProps> = ({ 
  tier, 
  description = 'La madera de caoba soporta el peso invisible de los secretos.' 
}) => {
  const [inspecting, setInspecting] = useState(false);

  // Mapeo Canónico de Estados de Ruina (GFX27)
  const getCrackConfig = () => {
    switch (tier) {
      case 'INTEGRO':
        return {
          strokeColor: '#3d2516',
          strokeWidth: 1.0,
          opacity: 0.2,
          labelBrief: 'Caoba pulcra sin fracturas',
          isCracked: false
        };
      case 'MARCADO':
        return {
          strokeColor: '#2b160b',
          strokeWidth: 1.8,
          opacity: 0.8,
          labelBrief: 'Una hendidura fina surca la caoba',
          isCracked: true
        };
      case 'EROSIONADO':
        return {
          strokeColor: '#1a0d06',
          strokeWidth: 2.6,
          opacity: 0.92,
          labelBrief: 'Fisuras ramificadas fracturan el tablero',
          isCracked: true
        };
      case 'ROTO':
        return {
          strokeColor: '#4a0e13',
          strokeWidth: 3.6,
          opacity: 0.98,
          labelBrief: 'Grietas profundas rezuman sombra astral',
          isCracked: true
        };
      case 'PERDIDO':
        return {
          strokeColor: '#7a151b',
          strokeWidth: 4.8,
          opacity: 1.0,
          labelBrief: 'La caoba se desmorona en fisuras',
          isCracked: true
        };
      default:
        return { 
          strokeColor: '#3d2516', 
          strokeWidth: 1.0, 
          opacity: 0.2, 
          labelBrief: 'Vetas de caoba pulida', 
          isCracked: false 
        };
    }
  };

  const config = getCrackConfig();

  return (
    <div 
      className="relative w-full h-full select-none cursor-pointer group"
      title={config.labelBrief}
      onClick={() => setInspecting(prev => !prev)}
      role="region"
      aria-label={`Estado de la caoba: ${config.labelBrief}`}
    >
      <svg 
        className="w-full h-full pointer-events-none"
        viewBox="0 0 580 90" 
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          {/* Veta noble de caoba */}
          <linearGradient id="woodGrainGrain" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3d2516" stopOpacity="0.15" />
            <stop offset="50%" stopColor="#523520" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#3d2516" stopOpacity="0.15" />
          </linearGradient>

          {/* Sombra de profundidad para fracturas severas */}
          <filter id="crackShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#000000" floodOpacity="0.8" />
          </filter>
        </defs>

        {/* Veta longitudinal de la madera */}
        <path d="M 0 45 Q 150 35 290 48 T 580 42" stroke="url(#woodGrainGrain)" strokeWidth="2" fill="none" />

        {/* Nivel 1: MARCADO (Hendidura inicial) */}
        {config.isCracked && (
          <g 
            stroke={config.strokeColor} 
            strokeWidth={config.strokeWidth} 
            strokeLinecap="round" 
            strokeLinejoin="round"
            opacity={config.opacity}
            filter="url(#crackShadow)"
          >
            {/* Fisura inicial acumulativa */}
            <path d="M 45 52 Q 120 40 190 46 T 280 50" fill="none" />

            {/* Nivel 2: EROSIONADO (Ramificaciones longitudinales hacia el centro) */}
            {(tier === 'EROSIONADO' || tier === 'ROTO' || tier === 'PERDIDO') && (
              <>
                <path d="M 190 46 Q 240 28 310 32 T 430 42" fill="none" />
                <path d="M 120 40 Q 145 22 170 18" fill="none" strokeWidth={config.strokeWidth * 0.75} />
                <path d="M 280 50 Q 320 68 360 74" fill="none" strokeWidth={config.strokeWidth * 0.8} />
              </>
            )}

            {/* Nivel 3: ROTO (Fracturas profundas y daño transversal) */}
            {(tier === 'ROTO' || tier === 'PERDIDO') && (
              <>
                <path d="M 430 42 Q 480 30 535 48" fill="none" stroke="#5a0f14" strokeWidth={config.strokeWidth * 1.1} />
                <path d="M 310 32 Q 345 12 380 15" fill="none" stroke="#5a0f14" />
                <path d="M 360 74 Q 400 82 440 78" fill="none" stroke="#5a0f14" />
                {/* Desconchados oscuros en las intersecciones */}
                <circle cx="190" cy="46" r="2.5" fill="#120507" />
                <circle cx="310" cy="32" r="3.0" fill="#120507" />
                <circle cx="430" cy="42" r="3.2" fill="#120507" />
              </>
            )}

            {/* Nivel 4: PERDIDO (Deterioro extremo y sombras astrales) */}
            {tier === 'PERDIDO' && (
              <>
                <path d="M 10 58 Q 30 54 45 52" fill="none" stroke="#8c1d24" strokeWidth={config.strokeWidth * 1.3} />
                <path d="M 535 48 Q 560 52 575 45" fill="none" stroke="#8c1d24" strokeWidth={config.strokeWidth * 1.3} />
                <path d="M 240 28 Q 255 10 270 6" fill="none" stroke="#8c1d24" />
                <circle cx="280" cy="50" r="4.0" fill="#0d0304" />
              </>
            )}
          </g>
        )}
      </svg>

      {/* Modal de reflexión diegética al interactuar */}
      {inspecting && (
        <div 
          className="absolute bottom-14 left-1/2 -translate-x-1/2 w-84 bg-[#140f0c] border border-[#8c733e] rounded p-4 shadow-[0_8px_30px_rgba(0,0,0,0.95)] z-40 pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-2 pb-1 border-b border-[#382b18]">
            <span className="text-xs font-serif font-bold text-[#d4af37] tracking-wider">LA HUELLA DE LA RUINA</span>
            <button 
              onClick={() => setInspecting(false)}
              className="text-[#a89f91] hover:text-[#f3ede2] text-xs px-1.5 py-0.5"
              aria-label="Cerrar descripción"
            >
              ✕
            </button>
          </div>
          <p className="text-xs text-[#ded5c5] italic leading-relaxed font-serif">
            "{description}"
          </p>
        </div>
      )}
    </div>
  );
};
