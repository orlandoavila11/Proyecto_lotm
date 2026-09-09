# PATH TO GODHOOD — LOTM_ENGINE_REBORN (v4.0)
## Documento Maestro de Producto, Arquitectura y Diseño

> Este documento representa la evolución v3.5 -> v4.0 y la constitución oficial del proyecto.
> Su contenido es ley arquitectural y de diseño para cualquier desarrollo subsiguiente.

---

## 0. QUÉ ES ESTE DOCUMENTO

Es la evolución v3.5→v4.0, y cambia por tres hechos nuevos:

Existe una biblioteca de contenido real (67 JSON, 3.10 MB, con manifest y hashes). Eso cambia el mapa: el riesgo del proyecto ya no es "no hay contenido", es **"hay contenido con forma de lore, no con forma de juego"**. La misión central de v4.0 es exactamente esa transformación.

Advertencia previa, porque importa: el reporte "9/9 suites al 100% sin regresiones" sigue siendo la métrica tautológica que la auditoría diagnosticó. Los tests actuales prueban que las funciones devuelven lo que definen. **En v4.0 nada está "al 100%" hasta que lo dicen los gates de §9.** Ese hábito es el primero que hay que matar.

---

## 1. EL PRODUCTO

> **"Path to Godhood"** — un RPG web de investigación y vida cotidiana en el universo de *Lord of the Mysteries*. El jugador vive la doble vida de un Beyonder en Backlund: de día, profesión, sospechas y deudas; de noche, un papel sobrenatural que lo está digiriendo. El conocimiento es munición y veneno. La locura reescribe lo que ve. Y cada ascenso se paga.

| Dimensión | Definición |
|---|---|
| Formato | Web app local/online: núcleo TS determinista + Fastify + SQLite + cliente React **diegético** (escritorio-dossier-velo, no dashboard) |
| Duración | 30–40 h principal · 60 h+ completista · rejugabilidad estructural (6 vías × 4 vectores por caso) |
| Clase de referencia | Roadwarden, Balatro, Fallen London: texto + sistemas + interfaz tematizada |
| Pitch de una línea | *El conocimiento es el arma; el papel que interpretas es tu nivel; la poción es el jefe final de ti mismo* |
| Entrega | Demo gratuita → Early Access (Acto I–II) → 1.0 (S9→S3) → 1.1 (modo Conspiraciones, reutilizando la biblioteca) |

**Lo que NO es:** acción en tiempo real, sprites animados estilo CrossCode, 22 vías jugables, S2/S0 jugables, multijugador, mundo abierto. Cada una de esas cosas es una trampa que la biblioteca va a intentar tentar (§4.4).

---

## 2. PILARES (intactos desde v1 — no se renegocian)

1. **C1 · El conocimiento es poder:** las habilidades enemigas son opacas hasta identificarlas; los libros enseñan y dañan; los epítetos correctos abren rituales.
2. **C2 · El Acting es la progresión:** no hay XP. Se avanza interpretando el papel (digestión semanal).
3. **C3 · La locura distorsiona el juego:** umbrales de corrupción que inyectan opciones [S], eventos que solo existen corrupto, descontrol como suceso, no como booleano.
4. **C4 · Todo se cobra:** la Mirada/convergencia castiga la exposición; el Precio cobra en vínculos y recuerdos en S7/S5/S3.
5. **C5 · El mundo se mueve sin ti:** conspiraciones con temporizador que escalan aunque no las mires; casos que caducan y se resuelven mal.

---

## 3. ALCANCE 1.0 (cerrado — la biblioteca no lo amplía)

