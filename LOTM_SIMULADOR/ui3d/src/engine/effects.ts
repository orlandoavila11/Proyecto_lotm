import * as THREE from 'three/webgpu';
import {
  Fn, abs, clamp, dot, exp, float, fract, hash, instanceIndex, mix, mrt, mx_fractal_noise_float, mx_noise_float,
  pow, sin, smoothstep, time, uniform, uv, vec2, vec3, vec4, positionLocal, length
} from 'three/tsl';
import { PLATE_H, type Vec2 } from './types';

/**
 * Efectos vivos que se superponen a la lámina. Todos viven en coordenadas de lámina (convertidas a mundo)
 * y se dibujan con mezcla aditiva para que el bloom los recoja como fuentes de luz reales.
 */
export interface Effect {
  readonly object: THREE.Object3D;
  /** 0..1, lo gobierna la transición entre lugares */
  setOpacity(v: number): void;
  update?(elapsed: number, dt: number): void;
  dispose(): void;
}

/** viento del puntero: las llamas se inclinan al mover rápido el ratón (-1..1) */
export const uWind = uniform(0);

/** lámina (y hacia abajo) → mundo (y hacia arriba) */
export const toWorld = ([x, y]: Vec2, z = 0) => new THREE.Vector3(x, PLATE_H - y, z);

function additive(material: THREE.NodeMaterial) {
  material.transparent = true;
  material.depthWrite = false;
  material.depthTest = false;
  material.blending = THREE.AdditiveBlending;
  return material;
}

/**
 * Bloom selectivo (Stage): el material es fuente de luz; su luminancia × k se escribe en el canal "glow".
 * Llamar después de asignar colorNode.
 */
export function emits<M extends THREE.NodeMaterial>(material: M, k = 1): M {
  const c = material.colorNode as unknown as ReturnType<typeof vec4>;
  const e = clamp(dot(c.rgb, vec3(0.2126, 0.7152, 0.0722)).mul(k), 0, 2);
  material.mrtNode = mrt({ glow: vec4(vec3(e), c.a) });
  return material;
}

/** superficie que tapa la luz de detrás (tarjeta, figura, mercancía) en proporción a su alfa */
export function occludes<M extends THREE.NodeMaterial>(material: M): M {
  const c = material.colorNode as unknown as ReturnType<typeof vec4>;
  material.mrtNode = mrt({ glow: vec4(0, 0, 0, c.a) });
  return material;
}

function disposeMesh(m: THREE.Mesh | THREE.Points) {
  m.geometry.dispose();
  (m.material as THREE.Material).dispose();
}

// ─────────────────────────────────────────────────────────────────────────────────────────────
// LLAMA DE VELA
// ─────────────────────────────────────────────────────────────────────────────────────────────

export interface FlameOptions {
  /** base de la llama (punta del pábilo) en lámina */
  at: Vec2;
  /** altura en px de lámina */
  height: number;
  /** 1 = llama sana y alta; 0 = mortecina, azulada y nerviosa. Lo fija la cordura. */
  vigor?: number;
}

export class CandleFlame implements Effect {
  readonly object: THREE.Group;
  private readonly uOpacity = uniform(1);
  readonly uVigor = uniform(1);
  private readonly flame: THREE.Mesh;
  private readonly halo: THREE.Mesh;

