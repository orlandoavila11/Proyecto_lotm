/**
 * TESTS DE VERIFICACIÓN DE GAME BRIDGE Y CONTROLADOR TIPADO (PROMPT P03)
 * Valida el contrato bidireccional tipado entre la simulación y Phaser 4.2.1,
 * aislamiento de errores, ciclo de vida de escuchadores y actualización de sesión.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { GameBridge, type BridgeSessionState } from '../../ui/src/game/bridge/GameBridge.ts';

describe('PROMPT P03: GameBridge — Puente Tipado React <-> Phaser', () => {

  const dummySession: BridgeSessionState = {
    characterId: 'char_test_123',
    name: 'Samuel Finch',
    profession: 'Detective Privado',
    originTitle: 'Detective Privado',
    district: 'Backlund - Cherwood',
    pathwayName: 'El Loco (Fool)',
    sequenceTitle: 'Vidente (Secuencia 9)',
    somatics: {
      sanityTier: 'BRILLANTE',
      corruptionTier: 'AZOGUE_LIMPIO',
      ruinaTier: 'INTEGRO',
      candleDescription: 'Llama pura y erguida.',
      mirrorDescription: 'El azogue refleja tu semblante humano.'
    },
    walletText: '2 £, 8 s y 4 d',
    timeSlot: 'TARDE',
    dayNumber: 4
  };

  it('1. Inicializa con estado de sesión y permite consulta pública', () => {
    const bridge = new GameBridge(dummySession);
    const session = bridge.getSession();

    assert.ok(session !== null);
    assert.equal(session?.characterId, 'char_test_123');
    assert.equal(session?.sequenceTitle, 'Vidente (Secuencia 9)');
    assert.equal(session?.somatics.sanityTier, 'BRILLANTE');

    bridge.destroy();
  });

  it('2. Emite eventos tipados de Phaser hacia subscriptores de UI', () => {
    const bridge = new GameBridge(dummySession);
    const receivedEvents: Array<{ event: string; payload: any }> = [];

    const unsubHover = bridge.on('OBJECT_HOVERED', (payload) => {
      receivedEvents.push({ event: 'OBJECT_HOVERED', payload });
    });

    const unsubInspect = bridge.on('OBJECT_INSPECT_REQUESTED', (payload) => {
      receivedEvents.push({ event: 'OBJECT_INSPECT_REQUESTED', payload });
    });

    // Simular eventos generados en la escena de Phaser
    bridge.emit('OBJECT_HOVERED', {
      hotspotId: 'hotspot_almanack',
      label: 'Reloj de latón marcando la franja.'
    });

    bridge.emit('OBJECT_INSPECT_REQUESTED', {
      hotspotId: 'hotspot_almanack',
      data: { source: 'canvas_click' }
    });

    assert.equal(receivedEvents.length, 2);
    assert.equal(receivedEvents[0].event, 'OBJECT_HOVERED');
    assert.equal(receivedEvents[0].payload.hotspotId, 'hotspot_almanack');
    assert.equal(receivedEvents[1].event, 'OBJECT_INSPECT_REQUESTED');
    assert.equal(receivedEvents[1].payload.hotspotId, 'hotspot_almanack');

    // Desubscripción limpia
    unsubHover();
    unsubInspect();

    bridge.emit('OBJECT_HOVERED', { hotspotId: null });
    assert.equal(receivedEvents.length, 2, 'No deben recibirse eventos tras desubscribirse');

    bridge.destroy();
  });

  it('3. Maneja comandos desde React hacia la escena de Phaser', () => {
    const bridge = new GameBridge(dummySession);
    const executedCommands: Array<{ command: string; args: any[] }> = [];

    const unregFocus = bridge.registerCommandHandler('FOCUS_OBJECT', (hotspotId: string) => {
      executedCommands.push({ command: 'FOCUS_OBJECT', args: [hotspotId] });
    });

    const unregReset = bridge.registerCommandHandler('RESET_CAMERA', () => {
      executedCommands.push({ command: 'RESET_CAMERA', args: [] });
    });

    bridge.focusObject('hotspot_candle');
    bridge.resetCamera();

    assert.equal(executedCommands.length, 2);
    assert.equal(executedCommands[0].command, 'FOCUS_OBJECT');
    assert.equal(executedCommands[0].args[0], 'hotspot_candle');
    assert.equal(executedCommands[1].command, 'RESET_CAMERA');

    // Desregistro
    unregFocus();
    unregReset();

    bridge.focusObject('hotspot_mirror');
    assert.equal(executedCommands.length, 2, 'No deben ejecutarse comandos tras desregistro');

    bridge.destroy();
  });

  it('4. Aísla errores en escuchadores sin romper el flujo del puente', () => {
    const bridge = new GameBridge(dummySession);
    let secondHandlerExecuted = false;

    bridge.on('OBJECT_HOVERED', () => {
      throw new Error('Fallo simulado en escuchador defectuoso');
    });

    bridge.on('OBJECT_HOVERED', () => {
      secondHandlerExecuted = true;
    });

    // La emisión no debe lanzar excepción no controlada
    assert.doesNotThrow(() => {
      bridge.emit('OBJECT_HOVERED', { hotspotId: 'hotspot_candle' });
    });

    assert.equal(secondHandlerExecuted, true, 'El segundo escuchador debe ejecutarse a pesar del error en el primero');

    bridge.destroy();
  });

  it('5. Sincroniza la actualización de sesión y notifica cambios', () => {
    const bridge = new GameBridge(dummySession);
    let sessionUpdatedCalled = false;

    bridge.registerCommandHandler('ON_SESSION_UPDATED', (newSession: BridgeSessionState) => {
      sessionUpdatedCalled = true;
      assert.equal(newSession.timeSlot, 'NOCHE');
      assert.equal(newSession.dayNumber, 5);
    });

    bridge.updateSession({
      ...dummySession,
      timeSlot: 'NOCHE',
      dayNumber: 5
    });

    assert.equal(sessionUpdatedCalled, true);
    assert.equal(bridge.getSession()?.timeSlot, 'NOCHE');
    assert.equal(bridge.getSession()?.dayNumber, 5);

    bridge.destroy();
  });

  it('6. Limpia completamente todos los escuchadores y estado en destroy()', () => {
    const bridge = new GameBridge(dummySession);
    let eventReceived = false;

    bridge.on('LOAD_PROGRESS', () => {
      eventReceived = true;
    });

    bridge.destroy();

    bridge.emit('LOAD_PROGRESS', { progress: 0.5 });
    assert.equal(eventReceived, false);
    assert.equal(bridge.getSession(), null);
  });

});
