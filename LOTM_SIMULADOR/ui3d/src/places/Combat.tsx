import { useCallback, useEffect, useMemo, useState } from 'react';
import { ApiError, api } from '../api/client';
import type { BattleActor, BattleEnvelope, CombatActionResult, CombatSkill } from '../api/types';
import { assetUrl } from '../assets';
import { Cell, GridActor, TacticalGrid } from '../engine/combat';
import { useAttached, usePlace, useStage, useStageEvents } from '../engine/react';
import type { Vec2 } from '../engine/types';
import { Divider, Gilt } from '../hud/kit/Gilt';
import { Cartouche, GoldButton, Panel } from '../hud/kit/components';
import { Prose } from '../hud/kit/cards';
import { IconBoot, IconEye, IconFlee, IconHourglass, IconPistols } from '../hud/kit/icons';
import { useSession } from '../session/store';
import { cleanNarration, skillLabel } from './prose';
import { GRID_CORNERS, alleySpec } from './specs/streets';

type Mode = 'move' | 'attack' | null;
const COLS = 7;
const ROWS = 5;

/** Estado del adversario tal como lo percibe el personaje: nunca la cifra oculta. */
function enemyCondition(e: BattleActor): string {
  const r = e.maxHp > 0 ? e.currentHp / e.maxHp : 1;
  if (r > 0.66) return 'Firme sobre sus pies';
  if (r > 0.33) return 'Herido, respira con dificultad';
  return 'Tambaleante, al borde';
}

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

  const grid = useAttached(() => (ready ? new TacticalGrid(COLS, ROWS, GRID_CORNERS) : null), [ready]);
  const player = useAttached(
    () => (grid && battle ? new GridActor(grid, [battle.player.position.x, battle.player.position.y], 'ally') : null),
    [grid, !!battle]
  );
  const enemy = useAttached(
    () => (grid && battle ? new GridActor(grid, [battle.enemy.position.x, battle.enemy.position.y], 'enemy') : null),
    [grid, !!battle]
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

  // casillas alcanzables: regla canónica del motor (adyacencia de distancia 1, nunca la del adversario)
  const reachable = useMemo(() => {
    if (!battle || mode !== 'move') return [] as Vec2[];
    const { x, y } = battle.player.position;
    const steps: Vec2[] = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    return steps
      .map(([dx, dy]) => [x + dx, y + dy] as Vec2)
      .filter(([nx, ny]) => nx >= 0 && ny >= 0 && nx < COLS && ny < ROWS && !(nx === battle.enemy.position.x && ny === battle.enemy.position.y));
  }, [battle, mode]);

  useEffect(() => {
    if (!grid || !battle) return;
    grid.clear();
    for (const [x, y] of reachable) grid.setCell(x, y, Cell.reach);
    if (mode === 'attack') grid.setCell(battle.enemy.position.x, battle.enemy.position.y, Cell.target);
    if (hoverCell && reachable.some(([x, y]) => x === hoverCell[0] && y === hoverCell[1])) grid.setCell(hoverCell[0], hoverCell[1], Cell.hover);
    grid.commit();
  }, [grid, battle, reachable, hoverCell, mode]);

  useStageEvents((e) => {
    if (!grid) return;
    if (e.type === 'move') {
      const c = grid.cellAt([e.x, e.y]);
      setHoverCell(c);
      stage?.setCursor(!!c && reachable.some(([x, y]) => x === c[0] && y === c[1]));
    }
    if (e.type === 'plate' && mode === 'move') {
      const c = grid.cellAt([e.x, e.y]);
      if (c && reachable.some(([x, y]) => x === c[0] && y === c[1])) act('MOVE', { targetPosition: { x: c[0], y: c[1] } });
    }
  });

  const act = async (actionType: 'SKILL' | 'MOVE' | 'SCRUTINIZE' | 'NEGOTIATE' | 'FLEE' | 'END_TURN', extra: { skillId?: string; targetPosition?: { x: number; y: number } } = {}) => {
    if (!characterId || !battle) return;
    setBusy(actionType + (extra.skillId ?? ''));
    try {
      const res = await api.combatAction(characterId, actionType, extra);
      saved();
      // el desplazamiento se ve en la rejilla; el resto se narra sin las marcas técnicas del motor
      const lines = (actionType === 'MOVE'
        ? []
        : [res.playerResult?.message, res.enemyResult?.message, actionType === 'SKILL' || actionType === 'END_TURN' ? undefined : res.message]
      ).filter(Boolean).map((l) => cleanNarration(l as string));
      if ((res.playerResult?.damageDealt ?? 0) > 0) enemy?.hit();
      if ((res.enemyResult?.damageDealt ?? 0) > 0) {
        player?.hit();
        if (stage) {
          stage.uDanger.value = 0.9;
          window.setTimeout(() => stage && (stage.uDanger.value = 0), 450);
        }
      }
      setNarration(lines.length || actionType === 'MOVE' ? lines : [cleanNarration(res.message)]);
      setMode(null);
      if (res.battleOver) {
        setOver(res);
        await refresh();
      } else if (res.player && res.enemy) {
        setBattle((b) => (b ? { ...b, player: res.player!, enemy: res.enemy!, availableSkills: res.availableSkills ?? b.availableSkills } : b));
      } else {
        await load();
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
      const res = await api.startBattle(characterId, { ambushMode: 'NEUTRAL' });
      setBattle(res);
      setNarration([cleanNarration(res.message)]);
      saved();
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
  const revealed = p?.revealedAbilities ?? [];

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

      {e && (
        <Panel className="slide-in-right" style={{ right: 40, top: 78, width: 302, padding: '26px 22px 20px' }} label="Objetivo seleccionado">
          <p className="t-body" style={{ margin: 0, fontSize: 27, textAlign: 'center' }}>Objetivo seleccionado</p>
          <Divider width="90%" style={{ margin: '8px auto 14px' }} />
          <div style={{ display: 'grid', gridTemplateColumns: '86px 1fr', gap: 16, alignItems: 'center' }}>
            <div className="target-portrait" style={portrait ? { backgroundImage: `url(${portrait})` } : { backgroundImage: `url(${plate})`, backgroundSize: '2200% auto', backgroundPosition: '73% 12%' }} />
            <div className="t-body" style={{ fontSize: 20, lineHeight: 1.2 }}>
              {revealed.length === 0 ? 'Información incompleta' : e.name}
              <div style={{ fontSize: 16, fontStyle: 'italic', color: 'var(--ivory-dim)', marginTop: 4 }}>{enemyCondition(e)}</div>
            </div>
          </div>
          {revealed.length > 0 && (
            <div style={{ marginTop: 12, fontSize: 16, color: 'var(--ivory-dim)' }}>Le conoces {new Intl.ListFormat('es', { type: 'conjunction' }).format(revealed.map(skillLabel))}.</div>
          )}
        </Panel>
      )}

      {p && (
        <div className="vigor" aria-label="Tu estado">
          <Thread label="Vigor" value={p.currentHp} max={p.maxHp} color="var(--crimson-hi)" />
          <Thread label="Espiritualidad" value={p.currentSpirituality} max={p.maxSpirituality} color="#9a82d0" />
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
          <Prose size={21}>Alguien aguarda al fondo del callejón, entre las cajas y la verja. No se aparta.</Prose>
          <div style={{ display: 'grid', gap: 14, marginTop: 10 }}>
            <GoldButton primary busy={busy === 'start'} onClick={start}>Plantarle cara</GoldButton>
            <GoldButton onClick={() => go('cherwood')}>Dar media vuelta</GoldButton>
          </div>
        </Panel>
      )}

      {over && (
        <Panel className="slide-in-right" style={{ right: 40, top: 360, width: 460, padding: '32px 32px 28px' }} label="Desenlace">
          <h2 className="t-display" style={{ margin: 0, fontSize: 30 }}>{over.victory ? 'El callejón es tuyo' : over.status === 'FLED' ? 'La niebla te cubre' : 'La oscuridad te reclama'}</h2>
          <Divider style={{ margin: '12px 0 18px' }} />
          <Prose size={21}>{cleanNarration(over.message)}</Prose>
          <GoldButton primary onClick={() => go(over.victory || over.status === 'FLED' ? 'cherwood' : 'desvan')}>Salir del callejón</GoldButton>
        </Panel>
      )}

      {mode === 'attack' && battle && (
        <SkillMenu skills={battle.availableSkills} busy={busy} spirit={p?.currentSpirituality ?? 0} onSkill={(s) => act('SKILL', { skillId: s.id })} onParley={() => act('NEGOTIATE')} />
      )}

      {battle && !over && (
        <nav className="action-bar fade-in" aria-label="Acciones de combate">
          <svg className="gilt" width="1024" height="80" viewBox="0 0 1024 80" aria-hidden="true">
            <path d="M8 1 H1016 L1023 8 V72 L1016 79 H8 L1 72 V8 Z" fill="rgba(14,11,9,0.9)" stroke="var(--gold)" strokeWidth="1.1" />
            {[258, 514, 770].map((x) => <line key={x} x1={x} y1="12" x2={x} y2="68" stroke="var(--gold)" strokeOpacity="0.45" />)}
          </svg>
          <ActionButton label="Mover" icon={<IconBoot size={34} />} active={mode === 'move'} disabled={!!busy || (p?.ap ?? 0) < 1} onClick={() => setMode(mode === 'move' ? null : 'move')} />
          <ActionButton label="Atacar" icon={<IconPistols size={34} />} active={mode === 'attack'} disabled={!!busy} onClick={() => setMode(mode === 'attack' ? null : 'attack')} />
          <ActionButton label="Observar" icon={<IconEye size={34} />} busy={busy === 'SCRUTINIZE'} disabled={!!busy || (p?.ap ?? 0) < 1} onClick={() => act('SCRUTINIZE')} />
          <ActionButton label="Huir" icon={<IconFlee size={34} />} busy={busy === 'FLEE'} disabled={!!busy} onClick={() => act('FLEE')} />
        </nav>
      )}
      {/* casillas alcanzables para teclado y lector (la rejilla avanza hacia el fondo del callejón: +x) */}
      {mode === 'move' && battle && (
        <nav className="hotspot-keys" aria-label="Casillas alcanzables">
          {reachable.map(([x, y]) => (
            <button
              key={`${x},${y}`}
              type="button"
              onFocus={() => setHoverCell([x, y])}
              onBlur={() => setHoverCell(null)}
              onClick={() => act('MOVE', { targetPosition: { x, y } })}
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

/** paso de una casilla descrito desde el personaje, que mira hacia el fondo del callejón (+x) */
function stepLabel(dx: number, dy: number): string {
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

function SkillMenu({ skills, busy, spirit, onSkill, onParley }: { skills: CombatSkill[]; busy: string | null; spirit: number; onSkill: (s: CombatSkill) => void; onParley: () => void }) {
  return (
    <Panel className="fade-in" style={{ left: 530, bottom: 118, width: 520, padding: '22px 22px 18px' }} label="Habilidades">
      <div style={{ display: 'grid', gap: 10 }}>
        {skills.map((s) => (
          <GoldButton key={s.id} align="start" busy={busy === 'SKILL' + s.id} disabled={!!busy || s.spiritualityCost > spirit} onClick={() => onSkill(s)} style={{ minHeight: 60, fontSize: 20, padding: '8px 18px' }}>
            <span style={{ display: 'block', textAlign: 'left' }}>
              {s.name}
              <span style={{ display: 'block', fontSize: 15, fontStyle: 'italic', color: 'var(--ivory-dim)' }}>
                {s.description}{s.spiritualityCost > 0 ? ` · Espiritualidad ${s.spiritualityCost}` : ''}
              </span>
            </span>
          </GoldButton>
        ))}
        <GoldButton align="start" busy={busy === 'NEGOTIATE'} disabled={!!busy} onClick={onParley} style={{ minHeight: 54, fontSize: 20 }}>
          Parlamentar
        </GoldButton>
      </div>
    </Panel>
  );
}
