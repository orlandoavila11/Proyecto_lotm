/**
 * SUITE DE PRUEBAS AUTOMATIZADA — PROMPT P08 (VIAJE Y LUGAR DE INVESTIGACIÓN)
 * Valida los criterios de aceptación de P08:
 * 1. Hardening de viaje: validación de destino, asequibilidad, transición no vacía e idempotencia.
 * 2. Investigación en locación real: adquisición de indicios mundanos y por afinidad de Vía.
 * 3. Gating estricto: la Vía incorrecta recibe rechazo con razón explicativa.
 * 4. Re-inspección sin duplicación ni sobrecostes.
 * 5. Cero filtración de truthModel en proyecciones públicas.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildApp } from '../src/server/app.js';
import { InvestigationEngine } from '../src/core/investigation/InvestigationEngine.js';

describe('TASK P08: Viaje y Locación Real de Investigación en Cherwood', () => {

  it('1. Hardening de viaje: destino inválido, misma ubicación y fondos insuficientes son rechazados', async () => {
    const { app, db } = await buildApp({ dbPath: ':memory:' });
    try {
      const char = db.createCharacter({
        id: 'char_travel_tester',
        name: 'Leonard Mitchell',
        pathway: 'FOOL',
        sequence: 9,
        current_health: 100,
        max_health: 100,
        current_spirituality: 100,
        max_spirituality: 100,
        sanity: 95,
        corruption: 0,
        digestion_progress: 10,
        raw_pence: 12, // Insuficiente para tarifa de 24d
        current_location: 'DIST_CHERWOOD',
        current_day: 1
      });

      // A) Destino inexistente
      const resInvalid = await app.inject({
        method: 'POST',
        url: '/api/city/travel',
        payload: {
          characterId: char.id,
          destinationDistrict: 'DIST_NONEXISTENT_PLANET'
        }
      });
      assert.strictEqual(resInvalid.statusCode, 422);
      assert.match(JSON.parse(resInvalid.body).error, /no reconocido/i);

      // B) Mismo distrito actual
      const resSame = await app.inject({
        method: 'POST',
        url: '/api/city/travel',
        payload: {
          characterId: char.id,
          destinationDistrict: 'DIST_CHERWOOD'
        }
      });
      assert.strictEqual(resSame.statusCode, 422);
      assert.match(JSON.parse(resSame.body).error, /ya te encuentras/i);

      // C) Fondos insuficientes (tiene 12d, requiere 24d)
      const resNoFunds = await app.inject({
        method: 'POST',
        url: '/api/city/travel',
        payload: {
          characterId: char.id,
          destinationDistrict: 'DIST_BRIDGE'
        }
      });
      assert.strictEqual(resNoFunds.statusCode, 422);
      assert.match(JSON.parse(resNoFunds.body).error, /fondos insuficientes/i);

      // El personaje permanece intacto en Cherwood con 12d
      const charAfterFail = db.getCharacter(char.id)!;
      assert.strictEqual(charAfterFail.current_location, 'DIST_CHERWOOD');
      assert.strictEqual(charAfterFail.raw_pence, 12);
    } finally {
      db.close();
      await app.close();
    }
  });

  it('2. Viaje exitoso: deduce 24d, actualiza ubicación e implementa idempotencia de recibo', async () => {
    const { app, db } = await buildApp({ dbPath: ':memory:' });
    try {
      const char = db.createCharacter({
        id: 'char_traveler_ok',
        name: 'Klein Moretti',
        pathway: 'FOOL',
        sequence: 9,
        current_health: 100,
        max_health: 100,
        current_spirituality: 100,
        max_spirituality: 100,
        sanity: 95,
        corruption: 0,
        digestion_progress: 10,
        raw_pence: 240, // 20 chelines
        current_location: 'DIST_CHERWOOD',
        current_day: 1
      });

      const cmdId = 'cmd_travel_cherwood_to_bridge_001';

      // Primer viaje
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
      const data1 = JSON.parse(res1.body);
      assert.strictEqual(data1.success, true);
      assert.strictEqual(data1.newLocation, 'DIST_BRIDGE');
      assert.strictEqual(data1.farePaidPence, 24);
      assert.strictEqual(data1.fromReceipt, false);

      const charAfter1 = db.getCharacter(char.id)!;
      assert.strictEqual(charAfter1.current_location, 'DIST_BRIDGE');
      assert.strictEqual(charAfter1.raw_pence, 216); // 240 - 24

      // Reintento idéntico (mismo commandId)
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

      // Invariante: No se volvió a cobrar ni a mover erróneamente
      const charAfter2 = db.getCharacter(char.id)!;
      assert.strictEqual(charAfter2.raw_pence, 216);
      assert.strictEqual(charAfter2.current_location, 'DIST_BRIDGE');
    } finally {
      db.close();
      await app.close();
    }
  });

  it('3. Locación de investigación: descubrimiento mundano y gating estricto por afinidad de Vía', async () => {
    const { app, db } = await buildApp({ dbPath: ':memory:' });
    try {
      // Personaje Vidente (FOOL)
      const foolChar = db.createCharacter({
        id: 'char_investigator_fool',
        name: 'Sherlock Moriarty',
        pathway: 'FOOL',
        sequence: 9,
        current_health: 100,
        max_health: 100,
        current_spirituality: 100,
        max_spirituality: 100,
        sanity: 95,
        corruption: 0,
        digestion_progress: 10,
        raw_pence: 480,
        current_location: 'DIST_CHERWOOD',
        current_day: 1
      });

      // Activar caso
      const caseState = InvestigationEngine.activateCase(db, foolChar.id, 'CASE_CHERWOOD_HEIRLOOM');
      assert.ok(caseState.id, 'Debe generar instanceId');

      // A) Pista Mundana 1: Chimenea Exterior -> CLUE_BURNED_TOYS (fuente 0)
      const resMundane = await app.inject({
        method: 'POST',
        url: '/api/investigation/clue/visit-source',
        payload: {
          instanceId: caseState.id,
          clueId: 'CLUE_BURNED_TOYS',
          sourceIndex: 0
        }
      });
      assert.strictEqual(resMundane.statusCode, 200);
      const dataMundane = JSON.parse(resMundane.body);
      assert.strictEqual(dataMundane.success, true);
      assert.strictEqual(dataMundane.clue.id, 'CLUE_BURNED_TOYS');

      // B) Pista Mundana 2: Despacho de Sterling -> CLUE_WILL_DRAFT (fuente 0)
      const resWill = await app.inject({
        method: 'POST',
        url: '/api/investigation/clue/visit-source',
        payload: {
          instanceId: caseState.id,
          clueId: 'CLUE_WILL_DRAFT',
          sourceIndex: 0
        }
      });
      assert.strictEqual(resWill.statusCode, 200);
      const dataWill = JSON.parse(resWill.body);
      assert.strictEqual(dataWill.success, true);
      assert.strictEqual(dataWill.clue.id, 'CLUE_WILL_DRAFT');

      // C) Pista FOOL: Marcas del Desván -> CLUE_ASTROLOGY_RECORD (fuente 0)
      const resFoolClue = await app.inject({
        method: 'POST',
        url: '/api/investigation/clue/visit-source',
        payload: {
          instanceId: caseState.id,
          clueId: 'CLUE_ASTROLOGY_RECORD',
          sourceIndex: 0
        }
      });
      assert.strictEqual(resFoolClue.statusCode, 200);
      const dataFoolClue = JSON.parse(resFoolClue.body);
      assert.strictEqual(dataFoolClue.success, true);
      assert.strictEqual(dataFoolClue.clue.id, 'CLUE_ASTROLOGY_RECORD');

      // D) Intento de Pista VISIONARY por personaje FOOL: Tocador de Evangeline -> CLUE_MIND_TRACES
      const resBlocked = await app.inject({
        method: 'POST',
        url: '/api/investigation/clue/visit-source',
        payload: {
          instanceId: caseState.id,
          clueId: 'CLUE_MIND_TRACES',
          sourceIndex: 0
        }
      });
      assert.strictEqual(resBlocked.statusCode, 200);
      const dataBlocked = JSON.parse(resBlocked.body);
      assert.strictEqual(dataBlocked.success, false);
      assert.match(dataBlocked.reason, /Espectador|VISIONARY/i);

      // Re-inspección de pista ya descubierta (CLUE_BURNED_TOYS): devuelve pista sin duplicación
      const resReinspect = await app.inject({
        method: 'POST',
        url: '/api/investigation/clue/visit-source',
        payload: {
          instanceId: caseState.id,
          clueId: 'CLUE_BURNED_TOYS',
          sourceIndex: 0
        }
      });
      assert.strictEqual(resReinspect.statusCode, 200);
      const dataReinspect = JSON.parse(resReinspect.body);
      assert.strictEqual(dataReinspect.success, true);
      assert.match(dataReinspect.message, /ya había sido registrada/i);

      // Comprobar persistencia en SQLite
      const updatedCase = JSON.parse(db.getCaseInstance(caseState.id)!.state_json);
      const clueIds = updatedCase.discoveredClues.map((c: any) => c.id);
      assert.ok(clueIds.includes('CLUE_BURNED_TOYS'));
      assert.ok(clueIds.includes('CLUE_WILL_DRAFT'));
      assert.ok(clueIds.includes('CLUE_ASTROLOGY_RECORD'));
      assert.ok(!clueIds.includes('CLUE_MIND_TRACES'), 'Pista bloqueada no debe registrarse');

      // Verificación de aislamiento estricto: cero exposición de truthModel
      assert.strictEqual(updatedCase.truthModel, undefined);
    } finally {
      db.close();
      await app.close();
    }
  });

  it('4. Personaje Espectador (VISIONARY) accede exitosamente a CLUE_MIND_TRACES', async () => {
    const { app, db } = await buildApp({ dbPath: ':memory:' });
    try {
      const spectatorChar = db.createCharacter({
        id: 'char_investigator_spectator',
        name: 'Audrey Hall',
        pathway: 'VISIONARY',
        sequence: 9,
        current_health: 100,
        max_health: 100,
        current_spirituality: 100,
        max_spirituality: 100,
        sanity: 95,
        corruption: 0,
        digestion_progress: 10,
        raw_pence: 480,
        current_location: 'DIST_CHERWOOD',
        current_day: 1
      });

      const caseState = InvestigationEngine.activateCase(db, spectatorChar.id, 'CASE_CHERWOOD_HEIRLOOM');

      // Acceso permitido por afinidad VISIONARY
      const res = await app.inject({
        method: 'POST',
        url: '/api/investigation/clue/visit-source',
        payload: {
          instanceId: caseState.id,
          clueId: 'CLUE_MIND_TRACES',
          sourceIndex: 0
        }
      });

      assert.strictEqual(res.statusCode, 200);
      const data = JSON.parse(res.body);
      assert.strictEqual(data.success, true);
      assert.strictEqual(data.clue.id, 'CLUE_MIND_TRACES');
      assert.match(data.clue.descripcion, /lectura gestual|colapso neuromuscular/i);
    } finally {
      db.close();
      await app.close();
    }
  });

});
