/**
 * VERIFICADOR PERMANENTE DE INTEGRIDAD TIER L
 * Path to Godhood (LOTM_ENGINE_REBORN)
 * 
 * Recalcula los hashes SHA-256 de los 67 archivos de contenido contra manifest.json v1.1.
 * Falla con exit code 1 si existe cualquier mismatch de hash, archivo faltante o discrepancia de tamaño.
 */
const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

const packageRoot = path.resolve(__dirname, '..');
const manifestPath = path.join(packageRoot, 'data', 'content', 'manifest.json');

if (!fs.existsSync(manifestPath)) {
  console.error(`[ERROR] Manifest no encontrado en: ${manifestPath}`);
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

if (!manifest.manifestVersion || manifest.manifestVersion !== '2.0') {
  console.error(`[ERROR] Versión inesperada de manifest: ${manifest.manifestVersion} (se esperaba 2.0)`);
  process.exit(1);
}

let checked = 0;
let errors = [];

for (const [catName, cat] of Object.entries(manifest.categories)) {
  for (const f of cat.files) {
    if (f.tier !== 'L') {
      errors.push({ file: f.destinationPath, error: 'INVALID_TIER', expected: 'L', actual: f.tier });
      continue;
    }

    if (!f.consumerSystem) {
      errors.push({ file: f.destinationPath, error: 'MISSING_CONSUMER_SYSTEM' });
      continue;
    }

    if (!f.validationState) {
      errors.push({ file: f.destinationPath, error: 'MISSING_VALIDATION_STATE' });
      continue;
    }

    const fullPath = path.resolve(packageRoot, '..', f.destinationPath);
    if (!fs.existsSync(fullPath)) {
      errors.push({ file: f.destinationPath, error: 'FILE_NOT_FOUND' });
      continue;
    }

    const buf = fs.readFileSync(fullPath);
    if (buf.length !== f.sizeBytes) {
      errors.push({
        file: f.destinationPath,
        error: 'SIZE_MISMATCH',
        expected: f.sizeBytes,
        actual: buf.length
      });
      continue;
    }

    const sha = crypto.createHash('sha256').update(buf).digest('hex');
    if (sha !== f.sha256) {
      errors.push({
        file: f.destinationPath,
        error: 'SHA256_MISMATCH',
        expected: f.sha256,
        actual: sha
      });
      continue;
    }

    checked++;
  }
}

if (errors.length > 0) {
  console.error(`[FAIL] Verificación Tier L falló con ${errors.length} error(es):`);
  console.error(JSON.stringify(errors, null, 2));
  process.exit(1);
}

console.log(`[PASS] Tier L verificado: ${checked}/67 archivos íntegros (SHA-256 + tamaño exacto).`);
process.exit(0);

