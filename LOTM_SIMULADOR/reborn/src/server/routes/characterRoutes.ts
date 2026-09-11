import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { DatabaseClient } from '../../infra/database/DatabaseClient.js';
import { CanonicalDataLoader } from '../../infra/data/CanonicalDataLoader.js';
import { SomaticsEngine } from '../../core/somatics/SomaticsEngine.js';

const CreateCharacterSchema = z.object({
  name: z.string().min(2).max(40),
  pathway: z.string(),
  startingCity: z.string().default('Backlund - Distrito de Cherwood'),
  background: z.string().default('Detective Privado'),
  socialClass: z.enum(['POOR', 'WORKING_CLASS', 'MIDDLE_CLASS', 'ARISTOCRAT']).default('MIDDLE_CLASS')
});

export const characterRoutes: FastifyPluginAsync<{ db: DatabaseClient; loader: CanonicalDataLoader }> = async (
  fastify: FastifyInstance,
  opts
) => {
  const { db, loader } = opts;

  // POST /api/character/new
  fastify.post('/new', async (req, reply) => {
    const parseRes = CreateCharacterSchema.safeParse(req.body);
    if (!parseRes.success) {
      return reply.status(400).send({ error: 'Datos inválidos', details: parseRes.error.format() });
    }

    const { name, pathway, startingCity, background, socialClass } = parseRes.data;

    let canonicalPathwayId;
    try {
      canonicalPathwayId = loader.resolvePathwayId(pathway);
    } catch (err: any) {
      return reply.status(400).send({ error: err.message });
    }

    const charId = `char_${Date.now()}`;
    const seqData = loader.getSequenceData(canonicalPathwayId, 9);

    // 1. Crear personaje
    const char = db.createCharacter({
      id: charId,
      name,
      pathway: canonicalPathwayId,
      sequence: 9,
      current_health: 100,
      max_health: 100,
      current_spirituality: 100,
      max_spirituality: 100,
      sanity: 95,
      corruption: 0,
      digestion_progress: 10.0,
      raw_pence: 7200, // £30 libras
      current_location: startingCity,
      current_day: 1
    });

    // 2. Crear Persona civil (Doble vida)
    const persona = db.createPersona({
      id: `persona_${charId}`,
      character_id: charId,
      legal_name: name,
      profession: background,
      social_class: socialClass,
      district: startingCity,
      police_suspicion: 5,
      church_suspicion: 5,
      human_anchors: 40,
      is_active: 1,
      is_compromised: 0
    });

    // 3. Crear las 6 anclas iniciales canónicas de origen y plantilla (HUMAN_REVIEW)
    SomaticsEngine.initializeCharacterAnchors(db, charId);

    // 4. Añadir ingredientes o pertenencias de inicio en inventario
    db.addItem({
      id: `item_${charId}_revolver`,
      character_id: charId,
      item_code: 'ITEM_REVOLVER',
      name: 'Revólver de Caza con 6 Balas de Plata',
      category: 'WEAPON',
      grade: null,
      quantity: 1,
      metadata_json: '{"damage": 25, "spiritual": true}',
      is_equipped: 1
    });

    db.addItem({
      id: `item_${charId}_tea`,
      character_id: charId,
      item_code: 'ITEM_SOOTHING_TEA',
      name: 'Té Calmante de Menta y Hierba de Luna',
      category: 'CONSUMABLE',
      grade: null,
      quantity: 3,
      metadata_json: '{"sanityRestore": 15}',
      is_equipped: 0
    });

    const somaticsEval = SomaticsEngine.evaluate({
      currentHealth: char.current_health,
      maxHealth: char.max_health,
      currentSpirituality: char.current_spirituality,
      maxSpirituality: char.max_spirituality,
      sanity: char.sanity,
      corruption: char.corruption,
      digestionProgress: char.digestion_progress,
      anchorStrength: 40
    });

    const anchorsList = db.getAnchors(charId);
    const inventoryList = db.getInventory(charId);

    return reply.status(201).send({
      success: true,
      character: char,
      sequenceName: seqData.name,
      activePersona: persona,
      anchors: anchorsList,
      inventory: inventoryList,
      somatics: somaticsEval,
      wallet: {
        pounds: Math.floor(char.raw_pence / 240),
        soli: Math.floor((char.raw_pence % 240) / 12),
        pence: char.raw_pence % 12
      }
    });
  });

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
    const seqData = loader.getSequenceData(char.pathway, char.sequence);

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
      sequenceName: seqData.name,
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

  // POST /api/character/trigger-rampage (Rampage como Evento)
  fastify.post('/trigger-rampage', async (req, reply) => {
    const body = req.body as { characterId: string; reason?: string };
    if (!body?.characterId) {
      return reply.status(400).send({ error: 'characterId requerido' });
    }
    const char = db.getCharacter(body.characterId);
    if (!char) {
      return reply.status(404).send({ error: 'Personaje no encontrado' });
    }
    const eventResult = SomaticsEngine.triggerRampageEvent(db, body.characterId, body.reason || 'SANITY_COLLAPSE');
    return reply.send({ success: true, event: eventResult });
  });

  // POST /api/character/interact-anchor (Regeneración de fuerza de ancla)
  fastify.post('/interact-anchor', async (req, reply) => {
    const body = req.body as { characterId: string; anchorId: string; amount?: number };
    if (!body?.characterId || !body?.anchorId) {
      return reply.status(400).send({ error: 'characterId y anchorId requeridos' });
    }
    const char = db.getCharacter(body.characterId);
    if (!char) {
      return reply.status(404).send({ error: 'Personaje no encontrado' });
    }
    const updated = SomaticsEngine.repairAnchorWeekly(db, body.characterId, body.anchorId, body.amount);
    return reply.send({ success: true, anchor: updated });
  });

  // POST /api/character/advance-day
  fastify.post('/advance-day', async (req, reply) => {
    const body = req.body as { characterId: string; days?: number };
    if (!body?.characterId) {
      return reply.status(400).send({ error: 'characterId requerido' });
    }

    const char = db.getCharacter(body.characterId);
    if (!char) {
      return reply.status(404).send({ error: 'Personaje no encontrado' });
    }

    const days = body.days || 1;
    const newDay = db.advanceCharacterDay(char.id, days);

    // Desgaste mental del Beyonder si la sanidad es baja
    if (newDay % 7 === 0) {
      db.updateCharacterSomatics(char.id, {
        sanity: Math.max(0, char.sanity - 1)
      });
    }

    return reply.send({
      success: true,
      currentDay: newDay,
      message: `El reloj de gas avanza. Las campanas de la Catedral anuncian el Día ${newDay}.`
    });
  });

  // POST /api/character/advance (Ascenso Canónico de Secuencia S9 -> S8 -> S7)
  fastify.post('/advance', async (req, reply) => {
    const body = req.body as { characterId: string };
    if (!body?.characterId) {
      return reply.status(400).send({ error: 'characterId requerido' });
    }

    const char = db.getCharacter(body.characterId);
    if (!char) {
      return reply.status(404).send({ error: 'Personaje no encontrado' });
    }

    if (char.sequence <= 7) {
      return reply.status(400).send({
        error: `Límite canónico alcanzado (Secuencia ${char.sequence}). Las secuencias 6-0 y Dioses están estrictamente congeladas en esta fase.`
      });
    }

    const anchorStrength = db.getTotalAnchorStrength(char.id);
    const somaticsEval = SomaticsEngine.evaluate({
      currentHealth: char.current_health,
      maxHealth: char.max_health,
      currentSpirituality: char.current_spirituality,
      maxSpirituality: char.max_spirituality,
      sanity: char.sanity,
      corruption: char.corruption,
      digestionProgress: char.digestion_progress,
      anchorStrength
    });

    if (!somaticsEval.canSafelyConsumePotion) {
      return reply.status(400).send({
        error: `No es seguro consumir la poción de Secuencia ${char.sequence - 1}: ${somaticsEval.blockers.join(' ')}`
      });
    }

    const nextSeq = char.sequence - 1;
    let nextSeqData;
    try {
      nextSeqData = loader.getSequenceData(char.pathway, nextSeq);
    } catch (err: any) {
      return reply.status(400).send({ error: err.message });
    }

    // Actualizar somática y secuencia
    db.updateCharacterSomatics(char.id, {
      sequence: nextSeq,
      digestion: 0.0,
      spirituality: Math.min(150, char.current_spirituality + 30)
    });

    return reply.send({
      success: true,
      newSequence: nextSeq,
      sequenceName: nextSeqData.name,
      pathway: char.pathway,
      message: `¡Ritual completado con éxito! Has consumido la fórmula de [${nextSeqData.name}] y ascendido a Secuencia ${nextSeq}.`
    });
  });
};

