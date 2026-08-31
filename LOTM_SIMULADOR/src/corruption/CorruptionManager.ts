import { Player } from '../character/Player';

export enum MutationLevel {
  NONE = "NONE",
  WHISPERS = "WHISPERS", // Alucinaciones auditivas, delirios menores
  PHYSICAL = "PHYSICAL", // Mutación física menor (ojos extra, escamas)
  LOSING_CONTROL = "LOSING", // Al borde de convertirse en un monstruo
  MONSTER = "MONSTER" // Pérdida total de humanidad (Game Over)
}

export class CorruptionManager {
  private player: Player;
  private corruption: number = 0; // Rango: 0 a 100

  constructor(player: Player, initialCorruption: number = 0) {
    this.player = player;
    this.corruption = initialCorruption;
  }

  /**
   * Añade corrupción debido a exposición cósmica, artefactos prohibidos o entidades de alta secuencia.
   */
  public addCorruption(amount: number): { currentCorruption: number; newMutation: MutationLevel; message: string } {
    this.corruption = Math.min(100, this.corruption + amount);
    
    // Impacto directo en la cordura máxima o actual como efecto secundario
    const sanityDamage = Math.floor(amount / 2);
    if (typeof this.player.modifySanity === 'function') {
      this.player.modifySanity(-sanityDamage);
    } else {
      this.player.sanity -= sanityDamage;
    }

    const state = this.evaluateMutationState();

    return {
      currentCorruption: this.corruption,
      newMutation: state,
      message: this.getMutationMessage(state)
    };
  }

  /**
   * Ciertos rituales o habilidades de purificación pueden reducir la corrupción.
   */
  public cleanseCorruption(amount: number): void {
    this.corruption = Math.max(0, this.corruption - amount);
  }

  public getCorruptionLevel(): number {
    return this.corruption;
  }

  public evaluateMutationState(): MutationLevel {
    if (this.corruption >= 100) return MutationLevel.MONSTER;
    if (this.corruption >= 80) return MutationLevel.LOSING_CONTROL;
    if (this.corruption >= 50) return MutationLevel.PHYSICAL;
    if (this.corruption >= 25) return MutationLevel.WHISPERS;
    return MutationLevel.NONE;
  }

  private getMutationMessage(level: MutationLevel): string {
    switch (level) {
      case MutationLevel.MONSTER:
        return "CRÍTICO: Has sucumbido a la corrupción. Tu humanidad se ha desvanecido y te has convertido en un Rampaging Beyonder.";
      case MutationLevel.LOSING_CONTROL:
        return "PELIGRO: Tu espiritualidad está colapsando. Protuberancias emergen debajo de tu piel. Pierdes el control.";
      case MutationLevel.PHYSICAL:
        return "ADVERTENCIA: Tu cuerpo está cambiando. Escamas o tejido anómalo han comenzado a crecer en tu carne.";
      case MutationLevel.WHISPERS:
        return "Escuchas murmullos ininteligibles que raspan tu mente. La niebla se cierne sobre tu percepción.";
      default:
        return "Tu estado espiritual se mantiene estable, pero la corrupción siempre acecha.";
    }
  }
}