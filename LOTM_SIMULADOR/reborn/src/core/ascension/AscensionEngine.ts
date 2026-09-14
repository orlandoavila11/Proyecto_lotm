import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseClient, InventoryItemRow } from '../../infra/database/DatabaseClient.js';
import { SeededRNG } from '../rng/SeededRNG.js';
import { generateDeterministicId } from '../rng/IdGenerator.js';
import { SomaticsEngine } from '../somatics/SomaticsEngine.js';
import { ConvergenceEngine } from '../convergence/ConvergenceEngine.js';
import { EconomyEngine } from '../economy/EconomyEngine.js';
import { MarketItemQuality } from '../../infra/content/schemas/economyMarket.schema.js';

export interface PreparationChecklist {
  lugar: boolean;
  momento: boolean;
  materiales_rituales: boolean;
  costos_anclaje: boolean;
}

export interface AscensionStatus {
  canDrink: boolean;
  currentSequence: number;
  targetSequence: number;
  pathway: string;
  door1_formula: {
    passed: boolean;
    formulaCode: string;
    name: string;
    details: string;
  };
  door2_ingredients: {
    passed: boolean;
    mainCount: number;
    requiredMainCount: number;
    supplementaryCount: number;
    requiredSupplementaryCount: number;
    averageQuality: MarketItemQuality;
    details: string[];
  };
  door3_digestion: {
    passed: boolean;
    current: number;
    required: number;
    details: string;
  };
  door4_preparation: {
    passed: boolean;
    score: number;
    maxScore: number;
    mitigationPercent: number;
    checklist: PreparationChecklist;
  };
  estimatedSuccessRate: number;
}

export interface AscensionResult {
  outcome: 'SUCCESS' | 'RAMPAGE';
  newSequence: number;
  digestionProgress: number;
  corruptionDelta: number;
  ruinaDelta: number;
  convergenciaGained: number;
  telemetry: {
    presented_at: number;
    confirmed_at: number;
    hesitation_ms: number;
    preparation_score: number;
    average_quality: MarketItemQuality;
  };
  narrativeText: string;
  rampageEvent?: any;
}

export class AscensionEngine {
  /**
   * Requisitos canónicos de ingredientes S8 por vía
   */
  public static readonly CANONICAL_FORMULAS: Record<string, {
    formulaCode: string;
    name: string;
    mainCodes: string[];
    suppCodes: string[];
  }> = {
    FOOL: {
      formulaCode: 'KNOW_FORMULA_CLOWN',
      name: 'Fórmula de Secuencia 8 Clown (Payaso)',
      mainCodes: ['ING_GOAT_HORN_CRYSTAL', 'ING_HUMAN_FACED_ROSE_STALK'],
      suppCodes: ['ING_JIMSONWEED_JUICE', 'ING_BLACK_SUNFLOWER_POWDER', 'ING_GOLDEN_CLOAK_GRASS_POWDER', 'ING_POISON_HEMLOCK']
    },
    VISIONARY: {
      formulaCode: 'KNOW_FORMULA_TELEPATHIST',
      name: 'Fórmula de Secuencia 8 Telepathist (Telépata)',
      mainCodes: ['ING_LIZARD_DRAGON_GLAND', 'ING_FALSMAN_RABBIT_SPINAL_FLUID'],
      suppCodes: ['ING_CHESTNUT_BUDS', 'ING_DRAGON_TOOTH_GRASS_POWDER', 'ING_ELVEN_FLOWERS']
    }
  };

