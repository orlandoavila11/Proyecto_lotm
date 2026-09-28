import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { DatabaseClient } from '../../infra/database/DatabaseClient.js';
import { CanonicalDataLoader } from '../../infra/data/CanonicalDataLoader.js';
import { TacticalCombatEngine, CombatActor } from '../../core/combat/TacticalCombatEngine.js';
import { GridCombatEngine, HarvestQuality } from '../../core/combat/GridCombatEngine.js';
import { CanonicalPathwayId } from '../../core/types/pathway.js';
import { EntityNotFoundError, ValidationDomainError, DomainRuleViolationError } from '../../core/errors/DomainError.js';
import { CommandProcessor } from '../../infra/database/CommandProcessor.js';

const CombatStartSchema = z.object({
  characterId: z.string().min(1),
  enemyName: z.string().optional(),
  enemyHp: z.number().optional(),
  enemySpeed: z.number().optional(),
  isConcealed: z.boolean().optional(),
  noRecentPowerUse: z.boolean().optional(),
  ambushDeclared: z.boolean().optional(),
  ambushMode: z.enum(['PLAYER_AMBUSH', 'ENEMY_AMBUSH', 'NEUTRAL']).optional(),
  commandId: z.string().optional(),
  expectedRevision: z.number().int().optional(),
  forceNew: z.boolean().optional()
});

const CombatActionSchema = z.object({
  characterId: z.string().min(1),
  actionType: z.enum(['SKILL', 'MOVE', 'SCRUTINIZE', 'NEGOTIATE', 'FLEE']).optional().default('SKILL'),
  skillId: z.string().optional(),
  targetPosition: z.object({ x: z.number().int(), y: z.number().int() }).optional(),
  commandId: z.string().optional(),
  expectedRevision: z.number().int().optional()
});

export interface BattleActor extends CombatActor {
  position: { x: number; y: number };
  ap: number;
  maxAp: number;
  attention: number;
  maxAttention: number;
  abilities?: string[];
  revealedAbilities: string[];
  statuses: any[];
  lastDamageSource?: { type: 'PHYSICAL' | 'SPIRITUAL' | 'ELEMENTAL' | 'POISON' | 'CORRUPTION'; amount: number };
  harvestQuality?: HarvestQuality;
}

export interface BattleSides {
  player: string[];
  enemy: string[];
}

export interface BattleState {
  grid: { width: number; height: number };
  preparation_score: number;
  alertness_score: number;
  initiativeWinner: 'PLAYER' | 'ENEMY';
  actors: BattleActor[];
  sides: BattleSides;
  turnCount: number;
  turnLog: string[];
}

export function projectPublicBattleActor(actor: BattleActor, isPlayer: boolean): BattleActor {
  if (!actor || isPlayer) return actor;
  const revealedSet = new Set(actor.revealedAbilities || []);
  const sanitizedAbilities = (actor.abilities || []).filter((ab: string) => revealedSet.has(ab));
  return {
    ...actor,
    abilities: sanitizedAbilities,
    revealedAbilities: actor.revealedAbilities || []
  };
}

export function projectPublicBattleState(state: BattleState): BattleState {
  if (!state) return state;
  const isPlayer = (id: string) => (state.sides?.player || []).includes(id);
  const actors = (state.actors || []).map(a => projectPublicBattleActor(a, isPlayer(a.id)));
  return {
    ...state,
    actors
  };
}

