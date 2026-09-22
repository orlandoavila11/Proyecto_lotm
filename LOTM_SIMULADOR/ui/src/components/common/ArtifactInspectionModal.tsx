/**
 * GFX66 — INSPECCIÓN DIEGÉTICA DE ARTEFACTO SELLADO (GFX60)
 * Muestra objetos canónicos de inventario aislados con su trasfondo místico y efectos negativos.
 * Prohibido números o stats ("+15 daño", "Grado 3"); se usan descripciones somáticas puras.
 */

import React, { useEffect } from 'react';
import { X, ShieldAlert, Sparkles, HelpCircle } from 'lucide-react';
import { VictorianIconReturn } from './VictorianIcons';

export interface SealedArtifactData {
  id: string;
  name: string;
  gradeTitle: string; // ej: "Artefacto Sellado de Grado Tres"
  appearance: string;
  mysticalEffects: string[];
  negativeEffects: string[];
  safeUsageNotes: string;
  imageUrl?: string;
  isIdentified: boolean;
}

interface ArtifactInspectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  artifact: SealedArtifactData;
}

export const ArtifactInspectionModal: React.FC<ArtifactInspectionModalProps> = ({
  isOpen,
  onClose,
  artifact
}) => {
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

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none"
      role="dialog"
      aria-modal="true"
      aria-labelledby="artifact-modal-title"
      style={{ backgroundColor: 'rgba(5, 4, 3, 0.88)' }}
    >
      <div 
        className="absolute inset-0 backdrop-blur-sm"
        onClick={onClose}
      />

      <div 
        className="relative z-10 max-w-2xl w-full p-6 rounded-md shadow-2xl border-2 border-[#8c733e] animate-fadeIn max-h-[90vh] overflow-y-auto"
        style={{
          background: 'linear-gradient(145deg, #1c150f 0%, #100c08 100%)',
          color: '#ede4d1',
          boxShadow: '0 20px 60px rgba(0,0,0,0.95), inset 0 0 30px rgba(0,0,0,0.7)'
        }}
      >
        {/* Botón de Cierre Superior */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-[#9c8e7b] hover:text-[#ffd700] hover:bg-[#382b1c] transition-colors"
          aria-label="Cerrar inspección de artefacto"
        >
          <X size={18} />
        </button>

        {/* Cabecera */}
        <div className="border-b border-[#3b2d1d] pb-3 mb-5 text-center">
          <span className="text-[10px] text-[#d4af37] uppercase tracking-widest font-serif font-bold">
            {artifact.gradeTitle}
          </span>
          <h2 id="artifact-modal-title" className="text-xl font-bold text-[#ffd700] mt-1" style={{ fontFamily: 'Cinzel' }}>
            {artifact.name}
          </h2>
        </div>

        {/* Vista del Objeto Físico (GFX60) */}
        <div className="flex flex-col md:flex-row gap-5 items-center mb-6">
          <div className="w-48 h-48 rounded border border-[#523e25] bg-[#0d0a08] shadow-inner flex items-center justify-center p-3 relative shrink-0">
            {artifact.imageUrl ? (
              <img 
                src={artifact.imageUrl} 
                alt={artifact.name}
                className="w-full h-full object-contain filter drop-shadow-lg hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="text-center text-[#8c733e] p-2">
                <HelpCircle size={32} className="mx-auto mb-1 opacity-50" />
                <span className="text-[11px] font-serif italic">Forma velada a la percepción</span>
              </div>
            )}
          </div>

          <div className="flex-1 font-serif">
            <h4 className="text-xs font-bold text-[#d4af37] uppercase tracking-wider mb-1">
              Descripción Física
            </h4>
            <p className="text-xs text-[#c4b59e] leading-relaxed italic bg-[#17110c] p-3 rounded border border-[#2b2014]">
              {artifact.appearance}
            </p>
          </div>
        </div>

        {/* Efectos Místicos vs Efectos Negativos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5 font-serif">
          
          {/* Poderes Extraordinarios */}
          <div className="p-3 bg-[#131c15] border border-[#225227] rounded">
            <div className="flex items-center gap-1.5 text-[#4ade80] text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles size={13} />
              <span>Poderes Manifestados</span>
            </div>
            <div className="space-y-1 text-[11px] text-[#c0e0c5] leading-relaxed">
              {artifact.mysticalEffects.map((eff, i) => (
                <div key={i} className="flex items-start gap-1">
                  <span className="text-[#4ade80]">•</span>
                  <span>{eff}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Repercusiones / Efectos Negativos */}
          <div className="p-3 bg-[#241212] border border-[#7f1d1d] rounded">
            <div className="flex items-center gap-1.5 text-[#f87171] text-xs font-bold uppercase tracking-wider mb-2">
              <ShieldAlert size={13} />
              <span>Contención y Peligro</span>
            </div>
            <div className="space-y-1 text-[11px] text-[#fca5a5] leading-relaxed">
              {artifact.negativeEffects.map((neg, i) => (
                <div key={i} className="flex items-start gap-1">
                  <span className="text-[#f87171]">•</span>
                  <span>{neg}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Nota de Almacenamiento Seguro */}
        <div className="p-2.5 bg-[#17130e] border border-[#3b2d1d] rounded text-xs text-[#a39480] font-serif italic mb-4">
          <strong>Protocolo de Sellado:</strong> {artifact.safeUsageNotes}
        </div>

        {/* Pie con Acciones */}
        <div className="border-t border-[#3b2d1d] pt-3 flex justify-between items-center">
          <span className="text-[11px] text-[#8c7b66] italic font-serif">
            Inspección autorizada bajo el Velo Ocultista.
          </span>
          <button
            onClick={onClose}
            className="crimson-btn px-5 py-1.5 text-xs font-bold uppercase tracking-wider flex items-center gap-1"
          >
            <VictorianIconReturn size={14} />
            <span>Guardar en el Cofre</span>
          </button>
        </div>

      </div>
    </div>
  );
};

