# INFORME TÉCNICO DE ENTREGA — BRIEF-10.VISUAL-R3: EL DESVÁN COMO LUGAR
**Proyecto:** Path to Godhood (*LOTM_ENGINE_REBORN*)  
**Fecha:** 18 de septiembre de 2026  
**Autoridad:** Director de Proyecto  
**Estado:** LISTO PARA REVISIÓN (Fase 1 ABIERTA)  
**Campo 0 — COMMIT:** `15a13a6`  
**Commit Base:** `0c2aeb1`  
**URL de CI:** Ejecución local estricta (CI workflow idéntico verificado)  
**Contador de Sesión:** 5/20  

---

## 1. Declaración de Cumplimiento Constitucional

- **Fase 1 ABIERTA:** Se preserva intacta la delimitación de Fase 1; ningún agente declara cambio de fase sin orden explícita del Director.
- **Tier L Inmutable:** 67/67 archivos verificados sin alteración (`verify:tier-l` PASS contra SHA-256 de `manifest.json` v1.1).
- **Tier G y Motores de Dominio Intactos:** Cero modificaciones en `reborn/src/core/` y `reborn/data/gameplay/balance/`.
- **Cero Math.random:** Determinismo absoluto verificado por `lint:determinism` (0 violaciones en 57 archivos escaneados).
- **Ley Anti-Mecánica y Ley del Objeto:** `audit:diegetic` (0 violaciones en 22 archivos escaneados). Etiquetas de reposo estrictamente ≤ 7 palabras en los 11 hotspots.
- **Cero Three.js:** Escenario 2.5D por capas mediante CSS Transforms, SVG y React. Cero mallas o dependencias 3D pesadas.

---

## 2. Entregables Técnicos Implementados

### A. Los 11 Objetos Físicos Diegéticos (`ui/src/features/desk/objects/`)
Se transformó por completo la interfaz desde un dashboard abstracto a una escena victoriana interactiva en Capas 1 a 3:

1. **La Escalera y el Picaporte (`StaircaseDoorObject.tsx`):**
   - Peldaños de roble en espiral hacia la penumbra del piso inferior.
   - Pomo de latón victoriano con cerrojo de hierro forjado.
   - Indicador diegético de amenaza/vigilancia sobre el rellano.
   - Sustituye de manera tangible al botón flotante de Guardia.

2. **La Hornacina y El Cáliz de Plata (`NicheChaliceObject.tsx`):**
   - Hornacina gótica excavada en el muro con repisa de piedra oscura.
   - Cáliz cincelado en plata de ley con pátina antigua.
   - Resplandor líquido que refleja las 5 Puertas del Conocimiento Místico.
   - Destino ceremonial para avances de secuencia y rituales.

3. **El Tablero de Corcho y Clavos (`CorkboardObject.tsx`):**
   - Marco de roble con textura de corcho envejecido.
   - Recortes del *Backlund Daily Courier* y fichas policiales clavadas con chinchetas de latón.
   - Hilos rojos tensados que conectan pistas, sospechosos y distritos.
   - Portal diegético a la mesa de investigación procedural.

4. **El Reloj de Bolsillo y Almanaque (`PocketWatchObject.tsx`):**
   - Reloj de bolsillo de latón bruñido con aguja de acero azulado.
   - Cuadrante con cuatro sectores romanos para las 4 franjas horarias: `AMANECER`, `MEDIODIA`, `CREPUSCULO`, `MEDIANOCHE`.
   - Almanaque civil plegado con registro de turnos y obligaciones cotidianas.
   - Sustituye al botón flotante de Calendario.

5. **La Carta de Porte del Bazar Ocultista (`BazaarLetterObject.tsx`):**
   - Sobre de papel de trapo con sello de cera carmesí en relieve y rúbrica hermética.
   - Marca de agua del mercado clandestino y lista de transacciones.
   - Sustituye al botón flotante del Bazar.

6. **La Vela de Sebo (`CandleObject.tsx`):**
   - Palmatoria de peltre oscuro con cera goteada sobre el platillo.
   - Llama viva con física visual conectada a los 4 estados de Sanidad: `LLAMA_VIVA`, `LLAMA_VACILANTE`, `CHISPORROTEO`, `HUMO_NEGRO`.
   - Sin barras de vida ni porcentajes numéricos.

7. **El Espejo de Azogue (`SomaticMirrorObject.tsx`):**
   - Marco ovalado victoriano de latón labrado.
   - Reflejo somático conectado a los 4 estados de Corrupción: `AZOGUE_LIMPIO`, `VAHO_TENUE`, `REFLEJOS_DESFASADOS`, `GRIETAS_ESPECTRALES`.
   - Engaste superior de latón que alberga la gema o prisma para activar la **Visión Espiritual** (tecla `V` o clic), proyectando un halo etéreo violeta sobre la escena sin necesidad de botones flotantes externos.

