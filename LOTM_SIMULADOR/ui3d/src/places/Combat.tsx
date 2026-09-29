import { useCallback, useEffect, useMemo, useState } from 'react';
import { ApiError, api } from '../api/client';
import type { BattleEnemy, BattleEnvelope, CombatActionResult, CombatSkill, Quality } from '../api/types';
import { assetUrl } from '../assets';
import { Cell, GridActor, TacticalGrid } from '../engine/combat';
import { useAttached, usePlace, useStage, useStageEvents } from '../engine/react';
import type { Vec2 } from '../engine/types';
import { Divider, Gilt } from '../hud/kit/Gilt';
import { Cartouche, GoldButton, Panel } from '../hud/kit/components';
import { Prose } from '../hud/kit/cards';
import { IconBoot, IconEye, IconFlee, IconHourglass, IconPistols } from '../hud/kit/icons';
import { formatMoney, useSession } from '../session/store';
import { cleanNarration } from './prose';
import { GRID_CORNERS, alleySpec } from './specs/streets';

/** modo de selección sobre la rejilla: moverse una casilla o elegir destino de una técnica de desplazamiento */
type Mode = { kind: 'move' } | { kind: 'cell'; skill: CombatSkill } | { kind: 'attack' } | null;
type ActionType = 'SKILL' | 'MOVE' | 'SCRUTINIZE' | 'NEGOTIATE' | 'FLEE' | 'END_TURN';

const CONDITION: Record<BattleEnemy['condition'], string> = {
  FIRM: 'Firme sobre sus pies',
  WOUNDED: 'Herido, respira con dificultad',
  FALTERING: 'Tambaleante, al borde'
};
/** estado de lo cosechado, sin concordancia de género ni número con el objeto */
const QUALITY: Record<Quality, string> = { PRISTINE: 'en perfecto estado', DAMAGED: 'con desperfectos', CONTAMINATED: 'tocado por la corrupción' };

const manhattan = (a: { x: number; y: number }, b: { x: number; y: number }) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

