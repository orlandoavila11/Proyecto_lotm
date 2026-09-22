import React, { useState } from 'react';
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
  coherence,
  actingFeedback,
  entries,
  pathwayName,
  sequenceTitle
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      {/* Objeto Físico Cerrado sobre la Mesa */}
      <div 
        className="acting-book-cover hover:rotate-0 hover:scale-105 transition-all select-none group"
        onClick={() => setIsOpen(true)}
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

      {/* Cuaderno Abierto Modal / Despliegue de Prosa bajo demanda */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center p-6 z-50 animate-fadeIn"
          onClick={() => setIsOpen(false)}
        >
          <div 
            className="w-full max-w-2xl bg-[#ede4d1] text-[#1a1612] rounded shadow-2xl p-8 border-4 border-[#3d2a1b] relative font-serif max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(190, 160, 110, 0.2) 0%, transparent 40%), linear-gradient(180deg, #f5efe3 0%, #e6dac1 100%)'
            }}
          >
            {/* Botón de Cierre */}
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-[#5c4a35] hover:text-[#1a1612] font-bold text-lg"
            >
              ✕
            </button>

            <h2 className="text-xl font-bold tracking-widest text-[#423220] border-b-2 border-[#8c7038] pb-2 mb-4 font-serif cinzel text-center">
              EL CUADERNO DEL INTÉRPRETE
            </h2>

            {/* Reflexión del Principio de Actuación */}
            <div className="mb-6 p-4 rounded bg-[#dfd2be] border border-[#a68d6d]">
              <div className="text-xs uppercase tracking-wider font-bold text-[#5c452e] mb-1">
                Afinidad con la Secuencia · {coherence}
              </div>
              <p className="text-sm italic leading-relaxed text-[#261f17]">
                "{actingFeedback}"
              </p>
            </div>

            {/* Entradas del Diario */}
            <h3 className="text-md font-bold tracking-wide text-[#3b2b1a] mb-3 border-b border-[#b39b7d] pb-1">
              REGISTRO DE VIVENCIAS Y PRECEPTOS
            </h3>

            {entries.length === 0 ? (
              <p className="text-sm italic text-[#635341] text-center py-6">
                Aún no has sellado tus primeras interpretaciones en las calles de Backlund.
              </p>
            ) : (
              <div className="space-y-4">
                {entries.map((entry) => (
                  <div key={entry.id} className="p-3 bg-[#e8dcbf] rounded border-l-4 border-[#785933]">
                    <div className="flex justify-between text-xs text-[#523f2b] font-bold mb-1">
                      <span>DÍA {entry.day} · {entry.principle}</span>
                      <span className="italic">{entry.choiceTaken}</span>
                    </div>
                    <p className="text-xs text-[#2b2218] italic leading-relaxed">
                      "{entry.narrativeOutcome}"
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

