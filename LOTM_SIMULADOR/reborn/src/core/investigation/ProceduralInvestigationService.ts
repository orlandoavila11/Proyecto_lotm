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

export class ProceduralInvestigationService {
  private static templates: ProceduralCaseTemplate[] = [
    {
      code: 'CASE_CHERWOOD_HEIRLOOM',
      title: 'El Relicario Espectral de la Familia Antigonus',
      district: 'Distrito de Cherwood (Clase Media & Detectives)',
      culpritName: 'Srta. Wendy Clark (Ama de Llaves)',
      motive: 'Venganza familiar y ocultamiento de un relicario de plata con emanaciones de la Cuarta Época.',
      rewardPence: 240, // £1 libra
      clues: [
        {
          code: 'CLUE_WAX_SEAL',
          title: 'Sello de Cera Carmesí Fragmentado',
          description: 'Restos de cera heráldica con la insignia de un ojo sin párpado bajo el aparador.',
          type: 'FORENSIC',
          preferredMethod: 'FORENSIC_TRACKING'
        },
        {
          code: 'CLUE_ASTRAL_WHISPER',
          title: 'Residuo Astral de Resentimiento',
          description: 'Una tenue neblina púrpura de rencor aún flota cerca de la cómoda del dormitorio.',
          type: 'SPIRITUAL',
          preferredMethod: 'SPIRITUAL_DIVINATION'
        },
        {
          code: 'CLUE_TESTIMONY_BUTLER',
          title: 'Testimonio Inconsistente del Mayordomo',
          description: 'El mayordomo afirma que la ama de llaves salió con un paquete envuelto a medianoche.',
          type: 'TESTIMONY',
          preferredMethod: 'PSYCHOLOGICAL_ANALYSIS'
        }
      ]
    },
    {
      code: 'CASE_EAST_BOROUGH_POISON',
      title: 'Las Muertes por Cianuro en la Fábrica Textil',
      district: 'Barrio Este (Bajos Fondos & Pobreza)',
      culpritName: 'Capataz Thomas Graves',
      motive: 'Encubrir la malversación de raciones obreras silenciando a inspectores sindicales.',
      rewardPence: 360, // £1 10s
      clues: [
        {
          code: 'CLUE_ALMOND_ODOR',
          title: 'Frasco con Esencia de Almendras Amargas',
          description: 'Oculto tras una tubería de vapor en la sala de calderas.',
          type: 'FORENSIC',
          preferredMethod: 'FORENSIC_TRACKING'
        },
        {
          code: 'CLUE_LEDGER_FORGERY',
          title: 'Libro Contable con Cifras Raspadas',
          description: 'Alteraciones numéricas evidentes en las salidas de fondos de la fábrica.',
          type: 'DOCUMENT',
          preferredMethod: 'LOGICAL_RATIOCINATION'
        },
        {
          code: 'CLUE_GUILT_PULSE',
          title: 'Pulso de Pánico en el Aura del Capataz',
          description: 'Al ser interrogado sobre el almacén de calderas, su ritmo cardíaco y aura corporal oscilan violentamente.',
          type: 'TESTIMONY',
          preferredMethod: 'PSYCHOLOGICAL_ANALYSIS'
        }
      ]
    },
    {
      code: 'CASE_BRIDGE_RITUAL',
      title: 'El Círculo de Velas Negras del Puente de Backlund',
      district: 'Área del Puente de Backlund (Comercio & Niebla)',
      culpritName: 'Hereje Barnaby (Secta Aurora)',
      motive: 'Invocar un descenso de sombras del Creador Verdadero sacrificando estibadores.',
      rewardPence: 480, // £2 libras
      clues: [
        {
          code: 'CLUE_OBSIDIAN_DAGGER',
          title: 'Daga Ceremonial de Obsidiana Mellada',
          description: 'Grabada con símbolos sacrílegos del ojo invertido ensangrentado.',
          type: 'FORENSIC',
          preferredMethod: 'FORENSIC_TRACKING'
        },
        {
          code: 'CLUE_BLOOD_CONVERGENCE',
          title: 'Resonancia Causal de Sangre Hirviente',
          description: 'El péndulo oscila descontrolado señalando hacia los sótanos húmedos del muelle.',
          type: 'SPIRITUAL',
          preferredMethod: 'SPIRITUAL_DIVINATION'
        },
        {
          code: 'CLUE_CULT_HYMN',
          title: 'Panfleto Sacrílego de la Orden Aurora',
          description: 'Contiene oraciones en Hermes antiguo destinadas a infectar la mente de los desamparados.',
          type: 'DOCUMENT',
          preferredMethod: 'LOGICAL_RATIOCINATION'
        }
      ]
    }
  ];

  public static generateCaseForCharacter(
    db: DatabaseClient,
    characterId: string,
    currentDay: number
  ): { caseId: string; title: string; district: string } {
    // Seleccionar expediente disponible evitando repetición cíclica
    const existingCases = db.getCharacterCases(characterId);
    const openOrActiveCodes = new Set(existingCases.filter((c: any) => c.status !== 'SOLVED' && c.status !== 'FAILED').map((c: any) => c.case_code));
    const available = this.templates.filter(t => !openOrActiveCodes.has(t.code));

    if (available.length === 0) {
      throw new Error('No hay nuevos expedientes disponibles en Backlund para investigar en este momento.');
    }
    const template = available[0];
    const seedRng = new SeededRNG(`case_${characterId}_${template.code}_${Date.now()}`);
    const suffix = seedRng.nextInt(10000, 99999);
    const caseId = `case_${characterId}_${template.code}_${Date.now()}_${suffix}`;

    // 1. Crear caso en base de datos
    db.createInvestigationCase({
      id: caseId,
      character_id: characterId,
      case_code: template.code,
      title: template.title,
      district: template.district,
      status: 'OPEN',
      culprit_name: template.culpritName,
      reward_pence: template.rewardPence,
      created_day: currentDay
    });

    // 2. Insertar pistas
    template.clues.forEach((clue, idx) => {
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
      title: template.title,
      district: template.district
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
