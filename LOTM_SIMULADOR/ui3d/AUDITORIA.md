# Auditoría del cliente ui3d — 29 sep 2026 (actualizada en la sesión 2)

Estado medido, no supuesto. Todo lo que dice "verificado" se comprobó en Chrome con WebGPU a 1920×1080
(y 390×844 donde se indica) contra el motor real en `:3456`, con capturas del navegador de revisión
(`scripts/_driver.mjs`).

## 1. Qué funciona (verificado)

| Área | Evidencia |
|---|---|
| Arranque WebGPU (respaldo WebGL 2 automático) | Las vistas cargan sin errores de consola. Sólo queda el aviso de Chrome `powerPreference ... ignored on Windows` (del navegador, no del cliente). |
| Build | `tsc -b` limpio (sesión 2). |
| Motor (reborn) | **239/240** tests (sesión 1: 236/237; DELTA +3 = tests nuevos 6–8 de `ui3d_integration_fixes`, ver §5). El fallo sigue siendo `dist_smoke` (exige `dist/` compilado, previo). `tsc --noEmit` limpio. `lint:tier-g` (incluye determinismo y audit diegético) y `verify:tier-l` 67/67 en verde. |
| Prólogo completo por la UI | Re-verificado en la sesión 2 con un personaje nuevo (Detective Privado): portada → origen → carta → dilema → frascos → despertar. |
| **Compra** | Bazar de Cherwood: 2 unidades → saldo 600 d → 456 d, inventario `ING_JIMSONWEED_JUICE ×2`, recibo en el panel. Una orden con `commandId` por unidad. |
| **Combate** | Habilidad (15 de daño, espiritualidad −10), Observar (revela habilidad del adversario), Mover (anillo acompaña al actor), Terminar turno, Parlamentar negado (422 narrado en escena) y aceptado con el adversario por debajo del 35 %, victoria por derrota (+120 d y vigor persistidos), reanudación de la batalla tras recargar la página. |
| **Investigación: pistas** | Mansión (escritorio → caja fuerte desbloqueada; tocador y estuche negados por vía/secuencia con la prosa del motor), orfanato (vigas, cripta) y vecinos (libro mayor). |
| **Conectar pistas** | Dos tarjetas elegidas sobre el corcho + relación de la leyenda → arista persistida; el hilo se dibuja (tenue si el motor la juzga incorrecta). |
| **Contrastar hipótesis** | Falsa: teoría revelada, pista falsa sembrada en el corcho, rombo carmesí. Verdadera: fase de resolución desbloqueada. |
| **Resolver caso** | Pliego "El desenlace" (elegir + sellar) → `RESOLVED` en el motor → pliego "Caso cerrado" con las consecuencias. Verificado con dos personajes (D y B). |
| **Ascensión** | En un motor aislado con base temporal (ver TRANSFERENCIA §3): preparación 4/4 marcada desde la UI y persistida, presentación del cáliz, trago → Secuencia 9 → 8 "Clown", digestión a 0, ingredientes consumidos, relato con rótulo como encabezado. |
| Diario | Dilema cargado con la proyección pública (`?public=1`), resuelto por la UI (+60 d). |
| Tablero | Tarjetas reales proyectadas en perspectiva, títulos legibles, hilos visibles, hipótesis navegables. |
| Móvil vertical (390×844) | Sesión 2: tablero (leyenda 2×2), combate (barra de acciones a lo ancho y **"Terminar turno" visible**: antes la regla móvil lo ocultaba y no se podía acabar el turno), bazar (tira arriba, precio/saldo/cantidad visibles) y ascensión. Desván y Diario verificados en la sesión 1. |
| Efectos | Gotas que resbalan, anillos en charcos, calima, motas, relámpagos con trueno, llama que se inclina con el ratón. |

## 2. Qué no está verificado

- **Sonido:** sintetizado con WebAudio; no se ha escuchado.
- **Rendimiento:** FPS sin medir. El shader de la lámina hace ~30 lecturas de textura por píxel.
- **Firefox/Safari, pantallas 4:3 y ultra-anchas:** sin probar.
- **Derrota en combate y huida:** las rutas existen; no se ejecutaron (la derrota deja cordura y vigor a 0 en la partida real).
- **Compromisos civiles del Diario** (`/api/identity/*`): no ejecutados en la sesión 2.
- **Móvil**: pliegos "El desenlace"/"Caso cerrado" y la lista de ingredientes; horizontal en móvil.

## 3. Problemas conocidos

