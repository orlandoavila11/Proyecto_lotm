import { Player } from '../entities/Player';
import { NPC } from '../entities/NPC';
import { DatabaseManager } from '../database/DatabaseManager';
import { CombatEngine, CombatResult } from './CombatEngine';

export interface ExplorationEvent {
  type: 'COMBAT' | 'EVENT' | 'EMPTY';
  location: string;
  description: string;
  combatResult?: CombatResult;
  sanityChange?: number;
  rewardPounds?: number;
}

export class ExplorationSystem {
  private combatEngine: CombatEngine;

  constructor() {
    this.combatEngine = new CombatEngine();
  }

  /**
   * Ejecuta una exploración en la ubicación actual o especificada.
   */
  public exploreLocation(player: Player, locationName: string = player.currentLocation): ExplorationEvent {
    player.currentLocation = locationName;
    const db = DatabaseManager.getInstance();

    // 1. Verificar si hay monstruos asignados a esta localización
    const availableMonsters = db.getMonstersByLocation(locationName);
    
    // Probabilidad de combate (60% si existen monstruos en el área)
    if (availableMonsters.length > 0 && Math.random() < 0.6) {
      const selectedMonsterData = availableMonsters[Math.floor(Math.random() * availableMonsters.length)];
      const enemyNpc = NPC.fromMonsterData(selectedMonsterData);

      const combatResult = this.combatEngine.resolveCombat(player, enemyNpc);

      return {
        type: 'COMBAT',
        location: locationName,
        description: `¡Te has topado con una criatura peligrosa: ${enemyNpc.name}!`,
        combatResult
      };
    }

    // 2. Verificar si se desencadena un evento aleatorio de la base de datos
    const globalEvents = db.getEvents();
    if (globalEvents.length > 0 && Math.random() < 0.5) {
      const randomEvent = globalEvents[Math.floor(Math.random() * globalEvents.length)];
      
      const sanityEffect = randomEvent.sanityImpact || 0;
      const poundsEffect = randomEvent.poundsReward || 0;

      if (sanityEffect !== 0) player.modifySanity(sanityEffect);
      if (poundsEffect > 0) player.addPounds(poundsEffect);

      return {
        type: 'EVENT',
        location: locationName,
        description: randomEvent.description || randomEvent.title || "Has presenciado un fenómeno místico imprevisto.",
        sanityChange: sanityEffect,
        rewardPounds: poundsEffect
      };
    }

    // 3. Exploración tranquila / Sin hallazgos
    player.modifySanity(2); // Un breve descanso restaura levemente la sanidad
    return {
      type: 'EMPTY',
      location: locationName,
      description: `Exploraste ${locationName} sin incidentes graves. El ambiente permanece sereno.`
    };
  }
}