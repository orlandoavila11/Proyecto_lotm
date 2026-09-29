import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { DatabaseClient } from '../../infra/database/DatabaseClient.js';
import { CanonicalDataLoader } from '../../infra/data/CanonicalDataLoader.js';
import { ActingDilemmaEngine } from '../../core/acting/ActingDilemmaEngine.js';
import { CanonicalPathwayId } from '../../core/types/pathway.js';
import { EntityNotFoundError } from '../../core/errors/DomainError.js';

const ResolveActingSchema = z.object({
  characterId: z.string(),
  dilemmaId: z.string(),
  choiceId: z.string()
});

export const actingRoutes: FastifyPluginAsync<{ db: DatabaseClient; loader: CanonicalDataLoader }> = async (
  fastify: FastifyInstance,
  opts
) => {
  const { db, loader } = opts;

  // GET /api/acting/dilemma/:characterId — el papel que toca ensayar ahora (Tier G, sin telegrafiar)
  fastify.get('/dilemma/:characterId', async (req, reply) => {
    const { characterId } = req.params as { characterId: string };
    const char = db.getCharacter(characterId);
    if (!char) {
      return reply.status(404).send({ error: 'Personaje no encontrado' });
    }

    const available = ActingDilemmaEngine.getAvailableDilemmas(db, characterId);
    if (available.length === 0) {
      // Regla del Hueco: sin dilemas Tier G para esta vía y secuencia no se inventa uno
      throw new EntityNotFoundError('No hay ningún papel que ensayar para tu secuencia todavía.');
    }
    // el menos ensayado (a igualdad, el primero del catálogo): repetir el mismo dilema decae
    const records = db.getActingRecords(characterId);
    const times = (id: string) => records.filter((r: any) => r.dilemma_id === id).length;
    const current = available.reduce((best, d) => (times(d.id) < times(best.id) ? d : best), available[0]);

    // el principio de la secuencia (ethos) aún vive en el catálogo legado; es texto de historia
    let corePrinciple = '';
    let sequenceName = '';
    try {
      const legacy = ActingDilemmaEngine.getDilemma(char.pathway as CanonicalPathwayId, char.sequence);
      corePrinciple = legacy.principleText;
      sequenceName = legacy.sequenceName;
    } catch {
      corePrinciple = '';
    }

    return reply.send({
      dilemma: {
        id: current.id,
        title: current.title,
        description: current.situation,
        corePrinciple,
        sequenceName,
        choices: current.options.map(o => ({
          id: o.id,
          label: o.texto,
          text: o.texto,
          description: '',
          costes: o.costes,
          ...(o.isWhisper ? { isWhisper: true, whisperPrice: o.whisperPrice, advantageDescription: o.advantageDescription } : {})
        }))
      },
      currentDigestion: char.digestion_progress,
      isFullyDigested: char.digestion_progress >= 100.0
    });
  });

  // GET /api/acting/dilemmas/:characterId (o con query string)
  fastify.get('/dilemmas/:characterId', async (req, reply) => {
    const { characterId } = req.params as { characterId: string };
    const char = db.getCharacter(characterId);
    if (!char) {
      return reply.status(404).send({ error: 'Personaje no encontrado' });
    }

    const dilemmas = ActingDilemmaEngine.getAvailableDilemmas(db, characterId);
    return reply.send({
      dilemmas,
      currentDigestion: char.digestion_progress,
      isFullyDigested: char.digestion_progress >= 100.0
    });
  });

  fastify.get('/dilemmas', async (req, reply) => {
    const query = req.query as { characterId?: string };
    if (!query.characterId) {
      return reply.status(400).send({ error: 'Parámetro characterId requerido' });
    }
    const char = db.getCharacter(query.characterId);
    if (!char) {
      return reply.status(404).send({ error: 'Personaje no encontrado' });
    }

    const dilemmas = ActingDilemmaEngine.getAvailableDilemmas(db, query.characterId);
    return reply.send({
      dilemmas,
      currentDigestion: char.digestion_progress,
      isFullyDigested: char.digestion_progress >= 100.0
    });
  });

  // POST /api/acting/resolve
  fastify.post('/resolve', async (req, reply) => {
    const parseRes = ResolveActingSchema.safeParse(req.body);
    if (!parseRes.success) {
      return reply.status(400).send({ error: 'Datos inválidos', details: parseRes.error.format() });
    }

    const { characterId, dilemmaId, choiceId } = parseRes.data;
    const char = db.getCharacter(characterId);
    if (!char) {
      return reply.status(404).send({ error: 'Personaje no encontrado' });
    }

    // Verificar si es un dilema de Tier G compilado
    const tierGDilemma = ActingDilemmaEngine.findDilemma(dilemmaId);
    if (tierGDilemma) {
      const outcome = ActingDilemmaEngine.resolveDilemma(db, characterId, dilemmaId, choiceId);
      const updatedChar = db.getCharacter(characterId);
      return reply.send({
        success: true,
        message: outcome.narrativeOutcome,
        isAligned: outcome.alignment >= 0,
        alignment: outcome.alignment,
        actingWeight: outcome.actingWeight,
        decayApplied: outcome.decayApplied,
        digestionProgress: updatedChar?.digestion_progress || 0,
        isFullyDigested: (updatedChar?.digestion_progress || 0) >= 100.0,
        sanityDelta: outcome.sanityDelta,
        corruptionDelta: outcome.corruptionDelta,
        penceRewarded: outcome.penceRewarded
      });
    }

    // Sin dilema Tier G no hay resolución (Regla del Hueco: nada de catálogos legados en código)
    throw new EntityNotFoundError(`Dilema '${dilemmaId}' desconocido.`);
  });
};

