import React, { useState } from 'react';
import { 
  Crosshair, Sparkles, Footprints, Skull, AlertTriangle, 
  Eye, Wand2, ShieldAlert, Globe, Crown 
} from 'lucide-react';

export interface CombatMonster {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  sequence: number;
  description: string;
  threatLevel?: string;
  dropItems?: string[];
  outerDeity?: string;
}

export interface ConceptualSpell {
  id: string;
  name: string;
  pathway: string;
  minSequence: number;
  spiritualityCost: number;
  sanityCost: number;
  description: string;
  effectType: string;
}

export interface MythicalState {
  unlocked: boolean;
  isActive: boolean;
  formName: string;
  description: string;
  spiritualityCostPerTurn?: number;
  sanityStrainPerActivation?: number;
  anchorsRequirementPercent?: number;
}

interface TacticalCombatTheaterProps {
  monster: CombatMonster | null;
  combatLog: string[];
  playerSanity: number;
  playerSpirituality?: number;
  playerSequence?: number;
  mythicalState?: MythicalState;
  conceptualSpells?: ConceptualSpell[];
  cosmicGazeIndex?: number;
  isSpiritVisionActive?: boolean;
  inventoryItems?: any[];
  onCombatAction: (action: string, skillName?: string, itemId?: string) => Promise<any>;
  onTriggerCosmicRaid?: () => Promise<any>;
  onReturnToExploration?: () => void;
}

