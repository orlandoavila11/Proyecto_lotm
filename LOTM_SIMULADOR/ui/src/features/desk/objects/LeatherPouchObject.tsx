import React, { useState } from 'react';

interface LeatherPouchObjectProps {
  walletText: string;
}

export const LeatherPouchObject: React.FC<LeatherPouchObjectProps> = ({ walletText }) => {
  const [inspecting, setInspecting] = useState(false);

  return (
    <div className="relative">
      {/* Saquito de Cuero con Monedas */}
      <div 
        className="leather-pouch-body hover:scale-105 transition-all select-none group"
        onClick={() => setInspecting(prev => !prev)}
        title="Monedero civil de chelines y peniques"
      >
        {/* Monedas visibles que asoman en interacción */}
        <div className="flex items-center gap-1 my-auto opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#7a7469] via-[#c7c2b5] to-[#f0ece1] border border-[#423e37] shadow-md flex items-center justify-center text-[8px] font-serif font-bold text-[#2e2b26]">
            s
          </div>
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#8f6d2b] via-[#d4af37] to-[#fae596] border border-[#523d14] shadow-md flex items-center justify-center text-[9px] font-serif font-bold text-[#382b0e] -ml-2 z-10">
            £
          </div>
        </div>

        {/* Base del saquito */}
        <div className="text-[10px] font-serif text-[#d4af37] font-bold tracking-wider pb-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          Fondo Civil
        </div>
      </div>

      {/* Detalle al hacer clic */}
      {inspecting && (
        <div 
          className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 bg-[#17130f] border border-[#a68444] rounded p-2.5 shadow-2xl z-30 pointer-events-auto animate-fadeIn"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-1 pb-0.5 border-b border-[#382b18]">
            <span className="text-[11px] font-serif font-bold text-[#d4af37]">CAJA CIVIL</span>
            <button 
              onClick={() => setInspecting(false)}
              className="text-[#968c7e] hover:text-[#e5ded2] text-xs"
            >
              ✕
            </button>
          </div>
          <p className="text-xs text-[#ded5c5] font-serif font-semibold">
            {walletText}
          </p>
        </div>
      )}
    </div>
  );
};
