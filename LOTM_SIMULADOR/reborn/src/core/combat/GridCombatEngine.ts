import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CanonicalPathwayId } from '../types/pathway.js';
import { SeededRNG } from '../rng/SeededRNG.js';
import { AtomRuntime, RuntimeCombatant, RuntimeStatus, RuntimeDamageSource } from './AtomRuntime.js';
import { StatusType } from '../../infra/content/schemas/statusMatrix.schema.js';
import { DomainRuleViolationError } from '../errors/DomainError.js';
import { ActingDilemmaEngine } from '../acting/ActingDilemmaEngine.js';
import { CombatContent } from './CombatContent.js';

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
  observationChance: number;   // Probabilidad data-driven de observación (0..100)
  hasInstability?: boolean;    // Flag de inestabilidad espiritual por estancamiento de acting
  lastDamageSource?: RuntimeDamageSource;
  harvestQuality?: HarvestQuality;
}

export interface GridBattleSides {
  player: string[]; // IDs de actores del bando del jugador
  enemy: string[];  // IDs de actores del bando enemigo
}

export interface GridBattleState {
  battleId: string;
  grid: { width: 7; height: 5 };
  preparation_score: number;
  alertness_score: number;
  initiativeWinner: 'PLAYER' | 'ENEMY';
  actors: GridActor[];
  sides: GridBattleSides;
  turnCount: number;
  status: 'ONGOING' | 'VICTORY' | 'DEFEAT' | 'FLED' | 'NEGOTIATED' | 'RAMPAGE_TERMINAL';
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
  status?: 'ONGOING' | 'VICTORY' | 'DEFEAT' | 'FLED' | 'NEGOTIATED' | 'RAMPAGE_TERMINAL';
  harvestQuality?: HarvestQuality;
  state: GridBattleState;
}

export class GridCombatEngine {
  private static instance: GridCombatEngine | null = null;
  private atomRuntime: AtomRuntime;
  private playerAbilitiesCache: Map<string, CombatAbility> = new Map();
  private monsterAbilitiesCache: Map<string, CombatAbility[]> = new Map();

  private combatantsCatalog: Map<string, any> = new Map();

  private constructor() {
    this.atomRuntime = AtomRuntime.getInstance();
    this.loadAbilities();
  }

