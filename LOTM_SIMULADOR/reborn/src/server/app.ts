import fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import { DatabaseClient } from '../infra/database/DatabaseClient.js';
import { CanonicalDataLoader } from '../infra/data/CanonicalDataLoader.js';
import { characterRoutes } from './routes/characterRoutes.js';
import { actingRoutes } from './routes/actingRoutes.js';
import { cityRoutes } from './routes/cityRoutes.js';

import { combatRoutes } from './routes/combatRoutes.js';
import { investigationRoutes } from './routes/investigationRoutes.js';

export interface AppOptions {
  dbPath?: string;
  dataBasePath?: string;
}

export async function buildApp(options: AppOptions = {}): Promise<{ app: FastifyInstance; db: DatabaseClient; loader: CanonicalDataLoader }> {
  const app = fastify({
    logger: false
  });

  await app.register(cors, {
    origin: '*'
  });

  const db = new DatabaseClient(options.dbPath || ':memory:');
  const loader = CanonicalDataLoader.getInstance(options.dataBasePath);

  // Health check
  app.get('/api/health', async () => {
    return {
      status: 'ok',
      engine: 'LOTM_ENGINE_REBORN',
      version: '1.0.0',
      canonicalPathwaysLoaded: loader.getAllPathways().length,
      districtsCount: db.getDistricts().length
    };
  });

  // Rutas modulares desacopladas
  await app.register(characterRoutes, { prefix: '/api/character', db, loader });
  await app.register(actingRoutes, { prefix: '/api/acting', db, loader });
  await app.register(cityRoutes, { prefix: '/api/city', db });
  await app.register(combatRoutes, { prefix: '/api/combat', db, loader });
  await app.register(investigationRoutes, { prefix: '/api/investigation', db });

  return { app, db, loader };
}
