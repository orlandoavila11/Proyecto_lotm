# INFORME TÉCNICO DE ENTREGA — BRIEF-10.VISUAL-R2: FUNDAMENTOS DE ESCENA
**Proyecto:** Path to Godhood (*LOTM_ENGINE_REBORN*)  
**Fecha:** 18 de septiembre de 2026  
**Autoridad:** Director de Proyecto  
**Estado:** LISTO PARA REVISIÓN (Fase 1 ABIERTA)  
**Commit Auditado:** `0c2aeb1` + cambios locales verificados  

---

## 1. Declaración de Cumplimiento Constitucional

- **Fase 1 ABIERTA:** Se preserva intacta la delimitación de Fase 1; ningún agente declara cambio de fase.
- **Tier L Inmutable:** 67/67 archivos verificados sin alteración (`verify:tier-l` PASS).
- **Tier G y Motores de Dominio Intactos:** Cero modificaciones en `reborn/src/core/` y `reborn/data/gameplay/balance/`.
- **Cero Math.random:** Determinismo absoluto verificado por `lint:determinism` (0 violaciones en 57 archivos).
- **Ley Anti-Mecánica y Ley del Objeto:** `audit:diegetic` (0 violaciones en 17 archivos escaneados). Etiquetas de reposo ≤ 7 palabras en los 11 hotspots.
- **Cero Three.js:** Escenario 2.5D por capas mediante CSS Transforms, SVG y React.

---

## 2. Entregables Técnicos Implementados

### A. SceneViewport y Escala Uniforme (`ui/src/scene/SceneViewport.tsx`)
- Lienzo lógico `1920 × 1080` (relación 16:9).
- Escala proporcional uniforme calculada dinámicamente con letterbox/pillarbox centrado.
- Funciones de transformación de coordenadas reversibles sin deriva: `toLogicalCoords(clientX, clientY)` y `toScreenCoords(logicX, logicY)`.
- Delimitación y preservación de Zona Segura Canónica (`1440 × 900`).

### B. Cámara Espacial 2.5D y Presets Tipados (`ui/src/scene/SceneCamera.tsx` & `types.ts`)
- Presets canónicos aprobados en Contrato Visual v1.0:
  - `WIDE_OVERVIEW`: `(x: 0, y: 0, zoom: 1.0)`
  - `FOCUS_DESK`: `(x: 0, y: 180, zoom: 1.35)`
  - `FOCUS_CORKBOARD`: `(x: 520, y: -80, zoom: 1.50)`
  - `FOCUS_HORNACINA`: `(x: 0, y: -260, zoom: 1.65)`
  - `FOCUS_STAIRCASE`: `(x: -540, y: 40, zoom: 1.40)`
- Transición suave con `cubic-bezier(0.16, 1, 0.3, 1)` a 300 ms, sustituida por `0 ms` bajo `prefers-reduced-motion: reduce`.

### C. Máquina Central de Navegación (`ui/src/scene/navigation/navigationReducer.ts`)
- Reducer puro determinista con matriz estricta de transiciones válidas:
  - Estados: `DESK_WIDE`, `DESK_FOCUS`, `INSPECTION_LAYER`, `CORKBOARD_STAGE`, `COMBAT_STAGE`, `CEREMONY_STAGE`, `CALENDAR_STAGE`, `MARKET_STAGE`, `ACTING_STAGE`.
  - Guardias de rechazo: transiciones incompatibles (ej. salto directo desde inspección a combate sin cerrar) son bloqueadas sin alterar el estado.
  - Pila de historial (`focusHistory`): garantiza restauración exacta del elemento enfocado tras `Escape` o `Volver`.
  - Guardia anti doble-despacho (`isPendingOperation`).

### D. Contrato Único de Hotspots (`ui/src/scene/HotspotButton.tsx`)
- Elementos semánticos `<button type="button">` con accesibilidad completa (`aria-label`, `aria-description`).
- Hit area coincidente con las dimensiones físicas del objeto (todas `>= 44 × 44 px`).
- Anillo de latón victoriano de alto contraste para foco visible (`lotm-focus-ring: 2px solid #d4af37, shadow 12px gold glow`).
- Badge flotante para Modo Atención con etiqueta diegética en reposo (≤ 7 palabras).

