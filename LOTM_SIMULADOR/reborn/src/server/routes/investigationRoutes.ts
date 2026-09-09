import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { DatabaseClient } from '../../infra/database/DatabaseClient.js';
import { ProceduralInvestigationService, InvestigationMethod } from '../../core/investigation/ProceduralInvestigationService.js';
import { CanonicalPathwayId } from '../../core/types/pathway.js';

const GenerateCaseSchema = z.object({
  characterId: z.string()
});

const InvestigateClueSchema = z.object({
  characterId: z.string(),
  caseId: z.string(),
  clueId: z.string(),
  method: z.enum([
    'SPIRITUAL_DIVINATION',
    'PSYCHOLOGICAL_ANALYSIS',
    'LOGICAL_RATIOCINATION',
    'FORENSIC_TRACKING'
  ])
});

const VerdictSchema = z.object({
  characterId: z.string(),
  caseId: z.string(),
  action: z.enum([
    'SCOTLAND_YARD',
    'EXTORT_BLACKMAIL',
    'EXECUTE_SHADOWS',
    'COVER_UP_ALLIANCE'
  ])
});

export const investigationRoutes: FastifyPluginAsync<{ db: DatabaseClient }> = async (
  fastify: FastifyInstance,
  opts
) => {
  const { db } = opts;

  // GET /api/investigation/cases/:characterId
  fastify.get('/cases/:characterId', async (req, reply) => {
    const { characterId } = req.params as { characterId: string };
    const char = db.getCharacter(characterId);
    if (!char) {
      return reply.status(404).send({ error: 'Personaje no encontrado' });
    }

    const cases = db.getCharacterCases(characterId);
    const enrichedCases = cases.map(c => ({
      ...c,
      clues: db.getCaseClues(c.id)
    }));

    return reply.send({
      characterId,
      cases: enrichedCases
    });
  });

  // POST /api/investigation/case/generate
  fastify.post('/case/generate', async (req, reply) => {
    const parseRes = GenerateCaseSchema.safeParse(req.body);
    if (!parseRes.success) {
      return reply.status(400).send({ error: 'Datos inválidos', details: parseRes.error.format() });
    }

    const { characterId } = parseRes.data;
    const char = db.getCharacter(characterId);
    if (!char) {
      return reply.status(404).send({ error: 'Personaje no encontrado' });
    }

    const newCase = ProceduralInvestigationService.generateCaseForCharacter(
      db,
      characterId,
      char.current_day
    );

    const fullCase = db.getInvestigationCase(newCase.caseId);
    const clues = db.getCaseClues(newCase.caseId);

    return reply.status(201).send({
      success: true,
      case: {
        ...fullCase,
        clues
      }
    });
  });

  // POST /api/investigation/clue/investigate
  fastify.post('/clue/investigate', async (req, reply) => {
    const parseRes = InvestigateClueSchema.safeParse(req.body);
    if (!parseRes.success) {
      return reply.status(400).send({ error: 'Datos inválidos', details: parseRes.error.format() });
    }

    const { characterId, caseId, clueId, method } = parseRes.data;
    const char = db.getCharacter(characterId);
    if (!char) {
      return reply.status(404).send({ error: 'Personaje no encontrado' });
    }

    try {
      const result = ProceduralInvestigationService.investigateClue(
        db,
        caseId,
        clueId,
        char.pathway as CanonicalPathwayId,
        method as InvestigationMethod
      );

      // Actualizar digestión en personaje
      const currentDigestion = char.digestion_progress + result.digestionBonus;
      db.updateCharacterSomatics(characterId, {
        digestion: Math.min(100.0, currentDigestion)
      });

      return reply.send({
        ...result,
        newDigestion: Math.min(100.0, currentDigestion)
      });
    } catch (err: any) {
      return reply.status(400).send({ error: err.message });
    }
  });

  // POST /api/investigation/verdict
  fastify.post('/verdict', async (req, reply) => {
    const parseRes = VerdictSchema.safeParse(req.body);
    if (!parseRes.success) {
      return reply.status(400).send({ error: 'Datos inválidos', details: parseRes.error.format() });
    }

    const { characterId, caseId, action } = parseRes.data;
    const char = db.getCharacter(characterId);
    if (!char) {
      return reply.status(404).send({ error: 'Personaje no encontrado' });
    }

    try {
      const result = ProceduralInvestigationService.resolveVerdict(
        db,
        characterId,
        caseId,
        action
      );

      return reply.send(result);
    } catch (err: any) {
      return reply.status(400).send({ error: err.message });
    }
  });
};

