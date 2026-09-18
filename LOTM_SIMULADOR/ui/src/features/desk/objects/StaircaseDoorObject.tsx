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
      
      {/* Peldaños de Roble en Espiral (SVG volumétrico) */}
      <div className="absolute inset-0 opacity-40 group-hover:opacity-60 transition-opacity pointer-events-none">
        <svg width="100%" height="100%" viewBox="0 0 220 420" preserveAspectRatio="none">
          <defs>
            <linearGradient id="stairStepGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3d291a" />
              <stop offset="50%" stopColor="#24170e" />
              <stop offset="100%" stopColor="#120c07" />
            </linearGradient>
            <linearGradient id="stairShadow" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="transparent" />
              <stop offset="100%" stopColor="rgba(0,0,0,0.9)" />
            </linearGradient>
          </defs>

          {/* Siluetas de peldaños curvos que descienden */}
          <path d="M 20 50 Q 120 70 200 40 L 200 90 Q 120 120 20 100 Z" fill="url(#stairStepGrad)" stroke="#1a110a" strokeWidth="2" />
          <path d="M 30 110 Q 130 130 190 100 L 190 150 Q 130 180 30 160 Z" fill="url(#stairStepGrad)" stroke="#1a110a" strokeWidth="2" />
          <path d="M 40 170 Q 140 190 180 160 L 180 210 Q 140 240 40 220 Z" fill="url(#stairStepGrad)" stroke="#1a110a" strokeWidth="2" />
          <path d="M 50 230 Q 150 250 170 220 L 170 270 Q 150 300 50 280 Z" fill="url(#stairStepGrad)" stroke="#1a110a" strokeWidth="2" />
          <path d="M 60 290 Q 160 310 160 280 L 160 330 Q 160 360 60 340 Z" fill="url(#stairStepGrad)" stroke="#1a110a" strokeWidth="2" />
          
          {/* Sombra abisal del fondo */}
          <rect x="0" y="240" width="220" height="180" fill="url(#stairShadow)" />
        </svg>
      </div>

      {/* Barandilla de Hierro Forjado Victoriano */}
      <div className="relative flex justify-between items-start" style={{ zIndex: 2 }}>
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

      {/* Picaporte de Latón Ennegrecido en el Umbral */}
      <div className="relative flex flex-col items-center" style={{ zIndex: 2, margin: 'auto 0', gap: '4px' }}>
        <div className="staircase-handle group-hover:border-[#d4af37] transition-colors">
          <div 
            style={{
              width: '10px',
              height: '24px',
              borderRadius: '9999px',
              background: 'linear-gradient(180deg, #8c733e 0%, #24170e 100%)',
              border: '1px solid #a68444'
            }} 
          />
        </div>
        <span 
          className="font-serif italic text-center" 
          style={{ fontSize: '9px', color: '#8c7d6b', padding: '0 4px', maxWidth: '180px' }}
        >
          {threatLevelText}
        </span>
      </div>

      {/* Pie del Umbral */}
      <div className="relative text-center" style={{ zIndex: 2, borderTop: '1px solid #3d291a', paddingTop: '4px' }}>
        <span className="font-serif uppercase tracking-widest" style={{ fontSize: '8px', color: '#5c4a35' }}>
          Paso a las calles
        </span>
      </div>
    </div>
  );
};
