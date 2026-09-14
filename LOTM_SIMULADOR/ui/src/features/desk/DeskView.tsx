import React, { useState } from 'react';
import { 
  Flame, 
  Sparkles, 
  BookOpen, 
  Scroll, 
  ShieldAlert, 
  Coins, 
  Anchor, 
  Feather,
  Eye
} from 'lucide-react';
import type { CharacterDiegetic, SanityTier, CorruptionTier, RuinaTier } from '../types';

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
  const [activeTab, setActiveTab] = useState<'DOCUMENTOS' | 'ANCLAS' | 'DIARIO_ACTING'>('DOCUMENTOS');

  // Metáforas de la Vela (Sanidad)
  const getCandleColor = (tier: SanityTier) => {
    switch (tier) {
      case 'BRILLANTE': return '#f59e0b';
      case 'VACILANTE': return '#d97706';
      case 'CREPITANTE': return '#b45309';
      case 'AHOGADA_EN_CERA': return '#451a03';
    }
  };

  // Metáforas del Espejo de Azogue (Corrupción)
  const getMirrorGlow = (tier: CorruptionTier) => {
    switch (tier) {
      case 'AZOGUE_LIMPIO': return 'rgba(212, 175, 55, 0.2)';
      case 'VAHO_TENUE': return 'rgba(155, 111, 224, 0.3)';
      case 'REFLEJOS_DESFASADOS': return 'rgba(168, 85, 247, 0.5)';
      case 'EL_REFLEJO_NO_PARPADEA': return 'rgba(239, 68, 68, 0.7)';
    }
  };

  // Metáforas de la Madera del Buró (Ruina)
  const getWoodBorder = (tier: RuinaTier) => {
    switch (tier) {
      case 'INTEGRO': return 'border-amber-900/40';
      case 'MARCADO': return 'border-amber-700/60 shadow-[inset_0_0_10px_rgba(180,83,9,0.2)]';
      case 'EROSIONADO': return 'border-stone-700 shadow-[inset_0_0_15px_rgba(100,50,20,0.4)]';
      case 'ROTO': return 'border-red-950 shadow-[inset_0_0_20px_rgba(133,28,34,0.6)]';
      case 'PERDIDO': return 'border-red-900 shadow-[inset_0_0_30px_rgba(0,0,0,0.9)]';
    }
  };

  return (
    <div className="desk-container min-h-screen p-6 flex flex-col justify-between select-none" style={{ background: '#0d0b09' }}>
      
      {/* Cabecera del Desván: Identidad y Atmósfera */}
      <header className="desk-header flex justify-between items-center pb-4 border-b border-[#2d2419] mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-widest text-[#d4af37]" style={{ fontFamily: 'Cinzel' }}>
            EL DESVÁN DE BACKLUND
          </h1>
          <p className="text-sm italic text-[#968c7e]">
            {character.district} · {character.profession} · {character.pathwayName} ({character.sequenceTitle})
          </p>
        </div>

        {/* Acciones de Navegación Diegéticas */}
        <div className="flex gap-3 items-center">
          <button
            onClick={onToggleSpiritVision}
            className={`px-4 py-2 rounded border transition-all flex items-center gap-2 text-sm font-semibold ${
              spiritVisionActive 
                ? 'bg-[#2b1040] text-[#c084fc] border-[#a855f7] shadow-[0_0_15px_rgba(168,85,247,0.4)]' 
                : 'bg-[#191714] text-[#968c7e] border-[#383024] hover:text-[#e5ded2]'
            }`}
          >
            <Eye size={16} />
            {spiritVisionActive ? 'Visión Espiritual Activa' : 'Abrir el Tercer Ojo'}
          </button>

          <button 
            onClick={onOpenCorkboard}
            className="px-4 py-2 bg-[#191714] text-[#d4af37] border border-[#383024] hover:border-[#8c733e] rounded flex items-center gap-2 text-sm font-semibold transition-all"
          >
            <BookOpen size={16} />
            Corcho de Pistas
          </button>

          <button 
            onClick={onOpenCalendar}
            className="px-4 py-2 bg-[#191714] text-[#d4af37] border border-[#383024] hover:border-[#8c733e] rounded flex items-center gap-2 text-sm font-semibold transition-all"
          >
            <Scroll size={16} />
            Almanaque
          </button>

          <button 
            onClick={onOpenMarket}
            className="px-4 py-2 bg-[#191714] text-[#d4af37] border border-[#383024] hover:border-[#8c733e] rounded flex items-center gap-2 text-sm font-semibold transition-all"
          >
            <Coins size={16} />
            Bazar de la Niebla
          </button>

          <button 
            onClick={onOpenCombat}
            className="px-4 py-2 bg-[#2a1315] text-[#f87171] border border-[#851c22] hover:bg-[#3d1a1d] rounded flex items-center gap-2 text-sm font-semibold transition-all"
          >
            <ShieldAlert size={16} />
            Ponerse en Guardia
          </button>

          <button 
            onClick={onOpenAscension}
            className="px-4 py-2 bg-[#1c1913] text-[#facc15] border border-[#eab308] hover:bg-[#2e2617] rounded flex items-center gap-2 text-sm font-semibold transition-all shadow-[0_0_10px_rgba(234,179,8,0.2)]"
          >
            <Sparkles size={16} />
            El Trago del Cáliz
          </button>
        </div>
      </header>

      {/* Cuerpo Central: La Mesa del Buró con Objetos Diegéticos */}
      <div className="grid grid-cols-12 gap-6 mb-6">
        
        {/* Lado Izquierdo: Los Tres Testigos Somáticos (Vela, Espejo, Madera) */}
        <div className="col-span-4 flex flex-col gap-4">
          
          {/* Objeto 1: La Vela de Sebo (Sanidad) */}
          <div 
            className="p-4 rounded-lg bg-[#141210] border border-[#2d2419] hover:border-[#8c733e] transition-all shadow-md relative overflow-hidden group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Flame size={20} color={getCandleColor(character.somatics.sanityTier)} className="animate-pulse" />
                <span className="font-serif font-bold text-sm tracking-wide text-[#e5ded2]">
                  La Vela de Sebo
                </span>
              </div>
              <span className="text-xs text-[#968c7e] italic">
                Firmeza del Alma
              </span>
            </div>
            <p className="text-sm text-[#c4b59a] italic leading-relaxed">
              "{character.somatics.candleDescription}"
            </p>
          </div>

          {/* Objeto 2: El Espejo de Azogue (Corrupción) */}
          <div 
            className="p-4 rounded-lg bg-[#141210] border border-[#2d2419] hover:border-[#8c733e] transition-all shadow-md relative group"
            style={{ boxShadow: `0 0 15px ${getMirrorGlow(character.somatics.corruptionTier)}` }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Sparkles size={20} className="text-[#a855f7]" />
                <span className="font-serif font-bold text-sm tracking-wide text-[#e5ded2]">
                  El Espejo de Azogue
                </span>
              </div>
              <span className="text-xs text-[#968c7e] italic">
                Reflejo de la Carne
              </span>
            </div>
            <p className="text-sm text-[#c4b59a] italic leading-relaxed">
              "{character.somatics.mirrorDescription}"
            </p>
          </div>

          {/* Objeto 3: La Madera del Buró (Ruina) */}
          <div 
            className={`p-4 rounded-lg bg-[#141210] border ${getWoodBorder(character.somatics.ruinaTier)} hover:border-[#8c733e] transition-all shadow-md relative group`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <ShieldAlert size={20} className="text-[#b45309]" />
                <span className="font-serif font-bold text-sm tracking-wide text-[#e5ded2]">
                  Las Grietas del Tablero
                </span>
              </div>
              <span className="text-xs text-[#968c7e] italic">
                Huella Indeleble
              </span>
            </div>
            <p className="text-sm text-[#c4b59a] italic leading-relaxed">
              "{character.somatics.woodDescription}"
            </p>
          </div>

          {/* El Monedero de Cuero */}
          <div className="p-4 rounded-lg bg-[#141210] border border-[#2d2419]">
            <div className="flex items-center gap-2 mb-1">
              <Coins size={18} className="text-[#d4af37]" />
              <span className="font-serif font-bold text-sm text-[#e5ded2]">Fondo Civil</span>
            </div>
            <p className="text-sm text-[#d4af37] font-serif">
              {character.walletText}
            </p>
          </div>

        </div>

        {/* Lado Central y Derecho: Papeles, Documentos y Diario */}
        <div className="col-span-8 flex flex-col gap-4">
          
          {/* Espejo del Papel: Coherencia del Acting en Prosa */}
          <div className="p-4 rounded-lg bg-[#161411] border border-[#3d3222] shadow-md">
            <div className="flex items-center justify-between mb-2 border-b border-[#2d2419] pb-2">
              <div className="flex items-center gap-2">
                <Feather size={18} className="text-[#d4af37]" />
                <h3 className="font-serif font-bold text-md text-[#d4af37]" style={{ fontFamily: 'Cinzel' }}>
                  El Espejo del Papel
                </h3>
              </div>
              <span className="text-xs text-[#968c7e] italic">
                Interpretación del Rol
              </span>
            </div>
            <p className="text-sm text-[#e5ded2] leading-relaxed italic">
              {character.actingFeedback}
            </p>
          </div>

          {/* Pestañas del Buró: Documentos Civiles / Anclas de Humanidad / Diario */}
          <div className="bg-[#141210] rounded-lg border border-[#2d2419] flex-1 flex flex-col overflow-hidden">
            <div className="flex border-b border-[#2d2419] bg-[#0f0e0c]">
              <button
                onClick={() => setActiveTab('DOCUMENTOS')}
                className={`px-5 py-3 text-sm font-serif font-semibold border-b-2 transition-all ${
                  activeTab === 'DOCUMENTOS' 
                    ? 'border-[#d4af37] text-[#d4af37] bg-[#171410]' 
                    : 'border-transparent text-[#968c7e] hover:text-[#e5ded2]'
                }`}
              >
                Documentos de Identidad
              </button>

              <button
                onClick={() => setActiveTab('ANCLAS')}
                className={`px-5 py-3 text-sm font-serif font-semibold border-b-2 transition-all ${
                  activeTab === 'ANCLAS' 
                    ? 'border-[#d4af37] text-[#d4af37] bg-[#171410]' 
                    : 'border-transparent text-[#968c7e] hover:text-[#e5ded2]'
                }`}
              >
                Anclas de Humanidad
              </button>

              <button
                onClick={() => setActiveTab('DIARIO_ACTING')}
                className={`px-5 py-3 text-sm font-serif font-semibold border-b-2 transition-all ${
                  activeTab === 'DIARIO_ACTING' 
                    ? 'border-[#d4af37] text-[#d4af37] bg-[#171410]' 
                    : 'border-transparent text-[#968c7e] hover:text-[#e5ded2]'
                }`}
              >
                Diario de Principios
              </button>
            </div>

            {/* Contenido según pestaña */}
            <div className="p-5 flex-1 overflow-y-auto">
              
              {/* Pestaña: Documentos Civiles */}
              {activeTab === 'DOCUMENTOS' && (
                <div className="flex flex-col gap-4">
                  
                  {/* Contrato de Empleo */}
                  <div className="parchment-sheet p-4 rounded text-[#1f1a14] shadow">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-bold font-serif text-base" style={{ fontFamily: 'Cinzel' }}>
                          Cédula de Empleo Civil
                        </h4>
                        <p className="text-xs text-[#554a3b]">{character.district} · Backlund</p>
                      </div>
                      <span className="text-xs px-2 py-1 bg-[#c4b59a] text-[#1f1a14] font-bold rounded">
                        Registrado
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed mb-3">
                      Atestigua que el titular ejerce legalmente como <strong>{character.profession}</strong> en el término municipal de Backlund.
                    </p>
                    <div className="text-xs text-[#554a3b] border-t border-[#b8a98f] pt-2 flex justify-between">
                      <span>Carga Inicial: {character.initialBurden.description}</span>
                      <span>{character.initialBurden.details}</span>
                    </div>
                  </div>

                  {/* Informes de Sospecha Civil */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-[#181512] rounded border border-[#33291d]">
                      <h5 className="font-serif font-bold text-xs text-[#968c7e] uppercase mb-1">
                        Miradas de la Policía Metropolitana
                      </h5>
                      <p className="text-sm text-[#e5ded2] italic">
                        "{character.policeSuspicionText}"
                      </p>
                    </div>

                    <div className="p-3 bg-[#181512] rounded border border-[#33291d]">
                      <h5 className="font-serif font-bold text-xs text-[#968c7e] uppercase mb-1">
                        Atención del Clero y la Inquisición
                      </h5>
                      <p className="text-sm text-[#e5ded2] italic">
                        "{character.churchSuspicionText}"
                      </p>
                    </div>
                  </div>

                </div>
              )}

              {/* Pestaña: Anclas de Humanidad */}
              {activeTab === 'ANCLAS' && (
                <div className="grid grid-cols-2 gap-4">
                  {character.anchors.map((anchor) => (
                    <div 
                      key={anchor.id}
                      className="p-3 rounded bg-[#181613] border border-[#2f271c] flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-serif font-bold text-sm text-[#d4af37]">
                            {anchor.nombre}
                          </span>
                          <span className="text-xs text-[#968c7e] uppercase">
                            {anchor.tipo}
                          </span>
                        </div>
                        <p className="text-xs text-[#c4b59a] leading-relaxed mb-2">
                          {anchor.descripcion}
                        </p>
                      </div>
                      <div className="text-xs text-[#8c733e] italic flex items-center gap-1 border-t border-[#261f16] pt-1">
                        <Anchor size={12} />
                        Firmeza: {anchor.fuerza}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pestaña: Diario de Principios y Actuación */}
              {activeTab === 'DIARIO_ACTING' && (
                <div className="flex flex-col gap-3">
                  {character.actingDiary.length === 0 ? (
                    <p className="text-sm text-[#968c7e] italic text-center py-6">
                      Aún no has registrado transgresiones ni aciertos en tu libreta de notas.
                    </p>
                  ) : (
                    character.actingDiary.map((entry) => (
                      <div 
                        key={entry.id}
                        className="p-3 bg-[#171512] rounded border border-[#30261b]"
                      >
                        <div className="flex justify-between text-xs text-[#8c733e] mb-1 font-serif">
                          <span>Día {entry.day} · Principio: {entry.principle}</span>
                          <span>Decisión Tomada: {entry.choiceTaken}</span>
                        </div>
                        <p className="text-sm text-[#e5ded2] italic">
                          "{entry.narrativeOutcome}"
                        </p>
                      </div>
                    ))
                  )}
                </div>
              )}

            </div>
          </div>

        </div>

      </div>

      {/* Pie de Página: Ambiente de Backlund */}
      <footer className="text-xs text-[#6b6255] italic text-center border-t border-[#221c14] pt-3">
        La niebla de carbón se filtra por las rendijas del desván. El reloj de la sala baja marca el paso implacable de las horas.
      </footer>

    </div>
  );
};
