import React, { useState } from 'react';
import type { CorruptionTier } from '../../types';

interface SomaticMirrorObjectProps {
  tier: CorruptionTier;
  description: string;
  onClick?: () => void;
}

export const SomaticMirrorObject: React.FC<SomaticMirrorObjectProps> = ({ tier, description, onClick }) => {
  const [hovered, setHovered] = useState(false);
  const [inspecting, setInspecting] = useState(false);

  // Estados visuales y cinéticos del espejo de azogue
  const getConfig = () => {
    switch (tier) {
      case 'AZOGUE_LIMPIO':
        return {
          mirrorGlow: '0 4px 20px rgba(0, 0, 0, 0.7)',
          tintColor: 'rgba(212, 175, 55, 0.08)',
          silhouetteClass: 'animate-subtle-breathing',
          vahoOpacity: 0,
          labelBrief: 'Superficie de azogue limpia y fiel',
          eyeColor: '#ded5c5',
          isFrozen: false
        };
      case 'VAHO_TENUE':
        return {
          mirrorGlow: '0 0 25px rgba(155, 111, 224, 0.25)',
          tintColor: 'rgba(155, 111, 224, 0.15)',
          silhouetteClass: 'animate-subtle-breathing',
          vahoOpacity: 0.65,
          labelBrief: 'Vaho espectral empaña los bordes',
          eyeColor: '#c084fc',
          isFrozen: false
        };
      case 'REFLEJOS_DESFASADOS':
        return {
          mirrorGlow: '0 0 35px rgba(168, 85, 247, 0.45)',
          tintColor: 'rgba(147, 51, 234, 0.25)',
          silhouetteClass: 'animate-lagged-ghost',
          vahoOpacity: 0.85,
          labelBrief: 'El reflejo se mueve a destiempo',
          eyeColor: '#f43f5e',
          isFrozen: false
        };
      case 'EL_REFLEJO_NO_PARPADEA':
        return {
          mirrorGlow: '0 0 45px rgba(225, 29, 72, 0.6)',
          tintColor: 'rgba(225, 29, 72, 0.3)',
          // LA ANIMACIÓN SE DETIENE POR COMPLETO (HORROR CINÉTICO)
          silhouetteClass: 'frozen-stillness',
          vahoOpacity: 1,
          labelBrief: 'El reflejo no pestañea jamás',
          eyeColor: '#ff0033',
          isFrozen: true
        };
    }
  };

  const config = getConfig();

  return (
    <div 
      className="relative cursor-pointer select-none group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => {
        setInspecting(prev => !prev);
        if (onClick) onClick();
      }}
      title={config.labelBrief}
    >
      {/* Marco Victoriano Ovalado */}
      <div 
        className="w-44 h-56 rounded-[50%/60%] p-3.5 bg-gradient-to-b from-[#4a4237] via-[#241f1a] to-[#120f0d] border-2 border-[#8c733e] shadow-2xl relative flex items-center justify-center transition-all duration-500"
        style={{ boxShadow: config.mirrorGlow }}
      >
        {/* Adorno superior de latón */}
        <div className="absolute -top-3 w-8 h-4 bg-[#b89547] rounded-t-full border border-[#d4af37] flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-[#120f0d]" />
        </div>

        {/* Superficie de Azogue (Cristal Interior) */}
        <div 
          className="w-full h-full rounded-[50%/60%] relative overflow-hidden bg-[#0c0a08] border border-[#382c18] flex items-center justify-center"
          style={{ backgroundColor: '#0e0c0a' }}
        >
          {/* Tinte espectral de fondo */}
          <div 
            className="absolute inset-0 transition-colors duration-500"
            style={{ background: config.tintColor }}
          />

          {/* Vaho en los bordes del espejo */}
          <div 
            className="absolute inset-0 pointer-events-none transition-opacity duration-700"
            style={{
              opacity: config.vahoOpacity,
              background: 'radial-gradient(ellipse at center, transparent 40%, rgba(200, 185, 230, 0.35) 85%, rgba(180, 160, 210, 0.6) 100%)'
            }}
          />

          {/* Silueta del Reflejo (Cinética o Congelada) */}
          <div className={`relative flex flex-col items-center ${config.silhouetteClass}`}>
            {/* Cabeza */}
            <div className="w-14 h-16 rounded-full bg-[#1c1815] border border-[#3d3328] shadow-inner relative flex items-center justify-center">
              {/* Ojos del reflejo */}
              <div className="flex gap-4 mb-1">
                <div 
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${config.isFrozen ? 'scale-125' : ''}`}
                  style={{ backgroundColor: config.eyeColor, boxShadow: `0 0 6px ${config.eyeColor}` }}
                />
                <div 
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${config.isFrozen ? 'scale-125' : ''}`}
                  style={{ backgroundColor: config.eyeColor, boxShadow: `0 0 6px ${config.eyeColor}` }}
                />
              </div>
            </div>
            {/* Hombros de levita victoriana */}
            <div className="w-24 h-14 -mt-2 rounded-t-[50%] bg-[#151210] border-t border-[#332b22]" />
          </div>

          {/* Reflejo diagonal de luz sobre el cristal */}
          <div 
            className="absolute -inset-full bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none transform -rotate-45" 
          />
        </div>
      </div>

      {/* Etiqueta Ambiental en Reposo (≤ 7 Palabras — Ley del Objeto) */}
      <div 
        className={`absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-serif italic text-[#c2b297] bg-[#120f0c]/90 px-2.5 py-0.5 rounded border border-[#423524] transition-opacity duration-200 pointer-events-none z-20 ${
          hovered ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {config.labelBrief}
      </div>

      {/* Despliegue de Reflexión al interactuar (Prosa bajo demanda) */}
      {inspecting && (
        <div 
          className="absolute -right-60 top-4 w-64 bg-[#17130f] border border-[#a68444] rounded p-3 shadow-2xl z-30 animate-fadeIn"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-1 pb-1 border-b border-[#382b18]">
            <span className="text-xs font-serif font-bold text-[#d4af37] tracking-wider">EL ESPEJO DE AZOGUE</span>
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

      {/* Keyframes de animación cinéticos */}
      <style>{`
        @keyframes subtleBreathing {
          0%, 100% { transform: scale(1) translateY(0); }
          50% { transform: scale(1.015) translateY(-1.5px); }
        }
        @keyframes laggedGhost {
          0%, 100% { transform: translateX(0) skewX(0); filter: blur(0px); }
          20% { transform: translateX(2px) skewX(1deg); filter: blur(0.5px); }
          60% { transform: translateX(-2.5px) skewX(-1.5deg); filter: blur(0.8px); }
          85% { transform: translateX(1px); }
        }
        .animate-subtle-breathing { animation: subtleBreathing 4s infinite ease-in-out; }
        .animate-lagged-ghost { animation: laggedGhost 3s infinite ease-in-out; }
        .frozen-stillness { transform: none !important; animation: none !important; }
      `}</style>
    </div>
  );
};

