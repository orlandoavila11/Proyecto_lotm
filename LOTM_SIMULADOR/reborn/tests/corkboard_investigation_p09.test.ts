/**
 * SUITE DE PRUEBAS AUTOMATIZADA — PROMPT P09 (TABLERO DE INVESTIGACIÓN VERAZ Y LEGIBLE)
 * Valida los criterios de aceptación de P09:
 * 1. Proyección pública limpia: CERO filtración de truthModel ni pistas ocultas.
 * 2. Contrato de notas libres: creación, persistencia en SQLite y eliminación.
 * 3. Conexión de indicios: deducción canónica con insight, prevención de pistas no descubiertas.
 * 4. Hipótesis autorales del caso: fail-forward con pista falsa y desbloqueo de resolución.
 * 5. Resolución formal del caso con registro actoral e impacto local.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildApp } from '../src/server/app.js';
import { InvestigationEngine } from '../src/core/investigation/InvestigationEngine.js';

describe('TASK P09: Tablero de Corcho Veraz, Notas Libres e Hipótesis Autorales', () => {

  it('1. Proyección pública del caso activo: cero filtración de truthModel ni pistas no descubiertas', async () => {
    const { app, db } = await buildApp({ dbPath: ':memory:' });
    try {
      const char = db.createCharacter({
        id: 'char_p09_inspector',
        name: 'Oliver Marsh',
        pathway: 'FOOL',
        sequence: 9,
        current_health: 100,
        max_health: 100,
        current_spirituality: 100,
        max_spirituality: 100,
        sanity: 90,
        corruption: 0,
        digestion_progress: 10,
        raw_pence: 480,
        current_location: 'DIST_CHERWOOD',
        current_day: 1
      });
      await app.inject({ method: 'POST', url: '/api/investigation/case/activate', payload: { characterId: char.id, caseId: 'CASE_CHERWOOD_HEIRLOOM' } });

      const res = await app.inject({
        method: 'GET',
        url: `/api/investigation/case/active/${char.id}`
      });

      assert.strictEqual(res.statusCode, 200);
      const data = JSON.parse(res.body);

      assert.strictEqual(data.success, true);
      assert.ok(data.caseState, 'Debe devolver el caseState');

      // Invariante de seguridad: truthModel NUNCA debe viajar al cliente
      assert.strictEqual(data.caseState.truthModel, undefined);
      assert.strictEqual(data.truthModel, undefined);

      // Invariante: Solo pistas descubiertas
      const discoveredIds = data.caseState.discoveredClues.map((c: any) => c.id);
      assert.ok(!discoveredIds.includes('CLUE_CONCEALED_SAFE'), 'La caja fuerte oculta no debe proyectarse al inicio');
      assert.ok(!discoveredIds.includes('CLUE_MIND_TRACES'), 'El tocador de Evangeline no debe proyectarse sin visita');

      // Catálogo público de hipótesis: sólo las que sostienen pistas ya descubiertas, bajo alias opacos
      // y sin teoría hasta contrastarlas (la teoría de la hipótesis central ES la verdad del caso).
      assert.ok(Array.isArray(data.availableHypotheses), 'Debe ofrecer catálogo de hipótesis autorales');
      assert.strictEqual(data.availableHypotheses.length, 0, 'Con una sola pista pública ninguna hipótesis está sostenida');
      assert.ok(!JSON.stringify(data).includes('HYPOTHESIS_'), 'Ningún id interno de hipótesis viaja al cliente');
      assert.ok(!JSON.stringify(data).includes('Red de Amortiguación'), 'La hipótesis central no se filtra al inicio');

      // Resoluciones no deben estar desbloqueadas al inicio
      assert.strictEqual(data.caseState.resolutionUnlocked, false);
      assert.deepStrictEqual(data.availableResolutions, []);
    } finally {
      db.close();
      await app.close();
    }
  });

  it('2. Contrato de notas libres: adición, persistencia en SQLite y eliminación', async () => {
    const { app, db } = await buildApp({ dbPath: ':memory:' });
    try {
      const char = db.createCharacter({
        id: 'char_p09_notetaker',
        name: 'Henry Blythe',
        pathway: 'FOOL',
        sequence: 9,
        current_health: 100,
        max_health: 100,
        current_spirituality: 100,
        max_spirituality: 100,
        sanity: 90,
        corruption: 0,
        digestion_progress: 10,
        raw_pence: 480,
        current_location: 'DIST_CHERWOOD',
        current_day: 1
      });
      await app.inject({ method: 'POST', url: '/api/investigation/case/activate', payload: { characterId: char.id, caseId: 'CASE_CHERWOOD_HEIRLOOM' } });

      const caseState = InvestigationEngine.activateCase(db, char.id, 'CASE_CHERWOOD_HEIRLOOM');

      // A) Añadir nota libre
      const noteText = 'Comprobar las firmas en los legados parroquiales de Beatrice.';
      const resAdd = await app.inject({
        method: 'POST',
        url: '/api/investigation/notes/add',
        payload: {
          instanceId: caseState.id,
          text: noteText,
          x: 240,
          y: 360
        }
      });

      assert.strictEqual(resAdd.statusCode, 200);
      const dataAdd = JSON.parse(resAdd.body);
      assert.strictEqual(dataAdd.success, true);
      assert.ok(dataAdd.note.id.startsWith('note_'));
      assert.strictEqual(dataAdd.note.text, noteText);
      assert.strictEqual(dataAdd.note.x, 240);
      assert.strictEqual(dataAdd.note.y, 360);

      // B) Verificar persistencia recargando el caso desde SQLite
      const resGet = await app.inject({
        method: 'GET',
        url: `/api/investigation/case/active/${char.id}`
      });
      const dataGet = JSON.parse(resGet.body);
      assert.strictEqual(dataGet.caseState.notes.length, 1);
      assert.strictEqual(dataGet.caseState.notes[0].text, noteText);

      // C) Eliminar nota libre
      const resDel = await app.inject({
        method: 'POST',
        url: '/api/investigation/notes/delete',
        payload: {
          instanceId: caseState.id,
          noteId: dataAdd.note.id
        }
      });
      assert.strictEqual(resDel.statusCode, 200);

      // Verificar que desapareció
      const resAfterDel = await app.inject({
        method: 'GET',
        url: `/api/investigation/case/active/${char.id}`
      });
      const dataAfterDel = JSON.parse(resAfterDel.body);
      assert.strictEqual(dataAfterDel.caseState.notes.length, 0);
    } finally {
      db.close();
      await app.close();
    }
  });

  it('3. Conexión de indicios: deducción canónica con insight e inviolabilidad de pistas no descubiertas', async () => {
    const { app, db } = await buildApp({ dbPath: ':memory:' });
    try {
      const char = db.createCharacter({
        id: 'char_p09_connect_tester',
        name: 'Margaret Ashby',
        pathway: 'VISIONARY',
        sequence: 9,
        current_health: 100,
        max_health: 100,
        current_spirituality: 100,
        max_spirituality: 100,
        sanity: 90,
        corruption: 0,
        digestion_progress: 10,
        raw_pence: 480,
        current_location: 'DIST_CHERWOOD',
        current_day: 1
      });
      await app.inject({ method: 'POST', url: '/api/investigation/case/activate', payload: { characterId: char.id, caseId: 'CASE_CHERWOOD_HEIRLOOM' } });

      const caseState = InvestigationEngine.activateCase(db, char.id, 'CASE_CHERWOOD_HEIRLOOM');

      // Intentar conectar con una pista NO descubierta -> Debe fallar con error de regla de dominio
      const resInvalidConn = await app.inject({
        method: 'POST',
        url: '/api/investigation/clues/connect',
        payload: {
          instanceId: caseState.id,
          clueA: 'CLUE_BURNED_TOYS',
          clueB: 'CLUE_BLOODLINE_TALISMAN', // No descubierta
          relation: 'explica'
        }
      });
      assert.strictEqual(resInvalidConn.statusCode, 422);

      // Descubrir CLUE_WILL_DRAFT legalmente
      InvestigationEngine.visitClueSource(db, caseState.id, {
        clueId: 'CLUE_WILL_DRAFT',
        sourceIndex: 0
      });

      // Conectar CLUE_BURNED_TOYS y CLUE_WILL_DRAFT con relación canónica 'explica'
      const resValidConn = await app.inject({
        method: 'POST',
        url: '/api/investigation/clues/connect',
        payload: {
          instanceId: caseState.id,
          clueA: 'CLUE_BURNED_TOYS',
          clueB: 'CLUE_WILL_DRAFT',
          relation: 'explica'
        }
      });

      assert.strictEqual(resValidConn.statusCode, 200);
      const dataConn = JSON.parse(resValidConn.body);
      assert.strictEqual(dataConn.success, true);
      assert.strictEqual(dataConn.isCorrect, true);
      assert.match(dataConn.insight, /borrador de directivas de Sterling explica/i);

      // Comprobar persistencia de la arista en SQLite
      const resHydrate = await app.inject({
        method: 'GET',
        url: `/api/investigation/case/active/${char.id}`
      });
      const dataHydrate = JSON.parse(resHydrate.body);
      assert.strictEqual(dataHydrate.caseState.connectedEdges.length, 1);
      assert.strictEqual(dataHydrate.caseState.connectedEdges[0].relation, 'explica');
    } finally {
      db.close();
      await app.close();
    }
  });

  it('4. Evaluación de hipótesis y desbloqueo de resolución contra el modelo de verdad', async () => {
    const { app, db } = await buildApp({ dbPath: ':memory:' });
    try {
      const char = db.createCharacter({
        id: 'char_p09_hypo_tester',
        name: 'Walter Crane',
        pathway: 'FOOL',
        sequence: 9,
        current_health: 100,
        max_health: 100,
        current_spirituality: 100,
        max_spirituality: 100,
        sanity: 90,
        corruption: 0,
        digestion_progress: 10,
        raw_pence: 480,
        current_location: 'DIST_CHERWOOD',
        current_day: 1
      });
      await app.inject({ method: 'POST', url: '/api/investigation/case/activate', payload: { characterId: char.id, caseId: 'CASE_CHERWOOD_HEIRLOOM' } });

      const caseState = InvestigationEngine.activateCase(db, char.id, 'CASE_CHERWOOD_HEIRLOOM');

      // A) Someter hipótesis errónea: HYPOTHESIS_JULIAN
      // Debe fail-forward: consume 1 día + siembra pista falsa en SQLite
      const resJulian = await app.inject({
        method: 'POST',
        url: '/api/investigation/hypothesis/submit',
        payload: {
          instanceId: caseState.id,
          hypothesisId: 'HYPOTHESIS_JULIAN'
        }
      });

      assert.strictEqual(resJulian.statusCode, 200);
      const dataJulian = JSON.parse(resJulian.body);
      assert.strictEqual(dataJulian.success, true);
      assert.strictEqual(dataJulian.isCorrect, false);
      assert.strictEqual(dataJulian.daysConsumed, 1);
      assert.strictEqual(dataJulian.falseCluePlanted.id, 'FALSE_CLUE_JULIAN_SEDATIVES');
      assert.ok(!JSON.stringify(dataJulian).includes('HYPOTHESIS_'), 'La respuesta usa alias públicos');
      const julian = dataJulian.availableHypotheses.find((h: any) => h.id === 'HIPOTESIS_A');
      assert.ok(julian && julian.tested === true && typeof julian.teoria === 'string', 'Una hipótesis contrastada revela su teoría');
      assert.ok(!dataJulian.availableHypotheses.some((h: any) => h.tested === false && h.teoria !== null), 'Las no contrastadas no llevan teoría');

      // B) Intentar someter HYPOTHESIS_TRUE_NETWORK sin la prueba definitiva (CLUE_CONCEALED_SAFE) -> Rechazado
      const resPrematureTruth = await app.inject({
        method: 'POST',
        url: '/api/investigation/hypothesis/submit',
        payload: {
          instanceId: caseState.id,
          hypothesisId: 'HYPOTHESIS_TRUE_NETWORK'
        }
      });
      assert.strictEqual(resPrematureTruth.statusCode, 422);

      // C) Simular adquisición de la prueba definitiva
      const stateRow = JSON.parse(db.getCaseInstance(caseState.id)!.state_json);
      stateRow.discoveredClues.push({
        id: 'CLUE_CONCEALED_SAFE',
        nombre: 'Libro de Transferencias Oculto de Sterling',
        descripcion: 'Registro confidencial tras el retrato.',
        sourceVisited: 'CAJA_FUERTE_TRAS_RETRATO',
        discoveredAtDay: 1,
        isConcealed: true
      });
      db.saveCaseInstance({
        id: stateRow.id,
        character_id: stateRow.characterId,
        case_id: stateRow.caseId,
        status: stateRow.status,
        state_json: JSON.stringify(stateRow)
      });

      // Ahora someter HYPOTHESIS_TRUE_NETWORK -> Éxito y desbloqueo de resolución
      const resTruth = await app.inject({
        method: 'POST',
        url: '/api/investigation/hypothesis/submit',
        payload: {
          instanceId: caseState.id,
          hypothesisId: 'HYPOTHESIS_TRUE_NETWORK'
        }
      });

      assert.strictEqual(resTruth.statusCode, 200);
      const dataTruth = JSON.parse(resTruth.body);
      assert.strictEqual(dataTruth.success, true);
      assert.strictEqual(dataTruth.isCorrect, true);
      assert.strictEqual(dataTruth.resolutionUnlocked, true);

      // D) Consultar resoluciones disponibles ahora que está desbloqueada
      const resActive = await app.inject({
        method: 'GET',
        url: `/api/investigation/case/active/${char.id}`
      });
      const dataActive = JSON.parse(resActive.body);
      assert.strictEqual(dataActive.caseState.resolutionUnlocked, true);
      assert.strictEqual(dataActive.availableResolutions.length, 4);

      // E) Ejecutar Veredicto Final: RESOLUTION_A_JUSTICE
      const resResolve = await app.inject({
        method: 'POST',
        url: '/api/investigation/case/resolve',
        payload: {
          instanceId: caseState.id,
          resolutionId: 'RESOLUTION_A_JUSTICE'
        }
      });

      assert.strictEqual(resResolve.statusCode, 200);
      const dataResolve = JSON.parse(resResolve.body);
      assert.strictEqual(dataResolve.success, true);
      assert.strictEqual(dataResolve.state.status, 'RESOLVED');
      assert.strictEqual(dataResolve.resolutionId, 'RESOLUTION_A_JUSTICE');
    } finally {
      db.close();
      await app.close();
    }
  });

});
