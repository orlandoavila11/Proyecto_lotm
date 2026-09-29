import * as THREE from 'three/webgpu';
import {
  Fn, abs, clamp, cos, dot, exp, float, length, max, mix, mrt, mx_fractal_noise_float, mx_noise_float,
  pow, round, sin, smoothstep, texture, time, uniform, uv, vec2, vec3, vec4
} from 'three/tsl';
import { PLATE_H, PLATE_W, Region, type PointLightDef } from './types';
import { glassDrops, rainRipples } from './tsl/weather';

export const MAX_LIGHTS = 6;

/** Blanco 1×1 y gris medio 1×1 para cuando no hay mapa real. */
function solidTexture(v: number): THREE.DataTexture {
  const t = new THREE.DataTexture(new Uint8Array([v, v, v, 255]), 1, 1, THREE.RGBAFormat);
  t.colorSpace = THREE.NoColorSpace;
  t.needsUpdate = true;
  return t;
}

interface LightUniforms {
  /** xy = posición uv, z = radio en px de lámina, w = delta de ganancia de este frame */
  pos: THREE.UniformNode<'vec4', THREE.Vector4>;
  color: THREE.UniformNode<'color', THREE.Color>;
}

/**
 * Lámina pintada convertida en superficie viva.
 *
 * La pintura ya contiene la luz del cuadro; el shader no la recalcula, la *modula*: la vela respira,
 * los faroles tiemblan, el azogue ondula según la corrupción, la lluvia corre por el cristal. Todo ello
 * queda confinado a las regiones de la máscara semántica para no ensuciar el resto de la pintura.
 */
export class PlateLayer {
  readonly mesh: THREE.Mesh;

  private readonly mapA = texture(solidTexture(0));
  private readonly mapB = texture(solidTexture(0));
  private readonly depth = texture(solidTexture(128));
  private readonly mask = texture(solidTexture(0));
  private readonly emit = texture(solidTexture(0));
  /** 1 = hay mapa de emisión pintado (emit_*); 0 = se estima de la pintura */
  readonly uEmitMap = uniform(0);

  readonly uMix = uniform(1);
  readonly uHover = uniform(0);
  readonly uSelected = uniform(0);
  readonly uHoverAmt = uniform(0);
  readonly uSelectedAmt = uniform(0);
  readonly uParallax = uniform(new THREE.Vector2());
  readonly uParallaxAmt = uniform(0);
  readonly uMirror = uniform(0.25);
  readonly uRain = uniform(0);
  readonly uEmbers = uniform(0);
  readonly uExposure = uniform(1);
  readonly uSaturation = uniform(1);
  readonly uTint = uniform(new THREE.Color(1, 1, 1));
  readonly uGold = uniform(new THREE.Color(1.0, 0.78, 0.38));
  readonly lights: LightUniforms[] = [];
  /** calima: xy = centro en px de lámina, zw = semiejes (0 = apagada) */
  readonly hazes = Array.from({ length: 3 }, () => uniform(new THREE.Vector4(0, 0, 0, 0)));
  /** relámpago: 0..1, decae solo */
  readonly uFlash = uniform(0);

  private lightDefs: readonly PointLightDef[] = [];
  private readonly flickerSeeds = Array.from({ length: MAX_LIGHTS }, (_, i) => 1.7 + i * 2.31);
  /** ganancia extra por estado de juego (p.ej. la vela de la cordura), por índice de luz */
  readonly lightStateGain = new Float32Array(MAX_LIGHTS).fill(1);

