/**
 * CAPA DE INSPECCIÓN FOCAL Y TEXTO REFLUIBLE — PATH TO GODHOOD (BRIEF-10.VISUAL-R2)
 * Capa 4 de elevación: Z-Index 40, texto ampliable al 200%, retorno por Escape.
 */

import React, { useEffect, useRef } from 'react';
import type { HotspotContract } from './types';
import { X } from 'lucide-react';

interface InspectionLayerProps {
  hotspot: HotspotContract | null;
  onClose: () => void;
  children?: React.ReactNode;
}

export const InspectionLayer: React.FC<InspectionLayerProps> = ({
  hotspot,
  onClose,
  children
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Captura de Escape para retorno
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    closeButtonRef.current?.focus();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  if (!hotspot) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Inspección de ${hotspot.accessibleName}`}
      className="absolute inset-0 z-40 flex items-center justify-center bg-[#090807]/80 backdrop-blur-sm p-4 sm:p-8"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={containerRef}
        className="relative max-w-2xl w-full max-h-[85vh] overflow-y-auto parchment-sheet p-8 shadow-2xl border-2 border-[#8c733e] text-[#1a1612] flex flex-col gap-6 select-text"
        style={{
          backgroundColor: '#ebdcc4',
          backgroundImage: "radial-gradient(ellipse at 50% 50%, rgba(246, 237, 217, 0.92) 0%, rgba(220, 201, 172, 0.95) 100%), url('/art/GFX30_flat_paper.jpg')",
          backgroundSize: '100% 100%, 160% 160%',
          backgroundPosition: 'center, center',
          backgroundRepeat: 'no-repeat, no-repeat',
          boxShadow: '0 15px 45px rgba(0,0,0,0.9), inset 0 0 30px rgba(140,115,62,0.15)',
          fontSize: '1rem',
          lineHeight: '1.6'
        }}
      >
        {/* Cabecera de la Inspección */}
        <div className="flex items-start justify-between border-b-2 border-[#8c733e]/40 pb-4">
          <div>
            <h2 className="text-xl font-bold font-serif cinzel tracking-wider text-[#1a1612]">
              {hotspot.accessibleName}
            </h2>
            <p className="text-xs italic text-[#5a4834] mt-1">
              {hotspot.restingLabel}
            </p>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Volver al Desván (Escape)"
            className="p-1.5 rounded text-[#3d3120] hover:text-[#851c22] hover:bg-[#dcd0b8] transition-colors lotm-focus-ring"
          >
            <X size={20} />
          </button>
        </div>

        {/* Prosa Diegética o Contenido Específico */}
        <div className="flex flex-col gap-4 font-serif text-base text-[#1a1612]">
          {hotspot.proseMoment && (
            <blockquote className="italic border-l-3 border-[#8c733e] pl-4 py-1 text-[#2d2215] bg-[#e6dac4]/40 rounded-r">
              "{hotspot.proseMoment}"
            </blockquote>
          )}

          {children}
        </div>

        {/* Pie de Retorno */}
        <div className="mt-4 pt-4 border-t border-[#8c733e]/30 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-serif font-bold uppercase tracking-widest text-[#1a1612] border border-[#8c733e] hover:bg-[#8c733e] hover:text-[#ede4d1] transition-colors rounded lotm-focus-ring"
          >
            Volver a la estancia (Esc)
          </button>
        </div>
      </div>
    </div>
  );
};

