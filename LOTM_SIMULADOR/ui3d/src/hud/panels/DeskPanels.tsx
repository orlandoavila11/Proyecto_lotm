import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import type { CalendarAction, CharacterSnapshot, IdentityEvent } from '../../api/types';
import { SLOT_LABEL, districtLabel, formatMoney, useSession } from '../../session/store';
import { GoldButton } from '../kit/components';
import { Prose, SidePanel } from '../kit/cards';
import { IconBook, IconBottles, IconCoins, IconDocument, IconMask, IconPin, IconPouch, IconScroll } from '../kit/icons';

interface PanelBase {
  snapshot: CharacterSnapshot;
  onClose: () => void;
}

/* ───────────────────────────────────────────── vela: la cordura se mira, no se lee */

export function CandlePanel({ snapshot, onClose }: PanelBase) {
  return (
    <SidePanel title="La vela de sebo" onClose={onClose}>
      <Prose>{snapshot.somatics.sanityDescription}</Prose>
      {snapshot.somatics.blockers.length > 0 && <Prose dim>{snapshot.somatics.blockers[0]}</Prose>}
    </SidePanel>
  );
}

/* ───────────────────────────────────────────── espejo: la corrupción y el papel */

export function MirrorPanel({ snapshot, onClose, onJournal }: PanelBase & { onJournal: () => void }) {
  return (
    <SidePanel
      title="El espejo de azogue"
      onClose={onClose}
      footer={<GoldButton icon={<IconMask />} onClick={onJournal}>Ensayar el papel</GoldButton>}
    >
      <Prose>{snapshot.somatics.corruptionDescription}</Prose>
      <Prose dim>
        {snapshot.sequenceName ? `El reflejo ya no es sólo tuyo: es también el de ${snapshot.sequenceName}.` : 'El reflejo te devuelve la mirada.'}
      </Prose>
    </SidePanel>
  );
}

/* ───────────────────────────────────────────── reloj: las cuatro franjas del día */

const CALENDAR_ACTIONS: { id: CalendarAction; label: string; hint: string }[] = [
  { id: 'WORK', label: 'Cumplir con el empleo', hint: 'Sostiene la coartada y el salario.' },
  { id: 'INVESTIGATE', label: 'Seguir una pista', hint: 'Archivos, informantes, callejones.' },
  { id: 'SOCIALIZE', label: 'Visitar a los tuyos', hint: 'Refuerza lo que te ata a este mundo.' },
  { id: 'OPERATE', label: 'Trabajar en lo oculto', hint: 'Reactivos, ritos y principios.' }
];

export function CalendarPanel({ snapshot, onClose }: PanelBase) {
  const { characterId, refresh, saved, fail } = useSession();
  const [busy, setBusy] = useState<CalendarAction | null>(null);
  const [outcome, setOutcome] = useState<string | null>(null);
  const [event, setEvent] = useState<{ title: string; description: string } | null>(null);
  const day = snapshot.character.current_day;
  const slot = snapshot.character.current_slot ?? 0;

  const act = async (a: CalendarAction) => {
    if (!characterId) return;
    setBusy(a);
    try {
      const res = await api.calendarAction(characterId, a);
      setOutcome(res.narrative);
      setEvent(res.datedEventTriggered ? { title: res.datedEventTriggered.title, description: res.datedEventTriggered.description } : null);
      saved();
      await refresh();
    } catch (err) {
      fail(err);
    } finally {
      setBusy(null);
    }
  };

  return (
    <SidePanel title="El reloj de latón" onClose={onClose} width={450}>
      <Prose>
        Día {day} · {SLOT_LABEL[slot] ?? 'Noche'}. Cada franja que empeñes avanza las manecillas.
      </Prose>
      {outcome && (
        <div className="fade-in" style={{ margin: '4px 0 16px', paddingLeft: 16, borderLeft: '1px solid var(--gold-line)' }}>
          <Prose size={20}>{outcome}</Prose>
          {event && (
            <Prose size={19} dim>
              <strong style={{ color: 'var(--gold-hi)', fontWeight: 500 }}>{event.title}.</strong> {event.description}
            </Prose>
          )}
        </div>
      )}
      <div style={{ display: 'grid', gap: 12 }}>
        {CALENDAR_ACTIONS.map((a) => (
          <GoldButton key={a.id} align="start" onClick={() => act(a.id)} busy={busy === a.id} disabled={!!busy && busy !== a.id} style={{ minHeight: 64, fontSize: 21, padding: '8px 22px' }}>
            <span style={{ display: 'block', textAlign: 'left' }}>
              {a.label}
              <span style={{ display: 'block', fontSize: 16, color: 'var(--ivory-dim)', fontStyle: 'italic' }}>{a.hint}</span>
            </span>
          </GoldButton>
        ))}
      </div>
    </SidePanel>
  );
}

