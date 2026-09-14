import React, { useState } from 'react';
import type { AnchorItem } from '../../types';
import { Anchor } from 'lucide-react';

interface IdentityPapersObjectProps {
  name: string;
  profession: string;
  originTitle: string;
  district: string;
  burden: {
    type: 'DEUDA' | 'SECRETO';
    description: string;
    details: string;
  };
  anchors: AnchorItem[];
}

export const IdentityPapersObject: React.FC<IdentityPapersObjectProps> = ({
  name,
  profession,
  originTitle,
  district,
  burden,
  anchors
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hovered, setHovered] = useState(false);

  return (
    <div className="relative">
      {/* Pliegos Extendidos en Perspectiva sobre la Mesa */}
      <div 
        className="w-56 h-36 bg-[#ede3cc] text-[#1a1612] rounded-sm p-3 shadow-xl border border-[#b8a688] cursor-pointer select-none transform rotate-2 hover:rotate-0 hover:scale-105 transition-all duration-300 relative group overflow-hidden"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => setIsOpen(true)}
        title="Documentos civiles y fianza de humanidad"
        style={{
          backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(180, 140, 90, 0.25) 0%, transparent 50%), linear-gradient(180deg, #f0e7d5 0%, #e3d3b6 100%)'
        }}
      >
        {/* Cabecera del papel timbrado */}
        <div className="flex justify-between items-center border-b border-[#a89373] pb-1 mb-2">
          <span className="text-[10px] font-bold tracking-widest uppercase font-serif text-[#4a3b29]">
            REINO DE LOEN · ACTA
          </span>
          <div className="w-3 h-3 rounded-full bg-[#851c22] border border-[#a68444] opacity-80" />
        </div>

        {/* Nombre y Oficio Caligrafiados */}
        <div className="text-sm font-bold text-[#2b2014] font-serif leading-tight">
          {name}
        </div>
        <div className="text-[11px] italic text-[#57442f] font-serif mb-2">
          {profession} · {district}
        </div>

        {/* Huellas de Anclas */}
        <div className="flex items-center gap-1 text-[10px] font-bold text-[#6b553c] mt-auto">
          <Anchor size={12} className="text-[#8c7038]" />
          <span>{anchors.length} Vínculos Mortales</span>
        </div>
      </div>

      {/* Etiqueta Ambiental en Reposo (≤ 7 Palabras) */}
      <div 
        className={`absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-serif italic text-[#c2b297] bg-[#120f0c]/90 px-2 py-0.5 rounded border border-[#423524] transition-opacity duration-200 pointer-events-none z-20 ${
          hovered && !isOpen ? 'opacity-100' : 'opacity-0'
        }`}
      >
        Actas de identidad y fianza civil
      </div>

      {/* Documento Elevado en Primer Plano (Modal de Lectura) */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center p-6 z-50 animate-fadeIn"
          onClick={() => setIsOpen(false)}
        >
          <div 
            className="w-full max-w-xl bg-[#ede4d1] text-[#1a1612] rounded shadow-2xl p-8 border-2 border-[#8c7038] relative font-serif max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundImage: 'radial-gradient(circle at 15% 15%, rgba(190, 160, 110, 0.25) 0%, transparent 40%), linear-gradient(180deg, #f5efe3 0%, #dfd1b8 100%)'
            }}
          >
            {/* Botón de Cierre */}
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-[#5c4a35] hover:text-[#1a1612] font-bold text-lg"
            >
              ✕
            </button>

            {/* Encabezado Formal */}
            <div className="text-center border-b-2 border-[#8c7038] pb-3 mb-4">
              <span className="text-xs uppercase tracking-widest text-[#69533b] font-bold">
                REGISTRO CIVIL Y NOTARIAL DE BACKLUND
              </span>
              <h2 className="text-2xl font-bold tracking-wider text-[#302113] cinzel mt-1">
                {name}
              </h2>
              <p className="text-sm italic text-[#57442f]">
                {profession} · {originTitle} ({district})
              </p>
            </div>

            {/* Carga Inicial: Deuda o Secreto */}
            <div className="mb-5 p-3.5 bg-[#dfd0b5] rounded border border-[#9c8464]">
              <div className="text-xs uppercase font-bold tracking-wider text-[#851c22] mb-1">
                CARGA IRREVOCABLE: {burden.type}
              </div>
              <p className="text-xs italic text-[#261e16] leading-relaxed">
                "{burden.description}"
              </p>
            </div>

            {/* Las 3 Anclas Humanas */}
            <h3 className="text-sm font-bold tracking-wider text-[#3d2b1a] uppercase mb-3 border-b border-[#b39b7d] pb-1">
              ANCLAS DE HUMANIDAD FIRMADAS
            </h3>
            <div className="space-y-3">
              {anchors.map((anchor) => (
                <div key={anchor.id} className="p-3 bg-[#e8dcbf] rounded border-l-4 border-[#8c7038] flex justify-between items-start">
                  <div>
                    <div className="text-xs font-bold text-[#2e2318]">{anchor.nombre}</div>
                    <div className="text-[11px] italic text-[#523f2c] mt-0.5">"{anchor.descripcion}"</div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-[#cfbe9e] text-[#423220] rounded">
                    {anchor.fuerza}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
