# PROJECT_CONTEXT_BACKEND
## Documento Maestro de Transferencia Arquitectural y Estado del Motor (v4.0)
### Proyecto: Path to Godhood (LOTM_ENGINE_REBORN)
**Autoridad:** Dirección Técnica y de Producto  
**Fecha de Emisión:** 23 de Septiembre de 2026  
**Destinatario:** Nuevos Modelos y Desarrolladores Senior de Backend  
**Estado del Repositorio:** 173/173 tests PASS · 0 violaciones de determinismo · 0 violaciones diegéticas · 22/22 contratos Tier G conformes

---

## 1. Resumen Ejecutivo

### 1.1 Qué es *Path to Godhood*
*Path to Godhood* es un RPG web sistémico de investigación, ocultismo y doble vida ambientado en el universo victoriano oscuro de *Lord of the Mysteries* (novela web de Cuttlefish That Loves Diving). El jugador asume el papel de un Beyonder civil recién iniciado en Backlund durante la Quinta Época: de día mantiene un empleo formal, cubre gastos de alquiler, evade sospechas de la policía e inspectores eclesiásticos y preserva sus anclas de humanidad; de noche investiga sucesos paranormales, combate aberraciones en callejones cubiertos por la niebla de carbón e interpreta el papel sobrenatural de su secuencia (el *Método de Actuación* o *Acting Method*) para digerir la poción antes de que la locura lo consuma.

### 1.2 Inspiración LOTM y Atmósfera
El juego traslada con rigor canónico las leyes fundamentales del cosmos de LOTM:
1. **El Conocimiento es Munición y Veneno:** Aprender sobre entidades cósmicas, dioses antiguos o rituales prohibidos otorga capacidades místicas, pero corrompe la mente de forma irreversible si la secuencia del personaje no está preparada.
2. **Las Pociones y la Digestión:** El poder no se obtiene acumulando puntos de experiencia (XP). Se obtiene ingiriendo pociones alquímicas extraordinarias y asimilando sus principios psicológicos y sociales en el mundo tangible.
3. **Ley de Convergencia de Características Beyonder:** Las características del mismo grupo séfira o vías afines se atraen mutuamente de forma inevitable, atrayendo monstruos, eventos catastróficos y rivales hacia el protagonista.
4. **La Doble Vida Victoriana:** La ambientación se centra en Backlund (~1353 de la Quinta Época), una metrópolis industrial marcada por chimeneas humeantes, niebla ácida, desigualdad de clases, instituciones puritanas (Scotland Yard, las Tres Iglesias Ortodoxas) y sociedades secretas.

### 1.3 Estado Actual del Proyecto
El proyecto superó una purga arquitectural exhaustiva (Fase 0), eliminando código legado monolítico, métricas de prueba tautológicas y dependencias volátiles. 
- **BRIEF-08** cerró formalmente la fase de **SISTEMAS**, dotando al backend de motores de dominio puros, deterministas y desacoplados de I/O.
- La **Fase 1 continúa ABIERTA** bajo orden explícita del Director y comprende:
  - **BRIEF-09:** Sistema de Orígenes Canónicos (6 orígenes formalizados), Prólogo Universal interactivo, Calendario en 4 slots y Gestión de Identidad Civil.
  - **BRIEF-10:** El Desván como Lugar / Dossier UI y cliente React diegético.
  - **BRIEF-10.VISUAL (R1 a R4):** Armonización espacial, navegación por grafo, letterbox 1920x1080 e integración de activos GFX.
  - **Validación de Gates G1 a G5** (G1 Simulación Estocástica, G2 Cobertura Tier G, G3 Batería Kill -9, G4 Pruebas Ciegas de Hesitación en el Trago, G5 Diversidad Estructural inter-vía).

---

## 2. Filosofía del Producto

El diseño de *Path to Godhood* rechaza frontalmente las convenciones habituales de los RPGs numéricos (barras de vida rojas, maná azul, árboles de talentos y dashboards analíticos). Cada sistema se rige por principios diegéticos inviolables:

### 2.1 ESTADO = OBJETO
El estado del personaje nunca se expone como una estadística matemática o etiqueta de texto plano en reposo. **El estado ES un objeto físico tangible** en la escena del Desván:
- **La Vela de Sebo:** Representa la Sanidad y la Estabilidad del espíritu. Su llama, crepitar y longitud comunican si la mente está en calma, agitada o al borde del colapso.
- **El Espejo de Azogue:** Representa la Corrupción y la deformación del rostro espiritual. Las grietas en el marco y las manchas en el vidrio revelan la proximidad del descontrol.
- **El Libro Mayor / Monedero de Cuero:** Representa la solvencia económica, las deudas y el salario civil.
- **El Dossier de Investigación / Pluma y Tintero:** Contiene las notas manuscritas, recortes de prensa y pistas de los casos activos.
- **El Reloj de Bolsillo:** Marca la progresión de los 4 momentos del día y el avance del calendario semanal.

Nadie lee cuánta cordura le queda; el jugador *mira la llama viva* o *el reflejo distorsionado en el azogue*.

### 2.2 MOMENTO = PROSA
El texto descriptivo profundo y la prosa victoriana rica no saturan la interfaz en reposo. Las etiquetas ambientales de los objetos en la mesa no superan las **7 palabras**. La prosa vive exclusivamente en los **momentos de interacción directa**:
- Al examinar detalladamente una pista o documento.
- Al tomar una decisión moral en un dilema de Acting.
- Al ejecutar una deducción formal frente al dossier.
- Al enfrentar la escena ceremonial del Trago de la poción.

