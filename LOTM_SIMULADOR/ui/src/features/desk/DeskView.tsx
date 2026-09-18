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
  timeSlot = 'NOCHE'
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

  // Parámetros lumínicos de las 4 franjas horarias
  const getTimeLighting = () => {
    switch (timeSlot) {
      case 'MAÑANA':
        return {
          ambientTint: 'rgba(147, 197, 253, 0.07)', // Neblina azulada matutina
          skylightGlow: 'radial-gradient(ellipse at 50% 0%, rgba(186, 230, 253, 0.22) 0%, transparent 65%)',
          shadowDensity: 0.15
        };
      case 'TARDE':
        return {
          ambientTint: 'rgba(254, 240, 138, 0.06)', // Luz diurna dorada y templada
          skylightGlow: 'radial-gradient(ellipse at 50% 0%, rgba(254, 240, 138, 0.25) 0%, transparent 70%)',
          shadowDensity: 0.1
        };
      case 'NOCHE':
        return {
          ambientTint: 'rgba(249, 115, 22, 0.08)', // Hollín y crepúsculo cobrizo de Backlund
          skylightGlow: 'radial-gradient(ellipse at 50% 0%, rgba(217, 119, 6, 0.2) 0%, transparent 60%)',
          shadowDensity: 0.25
        };
      case 'MADRUGADA':
        return {
          ambientTint: 'rgba(15, 23, 42, 0.25)', // Abismo de medianoche y sombra cerrada
          skylightGlow: 'radial-gradient(ellipse at 50% 0%, rgba(226, 232, 240, 0.08) 0%, transparent 50%)',
          shadowDensity: 0.45
        };
      default:
        return {
          ambientTint: 'rgba(249, 115, 22, 0.08)',
          skylightGlow: 'radial-gradient(ellipse at 50% 0%, rgba(217, 119, 6, 0.2) 0%, transparent 60%)',
          shadowDensity: 0.25
        };
    }
  };

  const lighting = getTimeLighting();

  return (
    <div 
      style={{ position: 'relative', width: '1920px', height: '1080px', zIndex: 10, overflow: 'hidden', backgroundColor: '#090807', color: '#e5ded2' }}
      className="select-none"
    >
      <SceneCamera preset={activeCamera}>
        
        {/* ==========================================================================
            CAPA 0: FONDO ARQUITECTÓNICO DEL DESVÁN (Pared de damasco, niebla y vigas)
            ========================================================================== */}
        <div 
          className="texture-damask-wall"
          style={{ position: 'absolute', top: 0, left: 0, width: '1920px', height: '1080px', zIndex: 'var(--z-bg, 10)' }}
        >
          {/* Luz cenital de claraboya y niebla lejana de Backlund según la franja horaria */}
          <div 
            className="pointer-events-none transition-all duration-1000"
            style={{ position: 'absolute', top: 0, left: '480px', width: '960px', height: '320px', background: lighting.skylightGlow, pointerEvents: 'none' }}
          />
          
          {/* Sombra de vigas de roble superiores */}
          <div 
            className="pointer-events-none"
            style={{ position: 'absolute', top: 0, left: 0, width: '1920px', height: '64px', background: 'linear-gradient(180deg, #090807 0%, transparent 100%)', pointerEvents: 'none' }} 
          />
        </div>

        {/* ==========================================================================
            CAPA 1: MOBILIARIO Y ESTRUCTURAS FIJAS
            ========================================================================== */}
        {/* Tablero de Caoba de la Mesa Central (Capa 1) */}
        <div 
          className="texture-mahogany-desk"
          style={{
            position: 'absolute',
            left: '380px',
            top: '480px',
            width: '1160px',
            height: '580px',
            borderRadius: '12px 12px 0 0',
            borderTop: '8px solid #24170e',
            borderLeft: '4px solid #24170e',
            borderRight: '4px solid #24170e',
            boxShadow: '0 -30px 70px rgba(0,0,0,0.95)',
            zIndex: 'var(--z-furniture, 15)'
          }}
        >
          {/* Bisel superior de latón desgastado */}
          <div 
            style={{
              width: '100%',
              height: '4px',
              background: 'linear-gradient(90deg, rgba(82, 61, 20, 0.4) 0%, rgba(212, 175, 55, 0.3) 50%, rgba(82, 61, 20, 0.4) 100%)'
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
            CAPA 3: ILUMINACIÓN DINÁMICA, ATMÓSFERA Y HALO DE LA VELA
            ========================================================================== */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ zIndex: 'var(--z-lighting, 30)', pointerEvents: 'none' }}
        >
          {/* Tinte atmosférico según la franja horaria */}
          <div 
            className="absolute inset-0 transition-colors duration-1000 pointer-events-none"
            style={{ backgroundColor: lighting.ambientTint, pointerEvents: 'none' }}
          />

          {/* Sombra ambiental periférica del desván */}
          <div 
            className="absolute inset-0 transition-opacity duration-1000 pointer-events-none"
            style={{ 
              background: 'radial-gradient(circle at 50% 60%, transparent 40%, rgba(0,0,0,0.85) 100%)',
              opacity: lighting.shadowDensity,
              pointerEvents: 'none'
            }}
          />

          {/* Halo de luz cálida proyectado por la vela sobre el escritorio */}
          <div
            className="absolute rounded-full bg-radial from-[#d4af37]/18 via-[#854d0e]/6 to-transparent blur-xl pointer-events-none"
            style={{
              left: '420px',
              top: '460px',
              width: '440px',
              height: '380px',
              pointerEvents: 'none'
            }}
          />
        </div>

      </SceneCamera>
    </div>
  );
};
