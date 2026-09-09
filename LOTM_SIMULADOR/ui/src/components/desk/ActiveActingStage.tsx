import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  AlertTriangle,
  CheckCircle,
  Coins,
  Eye,
  RotateCcw
} from 'lucide-react';

interface ActingDilemmaChoice {
  id: string;
  label: string;
  description: string;
  isAlignedWithPrinciples: boolean;
  digestionGain: number;
  sanityDelta: number;
  corruptionDelta: number;
  suspicionDelta: number;
  rewardPounds?: number;
  narrativeFeedback: string;
  mysticalBacklashNarrative?: string;
}

interface ActingDilemma {
  id: string;
  pathway: string;
  sequence: number;
  sequenceName: string;
  clientOrContext: string;
  situationDescription: string;
  actingPrincipleUnderlying: string;
  choices: ActingDilemmaChoice[];
}

interface ActiveActingStageProps {
  snapshot: any;
  onRefreshState: () => void;
  onOpenNotice: (title: string, body: string) => void;
}

export const ActiveActingStage: React.FC<ActiveActingStageProps> = ({
  snapshot,
  onRefreshState,
  onOpenNotice
}) => {
  const [dilemmas, setDilemmas] = useState<ActingDilemma[]>([]);
  const [selectedDilemma, setSelectedDilemma] = useState<ActingDilemma | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [lastResult, setLastResult] = useState<any | null>(null);
  const [resolving, setResolving] = useState<boolean>(false);

  const fetchDilemmas = async () => {
    setLoading(true);
    setLastResult(null);
    try {
      const res = await fetch('/api/acting/dilemmas');
      if (res.ok) {
        const data = await res.json();
        const list: ActingDilemma[] = data.dilemmas || [];
        setDilemmas(list);
        if (list.length > 0) {
          setSelectedDilemma(list[0]);
        } else {
          setSelectedDilemma(null);
        }
      }
    } catch (err) {
      console.error('Error cargando dilemas de actuación:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDilemmas();
  }, [snapshot.pathwayInfo.sequence, snapshot.pathwayInfo.pathway]);

  const handleResolveChoice = async (dilemmaId: string, choiceId: string) => {
    setResolving(true);
    try {
      const res = await fetch('/api/acting/dilemmas/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dilemmaId, choiceId })
      });
      const data = await res.json();
      setLastResult(data);
      if (data.isAligned) {
        onOpenNotice('Actuación Canónica Exitosa', data.narrativeMessage);
      } else {
        onOpenNotice('⚡ ¡REBOTE MÍSTICO (BACKLASH)!', data.narrativeMessage);
      }
      onRefreshState();
    } catch {
      onOpenNotice('Error', 'Fallo al procesar la elección de actuación.');
    } finally {
      setResolving(false);
    }
  };

  const principleText = snapshot.pathwayInfo.actingPrinciple ||
    selectedDilemma?.actingPrincipleUnderlying ||
    'Interpretar fielmente el rol cósmico de la poción en el mundo mundano.';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Banner Principal del Escenario de Actuación */}
      <div className="card-frame" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={22} color="var(--gold)" />
            <h2 className="cinzel" style={{ color: 'var(--gold)', fontSize: '1.25rem', margin: 0 }}>
              ESCENARIO DE ACTING ACTIVO & DIGESTIÓN REAL
            </h2>
            <span className="gold-badge" style={{ fontSize: '0.78rem' }}>
              {snapshot.pathwayInfo.sequenceName} • Vía {snapshot.pathwayInfo.pathway}
            </span>
          </div>

          <div className="parchment-sheet" style={{ marginTop: '12px', padding: '12px 16px', borderLeft: '4px solid var(--gold)' }}>
            <div style={{ fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#594430', fontWeight: 'bold' }}>
              📜 Ley de Actuación Deducida (Principio de la Senda):
            </div>
            <div style={{ fontSize: '0.95rem', fontStyle: 'italic', color: '#2a2218', marginTop: '3px', lineHeight: 1.4 }}>
              "{principleText}"
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
          <div style={{ fontSize: '0.82rem', color: '#cfc6b8' }}>
            Nivel de Digestión Actual: <strong style={{ color: '#6ee7b7', fontSize: '1rem' }}>{Math.round(snapshot.pathwayInfo.digestionPercentage)}%</strong>
          </div>
          <div style={{ width: '180px', height: '8px', background: '#251c14', borderRadius: '4px', overflow: 'hidden', border: '1px solid #4a3a28' }}>
            <div style={{ width: `${snapshot.pathwayInfo.digestionPercentage}%`, height: '100%', background: 'linear-gradient(90deg, #10b981, #d4af37)' }} />
          </div>
          <button onClick={fetchDilemmas} className="action-tab-btn" style={{ padding: '5px 10px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <RotateCcw size={12} />
            <span>Actualizar Dilemas</span>
          </button>
        </div>
      </div>

      {/* Alerta de Último Resultado (Rebote Místico o Digestión Exitosa) */}
      {lastResult && (
        <div
          className="card-frame"
          style={{
            padding: '16px',
            background: lastResult.isAligned ? '#121f17' : '#261214',
            borderColor: lastResult.isAligned ? '#10b981' : '#ef4444',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px'
          }}
        >
          {lastResult.isAligned ? (
            <CheckCircle size={24} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
          ) : (
            <AlertTriangle size={24} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
          )}
          <div style={{ flex: 1 }}>
            <strong style={{ color: lastResult.isAligned ? '#6ee7b7' : '#f87171', fontSize: '0.98rem' }}>
              {lastResult.isAligned ? '✨ Actuación en Perfecta Sintonía con la Poción' : '⚡ ¡Rebote Místico Desatado por Blasfemia Conceptual!'}
            </strong>
            <p style={{ margin: '4px 0 8px 0', fontSize: '0.86rem', color: '#f3ebd8', lineHeight: 1.4 }}>
              {lastResult.narrativeMessage}
            </p>
            <div style={{ display: 'flex', gap: '16px', fontSize: '0.78rem', color: '#cfc6b8' }}>
              {lastResult.isAligned && <span style={{ color: '#6ee7b7' }}>Digestión: +{lastResult.choiceTaken?.digestionGain}%</span>}
              <span style={{ color: lastResult.sanityDelta >= 0 ? '#6ee7b7' : '#fda4af' }}>
                Cordura: {lastResult.sanityDelta > 0 ? `+${lastResult.sanityDelta}` : lastResult.sanityDelta}
              </span>
              {lastResult.corruptionDelta > 0 && (
                <span style={{ color: '#f43f5e' }}>Corrupción: +{lastResult.corruptionDelta}%</span>
              )}
              {lastResult.poundsDelta > 0 && (
                <span style={{ color: 'var(--gold)' }}>Monedas Ganadas: +£{lastResult.poundsDelta}</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Selector de Dilemas si hay múltiples */}
      {dilemmas.length > 1 && (
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          {dilemmas.map((dil, idx) => (
            <button
              key={dil.id}
              onClick={() => { setSelectedDilemma(dil); setLastResult(null); }}
              className="action-tab-btn"
              style={{
                padding: '8px 14px',
                borderColor: selectedDilemma?.id === dil.id ? 'var(--gold)' : 'var(--card-border)',
                background: selectedDilemma?.id === dil.id ? '#2a2016' : '#181410'
              }}
            >
              <span>Escenario #{idx + 1}: {dil.clientOrContext}</span>
            </button>
          ))}
        </div>
      )}

      {/* Escenario de Decisión Activo */}
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--gold)' }}>
          Alineando frecuencias de destino con ciudadanos y clientes de Backlund...
        </div>
      ) : selectedDilemma ? (
        <div className="card-frame" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Presentación del Cliente y Contexto */}
          <div style={{ borderBottom: '1px solid #382c20', paddingBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Eye size={18} color="#38bdf8" />
              <span style={{ fontSize: '0.8rem', color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>
                Encuentro / Cliente en Backlund:
              </span>
              <strong style={{ color: '#f3ebd8', fontSize: '0.95rem' }}>{selectedDilemma.clientOrContext}</strong>
            </div>

            <p style={{ fontSize: '0.92rem', color: '#f3ebd8', lineHeight: 1.6, margin: '8px 0 0 0', background: '#14100c', padding: '14px', borderRadius: '4px', border: '1px solid #282016' }}>
              {selectedDilemma.situationDescription}
            </p>
          </div>

          {/* Opciones de Actuación: Aliniada vs Desviada */}
          <div>
            <div style={{ fontSize: '0.82rem', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px', fontWeight: 'bold' }}>
              ¿Cómo decides interpretar tu rol ante este dilema?
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px' }}>
              {selectedDilemma.choices.map((choice) => {
                const isChoiceAligned = choice.isAlignedWithPrinciples;

                return (
                  <div
                    key={choice.id}
                    className="card-frame"
                    style={{
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      background: '#191511',
                      borderColor: isChoiceAligned ? '#3b82f6' : '#991b1b',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 'bold',
                            padding: '3px 8px',
                            borderRadius: '3px',
                            background: isChoiceAligned ? '#1e3a8a' : '#450a0a',
                            color: isChoiceAligned ? '#93c5fd' : '#fca5a5'
                          }}
                        >
                          {isChoiceAligned ? 'Sintonizado con el Principio' : 'Desviación / Riesgo de Rebote'}
                        </span>

                        {choice.rewardPounds && choice.rewardPounds > 0 && (
                          <span style={{ fontSize: '0.76rem', color: 'var(--gold)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <Coins size={12} /> +£{choice.rewardPounds}
                          </span>
                        )}
                      </div>

                      <h4 style={{ color: '#f3ebd8', fontSize: '0.98rem', margin: '0 0 6px 0', lineHeight: 1.3 }}>
                        {choice.label}
                      </h4>

                      <p style={{ fontSize: '0.82rem', color: '#c4b59a', lineHeight: 1.4, margin: '0 0 12px 0' }}>
                        {choice.description}
                      </p>
                    </div>

                    <div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', fontSize: '0.75rem', color: '#a89c89', borderTop: '1px dotted #382c20', paddingTop: '8px', marginBottom: '12px' }}>
                        {isChoiceAligned ? (
                          <>
                            <span style={{ color: '#6ee7b7' }}>Digestión: +{choice.digestionGain}%</span>
                            <span style={{ color: '#6ee7b7' }}>Cordura: +{choice.sanityDelta}</span>
                            <span style={{ color: '#38bdf8' }}>Sospecha: {choice.suspicionDelta}%</span>
                          </>
                        ) : (
                          <>
                            <span style={{ color: '#fda4af' }}>Digestión: 0%</span>
                            <span style={{ color: '#fda4af' }}>Pérdida Cordura: {choice.sanityDelta}</span>
                            <span style={{ color: '#f43f5e' }}>Corrupción: +{choice.corruptionDelta}%</span>
                          </>
                        )}
                      </div>

                      <button
                        onClick={() => handleResolveChoice(selectedDilemma.id, choice.id)}
                        disabled={resolving}
                        className={isChoiceAligned ? 'crimson-btn' : 'action-tab-btn'}
                        style={{
                          width: '100%',
                          justifyContent: 'center',
                          padding: '9px',
                          fontSize: '0.85rem',
                          background: isChoiceAligned ? undefined : '#2e1214',
                          borderColor: isChoiceAligned ? undefined : '#7f1d1d',
                          color: isChoiceAligned ? undefined : '#fca5a5'
                        }}
                      >
                        {resolving ? 'Asimilando...' : isChoiceAligned ? 'Adoptar este Comportamiento' : 'Proceder a pesar del Peligro'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="card-frame" style={{ padding: '30px', textAlign: 'center', color: '#a89c89' }}>
          No hay dilemas activos en este momento para tu secuencia actual.
        </div>
      )}
    </div>
  );
};