| # | Problema | Causa | Arreglo |
|---|---|---|---|
| 1 | Se ve UI pintada y personajes duplicados bajo el HUD | Láminas del Atlas (provisionales) | Láminas limpias de `ASSET_PROMPTS.md` §1. Mitigado: con lámina provisional los paneles se vuelven opacos (`data-provisional` en el lienzo). |
| 2 | Manecillas, retrato del espejo, mercancías 3D y figuras del combate no aparecen | Se desactivan con lámina provisional | Llegan solas con las láminas limpias |
| 3 | Paralaje por profundidad inactivo | No hay `depth_*.png` | `ASSET_PROMPTS.md` §3 |
| 4 | Orfanato sin escena propia (zoom a la verja con rótulos pintados) | Falta lámina | `plate_v03b_orfanato.png` |
| 5 | Rejilla 7×5 y corcho medidos sobre el Atlas | Pueden desviarse en la lámina limpia | Recalibrar `GRID_CORNERS` y `BOARD_CORNERS` |
| 6 | Hotspots medidos a mano | Sin máscaras | Aceptable |
| 7 | Texto largo desborda algún panel en móvil | Paneles pensados para 1920 | Pasada hecha para tablero, combate y bazar (sesión 2); quedan los pliegos del desenlace |
| 8 | `ascension` y `prologue` comparten lámina | Provisional | Lámina propia de la Cruz de Hierro |
| 9 | Bundle de 1,27 MB | Three.js completo | `import()` por lugar |
| 10 | La digestión no sube al resolver un dilema | **Diseño del motor**: se consolida en el tick semanal | Decidir si la UI lo explica (p. ej. "el papel se asienta con la semana") |

### Hallazgos del motor que requieren decisión del Director (no corregidos)

| # | Hallazgo | Dónde | Por qué no se tocó |
|---|---|---|---|
| M1 | Viajan al cliente los PV exactos del adversario (`enemy.currentHp/maxHp`) | `combatRoutes.projectPublicBattleActor` | La narración del motor ya cita el daño exacto; ocultarlo es decisión de diseño (§6.2 "atributos reservados"). El cliente sólo muestra bandas ("Firme", "Herido", "Tambaleante"). |
| M2 | La victoria narra "Ingrediente recolectado: [calidad]" pero no añade nada al inventario | `combatRoutes.ts` (acción SKILL, rama de victoria) | Qué ingrediente se cosecha es contenido (Regla del Hueco §3.8 → HUMAN_REVIEW). |
| M3 | Recompensa de victoria `120` peniques escrita en línea | `combatRoutes.ts` (`updateCharacterWealth(characterId, 120)`) | Viola Ley 4 (balance centralizado); moverla a `balance/` cambia el schema de economía. |
| M4 | La resolución D añade un ancla con título mecánico "Trait Permanente: ... (-15% Sanity Cap)" | `InvestigationEngine.resolveCase` | Texto de contenido. |
| M5 | Errata "TRANSFORMACIÓN ASTRICA" en el relato de ascensión | `AscensionEngine` | Texto de contenido. |
| M6 | `GET /api/acting/dilemma` sin `?public=1` sigue enviando la solución del dilema | `actingRoutes.ts` | `ui/` (cliente anterior, intocable) depende de esos campos. ui3d ya usa `?public=1`. |

## 4. Mejoras (estado tras la sesión 2)

| # | Mejora | Estado |
|---|---|---|
| 1 | Láminas limpias + mapas de profundidad | **Bloqueado**: `art-source/generated/` vacía. |
| 2 | Emisión por lámina / bloom selectivo | **Hecho.** MRT con canal `glow`: la lámina escribe su emisión (mapa `emit_*` si hay lámina limpia; si no, estimación medida: núcleos casi blancos L>0,84–0,95 y halos cálidos con croma relativo alto). Llamas, halos, haces, ascuas, motas, anillos y rejilla emiten; tarjetas, figuras y mercancía tapan. Pergaminos y sobres ya no brillan; faroles y velas sí. Revisión en desarrollo: `__stage.setGlowSource('mask' \| 'legacy' \| 'selective')`. |
| 3 | Entrada a exteriores tras cristal mojado | **Hecho.** Post-proceso de lente: gotas grandes que refractan + velo desenfocado (9 muestras) que se seca en ~2,6 s. Sólo de interior a calle; respeta "movimiento" en Ajustes; coste nulo cuando está seca (`If`). |
| 4 | Antialiasing | **Hecho de forma dirigida** (no TRAA): la rejilla ya era analítica; el escalonado estaba en el contorno dorado. Cobertura con 4 submuestras y borde interior graduado. TRAA descartado: estelas con tanta animación de sombreador (lluvia, gotas, calima). |
| 5 | Lens flare en faroles | **Descartado** por dirección de arte: el destello anamórfico choca con la pintura; el bloom selectivo ya da el halo. |
| 6 | Sonido con muestras reales | Pendiente: requiere elegir fuentes con licencia. |
| 7 | Accesibilidad | **Hecho** lo funcional: tarjetas del corcho y casillas alcanzables del combate existen como botones (foco = iluminación en la lámina). Verificado conectar pistas y mover sólo con teclado. |
| 8 | Bundle | **Hecho** a la medida real: Three.js (904 kB) y React (219 kB) en bloques propios; el juego queda en 163 kB (54 kB gzip) y cada actualización sólo invalida ese bloque. Trocear por lugar no ahorra: Three.js se necesita desde el arranque. Build de producción probado. |

