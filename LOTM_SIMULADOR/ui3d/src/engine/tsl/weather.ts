import {
  abs, clamp, dot, float, floor, fract, length, max, normalize, pow, sin, smoothstep, vec2, vec3
} from 'three/tsl';

/**
 * Tiempo meteorológico sobre la pintura, escrito para este proyecto (técnicas clásicas de celdas con hash):
 *  - glassDrops: gotas quietas y gotas que resbalan dejando estela sobre un cristal
 *  - rainRipples: anillos de impacto en charcos
 * Todas las funciones trabajan en píxeles de lámina (Y hacia abajo) y devuelven nodos TSL.
 */

type N = any; // los nodos TSL tipados estrictamente hacen ilegible la composición matemática

/** hash 2D → 1D sin trigonometría (estable en GPU) */
export function hash21(p: N): N {
  const q: N = fract(vec3(p.x, p.y, p.x).mul(vec3(0.1031, 0.1103, 0.0973)));
  const r: N = q.add(dot(q, q.yzx.add(33.33)));
  return fract(r.x.add(r.y).mul(r.z));
}

/** hash 2D → 2D */
export function hash22(p: N): N {
  const q: N = fract(vec3(p.x, p.y, p.x).mul(vec3(0.1031, 0.103, 0.0973)));
  const r: N = q.add(dot(q, q.yzx.add(33.33)));
  return fract(vec2(r.x.add(r.y).mul(r.z), r.x.add(r.z).mul(r.y)));
}

/**
 * Intensidad de agua sobre el cristal en un punto (0..1).
 * `p` en px de lámina, `t` en segundos, `rain` 0..1.
 */
function dropField(p: N, t: N, rain: N): N {
  // ── gotas quietas: una por celda de 22 px, aparecen y se evaporan
  const cs: N = float(22);
  const cell: N = floor(p.div(cs));
  const h: N = hash22(cell);
  const life: N = fract(t.mul(0.07).add(hash21(cell.add(7.3))));
  const fade: N = smoothstep(0, 0.08, life).mul(smoothstep(1, 0.55, life));
  const center: N = cell.add(h.mul(0.6).add(0.2)).mul(cs);
  const radius: N = h.x.mul(4.5).add(1.8);
  const stat: N = smoothstep(radius, radius.mul(0.35), length(p.sub(center))).mul(fade).mul(smoothstep(0.25, 0.7, rain));

  // ── gotas que resbalan: columnas de 46 px, cada una con su velocidad
  const cw: N = float(46);
  const colId: N = floor(p.x.div(cw));
  const hc: N = hash22(vec2(colId, 17.1));
  const period: N = float(260).add(hc.y.mul(220));
  const cellY: N = floor(p.y.add(hc.x.mul(500)).div(period));
  const hr: N = hash22(vec2(colId, cellY));
  const localY: N = fract(p.y.add(hc.x.mul(500)).div(period)); // 0 arriba, 1 abajo
  // avance a tirones: se detiene y cae (curva escalonada suave)
  const ph: N = fract(t.mul(hr.y.mul(0.09).add(0.05)).add(hr.x));
  const head: N = ph.add(sin(ph.mul(18)).mul(0.012)).mul(0.9).add(0.05);
  const wob: N = sin(p.y.mul(0.06).add(hr.x.mul(20))).mul(4).mul(hr.y.sub(0.5));
  const lx: N = fract(p.x.div(cw)).sub(0.5).mul(cw).sub(hc.x.sub(0.5).mul(cw).mul(0.5)).sub(wob);
  const dy: N = localY.sub(head).mul(period);
  const headR: N = hr.x.mul(3).add(4);
  const headMask: N = smoothstep(headR, headR.mul(0.3), length(vec2(lx, dy.mul(0.8))));
  // estela: encima de la cabeza, más fina y moteada
  const above: N = smoothstep(2, -2, dy).mul(smoothstep(period.mul(-0.5), float(0), dy));
  const trailW: N = headR.mul(0.35).mul(smoothstep(period.mul(-0.5), float(0), dy));
  const trail: N = smoothstep(trailW.add(0.8), trailW.mul(0.4), abs(lx)).mul(above).mul(0.55);
  const beadsY: N = fract(p.y.div(13).add(hr.y.mul(9)));
  const beads: N = smoothstep(0.42, 0.1, length(vec2(lx.div(4.5), beadsY.sub(0.5)))).mul(above).mul(0.8);
  const moving: N = max(headMask, max(trail, beads)).mul(smoothstep(0.1, 0.55, rain)).mul(smoothstep(0.35, 0.6, hc.y.add(rain.mul(0.4))));

  return clamp(max(stat, moving), 0, 1);
}

/**
 * Gotas sobre cristal: devuelve vec3(máscara, desplazamiento x, desplazamiento y) con el desplazamiento
 * en px de lámina, calculado como gradiente de la máscara (la gota refracta lo que hay detrás).
 */
export function glassDrops(p: N, t: N, rain: N): N {
  const e: N = float(1.5);
  const c: N = dropField(p, t, rain);
  const cx: N = dropField(p.add(vec2(e, 0)), t, rain);
  const cy: N = dropField(p.add(vec2(0, e)), t, rain);
  const n: N = vec2(cx.sub(c), cy.sub(c)).mul(9);
  return vec3(c, n.x, n.y);
}

/**
 * Anillos de lluvia en charcos: desplazamiento vec2 en px de lámina y brillo del frente de onda (z).
 * Celdas de 34 px con un impacto cada una; se consulta la vecindad 3×3 para que los anillos crucen celdas.
 */
export function rainRipples(p: N, t: N, rain: N): N {
  const cs: N = float(34);
  const base: N = floor(p.div(cs));
  let offX: N = float(0);
  let offY: N = float(0);
  let crest: N = float(0);
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      const cell = base.add(vec2(i, j));
      const h = hash22(cell);
      const rate = h.y.mul(0.5).add(0.7);
      const ph = fract(t.mul(rate).add(h.x));
      const center = cell.add(h).mul(cs);
      const v = p.sub(center);
      const dist = length(v);
      const radius = ph.mul(cs).mul(1.3);
      const d = dist.sub(radius);
      const ring = sin(d.mul(0.9)).mul(smoothstep(-9, -3, d)).mul(smoothstep(0, -3, d));
      const fade = pow(float(1).sub(ph), 2).mul(smoothstep(0.25, 0.9, rain)).mul(smoothstep(0.35, 0.6, hash21(cell.add(3.1)).add(rain.mul(0.5))));
      const dir = normalize(v.add(vec2(1e-4, 0)));
      offX = offX.add(dir.x.mul(ring).mul(fade));
      offY = offY.add(dir.y.mul(ring).mul(fade));
      crest = crest.add(max(ring, 0).mul(fade));
    }
  }
  return vec3(offX, offY, crest);
}