### 2.3 Opacidad Controlada
El misterio es mecánico. En combate, los enemigos, sus afinidades de vía y sus secuencias son opacos hasta que el jugador gasta recursos en *Escudriñar* o deducir sus patrones. En los dilemas de actuación, **jamás se telegrafía** qué opción otorga más digestión o qué alineación persigue: el jugador debe deducir el papel a partir del ethos canónico de su vía.

### 2.4 Ausencia de HUD Mecánico
Prohibición absoluta en toda la interfaz de usuario de términos como `"HP: 100"`, `"Sanidad: 85%"`, `"Ruina: 5"`, `"Mana: 50/50"` o modificadores aritméticos como `"+15 Fuerza"`. Todo se expresa a través de metáforas orgánicas victorianas y sensaciones somáticas.

### 2.5 Persistencia y Consecuencias
Ninguna acción es revocable. No existe el guardado rápido para deshacer errores. Si un caso de investigación caduca por negligencia, el culpable escapa, la tensión del distrito escala y las consecuencias persisten en la base de datos SQLite. Los deslices sobrenaturales atraen la atención de Scotland Yard o los Nighthawks; las anclas rotas dejan cicatrices permanentes indelebles.

---

## 3. Arquitectura del Sistema

El proyecto está diseñado bajo una arquitectura limpia y desacoplada, separando radicalmente el transporte, el dominio puro y la persistencia transaccional:

```
LOTM_SIMULADOR/
├── package.json                 # Workspace root unificado
├── AGENTS.md                    # Constitución y leyes operativas inviolables
├── reborn/                      # Backend modular (Fastify + SQLite + Core TS)
│   ├── src/
│   │   ├── server/              # Capa de Transporte (Fastify 5, plugins, rutas)
│   │   ├── core/                # Dominio Puro (Motores deterministas, cero I/O)
│   │   └── infra/               # Infraestructura (DatabaseClient, migraciones, loader)
│   ├── data/
│   │   ├── content/             # TIER L: Biblioteca canónica congelada (SHA-256)
│   │   └── gameplay/            # TIER G: Contratos jugables compilados (Zod)
│   │       └── balance/         # Tablas globales de balance (cero números inline)
│   ├── tests/                   # 173 tests reales (cero pruebas tautológicas)
│   └── scripts/                 # Herramientas de CI, linters y validadores
└── ui/                          # Frontend diegético (React 19 + Vite + Tailwind)
    └── src/                     # Componentes del Desván, navegación espacial y audio
```

### 3.1 Frontend (`ui/`)
- Desarrollado en React 19 con TypeScript, Vite y Tailwind CSS.
- **Cliente Diegético:** Estructurado alrededor del Desván del personaje en Backlund. Renderizado sobre un lienzo maestro en resolución lógica 1920x1080 con carta de navegación espacial (cámara WIDE general y presets de inspección focal para cada objeto).
- Consume exclusivamente los endpoints REST del backend mediante clientes tipados. Cero lógica de negocio o simulación de combate en frontend.

### 3.2 Backend (`reborn/src/server/`)
- Basado en Fastify v5 en modo ESM nativo.
- Rutas desacopladas por bounded contexts:
  - `characterRoutes.ts`: Creación, estado somático, anclas y cicatrices.
  - `actingRoutes.ts`: Presentación de dilemas, resolución de opciones, balance semanal.
  - `combatRoutes.ts`: Inicialización de encuentros, turnos, resolución de acciones atómicas.
  - `investigationRoutes.ts`: Generación de casos, examen de pistas, formulación de deducciones.
  - `calendarRoutes.ts`: Avance de momentos del día (4 slots) y ticks semanales.
  - `economyRoutes.ts`: Transacciones, pago de alquiler, mercado de ingredientes y curas.
  - `ascensionRoutes.ts`: Verificación de requisitos, escena del Trago, telemetría de hesitación.
  - `identityRoutes.ts`: Gestión de sospecha policial/eclesiástica y eventos de profesión.
  - `prologueRoutes.ts`: Flujo guiado del prólogo universal y despertar en Secuencia 9.
  - `cityRoutes.ts`: Estado de distritos, tensión urbana e índice de convergencia.
- **Manejo de Errores Unificado:** `fastify.setErrorHandler` captura `DomainError` tipados (`INSUFFICIENT_SPIRITUALITY`, `INVALID_ACTION_POINTS`, `ANCHOR_DESTROYED`, `POTION_NOT_READY`), devolviendo códigos HTTP semánticos y detalles JSON estructurados sin exponer trazas internas de la base de datos.

### 3.3 Persistencia (`reborn/src/infra/database/`)
- Motor: `node:sqlite` sincrónico (`DatabaseSync`), integrado de forma nativa en Node.js 22+.
- **Modo WAL (Write-Ahead Logging)** activado para lecturas y escrituras concurrentes de alta velocidad.
- Aislamiento absoluto: Ningún servicio o motor de dominio ejecuta SQL crudo. Todas las operaciones pasan a través de `DatabaseClient.ts`.
- Claves foráneas estrictas (`PRAGMA foreign_keys = ON;`) con borrado y cascada formalizados.
- **Tolerancia a Fallos Kill -9:** Las transacciones atómicas aseguran que ante una interrupción abrupta del proceso (cierre repentino o crash), el estado en disco permanezca consistente y byte-equivalente al reiniciar.

### 3.4 Dominio Puro (`reborn/src/core/`)
- Motores desacoplados de la base de datos y de la red. Reciben entidades o estados en memoria, ejecutan la lógica de negocio según las reglas de LOTM y devuelven el nuevo estado resultante o eventos de dominio.
- **Determinismo Estricto:** Toda entropía es controlada mediante semillas criptográficas reproducibles (`SeededRNG`).

