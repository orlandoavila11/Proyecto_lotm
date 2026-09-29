import * as THREE from 'three/webgpu';
import {
  Fn, abs, clamp, exp, float, floor, fract, length, max, min, mix, positionWorld, round, sin, smoothstep, texture, time, uniform, uv, vec2, vec3, vec4
} from 'three/tsl';
import { emits, occludes, toWorld, type Effect } from './effects';
import { Homography } from './homography';
import { PLATE_H, type Vec2 } from './types';

/** Estado visual de cada casilla (canal R de la textura de estados). */
export const Cell = { none: 0, reach: 1, target: 2, hover: 3, danger: 4 } as const;

/**
 * Rejilla táctica 7×5 reconstruida en código (V06). La pintura sólo aporta el suelo: líneas, casillas y
 * actores se proyectan con una homografía del rectángulo lógico de la rejilla sobre el adoquín.
 */
export class TacticalGrid implements Effect {
  readonly object = new THREE.Group();
  readonly H: Homography;
  private readonly uOpacity = uniform(0);
  private readonly states: THREE.DataTexture;
  private readonly data: Uint8Array;
  private readonly uInv: THREE.UniformNode<'mat3', THREE.Matrix3>;

  constructor(readonly cols: number, readonly rows: number, corners: readonly [Vec2, Vec2, Vec2, Vec2]) {
    this.H = Homography.fromQuad([[0, 0], [cols, 0], [cols, rows], [0, rows]], corners);
    this.data = new Uint8Array(cols * rows * 4);
    this.states = new THREE.DataTexture(this.data, cols, rows, THREE.RGBAFormat);
    this.states.magFilter = THREE.NearestFilter;
    this.states.minFilter = THREE.NearestFilter;
    this.states.needsUpdate = true;

    // inversa de la homografía en coordenadas de mundo (y hacia arriba): lámina = (x, PLATE_H - y)
    const inv = this.H.inverse;
    const m = new THREE.Matrix3().set(inv[0], inv[1], inv[2], inv[3], inv[4], inv[5], inv[6], inv[7], inv[8]);
    const flip = new THREE.Matrix3().set(1, 0, 0, 0, -1, PLATE_H, 0, 0, 1);
    this.uInv = uniform(m.multiply(flip));

    const xs = corners.map((c) => c[0]);
    const ys = corners.map((c) => c[1]);
    const minX = Math.min(...xs) - 40, maxX = Math.max(...xs) + 40;
    const minY = Math.min(...ys) - 40, maxY = Math.max(...ys) + 40;
    const geo = new THREE.PlaneGeometry(maxX - minX, maxY - minY);
    const mat = new THREE.MeshBasicNodeMaterial({ transparent: true, depthTest: false, depthWrite: false });
    const statesTex = texture(this.states);
    mat.colorNode = Fn(() => {
      const w = positionWorld.xy;
      const q = this.uInv.mul(vec3(w, 1));
      const g = q.xy.div(q.z); // coordenadas de rejilla
      const inside = smoothstep(-0.02, 0.02, g.x).mul(smoothstep(cols + 0.02, cols - 0.02, g.x))
        .mul(smoothstep(-0.02, 0.02, g.y)).mul(smoothstep(rows + 0.02, rows - 0.02, g.y));
      // grosor de línea constante en pantalla aprox.: derivada de la coordenada de rejilla
      const f = fract(g);
      const edge = min(min(f.x, float(1).sub(f.x)), min(f.y, float(1).sub(f.y)));
      const line = smoothstep(0.022, 0.005, edge);
      const glowLine = exp(edge.mul(-30)).mul(0.22);

      const cellUv = floor(g).add(0.5).div(vec2(cols, rows));
      const st = round(statesTex.sample(cellUv).r.mul(255));
      const is = (v: number) => float(1).sub(clamp(abs(st.sub(v)), 0, 1));
      const reach = is(Cell.reach);
      const target = is(Cell.target);
      const hover = is(Cell.hover);
      const danger = is(Cell.danger);

      const pulse = sin(time.mul(2.4)).mul(0.15).add(0.85);
      const cyan = vec3(0.45, 0.95, 0.92);
      const fill = cyan.mul(reach.mul(0.16)).add(vec3(1, 0.78, 0.4).mul(hover.mul(0.26)))
        .add(vec3(0.95, 0.2, 0.18).mul(target.mul(0.22).mul(pulse))).add(vec3(0.7, 0.1, 0.1).mul(danger.mul(0.12)));
      const cellEdge = smoothstep(0.08, 0.0, edge).mul(max(max(reach, hover), target));
      const lineCol = mix(vec3(0.82, 0.86, 0.9), cyan, reach);
      const col = fill.add(lineCol.mul(line.mul(0.55).add(glowLine.mul(0.4)))).add(vec3(1, 0.85, 0.55).mul(cellEdge.mul(0.9)));
      const alpha = inside.mul(line.mul(0.34).add(glowLine.mul(0.14)).add(length(fill).mul(1.4)).add(cellEdge.mul(0.8)));
      return vec4(col, clamp(alpha, 0, 1).mul(this.uOpacity));
    })();
    const mesh = new THREE.Mesh(geo, emits(mat, 0.3));
    mesh.position.set((minX + maxX) / 2, PLATE_H - (minY + maxY) / 2, 12);
    mesh.renderOrder = 45;
    this.object.add(mesh);
  }

