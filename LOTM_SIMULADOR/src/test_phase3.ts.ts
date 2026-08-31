import { DatabaseManager } from './database/DatabaseManager';
import { Player } from './character/Player';
import { InventorySystem, ConsumableItem, SealedArtifactItem, EquipmentItem } from './inventory/InventorySystem';
import { CombatEngine } from './combat/CombatEngine';

async function runPhase4Test() {
  console.log('==================================================');
  console.log('   INICIANDO PRUEBA FASE 4: INVENTARIO CANÓNICO Y COMBATE');
  console.log('==================================================\n');

  const db = DatabaseManager.getInstance();
  const monsters = db.getAllMonsters();
  
  const player = new Player('Klein Moretti', 'SEER', 9);
  
  // 1. Instanciar el sistema robusto con 200 de peso máximo
  const inventory = new InventorySystem(200);

  console.log('[1/3] Configurando Inventario del Jugador...');

  // Agregar Consumible
  const potion: ConsumableItem = {
    id: 'consumable_01', name: 'Extracto de Boticario', type: 'CONSUMABLE',
    weight: 2, quantity: 3, description: 'Restaura sanidad levemente.',
    healthRestore: 20, spiritualityRestore: 10, sanityRestore: 15
  };
  inventory.addItem(potion);

  // Agregar Artefacto Sellado
  const artifact: SealedArtifactItem = {
    id: 'art_01', name: 'Flauta de Hueso Mutada', type: 'ARTIFACT',
    weight: 5, quantity: 1, description: 'Controla espíritus de bajo nivel.',
    grade: 3, negativeEffects: ['Drena sanidad al usarse'], abilitiesGranted: ['Control Espiritual'], isCurrentlySealed: false
  };
  inventory.addItem(artifact);

  // Agregar Arma
  const revolver: EquipmentItem = {
    id: 'wpn_01', name: 'Revólver de Cazador', type: 'EQUIPMENT',
    weight: 15, quantity: 1, description: 'Arma de fuego estándar.',
    slot: 'WEAPON', durability: { current: 100, max: 100 }, statModifiers: [{ statName: 'attack', modifier: 15 }]
  };
  inventory.addItem(revolver);

  console.log(` -> Peso actual del inventario: ${inventory.getCurrentWeight()}/200`);
  console.log(` -> Ítems totales: ${inventory.getAllItems().length}`);

  console.log('\n[2/3] Entrando en Combate...');
  const targetMonster = monsters.length > 0 ? monsters[0] : { id: 'm1', name: 'Lobo Demoníaco', hp: 60, attack: 15 };
  
  const combat = new CombatEngine(player, targetMonster, inventory);

  // Consideramos al jugador vivo si su sanidad es mayor a 0 (o su salud, si está definida)
  const isPlayerAlive = () => (player as any).health !== undefined ? (player as any).health > 0 : player.sanity > 0;

  let round = 1;
  while (combat.getEnemyHp() > 0 && isPlayerAlive() && round <= 3) {
    console.log(`\n--- TURNO ${round} ---`);
    
    const pRes = combat.playerTurn('SKILL', 'Bala de Aire');
    console.log(`[JUGADOR] ${pRes.message}`);

    if (pRes.isTargetDefeated) {
      console.log(`\n¡${targetMonster.name} ha sido derrotado!`);
      break;
    }

    const eRes = combat.enemyTurn();
    console.log(`[ENEMIGO] ${eRes.message}`);
    console.log(`[ESTADO] Sanidad de ${player.name}: ${player.sanity}`);

    // Demostrar el uso del consumible desde tu sistema si la sanidad baja
    if (player.sanity < 80) {
      console.log(`\n[!] Sanidad crítica. Usando consumible...`);
      const useResult = inventory.useItem('consumable_01', player);
      console.log(` -> ${useResult.effectApplied}`);
      console.log(` -> Sanidad restaurada a: ${player.sanity}`);
    }

    round++;
  }

  console.log('\n==================================================');
  console.log('   PRUEBA COMPLETADA EXITOSAMENTE');
  console.log('==================================================');
}

runPhase4Test();