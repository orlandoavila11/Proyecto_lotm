import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { DatabaseClient } from '../src/infra/database/DatabaseClient.js';
import { InvestigationEngine } from '../src/core/investigation/InvestigationEngine.js';

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

  it('9. Simulación de Bots ε-greedy Resolviendo Caso #1 por ≥ 2 Vectores (FOOL y VISIONARY)', () => {
    // Definición de política ε-greedy:
    // ε = 0.15 de exploración aleatoria entre fuentes válidas no visitadas
    // 1 - ε explotación guiada por el vector principal de la vía:
    //   - FOOL: prioridad a fuentes esotéricas (CLUE_ASTROLOGY_RECORD), radiestesia y deducción documental.
    //   - VISIONARY: prioridad a fuentes sociales (CLUE_MIND_TRACES), lectura psicológica y agendas civiles matutinas/vespertinas.
    const epsilon = 0.15;
    const runsPerPathway = 25;

    interface BotResult {
      pathway: string;
      solved: boolean;
      daysSpent: number;
      cluesFound: number;
      falseCluesCount: number;
      resolutionChosen: string;
    }

    const results: BotResult[] = [];

    for (const pathway of ['FOOL', 'VISIONARY']) {
      for (let run = 0; run < runsPerPathway; run++) {
        const botCharId = `bot_${pathway}_${run}`;
        db.createCharacter({
          id: botCharId,
          name: `Bot ${pathway} #${run}`,
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

        const caseState = InvestigationEngine.activateCase(db, botCharId, 'CASE_CHERWOOD_HEIRLOOM');

        // Fuentes ordenadas según vector dominante
        const foolPrioritySources = [
          { clueId: 'CLUE_WILL_DRAFT', sourceIndex: 0, timeOfDay: 'tarde' as const },
          { clueId: 'CLUE_ASTROLOGY_RECORD', sourceIndex: 0, timeOfDay: 'noche' as const },
          { clueId: 'CLUE_FINANCIAL_BLACKMAIL', sourceIndex: 0, timeOfDay: 'tarde' as const },
          { clueId: 'CLUE_CONCEALED_SAFE', sourceIndex: 0, timeOfDay: 'noche' as const }
        ];

        const visionaryPrioritySources = [
          { clueId: 'CLUE_MIND_TRACES', sourceIndex: 0, timeOfDay: 'tarde' as const },
          { clueId: 'CLUE_FORGED_LETTERS', sourceIndex: 1, timeOfDay: 'mañana' as const },
          { clueId: 'CLUE_FINANCIAL_BLACKMAIL', sourceIndex: 0, timeOfDay: 'tarde' as const },
          { clueId: 'CLUE_CONCEALED_SAFE', sourceIndex: 0, timeOfDay: 'tarde' as const }
        ];

        const plan = pathway === 'FOOL' ? foolPrioritySources : visionaryPrioritySources;

        // Bot explora y visita fuentes
        for (const step of plan) {
          if (Math.random() < epsilon) {
            // Exploración: intenta verbo de vía primero
            if (pathway === 'FOOL') {
              try {
                InvestigationEngine.pendulumDowsing(db, caseState.id, 'CLUE_CONCEALED_SAFE');
              } catch (_) {}
            } else {
              try {
                InvestigationEngine.emotionReading(db, caseState.id, 'NPC_CASE_EVANGELINE_STERLING');
              } catch (_) {}
            }
          }

          InvestigationEngine.visitClueSource(db, caseState.id, {
            clueId: step.clueId,
            sourceIndex: step.sourceIndex,
            timeOfDay: step.timeOfDay
          });
        }

        // Posible hipótesis errónea ocasional por exploración ε
        if (Math.random() < epsilon) {
          InvestigationEngine.submitHypothesis(db, caseState.id, 'HYPOTHESIS_JULIAN');
        }

        // Conectar pistas descubiertas
        const currentInstance = db.getCaseInstance(caseState.id);
        const st = JSON.parse(currentInstance.state_json);

        if (st.discoveredClues.some((c: any) => c.id === 'CLUE_CONCEALED_SAFE')) {
          const sub = InvestigationEngine.submitHypothesis(db, caseState.id, 'HYPOTHESIS_TRUE_NETWORK');
          if (sub.resolutionUnlocked) {
            const resolution = pathway === 'FOOL' ? 'RESOLUTION_D_HEIR' : 'RESOLUTION_B_TRUTH';
            InvestigationEngine.resolveCase(db, caseState.id, resolution);

            const finalState = JSON.parse(db.getCaseInstance(caseState.id).state_json);
            results.push({
              pathway,
              solved: finalState.status === 'RESOLVED',
              daysSpent: finalState.dayCounter,
              cluesFound: finalState.discoveredClues.length,
              falseCluesCount: finalState.falseClues.length,
              resolutionChosen: resolution
            });
            continue;
          }
        }

        const unfinished = JSON.parse(db.getCaseInstance(caseState.id).state_json);
        results.push({
          pathway,
          solved: unfinished.status === 'RESOLVED',
          daysSpent: unfinished.dayCounter,
          cluesFound: unfinished.discoveredClues.length,
          falseCluesCount: unfinished.falseClues.length,
          resolutionChosen: 'NONE'
        });
      }
    }

    const foolResults = results.filter(r => r.pathway === 'FOOL');
    const visResults = results.filter(r => r.pathway === 'VISIONARY');

    const foolSolved = foolResults.filter(r => r.solved).length;
    const visSolved = visResults.filter(r => r.solved).length;

    console.log('\n=== [SIMULACIÓN BOTS INVESTIGACIÓN GATE 04 (FOOL vs VISIONARY)] ===');
    console.log(`Vector FOOL (Esotérico / Hilos Espirituales): ${foolSolved}/${runsPerPathway} resueltos (${((foolSolved / runsPerPathway) * 100).toFixed(1)}%)`);
    console.log(`Vector VISIONARY (Social / Microexpresiones): ${visSolved}/${runsPerPathway} resueltos (${((visSolved / runsPerPathway) * 100).toFixed(1)}%)`);
    console.log(`Total corridas: ${results.length} | Éxito combinado: ${(((foolSolved + visSolved) / results.length) * 100).toFixed(1)}%`);
    console.log('===================================================================\n');

    assert.ok(foolSolved >= 20, `El vector FOOL debe resolver al menos 20 de 25 casos (obtenido: ${foolSolved})`);
    assert.ok(visSolved >= 20, `El vector VISIONARY debe resolver al menos 20 de 25 casos (obtenido: ${visSolved})`);
  });
});

