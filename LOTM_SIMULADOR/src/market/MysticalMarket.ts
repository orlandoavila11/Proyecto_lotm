import { Player } from '../character/Player';
import { DatabaseManager } from '../database/DatabaseManager';
import { InventoryItem } from '../inventory/InventorySystem';

export interface MarketItemOffer {
  id: string;
  name: string;
  type: "INGREDIENT" | "ARTIFACT" | "CONSUMABLE" | "EQUIPMENT";
  pricePounds: number;
  requiredMaxSequence: number; 
  description: string;
  referenceId: string; 
}

export class MysticalMarket {
  private staticOffers: MarketItemOffer[] = [];

  constructor() {
    this.initializeStaticCatalog();
  }

  /**
   * Precios fijos de provisiones comunes ajustados al valor real del Reino de Loen.
   */
  private initializeStaticCatalog(): void {
    this.staticOffers.push({
      id: "MK_BSC_01",
      name: "Apothecary Mental Sedative",
      type: "CONSUMABLE",
      pricePounds: 1, // Reducido: En la novela £1-£2 es una suma respetable para una medicina ordinaria
      requiredMaxSequence: 9,
      description: "Destilado herbolario básico de vainilla nocturna. Estabiliza los medidores psíquicos.",
      referenceId: "BASIC_SEDATIVE"
    });

    this.staticOffers.push({
      id: "MK_BSC_02",
      name: "Hunting Revolver (Standard)",
      type: "EQUIPMENT",
      pricePounds: 4, // Ajustado al canon: Klein compra su revólver por aproximadamente £3-£5 libras
      requiredMaxSequence: 9,
      description: "Arma de fuego convencional loenesa de tambor de 6 alvéolos.",
      referenceId: "REVOLVER_BASE"
    });
  }

  /**
   * Genera el catálogo completo aplicando las fórmulas de cotización reales de la novela
   */
  public generateCatalogForPlayer(player: Player): MarketItemOffer[] {
    const catalog: MarketItemOffer[] = [...this.staticOffers];
    const db = DatabaseManager.getInstance();

    // 1. EXTRACTOR Y COTIZADOR DE INGREDIENTES CANÓNICOS (PATHWAYS)
    const currentPotionData = db.getSequenceData(player.pathway, player.sequence);

    if (currentPotionData && currentPotionData.formula && currentPotionData.formula.mainIngredients) {
      currentPotionData.formula.mainIngredients.forEach((ingredientName: string, index: number) => {
        let canonicalPrice = 15;

        // Fórmulas matemáticas de progresión económica real de la novela
        if (player.sequence === 9) canonicalPrice = 15 + (index * 5);        // Secuencia 9: £15 - £20
        else if (player.sequence === 8) canonicalPrice = 90 + (index * 20);   // Secuencia 8: £90 - £110
        else if (player.sequence === 7) canonicalPrice = 350 + (index * 50);  // Secuencia 7: £350 - £400
        else if (player.sequence === 6) canonicalPrice = 1200 + (index * 200); // Secuencia 6: £1,200 - £1,400
        else if (player.sequence === 5) canonicalPrice = 2500 + (index * 300); // Secuencia 5: £2,500 - £2,800
        else if (player.sequence <= 4) canonicalPrice = 8000 + (index * 1500); // Semidioses hacia arriba: +£8,000

        catalog.push({
          id: `MK_DYNAMIC_ING_${index}`,
          name: ingredientName,
          type: "INGREDIENT",
          pricePounds: canonicalPrice,
          requiredMaxSequence: player.sequence,
          description: `Ingrediente principal canónico requerido para avanzar en la vía [${player.pathway}].`,
          referenceId: `${player.pathway}_S${player.sequence}_MAIN_ING_${index}`
        });
      });
    }

    // ==========================================================================
    // 2. EXTRACTOR Y COTIZADOR DE ARTEFACTOS SELLADOS (DE TUS JSONs)
    // ==========================================================================
    const allArtifacts = (db as any).artifacts; 

    if (allArtifacts && allArtifacts instanceof Map) {
      allArtifacts.forEach((artifact: any) => {
        let price = 300;
        let allowedSequenceThreshold = 9; 

        // Escala estricta de precios de artefactos según su grado
        if (artifact.grade === 3) {
          price = 250; // Grado 3 (Peligro Menor): £250 libras
          allowedSequenceThreshold = 9; 
        } else if (artifact.grade === 2) {
          price = 1800; // Grado 2 (Peligro Medio): £1,800 libras
          allowedSequenceThreshold = 6; 
        } else if (artifact.grade === 1) {
          price = 9500; // Grado 1 (Peligro Alto / Santos): £9,500 libras
          allowedSequenceThreshold = 4; 
        } else if (artifact.grade === 0) {
          price = 50000; // Grado 0 (Calamidad Cósmica): Inalcanzable (£50,000)
          allowedSequenceThreshold = 2; 
        }

        if (player.sequence <= allowedSequenceThreshold) {
          catalog.push({
            id: `MK_ART_${artifact.id.toUpperCase()}`,
            name: artifact.name,
            type: "ARTIFACT",
            pricePounds: price,
            requiredMaxSequence: allowedSequenceThreshold,
            description: `Artefacto Sellado Grado ${artifact.grade}. Habilidades indexadas: ${artifact.abilities.join(', ')}.`,
            referenceId: artifact.id
          });
        }
      });
    }

    return catalog;
  }

  public purchaseItem(offer: MarketItemOffer, player: Player): string {
    if (player.sequence > offer.requiredMaxSequence) {
      return `⚠️ [RESTRICCIÓN MÍSTICA]: Tu nivel de secuencia es insuficiente para este objeto.`;
    }

    const deductionSuccess = player.removeCurrency(offer.pricePounds, 0, 0);
    if (!deductionSuccess) {
      return `❌ FONDOS INSUFICIENTES: El artículo [${offer.name}] cuesta £${offer.pricePounds} Libras. Solo posees £${player.wallet.pounds}.`;
    }

    const purchasedInventoryItem: InventoryItem = {
      id: offer.referenceId,
      name: offer.name,
      type: offer.type === "ARTIFACT" ? "ARTIFACT" : "INGREDIENT",
      weight: offer.type === "ARTIFACT" ? 12 : 1,
      quantity: 1,
      description: offer.description,
      ...(offer.type === "ARTIFACT" ? { grade: 3, negativeEffects: [], abilitiesGranted: [], isCurrentlySealed: true } : { isMainIngredient: true, sourceCreature: "Contrabando" })
    } as any;

    player.inventory.addItem(purchasedInventoryItem);
    return `💰 [MERCADO NEGRO]: Compra exitosa. Guardaste en tu mochila: [${offer.name}]`;
  }
}
