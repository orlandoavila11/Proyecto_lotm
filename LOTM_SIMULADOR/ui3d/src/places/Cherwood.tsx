import { useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';
import type { District } from '../api/types';
import { assetUrl } from '../assets';
import { usePlace, useStageEvents } from '../engine/react';
import { Divider } from '../hud/kit/Gilt';
import { Cartouche, CornerBack, GoldButton, Panel } from '../hud/kit/components';
import { Prose } from '../hud/kit/cards';
import { IconChevronLeft } from '../hud/kit/icons';
import { Marker } from '../hud/kit/Marker';
import { districtLabel, formatMoney, useSession } from '../session/store';
import { CLUE_SOURCES } from './caseMap';
import { DESTINATIONS, cherwoodSpec, type Destination } from './specs/streets';
import { useCase, type VisitOutcome } from './useCase';

type Selection = Destination['id'] | 'barrio' | null;

/** Vista previa del destino: arte dedicado o, en su defecto, el mismo edificio recortado de la lámina. */
function Preview({ dest }: { dest: Destination }) {
  const art = assetUrl(dest.art);
  const plate = assetUrl(cherwoodSpec.plate.clean) ?? assetUrl(cherwoodSpec.plate.atlas);
  const [x, y, w, h] = dest.crop;
  const style: React.CSSProperties = art
    ? { backgroundImage: `url(${art})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { backgroundImage: `url(${plate})`, backgroundSize: `${(1920 / w) * 100}% auto`, backgroundPosition: `${(x / (1920 - w)) * 100}% ${(y / (1080 - h)) * 100}%` };
  return (
    <div className="framed-preview">
      <div className="framed-preview__img" style={style} role="img" aria-label={dest.title} />
    </div>
  );
}

export function Cherwood() {
  const { snapshot, characterId, go, refresh, saved, fail } = useSession();
  const { stage, ready } = usePlace(cherwoodSpec);
  const [sel, setSel] = useState<Selection>(null);
  const [hover, setHover] = useState<string | null>(null);
  const [districts, setDistricts] = useState<District[] | null>(null);
  const [fare, setFare] = useState<number | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [travelNote, setTravelNote] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<VisitOutcome | null>(null);
  const kase = useCase();

  const here = snapshot?.character.current_location ?? 'DIST_CHERWOOD';
  const inCherwood = districtLabel(here) === 'Cherwood';

  useEffect(() => {
    if (sel === 'carruaje' && !districts) api.districts().then((r) => { setDistricts(r.districts); setFare(r.carriageFarePence); }).catch(fail);
  }, [sel, districts, fail]);

  useEffect(() => {
    if (!stage || !ready) return;
    stage.select(sel && sel !== 'barrio' ? sel : null);
  }, [stage, ready, sel]);

  useEffect(() => {
    stage?.setHover(hover);
  }, [stage, hover]);

  useStageEvents((e) => {
    if (e.type === 'select') setSel(e.id as Selection);
  });

  const dest = useMemo(() => DESTINATIONS.find((d) => d.id === sel) ?? null, [sel]);

  const walk = () => {
    if (!dest) return;
    if (dest.id === 'pension') go('desvan');
    if (dest.id === 'orfanato') go('location', 'orfanato');
    if (dest.id === 'mansion') go('location', 'mansion');
    if (dest.id === 'bazar') go('bazaar');
    if (dest.id === 'callejon') go('combat');
  };

  const travel = async (d: District) => {
    if (!characterId) return;
    setBusy(d.id);
    try {
      const res = await api.travel(characterId, d.id);
      setTravelNote(res.encounter ?? res.message);
      saved();
      await refresh();
    } catch (err) {
      fail(err);
    } finally {
      setBusy(null);
    }
  };

  const neighbours = CLUE_SOURCES.filter((s) => s.site === 'barrio');
  const visible = DESTINATIONS.filter((d) => inCherwood || d.id === 'carruaje' || d.id === 'bazar');

  return (
    <>
      <Cartouche title={districtLabel(here).toUpperCase()} subtitle="Elegir destino" subtitleInside width={300} />

      {visible.map((d) => (
        <Marker
          key={d.id}
          at={d.pin}
          label={d.label}
          active={sel === d.id}
          onClick={() => { setSel(d.id); setOutcome(null); setTravelNote(null); }}
          onHover={(h) => setHover(h ? d.id : null)}
        />
      ))}
      {inCherwood && (
        <Marker at={[1222, 640]} label="Vecinos" active={sel === 'barrio'} onClick={() => { setSel('barrio'); setOutcome(null); }} />
      )}

      {dest && dest.id !== 'carruaje' && (
        <Panel className="slide-in-right" style={{ right: 27, top: 68, width: 388, padding: '34px 33px 34px' }} label={dest.title}>
          <h2 className="t-display" style={{ margin: 0, fontSize: 38, letterSpacing: '0.03em' }}>{dest.title}</h2>
          <Divider style={{ margin: '12px 0 22px' }} />
          <Preview dest={dest} />
          <Prose size={21}>{dest.line}</Prose>
          <div style={{ display: 'grid', gap: 18, marginTop: 20 }}>
            <GoldButton primary onClick={walk} style={{ minHeight: 62, fontSize: 25 }}>Viajar</GoldButton>
            <GoldButton onClick={() => setSel(null)} style={{ minHeight: 62, fontSize: 25 }}>Cancelar</GoldButton>
          </div>
        </Panel>
      )}

      {dest?.id === 'carruaje' && (
        <Panel className="slide-in-right" style={{ right: 27, top: 68, width: 420, maxHeight: 'calc(100% - 180px)', padding: '34px 33px 30px', display: 'flex', flexDirection: 'column' }} label={dest.title}>
          <h2 className="t-display" style={{ margin: 0, fontSize: 32 }}>{dest.title}</h2>
          <Divider style={{ margin: '12px 0 18px' }} />
          <Prose size={20}>{fare !== null ? `Tarifa por trayecto: ${formatMoney(fare)}. ` : ''}Saldo: {formatMoney(snapshot?.character.raw_pence ?? 0)}.</Prose>
          {travelNote && <Prose size={19} dim>{travelNote}</Prose>}
          <div className="scroll" style={{ display: 'grid', gap: 12, minHeight: 0 }}>
            {(districts ?? []).map((d) => {
              const current = d.id === here || districtLabel(d.id) === districtLabel(here);
              return (
                <GoldButton key={d.id} align="start" disabled={current || (fare !== null && (snapshot?.character.raw_pence ?? 0) < fare)} busy={busy === d.id} onClick={() => travel(d)} style={{ minHeight: 70, fontSize: 21, padding: '10px 20px' }}>
                  <span style={{ display: 'block', textAlign: 'left' }}>
                    {d.district_name}
                    <span style={{ display: 'block', fontSize: 16, fontStyle: 'italic', color: 'var(--ivory-dim)' }}>{current ? 'Estás aquí' : d.landmark}</span>
                  </span>
                </GoldButton>
              );
            })}
            {!districts && <Prose dim>El cochero consulta su libreta…</Prose>}
          </div>
          <GoldButton onClick={() => setSel(null)} style={{ marginTop: 16 }}>Cancelar</GoldButton>
        </Panel>
      )}

      {sel === 'barrio' && (
        <Panel className="slide-in-right" style={{ right: 27, top: 68, width: 440, maxHeight: 'calc(100% - 180px)', padding: '34px 33px 30px', display: 'flex', flexDirection: 'column' }} label="Vecinos">
          <h2 className="t-display" style={{ margin: 0, fontSize: 32 }}>Vecinos de Cherwood</h2>
          <Divider style={{ margin: '12px 0 18px' }} />
          {outcome && (
            <div className="fade-in" style={{ marginBottom: 14 }}>
              {outcome.clue ? (
                <Prose size={20}><strong style={{ color: 'var(--gold-hi)', fontWeight: 500 }}>{outcome.clue.nombre}.</strong> {outcome.clue.descripcion}</Prose>
              ) : (
                <Prose size={19} dim>{outcome.message}</Prose>
              )}
            </div>
          )}
          <div className="scroll" style={{ display: 'grid', gap: 10, minHeight: 0 }}>
            {neighbours.map((s) => {
              const got = kase.discovered(s.clueId);
              return (
                <GoldButton
                  key={`${s.clueId}:${s.sourceIndex}`}
                  align="start"
                  busy={kase.busy === `${s.clueId}:${s.sourceIndex}`}
                  disabled={!kase.caseState}
                  onClick={async () => setOutcome(await kase.visit(s))}
                  style={{ minHeight: 66, fontSize: 20, padding: '8px 18px' }}
                >
                  <span style={{ display: 'block', textAlign: 'left' }}>
                    {s.label}
                    <span style={{ display: 'block', fontSize: 16, fontStyle: 'italic', color: 'var(--ivory-dim)' }}>
                      {got ? 'Ya consta en el expediente' : s.when ? `Suele estar por la ${s.when}` : 'Cuando la ocasión lo permita'}
                    </span>
                  </span>
                </GoldButton>
              );
            })}
          </div>
          <GoldButton onClick={() => setSel(null)} style={{ marginTop: 16 }}>Cerrar</GoldButton>
        </Panel>
      )}

      <CornerBack label="Volver al Desván" icon={<IconChevronLeft size={24} />} onClick={() => go('desvan')} />
    </>
  );
}
