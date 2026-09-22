/**
 * EL DESVÁN — ESCENA DIEGÉTICA 2.5D (BRIEF-10.VISUAL-R3)
 * Lienzo 1920x1080, cámara con presets tipados, 11 objetos físicos canónicos.
 * ESTADO = OBJETO · MOMENTO = PROSA · Cero pastillas HUD flotantes.
 */

import React, { useRef, useEffect } from 'react';
import type { CharacterDiegetic, TimeSlot } from '../types';
import { StaircaseDoorObject } from './objects/StaircaseDoorObject';
import { NicheChaliceObject } from './objects/NicheChaliceObject';
import { CorkboardObject } from './objects/CorkboardObject';
import { CandleObject } from './objects/CandleObject';
import { SomaticMirrorObject } from './objects/SomaticMirrorObject';
import { PocketWatchObject } from './objects/PocketWatchObject';
import { IdentityPapersObject } from './objects/IdentityPapersObject';
import { ActingBookObject } from './objects/ActingBookObject';
import { LeatherPouchObject } from './objects/LeatherPouchObject';
import { BazaarLetterObject } from './objects/BazaarLetterObject';
import { DeskCracksOverlay } from './objects/DeskCracksOverlay';
import { TimeLightingLayer } from '../../scene/lighting/TimeLightingLayer';
import { DustParticlesOverlay } from '../../scene/lighting/DustParticlesOverlay';
import { InteractionMasksOverlay } from '../../scene/InteractionMasksOverlay';
import { useNavigation } from '../../scene/navigation/NavigationContext';
import { SceneCamera } from '../../scene/SceneCamera';
import { HotspotButton } from '../../scene/HotspotButton';
import { 
  CANONICAL_HOTSPOTS, 
  CAMERA_PRESETS, 
  type HotspotId 
} from '../../scene/types';

interface DeskViewProps {
  character: CharacterDiegetic;
  onOpenCorkboard: () => void;
  onOpenCalendar: () => void;
  onOpenMarket: () => void;
  onOpenCombat: () => void;
  onOpenAscension: () => void;
  onToggleSpiritVision: () => void;
  spiritVisionActive: boolean;
  timeSlot?: TimeSlot;
  debugOverlay?: boolean;
}

