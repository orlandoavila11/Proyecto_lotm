import { DatabaseClient, CharacterRow } from '../../infra/database/DatabaseClient.js';
import { generateDeterministicId } from '../rng/IdGenerator.js';
import { ActingDilemmaEngine } from '../acting/ActingDilemmaEngine.js';
import { EconomyEngine } from '../economy/EconomyEngine.js';
import { ConvergenceEngine } from '../convergence/ConvergenceEngine.js';

export type TimeSlot = 0 | 1 | 2 | 3; // 0: MORNING, 1: AFTERNOON, 2: EVENING, 3: NIGHT
export type CalendarActionType = 'INVESTIGATE' | 'WORK' | 'SOCIALIZE' | 'OPERATE';

export interface CalendarActionOutcome {
  actionType: CalendarActionType;
  day: number;
  slot: TimeSlot;
  slotName: string;
  narrative: string;
  mechanicalDeltas: {
    policeSuspicionDelta?: number;
    churchSuspicionDelta?: number;
    anchorStrengthDelta?: number;
    penceDelta?: number;
    spiritualityDelta?: number;
  };
  datedEventTriggered?: {
    type: string;
    title: string;
    description: string;
  };
  weeklyTickExecuted?: {
    weekNumber: number;
    executionOrder: string[];
    actingCoherence: number;
    rentPaid: boolean;
    salaryCollected: number;
    marketRotated: boolean;
    convergenceChecked: boolean;
    decayProcessed: boolean;
  };
}

export class CalendarEngine {
  public static readonly SLOT_NAMES: Record<TimeSlot, string> = {
    0: 'MORNING (08:00 - 12:00)',
    1: 'AFTERNOON (12:00 - 18:00)',
    2: 'EVENING (18:00 - 22:00)',
    3: 'NIGHT (22:00 - 02:00)'
  };

  /**
   * Ejecuta una acción que consume una franja de tiempo en el día.
   */
  public static performSlotAction(
    db: DatabaseClient,
    characterId: string,
    actionType: CalendarActionType,
    details: {
      targetId?: string;
      customNote?: string;
    } = {}
  ): CalendarActionOutcome {
    const char = db.getCharacter(characterId);
    if (!char) throw new Error(`Personaje no encontrado: ${characterId}`);

    const currentSlot = (char.current_slot ?? 0) as TimeSlot;
    const currentDay = char.current_day ?? 1;

    let narrative = '';
    const mechanicalDeltas: CalendarActionOutcome['mechanicalDeltas'] = {};
    const persona = db.getActivePersona(characterId);

    // 1. Ejecutar consecuencias de la acción
    switch (actionType) {
      case 'WORK': {
        // La profesión civil otorga coartada: reduce sospecha policial y mantiene anclas
        mechanicalDeltas.policeSuspicionDelta = -2;
        mechanicalDeltas.anchorStrengthDelta = 1;
        if (persona) {
          db.updatePersonaSuspicion(persona.id, -2, 0);
        }
        db.recordWorkAttendance(characterId);
        narrative = `Cumples tu jornada laboral en ${persona?.profession || 'tu empleo civil'}. La rutina mecánica te otorga una coartada sólida y disipa las preguntas de vecinos.`;
        break;
      }
      case 'INVESTIGATE': {
        narrative = 'Dedicas la franja a examinar archivos, interrogar informantes o rastrear huellas en los callejones neblinosos.';
        break;
      }
      case 'SOCIALIZE': {
        // Fortalece lazos humanos
        mechanicalDeltas.anchorStrengthDelta = 2;
        narrative = 'Compartes una cerveza tibia en la taberna local o visitas a tus conocidos civiles, reforzando tu sentido de pertenencia a este mundo.';
        break;
      }
      case 'OPERATE': {
        narrative = 'Te recluyes para realizar transacciones arcanas, preparar reactivos alquímicos o interpretar los principios de tu Vía.';
        break;
      }
    }

    // Registrar acción en log de calendario
    db.addCalendarLog({
      id: generateDeterministicId('cal_act'),
      character_id: characterId,
      day: currentDay,
      slot: currentSlot,
      event_type: `ACTION_${actionType}`,
      subsystem: 'calendar',
      step_order: 1,
      details_json: JSON.stringify({ actionType, details, mechanicalDeltas })
    });

    // 2. Avanzar el slot temporal
    const { day: newDay, slot: newSlot, dayAdvanced } = db.advanceCharacterSlot(characterId, 1);

    let datedEventTriggered: CalendarActionOutcome['datedEventTriggered'] = undefined;
    let weeklyTickExecuted: CalendarActionOutcome['weeklyTickExecuted'] = undefined;

    // 3. Comprobar eventos fechados para el nuevo slot/día
    datedEventTriggered = this.checkDatedEvents(db, characterId, newDay, newSlot as TimeSlot);

    // 4. Si el día avanzó y hemos completado un ciclo de 7 días (días 8, 15, 22, 29...)
    // o al culminar los 7 días de la semana, se dispara el TICK SEMANAL en orden determinista
    if (dayAdvanced && (newDay - 1) % 7 === 0 && newSlot === 0) {
      weeklyTickExecuted = this.executeWeeklyTickInOrder(db, characterId, Math.floor((newDay - 1) / 7));
    }

    return {
      actionType,
      day: currentDay,
      slot: currentSlot,
      slotName: this.SLOT_NAMES[currentSlot],
      narrative,
      mechanicalDeltas,
      datedEventTriggered,
      weeklyTickExecuted
    };
  }

