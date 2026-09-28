# BASELINE Y ESTADO DE PARTIDA · UPGRADE PHASER
**Path to Godhood (LOTM_ENGINE_REBORN)**
**Baseline Inspected:** `1eb779faca93939fd4bdd14f1501c7351544c2b8`
**Fecha de Inspección:** 28 de septiembre de 2026

---

## 1. ESTADO DE GIT Y REPRODUCIBILIDAD

- **Commit HEAD:** `1eb779faca93939fd4bdd14f1501c7351544c2b8` (origin/main).
- **Árbol de Trabajo:** Limpio (sin archivos modificados previo a P00).
- **Entorno de Ejecución:**
  - **Node.js:** `v24.20.0` (cumple el requerimiento de Node >= 22 para `node:sqlite` DatabaseSync nativo).
  - **npm:** `11.19.0` (ejecutado vía `npm.cmd` en Windows para evitar restricciones de política de ejecución de scripts en PowerShell).
  - **Lockfile del Workspace:** `package-lock.json` en la raíz está íntegro y sincronizado con los subpaquetes `reborn` y `ui`. Se respetan los lockfiles existentes.

---

## 2. MAPA DE SCRIPTS Y VERIFICACIONES DE CI

| Comando | Ejecución Real | Clasificación / Resultado |
| :--- | :--- | :--- |
| `npm run dev:server` | `npm --prefix reborn run dev` | Servidor de desarrollo Fastify (`tsx watch src/server/server.ts`) |
| `npm run dev:ui` | `npm --prefix ui run dev` | Servidor de desarrollo Vite React (`vite` en puerto 5173) |
| `npm run build:server` | `npm --prefix reborn run build` | Compilación TypeScript + copia de migraciones SQL |
| `npm run build:ui` | `npm --prefix ui run build` | Compilación TypeScript + bundle Vite producción |
| `npm run build` | `npm run build:server && npm run build:ui` | Build unificado del monorepo (PASS comprobado) |
| `npm run test:server` | `npm --prefix reborn run test` | Test runner de dominio Reborn: **175 tests / 36 suites / 0 fallos** |
| `npm run test:ui` | `npm --prefix ui run build` | **ALERTA:** Es un alias de compilación (`vite build`), **NO una suite de tests de navegador**. |
| `npm run verify:tier-l` | `node scripts/verify_tier_l.cjs` | Verificación criptográfica Tier L: **67/67 archivos íntegros (SHA-256 exacto)** |
| `npm run lint:determinism` | `tsx scripts/check_anti_math_random.ts` | Auditoría de determinismo: **0 violaciones en 57 archivos de reborn/src** |
| `npm run audit:diegetic` | `tsx scripts/check_diegetic_ui.ts` | Auditoría de prosa diegética: **0 violaciones en 27 archivos analizados** |

---

## 3. CONFIGURACIÓN Y AISLAMIENTO DE BASE DE DATOS

- **Base Principal de Guardado:** `saves/lotm_reborn.db` (en modo WAL: `.db`, `.db-wal`, `.db-shm`).
- **Soporte de Base de Desarrollo Aislada:** Modificado `reborn/src/server/server.ts` para respetar la variable de entorno `DB_PATH`:
  ```typescript
  const dbFilePath = process.env.DB_PATH ? path.resolve(process.env.DB_PATH) : path.resolve('saves/lotm_reborn.db');
  ```
- **Procedimiento de Backup Consistente:** 
  - Se ejecutó un checkpoint limpio del WAL (`PRAGMA wal_checkpoint(TRUNCATE);`) previo a la copia.
  - Copia de seguridad guardada en: `saves/backups/baseline_1eb779f_lotm_reborn.db`.
  - Base de pruebas de desarrollo inicializada en: `saves/lotm_dev.db`.

---

## 4. ESTADOS CAPTURADOS EN EL EJECUTABLE EN VIVO (PLAYWRIGHT)

