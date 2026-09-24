# UI_SURFACE_INVENTORY — PATH TO GODHOOD (AUDIT FINDING F18)
**Proyecto:** *Path to Godhood* (LOTM_ENGINE_REBORN)  
**Fecha:** 24 de Septiembre, 2026  
**Auditor Responsable:** Implementation Engineer  
**Estado:** ✅ AUDITADO Y DOCUMENTADO  

---

## 1. RESUMEN EJECUTIVO DE SUPERFICIE DE UI

El frontend React (`ui/src/`) contiene actualmente **62 archivos TSX**. La auditoría de rutas y enlaces revela una bifurcación clara entre:
1. **Arquitectura Activa (BRIEF-10.VISUAL / Reborn):** Gobernada por `App.tsx` y `NavigationContext`, basada en viewport diegético 1920×1080, hotspots sobre lienzo victoriano y estados físicos somáticos.
2. **Componentes Legados (Prototipos Pre-Purga):** Localizados en `ui/src/components/`, desconectados de la máquina de estados, no alcanzables por el usuario y con lógica puramente sintética.

---

## 2. INVENTARIO COMPLETO POR CATEGORÍA

### Categoría A: KEEP (Superficie Activa, Canónica y Conectada)
*Componentes en producción, renderizados activamente y conectados al motor Reborn.*

| Componente | Ruta de Archivo | Función Diegética | Estado Backend |
| :--- | :--- | :--- | :--- |
| **`App.tsx`** | `ui/src/App.tsx` | Shell principal, orquestador de vistas y sincronización de personajes | Conectado (Fastify) |
| **`SceneViewport.tsx`** | `ui/src/scene/SceneViewport.tsx` | Contenedor 1920×1080 letterbox responsivo con Cinzel y paleta victoriana | Frontend Frame |
| **`SceneCamera.tsx`** | `ui/src/scene/SceneCamera.tsx` | Cámara cinemática y transformaciones de zoom focal | Frontend Math |
| **`NavigationContext.tsx`** | `ui/src/scene/navigation/NavigationContext.tsx` | Máquina de estados finitos de navegación (`DESK_WIDE`, `COMBAT_STAGE`, etc.) | Context API |
| **`PrologueView.tsx`** | `ui/src/features/prologue/PrologueView.tsx` | Onboarding de 6 orígenes, carta sellada, dilema del zaguán y primer trago | Conectado (Fastify) |
| **`DeskView.tsx`** | `ui/src/features/desk/DeskView.tsx` | El Desván (Hub Central) con 8 hotspots diegéticos interactivos | Conectado (Fastify) |
| **`CalendarView.tsx`** | `ui/src/features/calendar/CalendarView.tsx` | Almanaque de 4 franjas horarias y avance semanal | Conectado (SQLite) |
| **`IdentityDossierView.tsx`** | `ui/src/features/identity/IdentityDossierView.tsx` | Dossier de identidad civil, anclas de humanidad y sospechas | Conectado (SQLite) |
| **`ActingMirrorView.tsx`** | `ui/src/features/acting/ActingMirrorView.tsx` | Espejo de azogue, principios de vía y dilemas de interpretación | Conectado (SQLite) |
| **`MarketView.tsx`** | `ui/src/features/market/MarketView.tsx` | Trastienda clandestina en Cherwood / Callejón del Gato Negro | Conectado (SQLite) |
| **`CombatView.tsx`** | `ui/src/features/combat/CombatView.tsx` | Confrontación táctica en rejilla 7×5, opacidad de auras y habilidades S9 | Conectado (SQLite) |
| **`TacticalGrid.tsx`** | `ui/src/features/combat/TacticalGrid.tsx` | Renderizado de cuadrícula táctica y posiciones de combate | Subcomponente |
| **`TacticalAbilityVfx.tsx`** | `ui/src/features/combat/TacticalAbilityVfx.tsx` | Efectos visuales de habilidades (pólvora, hilos astrales, onda psíquica) | Subcomponente |
| **`TacticalResolutionOverlay.tsx`** | `ui/src/features/combat/TacticalResolutionOverlay.tsx` | Capa de resolución ceremonial de combate (Victoria, Derrota, Huida) | Subcomponente |
| **`TacticalStatusIcons.tsx`** | `ui/src/features/combat/TacticalStatusIcons.tsx` | Marcadores de estado táctico diegéticos | Subcomponente |
| **`CorkboardView.tsx`** | `ui/src/features/investigation/CorkboardView.tsx` | Tablero de corcho, 8 pistas de Cherwood, cordeles Bézier e hipótesis | Conectado (SQLite) |
| **`AscensionView.tsx`** | `ui/src/features/ascension/AscensionView.tsx` | Cinco Puertas Canónicas de ascenso S8 y Hold-to-Drink de 3s | Conectado (SQLite) |
| **`VeilOverlay.tsx`** | `ui/src/features/veil/VeilOverlay.tsx` | El Velo / Visión Espiritual transitoria sobre la escena | Subcomponente |
| **`InspectionLayer.tsx`** | `ui/src/scene/InspectionLayer.tsx` | Inspección de objetos a pantalla completa con texto refluible | Subcomponente |
| **`HotspotButton.tsx`** | `ui/src/scene/HotspotButton.tsx` | Botones accesibles de punto de interacción sobre la mesa | Subcomponente |
| **`TimeLightingLayer.tsx`** | `ui/src/scene/lighting/TimeLightingLayer.tsx` | Gradientes de iluminación por franja horaria (Mañana, Tarde, Noche) | Subcomponente |
| **`DustParticlesOverlay.tsx`** | `ui/src/scene/lighting/DustParticlesOverlay.tsx` | Partículas ambientales de polvo victoriano en suspensión | Subcomponente |
| **`Desk Objects (10)`** | `ui/src/features/desk/objects/*.tsx` | Sprites reactivos de la mesa (vela, espejo, chalice, libros, reloj, etc.) | Subcomponentes |
| **`SceneHarness.tsx`** | `ui/src/harness/SceneHarness.tsx` | Arnés de control para pruebas y depuración de estados | Herramienta Dev |

