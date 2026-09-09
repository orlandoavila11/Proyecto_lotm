import { test } from 'node:test';
import * as assert from 'node:assert';
import { buildApp } from '../src/server/app.js';

test('Investigation API: Generación de casos procedurales, investigación de pistas y veredictos', async () => {
  const { app, db } = await buildApp({ dbPath: ':memory:' });

  try {
    // 1. Crear personaje para investigación (Sherlock Moriarty / FOOL)
    const charRes = await app.inject({
      method: 'POST',
      url: '/api/character/new',
      payload: {
        name: 'Sherlock Moriarty',
        pathway: 'FOOL',
        startingCity: 'Backlund - Distrito de Cherwood',
        background: 'Detective Consultor Privado',
        socialClass: 'MIDDLE_CLASS'
      }
    });
    assert.strictEqual(charRes.statusCode, 201);
    const charData = JSON.parse(charRes.body);
    const charId = charData.character.id;

    // 2. Generar un caso procedimental
    const genRes = await app.inject({
      method: 'POST',
      url: '/api/investigation/case/generate',
      payload: { characterId: charId }
    });
    assert.strictEqual(genRes.statusCode, 201);
    const genData = JSON.parse(genRes.body);
    assert.strictEqual(genData.success, true);
    assert.ok(genData.case.id);
    assert.strictEqual(genData.case.status, 'OPEN');
    assert.strictEqual(genData.case.clues.length, 3);

    const caseId = genData.case.id;
    const clue1 = genData.case.clues[0];
    const clue2 = genData.case.clues[1];

    // 3. Investigar primera pista con Divinación Espiritual (Fool tiene afinidad 1.5x)
    const inv1Res = await app.inject({
      method: 'POST',
      url: '/api/investigation/clue/investigate',
      payload: {
        characterId: charId,
        caseId,
        clueId: clue1.id,
        method: 'SPIRITUAL_DIVINATION'
      }
    });
    assert.strictEqual(inv1Res.statusCode, 200);
    const inv1Data = JSON.parse(inv1Res.body);
    assert.strictEqual(inv1Data.success, true);
    assert.strictEqual(inv1Data.digestionBonus, 7.5); // 5.0 * 1.5
    assert.strictEqual(inv1Data.caseReadyForDeduction, false);

    // 4. Investigar segunda pista (ahora cumple >= 2 pistas y pasa a READY_FOR_DEDUCTION)
    const inv2Res = await app.inject({
      method: 'POST',
      url: '/api/investigation/clue/investigate',
      payload: {
        characterId: charId,
        caseId,
        clueId: clue2.id,
        method: 'FORENSIC_TRACKING'
      }
    });
    assert.strictEqual(inv2Res.statusCode, 200);
    const inv2Data = JSON.parse(inv2Res.body);
    assert.strictEqual(inv2Data.caseReadyForDeduction, true);

    // 5. Emitir veredicto (Entrega a Scotland Yard)
    const verdictRes = await app.inject({
      method: 'POST',
      url: '/api/investigation/verdict',
      payload: {
        characterId: charId,
        caseId,
        action: 'SCOTLAND_YARD'
      }
    });
    assert.strictEqual(verdictRes.statusCode, 200);
    const verdictData = JSON.parse(verdictRes.body);
    assert.strictEqual(verdictData.success, true);
    assert.strictEqual(verdictData.policeDelta, -5);
    assert.strictEqual(verdictData.digestionBonus, 10.0);

    // 6. Consultar casos del personaje
    const casesRes = await app.inject({
      method: 'GET',
      url: `/api/investigation/cases/${charId}`
    });
    assert.strictEqual(casesRes.statusCode, 200);
    const casesData = JSON.parse(casesRes.body);
    assert.strictEqual(casesData.cases.length, 1);
    assert.strictEqual(casesData.cases[0].status, 'SOLVED');

  } finally {
    db.close();
    await app.close();
  }
});

