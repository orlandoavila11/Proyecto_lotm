import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageRoot = path.resolve(__dirname, '..');
const srcDir = path.join(packageRoot, 'src');

function scanDirectory(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      scanDirectory(fullPath, fileList);
    } else if (file.endsWith('.ts') || file.endsWith('.js')) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

function checkAntiMathRandom() {
  console.log('=== CI CHECK: ANTI-MATH.RANDOM (DETERMINISMO ESTRICTO) ===');
  const files = scanDirectory(srcDir);
  const violations: { file: string; line: number; text: string }[] = [];

  const randomPattern = /\bMath\.random\s*\(/;

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (randomPattern.test(line)) {
        violations.push({
          file: path.relative(packageRoot, file),
          line: i + 1,
          text: line.trim()
        });
      }
    }
  }

  if (violations.length > 0) {
    console.error(`\n❌ FALLO DE DETERMINISMO: Se detectaron ${violations.length} violaciones de Math.random() en reborn/src:\n`);
    for (const v of violations) {
      console.error(`  - ${v.file}:${v.line} -> ${v.text}`);
    }
    console.error('\nRegla de la Tercera Huelga: Math.random() está terminantemente prohibido en el motor.');
    console.error('Utilice SeededRNG o generateDeterministicId() de reborn/src/core/rng/.\n');
    process.exit(1);
  }

  console.log(`✅ [PASS] 0 violaciones detectadas en ${files.length} archivos escaneados de reborn/src.\n`);
}

checkAntiMathRandom();
