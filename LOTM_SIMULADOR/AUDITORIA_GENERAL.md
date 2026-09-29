# Auditoría general — *Path to Godhood* (29 sep 2026)

Alcance: reglas (AGENTS.md y constitución v4), canon e historia, motores del backend (`reborn/`), clientes (`ui/`, `ui3d/`), arte y viabilidad de un paso a 3D. Auditoría de sólo lectura: no se modificó código ni datos. El único archivo escrito es este.

Método: lectura de código y datos; ejecución de los cuatro linters (`lint:determinism`, `audit:diegetic`, `verify:tier-l`, `lint:tier-g`), todos en verde; peticiones GET al motor en `:3456`; consulta de sólo lectura a `reborn/saves/lotm_reborn.db`. **No** volví a ejecutar la suite de tests: tomo el dato de 238/239 de `ui3d/AUDITORIA.md`. Tampoco jugué en el navegador ni hice POST. Cuando algo no está verificado, lo indico.

---

## 1. Resumen ejecutivo

**Estado real.** Hay un vertical slice jugable de verdad: prólogo, Desván, un Caso Mayor, bazar, combate, diario y ascensión S9→S8, con persistencia SQLite e idempotencia parcial. El cliente `ui3d` está bien construido y respeta la autoridad del servidor. El backend, en cambio, está a medio migrar. En cada sistema conviven un motor "bueno", guiado por datos Tier G y probado, y una ruta que es la que realmente usa el juego: lógica escrita a mano, con números y prosa dentro del código. El contenido jugable real cubre 2 vías (FOOL y VISIONARY), S9–S8, 1 caso, 8 dilemas por vía y 1 enemigo genérico. Las leyes dicen más de lo que el código cumple: los linters pasan porque comprueban poco, no porque las reglas se respeten.

**Los 5 riesgos principales**
1. **El cliente decide cosas que debería decidir el servidor.** Puede fijar la vida y la emboscada del enemigo, la calidad de lo que vende, la semilla de la poción y cuándo avanza el tiempo. `POST /api/acting/weekly-tick` puede repetirse sin límite y cada llamada suma digestión y cobra alquiler (§4.2).
2. **Se filtran secretos narrativos.** `GET /api/investigation/cases/:id` devuelve `culprit_name` (verificado en vivo). Los recibos de comandos se devuelven sin proyectar. Además, los ids de contenido delatan la solución (`HYPOTHESIS_TRUE_NETWORK`).
3. **Hay dos motores por sistema y el juego usa el malo.** El combate en producción es `TacticalCombatEngine` más 700 líneas de `combatRoutes.ts`. `GridCombatEngine`, con átomos Tier G y `combatants.json`, sólo lo usan los tests. Los tests validan un motor que el jugador nunca ejecuta.
4. **La historia vive dentro del código.** Unas 400 cadenas narrativas largas están en `.ts`. Hay errores de canon (Scotland Yard, Támesis, Bayam como distrito de Backlund) que ningún control detecta.
5. **El proceso no produce verdad.** Hay informes que declaran cerradas cosas que siguen abiertas (`AUDIT_CLOSURE_REPORT.md`: "cero números hardcodeados", "cero heurísticas CWD", "cero fallbacks"). El gate G1 es una simulación escrita en SQL crudo, no una partida. No hay git en local.

**Las 5 decisiones recomendadas**
1. **Crear una capa de canon narrativo inmutable (Tier N)** con firma humana y lint anti-anacronismo, y endurecer R1–R4. Todo lo demás (UI, balance, código) pasa a ser fluido.
2. **Reescribir AGENTS.md** con las 12 reglas de §2.3: retirar las 7 reglas burocráticas u obsoletas y convertir en tests las de ingeniería que sí sirven.
3. **Plan "un sistema, un motor".** Conectar `GridCombatEngine` y `/api/acting/dilemmas` (Tier G), borrar las rutas legacy, hacer `commandId` obligatorio, que ningún GET mute y proyectar las respuestas por lista blanca.
4. **Declarar `ui3d` cliente oficial**, derogar el mandato Phaser (§6.1) y congelar `ui/` hasta retirarlo.
5. **3D sí, pero con un prototipo acotado del Desván** en 3 variantes (§7), y sólo después de cerrar los P0 del motor. El 3D no arregla ninguno de los riesgos anteriores.

---

## 2. Reglas (lo más importante)

### 2.1 Veredicto regla por regla

Tipos: **H** = protege la historia o el canon; **I** = ingeniería útil; **P** = proceso o burocracia.

