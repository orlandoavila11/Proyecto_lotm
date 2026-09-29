import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { DatabaseClient } from '../../infra/database/DatabaseClient.js';
import { SeededRNG } from '../../core/rng/SeededRNG.js';
import { CommandProcessor } from '../../infra/database/CommandProcessor.js';
import { EntityNotFoundError, DomainRuleViolationError } from '../../core/errors/DomainError.js';
import { EconomyEngine } from '../../core/economy/EconomyEngine.js';

const TravelSchema = z.object({
  characterId: z.string(),
  destinationDistrict: z.string(),
  consumeSlot: z.boolean().optional().default(false),
  commandId: z.string().optional(),
  expectedRevision: z.number().int().optional()
});

export const cityRoutes: FastifyPluginAsync<{ db: DatabaseClient }> = async (
  fastify: FastifyInstance,
  opts
) => {
  const { db } = opts;

  // GET /api/city/districts
  fastify.get('/districts', async (req, reply) => {
    const rawDistricts = db.getDistricts();
    const enrichedDistricts = rawDistricts.map((d: any) => {
      const tension = d.tension_level ?? 15;
      let dangerRank = 'BAJO';
      if (tension > 40) dangerRank = 'CRÍTICO';
      else if (tension > 25) dangerRank = 'ALTO';
      else if (tension > 15) dangerRank = 'MEDIO';

      let landmark = 'Comisaría de Policía de Backlund';
      let smog = 'Moderado';
      let desc = 'Callejones victorianos adoquinados bajo farolas de gas.';

      if (d.id === 'DIST_CHERWOOD' || d.district_name?.includes('Cherwood')) {
        landmark = 'Club de Adivinación (Calle Williams)';
        smog = 'Smog Amarillo de Carbón';
        desc = 'Hogar de la clase media, abogados, boticarios y detectives privados.';
      } else if (d.id === 'DIST_EAST_BOROUGH' || d.district_name?.includes('Este')) {
        landmark = 'Taberna del Perro Negro & Muelles';
        smog = 'Hollín Tóxico Asfixiante';
        desc = 'Bajos fondos, obreros explotados, criminales de poca monta y sectas oscuras.';
      } else if (d.id === 'DIST_QUEEN' || d.district_name?.includes('Reina')) {
        landmark = 'Catedral de San Samuel & Palacios Reales';
        smog = 'Bruma Fina Filtrada';
        desc = 'Mansiones de la nobleza de Loen custodiadas por los Halcones Nocturnos de la Noche.';
      } else if (d.id === 'DIST_BRIDGE' || d.district_name?.includes('Puente')) {
        landmark = 'Mercado Negro del Puente de Backlund';
        smog = 'Vaho de Calderas y Niebla del Támesis';
        desc = 'Foco neurálgico de intercambio comercial y artefactos místicos clandestinos.';
      } else if (d.id === 'DIST_BAYAM' || d.district_name?.includes('Bayam')) {
        landmark = 'Campanario del Señor de las Tormentas';
        smog = 'Brisa Salina y Olor a Pólvora';
        desc = 'Archipiélago colonial de Rorsted; piratas, rebeldes nativos y tabernas portuarias.';
      }

      return {
        ...d,
        name: d.district_name || d.name || 'Distrito de Backlund',
        district_name: d.district_name || d.name || 'Distrito de Backlund',
        tension_level: tension,
        danger_rank: dangerRank,
        smog_level: smog,
        landmark,
        description: desc
      };
    });

    return reply.send({
      districts: enrichedDistricts,
      carriageFarePence: EconomyEngine.getEconomyBalance().travel.carriageFarePence
    });
  });

  // POST /api/city/travel
  fastify.post('/travel', async (req, reply) => {
    const parseRes = TravelSchema.safeParse(req.body);
    if (!parseRes.success) {
      return reply.status(400).send({ error: 'Datos inválidos', details: parseRes.error.format() });
    }

    const { characterId, destinationDistrict, consumeSlot, commandId, expectedRevision } = parseRes.data;

    const processed = CommandProcessor.execute(
      db,
      {
        commandId,
        characterId,
        commandType: 'CITY_TRAVEL',
        payload: { destinationDistrict, consumeSlot },
        expectedRevision
      },
      () => {
        const char = db.getCharacter(characterId);
        if (!char) {
          throw new EntityNotFoundError('Personaje no encontrado');
        }

        // 1. Validar que el destino exista en los distritos autorizados
        const districts = db.getDistricts();
        const norm = destinationDistrict.toLowerCase();
        const targetDistrict = districts.find(
          (d: any) => d.id.toLowerCase() === norm ||
                      d.district_name.toLowerCase() === norm ||
                      d.district_name.toLowerCase().includes(norm) ||
                      (norm.includes('cherwood') && d.id === 'DIST_CHERWOOD') ||
                      (norm.includes('este') && d.id === 'DIST_EAST_BOROUGH') ||
                      (norm.includes('reina') && d.id === 'DIST_QUEEN') ||
                      (norm.includes('puente') && d.id === 'DIST_BRIDGE') ||
                      (norm.includes('bayam') && d.id === 'DIST_BAYAM')
        );

        if (!targetDistrict) {
          throw new DomainRuleViolationError(`Destino [${destinationDistrict}] no reconocido en las rutas de carruaje de Backlund.`);
        }

        // 2. Validar transición permitida (no viajar al mismo distrito en el que ya se encuentra)
        const currentLoc = char.current_location || 'DIST_CHERWOOD';
        if (currentLoc === destinationDistrict || currentLoc === targetDistrict.id) {
          throw new DomainRuleViolationError(`Ya te encuentras en ${targetDistrict.district_name || targetDistrict.id}.`);
        }

        // 3. Validar asequibilidad (tarifa del balance centralizado: economy.json → travel)
        const CARRIAGE_FARE = EconomyEngine.getEconomyBalance().travel.carriageFarePence;
        if (char.raw_pence < CARRIAGE_FARE) {
          throw new DomainRuleViolationError(`Fondos insuficientes para el carruaje de alquiler (tarifa requerida: ${CARRIAGE_FARE} peniques).`);
        }

        const finalLocation = destinationDistrict;
        const rawDb = db.getRawDb();
        rawDb.prepare("UPDATE characters SET current_location = ?, updated_at = datetime('now') WHERE id = ?")
          .run(finalLocation, characterId);

        // Cobro atómico: 2 chelines (24 peniques)
        db.updateCharacterWealth(characterId, -CARRIAGE_FARE);

        // Avance de tiempo opcional/aplicable
        let timeAdvanced = false;
        let newSlot = char.current_slot ?? 0;
        let newDay = char.current_day ?? 1;
        if (consumeSlot) {
          const advanced = db.advanceCharacterSlot(characterId, 1);
          timeAdvanced = true;
          newSlot = advanced.slot;
          newDay = advanced.day;
        }

        // Posible encuentro de viaje determinista
        const persona = db.getActivePersona(characterId);
        let travelEncounter = null;
        if (persona && (persona.police_suspicion > 50 || persona.church_suspicion > 50)) {
          travelEncounter = 'Una patrulla de la Policía de Backlund detuvo brevemente tu carruaje en un retén. Mostraste tus credenciales civiles y continuaste sin incidentes mayores.';
        } else {
          const travelAtmosphere = [
            'El cochero fustigó a los caballos a través de la densa niebla de carbón; las campanas de San Samuel resonaban a lo lejos.',
            'Gotas de lluvia ácida repiqueteaban sobre el techo de cuero del carruaje mientras cruzabas la avenida principal.',
            'Un vendedor de periódicos voceaba las últimas noticias sobre la niebla tóxica y los crímenes sin resolver en el Barrio Este.'
          ];
          const travelRng = new SeededRNG(`travel_${characterId}_${targetDistrict.id}_${char.current_day}`);
          travelEncounter = travelAtmosphere[travelRng.nextInt(0, travelAtmosphere.length - 1)];
        }

        return {
          success: true,
          newLocation: finalLocation,
          districtName: targetDistrict.district_name || targetDistrict.id,
          previousLocation: currentLoc,
          farePaidPence: CARRIAGE_FARE,
          remainingPence: char.raw_pence - CARRIAGE_FARE,
          timeAdvanced,
          currentDay: newDay,
          currentSlot: newSlot,
          encounter: travelEncounter,
          message: `Has tomado un carruaje de alquiler hacia [${targetDistrict.district_name || finalLocation}]. ${travelEncounter}`
        };
      }
    );

    return reply.send({
      ...processed.response,
      fromReceipt: processed.fromReceipt,
      revision: processed.revision
    });
  });
};

