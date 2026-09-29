import type {
  ActingDilemma, ActingResolution, AscensionResult, AscensionStatus, BattleEnvelope, BuyResult, CalendarAction,
  CalendarLog, CalendarOutcome, CaseEnvelope, CaseState, CharacterSnapshot, ClueRelation, CombatActionResult,
  District, Hypothesis, IdentityEvent, MarketEnvelope, OriginDef, PotionOption, PrologueStart, PrologueStatus, Quality,
  Receipted, Resolution, TravelResult, VisitSourceResult
} from './types';

/**
 * Cliente del motor. Principios (ADR-003/004):
 *  - el servidor es la única autoridad: aquí no hay datos de respaldo ni victorias optimistas;
 *  - toda mutación lleva un commandId; si la red falla, se consulta el recibo antes de dar el error.
 */
export class ApiError extends Error {
  constructor(message: string, readonly status: number, readonly code?: string) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, {
      ...init,
      headers: init?.body ? { 'Content-Type': 'application/json', ...init.headers } : init?.headers
    });
  } catch {
    throw new ApiError('No hay respuesta del motor. Comprueba que el servidor está en marcha.', 0, 'NETWORK');
  }
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = body?.error ?? body?.message ?? `Error ${res.status}`;
    throw new ApiError(typeof msg === 'string' ? msg : `Error ${res.status}`, res.status, body?.code);
  }
  return body as T;
}

const get = <T>(path: string) => request<T>(path);
const post = <T>(path: string, body: unknown) => request<T>(path, { method: 'POST', body: JSON.stringify(body) });

export function newCommandId(kind: string): string {
  return `${kind}_${crypto.randomUUID()}`;
}

/**
 * Mutación idempotente: si la petición se pierde por red, pregunta al servidor si el comando llegó
 * a ejecutarse y devuelve esa respuesta en lugar de repetirlo.
 */
async function command<T>(path: string, kind: string, body: Record<string, unknown>): Promise<T & Receipted> {
  const commandId = newCommandId(kind);
  try {
    return await post<T & Receipted>(path, { ...body, commandId });
  } catch (err) {
    if (err instanceof ApiError && err.code === 'NETWORK') {
      const receipt = await get<{ response: T; revision: number }>(`/api/commands/receipt/${encodeURIComponent(commandId)}`).catch(() => null);
      if (receipt) return { ...receipt.response, fromReceipt: true, revision: receipt.revision };
    }
    throw err;
  }
}

const enc = encodeURIComponent;