| # | Regla (resumen) | Tipo | Veredicto | Por qué | Evidencia |
|---|---|---|---|---|---|
| §1 | Encuadre de fases (Fase 1 abierta, BRIEF-09/10, G1–G5, demo firmada por el Director) | P | **Reformular** | Es jerga de un plan de 34 meses que no refleja el estado real. "El Director" es el dueño del proyecto: sobra la ceremonia. | `reborn/docs/PATH_TO_GODHOOD_v4.md` §11–12 |
| §2 | Topología del repositorio | P | **Reformular** | Está desactualizada: falta `ui3d/`, faltan 8 motores y cita un `schema.sql` que el código no usa (se usan las migraciones). | `reborn/src/infra/database/schema.sql` sin referencias; `ui3d/` ausente del mapa |
| 1 | Rutas purgadas (`/src`, `data/canonical`) | P | **Retirar** | Es historia, no norma: esas rutas ya no existen. Mientras, la raíz acumula JSON muertos: `fool_*.json`, `spectator_*.json` y `bestiary_archetypes.json`, este último idéntico al de `balance/`, y ninguno referenciado. | `cmp` idéntico; ningún `import` o lectura de esos archivos |
| 2 | Prohibición de métricas tautológicas; sólo cuentan G1–G7 | P/I | **Reformular** | El principio es correcto, pero los gates carecen de definición operativa y el propio G1 es tautológico: simula la partida con `UPDATE` SQL escritos en el test. G7 (velocidad de compilación semanal) no tiene sentido para un equipo de una persona. | `reborn/tests/gate_g1_player_simulator.test.ts:106-250` (16 `getRawDb()`); `gate_03_combat.test.ts` prueba `GridCombatEngine`, que producción no usa |
| 3 | Doctrina de dos capas: Tier L congelado; si una vía jugable carece de Tier G, el build falla | H | **Mantener y endurecer** | Es la mejor idea del proyecto. Pero el "build falla" no se cumple: `pathways.manifest.json` declara 6 vías jugables y sólo FOOL y VISIONARY tienen dilemas y habilidades. El lint pasa igual. Tier L además es una compilación de fans con errores; congelarlo por hash protege de cambios, no de errores. | `data/gameplay/pathways.manifest.json` (`playableCount: 6`); `dilemmas/` = fool, visionary; `player_abilities.json` = FOOL/VISIONARY S9–S8; `lint_tier_g.ts` no comprueba cobertura |
| 4 | Balance centralizado: nada de números en código | I | **Mantener y hacer cumplir** | Es útil y se incumple de forma masiva: 22 vías de habilidades con daño y coste en código, iniciativa, mitigación, recompensas, stats iniciales y probabilidad de fallo de la poción. Ningún lint lo vigila. | `TacticalCombatEngine.ts:58-148,162,219,229,253,261`; `combatRoutes.ts:213-247,407,535,551,601`; `characterRoutes.ts:43-58`; `AscensionEngine.ts:330-345,407` |
| 5 | Persistencia transaccional en SQLite | I | **Mantener** | Se cumple en lo esencial: las batallas y los casos están en SQLite y los `Map` son sólo cachés de contenido. El hueco está en las mutaciones fuera de `CommandProcessor` (ver regla §6.3-c). | `grep "new Map"`: sólo catálogos |
| 6 | Resolución de rutas desde la raíz del paquete | I | **Mantener** | Es sana y tiene una violación: la ruta de la base depende del directorio de trabajo. | `reborn/src/server/server.ts:12` `path.resolve('saves/lotm_reborn.db')` |
| 7 | Regla del Hueco: un hueco de contenido lanza excepción y va a la cola HUMAN_REVIEW | H | **Mantener y endurecer** | Protege la historia, pero no existe ningún mecanismo: no hay clase `ContentGapError` ni cola. Y el código rellena huecos en silencio. | `combatRoutes.ts:213-215` (enemigo genérico de 65 PV); `AscensionEngine.ts:120,319` (cualquier vía usa la fórmula del Loco); `actingRoutes.ts:121-164` (fallback legado); `ActingDilemmaEngine.ts:870,981` (precio del susurro por defecto); `EconomyEngine.ts:241` (`: 24`) |
| 8 | Regla del Testigo: COMMIT, luego TAG, luego destrucción | P/I | **Reformular** | La intención es buena, pero hoy es inaplicable: la copia local es un ZIP sin `.git`. El repositorio existe en GitHub (`orlandoavila11/Proyecto_lotm`, citado en `AUDITORIA_CODIGO_…_5583cc5.md`). Sobra el TAG. | `ui3d/TRANSFERENCIA.md` §2 "No es un repositorio git"; `.github/workflows/ci.yml` en el directorio padre |
| 9 | Reporte con "Campo 0 COMMIT", URL de CI, contador N/20 y sección FALLOS obligatoria | P | **Retirar** | El formato no impide mentir. `AUDIT_CLOSURE_REPORT.md` tiene el formato y cierra en falso F03 (números), F06 (CWD) y F07 (fallbacks). N/20 no se mide en ningún sitio. | Evidencias de las filas 4, 6 y 7 |
| 10 | Procedencia de gates (DELTA más umbral con la orden que lo fijó) | P | **Reformular** | El DELTA de tests entre sesiones es útil y se está usando bien (`ui3d/AUDITORIA.md`). Citar "la orden que fijó el umbral" es ceremonia. | — |
| 11 | Erradicación de `Math.random` | I | **Reformular** | El objetivo (partidas reproducibles) es bueno, pero el lint sólo busca la cadena `Math.random`. La reproducibilidad se rompe igual con semillas `Date.now()`, con semillas que envía el cliente y con un generador de ids que se reinicia en cada arranque (hay colisiones reales en la base). | `check_anti_math_random.ts:29`; `characterRoutes.ts:315`; `ProceduralInvestigationService.ts:79`; `InvestigationEngine.ts:1119`; `GridCombatEngine.ts:346`; `ascensionRoutes.ts:91` (semilla del cliente); `IdGenerator.ts:3-4`; la base contiene `battle_char_afibdm_3_kij6_1` y `battle_char_n3yf4y_7_kij6_1` (mismo fragmento aleatorio y contador 1 tras reiniciar) |
| 12 | Seis orígenes canónicos | H | **Mantener** (moverla a Tier N) | Es una decisión de historia bien tomada. Tiene un error de canon dentro. | `data/gameplay/origins/origins.json:229,248,253` "Scotland Yard" |
| 13 | Ley de prosa diegética: ningún número en la UI | P | **Retirar** en su forma actual (fusionar con §6.2) | Ya la derogó §6.2. El audit sólo escanea `ui/src`, el cliente antiguo: el cliente real (`ui3d`) muestra "Digestión NN %" y saldos, y el audit sigue en verde. | `check_diegetic_ui.ts:68` (`uiSrcDir = ui/src`); `ui3d/src/places/Journal.tsx:142`, `Ascension.tsx:177` |
| 14 | Ley del Objeto: ESTADO = OBJETO; máximo 7 palabras en reposo | H/P | **Reformular** | "Estado = objeto" es la identidad visual del juego y `ui3d` la implementa bien (vela = cordura, azogue = corrupción, saturación = ruina). El límite de 7 palabras es arbitrario, ya se flexibilizó en §6.2 y el lint sólo mira archivos de `ui/` cuya ruta contiene `desk` u `objects`. | `ui3d/src/places/somatics.ts`; `check_diegetic_ui.ts:153` |
| §4 | Advertencia histórica y tags; "manifest v1.1 inmutable, jamás se regenera" | P | **Retirar** (a `docs/LEGADO.md`) | Se contradice con la realidad: el manifest es v2.0 y `verify_tier_l.cjs` exige 2.0. | `verify_tier_l.cjs:22`; `content/manifest.json` `manifestVersion: "2.0"` |
| R1 | Los eventos de la novela son HISTORIA | H | **Mantener** | Protege el canon. | `data/gameplay/world_state.json` |
| R2 | Los personajes mayores son LEYENDA; los de nivel medio, sólo con nota de era y firma | H | **Mantener y automatizar** | Se aplica a mano y bien (`npc_weeks.json`: sustituciones de Old Neil y Hvin Rambis con nota de era). La "firma del Director" no queda registrada en ningún campo verificable. | `npc_weeks.json:268,428,482` |
| R3 | Circle of Inevitability (CoI) sólo como semillas latentes | H | **Mantener y automatizar** | Hoy sólo se cuenta `eraVerified` en `convergence_forces.json`. No hay lista de términos de CoI prohibidos. | `lint_tier_g.ts:237-247` |
| R4 | El Loco dormido; su Iglesia sólo como lore | H | **Mantener y automatizar** | Se respeta en los datos leídos. No hay lint que lo vigile. | `world_state.json` `reglasDeEra.R4` |
| R5 | (sólo existe en `world_state.json`) Niveles del Club de Tarot a 1353 | H | **Mantener y añadir a AGENTS** | Es regla de canon, pero no figura en AGENTS.md. | `world_state.json` `reglasDeEra.R5` |
| §6.1 | Mandato Phaser 4.2.1 | P | **Retirar** | El cliente real es `ui3d` (Three.js r186 WebGPU). Phaser sólo vive en `ui/`, que está congelado. | `ui/package.json` (`phaser 4.2.1`); `ui3d/package.json` (`three 0.186.1`) |
| §6.2-a | Mostrar la información mecánica que el personaje conoce | I/H | **Mantener** (unificar con 13 y 14) | Es la decisión correcta para la accesibilidad. | — |
| §6.2-b | Los secretos nunca viajan al cliente | H | **Mantener y endurecer** | Hoy se incumple. | §4.3 (fugas) |
| §6.3-a | Renderizado dual `?renderer=phaser` | P | **Retirar** | Ya no aplica. | — |
| §6.3-b | Autoridad estricta del backend | I/H | **Mantener y endurecer** | El cliente `ui3d` la respeta; es el servidor el que acepta parámetros que no debería. | §4.2 |
| §6.3-c | Idempotencia con `commandId` y `command_receipts` | I | **Mantener y hacer obligatoria** | `commandId` es opcional en todas partes. Hay unas 15 mutaciones sin sobre y el calendario tiene su propio sistema de recibos, sin revisiones. | `CommandProcessor.ts` (`commandId?`); `calendarRoutes.ts:27-49`; sin sobre: `acting/resolve`, `acting/weekly-tick`, `prologue/*`, `identity/resolve`, `economy/sell`, `economy/cure`, `ascension/prepare`, `character/advance-day`, `character/advance`, `trigger-rampage`, `interact-anchor`, `pathway/divination`, `case/advance-day`… |

