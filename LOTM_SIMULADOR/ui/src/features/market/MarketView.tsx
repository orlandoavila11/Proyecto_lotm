import React, { useState } from 'react';
import { ArrowLeft, ShoppingBag, Coins, Sparkles, Check } from 'lucide-react';
import type { MarketProduct } from '../types';
import { apiClient } from '../../services/apiClient';

interface MarketViewProps {
  onBackToDesk: () => void;
  characterId?: string;
  onRefreshCharacter?: () => void;
}

export interface MarketProductItem extends MarketProduct {
  itemCode: string;
  districtId: string;
  quality: 'PRISTINE' | 'DAMAGED' | 'CONTAMINATED';
}

const CANONICAL_PRODUCTS: MarketProductItem[] = [
  {
    id: 'prod_jimsonweed_juice',
    itemCode: 'ING_JIMSONWEED_JUICE',
    districtId: 'bridge_borough',
    quality: 'PRISTINE',
    name: 'Jugo de Estramonio Purificado',
    category: 'BOTICARIO',
    rarity: 'COMÚN',
    priceDescription: '6 chelines de plata (72d)',
    costPence: 72,
    description: 'Esencia herbal purificada conservada en frasco de vidrio ámbar. Atenúa zumbidos auditivos y estabiliza mezclas alquímicas.',
    purityNote: 'Autenticado por un tasador del Callejón del Gato Negro.'
  },
  {
    id: 'prod_goat_horn_crystal',
    itemCode: 'ING_GOAT_HORN_CRYSTAL',
    districtId: 'bridge_borough',
    quality: 'PRISTINE',
    name: 'Cristal de Cuerno de Cabra de Hornacis',
    category: 'INGREDIENTE',
    rarity: 'INUSUAL',
    priceDescription: '5 libras de plata esterlina (1200d)',
    costPence: 1200,
    description: 'Fragmento mineralizado con reflejos plateados extraído de las cumbres de Hornacis. Emite un frío tenue al tacto.',
    purityNote: 'Autenticado por un tasador del Callejón del Gato Negro.'
  },
  {
    id: 'prod_human_faced_rose',
    itemCode: 'ING_HUMAN_FACED_ROSE_STALK',
    districtId: 'bridge_borough',
    quality: 'PRISTINE',
    name: 'Tallo de Rosa con Rostro Humano',
    category: 'INGREDIENTE',
    rarity: 'INUSUAL',
    priceDescription: '6 libras esterlinas (1440d)',
    costPence: 1440,
    description: 'Tallo espinoso cuyas venaciones forman facciones faciales cambiantes. Ingrediente principal para el papel del Payaso.',
    purityNote: 'Extraída en la costa rocosa de Desi Bay.'
  },
  {
    id: 'prod_black_sunflower',
    itemCode: 'ING_BLACK_SUNFLOWER_POWDER',
    districtId: 'bridge_borough',
    quality: 'PRISTINE',
    name: 'Polvo de Girasol de Borde Negro',
    category: 'BOTICARIO',
    rarity: 'COMÚN',
    priceDescription: '8 chelines (96d)',
    costPence: 96,
    description: 'Polvo denso de pétalos solares desecados. Suaviza la disonancia espiritual.',
    purityNote: 'Elaborado por un herbolario autorizado.'
  }
];

