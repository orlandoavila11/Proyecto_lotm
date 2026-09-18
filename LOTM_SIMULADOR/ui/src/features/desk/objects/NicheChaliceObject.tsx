/**
 * HORNACINA RITUAL Y EL CÁLIZ DE PLATA — PATH TO GODHOOD (BRIEF-10.VISUAL-R3)
 * Objeto físico de la Capa 1 empotrado en el muro umbrío: ritual de ascensión y transmutación.
 */

import React from 'react';
import { Sparkles } from 'lucide-react';

interface NicheChaliceObjectProps {
  advancementReady?: boolean;
}

export const NicheChaliceObject: React.FC<NicheChaliceObjectProps> = ({
  advancementReady = false
}) => {
  return (
    <div className="niche-container select-none group">
      
      {/* Hueco de la Hornacina Gótica en el Muro (Sombra profunda y arco) */}
      <div className="niche-alcove">
        {/* Forro de terciopelo damasco envejecido en el fondo */}
        <div 
          className="absolute inset-0 pointer-events-none" 
          style={{
            opacity: 0.25,
            backgroundImage: 'radial-gradient(#4a2b38 1px, transparent 1px)',
            backgroundSize: '8px 8px'
          }}
        />

        {/* Resplandor sutil de las Cinco Puertas */}
        <div 
          className="absolute inset-0 pointer-events-none transition-opacity duration-700"
          style={{
            background: 'radial-gradient(ellipse at 50% 75%, rgba(212, 175, 55, 0.25) 0%, rgba(168, 85, 247, 0.12) 50%, transparent 80%)',
            opacity: advancementReady ? 1 : 0.45
          }} 
        />
      </div>

      {/* Chispas Místicas / Vaho de las Cinco Puertas */}
      <div className="relative pt-1 flex items-center justify-center" style={{ zIndex: 2 }}>
        <Sparkles 
          size={14} 
          color={advancementReady ? '#fef08a' : '#8c733e'}
          className={advancementReady ? 'animate-spin' : 'opacity-70 group-hover:opacity-100'} 
        />
      </div>

      {/* Cáliz de Plata Esterlina (SVG Volumétrico con Fieltro y Brillo) */}
      <div className="relative flex flex-col items-center my-auto transition-transform duration-300 group-hover:scale-105" style={{ zIndex: 2 }}>
        <svg width="48" height="64" viewBox="0 0 48 64" fill="none" className="overflow-visible">
          <defs>
            {/* Gradiente de Plata Pulida */}
            <linearGradient id="chaliceSilverGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#64748b" />
              <stop offset="30%" stopColor="#cbd5e1" />
              <stop offset="60%" stopColor="#f8fafc" />
              <stop offset="85%" stopColor="#94a3b8" />
              <stop offset="100%" stopColor="#475569" />
            </linearGradient>

            {/* Sombra Interior de la Copa */}
            <linearGradient id="chaliceInnerShadow" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#475569" />
            </linearGradient>

            {/* Resplandor del Líquido Alquímico */}
            <radialGradient id="alchemicalGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#d4af37" />
              <stop offset="70%" stopColor="#854d0e" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>

          {/* Interior de la Copa con líquido alquímico */}
          <ellipse cx="24" cy="14" rx="16" ry="6" fill="url(#chaliceInnerShadow)" stroke="#94a3b8" strokeWidth="1" />
          <ellipse cx="24" cy="14" rx="12" ry="4" fill="url(#alchemicalGlow)" opacity={advancementReady ? '0.9' : '0.5'} />

          {/* Copa Superior */}
          <path 
            d="M 8 14 Q 9 32 24 35 Q 39 32 40 14" 
            fill="url(#chaliceSilverGrad)" 
            stroke="#cbd5e1" 
            strokeWidth="1.2" 
          />

          {/* Vástago Central de Plata Labrada */}
          <rect x="22" y="35" width="4" height="15" fill="url(#chaliceSilverGrad)" stroke="#475569" strokeWidth="0.5" />
          {/* Nudo decorativo del vástago */}
          <ellipse cx="24" cy="42" rx="4" ry="2" fill="#e2e8f0" stroke="#334155" strokeWidth="0.8" />

          {/* Base Acampanada del Cáliz */}
          <path 
            d="M 18 50 Q 14 55 12 58 L 36 58 Q 34 55 30 50 Z" 
            fill="url(#chaliceSilverGrad)" 
            stroke="#475569" 
            strokeWidth="1" 
          />
          <ellipse cx="24" cy="58" rx="13" ry="3" fill="#cbd5e1" stroke="#334155" strokeWidth="1" />
        </svg>
      </div>

      {/* Peana de Piedra de la Hornacina */}
      <div className="relative w-full flex flex-col items-center" style={{ zIndex: 2 }}>
        <div 
          style={{
            width: '64px',
            height: '8px',
            borderRadius: '2px 2px 0 0',
            background: 'linear-gradient(90deg, #24171e 0%, #3d2935 50%, #24171e 100%)',
            borderTop: '1px solid #6b4859'
          }} 
        />
        <span 
          className="font-serif uppercase tracking-widest text-center" 
          style={{ fontSize: '8px', color: '#d4af37', marginTop: '2px' }}
        >
          {advancementReady ? 'Poción lista' : 'El Cáliz'}
        </span>
      </div>
    </div>
  );
};