### 2.2 ¿Los linters hacen cumplir lo que dicen?

| Script | Qué dice que vigila | Qué vigila de verdad | Conclusión |
|---|---|---|---|
| `check_anti_math_random.ts` | Determinismo estricto | La regex `\bMath\.random\s*\(` en `reborn/src` | Insuficiente. No detecta `Date.now()` como semilla ni como id, ni semillas enviadas por el cliente, ni el contador de ids que se reinicia. |
| `check_diegetic_ui.ts` | Prosa diegética y Ley del Objeto en la UI | 11 regex sobre `ui/src/features` y `ui/App.tsx`; el límite de 7 palabras sólo en rutas con `desk` u `objects` | Vigila un cliente congelado. Sobre `ui3d` no comprueba nada. |
| `verify_tier_l.cjs` | Integridad de Tier L | SHA-256 y tamaño contra `manifest.json` | Hace lo que dice. Pero el manifest no está firmado: quien edite un archivo puede regenerar su hash, y detectarlo depende de git (que no hay). 37 de los 67 archivos siguen como `PENDING_CONSUMER`. |
| `lint_tier_g.ts` | Contratos Tier G ("fail-loud") | Esquemas Zod, átomos y estados huérfanos, doble cobro, escalera RIVER | Buen lint de esquema. No comprueba la cobertura de las vías jugables (Ley 3), no busca términos anacrónicos o de CoI, no comprueba números en código y no mira `combatRoutes`, que es donde está la lógica real. |

### 2.3 Propuesta de reescritura de AGENTS.md

Propongo sustituir las 14 leyes, §4, §5 y §6 por **12 reglas en tres bloques**. Cada regla cita el test o lint que la hace cumplir. **Una regla sin comprobación automática o humana registrada no es regla.**

**Bloque A — Canon (inmutable salvo firma humana)**

- **A1. Qué es canon.** Es canon: (1) la novela *Lord of the Mysteries* según su texto, con `world_state.json` como resumen oficial de la era; (2) la historia propia del juego en `reborn/data/narrative/` (Tier N): truth models, prólogo, carta del Benefactor, orígenes, finales, ethos de vía y textos de ascensión. Nada más es canon: ni la UI, ni el balance, ni el código, ni Tier L. Tier L es una biblioteca de referencia compilada por terceros, útil pero falible.
- **A2. Era POST-LOTM · PRE-COI (R1–R5).** Se conservan R1–R5 tal cual y se añade: "`lint:canon` falla si un texto de Tier G o N contiene (a) términos del mundo real de una lista negra (Scotland Yard, Londres, Támesis, libra esterlina…), (b) términos de CoI de una lista negra fuera de `semillas`, (c) un personaje de la lista de LEYENDA marcado como NPC operativo, (d) `isCanonical: true` sin `eraCoherenceNote` y `approvedBy`".
- **A3. Tier N es de sólo lectura para los agentes.** Un agente puede proponer cambios como diff en `docs/propuestas/`, pero no editar Tier N. Cada archivo de Tier N lleva un encabezado `approvedBy`/`approvedAt` y su hash en `narrative.manifest.json`. `verify:tier-n` falla si un hash no coincide sin una entrada de aprobación.
- **A4. Regla del Hueco (endurecida).** Si falta contenido, se lanza `ContentGapError(tipo, id)`, se añade una fila a `data/human_review_queue.json` y el juego muestra un estado neutro ("aquí no hay nada más que ver"). Está prohibido inventar texto, nombres, fórmulas o valores por defecto. Un test recorre las rutas con personajes de cada vía jugable y falla si algún fallback devuelve contenido inventado.
- **A5. Errata de Tier L.** Tier L sigue congelado por hash. Los errores se corrigen en `content/errata.json` (id, campo, valor corregido, fuente), que el cargador aplica por encima. Así se conserva la trazabilidad y se deja de propagar el error.

**Bloque B — Ingeniería (se hace cumplir con tests)**

- **B1. El servidor decide; el cliente pide.** Ninguna ruta acepta del cliente parámetros de resultado: vida o velocidad del enemigo, emboscada, calidad o grado de lo que se vende, semillas, marcas de tiempo, cantidades de reparación, ids de eventos no ofrecidos. Un test de contrato lista los esquemas Zod de las rutas mutantes y falla si aparece uno de esos campos.
- **B2. Una mutación = un comando.** Toda ruta que muta pasa por `CommandProcessor` con `commandId` **obligatorio** y `expectedRevision`. Un test recorre el registro de Fastify y falla si una ruta POST no usa el procesador.
- **B3. GET nunca muta.** Un test ejecuta todos los GET con una base limpia y compara el volcado antes y después.
- **B4. Proyección por lista blanca.** Toda respuesta al cliente pasa por un DTO explícito (`toPublicX`). Está prohibido devolver `...state` o filas crudas. Los recibos se guardan ya proyectados. Los ids de contenido son opacos (nada de `HYPOTHESIS_TRUE_NETWORK`).
- **B5. Un sistema, un motor.** Cada sistema tiene un único motor en `core/`, y las rutas sólo validan, llaman y proyectan. Lo legado se borra en un plazo fijo, no se conserva "por retrocompatibilidad".
- **B6. Aleatoriedad reproducible.** Toda tirada sale de un RNG con estado persistido por personaje (`rng_state` en SQLite) que sólo avanza el servidor. Los ids salen de `db.nextId()` (secuencia persistente) o de UUID; nunca de `Date.now()` ni de contadores en memoria. El lint amplía su regex a `Date.now|new Date|crypto.random|performance.now` dentro de `core/` y `server/`, con una lista de excepciones anotadas.
- **B7. Números y texto fuera del código.** Los números de juego viven en `data/gameplay/balance/` y la prosa en Tier G o Tier N. Un lint busca literales numéricos mayores que 2 y cadenas de más de 60 caracteres en `core/` y `server/`, con una lista de excepciones que se revisa en cada auditoría.
- **B8. El tiempo sólo lo avanza `CalendarEngine`.** Se eliminan `character/advance-day`, `acting/weekly-tick` y `case/advance-day` como rutas públicas. El tick semanal es idempotente por `(personaje, semana)`.

**Bloque C — Proceso mínimo**

- **C1. Git.** El trabajo se hace sobre un clon del repositorio. Antes de cualquier operación destructiva: commit limpio. Nada más.
- **C2. Decir "hecho" exige prueba.** Una afirmación de "hecho" cita el comando reproducible y su salida (test, lint o captura). Se prohíben los informes de "cierre" que no enlacen tests. Las sesiones anotan el DELTA de tests.
- **C3. Presentación.** Estados internos del cuerpo (cordura, corrupción, ruina, digestión) = objeto o prosa. Recursos que el personaje conoce (dinero, PA, tarifas, turnos) = números claros. Sin límite de palabras; sí con la guía de estilo de `ui3d`. El audit sustituto escanea `ui3d/src` y sólo busca cifras de estados internos.