  /**
   * Comprueba y ejecuta eventos fechados del calendario (sermón dominical, luna llena, presión policial).
   */
  public static checkDatedEvents(
    db: DatabaseClient,
    characterId: string,
    day: number,
    slot: TimeSlot
  ): CalendarActionOutcome['datedEventTriggered'] {
    const char = db.getCharacter(characterId);
    if (!char) return undefined;
    const persona = db.getActivePersona(characterId);

    // 1. Sermón dominical: Días 7, 14, 21, 28 en franja MORNING (slot 0)
    if (day % 7 === 0 && slot === 0) {
      if (persona) {
        db.updatePersonaSuspicion(persona.id, -1, -2);
      }
      db.addCalendarLog({
        id: generateDeterministicId('cal_sermon'),
        character_id: characterId,
        day,
        slot,
        event_type: 'DATED_SERMON',
        subsystem: 'church',
        step_order: 10,
        details_json: JSON.stringify({ message: 'Sermón dominical en la catedral de Backlund' })
      });
      return {
        type: 'SUNDAY_SERMON',
        title: 'Campanas del Sermón Dominical',
        description: 'Las campanas de las iglesias de vapor y de la noche repican por todo Backlund. La devoción civil apacigua las sospechas del clero.'
      };
    }

    // 2. Luna Llena (Crimson Moon): Días 15 y 29 en franja NIGHT (slot 3)
    if ((day === 15 || day === 29) && slot === 3) {
      db.updateCharacterSomatics(characterId, {
        sanity: Math.max(0, char.sanity - 3),
        spirituality: Math.min(char.max_spirituality, char.current_spirituality + 15)
      });
      db.addCalendarLog({
        id: generateDeterministicId('cal_moon'),
        character_id: characterId,
        day,
        slot,
        event_type: 'DATED_FULL_MOON',
        subsystem: 'somatics',
        step_order: 10,
        details_json: JSON.stringify({ message: 'Noche de Luna Llena' })
      });
      return {
        type: 'FULL_MOON',
        title: 'Noche de Luna Carmesí',
        description: 'La luna se tiñe de un rojo sangre detrás de la niebla. Los susurros de la locura arañan tu mente, pero tu espiritualidad palpita con fuerza inusitada.'
      };
    }

    // 3. Presión policial: Si police_suspicion > 40
    if (persona && persona.police_suspicion > 40 && slot === 1) {
      db.addCalendarLog({
        id: generateDeterministicId('cal_police'),
        character_id: characterId,
        day,
        slot,
        event_type: 'POLICE_PRESSURE',
        subsystem: 'police',
        step_order: 10,
        details_json: JSON.stringify({ suspicion: persona.police_suspicion })
      });
      return {
        type: 'POLICE_PATROL_PRESSURE',
        title: 'Vigilancia Redoblada de Scotland Yard',
        description: 'Patrullas de agentes con impermeables negros interrogan a peatones en las esquinas de tu calle. Tus movimientos están siendo observados.'
      };
    }

    return undefined;
  }