### 3.5 Contratos y Validación
- Schemas Zod bidireccionales en `reborn/src/core/types/`. Todo payload JSON recibido por HTTP o leído desde disco pasa por un validador Zod estricto que falla de forma ruidosa (*fail-loud*) ante cualquier campo inesperado, tipo inválido o valor fuera de rango.

---

## 4. Stack Tecnológico

| Componente | Tecnología | Versión | Propósito / Configuración |
|---|---|---|---|
| **Runtime** | Node.js | v22.x+ | ESM nativo (`"type": "module"`), soporte de `node:sqlite`. |
| **Servidor Web** | Fastify | ^5.2.1 | API REST de baja latencia con `@fastify/cors` (^10.0.2). |
| **Base de Datos** | SQLite Nativo | `node:sqlite` | `DatabaseSync`, WAL mode, persistencia transaccional local. |
| **Tipado** | TypeScript | ^5.7.3 | Modo estricto (`strict: true`), Target ES2022, NodeNext resolution. |
| **Validación** | Zod | ^3.24.2 | Validación estructural estricta en compilación y tiempo de ejecución. |
| **Ejecución TS** | tsx | ^4.19.3 | TypeScript execute en tests unitarios y scripts de CI. |
| **Linters Propios**| Scripts TS | — | `check_anti_math_random.ts`, `check_diegetic_ui.ts`, `lint_tier_g.ts`. |

---

## 5. Motores Core (`reborn/src/core/`)

Cada subsistema de dominio resuelve un pilar fundamental del juego sin acoplamientos impuros:

### 5.1 `ActingDilemmaEngine` (`acting/ActingDilemmaEngine.ts`)
- **Propósito:** Conducir la digestión de la poción eliminando la noción tradicional de "puntos de experiencia".
- **Lógica de Coherencia Semanal:** Evalúa periódicamente las decisiones del jugador contra el *Ethos* canónico de su vía. Un Vidente que actúa con sobriedad y cautela acumula alta coherencia; un Vidente temerario o fraudulento sufre desviaciones.
- **Penalización por Variedad (`variety_penalty`):** Si el jugador salta de forma errática entre estilos de respuesta contradictorios, el motor castiga el índice de digestión.
- **Decaimiento por Repetición (`decay_applied`):** Elegir sistemáticamente la misma respuesta conservadora reduce progresivamente la ganancia de digestión a cero.
- **Inestabilidad y Pérdida del Yo (`loss_of_self_risk_flag`):** Si la coherencia cae por debajo de umbrales tolerables o la digestión se fuerza sin asimilación espiritual, se activan banderas de riesgo mental, forzando pesadillas, susurros y descontrol inminente.
- **Prohibición de Fallbacks:** Prohibidas las opciones sintéticas genéricas. Todo dilema proviene de contratos validados en Tier G.

### 5.2 `TacticalCombatEngine`, `GridCombatEngine` y `AtomRuntime` (`combat/`)
- **Escenario Táctico:** Rejilla posicional de 5×7 casillas donde combatientes aliados y hostiles maniobran por turnos.
- **Economía de Acción:** Cada turno otorga Puntos de Acción (PA) y consume Espiritualidad según las habilidades ejecutadas.
- **Sistema de Átomos (`AtomRuntime.ts`):** Las habilidades de Beyonder no son funciones hardcodeadas con números mágicos; se descomponen en un vocabulario atómico estandarizado:
  - Efectos: `DAMAGE_PHYSICAL`, `DAMAGE_SPIRITUAL`, `APPLY_STATUS`, `TELEPORT`, `DIVINE_SIGHT`, `CREATE_ILLUSION`, etc.
  - Modificadores, alcances y multiplicadores definidos en `atom_vocabulary.json`.
- **Revelación y Opacidad:** Los enemigos aparecen con atributos y habilidades encubiertos bajo un velo de misterio. El jugador debe emplear acciones como *Escudriñar* (o habilidades de Vidente/Espectador) para rasgar la opacidad y revelar puntos débiles.
- **Matriz de Estados (`status_matrix.json`):** Gestiona interacciones cruzadas entre estados alterados (Quemadura, Congelación, Corrupción, Confusión, Parálisis, Sangrado).
- **Recolecta Canónica:** Al abatir a un enemigo extraordinario, el motor calcula la precipitación exacta de su Característica Beyonder según su vía y secuencia.

### 5.3 `InvestigationEngine` y `ProceduralInvestigationService` (`investigation/`)
- **Estructura de Casos:** Casos Mayores (con autoría humana profunda) y Casos Menores procedurales.
- **Modelo de Verdad (`truthModel`):** Cada caso formaliza de manera inmutable el culpable real, el método sobrenatural empleado y el motivo subyacente.
- **Grafo de Pistas:** Cada caso dispone de 6 a 8 pistas interconectadas. Es regla constitucional que cada pista clave posea **al menos dos fuentes independientes** de obtención (por ejemplo: autopsia forense y adivinación por péndulo, o interrogatorio civil y registro de escrituras).
- **4 Vectores de Indagación:**
  1. *Investigativo:* Examen minucioso de documentos, archivos y escenas del crimen.
  2. *Social:* Interrogatorios civiles, sobornos a informantes, deducción de mentiras.
  3. *Violento:* Coacción física, allanamiento de moradas, enfrentamientos callejeros.
  4. *Esotérico:* Visión espiritual, radiestesia, comunicación con espíritus, clarividencia.
