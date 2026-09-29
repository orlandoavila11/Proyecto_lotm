/**
 * GFX57 — FAMILIA DE CONTROLES E ICONOS VECTORIALES VICTORIANOS
 * Iconos vectoriales limpios con viewBox común 24x24 y reconocimiento nítido a 24px.
 * No representan estadísticas numéricas ni rarezas; sirven a la navegación y control de UI.
 */

import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  className?: string;
  color?: string;
}

/** 1. Volver / Regresar (Flecha victoriana ornamentada) */
export const VictorianIconReturn: React.FC<IconProps> = ({ size = 24, className = '', color = 'currentColor', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M19 12H5" />
    <path d="M11 6L5 12L11 18" />
    <circle cx="20" cy="12" r="1.5" fill={color} />
  </svg>
);

/** 2. Cerrar (Cruz de hierro filigranada) */
export const VictorianIconClose: React.FC<IconProps> = ({ size = 24, className = '', color = 'currentColor', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
    <circle cx="12" cy="12" r="9" strokeWidth="1" strokeDasharray="2 2" />
  </svg>
);

/** 3. Avanzar (Flecha hacia adelante / compás de navegación) */
export const VictorianIconAdvance: React.FC<IconProps> = ({ size = 24, className = '', color = 'currentColor', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M5 12H19" />
    <path d="M13 6L19 12L13 18" />
    <circle cx="4" cy="12" r="1.5" fill={color} />
  </svg>
);

/** 4. Ayuda (Grabado en sello con signo de interrogación) */
export const VictorianIconHelp: React.FC<IconProps> = ({ size = 24, className = '', color = 'currentColor', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <circle cx="12" cy="12" r="10" strokeWidth="1.5" />
    <path d="M9.09 9C9.3251 8.33167 9.78915 7.76811 10.4 7.39913C11.0108 7.03016 11.7289 6.88007 12.435 6.97405C13.1412 7.06803 13.7884 7.39977 14.269 7.91382C14.7496 8.42787 15.0315 9.09051 15.067 9.79C15.067 11.5 12.5 12.5 12.5 14" />
    <circle cx="12" cy="17.5" r="1" fill={color} />
  </svg>
);

/** 5. Ajustes (Engranaje de relojería victoriana) */
export const VictorianIconSettings: React.FC<IconProps> = ({ size = 24, className = '', color = 'currentColor', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <circle cx="12" cy="12" r="3.5" />
    <path d="M19.4 15A1.65 1.65 0 0 0 20 16.3A2 2 0 0 1 18.3 19A1.65 1.65 0 0 0 17 19.4A1.65 1.65 0 0 0 16.3 20A2 2 0 0 1 13.6 20A1.65 1.65 0 0 0 13 19.4A1.65 1.65 0 0 0 12 19.4A1.65 1.65 0 0 0 11 19.4A1.65 1.65 0 0 0 10.4 20A2 2 0 0 1 7.7 20A1.65 1.65 0 0 0 7 19.4A1.65 1.65 0 0 0 5.7 19A2 2 0 0 1 4 16.3A1.65 1.65 0 0 0 4.6 15A1.65 1.65 0 0 0 4 13.6A2 2 0 0 1 4 10.4A1.65 1.65 0 0 0 4.6 9A1.65 1.65 0 0 0 4 7.7A2 2 0 0 1 5.7 5A1.65 1.65 0 0 0 7 4.6A1.65 1.65 0 0 0 7.7 4A2 2 0 0 1 10.4 4A1.65 1.65 0 0 0 11 4.6A1.65 1.65 0 0 0 12 4.6A1.65 1.65 0 0 0 13 4.6A1.65 1.65 0 0 0 13.6 4A2 2 0 0 1 16.3 4A1.65 1.65 0 0 0 17 4.6A1.65 1.65 0 0 0 18.3 5A2 2 0 0 1 20 7.7A1.65 1.65 0 0 0 19.4 9A1.65 1.65 0 0 0 20 10.4A2 2 0 0 1 20 13.6A1.65 1.65 0 0 0 19.4 15Z" />
  </svg>
);

/** 6. Sonido / Resonancia (Campana de latón victoriana) */
export const VictorianIconSound: React.FC<IconProps> = ({ size = 24, className = '', color = 'currentColor', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M18 8A6 6 0 0 0 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" />
    <path d="M13.73 21A2 2 0 0 1 10.27 21" />
  </svg>
);

/** 7. Movimiento / Péndulo (Péndulo oscilante) */
export const VictorianIconMotion: React.FC<IconProps> = ({ size = 24, className = '', color = 'currentColor', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M12 3V15" />
    <circle cx="12" cy="18" r="3" />
    <path d="M6 3H18" />
  </svg>
);

/** 8. Lupa de Inspección (Lupa con mango victoriano) */
export const VictorianIconMagnifier: React.FC<IconProps> = ({ size = 24, className = '', color = 'currentColor', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

/** 9. Vela de Sebo (Candelero y llama) */
export const VictorianIconCandle: React.FC<IconProps> = ({ size = 24, className = '', color = 'currentColor', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <rect x="9" y="10" width="6" height="11" rx="1" />
    <line x1="12" y1="10" x2="12" y2="8" />
    <path d="M12 2C11 4 10 5.5 10 6.5C10 7.6 10.9 8.5 12 8.5C13.1 8.5 14 7.6 14 6.5C14 5.5 13 4 12 2Z" fill={color} />
    <path d="M6 21H18" />
  </svg>
);

/** 10. Cáliz Ceremonial */
export const VictorianIconChalice: React.FC<IconProps> = ({ size = 24, className = '', color = 'currentColor', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M6 3H18C18 3 18 11 12 11C6 11 6 3 6 3Z" />
    <line x1="12" y1="11" x2="12" y2="19" />
    <path d="M8 21H16" />
  </svg>
);