Se retiran: leyes 1, 9, 10 (salvo el DELTA), 13 y 14 en su forma actual, el §4 histórico, §6.1 y el `?renderer=phaser`.

---

## 3. Historia y canon

### 3.1 Cómo está representado hoy

| Capa | Dónde | Qué contiene | Estado |
|---|---|---|---|
| Tier L | `reborn/data/content/` (67 JSON, `manifest.json` v2.0 con SHA-256) | Vías S9–S0 con fórmulas, libros, eventos, 50 esqueletos de investigación, 210 conspiraciones, NPCs, mundo | Congelado e íntegro (67/67). **37 de 67 archivos sin consumidor** (`PENDING_CONSUMER`). Incluye errores de fans, p. ej. `events/pathway_life_stories.json:806` "Inspector de Scotland Yard". |
| Tier G | `reborn/data/gameplay/` (22 archivos) | Era (`world_state.json`), orígenes, dilemas FOOL/VISIONARY, 1 caso mayor (truth model de calidad, `case_cherwood_heirloom.*`), 28 combatientes, 16 artefactos, 10 conspiraciones, 39 rutinas de NPC | Pasa el lint. **7 archivos no los lee ningún motor**: `artifacts.json`, `conspiracies.json`, `world_state.json`, `convergence_forces.json`, `lore/grimoires.json`, `pathways.manifest.json`, `balance/bestiary_archetypes.json`. `npc_weeks.json` (82 KB) son horarios de plantilla repetidos ("Despacho y lectura de correspondencia (lunes)"). |
| "Tier C" implícito: canon en el código | `reborn/src/**/*.ts` | Unas 400 cadenas narrativas largas: 25 dilemas legados de 22 vías (`ActingDilemmaEngine.ts:74-763`), 44 habilidades de 22 vías (`TacticalCombatEngine.ts`), relatos de ascensión, carta del Benefactor (`PrologueEngine.ts:151`), descripciones de distritos (`cityRoutes.ts:36-57`), sucesos del calendario, objetos iniciales | **Fuera de cualquier control.** Aquí se concentran los errores de canon. |

### 3.2 ¿Respeta el motor el canon?

Lo que está bien:
- Las fórmulas S8 (Payaso, Telépata) coinciden con Tier L (`AscensionEngine.ts:87-105` frente a `content/pathways/seer.json` y `spectator.json`). Pero están duplicadas en código, ignoran las cantidades y la alternativa "o característica Beyonder", y cualquier otra vía hereda la del Loco.
- Los nombres de secuencia y las escaleras de vía son en general correctos (Prisionero, Lunático y Hombre Lobo en Encadenado; Árbitro y Sheriff en Justiciar; Abogado y Bárbaro en Emperador Negro).
- R2 se aplica con cuidado en `npc_weeks.json`, con sustituciones anotadas.

Errores detectados (con seguridad alta):
- **Anacronismos del mundo real.** "Scotland Yard" aparece en `origins.json:229,248,253`, `ActingDilemmaEngine.ts:532,747`, `CalendarEngine.ts:236` y `ProceduralInvestigationService.ts:226`. "Niebla del Támesis" en `cityRoutes.ts:51`: el río de Backlund en la novela es el Tussock.
- **Geografía.** `DIST_BAYAM` figura como distrito de Backlund al que se llega en carruaje por 24 peniques (`DatabaseClient.ts:213`, `cityRoutes.ts:53-56`). Bayam es una ciudad del archipiélago de Rorsted, al otro lado del mar.
- **Errata.** "TRANSFORMACIÓN ASTRICA" (M5) y un rasgo con texto mecánico en inglés, "Trait Permanente: … (-15% Sanity Cap)" (`InvestigationEngine.ts:1045`).

Pendiente de revisión humana (no lo afirmo como error): los alias y dominios de los dioses en `world_state.json` (p. ej. el ámbito atribuido a la Diosa de la Noche Eterna y las identidades entre paréntesis). La revisión debe hacerla alguien con la novela delante. La auditoría no la ha hecho.

Nota de diseño: el origen "Detective Privado" en Cherwood, con pelo oscuro y corbata carmesí (`ASSET_PROMPTS.md` §2.2), recuerda mucho a Sherlock Moriarty, la identidad de Klein en ese mismo distrito. No viola R2, pero conviene decidir si es un guiño buscado o un riesgo de confusión.

### 3.3 Huecos de contenido (medidos)

- Vías jugables reales: 2 de las 6 declaradas. Sólo FOOL y VISIONARY tienen dilemas, habilidades Tier G, fórmula y relato de ascensión.
- Secuencias: S9→S8. `AscensionEngine.ts:407` fija `newSeq = 8`, así que de S8 no se puede subir a S7. `ActingDilemmaEngine.getDilemma` lanza `Error` (500) para VISIONARY S8 porque no hay dilema legado. El Diario de `ui3d` usa esa ruta, así que se romperá tras ascender con el Espectador (lo deduzco del código; no lo he ejecutado).
- Casos: 1 mayor, cableado por nombre en 10 sitios de `InvestigationEngine.ts`. El motor no es genérico.
- Combate: 1 enemigo genérico ("Sombra de Corrupción Astral"). Los 28 combatientes Tier G no llegan al juego.
- Telar (C5), artefactos y Repertorio, Conocimiento (C1): datos Tier G sin motor.

### 3.4 Propuesta: "lo único canónico es la historia"

1. **Crear `reborn/data/narrative/` (Tier N)** y mover allí, con su id actual: el truth model y la narrativa del caso, el prólogo, la carta, los orígenes (su parte narrativa), los relatos de ascensión, los ethos de vía y, después, los finales. El código sólo referencia ids.
2. **Inmutable (firma humana):** Tier N, `world_state.json` (reglas de era) y la lista de LEYENDA. **Congelado pero corregible por errata:** Tier L. **Fluido (lo cambian los agentes con tests):** balance, UI, motores, esquemas y arte.
3. **`lint:canon`** (regla A2) con tres listas versionadas en `data/narrative/canon_lists.json`: anacronismos, términos de CoI y leyendas. Su primera ejecución encontrará los errores de §3.2.
4. **Ids opacos para todo lo que revela la verdad** (hipótesis, culpables, pistas falsas). El nombre semántico queda en el archivo de autor, no en el protocolo.
5. **Revisión canónica G6 real.** Cada hito, 20 ítems al azar de Tier G y N revisados por el dueño en un formulario (se puede hacer como Artifact con base de datos). El resultado queda registrado con fecha.

---

## 4. Motores (backend)

### 4.1 Calidad por motor