export const TacticalCombatTheater: React.FC<TacticalCombatTheaterProps> = ({
  monster,
  combatLog,
  playerSanity,
  playerSpirituality = 100,
  playerSequence = 9,
  mythicalState,
  conceptualSpells = [],
  cosmicGazeIndex = 18,
  isSpiritVisionActive = false,
  inventoryItems = [],
  onCombatAction,
  onTriggerCosmicRaid,
  onReturnToExploration
}) => {
  const [selectedTab, setSelectedTab] = useState<'ACTIONS' | 'CONCEPTUAL' | 'ITEMS'>('ACTIONS');

  if (!monster) {
    return (
      <div className="card-frame" style={{ padding: '36px', textAlign: 'center', maxWidth: '680px', margin: '0 auto' }}>
        <div className="brass-dial" style={{ width: '64px', height: '64px', margin: '0 auto 16px auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Crosshair size={32} color="var(--gold)" />
        </div>
        <h3 className="cinzel" style={{ color: 'var(--gold)', marginBottom: '8px' }}>
          La Niebla está Calma
        </h3>
        <p style={{ color: '#a89c89', fontSize: '0.9rem', lineHeight: 1.5 }}>
          No hay presencias sobrenaturales manifestándose en tu vecindad inmediata. Puedes explorar los distritos oscuros de Backlund o desafiar una fisura con las Deidades Exteriores.
        </p>

        {/* Panel de Incursión Cósmica Opcional */}
        <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(20, 10, 30, 0.6)', border: '1px solid #7c3aed', borderRadius: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
            <Globe size={18} color="#c084fc" />
            <strong style={{ color: '#e9d5ff', fontSize: '0.92rem' }}>
              Vigilancia Astral del Cosmos Exterior ({cosmicGazeIndex}/100)
            </strong>
          </div>
          <p style={{ fontSize: '0.8rem', color: '#c4b5fd', margin: '0 0 12px 0' }}>
            Las grietas en la barrera terrestre susurran nombres prohibidos (*Circle of Inevitability*, *Mother Tree of Desire*).
          </p>
          {onTriggerCosmicRaid && (
            <button
              onClick={onTriggerCosmicRaid}
              className="action-tab-btn active"
              style={{ background: '#581c87', borderColor: '#a855f7', color: '#f3e8ff', padding: '8px 18px', fontSize: '0.85rem' }}
            >
              <Globe size={14} /> Desafiar Incursión de Dioses Exteriores
            </button>
          )}
        </div>

        {onReturnToExploration && (
          <button
            onClick={onReturnToExploration}
            className="action-tab-btn active"
            style={{ marginTop: '20px', display: 'inline-flex' }}
          >
            Regresar a la Ciudad
          </button>
        )}
      </div>
    );
  }

  const hpPercent = Math.max(0, Math.min(100, Math.round((monster.hp / (monster.maxHp || 60)) * 100)));
  const isMonsterCritical = hpPercent < 30;
  const isPlayerCritical = playerSanity < 40;
  const isCosmicBoss = !!monster.outerDeity;
  const isDemigod = playerSequence <= 4;
  const isMythicalActive = mythicalState?.isActive ?? false;

  return (
    <div
      className="card-frame"
      style={{
        maxWidth: '880px',
        margin: '0 auto',
        padding: '24px',
        border: isCosmicBoss ? '2px solid #a855f7' : isMythicalActive ? '2px solid #eab308' : '2px solid var(--crimson)',
        boxShadow: isCosmicBoss 
          ? '0 0 50px rgba(168, 85, 247, 0.4)' 
          : isMythicalActive
          ? '0 0 50px rgba(234, 179, 8, 0.45)'
          : '0 0 40px rgba(133, 28, 34, 0.45)',
        position: 'relative'
      }}
    >
      {/* Cabecera del Encuentro */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #4a2125', paddingBottom: '12px', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isCosmicBoss ? <Globe size={24} color="#c084fc" /> : <Skull size={24} color={isMythicalActive ? '#facc15' : 'var(--crimson)'} />}
          <div>
            <h2 className="cinzel" style={{ color: isCosmicBoss ? '#e9d5ff' : '#fda4af', fontSize: '1.25rem', letterSpacing: '1px', margin: 0 }}>
              {isCosmicBoss ? 'INCURSIÓN CÓSMICA EN BACKLUND' : 'TEATRO DE COMBATE OCULTISTA'}
            </h2>
            <div style={{ fontSize: '0.75rem', color: '#a89c89' }}>
              Espiritualidad: <strong style={{ color: '#60a5fa' }}>{playerSpirituality}</strong> | Cordura: <strong style={{ color: isPlayerCritical ? '#ef4444' : '#6ee7b7' }}>{playerSanity}%</strong>
            </div>
          </div>
        </div>

        {/* Botón de Visión Espiritual */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => onCombatAction('SPIRIT_VISION_TOGGLE')}
            className={`action-tab-btn ${isSpiritVisionActive ? 'active' : ''}`}
            style={{ 
              borderColor: isSpiritVisionActive ? '#3b82f6' : '#64748b', 
              color: isSpiritVisionActive ? '#93c5fd' : '#cbd5e1',
              padding: '6px 12px', 
              fontSize: '0.8rem' 
            }}
            title="Ver los colores del aura astral y debilidades místicas"
          >
            <Eye size={14} />
            <span>{isSpiritVisionActive ? 'Visión Espiritual Activa' : 'Activar Visión Espiritual'}</span>
          </button>

          <span className="gold-badge" style={{ borderColor: isCosmicBoss ? '#a855f7' : 'var(--crimson)', color: isCosmicBoss ? '#c084fc' : '#fca5a5' }}>
            {isCosmicBoss ? 'Amenaza Exterior' : 'Encuentro Sobrenatural'}
          </span>
        </div>
      </div>

      {/* Alerta de Cordura Crítica */}
      {isPlayerCritical && (
        <div style={{ background: 'rgba(133, 28, 34, 0.3)', border: '1px solid var(--crimson)', padding: '8px 12px', borderRadius: '4px', marginBottom: '14px', fontSize: '0.8rem', color: '#fca5a5', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <AlertTriangle size={16} color="#ef4444" />
          <span>¡Cordura Crítica ({playerSanity}%)! Los murmullos de la locura y los ecos del Creador Original amenazan tu humanidad.</span>
        </div>
      )}

      {/* Tarjeta Visual del Monstruo / Aberración */}
      <div
        style={{
          background: isSpiritVisionActive
            ? 'linear-gradient(180deg, #101c2e 0%, #080f1a 100%)'
            : isCosmicBoss
            ? 'linear-gradient(180deg, #241133 0%, #0d0614 100%)'
            : 'linear-gradient(180deg, #1f1416 0%, #12090b 100%)',
          border: isSpiritVisionActive ? '1px solid #3b82f6' : isCosmicBoss ? '1px solid #9333ea' : '1px solid #5a252a',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '16px',
          display: 'grid',
          gridTemplateColumns: '120px 1fr',
          gap: '20px',
          alignItems: 'center'
        }}
      >
        <div
          style={{
            width: '120px',
            height: '120px',
            background: isCosmicBoss ? 'radial-gradient(circle, #581c87 0%, #0f051d 100%)' : 'radial-gradient(circle, #3d1418 0%, #0d0405 100%)',
            border: isCosmicBoss ? '2px double #c084fc' : '2px double #851c22',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'inset 0 0 15px rgba(0,0,0,0.8)'
          }}
        >
          {isCosmicBoss ? <Globe size={52} color="#c084fc" /> : <Skull size={52} color="var(--crimson)" />}
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '6px' }}>
            <div>
              <h3 style={{ color: '#fff', fontSize: '1.35rem', fontWeight: 'bold', margin: '0 0 4px 0' }}>{monster.name}</h3>
              <div style={{ fontSize: '0.82rem', color: '#c4b59a' }}>
                Rango Místico: <strong style={{ color: 'var(--gold)' }}>Secuencia {monster.sequence}</strong> • {isCosmicBoss ? `Deidad: ${monster.outerDeity}` : `Amenaza: ${monster.threatLevel || 'Alta'}`}
              </div>
            </div>
            <span
              style={{
                fontSize: '0.82rem',
                fontWeight: 'bold',
                padding: '3px 8px',
                borderRadius: '3px',
                background: '#2b1013',
                color: isMonsterCritical ? '#ef4444' : '#f59e0b',
                border: '1px solid #732228'
              }}
            >
              {monster.hp} / {monster.maxHp} HP
            </span>
          </div>

          {/* Barra de Vida */}
          <div style={{ height: '10px', background: '#260e11', borderRadius: '4px', overflow: 'hidden', margin: '10px 0 8px 0', border: '1px solid #4a191d' }}>
            <div
              style={{
                width: `${hpPercent}%`,
                height: '100%',
                background: isMonsterCritical
                  ? 'linear-gradient(90deg, #dc2626, #b91c1c)'
                  : isCosmicBoss
                  ? 'linear-gradient(90deg, #9333ea, #c084fc)'
                  : 'linear-gradient(90deg, #ef4444, #f59e0b)',
                transition: 'width 0.4s ease'
              }}
            />
          </div>

          <p style={{ fontSize: '0.85rem', fontStyle: 'italic', color: isSpiritVisionActive ? '#93c5fd' : '#c7baa5', lineHeight: 1.4, margin: 0 }}>
            "{monster.description}"
          </p>
        </div>
      </div>

      {/* BANNER DE LA FORMA DE CRIATURA MÍTICA (SEMIDIOSES S4+) */}
      {isDemigod && (
        <div style={{ 
          marginBottom: '16px', 
          padding: '14px', 
          background: isMythicalActive ? 'rgba(234, 179, 8, 0.15)' : 'rgba(30, 20, 10, 0.6)', 
          border: isMythicalActive ? '1px solid #eab308' : '1px solid #854d0e', 
          borderRadius: '6px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Crown size={18} color="#facc15" />
              <strong style={{ color: '#fef08a', fontSize: '0.95rem' }}>
                Forma de Criatura Mítica de Semidiós: [{mythicalState?.formName || 'Cuerpo Divino'}]
              </strong>
            </div>
            <div style={{ fontSize: '0.78rem', color: '#fef9c3', marginTop: '2px' }}>
              {isMythicalActive 
                ? '✨ MANIFESTACIÓN ACTIVA: Daño cósmico x3.2, pavor existencial en enemigos menores (-25 espíritu/turno).'
                : 'Forma humana convencional. Puedes liberar la divinidad para pulverizar al oponente.'}
            </div>
          </div>

          <button
            onClick={() => onCombatAction(isMythicalActive ? 'MYTHICAL_FORM_DEACTIVATE' : 'MYTHICAL_FORM_ACTIVATE')}
            className="action-tab-btn active"
            style={{
              background: isMythicalActive ? '#854d0e' : '#ca8a04',
              borderColor: '#facc15',
              color: '#000',
              fontWeight: 'bold',
              padding: '8px 16px',
              fontSize: '0.85rem'
            }}
          >
            <Sparkles size={16} />
            <span>{isMythicalActive ? 'Revertir a Forma Humana' : 'Desatar Criatura Mítica'}</span>
          </button>
        </div>
      )}

      {/* Selector de Pestañas de Acción Táctica */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
        <button
          onClick={() => setSelectedTab('ACTIONS')}
          className={`action-tab-btn ${selectedTab === 'ACTIONS' ? 'active' : ''}`}
          style={{ padding: '6px 14px', fontSize: '0.82rem' }}
        >
          <Crosshair size={14} /> Acciones Básicas
        </button>
        <button
          onClick={() => setSelectedTab('CONCEPTUAL')}
          className={`action-tab-btn ${selectedTab === 'CONCEPTUAL' ? 'active' : ''}`}
          style={{ padding: '6px 14px', fontSize: '0.82rem', borderColor: '#a855f7' }}
        >
          <Wand2 size={14} color="#c084fc" /> Poderes Conceptuales de Vía ({conceptualSpells.length})
        </button>
        <button
          onClick={() => setSelectedTab('ITEMS')}
          className={`action-tab-btn ${selectedTab === 'ITEMS' ? 'active' : ''}`}
          style={{ padding: '6px 14px', fontSize: '0.82rem' }}
        >
          <ShieldAlert size={14} /> Consumibles ({inventoryItems.filter(i => i.type === 'CONSUMABLE').length})
        </button>
      </div>

      {/* PESTAÑA 1: ACCIONES BÁSICAS */}
      {selectedTab === 'ACTIONS' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
          <button
            onClick={() => onCombatAction('ATTACK')}
            className="crimson-btn"
            style={{ padding: '14px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}
          >
            <Crosshair size={20} />
            <span style={{ fontSize: '0.95rem' }}>Disparo de Revólver</span>
            <span style={{ fontSize: '0.72rem', color: '#ffd700' }}>Daño Físico Convencional</span>
          </button>

          <button
            onClick={() => onCombatAction('SKILL')}
            className="action-tab-btn"
            style={{ padding: '14px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', background: '#1c1524', borderColor: '#8b5cf6' }}
          >
            <Sparkles size={20} color="#c084fc" />
            <span style={{ fontSize: '0.95rem', color: '#e9d5ff' }}>Canalización de Vía</span>
            <span style={{ fontSize: '0.72rem', color: '#a855f7' }}>Espíritu & Daño Místico</span>
          </button>

          <button
            onClick={() => onCombatAction('FLEE')}
            className="action-tab-btn"
            style={{ padding: '14px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}
          >
            <Footprints size={20} color="#9ca3af" />
            <span style={{ fontSize: '0.95rem' }}>Huir a la Niebla</span>
            <span style={{ fontSize: '0.72rem', color: '#9ca3af' }}>Retirada Táctica</span>
          </button>
        </div>
      )}

      {/* PESTAÑA 2: PODERES CONCEPTUALES POR VÍA */}
      {selectedTab === 'CONCEPTUAL' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '10px', marginBottom: '16px' }}>
          {conceptualSpells.length === 0 ? (
            <p style={{ color: '#aaa', fontSize: '0.85rem' }}>No hay trucos conceptuales registrados para tu vía actual.</p>
          ) : (
            conceptualSpells.map(spell => (
              <button
                key={spell.id}
                onClick={() => onCombatAction('CONCEPTUAL_SPELL', spell.id)}
                className="action-tab-btn"
                style={{ 
                  padding: '12px', 
                  textAlign: 'left', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '4px',
                  background: '#13111c',
                  borderColor: '#a855f7'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ color: '#e9d5ff', fontSize: '0.88rem' }}>{spell.name}</strong>
                  <span className="gold-badge" style={{ fontSize: '0.7rem', borderColor: '#7e22ce' }}>-{spell.spiritualityCost} Esp</span>
                </div>
                <div style={{ fontSize: '0.76rem', color: '#c4b5fd', lineHeight: 1.35 }}>
                  {spell.description}
                </div>
              </button>
            ))
          )}
        </div>
      )}

      {/* PESTAÑA 3: CONSUMIBLES EN INVENTARIO */}
      {selectedTab === 'ITEMS' && (
        <div style={{ marginBottom: '16px' }}>
          {(() => {
            const consumables = inventoryItems.filter(i => i.type === 'CONSUMABLE' && (i.quantity || 1) > 0);
            if (consumables.length === 0) {
              return <p style={{ color: '#aaa', fontSize: '0.85rem' }}>No posees consumibles de combate en la mochila.</p>;
            }

            return (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {consumables.map(item => (
                  <button
                    key={item.id}
                    onClick={() => onCombatAction('ITEM', undefined, item.id)}
                    className="action-tab-btn"
                    style={{ fontSize: '0.82rem', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '8px', borderColor: '#f59e0b' }}
                  >
                    <span style={{ color: '#fbbf24', fontWeight: 'bold' }}>{item.name}</span>
                    <span style={{ background: '#3b2f20', color: '#fef3c7', padding: '2px 6px', borderRadius: '3px', fontSize: '0.72rem' }}>
                      x{item.quantity || 1}
                    </span>
                  </button>
                ))}
              </div>
            );
          })()}
        </div>
      )}

      {/* Crónica del Enfrentamiento (Log Cinemático) */}
      <div className="parchment-sheet" style={{ padding: '14px', maxHeight: '190px', overflowY: 'auto' }}>
        <div style={{ fontSize: '0.78rem', fontWeight: 'bold', color: '#594430', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>
          📜 Crónica del Enfrentamiento Ocultista:
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {combatLog.map((entry, idx) => (
            <div key={idx} style={{ fontSize: '0.82rem', color: '#2a2016', lineHeight: 1.35, borderBottom: '1px dotted #d1c5b0', paddingBottom: '3px' }}>
              • {entry}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
