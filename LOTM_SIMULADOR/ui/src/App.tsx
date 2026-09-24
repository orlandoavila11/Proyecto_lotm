/**
 * PATH TO GODHOOD — SHELL PRINCIPAL Y ENTORNO DE ESCENA (BRIEF-10.VISUAL-R2 / R4)
 * Integra SceneViewport 1920x1080, NavigationProvider, DeskView, CalendarView,
 * IdentityDossierView, ActingMirrorView y sincronización transversal de estado.
 */

import { useState, useEffect } from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import type { CharacterDiegetic, TimeSlot } from './features/types';
import { PrologueView } from './features/prologue/PrologueView';
import { DeskView } from './features/desk/DeskView';
import { CorkboardView } from './features/investigation/CorkboardView';
import { CalendarView } from './features/calendar/CalendarView';
import { MarketView } from './features/market/MarketView';
import { ActingMirrorView } from './features/acting/ActingMirrorView';
import { IdentityDossierView } from './features/identity/IdentityDossierView';
import { CombatView } from './features/combat/CombatView';
import { AscensionView } from './features/ascension/AscensionView';
import { VeilOverlay } from './features/veil/VeilOverlay';
import { NavigationProvider, useNavigation } from './scene/navigation/NavigationContext';
import { SceneViewport } from './scene/SceneViewport';
import { InspectionLayer } from './scene/InspectionLayer';
import { SceneHarness, FOOL_SEER_FIXTURE } from './harness/SceneHarness';
import { CANONICAL_HOTSPOTS } from './scene/types';
import { apiClient } from './services/apiClient';
import { mapSanityToVisual, mapCorruptionToVisual, mapRuinaToVisual } from './services/somaticsMapper';

