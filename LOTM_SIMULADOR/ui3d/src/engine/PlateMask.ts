import * as THREE from 'three/webgpu';
import { PLATE_H, PLATE_W, type HotspotDef, type Polygon, type RegionDef } from './types';

/**
 * Máscara semántica de una lámina, rasterizada una sola vez al cargar el lugar.
 *   R = índice de hotspot (1..254, 0 = nada)
 *   G = región de material (espejo, charco, líquido, cristal, brasas)
 *
 * El mismo buffer sirve para el shader (brillo de contorno) y para el hit-testing del puntero, de modo que
 * lo que se ilumina es exactamente lo que se puede pulsar.
 */
export class PlateMask {
  /** resolución completa: el contorno dorado no se escalona al acercar la cámara */
  static readonly W = PLATE_W;
  static readonly H = PLATE_H;

  readonly texture: THREE.DataTexture;
  private readonly data: Uint8Array;
  private readonly ids: string[] = [];

  constructor(hotspots: readonly HotspotDef[], regions: readonly RegionDef[]) {
    const { W, H } = PlateMask;
    this.data = new Uint8Array(W * H * 4);
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!;

    const stamp = (shape: Polygon, write: (i: number) => void) => {
      // sólo se lee el rectángulo que ocupa el contorno
      const xs = shape.map((p) => p[0]);
      const ys = shape.map((p) => p[1]);
      const bx = Math.max(0, Math.floor(Math.min(...xs)) - 1);
      const by = Math.max(0, Math.floor(Math.min(...ys)) - 1);
      const bw = Math.min(W, Math.ceil(Math.max(...xs)) + 2) - bx;
      const bh = Math.min(H, Math.ceil(Math.max(...ys)) + 2) - by;
      if (bw <= 0 || bh <= 0) return;
      ctx.clearRect(bx, by, bw, bh);
      ctx.beginPath();
      shape.forEach(([x, y], k) => (k === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
      ctx.closePath();
      ctx.fillStyle = '#fff';
      ctx.fill();
      const px = ctx.getImageData(bx, by, bw, bh).data;
      // umbral duro: sin valores intermedios que se confundan con otro índice
      for (let y = 0; y < bh; y++) {
        for (let x = 0; x < bw; x++) {
          if (px[(y * bw + x) * 4 + 3] >= 128) write(((by + y) * W + bx + x) * 4);
        }
      }
      ctx.clearRect(bx, by, bw, bh);
    };

    for (const r of regions) stamp(r.shape, (i) => (this.data[i + 1] = r.region));
    hotspots.forEach((h, k) => {
      this.ids.push(h.id);
      const idx = k + 1;
      stamp(h.shape, (i) => (this.data[i] = idx));
    });
    for (let i = 3; i < this.data.length; i += 4) this.data[i] = 255;

    // la textura va de abajo arriba (uv.y = 0 abajo); el buffer de hit-testing, de arriba abajo
    const flipped = new Uint8Array(this.data.length);
    const row = W * 4;
    for (let y = 0; y < H; y++) flipped.set(this.data.subarray(y * row, (y + 1) * row), (H - 1 - y) * row);

    this.texture = new THREE.DataTexture(flipped, W, H, THREE.RGBAFormat);
    this.texture.magFilter = THREE.NearestFilter;
    this.texture.minFilter = THREE.NearestFilter;
    this.texture.colorSpace = THREE.NoColorSpace;
    this.texture.generateMipmaps = false;
    this.texture.needsUpdate = true;
  }

  /** índice de shader (1-based) de un hotspot, 0 si no existe */
  indexOf(id: string | null): number {
    if (!id) return 0;
    return this.ids.indexOf(id) + 1;
  }

  /** hotspot bajo un punto de lámina */
  hit(px: number, py: number): string | null {
    const x = Math.floor(px);
    const y = Math.floor(py);
    if (x < 0 || y < 0 || x >= PlateMask.W || y >= PlateMask.H) return null;
    const idx = this.data[(y * PlateMask.W + x) * 4];
    return idx > 0 ? this.ids[idx - 1] : null;
  }

  dispose() {
    this.texture.dispose();
  }
}
