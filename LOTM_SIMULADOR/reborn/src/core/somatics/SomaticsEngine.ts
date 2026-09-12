import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  SomaticsState,
  SomaticsEvaluation,
  SanityTier,
  CorruptionTier,
  RuinaTier,
  CharacterScar,
  WhisperPrice,
  TerminalDestiny,
  RampageEventResult,
  RampageReconstructionSource
} from '../types/somatics.js';
import { DatabaseClient, AnchorRow } from '../../infra/database/DatabaseClient.js';
import { SomaticsBalance, SomaticsBalanceSchema } from '../../infra/content/schemas/somaticsBalance.schema.js';
import { generateDeterministicId } from '../rng/IdGenerator.js';

export class SomaticsEngine {
  private static balanceData: SomaticsBalance | null = null;

  public static getSomaticsBalance(): SomaticsBalance {
    if (!this.balanceData) {
      const packageRoot = fileURLToPath(new URL('../../..', import.meta.url));
      const filePath = path.join(packageRoot, 'data', 'gameplay', 'balance', 'somatics.json');
      if (!fs.existsSync(filePath)) {
        throw new Error(`Tabla de balance somático no encontrada: ${filePath}`);
      }
      const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      this.balanceData = SomaticsBalanceSchema.parse(raw);
    }
    return this.balanceData;
  }

  /**
   * Resuelve el tier de ruina ontológica según la tabla de balance centralizada.
   */
  public static getRuinaTier(ruina: number): { tier: RuinaTier; descriptor: string; convergenceBonus: number } {
    const balance = this.getSomaticsBalance();
    for (const t of balance.ruina_tiers) {
      if (ruina >= t.min && ruina <= t.max) {
        return {
          tier: t.tier as RuinaTier,
          descriptor: t.descriptor,
          convergenceBonus: t.convergence_bonus
        };
      }
    }
    const last = balance.ruina_tiers[balance.ruina_tiers.length - 1];
    return {
      tier: last.tier as RuinaTier,
      descriptor: last.descriptor,
      convergenceBonus: last.convergence_bonus
    };
  }

  /**
   * Evalúa el estado somático actual del Beyonder y genera diagnósticos clínicos y místicos.
   */
  public static evaluate(state: SomaticsState): SomaticsEvaluation {
    const balance = this.getSomaticsBalance();
    const sanityTier = this.getSanityTier(state.sanity);
    const corruptionTier = this.getCorruptionTier(state.corruption);
    const ruinaValue = state.ruina ?? 0;
    const ruinaInfo = this.getRuinaTier(ruinaValue);

    const isRampaging =
      state.sanity <= balance.rampage_sanity_threshold ||
      state.corruption >= balance.rampage_corruption_threshold;

    const somaticFlags: string[] = [];
    if (state.corruption >= balance.corruption_threshold_visible_signs) {
      somaticFlags.push('MUTATING_SIGNS');
      somaticFlags.push('ALTERED_SENSORY_PERCEPTION');
    }
    if (ruinaValue >= 50) {
      somaticFlags.push('ONTOLOGICAL_FRACTURE');
    }
    if (ruinaValue >= 80) {
      somaticFlags.push('LOST_SOUL_INERTIA');
    }

    const blockers: string[] = [];
    if (state.digestionProgress < 100) {
      blockers.push(`Poción previa sin digerir completamente (${state.digestionProgress.toFixed(1)}%/100%).`);
    }
    if (state.sanity < 50) {
      blockers.push(`Estabilidad mental insuficiente (${state.sanity}%). Exige al menos 50% para resistir la disonancia de una nueva poción.`);
    }
    if (state.corruption >= 40) {
      blockers.push(`Corrupción astral peligrosa (${state.corruption}%). El cuerpo astral debe purificarse antes de ingerir más características.`);
    }
    if (ruinaValue >= 80) {
      blockers.push(`Ruina crítica (${ruinaValue}). La estructura ontológica del alma no soportará el impacto de otra característica.`);
    }

    return {
      sanityTier,
      sanityDescription: this.getSanityNarrative(sanityTier),
      corruptionTier,
      corruptionDescription: this.getCorruptionNarrative(corruptionTier),
      ruina: ruinaValue,
      ruinaTier: ruinaInfo.tier,
      ruinaDescriptor: ruinaInfo.descriptor,
      convergenceBonus: ruinaInfo.convergenceBonus,
      somaticFlags,
      isRampaging,
      terminalState: state.terminalState ?? null,
      canSafelyConsumePotion: blockers.length === 0,
      blockers
    };
  }

