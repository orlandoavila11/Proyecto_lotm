/**
 * ASSET TYPES — CONTRATO DE RECURSOS EN TIEMPO DE EJECUCIÓN (PROMPT P05)
 * Definiciones tipadas para manifiesto, grupos de carga, geometría y métricas de memoria.
 */

export type AssetLoadingGroup = 
  | 'critical_refuge' 
  | 'scene_travel' 
  | 'scene_investigation' 
  | 'scene_market' 
  | 'scene_combat' 
  | 'scene_ascension' 
  | 'shared_ui';

export interface AssetInteractionGeometry {
  type: 'rectangle' | 'circle' | 'polygon';
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface RuntimeAssetDefinition {
  id: string;
  path: string;
  width: number;
  height: number;
  hasAlpha: boolean;
  sourceFrame: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  trimOffsets: {
    x: number;
    y: number;
  };
  pivot: {
    x: number;
    y: number;
  };
  depth: number;
  interactionGeometry?: AssetInteractionGeometry;
  loadingGroup: AssetLoadingGroup;
  stateVariant?: string;
  author: string;
  sha256: string;
  byteSize: number;
  decodedMemoryBytes: number; // width * height * 4 bytes (RGBA)
}

export interface AssetGroupSummary {
  group: AssetLoadingGroup;
  assetCount: number;
  totalTransferredBytes: number;
  totalDecodedMemoryBytes: number;
}

export interface AssetPipelineReport {
  totalAssets: number;
  totalTransferredBytes: number;
  totalDecodedMemoryBytes: number;
  groups: AssetGroupSummary[];
  missingAssetsCount: number;
  orphanAssetsCount: number;
}
