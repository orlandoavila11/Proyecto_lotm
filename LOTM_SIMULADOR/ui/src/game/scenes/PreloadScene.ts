/**
 * PRELOAD SCENE — PATH TO GODHOOD (PHASER 4.2.1)
 * Carga de recursos verificados de El Desván: fondo de composición y objetos del escritorio.
 * Proporciona barra de progreso diegética y reporte estricto de errores al GameBridge.
 */

import * as Phaser from 'phaser';
import type { GameBridge } from '../bridge/GameBridge';
import { getAssetsByGroup } from '../assets/AssetManifest';

export class PreloadScene extends Phaser.Scene {
  private progressBar!: Phaser.GameObjects.Graphics;
  private progressBox!: Phaser.GameObjects.Graphics;
  private loadingText!: Phaser.GameObjects.Text;
  private percentText!: Phaser.GameObjects.Text;
  private errorText?: Phaser.GameObjects.Text;

  constructor() {
    super('PreloadScene');
  }

  public preload(): void {
    const bridge = this.registry.get('bridge') as GameBridge | undefined;

    // Lienzo de 1920x1080
    const width = 1920;
    const height = 1080;

    // Caja de progreso victoriana (oro envejecido sobre fondo ébano)
    this.progressBox = this.add.graphics();
    this.progressBox.fillStyle(0x1a1612, 0.8);
    this.progressBox.lineStyle(2, 0x8c733e, 0.8);
    this.progressBox.fillRect(width / 2 - 250, height / 2 - 20, 500, 40);
    this.progressBox.strokeRect(width / 2 - 250, height / 2 - 20, 500, 40);

    this.progressBar = this.add.graphics();

    this.loadingText = this.make.text({
      x: width / 2,
      y: height / 2 - 50,
      text: 'El Desván — Preparando el Santuario Oculto...',
      style: {
        font: '20px "Cinzel", "Times New Roman", serif',
        color: '#d4af37'
      }
    });
    this.loadingText.setOrigin(0.5, 0.5);

    this.percentText = this.make.text({
      x: width / 2,
      y: height / 2,
      text: '0%',
      style: {
        font: '16px "Cinzel", serif',
        color: '#ede4d1'
      }
    });
    this.percentText.setOrigin(0.5, 0.5);

    // Eventos del cargador de Phaser
    this.load.on('progress', (value: number) => {
      this.percentText.setText(`${Math.floor(value * 100)}%`);
      this.progressBar.clear();
      this.progressBar.fillStyle(0xd4af37, 1);
      this.progressBar.fillRect(width / 2 - 245, height / 2 - 15, 490 * value, 30);

      if (bridge) {
        bridge.emit('LOAD_PROGRESS', { progress: value });
      }
    });

    this.load.on('loaderror', (fileObj: any) => {
      const errorMsg = `Error al cargar: ${fileObj.key || fileObj.src}`;
      console.error(`[PreloadScene] Fallo de carga de recurso diegético:`, fileObj);

      if (!this.errorText) {
        this.errorText = this.make.text({
          x: width / 2,
          y: height / 2 + 60,
          text: errorMsg,
          style: {
            font: '16px monospace',
            color: '#ef4444'
          }
        });
        this.errorText.setOrigin(0.5, 0.5);
      } else {
        this.errorText.setText(errorMsg);
      }

      if (bridge) {
        bridge.emit('LOAD_ERROR', {
          key: fileObj.key || 'unknown',
          url: fileObj.src || '',
          error: errorMsg
        });
      }
    });

    // Carga de recursos verificados desde el manifiesto de activos (P05)
    const refugeAssets = getAssetsByGroup('critical_refuge');
    refugeAssets.forEach((asset) => {
      this.load.image(asset.id, asset.path);
    });

    // Alias canónicos para retrocompatibilidad
    this.load.image('desvan_bg', '/art/C0_desvan_composition.jpg');
    this.load.image('desvan_clean', '/art/GFX06_desvan_background_clean.jpg');
    this.load.image('victorian_almanac', '/art/GFX18_victorian_almanac_v2.jpg');
    this.load.image('tallow_candle', '/art/GFX12_tallow_candle.jpg');
    this.load.image('sealed_letter', '/art/GFX20_sealed_letter.jpg');
    this.load.image('quicksilver_mirror', '/art/GFX13_quicksilver_mirror.jpg');
  }

  public create(): void {
    const bridge = this.registry.get('bridge') as GameBridge | undefined;
    if (bridge) {
      bridge.emit('SCENE_READY', { sceneKey: 'PreloadScene' });
    }

    // Transición a la escena jugable de El Desván
    this.scene.start('RefugeScene');
  }
}