8. **Las Grietas de la Mesa (`DeskCracksOverlay.tsx`):**
   - Veteado de caoba oscura que progresa según los 5 estados de Ruina: `INTEGRO`, `MARCADO`, `EROSIONADO`, `ROTO`, `PERDIDO`.
   - Región delimitada a 580 × 90 px, evitando interferir con el resto de la mesa.
   - Respeta el principio canónico de no regresión de la Ruina.

9. **El Cuaderno de Actuación (`ActingBookObject.tsx`):**
   - Encuadernación en cuero labrado con esquinas metálicas protegidas.
   - Sello esotérico de la Vía en portada.
   - Registro de principios, susurros y progreso de digestión.

10. **Los Papeles de Identidad Notariales (`IdentityPapersObject.tsx`):**
    - Pliegos de papel timbrado del Reino de Loen con sellos oficiales de cera.
    - Anclas de humanidad civil, profesión, distrito de residencia y deudas.

11. **La Bolsa de Monedas de Cuero (`LeatherPouchObject.tsx`):**
    - Bolsa de cuero curtido atada con cordón de cáñamo y peso visible según las libras, chelines y peniques disponibles.

---

### B. Atmósfera y Franjas Horarias del Calendario
Se implementó un sistema de iluminación ambiental diegética en Capa 3 (`z-index: 30`) con `pointerEvents: 'none'` que mapea exactamente las cuatro franjas horarias:
- **`AMANECER`:** Tinte ámbar frío y niebla tenue entrando por el tragaluz (`rgba(220, 180, 130, 0.08)`).
- **`MEDIODIA`:** Luz cenital neutra filtrada por el hollín de Backlund (`rgba(255, 250, 240, 0.05)`).
- **`CREPUSCULO`:** Tonos ocres y cobre profundo con sombras alargadas (`rgba(180, 80, 20, 0.12)`).
- **`MEDIANOCHE`:** Azul cobalto profundo y sombras densas que realzan la palmatoria (`rgba(10, 15, 30, 0.35)`).

---

### C. Retirada de Botones HUD y Limpieza de Interfaz
- Se eliminaron todos los botones flotantes ajenos al plano físico (botón de Velo, botón de distrito en la cabecera, indicadores flotantes de estado).
- Toda acción se activa físicamente a través de su objeto correspondiente sobre la mesa o en los muros del desván.

---

## 3. Verificación de Presupuestos Técnicos (R0 vs R2 vs R3)

| Métrica | Presupuesto Límite | Línea Base R0 | Medición R2 | Medición Real R3 | Estado |
|---|---|---|---|---|---|
| **JS Bundle (Uncompressed)** | $\le 400.00\text{ kB}$ | $361.64\text{ kB}$ | $365.17\text{ kB}$ | **$374.63\text{ kB}$** | ✅ PASS ($-25.37\text{ kB}$) |
| **JS Bundle (Gzip)** | $\le 120.00\text{ kB}$ | $107.57\text{ kB}$ | $108.82\text{ kB}$ | **$111.55\text{ kB}$** | ✅ PASS ($-8.45\text{ kB}$) |
| **CSS Bundle** | $\le 30.00\text{ kB}$ | $12.35\text{ kB}$ | $13.06\text{ kB}$ | **$16.80\text{ kB}$** | ✅ PASS ($-13.20\text{ kB}$) |
| **Suites de Pruebas** | $100\%\text{ PASS}$ | $28/28\text{ suites}$ | $29/29\text{ suites}$ | **$30/30\text{ suites}$ ($166/166\text{ tests}$)** | ✅ PASS |
| **Audit Diegético** | $0\text{ violaciones}$ | $0$ | $0$ | **$0$ ($22\text{ archivos}$)** | ✅ PASS |
| **Audit Determinismo** | $0\text{ violaciones}$ | $0$ | $0$ | **$0$ ($57\text{ archivos}$)** | ✅ PASS |
| **Verificación Tier L** | $67/67\text{ SHA-256}$ | $67/67$ | $67/67$ | **$67/67\text{ archivos}$** | ✅ PASS |

---

## 4. Evidencias Visuales Generadas (`docs/ui-recovery/evidence/r3/`)

Se generaron 16 capturas de pantalla de alta fidelidad mediante Playwright sobre la aplicación viva en `http://localhost:5173/?harness=true`:

