/**
 * PHASER HOST — CONTENEDOR REACT PARA PHASER 4.2.1 (PROMPT P06)
 * Anclado a la composición visual V01 (El Desván como Lugar Sagrado y Civil).
 * Administra el ciclo de vida de Phaser.Game, la barra de objetivos diegética,
 * navegación por teclado y el modal accesible InspectionPanel (P04) con enrutamiento seguro de salida.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import type { CharacterDiegetic, TimeSlot } from '../features/types';
import { CANONICAL_HOTSPOTS, type HotspotId } from '../scene/types';
import { GameBridge, type BridgeSessionState } from './bridge/GameBridge';
import { createGame } from './createGame';
import { apiClient } from '../services/apiClient';
import { InspectionPanel } from '../presentation/InspectionPanel';
import { ActionButton } from '../presentation/ActionButton';
import { 
  Eye, 
  BookOpen, 
  MapPin, 
  Coins, 
  ShieldAlert, 
  Footprints, 
  Compass, 
  Sparkles, 
  SlidersHorizontal 
} from 'lucide-react';

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
  const initiatingElementRef = useRef<HTMLElement | null>(null);

  // Estados de presentación sincronizados desde el GameBridge y UI
  const [hoveredHotspot, setHoveredHotspot] = useState<{ id: string | null; label?: string }>({ id: null });
  const [inspectedHotspotId, setInspectedHotspotId] = useState<HotspotId | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [interactionResult, setInteractionResult] = useState<string | null>(null);
  const [isPerformingAction, setIsPerformingAction] = useState<boolean>(false);
  const [isAttentionModeActive, setIsAttentionModeActive] = useState<boolean>(false);
  const [showObjectiveBanner, setShowObjectiveBanner] = useState<boolean>(true);

  // Preparar el DTO de sesión para el puente con datos reales confirmados
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

  // Actualizar el estado de sesión en el puente cuando cambien las props
  useEffect(() => {
    if (bridgeRef.current) {
      bridgeRef.current.updateSession(buildSessionSnapshot());
    }
  }, [buildSessionSnapshot]);

  // Montaje único del motor Phaser 4.2.1
  useEffect(() => {
    if (!containerRef.current) return;

    if (gameRef.current) {
      gameRef.current.destroy(true);
      gameRef.current = null;
    }
    if (bridgeRef.current) {
      bridgeRef.current.destroy();
      bridgeRef.current = null;
    }

    while (containerRef.current.firstChild) {
      containerRef.current.removeChild(containerRef.current.firstChild);
    }

    const bridge = new GameBridge(buildSessionSnapshot());
    bridgeRef.current = bridge;

    const unsubHover = bridge.on('OBJECT_HOVERED', (payload) => {
      setHoveredHotspot({ id: payload.hotspotId, label: payload.label });
    });

    const unsubInspect = bridge.on('OBJECT_INSPECT_REQUESTED', (payload) => {
      const validHotspot = payload.hotspotId in CANONICAL_HOTSPOTS ? (payload.hotspotId as HotspotId) : null;
      if (validHotspot) {
        initiatingElementRef.current = document.activeElement as HTMLElement | null;
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
  }, []);

  // Cierre de inspección y restauración de cámara / foco
  const handleCloseInspection = useCallback(() => {
    setInspectedHotspotId(null);
    setInteractionResult(null);
    bridgeRef.current?.resetCamera();

    // Restaurar foco al elemento iniciador
    setTimeout(() => {
      initiatingElementRef.current?.focus();
    }, 50);
  }, []);

  // Conmutar Modo Atención (revela siluetas sin alterar misterio)
  const handleToggleAttention = () => {
    const next = !isAttentionModeActive;
    setIsAttentionModeActive(next);
    bridgeRef.current?.setAttentionMode(next);
  };

  // Enfoque programático de hotspot
  const handleSelectHotspot = (id: HotspotId) => {
    initiatingElementRef.current = document.activeElement as HTMLElement | null;
    bridgeRef.current?.focusObject(id);
    setInspectedHotspotId(id);
    setInteractionResult(null);
  };

  // Interacción no destructiva a través del gateway transaccional
  const handleExecuteInteraction = async (actionType: string) => {
    setIsPerformingAction(true);
    setInteractionResult(null);

    try {
      if (actionType === 'VERIFY_RECEIPT') {
        const testCommandId = `cmd_${character.id}_inspect_${Date.now()}`;
        const receipt = await apiClient.getCommandReceipt(testCommandId);
        setInteractionResult(
          receipt
            ? `Recibo verificado: Revisión ${receipt.revision}`
            : 'Registro limpio: Sin alteraciones externas sobre este objeto.'
        );
      } else if (actionType === 'INSPECT_ALMANAC') {
        setInteractionResult(
          `Almanaque consultado: Franja de la ${timeSlot} (Día ${dayNumber}). El engranaje de latón avanza sin demoras.`
        );
      } else if (actionType === 'INSPECT_LETTER') {
        setInteractionResult(
          'Carta examinada: El lacre carmesí ostenta la impronta del Benefactor. El texto te recuerda tus compromisos en Cherwood.'
        );
      } else if (actionType === 'INSPECT_POUCH') {
        setInteractionResult(
          `Bolsa revisada: Contiene ${character.walletText}. Fondos suficientes para traslados y transacciones civiles menores.`
        );
      } else {
        setInteractionResult('Interacción diegética registrada formalmente.');
      }
    } catch (err: any) {
      setInteractionResult(`Fallo en el registro: ${err.message || 'Error de comunicación'}`);
    } finally {
      setIsPerformingAction(false);
    }
  };

  const inspectedContract = inspectedHotspotId ? CANONICAL_HOTSPOTS[inspectedHotspotId] : null;

  return (
    <div 
      className="relative w-[1920px] h-[1080px] overflow-hidden bg-[#090807] text-[#e5ded2] select-none"
      role="region"
      aria-label="Escenario Diegético de El Desván"
    >
      {/* Contenedor DOM para el Canvas de Phaser 4.2.1 */}
      <div 
        id="phaser-game-container"
        ref={containerRef} 
        tabIndex={0}
        aria-label="Lienzo de juego interactivo del Desván"
        className="w-full h-full outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37]"
      />

      {/* Navegación Oculta Accesible por Teclado y Lectores de Pantalla */}
      <nav 
        aria-label="Objetos interactivos del Desván"
        className="sr-only focus-within:not-sr-only focus-within:absolute focus-within:top-4 focus-within:left-4 focus-within:z-50 focus-within:bg-[#1a1612] focus-within:p-3 focus-within:border focus-within:border-[#8c733e] focus-within:rounded"
      >
        <span className="block text-xs font-serif text-[#d4af37] mb-2">Accesibilidad de Teclado (11 Hotspots):</span>
        <div className="flex flex-wrap gap-2">
          {Object.values(CANONICAL_HOTSPOTS).map((hotspot) => (
            <button
              key={hotspot.id}
              type="button"
              onClick={() => handleSelectHotspot(hotspot.id)}
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

      {/* =====================================================================
          ENCABEZADO DIEGÉTICO V01 (TOP-LEFT / TOP-RIGHT)
          ===================================================================== */}
      {/* Insignia Superior Izquierda: El Desván · Ubicación · Tiempo */}
      <header className="absolute top-5 left-6 z-30 flex flex-col gap-1 pointer-events-auto">
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 bg-[#14100c]/90 border border-[#8c733e]/80 rounded shadow-md backdrop-blur-xs">
            <h1 className="text-sm font-serif tracking-wider text-[#d4af37] font-semibold">
              EL DESVÁN
            </h1>
            <p className="text-[11px] font-serif text-[#a89f91]">
              {character.district || 'Cherwood'} · Franja de la {timeSlot} (Día {dayNumber})
            </p>
          </div>
          
          <button
            type="button"
            onClick={handleToggleAttention}
            title="Presiona 'A' para resaltar la silueta de los objetos"
            className={`px-3 py-1.5 rounded border text-xs font-serif transition-colors flex items-center gap-1.5 cursor-pointer shadow-md ${
              isAttentionModeActive
                ? 'bg-[#8c733e]/30 border-[#d4af37] text-[#d4af37]'
                : 'bg-[#14100c]/90 border-[#8c733e]/50 text-[#ede4d1] hover:border-[#8c733e]'
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-[#d4af37]" />
            <span>{isAttentionModeActive ? 'Ocultar Siluetas [A]' : 'Revelar Objetos [A]'}</span>
          </button>
        </div>
      </header>

      {/* Insignia Superior Derecha: Identidad Civil y Cartera */}
      <div className="absolute top-5 right-6 z-30 flex items-center gap-3 pointer-events-auto">
        <div className="flex items-center gap-3 px-4 py-1.5 bg-[#14100c]/90 border border-[#8c733e]/80 rounded text-xs font-serif text-[#ede4d1] shadow-md backdrop-blur-xs">
          <span className="font-semibold text-[#ede4d1]">{character.name}</span>
          <span className="text-[#8c733e]">·</span>
          <span className="text-[#a89f91]">{character.sequenceTitle || 'Secuencia 9'}</span>
          <span className="text-[#8c733e]">·</span>
          <span className="text-[#d4af37] font-semibold flex items-center gap-1">
            <Coins className="w-3 h-3 text-[#d4af37]" />
            {character.walletText}
          </span>
        </div>

        {onSwitchToReactRenderer && (
          <button
            type="button"
            onClick={onSwitchToReactRenderer}
            className="px-2.5 py-1.5 bg-[#14100c]/90 hover:bg-[#2b241c] border border-[#8c733e]/60 rounded text-[11px] font-serif text-[#ede4d1] transition-colors cursor-pointer"
          >
            Modo React
          </button>
        )}
      </div>

      {/* =====================================================================
          TARJETA DE OBJETIVO ACTUAL DIEGÉTICO (ANCLADO A V01)
          ===================================================================== */}
      {showObjectiveBanner && (
        <aside 
          aria-label="Objetivo actual del caso"
          className="absolute top-20 right-6 z-30 w-80 bg-[#16120e]/95 border-2 border-[#8c733e] rounded p-4 shadow-xl backdrop-blur-xs pointer-events-auto"
        >
          <div className="flex justify-between items-start mb-2 border-b border-[#8c733e]/40 pb-1.5">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#d4af37]" />
              <span className="text-xs font-serif font-bold tracking-wide text-[#d4af37]">
                OBJETIVO ACTUAL
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowObjectiveBanner(false)}
              className="text-[#a89f91] hover:text-[#ede4d1] text-xs font-mono"
              aria-label="Minimizar objetivo"
            >
              ✕
            </button>
          </div>
          <p className="text-xs font-serif text-[#ede4d1] leading-relaxed mb-3">
            Examinar la correspondencia sellada del Benefactor sobre la mesa de caoba para actualizar tus deberes civiles.
          </p>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => handleSelectHotspot('hotspot_bazaar_letter')}
              className="px-3 py-1 bg-[#2b1b10] border border-[#8c733e] text-[#d4af37] text-xs font-serif rounded hover:bg-[#3d2717] transition-colors cursor-pointer"
            >
              Examinar carta
            </button>
          </div>
        </aside>
      )}

      {/* Etiqueta Flotante en Reposo (Máximo 7 palabras por objeto) */}
      {hoveredHotspot.id && hoveredHotspot.label && !inspectedHotspotId && (
        <div 
          aria-live="polite"
          className="absolute bottom-20 left-1/2 -translate-x-1/2 z-30 px-4 py-1.5 bg-[#14100c]/95 border border-[#8c733e] rounded text-xs font-serif text-[#ede4d1] shadow-lg pointer-events-none"
        >
          {hoveredHotspot.label}
        </div>
      )}

      {/* =====================================================================
          BARRA DE NAVEGACIÓN INFERIOR DIEGÉTICA (V01)
          ===================================================================== */}
      <footer className="absolute bottom-4 inset-x-6 z-30 flex justify-between items-center px-6 py-2 bg-[#14100c]/90 border border-[#8c733e]/80 rounded shadow-2xl backdrop-blur-xs pointer-events-auto">
        <div className="flex items-center gap-2 text-xs font-serif text-[#a89f91]">
          <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
          <span>Partida guardada en el registro civil</span>
        </div>

        <div className="flex items-center gap-3">
          <ActionButton
            variant="ghost"
            size="sm"
            onClick={() => handleSelectHotspot('hotspot_acting_diary')}
            icon={<BookOpen className="w-3.5 h-3.5 text-[#d4af37]" />}
          >
            Diario de Actuación
          </ActionButton>

          <ActionButton
            variant="ghost"
            size="sm"
            onClick={() => handleSelectHotspot('hotspot_corkboard')}
            icon={<MapPin className="w-3.5 h-3.5 text-[#d4af37]" />}
          >
            Tablero de Investigación
          </ActionButton>

          <ActionButton
            variant="parchment"
            size="sm"
            onClick={() => handleSelectHotspot('hotspot_staircase_door')}
            icon={<Footprints className="w-3.5 h-3.5 text-[#d4af37]" />}
          >
            Salida al Zaguán
          </ActionButton>

          <ActionButton
            variant="ghost"
            size="sm"
            onClick={() => {
              const url = new URL(window.location.href);
              url.searchParams.set('gallery', 'true');
              window.location.href = url.toString();
            }}
            icon={<SlidersHorizontal className="w-3.5 h-3.5 text-[#a89f91]" />}
          >
            Galería UI
          </ActionButton>
        </div>
      </footer>

      {/* =====================================================================
          OVERLAY ACCESIBLE REACT DE INSPECCIÓN (P04 INSPECTION PANEL)
          ===================================================================== */}
      {inspectedContract && (
        <InspectionPanel
          isOpen={Boolean(inspectedContract)}
          title={inspectedContract.accessibleName}
          subtitle={`Estado: ${inspectedContract.stateVariant}`}
          proseMoment={inspectedContract.proseMoment || inspectedContract.restingLabel}
          onClose={handleCloseInspection}
          theme="mahogany"
          actions={
            <div className="flex gap-2 justify-end w-full">
              <ActionButton variant="parchment" size="sm" onClick={handleCloseInspection}>
                Cerrar
              </ActionButton>
            </div>
          }
        >
          <div className="space-y-4">
            {/* 1. Hotspot: Almanaque y Reloj */}
            {inspectedContract.id === 'hotspot_almanack' && (
              <div className="bg-[#120e0a] p-4 rounded border border-[#8c733e]/40 space-y-3">
                <p className="text-xs text-[#a89f91]">
                  Franja horaria: <strong className="text-[#d4af37]">{timeSlot}</strong> · Día del calendario: <strong className="text-[#d4af37]">{dayNumber}</strong>
                </p>
                <p className="text-xs text-[#a89f91]">
                  Distrito de residencia: <strong className="text-[#ede4d1]">{character.district}</strong>
                </p>
                <div className="pt-2 flex gap-3">
                  <ActionButton
                    variant="brass"
                    size="sm"
                    pending={isPerformingAction}
                    onClick={() => handleExecuteInteraction('INSPECT_ALMANAC')}
                  >
                    Examinar Cuadrante Horario
                  </ActionButton>
                  <ActionButton
                    variant="parchment"
                    size="sm"
                    onClick={() => {
                      handleCloseInspection();
                      onOpenCalendar();
                    }}
                  >
                    Abrir Calendario Completo
                  </ActionButton>
                </div>
              </div>
            )}

            {/* 2. Hotspot: Carta Sellada del Benefactor */}
            {inspectedContract.id === 'hotspot_bazaar_letter' && (
              <div className="bg-[#120e0a] p-4 rounded border border-[#8c733e]/40 space-y-3">
                <p className="text-xs text-[#a89f91]">
                  Correspondencia cerrada con lacre carmesí. Contiene indicaciones precisas sobre el mercado clandestino de Cherwood.
                </p>
                <div className="pt-2 flex gap-3">
                  <ActionButton
                    variant="brass"
                    size="sm"
                    pending={isPerformingAction}
                    onClick={() => handleExecuteInteraction('INSPECT_LETTER')}
                  >
                    Examinar Advertencia del Sobre
                  </ActionButton>
                  <ActionButton
                    variant="parchment"
                    size="sm"
                    onClick={() => {
                      handleCloseInspection();
                      onOpenMarket();
                    }}
                  >
                    Acudir al Mercado Oculto
                  </ActionButton>
                </div>
              </div>
            )}

            {/* 3. Hotspot: La Vela de Sebo (Sanidad) */}
            {inspectedContract.id === 'hotspot_candle' && (
              <div className="bg-[#120e0a] p-4 rounded border border-[#8c733e]/40 space-y-2">
                <p className="text-xs text-[#a89f91]">
                  Manifestación somática: <strong className="text-[#d4af37]">{character.somatics.candleDescription || 'La llama arde erguida sobre el peltre.'}</strong>
                </p>
                <p className="text-xs text-[#a89f91]">
                  Claridad mental del personaje: <strong className="text-[#ede4d1]">{character.somatics.sanityTier}</strong>
                </p>
              </div>
            )}

            {/* 4. Hotspot: Espejo de Azogue (Corrupción) */}
            {inspectedContract.id === 'hotspot_mirror' && (
              <div className="bg-[#120e0a] p-4 rounded border border-[#8c733e]/40 space-y-3">
                <p className="text-xs text-[#a89f91]">
                  Reflejo somático: <strong className="text-[#d4af37]">{character.somatics.mirrorDescription || 'El azogue refleja tu semblante humano.'}</strong>
                </p>
                <p className="text-xs text-[#a89f91]">
                  Fase de digestión de la poción: <strong className="text-[#ede4d1]">{character.somatics.corruptionTier}</strong>
                </p>
                <div className="pt-2 flex gap-3">
                  <ActionButton
                    variant="parchment"
                    size="sm"
                    onClick={() => {
                      handleCloseInspection();
                      onOpenActing();
                    }}
                  >
                    Abrir Cuaderno de Actuación
                  </ActionButton>
                  <ActionButton
                    variant="brass"
                    size="sm"
                    onClick={() => {
                      onToggleSpiritVision();
                      handleCloseInspection();
                    }}
                  >
                    {spiritVisionActive ? 'Disipar Visión Espiritual' : 'Activar Visión Espiritual'}
                  </ActionButton>
                </div>
              </div>
            )}

            {/* 5. Hotspot: Tablero de Corcho (Investigación) */}
            {inspectedContract.id === 'hotspot_corkboard' && (
              <div className="bg-[#120e0a] p-4 rounded border border-[#8c733e]/40 space-y-3">
                <p className="text-xs text-[#a89f91]">
                  Expedientes, hilos carmesíes y testimonios recopilados en los distritos de Backlund.
                </p>
                <div className="pt-2">
                  <ActionButton
                    variant="brass"
                    size="sm"
                    onClick={() => {
                      handleCloseInspection();
                      onOpenCorkboard();
                    }}
                  >
                    Examinar Tablero de Investigación
                  </ActionButton>
                </div>
              </div>
            )}

            {/* 6. Hotspot: Escalera de Caracol y Salida al Zaguán (REGLA P06: ENRUTAMIENTO SEGURO) */}
            {inspectedContract.id === 'hotspot_staircase_door' && (
              <div className="bg-[#120e0a] p-4 rounded border border-[#8c733e]/40 space-y-3">
                <p className="text-xs text-[#ede4d1]">
                  Los peldaños de roble descienden hacia la puerta del zaguán y las calles mojadas de Cherwood.
                </p>
                <p className="text-xs text-[#a89f91]">
                  No se perciben intrusos en el umbral; el exterior permanece sumido en la niebla ordinaria de Backlund.
                </p>
                <div className="pt-3 flex flex-wrap gap-3">
                  <ActionButton
                    variant="brass"
                    size="sm"
                    icon={<Footprints className="w-3.5 h-3.5" />}
                    onClick={() => {
                      handleCloseInspection();
                      onOpenMarket(); // Enrutamiento a la estructura de viaje/ciudad
                    }}
                  >
                    Descender al Zaguán (Salir a Backlund)
                  </ActionButton>
                  <ActionButton
                    variant="danger"
                    size="sm"
                    icon={<ShieldAlert className="w-3.5 h-3.5" />}
                    onClick={() => {
                      handleCloseInspection();
                      onOpenCombat(); // Enrutamiento táctico si el jugador inspecciona o hay amenaza activa
                    }}
                  >
                    Vigilar el Umbral (Alerta Táctica)
                  </ActionButton>
                  <ActionButton
                    variant="ghost"
                    size="sm"
                    onClick={handleCloseInspection}
                  >
                    Comprobar Cerrojos (Permanecer en el Desván)
                  </ActionButton>
                </div>
              </div>
            )}

            {/* 7. Hotspot: Cáliz de Plata (Ascensión) */}
            {inspectedContract.id === 'hotspot_chalice' && (
              <div className="bg-[#120e0a] p-4 rounded border border-[#8c733e]/40 space-y-3">
                <p className="text-xs text-[#a89f91]">
                  Hornacina ceremonial con el cáliz para las fórmulas místicas y transmutaciones de Secuencia.
                </p>
                <div className="pt-2">
                  <ActionButton
                    variant="brass"
                    size="sm"
                    onClick={() => {
                      handleCloseInspection();
                      onOpenAscension();
                    }}
                  >
                    Preparar Ritual de Ascensión
                  </ActionButton>
                </div>
              </div>
            )}

            {/* 8. Hotspot: Pliegos Notariales de Identidad (Anclas) */}
            {inspectedContract.id === 'hotspot_identity_papers' && (
              <div className="bg-[#120e0a] p-4 rounded border border-[#8c733e]/40 space-y-3">
                <p className="text-xs text-[#a89f91]">
                  Documentación formal: profesión de <strong className="text-[#ede4d1]">{character.profession}</strong>, anclas de humanidad y compromisos notariales.
                </p>
                <div className="pt-2">
                  <ActionButton
                    variant="brass"
                    size="sm"
                    onClick={() => {
                      handleCloseInspection();
                      onOpenIdentity();
                    }}
                  >
                    Consultar Dossier de Identidad
                  </ActionButton>
                </div>
              </div>
            )}

            {/* 9. Hotspot: Cuaderno de Actuación */}
            {inspectedContract.id === 'hotspot_acting_diary' && (
              <div className="bg-[#120e0a] p-4 rounded border border-[#8c733e]/40 space-y-3">
                <p className="text-xs text-[#a89f91]">
                  Notas personales sobre los principios de actuación de la vía {character.pathwayName}.
                </p>
                <div className="pt-2">
                  <ActionButton
                    variant="brass"
                    size="sm"
                    onClick={() => {
                      handleCloseInspection();
                      onOpenActing();
                    }}
                  >
                    Examinar Principios de Actuación
                  </ActionButton>
                </div>
              </div>
            )}

            {/* 10. Hotspot: Monedero de Cuero */}
            {inspectedContract.id === 'hotspot_money_pouch' && (
              <div className="bg-[#120e0a] p-4 rounded border border-[#8c733e]/40 space-y-3">
                <p className="text-xs text-[#a89f91]">
                  Balance actual: <strong className="text-[#d4af37]">{character.walletText}</strong>. Monedas acuñadas del Reino de Loen.
                </p>
                <div className="pt-2">
                  <ActionButton
                    variant="brass"
                    size="sm"
                    pending={isPerformingAction}
                    onClick={() => handleExecuteInteraction('INSPECT_POUCH')}
                  >
                    Contar Monedas y Recibos
                  </ActionButton>
                </div>
              </div>
            )}

            {/* 11. Hotspot: Grietas de Ruina */}
            {inspectedContract.id === 'hotspot_mahogany_cracks' && (
              <div className="bg-[#120e0a] p-4 rounded border border-[#8c733e]/40 space-y-2">
                <p className="text-xs text-[#a89f91]">
                  Grado de Ruina material: <strong className="text-[#d4af37]">{character.somatics.woodDescription || 'La veta de caoba permanece íntegra.'}</strong>
                </p>
              </div>
            )}

            {/* Resultado de la Interacción Transaccional */}
            {interactionResult && (
              <div className="p-3 bg-[#1e293b]/50 border border-[#38bdf8]/40 rounded text-xs font-mono text-[#bae6fd]">
                {interactionResult}
              </div>
            )}
          </div>
        </InspectionPanel>
      )}
    </div>
  );
};
