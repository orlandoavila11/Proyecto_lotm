import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { DatabaseClient } from '../../infra/database/DatabaseClient.js';
import { CanonicalDataLoader } from '../../infra/data/CanonicalDataLoader.js';
import { GridCombatEngine, GridActor, GridBattleState, CombatAbility, HarvestQuality } from '../../core/combat/GridCombatEngine.js';
import { CombatContent } from '../../core/combat/CombatContent.js';
import { SeededRNG } from '../../core/rng/SeededRNG.js';
import { CanonicalPathwayId } from '../../core/types/pathway.js';
import { EntityNotFoundError, ValidationDomainError, DomainRuleViolationError } from '../../core/errors/DomainError.js';
import { CommandProcessor } from '../../infra/database/CommandProcessor.js';

/**
 * Combate táctico (rejilla 7×5) sobre GridCombatEngine y los datos Tier G.
 *
 * Autoridad del servidor: el cliente sólo pide entrar en un lugar y declara acciones. El adversario, su vigor,
 * la iniciativa y las tiradas los decide el motor; el adversario viaja al cliente como lo percibe el personaje
 * (bandas de estado y técnicas ya observadas), nunca con sus cifras ni su repertorio oculto.
 */

const CombatStartSchema = z.object({
  characterId: z.string().min(1),
  /** lugar del encuentro (encounters.json); por ahora sólo el callejón de Cherwood */
  site: z.string().min(1).optional().default('CHERWOOD_ALLEY'),
  commandId: z.string().optional(),
  expectedRevision: z.number().int().optional()
});

const CombatActionSchema = z.object({
  characterId: z.string().min(1),
  actionType: z.enum(['SKILL', 'MOVE', 'SCRUTINIZE', 'NEGOTIATE', 'FLEE', 'END_TURN']),
  skillId: z.string().optional(),
  targetPosition: z.object({ x: z.number().int(), y: z.number().int() }).optional(),
  commandId: z.string().optional(),
  expectedRevision: z.number().int().optional()
});

type Tier = 'MINOR' | 'STANDARD' | 'DANGEROUS';

/** estado persistido en battles.state_json */
interface StoredBattle extends GridBattleState {
  engine: 'grid-v1';
  encounter: { siteId: string; tier: Tier };
}

export type EnemyCondition = 'FIRM' | 'WOUNDED' | 'FALTERING';

export interface PublicAbility {
  id: string;
  name: string;
  description: string;
  apCost: number;
  spiritualityCost: number;
  range: number;
  targetType: CombatAbility['targetType'];
}

export interface PublicBattle {
  battleId: string;
  status: GridBattleState['status'];
  grid: { width: number; height: number };
  turnCount: number;
  initiativeWinner: 'PLAYER' | 'ENEMY';
  player: {
    id: string; name: string;
    hp: number; maxHp: number; spirituality: number; maxSpirituality: number;
    ap: number; maxAp: number; attention: number; maxAttention: number;
    position: { x: number; y: number };
    statuses: string[];
  };
  enemy: {
    id: string; name: string;
    condition: EnemyCondition;
    position: { x: number; y: number };
    statuses: string[];
    /** sólo lo que el personaje ha llegado a ver */
    knownAbilities: Array<{ id: string; name: string; description: string; range: number }>;
  };
  availableSkills: PublicAbility[];
}

/** coste real en PA: el de la técnica más el de sus átomos (p. ej. intercambio de atención), como cobra el motor */
const effectiveApCost = (a: CombatAbility) => (a.apCost || 0) + (a.atoms.find(x => x.params?.apCost !== undefined)?.params?.apCost || 0);

const toPublicAbility = (a: CombatAbility): PublicAbility => ({
  id: a.id, name: a.name, description: a.description, apCost: effectiveApCost(a),
  spiritualityCost: a.spiritualityCost, range: a.range, targetType: a.targetType
});

