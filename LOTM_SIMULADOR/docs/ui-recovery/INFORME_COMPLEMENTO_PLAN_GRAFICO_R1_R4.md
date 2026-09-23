# INFORME DE VALIDACIÓN Y COMPLEMENTO: PLAN DE PRODUCCIÓN GRÁFICA EN R1–R4
## Proyecto: Path to Godhood (BRIEF-10.VISUAL)
**Fecha:** 22 de septiembre de 2026  
**Autoridad:** Director de Integración Visual UI  
**Estado:** FASE 1 ABIERTA (Briefs R1 a R4 Validados con Activos GFX Reales)

---

## 1. RESUMEN EJECUTIVO

A solicitud de la Dirección, se llevó a cabo una auditoría y armonización exhaustiva entre los tres documentos del **Plan de Producción Gráfica** (`PLAN_DE_PRODUCCION_GRAFICA_DOC1.md`, `DOC2.md`, `DOC3.md`) y los cuatro briefs visuales ya implementados en el motor y la UI (**R1, R2, R3, R4**):

1. **Complemento de Documentación de Prompts (`reborn/docs/PROMPTS_IMPLEMENTACION_UI.md`):**  
   Se complementaron formalmente las secciones de los briefs R1, R2, R3 y R4 añadiendo los mapeos específicos de órdenes GFX y activos de producción (`ui/public/art/`), manteniendo **100% íntegros y verbatim** los textos originales de los prompts entre `INICIO DEL PROMPT` y `FIN DEL PROMPT` sin retrabajo redundante.
2. **Erradicación de Defectos Visuales y Modales Obsoletos:**  
   - **Corrección de Fondos Raster de Vitela (`GFX30_flat_paper.jpg`):** El activo generado incluía un margen gris de estudio perimetral. Se corrigió la sintaxis de fondo en CSS (`backgroundSize: '100% 100%, 160% 160%'`, `backgroundPosition: 'center, center'`) asegurando que el papiro envejecido cubra íntegramente las superficies sin dejar a la vista bordes de estudio.
   - **Encuadre Circular del Sello de Lacre (`GFX31_wax_seal.jpg`):** Se ajustó el recorte perimetral a escala 1.65 dentro de su marco circular con bisel de latón, eliminando el cuadrado gris perimetral.
   - **Desmantelamiento de Modales Residuales de R0:** Se detectó y eliminó un estado residual `isOpen` en `IdentityPapersObject.tsx` y `ActingBookObject.tsx` que superponía un diálogo provisional obsoleto sobre las vistas escénicas reales de R4 (`IdentityDossierView` y `ActingMirrorView`).
   - **Armonización de Alturas y Vacíos (Lienzo 1920×1080):** Se corrigió la distribución vertical en `CalendarView.tsx`, `IdentityDossierView.tsx` y `ActingMirrorView.tsx` para eliminar vacíos artificiales, aprovechando los 880px disponibles con jerarquía de cuero, caoba y latón.
3. **Mapeo de las Viñetas de Oficio Canónicas (`GFX36A–GFX36F`):**  
   Se integraron las 6 viñetas de naturalezas muertas (útiles del oficio civil sin rostros impuestos) en el expediente notarial, vinculadas directamente al origen canónico del protagonista.

---

## 2. MAPEO Y ASOCIACIÓN DE ACTIVOS GFX POR BRIEF

