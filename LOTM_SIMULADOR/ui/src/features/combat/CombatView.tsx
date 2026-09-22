import React, { useState } from 'react';
import { ArrowLeft, Crosshair, Eye, Shield, Sparkles, Zap, Brain } from 'lucide-react';
import type { CombatantDiegetic } from '../types';
import { TacticalGrid, type ActiveVfxState } from './TacticalGrid';
import { TacticalResolutionOverlay, type CombatOutcomeType } from './TacticalResolutionOverlay';
import type { AbilityVfxType } from './TacticalAbilityVfx';

interface CombatViewProps {
  onBackToDesk: () => void;
  characterPathway?: 'The Fool' | 'Visionary';
}

const INITIAL_COMBATANTS: CombatantDiegetic[] = [
  {
    id: 'player_1',
    name: 'Tú',
    isPlayer: true,
    x: 3,
    y: 4,
    opacityState: 'DESCIFRADO',
    vitalityDescription: 'El pulso es firme, aunque la respiración se acelera por la tensión.',
    stanceDescription: 'Apoyado sobre el pie trasero, empuñando el bastón y el revólver de cañón corto.'
  },
  {
    id: 'enemy_1',
    name: 'Sombra Embozada de la Noche',
    isPlayer: false,
    x: 3,
    y: 1,
    opacityState: 'VELADO',
    vitalityDescription: 'Silueta imprecisa oculta bajo un capote empapado en fango.',
    stanceDescription: 'Agazapado en el umbral, sin revelar la naturaleza de sus extremidades.'
  }
];

