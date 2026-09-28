import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { DatabaseClient } from '../../infra/database/DatabaseClient.js';
import { ProceduralInvestigationService, InvestigationMethod } from '../../core/investigation/ProceduralInvestigationService.js';
import { InvestigationEngine } from '../../core/investigation/InvestigationEngine.js';
import { CanonicalPathwayId } from '../../core/types/pathway.js';
import { CommandProcessor } from '../../infra/database/CommandProcessor.js';
import { EntityNotFoundError, DomainRuleViolationError } from '../../core/errors/DomainError.js';

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
  ]),
  commandId: z.string().optional(),
  expectedRevision: z.number().int().optional()
});

const VerdictSchema = z.object({
  characterId: z.string(),
  caseId: z.string(),
  action: z.enum([
    'SCOTLAND_YARD',
    'EXTORT_BLACKMAIL',
    'EXECUTE_SHADOWS',
    'COVER_UP_ALLIANCE'
  ]),
  commandId: z.string().optional(),
  expectedRevision: z.number().int().optional()
});

// Schemas para BRIEF-04 (Motor de Investigación Sistémico)
const ActivateCaseSchema = z.object({
  characterId: z.string(),
  caseId: z.string().optional().default('CASE_CHERWOOD_HEIRLOOM')
});

const VisitClueSourceSchema = z.object({
  instanceId: z.string(),
  clueId: z.string(),
  sourceIndex: z.number().int().min(0),
  timeOfDay: z.enum(['mañana', 'tarde', 'noche']).optional(),
  hour: z.number().optional(),
  commandId: z.string().optional(),
  expectedRevision: z.number().int().optional()
});

const ConnectCluesSchema = z.object({
  instanceId: z.string(),
  clueA: z.string(),
  clueB: z.string(),
  relation: z.enum(['acusa', 'explica', 'localiza', 'contradice']),
  commandId: z.string().optional(),
  expectedRevision: z.number().int().optional()
});

const SubmitHypothesisSchema = z.object({
  instanceId: z.string(),
  hypothesisId: z.string(),
  commandId: z.string().optional(),
  expectedRevision: z.number().int().optional()
});

const PathwayDivinationSchema = z.object({
  instanceId: z.string(),
  mode: z.enum(['PENDULUM', 'DREAM']),
  targetClueId: z.string().optional(),
  commandId: z.string().optional(),
  expectedRevision: z.number().int().optional()
});

const PathwayEmotionReadingSchema = z.object({
  instanceId: z.string(),
  npcId: z.string(),
  commandId: z.string().optional(),
  expectedRevision: z.number().int().optional()
});

const ResolveCaseSchema = z.object({
  instanceId: z.string(),
  resolutionId: z.enum(['RESOLUTION_A_JUSTICE', 'RESOLUTION_B_TRUTH', 'RESOLUTION_C_STABILITY', 'RESOLUTION_D_HEIR']),
  commandId: z.string().optional(),
  expectedRevision: z.number().int().optional()
});

const AdvanceTimeSchema = z.object({
  instanceId: z.string(),
  days: z.number().int().positive()
});

const GenerateMinorCaseSchema = z.object({
  characterId: z.string(),
  templateIndex: z.union([z.literal(1), z.literal(2)]).optional().default(1)
});

const AddNoteSchema = z.object({
  instanceId: z.string(),
  text: z.string().min(1),
  x: z.number().optional(),
  y: z.number().optional(),
  commandId: z.string().optional()
});

