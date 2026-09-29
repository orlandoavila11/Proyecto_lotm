import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { spawn, execSync } from 'node:child_process';
import { DatabaseClient } from '../src/infra/database/DatabaseClient.js';
import { buildApp } from '../src/server/app.js';

describe('Kill -9 Recovery: Persistencia Transaccional y Restauración Byte-Equivalente', () => {
  it('un proceso abruptamente terminado con kill -9 en pleno combate restaura el estado exacto byte-equivalente', async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lotm_kill9_'));
    const dbPath = path.join(tmpDir, 'combat_kill9.sqlite');
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
      // 2. Esperar a que el servidor esté listo (máximo 10s)
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

      // 3. Crear personaje
      const createRes = await fetch(`${baseUrl}/api/character/new`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Lumian Lee',
          pathway: 'HUNTER',
          startingCity: 'Backlund',
          background: 'Guerrero de Barrio',
          socialClass: 'WORKING_CLASS'
        })
      });
      assert.strictEqual(createRes.status, 201);
      const createData = await createRes.json();
      const charId = createData.character.id;

      // 4. Iniciar combate
      const startRes = await fetch(`${baseUrl}/api/combat/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characterId: charId,
          enemyName: 'Marioneta de Sombras',
          enemyHp: 60
        })
      });
      assert.strictEqual(startRes.status, 200);
      const startData = await startRes.json();
      const battleId = startData.battleId;
      assert.ok(battleId, 'Debe retornar un ID de combate persistido');

      // 5. Ejecutar 1 acción de combate (Tiro de Precisión)
      const actionRes = await fetch(`${baseUrl}/api/combat/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characterId: charId,
          skillId: 'SKILL_HUNTER_9_SNIPE'
        })
      });
      assert.strictEqual(actionRes.status, 200);
      const actionData = await actionRes.json();
      assert.strictEqual(actionData.battleOver, false);

      // 5.b Ejecutar acción de Escudriñar para alterar los sets de opacidad mutua (Directiva f)
      const scrutinizeRes = await fetch(`${baseUrl}/api/combat/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characterId: charId,
          actionType: 'SCRUTINIZE'
        })
      });
      assert.strictEqual(scrutinizeRes.status, 200);
      const scrutinizeData = await scrutinizeRes.json();
      assert.ok(scrutinizeData.player.revealedAbilities.length >= 1, 'Player debe poseer habilidades reveladas');
      assert.ok(scrutinizeData.enemy.revealedAbilities.length >= 1, 'Enemy debe poseer habilidades observadas del player');

      // Snapshot directo de la base de datos antes del kill -9
      const dbInspector = new DatabaseClient(dbPath);
      const battleRowBeforeKill = dbInspector.getBattleById(battleId);
      assert.ok(battleRowBeforeKill, 'El combate debe existir físicamente en SQLite');
      const stateJsonBeforeKill = battleRowBeforeKill.state_json;
      const statusBeforeKill = battleRowBeforeKill.status;
      dbInspector.close();

      // 6. EJECUTAR KILL -9 ABRUPTO (desconexión forzada)
      const childPid = child.pid!;
      if (process.platform === 'win32') {
        execSync(`taskkill /F /PID ${childPid} /T`);
      } else {
        child.kill('SIGKILL');
      }

      // Esperar a que el proceso muera
      await new Promise(r => setTimeout(r, 500));

      // 7. Arrancar NUEVO servidor independiente conectándose a la misma base de datos SQLite
      const { app: recoveredApp, db: recoveredDb } = await buildApp({ dbPath });

      // 8. Consultar el estado activo del combate restaurado
      const restoreRes = await recoveredApp.inject({
        method: 'GET',
        url: `/api/combat/active/${charId}`
      });

      assert.strictEqual(restoreRes.statusCode, 200, 'El combate activo debe ser restaurado');
      const restoredData = JSON.parse(restoreRes.body);

      // Verificar campos semánticos y opacidad mutua (Directiva f)
      assert.strictEqual(restoredData.battleId, battleId);
      assert.strictEqual(restoredData.status, 'ONGOING');
      assert.strictEqual(restoredData.player.currentSpirituality, 90); // 100 - 10
      assert.strictEqual(restoredData.enemy.currentHp, 35); // 60 - 25
      assert.deepStrictEqual(restoredData.player.revealedAbilities, scrutinizeData.player.revealedAbilities, 'revealedAbilities de player debe ser idéntico');
      assert.deepStrictEqual(restoredData.enemy.revealedAbilities, scrutinizeData.enemy.revealedAbilities, 'revealedAbilities de enemy debe ser idéntico');

      // 9. VERIFICACIÓN BYTE-EQUIVALENTE de SQLite (incluyendo sets de opacidad)
      const restoredRow = recoveredDb.getBattleById(battleId);
      assert.ok(restoredRow, 'La fila restaurada debe existir');
      assert.strictEqual(restoredRow.status, statusBeforeKill, 'El estado ONGOING debe coincidir exactamente');
      assert.strictEqual(restoredRow.state_json, stateJsonBeforeKill, 'El JSON del estado (incluyendo opacidad mutua) debe ser 100% BYTE-EQUIVALENTE');

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

      // Eliminar archivos temporales
      try {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      } catch {}
    }
  });
});
