const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const packageRoot = path.resolve(__dirname, '..');
const canonicalDir = path.join(packageRoot, 'data', 'canonical');
const contentDir = path.join(packageRoot, 'data', 'content');

function getSha256(filePath) {
  const buf = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(buf).digest('hex');
}

function getAllFiles(dir, base = '') {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  for (const item of list) {
    const fullPath = path.join(dir, item);
    const relPath = base ? `${base}/${item}` : item;
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results = results.concat(getAllFiles(fullPath, relPath));
    } else {
      results.push(relPath);
    }
  }
  return results;
}

const canonicalFiles = getAllFiles(canonicalDir);
const contentFiles = getAllFiles(contentDir);

let identical = 0;
let mismatches = [];

for (const rel of canonicalFiles) {
  const cPath = path.join(canonicalDir, rel);
  const cHash = getSha256(cPath);

  let targetContentPath = path.join(contentDir, rel);
  if (!fs.existsSync(targetContentPath)) {
    const baseName = path.basename(rel);
    const match = contentFiles.find(f => path.basename(f) === baseName);
    if (match) {
      targetContentPath = path.join(contentDir, match);
    }
  }

  if (!fs.existsSync(targetContentPath)) {
    mismatches.push({ file: rel, error: 'MISSING_IN_CONTENT' });
    continue;
  }

  const contentHash = getSha256(targetContentPath);
  if (cHash !== contentHash) {
    mismatches.push({ file: rel, error: 'HASH_MISMATCH', canonicalHash: cHash, contentHash });
  } else {
    identical++;
  }
}

console.log(`[BRIEF-02.0] Verificación Canonical vs Content (Tier L):`);
console.log(`  - Total archivos en canonical/: ${canonicalFiles.length}`);
console.log(`  - Idénticos en content/: ${identical}/${canonicalFiles.length}`);
console.log(`  - Discrepancias / Mismatches: ${mismatches.length}`);

if (mismatches.length > 0) {
  console.error('[FAIL] Se encontraron discrepancias entre canonical y content:', mismatches);
  process.exit(1);
} else {
  console.log('[PASS] Verificación completa: 0 divergencias de contenido.');
}
