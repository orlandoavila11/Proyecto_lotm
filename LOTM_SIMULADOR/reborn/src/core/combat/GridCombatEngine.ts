import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CanonicalPathwayId } from '../types/pathway.js';
import { SeededRNG } from '../rng/SeededRNG.js';
import { AtomRuntime, RuntimeCombatant, RuntimeStatus, RuntimeDamageSource } from './AtomRuntime.js';
import { StatusType } from '../../infra/content/schemas/statusMatrix.schema.js';

export type HarvestQuality = 'PRISTINE' | 'DAMAGED' | 'CONTAMINADO';

export interface GridCoord {
  x: number; // 0..6
  y: number; // 0..4
}

export interface CombatAbility {
  id: string;
  name: string;
  description: string;
  apCost: number;
  spiritualityCost: number;
  attentionCost: number;
  range: number;
  targetType: 'SELF' | 'SINGLE_ENEMY' | 'SINGLE_ALLY' | 'AREA' | 'GRID_CELL';
  atoms: Array<{ atomId: string; params?: Record<string, any> }>;
  canonConfidence?: string;
  derivationNote?: string;
}

export interface GridActor {
  id: string;
  name: string;
  isPlayer: boolean;
  pathway?: CanonicalPathwayId;
  sequence: number;
  hp: number;
  maxHp: number;
  spirituality: number;
  maxSpirituality: number;
  ap: number;
  maxAp: number;
  attention: number;
  maxAttention: number;
  position: GridCoord;
  statuses: RuntimeStatus[];
  revealedAbilities: string[]; // Habilidades del oponente conocidas por este actor
  allAbilities: CombatAbility[];
  lastDamageSource?: RuntimeDamageSource;
  harvestQuality?: HarvestQuality;
}

export interface GridBattleState {
  battleId: string;
  grid: { width: 7; height: 5 };
  preparation_score: number;
  alertness_score: number;
  initiativeWinner: 'PLAYER' | 'ENEMY';
  player: GridActor;
  enemy: GridActor;
  turnCount: number;
  status: 'ONGOING' | 'VICTORY' | 'DEFEAT' | 'FLED' | 'NEGOTIATED';
  turnLog: string[];
}

export interface GridActionResult {
  success: boolean;
  actionName: string;
  message: string;
  damageDealt: number;
  healingDone: number;
  spiritualitySpent: number;
  apSpent: number;
  isBattleOver: boolean;
  victory?: boolean;
  status?: 'ONGOING' | 'VICTORY' | 'DEFEAT' | 'FLED' | 'NEGOTIATED';
  harvestQuality?: HarvestQuality;
  state: GridBattleState;
}

export class GridCombatEngine {
  private static instance: GridCombatEngine | null = null;
  private atomRuntime: AtomRuntime;
  private playerAbilitiesCache: Map<string, CombatAbility> = new Map();
  private monsterAbilitiesCache: Map<string, CombatAbility[]> = new Map();

  private constructor() {
    this.atomRuntime = AtomRuntime.getInstance();
    this.loadAbilities();
  }

  public static getInstance(): GridCombatEngine {
    if (!GridCombatEngine.instance) {
      GridCombatEngine.instance = new GridCombatEngine();
    }
    return GridCombatEngine.instance;
  }

  private loadAbilities(): void {
    const packageRoot = fileURLToPath(new URL('../../..', import.meta.url));
    const playerPath = path.join(packageRoot, 'data', 'gameplay', 'abilities', 'player_abilities.json');
    const combatantsPath = path.join(packageRoot, 'data', 'gameplay', 'combatants', 'combatants.json');

    if (fs.existsSync(playerPath)) {
      const pData = JSON.parse(fs.readFileSync(playerPath, 'utf-8'));
      for (const a of pData.abilities) {
        this.playerAbilitiesCache.set(a.id, a);
      }
    }

    if (fs.existsSync(combatantsPath)) {
      const cData = JSON.parse(fs.readFileSync(combatantsPath, 'utf-8'));
      for (const c of cData) {
        if (Array.isArray(c.abilities)) {
          this.monsterAbilitiesCache.set(c.id, c.abilities);
        }
      }
    }
  }