### E. Navegación Espacial y Accesibilidad por Teclado (`ui/src/scene/spatialNavigation.ts`)
- Grafo de adyacencia direccional en 4 sentidos (`ArrowLeft`, `ArrowRight`, `ArrowUp`, `ArrowDown`) para transitar fluidamente entre los 11 hotspots del Desván.
- Recorrido secuencial cíclico con `Tab` y `Shift+Tab`.
- Activación con `Enter` o `Espacio`.
- Retorno y cierre con `Escape`.
- Alternancia de Modo Atención con tecla `A` o clic.

### F. Capa de Inspección Focal y Texto Refluible (`ui/src/scene/InspectionLayer.tsx`)
- Capa 4 de elevación (`z-index: 40`), diálogo modal accesible con trampeo de foco y soporte de texto refluible ampliable al 200%.

### G. Test Harness con Fixtures Deterministas (`ui/src/harness/SceneHarness.tsx`)
- Panel de control para pruebas en vivo accesible vía query parameter `?harness=true` o botón flotante.
- Fixtures canónicos para Fool S9 (Vidente / Adrian Vance) y Visionary S9 (Espectador / Audrey Hall-Smith).
- Inspector de coordenadas en tiempo real y selector de presets de cámara.

---

## 3. Verificación de Presupuestos Técnicos (R0 vs R2)

| Métrica | Presupuesto Límite | Línea Base R0 | Medición Real R2 | Estado |
|---|---|---|---|---|
| **Bundle JS (Sin comprimir)** | `≤ 400.00 kB` | `330.46 kB` | **358.50 kB** | **CUMPLIDO** (+28.04 kB por SceneViewport, Navigation Machine, 11 Hotspots y Harness) |
| **Bundle JS (Gzip)** | `≤ 120.00 kB` | `100.03 kB` | **108.11 kB** | **CUMPLIDO** |
| **CSS Total** | `≤ 30.00 kB` | `7.48 kB` | **8.67 kB** | **CUMPLIDO** |
| **Tiempo de Build Vite** | `< 5.0 s` | `1.62 s` | **1.25 s** | **CUMPLIDO** |

---

## 4. Batería de Pruebas Automatizadas

- **Total Tests:** **153 / 153 PASS** (0 fallos, 0 saltados en 26 suites).
- **Suite R2 (`reborn/tests/ui_foundations_r2.test.ts`):**
  - ✔ 1. Inicia en `DESK_WIDE` con cámara `WIDE_OVERVIEW`.
  - ✔ 2. Permite transiciones válidas desde `DESK_WIDE`.
  - ✔ 3. Rechaza transiciones inválidas directas desde `INSPECTION_LAYER` a `COMBAT_STAGE`.
  - ✔ 4. Historial de foco y restauración de hotspot tras `CLOSE_INSPECTION`.
  - ✔ 5. Bloqueo de doble activación cuando `isPendingOperation: true`.
  - ✔ 6. Conmutación de Modo Atención y Visión Espiritual.
  - ✔ 7. Factores de escala y letterbox en los 5 viewports canónicos (`1280x720`, `1366x768`, `1440x900`, `1920x1080`, `2560x1440`).
  - ✔ 8. Reversibilidad exacta sin deriva en coordenadas pantalla <-> lógicas.
  - ✔ 9. Verificación de Zona Segura canónica (`1440x900`).
  - ✔ 10. `SPATIAL_TAB_ORDER` con los 11 hotspots sin duplicados.
  - ✔ 11. Recorrido cíclico y reverso en `getNextTabHotspot`.
  - ✔ 12. Navegación direccional en 4 sentidos en `getNextSpatialHotspot`.
  - ✔ 13. Integridad referencial de vecinos en el grafo de adyacencia.
  - ✔ 14. 11/11 hotspots cumplen con `restingLabel` ≤ 7 palabras.
  - ✔ 15. Cero términos mecánicos ("HP", "Sanidad: ", "Ruina: ", "+", "%") en etiquetas de reposo.
  - ✔ 16. Dimensiones válidas de hit area (`width >= 44`, `height >= 44`).
  - ✔ 17. Todos los presets asignados existen en `CAMERA_PRESETS`.