| Elemento | Alcance | Fuente |
|---|---|---|
| Vías jugables | **6:** FOOL, CHAINED, SPECTATOR, JUSTICIAR, MOON, DEMONESS (escalonadas: 2→4→6 por hito) | pathways/ (Tier L) + transformación Tier G |
| Vías pasivas | Las otras 16: NPCs, enemigos, artefactos, Compendio | pathways/ reuso directo |
| Campaña | **S9→S3**, con Aval (S7), Precio Menor (S5), Precio Mayor (S3), 5 finales | — |
| Ciudad | Backlund, **5 distritos × 3 capas** (Calle/Velo/Bajos), ciudad-escalera por banda | districts (repo) + world/ |
| Casos | **10 Mayores** (modelo de verdad humano) + ~25 menores (plantilla + esqueletos de la biblioteca) | investigations_data (50) |
| Telar | **20 conspiraciones activas** de las 210 | conspiracies |
| Artefactos sellados | **~50** activos en la economía de Repertorio (de los 124) | artifacts |
| NPCs | 12–15 únicos · ~60 secundarios · ~150 sistémicos | npc.json (100) + generación |
| Organizaciones | 6 (Noche/Nighthawks, Sol, Gremio de Boticarios, Orden Aurora como antagonista, + 2 de la biblioteca) | organizations_expanded (10) |
| Libros | ~40 lecturas activas (conocimiento-peligroso) | books (100) |
| Calendario | Día (3–4 acciones) · semana (tick: acting, mercado, caducidad, convergencia) · **4 estaciones** como filtros de eventos/mercado | events con conditions |

---

## 4. LA BIBLIOTECA: AUDITORÍA DE REUTILIZACIÓN

### 4.1 La doctrina de dos capas (la decisión central de v4.0)

La biblioteca tiene forma de **enciclopedia**, no de **juego**: campos descriptivos, textos libres, efectos narrados en prosa. La solución no es reescribirla: es **declarar dos tiers y un contrato**:

- **TIER L (Library — lore pasivo):** contenido canónico consumido por Compendio, NPC, enemigos, organizaciones, textos de mundo. *Ya es válido casi todo.* Se congela, se versiona, se consulta. **Los agentes no lo "mejoran": lo leen.**
- **TIER G (Gameplay — contenido jugable):** contenido derivado/autorado con semántica mecánica validada por lint. **Si una vía jugable carece de Tier G, el build FALLA.** Aquí vive el juego.

El `manifest.json` se extiende para declarar por archivo: **tier, sistema consumidor, estado de validación Tier G**. Cobertura computada desde el manifest, cero porcentajes hardcodeados.

### 4.2 Veredicto por categoría

