import React from 'react';
import { Compass } from 'lucide-react';

interface NewspaperArticle {
  id: string;
  headline: string;
  subtitle: string;
  body: string;
  column: string;
  date: string;
}

interface DailyObserverProps {
  articles?: NewspaperArticle[];
  inGameDate: string;
  currentLocation: string;
  currentDay: number;
  onExploreDistrict?: () => void;
}

export const DailyObserver: React.FC<DailyObserverProps> = ({
  articles,
  inGameDate,
  currentLocation,
  currentDay,
  onExploreDistrict
}) => {
  const isBayam = currentLocation.toLowerCase().includes('bayam');
  const isTrier = currentLocation.toLowerCase().includes('trier');

  const paperTitle = isBayam
    ? 'THE RORSTED COLONIAL DISPATCH'
    : isTrier
    ? 'LE COURRIER RÉPUBLICAIN DE TRIER'
    : 'THE BACKLUND DAILY OBSERVER';

  const defaultArticles: NewspaperArticle[] = [
    {
      id: 'default_1',
      headline: 'Scotland Yard refuerza la guardia nocturna en los muelles de Pritz',
      subtitle: 'El espeso smog industrial dificulta el patrullaje de los oficiales ante una serie de incidentes inexplicables.',
      body: 'Testigos afirman haber visto siluetas espectrales desvanecerse en la niebla ácida de East Borough. El Comisionado General insta a los ciudadanos a no transitar callejones solitarios pasada la medianoche.',
      column: 'PRIMERA PLANA',
      date: inGameDate
    },
    {
      id: 'default_2',
      headline: 'Huelga y Malestar en las Fábricas del Distrito Este',
      subtitle: 'Cientos de obreros exigen jornada de 10 horas y reducción del coste del carbón.',
      body: 'La Cámara de los Comunes debate medidas de urgencia mientras miembros de la nobleza del Distrito de la Reina advierten del riesgo de disturbios mayores en los almacenes cercanos al río Tussock.',
      column: 'SOCIEDAD Y TRABAJO',
      date: inGameDate
    },
    {
      id: 'default_3',
      headline: 'Gran Subasta de Antigüedades en el Distrito de Hillside',
      subtitle: 'Colecciones de la Cuarta Época y manuscritos antiguos de la dinastía Tudor.',
      body: 'Eruditos y coleccionistas privados de toda Loen se preparan para pujar por piezas singulares. El Club de Adivinación de Backlund advierte sobre posibles resonancias espirituales en reliquias sin purificar.',
      column: 'CLASIFICADOS & MISTERIO',
      date: inGameDate
    }
  ];

  const displayArticles = articles && articles.length > 0 ? articles : defaultArticles;
  const leadArticle = displayArticles[0];
  const sideArticles = displayArticles.slice(1);

  return (
    <div className="victorian-newspaper" style={{ padding: '16px', borderRadius: '4px', position: 'relative' }}>
      {/* Cabecera del Periódico */}
      <div style={{ textAlign: 'center', marginBottom: '10px' }}>
        <div style={{ fontSize: '0.72rem', letterSpacing: '2px', color: '#594a38', textTransform: 'uppercase', marginBottom: '2px' }}>
          Gaceta Oficial del Reino • Edición N° {1420 + currentDay} • Precio: 1 Pence
        </div>
        <h2 style={{ fontFamily: 'Cinzel, Georgia, serif', fontSize: '1.4rem', fontWeight: 900, color: '#1a140e', letterSpacing: '1px' }}>
          📰 {paperTitle}
        </h2>
        <div className="newspaper-header-border" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', padding: '4px 8px', marginTop: '4px', fontWeight: 'bold', color: '#3d3224' }}>
          <span>📅 {inGameDate}</span>
          <span>📍 {currentLocation}</span>
          <span>☁️ Smog Pesado & Gas Amarillo</span>
        </div>
      </div>

      {/* Noticia Principal (Lead Article) */}
      {leadArticle && (
        <div style={{ paddingBottom: '12px', marginBottom: '12px', borderBottom: '1px solid #c7b89f' }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 'bold', color: '#851c22', letterSpacing: '1px', textTransform: 'uppercase' }}>
            [{leadArticle.column}]
          </div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 'bold', color: '#16120e', margin: '3px 0 4px 0', lineHeight: 1.25 }}>
            {leadArticle.headline}
          </h3>
          <h4 style={{ fontSize: '0.82rem', fontStyle: 'italic', color: '#4a3d2e', marginBottom: '6px' }}>
            {leadArticle.subtitle}
          </h4>
          <p style={{ fontSize: '0.82rem', lineHeight: 1.45, color: '#2b231a', textAlign: 'justify' }}>
            {leadArticle.body}
          </p>
          {onExploreDistrict && (
            <button
              onClick={onExploreDistrict}
              style={{
                marginTop: '8px',
                background: '#2b2319',
                color: '#dfcaa2',
                border: '1px solid #735e40',
                padding: '4px 10px',
                fontSize: '0.75rem',
                borderRadius: '3px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <Compass size={12} /> Investigar Pista en la Ciudad
            </button>
          )}
        </div>
      )}

      {/* Noticias Secundarias en Columnas */}
      <div style={{ display: 'grid', gridTemplateColumns: sideArticles.length > 1 ? '1fr 1fr' : '1fr', gap: '12px' }}>
        {sideArticles.map((art) => (
          <div key={art.id} style={{ fontSize: '0.78rem' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 'bold', color: '#594632', textTransform: 'uppercase' }}>
              • {art.column}
            </div>
            <h4 style={{ fontSize: '0.88rem', fontWeight: 'bold', color: '#1c1712', margin: '2px 0 3px 0', lineHeight: 1.2 }}>
              {art.headline}
            </h4>
            <p style={{ fontSize: '0.75rem', lineHeight: 1.4, color: '#382f23', textAlign: 'justify' }}>
              {art.body}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
