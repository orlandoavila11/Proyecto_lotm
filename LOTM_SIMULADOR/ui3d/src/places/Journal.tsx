import { HotspotKeys } from '../hud/kit/HotspotKeys';
import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client';
import type { ActingDilemma, IdentityEvent } from '../api/types';
import { usePlace, useStageEvents } from '../engine/react';
import { Divider } from '../hud/kit/Gilt';
import { GoldButton } from '../hud/kit/components';
import { IconCalendar, IconDocument, IconMask, IconScroll } from '../hud/kit/icons';
import { StackedSheet } from '../hud/kit/StackedSheet';
import { SLOT_LABEL, useSession } from '../session/store';
import { JOURNAL_MIRROR, journalSpec } from './specs/interiors';
import { useMirrorPortrait } from './useMirrorPortrait';
import { useSomaticScene } from './somatics';

type View = 'overview' | 'dilemma' | 'commitment';

/** V07 · Regreso — identidad y actuación. Diario y compromisos proceden de eventos reales. */
export function Journal() {
  const { snapshot, characterId, go, refresh, saved, fail } = useSession();
  const { stage, ready } = usePlace(journalSpec);
  const [view, setView] = useState<View>('overview');
  const [dilemma, setDilemma] = useState<ActingDilemma | null>(null);
  const [event, setEvent] = useState<IdentityEvent | null | undefined>(undefined);
  const [outcome, setOutcome] = useState<{ title: string; text: string } | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  useMirrorPortrait(ready, JOURNAL_MIRROR);
  useSomaticScene(ready);

  const day = snapshot?.character.current_day ?? 1;
  const slot = snapshot?.character.current_slot ?? 0;

  const loadCommitment = useCallback(async () => {
    if (!characterId) return;
    try {
      const [ev, hist] = await Promise.all([api.identityEvent(characterId), api.identityHistory(characterId)]);
      const done = hist.history.some((h) => h.event_id === ev.event?.id && h.day === day && h.slot === slot);
      setEvent(done ? null : ev.event);
    } catch (err) {
      fail(err);
      setEvent(null);
    }
  }, [characterId, day, slot, fail]);

  useEffect(() => {
    if (!characterId) return;
    api.actingDilemma(characterId).then((r) => setDilemma(r.dilemma)).catch(fail);
    loadCommitment();
  }, [characterId, loadCommitment, fail]);

  useEffect(() => {
    if (!stage || !ready) return;
    stage.select(view === 'dilemma' ? 'mirror' : view === 'commitment' ? 'letters' : null);
  }, [stage, ready, view]);

  useStageEvents((e) => {
    if (e.type !== 'select') return;
    if (e.id === 'mirror') setView('dilemma');
    if (e.id === 'letters') setView('commitment');
    if (e.id === 'diary') setView('overview');
  });

  const choose = async (choiceId: string) => {
    if (!characterId || !dilemma) return;
    setBusy(choiceId);
    try {
      const res = await api.resolveActing(characterId, dilemma.id, choiceId);
      setOutcome({ title: res.isAligned === false ? 'La máscara se resiente' : 'El papel encaja', text: res.message });
      saved();
      await refresh();
      const next = await api.actingDilemma(characterId);
      setDilemma(next.dilemma);
      setView('overview');
    } catch (err) {
      fail(err);
    } finally {
      setBusy(null);
    }
  };

  const resolveCommitment = async (i: number) => {
    if (!characterId || !event) return;
    setBusy(`c${i}`);
    try {
      const res = await api.resolveIdentity(characterId, event.id, i);
      setOutcome({ title: event.title, text: res.chosenOption?.narrativeOutcome ?? res.chosenOption?.text ?? 'Has atendido el asunto.' });
      saved();
      await refresh();
      setEvent(null);
      setView('overview');
    } catch (err) {
      fail(err);
    } finally {
      setBusy(null);
    }
  };

  const digestion = Math.round(snapshot?.character.digestion_progress ?? 0);
  const tag = <><IconCalendar size={26} /> Día {day} · {SLOT_LABEL[slot]}</>;

  let body: React.ReactNode;
  let footer: React.ReactNode;

  if (view === 'dilemma' && dilemma) {
    body = (
      <div className="fade-in">
        <h3 className="sheet-heading" style={headingSize(dilemma.corePrinciple)}>{dilemma.corePrinciple || dilemma.title}</h3>
        <p className="sheet-prose sheet-prose--small">{dilemma.description}</p>
        <div style={{ display: 'grid', gap: 12, marginTop: 10 }}>
          {dilemma.choices.map((c) => (
            <GoldButton key={c.id} align="start" busy={busy === c.id} disabled={!!busy} onClick={() => choose(c.id)} style={{ minHeight: 64, fontSize: 20, padding: '8px 18px', textAlign: 'left' }}>
              <span style={{ display: 'block' }}>{c.label}{c.description && <span style={{ display: 'block', fontSize: 16, fontStyle: 'italic', color: 'var(--ivory-dim)' }}>{c.description}</span>}</span>
            </GoldButton>
          ))}
        </div>
      </div>
    );
    footer = <GoldButton onClick={() => setView('overview')}>Cerrar el ensayo</GoldButton>;
  } else if (view === 'commitment' && event) {
    body = (
      <div className="fade-in">
        <h3 className="sheet-heading">{event.title}</h3>
        <p className="sheet-prose sheet-prose--small">{event.situation ?? event.description}</p>
        <div style={{ display: 'grid', gap: 12, marginTop: 10 }}>
          {event.options.map((o, i) => (
            <GoldButton key={i} align="start" icon={<IconScroll />} busy={busy === `c${i}`} disabled={!!busy} onClick={() => resolveCommitment(i)} style={{ minHeight: 62, fontSize: 19, padding: '8px 16px', textAlign: 'left' }}>
              {o.text ?? o.label}
            </GoldButton>
          ))}
        </div>
      </div>
    );
    footer = <GoldButton onClick={() => setView('overview')}>Dejarlo para luego</GoldButton>;
  } else {
    body = (
      <div className="fade-in">
        <h3 className="sheet-heading" style={headingSize(outcome?.title ?? dilemma?.corePrinciple)}>{outcome?.title ?? dilemma?.corePrinciple ?? 'El papel te espera'}</h3>
        <p className="sheet-prose">{outcome?.text ?? dilemma?.title ?? '…'}</p>
        <div className="ink-meter" aria-label={`Digestión ${digestion} por ciento`}>
          <span>Digestión de la poción</span>
          <span className="ink-meter__line"><span style={{ width: `${Math.min(100, digestion)}%` }} /></span>
          <span className="ink-meter__num">{digestion}%</span>
        </div>
        <Divider tone="bronze" width="100%" style={{ margin: '22px 0' }} />
        <p className="sheet-note">
          <IconScroll size={34} />
          {event === undefined ? 'Revisando la correspondencia…' : event ? 'Un compromiso civil sigue pendiente.' : 'Ningún compromiso civil pendiente.'}
        </p>
      </div>
    );
    footer = (
      <>
        {/* el compromiso civil tiene prioridad visual, pero el ensayo nunca queda escondido tras el espejo */}
        {event && <GoldButton primary icon={<IconDocument />} onClick={() => setView('commitment')}>Revisar compromiso</GoldButton>}
        <GoldButton primary={!event} icon={<IconMask />} disabled={!dilemma} onClick={() => setView('dilemma')}>Ensayar el papel</GoldButton>
        <GoldButton onClick={() => go('desvan')}>Cerrar</GoldButton>
      </>
    );
  }

  const openSpot = (id: string) => setView(id === 'mirror' ? 'dilemma' : id === 'letters' ? 'commitment' : 'overview');
  return (
    <>
      <HotspotKeys spots={journalSpec.hotspots} onOpen={openSpot} />
      <StackedSheet title="DIARIO DE ACTUACIÓN" tag={tag} footer={footer}>
        {body}
      </StackedSheet>
    </>
  );
}

/** los principios del motor pueden ser largos: el titular se ajusta para no desbordar el pliego */
function headingSize(text: string | undefined): React.CSSProperties {
  const n = text?.length ?? 0;
  return { fontSize: n > 110 ? 26 : n > 70 ? 31 : 40 };
}
