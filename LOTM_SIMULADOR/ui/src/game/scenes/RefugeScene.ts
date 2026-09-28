/**
 * REFUGE SCENE — EL DESVÁN EN PHASER 4.2.1 (PROMPT P03)
 * Escena principal del santuario y escritorio.
 * Soporta cámara con presets, objetos interactivos verificados, navegación por teclado y puente tipado.
 */

import * as Phaser from 'phaser';
import type { GameBridge } from '../bridge/GameBridge';
import { getMirrorVariantAssetId } from '../assets/AssetManifest';
import { assetManager } from '../assets/AssetManager';

interface InteractiveHotspotItem {
  id: string;
  name: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  textureKey?: string;
  preset: { x: number; y: number; zoom: number };
}

export class RefugeScene extends Phaser.Scene {
  private bridge?: GameBridge;
  private unregisterCommands: Array<() => void> = [];
  private interactiveObjects: Phaser.GameObjects.GameObject[] = [];
  private highlightGraphics!: Phaser.GameObjects.Graphics;
  private tooltipContainer!: Phaser.GameObjects.Container;
  private tooltipText!: Phaser.GameObjects.Text;
  private activeFocusedIndex: number = -1;
  private hotspotDefs: InteractiveHotspotItem[] = [
    {
      id: 'hotspot_almanack',
      name: 'Reloj de Faltriquera y Almanaque',
      label: 'Reloj de latón marcando la franja.',
      x: 1160 + 330 / 2,
      y: 390 + 250 / 2,
      width: 330,
      height: 250,
      textureKey: 'victorian_almanac',
      preset: { x: 960, y: 540 + 220, zoom: 1.35 }
    },
    {
      id: 'hotspot_candle',
      name: 'La Vela de Sebo',
      label: 'Llama viva y clara sobre peltre.',
      x: 420 + 160 / 2,
      y: 320 + 380 / 2,
      width: 160,
      height: 380,
      textureKey: 'tallow_candle',
      preset: { x: 960, y: 540 + 220, zoom: 1.35 }
    },
    {
      id: 'hotspot_bazaar_letter',
      name: 'Carta Sellada del Benefactor',
      label: 'Carta sellada sobre el tapete.',
      x: 990 + 250 / 2,
      y: 550 + 160 / 2,
      width: 250,
      height: 160,
      textureKey: 'sealed_letter',
      preset: { x: 960, y: 540 + 220, zoom: 1.35 }
    },
    {
      id: 'hotspot_mirror',
      name: 'El Espejo de Azogue',
      label: 'El azogue refleja tu semblante humano.',
      x: 580 + 240 / 2,
      y: 390 + 290 / 2,
      width: 240,
      height: 290,
      textureKey: 'quicksilver_mirror',
      preset: { x: 960, y: 540 + 220, zoom: 1.35 }
    },
    {
      id: 'hotspot_corkboard',
      name: 'Tablero de Corcho',
      label: 'Expediente Cherwood; pistas e hilos rojos.',
      x: 1460 + 420 / 2,
      y: 220 + 380 / 2,
      width: 420,
      height: 380,
      preset: { x: 960 + 750, y: 540 - 140, zoom: 1.50 }
    },
    {
      id: 'hotspot_chalice',
      name: 'El Cáliz de Plata',
      label: 'Cáliz ceremonial en la hornacina umbría.',
      x: 800 + 220 / 2,
      y: 220 + 300 / 2,
      width: 220,
      height: 300,
      preset: { x: 960 - 80, y: 540 - 260, zoom: 1.65 }
    },
    {
      id: 'hotspot_staircase_door',
      name: 'Escalera de Caracol y Zaguán',
      label: 'Peldaños en silencio; calma en el zaguán.',
      x: 80 + 320 / 2,
      y: 280 + 500 / 2,
      width: 320,
      height: 500,
      preset: { x: 960 - 720, y: 540 + 40, zoom: 1.45 }
    }
  ];

  constructor() {
    super('RefugeScene');
  }

