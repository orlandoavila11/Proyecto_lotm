import * as THREE from 'three/webgpu';
import { Fn, If, clamp, dot, float, length, mix, mrt, output, pass, pow, rand, screenSize, screenUV, smoothstep, time, uniform, vec2, vec3, vec4 } from 'three/tsl';
import { bloom } from 'three/addons/tsl/display/BloomNode.js';
import { assetUrl, hasFinalAsset } from '../assets';
import { PlateLayer } from './PlateLayer';
import { PlateMask } from './PlateMask';
import { glassDrops } from './tsl/weather';
import { uWind, type Effect } from './effects';
import type { PlaceSpec } from './PlaceSpec';
import { PLATE_H, PLATE_W, type CameraView, type Vec2 } from './types';

export type StageEvent =
  | { type: 'hover'; id: string | null }
  | { type: 'select'; id: string }
  | { type: 'plate'; x: number; y: number }
  | { type: 'move'; x: number; y: number }
  | { type: 'frame' };

export interface Quality {
  pixelRatio: number;
  bloom: boolean;
  grain: boolean;
  motion: boolean;
}

interface Attached {
  effect: Effect;
  fade: number;
  target: number;
}

const DEFAULT_VIEW: CameraView = { cx: PLATE_W / 2, cy: PLATE_H / 2, zoom: 1 };
const TRANSITION_SECONDS = 1.35;

/**
 * El escenario: un único renderer WebGPU que pinta la lámina viva, los efectos, los objetos de juego
 * (rejilla, tarjetas, manecillas) y la post-producción. El HUD de React vive encima, en el DOM, y se
 * ancla a la lámina con project().
 */
