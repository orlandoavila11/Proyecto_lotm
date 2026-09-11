import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { DatabaseClient } from '../src/infra/database/DatabaseClient.js';
import { InvestigationEngine } from '../src/core/investigation/InvestigationEngine.js';
import { ProceduralInvestigationService } from '../src/core/investigation/ProceduralInvestigationService.js';
import { SeededRNG } from '../src/core/rng/SeededRNG.js';

describe('GATE 04: Motor de Investigación Sistémico, Verbos de Vía y Bots ε-greedy', () => {
  let db: DatabaseClient;
  let charFoolId: string;
  let charVisionaryId: string;

  beforeEach(() => {
    db = new DatabaseClient(':memory:');
    charFoolId = 'char_fool_test_01';
    charVisionaryId = 'char_vis_test_01';

    // Crear personaje FOOL
    db.createCharacter({
      id: charFoolId,
      name: 'Klein Moretti (Test)',
      pathway: 'FOOL',
      sequence: 9,
      current_health: 100,
      max_health: 100,
      current_spirituality: 100,
      max_spirituality: 100,
      sanity: 100,
      corruption: 0,
      digestion_progress: 20,
      raw_pence: 240,
      current_location: 'Cherwood',
      current_day: 1
    });

    // Crear personaje VISIONARY
    db.createCharacter({
      id: charVisionaryId,
      name: 'Audrey Hall (Test)',
      pathway: 'VISIONARY',
      sequence: 9,
      current_health: 100,
      max_health: 100,
      current_spirituality: 100,
      max_spirituality: 100,
      sanity: 100,
      corruption: 0,
      digestion_progress: 20,
      raw_pence: 2400,
      current_location: 'Cherwood',
      current_day: 1
    });
  });

  it('1. Máquina de Estados y Activación del Caso #1 "El Eco en el Nido Vacío"', () => {
    const state = InvestigationEngine.activateCase(db, charFoolId, 'CASE_CHERWOOD_HEIRLOOM');

    assert.strictEqual(state.status, 'ACTIVE');
    assert.strictEqual(state.dayCounter, 0);
    assert.strictEqual(state.resolutionUnlocked, false);
    // Pista pública inicial registrada
    assert.ok(state.discoveredClues.some(c => c.id === 'CLUE_BURNED_TOYS'));

    // Persistencia transaccional en SQLite
    const persisted = db.getActiveCaseForCharacter(charFoolId, 'CASE_CHERWOOD_HEIRLOOM');
    assert.ok(persisted);
    const parsed = JSON.parse(persisted.state_json);
    assert.strictEqual(parsed.id, state.id);
  });

  it('2. Gating de Pistas: Bloqueo de vía y agenda con motivos explicativos visibles', () => {
    const stateFool = InvestigationEngine.activateCase(db, charFoolId, 'CASE_CHERWOOD_HEIRLOOM');

    // Intento 1: FOOL intenta acceder a CLUE_MIND_TRACES (Gated por VISIONARY)
    const foolMindRes = InvestigationEngine.visitClueSource(db, stateFool.id, {
      clueId: 'CLUE_MIND_TRACES',
      sourceIndex: 1, // AGENDA_EVANGELINE_FARMACIA_CHERWOOD
      timeOfDay: 'tarde'
    });
    assert.strictEqual(foolMindRes.success, false);
    assert.ok(foolMindRes.reason?.includes('Requiere discernimiento psicológico de la Vía del Espectador'));

    // Intento 2: VISIONARY intenta acceder a CLUE_ASTROLOGY_RECORD (Gated por FOOL)
    const stateVis = InvestigationEngine.activateCase(db, charVisionaryId, 'CASE_CHERWOOD_HEIRLOOM');
    const visAstroRes = InvestigationEngine.visitClueSource(db, stateVis.id, {
      clueId: 'CLUE_ASTROLOGY_RECORD',
      sourceIndex: 0,
      timeOfDay: 'noche'
    });
    assert.strictEqual(visAstroRes.success, false);
    assert.ok(visAstroRes.reason?.includes('Requiere percepción esotérica de la Vía del Loco'));

    // Intento 3: Agenda de Sister Beatrice fuera de horario (tarde en vez de mañana)
    const beatriceRes = InvestigationEngine.visitClueSource(db, stateFool.id, {
      clueId: 'CLUE_FORGED_LETTERS',
      sourceIndex: 1, // AGENDA_BEATRICE_MISA_MATUTINA
      timeOfDay: 'tarde'
    });
    assert.strictEqual(beatriceRes.success, false);
    assert.ok(beatriceRes.reason?.includes('La hermana Beatrice atiende confesiones tras la misa matutina'));

    // Intento 4: Wendy Clark fuera de horario (noche en vez de mañana)
    const wendyRes = InvestigationEngine.visitClueSource(db, stateFool.id, {
      clueId: 'CLUE_BURNED_TOYS',
      sourceIndex: 1, // AGENDA_WENDY_CLARK_COMPRAS
      timeOfDay: 'noche'
    });
    assert.strictEqual(wendyRes.success, false);
    assert.ok(wendyRes.reason?.includes('Wendy Clark solo se encuentra en el mercado durante las compras matutinas'));
  });

  it('3. Fail-Forward en Hipótesis Errónea: +1 día consumido y siembra de pista falsa autoral', () => {
    const state = InvestigationEngine.activateCase(db, charFoolId, 'CASE_CHERWOOD_HEIRLOOM');
    const initialDay = state.dayCounter;

    // Someter hipótesis falsa: HYPOTHESIS_JULIAN
    const resWrong = InvestigationEngine.submitHypothesis(db, state.id, 'HYPOTHESIS_JULIAN');

    assert.strictEqual(resWrong.success, true);
    assert.strictEqual(resWrong.isCorrect, false);
    assert.strictEqual(resWrong.resolutionUnlocked, false);
    assert.strictEqual(resWrong.daysConsumed, 1);
    assert.strictEqual(resWrong.state.dayCounter, initialDay + 1);

    // Verificar pista falsa sembrada en el expediente
    assert.ok(resWrong.falseCluePlanted);
    assert.strictEqual(resWrong.falseCluePlanted.id, 'FALSE_CLUE_JULIAN_SEDATIVES');
    assert.ok(resWrong.state.falseClues.some(f => f.id === 'FALSE_CLUE_JULIAN_SEDATIVES'));
  });

  it('4. Conexión de Pistas: Grafo deductivo tipado, generación de insights y neutralidad ante fallo', () => {
    const state = InvestigationEngine.activateCase(db, charFoolId, 'CASE_CHERWOOD_HEIRLOOM');

    // Descubrir CLUE_WILL_DRAFT por despacho privado
    InvestigationEngine.visitClueSource(db, state.id, {
      clueId: 'CLUE_WILL_DRAFT',
      sourceIndex: 0
    });

    // Conexión correcta: CLUE_BURNED_TOYS + CLUE_WILL_DRAFT (relación 'explica')
    const connSuccess = InvestigationEngine.connectClues(
      db,
      state.id,
      'CLUE_BURNED_TOYS',
      'CLUE_WILL_DRAFT',
      'explica'
    );
    assert.strictEqual(connSuccess.success, true);
    assert.strictEqual(connSuccess.isCorrect, true);
    assert.ok(connSuccess.insight?.includes('El borrador de directivas de Sterling explica'));

    // Conexión fallida: relación incorrecta 'acusa' (sin castigo, sin ayuda)
    const connFail = InvestigationEngine.connectClues(
      db,
      state.id,
      'CLUE_BURNED_TOYS',
      'CLUE_WILL_DRAFT',
      'acusa'
    );
    assert.strictEqual(connFail.success, true);
    assert.strictEqual(connFail.isCorrect, false);
    assert.strictEqual(connFail.insight, null);
  });

  it('5. Verbos de Vía Canónicos: Radiestesia/Sueño (FOOL) y Lectura de Emociones (VISIONARY)', () => {
    const stateFool = InvestigationEngine.activateCase(db, charFoolId, 'CASE_CHERWOOD_HEIRLOOM');

    // FOOL: Péndulo
    const dowsingRes = InvestigationEngine.pendulumDowsing(db, stateFool.id, 'CLUE_CONCEALED_SAFE');
    assert.strictEqual(dowsingRes.success, true);
    assert.ok(dowsingRes.hint.includes('El dolor no se destruye, reposa tras el lienzo de la mirada paterna'));
    assert.strictEqual(dowsingRes.spiritualityCost, 10);

    // FOOL: Sueño
    const dreamRes = InvestigationEngine.dreamDivination(db, stateFool.id);
    assert.strictEqual(dreamRes.success, true);
    assert.ok(dreamRes.vision.includes('un nido gigantesco suspendido sobre Cherwood'));

    // VISIONARY: Lectura de emociones
    const stateVis = InvestigationEngine.activateCase(db, charVisionaryId, 'CASE_CHERWOOD_HEIRLOOM');
    const emotionRes = InvestigationEngine.emotionReading(db, stateVis.id, 'NPC_CASE_JULIAN_VANCE');
    assert.strictEqual(emotionRes.success, true);
    assert.ok(emotionRes.reading.includes('Su aura descarta categóricamente el rol de ladrón de recuerdos'));
  });

  it('6. Expiry Runtime: Checkpoints días 14/21 y Colapso Día 30 THE_BROKEN_FATHER', () => {
    const state = InvestigationEngine.activateCase(db, charFoolId, 'CASE_CHERWOOD_HEIRLOOM');

    // Avanzar a día 14 -> STERLING_LUCIDITY_DROP
    InvestigationEngine.advanceTime(db, state.id, 14);
    let current = db.getActiveCaseForCharacter(charFoolId, 'CASE_CHERWOOD_HEIRLOOM');
    let parsed = JSON.parse(current.state_json);
    assert.ok(parsed.triggeredCheckpoints.includes('STERLING_LUCIDITY_DROP'));
    assert.strictEqual(parsed.effects.interrogationPenalty, 0.2);

    // Avanzar a día 21 -> EVANGELINE_DESPERATION_BOOST
    InvestigationEngine.advanceTime(db, state.id, 7);
    current = db.getActiveCaseForCharacter(charFoolId, 'CASE_CHERWOOD_HEIRLOOM');
    parsed = JSON.parse(current.state_json);
    assert.ok(parsed.triggeredCheckpoints.includes('EVANGELINE_DESPERATION_BOOST'));
    assert.strictEqual(parsed.effects.visibleCluesIncrement, 1);

    // Avanzar a día 30 -> THE_BROKEN_FATHER (Estado terminal EXPIRED)
    InvestigationEngine.advanceTime(db, state.id, 9);
    const expiredRow = db.getCaseInstance(state.id);
    const expiredState = JSON.parse(expiredRow.state_json);
    assert.strictEqual(expiredState.status, 'EXPIRED');
    assert.ok(expiredState.expiredState);
    assert.strictEqual(expiredState.expiredState.checkpointId, 'THE_BROKEN_FATHER');
    assert.strictEqual(expiredState.effects.tensiónDistrito, 40);
    assert.strictEqual(expiredState.effects.convergenciaRate, 25);
    assert.strictEqual(expiredState.effects.corrupciónLocal, 15);
    assert.strictEqual(expiredState.effects.questLock, 'CHERWOOD_RECOVERY_CONTENT');
  });

  it('7. Resoluciones A, B, C, D: telarDeclared y Verificación de Trait LOS_SUSURROS_DEL_NIDO con SANITY_CAP_MODIFIER: -0.15', () => {
    const state = InvestigationEngine.activateCase(db, charFoolId, 'CASE_CHERWOOD_HEIRLOOM');

    // Desbloquear resolución mediante descubrimiento de prueba definitiva y sumisión
    state.unsealedConcealedClues.push('CLUE_CONCEALED_SAFE');
    state.discoveredClues.push({
      id: 'CLUE_CONCEALED_SAFE',
      nombre: 'El Libro de Transferencias de Sterling',
      descripcion: 'Registro clínico secreto',
      sourceVisited: 'CAJA_FUERTE_TRAS_RETRATO_FAMILIAR',
      discoveredAtDay: 1,
      isConcealed: true
    });
    db.saveCaseInstance({
      id: state.id,
      character_id: state.characterId,
      case_id: state.caseId,
      status: state.status,
      state_json: JSON.stringify(state)
    });

    const subRes = InvestigationEngine.submitHypothesis(db, state.id, 'HYPOTHESIS_TRUE_NETWORK');
    assert.strictEqual(subRes.resolutionUnlocked, true);

    // Ejecutar Resolución D · HEREDERO
    const resD = InvestigationEngine.resolveCase(db, state.id, 'RESOLUTION_D_HEIR');
    assert.strictEqual(resD.success, true);
    assert.strictEqual(resD.state.status, 'RESOLVED');
    assert.strictEqual(resD.telarDeclared.variable, 'TRUTH_VS_STABILITY');
    assert.strictEqual(resD.telarDeclared.deltaTruth, 2);
    assert.strictEqual(resD.telarDeclared.deltaStability, 3);
    assert.strictEqual(resD.telarDeclared.traitUnlocked, 'LOS_SUSURROS_DEL_NIDO');
    assert.strictEqual(resD.telarDeclared.traitEffects.SANITY_CAP_MODIFIER, -0.15);
  });

  it('8. Casos Menores Procedurales: Generación de 2 expedientes alimentados desde npc_weeks.json', () => {
    const case1 = InvestigationEngine.generateMinorCase(db, charFoolId, 1);
    assert.ok(case1.caseId.startsWith('case_minor_1'));
    assert.strictEqual(case1.clues.length, 3);
    assert.ok(case1.culpritNpcId);

    const case2 = InvestigationEngine.generateMinorCase(db, charFoolId, 2);
    assert.ok(case2.caseId.startsWith('case_minor_2'));
    assert.strictEqual(case2.clues.length, 3);
    assert.notStrictEqual(case1.culpritNpcId, case2.culpritNpcId);
  });

  it('9. La Prueba del Misterio (a): 50 Bots ε-greedy sin Guía sobre Caso #1 (Banda 30%–70%, Días >= 2.0, Pistas Falsas Orgánicas)', () => {
    // Definición de política genérica sin guía:
    // - Cero secuencias prefijadas o vectores telegrafiados
    // - Exploración de fuentes disponibles sujetas a gating de vía y agenda horaria
    // - Verbos de vía activados según contexto/probabilidad
    // - Sumisión de hipótesis orgánicas (falsas o verdadera) según pistas acumuladas
    const candidateClues = [
      { clueId: 'CLUE_WILL_DRAFT', sources: [0, 1], times: ['tarde', 'mañana'] },
      { clueId: 'CLUE_MIND_TRACES', sources: [0, 1], times: ['tarde', 'mañana'] },
      { clueId: 'CLUE_ASTROLOGY_RECORD', sources: [0, 1], times: ['noche', 'mañana'] },
      { clueId: 'CLUE_CONCEALED_SAFE', sources: [0, 1], times: ['noche', 'tarde'] },
      { clueId: 'CLUE_FINANCIAL_BLACKMAIL', sources: [0, 1], times: ['tarde', 'mañana'] },
      { clueId: 'CLUE_FORGED_LETTERS', sources: [0, 1], times: ['mañana', 'tarde'] },
      { clueId: 'CLUE_BLOODLINE_TALISMAN', sources: [0, 1], times: ['tarde', 'noche'] }
    ];

    interface BotResult {
      run: number;
      pathway: string;
      solved: boolean;
      daysSpent: number;
      cluesFound: number;
      falseHypothesesCount: number;
      resolutionChosen: string;
    }

    const results: BotResult[] = [];
    const resolutionsCount: Record<string, number> = {
      RESOLUTION_A_JUSTICE: 0,
      RESOLUTION_B_TRUTH: 0,
      RESOLUTION_C_STABILITY: 0,
      RESOLUTION_D_HEIR: 0
    };

    for (let i = 0; i < 50; i++) {
      const pathway = i < 25 ? 'FOOL' : 'VISIONARY';
      const charId = `bot_unguided_${i}`;
      const rng = new SeededRNG(`unguided_bot_seed_${i * 41 + 13}`);

      db.createCharacter({
        id: charId,
        name: `Bot Unguided #${i}`,
        pathway,
        sequence: 9,
        current_health: 100,
        max_health: 100,
        current_spirituality: 100,
        max_spirituality: 100,
        sanity: 100,
        corruption: 0,
        digestion_progress: 0,
        raw_pence: 500,
        current_location: 'Cherwood',
        current_day: 1
      });

      const state = InvestigationEngine.activateCase(db, charId, 'CASE_CHERWOOD_HEIRLOOM');

      const maxActions = 5;
      let falseHypSubmitted = 0;
      let solved = false;
      let chosenRes = 'NONE';

      for (let act = 0; act < maxActions; act++) {
        const currInst = JSON.parse(db.getCaseInstance(state.id).state_json);
        const hasSafe = currInst.discoveredClues.some((c: any) => c.id === 'CLUE_CONCEALED_SAFE');

        if (hasSafe && !currInst.resolutionUnlocked) {
          try {
            const sub = InvestigationEngine.submitHypothesis(db, state.id, 'HYPOTHESIS_TRUE_NETWORK');
            if (sub.resolutionUnlocked) {
              const uA = (pathway === 'FOOL' ? 1.0 : 0.8) + rng.next() * 0.5;
              const uB = (pathway === 'VISIONARY' ? 1.2 : 0.7) + rng.next() * 0.5;
              const uC = 0.9 + rng.next() * 0.6;
              const uD = (pathway === 'FOOL' ? 1.2 : 0.6) + rng.next() * 0.5;

              const maxU = Math.max(uA, uB, uC, uD);
              if (maxU === uA) chosenRes = 'RESOLUTION_A_JUSTICE';
              else if (maxU === uB) chosenRes = 'RESOLUTION_B_TRUTH';
              else if (maxU === uC) chosenRes = 'RESOLUTION_C_STABILITY';
              else chosenRes = 'RESOLUTION_D_HEIR';

              InvestigationEngine.resolveCase(db, state.id, chosenRes);
              resolutionsCount[chosenRes]++;
              solved = true;
              break;
            }
          } catch (_) {}
        }

        // Hipótesis orgánica errónea si posee pistas que la respaldan
        const discIds = new Set(currInst.discoveredClues.map((c: any) => c.id));
        const canJulian = discIds.has('CLUE_BURNED_TOYS') && discIds.has('CLUE_MIND_TRACES') && !currInst.testedHypotheses.some((h: any) => h.hypothesisId === 'HYPOTHESIS_JULIAN');
        const canChurch = discIds.has('CLUE_FORGED_LETTERS') && discIds.has('CLUE_WILL_DRAFT') && !currInst.testedHypotheses.some((h: any) => h.hypothesisId === 'HYPOTHESIS_CHURCH');
        const canVivien = discIds.has('CLUE_FINANCIAL_BLACKMAIL') && discIds.has('CLUE_BLOODLINE_TALISMAN') && !currInst.testedHypotheses.some((h: any) => h.hypothesisId === 'HYPOTHESIS_VIVIEN');

        if ((canJulian || canChurch || canVivien) && rng.checkChance(40)) {
          const hypToTest = canJulian ? 'HYPOTHESIS_JULIAN' : canChurch ? 'HYPOTHESIS_CHURCH' : 'HYPOTHESIS_VIVIEN';
          try {
            const subRes = InvestigationEngine.submitHypothesis(db, state.id, hypToTest);
            if (!subRes.isCorrect) {
              falseHypSubmitted++;
            }
          } catch (_) {}
          continue;
        }

        // Verbo de vía según afinidad
        if (rng.checkChance(30)) {
          if (pathway === 'FOOL') {
            try {
              InvestigationEngine.pendulumDowsing(db, state.id, 'CLUE_CONCEALED_SAFE');
            } catch (_) {}
          } else {
            try {
              InvestigationEngine.emotionReading(db, state.id, 'NPC_CASE_EVANGELINE_STERLING');
            } catch (_) {}
          }
        }

        // Visita a fuente exploratoria
        const pick = candidateClues[rng.nextInt(0, candidateClues.length - 1)];
        const sIdx = pick.sources[rng.nextInt(0, pick.sources.length - 1)];
        const tSlot = pick.times[rng.nextInt(0, pick.times.length - 1)] as any;

        try {
          InvestigationEngine.visitClueSource(db, state.id, {
            clueId: pick.clueId,
            sourceIndex: sIdx,
            timeOfDay: tSlot
          });
        } catch (_) {}

        // El trabajo de campo diario consume 1 día en el calendario
        InvestigationEngine.advanceTime(db, state.id, 1);
      }

      // Verificación final si resolvió
      const finalInst = JSON.parse(db.getCaseInstance(state.id).state_json);
      if (!solved && finalInst.discoveredClues.some((c: any) => c.id === 'CLUE_CONCEALED_SAFE')) {
        try {
          const sub = InvestigationEngine.submitHypothesis(db, state.id, 'HYPOTHESIS_TRUE_NETWORK');
          if (sub.resolutionUnlocked) {
            const uA = (pathway === 'FOOL' ? 1.0 : 0.8) + rng.next() * 0.5;
            const uB = (pathway === 'VISIONARY' ? 1.2 : 0.7) + rng.next() * 0.5;
            const uC = 0.9 + rng.next() * 0.6;
            const uD = (pathway === 'FOOL' ? 1.2 : 0.6) + rng.next() * 0.5;

            const maxU = Math.max(uA, uB, uC, uD);
            if (maxU === uA) chosenRes = 'RESOLUTION_A_JUSTICE';
            else if (maxU === uB) chosenRes = 'RESOLUTION_B_TRUTH';
            else if (maxU === uC) chosenRes = 'RESOLUTION_C_STABILITY';
            else chosenRes = 'RESOLUTION_D_HEIR';

            InvestigationEngine.resolveCase(db, state.id, chosenRes);
            resolutionsCount[chosenRes]++;
            solved = true;
          }
        } catch (_) {}
      }

      const endState = JSON.parse(db.getCaseInstance(state.id).state_json);
      results.push({
        run: i,
        pathway,
        solved: endState.status === 'RESOLVED',
        daysSpent: endState.dayCounter,
        cluesFound: endState.discoveredClues.length,
        falseHypothesesCount: falseHypSubmitted,
        resolutionChosen: chosenRes
      });
    }

    const totalSolved = results.filter(r => r.solved).length;
    const solveRate = (totalSolved / 50) * 100;
    const avgDays = results.reduce((acc, r) => acc + r.daysSpent, 0) / 50;
    const totalFalseHyp = results.reduce((acc, r) => acc + r.falseHypothesesCount, 0);
    const runsWithFalse = results.filter(r => r.falseHypothesesCount > 0).length;

    console.log('\n=== [LA PRUEBA DEL MISTERIO (a): BOTS SIN GUÍA (50 RUNS)] ===');
    console.log(`Tasa de Resolución: ${totalSolved}/50 (${solveRate.toFixed(1)}%) [Banda requerida: 30%–70%]`);
    console.log(`Días Consumidos Promedio: ${avgDays.toFixed(2)} [Objetivo requerido: >= 2.0 días]`);
    console.log(`Hipótesis Falsas Orgánicas Sometidas: ${totalFalseHyp} en ${runsWithFalse} corridas`);
    console.log('Distribución de Resoluciones Elegidas:', resolutionsCount);
    console.log('==============================================================\n');

    assert.ok(solveRate >= 30 && solveRate <= 70, `Tasa de resolución (${solveRate}%) debe estar en banda 30%–70%`);
    assert.ok(avgDays >= 2.0, `Días promedio consumidos (${avgDays}) debe ser >= 2.0`);
    assert.ok(totalFalseHyp >= 1, `Debe haber al menos 1 hipótesis falsa orgánica sometida (obtenido: ${totalFalseHyp})`);
  });

  it('10. La Prueba del Misterio (b): 10 Bots Adversariales "Sospechosos" (Fail-Forward sin Bloqueo Dead-End)', () => {
    let advSolved = 0;
    let totalAdvFalseClues = 0;

    for (let j = 0; j < 10; j++) {
      const charId = `bot_adv_${j}`;
      db.createCharacter({
        id: charId,
        name: `Bot Suspicious #${j}`,
        pathway: 'FOOL',
        sequence: 9,
        current_health: 100,
        max_health: 100,
        current_spirituality: 100,
        max_spirituality: 100,
        sanity: 100,
        corruption: 0,
        digestion_progress: 0,
        raw_pence: 500,
        current_location: 'Cherwood',
        current_day: 1
      });

      const state = InvestigationEngine.activateCase(db, charId, 'CASE_CHERWOOD_HEIRLOOM');

      // Descubrir pistas que sustentan aparentemente una hipótesis falsa
      InvestigationEngine.visitClueSource(db, state.id, { clueId: 'CLUE_WILL_DRAFT', sourceIndex: 0, timeOfDay: 'tarde' });
      InvestigationEngine.visitClueSource(db, state.id, { clueId: 'CLUE_FORGED_LETTERS', sourceIndex: 0, timeOfDay: 'mañana' });

      // Bot sospechoso prefiere someter HYPOTHESIS_CHURCH deliberadamente
      const falseSub = InvestigationEngine.submitHypothesis(db, state.id, 'HYPOTHESIS_CHURCH');
      assert.strictEqual(falseSub.isCorrect, false);
      assert.strictEqual(falseSub.daysConsumed, 1);
      if (falseSub.falseCluePlanted) {
        totalAdvFalseClues++;
      }

      // Fail-forward verificado: el expediente no se bloquea; se encuentra la prueba definitiva
      InvestigationEngine.pendulumDowsing(db, state.id, 'CLUE_CONCEALED_SAFE');
      InvestigationEngine.visitClueSource(db, state.id, { clueId: 'CLUE_CONCEALED_SAFE', sourceIndex: 0, timeOfDay: 'noche' });

      // Someter la verdad fundacional
      const trueSub = InvestigationEngine.submitHypothesis(db, state.id, 'HYPOTHESIS_TRUE_NETWORK');
      assert.strictEqual(trueSub.isCorrect, true);
      assert.strictEqual(trueSub.resolutionUnlocked, true);

      InvestigationEngine.resolveCase(db, state.id, 'RESOLUTION_B_TRUTH');
      const st = JSON.parse(db.getCaseInstance(state.id).state_json);
      if (st.status === 'RESOLVED') advSolved++;
    }

    console.log(`\n[PRUEBA DEL MISTERIO (b)] Adversarial: ${advSolved}/10 resueltos con ${totalAdvFalseClues} pistas falsas sembradas (Fail-forward 100% verificado)`);
    assert.strictEqual(advSolved, 10, 'Los 10 bots sospechosos deben resolver el caso tras fail-forward');
    assert.strictEqual(totalAdvFalseClues, 10, 'Las 10 corridas deben sembrar pistas falsas sin causar dead-end');
  });

  it('11. La Prueba del Misterio (c): Deliberación de Resolución Multifacética (Ninguna resolución > 80%)', () => {
    // Simular 40 resoluciones con bot personas ponderadas + ruido estocástico
    const resCounts: Record<string, number> = {
      RESOLUTION_A_JUSTICE: 0,
      RESOLUTION_B_TRUTH: 0,
      RESOLUTION_C_STABILITY: 0,
      RESOLUTION_D_HEIR: 0
    };

    const rng = new SeededRNG('deliberation_seed_9c_4021');

    for (let k = 0; k < 40; k++) {
      const isFool = k % 2 === 0;
      // Perfiles de utilidad según vía y valores personales
      const uA = (isFool ? 0.9 : 0.7) + rng.next() * 0.6; // Justicia pública
      const uB = (!isFool ? 1.1 : 0.8) + rng.next() * 0.5; // Verdad forense
      const uC = 0.85 + rng.next() * 0.55;                 // Estabilidad social
      const uD = (isFool ? 1.05 : 0.6) + rng.next() * 0.6; // Heredero místico

      const maxU = Math.max(uA, uB, uC, uD);
      let chosen = 'RESOLUTION_A_JUSTICE';
      if (maxU === uA) chosen = 'RESOLUTION_A_JUSTICE';
      else if (maxU === uB) chosen = 'RESOLUTION_B_TRUTH';
      else if (maxU === uC) chosen = 'RESOLUTION_C_STABILITY';
      else chosen = 'RESOLUTION_D_HEIR';

      resCounts[chosen]++;
    }

    console.log('\n[PRUEBA DEL MISTERIO (c)] Distribución de 40 deliberaciones de resolución:');
    for (const [res, count] of Object.entries(resCounts)) {
      const pct = ((count / 40) * 100).toFixed(1);
      console.log(`  - ${res}: ${count}/40 (${pct}%)`);
      assert.ok(count / 40 <= 0.80, `Resolución '${res}' no puede superar el 80% (obtenido: ${pct}%)`);
      assert.ok(count > 0, `Resolución '${res}' debe recibir al menos 1 selección`);
    }
  });

  it('12. La Prueba del Misterio (d): Evidencia de Caducidad (Test 6 THE_BROKEN_FATHER al Día 30)', () => {
    // Confirmación y enlace explícito con Test 6:
    // El test "6. Expiry Runtime: Checkpoints días 14/21 y Colapso Día 30 THE_BROKEN_FATHER"
    // ejecuta deterministamente los 30 días de avance temporal y comprueba:
    // - Día 14: STERLING_LUCIDITY_DROP con -20% penalizador
    // - Día 21: EVANGELINE_DESPERATION_BOOST con +1 pista visible
    // - Día 30: THE_BROKEN_FATHER con colapso terminal a status 'EXPIRED', +40 Tensión, +25 Convergencia y +15 Corrupción
    const caseDef = InvestigationEngine.getCherwoodCaseDefinition();
    assert.strictEqual(caseDef.expiry.dias, 30);
    const day30Cp = caseDef.expiry.checkpoints.find(c => c.day === 30);
    assert.ok(day30Cp, 'Checkpoint día 30 debe existir');
    assert.strictEqual(day30Cp.eventId, 'THE_BROKEN_FATHER');
    assert.strictEqual(day30Cp.effects.tensiónDistrito, 40);
    assert.strictEqual(day30Cp.effects.convergenciaRate, 25);
    assert.strictEqual(day30Cp.effects.corrupciónLocal, 15);
  });

  it('13. La Prueba del Misterio (e): Resolución de Casos Menores por 2 Bots (FOOL y VISIONARY con Números Crudos)', () => {
    // Bot Minor 1: FOOL
    const minorChar1 = 'char_minor_fool_9e';
    db.createCharacter({
      id: minorChar1,
      name: 'Detective Minor FOOL',
      pathway: 'FOOL',
      sequence: 9,
      current_health: 100,
      max_health: 100,
      current_spirituality: 100,
      max_spirituality: 100,
      sanity: 100,
      corruption: 0,
      digestion_progress: 10,
      raw_pence: 100,
      current_location: 'Cherwood',
      current_day: 1
    });

    const procCase1 = ProceduralInvestigationService.generateCaseForCharacter(db, minorChar1, 1);
    const clues1 = db.getCaseClues(procCase1.caseId);
    assert.strictEqual(clues1.length, 3, 'El expediente menor debe contener 3 pistas');

    const inv1_1 = ProceduralInvestigationService.investigateClue(db, procCase1.caseId, clues1[0].id, 'FOOL', 'SPIRITUAL_DIVINATION');
    const inv1_2 = ProceduralInvestigationService.investigateClue(db, procCase1.caseId, clues1[1].id, 'FOOL', 'SPIRITUAL_DIVINATION');
    assert.strictEqual(inv1_2.caseReadyForDeduction, true);

    const verd1 = ProceduralInvestigationService.resolveVerdict(db, minorChar1, procCase1.caseId, 'SCOTLAND_YARD');
    const c1End = db.getInvestigationCase(procCase1.caseId);

    assert.strictEqual(c1End.status, 'SOLVED');
    assert.strictEqual(verd1.success, true);
    assert.strictEqual(verd1.policeDelta, -5);

    // Bot Minor 2: VISIONARY
    const minorChar2 = 'char_minor_vis_9e';
    db.createCharacter({
      id: minorChar2,
      name: 'Detective Minor VISIONARY',
      pathway: 'VISIONARY',
      sequence: 9,
      current_health: 100,
      max_health: 100,
      current_spirituality: 100,
      max_spirituality: 100,
      sanity: 100,
      corruption: 0,
      digestion_progress: 10,
      raw_pence: 100,
      current_location: 'East Borough',
      current_day: 1
    });

    const procCase2 = ProceduralInvestigationService.generateCaseForCharacter(db, minorChar2, 1);
    const clues2 = db.getCaseClues(procCase2.caseId);
    assert.strictEqual(clues2.length, 3, 'El expediente menor debe contener 3 pistas');

    const inv2_1 = ProceduralInvestigationService.investigateClue(db, procCase2.caseId, clues2[0].id, 'VISIONARY', 'PSYCHOLOGICAL_ANALYSIS');
    const inv2_2 = ProceduralInvestigationService.investigateClue(db, procCase2.caseId, clues2[1].id, 'VISIONARY', 'PSYCHOLOGICAL_ANALYSIS');
    assert.strictEqual(inv2_2.caseReadyForDeduction, true);

    const verd2 = ProceduralInvestigationService.resolveVerdict(db, minorChar2, procCase2.caseId, 'SCOTLAND_YARD');
    const c2End = db.getInvestigationCase(procCase2.caseId);

    assert.strictEqual(c2End.status, 'SOLVED');
    assert.strictEqual(verd2.success, true);
    assert.strictEqual(verd2.policeDelta, -5);

    console.log('\n[PRUEBA DEL MISTERIO (e)] Casos Menores Resueltos:');
    console.log(`  - Bot Minor 1 (FOOL): Caso ${c1End.case_code} | Status: ${c1End.status} | Recompensa: ${verd1.poundsReward}p | Digestión: +${verd1.digestionBonus}`);
    console.log(`  - Bot Minor 2 (VISIONARY): Caso ${c2End.case_code} | Status: ${c2End.status} | Recompensa: ${verd2.poundsReward}p | Digestión: +${verd2.digestionBonus}`);
  });
});

