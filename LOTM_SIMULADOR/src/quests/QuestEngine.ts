import { Player } from '../entities/Player';
import { DatabaseManager } from '../database/DatabaseManager';
import { WorldEventData } from '../types/interfaces';

export interface EventResolution {
  event: WorldEventData;
  chosenOutcome: string;
  sanityImpact: number;
  corruptionImpact: number;
  digestBonus: number;
  message: string;
}

export class EventEngine {
  /**
   * Obtiene un evento contextual adecuado para la secuencia actual del jugador.
   */
  public getRandomEventForPlayer(player: Player): WorldEventData | null {
    const db = DatabaseManager.getInstance();
    const sequenceEvents = db.getEventsBySequence(player.sequence);
    
    if (sequenceEvents.length === 0) return null;
    
    const index = Math.floor(Math.random() * sequenceEvents.length);
    return sequenceEvents[index];
  }

  /**
   * Procesa la resolución de un evento dinámico/narrativo sobre el jugador.
   */
  public resolveEvent(player: Player, event: WorldEventData): EventResolution {
    const outcomes = event.possibleOutcomes || ["Victory", "Corruption", "Death"];
    const outcome = outcomes[Math.floor(Math.random() * outcomes.length)];

    let sanityImpact = 0;
    let corruptionImpact = 0;
    let digestBonus = 0;
    let message = "";

    switch (outcome) {
      case "Victory":
        digestBonus = 10;
        sanityImpact = 5;
        player.digest(digestBonus);
        player.modifySanity(sanityImpact);
        message = `Has superado con éxito el evento '${event.name}'. Tu comprensión de la poción ha aumentado (+${digestBonus}% digestión).`;
        break;

      case "Corruption":
        corruptionImpact = 15;
        sanityImpact = -20;
        player.corruption = Math.min(100, player.corruption + corruptionImpact);
        player.modifySanity(sanityImpact);
        message = `El incidente '${event.name}' expuso tu mente a conocimientos prohibidos (+${corruptionImpact}% Corrupción, -20 Sanidad).`;
        break;

      case "Death":
      default:
        // En secuencias bajas/medias la "Muerte" en eventos narrativos se traduce en daño severo de Sanidad y trauma
        sanityImpact = -40;
        player.modifySanity(sanityImpact);
        message = `Apenas lograste escapar con vida del evento '${event.name}' de categoría ${event.category}. Sufriste un grave trauma mental.`;
        break;
    }

    return {
      event,
      chosenOutcome: outcome,
      sanityImpact,
      corruptionImpact,
      digestBonus,
      message
    };
  }
} 