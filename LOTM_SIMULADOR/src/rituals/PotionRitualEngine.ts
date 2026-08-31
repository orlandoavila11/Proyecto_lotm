import { Player } from '../character/Player';
import { DatabaseManager } from '../database/DatabaseManager';

export interface BrewingRecipeCheck {
  isPerfect: boolean;
  missingMainIngredients: string[];
  missingSupplementaryIngredients: string[];
}

export class PotionRitualEngine {
  constructor() {}

  /**
   * Cruza los objetos del inventario del jugador contra la receta exacta del JSON de vías.
   */
  public verifyPotionBrewing(pathway: string, sequence: number, playerItems: string[]): BrewingRecipeCheck {
    const db = DatabaseManager.getInstance();
    const seqData = db.getSequenceData(pathway, sequence);

    if (!seqData) {
      return { isPerfect: false, missingMainIngredients: ["Fórmula no encontrada en la base de datos."], missingSupplementaryIngredients: [] };
    }

    const missingMain: string[] = [];
    const missingSupplementary: string[] = [];

    if (seqData.mainIngredients) {
      seqData.mainIngredients.forEach((ing: any) => {
        const itemFound = playerItems.some(item => item.toLowerCase().includes(ing.name.toLowerCase()));
        if (!itemFound) missingMain.push(ing.name);
      });
    }

    if (seqData.supplementaryIngredients) {
      seqData.supplementaryIngredients.forEach((ing: string) => {
        const keyword = ing.split("of ").pop() || ing;
        const itemFound = playerItems.some(item => item.toLowerCase().includes(keyword.toLowerCase()));
        if (!itemFound) missingSupplementary.push(ing);
      });
    }

    return {
      isPerfect: missingMain.length === 0 && missingSupplementary.length === 0,
      missingMainIngredients: missingMain,
      missingSupplementaryIngredients: missingSupplementary
    };
  }

  /**
   * Evalúa de forma automatizada si el jugador cumple los requisitos del ritual 
   * revisando sus banderas de hitos históricos antes de permitir el consumo.
   */
  public canConsumePotion(player: Player, targetSequence: number): { allowed: boolean; reason: string } {
    const db = DatabaseManager.getInstance();
    const seqData = db.getSequenceData(player.pathway, targetSequence);

    if (!seqData) {
      return { allowed: false, reason: "La secuencia cósmica especificada no existe." };
    }

    // Si el JSON de vías exige un ritual (no es nulo)
    if (seqData.ritual) {
      // Creamos una clave única para el ritual basada en la vía y la secuencia (ej: FOOL_5)
      const expectedRitualKey = `${player.pathway.toUpperCase()}_${targetSequence}`;
      
      if (!player.hasCompletedRitual(expectedRitualKey)) {
        return {
          allowed: false,
          reason: `⚠️ [AVANCE RECHAZADO POR LAS LEYES ASTRALES]: No has ejecutado el ritual obligatorio.\n   Requisito del JSON: "${seqData.ritual}"\n   [Tip]: Completa misiones o eventos especiales de rango S-${targetSequence} para activar la bandera [${expectedRitualKey}].`
        };
      }
    }

    return { allowed: true, reason: "Ritual verificado con éxito en el registro de hitos del personaje." };
  }
} // <-- Esta llave de cierre era la que faltaba al final del archivo