  public getPlayerAbilities(pathway: CanonicalPathwayId, sequence: number): CombatAbility[] {
    const res: CombatAbility[] = [];
    for (const a of this.playerAbilitiesCache.values()) {
      if ((a as any).pathway === pathway && (a as any).sequence >= sequence) {
        res.push(a);
      }
    }
    return res;
  }

  public getMonsterAbilities(monsterId: string): CombatAbility[] {
    return this.monsterAbilitiesCache.get(monsterId) || [];
  }

  /**
   * Inicializa un encuentro táctico en rejilla 5x7 con cálculo neutral de iniciativa.
   */
  public createBattle(
    battleId: string,
    playerInit: {
      id: string;
      name: string;
      pathway: CanonicalPathwayId;
      sequence: number;
      hp: number;
      maxHp: number;
      spirituality: number;
      maxSpirituality: number;
      isConcealed?: boolean;
      noRecentPowerUse?: boolean;
      ambushDeclared?: boolean;
    },
    enemyInit: {
      id: string;
      name: string;
      sequence?: number;
      hp: number;
      maxHp: number;
      spirituality?: number;
      maxSpirituality?: number;
      speed?: number;
      abilities?: CombatAbility[];
    },
    ambushMode: 'PLAYER_AMBUSH' | 'ENEMY_AMBUSH' | 'NEUTRAL' = 'NEUTRAL'
  ): GridBattleState {
    const playerAbilities = this.getPlayerAbilities(playerInit.pathway, playerInit.sequence);
    let enemyAbilities = enemyInit.abilities || this.getMonsterAbilities(enemyInit.id);

    if (enemyAbilities.length === 0) {
      // Fallback a habilidades estándar de monstruo
      enemyAbilities = [
        {
          id: 'ABILITY_GENERIC_STRIKE',
          name: 'Zarpazo de Sombra',
          description: 'Ataque físico directo de garra.',
          apCost: 1,
          spiritualityCost: 0,
          attentionCost: 0,
          range: 2,
          targetType: 'SINGLE_ENEMY',
          atoms: [{ atomId: 'ATOM_DAMAGE_PHYSICAL', params: { baseDamage: 14 } }]
        },
        {
          id: 'ABILITY_GENERIC_CORRUPT',
          name: 'Emisión Corrosiva',
          description: 'Ráfaga que debilita el cuerpo astral.',
          apCost: 2,
          spiritualityCost: 10,
          attentionCost: 0,
          range: 4,
          targetType: 'SINGLE_ENEMY',
          atoms: [{ atomId: 'ATOM_DAMAGE_SPIRITUAL', params: { baseDamage: 16 } }, { atomId: 'ATOM_APPLY_STATUS', params: { status: 'WEAKENED', durationTurns: 2 } }]
        }
      ];
    }

    // Cálculo explícito de iniciativa neutral (Directiva d: preparation_score serializado)
    let preparation_score = 15;
    if (playerInit.isConcealed) preparation_score += 35;
    if (playerInit.noRecentPowerUse) preparation_score += 20;
    if (playerInit.ambushDeclared) preparation_score += 40;

    const speedVal = enemyInit.speed || 10;
    const alertness_score = speedVal * 5;

    let initiativeWinner: 'PLAYER' | 'ENEMY';
    let playerAp = 3;
    if (ambushMode === 'PLAYER_AMBUSH') {
      initiativeWinner = 'PLAYER';
      playerAp = 4; // Ventaja táctica de emboscada (+1 PA)
    } else if (ambushMode === 'ENEMY_AMBUSH') {
      initiativeWinner = 'ENEMY';
    } else {
      initiativeWinner = preparation_score >= alertness_score ? 'PLAYER' : 'ENEMY';
    }

    const playerActor: GridActor = {
      id: playerInit.id,
      name: playerInit.name,
      isPlayer: true,
      pathway: playerInit.pathway,
      sequence: playerInit.sequence,
      hp: playerInit.hp,
      maxHp: playerInit.maxHp,
      spirituality: playerInit.spirituality,
      maxSpirituality: playerInit.maxSpirituality,
      ap: playerAp,
      maxAp: 3,
      attention: 1,
      maxAttention: 2,
      position: { x: 0, y: 2 }, // Lado izquierdo (x: 0, centro y: 2)
      statuses: playerInit.isConcealed ? [{ status: 'CONCEALED', durationTurns: 2 }] : [],
      revealedAbilities: [], // Inicia opaco hacia el enemigo
      allAbilities: playerAbilities
    };

    const enemyActor: GridActor = {
      id: enemyInit.id,
      name: enemyInit.name,
      isPlayer: false,
      sequence: enemyInit.sequence || 9,
      hp: enemyInit.hp,
      maxHp: enemyInit.maxHp,
      spirituality: enemyInit.spirituality || 50,
      maxSpirituality: enemyInit.maxSpirituality || 50,
      ap: 3,
      maxAp: 3,
      attention: 1,
      maxAttention: 2,
      position: { x: 6, y: 2 }, // Lado derecho (x: 6, centro y: 2)
      statuses: [],
      revealedAbilities: [], // Inicia opaco hacia el jugador
      allAbilities: enemyAbilities
    };

    const battleState: GridBattleState = {
      battleId,
      grid: { width: 7, height: 5 },
      preparation_score,
      alertness_score,
      initiativeWinner,
      player: playerActor,
      enemy: enemyActor,
      turnCount: 1,
      status: 'ONGOING',
      turnLog: [
        `Inicia confrontación mística en rejilla 5x7 contra [${enemyInit.name}].`,
        `Iniciativa: [${initiativeWinner}] toma el primer movimiento (Prep: ${preparation_score} vs Alerta: ${alertness_score}).`
      ]
    };

    return battleState;
  }

