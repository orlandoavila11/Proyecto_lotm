import React, { useState } from 'react';
import { Compass, MapPin, AlertTriangle, Shield, Navigation } from 'lucide-react';

interface InteractiveWorldMapProps {
  currentLocation: string;
  onSelectDestination?: (dest: string, costPounds: number, travelDays: number) => void;
}

export const InteractiveWorldMap: React.FC<InteractiveWorldMapProps> = ({
  currentLocation,
  onSelectDestination
}) => {
  const [selectedRegionId, setSelectedRegionId] = useState<string>('backlund');

  const worldRegions = [
    {
      id: 'backlund',
      name: 'Backlund (Capital de Loen)',
      subtitle: 'La Ciudad de la Niebla y el Vapor',
      convergenceRisk: 'EXTREMO (85%)',
      deityInfluence: 'Iglesia de la Noche & Señor de las Tormentas',
      atmosphere: 'Humo de carbón espeso, luces de gas amarillentas y sombras secretas.',
      cost: 0,
      days: 0,
      districts: ['Cherwood', 'Barrio Este', 'Muelle de Backlund', 'Distrito Real de West End']
    },
    {
      id: 'trier',
      name: 'Trier (Capital de Intis)',
      subtitle: 'La Metrópolis del Sol y la Alta Costura',
      convergenceRisk: 'ALTO (70%)',
      deityInfluence: 'Iglesia del Sol Eterno & Dios del Vapor',
      atmosphere: 'Bulevares luminosos, catacumbas secretas y salones de alta sociedad.',
      cost: 6,
      days: 4,
      districts: ['Barrio Latino', 'Distrito de las Luces', 'Subterráneos de Trier']
    },
    {
      id: 'bayam',
      name: 'Bayam (Archipiélago Rorsted)',
      subtitle: 'La Ciudad de la Generosidad y los Piratas',
      convergenceRisk: 'MEDIO (55%)',
      deityInfluence: 'Señor de las Tormentas & Dios del Mar (Kalvetua)',
      atmosphere: 'Especias, tabernas portuarias, olas furiosas y flotas de corsarios.',
      cost: 8,
      days: 14,
      districts: ['Puerto Principal', 'Mercado de Especias', 'Taberna del Alga Marina']
    },
    {
      id: 'western',
      name: 'Continente Occidental (Zhongzhou)',
      subtitle: 'La Tierra Sellada por la Niebla Primordial',
      convergenceRisk: 'DESCONOCIDO (COSMIC RESONANCE)',
      deityInfluence: 'Sectas del Dao, Caliginas de Sefirot y Píldoras Inmortales',
      atmosphere: 'Templos taoístas milenarios, calderos alquímicos y montañas flotantes.',
      cost: 25,
      days: 30,
      districts: ['Provincia Central de Zhongzhou', 'Valle Nubes Carmesí', 'Montaña del Vacío']
    },
    {
      id: 'forsaken_land',
      name: 'La Tierra Olvidada de los Dioses',
      subtitle: 'Ciudad de Plata (City of Silver)',
      convergenceRisk: 'LETAL (99%)',
      deityInfluence: 'Ausencia Divina / Antiguo Dios del Sol',
      atmosphere: 'Oscuridad perpetua, monstruos de relámpago y maldición de sangre.',
      cost: 0,
      days: 0,
      isRestricted: true,
      districts: ['Muro Exterior de la Ciudad de Plata', 'Ruinas del Templo del Sol']
    }
  ];

  const selected = worldRegions.find(r => r.id === selectedRegionId) || worldRegions[0];

  return (
    <div className="card-frame" style={{ padding: '20px', background: '#121017', borderColor: 'var(--card-border)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--card-border)', paddingBottom: '12px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Compass size={24} color="var(--gold)" />
          <h3 className="cinzel" style={{ margin: 0, color: 'var(--gold)', fontSize: '1.25rem' }}>
            ATLAS CARTOGRÁFICO DE LA QUINTA ÉPOCA & LÍNEAS DE CONVERGENCIA
          </h3>
        </div>
        <div className="gold-badge">
          Ubicación Actual: {currentLocation}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.5fr', gap: '16px' }}>
        
        {/* Selector de Regiones */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {worldRegions.map(region => {
            const isCurrent = currentLocation.toLowerCase().includes(region.name.toLowerCase().split(' ')[0]);
            const isSelected = region.id === selectedRegionId;
            return (
              <div
                key={region.id}
                onClick={() => setSelectedRegionId(region.id)}
                className="card-frame"
                style={{
                  padding: '12px',
                  cursor: 'pointer',
                  background: isSelected ? '#251c33' : '#17141f',
                  borderColor: isSelected ? '#a855f7' : isCurrent ? 'var(--gold)' : 'var(--card-border)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ color: isSelected ? '#d8b4fe' : 'var(--gold)', fontSize: '0.95rem' }}>
                    {region.name}
                  </strong>
                  {isCurrent && <span className="gold-badge" style={{ fontSize: '0.7rem' }}>Ubicación</span>}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#aaa', marginTop: '2px' }}>{region.subtitle}</div>
                <div style={{ fontSize: '0.75rem', color: '#c084fc', marginTop: '4px' }}>
                  Convergencia: {region.convergenceRisk}
                </div>
              </div>
            );
          })}
        </div>

        {/* Detalle de la Región Seleccionada */}
        <div className="card-frame" style={{ padding: '16px', background: '#181520', borderColor: '#8b5cf6' }}>
          <div style={{ borderBottom: '1px solid rgba(139,92,246,0.3)', paddingBottom: '10px', marginBottom: '12px' }}>
            <h4 className="cinzel" style={{ color: '#e9d5ff', margin: 0, fontSize: '1.15rem' }}>
              {selected.name}
            </h4>
            <span style={{ fontSize: '0.82rem', color: '#a78bfa' }}>{selected.subtitle}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
            <div>
              <strong style={{ color: 'var(--gold)' }}>Atmósfera Regional:</strong>
              <p style={{ margin: '4px 0 0 0', color: '#cfc6b8', fontStyle: 'italic' }}>"{selected.atmosphere}"</p>
            </div>

            <div style={{ marginTop: '6px' }}>
              <strong style={{ color: 'var(--gold)' }}>Influencia Divina Dominante:</strong>
              <div style={{ color: '#e2e8f0', marginTop: '2px' }}>{selected.deityInfluence}</div>
            </div>

            <div style={{ marginTop: '6px' }}>
              <strong style={{ color: 'var(--gold)' }}>Distritos & Asentamientos Clave:</strong>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
                {selected.districts.map((d, i) => (
                  <span key={i} className="gold-badge" style={{ fontSize: '0.75rem', background: '#231e2e' }}>
                    <MapPin size={11} style={{ marginRight: '4px' }} />
                    {d}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px', color: '#fda4af' }}>
              <AlertTriangle size={15} />
              <span>Nivel de Convergencia Espiritual: <strong>{selected.convergenceRisk}</strong></span>
            </div>
          </div>

          {onSelectDestination && !selected.isRestricted && selected.cost > 0 && (
            <button
              onClick={() => onSelectDestination(selected.name, selected.cost, selected.days)}
              className="action-tab-btn"
              style={{ marginTop: '16px', width: '100%', justifyContent: 'center' }}
            >
              <Navigation size={14} /> Contratar Pasaje a Vapor (£{selected.cost} | {selected.days} días)
            </button>
          )}

          {selected.isRestricted && (
            <div style={{ marginTop: '16px', padding: '8px', background: '#3b1212', borderRadius: '4px', fontSize: '0.8rem', color: '#fca5a5', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Shield size={14} /> Territorio aislado por la Barrera de Dios. Solo accesible mediante teletransporte dimensional de Secuencia 2+.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
