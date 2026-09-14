import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageRoot = path.resolve(__dirname, '..');
const workspaceRoot = path.resolve(packageRoot, '..');
const uiSrcDir = path.join(workspaceRoot, 'ui', 'src');

function scanDirectory(dir: string, fileList: string[] = []): string[] {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      scanDirectory(fullPath, fileList);
    } else if (file.endsWith('.tsx') || (file.endsWith('.ts') && !file.endsWith('.d.ts'))) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

interface Violation {
  file: string;
  line: number;
  text: string;
  pattern: string;
}

function checkDiegeticUi() {
  console.log('=== CI CHECK: AUDIT ANTI-MECÁNICO DE UI DIEGÉTICA (LEY DE PROSA DIEGÉTICA) ===');
  
  const filesToScan: string[] = [];
  
  // Escanear ui/src/features y ui/src/App.tsx
  const featuresDir = path.join(uiSrcDir, 'features');
  if (fs.existsSync(featuresDir)) {
    scanDirectory(featuresDir, filesToScan);
  }
  
  const appTsx = path.join(uiSrcDir, 'App.tsx');
  if (fs.existsSync(appTsx)) {
    filesToScan.push(appTsx);
  }

  const antiDiegeticRules: { pattern: RegExp; description: string }[] = [
    { pattern: /Ruina\s*:\s*\d+/i, description: 'Mención mecánica de Ruina con valor numérico' },
    { pattern: /Sanidad\s*:\s*\d+/i, description: 'Mención mecánica de Sanidad con valor numérico' },
    { pattern: /Corrupci[oó]n\s*:\s*\d+/i, description: 'Mención mecánica de Corrupción con valor numérico' },
    { pattern: /\b(HP|MP)\b\s*[:/]\s*\d+/i, description: 'Indicador mecánico de HP/MP' },
    { pattern: /\bVida\s*:\s*\d+/i, description: 'Mención numérica explícita de Vida' },
    { pattern: /\bEspiritualidad\s*:\s*\d+/i, description: 'Mención numérica explícita de Espiritualidad' },
    { pattern: /[+-]\s*\d+\s*(HP|MP|Sanidad|Ruina|Corrupci[oó]n)/i, description: 'Modificador numérico visible de atributo' },
    { pattern: /Digesti[oó]n\s*:\s*\d+%/i, description: 'Porcentaje explícito de Digestión de poción' },
    { pattern: /Probabilidad\s*:\s*\d+%/i, description: 'Porcentaje matemático visible de probabilidad' },
    { pattern: /\d+%\s*(éxito|fallo|riesgo|digestión)/i, description: 'Cálculo de porcentaje explícito expuesto al jugador' },
    { pattern: /Secuencia\s*\d+\s*\(\d+%\)/i, description: 'Progreso de secuencia expresado en porcentaje numérico' }
  ];

  const violations: Violation[] = [];

  for (const file of filesToScan) {
    const content = fs.readFileSync(file, 'utf-8');
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Ignorar comentarios puros
      const trimmed = line.trim();
      if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
        continue;
      }

      for (const rule of antiDiegeticRules) {
        if (rule.pattern.test(line)) {
          violations.push({
            file: path.relative(workspaceRoot, file),
            line: i + 1,
            text: trimmed,
            pattern: rule.description
          });
        }
      }
    }
  }

  if (violations.length > 0) {
    console.error(`\n❌ FALLO DE PROSA DIEGÉTICA: Se detectaron ${violations.length} violaciones mecánicas en la UI:\n`);
    for (const v of violations) {
      console.error(`  - ${v.file}:${v.line} -> [${v.pattern}]`);
      console.error(`    "${v.text}"\n`);
    }
    console.error('Ley de Prosa Diegética (§0.a BRIEF-10): Está estrictamente prohibido exponer números');
    console.error('o estadísticas mecánicas en las cadenas de texto visibles al jugador.');
    console.error('Utilice descripciones en prosa victoriana y metáforas de objetos sobre la mesa.\n');
    process.exit(1);
  }

  console.log(`✅ [PASS] 0 violaciones detectadas en ${filesToScan.length} archivos escaneados de la UI diegética.\n`);
}

checkDiegeticUi();
