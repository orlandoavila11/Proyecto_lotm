import { useState } from 'react';
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

export type CurrentView = 
  | 'DESK' 
  | 'CORKBOARD' 
  | 'CALENDAR' 
  | 'MARKET' 
  | 'ACTING' 
  | 'COMBAT' 
  | 'ASCENSION';

export function App() {
  const [character, setCharacter] = useState<CharacterDiegetic | null>(null);
  const [currentView, setCurrentView] = useState<CurrentView>('DESK');
  const [spiritVisionActive, setSpiritVisionActive] = useState<boolean>(false);

  // Si no hay personaje despierto, iniciar en el Prólogo Canónico
  if (!character) {
    return (
      <ErrorBoundary>
        <PrologueView 
          onCompletePrologue={(newChar) => {
            setCharacter(newChar);
            setCurrentView('DESK');
          }} 
        />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="relative min-h-screen bg-[#090807] text-[#e5ded2]">
        
        {/* Capa de Visión Espiritual (El Velo) */}
        <VeilOverlay 
          active={spiritVisionActive} 
          onClose={() => setSpiritVisionActive(false)} 
        />

        {/* Router de Vistas Diegéticas */}
        {currentView === 'DESK' && (
          <DeskView
            character={character}
            onOpenCorkboard={() => setCurrentView('CORKBOARD')}
            onOpenCalendar={() => setCurrentView('CALENDAR')}
            onOpenMarket={() => setCurrentView('MARKET')}
            onOpenCombat={() => setCurrentView('COMBAT')}
            onOpenAscension={() => setCurrentView('ASCENSION')}
            onToggleSpiritVision={() => setSpiritVisionActive(prev => !prev)}
            spiritVisionActive={spiritVisionActive}
          />
        )}

        {currentView === 'CORKBOARD' && (
          <CorkboardView 
            onBackToDesk={() => setCurrentView('DESK')} 
          />
        )}

        {currentView === 'CALENDAR' && (
          <CalendarView 
            onBackToDesk={() => setCurrentView('DESK')} 
          />
        )}

        {currentView === 'MARKET' && (
          <MarketView 
            onBackToDesk={() => setCurrentView('DESK')} 
          />
        )}

        {currentView === 'ACTING' && (
          <ActingMirrorView
            character={character}
            onBackToDesk={() => setCurrentView('DESK')}
          />
        )}

        {currentView === 'COMBAT' && (
          <CombatView 
            onBackToDesk={() => setCurrentView('DESK')} 
          />
        )}

        {currentView === 'ASCENSION' && (
          <AscensionView
            character={character}
            onBackToDesk={() => setCurrentView('DESK')}
          />
        )}

      </div>
    </ErrorBoundary>
  );
}

export default App;