  /**
   * Calcula la distancia Manhattan en la rejilla entre dos actores.
   */
  public getDistance(a: GridCoord, b: GridCoord): number {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  }

  /**
   * Determina la calidad del ingrediente recolectado según la última causa de muerte (Directiva c).
   */
  public determineHarvestQuality(enemy: GridActor): HarvestQuality {
    if (enemy.statuses.some(s => s.status === 'FRENZY')) {
      return 'CONTAMINADO';
    }

    if (enemy.lastDamageSource) {
      if (enemy.lastDamageSource.type === 'CORRUPTION') {
        return 'CONTAMINADO';
      }
      if (enemy.lastDamageSource.type === 'ELEMENTAL' || enemy.lastDamageSource.type === 'POISON') {
        return 'DAMAGED';
      }
      if (enemy.lastDamageSource.type === 'PHYSICAL' || enemy.lastDamageSource.type === 'SPIRITUAL') {
        return 'PRISTINE';
      }
    }

    return 'PRISTINE';
  }

  /**
   * Ejecuta una acción del jugador.
   */
  public executePlayerAction(
    battle: GridBattleState,
    action: {
      type: 'SKILL' | 'MOVE' | 'SCRUTINIZE' | 'NEGOTIATE' | 'FLEE';
      skillId?: string;
      targetPosition?: GridCoord;
    },
    rng: SeededRNG = new SeededRNG(Date.now())
  ): GridActionResult {
    const { player, enemy } = battle;

    if (battle.status !== 'ONGOING') {
      return {
        success: false,
        actionName: action.type,
        message: 'El combate ya ha finalizado.',
        damageDealt: 0,
        healingDone: 0,
        spiritualitySpent: 0,
        apSpent: 0,
        isBattleOver: true,
        status: battle.status,
        state: battle
      };
    }

    let result: GridActionResult = {
      success: true,
      actionName: action.type,
      message: '',
      damageDealt: 0,
      healingDone: 0,
      spiritualitySpent: 0,
      apSpent: 0,
      isBattleOver: false,
      state: battle
    };

    switch (action.type) {
      case 'MOVE': {
        if (player.ap < 1) {
          result.success = false;
          result.message = 'Puntos de Acción insuficientes para moverse (Requiere 1 PA).';
          return result;
        }

        const targetPos = action.targetPosition || { x: Math.min(6, player.position.x + 1), y: player.position.y };
        const dist = this.getDistance(player.position, targetPos);
        if (dist > 1) {
          result.success = false;
          result.message = 'Movimiento inválido: solo puedes desplazarte a casillas adyacentes (distancia 1).';
          return result;
        }

        player.position = { ...targetPos };
        player.ap -= 1;
        result.apSpent = 1;
        result.message = `${player.name} se desplazó a la casilla (${player.position.x}, ${player.position.y}).`;
        battle.turnLog.push(result.message);
        break;
      }

      case 'SCRUTINIZE': {
        if (player.ap < 1) {
          result.success = false;
          result.message = 'Puntos de Acción insuficientes para Escudriñar (Requiere 1 PA).';
          return result;
        }

        player.ap -= 1;
        result.apSpent = 1;

        // Escudriñar revela habilidades ocultas del enemigo
        const hiddenAbilities = enemy.allAbilities
          .map(a => a.id)
          .filter(id => !player.revealedAbilities.includes(id));

        if (hiddenAbilities.length > 0) {
          const revealedId = hiddenAbilities[0];
          player.revealedAbilities.push(revealedId);
          const abilityDef = enemy.allAbilities.find(a => a.id === revealedId);
          result.message = `¡Escudriñamiento Exitoso! Has desvelado el aura de [${enemy.name}] identificando su técnica: [${abilityDef?.name || revealedId}].`;
        } else {
          result.message = `Has examinado minuciosamente a [${enemy.name}]: ya conoces todo su repertorio visible.`;
        }

        player.attention = Math.min(player.maxAttention, player.attention + 1);
        battle.turnLog.push(result.message);
        break;
      }

      case 'NEGOTIATE': {
        // Directiva e: Check con condición visible
        const isWeakened = enemy.statuses.some(s => s.status === 'WEAKENED');
        const isStunned = enemy.statuses.some(s => s.status === 'STUN');
        const isPacified = enemy.statuses.some(s => s.status === 'BLESSING');
        const isFrenzy = enemy.statuses.some(s => s.status === 'FRENZY');

        if (isFrenzy) {
          result.success = false;
          result.message = 'Negociación Imposible: El objetivo está sumido en frenesí homicida y no puede razonar.';
          battle.turnLog.push(result.message);
          return result;
        }

        if (isWeakened || isStunned || isPacified || enemy.hp <= Math.floor(enemy.maxHp * 0.35)) {
          battle.status = 'NEGOTIATED';
          result.isBattleOver = true;
          result.victory = true;
          result.status = 'NEGOTIATED';
          result.message = `¡Negociación Exitosa! Ante su vulnerabilidad psicológica y corporal, [${enemy.name}] baja la guardia y acepta un alto el fuego.`;
          battle.turnLog.push(result.message);
          return result;
        } else {
          result.success = false;
          result.message = 'Negociación Frustrada: El enemigo mantiene su determinación hostil intacta. Debes debilitarlo, aturdirlo o apaciguarlo primero.';
          battle.turnLog.push(result.message);
          return result;
        }
      }

      case 'FLEE': {
        const dist = this.getDistance(player.position, enemy.position);
        if (dist >= 3 || enemy.statuses.some(s => s.status === 'STUN' || s.status === 'FEAR')) {
          battle.status = 'FLED';
          result.isBattleOver = true;
          result.victory = false;
          result.status = 'FLED';
          result.message = 'Has roto el contacto táctico y escapado con éxito hacia la niebla de Backlund.';
          battle.turnLog.push(result.message);
          return result;
        } else {
          result.success = false;
          result.message = 'Intento de Huida Fallido: La proximidad del enemigo impide la retirada sin recibir un golpe fatal.';
          battle.turnLog.push(result.message);
          return result;
        }
      }

      case 'SKILL': {
        const skill = player.allAbilities.find(a => a.id === action.skillId);
        if (!skill) {
          result.success = false;
          result.message = `Habilidad desconocida: '${action.skillId}'`;
          return result;
        }

        if (player.ap < skill.apCost) {
          result.success = false;
          result.message = `Puntos de Acción insuficientes (${player.ap}/${skill.apCost} PA requeridos).`;
          return result;
        }

        if (player.spirituality < skill.spiritualityCost) {
          result.success = false;
          result.message = `Espiritualidad insuficiente (${player.spirituality}/${skill.spiritualityCost} requerida).`;
          return result;
        }

        const distance = this.getDistance(player.position, enemy.position);
        if (skill.targetType === 'SINGLE_ENEMY' && distance > skill.range) {
          result.success = false;
          result.message = `Objetivo fuera de alcance (Distancia: ${distance}, Rango máximo: ${skill.range}).`;
          return result;
        }

        player.ap -= skill.apCost;
        player.spirituality -= skill.spiritualityCost;
        result.apSpent = skill.apCost;
        result.spiritualitySpent = skill.spiritualityCost;

        // Simetría: el enemigo puede observar y revelar la habilidad usada
        if (!enemy.revealedAbilities.includes(skill.id) && rng.checkChance(50)) {
          enemy.revealedAbilities.push(skill.id);
        }

        // Ejecutar los átomos de la habilidad
        let totalDamage = 0;
        let totalHealing = 0;
        const pRuntimeActor = this.toRuntimeActor(player);
        const eRuntimeActor = this.toRuntimeActor(enemy);

        const targetActor = skill.targetType === 'SELF' ? pRuntimeActor : eRuntimeActor;
        for (const atomInv of skill.atoms) {
          const atomRes = this.atomRuntime.executeAtom(pRuntimeActor, targetActor, atomInv.atomId, atomInv.params);
          totalDamage += atomRes.damageDealt;
          totalHealing += atomRes.healingDone;
        }

        this.syncFromRuntime(player, pRuntimeActor);
        this.syncFromRuntime(enemy, eRuntimeActor);

        // Bonificación si el jugador había escudriñado las habilidades del enemigo
        const isScrutinized = player.revealedAbilities.length > 0;
        if (isScrutinized && totalDamage > 0) {
          const bonus = Math.floor(totalDamage * 0.20);
          totalDamage += bonus;
          enemy.hp = Math.max(0, enemy.hp - bonus);
        }

        result.damageDealt = totalDamage;
        result.healingDone = totalHealing;
        result.message = `${player.name} ejecutó [${skill.name}] infligiendo ${totalDamage} de daño a ${enemy.name}.`;
        battle.turnLog.push(result.message);

        // Comprobar derrota del enemigo
        if (enemy.hp <= 0) {
          battle.status = 'VICTORY';
          result.isBattleOver = true;
          result.victory = true;
          result.status = 'VICTORY';
          result.harvestQuality = this.determineHarvestQuality(enemy);
          enemy.harvestQuality = result.harvestQuality;
          result.message += ` ¡Victoria! [${enemy.name}] ha sido derrotado. Calidad de cosecha: [${result.harvestQuality}].`;
          battle.turnLog.push(`Encuentro concluido con victoria. Ingrediente recolectado: [${result.harvestQuality}].`);
          return result;
        }
        break;
      }
    }

    return result;
  }

