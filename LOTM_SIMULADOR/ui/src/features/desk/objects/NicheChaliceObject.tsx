/**
 * HORNACINA RITUAL Y EL CÁLIZ DE PLATA — PATH TO GODHOOD (BRIEF-10.VISUAL-R3)
 * Objeto físico de la Capa 1 empotrado en el muro umbrío: ritual de ascensión y transmutación.
 */

import React from 'react';
import { Sparkles } from 'lucide-react';

interface NicheChaliceObjectProps {
  advancementReady?: boolean;
}

export const NicheChaliceObject: React.FC<NicheChaliceObjectProps> = ({
  advancementReady = false
}) => {
  return (
    <div className="niche-container select-none group">
      
      {/* Hueco de la Hornacina Gótica en el Muro (Sombra profunda y arco) */}
      <div className="niche-alcove">
        {/* Forro de terciopelo damasco envejecido en el fondo */}
        <div 
          className="absolute inset-0 pointer-events-none" 
          style={{
            opacity: 0.25,
            backgroundImage: 'radial-gradient(#4a2b38 1px, transparent 1px)',
            backgroundSize: '8px 8px'
          }}
        />

        {/* Resplandor sutil de las Cinco Puertas */}
        <div 
          className="absolute inset-0 pointer-events-none transition-opacity duration-700"
          style={{
            background: 'radial-gradient(ellipse at 50% 75%, rgba(212, 175, 55, 0.25) 0%, rgba(168, 85, 247, 0.12) 50%, transparent 80%)',
            opacity: advancementReady ? 1 : 0.45
          }} 
        />
      </div>

      {/* Chispas Místicas / Vaho de las Cinco Puertas */}
      <div className="relative pt-1 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" style={{ zIndex: 2 }}>
        <Sparkles 
          size={14} 
          color={advancementReady ? '#fef08a' : '#cbd5e1'}
          className={advancementReady ? 'animate-spin' : ''} 
        />
      </div>

      {/* Resplandor Alquímico en el Cáliz cuando la poción está lista */}
      {advancementReady && (
        <div className="relative flex flex-col items-center my-auto transition-transform duration-300 animate-pulse" style={{ zIndex: 2 }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '9999px', background: 'radial-gradient(circle, rgba(254, 240, 138, 0.6) 0%, rgba(212, 175, 55, 0.2) 60%, transparent 80%)' }} />
        </div>
      )}

      {/* Peana de la Hornacina (sutil identificación en hover) */}
      <div className="relative w-full flex flex-col items-center opacity-0 group-hover:opacity-100 transition-opacity" style={{ zIndex: 2 }}>
        <span 
          className="font-serif uppercase tracking-widest text-center" 
          style={{ fontSize: '8px', color: '#d4af37', marginTop: '2px' }}
        >
          {advancementReady ? 'Poción lista' : 'El Cáliz'}
        </span>
      </div>
    </div>
  );
};

