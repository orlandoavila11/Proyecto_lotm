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

  return (
    <div className="relative">
      {/* Pliegos Extendidos en Perspectiva sobre la Mesa (Superpuestos a la Caoba de C0) */}
      <div 
        className="identity-papers-sheet hover:scale-102 transition-all select-none relative group"
        onClick={() => setIsOpen(true)}
        title="Documentos civiles y fianza de humanidad"
      >
        {/* Cabecera del papel timbrado */}
        <div className="flex justify-between items-center border-b border-[#8c733e]/40 pb-1 mb-1 opacity-80 group-hover:opacity-100 transition-opacity">
          <span className="text-[10px] font-bold tracking-widest uppercase font-serif text-[#3d2e1e]">
            REINO DE LOEN · ACTA
          </span>
          <div className="w-2.5 h-2.5 rounded-full bg-[#851c22] border border-[#a68444] opacity-80 shadow-sm" />
        </div>

        {/* Nombre y Oficio Caligrafiados como Tinta Ferrogálica */}
        <div className="text-sm font-bold text-[#1f170f] font-serif leading-tight tracking-wide drop-shadow-sm">
          {name}
        </div>
        <div className="text-[11px] italic text-[#3d2e1e] font-serif mb-1">
          {profession} · {district}
        </div>

        {/* Huellas de Anclas */}
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#4a3622] mt-auto opacity-85 group-hover:opacity-100 transition-opacity">
          <Anchor size={12} className="text-[#8c7038]" />
          <span>{anchors.length} Vínculos Mortales</span>
        </div>
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