| Carpeta | Volumen | Veredicto | Reuso 1.0 | Transformación requerida |
|---|---|---|---|---|
| `pathways/` | 22 vías, S9–S0 | ✅ **ORO puro** | 100% | Ninguna. Es el Compendio, las fórmulas de las Cinco Puertas y las 16 vías pasivas. Ya lo carga el CanonicalDataLoader |
| `lore_knowledge/books.json` | 100 | ✅ **ORO** | ~40 activos | Casi ninguna: su schema (requisitos de secuencia, penalización por leer bajo secuencia, coste de sanidad/corrupción, recompensas de conocimiento) es el sistema C1 ya diseñado. Solo balanceo global |
| `lore_knowledge/honorific_names.json` | — | ✅ ORO | 100% | Ninguna: es el sistema de epítetos de rituales |
| `events/identity_events.json` | 108 | ✅ ORO | ~90% | Anclar a calendario semanal/profesión/sospecha. Es la presión de la doble vida, ya casi jugable |
| `events/pathway_events.json` | 462 | 🔨 **BUENO, necesita cirugía** | ~70% | Es el pool del Acting: tiene condiciones y outcomes. Faltan: 2–3 opciones con trade-offs, pesos de acto, decaimiento por repetición y cero telegrafiado. Filtrar 6 vías jugables; resto a Tier L |
| `investigations/investigations_data.json` | 50 | 🔨 **ESQUELETOS** | ~60% espina dorsal | Tienen distrito, vía afín, pistas mínimas, recompensas y fail-forward. Falta: modelo de verdad (quién/cómo/por qué), grafo de 6–8 pistas con ≥2 fuentes, 4 vectores, hipótesis, caducidad. 10 a Mayores, 40 a menores |
| `investigations/conspiracies.json` | 210 | ✅ **ORO para el Telar** | 20 activas ahora | Actores, objetivo, secreto, fases de escalada y consecuencias sistémicas. Faltan: disparos, temporizador, estados y affordances del jugador |
| `bestiary_npcs/npc.json` | 100 | ✅ ORO | ~80% | Rutina día/noche, facción, vía, secuencia, sospecha. Falta: horario semanal completo, memoria, opinión por identidad |
| `bestiary_npcs/monsters*` | 3 archivos | 🔨 BUENO | ~70% | Falta capa Tier G de combate: stats en átomos, estados, opacidad (oculto hasta Escudriñar) + tag de vía para Convergencia |
| `artifacts/*` (124 + grades) | 7 archivos | 🔨 **ORO con compilación** | ~50 activos | Prosa libre ("responde cualquier pregunta con 95% de precisión..."). Requiere compilar a átomos + reglas de Presagio |
| `world/` (12 archivos) | iglesias, dioses, orgs, tarot | ✅ ORO | ~80% | Datos de facciones y Compendio. `tarot_club` queda Tier L (lore); el Círculo del jugador es sistema 1.1 |
| `quests/sequence_*.json` | 10 archivos | ⏸ **DÉBIL — semillas** | ~40% | Semillas de encargos plantillados. Los 7 archivos de S6→S0 no se tocan en 1.0 |
| `artifacts/sefirot` + `samples` | — | ⏸ Tier L puro | 0% gameplay | Lore del Compendio |

### 4.3 El Contrato de Contenido (schemas Tier G mínimos)

```
CASE_G: { truthModel{culpable, metodo, motivo}, clues[6-8]{fuentes≥2, gating},
              vectors{investigativo, social, violento, esotérico}, hypothesisSlots,
              expiry{dias, resultado_malo}, rewards_ref }
DILEMMA_G: { pathway, sequence, options[2-3]{tradeOffs, pesos, costes},
               sin flags visibles de alineación, antiExploit{decay, minCost, variety} }
ARTIFACT_G: { atomEffects[], presagio{pasivo, tabú, mirada}, grade, slots }
COMBATANT_G: { atomStats, statuses, opacity{oculto_hasta}, pathwayTag(convergencia) }
CONSPIRACY_G:{ trigger, temporizador, escalationPhases, playerAffordances,
               resolutionStates[2-4], systemicEffects }
NPC_WEEK_G: { schedule[7d]{mañana,tarde,noche}, memoryHooks, opinionPorIdentidad }
```

### 4.4 Las tres trampas de la biblioteca (reglas duras)

1. **Biblioteca ≠ alcance.** Tener quests de S0 y sefirot no autoriza a construir S0. El scope lo define §3 y solo lo cambia el humano.
2. **Prosa → átomos se traiciona en silencio.** La compilación de `activePowers` a efectos mecánicos no debe inventar números "canónicos". Todo artefacto compilado pasa muestreo humano (G6).
3. **Números inline = balance roto.** Los números se extraen a **tablas de balance globales** con curvas; el JSON solo referencia. Prohibido editar balance dentro del contenido.

---

## 5. ESTADO DE LOS SISTEMAS Y TRABAJO REQUERIDO

