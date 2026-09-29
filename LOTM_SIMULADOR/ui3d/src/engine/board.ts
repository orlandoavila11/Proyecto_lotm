import * as THREE from 'three/webgpu';
import { Fn, abs, float, fract, max, mix, smoothstep, texture, uniform, uv, vec3, vec4 } from 'three/tsl';
import { emits, occludes, type Effect } from './effects';
import { Homography } from './homography';
import { PLATE_H, type Vec2 } from './types';

/**
 * Tablero de corcho vivo (V04). Tarjetas y hilos se colocan en un espacio lógico del tablero (u, v ∈ 0..1)
 * y se proyectan sobre el corcho pintado con una homografía, de modo que respetan la perspectiva del
 * cuadro. Las tarjetas son texturas compuestas en canvas: papel, fotografía de la pista y rótulo.
 */

export interface BoardCard {
  id: string;
  title: string;
  image: string | null;
  kind: 'clue' | 'note' | 'false';
}

export type EdgeKind = 'explica' | 'contradice' | 'localiza' | 'acusa';

export interface BoardEdge {
  a: string;
  b: string;
  kind: EdgeKind;
  faint?: boolean;
}

interface CardMesh {
  card: BoardCard;
  group: THREE.Group;
  glow: THREE.Mesh;
  uSelected: THREE.UniformNode<'float', number>;
  uHover: THREE.UniformNode<'float', number>;
  /** rectángulo en espacio de tablero: centro, medio ancho, medio alto, giro */
  cu: number;
  cv: number;
  hw: number;
  hh: number;
  rot: number;
}

export const EDGE_COLORS: Record<EdgeKind, [number, number, number]> = {
  explica: [0.78, 0.12, 0.1],
  contradice: [0.45, 0.62, 0.82],
  localiza: [0.95, 0.72, 0.3],
  acusa: [0.42, 0.04, 0.06]
};

/**
 * Huecos del tablero: dos hileras de cuatro. La hilera baja apenas roza la alta para que el pie de cada
 * tarjeta (su título) siga legible; el orden de llenado alterna hileras para que pocas pistas no se amontonen.
 */
const CLUE_SLOTS: Vec2[] = [
  [0.13, 0.27], [0.38, 0.72], [0.63, 0.27], [0.87, 0.72],
  [0.38, 0.27], [0.13, 0.72], [0.87, 0.27], [0.63, 0.72]
];
/** notas libres: clavadas en las juntas entre columnas */
const NOTE_SLOTS: Vec2[] = [[0.255, 0.5], [0.505, 0.5], [0.755, 0.5], [0.03, 0.5], [0.97, 0.5]];

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return ((h >>> 0) % 10000) / 10000;
}

export class CorkBoard implements Effect {
  readonly object = new THREE.Group();
  private readonly H: Homography;
  private readonly uOpacity = uniform(0);
  private cards = new Map<string, CardMesh>();
  private strings: THREE.Mesh[] = [];
  private edges: BoardEdge[] = [];
  private images = new Map<string, Promise<ImageBitmap | null>>();

  /** esquinas del corcho en la lámina: arriba-izq, arriba-der, abajo-der, abajo-izq */
  constructor(corners: readonly [Vec2, Vec2, Vec2, Vec2]) {
    this.H = Homography.fromQuad([[0, 0], [1, 0], [1, 1], [0, 1]], corners);
    this.object.renderOrder = 50;
  }

  // ─────────────────────────────────────────────── API

  async setCards(list: BoardCard[]) {
    const keep = new Set(list.map((c) => c.id));
    for (const [id, m] of this.cards) {
      if (!keep.has(id)) {
        this.object.remove(m.group);
        disposeGroup(m.group);
        this.cards.delete(id);
      }
    }
    let clueIdx = 0;
    let noteIdx = 0;
    for (const card of list) {
      const isNote = card.kind === 'note';
      const slot = isNote ? NOTE_SLOTS[noteIdx++ % NOTE_SLOTS.length] : CLUE_SLOTS[clueIdx++ % CLUE_SLOTS.length];
      if (this.cards.has(card.id)) continue;
      const mesh = await this.buildCard(card, slot);
      if (!keep.has(card.id) || this.cards.has(card.id)) {
        disposeGroup(mesh.group);
        continue;
      }
      this.cards.set(card.id, mesh);
      this.object.add(mesh.group);
    }
    this.rebuildStrings();
  }

