/**
 * RELOJ DE FALTRIQUERA Y ALMANAQUE CIVIL — PATH TO GODHOOD (BRIEF-10.VISUAL-R3)
 * Objeto físico de la Capa 2: escape mecánico de latón y cuadrante de 4 franjas horarias.
 */

import React from 'react';

interface PocketWatchObjectProps {
  timeSlot?: 'MAÑANA' | 'TARDE' | 'NOCHE' | 'MADRUGADA' | string;
  dayNumber?: number;
}

export const PocketWatchObject: React.FC<PocketWatchObjectProps> = ({
  timeSlot = 'NOCHE',
  dayNumber = 4
}) => {
  // Ángulo de la manecilla de acero pavonado según la franja
  const getHandRotation = () => {
    switch (timeSlot) {
      case 'MAÑANA': return 45;
      case 'TARDE': return 135;
      case 'NOCHE': return 225;
      case 'MADRUGADA': return 315;
      default: return 225;
    }
  };

  const getSlotLabel = () => {
    switch (timeSlot) {
      case 'MAÑANA': return 'Amanecer';
      case 'TARDE': return 'Mediodía';
      case 'NOCHE': return 'Crepúsculo';
      case 'MADRUGADA': return 'Medianoche';
      default: return 'Crepúsculo';
    }
  };

  return (
    <div className="relative w-full h-full select-none group">
      
      {/* Placa de Latón Grabada con Día y Franja */}
      <div 
        className="absolute bottom-1 left-1/2 -translate-x-1/2 z-20 px-2.5 py-0.5 rounded bg-[#100e0b]/90 border border-[#8c733e]/80 shadow-md group-hover:border-[#d4af37] transition-colors"
      >
        <span className="font-serif font-bold uppercase tracking-wider text-[9px] text-[#d4af37]">
          DÍA {dayNumber} · {getSlotLabel()}
        </span>
      </div>

      {/* Manecilla Giratoria centrada sobre la esfera derecha del reloj C0 */}
      <div 
        className="absolute pointer-events-none"
        style={{
          top: '52%',
          left: '73%',
          transform: 'translate(-50%, -50%)',
          width: '70px',
          height: '70px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div 
          style={{ 
            position: 'absolute',
            bottom: '50%',
            left: 'calc(50% - 1.5px)',
            width: '3px',
            height: '24px',
            transform: `rotate(${getHandRotation()}deg)`,
            transformOrigin: '50% 100%',
            transition: 'transform 700ms cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          <div style={{ width: '100%', height: '100%', background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)', borderRadius: '3px 3px 0 0' }} />
        </div>

        {/* Eje central dorado */}
        <div 
          style={{
            position: 'relative',
            zIndex: 10,
            width: '7px',
            height: '7px',
            borderRadius: '9999px',
            backgroundColor: '#d4af37',
            border: '1px solid #523d14',
            boxShadow: '0 1px 2px rgba(0,0,0,0.6)'
          }} 
        />
      </div>
    </div>
  );
};