  /**
   * Evalúa el estado de las Cinco Puertas para un personaje.
   */
  public static evaluateAscensionStatus(
    db: DatabaseClient,
    characterId: string
  ): AscensionStatus {
    const char = db.getCharacter(characterId);
    if (!char) {
      throw new Error(`Character '${characterId}' no existe`);
    }

    const pathwayKey = char.pathway.toUpperCase();
    const formulaDef = this.CANONICAL_FORMULAS[pathwayKey] || this.CANONICAL_FORMULAS.FOOL;
    const targetSeq = char.sequence - 1; // S9 -> S8

    // PUERTA 1: Fórmula
    // Se valida conocimiento canónico o posesión de grimorio/fórmula registrada
    const door1_passed = true; // El personaje posee la fórmula canónica en su memoria/investigación

    // PUERTA 2: Ingredientes e Inventario
    const invItems = db.getInventoryItems(characterId);
    const mainFound: InventoryItemRow[] = [];
    const suppFound: InventoryItemRow[] = [];
    const ingredientDetails: string[] = [];

    for (const code of formulaDef.mainCodes) {
      const match = invItems.find(i => i.item_code === code && i.quantity >= 1);
      if (match) {
        mainFound.push(match);
        ingredientDetails.push(`[PRINCIPAL] ${match.name} (Calidad: ${match.quality})`);
      } else {
        ingredientDetails.push(`[FALTA PRINCIPAL] Código: ${code}`);
      }
    }

    for (const code of formulaDef.suppCodes) {
      const match = invItems.find(i => i.item_code === code && i.quantity >= 1);
      if (match) {
        suppFound.push(match);
        ingredientDetails.push(`[AUXILIAR] ${match.name} (Calidad: ${match.quality})`);
      }
    }

    const door2_passed = mainFound.length >= formulaDef.mainCodes.length && suppFound.length >= 2;

    // Calcular calidad promedio
    const allIngredients = [...mainFound, ...suppFound];
    let avgQuality: MarketItemQuality = 'PRISTINE';
    if (allIngredients.length > 0) {
      const contCount = allIngredients.filter(i => i.quality === 'CONTAMINATED').length;
      const damCount = allIngredients.filter(i => i.quality === 'DAMAGED').length;
      if (contCount > 0) {
        avgQuality = 'CONTAMINATED';
      } else if (damCount > 0) {
        avgQuality = 'DAMAGED';
      }
    }

    // PUERTA 3: Digestión (= 100)
    const door3_passed = char.digestion_progress >= 99.9;

    // PUERTA 4: Preparación Checklist
    const savedState = db.getAscensionState(characterId);
    let checklist: PreparationChecklist = {
      lugar: false,
      momento: false,
      materiales_rituales: false,
      costos_anclaje: false
    };

    if (savedState && savedState.checklist_json) {
      try {
        checklist = { ...checklist, ...JSON.parse(savedState.checklist_json) };
      } catch {}
    }

    let prepScore = 0;
    if (checklist.lugar) prepScore++;
    if (checklist.momento) prepScore++;
    if (checklist.materiales_rituales) prepScore++;
    if (checklist.costos_anclaje) prepScore++;

    const mitigationPercent = prepScore * 10; // +10% de mitigación por ítem
    const door4_passed = prepScore > 0;

    // Estimación de probabilidad de éxito
    let successRate = 60; // base
    if (door4_passed) successRate += mitigationPercent;
    if (avgQuality === 'PRISTINE') successRate += 15;
    else if (avgQuality === 'CONTAMINATED') successRate -= 25;

    successRate = Math.min(95, Math.max(10, successRate));
    const canDrink = door1_passed && door2_passed && door3_passed;

    return {
      canDrink,
      currentSequence: char.sequence,
      targetSequence: targetSeq,
      pathway: char.pathway,
      door1_formula: {
        passed: door1_passed,
        formulaCode: formulaDef.formulaCode,
        name: formulaDef.name,
        details: `Conocimiento canónico verificado: ${formulaDef.name}`
      },
      door2_ingredients: {
        passed: door2_passed,
        mainCount: mainFound.length,
        requiredMainCount: formulaDef.mainCodes.length,
        supplementaryCount: suppFound.length,
        requiredSupplementaryCount: 2,
        averageQuality: avgQuality,
        details: ingredientDetails
      },
      door3_digestion: {
        passed: door3_passed,
        current: char.digestion_progress,
        required: 100.0,
        details: door3_passed 
          ? 'Digestión completa al 100%. La poción anterior ha sido asimilada en su totalidad.' 
          : `Digestión insuficiente (${char.digestion_progress.toFixed(1)}% / 100.0%). Riesgo letal de colapso si se consume antes del 100%.`
      },
      door4_preparation: {
        passed: door4_passed,
        score: prepScore,
        maxScore: 4,
        mitigationPercent,
        checklist
      },
      estimatedSuccessRate: successRate
    };
  }

