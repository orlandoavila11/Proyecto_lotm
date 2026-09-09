import React, { useState } from 'react';
import { Compass, Eye, MapPin, Home, Coffee, Sparkles, Shield, Coins, Flame } from 'lucide-react';

interface DistrictPOI {
  id: string;
  name: string;
  type: string;
  description: string;
  dangerLevel: string;
  icon: string;
  controlledBy?: string;
}

interface LocalRumor {
  id: string;
  title: string;
  description: string;
}

interface CityTheme {
  name: string;
  subtitle: string;
  weather: string;
  accentColor: string;
  bannerGradient: string;
}

interface LivingCityProps {
  location: string;
  cityTheme?: CityTheme;
  districts: DistrictPOI[];
  localRumors?: LocalRumor[];
  onExploreDistrict: (districtId: string) => Promise<any>;
  onTriggerCombat?: (encounterData: any) => void;
}

export const LivingCity: React.FC<LivingCityProps> = ({
  location,
  cityTheme,
  districts,
  localRumors,
  onExploreDistrict,
  onTriggerCombat
}) => {
  const [exploringDistrictId, setExploringDistrictId] = useState<string | null>(null);
  const [explorationResult, setExplorationResult] = useState<any | null>(null);
  const [isDivining, setIsDivining] = useState<boolean>(false);

  const theme = cityTheme || {
    name: location,
    subtitle: 'La Ciudad de la Niebla y las Sombras',
    weather: 'Smog Sulfuroso & Niebla Espesa',
    accentColor: '#d4af37',
    bannerGradient: 'linear-gradient(180deg, #1f1a14 0%, #100d0a 100%)'
  };

  const handleStartExplore = async (district: DistrictPOI) => {
    setExploringDistrictId(district.id);
    setIsDivining(true);
    setExplorationResult(null);

    // Pequeño retardo atmosférico diegético (tensión de adivinación/pasos en la niebla)
    setTimeout(async () => {
      try {
        const res = await onExploreDistrict(district.id);
        setIsDivining(false);
        setExplorationResult(res);

        // Si fue combate, pasar los datos al combat engine
        if (res && res.type === 'COMBAT' && onTriggerCombat) {
          onTriggerCombat(res);
        }
      } catch (err) {
        setIsDivining(false);
        setExploringDistrictId(null);
      }
    }, 900);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Banner Atmosférico de la Ciudad */}
      <div
        className="card-frame"
        style={{
          background: theme.bannerGradient,
          border: `2px solid ${theme.accentColor}`,
          padding: '24px',
          borderRadius: '8px',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <MapPin size={22} color={theme.accentColor} />
              <h2 style={{ fontFamily: 'Cinzel, Georgia, serif', fontSize: '1.7rem', color: theme.accentColor, fontWeight: 900 }}>
                {theme.name}
              </h2>
            </div>
            <div style={{ fontSize: '0.95rem', fontStyle: 'italic', color: '#e5ded2' }}>
              "{theme.subtitle}"
            </div>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid #544430', padding: '8px 14px', borderRadius: '4px', textAlign: 'right' }}>
            <div style={{ fontSize: '0.72rem', color: '#a89c89', textTransform: 'uppercase' }}>Condición Climática</div>
            <div style={{ fontSize: '0.88rem', fontWeight: 'bold', color: '#f3ebd8' }}>{theme.weather}</div>
          </div>
        </div>
      </div>

      {/* Tablón de Rumores y Susurros Callejeros */}
      {localRumors && localRumors.length > 0 && (
        <div className="parchment-sheet" style={{ padding: '14px 18px', borderLeft: `4px solid ${theme.accentColor}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 'bold', color: '#594430', marginBottom: '8px' }}>
            <Eye size={16} color="#851c22" />
            <span>SUSURROS CALLEJEROS & RUMORES DE TABERNA EN {theme.name.toUpperCase()}:</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' }}>
            {localRumors.map((rumor) => (
              <div key={rumor.id} style={{ background: 'rgba(0,0,0,0.04)', border: '1px solid #dcd1be', padding: '8px 12px', borderRadius: '3px' }}>
                <strong style={{ fontSize: '0.85rem', color: '#2a2218' }}>• {rumor.title}</strong>
                <p style={{ fontSize: '0.78rem', color: '#4a3d2e', marginTop: '2px', lineHeight: 1.35 }}>
                  "{rumor.description}"
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cuadrícula de Distritos y Puntos de Interés */}
      <div>
        <h3 className="cinzel" style={{ color: 'var(--gold)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Compass size={18} /> Puntos de Interés & Distritos Abiertos
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
          {districts.map((district) => {
            const isDangerHigh = district.dangerLevel.toLowerCase().includes('alto') || district.dangerLevel.toLowerCase().includes('letal');
            const dangerBadgeColor = isDangerHigh ? '#ef4444' : district.dangerLevel.toLowerCase().includes('medio') ? '#f59e0b' : '#10b981';

            return (
              <div
                key={district.id}
                className="card-frame"
                style={{
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderTop: `3px solid ${isDangerHigh ? '#ef4444' : 'var(--card-border-gold)'}`
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div className="brass-dial" style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {district.type === 'RESIDENCE' && <Home size={20} color="var(--gold)" />}
                      {district.type === 'INFORMANT' && <Coffee size={20} color="#f59e0b" />}
                      {district.type === 'ACTING' && <Sparkles size={20} color="#a855f7" />}
                      {district.type === 'CHURCH' && <Shield size={20} color="#38bdf8" />}
                      {district.type === 'MARKET' && <Coins size={20} color="var(--gold)" />}
                      {district.type === 'EXPLORATION' && <Flame size={20} color="var(--crimson)" />}
                      {!['RESIDENCE', 'INFORMANT', 'ACTING', 'CHURCH', 'MARKET', 'EXPLORATION'].includes(district.type) && <Compass size={20} color="var(--gold)" />}
                    </div>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        padding: '2px 8px',
                        borderRadius: '3px',
                        background: '#19140f',
                        border: `1px solid ${dangerBadgeColor}`,
                        color: dangerBadgeColor
                      }}
                    >
                      Peligro: {district.dangerLevel}
                    </span>
                  </div>

                  <h4 style={{ color: '#f3ebd8', fontSize: '1.1rem', fontWeight: 'bold' }}>{district.name}</h4>
                  {district.controlledBy && (
                    <div style={{ fontSize: '0.75rem', color: '#9e8c75', marginTop: '2px' }}>
                      Bajo control: <strong style={{ color: '#d4af37' }}>{district.controlledBy}</strong>
                    </div>
                  )}

                  <p style={{ fontSize: '0.85rem', color: '#c7baa5', margin: '10px 0 16px 0', lineHeight: 1.45 }}>
                    {district.description}
                  </p>
                </div>

                <button
                  onClick={() => handleStartExplore(district)}
                  className={isDangerHigh ? 'crimson-btn' : 'action-tab-btn'}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  <Compass size={16} />
                  <span>Explorar e Indagar</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal / Diálogo Cinemático de Exploración Ocultista */}
      {exploringDistrictId && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(5, 4, 3, 0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '20px'
          }}
        >
          <div
            className="card-frame"
            style={{
              maxWidth: '520px',
              width: '100%',
              padding: '26px',
              border: '2px solid var(--gold)',
              boxShadow: '0 0 35px rgba(212, 175, 55, 0.4)',
              textAlign: 'center'
            }}
          >
            {isDivining ? (
              <div style={{ padding: '20px 0' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🔮</div>
                <h3 className="cinzel" style={{ color: 'var(--gold)', marginBottom: '8px' }}>
                  Adivinación en la Niebla...
                </h3>
                <p style={{ fontStyle: 'italic', color: '#a89c89', fontSize: '0.9rem' }}>
                  El péndulo de topacio oscila. Tus pasos resuenan sobre los adoquines húmedos...
                </p>
              </div>
            ) : explorationResult ? (
              <div>
                <div style={{ fontSize: '3rem', marginBottom: '10px' }}>
                  {explorationResult.type === 'COMBAT' ? '⚔️' : explorationResult.type === 'FINDING' ? '💰' : '🕯️'}
                </div>

                <h3
                  className="cinzel"
                  style={{
                    color: explorationResult.type === 'COMBAT' ? 'var(--crimson)' : 'var(--gold)',
                    fontSize: '1.3rem',
                    marginBottom: '10px'
                  }}
                >
                  {explorationResult.type === 'COMBAT'
                    ? '¡Amenaza Sobrenatural!'
                    : explorationResult.type === 'FINDING'
                    ? 'Pistas y Hallazgos'
                    : 'Actuación y Comprensión'}
                </h3>

                <div className="parchment-sheet" style={{ padding: '14px', margin: '14px 0', textAlign: 'left' }}>
                  <p style={{ fontSize: '0.88rem', lineHeight: 1.45, color: '#1a140e' }}>
                    {explorationResult.message}
                  </p>
                </div>

                <button
                  onClick={() => setExploringDistrictId(null)}
                  className="action-tab-btn active"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  Continuar Jornada
                </button>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
