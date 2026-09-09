import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { DatabaseClient } from '../../infra/database/DatabaseClient.js';
import { CanonicalDataLoader } from '../../infra/data/CanonicalDataLoader.js';
import { TacticalCombatEngine, CombatActor } from '../../core/combat/TacticalCombatEngine.js';
import { CanonicalPathwayId } from '../../core/types/pathway.js';

const CombatActionSchema = z.object({
  characterId: z.string(),
  skillId: z.string().optional()
});

// Sesiones de combate en memoria temporal de combate activo
const activeBattles: Map<string, { player: CombatActor; enemy: CombatActor; turnCount: number }> = new Map();

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
      return reply.status(404).send({ error: 'Personaje no encontrado' });
    }

    const skills = TacticalCombatEngine.getSkillsForPathway(char.pathway as CanonicalPathwayId, char.sequence);
    return reply.send({
      pathway: char.pathway,
      sequence: char.sequence,
      availableSkills: skills
    });
  });

  // POST /api/combat/start
  fastify.post('/start', async (req, reply) => {
    const body = req.body as { characterId: string; enemyName?: string; enemyHp?: number };
    if (!body?.characterId) {
      return reply.status(400).send({ error: 'characterId requerido' });
    }

    const char = db.getCharacter(body.characterId);
    if (!char) {
      return reply.status(404).send({ error: 'Personaje no encontrado' });
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

    activeBattles.set(char.id, {
      player: playerActor,
      enemy: enemyActor,
      turnCount: 1
    });

    const skills = TacticalCombatEngine.getSkillsForPathway(char.pathway as CanonicalPathwayId, char.sequence);

    return reply.send({
      success: true,
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
      return reply.status(400).send({ error: 'Datos inválidos', details: parseRes.error.format() });
    }

    const { characterId, skillId } = parseRes.data;
    const battle = activeBattles.get(characterId);
    if (!battle) {
      return reply.status(400).send({ error: 'No hay combate activo para este personaje.' });
    }

    const { player, enemy } = battle;

    // 1. Turno del Jugador
    const playerResult = TacticalCombatEngine.executeAction(player, enemy, skillId);

    // Si el enemigo fue derrotado
    if (playerResult.isTargetDefeated) {
      activeBattles.delete(characterId);
      db.updateCharacterSomatics(characterId, {
        health: player.currentHp,
        spirituality: player.currentSpirituality
      });
      // Recompensa en libras
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

    // Actualizar estado en base de datos si el jugador es derrotado
    if (enemyResult.isTargetDefeated) {
      activeBattles.delete(characterId);
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

    // Persistir HP y espiritualidad actualizados del jugador
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

