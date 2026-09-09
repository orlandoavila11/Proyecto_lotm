import React, { useState } from 'react';
import { ShoppingBag, Coins } from 'lucide-react';

interface MarketOffer {
  id: string;
  name: string;
  type: string;
  pricePounds: number;
  description: string;
  requiredMaxSequence?: number;
  weight?: number;
}

interface MysticalMarketStallProps {
  offers: MarketOffer[];
  walletPounds: number;
  onBuyItem: (offerId: string) => Promise<any>;
}

export const MysticalMarketStall: React.FC<MysticalMarketStallProps> = ({
  offers,
  walletPounds,
  onBuyItem
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [buyingId, setBuyingId] = useState<string | null>(null);

  const categories = [
    { id: 'ALL', label: 'Todo el Catálogo' },
    { id: 'POTION_FORMULA', label: '📜 Fórmulas' },
    { id: 'INGREDIENT', label: '🌿 Ingredientes' },
    { id: 'EQUIPMENT', label: '🔫 Armamento' },
    { id: 'CONSUMABLE', label: '🧪 Consumibles' }
  ];

  const filteredOffers = filterCategory === 'ALL'
    ? offers
    : offers.filter(o => o.type === filterCategory);

  const handleBuy = async (offerId: string) => {
    setBuyingId(offerId);
    try {
      await onBuyItem(offerId);
    } finally {
      setBuyingId(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Cabecera del Mercado Clandestino */}
      <div
        className="card-frame"
        style={{
          padding: '20px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px',
          background: 'linear-gradient(180deg, #1b1611 0%, #100d0a 100%)',
          border: '1px solid var(--card-border-gold)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="brass-dial" style={{ width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShoppingBag size={24} color="var(--gold)" />
          </div>
          <div>
            <h2 className="cinzel" style={{ color: 'var(--gold)', fontSize: '1.35rem' }}>
              MERCADO MÍSTICO CLANDESTINO
            </h2>
            <p style={{ fontSize: '0.82rem', color: '#a89c89' }}>
              Boticarios ambulantes, contrabandistas marítimos y eruditos caídos en desgracia.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#19140f', padding: '8px 14px', borderRadius: '4px', border: '1px solid #544430' }}>
          <Coins size={20} color="var(--gold)" />
          <span style={{ fontSize: '0.85rem', color: '#c4b59a' }}>Fondos Disponibles:</span>
          <strong style={{ fontSize: '1.1rem', color: 'var(--gold)' }}>£{walletPounds} Libras</strong>
        </div>
      </div>

      {/* Filtros de Puestos de Mercado */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setFilterCategory(cat.id)}
            className={`action-tab-btn ${filterCategory === cat.id ? 'active' : ''}`}
            style={{ fontSize: '0.85rem', padding: '6px 14px' }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Cuadrícula de Artículos del Mercado */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        {filteredOffers.map((offer) => {
          const canAfford = walletPounds >= offer.pricePounds;
          const isBuying = buyingId === offer.id;

          return (
            <div
              key={offer.id}
              className="card-frame"
              style={{
                padding: '18px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                background: '#181410',
                border: '1px solid #3d3122'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <h4 style={{ color: 'var(--gold)', fontSize: '1.05rem', fontWeight: 'bold' }}>
                    {offer.name}
                  </h4>
                  <span className="gold-badge" style={{ fontSize: '0.72rem' }}>
                    {offer.type}
                  </span>
                </div>

                {offer.requiredMaxSequence && (
                  <div style={{ fontSize: '0.75rem', color: '#a89c89', marginBottom: '4px' }}>
                    Apto para: <strong>Secuencia {offer.requiredMaxSequence} o superior</strong>
                  </div>
                )}

                <p style={{ fontSize: '0.82rem', color: '#cfc6b8', margin: '8px 0 16px 0', lineHeight: 1.45 }}>
                  {offer.description}
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #2e2418', paddingTop: '12px', marginTop: '8px' }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#9e8c75', textTransform: 'uppercase' }}>Precio Fijo</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: canAfford ? 'var(--gold)' : '#ef4444' }}>
                    £{offer.pricePounds} Libras
                  </div>
                </div>

                <button
                  onClick={() => handleBuy(offer.id)}
                  disabled={!canAfford || isBuying}
                  className={canAfford ? 'crimson-btn' : 'action-tab-btn'}
                  style={{
                    padding: '8px 16px',
                    fontSize: '0.85rem',
                    opacity: canAfford ? 1 : 0.5,
                    cursor: canAfford ? 'pointer' : 'not-allowed'
                  }}
                >
                  {isBuying ? 'Adquiriendo...' : canAfford ? 'Comprar y Guardar' : 'Fondos Insuficientes'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
