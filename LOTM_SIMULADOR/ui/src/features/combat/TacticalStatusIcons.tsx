/**
 * GFX43 — OCHO MARCAS DE ESTADO TÁCTICO EN SVG (BRIEF-10.VISUAL)
 * 
 * Pictogramas monocromo en viewBox 0 0 32 32 para combate táctico:
 * 1. STUN: Estrella angular interrumpida (aturdimiento físico / shock).
 * 2. FEAR: Ojo retraído con párpado contraído (terror / disuasión).
 * 3. FROZEN: Cristal prismático facetado (parálisis / escarcha).
 * 4. BLEED: Gota estilizada (sangrado / pérdida de vigor).
 * 5. CORRUPTED: Espiral astral rota (contaminación oculta / locura).
 * 6. HYPNOTIZED: Anillos concéntricos (control mental / sugestión).
 * 7. CONCEALED: Velo espectral fluido (invisibilidad / sigilo).
 * 8. EMPOWERED: Destello ascendente de espiritualidad (potenciación).
 */

import React from 'react';

export type CombatStatusType = 
  | 'STUN' 
  | 'FEAR' 
  | 'FROZEN' 
  | 'BLEED' 
  | 'CORRUPTED' 
  | 'HYPNOTIZED' 
  | 'CONCEALED' 
  | 'EMPOWERED';

interface StatusIconProps {
  status: CombatStatusType;
  size?: number;
  className?: string;
  color?: string;
}

export const TacticalStatusIcon: React.FC<StatusIconProps> = ({
  status,
  size = 24,
  className = '',
  color = 'currentColor'
}) => {
  const getIconPaths = () => {
    switch (status) {
      case 'STUN':
        return (
          // Estrella angular interrumpida con radio roto
          <g stroke={color} strokeWidth="2" strokeLinecap="round" fill="none">
            <path d="M16 3 L16 9" />
            <path d="M16 23 L16 29" />
            <path d="M3 16 L9 16" />
            <path d="M23 16 L29 16" />
            <path d="M7 7 L11 11" />
            <path d="M21 21 L25 25" />
            <path d="M25 7 L21 11" />
            <circle cx="16" cy="16" r="3" fill={color} />
          </g>
        );
      case 'FEAR':
        return (
          // Ojo retraído con párpado tenso
          <g stroke={color} strokeWidth="1.8" strokeLinecap="round" fill="none">
            <path d="M3 16 C8 8 24 8 29 16 C24 24 8 24 3 16 Z" />
            <circle cx="16" cy="16" r="4" stroke={color} strokeWidth="2" fill="none" />
            <circle cx="16" cy="16" r="1.5" fill={color} />
            <path d="M12 7 L14 10" />
            <path d="M20 7 L18 10" />
          </g>
        );
      case 'FROZEN':
        return (
          // Cristal facetado / prisma de escarcha
          <g stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none">
            <polygon points="16,3 27,9 27,23 16,29 5,23 5,9" />
            <line x1="16" y1="3" x2="16" y2="29" />
            <line x1="5" y1="9" x2="27" y2="23" />
            <line x1="27" y1="9" x2="5" y2="23" />
          </g>
        );
      case 'BLEED':
        return (
          // Gota estilizada
          <g stroke={color} strokeWidth="1.8" strokeLinejoin="round" fill="none">
            <path d="M16 4 C16 4 7 14 7 20 C7 25 11 28 16 28 C21 28 25 25 25 20 C25 14 16 4 16 4 Z" />
            <path d="M12 21 C12 23.5 13.5 25 16 25" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
          </g>
        );
      case 'CORRUPTED':
        return (
          // Espiral rota astral
          <g stroke={color} strokeWidth="2" strokeLinecap="round" fill="none">
            <path d="M16 16 A3 3 0 0 1 13 13 A6 6 0 0 1 19 7 A9 9 0 0 1 25 16 A12 12 0 0 1 13 28" />
            <line x1="6" y1="6" x2="10" y2="10" strokeWidth="2.5" />
            <line x1="22" y1="22" x2="26" y2="26" strokeWidth="2.5" />
          </g>
        );
      case 'HYPNOTIZED':
        return (
          // Anillos concéntricos hipnóticos
          <g stroke={color} strokeWidth="1.6" fill="none">
            <circle cx="16" cy="16" r="12" />
            <circle cx="16" cy="16" r="8" strokeDasharray="3 2" />
            <circle cx="16" cy="16" r="4" />
            <circle cx="16" cy="16" r="1.5" fill={color} />
          </g>
        );
      case 'CONCEALED':
        return (
          // Velo espectral fluido
          <g stroke={color} strokeWidth="1.8" strokeLinecap="round" fill="none">
            <path d="M4 10 Q10 6 16 10 T28 10" />
            <path d="M4 16 Q10 12 16 16 T28 16" strokeDasharray="4 2" />
            <path d="M4 22 Q10 18 16 22 T28 22" />
            <circle cx="16" cy="16" r="2" fill={color} />
          </g>
        );
      case 'EMPOWERED':
        return (
          // Destello ascendente de espiritualidad
          <g stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none">
            <path d="M16 4 L19 12 L28 13 L21 19 L23 28 L16 23 L9 28 L11 19 L4 13 L13 12 Z" />
            <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2.5" />
          </g>
        );
      default:
        return null;
    }
  };

  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 32 32" 
      className={`inline-block select-none ${className}`}
      aria-label={`Estado: ${status}`}
    >
      {getIconPaths()}
    </svg>
  );
};