- **Hipótesis y Veredicto:** El jugador arrastra pistas hacia slots de deducción. Una deducción correcta cierra el caso exitosamente; una deducción errónea condena a un inocente o permite el escape del culpable.
- **Caducidad Fail-Forward:** Los casos tienen una fecha límite estricta en el calendario. Si expiran sin resolverse, el caso concluye con consecuencias adversas (mayor tensión, conspiración consumada), pero la partida continúa sin bloqueos estériles.

### 5.4 `SomaticsEngine` (`somatics/SomaticsEngine.ts`)
- **Triángulo Somático:** Controla la interacción entre Sanidad (0–100), Corrupción (0–100) y Digestión (0.0–100.0).
- **Anclas de Humanidad (`anchors`):** El soporte mental del personaje. Se dividen en 4 tipos canónicos:
  - *Persona:* Vínculos afectivos o mentores en Backlund.
  - *Lugar:* Rincones civiles de paz y pertenencia.
  - *Rutina:* Hábitos mecánicos cotidianos (transcribir actas, encender velas a cierta hora).
  - *Convicción / Rol:* Principios éticos o profesionales inamovibles.
- **Absorción de Daño y Cicatrices Permanentes:** Cuando la cordura recibe impactos severos, las anclas absorben el daño. Si un ancla se rompe definitivamente, se registra una cicatriz permanente (`character_scars`), alterando la percepción de la realidad del personaje.
- **Opciones de Susurros [S]:** Ante situaciones críticas o corrupción elevada, el motor inyecta opciones marcadas con [S]. Otorgan una ventaja inmediata colosal a expensas de erosionar anclas o endeudar el destino.
- **Rampage (Descontrol):** El colapso mental no es una pantalla de "Game Over" binaria. Un episodio de descontrol genera un evento de salto temporal donde el Beyonder actúa enloquecido por Backlund. Al despertar, el jugador debe reconstruir lo ocurrido leyendo el informe de daños colaterales.

### 5.5 `CalendarEngine` (`calendar/CalendarEngine.ts`)
- **Día Cuatripartito:** Cada jornada se divide en 4 franjas temporales:
  1. `SLOT_MORNING` (Mañana): Trabajo civil, gestiones notariales, asistencia médica.
  2. `SLOT_AFTERNOON` (Tarde): Desplazamientos urbanos, investigación, entrevistas.
  3. `SLOT_EVENING` (Noche): Encuentros en tabernas, rituales, incursiones en el Velo.
  4. `SLOT_LATE_NIGHT` (Madrugada): Meditación, trances, lectura de libros arcanos.
- **Tick Semanal (Día 7):** Ejecución transaccional del balance: pago de salario civil, cobro de alquiler, cálculo de coherencia de acting, decaimiento de sospechas y avance de conspiraciones activas.
- **Filtro Estacional:** 4 estaciones (Primavera, Verano, Otoño, Invierno) que alteran la visibilidad de la niebla, los precios del carbón y los eventos callejeros.

### 5.6 `EconomyEngine` (`economy/EconomyEngine.ts`)
- **Moneda Canónica Victoriana:**
  - 1 Libra (£) = 20 Chelines (s) = 240 Peniques (d).
  - Todo cálculo interno se almacena en peniques brutos (`raw_pence`) para eliminar errores de redondeo de punto flotante.
- **Sinks Económicos Obligatorios:** Cobro implacable de renta semanal (amenaza directa de desalojo y asilo de deudores de Backlund), adquisición de instrumental civil, velas aromáticas, reactivos para pociones y curaciones médicas.

### 5.7 `ConvergenceEngine` (`convergence/ConvergenceEngine.ts`)
- **Atracción Extraordinaria:** Calcula el índice de convergencia de cada distrito de Backlund en base al grupo séfira del personaje y de las entidades presentes en la zona.
- **Incursiones:** Si la tensión o la convergencia superan los umbrales seguros, se disparan encuentros de vía afín o incursiones inquisitoriales de los Halcones Nocturnos (Nighthawks) o la Iglesia del Señor de las Tormentas.

### 5.8 `AscensionEngine` (`ascension/AscensionEngine.ts`)
- **Las Cinco Puertas:** Verificación rigurosa de los prerrequisitos de avance de secuencia:
  1. Digestión al 100%.
  2. Fórmula alquímica legítima.
  3. Ingredientes principales de calidad pura.
  4. Ingredientes suplementarios estabilizadores.
  5. Ritual propiciatorio ejecutado en el momento propicio.
- **La Escena del Trago:** Ceremonia mística de consumo donde se somete al personaje a una tirada estocástica contra su corrupción residual y estabilidad de anclas.
- **Telemetría de Hesitación:** Mide con precisión en milisegundos (`hesitation_ms`) el tiempo que el usuario duda con el cursor antes de confirmar el consumo de la poción.
- **Resistencia Kill -9:** La tabla `ascension_state` preserva el estado en curso del trago, impidiendo que el jugador reinicie la aplicación para esquivar una tirada desfavorable.

### 5.9 `IdentityEngine`, `OriginEngine` y `PrologueEngine`
- **Doble Vida:** Supervisión de la identidad civil legal (`personas`), profesión civil, ausencias laborales injustificadas y acumulación de sospecha policial y eclesiástica.
- **Prólogo Universal:** Flujo tutorial interactivo que guía al jugador desde el hallazgo de la carta del Benefactor hasta la elección inicial de la vía y el primer trago de Secuencia 9.

---

## 6. Tier L (Biblioteca Canónica Congelada)

Ubicada en `reborn/data/content/`, es la enciclopedia de lore pasivo del juego:

### 6.1 Volumen y Hash
- Comprende **67 archivos JSON** con un peso consolidado de **~3.10 MB**.
- Cada archivo está catalogado en `manifest.json` (v2.0) con su respectivo hash criptográfico **SHA-256**, su tier asignado (`L`) y su sistema consumidor.

