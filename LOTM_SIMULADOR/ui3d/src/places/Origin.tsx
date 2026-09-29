import { useEffect, useState } from 'react';
import { api } from '../api/client';
import type { OriginDef } from '../api/types';
import { assetUrl } from '../assets';
import { MirrorPortrait } from '../engine/props';
import { usePlace, useStage } from '../engine/react';
import { Divider } from '../hud/kit/Gilt';
import { CornerBack, GoldButton } from '../hud/kit/components';
import { IconChevronLeft, IconChevronRight, IconDocument } from '../hud/kit/icons';
import { StackedSheet } from '../hud/kit/StackedSheet';
import { formatMoney, useSession } from '../session/store';
import { rememberLetter } from './prologueMemory';
import { JOURNAL_MIRROR, journalSpec } from './specs/interiors';

/**
 * Elección de la máscara civil (BRIEF-09): seis orígenes canónicos servidos por /api/prologue/origins.
 * El espejo devuelve el rostro de cada vida posible.
 */
export function Origin() {
  const { go, adopt, refresh, saved, fail } = useSession();
  const { stage, ready } = usePlace(journalSpec);
  const liveStage = useStage();
  const [origins, setOrigins] = useState<OriginDef[] | null>(null);
  const [index, setIndex] = useState(0);
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [portrait, setPortrait] = useState<MirrorPortrait | null>(null);

  useEffect(() => {
    api.origins().then((r) => setOrigins(r.origins)).catch(fail);
  }, [fail]);

  useEffect(() => {
    stage?.setInteractive(false);
    return () => stage?.setInteractive(true);
  }, [stage]);

  const origin = origins?.[index] ?? null;

  // el retrato del origen elegido aparece en el azogue
  useEffect(() => {
    if (!liveStage || !ready || !origin) return;
    const url = assetUrl(`art/portraits/portrait_${origin.id}.webp`);
    if (!url) return;
    let alive = true;
    liveStage.texture(url).then((tex) => {
      if (!alive) return;
      if (portrait) {
        portrait.setTexture(tex);
      } else {
        const p = new MirrorPortrait(JOURNAL_MIRROR.center, JOURNAL_MIRROR.rx, JOURNAL_MIRROR.ry, tex);
        liveStage.attach(p);
        setPortrait(p);
      }
    });
    return () => {
      alive = false;
    };
  }, [liveStage, ready, origin, portrait]);

  useEffect(() => () => {
    if (portrait && liveStage) liveStage.detach(portrait);
  }, [portrait, liveStage]);

  const start = async () => {
    if (!origin) return;
    setBusy(true);
    try {
      const res = await api.prologueStart(origin.id, name.trim() || origin.name);
      adopt(res.characterId);
      rememberLetter(res.characterId, res.benefactorLetterText);
      saved();
      await refresh();
      go('desvan');
    } catch (err) {
      fail(err);
    } finally {
      setBusy(false);
    }
  };

  const step = (d: number) => origins && setIndex((i) => (i + d + origins.length) % origins.length);
  const burden = origin && typeof origin.initialBurden === 'object' ? origin.initialBurden : null;

  return (
    <>
      <StackedSheet
        title="LA MÁSCARA CIVIL"
        tag={origin && <><IconDocument size={26} /> {formatMoney(origin.weeklySalaryPence)} a la semana</>}
        footer={
          <>
            <div className="origin-dots" role="group" aria-label="Orígenes">
              <button type="button" className="sheet-arrow" onClick={() => step(-1)} aria-label="Origen anterior"><IconChevronLeft size={26} /></button>
              {origins?.map((o, i) => (
                <button key={o.id} type="button" aria-pressed={i === index} aria-label={o.name} onClick={() => setIndex(i)} />
              ))}
              <button type="button" className="sheet-arrow" onClick={() => step(1)} aria-label="Origen siguiente"><IconChevronRight size={26} /></button>
            </div>
            <div className="name-field">
              <label htmlFor="civil-name">Nombre con el que firmas el alquiler</label>
              <input id="civil-name" value={name} maxLength={40} placeholder={origin?.name ?? ''} onChange={(e) => setName(e.target.value)} autoComplete="off" spellCheck={false} />
            </div>
            <GoldButton primary busy={busy} disabled={!origin || (name.trim().length > 0 && name.trim().length < 2)} onClick={start}>
              Firmar el registro
            </GoldButton>
          </>
        }
      >
        {origin ? (
          <div key={origin.id} className="fade-in">
            <h3 className="sheet-heading">{origin.name}</h3>
            <p className="sheet-prose sheet-prose--small" style={{ fontStyle: 'italic' }}>{origin.profession}</p>
            <Divider tone="bronze" width="100%" style={{ margin: '18px 0' }} />
            <p className="sheet-prose" style={{ fontSize: 24 }}>{origin.prologueIntro}</p>
            {burden?.description && (
              <p className="sheet-prose sheet-prose--small"><strong style={{ fontWeight: 600 }}>{(burden as { name?: string }).name ?? 'Carga'}.</strong> {burden.description}</p>
            )}
            {origin.originAnchors && origin.originAnchors.length > 0 && (
              <p className="sheet-prose sheet-prose--small">
                Te sostienen: {origin.originAnchors.map((a) => a.name ?? a.title).filter(Boolean).join(' · ')}.
              </p>
            )}
          </div>
        ) : (
          <p className="sheet-prose">Las hojas del registro todavía están secándose…</p>
        )}
      </StackedSheet>
      <CornerBack label="Volver" icon={<IconChevronLeft size={24} />} onClick={() => go('title')} />
    </>
  );
}
