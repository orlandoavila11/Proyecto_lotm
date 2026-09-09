import React, { useState, useEffect } from 'react';
import {
  Globe,
  ShieldAlert,
  Flame,
  Wheat,
  TrendingUp,
  Flag,
  Crosshair
} from 'lucide-react';

export interface ContinentalPower {
  id: string;
  name: string;
  sovereign: string;
  orthodoxChurches: string[];
  militaryReadiness: number;
  warEnthusiasm: number;
  coalAndGrainReserves: number;
  dominantPathways: string[];
  currentStanceTowardsLoen: 'ALLY' | 'NEUTRAL' | 'FRICTION' | 'HOSTILE' | 'WAR';
  description: string;
}

export interface GeopoliticalIncident {
  id: string;
  title: string;
  originCountryId: string;
  targetCountryId: string;
  description: string;
  tensionDelta: number;
  occurredDay: number;
  isResolved: boolean;
  publicHeadline: string;
}

export interface CovertOperation {
  id: string;
  title: string;
  targetPowerId: string;
  type: string;
  description: string;
  requiredPounds: number;
  requiredSpirituality: number;
  tensionModifier: number;
  rewardPounds: number;
  reputationLoen: number;
  riskPercentage: number;
}

export interface PoliticsState {
  warTensionIndex: number;
  currentWarPhase: 'DIPLOMATIC_STANDOFF' | 'BORDER_SKIRMISHES' | 'NAVAL_BLOCKADE' | 'TOTAL_WAR';
  powers: ContinentalPower[];
  activeIncidents: GeopoliticalIncident[];
  economicModifiers: {
    coalPriceMultiplier: number;
    grainPriceMultiplier: number;
    potionIngredientInflation: number;
    loenRationingActive: boolean;
  };
  backlundAtmosphere: string;
}

interface ContinentalPoliticsViewProps {
  walletPounds: number;
  playerSpirituality: number;
  onRefreshState: () => void;
  onNotice: (title: string, body: string) => void;
}