### 6.2 Estructura de Directorios
- `pathways/`: Las 22 vías completas de la novela (S9 a S0), incluyendo habilidades, fórmulas y mitología.
- `lore_knowledge/`: 100 libros arcanos canónicos (`books.json`) y catálogo de nombres honoríficos (`honorific_names.json`).
- `events/`: 108 eventos de identidad civil (`identity_events.json`) y 462 eventos de vías (`pathway_events.json`).
- `investigations/`: 50 esqueletos de investigación (`investigations_data.json`) y 210 conspiraciones urbanas (`conspiracies.json`).
- `bestiary_npcs/`: 100 PNJs caracterizados (`npc.json`) y monstruos sobrenaturales.
- `artifacts/`: 124 artefactos sellados de grados 0, 1, 2 y 3.
- `world/`: Iglesias ortodoxas, organizaciones secretas, geografía de Backlund y Club del Tarot.
- `quests/`: Semillas de misiones por secuencia.

### 6.3 Regla de Inmutabilidad Sagrada
**Tier L se lee; JAMÁS se edita directamente.** Ningún agente o script puede modificar o "mejorar" archivos en `reborn/data/content/`. El lore es pasivo y sirve de compendio. Todo elemento que deba intervenir en el juego activo se extrae y compila hacia el **Tier G**.

---

## 7. Tier G (Contratos Jugables Compilados)

Ubicado en `reborn/data/gameplay/`, es la capa donde vive el juego ejecutable:

### 7.1 Filosofía de Contrato y Validación Fail-Loud
Tier G contiene únicamente estructuras de datos con semántica de juego directa y computable. Cada archivo está respaldado por un esquema Zod estricto. Si un archivo presenta una propiedad ausente, un tipo incongruente o un identificador huérfano, la suite de verificación (`npm run lint:tier-g`) **falla de forma inmediata e interrumpe el build**.

### 7.2 Principales Contratos Validados
- **`DILEMMA_G` (`dilemmas/`):** Estructura de dilemas para el Acting. Exige trade-offs significativos, costes de espiritualidad/tiempo, ausencia de flags visibles de alineación y pesos calibrados.
- **`CASE_G` (`cases/`):** Contrato de casos de investigación. Exige `truthModel`, 6-8 pistas con fuentes >= 2, 4 vectores de indagación, caducidad temporal y resoluciones múltiples.
- **`COMBATANT_G` (`combatants/`):** Combatientes para la rejilla táctica. Define estadísticas traducidas a átomos, afinidad de séfira, estados y niveles de opacidad.
- **`ARTIFACT_G` (`artifacts/`):** Artefactos sellados activos. Compila la prosa libre de Tier L en efectos de átomos, reglas de presagio, tabúes y riesgo de mirada divina.
- **`CONSPIRACY_G` (`conspiracies/`):** Conspiraciones del Telar con disparadores, temporizador de escalada, affordances del jugador y consecuencias en distritos.
- **`NPC_WEEK_G` (`npc_weeks/`):** Rutinas semanales completas de 7 días (mañana, tarde y noche) para personajes no jugadores clave.
- **`ORIGINS_G` (`origins/origins.json`):** Catálogo formal de los 6 orígenes civiles aprobados.
- **`CONVERGENCE_FORCES_G` (`convergence_forces.json`):** Matriz canónica de fuerzas de convergencia vinculada a los 9 grupos séfira de `sefira_groups.json`.

---

## 8. Vías Activas

Para la versión 1.0 del juego se contempla un abanico escalonado de 6 vías jugables (Fool, Visionary, Demoness, Moon, Chained, Justiciar). En la **Fase 1 (Vertical Slice)**, las dos vías operativas al 100% en Secuencia 9 son:

### 8.1 Vía FOOL (El Loco) — Secuencia 9: Vidente (*Seer*)
- **Ethos Canónico:** El destino es un velo que se contempla con respeto y temor reverencial; forzarlo o considerarse un dios omnisciente precipita la autodestrucción. El Vidente interpreta señales, previene desgracias ajenas y resguarda su propia cordura manteniendo la compostura ante lo incomprensible.
- **Capacidades Mecánicas:**
  - *Visión Espiritual (Spirit Vision):* Permite inspeccionar auras de NPCs para percibir emociones, salud y vestigios de espiritualidad.
  - *Adivinación (Divination):* Utilización de péndulo de radiestesia, cartas del tarot y adivinación en sueños para desbloquear pistas esotéricas en casos de investigación.
  - *Intuición de Peligro:* Habilidad pasiva que reduce la probabilidad de emboscadas hostiles y alerta sobre trampas sobrenaturales.
  - *Meditación (Cogitation):* Disciplina mental que amortigua impactos de sanidad menores durante momentos de tensión.

### 8.2 Vía VISIONARY (El Visionario) — Secuencia 9: Espectador (*Spectator*)
- **Ethos Canónico:** Quien sube al escenario se convierte en víctima del drama; el verdadero poder reside en permanecer en la penumbra del público, comprendiendo los impulsos ajenos sin involucrar los propios.
- **Capacidades Mecánicas:**
  - *Observación Penetrante (Keen Observation):* Detección automática de microexpresiones, dilataciones pupilares y tensión muscular en diálogos e interrogatorios, descubriendo mentiras y pistas sociales ocultas.
  - *Invisibilidad Psicológica:* Capacidad pasiva/activa para pasar desapercibido en entornos civiles, reduciendo el incremento de sospecha policial y eclesiástica.
  - *Aplomo Mental (Calm Mind):* Alta resiliencia contra el pánico, la sugestión y los efectos alterados de manipulación mental en combate.

