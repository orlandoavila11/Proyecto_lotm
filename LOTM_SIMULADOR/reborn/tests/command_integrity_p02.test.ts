import { describe, it } from 'node:test';
import assert from 'node:assert';
import { buildApp } from '../src/server/app.js';

describe('P02: Integridad de Comandos, Idempotencia y Concurrencia Transaccional', () => {

  it('1. Compra en mercado: doble clic con mismo commandId deduce peniques una sola vez (idempotencia)', async () => {
    const { app, db } = await buildApp({ dbPath: ':memory:' });
    try {
      // Crear personaje con 7200 peniques (600 chelines)
      const char = db.createCharacter({
        id: 'char_p02_buyer',
        name: 'Avery Blackwood',
        pathway: 'FOOL',
        sequence: 9,
        current_health: 100,
        max_health: 100,
        current_spirituality: 100,
        max_spirituality: 100,
        sanity: 100,
        corruption: 0,
        digestion_progress: 0,
        raw_pence: 7200,
        current_location: 'DIST_CHERWOOD',
        current_day: 1
      });

      const initialPence = char.raw_pence;
      const initialRev = char.revision ?? 1;

      // Primer clic de compra
      const commandId = 'cmd_buy_herb_001';
      const buyPayload = {
        characterId: char.id,
        districtId: 'bridge_borough',
        itemCode: 'ING_GOAT_HORN_CRYSTAL',
        quality: 'PRISTINE',
        commandId,
        expectedRevision: initialRev
      };

      const res1 = await app.inject({
        method: 'POST',
        url: '/api/economy/buy',
        payload: buyPayload
      });

      assert.strictEqual(res1.statusCode, 200);
      const data1 = JSON.parse(res1.body);
      assert.strictEqual(data1.success, true);
      assert.strictEqual(data1.fromReceipt, false);
      const spentPence = data1.penceSpent;
      assert.ok(spentPence > 0, 'Debe haber costado peniques');

      const charAfterFirst = db.getCharacter(char.id)!;
      assert.strictEqual(charAfterFirst.raw_pence, initialPence - spentPence);
      assert.strictEqual(charAfterFirst.revision, initialRev + 1);

      const items1 = db.getInventory(char.id);
      const flowerCount1 = items1.filter(i => i.item_code === 'ING_GOAT_HORN_CRYSTAL').length;
      assert.strictEqual(flowerCount1, 1);

      // Segundo clic idéntico (simulando reintento por pérdida de respuesta o doble pulsación)
      const res2 = await app.inject({
        method: 'POST',
        url: '/api/economy/buy',
        payload: buyPayload
      });

      assert.strictEqual(res2.statusCode, 200);
      const data2 = JSON.parse(res2.body);
      assert.strictEqual(data2.success, true);
      assert.strictEqual(data2.fromReceipt, true, 'Debe resolverse desde el recibo transaccional previo');

      // INVARIANTE CRÍTICA: Los peniques y el inventario no deben duplicarse
      const charAfterSecond = db.getCharacter(char.id)!;
      assert.strictEqual(charAfterSecond.raw_pence, initialPence - spentPence, 'El dinero no se cobró dos veces');
      assert.strictEqual(charAfterSecond.revision, initialRev + 1, 'La revisión no avanzó doblemente');

      const items2 = db.getInventory(char.id);
      const flowerCount2 = items2.filter(i => i.item_code === 'ING_GOAT_HORN_CRYSTAL').length;
      assert.strictEqual(flowerCount2, 1, 'No se otorgaron ítems duplicados');
    } finally {
      db.close();
      await app.close();
    }
  });

  it('2. Conflicto de payload: mismo commandId con parámetros distintos produce HTTP 409', async () => {
    const { app, db } = await buildApp({ dbPath: ':memory:' });
    try {
      const char = db.createCharacter({
        id: 'char_p02_conflict',
        name: 'Leonard Mitchell',
        pathway: 'FOOL',
        sequence: 9,
        current_health: 100,
        max_health: 100,
        current_spirituality: 100,
        max_spirituality: 100,
        sanity: 100,
        corruption: 0,
        digestion_progress: 0,
        raw_pence: 5000,
        current_location: 'DIST_CHERWOOD',
        current_day: 1
      });

      const commandId = 'cmd_fixed_identity_123';

      // Primera llamada: comprar cuerno
      const res1 = await app.inject({
        method: 'POST',
        url: '/api/economy/buy',
        payload: {
          characterId: char.id,
          districtId: 'bridge_borough',
          itemCode: 'ING_GOAT_HORN_CRYSTAL',
          quality: 'PRISTINE',
          commandId
        }
      });
      assert.strictEqual(res1.statusCode, 200);

      // Segunda llamada: intentar usar el mismo commandId para un ítem diferente
      const res2 = await app.inject({
        method: 'POST',
        url: '/api/economy/buy',
        payload: {
          characterId: char.id,
          districtId: 'bridge_borough',
          itemCode: 'ING_HUMAN_FACED_ROSE_STALK', // Ítem diferente
          quality: 'PRISTINE',
          commandId
        }
      });

      assert.strictEqual(res2.statusCode, 409, 'Debe devolver HTTP 409 Conflict');
      const err = JSON.parse(res2.body);
      assert.strictEqual(err.code, 'COMMAND_CONFLICT');
    } finally {
      db.close();
      await app.close();
    }
  });

  it('3. Concurrencia optimista: comando con expectedRevision desactualizada produce HTTP 409', async () => {
    const { app, db } = await buildApp({ dbPath: ':memory:' });
    try {
      const char = db.createCharacter({
        id: 'char_p02_concurrency',
        name: 'Audrey Hall',
        pathway: 'VISIONARY',
        sequence: 9,
        current_health: 100,
        max_health: 100,
        current_spirituality: 100,
        max_spirituality: 100,
        sanity: 100,
        corruption: 0,
        digestion_progress: 0,
        raw_pence: 5000,
        current_location: 'DIST_CHERWOOD',
        current_day: 1
      });

      // El personaje empieza en revisión 1
      assert.strictEqual(char.revision ?? 1, 1);

      // Ejecutar un viaje exitoso que avanza la revisión a 2
      const res1 = await app.inject({
        method: 'POST',
        url: '/api/city/travel',
        payload: {
          characterId: char.id,
          destinationDistrict: 'DIST_BRIDGE',
          commandId: 'cmd_travel_audrey_1',
          expectedRevision: 1
        }
      });
      assert.strictEqual(res1.statusCode, 200);

      // Ahora el personaje está en revisión 2
      const charUpdated = db.getCharacter(char.id)!;
      assert.strictEqual(charUpdated.revision, 2);

      // Un segundo comando llega con expectedRevision: 1 (cliente desfasado / carrera)
      const res2 = await app.inject({
        method: 'POST',
        url: '/api/city/travel',
        payload: {
          characterId: char.id,
          destinationDistrict: 'DIST_EAST_BOROUGH',
          commandId: 'cmd_travel_stale',
          expectedRevision: 1 // Desactualizado
        }
      });

      assert.strictEqual(res2.statusCode, 409);
      const err = JSON.parse(res2.body);
      assert.strictEqual(err.code, 'REVISION_CONFLICT');
    } finally {
      db.close();
      await app.close();
    }
  });

  it('4. Viaje en carruaje: idempotencia evita doble cobro de 24 peniques', async () => {
    const { app, db } = await buildApp({ dbPath: ':memory:' });
    try {
      const char = db.createCharacter({
        id: 'char_p02_traveler',
        name: 'Fors Wall',
        pathway: 'FOOL',
        sequence: 9,
        current_health: 100,
        max_health: 100,
        current_spirituality: 100,
        max_spirituality: 100,
        sanity: 100,
        corruption: 0,
        digestion_progress: 0,
        raw_pence: 100,
        current_location: 'DIST_CHERWOOD',
        current_day: 1
      });

      const initialPence = char.raw_pence;
      const cmdId = 'cmd_travel_fors_bridge';

      const res1 = await app.inject({
        method: 'POST',
        url: '/api/city/travel',
        payload: {
          characterId: char.id,
          destinationDistrict: 'DIST_BRIDGE',
          commandId: cmdId
        }
      });
      assert.strictEqual(res1.statusCode, 200);
      assert.strictEqual(db.getCharacter(char.id)!.raw_pence, initialPence - 24);

      // Reintento con mismo commandId
      const res2 = await app.inject({
        method: 'POST',
        url: '/api/city/travel',
        payload: {
          characterId: char.id,
          destinationDistrict: 'DIST_BRIDGE',
          commandId: cmdId
        }
      });
      assert.strictEqual(res2.statusCode, 200);
      const data2 = JSON.parse(res2.body);
      assert.strictEqual(data2.fromReceipt, true);

      // Invariante: No cobrado dos veces
      assert.strictEqual(db.getCharacter(char.id)!.raw_pence, initialPence - 24);
    } finally {
      db.close();
      await app.close();
    }
  });

  it('5. Combate: no cancela batalla activa al reanudar y deduplica acciones tácticas', async () => {
    const { app, db } = await buildApp({ dbPath: ':memory:' });
    try {
      const char = db.createCharacter({
        id: 'char_p02_combatant',
        name: 'Derrick Berg',
        pathway: 'FOOL',
        sequence: 9,
        current_health: 100,
        max_health: 100,
        current_spirituality: 100,
        max_spirituality: 100,
        sanity: 100,
        corruption: 0,
        digestion_progress: 0,
        raw_pence: 500,
        current_location: 'DIST_CHERWOOD',
        current_day: 1
      });

      // Iniciar combate
      const resStart = await app.inject({
        method: 'POST',
        url: '/api/combat/start',
        payload: {
          characterId: char.id,
          enemyName: 'Espectro de Minsk Street',
          commandId: 'cmd_start_fight_1'
        }
      });
      assert.strictEqual(resStart.statusCode, 200);
      const battleId = JSON.parse(resStart.body).battleId;

      // Re-entrar a /start sin forceNew debe reanudar la batalla existente sin cerrarla como FLED
      const resResume = await app.inject({
        method: 'POST',
        url: '/api/combat/start',
        payload: {
          characterId: char.id
        }
      });
      assert.strictEqual(resResume.statusCode, 200);
      const resumeData = JSON.parse(resResume.body);
      assert.strictEqual(resumeData.battleId, battleId);
      assert.strictEqual(resumeData.resumed, true);

      const activeBattle = db.getActiveBattle(char.id);
      assert.ok(activeBattle, 'La batalla sigue activa');
      assert.strictEqual(activeBattle.status, 'ONGOING');

      // Ejecutar acción de movimiento con commandId
      const resAction1 = await app.inject({
        method: 'POST',
        url: '/api/combat/action',
        payload: {
          characterId: char.id,
          actionType: 'MOVE',
          targetPosition: { x: 1, y: 2 },
          commandId: 'cmd_combat_move_1'
        }
      });
      assert.strictEqual(resAction1.statusCode, 200);
      const actionData1 = JSON.parse(resAction1.body);
      assert.strictEqual(actionData1.fromReceipt, false);

      // Reintentar la misma acción con mismo commandId (doble clic)
      const resAction2 = await app.inject({
        method: 'POST',
        url: '/api/combat/action',
        payload: {
          characterId: char.id,
          actionType: 'MOVE',
          targetPosition: { x: 1, y: 2 },
          commandId: 'cmd_combat_move_1'
        }
      });
      assert.strictEqual(resAction2.statusCode, 200);
      const actionData2 = JSON.parse(resAction2.body);
      assert.strictEqual(actionData2.fromReceipt, true);
    } finally {
      db.close();
      await app.close();
    }
  });

  it('6. Consulta de recibo: GET /api/commands/receipt/:commandId recupera el resultado exacto', async () => {
    const { app, db } = await buildApp({ dbPath: ':memory:' });
    try {
      const char = db.createCharacter({
        id: 'char_p02_query',
        name: 'Alger Wilson',
        pathway: 'FOOL',
        sequence: 9,
        current_health: 100,
        max_health: 100,
        current_spirituality: 100,
        max_spirituality: 100,
        sanity: 100,
        corruption: 0,
        digestion_progress: 0,
        raw_pence: 2000,
        current_location: 'DIST_CHERWOOD',
        current_day: 1
      });

      const cmdId = 'cmd_receipt_query_test_01';

      // Ejecutar compra
      const buyRes = await app.inject({
        method: 'POST',
        url: '/api/economy/buy',
        payload: {
          characterId: char.id,
          districtId: 'bridge_borough',
          itemCode: 'ING_GOAT_HORN_CRYSTAL',
          quality: 'PRISTINE',
          commandId: cmdId
        }
      });
      assert.strictEqual(buyRes.statusCode, 200);

      // Consultar el recibo a través de la API
      const resReceipt = await app.inject({
        method: 'GET',
        url: `/api/commands/receipt/${cmdId}`
      });

      assert.strictEqual(resReceipt.statusCode, 200);
      const receipt = JSON.parse(resReceipt.body);
      assert.strictEqual(receipt.commandId, cmdId);
      assert.strictEqual(receipt.characterId, char.id);
      assert.strictEqual(receipt.commandType, 'ECONOMY_BUY');
      assert.strictEqual(receipt.response.success, true);
      assert.ok(receipt.revision >= 1);

      // Consultar un recibo inexistente debe dar 404
      const resNotFound = await app.inject({
        method: 'GET',
        url: '/api/commands/receipt/cmd_non_existent'
      });
      assert.strictEqual(resNotFound.statusCode, 404);
      assert.strictEqual(JSON.parse(resNotFound.body).code, 'ENTITY_NOT_FOUND');
    } finally {
      db.close();
      await app.close();
    }
  });

});