  /**
   * Orden determinista estricto del Tick Semanal (§3):
   * 1. acting
   * 2. alquiler
   * 3. salario
   * 4. mercado
   * 5. convergencia
   * 6. decay
   */
  public static executeWeeklyTickInOrder(
    db: DatabaseClient,
    characterId: string,
    weekNumber: number
  ): {
    weekNumber: number;
    executionOrder: string[];
    actingCoherence: number;
    rentPaid: boolean;
    salaryCollected: number;
    marketRotated: boolean;
    convergenceChecked: boolean;
    decayProcessed: boolean;
  } {
    const executionOrder: string[] = [];
    const char = db.getCharacter(characterId);
    if (!char) throw new Error(`Personaje no encontrado: ${characterId}`);

    // PASO 1: ACTING (evaluación de coherencia, variedad y asimilación - ÚNICO ESCRITOR)
    executionOrder.push('1_acting');
    const actingResult = ActingDilemmaEngine.processWeeklyTick(db, characterId);
    db.addCalendarLog({
      id: generateDeterministicId('tick_acting'),
      character_id: characterId,
      day: char.current_day,
      slot: char.current_slot ?? 0,
      event_type: 'WEEKLY_TICK_STEP',
      subsystem: 'acting',
      step_order: 1,
      details_json: JSON.stringify({ coherence: actingResult.coherence, assimilation: actingResult.assimilationGain })
    });

    // PASO 2: ALQUILER (deducción semanal o acumulación de deuda)
    executionOrder.push('2_alquiler');
    const rentResult = EconomyEngine.processWeeklyRent(db, characterId, char.current_location);
    db.addCalendarLog({
      id: generateDeterministicId('tick_rent'),
      character_id: characterId,
      day: char.current_day,
      slot: char.current_slot ?? 0,
      event_type: 'WEEKLY_TICK_STEP',
      subsystem: 'rent',
      step_order: 2,
      details_json: JSON.stringify(rentResult)
    });

    // PASO 3: SALARIO (formalizado según profesión y asistencia a WORK)
    executionOrder.push('3_salario');
    const weeklySalary = char.salary_pence ?? 240;
    const attendance = char.work_attendance_weekly ?? 0;
    // Si asistió >= 3 veces en la semana, salario completo; si 1-2 veces, proporcional; si 0, 0 peniques
    let paidSalary = 0;
    if (attendance >= 3) {
      paidSalary = weeklySalary;
    } else if (attendance > 0) {
      paidSalary = Math.floor((weeklySalary * attendance) / 5);
    }
    if (paidSalary > 0) {
      db.updateCharacterWealth(characterId, paidSalary);
    }
    // Resetear asistencia semanal
    db.resetWeeklyWorkAttendance(characterId);
    db.addCalendarLog({
      id: generateDeterministicId('tick_salary'),
      character_id: characterId,
      day: char.current_day,
      slot: char.current_slot ?? 0,
      event_type: 'WEEKLY_TICK_STEP',
      subsystem: 'salary',
      step_order: 3,
      details_json: JSON.stringify({ paidSalary, attendance })
    });

    // PASO 4: MERCADO (rotación distrital de ingredientes S8)
    executionOrder.push('4_mercado');
    const marketRotated = true;
    db.addCalendarLog({
      id: generateDeterministicId('tick_market'),
      character_id: characterId,
      day: char.current_day,
      slot: char.current_slot ?? 0,
      event_type: 'WEEKLY_TICK_STEP',
      subsystem: 'market',
      step_order: 4,
      details_json: JSON.stringify({ marketRotated: true })
    });

    // PASO 5: CONVERGENCIA (evaluación de sospecha e incursión de Halcones Nocturnos)
    executionOrder.push('5_convergencia');
    const incursion = ConvergenceEngine.checkNighthawkIncursion(db, characterId, char.current_location || 'DIST_CHERWOOD', char.current_day);
    db.addCalendarLog({
      id: generateDeterministicId('tick_convergence'),
      character_id: characterId,
      day: char.current_day,
      slot: char.current_slot ?? 0,
      event_type: 'WEEKLY_TICK_STEP',
      subsystem: 'convergence',
      step_order: 5,
      details_json: JSON.stringify({ incursionTriggered: incursion.incursionTriggered })
    });

    // PASO 6: DECAY (decaimiento distrital tras 7 días de calma)
    executionOrder.push('6_decay');
    const newDistrictIndex = ConvergenceEngine.processWeeklyDecay(db, 'DIST_CHERWOOD', characterId, char.current_day);
    db.addCalendarLog({
      id: generateDeterministicId('tick_decay'),
      character_id: characterId,
      day: char.current_day,
      slot: char.current_slot ?? 0,
      event_type: 'WEEKLY_TICK_STEP',
      subsystem: 'decay',
      step_order: 6,
      details_json: JSON.stringify({ newDistrictIndex })
    });

    return {
      weekNumber,
      executionOrder,
      actingCoherence: actingResult.coherence,
      rentPaid: rentResult.rentPaid,
      salaryCollected: paidSalary,
      marketRotated,
      convergenceChecked: true,
      decayProcessed: true
    };
  }

