/**
 * ASSET MANIFEST — MANIFIESTO CANÓNICO DE ACTIVOS EN RUNTIME (PROMPT P05)
 * Contiene el registro tipado de todos los recursos validados de la producción artística.
 */

import type { RuntimeAssetDefinition, AssetLoadingGroup } from './AssetTypes';
import manifestJson from './assetManifestData.json';

export const ASSET_MANIFEST: RuntimeAssetDefinition[] = manifestJson.assets as RuntimeAssetDefinition[];

export const ASSET_MAP: Map<string, RuntimeAssetDefinition> = new Map(
  ASSET_MANIFEST.map((asset) => [asset.id, asset])
);

export function getAssetById(id: string): RuntimeAssetDefinition | undefined {
  return ASSET_MAP.get(id);
}

export function getAssetsByGroup(group: AssetLoadingGroup): RuntimeAssetDefinition[] {
  return ASSET_MANIFEST.filter((asset) => asset.loadingGroup === group);
}

export function getMirrorVariantAssetId(tier: string): string {
  switch (tier) {
    case 'AZOGUE_LIMPIO':
    case 'PRISTINE':
      return 'obj_mirror_pristine';
    case 'VAHO_TENUE':
    case 'TURBID':
      return 'obj_mirror_turbid';
    case 'REFLEJOS_DESFASADOS':
    case 'UNDULATING':
      return 'obj_mirror_undulating';
    case 'EL_REFLEJO_NO_PARPADEA':
    case 'MONSTROUS':
      return 'obj_mirror_monstrous';
    default:
      return 'obj_mirror_pristine';
  }
}
