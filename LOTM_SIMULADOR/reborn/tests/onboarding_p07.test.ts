import { test, describe, before, after } from 'node:test';
import * as assert from 'node:assert';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseClient } from '../src/infra/database/DatabaseClient.js';
import { OriginEngine } from '../src/core/origins/OriginEngine.js';
import { PrologueEngine } from '../src/core/prologue/PrologueEngine.js';
import { CalendarEngine } from '../src/core/calendar/CalendarEngine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const testDbPath = path.join(__dirname, 'test_onboarding_p07.db');

describe('TASK P07: Onboarding Canónico, Continuidad Civil y Matriz 6x2', () => {
  let db: DatabaseClient;

  before(() => {
    if (fs.existsSync(testDbPath)) fs.unlinkSync(testDbPath);
    db = new DatabaseClient(testDbPath);
  });

  after(() => {
    db.close();
    if (fs.existsSync(testDbPath)) fs.unlinkSync(testDbPath);
  });

  test('1. Matriz Canónica 6x2 Completa (6 Orígenes × 2 Vías de Fase 1)', () => {
    const canonicalOrigins = [
      'ORIGIN_CLERK',
      'ORIGIN_MEDICAL_STUDENT',
      'ORIGIN_REPORTER',
      'ORIGIN_FRAUDULENT_MEDIUM',
      'ORIGIN_DOCKWORKER',
      'ORIGIN_PRIVATE_INVESTIGATOR'
    ];

    const pathways: Array<{ id: 'COBALT_EYES' | 'AMBER_MIRROR'; pathway: 'FOOL' | 'VISIONARY'; expectedName: string }> = [
      { id: 'COBALT_EYES', pathway: 'FOOL', expectedName: 'Vidente (Seer)' },
      { id: 'AMBER_MIRROR', pathway: 'VISIONARY', expectedName: 'Espectador (Spectator)' }
    ];

    let combinationsTested = 0;

    for (const originId of canonicalOrigins) {
      for (const targetPotion of pathways) {
        const charId = `char_matrix_${originId.toLowerCase()}_${targetPotion.pathway.toLowerCase()}`;
        
        // 1. Crear personaje
        db.createCharacter({
          id: charId,
          name: `Civil ${originId}`,
          pathway: 'UNAWAKENED',
          sequence: 9,
          current_health: 100,
          max_health: 100,
          current_spirituality: 100,
          max_spirituality: 100,
          sanity: 95,
          corruption: 0,
          digestion_progress: 0,
          raw_pence: 0,
          current_location: 'Backlund',
          current_day: 1,
          prologue_step: 'INTRO'
        });

        // 2. Iniciar prólogo y aplicar origen
        const startResult = PrologueEngine.startPrologue(db, charId, originId);
        assert.strictEqual(startResult.prologueStep, 'BENEFACTOR_LETTER');
        assert.ok(startResult.benefactorLetterText.includes('Benefactor Silencioso'));

        // Verificar datos canónicos de origen en characters y persona
        const char = db.getCharacter(charId)!;
        const originTemplate = OriginEngine.getOriginTemplate(originId)!;
        assert.strictEqual(char.origin_id, originId);
        assert.strictEqual(char.raw_pence, originTemplate.startingPence, `startingPence para ${originId} incorrecto`);
        assert.strictEqual(char.salary_pence, originTemplate.weeklySalaryPence, `weeklySalaryPence para ${originId} incorrecto`);
        assert.strictEqual(char.employer_name, originTemplate.initialContact.name);

        // Verificar 3 anclas canónicas firmadas
        const anchors = db.getAnchors(charId);
        assert.strictEqual(anchors.length, 3, `Debe crear exactamente 3 anclas para ${originId}`);
        for (let idx = 0; idx < 3; idx++) {
          assert.strictEqual(anchors[idx].name, originTemplate.originAnchors[idx].name);
          assert.strictEqual(anchors[idx].strength, originTemplate.originAnchors[idx].strength);
        }

        // Verificar persona civil
        const persona = db.getActivePersona(charId)!;
        assert.ok(persona, 'Debe crear una persona civil activa');
        assert.strictEqual(persona.profession, originTemplate.profession);
        assert.strictEqual(persona.social_class, originTemplate.socialClass);
        assert.strictEqual(persona.police_suspicion, 5);
        assert.strictEqual(persona.church_suspicion, 5);

        // 3. Resolver dilema tutorial
        const dilemmaResult = PrologueEngine.resolveTutorialDilemma(db, charId, 'PRUDENCE');
        assert.strictEqual(dilemmaResult.nextStep, 'POTION_CHOICE');
        assert.strictEqual(dilemmaResult.clueDiscovered.code, 'CLUE_BENEFACTOR_SEAL');

        // 4. Ingerir poción
        const drinkResult = PrologueEngine.drinkFirstPotion(db, charId, targetPotion.id);
        assert.strictEqual(drinkResult.pathway, targetPotion.pathway);
        assert.strictEqual(drinkResult.sequence, 9);
        assert.strictEqual(drinkResult.sequenceName, targetPotion.expectedName);
        assert.strictEqual(drinkResult.ruinaSet, 5);
        assert.strictEqual(drinkResult.corruptionSet, 0);

        // Verificar estado final en BD
        const finalChar = db.getCharacter(charId)!;
        assert.strictEqual(finalChar.pathway, targetPotion.pathway);
        assert.strictEqual(finalChar.sequence, 9);
        assert.strictEqual(finalChar.ruina, 5);
        assert.strictEqual(finalChar.corruption, 0);
        assert.strictEqual(finalChar.sanity, 95);
        assert.strictEqual(finalChar.prologue_step, 'COMPLETED');

        combinationsTested++;
      }
    }

    assert.strictEqual(combinationsTested, 12, 'La matriz 6x2 completa (12 combinaciones) debe ser validada');
  });

  test('2. Reanudación Autoritativa Mid-Prologue (Persistencia en SQLite)', () => {
    const charId = 'char_reload_test';
    db.createCharacter({
      id: charId,
      name: 'Arthur Reload',
      pathway: 'UNAWAKENED',
      sequence: 9,
      current_health: 100,
      max_health: 100,
      current_spirituality: 100,
      max_spirituality: 100,
      sanity: 95,
      corruption: 0,
      digestion_progress: 0,
      raw_pence: 0,
      current_location: 'Backlund',
      current_day: 1,
      prologue_step: 'INTRO'
    });

    // Iniciar con ORIGIN_CLERK
    PrologueEngine.startPrologue(db, charId, 'ORIGIN_CLERK');
    let char = db.getCharacter(charId)!;
    assert.strictEqual(char.prologue_step, 'BENEFACTOR_LETTER');

    // Simular reload: el paso sigue siendo BENEFACTOR_LETTER
    char = db.getCharacter(charId)!;
    assert.strictEqual(char.prologue_step, 'BENEFACTOR_LETTER');

    // Avanzar a Dilema
    PrologueEngine.resolveTutorialDilemma(db, charId, 'CURIOSITY');
    char = db.getCharacter(charId)!;
    assert.strictEqual(char.prologue_step, 'POTION_CHOICE');

    // Simular segundo reload en POTION_CHOICE
    char = db.getCharacter(charId)!;
    assert.strictEqual(char.prologue_step, 'POTION_CHOICE');

    // Concluir con poción Cobalto
    PrologueEngine.drinkFirstPotion(db, charId, 'COBALT_EYES');
    char = db.getCharacter(charId)!;
    assert.strictEqual(char.prologue_step, 'COMPLETED');
    assert.strictEqual(char.pathway, 'FOOL');
  });

  test('3. Idempotencia y Prevención de Doble Envío', () => {
    const charId = 'char_idempotency_test';
    db.createCharacter({
      id: charId,
      name: 'Double Submit Test',
      pathway: 'UNAWAKENED',
      sequence: 9,
      current_health: 100,
      max_health: 100,
      current_spirituality: 100,
      max_spirituality: 100,
      sanity: 95,
      corruption: 0,
      digestion_progress: 0,
      raw_pence: 0,
      current_location: 'Backlund',
      current_day: 1,
      prologue_step: 'INTRO'
    });

    // Iniciar prólogo 2 veces seguidas con el mismo ID
    PrologueEngine.startPrologue(db, charId, 'ORIGIN_MEDICAL_STUDENT');
    PrologueEngine.startPrologue(db, charId, 'ORIGIN_MEDICAL_STUDENT');

    // Verificar que no se duplicaron las anclas
    const anchors = db.getAnchors(charId);
    assert.strictEqual(anchors.length, 3, 'No debe duplicar anclas ante doble llamada a startPrologue');

    // Resolver dilema 2 veces seguidas
    PrologueEngine.resolveTutorialDilemma(db, charId, 'PRUDENCE');
    PrologueEngine.resolveTutorialDilemma(db, charId, 'PRUDENCE');

    // Beber poción 2 veces seguidas
    const drink1 = PrologueEngine.drinkFirstPotion(db, charId, 'AMBER_MIRROR');
    const drink2 = PrologueEngine.drinkFirstPotion(db, charId, 'AMBER_MIRROR');

    assert.strictEqual(drink1.ruinaSet, 5);
    assert.strictEqual(drink2.ruinaSet, 5);
    const finalChar = db.getCharacter(charId)!;
    assert.strictEqual(finalChar.ruina, 5, 'Ruina no debe incrementarse ante doble consumo de la primera poción');
  });

  test('4. Continuidad Civil y Acción de Calendario Post-Prólogo', () => {
    const charId = 'char_civil_test';
    db.createCharacter({
      id: charId,
      name: 'Inspector Civil',
      pathway: 'UNAWAKENED',
      sequence: 9,
      current_health: 100,
      max_health: 100,
      current_spirituality: 100,
      max_spirituality: 100,
      sanity: 95,
      corruption: 0,
      digestion_progress: 0,
      raw_pence: 0,
      current_location: 'Backlund - Cherwood',
      current_day: 1,
      current_slot: 0,
      prologue_step: 'INTRO'
    });

    PrologueEngine.startPrologue(db, charId, 'ORIGIN_PRIVATE_INVESTIGATOR');
    PrologueEngine.resolveTutorialDilemma(db, charId, 'PRUDENCE');
    PrologueEngine.drinkFirstPotion(db, charId, 'COBALT_EYES');

    // Verificar día y franja iniciales
    let char = db.getCharacter(charId)!;
    assert.strictEqual(char.current_day, 1);
    assert.strictEqual(char.current_slot, 0);

    // Lectura de registros: no avanza el tiempo
    const logsBefore = db.getCalendarLogs(charId);
    char = db.getCharacter(charId)!;
    assert.strictEqual(char.current_day, 1);
    assert.strictEqual(char.current_slot, 0);

    // Ejecutar acción civil WORK (Atender el Empleo Civil)
    const outcome = CalendarEngine.performSlotAction(db, charId, 'WORK');
    assert.strictEqual(outcome.actionType, 'WORK');
    assert.strictEqual(outcome.day, 1);
    assert.strictEqual(outcome.slot, 1, 'Debe avanzar a slot 1 (AFTERNOON)');
    assert.strictEqual(outcome.mechanicalDeltas.policeSuspicionDelta, -2);
    assert.strictEqual(outcome.mechanicalDeltas.anchorStrengthDelta, 1);

    // Verificar persistencia de día y franja tras la acción civil
    char = db.getCharacter(charId)!;
    assert.strictEqual(char.current_day, 1);
    assert.strictEqual(char.current_slot, 1);
    assert.strictEqual(char.work_attendance_weekly, 1);

    // Verificar que la persona civil redujo sospecha policial: 5 basal - 2 dilema prudencia - 2 acción civil = 1
    const persona = db.getActivePersona(charId)!;
    assert.strictEqual(persona.police_suspicion, 1);
  });
});
