import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { DatabaseClient } from '../../infra/database/DatabaseClient.js';
import { CanonicalDataLoader } from '../../infra/data/CanonicalDataLoader.js';
import { SomaticsEngine } from '../../core/somatics/SomaticsEngine.js';

export const characterRoutes: FastifyPluginAsync<{ db: DatabaseClient; loader: CanonicalDataLoader }> = async (
  fastify: FastifyInstance,
  opts
) => {
  const { db, loader } = opts;

  // GET /api/character/:id
  fastify.get('/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const char = db.getCharacter(id);
    if (!char) {
      return reply.status(404).send({ error: 'Personaje no encontrado' });
    }

    const persona = db.getActivePersona(id);
    const anchors = db.getAnchors(id);
    const anchorStrength = db.getTotalAnchorStrength(id);
    const scars = db.getScars(id);
    const inventory = db.getInventory(id);
    // Durante el prólogo el personaje aún no tiene vía (UNAWAKENED): la proyección sigue disponible sin secuencia.
    const seqData = char.pathway === 'UNAWAKENED' ? null : loader.getSequenceData(char.pathway, char.sequence);

    const somaticsEval = SomaticsEngine.evaluate({
      currentHealth: char.current_health,
      maxHealth: char.max_health,
      currentSpirituality: char.current_spirituality,
      maxSpirituality: char.max_spirituality,
      sanity: char.sanity,
      corruption: char.corruption,
      ruina: char.ruina ?? 0,
      digestionProgress: char.digestion_progress,
      anchorStrength,
      terminalState: (char.terminal_state as any) ?? null
    });

    return reply.send({
      character: char,
      sequenceName: seqData?.name ?? null,
      activePersona: persona,
      anchorStrength,
      anchors,
      anchorsCount: anchors.length,
      scars,
      scarsCount: scars.length,
      inventory,
      inventoryCount: inventory.length,
      somatics: somaticsEval,
      wallet: {
        pounds: Math.floor(char.raw_pence / 240),
        soli: Math.floor((char.raw_pence % 240) / 12),
        pence: char.raw_pence % 12
      }
    });
  });

  // GET /api/character/:id/scars
  fastify.get('/:id/scars', async (req, reply) => {
    const { id } = req.params as { id: string };
    const char = db.getCharacter(id);
    if (!char) {
      return reply.status(404).send({ error: 'Personaje no encontrado' });
    }
    const scars = db.getScars(id);
    return reply.send({ characterId: id, scars, scarsCount: scars.length });
  });

  // GET /api/character/:id/rampage-events (Expediente de reconstrucción del yo)
  fastify.get('/:id/rampage-events', async (req, reply) => {
    const { id } = req.params as { id: string };
    const char = db.getCharacter(id);
    if (!char) {
      return reply.status(404).send({ error: 'Personaje no encontrado' });
    }
    const events = db.getRampageEvents(id);
    return reply.send({ characterId: id, events, count: events.length });
  });
};

