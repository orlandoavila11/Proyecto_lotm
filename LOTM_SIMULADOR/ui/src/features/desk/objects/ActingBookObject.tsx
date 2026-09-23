import React from 'react';
import type { ActingLogEntry, ActingCoherenceTier } from '../../types';
import { BookOpen } from 'lucide-react';

interface ActingBookObjectProps {
  coherence: ActingCoherenceTier;
  actingFeedback: string;
  entries: ActingLogEntry[];
  pathwayName: string;
  sequenceTitle: string;
}

export const ActingBookObject: React.FC<ActingBookObjectProps> = ({
  pathwayName,
  sequenceTitle
}) => {
  return (
    <div className="relative">
      {/* Objeto Físico Cerrado sobre la Mesa */}
      <div 
        className="acting-book-cover hover:rotate-0 hover:scale-105 transition-all select-none group cursor-pointer"
        title="Diario de cuero y preceptos"
      >
        {/* Cantoneras de Latón y Título Dorado en Relieve */}
        <div className="flex justify-between items-start opacity-70 group-hover:opacity-100 transition-opacity">
          <div className="w-3 h-3 rounded-tl border-t-2 border-l-2 border-[#d4af37]" />
          <div className="text-[10px] tracking-widest uppercase font-serif text-[#d4af37] font-bold drop-shadow">
            {pathwayName}
          </div>
          <div className="w-3 h-3 rounded-tr border-t-2 border-r-2 border-[#d4af37]" />
        </div>

        {/* Emblema central en bajo relieve */}
        <div className="flex flex-col items-center justify-center my-auto opacity-75 group-hover:opacity-100 transition-opacity">
          <BookOpen size={22} className="text-[#c29b47] group-hover:text-[#fef08a] transition-colors drop-shadow" />
          <span className="text-[11px] font-serif tracking-wider text-[#d4af37] font-semibold mt-1 drop-shadow">
            {sequenceTitle}
          </span>
        </div>

        {/* Broche de latón inferior */}
        <div className="flex justify-between items-end opacity-70 group-hover:opacity-100 transition-opacity">
          <div className="w-3 h-3 rounded-bl border-b-2 border-l-2 border-[#d4af37]" />
          <div className="w-8 h-1.5 bg-[#8c7038] rounded-full border border-[#d4af37]" />
          <div className="w-3 h-3 rounded-br border-b-2 border-r-2 border-[#d4af37]" />
        </div>
      </div>
    </div>
  );
};

