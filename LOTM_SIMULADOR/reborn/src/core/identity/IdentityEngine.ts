import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseClient, CharacterRow } from '../../infra/database/DatabaseClient.js';
import { generateDeterministicId } from '../rng/IdGenerator.js';
import { SeededRNG } from '../rng/SeededRNG.js';

export interface IdentityEventOption {
  text: string;
  description: string;
  statOutcome: {
    poundsDelta?: number;
    suspicionDelta?: number;
    sanityDelta?: number;
    anchorDelta?: number;
  };
}

export interface IdentityEventRaw {
  id: string;
  category: string;
  title: string;
  description: string;
  targetSocialClass: 'MIDDLE_CLASS' | 'WORKING_CLASS' | 'ARISTOCRAT' | 'ALL';
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  consequences: {
    suspicionIncrease: number;
    financialCostPounds: number;
    sanityImpact: number;
    anchorImpact: number;
    forcesRelocation: boolean;
  };
  options: IdentityEventOption[];
}

export class IdentityEngine {
  private static eventCache: IdentityEventRaw[] | null = null;

  public static getEvents(): IdentityEventRaw[] {
    if (!this.eventCache) {
      const packageRoot = fileURLToPath(new URL('../../..', import.meta.url));
      const filePath = path.join(packageRoot, 'data', 'content', 'events', 'identity_events.json');
      const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      this.eventCache = raw as IdentityEventRaw[];
    }
    return this.eventCache;
  }

  /**
   * Evalúa y selecciona un evento de identidad congruente con la clase social, distrito,
   * sospecha acumulada y racha de ausentismo laboral del personaje.
   */
  public static rollIdentityEvent(
    db: DatabaseClient,
    characterId: string,
    seed: number = 1353
  ): IdentityEventRaw | null {
    const char = db.getCharacter(characterId);
    if (!char) throw new Error(`Personaje no encontrado: ${characterId}`);

    const persona = db.getActivePersona(characterId);
    const socialClass = persona?.social_class || 'MIDDLE_CLASS';
    const totalSuspicion = (persona?.police_suspicion || 0) + (persona?.church_suspicion || 0);
    const consecutiveMissed = char.consecutive_work_missed ?? 0;

    const allEvents = this.getEvents();

    // 1. Filtrar por clase social
    let candidates = allEvents.filter(e => e.targetSocialClass === 'ALL' || e.targetSocialClass === socialClass);

    // 2. Si hay ausencia laboral prolongada (>2 turnos/días sin trabajar),
    // priorizar eventos de sospecha o exposición vecinal
    if (consecutiveMissed > 2) {
      const pressureEvents = candidates.filter(e => 
        e.category === 'INVESTIGACION_POLICIAL' || 
        e.category === 'VECINO_SOSPECHOSO' || 
        e.category === 'EXPOSICION_ACCIDENTAL'
      );
      if (pressureEvents.length > 0) {
        candidates = pressureEvents;
      }
    } else {
      // Filtrar por nivel de riesgo vs sospecha
      if (totalSuspicion < 20) {
        // Sospecha baja: eventos de riesgo bajo
        const lowRisk = candidates.filter(e => e.riskLevel === 'LOW' || e.riskLevel === 'MEDIUM');
        if (lowRisk.length > 0) candidates = lowRisk;
      } else if (totalSuspicion > 50) {
        // Sospecha alta: eventos de riesgo medio y alto
        const highRisk = candidates.filter(e => e.riskLevel === 'HIGH' || e.riskLevel === 'MEDIUM');
        if (highRisk.length > 0) candidates = highRisk;
      }
    }

    if (candidates.length === 0) return null;

    const rng = new SeededRNG(seed + char.current_day * 10 + (char.current_slot ?? 0));
    const chosenIndex = Math.floor(rng.next() * candidates.length);
    return candidates[chosenIndex];
  }

  /**
   * Resuelve la opción elegida por el jugador para un evento de identidad,
   * aplicando los impactos económicos, somáticos, anclas y sospechas.
   */
  public static resolveIdentityEvent(
    db: DatabaseClient,
    characterId: string,
    eventId: string,
    optionIndex: number
  ): {
    event: IdentityEventRaw;
    chosenOption: IdentityEventOption;
    deltasApplied: {
      penceDelta: number;
      suspicionDelta: number;
      sanityDelta: number;
      anchorDelta: number;
    };
    newPence: number;
    newSanity: number;
  } {
    const char = db.getCharacter(characterId);
    if (!char) throw new Error(`Personaje no encontrado: ${characterId}`);

    const allEvents = this.getEvents();
    const event = allEvents.find(e => e.id === eventId);
    if (!event) throw new Error(`Evento de identidad no encontrado: ${eventId}`);

    if (optionIndex < 0 || optionIndex >= event.options.length) {
      throw new Error(`Índice de opción inválido: ${optionIndex}. El evento solo contiene ${event.options.length} opciones.`);
    }

    const history = db.getIdentityEventHistory(characterId, 50);
    const currentSlot = char.current_slot ?? 0;
    const currentDay = char.current_day ?? 1;
    const alreadyResolved = history.some(h => h.event_id === eventId && h.day === currentDay && h.slot === currentSlot);
    if (alreadyResolved) {
      throw new Error(`El evento de identidad '${eventId}' ya fue resuelto en la franja actual (Día ${currentDay}, Franja ${currentSlot}).`);
    }

    const chosenOption = event.options[optionIndex];
    const outcome = chosenOption.statOutcome;

    // Convertir pounds a peniques (1 libra = 240 peniques)
    const penceDelta = (outcome.poundsDelta || 0) * 240;
    const suspicionDelta = outcome.suspicionDelta || 0;
    const sanityDelta = outcome.sanityDelta || 0;
    const anchorDelta = outcome.anchorDelta || 0;

    // 1. Aplicar dinero
    const newPence = db.updateCharacterWealth(characterId, penceDelta);

    // 2. Aplicar sospecha civil
    const persona = db.getActivePersona(characterId);
    if (persona) {
      db.updatePersonaSuspicion(persona.id, suspicionDelta, 0);
    }

    // 3. Aplicar sanidad
    const newSanity = Math.max(0, Math.min(100, char.sanity + sanityDelta));
    db.updateCharacterSomatics(characterId, { sanity: newSanity });

    // 4. Aplicar anclas
    if (anchorDelta !== 0) {
      const anchors = db.getAnchors(characterId);
      if (anchors.length > 0) {
        const targetAnchor = anchors[0];
        const newStrength = Math.max(0, Math.min(100, targetAnchor.strength + anchorDelta));
        db.getRawDb().prepare('UPDATE anchors SET strength = ? WHERE id = ?').run(newStrength, targetAnchor.id);
      }
    }

    // 5. Registrar en historial de eventos de identidad
    db.addIdentityEventHistory({
      id: db.nextId('id_ev'),
      character_id: characterId,
      event_id: event.id,
      event_category: event.category,
      chosen_option_index: optionIndex,
      day: currentDay,
      slot: currentSlot,
      stat_outcome_json: JSON.stringify(outcome)
    });

    return {
      event,
      chosenOption,
      deltasApplied: {
        penceDelta,
        suspicionDelta,
        sanityDelta,
        anchorDelta
      },
      newPence,
      newSanity
    };
  }
}

