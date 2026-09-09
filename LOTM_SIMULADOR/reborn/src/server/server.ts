import * as path from 'node:path';
import { buildApp } from './app.js';

async function startServer() {
  console.clear();
  console.log('================================================================================');
  console.log('       👑 LOTM_ENGINE_REBORN — NÚCLEO ARQUITECTURAL MODULAR (v1.0)              ');
  console.log('================================================================================');
  console.log('   "El misterio no se improvisa; se sostiene sobre piedra, fe y silencio."     ');
  console.log('================================================================================\n');

  const dbFilePath = path.resolve('saves/lotm_reborn.db');
  console.log(`📦 [1/3] Inicializando persistencia relacional SQLite en: ${dbFilePath}`);
  
  const { app, db, loader } = await buildApp({
    dbPath: dbFilePath
  });

  const pathwaysCount = loader.getAllPathways().length;
  console.log(`✨ [2/3] Compendio canónico validado: ${pathwaysCount}/22 Vías Sagradas activas.`);

  const PORT = Number(process.env.PORT) || 3456;
  await app.listen({ port: PORT, host: '0.0.0.0' });
  console.log(`🕯️ [3/3] Servidor Victoriano Fastify escuchando en: \x1b[32mhttp://localhost:${PORT}\x1b[0m\n`);

  console.log('================================================================================');
  console.log('  Endpoints REST activos:');
  console.log('  • GET  /api/health');
  console.log('  • POST /api/character/new');
  console.log('  • GET  /api/character/:id');
  console.log('  • POST /api/character/advance-day');
  console.log('  • GET  /api/acting/dilemma/:characterId');
  console.log('  • POST /api/acting/resolve');
  console.log('  • GET  /api/city/districts');
  console.log('  • POST /api/city/travel');
  console.log('================================================================================\n');

  const shutdown = async () => {
    console.log('\n🕯️ Apagando las luces de gas y cerrando la base de datos relacional...');
    await app.close();
    db.close();
    console.log('✨ Servidor cerrado en paz.');
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

startServer().catch(err => {
  console.error('Error fatal al arrancar LOTM_ENGINE_REBORN:', err);
  process.exit(1);
});