export const MarketView: React.FC<MarketViewProps> = ({ onBackToDesk, characterId, onRefreshCharacter }) => {
  const [products] = useState<MarketProductItem[]>(CANONICAL_PRODUCTS);
  const [selectedProduct, setSelectedProduct] = useState<MarketProductItem | null>(products[0]);
  const [purchasedMessage, setPurchasedMessage] = useState<string | null>(null);
  const [isBuying, setIsBuying] = useState<boolean>(false);
  const [livePence, setLivePence] = useState<number | null>(null);

  const handleBuy = async (product: MarketProductItem) => {
    setIsBuying(true);
    try {
      const activeCharId = characterId || localStorage.getItem('lotm_active_character_id') || 'char_1790267861425';
      const res = await apiClient.buyMarketItem({
        characterId: activeCharId,
        districtId: product.districtId,
        itemCode: product.itemCode,
        quality: product.quality
      });
      setPurchasedMessage(`Has adquirido "${product.name}". El paquete fue deslizado bajo tu capa sin levantar la voz.`);
      if (res.remainingBalance !== undefined) {
        setLivePence(res.remainingBalance);
      }
      onRefreshCharacter?.();
    } catch (err: any) {
      setPurchasedMessage(`Trato interrumpido: ${err.message}`);
    } finally {
      setIsBuying(false);
      setTimeout(() => {
        setPurchasedMessage(null);
      }, 5000);
    }
  };

  return (
    <div 
      className="market-screen p-8 flex flex-col justify-between select-none relative overflow-hidden" 
      style={{ 
        width: '1920px',
        height: '1080px',
        position: 'relative',
        backgroundColor: '#0e0d0b',
        backgroundImage: 'url(/art/GFX37_bazaar_counter.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* Velo atmosférico del Bazar Subterráneo */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 40%, rgba(14, 13, 11, 0.78) 0%, rgba(8, 7, 6, 0.94) 100%)'
        }}
      />
      
      {/* Cabecera */}
      <header className="relative z-10 flex justify-between items-center pb-4 border-b border-[#2d2419] mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onBackToDesk}
            className="p-2 bg-[#171410] border border-[#383024] hover:border-[#8c733e] text-[#d4af37] rounded flex items-center gap-2 text-sm font-serif transition-all lotm-focus-ring"
          >
            <ArrowLeft size={16} />
            Regresar al Buró
          </button>
          <div>
            <h1 className="text-xl font-bold tracking-widest text-[#d4af37]" style={{ fontFamily: 'Cinzel' }}>
              EL BAZAR CLANDESTINO DEL CALLEJÓN DEL GATO NEGRO
            </h1>
            <p className="text-xs text-[#968c7e] italic">
              Trastiendas y puestos de intercambio bajo los faroles de aceite de Cherwood
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-[#191714] px-4 py-2 rounded border border-[#383024]">
          <Coins size={16} className="text-[#d4af37]" />
          <span className="text-xs text-[#d4af37] font-serif">
            {livePence !== null 
              ? `Faltriquera tras el pago: ${Math.floor(livePence / 240)} libras esterlinas` 
              : 'Monedas de oro y plata listas para el regateo'}
          </span>
        </div>
      </header>

      {/* Contenido Central */}
      <div className="relative z-10 grid grid-cols-12 gap-6 flex-1 mb-6">
        
        {/* Catálogo de Mercancías sobre Bandejas (GFX38) */}
        <div className="col-span-7 bg-[#14120f]/90 p-6 rounded-lg border border-[#2d2419] flex flex-col shadow-2xl backdrop-blur-sm">
          <h2 className="font-serif font-bold text-base text-[#e5ded2] mb-4 border-b border-[#2d2419] pb-2" style={{ fontFamily: 'Cinzel' }}>
            Mercancías Extravagantes sobre el Paño
          </h2>

          <div className="space-y-3 flex-1 overflow-y-auto pr-1">
            {products.map((p) => {
              const isSelected = selectedProduct?.id === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedProduct(p)}
                  className={`p-4 rounded border cursor-pointer transition-all flex justify-between items-start lotm-focus-ring ${
                    isSelected 
                      ? 'bg-[#1e1913] border-[#d4af37] shadow-[0_0_12px_rgba(212,175,55,0.25)]' 
                      : 'bg-[#161310]/95 border-[#292218] hover:border-[#8c733e]/50 hover:bg-[#1a1612]'
                  }`}
                  style={{
                    backgroundImage: 'url(/art/GFX38_bazaar_tray.jpg)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundBlendMode: 'overlay'
                  }}
                >
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-serif font-bold text-sm text-[#e5ded2]">
                        {p.name}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[#262016] text-[#c4b59a] font-serif border border-[#3d2a1b]">
                        {p.rarity}
                      </span>
                    </div>
                    <p className="text-xs text-[#968c7e] italic leading-relaxed max-w-md">
                      {p.description}
                    </p>
                  </div>

                  <div className="text-right relative z-10">
                    <span className="text-xs font-serif font-bold text-[#d4af37] block">
                      {p.priceDescription}
                    </span>
                    <span className="text-[10px] text-[#6b6255] uppercase font-serif">
                      {p.category}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {purchasedMessage && (
            <div className="mt-4 p-3 rounded bg-[#1e291b] border border-[#22c55e]/40 text-xs text-[#86efac] flex items-center gap-2 animate-fadeIn">
              <Check size={14} />
              <span>{purchasedMessage}</span>
            </div>
          )}
        </div>

        {/* Inspección Detallada de la Mercancía sobre Papel de Lectura (GFX30) */}
        <div className="col-span-5 bg-[#14120f]/90 p-6 rounded-lg border border-[#2d2419] flex flex-col justify-between shadow-2xl backdrop-blur-sm">
          {selectedProduct ? (
            <div>
              <div className="flex items-center gap-2 mb-3 border-b border-[#2d2419] pb-3">
                <ShoppingBag size={20} className="text-[#d4af37]" />
                <h3 className="font-serif font-bold text-base text-[#e5ded2]" style={{ fontFamily: 'Cinzel' }}>
                  {selectedProduct.name}
                </h3>
              </div>

              <div 
                className="p-5 rounded text-[#1f1a14] mb-4 shadow-lg border border-[#8c733e]/50 relative"
                style={{
                  backgroundImage: 'url(/art/GFX30_flat_paper.jpg)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundColor: '#ede4d1'
                }}
              >
                <span className="text-xs font-bold uppercase tracking-wider text-[#635034] block mb-1 font-serif border-b border-[#8c733e]/30 pb-1">
                  Dictamen del Alquimista
                </span>
                <p className="text-sm leading-relaxed italic mb-3 font-serif text-[#1a1612]">
                  "{selectedProduct.description}"
                </p>
                <div className="border-t border-[#8c733e]/40 pt-2 text-[11px] text-[#423525] flex justify-between font-serif">
                  <span>Pureza: {selectedProduct.purityNote}</span>
                  <span className="font-bold text-[#851c22]">{selectedProduct.priceDescription}</span>
                </div>
              </div>

              <div className="p-3 bg-[#181511] rounded border border-[#2a2216] text-xs text-[#c4b59a] space-y-2 mb-6">
                <div className="flex items-center gap-2 text-[#d4af37] font-serif font-bold">
                  <Sparkles size={14} />
                  Condiciones del Trato
                </div>
                <p className="italic leading-relaxed">
                  Las compras en el bazar son anónimas y definitivas. Si los Halcones Nocturnos interceptan la entrega, el intermediario negará conocer tu rostro.
                </p>
              </div>

              <button
                onClick={() => handleBuy(selectedProduct)}
                disabled={isBuying}
                className="w-full crimson-btn py-2.5 text-sm uppercase tracking-wider font-bold disabled:opacity-50"
              >
                {isBuying ? 'Sellando el Trato...' : 'Pagar y Recoger el Paquete'}
              </button>
            </div>
          ) : (
            <p className="text-sm text-[#968c7e] italic text-center py-10">
              Selecciona una mercancía expuesta para examinar su autenticidad.
            </p>
          )}

          <div className="text-[11px] text-[#6b6255] border-t border-[#221c14] pt-3 italic text-center">
            "El oro no tiene conciencia, pero los artefactos recuerdan a sus antiguos dueños."
          </div>
        </div>

      </div>

      <footer className="text-xs text-[#6e6353] italic text-center border-t border-[#221c14] pt-3">
        El aroma a tabaco barato y mirra se mezcla con el aire húmedo de Backlund.
      </footer>

    </div>
  );
};
