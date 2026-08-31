import { Player } from '../character/Player';
import { MonsterData } from '../database/types';
import { InventorySystem, SealedArtifactItem, EquipmentItem } from '../inventory/InventorySystem';

export interface CombatActionResult {
  actor: string;
  actionName: string;
  damageDealt: number;
  sanityChange: number;
  message: string;
  isTargetDefeated: boolean;
}

export class CombatEngine {
  private player: Player;
  private enemy: MonsterData;
  private enemyCurrentHp: number;
  private inventory: InventorySystem;
  private turnCount: number = 0;

  constructor(player: Player, enemy: MonsterData, inventory: InventorySystem) {
    this.player = player;
    this.enemy = enemy;
    this.enemyCurrentHp = enemy.hp || 50;
    this.inventory = inventory;
  }

  public playerTurn(actionType: 'BASIC' | 'SKILL', skillName?: string): CombatActionResult {
    this.turnCount++;
    let damage = 10;
    let sanityCost = 0;
    let desc = `${this.player.getName()} ataca físicamente.`;

    // 1. Escalar daño por Secuencia
    if (actionType === 'SKILL') {
      const seqMultiplier = (10 - this.player.getSequenceNumber());
      damage = 15 + (seqMultiplier * 5);
      desc = `${this.player.getName()} canaliza '${skillName || 'Habilidad de Vía'}'!`;
    }

    // 2. Extraer bonificadores del Inventario (Armas y Artefactos no sellados)
    const items = this.inventory.getAllItems();
    
    // Bonificador de armas convencionales
    const weapons = items.filter(i => i.type === 'EQUIPMENT' && (i as EquipmentItem).slot === 'WEAPON') as EquipmentItem[];
    weapons.forEach(w => {
      damage += 5 * w.quantity; 
    });

    // Bonificador e impacto negativo de Artefactos Sellados (Activos)
    const activeArtifacts = items.filter(i => i.type === 'ARTIFACT' && !(i as SealedArtifactItem).isCurrentlySealed) as SealedArtifactItem[];
    activeArtifacts.forEach(art => {
      damage += (4 - art.grade) * 8; // Grados menores (0, 1) dan más daño
      if (art.negativeEffects.length > 0) {
        sanityCost += 5; // Drenaje de cordura por usar el artefacto en combate
      }
    });

    if (sanityCost > 0) {
      this.player.modifySanity(-sanityCost);
      desc += ` (Los artefactos activos drenan -${sanityCost} de Sanidad).`;
    }

    this.enemyCurrentHp = Math.max(0, this.enemyCurrentHp - damage);

    return {
      actor: this.player.getName(),
      actionName: actionType,
      damageDealt: damage,
      sanityChange: -sanityCost,
      message: `${desc} Causa ${damage} de daño. (HP enemigo: ${this.enemyCurrentHp})`,
      isTargetDefeated: this.enemyCurrentHp <= 0
    };
  }

  public enemyTurn(): CombatActionResult {
    const enemyAtk = this.enemy.attack || 12;
    const sanityAttack = this.enemy.hazardLevel ? this.enemy.hazardLevel * 2 : 2;

    this.player.modifySanity(-sanityAttack);

    return {
      actor: this.enemy.name,
      actionName: 'Ataque Anómalo',
      damageDealt: enemyAtk,
      sanityChange: -sanityAttack,
      message: `${this.enemy.name} arremete. Inflige ${enemyAtk} daño físico y reduce la sanidad en -${sanityAttack}.`,
      isTargetDefeated: !this.player.isAlive()
    };
  }

  public getEnemyHp(): number { return this.enemyCurrentHp; }
  public getTurnCount(): number { return this.turnCount; }
}