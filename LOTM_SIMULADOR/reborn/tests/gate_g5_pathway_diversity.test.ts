import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { DatabaseClient } from '../src/infra/database/DatabaseClient.js';
import { InvestigationEngine } from '../src/core/investigation/InvestigationEngine.js';
import { SeededRNG } from '../src/core/rng/SeededRNG.js';

describe('GATE G5 · DIVERSIDAD DE VÍAS EN EL CASO #1 (FOOL vs VISIONARY)', () => {
  let db: DatabaseClient;

  beforeEach(() => {
    db = new DatabaseClient(':memory:');
  });

  it('1. Divergencia Estructural de Pistas entre FOOL y VISIONARY en Caso #1 (> 60%)', () => {
    const foolCharId = 'char_fool_g5_01';
    const visCharId = 'char_vis_g5_01';

    // 1. Crear personaje FOOL
    db.createCharacter({
      id: foolCharId,
      name: 'Sherlock Moriarty (FOOL)',
      pathway: 'FOOL',
      sequence: 9,
      current_health: 100,
      max_health: 100,
      current_spirituality: 100,
      max_spirituality: 100,
      sanity: 100,
      corruption: 0,
      digestion_progress: 25,
      raw_pence: 500,
      current_location: 'Cherwood',
      current_day: 1
    });

    // 2. Crear personaje VISIONARY
    db.createCharacter({
      id: visCharId,
      name: 'Audrey Hall (VISIONARY)',
      pathway: 'VISIONARY',
      sequence: 9,
      current_health: 100,
      max_health: 100,
      current_spirituality: 100,
      max_spirituality: 100,
      sanity: 100,
      corruption: 0,
      digestion_progress: 25,
      raw_pence: 2500,
      current_location: 'Cherwood',
      current_day: 1
    });

    // 3. Activar el Caso #1 "El Eco en el Nido Vacío" para ambos personajes
    const stateFool = InvestigationEngine.activateCase(db, foolCharId, 'CASE_CHERWOOD_HEIRLOOM');
    const stateVis = InvestigationEngine.activateCase(db, visCharId, 'CASE_CHERWOOD_HEIRLOOM');

    // --- ACCIONES DEL BOT FOOL (Vía del Loco: Esotérico / Péndulo / Hilos Espirituales) ---
    // a. Pista pública (inicialmente descubierta): CLUE_BURNED_TOYS
    // b. Pista Esotérica exclusiva de FOOL: CLUE_ASTROLOGY_RECORD (Hilos del Cuerpo Espiritual)
    const foolClueAstro = InvestigationEngine.visitClueSource(db, stateFool.id, {
      clueId: 'CLUE_ASTROLOGY_RECORD',
      sourceIndex: 0, // MARCAS_TIZA_DESVAN_ORFANATO_SAN_DIONISIO
      timeOfDay: 'noche'
    });
    assert.strictEqual(foolClueAstro.success, true, 'FOOL debe acceder con éxito a CLUE_ASTROLOGY_RECORD');

    // c. FOOL intenta acceder a pista social exclusiva de VISIONARY (debe ser bloqueado)
    const foolMindBlocked = InvestigationEngine.visitClueSource(db, stateFool.id, {
      clueId: 'CLUE_MIND_TRACES',
      sourceIndex: 1,
      timeOfDay: 'tarde'
    });
    assert.strictEqual(foolMindBlocked.success, false, 'FOOL debe ser bloqueado de CLUE_MIND_TRACES');
    assert.ok(foolMindBlocked.reason?.includes('Requiere discernimiento psicológico'));

    // d. FOOL examina la caja oculta (CLUE_CONCEALED_SAFE), ya desvelada por su visión de CLUE_ASTROLOGY_RECORD
    const foolSafeRes = InvestigationEngine.visitClueSource(db, stateFool.id, {
      clueId: 'CLUE_CONCEALED_SAFE',
      sourceIndex: 0, // CAJA_FUERTE_TRAS_RETRATO_FAMILIAR
      timeOfDay: 'noche'
    });
    assert.strictEqual(foolSafeRes.success, true, 'FOOL debe acceder a CLUE_CONCEALED_SAFE');

    // f. FOOL investiga borrador de directivas (CLUE_WILL_DRAFT)
    const foolWillRes = InvestigationEngine.visitClueSource(db, stateFool.id, {
      clueId: 'CLUE_WILL_DRAFT',
      sourceIndex: 0,
      timeOfDay: 'tarde'
    });
    assert.strictEqual(foolWillRes.success, true, 'FOOL debe acceder a CLUE_WILL_DRAFT');

    // --- ACCIONES DEL BOT VISIONARY (Vía del Espectador: Psicológico / Microexpresiones / Social) ---
    // a. Pista pública (inicialmente descubierta): CLUE_BURNED_TOYS
    // b. Pista Social/Psicológica exclusiva de VISIONARY: CLUE_MIND_TRACES (Microexpresiones de Evangeline)
    const visClueMind = InvestigationEngine.visitClueSource(db, stateVis.id, {
      clueId: 'CLUE_MIND_TRACES',
      sourceIndex: 1, // AGENDA_EVANGELINE_FARMACIA_CHERWOOD
      timeOfDay: 'tarde'
    });
    assert.strictEqual(visClueMind.success, true, 'VISIONARY debe acceder con éxito a CLUE_MIND_TRACES');

    // c. VISIONARY intenta acceder a pista esotérica exclusiva de FOOL (debe ser bloqueado)
    const visAstroBlocked = InvestigationEngine.visitClueSource(db, stateVis.id, {
      clueId: 'CLUE_ASTROLOGY_RECORD',
      sourceIndex: 0,
      timeOfDay: 'noche'
    });
    assert.strictEqual(visAstroBlocked.success, false, 'VISIONARY debe ser bloqueado de CLUE_ASTROLOGY_RECORD');
    assert.ok(visAstroBlocked.reason?.includes('Requiere percepción esotérica'));

    // d. VISIONARY investiga registros parroquiales alterados (CLUE_FORGED_LETTERS) en misa matutina
    const visLettersRes = InvestigationEngine.visitClueSource(db, stateVis.id, {
      clueId: 'CLUE_FORGED_LETTERS',
      sourceIndex: 1, // AGENDA_BEATRICE_MISA_MATUTINA
      timeOfDay: 'mañana',
      hour: 9
    });
    assert.strictEqual(visLettersRes.success, true, 'VISIONARY debe acceder a CLUE_FORGED_LETTERS');

    // e. VISIONARY investiga transferencias y confronta en el salón a Madame Vivien (CLUE_FINANCIAL_BLACKMAIL)
    const visFinanceRes = InvestigationEngine.visitClueSource(db, stateVis.id, {
      clueId: 'CLUE_FINANCIAL_BLACKMAIL',
      sourceIndex: 1, // AGENDA_VIVIEN_SALON_ESPIRITISMO
      timeOfDay: 'tarde',
      hour: 16
    });
    assert.strictEqual(visFinanceRes.success, true, 'VISIONARY debe acceder a CLUE_FINANCIAL_BLACKMAIL');

    // 4. Extraer conjuntos finales de pistas descubiertas
    const finalStateFool = JSON.parse(db.getCaseInstance(stateFool.id).state_json);
    const finalStateVis = JSON.parse(db.getCaseInstance(stateVis.id).state_json);

    const foolClues = new Set<string>(finalStateFool.discoveredClues.map((c: any) => c.id));
    const visClues = new Set<string>(finalStateVis.discoveredClues.map((c: any) => c.id));

    // 5. Métricas de Conjuntos y Jaccard
    const intersection = new Set([...foolClues].filter(x => visClues.has(x)));
    const union = new Set([...foolClues, ...visClues]);

    const jaccardSimilarity = intersection.size / union.size;
    const divergence = 1.0 - jaccardSimilarity;
    const divergencePercent = divergence * 100;

    console.log('\n======================================================');
    console.log('=== GATE G5: DIVERSIDAD DE VÍAS EN EL CASO #1 ===');
    console.log('------------------------------------------------------');
    console.log(`Pistas Bot FOOL (${foolClues.size}):`, Array.from(foolClues));
    console.log(`Pistas Bot VISIONARY (${visClues.size}):`, Array.from(visClues));
    console.log(`Intersección Común (${intersection.size}):`, Array.from(intersection));
    console.log(`Unión Total (${union.size}):`, Array.from(union));
    console.log(`Similitud de Jaccard: ${(jaccardSimilarity * 100).toFixed(2)}%`);
    console.log(`Divergencia de Conjuntos: ${divergencePercent.toFixed(2)}% (Target: > 60.0%)`);
    console.log('======================================================\n');

    // Aserción clave de Gate G5: divergencia de conjuntos > 60%
    assert.ok(
      divergence > 0.60,
      `La divergencia entre vías (${divergencePercent.toFixed(2)}%) debe superar el 60.0%`
    );
    // Verificación de pistas exclusivas por diseño canónico
    assert.ok(foolClues.has('CLUE_ASTROLOGY_RECORD'), 'FOOL debe poseer CLUE_ASTROLOGY_RECORD');
    assert.ok(!visClues.has('CLUE_ASTROLOGY_RECORD'), 'VISIONARY no debe poseer CLUE_ASTROLOGY_RECORD');
    assert.ok(visClues.has('CLUE_MIND_TRACES'), 'VISIONARY debe poseer CLUE_MIND_TRACES');
    assert.ok(!foolClues.has('CLUE_MIND_TRACES'), 'FOOL no debe poseer CLUE_MIND_TRACES');
  });

  it('2. Simulación Multi-Bot de Divergencia (20 Bots: 10 FOOL vs 10 VISIONARY con Semillas Fijas)', () => {
    const rng = new SeededRNG('gate_g5_multi_bot_seed_1353');
    const foolBotsClues: Array<Set<string>> = [];
    const visBotsClues: Array<Set<string>> = [];

    // 10 Bots FOOL
    for (let i = 0; i < 10; i++) {
      const id = `bot_fool_multi_${i}`;
      db.createCharacter({
        id,
        name: `Bot FOOL #${i}`,
        pathway: 'FOOL',
        sequence: 9,
        current_health: 100,
        max_health: 100,
        current_spirituality: 100,
        max_spirituality: 100,
        sanity: 100,
        corruption: 0,
        digestion_progress: 20,
        raw_pence: 500,
        current_location: 'Cherwood',
        current_day: 1
      });

      const state = InvestigationEngine.activateCase(db, id, 'CASE_CHERWOOD_HEIRLOOM');

      // Acciones con sesgo esotérico/investigativo
      InvestigationEngine.visitClueSource(db, state.id, { clueId: 'CLUE_ASTROLOGY_RECORD', sourceIndex: 0, timeOfDay: 'noche' });
      if (rng.next() > 0.3) {
        InvestigationEngine.visitClueSource(db, state.id, { clueId: 'CLUE_WILL_DRAFT', sourceIndex: 0, timeOfDay: 'tarde' });
      }
      if (rng.next() > 0.4) {
        InvestigationEngine.visitClueSource(db, state.id, { clueId: 'CLUE_CONCEALED_SAFE', sourceIndex: 0, timeOfDay: 'noche' });
      }

      const st = JSON.parse(db.getCaseInstance(state.id).state_json);
      foolBotsClues.push(new Set(st.discoveredClues.map((c: any) => c.id)));
    }

    // 10 Bots VISIONARY
    for (let i = 0; i < 10; i++) {
      const id = `bot_vis_multi_${i}`;
      db.createCharacter({
        id,
        name: `Bot VISIONARY #${i}`,
        pathway: 'VISIONARY',
        sequence: 9,
        current_health: 100,
        max_health: 100,
        current_spirituality: 100,
        max_spirituality: 100,
        sanity: 100,
        corruption: 0,
        digestion_progress: 20,
        raw_pence: 1500,
        current_location: 'Cherwood',
        current_day: 1
      });

      const state = InvestigationEngine.activateCase(db, id, 'CASE_CHERWOOD_HEIRLOOM');

      // Acciones con sesgo social/psicológico
      InvestigationEngine.visitClueSource(db, state.id, { clueId: 'CLUE_MIND_TRACES', sourceIndex: 1, timeOfDay: 'tarde' });
      if (rng.next() > 0.2) {
        InvestigationEngine.visitClueSource(db, state.id, { clueId: 'CLUE_FORGED_LETTERS', sourceIndex: 1, timeOfDay: 'mañana', hour: 9 });
      }
      if (rng.next() > 0.4) {
        InvestigationEngine.visitClueSource(db, state.id, { clueId: 'CLUE_FINANCIAL_BLACKMAIL', sourceIndex: 1, timeOfDay: 'tarde', hour: 16 });
      }

      const st = JSON.parse(db.getCaseInstance(state.id).state_json);
      visBotsClues.push(new Set(st.discoveredClues.map((c: any) => c.id)));
    }

    // Calcular divergencia promedio par a par entre los 10 bots FOOL y los 10 bots VISIONARY (100 comparaciones)
    let totalDivergence = 0;
    let comparisons = 0;

    for (let f = 0; f < 10; f++) {
      for (let v = 0; v < 10; v++) {
        const setF = foolBotsClues[f];
        const setV = visBotsClues[v];

        const inter = new Set([...setF].filter(x => setV.has(x)));
        const uni = new Set([...setF, ...setV]);
        const div = 1.0 - (inter.size / uni.size);

        totalDivergence += div;
        comparisons++;
      }
    }

    const meanDivergence = (totalDivergence / comparisons) * 100;
    console.log(`[SIMULACIÓN MULTI-BOT G5] Divergencia Media Inter-Vía en 100 comparaciones: ${meanDivergence.toFixed(2)}% (Target: > 60.0%)`);

    assert.ok(
      meanDivergence > 60.0,
      `La divergencia media inter-vía (${meanDivergence.toFixed(2)}%) debe superar el 60.0%`
    );
  });
});
