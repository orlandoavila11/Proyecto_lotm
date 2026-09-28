/**
 * GAME BRIDGE — PUENTE TIPADO REACT <-> PHASER (PROMPT P03)
 * Conexión bidireccional tipada entre la capa de simulación/UI React y la escena Phaser 4.2.1.
 * Regla: Prohibido un emisor global no tipado que transporte entidades completas de base de datos.
 */

export interface BridgeSessionState {
  characterId: string;
  name: string;
  profession: string;
  originTitle: string;
  district: string;
  pathwayName: string;
  sequenceTitle: string;
  somatics: {
    sanityTier: string;
    corruptionTier: string;
    ruinaTier: string | number;
    candleDescription?: string;
    mirrorDescription?: string;
    woodDescription?: string;
  };
  walletText: string;
  timeSlot: string;
  dayNumber: number;
}

export interface GameBridgeEventMap {
  OBJECT_HOVERED: { hotspotId: string | null; label?: string };
  OBJECT_INSPECT_REQUESTED: { hotspotId: string; data?: unknown };
  SCENE_READY: { sceneKey: string };
  LOAD_PROGRESS: { progress: number };
  LOAD_ERROR: { key: string; url: string; error: string };
  CAMERA_PRESET_CHANGED: { preset: string };
}

export type GameBridgeEvent = keyof GameBridgeEventMap;
export type GameBridgeHandler<E extends GameBridgeEvent> = (payload: GameBridgeEventMap[E]) => void;

export class GameBridge {
  private listeners: Map<GameBridgeEvent, Set<GameBridgeHandler<any>>> = new Map();
  private sessionState: BridgeSessionState | null = null;
  private commandHandlers: Map<string, (...args: any[]) => void> = new Map();

  constructor(initialSession?: BridgeSessionState) {
    if (initialSession) {
      this.sessionState = initialSession;
    }
  }

  // --- Manejo de Eventos (Phaser -> React / Subscriptores) ---

  public on<E extends GameBridgeEvent>(event: E, handler: GameBridgeHandler<E>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    const handlers = this.listeners.get(event)!;
    handlers.add(handler);

    return () => {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.listeners.delete(event);
      }
    };
  }

  public emit<E extends GameBridgeEvent>(event: E, payload: GameBridgeEventMap[E]): void {
    const handlers = this.listeners.get(event);
    if (handlers) {
      for (const handler of Array.from(handlers)) {
        try {
          handler(payload);
        } catch (err) {
          console.error(`[GameBridge] Error procesando evento ${event}:`, err);
        }
      }
    }
  }

  // --- Estado de Sesión Público ---

  public getSession(): BridgeSessionState | null {
    return this.sessionState;
  }

  public updateSession(session: BridgeSessionState): void {
    this.sessionState = session;
    this.executeCommand('ON_SESSION_UPDATED', session);
  }

  // --- Comandos de React hacia Phaser ---

  public registerCommandHandler(command: string, handler: (...args: any[]) => void): () => void {
    this.commandHandlers.set(command, handler);
    return () => {
      if (this.commandHandlers.get(command) === handler) {
        this.commandHandlers.delete(command);
      }
    };
  }

  public executeCommand(command: string, ...args: any[]): void {
    const handler = this.commandHandlers.get(command);
    if (handler) {
      try {
        handler(...args);
      } catch (err) {
        console.error(`[GameBridge] Error ejecutando comando ${command}:`, err);
      }
    }
  }

  public focusObject(hotspotId: string): void {
    this.executeCommand('FOCUS_OBJECT', hotspotId);
  }

  public resetCamera(): void {
    this.executeCommand('RESET_CAMERA');
  }

  public setAttentionMode(active: boolean): void {
    this.executeCommand('SET_ATTENTION_MODE', active);
  }

  // --- Destrucción y Limpieza ---

  public destroy(): void {
    this.listeners.clear();
    this.commandHandlers.clear();
    this.sessionState = null;
  }
}