| Motor | Tamaño | Calidad del núcleo | Uso real | Problemas principales |
|---|---|---|---|---|
| `GridCombatEngine` + `AtomRuntime` | 726 + 403 | **Buena**: átomos Tier G, matriz de estados, observación con probabilidad | **Sólo tests** (`gate_03`, `gate_05`, `gate_06_b`); la ruta sólo usa `getDistance` | Tiene un RNG por defecto sembrado con `Date.now()` (`:346`, `:582`) |
| `TacticalCombatEngine` | 377 | Mala: 44 habilidades de 22 vías y todos los números en código | **Producción** | Ley 4; alcance (22 vías cuando son 6); daño fijo sin RNG en la ruta |
| `combatRoutes.ts` | 702 | Lógica de juego en la ruta | Producción | El cliente fija el enemigo y la emboscada (`:11-23`); iniciativa, mitigación, negociación y huida escritas a mano (`:231-247,407,535,551`); el enemigo no tiene habilidades (Escudriñar revela 2 ids fijos, `:424`); la victoria da 120 d y no entrega ingrediente (M2, M3); id con `Date.now()` (`:269`) |
| `ActingDilemmaEngine` | 1199 | El Tier G (resolver, tick, decaimiento) es bueno | Mixto | 700 líneas de dilemas legados en código; el tick no comprueba si ha pasado una semana y reutiliza `slice(-7)` (`:1098`), lo que permite farmear digestión; cobra alquiler dentro del tick (`:1186`) |
| `InvestigationEngine` | 1171 | Buen modelo: pistas, fuentes, aristas, hipótesis, caducidad | Producción | Cableado a un solo caso; texto mecánico en la resolución D (M4); ids con `Date.now()` (`:136,1061,1119`) |
| `ProceduralInvestigationService` | 303 | Legado | Rutas legacy | Devuelve `culprit_name`; semilla `Date.now()` (`:79`) |
| `SomaticsEngine` | 643 | Buena: tres niveles, anclas, cicatrices, rampage, lee `balance/somatics.json` con Zod | Producción | Rampage y reparación de anclas se exponen como rutas que el cliente puede llamar (`characterRoutes.ts:205-230`) |
| `AscensionEngine` | 478 | Cinco puertas bien planteadas | Producción | Puerta 1 siempre `true` (`:125`); preparación autodeclarada por el cliente; `newSeq = 8` fijo; fórmula del Loco por defecto; números de la tirada en código; la semilla puede venir del cliente |
| `CalendarEngine` | 435 | Buena idea: franjas y tick semanal ordenado | Producción | **Doble cobro de alquiler** (`:287` más `ActingDilemmaEngine.ts:1186`; leído en código, no ejecutado); decaimiento de convergencia siempre en `'DIST_CHERWOOD'` (`:356`); convive con otras tres vías de avanzar el tiempo |
| `EconomyEngine` | 343 | Correcta, lee balance con Zod | Producción | La venta usa el grado que manda el cliente (`:240`) y un fallback de 24; sin sobre de comando |
| `ConvergenceEngine` | 359 | Razonable | Sólo desde calendario y ascensión | Ninguna ruta propia; `convergence_forces.json` no se lee |
| `IdentityEngine` | 200 | Simple | Producción | Se puede resolver cualquier evento del catálogo sin haberlo sacado (`:127`); semilla por query (`identityRoutes.ts:12`) |
| `PrologueEngine` / `OriginEngine` | 343 / 153 | Correctos; Zod en orígenes | Producción | Sin `commandId`; dos formas de crear personaje con valores iniciales distintos (`characterRoutes.ts:43-58` frente a `prologueRoutes.ts:33-49`) |
| `SessionTelemetry` | 176 | — | **Código muerto** | — |
| Infra (`DatabaseClient`, `MigrationRunner`, `CommandProcessor`) | 1366 / 113 / 133 | Buena: WAL, migraciones, recibos con hash canónico y revisiones | — | `commandId` opcional; los recibos guardan la respuesta sin proyectar; `IdGenerator` usa un contador en memoria; `schema.sql` duplica las migraciones y no se usa |

### 4.2 El cliente decide lo que debería decidir el servidor

| Ruta | Qué controla el cliente | Consecuencia |
|---|---|---|
| `POST /api/combat/start` | `enemyHp`, `enemySpeed`, `enemyName`, `isConcealed`, `ambushDeclared`, `ambushMode: PLAYER_AMBUSH`, `forceNew` | Puede crear enemigos de 1 PV con iniciativa propia y 4 PA |
| `POST /api/economy/sell` | `grade` (`RARE`) de cualquier objeto del inventario | Dinero infinito (vender el revólver como raro) |
| `POST /api/ascension/drink` | `seed` y `confirmedAt` | Elegir una semilla con éxito garantizado; falsear la telemetría de duda del Trago |
| `POST /api/ascension/prepare` | Las 4 casillas de preparación | La puerta 4 es autodeclarada: resta 20 puntos a la probabilidad de fallo |
| `POST /api/acting/weekly-tick` | Cuándo pasa la semana, sin límite | Digestión a 100 por repetición (el `slice(-7)` recicla actos) y alquiler cobrado N veces |
| `POST /api/character/advance-day`, `/api/investigation/case/advance-day` | El tiempo | Se salta el tick del calendario y la caducidad |
| `GET /api/identity/roll?seed=`, `POST /api/identity/resolve` | La semilla y el `eventId` | Resolver el evento más rentable del catálogo |
| `POST /api/character/interact-anchor` | `amount` | Reparar anclas a voluntad |
| `POST /api/character/trigger-rampage` | Provocar un descontrol | Destruir la partida propia (o ajena) |
| `POST /api/city/travel` | Guarda como ubicación la cadena que envía el cliente (`cityRoutes.ts:131`), no el id del distrito | Ubicaciones arbitrarias que después usan la convergencia y el alquiler |
| `POST /api/character/new` | Cualquiera de las 22 vías | Se juega fuera del alcance 1.0 con habilidades escritas a mano |

`ui3d` no explota ninguna de estas vías: envía `ambushMode: 'NEUTRAL'` y `d.id`. El problema es del contrato del servidor. Mientras el juego sea local es un problema de integridad del diseño. En una demo pública (Fase 2) lo sería también de trampas, porque no hay autenticación: cualquiera que conozca un `characterId` puede mutar ese personaje. CORS está abierto con `origin: '*'` (`app.ts:31`).

### 4.3 Fugas de información

| Fuga | Evidencia | Gravedad |
|---|---|---|
| `GET /api/investigation/cases/:id` devuelve `culprit_name` y `state_json` sin proyectar | **Verificado en vivo**: `"culprit_name":"El Benefactor Silencioso"`; `investigationRoutes.ts:156-158` | Alta |
| `GET /api/commands/receipt/:id` devuelve `receipt.response` crudo (se proyecta después de guardar) y de cualquier personaje | `commandRoutes.ts:21`; recibos `INVESTIGATION_*` en la base con el estado completo | Alta |
| Los ids delatan la verdad: `HYPOTHESIS_TRUE_NETWORK` | `case_cherwood_heirloom.json` `hypothesisSlots` | Alta en cuanto se filtra cualquier id |
| Rutas legacy `case/generate` y `clue/investigate` devuelven el caso completo | `investigationRoutes.ts:530-590` | Media (`ui3d` no las usa) |
| `GET /api/acting/dilemma` sin `?public=1` devuelve la alineación y los efectos (M6) | `actingRoutes.ts:37-44` | Media |
| PV exactos del enemigo (M1) | `combatRoutes.ts:63-72` | Es una decisión de diseño; recomiendo enviar bandas en lugar de cifras |

### 4.4 GET con efectos secundarios

