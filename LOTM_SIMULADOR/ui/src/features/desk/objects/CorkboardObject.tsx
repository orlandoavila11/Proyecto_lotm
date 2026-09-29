/**
 * TABLERO DE CORCHO DE INVESTIGACIÓN — PATH TO GODHOOD (BRIEF-10.VISUAL-R3)
 * Objeto físico de la Capa 1 empotrado en la pared: marco de roble, corcho, notas y clavos de latón con hilo rojo.
 */

import React from 'react';

interface CorkboardObjectProps {
  caseTitle?: string;
  activeCluesCount?: number;
}

export const CorkboardObject: React.FC<CorkboardObjectProps> = ({
  caseTitle = 'Expediente Cherwood',
  activeCluesCount = 4
}) => {
  return (
    <div className="corkboard-frame select-none group">
      
      {/* Marco de Roble Oscuro con Cantoneras de Latón */}
      <div className="absolute inset-0 pointer-events-none" style={{ border: '1px solid rgba(82, 61, 36, 0.6)' }} />
      <div className="absolute top-1 left-1 w-3 h-3 pointer-events-none" style={{ borderTop: '2px solid #8c733e', borderLeft: '2px solid #8c733e' }} />
      <div className="absolute top-1 right-1 w-3 h-3 pointer-events-none" style={{ borderTop: '2px solid #8c733e', borderRight: '2px solid #8c733e' }} />
      <div className="absolute bottom-1 left-1 w-3 h-3 pointer-events-none" style={{ borderBottom: '2px solid #8c733e', borderLeft: '2px solid #8c733e' }} />
      <div className="absolute bottom-1 right-1 w-3 h-3 pointer-events-none" style={{ borderBottom: '2px solid #8c733e', borderRight: '2px solid #8c733e' }} />

      {/* Cabecera del Expediente (aparece en foco/hover) */}
      <div className="relative flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity" style={{ borderBottom: '1px solid rgba(82, 61, 36, 0.8)', paddingBottom: '4px', zIndex: 2 }}>
        <span className="cinzel font-bold tracking-widest uppercase" style={{ fontSize: '11px', color: '#d4af37' }}>
          {caseTitle}
        </span>
        <div className="flex items-center" style={{ gap: '4px' }}>
          <div 
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '9999px',
              backgroundColor: '#d4af37',
              border: '1px solid #523d14',
              boxShadow: '0 1px 3px rgba(0,0,0,0.6)'
            }} 
            title="Chincheta de latón" 
          />
          <span className="font-serif italic" style={{ fontSize: '9px', color: '#c2b297' }}>
            {activeCluesCount} indicios
          </span>
        </div>
      </div>

      {/* Recortes de Periódico, Notas y Telaraña de Hilos Rojos (revelados en interacción) */}
      <div className="relative flex-1 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity" style={{ margin: '8px 0', padding: '0 4px', zIndex: 2 }}>
        
        {/* Nota 1: Recorte del Heraldo */}
        <div className="corkboard-clue-note" style={{ transform: 'rotate(-2deg)' }}>
          <div className="flex justify-between items-start">
            <span className="font-serif font-bold uppercase" style={{ fontSize: '7px', color: '#33271c' }}>El Heraldo</span>
            <div style={{ width: '8px', height: '8px', borderRadius: '9999px', backgroundColor: '#dc2626', border: '1px solid #7f1d1d', marginTop: '-2px', marginRight: '-2px' }} />
          </div>
          <p className="font-serif line-clamp-3" style={{ fontSize: '6.5px', color: '#1a1612', lineHeight: '1.2' }}>
            Sucesos en los muelles de Backlund durante la niebla...
          </p>
          <div className="font-mono" style={{ fontSize: '6px', color: '#78644e' }}>Loen · Nocturno</div>
        </div>

        {/* Hilos Rojos Tensados entre Clavos */}
        <div className="flex-1 h-full relative pointer-events-none" style={{ margin: '0 4px' }}>
          <svg className="w-full h-full" viewBox="0 0 100 60" fill="none">
            {/* Clavos de conexión */}
            <circle cx="10" cy="20" r="2.5" fill="#d4af37" stroke="#33240d" strokeWidth="0.8" />
            <circle cx="85" cy="40" r="2.5" fill="#d4af37" stroke="#33240d" strokeWidth="0.8" />
            <circle cx="50" cy="15" r="2" fill="#d4af37" stroke="#33240d" strokeWidth="0.8" />

            {/* Hilos rojos tensados */}
            <line x1="10" y1="20" x2="85" y2="40" stroke="#dc2626" strokeWidth="1.5" strokeDasharray="1 0" />
            <line x1="10" y1="20" x2="50" y2="15" stroke="#ef4444" strokeWidth="1" />
            <line x1="50" y1="15" x2="85" y2="40" stroke="#b91c1c" strokeWidth="1.2" />
          </svg>
        </div>

        {/* Nota 2: Manuscrito con Croquis */}
        <div className="corkboard-clue-note" style={{ transform: 'rotate(3deg)', background: '#f5efe3' }}>
          <div className="flex justify-between items-start">
            <span className="font-serif font-bold uppercase" style={{ fontSize: '7px', color: '#423224' }}>Pesquisa</span>
            <div style={{ width: '8px', height: '8px', borderRadius: '9999px', backgroundColor: '#d4af37', border: '1px solid #523d14', marginTop: '-2px', marginRight: '-2px' }} />
          </div>
          <p className="font-serif italic line-clamp-3" style={{ fontSize: '6.5px', color: '#261f17', lineHeight: '1.2' }}>
            El cochero divisó una sombra alta frente al callejón.
          </p>
          <div className="font-serif text-right" style={{ fontSize: '6px', color: '#8a7259' }}>Cherwood</div>
        </div>
      </div>

      {/* Pie del Tablero */}
      <div className="relative flex justify-between items-center font-serif italic opacity-0 group-hover:opacity-100 transition-opacity" style={{ borderTop: '1px solid rgba(82, 61, 36, 0.6)', paddingTop: '2px', fontSize: '9px', color: '#bfad95', zIndex: 2 }}>
        <span className="uppercase tracking-wider font-serif" style={{ fontSize: '8px', color: '#8c733e' }}>Muelle fluvial</span>
        <span>Examinar expediente</span>
      </div>
    </div>
  );
};

