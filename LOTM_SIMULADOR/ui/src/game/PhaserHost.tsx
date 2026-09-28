/**
 * PHASER HOST — CONTENEDOR REACT PARA PHASER 4.2.1 (PROMPT P03)
 * Administra el ciclo de vida de Phaser.Game, previene fugas en React StrictMode,
 * expone el overlay accesible React y coordina la navegación con el GameBridge.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import type { CharacterDiegetic, TimeSlot } from '../features/types';
import { CANONICAL_HOTSPOTS, type HotspotId } from '../scene/types';
import { GameBridge, type BridgeSessionState } from './bridge/GameBridge';
import { createGame } from './createGame';
import { apiClient } from '../services/apiClient';

interface PhaserHostProps {
  character: CharacterDiegetic;
  timeSlot: TimeSlot;
  dayNumber: number;
  onOpenCorkboard: () => void;
  onOpenCalendar: () => void;
  onOpenMarket: () => void;
  onOpenCombat: () => void;
  onOpenAscension: () => void;
  onOpenActing: () => void;
  onOpenIdentity: () => void;
  onToggleSpiritVision: () => void;
  spiritVisionActive: boolean;
  onSwitchToReactRenderer?: () => void;
}

export const PhaserHost: React.FC<PhaserHostProps> = ({
  character,
  timeSlot,
  dayNumber,
  onOpenCorkboard,
  onOpenCalendar,
  onOpenMarket,
  onOpenCombat,
  onOpenAscension,
  onOpenActing,
  onOpenIdentity,
  onToggleSpiritVision,
  spiritVisionActive,
  onSwitchToReactRenderer
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const bridgeRef = useRef<GameBridge | null>(null);
  const previousFocusedElementRef = useRef<HTMLElement | null>(null);
  const dialogCloseButtonRef = useRef<HTMLButtonElement | null>(null);

  // Estados de presentación sincronizados desde el GameBridge
  const [hoveredHotspot, setHoveredHotspot] = useState<{ id: string | null; label?: string }>({ id: null });
  const [inspectedHotspotId, setInspectedHotspotId] = useState<HotspotId | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [interactionResult, setInteractionResult] = useState<string | null>(null);
  const [isPerformingAction, setIsPerformingAction] = useState<boolean>(false);

  // Preparar el DTO de sesión para el puente
  const buildSessionSnapshot = useCallback((): BridgeSessionState => ({
    characterId: character.id,
    name: character.name,
    profession: character.profession,
    originTitle: character.originTitle,
    district: character.district,
    pathwayName: character.pathwayName,
    sequenceTitle: character.sequenceTitle,
    somatics: {
      sanityTier: character.somatics.sanityTier,
      corruptionTier: character.somatics.corruptionTier,
      ruinaTier: character.somatics.ruinaTier,
      candleDescription: character.somatics.candleDescription,
      mirrorDescription: character.somatics.mirrorDescription,
      woodDescription: character.somatics.woodDescription
    },
    walletText: character.walletText,
    timeSlot,
    dayNumber
  }), [character, timeSlot, dayNumber]);

  // Montaje e inicialización de ciclo de vida seguro de Phaser 4.2.1
  useEffect(() => {
    if (!containerRef.current) return;

    // Guardar referencia al elemento activo antes de montar
    previousFocusedElementRef.current = document.activeElement as HTMLElement | null;

    // Limpieza estricta de cualquier instancia previa (p. ej. en React StrictMode)
    if (gameRef.current) {
      gameRef.current.destroy(true);
      gameRef.current = null;
    }
    if (bridgeRef.current) {
      bridgeRef.current.destroy();
      bridgeRef.current = null;
    }

    // Vaciar el contenedor de canvas residuales
    while (containerRef.current.firstChild) {
      containerRef.current.removeChild(containerRef.current.firstChild);
    }

    // Instanciar el puente y el juego
    const bridge = new GameBridge(buildSessionSnapshot());
    bridgeRef.current = bridge;

    // Subscripciones tipadas a eventos del GameBridge
    const unsubHover = bridge.on('OBJECT_HOVERED', (payload) => {
      setHoveredHotspot({ id: payload.hotspotId, label: payload.label });
    });

    const unsubInspect = bridge.on('OBJECT_INSPECT_REQUESTED', (payload) => {
      const validHotspot = payload.hotspotId in CANONICAL_HOTSPOTS ? (payload.hotspotId as HotspotId) : null;
      if (validHotspot) {
        setInspectedHotspotId(validHotspot);
        setInteractionResult(null);
      }
    });

    const unsubError = bridge.on('LOAD_ERROR', (payload) => {
      setLoadError(`${payload.key}: ${payload.error}`);
    });

    const game = createGame(containerRef.current, bridge);
    gameRef.current = game;
    if (typeof window !== 'undefined') {
      (window as any).__PHASER_GAME__ = game;
    }

    // Limpieza al desmontar
    return () => {
      unsubHover();
      unsubInspect();
      unsubError();

      if (typeof window !== 'undefined') {
        delete (window as any).__PHASER_GAME__;
      }
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
      if (bridgeRef.current) {
        bridgeRef.current.destroy();
        bridgeRef.current = null;
      }
    };
  }, []); // Montaje único gobernado por el contenedor

  // Sincronizar cambios de sesión con el puente sin recrear el juego
  useEffect(() => {
    if (bridgeRef.current) {
      bridgeRef.current.updateSession(buildSessionSnapshot());
    }
  }, [buildSessionSnapshot]);

  // Manejo de foco accesible cuando se abre el diálogo de inspección
  useEffect(() => {
    if (inspectedHotspotId) {
      previousFocusedElementRef.current = document.activeElement as HTMLElement | null;
      setTimeout(() => {
        dialogCloseButtonRef.current?.focus();
      }, 50);
    }
  }, [inspectedHotspotId]);

  // Cerrar inspección y restaurar foco
  const handleCloseInspection = useCallback(() => {
    setInspectedHotspotId(null);
    setInteractionResult(null);
    if (bridgeRef.current) {
      bridgeRef.current.resetCamera();
    }
    // Restaurar foco al elemento que inició la interacción
    if (previousFocusedElementRef.current && typeof previousFocusedElementRef.current.focus === 'function') {
      previousFocusedElementRef.current.focus();
    } else {
      containerRef.current?.focus();
    }
  }, []);

  // Manejo de teclado global para el diálogo (ESC cierra)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && inspectedHotspotId) {
        e.preventDefault();
        handleCloseInspection();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inspectedHotspotId, handleCloseInspection]);

  // Ejecución de una interacción/mutación no destructiva a través del gateway (P02/P03)
  const handleExecuteInteraction = async (actionType: string) => {
    setIsPerformingAction(true);
    setInteractionResult(null);
    try {
      if (actionType === 'CHECK_RECEIPT') {
        const testCommandId = `cmd_probe_${Date.now()}`;
        const receipt = await apiClient.getCommandReceipt(testCommandId);
        setInteractionResult(
          receipt
            ? `Recibo verificado: Revisión ${receipt.revision}`
            : 'Sin recibo previo para este identificador. Registro limpio.'
        );
      } else if (actionType === 'INSPECT_ALMANAC') {
        setInteractionResult(
          `Almanaque consultado: Día ${dayNumber} del mes civil, Franja de la ${timeSlot}. Las manecillas de latón marcan el transcurso ordinario de Backlund.`
        );
      } else if (actionType === 'INSPECT_LETTER') {
        setInteractionResult(
          'Carta examinada: La cera carmesí lleva la impronta del Benefactor. El texto te recuerda tus compromisos en Cherwood.'
        );
      } else {
        setInteractionResult('Interacción diegética completada.');
      }
    } catch (err: any) {
      setInteractionResult(`Fallo en la comunicación con el registro: ${err.message || 'Error de red'}`);
    } finally {
      setIsPerformingAction(false);
    }
  };

  const inspectedContract = inspectedHotspotId ? CANONICAL_HOTSPOTS[inspectedHotspotId] : null;

  return (
    <div 
      className="relative w-[1920px] h-[1080px] overflow-hidden bg-[#090807] text-[#e5ded2] select-none"
      role="region"
      aria-label="Escenario Diegético Phaser de El Desván"
    >
      {/* Contenedor DOM para el Canvas de Phaser 4.2.1 */}
      <div 
        id="phaser-game-container"
        ref={containerRef} 
        tabIndex={0}
        aria-label="Lienzo de juego interactivo"
        className="w-full h-full outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37]"
      />

      {/* Barra de Navegación Accesible para Lectores de Pantalla y Teclado */}
      <nav 
        aria-label="Objetos interactivos del Desván"
        className="sr-only focus-within:not-sr-only focus-within:absolute focus-within:top-4 focus-within:left-4 focus-within:z-50 focus-within:bg-[#1a1612] focus-within:p-3 focus-within:border focus-within:border-[#8c733e] focus-within:rounded"
      >
        <span className="block text-xs font-serif text-[#d4af37] mb-2">Accesibilidad de Teclado:</span>
        <div className="flex flex-wrap gap-2">
          {Object.values(CANONICAL_HOTSPOTS).map((hotspot) => (
            <button
              key={hotspot.id}
              type="button"
              onClick={() => {
                bridgeRef.current?.focusObject(hotspot.id);
                setInspectedHotspotId(hotspot.id);
              }}
              className="px-2 py-1 text-xs bg-[#2b1b10] border border-[#8c733e] text-[#ede4d1] hover:bg-[#3d2717] focus:ring-2 focus:ring-[#d4af37]"
            >
              {hotspot.accessibleName}
            </button>
          ))}
        </div>
      </nav>

      {/* Notificación de Error de Carga de Recursos */}
      {loadError && (
        <div 
          role="alert" 
          className="absolute top-4 right-4 z-40 bg-[#2b1b10] border-2 border-red-700 text-red-200 px-4 py-2 rounded text-xs font-mono shadow-lg"
        >
          <p className="font-bold">Aviso de Recurso:</p>
          <p>{loadError}</p>
        </div>
      )}

      {/* Controles de Ayuda y Selector de Renderer */}
      <div className="absolute top-4 left-4 z-30 flex items-center gap-3">
        <span className="px-3 py-1 bg-[#1a1612]/90 border border-[#8c733e]/60 rounded text-xs font-serif text-[#d4af37]">
          Motor: Phaser 4.2.1 (Dual Mode Activo)
        </span>
        {onSwitchToReactRenderer && (
          <button
            type="button"
            onClick={onSwitchToReactRenderer}
            className="px-3 py-1 bg-[#1c1813] hover:bg-[#2b241c] border border-[#8c733e] rounded text-xs font-serif text-[#ede4d1] transition-colors cursor-pointer"
          >
            Cambiar a Renderizador React DOM
          </button>
        )}
        <button
          type="button"
          onClick={() => {
            const url = new URL(window.location.href);
            url.searchParams.set('gallery', 'true');
            window.location.href = url.toString();
          }}
          className="px-3 py-1 bg-[#1c1813] hover:bg-[#2b241c] border border-[#8c733e] rounded text-xs font-serif text-[#ede4d1] transition-colors cursor-pointer"
        >
          Galería UI P04 (?gallery=true)
        </button>
      </div>

      {/* Barra de Estado Diegética Superior */}
      <header className="absolute top-4 right-4 z-30 flex items-center gap-4 px-4 py-1.5 bg-[#1a1612]/80 border border-[#8c733e]/40 rounded text-xs font-serif text-[#ede4d1]">
        <span>{character.name}</span>
        <span className="text-[#8c733e]">·</span>
        <span>{character.sequenceTitle}</span>
        <span className="text-[#8c733e]">·</span>
        <span className="text-[#d4af37]">{character.walletText}</span>
      </header>

      {/* Etiqueta de Inspección en Reposo (Regla Constitucional: Máximo 7 palabras) */}
      {hoveredHotspot.id && hoveredHotspot.label && !inspectedHotspotId && (
        <div 
          aria-live="polite"
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 px-4 py-1.5 bg-[#1a1612]/90 border border-[#8c733e]/80 rounded text-sm font-serif text-[#ede4d1] shadow-md pointer-events-none"
        >
          {hoveredHotspot.label}
        </div>
      )}

      {/* =====================================================================
          OVERLAY ACCESIBLE REACT PARA INSPECCIÓN DIEGÉTICA Y ACCIONES FOCALES
          ===================================================================== */}
      {inspectedContract && (
        <div 
          role="dialog"
          aria-modal="true"
          aria-labelledby="dialog-title"
          className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-6"
        >
          <div 
            className="relative w-full max-w-xl bg-[#1c140e] border-2 border-[#8c733e] rounded-md shadow-2xl p-6 text-[#ede4d1]"
          >
            {/* Encabezado */}
            <div className="flex justify-between items-start border-b border-[#8c733e]/40 pb-3 mb-4">
              <h2 id="dialog-title" className="text-xl font-serif text-[#d4af37]">
                {inspectedContract.accessibleName}
              </h2>
              <button
                ref={dialogCloseButtonRef}
                type="button"
                onClick={handleCloseInspection}
                className="px-2.5 py-1 text-xs bg-[#2b1b10] border border-[#8c733e] rounded text-[#ede4d1] hover:bg-[#3d2717] focus:ring-2 focus:ring-[#d4af37]"
                aria-label="Cerrar panel de inspección"
              >
                Cerrar (Esc)
              </button>
            </div>

            {/* Prosa y Momento Diegético */}
            <div className="space-y-4 font-serif text-sm leading-relaxed">
              <p className="text-[#ede4d1] italic">
                {inspectedContract.proseMoment || inspectedContract.restingLabel}
              </p>

              {/* Detalles Específicos por Objeto */}
              {inspectedContract.id === 'hotspot_almanack' && (
                <div className="bg-[#120e0a] p-3 rounded border border-[#8c733e]/30 space-y-2">
                  <p className="text-xs text-[#a89f91]">
                    Franja horaria: <strong className="text-[#d4af37]">{timeSlot}</strong> · Día del calendario: <strong className="text-[#d4af37]">{dayNumber}</strong>
                  </p>
                  <p className="text-xs text-[#a89f91]">
                    Distrito civil: <strong className="text-[#ede4d1]">{character.district}</strong>
                  </p>
                  <div className="pt-2 flex gap-2">
                    <button
                      type="button"
                      disabled={isPerformingAction}
                      onClick={() => handleExecuteInteraction('INSPECT_ALMANAC')}
                      className="px-3 py-1.5 text-xs bg-[#2b1b10] border border-[#8c733e] rounded text-[#d4af37] hover:bg-[#3d2717] disabled:opacity-50"
                    >
                      {isPerformingAction ? 'Consultando...' : 'Examinar Horas y Cuadrante'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleCloseInspection();
                        onOpenCalendar();
                      }}
                      className="px-3 py-1.5 text-xs bg-[#8c733e]/20 border border-[#8c733e] rounded text-[#ede4d1] hover:bg-[#8c733e]/40"
                    >
                      Abrir Agenda Completa
                    </button>
                  </div>
                </div>
              )}

              {inspectedContract.id === 'hotspot_bazaar_letter' && (
                <div className="bg-[#120e0a] p-3 rounded border border-[#8c733e]/30 space-y-2">
                  <p className="text-xs text-[#a89f91]">
                    Correspondencia cerrada de Backlund. Contiene direcciones para el comercio subterráneo.
                  </p>
                  <div className="pt-2 flex gap-2">
                    <button
                      type="button"
                      disabled={isPerformingAction}
                      onClick={() => handleExecuteInteraction('INSPECT_LETTER')}
                      className="px-3 py-1.5 text-xs bg-[#2b1b10] border border-[#8c733e] rounded text-[#d4af37] hover:bg-[#3d2717] disabled:opacity-50"
                    >
                      {isPerformingAction ? 'Examinando...' : 'Leer Advertencia del Sobre'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleCloseInspection();
                        onOpenMarket();
                      }}
                      className="px-3 py-1.5 text-xs bg-[#8c733e]/20 border border-[#8c733e] rounded text-[#ede4d1] hover:bg-[#8c733e]/40"
                    >
                      Acudir al Mercado Oculto
                    </button>
                  </div>
                </div>
              )}

              {inspectedContract.id === 'hotspot_candle' && (
                <div className="bg-[#120e0a] p-3 rounded border border-[#8c733e]/30 space-y-1">
                  <p className="text-xs text-[#a89f91]">
                    Estado somático: <strong className="text-[#d4af37]">{character.somatics.candleDescription || 'La llama arde con firmeza.'}</strong>
                  </p>
                  <p className="text-xs text-[#a89f91]">
                    Claridad mental: <strong className="text-[#ede4d1]">{character.somatics.sanityTier}</strong>
                  </p>
                </div>
              )}

              {inspectedContract.id === 'hotspot_mirror' && (
                <div className="bg-[#120e0a] p-3 rounded border border-[#8c733e]/30 space-y-2">
                  <p className="text-xs text-[#a89f91]">
                    Reflejo: <strong className="text-[#d4af37]">{character.somatics.mirrorDescription || 'El azogue permanece sereno.'}</strong>
                  </p>
                  <div className="pt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        handleCloseInspection();
                        onOpenActing();
                      }}
                      className="px-3 py-1.5 text-xs bg-[#8c733e]/20 border border-[#8c733e] rounded text-[#ede4d1] hover:bg-[#8c733e]/40"
                    >
                      Abrir Cuaderno de Actuación
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onToggleSpiritVision();
                        handleCloseInspection();
                      }}
                      className="px-3 py-1.5 text-xs bg-[#2b1b10] border border-[#8c733e] rounded text-[#d4af37] hover:bg-[#3d2717]"
                    >
                      {spiritVisionActive ? 'Disipar Visión Espiritual' : 'Activar Visión Espiritual'}
                    </button>
                  </div>
                </div>
              )}

              {inspectedContract.id === 'hotspot_corkboard' && (
                <div className="bg-[#120e0a] p-3 rounded border border-[#8c733e]/30 space-y-2">
                  <p className="text-xs text-[#a89f91]">
                    Expediente y testimonios fijados con alfileres y cintas carmesíes.
                  </p>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        handleCloseInspection();
                        onOpenCorkboard();
                      }}
                      className="px-3 py-1.5 text-xs bg-[#8c733e]/20 border border-[#8c733e] rounded text-[#ede4d1] hover:bg-[#8c733e]/40"
                    >
                      Examinar Tablero de Investigación
                    </button>
                  </div>
                </div>
              )}

              {inspectedContract.id === 'hotspot_staircase_door' && (
                <div className="bg-[#120e0a] p-3 rounded border border-[#8c733e]/30 space-y-2">
                  <p className="text-xs text-[#a89f91]">
                    Descenso hacia los zaguanes y callejones de Backlund.
                  </p>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        handleCloseInspection();
                        onOpenCombat();
                      }}
                      className="px-3 py-1.5 text-xs bg-[#8c733e]/20 border border-[#8c733e] rounded text-[#ede4d1] hover:bg-[#8c733e]/40"
                    >
                      Descender al Zaguán (Alerta Táctica)
                    </button>
                  </div>
                </div>
              )}

              {inspectedContract.id === 'hotspot_chalice' && (
                <div className="bg-[#120e0a] p-3 rounded border border-[#8c733e]/30 space-y-2">
                  <p className="text-xs text-[#a89f91]">
                    Hornacina con el cáliz para las fórmulas y transmutaciones de Secuencia.
                  </p>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        handleCloseInspection();
                        onOpenAscension();
                      }}
                      className="px-3 py-1.5 text-xs bg-[#8c733e]/20 border border-[#8c733e] rounded text-[#ede4d1] hover:bg-[#8c733e]/40"
                    >
                      Preparar Ritual de Ascensión
                    </button>
                  </div>
                </div>
              )}

              {inspectedContract.id === 'hotspot_identity_papers' && (
                <div className="bg-[#120e0a] p-3 rounded border border-[#8c733e]/30 space-y-2">
                  <p className="text-xs text-[#a89f91]">
                    Documentación civil, registros notariales y constancia de tus deudas y anclas.
                  </p>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        handleCloseInspection();
                        onOpenIdentity();
                      }}
                      className="px-3 py-1.5 text-xs bg-[#8c733e]/20 border border-[#8c733e] rounded text-[#ede4d1] hover:bg-[#8c733e]/40"
                    >
                      Examinar Pliegos de Identidad y Anclas
                    </button>
                  </div>
                </div>
              )}

              {/* Botón de Verificación Transaccional / Recibo (Prueba de Gateway P02) */}
              <div className="pt-2 border-t border-[#8c733e]/20 flex items-center justify-between text-xs">
                <button
                  type="button"
                  disabled={isPerformingAction}
                  onClick={() => handleExecuteInteraction('CHECK_RECEIPT')}
                  className="text-[#8c733e] hover:text-[#d4af37] underline cursor-pointer"
                >
                  Verificar estado de recibo transaccional
                </button>
              </div>

              {/* Resultado de la Interacción */}
              {interactionResult && (
                <div 
                  aria-live="polite"
                  className="mt-3 p-2 bg-[#2b1b10] border border-[#8c733e]/50 rounded text-xs text-[#ede4d1]"
                >
                  {interactionResult}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
