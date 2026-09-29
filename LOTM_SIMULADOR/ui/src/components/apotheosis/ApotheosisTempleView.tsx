import React, { useState, useEffect } from 'react';
import { 
  Crown, Sparkles, Eye, Shield, Feather, Globe, Flame, 
  Send, Zap, Clock, HeartHandshake
} from 'lucide-react';

interface ApotheosisTempleViewProps {
  playerSequence: number;
  playerPathway: string;
  anchorStrength: number;
  digestion: number;
  onRefreshState: () => void;
  onOpenNotice: (title: string, body: string) => void;
}

export const ApotheosisTempleView: React.FC<ApotheosisTempleViewProps> = ({
  playerSequence,
  playerPathway,
  anchorStrength,
  digestion,
  onRefreshState,
  onOpenNotice
}) => {
  const [activeSubtab, setActiveSubtab] = useState<'rituals' | 'prayers' | 'spiritworld' | 'divinewar'>('rituals');
  const [apotheosisData, setApotheosisData] = useState<any>(null);
  const [cultData, setCultData] = useState<any>(null);
  const [spiritData, setSpiritData] = useState<any>(null);
  const [warData, setWarData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Formulario de Nombre Honorífico
  const [line1, setLine1] = useState('');
  const [line2, setLine2] = useState('');
  const [line3, setLine3] = useState('');
  const [line4, setLine4] = useState('');

  // Mensajero
  const [recipient, setRecipient] = useState('');
  const [letterContent, setLetterContent] = useState('');
  const [selectedContractId, setSelectedContractId] = useState('');

  const fetchAllData = async () => {
    try {
      const [apoRes, cultRes, spRes, warRes] = await Promise.all([
        fetch('/api/apotheosis/state'),
        fetch('/api/cult/state'),
        fetch('/api/spiritworld/state'),
        fetch('/api/divinewar/state')
      ]);

      if (apoRes.ok) setApotheosisData(await apoRes.json());
      if (cultRes.ok) {
        const cData = await cultRes.json();
        setCultData(cData);
        if (cData.honorificName) {
          setLine1(cData.honorificName.line1 || '');
          setLine2(cData.honorificName.line2 || '');
          setLine3(cData.honorificName.line3 || '');
          setLine4(cData.honorificName.line4 || '');
        }
      }
      if (spRes.ok) {
        const sData = await spRes.json();
        setSpiritData(sData);
        if (sData.activeContracts?.length > 0 && !selectedContractId) {
          setSelectedContractId(sData.activeContracts[0].id);
        }
      }
      if (warRes.ok) setWarData(await warRes.json());
    } catch (err) {
      console.error('Error fetching apotheosis temple data:', err);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [playerSequence]);

  // A. Rituales
  const handleAdvanceRitual = async (seq: number) => {
    setLoading(true);
    const res = await fetch('/api/apotheosis/advance-ritual', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sequence: seq, amount: 25, conditionMet: true })
    });
    await res.json();
    setLoading(false);
    if (res.ok) {
      onOpenNotice('Preparación Ritual', `Has avanzado los preparativos místicos para la Secuencia ${seq}.`);
      fetchAllData();
      onRefreshState();
    }
  };

  const handleExecuteApotheosis = async (seq: number) => {
    setLoading(true);
    const res = await fetch('/api/apotheosis/execute-apotheosis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetSequence: seq })
    });
    const data = await res.json();
    setLoading(false);
    onOpenNotice(data.success ? '¡Apoteosis Divina!' : 'Fallo en la Apoteosis', data.message);
    fetchAllData();
    onRefreshState();
  };

  // B. Culto y Plegarias
  const handleForgeHonorificName = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/cult/forge-name', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ line1, line2, line3, line4 })
    });
    const data = await res.json();
    setLoading(false);
    onOpenNotice(data.success ? 'Nombre Consagrado' : 'Error en el Ritual', data.message);
    fetchAllData();
    onRefreshState();
  };

  const handleRespondPrayer = async (prayerId: string, action: string) => {
    setLoading(true);
    const res = await fetch('/api/cult/respond-prayer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prayerId, action })
    });
    const data = await res.json();
    setLoading(false);
    onOpenNotice('Respuesta Divina', data.message);
    fetchAllData();
    onRefreshState();
  };

  // C. Mundo Espiritual
  const handleConsultLights = async (lightName: string) => {
    setLoading(true);
    const res = await fetch('/api/spiritworld/consult-lights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lightName })
    });
    const data = await res.json();
    setLoading(false);
    onOpenNotice('Revelación de las Siete Luces', data.revelation || data.message);
    fetchAllData();
    onRefreshState();
  };

  const handleSignMessenger = async (creatureType: string) => {
    setLoading(true);
    const res = await fetch('/api/spiritworld/sign-messenger', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ creatureType })
    });
    const data = await res.json();
    setLoading(false);
    onOpenNotice('Contrato Espiritual', data.message);
    fetchAllData();
    onRefreshState();
  };

  const handleDispatchMessenger = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContractId || !recipient || !letterContent) return;
    setLoading(true);
    const res = await fetch('/api/spiritworld/dispatch-messenger', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contractId: selectedContractId,
        recipientName: recipient,
        letterText: letterContent
      })
    });
    const data = await res.json();
    setLoading(false);
    onOpenNotice('Mensajero Despachado', data.message);
    setLetterContent('');
    fetchAllData();
    onRefreshState();
  };

  const handleSummonProjection = async (projId: string) => {
    setLoading(true);
    const res = await fetch('/api/spiritworld/summon-projection', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectionId: projId })
    });
    const data = await res.json();
    setLoading(false);
    onOpenNotice('Vacío Histórico', data.message);
    fetchAllData();
    onRefreshState();
  };

  // D. Guerra de Dioses
  const handleRequestAlliance = async (godName: string) => {
    setLoading(true);
    const res = await fetch('/api/divinewar/intervene-god', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ godName })
    });
    const data = await res.json();
    setLoading(false);
    onOpenNotice('Alianza Ortodoxa', data.message);
    fetchAllData();
    onRefreshState();
  };

  const handleClashRival = async (competitorId: string) => {
    setLoading(true);
    const res = await fetch('/api/divinewar/clash-rival', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ competitorId })
    });
    const data = await res.json();
    setLoading(false);
    onOpenNotice('Choque Divino', data.message);
    fetchAllData();
    onRefreshState();
  };

  const handleReinforceBarrier = async () => {
    setLoading(true);
    const res = await fetch('/api/divinewar/reinforce-barrier', {
      method: 'POST'
    });
    const data = await res.json();
    setLoading(false);
    onOpenNotice('Gran Barrera Planetaria', data.message);
    fetchAllData();
    onRefreshState();
  };

  return (
    <div className="card-frame" style={{ padding: '20px', background: '#0e0c0a', border: '1px solid #4a3e2e' }}>
      
      {/* Encabezado Místico */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #3d3324', paddingBottom: '12px' }}>
        <div>
          <h2 className="cinzel" style={{ color: 'var(--gold)', fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <Crown size={24} color="var(--gold)" />
            TRONO DIVINO, APOTEOSIS Y EL MUNDO ESPIRITUAL
          </h2>
          <div style={{ fontSize: '0.85rem', color: '#a69b8b', marginTop: '4px' }}>
            Vía de Ascenso: <strong style={{ color: '#fff' }}>{playerPathway}</strong> | Rango Actual: <strong style={{ color: 'var(--gold)' }}>Secuencia {playerSequence}</strong> | Anclas de Fe: <strong style={{ color: '#4ade80' }}>{anchorStrength}%</strong>
          </div>
        </div>

        {/* Subpestañas */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { id: 'rituals', label: 'Altar de Apoteosis', icon: Flame },
            { id: 'prayers', label: `Culto & Plegarias (${cultData?.prayers?.filter((p: any) => p.status === 'PENDING').length || 0})`, icon: HeartHandshake },
            { id: 'spiritworld', label: 'Mundo Espiritual & Mensajeros', icon: Eye },
            { id: 'divinewar', label: 'Guerra de Dioses & Unicidad', icon: Globe }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSubtab(tab.id as any)}
              className={`action-tab-btn ${activeSubtab === tab.id ? 'active' : ''}`}
              style={{ padding: '7px 12px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <tab.icon size={15} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* =========================================================================
          SUBPESTAÑA 1: ALTAR DE APOTEOSIS & RITUALES CANÓNICOS
          ========================================================================= */}
      {activeSubtab === 'rituals' && (
        <div>
          <div className="card-frame" style={{ padding: '12px 16px', marginBottom: '16px', background: '#1c1712', borderColor: '#7c5826' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ color: 'var(--gold)', fontSize: '1rem' }}>Ley Canónica del Ascenso Divino (Secuencias 4 a 0)</strong>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#c7bca9' }}>
                  Avanzar sin el ritual de anclaje despierta inmediatamente la <strong>Voluntad del Creador Original</strong>. Las Anclas de Fe ({anchorStrength}%) son tu único baluarte contra la mutación irreversible.
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.8rem', color: '#aaa' }}>Digestión Actual</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: digestion >= 95 ? '#4ade80' : '#f59e0b' }}>{digestion}%</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
            {apotheosisData?.stages?.map((stage: any) => {
              const isCurrentOrNext = stage.sequence === Math.max(0, playerSequence - 1);
              const isPast = stage.sequence >= playerSequence;
              const hasEnoughAnchors = anchorStrength >= stage.requiredAnchorStrength;

              return (
                <div
                  key={stage.sequence}
                  className="card-frame"
                  style={{
                    padding: '14px',
                    background: isCurrentOrNext ? '#211a13' : '#14110e',
                    border: isCurrentOrNext ? '1px solid var(--gold)' : '1px solid #332b21',
                    opacity: isPast && stage.sequence !== playerSequence ? 0.6 : 1
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ background: isCurrentOrNext ? 'var(--crimson)' : '#2e251a', color: '#fff', padding: '2px 8px', borderRadius: '3px', fontSize: '0.78rem', fontWeight: 'bold' }}>
                          Secuencia {stage.sequence}
                        </span>
                        <strong style={{ color: isCurrentOrNext ? 'var(--gold)' : '#ded9d0', fontSize: '1.05rem' }}>
                          {stage.sequenceName}
                        </strong>
                        {stage.isCompleted && <span style={{ color: '#4ade80', fontSize: '0.78rem' }}>✓ RITUAL SELLADO</span>}
                      </div>
                      <div style={{ color: '#d1c7b7', fontStyle: 'italic', fontSize: '0.85rem', marginTop: '4px' }}>
                        Ritual: "{stage.ritualTitle}"
                      </div>
                      <p style={{ fontSize: '0.82rem', color: '#a89d8d', margin: '6px 0', maxWidth: '750px' }}>
                        {stage.canonicalDescription}
                      </p>
                      <div style={{ display: 'flex', gap: '16px', fontSize: '0.78rem', marginTop: '6px' }}>
                        <span style={{ color: hasEnoughAnchors ? '#4ade80' : '#f87171' }}>
                          Anclas Requeridas: {stage.requiredAnchorStrength}% (Tienes {anchorStrength}%)
                        </span>
                        <span style={{ color: '#f59e0b' }}>
                          Riesgo Despertar Creador: {stage.originalCreatorAwakeningRisk}%
                        </span>
                        <span style={{ color: stage.keyConditionMet ? '#4ade80' : '#9ca3af' }}>
                          Condición Teatral: {stage.keyConditionMet ? 'Satisfecha' : 'Pendiente'}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '180px' }}>
                      <div style={{ fontSize: '0.75rem', color: '#aaa', display: 'flex', justifyContent: 'space-between' }}>
                        <span>Progreso Ritual</span>
                        <span>{stage.stageProgress}%</span>
                      </div>
                      <div style={{ width: '100%', height: '6px', background: '#262018', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${stage.stageProgress}%`, height: '100%', background: stage.stageProgress >= 100 ? '#4ade80' : 'var(--gold)' }} />
                      </div>

                      {isCurrentOrNext && !stage.isCompleted && (
                        <button
                          disabled={loading}
                          onClick={() => handleAdvanceRitual(stage.sequence)}
                          className="action-tab-btn"
                          style={{ padding: '5px 10px', fontSize: '0.78rem', marginTop: '6px' }}
                        >
                          Preparar Ritual (+25%)
                        </button>
                      )}

                      {isCurrentOrNext && (
                        <button
                          disabled={loading || playerSequence <= stage.sequence}
                          onClick={() => handleExecuteApotheosis(stage.sequence)}
                          className="crimson-btn"
                          style={{ padding: '6px 12px', fontSize: '0.82rem', marginTop: '4px' }}
                        >
                          Lanzar Apoteosis (S-{stage.sequence})
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          SUBPESTAÑA 2: CULTO & BANDEJA DE PLEGARIAS
          ========================================================================= */}
      {activeSubtab === 'prayers' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '16px' }}>
          
          {/* Columna Izquierda: Forja de Nombre Honorífico */}
          <div>
            <div className="card-frame" style={{ padding: '14px', marginBottom: '14px', background: '#161310' }}>
              <h3 className="cinzel" style={{ color: 'var(--gold)', fontSize: '1rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Feather size={16} /> Forja del Nombre Honorífico Canónico
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#a69b8b', marginBottom: '12px' }}>
                Tres líneas que resuenan en el Mundo Espiritual sin cruzarse con deidades existentes:
              </p>

              <form onSubmit={handleForgeHonorificName} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--gold)' }}>Línea 1: Título o paradoja conceptual</label>
                  <input
                    type="text"
                    value={line1}
                    onChange={e => setLine1(e.target.value)}
                    style={{ width: '100%', padding: '6px 10px', background: '#201b16', border: '1px solid #4a3e2e', color: '#fff', borderRadius: '3px', fontSize: '0.82rem' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--gold)' }}>Línea 2: Trono de poder / Dominio cósmico</label>
                  <input
                    type="text"
                    value={line2}
                    onChange={e => setLine2(e.target.value)}
                    style={{ width: '100%', padding: '6px 10px', background: '#201b16', border: '1px solid #4a3e2e', color: '#fff', borderRadius: '3px', fontSize: '0.82rem' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--gold)' }}>Línea 3: Autoridad divina y gracia</label>
                  <input
                    type="text"
                    value={line3}
                    onChange={e => setLine3(e.target.value)}
                    style={{ width: '100%', padding: '6px 10px', background: '#201b16', border: '1px solid #4a3e2e', color: '#fff', borderRadius: '3px', fontSize: '0.82rem' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#aaa' }}>Línea 4 (Opcional para Deidad Verdadera)</label>
                  <input
                    type="text"
                    value={line4}
                    onChange={e => setLine4(e.target.value)}
                    placeholder="El Faro del Fin de los Tiempos..."
                    style={{ width: '100%', padding: '6px 10px', background: '#201b16', border: '1px solid #4a3e2e', color: '#fff', borderRadius: '3px', fontSize: '0.82rem' }}
                  />
                </div>

                <button type="submit" disabled={loading} className="crimson-btn" style={{ padding: '8px', fontSize: '0.82rem', marginTop: '6px' }}>
                  Consagrar Nombre en el Astral
                </button>
              </form>
            </div>

            <div className="card-frame" style={{ padding: '14px', background: '#161310' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.82rem', color: '#ccc' }}>Devoción del Culto:</span>
                <strong style={{ color: 'var(--gold)' }}>{cultData?.totalDevotionIndex || 25}/100</strong>
              </div>
              <div style={{ width: '100%', height: '8px', background: '#241e17', borderRadius: '4px', overflow: 'hidden', marginBottom: '10px' }}>
                <div style={{ width: `${cultData?.totalDevotionIndex || 25}%`, height: '100%', background: 'var(--gold)' }} />
              </div>
              <div style={{ fontSize: '0.78rem', color: '#aaa' }}>
                Devotos fervorosos registrados: <strong style={{ color: '#fff' }}>{cultData?.devoteesCount || 15} almas</strong>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Bandeja de Plegarias */}
          <div>
            <h3 className="cinzel" style={{ color: 'var(--gold)', fontSize: '1rem', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Eye size={16} /> Murmullos y Plegarias de Fieles en el Plano Material
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '420px', overflowY: 'auto', paddingRight: '6px' }}>
              {cultData?.prayers?.map((p: any) => (
                <div
                  key={p.id}
                  className="card-frame"
                  style={{
                    padding: '12px',
                    background: p.status === 'PENDING' ? '#1c1712' : '#141210',
                    borderLeft: p.urgency === 'CRITICAL' ? '3px solid var(--crimson)' : '3px solid var(--gold)',
                    opacity: p.status === 'PENDING' ? 1 : 0.6
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <div>
                      <strong style={{ color: '#fff', fontSize: '0.88rem' }}>{p.petitionerName}</strong>
                      <span style={{ fontSize: '0.75rem', color: '#aaa', marginLeft: '6px' }}>({p.location})</span>
                    </div>
                    <span style={{
                      fontSize: '0.7rem',
                      padding: '2px 6px',
                      borderRadius: '3px',
                      background: p.urgency === 'CRITICAL' ? '#7f1d1d' : '#332616',
                      color: p.urgency === 'CRITICAL' ? '#fca5a5' : 'var(--gold)'
                    }}>
                      {p.urgency}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.8rem', color: '#cfc4b2', margin: '6px 0', lineHeight: 1.4 }}>
                    "{p.petitionText}"
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                    <span style={{ fontSize: '0.72rem', color: '#888' }}>
                      Estado: <strong>{p.status}</strong> (+{p.faithPointsGranted}% Anclas)
                    </span>

                    {p.status === 'PENDING' && (
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          disabled={loading}
                          onClick={() => handleRespondPrayer(p.id, 'GRANT_MIRACLE')}
                          className="action-tab-btn"
                          style={{ padding: '4px 8px', fontSize: '0.74rem', color: '#4ade80', borderColor: '#22543d' }}
                          title="Consume Espiritualidad, concede milagro y acelera digestión"
                        >
                          Conceder Milagro
                        </button>
                        <button
                          disabled={loading}
                          onClick={() => handleRespondPrayer(p.id, 'SPIRITUAL_DESCENT')}
                          className="action-tab-btn"
                          style={{ padding: '4px 8px', fontSize: '0.74rem', color: '#38bdf8', borderColor: '#0c4a6e' }}
                          title="Descenso espiritual en cuerpo astral"
                        >
                          Descenso
                        </button>
                        <button
                          disabled={loading}
                          onClick={() => handleRespondPrayer(p.id, 'DIVINE_PUNISHMENT')}
                          className="action-tab-btn"
                          style={{ padding: '4px 8px', fontSize: '0.74rem', color: '#f87171', borderColor: '#7f1d1d' }}
                          title="Rayo justiciero"
                        >
                          Castigar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SUBPESTAÑA 3: MUNDO ESPIRITUAL & MENSAJEROS
          ========================================================================= */}
      {activeSubtab === 'spiritworld' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px' }}>
          
          {/* Siete Luces y Proyecciones */}
          <div>
            <h3 className="cinzel" style={{ color: 'var(--gold)', fontSize: '1rem', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={16} /> Las Siete Luces del Mundo Espiritual (Seven Lights)
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px', marginBottom: '16px' }}>
              {spiritData?.sevenLights?.map((light: any) => (
                <div key={light.name} className="card-frame" style={{ padding: '12px', background: '#161310' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ color: 'var(--gold)', fontSize: '0.9rem' }}>{light.name}</strong>
                    <span style={{ fontSize: '0.75rem', color: '#38bdf8' }}>{light.colorName}</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#aaa', margin: '4px 0' }}>Dominio: {light.domain}</div>
                  <div style={{ fontSize: '0.78rem', color: '#cfc4b2', fontStyle: 'italic', marginBottom: '8px' }}>
                    "{light.revelationQuote}"
                  </div>
                  <button
                    disabled={loading}
                    onClick={() => handleConsultLights(light.name)}
                    className="action-tab-btn"
                    style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                  >
                    Consultar Sabiduría (-15 Espiritualidad)
                  </button>
                </div>
              ))}
            </div>

            <h3 className="cinzel" style={{ color: 'var(--gold)', fontSize: '1rem', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={16} /> Proyecciones del Vacío Histórico (Secuencia 3+)
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
              {spiritData?.projections?.length === 0 ? (
                <div style={{ fontSize: '0.8rem', color: '#888', fontStyle: 'italic' }}>
                  Requiere Secuencia 3 (Erudito del Pasado) para extraer figuras de la niebla de la historia.
                </div>
              ) : (
                spiritData?.projections?.map((proj: any) => (
                  <div key={proj.id} className="card-frame" style={{ padding: '10px', background: '#181410', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ color: '#fff', fontSize: '0.85rem' }}>{proj.targetName}</strong>
                      <div style={{ fontSize: '0.75rem', color: '#aaa' }}>{proj.description}</div>
                    </div>
                    <button
                      disabled={loading}
                      onClick={() => handleSummonProjection(proj.id)}
                      className="action-tab-btn"
                      style={{ padding: '5px 10px', fontSize: '0.75rem', color: '#38bdf8' }}
                    >
                      Manifestar (-{proj.spiritualCost} Esp)
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Mensajeros Espirituales */}
          <div>
            <h3 className="cinzel" style={{ color: 'var(--gold)', fontSize: '1rem', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Send size={16} /> Contratos de Criaturas Espirituales (Mensajeros)
            </h3>

            <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
              <button disabled={loading} onClick={() => handleSignMessenger('HEADLESS_BANSHEE')} className="action-tab-btn" style={{ fontSize: '0.72rem', padding: '4px 8px' }}>
                + Banshee de 4 Cabezas (£1 Oro)
              </button>
              <button disabled={loading} onClick={() => handleSignMessenger('SPECTRAL_CAT')} className="action-tab-btn" style={{ fontSize: '0.72rem', padding: '4px 8px' }}>
                + Gato Esqueleto (5 Esp)
              </button>
              <button disabled={loading} onClick={() => handleSignMessenger('MIST_RAVEN')} className="action-tab-btn" style={{ fontSize: '0.72rem', padding: '4px 8px' }}>
                + Cuervo de Niebla (1s)
              </button>
            </div>

            {spiritData?.activeContracts?.length > 0 && (
              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--gold)' }}>Mensajero Contratado:</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
                  {spiritData.activeContracts.map((c: any) => (
                    <div
                      key={c.id}
                      onClick={() => setSelectedContractId(c.id)}
                      className="card-frame"
                      style={{
                        padding: '8px 12px',
                        cursor: 'pointer',
                        borderColor: selectedContractId === c.id ? 'var(--gold)' : '#383127',
                        background: selectedContractId === c.id ? '#261f18' : '#141210'
                      }}
                    >
                      <strong style={{ fontSize: '0.82rem', color: '#fff' }}>{c.messengerName}</strong>
                      <div style={{ fontSize: '0.72rem', color: '#aaa' }}>{c.paymentClause} | Entregas: {c.deliveriesCompleted}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleDispatchMessenger} className="card-frame" style={{ padding: '12px', background: '#161310' }}>
              <div style={{ fontSize: '0.82rem', color: 'var(--gold)', fontWeight: 'bold', marginBottom: '8px' }}>
                Despachar Carta Secreta sin Rastro Físico
              </div>
              <input
                type="text"
                placeholder="Destinatario (ej: Miss Justice / Sherlock Moriarty)"
                value={recipient}
                onChange={e => setRecipient(e.target.value)}
                style={{ width: '100%', padding: '6px 10px', background: '#201b16', border: '1px solid #4a3e2e', color: '#fff', borderRadius: '3px', fontSize: '0.8rem', marginBottom: '8px' }}
                required
              />
              <textarea
                placeholder="Escribe el mensaje o informe cifrado..."
                value={letterContent}
                onChange={e => setLetterContent(e.target.value)}
                rows={3}
                style={{ width: '100%', padding: '6px 10px', background: '#201b16', border: '1px solid #4a3e2e', color: '#fff', borderRadius: '3px', fontSize: '0.8rem', marginBottom: '8px' }}
                required
              />
              <button type="submit" disabled={loading || !selectedContractId} className="crimson-btn" style={{ width: '100%', padding: '7px', fontSize: '0.8rem' }}>
                Invocar Mensajero y Entregar
              </button>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          SUBPESTAÑA 4: GUERRA DE DIOSES & UNICIDAD
          ========================================================================= */}
      {activeSubtab === 'divinewar' && (
        <div>
          <div className="card-frame" style={{ padding: '14px', marginBottom: '16px', background: '#1a1410', border: '1px solid #854d0e' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <strong style={{ color: 'var(--gold)', fontSize: '1rem' }}>Estado de la Gran Guerra de Dioses (Fase: {warData?.currentPhase})</strong>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#cfc4b2' }}>
                  Disputa por la <strong>{warData?.uniquenessContested}</strong>. Prevalecer sobre los rivales divinos permite ascender a <strong>Secuencia 0</strong> y apuntalar la Gran Barrera de la Tierra.
                </p>
              </div>
              <div style={{ minWidth: '180px' }}>
                <div style={{ fontSize: '0.75rem', color: '#aaa', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Barrera Planetaria</span>
                  <span>{warData?.earthBarrierIntegrity}%</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: '#292218', borderRadius: '4px', overflow: 'hidden', marginTop: '4px' }}>
                  <div style={{ width: `${warData?.earthBarrierIntegrity}%`, height: '100%', background: warData?.earthBarrierIntegrity >= 80 ? '#4ade80' : '#f59e0b' }} />
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            
            {/* Rivales Divinos */}
            <div>
              <h3 className="cinzel" style={{ color: 'var(--gold)', fontSize: '1rem', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Zap size={16} /> Rivales Divinos & Reyes de los Ángeles
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {warData?.activeCompetitors?.map((comp: any) => (
                  <div key={comp.id} className="card-frame" style={{ padding: '12px', background: '#161310' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ color: '#fff', fontSize: '0.9rem' }}>{comp.name}</strong>
                      <span style={{ fontSize: '0.72rem', color: comp.isDefeated ? '#4ade80' : 'var(--crimson)', fontWeight: 'bold' }}>
                        {comp.isDefeated ? 'DERROTADO' : `AVATARES: ${comp.avatarCount}`}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#d4af37', margin: '2px 0' }}>{comp.title}</div>
                    <p style={{ fontSize: '0.78rem', color: '#aaa', margin: '4px 0' }}>{comp.schemeDescription}</p>
                    {!comp.isDefeated && (
                      <button
                        disabled={loading || playerSequence > 1}
                        onClick={() => handleClashRival(comp.id)}
                        className="crimson-btn"
                        style={{ padding: '5px 10px', fontSize: '0.75rem', marginTop: '6px' }}
                      >
                        Bombardeo Conceptual a Avatares (-35 Esp)
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Alianzas con Dioses Ortodoxos */}
            <div>
              <h3 className="cinzel" style={{ color: 'var(--gold)', fontSize: '1rem', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Shield size={16} /> Pactos con las Siete Deidades Ortodoxas
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {warData?.orthodoxPacts?.map((pact: any) => (
                  <div key={pact.godName} className="card-frame" style={{ padding: '12px', background: '#161310' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ color: '#fff', fontSize: '0.88rem' }}>{pact.godName}</strong>
                      <span style={{ fontSize: '0.72rem', color: pact.pactStatus === 'COVENANT_SEALED' ? '#4ade80' : '#9ca3af' }}>
                        {pact.pactStatus}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#cfc4b2', margin: '4px 0' }}>
                      Bendición: {pact.divineBlessing}
                    </div>
                    {pact.pactStatus !== 'COVENANT_SEALED' && (
                      <button
                        disabled={loading}
                        onClick={() => handleRequestAlliance(pact.godName)}
                        className="action-tab-btn"
                        style={{ padding: '4px 10px', fontSize: '0.75rem', marginTop: '4px' }}
                      >
                        Sellar Alianza Sagrada (-{pact.costFavor} Esp)
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Apuntalar Gran Barrera */}
          {playerSequence === 0 && (
            <div style={{ textAlign: 'center', marginTop: '12px' }}>
              <button
                disabled={loading}
                onClick={handleReinforceBarrier}
                className="crimson-btn"
                style={{ padding: '10px 24px', fontSize: '0.95rem', letterSpacing: '1px' }}
              >
                🌍 Apuntalar la Gran Barrera Planetaria contra los Grandes Antiguos
              </button>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
