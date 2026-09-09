import React, { useState } from 'react';
import {
  Crown,
  BookOpen,
  Scroll,
  Sparkles,
  Coins,
  CheckCircle2,
  Eye,
  User,
  Compass
} from 'lucide-react';

export interface TarotMember {
  tarotTitle: string;
  name?: string;
  sequence: number;
  status: string;
  favorPointsWithPlayer: number;
  primaryRegion?: string;
  archetype?: string;
}

export interface TarotPetition {
  id: string;
  requesterId: string;
  requesterTitle: string;
  type: string;
  title: string;
  description: string;
  favorReward: number;
  reputationReward: number;
  isFulfilled: boolean;
  isUrgent?: boolean;
}

export interface RosellePage {
  id: string;
  entryDate: string;
  theme: string;
  title: string;
  contentSnippet: string;
  secretRevelation: string;
  cognitiveStrain: number;
  isUnlocked: boolean;
}

export interface TarotTradeItem {
  id: string;
  name: string;
  offeredBy: string;
  costInPounds: number;
  itemType: string;
  description: string;
  isPurchased: boolean;
}

export interface TarotFavorAction {
  id: string;
  providerTitle: string;
  title: string;
  costInFavorPoints: number;
  description: string;
  effectType: string;
}

interface TarotGatheringViewProps {
  sessionCounter: number;
  isGatheringDay: boolean;
  members: TarotMember[];
  petitions: TarotPetition[];
  rosellePages: RosellePage[];
  trades: TarotTradeItem[];
  favorActions?: TarotFavorAction[];
  walletPounds: number;
  onConveneGathering: () => Promise<any>;
  onReadRosellePage: (pageId: string) => Promise<any>;
  onSubmitRosellePage?: (pageId: string) => Promise<any>;
  onFulfillPetition: (petitionId: string) => Promise<any>;
  onBuyTrade: (tradeId: string) => Promise<any>;
  onRequestFavor?: (actionId: string) => Promise<any>;
}

