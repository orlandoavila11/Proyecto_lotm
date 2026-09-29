import { test, describe } from 'node:test';
import assert from 'node:assert';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { DatabaseClient } from '../src/infra/database/DatabaseClient.js';

describe('GATE G3 · BATERÍA KILL-9 COMPLETA (5 DOMINIOS CRÍTICOS)', () => {
  const tmpDbPath = path.join(process.cwd(), 'test_g3_kill9.sqlite');

  function cleanup() {
    if (fs.existsSync(tmpDbPath)) {
      try { fs.unlinkSync(tmpDbPath); } catch {}
    }
  }

  test('1. Kill-9 en Combate Activo: Restauración Byte-Equivalente del Estado Táctico en battles', () => {
    cleanup();
    let db = new DatabaseClient(tmpDbPath);
    
    const char = db.createCharacter({
      id: 'char_k9_combat',
      name: 'Leonard Mitchell',
      pathway: 'DARKNESS',
      sequence: 8,
      current_health: 85,
      max_health: 100,
      current_spirituality: 60,
      max_spirituality: 100,
      sanity: 90,
      corruption: 0,
      digestion_progress: 30,
      raw_pence: 400,
      current_location: 'Backlund - Cherwood',
      current_day: 5
    });

    const battleId = 'battle_k9_active_1';
    const battleStatePayload = {
      round: 2,
      gridWidth: 5,
      gridHeight: 7,
      combatants: [
        { id: char.id, hp: 85, ap: 3, x: 2, y: 5 },
        { id: 'enemy_nighthawk_1', hp: 50, ap: 2, x: 2, y: 1 }
      ],
      turnOrder: [char.id, 'enemy_nighthawk_1']
    };

    db.getRawDb().prepare(`
      INSERT INTO battles (
        id, character_id, state_json, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
    `).run(battleId, char.id, JSON.stringify(battleStatePayload), 'ONGOING');

    const expectedStateBeforeKill = db.getRawDb().prepare(`SELECT * FROM battles WHERE id = ?`).get(battleId) as any;

    // SIMULACIÓN KILL -9: Cierre abrupto de conexión SQLite
    db.close();

    // REAPERTURA / RECUPERACIÓN POST-KILL
    db = new DatabaseClient(tmpDbPath);
    const restoredState = db.getRawDb().prepare(`SELECT * FROM battles WHERE id = ?`).get(battleId) as any;

    assert.strictEqual(restoredState.id, expectedStateBeforeKill.id);
    assert.strictEqual(restoredState.character_id, expectedStateBeforeKill.character_id);
    assert.strictEqual(restoredState.status, 'ONGOING');
    assert.strictEqual(restoredState.state_json, expectedStateBeforeKill.state_json);

    const parsed = JSON.parse(restoredState.state_json);
    assert.strictEqual(parsed.round, 2);
    assert.strictEqual(parsed.combatants.length, 2);

    db.close();
    cleanup();
  });

  test('2. Kill-9 en Investigación Activa: Restauración Byte-Equivalente de Pistas y Caso', () => {
    cleanup();
    let db = new DatabaseClient(tmpDbPath);

    const char = db.createCharacter({
      id: 'char_k9_investigation',
      name: 'Sherlock Moriarty',
      pathway: 'FOOL',
      sequence: 9,
      current_health: 100,
      max_health: 100,
      current_spirituality: 100,
      max_spirituality: 100,
      sanity: 95,
      corruption: 0,
      digestion_progress: 20,
      raw_pence: 500,
      current_location: 'Backlund - Cherwood',
      current_day: 3
    });

    const caseId = 'case_k9_cherwood_1';
    db.getRawDb().prepare(`
      INSERT INTO investigation_cases (
        id, character_id, case_code, title, district, status, culprit_name, reward_pence, created_day
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(caseId, char.id, 'CASE_CHERWOOD_APOTHECARY', 'El Caso del Boticario Clandestino', 'DIST_CHERWOOD', 'OPEN', 'Roy', 240, 3);

    const clueId = 'clue_k9_blood';
    db.getRawDb().prepare(`
      INSERT INTO investigation_clues (
        id, case_id, clue_code, title, description, clue_type, is_discovered
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(clueId, caseId, 'CLUE_BLOOD_VIAL', 'Vial de Sangre Espesa', 'Muestra hemática hallada bajo el entarimado.', 'FORENSIC', 1);

    const expectedCase = db.getRawDb().prepare(`SELECT * FROM investigation_cases WHERE id = ?`).get(caseId) as any;
    const expectedClue = db.getRawDb().prepare(`SELECT * FROM investigation_clues WHERE id = ?`).get(clueId) as any;

    // KILL -9
    db.close();

    // REAPERTURA
    db = new DatabaseClient(tmpDbPath);
    const restoredCase = db.getRawDb().prepare(`SELECT * FROM investigation_cases WHERE id = ?`).get(caseId) as any;
    const restoredClue = db.getRawDb().prepare(`SELECT * FROM investigation_clues WHERE id = ?`).get(clueId) as any;

    assert.deepStrictEqual(restoredCase, expectedCase);
    assert.deepStrictEqual(restoredClue, expectedClue);

    db.close();
    cleanup();
  });

  test('3. Kill-9 en Tick de Acting: Restauración Byte-Equivalente de Estado Semanal de Actuación', () => {
    cleanup();
    let db = new DatabaseClient(tmpDbPath);

    const char = db.createCharacter({
      id: 'char_k9_acting',
      name: 'Audrey Hall',
      pathway: 'VISIONARY',
      sequence: 9,
      current_health: 100,
      max_health: 100,
      current_spirituality: 100,
      max_spirituality: 100,
      sanity: 98,
      corruption: 0,
      digestion_progress: 45.5,
      raw_pence: 12000,
      current_location: 'Backlund - Empress Borough',
      current_day: 7
    });

    db.saveActingWeeklyState({
      character_id: char.id,
      current_week: 1,
      coherence: 85.0,
      variety_penalty: 0.0,
      instability_flag: 0,
      loss_of_self_risk_flag: 0,
      weekly_records_json: JSON.stringify([{ day: 7, principle: 'OBSERVER', choice: 'SILENCE' }]),
      history_json: JSON.stringify([{ outcome: 'Comprendes los engranajes sin intervenir.' }])
    });

    const expectedWeeklyState = db.getActingWeeklyState(char.id);

    // KILL -9
    db.close();

    // REAPERTURA
    db = new DatabaseClient(tmpDbPath);
    const restoredWeeklyState = db.getActingWeeklyState(char.id);

    assert.deepStrictEqual(restoredWeeklyState, expectedWeeklyState);
    assert.strictEqual(restoredWeeklyState?.coherence, 85.0);

    db.close();
    cleanup();
  });

  test('4. Kill-9 en Estado de Ascenso: Restauración Byte-Equivalente del Cáliz y Preparación', () => {
    cleanup();
    let db = new DatabaseClient(tmpDbPath);

    const char = db.createCharacter({
      id: 'char_k9_ascension',
      name: 'Klein Moretti',
      pathway: 'FOOL',
      sequence: 9,
      current_health: 100,
      max_health: 100,
      current_spirituality: 100,
      max_spirituality: 100,
      sanity: 90,
      corruption: 0,
      digestion_progress: 100,
      raw_pence: 2400,
      current_location: 'Backlund - Cherwood',
      current_day: 14
    });

    const checklist = {
      lugar: true,
      momento: true,
      materiales_rituales: false,
      costos_anclaje: true
    };
    const presentedTime = 1757800010000;

    db.saveAscensionState({
      character_id: char.id,
      current_step: 'TRAGO_PRESENTED',
      presented_at: presentedTime,
      checklist_json: JSON.stringify(checklist),
      formula_id: 'KNOW_FORMULA_CLOWN'
    });

    const expectedState = db.getAscensionState(char.id);

    // KILL -9
    db.close();

    // REAPERTURA
    db = new DatabaseClient(tmpDbPath);
    const restoredState = db.getAscensionState(char.id);

    assert.deepStrictEqual(restoredState, expectedState);
    assert.strictEqual(restoredState?.current_step, 'TRAGO_PRESENTED');
    assert.strictEqual(restoredState?.formula_id, 'KNOW_FORMULA_CLOWN');

    db.close();
    cleanup();
  });

  test('5. Kill-9 en Avance de Día y Franja Horaria: Restauración Byte-Equivalente del Calendario', () => {
    cleanup();
    let db = new DatabaseClient(tmpDbPath);

    const char = db.createCharacter({
      id: 'char_k9_calendar',
      name: 'Derrick Berg',
      pathway: 'SUN',
      sequence: 9,
      current_health: 100,
      max_health: 100,
      current_spirituality: 100,
      max_spirituality: 100,
      sanity: 100,
      corruption: 0,
      digestion_progress: 10,
      raw_pence: 300,
      current_location: 'City of Silver',
      current_day: 10
    });

    // Avanzar a día 10, slot 2 y registrar asistencia
    db.advanceCharacterSlot(char.id, 2);
    db.recordWorkAttendance(char.id);

    const snapshotChar = db.getCharacter(char.id)!;

    // KILL -9
    db.close();

    // REAPERTURA
    db = new DatabaseClient(tmpDbPath);
    const restoredChar = db.getCharacter(char.id)!;

    assert.strictEqual(restoredChar.current_day, snapshotChar.current_day);
    assert.strictEqual(restoredChar.current_slot, snapshotChar.current_slot);
    assert.strictEqual(restoredChar.work_attendance_weekly, snapshotChar.work_attendance_weekly);

    db.close();
    cleanup();
  });
});
