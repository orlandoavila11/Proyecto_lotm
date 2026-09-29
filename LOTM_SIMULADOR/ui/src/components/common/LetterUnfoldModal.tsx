import React, { useState, useEffect } from 'react';
import { X, Sparkles, Eye, ArrowRight } from 'lucide-react';

export interface LetterUnfoldModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  senderName?: string;
  recipientName?: string;
  paragraphs: string[];
  postscript?: string;
  onAcknowledge?: () => void;
  actionButtonText?: string;
  initialState?: 'SEALED' | 'OPEN';
  waxSealDescription?: string;
}

export const LetterUnfoldModal: React.FC<LetterUnfoldModalProps> = ({
  isOpen,
  onClose,
  title,
  senderName,
  recipientName,
  paragraphs,
  postscript,
  onAcknowledge,
  actionButtonText = 'Guardar la Carta',
  initialState = 'SEALED',
  waxSealDescription = 'Sello de lacre carmesí intacto'
}) => {
  const [phase, setPhase] = useState<'SEALED' | 'BREAKING' | 'UNFOLDING' | 'OPEN'>(initialState);

  useEffect(() => {
    if (isOpen) {
      setPhase(initialState);
    }
  }, [isOpen, initialState]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBreakSeal = () => {
    setPhase('BREAKING');
    setTimeout(() => {
      setPhase('UNFOLDING');
      setTimeout(() => {
        setPhase('OPEN');
      }, 500);
    }, 450);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none"
      role="dialog"
      aria-modal="true"
      aria-labelledby="letter-modal-title"
      style={{ backgroundColor: 'rgba(5, 4, 3, 0.88)' }}
    >
      {/* Fondo con desenfoque suave */}
      <div 
        className="absolute inset-0 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 max-w-2xl w-full flex flex-col items-center">
        
        {/* ==========================================================================
            ESTADO 1: SOBRE SELLADO (GFX20 + GFX31 Lacre Rojo)
            ========================================================================== */}
        {(phase === 'SEALED' || phase === 'BREAKING') && (
          <div 
            className={`relative w-full max-w-md p-6 rounded-md shadow-2xl transition-all duration-500 text-center ${
              phase === 'BREAKING' ? 'scale-95 opacity-80' : 'scale-100 opacity-100'
            }`}
            style={{
              background: 'linear-gradient(145deg, #2b2015 0%, #17110a 100%)',
              border: '2px solid #5c472d',
              boxShadow: '0 20px 50px rgba(0,0,0,0.9), inset 0 0 30px rgba(0,0,0,0.6)'
            }}
          >
            <div className="text-center mb-6">
              <span className="text-[11px] text-[#a89880] uppercase tracking-widest font-serif">
                Correspondencia Sellada
              </span>
              <h2 id="letter-modal-title" className="text-lg font-bold text-[#d4af37] mt-1" style={{ fontFamily: 'Cinzel' }}>
                {title}
              </h2>
            </div>

            {/* Representación física del sobre cerrado con GFX20 / Textura */}
            <div 
              className="relative w-72 h-44 mx-auto rounded border border-[#6b5336] shadow-lg flex items-center justify-center overflow-hidden mb-6 cursor-pointer group"
              style={{
                background: 'linear-gradient(135deg, #ede1cc 0%, #d8c8ab 50%, #c4b08e 100%)',
                boxShadow: 'inset 0 0 20px rgba(0,0,0,0.25), 0 8px 25px rgba(0,0,0,0.7)'
              }}
              onClick={handleBreakSeal}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleBreakSeal();
                }
              }}
              role="button"
              aria-label="Romper sello de lacre y abrir la carta"
            >
              {/* Pliegues diagonales del sobre */}
              <div 
                className="absolute inset-0 pointer-events-none opacity-40"
                style={{
                  background: 'linear-gradient(45deg, transparent 48%, #8f7959 50%, transparent 52%), linear-gradient(-45deg, transparent 48%, #8f7959 50%, transparent 52%)'
                }}
              />

              {/* Sello de Lacre Carmesí (GFX31) */}
              <div 
                className={`relative z-10 w-16 h-16 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${
                  phase === 'BREAKING' ? 'animate-ping' : ''
                }`}
                style={{
                  background: 'radial-gradient(circle at 35% 35%, #b52b34, #590f14)',
                  border: '2px solid #851c22',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.7), inset -2px -2px 6px rgba(0,0,0,0.6)'
                }}
              >
                <img 
                  src="/art/GFX31_wax_seal.jpg" 
                  alt="Sello de Lacre"
                  className="w-12 h-12 rounded-full object-cover opacity-95 filter drop-shadow"
                  onError={(e) => {
                    // Fallback visual SVG si la imagen tarda en cargar
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <Sparkles size={16} className="text-[#ffd700] absolute opacity-70 group-hover:opacity-100" />
              </div>

              {/* Texto de indicación sobre el sobre */}
              <div className="absolute bottom-2 text-[10px] text-[#594731] font-serif italic">
                {recipientName ? `A la atención de: ${recipientName}` : 'Confidencial'}
              </div>
            </div>

            <p className="text-xs text-[#a39480] italic mb-6">
              {waxSealDescription}
            </p>

            <div className="flex justify-center gap-3">
              <button
                onClick={handleBreakSeal}
                className="crimson-btn px-6 py-2.5 text-xs uppercase tracking-widest font-bold flex items-center gap-2"
                autoFocus
              >
                <Eye size={14} />
                Romper el Sello y Leer
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 border border-[#4a3b29] text-[#9c8e7b] hover:text-[#e5ded2] rounded text-xs font-serif transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}

        {/* ==========================================================================
            ESTADO 2 & 3: DESPLIEGUE Y PAPEL ABIERTO (GFX30 Pergamino Desplegado)
            ========================================================================== */}
        {(phase === 'UNFOLDING' || phase === 'OPEN') && (
          <div 
            className={`relative w-full parchment-sheet p-8 rounded shadow-2xl transition-all duration-500 max-h-[85vh] overflow-y-auto ${
              phase === 'UNFOLDING' ? 'scale-95 opacity-50' : 'scale-100 opacity-100 animate-fadeIn'
            }`}
            style={{
              backgroundImage: 'url(/art/GFX30_flat_paper.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundColor: '#ede4d1',
              color: '#1a1612',
              boxShadow: '0 25px 60px rgba(0,0,0,0.9), inset 0 0 30px rgba(160, 135, 95, 0.25)',
              border: '2px solid #bfae91'
            }}
          >
            {/* Botón de Cierre Superior */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-full text-[#6b583f] hover:text-[#1a1612] hover:bg-[#decfae]/50 transition-colors"
              aria-label="Cerrar carta"
            >
              <X size={18} />
            </button>

            {/* Cabecera de la Carta */}
            <div className="border-b border-[#c4b59a] pb-4 mb-6 text-center">
              <span className="text-[10px] text-[#736553] uppercase tracking-widest font-serif font-bold">
                Correspondencia Reservada
              </span>
              <h2 className="text-xl font-bold text-[#1f1a14] mt-1" style={{ fontFamily: 'Cinzel' }}>
                {title}
              </h2>
              {senderName && (
                <p className="text-xs text-[#5c4a35] italic mt-0.5">
                  De: {senderName}
                </p>
              )}
            </div>

            {/* Destinatario */}
            {recipientName && (
              <p className="text-sm font-serif font-bold text-[#1f1a14] mb-4">
                Estimado {recipientName},
              </p>
            )}

            {/* Prosa Canónica en Prosa Diegética Viva */}
            <div className="text-sm leading-relaxed font-serif space-y-4 text-[#1a1612] text-justify italic mb-6">
              {paragraphs.map((para, idx) => (
                <p key={idx}>{para}</p>
              ))}
            </div>

            {/* Posdata / Notas al pie */}
            {postscript && (
              <div className="border-t border-[#c4b59a] pt-3 mb-6 text-xs text-[#54432f] font-serif italic">
                <strong>P.D.:</strong> {postscript}
              </div>
            )}

            {/* Pie de Carta con Acciones */}
            <div className="border-t border-[#c4b59a] pt-4 flex justify-between items-center">
              <span className="text-[11px] text-[#786a58] italic font-serif">
                El rastro de tinta ferrogálica ha reposado sobre el pergamino.
              </span>

              <div className="flex gap-2">
                {onAcknowledge && (
                  <button
                    onClick={onAcknowledge}
                    className="crimson-btn px-5 py-2 text-xs uppercase tracking-wider font-bold flex items-center gap-1.5"
                  >
                    <span>{actionButtonText}</span>
                    <ArrowRight size={14} />
                  </button>
                )}
                {!onAcknowledge && (
                  <button
                    onClick={onClose}
                    className="px-5 py-2 bg-[#d6c7ab] hover:bg-[#c9b899] text-[#1f1a14] border border-[#a8987b] rounded text-xs font-serif font-bold transition-colors"
                  >
                    Doblar y Guardar
                  </button>
                )}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

