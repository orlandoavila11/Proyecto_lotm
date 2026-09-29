/**
 * Pipeline de assets de ui3d.
 *
 *   art-source/atlas/V0X_*.png       → public/plates/atlas_v0X.webp   (láminas provisionales del Atlas)
 *   art-source/generated/<nombre>.*  → public/<carpeta>/<nombre>.webp (según prefijo, ver RULES)
 *
 * Recortes con fondo verde #00FF00 se convierten a alfa real (keying + despill + recorte al contenido).
 * Al final escribe public/assets.json: el cliente sólo pide lo que existe y cae a lo provisional si falta.
 */
import sharp from 'sharp';
import { readdir, mkdir, writeFile, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC_ATLAS = path.join(ROOT, 'art-source/atlas');
const SRC_GEN = path.join(ROOT, 'art-source/generated');
const SRC_PROV = path.join(ROOT, 'art-source/provisional');
const OUT = path.join(ROOT, 'public');

/** prefijo → destino y tratamiento */
const RULES = [
  { prefix: 'plate_', dir: 'plates', width: 2560, height: 1440, fit: 'cover', key: false, quality: 90 },
  { prefix: 'depth_', dir: 'plates', width: 1280, height: 720, fit: 'cover', key: false, depth: true },
  { prefix: 'emit_', dir: 'plates', width: 1280, height: 720, fit: 'cover', key: false, depth: true },
  { prefix: 'actor_enemy_portrait', dir: 'art', width: 512, height: 512, fit: 'cover', key: false, quality: 88 },
  { prefix: 'actor_', dir: 'art', maxSide: 1600, key: true, quality: 92 },
  { prefix: 'item_', dir: 'art/items', maxSide: 900, key: true, quality: 92 },
  { prefix: 'icon_', dir: 'art', maxSide: 512, key: true, quality: 92 },
  { prefix: 'potion_', dir: 'art', maxSide: 1200, key: true, quality: 92 },
  { prefix: 'portrait_', dir: 'art/portraits', width: 768, height: 1024, fit: 'cover', key: false, quality: 88 },
  { prefix: 'clue_', dir: 'art/clues', width: 1600, height: 1200, fit: 'cover', key: false, quality: 88 },
  { prefix: 'dest_', dir: 'art/destinations', width: 1200, height: 800, fit: 'cover', key: false, quality: 88 },
  { prefix: 'bazaar_preview_bg', dir: 'art', width: 1024, height: 768, fit: 'cover', key: false, quality: 88 },
  { prefix: 'potionimg_', dir: 'art', width: 896, height: 1200, fit: 'cover', key: false, quality: 86 },
  { prefix: 'paper_texture', dir: 'art', width: 1024, height: 1024, fit: 'cover', key: false, quality: 86 },
  { prefix: 'panel_texture', dir: 'art', width: 1024, height: 1024, fit: 'cover', key: false, quality: 86 }
];

const IMAGE_EXT = new Set(['.png', '.jpg', '.jpeg', '.webp']);

async function listImages(dir) {
  if (!existsSync(dir)) return [];
  const names = await readdir(dir);
  return names.filter((n) => IMAGE_EXT.has(path.extname(n).toLowerCase()));
}

/** Convierte un fondo verde plano en alfa, eliminando el halo verde de los bordes. */
async function chromaKey(input) {
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const px = info.width * info.height;
  let greenCorners = 0;
  for (const [x, y] of [[0, 0], [info.width - 1, 0], [0, info.height - 1], [info.width - 1, info.height - 1]]) {
    const i = (y * info.width + x) * 4;
    if (data[i + 1] > 150 && data[i] < 120 && data[i + 2] < 120) greenCorners++;
  }
  // Ya trae alfa real (o no es fondo verde): se respeta tal cual.
  if (greenCorners < 2) return sharp(input).ensureAlpha();

  for (let p = 0; p < px; p++) {
    const i = p * 4;
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const spill = g - Math.max(r, b);
    // alfa: 1 cuando no hay dominancia verde, 0 cuando es verde puro
    const a = 1 - Math.min(1, Math.max(0, (spill - 18) / 70));
    data[i + 3] = Math.round(data[i + 3] * a);
    if (spill > 0) data[i + 1] = Math.max(r, b) + Math.round(spill * 0.12); // despill
  }
  return sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } });
}

async function processGenerated(file, srcDir = SRC_GEN, outRoot = OUT, relPrefix = '') {
  const base = path.basename(file, path.extname(file));
  const rule = RULES.find((r) => base.startsWith(r.prefix));
  if (!rule) {
    console.warn(`  ⚠ ${file}: prefijo sin regla, se ignora`);
    return null;
  }
  const input = path.join(srcDir, file);
  const outDir = path.join(outRoot, rule.dir);
  await mkdir(outDir, { recursive: true });

  if (rule.depth) {
    const out = path.join(outDir, `${base}.png`);
    await sharp(input).grayscale().resize(rule.width, rule.height, { fit: rule.fit }).png().toFile(out);
    return `${relPrefix}${rule.dir}/${base}.png`;
  }

  let img = rule.key ? await chromaKey(input) : sharp(input);
  if (rule.key) {
    const buf = await img.png().toBuffer();
    img = sharp(buf).trim({ threshold: 1 });
  }
  if (rule.maxSide) img = img.resize(rule.maxSide, rule.maxSide, { fit: 'inside', withoutEnlargement: true });
  else img = img.resize(rule.width, rule.height, { fit: rule.fit, kernel: 'lanczos3' });

  const out = path.join(outDir, `${base}.webp`);
  await img.webp({ quality: rule.quality ?? 90, alphaQuality: 100, smartSubsample: true }).toFile(out);
  return `${relPrefix}${rule.dir}/${base}.webp`;
}

async function processAtlas(file) {
  const m = /^V0(\d)/.exec(file);
  if (!m) return null;
  const outDir = path.join(OUT, 'plates');
  await mkdir(outDir, { recursive: true });
  const rel = `plates/atlas_v0${m[1]}.webp`;
  const out = path.join(OUT, rel);
  const src = path.join(SRC_ATLAS, file);
  if (existsSync(out) && (await stat(out)).mtimeMs > (await stat(src)).mtimeMs) return rel;
  await sharp(src).resize(1920, 1080, { fit: 'cover', kernel: 'lanczos3' }).webp({ quality: 90 }).toFile(out);
  return rel;
}

async function main() {
  const available = [];
  for (const f of await listImages(SRC_ATLAS)) {
    const rel = await processAtlas(f);
    if (rel) { available.push(rel); console.log(`  atlas  ${rel}`); }
  }
  for (const f of await listImages(SRC_GEN)) {
    try {
      const rel = await processGenerated(f);
      if (rel) { available.push(rel); console.log(`  ✓ ${rel}`); }
    } catch (err) {
      console.error(`  ✗ ${f}: ${err.message}`);
      process.exitCode = 1;
    }
  }
  const provisional = [];
  for (const f of await listImages(SRC_PROV)) {
    const rel = await processGenerated(f, SRC_PROV, path.join(OUT, 'provisional'), 'provisional/');
    if (rel) { provisional.push(rel); console.log(`  prov   ${rel}`); }
  }
  available.sort();
  provisional.sort();
  await writeFile(
    path.join(OUT, 'assets.json'),
    JSON.stringify({ generatedAt: new Date().toISOString(), files: available, provisional }, null, 2)
  );
  console.log(`\nassets.json → ${available.length} archivos disponibles`);
}

main();
