import { HotspotKeys } from '../hud/kit/HotspotKeys';
import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client';
import type { AscensionResult, AscensionStatus } from '../api/types';
import { assetUrl } from '../assets';
import { usePlace, useStageEvents } from '../engine/react';
import { ChoiceRow } from '../hud/kit/ChoiceRow';
import { Divider } from '../hud/kit/Gilt';
import { GoldButton } from '../hud/kit/components';
import { IconBook, IconBottles, IconCandle, IconScroll } from '../hud/kit/icons';
import { StackedSheet } from '../hud/kit/StackedSheet';
import { LetterReader } from '../hud/panels/LetterReader';
import { formatMoney, useSession } from '../session/store';
import { ASCENSION_MIRROR, ascensionSpec } from './specs/interiors';
import { useSomaticScene } from './somatics';
import { useMirrorPortrait } from './useMirrorPortrait';

type Detail = 'formula' | 'ingredients' | 'digestion' | 'preparation' | null;
type ChecklistKey = keyof AscensionStatus['door4_preparation']['checklist'];


const QUALITY: Record<string, string> = { PRISTINE: 'íntegra', DAMAGED: 'dañada', CONTAMINATED: 'contaminada' };
/** calidad de un ingrediente suelto (masculino: "el ingrediente") */
const QUALITY_ITEM: Record<string, string> = { PRISTINE: 'íntegro', DAMAGED: 'dañado', CONTAMINATED: 'contaminado' };

