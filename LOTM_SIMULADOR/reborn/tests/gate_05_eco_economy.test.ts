import { describe, it, before } from 'node:test';
import * as assert from 'node:assert';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseClient } from '../src/infra/database/DatabaseClient.js';
import { ActingDilemmaEngine } from '../src/core/acting/ActingDilemmaEngine.js';
import { InvestigationEngine } from '../src/core/investigation/InvestigationEngine.js';
import { ProceduralInvestigationService } from '../src/core/investigation/ProceduralInvestigationService.js';
import { ActingBalanceSchema } from '../src/infra/content/schemas/actingBalance.schema.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');

describe('GATE 05.ECO: La Constitución de la Digestión y Gate de Economía de Bots', () => {
  let db: DatabaseClient;

  before(() => {
    db = new DatabaseClient(':memory:');
  });

  it('1. Balance Centralizado: acting.json es válido y provee todas las constantes', () => {
    const actingPath = path.join(ROOT_DIR, 'data/gameplay/balance/acting.json');
    assert.ok(fs.existsSync(actingPath), 'acting.json debe existir en balance/');

    const raw = JSON.parse(fs.readFileSync(actingPath, 'utf8'));
    const parsed = ActingBalanceSchema.parse(raw);

    assert.strictEqual(parsed.schema_version, '1.0');
    assert.strictEqual(parsed.window_acts_cap_k, 3.5);
    assert.strictEqual(parsed.assimilation_multiplier, 34.0);
    assert.strictEqual(parsed.stagnation_threshold, 0.35);
    assert.strictEqual(parsed.overacting_threshold, 1.0);
    assert.strictEqual(parsed.variety_penalty, 0.40);
    assert.strictEqual(parsed.misfire_chance, 35);
    assert.strictEqual(parsed.transgression_corruption, 3);
    assert.deepStrictEqual(parsed.decay_ladder, [1.0, 0.5, 0.25, 0.1, 0.0]);
    assert.strictEqual(parsed.verdicts.major_case.acting_weight, 2.5);
    assert.strictEqual(parsed.verdicts.minor_case.acting_weight, 1.8);
  });

  it('2. Un Escritor: El tick semanal es el ÚNICO escritor de la digestión', () => {
    const charId = 'char_single_writer_test';
    db.createCharacter({
      id: charId,
      name: 'Klein Escritor Único',
      pathway: 'FOOL',
      sequence: 9,
      current_health: 100,
      max_health: 100,
      current_spirituality: 100,
      max_spirituality: 100,
      sanity: 80,
      corruption: 0,
      digestion_progress: 10.0,
      raw_pence: 200,
      current_location: 'Cherwood',
      current_day: 1
    });

    // a. Dilema no otorga digestión directa
    const dilRes = ActingDilemmaEngine.resolveDilemma(db, charId, 'DIL_FOOL_9_1', 'CHOICE_FOOL_9_TRUTH');
    assert.strictEqual(dilRes.digestionGained, 0);
    let char = db.getCharacter(charId);
    assert.strictEqual(char?.digestion_progress, 10.0, 'Dilema no altera digestión_progress');

    // b. Pistas de investigación no otorgan digestión directa
    const minorCase = ProceduralInvestigationService.generateCaseForCharacter(db, charId, 1);
    const clues = db.getCaseClues(minorCase.caseId);
    const clueRes = ProceduralInvestigationService.investigateClue(db, minorCase.caseId, clues[0].id, 'FOOL', 'SPIRITUAL_DIVINATION');
    assert.strictEqual(clueRes.digestionBonus, 0);
    char = db.getCharacter(charId);
    assert.strictEqual(char?.digestion_progress, 10.0, 'Pista no altera digestión_progress');

    // c. Veredicto no otorga digestión directa, genera entrada actoral
    const verdRes = ProceduralInvestigationService.resolveVerdict(db, charId, minorCase.caseId, 'SCOTLAND_YARD');
    assert.strictEqual(verdRes.digestionBonus, 0);
    char = db.getCharacter(charId);
    assert.strictEqual(char?.digestion_progress, 10.0, 'Veredicto no altera digestión_progress de forma directa');

    const records = db.getActingRecords(charId);
    const verdictRecord = records.find(r => r.dilemma_id === `VERDICT_${minorCase.caseId}`);
    assert.ok(verdictRecord, 'El veredicto debe registrarse en acting_records para la ventana semanal');
    assert.strictEqual(verdictRecord.acting_weight, 1.8);

    // d. El tick semanal es el ÚNICO escritor
    const tick = ActingDilemmaEngine.processWeeklyTick(db, charId);
    assert.ok(tick.assimilationGain > 0, 'El tick semanal debe generar asimilación');
    char = db.getCharacter(charId);
    assert.strictEqual(
      char?.digestion_progress,
      Number((10.0 + tick.assimilationGain).toFixed(1)),
      'Solo el tick semanal modifica digestion_progress'
    );
  });

  it('3. Regla de Transgresión: +3 corrupción inmediata y SIN entrada en la ventana actoral', () => {
    const transCharId = 'char_transgression_eco_test';
    db.createCharacter({
      id: transCharId,
      name: 'Transgresor Somático',
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

    const res = ActingDilemmaEngine.resolveDilemma(db, transCharId, 'DIL_FOOL_9_1', 'CHOICE_FOOL_9_LIE');
    assert.strictEqual(res.alignment, -1);
    assert.strictEqual(res.corruptionDelta, 3);

    const char = db.getCharacter(transCharId);
    assert.strictEqual(char?.corruption, 8, 'Corrupción aumenta +3 inmediatamente en Somatics');

    const records = db.getActingRecords(transCharId);
    assert.strictEqual(records.length, 0, 'La transgresión NO genera entrada en acting_records / ventana semanal');

    const tick = ActingDilemmaEngine.processWeeklyTick(db, transCharId);
    assert.strictEqual(tick.transgressionCorruptionGain, 0, 'Eliminado el +2 semanal no ordenado');
    assert.strictEqual(tick.coherence, 0, 'Coherencia es 0 sin actos válidos');
  });

  it('4. Gate de Economía Bot 1: "Comprometido" (4 dilemas FOOL S9 + Caso Mayor #1 + 2 menores en 3 semanas) -> Banda 90-110', () => {
    const cId = 'bot_comp_gate';
    db.createCharacter({
      id: cId,
      name: 'Bot Comprometido',
      pathway: 'FOOL',
      sequence: 9,
      current_health: 100,
      max_health: 100,
      current_spirituality: 100,
      max_spirituality: 100,
      sanity: 100,
      corruption: 0,
      digestion_progress: 0,
      raw_pence: 1000,
      current_location: 'Cherwood',
      current_day: 1
    });

    // SEMANA 1: 2 dilemas FOOL S9 + 1 caso menor
    ActingDilemmaEngine.resolveDilemma(db, cId, 'DIL_FOOL_9_1', 'CHOICE_FOOL_9_TRUTH');
    ActingDilemmaEngine.resolveDilemma(db, cId, 'DIL_FOOL_9_2', 'CHOICE_FOOL_9_DOWSING_PUBLIC');
    const m1 = ProceduralInvestigationService.generateCaseForCharacter(db, cId, 1);
    ProceduralInvestigationService.resolveVerdict(db, cId, m1.caseId, 'SCOTLAND_YARD');
    const t1 = ActingDilemmaEngine.processWeeklyTick(db, cId);

    // SEMANA 2: 1 dilema FOOL S9 + Veredicto Caso Mayor #1 "El Eco en el Nido Vacío"
    db.updateCharacterSomatics(cId, { spirituality: 100 });
    db.advanceCharacterDay(cId, 7); // Día 8
    ActingDilemmaEngine.resolveDilemma(db, cId, 'DIL_FOOL_9_3', 'CHOICE_FOOL_9_SPIRIT_VISION_ACTIVE');
    const caseState = InvestigationEngine.activateCase(db, cId, 'CASE_CHERWOOD_HEIRLOOM');
    InvestigationEngine.pendulumDowsing(db, caseState.id, 'CLUE_CONCEALED_SAFE');
    InvestigationEngine.visitClueSource(db, caseState.id, { clueId: 'CLUE_CONCEALED_SAFE', sourceIndex: 0 });
    InvestigationEngine.submitHypothesis(db, caseState.id, 'HYPOTHESIS_TRUE_NETWORK');
    InvestigationEngine.resolveCase(db, caseState.id, 'RESOLUTION_A_JUSTICE');
    const t2 = ActingDilemmaEngine.processWeeklyTick(db, cId);

    // SEMANA 3: 1 dilema FOOL S9 + 1 caso menor
    db.updateCharacterSomatics(cId, { spirituality: 100 });
    db.advanceCharacterDay(cId, 7); // Día 15
    ActingDilemmaEngine.resolveDilemma(db, cId, 'DIL_FOOL_9_4', 'CHOICE_FOOL_9_CARDS_SOLEMN');
    const m2 = ProceduralInvestigationService.generateCaseForCharacter(db, cId, 2);
    ProceduralInvestigationService.resolveVerdict(db, cId, m2.caseId, 'SCOTLAND_YARD');
    const t3 = ActingDilemmaEngine.processWeeklyTick(db, cId);

    const finalChar = db.getCharacter(cId);
    const totalAssimilationRaw = Number((t1.assimilationGain + t2.assimilationGain + t3.assimilationGain).toFixed(1));

    console.log(`[GATE_05_ECO] Bot Comprometido: Sem 1=${t1.assimilationGain} (Coh: ${t1.coherence}), Sem 2=${t2.assimilationGain} (Coh: ${t2.coherence}), Sem 3=${t3.assimilationGain} (Coh: ${t3.coherence}) | Total Raw: ${totalAssimilationRaw} | DB Clamped: ${finalChar?.digestion_progress}`);

    assert.ok(totalAssimilationRaw >= 90.0 && totalAssimilationRaw <= 110.0, `Digestión bruta (${totalAssimilationRaw}) debe situarse en la banda 90-110`);
    assert.strictEqual(finalChar?.digestion_progress, 100.0, 'Digestión en base de datos alcanza el tope canónico de 100.0');
    assert.ok(t1.coherence > 1.0 || t2.coherence > 1.0, 'La sobre-actuación (>1.0) debe ser alcanzable en simulación');
  });

  it('5. Gate de Economía Bot 2: "Holgazán" (1 acto/semana en 3 semanas) -> Digestión < 40', () => {
    const hId = 'bot_lazy_gate';
    db.createCharacter({
      id: hId,
      name: 'Bot Holgazan',
      pathway: 'FOOL',
      sequence: 9,
      current_health: 100,
      max_health: 100,
      current_spirituality: 100,
      max_spirituality: 100,
      sanity: 100,
      corruption: 0,
      digestion_progress: 0,
      raw_pence: 1000,
      current_location: 'Cherwood',
      current_day: 1
    });

    // Semana 1: 1 acto
    ActingDilemmaEngine.resolveDilemma(db, hId, 'DIL_FOOL_9_1', 'CHOICE_FOOL_9_TRUTH');
    const ht1 = ActingDilemmaEngine.processWeeklyTick(db, hId);

    // Semana 2: 1 acto
    db.advanceCharacterDay(hId, 7);
    ActingDilemmaEngine.resolveDilemma(db, hId, 'DIL_FOOL_9_2', 'CHOICE_FOOL_9_DOWSING_PUBLIC');
    const ht2 = ActingDilemmaEngine.processWeeklyTick(db, hId);

    // Semana 3: 1 acto
    db.advanceCharacterDay(hId, 7);
    ActingDilemmaEngine.resolveDilemma(db, hId, 'DIL_FOOL_9_3', 'CHOICE_FOOL_9_SPIRIT_VISION_ACTIVE');
    const ht3 = ActingDilemmaEngine.processWeeklyTick(db, hId);

    const finalLazy = db.getCharacter(hId);
    const totalLazyAssim = Number((ht1.assimilationGain + ht2.assimilationGain + ht3.assimilationGain).toFixed(1));

    console.log(`[GATE_05_ECO] Bot Holgazán: Sem 1=${ht1.assimilationGain}, Sem 2=${ht2.assimilationGain}, Sem 3=${ht3.assimilationGain} | Total: ${totalLazyAssim} | DB: ${finalLazy?.digestion_progress}`);

    assert.ok(totalLazyAssim < 40.0, `Digestión de Holgazán (${totalLazyAssim}) debe ser estrictamente < 40 en 3 semanas`);
    assert.ok((finalLazy?.digestion_progress ?? 0) < 40.0);
  });

  it('6. Gate de Economía Bot 3: "Farmeador" (mismo dilema x5/semana) -> Digestión < 60% del lineal', () => {
    // 1. Farmeador (mismo dilema x5)
    const fId = 'bot_farmer_gate';
    db.createCharacter({
      id: fId,
      name: 'Bot Farmeador',
      pathway: 'FOOL',
      sequence: 9,
      current_health: 100,
      max_health: 100,
      current_spirituality: 100,
      max_spirituality: 100,
      sanity: 100,
      corruption: 0,
      digestion_progress: 0,
      raw_pence: 1000,
      current_location: 'Cherwood',
      current_day: 1
    });

    for (let i = 0; i < 5; i++) {
      ActingDilemmaEngine.resolveDilemma(db, fId, 'DIL_FOOL_9_1', 'CHOICE_FOOL_9_TRUTH');
    }
    const farmTick = ActingDilemmaEngine.processWeeklyTick(db, fId);

    // 2. Linear (5 actos distintos)
    const lId = 'bot_linear_gate';
    db.createCharacter({
      id: lId,
      name: 'Bot Linear',
      pathway: 'FOOL',
      sequence: 9,
      current_health: 100,
      max_health: 100,
      current_spirituality: 100,
      max_spirituality: 100,
      sanity: 100,
      corruption: 0,
      digestion_progress: 0,
      raw_pence: 1000,
      current_location: 'Cherwood',
      current_day: 1
    });

    ActingDilemmaEngine.resolveDilemma(db, lId, 'DIL_FOOL_9_1', 'CHOICE_FOOL_9_TRUTH');
    ActingDilemmaEngine.resolveDilemma(db, lId, 'DIL_FOOL_9_2', 'CHOICE_FOOL_9_DOWSING_PUBLIC');
    ActingDilemmaEngine.resolveDilemma(db, lId, 'DIL_FOOL_9_3', 'CHOICE_FOOL_9_SPIRIT_VISION_ACTIVE');
    ActingDilemmaEngine.resolveDilemma(db, lId, 'DIL_FOOL_9_4', 'CHOICE_FOOL_9_CARDS_SOLEMN');
    const lm = ProceduralInvestigationService.generateCaseForCharacter(db, lId, 1);
    ProceduralInvestigationService.resolveVerdict(db, lId, lm.caseId, 'SCOTLAND_YARD');
    const linearTick = ActingDilemmaEngine.processWeeklyTick(db, lId);

    const ratioPercent = Number((farmTick.assimilationGain / linearTick.assimilationGain * 100).toFixed(1));
    console.log(`[GATE_05_ECO] Bot Farmeador (${farmTick.assimilationGain}) vs Linear (${linearTick.assimilationGain}) -> Ratio: ${ratioPercent}%`);

    assert.ok(
      ratioPercent < 60.0,
      `Digestión del Farmeador (${farmTick.assimilationGain}) debe ser < 60% del lineal (${linearTick.assimilationGain}). Obtenido: ${ratioPercent}%`
    );
  });
});