export const CombatView: React.FC<CombatViewProps> = ({ 
  onBackToDesk,
  characterPathway = 'The Fool'
}) => {
  const [combatants, setCombatants] = useState<CombatantDiegetic[]>(INITIAL_COMBATANTS);
  const [selectedCell, setSelectedCell] = useState<{ x: number; y: number } | null>(null);
  const [activeVfx, setActiveVfx] = useState<ActiveVfxState | null>(null);
  const [resolutionOutcome, setResolutionOutcome] = useState<CombatOutcomeType | null>(null);
  
  const [combatLog, setCombatLog] = useState<string[]>([
    'Una presencia hostil se interpone en el callejón. El metal del cerrojo resuena en la quietud.'
  ]);
  
  // Objetos y Recursos Diegéticos (sin números mecánicos)
  const [cartridgesInCylinder, setCartridgesInCylinder] = useState<number>(5);
  const [spiritualBreath, setSpiritualBreath] = useState<'PLENO' | 'AGITADO' | 'EXHAUSTO'>('PLENO');
  const [enemyWoundsCount, setEnemyWoundsCount] = useState<number>(0);

  const player = combatants.find(c => c.isPlayer)!;
  const enemy = combatants.find(c => !c.isPlayer)!;

  const triggerVfx = (type: AbilityVfxType, from = { x: player.x, y: player.y }, to = { x: enemy.x, y: enemy.y }) => {
    setActiveVfx({ type, fromCell: from, toCell: to });
  };

  const handleInspectWithSpiritVision = () => {
    triggerVfx('SPIRIT_VISION_SCAN');
    setCombatants(prev => prev.map(c => {
      if (!c.isPlayer) {
        return {
          ...c,
          opacityState: 'DESCIFRADO',
          revealedIntent: 'Se prepara para abalanzarse con garras oscuras ungidas en veneno adormecedor.'
        };
      }
      return c;
    }));
    setSpiritualBreath(prev => prev === 'PLENO' ? 'AGITADO' : 'EXHAUSTO');
    setCombatLog(prev => [
      'Activaste la Visión Espiritual: el aura de la sombra se tiñe de violeta oscuro y sus intenciones asesinas quedan desnudas ante tus ojos.',
      ...prev
    ]);
  };

  const handleShoot = () => {
    if (cartridgesInCylinder <= 0) {
      setCombatLog(prev => ['El percutor golpea en vacío: no quedan cartuchos en el tambor del revólver.', ...prev]);
      return;
    }
    setCartridgesInCylinder(prev => prev - 1);
    triggerVfx('GUNPOWDER_TRACER');

    const nextWounds = enemyWoundsCount + 1;
    setEnemyWoundsCount(nextWounds);

    setCombatLog(prev => [
      'Un estruendo de pólvora rompe la niebla. El proyectil roza el hombro de la figura haciéndola retroceder un paso.',
      ...prev
    ]);

    if (nextWounds >= 2) {
      setTimeout(() => {
        setResolutionOutcome('VICTORIA');
      }, 1000);
    }
  };

  const handlePathwayAbility = () => {
    if (spiritualBreath === 'EXHAUSTO') {
      setCombatLog(prev => [
        'Tu espiritualidad está al límite. Intentar canalizar más poder amenaza con fracturar tu mente.',
        ...prev
      ]);
      setResolutionOutcome('PERDIDA_DE_CONTROL');
      return;
    }

    if (characterPathway === 'The Fool') {
      // Habilidad S9 Fool: Manipulación de Hilos de Destino
      triggerVfx('ASTRAL_THREAD');
      setSpiritualBreath('AGITADO');
      const nextWounds = enemyWoundsCount + 1;
      setEnemyWoundsCount(nextWounds);
      setCombatLog(prev => [
        'Tiras de los hilos astrales invisibles: la sombra trastabilla como un títere con los cordajes enredados, perdiendo su ventaja.',
        ...prev
      ]);

      if (nextWounds >= 2) {
        setTimeout(() => setResolutionOutcome('VICTORIA'), 1000);
      }
    } else {
      // Habilidad S9 Visionary: Intimidación Psíquica / Espectador
      triggerVfx('PSYCHIC_WAVE');
      setSpiritualBreath('AGITADO');
      const nextWounds = enemyWoundsCount + 1;
      setEnemyWoundsCount(nextWounds);
      setCombatLog(prev => [
        'Fijas tu mirada en la sombra: proyectas una onda de desasosiego que congela sus extremidades y siembra el pavor en su mente.',
        ...prev
      ]);

      if (nextWounds >= 2) {
        setTimeout(() => setResolutionOutcome('VICTORIA'), 1000);
      }
    }
  };

  const handleDodge = () => {
    setCombatLog(prev => [
      'Te deslizas hacia la penumbra tras una pila de cajones de madera, rompiendo la línea de ataque enemiga.',
      ...prev
    ]);
  };

  const handleDisengage = () => {
    setResolutionOutcome('HUIDA');
  };

  return (
    <div 
      className="combat-screen p-8 flex flex-col justify-between select-none relative overflow-hidden" 
      style={{ 
        width: '1920px', 
        height: '1080px', 
        position: 'relative', 
        background: '#0b0a09', 
        backgroundImage: 'url(/art/GFX40_combat_arena_floor.jpg)', 
        backgroundSize: 'cover', 
        backgroundPosition: 'center' 
      }}
    >
      
      {/* Cabecera */}
      <header className="flex justify-between items-center pb-4 border-b border-[#2d2419] mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={handleDisengage}
            className="p-2 bg-[#171410] border border-[#383024] hover:border-[#8c733e] text-[#d4af37] rounded flex items-center gap-2 text-sm font-serif transition-all"
          >
            <ArrowLeft size={16} />
            Romper el Contacto
          </button>
          <div>
            <h1 className="text-xl font-bold tracking-widest text-[#f87171]" style={{ fontFamily: 'Cinzel' }}>
              ENCUENTRO HOSTIL EN LOS CALLEJONES
            </h1>
            <p className="text-xs text-[#968c7e] italic">
              Escaramuza táctica diegética · Callejón de Minsk Street
            </p>
          </div>
        </div>

        {/* Recursos como Objetos */}
        <div className="flex items-center gap-4 bg-[#14120f] px-4 py-2 rounded border border-[#2d2419] text-xs">
          <div className="flex items-center gap-1.5 text-[#e5ded2]">
            <Crosshair size={14} className="text-[#f59e0b]" />
            <span>Tambor del Revólver: <strong>{cartridgesInCylinder} balas</strong></span>
          </div>
          <div className="w-px h-4 bg-[#2d2419]"></div>
          <div className="flex items-center gap-1.5 text-[#c084fc]">
            <Sparkles size={14} />
            <span>Aliento Espiritual: <strong>{spiritualBreath}</strong></span>
          </div>
        </div>
      </header>

      {/* Contenido Central: Rejilla 5x7 y Panel Táctico */}
      <div className="grid grid-cols-12 gap-6 flex-1 mb-6">
        
        {/* Rejilla 7x5 de Tablero Táctico (GFX41, GFX44 & GFX45) */}
        <div className="col-span-7 flex flex-col items-center justify-center">
          <TacticalGrid
            combatants={combatants}
            selectedCell={selectedCell}
            onSelectCell={(pos) => setSelectedCell(pos)}
            validMoveCells={[
              { x: 3, y: 3 },
              { x: 2, y: 4 },
              { x: 4, y: 4 }
            ]}
            validTargetCells={[
              { x: 3, y: 1 }
            ]}
            activeVfx={activeVfx}
            onVfxComplete={() => setActiveVfx(null)}
          />
        </div>

        {/* Panel Táctico Diegético */}
        <div className="col-span-5 bg-[#14100c]/95 p-6 rounded-lg border border-[#4a3622] shadow-2xl flex flex-col justify-between backdrop-blur-sm">
          <div>
            <div className="flex justify-between items-center border-b border-[#3d2b1b] pb-3 mb-4">
              <h2 className="font-serif font-bold text-base text-[#d4af37]" style={{ fontFamily: 'Cinzel' }}>
                Lectura de la Situación
              </h2>
              <span className="text-[11px] text-[#9c8a74] italic font-serif">
                Mano firme y respiración contenida
              </span>
            </div>

            {/* Estado del Enemigo con Opacidad Diegética */}
            <div className="parchment-sheet p-4 rounded text-[#1f1a14] mb-4 shadow-lg border border-[#bfae91]">
              <div className="flex justify-between items-center mb-1.5">
                <span className="font-serif font-bold text-sm" style={{ fontFamily: 'Cinzel' }}>
                  {enemy.name}
                </span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#c4b59a] border border-[#a69578]">
                  Opacidad: {enemy.opacityState}
                </span>
              </div>
              <p className="text-xs italic mb-2 text-[#3b3123] leading-relaxed">
                "{enemy.vitalityDescription}"
              </p>
              <p className="text-xs leading-relaxed text-[#1f1a14]">
                {enemy.stanceDescription}
              </p>
              {enemy.revealedIntent && (
                <div className="mt-2.5 border-t border-[#bfae91] pt-2 text-xs text-[#7f1d1d] font-serif font-bold">
                  * Intención Desvelada: {enemy.revealedIntent}
                </div>
              )}
            </div>

            {/* Acciones Disponibles */}
            <div className="grid grid-cols-2 gap-2.5 mb-4">
              <button
                onClick={handleShoot}
                className="p-3 bg-[#1e1712] border border-[#4a3622] hover:border-[#d4af37] rounded text-left transition-all text-xs font-serif font-bold text-[#e5ded2] flex items-center gap-2 shadow-md hover:bg-[#281f18]"
              >
                <Crosshair size={15} className="text-[#f59e0b]" />
                <span>Disparo de Precisión</span>
              </button>

              <button
                onClick={handleDodge}
                className="p-3 bg-[#1e1712] border border-[#4a3622] hover:border-[#d4af37] rounded text-left transition-all text-xs font-serif font-bold text-[#e5ded2] flex items-center gap-2 shadow-md hover:bg-[#281f18]"
              >
                <Shield size={15} className="text-[#38bdf8]" />
                <span>Esquiva en Penumbra</span>
              </button>

              {/* Habilidad Extraordinaria de Secuencia 9 */}
              <button
                onClick={handlePathwayAbility}
                className="col-span-2 p-3 bg-[#141b29] border border-[#2563eb] hover:border-[#60a5fa] rounded text-left transition-all text-xs font-serif font-bold text-[#93c5fd] flex items-center gap-2 shadow-[0_0_12px_rgba(37,99,235,0.25)] hover:bg-[#1b2538]"
              >
                {characterPathway === 'The Fool' ? <Zap size={15} /> : <Brain size={15} />}
                <span>
                  {characterPathway === 'The Fool' 
                    ? 'Manipular Hilos de Destino (Vidente S9)' 
                    : 'Proyectar Intimidación Psíquica (Espectador S9)'}
                </span>
              </button>

              <button
                onClick={handleInspectWithSpiritVision}
                className="col-span-2 p-3 bg-[#1f142b] border border-[#7c3aed] hover:border-[#a855f7] rounded text-left transition-all text-xs font-serif font-bold text-[#d8b4fe] flex items-center gap-2 shadow-[0_0_12px_rgba(124,58,237,0.25)] hover:bg-[#291b38]"
              >
                <Eye size={15} />
                <span>Escudriñar Intención con Visión Espiritual</span>
              </button>
            </div>

            {/* Bitácora de Combate */}
            <div className="p-3.5 bg-[#0d0a08] rounded border border-[#2d2015] text-xs text-[#c4b59a] max-h-40 overflow-y-auto space-y-1.5 font-serif shadow-inner">
              <div className="text-[10px] text-[#8a7964] uppercase tracking-widest font-bold mb-1 border-b border-[#241910] pb-1">
                Ecos del Encuentro
              </div>
              {combatLog.map((log, idx) => (
                <p key={idx} className="italic leading-relaxed">
                  · {log}
                </p>
              ))}
            </div>
          </div>

          <div className="text-[11px] text-[#8c7b66] border-t border-[#2d2015] pt-3 italic text-center">
            "El combate entre extraordinarios dura segundos; los errores duran para siempre."
          </div>
        </div>

      </div>

      <footer className="text-xs text-[#6e6353] italic text-center border-t border-[#221c14] pt-3">
        El eco de las detonaciones reverbera entre las paredes de ladrillo tiznado de carbón.
      </footer>

      {/* Capa de Resolución Diegética de Combate (GFX46) */}
      {resolutionOutcome && (
        <TacticalResolutionOverlay
          outcome={resolutionOutcome}
          onConfirm={onBackToDesk}
        />
      )}

    </div>
  );
};