  public static getSanityTier(sanity: number): SanityTier {
    if (sanity >= 80) return 'LUCID';
    if (sanity >= 50) return 'NERVOUS_TENSION';
    if (sanity >= 25) return 'HALLUCINATING';
    if (sanity >= 10) return 'NEAR_COLLAPSE';
    return 'RAMPAGING';
  }

  public static getCorruptionTier(corruption: number): CorruptionTier {
    if (corruption < 10) return 'PRISTINE';
    if (corruption < 30) return 'LATENT_MURMURS';
    if (corruption < 60) return 'ASTRAL_STRAIN';
    if (corruption < 85) return 'MUTATING';
    return 'CORRUPTED_VESSEL';
  }

  public static applySanityDelta(state: SomaticsState, delta: number): SomaticsState {
    let effectiveDelta = delta;

    // Las anclas de humanidad amortiguan las caídas graves de sanidad
    if (delta < 0 && state.anchorStrength > 30) {
      const mitigationFactor = (state.anchorStrength - 30) / 100 * 0.4; // Hasta 28% de reducción de daño mental
      effectiveDelta = Math.min(-1, Math.round(delta * (1 - mitigationFactor)));
    }

    const newSanity = Math.max(0, Math.min(100, state.sanity + effectiveDelta));
    return {
      ...state,
      sanity: newSanity
    };
  }

  public static applyCorruptionDelta(state: SomaticsState, delta: number): SomaticsState {
    const newCorr = Math.max(0, Math.min(100, state.corruption + delta));
    return {
      ...state,
      corruption: newCorr
    };
  }

  public static applyDigestionGain(state: SomaticsState, gain: number): SomaticsState {
    const newDig = Math.max(0, Math.min(100, state.digestionProgress + gain));
    return {
      ...state,
      digestionProgress: Number(newDig.toFixed(2))
    };
  }

  public static consumeCalmingItem(state: SomaticsState, sanityRestore: number): SomaticsState {
    return {
      ...state,
      sanity: Math.min(100, state.sanity + sanityRestore)
    };
  }

  /**
   * Acumulador permanente de Ruina. Jamás baja.
   */
  public static addRuina(
    db: DatabaseClient,
    characterId: string,
    reason: keyof SomaticsBalance['ruina_sources'],
    customAmount?: number
  ): number {
    const balance = this.getSomaticsBalance();
    const amount = customAmount ?? balance.ruina_sources[reason];
    return db.updateCharacterRuina(characterId, amount);
  }

  /**
   * Inicializa las 6 anclas iniciales de origen y plantilla (máximo 8).
   */
  public static initializeCharacterAnchors(
    db: DatabaseClient,
    characterId: string
  ): void {
    const balance = this.getSomaticsBalance();
    const existing = db.getAnchors(characterId);
    if (existing.length > 0) return;

    for (const t of balance.initial_anchor_templates) {
      db.addAnchor({
        id: `anchor_${characterId}_${t.id_suffix}`,
        character_id: characterId,
        title: t.name,
        name: t.name,
        description: t.description,
        type: t.type,
        category: t.type,
        strength: t.strength,
        damage_count: 0,
        is_destroyed: 0
      });
    }
  }

  /**
   * Daña deterministamente un ancla: selecciona el ancla activa con mayor fuerza
   * (el subconsciente intenta aferrarse con lo más valioso que tiene).
   * Si la fuerza cae a 0, queda destruida permanentemente, suma Ruina y sella su narrativa.
   * Si el ancla es dañada >= 2 veces, gatilla una cicatriz permanente.
   */
  public static damageDeterministicAnchor(
    db: DatabaseClient,
    characterId: string,
    damageOverride?: number,
    reason: string = 'RAMPAGE_OR_TRANSGRESSION'
  ): { damagedAnchor: AnchorRow | null; destroyed: boolean; scarCreated: CharacterScar | null } {
    const balance = this.getSomaticsBalance();
    const activeAnchors = db.getActiveAnchors(characterId);

    if (activeAnchors.length === 0) {
      // Sin anclas vivas: la sacudida golpea directo la ruina ontológica
      this.addRuina(db, characterId, 'anchor_destroyed');
      return { damagedAnchor: null, destroyed: true, scarCreated: null };
    }

    // Selección determinista: la de mayor fuerza (primer elemento de getActiveAnchors que ordena DESC)
    const targetAnchor = activeAnchors[0];
    const dmg = damageOverride ?? balance.anchors.damage_rampage;
    const result = db.damageAnchor(targetAnchor.id, dmg);

    let scarCreated: CharacterScar | null = null;
    // Gatillo de cicatriz: misma ancla dañada >= 2 veces
    if (result.anchor.damage_count && result.anchor.damage_count >= 2) {
      scarCreated = this.checkForScarTrigger(db, characterId, result.anchor);
    }

    if (result.destroyed) {
      this.addRuina(db, characterId, 'anchor_destroyed');
    }

    return {
      damagedAnchor: result.anchor,
      destroyed: result.destroyed,
      scarCreated
    };
  }

