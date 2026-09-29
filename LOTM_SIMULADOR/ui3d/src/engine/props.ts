import * as THREE from 'three/webgpu';
import { Fn, abs, dot, float, length, mix, mx_noise_float, smoothstep, texture, time, uniform, uv, vec2, vec3, vec4 } from 'three/tsl';
import { emits, occludes, toWorld, type Effect } from './effects';
import type { Vec2 } from './types';

/**
 * Manecillas del reloj de la mesa. La hora no está pintada: la da la franja del calendario de la sesión.
 * Acero pavonado con un filo de latón que recoge la luz de la vela.
 */
export class ClockHands implements Effect {
  readonly object = new THREE.Group();
  private readonly uOpacity = uniform(0);
  private readonly hour: THREE.Mesh;
  private readonly minute: THREE.Mesh;
  private readonly hub: THREE.Mesh;
  private target = { h: 0, m: 0 };
  private current = { h: 0, m: 0 };

  constructor(center: Vec2, radius: number) {
    const handMaterial = () => {
      const m = new THREE.MeshBasicNodeMaterial({ transparent: true, depthTest: false, depthWrite: false });
      m.colorNode = Fn(() => {
        const p = uv();
        // lámina ahusada con filo claro en un lado
        const width = float(1).sub(p.y).mul(0.5).add(0.12);
        const body = smoothstep(width, width.mul(0.6), abs(p.x.sub(0.5)).mul(2));
        const edge = smoothstep(0.5, 0.9, p.x).mul(0.5);
        const col = vec3(0.07, 0.06, 0.07).add(vec3(0.55, 0.42, 0.2).mul(edge));
        return vec4(col, body.mul(this.uOpacity));
      })();
      return m;
    };
    const mk = (len: number, w: number) => {
      const g = new THREE.PlaneGeometry(w, len);
      g.translate(0, len / 2 - len * 0.12, 0);
      return new THREE.Mesh(g, occludes(handMaterial()));
    };
    this.hour = mk(radius * 0.55, radius * 0.11);
    this.minute = mk(radius * 0.82, radius * 0.075);
    const hubMat = new THREE.MeshBasicNodeMaterial({ transparent: true, depthTest: false, depthWrite: false });
    hubMat.colorNode = Fn(() => {
      const d = length(uv().sub(0.5)).mul(2);
      return vec4(vec3(0.42, 0.32, 0.16).mul(smoothstep(1, 0.3, d).add(0.4)), smoothstep(1, 0.8, d).mul(this.uOpacity));
    })();
    this.hub = new THREE.Mesh(new THREE.PlaneGeometry(radius * 0.13, radius * 0.13), occludes(hubMat));
    this.object.add(this.hour, this.minute, this.hub);
    this.object.position.copy(toWorld(center, 8));
    this.object.renderOrder = 40;
    [this.hour, this.minute, this.hub].forEach((m) => (m.renderOrder = 40));
  }

  setTime(hours: number, minutes: number) {
    this.target = { h: (hours % 12) + minutes / 60, m: minutes };
  }

  setOpacity(v: number) {
    this.uOpacity.value = v;
  }

  update(_t: number, dt: number) {
    const k = 1 - Math.exp(-dt * 2.2);
    this.current.h += (this.target.h - this.current.h) * k;
    this.current.m += (this.target.m - this.current.m) * k;
    this.hour.rotation.z = -(this.current.h / 12) * Math.PI * 2;
    this.minute.rotation.z = -(this.current.m / 60) * Math.PI * 2;
  }

  dispose() {
    [this.hour, this.minute, this.hub].forEach((m) => {
      m.geometry.dispose();
      (m.material as THREE.Material).dispose();
    });
  }
}

/**
 * Retrato dentro del espejo: la persona civil del jugador, velada por el azogue. Máscara elíptica suave,
 * tinte frío de plata, reflejo cálido de la vela a la izquierda y moteado que crece con la corrupción.
 */
export class MirrorPortrait implements Effect {
  readonly object: THREE.Mesh;
  private readonly uOpacity = uniform(0);
  readonly uCorruption = uniform(0.2);
  private readonly map = texture(new THREE.Texture());