Se ejecutó la suite de captura sobre el build en vivo (`http://localhost:5173` y `http://localhost:3456`) generando las 14 capturas en `visual_evidence/`:
- `01_prologue_origin_selection.png`: Selección diegética de los 6 orígenes canónicos.
- `02_prologue_letter_sealed.png` & `03_prologue_letter_unfolded.png`: Carta sellada y desplegada del Benefactor.
- `04_prologue_dilemma.png`: Dilema civil inicial del zaguán.
- `05_prologue_potion_choice.png` & `06_prologue_darkening_ritual.png`: Elección de vía (Fool/Cobalto) y ritual de oscurecimiento.
- `07_desvan_hub_desk_wide.png`: El Desván como refugio central (vista WIDE).
- `08_calendar_view.png`: Almanaque y franjas horarias (MAÑANA, TARDE, NOCHE, MADRUGADA).
- `09_identity_dossier_view.png`: Dossier de identidad civil, anclas y sospecha.
- `10_acting_mirror_view.png`: Diario de actuación y espejo azogado.
- `11_tactical_combat_view.png`: Combate táctico contra entidad hostil en callejón (Seeded).
- `12_corkboard_investigation_view.png`: Tablón de corcho de Cherwood con pistas e hilos (Seeded).
- `13_ascension_ceremony_view.png`: Ceremonia de las Cinco Puertas y Cáliz de Secuencia 8 (Seeded).
- `14_market_bazaar_view.png`: Catálogo del mercado clandestino del distrito (Seeded).

---

## 5. TABLA DE RUTAS Y CONTRATOS REST DEL DOMINIO

| Endpoint | Método | Entrada Principal | Salida / Efecto en SQLite | Integridad / Recibo |
| :--- | :--- | :--- | :--- | :--- |
| `/api/health` | GET | Ninguna | Status, versión, 22 vías canónicas | Consulta pura |
| `/api/character/new` | POST | `name, pathway, startingCity, background` | Crea personaje en `characters`, persona en `personas`, anclas en `anchors` | Transaccional |
| `/api/character/:id` | GET | `id` | DTO del personaje, somática, cartera, anclas | Consulta pura |
| `/api/calendar/action` | POST | `characterId, actionType, commandId?, details?` | Avanza slot, deducción de costes, eventos fechados | **Sí:** `command_receipts` vía `commandId` |
| `/api/calendar/logs/:id` | GET | `characterId, limit` | Historial de slots y acciones | Consulta pura |
| `/api/identity/roll/:id` | GET | `characterId` | Evento de identidad civil | Lectura / Generación |
| `/api/identity/resolve` | POST | `characterId, eventId, optionIndex` | Resuelve evento civil, altera sospecha | Transaccional |
| `/api/acting/dilemma/:id` | GET | `characterId` | Dilema de actuación según principios | Lectura |
| `/api/acting/resolve` | POST | `characterId, dilemmaId, choiceId` | Progreso de digestión en `characters` | Transaccional |
| `/api/city/districts` | GET | Ninguna | Lista de distritos y niveles de tensión | Consulta pura |
| `/api/city/travel` | POST | `characterId, destinationDistrictId` | Actualiza `current_location`, deduce coste | **Pendiente P02** |
| `/api/economy/market/:d` | GET | `districtId` | Catálogo de mercancías del distrito | Consulta pura |
| `/api/economy/buy` | POST | `characterId, districtId, itemCode, quality` | Deduce peniques, añade a `inventory_items` | **Pendiente P02** |
| `/api/combat/start` | POST | `characterId, enemyName?, enemyHp?` | Crea batalla en `battles` | **Pendiente P02** |
| `/api/combat/active/:id`| GET | `characterId` | Obtiene batalla `ONGOING` de `battles` | Consulta pura |
| `/api/combat/action` | POST | `characterId, actionType, skillId?, targetPosition?` | Aplica acción, persiste `state_json` | **Pendiente P02** |
| `/api/investigation/case/activate` | POST | `characterId, caseId` | Crea/recupera instancia en `investigation_case_instances` | Idempotente |
| `/api/investigation/clues/connect` | POST | `instanceId, clueA, clueB, relation` | Persiste enlace en `state_json` | **Pendiente P02** |
| `/api/investigation/hypothesis/submit` | POST | `instanceId, hypothesisId` | Evalúa y persiste hipótesis | **Pendiente P02** |
| `/api/ascension/status/:id` | GET | `characterId` | Evalúa las 5 puertas según inventario/digestión | Consulta pura |
| `/api/ascension/prepare`| POST | `characterId, checklist, markPresented` | Actualiza `ascension_states` | **Efecto lateral en mount actual** |
| `/api/ascension/drink` | POST | `characterId, confirmedAt, seed?` | Avanza secuencia a S8, consume ingredientes | **Pendiente P02** |