---

### Categoría B: MIGRATE (Activos Dependientes que deben trasladarse a `features/`)
*Componentes ubicados en carpetas legadas que todavía son importados por la UI activa y deben moverse a `ui/src/features/common/`.*

| Componente | Ubicación Actual | Destino Propuesto | Razón de Migración |
| :--- | :--- | :--- | :--- |
| **`LetterUnfoldModal.tsx`** | `ui/src/components/common/LetterUnfoldModal.tsx` | `ui/src/features/prologue/LetterUnfoldModal.tsx` | Usado exclusivamente en el Prólogo tutorial (Carta del Benefactor) |
| **`VictorianIcons.tsx`** | `ui/src/components/common/VictorianIcons.tsx` | `ui/src/features/common/VictorianIcons.tsx` | Iconografía diegética compartida |
| **`ConvergenceAlertBanner.tsx`** | `ui/src/components/desk/ConvergenceAlertBanner.tsx` | `ui/src/features/desk/ConvergenceAlertBanner.tsx` | Banner de alerta de convergencia en el desván |
| **`DailyObserver.tsx`** | `ui/src/components/desk/DailyObserver.tsx` | `ui/src/features/desk/DailyObserver.tsx` | Observador de cambios de jornada |
| **`SomaticMirror.tsx`** | `ui/src/components/desk/SomaticMirror.tsx` | `ui/src/features/acting/SomaticMirror.tsx` | Lógica de espejo compartida con `ActingMirrorView` |

---

### Categoría C: REFERENCE_ONLY (Conceptos de Fases Posteriores)
*Vistas prototipo desarrolladas en etapas embrionarias para sistemas de Fase 2 y Fase 3. No son alcanzables actualmente pero contienen especificaciones útiles de diseño.*

| Componente | Ubicación | Tema / Dominio | Fase Prevista |
| :--- | :--- | :--- | :--- |
| **`TarotGatheringView.tsx`** | `ui/src/components/tarot/TarotGatheringView.tsx` | Reuniones sobre la Niebla Gris (Club del Tarot) | Fase 3 (Letargo/Niebla) |
| **`ApocalypseCosmicView.tsx`** | `ui/src/components/apocalypse/ApocalypseCosmicView.tsx` | Barrera del Cosmos y Deidades Exteriores | Fase 4 (Apocalipsis) |
| **`ContinentalPoliticsView.tsx`** | `ui/src/components/politics/ContinentalPoliticsView.tsx` | Tensiones entre Loen, Feysac e Intis | Fase 2 (Guerra) |
| **`OrganizationView.tsx`** | `ui/src/components/organizations/OrganizationView.tsx` | Estructuras de facciones (Nighthawks, MI9) | Fase 2 (Sociedades Ocultas) |
| **`ApotheosisTempleView.tsx`** | `ui/src/components/apotheosis/ApotheosisTempleView.tsx` | Templos de Deidades y Apoteosis | Fase 3 (Altas Secuencias) |

