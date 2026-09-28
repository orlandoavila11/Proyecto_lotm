import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '../..');

describe('P05: Asset Pipeline & Memory Guard Tests', () => {
  const manifestPath = path.resolve(ROOT, 'ui/src/game/assets/assetManifestData.json');

  it('assetManifestData.json exists and is valid JSON', () => {
    assert.ok(fs.existsSync(manifestPath), 'Manifest file must exist');
    const raw = fs.readFileSync(manifestPath, 'utf8');
    const data = JSON.parse(raw);
    assert.ok(data.assets && Array.isArray(data.assets), 'Manifest must contain assets array');
    assert.ok(data.assets.length > 0, 'Manifest must have assets');
  });

  it('all assets have unique IDs and conform to schema', () => {
    const data = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    const ids = new Set<string>();
    const validGroups = new Set([
      'critical_refuge',
      'scene_travel',
      'scene_investigation',
      'scene_market',
      'scene_combat',
      'scene_ascension',
      'shared_ui',
    ]);
    const hex64Regex = /^[0-9a-f]{64}$/;

    for (const asset of data.assets) {
      assert.ok(!ids.has(asset.id), `Duplicate asset ID: ${asset.id}`);
      ids.add(asset.id);

      assert.ok(asset.path && typeof asset.path === 'string', `Asset ${asset.id} missing path`);
      assert.ok(validGroups.has(asset.loadingGroup), `Asset ${asset.id} invalid loadingGroup: ${asset.loadingGroup}`);
      assert.ok(asset.width > 0, `Asset ${asset.id} width must be positive`);
      assert.ok(asset.height > 0, `Asset ${asset.id} height must be positive`);
      assert.ok(asset.byteSize > 0, `Asset ${asset.id} byteSize must be positive`);
      assert.equal(
        asset.decodedMemoryBytes,
        asset.width * asset.height * 4,
        `Asset ${asset.id} decoded memory mismatch`
      );
      assert.match(asset.sha256, hex64Regex, `Asset ${asset.id} must have 64-char hex sha256`);
    }
  });

  it('critical_refuge group contains required clean background and somatic mirror variants', () => {
    const data = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    const refugeAssets = data.assets.filter((a: any) => a.loadingGroup === 'critical_refuge');
    const refugeIds = new Set(refugeAssets.map((a: any) => a.id));

    assert.ok(refugeIds.has('bg_desvan_clean'), 'Must contain clean background without baked objects');
    assert.ok(refugeIds.has('obj_mirror_pristine'), 'Must contain pristine mirror');
    assert.ok(refugeIds.has('obj_mirror_turbid'), 'Must contain turbid mirror');
    assert.ok(refugeIds.has('obj_mirror_undulating'), 'Must contain undulating mirror');
    assert.ok(refugeIds.has('obj_mirror_monstrous'), 'Must contain monstrous mirror');
    assert.ok(refugeIds.has('obj_candle_lucid'), 'Must contain lucid candle');
    assert.ok(refugeIds.has('obj_acting_book_closed'), 'Must contain acting book');
  });

  it('somatic mirror variant resolution produces deterministic asset IDs', () => {
    const resolveMirror = (corruption: number): string => {
      if (corruption < 25) return 'obj_mirror_pristine';
      if (corruption < 50) return 'obj_mirror_turbid';
      if (corruption < 75) return 'obj_mirror_undulating';
      return 'obj_mirror_monstrous';
    };

    assert.equal(resolveMirror(0), 'obj_mirror_pristine');
    assert.equal(resolveMirror(24), 'obj_mirror_pristine');
    assert.equal(resolveMirror(25), 'obj_mirror_turbid');
    assert.equal(resolveMirror(49), 'obj_mirror_turbid');
    assert.equal(resolveMirror(50), 'obj_mirror_undulating');
    assert.equal(resolveMirror(74), 'obj_mirror_undulating');
    assert.equal(resolveMirror(75), 'obj_mirror_monstrous');
    assert.equal(resolveMirror(100), 'obj_mirror_monstrous');
  });

  it('reference counting logic safely tracks multi-scene acquisition and evicts on zero', () => {
    const refCounts = new Map<string, number>();
    const textures = new Set<string>();

    const acquire = (keys: string[]) => {
      for (const k of keys) {
        const count = refCounts.get(k) || 0;
        refCounts.set(k, count + 1);
        textures.add(k);
      }
    };

    const release = (keys: string[]) => {
      for (const k of keys) {
        const count = (refCounts.get(k) || 0) - 1;
        if (count <= 0) {
          refCounts.delete(k);
          textures.delete(k);
        } else {
          refCounts.set(k, count);
        }
      }
    };

    // Scene 1 acquires refuge
    const refugeKeys = ['bg_desvan_clean', 'obj_mirror_pristine', 'shared_icon'];
    acquire(refugeKeys);
    assert.equal(textures.size, 3);
    assert.equal(refCounts.get('shared_icon'), 1);

    // Scene 2 acquires travel and shares shared_icon
    const travelKeys = ['bg_backlund_map', 'shared_icon'];
    acquire(travelKeys);
    assert.equal(textures.size, 4);
    assert.equal(refCounts.get('shared_icon'), 2);

    // Scene 1 shuts down and releases refugeKeys
    release(refugeKeys);
    assert.equal(textures.size, 2, 'refuge specific textures must be evicted');
    assert.ok(!textures.has('bg_desvan_clean'), 'bg_desvan_clean evicted');
    assert.ok(!textures.has('obj_mirror_pristine'), 'obj_mirror_pristine evicted');
    assert.ok(textures.has('shared_icon'), 'shared_icon retained by Scene 2');
    assert.equal(refCounts.get('shared_icon'), 1);

    // Scene 2 shuts down and releases travelKeys
    release(travelKeys);
    assert.equal(textures.size, 0, 'all textures evicted when all scenes release');
    assert.equal(refCounts.size, 0);
  });

  it('total decoded memory of critical_refuge group does not exceed 65 MB budget', () => {
    const data = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    const refugeAssets = data.assets.filter((a: any) => a.loadingGroup === 'critical_refuge');
    const totalRefugeBytes = refugeAssets.reduce((sum: number, a: any) => sum + a.decodedMemoryBytes, 0);
    const totalMB = totalRefugeBytes / (1024 * 1024);

    assert.ok(
      totalMB < 65,
      `Critical refuge memory (${totalMB.toFixed(2)} MB) exceeded 65 MB budget`
    );
  });
});
