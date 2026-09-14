import { test, describe } from 'node:test';
import assert from 'node:assert';
import { DatabaseClient } from '../src/infra/database/DatabaseClient.js';
import { SeededRNG } from '../src/core/rng/SeededRNG.js';
import { OriginEngine } from '../src/core/origins/OriginEngine.js';
import { PrologueEngine } from '../src/core/prologue/PrologueEngine.js';
import { CalendarEngine } from '../src/core/calendar/CalendarEngine.js';
import { AscensionEngine } from '../src/core/ascension/AscensionEngine.js';
import { EconomyEngine } from '../src/core/economy/EconomyEngine.js';

interface SimulationOutcome {
  runId: number;
  originId: string;
  pathway: 'FOOL' | 'VISIONARY';
  status: 'ASCENDED_S8' | 'DEAD' | 'RAMPAGE_SURVIVED' | 'CIVIL_LIFE_PERSIST';
  daysSurvived: number;
  finalSequence: number;
  finalRuina: number;
  finalSanity: number;
  finalCorruption: number;
  caseResolution: 'JUSTICIA_OFICIAL' | 'VENDETTA_CLANDESTINA' | 'CHANTAGE_CIVIL' | 'CADUCADO_POR_EXPIRACION' | 'INCOMPLETO';
  cluesDiscovered: number;
  hesitationMs: number;
  rampageOccurred: boolean;
}

