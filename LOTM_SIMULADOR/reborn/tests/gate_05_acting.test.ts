import { describe, it, before, after } from 'node:test';
import * as assert from 'node:assert';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseClient } from '../src/infra/database/DatabaseClient.js';
import { ActingDilemmaEngine } from '../src/core/acting/ActingDilemmaEngine.js';
import { GridCombatEngine } from '../src/core/combat/GridCombatEngine.js';
import { SeededRNG } from '../src/core/rng/SeededRNG.js';
import { GrimoireGSchema } from '../src/infra/content/schemas/lore.schema.js';
import { InvestigationEngine } from '../src/core/investigation/InvestigationEngine.js';
import { ProceduralInvestigationService } from '../src/core/investigation/ProceduralInvestigationService.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');

describe('GATE 05: Acting (El Método del Papel), Susurros [S], Ticks Semanales y Grimorio BOOK_002', () => {
  let db: DatabaseClient;
  const testCharId = 'char_acting_gate05_fool';

  before(() => {
    db = new DatabaseClient(':memory:');
    db.createCharacter({
      id: testCharId,
      name: 'Auditor de Vía Klein',
      pathway: 'FOOL',
      sequence: 9,
      current_health: 100,
      max_health: 100,
      current_spirituality: 100,
      max_spirituality: 100,
      sanity: 80,
      corruption: 0,
      digestion_progress: 10,
      raw_pence: 240,
      current_location: 'Cherwood',
      current_day: 1
    });
  });

  it('0a. Registro del Grimorio BOOK_002: "Las Sombras de Hornacis" (LORE_G validado)', () => {
    const grimoiresPath = path.join(ROOT_DIR, 'data/gameplay/lore/grimoires.json');
    assert.ok(fs.existsSync(grimoiresPath), 'grimoires.json debe existir en data/gameplay/lore/');

    const raw = JSON.parse(fs.readFileSync(grimoiresPath, 'utf8'));
    const books = Array.isArray(raw) ? raw : (raw.grimoires || [raw]);
    const book002 = books.find((b: any) => b.id === 'BOOK_002');
    assert.ok(book002, 'BOOK_002 debe estar presente en el compendio de grimorios');

    // Validación formal contra el esquema Zod LORE_G
    const parsed = GrimoireGSchema.parse(book002);
    assert.strictEqual(parsed.id, 'BOOK_002');
    assert.strictEqual(parsed.classification.risk_level, 'DANGEROUS');
    assert.strictEqual(parsed.reading_requirements.required_sequence, 7);
    assert.strictEqual(parsed.canonConfidence, 'library');
    assert.strictEqual(parsed.directorApproved, true);
    assert.ok(parsed.pathway_affinities.includes('FOOL'));
    assert.strictEqual(parsed.sections[0].relatedCase, 'CASE_CHERWOOD_HEIRLOOM', 'Debe estar vinculado al Caso #1 de Sterling en su sección');
  });

  it('0b. Chore Casos Menores: Parámetros desde 39 NPCs de npc_weeks.json con variación estricta', () => {
    // Corrida 1
    const run1 = InvestigationEngine.generateMinorCase(db, testCharId, 1);
    // Corrida 2
    const run2 = InvestigationEngine.generateMinorCase(db, testCharId, 2);

    // 1. IDs comienzan con prefijo CASE_MINOR_ (o case_minor_) y difieren
    assert.ok(run1.caseId.toLowerCase().startsWith('case_minor_'));
    assert.ok(run2.caseId.toLowerCase().startsWith('case_minor_'));
    assert.notStrictEqual(run1.caseId, run2.caseId, 'Dos corridas consecutivas deben tener IDs distintos');

    // 2. Culpables distintos
    assert.notStrictEqual(run1.culpritNpcId, run2.culpritNpcId, 'Dos corridas consecutivas deben tener culpables distintos');
    assert.notStrictEqual(run1.culpritName, run2.culpritName);

    // 3. Al menos 2 fuentes de pistas difieren entre sí
    let differentSources = 0;
    const maxClues = Math.min(run1.clues.length, run2.clues.length);
    for (let i = 0; i < maxClues; i++) {
      if (run1.clues[i].source !== run2.clues[i].source) {
        differentSources++;
      }
    }
    assert.ok(differentSources >= 2, `Al menos 2 fuentes deben diferir (Diferentes encontradas: ${differentSources})`);

    // 4. CASE_CHERWOOD_HEIRLOOM queda reservado y jamás es generado como caso menor
    assert.notStrictEqual(run1.caseId, 'CASE_CHERWOOD_HEIRLOOM');
    assert.notStrictEqual(run2.caseId, 'CASE_CHERWOOD_HEIRLOOM');
  });

  it('2a. Gate de No-Telegrafiado: Payload de cliente estrictamente desprovisto de scoring y pesos', () => {
    const dilemmas = ActingDilemmaEngine.getAvailableDilemmas(db, testCharId);
    assert.ok(dilemmas.length > 0, 'Debe haber dilemas disponibles para FOOL S9');

    const forbiddenFields = [
      'pesos',
      'alignment',
      'actingWeight',
      'effectKey',
      'tradeOffs',
      'isAlignedWithPrinciple',
      'digestionGain'
    ];

    for (const d of dilemmas) {
      assert.ok(d.id, 'Dilema debe tener id');
      assert.ok(d.title, 'Dilema debe tener título');
      assert.ok(d.situation, 'Dilema debe tener situación narrativa');

      for (const opt of d.options) {
        assert.ok(opt.id, 'Opción debe tener id');
        assert.ok(opt.texto, 'Opción debe tener texto descriptivo');
        assert.ok(opt.costes !== undefined, 'Opción debe declarar costes visibles');

        // Comprobación exhaustiva de no-telegrafiado
        for (const forbidden of forbiddenFields) {
          assert.strictEqual(
            (opt as any)[forbidden],
            undefined,
            `El campo telegrafiado '${forbidden}' no debe estar presente en el payload del cliente!`
          );
        }
      }
    }
  });

  it('2b. Gate de Farmeo: Misma opción x5 produce decaimiento marginal (x1, x0.5, x0.25, x0.1, 0) y Total != 5x Base', () => {
    const farmCharId = 'char_acting_farm_tester';
    db.createCharacter({
      id: farmCharId,
      name: 'Farmero de Actuación',
      pathway: 'FOOL',
      sequence: 9,
      current_health: 100,
      max_health: 100,
      current_spirituality: 100,
      max_spirituality: 100,
      sanity: 80,
      corruption: 0,
      digestion_progress: 0,
      raw_pence: 100,
      current_location: 'Cherwood',
      current_day: 1
    });

    const dilemmaId = 'DIL_FOOL_9_1';
    const choiceId = 'CHOICE_FOOL_9_TRUTH';

    const results = [];
    for (let i = 0; i < 5; i++) {
      const res = ActingDilemmaEngine.resolveDilemma(db, farmCharId, dilemmaId, choiceId);
      results.push(res);
    }

    // Comprobación de decaimientos marginales exactos
    assert.strictEqual(results[0].decayApplied, 1.0, 'Intento 1: multiplicador 1.0');
    assert.strictEqual(results[1].decayApplied, 0.5, 'Intento 2: multiplicador 0.5');
    assert.strictEqual(results[2].decayApplied, 0.25, 'Intento 3: multiplicador 0.25');
    assert.strictEqual(results[3].decayApplied, 0.1, 'Intento 4: multiplicador 0.1');
    assert.strictEqual(results[4].decayApplied, 0.0, 'Intento 5: multiplicador 0.0');

    // Ganancia de digestión acumulada
    const totalDigestionGained = results.reduce((acc, r) => acc + r.digestionGained, 0);
    const baseDigestion = 20.0; // SEER_TRUTH_RIGOR
    const expectedTotal = baseDigestion * (1.0 + 0.5 + 0.25 + 0.1 + 0.0); // 20 * 1.85 = 37.0

    assert.strictEqual(Number(totalDigestionGained.toFixed(1)), expectedTotal);
    assert.notStrictEqual(totalDigestionGained, 5 * baseDigestion, 'El total acumulado NO debe ser 5x base (Gate anti-exploit)');
  });

  it('2c. Gate de Transgresión: Alineamiento negativo (-1) x3 produce incremento medible de corrupción', () => {
    const transgressorId = 'char_acting_transgressor';
    db.createCharacter({
      id: transgressorId,
      name: 'Vidente Hereje Transgresor',
      pathway: 'FOOL',
      sequence: 9,
      current_health: 100,
      max_health: 100,
      current_spirituality: 100,
      max_spirituality: 100,
      sanity: 80,
      corruption: 5,
      digestion_progress: 0,
      raw_pence: 100,
      current_location: 'Cherwood',
      current_day: 1
    });

    const initialChar = db.getCharacter(transgressorId);
    assert.strictEqual(initialChar.corruption, 5);

    // Ejecutar 3 opciones transgresoras (alignment = -1)
    const res1 = ActingDilemmaEngine.resolveDilemma(db, transgressorId, 'DIL_FOOL_9_1', 'CHOICE_FOOL_9_LIE');
    assert.strictEqual(res1.alignment, -1);
    assert.strictEqual(res1.corruptionDelta, 3);

    const res2 = ActingDilemmaEngine.resolveDilemma(db, transgressorId, 'DIL_FOOL_9_1', 'CHOICE_FOOL_9_LIE');
    assert.strictEqual(res2.alignment, -1);
    assert.strictEqual(res2.corruptionDelta, 3);

    const res3 = ActingDilemmaEngine.resolveDilemma(db, transgressorId, 'DIL_FOOL_9_1', 'CHOICE_FOOL_9_LIE');
    assert.strictEqual(res3.alignment, -1);
    assert.strictEqual(res3.corruptionDelta, 3);

    const afterChar = db.getCharacter(transgressorId);
    const corruptionDelta = afterChar.corruption - initialChar.corruption;
    assert.strictEqual(corruptionDelta, 9, '3 transgresiones deben generar un delta medible de +9 corrupción');
  });

  it('2d. Gate de Variedad: Monocategoría vs Semana Variada produce penalizador y delta en Coherencia', () => {
    // 1. Monocategoría (mismo antiExploit.variety en toda la semana)
    const monoCharId = 'char_acting_mono_week';
    db.createCharacter({
      id: monoCharId,
      name: 'Actor Monocategoría',
      pathway: 'FOOL',
      sequence: 9,
      current_health: 100,
      max_health: 100,
      current_spirituality: 100,
      max_spirituality: 100,
      sanity: 80,
      corruption: 0,
      digestion_progress: 0,
      raw_pence: 100,
      current_location: 'Cherwood',
      current_day: 1
    });

    // 3 resoluciones del mismo dilema (TAROT_TRUTH_VS_DECEIT)
    ActingDilemmaEngine.resolveDilemma(db, monoCharId, 'DIL_FOOL_9_1', 'CHOICE_FOOL_9_TRUTH');
    ActingDilemmaEngine.resolveDilemma(db, monoCharId, 'DIL_FOOL_9_1', 'CHOICE_FOOL_9_TRUTH');
    ActingDilemmaEngine.resolveDilemma(db, monoCharId, 'DIL_FOOL_9_1', 'CHOICE_FOOL_9_TRUTH');

    const monoTick = ActingDilemmaEngine.processWeeklyTick(db, monoCharId);
    assert.strictEqual(monoTick.varietyPenalty, 0.40, 'Semana monocategoría debe recibir 40% de penalizador de variedad');

    // 2. Semana Variada (múltiples categorías de dilemas)
    const variedCharId = 'char_acting_varied_week';
    db.createCharacter({
      id: variedCharId,
      name: 'Actor Variado Equilibrado',
      pathway: 'FOOL',
      sequence: 9,
      current_health: 100,
      max_health: 100,
      current_spirituality: 100,
      max_spirituality: 100,
      sanity: 80,
      corruption: 0,
      digestion_progress: 0,
      raw_pence: 100,
      current_location: 'Cherwood',
      current_day: 1
    });

    // 3 dilemas con categorías de variedad distintas
    ActingDilemmaEngine.resolveDilemma(db, variedCharId, 'DIL_FOOL_9_1', 'CHOICE_FOOL_9_TRUTH');
    ActingDilemmaEngine.resolveDilemma(db, variedCharId, 'DIL_FOOL_9_2', 'CHOICE_FOOL_9_DOWSING_PUBLIC');
    ActingDilemmaEngine.resolveDilemma(db, variedCharId, 'DIL_FOOL_9_3', 'CHOICE_FOOL_9_SPIRIT_VISION_ACTIVE');

    const variedTick = ActingDilemmaEngine.processWeeklyTick(db, variedCharId);
    assert.strictEqual(variedTick.varietyPenalty, 0.0, 'Semana variada no debe recibir penalizador de variedad');

    // La coherencia variada debe ser significativamente mayor
    assert.ok(
      variedTick.coherence > monoTick.coherence,
      `Coherencia variada (${variedTick.coherence}) debe superar a monocategoría (${monoTick.coherence})`
    );
  });

  it('2e. Gate [S] Susurros: Opciones corruptas se ocultan con corrupción < 30 y emergen con corrupción >= 30', () => {
    const whisperCharId = 'char_acting_whisper_tester';
    db.createCharacter({
      id: whisperCharId,
      name: 'Candidato a la Corrupción',
      pathway: 'FOOL',
      sequence: 9,
      current_health: 100,
      max_health: 100,
      current_spirituality: 100,
      max_spirituality: 100,
      sanity: 80,
      corruption: 25, // < 30
      digestion_progress: 0,
      raw_pence: 100,
      current_location: 'Cherwood',
      current_day: 1
    });

    // 1. Con corrupción 25 (< 30), el susurro no debe estar en el payload
    const dilemmasClean = ActingDilemmaEngine.getAvailableDilemmas(db, whisperCharId);
    const dilFoolClean = dilemmasClean.find(d => d.id === 'DIL_FOOL_9_1');
    assert.ok(dilFoolClean);
    const hasWhisperClean = dilFoolClean.options.some(o => o.id === 'CHOICE_FOOL_9_WHISPER_FOG' || o.isWhisper);
    assert.strictEqual(hasWhisperClean, false, 'Con corrupción < 30 no deben emerger susurros');

    // 2. Incrementar corrupción a 32 (>= 30)
    db.updateCharacterSomatics(whisperCharId, { corruption: 32 });

    const dilemmasCorrupt = ActingDilemmaEngine.getAvailableDilemmas(db, whisperCharId);
    const dilFoolCorrupt = dilemmasCorrupt.find(d => d.id === 'DIL_FOOL_9_1');
    assert.ok(dilFoolCorrupt);
    const whisperOption = dilFoolCorrupt.options.find(o => o.id === 'CHOICE_FOOL_9_WHISPER_FOG');
    assert.ok(whisperOption, 'Con corrupción >= 30 la opción [S] CHOICE_FOOL_9_WHISPER_FOG debe inyectarse en el cliente');
    assert.strictEqual(whisperOption.isWhisper, true);
    assert.ok(whisperOption.texto.includes('[SUSURRO DE LA NIEBLA]'));
  });

  it('2f. Gate de Misfire: Instabilidad espiritual activa causa fallos medibles de habilidades en combate', () => {
    const combatEngine = GridCombatEngine.getInstance();
    const rng = new SeededRNG(98765);

    // Caso 1: Combatiente con hasInstability = true (50 acciones SKILL)
    let misfiresWithInstability = 0;
    const totalRuns = 50;

    for (let i = 0; i < totalRuns; i++) {
      const battle = combatEngine.createBattle(
        `battle_unstable_${i}`,
        {
          id: 'char_unstable_tester',
          name: 'Beyonder Inestable',
          pathway: 'FOOL',
          sequence: 8,
          hp: 100,
          maxHp: 100,
          spirituality: 500,
          maxSpirituality: 500,
          hasInstability: true
        },
        {
          id: 'spinal_octopus',
          name: 'Spinal Octopus',
          hp: 45,
          maxHp: 45
        },
        'PLAYER_AMBUSH'
      );

      const res = combatEngine.executePlayerAction(
        battle,
        {
          type: 'SKILL',
          skillId: 'PLAYER_FOOL_8_STAGE_PERFORMANCE'
        },
        rng
      );

      if (res.message.includes('¡Fallo por Inestabilidad Espiritual!')) {
        misfiresWithInstability++;
      }
    }

    // Caso 2: Combatiente estable con hasInstability = false (50 acciones SKILL)
    let misfiresStable = 0;
    for (let i = 0; i < totalRuns; i++) {
      const battle = combatEngine.createBattle(
        `battle_stable_${i}`,
        {
          id: 'char_stable_tester',
          name: 'Beyonder Estable',
          pathway: 'FOOL',
          sequence: 8,
          hp: 100,
          maxHp: 100,
          spirituality: 500,
          maxSpirituality: 500,
          hasInstability: false
        },
        {
          id: 'spinal_octopus',
          name: 'Spinal Octopus',
          hp: 45,
          maxHp: 45
        },
        'PLAYER_AMBUSH'
      );

      const res = combatEngine.executePlayerAction(
        battle,
        {
          type: 'SKILL',
          skillId: 'PLAYER_FOOL_8_STAGE_PERFORMANCE'
        },
        rng
      );

      if (res.message.includes('¡Fallo por Inestabilidad Espiritual!')) {
        misfiresStable++;
      }
    }

    assert.strictEqual(misfiresStable, 0, 'Combatiente estable no debe sufrir misfires (0%)');
    assert.ok(
      misfiresWithInstability >= 8 && misfiresWithInstability <= 30,
      `Combatiente inestable debe sufrir misfires medibles (~35%, obtenidos: ${misfiresWithInstability}/${totalRuns})`
    );
  });

  it('2g. Gate Kill -9 Recovery: Persistencia SQLite de acting_records y weekly state restaura estado byte-equivalente', () => {
    const dbPath = path.join(ROOT_DIR, 'test_acting_kill9.db');
    if (fs.existsSync(dbPath)) {
      try { fs.unlinkSync(dbPath); } catch (_) {}
    }

    let dbA: DatabaseClient | null = null;
    let dbB: DatabaseClient | null = null;

    try {
      // 1. Proceso A: Registrar actuaciones y estado semanal en SQLite físico
      dbA = new DatabaseClient(dbPath);
      const charId = 'char_kill9_acting_survivor';
      dbA.createCharacter({
        id: charId,
        name: 'Superviviente al Crash',
        pathway: 'VISIONARY',
        sequence: 9,
        current_health: 100,
        max_health: 100,
        current_spirituality: 100,
        max_spirituality: 100,
        sanity: 90,
        corruption: 0,
        digestion_progress: 15,
        raw_pence: 500,
        current_location: 'Cherwood',
        current_day: 3
      });

      ActingDilemmaEngine.resolveDilemma(dbA, charId, 'DIL_VISIONARY_9_1', 'CHOICE_SPECTATOR_9_OBSERVE');
      ActingDilemmaEngine.resolveDilemma(dbA, charId, 'DIL_VISIONARY_9_2', 'CHOICE_SPECTATOR_9_ANALYZE_PANIC');

      const tickA = ActingDilemmaEngine.processWeeklyTick(dbA, charId);
      const recordsBeforeCrash = dbA.getActingRecords(charId);
      const weeklyStateBeforeCrash = dbA.getActingWeeklyState(charId);

      // Simular terminación abrupta (Kill -9)
      dbA.close();
      dbA = null;

      // 2. Proceso B: Reinicio en frío conectando a la misma base de datos
      dbB = new DatabaseClient(dbPath);
      const recordsAfterRecovery = dbB.getActingRecords(charId);
      const weeklyStateAfterRecovery = dbB.getActingWeeklyState(charId);

      assert.strictEqual(recordsAfterRecovery.length, recordsBeforeCrash.length);
      assert.strictEqual(recordsAfterRecovery[0].choice_id, recordsBeforeCrash[0].choice_id);
      assert.strictEqual(recordsAfterRecovery[0].alignment, recordsBeforeCrash[0].alignment);
      assert.strictEqual(recordsAfterRecovery[0].acting_weight, recordsBeforeCrash[0].acting_weight);
      assert.strictEqual(recordsAfterRecovery[0].decay_applied, recordsBeforeCrash[0].decay_applied);

      assert.ok(weeklyStateAfterRecovery);
      assert.strictEqual(weeklyStateAfterRecovery?.coherence, weeklyStateBeforeCrash?.coherence);
      assert.strictEqual(weeklyStateAfterRecovery?.variety_penalty, weeklyStateBeforeCrash?.variety_penalty);
      assert.strictEqual(weeklyStateAfterRecovery?.instability_flag, weeklyStateBeforeCrash?.instability_flag);
      assert.strictEqual(weeklyStateAfterRecovery?.loss_of_self_risk_flag, weeklyStateBeforeCrash?.loss_of_self_risk_flag);

      dbB.close();
      dbB = null;
    } finally {
      if (dbA) { try { (dbA as any).close(); } catch (_) {} }
      if (dbB) { try { (dbB as any).close(); } catch (_) {} }
      if (fs.existsSync(dbPath)) {
        try { fs.unlinkSync(dbPath); } catch (_) {}
      }
    }
  });
});