export const ContinentalPoliticsView: React.FC<ContinentalPoliticsViewProps> = ({
  walletPounds,
  playerSpirituality,
  onRefreshState,
  onNotice
}) => {
  const [politicsState, setPoliticsState] = useState<PoliticsState | null>(null);
  const [operations, setOperations] = useState<CovertOperation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [executingOpId, setExecutingOpId] = useState<string | null>(null);

  const fetchPolitics = async () => {
    try {
      const res = await fetch('/api/politics/state');
      if (res.ok) {
        const data = await res.json();
        setPoliticsState(data.state);
        setOperations(data.availableOperations || []);
      }
    } catch (err) {
      console.error('Error fetching continental politics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolitics();
  }, []);

  const handleExecuteOp = async (opId: string) => {
    setExecutingOpId(opId);
    try {
      const res = await fetch('/api/politics/operation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ opId })
      });
      const data = await res.json();
      if (res.ok) {
        setPoliticsState(data.state);
        onRefreshState();
        onNotice('Operación Geopolítica Concluida', data.message);
      } else {
        onNotice('Fallo de Misión', data.message || 'Error en la operación.');
      }
    } catch (err) {
      console.error('Error executing operation:', err);
    } finally {
      setExecutingOpId(null);
    }
  };

  if (loading || !politicsState) {
    return (
      <div className="card-frame" style={{ padding: '30px', textAlign: 'center' }}>
        <p className="cinzel" style={{ color: 'var(--gold)' }}>Consultando los cables diplomáticos y despachos del Ministerio de Guerra...</p>
      </div>
    );
  }

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'DIPLOMATIC_STANDOFF': return '#4ade80';
      case 'BORDER_SKIRMISHES': return '#facc15';
      case 'NAVAL_BLOCKADE': return '#fb923c';
      case 'TOTAL_WAR': return '#ef4444';
      default: return 'var(--gold)';
    }
  };

  const getPhaseLabel = (phase: string) => {
    switch (phase) {
      case 'DIPLOMATIC_STANDOFF': return 'Paz Armada & Fricción Diplomática';
      case 'BORDER_SKIRMISHES': return 'Escaramuzas Fronterizas en el Mar de Sonia';
      case 'NAVAL_BLOCKADE': return 'Bloqueo Naval y Racionamiento de Guerra';
      case 'TOTAL_WAR': return '¡Guerra Total & Bombardeos de Dirigibles!';
      default: return phase;
    }
  };

  const getStanceBadge = (stance: string) => {
    switch (stance) {
      case 'ALLY': return <span style={{ color: '#4ade80', fontSize: '11px' }}>● Aliado de la Corona</span>;
      case 'NEUTRAL': return <span style={{ color: '#94a3b8', fontSize: '11px' }}>● Neutralidad Cautelosa</span>;
      case 'FRICTION': return <span style={{ color: '#facc15', fontSize: '11px' }}>● Fricción y Espionaje</span>;
      case 'HOSTILE': return <span style={{ color: '#fb923c', fontSize: '11px' }}>● Hostilidad Declarada</span>;
      case 'WAR': return <span style={{ color: '#ef4444', fontSize: '11px', fontWeight: 'bold' }}>⚔️ ESTADO DE GUERRA</span>;
      default: return null;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. RELOJ DE GUERRA CONTINENTAL */}
      <div className="card-frame" style={{ padding: '24px', background: 'radial-gradient(ellipse at top, #231d17 0%, #12100e 100%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Globe size={24} style={{ color: 'var(--gold)' }} />
            <div>
              <h2 className="cinzel" style={{ color: 'var(--gold)', margin: 0, fontSize: '18px' }}>
                TABLERO GEOPOLÍTICO DEL CONTINENTE NORTE
              </h2>
              <span style={{ fontSize: '12px', color: '#8c827a' }}>
                Tensiones entre el Reino de Loen, el Imperio de Feysac, la República de Intis y Fénapotris
              </span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#8c827a', display: 'block' }}>Fase Continental</span>
            <span style={{ color: getPhaseColor(politicsState.currentWarPhase), fontWeight: 'bold', fontSize: '14px' }} className="cinzel">
              {getPhaseLabel(politicsState.currentWarPhase)}
            </span>
          </div>
        </div>

        {/* Barra del Reloj de Tensión */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
            <span style={{ color: '#d5c3aa' }}>Índice de Tensión Bélica:</span>
            <span style={{ color: getPhaseColor(politicsState.currentWarPhase), fontWeight: 'bold' }}>
              {politicsState.warTensionIndex} / 100
            </span>
          </div>
          <div style={{ height: '10px', background: '#1c1915', borderRadius: '5px', overflow: 'hidden', border: '1px solid #3d352e' }}>
            <div
              style={{
                width: `${politicsState.warTensionIndex}%`,
                height: '100%',
                background: `linear-gradient(90deg, #4ade80 0%, #facc15 40%, #fb923c 70%, #ef4444 100%)`,
                transition: 'width 0.5s ease-in-out'
              }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#6e6259', marginTop: '4px' }}>
            <span>0 (Paz Armada)</span>
            <span>30 (Escaramuzas)</span>
            <span>60 (Bloqueo)</span>
            <span>80+ (Guerra Total)</span>
          </div>
        </div>

        {/* Resonancia en Backlund */}
        <div style={{ padding: '12px', background: '#151310', borderLeft: `3px solid ${getPhaseColor(politicsState.currentWarPhase)}`, borderRadius: '4px' }}>
          <span style={{ fontSize: '11px', color: 'var(--gold)', fontWeight: 'bold', display: 'block', marginBottom: '3px' }}>
            ATMÓSFERA EN LAS CALLES DE BACKLUND:
          </span>
          <p style={{ margin: 0, fontSize: '13px', color: '#d5c3aa', fontStyle: 'italic', lineHeight: '1.4' }}>
            "{politicsState.backlundAtmosphere}"
          </p>
        </div>
      </div>

      {/* 2. BARÓMETRO ECONÓMICO DERIVADO DEL CONFLICTO */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px' }}>
        <div className="card-frame" style={{ padding: '15px', background: '#161412' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#d5c3aa', marginBottom: '6px' }}>
            <Flame size={16} style={{ color: '#fb923c' }} />
            <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Precio del Carbón a Vapor</span>
          </div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: politicsState.economicModifiers.coalPriceMultiplier > 1 ? '#fb923c' : 'var(--gold)' }}>
            x{politicsState.economicModifiers.coalPriceMultiplier.toFixed(2)}
          </div>
          <span style={{ fontSize: '10px', color: '#8c827a' }}>Afecta industrias de vapor y calefacción</span>
        </div>

        <div className="card-frame" style={{ padding: '15px', background: '#161412' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#d5c3aa', marginBottom: '6px' }}>
            <Wheat size={16} style={{ color: '#facc15' }} />
            <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Precio del Trigo y Pan</span>
          </div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: politicsState.economicModifiers.grainPriceMultiplier > 1 ? '#ef4444' : 'var(--gold)' }}>
            x{politicsState.economicModifiers.grainPriceMultiplier.toFixed(2)}
          </div>
          <span style={{ fontSize: '10px', color: '#8c827a' }}>Determina la hambruna y disturbios en East Borough</span>
        </div>

        <div className="card-frame" style={{ padding: '15px', background: '#161412' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#d5c3aa', marginBottom: '6px' }}>
            <TrendingUp size={16} style={{ color: '#a855f7' }} />
            <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Inflación Ingredientes Ocultos</span>
          </div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--gold)' }}>
            +{Math.round((politicsState.economicModifiers.potionIngredientInflation - 1) * 100)}%
          </div>
          <span style={{ fontSize: '10px', color: '#8c827a' }}>Recargo en boticarios y mercados negros</span>
        </div>

        <div className="card-frame" style={{ padding: '15px', background: '#161412' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#d5c3aa', marginBottom: '6px' }}>
            <ShieldAlert size={16} style={{ color: politicsState.economicModifiers.loenRationingActive ? '#ef4444' : '#4ade80' }} />
            <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Racionamiento en Loen</span>
          </div>
          <div style={{ fontSize: '16px', fontWeight: 'bold', color: politicsState.economicModifiers.loenRationingActive ? '#ef4444' : '#4ade80' }} className="cinzel">
            {politicsState.economicModifiers.loenRationingActive ? 'CARTILLAS ACTIVAS' : 'MERCADO LIBRE'}
          </div>
          <span style={{ fontSize: '10px', color: '#8c827a' }}>Decreto de la Casa Real Augustus</span>
        </div>
      </div>

      {/* 3. LAS CUATRO POTENCIAS DEL NORTE */}
      <div className="card-frame" style={{ padding: '20px' }}>
        <h3 className="cinzel" style={{ color: 'var(--gold)', marginTop: 0, marginBottom: '15px', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Flag size={18} /> ESTADO DE LAS POTENCIAS CONTINENTALES
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '15px' }}>
          {politicsState.powers.map(power => (
            <div
              key={power.id}
              className="card-frame"
              style={{
                padding: '16px',
                background: '#151310',
                borderTop: power.id === 'COUN_LOEN' ? '3px solid var(--gold)' : power.id === 'COUN_FEYSAC' ? '3px solid #ef4444' : '3px solid #3d352e'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                <h4 className="cinzel" style={{ color: 'var(--gold)', margin: 0, fontSize: '14px' }}>
                  {power.name}
                </h4>
                {getStanceBadge(power.currentStanceTowardsLoen)}
              </div>

              <span style={{ fontSize: '11px', color: '#8c827a', display: 'block', marginBottom: '8px' }}>
                {power.sovereign}
              </span>

              <p style={{ fontSize: '12px', color: '#b5a897', margin: '0 0 10px 0', lineHeight: '1.3' }}>
                {power.description}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px', color: '#8c827a', borderTop: '1px solid #28231d', paddingTop: '8px' }}>
                <div>
                  <span style={{ color: '#d5c3aa' }}>Alistamiento Militar:</span> {power.militaryReadiness}%
                </div>
                <div>
                  <span style={{ color: '#d5c3aa' }}>Entusiasmo Bélico:</span> {power.warEnthusiasm}%
                </div>
                <div>
                  <span style={{ color: '#d5c3aa' }}>Reservas Estratégicas:</span> {power.coalAndGrainReserves}%
                </div>
                <div>
                  <span style={{ color: '#d5c3aa' }}>Vías Clave:</span> {power.dominantPathways.join(', ')}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. OPERACIONES ENCUBIERTAS & DIPLOMACIA CLANDESTINA */}
      <div className="card-frame" style={{ padding: '20px' }}>
        <h3 className="cinzel" style={{ color: 'var(--gold)', marginTop: 0, marginBottom: '6px', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Crosshair size={18} /> OPERACIONES CLANDESTINAS EN EL TABLERO DE GUERRA
        </h3>
        <p style={{ fontSize: '12px', color: '#8c827a', margin: '0 0 15px 0' }}>
          Intervén en las sombras para calmar o avivar las llamas de la guerra continental, alterando el reloj bélico y ganando recompensas de las coronas.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '15px' }}>
          {operations.map(op => {
            const canAffordMoney = walletPounds >= op.requiredPounds;
            const canAffordSpirit = playerSpirituality >= op.requiredSpirituality;
            const canExecute = canAffordMoney && canAffordSpirit;

            return (
              <div
                key={op.id}
                className="card-frame"
                style={{
                  padding: '16px',
                  background: '#161412',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                    <h4 className="cinzel" style={{ color: 'var(--gold)', margin: 0, fontSize: '13px' }}>
                      {op.title}
                    </h4>
                    <span
                      style={{
                        fontSize: '10px',
                        padding: '2px 6px',
                        borderRadius: '3px',
                        background: op.tensionModifier < 0 ? '#14532d' : '#7f1d1d',
                        color: op.tensionModifier < 0 ? '#86efac' : '#fca5a5'
                      }}
                    >
                      {op.tensionModifier > 0 ? `+${op.tensionModifier} Tensión` : `${op.tensionModifier} Tensión`}
                    </span>
                  </div>

                  <p style={{ fontSize: '12px', color: '#b5a897', margin: '0 0 12px 0', lineHeight: '1.4' }}>
                    {op.description}
                  </p>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', fontSize: '11px', marginBottom: '12px' }}>
                    <span style={{ color: canAffordMoney ? '#d5c3aa' : '#ef4444' }}>
                      Coste: £{op.requiredPounds} Libras
                    </span>
                    <span style={{ color: canAffordSpirit ? '#38bdf8' : '#ef4444' }}>
                      Espiritualidad: {op.requiredSpirituality} pts
                    </span>
                    <span style={{ color: '#4ade80' }}>
                      Recompensa: £{op.rewardPounds} Libras
                    </span>
                    <span style={{ color: '#fb923c' }}>
                      Riesgo de Falla: {op.riskPercentage}%
                    </span>
                  </div>
                </div>

                <button
                  className="vintage-button"
                  disabled={!canExecute || executingOpId === op.id}
                  onClick={() => handleExecuteOp(op.id)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    fontSize: '12px',
                    opacity: canExecute ? 1 : 0.5,
                    cursor: canExecute ? 'pointer' : 'not-allowed'
                  }}
                >
                  {executingOpId === op.id ? 'Ejecutando Operación...' : 'Desplegar Operación Encubierta'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. BOLETINES DIPLOMÁTICOS RECIENTES */}
      {politicsState.activeIncidents && politicsState.activeIncidents.length > 0 && (
        <div className="card-frame" style={{ padding: '16px', background: '#12100e' }}>
          <h4 className="cinzel" style={{ color: 'var(--gold)', margin: '0 0 10px 0', fontSize: '13px' }}>
            DESPACHOS CABLEGRÁFICOS RECIENTES
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {politicsState.activeIncidents.map(inc => (
              <div key={inc.id} style={{ padding: '8px 12px', background: '#181512', borderLeft: '2px solid var(--gold)', fontSize: '12px' }}>
                <span style={{ color: 'var(--gold)', fontWeight: 'bold' }}>[Día {inc.occurredDay}] {inc.title}:</span>{' '}
                <span style={{ color: '#d5c3aa' }}>{inc.description}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
