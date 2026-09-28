/**
 * ASSET MANAGER — GESTOR DE TEXTURAS CON CONTEO DE REFERENCIAS (PROMPT P05)
 * Administra el ciclo de vida de los recursos visuales en Phaser 4.2.1.
 * Carga por grupos temáticos y desaloja texturas de VRAM al vaciarse el conteo de referencias.
 */

import * as Phaser from 'phaser';
import type { AssetLoadingGroup, RuntimeAssetDefinition } from './AssetTypes';
import { ASSET_MANIFEST, getAssetsByGroup, ASSET_MAP } from './AssetManifest';

export class AssetManager {
  private static instance: AssetManager;
  private groupRefCounts: Map<AssetLoadingGroup, number> = new Map();
  private loadedAssetIds: Set<string> = new Set();

  private constructor() {}

  public static getInstance(): AssetManager {
    if (!AssetManager.instance) {
      AssetManager.instance = new AssetManager();
    }
    return AssetManager.instance;
  }

  /**
   * Consulta el número de referencias activas de un grupo
   */
  public getGroupRefCount(group: AssetLoadingGroup): number {
    return this.groupRefCounts.get(group) || 0;
  }

  /**
   * Carga un grupo de activos mediante Phaser con conteo de referencias
   */
  public async acquireGroup(
    scene: Phaser.Scene,
    group: AssetLoadingGroup,
    onProgress?: (progress: number) => void
  ): Promise<void> {
    const currentCount = this.groupRefCounts.get(group) || 0;
    this.groupRefCounts.set(group, currentCount + 1);

    // Si ya fue cargado por otra escena activa, resolver de inmediato
    if (currentCount > 0) {
      onProgress?.(1.0);
      return;
    }

    const assets = getAssetsByGroup(group);
    if (assets.length === 0) {
      return;
    }

    // Filtrar los que aún no están en el gestor de texturas de Phaser
    const assetsToLoad = assets.filter((a) => !scene.textures.exists(a.id));

    if (assetsToLoad.length === 0) {
      assets.forEach((a) => this.loadedAssetIds.add(a.id));
      onProgress?.(1.0);
      return;
    }

    return new Promise<void>((resolve, reject) => {
      assetsToLoad.forEach((asset) => {
        scene.load.image(asset.id, asset.path);
      });

      const handleProgress = (progress: number) => {
        onProgress?.(progress);
      };

      const handleLoadError = (fileObj: any) => {
        console.error(`[AssetManager] Error cargando activo: ${fileObj.key || fileObj.src}`);
        cleanup();
        reject(new Error(`Fallo de carga en manifiesto para activo: ${fileObj.key}`));
      };

      const handleComplete = () => {
        assetsToLoad.forEach((a) => this.loadedAssetIds.add(a.id));
        cleanup();
        resolve();
      };

      const cleanup = () => {
        scene.load.off(Phaser.Loader.Events.PROGRESS, handleProgress);
        scene.load.off(Phaser.Loader.Events.FILE_LOAD_ERROR, handleLoadError);
        scene.load.off(Phaser.Loader.Events.COMPLETE, handleComplete);
      };

      scene.load.on(Phaser.Loader.Events.PROGRESS, handleProgress);
      scene.load.on(Phaser.Loader.Events.FILE_LOAD_ERROR, handleLoadError);
      scene.load.once(Phaser.Loader.Events.COMPLETE, handleComplete);

      scene.load.start();
    });
  }

  /**
   * Libera un grupo de activos y remueve las texturas si el contador llega a cero
   */
  public releaseGroup(scene: Phaser.Scene, group: AssetLoadingGroup): void {
    const currentCount = this.groupRefCounts.get(group) || 0;
    if (currentCount <= 1) {
      this.groupRefCounts.delete(group);

      // Desalojar texturas de Phaser para este grupo si no están en otro grupo activo
      const assets = getAssetsByGroup(group);
      assets.forEach((asset) => {
        // Verificar si pertenece a otro grupo con refCount > 0
        const isNeededByOther = Array.from(this.groupRefCounts.keys()).some((otherGroup) => {
          const otherAssets = getAssetsByGroup(otherGroup);
          return otherAssets.some((oa) => oa.id === asset.id);
        });

        if (!isNeededByOther && scene.textures.exists(asset.id)) {
          scene.textures.remove(asset.id);
          this.loadedAssetIds.delete(asset.id);
        }
      });
    } else {
      this.groupRefCounts.set(group, currentCount - 1);
    }
  }

  /**
   * Valida la integridad estructural del manifiesto en tiempo de ejecución
   */
  public validateManifest(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const seenIds = new Set<string>();

    for (const asset of ASSET_MANIFEST) {
      if (!asset.id || typeof asset.id !== 'string') {
        errors.push(`Activo con ID inválido: ${JSON.stringify(asset)}`);
      } else if (seenIds.has(asset.id)) {
        errors.push(`ID duplicado en el manifiesto: "${asset.id}"`);
      }
      seenIds.add(asset.id);

      if (!asset.path || typeof asset.path !== 'string') {
        errors.push(`Activo "${asset.id}" no define una ruta válida.`);
      }

      if (!asset.width || asset.width <= 0 || !asset.height || asset.height <= 0) {
        errors.push(`Activo "${asset.id}" tiene dimensiones geométricas inválidas (${asset.width}x${asset.height}).`);
      }

      if (!asset.byteSize || asset.byteSize <= 0) {
        errors.push(`Activo "${asset.id}" no declara un peso en disco válido.`);
      }

      if (!asset.sha256 || asset.sha256.length !== 64) {
        errors.push(`Activo "${asset.id}" no tiene un hash SHA-256 canónico de 64 caracteres.`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  public getAsset(id: string): RuntimeAssetDefinition | undefined {
    return ASSET_MAP.get(id);
  }

  public getLoadedAssetCount(): number {
    return this.loadedAssetIds.size;
  }

  public reset(): void {
    this.groupRefCounts.clear();
    this.loadedAssetIds.clear();
  }
}

export const assetManager = AssetManager.getInstance();
