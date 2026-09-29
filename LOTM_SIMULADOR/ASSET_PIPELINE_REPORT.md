# ASSET_PIPELINE_REPORT — PATH TO GODHOOD (AUDIT FINDING F17)
**Proyecto:** *Path to Godhood* (LOTM_ENGINE_REBORN)  
**Fecha:** 24 de Septiembre, 2026  
**Auditor Responsable:** Implementation Engineer  
**Estado:** ✅ AUDITADO Y DOCUMENTADO  

---

## 1. RESUMEN EJECUTIVO DE ACTIVOS VISUALES

| Métrica | Valor Auditado | Observación Crítica |
| :--- | :--- | :--- |
| **Total de Archivos en `ui/public/art`** | 59 archivos | Catálogo de arte 2D victoriano / diegético |
| **Tamaño Total en Disco** | **65.88 MB** | Excesivo para un cliente web ligero |
| **Formatos en Uso** | **100% JPEG (.jpg)** | 0% WebP, 0% PNG, 0% AVIF |
| **Activos Activos (Referenciados en Código)** | **32 archivos (36.20 MB)** | Utilizados por Prólogo, Desván, Vistas y Cartas |
| **Activos Huérfanos / Redundantes** | **27 archivos (29.68 MB)** | 45.0% del peso son generaciones intermedias no enlazadas |
| **Resolución Típica** | 1920 × 1080 px (fondos) / 1024 × 1024 px (objetos) | Uniforme pero sin variantes responsivas o mipmaps |

---

## 2. ANÁLISIS DE FORMATOS: JPEG vs WebP vs PNG

### 2.1 Situación Actual
- La totalidad del arte (59/59) se encuentra en formato **JPEG estándar con compresión variable**.
- **Ausencia de canal alfa (transparencia):** Dado que todos los objetos fueron exportados como JPEGs opacos, los elementos recortables (cáliz, cartas, sellos, velas) tuvieron que ser forzados con `rounded-full`, sombras CSS o máscaras SVG en lugar de usar transparencias nativas PNG/WebP.
- **Sobrecarga de Red:** Un fondo 1080p en JPEG pesa entre 1.1 MB y 2.4 MB (e.g., `GFX05_desvan_composition_integrated.jpg` pesa 2.36 MB).

### 2.2 Comparativa de Eficiencia y Proyección de Ahorro

| Formato | Peso Estimado Total | Ahorro sobre Actual | Soporte Transparencia | Recomendación |
| :--- | :--- | :--- | :--- | :--- |
| **JPEG Actual** | 65.88 MB | 0% (Base) | ❌ No | Desaprobar para sprites de objetos |
| **PNG-24** | ~92.00 MB | -39% (Mayor peso) | ✅ Sí | Solo para spritesheets y máscaras de interfaz |
| **WebP (q=85)** | **16.50 MB** | **-74.9%** | ✅ Sí | **Recomendado como estándar del motor** |
| **AVIF (q=75)** | **11.80 MB** | **-82.1%** | ✅ Sí | Candidato para despliegue de producción |

---

## 3. AUDITORÍA DE ESTADOS BROWSEADOS vs HORNEADOS (BAKED STATES)

### 3.1 Activos con Estados Horneados Problemáticos
1. **`GFX05_desvan_composition_integrated.jpg` (2.36 MB):**
   - **Problema:** La vela, el espejo de azogue, el almanaque victoriano, el tintero y la carta sellada están **horneados físicamente en el lienzo**.
   - **Impacto Diegético:** La Ley del Objeto exige que la vela cambie según la cordura (Lúcida → Llama Trémula → Mecha Ahogada), que el espejo muestre grietas o niebla según la corrupción, y que la madera envejezca con la Ruina. Al estar horneados, el motor debe sobreponer capas con opacidad o usar trucos de gradiente CSS, lo que causa artefactos visuales.
2. **`GFX40_combat_arena_floor.jpg` (1.3 MB):**
   - **Problema:** Los adoquines y la niebla perimetral están completamente fusionados.
3. **`GFX52_ritual_framing.jpg` + `GFX22_ritual_chalice.jpg`:**
   - **Problema:** El resplandor ritual y el soporte del cáliz están horneados, impidiendo animaciones de inclinación fluida sin rotar el halo de luz.

