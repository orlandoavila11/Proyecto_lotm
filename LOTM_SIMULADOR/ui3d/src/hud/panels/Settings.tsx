import { useEffect, useState } from 'react';
import { ambience } from '../../audio/Ambience';
import { useStage } from '../../engine/react';
import { useSession } from '../../session/store';
import { GoldButton } from '../kit/components';
import { SidePanel } from '../kit/cards';

const KEY = 'lotm_ui3d_quality';

interface Prefs {
  sound: boolean;
  bloom: boolean;
  grain: boolean;
  motion: boolean;
  sharp: boolean;
}

function readPrefs(): Prefs {
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  const base: Prefs = { sound: true, bloom: true, grain: true, motion: !reduced, sharp: true };
  try {
    return { ...base, ...JSON.parse(localStorage.getItem(KEY) ?? '{}') };
  } catch {
    return base;
  }
}

/** Aplica las preferencias guardadas al arrancar el escenario. */
export function useQualityPrefs() {
  const stage = useStage();
  useEffect(() => {
    if (!stage) return;
    const p = readPrefs();
    ambience.setEnabled(p.sound);
    stage.setQuality({ bloom: p.bloom, grain: p.grain, motion: p.motion, pixelRatio: p.sharp ? Math.min(devicePixelRatio, 2) : 1 });
  }, [stage]);
}

export function Settings() {
  const stage = useStage();
  const { openSettings, go, snapshot } = useSession();
  const [prefs, setPrefs] = useState<Prefs>(readPrefs);

  const update = (patch: Partial<Prefs>) => {
    const next = { ...prefs, ...patch };
    setPrefs(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* sin almacenamiento: vale para esta sesión */
    }
    ambience.setEnabled(next.sound);
    if (next.sound) ambience.start();
    stage?.setQuality({ bloom: next.bloom, grain: next.grain, motion: next.motion, pixelRatio: next.sharp ? Math.min(devicePixelRatio, 2) : 1 });
  };

  const Toggle = ({ k, label }: { k: keyof Prefs; label: string }) => (
    <label className="toggle">
      <input type="checkbox" checked={prefs[k]} onChange={(e) => update({ [k]: e.target.checked })} />
      <span className="toggle__box" aria-hidden="true" />
      <span>{label}</span>
    </label>
  );

  return (
    <SidePanel title="Ajustes" onClose={() => openSettings(false)} width={440}>
      <div style={{ display: 'grid', gap: 14, fontSize: 21 }}>
        <Toggle k="sound" label="Sonido ambiente" />
        <Toggle k="bloom" label="Halo de las luces" />
        <Toggle k="grain" label="Grano de película" />
        <Toggle k="motion" label="Balanceo de cámara" />
        <Toggle k="sharp" label="Nitidez máxima" />
        <p className="t-body" style={{ fontSize: 17, color: 'var(--ivory-dim)', margin: '6px 0 0' }}>
          Motor de dibujo: {stage?.isWebGPU ? 'WebGPU' : 'WebGL 2 (respaldo)'}
        </p>
        {snapshot && (
          <GoldButton style={{ marginTop: 16 }} onClick={() => { openSettings(false); go('title'); }}>
            Volver a la portada
          </GoldButton>
        )}
      </div>
    </SidePanel>
  );
}