function AppContent() {
  const { state, navigateTo, closeInspection, backToDesk, toggleSpiritVision } = useNavigation();
  const [character, setCharacter] = useState<CharacterDiegetic | null>(null);
  const [timeSlot, setTimeSlot] = useState<TimeSlot>('TARDE');
  const [dayNumber, setDayNumber] = useState<number>(4);
  const [showHarness, setShowHarness] = useState<boolean>(false);
  const [showDebugMasks, setShowDebugMasks] = useState<boolean>(false);

  // Comprobar parámetros URL (?harness=true, ?masks=true) y partida persistida
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const isHarness = params.get('harness') === 'true';
    if (isHarness) {
      setShowHarness(true);
    }
    if (params.get('masks') === 'true') {
      setShowDebugMasks(true);
    }

    if (!character) {
      if (isHarness) {
        setCharacter(FOOL_SEER_FIXTURE as unknown as CharacterDiegetic);
      } else {
        const storedId = localStorage.getItem('lotm_active_character_id');
        if (storedId) {
          apiClient.getCharacter(storedId).then(data => {
            if (data?.character) {
              const mappedSanity = mapSanityToVisual(data.somatics?.sanityTier || 'LUCID');
              const mappedCorruption = mapCorruptionToVisual(data.somatics?.corruptionTier || 'PRISTINE');
              const mappedRuina = mapRuinaToVisual(data.somatics?.ruinaTier || 0);
              const isFool = data.character.pathway === 'FOOL';

              setCharacter({
                id: data.character.id,
                name: data.character.name,
                profession: data.activePersona?.profession || 'Detective Privado',
                originTitle: data.activePersona?.profession || 'Origen Civil',
                district: data.character.current_location || 'Backlund - Cherwood',
                pathwayName: isFool ? 'The Fool' : 'Visionary',
                sequenceTitle: isFool ? `Vidente (Secuencia ${data.character.sequence})` : `Espectador (Secuencia ${data.character.sequence})`,
                initialBurden: {
                  type: 'DEUDA',
                  description: 'Alquiler y compromisos notariales en Backlund.',
                  details: 'Compromiso formal que pesa sobre tu rutina civil.'
                },
                somatics: {
                  sanityTier: mappedSanity.tier,
                  candleDescription: mappedSanity.description,
                  corruptionTier: mappedCorruption.tier,
                  mirrorDescription: mappedCorruption.description,
                  ruinaTier: mappedRuina.tier,
                  woodDescription: mappedRuina.description
                },
                walletText: data.wallet ? `${data.wallet.pounds} £, ${data.wallet.soli} s y ${data.wallet.pence} d` : '2 soberanos de oro, 8 chelines de plata y 4 peniques de cobre',
                actingCoherence: 'COHERENTE',
                actingFeedback: 'Interpretar el papel exige equilibrar la vida civil con los principios de la Secuencia.',
                actingDiary: [],
                anchors: data.anchors?.map((a: any) => ({
                  id: a.id,
                  tipo: a.type || 'persona',
                  nombre: a.name || a.title || 'Ancla',
                  descripcion: a.description || 'Lazo humano',
                  fuerza: a.strength > 25 ? 'FIRME' : a.strength > 10 ? 'TENUE' : 'QUEBRADIZA'
                })) || [],
                policeSuspicionText: (data.activePersona?.police_suspicion ?? 5) > 20 
                  ? 'Vigilancia en las esquinas de tu calle.' 
                  : 'Sin sospechas policiales aparentes.',
                churchSuspicionText: (data.activePersona?.church_suspicion ?? 5) > 20
                  ? 'Sombras inquisitorias rondan tu vecindario.'
                  : 'Los clérigos no han registrado tu nombre.'
              });
            }
          }).catch(() => {
            // Sin personaje válido en el servidor: permanece en Prólogo
          });
        }
      }
    }
  }, [character]);

  const refreshCharacter = async () => {
    if (!character?.id) return;
    try {
      const data = await apiClient.getCharacter(character.id);
      if (data?.character) {
        const mappedSanity = mapSanityToVisual(data.somatics?.sanityTier || 'LUCID');
        const mappedCorruption = mapCorruptionToVisual(data.somatics?.corruptionTier || 'PRISTINE');
        const mappedRuina = mapRuinaToVisual(data.somatics?.ruinaTier || 0);

        setCharacter(prev => prev ? {
          ...prev,
          somatics: {
            ...prev.somatics,
            sanityTier: mappedSanity.tier,
            candleDescription: mappedSanity.description,
            corruptionTier: mappedCorruption.tier,
            mirrorDescription: mappedCorruption.description,
            ruinaTier: mappedRuina.tier,
            woodDescription: mappedRuina.description
          },
          walletText: data.wallet ? `${data.wallet.pounds} £, ${data.wallet.soli} s` : prev.walletText,
          anchors: data.anchors?.map((a: any) => ({
            id: a.id,
            tipo: a.type || 'persona',
            nombre: a.name || a.title || 'Ancla',
            descripcion: a.description || 'Vínculo humano',
            fuerza: a.strength > 25 ? 'FIRME' : a.strength > 10 ? 'TENUE' : 'QUEBRADIZA'
          })) || prev.anchors,
          policeSuspicionText: (data.activePersona?.police_suspicion ?? 5) > 20 
            ? 'Vigilancia en las esquinas de tu calle.' 
            : 'Sin sospechas policiales aparentes.',
          churchSuspicionText: (data.activePersona?.church_suspicion ?? 5) > 20
            ? 'Sombras inquisitorias rondan tu vecindario.'
            : 'Los clérigos no han registrado tu nombre.'
        } : null);
      }
    } catch {
      // Fixture local
    }
  };

  // Si no hay personaje despierto y no está forzado el harness, iniciar en el Prólogo Canónico
  if (!character) {
    return (
      <SceneViewport debugOverlay={showDebugMasks}>
        <div className="w-[1920px] h-[1080px] relative overflow-hidden bg-[#090807] text-[#e5ded2]">
          <PrologueView 
            onCompletePrologue={(newChar) => {
              setCharacter(newChar);
              navigateTo('DESK_WIDE');
            }} 
          />
          
          {/* Acceso Rápido al Harness de Pruebas */}
          <button
            type="button"
            onClick={() => {
              setCharacter(FOOL_SEER_FIXTURE as unknown as CharacterDiegetic);
              setShowHarness(true);
            }}
            className="fixed bottom-4 right-4 z-50 px-3 py-1.5 rounded bg-[#1c1813] border border-[#8c733e] text-[#d4af37] text-xs font-serif opacity-70 hover:opacity-100 transition-opacity"
          >
            Activar Harness
          </button>
        </div>
      </SceneViewport>
    );
  }

  const inspectedHotspot = state.activeHotspotId ? CANONICAL_HOTSPOTS[state.activeHotspotId] : null;

  return (
    <SceneViewport debugOverlay={showDebugMasks}>
      
      {/* Capa 5: Capa de Visión Espiritual (El Velo) */}
      <VeilOverlay 
        active={state.isSpiritVisionActive} 
        onClose={toggleSpiritVision} 
      />

      {/* Router de Vistas Gobernado por la Máquina de Navegación Central */}
      {(state.currentView === 'DESK_WIDE' || state.currentView === 'DESK_FOCUS' || state.currentView === 'INSPECTION_LAYER') && (
        <DeskView
          character={character}
          onOpenCorkboard={() => navigateTo('CORKBOARD_STAGE', 'FOCUS_CORKBOARD')}
          onOpenCalendar={() => navigateTo('CALENDAR_STAGE', 'FOCUS_DESK', 'hotspot_almanack')}
          onOpenMarket={() => navigateTo('MARKET_STAGE', 'FOCUS_DESK', 'hotspot_bazaar_letter')}
          onOpenCombat={() => navigateTo('COMBAT_STAGE', 'FOCUS_STAIRCASE')}
          onOpenAscension={() => navigateTo('CEREMONY_STAGE', 'FOCUS_HORNACINA')}
          onOpenActing={() => navigateTo('ACTING_STAGE', 'FOCUS_DESK', 'hotspot_acting_diary')}
          onOpenIdentity={() => navigateTo('IDENTITY_STAGE', 'FOCUS_DESK', 'hotspot_identity_papers')}
          onToggleSpiritVision={toggleSpiritVision}
          spiritVisionActive={state.isSpiritVisionActive}
          timeSlot={timeSlot}
          dayNumber={dayNumber}
          debugOverlay={showDebugMasks}
        />
      )}

      {state.currentView === 'CORKBOARD_STAGE' && (
        <div className="absolute inset-0 z-30">
          <CorkboardView onBackToDesk={backToDesk} />
        </div>
      )}

      {state.currentView === 'CALENDAR_STAGE' && (
        <div className="absolute inset-0 z-30">
          <CalendarView 
            onBackToDesk={backToDesk} 
            characterId={character.id}
            initialDay={dayNumber}
            initialSlot={timeSlot}
            onActionCompleted={(outcome) => {
              const slotNames: Record<number, TimeSlot> = { 0: 'MAÑANA', 1: 'TARDE', 2: 'NOCHE', 3: 'MADRUGADA' };
              setTimeSlot(slotNames[outcome.slot] || 'TARDE');
              setDayNumber(outcome.day);
              refreshCharacter();
            }}
          />
        </div>
      )}

      {state.currentView === 'MARKET_STAGE' && (
        <div className="absolute inset-0 z-30">
          <MarketView onBackToDesk={backToDesk} />
        </div>
      )}

      {state.currentView === 'ACTING_STAGE' && (
        <div className="absolute inset-0 z-30">
          <ActingMirrorView
            character={character}
            onBackToDesk={backToDesk}
            onRefreshCharacter={refreshCharacter}
          />
        </div>
      )}

      {state.currentView === 'IDENTITY_STAGE' && (
        <div className="absolute inset-0 z-30">
          <IdentityDossierView
            character={character}
            onBackToDesk={backToDesk}
            onRefreshCharacter={refreshCharacter}
          />
        </div>
      )}

      {state.currentView === 'COMBAT_STAGE' && (
        <div className="absolute inset-0 z-30">
          <CombatView onBackToDesk={backToDesk} />
        </div>
      )}

      {state.currentView === 'CEREMONY_STAGE' && (
        <div className="absolute inset-0 z-30">
          <AscensionView
            character={character}
            onBackToDesk={backToDesk}
          />
        </div>
      )}

      {/* Capa 4: Inspección Focal con Texto Refluible */}
      {state.currentView === 'INSPECTION_LAYER' && (
        <InspectionLayer
          hotspot={inspectedHotspot}
          onClose={closeInspection}
        />
      )}

      {/* Panel Flotante de Harness de Pruebas R2 / R4 */}
      {showHarness && (
        <SceneHarness />
      )}

    </SceneViewport>
  );
}

export function App() {
  return (
    <ErrorBoundary>
      <NavigationProvider>
        <AppContent />
      </NavigationProvider>
    </ErrorBoundary>
  );
}

export default App;
