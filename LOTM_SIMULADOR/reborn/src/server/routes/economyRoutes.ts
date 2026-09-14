import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { DatabaseClient } from '../../infra/database/DatabaseClient.js';
import { EconomyEngine } from '../../core/economy/EconomyEngine.js';

export const economyRoutes: FastifyPluginAsync<{ db: DatabaseClient }> = async (app: FastifyInstance, opts) => {
  const { db } = opts;

  // GET /api/economy/market/:districtId
  app.get<{ Params: { districtId: string } }>('/api/economy/market/:districtId', async (req, reply) => {
    const { districtId } = req.params;
    const market = EconomyEngine.getDistrictMarket(districtId);
    if (!market) {
      return reply.status(404).send({ error: `Mercado no disponible para '${districtId}'` });
    }
    return reply.send({ market });
  });

  // POST /api/economy/buy
  const BuySchema = z.object({
    characterId: z.string().min(1),
    districtId: z.string().min(1),
    itemCode: z.string().min(1),
    quality: z.enum(['PRISTINE', 'DAMAGED', 'CONTAMINATED'])
  });

  app.post('/api/economy/buy', async (req, reply) => {
    const parsed = BuySchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Payload inválido', details: parsed.error.issues });
    }

    const { characterId, districtId, itemCode, quality } = parsed.data;
    const char = db.getCharacter(characterId);
    if (!char) {
      return reply.status(404).send({ error: 'Character no encontrado' });
    }

    const result = EconomyEngine.buyMarketItem(db, characterId, districtId, itemCode, quality, char.current_day);
    if (!result.success) {
      return reply.status(400).send(result);
    }

    return reply.send(result);
  });

  // POST /api/economy/sell
  const SellSchema = z.object({
    characterId: z.string().min(1),
    inventoryItemId: z.string().min(1),
    grade: z.enum(['COMMON', 'UNCOMMON', 'RARE'])
  });

  app.post('/api/economy/sell', async (req, reply) => {
    const parsed = SellSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Payload inválido', details: parsed.error.issues });
    }

    const { characterId, inventoryItemId, grade } = parsed.data;
    const char = db.getCharacter(characterId);
    if (!char) {
      return reply.status(404).send({ error: 'Character no encontrado' });
    }

    const result = EconomyEngine.sellHarvestItem(db, characterId, inventoryItemId, grade, char.current_day);
    if (!result.success) {
      return reply.status(400).send(result);
    }

    return reply.send(result);
  });

  // POST /api/economy/cure
  const CureSchema = z.object({
    characterId: z.string().min(1)
  });

  app.post('/api/economy/cure', async (req, reply) => {
    const parsed = CureSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Payload inválido', details: parsed.error.issues });
    }

    const { characterId } = parsed.data;
    const char = db.getCharacter(characterId);
    if (!char) {
      return reply.status(404).send({ error: 'Character no encontrado' });
    }

    const result = EconomyEngine.purchaseCorruptionCure(db, characterId, char.current_day);
    if (!result.success) {
      return reply.status(400).send(result);
    }

    return reply.send(result);
  });
};