export function Combat() {
  const { characterId, go, refresh, saved, fail } = useSession();
  const { ready } = usePlace(alleySpec);
  const stage = useStage();
  const [battle, setBattle] = useState<BattleEnvelope | null | undefined>(undefined);
  const [mode, setMode] = useState<Mode>(null);
  const [hoverCell, setHoverCell] = useState<Vec2 | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [narration, setNarration] = useState<string[]>([]);
  const [over, setOver] = useState<CombatActionResult | null>(null);

  const load = useCallback(async () => {
    if (!characterId) return;
    try {
      setBattle(await api.activeBattle(characterId));
    } catch (err) {
      fail(err);
      setBattle(null);
    }
  }, [characterId, fail]);

  useEffect(() => {
    load();
  }, [load]);

  const cols = battle?.grid.width ?? 7;
  const rows = battle?.grid.height ?? 5;
  const grid = useAttached(() => (ready ? new TacticalGrid(cols, rows, GRID_CORNERS) : null), [ready, cols, rows]);
  const player = useAttached(
    () => (grid && battle ? new GridActor(grid, [battle.player.position.x, battle.player.position.y], 'ally') : null),
    [grid, battle?.battleId]
  );
  const enemy = useAttached(
    () => (grid && battle ? new GridActor(grid, [battle.enemy.position.x, battle.enemy.position.y], 'enemy') : null),
    [grid, battle?.battleId]
  );

  // figuras recortadas cuando exista el arte (la lámina limpia ya no las trae pintadas)
  useEffect(() => {
    if (!stage || !player || !enemy || stage.provisional) return;
    const p = assetUrl('art/actor_player.webp');
    const e = assetUrl('art/actor_enemy.webp');
    if (p) stage.texture(p).then((t) => player.setFigure(t, 3.1));
    if (e) stage.texture(e).then((t) => enemy.setFigure(t, 2.9));
  }, [stage, player, enemy]);

  useEffect(() => {
    if (!battle) return;
    player?.moveTo([battle.player.position.x, battle.player.position.y]);
    enemy?.moveTo([battle.enemy.position.x, battle.enemy.position.y]);
  }, [battle, player, enemy]);

  // casillas elegibles: la regla la valida el motor; aquí sólo se señalan (adyacentes para mover, alcance para técnicas)
  const reachable = useMemo(() => {
    if (!battle || !mode || mode.kind === 'attack') return [] as Vec2[];
    const { position: from } = battle.player;
    const range = mode.kind === 'move' ? 1 : mode.skill.range;
    const out: Vec2[] = [];
    for (let x = 0; x < cols; x++) {
      for (let y = 0; y < rows; y++) {
        const d = manhattan(from, { x, y });
        const free = !(x === battle.enemy.position.x && y === battle.enemy.position.y);
        if (d >= 1 && d <= range && free) out.push([x, y]);
      }
    }
    return out;
  }, [battle, mode, cols, rows]);

  useEffect(() => {
    if (!grid || !battle) return;
    grid.clear();
    for (const [x, y] of reachable) grid.setCell(x, y, Cell.reach);
    if (mode?.kind === 'attack') grid.setCell(battle.enemy.position.x, battle.enemy.position.y, Cell.target);
    if (hoverCell && reachable.some(([x, y]) => x === hoverCell[0] && y === hoverCell[1])) grid.setCell(hoverCell[0], hoverCell[1], Cell.hover);
    grid.commit();
  }, [grid, battle, reachable, hoverCell, mode]);

  const pickCell = (x: number, y: number) => {
    if (!mode || mode.kind === 'attack') return;
    if (mode.kind === 'move') act('MOVE', { targetPosition: { x, y } });
    else act('SKILL', { skillId: mode.skill.id, targetPosition: { x, y } });
  };

  useStageEvents((e) => {
    if (!grid) return;
    if (e.type === 'move') {
      const c = grid.cellAt([e.x, e.y]);
      setHoverCell(c);
      stage?.setCursor(!!c && reachable.some(([x, y]) => x === c[0] && y === c[1]));
    }
    if (e.type === 'plate') {
      const c = grid.cellAt([e.x, e.y]);
      if (c && reachable.some(([x, y]) => x === c[0] && y === c[1])) pickCell(c[0], c[1]);
    }
  });

  const flashDanger = () => {
    if (!stage) return;
    stage.uDanger.value = 0.9;
    window.setTimeout(() => stage && (stage.uDanger.value = 0), 450);
  };

  const act = async (actionType: ActionType, extra: { skillId?: string; targetPosition?: { x: number; y: number } } = {}) => {
    if (!characterId || !battle) return;
    setBusy(actionType + (extra.skillId ?? ''));
    try {
      const res = await api.combatAction(characterId, actionType, extra);
      saved();
      const skill = battle.availableSkills.find((s) => s.id === extra.skillId);
      if (actionType === 'SKILL' && skill?.targetType === 'SINGLE_ENEMY') enemy?.hit();
      if (res.player.hp < battle.player.hp) {
        player?.hit();
        flashDanger();
      }
      // el desplazamiento propio se ve en la rejilla; lo demás se narra en prosa
      const lines = res.messages.filter((_l, i) => !(actionType === 'MOVE' && i === 0)).map(cleanNarration);
      setNarration(lines);
      setMode(null);
      setBattle(res);
      if (res.battleOver) {
        setOver(res);
        await refresh();
      }
    } catch (err) {
      // una negativa de las reglas (huida imposible, parlamento frustrado…) es parte de la escena, no un fallo
      if (err instanceof ApiError && err.status === 422) {
        setNarration([cleanNarration(err.message)]);
        setMode(null);
      } else fail(err);
    } finally {
      setBusy(null);
    }
  };

  const start = async () => {
    if (!characterId) return;
    setBusy('start');
    try {
      const res = await api.startBattle(characterId);
      setBattle(res);
      setNarration((res.messages ?? []).map(cleanNarration));
      saved();
      if (res.outcome !== undefined && res.status !== 'ONGOING') {
        setOver({ ...res, battleOver: true, victory: false, messages: res.messages ?? [] });
        await refresh();
      }
    } catch (err) {
      fail(err);
    } finally {
      setBusy(null);
    }
  };

  useEffect(() => {
    return () => {
      if (stage) stage.uDanger.value = 0;
    };
  }, [stage]);

  const p = battle?.player;
  const e = battle?.enemy;
  const portrait = assetUrl('art/actor_enemy_portrait.webp');
  const plate = assetUrl(alleySpec.plate.clean) ?? assetUrl(alleySpec.plate.atlas);
  const known = e?.knownAbilities ?? [];
  const distance = p && e ? manhattan(p.position, e.position) : 0;

  return (
    <>
      <Cartouche title="ENCUENTRO EN EL CALLEJÓN" subtitle={battle ? (over ? 'Silencio' : 'Tu turno') : 'La niebla se espesa'} subtitleInside width={437} />
      {p && !over && (
        <div className="ap-pips" aria-label={`Puntos de acción: ${p.ap} de ${p.maxAp}`}>
          {Array.from({ length: Math.max(p.maxAp, p.ap) }, (_, i) => (
            <span key={i} className={i < p.ap ? 'is-on' : ''} />
          ))}
        </div>
      )}

      {e && !over && (
        <Panel className="slide-in-right" style={{ right: 40, top: 78, width: 302, padding: '26px 22px 20px' }} label="Objetivo seleccionado">
          <p className="t-body" style={{ margin: 0, fontSize: 27, textAlign: 'center' }}>Objetivo seleccionado</p>
          <Divider width="90%" style={{ margin: '8px auto 14px' }} />
          <div style={{ display: 'grid', gridTemplateColumns: '86px 1fr', gap: 16, alignItems: 'center' }}>
            <div className="target-portrait" style={portrait ? { backgroundImage: `url(${portrait})` } : { backgroundImage: `url(${plate})`, backgroundSize: '2200% auto', backgroundPosition: '73% 12%' }} />
            <div className="t-body" style={{ fontSize: 20, lineHeight: 1.2 }}>
              {e.name}
              <div style={{ fontSize: 16, fontStyle: 'italic', color: 'var(--ivory-dim)', marginTop: 4 }}>{CONDITION[e.condition]}</div>
            </div>
          </div>
          <div style={{ marginTop: 12, fontSize: 16, color: 'var(--ivory-dim)' }}>
            {known.length > 0
              ? <>Le conoces {new Intl.ListFormat('es', { type: 'conjunction' }).format(known.map((k) => k.name.toLowerCase()))}.</>
              : 'Aún no sabes de qué es capaz.'}
          </div>
        </Panel>
      )}

      {p && (
        <div className="vigor" aria-label="Tu estado">
          <Thread label="Vigor" value={p.hp} max={p.maxHp} color="var(--crimson-hi)" />
          <Thread label="Espiritualidad" value={p.spirituality} max={p.maxSpirituality} color="#9a82d0" />
        </div>
      )}

      {narration.length > 0 && !over && (
        <div className="narration fade-in" key={narration.join('|')}>
          {narration.map((l, i) => <p key={i}>{l}</p>)}
        </div>
      )}

      {battle === null && (
        <Panel className="slide-in-right" style={{ right: 40, top: 78, width: 420, padding: '32px 32px 28px' }} label="Encuentro">
          <h2 className="t-display" style={{ margin: 0, fontSize: 30 }}>Una figura en la niebla</h2>
          <Divider style={{ margin: '12px 0 18px' }} />
          <Prose size={21}>Algo aguarda al fondo del callejón, entre las cajas y la verja. No se aparta.</Prose>
          <div style={{ display: 'grid', gap: 14, marginTop: 10 }}>
            <GoldButton primary busy={busy === 'start'} onClick={start}>Plantarle cara</GoldButton>
            <GoldButton onClick={() => go('cherwood')}>Dar media vuelta</GoldButton>
          </div>
        </Panel>
      )}

      {over && <Outcome res={over} onLeave={() => go(over.status === 'DEFEAT' ? 'desvan' : 'cherwood')} />}

      {mode?.kind === 'attack' && battle && p && (
        <SkillMenu
          skills={battle.availableSkills}
          busy={busy}
          ap={p.ap}
          spirit={p.spirituality}
          distance={distance}
          onSkill={(s) => (s.targetType === 'GRID_CELL' ? setMode({ kind: 'cell', skill: s }) : act('SKILL', { skillId: s.id }))}
          onParley={() => act('NEGOTIATE')}
        />
      )}

      {battle && !over && (
        <nav className="action-bar fade-in" aria-label="Acciones de combate">
          <svg className="gilt" width="1024" height="80" viewBox="0 0 1024 80" aria-hidden="true">
            <path d="M8 1 H1016 L1023 8 V72 L1016 79 H8 L1 72 V8 Z" fill="rgba(14,11,9,0.9)" stroke="var(--gold)" strokeWidth="1.1" />
            {[258, 514, 770].map((x) => <line key={x} x1={x} y1="12" x2={x} y2="68" stroke="var(--gold)" strokeOpacity="0.45" />)}
          </svg>
          <ActionButton label="Mover" icon={<IconBoot size={34} />} active={mode?.kind === 'move'} disabled={!!busy || (p?.ap ?? 0) < 1} onClick={() => setMode(mode?.kind === 'move' ? null : { kind: 'move' })} />
          <ActionButton label="Atacar" icon={<IconPistols size={34} />} active={mode?.kind === 'attack' || mode?.kind === 'cell'} disabled={!!busy} onClick={() => setMode(mode ? null : { kind: 'attack' })} />
          <ActionButton label="Observar" icon={<IconEye size={34} />} busy={busy === 'SCRUTINIZE'} disabled={!!busy || (p?.ap ?? 0) < 1} onClick={() => act('SCRUTINIZE')} />
          <ActionButton label="Huir" icon={<IconFlee size={34} />} busy={busy === 'FLEE'} disabled={!!busy} onClick={() => act('FLEE')} />
        </nav>
      )}

      {/* casillas elegibles para teclado y lector (la rejilla avanza hacia el fondo del callejón: +x) */}
      {battle && mode && mode.kind !== 'attack' && (
        <nav className="hotspot-keys" aria-label="Casillas alcanzables">
          {reachable.map(([x, y]) => (
            <button
              key={`${x},${y}`}
              type="button"
              onFocus={() => setHoverCell([x, y])}
              onBlur={() => setHoverCell(null)}
              onClick={() => pickCell(x, y)}
            >
              {stepLabel(x - battle.player.position.x, y - battle.player.position.y)}
            </button>
          ))}
        </nav>
      )}

      {battle && !over && (
        <div className="end-turn fade-in">
          <GoldButton icon={<IconHourglass />} busy={busy === 'END_TURN'} disabled={!!busy} onClick={() => act('END_TURN')} style={{ width: 354, minHeight: 78, fontSize: 27 }}>
            Terminar turno
          </GoldButton>
        </div>
      )}
    </>
  );
}