  setCell(x: number, y: number, state: number) {
    if (x < 0 || y < 0 || x >= this.cols || y >= this.rows) return;
    // la textura va de abajo arriba: la fila y de rejilla corresponde a la fila y de datos
    this.data[(y * this.cols + x) * 4] = state;
  }

  clear() {
    this.data.fill(0);
  }

  commit() {
    this.states.needsUpdate = true;
  }

  /** casilla bajo un punto de lámina, o null */
  cellAt(p: Vec2): Vec2 | null {
    const [gx, gy] = this.H.unmap(p);
    if (gx < 0 || gy < 0 || gx >= this.cols || gy >= this.rows) return null;
    return [Math.floor(gx), Math.floor(gy)];
  }

  /** centro de una casilla en la lámina */
  center(x: number, y: number): Vec2 {
    return this.H.map([x + 0.5, y + 0.5]);
  }

  setOpacity(v: number) {
    this.uOpacity.value = v;
  }

  dispose() {
    this.states.dispose();
    this.object.traverse((o) => {
      const m = o as THREE.Mesh;
      m.geometry?.dispose();
      (m.material as THREE.Material | undefined)?.dispose();
    });
  }
}

/**
 * Actor sobre la rejilla: anillo en el suelo (siempre) y figura recortada (si existe el arte).
 * Se desplaza en coordenadas de rejilla y se proyecta con la escala local de la perspectiva.
 */
export class GridActor implements Effect {
  readonly object = new THREE.Group();
  private readonly uOpacity = uniform(0);
  private readonly uFlash = uniform(0);
  private readonly ring: THREE.Mesh;
  private readonly ringBase: Float32Array;
  private figure: THREE.Mesh | null = null;
  private pos: Vec2;
  private target: Vec2;
  private figureHeight = 0;

  constructor(private readonly grid: TacticalGrid, cell: Vec2, tone: 'ally' | 'enemy') {
    this.pos = [cell[0] + 0.5, cell[1] + 0.5];
    this.target = this.pos;
    const color = tone === 'ally' ? vec3(1, 0.78, 0.38) : vec3(0.95, 0.22, 0.18);
    const mat = new THREE.MeshBasicNodeMaterial({ transparent: true, depthTest: false, depthWrite: false, blending: THREE.AdditiveBlending });
    mat.colorNode = Fn(() => {
      const d = length(uv().sub(0.5)).mul(2);
      const ring = smoothstep(0.62, 0.72, d).mul(smoothstep(0.92, 0.8, d));
      const core = smoothstep(0.7, 0.0, d).mul(0.18);
      const pulse = sin(time.mul(3)).mul(0.2).add(0.8);
      return vec4(color.mul(ring.mul(pulse).add(core)).mul(float(1).add(this.uFlash.mul(2))).mul(this.uOpacity), 1);
    })();
    this.ring = new THREE.Mesh(new THREE.PlaneGeometry(1, 1, 8, 8), emits(mat, 1));
    // layout() reescribe las posiciones en coordenadas de lámina: se parte siempre del plano unidad original
    this.ringBase = Float32Array.from(this.ring.geometry.attributes.position.array as Float32Array);
    this.ring.renderOrder = 46;
    this.object.add(this.ring);
    this.layout();
  }