  setEdges(edges: BoardEdge[]) {
    this.edges = edges;
    this.rebuildStrings();
  }

  setSelected(ids: string[]) {
    for (const [id, m] of this.cards) m.uSelected.value = ids.includes(id) ? 1 : 0;
  }

  setHovered(id: string | null) {
    for (const [cid, m] of this.cards) m.uHover.value = cid === id ? 1 : 0;
  }

  /** tarjeta bajo un punto de lámina */
  hit([px, py]: Vec2): string | null {
    const [u, v] = this.H.unmap([px, py]);
    let best: string | null = null;
    for (const [id, m] of this.cards) {
      const du = u - m.cu;
      const dv = v - m.cv;
      const c = Math.cos(-m.rot), s = Math.sin(-m.rot);
      const lu = du * c - dv * s;
      const lv = du * s + dv * c;
      if (Math.abs(lu) <= m.hw && Math.abs(lv) <= m.hh) best = id;
    }
    return best;
  }

  /** centro de la tarjeta en la lámina (para anclar el HUD) */
  anchorOf(id: string): Vec2 | null {
    const m = this.cards.get(id);
    return m ? this.H.map([m.cu, m.cv - m.hh]) : null;
  }

  setOpacity(v: number) {
    this.uOpacity.value = v;
  }

  dispose() {
    for (const m of this.cards.values()) disposeGroup(m.group);
    for (const s of this.strings) disposeGroup(s);
    this.cards.clear();
  }

  // ─────────────────────────────────────────────── construcción

  private image(url: string | null): Promise<ImageBitmap | null> {
    if (!url) return Promise.resolve(null);
    if (!this.images.has(url)) {
      const unflipped = new THREE.ImageBitmapLoader();
      this.images.set(url, unflipped.loadAsync(url).catch(() => null));
    }
    return this.images.get(url)!;
  }

  private async buildCard(card: BoardCard, slot: Vec2): Promise<CardMesh> {
    const isNote = card.kind === 'note';
    const photo = isNote ? null : await this.image(card.image);
    await document.fonts.ready;
    const canvas = drawCard(card, photo);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;

    const jitter = hash(card.id);
    const rot = (jitter - 0.5) * (isNote ? 0.12 : 0.07);
    const cu = slot[0] + (hash(card.id + 'u') - 0.5) * 0.02;
    const cv = slot[1] + (hash(card.id + 'v') - 0.5) * 0.02;
    // tamaño en unidades de tablero (el tablero es ~2.2 veces más ancho que alto)
    const hw = isNote ? 0.046 : 0.083;
    const hh = isNote ? 0.117 : 0.23;

    const uSelected = uniform(0);
    const uHover = uniform(0);
    const group = new THREE.Group();

    // sombra proyectada sobre el corcho
    const shadowMat = new THREE.MeshBasicNodeMaterial({ transparent: true, depthTest: false, depthWrite: false });
    shadowMat.colorNode = Fn(() => {
      const p = uv();
      const d = max(abs(p.x.sub(0.5)).mul(2), abs(p.y.sub(0.5)).mul(2));
      return vec4(0, 0, 0, smoothstep(1, 0.72, d).mul(0.55).mul(this.uOpacity));
    })();
    const shadow = new THREE.Mesh(this.cardGeometry(cu + 0.008, cv + 0.018, hw * 1.12, hh * 1.08, rot), occludes(shadowMat));
    shadow.renderOrder = 51;

    // halo dorado de selección
    const glowMat = new THREE.MeshBasicNodeMaterial({ transparent: true, depthTest: false, depthWrite: false, blending: THREE.AdditiveBlending });
    glowMat.colorNode = Fn(() => {
      const p = uv();
      const d = max(abs(p.x.sub(0.5)).mul(2), abs(p.y.sub(0.5)).mul(2));
      const ring = smoothstep(1, 0.86, d).mul(smoothstep(0.78, 0.9, d));
      const amt = max(uSelected, uHover.mul(0.45));
      return vec4(vec3(1, 0.72, 0.32).mul(ring).mul(amt).mul(1.6).mul(this.uOpacity), 1);
    })();
    const glow = new THREE.Mesh(this.cardGeometry(cu, cv, hw * 1.16, hh * 1.1, rot), emits(glowMat, 1));
    glow.renderOrder = 52;

    // la tarjeta
    const map = texture(tex);
    const cardMat = new THREE.MeshBasicNodeMaterial({ transparent: true, depthTest: false, depthWrite: false });
    // luz de la escena: la vela del gabinete cae desde la izquierda; hacia la derecha, penumbra fría
    const warmth = Math.max(0, 1 - cu * 1.1);
    const light = new THREE.Color().setRGB(0.62 + warmth * 0.3, 0.52 + warmth * 0.2, 0.4 + warmth * 0.06);
    cardMat.colorNode = Fn(() => {
      const c = map.sample(uv());
      const lift = float(1).add(uHover.mul(0.08)).add(uSelected.mul(0.14));
      const falloff = mix(float(0.82), float(1.04), uv().y); // sombra al pie de la tarjeta
      return vec4(c.rgb.mul(vec3(light.r, light.g, light.b)).mul(lift).mul(falloff), c.a.mul(this.uOpacity));
    })();
    const body = new THREE.Mesh(this.cardGeometry(cu, cv, hw, hh, rot), occludes(cardMat));
    body.renderOrder = 53;

    group.add(shadow, glow, body);
    return { card, group, glow, uSelected, uHover, cu, cv, hw, hh, rot };
  }