export class Stage {
  readonly renderer: THREE.WebGPURenderer;
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -100, 100);
  readonly plate = new PlateLayer();
  private pipeline!: THREE.RenderPipeline;

  private readonly uFade = uniform(0);
  private readonly uVignette = uniform(0.55);
  private readonly uGrain = uniform(0.045);
  private readonly uCA = uniform(0.0035);
  private readonly uBloom = uniform(1);
  /** 1 = bloom selectivo por emisión (canal glow); 0 = umbral de luminancia sobre toda la imagen */
  private readonly uGlowSelective = uniform(1);
  private readonly uGlowDebug = uniform(0);
  /** lente mojada al salir a la calle: 1 = recién llegado bajo la lluvia, se seca sola (0 = sin coste) */
  private readonly uLens = uniform(0);
  private lensWet = 0;
  private bloomNode: ReturnType<typeof bloom> | null = null;
  /** pulso de peligro (bordes carmesí) — lo sube el combate o la corrupción extrema */
  readonly uDanger = uniform(0);

  private mask: PlateMask | null = null;
  private spec: PlaceSpec | null = null;
  private ambient: Effect[] = [];
  private attached: Attached[] = [];
  private readonly loader = new THREE.TextureLoader();
  private readonly textureCache = new Map<string, THREE.Texture>();

  private width = 1;
  private height = 1;
  private view: CameraView = { ...DEFAULT_VIEW };
  private targetView: CameraView = { ...DEFAULT_VIEW };
  private pointer = { x: 0.5, y: 0.5, inside: false };
  private sway = new THREE.Vector2();
  private hoverId: string | null = null;
  private selectedId: string | null = null;
  private hoverAmt = 0;
  private selectedAmt = 0;
  private transition = 1;
  private interactive = true;
  private listeners = new Set<(e: StageEvent) => void>();
  private clock = new THREE.Timer();
  private quality: Quality = { pixelRatio: Math.min(window.devicePixelRatio, 2), bloom: true, grain: true, motion: true };
  private loadToken = 0;
  private nextLightning = Infinity;
  private lastPointer = { x: 0.5, t: 0 };
  private listenersThunder = new Set<(delay: number) => void>();
  isWebGPU = false;
  provisional = false;

  constructor(private readonly canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGPURenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.NoToneMapping;
    this.renderer.setClearColor(0x090807, 1);
    this.scene.add(this.plate.mesh);
  }

  async init() {
    await this.renderer.init();
    this.isWebGPU = !!(this.renderer.backend as { isWebGPUBackend?: boolean }).isWebGPUBackend;
    this.buildPipeline();
    this.resize();
    this.bindPointer();
    this.clock.connect(document);
    this.renderer.setAnimationLoop(() => this.frame());
  }

  // ──────────────────────────────────────────────────────────────── post-producción

  private buildPipeline() {
    const scenePass = pass(this.scene, this.camera);
    // bloom selectivo: cada material escribe en "glow" cuánto de su color es luz propia (lámina: mapa de emisión
    // o estimación; llamas y halos: su intensidad; tarjetas y figuras: tapan). Sin mrtNode, 0.
    // r186: las salidas extra del MRT no mezclan por defecto (NoBlending): glow debe sumar y tapar como el color
    const sceneMRT = mrt({ output, glow: vec4(0) });
    sceneMRT.setBlendMode('glow', new THREE.BlendMode(THREE.MaterialBlending));
    scenePass.setMRT(sceneMRT);
    const color = scenePass.getTextureNode();
    const glowMask = scenePass.getTextureNode('glow');
    const bloomInput = mix(color.rgb, color.rgb.mul(glowMask.r), this.uGlowSelective);
    const glow = bloom(vec4(bloomInput, 1), 0.62, 0.42, 0.7);
    this.bloomNode = glow;
    this.setGlowSource('selective');

    this.pipeline = new THREE.RenderPipeline(this.renderer);
    this.pipeline.outputNode = Fn(() => {
      const suv = screenUV;
      const dir = suv.sub(0.5);
      const r2 = dot(dir, dir);
      // aberración cromática sólo en los bordes, como una lente antigua
      const ca = dir.mul(r2).mul(this.uCA);
      const base = vec3(color.sample(suv.add(ca)).r, color.sample(suv).g, color.sample(suv.sub(ca)).b).toVar();

      // lente mojada: gotas grandes que refractan y un velo desenfocado entre ellas; sólo mientras uLens > 0
      If(this.uLens.greaterThan(0.001), () => {
        const wet = this.uLens;
        const drops = glassDrops(suv.mul(screenSize).mul(0.42), time.add(37), float(1));
        const suvL = suv.add(vec2(drops.y, drops.z).mul(16).div(screenSize).mul(wet));
        const sharp = vec3(color.sample(suvL.add(ca)).r, color.sample(suvL).g, color.sample(suvL.sub(ca)).b);
        // velo: dos anillos de muestras (diagonales a 7 px, ejes a 4 px) para un desenfoque sin doble contorno
        const px = vec2(1).div(screenSize).mul(wet);
        const taps: [number, number][] = [[7, 7], [-7, 7], [7, -7], [-7, -7], [4, 0], [-4, 0], [0, 4], [0, -4]];
        let acc = color.sample(suvL).rgb;
        for (const [dx, dy] of taps) acc = acc.add(color.sample(suvL.add(px.mul(vec2(dx, dy)))).rgb);
        const veiled = acc.div(taps.length + 1).mul(vec3(0.92, 0.97, 1.05));
        const focus = clamp(drops.x.mul(1.6), 0, 1);
        base.assign(mix(sharp, veiled, wet.mul(float(1).sub(focus)).mul(0.85)));
        // brillo frío en el borde de cada gota
        base.addAssign(vec3(0.6, 0.68, 0.8).mul(pow(clamp(drops.y.mul(0.5).add(0.5).mul(drops.x), 0, 1), 2)).mul(0.25).mul(wet));
      });
      base.addAssign(glow.rgb.mul(this.uBloom));

      // viñeta ovalada
      const vig = smoothstep(0.98, 0.32, length(dir.mul(vec2(1.0, 0.92))).mul(1.18));
      base.mulAssign(mix(float(1), vig, this.uVignette));

      // borde carmesí de peligro
      const dangerEdge = smoothstep(0.35, 0.75, length(dir.mul(vec2(1, 1.1))));
      base.addAssign(vec3(0.45, 0.02, 0.03).mul(dangerEdge).mul(this.uDanger));

      // grano de película, más visible en sombras
      const luma = dot(base, vec3(0.2126, 0.7152, 0.0722));
      const g = rand(suv.mul(screenSize).add(time.mul(97.3).fract().mul(311)));
      base.addAssign(g.sub(0.5).mul(this.uGrain).mul(float(1.15).sub(luma)));

      // depuración: ver la máscara de emisión (setGlowSource('mask'))
      base.assign(mix(base, vec3(glowMask.r), this.uGlowDebug));
      return vec4(base.mul(this.uFade), 1);
    })();
  }

  /**
   * Fuente del bloom. 'selective' (por defecto): sólo lo que emite. 'legacy': toda la imagen por umbral de
   * luminancia (comportamiento anterior). 'mask': muestra la máscara de emisión en gris. Los dos últimos son
   * herramientas de revisión (__stage.setGlowSource en desarrollo).
   */
  setGlowSource(mode: 'selective' | 'legacy' | 'mask') {
    const selective = mode !== 'legacy';
    this.uGlowDebug.value = mode === 'mask' ? 1 : 0;
    this.uGlowSelective.value = selective ? 1 : 0;
    if (!this.bloomNode) return;
    this.bloomNode.threshold.value = selective ? 0.08 : 0.7;
    this.bloomNode.strength.value = selective ? 0.9 : 0.62;
    this.bloomNode.radius.value = selective ? 0.55 : 0.42;
  }

  setQuality(q: Partial<Quality>) {
    this.quality = { ...this.quality, ...q };
    this.uBloom.value = this.quality.bloom ? 1 : 0;
    this.uGrain.value = this.quality.grain ? 0.045 : 0;
    this.resize();
  }

  // ──────────────────────────────────────────────────────────────── lugares

  async texture(url: string, color = true): Promise<THREE.Texture> {
    const cached = this.textureCache.get(url);
    if (cached) return cached;
    const tex = await this.loader.loadAsync(url);
    tex.colorSpace = color ? THREE.SRGBColorSpace : THREE.NoColorSpace;
    tex.anisotropy = 8;
    tex.generateMipmaps = true;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    this.textureCache.set(url, tex);
    return tex;
  }

  /** Precarga la lámina de un lugar para que la transición no espere a la red. */
  async preload(spec: PlaceSpec) {
    const url = assetUrl(spec.plate.clean) ?? assetUrl(spec.plate.atlas);
    if (url) await this.texture(url);
  }

  async loadPlace(spec: PlaceSpec): Promise<void> {
    const token = ++this.loadToken;
    const cleanUrl = assetUrl(spec.plate.clean);
    const provisional = !hasFinalAsset(spec.plate.clean);
    const url = cleanUrl ?? assetUrl(spec.plate.atlas);
    if (!url) throw new Error(`Falta la lámina de ${spec.key}: ni ${spec.plate.clean} ni ${spec.plate.atlas}.`);
    // mapa de emisión (emit_*): se pinta sobre la lámina limpia, así que sólo vale con ella; si no, se estima
    const emitUrl = !provisional && spec.plate.depth ? assetUrl(spec.plate.depth.replace('/depth_', '/emit_')) : null;
    const [plateTex, depthTex, emitTex] = await Promise.all([
      this.texture(url),
      spec.plate.depth && assetUrl(spec.plate.depth) ? this.texture(assetUrl(spec.plate.depth)!, false) : Promise.resolve(null),
      emitUrl ? this.texture(emitUrl, false) : Promise.resolve(null)
    ]);
    if (token !== this.loadToken) return;

    const first = this.spec === null;
    const prevSpec = this.spec;
    if (!first) this.plate.beginTransition();

    // efectos del lugar anterior: se desvanecen mientras arde el papel
    for (const e of this.ambient) this.fadeOutAndDispose(e);
    for (const a of this.attached) a.target = 0;

    this.mask?.dispose();
    this.mask = new PlateMask(spec.hotspots, spec.regions);
    this.plate.setMask(this.mask.texture);
    this.plate.setPlate(plateTex);
    this.plate.setDepth(depthTex);
    this.plate.setEmission(emitTex);
    this.plate.setLights(spec.lights);
    this.plate.setHazes(spec.haze ?? []);
    this.nextLightning = spec.lightning ? 6 + Math.random() * 10 : Infinity;
    this.plate.uRain.value = spec.rain ?? 0;
    this.plate.uEmbers.value = spec.embers ?? 0;
    const grade = spec.grade ?? { exposure: 1, saturation: 1, tint: [1, 1, 1] as const };
    this.plate.uExposure.value = grade.exposure;
    this.plate.uSaturation.value = grade.saturation;
    this.plate.uTint.value.setRGB(...grade.tint);

    this.spec = spec;
    this.provisional = provisional;
    // el HUD lo lee para tapar la UI pintada del Atlas (hud.css)
    this.canvas.dataset.provisional = provisional ? '1' : '0';
    this.hoverId = null;
    this.selectedId = null;
    this.hoverAmt = 0;
    this.selectedAmt = 0;
    this.targetView = this.baseView(spec);
    if (first) this.view = { ...this.targetView };

    this.ambient = spec.ambient?.({ provisional }) ?? [];
    for (const e of this.ambient) {
      e.setOpacity(0);
      this.scene.add(e.object);
    }
    // de un interior a la calle: la mirada llega a través de un cristal mojado (se respeta "movimiento" en Ajustes)
    const wasOutside = !!prevSpec?.lightning;
    if (!first && spec.lightning && !wasOutside && this.quality.motion) this.lensWet = 1;
    this.transition = first ? 1 : 0;
    this.emit({ type: 'hover', id: null });
  }

  private fadeOutAndDispose(effect: Effect) {
    this.attached.push({ effect, fade: 1, target: 0 });
  }

  /** Añade un objeto de juego (rejilla, tarjeta, manecilla). Aparece con un fundido suave. */
  attach(effect: Effect) {
    effect.setOpacity(0);
    this.scene.add(effect.object);
    this.attached.push({ effect, fade: 0, target: 1 });
  }

  /** Retira un objeto de juego con fundido y lo libera. */
  detach(effect: Effect) {
    const a = this.attached.find((x) => x.effect === effect);
    if (a) a.target = 0;
  }

  /** efectos ambientales del lugar actual (p.ej. la llama que gobierna la cordura) */
  get ambientEffects(): readonly Effect[] {
    return this.ambient;
  }

  // ──────────────────────────────────────────────────────────────── cámara y proyección

  setView(v: Partial<CameraView>) {
    this.targetView = { ...this.targetView, ...v };
  }

  resetView() {
    this.targetView = this.spec ? this.baseView(this.spec) : { ...DEFAULT_VIEW };
  }

  /** en vertical se usa el encuadre compacto del lugar */
  private baseView(spec: PlaceSpec): CameraView {
    const portrait = this.width / this.height < 0.9;
    return { ...((portrait && spec.compactView) || spec.view || DEFAULT_VIEW) };
  }

  get isPortrait() {
    return this.width / this.height < 0.9;
  }

  private scale(view = this.view) {
    return Math.max(this.width / PLATE_W, this.height / PLATE_H) * view.zoom;
  }

  /** centro efectivo tras limitar el encuadre a la lámina y sumar el balanceo del puntero */
  private effectiveCenter(): Vec2 {
    const s = this.scale();
    const halfW = this.width / (2 * s);
    const halfH = this.height / (2 * s);
    const clampC = (c: number, half: number, size: number) => (half >= size / 2 ? size / 2 : Math.min(size - half, Math.max(half, c)));
    const sway = this.quality.motion ? this.sway : new THREE.Vector2();
    return [clampC(this.view.cx + sway.x, halfW, PLATE_W), clampC(this.view.cy + sway.y, halfH, PLATE_H)];
  }

  /** lámina → píxel CSS del viewport */
  project([px, py]: Vec2): Vec2 {
    const s = this.scale();
    const [cx, cy] = this.effectiveCenter();
    return [(px - cx) * s + this.width / 2, (py - cy) * s + this.height / 2];
  }

  /** píxel CSS → lámina */
  unproject(sx: number, sy: number): Vec2 {
    const s = this.scale();
    const [cx, cy] = this.effectiveCenter();
    return [cx + (sx - this.width / 2) / s, cy + (sy - this.height / 2) / s];
  }

  /** px CSS por px de lámina (para dimensionar marcadores del HUD) */
  get pixelsPerUnit() {
    return this.scale();
  }

  resize() {
    const rect = this.canvas.parentElement?.getBoundingClientRect() ?? this.canvas.getBoundingClientRect();
    this.width = Math.max(1, rect.width);
    this.height = Math.max(1, rect.height);
    this.renderer.setPixelRatio(this.quality.pixelRatio);
    this.renderer.setSize(this.width, this.height, false);
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
  }

  // ──────────────────────────────────────────────────────────────── interacción

  setInteractive(v: boolean) {
    this.interactive = v;
    if (!v) this.setHover(null);
  }

  /** marca un objeto como destacado (objetivo actual o selección del panel) */
  select(id: string | null) {
    this.selectedId = id;
  }

  /** resalta desde el HUD (teclado, marcador) como si el puntero estuviera encima */
  setHover(id: string | null) {
    if (id === this.hoverId) return;
    this.hoverId = id;
    this.setCursor(!!id);
    this.emit({ type: 'hover', id });
  }

  /** cursor de mano para objetos de juego que no están en la máscara (tarjetas, casillas) */
  setCursor(pointer: boolean) {
    this.canvas.style.cursor = pointer ? 'pointer' : 'default';
  }

  /** relámpago: doble destello; avisa al sonido para el trueno con el retardo de la distancia */
  flash(strength = 1) {
    this.plate.uFlash.value = 0.9 * strength;
    window.setTimeout(() => (this.plate.uFlash.value = Math.max(this.plate.uFlash.value, 0.55 * strength)), 140);
    const delay = 0.6 + Math.random() * 2.2;
    for (const fn of this.listenersThunder) fn(delay);
  }

  onThunder(fn: (delay: number) => void) {
    this.listenersThunder.add(fn);
    return () => this.listenersThunder.delete(fn);
  }

  on(fn: (e: StageEvent) => void) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private emit(e: StageEvent) {
    for (const fn of this.listeners) fn(e);
  }

  private bindPointer() {
    const el = this.canvas;
    el.addEventListener('pointermove', (ev) => {
      const r = el.getBoundingClientRect();
      this.pointer.x = (ev.clientX - r.left) / r.width;
      this.pointer.y = (ev.clientY - r.top) / r.height;
      this.pointer.inside = true;
      if (!this.interactive || this.transition < 1) return;
      const [px, py] = this.unproject(ev.clientX - r.left, ev.clientY - r.top);
      this.emit({ type: 'move', x: px, y: py });
      const hit = this.mask?.hit(px, py) ?? null;
      const spot = hit ? this.spec?.hotspots.find((h) => h.id === hit) : null;
      this.setHover(spot && !spot.quiet ? hit : null);
    });
    el.addEventListener('pointerleave', () => {
      this.pointer.inside = false;
      this.setHover(null);
    });
    el.addEventListener('click', (ev) => {
      if (!this.interactive || this.transition < 1) return;
      const r = el.getBoundingClientRect();
      const [px, py] = this.unproject(ev.clientX - r.left, ev.clientY - r.top);
      this.emit({ type: 'plate', x: px, y: py });
      const hit = this.mask?.hit(px, py) ?? null;
      if (hit) this.emit({ type: 'select', id: hit });
    });
    window.addEventListener('resize', () => this.resize());
  }

  // ──────────────────────────────────────────────────────────────── bucle

  private frame() {
    this.clock.update();
    const dt = Math.min(this.clock.getDelta(), 0.1);
    const t = this.clock.getElapsed();

    // cámara: aproximación exponencial suave al encuadre objetivo
    const k = 1 - Math.exp(-dt * 3.2);
    this.view.cx += (this.targetView.cx - this.view.cx) * k;
    this.view.cy += (this.targetView.cy - this.view.cy) * k;
    this.view.zoom += (this.targetView.zoom - this.view.zoom) * k;

    // balanceo: la mirada sigue al puntero unos pocos píxeles de lámina + respiración lenta
    const tx = this.pointer.inside ? (this.pointer.x - 0.5) * 14 : 0;
    const ty = this.pointer.inside ? (this.pointer.y - 0.5) * 8 : 0;
    this.sway.x += (tx + Math.sin(t * 0.21) * 2.5 - this.sway.x) * (1 - Math.exp(-dt * 2));
    this.sway.y += (ty + Math.sin(t * 0.17 + 1) * 1.5 - this.sway.y) * (1 - Math.exp(-dt * 2));
    this.plate.uParallax.value.set(this.sway.x / 14, -this.sway.y / 8);

    // transición entre lugares y fundido de entrada
    if (this.transition < 1) this.transition = Math.min(1, this.transition + dt / TRANSITION_SECONDS);
    const eased = this.transition < 1 ? easeInOut(this.transition) : 1;
    this.plate.uMix.value = eased;
    if (this.transition >= 1 && this.lensWet > 0) this.lensWet = Math.max(0, this.lensWet - dt / 2.6);
    this.uLens.value = this.lensWet * this.lensWet * (3 - 2 * this.lensWet);
    this.uFade.value = Math.min(1, this.uFade.value + dt * 1.2);
    for (const e of this.ambient) e.setOpacity(eased);

    for (const a of this.attached) {
      a.fade += Math.sign(a.target - a.fade) * dt * 2.5;
      a.fade = Math.min(1, Math.max(0, a.fade));
      a.effect.setOpacity(a.fade * (a.target > 0 ? eased : 1));
      a.effect.update?.(t, dt);
    }
    this.attached = this.attached.filter((a) => {
      if (a.target === 0 && a.fade <= 0) {
        this.scene.remove(a.effect.object);
        a.effect.dispose();
        return false;
      }
      return true;
    });
    for (const e of this.ambient) e.update?.(t, dt);

    // brillos de contorno
    this.hoverAmt += ((this.hoverId ? 1 : 0) - this.hoverAmt) * (1 - Math.exp(-dt * 10));
    this.selectedAmt += ((this.selectedId ? 1 : 0) - this.selectedAmt) * (1 - Math.exp(-dt * 5));
    if (this.mask) {
      if (this.hoverId) this.plate.uHover.value = this.mask.indexOf(this.hoverId);
      if (this.selectedId) this.plate.uSelected.value = this.mask.indexOf(this.selectedId);
    }
    const glows = (id: string | null) => !!id && this.spec?.hotspots.find((h) => h.id === id)?.glow !== false;
    this.plate.uHoverAmt.value = glows(this.hoverId) ? this.hoverAmt : 0;
    this.plate.uSelectedAmt.value = glows(this.selectedId) ? this.selectedAmt : 0;
    this.plate.update(t);

    // relámpago y viento del puntero
    this.plate.uFlash.value *= Math.exp(-dt * 7);
    this.nextLightning -= dt;
    if (this.nextLightning <= 0 && this.quality.motion) {
      this.flash(0.6 + Math.random() * 0.5);
      this.nextLightning = 14 + Math.random() * 26;
    }
    const vx = dt > 0 ? (this.pointer.x - this.lastPointer.x) / dt : 0;
    this.lastPointer.x = this.pointer.x;
    const targetWind = Math.max(-1, Math.min(1, -vx * 0.9));
    uWind.value += (targetWind - uWind.value) * (1 - Math.exp(-dt * (Math.abs(targetWind) > Math.abs(uWind.value) ? 6 : 1.5)));

    // cámara ortográfica sobre la lámina
    const s = this.scale();
    const [cx, cy] = this.effectiveCenter();
    const halfW = this.width / (2 * s);
    const halfH = this.height / (2 * s);
    this.camera.left = -halfW;
    this.camera.right = halfW;
    this.camera.top = halfH;
    this.camera.bottom = -halfH;
    this.camera.position.set(cx, PLATE_H - cy, 50);
    this.camera.updateProjectionMatrix();

    this.pipeline.render();
    this.emit({ type: 'frame' });
  }

  dispose() {
    this.renderer.setAnimationLoop(null);
    for (const e of this.ambient) e.dispose();
    for (const a of this.attached) a.effect.dispose();
    this.mask?.dispose();
    this.textureCache.forEach((t) => t.dispose());
    this.renderer.dispose();
  }
}

function easeInOut(x: number) {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}
