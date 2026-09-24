# Path to Godhood — auditoría de código y decisión de recuperación

**COMMIT: 5583cc5c940ae5d8a056d7af5560b93c9af40afd — commit auditado, sin cambios al código de aplicación.**

Fecha: 23 de septiembre de 2026. Repositorio: [orlandoavila11/Proyecto_lotm](https://github.com/orlandoavila11/Proyecto_lotm). Raíz del workspace: LOTM_SIMULADOR.

**CI verificada:** [ejecución 31](https://github.com/orlandoavila11/Proyecto_lotm/actions/runs/35887409419), resultado success en Windows y Ubuntu, Node 22. **Contador N/20:** no evaluado; esta auditoría no sustituye la revisión humana canónica G6.

## 1. Dictamen

El proyecto tiene una base técnica aprovechable, pero todavía no entrega una partida integrada fiable. La interfaz activa combina una ilustración interactiva, demostraciones locales y algunas llamadas a servicios. El backend contiene sistemas de juego reales, junto con rutas antiguas que omiten reglas de esos mismos sistemas.

**Cambiar de motor por sí solo trasladaría los fallos a otra interfaz.** Hay causas concretas, independientes de React: CSS que anula estilos, personajes de prueba en la ruta normal, errores convertidos en éxitos ficticios, contratos incompatibles y operaciones de persistencia que no son atómicas.

Mi recomendación revisada es conservar TypeScript, los contenidos y la infraestructura útil; reparar las reglas y los contratos; y migrar después la presentación espacial a Phaser. React puede seguir resolviendo documentos, diálogos, ajustes y accesibilidad. La prioridad inmediata es conseguir una sesión pequeña que cree un personaje real, aplique consecuencias reales y sobreviva a una recarga y a un reinicio.

La recomendación anterior de Phaser se mantiene como dirección de presentación. **Se corrige su prioridad:** la migración visual no debe preceder al arreglo de los defectos de integridad ni considerarse su solución.

## 2. Qué se comprobó y qué quedó fuera

Se clonó el repositorio y se revisaron las instrucciones, manifiestos, entrada de aplicación, navegación, CSS, cliente HTTP, vistas activas, rutas REST, motores críticos, migraciones, generación de identificadores, pruebas y pipeline de CI. Las reproducciones adicionales usan bases temporales o SQLite en memoria.

| Comprobación | Resultado y alcance |
|---|---|
| Instalación reproducible | npm ci --ignore-scripts --no-audit --no-fund completó; se omitieron scripts de instalación de dependencias |
| Build de servidor e interfaz | Completó sin modificar código fuente |
| Suite existente | 173 pruebas aprobadas, 35 suites, 0 fallos |
| Integridad Tier L | 67/67 archivos conservan hash y tamaño |
| Validación Tier G | 22 archivos validados |
| Anti-Math.random | Aprobado: 57 archivos escaneados por el script |
| Auditoría de prosa UI | Aprobada: 27 archivos escaneados por el script |
| Arranque de producción | npm start falla por ausencia de migraciones SQL en dist |
| API | Solicitudes reales a Fastify mediante app.inject; fallos reproducidos con estado SQLite |
| Reinicio | Dos procesos nuevos sobre la misma base temporal reproducen colisión de identificadores |
| Contrato somático | Render de CandleObject con el valor real LUCID falla |
| CI remota | Se verificaron el commit, la ejecución y ambos jobs; ambos aprobaron |
| Inspección visual | Se inspeccionaron capturas ya incluidas en el repositorio y el CSS compilado |
| Prueba interactiva nueva en navegador | No completada: las descargas de Chromium devolvieron archivos inválidos |

El entorno local usa Node 24.19.0. El lanzador CLI de tsx encontró una restricción de IPC del entorno; la suite se ejecutó con **node --import tsx --test tests/*.test.ts**, desde reborn. Los tres scripts de validación TypeScript se ejecutaron igualmente con node --import tsx. Esto no se contabiliza como fallo del proyecto.

El servidor ejecutado directamente desde TypeScript también encontró una restricción del entorno al enumerar interfaces de red. Se comprobó su lógica con Fastify inject. El fallo de npm start es diferente: procede del empaquetado del proyecto y quedó reproducido antes de escuchar conexiones.

Las capturas consultadas son evidencia histórica versionada, no capturas nuevas de esta auditoría. No se certifican FPS, uso de GPU, accesibilidad completa ni una sesión humana de principio a fin. No se ejecutó una revisión exhaustiva de fidelidad a toda la novela ni una auditoría de seguridad de producción.

El código de ui/src, reborn/src y reborn/data permanece intacto. La instalación modificó dependencias de la copia local porque el repositorio tiene archivos de node_modules versionados. No se publicó ningún cambio.

## 3. Hallazgos prioritarios

Prioridades de esta auditoría: **P0** bloquea un arranque o una partida real; **P1** rompe reglas, estado, contratos o interacción esencial; **P2** es deuda de producto, mantenimiento o distribución. No son puntuaciones de severidad de seguridad.

| ID | Prioridad | Hallazgo | Evidencia |
|---|---|---|---|
| F01 | P0 | El build no produce un servidor arrancable con npm start | Ejecución |
| F02 | P0 | El arranque normal sustituye al jugador por un fixture | Código y API: ese ID no existe |
| F03 | P0 | Errores HTTP se convierten en éxitos narrativos | Cliente ejecutado con HTTP 503 |
| F04 | P0 | Mercado, combate, investigación y ascensión activos no usan sus motores | Código y conexiones de App |
| F05 | P1 | CSS global neutraliza espaciado y estilos de controles | Fuente, CSS compilado y capturas del repo |
| F06 | P1 | Los estados somáticos del servidor hacen fallar la vela | Render reproducido |
| F07 | P1 | Los identificadores se repiten tras reiniciar el proceso | Dos procesos sobre la misma base |
| F08 | P1 | Una compra puede cobrar y no entregar el objeto | Fallo controlado inyectado |
| F09 | P1 | Calendario desfasado y efectos declarados sin aplicar | API y estado SQLite |
| F10 | P1 | Movimiento táctico inválido y regeneración de AP por error | API |
| F11 | P1 | Ruta antigua permite ascender sin ingredientes | API |
| F12 | P1 | Repetición de acciones y elecciones inválidas aceptadas | API |
| F13 | P1 | La UI introduce fórmulas y poderes ajenos a su fuente canónica interna | Comparación de archivos |
| F14 | P1 | Tab y flechas se interceptan fuera del desván | Código; pendiente prueba de navegador |
| F15 | P1 | Los controles de calidad omiten fallos esenciales | CI, scripts y pruebas |
| F16 | P2 | Escalar toda la UI reduce también texto y áreas táctiles | Fórmula de viewport |
| F17 | P2 | El paquete gráfico no corresponde a una colección de sprites separables | Inventario de imágenes y composición |
| F18 | P2 | Hay dos generaciones de UI y código fuera del recorrido activo | Análisis de imports |
| F19 | P2 | La supuesta frontera tipada permite datos incompatibles | any, conversiones y tipos duplicados |
| F20 | P2 | Repositorio y despliegue carecen de una entrega mínima limpia | Archivos versionados, scripts y README |

### F01. Compilar no garantiza poder iniciar el juego

**Fuentes:** reborn/package.json, scripts build y start; [MigrationRunner.ts, línea 21](https://github.com/orlandoavila11/Proyecto_lotm/blob/5583cc5c940ae5d8a056d7af5560b93c9af40afd/LOTM_SIMULADOR/reborn/src/infra/database/MigrationRunner.ts#L21).

El build ejecuta tsc. MigrationRunner busca la carpeta migrations al lado del módulo ejecutado. Al iniciar desde dist, espera dist/infra/database/migrations, pero los SQL no se copian allí.

Resultado de npm start: **Directorio de migraciones no encontrado**. Es reproducible con un checkout limpio y build aprobado.

**Arreglo:** definir explícitamente qué contiene la distribución: JavaScript, migraciones, datos requeridos y configuración. Copiar recursos como parte del build o resolverlos desde una ubicación estable del paquete. Añadir un smoke test que arranque la distribución compilada contra una base nueva y consulte health. Debe verificarse también con una base existente.

### F02. La ruta normal utiliza un personaje de demostración

**Fuente:** [App.tsx, línea 44](https://github.com/orlandoavila11/Proyecto_lotm/blob/5583cc5c940ae5d8a056d7af5560b93c9af40afd/LOTM_SIMULADOR/ui/src/App.tsx#L44).

Un efecto asigna FOOL_SEER_FIXTURE siempre que character está vacío, independientemente de que se haya pedido el harness. El prólogo puede aparecer en el primer render, pero inmediatamente se sustituye por el fixture. Su ID es char_fixture_fool_01; la API de una base nueva devuelve 404 para ese personaje.

Además, PrologueView.handleFinishPrologue construye un objeto local con un ID basado en Date.now y llama a onCompletePrologue. No crea el personaje en el servidor. Quitar únicamente el efecto del fixture no bastaría.

**Arreglo:** separar explícitamente boot, selección de partida, creación, prólogo y juego. El modo de demostración debe activarse de forma deliberada y quedar aislado. Nueva partida debe persistir y devolver un snapshot completo; continuar debe recuperar una partida existente. La selección del personaje puede guardarse en el cliente, pero la verdad de la partida debe recuperarse del almacenamiento autorizado.

### F03. La interfaz oculta fallos y comunica progreso inexistente

**Fuentes:** [apiClient.ts, línea 190](https://github.com/orlandoavila11/Proyecto_lotm/blob/5583cc5c940ae5d8a056d7af5560b93c9af40afd/LOTM_SIMULADOR/ui/src/services/apiClient.ts#L190), métodos resolveIdentityEvent y resolveActingDilemma; CalendarView, catch de handlePerformAction.

Ante una respuesta HTTP 503, ambos métodos de resolución devuelven success: true y una narración favorable. CalendarView también avanza su reloj local al fallar la solicitud, y ese camino no sincroniza el estado del padre mediante onActionCompleted.

Esto genera una experiencia especialmente engañosa: el jugador percibe que tomó una decisión y avanzó, mientras SQLite no registra esos efectos.

**Arreglo:** los fallos deben producir estados de error recuperables. Conservar la decisión pendiente, mostrar una explicación clara y permitir reintento seguro. Los fixtures deben pertenecer a un adaptador de demostración separado; nunca al catch del cliente de producción. Una frase diegética puede acompañar el error, pero no afirmar un resultado que no ocurrió.

### F04. Las pantallas principales representan prototipos independientes

| Vista activa | Comportamiento observado en código | Integración requerida |
|---|---|---|
| MarketView | handleBuy muestra un mensaje y lo borra a los cuatro segundos | Saldo, inventario, precio y resultado de compra del servidor |
| CombatView | Combatientes locales; victoria tras dos heridas locales; sin solicitudes al motor | Encuentro persistido, acciones validadas y resolución autoritativa |
| CorkboardView | Ocho pistas y conexiones precargadas; estado local | Solo pistas descubiertas, hipótesis del caso y guardado |
| AscensionView | Requisitos inicializados como listos; avance de fase local | Checklist real, consumo de ingredientes y cambio de secuencia |
| PrologueView | Construye el personaje localmente | Creación y progreso de prólogo persistentes |

**Fuentes:** ui/src/features/market/MarketView.tsx, línea 57; combat/CombatView.tsx, línea 80; investigation/CorkboardView.tsx, línea 35; ascension/AscensionView.tsx, línea 49; prologue/PrologueView.tsx, línea 168. App monta esas vistas directamente.

No significa que no existan motores backend. Significa que el jugador no está utilizando esos motores desde las pantallas actuales.

**Arreglo:** elegir un recorrido y conectarlo completo. Conservar las vistas como referencias visuales donde aporten valor, pero eliminar la lógica local que concede resultados. Cada pantalla debe mostrar un estado derivado de la misma partida.

### F05. Hay una causa CSS directa del deterioro visual

**Fuentes:** [index.css, línea 25](https://github.com/orlandoavila11/Proyecto_lotm/blob/5583cc5c940ae5d8a056d7af5560b93c9af40afd/LOTM_SIMULADOR/ui/src/index.css#L25); [tokens.css, línea 47](https://github.com/orlandoavila11/Proyecto_lotm/blob/5583cc5c940ae5d8a056d7af5560b93c9af40afd/LOTM_SIMULADOR/ui/src/styles/tokens.css#L47).

El selector universal elimina margin y padding fuera de cualquier capa CSS. Tailwind emite utilidades dentro de @layer utilities. Las declaraciones normales fuera de capas tienen precedencia sobre las normales dentro de capas. En el CSS compilado se verifican tanto .p-8 como el reset global posterior y sin capa. Por tanto, añadir más clases p-8 o px-4 no resuelve el conflicto.

La clase lotm-focus-ring añade otro problema: junto al foco define background-color: transparent, border: none, padding: 0, color: inherit y font: inherit. Se usa en botones que también tienen clases para fondo, borde y tamaño. Una utilidad que debería marcar el foco acaba borrando el diseño del control.

tokens.css contiene además una segunda colección de utilidades con !important. Se están superponiendo un sistema de Tailwind y un sistema manual de reemplazo.

**Arreglo:** ubicar resets en @layer base; separar foco y apariencia del botón; retirar utilidades duplicadas tras comprobar equivalencia; usar componentes de botón con variantes controladas. Validar estilos calculados y capturas de calendario, identidad y mercado. No parchear todo con más !important.

Las capturas r4 del repositorio muestran contenido pegado a los bordes, texto pequeño y grandes vacíos. Son coherentes con este defecto, aunque no sustituyen la comprobación visual posterior al arreglo. Regla de cascada contrastada con [MDN: @layer](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@layer).

### F06. Conectar el estado real puede romper el render

**Fuentes:** reborn/src/core/types/somatics.ts, línea 1; ui/src/features/types.ts, línea 6; App.tsx, línea 59; CandleObject.tsx, línea 14.

El servidor devuelve LUCID, NERVOUS_TENSION y otros estados de dominio. La vela espera BRILLANTE, VACILANTE, CREPITANTE o AHOGADA_EN_CERA. App copia el valor del servidor sin convertirlo.

Se renderizó CandleObject con LUCID, obtenido de la creación real de un personaje. Resultado: **Cannot read properties of undefined (reading 'labelBrief')**. El switch no tiene una rama válida para ese valor. Los estados de corrupción también usan vocabularios diferentes entre ambas capas.

**Arreglo:** introducir una proyección explícita y exhaustiva de estado de dominio a representación visual. Definir cómo se condensan los cinco estados de sanidad del backend en las representaciones disponibles, y cómo se trata cada estado de corrupción. Debe ser una decisión de presentación documentada y probada. Evitar conversiones as unknown as que silencian incompatibilidades.

### F07. El generador de identificadores pierde continuidad al reiniciar

**Fuente:** [IdGenerator.ts, línea 3](https://github.com/orlandoavila11/Proyecto_lotm/blob/5583cc5c940ae5d8a056d7af5560b93c9af40afd/LOTM_SIMULADOR/reborn/src/core/rng/IdGenerator.ts#L3).

El contador y el RNG predeterminado viven en memoria y arrancan siempre con el mismo estado. Un primer proceso ejecutó WORK y creó cal_act_kij6_1. Un segundo proceso abrió la misma base e intentó WORK: volvió a generar cal_act_kij6_1 y falló por unicidad.

La segunda acción dejó, además, trabajo semanal incrementado de 1 a 2, aunque el slot permaneció en 1. Es un fallo de continuidad y una demostración adicional de escritura parcial.

**Arreglo:** separar identificadores de persistencia de tiradas de simulación. Usar una secuencia persistida por partida o identificadores únicos independientes del RNG del juego. Si se necesita derivación determinista, que dependa de sessionId y de un contador persistido en la misma transacción. Persistir por separado el estado del RNG que afecta a resultados.

### F08. Persistir en SQLite no hace atómica una acción

**Fuente:** [EconomyEngine.ts, línea 157](https://github.com/orlandoavila11/Proyecto_lotm/blob/5583cc5c940ae5d8a056d7af5560b93c9af40afd/LOTM_SIMULADOR/reborn/src/core/economy/EconomyEngine.ts#L157).

La compra descuenta dinero, añade inventario y registra la transacción mediante escrituras separadas. Se inyectó un fallo controlado al añadir inventario: HTTP 500, saldo de 4800 a 3600 peniques, ningún objeto recibido.

El fallo fue provocado para verificar el comportamiento ante una interrupción; no se afirma que el inventario falle siempre. El defecto demostrado es que no hay rollback de la compra.

Las migraciones sí usan transacciones. Eso no protege automáticamente las operaciones de juego que ocurren después.

**Arreglo:** envolver cada comando completo en una transacción: validación de revisión, consumo o concesión de recursos, estado de escena, registros y recibo idempotente. Añadir pruebas de fallo entre pasos y de reintento. Aplicar el mismo análisis a calendario, ascensión, identidad y resolución de combate.

### F09. El tiempo y algunas consecuencias no coinciden con lo mostrado

**Fuentes:** CalendarEngine.performSlotAction; CalendarView, línea 77; App.tsx, línea 155.

Una acción WORK realizada en día 1, slot 0 devuelve día 1, slot 0, mientras la base ya tiene slot 1. El servidor describe el momento de la acción, pero la interfaz lo utiliza como estado posterior.

SOCIALIZE declara anchorStrengthDelta: 2; la suma de anclas permaneció en 62. El código construye el delta y la narración, pero no aplica el incremento correspondiente. WORK también declara un incremento de ancla sin actualizarla en esa rama.

Por otra parte, la ruta antigua advance-day acepta días negativos: al enviar -10 desde día 2, el personaje terminó en día -8.

**Arreglo:** distinguir performedAt de snapshotAfter. Aplicar efectivamente las consecuencias declaradas y devolver el estado actualizado. Unificar las vías de avance del tiempo. Validar valores y no permitir que una ruta alternativa omita ciclos o retroceda el calendario.

### F10. Las rutas tácticas omiten reglas esenciales

**Fuente:** [combatRoutes.ts, línea 250](https://github.com/orlandoavila11/Proyecto_lotm/blob/5583cc5c940ae5d8a056d7af5560b93c9af40afd/LOTM_SIMULADOR/reborn/src/server/routes/combatRoutes.ts#L250), rama MOVE en línea 284.

Se aceptó mover al personaje a x=999, y=-100 en una rejilla de 7 por 5. También se pudo repetir movimiento sin avanzar el turno. Cuando AP llegó a cero, la expresión if (!player.ap) lo repuso a 3; el siguiente movimiento dejó AP en 2.

Hay lógica táctica más rica en GridCombatEngine, pero estas rutas alteran el actor directamente. Las pruebas del motor no garantizan que la ruta lo utilice.

**Arreglo:** dirigir todas las acciones a un único resolutor táctico. Validar turno, recursos, distancia, colisión, ocupación y límites. Inicializar campos ausentes con comprobaciones de null/undefined; cero es un estado válido. Retirar parámetros de producción que permitan al cliente definir libremente las estadísticas enemigas.

### F11. Existe una vía de ascenso que evita el sistema de ingredientes

**Fuente:** [characterRoutes.ts, línea 259](https://github.com/orlandoavila11/Proyecto_lotm/blob/5583cc5c940ae5d8a056d7af5560b93c9af40afd/LOTM_SIMULADOR/reborn/src/server/routes/characterRoutes.ts#L259).

Preparando en una base de auditoría digestión completa y estado somático seguro, POST /api/character/advance permitió pasar de secuencia 9 a 8 con **cero ingredientes**. Esa ruta coexiste con /api/ascension/drink y no utiliza su control de ingredientes.

**Arreglo:** eliminar o redirigir el acceso antiguo hacia el mismo servicio de ascensión. Toda entrada, incluida una futura escena Phaser, debe cumplir idénticas reglas. Revisar también el reconocimiento de fórmula, secuencia objetivo, repetición de solicitud y consumo atómico.

### F12. Las solicitudes repetidas y las opciones inválidas no están resueltas

**Fuentes:** calendarRoutes.ts; [IdentityEngine.ts, línea 130](https://github.com/orlandoavila11/Proyecto_lotm/blob/5583cc5c940ae5d8a056d7af5560b93c9af40afd/LOTM_SIMULADOR/reborn/src/core/identity/IdentityEngine.ts#L130).

Dos solicitudes WORK con el mismo commandId se procesaron dos veces. El esquema no implementa idempotencia y descarta ese campo adicional. El reloj avanzó dos franjas.

IdentityEngine acepta optionIndex=9999 y utiliza silenciosamente la opción cero. La misma resolución pudo registrarse dos veces en el mismo día y slot. Tampoco exige una instancia pendiente del evento que haya sido ofrecida a ese personaje.

**Arreglo:** identificar comandos, eventos ofrecidos y resoluciones. Rechazar índices fuera de rango. Comprobar elegibilidad y estado pendiente. Repetir el mismo comando debe devolver el mismo recibo; reutilizar su ID con otro contenido debe fallar. Deshabilitar un botón mientras espera mejora la UX, pero no sustituye estas garantías.

### F13. El lore ya diverge dentro del propio proyecto

**Fuentes:** AscensionView.tsx, líneas 75 y 79; reborn/data/content/pathways/seer.json y spectator.json; AscensionEngine.CANONICAL_FORMULAS; CombatView.tsx, línea 114.

Para Payaso, la UI enumera piel de pez búho y glándula de medusa. La fuente Tier L y el backend usan cristal del cuerno de cabra de Hornacis y tallo de rosa de rostro humano. La UI del Visionario tampoco coincide con la fórmula S8 de spectator.json.

CombatView concede al Vidente S9 manipulación ofensiva de hilos astrales; esa facultad no forma parte del catálogo S9 de seer.json. Esto se detecta comparando archivos internos, sin necesidad de declarar resuelta toda la exactitud de la novela.

**Arreglo:** hacer que la UI consuma identificadores y descripciones aprobados, no que mantenga un catálogo narrativo independiente. Conservar Tier L sin editarlo en esta auditoría. Los conflictos de la propia fuente con la novela necesitan una revisión canónica separada y trazable. Hash íntegro significa que un archivo no cambió; no demuestra que todo su contenido sea fiel al canon.

### F14. La navegación de teclado invade otras pantallas

**Fuente:** [SceneViewport.tsx, línea 128](https://github.com/orlandoavila11/Proyecto_lotm/blob/5583cc5c940ae5d8a056d7af5560b93c9af40afd/LOTM_SIMULADOR/ui/src/scene/SceneViewport.tsx#L128).

El manejador global intercepta Tab y flechas. Solo excluye INSPECTION_LAYER y campos de texto; no excluye calendario, mercado, identidad ni combate. En esas vistas busca hotspots del desván que ya no están montados y evita el comportamiento normal del teclado.

**Arreglo:** limitar la navegación espacial al desván. Cada panel debe tener su propio alcance de foco, entrada y salida previsibles y devolución de foco al activador. La lectura de este defecto es directa; falta comprobar su reparación con teclado en navegador.

### F15. Las pruebas son útiles, pero sus nombres prometen más de lo que demuestran

**Fuentes:** package.json; .github/workflows/ci.yml; reborn/tests/calendar_identity_acting_r4.test.ts; gate_g3_kill9_battery.test.ts; scripts/check_anti_math_random.ts.

test:ui ejecuta únicamente el build. Las pruebas R4 renderizan HTML estático y llaman motores por separado: no ejercitan App creando una partida y consumiendo la API. Por eso no descubren el fixture automático ni el contrato de la vela.

La batería G3 de cinco dominios cierra y reabre SQLite mediante db.close; eso no es un SIGKILL durante una operación. También existen pruebas separadas de combate e investigación que sí matan procesos: deben conservarse. El problema es atribuir a toda la batería una cobertura que no tiene.

El gate de determinismo detecta Math.random, pero varios resultados y semillas dependen de Date.now. Ejemplos: GridCombatEngine y ProceduralInvestigationService. Prohibir una función no prueba continuidad determinista tras reinicio.

**Arreglo:** mantener las pruebas de reglas y contratos que aportan valor; añadir pruebas de usuario, arranque de dist y fallos intermedios. Nombrar cada prueba según lo que hace. Los gates de prosa y hashes deben ser controles auxiliares, no indicadores principales de jugabilidad.

### F16. El escalado fijo afecta la legibilidad

**Fuente:** SceneViewport.tsx, línea 59.

La aplicación escala uniformemente un lienzo de 1920 por 1080, incluyendo texto y controles. A 1280 por 720 la escala es 0.667: texto de 14 píxeles lógicos queda en aproximadamente 9.3 píxeles visibles. Un área de 44 píxeles lógicos se reduce a aproximadamente 29.3.

Comprobar que el área lógica mide 44 no verifica que sea cómoda en la pantalla final. En orientación vertical el deterioro sería mayor.

**Arreglo:** separar la escena escalable de los paneles de lectura y controles DOM. Permitir texto adaptable, tamaño configurable y redistribución por pantalla. Definir soporte real para móvil o declararlo fuera del primer corte; no presentar el simple encogimiento del lienzo como adaptación.

### F17. Los recursos actuales limitan los estados de escena

El inventario de ui/public/art contiene **59 imágenes, todas JPEG, 69,084,487 bytes — 65.88 MiB**. Este es el tamaño total del directorio, no una medición de la descarga inicial.

Los retratos de origen de 1200 por 896 pesan entre aproximadamente 3 y 6.8 MB. Deben prepararse versiones de distribución y medir su calidad y tamaño. La composición C0 integra objetos y una llama en el fondo; superponer una llama SVG no permite retirar la llama pintada original.

**Arreglo:** conservar C0 como referencia de composición. Preparar fondo limpio, objetos con transparencia cuando sea necesaria, estados de espejo/vela y capas de luz coherentes. Exportar tamaños adecuados, manifestar dimensiones, pivotes y áreas interactivas, y cargar por escena. Usar JPEG/WebP para fondos y PNG/WebP con alfa para recortes. No es necesario regenerar todo el arte.

### F18. Dos generaciones de interfaz dificultan saber qué existe de verdad

Un recorrido estático de imports relativos desde main.tsx encontró 47 archivos alcanzables y 26 fuera de ese recorrido, entre TS, TSX y CSS. Es una medición de imports, no una prueba formal de código muerto.

Entre los no alcanzables están LivingCity, InteractiveWorldMap, TacticalCombatTheater, organizaciones, diario de misiones y OccultAudioManager. Su mera presencia no significa que estén disponibles para el jugador. La dependencia Howler tampoco demuestra que la experiencia activa tenga sonido.

DeskView muestra además amenaza usando Boolean(policeSuspicionText || churchSuspicionText): una frase como “sin sospechas” sigue siendo verdadera y activa la señal.

**Arreglo:** elegir una implementación vigente por función; archivar con control de versiones lo que sea referencia, y retirar gradualmente lo redundante. Representar peligro con datos explícitos, no con la existencia de una frase. Evaluar capacidades por el recorrido activo.

### F19. La frontera de datos no está realmente protegida

apiClient.getCharacter devuelve Promise<any>; App aplica valores sin validar y utiliza conversiones forzadas para fixtures. El tsconfig de la UI no activa strict. Los tipos del servidor y de presentación se mantienen por separado, sin adaptador exhaustivo.

También hay reglas narrativas y de balance duplicadas en vistas, rutas y motores. CalendarEngine y otros motores importan directamente DatabaseClient: la arquitectura es modular, pero una parte importante del dominio no es pura ni independiente de persistencia.

**Arreglo:** contratos compartidos y validados en los límites, proyecciones de presentación explícitas y servicios de aplicación que gestionen transacciones. Extraer gradualmente funciones puras donde aporte valor. Evitar una reestructuración masiva previa al primer recorrido reparado.

### F20. Falta una entrega operativa mínima

Hay **557 archivos de node_modules versionados**, aunque .gitignore ya indica que deben ignorarse. Existen lockfiles en raíz y subpaquetes. CI utiliza npm install --legacy-peer-deps, y ui/README.md sigue siendo el README de la plantilla.

El servidor habilita CORS con origen asterisco y no se observó autenticación ni asociación de un personaje a una sesión autenticada. La URL pública del repositorio no demuestra que exista un despliegue público; estos hallazgos deben resolverse conforme al modelo de distribución elegido.

**Arreglo:** un lockfile autoritativo para el workspace, npm ci en CI, exclusión efectiva de dependencias ya rastreadas, versión de Node declarada y README de instalación/partida/guardado. Definir si el producto será local para una persona o un servicio alojado. Si se aloja para varias personas, implementar aislamiento de partidas y autorización antes de exponer estas rutas.

## 4. Qué conservaría

No empezaría desde cero. Hay trabajo útil y verificable:

- La separación de paquetes ui y reborn permite intervenir gradualmente.
- Los esquemas Zod, el catálogo y la verificación de integridad aportan una base para controlar contenido.
- SQLite, WAL y las migraciones versionadas son aprovechables para el alcance actual. La falta de transacciones por comando es un problema de implementación, no una razón suficiente para cambiar de base.
- Los motores contienen reglas reales y pruebas que conviene conservar y ampliar. El objetivo es hacer que todas las entradas utilicen esas reglas.
- Las pruebas que realmente matan y recuperan procesos son una base útil para ampliar la cobertura de interrupciones.
- La identidad visual de caoba, papel, latón y objetos físicos sirve como dirección artística.
- El desván puede funcionar como refugio e interfaz de regreso entre actividades.
- Las piezas de navegación, foco, reducción de movimiento y vocabulario visual pueden reutilizarse después de corregir su alcance y sus contratos.

No conservaría como restricciones absolutas la prohibición de información mecánica, la composición fija, el tamaño universal de 1920 por 1080 ni la obligación de que todo acceso sea un objeto diminuto. Son decisiones de diseño revisables; el usuario ha reservado la inmutabilidad al lore.

La claridad sobre una acción forma parte de la experiencia de juego. Un jugador debe comprender qué intenta hacer, qué recurso utiliza, qué peligro conoce y qué consecuencia obtuvo. Se puede expresar con lenguaje y elementos del mundo sin ocultar información necesaria.

## 5. Decisión de stack tras leer el código

| Opción | Ajuste a este repositorio | Decisión |
|---|---|---|
| Reparar React y mantener toda la presentación DOM | Es la vía de menor cambio para recuperar los flujos actuales; permite un RPG narrativo funcional | Válida para el primer rescate funcional |
| Phaser + TypeScript + React selectivo | Aprovecha el código y backend existentes; aporta un marco de escenas e interacción espacial | Dirección recomendada para evolucionar la presentación |
| Godot | Ofrece un entorno de producción de juego más integral; implicaría migrar o mantener un puente con buena parte del código TS actual | Reconsiderar si el objetivo principal pasa a escritorio, exploración extensa y herramientas nativas de escenas |

No hay evidencia de que Fastify, Vite o TypeScript impidan hacer este juego. Vite es una herramienta de construcción, y también puede acompañar a Phaser. El cambio importante es establecer quién controla la partida y cómo se representa, no eliminar cualquier tecnología asociada a la web.

La versión de Phaser verificada al redactar el informe es **4.2.1**, marcada como Latest en sus releases oficiales. La plantilla oficial React/TypeScript ofrece un punto de partida para el puente de presentación. No mezclar ejemplos de máscaras y renderizado de Phaser 3 con APIs de Phaser 4 sin comprobar compatibilidad.

Godot exporta a web con requisitos propios documentados. Adoptarlo puede ser una buena decisión de producto, pero aquí añade coste de migración y no evita tener que solucionar contratos, reglas y guardado. No lo elegiría solamente por el aspecto actual de estas pantallas.

**Condición para ampliar Phaser:** un prototipo pequeño con el desván, tres objetos, cambio de estado visible, interacción por ratón/teclado y una acción real sobre SQLite. Debe cargar una partida existente, mostrar errores honestos y cerrar limpiamente sus recursos. Comparar su claridad y coste con la UI reparada. Si no mejora la experiencia, no extender la migración por inercia.

Fuentes de capacidades y versión: [releases de Phaser](https://github.com/phaserjs/phaser/releases), [plantilla oficial React/TS](https://github.com/phaserjs/template-react-ts), [exportación web de Godot](https://docs.godotengine.org/en/stable/tutorials/export/exporting_for_web.html). La elección recomendada es un juicio arquitectónico a partir de esta auditoría.

## 6. Arquitectura mínima que propondría

### Una autoridad de partida

El servidor procesa comandos y mantiene el estado persistente. Phaser y React muestran proyecciones del mismo estado. Ninguno concede dinero, pistas, digestión o victoria por su cuenta.

No hace falta implementar event sourcing completo, microservicios ni un backend nuevo. Es suficiente un servicio de aplicación que coordine las reglas existentes y SQLite con límites claros.

| Capa | Responsabilidad | Cambio práctico |
|---|---|---|
| Sesión | Crear, seleccionar y continuar partida | Eliminar el fixture automático y persistir el identificador seleccionado |
| Contratos | Comandos, respuestas y datos públicos | Tipos compartidos y validación; no Promise<any> |
| Servicios de aplicación | Orden y atomicidad de una acción | Una transacción por comando; recibos idempotentes |
| Dominio | Costes, elegibilidad, resultados, reglas | Reutilizar motores y cerrar rutas que los evitan |
| Persistencia | Estado y revisión de partida | Contador duradero, migraciones, guardado y recuperación |
| Proyección | Traducir estado a objetos y textos | Mapper de somática, tiempo, inventario y progreso |
| Phaser | Escenas, cámara, selección, movimiento visual y efectos | Solo presentación e intención del jugador |
| React | Lectura, elecciones, ajustes y controles accesibles | Paneles adaptables fuera del escalado del mundo |

### Contrato de comando

Campos mínimos propuestos: commandId, sessionId, expectedRevision, type y payload. El recibo debe incluir commandId, resultingRevision, outcome y snapshotAfter. Para acciones temporales, incluir performedAt por separado.

Orden de ejecución:

1. Identificar la partida y validar el comando.
2. Abrir la transacción.
3. Si commandId ya existe con el mismo contenido, devolver su recibo.
4. Comprobar expectedRevision y elegibilidad de la acción.
5. Aplicar reglas y todas las consecuencias.
6. Guardar el estado, la revisión y el recibo en la misma transacción.
7. Confirmar y devolver la proyección pública.

No debe existir un recibo de éxito antes de confirmar las escrituras. Una revisión evita que dos pantallas actúen sobre una versión obsoleta; la idempotencia evita duplicar la misma solicitud. Son garantías diferentes.

### Estado de interfaz

Separar el estado de partida del estado efímero: selección de pista, panel abierto, hover, animación y foco. El primero proviene del snapshot; el segundo puede vivir localmente.

Definir estados explícitos de carga, listo, enviando, error recuperable y sincronización requerida. Evitar que un catch regrese al modo de demostración. React no necesita actualizarse por cada frame de Phaser.

### Guardado

Primero autosave por comando confirmado y continuidad al reinicio. Después, checkpoints versionados antes de decisiones mayores y exportación/importación si se decide distribución local. Cualquier modo ironman debe ser una opción de producto, no una consecuencia accidental de carecer de recuperación.

## 7. Cómo convertirlo en una experiencia jugable

Mi crítica de producto es que el desván está actuando como sustituto de la vida del personaje. La escalera abre un combate prefabricado; el calendario ofrece actividades genéricas; el tablero muestra pistas ya disponibles. Eso limita la fantasía de descubrir y vivir consecuencias.

Conservaría el desván como centro de regreso, pero la primera sesión debería tener una pequeña historia causal:

1. Crear una identidad a partir de un origen aprobado.
2. Completar el prólogo con persistencia real.
3. Recibir una necesidad u objetivo concreto procedente del contenido existente.
4. Elegir cómo emplear una franja: cumplir una obligación civil o visitar una localización relevante.
5. Descubrir una pista mediante una acción y un coste comprensibles.
6. Obtener una oportunidad de actuación coherente con la vía.
7. Resolver una complicación, mediante información, negociación, retirada o combate cuando corresponda.
8. Regresar con dinero, anclas, sospecha y progreso modificados de forma verificable.
9. Cerrar, recargar y continuar exactamente desde ese estado.

El primer corte puede construirse con un origen, una vía, un caso y pocas localizaciones ya aprobadas. Los otros orígenes y vías no se borran ni dejan de existir en el lore: se conectan después de validar el patrón.

La primera sesión no tiene que regalar un ascenso. Debe explicar cómo se gana, qué falta y por qué importa. El primer objetivo es una cadena de decisiones con consecuencias, no exhibir simultáneamente todos los sistemas.

### Cambios de UI que haría

- Establecer una tarea principal visible en cada momento y una salida clara.
- Dar jerarquía a acciones, contexto, riesgo conocido y resultado. Reducir párrafos decorativos repetidos.
- Utilizar el dorado como acento de interacción y jerarquía, no como color de casi todo el texto.
- Reservar tipografía ornamental para títulos. Probar una fuente de lectura con mejor legibilidad para documentos largos.
- Permitir ayuda contextual, historial de mensajes y explicación de costes.
- Mantener metáforas visuales, acompañadas de información accesible y comprensible.
- Mostrar compra pendiente, confirmación real, saldo e inventario actualizado; no solo una frase temporal.
- Hacer que el tablero empiece con lo descubierto y crezca con la investigación.
- En combate, comunicar turno, alcance válido, recursos disponibles e intención conocida del adversario.
- Unificar el acceso de ratón, teclado y táctil mediante los mismos comandos.
- Separar el fondo ambiental de los controles de lectura para que el texto no se encoja con la escena.
- Añadir sonido y animación después de conectar los eventos reales. Cada efecto debe responder a una acción o estado concreto.

No generaría otra tanda grande de imágenes antes de resolver estas bases. Primero se fija qué objeto cambia, qué estados necesita y cómo se leerá en pantalla; luego se produce el recurso.

## 8. Orden de trabajo propuesto

Cada entrega debe dejar el proyecto ejecutable y tener una condición observable de cierre.

| Entrega | Trabajo | Condición de cierre |
|---|---|---|
| R1 — Arranque reproducible | Empaquetar SQL/datos, documentar Node y comandos, comprobar dist | Instalar, compilar, iniciar y consultar health desde un checkout limpio |
| R2 — Integridad de comandos | IDs persistentes, transacciones y recibos idempotentes | Reinicio y fallo intermedio no duplican acciones ni dejan escrituras parciales |
| R3 — Reglas unificadas | Cerrar bypass de ascensión, avance de días y movimiento táctico | Todas las rutas rechazan acciones inválidas y usan el mismo dominio |
| R4 — Partida real | Crear, recuperar, guardar y completar prólogo desde App | Recarga y reinicio conservan el personaje; no existe fixture involuntario |
| R5 — Contratos y errores | Snapshot, mapper somático, calendario correcto, eliminación de éxito ficticio | La UI refleja el estado persistido y explica fallos sin inventar progreso |
| R6 — Recuperación visual | Capas CSS, botones, tipografía, foco y paneles adaptables | Calendario, identidad y mercado son legibles y operables con teclado |
| R7 — Primer recorrido completo | Una investigación conectada con actuación, recursos y regreso | Una persona puede completar la sesión y continuar después |
| R8 — Piloto Phaser | Desván pequeño y una interacción persistente | Mejora observable sin duplicar estado ni perder accesibilidad |
| R9 — Migración por escenas | Extender a tablero/encuentro según resultado del piloto | Cada escena sustituida conserva comportamiento y recuperación |
| R10 — Pulido y expansión | Arte preparado, audio, más contenido y rendimiento | Ampliación basada en recorridos comprobados |

R2 y R3 son reparaciones de dominio; R6 puede prepararse por separado, pero no debe ocultar que una acción sigue sin persistir. Estas son dependencias de trabajo, no una solicitud de delegación a múltiples agentes.

No fijaría todavía una fecha cerrada para la migración completa. El tamaño real se estima después de R7 y del piloto, con datos sobre trabajo de arte, compatibilidad y carga. La estimación anterior basada solo en documentos debe tratarse como preliminar.

## 9. Pruebas que deben bloquear una entrega

| Caso | Resultado exigido |
|---|---|
| Arranque desde dist y base nueva | Migraciones aplicadas y API disponible |
| Crear y continuar partida | La identidad no cambia al recargar |
| Error HTTP o caída de conexión | No aparece éxito ni se incrementa progreso local |
| Reintentar el mismo commandId | Misma respuesta; un único consumo y un único avance |
| Mismo commandId con otro payload | Rechazo explícito |
| Dos comandos con revisión antigua | Conflicto manejado y nueva sincronización |
| Reinicio entre acciones | Identificadores únicos y estado recuperable |
| Fallo tras descontar dinero | Rollback completo, ningún cobro perdido |
| WORK/SOCIALIZE | Tiempo y efectos en anclas/sospecha coinciden con el resultado |
| Día inválido o negativo | Rechazo sin mutación |
| Movimiento fuera de rejilla o sin AP | Rechazo; cero no se convierte en recurso disponible |
| Ascenso sin requisitos | Rechazo por cualquier ruta de entrada |
| Opción inexistente o evento resuelto | Rechazo; no se elige silenciosamente otra opción |
| Estados somáticos del servidor | Todos producen una representación válida |
| Navegar con Tab en cada vista | Se llega a controles visibles y se restaura el foco |
| Caso de investigación | No aparecen pistas no descubiertas por el jugador |
| Compra, regreso y recarga | Inventario y saldo coinciden antes y después |
| Compilación limpia y CI | Mismo procedimiento local y remoto |

Las pruebas visuales deben ejecutarse con navegador funcional y tamaños objetivo. Tomar capturas sirve para revisar presentación; la prueba de jugabilidad requiere realizar acciones y comprobar sus efectos. Las métricas de FPS y carga se introducirán con dispositivo y escenario de referencia, no como porcentajes de calidad inventados.

## 10. Instrucción concreta para el siguiente agente de implementación

> Trabaja sobre el commit auditado o documenta explícitamente los cambios posteriores. Lee esta auditoría y las instrucciones del repositorio. La autorización actual permite revisar arquitectura, UI y reglas de producto; el lore canónico sigue protegido.
>
> Comienza por R1. Reproduce el fallo de npm start y corrige únicamente el empaquetado necesario para arrancar dist con una base nueva y una existente. Conserva los datos canónicos. Entrega el comando de arranque y su resultado comprobado.
>
> Después aborda R2 y R3 mediante cambios pequeños. Convierte las reproducciones relevantes del paquete de evidencia en pruebas de regresión que fallen antes del arreglo y pasen después. No corrijas el resultado esperado para aceptar el defecto.
>
> No conectes la UI real copiando directamente los enums somáticos del backend. Define primero el contrato y su proyección.
>
> Elimina el éxito ficticio del cliente y separa el modo de demostración. No sustituyas una API ausente por una narración favorable.
>
> Cada acción completada debe citar qué estado persistente cambió y cómo se verificó. Distingue compilación, prueba de dominio, prueba de API, prueba de navegador y evaluación humana.
>
> Para la migración visual, empieza con el piloto Phaser después de recuperar una sesión real. No reescribas simultáneamente UI, dominio, almacenamiento y contenido.
>
> Reporta commit, archivos, pruebas ejecutadas, fallos y limitaciones. Mantén la referencia de canon y no declares cerrada una funcionalidad porque existe su componente o pasa una búsqueda de palabras.

## 11. Evidencia y reproducción

El ZIP adjunto contiene scripts de auditoría, resultados JSON, logs seleccionados y estado de CI. No incluye credenciales, partidas reales, node_modules ni una copia adicional del repositorio.

Desde LOTM_SIMULADOR, con las dependencias instaladas:

```bash
npm run build
npm start
```

Para ejecutar la suite en el mismo modo usado en esta auditoría, desde LOTM_SIMULADOR/reborn:

```bash
node --import tsx --test tests/*.test.ts
node --import tsx scripts/check_anti_math_random.ts
node --import tsx scripts/check_diegetic_ui.ts
node --import tsx scripts/lint_tier_g.ts
```

El script reproduce.mjs se ejecuta desde LOTM_SIMULADOR y utiliza una base en memoria:

```bash
node --import tsx /ruta/al/paquete/scripts/reproduce.mjs
```

restart_probe.mjs requiere la ruta absoluta al workspace y una ruta de SQLite **nueva y exclusiva para auditoría**. Ejecutarlo dos veces, en procesos separados, con las mismas rutas. No pasar una partida existente. El script crea únicamente audit_restart_character y ejecuta una acción WORK por proceso.

```bash
node --import tsx /ruta/al/paquete/scripts/restart_probe.mjs /ruta/Proyecto_lotm/LOTM_SIMULADOR /ruta/temporal/audit_restart.sqlite
```

Los scripts son reproducciones de defectos, no una nueva suite de aprobación del producto. Los resultados esperados del commit auditado incluyen errores: el archivo JSON documenta precisamente esos errores.

Capturas históricas consultadas: docs/ui-recovery/evidence/r4/r4_desk_synchronized_evening.png y r4_calendar_morning_reading.png. Referencias gráficas e inventario se interpretan junto al código activo, no como evidencia de un recorrido nuevo.

## 12. Fallos y límites de la auditoría

**Fallos del proyecto:** documentados en F01–F20, con mayor urgencia en el arranque, partida real, éxito ficticio, persistencia y reglas.

**Fallos del entorno:** IPC del lanzador tsx, enumeración de interfaces de red y descarga de Chromium. Se usaron ejecución directa con node y Fastify inject para las comprobaciones de lógica. La prueba interactiva de navegador y las mediciones de rendimiento quedan pendientes.

**Revisión canónica:** se detectaron divergencias internas concretas; no se certifica fidelidad de los 67 archivos a la novela. El contenido permaneció intacto.

**Cambios realizados:** ninguno en el código de aplicación ni en el canon. Se generó evidencia externa al repositorio y se instalaron dependencias en la copia de trabajo. No se creó un commit de implementación ni se hizo push.

**Decisión recomendada:** recuperar primero una partida real y verificable; consolidar reglas y persistencia; corregir el CSS; y adoptar Phaser gradualmente para la presentación espacial. El proyecto puede aprovechar lo ya construido, pero necesita que sus piezas formen una misma experiencia.
