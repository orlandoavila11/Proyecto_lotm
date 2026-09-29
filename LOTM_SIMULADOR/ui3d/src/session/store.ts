import { create } from 'zustand';
import { ApiError, api } from '../api/client';
import type { CharacterSnapshot } from '../api/types';

/**
 * Sesión del cliente (ADR-002): identidad activa y la última proyección confirmada por el servidor.
 * Nada de lo que aquí vive es autoridad; cada mutación vuelve a pedir la instantánea.
 */

export type PlaceId =
  | 'title'
  | 'origin'
  | 'prologue'
  | 'desvan'
  | 'cherwood'
  | 'location'
  | 'board'
  | 'bazaar'
  | 'combat'
  | 'journal'
  | 'ascension';

export interface Toast {
  id: number;
  text: string;
  kind: 'info' | 'error';
}

const STORAGE_KEY = 'lotm_active_character_id';

interface SessionState {
  characterId: string | null;
  snapshot: CharacterSnapshot | null;
  place: PlaceId;
  /** parámetro del lugar: escena de investigación, distrito del bazar… */
  placeArg: string | null;
  lastSavedAt: number | null;
  booting: boolean;
  toasts: Toast[];
  settingsOpen: boolean;

  boot(): Promise<void>;
  adopt(characterId: string): void;
  forget(): void;
  refresh(): Promise<CharacterSnapshot | null>;
  go(place: PlaceId, arg?: string | null): void;
  saved(): void;
  notify(text: string, kind?: Toast['kind']): void;
  fail(err: unknown): void;
  dismiss(id: number): void;
  openSettings(open: boolean): void;
}

let toastSeq = 1;

function readStoredId(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeStoredId(id: string | null) {
  try {
    if (id) localStorage.setItem(STORAGE_KEY, id);
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* almacenamiento bloqueado: la sesión sigue en memoria */
  }
}

export const useSession = create<SessionState>((set, get) => ({
  characterId: null,
  snapshot: null,
  place: 'title',
  placeArg: null,
  lastSavedAt: null,
  booting: true,
  toasts: [],
  settingsOpen: false,

  async boot() {
    // sólo en desarrollo: ?char=<id>&place=<lugar>[&arg=] para revisar una escena directamente
    const dev = import.meta.env.DEV ? new URLSearchParams(location.search) : null;
    if (dev?.get('char')) writeStoredId(dev.get('char'));
    const id = readStoredId();
    if (!id) {
      set({ booting: false, place: 'title' });
      return;
    }
    try {
      const snap = await api.character(id);
      const devPlace = dev?.get('place') as PlaceId | null | undefined;
      set({ characterId: id, snapshot: snap, booting: false, place: devPlace ?? 'title', placeArg: dev?.get('arg') ?? null });
    } catch (err) {
      // personaje borrado del servidor: se olvida en el cliente
      if (err instanceof ApiError && err.status === 404) writeStoredId(null);
      else get().fail(err);
      set({ characterId: null, snapshot: null, booting: false, place: 'title' });
    }
  },

  adopt(characterId) {
    writeStoredId(characterId);
    set({ characterId });
  },

  forget() {
    writeStoredId(null);
    set({ characterId: null, snapshot: null, place: 'title', placeArg: null });
  },

  async refresh() {
    const id = get().characterId;
    if (!id) return null;
    try {
      const snap = await api.character(id);
      set({ snapshot: snap });
      return snap;
    } catch (err) {
      get().fail(err);
      return null;
    }
  },

  go(place, arg = null) {
    set({ place, placeArg: arg });
  },

  saved() {
    set({ lastSavedAt: Date.now() });
  },

  notify(text, kind = 'info') {
    const id = toastSeq++;
    set((s) => ({ toasts: [...s.toasts.slice(-2), { id, text, kind }] }));
    window.setTimeout(() => get().dismiss(id), kind === 'error' ? 7000 : 5200);
  },

  fail(err) {
    const text = err instanceof Error ? err.message : 'Algo se interpuso entre tú y el motor.';
    get().notify(text, 'error');
  },

  dismiss(id) {
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
  },

  openSettings(open) {
    set({ settingsOpen: open });
  }
}));

/** Franjas del calendario (CalendarEngine.SLOT_NAMES) en prosa del juego. */
export const SLOT_LABEL = ['Mañana', 'Tarde', 'Anochecer', 'Noche'] as const;
/** hora representativa de cada franja para las manecillas del reloj de la mesa */
export const SLOT_CLOCK: readonly [number, number][] = [[9, 40], [15, 10], [20, 5], [23, 50]];

export function districtLabel(location: string | undefined): string {
  if (!location) return 'Backlund';
  const l = location.toLowerCase();
  if (l.includes('cherwood')) return 'Cherwood';
  if (l.includes('east') || l.includes('este')) return 'East Borough';
  if (l.includes('queen') || l.includes('reina')) return 'Distrito de la Reina';
  if (l.includes('bridge') || l.includes('puente')) return 'Distrito del Puente';
  if (l.includes('north') || l.includes('norte')) return 'Distrito Norte';
  if (l.includes('bayam')) return 'Bayam';
  return location.replace(/^DIST_/, '').replace(/_/g, ' ');
}

export function formatMoney(pence: number): string {
  const pounds = Math.floor(pence / 240);
  const soli = Math.floor((pence % 240) / 12);
  const d = pence % 12;
  const parts: string[] = [];
  if (pounds) parts.push(`${pounds} £`);
  if (soli) parts.push(`${soli} s`);
  if (d || parts.length === 0) parts.push(`${d} d`);
  return parts.join(' ');
}
