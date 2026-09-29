import type { Effect } from './effects';
import type { CameraView, HotspotDef, PlateSource, PointLightDef, RegionDef } from './types';

/** Gradación de color del lugar (hora del día, estado somático). */
export interface Grade {
  exposure: number;
  saturation: number;
  tint: readonly [number, number, number];
}

export interface BuildContext {
  /** true si la lámina en uso es la del Atlas (con UI y figuras pintadas) */
  provisional: boolean;
}

/**
 * Descripción estática de un lugar: qué lámina, qué objetos se pueden tocar, dónde está la luz,
 * qué regiones tienen material vivo y qué efectos ambientales lo habitan.
 */
export interface PlaceSpec {
  key: string;
  plate: PlateSource;
  hotspots: readonly HotspotDef[];
  regions: readonly RegionDef[];
  lights: readonly PointLightDef[];
  view?: CameraView;
  /** encuadre en pantallas verticales (móvil): dónde mirar cuando no cabe la lámina entera */
  compactView?: CameraView;
  /** intensidad de lluvia en cristales/charcos (0..1) */
  rain?: number;
  /** respiración de brasas (0..1) */
  embers?: number;
  grade?: Grade;
  /** calima sobre llamas: centro (px de lámina) y semiejes de la zona que ondula */
  haze?: readonly { at: readonly [number, number]; width: number; height: number }[];
  /** relámpagos ocasionales (calles a cielo abierto) */
  lightning?: boolean;
  /** efectos ambientales propios del lugar */
  ambient?(ctx: BuildContext): Effect[];
}
