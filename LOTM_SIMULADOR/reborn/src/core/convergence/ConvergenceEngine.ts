import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseClient } from '../../infra/database/DatabaseClient.js';
import { SeededRNG } from '../rng/SeededRNG.js';
import { generateDeterministicId } from '../rng/IdGenerator.js';
import { SomaticsEngine } from '../somatics/SomaticsEngine.js';
import { RuinaTier } from '../types/somatics.js';
import {
  ConvergenceBalance,
  ConvergenceBalanceSchema
} from '../../infra/content/schemas/convergenceBalance.schema.js';
import {
  ConvergenceEventType,
  ConvergenceEncounterType,
  ConvergenceEncounterResult,
  IncursionResult,
  IncursionResolution
} from '../types/convergence.js';

export class ConvergenceEngine {
  private static balanceData: ConvergenceBalance | null = null;
  private static sefiraGroupsData: any = null;
  private static combatantsData: any[] | null = null;

  public static getConvergenceBalance(): ConvergenceBalance {
    if (!this.balanceData) {
      const packageRoot = fileURLToPath(new URL('../../..', import.meta.url));
      const filePath = path.join(packageRoot, 'data', 'gameplay', 'balance', 'convergence.json');
      const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      this.balanceData = ConvergenceBalanceSchema.parse(raw);
    }
    return this.balanceData;
  }

