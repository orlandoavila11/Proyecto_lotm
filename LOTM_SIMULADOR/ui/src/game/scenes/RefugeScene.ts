/**
 * REFUGE SCENE — EL DESVÁN EN PHASER 4.2.1 (PROMPT P06)
 * Anclado a la composición y dirección de arte V01.
 * Soporta los 11 objetos canónicos, cámara con presets gentiles y soporte de reduced-motion,
 * modo atención sin cajas persistentes, iluminación tenue victoriana y puente tipado con React.
 */

import * as Phaser from 'phaser';
import type { GameBridge } from '../bridge/GameBridge';
import { assetManager } from '../assets/AssetManager';

export interface InteractiveHotspotItem {
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
  private attentionGraphics!: Phaser.GameObjects.Graphics;
  private tooltipContainer!: Phaser.GameObjects.Container;
  private tooltipText!: Phaser.GameObjects.Text;
  private activeFocusedIndex: number = -1;
  private isAttentionActive: boolean = false;
  private isReducedMotion: boolean = false;

  // Catálogo de los 11 Hotspots Canónicos de El Desván (Lienzo 1920x1080, anclado a V01)
  private hotspotDefs: InteractiveHotspotItem[] = [
    {
      id: 'hotspot_candle',
      name: 'La Vela de Sebo',
      label: 'Llama viva y clara sobre peltre.',
      x: 420 + 160 / 2, // 500
      y: 320 + 380 / 2, // 510
      width: 160,
      height: 380,
      preset: { x: 960, y: 540 + 220, zoom: 1.35 }
    },
    {
      id: 'hotspot_mirror',
      name: 'El Espejo de Azogue',
      label: 'El azogue refleja tu semblante humano.',
      x: 580 + 240 / 2, // 700
      y: 390 + 290 / 2, // 535
      width: 240,
      height: 290,
      preset: { x: 960, y: 540 + 220, zoom: 1.35 }
    },
    {
      id: 'hotspot_acting_diary',
      name: 'Cuaderno de Cuero de Actuación',
      label: 'Cuaderno de cuero con marcapáginas carmesí.',
      x: 530 + 390 / 2, // 725
      y: 690 + 220 / 2, // 800
      width: 390,
      height: 220,
      preset: { x: 960, y: 540 + 220, zoom: 1.35 }
    },
    {
      id: 'hotspot_identity_papers',
      name: 'Pliegos Notariales de Identidad',
      label: 'Papeles civiles con sello y anclas.',
      x: 830 + 450 / 2, // 1055
      y: 660 + 190 / 2, // 755
      width: 450,
      height: 190,
      preset: { x: 960, y: 540 + 220, zoom: 1.35 }
    },
    {
      id: 'hotspot_bazaar_letter',
      name: 'Misiva Sellada del Benefactor',
      label: 'Carta con lacre carmesí sobre el tapete.',
      x: 1290 + 310 / 2, // 1445
      y: 720 + 110 / 2, // 775
      width: 310,
      height: 110,
      preset: { x: 960, y: 540 + 220, zoom: 1.35 }
    },
    {
      id: 'hotspot_almanack',
      name: 'Reloj de Faltriquera y Almanaque',
      label: 'Reloj de latón marcando la franja.',
      x: 1160 + 330 / 2, // 1325
      y: 390 + 250 / 2, // 515
      width: 330,
      height: 250,
      preset: { x: 960, y: 540 + 220, zoom: 1.35 }
    },
    {
      id: 'hotspot_money_pouch',
      name: 'Monedero de Cuero de Loen',
      label: 'Monedero gastado con libras y peniques.',
      x: 1470 + 210 / 2, // 1575
      y: 610 + 130 / 2, // 675
      width: 210,
      height: 130,
      preset: { x: 960, y: 540 + 220, zoom: 1.35 }
    },
    {
      id: 'hotspot_chalice',
      name: 'El Cáliz de Plata',
      label: 'Cáliz ceremonial en la hornacina umbría.',
      x: 800 + 220 / 2, // 910
      y: 220 + 300 / 2, // 370
      width: 220,
      height: 300,
      preset: { x: 960 - 80, y: 540 - 260, zoom: 1.65 }
    },
    {
      id: 'hotspot_corkboard',
      name: 'Tablero de Corcho de Investigación',
      label: 'Expediente Cherwood; pistas e hilos rojos.',
      x: 1460 + 420 / 2, // 1670
      y: 220 + 380 / 2, // 410
      width: 420,
      height: 380,
      preset: { x: 960 + 750, y: 540 - 140, zoom: 1.50 }
    },
    {
      id: 'hotspot_staircase_door',
      name: 'Escalera de Caracol y Zaguán',
      label: 'Escalera al zaguán; calma exterior.',
      x: 20 + 280 / 2, // 160
      y: 80 + 720 / 2, // 440
      width: 280,
      height: 720,
      preset: { x: 960 - 720, y: 540 + 40, zoom: 1.45 }
    },
    {
      id: 'hotspot_mahogany_cracks',
      name: 'Grietas de Ruina en la Caoba',
      label: 'Hendidura oscura tallada en la caoba.',
      x: 350 + 1200 / 2, // 950
      y: 860 + 110 / 2, // 915
      width: 1200,
      height: 110,
      preset: { x: 960, y: 540 + 220, zoom: 1.35 }
    }
  ];

