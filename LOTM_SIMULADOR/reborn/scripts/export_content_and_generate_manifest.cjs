const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const rootDir = path.resolve('.');
const srcDir = path.join(rootDir, 'src');
const targetBase = path.join(rootDir, 'reborn', 'data', 'content');

// Helper to determine destination path based on source path and category
function getDestination(relSrc) {
  const normalized = relSrc.replace(/\\/g, '/');
  
  if (normalized.startsWith('src/quests/')) {
    return { category: 'quests', dest: path.join(targetBase, 'quests', path.basename(relSrc)) };
  }
  if (normalized.startsWith('src/pathways/')) {
    return { category: 'pathways', dest: path.join(targetBase, 'pathways', path.basename(relSrc)) };
  }
  if (normalized.startsWith('src/artifacts/')) {
    return { category: 'artifacts', dest: path.join(targetBase, 'artifacts', path.basename(relSrc)) };
  }
  if (normalized === 'src/data/sealed_artifacts_expanded.json' || normalized === 'src/advancement/uniqueness.json' || normalized === 'src/advancement/sefirot.json') {
    return { category: 'artifacts', dest: path.join(targetBase, 'artifacts', path.basename(relSrc)) };
  }
  if (normalized.startsWith('src/npc/')) {
    return { category: 'bestiary_npcs', dest: path.join(targetBase, 'bestiary_npcs', path.basename(relSrc)) };
  }
  if (normalized === 'src/investigation/investigations_data.json' || normalized === 'src/data/conspiracies.json') {
    return { category: 'investigations', dest: path.join(targetBase, 'investigations', path.basename(relSrc)) };
  }
  if (normalized === 'src/events/events.json' || normalized === 'src/data/destiny_events.json' || normalized === 'src/data/identity_events.json' || normalized === 'src/data/pathway_events.json' || normalized === 'src/data/pathway_life_stories.json') {
    return { category: 'events', dest: path.join(targetBase, 'events', path.basename(relSrc)) };
  }
  if (normalized.startsWith('src/world/') || normalized === 'src/tarot/tarot_club_members.json' || normalized === 'src/data/organizations_expanded.json') {
    return { category: 'world', dest: path.join(targetBase, 'world', path.basename(relSrc)) };
  }
  if (normalized.startsWith('src/books/') || normalized.startsWith('src/knowledge/') || normalized === 'src/data/forbidden_knowledge.json' || normalized === 'src/data/honorific_names_tables.json') {
    return { category: 'lore_knowledge', dest: path.join(targetBase, 'lore_knowledge', path.basename(relSrc)) };
  }
  if (normalized.startsWith('src/save/')) {
    return { category: 'samples', dest: path.join(targetBase, 'samples', path.basename(relSrc)) };
  }
  
  return { category: 'misc', dest: path.join(targetBase, 'misc', path.basename(relSrc)) };
}

function inferTypeSchema(val, depth = 0) {
  if (depth > 3) return 'any';
  if (val === null) return 'null';
  if (Array.isArray(val)) {
    if (val.length === 0) return 'array<unknown>';
    return 'array<' + inferTypeSchema(val[0], depth + 1) + '>';
  }
  if (typeof val === 'object') {
    const objSchema = {};
    for (const k of Object.keys(val)) {
      objSchema[k] = inferTypeSchema(val[k], depth + 1);
    }
    return objSchema;
  }
  return typeof val;
}

function getAllJsonFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllJsonFiles(filePath));
    } else if (file.endsWith('.json')) {
      results.push(filePath);
    }
  });
  return results;
}

const allSourceFiles = getAllJsonFiles(srcDir);
console.log(`Encontrados ${allSourceFiles.length} archivos JSON en src/`);

const manifest = {
  timestamp: new Date().toISOString(),
  totalFilesExported: 0,
  totalBytesExported: 0,
  categories: {}
};

