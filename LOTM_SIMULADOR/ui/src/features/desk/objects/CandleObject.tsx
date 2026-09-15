import React, { useState } from 'react';
import type { SanityTier } from '../../types';

interface CandleObjectProps {
  tier: SanityTier;
  description: string;
  onClick?: () => void;
}

export const CandleObject: React.FC<CandleObjectProps> = ({ tier, description, onClick }) => {
  const [hovered, setHovered] = useState(false);
  const [inspecting, setInspecting] = useState(false);

  // Parámetros cinéticos y lumínicos según el estado de la vela
  const getConfig = () => {
    switch (tier) {
      case 'BRILLANTE':
        return {
          flameHeight: 38,
          flameColor: '#fbbf24',
          coreColor: '#ffffff',
          haloGlow: '0 0 45px 15px rgba(245, 158, 11, 0.45)',
          animationClass: 'animate-flame-steady',
          labelBrief: 'Llama alta sobre el sebo pulcro',
          ambientLightIntensity: 0.85
        };
      case 'VACILANTE':
        return {
          flameHeight: 32,
          flameColor: '#d97706',
          coreColor: '#fef3c7',
          haloGlow: '0 0 30px 8px rgba(217, 119, 6, 0.35)',
          animationClass: 'animate-flame-flicker',
          labelBrief: 'La mecha oscila bajo corriente invisible',
          ambientLightIntensity: 0.6
        };
      case 'CREPITANTE':
        return {
          flameHeight: 22,
          flameColor: '#b45309',
          coreColor: '#fbbf24',
          haloGlow: '0 0 18px 4px rgba(180, 83, 9, 0.25)',
          animationClass: 'animate-flame-sparks',
          labelBrief: 'Humo denso y chasquidos agónicos',
          ambientLightIntensity: 0.35
        };
      case 'AHOGADA_EN_CERA':
        return {
          flameHeight: 12,
          flameColor: '#38bdf8',
          coreColor: '#1e3a8a',
          haloGlow: '0 0 10px 2px rgba(56, 189, 248, 0.2)',
          animationClass: 'animate-flame-drowning',
          labelBrief: 'Brasa azul sepultada en cera derretida',
          ambientLightIntensity: 0.15
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
      {/* Halo lumínico proyectado en la mesa */}
      <div 
        className="absolute -top-16 -left-16 w-48 h-48 rounded-full pointer-events-none transition-all duration-700 ease-in-out"
        style={{
          background: `radial-gradient(circle, rgba(245, 158, 11, ${config.ambientLightIntensity * 0.35}) 0%, transparent 70%)`
        }}
      />

      {/* Conjunto SVG de la Palmatoria y la Vela */}
      <div className="relative flex flex-col items-center">
        
        {/* Llama Animada SVG */}
        <div 
          className="relative transition-all duration-300"
          style={{ height: `${config.flameHeight}px`, marginBottom: '2px' }}
        >
          <svg 
            width="24" 
            height={config.flameHeight} 
            viewBox="0 0 24 40" 
            className={`overflow-visible ${config.animationClass}`}
          >
            <defs>
              <radialGradient id={`candleFlameGrad-${tier}`} cx="50%" cy="80%" r="60%">
                <stop offset="0%" stopColor={config.coreColor} />
                <stop offset="40%" stopColor={config.flameColor} />
                <stop offset="100%" stopColor="transparent" stopOpacity="0" />
              </radialGradient>
              <filter id="flameBlur">
                <feGaussianBlur stdDeviation="0.8" />
              </filter>
            </defs>
            {/* Cuerpo de la llama */}
            <path 
              d="M12 0 C7 15 3 24 4 32 C5 38 19 38 20 32 C21 24 17 15 12 0 Z" 
              fill={`url(#candleFlameGrad-${tier})`}
              filter="url(#flameBlur)"
            />
            {/* Núcleo ardiente interior */}
            <ellipse cx="12" cy="28" rx="3.5" ry="6" fill={config.coreColor} opacity="0.9" />
          </svg>
        </div>

        {/* Pabilo / Mecha de algodón ennegrecido */}
        <div className="w-[2px] h-3 bg-[#171410] -mb-1 z-10" />

        {/* Cilindro de Cera de Sebo con gotas derretidas */}
        <div className="w-7 h-24 bg-gradient-to-r from-[#cfc3aa] via-[#ede4d1] to-[#b3a489] rounded-t-sm shadow-md relative overflow-hidden">
          {/* Chorretones de cera */}
          <div className="absolute top-0 left-1 w-2 h-8 bg-[#f5efe3] rounded-b-full opacity-90" />
          <div className="absolute top-0 right-2 w-1.5 h-12 bg-[#dfd2bc] rounded-b-full opacity-80" />
          <div className="absolute bottom-2 left-0 right-0 h-4 bg-gradient-to-t from-[#8a7a63]/40 to-transparent" />
        </div>

        {/* Palmatoria de latón oxidado */}
        <div className="relative -mt-1 flex flex-col items-center">
          <div className="w-10 h-2 bg-[#6b532d] rounded-t-sm border-t border-[#c29b47]" />
          <div className="w-16 h-3 bg-gradient-to-r from-[#423319] via-[#8c7038] to-[#302512] rounded-full shadow-lg border border-[#a68444]" />
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
          className="absolute left-20 -top-8 w-64 bg-[#17130f] border border-[#a68444] rounded p-3 shadow-2xl z-30 animate-fadeIn"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-1 pb-1 border-b border-[#382b18]">
            <span className="text-xs font-serif font-bold text-[#d4af37] tracking-wider">LA VELA DE SEBO</span>
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

      {/* Animaciones CSS Embebidas */}
      <style>{`
        @keyframes flameSteady {
          0%, 100% { transform: scale(1) rotate(-0.5deg); }
          50% { transform: scale(1.04, 0.98) rotate(0.8deg); }
        }
        @keyframes flameFlicker {
          0%, 100% { transform: scale(1) skewX(0deg); opacity: 0.95; }
          25% { transform: scale(0.9, 1.1) skewX(-2deg); opacity: 0.8; }
          50% { transform: scale(1.1, 0.88) skewX(3deg); opacity: 1; }
          75% { transform: scale(0.85, 1.05) skewX(-1deg); opacity: 0.75; }
        }
        @keyframes flameSparks {
          0%, 100% { transform: scale(0.9) translateY(0); filter: brightness(0.9); }
          30% { transform: scale(1.15) translateY(-2px); filter: brightness(1.2); }
          70% { transform: scale(0.82) translateY(1px); filter: brightness(0.8); }
        }
        @keyframes flameDrowning {
          0%, 100% { transform: scale(0.8); opacity: 0.4; }
          50% { transform: scale(0.95); opacity: 0.7; }
        }
        .animate-flame-steady { animation: flameSteady 2.5s infinite ease-in-out; }
        .animate-flame-flicker { animation: flameFlicker 0.4s infinite ease-in-out; }
        .animate-flame-sparks { animation: flameSparks 0.25s infinite ease-in-out; }
        .animate-flame-drowning { animation: flameDrowning 3s infinite ease-in-out; }
      `}</style>
    </div>
  );
};