  constructor(opts: FlameOptions) {
    this.object = new THREE.Group();
    this.uVigor.value = opts.vigor ?? 1;
    const h = opts.height;
    const w = h * 0.55;

    // — cuerpo de la llama: gota deformada por ruido que asciende
    const flameMat = additive(new THREE.MeshBasicNodeMaterial());
    const vigor = this.uVigor;
    flameMat.colorNode = Fn(() => {
      const p = uv().toVar(); // 0..1, y hacia arriba
      const t = time;
      const nerv = float(1).sub(vigor).mul(1.6).add(0.35);
      const sway = mx_noise_float(vec3(p.y.mul(2.2).sub(t.mul(2.4)), t.mul(0.7), 3.1)).mul(0.11).mul(p.y).mul(nerv);
      const lick = mx_noise_float(vec3(p.x.mul(5), p.y.mul(4).sub(t.mul(6.5)), 1.7)).mul(0.05).mul(p.y);
      const lean = uWind.mul(pow(p.y, 1.6)).mul(0.22);
      const x = p.x.sub(0.5).sub(sway).sub(lick).sub(lean);
      const y = p.y;
      // silueta en gota: ancha abajo, afilada arriba
      const heightMod = mix(float(0.52), float(1.0), vigor);
      const yy = y.div(heightMod);
      const width = pow(clamp(float(1).sub(yy), 0, 1), 1.35).mul(0.32).mul(smoothstep(0.0, 0.16, yy));
      const shape = smoothstep(width, width.mul(0.35), abs(x)).mul(smoothstep(1.02, 0.86, yy));
      const core = smoothstep(width.mul(0.55), 0, abs(x)).mul(smoothstep(0.62, 0.12, yy)).mul(smoothstep(0.02, 0.1, yy));
      const blueBase = smoothstep(0.24, 0.02, yy).mul(shape).mul(float(1.2).sub(vigor.mul(0.5)));
      const outer = vec3(1.0, 0.42, 0.07);
      const mid = vec3(1.0, 0.72, 0.28);
      const hot = vec3(1.0, 0.95, 0.82);
      const blue = vec3(0.25, 0.45, 1.0);
      const col = mix(outer, mid, smoothstep(0.1, 0.9, core)).mul(shape).toVar();
      col.assign(mix(col, hot, core.mul(0.85)));
      col.addAssign(blue.mul(blueBase).mul(0.7));
      const flick = mx_noise_float(vec3(t.mul(9), 0.5, 0.5)).mul(0.12).add(1);
      return vec4(col.mul(2.4).mul(flick).mul(this.uOpacity), 1);
    })();
    this.flame = new THREE.Mesh(new THREE.PlaneGeometry(w, h * 1.1), emits(flameMat, 1));
    this.flame.position.copy(toWorld(opts.at, 2)).add(new THREE.Vector3(0, h * 0.5, 0));
    this.flame.renderOrder = 20;

    // — halo esférico cálido alrededor de la llama
    const haloMat = additive(new THREE.MeshBasicNodeMaterial());
    haloMat.colorNode = Fn(() => {
      const d = length(uv().sub(0.5)).mul(2);
      const flick = mx_noise_float(vec3(time.mul(5.3), 1.3, 0.2)).mul(0.18).add(1);
      const a = exp(d.mul(d).mul(-5.5)).mul(0.33).add(exp(d.mul(-9)).mul(0.25));
      return vec4(vec3(1.0, 0.62, 0.26).mul(a).mul(flick).mul(vigor.mul(0.7).add(0.3)).mul(this.uOpacity), 1);
    })();
    this.halo = new THREE.Mesh(new THREE.PlaneGeometry(h * 5, h * 5), emits(haloMat, 1));
    this.halo.position.copy(toWorld(opts.at, 1)).add(new THREE.Vector3(0, h * 0.35, 0));
    this.halo.renderOrder = 19;

    this.object.add(this.halo, this.flame);
  }

  setOpacity(v: number) {
    this.uOpacity.value = v;
  }

  setVigor(v: number) {
    this.uVigor.value = v;
  }

  dispose() {
    disposeMesh(this.flame);
    disposeMesh(this.halo);
  }
}

// ─────────────────────────────────────────────────────────────────────────────────────────────
// HALO DE FAROL / LÁMPARA (parpadeo de gas)
// ─────────────────────────────────────────────────────────────────────────────────────────────

export class LampHalo implements Effect {
  readonly object: THREE.Mesh;
  private readonly uOpacity = uniform(1);

  constructor(at: Vec2, radius: number, color: readonly [number, number, number] = [1, 0.66, 0.3], strength = 0.5, seed = 0) {
    const mat = additive(new THREE.MeshBasicNodeMaterial());
    mat.colorNode = Fn(() => {
      const d = length(uv().sub(0.5)).mul(2);
      const gas = mx_noise_float(vec3(time.mul(3.1), float(seed), 0.4)).mul(0.1).add(1);
      const a = exp(d.mul(d).mul(-6)).mul(0.6).add(exp(d.mul(-10)).mul(0.4));
      return vec4(vec3(...color).mul(a).mul(strength).mul(gas).mul(this.uOpacity), 1);
    })();
    this.object = new THREE.Mesh(new THREE.PlaneGeometry(radius * 2, radius * 2), emits(mat, 1));
    this.object.position.copy(toWorld(at, 1));
    this.object.renderOrder = 18;
  }

  setOpacity(v: number) {
    this.uOpacity.value = v;
  }

  dispose() {
    disposeMesh(this.object);
  }
}

// ─────────────────────────────────────────────────────────────────────────────────────────────
// HAZ DE LUZ VOLUMÉTRICO (claraboya, ventana) + motas de polvo
// ─────────────────────────────────────────────────────────────────────────────────────────────

