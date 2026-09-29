import type { Vec2 } from './types';

/**
 * Homografía plana 3×3: proyecta un rectángulo lógico (rejilla táctica, tablero de corcho) sobre el
 * cuadrilátero pintado en la lámina. Así la rejilla 7×5 o las tarjetas respetan exactamente la perspectiva
 * del cuadro sin reconstruir una cámara 3D.
 */
export class Homography {
  private constructor(private readonly m: Float64Array, private readonly inv: Float64Array) {}

  /**
   * src: 4 esquinas en espacio lógico (p.ej. [0,0],[7,0],[7,5],[0,5]).
   * dst: las mismas esquinas en coordenadas de lámina.
   */
  static fromQuad(src: readonly Vec2[], dst: readonly Vec2[]): Homography {
    const m = solve(src, dst);
    return new Homography(m, invert3(m));
  }

  map(p: Vec2): Vec2 {
    return apply(this.m, p);
  }

  unmap(p: Vec2): Vec2 {
    return apply(this.inv, p);
  }

  /** escala local aproximada (px de lámina por unidad lógica) alrededor de p */
  localScale(p: Vec2): number {
    const a = this.map(p);
    const b = this.map([p[0] + 0.01, p[1]]);
    const c = this.map([p[0], p[1] + 0.01]);
    const sx = Math.hypot(b[0] - a[0], b[1] - a[1]) / 0.01;
    const sy = Math.hypot(c[0] - a[0], c[1] - a[1]) / 0.01;
    return Math.sqrt(sx * sy);
  }

  /** matriz fila-mayor para pasar a un shader */
  get matrix(): Float64Array {
    return this.m;
  }

  get inverse(): Float64Array {
    return this.inv;
  }
}

function apply(m: Float64Array, [x, y]: Vec2): Vec2 {
  const w = m[6] * x + m[7] * y + m[8];
  return [(m[0] * x + m[1] * y + m[2]) / w, (m[3] * x + m[4] * y + m[5]) / w];
}

/** Resuelve la DLT de 8 incógnitas con eliminación gaussiana. */
function solve(src: readonly Vec2[], dst: readonly Vec2[]): Float64Array {
  const A: number[][] = [];
  const b: number[] = [];
  for (let i = 0; i < 4; i++) {
    const [x, y] = src[i];
    const [u, v] = dst[i];
    A.push([x, y, 1, 0, 0, 0, -u * x, -u * y]);
    b.push(u);
    A.push([0, 0, 0, x, y, 1, -v * x, -v * y]);
    b.push(v);
  }
  const n = 8;
  for (let col = 0; col < n; col++) {
    let pivot = col;
    for (let r = col + 1; r < n; r++) if (Math.abs(A[r][col]) > Math.abs(A[pivot][col])) pivot = r;
    [A[col], A[pivot]] = [A[pivot], A[col]];
    [b[col], b[pivot]] = [b[pivot], b[col]];
    for (let r = 0; r < n; r++) {
      if (r === col) continue;
      const f = A[r][col] / A[col][col];
      for (let c = col; c < n; c++) A[r][c] -= f * A[col][c];
      b[r] -= f * b[col];
    }
  }
  const h = b.map((v, i) => v / A[i][i]);
  return new Float64Array([h[0], h[1], h[2], h[3], h[4], h[5], h[6], h[7], 1]);
}

function invert3(m: Float64Array): Float64Array {
  const [a, b, c, d, e, f, g, h, i] = m;
  const A = e * i - f * h;
  const B = -(d * i - f * g);
  const C = d * h - e * g;
  const det = a * A + b * B + c * C;
  const inv = new Float64Array([
    A, -(b * i - c * h), b * f - c * e,
    B, a * i - c * g, -(a * f - c * d),
    C, -(a * h - b * g), a * e - b * d
  ]);
  for (let k = 0; k < 9; k++) inv[k] /= det;
  return inv;
}
