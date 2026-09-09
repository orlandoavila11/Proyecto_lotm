import React from 'react';
import { SomaticMirror } from './SomaticMirror';
import { DailyObserver } from './DailyObserver';
import { ConvergenceAlertBanner } from './ConvergenceAlertBanner';
import {
  Briefcase,
  Compass,
  FileText,
  Network,
  FlaskConical,
  Coins,
  Clock,
  MapPin,
  Sparkles,
  User,
  Coffee,
  Feather,
  Crown,
  Globe
} from 'lucide-react';

interface OccultDeskProps {
  snapshot: any;
  inventory: any;
  quests: any;
  onNavigateTab: (tabId: string) => void;
  onPassDay: () => void;
  onConveneTarot: () => void;
  onRefreshState: () => void;
  onOpenNotice: (title: string, body: string) => void;
}

export const OccultDesk: React.FC<OccultDeskProps> = ({
  snapshot,
  inventory,
  quests,
  onNavigateTab,
  onPassDay,
  onConveneTarot,
  onRefreshState,
  onOpenNotice
}) => {
  const isSanityCritical = snapshot.somatics.sanityPercentage < 50;
  return (
    <div
      className={`leather-desk-mat ${isSanityCritical ? 'sanity-vignette-danger' : ''}`}
      style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}
    >

      {/* Banner de Incidentes de Convergencia si existen */}
      <ConvergenceAlertBanner onRefreshState={onRefreshState} onOpenNotice={onOpenNotice} />

      {/* Barra Superior del Escritorio: Reloj de Péndulo, Ubicación y Monedero Físico */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '12px',
          borderBottom: '1px solid #3d3122',
          paddingBottom: '16px'
        }}
      >
        {/* Reloj de Péndulo Victoriano */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#19140f', padding: '10px 14px', borderRadius: '6px', border: '1px solid #4a3a28' }}>
          <div className="brass-dial" style={{ width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={22} color="var(--gold)" />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: '#9e8c75', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Reloj de Péndulo • Jornada {snapshot.currentDay}
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 'bold', color: '#f3ebd8' }}>
              {snapshot.inGameDate}
            </div>
          </div>
        </div>

        {/* Localización Actual y Residencia */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#19140f', padding: '10px 14px', borderRadius: '6px', border: '1px solid #4a3a28' }}>
          <div className="brass-dial" style={{ width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MapPin size={20} color="#38bdf8" />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: '#9e8c75', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Ubicación Actual
            </div>
            <div style={{ fontSize: '0.92rem', fontWeight: 'bold', color: '#f3ebd8' }}>
              {snapshot.currentLocation}
            </div>
          </div>
        </div>

        {/* Monedero Victoriano Predecimal (£ / s / d) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#19140f', padding: '10px 14px', borderRadius: '6px', border: '1px solid #4a3a28' }}>
          <div className="brass-dial" style={{ width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Coins size={22} color="var(--gold)" />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: '#9e8c75', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Bolsa de Monedas de Cuero
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 'bold', color: 'var(--gold)' }}>
              £{snapshot.wallet.pounds} <span style={{ color: '#c4b59a', fontSize: '0.8rem' }}>Libras</span> • {snapshot.wallet.soli}s <span style={{ color: '#c4b59a', fontSize: '0.8rem' }}>Chelines</span> • {snapshot.wallet.pence}d <span style={{ color: '#c4b59a', fontSize: '0.8rem' }}>Peniques</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tapete Central: 3 Columnas (Periódico, Cajones/Acciones, Espejo Somático) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '20px' }}>
        {/* Columna Izquierda: Periódico del Día */}
        <div>
          <DailyObserver
            articles={snapshot.newspaperArticles}
            inGameDate={snapshot.inGameDate}
            currentLocation={snapshot.currentLocation}
            currentDay={snapshot.currentDay}
            onExploreDistrict={() => onNavigateTab('districts')}
          />
        </div>

        {/* Columna Central: Cajones del Escritorio y Acciones Ocultistas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Tarjeta de Identidad y Tapadera Civil */}
          <div
            className="card-frame"
            onClick={() => onNavigateTab('personas')}
            style={{
              padding: '14px',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--gold)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--card-border)')}
            title="Abrir Expediente de Coberturas & Doble Vida"
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <User size={16} color="var(--gold)" />
                <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--gold)' }}>
                  Identidad Civil Activa
                </span>
              </div>
              <span className="gold-badge">{snapshot.activePersona.socialClass}</span>
            </div>
            <div style={{ fontSize: '0.9rem', color: '#f3ebd8', fontWeight: 'bold' }}>
              {snapshot.activePersona.name}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#a89c89' }}>
              Profesión Registrada: {snapshot.activePersona.profession}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
              <span style={{ fontSize: '0.78rem', color: '#d97706' }}>
                Sospecha Inquisitorial: <strong>{snapshot.activePersona.suspicionTier}</strong>
              </span>
              <span style={{ fontSize: '0.74rem', color: 'var(--gold)' }}>
                Gestionar Coberturas →
              </span>
            </div>
          </div>

          {/* Cajones Táctiles de Acción Rápida */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button
              onClick={() => onNavigateTab('inventory')}
              className="action-tab-btn"
              style={{ justifyContent: 'center', padding: '10px' }}
            >
              <Briefcase size={16} color="var(--gold)" />
              <span>Mochila ({inventory.items?.length || 0})</span>
            </button>

            <button
              onClick={() => onNavigateTab('districts')}
              className="action-tab-btn"
              style={{ justifyContent: 'center', padding: '10px' }}
            >
              <Compass size={16} color="#38bdf8" />
              <span>Salir a la Ciudad</span>
            </button>

            <button
              onClick={() => onNavigateTab('quests')}
              className="action-tab-btn"
              style={{ justifyContent: 'center', padding: '10px' }}
            >
              <FileText size={16} color="#fbbf24" />
              <span>Casos ({quests.activeQuests?.length || 0})</span>
            </button>

            <button
              onClick={() => onNavigateTab('conspiracy')}
              className="action-tab-btn"
              style={{ justifyContent: 'center', padding: '10px' }}
            >
              <Network size={16} color="#f43f5e" />
              <span>Pizarra</span>
            </button>

            <button
              onClick={() => onNavigateTab('grimoire')}
              className="action-tab-btn"
              style={{ justifyContent: 'center', padding: '10px' }}
            >
              <FlaskConical size={16} color="#a855f7" />
              <span>Grimorio</span>
            </button>

            <button
              onClick={() => onNavigateTab('politics')}
              className="action-tab-btn"
              style={{ justifyContent: 'center', padding: '10px' }}
            >
              <Globe size={16} color="#38bdf8" />
              <span>Guerra ({snapshot.continentalPolitics?.warTensionIndex ?? 32}/100)</span>
            </button>
          </div>

          {/* Acciones Somáticas del Día */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
            <button
              onClick={() => onNavigateTab('acting')}
              className="action-tab-btn"
              style={{ width: '100%', justifyContent: 'center', background: '#251c14', borderColor: 'var(--gold)' }}
            >
              <Sparkles size={16} color="var(--gold)" />
              <span style={{ color: 'var(--gold)', fontWeight: 'bold' }}>Escenario de Actuación (Acting Activo)</span>
            </button>

            <button
              onClick={onPassDay}
              className="action-tab-btn"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <Coffee size={16} />
              <span>Avanzar Jornada (Descanso)</span>
            </button>

            <button
              onClick={onConveneTarot}
              className="crimson-btn"
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <Crown size={16} />
              <span>Convocatoria Club Tarot</span>
            </button>
          </div>
        </div>

        {/* Columna Derecha: Espejo Somático */}
        <div>
          <SomaticMirror
            somatics={snapshot.somatics}
            pathwayInfo={snapshot.pathwayInfo}
          />

          {/* Anotación Reciente del Diario */}
          {snapshot.personalDiaryRecent && snapshot.personalDiaryRecent.length > 0 && (
            <div className="parchment-sheet" style={{ marginTop: '14px', padding: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: 'bold', color: '#594430', marginBottom: '4px' }}>
                <Feather size={14} /> Entrada de Diario: {snapshot.personalDiaryRecent[0].title}
              </div>
              <p style={{ fontSize: '0.78rem', fontStyle: 'italic', lineHeight: 1.4, color: '#2a2218' }}>
                "{snapshot.personalDiaryRecent[0].narrative.substring(0, 160)}..."
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