/** V08 · Ascensión — una decisión consciente antes del consumo. */
export function Ascension() {
  const { characterId, go, refresh, saved, fail } = useSession();
  const { stage, ready } = usePlace(ascensionSpec);
  const [status, setStatus] = useState<AscensionStatus | null>(null);
  const [detail, setDetail] = useState<Detail>(null);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [result, setResult] = useState<AscensionResult | null>(null);

  useMirrorPortrait(ready, ASCENSION_MIRROR);
  useSomaticScene(ready);

  const load = useCallback(async () => {
    if (!characterId) return;
    try {
      setStatus((await api.ascensionStatus(characterId)).status);
    } catch (err) {
      fail(err);
    }
  }, [characterId, fail]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!stage || !ready) return;
    stage.select(result ? null : confirming ? 'chalice' : detail === 'formula' ? 'formula' : detail === 'ingredients' ? 'jars' : null);
    stage.setView(confirming || result ? { cx: 703, cy: 500, zoom: 1.3 } : { cx: 960, cy: 540, zoom: 1 });
    stage.uDanger.value = result?.outcome === 'RAMPAGE' ? 0.6 : 0;
    return () => {
      stage.uDanger.value = 0;
    };
  }, [stage, ready, detail, confirming, result]);

  useStageEvents((e) => {
    if (e.type !== 'select') return;
    if (e.id === 'formula') setDetail('formula');
    if (e.id === 'jars') setDetail('ingredients');
    if (e.id === 'chalice' && status?.canDrink) setConfirming(true);
  });

  const toggle = async (key: ChecklistKey, value: boolean) => {
    if (!characterId) return;
    setBusy(key);
    try {
      const res = await api.prepareAscension(characterId, { [key]: value });
      setStatus(res.status);
      saved();
    } catch (err) {
      fail(err);
    } finally {
      setBusy(null);
    }
  };

  const present = async () => {
    if (!characterId) return;
    setBusy('present');
    try {
      // el motor mide la vacilación entre presentar la poción y beberla
      const res = await api.prepareAscension(characterId, {}, true);
      setStatus(res.status);
      setConfirming(true);
    } catch (err) {
      fail(err);
    } finally {
      setBusy(null);
    }
  };

  const drink = async () => {
    if (!characterId) return;
    setBusy('drink');
    try {
      const res = await api.drinkAscension(characterId);
      setResult(res);
      saved();
      await refresh();
    } catch (err) {
      fail(err);
    } finally {
      setBusy(null);
    }
  };

  const icon = (file: string, fallback: React.ReactNode) => {
    const url = assetUrl(`art/${file}.webp`);
    return url ? <img src={url} alt="" /> : fallback;
  };

  if (result) {
    return (
      <LetterReader
        left={1060}
        width={760}
        footer={<div className="letter__footer letter__footer--single"><GoldButton primary onClick={() => go('desvan')}>Volver al desván</GoldButton></div>}
      >
        {(() => {
          // el motor abre el relato con un rótulo entre corchetes: se lee como encabezado, no como marca técnica
          const m = /^\s*\[([^\]]+)\]\s*/.exec(result.narrativeText);
          return (
            <>
              {m && <p className="letter__heading">{m[1].toLowerCase()}</p>}
              <p>{m ? result.narrativeText.slice(m[0].length) : result.narrativeText}</p>
            </>
          );
        })()}
      </LetterReader>
    );
  }

  const s = status;
  const prepScore = s?.door4_preparation.score ?? 0;

  let body: React.ReactNode;
  if (!s) {
    body = <p className="sheet-prose sheet-prose--small">Desenrollando la fórmula…</p>;
  } else if (confirming) {
    body = (
      <div className="fade-in">
        <h3 className="sheet-heading" style={{ fontSize: 34 }}>Secuencia {s.targetSequence}</h3>
        <p className="sheet-prose sheet-prose--small">
          El líquido del cáliz no refleja la vela. Si bebes ahora, lo que eres esta noche no volverá entero.
        </p>
        <p className="sheet-prose sheet-prose--small" style={{ fontStyle: 'italic' }}>
          Preparación {prepScore} de {s.door4_preparation.maxScore}. Materia {QUALITY[s.door2_ingredients.averageQuality] ?? s.door2_ingredients.averageQuality}.
        </p>
      </div>
    );
  } else if (detail) {
    body = (
      <div className="fade-in">
        {detail === 'formula' && (
          <>
            <h3 className="sheet-heading" style={{ fontSize: 32 }}>{s.door1_formula.name}</h3>
            <p className="sheet-prose sheet-prose--small">{s.door1_formula.details}</p>
          </>
        )}
        {detail === 'ingredients' && <Ingredients door={s.door2_ingredients} />}
        {detail === 'digestion' && (
          <>
            <h3 className="sheet-heading" style={{ fontSize: 32 }}>Digestión</h3>
            <p className="sheet-prose sheet-prose--small">{s.door3_digestion.details}</p>
            <div className="ink-meter"><span>La poción asentada</span><span className="ink-meter__line"><span style={{ width: `${Math.min(100, s.door3_digestion.current)}%` }} /></span><span className="ink-meter__num">{Math.round(s.door3_digestion.current)}%</span></div>
          </>
        )}
        {detail === 'preparation' && (
          <>
            <h3 className="sheet-heading" style={{ fontSize: 32 }}>Preparación del rito</h3>
            <p className="sheet-prose sheet-prose--small" style={{ fontStyle: 'italic' }}>Cada paso se prepara una vez y se paga en el acto.</p>
            <div style={{ display: 'grid', gap: 14 }}>
              {s.door4_preparation.steps.map((st) => (
                <label key={st.id} className={`toggle toggle--paper prep-step ${st.blockedReason && !st.done ? 'is-blocked' : ''}`}>
                  <input type="checkbox" checked={st.done} disabled={st.done || !!st.blockedReason || busy === st.id} onChange={(e) => e.target.checked && toggle(st.id, true)} />
                  <span className="toggle__box" aria-hidden="true" />
                  <span className="prep-step__text">
                    <span className="prep-step__name">{st.name}{!st.done && st.costPence > 0 ? ` · ${formatMoney(st.costPence)}` : ''}</span>
                    <span className="prep-step__detail">{st.done ? 'Preparado.' : st.blockedReason ?? st.description}</span>
                  </span>
                </label>
              ))}
            </div>
          </>
        )}
      </div>
    );
  } else {
    body = (
      <div style={{ display: 'grid', gap: 18 }}>
        <ChoiceRow thumb={icon('icon_formula', <IconScroll size={50} />)} label="Fórmula" done={s.door1_formula.passed} onClick={() => setDetail('formula')} />
        <ChoiceRow thumb={icon('icon_ingredients', <IconBottles size={50} />)} label="Ingredientes" done={s.door2_ingredients.passed} onClick={() => setDetail('ingredients')} />
        <ChoiceRow thumb={icon('icon_digestion', <IconBook size={50} />)} label="Digestión" done={s.door3_digestion.passed} onClick={() => setDetail('digestion')} />
        <ChoiceRow thumb={<IconCandle size={50} />} label="Preparación" detail={`${prepScore} de ${s.door4_preparation.maxScore}`} done={s.door4_preparation.passed} onClick={() => setDetail('preparation')} />
      </div>
    );
  }

  const footer = (
    <>
      <Divider tone="bronze" width="100%" />
      <p className="sheet-prose sheet-prose--small" style={{ textAlign: 'center', margin: 0 }}>La decisión aún es tuya.</p>
      {confirming ? (
        <>
          <GoldButton primary busy={busy === 'drink'} onClick={drink}>Beber del cáliz</GoldButton>
          <GoldButton onClick={() => setConfirming(false)}>Todavía no</GoldButton>
        </>
      ) : detail ? (
        <GoldButton onClick={() => setDetail(null)}>Volver al umbral</GoldButton>
      ) : (
        <>
          <GoldButton primary busy={busy === 'present'} disabled={!s?.canDrink} onClick={present}>Confirmar preparación</GoldButton>
          <GoldButton onClick={() => go('desvan')}>Todavía no</GoldButton>
        </>
      )}
    </>
  );

  const openSpot = (id: string) => {
    if (id === 'formula') setDetail('formula');
    if (id === 'jars') setDetail('ingredients');
    if (id === 'chalice' && s?.canDrink) present();
  };

  return (
    <>
    <HotspotKeys spots={ascensionSpec.hotspots} onOpen={openSpot} />
    <StackedSheet
      title="El Siguiente Umbral"
      subtitle="Preparación de la ascensión"
      spaced={false}
      headerSize={40}
      loose={false}
      style={{ top: 97, bottom: 50, width: 600, right: 20 }}
      footer={footer}
    >
      {body}
    </StackedSheet>
    </>
  );
}

