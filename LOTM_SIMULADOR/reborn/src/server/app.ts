import fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import { DatabaseClient } from '../infra/database/DatabaseClient.js';
import { CanonicalDataLoader } from '../infra/data/CanonicalDataLoader.js';
import { characterRoutes } from './routes/characterRoutes.js';
import { actingRoutes } from './routes/actingRoutes.js';
import { cityRoutes } from './routes/cityRoutes.js';

import { combatRoutes } from './routes/combatRoutes.js';
import { investigationRoutes } from './routes/investigationRoutes.js';
import { economyRoutes } from './routes/economyRoutes.js';
import { ascensionRoutes } from './routes/ascensionRoutes.js';
import { prologueRoutes } from './routes/prologueRoutes.js';
import { calendarRoutes } from './routes/calendarRoutes.js';
import { identityRoutes } from './routes/identityRoutes.js';

import { DomainError } from '../core/errors/DomainError.js';

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

  // Global Semantic Error Handler
  app.setErrorHandler((error: unknown, request, reply) => {
    if (error instanceof DomainError) {
      return reply.status(error.statusCode).send({
        error: error.message,
        code: error.errorCode,
        details: error.details ?? null
      });
    }

    const err = error as Record<string, any>;
    if (err && ('validation' in err || err.name === 'ZodError')) {
      return reply.status(400).send({
        error: typeof err.message === 'string' ? err.message : 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: err.validation ?? err.issues ?? null
      });
    }

    request.log.error(error);
    const statusCode = typeof err?.statusCode === 'number' ? err.statusCode : 500;
    const message = typeof err?.message === 'string' ? err.message : 'Internal Server Error';
    return reply.status(statusCode).send({
      error: message,
      code: statusCode >= 500 ? 'INTERNAL_SERVER_ERROR' : 'HTTP_ERROR'
    });
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
  await app.register(economyRoutes, { db });
  await app.register(ascensionRoutes, { db });
  await app.register(prologueRoutes, { db });
  await app.register(calendarRoutes, { db });
  await app.register(identityRoutes, { db });

  return { app, db, loader };
}
