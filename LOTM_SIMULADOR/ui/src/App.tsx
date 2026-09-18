/**
 * PATH TO GODHOOD — SHELL PRINCIPAL Y ENTORNO DE ESCENA (BRIEF-10.VISUAL-R2)
 * Integra SceneViewport 1920x1080, NavigationProvider, InspectionLayer y SceneHarness.
 */

import { useState, useEffect } from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import type { CharacterDiegetic } from './features/types';
import { PrologueView } from './features/prologue/PrologueView';
import { DeskView } from './features/desk/DeskView';
import { CorkboardView } from './features/investigation/CorkboardView';
import { CalendarView } from './features/calendar/CalendarView';
import { MarketView } from './features/market/MarketView';
import { ActingMirrorView } from './features/acting/ActingMirrorView';
import { CombatView } from './features/combat/CombatView';
import { AscensionView } from './features/ascension/AscensionView';
import { VeilOverlay } from './features/veil/VeilOverlay';
import { NavigationProvider, useNavigation } from './scene/navigation/NavigationContext';
import { SceneViewport } from './scene/SceneViewport';
import { InspectionLayer } from './scene/InspectionLayer';
import { SceneHarness, FOOL_SEER_FIXTURE } from './harness/SceneHarness';
import { CANONICAL_HOTSPOTS } from './scene/types';

function AppContent() {
  const { state, navigateTo, closeInspection, backToDesk, toggleSpiritVision } = useNavigation();
  const [character, setCharacter] = useState<CharacterDiegetic | null>(null);
  const [showHarness, setShowHarness] = useState<boolean>(false);

  // Comprobar parámetro URL para activar harness automáticamente (?harness=true)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('harness') === 'true') {
      setShowHarness(true);
      if (!character) {
        // Inicializar con fixture canónico para pruebas rápidas en harness
        setCharacter(FOOL_SEER_FIXTURE as unknown as CharacterDiegetic);
      }
    }
  }, [character]);

  // Si no hay personaje despierto y no está forzado el harness, iniciar en el Prólogo Canónico
  if (!character) {
    return (
      <div className="relative min-h-screen bg-[#090807] text-[#e5ded2]">
        <PrologueView 
          onCompletePrologue={(newChar) => {
            setCharacter(newChar);
            navigateTo('DESK_WIDE');
          }} 
        />
        
        {/* Acceso Rápido al Harness de Pruebas R2 */}
        <button
          type="button"
          onClick={() => {
            setCharacter(FOOL_SEER_FIXTURE as unknown as CharacterDiegetic);
            setShowHarness(true);
          }}
          className="fixed bottom-4 right-4 z-50 px-3 py-1.5 rounded bg-[#1c1813] border border-[#8c733e] text-[#d4af37] text-xs font-serif opacity-70 hover:opacity-100 transition-opacity"
        >
          Activar Harness R2
        </button>
      </div>
    );
  }

  const inspectedHotspot = state.activeHotspotId ? CANONICAL_HOTSPOTS[state.activeHotspotId] : null;

  return (
    <SceneViewport debugOverlay={showHarness}>
      
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
          onToggleSpiritVision={toggleSpiritVision}
          spiritVisionActive={state.isSpiritVisionActive}
        />
      )}

      {state.currentView === 'CORKBOARD_STAGE' && (
        <div className="absolute inset-0 z-30">
          <CorkboardView onBackToDesk={backToDesk} />
        </div>
      )}

      {state.currentView === 'CALENDAR_STAGE' && (
        <div className="absolute inset-0 z-30">
          <CalendarView onBackToDesk={backToDesk} />
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

      {/* Panel del Harness de Pruebas (Alternable) */}
      {showHarness && (
        <div style={{ position: 'relative', zIndex: 100 }}>
          <SceneHarness />
        </div>
      )}

      {/* Botón Flotante para Alternar Harness */}
      <button
        type="button"
        onClick={() => setShowHarness(prev => !prev)}
        className="fixed bottom-3 right-3 z-50 px-2.5 py-1 rounded bg-[#100e0b]/90 border border-[#8c733e]/50 text-[#d4af37] text-[10px] font-mono opacity-60 hover:opacity-100 transition-opacity"
        title="Alternar panel de pruebas del Harness R2"
      >
        {showHarness ? 'Ocultar Harness' : 'Harness R2'}
      </button>

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
