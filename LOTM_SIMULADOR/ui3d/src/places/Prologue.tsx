import { useEffect, useState } from 'react';
import { api } from '../api/client';
import type { PotionOption } from '../api/types';
import { assetUrl } from '../assets';
import { usePlace } from '../engine/react';
import { ChoiceRow } from '../hud/kit/ChoiceRow';
import { Divider } from '../hud/kit/Gilt';
import { CornerBack, GoldButton } from '../hud/kit/components';
import { IconBottles, IconChevronLeft } from '../hud/kit/icons';
import { StackedSheet } from '../hud/kit/StackedSheet';
import { LetterReader } from '../hud/panels/LetterReader';
import { useSession } from '../session/store';
import { ascensionSpec } from './specs/interiors';

/**
 * Prólogo · la buhardilla del Callejón de la Cruz de Hierro. Dos recipientes sin etiqueta: la elección
 * críptica de vía (Fool / Visionary) y el despertar en Secuencia 9.
 */
export function Prologue() {
  const { characterId, go, refresh, saved, fail } = useSession();
  const { stage, ready } = usePlace(ascensionSpec);
  const [intro, setIntro] = useState<string>('');
  const [options, setOptions] = useState<PotionOption[]>([]);
  const [chosen, setChosen] = useState<PotionOption['id'] | null>(null);
  const [busy, setBusy] = useState(false);
  const [awakening, setAwakening] = useState<{ vision: string; awakening: string; name: string } | null>(null);

  useEffect(() => {
    api.potions().then((r) => { setIntro(r.intro); setOptions(r.options); }).catch(fail);
  }, [fail]);

  useEffect(() => {
    if (!stage || !ready) return;
    stage.setInteractive(false);
    return () => stage.setInteractive(true);
  }, [stage, ready]);

  useEffect(() => {
    if (!stage || !ready) return;
    stage.setView(awakening ? { cx: 703, cy: 470, zoom: 1.35 } : { cx: 960, cy: 540, zoom: 1 });
    stage.uDanger.value = awakening ? 0.08 : 0;
    stage.select(awakening ? null : 'chalice');
    return () => { stage.uDanger.value = 0; };
  }, [stage, ready, awakening]);

  const drink = async () => {
    if (!characterId || !chosen) return;
    setBusy(true);
    try {
      const res = await api.drinkFirstPotion(characterId, chosen);
      setAwakening({ vision: res.visionNarrative, awakening: res.awakeningNarrative, name: res.sequenceName });
      saved();
      await refresh();
    } catch (err) {
      fail(err);
    } finally {
      setBusy(false);
    }
  };

  const current = options.find((o) => o.id === chosen) ?? null;
  const thumb = (id: PotionOption['id']) => {
    const url = assetUrl(id === 'COBALT_EYES' ? 'art/potion_cobalt.webp' : 'art/potion_amber.webp')
      ?? assetUrl(id === 'COBALT_EYES' ? 'art/potionimg_cobalt.webp' : 'art/potionimg_amber.webp');
    return url ? <img src={url} alt="" /> : <IconBottles size={46} />;
  };

  if (awakening) {
    return (
      <LetterReader
        left={120}
        width={820}
        footer={<div className="letter__footer letter__footer--single"><GoldButton primary onClick={() => go('desvan')}>Despertar en el desván</GoldButton></div>}
      >
        <p>{awakening.vision}</p>
        <p>{awakening.awakening}</p>
        <p style={{ textAlign: 'right', fontSize: 27 }}>— {awakening.name}</p>
      </LetterReader>
    );
  }

  return (
    <>
      <StackedSheet
        title="Dos frascos sin nombre"
        spaced={false}
        headerSize={36}
        loose={false}
        style={{ top: 97, bottom: 50, width: 600, right: 20 }}
        footer={
          <>
            <Divider tone="bronze" width="100%" />
            <p className="sheet-prose sheet-prose--small" style={{ textAlign: 'center', margin: 0 }}>La decisión aún es tuya.</p>
            <GoldButton primary busy={busy} disabled={!chosen} onClick={drink}>Beber</GoldButton>
          </>
        }
      >
        {!current && <p className="sheet-prose sheet-prose--small">{intro}</p>}
        <div style={{ display: 'grid', gap: 18, marginTop: 10 }}>
          {options.map((o) => (
            <ChoiceRow key={o.id} thumb={thumb(o.id)} label={o.title} selected={chosen === o.id} done={chosen === o.id} onClick={() => setChosen(o.id)} />
          ))}
        </div>
        {current && (
          <div key={current.id} className="fade-in" style={{ marginTop: 22 }}>
            <p className="sheet-prose sheet-prose--small">{current.appearance}</p>
            <p className="sheet-prose sheet-prose--small" style={{ fontStyle: 'italic' }}>{current.sensoryEcho}</p>
          </div>
        )}
      </StackedSheet>
      <CornerBack label="Volver al Desván" icon={<IconChevronLeft size={24} />} onClick={() => go('desvan')} />
    </>
  );
}