allSourceFiles.forEach(srcPath => {
  const relSrc = path.relative(rootDir, srcPath).replace(/\\/g, '/');
  const { category, dest } = getDestination(relSrc);
  const destDir = path.dirname(dest);
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

  const rawContent = fs.readFileSync(srcPath, 'utf-8');
  const parsedData = JSON.parse(rawContent);

  // Copiar archivo
  fs.writeFileSync(dest, rawContent, 'utf-8');

  // Validar copia
  const destRaw = fs.readFileSync(dest, 'utf-8');
  const destParsed = JSON.parse(destRaw);
  const srcHash = crypto.createHash('sha256').update(rawContent).digest('hex');
  const destHash = crypto.createHash('sha256').update(destRaw).digest('hex');

  if (srcHash !== destHash) {
    throw new Error(`Hash mismatch al exportar: ${relSrc}`);
  }

  const stat = fs.statSync(dest);
  manifest.totalFilesExported++;
  manifest.totalBytesExported += stat.size;

  if (!manifest.categories[category]) {
    manifest.categories[category] = {
      description: '',
      fileCount: 0,
      totalBytes: 0,
      files: []
    };
  }

  const itemCount = Array.isArray(destParsed) ? destParsed.length : Object.keys(destParsed).length;
  const rootType = Array.isArray(destParsed) ? 'array' : 'object';

  // Extract representative schema
  let sampleItemSchema = null;
  if (Array.isArray(destParsed) && destParsed.length > 0) {
    sampleItemSchema = inferTypeSchema(destParsed[0]);
  } else if (!Array.isArray(destParsed)) {
    const firstKey = Object.keys(destParsed)[0];
    sampleItemSchema = {
      containerType: 'dictionary/key-value',
      sampleKey: firstKey,
      sampleValueSchema: inferTypeSchema(destParsed[firstKey])
    };
  }

  manifest.categories[category].fileCount++;
  manifest.categories[category].totalBytes += stat.size;
  manifest.categories[category].files.push({
    fileName: path.basename(dest),
    sourcePath: relSrc,
    destinationPath: path.relative(rootDir, dest).replace(/\\/g, '/'),
    sizeBytes: stat.size,
    sizeKb: Number((stat.size / 1024).toFixed(2)),
    rootType,
    itemCount,
    schema: sampleItemSchema
  });
});

// Category descriptions
manifest.categories.quests.description = 'Misiones canónicas y pruebas de avance de Secuencia 9 a Secuencia 0.';
manifest.categories.events.description = 'Eventos mundiales, convergencia astral, dilemas de identidad civil y arcos de vida por vía.';
manifest.categories.investigations.description = 'Dossiers de investigación criminal/mística y grafo de conspiraciones de Backlund.';
manifest.categories.artifacts.description = 'Artefactos Sellados (Grados 3, 2, 1, 0), características expandidas, Singularidades y Sefirot.';
manifest.categories.bestiary_npcs.description = 'Monstruos ordinarios, criaturas de élite, seres del mundo espiritual y NPCs con trasfondo.';
manifest.categories.world.description = 'Geografía de Loen, iglesias ortodoxas, organizaciones secretas, deidades, Grandes Antiguos y Club del Tarot.';
manifest.categories.lore_knowledge.description = 'Grimorios antiguos, conocimientos blasfemos, rumores victorianos y tablas de nombres honoríficos.';
manifest.categories.pathways.description = 'Compendios canónicos completos de las 22 vías de la divinidad (S9 a S0).';
if (manifest.categories.samples) {
  manifest.categories.samples.description = 'Archivos de guardado y telemetría de prueba archivados.';
}

const manifestPath = path.join(targetBase, 'manifest.json');
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');

console.log('Exportación completada con éxito.');
console.log(`Total archivos: ${manifest.totalFilesExported}`);
console.log(`Total tamaño: ${(manifest.totalBytesExported / 1024 / 1024).toFixed(2)} MB`);
console.log(`Manifiesto escrito en: ${path.relative(rootDir, manifestPath)}`);

