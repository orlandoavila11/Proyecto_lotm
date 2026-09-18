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
    <div className="relative w-full h-full flex items-center justify-center select-none group">
      
      {/* Pliego del Almanaque Civil Plegado debajo del Reloj */}
      <div className="pocketwatch-parchment pointer-events-none group-hover:rotate-0 transition-transform">
        <div className="flex justify-between items-center" style={{ borderBottom: '1px solid rgba(168, 149, 116, 0.6)', paddingBottom: '2px' }}>
          <span className="font-serif font-bold uppercase tracking-wider" style={{ fontSize: '7px', color: '#4a3a25' }}>
            ALMANAQUE
          </span>
          <span className="font-mono" style={{ fontSize: '7px', color: '#6b5536' }}>
            DÍA {dayNumber}
          </span>
        </div>
        
        {/* Retícula tenue del calendario victoriano */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: '2px', margin: 'auto 0', opacity: 0.45 }}>
          {Array.from({ length: 14 }).map((_, i) => (
            <div key={i} style={{ width: '10px', height: '8px', backgroundColor: 'rgba(140, 112, 72, 0.35)', borderRadius: '1px' }} />
          ))}
        </div>

        <div className="font-serif italic text-right" style={{ fontSize: '6.5px', color: '#665239' }}>
          Reino de Loen
        </div>
      </div>

      {/* Cadena de Latón Retorcido que cae sobre la caoba */}
      <svg className="absolute pointer-events-none opacity-70 group-hover:opacity-100 transition-opacity" style={{ top: '-12px', right: '-4px', width: '48px', height: '40px' }} viewBox="0 0 48 40" fill="none">
        <path 
          d="M 2 35 Q 15 10 30 18 T 46 2" 
          stroke="#d4af37" 
          strokeWidth="1.8" 
          strokeDasharray="2 2" 
          strokeLinecap="round" 
        />
      </svg>

      {/* Caja Redonda del Reloj de Faltriquera de Latón Envejecido */}
      <div className="pocketwatch-case transition-transform group-hover:scale-105">
        
        {/* Corona de Cuerda y Anilla Superior */}
        <div 
          style={{
            position: 'absolute',
            top: '-10px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '16px',
            height: '10px',
            background: 'linear-gradient(180deg, #d4af37 0%, #8c733e 100%)',
            borderRadius: '4px 4px 0 0',
            border: '1px solid #fef08a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div style={{ width: '6px', height: '4px', backgroundColor: '#24170e', borderRadius: '1px' }} />
        </div>

        {/* Esfera de Porcelana Marfil con Cristal Convexo */}
        <div className="pocketwatch-dial">
          
          {/* Cuadrantes de las Cuatro Franjas (Marcas cardinales) */}
          <div className="absolute inset-1 rounded-full pointer-events-none" style={{ border: '1px solid rgba(184, 160, 120, 0.4)' }}>
            <span style={{ position: 'absolute', top: '2px', left: '50%', transform: 'translateX(-50%)', fontSize: '7px', fontFamily: 'EB Garamond, serif', fontWeight: 'bold', color: '#3a2c1b' }}>XII</span>
            <span style={{ position: 'absolute', right: '4px', top: '50%', transform: 'translateY(-50%)', fontSize: '7px', fontFamily: 'EB Garamond, serif', fontWeight: 'bold', color: '#3a2c1b' }}>III</span>
            <span style={{ position: 'absolute', bottom: '2px', left: '50%', transform: 'translateX(-50%)', fontSize: '7px', fontFamily: 'EB Garamond, serif', fontWeight: 'bold', color: '#3a2c1b' }}>VI</span>
            <span style={{ position: 'absolute', left: '4px', top: '50%', transform: 'translateY(-50%)', fontSize: '7px', fontFamily: 'EB Garamond, serif', fontWeight: 'bold', color: '#3a2c1b' }}>IX</span>
          </div>

          {/* Manecilla de Acero Pavonado Giratoria */}
          <div 
            style={{ 
              position: 'absolute',
              top: '14px',
              width: '4px',
              height: '28px',
              transform: `rotate(${getHandRotation()}deg)`,
              transformOrigin: '50% 100%',
              transition: 'transform 700ms cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            <div style={{ width: '100%', height: '100%', background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)', borderRadius: '4px 4px 0 0' }} />
          </div>

          {/* Eje central dorado */}
          <div 
            style={{
              position: 'relative',
              zIndex: 10,
              width: '8px',
              height: '8px',
              borderRadius: '9999px',
              backgroundColor: '#d4af37',
              border: '1px solid #523d14',
              boxShadow: '0 1px 2px rgba(0,0,0,0.6)'
            }} 
          />

          {/* Reflejo de Luz Diagonal sobre el Cristal Convexo */}
          <div 
            className="absolute pointer-events-none" 
            style={{
              inset: '-100%',
              background: 'linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.2) 50%, transparent 60%)',
              transform: 'rotate(-45deg)'
            }} 
          />
        </div>
      </div>

      {/* Indicador de Franja Actual (Texto inferior sutil) */}
      <div 
        style={{
          position: 'absolute',
          bottom: '-6px',
          zIndex: 20,
          padding: '2px 8px',
          borderRadius: '4px',
          backgroundColor: 'rgba(16, 14, 11, 0.95)',
          border: '1px solid #8c733e',
          boxShadow: '0 2px 6px rgba(0,0,0,0.8)'
        }}
      >
        <span className="font-serif font-bold uppercase tracking-wider" style={{ fontSize: '8px', color: '#d4af37' }}>
          {getSlotLabel()}
        </span>
      </div>
    </div>
  );
};
