import { test } from 'node:test';
import * as assert from 'node:assert';
import { buildApp } from '../src/server/app.js';

test('Integration Test: Ciclo completo de Creación, Acting, Viaje y Somática en Fastify + SQLite', async () => {
  const { app, db } = await buildApp({ dbPath: ':memory:' });

  try {
    // 1. Health check
    const healthRes = await app.inject({
      method: 'GET',
      url: '/api/health'
    });
    assert.strictEqual(healthRes.statusCode, 200);
    const healthData = JSON.parse(healthRes.body);
    assert.strictEqual(healthData.status, 'ok');
    assert.strictEqual(healthData.canonicalPathwaysLoaded, 22);

    // 2. Creación de Personaje: Danitz (Hunter / RED_PRIEST)
    const newCharRes = await app.inject({
      method: 'POST',
      url: '/api/character/new',
      payload: {
        name: 'Danitz',
        pathway: 'HUNTER',
        startingCity: 'Bayam - Muelles Coloniales',
        background: 'Cazador de Piratas',
        socialClass: 'WORKING_CLASS'
      }
    });

    assert.strictEqual(newCharRes.statusCode, 201);
    const newCharData = JSON.parse(newCharRes.body);
    assert.strictEqual(newCharData.character.name, 'Danitz');
    assert.strictEqual(newCharData.character.pathway, 'RED_PRIEST');
    assert.strictEqual(newCharData.character.sequence, 9);
    assert.strictEqual(newCharData.sequenceName, 'Hunter');
    assert.strictEqual(newCharData.wallet.pounds, 30);
    assert.strictEqual(newCharData.activePersona.profession, 'Cazador de Piratas');

    const charId = newCharData.character.id;

    // 3. Obtener Dilema de Actuación Canónico
    const dilemmaRes = await app.inject({
      method: 'GET',
      url: `/api/acting/dilemma/${charId}`
    });

    assert.strictEqual(dilemmaRes.statusCode, 200);
    const dilemmaData = JSON.parse(dilemmaRes.body);
    assert.strictEqual(dilemmaData.dilemma.pathway, 'RED_PRIEST');
    assert.strictEqual(dilemmaData.dilemma.sequenceName, 'Hunter');
    assert.ok(dilemmaData.dilemma.choices.length >= 2);

    // 4. Resolver Dilema con Elección Alineada
    const resolveRes = await app.inject({
      method: 'POST',
      url: '/api/acting/resolve',
      payload: {
        characterId: charId,
        dilemmaId: dilemmaData.dilemma.id,
        choiceId: 'CHOICE_HUNTER_9_TRACK'
      }
    });

    assert.strictEqual(resolveRes.statusCode, 200);
    const resolveData = JSON.parse(resolveRes.body);
    assert.strictEqual(resolveData.isAligned, true);
    assert.strictEqual(resolveData.digestionProgress, 10.0); // No cambia hasta el tick semanal
    assert.strictEqual(resolveData.penceRewarded, 240); // +£1 libra

    // 4b. Tick Semanal: ÚNICO escritor de la digestión
    const tickRes = await app.inject({
      method: 'POST',
      url: '/api/acting/weekly-tick',
      payload: { characterId: charId }
    });
    assert.strictEqual(tickRes.statusCode, 200);
    const tickData = JSON.parse(tickRes.body);
    assert.strictEqual(tickData.success, true);
    assert.ok(tickData.tickResult.assimilationGain > 0);

    // 5. Viajar a otro distrito
    const travelRes = await app.inject({
      method: 'POST',
      url: '/api/city/travel',
      payload: {
        characterId: charId,
        destinationDistrict: 'Backlund - Distrito de Cherwood'
      }
    });

    assert.strictEqual(travelRes.statusCode, 200);
    const travelData = JSON.parse(travelRes.body);
    assert.strictEqual(travelData.newLocation, 'Backlund - Distrito de Cherwood');

    // 6. Consultar estado final del personaje
    const charRes = await app.inject({
      method: 'GET',
      url: `/api/character/${charId}`
    });

    assert.strictEqual(charRes.statusCode, 200);
    const finalData = JSON.parse(charRes.body);
    assert.strictEqual(finalData.character.current_location, 'Backlund - Distrito de Cherwood');
    assert.strictEqual(finalData.wallet.pounds, 30); // 7200 + 240 - 24 (viaje) - 24 (alquiler semanal) = 7392 -> £30 16s
    assert.strictEqual(finalData.wallet.soli, 16);
    assert.strictEqual(finalData.somatics.sanityTier, 'LUCID');
    assert.ok(finalData.character.digestion_progress > 10.0);
    assert.strictEqual(finalData.inventoryCount, 2);

  } finally {
    db.close();
    await app.close();
  }
});