| Sistema | Estado (reborn) | Consume de la biblioteca | A construir (Tier G / código) |
|---|---|---|---|
| **Acting** | Motor 40%, fallbacks prohibidos | pathway_events (6 vías), pathway ethos | Compilación a DILEMMA_G; evaluación semanal de Coherencia; inestabilidad; sin telegrafiado |
| **Investigación** | 3 casos cableados | investigations (50 esqueletos) | Grafo de pistas, vectores, hipótesis, caducidad; 10 truth models HUMANOS |
| **Combate** | 1v1 lineal en memoria | monsters (Tier G) | Rejilla 5×7, PA+espiritualidad, **Revelación** (opacidad), matriz de estados, recolecta precisa, persistencia SQLite |
| **Somatics** | ✅ 90% determinista | — | Conectar dientes: descontrol como evento, [S] opciones, cicatrices permanentes |
| **Convergencia/Mirada** | ❌ 0% (directorio vacío) | monsters pathwayTag, conspiracies | v1 completa: índice por distrito, encuentros afines, incursiones Nighthawks |
| **Telar (C5)** | ❌ | conspiracies (210) | Motor de nudos: disparo, temporizador, escalada, estados; periódico dominical como UI |
| **Artefactos/Repertorio** | ❌ | artifacts (124) | 6 slots (4 vía + 2 artefacto), Presagio, compilación prosa→átomos |
| **Conocimiento (C1)** | ❌ | books, honorifics, pathways | Lecturas con riesgo, derivación de fórmulas, epítetos rituales |
| **Economía** | £ sin sinks | rewards de casos | Alquiler, mercado de ingredientes (ligado a fórmulas canónicas), rituales, curas |
| **Cinco Puertas** | Ascenso automático | pathways (fórmulas/ingredientes) | 5 gates reales + **la escena del Trago** con tirada de corrupción y telemetría de hesitación |
| **Doble vida** | Parcial (UI) | identity_events (108) | Profesión: salario, coartada, anclas; presión policial semanal |
| **Compendio** | Loader 95% | pathways, world, books | UI física en el Desván; persistencia meta (NG+) |
| **UI** | Dashboard 4 cuadrantes | — | Refactor diegético por features; paleta sobrevive; quitar badges de paridad |

---

## 6. ARQUITECTURA TÉCNICA Y PIPELINE DE CONTENIDO

- **Stack:** Node 22 + Fastify + `node:sqlite` (pin de versión, WAL, aislado tras `DatabaseClient`) + React + Zod. Migraciones versionadas. `setErrorHandler` + DomainError. RNG con semilla por personaje. Combate/casos/día persistidos.
- **Pipeline de contenido:**
```
Tier L (congelada, hashes) ──► COMPILADOR + LINT Tier G ──► reborn/data/gameplay/ ──► spot-check canónico (G6)
     manifest v1               (fail-loud)                     coverage manifest v2      aprobación de Mayores
```

---

## 7. DIVISIÓN DE TRABAJO (LA CONSTITUCIÓN DEL DÚO)

| Humano (15–20% autoral, intocable) | Agentes (80%, con gates) |
|---|---|
| Los 10 truth models de Casos Mayores | Compilación Tier L→Tier G masiva |
| Ethos de las 6 vías (curados línea a línea) | Dilemas, encargos, NPCs secundarios (borradores) |
| La escena del Trago + 5 finales | Código de sistemas, tests, migraciones, refactor |
| Muestreo canónico (G6) y balance final | Bots estocásticos, lint, reportes de cobertura |
| Decisión de hitos y de la pista de presentación | UI técnica y refactor por features |

---

## 8. GATES DE VERDAD (G1 A G7)

| Gate | Qué exige |
|---|---|
| **G1** | 200 partidas de bots estocásticos (ε-greedy real): éxito 40–80%, con muertes, descontroles y casos fallidos > 0 |
| **G2** | Cobertura Tier G computada desde el manifest (dilemas/vía×secuencia, vectores/caso, átomos parseados). Un 100% hardcodeado = alarma |
| **G3** | `kill -9` en mitad de combate/caso/día → restauración sin corrupción (test automatizado) |
| **G4** | 3 testers ciegos × 90 min: llegan a S8 sin guía; hesitación medida en la pantalla del Trago |
| **G5** | Dos vías distintas consumen >60% de contenido distinto en el mismo Caso Mayor |
| **G6** | Muestreo canónico humano: 20 ítems aleatorios del Tier G compilado por hito |
| **G7** | Velocidad de compilación: tasa semanal biblioteca→Tier G medida y en tendencia al alza |

