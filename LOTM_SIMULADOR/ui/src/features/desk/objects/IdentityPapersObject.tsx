import React from 'react';
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
  district,
  anchors
}) => {
  return (
    <div className="relative">
      {/* Pliegos Extendidos en Perspectiva sobre la Mesa (Superpuestos a la Caoba de C0) */}
      <div 
        className="identity-papers-sheet hover:scale-102 transition-all select-none relative group cursor-pointer"
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
    </div>
  );
};