### 3.2 Candidatos Prioritarios a Despiece (Split Candidates)

| Activo Original | Componentes a Separar | Formato Óptimo | Beneficio Arquitectónico |
| :--- | :--- | :--- | :--- |
| **`GFX05` (Composición Desván)** | 1. Fondo vacío de la buhardilla y mesa (`desvan_room_clean.webp`)<br>2. Sprite de Vela con 4 estados de llama (`candle_states.webp`)<br>3. Sprite de Espejo con 4 estados de azogue (`mirror_states.webp`)<br>4. Libro de Actuación (`acting_journal.webp`) | WebP con Alpha | Renderizado somático 100% reactivo sin repintar el cuarto entero. |
| **`GFX38` (Bandeja del Bazar)** | 1. Paño de terciopelo de fondo<br>2. Miniaturas individuales de reactivos | WebP | Reutilización modular en cualquier tienda distrital. |
| **`GFX22` (Cáliz Ritual)** | 1. Cáliz de peltre opaco (`chalice_body.webp`)<br>2. Máscara de nivel de líquido para Hold-to-Drink (`potion_liquid_mask.png`) | WebP + PNG | Eliminación del cálculo manual de SVG circulares. |

---

## 4. INVENTARIO DE ACTIVOS HUÉRFANOS A PURGAR

Los siguientes **27 archivos (29.68 MB)** son residuos de iteraciones previas de generación con IA o respaldos con timestamp no referenciados en ningún componente de `ui/src`:

1. `acting_book_closed_o0_1790011467113.jpg` (1.18 MB)
2. `acting_book_open_gfx15_1790012977157.jpg` (1.16 MB)
3. `almanac_gfx18_1790013083610.jpg` (1.12 MB)
4. `brass_clock_gfx19_1790013110397.jpg` (1.11 MB)
5. `desvan_background_clean_gfx06_1790012294413.jpg` (1.20 MB)
6. `desvan_composition_c0_1790011200033.jpg` (1.18 MB)
7. `desvan_composition_c0_alt_1790012245840.jpg` (1.22 MB)
8. `GFX06_desvan_background_clean.jpg` (1.20 MB)
9. `GFX07_mahogany_desk_clean.jpg` (1.15 MB)
10. `GFX12_tallow_candle.jpg` (1.08 MB)
11. `GFX13_quicksilver_mirror.jpg` (1.10 MB)
12. `GFX14_acting_book_closed.jpg` (1.18 MB)
13. `GFX15_acting_book_open.jpg` (1.16 MB)
14. `GFX16_identity_papers.jpg` (1.14 MB)
15. `GFX17_leather_pouch.jpg` (1.10 MB)
16. `GFX20_sealed_letter.jpg` (1.09 MB)
17. `GFX59_npc_sharron.jpg` (1.12 MB)
18. `GFX60_artifact_sun_brooch.jpg` (1.05 MB)
19. `GFX61_vignette_backlund_streets.jpg` (1.24 MB)
20. `identity_papers_gfx16_1790013009094.jpg` (1.14 MB)
21. `leather_pouch_gfx17_1790013062447.jpg` (1.10 MB)
22. `mahogany_desk_clean_gfx07_1790012345898.jpg` (1.15 MB)
23. `materials_sample_s0_1790011140689.jpg` (1.10 MB)
24. `quicksilver_mirror_o0_1790011251771.jpg` (1.10 MB)
25. `S0_materials_sample.jpg` (1.10 MB)
26. `tallow_candle_o0_1790011224882.jpg` (1.08 MB)
27. `victorian_almanac_gfx18_v2_1790013629043.jpg` (1.12 MB)

---

## 5. PLAN DE ACCIÓN PARA PRODUCCIÓN

1. **Purga Inmediata:** Mover los 27 archivos huérfanos fuera del bundle público de Vite para recortar 29.68 MB en el deploy.
2. **Conversión a WebP con `sharp`:** Script batch en `ui/scripts/optimize_assets.cjs` para convertir los 32 archivos activos a WebP (q=85), reduciendo el peso de `ui/public/art` de 36.2 MB a ~9.2 MB.
3. **Pipeline Modular de Somática:** Separar los 3 objetos de somática del Desván (vela, espejo, madera) en capas independientes con canal alfa transparente para cumplir plenamente con la Ley del Objeto.

