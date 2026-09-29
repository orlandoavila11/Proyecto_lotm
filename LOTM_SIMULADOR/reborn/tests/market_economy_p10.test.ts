/**
 * SUITE DE PRUEBAS — PROMPT P10: MERCADO, PRECIOS Y COMPRA TRANSACCIONAL
 * Valida:
 * 1. Catálogo autoritativo distrital y rechazo honesto de distritos sin mercado.
 * 2. Compra exitosa con deducción exacta en peniques, inventario con calidad y registro de transacción.
 * 3. Rechazo de fondos insuficientes sin mutación residual.
 * 4. Idempotencia estricta por commandId (recibo previo sin cobro duplicado).
 * 5. Detección y rechazo de conflicto de revisión (RevisionConflictError).
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseClient } from '../src/infra/database/DatabaseClient.js';
import { EconomyEngine } from '../src/core/economy/EconomyEngine.js';
import { CommandProcessor } from '../src/infra/database/CommandProcessor.js';
import { RevisionConflictError, DomainRuleViolationError } from '../src/core/errors/DomainError.js';

describe('PROMPT P10: Economía y Transacciones Autoritativas de Mercado', () => {
  it('1. Catálogo autoritativo distrital y rechazo honesto de distritos inexistentes', () => {
    // Distritos canónicos conocidos
    const cherwood = EconomyEngine.getDistrictMarket('DIST_CHERWOOD');
    assert.ok(cherwood, 'El mercado de Cherwood debe existir');
    assert.strictEqual(cherwood.districtId, 'cherwood');
    assert.ok(cherwood.inventory.length > 0, 'Cherwood debe tener inventario');

    const bridge = EconomyEngine.getDistrictMarket('DIST_BRIDGE');
    assert.ok(bridge, 'El mercado de Bridge debe existir');
    assert.strictEqual(bridge.districtId, 'bridge_borough');
    assert.strictEqual(bridge.specialtyPathway, 'FOOL');

    const north = EconomyEngine.getDistrictMarket('DIST_NORTH');
    assert.ok(north, 'El mercado de North debe existir');
    assert.strictEqual(north.districtId, 'backlund_north');
    assert.strictEqual(north.specialtyPathway, 'VISIONARY');

    // Distrito sin mercado o inexistente sin fallback permisivo
    const unknownMarket = EconomyEngine.getDistrictMarket('DIST_INVALID_GHOST_BOROUGH');
    assert.strictEqual(unknownMarket, null, 'Un distrito sin mercado debe retornar null honesto');
  });

  it('2. Compra normal exitosa con deducción autoritativa de peniques e inventario con calidad', () => {
    const db = new DatabaseClient(':memory:');
    const charId = 'char_p10_buyer';

    db.createCharacter({
      id: charId,
      name: 'Comprador Alquímico',
      pathway: 'FOOL',
      sequence: 9,
      current_health: 100,
      max_health: 100,
      current_spirituality: 100,
      max_spirituality: 100,
      sanity: 100,
      corruption: 0,
      digestion_progress: 0,
      raw_pence: 2400, // 10 libras (£10)
      current_location: 'DIST_BRIDGE',
      current_day: 3
    });

    const initialChar = db.getCharacter(charId)!;
    assert.strictEqual(initialChar.raw_pence, 2400);

    // Comprar jugo de estramonio purificado (Base: 72d, Calidad: PRISTINE -> Multiplicador 1.0 -> 72d)
    const result = EconomyEngine.buyMarketItem(db, charId, 'DIST_BRIDGE', 'ING_JIMSONWEED_JUICE', 'PRISTINE', 3);
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.penceSpent, 72);
    assert.strictEqual(result.remainingBalance, 2400 - 72);

    // Verificar en SQLite que el dinero disminuyó
    const updatedChar = db.getCharacter(charId)!;
    assert.strictEqual(updatedChar.raw_pence, 2328);

    // Verificar inventario en SQLite
    const inv = db.getInventory(charId);
    assert.strictEqual(inv.length, 1);
    assert.strictEqual(inv[0].item_code, 'ING_JIMSONWEED_JUICE');
    assert.strictEqual(inv[0].quality, 'PRISTINE');
    assert.strictEqual(inv[0].quantity, 1);
  });

  it('3. Calidad DAMAGED aplica multiplicador 0.6x de forma autoritativa', () => {
    const db = new DatabaseClient(':memory:');
    const charId = 'char_p10_damaged';

    db.createCharacter({
      id: charId,
      name: 'Comprador de Ocasión',
      pathway: 'FOOL',
      sequence: 9,
      current_health: 100,
      max_health: 100,
      current_spirituality: 100,
      max_spirituality: 100,
      sanity: 100,
      corruption: 0,
      digestion_progress: 0,
      raw_pence: 1000,
      current_location: 'DIST_BRIDGE',
      current_day: 1
    });

    // ING_JIMSONWEED_JUICE base 72d * 0.6 = 43.2 -> 43d
    const result = EconomyEngine.buyMarketItem(db, charId, 'DIST_BRIDGE', 'ING_JIMSONWEED_JUICE', 'DAMAGED', 1);
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.penceSpent, 43);
    assert.strictEqual(result.remainingBalance, 1000 - 43);
  });

  it('4. Fondos insuficientes es rechazado sin mutación de saldo ni inventario', () => {
    const db = new DatabaseClient(':memory:');
    const charId = 'char_p10_poor';

    db.createCharacter({
      id: charId,
      name: 'Mendigo de Cherwood',
      pathway: 'FOOL',
      sequence: 9,
      current_health: 100,
      max_health: 100,
      current_spirituality: 100,
      max_spirituality: 100,
      sanity: 100,
      corruption: 0,
      digestion_progress: 0,
      raw_pence: 10, // Solo 10 peniques
      current_location: 'DIST_CHERWOOD',
      current_day: 1
    });

    // Intentar comprar ítem de 72d con 10d
    const result = EconomyEngine.buyMarketItem(db, charId, 'DIST_CHERWOOD', 'ING_JIMSONWEED_JUICE', 'PRISTINE', 1);
    assert.strictEqual(result.success, false);
    assert.match(result.error!, /Fondos insuficientes/);

    // Saldo e inventario inalterados
    const char = db.getCharacter(charId)!;
    assert.strictEqual(char.raw_pence, 10);
    const inv = db.getInventory(charId);
    assert.strictEqual(inv.length, 0);
  });

  it('5. Idempotencia y recuperación de recibo ante doble clic (mismo commandId)', () => {
    const db = new DatabaseClient(':memory:');
    const charId = 'char_p10_idempotent';

    db.createCharacter({
      id: charId,
      name: 'Cliente Cauteloso',
      pathway: 'FOOL',
      sequence: 9,
      current_health: 100,
      max_health: 100,
      current_spirituality: 100,
      max_spirituality: 100,
      sanity: 100,
      corruption: 0,
      digestion_progress: 0,
      raw_pence: 1000,
      current_location: 'DIST_CHERWOOD',
      current_day: 1
    });

    const commandId = 'cmd_buy_unique_test_12345';
    const payload = { districtId: 'DIST_CHERWOOD', itemCode: 'ING_JIMSONWEED_JUICE', quality: 'PRISTINE' };

    // Primera ejecución
    const firstExec = CommandProcessor.execute(
      db,
      {
        commandId,
        characterId: charId,
        commandType: 'ECONOMY_BUY',
        payload
      },
      () => EconomyEngine.buyMarketItem(db, charId, 'DIST_CHERWOOD', 'ING_JIMSONWEED_JUICE', 'PRISTINE', 1)
    );

    assert.strictEqual(firstExec.fromReceipt, false);
    assert.strictEqual(firstExec.response.success, true);
    assert.strictEqual(firstExec.response.penceSpent, 72);
    assert.strictEqual(firstExec.response.remainingBalance, 928);

    // Segunda ejecución con exactamente el mismo commandId (simula doble clic o reintento de red)
    const secondExec = CommandProcessor.execute(
      db,
      {
        commandId,
        characterId: charId,
        commandType: 'ECONOMY_BUY',
        payload
      },
      () => EconomyEngine.buyMarketItem(db, charId, 'DIST_CHERWOOD', 'ING_JIMSONWEED_JUICE', 'PRISTINE', 1)
    );

    assert.strictEqual(secondExec.fromReceipt, true, 'Debe devolver el recibo persistido');
    assert.strictEqual(secondExec.response.success, true);
    assert.strictEqual(secondExec.response.penceSpent, 72);

    // Invariante de oro: El personaje NO pagó dos veces y NO tiene 2 ítems
    const char = db.getCharacter(charId)!;
    assert.strictEqual(char.raw_pence, 928, 'El saldo solo debe haberse debitado una sola vez');
    const inv = db.getInventory(charId);
    assert.strictEqual(inv.length, 1);
    assert.strictEqual(inv[0].quantity, 1);
  });

  it('6. Conflicto de revisión rechaza la transacción si el estado fue alterado concurrentemente', () => {
    const db = new DatabaseClient(':memory:');
    const charId = 'char_p10_conflict';

    db.createCharacter({
      id: charId,
      name: 'Cliente Desincronizado',
      pathway: 'FOOL',
      sequence: 9,
      current_health: 100,
      max_health: 100,
      current_spirituality: 100,
      max_spirituality: 100,
      sanity: 100,
      corruption: 0,
      digestion_progress: 0,
      raw_pence: 1000,
      current_location: 'DIST_CHERWOOD',
      current_day: 1
    });

    // Forzar avance de revisión en la base de datos (p.ej. otra acción ocurrió entretanto)
    db.incrementCharacterRevision(charId);
    db.incrementCharacterRevision(charId); // revisión ahora es 3

    assert.throws(
      () => {
        CommandProcessor.execute(
          db,
          {
            commandId: 'cmd_buy_conflict_test',
            characterId: charId,
            commandType: 'ECONOMY_BUY',
            payload: { districtId: 'DIST_CHERWOOD', itemCode: 'ING_JIMSONWEED_JUICE', quality: 'PRISTINE' },
            expectedRevision: 1 // el cliente creía estar en revisión 1
          },
          () => EconomyEngine.buyMarketItem(db, charId, 'DIST_CHERWOOD', 'ING_JIMSONWEED_JUICE', 'PRISTINE', 1)
        );
      },
      RevisionConflictError,
      'Debe lanzar RevisionConflictError cuando expectedRevision no coincide'
    );
  });
});
