import React, { useState } from 'react';
import type { RuinaTier } from '../../types';

interface DeskCracksOverlayProps {
  tier: RuinaTier;
  description: string;
}

export const DeskCracksOverlay: React.FC<DeskCracksOverlayProps> = ({ tier, description }) => {
  const [hovered, setHovered] = useState(false);
  const [inspecting, setInspecting] = useState(false);

  const getCrackConfig = () => {
    switch (tier) {
      case 'INTEGRO':
        return {
          strokeColor: '#3d2516',
          strokeWidth: 0.8,
          opacity: 0.25,
          labelBrief: 'Caoba pulcra sin fracturas',
          isCracked: false
        };
      case 'MARCADO':
        return {
          strokeColor: '#2e190e',
          strokeWidth: 1.5,
          opacity: 0.75,
          labelBrief: 'Una hendidura fina surca la caoba',
          isCracked: true
        };
      case 'EROSIONADO':
        return {
          strokeColor: '#1f0d07',
          strokeWidth: 2.2,
          opacity: 0.9,
          labelBrief: 'Fisuras ramificadas fracturan el tablero',
          isCracked: true
        };
      case 'ROTO':
        return {
          strokeColor: '#5c1015',
          strokeWidth: 3.2,
          opacity: 0.95,
          labelBrief: 'Grietas profundas rezuman sombra astral',
          isCracked: true
        };
      case 'PERDIDO':
        return {
          strokeColor: '#851c22',
          strokeWidth: 4.5,
          opacity: 1,
          labelBrief: 'La caoba se desintegra en cenizas',
          isCracked: true
        };
      default:
        return { strokeColor: '#3d2516', strokeWidth: 1, opacity: 0.3, labelBrief: 'Vetas de caoba pulida', isCracked: false };
    }
  };

  const config = getCrackConfig();

  return (
    <div 
      className="relative w-full h-full select-none cursor-pointer group"
      title={config.labelBrief}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => setInspecting(prev => !prev)}
    >
      <svg 
        className="w-full h-full pointer-events-none"
        viewBox="0 0 580 90" 
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="woodGrain" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3d2516" stopOpacity="0.1" />
            <stop offset="50%" stopColor="#523520" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#3d2516" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {/* Veta natural de caoba en el tablero */}
        <path d="M 0 45 Q 150 35 290 48 T 580 42" stroke="url(#woodGrain)" strokeWidth="2" fill="none" />

        {/* Fisuras de Ruina si existen */}
        {config.isCracked && (
          <g stroke={config.strokeColor} strokeWidth={config.strokeWidth} strokeLinecap="round" opacity={config.opacity}>
            {/* Fisura Principal longitudinal */}
            <path d="M 40 45 Q 160 30 260 52 T 420 38 T 540 50" fill="none" />

            {/* Ramificaciones secundarias para EROSIONADO, ROTO y PERDIDO */}
            {(tier === 'EROSIONADO' || tier === 'ROTO' || tier === 'PERDIDO') && (
              <>
                <path d="M 160 30 Q 190 15 220 12" fill="none" />
                <path d="M 260 52 Q 300 70 340 78" fill="none" />
                <path d="M 420 38 Q 460 60 500 55" fill="none" />
              </>
            )}

            {/* Fracturas críticas de ROTO y PERDIDO con sombra astral */}
            {(tier === 'ROTO' || tier === 'PERDIDO') && (
              <>
                <path d="M 220 12 Q 250 5 280 8" fill="none" stroke="#7f1d1d" strokeWidth={config.strokeWidth * 1.2} />
                <path d="M 340 78 Q 380 85 410 82" fill="none" stroke="#7f1d1d" strokeWidth={config.strokeWidth * 1.2} />
                <circle cx="260" cy="52" r="3" fill="#1f0a0c" />
                <circle cx="420" cy="38" r="3.5" fill="#1f0a0c" />
              </>
            )}
          </g>
        )}
      </svg>

      {/* Etiqueta flotante al hover (≤ 7 palabras) */}
      {hovered && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none text-xs font-serif italic text-[#c2b297] bg-[#120f0c]/90 px-3 py-1 rounded border border-[#423524] shadow-lg z-30 whitespace-nowrap">
          {config.labelBrief}
        </div>
      )}

      {/* Modal de reflexión al hacer clic */}
      {inspecting && (
        <div 
          className="absolute bottom-12 left-1/2 -translate-x-1/2 w-80 bg-[#17130f] border border-[#a68444] rounded p-3.5 shadow-2xl z-40 pointer-events-auto animate-fadeIn"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-1 pb-1 border-b border-[#382b18]">
            <span className="text-xs font-serif font-bold text-[#d4af37] tracking-wider">LA HUELLA DE LA RUINA</span>
            <button 
              onClick={() => setInspecting(false)}
              className="text-[#968c7e] hover:text-[#e5ded2] text-xs px-1"
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
