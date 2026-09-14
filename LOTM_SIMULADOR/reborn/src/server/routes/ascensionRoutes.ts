import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { DatabaseClient } from '../../infra/database/DatabaseClient.js';
import { AscensionEngine, PreparationChecklist } from '../../core/ascension/AscensionEngine.js';
import { SeededRNG } from '../../core/rng/SeededRNG.js';

export const ascensionRoutes: FastifyPluginAsync<{ db: DatabaseClient }> = async (app: FastifyInstance, opts) => {
  const { db } = opts;

  // GET /api/ascension/status/:characterId
  app.get<{ Params: { characterId: string } }>('/api/ascension/status/:characterId', async (req, reply) => {
    const { characterId } = req.params;
    const char = db.getCharacter(characterId);
    if (!char) {
      return reply.status(404).send({ error: 'Character no encontrado' });
    }

    const status = AscensionEngine.evaluateAscensionStatus(db, characterId);
    return reply.send({ status });
  });

  // POST /api/ascension/prepare
  const PrepareSchema = z.object({
    characterId: z.string().min(1),
    checklist: z.object({
      lugar: z.boolean().optional(),
      momento: z.boolean().optional(),
      materiales_rituales: z.boolean().optional(),
      costos_anclaje: z.boolean().optional()
    }),
    markPresented: z.boolean().optional()
  });

  app.post('/api/ascension/prepare', async (req, reply) => {
    const parsed = PrepareSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Payload inválido', details: parsed.error.issues });
    }

    const { characterId, checklist, markPresented } = parsed.data;
    const char = db.getCharacter(characterId);
    if (!char) {
      return reply.status(404).send({ error: 'Character no encontrado' });
    }

    const updatedChecklist = AscensionEngine.updatePreparationChecklist(
      db,
      characterId,
      checklist,
      markPresented ?? false
    );

    const status = AscensionEngine.evaluateAscensionStatus(db, characterId);
    return reply.send({ checklist: updatedChecklist, status });
  });

  // POST /api/ascension/drink
  const DrinkSchema = z.object({
    characterId: z.string().min(1),
    confirmedAt: z.number().int().optional(),
    seed: z.number().int().optional()
  });

  app.post('/api/ascension/drink', async (req, reply) => {
    const parsed = DrinkSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Payload inválido', details: parsed.error.issues });
    }

    const { characterId, confirmedAt, seed } = parsed.data;
    const char = db.getCharacter(characterId);
    if (!char) {
      return reply.status(404).send({ error: 'Character no encontrado' });
    }

    const deterministicSeed = seed ?? (Date.now() + 1353);
    const rng = new SeededRNG(deterministicSeed);

    try {
      const result = AscensionEngine.drinkPotion(db, characterId, rng, confirmedAt);
      return reply.send(result);
    } catch (e: any) {
      return reply.status(400).send({ error: e.message });
    }
  });

  // GET /api/ascension/telemetry/:characterId
  app.get<{ Params: { characterId: string } }>('/api/ascension/telemetry/:characterId', async (req, reply) => {
    const { characterId } = req.params;
    const telemetry = db.getAscensionTelemetry(characterId);
    return reply.send({ telemetry });
  });
};
