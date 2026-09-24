import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(__dirname, '..');

const srcMigrations = path.join(packageRoot, 'src', 'infra', 'database', 'migrations');
const distMigrations = path.join(packageRoot, 'dist', 'infra', 'database', 'migrations');

if (fs.existsSync(srcMigrations)) {
  fs.mkdirSync(distMigrations, { recursive: true });
  const files = fs.readdirSync(srcMigrations);
  for (const file of files) {
    if (file.endsWith('.sql')) {
      fs.copyFileSync(
        path.join(srcMigrations, file),
        path.join(distMigrations, file)
      );
    }
  }
  console.log(`[BUILD] Copiadas ${files.length} migraciones SQL a: ${distMigrations}`);
} else {
  console.warn(`[BUILD WARN] No se encontró directorio de migraciones en: ${srcMigrations}`);
}