export const DeskView: React.FC<DeskViewProps> = ({
  character,
  onOpenCorkboard,
  onOpenCalendar,
  onOpenMarket,
  onOpenCombat,
  onOpenAscension,
  onToggleSpiritVision,
  spiritVisionActive,
  timeSlot = 'NOCHE',
  debugOverlay = false
}) => {
  const { 
    state, 
    focusHotspot, 
    openInspection, 
    setCameraPreset 
  } = useNavigation();

  const buttonRefs = useRef<Record<HotspotId, HTMLButtonElement | null>>({
    hotspot_mirror: null,
    hotspot_chalice: null,
    hotspot_corkboard: null,
    hotspot_candle: null,
    hotspot_almanack: null,
    hotspot_identity_papers: null,
    hotspot_acting_diary: null,
    hotspot_money_pouch: null,
    hotspot_bazaar_letter: null,
    hotspot_staircase_door: null,
    hotspot_mahogany_cracks: null
  });

  // Restaurar foco al elemento activo si cambia focusedHotspotId
  useEffect(() => {
    if (state.focusedHotspotId && buttonRefs.current[state.focusedHotspotId]) {
      buttonRefs.current[state.focusedHotspotId]?.focus();
    }
  }, [state.focusedHotspotId]);

  const handleActivate = (id: HotspotId) => {
    focusHotspot(id);
    const contract = CANONICAL_HOTSPOTS[id];
    if (contract?.cameraPreset) {
      setCameraPreset(contract.cameraPreset);
    }

    switch (id) {
      case 'hotspot_corkboard':
        onOpenCorkboard();
        break;
      case 'hotspot_staircase_door':
        onOpenCombat();
        break;
      case 'hotspot_chalice':
        onOpenAscension();
        break;
      case 'hotspot_almanack':
        onOpenCalendar();
        break;
      case 'hotspot_bazaar_letter':
        onOpenMarket();
        break;
      default:
        openInspection(id);
        break;
    }
  };

  const activeCamera = CAMERA_PRESETS[state.activeCameraPreset] || CAMERA_PRESETS.WIDE_OVERVIEW;

  return (
    <div 
      style={{ position: 'relative', width: '1920px', height: '1080px', zIndex: 10, overflow: 'hidden', backgroundColor: '#090807', color: '#e5ded2' }}
      className="select-none"
    >
      <SceneCamera preset={activeCamera}>
        
        {/* ==========================================================================
            CAPA 0: ENTORNO ARQUITECTÓNICO MAESTRO DEL DESVÁN (C0 Composición Aprobada)
            Vigas de roble, claraboya con niebla de Backlund, escalera, hornacina y mesa noble
            ========================================================================== */}
        <div 
          style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            width: '1920px', 
            height: '1080px', 
            zIndex: 'var(--z-bg, 10)',
            backgroundImage: 'url(/art/C0_desvan_composition.jpg)',
            backgroundSize: '100% 100%',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          {/* Haz de luz diagonal de la claraboya (Luz diurna fría y neblina de Backlund) */}
          <div 
            className="pointer-events-none"
            style={{ 
              position: 'absolute', 
              top: 0, 
              right: '240px', 
              width: '820px', 
              height: '760px', 
              background: 'linear-gradient(215deg, rgba(186, 230, 253, 0.16) 0%, rgba(147, 197, 253, 0.06) 35%, transparent 70%)',
              mixBlendMode: 'screen',
              pointerEvents: 'none'
            }} 
          />

          {/* Resplandor cálido de la lámpara de gas sobre la escalera de caracol */}
          <div 
            className="pointer-events-none"
            style={{ 
              position: 'absolute', 
              top: '70px', 
              left: '110px', 
              width: '320px', 
              height: '320px', 
              background: 'radial-gradient(circle, rgba(245, 170, 45, 0.28) 0%, rgba(217, 119, 6, 0.10) 45%, transparent 75%)',
              mixBlendMode: 'screen',
              pointerEvents: 'none'
            }} 
          />

          {/* Sombra cenital de las vigas maestras superiores */}
          <div 
            className="pointer-events-none"
            style={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              width: '1920px', 
              height: '90px', 
              background: 'linear-gradient(180deg, rgba(9, 8, 7, 0.85) 0%, transparent 100%)', 
              pointerEvents: 'none' 
            }} 
          />
        </div>

        {/* ==========================================================================
            CAPA 2: OBJETOS INTERACTIVOS (11 HOTSPOTS CANÓNICOS FÍSICOS)
            ========================================================================== */}

        {/* 1. Hotspot: Escalera de Caracol y Picaporte (Zaguán / Táctica) */}
        <HotspotButton
          ref={(el) => { buttonRefs.current.hotspot_staircase_door = el; }}
          contract={CANONICAL_HOTSPOTS.hotspot_staircase_door}
          isAttentionActive={state.isAttentionModeActive}
          isFocused={state.focusedHotspotId === 'hotspot_staircase_door'}
          onActivate={handleActivate}
          onFocus={focusHotspot}
        >
          <StaircaseDoorObject 
            threatActive={Boolean(character.policeSuspicionText || character.churchSuspicionText)}
            threatLevelText={character.policeSuspicionText || character.churchSuspicionText || 'Peldaños en silencio; calma en el zaguán.'}
          />
        </HotspotButton>

        {/* 2. Hotspot: Hornacina Ritual y El Cáliz de Plata (Ascensión) */}
        <HotspotButton
          ref={(el) => { buttonRefs.current.hotspot_chalice = el; }}
          contract={CANONICAL_HOTSPOTS.hotspot_chalice}
          isAttentionActive={state.isAttentionModeActive}
          isFocused={state.focusedHotspotId === 'hotspot_chalice'}
          onActivate={handleActivate}
          onFocus={focusHotspot}
        >
          <NicheChaliceObject />
        </HotspotButton>

        {/* 3. Hotspot: Tablero de Corcho en la Pared (Investigación) */}
        <HotspotButton
          ref={(el) => { buttonRefs.current.hotspot_corkboard = el; }}
          contract={CANONICAL_HOTSPOTS.hotspot_corkboard}
          isAttentionActive={state.isAttentionModeActive}
          isFocused={state.focusedHotspotId === 'hotspot_corkboard'}
          onActivate={handleActivate}
          onFocus={focusHotspot}
        >
          <CorkboardObject caseTitle="Expediente Cherwood" activeCluesCount={4} />
        </HotspotButton>

        {/* 4. Hotspot: La Vela de Sebo (Sanidad) */}
        <HotspotButton
          ref={(el) => { buttonRefs.current.hotspot_candle = el; }}
          contract={CANONICAL_HOTSPOTS.hotspot_candle}
          isAttentionActive={state.isAttentionModeActive}
          isFocused={state.focusedHotspotId === 'hotspot_candle'}
          onActivate={handleActivate}
          onFocus={focusHotspot}
        >
          <CandleObject
            tier={character.somatics.sanityTier}
            description={character.somatics.candleDescription}
          />
        </HotspotButton>

        {/* 5. Hotspot: Espejo de Azogue (Corrupción / Visión Espiritual) */}
        <HotspotButton
          ref={(el) => { buttonRefs.current.hotspot_mirror = el; }}
          contract={CANONICAL_HOTSPOTS.hotspot_mirror}
          isAttentionActive={state.isAttentionModeActive}
          isFocused={state.focusedHotspotId === 'hotspot_mirror'}
          onActivate={handleActivate}
          onFocus={focusHotspot}
        >
          <SomaticMirrorObject
            tier={character.somatics.corruptionTier}
            description={character.somatics.mirrorDescription}
            spiritVisionActive={spiritVisionActive}
            onToggleSpiritVision={onToggleSpiritVision}
          />
        </HotspotButton>

        {/* 6. Hotspot: Reloj de Faltriquera y Almanaque (Calendario) */}
        <HotspotButton
          ref={(el) => { buttonRefs.current.hotspot_almanack = el; }}
          contract={CANONICAL_HOTSPOTS.hotspot_almanack}
          isAttentionActive={state.isAttentionModeActive}
          isFocused={state.focusedHotspotId === 'hotspot_almanack'}
          onActivate={handleActivate}
          onFocus={focusHotspot}
        >
          <PocketWatchObject 
            timeSlot={timeSlot}
            dayNumber={4}
          />
        </HotspotButton>

        {/* 7. Hotspot: Pliegos Notariales de Identidad (Anclas) */}
        <HotspotButton
          ref={(el) => { buttonRefs.current.hotspot_identity_papers = el; }}
          contract={CANONICAL_HOTSPOTS.hotspot_identity_papers}
          isAttentionActive={state.isAttentionModeActive}
          isFocused={state.focusedHotspotId === 'hotspot_identity_papers'}
          onActivate={handleActivate}
          onFocus={focusHotspot}
        >
          <IdentityPapersObject
            name={character.name}
            profession={character.profession}
            originTitle={character.originTitle}
            district={character.district}
            burden={character.initialBurden}
            anchors={character.anchors}
          />
        </HotspotButton>

        {/* 8. Hotspot: Cuaderno de Cuero de Actuación (Acting) */}
        <HotspotButton
          ref={(el) => { buttonRefs.current.hotspot_acting_diary = el; }}
          contract={CANONICAL_HOTSPOTS.hotspot_acting_diary}
          isAttentionActive={state.isAttentionModeActive}
          isFocused={state.focusedHotspotId === 'hotspot_acting_diary'}
          onActivate={handleActivate}
          onFocus={focusHotspot}
        >
          <ActingBookObject
            coherence={character.actingCoherence}
            actingFeedback={character.actingFeedback}
            entries={character.actingDiary}
            pathwayName={character.pathwayName}
            sequenceTitle={character.sequenceTitle}
          />
        </HotspotButton>

        {/* 9. Hotspot: Monedero de Cuero de Loen (Economía) */}
        <HotspotButton
          ref={(el) => { buttonRefs.current.hotspot_money_pouch = el; }}
          contract={CANONICAL_HOTSPOTS.hotspot_money_pouch}
          isAttentionActive={state.isAttentionModeActive}
          isFocused={state.focusedHotspotId === 'hotspot_money_pouch'}
          onActivate={handleActivate}
          onFocus={focusHotspot}
        >
          <LeatherPouchObject
            walletText={character.walletText}
          />
        </HotspotButton>

        {/* 10. Hotspot: Misiva Sellada del Bazar (Mercado) */}
        <HotspotButton
          ref={(el) => { buttonRefs.current.hotspot_bazaar_letter = el; }}
          contract={CANONICAL_HOTSPOTS.hotspot_bazaar_letter}
          isAttentionActive={state.isAttentionModeActive}
          isFocused={state.focusedHotspotId === 'hotspot_bazaar_letter'}
          onActivate={handleActivate}
          onFocus={focusHotspot}
        >
          <BazaarLetterObject unread={true} />
        </HotspotButton>

        {/* 11. Hotspot: Grietas de Ruina sobre la Caoba */}
        <HotspotButton
          ref={(el) => { buttonRefs.current.hotspot_mahogany_cracks = el; }}
          contract={CANONICAL_HOTSPOTS.hotspot_mahogany_cracks}
          isAttentionActive={state.isAttentionModeActive}
          isFocused={state.focusedHotspotId === 'hotspot_mahogany_cracks'}
          onActivate={handleActivate}
          onFocus={focusHotspot}
        >
          <DeskCracksOverlay
            tier={character.somatics.ruinaTier}
            description={character.somatics.woodDescription}
          />
        </HotspotButton>

        {/* ==========================================================================
            CAPA 3: ILUMINACIÓN DINÁMICA SEGÚN EL TIEMPO (GFX11 TimeLightingLayer)
            ========================================================================== */}
        <TimeLightingLayer 
          timeSlot={timeSlot} 
          candleActive={character.somatics.sanityTier !== 'AHOGADA_EN_CERA'} 
        />

        {/* ==========================================================================
            CAPA 3.5: ATMÓSFERA Y MOTES DE POLVO VICTORIANO (GFX56 DustParticlesOverlay)
            ========================================================================== */}
        <DustParticlesOverlay enabled={true} />

        {/* ==========================================================================
            CAPA DE DEPURACIÓN TÉCNICA: MÁSCARAS DE INTERACCIÓN (GFX28)
            ========================================================================== */}
        <InteractionMasksOverlay
          visible={debugOverlay}
          activeHotspotId={state.activeHotspotId}
          focusedHotspotId={state.focusedHotspotId}
          onSelectHotspot={handleActivate}
        />

      </SceneCamera>
    </div>
  );
};
