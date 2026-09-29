# Documento de transferencia — cliente ui3d (Three.js WebGPU)

Para retomar el trabajo en un chat nuevo. Léelo junto a `AGENTS.md` (raíz), `ui3d/README.md`,
`ui3d/AUDITORIA.md` y `ui3d/ASSET_PROMPTS.md`.

## 1. Encargo del usuario

- Rehacer la UI de *Path to Godhood* con **Three.js WebGPU**, **fiel al Atlas Visual** (`ATLAS_VISUAL_PHASER.pdf`,
  8 láminas V01–V08; copias en `ui3d/art-source/atlas/`). "No quiero velocidad, quiero calidad."
- Sólo UI, pero con los motores del backend integrados de verdad (nada simulado en el cliente).
- El usuario genera las imágenes a partir de los prompts de `ASSET_PROMPTS.md` y las deja en
  `ui3d/art-source/generated/`.
- Idioma de trabajo: español.

## 2. Estado actual

- `ui3d/` es un paquete nuevo del workspace. `ui/` (React/Phaser anterior) sigue intacto.
- Las 8 escenas + portada, registro de origen y prólogo existen y están conectadas al motor.
- Todas usan las láminas del **Atlas como provisionales** (con UI pintada debajo del HUD real).
  Con las láminas limpias el cliente cambia solo (ver §5).
- Auditoría detallada en `ui3d/AUDITORIA.md` (§5 lista los cambios de la sesión 2).
- **Sesión 2 (29 sep 2026):** verificadas de extremo a extremo compra, combate completo, pistas, conectar,
  contrastar, resolver caso, ascensión y dilema del Diario; corregidos los fallos encontrados (ver Auditoría §5).
  `art-source/generated/` seguía vacía: no hubo imágenes que procesar ni recalibración.
- **No es un repositorio git.** No hay commits (AGENTS §9 pide commit + hash). Pendiente de que el usuario acepte `git init`.

## 3. Cómo arrancar

```
npm install                   # raíz del workspace (reborn, ui, ui3d)
npm run dev:server            # Fastify + SQLite en :3456
npm run dev:ui3d              # http://localhost:5174
npm --prefix ui3d run assets  # procesa art-source/ → public/ y escribe public/assets.json
```

- `.claude/launch.json` define `motor` y `ui3d` para `preview_start`.
- Atajo de desarrollo: `?char=<id>&place=<lugar>[&arg=mansion|orfanato]`.
  Lugares: title, origin, prologue, desvan, cherwood, location, board, bazaar, combat, journal, ascension.
- En desarrollo `window.__stage` expone el escenario (p. ej. `__stage.flash(1)` fuerza un relámpago).
- Capturas a resolución completa: `node ui3d/scripts/_shot.mjs <out.png> 1920 1080 [pasos.json]` con
  `URL=...` (usa el Chrome instalado; los pasos admiten `click`, `mouse`, `move`, `eval`, `shot`, `wait`).
- Cuadrícula de coordenadas sobre una lámina: `node ui3d/scripts/_grid.mjs <lámina> <out.png>`.
  Recorte ampliado: `node ui3d/scripts/_crop.mjs <in> <out> x y w h escala`.
  Comparar capturas lado a lado: `node ui3d/scripts/_pair.mjs <out.png> <alto> <a.png> <b.png> …`.
- **Navegador de revisión persistente** (sesión 2): `node ui3d/scripts/_driver.mjs 9333` abre Chrome con WebGPU a
  1920×1080 y acepta órdenes por HTTP (`goto`, `click{text|sel|xy}`, `move`, `type`, `key`, `eval`, `shot{path,clip}`,
  `wait`, `size`, `log`, `quit`), p. ej. `curl -s localhost:9333 --data-binary @orden.json`. En Windows manda el JSON
  desde un fichero UTF-8 (los acentos en argumentos de curl se corrompen). Los botones de `HotspotKeys` son invisibles:
  actívalos con `focus()` + tecla Enter. El panel Browser de la app deja de dibujar si la ventana está oculta; el driver no.
- **Motor aislado para pruebas destructivas** (ascensión, derrota…) sin tocar la partida del usuario:
  ```
  DB_PATH=<scratchpad>/asc_test.db PORT=3457 node --import tsx reborn/src/server/server.ts
  MOTOR_URL=http://127.0.0.1:3457 npx --prefix ui3d vite --port 5175 --strictPort   # desde ui3d/
  npx tsx reborn/scripts/_fixture_ascension.ts <ruta.db> <characterId>             # ingredientes S8 + digestión 100
  ```
  Al terminar, comprueba que no quedan procesos escuchando en 3457/5175 (TaskStop a veces deja huérfano el hijo).
