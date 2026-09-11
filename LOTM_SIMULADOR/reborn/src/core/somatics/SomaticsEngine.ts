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
  TerminalDestiny
} from '../types/somatics.js';
import { DatabaseClient, AnchorRow } from '../../infra/database/DatabaseClient.js';
import { SomaticsBalance, SomaticsBalanceSchema } from '../../infra/content/schemas/somaticsBalance.schema.js';

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

    const randomSuffix = Math.random().toString(36).substring(2, 7);
    const anchorId = `anchor_${characterId}_new_${Date.now()}_${randomSuffix}`;
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

    const scarSuffix = Math.random().toString(36).substring(2, 7);
    const scarId = `scar_${characterId}_${candidate.id.toLowerCase()}_${Date.now()}_${scarSuffix}`;
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
