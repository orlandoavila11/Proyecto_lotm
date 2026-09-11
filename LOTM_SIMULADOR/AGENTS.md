# AGENTS.md — MAPA OPERATIVO POST-PURGA (v4.0)
## Proyecto: Path to Godhood (LOTM_ENGINE_REBORN)

---

## 1. IDENTIDAD Y AUTORIDAD

- **El Producto:** *Path to Godhood* — RPG web sistémico de investigación y doble vida en el universo de *Lord of the Mysteries*.
- **La Fantasía:** "De día soy un civil con empleo y deudas en Backlund; de noche interpreto un papel sobrenatural que me está digiriendo. El conocimiento es munición y veneno. Cada secreto me hace más poderoso y más visible."
- **Autoridad Suprema:** **El Director Humano.** Sus prompts definen la última palabra. Ningún agente califica su propio trabajo ni relaja umbrales de prueba para autoconcederse aprobados.

---

## 2. TOPOLOGÍA LIMPIA DEL REPOSITORIO

```
LOTM_SIMULADOR/
├── package.json              # Workspace root unificado (reborn + ui)
├── .agentignore              # Rutas ignoradas y código muerto purgado
├── AGENTS.md                 # Este mapa operativo (orientación obligatoria)
├── reborn/                   # Backend modular y núcleo del motor de juego
│   ├── package.json          # Fastify, node:sqlite, zod, tsx
│   ├── tsconfig.json
│   ├── docs/
│   │   └── PATH_TO_GODHOOD_v4.md # Constitución de producto y fases
│   ├── src/
│   │   ├── server/           # Fastify server, app.ts, plugins de rutas REST
│   │   ├── core/             # Motores de dominio puro:
│   │   │   ├── acting/       # ActingDilemmaEngine (sin fallbacks ni opciones sintéticas)
│   │   │   ├── combat/       # TacticalCombatEngine (PA, espiritualidad, estados)
│   │   │   ├── investigation/# ProceduralInvestigationService (sin selector cíclico)
│   │   │   ├── somatics/     # SomaticsEngine (sanidad, corrupción, anclas)
│   │   │   └── types/        # Tipos canónicos del dominio
│   │   └── infra/
│   │       ├── data/         # CanonicalDataLoader (carga de compendios canónicos)
│   │       └── database/     # DatabaseClient, schema.sql (SQLite relacional estricto)
│   ├── data/
│   │   ├── content/          # TIER L: Biblioteca canónica congelada (hashes SHA-256)
│   │   │   ├── manifest.json # Índice maestro con metadata de los 67 archivos
│   │   │   ├── quests/
│   │   │   ├── events/
│   │   │   ├── investigations/
│   │   │   ├── artifacts/
│   │   │   ├── bestiary_npcs/
│   │   │   ├── world/
│   │   │   ├── lore_knowledge/
│   │   │   └── pathways/
│   │   └── gameplay/         # TIER G: Contrato jugable compilado (fail-loud por lint)
│   │       └── balance/      # TABLAS GLOBALES DE BALANCE (todos los números viven aquí)
│   ├── tests/                # Suites de prueba reales (cero tests tautológicos)
│   └── scripts/              # Herramientas de compilación, linter y migración
└── ui/                       # Frontend React (TypeScript + Vite + Lucide)
    ├── package.json
    ├── src/
    │   ├── App.tsx           # Cliente diegético (Escritorio / Velo Ocultista)
    │   └── index.css         # Paleta victoriana (ébano, oro, Cinzel)
```

---

## 3. LEYES INVIOLABLES DE OPERACIÓN

1. **Rutas Purgadas Muertas:** El directorio legado `/src` fue purgado por completo tras respaldar sus 67 JSONs en `reborn/data/content/`. Asimismo, el subdirectorio redundante `reborn/data/canonical/` fue eliminado físicamente tras comprobar paridad SHA-256 29/29 contra Tier L. Ningún agente debe buscar, recrear ni referenciar nada en `/src` ni en `reborn/data/canonical/`.
2. **Prohibición de Métricas Tautológicas:** Se eliminaron `PathwayParityAuditor`, `GameplayValidationGate` y sus reportes de "100% PASS". El avance se mide **exclusivamente por los Gates de Verdad G1 a G7**.
3. **Doctrina de Dos Capas:**
   - **Tier L (`reborn/data/content/`):** Biblioteca pasiva de lore. Se lee; jamás se edita directamente.
   - **Tier G (`reborn/data/gameplay/`):** Contrato con semántica de juego. Si una vía jugable carece de Tier G, el build falla estrepitosamente.
