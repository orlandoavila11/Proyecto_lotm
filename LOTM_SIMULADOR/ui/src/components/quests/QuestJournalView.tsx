import React, { useState } from 'react';
import { Scroll, CheckCircle2, Coins, Sparkles } from 'lucide-react';

export interface QuestReward {
  pounds: number;
  actingDigestBonus?: number;
  sanityBonus?: number;
  lootChance?: number;
}

export interface QuestData {
  id: string;
  name: string;
  sequence: number;
  description: string;
  objectives: string[];
  rewards: QuestReward;
  riskLevel?: string;
  tags?: string[];
  targetLocation?: string;
}

interface QuestJournalViewProps {
  quests: {
    availableQuests: QuestData[];
    activeQuests: QuestData[];
    completedQuestIds: string[];
  };
  onRefreshQuests: () => void;
  onNotice: (title: string, body: string) => void;
}

export const QuestJournalView: React.FC<QuestJournalViewProps> = ({
  quests,
  onRefreshQuests,
  onNotice
}) => {
  const [activeTab, setActiveTab] = useState<'AVAILABLE' | 'ACTIVE' | 'COMPLETED'>('AVAILABLE');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const available = quests.availableQuests || [];
  const active = quests.activeQuests || [];
  const completedIds = quests.completedQuestIds || [];

  const handleAcceptQuest = async (questId: string) => {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/quests/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questId })
      });
      const data = await res.json();
      onNotice(data.success ? 'Misión Aceptada' : 'No Disponible', data.message || 'Misión agregada a tu bitácora activa.');
      onRefreshQuests();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCompleteQuest = async (questId: string) => {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/quests/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questId })
      });
      const data = await res.json();
      onNotice(data.success ? '¡Misión Cumplida!' : 'Objetivos Incompletos', data.message || 'Recompensas recibidas.');
      onRefreshQuests();
    } finally {
      setIsProcessing(false);
    }
  };

  const currentList = activeTab === 'AVAILABLE'
    ? available
    : activeTab === 'ACTIVE'
    ? active
    : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Cabecera de la Bitácora de Misiones */}
      <div className="card-frame" style={{ padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Scroll size={20} color="var(--gold)" />
            <h2 className="cinzel" style={{ color: 'var(--gold)', fontSize: '1.25rem', margin: 0 }}>
              BITÁCORA DE MISIONES & DESTINO CANÓNICO
            </h2>
          </div>
          <p style={{ fontSize: '0.82rem', color: '#a3998b', margin: '4px 0 0 0' }}>
            Encargos civiles, peticiones místicas y desafíos de vía vinculados a la Quinta Época.
          </p>
        </div>

        {/* Pestañas de Filtrado */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setActiveTab('AVAILABLE')}
            className={`action-tab-btn ${activeTab === 'AVAILABLE' ? 'active' : ''}`}
            style={{ fontSize: '0.82rem', padding: '6px 14px' }}
          >
            Disponibles ({available.length})
          </button>
          <button
            onClick={() => setActiveTab('ACTIVE')}
            className={`action-tab-btn ${activeTab === 'ACTIVE' ? 'active' : ''}`}
            style={{ fontSize: '0.82rem', padding: '6px 14px' }}
          >
            En Curso ({active.length})
          </button>
          <button
            onClick={() => setActiveTab('COMPLETED')}
            className={`action-tab-btn ${activeTab === 'COMPLETED' ? 'active' : ''}`}
            style={{ fontSize: '0.82rem', padding: '6px 14px' }}
          >
            Completadas ({completedIds.length})
          </button>
        </div>
      </div>

      {/* Lista de Misiones */}
      {activeTab === 'COMPLETED' ? (
        <div className="card-frame" style={{ padding: '24px' }}>
          <h4 className="cinzel" style={{ color: '#6ee7b7', marginBottom: '12px' }}>
            Registro de Misiones Completadas ({completedIds.length})
          </h4>
          {completedIds.length === 0 ? (
            <p style={{ color: '#888', fontStyle: 'italic' }}>Aún no has completado ninguna misión formal.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '10px' }}>
              {completedIds.map(id => (
                <div key={id} style={{ background: '#122018', border: '1px solid #059669', padding: '10px 14px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={16} color="#34d399" />
                  <span style={{ fontSize: '0.82rem', color: '#e2e8f0', fontWeight: 'bold' }}>{id.replace(/_/g, ' ')}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : currentList.length === 0 ? (
        <div className="card-frame" style={{ padding: '36px', textAlign: 'center' }}>
          <p style={{ color: '#a89c89' }}>
            {activeTab === 'AVAILABLE'
              ? 'No hay misiones disponibles para tu rango y ubicación actual. Avanza el día o viaja a otras ciudades.'
              : 'No tienes misiones en curso. Acepta una misión en la pestaña de "Disponibles".'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '14px' }}>
          {currentList.map(quest => (
            <div
              key={quest.id}
              className="parchment-sheet"
              style={{
                padding: '18px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderLeft: '4px solid var(--gold)'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.68rem', background: '#3b2f20', color: '#d4af37', padding: '2px 6px', borderRadius: '3px', fontWeight: 'bold' }}>
                    Secuencia {quest.sequence}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: '#7a6855' }}>
                    Riesgo: {quest.riskLevel || 'Medio'}
                  </span>
                </div>

                <h3 style={{ color: '#251c14', fontSize: '0.98rem', fontWeight: 'bold', margin: '4px 0 8px 0' }}>
                  {quest.name}
                </h3>

                <p style={{ fontSize: '0.82rem', color: '#3d3124', lineHeight: 1.45, marginBottom: '12px' }}>
                  {quest.description}
                </p>

                {/* Objetivos */}
                <div style={{ background: 'rgba(0,0,0,0.05)', padding: '8px 10px', borderRadius: '4px', marginBottom: '12px' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 'bold', color: '#594430', marginBottom: '4px', textTransform: 'uppercase' }}>
                    🎯 Objetivos:
                  </div>
                  {quest.objectives.map((obj, idx) => (
                    <div key={idx} style={{ fontSize: '0.76rem', color: '#2a2016' }}>
                      • {obj}
                    </div>
                  ))}
                </div>

                {/* Recompensas */}
                <div style={{ display: 'flex', gap: '10px', fontSize: '0.74rem', color: '#166534', fontWeight: 'bold', marginBottom: '14px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <Coins size={13} /> £{quest.rewards.pounds} Libras
                  </span>
                  {quest.rewards.actingDigestBonus && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <Sparkles size={13} /> +{quest.rewards.actingDigestBonus}% Digestión
                    </span>
                  )}
                  {quest.rewards.sanityBonus && (
                    <span>+{quest.rewards.sanityBonus} Cordura</span>
                  )}
                </div>
              </div>

              {/* Botón de Acción */}
              <div>
                {activeTab === 'AVAILABLE' ? (
                  <button
                    disabled={isProcessing}
                    onClick={() => handleAcceptQuest(quest.id)}
                    className="gold-btn"
                    style={{ width: '100%', padding: '8px', fontSize: '0.82rem' }}
                  >
                    Aceptar Misión
                  </button>
                ) : (
                  <button
                    disabled={isProcessing}
                    onClick={() => handleCompleteQuest(quest.id)}
                    className="action-tab-btn active"
                    style={{ width: '100%', padding: '8px', fontSize: '0.82rem', background: '#14532d', borderColor: '#22c55e', color: '#fff' }}
                  >
                    Entregar & Cobrar Recompensa
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