| Brief | Órdenes de Producción GFX | Activos Integrados en UI (`ui/public/art/`) | Rol Visual y Diegético en la Escena |
| :--- | :--- | :--- | :--- |
| **R1** | `GFX00` a `GFX04` | `C0_desvan_composition.jpg`, `S0_materials_sample.jpg`, Tríada O0 (`GFX12`, `GFX13`, `GFX14`) | Composición maestra del desván, contrato de materiales, paleta de tokens y presets de cámara tipados. |
| **R2** | `GFX28`, `GFX29`, `GFX30`, `GFX32` | `GFX30_flat_paper.jpg`, máscaras vectoriales SVG, `tokens.css`, `textures.css` | Viewport uniforme 1920×1080, grafo espacial de 11 hotspots, anillo de foco victoriano `lotm-focus-ring`. |
| **R3** | `GFX05` a `GFX11`, `GFX12` a `GFX27` | `C0_desvan_composition.jpg`, `GFX06_desvan_background_clean.jpg`, `GFX07_mahogany_desk_clean.jpg`, `GFX12` a `GFX22`, `GFX23`–`GFX27` | Los 11 objetos físicos del desván, iluminación horaria por franjas (`TimeLightingLayer`), overlay acumulativo de Ruina (`DeskCracksOverlay`). |
| **R4** | `GFX15`, `GFX16`, `GFX18`, `GFX19`, `GFX30`, `GFX31`, `GFX36A–F` | `GFX18_victorian_almanac_v2.jpg`, `GFX19_pocket_watch.jpg`, `GFX30_flat_paper.jpg`, `GFX31_wax_seal.jpg`, `GFX36A` a `GFX36F` | Almanaque de 4 franjas horarias (`CalendarView`), Expediente Notarial con sello real y viñeta de oficio (`IdentityDossierView`), Cuaderno de Actuación en piel a dos páginas (`ActingMirrorView`). |

---

## 3. VIÑETAS DE OFICIO CANÓNICAS (TIER G & PLAN GRÁFICO)

De acuerdo con la ratificación del Director (BRIEF-09 y Plan de Producción Gráfica Doc 3), cada origen canónico cuenta con su viñeta de enseres civiles:

1. **Escribiente Notarial:** `GFX36A_origin_clerk.jpg` (pliego timbrado, tintero, pluma de ganso y portafolio).
2. **Estudiante de Medicina:** `GFX36B_origin_medical_student.jpg` (manual anatómico, instrumental y vendas).
3. **Corresponsal de Sucesos:** `GFX36C_origin_reporter.jpg` (libreta taquigráfica, lápiz de grafito y recortes de prensa).
4. **Espiritista de Salón:** `GFX36D_origin_medium.jpg` (péndulo de cuarzo y paño de terciopelo).
5. **Estibador de Muelles:** `GFX36E_origin_dockworker.jpg` (gancho de estiba y cuerda alquitranada).
6. **Detective Privado:** `GFX36F_origin_detective.jpg` (lupa victoriana, pipa de brezo y libreta de campo).

---

## 4. EVIDENCIA DE PASO DE GATES Y SUITES DE VERIFICACIÓN

Todos los gates constitucionales y pruebas de regresión pasan al 100%:

1. **Pruebas de Dominio y Motores Core:**  
   `npm.cmd --prefix reborn run test` → **173/173 tests PASS** en 35 suites (0 fallos).
2. **Gate de Determinismo Estricto (Tercera Huelga):**  
   `npm.cmd --prefix reborn run lint:determinism` → **0 violaciones de Math.random** en 57 archivos escaneados.
3. **Gate de Prosa Diegética y Ley del Objeto:**  
   `npm.cmd --prefix reborn run audit:diegetic` → **0 violaciones** en 27 archivos UI escaneados (cero términos mecánicos visibles, etiquetas en reposo $\le 7$ palabras).
4. **Gate de Contratos de Tier G:**  
   `npm.cmd --prefix reborn run lint:tier-g` → **22/22 contratos PASS** (Zod schemas estrictos).
5. **Compilación de Producción UI:**  
   `npm.cmd --prefix ui run build` → **Compilación limpia (0 errores TypeScript)** con Vite v8 y Tailwind v4.
6. **Evidencia Visual Playwright (7 Capturas en `docs/ui-recovery/evidence/r4/`):**
   - `r4_calendar_morning_reading.png`: Almanaque y reloj victoriano con franjas y citas ineludibles.
   - `r4_calendar_action_work_executed.png`: Resolución de jornada civil y avance de franja.
   - `r4_identity_dossier_unfolded.png`: Expediente notarial con sello de lacre Loen sin defectos y viñeta GFX36A.
   - `r4_identity_dilemma_choice.png`: Fricciones de doble vida seleccionadas y botón notarial.
   - `r4_acting_book_dilemma.png`: Grimorio abierto a dos páginas con vitela completa sin bordes grises.
   - `r4_acting_resolution_recorded.png`: Registro de actuación canónica en la bitácora viva.
   - `r4_desk_synchronized_evening.png`: Retorno a la estancia con los 11 objetos físicos sincronizados en iluminación de mediodía/tarde.
