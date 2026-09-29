/**
 * CREATE GAME — FACTORÍA DE CONFIGURACIÓN PHASER 4.2.1 (PROMPT P03)
 * Inicializa la instancia única de Phaser.Game gobernada por el ciclo de vida del host.
 */

import * as Phaser from 'phaser';
import type { GameBridge } from './bridge/GameBridge';
import { BootScene } from './scenes/BootScene';
import { PreloadScene } from './scenes/PreloadScene';
import { RefugeScene } from './scenes/RefugeScene';

export function createGame(parent: HTMLElement, bridge: GameBridge): Phaser.Game {
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent,
    width: 1920,
    height: 1080,
    backgroundColor: '#090807',
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: 1920,
      height: 1080
    },
    render: {
      antialias: true,
      pixelArt: false,
      roundPixels: true
    },
    scene: [BootScene, PreloadScene, RefugeScene]
  };

  const game = new Phaser.Game(config);
  game.registry.set('bridge', bridge);

  return game;
}