---

## 5. Evidencia Visual Capturada (`docs/ui-recovery/evidence/r2/`)

Se generaron 14 capturas en navegador real automatizado con Chrome:

1. `desk_wide_1280x720.png` — Escala uniforme en 720p.
2. `desk_wide_1366x768.png` — Escala uniforme en portátil 1366x768.
3. `desk_wide_1440x900.png` — Viewport principal de verificación (16:10 con letterbox centrado).
4. `desk_wide_1920x1080.png` — Lienzo lógico 1:1.
5. `desk_wide_2560x1440.png` — Escala uniforme en QHD 1440p.
6. `r2_scene_harness_wide.png` — Panel de control del Harness activo con guías de Zona Segura.
7. `r2_attention_mode_active.png` — Modo Atención activado con tecla `A` mostrando etiquetas diegéticas de ≤ 7 palabras en los 11 hotspots.
8. `r2_keyboard_tab_focus.png` — Foco visible por teclado (`Tab`) con anillo de latón dorado sobre hotspot.
9. `r2_camera_focus_desk.png` — Transición 2.5D hacia la mesa (`FOCUS_DESK`, zoom 1.35x).
10. `r2_camera_focus_corkboard.png` — Transición 2.5D hacia la pared de investigación (`FOCUS_CORKBOARD`, zoom 1.50x).
11. `r2_camera_focus_hornacina.png` — Transición 2.5D hacia la hornacina ceremonial (`FOCUS_HORNACINA`, zoom 1.65x).
12. `r2_inspection_candle.png` — Capa de inspección focal y texto refluible de la vela.
13. `r2_inspection_mirror.png` — Capa de inspección focal y texto refluible del espejo de azogue.
14. `r2_restored_focus_after_escape.png` — Retorno a la estancia con foco restaurado en el hotspot de origen tras pulsar `Escape`.

---

## 6. Registro de Fallos y Resolución Técnica

- **Incidencia 1 (Unused TS Imports):** `tsc` reportó importaciones no utilizadas en `navigationReducer.ts` y `App.tsx`.
  - *Causa:* Etapas no montadas en el shell preliminar.
  - *Solución:* Se tiparon y montaron `CALENDAR_STAGE`, `MARKET_STAGE` y `ACTING_STAGE` en la máquina central y en `App.tsx`.
- **Incidencia 2 (Pointer Events Interception):** Playwright reportó que elementos decorativos interceptaban clics durante zooms de cámara.
  - *Causa:* La clase Tailwind `pointer-events-none` carecía de regla en `tokens.css` al no estar instalado el compilador de Tailwind.
  - *Solución:* Se formalizaron `.pointer-events-none` y `.pointer-events-auto` en `tokens.css`, se asignó `pointerEvents: 'none'` al contenedor de cámara y al halo lumínico, y se blindó el stacking context de `DeskView` (`z-index: 10`) frente a `SceneHarness` (`z-index: 100`).
- **Incidencia 3 (Harness Overlap):** En resoluciones estándar, el panel del harness cubría físicamente el cuadrante de la vela.
  - *Causa:* El harness se mantenía expandido en la esquina superior izquierda.
  - *Solución:* Se automatizó el botón "Ocultar Harness" en el script de captura antes de probar clics diegéticos sobre los objetos de la mesa.

---

## 7. Próxima Acción

Queda completada la entrega técnica de **BRIEF-10.VISUAL-R2**. Se solicita la revisión del Director para aprobar R2 y autorizar el siguiente brief: **BRIEF-10.VISUAL-R3** *(Implementar El Desván como lugar: sustitución definitiva de pills/dashboard por arte 2.5D por capas y conexión de estados somáticos de vela, espejo y madera)*.

