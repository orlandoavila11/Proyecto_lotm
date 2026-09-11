import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseClient } from '../../infra/database/DatabaseClient.js';
import { CanonicalPathwayId } from '../types/pathway.js';
import { CaseG, CaseClue } from '../../infra/content/schemas/case.schema.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '../../..');

export type CaseStatus = 'DORMANT' | 'ACTIVE' | 'RESOLVED' | 'EXPIRED';

export type ClueRelation = 'acusa' | 'explica' | 'localiza' | 'contradice';

export interface ClueConnectionEdge {
  clueA: string;
  clueB: string;
  relation: ClueRelation;
  isCorrect: boolean;
  insight: string | null;
  discoveredAtDay: number;
}

export interface FalseClue {
  id: string;
  nombre: string;
  descripcion: string;
  plantedByHypothesis: string;
  plantedAtDay: number;
}

export interface InvestigationCaseState {
  id: string; // e.g. instance ID
  caseId: string; // e.g. CASE_CHERWOOD_HEIRLOOM
  characterId: string;
  title: string;
  status: CaseStatus;
  startDay: number;
  dayCounter: number; // días transcurridos dentro del caso
  discoveredClues: Array<{
    id: string;
    nombre: string;
    descripcion: string;
    sourceVisited: string;
    discoveredAtDay: number;
    isConcealed: boolean;
  }>;
  unsealedConcealedClues: string[];
  connectedEdges: ClueConnectionEdge[];
  activeHypothesisId: string | null;
  testedHypotheses: Array<{
    hypothesisId: string;
    isCorrect: boolean;
    testedAtDay: number;
  }>;
  falseClues: FalseClue[];
  resolutionUnlocked: boolean;
  triggeredCheckpoints: string[];
  effects: {
    interrogationPenalty?: number;
    visibleCluesIncrement?: number;
    tensiónDistrito?: number;
    convergenciaRate?: number;
    corrupciónLocal?: number;
    questLock?: string;
  };
  resolvedState?: {
    resolutionId: string;
    nombre: string;
    resolvedAtDay: number;
    localEffects: string;
    telarDeclared: any;
  };
  expiredState?: {
    checkpointId: string;
    expiredAtDay: number;
    reason: string;
    effects: any;
  };
}

export class InvestigationEngine {
  private static cherwoodCaseDefinition: CaseG | null = null;
  private static npcWeeksData: any[] | null = null;

  public static getCherwoodCaseDefinition(): CaseG {
    if (!this.cherwoodCaseDefinition) {
      const casePath = path.join(ROOT_DIR, 'data/gameplay/cases/case_cherwood_heirloom.json');
      const raw = fs.readFileSync(casePath, 'utf8');
      this.cherwoodCaseDefinition = JSON.parse(raw) as CaseG;
    }
    return this.cherwoodCaseDefinition as CaseG;
  }

  public static getNpcWeeksData(): any[] {
    if (!this.npcWeeksData) {
      const npcPath = path.join(ROOT_DIR, 'data/gameplay/npc_weeks/npc_weeks.json');
      const raw = fs.readFileSync(npcPath, 'utf8');
      this.npcWeeksData = JSON.parse(raw);
    }
    return this.npcWeeksData as any[];
  }

  // --- MÁQUINA DE ESTADOS: DORMANT -> ACTIVE -> RESOLVED / EXPIRED ---
  public static activateCase(
    db: DatabaseClient,
    characterId: string,
    caseId: string = 'CASE_CHERWOOD_HEIRLOOM'
  ): InvestigationCaseState {
    const existing = db.getActiveCaseForCharacter(characterId, caseId);
    if (existing) {
      return JSON.parse(existing.state_json) as InvestigationCaseState;
    }

    const char = db.getCharacter(characterId);
    if (!char) {
      throw new Error(`Personaje no encontrado: ${characterId}`);
    }

    const caseDef = this.getCherwoodCaseDefinition();
    if (caseDef.id !== caseId) {
      throw new Error(`Definición de caso no soportada: ${caseId}`);
    }

    const instanceId = `case_inst_${characterId}_${caseId}_${Date.now()}`;
    const startDay = char.current_day;

    // Inicializar estado activo
    const state: InvestigationCaseState = {
      id: instanceId,
      caseId,
      characterId,
      title: caseDef.title || 'El Eco en el Nido Vacío',
      status: 'ACTIVE',
      startDay,
      dayCounter: 0,
      discoveredClues: [],
      unsealedConcealedClues: [],
      connectedEdges: [],
      activeHypothesisId: null,
      testedHypotheses: [],
      falseClues: [],
      resolutionUnlocked: false,
      triggeredCheckpoints: [],
      effects: {}
    };

    // Registrar pista pública inicial si existe
    const publicClue = caseDef.clues.find(c => {
      if (typeof c.gating === 'object' && !Array.isArray(c.gating)) {
        return (c.gating as any).visibility === 'PUBLIC_DAY_0';
      }
      return false;
    });

    if (publicClue) {
      state.discoveredClues.push({
        id: publicClue.id,
        nombre: publicClue.nombre || publicClue.id,
        descripcion: publicClue.descripcion || '',
        sourceVisited: publicClue.fuentes[0],
        discoveredAtDay: 0,
        isConcealed: false
      });
    }

    db.saveCaseInstance({
      id: instanceId,
      character_id: characterId,
      case_id: caseId,
      status: 'ACTIVE',
      state_json: JSON.stringify(state)
    });

    return state;
  }