  /**
   * Regeneración lenta de ancla activa por interacción (válvula anti-doom-loop).
   */
  public static repairAnchorWeekly(
    db: DatabaseClient,
    characterId: string,
    anchorId: string,
    amountOverride?: number
  ): AnchorRow {
    const balance = this.getSomaticsBalance();
    const rate = amountOverride ?? balance.anchors.weekly_recovery_rate;
    return db.repairAnchor(anchorId, rate);
  }

  /**
   * Formación de nueva ancla (ej. relación que alcanza Confidente tras N semanas, respetando tope 8).
   */
  public static formNewAnchor(
    db: DatabaseClient,
    characterId: string,
    anchor: {
      type: 'PERSON' | 'LOCATION' | 'ROLE' | 'CONVICTION' | 'ROUTINE';
      name: string;
      description: string;
      strength: number;
    }
  ): boolean {
    const balance = this.getSomaticsBalance();
    const allAnchors = db.getAnchors(characterId);
    if (allAnchors.length >= balance.anchors.max_anchors) {
      return false; // Límite estricto de 8 anclas alcanzado
    }

    const anchorId = generateDeterministicId(`anchor_${characterId}`);
    db.addAnchor({
      id: anchorId,
      character_id: characterId,
      title: anchor.name,
      name: anchor.name,
      description: anchor.description,
      type: anchor.type,
      category: anchor.type,
      strength: Math.min(100, Math.max(1, anchor.strength)),
      damage_count: 0,
      is_destroyed: 0
    });
    return true;
  }

  /**
   * Gatilla y crea una cicatriz permanente si no ha sido asignada previamente a esta ancla.
   */
  public static checkForScarTrigger(
    db: DatabaseClient,
    characterId: string,
    anchor: AnchorRow
  ): CharacterScar | null {
    const existingScars = db.getScars(characterId);
    const existingCodes = new Set(existingScars.map(s => s.scarCode));
    const balance = this.getSomaticsBalance();

    // Buscar una cicatriz del catálogo que no tenga el personaje
    const candidate = balance.scars_catalog.find(s => !existingCodes.has(s.id));
    if (!candidate) return null;

    const scarId = generateDeterministicId(`scar_${characterId}_${candidate.id.toLowerCase()}`);
    const scarObj: CharacterScar = {
      id: scarId,
      characterId,
      scarCode: candidate.id,
      name: candidate.name,
      narrative: candidate.narrative,
      originAnchorId: anchor.id,
      isSevere: candidate.is_severe,
      mechanics: candidate.mechanics
    };

    db.addScar(scarObj);

    if (candidate.is_severe) {
      this.addRuina(db, characterId, 'severe_scar');
    }

    return scarObj;
  }

  /**
   * Cobra irrevocablemente el precio de un susurro [S] y registra la auditoría.
   */
  public static payWhisperPrice(
    db: DatabaseClient,
    characterId: string,
    price: WhisperPrice,
    dilemmaId: string,
    choiceId: string,
    advantageGranted: any
  ): void {
    const char = db.getCharacter(characterId);
    if (!char) throw new Error(`Personaje no encontrado: ${characterId}`);

    // 1. Cobro del precio específico
    switch (price.type) {
      case 'CORRUPTION': {
        const delta = price.amount ?? 4;
        db.updateCharacterSomatics(characterId, {
          corruption: Math.min(100, char.corruption + delta)
        });
        break;
      }
      case 'ANCHOR_DAMAGE': {
        const delta = price.amount ?? 10;
        this.damageDeterministicAnchor(db, characterId, delta, `WHISPER_PRICE_${dilemmaId}`);
        break;
      }
      case 'MEMORY_RELATION': {
        const activePersona = db.getActivePersona(characterId);
        if (activePersona) {
          db.updatePersonaSuspicion(activePersona.id, 0, 0); // Hook reservado de relación
        }
        break;
      }
      case 'MEMORY_COMPENDIUM': {
        // Marcador reservado de compendio bloqueado
        break;
      }
    }

    // 2. Ruina por elección [S] (+3) cobrada SIEMPRE
    this.addRuina(db, characterId, 'whisper_choice_s');

    // 3. Registrar auditoría inmutable
    db.recordWhisperPurchase({
      id: `wp_${characterId}_${dilemmaId}_${Date.now()}`,
      character_id: characterId,
      dilemma_id: dilemmaId,
      choice_id: choiceId,
      price_paid: price,
      advantage_granted: advantageGranted,
      day: char.current_day
    });
  }

