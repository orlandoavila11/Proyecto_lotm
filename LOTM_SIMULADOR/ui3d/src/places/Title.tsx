import { useEffect } from 'react';
import { usePlace } from '../engine/react';
import { Divider } from '../hud/kit/Gilt';
import { GoldButton } from '../hud/kit/components';
import { useSession } from '../session/store';
import { desvanSpec } from './specs/desvan';
import { titleView } from './specs/interiors';

/** Portada: el desván en penumbra; sólo la vela y la lluvia se mueven. */
export function Title() {
  const { snapshot, go, forget } = useSession();
  const { stage, ready } = usePlace(desvanSpec);

  useEffect(() => {
    if (!stage || !ready) return;
    stage.setInteractive(false);
    stage.setView(titleView);
    stage.plate.uExposure.value = 0.42;
    stage.plate.uSaturation.value = 0.85;
    return () => {
      stage.plate.uExposure.value = 1;
      stage.plate.uSaturation.value = 1;
      stage.setInteractive(true);
    };
  }, [stage, ready]);

  const resume = () => {
    const step = snapshot?.character.prologue_step;
    if (step === 'POTION_CHOICE') go('prologue');
    else go('desvan');
  };

  return (
    <main className="title-screen">
      <div className="title-screen__mark fade-in">
        <h1 className="t-display title-screen__name">Path to Godhood</h1>
        <Divider width={420} style={{ margin: '22px auto 30px' }} />
        <p className="t-body title-screen__motto">
          De día, un civil con empleo y deudas en Backlund. De noche, un papel que te digiere.
        </p>
      </div>
      <div className="title-screen__actions fade-in" style={{ animationDelay: '380ms' }}>
        {snapshot && (
          <GoldButton primary onClick={resume} style={{ minWidth: 440 }}>
            Continuar la crónica de {snapshot.character.name}
          </GoldButton>
        )}
        <GoldButton
          onClick={() => {
            if (snapshot) forget();
            go('origin');
          }}
          style={{ minWidth: 440 }}
        >
          {snapshot ? 'Empezar otra vida' : 'Abrir la crónica'}
        </GoldButton>
      </div>
    </main>
  );
}
