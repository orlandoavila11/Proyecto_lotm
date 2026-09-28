import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { CANONICAL_HOTSPOTS, CAMERA_PRESETS, type HotspotId } from '../../ui/src/scene/types.js';
import { mapSanityToVisual, mapCorruptionToVisual, mapRuinaToVisual } from '../../ui/src/services/somaticsMapper.js';
import { getMirrorVariantAssetId } from '../../ui/src/game/assets/AssetManifest.js';

describe('P06: El Desván as a Usable Refuge (V01 Alignment)', () => {
  const REQUIRED_11_HOTSPOTS: HotspotId[] = [
    'hotspot_candle',
    'hotspot_mirror',
    'hotspot_acting_diary',
    'hotspot_identity_papers',
    'hotspot_bazaar_letter',
    'hotspot_almanack',
    'hotspot_money_pouch',
    'hotspot_chalice',
    'hotspot_corkboard',
    'hotspot_staircase_door',
    'hotspot_mahogany_cracks'
  ];

  it('all 11 canonical hotspots exist and have valid boundaries and camera presets', () => {
    assert.equal(Object.keys(CANONICAL_HOTSPOTS).length, 11, 'Must have exactly 11 canonical hotspots');

    for (const id of REQUIRED_11_HOTSPOTS) {
      const contract = CANONICAL_HOTSPOTS[id];
      assert.ok(contract, `Hotspot ${id} must exist in CANONICAL_HOTSPOTS`);
      assert.ok(contract.accessibleName && contract.accessibleName.length > 0, `${id} missing accessibleName`);
      assert.ok(contract.bounds.width >= 44 && contract.bounds.height >= 44, `${id} must meet min touch target`);
      assert.ok(contract.bounds.x >= 0 && contract.bounds.x + contract.bounds.width <= 1920, `${id} x bounds in canvas`);
      assert.ok(contract.bounds.y >= 0 && contract.bounds.y + contract.bounds.height <= 1080, `${id} y bounds in canvas`);
      assert.ok(contract.cameraPreset in CAMERA_PRESETS, `${id} cameraPreset must be valid`);
    }
  });

  it('all 11 hotspots comply with the resting label limit (<= 7 words) and anti-mechanical purity', () => {
    const FORBIDDEN_MECHANICAL_TERMS = [
      /\bHP\b/i,
      /\bPV\b/i,
      /\bSanidad:\s*\d+/i,
      /\bCorrupción:\s*\d+/i,
      /\bRuina:\s*\d+/i,
      /\b\+\d+\b/,
      /\b-\d+\b/,
      /\bPA:\s*\d+/i
    ];

    for (const id of REQUIRED_11_HOTSPOTS) {
      const contract = CANONICAL_HOTSPOTS[id];
      const wordCount = contract.restingLabel.trim().split(/\s+/).length;
      assert.ok(
        wordCount <= 7,
        `Hotspot ${id} resting label exceeds 7 words (${wordCount}): "${contract.restingLabel}"`
      );

      for (const pattern of FORBIDDEN_MECHANICAL_TERMS) {
        assert.ok(
          !pattern.test(contract.restingLabel),
          `Hotspot ${id} contains forbidden mechanical pattern ${pattern} in restingLabel`
        );
      }
    }
  });

  it('camera presets provide valid coordinates and zoom levels', () => {
    const requiredPresets = ['WIDE_OVERVIEW', 'FOCUS_DESK', 'FOCUS_CORKBOARD', 'FOCUS_HORNACINA', 'FOCUS_STAIRCASE'];
    for (const presetKey of requiredPresets) {
      const preset = CAMERA_PRESETS[presetKey as keyof typeof CAMERA_PRESETS];
      assert.ok(preset, `Preset ${presetKey} must exist`);
      assert.ok(preset.zoom >= 1.0, `Preset ${presetKey} zoom must be at least 1.0`);
    }

    assert.equal(CAMERA_PRESETS.WIDE_OVERVIEW.zoom, 1.0, 'WIDE_OVERVIEW zoom must be 1.0');
    assert.equal(CAMERA_PRESETS.WIDE_OVERVIEW.x, 0, 'WIDE_OVERVIEW x must be 0');
    assert.equal(CAMERA_PRESETS.WIDE_OVERVIEW.y, 0, 'WIDE_OVERVIEW y must be 0');
  });

  it('somatics mapping produces consistent diegetic states without scattering thresholds', () => {
    // Sanity -> Candle
    const lucid = mapSanityToVisual('LUCID');
    assert.equal(lucid.tier, 'BRILLANTE');
    assert.match(lucid.description, /llama/i);

    const nearCollapse = mapSanityToVisual('NEAR_COLLAPSE');
    assert.equal(nearCollapse.tier, 'AHOGADA_EN_CERA');

    // Corruption -> Mirror
    const pristine = mapCorruptionToVisual('PRISTINE');
    assert.equal(pristine.tier, 'AZOGUE_LIMPIO');
    assert.equal(getMirrorVariantAssetId(pristine.tier), 'obj_mirror_pristine');

    const turbid = mapCorruptionToVisual('LATENT_MURMURS');
    assert.equal(turbid.tier, 'VAHO_TENUE');
    assert.equal(getMirrorVariantAssetId(turbid.tier), 'obj_mirror_turbid');

    const undulating = mapCorruptionToVisual('ASTRAL_STRAIN');
    assert.equal(undulating.tier, 'REFLEJOS_DESFASADOS');
    assert.equal(getMirrorVariantAssetId(undulating.tier), 'obj_mirror_undulating');

    const monstrous = mapCorruptionToVisual('MUTATING');
    assert.equal(monstrous.tier, 'EL_REFLEJO_NO_PARPADEA');
    assert.equal(getMirrorVariantAssetId(monstrous.tier), 'obj_mirror_monstrous');

    // Ruina -> Desk Cracks
    const integro = mapRuinaToVisual(0);
    assert.equal(integro.tier, 'INTEGRO');

    const marcado = mapRuinaToVisual(15);
    assert.equal(marcado.tier, 'MARCADO');
  });

  it('exit routing contract: staircase door does not force unavoidable combat', () => {
    const staircase = CANONICAL_HOTSPOTS.hotspot_staircase_door;
    assert.equal(staircase.id, 'hotspot_staircase_door');
    assert.equal(staircase.stateVariant, 'STAIRCASE_PEACEFUL');
    assert.match(staircase.restingLabel, /calma|zaguán|escalera/i);
    // Verified that default state is peaceful without unprovoked combat
    assert.equal(staircase.cameraPreset, 'FOCUS_STAIRCASE');
  });
});