  /** malla subdividida cuyos vértices pasan por la homografía (textura sin distorsión afín) */
  private cardGeometry(cu: number, cv: number, hw: number, hh: number, rot: number) {
    const seg = 10;
    const geo = new THREE.PlaneGeometry(1, 1, seg, seg);
    const pos = geo.attributes.position as THREE.BufferAttribute;
    const c = Math.cos(rot), s = Math.sin(rot);
    for (let i = 0; i < pos.count; i++) {
      const lx = pos.getX(i) * 2 * hw;
      const ly = -pos.getY(i) * 2 * hh;
      const u = cu + lx * c - ly * s;
      const v = cv + lx * s + ly * c;
      const [px, py] = this.H.map([u, v]);
      pos.setXYZ(i, px, PLATE_H - py, 20);
    }
    pos.needsUpdate = true;
    geo.computeBoundingSphere();
    return geo;
  }

  private pinOf(m: CardMesh, towards: CardMesh): Vec2 {
    const side = towards.cu > m.cu ? 1 : -1;
    const c = Math.cos(m.rot), s = Math.sin(m.rot);
    const lx = side * m.hw * 0.98;
    const ly = -m.hh * 0.25;
    return [m.cu + lx * c - ly * s, m.cv + lx * s + ly * c];
  }

  private rebuildStrings() {
    for (const s of this.strings) {
      this.object.remove(s);
      disposeGroup(s);
    }
    this.strings = [];
    for (const e of this.edges) {
      const A = this.cards.get(e.a);
      const B = this.cards.get(e.b);
      if (!A || !B) continue;
      const mesh = this.buildString(this.pinOf(A, B), this.pinOf(B, A), e);
      this.strings.push(mesh);
      this.object.add(mesh);
    }
  }

