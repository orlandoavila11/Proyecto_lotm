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
  console.log('=== CI CHECK: AUDIT ANTI-MECÁNICO Y LEY DEL OBJETO (BRIEF-10.VISUAL) ===');
  
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

  // 1. Audit Anti-Mecánico
  for (const file of filesToScan) {
    const content = fs.readFileSync(file, 'utf-8');
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
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

  // 2. Audit de Texto en Reposo (Ley del Objeto §14): etiquetas en reposo <= 7 palabras
  const restingLabelPattern = /(?:title\s*=\s*["'`]([^"'`]+)["'`]|labelBrief\s*:\s*["'`]([^"'`]+)["'`])/g;
  for (const file of filesToScan) {
    // Solo auditar archivos del escritorio y sus objetos
    if (!file.includes('desk') && !file.includes('objects')) continue;

    const content = fs.readFileSync(file, 'utf-8');
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      let match;
      while ((match = restingLabelPattern.exec(line)) !== null) {
        const text = (match[1] || match[2] || '').trim();
        const words = text.split(/\s+/).filter(w => w.length > 0);
        if (words.length > 7) {
          violations.push({
            file: path.relative(workspaceRoot, file),
            line: i + 1,
            text: `"${text}" (${words.length} palabras)`,
            pattern: 'Etiqueta ambiental en reposo supera el límite de 7 palabras (Ley del Objeto §14)'
          });
        }
      }
    }
  }

  if (violations.length > 0) {
    console.error(`\n❌ FALLO DE AUDITORÍA DIEGÉTICA: Se detectaron ${violations.length} violaciones en la UI:\n`);
    for (const v of violations) {
      console.error(`  - ${v.file}:${v.line} -> [${v.pattern}]`);
      console.error(`    ${v.text}\n`);
    }
    console.error('Leyes Inviolables de Prosa y Objeto (Reglas 13 y 14 en AGENTS.md):');
    console.error('1. Prohibido exponer números o estadísticas mecánicas.');
    console.error('2. Toda etiqueta ambiental en reposo debe ser <= 7 palabras; la prosa vive solo al interactuar.\n');
    process.exit(1);
  }

  console.log(`✅ [PASS] 0 violaciones detectadas en ${filesToScan.length} archivos escaneados (Anti-mecánico + Ley del Objeto).\n`);
}

checkDiegeticUi();
