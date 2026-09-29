/**
 * ESCALERA DE CARACOL Y PICAPORTE — PATH TO GODHOOD (BRIEF-10.VISUAL-R3)
 * Objeto físico que conecta con el zaguán y la preparación táctica ante amenazas.
 */

import React from 'react';
import { ShieldAlert, Shield } from 'lucide-react';

interface StaircaseDoorObjectProps {
  threatActive?: boolean;
  threatLevelText?: string;
}

export const StaircaseDoorObject: React.FC<StaircaseDoorObjectProps> = ({
  threatActive = false,
  threatLevelText = 'Peldaños en silencio; calma en el zaguán.'
}) => {
  return (
    <div className="staircase-container group">
      
      {/* Indicador de Vigilancia / Táctica (Visible en amenaza o hover) */}
      <div className={`relative flex justify-between items-start transition-opacity ${threatActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} style={{ zIndex: 2 }}>
        <div className="staircase-badge">
          {threatActive ? (
            <ShieldAlert size={14} color="#f87171" className="animate-pulse" />
          ) : (
            <Shield size={14} color="#8c733e" />
          )}
          <span className="cinzel font-bold tracking-wider" style={{ fontSize: '10px', color: '#d4af37' }}>
            {threatActive ? 'INTRUSIÓN' : 'EL ZAGUÁN'}
          </span>
        </div>
      </div>

      {/* Estado del Umbral (Visible en amenaza o hover) */}
      <div className={`relative flex flex-col items-center my-auto transition-opacity ${threatActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} style={{ zIndex: 2 }}>
        <span 
          className="font-serif italic text-center px-2 py-1 rounded bg-[#100e0b]/80 border border-[#8c733e]/40 shadow-sm" 
          style={{ fontSize: '9px', color: '#ede4d1', maxWidth: '200px' }}
        >
          {threatLevelText}
        </span>
      </div>

      {/* Pie del Umbral */}
      <div className="relative text-center opacity-0 group-hover:opacity-100 transition-opacity" style={{ zIndex: 2 }}>
        <span className="font-serif uppercase tracking-widest text-[8px] text-[#8c733e]">
          Paso a las calles
        </span>
      </div>
    </div>
  );
};