export interface BeamOptions {
  /** borde de entrada del haz (dos puntos sobre la ventana) */
  from: readonly [Vec2, Vec2];
  /** borde de llegada (dos puntos sobre el suelo o la mesa) */
  to: readonly [Vec2, Vec2];
  color?: readonly [number, number, number];
  strength?: number;
  dust?: number;
}

export class LightBeam implements Effect {
  readonly object: THREE.Group;
  private readonly uOpacity = uniform(1);
  private readonly beam: THREE.Mesh;
  private readonly dust?: THREE.Mesh;

  constructor(o: BeamOptions) {
    this.object = new THREE.Group();
    const color = o.color ?? [0.55, 0.68, 0.95];
    const strength = o.strength ?? 0.16;

    // cuadrilátero libre: uv.x recorre el ancho del haz, uv.y va de la ventana (1) al destino (0)
    const [a, b] = o.from;
    const [c, d] = o.to;
    const geo = new THREE.BufferGeometry();
    const P = [toWorld(a), toWorld(b), toWorld(d), toWorld(c)];
    geo.setAttribute('position', new THREE.Float32BufferAttribute(P.flatMap((v) => [v.x, v.y, 3]), 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute([0, 1, 1, 1, 1, 0, 0, 0], 2));
    geo.setIndex([0, 3, 2, 0, 2, 1]);

    const mat = additive(new THREE.MeshBasicNodeMaterial());
    mat.side = THREE.DoubleSide;
    mat.colorNode = Fn(() => {
      const p = uv();
      const edge = smoothstep(0, 0.28, p.x).mul(smoothstep(1, 0.72, p.x));
      const along = smoothstep(0, 0.55, p.y).mul(pow(p.y, 0.6));
      const shafts = mx_noise_float(vec3(p.x.mul(9), p.y.mul(0.6), time.mul(0.05))).mul(0.5).add(0.5);
      const drift = mx_fractal_noise_float(vec3(p.mul(vec2(3, 5)), time.mul(0.06)), 3, 2, 0.5).mul(0.5).add(0.6);
      const a2 = edge.mul(along).mul(shafts.mul(0.7).add(0.3)).mul(drift);
      return vec4(vec3(...color).mul(a2).mul(strength).mul(this.uOpacity), 1);
    })();
    this.beam = new THREE.Mesh(geo, emits(mat, 0.4));
    this.beam.renderOrder = 10;
    this.object.add(this.beam);

    // motas: partículas instanciadas que flotan dentro del haz y titilan al cruzar la luz
    const count = o.dust ?? 140;
    if (count > 0) {
      const dustGeo = new THREE.PlaneGeometry(1, 1);
      const dustMat = additive(new THREE.MeshBasicNodeMaterial());
      const seed = instanceIndex.toFloat();
      const r1 = hash(seed.add(1.3));
      const r2 = hash(seed.add(7.7));
      const r3 = hash(seed.add(13.1));
      // posición dentro del cuadrilátero por interpolación bilineal
      const u = fract(r1.add(mx_noise_float(vec3(r2.mul(9), time.mul(0.04), 1)).mul(0.25)));
      const v = fract(r2.add(time.mul(r3.mul(0.012).add(0.004))));
      const pA = vec2(P[0].x, P[0].y), pB = vec2(P[1].x, P[1].y), pC = vec2(P[2].x, P[2].y), pD = vec2(P[3].x, P[3].y);
      const top = mix(pA, pB, u);
      const bottom = mix(pD, pC, u);
      const pos = mix(bottom, top, v);
      const size = r3.mul(2.6).add(1.2);
      dustMat.positionNode = vec3(pos.add(positionLocal.xy.mul(size)), 4);
      dustMat.colorNode = Fn(() => {
        const dd = length(uv().sub(0.5)).mul(2);
        const soft = smoothstep(1, 0, dd);
        const tw = sin(time.mul(r1.mul(3).add(1)).add(r2.mul(40))).mul(0.5).add(0.5);
        const inBeam = smoothstep(0, 0.2, u).mul(smoothstep(1, 0.8, u)).mul(smoothstep(0, 0.3, v));
        return vec4(vec3(0.85, 0.88, 1).mul(soft).mul(tw.mul(0.8).add(0.2)).mul(inBeam).mul(0.9).mul(this.uOpacity), 1);
      })();
      this.dust = new THREE.InstancedMesh(dustGeo, emits(dustMat, 0.6), count);
      this.dust.frustumCulled = false;
      this.dust.renderOrder = 11;
      this.object.add(this.dust);
    }
  }

  setOpacity(v: number) {
    this.uOpacity.value = v;
  }

  dispose() {
    disposeMesh(this.beam);
    if (this.dust) disposeMesh(this.dust);
  }
}

// ─────────────────────────────────────────────────────────────────────────────────────────────
// LLUVIA (cortina de gotas en profundidad) — calles, callejón, ventanas lejanas
// ─────────────────────────────────────────────────────────────────────────────────────────────

export interface RainOptions {
  /** rectángulo de lámina [x, y, w, h] */
  rect: readonly [number, number, number, number];
  density?: number;
  strength?: number;
  /** inclinación del viento en px por px de caída */
  slant?: number;
  color?: readonly [number, number, number];
}

export class RainSheet implements Effect {
  readonly object: THREE.Mesh;
  private readonly uOpacity = uniform(1);
  readonly uDensity = uniform(1);