---

## 6. MAPA DE COMPONENTES: CONSERVAR / ADAPTAR / REEMPLAZAR

| Componente | Archivo Actual | Decisión | Justificación |
| :--- | :--- | :--- | :--- |
| `App.tsx` | `ui/src/App.tsx` | **ADAPTAR** | Mantener shell y estado unificado, añadir selector `?renderer=phaser`, corregir bug de título S8. |
| `PrologueView` | `ui/src/features/prologue/PrologueView.tsx` | **CONSERVAR / ADAPTAR** | Excelente flujo diegético tutorial; conectar con sesión limpia y evitar dobles submits. |
| `DeskView` | `ui/src/features/desk/DeskView.tsx` | **REEMPLAZAR (P03-P06)** | Migrar representación visual del refugio a Phaser (canvas 1920x1080), conservando hotspots lógicos. |
| `CombatView` | `ui/src/features/combat/CombatView.tsx` | **REEMPLAZAR (P11)** | La vista React simula victorias locales en catch y usa rejilla CSS desalineada. Migrar a escena Phaser con proyección afín 7x5. |
| `CorkboardView` | `ui/src/features/investigation/CorkboardView.tsx` | **REEMPLAZAR (P09)** | El corcho tiene pistas sembradas en código y envía hipótesis fija. Migrar tablero físico a Phaser con DTOs reales. |
| `MarketView` | `ui/src/features/market/MarketView.tsx` | **ADAPTAR / REEMPLAZAR (P10)** | Reemplazar catálogo fijo en TypeScript por catálogo authoritative de SQLite y vincular con escena Phaser ilustrada. |
| `AscensionView` | `ui/src/features/ascension/AscensionView.tsx` | **ADAPTAR (P13)** | Eliminar `prepareAscension` automático en mount; subordinar paso a fase `TRAGO` a respuesta persistida del servidor. |
| `CalendarView` | `ui/src/features/calendar/CalendarView.tsx` | **CONSERVAR / ADAPTAR** | Lectura HTML accesible, conectar estrechamente con recibos idempotentes. |
| `IdentityDossierView`| `ui/src/features/identity/IdentityDossierView.tsx`| **CONSERVAR** | Panel editorial HTML accesible que cumple los criterios del documento de dirección. |
| `ActingMirrorView` | `ui/src/features/acting/ActingMirrorView.tsx` | **CONSERVAR / ADAPTAR (P12)** | Conectar diario y reflejo con eventos reales de actuación de casos/rutina civil. |
| `InspectionLayer` | `ui/src/scene/InspectionLayer.tsx` | **ADAPTAR (P04)** | Base para la capa de overlay accesible desacoplada del canvas de Phaser. |

---

## 7. CHEQUEOS EXPLÍCITOS DE DEFECTOS HEREDADOS (FINDINGS P00)

1. **IDs de personaje fijos / de respaldo (`char_1790267861425`):**
   - Presente en: `CombatView.tsx:59`, `MarketView.tsx:83`, `CorkboardView.tsx:38`.
   - Causa: Falta de estado explícito "sin sesión activa".
   - Acción P01: Reemplazar por estado tipado de sesión sin fallback sintético.