  constructor() {
    for (let i = 0; i < MAX_LIGHTS; i++) {
      this.lights.push({ pos: uniform(new THREE.Vector4(0, 0, 1, 0)), color: uniform(new THREE.Color(1, 0.7, 0.4)) });
    }

    const material = new THREE.MeshBasicNodeMaterial({ depthWrite: false, depthTest: false });
    // un solo nodo calcula color (rgb) y emisión (a); el canal "glow" alimenta el bloom selectivo (Stage)
    const out = this.buildColorNode();
    material.colorNode = vec4(out.rgb, 1);
    material.mrtNode = mrt({ glow: vec4(vec3(out.a), 1) });
    const geometry = new THREE.PlaneGeometry(PLATE_W, PLATE_H);
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.set(PLATE_W / 2, PLATE_H / 2, 0);
    this.mesh.renderOrder = -100;
    this.mesh.frustumCulled = false;
  }

  private buildColorNode() {
    const { mapA, mapB, depth, mask, emit } = this;
    const px = vec2(1 / PLATE_W, 1 / PLATE_H);
    const t = time;

    /** coincidencia exacta de índice en la máscara (0/1), 0 si el objetivo es 0 */
    const match = (idx: any, target: any) =>
      float(1).sub(clamp(abs(idx.sub(target)), 0, 1)).mul(clamp(target, 0, 1));

    return Fn(() => {
      const vUv = uv();

      // ── paralaje por profundidad (si existe mapa; si no, gris medio = sin desplazamiento)
      const d = depth.sample(vUv).r;
      const pUv = vUv.add(this.uParallax.mul(d.sub(0.45)).mul(this.uParallaxAmt)).toVar();

      const m0 = mask.sample(pUv);
      const region = round(m0.g.mul(255));
      const inRegion = (r: number) => float(1).sub(clamp(abs(region.sub(r)), 0, 1));

      const isMirror = inRegion(Region.mirror);
      const isPuddle = inRegion(Region.puddle);
      const isLiquid = inRegion(Region.liquid);
      const isGlass = inRegion(Region.glass);
      const isEmbers = inRegion(Region.embers);

      // ── azogue: ondulación lenta, más profunda cuanto más corrupción
      const mirrorN = vec2(
        mx_noise_float(vec3(pUv.mul(vec2(7, 4.5)), t.mul(0.18))),
        mx_noise_float(vec3(pUv.mul(vec2(6, 5)).add(19.3), t.mul(0.21)))
      );
      const mirrorOff = mirrorN.mul(0.0042).mul(this.uMirror).mul(isMirror);

      // posición en px de lámina (Y hacia abajo) para los efectos meteorológicos
      const pPx = vec2(pUv.x.mul(PLATE_W), float(1).sub(pUv.y).mul(PLATE_H));
      const pxToUv = (v: any) => vec2(v.x.div(PLATE_W), v.y.negate().div(PLATE_H));

      // ── charcos: anillos de impacto que desplazan el reflejo pintado
      const ripples = rainRipples(pPx, t, this.uRain);
      const puddleOff = pxToUv(vec2(ripples.x, ripples.y)).mul(2.4).mul(isPuddle);

      // ── cristal: gotas quietas y gotas que resbalan con estela; refractan lo que hay detrás
      const drops = glassDrops(pPx, t, this.uRain);
      const glassAmt = drops.x.mul(isGlass);
      const glassOff = pxToUv(vec2(drops.y, drops.z)).mul(7).mul(isGlass);

      // ── calima sobre las llamas: el aire caliente ondula la pintura
      const hazeOff = vec2(0).toVar();
      for (const H of this.hazes) {
        const local = pPx.sub(H.xy).div(H.zw);
        const w = smoothstep(1, 0.1, length(local)).mul(smoothstep(0.02, 0.2, H.z));
        const hx = mx_noise_float(vec3(pPx.mul(0.055).add(vec2(0, t.mul(2.6))), t.mul(0.7)));
        const hy = mx_noise_float(vec3(pPx.mul(0.05).add(vec2(13.1, t.mul(3.1))), t.mul(0.9)));
        hazeOff.addAssign(pxToUv(vec2(hx, hy.mul(0.6))).mul(1.6).mul(w));
      }

      const sUv = pUv.add(mirrorOff).add(puddleOff).add(glassOff).add(hazeOff);
      const base = mapA.sample(sUv).rgb.toVar();

      // ── emisión: qué partes de la pintura son fuentes de luz (llamas, faroles, ventanas encendidas).
      // Con mapa pintado se usa tal cual; sin él se estima con dos rasgos medidos sobre las láminas:
      //  · núcleo caliente: casi blanco (llama L≈0,94, lámpara L≈0,97; el papel iluminado no pasa de ≈0,75);
      //  · halo: brillo medio-alto con croma cálido relativo alto (halo de farol (r−b)/r≈0,57; pergamino ≈0,35).
      const lw = vec3(0.2126, 0.7152, 0.0722);
      const estimate = (c: any) => {
        const L = dot(c, lw);
        const chroma = c.r.sub(c.b).div(max(c.r, 0.02));
        return max(smoothstep(0.84, 0.95, L), smoothstep(0.55, 0.8, L).mul(smoothstep(0.45, 0.65, chroma)));
      };
      const emitNow = mix(estimate(base), emit.sample(pUv).r, this.uEmitMap).toVar();

      // cristal empañado: lo que no es gota se ve algo velado; la gota enfoca y brilla
      const bpx = vec2(2.6 / PLATE_W, 2.6 / PLATE_H);
      const fogged = mapA.sample(sUv.add(bpx)).rgb.add(mapA.sample(sUv.sub(bpx))).rgb
        .add(mapA.sample(sUv.add(vec2(bpx.x, bpx.y.negate()))).rgb).add(mapA.sample(sUv.sub(vec2(bpx.x, bpx.y.negate()))).rgb)
        .mul(0.25);
      base.assign(mix(base, mix(fogged.mul(vec3(0.92, 0.97, 1.06)), base, clamp(glassAmt.mul(1.4), 0, 1)), isGlass.mul(this.uRain).mul(0.8)));
      base.addAssign(vec3(0.6, 0.68, 0.8).mul(pow(clamp(drops.y.mul(0.5).add(0.5).mul(glassAmt), 0, 1), 2)).mul(0.3).mul(isGlass));
      // cresta de las ondas: recoge la luz de los faroles
      base.addAssign(vec3(1.0, 0.8, 0.55).mul(clamp(ripples.z, 0, 1)).mul(base.add(0.04)).mul(1.3).mul(isPuddle));

      // brillo nacarado del azogue
      const sheen = pow(clamp(mx_noise_float(vec3(pUv.mul(vec2(3, 9)), t.mul(0.12))).mul(0.5).add(0.5), 0, 1), 5);
      base.addAssign(vec3(0.62, 0.66, 0.74).mul(sheen).mul(isMirror).mul(0.12).mul(this.uMirror.add(0.4)));

      // líquido del cáliz: superficie oscura con un velo iridiscente que gira despacio
      const swirl = mx_fractal_noise_float(vec3(pUv.mul(vec2(34, 60)), t.mul(0.08)), 3, 2, 0.5);
      const irid = vec3(0.5).add(cos(vec3(0, 2.1, 4.2).add(swirl.mul(5)).add(t.mul(0.25))).mul(0.5));
      const sheenL = pow(clamp(swirl.mul(0.6).add(0.5), 0, 1), 4);
      const liquid = base.mul(0.42).add(irid.mul(vec3(0.35, 0.5, 0.6)).mul(sheenL).mul(0.32));
      base.assign(mix(base, liquid, isLiquid));

      // brasas: la emisión respira
      const emb = mx_noise_float(vec3(pUv.mul(38), t.mul(1.7))).mul(0.5).add(0.5);
      base.mulAssign(float(1).add(isEmbers.mul(emb).mul(0.55).mul(this.uEmbers)));

      // ── reiluminación: cada luz añade una ganancia multiplicativa con caída suave
      const lightAdd = vec3(0).toVar();
      for (const L of this.lights) {
        const dist = length(pUv.sub(L.pos.xy).mul(vec2(PLATE_W, PLATE_H)));
        const fall2 = pow(clamp(float(1).sub(dist.div(L.pos.z)), 0, 1), 2);
        lightAdd.addAssign(L.color.mul(fall2.mul(L.pos.w)));
      }
      base.mulAssign(vec3(1).add(lightAdd));
      // la luz que respira (vela de la cordura, faroles) también late en el resplandor
      const emission = emitNow.mul(float(1).add(dot(lightAdd, lw).mul(1.5))).add(isEmbers.mul(emb).mul(this.uEmbers).mul(0.8)).toVar();

      // ── brillo de contorno dorado: hover y objeto señalado comparten las mismas muestras
      const idx0 = round(m0.r.mul(255));
      const insideH = match(idx0, this.uHover);
      const insideS = match(idx0, this.uSelected);
      const ringH1 = float(0).toVar();
      const ringS1 = float(0).toVar();
      const ringH2 = float(0).toVar();
      const ringS2 = float(0).toVar();
      const dirs = [[1, 0], [0.707, 0.707], [0, 1], [-0.707, 0.707], [-1, 0], [-0.707, -0.707], [0, -1], [0.707, -0.707]];
      for (const [dx, dy] of dirs) {
        const i1 = round(mask.sample(pUv.add(px.mul(vec2(dx * 3, dy * 3)))).r.mul(255));
        const i2 = round(mask.sample(pUv.add(px.mul(vec2(dx * 11, dy * 11)))).r.mul(255));
        const h1 = match(i1, this.uHover);
        const s1 = match(i1, this.uSelected);
        ringH1.addAssign(h1);
        ringS1.addAssign(s1);
        ringH2.addAssign(match(i2, this.uHover));
        ringS2.addAssign(match(i2, this.uSelected));
      }
      // antialiasing del contorno: cobertura del objeto con 4 submuestras (borde exterior) y borde interior
      // graduado por la fracción de vecinos fuera (media, no mínimo): sin escalones en las diagonales
      const covH = float(0).toVar();
      const covS = float(0).toVar();
      for (const [ox, oy] of [[0.35, 0.15], [-0.15, 0.35], [-0.35, -0.15], [0.15, -0.35]]) {
        const ic = round(mask.sample(pUv.add(px.mul(vec2(ox, oy)))).r.mul(255));
        covH.addAssign(match(ic, this.uHover).mul(0.25));
        covS.addAssign(match(ic, this.uSelected).mul(0.25));
      }
      const outer = (r1: any, r2: any, inside: any) => r1.mul(0.09).add(r2.mul(0.045)).mul(float(1).sub(inside));
      const rimH = covH.mul(clamp(float(1).sub(ringH1.div(8)).mul(1.6), 0, 1));
      const rimS = covS.mul(clamp(float(1).sub(ringS1.div(8)).mul(1.6), 0, 1));
      const pulse = sin(t.mul(2.2)).mul(0.25).add(0.75);
      const glowH = rimH.mul(0.9).add(outer(ringH1, ringH2, insideH)).mul(this.uHoverAmt);
      const glowS = rimS.mul(0.55).add(outer(ringS1, ringS2, insideS).mul(1.25)).mul(this.uSelectedAmt).mul(pulse);
      base.mulAssign(float(1).add(insideH.mul(0.07).mul(this.uHoverAmt)));
      base.addAssign(this.uGold.mul(max(glowH, glowS)).mul(1.35));
      emission.addAssign(max(glowH, glowS).mul(0.9));

      // ── transición quemada: la lámina nueva (A) aparece sobre la anterior (B) desde un papel que arde
      const n = mx_fractal_noise_float(vec3(vUv.mul(vec2(3.2, 1.8)), 3.7), 4, 2, 0.5).mul(0.5).add(0.5);
      const k = this.uMix.mul(1.3).sub(0.15);
      const reveal = float(1).sub(smoothstep(k.sub(0.035), k.add(0.035), n));
      const prev = mapB.sample(vUv).rgb;
      const edge = exp(abs(n.sub(k)).mul(-38)).mul(clamp(this.uMix.mul(float(1).sub(this.uMix)).mul(5), 0, 1));
      const mixed = mix(prev.mul(float(1).sub(edge.mul(0.8))), base, reveal).add(vec3(1.0, 0.42, 0.08).mul(edge).mul(2.2));
      // la lámina anterior conserva su resplandor estimado mientras arde; el borde del papel en llamas brilla
      const glow = mix(estimate(prev), emission, reveal).add(edge.mul(1.2)).add(isGlass.mul(this.uFlash).mul(0.6));

      // ── gradación de lugar/hora/estado
      const luma = dot(mixed, vec3(0.2126, 0.7152, 0.0722));
      const graded = mix(vec3(luma), mixed, this.uSaturation).mul(this.uTint).mul(this.uExposure)
        .mul(vec3(1).add(vec3(0.75, 0.85, 1.15).mul(this.uFlash).mul(float(1).add(isGlass.mul(1.5)).add(isPuddle))));
      return vec4(graded, clamp(glow, 0, 2));
    })();
  }