- `GET /api/investigation/case/active/:id` crea una instancia del caso si no existe (`investigationRoutes.ts:203`). Debe ser `POST /case/activate`, que ya existe.
- El resto de GET revisados son de sólo lectura. No hice un volcado antes y después; lo he comprobado leyendo el código.

### 4.5 Deuda y riesgos, ordenados por impacto

| Prio. | Hallazgo | Acción |
|---|---|---|
| **P0** | Autoridad del cliente (§4.2) | Quitar los campos de los esquemas Zod y cerrar o convertir en internas las rutas de tiempo y de depuración |
| **P0** | Fugas (§4.3) | DTO por lista blanca, recibos proyectados, ids opacos |
| **P0** | Tick semanal repetible y doble cobro de alquiler | Tick idempotente por `(personaje, semana)`, invocado sólo por `CalendarEngine`; un único escritor del alquiler |
| **P0** | Colisión de ids tras reiniciar (`IdGenerator.ts`) | `db.nextId()` para todo; los prefijos sin personaje (`cve`, `tel_drink`, `inc_nighthawk`) son los primeros candidatos a violar la clave primaria |
| P1 | Combate de producción ≠ combate probado | Conectar `GridCombatEngine` y `combatants.json` a `combatRoutes`; borrar `TacticalCombatEngine` |
| P1 | Diario en la ruta legada (siempre el mismo dilema; 500 en VISIONARY S8) | Pasar `ui3d` a `/api/acting/dilemmas` (Tier G) y borrar los dilemas del código |
| P1 | Ascensión limitada a S9→S8, puerta 1 falsa, fórmula del Loco por defecto | Leer las fórmulas de Tier L; `targetSeq = sequence - 1`; `ContentGapError` si falta la fórmula |
| P1 | ~15 mutaciones sin `CommandProcessor` | Regla B2 |
| P2 | Números y prosa en código (Ley 4 / B7) | Migrar por sistemas y activar el lint B7 |
| P2 | Rutas legacy y motores muertos (`ProceduralInvestigationService`, `SessionTelemetry`, `characterRoutes /advance`, `schema.sql`, JSON sueltos en la raíz) | Borrar, con commit previo |
| P2 | `tests/` deja SQLite en `tmp_tests/`; G1 simula en SQL | G1 debe jugar por `app.inject`; limpiar los temporales |
| P2 | `path.resolve('saves/…')` depende del directorio de trabajo | Resolver desde `import.meta.url` |

---

## 5. Clientes

### 5.1 `ui/` frente a `ui3d/`

| | `ui/` | `ui3d/` |
|---|---|---|
| Tecnología | React 19 + Phaser 4.2.1 + Tailwind + framer-motion + howler | React 19 (HUD) + Three.js r186 WebGPU/TSL + zustand |
| Tamaño | ~26 500 líneas, 100 archivos, 67 MB de arte JPG | ~9 000 líneas, 4,3 MB en `public/`, 97 MB en `art-source/` |
| Estado | Congelado; el CI (`ci.yml`) lo compila y el audit diegético lo escanea | Activo; **el CI no lo compila ni lo audita** |
| Autoridad del servidor | Tenía victorias simuladas (auditoría 5583cc5, F03) | Cliente estricto; `commandId` y consulta del recibo si falla la red (`api/client.ts:48-59`) |
| Tests | Scripts `verify_p0x` | **Ninguno** |

**Recomendación:** declarar `ui3d` cliente oficial. Portar lo que sólo tiene `ui/` (el `VeilOverlay`, "Velo Ocultista") o descartarlo por decisión explícita. Mover el CI a `ui3d` y archivar `ui/` en una rama.

### 5.2 Arquitectura de `ui3d` y qué conservar

Es una arquitectura sólida para lo que pretende, "láminas pintadas vivas":
- `engine/Stage.ts`: renderer WebGPU con respaldo WebGL 2, cámara **ortográfica** sobre un lienzo de 1920×1080 y `RenderPipeline` (bloom selectivo, viñeta, grano).
- `engine/PlateLayer.ts`: material TSL con paralaje por profundidad, reiluminación, azogue, lluvia y contorno de selección. Hace unas 30 lecturas de textura por píxel.
- `PlateMask` une shader y detección de clics en un mismo buffer: buena solución.
- `places/specs/*.ts` guarda la geometría medida sobre cada lámina.
- `somatics.ts` traduce los niveles del motor a objetos (Ley del Objeto bien aplicada).
- `prose.ts` limpia la jerga técnica que narra el servidor. Es un síntoma de que el backend mezcla presentación y lógica.

**Conservar íntegros:** `api/client.ts`, `session/store.ts`, el kit HUD, `audio/Ambience.ts`, `effects.ts`, `homography.ts`, el patrón `PlaceSpec` y `PlateLayer` (reutilizable en la variante 3D por proyección de §7).

**Deuda:**
1. La geometría está medida sobre láminas provisionales con UI pintada. Cualquier cambio de arte obliga a recalibrar a mano (`GRID_CORNERS`, `BOARD_CORNERS`, `COUNTER_SLOTS`, polígonos). Es el acoplamiento más frágil del cliente y un argumento a favor del 3D, donde los puntos interactivos son mallas.
2. Cero tests, ni siquiera de contrato de tipos contra el servidor: `api/types.ts` tiene 411 líneas escritas a mano. Conviene generar tipos desde los esquemas Zod del servidor.
3. Bundle de 1,27 MB en un solo trozo; rendimiento no medido; Firefox y Safari sin probar.
4. Algunas mutaciones van sin `commandId` porque el servidor no lo admite (`api/client.ts:71-79,126-136`): el comentario "toda mutación lleva commandId" no es cierto todavía.
5. El Diario usa el endpoint legado (§4.5).

---

## 6. Arte

- **Pipeline actual:** `ASSET_PROMPTS.md` le pide al usuario ediciones de las 8 láminas del Atlas (quitar la UI pintada), recortes con fondo verde, retratos, pistas, depth (Depth Anything V2) y emisión. `scripts/process-assets.mjs` hace el recorte por croma, convierte a WebP y genera `public/assets.json`. `assetUrl()` resuelve primero el definitivo y después el provisional. El diseño es bueno. **`art-source/generated/` está vacío**: todo lo visual está bloqueado por esa entrega.
- **Dependencia del Atlas:** las 8 láminas miden **1672×941**, por debajo del lienzo de 1920×1080. Llevan UI y personajes pintados, y el cliente los tapa con paneles opacos (`data-provisional`). Hoy se juega sobre bocetos.
- **Coherencia:** hay tres generaciones de arte que no se hablan: `ui/public/art` (59 JPG, 67 MB, 27 huérfanos según `ASSET_PIPELINE_REPORT.md`), `art/` (122 MB: referencias, composiciones y contrato GFX01) y `ui3d/art-source` (97 MB). La paleta (`art/manifest/art_contract.md`: ébano, caoba, latón, marfil, carmesí) sí se mantiene. El estilo del Atlas ("painterly realism", luz volumétrica, microdetalle) es de concept art generado por IA. Es muy atractivo, pero caro de mantener consistente entre escenas y de reproducir en tiempo real.
- **Riesgos:** (a) los retratos y actores generados uno a uno derivarán de estilo sin una referencia fija (conviene una "hoja de personaje" con semilla o LoRA); (b) la rejilla de combate pintada no coincide con la lógica: las cajas pintadas no son obstáculos en el motor; (c) no hay licencias ni registro de procedencia de las imágenes generadas. Esto importa para Steam: debe declararse el uso de IA generativa en el formulario de contenido.
- **Recomendación:** unificar en un único `art/` con `art-source` (entradas), `public` (derivados) y un `provenance.json` (herramienta, prompt y fecha). Borrar los derivados huérfanos.