### Hallazgo técnico importante (Three r186)
Las salidas extra de un `mrt()` **no mezclan por defecto** (`NoBlending`): cualquier material transparente dibujado después
sobrescribe el canal. Hay que declarar `sceneMRT.setBlendMode('glow', new THREE.BlendMode(THREE.MaterialBlending))`
(hecho en `Stage.buildPipeline`). Además todo material nuevo de la escena debe usar `emits(mat, k)` u `occludes(mat)`
(`engine/effects.ts`).

## 5. Cambios de la sesión 2 (29 sep 2026)

Bloque de mejoras (después de la verificación): `engine/Stage.ts` (MRT `glow`, bloom selectivo, modos de revisión,
lente mojada), `engine/PlateLayer.ts` (emisión + contorno con antialiasing, `setEmission`), `engine/effects.ts`
(`emits`/`occludes`), `props.ts`/`board.ts`/`combat.ts` (emisión u oclusión por malla), `scripts/process-assets.mjs`
(regla `emit_`), `places/Board.tsx` y `places/Combat.tsx` (botones de teclado), `vite.config.ts` (bloques de proveedor).

Bloque de verificación:

Cliente (`ui3d/src`):
- `engine/react.tsx`: `computeHudScale` protegido contra ventana de 0 px (error `width: NaN` de React).
- `engine/combat.ts`: `GridActor.layout()` partía de posiciones ya transformadas → el anillo se volvía NaN al moverse (decenas de errores `computeBoundingSphere`). Ahora guarda el plano unidad original.
- `places/prose.ts` (nuevo) + `Combat.tsx`: narración sin marcas técnicas (`[FOOL]`, `[SKILL_…]`, calidades), habilidades del adversario en español, negativas 422 narradas en escena, sin coordenadas al moverse, desenlace sin solaparse con el objetivo.
- `api/client.ts`: `activeBattle` usa `?probe=1` (sin 404 en consola); `actingDilemma` usa `?public=1`.
- `engine/board.ts`: rejilla 4×2 que no tapa títulos, hilos de doble cara (antes no se dibujaban) y algo más gruesos, tarjeta sin foto con pliego manuscrito en sepia (antes hueco negro).
- `places/Board.tsx`: selector de hipótesis fijo bajo el título (antes quedaba bajo el pliegue), foto de foco panorámica, respuesta del motor sobre la leyenda, pliegos "El desenlace" y "Caso cerrado", panel "Caso cerrado", corcho bloqueado tras resolver, abre en la hipótesis confirmada.
- `hud/scrollEdges.ts` (nuevo) + `hud.css`: desvanecido proporcional a lo que queda por leer en todo `.scroll`.
- `hud.css`: paneles, inspección y pliegos opacos con lámina provisional; `.pips`, `.choice-row--compact`, `.ingredient-list`, `.letter__heading`, `.narration--low`.
- `places/Ascension.tsx`: ingredientes con nombres del catálogo y lo que falta; rótulo del relato como encabezado; cáliz deseleccionado tras beber.
- `places/Journal.tsx`: "Ensayar el papel" visible aunque haya un compromiso pendiente.
- `hud/kit/ChoiceRow.tsx`: variante `compact`.
- `vite.config.ts`: `MOTOR_URL` para apuntar a otro motor.

Motor (`reborn`), todos con test en `tests/ui3d_integration_fixes.test.ts`:
- `combatRoutes.ts`: `GET /api/combat/active/:id?probe=1` → `{ active: false }` sin combate (sin probe, 404 como antes).
- `investigationRoutes.ts`: `GET /case/active` ya no reabre un caso resuelto (antes creaba una instancia nueva del mismo caso) y no ofrece desenlaces en casos no activos.
- `actingRoutes.ts`: `GET /api/acting/dilemma/:id?public=1` sin alineación ni efectos.
- `AscensionEngine.ts`: `door2_ingredients.items` (nombre de catálogo, papel, si se posee, calidad). Aditivo.
- `scripts/_fixture_ascension.ts` (nuevo): preparación de pruebas para un motor aislado; se niega a tocar `lotm_reborn.db`.

## 6. Recursos investigados

- [ektogamat/threejs-conference](https://github.com/ektogamat/threejs-conference) (MIT): lluvia GPU, ondas TSL, gotas en cristal, post-producción r18x. Referencia para §4.3–4.5.
- [dgreenheck/webgpu-claude-skill](https://github.com/dgreenheck/webgpu-claude-skill): skill de WebGPU/TSL.
- [Three.js r186](https://github.com/mrdoob/three.js/releases/tag/r186): `RenderPipeline`, TRAA, bloom desde MRT.
- [Guía de post-procesado 2026](https://threejsroadmap.com/blog/the-complete-guide-to-threejs-post-processing-in-2026).
- [Depth Anything V2 en WebGPU (Xenova)](https://huggingface.co/spaces/Xenova/webgpu-depth-anything).
