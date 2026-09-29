# TYPE_SAFETY_REPORT — PATH TO GODHOOD (AUDIT FINDING F19)
**Proyecto:** *Path to Godhood* (LOTM_ENGINE_REBORN)  
**Fecha:** 24 de Septiembre, 2026  
**Auditor Responsable:** Implementation Engineer  
**Estado:** ✅ AUDITADO Y DOCUMENTADO  

---

## 1. RESUMEN CUANTITATIVO DE LA FRONTERA DE TIPOS

| Métrica | Backend (`reborn/src/`) | Frontend (`ui/src/`) | Total Proyecto | Gravedad |
| :--- | :--- | :--- | :--- | :--- |
| **Archivos TypeScript Escaneados** | 57 archivos | 69 archivos | 126 archivos | — |
| **Uso de `any` / `<any>`** | 98 ocurrencias | 88 ocurrencias | **186 ocurrencias** | ⚠️ Media |
| **Casteos Explícitos `as any`** | 29 ocurrencias | 8 ocurrencias | **37 ocurrencias** | ⚠️ Media |
| **Uso de `unknown`** | 28 ocurrencias | 10 ocurrencias | **38 ocurrencias** | ℹ️ Baja |
| **Casteos Forzados dobles (`as unknown as`)** | **21 ocurrencias** | **2 ocurrencias** | **23 ocurrencias** | 🔴 Alta |

---

## 2. ANÁLISIS DETALLADO DE PATRONES Y VULNERABILIDADES

### 2.1 Casteos Forzados Dobles (`as unknown as`)
Se identificaron 23 puntos donde el compilador de TypeScript fue silenciado forzando una doble conversión:

1. **Persistencia SQLite Nativa (`node:sqlite`):**
   - **Archivo:** `reborn/src/infra/database/DatabaseClient.ts` (17 ocurrencias).
   - **Causa Raíz:** La API `DatabaseSync` de Node 22/24 devuelve `unknown` o prototipos planos en `stmt.get(...)` y `stmt.all(...)`. Dado que `node:sqlite` carece de genéricos en tiempo de compilación (a diferencia de Knex o Kysely), el código utiliza `(row as unknown as CharacterRow)`.
   - **Riesgo:** Si una migración SQL renombra una columna, TypeScript no detectará desalineación hasta tiempo de ejecución.
2. **Schemas Zod con Arrays Constantes:**
   - **Archivos:** `dilemma.schema.ts`, `playerAbilities.schema.ts`, `pathwaysManifest.schema.ts`, `sefiraGroups.schema.ts`.
   - **Patrón:** `z.enum(CANONICAL_PATHWAYS as unknown as [string, ...string[]])`.
   - **Causa Raíz:** `CANONICAL_PATHWAYS` está tipado como `readonly string[]` (`as const`), mientras que la sobrecarga de `z.enum` exige una tupla mutable de al menos un elemento.
3. **Arnés de Pruebas Frontend:**
   - **Archivo:** `ui/src/App.tsx` (2 ocurrencias: líneas 49 y 165).
   - **Patrón:** `setCharacter(FOOL_SEER_FIXTURE as unknown as CharacterDiegetic)`.
   - **Causa Raíz:** El fixture mock omite deliberadamente ciertas funciones auxiliares de la interfaz diegética.

### 2.2 Zonas con Acumulación de `any`
1. **Rutas Fastify:** En `combatRoutes.ts` e `investigationRoutes.ts`, el parseo de `state_json` a menudo se almacena como `any` temporalmente antes de extraer actores y bandos.
2. **Mapeadores Somáticos:** En `apiClient.ts` y `App.tsx`, las respuestas del servidor para anclas e items se recorren con `(a: any) => ...` debido a diferencias sutiles entre snake_case de SQLite y camelCase de React.

---

## 3. AUDITORÍA DE TIPOS DUPLICADOS Y DIVERGENCIA DE CONTRATOS

### 3.1 Tipos Duplicados en Repositorio
Existe duplicación manual de tipos somáticos entre el backend y el frontend en lugar de un paquete compartido de tipos canónicos:

| Tipo Duplicado | Ubicación Backend | Ubicación Frontend | Estado de Sincronización |
| :--- | :--- | :--- | :--- |
| **`SanityTier`** | `reborn/src/core/types/somatics.ts` | `ui/src/features/types.ts` | Idénticos (`LUCID`, `UNSETTLED`, `FRACTURED`, `DERANGED`) |
| **`CorruptionTier`** | `reborn/src/core/types/somatics.ts` | `ui/src/features/types.ts` | Idénticos (`PRISTINE`, `WHISPERS`, `MUTATION`, `ABOMINATION`) |
| **`RuinaTier`** | `reborn/src/core/types/somatics.ts` | `ui/src/features/types.ts` | Idénticos (`0` a `4`) |
| **`TimeSlot`** | `reborn/src/core/types/calendar.ts` | `ui/src/features/types.ts` | Parcial (Backend usa índices 0-3; Frontend usa nombres `'MAÑANA' \| 'TARDE' \| 'NOCHE' \| 'MADRUGADA'`) |

### 3.2 Divergencia Crítica de Contratos (Backend vs Frontend)

1. **Identificadores de Vía (Pathway IDs):**
   - **Backend:** `CanonicalPathwayId = 'FOOL' | 'VISIONARY' | 'DOOR' | ...` (Mayúsculas en inglés).
   - **Frontend:** `CharacterDiegetic.pathwayName = 'The Fool' | 'Visionary'` (Formato título en inglés).
   - **Impacto:** Obliga a múltiples comprobaciones `toLowerCase().includes('fool')` en lugar de comparaciones estrictas `=== 'FOOL'`.
2. **Modelo de Combate:**
   - **Backend:** `BattleActor` posee estadísticas numéricas puras (`currentHp`, `maxHp`, `ap`, `currentSpirituality`, `revealedAbilities`).
   - **Frontend:** `CombatantDiegetic` prohíbe estadísticas numéricas conforme a la Ley de Prosa Diegética, empleando en su lugar `opacityState`, `vitalityDescription` y `stanceDescription`.
   - **Solución Actual:** `apiClient.ts` y los componentes intermedios actúan como capa de sanitización y traducción diegética.

---

## 4. PLAN DE REMEDIACIÓN Y FORTALECIMIENTO DE TIPOS

1. **Creación de Paquete `@lotm/types` Compartido:**
   - Extraer todos los tipos de dominio (`CanonicalPathwayId`, `SanityTier`, `CorruptionTier`, contratos de API) a un workspace común referenciado por `reborn` y `ui`.
2. **Tipado Fuertemente Tipado para SQLite:**
   - Implementar un wrapper genérico `db.queryOne<T>(sql, params): T | null` que valide en runtime vía Zod o garantice tipos estricto sin recurrir a `as unknown as`.
3. **Conversión Estricta de Enums Zod:**
   - Utilizar `z.enum([...CANONICAL_PATHWAYS] as [string, ...string[]])` para eliminar los 4 casteos dobles en schemas.
4. **Activación Progresiva de `noImplicitAny`:**
   - Incorporar regla en `tsconfig.json` para bloquear nuevos `any` en ambos workspaces.

