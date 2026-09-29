import { HotspotKeys } from '../hud/kit/HotspotKeys';
import { useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';
import type { CharacterSnapshot } from '../api/types';
import { ClockHands } from '../engine/props';
import { useAttached, usePlace, useStageEvents } from '../engine/react';
import { centroid } from '../engine/types';
import { BottomNav, Cartouche, GoldButton, SaveBadge } from '../hud/kit/components';
import { HoverTag, ObjectiveCard } from '../hud/kit/cards';
import { Marker } from '../hud/kit/Marker';
import { IconChalice, IconLetterOpener, IconPin, IconSeal } from '../hud/kit/icons';
import { CalendarPanel, CandlePanel, CorrespondencePanel, IdentityPanel, MirrorPanel, WalletPanel } from '../hud/panels/DeskPanels';
import { LetterReader, LetterText } from '../hud/panels/LetterReader';
import { SLOT_CLOCK, SLOT_LABEL, districtLabel, useSession } from '../session/store';
import { rememberedLetter } from './prologueMemory';
import { DESVAN_CLOCK_CENTER, DESVAN_CLOCK_RADIUS, desvanSpec } from './specs/desvan';
import { useSomaticScene } from './somatics';

type Inspect = 'candle' | 'mirror' | 'clock' | 'papers' | 'pouch' | 'letter' | null;

interface Objective {
  title: string;
  action: string;
  hotspot: string | null;
  icon: 'letter' | 'city' | 'chalice' | 'seal';
}

/** El objetivo nace del estado confirmado por el servidor, nunca de un guion fijo del cliente. */
function deriveObjective(s: CharacterSnapshot, caseClues: number | null): Objective {
  const step = s.character.prologue_step;
  if (step === 'BENEFACTOR_LETTER') return { title: 'Una carta sin remitente', action: 'Examinar la carta', hotspot: 'letter', icon: 'letter' };
  if (step === 'POTION_CHOICE') return { title: 'La Cruz de Hierro', action: 'Acudir a la cita', hotspot: 'stairs', icon: 'city' };
  if (s.character.digestion_progress >= 99.9) return { title: 'El siguiente umbral', action: 'Preparar la ascensión', hotspot: 'chalice', icon: 'chalice' };
  if (caseClues !== null && caseClues < 3) return { title: 'El eco en el nido vacío', action: 'Buscar indicios en Cherwood', hotspot: 'stairs', icon: 'city' };
  if (caseClues !== null) return { title: 'El eco en el nido vacío', action: 'Contrastar lo hallado', hotspot: 'board', icon: 'seal' };
  return { title: 'La noche en Cherwood', action: 'Salir a la calle', hotspot: 'stairs', icon: 'city' };
}

export function Desvan() {
  const { snapshot, characterId, go, lastSavedAt, openSettings, refresh, saved, fail } = useSession();
  const { stage, ready, provisional } = usePlace(desvanSpec);
  const [hover, setHover] = useState<string | null>(null);
  const [inspect, setInspect] = useState<Inspect>(null);
  const [reading, setReading] = useState(false);
  const [dilemmaResult, setDilemmaResult] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [caseClues, setCaseClues] = useState<number | null>(null);
  const [serverLetter, setServerLetter] = useState<string | null>(null);

  const step = snapshot?.character.prologue_step;
  const inPrologue = !!step && step !== 'COMPLETED';

  useEffect(() => {
    if (!characterId || inPrologue) return;
    api.activeCase(characterId).then((c) => setCaseClues(c.caseState ? c.caseState.discoveredClues.length : 0)).catch(() => setCaseClues(null));
  }, [characterId, inPrologue]);

  // la carta del Benefactor la reconstruye el motor mientras el prólogo sigue abierto
  useEffect(() => {
    if (!characterId || step !== 'BENEFACTOR_LETTER') return;
    api.prologueStatus(characterId).then((st) => setServerLetter(st.benefactorLetterText)).catch(() => setServerLetter(null));
  }, [characterId, step]);

  const objective = useMemo(() => (snapshot ? deriveObjective(snapshot, caseClues) : null), [snapshot, caseClues]);

  // el objeto del objetivo respira en dorado, como la carta del Atlas
  useEffect(() => {
    if (!stage || !ready) return;
    stage.select(inspect ? null : objective?.hotspot ?? null);
  }, [stage, ready, objective, inspect]);

  // ESTADO = OBJETO: vela (cordura) y azogue (corrupción)
  useSomaticScene(ready);

  // gradación por franja: la lámina es nocturna; de día se aclara y enfría (láminas diurnas opcionales)
  useEffect(() => {
    if (!stage || !ready) return;
    const grades: [number, [number, number, number]][] = [
      [1.1, [0.93, 0.98, 1.08]],
      [1.05, [1.05, 1.0, 0.93]],
      [1.0, [1.03, 0.96, 0.9]],
      [0.97, [1, 1, 1]]
    ];
    const [exposure, tint] = grades[snapshot?.character.current_slot ?? 3] ?? grades[3];
    stage.plate.uExposure.value = exposure;
    stage.plate.uTint.value.setRGB(...tint);
  }, [stage, ready, snapshot?.character.current_slot]);

  // la hora de las manecillas es la franja del calendario (sólo con lámina limpia: la del Atlas trae agujas pintadas)
  const hands = useAttached(() => (provisional ? null : new ClockHands(DESVAN_CLOCK_CENTER, DESVAN_CLOCK_RADIUS)), [provisional]);
  useEffect(() => {
    const [h, m] = SLOT_CLOCK[snapshot?.character.current_slot ?? 3];
    hands?.setTime(h, m);
  }, [hands, snapshot?.character.current_slot]);

  // encuadre: acercarse a la carta mientras se lee
  useEffect(() => {
    if (!stage) return;
    if (reading) stage.setView({ cx: 1180, cy: 700, zoom: 1.18 });
    else stage.resetView();
    stage.setInteractive(!reading);
  }, [stage, reading]);

  const openObject = (id: string) => {
    switch (id) {
      case 'letter':
        if (step === 'BENEFACTOR_LETTER') setReading(true);
        else setInspect('letter');
        break;
      case 'candle':
      case 'mirror':
      case 'clock':
      case 'papers':
      case 'pouch':
        setInspect(id);
        break;
      case 'journal':
        go('journal');
        break;
      case 'chalice':
        go('ascension');
        break;
      case 'board':
        go('board');
        break;
      case 'stairs':
        go(step === 'POTION_CHOICE' ? 'prologue' : 'cherwood');
        break;
    }
  };

  useStageEvents((e) => {
    if (e.type === 'hover') setHover(e.id);
    if (e.type === 'select') {
      if (inPrologue && e.id !== objective?.hotspot && e.id !== 'candle' && e.id !== 'mirror') return;
      openObject(e.id);
    }
  });

  const resolveDilemma = async (choice: 'PRUDENCE' | 'CURIOSITY') => {
    if (!characterId) return;
    setBusy(true);
    try {
      const res = await api.prologueDilemma(characterId, choice);
      setDilemmaResult(res.narrativeOutcome);
      saved();
      await refresh();
    } catch (err) {
      fail(err);
    } finally {
      setBusy(false);
    }
  };

  if (!snapshot) return null;
  const slot = snapshot.character.current_slot ?? 3;
  const hoverSpot = hover ? desvanSpec.hotspots.find((h) => h.id === hover) : null;
  const objectiveSpot = objective?.hotspot ? desvanSpec.hotspots.find((h) => h.id === objective.hotspot) : null;
  const letterText = serverLetter ?? (characterId ? rememberedLetter(characterId) : null);
  const objectiveIcon = {
    letter: <IconLetterOpener size={30} />,
    city: <IconPin size={28} />,
    chalice: <IconChalice size={28} />,
    seal: <IconSeal size={28} />
  };

  return (
    <>
      <HotspotKeys spots={desvanSpec.hotspots} onOpen={openObject} />
      <Cartouche title="EL DESVÁN" subtitle={`${districtLabel(snapshot.character.current_location)} · ${SLOT_LABEL[slot]}`} />

      {hoverSpot && !inspect && !reading && <HoverTag at={hoverSpot.anchor ?? centroid(hoverSpot.shape)} label={hoverSpot.label} />}

      {/* objetivos sobre siluetas sin contorno: un rombo clavado en la lámina los señala */}
      {objectiveSpot && objectiveSpot.glow === false && !inspect && !reading && hover !== objectiveSpot.id && (
        <Marker at={objectiveSpot.anchor ?? centroid(objectiveSpot.shape)} label={objectiveSpot.label} onClick={() => openObject(objectiveSpot.id)} />
      )}

      {!inspect && !reading && objective && (
        <ObjectiveCard
          title={objective.title}
          action={objective.action}
          icon={objectiveIcon[objective.icon]}
          onClick={objective.hotspot ? () => openObject(objective.hotspot!) : undefined}
        />
      )}

      {inspect === 'candle' && <CandlePanel snapshot={snapshot} onClose={() => setInspect(null)} />}
      {inspect === 'mirror' && <MirrorPanel snapshot={snapshot} onClose={() => setInspect(null)} onJournal={() => go('journal')} />}
      {inspect === 'clock' && <CalendarPanel snapshot={snapshot} onClose={() => setInspect(null)} />}
      {inspect === 'papers' && <IdentityPanel snapshot={snapshot} onClose={() => setInspect(null)} />}
      {inspect === 'pouch' && <WalletPanel snapshot={snapshot} onClose={() => setInspect(null)} />}
      {inspect === 'letter' && <CorrespondencePanel snapshot={snapshot} onClose={() => setInspect(null)} />}

      {reading && (
        <LetterReader
          signature={undefined}
          footer={
            dilemmaResult ? (
              <div className="letter__footer letter__footer--single">
                <GoldButton primary onClick={() => { setReading(false); setDilemmaResult(null); }}>Dejar la carta sobre la mesa</GoldButton>
              </div>
            ) : (
              <div className="letter__footer">
                <GoldButton busy={busy} onClick={() => resolveDilemma('PRUDENCE')}>Guardarla y cumplir antes con tu vida</GoldButton>
                <GoldButton busy={busy} primary onClick={() => resolveDilemma('CURIOSITY')}>Romper el lacre y memorizarla</GoldButton>
              </div>
            )
          }
        >
          {dilemmaResult ? (
            <p>{dilemmaResult}</p>
          ) : letterText ? (
            <LetterText text={letterText} />
          ) : (
            <p>Rompes el sobre…</p>
          )}
        </LetterReader>
      )}

      {!reading && (
        <BottomNav
          onDiary={() => (inPrologue ? undefined : go('journal'))}
          onCity={() => go(step === 'POTION_CHOICE' ? 'prologue' : inPrologue ? 'desvan' : 'cherwood')}
          onSettings={() => openSettings(true)}
        />
      )}
      {!reading && <SaveBadge savedAt={lastSavedAt} />}
    </>
  );
}
