import React, { useState } from 'react';
import type { CorruptionTier } from '../../types';
import { Eye } from 'lucide-react';

interface SomaticMirrorObjectProps {
  tier: CorruptionTier;
  description: string;
  onClick?: () => void;
  spiritVisionActive?: boolean;
  onToggleSpiritVision?: () => void;
}

export const SomaticMirrorObject: React.FC<SomaticMirrorObjectProps> = ({ 
  tier, 
  description, 
  onClick,
  spiritVisionActive = false,
  onToggleSpiritVision
}) => {
  const [hovered, setHovered] = useState(false);
  const [inspecting, setInspecting] = useState(false);

  // Estados visuales y cinéticos del espejo de azogue
  const getConfig = () => {
    switch (tier) {
      case 'AZOGUE_LIMPIO':
        return {
          mirrorGlow: spiritVisionActive 
            ? '0 0 35px rgba(168, 85, 247, 0.65)' 
            : '0 4px 20px rgba(0, 0, 0, 0.7)',
          tintColor: spiritVisionActive 
            ? 'rgba(168, 85, 247, 0.22)' 
            : 'rgba(212, 175, 55, 0.08)',
          silhouetteClass: 'animate-subtle-breathing',
          vahoOpacity: 0,
          labelBrief: spiritVisionActive ? 'El Velo Espiritual descorre la niebla' : 'Superficie de azogue limpia y fiel',
          eyeColor: spiritVisionActive ? '#c084fc' : '#ded5c5',
          isFrozen: false
        };
      case 'VAHO_TENUE':
        return {
          mirrorGlow: spiritVisionActive 
            ? '0 0 40px rgba(168, 85, 247, 0.7)' 
            : '0 0 25px rgba(155, 111, 224, 0.25)',
          tintColor: spiritVisionActive 
            ? 'rgba(168, 85, 247, 0.3)' 
            : 'rgba(155, 111, 224, 0.15)',
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
        className={`somatic-mirror-frame ${spiritVisionActive ? 'border-[#a855f7]' : ''}`}
        style={{
          boxShadow: config.mirrorGlow,
          borderColor: spiritVisionActive ? '#a855f7' : '#8c733e'
        }}
      >
        {/* Adorno superior de latón con gema o remate */}
        <div 
          style={{
            position: 'absolute',
            top: '-12px',
            padding: '2px 8px',
            borderTopLeftRadius: '9999px',
            borderTopRightRadius: '9999px',
            border: `1px solid ${spiritVisionActive ? '#a855f7' : '#d4af37'}`,
            backgroundColor: spiritVisionActive ? '#2b1040' : '#b89547',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {spiritVisionActive ? (
            <Eye size={10} color="#c084fc" className="animate-pulse" />
          ) : (
            <div style={{ width: '8px', height: '8px', borderRadius: '9999px', backgroundColor: '#120f0d' }} />
          )}
        </div>

        {/* Superficie de Azogue (Cristal Interior) */}
        <div className="somatic-mirror-glass">
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
            <div 
              style={{
                width: '56px',
                height: '64px',
                borderRadius: '9999px',
                backgroundColor: '#1c1815',
                border: '1px solid #3d3328',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.8)',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {/* Ojos del reflejo */}
              <div style={{ display: 'flex', gap: '16px', marginBottom: '4px' }}>
                <div 
                  className={`transition-all duration-300 ${config.isFrozen ? 'scale-125' : ''}`}
                  style={{ width: '8px', height: '8px', borderRadius: '9999px', backgroundColor: config.eyeColor, boxShadow: `0 0 6px ${config.eyeColor}` }}
                />
                <div 
                  className={`transition-all duration-300 ${config.isFrozen ? 'scale-125' : ''}`}
                  style={{ width: '8px', height: '8px', borderRadius: '9999px', backgroundColor: config.eyeColor, boxShadow: `0 0 6px ${config.eyeColor}` }}
                />
              </div>
            </div>
            {/* Hombros de levita victoriana */}
            <div 
              style={{
                width: '96px',
                height: '56px',
                marginTop: '-8px',
                borderTopLeftRadius: '50%',
                borderTopRightRadius: '50%',
                backgroundColor: '#151210',
                borderTop: '1px solid #332b22'
              }} 
            />
          </div>

          {/* Reflejo diagonal de luz sobre el cristal */}
          <div 
            className="absolute pointer-events-none" 
            style={{
              inset: '-100%',
              background: 'linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.06) 50%, transparent 60%)',
              transform: 'rotate(-45deg)'
            }}
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

          {/* Portal Directo al Velo Espiritual */}
          {onToggleSpiritVision && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleSpiritVision();
              }}
              className={`mt-3 w-full py-1.5 px-2 rounded border text-xs font-serif font-bold flex items-center justify-center gap-1.5 transition-all ${
                spiritVisionActive
                  ? 'bg-[#2b1040] border-[#a855f7] text-[#c084fc] hover:bg-[#3b1559]'
                  : 'bg-[#18130e] border-[#8c733e] text-[#d4af37] hover:bg-[#291f15]'
              }`}
            >
              <Eye size={12} />
              <span>{spiritVisionActive ? 'Disipar Visión Espiritual' : 'Cruzar el Velo'}</span>
            </button>
          )}
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