  setPlate(tex: THREE.Texture) {
    this.mapA.value = tex;
  }

  /** copia la lámina actual a B para poder quemarla en la transición */
  beginTransition() {
    this.mapB.value = this.mapA.value;
    this.uMix.value = 0;
  }

  setDepth(tex: THREE.Texture | null, amount = 0.022) {
    this.depth.value = tex ?? solidTexture(128);
    this.uParallaxAmt.value = tex ? amount : 0;
  }

  /** mapa de emisión pintado (blanco = fuente de luz) o null para estimarlo de la pintura */
  setEmission(tex: THREE.Texture | null) {
    this.emit.value = tex ?? solidTexture(0);
    this.uEmitMap.value = tex ? 1 : 0;
  }

  setMask(tex: THREE.Texture) {
    this.mask.value = tex;
  }

  setHazes(list: readonly { at: readonly [number, number]; width: number; height: number }[]) {
    this.hazes.forEach((u, i) => {
      const h = list[i];
      u.value.set(h ? h.at[0] : 0, h ? h.at[1] : 0, h ? h.width : 0, h ? h.height : 0);
    });
  }

  setLights(defs: readonly PointLightDef[]) {
    this.lightDefs = defs.slice(0, MAX_LIGHTS);
    this.lightStateGain.fill(1);
    this.lights.forEach((L, i) => {
      const def = this.lightDefs[i];
      if (!def) {
        L.pos.value.set(-10, -10, 1, 0);
        return;
      }
      L.pos.value.set(def.at[0] / PLATE_W, 1 - def.at[1] / PLATE_H, def.radius, 0);
      L.color.value.setRGB(...def.color);
    });
  }

  /** actualiza el parpadeo de cada luz (ruido suave de varias frecuencias, sin azar no determinista) */
  update(elapsed: number) {
    this.lightDefs.forEach((def, i) => {
      const s = this.flickerSeeds[i];
      const wobble =
        Math.sin(elapsed * 7.3 + s) * 0.45 +
        Math.sin(elapsed * 13.1 + s * 2.1) * 0.3 +
        Math.sin(elapsed * 2.3 + s * 0.7) * 0.25;
      const gust = Math.max(0, Math.sin(elapsed * 0.9 + s * 3.3)) ** 12 * -0.9;
      const flicker = (wobble * 0.5 + gust) * def.flicker;
      const state = this.lightStateGain[i];
      // ganancia final: intensidad base × estado + parpadeo; resta al apagarse la vela
      this.lights[i].pos.value.w = def.intensity * (state - 1 + flicker * 0.6) + (state - 1) * 0.35;
    });
  }
}
