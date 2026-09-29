/**
 * Registro de assets publicados por scripts/process-assets.mjs.
 * El cliente nunca pide un archivo que no exista: si falta el definitivo usa el provisional, y si tampoco
 * hay provisional devuelve null para que la vista decida (la lámina del Atlas, un marco vacío, etc.).
 */
interface AssetManifest {
  files: string[];
  provisional: string[];
}

let manifest: AssetManifest = { files: [], provisional: [] };

export async function loadAssetManifest(): Promise<void> {
  const res = await fetch('/assets.json', { cache: 'no-cache' });
  if (!res.ok) throw new Error(`No se pudo leer el índice de assets (${res.status}). Ejecuta "npm --prefix ui3d run assets".`);
  manifest = await res.json();
}

/** ruta pública del asset definitivo, o del provisional, o null */
export function assetUrl(path: string): string | null {
  if (manifest.files.includes(path)) return `/${path}`;
  const prov = `provisional/${path}`;
  if (manifest.provisional.includes(prov)) return `/${prov}`;
  return null;
}

export function hasFinalAsset(path: string): boolean {
  return manifest.files.includes(path);
}