const DeleteNoteSchema = z.object({
  instanceId: z.string(),
  noteId: z.string(),
  commandId: z.string().optional()
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

    const legacyCases = db.getCharacterCases(characterId).map(c => ({
      ...c,
      clues: db.getCaseClues(c.id)
    }));

    const caseInstances = db.getCharacterCaseInstances(characterId).map(inst => ({
      ...inst,
      state: JSON.parse(inst.state_json)
    }));

    return reply.send({
      characterId,
      cases: legacyCases,
      caseInstances
    });
  });

  // POST /api/investigation/case/activate (Brief-04)
  fastify.post('/case/activate', async (req, reply) => {
    const parseRes = ActivateCaseSchema.safeParse(req.body);
    if (!parseRes.success) {
      return reply.status(400).send({ error: 'Datos inválidos', details: parseRes.error.format() });
    }

    try {
      const state = InvestigationEngine.activateCase(db, parseRes.data.characterId, parseRes.data.caseId);
      const publicMeta = InvestigationEngine.getPublicCaseMetadata();
      return reply.status(200).send({
        success: true,
        caseState: state,
        availableHypotheses: publicMeta.hypotheses,
        availableResolutions: state.resolutionUnlocked ? publicMeta.resolutions : []
      });
    } catch (err: any) {
      return reply.status(400).send({ error: err.message });
    }
  });

  // GET /api/investigation/case/active/:characterId
  fastify.get('/case/active/:characterId', async (req, reply) => {
    const { characterId } = req.params as { characterId: string };
    const char = db.getCharacter(characterId);
    if (!char) {
      return reply.status(404).send({ error: 'Personaje no encontrado' });
    }

    try {
      const activeState = InvestigationEngine.activateCase(db, characterId, 'CASE_CHERWOOD_HEIRLOOM');
      const publicMeta = InvestigationEngine.getPublicCaseMetadata();
      return reply.status(200).send({
        success: true,
        caseState: activeState,
        availableHypotheses: publicMeta.hypotheses,
        availableResolutions: activeState.resolutionUnlocked ? publicMeta.resolutions : []
      });
    } catch (err: any) {
      return reply.status(400).send({ error: err.message });
    }
  });

  // POST /api/investigation/clue/visit-source (Brief-04)
  fastify.post('/clue/visit-source', async (req, reply) => {
    const parseRes = VisitClueSourceSchema.safeParse(req.body);
    if (!parseRes.success) {
      return reply.status(400).send({ error: 'Datos inválidos', details: parseRes.error.format() });
    }

    const { instanceId, clueId, sourceIndex, timeOfDay, hour, commandId, expectedRevision } = parseRes.data;
    const caseRow = db.getCaseInstance(instanceId);
    if (!caseRow) {
      throw new EntityNotFoundError(`Instancia de caso '${instanceId}' no encontrada.`);
    }

    const processed = CommandProcessor.execute(
      db,
      {
        commandId,
        characterId: caseRow.character_id,
        commandType: 'INVESTIGATION_VISIT_CLUE',
        payload: { instanceId, clueId, sourceIndex, timeOfDay, hour },
        expectedRevision
      },
      () => {
        try {
          return InvestigationEngine.visitClueSource(db, instanceId, {
            clueId,
            sourceIndex,
            timeOfDay,
            hour
          });
        } catch (err: any) {
          throw new DomainRuleViolationError(err.message || 'Error al visitar fuente de pista');
        }
      }
    );

    return reply.send({
      ...processed.response,
      fromReceipt: processed.fromReceipt,
      revision: processed.revision
    });
  });

  // POST /api/investigation/clues/connect (Brief-04)
  fastify.post('/clues/connect', async (req, reply) => {
    const parseRes = ConnectCluesSchema.safeParse(req.body);
    if (!parseRes.success) {
      return reply.status(400).send({ error: 'Datos inválidos', details: parseRes.error.format() });
    }

    const { instanceId, clueA, clueB, relation, commandId, expectedRevision } = parseRes.data;
    const caseRow = db.getCaseInstance(instanceId);
    if (!caseRow) {
      throw new EntityNotFoundError(`Instancia de caso '${instanceId}' no encontrada.`);
    }

    const processed = CommandProcessor.execute(
      db,
      {
        commandId,
        characterId: caseRow.character_id,
        commandType: 'INVESTIGATION_CONNECT_CLUES',
        payload: { instanceId, clueA, clueB, relation },
        expectedRevision
      },
      () => {
        try {
          return InvestigationEngine.connectClues(db, instanceId, clueA, clueB, relation);
        } catch (err: any) {
          throw new DomainRuleViolationError(err.message || 'Error al conectar pistas');
        }
      }
    );

    return reply.send({
      ...processed.response,
      fromReceipt: processed.fromReceipt,
      revision: processed.revision
    });
  });

  // POST /api/investigation/hypothesis/submit (Brief-04)
  fastify.post('/hypothesis/submit', async (req, reply) => {
    const parseRes = SubmitHypothesisSchema.safeParse(req.body);
    if (!parseRes.success) {
      return reply.status(400).send({ error: 'Datos inválidos', details: parseRes.error.format() });
    }

    const { instanceId, hypothesisId, commandId, expectedRevision } = parseRes.data;
    const caseRow = db.getCaseInstance(instanceId);
    if (!caseRow) {
      throw new EntityNotFoundError(`Instancia de caso '${instanceId}' no encontrada.`);
    }

    const processed = CommandProcessor.execute(
      db,
      {
        commandId,
        characterId: caseRow.character_id,
        commandType: 'INVESTIGATION_SUBMIT_HYPOTHESIS',
        payload: { instanceId, hypothesisId },
        expectedRevision
      },
      () => {
        try {
          return InvestigationEngine.submitHypothesis(db, instanceId, hypothesisId);
        } catch (err: any) {
          throw new DomainRuleViolationError(err.message || 'Error al someter hipótesis');
        }
      }
    );

    return reply.send({
      ...processed.response,
      fromReceipt: processed.fromReceipt,
      revision: processed.revision
    });
  });

  // POST /api/investigation/notes/add (P09: Notas Libres)
  fastify.post('/notes/add', async (req, reply) => {
    const parseRes = AddNoteSchema.safeParse(req.body);
    if (!parseRes.success) {
      return reply.status(400).send({ error: 'Datos inválidos', details: parseRes.error.format() });
    }

    const { instanceId, text, x, y, commandId } = parseRes.data;
    const caseRow = db.getCaseInstance(instanceId);
    if (!caseRow) {
      throw new EntityNotFoundError(`Instancia de caso '${instanceId}' no encontrada.`);
    }

    const processed = CommandProcessor.execute(
      db,
      {
        commandId,
        characterId: caseRow.character_id,
        commandType: 'INVESTIGATION_ADD_NOTE',
        payload: { instanceId, text, x, y }
      },
      () => {
        try {
          return InvestigationEngine.addFreeNote(db, instanceId, text, x, y);
        } catch (err: any) {
          throw new DomainRuleViolationError(err.message || 'Error al añadir nota libre');
        }
      }
    );

    return reply.send({
      ...processed.response,
      fromReceipt: processed.fromReceipt,
      revision: processed.revision
    });
  });

  // POST /api/investigation/notes/delete (P09: Eliminar Nota Libre)
  fastify.post('/notes/delete', async (req, reply) => {
    const parseRes = DeleteNoteSchema.safeParse(req.body);
    if (!parseRes.success) {
      return reply.status(400).send({ error: 'Datos inválidos', details: parseRes.error.format() });
    }

    const { instanceId, noteId, commandId } = parseRes.data;
    const caseRow = db.getCaseInstance(instanceId);
    if (!caseRow) {
      throw new EntityNotFoundError(`Instancia de caso '${instanceId}' no encontrada.`);
    }

    const processed = CommandProcessor.execute(
      db,
      {
        commandId,
        characterId: caseRow.character_id,
        commandType: 'INVESTIGATION_DELETE_NOTE',
        payload: { instanceId, noteId }
      },
      () => {
        try {
          return InvestigationEngine.removeFreeNote(db, instanceId, noteId);
        } catch (err: any) {
          throw new DomainRuleViolationError(err.message || 'Error al eliminar nota libre');
        }
      }
    );

    return reply.send({
      ...processed.response,
      fromReceipt: processed.fromReceipt,
      revision: processed.revision
    });
  });

  // POST /api/investigation/pathway/divination (Brief-04: FOOL)
  fastify.post('/pathway/divination', async (req, reply) => {
    const parseRes = PathwayDivinationSchema.safeParse(req.body);
    if (!parseRes.success) {
      return reply.status(400).send({ error: 'Datos inválidos', details: parseRes.error.format() });
    }

    try {
      if (parseRes.data.mode === 'PENDULUM') {
        const result = InvestigationEngine.pendulumDowsing(
          db,
          parseRes.data.instanceId,
          parseRes.data.targetClueId || 'CLUE_CONCEALED_SAFE'
        );
        return reply.send(result);
      } else {
        const result = InvestigationEngine.dreamDivination(db, parseRes.data.instanceId);
        return reply.send(result);
      }
    } catch (err: any) {
      return reply.status(400).send({ error: err.message });
    }
  });

  // POST /api/investigation/pathway/emotion-reading (Brief-04: VISIONARY)
  fastify.post('/pathway/emotion-reading', async (req, reply) => {
    const parseRes = PathwayEmotionReadingSchema.safeParse(req.body);
    if (!parseRes.success) {
      return reply.status(400).send({ error: 'Datos inválidos', details: parseRes.error.format() });
    }

    try {
      const result = InvestigationEngine.emotionReading(
        db,
        parseRes.data.instanceId,
        parseRes.data.npcId
      );
      return reply.send(result);
    } catch (err: any) {
      return reply.status(400).send({ error: err.message });
    }
  });

  // POST /api/investigation/case/resolve (Brief-04)
  fastify.post('/case/resolve', async (req, reply) => {
    const parseRes = ResolveCaseSchema.safeParse(req.body);
    if (!parseRes.success) {
      return reply.status(400).send({ error: 'Datos inválidos', details: parseRes.error.format() });
    }

    const { instanceId, resolutionId, commandId, expectedRevision } = parseRes.data;
    const caseRow = db.getCaseInstance(instanceId);
    if (!caseRow) {
      throw new EntityNotFoundError(`Instancia de caso '${instanceId}' no encontrada.`);
    }

    const processed = CommandProcessor.execute(
      db,
      {
        commandId,
        characterId: caseRow.character_id,
        commandType: 'INVESTIGATION_RESOLVE_CASE',
        payload: { instanceId, resolutionId },
        expectedRevision
      },
      () => {
        try {
          return InvestigationEngine.resolveCase(db, instanceId, resolutionId);
        } catch (err: any) {
          throw new DomainRuleViolationError(err.message || 'Error al resolver el caso');
        }
      }
    );

    return reply.send({
      ...processed.response,
      fromReceipt: processed.fromReceipt,
      revision: processed.revision
    });
  });

  // POST /api/investigation/case/advance-day (Brief-04: Expiry)
  fastify.post('/case/advance-day', async (req, reply) => {
    const parseRes = AdvanceTimeSchema.safeParse(req.body);
    if (!parseRes.success) {
      return reply.status(400).send({ error: 'Datos inválidos', details: parseRes.error.format() });
    }

    try {
      const state = InvestigationEngine.advanceTime(
        db,
        parseRes.data.instanceId,
        parseRes.data.days
      );
      return reply.send({ success: true, caseState: state });
    } catch (err: any) {
      return reply.status(400).send({ error: err.message });
    }
  });

  // POST /api/investigation/cases/minor/generate (Brief-04: Casos Menores)
  fastify.post('/cases/minor/generate', async (req, reply) => {
    const parseRes = GenerateMinorCaseSchema.safeParse(req.body);
    if (!parseRes.success) {
      return reply.status(400).send({ error: 'Datos inválidos', details: parseRes.error.format() });
    }

    try {
      const minorCase = InvestigationEngine.generateMinorCase(
        db,
        parseRes.data.characterId,
        parseRes.data.templateIndex as 1 | 2
      );
      return reply.status(201).send({ success: true, minorCase });
    } catch (err: any) {
      return reply.status(400).send({ error: err.message });
    }
  });

  // --- RUTAS LEGACY (Retrocompatibilidad) ---
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

      return reply.send({
        ...result,
        newDigestion: char.digestion_progress
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
