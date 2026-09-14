import React, { useState, useRef } from 'react';
import { ArrowLeft, Plus } from 'lucide-react';
import type { ConnectionType } from '../types';

interface PositionedClue {
  id: string;
  code: string;
  title: string;
  description: string;
  source: string;
  x: number;
  y: number;
}

interface ClueConnection {
  id: string;
  fromClueId: string;
  toClueId: string;
  type: ConnectionType;
  notes: string;
}

interface PositionedHypothesis {
  id: string;
  text: string;
  x: number;
  y: number;
}

interface CorkboardViewProps {
  onBackToDesk: () => void;
}

export const CorkboardView: React.FC<CorkboardViewProps> = ({ onBackToDesk }) => {
  // Pistas posicionadas en el espacio del tablero
  const [clues, setClues] = useState<PositionedClue[]>([
    {
      id: 'clue_toys',
      code: 'CLUE_BURNED_TOYS',
      title: 'Juguetes de Pino Quemados',
      description: 'Figuras de madera rescatadas de la chimenea de la mansión Sterling. Nombres de huérfanos tallados.',
      source: 'Chimenea Exterior Mansión',
      x: 120,
      y: 110
    },
    {
      id: 'clue_will',
      code: 'CLUE_WILL_DRAFT',
      title: 'Directivas Notariales de Sterling',
      description: 'Borrador de hace 14 años donde el Dr. Sterling formaliza la amortiguación del dolor infantil.',
      source: 'Despacho Privado de Cherwood',
      x: 520,
      y: 80
    },
    {
      id: 'clue_threads',
      code: 'CLUE_ASTROLOGY_RECORD',
      title: 'Hilos del Cuerpo Espiritual',
      description: 'Filamentos etéreos que enlazan las sienes de los huérfanos con el sótano de la mansión.',
      source: 'Desván Orfanato San Dionisio',
      x: 240,
      y: 340
    },
    {
      id: 'clue_safe',
      code: 'CLUE_CONCEALED_SAFE',
      title: 'Libro de Transferencias Oculto',
      description: 'Registro clínico secreto con detalle milimétrico de memorias felices extraídas y dolor absorbido.',
      source: 'Caja Fuerte tras Retrato',
      x: 640,
      y: 320
    }
  ]);

  // Conexiones de cordel entre pistas
  const [connections] = useState<ClueConnection[]>([
    {
      id: 'conn_1',
      fromClueId: 'clue_toys',
      toClueId: 'clue_threads',
      type: 'LOCALIZA',
      notes: 'Los juguetes calcinados corresponden a los niños cuyos hilos convergen en la mansión.'
    },
    {
      id: 'conn_2',
      fromClueId: 'clue_threads',
      toClueId: 'clue_safe',
      type: 'EXPLICA',
      notes: 'La red etérea explica las transferencias ontológicas anotadas en el libro mayor.'
    },
    {
      id: 'conn_3',
      fromClueId: 'clue_will',
      toClueId: 'clue_safe',
      type: 'ACUSA',
      notes: 'El borrador legal confirma la intención de Sterling documentada en el libro secreto.'
    }
  ]);

  // Hipótesis clavadas sobre el corcho
  const [hypotheses, setHypotheses] = useState<PositionedHypothesis[]>([
    {
      id: 'hypo_1',
      text: 'El Dr. Avery Sterling sostiene el dolor de Cherwood mientras Evangeline extrae recuerdos con el Espejo G3-0711.',
      x: 360,
      y: 520
    }
  ]);

  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [selectedClue, setSelectedClue] = useState<PositionedClue | null>(null);
  const [newHypoText, setNewHypoText] = useState('');

  const boardRef = useRef<HTMLDivElement>(null);

  // Colores canónicos de los 4 tipos de cordeles
  const getConnectionColor = (type: ConnectionType) => {
    switch (type) {
      case 'ACUSA': return '#dc2626';     // Rojo carmesí
      case 'EXPLICA': return '#2563eb';   // Azul añil
      case 'LOCALIZA': return '#16a34a';  // Verde oliva
      case 'CONTRADICE': return '#d97706';// Ámbar ocre
    }
  };

  // Drag & drop nativo de tarjetas en el corcho
  const handleMouseDown = (e: React.MouseEvent, clueId: string, currentX: number, currentY: number) => {
    e.stopPropagation();
    setDraggingId(clueId);
    setDragOffset({
      x: e.clientX - currentX,
      y: e.clientY - currentY
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingId || !boardRef.current) return;
    const rect = boardRef.current.getBoundingClientRect();
    const newX = Math.max(20, Math.min(rect.width - 240, e.clientX - dragOffset.x));
    const newY = Math.max(60, Math.min(rect.height - 180, e.clientY - dragOffset.y));

    setClues(prev => prev.map(c => c.id === draggingId ? { ...c, x: newX, y: newY } : c));
  };

  const handleMouseUp = () => {
    setDraggingId(null);
  };

  const addHypothesis = () => {
    if (!newHypoText.trim()) return;
    const newH: PositionedHypothesis = {
      id: `hypo_${Date.now()}`,
      text: newHypoText.trim(),
      x: 100 + (hypotheses.length * 40) % 400,
      y: 480 + (hypotheses.length * 30) % 150
    };
    setHypotheses([...hypotheses, newH]);
    setNewHypoText('');
  };

  return (
    <div 
      className="min-h-screen p-4 flex flex-col justify-between select-none relative overflow-hidden texture-corkboard"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      ref={boardRef}
    >
      {/* Barra de Control Superior del Tablero */}
      <header className="relative z-30 flex justify-between items-center bg-[#140e0a]/90 border border-[#4a3622] rounded px-4 py-2.5 shadow-xl backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToDesk}
            className="px-3 py-1.5 bg-[#241910] hover:bg-[#382618] text-[#dfcaa2] border border-[#6b4e2f] rounded flex items-center gap-2 text-xs font-serif font-bold transition-all"
          >
            <ArrowLeft size={14} />
            Volver al Desván
          </button>
          <div>
            <h1 className="text-sm font-bold tracking-widest text-[#d4af37] font-serif cinzel">
              EL ECO EN EL NIDO VACÍO · EXPEDIENTE CHERWOOD #1
            </h1>
            <span className="text-[10px] text-[#a89885] italic font-serif">
              Agrupar es pensar · Hilos tensados entre indicios
            </span>
          </div>
        </div>

        {/* Leyenda de Hilos Tipados */}
        <div className="flex items-center gap-4 text-[11px] font-serif">
          <span className="flex items-center gap-1.5 text-[#f87171]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#dc2626] inline-block shadow-sm" /> ACUSA
          </span>
          <span className="flex items-center gap-1.5 text-[#60a5fa]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2563eb] inline-block shadow-sm" /> EXPLICA
          </span>
          <span className="flex items-center gap-1.5 text-[#4ade80]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#16a34a] inline-block shadow-sm" /> LOCALIZA
          </span>
          <span className="flex items-center gap-1.5 text-[#fbbf24]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#d97706] inline-block shadow-sm" /> CONTRADICE
          </span>
        </div>
      </header>

      {/* SVG de Fondo: Hilos Curvos de Bézier Tensados entre Tarjetas */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
        <defs>
          <filter id="stringShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="1" dy="3" stdDeviation="2" floodColor="#000000" floodOpacity="0.8" />
          </filter>
        </defs>
        {connections.map(conn => {
          const from = clues.find(c => c.id === conn.fromClueId);
          const to = clues.find(c => c.id === conn.toClueId);
          if (!from || !to) return null;

          // Punto de anclaje: la chinche en la parte superior central de cada tarjeta (ancho 220, chinche en x+110, y+10)
          const x1 = from.x + 110;
          const y1 = from.y + 10;
          const x2 = to.x + 110;
          const y2 = to.y + 10;

          // Curva de catenaria / Bézier con caída por gravedad
          const dx = x2 - x1;
          const dy = y2 - y1;
          const cx1 = x1 + dx * 0.25;
          const cy1 = y1 + dy * 0.25 + 25; // caída del cordel
          const cx2 = x1 + dx * 0.75;
          const cy2 = y1 + dy * 0.75 + 25;

          const strokeColor = getConnectionColor(conn.type);

          return (
            <g key={conn.id}>
              {/* Sombra del cordel sobre el corcho */}
              <path
                d={`M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`}
                fill="none"
                stroke="rgba(0, 0, 0, 0.65)"
                strokeWidth="3.5"
                filter="url(#stringShadow)"
              />
              {/* Cordel de lana tipado */}
              <path
                d={`M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`}
                fill="none"
                stroke={strokeColor}
                strokeWidth="2.2"
                strokeDasharray="4,1"
              />
            </g>
          );
        })}
      </svg>

      {/* Tarjetas de Pistas Espaciales (Arrastrables) */}
      <div className="relative w-full h-[78vh] z-20">
        {clues.map(clue => (
          <div
            key={clue.id}
            style={{ left: `${clue.x}px`, top: `${clue.y}px` }}
            className={`absolute w-56 p-3 bg-[#ede4d1] text-[#1a1612] rounded shadow-2xl border border-[#baa688] cursor-grab active:cursor-grabbing font-serif select-none transition-shadow ${
              draggingId === clue.id ? 'scale-105 shadow-2xl z-30' : 'hover:scale-[1.02]'
            }`}
            onMouseDown={(e) => handleMouseDown(e, clue.id, clue.x, clue.y)}
            onClick={() => setSelectedClue(clue)}
          >
            {/* Chinche de Latón en la Cabecera */}
            <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-gradient-to-tr from-[#785923] via-[#d4af37] to-[#fae596] border border-[#4a3615] shadow-md flex items-center justify-center pointer-events-none">
              <div className="w-1.5 h-1.5 rounded-full bg-[#3d2a0d]" />
            </div>

            <div className="text-[9px] uppercase tracking-widest text-[#73583c] font-bold mt-1 border-b border-[#c4b195] pb-0.5">
              {clue.source}
            </div>

            <h3 className="text-xs font-bold text-[#2b2014] mt-1.5 leading-snug">
              {clue.title}
            </h3>

            <p className="text-[11px] text-[#423425] italic mt-1 leading-relaxed line-clamp-3">
              "{clue.description}"
            </p>
          </div>
        ))}

        {/* Tiras de Hipótesis Manuscritas Ancladas con Chinches Rojas */}
        {hypotheses.map(hypo => (
          <div
            key={hypo.id}
            style={{ left: `${hypo.x}px`, top: `${hypo.y}px` }}
            className="absolute max-w-sm p-3 bg-[#fbf3d6] text-[#292218] rounded-sm shadow-xl border-t-2 border-[#b89f6c] font-serif text-xs italic leading-relaxed transform rotate-1"
          >
            {/* Chinche carmesí */}
            <div className="absolute -top-2 left-4 w-4 h-4 rounded-full bg-gradient-to-tr from-[#661015] via-[#b52b34] to-[#f87171] border border-[#3d090d] shadow-sm flex items-center justify-center">
              <div className="w-1 h-1 rounded-full bg-[#1a0406]" />
            </div>
            <p className="pt-1">
              "{hypo.text}"
            </p>
          </div>
        ))}
      </div>

      {/* Barra Inferior: Redacción de Nueva Hipótesis */}
      <footer className="relative z-30 flex gap-2 items-center bg-[#140e0a]/90 border border-[#4a3622] rounded p-2 shadow-xl backdrop-blur-sm">
        <input
          type="text"
          value={newHypoText}
          onChange={(e) => setNewHypoText(e.target.value)}
          placeholder="Clavar nueva hipótesis manuscrita sobre el tablero..."
          className="flex-1 bg-[#21160e] text-[#e5ded2] text-xs font-serif px-3 py-1.5 rounded border border-[#523d29] focus:outline-none focus:border-[#d4af37]"
          onKeyDown={(e) => e.key === 'Enter' && addHypothesis()}
        />
        <button
          onClick={addHypothesis}
          className="px-3 py-1.5 bg-[#851c22] hover:bg-[#aa242c] text-white rounded text-xs font-serif font-bold flex items-center gap-1 transition-colors border border-[#d4af37]"
        >
          <Plus size={14} />
          Clavar Hipótesis
        </button>
      </footer>

      {/* Modal de Detalle de Pista al Clic */}
      {selectedClue && (
        <div 
          className="fixed inset-0 bg-black/75 flex items-center justify-center p-6 z-50 animate-fadeIn"
          onClick={() => setSelectedClue(null)}
        >
          <div 
            className="w-full max-w-md bg-[#ede4d1] text-[#1a1612] rounded p-6 shadow-2xl border-2 border-[#8c7038] font-serif relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setSelectedClue(null)}
              className="absolute top-3 right-4 text-[#5c4a35] hover:text-[#1a1612] font-bold text-lg"
            >
              ✕
            </button>
            <span className="text-[10px] uppercase tracking-widest text-[#7a6042] font-bold">
              {selectedClue.code} · {selectedClue.source}
            </span>
            <h2 className="text-lg font-bold text-[#2e2012] cinzel mt-1 mb-2">
              {selectedClue.title}
            </h2>
            <p className="text-xs text-[#3b2d1e] italic leading-relaxed border-t border-[#c2b095] pt-3">
              "{selectedClue.description}"
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
