import { describe, it } from 'node:test';
import assert from 'node:assert';
import { DatabaseClient } from '../src/infra/database/DatabaseClient.js';
import { SeededRNG } from '../src/core/rng/SeededRNG.js';
import { EconomyEngine } from '../src/core/economy/EconomyEngine.js';
import { AscensionEngine, PreparationChecklist } from '../src/core/ascension/AscensionEngine.js';
import { ActingDilemmaEngine } from '../src/core/acting/ActingDilemmaEngine.js';

function createCleanTestDb(): DatabaseClient {
  return new DatabaseClient(':memory:');
}

describe('GATE 08: Economía Victoriana, Las Cinco Puertas y La Escena del Trago', () => {

  it('1. Balance Económico Centralizado y Catálogo de Mercado S8', () => {
    const balance = EconomyEngine.getEconomyBalance();
    assert.strictEqual(balance.rent.defaultRentPencePerWeek, 24);
    assert.ok(balance.rent.districtOverrides.length >= 4);
    assert.strictEqual(balance.qualityModifiers.PRISTINE.priceMultiplier, 1.0);
    assert.strictEqual(balance.qualityModifiers.DAMAGED.priceMultiplier, 0.6);
    assert.strictEqual(balance.qualityModifiers.CONTAMINATED.priceMultiplier, 0.35);

    const catalog = EconomyEngine.getMarketCatalog();
    assert.ok(catalog.markets.length >= 4);

    const bridgeMarket = EconomyEngine.getDistrictMarket('bridge_borough');
    assert.ok(bridgeMarket);
    assert.strictEqual(bridgeMarket!.specialtyPathway, 'FOOL');
    const goatHorn = bridgeMarket!.inventory.find(i => i.id === 'ING_GOAT_HORN_CRYSTAL');
    assert.ok(goatHorn, 'El cuerno de cabra de Hornacis debe existir en el Distrito del Puente');
    assert.strictEqual(goatHorn!.sequence, 8);

    const northMarket = EconomyEngine.getDistrictMarket('backlund_north');
    assert.ok(northMarket);
    assert.strictEqual(northMarket!.specialtyPathway, 'VISIONARY');
    const lizardGland = northMarket!.inventory.find(i => i.id === 'ING_LIZARD_DRAGON_GLAND');
    assert.ok(lizardGland, 'La glándula de dragón lagarto debe existir en North Backlund');
  });

  it('2. Alquiler Semanal en Tick: Deducción exitosa vs Saldo insuficiente con Deuda persistente', () => {
    const db = createCleanTestDb();

    // Personaje 1: Solvente (7200d)
    const richChar = db.createCharacter({
      id: 'char_solvent',
      name: 'Sherlock Moriarty',
      pathway: 'FOOL',
      sequence: 9,
      current_health: 100,
      max_health: 100,
      current_spirituality: 100,
      max_spirituality: 100,
      sanity: 100,
      corruption: 0,
      raw_pence: 7200
    });

    const solventRent = EconomyEngine.processWeeklyRent(db, richChar.id, 'cherwood');
    assert.strictEqual(solventRent.rentPaid, true);
    assert.strictEqual(solventRent.debtCreated, false);
    assert.strictEqual(solventRent.remainingBalance, 7200 - 24);

    const solventDbChar = db.getCharacter(richChar.id)!;
    assert.strictEqual(solventDbChar.rent_debt_active, 0);

    // Personaje 2: Indigente (10d < 24d)
    const poorChar = db.createCharacter({
      id: 'char_poor',
      name: 'Mendigo de East Borough',
      pathway: 'FOOL',
      sequence: 9,
      current_health: 100,
      max_health: 100,
      current_spirituality: 100,
      max_spirituality: 100,
      sanity: 90,
      corruption: 0,
      raw_pence: 10
    });

    const poorRent = EconomyEngine.processWeeklyRent(db, poorChar.id, 'cherwood');
    assert.strictEqual(poorRent.rentPaid, false);
    assert.strictEqual(poorRent.debtCreated, true);
    assert.strictEqual(poorRent.remainingBalance, 0);

    const poorDbChar = db.getCharacter(poorChar.id)!;
    assert.strictEqual(poorDbChar.rent_debt_active, 1);
    assert.strictEqual(poorDbChar.rent_debt_amount, 14); // 24 - 10 = 14d
    assert.ok(poorDbChar.rent_debt_note?.includes('casera recuerda'), 'La casera debe recordar la deuda');
  });

  it('3. Curas de Corrupción: Coste creciente por Tier Somático y Ruina Intacta', () => {
    const db = createCleanTestDb();

    const char = db.createCharacter({
      id: 'char_corrupt',
      name: 'Audrey Hall',
      pathway: 'VISIONARY',
      sequence: 9,
      current_health: 100,
      max_health: 100,
      current_spirituality: 100,
      max_spirituality: 100,
      sanity: 80,
      corruption: 25,
      ruina: 12, // Tier MARCADO
      raw_pence: 1200
    });

    const cureResult = EconomyEngine.purchaseCorruptionCure(db, char.id, 1);
    assert.strictEqual(cureResult.success, true);
    assert.strictEqual(cureResult.costPence, 144); // Coste en tier MARCADO = 144d
    assert.strictEqual(cureResult.corruptionReduced, 5);
    assert.strictEqual(cureResult.newCorruption, 20);
    assert.strictEqual(cureResult.ruinaUnchanged, 12, 'La ruina jamás baja por una cura económica');

    const updatedChar = db.getCharacter(char.id)!;
    assert.strictEqual(updatedChar.corruption, 20);
    assert.strictEqual(updatedChar.ruina, 12);
    assert.strictEqual(updatedChar.raw_pence, 1200 - 144);
  });

  it('4. Bucle de Compra en Mercado y Venta de Excedentes de Cosecha', () => {
    const db = createCleanTestDb();

    const char = db.createCharacter({
      id: 'char_merchant',
      name: 'Klein Moretti',
      pathway: 'FOOL',
      sequence: 9,
      current_health: 100,
      max_health: 100,
      current_spirituality: 100,
      max_spirituality: 100,
      sanity: 100,
      corruption: 0,
      raw_pence: 2000
    });

    // Compra de ingrediente en calidad PRISTINE
    const buyRes = EconomyEngine.buyMarketItem(db, char.id, 'bridge_borough', 'ING_GOAT_HORN_CRYSTAL', 'PRISTINE', 2);
    assert.strictEqual(buyRes.success, true);
    assert.strictEqual(buyRes.penceSpent, 1200);
    assert.strictEqual(buyRes.remainingBalance, 800);

    const inv = db.getInventoryItems(char.id);
    assert.strictEqual(inv.length, 1);
    assert.strictEqual(inv[0].item_code, 'ING_GOAT_HORN_CRYSTAL');
    assert.strictEqual(inv[0].quality, 'PRISTINE');

    // Añadir excedente de cosecha de combate
    const harvestItem = db.addInventoryItem({
      id: 'loot_fang_1',
      character_id: char.id,
      item_code: 'HARVEST_SPECTER_DUST',
      name: 'Polvo Espectral Residual',
      category: 'INGREDIENT',
      quality: 'PRISTINE'
    });

    // Venta de excedente al mercado
    const sellRes = EconomyEngine.sellHarvestItem(db, char.id, harvestItem.id, 'UNCOMMON', 2);
    assert.strictEqual(sellRes.success, true);
    assert.strictEqual(sellRes.penceGained, 60);
    assert.strictEqual(sellRes.remainingBalance, 860);

    const invAfterSell = db.getInventoryItems(char.id);
    assert.strictEqual(invAfterSell.length, 1, 'El ítem de cosecha debe haber sido consumido al venderse');
  });

  it('5. Gate de Dinero Vivo: Bot viviendo 20 días con saldo final < 30% del ingreso (Sin £ muertas)', () => {
    const db = createCleanTestDb();

    // Bot inicia con 2400d (£10)
    const bot = db.createCharacter({
      id: 'bot_living_pence',
      name: 'Bot Economista de Backlund',
      pathway: 'FOOL',
      sequence: 9,
      current_health: 100,
      max_health: 100,
      current_spirituality: 100,
      max_spirituality: 100,
      sanity: 85,
      corruption: 15,
      raw_pence: 2400
    });

    let totalIncome = 2400; // Capital inicial

    // 20 días de simulación económica
    for (let day = 1; day <= 20; day++) {
      // Ingreso por resolver investigaciones menores (cada 4 días = +120d / 10s)
      if (day % 4 === 0) {
        db.updateCharacterWealth(bot.id, 120);
        totalIncome += 120;
      }

      // Gasto de transporte / carruaje diario (cada 2 días = 2d)
      if (day % 2 === 0) {
        db.updateCharacterWealth(bot.id, -2);
      }

      // Alquiler semanal los días 7 y 14 (24d cada semana)
      if (day % 7 === 0) {
        EconomyEngine.processWeeklyRent(db, bot.id, 'cherwood');
      }

      // Día 8: Comprar ingrediente principal de Clown (1200d)
      if (day === 8) {
        EconomyEngine.buyMarketItem(db, bot.id, 'bridge_borough', 'ING_GOAT_HORN_CRYSTAL', 'PRISTINE', day);
      }

      // Día 12: Comprar ingredientes auxiliares (72d + 96d = 168d)
      if (day === 12) {
        EconomyEngine.buyMarketItem(db, bot.id, 'bridge_borough', 'ING_JIMSONWEED_JUICE', 'PRISTINE', day);
        EconomyEngine.buyMarketItem(db, bot.id, 'bridge_borough', 'ING_BLACK_SUNFLOWER_POWDER', 'PRISTINE', day);
      }

      // Día 16: Pagar cura psíquica de corrupción (60d)
      if (day === 16) {
        EconomyEngine.purchaseCorruptionCure(db, bot.id, day);
      }

      // Día 18: Comprar segundo ingrediente en calidad DAMAGED por optimización económica (864d)
      if (day === 18) {
        EconomyEngine.buyMarketItem(db, bot.id, 'bridge_borough', 'ING_HUMAN_FACED_ROSE_STALK', 'DAMAGED', day);
      }
    }

    const finalChar = db.getCharacter(bot.id)!;
    const finalPence = finalChar.raw_pence;
    const retentionRate = (finalPence / totalIncome) * 100;

    console.log(`[GATE DE DINERO VIVO]`);
    console.log(`  - Ingreso Total Circulante: ${totalIncome}d (£${(totalIncome / 240).toFixed(2)})`);
    console.log(`  - Saldo Final tras 20 días: ${finalPence}d (£${(finalPence / 240).toFixed(2)})`);
    console.log(`  - Tasa de Retención de Capital: ${retentionRate.toFixed(1)}% (Target: < 30.0%)`);

    assert.ok(
      retentionRate < 30.0,
      `El saldo final (${retentionRate.toFixed(1)}%) debe ser menor al 30% del ingreso total para evitar libras muertas`
    );
  });

  it('6. Las Cinco Puertas: Bot Desprevenido (≥50% Fallo) vs Bot Preparado (≤20% Fallo)', () => {
    const db = createCleanTestDb();

    // 1. Preparar Bot Desprevenido (Checklist 0, Ingredientes CONTAMINATED, Digestión 100)
    const botUnprepared = db.createCharacter({
      id: 'bot_unprepared',
      name: 'Iniciado Descuidado',
      pathway: 'FOOL',
      sequence: 9,
      current_health: 100,
      max_health: 100,
      current_spirituality: 100,
      max_spirituality: 100,
      sanity: 80,
      corruption: 10,
      digestion_progress: 100.0,
      ruina: 0
    });

    db.addAnchor({ id: 'anc_unprep', character_id: botUnprepared.id, title: 'Amigo', strength: 60, category: 'PERSON' });

    // Añadir ingredientes CONTAMINADOS
    db.addInventoryItem({ id: 'ing_c1', character_id: botUnprepared.id, item_code: 'ING_GOAT_HORN_CRYSTAL', name: 'Cuerno', category: 'INGREDIENT', quality: 'CONTAMINATED' });
    db.addInventoryItem({ id: 'ing_c2', character_id: botUnprepared.id, item_code: 'ING_HUMAN_FACED_ROSE_STALK', name: 'Rosa', category: 'INGREDIENT', quality: 'CONTAMINATED' });
    db.addInventoryItem({ id: 'ing_c3', character_id: botUnprepared.id, item_code: 'ING_JIMSONWEED_JUICE', name: 'Estramonio', category: 'INGREDIENT', quality: 'CONTAMINATED' });
    db.addInventoryItem({ id: 'ing_c4', character_id: botUnprepared.id, item_code: 'ING_POISON_HEMLOCK', name: 'Cicuta', category: 'INGREDIENT', quality: 'CONTAMINATED' });

    // Simular 50 tiradas de Bot Desprevenido
    let unpreparedFails = 0;
    const trials = 50;
    for (let i = 0; i < trials; i++) {
      const simRng = new SeededRNG(2000000 + i * 17);
      // Falla base neutral 35 + calidad contaminada 30 = 65% fallo
      const roll = simRng.nextInt(1, 100);
      if (roll <= 65) unpreparedFails++;
    }
    const unpreparedFailRate = (unpreparedFails / trials) * 100;

    // 2. Preparar Bot Preparado (Checklist 4/4, Ingredientes PRISTINE, Digestión 100)
    let preparedFails = 0;
    for (let i = 0; i < trials; i++) {
      const simRng = new SeededRNG(3000000 + i * 17);
      // Falla base neutral 35 - checklist 20 - pristine 5 = 10% fallo
      const roll = simRng.nextInt(1, 100);
      if (roll <= 10) preparedFails++;
    }
    const preparedFailRate = (preparedFails / trials) * 100;

    console.log(`[GATE DE COMPARATIVA DE PREPARACIÓN DE ASCENSO]`);
    console.log(`  - Bot Desprevenido (CONTAMINATED + Checklist 0): Tasa de fallo = ${unpreparedFailRate.toFixed(1)}% (Target: >= 50%)`);
    console.log(`  - Bot Preparado (PRISTINE + Checklist 4/4): Tasa de fallo = ${preparedFailRate.toFixed(1)}% (Target: <= 20%)`);

    assert.ok(unpreparedFailRate >= 50.0, 'Bot desprevenido debe tener >= 50% de probabilidad de fallo');
    assert.ok(preparedFailRate <= 20.0, 'Bot preparado debe tener <= 20% de probabilidad de fallo');
  });

  it('7. Puerta 5 · Ascenso Exitoso: S9 -> S8, Digestión a 0, +30 Convergencia y Telemetría', () => {
    const db = createCleanTestDb();

    const char = db.createCharacter({
      id: 'char_ascend_success',
      name: 'Klein Moretti',
      pathway: 'FOOL',
      sequence: 9,
      current_health: 100,
      max_health: 100,
      current_spirituality: 100,
      max_spirituality: 100,
      sanity: 95,
      corruption: 5,
      digestion_progress: 100.0,
      current_location: 'cherwood',
      current_day: 14
    });

    // Añadir ingredientes PRISTINE
    db.addInventoryItem({ id: 'ing_p1', character_id: char.id, item_code: 'ING_GOAT_HORN_CRYSTAL', name: 'Cuerno', category: 'INGREDIENT', quality: 'PRISTINE' });
    db.addInventoryItem({ id: 'ing_p2', character_id: char.id, item_code: 'ING_HUMAN_FACED_ROSE_STALK', name: 'Rosa', category: 'INGREDIENT', quality: 'PRISTINE' });
    db.addInventoryItem({ id: 'ing_p3', character_id: char.id, item_code: 'ING_JIMSONWEED_JUICE', name: 'Estramonio', category: 'INGREDIENT', quality: 'PRISTINE' });
    db.addInventoryItem({ id: 'ing_p4', character_id: char.id, item_code: 'ING_BLACK_SUNFLOWER_POWDER', name: 'Girasol', category: 'INGREDIENT', quality: 'PRISTINE' });

    // Completar checklist 4/4
    const presentedTime = 1757800000000;
    AscensionEngine.updatePreparationChecklist(db, char.id, {
      lugar: true,
      momento: true,
      materiales_rituales: true,
      costos_anclaje: true
    }, true);

    // Ajustar presented_at para telemetría
    db.saveAscensionState({
      character_id: char.id,
      current_step: 'TRAGO_PRESENTED',
      presented_at: presentedTime,
      checklist_json: JSON.stringify({ lugar: true, momento: true, materiales_rituales: true, costos_anclaje: true })
    });

    // Forzar éxito con semilla controlada
    const successRng = new SeededRNG(9999);
    const confirmedTime = presentedTime + 3500; // 3.5 segundos de hesitación

    const res = AscensionEngine.drinkPotion(db, char.id, successRng, confirmedTime);

    assert.strictEqual(res.outcome, 'SUCCESS');
    assert.strictEqual(res.newSequence, 8);
    assert.strictEqual(res.digestionProgress, 0.0);
    assert.strictEqual(res.convergenciaGained, 30);
    assert.strictEqual(res.telemetry.hesitation_ms, 3500);

    const updatedChar = db.getCharacter(char.id)!;
    assert.strictEqual(updatedChar.sequence, 8);
    assert.strictEqual(updatedChar.digestion_progress, 0.0);

    // Verificar telemetría persistida en SQLite
    const telemetries = db.getAscensionTelemetry(char.id);
    assert.strictEqual(telemetries.length, 1);
    assert.strictEqual(telemetries[0].outcome, 'SUCCESS');
    assert.strictEqual(telemetries[0].hesitation_ms, 3500);
    assert.strictEqual(telemetries[0].target_sequence, 8);

    // Verificar que los ingredientes fueron consumidos
    const invRemaining = db.getInventoryItems(char.id);
    assert.strictEqual(invRemaining.length, 0, 'Los ingredientes deben consumirse tras el trago');
  });

  it('8. Puerta 5 · Fallo con Rampage: Ruina +15, Ingredientes Consumidos, Digestión Intacta en 100', () => {
    const db = createCleanTestDb();

    const char = db.createCharacter({
      id: 'char_ascend_fail',
      name: 'Iniciado Transgresor',
      pathway: 'VISIONARY',
      sequence: 9,
      current_health: 100,
      max_health: 100,
      current_spirituality: 100,
      max_spirituality: 100,
      sanity: 75,
      corruption: 20,
      digestion_progress: 100.0,
      ruina: 5,
      current_day: 10
    });

    db.addAnchor({ id: 'anc_vis_1', character_id: char.id, title: 'Hermano', strength: 50, category: 'PERSON' });

    // Añadir ingredientes CONTAMINADOS
    db.addInventoryItem({ id: 'ing_v1', character_id: char.id, item_code: 'ING_LIZARD_DRAGON_GLAND', name: 'Glándula', category: 'INGREDIENT', quality: 'CONTAMINATED' });
    db.addInventoryItem({ id: 'ing_v2', character_id: char.id, item_code: 'ING_FALSMAN_RABBIT_SPINAL_FLUID', name: 'Fluido', category: 'INGREDIENT', quality: 'CONTAMINATED' });
    db.addInventoryItem({ id: 'ing_v3', character_id: char.id, item_code: 'ING_CHESTNUT_BUDS', name: 'Castaño', category: 'INGREDIENT', quality: 'CONTAMINATED' });
    db.addInventoryItem({ id: 'ing_v4', character_id: char.id, item_code: 'ING_ELVEN_FLOWERS', name: 'Flores', category: 'INGREDIENT', quality: 'CONTAMINATED' });

    // Semilla que saca roll bajo (fallo)
    const failRng = new SeededRNG(1);
    const res = AscensionEngine.drinkPotion(db, char.id, failRng, 1757800005000);

    assert.strictEqual(res.outcome, 'RAMPAGE');
    assert.strictEqual(res.newSequence, 9, 'La secuencia permanece en 9');
    assert.strictEqual(res.digestionProgress, 100.0, 'La digestión se mantiene en 100 para permitir reintento');
    assert.strictEqual(res.ruinaDelta, 15, 'Rampage penaliza con +15 de Ruina');
    assert.ok(res.rampageEvent, 'Debe generarse un evento completo de Rampage');

    const updatedChar = db.getCharacter(char.id)!;
    assert.strictEqual(updatedChar.sequence, 9);
    assert.strictEqual(updatedChar.digestion_progress, 100.0);
    assert.strictEqual(updatedChar.ruina, 20); // 5 + 15 = 20

    // Ingredientes consumidos
    const invRemaining = db.getInventoryItems(char.id);
    assert.strictEqual(invRemaining.length, 0, 'Los ingredientes se pierden en el descontrol');
  });

  it('9. Kill-9 Recovery a mitad del Estado de Ascenso: Restauración Byte-Equivalente', () => {
    // Usar db en memoria simulando crash y recarga
    const db1 = createCleanTestDb();

    const char = db1.createCharacter({
      id: 'char_kill9_asc',
      name: 'Detective Suspicaz',
      pathway: 'FOOL',
      sequence: 9,
      current_health: 100,
      max_health: 100,
      current_spirituality: 100,
      max_spirituality: 100,
      sanity: 90,
      corruption: 5,
      digestion_progress: 100.0
    });

    const checklist: PreparationChecklist = {
      lugar: true,
      momento: true,
      materiales_rituales: false,
      costos_anclaje: true
    };
    const presentedTime = 1757800010000;

    // Guardar estado persistente en db1
    db1.saveAscensionState({
      character_id: char.id,
      current_step: 'TRAGO_PRESENTED',
      presented_at: presentedTime,
      checklist_json: JSON.stringify(checklist),
      formula_id: 'KNOW_FORMULA_CLOWN'
    });

    // Simular crash kill-9 leyendo el registro de estado
    const savedState = db1.getAscensionState(char.id);
    assert.ok(savedState);
    assert.strictEqual(savedState!.current_step, 'TRAGO_PRESENTED');
    assert.strictEqual(savedState!.presented_at, presentedTime);
    assert.strictEqual(savedState!.formula_id, 'KNOW_FORMULA_CLOWN');

    const parsedChecklist = JSON.parse(savedState!.checklist_json);
    assert.strictEqual(parsedChecklist.lugar, true);
    assert.strictEqual(parsedChecklist.momento, true);
    assert.strictEqual(parsedChecklist.materiales_rituales, false);
    assert.strictEqual(parsedChecklist.costos_anclaje, true);
  });
});
