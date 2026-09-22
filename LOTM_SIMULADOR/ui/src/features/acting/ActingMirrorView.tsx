import React from 'react';
import { ArrowLeft, Feather, Sparkles, BookOpen, AlertCircle } from 'lucide-react';
import type { CharacterDiegetic } from '../types';

interface ActingMirrorViewProps {
  character: CharacterDiegetic;
  onBackToDesk: () => void;
}

export const ActingMirrorView: React.FC<ActingMirrorViewProps> = ({ character, onBackToDesk }) => {
  return (
    <div 
      className="acting-screen p-8 flex flex-col justify-between select-none relative overflow-hidden" 
      style={{ 
        width: '1920px', 
        height: '1080px', 
        position: 'relative', 
        background: '#100e0b' 
      }}
    >
      
      {/* Cabecera */}
      <header className="flex justify-between items-center pb-4 border-b border-[#2d2419] mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onBackToDesk}
            className="p-2 bg-[#171410] border border-[#383024] hover:border-[#8c733e] text-[#d4af37] rounded flex items-center gap-2 text-sm font-serif transition-all"
          >
            <ArrowLeft size={16} />
            Regresar al Buró
          </button>
          <div>
            <h1 className="text-xl font-bold tracking-widest text-[#d4af37]" style={{ fontFamily: 'Cinzel' }}>
              EL ESPEJO DEL PAPEL Y LOS PRINCIPIOS
            </h1>
            <p className="text-xs text-[#968c7e] italic">
              Vía {character.pathwayName} · {character.sequenceTitle}
            </p>
          </div>
        </div>
      </header>

      {/* Contenido Central */}
      <div className="grid grid-cols-12 gap-6 flex-1 mb-6">
        
        {/* Lado Izquierdo: El Reflejo Actoral */}
        <div className="col-span-5 bg-[#15120e] p-6 rounded-lg border border-[#2d2419] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4 border-b border-[#2d2419] pb-3">
              <Sparkles size={20} className="text-[#d4af37]" />
              <h2 className="font-serif font-bold text-base text-[#e5ded2]" style={{ fontFamily: 'Cinzel' }}>
                Coherencia de la Máscara
              </h2>
            </div>

            <div className="parchment-sheet p-5 rounded text-[#1f1a14] mb-6 shadow">
              <span className="text-xs font-bold uppercase tracking-wider text-[#786447] block mb-2 font-serif">
                Veredicto Somático de la Poción
              </span>
              <p className="text-sm leading-relaxed italic font-serif">
                "{character.actingFeedback}"
              </p>
            </div>

            <div className="space-y-3 text-xs text-[#c4b59a] leading-relaxed">
              <p className="flex items-start gap-2">
                <Feather size={14} className="text-[#d4af37] shrink-0 mt-0.5" />
                <span>
                  <strong>La Ley de la Asimilación:</strong> Una poción no se domina con la fuerza de la voluntad bruta; se digiere convirtiendo los principios místicos en tu segunda naturaleza.
                </span>
              </p>
              <p className="flex items-start gap-2">
                <AlertCircle size={14} className="text-[#851c22] shrink-0 mt-0.5" />
                <span>
                  <strong>El Peligro de la Fractura:</strong> Violar reiteradamente el papel despierta la voluntad latente en la característica extraordinaria, precipitando la locura.
                </span>
              </p>
            </div>
          </div>

          <div className="text-[11px] text-[#6e6353] border-t border-[#261e14] pt-3 italic">
            "Recuerda: solo estás actuando."
          </div>
        </div>

        {/* Lado Derecho: La Bitácora de Dilemas y Deslices */}
        <div className="col-span-7 bg-[#15120e] p-6 rounded-lg border border-[#2d2419] flex flex-col">
          <div className="flex items-center gap-2 mb-4 border-b border-[#2d2419] pb-3">
            <BookOpen size={20} className="text-[#d4af37]" />
            <h2 className="font-serif font-bold text-base text-[#e5ded2]" style={{ fontFamily: 'Cinzel' }}>
              Bitácora de Transgresiones y Resoluciones
            </h2>
          </div>

          <div className="space-y-4 flex-1 overflow-y-auto">
            {character.actingDiary.map((entry) => (
              <div 
                key={entry.id}
                className="p-4 bg-[#1b1712] rounded border border-[#33281b]"
              >
                <div className="flex justify-between items-center text-xs text-[#8c733e] font-serif mb-2 border-b border-[#292015] pb-1">
                  <span>Día {entry.day} · Regla: {entry.principle}</span>
                  <span className="text-[#d4af37] font-bold">Elección: {entry.choiceTaken}</span>
                </div>
                <p className="text-sm text-[#e5ded2] leading-relaxed italic font-serif">
                  "{entry.narrativeOutcome}"
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>

      <footer className="text-xs text-[#6e6353] italic text-center border-t border-[#221c14] pt-3">
        La mente del Beyonder es un teatro donde el actor y el monstruo comparten el mismo libreto.
      </footer>

    </div>
  );
};
