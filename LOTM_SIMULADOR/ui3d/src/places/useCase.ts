import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client';
import type { CaseEnvelope, CaseState, DiscoveredClue, Hypothesis } from '../api/types';
import { useSession } from '../session/store';
import { timeOfDay, type ClueSource } from './caseMap';

export interface VisitOutcome {
  source: ClueSource;
  ok: boolean;
  clue?: DiscoveredClue;
  message: string;
}

/**
 * Caso activo del personaje (SQLite). Cada visita se confirma en el servidor; la vista sólo refleja
 * la proyección devuelta, incluidas las negativas (vía equivocada, horario, cerrojo aún oculto).
 */
export function useCase() {
  const { characterId, snapshot, saved, fail } = useSession();
  const [envelope, setEnvelope] = useState<CaseEnvelope | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!characterId) return null;
    try {
      const env = await api.activeCase(characterId);
      setEnvelope(env);
      return env;
    } catch (err) {
      fail(err);
      return null;
    }
  }, [characterId, fail]);

  useEffect(() => {
    reload();
  }, [reload]);

  /** aplica una respuesta de caso: estado proyectado y, si viene, el catálogo de hipótesis sostenidas */
  const apply = (res: { state: CaseState; availableHypotheses?: Hypothesis[] }) =>
    setEnvelope((e) => (e ? { ...e, caseState: res.state, availableHypotheses: res.availableHypotheses ?? e.availableHypotheses } : e));

  const visit = async (source: ClueSource): Promise<VisitOutcome | null> => {
    if (!envelope) return null;
    const key = `${source.clueId}:${source.sourceIndex}`;
    setBusy(key);
    try {
      const res = await api.visitSource(envelope.caseState.id, source.clueId, source.sourceIndex, timeOfDay(snapshot?.character.current_slot));
      apply(res);
      if (res.success) saved();
      return { source, ok: res.success, clue: res.clue, message: res.reason ?? res.message };
    } catch (err) {
      fail(err);
      return null;
    } finally {
      setBusy(null);
    }
  };

  const discovered = (clueId: string) => envelope?.caseState.discoveredClues.find((c) => c.id === clueId) ?? null;

  return { envelope, caseState: envelope?.caseState ?? null, reload, visit, busy, discovered, apply };
}
