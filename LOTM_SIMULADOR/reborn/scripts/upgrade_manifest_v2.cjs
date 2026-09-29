const fs = require('fs');
const path = require('path');

const manifestPath = path.resolve('LOTM_SIMULADOR/reborn/data/content/manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

console.log('Upgrading manifest.json from', manifest.manifestVersion, 'to 2.0...');

const categoryMapping = {
  pathways: {
    consumerSystem: 'CanonicalDataLoader/Compendio',
    validationState: 'VALIDATED'
  },
  events: {
    consumerSystem: 'Acting',
    validationState: 'PENDING_VALIDATION'
  },
  investigations: {
    consumerSystem: 'Investigation',
    validationState: 'PENDING_VALIDATION'
  },
  artifacts: {
    consumerSystem: 'PENDING_CONSUMER',
    validationState: 'PENDING_CONSUMER'
  },
  bestiary_npcs: {
    consumerSystem: 'PENDING_CONSUMER',
    validationState: 'PENDING_CONSUMER'
  },
  world: {
    consumerSystem: 'PENDING_CONSUMER',
    validationState: 'PENDING_CONSUMER'
  },
  lore_knowledge: {
    consumerSystem: 'PENDING_CONSUMER',
    validationState: 'PENDING_CONSUMER'
  },
  quests: {
    consumerSystem: 'PENDING_CONSUMER',
    validationState: 'PENDING_CONSUMER'
  },
  samples: {
    consumerSystem: 'NONE',
    validationState: 'NONE'
  }
};

let totalFiles = 0;

for (const [catName, cat] of Object.entries(manifest.categories)) {
  const mapping = categoryMapping[catName];
  if (!mapping) {
    throw new Error('Categoría desconocida en manifest: ' + catName);
  }

  for (const file of cat.files) {
    file.tier = 'L';
    file.consumerSystem = mapping.consumerSystem;
    file.validationState = mapping.validationState;
    totalFiles++;
  }
}

manifest.manifestVersion = '2.0';
manifest.authorizedBy = 'Director (Brief-02.1)';
manifest.upgradedAt = '2026-09-10T15:40:00.000Z';

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
console.log('Upgrade complete for', totalFiles, 'files.');
