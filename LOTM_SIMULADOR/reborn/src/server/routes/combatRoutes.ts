import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { DatabaseClient } from '../../infra/database/DatabaseClient.js';
import { CanonicalDataLoader } from '../../infra/data/CanonicalDataLoader.js';
import { TacticalCombatEngine, CombatActor } from '../../core/combat/TacticalCombatEngine.js';
import { CanonicalPathwayId } from '../../core/types/pathway.js';
import { EntityNotFoundError, ValidationDomainError } from '../../core/errors/DomainError.js';

const CombatActionSchema = z.object({
  characterId: z.string(),
  skillId: z.string().optional()
});

export interface BattleState {
  player: CombatActor;
  enemy: CombatActor;
  turnCount: number;
}

export const combatRoutes: FastifyPluginAsync<{ db: DatabaseClient; loader: CanonicalDataLoader }> = async (
  fastify: FastifyInstance,
  opts
) => {
  const { db, loader } = opts;

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

    return reply.send({
      battleId: battleRow.id,
      status: battleRow.status,
      player: battleState.player,
      enemy: battleState.enemy,
      turnCount: battleState.turnCount,
      availableSkills: skills
    });
  });

  // POST /api/combat/start
  fastify.post('/start', async (req, reply) => {
    const body = req.body as { characterId: string; enemyName?: string; enemyHp?: number };
    if (!body?.characterId) {
      throw new ValidationDomainError('characterId requerido');
    }

    const char = db.getCharacter(body.characterId);
    if (!char) {
      throw new EntityNotFoundError('Personaje no encontrado');
    }

    // Si ya existe un combate previo activo, finalizarlo como abandonado
    const existingBattle = db.getActiveBattle(char.id);
    if (existingBattle) {
      db.finishBattle(existingBattle.id, 'FLED');
    }

    const playerActor: CombatActor = {
      id: char.id,
      name: char.name,
      isPlayer: true,
      pathway: char.pathway as CanonicalPathwayId,
      sequence: char.sequence,
      currentHp: char.current_health,
      maxHp: char.max_health,
      currentSpirituality: char.current_spirituality,
      maxSpirituality: char.max_spirituality
    };

    const enemyName = body.enemyName || 'Sombra de Corrupción Astral';
    const enemyHp = body.enemyHp || 65;

    const enemyActor: CombatActor = {
      id: `enemy_${Date.now()}`,
      name: enemyName,
      isPlayer: false,
      sequence: 9,
      currentHp: enemyHp,
      maxHp: enemyHp,
      currentSpirituality: 50,
      maxSpirituality: 50
    };

    const initialState: BattleState = {
      player: playerActor,
      enemy: enemyActor,
      turnCount: 1
    };

    // Persistencia transaccional directa en SQLite
    const battleRow = db.createBattle(char.id, initialState);

    const skills = TacticalCombatEngine.getSkillsForPathway(char.pathway as CanonicalPathwayId, char.sequence);

    return reply.send({
      success: true,
      battleId: battleRow.id,
      message: `¡Ha comenzado una confrontación mística contra [${enemyName}]!`,
      player: playerActor,
      enemy: enemyActor,
      availableSkills: skills
    });
  });

  // POST /api/combat/action
  fastify.post('/action', async (req, reply) => {
    const parseRes = CombatActionSchema.safeParse(req.body);
    if (!parseRes.success) {
      throw new ValidationDomainError('Datos de combate inválidos', parseRes.error.format());
    }

    const { characterId, skillId } = parseRes.data;
    const battleRow = db.getActiveBattle(characterId);
    if (!battleRow) {
      throw new EntityNotFoundError('No hay combate activo para este personaje.');
    }

    const battle: BattleState = JSON.parse(battleRow.state_json);
    const { player, enemy } = battle;

    // 1. Turno del Jugador
    const playerResult = TacticalCombatEngine.executeAction(player, enemy, skillId);

    // Si el enemigo fue derrotado
    if (playerResult.isTargetDefeated) {
      db.updateBattle(battleRow.id, battle, 'VICTORY');
      db.updateCharacterSomatics(characterId, {
        health: player.currentHp,
        spirituality: player.currentSpirituality
      });
      db.updateCharacterWealth(characterId, 120);

      return reply.send({
        battleOver: true,
        isCombatOver: true,
        victory: true,
        playerResult,
        combatOverMessage: `¡Victoria! Has neutralizado a [${enemy.name}]. Recompensa: 10 chelines obtenidos del botín.`,
        message: `¡Victoria! Has neutralizado a [${enemy.name}]. Recompensa: 10 chelines obtenidos del botín.`
      });
    }

    // 2. Turno del Enemigo (Contragolpe)
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
    }

    battle.turnCount++;

    // Si el jugador es derrotado
    if (enemyResult.isTargetDefeated) {
      db.updateBattle(battleRow.id, battle, 'DEFEAT');
      db.updateCharacterSomatics(characterId, {
        health: 0,
        sanity: 0
      });
      return reply.send({
        battleOver: true,
        isCombatOver: true,
        victory: false,
        playerResult,
        enemyResult,
        combatOverMessage: `Has caído en combate contra [${enemy.name}]. La oscuridad reclama tu cuerpo astral.`,
        message: `Has caído en combate contra [${enemy.name}]. La oscuridad reclama tu cuerpo astral.`
      });
    }

    // Persistir estado de combate actualizado en SQLite (CERO estado en memoria volátil)
    db.updateBattle(battleRow.id, battle, 'ONGOING');

    // Persistir HP y espiritualidad actualizados del jugador en tabla characters
    db.updateCharacterSomatics(characterId, {
      health: player.currentHp,
      spirituality: player.currentSpirituality
    });

    const skills = TacticalCombatEngine.getSkillsForPathway(player.pathway as CanonicalPathwayId, player.sequence);

    return reply.send({
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
        maxSpirituality: player.maxSpirituality
      },
      player: {
        name: player.name,
        hp: player.currentHp,
        currentHp: player.currentHp,
        maxHp: player.maxHp,
        spirituality: player.currentSpirituality,
        currentSpirituality: player.currentSpirituality,
        maxSpirituality: player.maxSpirituality
      },
      enemyState: {
        name: enemy.name,
        hp: enemy.currentHp,
        currentHp: enemy.currentHp,
        maxHp: enemy.maxHp
      },
      enemy: {
        name: enemy.name,
        hp: enemy.currentHp,
        currentHp: enemy.currentHp,
        maxHp: enemy.maxHp
      }
    });
  });
};
