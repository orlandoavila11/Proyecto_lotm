import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { DatabaseClient } from '../../infra/database/DatabaseClient.js';
import { CanonicalDataLoader } from '../../infra/data/CanonicalDataLoader.js';
import { ActingDilemmaEngine } from '../../core/acting/ActingDilemmaEngine.js';
import { CanonicalPathwayId } from '../../core/types/pathway.js';

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

  // GET /api/acting/dilemma/:characterId
  fastify.get('/dilemma/:characterId', async (req, reply) => {
    const { characterId } = req.params as { characterId: string };
    const char = db.getCharacter(characterId);
    if (!char) {
      return reply.status(404).send({ error: 'Personaje no encontrado' });
    }

    const rawDilemma = ActingDilemmaEngine.getDilemma(char.pathway as CanonicalPathwayId, char.sequence);
    const normalizedDilemma = {
      ...rawDilemma,
      title: `${rawDilemma.sequenceName} · ${rawDilemma.clientOrContext || 'Backlund'}`,
      description: rawDilemma.situation,
      corePrinciple: rawDilemma.principleText,
      choices: rawDilemma.choices.map(c => ({
        ...c,
        text: c.label,
        label: c.label,
        description: c.description
      }))
    };

    return reply.send({
      dilemma: normalizedDilemma,
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

    // Fallback legado para vías no migradas aún a Tier G
    const dilemma = ActingDilemmaEngine.getDilemma(char.pathway as CanonicalPathwayId, char.sequence);
    const choice = dilemma.choices.find(c => c.id === choiceId);
    if (!choice) {
      return reply.status(400).send({ error: `Elección '${choiceId}' no válida para este dilema.` });
    }

    const newSanity = Math.max(0, Math.min(100, char.sanity + choice.sanityDelta));

    db.updateCharacterSomatics(characterId, {
      sanity: newSanity
    });

    if (choice.penceReward > 0) {
      db.updateCharacterWealth(characterId, choice.penceReward);
    }

    const activePersona = db.getActivePersona(characterId);
    if (activePersona && (choice.policeSuspicionDelta !== 0 || choice.churchSuspicionDelta !== 0)) {
      db.updatePersonaSuspicion(activePersona.id, choice.policeSuspicionDelta, choice.churchSuspicionDelta);
    }

    db.logActing({
      id: `act_${Date.now()}`,
      character_id: characterId,
      pathway: char.pathway,
      sequence: char.sequence,
      dilemma_id: dilemmaId,
      choice_id: choiceId,
      digestion_gained: choice.digestionGain,
      sanity_delta: choice.sanityDelta,
      day: char.current_day,
      narrative_log: choice.narrativeOutcome
    });

    return reply.send({
      success: true,
      message: choice.narrativeOutcome,
      isAligned: choice.isAlignedWithPrinciple,
      digestionProgress: char.digestion_progress,
      isFullyDigested: char.digestion_progress >= 100.0,
      sanityDelta: choice.sanityDelta,
      penceRewarded: choice.penceReward
    });
  });

  // POST /api/acting/weekly-tick
  fastify.post('/weekly-tick', async (req, reply) => {
    const body = req.body as { characterId?: string };
    if (!body || !body.characterId) {
      return reply.status(400).send({ error: 'characterId es requerido' });
    }

    const char = db.getCharacter(body.characterId);
    if (!char) {
      return reply.status(404).send({ error: 'Personaje no encontrado' });
    }

    const tickResult = ActingDilemmaEngine.processWeeklyTick(db, body.characterId);
    return reply.send({
      success: true,
      tickResult
    });
  });
};