/** Desenlace: lo que dice el motor y lo que te llevas (cosecha y bolsa, si las hay). */
function Outcome({ res, onLeave }: { res: CombatActionResult; onLeave: () => void }) {
  const title = res.status === 'VICTORY' ? 'El callejón es tuyo'
    : res.status === 'NEGOTIATED' ? 'Se retira entre la niebla'
    : res.status === 'FLED' ? 'La niebla te cubre'
    : 'La oscuridad te reclama';
  const loot = res.outcome;
  return (
    <Panel className="slide-in-right" style={{ right: 40, top: 360, width: 460, padding: '32px 32px 28px' }} label="Desenlace">
      <h2 className="t-display" style={{ margin: 0, fontSize: 30 }}>{title}</h2>
      <Divider style={{ margin: '12px 0 18px' }} />
      {res.messages.slice(-1).map((m, i) => <Prose key={i} size={20}>{cleanNarration(m)}</Prose>)}
      {loot?.harvest && <Prose size={20}>Te llevas {loot.harvest.name.toLowerCase()} ({QUALITY[loot.harvest.quality]}).</Prose>}
      {!!loot?.pursePence && <Prose size={20}>En sus restos encuentras {formatMoney(loot.pursePence)}.</Prose>}
      {res.status === 'DEFEAT' && <Prose size={19} dim>Despiertas horas después en tu buhardilla, magullado y con la mente en jirones.</Prose>}
      <GoldButton primary onClick={onLeave}>{res.status === 'DEFEAT' ? 'Despertar' : 'Salir del callejón'}</GoldButton>
    </Panel>
  );
}

