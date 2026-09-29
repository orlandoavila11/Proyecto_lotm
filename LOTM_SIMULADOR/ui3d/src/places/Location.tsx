import { HotspotKeys } from '../hud/kit/HotspotKeys';
import { useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';
import { assetUrl } from '../assets';
import type { PlaceSpec } from '../engine/PlaceSpec';
import { usePlace, useStageEvents } from '../engine/react';
import { centroid } from '../engine/types';
import { CornerBack, GoldButton } from '../hud/kit/components';
import { HoverTag } from '../hud/kit/cards';
import { IconChevronLeft, IconJournal, IconMagnifier, IconPin } from '../hud/kit/icons';
import { FramedImage, InspectionPanel } from '../hud/kit/InspectionPanel';
import { LeaderLine } from '../hud/kit/LeaderLine';
import { useSession } from '../session/store';
import { CLUE_SOURCES, clueArt, type ClueSource, type SiteId } from './caseMap';
import { studySpec } from './specs/interiors';
import { cherwoodSpec } from './specs/streets';
import { useCase } from './useCase';

/** San Dionisio aún no tiene lámina propia: se enfoca la verja del orfanato en la calle de Cherwood. */
const orphanageSpec: PlaceSpec = {
  ...cherwoodSpec,
  key: 'orfanato',
  hotspots: [],
  view: { cx: 1135, cy: 560, zoom: 2.1 }
};

const SITE_TITLE: Record<Exclude<SiteId, 'barrio'>, string> = {
  mansion: 'Mansión Sterling',
  orfanato: 'Orfanato de San Dionisio'
};

export function Location() {
  const { placeArg, go, fail, saved } = useSession();
  const site: Exclude<SiteId, 'barrio'> = placeArg === 'orfanato' ? 'orfanato' : 'mansion';
  const spec = site === 'mansion' ? studySpec : orphanageSpec;
  const { stage, ready } = usePlace(spec);
  const kase = useCase();
  const [hover, setHover] = useState<string | null>(null);
  const [selected, setSelected] = useState<ClueSource | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [savingNote, setSavingNote] = useState(false);

  const sources = useMemo(() => CLUE_SOURCES.filter((s) => s.site === site), [site]);
  const drawn = sources.filter((s) => s.hotspot);
  const offstage = sources.filter((s) => !s.hotspot);

  useEffect(() => {
    if (!stage || !ready) return;
    stage.select(selected?.hotspot ?? null);
  }, [stage, ready, selected]);

  useStageEvents((e) => {
    if (e.type === 'hover') setHover(e.id);
    if (e.type === 'select') {
      const s = drawn.find((d) => d.hotspot === e.id);
      if (s) { setSelected(s); setNote(null); }
    }
  });

  const found = selected ? kase.discovered(selected.clueId) : null;
  const spot = selected?.hotspot ? spec.hotspots.find((h) => h.id === selected.hotspot) : null;
  const hoverSpot = hover ? spec.hotspots.find((h) => h.id === hover) : null;

  const examine = async () => {
    if (!selected) return;
    const out = await kase.visit(selected);
    if (out) setNote(out.ok ? null : out.message);
  };

  const keepObservation = async () => {
    if (!found || !kase.caseState) return;
    setSavingNote(true);
    try {
      const res = await api.addNote(kase.caseState.id, `${found.nombre}: ${found.descripcion}`);
      kase.apply(res);
      saved();
      setNote('Anotado en el expediente del tablero.');
    } catch (err) {
      fail(err);
    } finally {
      setSavingNote(false);
    }
  };

  const plateUrl = assetUrl(spec.plate.clean) ?? assetUrl(spec.plate.atlas);
  const crop = spot ? cropStyle(plateUrl, spot.shape) : undefined;
  const art = found ? assetUrl(clueArt(found.id)) : null;

  const openSpot = (id: string) => {
    const src = drawn.find((d) => d.hotspot === id);
    if (src) { setSelected(src); setNote(null); }
  };

  return (
    <>
      <HotspotKeys spots={spec.hotspots} onOpen={openSpot} />
      {hoverSpot && hoverSpot.id !== selected?.hotspot && <HoverTag at={hoverSpot.anchor ?? centroid(hoverSpot.shape)} label={hoverSpot.label} />}
      {spot && <LeaderLine from={[1428, 418]} to={spot.anchor ?? centroid(spot.shape)} />}

      <InspectionPanel
        title="Inspección"
        footer={
          selected ? (
            <>
              <GoldButton icon={<IconMagnifier />} busy={kase.busy === `${selected.clueId}:${selected.sourceIndex}`} disabled={!!found || !kase.caseState} onClick={examine}>
                {found ? 'Examinado' : 'Examinar'}
              </GoldButton>
              <GoldButton icon={<IconJournal />} busy={savingNote} disabled={!found} onClick={keepObservation}>Guardar observación</GoldButton>
            </>
          ) : undefined
        }
      >
        {selected ? (
          <div key={`${selected.clueId}:${selected.sourceIndex}`} className="fade-in">
            <FramedImage src={art} alt={found?.nombre ?? selected.label} fallback={crop} />
            <h3 className="evidence-title">{found?.nombre ?? selected.label}</h3>
            {found && <p className="evidence-body">{found.descripcion}</p>}
            {note && <p className="evidence-body" style={{ fontSize: 21, fontStyle: 'italic' }}>{note}</p>}
            <div className="evidence-place"><IconPin size={24} /> {SITE_TITLE[site]}</div>
          </div>
        ) : (
          <div className="fade-in">
            <h3 className="evidence-title">{SITE_TITLE[site]}</h3>
            <p className="evidence-body" style={{ fontSize: 22 }}>
              {drawn.length > 0 ? 'Recorre la estancia con la mirada; lo que merezca examen responderá a tu luz.' : 'Lo que buscas no está a la vista desde la verja.'}
            </p>
            {offstage.length > 0 && (
              <div className="source-list">
                {offstage.map((s) => {
                  const got = kase.discovered(s.clueId);
                  return (
                    <GoldButton key={`${s.clueId}:${s.sourceIndex}`} align="start" icon={<IconMagnifier />} onClick={() => { setSelected(s); setNote(null); }} style={{ minHeight: 58, fontSize: 20 }}>
                      {got ? got.nombre : s.label}
                    </GoldButton>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </InspectionPanel>

      <CornerBack
        label={selected ? 'Volver' : 'Salir a la calle'}
        icon={<IconChevronLeft size={24} />}
        onClick={() => (selected ? setSelected(null) : go('cherwood'))}
      />
    </>
  );
}

/** Recorte de la lámina alrededor de un contorno: lo que se ve antes de examinar. */
function cropStyle(url: string | null, shape: readonly (readonly [number, number])[]): React.CSSProperties | undefined {
  if (!url) return undefined;
  const xs = shape.map((p) => p[0]);
  const ys = shape.map((p) => p[1]);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
  const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
  const w = Math.max(Math.max(...xs) - Math.min(...xs), 200) * 1.6;
  const h = w / (377 / 260);
  const x = Math.min(Math.max(cx - w / 2, 0), 1920 - w);
  const y = Math.min(Math.max(cy - h / 2, 0), 1080 - h);
  return {
    backgroundImage: `url(${url})`,
    backgroundSize: `${(1920 / w) * 100}% auto`,
    backgroundPosition: `${(x / (1920 - w)) * 100}% ${(y / (1080 - h)) * 100}%`
  };
}