---

## 9. Orígenes Canónicos

Formalizados y ratificados por la Dirección Técnica en BRIEF-09 / HUMAN_REVIEW_09:

| Origen | ID Canónico | Profesión Civil | Clase | Distrito | Saldo Inicial | Salario Semanal | Carga Inicial (Deuda / Secreto) |
|---|---|---|---|---|---|---|---|
| **Escribiente Notarial** | `ORIGIN_CLERK` | Escribiente del Registro Civil | Media | Cherwood | £3 (720d) | £1 10s (360d) | **Secreto:** Falsificación de sello oficial para librar a su hermana del asilo de deudores. (+10 sospecha policial basal). |
| **Estudiante de Medicina** | `ORIGIN_MEDICAL_STUDENT` | Ayudante de Disección | Media | Cherwood | £2 (480d) | £1 5s (300d) | **Deuda:** Pagaré de £2 (480d) por bisturíes alemanes y microscopio con un usurero del Puente. |
| **Corresponsal de Sucesos** | `ORIGIN_REPORTER` | Reportero del Daily Observer | Media | Cherwood | £2 10s (600d) | £1 12s (384d) | **Secreto:** Libreta bajo las tablas con nombres de industriales y sacerdotes implicados en reuniones ilícitas. |
| **Espiritista de Salón** | `ORIGIN_FRAUDULENT_MEDIUM` | Médium y Clarividente | Trabajadora | Puente | £1 10s (360d) | £1 4s (288d) | **Deuda:** £3 (720d) con los matones del Callejón del Hierro por operar sin permiso territorial. |
| **Estibador del Puerto** | `ORIGIN_DOCKWORKER` | Estibador de Carga y Carbón | Trabajadora | Barrio Este | £1 (240d) | £1 (240d) | **Secreto:** Baúl de contrabando con sellos de las Indias Orientales oculto bajo las vigas del muelle 4. |
| **Detective Privado** | `ORIGIN_PRIVATE_INVESTIGATOR`| Detective de Asuntos Civiles | Media | Cherwood | £2 10s (600d) | £1 10s (360d) | **Secreto:** Licencia condicional de Scotland Yard tras intervenir en un suicidio con simbología arcana. |

Cada origen dota al personaje de **3 anclas de humanidad iniciales** (una persona, un lugar y una rutina o convicción) con fuerza calibrada entre 60 y 65 puntos, garantizando la inmersión en la doble vida desde el día 1.

---

## 10. Persistencia

### 10.1 Esquema Relacional SQLite Estricto
La base de datos se administra mediante `DatabaseClient.ts` y se actualiza a través de migraciones versionadas e idempotentes (`MigrationRunner.ts`):

```sql
schema_migrations (version TEXT PRIMARY KEY, applied_at TEXT)
characters (id, name, pathway, sequence, current_health, max_health, ...)
personas (id, character_id, legal_name, profession, social_class, police_suspicion, ...)
anchors (id, character_id, title, strength, category, damage_count, is_destroyed, ...)
character_scars (id, character_id, scar_code, name, narrative, mechanics_json, ...)
somatics_whisper_purchases (id, character_id, dilemma_id, choice_id, price_paid_json, ...)
rampage_events (id, character_id, trigger_reason, start_day, hours_skipped, district_impact_json, ...)
inventory_items (id, character_id, item_code, name, category, grade, quantity, ...)
acting_records (id, character_id, pathway, sequence, dilemma_id, choice_id, digestion_gained, ...)
acting_weekly_states (character_id PRIMARY KEY, current_week, coherence, variety_penalty, ...)
investigation_cases (id, character_id, case_code, title, district, status, culprit_name, ...)
investigation_clues (id, case_id, clue_code, title, clue_type, is_discovered, ...)
districts (id, city, district_name, tension_level, inquisitorial_alert, convergence_index, ...)
market_transactions (id, character_id, type, item_code, pence_amount, day, ...)
ascension_telemetry (id, character_id, target_sequence, outcome, hesitation_ms, ...)
ascension_state (character_id PRIMARY KEY, current_step, checklist_json, formula_id, ...)
calendar_log (id, character_id, day, slot, event_type, subsystem, step_order, details_json, ...)
identity_event_history (id, character_id, event_id, event_category, chosen_option_index, ...)
battles (id, character_id, state_json, status, created_at, updated_at)
investigation_case_instances (id, character_id, state_json, status, ...)
convergence_events (id, character_id, event_type, district, ...)
pending_incursions (id, character_id, threat_level, status, ...)
```

### 10.2 Pruebas de Resistencia Kill -9
El sistema cuenta con suites de prueba automatizadas (`combat_kill9_recovery.test.ts`, `investigation_kill9_recovery.test.ts`, `gate_g3_kill9_battery.test.ts`) que verifican que ante una muerte de proceso no controlada, la restauración de estado sea 100% byte-equivalente:
1. Una batalla a mitad del turno 3 restaura exactamente los PAs, casillas y estados alterados sin perder la consistencia.
2. Un caso a mitad de recolección de pistas retoma el grafo exacto de deducción.
3. Una escena del Trago interrumpe el intento de salvar al personaje de una tirada de corrupción forzando la reanudación del mismo trago.

---

## 11. Gates de Verdad (G1 a G7)

Frente a las métricas tautológicas descartadas en la Fase 0, la calidad del motor se rige exclusivamente por los Gates de Verdad de la Constitución v4.0:

