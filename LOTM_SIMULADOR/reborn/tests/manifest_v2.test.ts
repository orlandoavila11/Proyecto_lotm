import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CANONICAL_PATHWAYS, CanonicalPathwayId } from '../src/core/types/pathway.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageRoot = path.resolve(__dirname, '..');

describe('Brief-02.1: Manifest v2.0 & Pathways Manifest Validation', () => {
  const manifestPath = path.join(packageRoot, 'data', 'content', 'manifest.json');
  const pathwaysManifestPath = path.join(packageRoot, 'data', 'gameplay', 'pathways.manifest.json');
  const sefiraGroupsPath = path.join(packageRoot, 'data', 'gameplay', 'sefira_groups.json');

  it('manifest.json existe y está en versión 2.0 autorizada', () => {
    assert.ok(fs.existsSync(manifestPath), 'manifest.json debe existir');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    assert.strictEqual(manifest.manifestVersion, '2.0', 'manifestVersion debe ser 2.0');
    assert.ok(manifest.authorizedBy, 'Debe indicar autorización del Director');
  });

  it('manifest.json v2.0: los 67 archivos declaran tier L, consumerSystem y validationState honesto', () => {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    let totalFiles = 0;

    const expectedConsumers: Record<string, string> = {
      pathways: 'CanonicalDataLoader/Compendio',
      events: 'Acting',
      investigations: 'Investigation',
      artifacts: 'PENDING_CONSUMER',
      bestiary_npcs: 'PENDING_CONSUMER',
      world: 'PENDING_CONSUMER',
      lore_knowledge: 'PENDING_CONSUMER',
      quests: 'PENDING_CONSUMER',
      samples: 'NONE'
    };

    for (const [catName, cat] of Object.entries(manifest.categories as Record<string, any>)) {
      for (const file of cat.files) {
        totalFiles++;
        assert.strictEqual(file.tier, 'L', `Archivo ${file.destinationPath} debe ser tier L`);
        assert.strictEqual(
          file.consumerSystem,
          expectedConsumers[catName],
          `ConsumerSystem incorrecto en ${file.destinationPath}`
        );
        assert.ok(file.validationState, `ValidationState faltante en ${file.destinationPath}`);
        assert.ok(
          ['VALIDATED', 'PENDING_VALIDATION', 'PENDING_CONSUMER', 'NONE'].includes(file.validationState),
          `ValidationState no canónico en ${file.destinationPath}: ${file.validationState}`
        );
      }
    }

    assert.strictEqual(totalFiles, 67, 'Debe auditar exactamente los 67 archivos de contenido');
  });

  it('pathways.manifest.json: 22 vías canónicas, 6 jugables y referencias séfira válidas', () => {
    assert.ok(fs.existsSync(pathwaysManifestPath), 'pathways.manifest.json debe existir');
    const pManifest = JSON.parse(fs.readFileSync(pathwaysManifestPath, 'utf8'));
    const sefiraData = JSON.parse(fs.readFileSync(sefiraGroupsPath, 'utf8'));

    assert.strictEqual(pManifest.version, '2.0');
    assert.strictEqual(pManifest.totalPathways, 22);
    assert.strictEqual(pManifest.playableCount, 6);

    const expectedPlayables = new Set(['FOOL', 'VISIONARY', 'DEMONESS', 'MOON', 'CHAINED', 'JUSTICIAR']);
    assert.deepStrictEqual(new Set(pManifest.playablePathways), expectedPlayables);

    const pathwaysList = pManifest.pathways;
    assert.strictEqual(pathwaysList.length, 22);

    const seenIds = new Set<string>();
    const playableGroups = new Set<string>();

    for (const p of pathwaysList) {
      assert.ok(!seenIds.has(p.id), `ID duplicado: ${p.id}`);
      seenIds.add(p.id);

      assert.ok(
        (CANONICAL_PATHWAYS as readonly string[]).includes(p.id),
        `ID no canónico: ${p.id}`
      );

      assert.strictEqual(p.tier, 'G');

      if (expectedPlayables.has(p.id)) {
        assert.strictEqual(p.playable, true, `${p.id} debe ser playable`);
        playableGroups.add(p.sefirahGroupRef);
      } else {
        assert.strictEqual(p.playable, false, `${p.id} no debe ser playable`);
      }

      // Validar que la referencia séfira exista en sefira_groups.json
      const group = sefiraData.groups[p.sefirahGroupRef];
      assert.ok(group, `Grupo séfira referenciado no existe: ${p.sefirahGroupRef}`);
      assert.strictEqual(p.sefirahIdRef, group.id, `SefirahId no coincide para ${p.id}`);
      assert.ok(
        group.pathways.includes(p.id),
        `El grupo séfira ${p.sefirahGroupRef} no contiene la vía ${p.id}`
      );

      // Validar que el archivo Tier L exista en disco
      const fullContentPath = path.resolve(packageRoot, '..', p.tierLContentFile);
      assert.ok(
        fs.existsSync(fullContentPath),
        `Archivo Tier L no existe en disco: ${p.tierLContentFile}`
      );
    }

    assert.strictEqual(seenIds.size, 22);
    assert.strictEqual(
      playableGroups.size,
      6,
      'Las 6 vías jugables deben pertenecer a 6 grupos séfira distintos'
    );
  });
});