  // --- VISITA DE FUENTES DE PISTAS (visit_clue_source) ---
  public static visitClueSource(
    db: DatabaseClient,
    instanceId: string,
    params: {
      clueId: string;
      sourceIndex: number;
      timeOfDay?: 'mañana' | 'tarde' | 'noche';
      hour?: number;
    }
  ): {
    success: boolean;
    clue?: any;
    sourceVisited?: string;
    message: string;
    reason?: string;
    state: InvestigationCaseState;
  } {
    const row = db.getCaseInstance(instanceId);
    if (!row) {
      throw new Error(`Instancia de caso no encontrada: ${instanceId}`);
    }

    const state = JSON.parse(row.state_json) as InvestigationCaseState;
    if (state.status !== 'ACTIVE') {
      throw new Error(`No se pueden visitar fuentes de un caso en estado [${state.status}]`);
    }

    const char = db.getCharacter(state.characterId);
    if (!char) {
      throw new Error(`Personaje no encontrado: ${state.characterId}`);
    }

    const caseDef = this.getCherwoodCaseDefinition();
    const clueDef = caseDef.clues.find(c => c.id === params.clueId);
    if (!clueDef) {
      throw new Error(`Pista [${params.clueId}] no existe en la definición del caso`);
    }

    if (params.sourceIndex < 0 || params.sourceIndex >= clueDef.fuentes.length) {
      throw new Error(`Índice de fuente inválido: ${params.sourceIndex} (disponibles: 0 a ${clueDef.fuentes.length - 1})`);
    }

    const sourceName = clueDef.fuentes[params.sourceIndex];

    // GATING 1: Verificación de Vía
    const gating = typeof clueDef.gating === 'object' && !Array.isArray(clueDef.gating) ? (clueDef.gating as any) : {};
    if (gating.pathway && gating.pathway !== char.pathway) {
      let specificReason = `Esta fuente requiere percepción especializada de la Vía [${gating.pathway}]. Tu afinidad actual es [${char.pathway}].`;
      if (gating.pathway === 'FOOL') {
        specificReason = 'Requiere percepción esotérica de la Vía del Loco (Hilos Espirituales / Radiestesia) para percibir estas marcas en el desván.';
      } else if (gating.pathway === 'VISIONARY') {
        specificReason = 'Requiere discernimiento psicológico de la Vía del Espectador (Lectura de Microexpresiones) para interpretar el colapso gestual de Evangeline.';
      }
      return {
        success: false,
        reason: specificReason,
        message: specificReason,
        state
      };
    }

    // GATING 2: Verificación de Secuencia Mínima
    if (gating.minSequence && char.sequence > gating.minSequence) {
      const specificReason = `La resonancia mágica del artefacto supera tu umbral espiritual; requiere al menos Secuencia ${gating.minSequence} para no sufrir rechazo ontológico.`;
      return {
        success: false,
        reason: specificReason,
        message: specificReason,
        state
      };
    }

    // GATING 3: Ocultación (isConcealed)
    if (clueDef.isConcealed && !state.unsealedConcealedClues.includes(clueDef.id)) {
      // Para acceder a CLUE_CONCEALED_SAFE se requiere haber descubierto pistas clave previas o unsealing
      const hasPriorInsight = state.discoveredClues.some(c => c.id === 'CLUE_ASTROLOGY_RECORD' || c.id === 'CLUE_WILL_DRAFT' || c.id === 'CLUE_MIND_TRACES');
      if (!hasPriorInsight) {
        const specificReason = 'La caja fuerte tras el retrato familiar está meticulosamente empotrada y protegida por un cerrojo secreto que aún no has localizado en la investigación.';
        return {
          success: false,
          reason: specificReason,
          message: specificReason,
          state
        };
      }
      state.unsealedConcealedClues.push(clueDef.id);
    }

    // GATING 4: Agenda Semanal del NPC y Horario
    const timeOfDay = params.timeOfDay || (params.hour !== undefined ? (params.hour >= 6 && params.hour < 12 ? 'mañana' : params.hour >= 12 && params.hour < 20 ? 'tarde' : 'noche') : 'tarde');

    const scheduleCheck = this.validateNpcScheduleForSource(sourceName, timeOfDay, params.hour);
    if (!scheduleCheck.accessible) {
      return {
        success: false,
        reason: scheduleCheck.reason,
        message: scheduleCheck.reason,
        state
      };
    }

    // Ya descubierta?
    if (state.discoveredClues.some(c => c.id === clueDef.id)) {
      return {
        success: true,
        clue: state.discoveredClues.find(c => c.id === clueDef.id),
        sourceVisited: sourceName,
        message: `La pista [${clueDef.nombre}] ya había sido registrada en el expediente.`,
        state
      };
    }

    // Éxito: Descubrir pista
    const discovered = {
      id: clueDef.id,
      nombre: clueDef.nombre || clueDef.id,
      descripcion: clueDef.descripcion || '',
      sourceVisited: sourceName,
      discoveredAtDay: state.dayCounter,
      isConcealed: !!clueDef.isConcealed
    };

    state.discoveredClues.push(discovered);

    // Si se descubre CLUE_ASTROLOGY_RECORD, CLUE_WILL_DRAFT o CLUE_MIND_TRACES, revelar la existencia de la caja fuerte oculta
    if (clueDef.id === 'CLUE_ASTROLOGY_RECORD' || clueDef.id === 'CLUE_WILL_DRAFT' || clueDef.id === 'CLUE_MIND_TRACES') {
      if (!state.unsealedConcealedClues.includes('CLUE_CONCEALED_SAFE')) {
        state.unsealedConcealedClues.push('CLUE_CONCEALED_SAFE');
      }
    }

    db.saveCaseInstance({
      id: state.id,
      character_id: state.characterId,
      case_id: state.caseId,
      status: state.status,
      state_json: JSON.stringify(state)
    });

    return {
      success: true,
      clue: discovered,
      sourceVisited: sourceName,
      message: `Pista descubierta con éxito: [${clueDef.nombre}].`,
      state
    };
  }

