import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { DatabaseClient } from '../../infra/database/DatabaseClient.js';
import { OriginEngine } from '../../core/origins/OriginEngine.js';
import { PrologueEngine } from '../../core/prologue/PrologueEngine.js';

export const prologueRoutes: FastifyPluginAsync<{ db: DatabaseClient }> = async (app: FastifyInstance, opts) => {
  const { db } = opts;

  // GET /api/prologue/origins
  app.get('/api/prologue/origins', async (_req, reply) => {
    const origins = OriginEngine.getAllOrigins();
    return reply.send({ origins });
  });

  // POST /api/prologue/start
  const StartSchema = z.object({
    characterId: z.string().min(1),
    originId: z.string().min(1)
  });

  app.post('/api/prologue/start', async (req, reply) => {
    const parsed = StartSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Payload inválido', details: parsed.error.issues });
    }
    const { characterId, originId } = parsed.data;
    const result = PrologueEngine.startPrologue(db, characterId, originId);
    return reply.send(result);
  });

  // POST /api/prologue/tutorial/dilemma
  const DilemmaSchema = z.object({
    characterId: z.string().min(1),
    choice: z.enum(['PRUDENCE', 'CURIOSITY'])
  });

  app.post('/api/prologue/tutorial/dilemma', async (req, reply) => {
    const parsed = DilemmaSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Payload inválido', details: parsed.error.issues });
    }
    const { characterId, choice } = parsed.data;
    const result = PrologueEngine.resolveTutorialDilemma(db, characterId, choice);
    return reply.send(result);
  });

  // GET /api/prologue/potions
  app.get('/api/prologue/potions', async (_req, reply) => {
    const details = PrologueEngine.getPotionChoiceDetails();
    return reply.send(details);
  });

  // POST /api/prologue/drink
  const DrinkSchema = z.object({
    characterId: z.string().min(1),
    potionChoice: z.enum(['COBALT_EYES', 'AMBER_MIRROR'])
  });

  app.post('/api/prologue/drink', async (req, reply) => {
    const parsed = DrinkSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Payload inválido', details: parsed.error.issues });
    }
    const { characterId, potionChoice } = parsed.data;
    const result = PrologueEngine.drinkFirstPotion(db, characterId, potionChoice);
    return reply.send(result);
  });
};
