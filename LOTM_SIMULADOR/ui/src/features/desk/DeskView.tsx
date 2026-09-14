import React from 'react';
import type { CharacterDiegetic } from '../types';
import { Eye, Clock, ShieldAlert, ShoppingBag } from 'lucide-react';
import { CandleObject } from './objects/CandleObject';
import { SomaticMirrorObject } from './objects/SomaticMirrorObject';
import { DeskCracksOverlay } from './objects/DeskCracksOverlay';
import { ActingBookObject } from './objects/ActingBookObject';
import { IdentityPapersObject } from './objects/IdentityPapersObject';
import { LeatherPouchObject } from './objects/LeatherPouchObject';

interface DeskViewProps {
  character: CharacterDiegetic;
  onOpenCorkboard: () => void;
  onOpenCalendar: () => void;
  onOpenMarket: () => void;
  onOpenCombat: () => void;
  onOpenAscension: () => void;
  onToggleSpiritVision: () => void;
  spiritVisionActive: boolean;
}

export const DeskView: React.FC<DeskViewProps> = ({
  character,
  onOpenCorkboard,
  onOpenCalendar,
  onOpenMarket,
  onOpenCombat,
  onOpenAscension,
  onToggleSpiritVision,
  spiritVisionActive
}) => {
  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between select-none overflow-hidden texture-damask-wall">
      
      {/* 1. ZONA SUPERIOR: PARED DEL DESVÁN EN PENUMBRA */}
      <div className="relative w-full h-[36vh] px-8 pt-6 flex justify-between items-start z-10">
        
        {/* Atmósfera e Identidad Sutil en la Pared */}
        <div className="flex flex-col gap-1 max-w-sm">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold tracking-widest text-[#d4af37] font-serif cinzel opacity-90">
              EL DESVÁN EN {character.district.toUpperCase()}
            </h1>
          </div>
          <p className="text-xs italic text-[#8c7d6b] font-serif">
            {character.profession} · {character.sequenceTitle}
          </p>
          
          {/* Botón Místico del Velo: El Tercer Ojo */}
          <button
            onClick={onToggleSpiritVision}
            className={`mt-2 px-3 py-1.5 rounded-full border transition-all flex items-center gap-2 text-xs font-serif font-bold w-fit ${
              spiritVisionActive 
                ? 'bg-[#2b1040] text-[#c084fc] border-[#a855f7] shadow-[0_0_15px_rgba(168,85,247,0.5)]' 
                : 'bg-[#14100c]/80 text-[#968c7e] border-[#383024] hover:text-[#e5ded2]'
            }`}
          >
            <Eye size={13} />
            <span>{spiritVisionActive ? 'Velo Espiritual Activo' : 'Abrir el Tercer Ojo'}</span>
          </button>
        </div>

        {/* Centro de la Pared: El Espejo de Azogue y la Repisa del Cáliz */}
        <div className="absolute left-1/2 -translate-x-1/2 top-3 flex items-center gap-6">
          <SomaticMirrorObject 
            tier={character.somatics.corruptionTier}
            description={character.somatics.mirrorDescription}
          />

          {/* Repisa del Cáliz Ritual (Ascensión) */}
          <div 
            onClick={onOpenAscension}
            className="flex flex-col items-center cursor-pointer select-none group transform hover:scale-105 transition-all mt-6"
            title="Cáliz de plata para ascensión de secuencia"
          >
            <div className="w-8 h-10 rounded-b-full bg-gradient-to-b from-[#b89547] via-[#8c7038] to-[#423319] border border-[#d4af37] shadow-[0_0_12px_rgba(212,175,55,0.3)] flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-[#fef08a]" />
            </div>
            <div className="w-12 h-1.5 bg-[#2b1e13] rounded-sm border-t border-[#6b4e2f] shadow" />
            <span className="text-[9px] font-serif italic text-[#c2b297] opacity-0 group-hover:opacity-100 transition-opacity mt-1">
              El Cáliz
            </span>
          </div>
        </div>

        {/* Lado Derecho de la Pared: El Tablero de Corcho Colgado en la Pared */}
        <div 
          onClick={onOpenCorkboard}
          className="w-52 h-36 texture-corkboard rounded p-3 shadow-2xl cursor-pointer select-none group transform hover:scale-105 transition-all duration-300 relative border-4 border-[#3a2818]"
          title="Tablero de corcho de Minsk Street"
        >
          {/* Chincheta de latón sujetando un hilo rojo visible */}
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[#d4af37] border border-[#523d14] shadow" />
          
          {/* Mininotas clavadas con cordel */}
          <div className="flex flex-col gap-1.5 h-full justify-between pointer-events-none">
            <div className="text-[9px] uppercase tracking-widest text-[#d4af37] font-bold font-serif border-b border-[#523d24] pb-0.5">
              Expediente Cherwood
            </div>
            <div className="flex gap-2 items-center">
              <div className="w-14 h-10 bg-[#ede4d1] rounded-sm p-1 text-[7px] text-[#1a1612] font-serif shadow">
                Huellas...
              </div>
              <div className="w-12 h-0.5 bg-[#dc2626] shadow" />
              <div className="w-14 h-10 bg-[#ede4d1] rounded-sm p-1 text-[7px] text-[#1a1612] font-serif shadow">
                Sterling...
              </div>
            </div>
            <div className="text-[9px] italic text-[#bfad95] font-serif text-right">
              Tocar para examinar
            </div>
          </div>
        </div>

      </div>

      {/* 2. ZONA INFERIOR: LA MESA DE CAOBA DEL ESCRITORIO (ESPACIO FÍSICO) */}
      <div className="relative w-full h-[64vh] texture-mahogany-desk border-t-4 border-[#24170e] px-10 py-6 z-20 shadow-[0_-20px_50px_rgba(0,0,0,0.9)]">
        
        {/* Capa de Grietas Procedurales SVG de Ruina sobre la Mesa */}
        <DeskCracksOverlay 
          tier={character.somatics.ruinaTier}
          description={character.somatics.woodDescription}
        />

        {/* DISPOSICIÓN ESPACIAL DE OBJETOS SOBRE LA CAOBA */}
        <div className="relative w-full h-full flex justify-between items-center">
          
          {/* A. Esquina Izquierda: La Vela de Sebo y el Reloj/Almanaque */}
          <div className="flex flex-col gap-8 items-center z-20">
            {/* La Vela Animada */}
            <CandleObject 
              tier={character.somatics.sanityTier}
              description={character.somatics.candleDescription}
            />

            {/* Reloj de Bolsillo / Almanaque de Cuatro Franjas */}
            <div 
              onClick={onOpenCalendar}
              className="flex items-center gap-2 bg-[#17120d] hover:bg-[#261c14] border border-[#523b24] text-[#dfcaa2] px-3 py-1.5 rounded-full cursor-pointer shadow-lg transition-all transform hover:scale-105 group select-none"
              title="Almanaque civil y horario de franjas"
            >
              <Clock size={14} className="text-[#d4af37]" />
              <span className="text-xs font-serif italic">
                Almanaque de Franjas
              </span>
            </div>
          </div>

          {/* B. Centro de la Mesa: Documentos de Identidad y Diario de Actuación */}
          <div className="flex gap-10 items-center z-20">
            {/* Pliegos Notariales y Anclas */}
            <IdentityPapersObject 
              name={character.name}
              profession={character.profession}
              originTitle={character.originTitle}
              district={character.district}
              burden={character.initialBurden}
              anchors={character.anchors}
            />

            {/* Cuaderno de Cuero del Intérprete */}
            <ActingBookObject 
              coherence={character.actingCoherence}
              actingFeedback={character.actingFeedback}
              entries={character.actingDiary}
              pathwayName={character.pathwayName}
              sequenceTitle={character.sequenceTitle}
            />
          </div>

          {/* C. Esquina Derecha: Monedero, Misiva del Bazar y Guardia */}
          <div className="flex flex-col gap-5 items-end z-20">
            
            {/* Saquito de Monedas */}
            <LeatherPouchObject 
              walletText={character.walletText}
            />

            {/* Carta Sellada del Bazar Clandestino */}
            <div 
              onClick={onOpenMarket}
              className="bg-[#1c1510] hover:bg-[#2e2016] border border-[#694d2e] rounded p-2.5 flex items-center gap-2 cursor-pointer shadow-xl transition-all transform hover:scale-105 group"
              title="Misiva sellada del bazar clandestino"
            >
              <ShoppingBag size={14} className="text-[#d4af37]" />
              <span className="text-xs font-serif italic text-[#ded5c5]">
                Bazar de la Niebla
              </span>
            </div>

            {/* Picaporte / Preparación Táctica en las Sombras */}
            <div 
              onClick={onOpenCombat}
              className="bg-[#210e11] hover:bg-[#331418] border border-[#631c22] rounded p-2 flex items-center gap-2 cursor-pointer shadow-xl transition-all transform hover:scale-105"
              title="Estar alerta ante pasos en la escalera"
            >
              <ShieldAlert size={14} className="text-[#f87171]" />
              <span className="text-[11px] font-serif font-bold text-[#fca5a5]">
                Ponerse en Guardia
              </span>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
