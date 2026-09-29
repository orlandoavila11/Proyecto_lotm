import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import { buildApp } from '../src/server/app.js';

/**
 * Correcciones de integración detectadas al construir el cliente ui3d:
 *  1. /api/character/:id responde durante el prólogo (vía UNAWAKENED)
 *  2. /api/prologue/status devuelve la carta del Benefactor mientras el prólogo sigue abierto
 *  3. combate: END_TURN, restauración de PA tras el turno enemigo y alcance de movimiento canónico
 *  4. las respuestas de acción no filtran habilidades no reveladas del adversario
 *  5. la tarifa del carruaje procede del balance y se publica en /api/city/districts
 *  6. /api/combat/active?probe=1 responde "sin combate" sin error (el contrato sin probe sigue en 404)
 *  7. consultar el caso activo tras resolverlo devuelve el caso cerrado, no una partida nueva del mismo caso
 *  8. /api/acting/dilemma?public=1 no revela qué opción es la alineada ni sus efectos
 */

async function newAwakenedCharacter(app: Awaited<ReturnType<typeof buildApp>>['app']) {
  const start = await app.inject({ method: 'POST', url: '/api/prologue/start', payload: { originId: 'ORIGIN_PRIVATE_INVESTIGATOR', name: 'Tester' } });
  const { characterId } = JSON.parse(start.body);
  return { characterId, start: JSON.parse(start.body) };
}