  /**
   * RNG reproducible derivado del propio combate: la misma partida en el mismo punto tira lo mismo, y el
   * cliente no puede elegir la semilla (nunca Date.now: regla de determinismo).
   */
  public static rngFor(battle: GridBattleState, side: 'player' | 'enemy'): SeededRNG {
    return new SeededRNG(`${battle.battleId}:${battle.turnCount}:${battle.turnLog.length}:${side}`);
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
        this.combatantsCatalog.set(c.id, c);
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

  public getPlayer(battle: GridBattleState): GridActor {
    const actor = battle.actors.find(a => battle.sides.player.includes(a.id));
    if (!actor) {
      throw new DomainRuleViolationError(`No se encontró actor del bando del jugador en el encuentro '${battle.battleId}'.`);
    }
    return actor;
  }

  public getPrimaryEnemy(battle: GridBattleState): GridActor {
    const actor = battle.actors.find(a => battle.sides.enemy.includes(a.id));
    if (!actor) {
      throw new DomainRuleViolationError(`No se encontró actor enemigo en el encuentro '${battle.battleId}'.`);
    }
    return actor;
  }

  public getActor(battle: GridBattleState, actorId: string): GridActor | undefined {
    return battle.actors.find(a => a.id === actorId);
  }

  public getSides(battle: GridBattleState): GridBattleSides {
    return battle.sides;
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
      hasInstability?: boolean;
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

    // Eliminación de fallback genérico (§3.8 Regla del Hueco)
    if (enemyAbilities.length === 0) {
      throw new DomainRuleViolationError(
        `Monstruo '${enemyInit.id}' carece de habilidades canónicas compiladas en Tier G (§3.8 Regla del Hueco).`
      );
    }

    const B = CombatContent.balance();
    // Cálculo explícito de iniciativa neutral (Directiva d: preparation_score serializado)
    let preparation_score = B.initiative.basePreparation;
    if (playerInit.isConcealed) preparation_score += 35;
    if (playerInit.noRecentPowerUse) preparation_score += 20;
    if (playerInit.ambushDeclared) preparation_score += 40;

    const speedVal = enemyInit.speed || B.initiative.defaultEnemySpeed;
    const alertness_score = speedVal * B.initiative.enemyAlertnessPerSpeed;

    let initiativeWinner: 'PLAYER' | 'ENEMY';
    let playerAp = B.actionPoints.player;
    if (ambushMode === 'PLAYER_AMBUSH') {
      initiativeWinner = 'PLAYER';
      playerAp = B.actionPoints.player + 1; // Ventaja táctica de emboscada (+1 PA)
    } else if (ambushMode === 'ENEMY_AMBUSH') {
      initiativeWinner = 'ENEMY';
    } else {
      initiativeWinner = preparation_score >= alertness_score ? 'PLAYER' : 'ENEMY';
    }

    // Observación enemiga data-driven
    let enemyObsChance = B.scrutiny.defaultEnemyObservationChance;
    const monsterDef = this.combatantsCatalog.get(enemyInit.id);
    if (monsterDef?.observationChance !== undefined) {
      enemyObsChance = monsterDef.observationChance;
    } else if ((enemyInit as any).observationChance !== undefined) {
      enemyObsChance = (enemyInit as any).observationChance;
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
      maxAp: B.actionPoints.player,
      attention: 1,
      maxAttention: B.actionPoints.maxAttention,
      position: { x: 0, y: Math.floor(B.grid.height / 2) }, // lado izquierdo, fila central
      statuses: playerInit.isConcealed ? [{ status: 'CONCEALED', durationTurns: 2 }] : [],
      revealedAbilities: [], // Inicia opaco hacia el enemigo
      // el golpe básico siempre está: sin espiritualidad nadie se queda sin acción ofensiva
      allAbilities: [...playerAbilities, { ...B.playerBasicAttack, attentionCost: 0, targetType: 'SINGLE_ENEMY' as const }],
      observationChance: B.scrutiny.playerObservationChance,
      hasInstability: !!playerInit.hasInstability
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
      ap: B.actionPoints.enemy,
      maxAp: B.actionPoints.enemy,
      attention: 1,
      maxAttention: B.actionPoints.maxAttention,
      position: { x: B.grid.width - 1, y: Math.floor(B.grid.height / 2) }, // lado derecho, fila central
      statuses: [],
      revealedAbilities: [], // Inicia opaco hacia el jugador
      allAbilities: enemyAbilities,
      observationChance: enemyObsChance
    };

    const battleState: GridBattleState = {
      battleId,
      grid: { width: 7, height: 5 },
      preparation_score,
      alertness_score,
      initiativeWinner,
      actors: [playerActor, enemyActor],
      sides: {
        player: [playerActor.id],
        enemy: [enemyActor.id]
      },
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
      targetActorId?: string;
    },
    rng: SeededRNG = GridCombatEngine.rngFor(battle, 'player')
  ): GridActionResult {
    const player = this.getPlayer(battle);
    const enemy = action.targetActorId
      ? (this.getActor(battle, action.targetActorId) || this.getPrimaryEnemy(battle))
      : this.getPrimaryEnemy(battle);

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

        const G = CombatContent.balance().grid;
        const targetPos = action.targetPosition || { x: Math.min(G.width - 1, player.position.x + 1), y: player.position.y };
        const dist = this.getDistance(player.position, targetPos);
        if (targetPos.x < 0 || targetPos.y < 0 || targetPos.x >= G.width || targetPos.y >= G.height) {
          result.success = false;
          result.message = 'Movimiento inválido: esa casilla queda fuera del callejón.';
          return result;
        }
        if (dist !== 1) {
          result.success = false;
          result.message = 'Movimiento inválido: solo puedes desplazarte a casillas adyacentes (distancia 1).';
          return result;
        }
        if (this.isOccupied(battle, targetPos, player.id)) {
          result.success = false;
          result.message = 'Movimiento inválido: la casilla está ocupada.';
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

        if (isWeakened || isStunned || isPacified || enemy.hp <= Math.floor(enemy.maxHp * CombatContent.balance().negotiation.hpFractionThreshold)) {
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
        if (dist >= CombatContent.balance().flee.minDistance || enemy.statuses.some(s => s.status === 'STUN' || s.status === 'FEAR')) {
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

        const ecoAtom = skill.atoms.find(a => a.params?.apCost !== undefined);
        const requiredAp = (skill.apCost || 0) + (ecoAtom?.params?.apCost || 0);

        if (player.ap < requiredAp) {
          result.success = false;
          result.message = `Puntos de Acción insuficientes (${player.ap}/${requiredAp} PA requeridos).`;
          return result;
        }

        if (player.spirituality < skill.spiritualityCost) {
          result.success = false;
          result.message = `Espiritualidad insuficiente (${player.spirituality}/${skill.spiritualityCost} requerida).`;
          return result;
        }

        if (skill.targetType === 'GRID_CELL') {
          const dest = action.targetPosition;
          const G = CombatContent.balance().grid;
          if (!dest || dest.x < 0 || dest.y < 0 || dest.x >= G.width || dest.y >= G.height
            || this.getDistance(player.position, dest) > skill.range || this.isOccupied(battle, dest, player.id)) {
            result.success = false;
            result.message = `Destino inválido para [${skill.name}].`;
            return result;
          }
        }

        const distance = this.getDistance(player.position, enemy.position);
        if (skill.targetType === 'SINGLE_ENEMY' && distance > skill.range) {
          result.success = false;
          result.message = `Objetivo fuera de alcance (Distancia: ${distance}, Rango máximo: ${skill.range}).`;
          return result;
        }

        player.ap -= skill.apCost;
        player.spirituality -= skill.spiritualityCost;
        result.apSpent = requiredAp;
        result.spiritualitySpent = skill.spiritualityCost;

        // Simetría: el enemigo puede observar y revelar la habilidad usada según su observationChance data-driven
        if (!enemy.revealedAbilities.includes(skill.id) && rng.checkChance(enemy.observationChance)) {
          enemy.revealedAbilities.push(skill.id);
        }

        // Check for spiritual instability misfire (Gate 2f)
        const misfireChance = ActingDilemmaEngine.getActingBalance().misfire_chance;
        if (player.hasInstability && rng.checkChance(misfireChance)) {
          result.message = `¡Fallo por Inestabilidad Espiritual! La disonancia de tu interpretación hace que [${skill.name}] se disipe en el aire.`;
          battle.turnLog.push(result.message);
          return result;
        }

        // Ejecutar los átomos de la habilidad
        let totalDamage = 0;
        let totalHealing = 0;
        const pRuntimeActor = this.toRuntimeActor(player);
        const eRuntimeActor = this.toRuntimeActor(enemy);

        const targetActor = skill.targetType === 'SELF' ? pRuntimeActor : eRuntimeActor;
        for (const atomInv of skill.atoms) {
          // desplazamientos a casilla: el destino lo elige el jugador (validado arriba), nunca el átomo
          const params = skill.targetType === 'GRID_CELL' && action.targetPosition
            ? { ...atomInv.params, targetPosition: action.targetPosition }
            : atomInv.params;
          const atomRes = this.atomRuntime.executeAtom(pRuntimeActor, targetActor, atomInv.atomId, params);
          totalDamage += atomRes.damageDealt;
          totalHealing += atomRes.healingDone;
        }

        this.syncFromRuntime(player, pRuntimeActor);
        this.syncFromRuntime(enemy, eRuntimeActor);

        // Bonificación si el jugador había escudriñado las habilidades del enemigo
        const isScrutinized = player.revealedAbilities.length > 0;
        if (isScrutinized && totalDamage > 0) {
          const bonus = Math.floor(totalDamage * CombatContent.balance().scrutiny.damageBonus);
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
          result.message += ` [${enemy.name}] cae y ya no se levanta.`;
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
    rng: SeededRNG = GridCombatEngine.rngFor(battle, 'enemy')
  ): {
    message: string;
    damageDealt: number;
    isBattleOver: boolean;
    victory?: boolean;
    status?: string;
  } {
    const player = this.getPlayer(battle);
    const enemy = this.getPrimaryEnemy(battle);

    if (battle.status !== 'ONGOING') {
      return { message: 'El combate ya no está activo.', damageDealt: 0, isBattleOver: true };
    }

    const B = CombatContent.balance();

    // Fin del turno del jugador: sus estados avanzan (veneno incluido)
    const playerTick = this.tickStatuses(player);
    if (player.hp <= 0) return this.defeat(battle, enemy, playerTick);

    // Reset de AP para el turno
    enemy.ap = enemy.maxAp;

    // Si el enemigo está aturdido
    const stunIdx = enemy.statuses.findIndex(s => s.status === 'STUN');
    if (stunIdx >= 0) {
      enemy.statuses.splice(stunIdx, 1);
      const msg = `${enemy.name} está aturdido y no puede actuar en este turno.`;
      battle.turnLog.push(msg);
      battle.turnCount += 1;
      player.ap = player.maxAp;
      return { message: [playerTick, msg].filter(Boolean).join(' '), damageDealt: 0, isBattleOver: false, status: 'ONGOING' };
    }

    // IA táctica: técnicas ofensivas o sobre sí mismo (las de desplazamiento a casilla no las usa la IA)
    const usable = () => enemy.allAbilities.filter(a =>
      (a.targetType === 'SINGLE_ENEMY' || a.targetType === 'SELF') &&
      enemy.spirituality >= a.spiritualityCost && enemy.ap >= a.apCost);
    const inRange = (a: CombatAbility) => a.targetType === 'SELF' || this.getDistance(enemy.position, player.position) <= a.range;

    // Avanza casilla a casilla mientras ninguna técnica ofensiva alcance y le queden PA para avanzar y actuar
    const offensive = () => usable().filter(a => a.targetType === 'SINGLE_ENEMY');
    let steps = 0;
    while (enemy.ap > 1 && offensive().length > 0 && !offensive().some(inRange)) {
      const next = this.stepToward(battle, enemy, player.position);
      if (!next) break;
      enemy.position = next;
      enemy.ap -= 1;
      steps++;
    }
    if (steps > 0) battle.turnLog.push(`${enemy.name} acortó distancia hasta (${enemy.position.x}, ${enemy.position.y}).`);

    const candidates = usable().filter(inRange);
    const chosenSkill = candidates.length > 0 ? candidates[rng.nextInt(0, candidates.length - 1)] : null;

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

      // Simetría: si el jugador conoce la técnica (Escudriñar) y le queda Atención, la anticipa
      if (player.revealedAbilities.includes(chosenSkill.id) && player.attention > 0 && totalDamage > 0) {
        const mitigation = Math.floor(totalDamage * B.scrutiny.mitigation);
        totalDamage = Math.max(0, totalDamage - mitigation);
        player.attention -= 1;
        player.hp = Math.min(player.maxHp, player.hp + mitigation);
        turnMsg = `${enemy.name} ejecutó [${chosenSkill.name}], pero lo viste venir y esquivaste parte del golpe. Te alcanzó por ${totalDamage}.`;
      } else if (chosenSkill.targetType === 'SELF') {
        turnMsg = `${enemy.name} recurrió a [${chosenSkill.name}].`;
      } else {
        turnMsg = totalDamage > 0
          ? `${enemy.name} atacó con [${chosenSkill.name}] infligiendo ${totalDamage} a ${player.name}.`
          : `${enemy.name} lanzó [${chosenSkill.name}] contra ${player.name}.`;
      }
    } else if (this.getDistance(enemy.position, player.position) <= 1) {
      // Sin técnica disponible y cuerpo a cuerpo: golpe básico
      totalDamage = B.enemyBasicAttack.damage;
      player.hp = Math.max(0, player.hp - totalDamage);
      player.lastDamageSource = { type: 'PHYSICAL', amount: totalDamage };
      turnMsg = `${enemy.name} lanzó un ${B.enemyBasicAttack.name} infligiendo ${totalDamage} a ${player.name}.`;
    } else {
      turnMsg = steps > 0 ? `${enemy.name} se acerca entre la niebla.` : `${enemy.name} acecha sin atacar.`;
    }

    // Fin del turno del adversario: sus estados avanzan
    const enemyTick = this.tickStatuses(enemy);
    if (enemyTick) turnMsg += ` ${enemyTick}`;
    if (playerTick) turnMsg = `${playerTick} ${turnMsg}`;

    battle.turnLog.push(turnMsg);
    battle.turnCount += 1;
    player.ap = player.maxAp; // Restaurar AP del jugador para el próximo turno

    // Comprobar si el jugador cayó derrotado
    if (player.hp <= 0) return { ...this.defeat(battle, enemy, turnMsg), damageDealt: totalDamage };

    // el veneno puede acabar con el adversario en su propio turno
    if (enemy.hp <= 0) {
      battle.status = 'VICTORY';
      enemy.harvestQuality = this.determineHarvestQuality(enemy);
      battle.turnLog.push(`[${enemy.name}] se desploma, consumido por sus heridas.`);
      return { message: `${turnMsg} ${enemy.name} se desploma, consumido por sus heridas.`, damageDealt: totalDamage, isBattleOver: true, victory: true, status: 'VICTORY' };
    }

    return {
      message: turnMsg,
      damageDealt: totalDamage,
      isBattleOver: false,
      status: 'ONGOING'
    };
  }

  private isOccupied(battle: GridBattleState, pos: GridCoord, exceptId: string): boolean {
    return battle.actors.some(a => a.id !== exceptId && a.hp > 0 && a.position.x === pos.x && a.position.y === pos.y);
  }

  /** una casilla hacia el objetivo (la que más reduce la distancia), libre y dentro de la rejilla */
  private stepToward(battle: GridBattleState, actor: GridActor, target: GridCoord): GridCoord | null {
    const G = CombatContent.balance().grid;
    const here = this.getDistance(actor.position, target);
    const options: GridCoord[] = [[1, 0], [-1, 0], [0, 1], [0, -1]]
      .map(([dx, dy]) => ({ x: actor.position.x + dx, y: actor.position.y + dy }))
      .filter(p => p.x >= 0 && p.y >= 0 && p.x < G.width && p.y < G.height && !this.isOccupied(battle, p, actor.id))
      .filter(p => this.getDistance(p, target) < here && this.getDistance(p, target) >= 1);
    return options[0] ?? null;
  }

  /** Fin de turno de un actor: el veneno hiere y las duraciones se descuentan. Devuelve la narración (o ''). */
  private tickStatuses(actor: GridActor): string {
    const B = CombatContent.balance();
    let msg = '';
    if (actor.statuses.some(s => s.status === 'POISON') && B.poisonDamagePerTurn > 0 && actor.hp > 0) {
      const dmg = Math.min(actor.hp, B.poisonDamagePerTurn);
      actor.hp -= dmg;
      actor.lastDamageSource = { type: 'POISON', amount: dmg };
      msg = `El veneno quema a ${actor.name} (${dmg}).`;
    }
    actor.statuses = actor.statuses
      .map(s => ({ ...s, durationTurns: s.durationTurns - 1 }))
      .filter(s => s.durationTurns > 0);
    return msg;
  }

  private defeat(battle: GridBattleState, enemy: GridActor, lead: string) {
    battle.status = 'DEFEAT';
    const defeatMsg = `Has caído en combate contra [${enemy.name}].`;
    battle.turnLog.push(defeatMsg);
    return { message: [lead, defeatMsg].filter(Boolean).join(' '), damageDealt: 0, isBattleOver: true, victory: false, status: 'DEFEAT' };
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

  /**
   * Muta el combate a terminal anómalo cuando estalla un Rampage somático (Brief-06).
   */
  public static triggerAnomalousTerminal(battle: GridBattleState, reason: string = 'RAMPAGE'): void {
    battle.status = 'RAMPAGE_TERMINAL';
    const msg = `¡COLAPSO SOMÁTICO! La pérdida de control es absoluta. El combate muta a terminal anómalo (${reason}).`;
    battle.turnLog.push(msg);
  }
}