  // Validación de fuentes y agendas diegéticas
  private static validateNpcScheduleForSource(
    sourceName: string,
    timeOfDay: 'mañana' | 'tarde' | 'noche',
    hour?: number
  ): { accessible: boolean; reason: string } {
    if (sourceName === 'AGENDA_BEATRICE_MISA_MATUTINA') {
      if (timeOfDay !== 'mañana') {
        return {
          accessible: false,
          reason: 'La hermana Beatrice atiende confesiones tras la misa matutina en San Dionisio; por la tarde se encuentra ocupada con registros parroquiales.'
        };
      }
    }

    if (sourceName === 'AGENDA_WENDY_CLARK_COMPRAS') {
      if (timeOfDay !== 'mañana') {
        return {
          accessible: false,
          reason: 'Wendy Clark solo se encuentra en el mercado durante las compras matutinas. Durante la tarde atiende las tareas de la mansión y por la noche se retira a sus aposentos.'
        };
      }
    }

    if (sourceName.includes('JULIAN') || sourceName === 'MARCAS_TIZA_DESVAN_ORFANATO_SAN_DIONISIO') {
      if (hour !== undefined && (hour < 21 && hour > 1)) {
        return {
          accessible: false,
          reason: 'Julian Vance duerme en su buhardilla durante el día; solo realiza sus visitas a los orfanatos durante la noche (21:00 - 01:00) para apaciguar pesadillas.'
        };
      }
    }

    if (sourceName === 'AGENDA_VIVIEN_SALON_ESPIRITISMO') {
      if (timeOfDay !== 'tarde') {
        return {
          accessible: false,
          reason: 'Madame Vivien solo recibe clientes en su salón de espiritismo durante la tarde; por la mañana prepara sus boticas a puerta cerrada y de noche se ausenta.'
        };
      }
    }

    if (sourceName === 'AGENDA_ARTHUR_HALE_CONTABLE') {
      if (timeOfDay === 'noche') {
        return {
          accessible: false,
          reason: 'Arthur Hale no atiende balances contables de noche; se encuentra bebiendo en la taberna local de Cherwood para olvidar sus deudas.'
        };
      }
    }

    if (sourceName === 'AGENDA_VIGILIA_NOCTURNA_MANSION') {
      if (timeOfDay !== 'noche') {
        return {
          accessible: false,
          reason: 'La vigilia nocturna en la mansión solo puede observarse al amparo de la oscuridad (noche), cuando se producen los extraños movimientos en el sótano.'
        };
      }
    }

    return { accessible: true, reason: '' };
  }

