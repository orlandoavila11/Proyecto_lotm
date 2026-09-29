import { useEffect, type ReactElement } from 'react';
import { PLACE_AMBIENCE, SILENCE, ambience } from './audio/Ambience';
import { StageProvider, useStage, useStageError } from './engine/react';
import { Settings, useQualityPrefs } from './hud/panels/Settings';
import { Desvan } from './places/Desvan';
import { Origin } from './places/Origin';
import { Prologue } from './places/Prologue';
import { Title } from './places/Title';
import { PLACES_EXTRA } from './places/registry';
import { useSession, type PlaceId } from './session/store';

const PLACES: Partial<Record<PlaceId, () => ReactElement | null>> = {
  title: Title,
  origin: Origin,
  prologue: Prologue,
  desvan: Desvan,
  ...PLACES_EXTRA
};

function Router() {
  const { place, placeArg, booting, snapshot, go } = useSession();
  const stage = useStage();
  useQualityPrefs();

  // el ambiente sonoro sigue al lugar; arranca con el primer gesto del jugador
  useEffect(() => {
    const key = place === 'location' && placeArg === 'orfanato' ? 'cherwood' : place;
    ambience.setProfile(PLACE_AMBIENCE[key] ?? SILENCE);
  }, [place, placeArg]);
  useEffect(() => (stage ? (stage.onThunder((d) => ambience.thunder(d)) as () => void) : undefined), [stage]);
  useEffect(() => {
    const start = () => ambience.start();
    window.addEventListener('pointerdown', start, { once: true });
    window.addEventListener('keydown', start, { once: true });
    return () => {
      window.removeEventListener('pointerdown', start);
      window.removeEventListener('keydown', start);
    };
  }, []);

  // sin personaje confirmado, sólo existen la portada y el registro de origen
  useEffect(() => {
    if (booting) return;
    if (!snapshot && place !== 'title' && place !== 'origin') go('title');
  }, [booting, snapshot, place, go]);

  if (booting || !stage) return <Boot />;
  const View = PLACES[place];
  return View ? <View key={place} /> : null;
}

function Boot() {
  const error = useStageError();
  return (
    <div className="boot" role="status">
      {error ? (
        <>
          <p className="t-display" style={{ fontSize: 30 }}>La lámpara no prende</p>
          <p className="t-body" style={{ fontSize: 21, maxWidth: 720 }}>{error}</p>
        </>
      ) : (
        <p className="t-body boot__line">Encendiendo el quinqué…</p>
      )}
    </div>
  );
}

function Toasts() {
  const toasts = useSession((s) => s.toasts);
  const dismiss = useSession((s) => s.dismiss);
  return (
    <div aria-live="polite">
      {toasts.slice(-1).map((t) => (
        <div key={t.id} className={`toast ${t.kind === 'error' ? 'toast--error' : ''}`} role={t.kind === 'error' ? 'alert' : 'status'} onClick={() => dismiss(t.id)}>
          {t.text}
        </div>
      ))}
    </div>
  );
}

export function App() {
  const boot = useSession((s) => s.boot);
  const settingsOpen = useSession((s) => s.settingsOpen);
  useEffect(() => {
    boot();
  }, [boot]);
  return (
    <StageProvider>
      <Router />
      {settingsOpen && <Settings />}
      <Toasts />
    </StageProvider>
  );
}
