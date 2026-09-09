import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { DatabaseClient } from '../../infra/database/DatabaseClient.js';

const TravelSchema = z.object({
  characterId: z.string(),
  destinationDistrict: z.string()
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

    return reply.send({ districts: enrichedDistricts });
  });

  // POST /api/city/travel
  fastify.post('/travel', async (req, reply) => {
    const parseRes = TravelSchema.safeParse(req.body);
    if (!parseRes.success) {
      return reply.status(400).send({ error: 'Datos inválidos', details: parseRes.error.format() });
    }

    const { characterId, destinationDistrict } = parseRes.data;
    const char = db.getCharacter(characterId);
    if (!char) {
      return reply.status(404).send({ error: 'Personaje no encontrado' });
    }

    const rawDb = db.getRawDb();
    rawDb.prepare('UPDATE characters SET current_location = ?, updated_at = datetime(\'now\') WHERE id = ?')
      .run(destinationDistrict, characterId);

    // Costo: 2 chelines (24 peniques)
    db.updateCharacterWealth(characterId, -24);

    // Posible encuentro de viaje
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
      travelEncounter = travelAtmosphere[Math.floor(Math.random() * travelAtmosphere.length)];
    }

    return reply.send({
      success: true,
      newLocation: destinationDistrict,
      encounter: travelEncounter,
      message: `Has tomado un carruaje de alquiler hacia [${destinationDistrict}]. (Tarifa: 2s) ${travelEncounter}`
    });
  });
};

