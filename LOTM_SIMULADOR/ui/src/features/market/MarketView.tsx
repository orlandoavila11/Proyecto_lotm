import React, { useState } from 'react';
import { ArrowLeft, ShoppingBag, Coins, Sparkles, Check } from 'lucide-react';
import type { MarketProduct } from '../types';

interface MarketViewProps {
  onBackToDesk: () => void;
}

const CANONICAL_PRODUCTS: MarketProduct[] = [
  {
    id: 'prod_shadow_panther',
    name: 'Médula de Pantera de las Sombras',
    category: 'INGREDIENTE',
    rarity: 'INUSUAL',
    priceDescription: '3 libras de plata esterlina',
    costPence: 720,
    description: 'Un fragmento de espina dorsal conservado en aceite de almendras amargas. Emite un frío tenue al tacto.',
    purityNote: 'Autenticado por un tasador del Callejón del Gato Negro.'
  },
  {
    id: 'prod_abyssal_gland',
    name: 'Glándula de Pez Abisal de Niebla',
    category: 'INGREDIENTE',
    rarity: 'INUSUAL',
    priceDescription: '2 libras y 15 chelines',
    costPence: 660,
    description: 'Una vesícula translúcida que destila un licor fluorescente capaz de alterar las percepciones ópticas.',
    purityNote: 'Extraída en la costa rocosa de Desi Bay.'
  },
  {
    id: 'prod_sun_tincture',
    name: 'Bálsamo Calmante de Manzanilla Solar',
    category: 'BOTICARIO',
    rarity: 'COMÚN',
    priceDescription: '8 chelines y 6 peniques',
    costPence: 102,
    description: 'Infusión densa y aromática bendecida en un altar solar menor. Suaviza los zumbidos en los oídos y los delirios nocturnos.',
    purityNote: 'Elaborado por un herbolario autorizado.'
  },
  {
    id: 'prod_occult_journal',
    name: 'Fragmento del Cuaderno de la Familia Antigonus',
    category: 'LIBRO',
    rarity: 'PROHIBIDO',
    priceDescription: '12 libras en soberanos de oro',
    costPence: 2880,
    description: 'Tres folios apergaminados cosidos con pelo de cabra. Las letras parecen reptar cuando no se las mira de frente.',
    purityNote: 'El vendedor no responde por los desvelos de quien lo adquiera.'
  }
];

export const MarketView: React.FC<MarketViewProps> = ({ onBackToDesk }) => {
  const [products] = useState<MarketProduct[]>(CANONICAL_PRODUCTS);
  const [selectedProduct, setSelectedProduct] = useState<MarketProduct | null>(products[0]);
  const [purchasedMessage, setPurchasedMessage] = useState<string | null>(null);

  const handleBuy = (product: MarketProduct) => {
    setPurchasedMessage(`Has acordado el traspaso de "${product.name}". El paquete fue deslizado bajo tu capa sin levantar la voz.`);
    setTimeout(() => {
      setPurchasedMessage(null);
    }, 4000);
  };

  return (
    <div className="market-screen min-h-screen p-6 flex flex-col justify-between select-none" style={{ background: '#0e0d0b' }}>
      
      {/* Cabecera */}
      <header className="flex justify-between items-center pb-4 border-b border-[#2d2419] mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onBackToDesk}
            className="p-2 bg-[#171410] border border-[#383024] hover:border-[#8c733e] text-[#d4af37] rounded flex items-center gap-2 text-sm font-serif transition-all"
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
            Monedas de oro y plata listas para el regateo
          </span>
        </div>
      </header>

      {/* Contenido Central */}
      <div className="grid grid-cols-12 gap-6 flex-1 mb-6">
        
        {/* Catálogo de Mercancías */}
        <div className="col-span-7 bg-[#14120f] p-6 rounded-lg border border-[#2d2419] flex flex-col">
          <h2 className="font-serif font-bold text-base text-[#e5ded2] mb-4 border-b border-[#2d2419] pb-2" style={{ fontFamily: 'Cinzel' }}>
            Mercancías Extravagantes sobre el Paño
          </h2>

          <div className="space-y-3 flex-1 overflow-y-auto">
            {products.map((p) => {
              const isSelected = selectedProduct?.id === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedProduct(p)}
                  className={`p-4 rounded border cursor-pointer transition-all flex justify-between items-start ${
                    isSelected 
                      ? 'bg-[#1e1913] border-[#8c733e] shadow-md' 
                      : 'bg-[#161310] border-[#292218] hover:bg-[#1a1612]'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-serif font-bold text-sm text-[#e5ded2]">
                        {p.name}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[#262016] text-[#c4b59a] font-serif">
                        {p.rarity}
                      </span>
                    </div>
                    <p className="text-xs text-[#968c7e] italic leading-relaxed max-w-md">
                      {p.description}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-serif font-bold text-[#d4af37] block">
                      {p.priceDescription}
                    </span>
                    <span className="text-[10px] text-[#6b6255] uppercase">
                      {p.category}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {purchasedMessage && (
            <div className="mt-4 p-3 rounded bg-[#1e291b] border border-[#22c55e]/40 text-xs text-[#86efac] flex items-center gap-2">
              <Check size={14} />
              <span>{purchasedMessage}</span>
            </div>
          )}
        </div>

        {/* Inspección Detallada de la Mercancía */}
        <div className="col-span-5 bg-[#14120f] p-6 rounded-lg border border-[#2d2419] flex flex-col justify-between">
          {selectedProduct ? (
            <div>
              <div className="flex items-center gap-2 mb-3 border-b border-[#2d2419] pb-3">
                <ShoppingBag size={20} className="text-[#d4af37]" />
                <h3 className="font-serif font-bold text-base text-[#e5ded2]" style={{ fontFamily: 'Cinzel' }}>
                  {selectedProduct.name}
                </h3>
              </div>

              <div className="parchment-sheet p-4 rounded text-[#1f1a14] mb-4 shadow">
                <span className="text-xs font-bold uppercase tracking-wider text-[#786447] block mb-1 font-serif">
                  Dictamen del Alquimista
                </span>
                <p className="text-sm leading-relaxed italic mb-3 font-serif">
                  "{selectedProduct.description}"
                </p>
                <div className="border-t border-[#bfae91] pt-2 text-[11px] text-[#554a3b] flex justify-between">
                  <span>Pureza: {selectedProduct.purityNote}</span>
                  <span className="font-bold">{selectedProduct.priceDescription}</span>
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
                className="w-full crimson-btn py-2.5 text-sm uppercase tracking-wider font-bold"
              >
                Pagar y Recoger el Paquete
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