  // --- CONEXIÓN DE PISTAS (connect_clues) ---
  public static connectClues(
    db: DatabaseClient,
    instanceId: string,
    clueA: string,
    clueB: string,
    relation: ClueRelation
  ): {
    success: boolean;
    isCorrect: boolean;
    insight: string | null;
    message: string;
    state: InvestigationCaseState;
  } {
    const row = db.getCaseInstance(instanceId);
    if (!row) throw new Error(`Instancia no encontrada: ${instanceId}`);

    const state = JSON.parse(row.state_json) as InvestigationCaseState;
    if (state.status !== 'ACTIVE') throw new Error(`El caso se encuentra en estado [${state.status}]`);

    const hasA = state.discoveredClues.some(c => c.id === clueA);
    const hasB = state.discoveredClues.some(c => c.id === clueB);
    if (!hasA || !hasB) {
      throw new Error(`Ambas pistas deben haber sido descubiertas previamente para establecer una conexión.`);
    }

    // Definición canónica de grafos deductivos e insights
    const canonicalInsights: Record<string, string> = {
      'CLUE_BURNED_TOYS::CLUE_WILL_DRAFT::explica':
        'El borrador de directivas de Sterling explica por qué quema figuritas con nombres de huérfanos: cada juguete calcinado corresponde a una transferencia del trauma infantil asumido en su fianza irrevocable.',
      'CLUE_WILL_DRAFT::CLUE_BURNED_TOYS::explica':
        'El borrador de directivas de Sterling explica por qué quema figuritas con nombres de huérfanos: cada juguete calcinado corresponde a una transferencia del trauma infantil asumido en su fianza irrevocable.',
      'CLUE_MIND_TRACES::CLUE_CONCEALED_SAFE::explica':
        'Las microexpresiones de Evangeline explican el libro de transferencias: su agotamiento extremo se debe a sostener la presa psíquica que su padre anotó con precisión milimétrica.',
      'CLUE_CONCEALED_SAFE::CLUE_MIND_TRACES::explica':
        'Las microexpresiones de Evangeline explican el libro de transferencias: su agotamiento extremo se debe a sostener la presa psíquica que su padre anotó con precisión milimétrica.',
      'CLUE_ASTROLOGY_RECORD::CLUE_CONCEALED_SAFE::localiza':
        'Los hilos espirituales convergentes localizan el origen del drenaje psíquico en el sótano de la mansión donde se oculta la caja fuerte tras el retrato familiar.',
      'CLUE_CONCEALED_SAFE::CLUE_ASTROLOGY_RECORD::localiza':
        'Los hilos espirituales convergentes localizan el origen del drenaje psíquico en el sótano de la mansión donde se oculta la caja fuerte tras el retrato familiar.',
      'CLUE_FINANCIAL_BLACKMAIL::CLUE_BLOODLINE_TALISMAN::explica':
        'Las transferencias de 450 libras explican la adquisición clandestina del Espejo G3-0711 para sustraer fragmentos de identidad ontológica.',
      'CLUE_BLOODLINE_TALISMAN::CLUE_FINANCIAL_BLACKMAIL::explica':
        'Las transferencias de 450 libras explican la adquisición clandestina del Espejo G3-0711 para sustraer fragmentos de identidad ontológica.',
      'CLUE_FORGED_LETTERS::CLUE_WILL_DRAFT::contradice':
        'Los registros parroquiales alterados por Beatrice contradicen la versión de negligencia institucional: encubren deliberadamente las directivas de Sterling para evitar una purga letal de Nighthawks.',
      'CLUE_WILL_DRAFT::CLUE_FORGED_LETTERS::contradice':
        'Los registros parroquiales alterados por Beatrice contradicen la versión de negligencia institucional: encubren deliberadamente las directivas de Sterling para evitar una purga letal de Nighthawks.',
      'CLUE_CONCEALED_SAFE::CLUE_BLOODLINE_TALISMAN::acusa':
        'El libro de transferencias y el artefacto G3-0711 acusan conjuntamente el método: la red de absorción de Sterling se sostiene extrayendo recuerdos felices con el espejo.',
      'CLUE_BLOODLINE_TALISMAN::CLUE_CONCEALED_SAFE::acusa':
        'El libro de transferencias y el artefacto G3-0711 acusan conjuntamente el método: la red de absorción de Sterling se sostiene extrayendo recuerdos felices con el espejo.'
    };

    const key = `${clueA}::${clueB}::${relation}`;
    const insight = canonicalInsights[key] || null;

    const edge: ClueConnectionEdge = {
      clueA,
      clueB,
      relation,
      isCorrect: insight !== null,
      insight,
      discoveredAtDay: state.dayCounter
    };

    // Evitar aristas duplicadas
    const existingEdgeIdx = state.connectedEdges.findIndex(
      e => ((e.clueA === clueA && e.clueB === clueB) || (e.clueA === clueB && e.clueB === clueA)) && e.relation === relation
    );

    if (existingEdgeIdx >= 0) {
      state.connectedEdges[existingEdgeIdx] = edge;
    } else {
      state.connectedEdges.push(edge);
    }

    db.saveCaseInstance({
      id: state.id,
      character_id: state.characterId,
      case_id: state.caseId,
      status: state.status,
      state_json: JSON.stringify(state)
    });

    if (insight) {
      return {
        success: true,
        isCorrect: true,
        insight,
        message: `¡Conexión deductiva acertada! Insight: ${insight}`,
        state
      };
    } else {
      return {
        success: true,
        isCorrect: false,
        insight: null,
        message: 'No se observa ninguna correlación deductiva evidente entre ambas pistas.',
        state
      };
    }
  }