---

## 9. FUERA DE ALCANCE 1.0

S2/S1/S0 jugables · 16 vías jugables · el mar y la guerra · Círculo del jugador (1.1) · máscara 3ª universal (solo FOOL) · pista de presentación B/C (sprites/canvas).

---

## 10. REGLA DE ORO

> **La biblioteca es lore (Tier L, congelada); el juego es contrato (Tier G, validada por lint, fail-loud). Nada entra a gameplay sin pasar el Contrato de Contenido. Nada está hecho porque un agente lo diga: solo los gates G1–G7.**
> **LOS DOCUMENTOS SON GUÍAS Y REFERENCIAS EVOLUTIVAS, NO DOGMAS INTOCABLES. LOS PROMPTS DEL USUARIO DEFINEN LA ÚLTIMA PALABRA.**

---

## 11. LAS FASES DE DESARROLLO

### FASE 0 — PURGA Y CIMIENTO (M0–M1) 
**Objetivo:** matar la dicotomía `/src` vs `/reborn` y las mentiras métricas, y dejar la infraestructura honesta.

- Purge total (sin leer lo borrado): monolito `/src`, GameplayValidationGate, PathwayParityAuditor, tests tautológicos, fallbacks de dilemas, selector `(día-1)%3`.
- Infra: tabla `schema_migrations` + migraciones versionadas · WAL + `DatabaseClient` · `setErrorHandler` + DomainError · persistencia de combates · resolución de rutas por raíz de paquete · RNG con semilla · CI con lint de contenido esqueleto.
- `manifest.json` v2: declara **tier, sistema consumidor y estado de validación** por archivo. La biblioteca queda congelada (Tier L, hashes intactos).
- AGENTS.md reescrito post-purga (el mapa nuevo del repo).

**Puerta F0:** build verde 20 noches seguidas · test `kill -9` en mitad de combate pasa · lint Tier G valida (aunque el set esté vacío) · reporte de "100% PASS" eliminado del repo.

---

### FASE 1 — COMPILADOR + SLICE HONESTO (M1–M5) 
**Objetivo:** el Vertical Slice Honesto de v3.5, ahora alimentado por la biblioteca. Dos tracks paralelos:

**Track A (agentes): el Compilador de Contenido** — la primera gran tarea del proyecto:
- Schemas del Contrato (DILEMMA_G, COMBATANT_G, ARTIFACT_G, CONSPIRACY_G, NPC_WEEK_G, CASE_G) + lint + cobertura al manifest.
- Compilar FOOL + ERROR: ~60 dilemas (4+ por banda S9/S8), ~25 combatientes con opacidad, ~15 artefactos (prosa→átomos), 10 conspiraciones activas, 30 rutinas semanales de NPC.

**Track B (agentes + humano): los sistemas del slice:**
- Combate: rejilla 5×7, PA+espiritualidad, **Revelación**, matriz de estados, recolecta precisa.
- Investigación: grafo de pistas, 4 vectores, hipótesis, **caducidad fail-forward**.
- Acting: evaluación semanal de Coherencia, decaimiento, inestabilidad, sin telegrafiar.
- Convergencia v1: índice por distrito, encuentros de vías afines, incursión de Nighthawks.
- Economía: alquiler, mercado de ingredientes ligado a fórmulas canónicas.
- Cinco Puertas + **la escena del Trago** con telemetría de hesitación.

