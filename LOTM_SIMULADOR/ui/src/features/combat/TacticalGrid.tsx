/**
 * GFX41 & GFX44 — REJILLA TÁCTICA EXACTA 7x5 (35 CASILLAS) Y ALCANCE (BRIEF-10.VISUAL)
 * 
 * Implementa por código SVG/React:
 * 1. Rejilla de 7 columnas x 5 filas (x: 0..6, y: 0..4 = 35 celdas exactas).
 * 2. Hit-areas >= 44x44px con navegación por teclado accesible.
 * 3. Marcas de selección, alcance táctico, aliados y enemigos (GFX44).
 * 4. Integración de marcas de estado SVG (GFX43).
 * 5. Soporte de fondo ambiental (GFX40) con textura de piedra de Backlund.
 */

import React from 'react';
import type { CombatantDiegetic } from '../types';
import { TacticalStatusIcon, type CombatStatusType } from './TacticalStatusIcons';
import { TacticalAbilityVfx, type AbilityVfxType } from './TacticalAbilityVfx';

export const GRID_COLS = 7;
export const GRID_ROWS = 5;

export interface ActiveVfxState {
  type: AbilityVfxType;
  fromCell: { x: number; y: number };
  toCell: { x: number; y: number };
}

interface TacticalGridProps {
  combatants: (CombatantDiegetic & { statuses?: CombatStatusType[] })[];
  selectedCell: { x: number; y: number } | null;
  onSelectCell: (pos: { x: number; y: number }) => void;
  validMoveCells?: { x: number; y: number }[];
  validTargetCells?: { x: number; y: number }[];
  bgImageUrl?: string;
  activeVfx?: ActiveVfxState | null;
  onVfxComplete?: () => void;
}

export const TacticalGrid: React.FC<TacticalGridProps> = ({
  combatants,
  selectedCell,
  onSelectCell,
  validMoveCells = [],
  validTargetCells = [],
  bgImageUrl = '/art/GFX40_combat_arena_floor.jpg',
  activeVfx = null,
  onVfxComplete
}) => {
  const isCellInList = (list: { x: number; y: number }[], x: number, y: number) => {
    return list.some(c => c.x === x && c.y === y);
  };

  return (
    <div 
      className="relative rounded-lg p-6 flex flex-col items-center justify-center select-none shadow-2xl border border-[#2d2419] overflow-hidden"
      style={{
        backgroundColor: '#0c0a09',
        backgroundImage: `url(${bgImageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* Velo ambiental de niebla de Backlund sobre el adoquín */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, rgba(12, 10, 9, 0.75) 0%, rgba(9, 8, 7, 0.92) 100%)'
        }}
      />

      {/* Contenedor de la Rejilla 7x5 */}
      <div 
        className="relative z-10 grid gap-2.5 p-4 bg-[#0a0807]/90 rounded-lg border border-[#3d2a1a] shadow-[0_12px_35px_rgba(0,0,0,0.95)]"
        style={{
          gridTemplateColumns: `repeat(${GRID_COLS}, minmax(64px, 80px))`,
          gridTemplateRows: `repeat(${GRID_ROWS}, minmax(64px, 80px))`
        }}
        role="grid"
        aria-label="Teatro Táctico: 7 columnas de profundidad por 5 filas de frente"
      >
        {/* Capa de Efectos Visuales de Habilidad (GFX45) */}
        {activeVfx && (
          <TacticalAbilityVfx
            type={activeVfx.type}
            fromCell={activeVfx.fromCell}
            toCell={activeVfx.toCell}
            onComplete={onVfxComplete}
          />
        )}

        {Array.from({ length: GRID_ROWS }).map((_, rIndex) => {
          return Array.from({ length: GRID_COLS }).map((_, cIndex) => {
            const isSelected = selectedCell?.x === cIndex && selectedCell?.y === rIndex;
            const isValidMove = isCellInList(validMoveCells, cIndex, rIndex);
            const isValidTarget = isCellInList(validTargetCells, cIndex, rIndex);
            const combatant = combatants.find(c => c.x === cIndex && c.y === rIndex);

            // Borde y Fondo de Celda según Estado Táctico (GFX44)
            let cellBorderClass = 'border-[#262016] bg-[#14100c]/80 hover:border-[#8c733e]/60';
            if (isSelected) {
              cellBorderClass = 'border-[#d4af37] bg-[#2a2216] shadow-[0_0_12px_rgba(212,175,55,0.4)]';
            } else if (isValidTarget) {
              cellBorderClass = 'border-[#851c22] bg-[#2b0d10]/90 shadow-[0_0_10px_rgba(133,28,34,0.4)]';
            } else if (isValidMove) {
              cellBorderClass = 'border-[#0284c7] bg-[#0c2333]/80 shadow-[0_0_8px_rgba(2,132,199,0.3)]';
            }

            return (
              <button
                key={`${cIndex}-${rIndex}`}
                type="button"
                onClick={() => onSelectCell({ x: cIndex, y: rIndex })}
                className={`w-full h-full rounded border flex flex-col items-center justify-center transition-all cursor-pointer relative lotm-focus-ring ${cellBorderClass}`}
                style={{ minWidth: '48px', minHeight: '48px' }}
                aria-label={`Casilla ${cIndex + 1}, fila ${rIndex + 1}${combatant ? `: ${combatant.name}` : ''}`}
              >
                {/* Coordenadas tenues de depuración en esquina */}
                <span className="absolute top-0.5 left-1 text-[9px] font-mono text-[#524535] pointer-events-none">
                  {cIndex},{rIndex}
                </span>

                {/* Unidad en Casilla */}
                {combatant && (
                  <div className="relative flex flex-col items-center justify-center">
                    {combatant.isPlayer ? (
                      <div className="w-9 h-9 rounded-full bg-[#1c2a38] border-2 border-[#38bdf8] flex items-center justify-center shadow-[0_0_10px_rgba(56,189,248,0.5)]">
                        <span className="text-[11px] font-serif font-bold text-[#e0f2fe] tracking-wider">TÚ</span>
                      </div>
                    ) : (
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${
                        combatant.opacityState === 'VELADO'
                          ? 'bg-[#181113] border-[#7f1d1d] opacity-60 blur-[0.4px]'
                          : 'bg-[#4c0f15] border-[#ef4444] shadow-[0_0_12px_rgba(239,68,68,0.6)]'
                      }`}>
                        <span className="text-[10px] font-serif font-bold text-[#fecaca]">
                          {combatant.opacityState === 'VELADO' ? '?' : 'SOM'}
                        </span>
                      </div>
                    )}

                    {/* Marcas de Estado Activas en la Unidad (GFX43) */}
                    {combatant.statuses && combatant.statuses.length > 0 && (
                      <div className="absolute -top-2 -right-2 flex gap-0.5 bg-[#120f0c] p-0.5 rounded-full border border-[#8c733e] shadow">
                        {combatant.statuses.map((st, i) => (
                          <TacticalStatusIcon key={i} status={st} size={14} color="#d4af37" />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </button>
            );
          });
        })}
      </div>

      <div className="relative z-10 mt-3 flex items-center gap-6 text-[11px] font-serif text-[#a89f91] italic">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#1c2a38] border border-[#38bdf8]"></span> Aliado
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#4c0f15] border border-[#ef4444]"></span> Presencia Hostil
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#0c2333] border border-[#0284c7]"></span> Desplazamiento Válido
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#2b0d10] border border-[#851c22]"></span> Alcance de Ataque
        </span>
      </div>
    </div>
  );
};