  /**
   * Ejecuta el Rampage como Evento (salto temporal, consecuencias deterministas y mini-expediente del yo).
   */
  public static triggerRampageEvent(
    db: DatabaseClient,
    characterId: string,
    triggerReason: string = 'SANITY_COLLAPSE'
  ): RampageEventResult {
    const char = db.getCharacter(characterId);
    if (!char) throw new Error(`Personaje no encontrado: ${characterId}`);
    const balance = this.getSomaticsBalance();

    // 1. Salto temporal (horas/días)
    const hoursSkipped = 36;
    const daysSkipped = balance.rampage_event.time_skip_days || 1;
    const startDay = char.current_day;
    const endDay = db.advanceCharacterDay(characterId, daysSkipped);

    // 2. Consecuencia 1: Ancla dañada deterministamente (o destruida)
    const anchorResult = this.damageDeterministicAnchor(db, characterId, balance.anchors.damage_rampage, 'RAMPAGE');
    const damagedAnchor = anchorResult.damagedAnchor;

    // 3. Consecuencia 2: Incidente distrital
    const currentDistrict = char.current_location || 'Backlund - Cherwood';
    const tensionDelta = balance.rampage_event.district_tension_increase;
    const alertDelta = balance.rampage_event.inquisitorial_alert_increase;

    // 4. Consecuencia 3: Efecto sobre investigación activa (retraso de 2 días)
    const activeCase = db.getRawDb().prepare("SELECT * FROM investigation_cases WHERE character_id = ? AND status NOT IN ('SOLVED', 'FAILED', 'COVERED_UP') LIMIT 1").get(characterId) as any;
    let caseImpact = {
      affected: false,
      caseId: undefined as string | undefined,
      clockDelayDays: balance.rampage_event.investigation_clock_delay_days,
      description: 'Sin casos de investigación activos en el momento del colapso.'
    };
    if (activeCase) {
      caseImpact = {
        affected: true,
        caseId: activeCase.id,
        clockDelayDays: balance.rampage_event.investigation_clock_delay_days,
        description: `El reloj de la investigación [${activeCase.title}] ha avanzado ${balance.rampage_event.investigation_clock_delay_days} días sin ti; los sospechosos han movido fichas.`
      };
    }

    // 5. Acumulador permanente de Ruina (+15)
    const ruinaGained = balance.ruina_sources.rampage;
    this.addRuina(db, characterId, 'rampage');

    // 6. Mini-expediente del yo: 3 fuentes consultables (reutilizando el patrón de pistas del motor de investigación)
    const reconstructionDossier: RampageReconstructionSource[] = [
      {
        type: 'TESTIMONY',
        title: 'Testimonio del Cochero Nocturno de East Borough',
        description: 'Un cochero de alquiler afirma haber visto a una figura con sombrero desgarrado y pupilas dilatadas que vomitaba sombras viscosas cerca del muelle de carbón a las tres de la madrugada.',
        sourceLocation: 'Taberna El Pez Salado, East Borough'
      },
      {
        type: 'PHYSICAL_EVIDENCE',
        title: 'Retazos de Ropa Manchados de Lodo y Fluido Místico',
        description: 'Tus bolsillos contienen restos de botones de latón retorcidos y una mancha fluorescente que aún desprende un débil olor a ozono y sangre fría.',
        sourceLocation: 'Vestimenta del despertar'
      },
      {
        type: 'ANCHOR_IMPACT',
        title: `Secuela en ${damagedAnchor?.name || 'Vínculo Destruido'}`,
        description: `Una carta manchada con sangre seca o una cerradura forzada evidencian que en tu delirio intentaste buscar refugio en ${damagedAnchor?.name || 'tu anclaje humano'}.`,
        sourceLocation: 'Lugar del Vínculo'
      }
    ];

    // 7. Escena de despertar redactada (HUMAN_REVIEW)
    const wakeNarrative = 'El frío no entra por la piel; brota del centro de tus costillas. Despiertas boca abajo sobre adoquines grasientos de un callejón sin nombre en East Borough, con la boca impregnada de un sabor a cobre rancio y bilis. Tus uñas están rotas y ensangrentadas, pero no sientes dolor. A dos pasos de ti, los restos deshilachados de tu abrigo yacen en un charco donde el agua estancada no refleja tu rostro, sino un torbellino de niebla y sombras temblorosas. El campanario de la catedral da las cuatro de la madrugada; no sabes si de hoy, de mañana o de hace dos días. Solo una certeza palpita en tu nuca: algo que habitaba en tu sangre tomó las riendas... y la ciudad pagó el precio.';

    // 8. Persistencia SQLite del evento
    const eventId = `rampage_${characterId}_day${endDay}_${Date.now()}`;
    db.recordRampageEvent({
      id: eventId,
      character_id: characterId,
      trigger_reason: triggerReason,
      start_day: startDay,
      end_day: endDay,
      hours_skipped: hoursSkipped,
      damaged_anchor_id: damagedAnchor?.id ?? null,
      district_impact: { district: currentDistrict, tensionDelta, alertDelta },
      case_impact: caseImpact,
      reconstruction_dossier: reconstructionDossier,
      wake_narrative: wakeNarrative
    });

    // 9. Reestabilización somática fuera de la zona crítica de colapso
    db.updateCharacterSomatics(characterId, {
      sanity: 25,
      corruption: Math.min(80, char.corruption)
    });

    return {
      id: eventId,
      characterId,
      triggerReason,
      startDay,
      endDay,
      hoursSkipped,
      damagedAnchor: damagedAnchor ? {
        id: damagedAnchor.id,
        characterId: damagedAnchor.character_id,
        type: (damagedAnchor.type || 'ROUTINE') as any,
        name: damagedAnchor.name || damagedAnchor.title,
        description: damagedAnchor.description || '',
        strength: damagedAnchor.strength,
        damageCount: damagedAnchor.damage_count || 0,
        isDestroyed: damagedAnchor.is_destroyed === 1
      } : null,
      districtImpact: { district: currentDistrict, tensionDelta, alertDelta },
      caseImpact,
      reconstructionDossier,
      wakeNarrative,
      ruinaGained
    };
  }