  public create(): void {
    this.bridge = this.registry.get('bridge') as GameBridge | undefined;

    // 1. Capa de Fondo (1920x1080 centrado en 960, 540)
    const bg = this.add.image(960, 540, 'desvan_bg');
    bg.setDisplaySize(1920, 1080);
    bg.setDepth(0);

    // 2. Gráficos de Resaltado (Halo victoriano sobre objetos)
    this.highlightGraphics = this.add.graphics();
    this.highlightGraphics.setDepth(25);

    // 3. Contenedor de Tooltip Diegético
    this.createTooltip();

    // 4. Objetos interactivos canónicos
    this.buildHotspots();

    // 5. Configuración de Cámara Principal
    this.cameras.main.setBounds(0, 0, 1920, 1080);
    this.cameras.main.setZoom(1.0);

    // 6. Controles de Teclado
    this.setupKeyboardNavigation();

    // 7. Registro de comandos con el GameBridge
    if (this.bridge) {
      this.unregisterCommands.push(
        this.bridge.registerCommandHandler('RESET_CAMERA', () => {
          this.resetCamera();
        })
      );
      this.unregisterCommands.push(
        this.bridge.registerCommandHandler('FOCUS_OBJECT', (hotspotId: string) => {
          this.focusHotspotById(hotspotId);
        })
      );
      this.unregisterCommands.push(
        this.bridge.registerCommandHandler('SET_ATTENTION_MODE', (active: boolean) => {
          this.toggleAttentionMode(active);
        })
      );

      this.bridge.emit('SCENE_READY', { sceneKey: 'RefugeScene' });
    }

    // 8. Limpieza en shutdown de la escena
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.cleanup();
      assetManager.releaseGroup(this, 'critical_refuge');
    });
  }

  private createTooltip(): void {
    this.tooltipContainer = this.add.container(0, 0);
    this.tooltipContainer.setDepth(30);
    this.tooltipContainer.setVisible(false);

    const bgRect = this.add.graphics();
    bgRect.fillStyle(0x1a1612, 0.92);
    bgRect.lineStyle(1, 0xd4af37, 0.9);
    bgRect.fillRoundedRect(-160, -32, 320, 48, 4);
    bgRect.strokeRoundedRect(-160, -32, 320, 48, 4);

    this.tooltipText = this.make.text({
      x: 0,
      y: -8,
      text: '',
      style: {
        font: '14px "Cinzel", serif',
        color: '#ede4d1',
        align: 'center'
      }
    });
    this.tooltipText.setOrigin(0.5, 0.5);

    this.tooltipContainer.add([bgRect, this.tooltipText]);
  }

  private buildHotspots(): void {
    const session = this.bridge?.getSession();
    const dynamicMirrorTexture = session ? getMirrorVariantAssetId(session.somatics?.corruptionTier) : 'obj_mirror_pristine';

    this.hotspotDefs.forEach((item, index) => {
      let textureToUse = item.textureKey;
      if (item.id === 'hotspot_mirror') {
        textureToUse = dynamicMirrorTexture;
      }

      let gameObject: Phaser.GameObjects.GameObject;

      if (textureToUse && this.textures.exists(textureToUse)) {
        // Sprite con imagen verificada
        const sprite = this.add.image(item.x, item.y, textureToUse);
        sprite.setDisplaySize(item.width, item.height);
        sprite.setDepth(10);
        sprite.setInteractive({ useHandCursor: true });
        gameObject = sprite;
      } else {
        // Zona interactiva transparente para puntos del entorno
        const zone = this.add.zone(item.x, item.y, item.width, item.height);
        zone.setInteractive({ useHandCursor: true });
        gameObject = zone;
      }

      gameObject.on('pointerover', () => {
        this.highlightItem(item, index);
        if (this.bridge) {
          this.bridge.emit('OBJECT_HOVERED', { hotspotId: item.id, label: item.label });
        }
      });

      gameObject.on('pointerout', () => {
        this.clearHighlight();
        if (this.bridge) {
          this.bridge.emit('OBJECT_HOVERED', { hotspotId: null });
        }
      });

      gameObject.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        if (pointer.leftButtonDown()) {
          this.activateHotspot(item);
        }
      });

      this.interactiveObjects.push(gameObject);
    });
  }

  private highlightItem(item: InteractiveHotspotItem, index: number): void {
    this.activeFocusedIndex = index;
    this.highlightGraphics.clear();
    this.highlightGraphics.lineStyle(2, 0xd4af37, 0.85);
    this.highlightGraphics.strokeRect(
      item.x - item.width / 2 - 4,
      item.y - item.height / 2 - 4,
      item.width + 8,
      item.height + 8
    );

    // Posicionar tooltip sobre el objeto
    const tooltipY = Math.max(60, item.y - item.height / 2 - 20);
    this.tooltipContainer.setPosition(item.x, tooltipY);
    this.tooltipText.setText(item.name);
    this.tooltipContainer.setVisible(true);
  }

  private clearHighlight(): void {
    this.activeFocusedIndex = -1;
    this.highlightGraphics.clear();
    this.tooltipContainer.setVisible(false);
  }

  private activateHotspot(item: InteractiveHotspotItem): void {
    // Zoom suave de cámara hacia el preset del objeto
    this.cameras.main.pan(item.preset.x, item.preset.y, 400, 'Sine.easeInOut');
    this.cameras.main.zoomTo(item.preset.zoom, 400, 'Sine.easeInOut');

    if (this.bridge) {
      this.bridge.emit('OBJECT_INSPECT_REQUESTED', {
        hotspotId: item.id,
        data: {
          name: item.name,
          label: item.label,
          bounds: { x: item.x, y: item.y, width: item.width, height: item.height }
        }
      });
      this.bridge.emit('CAMERA_PRESET_CHANGED', { preset: item.id });
    }
  }

  private focusHotspotById(hotspotId: string): void {
    const idx = this.hotspotDefs.findIndex(h => h.id === hotspotId);
    if (idx !== -1) {
      const item = this.hotspotDefs[idx];
      this.highlightItem(item, idx);
      this.activateHotspot(item);
    }
  }

  private resetCamera(): void {
    this.cameras.main.pan(960, 540, 400, 'Sine.easeInOut');
    this.cameras.main.zoomTo(1.0, 400, 'Sine.easeInOut');
    this.clearHighlight();
    if (this.bridge) {
      this.bridge.emit('CAMERA_PRESET_CHANGED', { preset: 'WIDE_OVERVIEW' });
    }
  }

  private toggleAttentionMode(active: boolean): void {
    if (active) {
      this.highlightGraphics.clear();
      this.highlightGraphics.lineStyle(1, 0xd4af37, 0.4);
      for (const item of this.hotspotDefs) {
        this.highlightGraphics.strokeRect(
          item.x - item.width / 2,
          item.y - item.height / 2,
          item.width,
          item.height
        );
      }
    } else {
      this.clearHighlight();
    }
  }

  private setupKeyboardNavigation(): void {
    this.input.keyboard?.on('keydown-TAB', (event: KeyboardEvent) => {
      event.preventDefault();
      const nextIndex = (this.activeFocusedIndex + 1) % this.hotspotDefs.length;
      const item = this.hotspotDefs[nextIndex];
      this.highlightItem(item, nextIndex);
    });

    this.input.keyboard?.on('keydown-ENTER', () => {
      if (this.activeFocusedIndex >= 0 && this.activeFocusedIndex < this.hotspotDefs.length) {
        this.activateHotspot(this.hotspotDefs[this.activeFocusedIndex]);
      }
    });

    this.input.keyboard?.on('keydown-SPACE', () => {
      if (this.activeFocusedIndex >= 0 && this.activeFocusedIndex < this.hotspotDefs.length) {
        this.activateHotspot(this.hotspotDefs[this.activeFocusedIndex]);
      }
    });

    this.input.keyboard?.on('keydown-ESC', () => {
      this.resetCamera();
    });
  }

  private cleanup(): void {
    for (const unregister of this.unregisterCommands) {
      try {
        unregister();
      } catch (err) {
        console.error('[RefugeScene] Error durante desregistro de comando:', err);
      }
    }
    this.unregisterCommands = [];
    this.input.keyboard?.removeAllListeners();
  }
}