  constructor(o: RainOptions) {
    const [x, y, w, h] = o.rect;
    const slant = o.slant ?? 0.12;
    const color = o.color ?? [0.72, 0.78, 0.9];
    this.uDensity.value = o.density ?? 1;
    const mat = additive(new THREE.MeshBasicNodeMaterial());
    const aspect = w / h;
    mat.colorNode = Fn(() => {
      const p = uv().toVar();
      const acc = float(0).toVar();
      // tres capas a distinta escala = tres distancias
      const layers: [number, number, number][] = [[140, 1.9, 0.9], [90, 1.5, 0.6], [55, 1.15, 0.38]];
      for (const [cols, speed, weight] of layers) {
        const q = vec2(p.x.mul(aspect).add(p.y.mul(slant)), p.y);
        const colId = q.x.mul(cols).floor();
        const rnd = hash(colId.add(cols));
        const lanePos = fract(q.x.mul(cols)).sub(0.5).abs();
        const yy = fract(q.y.mul(1.4).add(time.mul(speed)).add(rnd.mul(13.7)));
        const len = rnd.mul(0.08).add(0.04);
        const drop = smoothstep(0.08, 0, lanePos).mul(smoothstep(0, len, yy)).mul(smoothstep(len.add(0.02), len, yy));
        const alive = smoothstep(float(1).sub(this.uDensity.mul(0.55)), 1, hash(colId.add(floorT(speed))));
        acc.addAssign(drop.mul(weight).mul(alive));
      }
      const fade = smoothstep(0, 0.12, p.y).mul(smoothstep(1, 0.9, p.y));
      return vec4(vec3(...color).mul(acc).mul(o.strength ?? 0.22).mul(fade).mul(this.uOpacity), 1);
    })();
    this.object = new THREE.Mesh(new THREE.PlaneGeometry(w, h), emits(mat, 0.25));
    this.object.position.copy(toWorld([x + w / 2, y + h / 2], 6));
    this.object.renderOrder = 30;
  }

  setOpacity(v: number) {
    this.uOpacity.value = v;
  }

  dispose() {
    disposeMesh(this.object);
  }
}

/** cambia la semilla de cada columna cada pocos segundos para que las gotas no se repitan */
function floorT(speed: number) {
  return time.mul(speed * 0.35).floor();
}

// ─────────────────────────────────────────────────────────────────────────────────────────────
// NIEBLA BAJA (callejón, calle): bancos de bruma que derivan lentamente
// ─────────────────────────────────────────────────────────────────────────────────────────────

export class FogBank implements Effect {
  readonly object: THREE.Mesh;
  private readonly uOpacity = uniform(1);

  constructor(rect: readonly [number, number, number, number], color: readonly [number, number, number] = [0.5, 0.58, 0.72], strength = 0.18, speed = 0.02) {
    const [x, y, w, h] = rect;
    const mat = additive(new THREE.MeshBasicNodeMaterial());
    mat.colorNode = Fn(() => {
      const p = uv();
      const n = mx_fractal_noise_float(vec3(p.mul(vec2(2.5, 1.4)).add(vec2(time.mul(speed), 0)), time.mul(0.03)), 4, 2, 0.5)
        .mul(0.5).add(0.5);
      const band = smoothstep(0, 0.35, p.y).mul(smoothstep(1, 0.55, p.y)).mul(smoothstep(0, 0.1, p.x)).mul(smoothstep(1, 0.9, p.x));
      return vec4(vec3(...color).mul(pow(n, 1.6)).mul(band).mul(strength).mul(this.uOpacity), 1);
    })();
    this.object = new THREE.Mesh(new THREE.PlaneGeometry(w, h), emits(mat, 0));
    this.object.position.copy(toWorld([x + w / 2, y + h / 2], 5));
    this.object.renderOrder = 25;
  }