  constructor() {
    super('RefugeScene');
  }

  public create(): void {
    this.bridge = this.registry.get('bridge') as GameBridge | undefined;

    // Detectar preferencia del sistema para reducción de movimiento
    if (typeof window !== 'undefined' && window.matchMedia) {
      this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    // 1. Capa de Fondo Maestro V01 (1920x1080 centrado en 960, 540)
    // El fondo desvan_bg provee la arquitectura y objetos integrados con su iluminación maestra
    const bg = this.add.image(960, 540, 'desvan_bg');
    bg.setDisplaySize(1920, 1080);
    bg.setDepth(0);

    // 2. Capas Gráficas de Resaltado y Modo Atención
    this.attentionGraphics = this.add.graphics();
    this.attentionGraphics.setDepth(15);

    this.highlightGraphics = this.add.graphics();
    this.highlightGraphics.setDepth(25);

    // 3. Contenedor de Tooltip Diegético Superior
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
    bgRect.fillStyle(0x1a1612, 0.94);
    bgRect.lineStyle(1, 0xd4af37, 0.9);
    bgRect.fillRoundedRect(-160, -32, 320, 48, 4);
    bgRect.strokeRoundedRect(-160, -32, 320, 48, 4);

    this.tooltipText = this.make.text({
      x: 0,
      y: -8,
      text: '',
      style: {
        font: '14px "Cinzel", Georgia, serif',
        color: '#ede4d1',
        align: 'center'
      }
    });
    this.tooltipText.setOrigin(0.5, 0.5);

    this.tooltipContainer.add([bgRect, this.tooltipText]);
  }

  private buildHotspots(): void {
    this.hotspotDefs.forEach((item, index) => {
      // Zona interactiva alineada con el objeto físico en la pintura
      const zone = this.add.zone(item.x, item.y, item.width, item.height);
      zone.setInteractive({ useHandCursor: true });

      zone.on('pointerover', () => {
        this.highlightItem(item, index);
        if (this.bridge) {
          this.bridge.emit('OBJECT_HOVERED', { hotspotId: item.id, label: item.label });
        }
      });

      zone.on('pointerout', () => {
        this.clearHighlight();
        if (this.bridge) {
          this.bridge.emit('OBJECT_HOVERED', { hotspotId: null });
        }
      });

      zone.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        if (pointer.leftButtonDown()) {
          this.activateHotspot(item);
        }
      });

      this.interactiveObjects.push(zone);
    });
  }

  private highlightItem(item: InteractiveHotspotItem, index: number): void {
    this.activeFocusedIndex = index;
    this.highlightGraphics.clear();
    
    // Borde sutil y elegante de latón envejecido (anclado a V01)
    this.highlightGraphics.lineStyle(2, 0xd4af37, 0.9);
    this.highlightGraphics.strokeRoundedRect(
      item.x - item.width / 2 - 2,
      item.y - item.height / 2 - 2,
      item.width + 4,
      item.height + 4,
      4
    );

    // Posicionar tooltip encima del objeto
    const tooltipY = Math.max(65, item.y - item.height / 2 - 24);
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
    const duration = this.isReducedMotion ? 0 : 400;

    // Zoom suave hacia el objeto (o corte inmediato en reduced-motion)
    if (duration > 0) {
      this.cameras.main.pan(item.preset.x, item.preset.y, duration, 'Sine.easeInOut');
      this.cameras.main.zoomTo(item.preset.zoom, duration, 'Sine.easeInOut');
    } else {
      this.cameras.main.centerOn(item.preset.x, item.preset.y);
      this.cameras.main.setZoom(item.preset.zoom);
    }

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

  public focusHotspotById(hotspotId: string): void {
    const idx = this.hotspotDefs.findIndex(h => h.id === hotspotId);
    if (idx !== -1) {
      const item = this.hotspotDefs[idx];
      this.highlightItem(item, idx);
      this.activateHotspot(item);
    }
  }

  public resetCamera(): void {
    const duration = this.isReducedMotion ? 0 : 400;
    if (duration > 0) {
      this.cameras.main.pan(960, 540, duration, 'Sine.easeInOut');
      this.cameras.main.zoomTo(1.0, duration, 'Sine.easeInOut');
    } else {
      this.cameras.main.centerOn(960, 540);
      this.cameras.main.setZoom(1.0);
    }
    this.clearHighlight();
    if (this.bridge) {
      this.bridge.emit('CAMERA_PRESET_CHANGED', { preset: 'WIDE_OVERVIEW' });
    }
  }

  public toggleAttentionMode(active?: boolean): void {
    this.isAttentionActive = active !== undefined ? active : !this.isAttentionActive;
    this.attentionGraphics.clear();

    if (this.isAttentionActive) {
      // Destello sutil en dorado victoriano para todos los objetos sin cajas persistentes
      this.attentionGraphics.lineStyle(1.5, 0xd4af37, 0.45);
      for (const item of this.hotspotDefs) {
        this.attentionGraphics.strokeRoundedRect(
          item.x - item.width / 2,
          item.y - item.height / 2,
          item.width,
          item.height,
          4
        );
      }
    }
  }

  private setupKeyboardNavigation(): void {
    this.input.keyboard?.on('keydown-TAB', (event: KeyboardEvent) => {
      event.preventDefault();
      const step = event.shiftKey ? -1 : 1;
      let nextIndex = this.activeFocusedIndex + step;
      if (nextIndex < 0) nextIndex = this.hotspotDefs.length - 1;
      if (nextIndex >= this.hotspotDefs.length) nextIndex = 0;

      const item = this.hotspotDefs[nextIndex];
      this.highlightItem(item, nextIndex);
    });

    this.input.keyboard?.on('keydown-ENTER', () => {
      if (this.activeFocusedIndex >= 0 && this.activeFocusedIndex < this.hotspotDefs.length) {
        this.activateHotspot(this.hotspotDefs[this.activeFocusedIndex]);
      }
    });

    this.input.keyboard?.on('keydown-SPACE', (event: KeyboardEvent) => {
      event.preventDefault();
      if (this.activeFocusedIndex >= 0 && this.activeFocusedIndex < this.hotspotDefs.length) {
        this.activateHotspot(this.hotspotDefs[this.activeFocusedIndex]);
      }
    });

    this.input.keyboard?.on('keydown-ESC', () => {
      this.resetCamera();
    });

    this.input.keyboard?.on('keydown-A', () => {
      this.toggleAttentionMode();
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
