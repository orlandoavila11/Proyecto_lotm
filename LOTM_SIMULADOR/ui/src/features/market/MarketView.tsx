/**
 * MERCADO Y BAZAR CLANDESTINO (V05) — PATH TO GODHOOD (PROMPT P10)
 * Autoridad: Catálogo distrital canónico (/api/economy/market/:districtId),
 * transacciones SQLite idempotentes con commandId y expectedRevision (/api/economy/buy).
 * Ciclo de compra de 5 estados: PREVIEW, PENDING, CONFIRMED, REJECTED, UNKNOWN_OUTCOME.
 * Operabilidad completa por teclado y presentación diegética pura.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ArrowLeft, ShoppingBag, Coins, AlertTriangle, 
  RefreshCw, ShieldAlert, Package, X, CheckCircle, Info
} from 'lucide-react';
import { apiClient } from '../../services/apiClient';

interface MarketViewProps {
  onBackToDesk: () => void;
  characterId?: string;
  characterDistrict?: string;
  onRefreshCharacter?: () => void;
}

export type MarketItemQuality = 'PRISTINE' | 'DAMAGED' | 'CONTAMINATED';

export interface MarketItemListing {
  id: string;
  name: string;
  pathwayTarget: string;
  category: 'MAIN_INGREDIENT' | 'SUPPLEMENTARY_INGREDIENT' | 'RITUAL_SUPPLY';
  sequence?: number;
  basePricePence: number;
  availableQualities: MarketItemQuality[];
  stock?: number;
  derivationCanon: string;
}

export interface DistrictMarketData {
  districtId: string;
  districtName: string;
  vendorName: string;
  specialtyPathway: string;
  inventory: MarketItemListing[];
}

export type PurchaseLifecycleState = 
  | 'IDLE' 
  | 'PREVIEW' 
  | 'PENDING' 
  | 'CONFIRMED' 
  | 'REJECTED' 
  | 'UNKNOWN_OUTCOME';

// Convertidor de peniques canónicos a sistema monetario victoriano (libras, chelines, peniques)
export function formatVictorianCurrency(pence: number): {
  pounds: number;
  shillings: number;
  pence: number;
  formattedText: string;
} {
  const p = Math.max(0, Math.floor(pence));
  const pounds = Math.floor(p / 240);
  const shillings = Math.floor((p % 240) / 12);
  const remainingPence = p % 12;

  const parts: string[] = [];
  if (pounds > 0) parts.push(`${pounds} £`);
  if (shillings > 0) parts.push(`${shillings} s`);
  if (remainingPence > 0 || parts.length === 0) parts.push(`${remainingPence} d`);

  return {
    pounds,
    shillings,
    pence: remainingPence,
    formattedText: parts.join(' ')
  };
}

export const MarketView: React.FC<MarketViewProps> = ({ 
  onBackToDesk, 
  characterId, 
  characterDistrict,
  onRefreshCharacter 
}) => {
  const activeCharId = characterId || localStorage.getItem('lotm_active_character_id');

  // Estado del catálogo distrital
  const [marketData, setMarketData] = useState<DistrictMarketData | null>(null);
  const [qualityModifiers, setQualityModifiers] = useState<Record<string, { priceMultiplier: number; successBonus: number; corruptionRisk: number }>>({
    PRISTINE: { priceMultiplier: 1.0, successBonus: 15, corruptionRisk: -10 },
    DAMAGED: { priceMultiplier: 0.6, successBonus: 0, corruptionRisk: 5 },
    CONTAMINATED: { priceMultiplier: 0.35, successBonus: -20, corruptionRisk: 25 }
  });
  const [isLoadingMarket, setIsLoadingMarket] = useState<boolean>(true);
  const [catalogError, setCatalogError] = useState<string | null>(null);

  // Estado del personaje y billetera
  const [walletPence, setWalletPence] = useState<number>(0);
  const [characterRevision, setCharacterRevision] = useState<number>(1);
  const [currentDistrict, setCurrentDistrict] = useState<string>(characterDistrict || 'DIST_CHERWOOD');
  const [characterInventory, setCharacterInventory] = useState<any[]>([]);
  const [showInventoryDrawer, setShowInventoryDrawer] = useState<boolean>(false);

  // Selección de producto y calidad
  const [selectedProduct, setSelectedProduct] = useState<MarketItemListing | null>(null);
  const [selectedQuality, setSelectedQuality] = useState<MarketItemQuality | null>(null);

  // Máquina de estados de la compra
  const [purchaseState, setPurchaseState] = useState<PurchaseLifecycleState>('IDLE');
  const [activeCommandId, setActiveCommandId] = useState<string | null>(null);
  const [confirmedReceipt, setConfirmedReceipt] = useState<{
    item?: any;
    penceSpent: number;
    remainingBalance: number;
    fromReceipt?: boolean;
    revision?: number;
  } | null>(null);
  const [rejectionMessage, setRejectionMessage] = useState<string | null>(null);
  const [unknownOutcomeMessage, setUnknownOutcomeMessage] = useState<string | null>(null);

  // Referencias para accesibilidad por teclado
  const productRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Carga autoritativa del personaje y su ubicación
  const loadCharacterSession = useCallback(async () => {
    if (!activeCharId) return;
    try {
      const res = await apiClient.getCharacter(activeCharId);
      if (res?.character) {
        setWalletPence(res.character.raw_pence ?? 0);
        setCharacterRevision(res.character.revision ?? 1);
        if (res.character.current_location) {
          setCurrentDistrict(res.character.current_location);
        }
        if (Array.isArray(res.inventory)) {
          setCharacterInventory(res.inventory);
        }
      }
    } catch (err: any) {
      console.warn('[MarketView] Error cargando sesión:', err.message);
    }
  }, [activeCharId]);

  // Carga del mercado para el distrito actual
  const loadDistrictMarket = useCallback(async (district: string) => {
    try {
      setIsLoadingMarket(true);
      setCatalogError(null);
      const res = await apiClient.getDistrictMarket(district);
      if (res?.market) {
        setMarketData(res.market);
        if (res.qualityModifiers) {
          setQualityModifiers(res.qualityModifiers);
        }
        // Seleccionar primer producto por defecto si existe
        if (res.market.inventory && res.market.inventory.length > 0) {
          setSelectedProduct(res.market.inventory[0]);
          setSelectedQuality(null); // Regla P10: Unknown quality must remain unknown rather than being marked pristine
          setPurchaseState('PREVIEW');
        } else {
          setSelectedProduct(null);
          setSelectedQuality(null);
          setPurchaseState('IDLE');
        }
      } else {
        setMarketData(null);
        setSelectedProduct(null);
        setSelectedQuality(null);
        setPurchaseState('IDLE');
      }
    } catch (err: any) {
      setCatalogError(err.message || 'No fue posible acceder a los comerciantes clandestinos de la zona.');
      setMarketData(null);
    } finally {
      setIsLoadingMarket(false);
    }
  }, []);

  // Inicialización
  useEffect(() => {
    loadCharacterSession();
  }, [loadCharacterSession]);

  useEffect(() => {
    if (currentDistrict) {
      loadDistrictMarket(currentDistrict);
    }
  }, [currentDistrict, loadDistrictMarket]);

  // Manejo de teclado global (Esc para volver al escritorio)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showInventoryDrawer) {
          setShowInventoryDrawer(false);
        } else {
          onBackToDesk();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onBackToDesk, showInventoryDrawer]);

  // Cálculo autoritativo local de vista previa
  const currentMultiplier = selectedQuality ? (qualityModifiers[selectedQuality]?.priceMultiplier ?? 1.0) : 1.0;
  const unitPricePence = selectedProduct ? Math.round(selectedProduct.basePricePence * currentMultiplier) : 0;
  const canAfford = walletPence >= unitPricePence;
  const balanceAfterPurchase = walletPence - unitPricePence;

  // Selección de producto
  const handleSelectProduct = (product: MarketItemListing) => {
    if (purchaseState === 'PENDING') return; // Bloquear cambios durante resolución en vuelo
    setSelectedProduct(product);
    setSelectedQuality(null); // Regla P10: unknown quality remains unknown until explicitly inspected
    setPurchaseState('PREVIEW');
    setConfirmedReceipt(null);
    setRejectionMessage(null);
    setUnknownOutcomeMessage(null);
  };

  // Selección de calidad
  const handleSelectQuality = (quality: MarketItemQuality) => {
    if (purchaseState === 'PENDING') return;
    setSelectedQuality(quality);
    setPurchaseState('PREVIEW');
    setRejectionMessage(null);
  };

  // Ejecución transaccional de la compra con commandId idempotente
  const handleExecutePurchase = async () => {
    if (!activeCharId || !selectedProduct || !selectedQuality || !marketData) return;
    if (purchaseState === 'PENDING') return;

    if (!canAfford) {
      setPurchaseState('REJECTED');
      setRejectionMessage(`Fondos insuficientes: el mercader exige ${unitPricePence}d y dispones de ${walletPence}d.`);
      return;
    }

    // Generar commandId determinista/único para esta transacción
    const cmdId = `cmd_buy_${activeCharId}_${selectedProduct.id}_${selectedQuality}_${Date.now()}`;
    setActiveCommandId(cmdId);
    setPurchaseState('PENDING');
    setRejectionMessage(null);
    setUnknownOutcomeMessage(null);

    try {
      const res = await apiClient.buyMarketItem({
        characterId: activeCharId,
        districtId: marketData.districtId,
        itemCode: selectedProduct.id,
        quality: selectedQuality,
        commandId: cmdId,
        expectedRevision: characterRevision
      });

      if (res?.success) {
        setPurchaseState('CONFIRMED');
        setConfirmedReceipt(res);
        setWalletPence(res.remainingBalance);
        if (res.revision) {
          setCharacterRevision(res.revision);
        }
        if (res.item) {
          setCharacterInventory(prev => [...prev, res.item]);
        }
        onRefreshCharacter?.();
      } else {
        setPurchaseState('REJECTED');
        setRejectionMessage(res?.error || 'Trato interrumpido por el mercader.');
      }
    } catch (err: any) {
      // Diferenciar rechazo de dominio (400/409) de fallo de red/resultado incierto
      if (err.status === 409 || err.code === 'REVISION_CONFLICT') {
        setPurchaseState('REJECTED');
        setRejectionMessage('Conflicto de revisión: el estado de tu personaje cambió. Sincronizando datos...');
        loadCharacterSession();
      } else if (err.status === 400 || err.code === 'DOMAIN_RULE_VIOLATION') {
        setPurchaseState('REJECTED');
        setRejectionMessage(err.message || 'Transacción rechazada según las normas del bazar.');
      } else {
        // Fallo de red / timeout -> Estado UNKNOWN_OUTCOME con recuperación de recibo
        setPurchaseState('UNKNOWN_OUTCOME');
        setUnknownOutcomeMessage(err.message || 'Pérdida de enlace con el mercader. Es necesario verificar el comprobante.');
      }
    }
  };

  // Recuperación idempotente de recibo ante fallo de red (UNKNOWN_OUTCOME)
  const handleRecoverReceipt = async () => {
    if (!activeCharId || !selectedProduct || !selectedQuality || !marketData || !activeCommandId) return;

    setPurchaseState('PENDING');
    try {
      const res = await apiClient.buyMarketItem({
        characterId: activeCharId,
        districtId: marketData.districtId,
        itemCode: selectedProduct.id,
        quality: selectedQuality,
        commandId: activeCommandId,
        expectedRevision: characterRevision
      });

      if (res?.success) {
        setPurchaseState('CONFIRMED');
        setConfirmedReceipt(res);
        setWalletPence(res.remainingBalance);
        if (res.revision) {
          setCharacterRevision(res.revision);
        }
        onRefreshCharacter?.();
      } else {
        setPurchaseState('REJECTED');
        setRejectionMessage(res?.error || 'No fue posible confirmar la transacción anterior.');
      }
    } catch (err: any) {
      setPurchaseState('UNKNOWN_OUTCOME');
      setUnknownOutcomeMessage(`Reintento fallido: ${err.message}. El comprobante se mantiene resguardado.`);
    }
  };

  // =========================================================================
  // RENDER: SIN SESIÓN ACTIVA
  // =========================================================================
  if (!activeCharId) {
    return (
      <div 
        className="p-8 flex flex-col justify-center items-center select-none relative overflow-hidden text-center text-[#e5ded2]"
        style={{ width: '1920px', height: '1080px', backgroundColor: '#0e0d0b' }}
      >
        <ShieldAlert size={48} className="text-[#8c733e] mb-4" />
        <h2 className="text-xl font-bold tracking-widest text-[#d4af37] font-serif mb-3 cinzel">
          SIN SESIÓN ACTIVA
        </h2>
        <p className="text-sm text-[#a89885] max-w-md font-serif mb-6 leading-relaxed">
          No hay una identidad civil activa con la cual comerciar en los bazares clandestinos de Backlund.
        </p>
        <button
          onClick={onBackToDesk}
          className="px-6 py-2.5 bg-[#171410] border border-[#8c733e] hover:border-[#d4af37] text-[#d4af37] rounded font-serif text-sm transition-all shadow-lg cursor-pointer"
        >
          Volver al Refugio
        </button>
      </div>
    );
  }

  const walletDisplay = formatVictorianCurrency(walletPence);

  return (
    <div 
      className="p-8 flex flex-col justify-between select-none relative overflow-hidden text-[#e5ded2]" 
      style={{ 
        width: '1920px',
        height: '1080px',
        position: 'relative',
        backgroundColor: '#0c0a08',
        backgroundImage: 'linear-gradient(180deg, rgba(12, 10, 8, 0.82) 0%, rgba(8, 7, 6, 0.94) 100%), url(/art/GFX37_bazaar_counter.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* Velo atmosférico y sombra cenital victoriana */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 35%, rgba(18, 15, 12, 0.65) 0%, rgba(6, 5, 4, 0.95) 100%)'
        }}
      />

      {/* =====================================================================
          CABECERA SUPERIOR DEL BAZAR
          ===================================================================== */}
      <header className="relative z-10 flex justify-between items-center pb-3 border-b-2 border-[#3d2f21] mb-5">
        <div className="flex items-center gap-4">
          <button
            onClick={onBackToDesk}
            type="button"
            className="px-4 py-2 bg-[#171410] border border-[#383024] hover:border-[#8c733e] text-[#d4af37] rounded flex items-center gap-2 text-sm font-serif transition-all cursor-pointer lotm-focus-ring"
            aria-label="Regresar al Buró (Esc)"
          >
            <ArrowLeft size={16} />
            Regresar al Buró (Esc)
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-widest text-[#d4af37] cinzel">
                {marketData ? marketData.vendorName.toUpperCase() : 'BAZAR CLANDESTINO'}
              </h1>
              {marketData?.specialtyPathway && (
                <span className="text-[10px] px-2 py-0.5 rounded font-serif font-bold uppercase border border-[#8c733e] bg-[#22180f] text-[#f5ebd9]">
                  {marketData.specialtyPathway === 'FOOL' ? 'Vía del Vidente (Fool)' : marketData.specialtyPathway === 'VISIONARY' ? 'Vía del Espectador' : 'Bazar Alquímico'}
                </span>
              )}
            </div>
            <p className="text-xs text-[#968c7e] italic font-serif">
              {marketData?.districtName || 'Distrito de Backlund'} · Tratos clandestinos bajo faroles de aceite
            </p>
          </div>
        </div>

        {/* Billetera e Inventario */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setShowInventoryDrawer(true)}
            className="flex items-center gap-2 bg-[#18130e] hover:bg-[#231a14] px-4 py-2 rounded border border-[#4a3622] text-xs text-[#dfcaa2] font-serif transition-all cursor-pointer"
          >
            <Package size={15} className="text-[#d4af37]" />
            <span>Faltriquera ({characterInventory.length} objetos)</span>
          </button>

          <div 
            className="flex items-center gap-2.5 bg-[#17130f] px-4 py-2 rounded border border-[#6b4e2f] shadow-inner"
            title={`${walletPence} peniques totales`}
          >
            <Coins size={16} className="text-[#d4af37]" />
            <div className="text-right font-serif">
              <span className="text-xs font-bold text-[#f5ebd9] block">
                {walletDisplay.formattedText}
              </span>
              <span className="text-[10px] text-[#968c7e] block">
                {walletPence}d en moneda de Loen
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* =====================================================================
          CONTENIDO CENTRAL: MOSTRADOR (7 COLS) + PANEL DE INSPECCIÓN (5 COLS)
          ===================================================================== */}
      <div className="relative z-10 grid grid-cols-12 gap-6 flex-1 min-h-0 mb-4">

        {/* Columna Izquierda: Mostrador de Mercancías sobre Bandeja (GFX38) */}
        <section 
          className="col-span-7 bg-[#14100c]/95 p-5 rounded-lg border-2 border-[#3d2f21] flex flex-col shadow-2xl backdrop-blur-md overflow-hidden"
          aria-label="Catálogo de Mercancías del Mostrador"
        >
          <div className="flex justify-between items-center mb-3 border-b border-[#2d2419] pb-2">
            <h2 className="font-serif font-bold text-sm text-[#e5ded2] cinzel flex items-center gap-2">
              <ShoppingBag size={15} className="text-[#d4af37]" />
              Mercancías Expuestas sobre el Paño
            </h2>
            <span className="text-[11px] text-[#8c7a65] italic font-serif">
              {marketData?.inventory?.length ?? 0} géneros disponibles
            </span>
          </div>

          {isLoadingMarket ? (
            <div className="flex-1 flex flex-col items-center justify-center text-[#8c7a65] font-serif italic text-xs">
              <RefreshCw size={24} className="animate-spin text-[#d4af37] mb-2" />
              Inspeccionando puestos bajo la niebla...
            </div>
          ) : catalogError || !marketData || marketData.inventory.length === 0 ? (
            // Estado honesto de catálogo vacío o distrito sin mercado
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#18120d]/80 rounded border border-[#3d2c1d]">
              <AlertTriangle size={36} className="text-[#a89885] mb-3" />
              <h3 className="text-sm font-bold text-[#d4af37] font-serif cinzel mb-2">
                SIN PUESTOS CLANDESTINOS EN ESTE DISTRITO
              </h3>
              <p className="text-xs text-[#a89885] font-serif max-w-md leading-relaxed mb-4">
                La vigilancia eclesiástica de las tres Iglesias Mayores o la ausencia de contactos clandestinos impide el comercio aquí.
              </p>
              <button
                type="button"
                onClick={onBackToDesk}
                className="px-4 py-2 bg-[#211710] border border-[#6b4e2f] hover:border-[#d4af37] text-[#dfcaa2] text-xs font-serif rounded transition-all cursor-pointer"
              >
                Regresar al Desván
              </button>
            </div>
          ) : (
            // Lista de mercancías con recorte y bandeja
            <div className="space-y-3 flex-1 overflow-y-auto pr-1">
              {marketData.inventory.map((item, idx) => {
                const isSelected = selectedProduct?.id === item.id;
                const baseCurrency = formatVictorianCurrency(item.basePricePence);

                return (
                  <div
                    key={item.id}
                    ref={(el) => { productRefs.current[item.id] = el; }}
                    tabIndex={0}
                    role="button"
                    aria-selected={isSelected}
                    onClick={() => handleSelectProduct(item)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleSelectProduct(item);
                      }
                    }}
                    className={`p-4 rounded-lg border transition-all cursor-pointer flex justify-between items-start relative overflow-hidden lotm-focus-ring ${
                      isSelected 
                        ? 'bg-[#22170f] border-[#d4af37] shadow-[0_0_15px_rgba(212,175,55,0.25)]' 
                        : 'bg-[#16120e]/95 border-[#2d2216] hover:border-[#8c733e] hover:bg-[#1b1510]'
                    }`}
                    style={{
                      backgroundImage: 'url(/art/GFX38_bazaar_tray.jpg)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundBlendMode: 'overlay'
                    }}
                  >
                    <div className="relative z-10 max-w-md">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-serif font-bold text-sm text-[#f5ebd9] cinzel">
                          {idx + 1}. {item.name}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded font-serif font-bold border border-[#4a3622] bg-[#1a120c] text-[#d4af37]">
                          {item.category === 'MAIN_INGREDIENT' ? 'Principal' : item.category === 'SUPPLEMENTARY_INGREDIENT' ? 'Suplementario' : 'Ritual'}
                        </span>
                      </div>

                      <p className="text-xs text-[#a89885] italic font-serif leading-relaxed line-clamp-2">
                        {item.derivationCanon}
                      </p>

                      <div className="text-[11px] text-[#8c7a65] font-serif flex items-center gap-3 mt-1.5">
                        <span>Afinidad: {item.pathwayTarget}</span>
                        {item.sequence && <span>Secuencia {item.sequence}</span>}
                        <span>Calidades: {item.availableQualities.join(', ')}</span>
                      </div>
                    </div>

                    <div className="text-right relative z-10 pl-3">
                      <span className="text-xs font-serif font-bold text-[#d4af37] block">
                        {baseCurrency.formattedText}
                      </span>
                      <span className="text-[10px] text-[#8c7a65] font-serif block">
                        Base: {item.basePricePence}d
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Columna Derecha: Panel de Inspección y Formalización (GFX30 Papel Plano) */}
        <section 
          className="col-span-5 bg-[#14100c]/95 p-5 rounded-lg border-2 border-[#3d2f21] flex flex-col justify-between shadow-2xl backdrop-blur-md overflow-hidden"
          aria-label="Examen Detallado y Condiciones de Compra"
        >
          {selectedProduct ? (
            <div className="flex flex-col h-full justify-between">
              
              {/* Información y Dictamen Canónico */}
              <div>
                <div className="flex items-center justify-between border-b border-[#3d2f21] pb-2 mb-3">
                  <div className="flex items-center gap-2">
                    <ShoppingBag size={18} className="text-[#d4af37]" />
                    <h3 className="font-serif font-bold text-sm text-[#f5ebd9] cinzel">
                      {selectedProduct.name}
                    </h3>
                  </div>
                  <span className="text-[10px] text-[#8c7a65] font-mono">
                    {selectedProduct.id}
                  </span>
                </div>

                {/* Pliego de Examen Alquímico (GFX30) */}
                <div 
                  className="p-4 rounded text-[#1b1510] mb-3 shadow border border-[#8c733e]/60 relative"
                  style={{
                    backgroundImage: 'url(/art/GFX30_flat_paper.jpg)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundColor: '#ede4d1'
                  }}
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#523d24] block mb-1 font-serif border-b border-[#8c733e]/40 pb-0.5">
                    Dictamen Canónico del Tasador
                  </span>
                  <p className="text-xs leading-relaxed italic mb-2 font-serif text-[#1b1510]">
                    "{selectedProduct.derivationCanon}"
                  </p>
                  <div className="border-t border-[#8c733e]/40 pt-1.5 text-[11px] text-[#3d2f21] flex justify-between font-serif">
                    <span>Categoría: {selectedProduct.category}</span>
                    <span className="font-bold">Base: {selectedProduct.basePricePence} peniques</span>
                  </div>
                </div>

                {/* Selector de Calidad (Regla P10: Unknown quality remains unknown until selected) */}
                <div className="mb-3">
                  <label className="block text-xs text-[#dfcaa2] font-serif font-bold mb-1.5">
                    Estado de Preservación de la Muestra:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['PRISTINE', 'DAMAGED', 'CONTAMINATED'] as MarketItemQuality[]).map((quality) => {
                      const isAvailable = selectedProduct.availableQualities.includes(quality);
                      const isChosen = selectedQuality === quality;
                      const mod = qualityModifiers[quality];

                      return (
                        <button
                          key={quality}
                          type="button"
                          disabled={!isAvailable || purchaseState === 'PENDING'}
                          onClick={() => handleSelectQuality(quality)}
                          className={`p-2 rounded border text-left font-serif transition-all cursor-pointer ${
                            !isAvailable 
                              ? 'opacity-30 bg-[#16120e] border-[#292015] cursor-not-allowed'
                              : isChosen
                              ? 'bg-[#2b1d14] border-[#d4af37] text-[#f5ebd9] shadow-sm'
                              : 'bg-[#18130e] border-[#3d2c1d] text-[#a89885] hover:border-[#8c733e]'
                          }`}
                        >
                          <div className="flex justify-between items-center mb-0.5">
                            <span className="text-[11px] font-bold">
                              {quality === 'PRISTINE' ? 'Prístina' : quality === 'DAMAGED' ? 'Dañada' : 'Contaminada'}
                            </span>
                            {mod && (
                              <span className="text-[10px] text-[#d4af37]">
                                {mod.priceMultiplier}x
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] block leading-tight text-[#8c7a65]">
                            {quality === 'PRISTINE' 
                              ? 'Pureza intacta' 
                              : quality === 'DAMAGED' 
                              ? 'Deterioro visible' 
                              : 'Mácula espiritual'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Desglose de Liquidación */}
                <div className="p-3 bg-[#18120d] rounded border border-[#3d2c1d] text-xs font-serif space-y-1.5 mb-3">
                  <div className="flex justify-between text-[#a89885]">
                    <span>Calidad examinada:</span>
                    <span className="text-[#f5ebd9] font-bold">
                      {selectedQuality 
                        ? (selectedQuality === 'PRISTINE' ? 'Prístina (1.0x)' : selectedQuality === 'DAMAGED' ? 'Dañada (0.6x)' : 'Contaminada (0.35x)')
                        : 'Por determinar (Examen pendiente)'}
                    </span>
                  </div>

                  <div className="flex justify-between text-[#a89885]">
                    <span>Precio final exigido:</span>
                    <span className="text-[#d4af37] font-bold">
                      {selectedQuality 
                        ? `${formatVictorianCurrency(unitPricePence).formattedText} (${unitPricePence}d)` 
                        : `${formatVictorianCurrency(selectedProduct.basePricePence).formattedText} (Base)`}
                    </span>
                  </div>

                  <div className="flex justify-between text-[#a89885]">
                    <span>Tu saldo actual:</span>
                    <span className="text-[#e5ded2]">
                      {walletDisplay.formattedText} ({walletPence}d)
                    </span>
                  </div>

                  <div className="flex justify-between border-t border-[#292015] pt-1.5 font-bold">
                    <span>Remanente tras el trato:</span>
                    <span className={canAfford && selectedQuality ? 'text-[#86efac]' : 'text-[#fca5a5]'}>
                      {selectedQuality 
                        ? (canAfford ? `${formatVictorianCurrency(balanceAfterPurchase).formattedText} (${balanceAfterPurchase}d)` : `Faltan ${unitPricePence - walletPence}d`)
                        : 'Selecciona una muestra'}
                    </span>
                  </div>
                </div>

                {/* Avisos de Ciclo de Vida: CONFIRMED / REJECTED / UNKNOWN_OUTCOME */}
                {purchaseState === 'CONFIRMED' && confirmedReceipt && (
                  <div className="p-3 rounded bg-[#152312] border border-[#22c55e]/60 text-xs text-[#86efac] font-serif flex items-start gap-2 mb-3 animate-fadeIn">
                    <CheckCircle size={16} className="shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">¡Trato Formalizado en Regla!</p>
                      <p className="text-[11px] text-[#bbf7d0]">
                        Has adquirido "{selectedProduct.name}" por {confirmedReceipt.penceSpent}d. 
                        {confirmedReceipt.fromReceipt ? ' (Comprobante recuperado de operación previa).' : ' El paquete descansa en tu faltriquera.'}
                      </p>
                    </div>
                  </div>
                )}

                {purchaseState === 'REJECTED' && rejectionMessage && (
                  <div className="p-3 rounded bg-[#2b1715] border border-[#ef4444]/60 text-xs text-[#fca5a5] font-serif flex items-start gap-2 mb-3 animate-fadeIn">
                    <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Trato Rechazado:</p>
                      <p className="text-[11px] text-[#fecaca]">{rejectionMessage}</p>
                    </div>
                  </div>
                )}

                {purchaseState === 'UNKNOWN_OUTCOME' && (
                  <div className="p-3 rounded bg-[#2d2212] border border-[#eab308]/60 text-xs text-[#fef08a] font-serif flex items-start gap-2 mb-3 animate-fadeIn">
                    <Info size={16} className="shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-bold">Resultado Incierto:</p>
                      <p className="text-[11px] text-[#fef9c3] mb-2">{unknownOutcomeMessage}</p>
                      <button
                        type="button"
                        onClick={handleRecoverReceipt}
                        className="px-3 py-1 bg-[#854d0e] hover:bg-[#a16207] text-[#fffbeb] rounded text-[11px] font-bold transition-all cursor-pointer"
                      >
                        Verificar Comprobante de Compra
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Botón de Compra / Acción */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleExecutePurchase}
                  disabled={
                    !selectedQuality || 
                    !canAfford || 
                    purchaseState === 'PENDING'
                  }
                  className={`w-full py-3 rounded text-xs font-serif uppercase tracking-wider font-bold transition-all cursor-pointer lotm-focus-ring ${
                    purchaseState === 'PENDING'
                      ? 'bg-[#2b1e16] text-[#a89885] border border-[#4a3622] cursor-wait'
                      : !selectedQuality
                      ? 'bg-[#1c1611] text-[#6b5d4f] border border-[#2e2319] cursor-not-allowed'
                      : !canAfford
                      ? 'bg-[#291715] text-[#fca5a5] border border-[#522521] cursor-not-allowed'
                      : 'crimson-btn shadow-lg'
                  }`}
                >
                  {purchaseState === 'PENDING'
                    ? 'Entregando chelines al mercader...'
                    : !selectedQuality
                    ? 'Selecciona la Calidad a Examinar'
                    : !canAfford
                    ? `Fondos Insuficientes (${unitPricePence}d requeridos)`
                    : `Pagar ${formatVictorianCurrency(unitPricePence).formattedText} y Recoger`}
                </button>
              </div>

            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-[#8c7a65] font-serif italic text-xs">
              <ShoppingBag size={32} className="text-[#3d2f21] mb-2" />
              Selecciona una mercancía expuesta sobre el paño para evaluar su autenticidad y precio.
            </div>
          )}
        </section>

      </div>

      {/* Pie diegético */}
      <footer className="text-[11px] text-[#6e6353] italic font-serif text-center border-t border-[#221c14] pt-2 relative z-10">
        El aroma a tabaco barato, mirra y cera de abeja se mezcla con el aire denso y húmedo de Backlund.
      </footer>

      {/* =====================================================================
          DRAWER / MODAL DE FALTRIQUERA E INVENTARIO
          ===================================================================== */}
      {showInventoryDrawer && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center p-8 z-50 animate-fadeIn"
          onClick={() => setShowInventoryDrawer(false)}
        >
          <div 
            className="w-full max-w-2xl bg-[#16120e] text-[#e5ded2] rounded-xl p-6 shadow-2xl border-2 border-[#8c733e] font-serif relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-[#3d2c1d] pb-3 mb-4">
              <h2 className="text-sm font-bold text-[#d4af37] cinzel flex items-center gap-2">
                <Package size={16} />
                Contenido de tu Faltriquera y Bolsillos Clandestinos
              </h2>
              <button 
                type="button"
                onClick={() => setShowInventoryDrawer(false)}
                className="text-[#9c8e7b] hover:text-[#e5ded2] cursor-pointer"
                aria-label="Cerrar Faltriquera"
              >
                <X size={16} />
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto pr-2 space-y-2">
              {characterInventory.length === 0 ? (
                <p className="text-xs text-[#8c7a65] italic py-6 text-center">
                  Tus bolsillos solo guardan pelusas y recibos arrugados. No posees ingredientes ni suministros alquímicos.
                </p>
              ) : (
                characterInventory.map((item, idx) => (
                  <div 
                    key={item.id || `inv_${idx}`}
                    className="p-3 bg-[#1e1711] rounded border border-[#3d2c1d] flex justify-between items-center text-xs"
                  >
                    <div>
                      <span className="font-bold text-[#f5ebd9] block">
                        {item.name || item.item_code}
                      </span>
                      <span className="text-[10px] text-[#a89885] block">
                        Categoría: {item.category || 'INGREDIENT'} · Calidad: {item.quality || 'PRISTINE'}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-[#d4af37] px-2.5 py-1 bg-[#140e0a] rounded border border-[#4a3622]">
                      Cant: {item.quantity ?? 1}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-4 border-t border-[#3d2c1d] mt-4">
              <button
                type="button"
                onClick={() => setShowInventoryDrawer(false)}
                className="px-4 py-1.5 bg-[#211710] border border-[#6b4e2f] hover:border-[#d4af37] text-[#dfcaa2] text-xs font-serif rounded transition-all cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