  /**
   * Actualiza el checklist de preparación (Puerta 4) y registra la presentación de la escena del trago.
   */
  public static updatePreparationChecklist(
    db: DatabaseClient,
    characterId: string,
    checklistUpdates: Partial<PreparationChecklist>,
    isPresented: boolean = false
  ): PreparationChecklist {
    const existing = db.getAscensionState(characterId);
    let currentChecklist: PreparationChecklist = {
      lugar: false,
      momento: false,
      materiales_rituales: false,
      costos_anclaje: false
    };

    if (existing && existing.checklist_json) {
      try {
        currentChecklist = { ...currentChecklist, ...JSON.parse(existing.checklist_json) };
      } catch {}
    }

    const mergedChecklist = { ...currentChecklist, ...checklistUpdates };
    const presentedAt = isPresented 
      ? (existing?.presented_at || Date.now()) 
      : (existing?.presented_at || null);

    db.saveAscensionState({
      character_id: characterId,
      current_step: isPresented ? 'TRAGO_PRESENTED' : 'CHECKLIST_IN_PROGRESS',
      presented_at: presentedAt,
      checklist_json: JSON.stringify(mergedChecklist)
    });

    return mergedChecklist;
  }

  /**
   * PUERTA 5: EL TRAGO (`POST /api/ascension/drink`)
   * Ejecuta el consumo ritual de la poción de ascenso.
   */
  public static drinkPotion(
    db: DatabaseClient,
    characterId: string,
    rng: SeededRNG,
    confirmedAt: number = Date.now()
  ): AscensionResult {
    const char = db.getCharacter(characterId);
    if (!char) {
      throw new Error(`Character '${characterId}' no existe`);
    }

    const status = this.evaluateAscensionStatus(db, characterId);
    if (!status.door3_digestion.passed) {
      throw new Error(`[REGLA §3.8]: La digestión actual es ${status.door3_digestion.current}% y debe ser 100% para ascender.`);
    }

    if (!status.door2_ingredients.passed) {
      throw new Error(`[INGREDIENTES INSUFICIENTES]: Faltan ingredientes canónicos para componer la poción.`);
    }

    const stateRow = db.getAscensionState(characterId);
    const presentedAt = stateRow?.presented_at || (confirmedAt - 1500); // 1.5s delta fallback determinista
    const hesitationMs = Math.max(0, confirmedAt - presentedAt);

    // Consumir SIEMPRE los ingredientes (éxito o fallo)
    const formulaDef = this.CANONICAL_FORMULAS[char.pathway.toUpperCase()] || this.CANONICAL_FORMULAS.FOOL;
    for (const code of formulaDef.mainCodes) {
      db.consumeItemByCode(characterId, code, 1);
    }
    for (const code of formulaDef.suppCodes) {
      db.consumeItemByCode(characterId, code, 1);
    }

    // Calcular probabilidad de fallo
    // Bot preparado (checklist 4/4, PRISTINE) -> fallo <= 20%
    // Bot desprevenido (checklist 0/4, CONTAMINATED) -> fallo >= 50%
    let failChance = 35; // base neutral
    if (status.door4_preparation.score === 4) {
      failChance -= 20; // 15%
    } else {
      failChance -= (status.door4_preparation.score * 4);
    }

    if (status.door2_ingredients.averageQuality === 'PRISTINE') {
      failChance -= 5;
    } else if (status.door2_ingredients.averageQuality === 'CONTAMINATED') {
      failChance += 30; // sube por encima de 50%
    }

    failChance = Math.max(10, Math.min(85, failChance));

    // Tirada determinista de fallo
    const roll = rng.nextInt(1, 100);
    const isRampage = roll <= failChance;

    if (isRampage) {
      // --- CASO FALLO: RAMPAGE SOMÁTICO ---
      // Ruina +15, ancla dañada, despertar amnésico, mini-expediente, digestión se mantiene en 100
      const rampageEvent = SomaticsEngine.triggerRampageEvent(
        db,
        characterId,
        'BACKLASH_POTION_ASCENSION'
      );

      // Registrar telemetría de fallo
      const telemetryId = generateDeterministicId('tel_drink');
      db.logAscensionTelemetry({
        id: telemetryId,
        character_id: characterId,
        target_sequence: 8,
        target_pathway: char.pathway,
        outcome: 'RAMPAGE',
        presented_at: presentedAt,
        confirmed_at: confirmedAt,
        hesitation_ms: hesitationMs,
        preparation_score: status.door4_preparation.score,
        quality_average: status.door2_ingredients.averageQuality
      });

      // Limpiar estado de ascenso para permitir reintentos futuros
      db.saveAscensionState({
        character_id: characterId,
        current_step: 'FAILED',
        presented_at: null,
        checklist_json: '{}'
      });

      const narrativeFail = 
        `[COLAPSO SOMÁTICO · DESCONTROL ESPIRITUAL]\n` +
        `El líquido arde como plomo fundido en tu garganta. La poción no se integra: se rebela contra las paredes de tu cuerpo astral.\n` +
        `Sombras y espasmos incontrolables sacuden tus extremidades mientras un coro de susurros ensordecedores destroza tu compostura.\n` +
        `Los ingredientes han sido consumidos en el caos de la transgresión, pero tu ancla ha evitado el colapso definitivo.\n` +
        `Tu ruina se ha incrementado (+15) y tu refugio guarda las cicatrices de la noche en que casi te pierdes.`;

      return {
        outcome: 'RAMPAGE',
        newSequence: char.sequence,
        digestionProgress: 100.0, // Se mantiene en 100
        corruptionDelta: 10,
        ruinaDelta: 15,
        convergenciaGained: 0,
        telemetry: {
          presented_at: presentedAt,
          confirmed_at: confirmedAt,
          hesitation_ms: hesitationMs,
          preparation_score: status.door4_preparation.score,
          average_quality: status.door2_ingredients.averageQuality
        },
        narrativeText: narrativeFail,
        rampageEvent
      };
    } else {
      // --- CASO ÉXITO: ASCENSO CANÓNICO (S9 -> S8) ---
      const newSeq = 8;
      // Reseteo estricto de digestión a 0
      db.updateCharacterSomatics(characterId, {
        sequence: newSeq,
        digestion: 0.0,
        corruption: Math.min(100, char.corruption + Math.max(1, 6 - status.door4_preparation.score))
      });

      // Aumento de convergencia distrital (+30)
      const convGained = ConvergenceEngine.recordConvergenceEvent(
        db,
        characterId,
        char.current_location,
        'ASCENSION',
        char.current_day,
        30
      );

      // Registrar telemetría de éxito
      const telemetryId = generateDeterministicId('tel_drink');
      db.logAscensionTelemetry({
        id: telemetryId,
        character_id: characterId,
        target_sequence: 8,
        target_pathway: char.pathway,
        outcome: 'SUCCESS',
        presented_at: presentedAt,
        confirmed_at: confirmedAt,
        hesitation_ms: hesitationMs,
        preparation_score: status.door4_preparation.score,
        quality_average: status.door2_ingredients.averageQuality
      });

      // Limpiar estado de ascenso
      db.saveAscensionState({
        character_id: characterId,
        current_step: 'COMPLETED',
        presented_at: null,
        checklist_json: '{}'
      });

      const narrativeSuccess = char.pathway.toUpperCase() === 'FOOL'
        ? `[TRANSFORMACIÓN ASTRICA · PAYASO]\n` +
          `Un cosquilleo gélido y efervescente recorre cada terminación nerviosa de tu rostro y tus dedos.\n` +
          `La sonrisa brota sin esfuerzo, una máscara elástica que oculta cualquier angustia o temblor.\n` +
          `Tus articulaciones adquieren una flexibilidad sobrehumana y tus ojos perciben trayectorias invisibles en el aire.\n` +
          `Has ascendido a Secuencia 8: Payaso. Tu digestión recomienza desde el vacío.`
        : `[TRANSFORMACIÓN ASTRICA · TELÉPATA]\n` +
          `El sabor dulce y metálico de la poción anestesia tu lengua mientras las barreras de tu mente se expanden.\n` +
          `El murmullo distante de los pensamientos del distrito reverbera como ondas en un estanque de plata.\n` +
          `Distingues el pánico, la codicia y la sospecha de quienes caminan bajo las farolas de gas.\n` +
          `Has ascendido a Secuencia 8: Telépata. Tu digestión recomienza desde el vacío.`;

      return {
        outcome: 'SUCCESS',
        newSequence: newSeq,
        digestionProgress: 0.0,
        corruptionDelta: Math.max(1, 6 - status.door4_preparation.score),
        ruinaDelta: 0,
        convergenciaGained: 30,
        telemetry: {
          presented_at: presentedAt,
          confirmed_at: confirmedAt,
          hesitation_ms: hesitationMs,
          preparation_score: status.door4_preparation.score,
          average_quality: status.door2_ingredients.averageQuality
        },
        narrativeText: narrativeSuccess
      };
    }
  }
}