export const TarotGatheringView: React.FC<TarotGatheringViewProps> = ({
  sessionCounter,
  isGatheringDay,
  members,
  petitions,
  rosellePages,
  trades,
  favorActions = [],
  walletPounds,
  onConveneGathering,
  onReadRosellePage,
  onSubmitRosellePage,
  onFulfillPetition,
  onBuyTrade,
  onRequestFavor
}) => {
  const [activeTab, setActiveTab] = useState<'MEMBERS' | 'ROSELLE' | 'PETITIONS' | 'TRADES' | 'FAVORS'>('MEMBERS');
  const [selectedMember, setSelectedMember] = useState<TarotMember | null>(members[0] || null);
  const [selectedPage, setSelectedPage] = useState<RosellePage | null>(rosellePages.find(p => p.isUnlocked) || rosellePages[0] || null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  const handleConvene = async () => {
    setIsProcessing(true);
    setFeedbackNotice(null);
    try {
      const res = await onConveneGathering();
      if (res?.gathering) {
        setFeedbackNotice(`Asamblea #${res.sessionCounter} concluida en el Castillo de Sefirah. La niebla carmesí se asienta.`);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReadPage = async (pageId: string) => {
    setIsProcessing(true);
    try {
      const res = await onReadRosellePage(pageId);
      if (res?.revelation) {
        setFeedbackNotice(`Página descifrada con éxito: "${res.title}". Revelación: ${res.revelation}`);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFulfill = async (petitionId: string) => {
    setIsProcessing(true);
    try {
      const res = await onFulfillPetition(petitionId);
      if (res?.message) {
        setFeedbackNotice(res.message);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTrade = async (tradeId: string) => {
    setIsProcessing(true);
    try {
      const res = await onBuyTrade(tradeId);
      if (res?.message) {
        setFeedbackNotice(res.message);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRequestFavor = async (actionId: string) => {
    if (!onRequestFavor) return;
    setIsProcessing(true);
    try {
      const res = await onRequestFavor(actionId);
      if (res?.message) {
        setFeedbackNotice(res.message);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmitRoselle = async (pageId: string) => {
    if (!onSubmitRosellePage) return;
    setIsProcessing(true);
    try {
      const res = await onSubmitRosellePage(pageId);
      if (res?.message) {
        setFeedbackNotice(res.message);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Palacio Divino sobre la Niebla Gris — Banner Teatral */}
      <div
        className="card-frame"
        style={{
          padding: '26px',
          background: 'radial-gradient(ellipse at center, #1b263b 0%, #0d131f 65%, #05080e 100%)',
          border: '2px solid #64748b',
          boxShadow: '0 0 50px rgba(100, 116, 139, 0.25)',
          borderRadius: '8px',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Crown size={28} color="#94a3b8" />
              <h2 className="cinzel" style={{ color: '#e2e8f0', fontSize: '1.6rem', letterSpacing: '2px' }}>
                EL CASTILLO DE SEFIRAH • LA MESA DE BRONCE
              </h2>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', fontStyle: 'italic', marginTop: '6px' }}>
              "El Loco que no pertenece a esta era; el misterioso Gobernante sobre la niebla gris; el Rey de Amarillo y Negro que blinda la buena suerte."
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'rgba(15, 23, 42, 0.85)', border: '1px solid #475569', padding: '8px 16px', borderRadius: '4px', textAlign: 'right' }}>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>Sesión del Club</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#f8fafc' }}>
                Asamblea #{sessionCounter}
              </div>
              <div style={{ fontSize: '0.68rem', color: isGatheringDay ? '#34d399' : '#94a3b8', marginTop: '2px' }}>
                {isGatheringDay ? 'Lunes de Asamblea Sagrada' : 'Sesión Ordinaria'}
              </div>
            </div>

            <button
              onClick={handleConvene}
              disabled={isProcessing}
              className="action-tab-btn active"
              style={{ padding: '10px 20px', background: '#334155', borderColor: '#94a3b8', color: '#f8fafc', boxShadow: '0 0 20px rgba(148, 163, 184, 0.3)' }}
            >
              <Sparkles size={16} />
              <span>{isProcessing ? 'Convocando...' : 'Convocar Asamblea'}</span>
            </button>
          </div>
        </div>

        {feedbackNotice && (
          <div className="parchment-sheet" style={{ marginTop: '16px', padding: '12px 18px', borderLeft: '4px solid #64748b' }}>
            <p style={{ fontSize: '0.85rem', color: '#1e293b', fontStyle: 'italic', margin: 0 }}>
              {feedbackNotice}
            </p>
          </div>
        )}
      </div>

      {/* Sub-navegación del Castillo de Sefirah */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {[
          { id: 'MEMBERS', label: `Miembros de la Mesa (${members.length})`, icon: User },
          { id: 'ROSELLE', label: `Diario de Roselle (${rosellePages.filter(p => p.isUnlocked).length}/${rosellePages.length})`, icon: BookOpen },
          { id: 'PETITIONS', label: `Peticiones Sagradas (${petitions.filter(p => !p.isFulfilled).length})`, icon: Scroll },
          { id: 'TRADES', label: `Trueques de Bronce (${trades.filter(t => !t.isPurchased).length})`, icon: Coins },
          { id: 'FAVORS', label: `Auxilio & Favores (${favorActions.length})`, icon: Sparkles }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id as any); setFeedbackNotice(null); }}
            className={`action-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            style={{ fontSize: '0.85rem', padding: '8px 16px' }}
          >
            <tab.icon size={16} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* PESTAÑA 1: MIEMBROS AUTÓNOMOS DE LA MESA DE BRONCE */}
      {activeTab === 'MEMBERS' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {members.map((m, idx) => {
            const isSelected = selectedMember?.tarotTitle === m.tarotTitle;

            return (
              <div
                key={idx}
                onClick={() => setSelectedMember(m)}
                className="card-frame"
                style={{
                  padding: '18px',
                  background: isSelected ? 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)' : '#141a24',
                  borderColor: isSelected ? '#94a3b8' : '#334155',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  borderTop: '3px solid #64748b'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span className="gold-badge" style={{ borderColor: '#64748b', color: '#cbd5e1' }}>
                    Secuencia {m.sequence}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    Devoción: <strong style={{ color: 'var(--gold)' }}>{m.favorPointsWithPlayer} pts</strong>
                  </span>
                </div>

                <h3 style={{ color: '#f8fafc', fontSize: '1.15rem', fontWeight: 'bold' }}>
                  {m.tarotTitle}
                </h3>
                {m.name && (
                  <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>{m.name}</div>
                )}

                <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '6px' }}>
                  Estado: <strong style={{ color: m.status === 'NORMAL' || m.status === 'ACTING' ? '#6ee7b7' : '#fcd34d' }}>{m.status}</strong>
                </div>

                {m.primaryRegion && (
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Compass size={12} />
                    <span>{m.primaryRegion}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* PESTAÑA 2: DIARIO DEL EMPERADOR ROSELLE (CARACTERES CHINOS) */}
      {activeTab === 'ROSELLE' && (
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '20px' }}>
          {/* Lista de Páginas */}
          <div className="card-frame" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--gold)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '4px' }}>
              Páginas Rescatadas
            </div>

            {rosellePages.map((page) => {
              const isSelected = selectedPage?.id === page.id;

              return (
                <div
                  key={page.id}
                  onClick={() => setSelectedPage(page)}
                  className="card-frame"
                  style={{
                    padding: '12px',
                    cursor: 'pointer',
                    background: isSelected ? '#1e293b' : '#141a24',
                    borderColor: isSelected ? '#94a3b8' : '#334155',
                    opacity: page.isUnlocked ? 1 : 0.6
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.7rem', color: page.isUnlocked ? '#6ee7b7' : '#94a3b8' }}>
                      {page.isUnlocked ? 'Descifrada' : 'Sello Oculto'}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                      {page.entryDate}
                    </span>
                  </div>
                  <strong style={{ fontSize: '0.88rem', color: isSelected ? '#f8fafc' : '#cbd5e1' }}>
                    {page.title}
                  </strong>
                </div>
              );
            })}
          </div>

          {/* Visor de la Página Seleccionada */}
          {selectedPage ? (
            <div className="card-frame" style={{ padding: '24px', borderTop: '3px solid #64748b' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <span className="gold-badge" style={{ borderColor: '#64748b', color: '#cbd5e1' }}>{selectedPage.theme}</span>
                  <h3 className="cinzel" style={{ color: '#f8fafc', fontSize: '1.3rem', margin: '8px 0 2px 0' }}>
                    {selectedPage.title}
                  </h3>
                  <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>Fecha de Escritura: {selectedPage.entryDate}</div>
                </div>

                {!selectedPage.isUnlocked ? (
                  <button
                    onClick={() => handleReadPage(selectedPage.id)}
                    disabled={isProcessing}
                    className="action-tab-btn active"
                    style={{ padding: '8px 16px' }}
                  >
                    <BookOpen size={16} />
                    <span>Descifrar en Caracteres Terrestres</span>
                  </button>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6ee7b7', fontSize: '0.85rem' }}>
                      <CheckCircle2 size={16} />
                      <span>Texto Traducido</span>
                    </div>
                    {onSubmitRosellePage && (
                      <button
                        onClick={() => handleSubmitRoselle(selectedPage.id)}
                        disabled={isProcessing}
                        className="action-tab-btn"
                        style={{ padding: '6px 12px', fontSize: '0.8rem', borderColor: '#eab308', color: '#fef08a' }}
                        title="Presentar la página transcrita a la asamblea a cambio de favores"
                      >
                        <Sparkles size={14} /> Ofrendar a la Asamblea (+Favor)
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Fragmento Original Traducido */}
              <div className="parchment-sheet" style={{ marginTop: '20px', padding: '18px', borderLeft: '4px solid #475569' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 'bold', color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Manuscrito de Roselle Gustav:
                </div>
                <p style={{ fontSize: '0.92rem', color: '#1e293b', fontStyle: 'italic', lineHeight: 1.6, margin: 0 }}>
                  "{selectedPage.contentSnippet}"
                </p>
              </div>

              {/* Revelación Oculta */}
              <div className="card-frame" style={{ marginTop: '16px', padding: '16px', background: '#0f172a', borderColor: '#334155' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Eye size={14} />
                  <span>Revelación Mística para el Beyonder:</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: '#e2e8f0', lineHeight: 1.5, margin: 0 }}>
                  {selectedPage.isUnlocked ? selectedPage.secretRevelation : 'El contenido místico permanece sellado bajo la niebla. Pulsa "Descifrar" para asimilar el conocimiento.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="card-frame" style={{ padding: '40px', textAlign: 'center' }}>
              <p style={{ color: '#94a3b8' }}>Selecciona una página del diario para examinar las anotaciones del Emperador.</p>
            </div>
          )}
        </div>
      )}

      {/* PESTAÑA 3: PETICIONES SAGRADAS (TAROT PETITIONS) */}
      {activeTab === 'PETITIONS' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {petitions.length === 0 ? (
            <div className="card-frame" style={{ padding: '40px', textAlign: 'center' }}>
              <p style={{ color: '#94a3b8' }}>No hay peticiones urgentes formuladas por los miembros en este momento.</p>
            </div>
          ) : (
            petitions.map((pet) => (
              <div
                key={pet.id}
                className="card-frame"
                style={{
                  padding: '18px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '14px',
                  borderLeft: pet.isFulfilled ? '4px solid #10b981' : (pet.isUrgent ? '4px solid var(--crimson)' : '4px solid var(--gold)')
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span className="gold-badge">{pet.requesterTitle}</span>
                    <strong style={{ color: '#f8fafc', fontSize: '1.05rem' }}>{pet.title}</strong>
                    {pet.isUrgent && <span style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 'bold' }}>URGENTE</span>}
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#cbd5e1', margin: '4px 0 6px 0', lineHeight: 1.4 }}>
                    {pet.description}
                  </p>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                    Recompensa de Gracia: <strong style={{ color: 'var(--gold)' }}>+{pet.favorReward} pts de Devoción</strong> (+5% Digestión, +5 Sanidad)
                  </div>
                </div>

                <div>
                  {pet.isFulfilled ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6ee7b7', fontSize: '0.88rem', fontWeight: 'bold' }}>
                      <CheckCircle2 size={18} />
                      <span>Petición Concedida</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleFulfill(pet.id)}
                      disabled={isProcessing}
                      className="crimson-btn"
                      style={{ padding: '8px 18px' }}
                    >
                      Conceder Bendición de 'El Loco'
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* PESTAÑA 4: TRUEQUES DE LA MESA DE BRONCE */}
      {activeTab === 'TRADES' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {trades.length === 0 ? (
            <div className="card-frame" style={{ padding: '40px', textAlign: 'center', gridColumn: '1 / -1' }}>
              <p style={{ color: '#94a3b8' }}>No hay transacciones activas ofertadas en la mesa de bronce en esta sesión.</p>
            </div>
          ) : (
            trades.map((t) => (
              <div
                key={t.id}
                className="card-frame"
                style={{
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  background: '#141a24',
                  borderColor: t.isPurchased ? '#334155' : '#475569',
                  opacity: t.isPurchased ? 0.6 : 1
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span className="gold-badge" style={{ borderColor: '#64748b', color: '#cbd5e1' }}>{t.itemType}</span>
                    <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Ofrece: {t.offeredBy}</span>
                  </div>

                  <strong style={{ color: '#f8fafc', fontSize: '1.05rem' }}>{t.name}</strong>
                  <p style={{ fontSize: '0.82rem', color: '#cbd5e1', margin: '8px 0 14px 0', lineHeight: 1.4 }}>
                    {t.description}
                  </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #334155', paddingTop: '10px' }}>
                  <div style={{ fontSize: '0.92rem', fontWeight: 'bold', color: 'var(--gold)' }}>
                    £{t.costInPounds} Libras
                  </div>

                  {t.isPurchased ? (
                    <span style={{ fontSize: '0.8rem', color: '#6ee7b7' }}>Adquirido</span>
                  ) : (
                    <button
                      onClick={() => handleTrade(t.id)}
                      disabled={isProcessing || walletPounds < t.costInPounds}
                      className="action-tab-btn"
                      style={{ padding: '6px 12px', fontSize: '0.82rem' }}
                    >
                      Formalizar Trueque
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* PESTAÑA 5: AUXILIO & FAVORES MÍSTICOS DE LOS SANTOS */}
      {activeTab === 'FAVORS' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="card-frame" style={{ padding: '16px', background: '#0f172a', borderLeft: '4px solid var(--gold)' }}>
            <h4 className="cinzel" style={{ color: 'var(--gold)', margin: 0, fontSize: '14px' }}>
              INTERCESIÓN SAGRADA SOBRE LA NIEBLA GRIS
            </h4>
            <p style={{ margin: '6px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>
              Utiliza los Puntos de Favor acumulados con los Ángeles y Santos del Club Tarot para solicitar auxilios extraordinarios: tratamientos de cordura con Audrey, purificaciones solares con Derrick o pergaminos de escape de emergencia con Fors.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {favorActions.map(action => {
              // Buscar el miembro proveedor
              const provider = members.find(m =>
                m.tarotTitle.toLowerCase().includes(
                  action.providerTitle.toLowerCase().replace('miss ', '').replace('mr. ', '').replace('little ', '')
                )
              );
              const currentPoints = provider?.favorPointsWithPlayer ?? 0;
              const canAfford = currentPoints >= action.costInFavorPoints;

              return (
                <div
                  key={action.id}
                  className="card-frame"
                  style={{
                    padding: '18px',
                    background: '#141a24',
                    borderTop: '3px solid #94a3b8',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span className="gold-badge" style={{ borderColor: '#64748b', color: '#cbd5e1' }}>
                        {action.providerTitle}
                      </span>
                      <span style={{ fontSize: '11px', color: canAfford ? '#34d399' : '#f87171' }}>
                        Favor: {currentPoints} / {action.costInFavorPoints} pts
                      </span>
                    </div>

                    <h4 className="cinzel" style={{ color: '#f8fafc', margin: '0 0 8px 0', fontSize: '14px' }}>
                      {action.title}
                    </h4>

                    <p style={{ fontSize: '12px', color: '#cbd5e1', margin: '0 0 14px 0', lineHeight: 1.4 }}>
                      {action.description}
                    </p>
                  </div>

                  <button
                    onClick={() => handleRequestFavor(action.id)}
                    disabled={isProcessing || !canAfford}
                    className="vintage-button"
                    style={{
                      width: '100%',
                      padding: '8px',
                      fontSize: '12px',
                      opacity: canAfford ? 1 : 0.5,
                      cursor: canAfford ? 'pointer' : 'not-allowed'
                    }}
                  >
                    {isProcessing ? 'Invocando Auxilio...' : `Solicitar Auxilio (${action.costInFavorPoints} pts)`}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default TarotGatheringView;
