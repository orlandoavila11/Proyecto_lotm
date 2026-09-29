import React, { useState, useEffect } from 'react';
import { ArrowLeft, Crosshair, Eye, Shield, Sparkles, Zap, Brain, AlertTriangle } from 'lucide-react';
import type { CombatantDiegetic } from '../types';
import { TacticalGrid, type ActiveVfxState } from './TacticalGrid';
import { TacticalResolutionOverlay, type CombatOutcomeType } from './TacticalResolutionOverlay';
import type { AbilityVfxType } from './TacticalAbilityVfx';
import { apiClient } from '../../services/apiClient';

interface CombatViewProps {
  onBackToDesk: () => void;
  characterPathway?: 'The Fool' | 'Visionary';
  characterId?: string;
  onRefreshCharacter?: () => void;
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
  characterPathway = 'The Fool',
  characterId,
  onRefreshCharacter
}) => {
  const activeCharId = characterId || localStorage.getItem('lotm_active_character_id');

  const [combatants, setCombatants] = useState<CombatantDiegetic[]>(INITIAL_COMBATANTS);
  const [selectedCell, setSelectedCell] = useState<{ x: number; y: number } | null>(null);
  const [activeVfx, setActiveVfx] = useState<ActiveVfxState | null>(null);
  const [resolutionOutcome, setResolutionOutcome] = useState<CombatOutcomeType | null>(null);
  const [hasActiveBattle, setHasActiveBattle] = useState<boolean>(false);
  const [isStartingBattle, setIsStartingBattle] = useState<boolean>(false);
  const [combatError, setCombatError] = useState<string | null>(null);
  
  const [combatLog, setCombatLog] = useState<string[]>([
    'Una presencia hostil se interpone en el callejón. El metal del cerrojo resuena en la quietud.'
  ]);
  
  // Objetos y Recursos Diegéticos (sin números mecánicos)
  const [cartridgesInCylinder, setCartridgesInCylinder] = useState<number>(5);
  const [spiritualBreath, setSpiritualBreath] = useState<'PLENO' | 'AGITADO' | 'EXHAUSTO'>('PLENO');
  const [enemyWoundsCount, setEnemyWoundsCount] = useState<number>(0);

  // Comprobar combate activo existente en SQLite (sin iniciar combate incidentalmente en mount)
  useEffect(() => {
    if (!activeCharId) return;

    apiClient.getActiveCombat(activeCharId).then(battle => {
      if (battle && battle.status === 'ONGOING') {
        setHasActiveBattle(true);
        if (battle.turnLog && battle.turnLog.length > 0) {
          setCombatLog(battle.turnLog);
        }
      } else {
        setHasActiveBattle(false);
      }
    }).catch(() => {
      setHasActiveBattle(false);
    });
  }, [activeCharId]);

  if (!activeCharId) {
    return (
      <div 
        className="combat-screen p-8 flex flex-col justify-center items-center select-none relative overflow-hidden text-center"
        style={{ width: '1920px', height: '1080px', backgroundColor: '#0b0a09' }}
      >
        <h2 className="text-xl font-bold tracking-widest text-[#d4af37] font-serif mb-4" style={{ fontFamily: 'Cinzel' }}>
          SIN SESIÓN ACTIVA
        </h2>
        <p className="text-sm text-[#a89885] max-w-md font-serif mb-6 leading-relaxed">
          No hay una identidad civil confirmada en este momento. Debes encarnar un personaje en la vigilia del prólogo antes de salir a la penumbra de Backlund.
        </p>
        <button
          onClick={onBackToDesk}
          className="px-6 py-2.5 bg-[#171410] border border-[#8c733e] hover:border-[#d4af37] text-[#d4af37] rounded font-serif text-sm transition-all shadow-lg"
        >
          Volver al Refugio
        </button>
      </div>
    );
  }

  const handleStartEncounter = async () => {
    if (!activeCharId || isStartingBattle) return;
    setIsStartingBattle(true);
    setCombatError(null);
    try {
      const newBattle = await apiClient.startCombat({
        characterId: activeCharId,
        enemyName: 'Sombra Embozada de la Noche',
        enemyHp: 65
      });
      if (newBattle) {
        setHasActiveBattle(true);
        if (newBattle.turnLog) {
          setCombatLog(newBattle.turnLog);
        }
      }
    } catch (err: any) {
      setCombatError(err.message || 'Error al iniciar la confrontación.');
    } finally {
      setIsStartingBattle(false);
    }
  };

  const player = combatants.find(c => c.isPlayer)!;
  const enemy = combatants.find(c => !c.isPlayer)!;

  const triggerVfx = (type: AbilityVfxType, from = { x: player.x, y: player.y }, to = { x: enemy.x, y: enemy.y }) => {
    setActiveVfx({ type, fromCell: from, toCell: to });
  };

  const handleInspectWithSpiritVision = async () => {
    triggerVfx('SPIRIT_VISION_SCAN');
    setCombatError(null);
    try {
      const res = await apiClient.executeCombatAction({
        characterId: activeCharId,
        actionType: 'SCRUTINIZE'
      });
      setCombatants(prev => prev.map(c => {
        if (!c.isPlayer) {
          return {
            ...c,
            opacityState: 'DESCIFRADO',
            revealedIntent: res.message || 'Se prepara para abalanzarse con garras oscuras ungidas en veneno.'
          };
        }
        return c;
      }));
      setSpiritualBreath(prev => prev === 'PLENO' ? 'AGITADO' : 'EXHAUSTO');
      setCombatLog(prev => [
        res.message || 'Activaste la Visión Espiritual: el aura de la sombra queda desvelada ante tus ojos.',
        ...prev
      ]);
    } catch (err: any) {
      setCombatError(err.message || 'La inspección espiritual no pudo completarse.');
    }
  };

  const handleShootRevolver = async () => {
    if (cartridgesInCylinder <= 0) {
      setCombatLog(prev => [
        '¡El percutor cae en seco sobre una recámara vacía! No quedan balas de plata.',
        ...prev
      ]);
      return;
    }
    
    setCombatError(null);
    triggerVfx('GUNPOWDER_TRACER');

    try {
      const res = await apiClient.executeCombatAction({
        characterId: activeCharId,
        actionType: 'SKILL',
        skillId: 'SKILL_PRECISION_SHOT'
      });

      // Solo consumir recursos locales tras confirmación exitosa del servidor
      setCartridgesInCylinder(prev => Math.max(0, prev - 1));
      setEnemyWoundsCount(prev => prev + 1);

      setCombatLog(prev => [
        res.message || 'Un estruendo de pólvora rompe la niebla. El proyectil alcanza a la figura.',
        ...prev
      ]);

      if (res.battleOver || res.isCombatOver) {
        setTimeout(() => {
          setResolutionOutcome(res.victory ? 'VICTORIA' : 'DERROTA_INCONSCIENTE');
          onRefreshCharacter?.();
        }, 1000);
      }
    } catch (err: any) {
      setCombatError(err.message || 'El disparo no pudo ser confirmado por el servidor.');
    }
  };

  const handlePathwayAbility = async () => {
    if (spiritualBreath === 'EXHAUSTO') {
      setCombatLog(prev => [
        'Tu espiritualidad está al límite. Intentar canalizar más poder amenaza con fracturar tu mente.',
        ...prev
      ]);
      setResolutionOutcome('PERDIDA_DE_CONTROL');
      return;
    }

    const skillId = characterPathway === 'The Fool' ? 'SKILL_SPIRIT_VISION' : 'SKILL_PSYCHIC_WAVE';
    triggerVfx(characterPathway === 'The Fool' ? 'ASTRAL_THREAD' : 'PSYCHIC_WAVE');
    setCombatError(null);

    try {
      const res = await apiClient.executeCombatAction({
        characterId: activeCharId,
        actionType: 'SKILL',
        skillId
      });

      setSpiritualBreath('AGITADO');
      setEnemyWoundsCount(prev => prev + 1);

      setCombatLog(prev => [
        res.message || (characterPathway === 'The Fool'
          ? 'Activas tu intuición de peligro y manipulas hilos astrales para desviar el ataque.'
          : 'Proyectas una onda de desasosiego que conmociona la mente de la sombra.'),
        ...prev
      ]);

      if (res.battleOver || res.isCombatOver) {
        setTimeout(() => {
          setResolutionOutcome(res.victory ? 'VICTORIA' : 'DERROTA_INCONSCIENTE');
          onRefreshCharacter?.();
        }, 1000);
      }
    } catch (err: any) {
      setCombatError(err.message || 'La canalización de la vía no pudo ser confirmada por el servidor.');
    }
  };

  const handleDodge = async () => {
    setCombatError(null);
    try {
      const res = await apiClient.executeCombatAction({
        characterId: activeCharId,
        actionType: 'MOVE'
      });
      setCombatLog(prev => [
        res.message || 'Te deslizas hacia la penumbra rompiendo la línea de ataque enemiga.',
        ...prev
      ]);
    } catch (err: any) {
      setCombatError(err.message || 'El movimiento evasivo no pudo ser confirmado.');
    }
  };

  const handleDisengage = async () => {
    setCombatError(null);
    try {
      const res = await apiClient.executeCombatAction({
        characterId: activeCharId,
        actionType: 'FLEE'
      });
      if (res?.status === 'FLED' || res?.isCombatOver) {
        setResolutionOutcome('HUIDA');
      } else {
        setCombatLog(prev => [res?.message || 'No fue posible romper el contacto con el enemigo.', ...prev]);
      }
    } catch (err: any) {
      setCombatError(err.message || 'No fue posible romper el contacto táctico.');
    }
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
            onClick={hasActiveBattle ? handleDisengage : onBackToDesk}
            className="p-2 bg-[#171410] border border-[#383024] hover:border-[#8c733e] text-[#d4af37] rounded flex items-center gap-2 text-sm font-serif transition-all"
          >
            <ArrowLeft size={16} />
            {hasActiveBattle ? 'Romper el Contacto' : 'Volver al Refugio'}
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

      {/* Alerta de Error Recuperable si el Servidor Rechaza */}
      {combatError && (
        <div className="mb-4 p-3 bg-[#2a0e0e] border border-[#dc2626] text-[#fca5a5] rounded text-xs flex items-center gap-2 font-serif">
          <AlertTriangle size={16} className="text-[#ef4444]" />
          <span>{combatError}</span>
        </div>
      )}

      {/* Contenido Central: Rejilla 5x7 o Preparación de Encuentro */}
      {!hasActiveBattle ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-[#14100c]/80 border border-[#383024] rounded backdrop-blur-sm max-w-xl mx-auto my-12">
          <h2 className="text-lg font-serif font-bold text-[#d4af37] mb-2">
            La Penumbra Aguarda en el Callejón
          </h2>
          <p className="text-xs text-[#a89885] font-serif leading-relaxed mb-6">
            El eco de pasos lejanos y el goteo constante de los aleros dominan la quietud. Ninguna criatura ha cruzado tu camino todavía, pero el aire huele a azufre y fango astral.
          </p>
          <button
            onClick={handleStartEncounter}
            disabled={isStartingBattle}
            className="px-6 py-2.5 bg-[#1b1510] border border-[#8c733e] hover:border-[#d4af37] text-[#d4af37] rounded font-serif text-sm transition-all shadow-lg flex items-center gap-2"
          >
            <Crosshair size={16} />
            {isStartingBattle ? 'Sondeando la Penumbra...' : 'Sondear la Penumbra (Iniciar Confrontación)'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-6 flex-1 mb-6">
          
          {/* Rejilla 7x5 de Tablero Táctico (GFX41, GFX44 & GFX45) */}
          <div className="col-span-7 flex flex-col items-center justify-center">
            <TacticalGrid
              combatants={combatants}
              selectedCell={selectedCell}
              onSelectCell={setSelectedCell}
              activeVfx={activeVfx}
              onVfxComplete={() => setActiveVfx(null)}
            />
            <div className="mt-2 text-[10px] text-[#8c733e] italic font-serif">
              Rejilla 5x7 de Adoquines Húmedos · Movimiento y Alcance Espacial Diegético
            </div>
          </div>

          {/* Panel Lateral: Percepción y Registro Táctico */}
          <div className="col-span-5 flex flex-col gap-4">
            
            {/* Estado del Enemigo percibido */}
            <div className="bg-[#12100d]/90 p-4 border border-[#2d2419] rounded shadow-lg backdrop-blur-sm">
              <div className="flex justify-between items-start border-b border-[#2d2419] pb-2 mb-2">
                <h3 className="font-serif font-bold text-sm text-[#f87171]">
                  {enemy.name}
                </h3>
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 bg-[#201c18] border border-[#3d3327] rounded text-[#d4af37]">
                  {enemy.opacityState}
                </span>
              </div>
              <p className="text-xs text-[#dcd1be] italic font-serif mb-2">
                "{enemy.vitalityDescription}"
              </p>
              <p className="text-xs text-[#a89885] font-serif mb-2">
                <strong>Postura:</strong> {enemy.stanceDescription}
              </p>
              {enemyWoundsCount > 0 && (
                <p className="text-xs text-[#f87171] font-serif mb-2">
                  <strong>Impactos percibidos:</strong> {enemyWoundsCount}
                </p>
              )}
              {enemy.revealedIntent && (
                <div className="mt-2 p-2 bg-[#2d1b19] border-l-2 border-[#dc2626] text-[11px] text-[#fca5a5] italic">
                  <strong>Intención Intuidas:</strong> {enemy.revealedIntent}
                </div>
              )}
            </div>

            {/* Crónica Táctica (Log de Acciones) */}
            <div className="bg-[#100e0b]/90 p-4 border border-[#2d2419] rounded flex-1 flex flex-col justify-between shadow-lg">
              <h4 className="text-xs font-serif font-bold text-[#8c733e] uppercase tracking-wider border-b border-[#2d2419] pb-1.5 mb-2">
                Crónica de la Escaramuza
              </h4>
              <div className="flex-1 overflow-y-auto space-y-2 pr-2 text-xs font-serif leading-relaxed text-[#c7bcab]">
                {combatLog.map((log, index) => (
                  <p key={index} className={index === 0 ? "text-[#f3ede2] font-semibold" : "opacity-80"}>
                    • {log}
                  </p>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* Barra Inferior: Acciones y Habilidades Tácticas */}
      {hasActiveBattle && (
        <footer className="bg-[#14120f]/95 p-4 rounded border border-[#2d2419] flex justify-between items-center shadow-xl">
          <div className="flex gap-3">
            
            {/* Acción 1: Disparo de Precisión (Consumo de Objeto Físico) */}
            <button
              onClick={handleShootRevolver}
              disabled={cartridgesInCylinder <= 0}
              className={`px-4 py-2.5 rounded border flex items-center gap-2 font-serif text-xs transition-all ${
                cartridgesInCylinder > 0
                  ? 'bg-[#1b1713] border-[#8c733e] text-[#f59e0b] hover:bg-[#2a221a] hover:border-[#f59e0b] shadow-md'
                  : 'bg-[#12100d] border-[#201c18] text-[#554b3f] cursor-not-allowed'
              }`}
            >
              <Crosshair size={16} />
              <div>
                <div className="font-bold">Disparo de Precisión</div>
                <div className="text-[10px] opacity-75">1 Bala de Plata · 1 PA</div>
              </div>
            </button>

            {/* Acción 2: Habilidad Sobrenatural de Secuencia 9 */}
            <button
              onClick={handlePathwayAbility}
              className="px-4 py-2.5 rounded border border-[#6b21a8] bg-[#1a1325] text-[#d8b4fe] hover:bg-[#271b38] hover:border-[#a855f7] flex items-center gap-2 font-serif text-xs transition-all shadow-md"
            >
              {characterPathway === 'The Fool' ? <Brain size={16} /> : <Zap size={16} />}
              <div>
                <div className="font-bold">
                  {characterPathway === 'The Fool' ? 'Manipular Hilos de Azar' : 'Intimidación Psíquica'}
                </div>
                <div className="text-[10px] opacity-75">Aliento Espiritual · 1 PA</div>
              </div>
            </button>

            {/* Acción 3: Visión Espiritual (Scrutinize) */}
            <button
              onClick={handleInspectWithSpiritVision}
              className="px-4 py-2.5 rounded border border-[#1e3a5f] bg-[#0f172a] text-[#7dd3fc] hover:bg-[#1e293b] hover:border-[#38bdf8] flex items-center gap-2 font-serif text-xs transition-all shadow-md"
            >
              <Eye size={16} />
              <div>
                <div className="font-bold">Descifrar Aura (Visión Espiritual)</div>
                <div className="text-[10px] opacity-75">Revela intenciones y debilidades</div>
              </div>
            </button>

            {/* Acción 4: Maniobra Evasiva (Movimiento) */}
            <button
              onClick={handleDodge}
              className="px-4 py-2.5 rounded border border-[#2d2419] bg-[#171410] text-[#a89885] hover:bg-[#201c18] hover:text-[#d4af37] flex items-center gap-2 font-serif text-xs transition-all shadow-md"
            >
              <Shield size={16} />
              <div>
                <div className="font-bold">Desplazarse a Cubierto</div>
                <div className="text-[10px] opacity-75">1 PA · Cambia posición táctica</div>
              </div>
            </button>

          </div>

          <div>
            <button
              onClick={handleDisengage}
              className="px-4 py-2 bg-[#201414] border border-[#522525] hover:border-[#991b1b] text-[#fca5a5] rounded font-serif text-xs transition-all"
            >
              Romper Contacto (Flee)
            </button>
          </div>
        </footer>
      )}

      {/* Overlay de Desenlace Táctico */}
      {resolutionOutcome && (
        <TacticalResolutionOverlay
          outcome={resolutionOutcome}
          onConfirm={() => {
            setResolutionOutcome(null);
            onBackToDesk();
          }}
        />
      )}

    </div>
  );
};