  /** figura recortada (actor_player.webp / actor_enemy.webp) de pie sobre la casilla */
  setFigure(tex: THREE.Texture, heightInCells = 3) {
    const img = tex.image as { width: number; height: number };
    const aspect = img.width / img.height;
    const map = texture(tex);
    const mat = new THREE.MeshBasicNodeMaterial({ transparent: true, depthTest: false, depthWrite: false });
    mat.colorNode = Fn(() => {
      const c = map.sample(uv());
      const shade = mix(float(0.78), float(1.05), uv().y); // pies más en sombra
      return vec4(c.rgb.mul(shade).add(vec3(0.6, 0.1, 0.08).mul(this.uFlash)), c.a.mul(this.uOpacity));
    })();
    const geo = new THREE.PlaneGeometry(aspect, 1);
    geo.translate(0, 0.5, 0);
    this.figure = new THREE.Mesh(geo, occludes(mat));
    this.figure.renderOrder = 48;
    this.figureHeight = heightInCells;
    this.object.add(this.figure);
    this.layout();
  }

  moveTo(cell: Vec2) {
    this.target = [cell[0] + 0.5, cell[1] + 0.5];
  }

  /** destello de impacto */
  hit() {
    this.uFlash.value = 1;
  }

  get cell(): Vec2 {
    return [Math.floor(this.target[0]), Math.floor(this.target[1])];
  }

  get anchor(): Vec2 {
    return this.grid.H.map(this.pos);
  }

  private layout() {
    const p = this.grid.H.map(this.pos);
    const s = this.grid.H.localScale(this.pos);
    // anillo: elipse aplastada según la perspectiva local
    const a = this.grid.H.map([this.pos[0] - 0.42, this.pos[1]]);
    const b = this.grid.H.map([this.pos[0] + 0.42, this.pos[1]]);
    const c = this.grid.H.map([this.pos[0], this.pos[1] - 0.42]);
    const d = this.grid.H.map([this.pos[0], this.pos[1] + 0.42]);
    const pos = this.ring.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const u = this.ringBase[i * 3] * 2;
      const v = this.ringBase[i * 3 + 1] * 2;
      const x = p[0] + (b[0] - a[0]) * 0.5 * u + (c[0] - d[0]) * 0.5 * v;
      const y = p[1] + (b[1] - a[1]) * 0.5 * u + (c[1] - d[1]) * 0.5 * v;
      pos.setXYZ(i, x, PLATE_H - y, 14);
    }
    pos.needsUpdate = true;
    this.ring.geometry.computeBoundingSphere();
    if (this.figure) {
      const w = toWorld(p, 16);
      this.figure.position.copy(w);
      this.figure.scale.setScalar(s * this.figureHeight);
    }
  }

  setOpacity(v: number) {
    this.uOpacity.value = v;
  }

  update(_t: number, dt: number) {
    const k = 1 - Math.exp(-dt * 5);
    const dx = this.target[0] - this.pos[0];
    const dy = this.target[1] - this.pos[1];
    if (Math.abs(dx) > 1e-3 || Math.abs(dy) > 1e-3) {
      this.pos = [this.pos[0] + dx * k, this.pos[1] + dy * k];
      this.layout();
    }
    this.uFlash.value = Math.max(0, this.uFlash.value - dt * 2.5);
  }

  dispose() {
    this.object.traverse((o) => {
      const m = o as THREE.Mesh;
      m.geometry?.dispose();
      (m.material as THREE.Material | undefined)?.dispose();
    });
  }
}
