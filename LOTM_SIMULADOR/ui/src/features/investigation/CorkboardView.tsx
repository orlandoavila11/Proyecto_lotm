import React, { useState } from 'react';
import { Pin, ArrowLeft, Link2, FileQuestion, Archive } from 'lucide-react';
import type { InvestigationCase, ClueItem, ConnectionType } from '../types';

interface CorkboardViewProps {
  onBackToDesk: () => void;
}

// Datos de ejemplo para el caso fundacional de Cherwood
const INITIAL_CASE: InvestigationCase = {
  id: 'case_cherwood_tutorial',
  title: 'El Enigma del Sello Ocular y la Sombra de Cherwood',
  district: 'Cherwood',
  status: 'ABIERTO',
  clues: [
    {
      id: 'clue_1',
      code: 'CLUE_BENEFACTOR_SEAL',
      title: 'Lacre Escarlata con Sello de Ojo Vertical',
      description: 'El reverso de la carta del Benefactor exhibe una marca de cera con una pupila reptiliana y tres líneas radiantes.',
      source: 'Carta en Vitela del Desván',
      discoveredDay: 1
    },
    {
      id: 'clue_2',
      code: 'CLUE_CHERWOOD_FOOTSTEPS',
      title: 'Pisadas de Fango Pesado en Minsk Street',
      description: 'Huellas de botas de caña alta con barro arcilloso característico de las obras de alcantarillado subterráneo.',
      source: 'Zaguán del Inmueble',
      discoveredDay: 2
    },
    {
      id: 'clue_3',
      code: 'CLUE_OLD_HERB_RECEIPT',
      title: 'Recibo de Raíz de Loto Lunar',
      description: 'Una nota arrugada de un boticario del Callejón del Gato Negro fechada dos noches antes de la carta.',
      source: 'Cofre de Caoba',
      discoveredDay: 2
    }
  ],
  connections: [
    {
      id: 'conn_1',
      fromClueId: 'clue_1',
      toClueId: 'clue_3',
      type: 'EXPLICA',
      notes: 'La adquisición del estabilizador explica la pureza del preparado en el desván.'
    },
    {
      id: 'conn_2',
      fromClueId: 'clue_2',
      toClueId: 'clue_1',
      type: 'LOCALIZA',
      notes: 'Las pisadas indican que el mensajero llegó desde las cloacas de Cherwood.'
    }
  ],
  hypotheses: [
    'El Benefactor opera en los canales subterráneos de Cherwood evitando los puestos de control de los Halcones Nocturnos.',
    'El mensajero fue contratado a través de un intermediario en el mercado negro de la Cruz de Hierro.'
  ],
  closedSources: [
    {
      sourceName: 'Archivos Parroquiales de San Samuel',
      reason: 'El celador diocesano negó el acceso tras la orden de requisa eclesiástica.'
    }
  ]
};