---

## 7. Propuesta 3D a largo plazo

### 7.1 Punto de partida honesto

`ui3d` ya es un motor 3D, pero dibuja **2D**: una cámara ortográfica mirando un plano pintado. Pasar a "escenas 3D" significa cambiar de dónde sale la imagen, no de motor. Three.js r186 con WebGPU/TSL es una base adecuada. WebGPU está disponible en Chrome y Edge, y en versiones recientes de Safari y de Firefox para Windows; `ui3d` ya tiene respaldo WebGL 2. Conviene verificar el soporte real del público objetivo antes de comprometerse.

### 7.2 Qué se gana y qué se pierde

| Se gana | Se pierde o cuesta |
|---|---|
| La cámara se mueve de verdad (acercarse a la mesa, girar hacia el espejo), con transiciones entre lugares espaciales | El acabado del Atlas: la luz volumétrica pintada y el microdetalle no se consiguen en tiempo real con un equipo de una persona |
| La luz de la vela ilumina la escena de verdad (cordura = luz real); sombras dinámicas | La coherencia gratuita de "una lámina = una composición perfecta": en 3D cada ángulo tiene que funcionar |
| Combate con geometría real: obstáculos, línea de visión y alturas; la rejilla sale del suelo y no de una homografía | Un pipeline nuevo: modelado, UV, texturas, rig y animación |
| Los puntos interactivos son mallas: se acaba la recalibración de polígonos | Descarga y rendimiento: más megas y más GPU, más difícil en móvil |
| Personajes animados que reaccionan (herido, descontrol) | Horas de producción: con IA, los modelos generados son rápidos pero de topología y estilo irregulares |

### 7.3 Enfoques posibles

| Enfoque | Cómo | Fidelidad al Atlas | Coste por escena (orden de magnitud, una persona con IA) | Riesgos |
|---|---|---|---|---|
| **A. 2.5D actual mejorado** | Lámina, profundidad y emisión (ya previsto) | Máxima | Horas | Cámara casi fija; no resuelve el acoplamiento con los polígonos |
| **B. Proyección de la pintura sobre geometría simple** ("diorama") | Casar la cámara de la lámina (fSpy o a mano), modelar cajas de bajo detalle en Blender, proyectar la pintura desde la cámara, repintar lo oculto con inpainting | Muy alta cerca del ángulo original; se degrada más allá de ±10–15° | 3–5 días tras un pipeline inicial de 1–2 semanas | Estiramiento de texturas; hay que repintar lo que quedaba oculto |
| **C. Gaussian splats** | Generar la escena como splats a partir de la lámina o de vistas generadas (herramientas de "mundo a partir de imagen"; renderizadores de splats para Three.js) | Alta en color y textura | 1–3 días si la herramienta acierta | La luz queda fija (la vela no puede iluminar); clics difíciles (hace falta una malla colisionadora aparte); 15–60 MB por escena; ordenar splats en GPU es caro en móvil; herramientas jóvenes, verificar licencia y exportación |
| **D. Escenas modeladas low-poly con shading pintado** | Modelado propio o props generados por IA (image-to-3D) más texturas pintadas y post pictórico (Kuwahara, trazo) en TSL | Media: otro estilo, "pintura viva" más que "concept art" | 2–4 semanas por interior; 1–2 semanas por personaje con rig | La consistencia de estilo depende del artista; es el enfoque más caro, pero el único totalmente libre |
| **E. Personajes** | (1) Recortes 2D como cartas en el espacio 3D ("teatro de papel"); (2) 3D riggeado con autorig y animaciones de biblioteca, con toon o painterly shader | (1) alta; (2) media | (1) días; (2) 1–2 semanas cada uno | (2) choca visualmente con fondos pintados si no se unifica el shading |

**Recomendación: híbrido por lugar, decidido por lo que aporta al juego.**
- **Interiores de lectura** (Desván, Diario, Umbral, Despacho, Bazar): **B**, o **A** si el prototipo B no convence. Aquí el valor está en la atmósfera y en los objetos que se tocan; la cámara apenas se mueve.
- **Combate y exteriores** (callejón y calles de Cherwood): **D** con personajes **E(1)** al principio. Aquí el 3D sí aporta juego: obstáculos, línea de visión y cámara táctica.
- **Tablero de corcho:** se queda en 2D. Es un documento.
- **Splats (C):** sólo como experimento de fondo lejano (vista de la ciudad por la claraboya), no como base.

### 7.4 Pipeline de assets necesario

- **Formato:** glTF 2.0 con texturas KTX2/Basis y compresión Meshopt o Draco (cargadores compatibles con WebGPU en r186).
- **Herramientas:** Blender (cámara casada, proyección, bake de luz a lightmaps), un generador image-to-3D para props (con revisión de topología), autorig y biblioteca de animaciones, Depth Anything para la variante B. Registro de procedencia (§6).
- **Presupuesto por escena interior** (orientativo): ≤150 k triángulos, ≤150 draw calls, ≤25 MB de descarga, lightmap horneado más 1–3 luces dinámicas (la vela). Objetivo: 60 fps en una GPU integrada de portátil reciente, a 1080p y con `pixelRatio` 1.
- **Contrato con el motor:** cada malla interactiva lleva un `userData.hotspotId` que coincide con los ids de `PlaceSpec`. Así el cliente sigue sin decidir nada y los ids narrativos siguen en Tier N.

### 7.5 Hoja de ruta 3D por fases (con puertas)

| Fase | Contenido | Criterio para seguir |
|---|---|---|
| 3D-0 (requisito) | Cerrar los P0 del §4.5. Las láminas limpias del Atlas (sin ellas no hay con qué comparar) | Motor sin fugas ni autoridad del cliente |
| 3D-1 Prototipo del Desván, 2–3 semanas | Mismo lugar en variantes A (actual), B (proyección) y D (modelado rápido con props de IA). Vela = luz real en B y D. Un clic de cada tipo (carta, espejo, reloj) | Comparación a ciegas con 3–5 personas: ¿cuál "es el juego"? Se miden fps, MB y horas reales invertidas |
| 3D-2 Callejón de combate en D | Suelo con rejilla real, cajas como obstáculos (requiere soporte de obstáculos en el motor), cámara táctica, personajes E(1) | Una partida de combate completa se entiende mejor que en la lámina (test con usuarios) |
| 3D-3 Extensión | Aplicar la variante ganadora al resto de interiores; decidir E(2) según presupuesto | Coste por escena dentro de lo estimado en 3D-1 |

Coste honesto: con una persona y ayuda de IA, pasar las 8 escenas a B cuesta unos 2 meses; a D, entre 6 y 9 meses, sin contar personajes animados. La constitución (§11) ya reserva 8–15 k€ para arte en la Fase 3. Esa partida alcanza para un artista 3D que haga 3–4 interiores estilizados y 2 personajes riggeados. No alcanza para todo en D. Esta es la razón principal para recomendar el híbrido.

