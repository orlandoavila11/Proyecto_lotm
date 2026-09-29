import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { spawn, execSync } from 'node:child_process';
import { DatabaseClient } from '../src/infra/database/DatabaseClient.js';
import { buildApp } from '../src/server/app.js';

describe('Kill -9 Recovery: Persistencia Transaccional de Investigaciones y Restauración Byte-Equivalente', () => {
  it('un proceso abruptamente terminado con kill -9 a mitad de una investigación restaura el estado exacto byte-equivalente', async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lotm_investigation_kill9_'));
    const dbPath = path.join(tmpDir, 'investigation_kill9.sqlite');
    const readyFile = path.join(tmpDir, 'server_ready.json');
    const helperScript = path.resolve('tests/helpers/kill9_server.ts');

    // 1. Arrancar el proceso de servidor primario en segundo plano usando node directamente
    const child = spawn(process.execPath, ['--import', 'tsx', helperScript], {
      cwd: path.resolve('.'),
      env: {
        ...process.env,
        TEST_DB_PATH: dbPath,
        TEST_READY_FILE: readyFile
      },
      stdio: 'pipe'
    });

    try {
      // 2. Esperar a que el servidor esté listo
      let port = 0;
      const startTime = Date.now();
      while (Date.now() - startTime < 10000) {
        if (fs.existsSync(readyFile)) {
          const raw = fs.readFileSync(readyFile, 'utf-8');
          try {
            const info = JSON.parse(raw);
            if (info.port) {
              port = info.port;
              break;
            }
          } catch {}
        }
        await new Promise(r => setTimeout(r, 100));
      }

      assert.ok(port > 0, 'El servidor de prueba debe arrancar y reportar su puerto');
      const baseUrl = `http://127.0.0.1:${port}`;

      // 3. Crear personaje FOOL
      const createRes = await fetch(`${baseUrl}/api/character/new`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Sherlock Moriarty',
          pathway: 'FOOL',
          startingCity: 'Backlund',
          background: 'Detective Consultor',
          socialClass: 'MIDDLE_CLASS'
        })
      });
      assert.strictEqual(createRes.status, 201);
      const createData = await createRes.json();
      const charId = createData.character.id;

      // 4. Activar Caso #1 "El Eco en el Nido Vacío"
      const activateRes = await fetch(`${baseUrl}/api/investigation/case/activate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characterId: charId,
          caseId: 'CASE_CHERWOOD_HEIRLOOM'
        })
      });
      assert.strictEqual(activateRes.status, 200);
      const activateData = await activateRes.json();
      const instanceId = activateData.caseState.id;
      assert.ok(instanceId, 'Debe devolver un instanceId válido');

      // 5. Visitar fuente para descubrir CLUE_WILL_DRAFT
      const visitRes = await fetch(`${baseUrl}/api/investigation/clue/visit-source`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instanceId,
          clueId: 'CLUE_WILL_DRAFT',
          sourceIndex: 0 // DESPACHO_PRIVADO_MANSION_STERLING
        })
      });
      assert.strictEqual(visitRes.status, 200);
      const visitData = await visitRes.json();
      assert.strictEqual(visitData.success, true);
      assert.strictEqual(visitData.clue.id, 'CLUE_WILL_DRAFT');

      // 6. Conectar pistas (CLUE_BURNED_TOYS + CLUE_WILL_DRAFT con 'explica')
      const connectRes = await fetch(`${baseUrl}/api/investigation/clues/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instanceId,
          clueA: 'CLUE_BURNED_TOYS',
          clueB: 'CLUE_WILL_DRAFT',
          relation: 'explica'
        })
      });
      assert.strictEqual(connectRes.status, 200);
      const connectData = await connectRes.json();
      assert.strictEqual(connectData.isCorrect, true);

      // 7. Ejecutar verbo de vía: Radiestesia de péndulo
      const divRes = await fetch(`${baseUrl}/api/investigation/pathway/divination`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instanceId,
          mode: 'PENDULUM',
          targetClueId: 'CLUE_CONCEALED_SAFE'
        })
      });
      assert.strictEqual(divRes.status, 200);

      // Snapshot directo de la base de datos antes del kill -9
      const dbInspector = new DatabaseClient(dbPath);
      const rowBeforeKill = dbInspector.getCaseInstance(instanceId);
      assert.ok(rowBeforeKill, 'La instancia del caso debe existir físicamente en SQLite');
      const stateJsonBeforeKill = rowBeforeKill.state_json;
      const statusBeforeKill = rowBeforeKill.status;
      dbInspector.close();

      // 8. EJECUTAR KILL -9 ABRUPTO (desconexión forzada)
      const childPid = child.pid!;
      if (process.platform === 'win32') {
        execSync(`taskkill /F /PID ${childPid} /T`);
      } else {
        child.kill('SIGKILL');
      }

      // Esperar a que el proceso muera
      await new Promise(r => setTimeout(r, 500));

      // 9. Arrancar NUEVO servidor independiente conectándose a la misma base de datos SQLite
      const { app: recoveredApp, db: recoveredDb } = await buildApp({ dbPath });

      // 10. Consultar las instancias de investigación restauradas mediante la API
      const casesRes = await recoveredApp.inject({
        method: 'GET',
        url: `/api/investigation/cases/${charId}`
      });
      assert.strictEqual(casesRes.statusCode, 200);
      const casesData = JSON.parse(casesRes.body);

      assert.ok(casesData.caseInstances.length >= 1, 'Debe restaurar al menos una instancia de caso');
      const restoredCase = casesData.caseInstances.find((c: any) => c.id === instanceId);
      assert.ok(restoredCase, 'El caso activo debe haber sido recuperado');
      assert.strictEqual(restoredCase.status, 'ACTIVE');

      const restoredState = restoredCase.state;
      assert.strictEqual(restoredState.id, instanceId);
      assert.strictEqual(restoredState.discoveredClues.length, 2); // CLUE_BURNED_TOYS + CLUE_WILL_DRAFT
      assert.strictEqual(restoredState.connectedEdges.length, 1);
      assert.strictEqual(restoredState.connectedEdges[0].relation, 'explica');
      assert.ok(restoredState.unsealedConcealedClues.includes('CLUE_CONCEALED_SAFE'));

      // 11. VERIFICACIÓN BYTE-EQUIVALENTE de SQLite
      const restoredRow = recoveredDb.getCaseInstance(instanceId);
      assert.ok(restoredRow, 'La fila restaurada debe existir en la base de datos');
      assert.strictEqual(restoredRow.status, statusBeforeKill, 'El status ACTIVE debe ser idéntico');
      assert.strictEqual(restoredRow.state_json, stateJsonBeforeKill, 'El JSON del estado de investigación debe ser 100% BYTE-EQUIVALENTE tras kill -9');

      // Limpieza de servidores
      recoveredDb.close();
      await recoveredApp.close();
    } finally {
      try {
        if (child.pid && !child.killed) {
          if (process.platform === 'win32') {
            try { execSync(`taskkill /F /PID ${child.pid} /T`, { stdio: 'ignore' }); } catch {}
          } else {
            child.kill('SIGKILL');
          }
        }
      } catch {}

      // Eliminar directorio temporal
      try {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      } catch {}
    }
  });
});

