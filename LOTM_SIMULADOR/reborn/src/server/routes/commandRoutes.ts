import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { DatabaseClient } from '../../infra/database/DatabaseClient.js';
import { EntityNotFoundError } from '../../core/errors/DomainError.js';

export const commandRoutes: FastifyPluginAsync<{ db: DatabaseClient }> = async (app: FastifyInstance, opts) => {
  const { db } = opts;

  // GET /api/commands/receipt/:commandId
  app.get<{ Params: { commandId: string }; Querystring: { characterId?: string } }>('/receipt/:commandId', async (req, reply) => {
    const { commandId } = req.params;
    const { characterId } = req.query;
    const receipt = db.getCommandReceipt(commandId);
    // el recibo sólo se entrega a quien lo generó (las respuestas guardadas ya van proyectadas)
    if (!receipt || !characterId || receipt.characterId !== characterId) {
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
