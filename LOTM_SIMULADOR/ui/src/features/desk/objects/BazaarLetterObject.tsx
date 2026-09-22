/**
 * MISIVA SELLADA DEL BAZAR CLANDESTINO — PATH TO GODHOOD (BRIEF-10.VISUAL-R3)
 * Objeto físico de la Capa 2 sobre la caoba: pliego de trapo doblado con sello de lacre carmesí.
 */

import React from 'react';

interface BazaarLetterObjectProps {
  unread?: boolean;
}

export const BazaarLetterObject: React.FC<BazaarLetterObjectProps> = ({
  unread = true
}) => {
  return (
    <div className="relative w-full h-full flex items-center justify-center select-none group">
      
      {/* Sobre de Papel de Trapo (Superpuesto a la Caoba de C0) */}
      <div className="bazaar-letter-envelope hover:scale-102 transition-all">
        {/* Sello de Lacre Carmesí con Relieve Ocultista */}
        <div className="relative mx-auto my-auto flex items-center justify-center opacity-85 group-hover:opacity-100 transition-opacity" style={{ zIndex: 3 }}>
          <div className="bazaar-wax-seal group-hover:scale-110 transition-transform">
            <div style={{ width: '22px', height: '22px', borderRadius: '9999px', border: '1px solid rgba(254, 202, 202, 0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="font-serif font-bold" style={{ fontSize: '10px', color: '#fecaca' }}>
                Ψ
              </span>
            </div>
          </div>
          
          {unread && (
            <span style={{ position: 'absolute', top: '-4px', right: '-4px', width: '7px', height: '7px', borderRadius: '9999px', backgroundColor: '#dc2626', boxShadow: '0 0 6px #dc2626' }} className="animate-pulse" />
          )}
        </div>

        {/* Pie del sobre */}
        <div className="relative flex justify-between items-center font-serif italic opacity-0 group-hover:opacity-100 transition-opacity" style={{ fontSize: '8px', color: '#3d2e1e', zIndex: 2 }}>
          <span className="font-bold">Taberna Bravehearts</span>
          <span className="text-[7.5px] uppercase tracking-wider text-[#8c733e]">Bazar Clandestino</span>
        </div>
      </div>
    </div>
  );
};

