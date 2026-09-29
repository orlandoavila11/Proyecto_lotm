import { useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';
import type { MarketEnvelope, MarketListing, Quality } from '../api/types';
import { assetUrl } from '../assets';
import { CounterItem } from '../engine/props';
import { usePlace, useStage, useStageEvents } from '../engine/react';
import { Divider, Gilt } from '../hud/kit/Gilt';
import { Cartouche, GoldButton, Panel } from '../hud/kit/components';
import { Prose } from '../hud/kit/cards';
import { IconBottles, IconCart, IconChevronLeft, IconChevronRight, IconCoins, IconPouch } from '../hud/kit/icons';
import { formatMoney, useSession } from '../session/store';
import { PATHWAY_LABEL } from './prose';
import { COUNTER_SLOTS, bazaarSpec } from './specs/interiors';

const QUALITY_LABEL: Record<Quality, string> = { PRISTINE: 'Íntegro', DAMAGED: 'Dañado', CONTAMINATED: 'Contaminado' };
const CATEGORY_LABEL: Record<string, string> = {
  MAIN_INGREDIENT: 'Ingrediente principal',
  SUPPLEMENTARY_INGREDIENT: 'Ingrediente auxiliar',
  RITUAL_SUPPLY: 'Material ritual'
};

const itemArt = (id: string) => assetUrl(`art/items/item_${id}.webp`);

function describe(l: MarketListing) {
  const cat = CATEGORY_LABEL[l.category ?? ''] ?? (l.id.startsWith('RITUAL') ? 'Material ritual' : 'Mercancía');
  const path = l.pathwayTarget ? PATHWAY_LABEL[l.pathwayTarget] ?? l.pathwayTarget : null;
  return path ? `${cat} para ${path}${l.sequence ? `, secuencia ${l.sequence}` : ''}.` : `${cat}.`;
}

export function Bazaar() {
  const { snapshot, characterId, go, refresh, saved, fail } = useSession();
  const { stage, ready, provisional } = usePlace(bazaarSpec);
  const liveStage = useStage();
  const [env, setEnv] = useState<MarketEnvelope | null>(null);
  const [missing, setMissing] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [index, setIndex] = useState(0);
  const [quality, setQuality] = useState<Quality>('PRISTINE');
  const [qty, setQty] = useState(1);
  const [busy, setBusy] = useState(false);
  const [receipt, setReceipt] = useState<string | null>(null);
  const [items, setItems] = useState<CounterItem[]>([]);

  const location = snapshot?.character.current_location ?? 'DIST_CHERWOOD';

  useEffect(() => {
    api.market(location).then(setEnv).catch((err) => {
      setMissing(err instanceof Error ? err.message : 'Hoy no hay mostrador abierto en este distrito.');
    });
  }, [location]);

  const listings = env?.market.inventory ?? [];
  const visible = listings.slice(page * 3, page * 3 + 3);
  const current = visible[index] ?? null;
  const pages = Math.max(1, Math.ceil(listings.length / 3));

  useEffect(() => {
    if (current && !current.availableQualities.includes(quality)) setQuality(current.availableQualities[0]);
    setQty(1);
    setReceipt(null);
  }, [current, quality]);

  // lámina limpia: los recortes de la mercancía se colocan sobre el mostrador
  useEffect(() => {
    if (!liveStage || !ready || provisional) return;
    let alive = true;
    const created: CounterItem[] = [];
    Promise.all(
      visible.map(async (l, i) => {
        const url = itemArt(l.id);
        if (!url) return;
        const tex = await liveStage.texture(url);
        if (!alive) return;
        const slot = COUNTER_SLOTS[i];
        const it = new CounterItem(tex, slot.base, slot.height);
        liveStage.attach(it);
        created[i] = it;
      })
    ).then(() => alive && setItems([...created]));
    return () => {
      alive = false;
      created.forEach((c) => c && liveStage.detach(c));
    };
  }, [liveStage, ready, provisional, page, env]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    items.forEach((it, i) => it && (it.uSelected.value = i === index ? 1 : 0));
    if (stage && ready) stage.select(provisional && current ? COUNTER_SLOTS[index].hotspot : null);
  }, [items, index, stage, ready, provisional, current]);

  useStageEvents((e) => {
    if (e.type === 'select') {
      const i = COUNTER_SLOTS.findIndex((s) => s.hotspot === e.id);
      if (i >= 0 && i < visible.length) setIndex(i);
    }
  });

  const unit = useMemo(() => {
    if (!current) return 0;
    const mult = env?.qualityModifiers?.[quality]?.priceMultiplier ?? 1;
    return Math.round(current.basePricePence * mult);
  }, [current, quality, env]);

  const balance = snapshot?.character.raw_pence ?? 0;
  const maxQty = Math.max(1, Math.min(current?.stock ?? 9, 9));

  const buy = async () => {
    if (!characterId || !current || !env) return;
    setBusy(true);
    let bought = 0;
    try {
      // una orden por unidad, cada una con su commandId: un reintento nunca cobra dos veces
      for (let i = 0; i < qty; i++) {
        await api.buy(characterId, env.market.districtId, current.id, quality);
        bought++;
      }
      setReceipt(`${bought > 1 ? `${bought} unidades` : 'Una unidad'} de ${current.name.toLowerCase()} envueltas en papel de estraza.`);
    } catch (err) {
      fail(err);
      if (bought > 0) setReceipt(`Sólo pudiste llevarte ${bought}.`);
    } finally {
      if (bought > 0) saved();
      await refresh();
      setBusy(false);
    }
  };

  const thumb = (l: MarketListing) => {
    const url = itemArt(l.id);
    return url ? <img src={url} alt="" /> : <IconBottles size={44} />;
  };
  const preview = current ? itemArt(current.id) : null;
  const previewBg = assetUrl('art/bazaar_preview_bg.webp');

  return (
    <>
      <Cartouche title="BAZAR CLANDESTINO" width={445} />

      <Panel className="slide-in-right" style={{ right: 23, top: 62, width: 499, bottom: 65, padding: '46px 42px 30px', display: 'flex', flexDirection: 'column' }} label="Mercancía">
        <div className="framed-preview" style={{ marginBottom: 26 }}>
          <div className="framed-preview__img bazaar-preview" style={{ aspectRatio: '415 / 310', backgroundImage: previewBg ? `url(${previewBg})` : undefined }}>
            {preview ? <img src={preview} alt={current?.name ?? ''} /> : <IconBottles size={80} />}
          </div>
        </div>
        {missing && <Prose>{missing}</Prose>}
        {current && (
          <div key={current.id} className="fade-in" style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
            <h2 className="t-body" style={{ margin: 0, fontSize: 38, fontWeight: 500, textAlign: 'center', lineHeight: 1.12, textWrap: 'balance' }}>{current.name}</h2>
            <Divider width="100%" style={{ margin: '14px 0 16px' }} />
            <Prose size={21}>{describe(current)}</Prose>
            {current.availableQualities.length > 1 && (
              <div className="quality-chips" role="radiogroup" aria-label="Estado de la mercancía">
                {current.availableQualities.map((q) => (
                  <button key={q} type="button" role="radio" aria-checked={quality === q} onClick={() => setQuality(q)}>{QUALITY_LABEL[q]}</button>
                ))}
              </div>
            )}
            <Divider width="100%" style={{ margin: '10px 0 6px' }} />
            <div className="stat-row"><span className="stat-row__icon"><IconCoins size={30} /></span><span>Precio</span><span className="stat-row__value">{formatMoney(unit * qty)}</span></div>
            <div className="stat-row"><span className="stat-row__icon"><IconPouch size={30} /></span><span>Saldo</span><span className="stat-row__value">{formatMoney(balance)}</span></div>
            <div className="stat-row">
              <span className="stat-row__icon"><IconBottles size={30} /></span>
              <span>Cantidad</span>
              <span className="qty">
                <button type="button" aria-label="Menos" disabled={qty <= 1} onClick={() => setQty((q) => Math.max(1, q - 1))}><IconChevronLeft size={22} /></button>
                <span className="stat-row__value">{qty}</span>
                <button type="button" aria-label="Más" disabled={qty >= maxQty} onClick={() => setQty((q) => Math.min(maxQty, q + 1))}><IconChevronRight size={22} /></button>
              </span>
            </div>
            {receipt && <Prose size={18} dim>{receipt}</Prose>}
            <div style={{ flex: 1 }} />
          </div>
        )}
        <div style={{ display: 'grid', gap: 26, marginTop: 14 }}>
          <GoldButton primary icon={<IconCart />} busy={busy} disabled={!current || unit * qty > balance} onClick={buy} style={{ minHeight: 66, fontSize: 27 }}>Comprar</GoldButton>
          <GoldButton icon={<IconChevronLeft />} onClick={() => go('cherwood')} style={{ minHeight: 62, fontSize: 26 }}>Volver</GoldButton>
        </div>
      </Panel>

      {listings.length > 0 && (
        <div className="thumb-strip fade-in">
          <span className="thumb-strip__line thumb-strip__line--l" />
          <button type="button" className="thumb-strip__arrow" aria-label="Anteriores" disabled={page === 0} onClick={() => { setPage((p) => p - 1); setIndex(0); }}><IconChevronLeft size={34} /></button>
          {visible.map((l, i) => (
            <button key={l.id} type="button" className="thumb" aria-pressed={i === index} aria-label={l.name} onClick={() => setIndex(i)}>
              <Gilt variant="hairline" glow={i === index} />
              {thumb(l)}
            </button>
          ))}
          <button type="button" className="thumb-strip__arrow" aria-label="Siguientes" disabled={page >= pages - 1} onClick={() => { setPage((p) => p + 1); setIndex(0); }}><IconChevronRight size={34} /></button>
          <span className="thumb-strip__line thumb-strip__line--r" />
          <svg className="thumb-strip__diamond" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1 L15 8 L8 15 L1 8 Z" fill="var(--ebony)" stroke="var(--gold-hi)" strokeWidth="1.2" /></svg>
        </div>
      )}
    </>
  );
}