  /**
   * Evalúa la deriva de actor (sobre-actuación sostenida con anclas bajas).
   * Gatillo: Coherencia > 1.0 en >= 2 ventanas ∧ anclas totales < 40.
   * Reversible: Anclas >= 40 ∧ coherencia moderada (0.4 .. 0.9) durante 2 ventanas.
   */
  public static checkActorDrift(
    db: DatabaseClient,
    characterId: string,
    pathway: string
  ): { hasDrift: boolean; isRecovered: boolean; pathwaySymptom?: string } {
    const weeklyState = db.getActingWeeklyState(characterId);
    let history: any = {};
    if (weeklyState && weeklyState.history_json) {
      try { history = JSON.parse(weeklyState.history_json); } catch {}
    }

    const pastCoherences: number[] = history.past_coherences || [];
    const totalAnchorStrength = db.getTotalAnchorStrength(characterId);

    const last2Coherences = [...pastCoherences, weeklyState?.coherence ?? 0].slice(-2);
    const hasHighCoherenceStreak = last2Coherences.length >= 2 && last2Coherences.every(c => c > 1.0);
    const hasLowAnchors = totalAnchorStrength < 40;

    let hasDrift = false;
    let isRecovered = false;
    let pathwaySymptom: string | undefined;

    if (hasHighCoherenceStreak && hasLowAnchors) {
      hasDrift = true;
      if (pathway === 'FOOL') {
        pathwaySymptom = 'La Vida como Representación: El mundo ha perdido su sustancia sólida; los transeúntes te parecen actores mediocres que han olvidado sus líneas y tú te descubres sonriendo mecánicamente ante tragedias ajenas, esperando que el telón baje de un momento a otro. Tu propio nombre suena como un apodo torpe que te asignaron para el primer acto.';
      } else {
        pathwaySymptom = 'Apagado Emocional: Tus propios sentimientos se han reducido a notas al margen en un manuscrito clínico. Cuando observas el dolor o el afecto de quienes te rodean, ya no sientes simpatía ni rabia; únicamente diseccionas sus mecanismos neuronales y sus pulsiones como quien observa ratones en un laberinto de cristal.';
      }
    } else if (totalAnchorStrength >= 40 && last2Coherences.length >= 2 && last2Coherences.every(c => c >= 0.4 && c <= 0.9)) {
      isRecovered = true;
    }

    return { hasDrift, isRecovered, pathwaySymptom };
  }

