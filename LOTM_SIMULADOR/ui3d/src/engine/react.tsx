import {
  createContext, useContext, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode
} from 'react';
import type { Effect } from './effects';
import type { PlaceSpec } from './PlaceSpec';
import { Stage, type StageEvent } from './Stage';
import type { Vec2 } from './types';

interface StageCtx {
  stage: Stage | null;
  /** factor lienzo de referencia → píxel CSS */
  hudScale: number;
  error: string | null;
}

const Ctx = createContext<StageCtx>({ stage: null, hudScale: 1, error: null });

export const useStage = () => useContext(Ctx).stage;
export const useHudScale = () => useContext(Ctx).hudScale;
export const useStageError = () => useContext(Ctx).error;

/** Escala del HUD: el lienzo de referencia 1920×1080 cabe entero; en pantallas estrechas, se prioriza la lectura. */
function computeHudScale(w: number, h: number) {
  if (w <= 0 || h <= 0) return 1; // ventana aún sin medir (pestaña oculta al cargar)
  const s = Math.min(w / 1920, h / 1080);
  if (w < 900 && h > w) return w / 600; // móvil vertical: lienzo lógico de 600 px de ancho
  return w < 900 ? Math.max(s, w / 1180) : s;
}

export function StageProvider({ children }: { children: ReactNode }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stage, setStage] = useState<Stage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [size, setSize] = useState(() => [window.innerWidth, window.innerHeight]);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const s = new Stage(canvas);
    let alive = true;
    s.init()
      .then(() => {
        if (import.meta.env.DEV) (window as unknown as { __stage?: Stage }).__stage = s; // sólo para revisión
        if (alive) setStage(s);
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : String(err)));
    return () => {
      alive = false;
      s.dispose();
    };
  }, []);

  useEffect(() => {
    const onResize = () => setSize([window.innerWidth, window.innerHeight]);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const hudScale = computeHudScale(size[0], size[1]);
  return (
    <Ctx.Provider value={{ stage, hudScale, error }}>
      <canvas ref={canvasRef} className="stage-canvas" aria-hidden="true" />
      <div
        className="hud"
        style={{ width: size[0] / hudScale, height: size[1] / hudScale, transform: `scale(${hudScale})` }}
      >
        {children}
      </div>
    </Ctx.Provider>
  );
}

/** Carga el lugar en el escenario mientras el componente está montado. */
export function usePlace(spec: PlaceSpec | null) {
  const stage = useStage();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!stage || !spec) return;
    let alive = true;
    setReady(false);
    stage.loadPlace(spec).then(() => alive && setReady(true)).catch((err) => console.error(err));
    return () => {
      alive = false;
    };
  }, [stage, spec]);
  return { stage, ready, provisional: stage?.provisional ?? true };
}

export function useStageEvents(handler: (e: StageEvent) => void) {
  const stage = useStage();
  const ref = useRef(handler);
  ref.current = handler;
  useEffect(() => {
    if (!stage) return;
    return stage.on((e) => ref.current(e)) as () => void;
  }, [stage]);
}

/** Objeto de juego vivo mientras el componente está montado (rejilla, tarjeta, manecilla…). */
export function useAttached<T extends Effect>(factory: () => T | null, deps: unknown[]): T | null {
  const stage = useStage();
  const [effect, setEffect] = useState<T | null>(null);
  useEffect(() => {
    if (!stage) return;
    const e = factory();
    if (!e) return;
    stage.attach(e);
    setEffect(e);
    return () => {
      stage.detach(e);
      setEffect(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, ...deps]);
  return effect;
}

/**
 * Elemento del HUD anclado a un punto de la lámina: sigue a la cámara, el paralaje y el balanceo en
 * cada frame escribiendo el transform directamente (sin re-render de React).
 */
export function Anchored({ at, children, style, className, offset = [0, 0], scaleWithStage }: {
  at: Vec2;
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
  /** desplazamiento en px de referencia del HUD */
  offset?: Vec2;
  /** escala el elemento con el zoom de la cámara */
  scaleWithStage?: boolean;
}) {
  const stage = useStage();
  const hudScale = useHudScale();
  const ref = useRef<HTMLDivElement>(null);
  const atRef = useRef(at);
  atRef.current = at;
  const offRef = useRef(offset);
  offRef.current = offset;

  useLayoutEffect(() => {
    if (!stage) return;
    const place = () => {
      const el = ref.current;
      if (!el) return;
      const [x, y] = stage.project(atRef.current);
      const k = scaleWithStage ? stage.pixelsPerUnit / hudScale : 1;
      el.style.transform = `translate3d(${x / hudScale + offRef.current[0]}px, ${y / hudScale + offRef.current[1]}px, 0) translate(-50%, -100%) scale(${k})`;
    };
    place();
    return stage.on((e) => e.type === 'frame' && place()) as () => void;
  }, [stage, hudScale, scaleWithStage]);

  return (
    <div ref={ref} className={className} style={{ position: 'absolute', left: 0, top: 0, ...style }}>
      {children}
    </div>
  );
}

/** Convierte un punto de lámina a coordenadas del HUD (px de referencia) en el frame actual. */
export function useProjector() {
  const stage = useStage();
  const hudScale = useHudScale();
  return (p: Vec2): Vec2 => {
    if (!stage) return p;
    const [x, y] = stage.project(p);
    return [x / hudScale, y / hudScale];
  };
}
