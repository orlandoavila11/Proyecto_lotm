import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseClient, InventoryItemRow } from '../../infra/database/DatabaseClient.js';
import { generateDeterministicId } from '../rng/IdGenerator.js';
import { SomaticsEngine } from '../somatics/SomaticsEngine.js';
import { RuinaTier } from '../types/somatics.js';
import {
  EconomyBalance,
  EconomyBalanceSchema
} from '../../infra/content/schemas/economyBalance.schema.js';
import {
  EconomyMarket,
  EconomyMarketSchema,
  DistrictMarket,
  MarketItemQuality,
  MarketItemListing
} from '../../infra/content/schemas/economyMarket.schema.js';

export class EconomyEngine {
  private static balanceData: EconomyBalance | null = null;
  private static marketData: EconomyMarket | null = null;

  public static getEconomyBalance(): EconomyBalance {
    if (!this.balanceData) {
      const packageRoot = fileURLToPath(new URL('../../..', import.meta.url));
      const filePath = path.join(packageRoot, 'data', 'gameplay', 'balance', 'economy.json');
      const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      this.balanceData = EconomyBalanceSchema.parse(raw);
    }
    return this.balanceData;
  }

  public static getMarketCatalog(): EconomyMarket {
    if (!this.marketData) {
      const packageRoot = fileURLToPath(new URL('../../..', import.meta.url));
      const filePath = path.join(packageRoot, 'data', 'gameplay', 'economy', 'market.json');
      const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      this.marketData = EconomyMarketSchema.parse(raw);
    }
    return this.marketData;
  }

  public static getDistrictMarket(districtId: string): DistrictMarket | null {
    const catalog = this.getMarketCatalog();
    const market = catalog.markets.find(m => m.districtId === districtId || districtId.toLowerCase().includes(m.districtId));
    return market || catalog.markets[0]; // fallback canónico al primer mercado
  }

  /**
   * Procesa la deducción semanal de alquiler durante el tick semanal.
   * Saldo insuficiente -> flag de deuda persistente + nota narrativa de la casera.
   */
  public static processWeeklyRent(
    db: DatabaseClient,
    characterId: string,
    districtId?: string
  ): {
    rentCharged: number;
    rentPaid: boolean;
    debtCreated: boolean;
    remainingBalance: number;
    note: string;
  } {
    const balance = this.getEconomyBalance();
    const char = db.getCharacter(characterId);
    if (!char) {
      throw new Error(`Character '${characterId}' not found`);
    }

    // Determinar alquiler del distrito
    let rentPence = balance.rent.defaultRentPencePerWeek;
    if (districtId) {
      const override = balance.rent.districtOverrides.find(d => d.districtId === districtId || districtId.toLowerCase().includes(d.districtId));
      if (override) {
        rentPence = override.rentPencePerWeek;
      }
    }

    if (char.raw_pence >= rentPence) {
      // Pago exitoso
      const remaining = db.updateCharacterWealth(characterId, -rentPence);
      db.updateCharacterRentDebt(characterId, false, 0, null);
      return {
        rentCharged: rentPence,
        rentPaid: true,
        debtCreated: false,
        remainingBalance: remaining,
        note: `Alquiler semanal de ${rentPence}d saldado en regla con la casera.`
      };
    } else {
      // Saldo insuficiente: genera deuda
      const debtAmount = rentPence - char.raw_pence;
      db.updateCharacterWealth(characterId, -char.raw_pence); // Agota el remanente
      const narrativeNote = balance.rent.debtNarrativeNote;
      db.updateCharacterRentDebt(characterId, true, debtAmount, narrativeNote);

      return {
        rentCharged: rentPence,
        rentPaid: false,
        debtCreated: true,
        remainingBalance: 0,
        note: narrativeNote
      };
    }
  }

  /**
   * Compra un ingrediente en el mercado distrital aplicando el modificador de calidad.
   */
  public static buyMarketItem(
    db: DatabaseClient,
    characterId: string,
    districtId: string,
    itemCode: string,
    quality: MarketItemQuality,
    currentDay: number
  ): {
    success: boolean;
    item?: InventoryItemRow;
    penceSpent: number;
    remainingBalance: number;
    error?: string;
  } {
    const balance = this.getEconomyBalance();
    const market = this.getDistrictMarket(districtId);
    if (!market) {
      return { success: false, penceSpent: 0, remainingBalance: 0, error: `Mercado no disponible en '${districtId}'` };
    }

    const listing = market.inventory.find(i => i.id === itemCode);
    if (!listing) {
      return { success: false, penceSpent: 0, remainingBalance: 0, error: `El ingrediente '${itemCode}' no se vende en '${market.districtName}'` };
    }

    if (!listing.availableQualities.includes(quality)) {
      return { success: false, penceSpent: 0, remainingBalance: 0, error: `La calidad '${quality}' no está disponible para '${listing.name}'` };
    }

    const char = db.getCharacter(characterId);
    if (!char) {
      return { success: false, penceSpent: 0, remainingBalance: 0, error: `Character '${characterId}' no existe` };
    }

    const qualityMod = balance.qualityModifiers[quality];
    const finalPrice = Math.round(listing.basePricePence * qualityMod.priceMultiplier);

    if (char.raw_pence < finalPrice) {
      return {
        success: false,
        penceSpent: 0,
        remainingBalance: char.raw_pence,
        error: `Fondos insuficientes: se requieren ${finalPrice}d (£${(finalPrice / 240).toFixed(2)}) y posees ${char.raw_pence}d.`
      };
    }

    // Ejecutar compra dentro de una transacción atómica (F08)
    return db.transaction(() => {
      // Cobrar al personaje
      const remaining = db.updateCharacterWealth(characterId, -finalPrice);

      // Añadir al inventario con calidad explícita
      const itemId = db.nextId('inv_ing');
      const invItem = db.addInventoryItem({
        id: itemId,
        character_id: characterId,
        item_code: listing.id,
        name: listing.name,
        category: listing.category === 'RITUAL_SUPPLY' ? 'CONSUMABLE' : 'INGREDIENT',
        grade: null,
        quantity: 1,
        quality,
        metadata_json: JSON.stringify({
          pathway: listing.pathwayTarget,
          basePrice: listing.basePricePence,
          qualityModifier: qualityMod
        })
      });

      // Registrar transacción de mercado
      const txId = db.nextId('tx_buy');
      db.logMarketTransaction({
        id: txId,
        character_id: characterId,
        type: 'BUY',
        item_code: listing.id,
        quality,
        pence_amount: finalPrice,
        day: currentDay,
        description: `Compra de '${listing.name}' [${quality}] en '${market.districtName}' por ${finalPrice}d.`
      });

      return {
        success: true,
        item: invItem,
        penceSpent: finalPrice,
        remainingBalance: remaining
      };
    });
  }