export const CorkboardView: React.FC<CorkboardViewProps> = ({ onBackToDesk }) => {
  const [activeCase, setActiveCase] = useState<InvestigationCase>(INITIAL_CASE);
  const [selectedClue, setSelectedClue] = useState<ClueItem | null>(null);
  const [newHypothesisText, setNewHypothesisText] = useState<string>('');
  
  // Colores de los cordeles tipados
  const getConnectionColor = (type: ConnectionType) => {
    switch (type) {
      case 'ACUSA': return '#dc2626'; // Rojo escarlata
      case 'EXPLICA': return '#2563eb'; // Azul añil
      case 'LOCALIZA': return '#16a34a'; // Verde oliva
      case 'CONTRADICE': return '#ca8a04'; // Amarillo ocre
    }
  };

  const handleAddHypothesis = () => {
    if (!newHypothesisText.trim()) return;
    setActiveCase({
      ...activeCase,
      hypotheses: [...activeCase.hypotheses, newHypothesisText.trim()]
    });
    setNewHypothesisText('');
  };

  return (
    <div className="corkboard-screen min-h-screen p-6 flex flex-col justify-between select-none" style={{ background: '#261b11' }}>
      
      {/* Cabecera del Corcho */}
      <header className="flex justify-between items-center pb-4 border-b border-[#3d2b1c] mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onBackToDesk}
            className="p-2 bg-[#17120c] border border-[#4a3623] hover:border-[#8c733e] text-[#d4af37] rounded flex items-center gap-2 text-sm font-serif transition-all"
          >
            <ArrowLeft size={16} />
            Regresar a la Mesa
          </button>
          <div>
            <h1 className="text-xl font-bold tracking-widest text-[#f5ebd7]" style={{ fontFamily: 'Cinzel' }}>
              TABLERO DE INVESTIGACIÓN: {activeCase.title.toUpperCase()}
            </h1>
            <p className="text-xs text-[#b8a68d] italic">
              Distrito de {activeCase.district} · Estado: {activeCase.status}
            </p>
          </div>
        </div>

        {/* Leyenda de Hilos Tipados */}
        <div className="flex items-center gap-3 text-xs bg-[#17120c] px-4 py-2 rounded border border-[#3d2b1c]">
          <span className="text-[#8c733e] font-serif font-bold">Cordeles:</span>
          <span className="flex items-center gap-1 text-[#ef4444]"><span className="w-3 h-0.5 bg-[#dc2626]"></span> Acusa</span>
          <span className="flex items-center gap-1 text-[#3b82f6]"><span className="w-3 h-0.5 bg-[#2563eb]"></span> Explica</span>
          <span className="flex items-center gap-1 text-[#22c55e]"><span className="w-3 h-0.5 bg-[#16a34a]"></span> Localiza</span>
          <span className="flex items-center gap-1 text-[#eab308]"><span className="w-3 h-0.5 bg-[#ca8a04]"></span> Contradice</span>
        </div>
      </header>

      {/* Superficie del Tablero de Corcho */}
      <div className="grid grid-cols-12 gap-6 flex-1 mb-6">
        
        {/* Zona de Tarjetas de Pistas Clavadas */}
        <div className="col-span-8 bg-[#1f160e] p-6 rounded-lg border border-[#382617] shadow-inner relative overflow-y-auto">
          <h2 className="text-sm font-serif font-bold text-[#d4af37] uppercase tracking-wider mb-4 flex items-center gap-2">
            <Pin size={16} className="text-[#dc2626]" />
            Pistas Descubiertas y Fichas Testimoniales
          </h2>

          <div className="grid grid-cols-2 gap-4 mb-6">
            {activeCase.clues.map((clue) => {
              const isSelected = selectedClue?.id === clue.id;
              return (
                <div
                  key={clue.id}
                  onClick={() => setSelectedClue(clue)}
                  className={`parchment-sheet p-4 rounded shadow cursor-pointer transition-all relative transform hover:-translate-y-0.5 ${
                    isSelected ? 'ring-2 ring-[#8c733e]' : ''
                  }`}
                >
                  <div className="absolute top-2 right-2 text-[#b91c1c]">
                    <Pin size={14} />
                  </div>
                  <h3 className="font-serif font-bold text-sm text-[#1f1a14] mb-1" style={{ fontFamily: 'Cinzel' }}>
                    {clue.title}
                  </h3>
                  <p className="text-xs text-[#2b2216] leading-relaxed mb-3">
                    "{clue.description}"
                  </p>
                  <div className="border-t border-[#bfae91] pt-2 text-[11px] text-[#6b583f] flex justify-between">
                    <span>Origen: {clue.source}</span>
                    <span>Día {clue.discoveredDay}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Conexiones de Hilos Tipados */}
          <div className="mt-6 border-t border-[#382617] pt-4">
            <h3 className="text-xs font-serif font-bold text-[#b8a68d] uppercase mb-3 flex items-center gap-2">
              <Link2 size={14} />
              Vínculos entre Evidencias
            </h3>
            <div className="space-y-2">
              {activeCase.connections.map((conn) => (
                <div 
                  key={conn.id}
                  className="p-3 bg-[#17110a] rounded border border-[#2e2013] text-xs text-[#e5ded2] flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span 
                      className="px-2 py-0.5 rounded font-bold text-[10px] text-white" 
                      style={{ background: getConnectionColor(conn.type) }}
                    >
                      {conn.type}
                    </span>
                    <span className="italic">{conn.notes}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Zona Lateral: Hipótesis de Deducción y Fuentes Cerradas */}
        <div className="col-span-4 flex flex-col gap-4">
          
          {/* Fichas de Hipótesis */}
          <div className="bg-[#1f160e] p-5 rounded-lg border border-[#382617] flex-1 flex flex-col">
            <h3 className="text-sm font-serif font-bold text-[#d4af37] uppercase tracking-wider mb-3 flex items-center gap-2">
              <FileQuestion size={16} />
              Líneas de Deducción
            </h3>
            
            <div className="space-y-3 flex-1 overflow-y-auto mb-4">
              {activeCase.hypotheses.map((hypo, idx) => (
                <div 
                  key={idx}
                  className="p-3 bg-[#150f09] border border-[#2e2013] rounded text-xs text-[#c4b59a] italic leading-relaxed"
                >
                  "{hypo}"
                </div>
              ))}
            </div>

            <div className="border-t border-[#382617] pt-3 flex gap-2">
              <input
                type="text"
                placeholder="Formular nueva hipótesis..."
                value={newHypothesisText}
                onChange={(e) => setNewHypothesisText(e.target.value)}
                className="flex-1 bg-[#150f09] border border-[#2e2013] px-3 py-1.5 text-xs text-[#e5ded2] rounded focus:outline-none focus:border-[#8c733e]"
              />
              <button
                onClick={handleAddHypothesis}
                className="px-3 py-1.5 bg-[#2a1b11] text-[#d4af37] border border-[#4a3623] hover:border-[#8c733e] rounded text-xs font-bold"
              >
                Clavar
              </button>
            </div>
          </div>

          {/* Fuentes Cerradas con Motivo en Prosa */}
          <div className="bg-[#1f160e] p-5 rounded-lg border border-[#382617]">
            <h3 className="text-sm font-serif font-bold text-[#968c7e] uppercase tracking-wider mb-2 flex items-center gap-2">
              <Archive size={16} />
              Vías Cerradas y Silenciadas
            </h3>
            <div className="space-y-2">
              {activeCase.closedSources.map((closed, idx) => (
                <div key={idx} className="p-3 bg-[#17110a] rounded border border-[#2a1c11]">
                  <span className="font-serif font-bold text-xs text-[#b8a68d] block mb-1">
                    {closed.sourceName}
                  </span>
                  <p className="text-xs text-[#786a59] italic">
                    "{closed.reason}"
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      <footer className="text-xs text-[#6b583f] italic text-center border-t border-[#3d2b1c] pt-3">
        Cada hilo de lana tensado acorrala al culpable o delata tu indagación a los Halcones Nocturnos.
      </footer>

    </div>
  );
};