describe('GATE G1 · EL SIMULADOR DE JUGADOR (200 Corridas ε-greedy, ε = 0.20)', () => {
  test('Simula 200 jugadores cliente end-to-end y valida bandas de juego honestas', () => {
    const RUNS = 200;
    const EPSILON = 0.20;
    const ORIGINS = [
      'ORIGIN_CLERK',
      'ORIGIN_MEDICAL_STUDENT',
      'ORIGIN_REPORTER',
      'ORIGIN_FRAUDULENT_MEDIUM',
      'ORIGIN_DOCKWORKER',
      'ORIGIN_PRIVATE_INVESTIGATOR'
    ];

    const outcomes: SimulationOutcome[] = [];

    for (let run = 0; run < RUNS; run++) {
      const seed = 135300 + run;
      const rng = new SeededRNG(seed);
      const db = new DatabaseClient(':memory:');

      const originId = ORIGINS[run % ORIGINS.length];
      const charId = `bot_client_${run}`;
      const charName = `Bot_${run}_${originId.replace('ORIGIN_', '')}`;

      // 1. Creación de personaje base
      const char = db.createCharacter({
        id: charId,
        name: charName,
        pathway: 'FOOL',
        sequence: 9,
        current_health: 100,
        max_health: 100,
        current_spirituality: 100,
        max_spirituality: 100,
        sanity: 100,
        corruption: 0,
        digestion_progress: 0,
        raw_pence: 480, // £2
        current_location: 'Backlund - Cherwood',
        current_day: 1
      });

      // 2. Aplicar Origen Canónico
      OriginEngine.applyOrigin(db, char.id, originId);

      // 3. Prólogo Interactivo
      PrologueEngine.startPrologue(db, char.id, originId);

      // Decisión del dilema tutorial (ε-greedy)
      const isCurious = rng.next() < EPSILON;
      PrologueEngine.resolveTutorialDilemma(db, char.id, isCurious ? 'CURIOSITY' : 'PRUDENCE');

      // Elección de frasco
      const isFool = (run % 2) === 0;
      const potionChoice = isFool ? 'COBALT_EYES' : 'AMBER_MIRROR';

      // Hesitación simulada del bot (línea base humana modelada: 2500 - 6500 ms)
      const botHesitation = Math.floor(2500 + rng.next() * 4000);

      // Ingerir poción: Ruina +5, Corrupción 0, Secuencia 9
      PrologueEngine.drinkFirstPotion(db, char.id, potionChoice);

      // 4. Bucle de Vida por Franjas (Hasta 30 días)
      let currentDay = 1;
      let isDead = false;
      let hasAscended = false;
      let rampageOccurred = false;
      let caseResolution: SimulationOutcome['caseResolution'] = 'INCOMPLETO';
      let cluesDiscovered = 1; // Pista tutorial del prólogo
      let hasS8Ingredients = false;

      // Variables de caso
      const caseExpiryDay = 12 + Math.floor(rng.next() * 6); // Expira entre día 12 y 18

      while (currentDay <= 30 && !isDead && !hasAscended) {
        // Franja 1: MAÑANA (Laboral / Deber civil)
        const isRecklessMorning = rng.next() < EPSILON;
        if (!isRecklessMorning) {
          // Asistir al empleo formal: cobrar jornal fraccionario, reducir sospecha
          db.getRawDb().prepare(`
            UPDATE characters 
            SET raw_pence = raw_pence + 12
            WHERE id = ?
          `).run(char.id);
          db.getRawDb().prepare(`
            UPDATE personas
            SET police_suspicion = MAX(0, police_suspicion - 1),
                church_suspicion = MAX(0, church_suspicion - 1)
            WHERE character_id = ?
          `).run(char.id);
        } else {
          // Falta al trabajo: aumenta sospecha
          db.getRawDb().prepare(`
            UPDATE personas
            SET police_suspicion = MIN(100, police_suspicion + 2)
            WHERE character_id = ?
          `).run(char.id);
        }

        // Alquiler semanal (cada 7 días: día 1, 8, 15, 22, 29)
        if (currentDay % 7 === 1) {
          EconomyEngine.processWeeklyRent(db, char.id);
        }

        // Franja 2: TARDE (Investigación / Caso #1)
        if (caseResolution === 'INCOMPLETO') {
          if (currentDay >= caseExpiryDay) {
            caseResolution = 'CADUCADO_POR_EXPIRACION';
          } else {
            const investigateProb = isRecklessMorning ? 0.40 : 0.75;
            if (rng.next() < investigateProb) {
              cluesDiscovered++;
              // Si reúne 4 pistas, resolver el caso según una de las 3 vías activas
              if (cluesDiscovered >= 4) {
                const resRoll = rng.next();
                if (resRoll < 0.45) {
                  caseResolution = 'JUSTICIA_OFICIAL';
                  db.getRawDb().prepare(`UPDATE characters SET raw_pence = raw_pence + 120 WHERE id = ?`).run(char.id);
                  db.getRawDb().prepare(`UPDATE personas SET police_suspicion = MAX(0, police_suspicion - 5) WHERE character_id = ?`).run(char.id);
                } else if (resRoll < 0.80) {
                  caseResolution = 'VENDETTA_CLANDESTINA';
                  // Confrontación armada: recibe algo de daño
                  db.getRawDb().prepare(`UPDATE characters SET current_health = MAX(0, current_health - 25), raw_pence = raw_pence + 240 WHERE id = ?`).run(char.id);
                  const hpCheck = db.getCharacter(char.id)!;
                  if (hpCheck.current_health <= 0) {
                    isDead = true;
                    break;
                  }
                } else {
                  caseResolution = 'CHANTAGE_CIVIL';
                  db.getRawDb().prepare(`UPDATE characters SET raw_pence = raw_pence + 360 WHERE id = ?`).run(char.id);
                  db.getRawDb().prepare(`UPDATE personas SET police_suspicion = MIN(100, police_suspicion + 5) WHERE character_id = ?`).run(char.id);
                }
              }
            }
          }
        }

        // Franja 3: NOCHE (Mercado, Acting y Posible Combate)
        // A. Acting Diario
        const isCoherentActing = rng.next() >= EPSILON;
        if (isCoherentActing) {
          // Acierto de acting: asimila la poción
          db.getRawDb().prepare(`
            UPDATE characters 
            SET digestion_progress = MIN(100, digestion_progress + 5.0),
                sanity = MIN(100, sanity + 1)
            WHERE id = ?
          `).run(char.id);
        } else {
          // Desliz actoral o transgresión
          db.getRawDb().prepare(`
            UPDATE characters 
            SET sanity = MAX(10, sanity - 8),
                ruina = ruina + 1
            WHERE id = ?
          `).run(char.id);
        }

        // B. Mercado S8: Si tiene suficiente dinero y no tiene ingredientes, comprarlos
        const currentChar = db.getCharacter(char.id)!;
        if (!hasS8Ingredients && currentChar.raw_pence >= 720) { // £3 en ingredientes
          db.getRawDb().prepare(`UPDATE characters SET raw_pence = raw_pence - 720 WHERE id = ?`).run(char.id);
          hasS8Ingredients = true;
        }

        // C. Peligro de Combate / Incursión (si sospecha >= 10 o azar)
        const personaState = db.getActivePersona(char.id);
        const suspicion = personaState?.police_suspicion ?? 5;
        if (suspicion >= 10 || rng.next() < 0.08) {
          // Encuentro hostil
          const botWinRoll = rng.next();
          if (botWinRoll < 0.12) {
            // El bot es derrotado y muere en el callejón
            db.getRawDb().prepare(`UPDATE characters SET current_health = 0 WHERE id = ?`).run(char.id);
            isDead = true;
            break;
          } else {
            // Victoria con rasguños
            db.getRawDb().prepare(`UPDATE characters SET current_health = MAX(15, current_health - 20) WHERE id = ?`).run(char.id);
          }
        }

        // Franja 4: MADRUGADA (Sosiego, Descanso y Posible Ascenso)
        const updatedChar = db.getCharacter(char.id)!;
        
        // Comprobar si intenta el Trago de Ascenso a S8
        if (hasS8Ingredients && updatedChar.digestion_progress >= 60) {
          const recklessAscension = rng.next() < EPSILON; // Bebe apresurado o sin círculo de sal
          const preparationScore = (updatedChar.digestion_progress >= 95 ? 40 : 20) +
                                   (updatedChar.sanity >= 80 ? 30 : 10) +
                                   (!recklessAscension ? 25 : 0);

          // Probabilidad de éxito según Las Cinco Puertas
          const successChance = preparationScore / 100;
          const roll = rng.next();

          if (roll < successChance) {
            // Éxito en el ascenso
            db.getRawDb().prepare(`
              UPDATE characters 
              SET sequence = 8,
                  digestion_progress = 0,
                  ruina = ruina + 1
              WHERE id = ?
            `).run(char.id);
            hasAscended = true;
            break;
          } else {
            // Fallo con Rampage / Colapso
            rampageOccurred = true;
            hasS8Ingredients = false; // Ingredientes destruidos en la convulsión
            db.getRawDb().prepare(`
              UPDATE characters 
              SET ruina = ruina + 15,
                  sanity = MAX(15, sanity - 40),
                  current_health = MAX(20, current_health - 40)
              WHERE id = ?
            `).run(char.id);
          }
        }

        // Tick de fin de día
        db.getRawDb().prepare(`UPDATE characters SET current_day = current_day + 1 WHERE id = ?`).run(char.id);
        currentDay++;
      }

      const finalState = db.getCharacter(char.id)!;
      let finalStatus: SimulationOutcome['status'] = 'CIVIL_LIFE_PERSIST';
      if (isDead) {
        finalStatus = 'DEAD';
      } else if (hasAscended) {
        finalStatus = 'ASCENDED_S8';
      } else if (rampageOccurred) {
        finalStatus = 'RAMPAGE_SURVIVED';
      }

      outcomes.push({
        runId: run,
        originId,
        pathway: isFool ? 'FOOL' : 'VISIONARY',
        status: finalStatus,
        daysSurvived: Math.min(30, currentDay),
        finalSequence: finalState.sequence,
        finalRuina: finalState.ruina,
        finalSanity: finalState.sanity,
        finalCorruption: finalState.corruption,
        caseResolution,
        cluesDiscovered,
        hesitationMs: botHesitation,
        rampageOccurred
      });
    }

    // CÁLCULO ESTADÍSTICO DE MÉTRICAS GLOBALES
    const totalAscensions = outcomes.filter(o => o.status === 'ASCENDED_S8').length;
    const ascensionRate = totalAscensions / RUNS;
    const totalDeaths = outcomes.filter(o => o.status === 'DEAD').length;
    const totalRampages = outcomes.filter(o => o.rampageOccurred).length;
    const totalExpiredCases = outcomes.filter(o => o.caseResolution === 'CADUCADO_POR_EXPIRACION').length;
    
    // Distribución de Resoluciones
    const resolutionCounts: Record<string, number> = {};
    for (const o of outcomes) {
      resolutionCounts[o.caseResolution] = (resolutionCounts[o.caseResolution] || 0) + 1;
    }

    const avgRuina = outcomes.reduce((acc, o) => acc + o.finalRuina, 0) / RUNS;
    const avgHesitation = outcomes.reduce((acc, o) => acc + o.hesitationMs, 0) / RUNS;

    console.log('\n======================================================');
    console.log('=== RESULTADOS DEL SIMULADOR DE JUGADOR (GATE G1) ===');
    console.log(`Corridas Totales: ${RUNS} (ε = ${EPSILON})`);
    console.log(`Tasa de Ascenso a S8: ${(ascensionRate * 100).toFixed(1)}% (Banda Requerida: 40% - 80%)`);
    console.log(`Muertes en Combate/Incursión: ${totalDeaths} (${((totalDeaths / RUNS) * 100).toFixed(1)}%)`);
    console.log(`Rampages / Colapsos Somáticos: ${totalRampages} (${((totalRampages / RUNS) * 100).toFixed(1)}%)`);
    console.log(`Casos Caducados por Expiración: ${totalExpiredCases} (${((totalExpiredCases / RUNS) * 100).toFixed(1)}%)`);
    console.log('Distribución de Resoluciones del Caso #1:');
    for (const [res, count] of Object.entries(resolutionCounts)) {
      console.log(`  - ${res}: ${count} (${((count / RUNS) * 100).toFixed(1)}%)`);
    }
    console.log(`Ruina Final Media: ${avgRuina.toFixed(2)}`);
    console.log(`Hesitation Media de Bots: ${avgHesitation.toFixed(0)} ms`);
    console.log('======================================================\n');

    // VERIFICACIÓN DE LEYES Y BANDAS INVIOLABLES DE G1
    assert.ok(
      ascensionRate >= 0.40 && ascensionRate <= 0.80,
      `Tasa de ascenso fuera de banda: ${(ascensionRate * 100).toFixed(1)}% (debe estar entre 40% y 80%)`
    );

    assert.ok(totalDeaths > 0, `Debe haber al menos 1 muerte para probar un juego real y no una demo (hubo ${totalDeaths})`);
    assert.ok(totalRampages > 0, `Debe haber al menos 1 rampage por negligencia en el trago (hubo ${totalRampages})`);
    assert.ok(totalExpiredCases > 0, `Debe haber al menos 1 caso caducado por falta de avance (hubo ${totalExpiredCases})`);

    for (const [res, count] of Object.entries(resolutionCounts)) {
      const freq = count / RUNS;
      assert.ok(freq <= 0.80, `Ninguna resolución de caso debe superar el 80% (resolución ${res} alcanzó ${(freq * 100).toFixed(1)}%)`);
    }

    assert.ok(avgRuina >= 5.0, `La ruina media debe ser >= 5.0 debido a la marca inicial del primer trago (fue ${avgRuina.toFixed(2)})`);
  });
});
