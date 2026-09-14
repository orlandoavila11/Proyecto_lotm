import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { DatabaseClient } from '../../infra/database/DatabaseClient.js';
import { IdentityEngine } from '../../core/identity/IdentityEngine.js';

export const identityRoutes: FastifyPluginAsync<{ db: DatabaseClient }> = async (app: FastifyInstance, opts) => {
  const { db } = opts;

  // GET /api/identity/roll/:characterId
  app.get<{ Params: { characterId: string }; Querystring: { seed?: string } }>('/api/identity/roll/:characterId', async (req, reply) => {
    const { characterId } = req.params;
    const seed = req.query.seed ? parseInt(req.query.seed, 10) : undefined;
    const event = IdentityEngine.rollIdentityEvent(db, characterId, seed);
    if (!event) {
      return reply.send({ event: null, message: 'Ningún evento de identidad disparado en esta franja' });
    }
    return reply.send({ event });
  });

  // POST /api/identity/resolve
  const ResolveSchema = z.object({
    characterId: z.string().min(1),
    eventId: z.string().min(1),
    optionIndex: z.number().int().min(0)
  });

  app.post('/api/identity/resolve', async (req, reply) => {
    const parsed = ResolveSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Payload inválido', details: parsed.error.issues });
    }
    const { characterId, eventId, optionIndex } = parsed.data;
    const result = IdentityEngine.resolveIdentityEvent(db, characterId, eventId, optionIndex);
    return reply.send(result);
  });

  // GET /api/identity/history/:characterId
  app.get<{ Params: { characterId: string }; Querystring: { limit?: string } }>('/api/identity/history/:characterId', async (req, reply) => {
    const { characterId } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 50;
    const history = db.getIdentityEventHistory(characterId, limit);
    return reply.send({ history });
  });
};