4. **Balance Centralizado:** Todos los costes, daños, probabilidades y multiplicadores viven en `reborn/data/gameplay/balance/`. Prohibidos números inline en código o en JSONs de contenido.
5. **Persistencia Transaccional:** El estado de juego (incluidas batallas activas y casos) debe persistir en SQLite. Prohibido estado crítico exclusivamente en `Map` o memoria volátil.
6. **Resolución de Rutas:** Prohibidas heurísticas de CWD. Las rutas de datos se resuelven desde la raíz del paquete (`import.meta`).
7. **Regla del Hueco (§3.8):** Un hueco de contenido nunca se rellena en línea por un agente. Hueco → excepción + cola HUMAN_REVIEW.
8. **Regla del Testigo (§3.9):** Ninguna operación destructiva (borrado masivo, reescritura, migración, purge) se ejecuta sin commit previo del estado actual. Orden sagrada: **COMMIT primero, TAG después, DESTRUCCIÓN al final**.
9. **Formato Obligatorio de Reporte (§12 ampliado):** Cada sesión o brief concluido debe emitir su reporte con el **campo 0 obligatorio "COMMIT: <hash>"** (acompañado de URL de CI y contador N/20). Todo reporte cita el commit que contiene su trabajo. **Reporte sin Campo 0 = INVÁLIDO**. Fin de sesión = commit + push (commit = testigo; push = notario), sin excepciones.
10. **Regla Permanente de Procedencia de Gates (§3.10 extendido):** Toda re-corrida de un gate tras cambio estructural reporta DELTA contra la corrida anterior + hipótesis causal. Todo umbral declarado en un reporte cita la orden que lo estableció — umbral sin procedencia = métrica inválida. Números sin procedencia = inválidos.

---

## 4. ADVERTENCIA DE PROCEDENCIA HISTÓRICA Y TAGS

> [!WARNING]
> **archive/pre-purga = MISNOMER HISTÓRICO (embrión 31-ago-2026).**
> El tag `archive/pre-purga` y su alias `archive/embryonic-snapshot-2026-08-31` apuntan al commit inicial `92415a2` del 31 de agosto de 2026.
> El árbol final de `/src` desarrollado localmente con 67 archivos JSON y 3.10 MB **jamás fue commiteado** y fue purgado.
> `reborn/data/content/` es la **única instancia superviviente** del estado final y la autoridad canónica de Tier L, congelada bajo `manifest.json` v1.1.
> El script `export_content_and_generate_manifest.cjs` es exclusivamente evidencia forense histórica: el manifest v1.1 es la autoridad inmutable y **no se regenera jamás**.

---

## 5. REGLAS DE ERA (POST-LOTM · PRE-COI) — BIBLIA CANÓNICA

- **Era Oficial:** **POST-LOTM · PRE-COI** (~1353 Quinta Época, ~1 año post-Guerra de los Dioses, Klein en letargo, previo a CoI 1358). Toda referencia previa a "era pre-novela / ~1339" queda OBSOLETA.
- **R1 (Historia):** Los eventos canónicos de la novela son **HISTORIA** (world-state utilizable).
- **R2 (Leyenda):** Los personajes canónicos mayores son **LEYENDA** (mythic/lore/telar_root; jamás NPCs operativos ni líderes visibles). Excepción controlada: personajes canónicos de nivel medio de `npc.json` pueden existir como NPC de fondo SOLO con nota de coherencia de era (edad/secuencia/rango) y firma del Director caso por caso (`HUMAN_REVIEW`). Textura diegética, nunca sustitutos de contenido jugable.
- **R3 (Semillas Cósmicas):** Nada de *Circle of Inevitability* (CoI) ha ocurrido: su contenido existe únicamente como semillas cósmicas latentes (precursores), no como facciones activas ni poderes jugables.
- **R4 (El Loco):** Su existencia es un misterio reciente; sus creyentes son pocos; la Iglesia del Loco es embrionaria y LORE-ONLY (rumor distante en el Continente Norte, jamás organización funcional ni NPC operativo); Klein está durmiendo. `ENTITY_LORD_OF_MYSTERIES` existe como historia oculta reciente en mythic/lore, jamás como presencia activa directa.