/* ───────────────────────────────────────────── pliegos: la doble vida */

export function IdentityPanel({ snapshot, onClose }: PanelBase) {
  const p = snapshot.activePersona;
  const suspicion = (v: number | undefined, low: string, mid: string, high: string) =>
    v === undefined ? low : v > 50 ? high : v > 20 ? mid : low;
  const anchors = snapshot.anchors.filter((a) => !a.is_destroyed);
  return (
    <SidePanel title="Pliegos de identidad" onClose={onClose} width={470}>
      <div className="stat-row"><span className="stat-row__icon"><IconDocument size={28} /></span><span>{p?.legal_name ?? snapshot.character.name}</span><span /></div>
      <div className="stat-row"><span className="stat-row__icon"><IconBook size={28} /></span><span>{p?.profession ?? 'Sin empleo declarado'}</span><span /></div>
      <div className="stat-row"><span className="stat-row__icon"><IconPin size={28} /></span><span>{districtLabel(snapshot.character.current_location)}</span><span /></div>
      <Prose size={19} dim>
        {suspicion(p?.police_suspicion, 'Ningún agente ha anotado tu nombre.', 'Un agente de uniforme se demora en tu esquina.', 'Hay vigilancia permanente frente a tu portal.')}{' '}
        {suspicion(p?.church_suspicion, 'Los clérigos no te conocen.', 'Un diácono ha preguntado por ti.', 'Los Halcones Nocturnos siguen tu rastro.')}
      </Prose>
      {anchors.length > 0 && (
        <>
          <h3 className="t-display" style={{ fontSize: 18, margin: '18px 0 8px', color: 'var(--gold)' }}>Lo que te sostiene</h3>
          {anchors.map((a) => (
            <div key={a.id} style={{ padding: '8px 0', borderTop: '1px solid rgba(201,164,92,0.14)' }}>
              <div style={{ fontSize: 20 }}>{a.name ?? a.title}</div>
              {a.description && <div style={{ fontSize: 17, color: 'var(--ivory-dim)', fontStyle: 'italic' }}>{a.description}</div>}
              <AnchorThread strength={a.strength} />
            </div>
          ))}
        </>
      )}
      {snapshot.character.rent_debt_active ? <Prose size={19}>{snapshot.character.rent_debt_note ?? 'La casera espera el alquiler atrasado.'}</Prose> : null}
    </SidePanel>
  );
}

/** Hilo del ancla: grosor y tensión según su fuerza (objeto, no cifra). */
function AnchorThread({ strength }: { strength: number }) {
  const s = Math.max(0, Math.min(1, strength / 40));
  return (
    <svg width="100%" height="10" viewBox="0 0 300 10" preserveAspectRatio="none" aria-label={s > 0.6 ? 'Hilo firme' : s > 0.25 ? 'Hilo tenue' : 'Hilo quebradizo'}>
      <path d={`M0 5 Q 75 ${5 + (1 - s) * 4} 150 5 T 300 5`} stroke="var(--crimson-hi)" strokeWidth={0.6 + s * 2.4} fill="none" strokeDasharray={s < 0.25 ? '6 5' : undefined} opacity={0.5 + s * 0.5} />
    </svg>
  );
}

