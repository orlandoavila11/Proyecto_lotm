/**
 * GFX56 — ATMÓSFERA Y EFECTOS LOCALES (BRIEF-10.VISUAL)
 * Motes de polvo flotante en el haz de luz, respiración sutil de la llama y humo localizado.
 * Duraciones entre 6s y 14s. Pausa y desactiva con prefers-reduced-motion.
 */

import React from 'react';

// Generador de 16 partículas deterministas dentro del haz de luz (x: 450-1450, y: 120-750)
const DUST_MOTES = [
  { id: 'mote_1', left: 480, top: 160, size: 2.2, duration: 8.5, delay: 0.2, opacity: 0.45 },
  { id: 'mote_2', left: 560, top: 280, size: 1.8, duration: 11.2, delay: 1.5, opacity: 0.35 },
  { id: 'mote_3', left: 690, top: 210, size: 2.5, duration: 9.8, delay: 0.8, opacity: 0.50 },
  { id: 'mote_4', left: 810, top: 340, size: 1.5, duration: 13.0, delay: 2.2, opacity: 0.30 },
  { id: 'mote_5', left: 940, top: 180, size: 2.0, duration: 10.4, delay: 0.5, opacity: 0.40 },
  { id: 'mote_6', left: 1060, top: 290, size: 2.8, duration: 12.6, delay: 1.9, opacity: 0.55 },
  { id: 'mote_7', left: 1180, top: 220, size: 1.6, duration: 8.0, delay: 2.7, opacity: 0.35 },
  { id: 'mote_8', left: 1320, top: 360, size: 2.1, duration: 14.0, delay: 1.1, opacity: 0.45 },
  { id: 'mote_9', left: 520, top: 480, size: 1.7, duration: 10.0, delay: 3.0, opacity: 0.38 },
  { id: 'mote_10', left: 630, top: 580, size: 2.4, duration: 11.8, delay: 0.4, opacity: 0.48 },
  { id: 'mote_11', left: 770, top: 460, size: 1.9, duration: 9.2, delay: 1.7, opacity: 0.42 },
  { id: 'mote_12', left: 910, top: 540, size: 2.3, duration: 12.2, delay: 2.5, opacity: 0.52 },
  { id: 'mote_13', left: 1040, top: 490, size: 1.4, duration: 13.5, delay: 0.9, opacity: 0.32 },
  { id: 'mote_14', left: 1170, top: 590, size: 2.6, duration: 10.8, delay: 1.4, opacity: 0.50 },
  { id: 'mote_15', left: 1290, top: 510, size: 1.8, duration: 8.8, delay: 2.1, opacity: 0.36 },
  { id: 'mote_16', left: 720, top: 390, size: 2.2, duration: 11.5, delay: 3.3, opacity: 0.44 }
];

interface DustParticlesOverlayProps {
  enabled?: boolean;
}

export const DustParticlesOverlay: React.FC<DustParticlesOverlayProps> = ({
  enabled = true
}) => {
  if (!enabled) return null;

  return (
    <div 
      className="absolute inset-0 pointer-events-none overflow-hidden select-none"
      style={{ zIndex: 32 }}
      aria-hidden="true"
    >
      {/* 1. Motes de Polvo Victoriano en el Haz de Luz */}
      <div className="absolute inset-0">
        {DUST_MOTES.map(mote => (
          <div
            key={mote.id}
            className="absolute rounded-full dust-mote-particle"
            style={{
              left: `${mote.left}px`,
              top: `${mote.top}px`,
              width: `${mote.size}px`,
              height: `${mote.size}px`,
              backgroundColor: '#fef3c7',
              boxShadow: '0 0 4px rgba(254, 240, 138, 0.6)',
              opacity: mote.opacity,
              animation: `dustFloat ${mote.duration}s ease-in-out ${mote.delay}s infinite alternate`
            }}
          />
        ))}
      </div>

      {/* 2. Humo Sutil de la Vela de Sebo (Focalizado sobre x: 595, y: 560) */}
      <div 
        className="absolute candle-smoke-drift"
        style={{
          left: '585px',
          top: '520px',
          width: '20px',
          height: '70px',
          background: 'radial-gradient(ellipse at 50% 100%, rgba(200, 190, 175, 0.15) 0%, rgba(180, 170, 155, 0.05) 50%, transparent 80%)',
          filter: 'blur(3px)',
          animation: 'smokeRise 7s infinite ease-out'
        }}
      />

      {/* 3. Respiración de la Llama / Resonancia Alquímica */}
      <div 
        className="absolute flame-breath-pulse"
        style={{
          left: '510px',
          top: '540px',
          width: '170px',
          height: '170px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(245, 158, 11, 0.08) 0%, rgba(217, 119, 6, 0.03) 50%, transparent 75%)',
          mixBlendMode: 'screen',
          animation: 'flameBreath 4.5s infinite ease-in-out'
        }}
      />
    </div>
  );
};

