import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { DatabaseClient } from '../../infra/database/DatabaseClient.js';
import { CalendarEngine, CalendarActionType } from '../../core/calendar/CalendarEngine.js';

export const calendarRoutes: FastifyPluginAsync<{ db: DatabaseClient }> = async (app: FastifyInstance, opts) => {
  const { db } = opts;

  // POST /api/calendar/action
  const ActionSchema = z.object({
    characterId: z.string().min(1),
    actionType: z.enum(['INVESTIGATE', 'WORK', 'SOCIALIZE', 'OPERATE']),
    commandId: z.string().optional(),
    details: z.object({
      targetId: z.string().optional(),
      customNote: z.string().optional()
    }).optional()
  });

  app.post('/api/calendar/action', async (req, reply) => {
    const parsed = ActionSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Payload inválido', details: parsed.error.issues });
    }
    const { characterId, actionType, commandId, details } = parsed.data;

    if (commandId) {
      const payloadHash = JSON.stringify({ characterId, actionType, details: details || {} });
      const existing = db.getCommandReceipt(commandId);
      if (existing) {
        if (existing.payloadHash !== payloadHash) {
          return reply.status(409).send({ error: 'Command ID reutilizado con diferente payload' });
        }
        return reply.status(200).send(existing.response);
      }

      const outcome = db.transaction(() => {
        const out = CalendarEngine.performSlotAction(db, characterId, actionType as CalendarActionType, details);
        db.saveCommandReceipt({
          commandId,
          characterId,
          commandType: 'CALENDAR_ACTION',
          payloadHash,
          response: out
        });
        return out;
      });

      return reply.send(outcome);
    }

    const outcome = CalendarEngine.performSlotAction(db, characterId, actionType as CalendarActionType, details);
    return reply.send(outcome);
  });

  // GET /api/calendar/logs/:characterId
  app.get<{ Params: { characterId: string }; Querystring: { limit?: string } }>('/api/calendar/logs/:characterId', async (req, reply) => {
    const { characterId } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 50;
    const logs = db.getCalendarLogs(characterId, limit);
    return reply.send({ logs });
  });
};