/** Puerta 2: lo que hay sobre la mesa y lo que aún falta, con los nombres del catálogo (nunca códigos). */
function Ingredients({ door }: { door: AscensionStatus['door2_ingredients'] }) {
  const mains = door.items.filter((i) => i.role === 'MAIN');
  const supps = door.items.filter((i) => i.role === 'SUPPLEMENTARY');
  const owned = supps.filter((i) => i.owned);
  const missing = Math.max(0, door.requiredSupplementaryCount - owned.length);
  const options = new Intl.ListFormat('es', { type: 'disjunction' }).format(supps.filter((i) => !i.owned).map((i) => i.name.toLowerCase()));
  return (
    <>
      <h3 className="sheet-heading" style={{ fontSize: 32 }}>Ingredientes</h3>
      <h4 className="sheet-subheading">Principales · {door.mainCount} de {door.requiredMainCount}</h4>
      <ul className="ingredient-list">
        {mains.map((i) => (
          <li key={i.code} className={i.owned ? '' : 'is-missing'}>
            <span>{i.name}</span>
            <span className="ingredient-list__state">{i.owned && i.quality ? QUALITY_ITEM[i.quality] : 'falta'}</span>
          </li>
        ))}
      </ul>
      <h4 className="sheet-subheading">Auxiliares · {owned.length} de {door.requiredSupplementaryCount}</h4>
      <ul className="ingredient-list">
        {owned.map((i) => (
          <li key={i.code}>
            <span>{i.name}</span>
            <span className="ingredient-list__state">{i.quality ? QUALITY_ITEM[i.quality] : ''}</span>
          </li>
        ))}
      </ul>
      {missing > 0 && options && (
        <p className="sheet-prose sheet-prose--small" style={{ fontStyle: 'italic' }}>
          {missing === 1 ? 'Falta uno más' : `Faltan ${missing} más`}: {options}.
        </p>
      )}
    </>
  );
}