2. **Victoria simulada en bloques `catch` de combate:**
   - Presente en: `CombatView.tsx:192-205` (victoria otorgada en catch si wounds >= 2) y `CombatView.tsx:232-234` (huida otorgada en catch).
   - Acción P01: Prohibir cualquier mutación o victoria optimista ante fallos HTTP.
3. **Pistas locales fijas e hipótesis fija `HYPOTHESIS_JULIAN`:**
   - Presente en: `CorkboardView.tsx:51-164` (8 pistas hardcodeadas) y `CorkboardView.tsx:238` (envía siempre `HYPOTHESIS_JULIAN`).
   - Acción P01/P09: Hidratar pistas reales desde el backend; separar notas libres de hipótesis contrastables.
4. **Título de secuencia desalineado en `App.tsx`:**
   - Presente en: `App.tsx:67`: `sequenceTitle: isFool ? 'Vidente (Secuencia ' + data.character.sequence + ')' : ...`.
   - Efecto observado: Un personaje de Secuencia 8 se muestra como "Vidente (Secuencia 8)" en lugar de "Payaso".
   - Acción P01: Resolver título canónico desde registro de secuencias según vía y número.
5. **Mutaciones disparadas en `mount` (Side-effects en lectura):**
   - Presente en: `AscensionView.tsx:57-66` (`prepareAscension` ejecutado en mount con todas las puertas en `true`).
   - Presente en: `CombatView.tsx:63-73` (`startCombat` ejecutado en mount si no hay combate activo).
   - Acción P01/P02: Lectura de vista debe ser pura y sin efectos secundarios.

---

## 8. RECORRIDO END-TO-END OBSERVADO Y PRIMER BLOQUEADOR REAL

- **Recorrido End-to-End Actual:**
  1. Nueva partida desde `http://localhost:5173/` con `localStorage` limpio.
  2. Selección de Origen canónico (ej. Detective Privado / Escribiente Notarial).
  3. Despliegue de la Carta del Benefactor y rotura de sello de cera.
  4. Resolución del dilema del zaguán.
  5. Elección de Vía (Frasco Cobalto - Vía del Loco).
  6. Ritual de oscurecimiento de luces (gas, quinqué, vela) y trago sostenido de la poción.
  7. Despertar como Vidente S9 e ingreso al Desván (`DESK_WIDE`).
- **Primer Bloqueador Real:**
  La ausencia de un modelo unificado de sesión pública y proyección honesta: al entrar a cualquiera de las sub-pantallas operativas (Bazar, Combate o Investigación), la UI depende de un ID de personaje hardcodeado (`char_1790267861425`), no tiene proyección compartida con React, y dispara mutaciones en `useEffect` de montaje. Esto impide montar un segundo renderizador (Phaser) sin acarrear fallos en cadena y desincronizaciones de estado.

---

## 9. LISTA DE TAREAS ACOTADA PARA P01

1. Crear un store de sesión ligero y tipado (`ui/src/session/` o similar) con estado de personaje activo, cartera, calendario y combate.
2. Eliminar completamente el fallback `char_1790267861425`; si no hay personaje activo en sesión, la UI renderiza el estado explícito correspondiente (o redirige al prólogo/onboarding).
3. Implementar registro canónico de títulos de secuencias para Fool y Visionary (Secuencia 9: Vidente / Espectador; Secuencia 8: Payaso / Telépata).
4. Purgar todos los bloques `catch` de `CombatView` que otorguen victorias o huidas simuladas; mostrar error recuperable honesto.
5. Purgar `prepareAscension` del `useEffect` de montaje en `AscensionView`; la vista debe ser de inspección pura.
6. Tipar y validar DTOs públicos que no filtren verdades ocultas del caso ni habilidades secretas del enemigo.
