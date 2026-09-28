import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { DatabaseClient } from '../../infra/database/DatabaseClient.js';
import { EntityNotFoundError } from '../../core/errors/DomainError.js';

export const commandRoutes: FastifyPluginAsync<{ db: DatabaseClient }> = async (app: FastifyInstance, opts) => {
  const { db } = opts;

  // GET /api/commands/receipt/:commandId
  app.get<{ Params: { commandId: string } }>('/receipt/:commandId', async (req, reply) => {
    const { commandId } = req.params;
    const receipt = db.getCommandReceipt(commandId);
    if (!receipt) {
      throw new EntityNotFoundError(`No se encontró recibo transaccional para el commandId '${commandId}'.`);
    }

    return reply.send({
      commandId: receipt.commandId,
      characterId: receipt.characterId,
      commandType: receipt.commandType,
      payloadHash: receipt.payloadHash,
      response: receipt.response,
      revision: receipt.revision,
      createdAt: receipt.createdAt
    });
  });
};
