import React, { useState, useEffect } from 'react';
import { 
  Crown, Sparkles, Shield, Globe, Flame, 
  Clock, Compass, BookOpen, Layers, Zap
} from 'lucide-react';

interface ApocalypseCosmicViewProps {
  playerSequence: number;
  playerPathway: string;
  anchorStrength: number;
  onRefreshState: () => void;
  onOpenNotice: (title: string, body: string) => void;
}

export const ApocalypseCosmicView: React.FC<ApocalypseCosmicViewProps> = ({
  playerSequence,
  playerPathway,
  anchorStrength,
  onRefreshState,
  onOpenNotice
}) => {
  const [activeSubtab, setActiveSubtab] = useState<'ats' | 'apocalypse' | 'western' | 'legacy'>('ats');
  const [atsData, setAtsData] = useState<any>(null);
  const [apocalypseData, setApocalypseData] = useState<any>(null);
  const [westernData, setWesternData] = useState<any>(null);
  const [legacyData, setLegacyData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Formulario de Carta de Blasfemia
  const [selectedArcana, setSelectedArcana] = useState('Carta del Tonto (The Fool)');
  const [stashLocation, setStashLocation] = useState('Backlund - Calle Minsk 15, Chimenea Secreta');

  const fetchAllData = async () => {
    try {
      const [atsRes, apoRes, westRes, legRes] = await Promise.all([
        fetch('/api/ats/state'),
        fetch('/api/apocalypse/state'),
        fetch('/api/western/state'),
        fetch('/api/legacy/state')
      ]);

      if (atsRes.ok) setAtsData(await atsRes.json());
      if (apoRes.ok) setApocalypseData(await apoRes.json());
      if (westRes.ok) setWesternData(await westRes.json());
      if (legRes.ok) setLegacyData(await legRes.json());
    } catch (err) {
      console.error('Error fetching apocalypse cosmic view data:', err);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [playerSequence]);

  // A. Trascendencia ATS
  const handleDeepenSefirah = async () => {
    setLoading(true);
    const res = await fetch('/api/ats/deepen-sefirah', { method: 'POST' });
    const data = await res.json();
    setLoading(false);
    onOpenNotice('Resonancia de Sefirah', data.message);
    fetchAllData();
    onRefreshState();
  };

  const handleAccommodateNeighbor = async (pw: string) => {
    setLoading(true);
    const res = await fetch('/api/ats/accommodate-neighbor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pathway: pw })
    });
    const data = await res.json();
    setLoading(false);
    onOpenNotice('Unicidad Vecina', data.message);
    fetchAllData();
    onRefreshState();
  };

  const handleAscendATS = async () => {
    setLoading(true);
    const res = await fetch('/api/ats/ascend', { method: 'POST' });
    const data = await res.json();
    setLoading(false);
    onOpenNotice(data.success ? '¡Trascendencia a Gran Antiguo!' : 'Ascensión Rechazada', data.message);
    fetchAllData();
    onRefreshState();
  };

  // B. Reloj del Apocalipsis
  const handleMobilizeSector = async (factionName: string) => {
    setLoading(true);
    const res = await fetch('/api/apocalypse/mobilize-sector', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ factionName })
    });
    const data = await res.json();
    setLoading(false);
    onOpenNotice('Defensa Planetaria', data.message);
    fetchAllData();
    onRefreshState();
  };

  const handleDeployAegis = async () => {
    setLoading(true);
    const res = await fetch('/api/apocalypse/deploy-aegis', { method: 'POST' });
    const data = await res.json();
    setLoading(false);
    onOpenNotice('Escudo de Sefirah', data.message);
    fetchAllData();
    onRefreshState();
  };

  const handleFinalSalvation = async () => {
    setLoading(true);
    const res = await fetch('/api/apocalypse/final-salvation', { method: 'POST' });
    const data = await res.json();
    setLoading(false);
    onOpenNotice(data.success ? '¡Triunfo Cósmico!' : 'Fallo en la Salvación', data.message);
    fetchAllData();
    onRefreshState();
  };

  // C. Continente Occidental
  const handleDissolveSeal = async () => {
    setLoading(true);
    const res = await fetch('/api/western/dissolve-seal', { method: 'POST' });
    const data = await res.json();
    setLoading(false);
    onOpenNotice('Continente Occidental', data.message);
    fetchAllData();
    onRefreshState();
  };

  const handleRefinePill = async (pillId: string) => {
    setLoading(true);
    const res = await fetch('/api/western/refine-pill', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pillId })
    });
    const data = await res.json();
    setLoading(false);
    onOpenNotice('Caldero del Dao', data.message);
    fetchAllData();
    onRefreshState();
  };

  const handleCommuneSect = async (sectId: string) => {
    setLoading(true);
    const res = await fetch('/api/western/commune-sect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sectId })
    });
    const data = await res.json();
    setLoading(false);
    onOpenNotice('Comunión del Dao', data.message);
    fetchAllData();
    onRefreshState();
  };

  // D. Cartas de Blasfemia & New Game+
  const handleForgeCard = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/legacy/forge-card', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ arcanaName: selectedArcana, stashLocation })
    });
    const data = await res.json();
    setLoading(false);
    onOpenNotice('Carta de Blasfemia', data.message);
    fetchAllData();
    onRefreshState();
  };

  const handleClaimNewGame = async () => {
    setLoading(true);
    const res = await fetch('/api/legacy/claim-newgame', { method: 'POST' });
    const data = await res.json();
    setLoading(false);
    onOpenNotice('Herencia de Transmigración', data.message);
    fetchAllData();
    onRefreshState();
  };

  return (
    <div className="card-frame" style={{ padding: '20px', background: '#09080b', border: '1px solid #5b3d7a' }}>
      
      {/* Encabezado Astral Supremo */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #3d2952', paddingBottom: '12px' }}>
        <div>
          <h2 className="cinzel" style={{ color: '#d8b4fe', fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <Globe size={24} color="#c084fc" />
            MÁS ALLÁ DE LAS SECUENCIAS (ATS) & EL APOCALIPSIS CÓSMICO
          </h2>
          <div style={{ fontSize: '0.85rem', color: '#c4b5fd', marginTop: '4px' }}>
            Rango Divino: <strong style={{ color: '#fff' }}>{atsData?.currentRank || `S-${playerSequence}`}</strong> | Sefirah: <strong style={{ color: 'var(--gold)' }}>{atsData?.sefirahName || 'Niebla de Sefirah'}</strong> | Año: <strong style={{ color: '#f87171' }}>{apocalypseData?.currentYear || 1349} d.C.</strong>
          </div>
        </div>

        {/* Subpestañas */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { id: 'ats', label: 'Trono Sefirot & ATS', icon: Crown },
            { id: 'apocalypse', label: `Apocalipsis 1368 (${apocalypseData?.barrierIntegrity ?? 75}%)`, icon: Clock },
            { id: 'western', label: 'Continente Occidental', icon: Compass },
            { id: 'legacy', label: 'Cartas de Blasfemia (New Game+)', icon: Layers }
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
          SUBPESTAÑA 1: TRONO SEFIROT & ASCENSIÓN ATS
          ========================================================================= */}
      {activeSubtab === 'ats' && (
        <div>
          <div className="card-frame" style={{ padding: '14px', marginBottom: '16px', background: '#171120', borderColor: '#7c3aed' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <strong style={{ color: '#d8b4fe', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={16} color="#c084fc" />
                  Aspiración a Gran Antiguo: {atsData?.targetGOOName} {atsData?.isPillar ? '★ PILAR DEL UNIVERSO' : ''}
                </strong>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#ddd6fe' }}>
                  Dominio de <strong>{atsData?.sefirahName}</strong> para la vía <strong>{playerPathway}</strong> | Anclas Divinas: <strong>{anchorStrength}%</strong>
                </p>
              </div>
              <div style={{ minWidth: '200px' }}>
                <div style={{ fontSize: '0.75rem', color: '#c4b5fd', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Acceso a Sefirah</span>
                  <span>{atsData?.sefirahAccessLevel}%/100%</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: '#2e1065', borderRadius: '4px', overflow: 'hidden', marginTop: '4px' }}>
                  <div style={{ width: `${atsData?.sefirahAccessLevel || 0}%`, height: '100%', background: '#a855f7' }} />
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px', marginBottom: '16px' }}>
            
            {/* Vías Vecinas */}
            <div>
              <h3 className="cinzel" style={{ color: 'var(--gold)', fontSize: '1rem', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Layers size={16} /> Vías Vecinas Requeridas para ATS
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {atsData?.neighboringPathways?.map((nb: any) => (
                  <div key={nb.pathway} className="card-frame" style={{ padding: '12px', background: '#120d1c', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ color: '#fff', fontSize: '0.9rem' }}>Vía {nb.pathway}</strong>
                      <div style={{ fontSize: '0.75rem', color: nb.isUniquenessAccommodated ? '#4ade80' : '#f87171' }}>
                        Unicidad: {nb.isUniquenessAccommodated ? 'Acomodada' : 'Pendiente'}
                      </div>
                    </div>
                    {!nb.isUniquenessAccommodated && (
                      <button
                        disabled={loading || playerSequence > 0}
                        onClick={() => handleAccommodateNeighbor(nb.pathway)}
                        className="crimson-btn"
                        style={{ padding: '5px 12px', fontSize: '0.78rem' }}
                      >
                        Acomodar Unicidad Vecina
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Acciones de Sefirah y Ascensión */}
            <div className="card-frame" style={{ padding: '14px', background: '#120d1c' }}>
              <h3 className="cinzel" style={{ color: 'var(--gold)', fontSize: '1rem', marginBottom: '10px' }}>
                Autoridad del Sefirot
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#c4b5fd', marginBottom: '12px' }}>
                Profundizar la sintonización con el Castillo de Sefirah o el Mar del Caos incrementa tu autoridad y asegura anclas cósmicas.
              </p>
              
              <button
                disabled={loading || atsData?.sefirahAccessLevel >= 100}
                onClick={handleDeepenSefirah}
                className="action-tab-btn"
                style={{ width: '100%', padding: '8px', fontSize: '0.82rem', marginBottom: '10px', color: '#c084fc', borderColor: '#7c3aed' }}
              >
                Profundizar Resonancia con Sefirah (+25%)
              </button>

              <button
                disabled={loading || !atsData?.canAscendToATS}
                onClick={handleAscendATS}
                className="crimson-btn"
                style={{ width: '100%', padding: '12px', fontSize: '0.9rem', letterSpacing: '1px' }}
              >
                👑 Trascender Más Allá de las Secuencias (ATS)
              </button>

              {atsData?.blockers?.length > 0 && (
                <div style={{ marginTop: '12px', fontSize: '0.75rem', color: '#fca5a5', lineHeight: 1.4 }}>
                  <strong>Requisitos pendientes:</strong>
                  <ul style={{ margin: '4px 0 0 16px' }}>
                    {atsData.blockers.map((b: string, i: number) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SUBPESTAÑA 2: RELOJ DEL APOCALIPSIS (AÑO 1368)
          ========================================================================= */}
      {activeSubtab === 'apocalypse' && (
        <div>
          <div className="card-frame" style={{ padding: '14px', marginBottom: '16px', background: '#1f1313', border: '1px solid #b91c1c' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <strong style={{ color: '#fca5a5', fontSize: '1.05rem' }}>
                  El Reloj del Fin de los Tiempos: Año {apocalypseData?.currentYear} d.C. (Fase: {apocalypseData?.phase})
                </strong>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#fecaca' }}>
                  Días restantes para el colapso definitivo en 1368: <strong>{apocalypseData?.daysRemainingUntil1368} días</strong>.
                </p>
              </div>
              <div style={{ minWidth: '220px' }}>
                <div style={{ fontSize: '0.75rem', color: '#fca5a5', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Integridad de la Gran Barrera</span>
                  <span>{apocalypseData?.barrierIntegrity}%</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: '#450a0a', borderRadius: '4px', overflow: 'hidden', marginTop: '4px' }}>
                  <div style={{ width: `${apocalypseData?.barrierIntegrity}%`, height: '100%', background: apocalypseData?.barrierIntegrity >= 60 ? '#4ade80' : '#ef4444' }} />
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            
            {/* Panteón de la Tierra */}
            <div>
              <h3 className="cinzel" style={{ color: 'var(--gold)', fontSize: '1rem', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Shield size={16} /> Sectores Defensivos del Panteón Terrestre
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {apocalypseData?.mobilizedDefenses?.map((def: any) => (
                  <div key={def.factionName} className="card-frame" style={{ padding: '12px', background: '#140f10' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ color: '#fff', fontSize: '0.88rem' }}>{def.factionName}</strong>
                      <span style={{ fontSize: '0.72rem', color: def.isMobilized ? '#4ade80' : '#f87171' }}>
                        {def.isMobilized ? 'MOVILIZADO' : 'EN RESERVA'}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--gold)', margin: '2px 0' }}>Líder: {def.leaderTitle}</div>
                    <div style={{ fontSize: '0.75rem', color: '#aaa' }}>Sector: {def.assignedSector}</div>
                    {!def.isMobilized && (
                      <button
                        disabled={loading}
                        onClick={() => handleMobilizeSector(def.factionName)}
                        className="crimson-btn"
                        style={{ padding: '4px 10px', fontSize: '0.75rem', marginTop: '6px' }}
                      >
                        Desplegar en el Frente Astral (-25 Esp)
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Deidades Exteriores & Escudo Planetario */}
            <div>
              <h3 className="cinzel" style={{ color: '#f87171', fontSize: '1rem', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Zap size={16} /> Asedio Cósmico de Deidades Exteriores
              </h3>
              <div className="card-frame" style={{ padding: '12px', background: '#140f10', marginBottom: '12px' }}>
                <div style={{ fontSize: '0.78rem', color: '#aaa', marginBottom: '6px' }}>Dioses Exteriores que asedian la atmósfera:</div>
                <ul style={{ margin: '0 0 0 16px', fontSize: '0.8rem', color: '#fca5a5' }}>
                  {apocalypseData?.outerDeitiesBreaching?.map((d: string, i: number) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              </div>

              <div className="card-frame" style={{ padding: '12px', background: '#140f10' }}>
                <div style={{ fontSize: '0.82rem', color: 'var(--gold)', fontWeight: 'bold', marginBottom: '6px' }}>
                  Escudo Planetario de la Niebla Gris
                </div>
                <p style={{ fontSize: '0.78rem', color: '#aaa', marginBottom: '8px' }}>
                  Cargas disponibles: <strong>{apocalypseData?.planetaryAegisCharges}/3</strong>. Eleva la barrera un +25%.
                </p>
                <button
                  disabled={loading || apocalypseData?.planetaryAegisCharges <= 0}
                  onClick={handleDeployAegis}
                  className="action-tab-btn"
                  style={{ width: '100%', padding: '7px', fontSize: '0.8rem', color: '#d8b4fe', borderColor: '#7c3aed' }}
                >
                  Erigir Escudo Planetario (-50 Esp)
                </button>
              </div>

              {playerSequence === -1 && !apocalypseData?.isPlanetSaved && (
                <div style={{ marginTop: '12px' }}>
                  <button
                    disabled={loading}
                    onClick={handleFinalSalvation}
                    className="crimson-btn"
                    style={{ width: '100%', padding: '12px', fontSize: '0.9rem', letterSpacing: '1px' }}
                  >
                    👑🌍 Ejecutar Salvación Cósmica Definitiva
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SUBPESTAÑA 3: EL CONTINENTE OCCIDENTAL
          ========================================================================= */}
      {activeSubtab === 'western' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '16px' }}>
          
          {/* Sello y Sectas */}
          <div>
            <div className="card-frame" style={{ padding: '14px', marginBottom: '14px', background: '#121612', border: '1px solid #166534' }}>
              <h3 className="cinzel" style={{ color: '#86efac', fontSize: '1rem', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Compass size={16} /> El Sello Milenario de la Gran Niebla Oriental
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#bbf7d0', marginBottom: '10px' }}>
                Estado del Sello: <strong>{westernData?.isMistSealDissolved ? 'DISUELTO (ACCESO TOTAL)' : 'SELLADO'}</strong>
              </p>
              {!westernData?.isMistSealDissolved && (
                <button
                  disabled={loading || playerSequence > 1}
                  onClick={handleDissolveSeal}
                  className="action-tab-btn"
                  style={{ width: '100%', padding: '8px', fontSize: '0.8rem', color: '#86efac', borderColor: '#16a34a' }}
                >
                  Rasgar la Gran Niebla Oriental (S1+)
                </button>
              )}
            </div>

            <h3 className="cinzel" style={{ color: 'var(--gold)', fontSize: '1rem', marginBottom: '10px' }}>
              Sectas y Monasterios del Dao
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {westernData?.discoveredSects?.map((sect: any) => (
                <div key={sect.id} className="card-frame" style={{ padding: '10px', background: '#111411' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ color: '#fff', fontSize: '0.85rem' }}>{sect.name}</strong>
                    <span style={{ fontSize: '0.72rem', color: '#86efac' }}>{sect.disposition}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#aaa', margin: '2px 0' }}>{sect.leaderTitle}</div>
                  <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginBottom: '6px' }}>Emanación: {sect.sefirahEmanation}</div>
                  <button
                    disabled={loading || !westernData?.isMistSealDissolved}
                    onClick={() => handleCommuneSect(sect.id)}
                    className="action-tab-btn"
                    style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                  >
                    Comunión del Dao (+25 Anclas)
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Caldero Alquímico de Píldoras del Dao */}
          <div>
            <h3 className="cinzel" style={{ color: 'var(--gold)', fontSize: '1rem', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Flame size={16} /> Caldero Alquímico de Píldoras Inmortales
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {westernData?.availablePills?.map((pill: any) => (
                <div key={pill.id} className="card-frame" style={{ padding: '12px', background: '#111411' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ color: '#fff', fontSize: '0.88rem' }}>{pill.name}</strong>
                    <span style={{ fontSize: '0.72rem', color: 'var(--gold)', padding: '2px 6px', background: '#272013', borderRadius: '3px' }}>
                      {pill.pillGrade}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: '#d1d5db', margin: '4px 0' }}>{pill.effectDescription}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                    <span style={{ fontSize: '0.75rem', color: '#86efac' }}>
                      + {pill.sanityRestored} Cordura | -{pill.corruptionPurged}% Corrupción
                    </span>
                    <button
                      disabled={loading || !westernData?.isMistSealDissolved}
                      onClick={() => handleRefinePill(pill.id)}
                      className="action-tab-btn"
                      style={{ padding: '4px 10px', fontSize: '0.75rem', color: '#86efac', borderColor: '#16a34a' }}
                    >
                      Refinar en el Caldero (-{pill.spiritualCost} Esp)
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SUBPESTAÑA 4: CARTAS DE BLASFEMIA & NEW GAME+
          ========================================================================= */}
      {activeSubtab === 'legacy' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          
          {/* Forja de Carta de Blasfemia */}
          <div>
            <h3 className="cinzel" style={{ color: 'var(--gold)', fontSize: '1rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <BookOpen size={16} /> Forja de la Carta de Blasfemia (Card of Blasphemy)
            </h3>
            <p style={{ fontSize: '0.78rem', color: '#aaa', marginBottom: '12px' }}>
              Crea tu propia carta de tarot imbuida con tus fórmulas de poción y principios para heredarla al siguiente transmigrado.
            </p>

            <form onSubmit={handleForgeCard} className="card-frame" style={{ padding: '14px', background: '#141118' }}>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--gold)' }}>Arcana Mayor de la Carta:</label>
                <select
                  value={selectedArcana}
                  onChange={e => setSelectedArcana(e.target.value)}
                  style={{ width: '100%', padding: '6px 10px', background: '#201a26', border: '1px solid #4a3861', color: '#fff', borderRadius: '3px', fontSize: '0.82rem' }}
                >
                  <option value="Carta del Tonto (The Fool)">0 - El Tonto (The Fool)</option>
                  <option value="Carta del Emperador Negro (The Black Emperor)">IV - El Emperador Negro</option>
                  <option value="Carta de la Puerta (The Door)">I - La Puerta (The Door)</option>
                  <option value="Carta del Error (The Error)">XII - El Error (The Error)</option>
                  <option value="Carta del Sol (The Sun)">XIX - El Sol (The Sun)</option>
                  <option value="Carta de la Visión (The Visionary)">IX - El Visionario (The Visionary)</option>
                </select>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--gold)' }}>Escondrijo en Backlund:</label>
                <input
                  type="text"
                  value={stashLocation}
                  onChange={e => setStashLocation(e.target.value)}
                  style={{ width: '100%', padding: '6px 10px', background: '#201a26', border: '1px solid #4a3861', color: '#fff', borderRadius: '3px', fontSize: '0.82rem' }}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading || (playerSequence > 1 && playerSequence !== -1)}
                className="crimson-btn"
                style={{ width: '100%', padding: '8px', fontSize: '0.82rem' }}
              >
                Forjar Carta de Blasfemia y Ocultar en Backlund
              </button>
            </form>
          </div>

          {/* Estado del Legado & New Game+ */}
          <div>
            <h3 className="cinzel" style={{ color: 'var(--gold)', fontSize: '1rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Crown size={16} /> Herencia de Transmigración (New Game+)
            </h3>

            <div className="card-frame" style={{ padding: '14px', background: '#141118', marginBottom: '12px' }}>
              <div style={{ fontSize: '0.82rem', color: '#fff', marginBottom: '6px' }}>
                Legado Activo: <strong style={{ color: legacyData?.hasLegacyActive ? '#4ade80' : '#f87171' }}>{legacyData?.hasLegacyActive ? 'REGISTRADO' : 'SIN LEGADO'}</strong>
              </div>
              <div style={{ fontSize: '0.78rem', color: '#aaa', margin: '4px 0' }}>
                Fondos de Herencia en Oro: <strong style={{ color: 'var(--gold)' }}>£{legacyData?.bequeathedPounds || 250} libras</strong>
              </div>
              <div style={{ fontSize: '0.78rem', color: '#aaa', margin: '4px 0' }}>
                Cartas de Blasfemia Forjadas: <strong>{legacyData?.forgedCards?.length || 0}</strong>
              </div>
              <div style={{ fontSize: '0.78rem', color: '#d8b4fe', margin: '4px 0' }}>
                Bendición: {legacyData?.blessingEffect}
              </div>
            </div>

            {legacyData?.hasLegacyActive && (
              <button
                disabled={loading}
                onClick={handleClaimNewGame}
                className="action-tab-btn"
                style={{ width: '100%', padding: '10px', fontSize: '0.85rem', color: '#4ade80', borderColor: '#22543d' }}
              >
                🎉 Despertar como Nuevo Transmigrado y Reclamar Herencia
              </button>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