/** paso de una casilla descrito desde el personaje, que mira hacia el fondo del callejón (+x) */
function stepLabel(dx: number, dy: number): string {
  if (Math.abs(dx) + Math.abs(dy) > 1) return `Casilla a ${Math.abs(dx) + Math.abs(dy)} pasos`;
  if (dx > 0) return 'Avanzar hacia el fondo del callejón';
  if (dx < 0) return 'Retroceder';
  return dy < 0 ? 'Paso a la izquierda, hacia el muro' : 'Paso a la derecha';
}

function Thread({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const r = max > 0 ? Math.max(0, Math.min(1, value / max)) : 0;
  return (
    <div className="thread">
      <span>{label}</span>
      <span className="thread__line"><span style={{ width: `${r * 100}%`, background: color }} /></span>
      <span className="thread__num">{Math.round(value)}</span>
    </div>
  );
}

function ActionButton({ label, icon, active, disabled, busy, onClick }: { label: string; icon: React.ReactNode; active?: boolean; disabled?: boolean; busy?: boolean; onClick: () => void }) {
  return (
    <button type="button" className="action" aria-pressed={active} disabled={disabled} aria-busy={busy || undefined} onClick={onClick}>
      {active && <Gilt variant="button" glow />}
      <span className="action__icon">{icon}</span>
      <span>{label}</span>
    </button>
  );
}

function SkillMenu({ skills, busy, ap, spirit, distance, onSkill, onParley }: {
  skills: CombatSkill[]; busy: string | null; ap: number; spirit: number; distance: number;
  onSkill: (s: CombatSkill) => void; onParley: () => void;
}) {
  return (
    <Panel className="fade-in" style={{ left: 530, bottom: 118, width: 560, padding: '22px 22px 18px' }} label="Habilidades">
      <div style={{ display: 'grid', gap: 10 }}>
        {skills.map((s) => {
          const outOfRange = s.targetType === 'SINGLE_ENEMY' && distance > s.range;
          const cost = [
            s.apCost > 0 ? `${s.apCost} PA` : null,
            s.spiritualityCost > 0 ? `espiritualidad ${s.spiritualityCost}` : null,
            s.targetType === 'SELF' ? 'sobre ti' : `alcance ${s.range}`
          ].filter(Boolean).join(' · ');
          return (
            <GoldButton
              key={s.id}
              align="start"
              busy={busy === 'SKILL' + s.id}
              disabled={!!busy || s.apCost > ap || s.spiritualityCost > spirit || outOfRange}
              onClick={() => onSkill(s)}
              style={{ minHeight: 60, fontSize: 20, padding: '8px 18px' }}
            >
              <span style={{ display: 'block', textAlign: 'left' }}>
                {s.name}
                <span style={{ display: 'block', fontSize: 15, fontStyle: 'italic', color: 'var(--ivory-dim)' }}>
                  {s.description} · {cost}{outOfRange ? ' · fuera de alcance' : ''}
                </span>
              </span>
            </GoldButton>
          );
        })}
        <GoldButton align="start" busy={busy === 'NEGOTIATE'} disabled={!!busy} onClick={onParley} style={{ minHeight: 54, fontSize: 20 }}>
          Parlamentar
        </GoldButton>
      </div>
    </Panel>
  );
}
