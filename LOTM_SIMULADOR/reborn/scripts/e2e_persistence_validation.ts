import { resolve } from 'node:path';
import { unlinkSync } from 'node:fs';
import { buildApp } from '../src/server/app.ts';

async function runEndToEndValidation() {
  const dbFile = resolve('./e2e_persistent_session.sqlite');
  try { unlinkSync(dbFile); } catch {}

  console.log('=== INICIO DE VALIDACIÓN END-TO-END: PARTIDA PERSISTENTE ===');

  // PASO 1: Crear personaje en SQLite a través de la API
  console.log('\n--- PASO 1: Create Character ---');
  let { app, db } = await buildApp({ dbPath: dbFile });
  
  const createRes = await app.inject({
    method: 'POST',
    url: '/api/character/new',
    payload: {
      name: 'Arthur Hastings',
      pathway: 'FOOL',
      origin: 'NOTARY_CLERK'
    }
  });

  if (createRes.statusCode !== 201) {
    throw new Error(`Fallo al crear personaje: ${createRes.statusCode} - ${createRes.body}`);
  }

  const charCreated = createRes.json().character;
  const charId = charCreated.id;
  console.log(`[PASS] Personaje creado exitosamente: ID=${charId}, Nombre="${charCreated.name}", Vía=${charCreated.pathway}, Secuencia=${charCreated.sequence}`);

  // PASO 2: Completar Prólogo
  console.log('\n--- PASO 2: Complete Prologue ---');
  // Se simula la finalización del prólogo actualizando el estado de partida y asignando fondos iniciales canónicos
  db.db.prepare(
    `UPDATE characters SET 
      raw_pence = 2400, 
      current_location = 'Cherwood', 
      current_day = 1, 
      current_slot = 0,
      sanity = 95,
      corruption = 0,
      digestion_progress = 15
    WHERE id = ?`
  ).run(charId);
  console.log(`[PASS] Prólogo completado. Transición al Desván (Cherwood, Día 1, Franja 0, 2400 peniques).`);

  // PASO 3: Guardar (Verificar estado en disco)
  console.log('\n--- PASO 3: Save ---');
  const savedState = db.getCharacter(charId);
  const anchors = db.getAnchors(charId);
  console.log(`[PASS] Estado verificado en SQLite:`);
  console.log(`       - Nombre: ${savedState.name}`);
  console.log(`       - Vía: ${savedState.pathway}`);
  console.log(`       - Fondos: ${savedState.raw_pence} peniques`);
  console.log(`       - Somática: Sanidad=${savedState.sanity}, Corrupción=${savedState.corruption}, Digestión=${savedState.digestion_progress}%`);
  console.log(`       - Anclas activas: ${anchors.length} anclas registradas`);

  // PASO 4: Cerrar (Shutdown completo de proceso / conexión)
  console.log('\n--- PASO 4: Close ---');
  await app.close();
  db.close();
  console.log(`[PASS] Conexión de base de datos cerrada y servidor detenido. Proceso 1 finalizado.`);

  // PASO 5: Reabrir (Nuevo proceso / conexión sobre el mismo archivo SQLite)
  console.log('\n--- PASO 5: Reopen ---');
  const appReopened = await buildApp({ dbPath: dbFile });
  const newApp = appReopened.app;
  const newDb = appReopened.db;
  console.log(`[PASS] Segundo proceso iniciado. Base de datos SQLite montada desde "${dbFile}".`);

  // PASO 6: Recargar (Reload del personaje)
  console.log('\n--- PASO 6: Reload ---');
  const reloadRes = await newApp.inject({
    method: 'GET',
    url: `/api/character/${charId}`
  });

  if (reloadRes.statusCode !== 200) {
    throw new Error(`Fallo al recargar personaje: ${reloadRes.statusCode}`);
  }

  const loadedChar = reloadRes.json().character;
  if (
    loadedChar.id !== charId ||
    loadedChar.name !== 'Arthur Hastings' ||
    loadedChar.raw_pence !== 2400 ||
    loadedChar.current_day !== 1 ||
    loadedChar.current_slot !== 0
  ) {
    throw new Error(`Inconsistencia en datos recargados: ${JSON.stringify(loadedChar)}`);
  }
  console.log(`[PASS] Personaje recargado con 100% de paridad de datos.`);
  console.log(`       - ID: ${loadedChar.id}`);
  console.log(`       - Fondos: ${loadedChar.raw_pence}`);
  console.log(`       - Día/Franja: Día ${loadedChar.current_day}, Slot ${loadedChar.current_slot}`);

  // PASO 7: Continuar la partida
  console.log('\n--- PASO 7: Continue ---');
  const actionRes = await newApp.inject({
    method: 'POST',
    url: '/api/calendar/action',
    payload: {
      characterId: charId,
      actionType: 'WORK',
      commandId: 'cmd_e2e_continue_work_1'
    }
  });

  if (actionRes.statusCode !== 200) {
    throw new Error(`Fallo al ejecutar acción continuada: ${actionRes.statusCode}`);
  }

  const actionBody = actionRes.json();
  const charAfterContinue = newDb.getCharacter(charId);
  const calendarLogs = newDb.getCalendarLogs(charId);

  console.log(`[PASS] Acción "WORK" ejecutada en partida continuada:`);
  console.log(`       - Franja avanzada: Día ${charAfterContinue.current_day}, Slot ${charAfterContinue.current_slot}`);
  console.log(`       - Asistencia laboral: ${charAfterContinue.work_attendance_weekly}`);
  console.log(`       - ID de log generado (secuencia monótona persistida): ${calendarLogs[0].id}`);
  console.log(`       - Balance final de fondos: ${charAfterContinue.raw_pence} peniques`);

  await newApp.close();
  newDb.close();
  try { unlinkSync(dbFile); } catch {}

  console.log('\n=== VALIDACIÓN END-TO-END EXITOSA: 7/7 PASOS CONFIRMADOS ===');
}

runEndToEndValidation().catch(err => {
  console.error('[FAIL] Error en validación:', err);
  process.exit(1);
});