  setOpacity(v: number) {
    this.uOpacity.value = v;
  }

  dispose() {
    disposeMesh(this.object);
  }
}

// ─────────────────────────────────────────────────────────────────────────────────────────────
// CHISPAS / ASCUAS que suben (chimenea, ritual)
// ─────────────────────────────────────────────────────────────────────────────────────────────

export class Embers implements Effect {
  readonly object: THREE.InstancedMesh;
  private readonly uOpacity = uniform(1);

  constructor(origin: Vec2, spread: number, rise: number, count = 40, color: readonly [number, number, number] = [1, 0.5, 0.15]) {
    const mat = additive(new THREE.MeshBasicNodeMaterial());
    const s = instanceIndex.toFloat();
    const r1 = hash(s.add(3.1));
    const r2 = hash(s.add(9.4));
    const life = fract(time.mul(r2.mul(0.18).add(0.1)).add(r1));
    const o = toWorld(origin);
    const x = float(o.x).add(r1.sub(0.5).mul(spread)).add(sin(life.mul(9).add(r2.mul(20))).mul(8));
    const y = float(o.y).add(life.mul(rise));
    const size = r2.mul(2).add(1.5).mul(float(1).sub(life.mul(0.6)));
    mat.positionNode = vec3(vec2(x, y).add(positionLocal.xy.mul(size)), 7);
    mat.colorNode = Fn(() => {
      const d = length(uv().sub(0.5)).mul(2);
      const a = smoothstep(1, 0, d).mul(smoothstep(0, 0.1, life)).mul(smoothstep(1, 0.5, life));
      return vec4(vec3(...color).mul(a).mul(2.2).mul(this.uOpacity), 1);
    })();
    this.object = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), emits(mat, 1), count);
    this.object.frustumCulled = false;
    this.object.renderOrder = 26;
  }

  setOpacity(v: number) {
    this.uOpacity.value = v;
  }

  dispose() {
    disposeMesh(this.object);
  }
}

// ─────────────────────────────────────────────────────────────────────────────────────────────
// MOTAS EN LA LUZ: polvo que flota despacio y centellea al cruzar el cono de una vela o lámpara
// ─────────────────────────────────────────────────────────────────────────────────────────────

export class Motes implements Effect {
  readonly object: THREE.InstancedMesh;
  private readonly uOpacity = uniform(1);

  constructor(rect: readonly [number, number, number, number], count = 70, color: readonly [number, number, number] = [1, 0.8, 0.55]) {
    const [rx, ry, rw, rh] = rect;
    const mat = additive(new THREE.MeshBasicNodeMaterial());
    const s = instanceIndex.toFloat();
    const r1 = hash(s.add(1.7));
    const r2 = hash(s.add(5.3));
    const r3 = hash(s.add(11.9));
    const u = fract(r1.add(mx_noise_float(vec3(r2.mul(7), time.mul(0.03), 2)).mul(0.3)).add(time.mul(r3.sub(0.5).mul(0.006))));
    const v = fract(r2.sub(time.mul(r3.mul(0.01).add(0.004))));
    const o = toWorld([rx, ry + rh]);
    const pos = vec2(float(o.x).add(u.mul(rw)), float(o.y).add(v.mul(rh)));
    const size = r3.mul(2.2).add(1);
    mat.positionNode = vec3(pos.add(positionLocal.xy.mul(size)), 4);
    mat.colorNode = Fn(() => {
      const d = length(uv().sub(0.5)).mul(2);
      const tw = pow(sin(time.mul(r1.mul(2).add(0.6)).add(r2.mul(30))).mul(0.5).add(0.5), 3);
      const edge = smoothstep(0, 0.2, u).mul(smoothstep(1, 0.8, u)).mul(smoothstep(0, 0.2, v)).mul(smoothstep(1, 0.8, v));
      return vec4(vec3(...color).mul(smoothstep(1, 0, d)).mul(tw.mul(0.9).add(0.1)).mul(edge).mul(0.8).mul(this.uOpacity), 1);
    })();
    this.object = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), emits(mat, 0.6), count);
    this.object.frustumCulled = false;
    this.object.renderOrder = 12;
  }

  setOpacity(v: number) {
    this.uOpacity.value = v;
  }

  dispose() {
    disposeMesh(this.object);
  }
}
