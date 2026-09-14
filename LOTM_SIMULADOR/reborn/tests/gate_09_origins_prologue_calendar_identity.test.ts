import { test, describe, before, after } from 'node:test';
import * as assert from 'node:assert';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseClient } from '../src/infra/database/DatabaseClient.js';
import { OriginEngine } from '../src/core/origins/OriginEngine.js';
import { PrologueEngine } from '../src/core/prologue/PrologueEngine.js';
import { CalendarEngine, TimeSlot } from '../src/core/calendar/CalendarEngine.js';
import { IdentityEngine } from '../src/core/identity/IdentityEngine.js';
import { buildApp } from '../src/server/app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const testDbPath = path.join(__dirname, 'test_gate_09.db');

describe('GATE 09: Orígenes Canónicos, Prólogo, Calendario de Cuatro Franjas e Identidad', () => {
  let db: DatabaseClient;

  before(() => {
    if (fs.existsSync(testDbPath)) fs.unlinkSync(testDbPath);
    db = new DatabaseClient(testDbPath);
  });

  after(() => {
    db.close();
    if (fs.existsSync(testDbPath)) fs.unlinkSync(testDbPath);
  });

  test('1. Orígenes Canónicos (Tier G): 6 plantillas completas con 3 anclas firmadas, profesión y carga', () => {
    const origins = OriginEngine.getAllOrigins();
    assert.strictEqual(origins.length, 6, 'Deben existir exactamente 6 plantillas canónicas de origen en Tier G');

    const expectedIds = [
      'ORIGIN_CLERK',
      'ORIGIN_MEDICAL_STUDENT',
      'ORIGIN_REPORTER',
      'ORIGIN_FRAUDULENT_MEDIUM',
      'ORIGIN_DOCKWORKER',
      'ORIGIN_PRIVATE_INVESTIGATOR'
    ];

    for (const expectedId of expectedIds) {
      const template = OriginEngine.getOriginTemplate(expectedId);
      assert.ok(template, `Plantilla ${expectedId} debe existir en el catálogo`);
      assert.strictEqual(template.originAnchors.length, 3, `${expectedId} debe tener exactamente 3 anclas de origen`);
      assert.ok(template.weeklySalaryPence > 0, `${expectedId} debe formalizar un salario positivo`);
      assert.ok(template.initialContact.name, `${expectedId} debe tener un contacto inicial`);
      assert.ok(template.initialBurden.name, `${expectedId} debe tener una carga inicial`);
    }

    // Probar aplicación de origen a un personaje
    const char = db.createCharacter({
      id: 'char_test_clerk',
      name: 'Arthur Preece',
      pathway: 'FOOL',
      sequence: 9,
      current_health: 100,
      max_health: 100,
      current_spirituality: 100,
      max_spirituality: 100,
      sanity: 100,
      corruption: 0,
      digestion_progress: 0,
      raw_pence: 0,
      current_location: 'Backlund - Cherwood',
      current_day: 1
    });

    const result = OriginEngine.applyOrigin(db, char.id, 'ORIGIN_CLERK');
    assert.strictEqual(result.anchorsCreated, 3, 'Deben crearse 3 anclas en BD');
    assert.strictEqual(result.character.salary_pence, 360, 'Salario formalizado a 360d (£1 10s)');
    assert.strictEqual(result.persona.profession, 'Escribiente del Registro Civil');
    assert.strictEqual(result.persona.social_class, 'MIDDLE_CLASS');

    const anchorsInDb = db.getAnchors(char.id);
    assert.strictEqual(anchorsInDb.length, 3, 'Las 3 anclas deben persistir en SQLite');
    assert.ok(anchorsInDb.some(a => a.name === 'Mr. Ronald Moore'));
  });

  test('2. Onboarding Gate: Bot novato completa el prólogo ≥80%, decisión ≤5 min, pista ≤10 min', () => {
    const sim = PrologueEngine.simulateNoviceOnboarding(100, 1353);

    console.log('[GATE DE ONBOARDING - BOT NOVATO]');
    console.log(`  - Corridas Totales: ${sim.totalRuns}`);
    console.log(`  - Completados con éxito: ${sim.successfulCompletions} (${(sim.completionRate * 100).toFixed(1)}%)`);
    console.log(`  - Tiempo promedio primera decisión: ${sim.avgDecisionMinutes} min (Target: <= 5.0 min)`);
    console.log(`  - Tiempo promedio primera pista: ${sim.avgClueMinutes} min (Target: <= 10.0 min)`);

    assert.ok(sim.completionRate >= 0.80, `Tasa de completitud debe ser >= 80% (medido: ${sim.completionRate})`);
    assert.ok(sim.avgDecisionMinutes <= 5.0, `Primera decisión debe ser <= 5 min (medido: ${sim.avgDecisionMinutes})`);
    assert.ok(sim.avgClueMinutes <= 10.0, `Primera pista debe ser <= 10 min (medido: ${sim.avgClueMinutes})`);
  });

  test('3. Bucle Diegético del Prólogo: Intro, Carta del Benefactor, Dilema/Pista y Elección Críptica de Poción', () => {
    const char = db.createCharacter({
      id: 'char_prologue_flow',
      name: 'Julian Vance',
      pathway: 'NONE',
      sequence: 9,
      current_health: 100,
      max_health: 100,
      current_spirituality: 100,
      max_spirituality: 100,
      sanity: 100,
      corruption: 0,
      digestion_progress: 0,
      raw_pence: 0,
      current_location: 'Backlund - Cherwood',
      current_day: 1
    });

    // A. Iniciar Prólogo
    const startRes = PrologueEngine.startPrologue(db, char.id, 'ORIGIN_REPORTER');
    assert.strictEqual(startRes.prologueStep, 'BENEFACTOR_LETTER');
    assert.ok(startRes.benefactorLetterText.includes('Un Benefactor Silencioso'));

    // B. Resolver Dilema Tutorial (Prudencia civil)
    const dilemmaRes = PrologueEngine.resolveTutorialDilemma(db, char.id, 'PRUDENCE');
    assert.strictEqual(dilemmaRes.nextStep, 'POTION_CHOICE');
    assert.ok(dilemmaRes.clueDiscovered.code === 'CLUE_BENEFACTOR_SEAL');

    // C. Consultar opciones de poción
    const potionOptions = PrologueEngine.getPotionChoiceDetails();
    assert.strictEqual(potionOptions.options.length, 2);
    assert.ok(potionOptions.options.some(o => o.id === 'COBALT_EYES'));
    assert.ok(potionOptions.options.some(o => o.id === 'AMBER_MIRROR'));

    // D. Ingerir Poción Cobalto (Vidente / Fool)
    const drinkRes = PrologueEngine.drinkFirstPotion(db, char.id, 'COBALT_EYES');
    assert.strictEqual(drinkRes.pathway, 'FOOL');
    assert.strictEqual(drinkRes.sequence, 9);
    assert.strictEqual(drinkRes.ruinaSet, 5, 'El primer trago marca al Beyonder con +5 de ruina');
    assert.strictEqual(drinkRes.corruptionSet, 0, 'La corrupción arranca limpia en 0');
    assert.ok(drinkRes.visionNarrative.includes('niebla gris ceniza'));

    const updatedChar = db.getCharacter(char.id)!;
    assert.strictEqual(updatedChar.pathway, 'FOOL');
    assert.strictEqual(updatedChar.ruina, 5, 'Ruina debe ser 5 (Tier Marcado)');
    assert.strictEqual(updatedChar.corruption, 0, 'Corrupción debe arrancar en 0');
    assert.strictEqual(updatedChar.prologue_step, 'COMPLETED');
  });

  test('4. Test de Oro del Calendario (§3): 4 semanas simuladas disparan todos los subsistemas en orden exacto', () => {
    const char = db.createCharacter({
      id: 'char_calendar_gold',
      name: 'Edward Foster',
      pathway: 'FOOL',
      sequence: 9,
      current_health: 100,
      max_health: 100,
      current_spirituality: 100,
      max_spirituality: 100,
      sanity: 100,
      corruption: 5,
      digestion_progress: 10,
      raw_pence: 2400, // £10
      current_location: 'Backlund - Cherwood',
      current_day: 1
    });

    OriginEngine.applyOrigin(db, char.id, 'ORIGIN_CLERK');

    const goldResult = CalendarEngine.runGoldTest4Weeks(db, char.id);

    console.log('[TEST DE ORO DEL CALENDARIO: NÚMEROS CRUDOS DE EJECUCIÓN]');
    console.log(`  - Días Simulados: ${goldResult.totalDaysSimulated}`);
    console.log(`  - Franjas Totales: ${goldResult.totalSlotsSimulated}`);
    console.log(`  - Semanas Ejecutadas: ${goldResult.weeksExecuted}`);
    console.log(`  - Llamadas por Subsistema:`, goldResult.subsystemCallCounts);
    console.log(`  - Primer Ciclo Semanal:`, goldResult.executionLogOrder.slice(0, 6));

    assert.strictEqual(goldResult.weeksExecuted, 4, 'Deben ejecutarse exactamente 4 ciclos semanales');
    assert.strictEqual(goldResult.subsystemCallCounts.acting, 4, 'acting debe llamarse 4 veces');
    assert.strictEqual(goldResult.subsystemCallCounts.alquiler, 4, 'alquiler debe llamarse 4 veces');
    assert.strictEqual(goldResult.subsystemCallCounts.salario, 4, 'salario debe llamarse 4 veces');
    assert.strictEqual(goldResult.subsystemCallCounts.mercado, 4, 'mercado debe llamarse 4 veces');
    assert.strictEqual(goldResult.subsystemCallCounts.convergencia, 4, 'convergencia debe llamarse 4 veces');
    assert.strictEqual(goldResult.subsystemCallCounts.decay, 4, 'decay debe llamarse 4 veces');

    // Verificar orden exacto de los 6 pasos en cada una de las 4 semanas
    const expectedOrder = ['1_acting', '2_alquiler', '3_salario', '4_mercado', '5_convergencia', '6_decay'];
    for (let w = 0; w < 4; w++) {
      const slice = goldResult.executionLogOrder.slice(w * 6, (w + 1) * 6);
      assert.deepStrictEqual(slice, expectedOrder, `Semana ${w + 1} debe seguir el orden documentado`);
    }
  });

  test('5. Eventos Fechados: Sermón dominical (día 7, 14, 21, 28) y Luna Llena (día 15, 29)', () => {
    const char = db.createCharacter({
      id: 'char_dated_events',
      name: 'Thomas Wood',
      pathway: 'VISIONARY',
      sequence: 9,
      current_health: 100,
      max_health: 100,
      current_spirituality: 50,
      max_spirituality: 100,
      sanity: 80,
      corruption: 5,
      digestion_progress: 20,
      raw_pence: 1200,
      current_location: 'Backlund - Cherwood',
      current_day: 7
    });

    OriginEngine.applyOrigin(db, char.id, 'ORIGIN_MEDICAL_STUDENT');

    // Día 7, Slot 0 MORNING: Sermón Dominical
    const sermonOutcome = CalendarEngine.checkDatedEvents(db, char.id, 7, 0);
    assert.ok(sermonOutcome, 'Sermón dominical debe dispararse el día 7 slot 0');
    assert.strictEqual(sermonOutcome?.type, 'SUNDAY_SERMON');

    // Día 15, Slot 3 NIGHT: Luna Llena
    db.setCharacterSlot(char.id, 15, 3);
    const moonOutcome = CalendarEngine.checkDatedEvents(db, char.id, 15, 3);
    assert.ok(moonOutcome, 'Luna llena debe dispararse el día 15 slot 3');
    assert.strictEqual(moonOutcome?.type, 'FULL_MOON');

    const updatedChar = db.getCharacter(char.id)!;
    assert.strictEqual(updatedChar.sanity, 77, 'Sanidad debe reducirse en -3 por la luna llena');
    assert.strictEqual(updatedChar.current_spirituality, 65, 'Espiritualidad debe aumentar en +15');
  });

  test('6. Identidad & Doble Vida: Coartada laboral vs Ausencia prolongada y 108 eventos Tier L', () => {
    const char = db.createCharacter({
      id: 'char_identity_double_life',
      name: 'Evelyn Gray',
      pathway: 'VISIONARY',
      sequence: 9,
      current_health: 100,
      max_health: 100,
      current_spirituality: 100,
      max_spirituality: 100,
      sanity: 90,
      corruption: 5,
      digestion_progress: 10,
      raw_pence: 500,
      current_location: 'Backlund - Puente',
      current_day: 1
    });

    OriginEngine.applyOrigin(db, char.id, 'ORIGIN_FRAUDULENT_MEDIUM');

    // A. Acción WORK otorga coartada: reduce sospecha policial y sube anclas
    const initialPersona = db.getActivePersona(char.id)!;
    const initialSuspicion = initialPersona.police_suspicion;
    const initialAnchors = db.getAnchors(char.id)[0].strength;

    const workAction = CalendarEngine.performSlotAction(db, char.id, 'WORK');
    assert.strictEqual(workAction.mechanicalDeltas.policeSuspicionDelta, -2);
    assert.strictEqual(workAction.mechanicalDeltas.anchorStrengthDelta, 1);

    const postWorkPersona = db.getActivePersona(char.id)!;
    assert.strictEqual(postWorkPersona.police_suspicion, Math.max(0, initialSuspicion - 2));

    // B. Carga de los 108 eventos Tier L
    const allEvents = IdentityEngine.getEvents();
    assert.strictEqual(allEvents.length, 108, 'Deben cargarse los 108 eventos de identity_events.json');

    // C. Gating por sospecha y selección congruente
    const rolledEvent = IdentityEngine.rollIdentityEvent(db, char.id, 999);
    assert.ok(rolledEvent, 'Debe seleccionarse un evento válido');
    assert.ok(
      rolledEvent?.targetSocialClass === 'WORKING_CLASS' || rolledEvent?.targetSocialClass === 'ALL',
      'El evento debe corresponder a la clase social de la persona (WORKING_CLASS o ALL)'
    );

    // D. Resolución de evento de identidad y registro en historial
    const resolveResult = IdentityEngine.resolveIdentityEvent(db, char.id, rolledEvent!.id, 0);
    assert.ok(resolveResult.chosenOption, 'Debe resolverse la opción seleccionada');
    const history = db.getIdentityEventHistory(char.id);
    assert.strictEqual(history.length, 1, 'Debe guardarse el registro en identity_event_history');
    assert.strictEqual(history[0].event_id, rolledEvent!.id);
  });

  test('7. Perfil Sigiloso (Watch Item de 07): Bot de baja exposición vive 30 días con 0 incursiones', () => {
    const char = db.createCharacter({
      id: 'char_stealth_bot',
      name: 'Silas Reed',
      pathway: 'FOOL',
      sequence: 9,
      current_health: 100,
      max_health: 100,
      current_spirituality: 100,
      max_spirituality: 100,
      sanity: 95,
      corruption: 5,
      digestion_progress: 15,
      raw_pence: 3000,
      current_location: 'Backlund - Cherwood',
      current_day: 1
    });

    OriginEngine.applyOrigin(db, char.id, 'ORIGIN_CLERK');

    let incursionsTriggered = 0;

    // Simular 30 días de vida civil ordenada: trabaja, no usa poderes públicos, asiste a sermón
    for (let day = 1; day <= 30; day++) {
      for (let slot = 0; slot < 4; slot++) {
        // En franjas 0 y 1 trabaja o socializa, nunca comete delitos
        const action = (slot === 0) ? 'WORK' : (slot === 1 ? 'SOCIALIZE' : 'INVESTIGATE');
        const outcome = CalendarEngine.performSlotAction(db, char.id, action);
        if (outcome.weeklyTickExecuted && outcome.weeklyTickExecuted.convergenceChecked) {
          // Chequear si se disparó allanamiento
          const incursionLog = db.getCalendarLogs(char.id).filter(l => l.details_json.includes('"incursionTriggered":true'));
          if (incursionLog.length > incursionsTriggered) {
            incursionsTriggered = incursionLog.length;
          }
        }
      }
    }

    const finalPersona = db.getActivePersona(char.id)!;
    console.log('[PERFIL SIGILOSO - BOT DE BAJA EXPOSICIÓN]');
    console.log(`  - Días de vida simulados: 30`);
    console.log(`  - Sospecha policial final: ${finalPersona.police_suspicion}`);
    console.log(`  - Sospecha eclesiástica final: ${finalPersona.church_suspicion}`);
    console.log(`  - Incursiones de Halcones Nocturnos disparadas: ${incursionsTriggered}`);

    assert.strictEqual(incursionsTriggered, 0, 'Un bot de baja exposición que no levanta sospechas debe tener 0 incursiones en 30 días');
  });

  test('8. Kill-9 a mitad de franja y recuperación íntegra de SQLite', () => {
    const char = db.createCharacter({
      id: 'char_kill9_calendar',
      name: 'Oscar Black',
      pathway: 'FOOL',
      sequence: 9,
      current_health: 100,
      max_health: 100,
      current_spirituality: 100,
      max_spirituality: 100,
      sanity: 90,
      corruption: 5,
      digestion_progress: 30,
      raw_pence: 1000,
      current_location: 'Backlund - Cherwood',
      current_day: 4
    });

    OriginEngine.applyOrigin(db, char.id, 'ORIGIN_DOCKWORKER');

    // Avanzar a día 4, slot 2 (EVENING)
    db.advanceCharacterSlot(char.id, 2);
    db.recordWorkAttendance(char.id);

    const snapshotChar = db.getCharacter(char.id)!;
    const snapshotSlot = snapshotChar.current_slot;
    const snapshotDay = snapshotChar.current_day;
    const snapshotAttendance = snapshotChar.work_attendance_weekly;

    // Simular Kill-9 cerrando la conexión
    db.close();

    // Reabrir nueva conexión a la base de datos persistida
    const restoredDb = new DatabaseClient(testDbPath);
    const restoredChar = restoredDb.getCharacter(char.id)!;

    assert.strictEqual(restoredChar.current_slot, snapshotSlot, 'Slot restaurado byte-equivalente');
    assert.strictEqual(restoredChar.current_day, snapshotDay, 'Día restaurado byte-equivalente');
    assert.strictEqual(restoredChar.work_attendance_weekly, snapshotAttendance, 'Asistencia laboral restaurada byte-equivalente');

    // Reasignar db para el after() hook
    db = restoredDb;
  });

  test('9. Integración Fastify: Endpoints de Prólogo, Calendario e Identidad', async () => {
    const { app, db: fastifyDb } = await buildApp({ dbPath: ':memory:' });

    // A. GET /api/prologue/origins
    const originsRes = await app.inject({
      method: 'GET',
      url: '/api/prologue/origins'
    });
    assert.strictEqual(originsRes.statusCode, 200);
    const originsBody = JSON.parse(originsRes.body);
    assert.strictEqual(originsBody.origins.length, 6);

    // B. Crear personaje y POST /api/prologue/start
    const char = fastifyDb.createCharacter({
      id: 'char_api_test',
      name: 'Arthur Hastings',
      pathway: 'NONE',
      sequence: 9,
      current_health: 100,
      max_health: 100,
      current_spirituality: 100,
      max_spirituality: 100,
      sanity: 100,
      corruption: 0,
      digestion_progress: 0,
      raw_pence: 0,
      current_location: 'Backlund - Cherwood',
      current_day: 1
    });

    const startRes = await app.inject({
      method: 'POST',
      url: '/api/prologue/start',
      payload: {
        characterId: char.id,
        originId: 'ORIGIN_CLERK'
      }
    });
    assert.strictEqual(startRes.statusCode, 200);

    // C. POST /api/calendar/action
    const actionRes = await app.inject({
      method: 'POST',
      url: '/api/calendar/action',
      payload: {
        characterId: char.id,
        actionType: 'WORK'
      }
    });
    assert.strictEqual(actionRes.statusCode, 200);
    const actionBody = JSON.parse(actionRes.body);
    assert.strictEqual(actionBody.actionType, 'WORK');

    // D. GET /api/identity/roll/:characterId
    const rollRes = await app.inject({
      method: 'GET',
      url: `/api/identity/roll/${char.id}`
    });
    assert.strictEqual(rollRes.statusCode, 200);
    const rollBody = JSON.parse(rollRes.body);
    assert.ok(rollBody.event !== undefined);

    await app.close();
    fastifyDb.close();
  });
});
