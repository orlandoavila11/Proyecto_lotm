import React, { useState } from 'react';
import type { RuinaTier } from '../../types';

interface DeskCracksOverlayProps {
  tier: RuinaTier;
  description: string;
}

export const DeskCracksOverlay: React.FC<DeskCracksOverlayProps> = ({ tier, description }) => {
  const [hovered, setHovered] = useState(false);
  const [inspecting, setInspecting] = useState(false);

  // Si está íntegro, no hay fisuras visibles
  if (tier === 'INTEGRO') {
    return null;
  }

  const getCrackConfig = () => {
    switch (tier) {
      case 'MARCADO':
        return {
          strokeColor: '#3d2516',
          strokeWidth: 1.5,
          opacity: 0.7,
          labelBrief: 'Una hendidura fina surca la caoba'
        };
      case 'EROSIONADO':
        return {
          strokeColor: '#2b160b',
          strokeWidth: 2.2,
          opacity: 0.85,
          labelBrief: 'Fisuras ramificadas fracturan el tablero'
        };
      case 'ROTO':
        return {
          strokeColor: '#5c1015',
          strokeWidth: 3.2,
          opacity: 0.95,
          labelBrief: 'Grietas profundas rezuman sombra astral'
        };
      case 'PERDIDO':
        return {
          strokeColor: '#851c22',
          strokeWidth: 4.5,
          opacity: 1,
          labelBrief: 'La caoba se desintegra en cenizas'
        };
      default:
        return { strokeColor: '#3d2516', strokeWidth: 1, opacity: 0.5, labelBrief: 'Grietas en la madera' };
    }
  };

  const config = getCrackConfig();

  return (
    <div 
      className="absolute inset-0 pointer-events-none z-10"
      title={config.labelBrief}
    >
      <svg 
        className="w-full h-full pointer-events-auto cursor-pointer"
        viewBox="0 0 1000 600" 
        preserveAspectRatio="none"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => setInspecting(prev => !prev)}
      >
        <g stroke={config.strokeColor} strokeWidth={config.strokeWidth} strokeLinecap="round" opacity={config.opacity}>
          {/* Fisura Principal (Hendidura que cruza desde la vela hacia el centro) */}
          <path d="M 80,180 Q 140,210 220,205 T 380,240 T 490,260 T 620,290" fill="none" />

          {/* Ramificaciones secundarias para EROSIONADO, ROTO y PERDIDO */}
          {(tier === 'EROSIONADO' || tier === 'ROTO' || tier === 'PERDIDO') && (
            <>
              <path d="M 220,205 Q 260,170 310,165" fill="none" />
              <path d="M 380,240 Q 420,280 470,320 T 540,360" fill="none" />
              <path d="M 620,290 Q 700,310 780,295 T 890,320" fill="none" />
            </>
          )}

          {/* Fracturas críticas de ROTO y PERDIDO */}
          {(tier === 'ROTO' || tier === 'PERDIDO') && (
            <>
              <path d="M 310,165 Q 360,110 430,95" fill="none" stroke="#7f1d1d" />
              <path d="M 540,360 Q 560,430 630,480" fill="none" stroke="#7f1d1d" />
              <circle cx="380" cy="240" r="4" fill="#1f0a0c" />
              <circle cx="620" cy="290" r="5" fill="#1f0a0c" />
            </>
          )}
        </g>
      </svg>

      {/* Etiqueta flotante al hover */}
      {hovered && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none text-xs font-serif italic text-[#c2b297] bg-[#120f0c]/90 px-3 py-1 rounded border border-[#423524] shadow-lg z-30">
          {config.labelBrief}
        </div>
      )}

      {/* Modal de reflexión al hacer clic */}
      {inspecting && (
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 bg-[#17130f] border border-[#a68444] rounded p-4 shadow-2xl z-40 pointer-events-auto animate-fadeIn"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-2 pb-1 border-b border-[#382b18]">
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
