import React, { useState } from 'react';
import { ArrowLeft, Crosshair, Eye, Shield, Sparkles } from 'lucide-react';
import type { CombatantDiegetic } from '../types';

interface CombatViewProps {
  onBackToDesk: () => void;
}

const INITIAL_COMBATANTS: CombatantDiegetic[] = [
  {
    id: 'player_1',
    name: 'Tú',
    isPlayer: true,
    x: 2,
    y: 5,
    opacityState: 'DESCIFRADO',
    vitalityDescription: 'El pulso es firme, aunque la respiración se acelera por la tensión.',
    stanceDescription: 'Apoyado sobre el pie trasero, empuñando el bastón y el revólver de cañón corto.'
  },
  {
    id: 'enemy_1',
    name: 'Sombra Embozada de la Noche',
    isPlayer: false,
    x: 2,
    y: 1,
    opacityState: 'VELADO',
    vitalityDescription: 'Silueta imprecisa oculta bajo un capote empapado en fango.',
    stanceDescription: 'Agazapado en el umbral, sin revelar la naturaleza de sus extremidades.'
  }
];

export const CombatView: React.FC<CombatViewProps> = ({ onBackToDesk }) => {
  const [combatants, setCombatants] = useState<CombatantDiegetic[]>(INITIAL_COMBATANTS);
  const [selectedCell, setSelectedCell] = useState<{ x: number; y: number } | null>(null);
  const [combatLog, setCombatLog] = useState<string[]>([
    'Una presencia hostil se interpone en el callejón. El metal del cerrojo resuena en la quietud.'
  ]);
  
  // Objetos y Recursos Diegéticos (sin números)
  const [cartridgesInCylinder, setCartridgesInCylinder] = useState<number>(5);
  const [spiritualBreath, setSpiritualBreath] = useState<'PLENO' | 'AGITADO' | 'EXHAUSTO'>('PLENO');

  const enemy = combatants.find(c => !c.isPlayer)!;

  const handleInspectWithSpiritVision = () => {
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
    setSpiritualBreath('AGITADO');
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
    setCombatLog(prev => [
      'Un estruendo de pólvora rompe la niebla. El proyectil roza el hombro de la figura haciéndola retroceder un paso.',
      ...prev
    ]);
  };

  const handleDodge = () => {
    setCombatLog(prev => [
      'Te deslizas hacia la penumbra tras una pila de cajones de madera, rompiendo la línea de ataque enemiga.',
      ...prev
    ]);
  };

  return (
    <div className="combat-screen min-h-screen p-6 flex flex-col justify-between select-none" style={{ background: '#0b0a09' }}>
      
      {/* Cabecera */}
      <header className="flex justify-between items-center pb-4 border-b border-[#2d2419] mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onBackToDesk}
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
        
        {/* Rejilla 5x7 de Tablero Táctico */}
        <div className="col-span-7 bg-[#14120f] p-6 rounded-lg border border-[#2d2419] flex flex-col items-center justify-center">
          <div className="grid grid-cols-5 gap-2 p-4 bg-[#090807] rounded border border-[#292218] shadow-inner">
            {Array.from({ length: 7 }).map((_, rowIndex) => (
              <React.Fragment key={rowIndex}>
                {Array.from({ length: 5 }).map((_, colIndex) => {
                  const combatantInCell = combatants.find(c => c.x === colIndex && c.y === rowIndex);
                  const isSelected = selectedCell?.x === colIndex && selectedCell?.y === rowIndex;

                  return (
                    <div
                      key={`${colIndex}-${rowIndex}`}
                      onClick={() => setSelectedCell({ x: colIndex, y: rowIndex })}
                      className={`w-14 h-14 rounded border flex flex-col items-center justify-center cursor-pointer transition-all relative ${
                        isSelected 
                          ? 'border-[#d4af37] bg-[#1e1a14]' 
                          : 'border-[#262016] bg-[#12100d] hover:border-[#4d3d28]'
                      }`}
                    >
                      {combatantInCell && (
                        <div className="flex flex-col items-center justify-center">
                          {combatantInCell.isPlayer ? (
                            <div className="w-8 h-8 rounded-full bg-[#1e293b] border border-[#38bdf8] flex items-center justify-center shadow-[0_0_8px_rgba(56,189,248,0.4)]">
                              <span className="text-xs font-serif font-bold text-[#e0f2fe]">TÚ</span>
                            </div>
                          ) : (
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${
                              combatantInCell.opacityState === 'VELADO'
                                ? 'bg-[#181113] border-[#7f1d1d] opacity-50 blur-[0.5px]'
                                : 'bg-[#450a0a] border-[#ef4444] shadow-[0_0_10px_rgba(239,68,68,0.5)]'
                            }`}>
                              <span className="text-[10px] font-serif font-bold text-[#fecaca]">
                                {combatantInCell.opacityState === 'VELADO' ? '?' : 'SOM'}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>

          <p className="text-[11px] text-[#6b6255] italic mt-3 text-center">
            Rejilla de combate de 5 casillas de frente por 7 de profundidad en el adoquín de Backlund.
          </p>
        </div>

        {/* Panel Táctico Diegético */}
        <div className="col-span-5 bg-[#14120f] p-6 rounded-lg border border-[#2d2419] flex flex-col justify-between">
          <div>
            <h2 className="font-serif font-bold text-base text-[#e5ded2] mb-3 border-b border-[#2d2419] pb-2" style={{ fontFamily: 'Cinzel' }}>
              Lectura de la Situación
            </h2>

            {/* Estado del Enemigo con Opacidad Diegética */}
            <div className="parchment-sheet p-4 rounded text-[#1f1a14] mb-4 shadow">
              <div className="flex justify-between items-center mb-1">
                <span className="font-serif font-bold text-sm" style={{ fontFamily: 'Cinzel' }}>
                  {enemy.name}
                </span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#c4b59a]">
                  Opacidad: {enemy.opacityState}
                </span>
              </div>
              <p className="text-xs italic mb-2 text-[#3b3123]">
                "{enemy.vitalityDescription}"
              </p>
              <p className="text-xs leading-relaxed text-[#1f1a14]">
                {enemy.stanceDescription}
              </p>
              {enemy.revealedIntent && (
                <div className="mt-2 border-t border-[#bfae91] pt-2 text-xs text-[#7f1d1d] font-serif font-bold">
                  * Intención Desvelada: {enemy.revealedIntent}
                </div>
              )}
            </div>

            {/* Acciones Disponibles */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <button
                onClick={handleShoot}
                className="p-2.5 bg-[#1a1512] border border-[#382d1f] hover:border-[#8c733e] rounded text-left transition-all text-xs font-serif font-bold text-[#e5ded2] flex items-center gap-2"
              >
                <Crosshair size={14} className="text-[#f59e0b]" />
                Disparo de Precisión
              </button>

              <button
                onClick={handleDodge}
                className="p-2.5 bg-[#1a1512] border border-[#382d1f] hover:border-[#8c733e] rounded text-left transition-all text-xs font-serif font-bold text-[#e5ded2] flex items-center gap-2"
              >
                <Shield size={14} className="text-[#38bdf8]" />
                Esquiva en Penumbra
              </button>

              <button
                onClick={handleInspectWithSpiritVision}
                className="col-span-2 p-2.5 bg-[#20152e] border border-[#6b21a8] hover:border-[#a855f7] rounded text-left transition-all text-xs font-serif font-bold text-[#d8b4fe] flex items-center gap-2 shadow-[0_0_10px_rgba(168,85,247,0.2)]"
              >
                <Eye size={14} />
                Escudriñar Intención con Visión Espiritual
              </button>
            </div>

            {/* Bitácora de Combate */}
            <div className="p-3 bg-[#0d0c0a] rounded border border-[#241e16] text-xs text-[#c4b59a] max-h-32 overflow-y-auto space-y-1 font-serif">
              {combatLog.map((log, idx) => (
                <p key={idx} className="italic leading-relaxed">
                  · {log}
                </p>
              ))}
            </div>
          </div>

          <div className="text-[11px] text-[#6b6255] border-t border-[#221c14] pt-3 italic text-center">
            "El combate entre extraordinarios dura segundos; los errores duran para siempre."
          </div>
        </div>

      </div>

      <footer className="text-xs text-[#6e6353] italic text-center border-t border-[#221c14] pt-3">
        El eco de las detonaciones reverbera entre las paredes de ladrillo tiznado de carbón.
      </footer>

    </div>
  );
};