  private buildString(a: Vec2, b: Vec2, e: BoardEdge): THREE.Mesh {
    const N = 40;
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const sag = 0.02 + len * 0.04;
    const pts: Vec2[] = [];
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      const u = a[0] + (b[0] - a[0]) * t;
      const v = a[1] + (b[1] - a[1]) * t + Math.sin(Math.PI * t) * sag;
      pts.push(this.H.map([u, v]));
    }
    const width = e.kind === 'acusa' ? 4.2 : 3.4;
    const positions: number[] = [];
    const uvs: number[] = [];
    let acc = 0;
    for (let i = 0; i <= N; i++) {
      const p = pts[i];
      const q = pts[Math.min(N, i + 1)];
      const o = pts[Math.max(0, i - 1)];
      const dx = q[0] - o[0], dy = q[1] - o[1];
      const l = Math.hypot(dx, dy) || 1;
      const nx = (-dy / l) * width * 0.5, ny = (dx / l) * width * 0.5;
      if (i > 0) acc += Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]);
      positions.push(p[0] + nx, PLATE_H - (p[1] + ny), 25, p[0] - nx, PLATE_H - (p[1] - ny), 25);
      uvs.push(acc, 0, acc, 1);
    }
    const index: number[] = [];
    for (let i = 0; i < N; i++) {
      const k = i * 2;
      index.push(k, k + 1, k + 2, k + 1, k + 3, k + 2);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(index);

    const [r, g, bl] = EDGE_COLORS[e.kind];
    const dash = e.kind === 'contradice' ? 14 : e.kind === 'localiza' ? 7 : 0;
    const fill = e.kind === 'contradice' ? 0.6 : 0.35;
    // doble cara: el sentido de giro de la cinta depende de si el hilo va hacia la izquierda o la derecha
    const mat = new THREE.MeshBasicNodeMaterial({ transparent: true, depthTest: false, depthWrite: false, side: THREE.DoubleSide });
    mat.colorNode = Fn(() => {
      const p = uv();
      const across = abs(p.y.sub(0.5)).mul(2);
      const fiber = smoothstep(1, 0.45, across);
      const shade = mix(float(0.55), float(1.15), smoothstep(0.9, 0.1, across));
      const on = dash > 0 ? smoothstep(fill + 0.05, fill - 0.05, fract(p.x.div(dash))) : float(1);
      const a = fiber.mul(on).mul(e.faint ? 0.55 : 1).mul(this.uOpacity);
      return vec4(vec3(r, g, bl).mul(shade), a);
    })();
    const mesh = new THREE.Mesh(geo, occludes(mat));
    mesh.renderOrder = 60;
    return mesh;
  }
}

function disposeGroup(o: THREE.Object3D) {
  o.traverse((c) => {
    const m = c as THREE.Mesh;
    if (m.geometry) m.geometry.dispose();
    const mat = m.material as THREE.Material | undefined;
    if (mat) {
      const map = (mat as { map?: THREE.Texture }).map;
      map?.dispose();
      mat.dispose();
    }
  });
}

// ─────────────────────────────────────────────── canvas de la tarjeta

