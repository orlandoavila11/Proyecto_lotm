import React, { useState, useEffect } from 'react';
import { Building2, Coins, AlertTriangle, Crown } from 'lucide-react';

export interface OrgRank {
  rankLevel: number;
  title: string;
  minReputation: number;
  weeklySalaryPounds: number;
  unlockedBenefits: string[];
}

export interface OrgMission {
  id: string;
  orgId: string;
  title: string;
  missionType: string;
  description: string;
  requiredRank: number;
  rewardPounds: number;
  reputationGain: number;
  dangerRating: number;
}

export interface LoyaltyDilemma {
  id: string;
  orgId: string;
  title: string;
  dilemmaType: string;
  description: string;
  options: [
    { text: string; outcome: string; loyaltyDelta: number; sanityDelta: number },
    { text: string; outcome: string; loyaltyDelta: number; sanityDelta: number }
  ];
}

export interface PlayerMembership {
  orgId: string;
  currentRankLevel: number;
  reputation: number;
  suspicion?: number;
  completedMissions: string[];
  loyaltyScore: number;
  isInfiltrating: boolean;
  coverIdentityId?: string;
  isExpelled: boolean;
}

export interface OrganizationData {
  id: string;
  name: string;
  category: string;
  leaderTitle: string;
  headquarters: string;
  influenceScore: number;
  totalAnchorsGenerated: number;
  ranks?: OrgRank[];
  missions?: OrgMission[];
  loyaltyDilemmas?: LoyaltyDilemma[];
  playerMembership?: PlayerMembership | null;
}

interface OrganizationViewProps {
  playerSequence: number;
  onRefreshState: () => void;
  onNotice: (title: string, body: string) => void;
}