  /**
   * Evalúa la transformación por corrupción crónica (ruina >= 50 ∧ corrupción >= 60).
   */
  public static checkChronicTransformation(
    ruina: number,
    corruption: number
  ): { isTransforming: boolean; tier: string; symptom?: string } {
    if (ruina >= 50 && corruption >= 60) {
      if (ruina >= 80) {
        return {
          isTransforming: true,
          tier: 'VESSEL_EROSION',
          symptom: 'Receptáculo erosionado: tu cuerpo astral supura fluido místico y las miradas directas a tu aura causan espasmos a seres no iniciados.'
        };
      }
      return {
        isTransforming: true,
        tier: 'ASTRAL_PROTRUSIONS',
        symptom: 'Protuberancias astrales: miradas del vacío perceptibles bajo tu piel y sombras temblorosas que no responden a la luz de las farolas.'
      };
    }
    return { isTransforming: false, tier: 'STABLE' };
  }

  /**
   * Evalúa y sella el destino terminal del personaje en base de datos.
   */
  public static checkTerminalDestiny(
    db: DatabaseClient,
    characterId: string
  ): TerminalDestiny | null {
    const char = db.getCharacter(characterId);
    if (!char) return null;

    if (char.terminal_state && char.terminal_state !== 'ALIVE') {
      return char.terminal_state as TerminalDestiny;
    }

    if (char.current_health <= 0) {
      db.setTerminalState(characterId, 'DEAD');
      return 'DEAD';
    }

    const activeAnchors = db.getActiveAnchors(characterId);
    if ((char.ruina ?? 0) >= 100 && activeAnchors.length === 0) {
      db.setTerminalState(characterId, 'NPC_CONVERTED');
      return 'NPC_CONVERTED';
    }

    if ((char.ruina ?? 0) >= 80 && char.corruption >= 90) {
      db.setTerminalState(characterId, 'TRANSFORMED');
      return 'TRANSFORMED';
    }

    return null;
  }

  private static getSanityNarrative(tier: SanityTier): string {
    switch (tier) {
      case 'LUCID':
        return 'Tus pensamientos son ordenados y precisos. El frío de la niebla no turba tu razón.';
      case 'NERVOUS_TENSION':
        return 'Sientes fatiga ocular y una ligera opresión en las sienes. El mundo parece esconder miradas en las esquinas.';
      case 'HALLUCINATING':
        return 'Escuchas susurros sibilantes cada vez que el agua gotea. Sombras amorfas reptan por el rabillo del ojo.';
      case 'NEAR_COLLAPSE':
        return 'Tu cuerpo astral convulsiona. Vasos sanguíneos estallan en tu piel. La voluntad de las características pugna por desgarrarte.';
      case 'RAMPAGING':
        return '¡PÉRDIDA DE CONTROL INMINENTE! Tu consciencia humana se extingue. La masa de carne y tentáculos reclama tu anatomía.';
    }
  }

  private static getCorruptionNarrative(tier: CorruptionTier): string {
    switch (tier) {
      case 'PRISTINE':
        return 'Tu cuerpo astral vibra con serenidad; no hay rastros de voluntades cósmicas hostiles.';
      case 'LATENT_MURMURS':
        return 'Ecos distantes de deidades dormidas raspan tenuemente la periferia de tus sueños.';
      case 'ASTRAL_STRAIN':
        return 'La contaminación cósmica mancha tu aura con destellos púrpuras y viscosos.';
      case 'MUTATING':
        return 'Protuberancias y escamas anómalas brotan bajo tu piel. Tu sangre exhala un hedor metálico.';
      case 'CORRUPTED_VESSEL':
        return '¡CONSUMIDO! Tu alma es un títere hueco listo para el descenso de una entidad del vacío exterior.';
    }
  }
}
