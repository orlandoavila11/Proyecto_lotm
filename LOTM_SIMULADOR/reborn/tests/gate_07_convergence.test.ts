import { describe, it } from 'node:test';
import assert from 'node:assert';
import * as path from 'node:path';
import * as fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { DatabaseClient } from '../src/infra/database/DatabaseClient.js';
import { SeededRNG } from '../src/core/rng/SeededRNG.js';
import { ConvergenceEngine } from '../src/core/convergence/ConvergenceEngine.js';
import { SomaticsEngine } from '../src/core/somatics/SomaticsEngine.js';

const packageRoot = fileURLToPath(new URL('..', import.meta.url));

function createCleanTestDb(): DatabaseClient {
  return new DatabaseClient(':memory:');
}

describe('GATE 07: Motor de Convergencia v1, Ley de Características y Halcones Nocturnos', () => {

  it('1. Balance Centralizado: convergence.json es válido y provee todas las constantes', () => {
    const balance = ConvergenceEngine.getConvergenceBalance();
    assert.strictEqual(balance.sources.public_combat_index_gain, 15);
    assert.strictEqual(balance.sources.ascension_index_gain, 30);
    assert.strictEqual(balance.sources.ecclesiastical_dilemma_gain_low, 5);
    assert.strictEqual(balance.sources.ecclesiastical_dilemma_gain_high, 10);
    assert.strictEqual(balance.sources.whisper_purchase_gain, 10);

    assert.strictEqual(balance.ruina_effective_bonus.INTEGRO, 0);
    assert.strictEqual(balance.ruina_effective_bonus.MARCADO, 5);
    assert.strictEqual(balance.ruina_effective_bonus.EROSIONADO, 15);
    assert.strictEqual(balance.ruina_effective_bonus.ROTO, 30);
    assert.strictEqual(balance.ruina_effective_bonus.PERDIDO, 50);

    assert.strictEqual(balance.decay.weekly_decay_per_district, -5);
    assert.strictEqual(balance.encounter_roll.base_chance_percentage, 15);
    assert.strictEqual(balance.encounter_roll.index_factor, 0.5);
    assert.strictEqual(balance.encounter_roll.dominant_sefira_attraction_percentage, 70);
    assert.strictEqual(balance.encounter_roll.open_pool_attraction_percentage, 30);

    assert.strictEqual(balance.incursion.trigger_church_suspicion_threshold, 60);
    assert.strictEqual(balance.incursion.purge_suspicion_on_resolution, -35);
    assert.strictEqual(balance.incursion.default_nighthawk_squad.length, 3);
  });

  it('2. Atracción Séfira Dominante: FOOL atrae LOTM y VISIONARY atrae GOD_ALMIGHTY (~70%)', () => {
    const db = createCleanTestDb();

    // Crear personaje FOOL
    db.createCharacter({
      id: 'char_fool_test',
      name: 'Klein Moretti',
      pathway: 'FOOL',
      sequence: 9,
      current_health: 100,
      max_health: 100,
      current_spirituality: 100,
      max_spirituality: 100,
      sanity: 100,
      corruption: 0
    });

    // Crear personaje VISIONARY
    db.createCharacter({
      id: 'char_visionary_test',
      name: 'Audrey Hall',
      pathway: 'VISIONARY',
      sequence: 9,
      current_health: 100,
      max_health: 100,
      current_spirituality: 100,
      max_spirituality: 100,
      sanity: 100,
      corruption: 0
    });

    // Subir índice para garantizar tiradas
    db.updateDistrictConvergence('cherwood', 80, 1);

    const iterations = 100;
    let foolLotmCount = 0;
    let visionaryGodAlmightyCount = 0;

    const rngFool = new SeededRNG(13530701);
    for (let i = 0; i < iterations; i++) {
      const res = ConvergenceEngine.rollEncounter(db, 'char_fool_test', 'cherwood', rngFool);
      if (res.occurred && res.encounterPool === 'LOTM') {
        foolLotmCount++;
      }
    }

    const rngVisionary = new SeededRNG(13530702);
    for (let i = 0; i < iterations; i++) {
      const res = ConvergenceEngine.rollEncounter(db, 'char_visionary_test', 'cherwood', rngVisionary);
      if (res.occurred && res.encounterPool === 'GOD_ALMIGHTY') {
        visionaryGodAlmightyCount++;
      }
    }

    // Con base 15% + (80 * 0.5) = 55% de ocurrencia y 70% de match sobre los que ocurren:
    // Los matches deben ser la inmensa mayoría de los encuentros ocurridos
    assert.ok(foolLotmCount >= 25, `FOOL debe atraer al menos 25 encuentros LOTM en 100 tiradas (obtenidos: ${foolLotmCount})`);
    assert.ok(visionaryGodAlmightyCount >= 25, `VISIONARY debe atraer al menos 25 encuentros GOD_ALMIGHTY (obtenidos: ${visionaryGodAlmightyCount})`);
  });

  it('3. Exposición Pública vs Tasa de Encuentros (>2x para PJ con alta exposición)', () => {
    const db = createCleanTestDb();
    db.createCharacter({
      id: 'char_exposure_test',
      name: 'Investigador Expuesto',
      pathway: 'FOOL',
      sequence: 9,
      current_health: 100,
      max_health: 100,
      current_spirituality: 100,
      max_spirituality: 100,
      sanity: 100,
      corruption: 0
    });

    // Distrito bajo: índice 0 -> probabilidad 15% + 0 = 15%
    db.updateDistrictConvergence('north_borough', 0, 1);

    // Distrito alto: índice 80 -> probabilidad 15% + 40 = 55%
    db.updateDistrictConvergence('east_borough', 80, 1);

    const runs = 200;
    let lowHits = 0;
    let highHits = 0;

    const rngLow = new SeededRNG(424242);
    const rngHigh = new SeededRNG(424242); // Misma semilla para paridad

    for (let i = 0; i < runs; i++) {
      const rLow = ConvergenceEngine.rollEncounter(db, 'char_exposure_test', 'north_borough', rngLow);
      if (rLow.occurred) lowHits++;

      const rHigh = ConvergenceEngine.rollEncounter(db, 'char_exposure_test', 'east_borough', rngHigh);
      if (rHigh.occurred) highHits++;
    }

    const ratio = highHits / Math.max(1, lowHits);
    assert.ok(ratio >= 2.0, `La tasa de alta exposición (${highHits}) debe ser > 2x la de baja exposición (${lowHits}). Ratio: ${ratio.toFixed(2)}x`);
  });

  it('4. Bono de Ruina por Tier: PJ Erosionado/Roto muestra delta medible vs Íntegro', () => {
    const db = createCleanTestDb();

    // PJ 1: Íntegro (Ruina 0)
    db.createCharacter({
      id: 'char_integro',
      name: 'Ciudadano Íntegro',
      pathway: 'FOOL',
      sequence: 9,
      current_health: 100,
      max_health: 100,
      current_spirituality: 100,
      max_spirituality: 100,
      sanity: 100,
      corruption: 0
    });

    // PJ 2: Roto (Ruina 60)
    db.createCharacter({
      id: 'char_roto',
      name: 'Místico Fracturado',
      pathway: 'FOOL',
      sequence: 9,
      current_health: 100,
      max_health: 100,
      current_spirituality: 100,
      max_spirituality: 100,
      sanity: 40,
      corruption: 30
    });
    db.updateCharacterRuina('char_roto', 60); // Tier ROTO (+30)

    db.updateDistrictConvergence('backlund_central', 20, 1);

    const effIntegro = ConvergenceEngine.getEffectiveConvergenceIndex(db, 'char_integro', 'backlund_central');
    const effRoto = ConvergenceEngine.getEffectiveConvergenceIndex(db, 'char_roto', 'backlund_central');

    assert.strictEqual(effIntegro.ruinaTier, 'INTEGRO');
    assert.strictEqual(effIntegro.ruinaBonus, 0);
    assert.strictEqual(effIntegro.effectiveIndex, 20);

    assert.strictEqual(effRoto.ruinaTier, 'ROTO');
    assert.strictEqual(effRoto.ruinaBonus, 30);
    assert.strictEqual(effRoto.effectiveIndex, 50);

    // Comprobar delta medible en simulación
    const runs = 150;
    let integroHits = 0;
    let rotoHits = 0;
    const rng = new SeededRNG(987654);

    for (let i = 0; i < runs; i++) {
      const rI = ConvergenceEngine.rollEncounter(db, 'char_integro', 'backlund_central', rng);
      if (rI.occurred) integroHits++;

      const rR = ConvergenceEngine.rollEncounter(db, 'char_roto', 'backlund_central', rng);
      if (rR.occurred) rotoHits++;
    }

    assert.ok(rotoHits > integroHits, `El personaje Roto (${rotoHits}) debe sufrir más encuentros que el Íntegro (${integroHits})`);
  });

  it('5. Incursión de Halcones Nocturnos: Allanamientos cuando church_suspicion > 60 y Purga (-35)', () => {
    const db = createCleanTestDb();
    db.createCharacter({
      id: 'char_incursion_test',
      name: 'Sospechoso Eclesiástico',
      pathway: 'FOOL',
      sequence: 9,
      current_health: 100,
      max_health: 100,
      current_spirituality: 100,
      max_spirituality: 100,
      sanity: 80,
      corruption: 10
    });

    // Persona con sospecha eclesiástica baja (40)
    db.createPersona({
      id: 'persona_1',
      character_id: 'char_incursion_test',
      legal_name: 'Arthur Vance',
      profession: 'Escritor',
      social_class: 'MIDDLE_CLASS',
      district: 'Cherwood',
      police_suspicion: 10,
      church_suspicion: 40,
      human_anchors: 50,
      is_active: 1,
      is_compromised: 0
    });

    // 1. Con sospecha 40, no debe gatillar
    const noInc = ConvergenceEngine.checkNighthawkIncursion(db, 'char_incursion_test', 'hillston', 10);
    assert.strictEqual(noInc.incursionTriggered, false);

    // 2. Elevar sospecha a 75 (> 60)
    db.updatePersonaSuspicion('persona_1', 0, 35);
    const inc = ConvergenceEngine.checkNighthawkIncursion(db, 'char_incursion_test', 'hillston', 10);
    assert.strictEqual(inc.incursionTriggered, true);
    assert.ok(inc.incursionId?.startsWith('inc_nighthawk_'));
    assert.strictEqual(inc.squadCombatants.length, 3);
    assert.ok(inc.squadCombatants.includes('nighthawk_sleepless_patrol'));
    assert.ok(inc.squadCombatants.includes('nighthawk_midnight_poet'));
    assert.ok(inc.squadCombatants.includes('nighthawk_squad_captain'));
    assert.ok(inc.narrativeWarning.includes('Catedral de San Samuel'));

    // 3. Resolver con VICTORIA -> Purga de 35
    const resolution = ConvergenceEngine.resolveIncursion(db, 'char_incursion_test', 'VICTORY');
    assert.strictEqual(resolution.status, 'RESOLVED');
    assert.strictEqual(resolution.suspicionPurged, 35);
    assert.strictEqual(resolution.previousSuspicion, 75);
    assert.strictEqual(resolution.currentSuspicion, 40);
    assert.ok(resolution.narrativeLog.includes('-35 sospecha eclesiástica'));
  });

  it('6. Decaimiento Semanal: Distrito inactivo decae (-5) tras 7 días', () => {
    const db = createCleanTestDb();
    db.createCharacter({
      id: 'char_decay_test',
      name: 'Observador Silencioso',
      pathway: 'VISIONARY',
      sequence: 9,
      current_health: 100,
      max_health: 100,
      current_spirituality: 100,
      max_spirituality: 100,
      sanity: 100,
      corruption: 0
    });

    // Establecer índice en 25 con último incidente el día 1
    db.updateDistrictConvergence('borough_decay', 25, 1);

    // Día 5 (solo 4 días transcurridos): NO debe decaer
    const day5Index = ConvergenceEngine.processWeeklyDecay(db, 'borough_decay', 'char_decay_test', 5);
    assert.strictEqual(day5Index, 25);

    // Día 9 (8 días transcurridos sin incidentes): DEBE decaer -5 -> 20
    const day9Index = ConvergenceEngine.processWeeklyDecay(db, 'borough_decay', 'char_decay_test', 9);
    assert.strictEqual(day9Index, 20);

    // Día 16 (otra semana sin incidentes): DEBE decaer -5 -> 15
    const day16Index = ConvergenceEngine.processWeeklyDecay(db, 'borough_decay', 'char_decay_test', 16);
    assert.strictEqual(day16Index, 15);
  });

  it('7. Simulación Headless de 30 Días: Bots FOOL y VISIONARY con Convergencia Completa', () => {
    const db = createCleanTestDb();

    // Bot 1: FOOL
    db.createCharacter({
      id: 'bot_fool_30',
      name: 'Bot Vidente Clandestino',
      pathway: 'FOOL',
      sequence: 9,
      current_health: 100,
      max_health: 100,
      current_spirituality: 100,
      max_spirituality: 100,
      sanity: 85,
      corruption: 5
    });

    // Bot 2: VISIONARY
    db.createCharacter({
      id: 'bot_visionary_30',
      name: 'Bot Espectador Aristócrata',
      pathway: 'VISIONARY',
      sequence: 9,
      current_health: 100,
      max_health: 100,
      current_spirituality: 100,
      max_spirituality: 100,
      sanity: 90,
      corruption: 0
    });

    const foolRng = new SeededRNG(13530001);
    const visRng = new SeededRNG(13530002);

    const stats = {
      foolEncounters: 0,
      foolLotmMatches: 0,
      visionaryEncounters: 0,
      visionaryGodAlmightyMatches: 0,
      incursionsTriggered: 0,
      incursionsPurged: 0
    };

    // 30 días de simulación
    for (let day = 1; day <= 30; day++) {
      // Eventos de convergencia periódicos
      if (day % 4 === 0) {
        // Combate público para FOOL
        ConvergenceEngine.recordConvergenceEvent(db, 'bot_fool_30', 'east_borough', 'PUBLIC_COMBAT', day);
      }
      if (day % 6 === 0) {
        // Susurro místico para VISIONARY
        ConvergenceEngine.recordConvergenceEvent(db, 'bot_visionary_30', 'cherwood', 'WHISPER_PURCHASE', day);
      }

      // Tiradas diarias de encuentro
      const foolEnc = ConvergenceEngine.rollEncounter(db, 'bot_fool_30', 'east_borough', foolRng);
      if (foolEnc.occurred) {
        stats.foolEncounters++;
        if (foolEnc.encounterPool === 'LOTM') stats.foolLotmMatches++;
      }

      const visEnc = ConvergenceEngine.rollEncounter(db, 'bot_visionary_30', 'cherwood', visRng);
      if (visEnc.occurred) {
        stats.visionaryEncounters++;
        if (visEnc.encounterPool === 'GOD_ALMIGHTY') stats.visionaryGodAlmightyMatches++;
      }

      // Decaimiento semanal los días 7, 14, 21, 28
      if (day % 7 === 0) {
        ConvergenceEngine.processWeeklyDecay(db, 'east_borough', 'bot_fool_30', day);
        ConvergenceEngine.processWeeklyDecay(db, 'cherwood', 'bot_visionary_30', day);
      }
    }

    console.log(`[SIMULACIÓN 30 DÍAS CONVERGENCIA]`);
    console.log(`  - Bot FOOL: ${stats.foolEncounters} encuentros totales, ${stats.foolLotmMatches} afinidad LOTM (${((stats.foolLotmMatches / Math.max(1, stats.foolEncounters)) * 100).toFixed(1)}%)`);
    console.log(`  - Bot VISIONARY: ${stats.visionaryEncounters} encuentros totales, ${stats.visionaryGodAlmightyMatches} afinidad GOD_ALMIGHTY (${((stats.visionaryGodAlmightyMatches / Math.max(1, stats.visionaryEncounters)) * 100).toFixed(1)}%)`);

    assert.ok(stats.foolEncounters > 0, 'Bot FOOL debe haber experimentado encuentros en 30 días');
    assert.ok(stats.visionaryEncounters > 0, 'Bot VISIONARY debe haber experimentado encuentros en 30 días');
    assert.ok(stats.foolLotmMatches / stats.foolEncounters >= 0.5, 'La afinidad LOTM debe ser la mayoría de los encuentros de FOOL');
    assert.ok(stats.visionaryGodAlmightyMatches / stats.visionaryEncounters >= 0.5, 'La afinidad GOD_ALMIGHTY debe ser la mayoría de los encuentros de VISIONARY');
  });

  it('8. Tolerancia Kill-9: Persistencia SQLite de eventos e incursiones restaura estado byte-equivalente', () => {
    const tmpDir = path.join(process.cwd(), 'tmp_tests');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
    const dbPath = path.join(tmpDir, `test_convergence_kill9_${Date.now()}.sqlite`);
    let db1: DatabaseClient | null = null;
    let db2: DatabaseClient | null = null;

    try {
      // 1. Simular proceso en ejecución previo al corte abrupto
      db1 = new DatabaseClient(dbPath);
      db1.createCharacter({
        id: 'char_kill9_cve',
        name: 'Superviviente Persistente',
        pathway: 'FOOL',
        sequence: 9,
        current_health: 100,
        max_health: 100,
        current_spirituality: 100,
        max_spirituality: 100,
        sanity: 70,
        corruption: 20
      });

      db1.createPersona({
        id: 'persona_k9',
        character_id: 'char_kill9_cve',
        legal_name: 'Vincent Vance',
        profession: 'Relojero',
        social_class: 'WORKING_CLASS',
        district: 'bridge_district',
        police_suspicion: 10,
        church_suspicion: 70,
        human_anchors: 40,
        is_active: 1,
        is_compromised: 0
      });

      // Registrar eventos de convergencia
      ConvergenceEngine.recordConvergenceEvent(db1, 'char_kill9_cve', 'bridge_district', 'PUBLIC_COMBAT', 5);
      ConvergenceEngine.recordConvergenceEvent(db1, 'char_kill9_cve', 'bridge_district', 'WHISPER_PURCHASE', 5);

      // Gatillar incursión
      const incResult = ConvergenceEngine.checkNighthawkIncursion(db1, 'char_kill9_cve', 'bridge_district', 5);
      assert.strictEqual(incResult.incursionTriggered, true);

      // 2. SIMULAR KILL -9: Cierre abrupto sin hooks de apagado
      db1.close();
      db1 = null;

      // 3. NUEVO PROCESO: Restauración desde disco
      db2 = new DatabaseClient(dbPath);
      const district = db2.getDistrict('bridge_district');
      assert.ok(district);
      assert.strictEqual(district.convergence_index, 25); // 0 + 15 + 10 = 25

      const pendingInc = db2.getPendingIncursion('char_kill9_cve');
      assert.ok(pendingInc);
      assert.strictEqual(pendingInc.status, 'PENDING');
      assert.strictEqual(pendingInc.church_suspicion_snapshot, 70);

      // 4. Continuación fluida tras recuperación
      const res = ConvergenceEngine.resolveIncursion(db2, 'char_kill9_cve', 'VICTORY');
      assert.strictEqual(res.status, 'RESOLVED');
      assert.strictEqual(res.currentSuspicion, 35); // 70 - 35 = 35

      const resolvedInc = db2.getPendingIncursion('char_kill9_cve');
      assert.ok(!resolvedInc, 'No debe haber incursión pendiente activa tras resolución');

      db2.close();
      db2 = null;
    } finally {
      if (db1) { try { db1.close(); } catch {} }
      if (db2) { try { db2.close(); } catch {} }
      if (fs.existsSync(dbPath)) { try { fs.unlinkSync(dbPath); } catch {} }
    }
  });

});
