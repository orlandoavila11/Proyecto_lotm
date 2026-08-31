import { Player } from '../character/Player';

export interface ActingEvent {
  actionDescription: string;
  isAlignedWithPrinciples: boolean;
  digestionBonus: number;
  sanityCost: number;
}

export class ActingEngine {
  private player: Player;
  private currentDigestion: number; // Rango: 0 a 100

  constructor(player: Player, initialDigestion: number = 0) {
    this.player = player;
    this.currentDigestion = Math.max(0, Math.min(100, initialDigestion));
  }

  /**
   * Evalúa una acción de rol del jugador. Si se alinea con el núcleo de su vía,
   * acelera la digestión. Si choca con ella, arriesga la cordura.
   */
  public performActing(event: ActingEvent): { success: boolean; message: string; isFullyDigested: boolean } {
    if (this.currentDigestion >= 100) {
      return {
        success: false,
        message: "La poción actual ya está completamente digerida. Debes avanzar a la siguiente Secuencia.",
        isFullyDigested: true
      };
    }

    if (event.isAlignedWithPrinciples) {
      this.currentDigestion = Math.min(100, this.currentDigestion + event.digestionBonus);
     
      let digestionMessage = `Has actuado de acuerdo con los principios de la Secuencia ${this.player.sequence}. Tu comprensión de la poción se profundiza (+${event.digestionBonus}% digestión).`;
     
      if (this.currentDigestion >= 100) {
        digestionMessage += " ¡Has digerido la poción por completo! El riesgo de perder el control al avanzar ha disminuido drásticamente.";
      }

      return {
        success: true,
        message: digestionMessage,
        isFullyDigested: this.currentDigestion >= 100
      };
    } else {
      // Actuar en contra de la vía desestabiliza la espiritualidad
      if (typeof this.player.modifySanity === 'function') {
        this.player.modifySanity(-event.sanityCost);
      } else {
        this.player.sanity -= event.sanityCost;
      }

      return {
        success: false,
        message: `Tus acciones contradicen tu Vía. Sientes que la poción en tu interior se revuelve. (Cordura -${event.sanityCost}).`,
        isFullyDigested: false
      };
    }
  }

  public getDigestionLevel(): number {
    return this.currentDigestion;
  }
}