function drawCard(card: BoardCard, photo: ImageBitmap | null): HTMLCanvasElement {
  const isNote = card.kind === 'note';
  const W = isNote ? 360 : 460;
  const H = isNote ? 400 : 560;
  const cv = document.createElement('canvas');
  cv.width = W;
  cv.height = H;
  const g = cv.getContext('2d')!;

  // papel
  const grad = g.createLinearGradient(0, 0, W * 0.3, H);
  grad.addColorStop(0, isNote ? '#efe6cf' : '#efe4ca');
  grad.addColorStop(1, isNote ? '#d9c9a4' : '#d6c39e');
  g.fillStyle = grad;
  g.fillRect(0, 0, W, H);
  // fibras y manchas deterministas
  let seed = Math.floor(hash(card.id) * 1e6);
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 900; i++) {
    g.fillStyle = `rgba(90,62,30,${rnd() * 0.05})`;
    g.fillRect(rnd() * W, rnd() * H, rnd() * 3 + 0.5, rnd() * 3 + 0.5);
  }
  const vig = g.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.75);
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, 'rgba(80,50,20,0.35)');
  g.fillStyle = vig;
  g.fillRect(0, 0, W, H);

  if (isNote) {
    g.fillStyle = '#2d2117';
    g.font = 'italic 30px "EB Garamond", serif';
    wrap(g, card.title, 30, 78, W - 60, 38, 8);
  } else {
    const px = 28, py = 40, pw = W - 56, ph = H * 0.68;
    g.fillStyle = '#16120e';
    g.fillRect(px, py, pw, ph);
    if (photo) {
      const s = Math.max(pw / photo.width, ph / photo.height);
      const dw = photo.width * s, dh = photo.height * s;
      g.save();
      g.beginPath();
      g.rect(px, py, pw, ph);
      g.clip();
      g.drawImage(photo, px + (pw - dw) / 2, py + (ph - dh) / 2, dw, dh);
      g.restore();
    } else {
      // sin fotografía: un pliego manuscrito fotografiado en sepia (nunca un hueco negro)
      const sep = g.createLinearGradient(px, py, px + pw * 0.4, py + ph);
      sep.addColorStop(0, '#4a3b2a');
      sep.addColorStop(1, '#221a13');
      g.fillStyle = sep;
      g.fillRect(px, py, pw, ph);
      g.save();
      g.beginPath();
      g.rect(px, py, pw, ph);
      g.clip();
      g.translate(px + pw / 2, py + ph / 2);
      g.rotate(-0.06);
      g.fillStyle = 'rgba(214, 192, 150, 0.16)';
      g.fillRect(-pw * 0.36, -ph * 0.42, pw * 0.72, ph * 0.84);
      g.strokeStyle = 'rgba(40, 28, 18, 0.55)';
      g.lineWidth = 2;
      g.lineCap = 'round';
      for (let y = -ph * 0.34; y < ph * 0.36; y += 22) {
        let x = -pw * 0.3;
        const end = pw * (0.12 + rnd() * 0.18);
        g.beginPath();
        g.moveTo(x, y);
        while (x < end) {
          const step = 6 + rnd() * 10;
          g.quadraticCurveTo(x + step / 2, y - 3 - rnd() * 4, x + step, y + (rnd() - 0.5) * 2);
          x += step + (rnd() < 0.18 ? 10 : 0);
          if (rnd() < 0.18) g.moveTo(x, y);
        }
        g.stroke();
      }
      g.restore();
      const shade = g.createRadialGradient(px + pw / 2, py + ph / 2, ph * 0.2, px + pw / 2, py + ph / 2, ph * 0.8);
      shade.addColorStop(0, 'rgba(0,0,0,0)');
      shade.addColorStop(1, 'rgba(0,0,0,0.5)');
      g.fillStyle = shade;
      g.fillRect(px, py, pw, ph);
    }
    // escuadras de las esquinas de la foto
    g.strokeStyle = '#2a1f14';
    g.lineWidth = 3;
    const k = 18;
    ([[px, py, 1, 1], [px + pw, py, -1, 1], [px, py + ph, 1, -1], [px + pw, py + ph, -1, -1]] as const).forEach(([x, y, sx, sy]) => {
      g.beginPath();
      g.moveTo(x, y + k * sy);
      g.lineTo(x, y);
      g.lineTo(x + k * sx, y);
      g.stroke();
    });
    g.fillStyle = card.kind === 'false' ? '#5a1a16' : '#2b2017';
    g.font = '500 36px "EB Garamond", serif';
    g.textAlign = 'center';
    wrap(g, card.title, W / 2, py + ph + (H - py - ph) / 2 + 12, W - 44, 40, 2, true);
  }

  // chincheta de latón
  const cx = W / 2, cy = isNote ? 26 : 22;
  const pin = g.createRadialGradient(cx - 5, cy - 5, 2, cx, cy, 16);
  pin.addColorStop(0, '#fff2c0');
  pin.addColorStop(0.35, '#c99a45');
  pin.addColorStop(1, '#4a3313');
  g.fillStyle = 'rgba(0,0,0,0.35)';
  g.beginPath();
  g.arc(cx + 5, cy + 6, 14, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = pin;
  g.beginPath();
  g.arc(cx, cy, 14, 0, Math.PI * 2);
  g.fill();
  return cv;
}

function wrap(g: CanvasRenderingContext2D, text: string, x: number, y: number, maxW: number, lh: number, maxLines: number, center = false) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    const t = line ? `${line} ${w}` : w;
    if (g.measureText(t).width > maxW && line) {
      lines.push(line);
      line = w;
    } else line = t;
  }
  if (line) lines.push(line);
  const shown = lines.slice(0, maxLines);
  if (lines.length > maxLines) shown[maxLines - 1] = shown[maxLines - 1].replace(/\s*\S*$/, '…');
  const y0 = center ? y - ((shown.length - 1) * lh) / 2 : y;
  shown.forEach((l, i) => g.fillText(l, x, y0 + i * lh));
}
