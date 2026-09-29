import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { DatabaseClient } from '../../infra/database/DatabaseClient.js';
import { InvestigationEngine, type InvestigationCaseState } from '../../core/investigation/InvestigationEngine.js';
import { CanonicalPathwayId } from '../../core/types/pathway.js';
import { CommandProcessor } from '../../infra/database/CommandProcessor.js';
import { EntityNotFoundError, DomainRuleViolationError } from '../../core/errors/DomainError.js';

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

/**
 * Respuesta de caso apta para el cliente: estado con hipótesis bajo alias y el catálogo de hipótesis que las
 * pistas descubiertas sostienen en este momento.
 */
function publicCase<T>(response: T): T {
  const r = response as any;
  if (!r || typeof r !== 'object' || !r.state || !Array.isArray(r.state.testedHypotheses)) return response;
  const out: any = {
    ...r,
    state: InvestigationEngine.projectPublicState(r.state),
    availableHypotheses: InvestigationEngine.getPublicHypotheses(r.state)
  };
  if (r.falseCluePlanted) {
    out.falseCluePlanted = { ...r.falseCluePlanted, plantedByHypothesis: InvestigationEngine.hypothesisAlias(r.falseCluePlanted.plantedByHypothesis) };
  }
  return out;
}

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

    // lista blanca: el expediente sin culpables ni modelo de verdad (sólo lo que el personaje sabe)
    const caseInstances = db.getCharacterCaseInstances(characterId).map(inst => {
      const state = JSON.parse(inst.state_json) as InvestigationCaseState;
      return {
        id: inst.id,
        caseId: inst.case_id,
        title: state.title,
        status: inst.status,
        cluesFound: state.discoveredClues.length,
        resolution: state.resolvedState ? { nombre: state.resolvedState.nombre } : null
      };
    });

    return reply.send({ characterId, caseInstances });
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
        caseState: InvestigationEngine.projectPublicState(state),
        availableHypotheses: InvestigationEngine.getPublicHypotheses(state),
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
      // Un caso ya cerrado no se reabre al consultarlo: si la última instancia no está activa (resuelta),
      // se devuelve tal cual. Sólo sin historial se activa el caso autoral.
      // GET nunca muta: sin caso abierto se responde vacío y el cliente lo abre con POST /case/activate
      const latest = db.getCharacterCaseInstances(characterId).find((i: any) => i.case_id === 'CASE_CHERWOOD_HEIRLOOM');
      if (!latest) {
        return reply.status(200).send({ success: true, caseState: null, availableHypotheses: [], availableResolutions: [] });
      }
      const activeState: InvestigationCaseState = JSON.parse(latest.state_json);
      const publicMeta = InvestigationEngine.getPublicCaseMetadata();
      return reply.status(200).send({
        success: true,
        caseState: InvestigationEngine.projectPublicState(activeState),
        availableHypotheses: InvestigationEngine.getPublicHypotheses(activeState),
        availableResolutions: activeState.resolutionUnlocked && activeState.status === 'ACTIVE' ? publicMeta.resolutions : []
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
      ...publicCase(processed.response),
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
      ...publicCase(processed.response),
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
          return InvestigationEngine.submitHypothesis(db, instanceId, InvestigationEngine.resolveHypothesisId(hypothesisId));
        } catch (err: any) {
          throw new DomainRuleViolationError(err.message || 'Error al someter hipótesis');
        }
      }
    );

    return reply.send({
      ...publicCase(processed.response),
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
      ...publicCase(processed.response),
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
      ...publicCase(processed.response),
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
      ...publicCase(processed.response),
      fromReceipt: processed.fromReceipt,
      revision: processed.revision
    });
  });
};
