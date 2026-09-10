const fs = require('fs');
const path = require('path');

const sefiraPath = path.resolve('LOTM_SIMULADOR/reborn/data/gameplay/sefira_groups.json');
const sefiraData = JSON.parse(fs.readFileSync(sefiraPath, 'utf8'));

const playableSet = new Set(['FOOL', 'VISIONARY', 'DEMONESS', 'MOON', 'CHAINED', 'JUSTICIAR']);

const pathwayMetadata = {
  FOOL: { name: 'The Fool', file: 'seer.json' },
  DOOR: { name: 'The Door', file: 'apprentice.json' },
  ERROR: { name: 'Error', file: 'marauder.json' },
  VISIONARY: { name: 'Visionary', file: 'spectator.json' },
  WHITE_TOWER: { name: 'White Tower', file: 'reader.json' },
  HANGED_MAN: { name: 'The Hanged Man', file: 'secrets_suppliant.json' },
  SUN: { name: 'The Sun', file: 'bard.json' },
  TYRANT: { name: 'Tyrant', file: 'sailor.json' },
  DEATH: { name: 'Death', file: 'corpse_collector.json' },
  DARKNESS: { name: 'Darkness', file: 'sleepless.json' },
  TWILIGHT_GIANT: { name: 'Twilight Giant', file: 'warrior.json' },
  MOTHER: { name: 'Mother', file: 'planter.json' },
  MOON: { name: 'The Moon', file: 'apothecary.json' },
  BLACK_EMPEROR: { name: 'Black Emperor', file: 'lawyer.json' },
  JUSTICIAR: { name: 'Justiciar', file: 'arbiter.json' },
  CHAINED: { name: 'The Chained', file: 'prisoner.json' },
  ABYSS: { name: 'Abyss', file: 'criminal.json' },
  HERMIT: { name: 'The Hermit', file: 'mystery_pryer.json' },
  PARAGON: { name: 'Paragon', file: 'savant.json' },
  DEMONESS: { name: 'Demoness', file: 'assassin.json' },
  RED_PRIEST: { name: 'Red Priest', file: 'hunter.json' },
  WHEEL_OF_FORTUNE: { name: 'Wheel of Fortune', file: 'monster.json' }
};

// Map each pathway to its Sefirah Group Reference from sefira_groups.json
const pathwayToSefirahGroup = {};
for (const [groupKey, group] of Object.entries(sefiraData.groups)) {
  for (const p of group.pathways) {
    pathwayToSefirahGroup[p] = {
      groupKey,
      sefirahId: group.id
    };
  }
}

const pathwaysList = [];

for (const [id, meta] of Object.entries(pathwayMetadata)) {
  const sefRef = pathwayToSefirahGroup[id];
  if (!sefRef) {
    throw new Error(`Pathway ${id} not found in sefira_groups.json`);
  }

  const isPlayable = playableSet.has(id);

  pathwaysList.push({
    id,
    name: meta.name,
    tier: 'G',
    playable: isPlayable,
    tierLContentFile: `reborn/data/content/pathways/${meta.file}`,
    sefirahGroupRef: sefRef.groupKey,
    sefirahIdRef: sefRef.sefirahId
  });
}

// Sort alphabetically by ID
pathwaysList.sort((a, b) => a.id.localeCompare(b.id));

const pathwaysManifest = {
  version: '2.0',
  description: 'Contrato jugable Tier G de las 22 Vías Beyonder canónicas.',
  authorizedBy: 'Director (Brief-02.1)',
  sealedAt: '2026-09-10T15:45:00.000Z',
  totalPathways: pathwaysList.length,
  playableCount: pathwaysList.filter(p => p.playable).length,
  playablePathways: Array.from(playableSet),
  sefirahSource: 'reborn/data/gameplay/sefira_groups.json',
  pathways: pathwaysList
};

const outputPath = path.resolve('LOTM_SIMULADOR/reborn/data/gameplay/pathways.manifest.json');
fs.writeFileSync(outputPath, JSON.stringify(pathwaysManifest, null, 2), 'utf8');

console.log('pathways.manifest.json created successfully with', pathwaysList.length, 'pathways.');