export function enemyCondition(enemy: Pick<GridActor, 'hp' | 'maxHp'>): EnemyCondition {
  const B = CombatContent.balance();
  const r = enemy.maxHp > 0 ? enemy.hp / enemy.maxHp : 1;
  if (r <= B.negotiation.hpFractionThreshold) return 'FALTERING';
  if (r < B.conditionBands.woundedBelow) return 'WOUNDED';
  return 'FIRM';
}

/** Proyección por lista blanca: nada del adversario sale salvo lo enumerado aquí. */
export function projectPublicBattle(state: GridBattleState): PublicBattle {
  const engine = GridCombatEngine.getInstance();
  const p = engine.getPlayer(state);
  const e = engine.getPrimaryEnemy(state);
  const visible = (a: GridActor) => a.statuses.filter(s => s.status !== 'CONCEALED' || a.isPlayer).map(s => s.status);
  return {
    battleId: state.battleId,
    status: state.status,
    grid: { ...state.grid },
    turnCount: state.turnCount,
    initiativeWinner: state.initiativeWinner,
    player: {
      id: p.id, name: p.name, hp: p.hp, maxHp: p.maxHp, spirituality: p.spirituality, maxSpirituality: p.maxSpirituality,
      ap: p.ap, maxAp: p.maxAp, attention: p.attention, maxAttention: p.maxAttention,
      position: { ...p.position }, statuses: visible(p)
    },
    enemy: {
      id: e.id, name: e.name, condition: enemyCondition(e), position: { ...e.position }, statuses: visible(e),
      knownAbilities: e.allAbilities
        .filter(a => p.revealedAbilities.includes(a.id))
        .map(a => ({ id: a.id, name: a.name, description: a.description, range: a.range }))
    },
    availableSkills: p.allAbilities.map(toPublicAbility)
  };
}

/** el motor marca nombres entre corchetes en su registro; al jugador le llega prosa */
const prose = (text: string) => text.replace(/\[([^\]]+)\]/g, '$1');

const HARVEST_QUALITY: Record<HarvestQuality, 'PRISTINE' | 'DAMAGED' | 'CONTAMINATED'> = {
  PRISTINE: 'PRISTINE', DAMAGED: 'DAMAGED', CONTAMINADO: 'CONTAMINATED'
};