- Si los servidores `motor`/`ui3d` ya están en marcha desde otro chat, `preview_start` falla por puerto ocupado:
  basta con usarlos (ambos recargan solos: `tsx watch` y Vite).

## 4. Arquitectura (ui3d/src)

| Ruta | Qué es |
|---|---|
| `engine/Stage.ts` | Renderer WebGPU, cámara ortográfica sobre el lienzo 1920×1080 (modo cover), balanceo, transición "papel que arde", `RenderPipeline` (bloom, aberración, viñeta, grano, pulso de peligro), relámpagos, viento del ratón. |
| `engine/PlateLayer.ts` | Material TSL de la lámina: paralaje, reiluminación de velas, azogue, gotas en cristal, ondas en charcos, calima, líquido del cáliz, brasas, contorno dorado de hover/selección, gradación. |
| `engine/tsl/weather.ts` | Gotas en cristal y anillos de lluvia (escritos para el proyecto). |
| `engine/PlateMask.ts` | Polígonos → textura de índices a resolución completa; shader y hit-testing usan el mismo buffer. |
| `engine/effects.ts` | Llama de vela, halos, haz de luz con polvo, lluvia, niebla, ascuas, motas. |
| `engine/props.ts`, `board.ts`, `combat.ts` | Manecillas, retrato del espejo, mercancía, tablero de corcho (homografía), rejilla táctica 7×5 y actores. |
| `engine/homography.ts` | Homografía 4 puntos para rejilla y corcho. |
| `engine/react.tsx` | `StageProvider`, `usePlace`, `useAttached`, `Anchored` (HUD pegado a la lámina cada frame). |
| `hud/` | Kit visual (marcos dorados SVG, paneles de ébano y pergamino, iconos propios) y paneles. HUD en px del lienzo 1920×1080; móvil vertical usa lienzo lógico de 600 px. |
| `places/` | Una vista por lugar. `places/specs/*.ts` contiene TODA la geometría medida sobre el Atlas (hotspots, regiones, luces, efectos, encuadres). |
| `api/client.ts` | Cliente estricto; mutaciones con `commandId` y consulta de recibo si falla la red. |
| `session/store.ts` | Zustand: personaje activo, snapshot, lugar, avisos. |
| `audio/Ambience.ts` | Sonido procedimental WebAudio (lluvia, goteo, crepitar, sala, trueno). |

Reglas de diseño aplicadas: ESTADO = OBJETO (vela = cordura, azogue = corrupción, saturación = ruina,
manecillas = franja del calendario), backend como única autoridad, sin datos inventados en el cliente.

### Post-producción (sesión 2)
- `Stage.buildPipeline`: la pasada de escena usa MRT `{ output, glow }`. El bloom lee `color × glow`. Cada material de la
  escena declara su emisión con `emits(material, k)` o tapa la de detrás con `occludes(material)` (`engine/effects.ts`).
  **Sin esto, un material transparente nuevo borra el canal** (ver Auditoría §4, hallazgo r186).
- Lente mojada al pasar de interior a calle (`uLens`, `lensWet` en `Stage`).
- En la consola de desarrollo: `__stage.setGlowSource('mask')` muestra qué se considera luz; `'legacy'` el bloom antiguo.

## 5. Pipeline de imágenes

- Nombres exactos en `ASSET_PROMPTS.md`. El script decide destino por prefijo (`plate_`, `depth_`, `actor_`,
  `item_`, `portrait_`, `clue_`, `dest_`, `icon_`, `potion_`…), quita el fondo verde #00FF00 y convierte a WebP.
- `assetUrl()` usa el definitivo, si no el provisional (`art-source/provisional/`, arte heredado de `ui/`), si no null.
- Con `plate_*` definitivo `stage.provisional` pasa a false y se activan: manecillas del reloj (V01),
  figuras recortadas de combate (V06), mercancía sobre el mostrador (V05). El retrato del espejo aparece
  si existe `portrait_<ORIGIN_ID>`.
- Mapas `emit_*` (blanco = luz): el script los convierte a PNG gris en `public/plates/`; `Stage` los usa sólo con la
  lámina limpia correspondiente. Revísalos con `__stage.setGlowSource('mask')`.
- **Al recibir las láminas limpias hay que recalibrar** `GRID_CORNERS` (streets.ts), `BOARD_CORNERS` y
  `COUNTER_SLOTS` (interiors.ts) y revisar los polígonos de hotspots con `_grid.mjs`.
- Pendiente de añadir a `ASSET_PROMPTS.md`: mapas de emisión por lámina (ver Auditoría §4.2).

## 6. Cambios hechos en el backend (reborn)