export const api = {
  health: () => get<{ status: string }>('/api/health'),

  // ── personaje
  character: (id: string) => get<CharacterSnapshot>(`/api/character/${enc(id)}`),

  // ── prólogo
  origins: () => get<{ origins: OriginDef[] }>('/api/prologue/origins'),
  prologueStart: (originId: string, name: string, characterId?: string) =>
    post<PrologueStart>('/api/prologue/start', { originId, name, characterId }),
  prologueStatus: (id: string) => get<PrologueStatus>(`/api/prologue/status/${enc(id)}`),
  prologueDilemma: (characterId: string, choice: 'PRUDENCE' | 'CURIOSITY') =>
    post<{ narrativeOutcome: string; prologueStep?: string }>('/api/prologue/tutorial/dilemma', { characterId, choice }),
  potions: () => get<{ intro: string; options: PotionOption[] }>('/api/prologue/potions'),
  drinkFirstPotion: (characterId: string, potionChoice: 'COBALT_EYES' | 'AMBER_MIRROR') =>
    post<{ pathway: string; sequence: number; sequenceName: string; visionNarrative: string; awakeningNarrative: string }>(
      '/api/prologue/drink', { characterId, potionChoice }),

  // ── calendario
  calendarAction: (characterId: string, actionType: CalendarAction) =>
    command<CalendarOutcome>('/api/calendar/action', 'cal', { characterId, actionType }),
  calendarLogs: (id: string, limit = 30) => get<{ logs: CalendarLog[] }>(`/api/calendar/logs/${enc(id)}?limit=${limit}`),

  // ── ciudad
  districts: () => get<{ districts: District[]; carriageFarePence: number }>('/api/city/districts'),
  travel: (characterId: string, destinationDistrict: string) =>
    command<TravelResult>('/api/city/travel', 'travel', { characterId, destinationDistrict }),

  // ── investigación
  activeCase: (characterId: string) => get<CaseEnvelope>(`/api/investigation/case/active/${enc(characterId)}`),
  visitSource: (instanceId: string, clueId: string, sourceIndex: number, timeOfDay?: 'mañana' | 'tarde' | 'noche') =>
    command<VisitSourceResult>('/api/investigation/clue/visit-source', 'visit', { instanceId, clueId, sourceIndex, timeOfDay }),
  connectClues: (instanceId: string, clueA: string, clueB: string, relation: ClueRelation) =>
    command<{ success: boolean; isCorrect: boolean; insight: string | null; message: string; state: CaseState; availableHypotheses?: Hypothesis[] }>(
      '/api/investigation/clues/connect', 'connect', { instanceId, clueA, clueB, relation }),
  submitHypothesis: (instanceId: string, hypothesisId: string) =>
    command<{ success: boolean; isCorrect: boolean; resolutionUnlocked: boolean; message: string; state: CaseState; availableHypotheses?: Hypothesis[] }>(
      '/api/investigation/hypothesis/submit', 'hypo', { instanceId, hypothesisId }),
  addNote: (instanceId: string, text: string, x?: number, y?: number) =>
    command<{ success: boolean; state: CaseState; availableHypotheses?: Hypothesis[] }>('/api/investigation/notes/add', 'note', { instanceId, text, x, y }),
  resolveCase: (instanceId: string, resolutionId: Resolution['id']) =>
    command<{ success: boolean; message: string; state: CaseState; availableHypotheses?: Hypothesis[] }>('/api/investigation/case/resolve', 'resolve', { instanceId, resolutionId }),

  // ── mercado
  market: (districtId: string) => get<MarketEnvelope>(`/api/economy/market/${enc(districtId)}`),
  buy: (characterId: string, districtId: string, itemCode: string, quality: Quality) =>
    command<BuyResult>('/api/economy/buy', 'buy', { characterId, districtId, itemCode, quality }),
  /** venta de cosecha: el grado lo fijó el servidor al cosechar */
  sellHarvest: (characterId: string, inventoryItemId: string) =>
    command<{ success: boolean; penceGained: number; remainingBalance: number }>('/api/economy/sell', 'sell', { characterId, inventoryItemId }),

  // ── combate
  activeBattle: async (characterId: string): Promise<BattleEnvelope | null> => {
    // probe=1: "sin combate" llega como respuesta y no como 404 (consola limpia)
    const res = await get<BattleEnvelope | { active: false }>(`/api/combat/active/${enc(characterId)}?probe=1`);
    return 'active' in res && res.active === false ? null : (res as BattleEnvelope);
  },
  /** el servidor elige el adversario según el lugar y la secuencia; el cliente sólo pide entrar */
  startBattle: (characterId: string, site = 'CHERWOOD_ALLEY') =>
    command<BattleEnvelope>('/api/combat/start', 'battle', { characterId, site }),
  combatAction: (characterId: string, actionType: 'SKILL' | 'MOVE' | 'SCRUTINIZE' | 'NEGOTIATE' | 'FLEE' | 'END_TURN', extra: { skillId?: string; targetPosition?: { x: number; y: number } } = {}) =>
    command<CombatActionResult>('/api/combat/action', 'act', { characterId, actionType, ...extra }),

  // ── actuación e identidad
  actingDilemma: (characterId: string) =>
    // public=1: las opciones llegan sin su alineación ni sus efectos (se conocen al elegir)
    get<{ dilemma: ActingDilemma; currentDigestion: number; isFullyDigested: boolean }>(`/api/acting/dilemma/${enc(characterId)}?public=1`),
  resolveActing: (characterId: string, dilemmaId: string, choiceId: string) =>
    post<ActingResolution>('/api/acting/resolve', { characterId, dilemmaId, choiceId }),
  identityEvent: (characterId: string) => get<{ event: IdentityEvent | null; message?: string }>(`/api/identity/roll/${enc(characterId)}`),
  resolveIdentity: (characterId: string, eventId: string, optionIndex: number) =>
    post<{ chosenOption?: { narrativeOutcome?: string; text?: string } }>('/api/identity/resolve', { characterId, eventId, optionIndex }),
  identityHistory: (characterId: string) => get<{ history: Array<Record<string, unknown>> }>(`/api/identity/history/${enc(characterId)}`),

  // ── ascensión
  ascensionStatus: (characterId: string) => get<{ status: AscensionStatus }>(`/api/ascension/status/${enc(characterId)}`),
  prepareAscension: (characterId: string, checklist: Partial<AscensionStatus['door4_preparation']['checklist']>, markPresented = false) =>
    post<{ status: AscensionStatus }>('/api/ascension/prepare', { characterId, checklist, markPresented }),
  drinkAscension: (characterId: string) =>
    command<AscensionResult>('/api/ascension/drink', 'ascend', { characterId, confirmedAt: Date.now() })
};
