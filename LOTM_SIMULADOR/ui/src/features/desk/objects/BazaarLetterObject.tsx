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
      
      {/* Sobre de Papel de Trapo Grueso y Manchado de Tizne */}
      <div className="bazaar-letter-envelope group-hover:rotate-0 group-hover:scale-105 transition-all">
        {/* Pliegues Diagonales del Sobre (SVG de solapas) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40" viewBox="0 0 128 96" fill="none">
          <path d="M 0 0 L 64 50 L 128 0" stroke="#8a7554" strokeWidth="1" />
          <path d="M 0 96 L 45 42" stroke="#8a7554" strokeWidth="0.8" />
          <path d="M 128 96 L 83 42" stroke="#8a7554" strokeWidth="0.8" />
        </svg>

        {/* Destinatario caligrafiado en tinta ferrogálica desvaída */}
        <div className="relative pt-1 pl-1" style={{ zIndex: 2 }}>
          <div style={{ width: '64px', height: '4px', backgroundColor: 'rgba(66, 51, 33, 0.4)', borderRadius: '9999px', marginBottom: '4px' }} />
          <div style={{ width: '40px', height: '2px', backgroundColor: 'rgba(66, 51, 33, 0.3)', borderRadius: '9999px' }} />
        </div>

        {/* Sello de Lacre Carmesí con Relieve Ocultista */}
        <div className="relative mx-auto my-auto flex items-center justify-center" style={{ zIndex: 3 }}>
          <div className="bazaar-wax-seal">
            <div style={{ width: '22px', height: '22px', borderRadius: '9999px', border: '1px solid rgba(254, 202, 202, 0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="font-serif font-bold" style={{ fontSize: '10px', color: '#fecaca' }}>
                Ψ
              </span>
            </div>
          </div>
          
          {/* Gotitas de lacre escurridas sobre el papel */}
          <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '8px', height: '8px', borderRadius: '9999px', backgroundColor: '#7f1d1d', opacity: 0.8 }} />
        </div>

        {/* Pie del sobre */}
        <div className="relative flex justify-between items-center font-serif italic" style={{ fontSize: '7.5px', color: '#63503a', zIndex: 2 }}>
          <span>Taberna Bravehearts</span>
          {unread && (
            <span style={{ width: '6px', height: '6px', borderRadius: '9999px', backgroundColor: '#dc2626' }} className="animate-pulse" />
          )}
        </div>
      </div>

      {/* Etiqueta ambiental flotante al pie */}
      <div 
        className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
        style={{
          position: 'absolute',
          bottom: '-6px',
          zIndex: 20,
          padding: '2px 8px',
          borderRadius: '4px',
          backgroundColor: 'rgba(16, 14, 11, 0.95)',
          border: '1px solid #785532',
          boxShadow: '0 2px 6px rgba(0,0,0,0.8)'
        }}
      >
        <span className="font-serif italic" style={{ fontSize: '8px', color: '#dfcaa2' }}>
          Lacre del mercado
        </span>
      </div>
    </div>
  );
};
