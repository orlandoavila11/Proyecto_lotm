/**
 * GFX66 — EXPEDIENTE / DOSSIER DIEGÉTICO DE PERSONAJE CANÓNICO (GFX59)
 * Presenta retratos al óleo y expedientes de NPCs canónicos de Backlund (Sharron, Xio, Fors)
 * Cumple con la Ley de Prosa Diegética: cero números de afinidad o barras numéricas.
 */

import React, { useEffect } from 'react';
import { X, Eye, MapPin, Briefcase } from 'lucide-react';
import { VictorianIconReturn } from './VictorianIcons';

export interface NpcDossierData {
  id: string;
  name: string;
  alias?: string;
  profession: string;
  district: string;
  pathwayOrAffiliation: string;
  appearanceDescription: string;
  personalityAndNotes: string[];
  imageUrl?: string;
  dispositionText: string;
}

interface NpcDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  npc: NpcDossierData;
}

export const NpcDossierModal: React.FC<NpcDossierModalProps> = ({
  isOpen,
  onClose,
  npc
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
      aria-labelledby="npc-dossier-title"
      style={{ backgroundColor: 'rgba(5, 4, 3, 0.88)' }}
    >
      {/* Fondo con desenfoque suave */}
      <div 
        className="absolute inset-0 backdrop-blur-sm"
        onClick={onClose}
      />

      <div 
        className="relative z-10 max-w-3xl w-full parchment-sheet p-6 rounded-md shadow-2xl border-2 border-[#bfae91] animate-fadeIn max-h-[90vh] overflow-y-auto"
        style={{
          backgroundImage: 'url(/art/GFX30_flat_paper.png)',
          backgroundSize: 'cover',
          backgroundColor: '#ede4d1',
          color: '#1a1612'
        }}
      >
        {/* Botón de Cierre Superior */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-[#6b583f] hover:text-[#1a1612] hover:bg-[#decfae]/50 transition-colors"
          aria-label="Cerrar expediente"
        >
          <X size={18} />
        </button>

        {/* Cabecera del Dossier */}
        <div className="border-b border-[#c4b59a] pb-3 mb-6 text-center">
          <span className="text-[10px] text-[#736553] uppercase tracking-widest font-serif font-bold">
            Registro Confidencial de Contactos de Backlund
          </span>
          <h2 id="npc-dossier-title" className="text-xl font-bold text-[#1f1a14] mt-1" style={{ fontFamily: 'Cinzel' }}>
            {npc.name} {npc.alias && <span className="text-sm font-normal italic text-[#5c4a35]">({npc.alias})</span>}
          </h2>
          <div className="flex justify-center items-center gap-4 text-xs text-[#6b583f] font-serif mt-1">
            <span className="flex items-center gap-1">
              <Briefcase size={12} />
              {npc.profession}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <MapPin size={12} />
              {npc.district}
            </span>
          </div>
        </div>

        {/* Cuerpo del Dossier: Retrato + Notas */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start mb-6">
          
          {/* Columna Izquierda: Retrato Canónico (GFX59) */}
          <div className="md:col-span-5 flex flex-col items-center">
            <div className="w-full h-64 rounded border-2 border-[#8c733e] bg-[#1a1612] shadow-xl overflow-hidden flex items-center justify-center relative">
              {npc.imageUrl ? (
                <img 
                  src={npc.imageUrl} 
                  alt={npc.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="flex flex-col items-center text-[#8c733e] p-4 text-center">
                  <Eye size={32} className="mb-2 opacity-60" />
                  <span className="text-xs font-serif italic text-[#dfcaa2]">
                    Retrato no fijado en el archivo
                  </span>
                </div>
              )}
            </div>

            <div className="w-full mt-2.5 p-2 bg-[#e0d3bc] border border-[#c4b59a] rounded text-center">
              <span className="text-[11px] text-[#54432f] font-serif italic">
                {npc.dispositionText}
              </span>
            </div>
          </div>

          {/* Columna Derecha: Rasgos y Observaciones */}
          <div className="md:col-span-7 space-y-4 font-serif text-sm">
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-[#736553] mb-1">
                Filiación y Estatus Sobrenatural
              </h4>
              <p className="text-[#1f1a14] italic bg-[#e6dbca] p-2.5 rounded border border-[#c9bca6] text-xs leading-relaxed">
                {npc.pathwayOrAffiliation}
              </p>
            </div>

            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-[#736553] mb-1">
                Apariencia y Presencia
              </h4>
              <p className="text-xs text-[#2b2216] leading-relaxed italic">
                {npc.appearanceDescription}
              </p>
            </div>

            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-[#736553] mb-1">
                Observaciones de Campo
              </h4>
              <div className="space-y-1.5 text-xs text-[#2b2216] leading-relaxed">
                {npc.personalityAndNotes.map((note, idx) => (
                  <div key={idx} className="flex items-start gap-1.5">
                    <span className="text-[#8c733e] font-bold">•</span>
                    <span>{note}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* Pie con Acciones */}
        <div className="border-t border-[#c4b59a] pt-3 flex justify-between items-center">
          <span className="text-[11px] text-[#786a58] italic font-serif">
            Ficha sellada bajo el registro de la oficina de Backlund.
          </span>
          <button
            onClick={onClose}
            className="crimson-btn px-5 py-1.5 text-xs font-bold uppercase tracking-wider flex items-center gap-1"
          >
            <VictorianIconReturn size={14} />
            <span>Cerrar Expediente</span>
          </button>
        </div>

      </div>
    </div>
  );
};