---

### Categoría D: DELETE_CANDIDATE (Código Muerto / Reemplazado)
*Componentes obsoletos que fueron reemplazados por completo en BRIEF-10.VISUAL y tienen 0 referencias en todo el proyecto.*

| Componente Obsoleto | Razón de Obsolescencia | Sustituto Canónico Activo |
| :--- | :--- | :--- |
| `ui/src/components/combat/TacticalCombatTheater.tsx` | Reemplazado por motor de combate 1080p con simetría y opacidad | `ui/src/features/combat/CombatView.tsx` |
| `ui/src/components/conspiracy/DetectiveCorkboard.tsx` | Reemplazado por tablero espacial con cordeles Bézier y 8 pistas | `ui/src/features/investigation/CorkboardView.tsx` |
| `ui/src/components/market/MysticalMarketStall.tsx` | Reemplazado por trastienda clandestina con persistencia SQLite | `ui/src/features/market/MarketView.tsx` |
| `ui/src/components/desk/OccultDesk.tsx` | Reemplazado por el Desván diegético integrado | `ui/src/features/desk/DeskView.tsx` |
| `ui/src/components/desk/PersonaDossierView.tsx` | Reemplazado por el Dossier de Identidad con anclas firmadas | `ui/src/features/identity/IdentityDossierView.tsx` |
| `ui/src/components/desk/ActiveActingStage.tsx` | Reemplazado por el Espejo de Azogue | `ui/src/features/acting/ActingMirrorView.tsx` |
| `ui/src/components/city/LivingCity.tsx` | Prototipo de mapa 2D no alineado con la navegación por buhardilla | N/A (Fase 2) |
| `ui/src/components/dreamscape/DreamscapeView.tsx` | Prototipo no conectado de mundo onírico | `ui/src/features/veil/VeilOverlay.tsx` |
| `ui/src/components/grimoire/CanonicalGrimoire.tsx` | Prototipo con stats explícitas que violan la Ley de Prosa Diegética | `ui/src/scene/InspectionLayer.tsx` |
| `ui/src/components/map/InteractiveWorldMap.tsx` | Prototipo de mapa abstracto que viola la Ley del Objeto | N/A (Fase 2) |
| `ui/src/components/quests/QuestJournalView.tsx` | Prototipo analítico que viola la Ley de Prosa Diegética | `ui/src/features/calendar/CalendarView.tsx` |
| `ui/src/components/common/ArtifactInspectionModal.tsx` | Modal genérico reemplazado por la capa de inspección focal | `ui/src/scene/InspectionLayer.tsx` |
| `ui/src/components/common/NpcDossierModal.tsx` | Modal genérico no integrado | `ui/src/features/identity/IdentityDossierView.tsx` |
| `ui/src/components/common/DiegeticStateIndicators.tsx` | Indicadores redundantes reemplazados por objetos físicos de la mesa | `ui/src/features/desk/objects/*.tsx` |
| `ui/src/harness/ResolutionViewportHarness.tsx` | Herramienta de pruebas superada por `SceneHarness.tsx` | `ui/src/harness/SceneHarness.tsx` |

---

## 3. PLAN DE EJECUCIÓN POST-AUDITORÍA
1. **Migración (Inmediata):** Mover los 5 componentes útiles de `ui/src/components/` a `ui/src/features/` para consolidar el árbol.
2. **Aislamiento de Referencias:** Mover los 5 componentes de Fase 2/3 (`Tarot`, `Apocalypse`, etc.) a una carpeta `ui/src/archive_prototypes/` para que no contaminen los lints de Fase 1.
3. **Depuración de Candidatos a Eliminación:** Eliminar los 15 componentes obsoletos tras commit de testigo (Regla del Testigo §3.9).

