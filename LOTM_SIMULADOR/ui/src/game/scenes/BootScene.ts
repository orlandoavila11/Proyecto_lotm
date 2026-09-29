/**
 * BOOT SCENE — PATH TO GODHOOD (PHASER 4.2.1)
 * Inicialización de ciclo de vida del juego y transición inmediata a PreloadScene.
 */

import * as Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  public create(): void {
    // Configuración base de rendering y transición a precarga
    this.scene.start('PreloadScene');
  }
}