/* ───────────────────────────────────────────── bolsa: cartera e inventario */

export function WalletPanel({ snapshot, onClose }: PanelBase) {
  const pence = snapshot.character.raw_pence;
  const items = snapshot.inventory.filter((i) => i.quantity > 0);
  return (
    <SidePanel title="La bolsa de cuero" onClose={onClose}>
      <div className="stat-row"><span className="stat-row__icon"><IconCoins size={28} /></span><span>Saldo</span><span className="stat-row__value">{formatMoney(pence)}</span></div>
      {snapshot.character.salary_pence ? (
        <div className="stat-row"><span className="stat-row__icon"><IconPouch size={28} /></span><span>Salario semanal</span><span className="stat-row__value">{formatMoney(snapshot.character.salary_pence)}</span></div>
      ) : null}
      {items.length === 0 ? (
        <Prose dim>Nada más que polvo de tabaco y un botón suelto.</Prose>
      ) : (
        items.map((i) => (
          <div key={i.id} className="stat-row">
            <span className="stat-row__icon"><IconBottles size={26} /></span>
            <span style={{ fontSize: 19 }}>{i.name}</span>
            <span className="stat-row__value">× {i.quantity}</span>
          </div>
        ))
      )}
    </SidePanel>
  );
}

/* ───────────────────────────────────────────── correspondencia: compromisos civiles */

export function CorrespondencePanel({ snapshot, onClose }: PanelBase) {
  const { characterId, refresh, saved, fail } = useSession();
  const [event, setEvent] = useState<IdentityEvent | null | undefined>(undefined);
  const [resolved, setResolved] = useState<string | null>(null);
  const [busy, setBusy] = useState<number | null>(null);
  const day = snapshot.character.current_day;
  const slot = snapshot.character.current_slot ?? 0;

  useEffect(() => {
    if (!characterId) return;
    let alive = true;
    Promise.all([api.identityEvent(characterId), api.identityHistory(characterId)])
      .then(([ev, hist]) => {
        if (!alive) return;
        const already = hist.history.some((h) => h.event_id === ev.event?.id && h.day === day && h.slot === slot);
        setEvent(already ? null : ev.event);
      })
      .catch((err) => {
        fail(err);
        setEvent(null);
      });
    return () => {
      alive = false;
    };
  }, [characterId, day, slot, fail]);

  const choose = async (i: number) => {
    if (!characterId || !event) return;
    setBusy(i);
    try {
      const res = await api.resolveIdentity(characterId, event.id, i);
      setResolved(res.chosenOption?.narrativeOutcome ?? res.chosenOption?.text ?? 'Has atendido el asunto.');
      saved();
      await refresh();
    } catch (err) {
      fail(err);
    } finally {
      setBusy(null);
    }
  };

  return (
    <SidePanel title="Correspondencia" onClose={onClose} width={480}>
      {event === undefined && <Prose dim>Rompes el lacre…</Prose>}
      {event === null && !resolved && <Prose dim>Ninguna carta nueva sobre la mesa. La vida civil te concede una tregua.</Prose>}
      {event && !resolved && (
        <>
          <h3 className="t-body" style={{ fontSize: 24, margin: '0 0 8px', fontWeight: 500 }}>{event.title}</h3>
          <Prose size={20}>{event.situation ?? event.description}</Prose>
          <div style={{ display: 'grid', gap: 12, marginTop: 8 }}>
            {event.options.map((o, i) => (
              <GoldButton key={i} align="start" icon={<IconScroll />} busy={busy === i} disabled={busy !== null && busy !== i} onClick={() => choose(i)} style={{ minHeight: 62, fontSize: 19, padding: '8px 18px', textAlign: 'left' }}>
                {o.text ?? o.label}
              </GoldButton>
            ))}
          </div>
        </>
      )}
      {resolved && <Prose>{resolved}</Prose>}
    </SidePanel>
  );
}
