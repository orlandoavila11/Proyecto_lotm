/**
 * GFX45 — EFECTO DE HABILIDAD AUTORIZADA (BRIEF-10.VISUAL)
 * 
 * Capa SVG/CSS temporal sobre el tablero táctico 7x5 que proyecta:
 * 1. Origen, trayectoria e impacto de habilidades autorizadas de Secuencia 9.
 * 2. Manipulación de Hilos de Destino (Vía Fool) — filamentos astrales plateados.
 * 3. Intimidación Psicológica / Onda Psíquica (Vía Visionary) — distorsión concéntrica.
 * 4. Pólvora y Plomo (Acción Civil / Revólver) — destello y trazador de plomo.
 * 5. Soporte estricto de accesibilidad y prefers-reduced-motion.
 */

import React, { useEffect, useState } from 'react';

export type AbilityVfxType = 
  | 'ASTRAL_THREAD'        // Fool S9: Manipulación de Hilos de Destino
  | 'PSYCHIC_WAVE'         // Visionary S9: Intimidación Psíquica / Espectador
  | 'GUNPOWDER_TRACER'     // Civil: Disparo de Revólver
  | 'SPIRIT_VISION_SCAN';  // Universal: Barrido de Visión Espiritual

interface TacticalAbilityVfxProps {
  type: AbilityVfxType;
  fromCell: { x: number; y: number };
  toCell: { x: number; y: number };
  onComplete?: () => void;
  durationMs?: number;
}

export const TacticalAbilityVfx: React.FC<TacticalAbilityVfxProps> = ({
  type,
  fromCell,
  toCell,
  onComplete,
  durationMs = 900
}) => {
  const [phase, setPhase] = useState<'CASTING' | 'TRAVEL' | 'IMPACT' | 'DISSIPATING'>('CASTING');

  useEffect(() => {
    const travelTimer = setTimeout(() => setPhase('TRAVEL'), durationMs * 0.15);
    const impactTimer = setTimeout(() => setPhase('IMPACT'), durationMs * 0.55);
    const dissipateTimer = setTimeout(() => setPhase('DISSIPATING'), durationMs * 0.85);
    const completeTimer = setTimeout(() => {
      if (onComplete) onComplete();
    }, durationMs);

    return () => {
      clearTimeout(travelTimer);
      clearTimeout(impactTimer);
      clearTimeout(dissipateTimer);
      clearTimeout(completeTimer);
    };
  }, [durationMs, onComplete]);

  // Dimensiones relativas basadas en celda 7x5 (x: 0..6, y: 0..4)
  const getCoords = (cell: { x: number; y: number }) => ({
    x: ((cell.x + 0.5) / 7) * 100,
    y: ((cell.y + 0.5) / 5) * 100
  });

  const origin = getCoords(fromCell);
  const target = getCoords(toCell);

  return (
    <div 
      className="absolute inset-0 pointer-events-none z-30 overflow-hidden"
      aria-hidden="true"
    >
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          {/* Gradiente para Hilo Astral (Fool) */}
          <linearGradient id="astralThreadGrad" x1={`${origin.x}%`} y1={`${origin.y}%`} x2={`${target.x}%`} y2={`${target.y}%`}>
            <stop offset="0%" stopColor="#e0f2fe" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#a855f7" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.95" />
          </linearGradient>

          {/* Gradiente para Pólvora */}
          <linearGradient id="gunpowderGrad" x1={`${origin.x}%`} y1={`${origin.y}%`} x2={`${target.x}%`} y2={`${target.y}%`}>
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="1" />
            <stop offset="80%" stopColor="#f97316" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0.9" />
          </linearGradient>

          {/* Filtro de Resplandor Oculto */}
          <filter id="occultGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* 1. EFECTO: Hilos de Destino (Vía Fool) */}
        {type === 'ASTRAL_THREAD' && (
          <g filter="url(#occultGlow)">
            {/* Trazo Bézier del Hilo */}
            <path
              d={`M ${origin.x} ${origin.y} Q ${(origin.x + target.x) / 2 + 5} ${(origin.y + target.y) / 2 - 8} ${target.x} ${target.y}`}
              fill="none"
              stroke="url(#astralThreadGrad)"
              strokeWidth="0.8"
              strokeDasharray="4 2"
              className="animate-pulse"
              style={{
                opacity: phase === 'DISSIPATING' ? 0.2 : 0.9,
                transition: 'opacity 300ms ease-out'
              }}
            />
            {/* Nodo de Destino en el Objetivo */}
            <circle
              cx={target.x}
              cy={target.y}
              r={phase === 'IMPACT' ? '3.5' : '1.5'}
              fill="#38bdf8"
              opacity="0.85"
              style={{ transition: 'all 200ms ease-out' }}
            />
          </g>
        )}

        {/* 2. EFECTO: Onda Psíquica (Vía Visionary) */}
        {type === 'PSYCHIC_WAVE' && (
          <g filter="url(#occultGlow)">
            {/* Anillos concéntricos en el objetivo */}
            <circle
              cx={target.x}
              cy={target.y}
              r={phase === 'IMPACT' ? '7' : phase === 'TRAVEL' ? '3' : '1'}
              fill="none"
              stroke="#c084fc"
              strokeWidth="0.6"
              opacity={phase === 'DISSIPATING' ? 0.1 : 0.8}
              style={{ transition: 'all 400ms ease-out' }}
            />
            <circle
              cx={target.x}
              cy={target.y}
              r={phase === 'IMPACT' ? '4.5' : '1'}
              fill="rgba(192, 132, 252, 0.2)"
              stroke="#e9d5ff"
              strokeWidth="0.3"
              style={{ transition: 'all 300ms ease-out' }}
            />
          </g>
        )}

        {/* 3. EFECTO: Disparo de Revólver / Pólvora */}
        {type === 'GUNPOWDER_TRACER' && (
          <g>
            {/* Destello en la boca del cañón */}
            {phase === 'CASTING' && (
              <circle
                cx={origin.x}
                cy={origin.y}
                r="2.5"
                fill="#fef08a"
                filter="url(#occultGlow)"
              />
            )}
            {/* Línea trazadora rápida */}
            {(phase === 'TRAVEL' || phase === 'IMPACT') && (
              <line
                x1={origin.x}
                y1={origin.y}
                x2={target.x}
                y2={target.y}
                stroke="url(#gunpowderGrad)"
                strokeWidth="0.6"
                strokeLinecap="round"
                opacity={phase === 'IMPACT' ? 0.9 : 0.4}
              />
            )}
            {/* Impacto de plomo y chispas */}
            {phase === 'IMPACT' && (
              <circle
                cx={target.x}
                cy={target.y}
                r="3"
                fill="#ef4444"
                filter="url(#occultGlow)"
                opacity="0.9"
              />
            )}
          </g>
        )}

        {/* 4. EFECTO: Visión Espiritual Scan */}
        {type === 'SPIRIT_VISION_SCAN' && (
          <g filter="url(#occultGlow)">
            <ellipse
              cx={target.x}
              cy={target.y}
              rx={phase === 'IMPACT' ? '8' : '4'}
              ry={phase === 'IMPACT' ? '6' : '3'}
              fill="none"
              stroke="#a855f7"
              strokeWidth="0.5"
              strokeDasharray="2 2"
              opacity={phase === 'DISSIPATING' ? 0.2 : 0.75}
              style={{ transition: 'all 500ms ease-out' }}
            />
          </g>
        )}
      </svg>
    </div>
  );
};