  // --- SUBMISIÓN DE HIPÓTESIS (submit_hypothesis) ---
  public static submitHypothesis(
    db: DatabaseClient,
    instanceId: string,
    hypothesisId: string
  ): {
    success: boolean;
    isCorrect: boolean;
    resolutionUnlocked: boolean;
    daysConsumed: number;
    falseCluePlanted?: FalseClue;
    message: string;
    state: InvestigationCaseState;
  } {
    const row = db.getCaseInstance(instanceId);
    if (!row) throw new Error(`Instancia no encontrada: ${instanceId}`);

    const state = JSON.parse(row.state_json) as InvestigationCaseState;
    if (state.status !== 'ACTIVE') throw new Error(`El caso se encuentra en estado [${state.status}]`);

    const caseDef = this.getCherwoodCaseDefinition();
    const hypotheses = Array.isArray(caseDef.hypothesisSlots) ? caseDef.hypothesisSlots : [];
    const hypDef = hypotheses.find(h => h.id === hypothesisId);
    if (!hypDef) {
      throw new Error(`Hipótesis [${hypothesisId}] no encontrada en el caso.`);
    }

    state.activeHypothesisId = hypothesisId;

    if (hypothesisId === 'HYPOTHESIS_TRUE_NETWORK') {
      // Para confirmar la verdad fundacional se requiere la prueba definitiva (CLUE_CONCEALED_SAFE)
      const hasDefinitiveProof = state.discoveredClues.some(c => c.id === 'CLUE_CONCEALED_SAFE');
      if (!hasDefinitiveProof) {
        throw new Error('No puedes sostener la hipótesis central sin haber descubierto la prueba definitiva (El Libro de Transferencias de Sterling).');
      }

      state.resolutionUnlocked = true;
      state.testedHypotheses.push({
        hypothesisId,
        isCorrect: true,
        testedAtDay: state.dayCounter
      });

      db.saveCaseInstance({
        id: state.id,
        character_id: state.characterId,
        case_id: state.caseId,
        status: state.status,
        state_json: JSON.stringify(state)
      });

      return {
        success: true,
        isCorrect: true,
        resolutionUnlocked: true,
        daysConsumed: 0,
        message: '¡Hipótesis confirmada contra el Modelo de Verdad! Has desentrañado la Red de Amortiguación de Sterling. Fase de resolución desbloqueada.',
        state
      };
    }

    // Hipótesis errónea -> FAIL-FORWARD: consume 1 día + siembra pista falsa autoral
    state.testedHypotheses.push({
      hypothesisId,
      isCorrect: false,
      testedAtDay: state.dayCounter
    });

    this.advanceCaseDays(state, 1);

    const falseCluesByHypothesis: Record<string, FalseClue> = {
      HYPOTHESIS_JULIAN: {
        id: 'FALSE_CLUE_JULIAN_SEDATIVES',
        nombre: 'Frascos de Láudano Marcados de Vance',
        descripcion: 'Frascos de sedante con iniciales de Julian Vance hallados en un orfanato; parecen inculparlo, pero en realidad eran dosis compasivas sin vector de sustracción ontológica.',
        plantedByHypothesis: 'HYPOTHESIS_JULIAN',
        plantedAtDay: state.dayCounter
      },
      HYPOTHESIS_CHURCH: {
        id: 'FALSE_CLUE_CHURCH_CONFIDENTIAL_DECREE',
        nombre: 'Borrador de Censura Eclesiástica de Noche Eterna',
        descripcion: 'Documento parroquial censurado; parece una orden de experimentación secreta con huérfanos, pero es una directiva de cuarentena preventiva redactada por Beatrice.',
        plantedByHypothesis: 'HYPOTHESIS_CHURCH',
        plantedAtDay: state.dayCounter
      },
      HYPOTHESIS_VIVIEN: {
        id: 'FALSE_CLUE_VIVIEN_MEMORY_LEDGER',
        nombre: 'Recibos Criptográficos de Reliquias de Vivien',
        descripcion: 'Anotaciones de Vivien que sugieren venta de recuerdos al por mayor, pero solo detallan transacciones comerciales de baratijas espirituales.',
        plantedByHypothesis: 'HYPOTHESIS_VIVIEN',
        plantedAtDay: state.dayCounter
      }
    };

    const falseClue = falseCluesByHypothesis[hypothesisId] || {
      id: `FALSE_CLUE_${hypothesisId}`,
      nombre: `Pista Falsa: ${hypDef.name}`,
      descripcion: `Información engañosa derivada de la hipótesis fallida: ${hypDef.teoria}`,
      plantedByHypothesis: hypothesisId,
      plantedAtDay: state.dayCounter
    };

    if (!state.falseClues.some(f => f.id === falseClue.id)) {
      state.falseClues.push(falseClue);
    }

    db.saveCaseInstance({
      id: state.id,
      character_id: state.characterId,
      case_id: state.caseId,
      status: state.status,
      state_json: JSON.stringify(state)
    });

    return {
      success: true,
      isCorrect: false,
      resolutionUnlocked: false,
      daysConsumed: 1,
      falseCluePlanted: falseClue,
      message: 'Hipótesis errónea. La investigación se desvió 1 día siguiendo una pista falsa sembrada en el expediente.',
      state
    };
  }