| Gate | Nombre | Criterio de Aceptación Constitucional | Estado en el Repositorio |
|---|---|---|---|
| **G1** | Simulación Estocástica | 200 partidas simuladas con bots ε-greedy. Éxito global calibrado entre 40% y 80%, con muertes, descontroles y casos fallidos > 0. | ✅ **PASS** (`gate_g1_player_simulator.test.ts`) |
| **G2** | Cobertura Computada Tier G | Cobertura computada dinámicamente desde el `manifest.json`. Un 100% hardcodeado genera fallo inmediato. | ✅ **PASS** (`manifest_v2.test.ts`) |
| **G3** | Batería Kill -9 | Tolerancia a interrupciones abruptas de proceso en mitad de combate, caso de investigación o avance de día. | ✅ **PASS** (`gate_g3_kill9_battery.test.ts`) |
| **G4** | Pruebas Ciegas de Hesitación | 3 evaluadores humanos externos alcanzan S8 sin tutoriales; telemetría de hesitación registrada en la escena del Trago. | ⏳ **Protocolo formalizado**, ejecución programada al completar integración visual. |
| **G5** | Diversidad Inter-Vía | Dos vías distintas (Fool vs Visionary) consumen > 60% de contenido y pistas diferentes en el mismo Caso Mayor. | ✅ **PASS** (Divergencia media medida: **81.65%**, `gate_g5_pathway_diversity.test.ts`) |
| **G6** | Muestreo Canónico Humano | Muestreo ciego de 20 ítems aleatorios de Tier G por hito revisados por el Director. | ✅ **Firmado** en BRIEF-09 / HUMAN_REVIEW_09 |
| **G7** | Velocidad de Compilación | Tasa semanal de compilación Tier L → Tier G medida y en tendencia ascendente. | ✅ **Monitoreado** en CI |

---

## 12. Estado de Calidad Actual

- **173 tests ejecutados, 173 tests aprobados (0 fallos, 0 skippeados).**
- **0 violaciones de determinismo:** La herramienta `check_anti_math_random.ts` audita los 57 archivos de `reborn/src/` certificando la ausencia absoluta de llamadas a `Math.random()`.
- **0 violaciones diegéticas:** La herramienta `check_diegetic_ui.ts` escanea los 27 archivos de `ui/src/`, garantizando que no existan etiquetas mecánicas prohibidas y que los hotspots en reposo respeten el umbral máximo de 7 palabras.
- **22/22 contratos Tier G conformes:** La herramienta `lint_tier_g.ts` valida sin advertencias todos los esquemas Zod de gameplay y balance.
- **Paridad 20/20 de World State:** Verificada contra las fuerzas míticas de `convergence_forces.json`.

---

## 13. Restricciones Absolutas (Leyes Inviolables de AGENTS.md)

Cualquier nuevo modelo o agente que opere en este repositorio DEBE cumplir estas leyes sin excepción:

1. **Rutas Purgadas Muertas:** El directorio legado `/src` y el subdirectorio `reborn/data/canonical/` fueron eliminados de forma permanente. **PROHIBIDO** buscar, recrear o referenciar archivos en esas rutas.
2. **Prohibición de Métricas Tautológicas:** Prohibido implementar auditores de "100% PASS" que midan su propia definición. Solo los Gates G1 a G7 certifican el progreso.
3. **Doctrina de Dos Capas:** Tier L (`reborn/data/content/`) es sagrado e inmutable. Tier G (`reborn/data/gameplay/`) contiene el juego.
4. **Balance Centralizado:** Todos los costes, daños, porcentajes, multiplicadores y salarios residen en `reborn/data/gameplay/balance/`. **PROHIBIDO** introducir números inline o valores mágicos en el código TypeScript o en los JSONs de contenido.
5. **Persistencia Transaccional:** Prohibido mantener estado crítico exclusivamente en variables de memoria volátil (`Map`, `Set`). Todo cambio de estado del juego debe asegurarse en SQLite.
6. **Resolución de Rutas:** Prohibidas las heurísticas dependientes del CWD. Todas las rutas a datos se resuelven de forma absoluta desde la raíz del paquete (`import.meta.url`).
7. **Regla del Hueco (§3.8):** Si falta contenido canónico, ningún agente lo inventa o improvisa. Se emite una excepción estructurada y se deriva a la cola `HUMAN_REVIEW`.
8. **Regla del Testigo (§3.9):** Ninguna operación destructiva se ejecuta sin commit previo. Orden estricta: **COMMIT primero, TAG después, DESTRUCCIÓN al final**.
9. **Formato Obligatorio de Reporte (§12):** Todo reporte de sesión o brief concluido debe incluir el **campo 0 obligatorio "COMMIT: <hash>"**, acompañado de la sección **FALLOS** obligatoria (incluso en sesiones limpias). Reporte sin Campo 0 = INVÁLIDO.
10. **Erradicación Absoluta de Math.random:** Prohibido el uso de `Math.random` en todo `reborn/src/`. Se utiliza exclusivamente `SeededRNG` y `generateDeterministicId`.
11. **Era Canónica Obligatoria:** **POST-LOTM · PRE-COI** (~1353 de la Quinta Época, aproximadamente un año tras la Guerra de los Dioses; Klein Moretti se encuentra en letargo cósmico; las deidades mayores son Leyenda/Mito; la Iglesia del Loco es embrionaria y LORE-ONLY en el Continente Norte; nada de Circle of Inevitability ha ocurrido salvo semillas latentes).
12. **Ley de Prosa Diegética y Ley del Objeto:** Cero HUD mecánico. En reposo, las etiquetas físicas no superan 7 palabras. La prosa reside en las interacciones ceremoniales.

---

## 14. Qué NO debe hacer un nuevo agente