  /**
   * Venta de excedentes de cosecha (el bucle combate -> cosecha -> venta).
   */
  public static sellHarvestItem(
    db: DatabaseClient,
    characterId: string,
    inventoryItemId: string,
    grade: 'COMMON' | 'UNCOMMON' | 'RARE',
    currentDay: number
  ): {
    success: boolean;
    penceGained: number;
    remainingBalance: number;
    error?: string;
  } {
    const balance = this.getEconomyBalance();
    const item = db.getInventoryItemById(inventoryItemId);
    if (!item || item.character_id !== characterId) {
      return { success: false, penceGained: 0, remainingBalance: 0, error: 'Ítem no encontrado en inventario' };
    }

    const buyback = balance.harvestBuybacks.find(b => b.grade === grade);
    const price = buyback ? buyback.buybackPence : 24;

    return db.transaction(() => {
      db.removeInventoryItem(inventoryItemId, 1);
      const remaining = db.updateCharacterWealth(characterId, price);

      const txId = db.nextId('tx_sell');
      db.logMarketTransaction({
        id: txId,
        character_id: characterId,
        type: 'SELL',
        item_code: item.item_code,
        quality: item.quality,
        pence_amount: price,
        day: currentDay,
        description: `Venta de excedente de cosecha '${item.name}' [${grade}] por ${price}d.`
      });

      return {
        success: true,
        penceGained: price,
        remainingBalance: remaining
      };
    });
  }

  /**
   * Curas de corrupción: pagar por reducir corrupción (la Ruina JAMÁS baja — ya es ley del suelo).
   * Coste creciente por tier de Ruina.
   */
  public static purchaseCorruptionCure(
    db: DatabaseClient,
    characterId: string,
    currentDay: number
  ): {
    success: boolean;
    costPence: number;
    corruptionReduced: number;
    newCorruption: number;
    ruinaUnchanged: number;
    description: string;
    error?: string;
  } {
    const balance = this.getEconomyBalance();
    const char = db.getCharacter(characterId);
    if (!char) {
      return { success: false, costPence: 0, corruptionReduced: 0, newCorruption: 0, ruinaUnchanged: 0, description: '', error: 'Character no encontrado' };
    }

    const ruinaTier = SomaticsEngine.getRuinaTier(char.ruina ?? 0).tier;
    const cureConfig = balance.corruptionCures.find(c => c.tier === ruinaTier) || balance.corruptionCures[0];

    if (char.raw_pence < cureConfig.costPence) {
      return {
        success: false,
        costPence: cureConfig.costPence,
        corruptionReduced: 0,
        newCorruption: char.corruption,
        ruinaUnchanged: char.ruina ?? 0,
        description: '',
        error: `Fondos insuficientes para el tratamiento somático en tier '${ruinaTier}': se requieren ${cureConfig.costPence}d y posees ${char.raw_pence}d.`
      };
    }

    if (char.corruption <= 0) {
      return {
        success: false,
        costPence: 0,
        corruptionReduced: 0,
        newCorruption: 0,
        ruinaUnchanged: char.ruina ?? 0,
        description: '',
        error: 'Tu cuerpo astral no presenta impurezas de corrupción acumuladas que requieran cura.'
      };
    }

    return db.transaction(() => {
      // Cobrar coste y reducir corrupción (Ruina permanece INTACTA)
      const newPence = db.updateCharacterWealth(characterId, -cureConfig.costPence);
      const newCorruption = Math.max(0, char.corruption - cureConfig.corruptionReduction);
      db.updateCharacterSomatics(characterId, { corruption: newCorruption });

      const txId = db.nextId('tx_cure');
      db.logMarketTransaction({
        id: txId,
        character_id: characterId,
        type: 'CURE',
        pence_amount: cureConfig.costPence,
        day: currentDay,
        description: `Cura psíquica en tier '${ruinaTier}': -${cureConfig.corruptionReduction} corrupción por ${cureConfig.costPence}d. Ruina intacta (${char.ruina ?? 0}).`
      });

      return {
        success: true,
        costPence: cureConfig.costPence,
        corruptionReduced: cureConfig.corruptionReduction,
        newCorruption,
        ruinaUnchanged: char.ruina ?? 0,
        description: cureConfig.description
      };
    });
  }
}
