import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import { DatabaseSync } from 'node:sqlite';
import { MigrationRunner } from '../src/infra/database/MigrationRunner.js';

describe('MigrationRunner: Versionado e Idempotencia', () => {
  it('aplica todas las migraciones en orden y registra versiones en schema_migrations', () => {
    const db = new DatabaseSync(':memory:');
    const runner = new MigrationRunner(db);

    const firstRun = runner.run();
    assert.strictEqual(firstRun.applied.length >= 2, true, 'Debe haber aplicado al menos 2 migraciones iniciales');
    assert.deepStrictEqual(firstRun.alreadyApplied, [], 'La primera corrida no debe tener migraciones previas');

    // Verificar que la tabla schema_migrations tiene registros
    const appliedVersions = runner.getAppliedVersions();
    assert.strictEqual(appliedVersions.has(1), true, 'Migración 1 debe estar registrada');
    assert.strictEqual(appliedVersions.has(2), true, 'Migración 2 debe estar registrada');

    // Verificar que las tablas existen
    const tables = db.prepare(`
      SELECT name FROM sqlite_master WHERE type='table' ORDER BY name ASC
    `).all() as Array<{ name: string }>;
    const tableNames = tables.map(t => t.name);

    assert.strictEqual(tableNames.includes('schema_migrations'), true);
    assert.strictEqual(tableNames.includes('characters'), true);
    assert.strictEqual(tableNames.includes('battles'), true);
    assert.strictEqual(tableNames.includes('districts'), true);

    db.close();
  });

  it('es 100% idempotente: re-ejecutar migraciones en la misma base de datos no modifica el estado ni produce errores', () => {
    const db = new DatabaseSync(':memory:');
    const runner = new MigrationRunner(db);

    // Primera corrida
    const run1 = runner.run();
    assert.strictEqual(run1.applied.length >= 2, true);

    // Snapshot de tablas y registros antes de la segunda corrida
    const tablesBefore = db.prepare(`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name ASC`).all();
    const migrationsBefore = db.prepare(`SELECT * FROM schema_migrations ORDER BY version ASC`).all();

    // Segunda corrida (re-ejecución)
    const run2 = runner.run();
    assert.strictEqual(run2.applied.length, 0, 'La segunda corrida no debe aplicar ninguna migración');
    assert.strictEqual(run2.alreadyApplied.length >= 2, true, 'Todas las migraciones deben ser reportadas como alreadyApplied');

    // Snapshot posterior
    const tablesAfter = db.prepare(`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name ASC`).all();
    const migrationsAfter = db.prepare(`SELECT * FROM schema_migrations ORDER BY version ASC`).all();

    assert.deepStrictEqual(tablesBefore, tablesAfter, 'Las tablas deben ser idénticas');
    assert.deepStrictEqual(migrationsBefore, migrationsAfter, 'El historial de migraciones debe ser idéntico');

    db.close();
  });
});