export const OrganizationView: React.FC<OrganizationViewProps> = ({
  playerSequence,
  onRefreshState,
  onNotice
}) => {
  const [organizations, setOrganizations] = useState<OrganizationData[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [loading, setLoading] = useState<boolean>(true);
  const [cultName, setCultName] = useState<string>('');
  const [cultDoctrine, setCultDoctrine] = useState<string>('El Salvador de las Sombras');
  const [personas, setPersonas] = useState<Array<{ id: string; legalName: string; registeredProfession: string; isBurned: boolean }>>([]);
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>('');
  const [showInfiltrateModal, setShowInfiltrateModal] = useState<boolean>(false);

  const fetchOrganizations = async () => {
    try {
      const res = await fetch('/api/organizations');
      if (res.ok) {
        const data = await res.json();
        setOrganizations(data.organizations || []);
        if (!selectedOrgId && data.organizations?.length > 0) {
          setSelectedOrgId(data.organizations[0].id);
        }
      }

      // Obtener coberturas del jugador para infiltraciones seguras
      const pRes = await fetch('/api/personas');
      if (pRes.ok) {
        const pData = await pRes.json();
        const available = (pData.personas || []).filter((p: any) => !p.isBurned);
        setPersonas(available);
        if (available.length > 0) {
          setSelectedPersonaId(available[0].id);
        }
      }
    } catch (err) {
      console.error('Error fetching organizations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const selectedOrg = organizations.find(o => o.id === selectedOrgId) || organizations[0] || null;
  const membership = selectedOrg?.playerMembership;

  const handleJoin = async (orgId: string, asInfiltrator: boolean = false, coverPersonaId?: string) => {
    const res = await fetch('/api/organizations/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orgId, asInfiltrator, coverPersonaId: asInfiltrator ? (coverPersonaId || selectedPersonaId) : undefined })
    });
    const data = await res.json();
    onNotice(data.success ? 'Filiación Aprobada' : 'Solicitud Denegada', data.message);
    setShowInfiltrateModal(false);
    fetchOrganizations();
    onRefreshState();
  };

  const handleClaimSalary = async (orgId: string) => {
    const res = await fetch('/api/organizations/salary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orgId })
    });
    const data = await res.json();
    onNotice(data.success ? 'Estipendio Recibido' : 'Cobro Fallido', data.message);
    fetchOrganizations();
    onRefreshState();
  };

  const handlePromote = async (orgId: string) => {
    const res = await fetch('/api/organizations/promote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orgId })
    });
    const data = await res.json();
    onNotice(data.success ? 'Ascenso Jerárquico' : 'Requisitos No Cumplidos', data.message);
    fetchOrganizations();
    onRefreshState();
  };

  const handleCompleteMission = async (missionId: string) => {
    const res = await fetch('/api/organizations/missions/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ missionId })
    });
    const data = await res.json();
    onNotice(data.success ? 'Misión Concluida' : 'Fallo en la Misión', data.message);
    fetchOrganizations();
    onRefreshState();
  };

  const handleResolveDilemma = async (dilemmaId: string, choiceIndex: 0 | 1) => {
    const res = await fetch('/api/organizations/dilemmas/resolve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dilemmaId, choiceIndex })
    });
    const data = await res.json();
    onNotice('Dilema Moral Resuelto', data.message);
    fetchOrganizations();
    onRefreshState();
  };

  const handleFoundCult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cultName) return;
    const res = await fetch('/api/organizations/cult/found', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: cultName, doctrineTitle: cultDoctrine })
    });
    const data = await res.json();
    onNotice(data.success ? 'Congregación Sagrada' : 'Impedimento Divino', data.message);
    setCultName('');
    fetchOrganizations();
    onRefreshState();
  };

  const handleRecruit = async (orgId: string) => {
    const res = await fetch('/api/organizations/cult/recruit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orgId, count: 10 })
    });
    const data = await res.json();
    onNotice('Adeptos Reclutados', data.message);
    fetchOrganizations();
    onRefreshState();
  };

  const filteredOrgs = filterCategory === 'ALL'
    ? organizations
    : organizations.filter(o => o.category === filterCategory);

  if (loading) {
    return (
      <div className="card-frame" style={{ padding: '30px', textAlign: 'center' }}>
        <p style={{ color: 'var(--gold)' }}>Cargando archivos de la jerarquía eclesiástica y sociedades secretas...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '20px' }}>
      {/* Columna Izquierda: Directorio de Organizaciones */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div className="card-frame" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Building2 size={18} color="var(--gold)" />
            <h3 className="cinzel" style={{ color: 'var(--gold)', fontSize: '1rem', margin: 0 }}>
              Facciones & Sociedades
            </h3>
          </div>

          {/* Filtros de Categoría */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
            {[
              { id: 'ALL', label: 'Todas' },
              { id: 'ORTHODOX_CHURCH', label: 'Iglesias' },
              { id: 'SECRET_SOCIETY', label: 'Secretas' },
              { id: 'MILITARY_INTELLIGENCE', label: 'Militares' },
              { id: 'PLAYER_FOUNDED_CULT', label: 'Cultos' }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setFilterCategory(cat.id)}
                className={`action-tab-btn ${filterCategory === cat.id ? 'active' : ''}`}
                style={{ fontSize: '0.72rem', padding: '4px 8px' }}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Lista de Facciones */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '520px', overflowY: 'auto' }}>
            {filteredOrgs.map(org => {
              const isSelected = org.id === selectedOrgId;
              const hasMembership = !!org.playerMembership && !org.playerMembership.isExpelled;

              return (
                <div
                  key={org.id}
                  onClick={() => setSelectedOrgId(org.id)}
                  className="card-frame"
                  style={{
                    padding: '10px 12px',
                    cursor: 'pointer',
                    borderColor: isSelected ? 'var(--gold)' : hasMembership ? '#4ade80' : 'var(--card-border)',
                    background: isSelected ? '#2a2218' : '#171412'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: '0.85rem', color: isSelected ? 'var(--gold)' : '#ded9d0' }}>
                      {org.name}
                    </strong>
                    {hasMembership && (
                      <span style={{ fontSize: '0.65rem', background: '#064e3b', color: '#6ee7b7', padding: '2px 6px', borderRadius: '3px', fontWeight: 'bold' }}>
                        MIEMBRO
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#a3998b', marginTop: '4px' }}>
                    HQ: {org.headquarters} • Influencia: {org.influenceScore}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Módulo de Semidiós: Fundar Culto */}
        {playerSequence <= 4 && (
          <div className="card-frame" style={{ padding: '16px', border: '1px solid #c084fc' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Crown size={16} color="#c084fc" />
              <h4 className="cinzel" style={{ color: '#d8bbf9', fontSize: '0.9rem', margin: 0 }}>
                Establecer Congregación Sagrada
              </h4>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#bbb', marginBottom: '10px', lineHeight: 1.4 }}>
              Como Semidiós, funda una religión para anclar tu humanidad y resistir el despertar del Creador.
            </p>
            <form onSubmit={handleFoundCult} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <input
                type="text"
                placeholder="Nombre del Culto (ej: Orden del Loco)"
                value={cultName}
                onChange={e => setCultName(e.target.value)}
                style={{ padding: '6px 10px', background: '#1c1724', border: '1px solid #5e437c', color: '#fff', fontSize: '0.8rem', borderRadius: '3px' }}
              />
              <input
                type="text"
                placeholder="Título Doctrinal (ej: El Señor del Tiempo)"
                value={cultDoctrine}
                onChange={e => setCultDoctrine(e.target.value)}
                style={{ padding: '6px 10px', background: '#1c1724', border: '1px solid #5e437c', color: '#fff', fontSize: '0.8rem', borderRadius: '3px' }}
              />
              <button
                type="submit"
                className="action-tab-btn"
                style={{ background: '#3b1d54', borderColor: '#9333ea', color: '#f3e8ff', fontSize: '0.8rem', padding: '6px' }}
              >
                Fundar Culto Sagrado (+30 Anclas)
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Columna Derecha: Detalle de la Organización y Acciones */}
      <div>
        {selectedOrg ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Cabecera de la Facción */}
            <div className="card-frame" style={{ padding: '20px', borderLeft: '4px solid var(--gold)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--gold)', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 'bold' }}>
                    {selectedOrg.category.replace(/_/g, ' ')}
                  </span>
                  <h2 className="cinzel" style={{ color: '#fff', fontSize: '1.4rem', marginTop: '2px' }}>
                    {selectedOrg.name}
                  </h2>
                  <div style={{ fontSize: '0.85rem', color: '#b3a898', marginTop: '4px' }}>
                    Líder: <strong style={{ color: 'var(--gold)' }}>{selectedOrg.leaderTitle}</strong> • Sede Central: {selectedOrg.headquarters}
                  </div>
                </div>

                {/* Botones de Afiliación */}
                {!membership ? (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleJoin(selectedOrg.id, false)}
                      className="gold-btn"
                      style={{ padding: '8px 14px', fontSize: '0.82rem' }}
                    >
                      Juramentar Lealtad
                    </button>
                    <button
                      onClick={() => setShowInfiltrateModal(true)}
                      className="action-tab-btn"
                      style={{ padding: '8px 14px', fontSize: '0.82rem', borderColor: '#9333ea', color: '#d8bbf9' }}
                    >
                      Infiltrarse Encubierto
                    </button>
                  </div>
                ) : membership.isExpelled ? (
                  <div style={{ background: '#450a0a', border: '1px solid #ef4444', padding: '6px 12px', borderRadius: '4px', color: '#fca5a5', fontSize: '0.8rem', fontWeight: 'bold' }}>
                    ⚠️ DECLARADO TRAIDOR / EXPULSADO
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button
                      onClick={() => handleClaimSalary(selectedOrg.id)}
                      className="gold-btn"
                      style={{ padding: '8px 14px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Coins size={14} /> Cobrar Estipendio Semanal
                    </button>
                    {selectedOrg.category === 'PLAYER_FOUNDED_CULT' && (
                      <button
                        onClick={() => handleRecruit(selectedOrg.id)}
                        className="action-tab-btn"
                        style={{ padding: '8px 14px', fontSize: '0.82rem', borderColor: '#c084fc', color: '#e9d5ff' }}
                      >
                        Reclutar 10 Creyentes
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Modal de Selección de Cobertura para Infiltración */}
              {showInfiltrateModal && (
                <div style={{ marginTop: '16px', padding: '16px', background: '#1c1524', border: '1px solid #9333ea', borderRadius: '6px' }}>
                  <h4 className="cinzel" style={{ color: '#d8bbf9', margin: '0 0 8px 0', fontSize: '13px' }}>
                    DESIGNAR COBERTURA LEGAL PARA LA INFILTRACIÓN
                  </h4>
                  <p style={{ fontSize: '11px', color: '#b3a898', margin: '0 0 10px 0' }}>
                    Si los inquisidores descubren tu doble juego (sospecha 100%), esta cobertura será calcinada en el Registro Civil de Loen y dada por desaparecida en prensa, salvaguardando tu verdadera persona.
                  </p>
                  {personas.length === 0 ? (
                    <div style={{ color: '#ef4444', fontSize: '12px' }}>
                      No posees coberturas civiles activas. Ve al Dossier de Identidades en el Despacho para crear una.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <select
                        value={selectedPersonaId}
                        onChange={e => setSelectedPersonaId(e.target.value)}
                        style={{ padding: '6px 10px', background: '#120d18', border: '1px solid #9333ea', color: '#fff', fontSize: '12px', borderRadius: '4px', flex: 1 }}
                      >
                        {personas.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.legalName} ({p.registeredProfession})
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => handleJoin(selectedOrg.id, true, selectedPersonaId)}
                        className="vintage-button"
                        style={{ padding: '6px 14px', fontSize: '12px', background: '#4c1d95', color: '#f5f3ff' }}
                      >
                        Iniciar Infiltración
                      </button>
                      <button
                        onClick={() => setShowInfiltrateModal(false)}
                        className="action-tab-btn"
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                      >
                        Cancelar
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Estado de Membresía del Jugador */}
              {membership && !membership.isExpelled && (
                <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid var(--card-border)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
                    <div style={{ background: '#1c1916', padding: '10px', borderRadius: '4px' }}>
                      <div style={{ fontSize: '0.72rem', color: '#8c7e6c' }}>ESTADO</div>
                      <div style={{ fontSize: '0.9rem', color: membership.isInfiltrating ? '#c084fc' : '#4ade80', fontWeight: 'bold' }}>
                        {membership.isInfiltrating ? 'Infiltrador Encubierto' : 'Miembro Oficial'}
                      </div>
                    </div>
                    {membership.coverIdentityId && (
                      <div style={{ background: '#1c1916', padding: '10px', borderRadius: '4px' }}>
                        <div style={{ fontSize: '0.72rem', color: '#8c7e6c' }}>COBERTURA ASIGNADA</div>
                        <div style={{ fontSize: '0.85rem', color: '#d8bbf9', fontWeight: 'bold' }}>
                          {personas.find(p => p.id === membership.coverIdentityId)?.legalName || membership.coverIdentityId}
                        </div>
                      </div>
                    )}
                    <div style={{ background: '#1c1916', padding: '10px', borderRadius: '4px' }}>
                      <div style={{ fontSize: '0.72rem', color: '#8c7e6c' }}>RANGO JERÁRQUICO</div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--gold)', fontWeight: 'bold' }}>
                        Grado {membership.currentRankLevel} ({selectedOrg.ranks?.find(r => r.rankLevel === membership.currentRankLevel)?.title || 'Iniciado'})
                      </div>
                    </div>
                    <div style={{ background: '#1c1916', padding: '10px', borderRadius: '4px' }}>
                      <div style={{ fontSize: '0.72rem', color: '#8c7e6c' }}>REPUTACIÓN ACUMULADA</div>
                      <div style={{ fontSize: '0.9rem', color: '#38bdf8', fontWeight: 'bold' }}>
                        {membership.reputation} Puntos
                      </div>
                    </div>
                    <div style={{ background: '#1c1916', padding: '10px', borderRadius: '4px' }}>
                      <div style={{ fontSize: '0.72rem', color: '#8c7e6c' }}>SOSPECHA DE FACCIÓN</div>
                      <div style={{ fontSize: '0.9rem', color: (membership.suspicion || 0) >= 70 ? '#ef4444' : '#fb923c', fontWeight: 'bold' }}>
                        {membership.suspicion || 0} / 100%
                      </div>
                    </div>
                    <div style={{ background: '#1c1916', padding: '10px', borderRadius: '4px' }}>
                      <div style={{ fontSize: '0.72rem', color: '#8c7e6c' }}>LEALTAD INTERNA</div>
                      <div style={{ fontSize: '0.9rem', color: membership.loyaltyScore > 50 ? '#4ade80' : '#f59e0b', fontWeight: 'bold' }}>
                        {membership.loyaltyScore}%
                      </div>
                    </div>
                  </div>

                  {(membership.suspicion || 0) >= 70 && (
                    <div style={{ marginTop: '10px', padding: '8px 12px', background: '#450a0a', border: '1px solid #ef4444', borderRadius: '4px', fontSize: '11px', color: '#fca5a5' }}>
                      ⚠️ <strong>Vigilancia Inquisitorial Crítica:</strong> La facción sospecha de tus movimientos ({membership.suspicion}%). Si la sospecha alcanza el 100%, tu cobertura será calcinada.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Jerarquía de Rangos */}
            {selectedOrg.ranks && selectedOrg.ranks.length > 0 && (
              <div className="card-frame" style={{ padding: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h4 className="cinzel" style={{ color: 'var(--gold)', fontSize: '0.95rem', margin: 0 }}>
                    Escalafón Jerárquico & Salarios
                  </h4>
                  {membership && !membership.isExpelled && (
                    <button
                      onClick={() => handlePromote(selectedOrg.id)}
                      className="action-tab-btn"
                      style={{ fontSize: '0.78rem', padding: '4px 10px', borderColor: 'var(--gold)' }}
                    >
                      Solicitar Ascenso de Grado
                    </button>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
                  {selectedOrg.ranks.map(r => {
                    const isCurrent = membership?.currentRankLevel === r.rankLevel;
                    return (
                      <div
                        key={r.rankLevel}
                        style={{
                          background: isCurrent ? '#2b2319' : '#181512',
                          border: isCurrent ? '1px solid var(--gold)' : '1px solid var(--card-border)',
                          padding: '10px 12px',
                          borderRadius: '4px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <strong style={{ fontSize: '0.85rem', color: isCurrent ? 'var(--gold)' : '#fff' }}>
                            {r.title} (Grado {r.rankLevel})
                          </strong>
                          {isCurrent && <span style={{ fontSize: '0.65rem', color: 'var(--gold)', fontWeight: 'bold' }}>ACTUAL</span>}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#a89d8d', marginTop: '4px' }}>
                          Salario: £{r.weeklySalaryPounds}/sem • Min Rep: {r.minReputation}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#7a6f5f', marginTop: '4px' }}>
                          Beneficios: {r.unlockedBenefits.join(', ')}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Misiones de la Organización */}
            {selectedOrg.missions && selectedOrg.missions.length > 0 && (
              <div className="card-frame" style={{ padding: '18px' }}>
                <h4 className="cinzel" style={{ color: 'var(--gold)', fontSize: '0.95rem', marginBottom: '12px' }}>
                  Misiones y Deberes Oficiales ({selectedOrg.missions.length})
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {selectedOrg.missions.map(m => {
                    const isCompleted = membership?.completedMissions.includes(m.id);
                    const canPerform = !!membership && !membership.isExpelled && membership.currentRankLevel >= m.requiredRank;

                    return (
                      <div
                        key={m.id}
                        className="parchment-sheet"
                        style={{
                          padding: '14px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          opacity: isCompleted ? 0.6 : 1
                        }}
                      >
                        <div style={{ maxWidth: '75%' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '0.68rem', background: '#3b2f20', color: '#d4af37', padding: '2px 6px', borderRadius: '3px', fontWeight: 'bold' }}>
                              {m.missionType}
                            </span>
                            <strong style={{ color: '#251c14', fontSize: '0.9rem' }}>{m.title}</strong>
                            {isCompleted && (
                              <span style={{ fontSize: '0.72rem', color: '#166534', fontWeight: 'bold' }}>
                                ✓ Completada
                              </span>
                            )}
                          </div>
                          <p style={{ fontSize: '0.8rem', color: '#3d3124', margin: '4px 0 0 0', lineHeight: 1.4 }}>
                            {m.description}
                          </p>
                          <div style={{ fontSize: '0.72rem', color: '#6e5f4d', marginTop: '4px' }}>
                            Recompensa: £{m.rewardPounds} libras • +{m.reputationGain} Reputación • Peligro: Rango {m.dangerRating}
                          </div>
                        </div>

                        <div>
                          {isCompleted ? (
                            <span style={{ fontSize: '0.78rem', color: '#166534', fontWeight: 'bold' }}>Concluida</span>
                          ) : (
                            <button
                              disabled={!canPerform}
                              onClick={() => handleCompleteMission(m.id)}
                              className={canPerform ? "gold-btn" : "action-tab-btn"}
                              style={{ padding: '8px 14px', fontSize: '0.8rem' }}
                            >
                              {canPerform ? 'Ejecutar Misión' : `Req. Grado ${m.requiredRank}`}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Dilemas de Lealtad & Crisis Morales */}
            {selectedOrg.loyaltyDilemmas && selectedOrg.loyaltyDilemmas.length > 0 && membership && !membership.isExpelled && (
              <div className="card-frame" style={{ padding: '18px', border: '1px solid #ef4444' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <AlertTriangle size={18} color="#ef4444" />
                  <h4 className="cinzel" style={{ color: '#fca5a5', fontSize: '0.95rem', margin: 0 }}>
                    Dilema de Lealtad: {selectedOrg.loyaltyDilemmas[0].title}
                  </h4>
                </div>
                <p style={{ fontSize: '0.85rem', color: '#ccc', marginBottom: '14px', lineHeight: 1.45 }}>
                  {selectedOrg.loyaltyDilemmas[0].description}
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  {selectedOrg.loyaltyDilemmas[0].options.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleResolveDilemma(selectedOrg.loyaltyDilemmas![0].id, idx as 0 | 1)}
                      className="card-frame"
                      style={{
                        padding: '12px',
                        textAlign: 'left',
                        cursor: 'pointer',
                        background: '#201416',
                        borderColor: '#7f1d1d'
                      }}
                    >
                      <strong style={{ fontSize: '0.82rem', color: '#fca5a5' }}>Opción {idx + 1}:</strong>
                      <div style={{ fontSize: '0.78rem', color: '#e5e7eb', marginTop: '4px' }}>
                        "{opt.text}"
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '6px' }}>
                        Lealtad: {opt.loyaltyDelta >= 0 ? `+${opt.loyaltyDelta}` : opt.loyaltyDelta}% • Cordura: {opt.sanityDelta >= 0 ? `+${opt.sanityDelta}` : opt.sanityDelta}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="card-frame" style={{ padding: '40px', textAlign: 'center' }}>
            <p style={{ color: '#a89c89' }}>Selecciona una organización para revisar sus doctrinas y escalafón.</p>
          </div>
        )}
      </div>
    </div>
  );
};
