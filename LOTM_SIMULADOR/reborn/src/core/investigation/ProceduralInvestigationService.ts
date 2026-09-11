import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CanonicalPathwayId } from '../types/pathway.js';
import { DatabaseClient } from '../../infra/database/DatabaseClient.js';
import { SeededRNG } from '../rng/SeededRNG.js';

export type InvestigationMethod = 
  | 'SPIRITUAL_DIVINATION'
  | 'PSYCHOLOGICAL_ANALYSIS'
  | 'LOGICAL_RATIOCINATION'
  | 'FORENSIC_TRACKING';

export interface ProceduralCaseTemplate {
  code: string;
  title: string;
  district: string;
  culpritName: string;
  motive: string;
  clues: Array<{
    code: string;
    title: string;
    description: string;
    type: 'FORENSIC' | 'SPIRITUAL' | 'TESTIMONY' | 'DOCUMENT';
    preferredMethod: InvestigationMethod;
  }>;
  rewardPence: number;
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '../../..');

export class ProceduralInvestigationService {
  private static npcWeeksData: any[] | null = null;

  private static getNpcWeeks(): any[] {
    if (!this.npcWeeksData) {
      const npcPath = path.join(ROOT_DIR, 'data/gameplay/npc_weeks/npc_weeks.json');
      const raw = fs.readFileSync(npcPath, 'utf8');
      this.npcWeeksData = JSON.parse(raw);
    }
    return this.npcWeeksData as any[];
  }

  public static generateCaseForCharacter(
    db: DatabaseClient,
    characterId: string,
    currentDay: number
  ): { caseId: string; title: string; district: string } {
    const npcs = this.getNpcWeeks();
    const existingCases = db.getCharacterCases(characterId);
    const existingCodes = new Set(existingCases.map((c: any) => c.case_code));

    // Seleccionar NPC disponible con schedule
    const availableNpcs = npcs.filter(n => !existingCodes.has(`CASE_MINOR_${n.id}`));
    const selectedNpc = availableNpcs.length > 0 
      ? availableNpcs[0] 
      : npcs[existingCases.length % npcs.length];

    const districts = [
      'Distrito de Cherwood',
      'Barrio Este',
      'Área del Puente de Backlund',
      'Distrito Norte',
      'Distrito de Hillston'
    ];
    const district = districts[existingCases.length % districts.length];

    const days = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
    const dayName = days[(currentDay - 1) % days.length];
    const schedule = selectedNpc.schedule?.[dayName] || {
      mañana: `Despacho y gestiones matutinas (${dayName})`,
      tarde: `Reuniones y trámites en ${district} (${dayName})`,
      noche: `Retiro o actividad nocturna (${dayName})`
    };

    const caseCode = `CASE_MINOR_${selectedNpc.id}`;
    const seedRng = new SeededRNG(`case_${characterId}_${caseCode}_${currentDay}_${Date.now()}`);
    const suffix = seedRng.nextInt(10000, 99999);
    const caseId = `case_${characterId}_${caseCode}_${Date.now()}_${suffix}`;
    const title = `Expediente Menor: El Enigma de ${selectedNpc.name}`;
    const rewardPence = 240 + ((existingCases.length % 5) * 60);

    // 1. Crear caso en base de datos
    db.createInvestigationCase({
      id: caseId,
      character_id: characterId,
      case_code: caseCode,
      title,
      district,
      status: 'OPEN',
      culprit_name: selectedNpc.name,
      reward_pence: rewardPence,
      created_day: currentDay
    });

    // 2. Insertar 3 pistas derivadas del schedule real
    const clues = [
      {
        code: `CLUE_MINOR_${selectedNpc.id}_1`,
        title: `Registro Matutino de ${selectedNpc.name}`,
        description: `Avistado durante sus rutinas: ${schedule.mañana}`,
        type: 'FORENSIC' as const,
        preferredMethod: 'FORENSIC_TRACKING' as const
      },
      {
        code: `CLUE_MINOR_${selectedNpc.id}_2`,
        title: `Resonancia Espiritual Vespertina de ${selectedNpc.name}`,
        description: `Rastro y presencia residual en: ${schedule.tarde}`,
        type: 'SPIRITUAL' as const,
        preferredMethod: 'SPIRITUAL_DIVINATION' as const
      },
      {
        code: `CLUE_MINOR_${selectedNpc.id}_3`,
        title: `Testimonio Nocturno de ${selectedNpc.name}`,
        description: `Declaración sobre su paradero: ${schedule.noche}`,
        type: 'TESTIMONY' as const,
        preferredMethod: 'PSYCHOLOGICAL_ANALYSIS' as const
      }
    ];

    clues.forEach((clue, idx) => {
      db.addClue({
        id: `clue_${caseId}_${idx + 1}`,
        case_id: caseId,
        clue_code: clue.code,
        title: clue.title,
        description: clue.description,
        clue_type: clue.type,
        is_discovered: 0
      });
    });

    return {
      caseId,
      title,
      district
    };
  }