  // --- VERBOS DE VÍA ---
  // FOOL: Péndulo (Dowsing)
  public static pendulumDowsing(
    db: DatabaseClient,
    instanceId: string,
    targetClueId: string
  ): {
    success: boolean;
    hint: string;
    spiritualityCost: number;
    state: InvestigationCaseState;
  } {
    const row = db.getCaseInstance(instanceId);
    if (!row) throw new Error(`Instancia no encontrada: ${instanceId}`);

    const state = JSON.parse(row.state_json) as InvestigationCaseState;
    const char = db.getCharacter(state.characterId);
    if (!char) throw new Error('Personaje no encontrado');

    if (char.pathway !== 'FOOL') {
      throw new Error('La radiestesia de péndulo requiere la Vía del Loco (FOOL).');
    }

    const cost = 10;
    if (char.current_spirituality < cost) {
      throw new Error(`Espiritualidad insuficiente (${char.current_spirituality} < ${cost}).`);
    }

    db.updateCharacterSomatics(char.id, {
      spirituality: char.current_spirituality - cost
    });

    let hint = 'El péndulo oscila errático sin revelar orientación clara.';
    if (targetClueId === 'CLUE_CONCEALED_SAFE') {
      hint = "El péndulo de topacio oscila en elipses pesadas hacia el norte de Cherwood: 'El dolor no se destruye, reposa tras el lienzo de la mirada paterna'.";
      if (!state.unsealedConcealedClues.includes('CLUE_CONCEALED_SAFE')) {
        state.unsealedConcealedClues.push('CLUE_CONCEALED_SAFE');
      }
    } else if (targetClueId === 'CLUE_ASTROLOGY_RECORD') {
      hint = "El péndulo gira en el sentido de las agujas del reloj: 'Hilos invisibles unen el desván de San Dionisio con la mansión del médico'.";
    } else {
      hint = `El péndulo vibra en sintonía con [${targetClueId}], señalando restos astrales en el distrito.`;
    }

    db.saveCaseInstance({
      id: state.id,
      character_id: state.characterId,
      case_id: state.caseId,
      status: state.status,
      state_json: JSON.stringify(state)
    });

    return {
      success: true,
      hint,
      spiritualityCost: cost,
      state
    };
  }

  // FOOL: Sueño (Dream Divination)
  public static dreamDivination(
    db: DatabaseClient,
    instanceId: string
  ): {
    success: boolean;
    vision: string;
    spiritualityCost: number;
    state: InvestigationCaseState;
  } {
    const row = db.getCaseInstance(instanceId);
    if (!row) throw new Error(`Instancia no encontrada: ${instanceId}`);

    const state = JSON.parse(row.state_json) as InvestigationCaseState;
    const char = db.getCharacter(state.characterId);
    if (!char) throw new Error('Personaje no encontrado');

    if (char.pathway !== 'FOOL') {
      throw new Error('La adivinación onírica requiere la Vía del Loco (FOOL).');
    }

    const cost = 20;
    if (char.current_spirituality < cost) {
      throw new Error(`Espiritualidad insuficiente (${char.current_spirituality} < ${cost}).`);
    }

    db.updateCharacterSomatics(char.id, {
      spirituality: char.current_spirituality - cost
    });

    const vision =
      'En el mundo de los sueños, contemplas un nido gigantesco suspendido sobre Cherwood tejido con espinas y agujas de reloj. Un anciano de espaldas sangra lentamente en la base del tronco mientras una sombra filial alimenta con fragmentos luminosos una lámpara mortecina para retrasar el anochecer. No hay malicia, solo un dique a punto de reventar.';

    return {
      success: true,
      vision,
      spiritualityCost: cost,
      state
    };
  }