Copias de los originales en el scratchpad de la sesión anterior (no persistente); el detalle está aquí.

1. `GET /api/character/:id` no falla con vía `UNAWAKENED` (`sequenceName: null`).
2. Hipótesis del caso: proyección pública (`InvestigationEngine.getPublicHypotheses/projectPublicState`),
   alias `HIPOTESIS_A…D`, visibles con ≥2 pistas de soporte descubiertas, teoría sólo tras contrastar.
   `investigationRoutes.ts` proyecta todas las respuestas de caso (`publicCase`).
3. Combate (`combatRoutes.ts`): acción `END_TURN`, PA restaurados tras el turno enemigo, `MOVE` sólo a
   casilla adyacente y libre, respuestas de acción proyectadas (sin habilidades no reveladas del adversario).
4. `GET /api/prologue/status` devuelve `benefactorLetterText` mientras el prólogo sigue abierto
   (`PrologueEngine.buildBenefactorLetter`).
5. Tarifa del carruaje en `data/gameplay/balance/economy.json → travel.carriageFarePence` (schema actualizado)
   y servida en `GET /api/city/districts`.
6. Tests: nuevo `tests/ui3d_integration_fixes.test.ts`; `tests/corkboard_investigation_p09.test.ts` ahora
   exige que no se filtren ids ni teoría de hipótesis.

Resultado sesión 1: 236/237 (el fallo `dist_smoke` es previo), Tier G y Tier L en verde.

Sesión 2 (todos cubiertos por `tests/ui3d_integration_fixes.test.ts`, casos 6–8):

7. `GET /api/combat/active/:id?probe=1` → 200 `{ active: false }` si no hay combate (sin `probe`, 404 como siempre: `ui/` lo usa).
8. `GET /api/investigation/case/active/:id` ya no crea una instancia nueva de un caso resuelto: devuelve la última
   instancia si no está `ACTIVE`, y `availableResolutions` sólo para casos activos. (Los personajes de prueba
   `char_n3yf4y_7` y `char_vac56c_9` de la base de desarrollo quedaron con una instancia nueva creada antes del arreglo.)
9. `GET /api/acting/dilemma/:id?public=1`: opciones sólo con `id/label/text/description` (sin la solución). Sin el
   parámetro se conserva el contrato de `ui/`.
10. `AscensionEngine.evaluateAscensionStatus`: `door2_ingredients.items[]` con nombre del catálogo del mercado, papel
    (`MAIN`/`SUPPLEMENTARY`), `owned` y `quality`. Aditivo.
11. `reborn/scripts/_fixture_ascension.ts` (herramienta de pruebas; rechaza `lotm_reborn.db`).

Resultado sesión 2: **239/240** (DELTA +3 respecto a la sesión 1 = tests nuevos 6–8; el fallo sigue siendo `dist_smoke`),
`tsc --noEmit` limpio, `lint:tier-g` y `verify:tier-l` en verde.

## 7. Siguientes pasos sugeridos

1. Procesar las imágenes que genere el usuario (`npm --prefix ui3d run assets`) y recalibrar (§5).
2. Decisiones pendientes del Director sobre el motor (Auditoría §3, tabla M1–M6).
3. Revisar `AUDITORIA_GENERAL.md` (raíz, auditoría superior del proyecto: reglas, motores, arte, propuesta 3D) y decidir.
4. Pendientes de Auditoría §4: sonido con muestras (elegir fuentes con licencia); pasada de móvil.
4. Pasada de móvil para bazar, tablero, combate y ascensión.
5. Si el usuario acepta, `git init` y primer commit (AGENTS §8–9).

## 8. Detalles técnicos que costaron

- TSL: **nunca** uses el menos unario de JS sobre un nodo (`-x.mul(2)` compila a `NaN` en WGSL); usa `x.mul(-2)` o `.negate()`.
- `uniform()` de color es `UniformNode<'color', Color>`: se multiplica directamente, no con `vec3(u)`.
- `dot()`/`length()` de TSL como funciones, no métodos, para que tipen.
- Tras editar módulos, Vite a veces sirve el módulo **anterior** o vacío (el vigilante de archivos no detecta todas
  las escrituras en esta ruta con espacios y paréntesis): haz `touch` al archivo tras cada edición y, si dudas,
  comprueba con `curl -s localhost:5174/src/ruta.ts | grep …` que sirve el código nuevo.
- Mallas construidas a mano (cintas, anillos): usa `side: THREE.DoubleSide` si el sentido de giro depende de datos,
  y nunca recalcules posiciones a partir de las ya transformadas.
- El reloj de Three es `THREE.Timer` (r186); `render()` exige `await renderer.init()` antes.