  public static investigateClue(
    db: DatabaseClient,
    caseId: string,
    clueId: string,
    pathway: CanonicalPathwayId,
    method: InvestigationMethod
  ): {
    success: boolean;
    discoveredClue: any;
    digestionBonus: number;
    message: string;
    caseReadyForDeduction: boolean;
  } {
    const caseData = db.getInvestigationCase(caseId);
    if (!caseData) {
      throw new Error('Caso de investigación no encontrado.');
    }

    const clues = db.getCaseClues(caseId);
    const clue = clues.find(c => c.id === clueId);
    if (!clue) {
      throw new Error('Pista no encontrada en este expediente.');
    }

    // Calcular afinidad del método con la vía del Beyonder
    let affinityBonus = 1.0;
    if (method === 'SPIRITUAL_DIVINATION' && ['FOOL', 'WHEEL_OF_FORTUNE', 'HERMIT', 'DEATH'].includes(pathway)) {
      affinityBonus = 1.5;
    } else if (method === 'PSYCHOLOGICAL_ANALYSIS' && ['VISIONARY', 'JUSTICIAR', 'DEMONESS'].includes(pathway)) {
      affinityBonus = 1.5;
    } else if (method === 'LOGICAL_RATIOCINATION' && ['WHITE_TOWER', 'BLACK_EMPEROR', 'PARAGON', 'ERROR'].includes(pathway)) {
      affinityBonus = 1.5;
    } else if (method === 'FORENSIC_TRACKING' && ['RED_PRIEST', 'DARKNESS', 'MOON', 'TWILIGHT_GIANT'].includes(pathway)) {
      affinityBonus = 1.5;
    }

    db.discoverClue(clueId);
    const updatedClues = db.getCaseClues(caseId);
    const discoveredCount = updatedClues.filter(c => c.is_discovered === 1).length;

    const readyForDeduction = discoveredCount >= 2;
    if (readyForDeduction && caseData.status === 'OPEN') {
      db.updateCaseStatus(caseId, 'READY_FOR_DEDUCTION');
    }

    const digestionGain = Number((5.0 * affinityBonus).toFixed(1));

    return {
      success: true,
      discoveredClue: { ...clue, is_discovered: 1 },
      digestionBonus: digestionGain,
      message: `¡Pista decodificada con éxito mediante [${method}]! Revelación: ${clue.title}.`,
      caseReadyForDeduction: readyForDeduction
    };
  }

  public static resolveVerdict(
    db: DatabaseClient,
    characterId: string,
    caseId: string,
    action: 'SCOTLAND_YARD' | 'EXTORT_BLACKMAIL' | 'EXECUTE_SHADOWS' | 'COVER_UP_ALLIANCE'
  ): {
    success: boolean;
    verdictMessage: string;
    poundsReward: number;
    digestionBonus: number;
    policeDelta: number;
    churchDelta: number;
  } {
    const caseData = db.getInvestigationCase(caseId);
    if (!caseData) throw new Error('Caso no encontrado');

    let reward = caseData.reward_pence;
    let digestion = 10.0;
    let policeDelta = 0;
    let churchDelta = 0;
    let msg = '';

    const activePersona = db.getActivePersona(characterId);

    switch (action) {
      case 'SCOTLAND_YARD':
        db.updateCaseStatus(caseId, 'SOLVED', action);
        policeDelta = -5;
        churchDelta = -2;
        msg = `Has entregado el expediente con pruebas contundentes al Inspector de Scotland Yard. El culpable [${caseData.culprit_name}] ha sido puesto bajo custodia formal.`;
        break;

      case 'EXTORT_BLACKMAIL':
        db.updateCaseStatus(caseId, 'SOLVED', action);
        reward = Math.floor(reward * 2.5); // Extorsión rinde más dinero
        policeDelta = 8;
        churchDelta = 2;
        digestion = 4.0;
        msg = `Has chantajeado al culpable [${caseData.culprit_name}]. Obtuviste una suma considerable de libras a cambio de quemar las pruebas comprometedoras.`;
        break;

      case 'EXECUTE_SHADOWS':
        db.updateCaseStatus(caseId, 'SOLVED', action);
        digestion = 18.0;
        churchDelta = 6;
        policeDelta = 4;
        msg = `Has ejecutado justicia sumaria en las sombras de Backlund contra [${caseData.culprit_name}]. La característica espiritual residual se asienta en tu cuerpo astral.`;
        break;

      case 'COVER_UP_ALLIANCE':
        db.updateCaseStatus(caseId, 'COVERED_UP', action);
        reward = Math.floor(reward * 0.5);
        digestion = 8.0;
        const anchorRng = new SeededRNG(`anchor_case_${caseId}_${characterId}`);
        const anchorSuffix = anchorRng.nextInt(10000, 99999);
        db.addAnchor({
          id: `anchor_case_${caseId}_${anchorSuffix}`,
          character_id: characterId,
          title: `Pacto Clandestino de Cherwood (${caseData.culprit_name})`,
          strength: 35,
          category: 'BOND'
        });
        msg = `Has encubierto el caso a cambio de un favor perpetuo. Has ganado un nuevo contacto clandestino como ancla humana en Backlund.`;
        break;
    }

    // Recompensas financieras y digestión
    if (reward > 0) {
      db.updateCharacterWealth(characterId, reward);
    }
    const char = db.getCharacter(characterId);
    if (char) {
      db.updateCharacterSomatics(characterId, {
        digestion: Math.min(100.0, char.digestion_progress + digestion)
      });
    }
    if (activePersona && (policeDelta !== 0 || churchDelta !== 0)) {
      db.updatePersonaSuspicion(activePersona.id, policeDelta, churchDelta);
    }

    return {
      success: true,
      verdictMessage: msg,
      poundsReward: Math.floor(reward / 240),
      digestionBonus: digestion,
      policeDelta,
      churchDelta
    };
  }
}