  // VISIONARY: Lectura de Emociones (Emotion Reading)
  public static emotionReading(
    db: DatabaseClient,
    instanceId: string,
    npcId: string
  ): {
    success: boolean;
    reading: string;
    hypothesisEvaluated: string | null;
    spiritualityCost: number;
    state: InvestigationCaseState;
  } {
    const row = db.getCaseInstance(instanceId);
    if (!row) throw new Error(`Instancia no encontrada: ${instanceId}`);

    const state = JSON.parse(row.state_json) as InvestigationCaseState;
    const char = db.getCharacter(state.characterId);
    if (!char) throw new Error('Personaje no encontrado');

    if (char.pathway !== 'VISIONARY') {
      throw new Error('La lectura de emociones requiere la Vía del Visionario (VISIONARY).');
    }

    const cost = 10;
    if (char.current_spirituality < cost) {
      throw new Error(`Espiritualidad insuficiente (${char.current_spirituality} < ${cost}).`);
    }

    db.updateCharacterSomatics(char.id, {
      spirituality: char.current_spirituality - cost
    });

    const readings: Record<string, string> = {
      NPC_CASE_JULIAN_VANCE:
        'Lectura de emociones sobre Julian Vance: Su ritmo cardíaco es lento, sus pupilas reflejan pesadumbre sincera y compasión protectora; no hay orgullo criminal ni oscilaciones de engaño. Su aura descarta categóricamente el rol de ladrón de recuerdos.',
      NPC_CASE_EVANGELINE_STERLING:
        'Lectura de emociones sobre Evangeline Sterling: Su aura revela una tensión neuromuscular extrema, un amor filial asfixiante y un terror abisal al colapso de la red. Sus microexpresiones confirman plenamente que sostiene la presa psíquica que mantiene vivo a su padre.',
      NPC_CASE_SISTER_BEATRICE:
        'Lectura de emociones sobre Hermana Beatrice: Su lenguaje corporal denota una culpa devota y una angustia lacerante por el destino de los huérfanos; no sirve a un experimento siniestro, sino a un encubrimiento piadoso para evitar una purga.',
      NPC_CASE_MADAME_VIVIEN:
        'Lectura de emociones sobre Madame Vivien: Codicia superficial y cálculo pragmático, pero indiferencia total hacia los huérfanos. Confirma que solo fue la proveedora mercantil del artefacto y no su operadora.'
    };

    const reading = readings[npcId] || `Lectura de emociones sobre [${npcId}]: Se percibe agitación y cautela, pero sin indicios de vinculación directa con el núcleo del caso.`;

    return {
      success: true,
      reading,
      hypothesisEvaluated: state.activeHypothesisId,
      spiritualityCost: cost,
      state
    };
  }

  // --- EXPIRY RUNTIME: CHECKPOINTS DÍAS 14, 21, 30 ---
  public static advanceCaseDays(
    state: InvestigationCaseState,
    days: number
  ): void {
    state.dayCounter += days;

    const caseDef = this.getCherwoodCaseDefinition();
    const checkpoints = caseDef.expiry.checkpoints || [];

    for (const cp of checkpoints) {
      if (state.dayCounter >= cp.day && !state.triggeredCheckpoints.includes(cp.eventId)) {
        state.triggeredCheckpoints.push(cp.eventId);
        if (cp.effects) {
          state.effects = {
            ...state.effects,
            ...cp.effects
          };
        }

        // Día 30: THE_BROKEN_FATHER -> Estado terminal EXPIRED
        if (cp.eventId === 'THE_BROKEN_FATHER' || cp.day >= 30) {
          state.status = 'EXPIRED';
          state.expiredState = {
            checkpointId: cp.eventId,
            expiredAtDay: state.dayCounter,
            reason: cp.description,
            effects: cp.effects
          };
        }
      }
    }
  }

  public static advanceTime(
    db: DatabaseClient,
    instanceId: string,
    days: number
  ): InvestigationCaseState {
    const row = db.getCaseInstance(instanceId);
    if (!row) throw new Error(`Instancia no encontrada: ${instanceId}`);

    const state = JSON.parse(row.state_json) as InvestigationCaseState;
    if (state.status !== 'ACTIVE') {
      return state;
    }

    this.advanceCaseDays(state, days);

    db.saveCaseInstance({
      id: state.id,
      character_id: state.characterId,
      case_id: state.caseId,
      status: state.status,
      state_json: JSON.stringify(state)
    });

    return state;
  }

