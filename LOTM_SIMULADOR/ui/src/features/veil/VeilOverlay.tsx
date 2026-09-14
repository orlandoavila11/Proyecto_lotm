import React, { useState, useEffect } from 'react';
import { EyeOff, AlertCircle, Sparkles } from 'lucide-react';

interface VeilOverlayProps {
  active: boolean;
  onClose: () => void;
}

const MUTATING_SIGNS = [
  'Hilos plateados translúcidos descienden de las vigas del techo, atados a las sombras de los transeúntes.',
  'Un ojo de dragón vertical parpadea lentamente entre la niebla sucia de carbón tras la ventana.',
  'El halo carmesí de la luna vibra como una membrana viva sobre los tejados de Backlund.',
  'Símbolos en Hermes antiguo brillan tenuemente en el marco del espejo y luego se disuelven en ceniza.',
  'Una silueta encapuchada con ropas de la Cuarta Época te observa desde el rincón más oscuro y se desvanece al parpadear.'
];

export const VeilOverlay: React.FC<VeilOverlayProps> = ({ active, onClose }) => {
  const [currentSignIndex, setCurrentSignIndex] = useState<number>(0);

  useEffect(() => {
    if (!active) return;
    const timer = setInterval(() => {
      setCurrentSignIndex(prev => (prev + 1) % MUTATING_SIGNS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [active]);

  if (!active) return null;

  return (
    <div 
      className="fixed inset-0 pointer-events-none z-50 flex flex-col justify-between p-6 select-none"
      style={{
        background: 'radial-gradient(circle at 50% 50%, rgba(43, 16, 64, 0.45) 0%, rgba(9, 8, 7, 0.88) 100%)',
        backdropFilter: 'blur(1.5px)',
        boxShadow: 'inset 0 0 100px rgba(168, 85, 247, 0.35)'
      }}
    >
      {/* Indicador Superior del Velo */}
      <div className="flex justify-between items-center pointer-events-auto">
        <div className="flex items-center gap-2 bg-[#201033] border border-[#a855f7] px-4 py-2 rounded shadow-[0_0_15px_rgba(168,85,247,0.4)]">
          <Sparkles size={16} className="text-[#c084fc] animate-spin" />
          <span className="font-serif font-bold text-xs tracking-widest text-[#e9d5ff]" style={{ fontFamily: 'Cinzel' }}>
            VISIÓN ESPIRITUAL ACTIVA · EL VELO ASTRAL
          </span>
        </div>

        <button
          onClick={onClose}
          className="px-3 py-1.5 bg-[#170e24] border border-[#a855f7] text-[#e9d5ff] hover:bg-[#2b1647] rounded text-xs font-serif flex items-center gap-2 transition-all shadow"
        >
          <EyeOff size={14} />
          Cerrar el Tercer Ojo
        </button>
      </div>

      {/* Signo Mutante Revelado en el Centro */}
      <div className="max-w-xl mx-auto text-center pointer-events-auto">
        <div className="parchment-sheet p-5 rounded shadow-2xl border border-[#a855f7]/50 bg-[#1e132e] text-[#f3e8ff]">
          <span className="text-[11px] font-serif font-bold text-[#c084fc] uppercase tracking-wider block mb-2">
            Perturbación Percibida en el Mundo Espiritual
          </span>
          <p className="text-sm italic font-serif leading-relaxed text-[#fae8ff]">
            "{MUTATING_SIGNS[currentSignIndex]}"
          </p>
        </div>
      </div>

      {/* Advertencia de Coste en Prosa Diegética */}
      <div className="text-center pointer-events-auto">
        <span className="inline-flex items-center gap-1.5 text-xs text-[#d8b4fe] bg-[#1a0f2b]/90 border border-[#7e22ce]/40 px-4 py-1.5 rounded italic">
          <AlertCircle size={13} className="text-[#c084fc]" />
          Sostener la mirada astral fatiga el pulso y atrae la atención de las entidades que habitan la niebla.
        </span>
      </div>
    </div>
  );
};