describe('ui3d · correcciones de integración del motor', () => {
  it('1-2. el personaje es consultable en el prólogo y la carta se puede releer', async () => {
    const { app, db } = await buildApp({ dbPath: ':memory:' });
    try {
      const { characterId, start } = await newAwakenedCharacter(app);

      const snap = await app.inject({ method: 'GET', url: `/api/character/${characterId}` });
      assert.strictEqual(snap.statusCode, 200, 'la proyección del personaje no debe fallar sin vía');
      assert.strictEqual(JSON.parse(snap.body).sequenceName, null);

      const status = JSON.parse((await app.inject({ method: 'GET', url: `/api/prologue/status/${characterId}` })).body);
      assert.strictEqual(status.prologueStep, 'BENEFACTOR_LETTER');
      assert.strictEqual(status.benefactorLetterText, start.benefactorLetterText, 'la carta reconstruida es idéntica a la entregada');

      await app.inject({ method: 'POST', url: '/api/prologue/tutorial/dilemma', payload: { characterId, choice: 'PRUDENCE' } });
      await app.inject({ method: 'POST', url: '/api/prologue/drink', payload: { characterId, potionChoice: 'COBALT_EYES' } });
      const after = JSON.parse((await app.inject({ method: 'GET', url: `/api/prologue/status/${characterId}` })).body);
      assert.strictEqual(after.prologueStep, 'COMPLETED');
      assert.strictEqual(after.benefactorLetterText, null);
    } finally {
      db.close();
      await app.close();
    }
  });

  it('3-4. combate: alcance, fin de turno, PA y proyección del adversario', async () => {
    const { app, db } = await buildApp({ dbPath: ':memory:' });
    try {
      const { characterId } = await newAwakenedCharacter(app);
      await app.inject({ method: 'POST', url: '/api/prologue/tutorial/dilemma', payload: { characterId, choice: 'PRUDENCE' } });
      await app.inject({ method: 'POST', url: '/api/prologue/drink', payload: { characterId, potionChoice: 'COBALT_EYES' } });

      const started = await app.inject({ method: 'POST', url: '/api/combat/start', payload: { characterId, ambushMode: 'NEUTRAL' } });
      assert.strictEqual(started.statusCode, 200);
      const battle = JSON.parse(started.body);
      assert.deepStrictEqual(battle.player.position, { x: 0, y: 2 });
      if (battle.initiativeWinner === 'ENEMY') assert.ok(battle.messages.length >= 2, 'si el adversario gana la iniciativa, golpea primero');

      const tooFar = await app.inject({ method: 'POST', url: '/api/combat/action', payload: { characterId, actionType: 'MOVE', targetPosition: { x: 2, y: 2 } } });
      assert.strictEqual(tooFar.statusCode, 422, 'no se puede saltar dos casillas');

      const step = JSON.parse((await app.inject({ method: 'POST', url: '/api/combat/action', payload: { characterId, actionType: 'MOVE', targetPosition: { x: 1, y: 2 } } })).body);
      assert.deepStrictEqual(step.player.position, { x: 1, y: 2 });
      assert.strictEqual(step.player.ap, step.player.maxAp - 1);

      const end = await app.inject({ method: 'POST', url: '/api/combat/action', payload: { characterId, actionType: 'END_TURN' } });
      assert.strictEqual(end.statusCode, 200);
      const endBody = JSON.parse(end.body);
      assert.ok(endBody.messages.length >= 1, 'el adversario actúa al terminar el turno');
      if (!endBody.battleOver) {
        assert.strictEqual(endBody.player.ap, endBody.player.maxAp, 'el nuevo turno restaura los PA');
        assert.strictEqual(endBody.turnCount, battle.turnCount + 1);
        assert.strictEqual(endBody.enemy.hp, undefined, 'los PV del adversario no viajan');
        assert.strictEqual(endBody.enemy.allAbilities, undefined, 'el repertorio oculto no viaja');
      }
    } finally {
      db.close();
      await app.close();
    }
  });

  it('5. la tarifa del carruaje sale del balance y coincide con el cobro', async () => {
    const { app, db } = await buildApp({ dbPath: ':memory:' });
    try {
      const { characterId } = await newAwakenedCharacter(app);
      await app.inject({ method: 'POST', url: '/api/prologue/tutorial/dilemma', payload: { characterId, choice: 'PRUDENCE' } });
      await app.inject({ method: 'POST', url: '/api/prologue/drink', payload: { characterId, potionChoice: 'COBALT_EYES' } });

      const d = JSON.parse((await app.inject({ method: 'GET', url: '/api/city/districts' })).body);
      assert.strictEqual(typeof d.carriageFarePence, 'number');
      const before = db.getCharacter(characterId)!.raw_pence;
      const trip = await app.inject({ method: 'POST', url: '/api/city/travel', payload: { characterId, destinationDistrict: 'DIST_EAST_BOROUGH' } });
      assert.strictEqual(trip.statusCode, 200);
      assert.strictEqual(JSON.parse(trip.body).farePaidPence, d.carriageFarePence);
      assert.strictEqual(db.getCharacter(characterId)!.raw_pence, before - d.carriageFarePence);
    } finally {
      db.close();
      await app.close();
    }
  });

  it('6. consultar si hay combate no es un error con ?probe=1', async () => {
    const { app, db } = await buildApp({ dbPath: ':memory:' });
    try {
      const { characterId } = await newAwakenedCharacter(app);
      const legacy = await app.inject({ method: 'GET', url: `/api/combat/active/${characterId}` });
      assert.strictEqual(legacy.statusCode, 404, 'sin probe se conserva el contrato anterior');
      const probe = await app.inject({ method: 'GET', url: `/api/combat/active/${characterId}?probe=1` });
      assert.strictEqual(probe.statusCode, 200);
      assert.deepStrictEqual(JSON.parse(probe.body), { active: false });

      await app.inject({ method: 'POST', url: '/api/prologue/tutorial/dilemma', payload: { characterId, choice: 'PRUDENCE' } });
      await app.inject({ method: 'POST', url: '/api/prologue/drink', payload: { characterId, potionChoice: 'COBALT_EYES' } });
      await app.inject({ method: 'POST', url: '/api/combat/start', payload: { characterId, ambushMode: 'NEUTRAL' } });
      const active = JSON.parse((await app.inject({ method: 'GET', url: `/api/combat/active/${characterId}?probe=1` })).body);
      assert.strictEqual(active.status, 'ONGOING', 'con combate en curso devuelve la batalla proyectada');
      assert.ok(active.battleId);
    } finally {
      db.close();
      await app.close();
    }
  });

  it('7. un caso resuelto no se reabre al consultar el expediente', async () => {
    const { app, db } = await buildApp({ dbPath: ':memory:' });
    try {
      const { characterId } = await newAwakenedCharacter(app);
      await app.inject({ method: 'POST', url: '/api/prologue/tutorial/dilemma', payload: { characterId, choice: 'PRUDENCE' } });
      await app.inject({ method: 'POST', url: '/api/prologue/drink', payload: { characterId, potionChoice: 'COBALT_EYES' } });
      const env = JSON.parse((await app.inject({ method: 'GET', url: `/api/investigation/case/active/${characterId}` })).body);
      const instanceId = env.caseState.id;
      for (const clueId of ['CLUE_WILL_DRAFT', 'CLUE_CONCEALED_SAFE', 'CLUE_ASTROLOGY_RECORD']) {
        const v = await app.inject({ method: 'POST', url: '/api/investigation/clue/visit-source', payload: { instanceId, clueId, sourceIndex: 0, timeOfDay: 'mañana' } });
        assert.strictEqual(JSON.parse(v.body).success, true, `${clueId} debe concederse`);
      }
      const hyps = JSON.parse((await app.inject({ method: 'GET', url: `/api/investigation/case/active/${characterId}` })).body).availableHypotheses;
      const truth = hyps.find((h: any) => h.pistasSoporte.includes('CLUE_CONCEALED_SAFE'));
      const sub = JSON.parse((await app.inject({ method: 'POST', url: '/api/investigation/hypothesis/submit', payload: { instanceId, hypothesisId: truth.id } })).body);
      assert.strictEqual(sub.resolutionUnlocked, true);
      const res = await app.inject({ method: 'POST', url: '/api/investigation/case/resolve', payload: { instanceId, resolutionId: 'RESOLUTION_B_TRUTH' } });
      assert.strictEqual(res.statusCode, 200);

      const after = JSON.parse((await app.inject({ method: 'GET', url: `/api/investigation/case/active/${characterId}` })).body);
      assert.strictEqual(after.caseState.id, instanceId, 'es la misma instancia, no una nueva');
      assert.strictEqual(after.caseState.status, 'RESOLVED');
      assert.strictEqual(after.caseState.resolvedState.resolutionId, 'RESOLUTION_B_TRUTH');
      assert.deepStrictEqual(after.availableResolutions, [], 'sin desenlaces pendientes');
      assert.strictEqual(db.getCharacterCaseInstances(characterId).length, 1, 'no se crea otra instancia del caso');
    } finally {
      db.close();
      await app.close();
    }
  });

  it('8. el dilema público no lleva la solución', async () => {
    const { app, db } = await buildApp({ dbPath: ':memory:' });
    try {
      const { characterId } = await newAwakenedCharacter(app);
      await app.inject({ method: 'POST', url: '/api/prologue/tutorial/dilemma', payload: { characterId, choice: 'PRUDENCE' } });
      await app.inject({ method: 'POST', url: '/api/prologue/drink', payload: { characterId, potionChoice: 'COBALT_EYES' } });
      const pub = JSON.parse((await app.inject({ method: 'GET', url: `/api/acting/dilemma/${characterId}?public=1` })).body);
      assert.ok(pub.dilemma.choices.length >= 2);
      for (const c of pub.dilemma.choices) {
        assert.deepStrictEqual(Object.keys(c).sort(), ['description', 'id', 'label', 'text'], 'sólo id y textos visibles');
      }
      const legacy = JSON.parse((await app.inject({ method: 'GET', url: `/api/acting/dilemma/${characterId}` })).body);
      assert.ok('digestionGain' in legacy.dilemma.choices[0], 'sin public se conserva el contrato de ui/');
      const choiceId = pub.dilemma.choices[0].id;
      const res = await app.inject({ method: 'POST', url: '/api/acting/resolve', payload: { characterId, dilemmaId: pub.dilemma.id, choiceId } });
      assert.strictEqual(res.statusCode, 200, 'se puede resolver con los ids públicos');
    } finally {
      db.close();
      await app.close();
    }
  });
});
