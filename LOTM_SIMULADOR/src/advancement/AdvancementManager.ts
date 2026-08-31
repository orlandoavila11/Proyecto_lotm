import { Player } from '../character/Player';
import { DatabaseManager } from '../database/DatabaseManager';
import { InventorySystem, IngredientItem } from '../inventory/InventorySystem';
import { CorruptionManager } from '../corruption/CorruptionManager';
import { ActingEngine } from '../acting/ActingEngine';

export interface AdvancementAttempt {
  targetSequence: number;
  mainIngredients: IngredientItem[];
  hasPerformedRitual: boolean; // Obligatorio para Secuencia 4 o menor (Semidioses)
}

export interface AdvancementResult {
  success: boolean;
  resultMessage: string;
  deathOrMonster: boolean;
}

export class AdvancementManager {
  // Escala exponencial exacta para calcular la mutación de poder en cada nivel
  private readonly sequenceMultiplier: Record<number, number> = {
    9: 1,  8: 2,  7: 4,  6: 8,  5: 16,
    4: 32, 3: 64, 2: 128, 1: 256, 0: 512
  };

  constructor(
    private player: Player,
    private inventory: InventorySystem,
    private corruption: CorruptionManager,
    private acting: ActingEngine
  ) {}

  /**
   * Orquesta todo el proceso de avance de secuencia: desde la validación de ingredientes
   * hasta el cálculo de éxito y la mutación final de estadísticas.
   */
  public attemptAdvancement(attempt: AdvancementAttempt): AdvancementResult {
    // 1. VALIDACIONES PREVIAS (Reglas de negocio)
    if (this.player.sequence <= attempt.targetSequence) {
      return { 
        success: false, 
        resultMessage: "❌ Ya te encuentras en esta Secuencia o en una superior.", 
        deathOrMonster: false 
      };
    }

    if (attempt.mainIngredients.length < 2) {
      this.triggerInstantMythicalCreatureCollapse();
      return { 
        success: false, 
        resultMessage: "💀 FRACASO INMEDIATO: Consumir una poción incompleta es un suicidio. Tus células Beyonder se han rebelado.", 
        deathOrMonster: true 
      };
    }

    // 2. CÁLCULO DE PROBABILIDADES (Fidelidad al Lore)
    let successChance = this.acting.getDigestionLevel(); // Base: 0% a 100%
    const isPotionPerfect = successChance >= 100;

    // Modificadores de Riesgo Divino (Semidioses - Secuencia 4 para abajo)
    if (attempt.targetSequence <= 4) {
      if (!attempt.hasPerformedRitual) {
        this.corruption.addCorruption(100);
        this.triggerInstantMythicalCreatureCollapse();
        return { 
          success: false, 
          resultMessage: "💀 FRACASO ABSOLUTO: Intentaste ascender a un estado divino (Secuencia ≤ 4) sin un ritual de anclaje. Has perdido el control instantáneamente.", 
          deathOrMonster: true 
        };
      } else {
        successChance += 20; // El ritual otorga estabilidad
      }
    }

    // Penalizaciones por salud mental comprometida y corrupción latente
    const playerSanity = typeof this.player.modifySanity === 'function' ? this.player.sanity : this.player.sanity;
    if (playerSanity < 50) successChance -= (50 - playerSanity);
    if (this.corruption.getCorruptionLevel() > 30) successChance -= this.corruption.getCorruptionLevel();

    // 3. RESOLUCIÓN DETERMINISTA
    const roll = Math.random() * 100;
    
    // Consumir los ingredientes del inventario de forma segura
    attempt.mainIngredients.forEach(ing => this.inventory.removeItem(ing.id, 1));

    // Evaluar tirada contra la probabilidad calculada
    if (roll <= successChance) {
      return this.executeSuccessfulEvolution(attempt.targetSequence, isPotionPerfect);
    } else {
      return this.handleFailedEvolution();
    }
  }

  /**
   * Aplica la mutación permanente y los incrementos de atributos tras un consumo exitoso.
   */
  private executeSuccessfulEvolution(targetSequence: number, isPotionPerfect: boolean): AdvancementResult {
    const db = DatabaseManager.getInstance();
    const seqData = db.getSequenceData(this.player.pathway, targetSequence);

    // Riesgo matemático remanente de pérdida de control programado en la clase Player
    const lossOfControlRisk = this.player.calculateLossOfControlRisk(isPotionPerfect);
    if (Math.random() * 100 < lossOfControlRisk) {
      this.triggerInstantMythicalCreatureCollapse();
      return {
        success: false,
        resultMessage: `💀 [CRITICAL LOSS OF CONTROL]: ¡A pesar de los cálculos, las características Beyonder rechazaron tu cuerpo en el último segundo! Te has convertido en un monstruo de carne.`,
        deathOrMonster: true
      };
    }

    // Actualización de estado del Beyonder
    this.player.sequence = targetSequence;
    this.player.digestion = 0.0; // Se resetea el medidor para el nuevo rango

    // Escalado exponencial de Atributos Vitales
    const currentMultiplier = this.sequenceMultiplier[targetSequence] || 1;
    
    this.player.health.max = 100 * (currentMultiplier * 0.5 + 1);
    this.player.health.current = this.player.health.max;

    this.player.spirituality.max = Math.floor(80 * (currentMultiplier * 0.75 + 1));
    this.player.spirituality.current = this.player.spirituality.max;

    // Registro en la bitácora del jugador y carga de habilidades JSON
    const unlockedAbilities = seqData?.abilities || ["Habilidades latentes desconocidas"];
    this.player.logActingNote(`Ascendió exitosamente a S-${targetSequence} (${seqData?.name}).`);

    return {
      success: true,
      resultMessage: `🎉 [ASCENSIÓN EXITOSA]: Has sobrevivido a la asimilación. Ahora eres un Beyonder de Secuencia ${targetSequence}: [${seqData?.name}].\n   └─ Atributos Expandidos -> Vida Máx: ${this.player.health.max} | Espiritualidad Máx: ${this.player.spirituality.max}\n   └─ Habilidades Desbloqueadas: ${unlockedAbilities.join(', ')}`,
      deathOrMonster: false
    };
  }

  /**
   * Gestiona el daño masivo, corrupción y posible muerte del jugador tras un fallo.
   */
  private handleFailedEvolution(): AdvancementResult {
    const sanityDamage = 50 + Math.floor(Math.random() * 50);
    this.corruption.addCorruption(60);
    
    if (typeof this.player.modifySanity === 'function') {
      this.player.modifySanity(-sanityDamage);
    } else {
      this.player.sanity -= sanityDamage;
    }

    let msg = `⚠️ FRACASO: Tu mente no pudo soportar el choque de características. Sufres daño masivo a tu cordura (-${sanityDamage}) y corrupción extrema (+60).`;
    let isDead = false;

    if (this.player.sanity <= 0 || this.corruption.getCorruptionLevel() >= 100) {
      this.triggerInstantMythicalCreatureCollapse();
      msg += " Te has desgarrado desde adentro, perdiendo toda la humanidad.";
      isDead = true;
    }

    return { success: false, resultMessage: msg, deathOrMonster: isDead };
  }

  /**
   * Resetea los atributos del jugador en caso de una pérdida total de control (Muerte/Mutación).
   */
  private triggerInstantMythicalCreatureCollapse(): void {
    this.player.health.current = 0;
    this.player.sanity = 0;
    this.player.humanity = 0;
  }
}