  public static getSefiraGroups(): any {
    if (!this.sefiraGroupsData) {
      const packageRoot = fileURLToPath(new URL('../../..', import.meta.url));
      const filePath = path.join(packageRoot, 'data', 'gameplay', 'sefira_groups.json');
      this.sefiraGroupsData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
    return this.sefiraGroupsData;
  }

  public static getCombatants(): any[] {
    if (!this.combatantsData) {
      const packageRoot = fileURLToPath(new URL('../../..', import.meta.url));
      const filePath = path.join(packageRoot, 'data', 'gameplay', 'combatants', 'combatants.json');
      this.combatantsData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
    return this.combatantsData!;
  }

  /**
   * Resuelve el Séfira dominante de una vía canónica.
   */
  public static resolveDominantSefira(pathway: string): string {
    const pUpper = pathway.toUpperCase();
    const sefiraData = this.getSefiraGroups();
    for (const [groupKey, groupDef] of Object.entries<any>(sefiraData.groups)) {
      if (groupDef.pathways && groupDef.pathways.includes(pUpper)) {
        return groupKey;
      }
    }
    // Mapeo canónico explícito de contingencia
    if (pUpper === 'FOOL' || pUpper === 'SEER' || pUpper === 'DOOR' || pUpper === 'ERROR') return 'LOTM';
    if (pUpper === 'VISIONARY' || pUpper === 'SPECTATOR' || pUpper === 'SUN' || pUpper === 'TYRANT' || pUpper === 'WHITE_TOWER' || pUpper === 'HANGED_MAN') return 'GOD_ALMIGHTY';
    if (pUpper === 'DARKNESS' || pUpper === 'DEATH' || pUpper === 'TWILIGHT_GIANT') return 'DEATH_CLUSTER';
    if (pUpper === 'HUNTER' || pUpper === 'ASSASSIN') return 'CALAMITY_CLUSTER';
    return 'LOTM';
  }

  /**
   * Registra un evento que altera el índice de convergencia distrital.
   */
  public static recordConvergenceEvent(
    db: DatabaseClient,
    characterId: string,
    districtId: string,
    eventType: ConvergenceEventType,
    day: number,
    customDelta?: number
  ): number {
    const balance = this.getConvergenceBalance();
    let delta = 0;

    if (customDelta !== undefined) {
      delta = customDelta;
    } else {
      switch (eventType) {
        case 'PUBLIC_COMBAT':
          delta = balance.sources.public_combat_index_gain;
          break;
        case 'ASCENSION':
          delta = balance.sources.ascension_index_gain;
          break;
        case 'ECCLESIASTICAL_DILEMMA':
          delta = balance.sources.ecclesiastical_dilemma_gain_low;
          break;
        case 'WHISPER_PURCHASE':
          delta = balance.sources.whisper_purchase_gain;
          break;
        case 'DECAY':
          delta = balance.decay.weekly_decay_per_district;
          break;
      }
    }

    const resultingIndex = db.updateDistrictConvergence(districtId, delta, day);
    const eventId = generateDeterministicId('cve');

    db.logConvergenceEvent({
      id: eventId,
      character_id: characterId,
      district_id: districtId,
      event_type: eventType,
      index_delta: delta,
      resulting_index: resultingIndex,
      day
    });

    return resultingIndex;
  }

  /**
   * Ejecuta el decaimiento semanal (-5) en un distrito si no han ocurrido incidentes en los últimos 7 días.
   */
  public static processWeeklyDecay(
    db: DatabaseClient,
    districtId: string,
    characterId: string,
    currentDay: number
  ): number {
    const district = db.getDistrict(districtId);
    if (!district) return 0;

    const lastIncidentDay = district.last_incident_day ?? 0;
    if (currentDay - lastIncidentDay >= 7) {
      return this.recordConvergenceEvent(db, characterId, districtId, 'DECAY', currentDay);
    }
    return district.convergence_index ?? 0;
  }

  /**
   * Calcula el índice efectivo de convergencia considerando el distrito y el bono de Ruina del personaje.
   */
  public static getEffectiveConvergenceIndex(
    db: DatabaseClient,
    characterId: string,
    districtId: string
  ): { baseDistrictIndex: number; ruinaBonus: number; effectiveIndex: number; ruinaTier: RuinaTier } {
    const balance = this.getConvergenceBalance();
    const district = db.getDistrict(districtId);
    const baseDistrictIndex = district ? (district.convergence_index ?? 0) : 0;

    const char = db.getCharacter(characterId);
    const ruinaValue = char?.ruina ?? 0;
    const ruinaTier = SomaticsEngine.getRuinaTier(ruinaValue).tier;
    const ruinaBonus = balance.ruina_effective_bonus[ruinaTier] ?? 0;
    const effectiveIndex = Math.min(balance.decay.maximum_index, Math.max(0, baseDistrictIndex + ruinaBonus));

    return {
      baseDistrictIndex,
      ruinaBonus,
      effectiveIndex,
      ruinaTier
    };
  }

  /**
   * Generador de encuentros por atracción mística y ley de características extraordinarias.
   */
  public static rollEncounter(
    db: DatabaseClient,
    characterId: string,
    districtId: string,
    rng: SeededRNG
  ): ConvergenceEncounterResult {
    const balance = this.getConvergenceBalance();
    const char = db.getCharacter(characterId);
    if (!char) {
      throw new Error(`Character '${characterId}' not found`);
    }

    const { effectiveIndex } = this.getEffectiveConvergenceIndex(db, characterId, districtId);
    const rollChance = Math.min(100, balance.encounter_roll.base_chance_percentage + (effectiveIndex * balance.encounter_roll.index_factor));
    const rollValue = rng.nextInt(0, 100);
    const occurred = rollValue < rollChance;

    const dominantSefira = this.resolveDominantSefira(char.pathway);
    if (!occurred) {
      return {
        occurred: false,
        effectiveIndex,
        rollChance,
        rollValue,
        dominantSefira,
        encounterPool: dominantSefira,
        isDominantMatching: false,
        description: 'Las brumas de Backlund permanecen silenciosas; las características extraordinarias no han colisionado.'
      };
    }

    // Encuentro ocurrido: atracción séfira dominante (70% matching, 30% abierto)
    const isDominantMatching = rng.checkChance(balance.encounter_roll.dominant_sefira_attraction_percentage);
    let selectedPool = dominantSefira;

    if (!isDominantMatching) {
      // POOL RIVER (DEATH_CLUSTER) excluido del pool abierto: los Nighthawks solo llegan vía incursión ordenada
      const allPools = ['LOTM', 'GOD_ALMIGHTY', 'CALAMITY_CLUSTER', 'MOTHER_CLUSTER', 'ORDER_CLUSTER', 'ABYSS_CLUSTER'];
      const openPools = allPools.filter(p => p !== dominantSefira);
      selectedPool = openPools[rng.nextInt(0, openPools.length - 1)];
    }

    // Tipo de encuentro determinista
    const typeRoll = rng.nextInt(1, 100);
    let encounterType: ConvergenceEncounterType = 'SKIRMISH';
    if (typeRoll > 75) {
      encounterType = 'SECONDARY_CLUE';
    } else if (typeRoll > 50) {
      encounterType = 'UNCOMFORTABLE_WITNESS';
    }

    // Si es escaramuza, seleccionar combatiente del pool
    const allCombatants = this.getCombatants();
    const poolCombatants = allCombatants.filter(c => c.sefiraGroupRef === selectedPool);
    const chosenCombatant = poolCombatants.length > 0 
      ? poolCombatants[rng.nextInt(0, poolCombatants.length - 1)] 
      : allCombatants[0];

    let description = '';
    if (encounterType === 'SKIRMISH') {
      description = `Atracción de convergencia [${selectedPool}]: Las características místicas atrajeron a ${chosenCombatant.name}.`;
    } else if (encounterType === 'UNCOMFORTABLE_WITNESS') {
      description = `Atracción de convergencia [${selectedPool}]: Un testigo bajo el influjo de la misma resonancia espiritual observa tus pasos.`;
    } else {
      description = `Atracción de convergencia [${selectedPool}]: Ecos astrales revelan rastros y pistas ocultas en los callejones del distrito.`;
    }

    return {
      occurred: true,
      effectiveIndex,
      rollChance,
      rollValue,
      dominantSefira,
      encounterPool: selectedPool,
      isDominantMatching,
      encounterType,
      combatantId: chosenCombatant?.id,
      combatantName: chosenCombatant?.name,
      description
    };
  }

  /**
   * Comprueba si procede una incursión forzosa de los Halcones Nocturnos (church_suspicion > 60).
   */
  public static checkNighthawkIncursion(
    db: DatabaseClient,
    characterId: string,
    districtId: string,
    day: number
  ): IncursionResult {
    const balance = this.getConvergenceBalance();
    const persona = db.getActivePersona(characterId);
    if (!persona) {
      return {
        incursionTriggered: false,
        squadCombatants: [],
        narrativeWarning: ''
      };
    }

    if (persona.church_suspicion > balance.incursion.trigger_church_suspicion_threshold) {
      const incursionId = generateDeterministicId('inc_nighthawk');
      db.createPendingIncursion({
        id: incursionId,
        character_id: characterId,
        district_id: districtId,
        squad_type: 'NIGHTHAWKS_SQUAD',
        church_suspicion_snapshot: persona.church_suspicion,
        day
      });

      const narrativeWarning = 
        `"Una sensación desagradable atraviesa tu estómago.\n` +
        `No te encontraron esta noche.\n` +
        `Te encontraron hace semanas."\n\n` +
        `[AVISO DIEGÉTICO · ALLANAMIENTO ECLESIÁSTICO]\n` +
        `"Un golpe seco y pesado retumba contra la puerta reforzada de tu refugio. Entre las rendijas carcomidas del marco se filtra un perfume helado a lavanda, serenidad y noche profunda.\n` +
        `Los latidos de tu corazón se aceleran cuando una voz pausada, severa y sin titubeos corta la quietud del callejón:\n\n` +
        `'Abra en nombre de la Policía Especial del Buró de Backlund y la Sagrada Catedral de San Samuel. Sabemos exactamente qué secretos y perturbaciones esconde tras ese cerrojo.'\n\n` +
        `Sombras armadas con gabardinas negras y revólveres de plata rodean las salidas. El tiempo del disimulo ha terminado."`;

      return {
        incursionTriggered: true,
        incursionId,
        squadCombatants: [...balance.incursion.default_nighthawk_squad],
        narrativeWarning
      };
    }

    return {
      incursionTriggered: false,
      squadCombatants: [],
      narrativeWarning: ''
    };
  }

  /**
   * Resuelve una incursión de Halcones Nocturnos (purgando sospecha si el PJ sobrevive o huye).
   */
  public static resolveIncursion(
    db: DatabaseClient,
    characterId: string,
    outcome: 'VICTORY' | 'FLED' | 'DEFEAT'
  ): IncursionResolution {
    const balance = this.getConvergenceBalance();
    const persona = db.getActivePersona(characterId);
    const pending = db.getPendingIncursion(characterId);

    const prevSuspicion = persona ? persona.church_suspicion : 0;
    let suspicionPurged = 0;

    if (outcome === 'VICTORY' || outcome === 'FLED') {
      suspicionPurged = Math.abs(balance.incursion.purge_suspicion_on_resolution);
      if (persona) {
        db.updatePersonaSuspicion(persona.id, 0, balance.incursion.purge_suspicion_on_resolution);
      }
      if (pending) {
        db.updateIncursionStatus(pending.id, outcome === 'VICTORY' ? 'RESOLVED' : 'FLED');
      }
    } else {
      if (pending) {
        db.updateIncursionStatus(pending.id, 'RESOLVED');
      }
    }

    const updatedPersona = db.getActivePersona(characterId);
    const currentSuspicion = updatedPersona ? updatedPersona.church_suspicion : 0;

    let narrativeLog = '';
    if (outcome === 'VICTORY') {
      narrativeLog = `Has repelido a la escuadra de Halcones Nocturnos. Las sombras se repliegan y la Iglesia se ve obligada a reconfigurar sus líneas de vigilancia (-${suspicionPurged} sospecha eclesiástica).`;
    } else if (outcome === 'FLED') {
      narrativeLog = `Has escapado por los tejados de Backlund en medio del allanamiento. Tu refugio anterior ha quedado inutilizado, pero has roto el cerco inquisitorial (-${suspicionPurged} sospecha eclesiástica).`;
    } else {
      narrativeLog = 'Has caído ante la escuadra inquisitorial. Las cadenas de plata sellan tu destino bajo la custodia de la Catedral de San Samuel.';
    }

    return {
      status: outcome === 'DEFEAT' ? 'DEFEAT' : (outcome === 'VICTORY' ? 'RESOLVED' : 'FLED'),
      suspicionPurged,
      previousSuspicion: prevSuspicion,
      currentSuspicion,
      narrativeLog
    };
  }
}