  constructor(center: Vec2, rx: number, ry: number, tex: THREE.Texture) {
    this.map.value = tex;
    const img = tex.image as { width: number; height: number } | undefined;
    const texAspect = img ? img.width / img.height : 0.75;
    const quadAspect = rx / ry;
    const mat = new THREE.MeshBasicNodeMaterial({ transparent: true, depthTest: false, depthWrite: false });
    mat.colorNode = Fn(() => {
      const p = uv();
      // cubrir el óvalo sin deformar el retrato
      const scale = texAspect > quadAspect ? vec2(quadAspect / texAspect, 1) : vec2(1, texAspect / quadAspect);
      const q = p.sub(0.5).mul(scale).add(vec2(0.5, 0.52));
      const warp = vec2(
        mx_noise_float(vec3(p.mul(6), time.mul(0.15))),
        mx_noise_float(vec3(p.mul(6).add(9), time.mul(0.13)))
      ).mul(0.006).mul(this.uCorruption.add(0.3));
      const col = this.map.sample(q.add(warp)).rgb.toVar();
      // plata fría + beso cálido de la vela
      const luma = dot(col, vec3(0.299, 0.587, 0.114));
      col.assign(mix(col, vec3(luma).mul(vec3(0.82, 0.88, 0.96)), 0.28));
      col.mulAssign(mix(vec3(1.18, 0.92, 0.7), vec3(0.8, 0.86, 0.95), smoothstep(0.1, 0.8, p.x)));
      // moteado del azogue
      const speck = smoothstep(0.62, 0.9, mx_noise_float(vec3(p.mul(48), 3.3)).mul(0.5).add(0.5));
      col.assign(mix(col, vec3(0.62, 0.64, 0.66), speck.mul(0.35).mul(this.uCorruption.add(0.25))));
      // borde elíptico brumoso
      const d = length(p.sub(0.5).mul(2));
      const alpha = smoothstep(1.0, 0.72, d).mul(this.uOpacity).mul(0.92);
      return vec4(col.mul(smoothstep(1.05, 0.4, d).mul(0.35).add(0.65)), alpha);
    })();
    this.object = new THREE.Mesh(new THREE.PlaneGeometry(rx * 2, ry * 2), occludes(mat));
    this.object.position.copy(toWorld(center, 9));
    this.object.renderOrder = 35;
  }

  setTexture(tex: THREE.Texture) {
    this.map.value = tex;
  }

  setOpacity(v: number) {
    this.uOpacity.value = v;
  }

  dispose() {
    this.object.geometry.dispose();
    (this.object.material as THREE.Material).dispose();
  }
}

/**
 * Mercancía sobre el mostrador (V05): recorte con sombra de contacto y halo dorado cuando se elige.
 * La base del objeto se apoya en `base`; la altura va en px de lámina.
 */
export class CounterItem implements Effect {
  readonly object = new THREE.Group();
  private readonly uOpacity = uniform(0);
  readonly uSelected = uniform(0);

  constructor(tex: THREE.Texture, base: Vec2, height: number) {
    const img = tex.image as { width: number; height: number };
    const w = (height * img.width) / img.height;
    const map = texture(tex);
    const px = vec2(1 / img.width, 1 / img.height).mul(6);

    const shadowMat = new THREE.MeshBasicNodeMaterial({ transparent: true, depthTest: false, depthWrite: false });
    shadowMat.colorNode = Fn(() => {
      const d = length(uv().sub(0.5).mul(vec2(2, 2)));
      return vec4(0, 0, 0, smoothstep(1, 0.2, d).mul(0.55).mul(this.uOpacity));
    })();
    const shadow = new THREE.Mesh(new THREE.PlaneGeometry(w * 1.25, height * 0.16), occludes(shadowMat));
    shadow.position.copy(toWorld([base[0] + w * 0.08, base[1] - height * 0.01], 30));

    const glowMat = new THREE.MeshBasicNodeMaterial({ transparent: true, depthTest: false, depthWrite: false, blending: THREE.AdditiveBlending });
    glowMat.colorNode = Fn(() => {
      const p = uv();
      // contorno: alfa de los vecinos menos el propio
      const a0 = map.sample(p).a;
      const n = map.sample(p.add(vec2(px.x, 0))).a.add(map.sample(p.sub(vec2(px.x, 0))).a)
        .add(map.sample(p.add(vec2(0, px.y))).a).add(map.sample(p.sub(vec2(0, px.y))).a).mul(0.25);
      const rim = smoothstep(0.02, 0.5, n).mul(float(1).sub(a0.mul(0.85)));
      return vec4(vec3(1, 0.7, 0.3).mul(rim).mul(this.uSelected).mul(1.8).mul(this.uOpacity), 1);
    })();
    const glow = new THREE.Mesh(new THREE.PlaneGeometry(w, height), emits(glowMat, 1));
    glow.position.copy(toWorld([base[0], base[1] - height / 2], 31));

    const bodyMat = new THREE.MeshBasicNodeMaterial({ transparent: true, depthTest: false, depthWrite: false });
    bodyMat.colorNode = Fn(() => {
      const c = map.sample(uv());
      return vec4(c.rgb.mul(float(0.96).add(this.uSelected.mul(0.12))), c.a.mul(this.uOpacity));
    })();
    const body = new THREE.Mesh(new THREE.PlaneGeometry(w, height), occludes(bodyMat));
    body.position.copy(toWorld([base[0], base[1] - height / 2], 32));

    shadow.renderOrder = 30;
    glow.renderOrder = 31;
    body.renderOrder = 32;
    this.object.add(shadow, body, glow);
  }

  setOpacity(v: number) {
    this.uOpacity.value = v;
  }

  dispose() {
    this.object.traverse((o) => {
      const m = o as THREE.Mesh;
      m.geometry?.dispose();
      (m.material as THREE.Material | undefined)?.dispose();
    });
  }
}