Instrucciones explícitas de lo que está terminantemente prohibido para un nuevo modelo:

- ❌ **NO editar archivos en `reborn/data/content/` (Tier L):** Esos 67 JSONs son una biblioteca estática congelada bajo hashes SHA-256.
- ❌ **NO inventar estadísticas numéricas visibles para el usuario:** Prohibido agregar labels como "Vida: 80/100", "Cordura: 45%", "Ruina +2".
- ❌ **NO utilizar `Math.random()`:** Causa fallo instantáneo en el gate `lint:determinism`. Importar siempre `SeededRNG` o `generateDeterministicId`.
- ❌ **NO inventar constantes numéricas en el código TS:** Todo modificador o probabilidad debe leerse desde la tabla de balance correspondiente en `reborn/data/gameplay/balance/`.
- ❌ **NO inventar endpoints REST provisionales sin respaldo en la base de datos:** Si se crea una ruta en Fastify, debe estar conectada a `DatabaseClient.ts` y almacenar su estado en SQLite.
- ❌ **NO declarar un cambio de fase:** Solo el Director de Producto puede ordenar el paso de la Fase 1 a la Fase 2.
- ❌ **NO inventar NPCs operativos de deidades mayores:** Klein, Amon, Adam o Evernight son figuras míticas distantes de lore; jamás interactúan como NPCs de diálogo o comerciantes en Backlund.
- ❌ **NO rellenar huecos canónicos:** Si una fórmula de poción o un ingrediente no está en Tier L, se delega al Director humano.

---

## 15. Estado Real del Backend

### 15.1 Componentes Terminados y Operativos al 100%
- [x] **Infraestructura de Base de Datos:** `node:sqlite` sincrónico, migraciones versionadas del 001 al 008, claves foráneas, aislamiento en `DatabaseClient.ts`.
- [x] **Tolerancia Kill -9:** Verificación y suites automáticas de recuperación byte-equivalente en combates, casos y ascensos.
- [x] **Determinismo Estricto:** PRNG determinista basado en semillas numéricas y de texto; generador de IDs reproducible.
- [x] **Motor de Acting:** `ActingDilemmaEngine.ts` con algoritmo de coherencia, penalización por variedad, decaimiento por repetición e inestabilidad mental.
- [x] **Motor de Combate Táctico:** `TacticalCombatEngine.ts`, `GridCombatEngine.ts` (rejilla 5×7, PA, espiritualidad), `AtomRuntime.ts` (vocabulario atómico de habilidades) y matriz de estados.
- [x] **Motor de Investigación:** `InvestigationEngine.ts` y `ProceduralInvestigationService.ts` con verdad modelada (`truthModel`), 4 vectores de indagación, grafo de pistas y caducidad fail-forward.
- [x] **Motor de Somática:** `SomaticsEngine.ts` con anclas de humanidad dinámicas, opciones corruptas [S], cicatrices permanentes y eventos de descontrol (*Rampage*).
- [x] **Motor de Calendario:** `CalendarEngine.ts` con partición diaria de 4 slots y ticks semanales.
- [x] **Motor de Economía:** `EconomyEngine.ts` con moneda victoriana en peniques crudos (£/s/d), alquiler semanal y mercado de reactivos.
- [x] **Motor de Convergencia:** `ConvergenceEngine.ts` con cálculo de tensión por distrito, afinidades de séfira y disparadores de incursión.
- [x] **Motor de Ascenso:** `AscensionEngine.ts` con verificación de las Cinco Puertas, escena del Trago y telemetría en milisegundos.
- [x] **Catálogo de Orígenes Canónicos:** Los 6 orígenes victorianos aprobados en `origins.json` con sus anclas, contactos y deudas/secretos.
- [x] **Prólogo Universal:** Flujo tutorial paso a paso desde el hallazgo del sobre hasta la primera poción de S9.
- [x] **Validación de Contratos Tier G:** 22 contratos Zod validados por linter.
- [x] **Suites de Pruebas:** 173 tests pasando al 100% sin regresiones.

### 15.2 Componentes en Progreso (Fase 1 Abierta)
- [ ] **BRIEF-09 Integración Final:** Enlace dinámico completo de los eventos de calendario de identidad civil (`identity_event_history`) con la interfaz del Desván.
- [ ] **BRIEF-10 / BRIEF-10.VISUAL Integración UI:** Sincronización completa del estado de los objetos físicos del Desván (Vela, Espejo, Libro, Dossier, Reloj) con los endpoints del backend en Fastify.
- [ ] **Gate G4 (Pruebas Ciegas Humanas):** Sesión formal con 3 evaluadores externos midiendo la curva de dificultad y la hesitación del Trago hacia Secuencia 8.
- [ ] **Caso Mayor #1 (Cherwood):** Cierre del truth model humano y pulido del grafo de 8 pistas en conjunto con la Dirección.

### 15.3 Componentes Congelados / Fuera de Alcance 1.0
- ⏸ **Secuencias 2 a 0:** Reservadas para expansiones futuras; el alcance 1.0 cubre estrictamente de Secuencia 9 a Secuencia 3.
- ⏸ **16 Vías Pasivas:** Permanecen en Tier L como lore pasivo, compendio y base para NPCs/enemigos; no son jugables para el protagonista en 1.0.
- ⏸ **Modo Conspiraciones Generativo Pleno:** Utilización de las 190 conspiraciones restantes de Tier L; reservado para la versión post-lanzamiento v1.1.
- ⏸ **Sistemas Multijugador o Acción en Tiempo Real:** Excluidos por definición de producto.

---
*Fin del Documento Maestro de Contexto de Backend — Path to Godhood v4.0*