  /**
   * Ejecuta el turno reactivo del enemigo empleando simetría táctica.
   */
  public executeEnemyTurn(
    battle: GridBattleState,
    rng: SeededRNG = new SeededRNG(Date.now() + 1)
  ): {
    message: string;
    damageDealt: number;
    isBattleOver: boolean;
    victory?: boolean;
    status?: string;
  } {
    const { player, enemy } = battle;

    if (battle.status !== 'ONGOING') {
      return { message: 'El combate ya no está activo.', damageDealt: 0, isBattleOver: true };
    }

    // Reset de AP para el turno
    enemy.ap = enemy.maxAp;

    // Si el enemigo está aturdido
    const stunIdx = enemy.statuses.findIndex(s => s.status === 'STUN');
    if (stunIdx >= 0) {
      enemy.statuses.splice(stunIdx, 1);
      const msg = `${enemy.name} está aturdido y no puede actuar en este turno.`;
      battle.turnLog.push(msg);
      return { message: msg, damageDealt: 0, isBattleOver: false };
    }

    // IA Táctica simple con Simetría
    // 1. Si no tiene al jugador a rango, avanzar hacia él
    const dist = this.getDistance(enemy.position, player.position);
    if (dist > 2 && enemy.ap > 0) {
      const dx = player.position.x < enemy.position.x ? -1 : 1;
      enemy.position.x = Math.max(0, Math.min(6, enemy.position.x + dx));
      enemy.ap -= 1;
      battle.turnLog.push(`${enemy.name} acortó distancia desplazándose a (${enemy.position.x}, ${enemy.position.y}).`);
    }

    // 2. Seleccionar una habilidad válida
    const usableSkills = enemy.allAbilities.filter(a => enemy.spirituality >= a.spiritualityCost && enemy.ap >= a.apCost);
    let chosenSkill = usableSkills.length > 0 ? usableSkills[rng.nextInt(0, usableSkills.length - 1)] : null;

    let totalDamage = 0;
    let turnMsg = '';

    if (chosenSkill) {
      enemy.ap -= chosenSkill.apCost;
      enemy.spirituality -= chosenSkill.spiritualityCost;

      const pRuntimeActor = this.toRuntimeActor(player);
      const eRuntimeActor = this.toRuntimeActor(enemy);

      const targetActor = chosenSkill.targetType === 'SELF' ? eRuntimeActor : pRuntimeActor;
      for (const atomInv of chosenSkill.atoms) {
        const atomRes = this.atomRuntime.executeAtom(eRuntimeActor, targetActor, atomInv.atomId, atomInv.params);
        totalDamage += atomRes.damageDealt;
      }

      this.syncFromRuntime(player, pRuntimeActor);
      this.syncFromRuntime(enemy, eRuntimeActor);

      // Simetría: Si el jugador conoció la habilidad por Escudriñar y tiene Atención disponible, mitiga
      if (player.revealedAbilities.includes(chosenSkill.id) && player.attention > 0) {
        const mitigation = Math.floor(totalDamage * 0.35);
        totalDamage = Math.max(0, totalDamage - mitigation);
        player.attention -= 1;
        player.hp = Math.min(player.maxHp, player.hp + mitigation);
        turnMsg = `${enemy.name} ejecutó [${chosenSkill.name}]. ¡Anticipado por Escudriñar! Mitigaste ${mitigation} de daño. Infligió ${totalDamage} a ${player.name}.`;
      } else {
        turnMsg = `${enemy.name} atacó con [${chosenSkill.name}] infligiendo ${totalDamage} a ${player.name}.`;
      }
    } else {
      // Ataque básico de garras
      totalDamage = 12;
      player.hp = Math.max(0, player.hp - totalDamage);
      player.lastDamageSource = { type: 'PHYSICAL', amount: totalDamage };
      turnMsg = `${enemy.name} asestó un zarpazo físico directo infligiendo ${totalDamage} a ${player.name}.`;
    }

    battle.turnLog.push(turnMsg);
    battle.turnCount += 1;
    player.ap = player.maxAp; // Restaurar AP del jugador para el próximo turno

    // Comprobar si el jugador cayó derrotado
    if (player.hp <= 0) {
      battle.status = 'DEFEAT';
      const defeatMsg = `Has caído en combate contra [${enemy.name}]. La niebla astral consume tu cordura.`;
      battle.turnLog.push(defeatMsg);
      return {
        message: defeatMsg,
        damageDealt: totalDamage,
        isBattleOver: true,
        victory: false,
        status: 'DEFEAT'
      };
    }

    return {
      message: turnMsg,
      damageDealt: totalDamage,
      isBattleOver: false,
      status: 'ONGOING'
    };
  }

