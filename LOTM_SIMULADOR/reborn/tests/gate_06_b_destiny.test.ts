import { test } from 'node:test';
import * as assert from 'node:assert';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { DatabaseClient } from '../src/infra/database/DatabaseClient.js';
import { SomaticsEngine } from '../src/core/somatics/SomaticsEngine.js';
import { GridCombatEngine, GridBattleState } from '../src/core/combat/GridCombatEngine.js';

test('GATE 06.b: El Evento y el Destino (Rampage, Reconstrucción, Derivas, Destinos Terminales y Kill-9)', async (t) => {
  const tmpDir = path.join(process.cwd(), 'tmp_tests');
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
  const testDbPath = path.join(tmpDir, `test_somatics_06b_${Date.now()}.sqlite`);
  
  // Limpieza inicial
  if (fs.existsSync(testDbPath)) fs.unlinkSync(testDbPath);

  let db = new DatabaseClient(testDbPath);

  const charId = 'char_destiny_01';
  db.createCharacter({
    id: charId,
    name: 'Vincent Vance',
    pathway: 'FOOL',
    sequence: 9,
    current_health: 100,
    max_health: 100,
    current_spirituality: 100,
    max_spirituality: 100,
    sanity: 4, // Al borde del colapso (<= 5 gatilla rampage)
    corruption: 40,
    digestion_progress: 30.0,
    raw_pence: 7200,
    current_location: 'Backlund - Cherwood',
    current_day: 10,
    ruina: 10,
    terminal_state: null
  });

  // Inicializar 6 anclas
  SomaticsEngine.initializeCharacterAnchors(db, charId);

  await t.test('1. Rampage como Evento: Salto temporal, ancla dañada, incidente distrital y mini-expediente del yo (3 fuentes)', () => {
    const initialDay = db.getCharacter(charId)!.current_day;
    const initialRuina = db.getCharacter(charId)!.ruina;
    const initialAnchors = db.getActiveAnchors(charId);
    const topAnchorStrength = initialAnchors[0].strength;

    const rampageResult = SomaticsEngine.triggerRampageEvent(db, charId, 'SANITY_COLLAPSE');

    // 1. Salto temporal verificado
    const postChar = db.getCharacter(charId)!;
    assert.strictEqual(postChar.current_day, initialDay + 1, 'El día debe avanzar tras el salto temporal');
    assert.strictEqual(rampageResult.hoursSkipped, 36);

    // 2. Ancla más fuerte dañada deterministamente
    assert.ok(rampageResult.damagedAnchor);
    assert.strictEqual(rampageResult.damagedAnchor.strength, topAnchorStrength - 25);

    // 3. Ruina incrementada en +15
    assert.strictEqual(postChar.ruina, initialRuina + 15);

    // 4. Mini-expediente del yo: exactamente 3 fuentes consultables
    assert.strictEqual(rampageResult.reconstructionDossier.length, 3);
    const types = rampageResult.reconstructionDossier.map(d => d.type);
    assert.ok(types.includes('TESTIMONY'), 'Debe incluir testimonio de testigo');
    assert.ok(types.includes('PHYSICAL_EVIDENCE'), 'Debe incluir evidencia física de ropa/lodo');
    assert.ok(types.includes('ANCHOR_IMPACT'), 'Debe incluir impacto sobre el ancla');

    // 5. Escena de despertar redactada
    assert.ok(rampageResult.wakeNarrative.includes('El frío no entra por la piel'));
    assert.ok(rampageResult.wakeNarrative.includes('algo que habitaba en tu sangre tomó las riendas'));

    // 6. Reestabilización somática
    assert.strictEqual(postChar.sanity, 25, 'La sanidad se reestabiliza tras despertar');
  });

  await t.test('2. Kill-9 Recovery de Rampage: Persistencia SQLite de expedientes de reconstrucción', () => {
    // Cerramos el cliente actual (simulando kill -9)
    // Abrimos un cliente nuevo sobre el mismo archivo de base de datos
    const reloadedDb = new DatabaseClient(testDbPath);
    const events = reloadedDb.getRampageEvents(charId);

    assert.ok(events.length >= 1, 'El evento de rampage debe persistir tras crash/reinicio');
    const event = events[0];
    assert.strictEqual(event.triggerReason, 'SANITY_COLLAPSE');
    assert.strictEqual(event.reconstructionDossier.length, 3);
    assert.ok(event.wakeNarrative.includes('El frío no entra por la piel'));

    // Reasignamos db para los siguientes tests
    db = reloadedDb;
  });

  await t.test('3. Combate que muta a terminal anómalo ante colapso', () => {
    const battleState: GridBattleState = {
      battleId: 'battle_rampage_test',
      grid: { width: 7, height: 5 },
      preparation_score: 5,
      alertness_score: 5,
      initiativeWinner: 'PLAYER',
      actors: [],
      sides: { player: ['p1'], enemy: ['e1'] },
      turnCount: 3,
      status: 'ONGOING',
      turnLog: ['Turno 1: Choque de voluntades.']
    };

    GridCombatEngine.triggerAnomalousTerminal(battleState, 'COLAPSO_SOMATICO_RAMPAGE');
    assert.strictEqual(battleState.status, 'RAMPAGE_TERMINAL');
    assert.ok(battleState.turnLog.some(l => l.includes('El combate muta a terminal anómalo')));
  });

  await t.test('4. Bot "Actor Obsesivo": Deriva por sobre-actuación (FOOL y VISIONARY) y Reversión', () => {
    // Caso 1: Vía FOOL
    // Reducir anclas a < 40
    const activeAnchors = db.getActiveAnchors(charId);
    for (const a of activeAnchors) {
      db.damageAnchor(a.id, 40); // debilita todas las anclas
    }
    const anchorStrengthLow = db.getTotalAnchorStrength(charId);
    assert.ok(anchorStrengthLow < 40, `Anclas deben ser bajas (< 40), actual: ${anchorStrengthLow}`);

    // Registrar 2 semanas consecutivas con Coherencia > 1.0
    db.recordWeeklyCoherenceSnapshot(charId, 1, 1.15);
    db.recordWeeklyCoherenceSnapshot(charId, 2, 1.12);

    const driftFool = SomaticsEngine.checkActorDrift(db, charId, 'FOOL');
    assert.strictEqual(driftFool.hasDrift, true, 'Debe gatillar la deriva de actor');
    assert.ok(driftFool.pathwaySymptom?.includes('La Vida como Representación'), 'Síntoma canónico FOOL');

    // Caso 2: Vía VISIONARY
    const driftVisionary = SomaticsEngine.checkActorDrift(db, charId, 'VISIONARY');
    assert.strictEqual(driftVisionary.hasDrift, true);
    assert.ok(driftVisionary.pathwaySymptom?.includes('Apagado Emocional'), 'Síntoma canónico VISIONARY');

    // Caso 3: Reversión de la deriva
    // Reparar anclas (anclas >= 40)
    for (const a of db.getAnchors(charId)) {
      if (!a.is_destroyed) {
        db.repairAnchor(a.id, 60);
      }
    }
    assert.ok(db.getTotalAnchorStrength(charId) >= 40);

    // 2 ventanas consecutivas con coherencia moderada (0.4 .. 0.9)
    db.recordWeeklyCoherenceSnapshot(charId, 3, 0.65);
    db.recordWeeklyCoherenceSnapshot(charId, 4, 0.70);

    const recoveryCheck = SomaticsEngine.checkActorDrift(db, charId, 'FOOL');
    assert.strictEqual(recoveryCheck.hasDrift, false);
    assert.strictEqual(recoveryCheck.isRecovered, true, 'La deriva debe revertirse tras anclas altas y coherencia moderada');
  });

  await t.test('5. Bot "Corrupto Crónico": Transformación somática y Destino Terminal (NPC_CONVERTED)', () => {
    // Simular Ruina >= 50 y Corrupción >= 60
    const trans1 = SomaticsEngine.checkChronicTransformation(55, 65);
    assert.strictEqual(trans1.isTransforming, true);
    assert.strictEqual(trans1.tier, 'ASTRAL_PROTRUSIONS');
    assert.ok(trans1.symptom?.includes('Protuberancias astrales'));

    // Ruina >= 80 y Corrupción >= 60
    const trans2 = SomaticsEngine.checkChronicTransformation(85, 75);
    assert.strictEqual(trans2.isTransforming, true);
    assert.strictEqual(trans2.tier, 'VESSEL_EROSION');
    assert.ok(trans2.symptom?.includes('Receptáculo'));

    // Destino Terminal: Ruina >= 100 y 0 anclas vivas
    db.updateCharacterSomatics(charId, { ruina: 100 });
    for (const a of db.getActiveAnchors(charId)) {
      db.damageAnchor(a.id, 100); // destruir todas las anclas
    }
    assert.strictEqual(db.getActiveAnchors(charId).length, 0, '0 anclas activas');

    const terminal = SomaticsEngine.checkTerminalDestiny(db, charId);
    assert.strictEqual(terminal, 'NPC_CONVERTED', 'El personaje se sella como NPC_CONVERTED para el Telar');

    const finalChar = db.getCharacter(charId)!;
    assert.strictEqual(finalChar.terminal_state, 'NPC_CONVERTED');
  });

  // Limpieza final de base de datos temporal
  try {
    if (fs.existsSync(testDbPath)) fs.unlinkSync(testDbPath);
    if (fs.existsSync(tmpDir)) fs.rmdirSync(tmpDir, { recursive: true });
  } catch {}
});
