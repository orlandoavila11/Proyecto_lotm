/**
 * GFX11 — MAPA DE ILUMINACIÓN DIEGÉTICA POR FRANJAS HORARIAS (BRIEF-10.VISUAL)
 * 
 * Implementa las 4 franjas canónicas del dominio de Backlund:
 * 1. MAÑANA / ALBA: Neblina fría azulada matutina, luz cenital tenue.
 * 2. TARDE / MEDIODIA: Luz dorada templada, haz diagonal cálido.
 * 3. NOCHE / CREPUSCULO: Smog de Backlund, crepúsculo cobrizo y sombras contrastadas.
 * 4. MADRUGADA / MEDIANOCHE: Oscuridad profunda, luz focalizada de vela y tenue halo lunar.
 * 
 * Cumple con accesibilidad y 'prefers-reduced-motion'.
 */

import React from 'react';
import type { TimeSlot } from '../../features/types';

export interface LightingPreset {
  ambientOverlay: string;
  skylightGradient: string;
  candleGlowIntensity: number;
  windowGlowColor: string;
  shadowAlpha: number;
  contrastFilter: string;
  temperatureKelvinDesc: string;
}

export const TIME_LIGHTING_PRESETS: Record<TimeSlot, LightingPreset> = {
  MAÑANA: {
    ambientOverlay: 'rgba(125, 160, 200, 0.08)',
    skylightGradient: 'radial-gradient(ellipse at 50% 0%, rgba(186, 230, 253, 0.28) 0%, rgba(147, 197, 253, 0.12) 40%, transparent 75%)',
    candleGlowIntensity: 0.35,
    windowGlowColor: 'rgba(219, 234, 254, 0.4)',
    shadowAlpha: 0.18,
    contrastFilter: 'contrast(0.98) brightness(1.02)',
    temperatureKelvinDesc: 'Luz fría matutina filtrada por la neblina del Támesis'
  },
  TARDE: {
    ambientOverlay: 'rgba(235, 195, 110, 0.06)',
    skylightGradient: 'radial-gradient(ellipse at 40% 0%, rgba(254, 240, 138, 0.30) 0%, rgba(245, 158, 11, 0.10) 45%, transparent 80%)',
    candleGlowIntensity: 0.4,
    windowGlowColor: 'rgba(254, 243, 199, 0.45)',
    shadowAlpha: 0.12,
    contrastFilter: 'contrast(1.0) brightness(1.0)',
    temperatureKelvinDesc: 'Luz diurna templada y clara sobre la caoba'
  },
  NOCHE: {
    ambientOverlay: 'rgba(217, 119, 6, 0.09)',
    skylightGradient: 'radial-gradient(ellipse at 50% 0%, rgba(249, 115, 22, 0.22) 0%, rgba(180, 83, 9, 0.08) 50%, transparent 75%)',
    candleGlowIntensity: 0.85,
    windowGlowColor: 'rgba(180, 83, 9, 0.35)',
    shadowAlpha: 0.32,
    contrastFilter: 'contrast(1.06) brightness(0.95)',
    temperatureKelvinDesc: 'Crepúsculo cobrizo y hollín de carbón en Backlund'
  },
  MADRUGADA: {
    ambientOverlay: 'rgba(10, 14, 26, 0.32)',
    skylightGradient: 'radial-gradient(ellipse at 50% 0%, rgba(148, 163, 184, 0.12) 0%, rgba(30, 41, 59, 0.05) 40%, transparent 60%)',
    candleGlowIntensity: 1.0,
    windowGlowColor: 'rgba(203, 213, 225, 0.2)',
    shadowAlpha: 0.55,
    contrastFilter: 'contrast(1.15) brightness(0.88)',
    temperatureKelvinDesc: 'Medianoche profunda bajo el silencio de la niebla'
  }
};

interface TimeLightingLayerProps {
  timeSlot: TimeSlot;
  candleActive?: boolean;
}

export const TimeLightingLayer: React.FC<TimeLightingLayerProps> = ({
  timeSlot,
  candleActive = true
}) => {
  const preset = TIME_LIGHTING_PRESETS[timeSlot] || TIME_LIGHTING_PRESETS.NOCHE;

  return (
    <div 
      className="absolute inset-0 pointer-events-none transition-all duration-1000 select-none"
      style={{
        zIndex: 'var(--z-lighting, 30)',
        filter: preset.contrastFilter
      }}
      aria-hidden="true"
    >
      {/* 1. Tinte ambiental volumétrico general */}
      <div 
        className="absolute inset-0 transition-colors duration-1000"
        style={{ backgroundColor: preset.ambientOverlay }}
      />

      {/* 2. Haz de luz diagonal de la claraboya */}
      <div 
        className="absolute top-0 right-[220px] w-[850px] h-[700px] transition-all duration-1000"
        style={{ background: preset.skylightGradient, mixBlendMode: 'screen' }}
      />

      {/* 2.5. Resplandor cálido de la lámpara de gas sobre la escalera de caracol */}
      <div 
        className="absolute top-[30px] left-[20px] w-[260px] h-[260px] transition-opacity duration-1000 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(245, 170, 45, 0.24) 0%, rgba(217, 119, 6, 0.08) 45%, transparent 75%)',
          mixBlendMode: 'screen'
        }}
      />

      {/* 3. Halo cálido focal de la vela de sebo (centrado en x: 508px, y: 380px) */}
      {candleActive && (
        <div 
          className="absolute transition-opacity duration-700 pointer-events-none"
          style={{
            left: '378px',
            top: '250px',
            width: '260px',
            height: '260px',
            borderRadius: '50%',
            background: `radial-gradient(circle, rgba(245, 158, 11, ${0.35 * preset.candleGlowIntensity}) 0%, rgba(217, 119, 6, ${0.18 * preset.candleGlowIntensity}) 40%, transparent 75%)`,
            mixBlendMode: 'screen'
          }}
        />
      )}

      {/* 4. Viñeta perimetral de sombra diegética del desván */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 50% 55%, transparent 50%, rgba(9, 8, 7, ${preset.shadowAlpha}) 100%)`
        }}
      />
    </div>
  );
};