  private toRuntimeActor(actor: GridActor): RuntimeCombatant {
    return {
      id: actor.id,
      name: actor.name,
      isPlayer: actor.isPlayer,
      hp: actor.hp,
      maxHp: actor.maxHp,
      spirituality: actor.spirituality,
      maxSpirituality: actor.maxSpirituality,
      ap: actor.ap,
      maxAp: actor.maxAp,
      attention: actor.attention,
      maxAttention: actor.maxAttention,
      position: { ...actor.position },
      statuses: [...actor.statuses],
      revealedAbilities: [...actor.revealedAbilities],
      allAbilityIds: actor.allAbilities.map(a => a.id),
      lastDamageSource: actor.lastDamageSource
    };
  }

  private syncFromRuntime(targetActor: GridActor, runtimeActor: RuntimeCombatant): void {
    targetActor.hp = runtimeActor.hp;
    targetActor.spirituality = runtimeActor.spirituality;
    targetActor.ap = runtimeActor.ap;
    targetActor.attention = runtimeActor.attention;
    targetActor.position = { ...runtimeActor.position };
    targetActor.statuses = [...runtimeActor.statuses];
    targetActor.revealedAbilities = [...runtimeActor.revealedAbilities];
    targetActor.lastDamageSource = runtimeActor.lastDamageSource;
  }
}