**Contenido jugable:** 1 distrito triple (Cherwood: Calle/Velo/Bajos) · 2 vías · S9→S8 · 1 Caso Mayor (**truth model #1: humano**) + 3 menores plantillados.

**Trabajo autoral humano (~70 h):** truth model #1 · ethos FOOL/DEMONESS curados línea a línea · la escena del Trago.

**Puerta F1 (= G1–G5):** bots estocásticos 40–80% con pérdidas reales · cobertura computada · kill-9 · 3 ciegos dudan en el Trago · dos vías >60% de contenido distinto.
**Descope si rojo ×2:** menores 3→1 · tabla de convergencia reducida a 3 afinidades (el sistema se queda, la variedad se recorta).

---

### FASE 2 — DEMO PÚBLICA (M5–M7)
**Objetivo:** la demo gratuita como primera validación externa y máquina de wishlists.

- Demo = prólogo + Caso Mayor #1, alojada en VPS público (web, sin instalación).
- Página de Steam + tráiler corto (gameplay real + paleta; música CC de arranque).
- Compra de arte mínima: 4–6 retratos clave (compañero, antagonista, 2 NPCs) ~1–2 k€.
- Dashboard de telemetría en vivo: embudo del caso, abandono, tiempo en el Trago.

**Puerta F2:** completación del caso ≥70% en usuarios nuevos · wishlists ≥500 (aspiracional; <300 = no bloquea, pero dispara 4 semanas de onboarding antes de F3) · segundo ritual de ciegos con la propia demo.
**Regla anti-spoiler:** la demo usa solo contenido sistémico; los Mayores quedan gated por versión a partir de aquí.

---

### FASE 3 — SEIS VÍAS Y LA CIUDAD VIVA (M7–M13) 
**Objetivo:** el salto de "prototipo profundo" a "juego con mundo".

- Compilación de CHAINED, JUSTICIAR, MOON, SPECTATOR (dilemas, combatientes, artefactos) + curaduría de cada ethos.
- Distritos 2 y 3 (East Borough, Puente de Backlund) con sus tres capas.
- **Telar v1:** 20 conspiraciones activas (trigger, temporizador, escalada, affordances) + periódico dominical como interfaz del mundo.
- `identity_events` cableados: profesión, salario, coartada, sospecha policial semanal.
- Organizaciones: Nighthawks, Sol, Gremio de Boticarios, Orden Aurora (antagonista) + 2 de la biblioteca.
- **Compra de arte principal (8–15 k€):** 15–25 retratos, pack de iconos, 3–4 fondos de distrito.
- **Empaquetado Steam:** Tauri + sidecar Fastify + Steamworks (logros) + pipeline de builds.

**Trabajo autoral humano (~80 h):** truth models #2–#5 · curaduría de los 4 ethos nuevos.
**Puerta F3 (= G1–G7 a escala):** bots con 6 vías · cobertura Tier G de las 6 · muestreo canónico de 20 ítems · velocidad de compilación en tendencia al alza · ciegos juegan el 2º distrito.
**Descope ×2:** 6→4 vías (difiere JUSTICIAR/CHAINED a F4) · 3→2 distritos · Telar 20→12 conspiraciones.

---

### FASE 4 — EARLY ACCESS (M13–M16)
**Objetivo:** el modelo CrossCode: financiar y recibir feedback a escala.

- Contenido EA: 4–5 distritos · S9→S7 (**el Aval** como aviso mecánico y narrativo del Precio) · 6 Casos Mayores · ~20 menores · estaciones v1 (los 4 filtros de eventos/mercado).
- **Compra de música (5–15 k€):** 10–14 pistas por capas (mortal/Velo/susurro), implementación adaptativa en Web Audio.
- Lanzamiento EA en Steam (15–19 €) con **roadmap público** y cadencia de updates cada 6–8 semanas. Discord + canal de feedback estructurado.

**Trabajo autoral humano (~15 h):** la narrativa del Aval (el ritual que te muestra lo que algún día cobrará).
**Puerta F4:** completación del Acto I ≥50% en jugadores reales · reseñas ≥70% positivas · crash-free 99%.
**Si falla:** 8 semanas de congelación de contenido y solo fixes. El EA no se amplía con contenido mientras esté en rojo.

---

### FASE 5 — MIDGAME: EL PRECIO MENOR (M16–M22)
**Objetivo:** S6→S5 — el juego empieza a cobrar.

- Ciudad-escalera: capas **Sociedad** (trastiendas, ceremonias, mercado negro profundo).
- Máscaras: 2 universales + 3ª como especialidad de FOOL.
- **Repertorio completo:** ~50 artefactos sellados activos con Presagio (compilados de la biblioteca, muestreo G6 incluido).
- Conocimiento pleno: ~40 libros activos, derivación de fórmulas, epítetos rituales.
- **Precio Menor (S5):** menú generado desde el historial del jugador.
- 3 updates de EA con contenido estacional (conspiraciones rotativas — anti-spoiler).

**Trabajo autoral humano (~50 h):** truth models #6–#8 · textos del Precio Menor.
**Puerta F5:** bots cruzan S9→S5 sin soft-locks (200 runs) · ciegos alcanzan S5 · economía cerrada (inflación <10% en bots) · G6 canónico.
**Descope ×2:** estaciones 4→2 · artefactos 50→35 · libros 40→25.

---

### FASE 6 — LATE GAME: UMBRAL Y FINALES (M22–M28)
**Objetivo:** S4→S3 y el cierre del arco.

- **La Época (S4):** el periódico nombra tu leyenda; las organizaciones negocian contigo como poder.
- **El Umbral (S3):** el mundo bajo Backlund · clímax de la convergencia · **Precio Mayor** (el menú que duele) · Abismo Personal · 5 finales · NG+ con Ecos.
- Truth models #9–#10 (el caso serial final y el del Umbral).

**Trabajo autoral humano (~70 h):** los dos truth models finales · **los 5 finales escritos por ti** · la variante final del Trago.
**Puerta F6:** campaña completa 30–40 h en bots · 3 ciegos completan el contenido 1.0 · los 5 finales son alcanzables por bots con políticas distintas · G5 de diversidad a escala total.
**Descope ×2:** casos menores 25→15 · distrito 5→4. **Nunca se descuenta:** el Precio Mayor, el Umbral, 2 finales como mínimo (Dios Nuevo + el que Devolvió la Llave).

---

### FASE 7 — BETA Y CONTENT LOCK (M28–M31)
- Loc EN contratada (ES nativo tuyo) · performance · cert del wrapper · beta cerrada 1.500–2.000 jugadores · partner de QA externo para regresión.
**Puerta F7:** crash-free 99,5% · 0 bloqueantes · beta embudo del Trago confirmado en jugadores fríos.

---

### FASE 8 — 1.0 (M31–M34)
- Gold · day-one · 25–30 € · cadencia quincenal de fixes durante 90 días. *Misión cumplida del blueprint v4.0.*

---

### FASE 9 — 1.1 CONSPIRACIONES (M34+)
- El modo generativo con las **190 conspiraciones restantes de la biblioteca** + el Círculo del jugador + NG+ profundizado. El contenido sistémico post-1.0 más barato del plan: ya está en JSON esperando su contrato.

---

## 12. GANTT DE UN VISTAZO

| Mes | 1 | 5 | 7 | 13 | 16 | 22 | 28 | 31 | 34 |
|---|---|---|---|---|---|---|---|---|---|
| **Hitos** | Purga+cimiento | Slice honesto (G1–G5) | Demo pública | 6 vías + Telar + Steam build | **EA** | S5 + Precio Menor | S3 + Umbral + finales | Beta | **1.0** |
| **Vías** | — | 2 | 6 | 6 | 6 | 6 | 6 | 6 | 6 |
| **Secuencia** | — | S8 | S8 | S7 | S7 | S5 | S3 | S3 | S3 |
| **Casos Mayores** | — | 1 | 5 | 6 | 6 | 8 | 10 | 10 | 10 |
| **Artefactos** | — | 15 | 30 | 35 | 40 | 50 | 50 | 50 | 50 |
| **Externos** | — | 1–2 k€ | 8–15 k€ | música 5–15 k€ | — | — | QA/loc | QA/loc | — |