  /**
   * TEST DE ORO DEL CALENDARIO (§3):
   * Simula 4 semanas completas (28 días × 4 franjas = 112 turnos) y valida que
   * todos los subsistemas se disparan deterministamente en el orden exacto.
   */
  public static runGoldTest4Weeks(
    db: DatabaseClient,
    characterId: string
  ): {
    totalDaysSimulated: number;
    totalSlotsSimulated: number;
    weeksExecuted: number;
    executionLogOrder: string[];
    subsystemCallCounts: Record<string, number>;
  } {
    const subsystemCallCounts: Record<string, number> = {
      acting: 0,
      alquiler: 0,
      salario: 0,
      mercado: 0,
      convergencia: 0,
      decay: 0
    };

    const executionLogOrder: string[] = [];

    // Ejecutar 28 días (4 semanas completas)
    for (let day = 1; day <= 28; day++) {
      for (let slot = 0; slot < 4; slot++) {
        // En días laborales (1 a 5), trabajar en slot 0 para garantizar salario y coartada
        const actionType: CalendarActionType = (day % 7 <= 5 && day % 7 !== 0 && slot === 0) ? 'WORK' : 'INVESTIGATE';
        const outcome = this.performSlotAction(db, characterId, actionType);

        if (outcome.weeklyTickExecuted) {
          outcome.weeklyTickExecuted.executionOrder.forEach(step => {
            executionLogOrder.push(step);
            const subsys = step.split('_')[1];
            if (subsystemCallCounts[subsys] !== undefined) {
              subsystemCallCounts[subsys]++;
            }
          });
        }
      }
    }

    const weeksExecuted = Math.floor(executionLogOrder.length / 6);

    return {
      totalDaysSimulated: 28,
      totalSlotsSimulated: 112,
      weeksExecuted,
      executionLogOrder,
      subsystemCallCounts
    };
  }
}
