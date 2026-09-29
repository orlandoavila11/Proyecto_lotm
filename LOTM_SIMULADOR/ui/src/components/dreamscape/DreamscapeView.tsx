import React, { useState, useEffect } from 'react';
import { 
  Building2, Sparkles, Brain, Radio, ShieldAlert,
  Flame, Heart, RefreshCw, Send, Newspaper
} from 'lucide-react';

interface DreamscapeViewProps {
  playerSequence: number;
  playerPathway: string;
  onRefreshState: () => void;
  onOpenNotice: (title: string, body: string) => void;
}

export const DreamscapeView: React.FC<DreamscapeViewProps> = ({
  playerSequence: _playerSequence,
  playerPathway: _playerPathway,
  onRefreshState,
  onOpenNotice
}) => {
  const [activeTab, setActiveTab] = useState<'dream' | 'tarot' | 'boons' | 'ecosystem'>('dream');
  const [dreamData, setDreamData] = useState<any>(null);
  const [boonData, setBoonData] = useState<any>(null);
  const [ecoData, setEcoData] = useState<any>(null);
  const [latestGazette, setLatestGazette] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchAllData = async () => {
    try {
      const [rDream, rBoon, rEco] = await Promise.all([
        fetch('/api/dreamscape/state'),
        fetch('/api/boons/state'),
        fetch('/api/ecosystem/state')
      ]);
      if (rDream.ok) setDreamData(await rDream.json());
      if (rBoon.ok) setBoonData(await rBoon.json());
      if (rEco.ok) setEcoData(await rEco.json());
    } catch (e) {
      console.error("Error cargando datos de Fase 8:", e);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // 1. Despertar memoria moderna
  const handleAwakenMemory = async (memoryId: string) => {
    setLoading(true);
    const res = await fetch('/api/dreamscape/awaken-memory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memoryId })
    });
    const data = await res.json();
    setLoading(false);
    onOpenNotice('Memoria del Siglo XXI', data.message);
    fetchAllData();
    onRefreshState();
  };

  // 2. Desplegar incursión del Club Tarot
  const handleDeployTarot = async (agentId: string) => {
    setLoading(true);
    const res = await fetch('/api/dreamscape/dispatch-tarot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentId })
    });
    const data = await res.json();
    setLoading(false);
    onOpenNotice('Incursión Onírica del Club Tarot', data.message);
    fetchAllData();
    onRefreshState();
  };

  // 3. Plegaria de Concesión Cósmica (Boons)
  const handlePrayBoon = async (pathwayId: string) => {
    setLoading(true);
    const res = await fetch('/api/boons/pray', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pathwayId })
    });
    const data = await res.json();
    setLoading(false);
    onOpenNotice('Concesión de Deidad Exterior', data.message);
    fetchAllData();
    onRefreshState();
  };

  // 4. Pago de tributo
  const handlePayTribute = async (pathwayId: string) => {
    setLoading(true);
    const res = await fetch('/api/boons/pay-tribute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pathwayId })
    });
    const data = await res.json();
    setLoading(false);
    onOpenNotice('Ofrenda Cósmica', data.message);
    fetchAllData();
    onRefreshState();
  };

  // 5. Avanzar tick del ecosistema autónomo
  const handleAdvanceEcosystem = async () => {
    setLoading(true);
    const res = await fetch('/api/ecosystem/advance-tick', { method: 'POST' });
    const data = await res.json();
    setLoading(false);
    if (data.latestGazette) {
      setLatestGazette(data.latestGazette);
    }
    onOpenNotice('Ecosistema Autónomo Actualizado', `Se simularon las vidas y eventos de los Beyonders en Backlund y Trier. Incidentes nuevos: ${data.newIncidents?.length || 0}.`);
    fetchAllData();
    onRefreshState();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* HEADER: EL SUEÑO DE ZHOU MINGRUI & LA VOLUNTAD DEL CELESTIAL WORTHY */}
      <div className="card-frame" style={{ padding: '20px', background: 'linear-gradient(135deg, #13111c, #1f142b)', borderColor: '#8b5cf6' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Brain size={24} color="#c084fc" />
              <h2 className="cinzel" style={{ margin: 0, color: '#e9d5ff', fontSize: '1.4rem' }}>
                EL SUEÑO DEL LOCO & LAS SENDAS DEL COSMOS
              </h2>
            </div>
            <p style={{ margin: '6px 0 0 0', color: '#c4b5fd', fontSize: '0.85rem' }}>
              Sector Onírico: <strong>{dreamData?.currentDreamSector || 'Metrópolis del Siglo XXI'}</strong>
            </p>
          </div>

          <div style={{ display: 'flex', gap: '16px', minWidth: '280px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#86efac' }}>
                <span>Humanidad (Zhou Mingrui)</span>
                <span>{dreamData?.humanityIndex || 65}%</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: '#14532d', borderRadius: '4px', overflow: 'hidden', marginTop: '4px' }}>
                <div style={{ width: `${dreamData?.humanityIndex || 65}%`, height: '100%', background: '#22c55e' }} />
              </div>
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#f87171' }}>
                <span>Asimilación Celestial</span>
                <span>{dreamData?.celestialWorthyCorruption || 35}%</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: '#7f1d1d', borderRadius: '4px', overflow: 'hidden', marginTop: '4px' }}>
                <div style={{ width: `${dreamData?.celestialWorthyCorruption || 35}%`, height: '100%', background: '#ef4444' }} />
              </div>
            </div>
          </div>
        </div>

        {/* SUBPESTAÑAS DIEGÉTICAS */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '16px', borderTop: '1px solid rgba(139,92,246,0.3)', paddingTop: '12px', flexWrap: 'wrap' }}>
          {[
            { id: 'dream', label: 'Metrópolis del Siglo XXI (Memorias)', icon: Building2 },
            { id: 'tarot', label: 'Incursiones del Club Tarot', icon: Radio },
            { id: 'boons', label: 'Concesiones Cósmicas (Boons)', icon: Sparkles },
            { id: 'ecosystem', label: 'Ecosistema de Beyonders & Gaceta', icon: Newspaper }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`action-tab-btn ${activeTab === t.id ? 'active' : ''}`}
              style={{ padding: '7px 14px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <t.icon size={15} />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* =========================================================================
          SUBPESTAÑA 1: METRÓPOLIS MODERNA & ANCLAS DEL SIGLO XXI
          ========================================================================= */}
      {activeTab === 'dream' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '16px' }}>
          <div>
            <h3 className="cinzel" style={{ color: 'var(--gold)', fontSize: '1.05rem', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Heart size={16} color="#ec4899" /> Memorias de la Era Previa a la Transmigración
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#aaa', marginBottom: '14px' }}>
              Despertar estas memorias ancla la personalidad de Zhou Mingrui e impide que la fría divinidad del Creador Original y el Celestial Worthy borren su ego humano.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {dreamData?.availableMemories?.map((mem: any) => (
                <div 
                  key={mem.id} 
                  className="card-frame" 
                  style={{ 
                    padding: '14px', 
                    background: mem.isAwakened ? '#131e17' : '#191522',
                    borderColor: mem.isAwakened ? '#22c55e' : 'var(--card-border)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ color: mem.isAwakened ? '#86efac' : 'var(--gold)' }}>{mem.title}</strong>
                    <span className="gold-badge" style={{ fontSize: '0.75rem' }}>
                      {mem.isAwakened ? '✓ Anclado' : `+${mem.humanityBonus}% Humanidad`}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#cfc6b8', margin: '8px 0 12px 0', lineHeight: 1.4 }}>
                    "{mem.description}"
                  </p>
                  <button
                    disabled={mem.isAwakened || loading}
                    onClick={() => handleAwakenMemory(mem.id)}
                    className="action-tab-btn"
                    style={{ width: '100%', justifyContent: 'center', opacity: mem.isAwakened ? 0.6 : 1 }}
                  >
                    {mem.isAwakened ? 'Memoria Integrada en el Ego' : 'Rememorar & Anclar en el Subconsciente'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Crónica Onírica */}
          <div>
            <h3 className="cinzel" style={{ color: 'var(--gold)', fontSize: '1.05rem', marginBottom: '10px' }}>
              Bitácora del Campo de Batalla Onírico
            </h3>
            <div className="parchment-sheet" style={{ maxHeight: '420px', overflowY: 'auto', padding: '14px' }}>
              {dreamData?.dreamChronicle?.map((c: string, idx: number) => (
                <div key={idx} style={{ fontSize: '0.82rem', color: '#2b2118', borderBottom: '1px solid #d4c5a9', paddingBottom: '8px', marginBottom: '8px' }}>
                  {c}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SUBPESTAÑA 2: INCURSIONES DEL CLUB TAROT
          ========================================================================= */}
      {activeTab === 'tarot' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '16px' }}>
          <div>
            <h3 className="cinzel" style={{ color: 'var(--gold)', fontSize: '1.05rem', marginBottom: '10px' }}>
              Emisarios del Club Tarot en el Mundo de los Sueños
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {dreamData?.tarotAgents?.map((agent: any) => (
                <div key={agent.id} className="card-frame" style={{ padding: '14px', background: '#15131e' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <strong style={{ color: '#d8b4fe', fontSize: '1rem' }}>{agent.codeName} ({agent.realName})</strong>
                    <span className="gold-badge">Poder: {agent.combatRating}</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#a78bfa', marginTop: '4px' }}>
                    Especialidad: {agent.specialty}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#7c7365', marginTop: '4px' }}>
                    Costo de Despliegue: {agent.sanityCost} Espiritualidad
                  </div>
                  <button
                    disabled={agent.isDeployed || loading}
                    onClick={() => handleDeployTarot(agent.id)}
                    className="action-tab-btn"
                    style={{ marginTop: '10px', width: '100%', justifyContent: 'center' }}
                  >
                    <Send size={14} /> {agent.isDeployed ? 'Operando en el Sueño' : `Proyectar a ${agent.codeName}`}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Parásitos Activos */}
          <div>
            <h3 className="cinzel" style={{ color: '#f87171', fontSize: '1.05rem', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldAlert size={16} /> Parásitos y Amenazas en la Conciencia
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {dreamData?.activeParasites?.map((p: any) => (
                <div key={p.id} className="card-frame" style={{ padding: '12px', borderColor: p.isExtirpated ? '#22c55e' : '#ef4444' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <strong style={{ color: p.isExtirpated ? '#86efac' : '#fca5a5' }}>{p.name}</strong>
                    <span style={{ fontSize: '0.75rem', color: p.isExtirpated ? '#86efac' : '#ef4444' }}>
                      {p.isExtirpated ? 'Extirpado' : `Drenaje -${p.mentalDrainRate}%`}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.76rem', color: '#aaa', marginTop: '4px' }}>
                    Origen: {p.source} | Severidad: {p.severity}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SUBPESTAÑA 3: CONCESIONES CÓSMICAS (BOONS - CIRCLE OF INEVITABILITY)
          ========================================================================= */}
      {activeTab === 'boons' && (
        <div>
          <div className="card-frame" style={{ padding: '14px', marginBottom: '16px', background: '#1c1318', borderColor: '#e11d48' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ color: '#fda4af' }}>Riesgo de Contragolpe Cósmico: {boonData?.cosmicBacklashRisk || 15}%</strong>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#fecdd3' }}>
                  Las sendas de las Deidades Exteriores otorgan poder instantáneo sin pociones, pero exigen tributos para no mutar en un engendro.
                </p>
              </div>
              <div className="gold-badge" style={{ background: '#881337', color: '#fff' }}>
                Pactos Activos: {boonData?.activePactsCount || 0}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {boonData?.availablePathways?.map((pw: any) => (
              <div key={pw.pathwayId} className="card-frame" style={{ padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ color: 'var(--gold)', fontSize: '1.05rem' }}>{pw.pathwayName}</strong>
                  <span className="gold-badge">{pw.isPactActive ? 'Pacto Activo' : 'Sin Pacto'}</span>
                </div>
                <div style={{ fontSize: '0.82rem', color: '#c084fc', marginTop: '4px' }}>Patrono: {pw.patronTitle}</div>
                <p style={{ fontSize: '0.82rem', color: '#cfc6b8', margin: '8px 0 12px 0', lineHeight: 1.4 }}>
                  {pw.loreDescription}
                </p>

                <div style={{ borderTop: '1px solid var(--card-border)', paddingTop: '10px', marginBottom: '12px' }}>
                  <div style={{ fontSize: '0.78rem', color: '#aaa', marginBottom: '6px' }}>Rango Actual: Secuencia {pw.currentTierSequence}</div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      disabled={loading}
                      onClick={() => handlePrayBoon(pw.pathwayId)}
                      className="action-tab-btn"
                      style={{ flex: 1, justifyContent: 'center' }}
                    >
                      <Sparkles size={14} /> Entonar Plegaria & Aceptar Favor
                    </button>
                    <button
                      disabled={!pw.isPactActive || loading}
                      onClick={() => handlePayTribute(pw.pathwayId)}
                      className="action-tab-btn"
                      style={{ justifyContent: 'center' }}
                      title="Ofrendar tributo (£15 o espiritualidad)"
                    >
                      <Flame size={14} color="#f43f5e" /> Tributo
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          SUBPESTAÑA 4: ECOSISTEMA DE BEYONDERS AUTÓNOMOS & GACETA PROCEDURAL
          ========================================================================= */}
      {activeTab === 'ecosystem' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 className="cinzel" style={{ margin: 0, color: 'var(--gold)' }}>
                Ecosistema de Beyonders Autónomos ({ecoData?.autonomousBeyonders?.length || 0})
              </h3>
              <span style={{ fontSize: '0.8rem', color: '#aaa' }}>
                Alerta de la Inquisición: <strong style={{ color: '#ef4444' }}>{ecoData?.inquisitorialAlertLevel}</strong>
              </span>
            </div>
            <button
              disabled={loading}
              onClick={handleAdvanceEcosystem}
              className="action-tab-btn"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <RefreshCw size={14} /> Simular Pulso Autónomo del Mundo (1 Día)
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
            {ecoData?.autonomousBeyonders?.map((npc: any) => (
              <div key={npc.id} className="card-frame" style={{ padding: '12px', background: '#16141a' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ color: 'var(--gold)' }}>{npc.name}</strong>
                  <span style={{ 
                    fontSize: '0.72rem', 
                    padding: '2px 6px', 
                    borderRadius: '4px',
                    background: npc.status === 'LOST_CONTROL' ? '#ef4444' : npc.status === 'ADVANCING' ? '#8b5cf6' : '#22c55e',
                    color: '#fff'
                  }}>
                    {npc.status}
                  </span>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#c084fc', marginTop: '2px' }}>
                  {npc.sequenceName} | {npc.district}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#aaa', marginTop: '6px' }}>
                  Digestión: {npc.digestionPercentage}% | Estabilidad Mental: {npc.mentalStability}%
                </div>
                <p style={{ fontSize: '0.8rem', color: '#cfc6b8', marginTop: '6px', fontStyle: 'italic' }}>
                  "{npc.recentActivity}"
                </p>
              </div>
            ))}
          </div>

          {/* Última Edición de la Gaceta */}
          {latestGazette && (
            <div className="parchment-sheet" style={{ padding: '16px', marginTop: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #7a5a12', paddingBottom: '6px' }}>
                <strong style={{ color: '#2b2118', fontSize: '1.1rem' }}>{latestGazette.newspaperTitle}</strong>
                <span style={{ fontSize: '0.8rem', color: '#7a5a12' }}>{latestGazette.dateStr} | {latestGazette.priceTag}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginTop: '12px' }}>
                {latestGazette.articles?.map((art: any) => (
                  <div key={art.id}>
                    <div style={{ fontSize: '0.72rem', color: '#7a5a12', textTransform: 'uppercase' }}>{art.column} - {art.districtReported}</div>
                    <strong style={{ color: '#1a1510', fontSize: '0.95rem' }}>{art.headline}</strong>
                    <p style={{ fontSize: '0.8rem', color: '#33271e', marginTop: '4px', lineHeight: 1.35 }}>{art.body}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
