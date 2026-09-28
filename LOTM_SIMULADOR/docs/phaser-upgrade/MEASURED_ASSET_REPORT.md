# MEASURED ASSET REPORT — PATH TO GODHOOD (PROMPT P05)
**Fecha:** 28 de septiembre de 2026  
**Autor:** Production Asset Integrator (Prompt P05)  
**Estado:** ✅ MANIFIESTO VERIFICADO Y MEDIDO  

---

## 1. RESUMEN DE CONSUMO DE RECURSOS Y MEMORIA

> [!IMPORTANT]
> **Invariante de Renderizado:** La compresión en disco (JPEG/WebP) reduce los bytes transferidos en red, pero **NO reduce la huella de memoria en GPU/RAM**. Toda textura se descomprime a formato RGBA de 32-bits (`ancho × alto × 4 bytes`).

| Métrica Global | Valor Medido | Observación |
| :--- | :--- | :--- |
| **Total de Archivos en Disco (`ui/public/art`)** | **59 archivos** | Catálogo verificado |
| **Activos Activos en Manifiesto** | **31 activos** | Asignados a grupos de carga de Phaser |
| **Transferencia en Red (Activos)** | **22.36 MB** | Bytes transferidos por HTTP |
| **Memoria Decodificada en GPU (Activos)** | **125.94 MB** | Huella total si todos estuviesen en VRAM simultáneamente |
| **Archivos Huérfanos / Respaldos Antiguos** | **28 archivos (43.52 MB)** | Preservados para revisión; no precargados en el grupo crítico |

---

## 2. DESGLOSE POR GRUPOS DE CARGA (`loadingGroup`)

La política de gestión de texturas con conteo de referencias (`AssetManager`) solo carga el grupo necesario para la escena activa y libera la memoria al transicionar:

| Grupo de Carga (`loadingGroup`) | N.º Activos | Transferencia (Disco) | Memoria Decodificada (VRAM) | Política de Ciclo de Vida |
| :--- | :---: | :---: | :---: | :--- |
| **`critical_refuge`** | 14 | 7.78 MB | 56.62 MB | Preload y retención por escena |
| **`scene_investigation`** | 9 | 7.72 MB | 36.92 MB | Preload y retención por escena |
| **`scene_market`** | 2 | 1.05 MB | 8.06 MB | Preload y retención por escena |
| **`scene_combat`** | 1 | 0.65 MB | 4.03 MB | Preload y retención por escena |
| **`scene_travel`** | 2 | 2.85 MB | 8.06 MB | Preload y retención por escena |
| **`scene_ascension`** | 3 | 2.32 MB | 12.23 MB | Preload y retención por escena |

---

## 3. FAMILIAS DE ESTADO SOMÁTICO DE EL DESVÁN

### 3.1 Familia de Espejo de Azogue (`obj_mirror_*`)
Las 4 variantes canónicas de corrupción mapeadas 1:1 con la Ley del Objeto:
1. **`obj_mirror_pristine` (`GFX13_quicksilver_mirror.jpg`):** 1024×1024 px · 0.30 MB · Azogue limpio.
2. **`obj_mirror_turbid` (`GFX24_mirror_turbid.jpg`):** 1408×768 px · 0.59 MB · Vaho tenue.
3. **`obj_mirror_undulating` (`GFX25_mirror_undulating.jpg`):** 1408×768 px · 0.98 MB · Reflejos desfasados.
4. **`obj_mirror_monstrous` (`GFX26_mirror_monstrous.jpg`):** 1380×752 px · 1.52 MB · El reflejo no parpadea.

### 3.2 Fondo de El Desván: Composición vs Clean Plate
- **Fondo Limpio (`bg_desvan_clean` - `GFX06`):** 1376×768 px · Sin objetos interactivos horneados.
- **Fondo de Composición (`bg_desvan_composition` - `C0`):** 1376×768 px · Textura atmosférica de referencia.

---

## 4. POLÍTICA DE GESTIÓN DE TEXTURAS Y PREVENCIÓN DE FUGAS

1. **Adquisición por Grupo:** `AssetManager.acquireGroup(scene, group)` incrementa el contador de referencias. Si el grupo ya está en caché, no re-descarga texturas.
2. **Liberación Estricta:** `AssetManager.releaseGroup(scene, group)` decrementa el contador. Cuando llega a cero, expulsa del `scene.textures` aquellas que no pertenecen a `shared_ui` ni a otros grupos activos.
3. **Validación Fail-Loud:** Si un recurso referenciado no existe o su hash SHA-256 está corrupto, la escena emite un evento estructurado `LOAD_ERROR` al `GameBridge` sin congelar la aplicación.