export const combatRoutes: FastifyPluginAsync<{ db: DatabaseClient; loader: CanonicalDataLoader }> = async (
  fastify: FastifyInstance,
  opts
) => {
  const { db } = opts;
  const engine = GridCombatEngine.getInstance();

  /** batalla en curso del personaje; las de formato anterior (antes de grid-v1) se dan por abandonadas */
  const loadActive = (characterId: string): { rowId: string; state: StoredBattle } | null => {
    const row = db.getActiveBattle(characterId);
    if (!row) return null;
    const state = JSON.parse(row.state_json) as StoredBattle;
    if (state.engine !== 'grid-v1') {
      db.finishBattle(row.id, 'FLED');
      return null;
    }
    return { rowId: row.id, state };
  };

  const persistPlayer = (characterId: string, state: GridBattleState) => {
    const p = engine.getPlayer(state);
    db.updateCharacterSomatics(characterId, { health: Math.max(0, p.hp), spirituality: Math.max(0, p.spirituality) });
  };

  /** Cierra el combate y aplica sus consecuencias. Devuelve lo que el personaje se lleva. */
  const settle = (characterId: string, rowId: string, state: StoredBattle) => {
    const B = CombatContent.balance();
    const enemy = engine.getPrimaryEnemy(state);
    const outcome: { pursePence: number; harvest: { name: string; quality: string } | null } = { pursePence: 0, harvest: null };

    if (state.status === 'DEFEAT') {
      const char = db.getCharacter(characterId)!;
      db.updateCharacterSomatics(characterId, {
        health: B.defeat.hpLeft,
        spirituality: Math.max(0, engine.getPlayer(state).spirituality),
        sanity: Math.max(0, char.sanity - B.defeat.sanityLoss)
      });
      db.updateBattle(rowId, state, 'DEFEAT');
      return outcome;
    }

    persistPlayer(characterId, state);

    if (state.status === 'VICTORY') {
      outcome.pursePence = B.victoryPurse[state.encounter.tier] ?? 0;
      if (outcome.pursePence > 0) db.updateCharacterWealth(characterId, outcome.pursePence);

      // cosecha: sólo si Tier G define qué se obtiene de este combatiente (Regla del Hueco: sin dato, nada)
      const harvest = CombatContent.harvestFor(enemy.id);
      if (harvest) {
        const quality = HARVEST_QUALITY[enemy.harvestQuality ?? engine.determineHarvestQuality(enemy)];
        db.addInventoryItem({
          id: db.nextId('inv_harvest'),
          character_id: characterId,
          item_code: harvest.itemCode,
          name: harvest.name,
          category: 'INGREDIENT', // la cosecha se reconoce por su código HARVEST_ y sus metadatos (grade)
          quality,
          metadata_json: JSON.stringify({ grade: harvest.grade, combatantId: enemy.id, source: harvest.source })
        });
        outcome.harvest = { name: harvest.name, quality };
      } else {
        fastify.log.warn({ combatantId: enemy.id }, 'HUMAN_REVIEW: combatiente sin cosecha definida en encounters.json');
      }
      db.updateBattle(rowId, state, 'VICTORY');
    } else if (state.status === 'NEGOTIATED') {
      // se retira: sin cosecha ni botín (el esquema de battles no distingue NEGOTIATED)
      db.updateBattle(rowId, state, 'VICTORY');
    } else if (state.status === 'FLED') {
      db.updateBattle(rowId, state, 'FLED');
    }
    return outcome;
  };

  // GET /api/combat/skills/:characterId
  fastify.get('/skills/:characterId', async (req, reply) => {
    const { characterId } = req.params as { characterId: string };
    const char = db.getCharacter(characterId);
    if (!char) throw new EntityNotFoundError('Personaje no encontrado');
    const B = CombatContent.balance();
    const skills = [
      ...engine.getPlayerAbilities(char.pathway as CanonicalPathwayId, char.sequence),
      { ...B.playerBasicAttack, attentionCost: 0, targetType: 'SINGLE_ENEMY' as const }
    ];
    return reply.send({ pathway: char.pathway, sequence: char.sequence, availableSkills: skills.map(toPublicAbility) });
  });

  // GET /api/combat/active/:characterId[?probe=1]
  fastify.get('/active/:characterId', async (req, reply) => {
    const { characterId } = req.params as { characterId: string };
    const { probe } = req.query as { probe?: string };
    const active = loadActive(characterId);
    if (!active) {
      // ?probe=1: "¿hay combate?" es una pregunta legítima, no un error (sin probe, 404 como siempre)
      if (probe === '1') return reply.send({ active: false });
      throw new EntityNotFoundError('No hay combate activo para este personaje.');
    }
    return reply.send(projectPublicBattle(active.state));
  });

  // POST /api/combat/start
  fastify.post('/start', async (req, reply) => {
    const parsed = CombatStartSchema.safeParse(req.body);
    if (!parsed.success) throw new ValidationDomainError('Datos de inicio de combate inválidos', parsed.error.format());
    const { characterId, site: siteId, commandId, expectedRevision } = parsed.data;

    const char = db.getCharacter(characterId);
    if (!char) throw new EntityNotFoundError('Personaje no encontrado');

    // un combate en curso se reanuda, nunca se duplica
    const existing = loadActive(characterId);
    if (existing) {
      return reply.send({ ...projectPublicBattle(existing.state), resumed: true, messages: ['El encuentro sigue donde lo dejaste.'] });
    }

    const site = CombatContent.site(siteId);
    if (!site) throw new DomainRuleViolationError(`Lugar de encuentro desconocido: '${siteId}'.`);

    const processed = CommandProcessor.execute(
      db,
      { commandId, characterId, commandType: 'COMBAT_START', payload: { site: siteId }, expectedRevision },
      () => {
        const pool = site.pool.filter(p => char.sequence >= p.minSequence && char.sequence <= p.maxSequence);
        if (pool.length === 0) {
          throw new DomainRuleViolationError(`Nada acecha en ${site.label} para alguien de tu secuencia.`);
        }
        const battleId = db.nextId('battle');
        // el encuentro se decide con una semilla del propio servidor (secuencia persistente), no del cliente
        const rng = new SeededRNG(`encounter:${battleId}`);
        const total = pool.reduce((s, p) => s + p.weight, 0);
        let roll = rng.nextInt(1, Math.round(total * 1000)) / 1000;
        const pick = pool.find(p => (roll -= p.weight) <= 0) ?? pool[pool.length - 1];
        const def = CombatContent.combatants().get(pick.combatantId);

        const grid = engine.createBattle(
          battleId,
          {
            id: char.id, name: char.name, pathway: char.pathway as CanonicalPathwayId, sequence: char.sequence,
            hp: char.current_health, maxHp: char.max_health,
            spirituality: char.current_spirituality, maxSpirituality: char.max_spirituality
          },
          {
            id: def.id, name: def.name, hp: def.atomStats.hp, maxHp: def.atomStats.maxHp,
            spirituality: def.atomStats.spirituality, maxSpirituality: def.atomStats.maxSpirituality,
            speed: def.atomStats.speed, abilities: def.abilities
          }
        );
        const state: StoredBattle = { ...grid, engine: 'grid-v1', encounter: { siteId, tier: pick.tier } };
        const messages = [`Algo se mueve en ${site.label}: ${def.name}.`];

        // si el adversario gana la iniciativa, golpea primero
        if (state.initiativeWinner === 'ENEMY') {
          engine.getPlayer(state).ap = 0;
          const first = engine.executeEnemyTurn(state);
          messages.push(`Se te adelanta. ${first.message}`);
        }

        db.createBattleWithId(battleId, char.id, state);
        let outcome = null;
        if (state.status !== 'ONGOING') outcome = settle(characterId, battleId, state);
        else persistPlayer(characterId, state);

        return { ...projectPublicBattle(state), resumed: false, messages: messages.map(prose), outcome };
      }
    );

    return reply.send({ ...processed.response, fromReceipt: processed.fromReceipt, revision: processed.revision });
  });

  // POST /api/combat/action
  fastify.post('/action', async (req, reply) => {
    const parsed = CombatActionSchema.safeParse(req.body);
    if (!parsed.success) throw new ValidationDomainError('Datos de combate inválidos', parsed.error.format());
    const { characterId, actionType, skillId, targetPosition, commandId, expectedRevision } = parsed.data;

    const active = loadActive(characterId);
    if (!active) throw new EntityNotFoundError('No hay combate activo para este personaje.');

    const processed = CommandProcessor.execute(
      db,
      { commandId, characterId, commandType: 'COMBAT_ACTION', payload: { actionType, skillId, targetPosition }, expectedRevision },
      () => {
        const { rowId, state } = active;
        const player = engine.getPlayer(state);
        const messages: string[] = [];

        if (actionType === 'END_TURN') {
          messages.push(engine.executeEnemyTurn(state).message);
        } else {
          const res = engine.executePlayerAction(state, { type: actionType, skillId, targetPosition });
          if (!res.success) {
            // negativa de las reglas (sin PA, fuera de alcance, huida imposible…): 422 narrable, sin cambios
            throw new DomainRuleViolationError(prose(res.message));
          }
          messages.push(res.message);
          // sin PA el turno pasa solo al adversario
          if (state.status === 'ONGOING' && player.ap <= 0) {
            messages.push(engine.executeEnemyTurn(state).message);
          }
        }

        let outcome = null;
        if (state.status === 'ONGOING') {
          persistPlayer(characterId, state);
          db.updateBattle(rowId, state, 'ONGOING');
        } else {
          outcome = settle(characterId, rowId, state);
        }

        return {
          ...projectPublicBattle(state),
          battleOver: state.status !== 'ONGOING',
          victory: state.status === 'VICTORY' || state.status === 'NEGOTIATED',
          messages: messages.map(prose),
          outcome
        };
      }
    );

    return reply.send({ ...processed.response, fromReceipt: processed.fromReceipt, revision: processed.revision });
  });
};