1. `r3_desvan_wide_1920x1080.png`: Vista general del Desván a 1920×1080 con los 11 objetos físicos posicionados.
2. `r3_attention_mode_11_objects.png`: Modo Atención activo (tecla `A`) mostrando los badges dorados de latón con etiquetas de reposo $\le 7$ palabras.
3. `r3_object_staircase_door.png`: Enfoque de cámara en la Escalera de caracol y el picaporte victoriano.
4. `r3_object_niche_chalice.png`: Enfoque en la Hornacina de piedra gótica y el Cáliz de plata cincelada.
5. `r3_object_corkboard.png`: Enfoque en el Tablero de corcho, chinchetas de latón y conexiones con hilos rojos.
6. `r3_camera_focus_desk.png`: Enfoque en la Mesa de caoba (vista cenital inclinada con los 8 objetos de escritorio).
7. `r3_hover_candle.png`: Inspección y resplandor de foco en la Vela de sebo y palmatoria.
8. `r3_hover_somatic_mirror.png`: Inspección y halo en el Espejo de azogue ovalado.
9. `r3_hover_pocket_watch.png`: Inspección del Reloj de bolsillo con cuadrantes romanos y almanaque.
10. `r3_hover_bazaar_letter.png`: Inspección de la Carta de porte del mercado clandestino con lacre rojo.
11. `r3_hover_identity_papers.png`: Inspección de los Papeles de identidad notariales de Backlund.
12. `r3_hover_acting_book.png`: Inspección del Cuaderno de actuación encuadernado en piel.
13. `r3_hover_leather_pouch.png`: Inspección de la Bolsa de monedas de cuero curtido.
14. `r3_hover_desk_cracks.png`: Inspección localizada de las grietas en el veteado de madera.
15. `r3_spirit_vision_active.png`: Activación de la Visión Espiritual desde el prisma del espejo (halo etéreo violeta sobre la escena).
16. `r3_reset_wide_view.png`: Retorno fluido a la vista panorámica general tras la interacción.

---

## 5. DELTA contra Corrida Anterior e Hipótesis Causal

- **Delta:** Inclusión de 5 nuevos componentes de objetos diegéticos (`StaircaseDoorObject`, `NicheChaliceObject`, `CorkboardObject`, `PocketWatchObject`, `BazaarLetterObject`), un archivo de estilos victorianos unificado (`desk_objects.css`), y suite de pruebas unitarias y de integración (`reborn/tests/desk_view_r3.test.ts`).
- **Impacto en Bundle:** JS incrementó $+9.46\text{ kB}$ (de $365.17\text{ kB}$ a $374.63\text{ kB}$, manteniéndose holgadamente por debajo del presupuesto estricto de $400\text{ kB}$). CSS aumentó $+3.74\text{ kB}$ (de $13.06\text{ kB}$ a $16.80\text{ kB}$, con un margen de $13.20\text{ kB}$ respecto al límite de $30\text{ kB}$).
- **Hipótesis Causal:** La estilización basada en CSS puro y geometría SVG nativa para los 11 objetos en lugar de importar assets rasterizados masivos o motores 3D permite una resolución visual nítida en cualquier densidad de píxeles con un peso extremadamente contenido.

---

## 6. Sección Obligatoria: FALLOS

1. **Incidencia de Intercepción de Puntero (Capas de Luz):**
   - *Causa:* El contenedor de iluminación ambiental (`DeskLightingOverlay`) en Capa 3 se renderizaba inicialmente con intercepción de eventos de ratón activa por defecto, bloqueando temporalmente los clics sobre los hotspots de la Capa 2.
   - *Corrección:* Se aplicó `pointer-events: none` estricto en toda la jerarquía de la capa de iluminación.
2. **Fallo de Afinidad en Test de Reflejo:**
   - *Causa:* La prueba unitaria de `SomaticMirrorObject` buscaba la clase explícita de Tailwind `border-[#a855f7]` durante la Visión Espiritual, mientras el componente usaba estilo inline dinámico.
   - *Corrección:* Se añadió la clase complementaria en la definición del marco, logrando $166/166$ tests pasando al $100\%$.
3. **Ninguna otra incidencia detectada en logs, tests ni comporbaciones de CI.**

---

## 7. Cola HUMAN_REVIEW

- No hay huecos nuevos en esta entrega.
- Se mantienen en cola los gaps canónicos de combatientes por pool séfira identificados en `02.4-BIS` para CALAMITY, MOTHER, ABYSS, ORDER y DEATH (fuera del alcance de la UI de Fase 1).

---

## 8. Siguiente Acción Recomendada

Solicitar la firma del Director para **BRIEF-10.VISUAL-R3** e iniciar la orden **BRIEF-10.VISUAL-R4** ("Conectar calendario, identidad y actuación").
