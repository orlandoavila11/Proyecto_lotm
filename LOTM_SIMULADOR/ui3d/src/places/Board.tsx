import { useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';
import type { ClueRelation, Hypothesis, Resolution } from '../api/types';
import { assetUrl } from '../assets';
import { CorkBoard, EDGE_COLORS, type BoardCard } from '../engine/board';
import { useAttached, usePlace, useStage, useStageEvents } from '../engine/react';
import { Divider } from '../hud/kit/Gilt';
import { Cartouche, GoldButton, Panel } from '../hud/kit/components';
import { Prose } from '../hud/kit/cards';
import { IconChevronLeft, IconChevronRight, IconMagnifier } from '../hud/kit/icons';
import { FramedImage } from '../hud/kit/InspectionPanel';
import { ChoiceRow } from '../hud/kit/ChoiceRow';
import { StackedSheet } from '../hud/kit/StackedSheet';
import { useSession } from '../session/store';
import { clueArt } from './caseMap';
import { BOARD_CORNERS, boardSpec } from './specs/interiors';
import { useCase } from './useCase';
import { useSomaticScene } from './somatics';

const RELATIONS: { id: ClueRelation; label: string; stroke: string }[] = [
  { id: 'explica', label: 'Explica', stroke: 'solid' },
  { id: 'contradice', label: 'Contradice', stroke: 'dashed' },
  { id: 'localiza', label: 'Relaciona', stroke: 'dotted' },
  { id: 'acusa', label: 'Acusa', stroke: 'solid' }
];

const rgb = ([r, g, b]: [number, number, number]) => `rgb(${r * 255}, ${g * 255}, ${b * 255})`;

export function Board() {
  const { go, saved, fail } = useSession();
  const { ready } = usePlace(boardSpec);
  const stage = useStage();
  const kase = useCase();
  useSomaticScene(ready);
  const [picked, setPicked] = useState<string[]>([]);
  const [hovered, setHovered] = useState<string | null>(null);
  // null = sin elección del jugador: se abre en la hipótesis confirmada, si la hay
  const [hIndex, setHIndex] = useState<number | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [deciding, setDeciding] = useState(false);
  const [closing, setClosing] = useState(false);
  const [chosen, setChosen] = useState<Resolution['id'] | null>(null);

  const board = useAttached(() => (ready ? new CorkBoard(BOARD_CORNERS) : null), [ready]);
  const state = kase.caseState;

  // pistas descubiertas, pistas falsas sembradas y notas libres → tarjetas del corcho
  const cards = useMemo<BoardCard[]>(() => {
    if (!state) return [];
    return [
      ...state.discoveredClues.map((c) => ({ id: c.id, title: c.nombre, image: assetUrl(clueArt(c.id)), kind: 'clue' as const })),
      ...state.falseClues.map((c) => ({ id: c.id, title: c.nombre, image: null, kind: 'false' as const })),
      ...(state.notes ?? []).map((n) => ({ id: n.id, title: n.text, image: null, kind: 'note' as const }))
    ];
  }, [state]);

  useEffect(() => {
    board?.setCards(cards);
  }, [board, cards]);

  useEffect(() => {
    board?.setEdges((state?.connectedEdges ?? []).map((e) => ({ a: e.clueA, b: e.clueB, kind: e.relation, faint: !e.isCorrect })));
  }, [board, state]);

  useEffect(() => {
    board?.setSelected(picked);
  }, [board, picked]);

  useEffect(() => {
    board?.setHovered(hovered);
    stage?.setCursor(!!hovered);
  }, [board, hovered, stage]);

  // elegir tarjeta: mismo camino para el puntero sobre el corcho y para el teclado (CardKeys)
  const canPick = state?.status === 'ACTIVE';
  const togglePick = (id: string) => {
    // caso cerrado: el corcho queda como recuerdo, ya no se tienden hilos
    if (!canPick || cards.find((c) => c.id === id)?.kind === 'note') return;
    setMessage(null);
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : p.length >= 2 ? [id] : [...p, id]));
  };

  useStageEvents((e) => {
    if (!board) return;
    if (e.type === 'move') setHovered(board.hit([e.x, e.y]));
    if (e.type === 'plate') {
      const id = board.hit([e.x, e.y]);
      if (id) togglePick(id);
    }
  });

  // el motor sólo proyecta hipótesis que las pistas descubiertas sostienen, bajo alias opacos
  const discoveredIds = new Set(state?.discoveredClues.map((c) => c.id) ?? []);
  const hypotheses: Hypothesis[] = kase.envelope?.availableHypotheses ?? [];
  const confirmed = hypotheses.findIndex((h) => h.tested && h.isCorrect);
  const hCur = (hIndex ?? Math.max(0, confirmed)) % Math.max(1, hypotheses.length);
  const hyp = hypotheses[hCur] ?? null;
  const tested = hyp?.tested ?? false;
  const focusClue = picked[picked.length - 1] ?? hyp?.pistasSoporte.find((id) => discoveredIds.has(id)) ?? state?.discoveredClues[0]?.id ?? null;
  const focusArt = focusClue ? assetUrl(clueArt(focusClue)) : null;
  const resolutions: Resolution[] = kase.envelope?.availableResolutions ?? [];

  const connect = async (relation: ClueRelation) => {
    if (!state || picked.length !== 2) return;
    setBusy(relation);
    try {
      const res = await api.connectClues(state.id, picked[0], picked[1], relation);
      kase.apply(res);
      setMessage(res.insight ?? res.message);
      setPicked([]);
      saved();
    } catch (err) {
      fail(err);
    } finally {
      setBusy(null);
    }
  };

  const contrast = async () => {
    if (!state || !hyp) return;
    setBusy('hyp');
    try {
      const res = await api.submitHypothesis(state.id, hyp.id);
      kase.apply(res);
      setMessage(res.message);
      saved();
      if (res.resolutionUnlocked) await kase.reload();
    } catch (err) {
      fail(err);
    } finally {
      setBusy(null);
    }
  };

  const resolve = async (r: Resolution) => {
    if (!state) return;
    setBusy(r.id);
    try {
      const res = await api.resolveCase(state.id, r.id);
      kase.apply(res);
      setMessage(res.message ?? null);
      setDeciding(false);
      setClosing(true);
      saved();
    } catch (err) {
      fail(err);
    } finally {
      setBusy(null);
    }
  };

  const title = state?.title ?? 'El expediente';
  const canResolve = resolutions.length > 0 && state?.status === 'ACTIVE';
  const chosenRes = resolutions.find((r) => r.id === chosen) ?? null;
  const pairMode = picked.length === 2;
  const resolved = state?.status === 'RESOLVED' ? state.resolvedState ?? null : null;

  return (
    <>
      <Cartouche title={title.toUpperCase()} width={490} />

      {/* las tarjetas del corcho también para teclado y lector: al enfocarlas se iluminan como con el puntero */}
      {canPick && (
        <nav className="hotspot-keys" aria-label="Tarjetas del tablero">
          {cards.filter((c) => c.kind !== 'note').map((c) => (
            <button
              key={c.id}
              type="button"
              aria-pressed={picked.includes(c.id)}
              onFocus={() => setHovered(c.id)}
              onBlur={() => setHovered(null)}
              onClick={() => togglePick(c.id)}
            >
              {c.kind === 'false' ? `${c.title} (pista dudosa)` : c.title}
            </button>
          ))}
        </nav>
      )}

      <Panel className="slide-in-right" style={{ right: 27, top: 115, width: 495, bottom: 210, padding: '40px 40px 36px', display: 'flex', flexDirection: 'column' }} label="Hipótesis">
        <h2 className="t-display" style={{ margin: 0, fontSize: 40, textAlign: 'center' }}>{resolved ? 'Caso cerrado' : 'Hipótesis'}</h2>
        <Divider width="86%" style={{ margin: hypotheses.length > 1 && !resolved ? '12px auto 10px' : '12px auto 24px' }} />
        {hypotheses.length > 1 && !resolved && (
          // fuera del scroll: pasar de una hipótesis a otra nunca queda bajo el pliegue
          <div className="pips" role="group" aria-label="Hipótesis sostenidas">
            <button type="button" className="pips__arrow" onClick={() => setHIndex((hCur + hypotheses.length - 1) % hypotheses.length)} aria-label="Hipótesis anterior"><IconChevronLeft size={24} /></button>
            {hypotheses.map((h, i) => (
              <button key={h.id} type="button" className="pips__pip" aria-pressed={i === hCur} data-verdict={h.tested ? (h.isCorrect ? 'true' : 'false') : undefined} aria-label={h.name} onClick={() => setHIndex(i)} />
            ))}
            <button type="button" className="pips__arrow" onClick={() => setHIndex((hCur + 1) % hypotheses.length)} aria-label="Hipótesis siguiente"><IconChevronRight size={24} /></button>
          </div>
        )}
        <div className="scroll" style={{ flex: 1, minHeight: 0 }}>
          <FramedImage src={focusArt} alt="Pista en foco" aspect={408 / 214} fallback={{ background: 'radial-gradient(circle at 50% 40%, #2a221a, #0d0b09)' }} />
          {resolved ? (
            <>
              <p className="t-body" style={{ fontSize: 28, lineHeight: 1.2, margin: '0 0 12px' }}>{resolved.nombre}</p>
              <Prose size={20} dim>{resolved.localEffects}</Prose>
            </>
          ) : hyp ? (
            <>
              <p className="t-body" style={{ fontSize: 30, lineHeight: 1.2, margin: '0 0 12px' }}>¿{hyp.name}?</p>
              {hyp.teoria && <Prose size={19} dim>{hyp.teoria}</Prose>}
            </>
          ) : (
            <Prose size={22} dim>{state ? 'Aún no hay pistas suficientes para sostener una teoría.' : 'Abriendo el expediente…'}</Prose>
          )}
        </div>
        <Divider width="100%" style={{ margin: '18px 0 22px' }} />
        <div style={{ display: 'grid', gap: 22 }}>
          {canResolve ? (
            <GoldButton primary onClick={() => { setChosen(null); setDeciding(true); }}>Decidir el desenlace</GoldButton>
          ) : resolved ? null : (
            <GoldButton icon={<IconMagnifier />} busy={busy === 'hyp'} disabled={!hyp || tested || state?.status !== 'ACTIVE'} onClick={contrast}>Contrastar</GoldButton>
          )}
          <GoldButton icon={<IconChevronLeft />} onClick={() => go('desvan')}>Volver al Desván</GoldButton>
        </div>
      </Panel>

      {/* el desenlace: momento propio, irreversible, en dos pasos (elegir y sellar) */}
      {deciding && canResolve && (
        <StackedSheet
          title="El desenlace"
          headerSize={34}
          style={{ left: 300, right: 'auto', top: 78, bottom: 112, width: 780 }}
          footer={
            <>
              <GoldButton primary busy={!!chosen && busy === chosen} disabled={!chosenRes || !!busy} onClick={() => chosenRes && resolve(chosenRes)}>Sellar el desenlace</GoldButton>
              <GoldButton disabled={!!busy} onClick={() => setDeciding(false)}>Aún no</GoldButton>
            </>
          }
        >
          <p className="sheet-prose sheet-prose--small" style={{ fontStyle: 'italic' }}>El expediente está completo. Lo que decidas ahora no admite vuelta atrás.</p>
          <div role="radiogroup" aria-label="Desenlaces" style={{ display: 'grid', gap: 14 }}>
            {resolutions.map((r, i) => (
              <ChoiceRow
                key={r.id}
                compact
                thumb={<span className="choice-row__letter">{/Resolución\s+([A-Z])/.exec(r.nombre)?.[1] ?? String.fromCharCode(65 + i)}</span>}
                label={r.nombre.replace(/^Resolución\s+[A-Z]\s*·\s*/, '')}
                detail={r.accion}
                selected={chosen === r.id}
                done={chosen === r.id}
                onClick={() => setChosen(r.id)}
              />
            ))}
          </div>
        </StackedSheet>
      )}

      {/* cierre del caso: el desenlace sellado y lo que deja en Cherwood */}
      {closing && resolved && (
        <StackedSheet
          title="Caso cerrado"
          headerSize={34}
          style={{ left: 300, right: 'auto', top: 190, bottom: 210, width: 780 }}
          footer={
            <>
              <GoldButton primary onClick={() => go('desvan')}>Volver al Desván</GoldButton>
              <GoldButton onClick={() => setClosing(false)}>Quedarse ante el tablero</GoldButton>
            </>
          }
        >
          <h3 className="sheet-heading">{resolved.nombre.replace(/^Resolución\s+[A-Z]\s*·\s*/, '')}</h3>
          <Divider tone="bronze" width="100%" style={{ margin: '0 0 22px' }} />
          <p className="sheet-prose">{resolved.localEffects}</p>
        </StackedSheet>
      )}

      {/* respuesta del motor a la última conexión o contraste: sobre la leyenda, siempre a la vista */}
      {message && (
        <div className="narration narration--low fade-in" key={message} role="status">
          <p>{message}</p>
        </div>
      )}

      {/* leyenda de hilos: en modo par, cada hilo es un botón que une las dos tarjetas elegidas */}
      <div className={`legend fade-in ${pairMode ? 'legend--active' : ''}`} role={pairMode ? 'group' : undefined} aria-label="Relaciones">
        <svg className="gilt" width="1084" height="68" viewBox="0 0 1084 68" aria-hidden="true">
          <path d="M14 1 H1070 L1083 14 V54 L1070 67 H14 L1 54 V14 Z" fill="rgba(14,11,9,0.88)" stroke="var(--gold)" strokeWidth="1.2" />
        </svg>
        {pairMode && <span className="legend__prompt">¿Qué une estas pistas?</span>}
        {RELATIONS.map((r) => (
          <button key={r.id} type="button" className="legend__item" disabled={!pairMode || !!busy} onClick={() => connect(r.id)}>
            <svg width="150" height="12" viewBox="0 0 150 12" aria-hidden="true">
              <line x1="8" y1="6" x2="142" y2="6" stroke={rgb(EDGE_COLORS[r.id])} strokeWidth={r.id === 'acusa' ? 3.4 : 2.6}
                strokeDasharray={r.stroke === 'dashed' ? '10 7' : r.stroke === 'dotted' ? '2 7' : undefined} strokeLinecap="round" />
              <circle cx="7" cy="6" r="5" fill={rgb(EDGE_COLORS[r.id])} />
              <circle cx="143" cy="6" r="5" fill={rgb(EDGE_COLORS[r.id])} />
            </svg>
            <span>{r.label}</span>
          </button>
        ))}
      </div>
    </>
  );
}