export const combatRoutes: FastifyPluginAsync<{ db: DatabaseClient; loader: CanonicalDataLoader }> = async (
  fastify: FastifyInstance,
  opts
) => {
  const { db, loader } = opts;
  const gridEngine = GridCombatEngine.getInstance();

  // GET /api/combat/skills/:characterId
  fastify.get('/skills/:characterId', async (req, reply) => {
    const { characterId } = req.params as { characterId: string };
    const char = db.getCharacter(characterId);
    if (!char) {
      throw new EntityNotFoundError('Personaje no encontrado');
    }

    const skills = TacticalCombatEngine.getSkillsForPathway(char.pathway as CanonicalPathwayId, char.sequence);
    return reply.send({
      pathway: char.pathway,
      sequence: char.sequence,
      availableSkills: skills
    });
  });

  // GET /api/combat/active/:characterId
  fastify.get('/active/:characterId', async (req, reply) => {
    const { characterId } = req.params as { characterId: string };
    const battleRow = db.getActiveBattle(characterId);
    if (!battleRow) {
      throw new EntityNotFoundError('No hay combate activo para este personaje.');
    }

    const battleState: BattleState = JSON.parse(battleRow.state_json);
    const char = db.getCharacter(characterId);
    const skills = char
      ? TacticalCombatEngine.getSkillsForPathway(char.pathway as CanonicalPathwayId, char.sequence)
      : [];
    const publicState = projectPublicBattleState(battleState);
    const player = publicState.actors ? publicState.actors.find(a => publicState.sides.player.includes(a.id))! : (battleState as any).player;
    const rawEnemy = publicState.actors ? publicState.actors.find(a => publicState.sides.enemy.includes(a.id))! : (battleState as any).enemy;
    const enemy = projectPublicBattleActor(rawEnemy, false);

    return reply.send({
      battleId: battleRow.id,
      status: battleRow.status,
      player,
      enemy,
      actors: publicState.actors,
      sides: publicState.sides,
      grid: publicState.grid,
      preparation_score: publicState.preparation_score,
      alertness_score: publicState.alertness_score,
      initiativeWinner: publicState.initiativeWinner,
      turnCount: publicState.turnCount,
      turnLog: publicState.turnLog,
      availableSkills: skills
    });
  });

  // POST /api/combat/start
  fastify.post('/start', async (req, reply) => {
    const parseRes = CombatStartSchema.safeParse(req.body);
    if (!parseRes.success) {
      throw new ValidationDomainError('Datos de inicio de combate inválidos', parseRes.error.format());
    }

    const {
      characterId,
      enemyName: optEnemyName,
      enemyHp: optEnemyHp,
      enemySpeed: optEnemySpeed,
      isConcealed,
      noRecentPowerUse,
      ambushDeclared,
      ambushMode,
      commandId,
      expectedRevision,
      forceNew
    } = parseRes.data;

    // Si ya existe combate activo y no se fuerza explícitamente uno nuevo, reanudar de forma no destructiva
    const existingBattle = db.getActiveBattle(characterId);
    if (existingBattle && !forceNew) {
      const battleState: BattleState = JSON.parse(existingBattle.state_json);
      const char = db.getCharacter(characterId);
      if (!char) throw new EntityNotFoundError('Personaje no encontrado');
      const skills = TacticalCombatEngine.getSkillsForPathway(char.pathway as CanonicalPathwayId, char.sequence);
      const publicState = projectPublicBattleState(battleState);
      const player = publicState.actors ? publicState.actors.find(a => publicState.sides.player.includes(a.id))! : (battleState as any).player;
      const rawEnemy = publicState.actors ? publicState.actors.find(a => publicState.sides.enemy.includes(a.id))! : (battleState as any).enemy;
      const enemy = projectPublicBattleActor(rawEnemy, false);

      return reply.send({
        success: true,
        resumed: true,
        battleId: existingBattle.id,
        message: 'Confrontación táctica activa restaurada.',
        player,
        enemy,
        actors: [player, enemy],
        sides: publicState.sides,
        grid: publicState.grid,
        preparation_score: publicState.preparation_score,
        alertness_score: publicState.alertness_score,
        initiativeWinner: publicState.initiativeWinner,
        availableSkills: skills
      });
    }

    // Si forceNew es true y existía una batalla previa, finalizarla como FLED
    if (existingBattle && forceNew) {
      db.finishBattle(existingBattle.id, 'FLED');
    }

    const enemyName = optEnemyName || 'Sombra de Corrupción Astral';
    const enemyHp = optEnemyHp || 65;
    const enemySpeed = optEnemySpeed || 10;

    const processed = CommandProcessor.execute(
      db,
      {
        commandId,
        characterId,
        commandType: 'COMBAT_START',
        payload: { enemyName, enemyHp, enemySpeed, isConcealed, noRecentPowerUse, ambushDeclared, ambushMode },
        expectedRevision
      },
      () => {
        const char = db.getCharacter(characterId);
        if (!char) throw new EntityNotFoundError('Personaje no encontrado');

        // Cálculo explícito de iniciativa neutral (Directiva d: preparation_score serializado)
        let preparation_score = 15;
        if (isConcealed) preparation_score += 35;
        if (noRecentPowerUse) preparation_score += 20;
        if (ambushDeclared) preparation_score += 40;

        const alertness_score = enemySpeed * 5;
        let initiativeWinner: 'PLAYER' | 'ENEMY';
        let playerAp = 3;

        if (ambushMode === 'PLAYER_AMBUSH') {
          initiativeWinner = 'PLAYER';
          playerAp = 4;
        } else if (ambushMode === 'ENEMY_AMBUSH') {
          initiativeWinner = 'ENEMY';
        } else {
          initiativeWinner = preparation_score >= alertness_score ? 'PLAYER' : 'ENEMY';
        }

        const playerActor: BattleActor = {
          id: char.id,
          name: char.name,
          isPlayer: true,
          pathway: char.pathway as CanonicalPathwayId,
          sequence: char.sequence,
          currentHp: char.current_health,
          maxHp: char.max_health,
          currentSpirituality: char.current_spirituality,
          maxSpirituality: char.max_spirituality,
          position: { x: 0, y: 2 }, // Rejilla 5x7: lado izquierdo
          ap: playerAp,
          maxAp: 3,
          attention: 1,
          maxAttention: 2,
          revealedAbilities: [], // Set de opacidad mutua inicial
          statuses: isConcealed ? [{ status: 'CONCEALED', durationTurns: 2 }] : []
        };

        const enemyActor: BattleActor = {
          id: `enemy_${char.id}_${Date.now()}`,
          name: enemyName,
          isPlayer: false,
          sequence: 9,
          currentHp: enemyHp,
          maxHp: enemyHp,
          currentSpirituality: 50,
          maxSpirituality: 50,
          position: { x: 6, y: 2 }, // Rejilla 5x7: lado derecho
          ap: 3,
          maxAp: 3,
          attention: 1,
          maxAttention: 2,
          revealedAbilities: [], // Set de opacidad mutua inicial
          statuses: []
        };

        const initialState: BattleState = {
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
          turnLog: [
            `Inicia confrontación táctica en rejilla 5x7 contra [${enemyName}].`,
            `Iniciativa: [${initiativeWinner}] toma el turno inicial (Preparación: ${preparation_score} vs Alerta: ${alertness_score}).`
          ]
        };

        // Persistencia transaccional directa en SQLite
        const battleRow = db.createBattle(char.id, initialState);
        const skills = TacticalCombatEngine.getSkillsForPathway(char.pathway as CanonicalPathwayId, char.sequence);

        return {
          success: true,
          battleId: battleRow.id,
          message: `¡Ha comenzado una confrontación mística contra [${enemyName}]!`,
          player: playerActor,
          enemy: projectPublicBattleActor(enemyActor, false),
          actors: [playerActor, projectPublicBattleActor(enemyActor, false)],
          sides: { player: [playerActor.id], enemy: [enemyActor.id] },
          grid: initialState.grid,
          preparation_score,
          alertness_score,
          initiativeWinner,
          availableSkills: skills
        };
      }
    );

    return reply.send({
      ...processed.response,
      fromReceipt: processed.fromReceipt,
      revision: processed.revision
    });
  });

  // POST /api/combat/action
  fastify.post('/action', async (req, reply) => {
    const parseRes = CombatActionSchema.safeParse(req.body);
    if (!parseRes.success) {
      throw new ValidationDomainError('Datos de combate inválidos', parseRes.error.format());
    }

    const { characterId, actionType, skillId, targetPosition, commandId, expectedRevision } = parseRes.data;

    const battleRow = db.getActiveBattle(characterId);
    if (!battleRow) {
      throw new EntityNotFoundError('No hay combate activo para este personaje.');
    }

    const processed = CommandProcessor.execute(
      db,
      {
        commandId,
        characterId,
        commandType: 'COMBAT_ACTION',
        payload: { actionType, skillId, targetPosition },
        expectedRevision
      },
      () => {
        const battle: BattleState = JSON.parse(battleRow.state_json);
        const player = battle.actors ? battle.actors.find(a => battle.sides.player.includes(a.id))! : (battle as any).player;
        const enemy = battle.actors ? battle.actors.find(a => battle.sides.enemy.includes(a.id))! : (battle as any).enemy;

        // Asegurar retrocompatibilidad de propiedades si no estaban inicializadas
        if (!player.position) player.position = { x: 0, y: 2 };
        if (!enemy.position) enemy.position = { x: 6, y: 2 };
        if (!player.revealedAbilities) player.revealedAbilities = [];
        if (!enemy.revealedAbilities) enemy.revealedAbilities = [];
        if (!player.statuses) player.statuses = [];
        if (!enemy.statuses) enemy.statuses = [];
        if (player.ap === undefined || player.ap === null) player.ap = 3;
        if (enemy.ap === undefined || enemy.ap === null) enemy.ap = 3;
        if (player.attention === undefined || player.attention === null) player.attention = 1;
        if (enemy.attention === undefined || enemy.attention === null) enemy.attention = 1;
        if (!battle.turnLog) battle.turnLog = [];

        // Manejo según actionType
        if (actionType === 'SCRUTINIZE') {
          if (player.ap < 1) {
            throw new DomainRuleViolationError('Puntos de Acción (AP) insuficientes para escudriñar.');
          }
          player.ap = Math.max(0, player.ap - 1);
          const enemyPossibleSkills = ['SKILL_ENEMY_PRIMARY_STRIKE', 'SKILL_ENEMY_CORRUPTION_AURA'];
          const hidden = enemyPossibleSkills.filter(s => !player.revealedAbilities.includes(s));
          let newlyRevealed = '';
          if (hidden.length > 0) {
            newlyRevealed = hidden[0];
            player.revealedAbilities.push(newlyRevealed);
          }
          player.attention = Math.min(2, player.attention + 1);

          db.updateBattle(battleRow.id, battle, 'ONGOING');

          return {
            battleOver: false,
            isCombatOver: false,
            actionType: 'SCRUTINIZE',
            message: newlyRevealed
              ? `¡Escudriñamiento Exitoso! Has desvelado el aura del adversario revelando: [${newlyRevealed}].`
              : 'Has examinado a fondo al adversario; conoces su repertorio visible.',
            player,
            enemy,
            state: battle
          };
        }

        if (actionType === 'MOVE') {
          if (player.ap < 1) {
            throw new DomainRuleViolationError('Puntos de Acción (AP) insuficientes para realizar un movimiento.');
          }

          const targetPos = targetPosition || { x: Math.min(6, player.position.x + 1), y: player.position.y };
          if (targetPos.x < 0 || targetPos.x > 6 || targetPos.y < 0 || targetPos.y > 4) {
            throw new DomainRuleViolationError(`Posición fuera de los límites de la cuadrícula táctica (7x5: x=0..6, y=0..4): (${targetPos.x}, ${targetPos.y})`);
          }

          player.position = targetPos;
          player.ap = Math.max(0, player.ap - 1);

          db.updateBattle(battleRow.id, battle, 'ONGOING');

          return {
            battleOver: false,
            isCombatOver: false,
            actionType: 'MOVE',
            message: `${player.name} se desplazó a (${player.position.x}, ${player.position.y}).`,
            player,
            enemy,
            state: battle
          };
        }

        if (actionType === 'NEGOTIATE') {
          const isWeakened = enemy.statuses.some((s: any) => s.status === 'WEAKENED' || s === 'WEAKENED');
          const isStunned = enemy.isStunned || enemy.statuses.some((s: any) => s.status === 'STUN' || s === 'STUN');
          const isPacified = enemy.statuses.some((s: any) => s.status === 'BLESSING' || s === 'BLESSING');
          const isFrenzy = enemy.statuses.some((s: any) => s.status === 'FRENZY' || s === 'FRENZY');

          if (isFrenzy) {
            throw new DomainRuleViolationError('Negociación Imposible: El objetivo está sumido en frenesí homicida y no puede razonar.');
          }

          if (isWeakened || isStunned || isPacified || enemy.currentHp <= Math.floor(enemy.maxHp * 0.35)) {
            db.updateBattle(battleRow.id, battle, 'VICTORY');
            return {
              battleOver: true,
              isCombatOver: true,
              victory: true,
              status: 'NEGOTIATED',
              message: `¡Negociación Exitosa! Ante su vulnerabilidad evidente, [${enemy.name}] baja las armas y se rinde.`
            };
          } else {
            throw new DomainRuleViolationError('Negociación Frustrada: El enemigo mantiene su postura hostil intacta. Debes debilitarlo o aturdirlo primero.');
          }
        }

        if (actionType === 'FLEE') {
          const dist = Math.abs(player.position.x - enemy.position.x) + Math.abs(player.position.y - enemy.position.y);
          if (dist >= 3 || enemy.isStunned) {
            db.updateBattle(battleRow.id, battle, 'FLED');
            return {
              battleOver: true,
              isCombatOver: true,
              victory: false,
              status: 'FLED',
              message: 'Has roto el contacto táctico y huido con éxito hacia la niebla de Backlund.'
            };
          } else {
            throw new DomainRuleViolationError('Intento de Huida Fallido: La proximidad del enemigo impide retirarse sin sufrir daño mortal.');
          }
        }

        // 1. Turno del Jugador (Ataque / Habilidad)
        const playerResult = TacticalCombatEngine.executeAction(player, enemy, skillId);

        // Registrar última fuente de daño para calidad de cosecha
        let dmgType: 'PHYSICAL' | 'SPIRITUAL' | 'ELEMENTAL' | 'POISON' | 'CORRUPTION' = 'PHYSICAL';
        if (skillId?.includes('SPIRIT') || skillId?.includes('PSYCHO') || skillId?.includes('ASTRAL')) {
          dmgType = 'SPIRITUAL';
        } else if (skillId?.includes('FLAME') || skillId?.includes('LIGHTNING') || skillId?.includes('FROST') || skillId?.includes('HOLY')) {
          dmgType = 'ELEMENTAL';
        } else if (skillId?.includes('POISON') || skillId?.includes('TOXIC')) {
          dmgType = 'POISON';
        }
        enemy.lastDamageSource = { type: dmgType, amount: playerResult.damageDealt };

        // Simetría: el enemigo puede revelar la habilidad observada
        if (skillId && !enemy.revealedAbilities.includes(skillId)) {
          enemy.revealedAbilities.push(skillId);
        }

        // Si el enemigo fue derrotado
        if (playerResult.isTargetDefeated || enemy.currentHp <= 0) {
          let harvestQuality: HarvestQuality = 'PRISTINE';
          if (enemy.statuses.some((s: any) => s.status === 'FRENZY' || s === 'FRENZY')) {
            harvestQuality = 'CONTAMINADO';
          } else if (enemy.lastDamageSource?.type === 'ELEMENTAL' || enemy.lastDamageSource?.type === 'POISON') {
            harvestQuality = 'DAMAGED';
          } else {
            harvestQuality = 'PRISTINE';
          }
          battle.actors = [player, enemy];
          battle.sides = { player: [player.id], enemy: [enemy.id] };
          db.updateBattle(battleRow.id, battle, 'VICTORY');
          db.updateCharacterSomatics(characterId, {
            health: player.currentHp,
            spirituality: player.currentSpirituality
          });
          db.updateCharacterWealth(characterId, 120);

          const victoryMsg = `¡Victoria! Has neutralizado a [${enemy.name}]. Ingrediente recolectado: [${harvestQuality}]. Recompensa: 10 chelines obtenidos del botín.`;

          return {
            battleOver: true,
            isCombatOver: true,
            victory: true,
            harvestQuality,
            playerResult,
            combatOverMessage: victoryMsg,
            message: victoryMsg,
            state: battle
          };
        }

        // 2. Turno del Enemigo (Contragolpe con Simetría)
        let enemyResult;
        if (enemy.isStunned) {
          enemy.isStunned = false;
          enemyResult = {
            turnNumber: battle.turnCount,
            actorName: enemy.name,
            actionName: 'Aturdido',
            damageDealt: 0,
            healingDone: 0,
            spiritualitySpent: 0,
            message: `${enemy.name} está aturdido y no puede reaccionar este turno.`,
            targetCurrentHp: player.currentHp,
            isTargetDefeated: false
          };
        } else if (enemy.isAsleep) {
          enemy.isAsleep = false;
          enemyResult = {
            turnNumber: battle.turnCount,
            actorName: enemy.name,
            actionName: 'Dormido',
            damageDealt: 0,
            healingDone: 0,
            spiritualitySpent: 0,
            message: `${enemy.name} duerme bajo el influjo del letargo nocturno.`,
            targetCurrentHp: player.currentHp,
            isTargetDefeated: false
          };
        } else {
          enemyResult = TacticalCombatEngine.executeAction(enemy, player);

          if (player.revealedAbilities.length > 0 && player.attention > 0 && enemyResult.damageDealt > 0) {
            const mitigation = Math.floor(enemyResult.damageDealt * 0.35);
            enemyResult.damageDealt = Math.max(0, enemyResult.damageDealt - mitigation);
            player.currentHp = Math.min(player.maxHp, player.currentHp + mitigation);
            player.attention -= 1;
            enemyResult.message += ` (Anticipado por Escudriñar: mitigados ${mitigation} de daño).`;
          }
        }

        battle.turnCount++;

        // Si el jugador es derrotado
        if (enemyResult.isTargetDefeated || player.currentHp <= 0) {
          battle.actors = [player, enemy];
          battle.sides = { player: [player.id], enemy: [enemy.id] };
          db.updateBattle(battleRow.id, battle, 'DEFEAT');
          db.updateCharacterSomatics(characterId, {
            health: 0,
            sanity: 0
          });
          return {
            battleOver: true,
            isCombatOver: true,
            victory: false,
            playerResult,
            enemyResult,
            combatOverMessage: `Has caído en combate contra [${enemy.name}]. La oscuridad reclama tu cuerpo astral.`,
            message: `Has caído en combate contra [${enemy.name}]. La oscuridad reclama tu cuerpo astral.`,
            state: battle
          };
        }

        // Persistir estado de combate actualizado en SQLite
        battle.actors = [player, enemy];
        battle.sides = { player: [player.id], enemy: [enemy.id] };
        db.updateBattle(battleRow.id, battle, 'ONGOING');

        db.updateCharacterSomatics(characterId, {
          health: player.currentHp,
          spirituality: player.currentSpirituality
        });

        const skills = TacticalCombatEngine.getSkillsForPathway(player.pathway as CanonicalPathwayId, player.sequence);

        return {
          battleOver: false,
          isCombatOver: false,
          turnNumber: battle.turnCount,
          playerResult,
          enemyResult,
          playerTurn: playerResult,
          enemyTurn: enemyResult,
          availableSkills: skills,
          playerState: {
            hp: player.currentHp,
            currentHp: player.currentHp,
            maxHp: player.maxHp,
            spirituality: player.currentSpirituality,
            currentSpirituality: player.currentSpirituality,
            maxSpirituality: player.maxSpirituality,
            position: player.position,
            ap: player.ap,
            attention: player.attention,
            revealedAbilities: player.revealedAbilities
          },
          player: {
            ...player,
            hp: player.currentHp
          },
          enemyState: {
            name: enemy.name,
            hp: enemy.currentHp,
            currentHp: enemy.currentHp,
            maxHp: enemy.maxHp,
            position: enemy.position,
            revealedAbilities: enemy.revealedAbilities
          },
          enemy: {
            ...enemy,
            hp: enemy.currentHp
          },
          state: battle
        };
      }
    );

    return reply.send({
      ...processed.response,
      fromReceipt: processed.fromReceipt,
      revision: processed.revision
    });
  });
};
