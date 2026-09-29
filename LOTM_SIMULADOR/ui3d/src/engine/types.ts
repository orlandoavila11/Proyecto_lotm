/**
 * Tipos compartidos del motor de escena.
 *
 * Todas las coordenadas de lámina están en el lienzo lógico del Atlas: 1920×1080, origen arriba-izquierda,
 * eje Y hacia abajo. El motor las convierte a mundo (Y hacia arriba) internamente.
 */

export type Vec2 = readonly [number, number];
export type Polygon = readonly Vec2[];

export const PLATE_W = 1920;
export const PLATE_H = 1080;

/** Regiones de material de la lámina: el shader aplica un tratamiento propio a cada una. */
export const Region = {
  none: 0,
  /** azogue: ondulación que crece con la corrupción */
  mirror: 1,
  /** charcos y adoquín mojado: ondas de lluvia */
  puddle: 2,
  /** líquido del cáliz: remolino iridiscente */
  liquid: 3,
  /** cristal de ventana: gotas y regueros */
  glass: 4,
  /** brasas y fuego: parpadeo de emisión */
  embers: 5
} as const;
export type RegionId = (typeof Region)[keyof typeof Region];

export interface HotspotDef {
  /** identificador estable usado por el HUD */
  id: string;
  /** contorno en coordenadas de lámina */
  shape: Polygon;
  /** nombre accesible, se lee al enfocar con teclado */
  label: string;
  /** punto donde anclar marcadores o líneas guía; por defecto el centroide */
  anchor?: Vec2;
  /** no reacciona al puntero (sólo accesible por teclado o marcador) */
  quiet?: boolean;
  /** false: responde al puntero pero sin contorno dorado (siluetas grandes o imprecisas) */
  glow?: boolean;
}

export interface RegionDef {
  region: RegionId;
  shape: Polygon;
}

export interface PointLightDef {
  /** posición en lámina */
  at: Vec2;
  /** radio de influencia en px de lámina */
  radius: number;
  color: readonly [number, number, number];
  /** fuerza base del realce multiplicativo */
  intensity: number;
  /** 0 = estable, 1 = vela nerviosa */
  flicker: number;
}

export interface PlateSource {
  /** ruta de la lámina limpia de producción (plates/plate_v01_desvan.webp) */
  clean: string;
  /** lámina del Atlas usada mientras falte la limpia */
  atlas: string;
  /** mapa de profundidad opcional (blanco = cerca) */
  depth?: string;
}

/** Encuadre de cámara en coordenadas de lámina. zoom 1 = lámina completa a cubrir. */
export interface CameraView {
  cx: number;
  cy: number;
  zoom: number;
}

export function centroid(poly: Polygon): Vec2 {
  let x = 0, y = 0;
  for (const [px, py] of poly) { x += px; y += py; }
  return [x / poly.length, y / poly.length];
}

export function pointInPolygon(p: Vec2, poly: Polygon): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if ((yi > p[1]) !== (yj > p[1]) && p[0] < ((xj - xi) * (p[1] - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

/** Elipse aproximada por polígono (útil para espejos, esferas de reloj, bocas de cáliz). */
export function ellipse(cx: number, cy: number, rx: number, ry: number, segments = 40): Polygon {
  const pts: Vec2[] = [];
  for (let i = 0; i < segments; i++) {
    const a = (i / segments) * Math.PI * 2;
    pts.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]);
  }
  return pts;
}