---

## 8. Hoja de ruta priorizada

| # | Acción | Impacto | Esfuerzo | Depende de |
|---|---|---|---|---|
| 1 | Recuperar git: clonar `orlandoavila11/Proyecto_lotm`, llevar allí los cambios locales de las sesiones de `ui3d` y hacer commit | Alto (testigo y CI) | Bajo (horas) | — |
| 2 | Reescribir AGENTS.md con el esquema de §2.3 (12 reglas); retirar §4, §6.1 y las leyes 1, 9, 13 y 14 | Alto | Bajo | 1 |
| 3 | Cerrar la autoridad del cliente (§4.2): esquemas Zod sin parámetros de resultado; rutas de tiempo y depuración internas | Muy alto | Medio (2–3 días) | 1 |
| 4 | Fugas: DTO por lista blanca, recibos proyectados, ids opacos en el caso; `GET /cases` sin `culprit_name` | Muy alto | Medio | 1 |
| 5 | Tick semanal idempotente y un único escritor del alquiler; borrar `acting/weekly-tick`, `character/advance-day` y `case/advance-day` | Alto | Bajo | 3 |
| 6 | Ids desde `db.nextId()`; RNG con estado persistido por personaje; semillas nunca del cliente | Alto | Medio | 1 |
| 7 | `commandId` obligatorio y todas las mutaciones por `CommandProcessor` (unificar el calendario) | Alto | Medio | 3 |
| 8 | Crear Tier N y `lint:canon`; corregir Scotland Yard, Támesis y Bayam (en Tier L vía `errata.json`) | Alto (historia) | Medio (1 semana) | 2 |
| 9 | Combate: conectar `GridCombatEngine` y `combatants.json`; borrar `TacticalCombatEngine`; ingrediente real al vencer | Alto | Alto (1–2 semanas) | 3, 7 |
| 10 | Diario de `ui3d` en `/api/acting/dilemmas`; borrar los dilemas en código | Medio | Bajo | 8 |
| 11 | Ascensión genérica: fórmulas desde Tier L, `targetSeq = sequence - 1`, `ContentGapError` | Medio | Medio | 8 |
| 12 | Reconciliar `pathways.manifest.json` con la realidad (2 jugables) o producir Tier G de las otras 4 | Medio | Bajo / Muy alto | 8 |
| 13 | CI: compilar `ui3d`, audit de presentación sobre `ui3d`, G1 jugando por `app.inject` | Medio | Medio | 1, 2 |
| 14 | Tests mínimos de `ui3d` (contrato de tipos generado desde Zod, humo de cada lugar) | Medio | Medio | 13 |
| 15 | Entregar las láminas limpias y los mapas de profundidad y emisión (`ASSET_PROMPTS.md`) y recalibrar | Alto (visual) | Medio (lo hace el usuario) | — |
| 16 | Prototipo 3D del Desván en 3 variantes (§7.5, fase 3D-1) | Estratégico | 2–3 semanas | 3–7, 15 |
| 17 | Borrar código muerto (JSON en la raíz, `schema.sql`, `SessionTelemetry`, rutas legacy, `ui/` a una rama) | Bajo | Bajo | 1, 9, 10 |
| 18 | Revisión humana G6 del canon de `world_state.json` (dioses e iglesias) | Medio (historia) | Bajo (horas del dueño) | 8 |

---

## 9. Anexo: evidencias consultadas

**Documentos:** `AGENTS.md`; `reborn/docs/PATH_TO_GODHOOD_v4.md`; `ui3d/TRANSFERENCIA.md`, `AUDITORIA.md`, `ASSET_PROMPTS.md`, `README.md`; `AUDITORIA_CODIGO_PATH_TO_GODHOOD_5583cc5.md` (secciones 1–3); `AUDIT_CLOSURE_REPORT.md` (tabla de hallazgos); `ASSET_PIPELINE_REPORT.md` (§1–2); `art/manifest/art_contract.md` (§1); `.github/workflows/ci.yml` (en el directorio padre).

**Backend leído:** `reborn/src/server/app.ts`, `server.ts`, `routes/{combat,character,acting,city,investigation,economy,ascension,calendar,identity,prologue,command}Routes.ts`; `core/combat/TacticalCombatEngine.ts` (completo), `GridCombatEngine.ts` (API y carga); `core/acting/ActingDilemmaEngine.ts` (legado, `resolveDilemma`, `processWeeklyTick`); `core/ascension/AscensionEngine.ts` (fórmulas, `drinkPotion`, checklist); `core/calendar/CalendarEngine.ts` (slot, tick, fechados); `core/economy/EconomyEngine.ts` (alquiler, venta); `core/identity/IdentityEngine.ts` (roll y resolve); `core/investigation/InvestigationEngine.ts` (estado y proyección); `core/rng/IdGenerator.ts`, `SeededRNG.ts`; `infra/database/CommandProcessor.ts`, `DatabaseClient.ts` (inserciones, distritos); `infra/data/CanonicalDataLoader.ts`.

**Scripts y datos:** `reborn/scripts/check_anti_math_random.ts`, `check_diegetic_ui.ts`, `verify_tier_l.cjs`, `lint_tier_g.ts` (ejecutados: los cuatro en PASS); `data/gameplay/*` (recuento de contenido por archivo, búsqueda de consumidores); `data/content/manifest.json` (37/67 `PENDING_CONSUMER`); `pathways/seer.json` y `spectator.json` (fórmulas S8); `case_cherwood_heirloom.json` y `.narrative.md` (cabecera y truth model); `origins.json`, `world_state.json`, `npc_weeks.json` (búsquedas de canon).

**Tests (muestreo):** `gate_g1_player_simulator.test.ts` (líneas 27–250); referencias a `GridCombatEngine` en `gate_03`, `gate_05` y `gate_06_b`; `dist_smoke.test.ts` (causa del fallo local: falta `dist/`). La suite no se volvió a ejecutar.

**Motor en vivo (sólo GET):** `/api/health`; `/api/city/districts`; `/api/investigation/cases/char_n3yf4y_7` (confirma la fuga de `culprit_name`).

**Base de datos (sólo lectura):** `reborn/saves/lotm_reborn.db`: tablas, personajes, ids de `battles` y `acting_records` (fragmento `kij6_1` repetido tras reiniciar) y recibos `INVESTIGATION_*`.

**Clientes:** `ui3d/src/api/client.ts`, `App.tsx`, `session/store.ts`, `places/{somatics,prose,prologueMemory,registry,Combat}.ts(x)`, búsquedas en `Journal.tsx`, `Ascension.tsx`, `Cherwood.tsx`, `DeskPanels.tsx`; `engine/Stage.ts` y `PlateLayer.ts` (búsquedas), `PlaceSpec.ts`; `scripts/process-assets.mjs`, `src/assets.ts`; láminas `V01_desvan.png` y `V06_combate.png` (vistas; 1672×941). `ui/package.json` y estructura de `ui/src` (vista general).

**No verificado:** ejecución de la suite; juego en navegador; efectos de las rutas POST (deducidos del código, en particular el doble alquiler y el farmeo del tick); rendimiento; exactitud de los alias de los dioses en `world_state.json`; soporte actual de WebGPU por navegador y estado de las herramientas de splats e image-to-3D citadas en §7.