  // --- RESOLUCIONES (A, B, C, D) ---
  public static resolveCase(
    db: DatabaseClient,
    instanceId: string,
    resolutionId: 'RESOLUTION_A_JUSTICE' | 'RESOLUTION_B_TRUTH' | 'RESOLUTION_C_STABILITY' | 'RESOLUTION_D_HEIR'
  ): {
    success: boolean;
    resolutionId: string;
    nombre: string;
    consecuenciasLocales: string;
    telarDeclared: any;
    state: InvestigationCaseState;
  } {
    const row = db.getCaseInstance(instanceId);
    if (!row) throw new Error(`Instancia no encontrada: ${instanceId}`);

    const state = JSON.parse(row.state_json) as InvestigationCaseState;
    if (state.status !== 'ACTIVE') {
      throw new Error(`El caso no está activo (estado actual: [${state.status}]).`);
    }

    if (!state.resolutionUnlocked) {
      throw new Error('La fase de resolución no está desbloqueada. Debes someter una hipótesis acertada contra el Modelo de Verdad.');
    }

    const caseDef = this.getCherwoodCaseDefinition();
    const resDef = caseDef.resolutionStates?.find(r => r.id === resolutionId);
    if (!resDef) {
      throw new Error(`Resolución [${resolutionId}] no encontrada en el caso.`);
    }

    state.status = 'RESOLVED';
    state.resolvedState = {
      resolutionId: resDef.id,
      nombre: resDef.nombre,
      resolvedAtDay: state.dayCounter,
      localEffects: resDef.consecuenciasLocales,
      telarDeclared: resDef.telarDeclared
    };

    // Si es Resolución D: aplicar trait y modificar cordura máxima
    if (resolutionId === 'RESOLUTION_D_HEIR') {
      const char = db.getCharacter(state.characterId);
      if (char) {
        // Asignar ancla mística o registrar trait en somatics
        db.addAnchor({
          id: `anchor_trait_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          character_id: char.id,
          title: 'Trait Permanente: Los Susurros del Nido (-15% Sanity Cap)',
          strength: 40,
          category: 'BOND'
        });
      }
    }

    db.saveCaseInstance({
      id: state.id,
      character_id: state.characterId,
      case_id: state.caseId,
      status: 'RESOLVED',
      state_json: JSON.stringify(state)
    });

    return {
      success: true,
      resolutionId: resDef.id,
      nombre: resDef.nombre,
      consecuenciasLocales: resDef.consecuenciasLocales,
      telarDeclared: resDef.telarDeclared,
      state
    };
  }

  // --- CASOS MENORES (2) PROCEDURALES DESDE NPC_WEEKS.JSON ---
  public static generateMinorCase(
    db: DatabaseClient,
    characterId: string,
    templateIndex: 1 | 2 = 1
  ): {
    caseId: string;
    title: string;
    district: string;
    culpritNpcId: string;
    culpritName: string;
    clues: Array<{ id: string; title: string; scheduleSlot: string; source: string }>;
  } {
    const npcs = this.getNpcWeeksData();
    // Filtrar NPCs no canónicos con schedule completo
    const candidates = npcs.filter(n => !n.isCanonical && n.id.startsWith('NPC_0'));
    if (candidates.length < 2) {
      throw new Error('NPCs insuficientes para generar casos menores.');
    }

    const selectedNpc = templateIndex === 1 ? candidates[0] : candidates[1];
    const caseId = `case_minor_${templateIndex}_${selectedNpc.id}_${Date.now()}`;
    const district = templateIndex === 1 ? 'Cherwood' : 'East Borough';
    const title =
      templateIndex === 1
        ? `Expediente Menor #1: La Desaparición de Pagarés de ${selectedNpc.name}`
        : `Expediente Menor #2: El Contrabando de Raciones en ${district} (${selectedNpc.name})`;

    const schedule = selectedNpc.schedule?.lunes || {
      mañana: 'Despacho matutino',
      tarde: 'Gestiones de distrito',
      noche: 'Retiro nocturno'
    };

    const clues = [
      {
        id: `CLUE_MINOR_${templateIndex}_1`,
        title: `Registro de Actividad Matutina de ${selectedNpc.name}`,
        scheduleSlot: 'mañana',
        source: schedule.mañana
      },
      {
        id: `CLUE_MINOR_${templateIndex}_2`,
        title: `Rastro de Encuentro Vespertino en ${district}`,
        scheduleSlot: 'tarde',
        source: schedule.tarde
      },
      {
        id: `CLUE_MINOR_${templateIndex}_3`,
        title: `Movimiento Sospechoso Nocturno`,
        scheduleSlot: 'noche',
        source: schedule.noche
      }
    ];

    return {
      caseId,
      title,
      district,
      culpritNpcId: selectedNpc.id,
      culpritName: selectedNpc.name,
      clues
    };
  }
}
