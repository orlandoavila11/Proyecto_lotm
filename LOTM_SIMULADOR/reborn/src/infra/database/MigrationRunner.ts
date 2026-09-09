import { DatabaseSync } from 'node:sqlite';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

export interface MigrationRecord {
  version: number;
  name: string;
  sql: string;
}

export class MigrationRunner {
  private db: DatabaseSync;
  private migrationsDir: string;

  constructor(db: DatabaseSync, migrationsDir?: string) {
    this.db = db;
    if (migrationsDir) {
      this.migrationsDir = migrationsDir;
    } else {
      this.migrationsDir = path.join(
        path.dirname(fileURLToPath(import.meta.url)),
        'migrations'
      );
    }
  }

  public initMigrationTable(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        applied_at TEXT NOT NULL
      );
    `);
  }

  public getAppliedVersions(): Set<number> {
    this.initMigrationTable();
    const rows = this.db.prepare('SELECT version FROM schema_migrations ORDER BY version ASC').all() as Array<{ version: number }>;
    return new Set(rows.map(r => r.version));
  }

  public loadMigrations(): MigrationRecord[] {
    if (!fs.existsSync(this.migrationsDir)) {
      throw new Error(`Directorio de migraciones no encontrado: ${this.migrationsDir}`);
    }

    const files = fs.readdirSync(this.migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    const records: MigrationRecord[] = [];

    for (const file of files) {
      const match = file.match(/^(\d+)_(.+)\.sql$/);
      if (!match) continue;

      const version = parseInt(match[1], 10);
      const name = match[2];
      const fullPath = path.join(this.migrationsDir, file);
      const sql = fs.readFileSync(fullPath, 'utf-8');

      records.push({ version, name, sql });
    }

    return records.sort((a, b) => a.version - b.version);
  }

  public run(): { applied: number[]; alreadyApplied: number[] } {
    this.initMigrationTable();
    const appliedVersions = this.getAppliedVersions();
    const allMigrations = this.loadMigrations();

    const newlyApplied: number[] = [];
    const alreadyApplied: number[] = [];

    for (const mig of allMigrations) {
      if (appliedVersions.has(mig.version)) {
        alreadyApplied.push(mig.version);
        continue;
      }

      // Ejecutar migración dentro de transacción
      this.db.exec('BEGIN TRANSACTION;');
      try {
        this.db.exec(mig.sql);
        const stmt = this.db.prepare('INSERT INTO schema_migrations (version, name, applied_at) VALUES (?, ?, datetime(\'now\'))');
        stmt.run(mig.version, mig.name);
        this.db.exec('COMMIT;');
        newlyApplied.push(mig.version);
      } catch (err) {
        this.db.exec('ROLLBACK;');
        throw new Error(`Fallo ejecutando migración ${mig.version}_${mig.name}: ${(err as Error).message}`);
      }
    }

    return {
      applied: newlyApplied,
      alreadyApplied
    };
  }
}
