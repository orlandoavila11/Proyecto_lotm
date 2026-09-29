import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Lint de canon: la historia es lo único canónico. Falla si un texto del juego (datos Tier G, motor o cliente
 * ui3d) contiene un anacronismo del mundo real o un término de Circle of Inevitability fuera de las semillas
 * permitidas. Las listas viven en data/canon/canon_lists.json.
 */
const reborn = fileURLToPath(new URL('..', import.meta.url));
const root = path.resolve(reborn, '..');
const lists = JSON.parse(fs.readFileSync(path.join(reborn, 'data', 'canon', 'canon_lists.json'), 'utf-8'));

const targets: { dir: string; exts: string[] }[] = [
  { dir: path.join(reborn, 'data', 'gameplay'), exts: ['.json', '.md'] },
  { dir: path.join(reborn, 'src'), exts: ['.ts'] },
  { dir: path.join(root, 'ui3d', 'src'), exts: ['.ts', '.tsx'] }
];

function walk(dir: string, exts: string[], out: string[] = []): string[] {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, exts, out);
    else if (exts.includes(path.extname(e.name))) out.push(p);
  }
  return out;
}

/** palabra completa (sin letras pegadas a ningún lado), sin distinguir mayúsculas: «Cordu» no casa con «cordura» */
const word = (term: string) => new RegExp('(?<!\\p{L})' + term + '(?!\\p{L})', 'iu');
const anachronisms: [string, RegExp][] = (lists.realWorldAnachronisms as string[]).map(t => [t, word(t)]);
const coiTerms: [string, RegExp][] = (lists.circleOfInevitabilityTerms as string[]).map(t => [t, word(t)]);

const rel = (p: string) => path.relative(reborn, p).split(path.sep).join('/');
const violations: string[] = [];
let scanned = 0;

for (const t of targets) {
  for (const file of walk(t.dir, t.exts)) {
    scanned++;
    const lines = fs.readFileSync(file, 'utf-8').split(/\r?\n/);
    const coiAllowed = lists.coiAllowedFiles.includes(rel(file));
    lines.forEach((line, i) => {
      for (const [term, re] of anachronisms) {
        if (re.test(line)) violations.push(`${rel(file)}:${i + 1} anacronismo del mundo real «${term}»`);
      }
      if (!coiAllowed) {
        for (const [term, re] of coiTerms) {
          if (re.test(line)) violations.push(`${rel(file)}:${i + 1} término de Circle of Inevitability «${term}» fuera de las semillas`);
        }
      }
    });
  }
}

if (violations.length) {
  console.error(`❌ [FAIL] lint:canon — ${violations.length} violación(es) en ${scanned} archivos:`);
  for (const v of violations) console.error('   ' + v);
  process.exit(1);
}
console.log(`✅ [PASS] lint:canon — 0 violaciones en ${scanned} archivos (anacronismos y era PRE-COI).`);
