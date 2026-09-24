import { test, describe } from 'node:test';
import * as assert from 'node:assert';
import * as path from 'node:path';
import * as fs from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distAppPath = path.resolve(__dirname, '../dist/server/app.js');
const distMigrationsPath = path.resolve(__dirname, '../dist/infra/database/migrations');

describe('F01: Dist Packaging and Startup Smoke Test', () => {
  test('migrations directory exists in dist output', () => {
    assert.strictEqual(
      fs.existsSync(distMigrationsPath),
      true,
      'dist/infra/database/migrations must exist after build'
    );
    const sqlFiles = fs.readdirSync(distMigrationsPath).filter(f => f.endsWith('.sql'));
    assert.ok(sqlFiles.length >= 8, 'dist migrations must contain all SQL migration files');
  });

  test('compiled dist app boots and responds to /api/health', async () => {
    if (!fs.existsSync(distAppPath)) {
      return;
    }
    const { buildApp } = await import(pathToFileURL(distAppPath).href);
    const { app, db } = await buildApp();
    try {
      const res = await app.inject({ method: 'GET', url: '/api/health' });
      assert.strictEqual(res.statusCode, 200);
      const body = res.json();
      assert.strictEqual(body.status, 'ok');
      assert.strictEqual(body.engine, 'LOTM_ENGINE_REBORN');
    } finally {
      await app.close();
      db.close();
    }
  });
});
