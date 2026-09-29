import { test } from 'node:test';
import * as assert from 'node:assert';
import { buildApp } from '../src/server/app.js';

/**
 * Ciclo completo por la API: prólogo → dilema de actuación → una semana de calendario (el tick semanal lo dispara
 * el calendario, una sola vez) → viaje en carruaje.
 */
test('Integración: prólogo, actuación, semana de calendario con un único cobro de alquiler y viaje', async () => {
  const { app, db } = await buildApp({ dbPath: ':memory:' });
  const post = (url: string, payload: unknown) => app.inject({ method: 'POST', url, payload: payload as any });
  const get = (url: string) => app.inject({ method: 'GET', url });

  try {
    const health = JSON.parse((await get('/api/health')).body);
    assert.strictEqual(health.status, 'ok');

    // 1. El personaje nace sólo por el prólogo
    const start = JSON.parse((await post('/api/prologue/start', { originId: 'ORIGIN_CLERK', name: 'Ernest Holloway' })).body);
    const characterId = start.characterId;
    await post('/api/prologue/tutorial/dilemma', { characterId, choice: 'PRUDENCE' });
    const drink = await post('/api/prologue/drink', { characterId, potionChoice: 'AMBER_MIRROR' });
    assert.strictEqual(drink.statusCode, 200);
    assert.strictEqual((await post('/api/character/new', { name: 'Otro', pathway: 'HUNTER' })).statusCode, 404, 'no hay atajo de creación');

    // 2. Dilema público (sin solución) y resolución
    const dilemma = JSON.parse((await get(`/api/acting/dilemma/${characterId}?public=1`)).body).dilemma;
    assert.ok(dilemma.choices.length >= 2, JSON.stringify(dilemma).slice(0, 400));
    const resolved = await post('/api/acting/resolve', { characterId, dilemmaId: dilemma.id, choiceId: dilemma.choices[0].id });
    assert.strictEqual(resolved.statusCode, 200);
    const digestionBefore = db.getCharacter(characterId)!.digestion_progress;

    // 3. No hay tick semanal a petición del cliente
    assert.strictEqual((await post('/api/acting/weekly-tick', { characterId })).statusCode, 404);

    // 4. Una semana de franjas (4 por día × 7 días): el calendario dispara el tick al empezar el día 8
    const penceBefore = db.getCharacter(characterId)!.raw_pence;
    let ticks = 0;
    for (let i = 0; i < 28; i++) {
      const r = await post('/api/calendar/action', { characterId, actionType: 'SOCIALIZE' });
      assert.strictEqual(r.statusCode, 200, r.body);
      if (JSON.parse(r.body).weeklyTickExecuted) ticks++;
    }
    const after = db.getCharacter(characterId)!;
    assert.strictEqual(after.current_day, 8);
    assert.strictEqual(ticks, 1, 'un único tick semanal');
    const rentLogs = db.getCalendarLogs(characterId, 200).filter((l: any) => l.subsystem === 'rent');
    assert.strictEqual(rentLogs.length, 1, 'el alquiler se cobra una sola vez por semana');
    assert.ok(after.digestion_progress >= digestionBefore, 'la digestión sólo la escribe el tick');
    assert.notStrictEqual(after.raw_pence, penceBefore, 'la semana mueve el dinero (alquiler y salario)');

    // 5.a Destinos de carruaje: sólo distritos de Backlund (Bayam está al otro lado del mar)
    const districts = JSON.parse((await get('/api/city/districts')).body).districts.map((d: any) => d.id);
    assert.ok(!districts.includes('DIST_BAYAM'), 'Bayam no es un distrito de Backlund');
    assert.ok(districts.includes('DIST_NORTH'), 'el Distrito Norte es alcanzable (su mercado tiene los ingredientes del Espectador)');
    assert.strictEqual((await post('/api/city/travel', { characterId, destinationDistrict: 'DIST_BAYAM' })).statusCode, 422);

    // 5. Viaje: la ubicación guardada es el id del distrito, no el texto del cliente
    const travel = await post('/api/city/travel', { characterId, destinationDistrict: 'el este de la ciudad' });
    assert.strictEqual(travel.statusCode, 200, travel.body);
    assert.strictEqual(db.getCharacter(characterId)!.current_location, 'DIST_EAST_BOROUGH');

    const snap = JSON.parse((await get(`/api/character/${characterId}`)).body);
    assert.strictEqual(snap.character.current_location, 'DIST_EAST_BOROUGH');
  } finally {
    db.close();
    await app.close();
  }
});
