# Prompts para implementar la interfaz de Path to Godhood

**Documento 1 de 2**  
**Versión 1.0 | 17 de septiembre de 2026**

Este documento contiene las órdenes completas para ejecutar el plan de recuperación UI aprobado como dirección de trabajo. Empieza con P00 y R0. Ejecuta después un solo brief a la vez, desde R1 hasta R10, y no envíes el siguiente hasta revisar y aprobar la evidencia del anterior. El documento 2, `INSTRUCCIONES_Y_RESTRICCIONES_UI.md`, define las reglas comunes y cómo tomar esas decisiones.

El alcance es la interfaz del vertical slice existente: React, TypeScript, Vite, El Desván, Fool y Visionary. La Fase 1 permanece abierta. Las composiciones, cambios de API, dependencias y criterios numéricos todavía pendientes requieren una aprobación específica; aceptar el plan no equivale a aprobar automáticamente esos entregables futuros.

---

## Cómo usar estos prompts

Adjunta al agente los dos documentos de este paquete, el plan `PLAN_DE_RECUPERACION_UI.md` y las fuentes del proyecto. Dale acceso al repositorio real LOTM_SIMULADOR. `UI.txt` es una referencia parcial; no sustituye al repositorio ni a una build ejecutable.

Copia desde `INICIO DEL PROMPT` hasta `FIN DEL PROMPT`, inclusive. Los prompts principales están completos y repiten las restricciones esenciales para resistir pérdidas de contexto. No necesitas combinar fragmentos. No pegues todos los briefs como una sola orden.

Los identificadores y rutas de documentación propuestos son destinos de trabajo, no archivos que se afirme que ya existen. El agente debe comprobarlos en R0. Si existe un registro equivalente, debe conservar su identidad y documentar el mapeo.

Las órdenes de aprobación del final contienen campos entre corchetes que tú debes completar con evidencia real. Nunca pegues una aprobación con campos vacíos. El resto de los prompts puede copiarse tal como aparece.

---

## Orden de ejecución

| Orden | Prompt | Resultado que revisas antes de continuar |
| :--- | :--- | :--- |
| **Preparación** | **P00** | Fuentes y acceso confirmados sin modificar producto |
| **1** | **R0** | Estado real, capturas y bloqueos identificados |
| **2** | **R1** | Una dirección visual elegida y contrato firmado |
| **3** | **R2** | Escena base, navegación y teclado verificables |
| **4** | **R3** | El Desván completo con arte aprobado |
| **5** | **R4** | Calendario, identidad y actuación conectados |
| **6** | **R5** | Investigación y persistencia del corcho |
| **7** | **R6** | Mercado y transacciones confirmadas |
| **8** | **R7** | Combate táctico completo y restaurable |
| **9** | **R8** | Prólogo y ascensión sin saltos de estado |
| **10** | **R9** | Recorrido integrado, accesibilidad y rendimiento |
| **11** | **R10** | Evaluación humana G4 y correcciones verificadas |

R0 más R1–R10 suman once briefs. Las semanas del plan son estimaciones, no plazos garantizados. Un gate es un criterio de aceptación; un baseline es una referencia capturada; un fixture es un estado controlado de prueba.

---

## P00 Preparar al agente

```text
INICIO DEL PROMPT P00
Vas a implementar la UI de Path to Godhood mediante BRIEF-10.VISUAL-R0 a R10. En esta respuesta sólo confirma que puedes trabajar con las fuentes y explica cómo iniciarás R0; no modifiques archivos ni instales nada.
Lee completos los dos documentos operativos adjuntos, el plan de recuperación, AGENTS.md y la Biblia LEGADO v4.0. Identifica las copias vigentes de la constitución y las instrucciones aplicables al repositorio. No uses decisiones antiguas de otro blueprint para sustituir el RPG web actual.
Comprueba de forma no mutante si tienes acceso al repositorio, su rama y los archivos de configuración. No consideres UI.txt una aplicación ejecutable. Si sólo hay adjuntos de texto, informa que falta el repositorio real y solicita acceso o una copia, sin inventar resultados de build ni rutas verificadas.
Confirma expresamente: Fase 1 abierta; Tier L inmutable; balance y motores core fuera de alcance; Fool y Visionary como vías activas del slice; seis orígenes aprobados; cero Three.js; ESTADO = OBJETO y MOMENTO = PROSA; un brief activo; aprobación humana entre etapas.
Resume la jerarquía de autoridad, el lugar donde consultarás las aprobaciones y el protocolo de parada. La aceptación del plan no constituye aprobación de una imagen, una dependencia, un endpoint ni un cambio de fase. No simules al Director, a un evaluador humano ni a otro agente.
Entrega una lista de fuentes disponibles, fuentes ausentes, accesos comprobados y bloqueos. Finaliza con el estado de preparación para R0. No ejecutes R0 hasta que reciba su prompt.
FIN DEL PROMPT P00
```

---

## R0 Auditar y capturar el estado real

```text
INICIO DEL PROMPT R0
Actúa como responsable de implementación UI de Path to Godhood. Lee las versiones vigentes del manual operativo, AGENTS.md, la Biblia técnica y el plan. Desde R1 verifica la aprobación del brief anterior; R0 sólo requiere su orden de inicio. Inspecciona el código real; no uses un reporte histórico como prueba de ejecución actual.
REGLAS: Fase 1 ABIERTA. Mantén React/TypeScript/Vite, Fool y Visionary, seis orígenes y la era autorizada. Tier L, balance y motores core están fuera de alcance. No Three.js, contenido de relleno ni azar no reproducible. ESTADO = OBJETO; MOMENTO = PROSA; etiquetas de reposo de máximo siete palabras; cero stats mecánicos visibles. Respeta accesibilidad y datos ocultos.
Opera sólo en el brief indicado. Antes de editar, enumera archivos y dependencias; conserva cambios ajenos. No instales, publiques ni cambies API, permisos o referencias aprobadas sin orden específica. Un hueco, conflicto o acceso denegado requiere un bloqueo documentado, nunca un atajo. No crees subagentes ni coordines terceros sin autorización.
MISIÓN: BRIEF-10.VISUAL-R0. Audita la aplicación existente y construye una referencia reproducible. No edites código de producción, estilos, dependencias, lockfiles, backend ni datos canónicos. Puedes crear únicamente documentación y evidencia de auditoría en la carpeta de trabajo acordada.
1. Inspecciona el estado Git sin descartarlo. Identifica rama, commit base, cambios previos y remoto configurado sin exponer credenciales. Lee los scripts de package.json antes de ejecutar comandos; no presupongas que los nombres del plan existen.
2. Verifica dependencias ya instaladas, Node y configuración de arranque. Si falta una instalación o un permiso, registra el bloqueo: este brief no autoriza instalar ni actualizar paquetes.
3. Ejecuta las comprobaciones existentes aplicables: verify:tier-l, lint:tier-g, lint:determinism, audit:diegetic, tipos, tests, build:server y build:ui. Ejecuta G1, G2, G3 y G5 sólo mediante sus scripts reales y sobre datos de prueba aislados. G4 requiere personas; no lo sustituyas por bots. Registra comando, salida, código de retorno y entorno; un script inexistente es NO EJECUTADO.
4. Arranca backend y frontend sólo con una base de prueba autorizada. Recorre todas las vistas y captura los cinco tamaños acordados. Graba un recorrido breve si el entorno lo permite. No uses partidas personales ni publiques una demo en Internet.
5. Contrasta UI.txt con la implementación: anchos y alturas rígidas, superposiciones, objetos pequeños, botones genéricos, hover exclusivo, controles sin semántica, modales, texto mecánico, capas que interceptan clics, ausencia de retorno y errores de consola. Formula riesgos como hipótesis cuando no puedas reproducirlos.
6. Inventaría objetos, endpoints reales, DTOs, activos de arte y sonido, estados y pruebas. Mide el JS con la misma unidad que el presupuesto actual; no mezcles tamaños crudos, gzip, imágenes y suma de chunks.
7. Abre un registro de conflictos: manifest v1.1 frente a v2.0; G1–G5 frente a referencias a G6/G7; cifras monetarias frente a stats; orden real del prólogo; tiers de vela y espejo frente a su dibujo. No los resuelvas editando contenido.
ENTREGA: informe R0, inventario, capturas originales, comandos y logs, lista P0/P1/P2, HUMAN_REVIEW y propuesta acotada de R1. Conserva las capturas como evidencia inicial, no como aprobación estética del diseño actual. Crea el registro de aprobaciones vacío y señala que aún no existe una dirección visual firmada.
ACEPTACIÓN: ninguna modificación de producto; cobertura documentada de lo que sí se pudo ejecutar; trazabilidad de cada hallazgo. Si la build no arranca, entrega auditoría parcial y bloqueo, nunca un PASS. Detente antes de R1.
CIERRE OBLIGATORIO: entrega el reporte del manual con Campo 0 COMMIT real, commit base, CI real o no ejecutada, contador N/20 verificado, archivos, pruebas con logs, capturas, DELTA e hipótesis causal, FALLOS y HUMAN_REVIEW. Commit y push sólo con rama y remoto autorizados; si no se pueden completar, reporta entrega pendiente sin inventar evidencia. Finaliza LISTO PARA REVISIÓN o BLOQUEADO. No te autoapruebes, no ejecutes el siguiente brief y no cambies de fase.
FIN DEL PROMPT R0
```

---

## R1 Diseñar y aprobar la composición

```text
INICIO DEL PROMPT R1
Actúa como responsable de implementación UI de Path to Godhood. Lee las versiones vigentes del manual operativo, AGENTS.md, la Biblia técnica y el plan. Desde R1 verifica la aprobación del brief anterior; R0 sólo requiere su orden de inicio. Inspecciona el código real; no uses un reporte histórico como prueba de ejecución actual.
REGLAS: Fase 1 ABIERTA. Mantén React/TypeScript/Vite, Fool y Visionary, seis orígenes y la era autorizada. Tier L, balance y motores core están fuera de alcance. No Three.js, contenido de relleno ni azar no reproducible. ESTADO = OBJETO; MOMENTO = PROSA; etiquetas de reposo de máximo siete palabras; cero stats mecánicos visibles. Respeta accesibilidad y datos ocultos.
Opera sólo en el brief indicado. Antes de editar, enumera archivos y dependencias; conserva cambios ajenos. No instales, publiques ni cambies API, permisos o referencias aprobadas sin orden específica. Un hueco, conflicto o acceso denegado requiere un bloqueo documentado, nunca un atajo. No crees subagentes ni coordines terceros sin autorización.
MISIÓN: BRIEF-10.VISUAL-R1. Convierte la auditoría aprobada de R0 en un contrato visual y de interacción. No construyas la UI final ni modifiques ui/src, backend, dependencias o balance. Trabaja en documentación, wireframes y composiciones de revisión claramente identificadas.
PRERREQUISITO: verifica la aprobación humana de R0 y sus bloqueos. Si falta la aprobación, informa y espera. Los conflictos que afecten al diseño necesitan resolución expresa antes de congelar el contrato.
1. Diseña dos composiciones A y B del mismo Desván, no dos productos. Usa lienzo lógico 1920 × 1080, perspectiva coherente, pared, mesa, repisa, ventana y escalera. Mantén todos los objetos definidos en el plan y reserva espacio legible para inspecciones.
2. Produce vistas wide, focus e inspection; wireframes de corcho, calendario, libro, papeles, mercado, combate 5 × 7, prólogo y ascensión. Define para cada superficie entrada, acción, cancelación, confirmación, espera, error, consecuencia y retorno.
3. Entrega un moodboard de seis a diez referencias comentadas por composición, material o interacción. No copies pantallas ni presentes arte de terceros como activo del juego. Si no hay imágenes disponibles, registra esa limitación; no inventes referencias vistas.
4. Especifica las capas de arte separables, perspectiva, pivotes, escalas, sombras, regiones activas y variantes. Una imagen completa puede aprobar una composición, pero no reemplaza el paquete de objetos transparentes necesario para implementarla.
5. Define tipografía, tokens, profundidad y movimiento. Usa las propuestas numéricas del plan como punto de partida, no como umbrales ya firmados. Separa las cifras de presentación de las de balance. Confirma cómo se mostrarán dinero, fechas, cantidades y secuencias dentro de la ficción.
6. Diseña teclado, foco visible, Atención con alternativa de alternancia, texto ampliado, sonido con equivalente visual y movimiento reducido. El horror puede alterar la escena, nunca inutilizar controles o lectura.
7. Modela navegación central y transiciones. Documenta el contrato que separa datos confirmados, operaciones pendientes y estado visual. No diseñes costes, rutas de API ni estados que el motor no tenga sin registrarlos como necesidad pendiente.
8. Define la matriz objeto × tier × activo × texto × sonido × interacción. Fija la correspondencia canónica de la vela, espejo y Ruina; distingue INTEGRO y PERDIDO sin confundirlos con niveles de otros sistemas.
ENTREGA: A/B comparables, contrato visual versionado, mapa de flujos, mapa de foco, fichas de activos, matriz de estados, propuesta de dependencias y lista de decisiones del Director. Registra la procedencia de V1–V8 y los presupuestos para su ratificación, sin declararlos aprobados por ti.
ACEPTACIÓN: todo el alcance tiene diseño comprobable; se solicita elegir A o B y resolver los puntos pendientes. No mezcles propuestas. No abras R2 hasta que el Director apruebe una composición y el contrato exacto que la acompaña.
CIERRE OBLIGATORIO: entrega el reporte del manual con Campo 0 COMMIT real, commit base, CI real o no ejecutada, contador N/20 verificado, archivos, pruebas con logs, capturas, DELTA e hipótesis causal, FALLOS y HUMAN_REVIEW. Commit y push sólo con rama y remoto autorizados; si no se pueden completar, reporta entrega pendiente sin inventar evidencia. Finaliza LISTO PARA REVISIÓN o BLOQUEADO. No te autoapruebes, no ejecutes el siguiente brief y no cambies de fase.
FIN DEL PROMPT R1
```

---

## R2 Construir los fundamentos de escena

```text
INICIO DEL PROMPT R2
Actúa como responsable de implementación UI de Path to Godhood. Lee las versiones vigentes del manual operativo, AGENTS.md, la Biblia técnica y el plan. Desde R1 verifica la aprobación del brief anterior; R0 sólo requiere su orden de inicio. Inspecciona el código real; no uses un reporte histórico como prueba de ejecución actual.
REGLAS: Fase 1 ABIERTA. Mantén React/TypeScript/Vite, Fool y Visionary, seis orígenes y la era autorizada. Tier L, balance y motores core están fuera de alcance. No Three.js, contenido de relleno ni azar no reproducible. ESTADO = OBJETO; MOMENTO = PROSA; etiquetas de reposo de máximo siete palabras; cero stats mecánicos visibles. Respeta accesibilidad y datos ocultos.
Opera sólo en el brief indicado. Antes de editar, enumera archivos y dependencias; conserva cambios ajenos. No instales, publiques ni cambies API, permisos o referencias aprobadas sin orden específica. Un hueco, conflicto o acceso denegado requiere un bloqueo documentado, nunca un atajo. No crees subagentes ni coordines terceros sin autorización.
MISIÓN: BRIEF-10.VISUAL-R2. Implementa la base técnica del contrato visual aprobado. Comprueba la firma de R1 y el commit asociado. Reutiliza nombres o archivos existentes cuando cumplan el contrato; no dupliques arquitecturas sólo para reproducir un árbol de carpetas.
ALCANCE: shell y montaje mínimo en ui/src/App.tsx; app, scene, shared y estilos comunes; harness, pruebas y fixtures de UI. Sólo cambia package.json o lockfile si el Director autorizó la dependencia concreta. No reescribas features completos ni el motor.
1. Implementa SceneViewport sobre el escenario lógico 1920 × 1080. Escala de manera uniforme, conserva zonas seguras y transforma las coordenadas del puntero al espacio lógico con la inversa de la misma transformación. Mantén el texto de inspección en una capa que pueda refluír. Recorta sólo decoración.
2. Implementa cámara y presets tipados; tokens de color, fuente, sombras, z-index y movimiento; define un contrato único para objetos interactivos. El elemento clicable será semántico, tendrá nombre accesible y hit area que coincida con el arte.
3. Implementa una máquina central de navegación con estados excluyentes y eventos tipados. Usa las dependencias ya aprobadas o un reducer tipado. No instales XState por tu cuenta. useState local puede controlar detalles efímeros, nunca competir con el router.
4. Soporta Tab y Shift+Tab, Enter y Space, Escape y restauración de foco. Las flechas operan dentro de las regiones espaciales definidas, sin secuestrar lectura ni campos. Un diálogo funcional puede usar portal y gestión modal accesible; su forma visual debe seguir el contrato, no una ventana genérica obligatoria.
5. Separa snapshot confirmado, estado pendiente y presentación. Bloquea doble activación. No confundas desactivar un botón con garantizar idempotencia en el servidor; si falta el contrato, registra HUMAN_REVIEW.
6. Construye harness o Storybook según herramientas aprobadas. Usa fixtures derivados de esquemas y contenido canónico, aislados de producción y rotulados como pruebas. No conviertas estados extremos de test en nuevos estados de juego.
7. Añade pruebas de transición inválida, retorno, coordenadas, foco, carga, error, reduced motion y cinco viewports. Congela reloj y efectos cosméticos sólo en las capturas; conserva una prueba separada de animación real.
ENTREGA: escena base navegable; contrato de hotspots; matriz de estados; tests; capturas candidatas y relación de archivos. Las formas de prueba son admisibles en el harness, pero no se firman como arte final.
ACEPTACIÓN: sin recortes funcionales; recorrido completo por teclado; sin estados modales incompatibles; sin una segunda autoridad de juego. Solicita revisión de R2 y detente antes de R3.
CIERRE OBLIGATORIO: entrega el reporte del manual con Campo 0 COMMIT real, commit base, CI real o no ejecutada, contador N/20 verificado, archivos, pruebas con logs, capturas, DELTA e hipótesis causal, FALLOS y HUMAN_REVIEW. Commit y push sólo con rama y remoto autorizados; si no se pueden completar, reporta entrega pendiente sin inventar evidencia. Finaliza LISTO PARA REVISIÓN o BLOQUEADO. No te autoapruebes, no ejecutes el siguiente brief y no cambies de fase.
FIN DEL PROMPT R2
```

---

## R3 Implementar El Desván como lugar

```text
INICIO DEL PROMPT R3
Actúa como responsable de implementación UI de Path to Godhood. Lee las versiones vigentes del manual operativo, AGENTS.md, la Biblia técnica y el plan. Desde R1 verifica la aprobación del brief anterior; R0 sólo requiere su orden de inicio. Inspecciona el código real; no uses un reporte histórico como prueba de ejecución actual.
REGLAS: Fase 1 ABIERTA. Mantén React/TypeScript/Vite, Fool y Visionary, seis orígenes y la era autorizada. Tier L, balance y motores core están fuera de alcance. No Three.js, contenido de relleno ni azar no reproducible. ESTADO = OBJETO; MOMENTO = PROSA; etiquetas de reposo de máximo siete palabras; cero stats mecánicos visibles. Respeta accesibilidad y datos ocultos.
Opera sólo en el brief indicado. Antes de editar, enumera archivos y dependencias; conserva cambios ajenos. No instales, publiques ni cambies API, permisos o referencias aprobadas sin orden específica. Un hueco, conflicto o acceso denegado requiere un bloqueo documentado, nunca un atajo. No crees subagentes ni coordines terceros sin autorización.
MISIÓN: BRIEF-10.VISUAL-R3. Lleva a producción la composición elegida usando los fundamentos aprobados de R2. Verifica contrato y activos aprobados. Si falta una pieza esencial, registra el hueco; no la sustituyas silenciosamente por gradientes o una tarjeta.
ALCANCE: features/desk, sus objetos, assets de la escena y adaptadores visuales; ajustes mínimos de scene y shared necesarios para integrarlos. No cambies dominios, thresholds ni contratos de servidor.
1. Compón fondo, pared, mesa, primer plano, sombras y luz con la perspectiva firmada. Fondo y objeto no deben contener una copia duplicada del mismo elemento. El arte ampliable debe conservar detalle y el control debe permanecer alineado tras zoom y resize.
2. Integra vela, espejo, grietas, libro, papeles, bolsa, reloj, carta, corcho, cáliz y picaporte. Retira los botones flotantes de Velo, Bazar, Calendario y Guardia únicamente al verificar que la acción equivalente sigue accesible.
3. Conecta los tiers canónicos al estado físico de la vela, azogue y madera. Usa señales de silueta, materia y comportamiento, no sólo color. La Ruina no retrocede; INTEGRO no requiere inventar fisuras clicables. El velo decorativo nunca intercepta input ni altera la legibilidad de controles.
4. Implementa reposo, foco, activación, no disponible con motivo, urgencia y cambio reciente. La urgencia se deriva de datos existentes o reglas de presentación aprobadas; no introduzcas eventos de dominio. No adelantes consecuencias que el servidor no confirmó.
5. Implementa Atención y su alternativa persistente. Puntero, teclado y foco obtienen información equivalente. Inspección y retorno usan la máquina central. El libro o los papeles pueden desplegarse espacialmente sin perder semántica de lectura.
6. Aplica las cuatro franjas del calendario mediante un mapeo documentado; no alteres hora para producir una animación. Las visitas puramente informativas no consumen tiempo. Una escena sólo cambia por estado confirmado o animación cosmética declarada.
7. Limita la inspección de grietas a su región. Un SVG decorativo no puede cubrir toda la mesa como objetivo interactivo. Evita IDs SVG duplicados, keyframes locales repetidos y escalados de hover genéricos.
PRUEBAS: cuatro franjas, todos los tiers, cinco viewports, foco por objeto, Atención, reduced motion, textos ampliados y carga/error. Compara la composición con la imagen aprobada y presenta diferencias concretas.
ENTREGA: Desván implementado, inventario de assets con procedencia y versión, capturas por estado y recorrido de ida y vuelta por objetos. No simules funcionalidades de R4–R8 ausentes; conserva las reales existentes y declara las todavía no integradas.
ACEPTACIÓN: escena coherente, controles esenciales descubiertos y alcanzables, sin cards/pills de dashboard en el plano principal, sin activos provisionales aceptados como finales. Detente para firma de R3.
CIERRE OBLIGATORIO: entrega el reporte del manual con Campo 0 COMMIT real, commit base, CI real o no ejecutada, contador N/20 verificado, archivos, pruebas con logs, capturas, DELTA e hipótesis causal, FALLOS y HUMAN_REVIEW. Commit y push sólo con rama y remoto autorizados; si no se pueden completar, reporta entrega pendiente sin inventar evidencia. Finaliza LISTO PARA REVISIÓN o BLOQUEADO. No te autoapruebes, no ejecutes el siguiente brief y no cambies de fase.
FIN DEL PROMPT R3
```

---

## R4 Conectar calendario identidad y actuación

```text
INICIO DEL PROMPT R4
Actúa como responsable de implementación UI de Path to Godhood. Lee las versiones vigentes del manual operativo, AGENTS.md, la Biblia técnica y el plan. Desde R1 verifica la aprobación del brief anterior; R0 sólo requiere su orden de inicio. Inspecciona el código real; no uses un reporte histórico como prueba de ejecución actual.
REGLAS: Fase 1 ABIERTA. Mantén React/TypeScript/Vite, Fool y Visionary, seis orígenes y la era autorizada. Tier L, balance y motores core están fuera de alcance. No Three.js, contenido de relleno ni azar no reproducible. ESTADO = OBJETO; MOMENTO = PROSA; etiquetas de reposo de máximo siete palabras; cero stats mecánicos visibles. Respeta accesibilidad y datos ocultos.
Opera sólo en el brief indicado. Antes de editar, enumera archivos y dependencias; conserva cambios ajenos. No instales, publiques ni cambies API, permisos o referencias aprobadas sin orden específica. Un hueco, conflicto o acceso denegado requiere un bloqueo documentado, nunca un atajo. No crees subagentes ni coordines terceros sin autorización.
MISIÓN: BRIEF-10.VISUAL-R4. Implementa un tramo real de doble vida mediante almanaque, papeles y libro. Verifica R3 aprobado y utiliza los contratos existentes. No inventes endpoints a partir de nombres de métodos de la Biblia.
ALCANCE: features/calendar, identity y acting; view models del escritorio y cliente API compartido estrictamente necesarios; tests y assets autorizados. Backend sólo mediante una orden separada de cambio de contrato.
1. Implementa cuatro franjas: mañana, tarde, noche y madrugada. Leer, abrir o cerrar no avanza tiempo. Ejecutar la acción y avanzar la franja siguen exactamente la semántica comprobada de la API; evita un doble avance si performSlotAction ya lo hace.
2. Presenta únicamente actividades disponibles. Un conflicto laboral o de agenda debe usar datos verdaderos; no fabriques una previsión de sospecha, deuda o caducidad que el servidor no pueda respaldar.
3. Despliega los papeles con profesión, distrito, carga y tres anclas de origen. Los seis orígenes mantienen sus diferencias. Representa el daño confirmado mediante tratamientos aprobados sin crear reglas de recuperación.
4. Implementa situación, dos o tres opciones canónicas según el contenido recibido, confirmación cuando corresponda, envío, resolución y registro en el libro. Si faltan opciones, aplica fail-loud y HUMAN_REVIEW; no completes la página con respuestas sintéticas.
5. Evita revelar alignment, digestionGain u otros resultados matemáticos de elección, incluidos atributos DOM, tooltips y anuncios accesibles. Si llegan en un DTO que debería filtrarlos, registra el defecto del contrato: esconderlos visualmente no lo soluciona.
6. Renderiza susurros sólo si existen y el motor los habilita. No des una sugerencia de respuesta óptima mediante color ni iconos. Actualiza libro, vela, espejo, bolsa y documentos según la respuesta confirmada.
7. Conserva el orden semanal del motor: alquiler, evaluación de actuación, salario, rotación de mercado, convergencia y decaimiento. La UI puede narrar el resultado, no ejecutar otra versión del tick.
PRUEBAS: lectura sin avance; acción válida; acción rechazada; doble clic; error de red antes y después de enviar; recarga; retorno; turno semanal mediante fixture autorizado; teclado; números/copy prohibidos. Una respuesta incierta exige reconciliar el snapshot antes de reintentar una mutación.
ENTREGA: recorrido mañana → decisión → resultado confirmado → siguiente franja; casos de anclas dañadas; prueba de filtrado de datos y evidencia de persistencia real. Indica cuáles pruebas usan fixtures y cuáles llegan al servidor.
ACEPTACIÓN: ninguna franja consumida dos veces, ninguna actuación resuelta sólo en cliente, ningún metadato prohibido visible. Detente para revisión de R4.
CIERRE OBLIGATORIO: entrega el reporte del manual con Campo 0 COMMIT real, commit base, CI real o no ejecutada, contador N/20 verificado, archivos, pruebas con logs, capturas, DELTA e hipótesis causal, FALLOS y HUMAN_REVIEW. Commit y push sólo con rama y remoto autorizados; si no se pueden completar, reporta entrega pendiente sin inventar evidencia. Finaliza LISTO PARA REVISIÓN o BLOQUEADO. No te autoapruebes, no ejecutes el siguiente brief y no cambies de fase.
FIN DEL PROMPT R4
```

---

## R5 Implementar la investigación

```text
INICIO DEL PROMPT R5
Actúa como responsable de implementación UI de Path to Godhood. Lee las versiones vigentes del manual operativo, AGENTS.md, la Biblia técnica y el plan. Desde R1 verifica la aprobación del brief anterior; R0 sólo requiere su orden de inicio. Inspecciona el código real; no uses un reporte histórico como prueba de ejecución actual.
REGLAS: Fase 1 ABIERTA. Mantén React/TypeScript/Vite, Fool y Visionary, seis orígenes y la era autorizada. Tier L, balance y motores core están fuera de alcance. No Three.js, contenido de relleno ni azar no reproducible. ESTADO = OBJETO; MOMENTO = PROSA; etiquetas de reposo de máximo siete palabras; cero stats mecánicos visibles. Respeta accesibilidad y datos ocultos.
Opera sólo en el brief indicado. Antes de editar, enumera archivos y dependencias; conserva cambios ajenos. No instales, publiques ni cambies API, permisos o referencias aprobadas sin orden específica. Un hueco, conflicto o acceso denegado requiere un bloqueo documentado, nunca un atajo. No crees subagentes ni coordines terceros sin autorización.
MISIÓN: BRIEF-10.VISUAL-R5. Integra el corcho con el Caso 1 El Eco en el Nido Vacío y los contratos reales de investigación. Verifica R4 aprobado. Diseña alrededor de pistas descubiertas, nunca del truth model completo.
ALCANCE: features/investigation, activos aprobados del corcho, adaptadores API de UI, navegación y pruebas afectadas. No edites casos, NPC, gating de vía, caducidades o penalizaciones.
1. Presenta tarjetas de pistas accesibles al personaje. Diferencia evidencia, hipótesis y pistas no colocadas. El contenido aún desconocido no debe aparecer oculto visualmente en el DOM ni en descripciones accesibles.
2. Implementa zoom/pan acotados, recentrar y selección. Ofrece arrastre y un recorrido completo con teclado. Añade también una alternativa de puntero sin arrastrar: seleccionar origen, relación y destino. Mover una tarjeta no equivale a validar una hipótesis.
3. Implementa acusa, explica, localiza y contradice con color más patrón. Previsualiza destino permitido o rechazado y sólo fija la relación lógica cuando el servidor la confirme. Las posiciones cosméticas pueden ser preferencias de UI; las conexiones y deducciones pertenecen al estado persistente del caso.
4. Permite formular, probar y colapsar hipótesis según las reglas existentes. Antes de una acusación irreversible presenta la confirmación aprobada, sin revelar cuál es correcta. Una penalización o pista falsa proviene del motor.
5. Representa los checkpoints 14, 21 y 30 mediante cambios diegéticos basados en el estado confirmado. Maneja fuentes cerradas, caso resuelto y expirado. No reabras un caso desde el cliente.
6. Conserva las diferencias entre Fool y Visionary. El harness puede preparar snapshots autorizados para probar rutas, pero el juego no puede desbloquear una pista saltando sus requisitos.
7. Define restauración al recargar: caso activo, pistas, relaciones e hipótesis. Si la API no persiste una parte crítica, solicita cambio específico; no encubras el hueco con localStorage.
PRUEBAS: descubrir, colocar y conectar; conexión inválida; hipótesis rechazada; expiración; recarga; ausencia de filtración del culpable; cinco viewports; teclado; puntero sin arrastre; hilos distinguibles sin color. Si un endpoint entrega secretos de forma indebida, documenta el bloqueo de contrato.
ENTREGA: recorrido reproducible del Caso 1 por ambas vías con sus diferencias, capturas de relaciones y estado expirado, persistencia comprobada y DELTA visual. No presupongas que una prueba UI vuelve a validar G5; reporta por separado la corrida real del gate.
ACEPTACIÓN: una persona puede conectar y revisar evidencia sin ayuda y con dos modalidades de input; el estado lógico sobrevive a recarga. Detente antes de R6.
CIERRE OBLIGATORIO: entrega el reporte del manual con Campo 0 COMMIT real, commit base, CI real o no ejecutada, contador N/20 verificado, archivos, pruebas con logs, capturas, DELTA e hipótesis causal, FALLOS y HUMAN_REVIEW. Commit y push sólo con rama y remoto autorizados; si no se pueden completar, reporta entrega pendiente sin inventar evidencia. Finaliza LISTO PARA REVISIÓN o BLOQUEADO. No te autoapruebes, no ejecutes el siguiente brief y no cambies de fase.
FIN DEL PROMPT R5
```

---

## R6 Implementar mercado e inventario

```text
INICIO DEL PROMPT R6
Actúa como responsable de implementación UI de Path to Godhood. Lee las versiones vigentes del manual operativo, AGENTS.md, la Biblia técnica y el plan. Desde R1 verifica la aprobación del brief anterior; R0 sólo requiere su orden de inicio. Inspecciona el código real; no uses un reporte histórico como prueba de ejecución actual.
REGLAS: Fase 1 ABIERTA. Mantén React/TypeScript/Vite, Fool y Visionary, seis orígenes y la era autorizada. Tier L, balance y motores core están fuera de alcance. No Three.js, contenido de relleno ni azar no reproducible. ESTADO = OBJETO; MOMENTO = PROSA; etiquetas de reposo de máximo siete palabras; cero stats mecánicos visibles. Respeta accesibilidad y datos ocultos.
Opera sólo en el brief indicado. Antes de editar, enumera archivos y dependencias; conserva cambios ajenos. No instales, publiques ni cambies API, permisos o referencias aprobadas sin orden específica. Un hueco, conflicto o acceso denegado requiere un bloqueo documentado, nunca un atajo. No crees subagentes ni coordines terceros sin autorización.
MISIÓN: BRIEF-10.VISUAL-R6. Conecta carta, bazar, bolsa e inventario con transacciones reales. Verifica R5 aprobado y la decisión documentada sobre importes monetarios visibles. Si esa decisión sigue pendiente, bloquea sólo la presentación y confirmación económica afectada.
ALCANCE: features/market y la superficie de inventario prevista; assets, cliente API, view models y pruebas correspondientes. No agregues comercio, fabricación o tratamientos que el motor no exponga.
1. Transiciona desde la carta al mostrador y conserva el origen de foco para regresar. Expón sólo artículos y acciones disponibles en el catálogo canónico. No fabriques mercancía para rellenar espacios.
2. Representa PRISTINE, DAMAGED y CONTAMINATED mediante las variantes de arte y prosa aprobadas. No recalcules precios, probabilidades ni beneficios usando multiplicadores en el frontend.
3. Presenta descripción, calidad, precio canónico y efecto conocido permitido. Si están aprobadas cifras diegéticas, muéstralas en recibo o documento de compra, no como HUD somático. Evita redondeos monetarios que cambien el coste.
4. Implementa inspeccionar, comprar, cancelar, confirmar, enviar, recibir resultado y volver. Sólo entrega visualmente el objeto, retira monedas o cambia inventario después de la respuesta persistida. No generes recibos ficticios para solicitudes fallidas.
5. Distingue saldo insuficiente, existencia cambiada, rechazo de dominio, pérdida de conexión y resultado incierto. Tras un timeout posterior al envío, consulta estado o transacción antes de reintentar. Si falta idempotencia del servidor, registra el bloqueo y no dupliques automáticamente la compra.
6. Restaura inventario y saldo desde el backend después de recarga. Separa el orden visual de los artículos, que puede ser preferencia de UI, de cantidades y equipamiento canónicos.
7. Carga activos del bazar bajo demanda, reserva dimensiones y conserva una salida disponible durante la carga. El retorno actualiza bolsa, paquete o aviso sólo según datos confirmados.
PRUEBAS: cancelar no muta; compra exitosa única; saldo insuficiente; artículo no disponible; doble activación; timeout ambiguo; recarga; deuda conservada; calidad correcta; teclado; copy numérico aprobado y ausencia de stats prohibidos.
ENTREGA: video o recorrido comprar/no comprar, prueba de una única transacción persistida, capturas del mostrador y errores, listado de activos cargados diferidamente y medición comparable del bundle.
ACEPTACIÓN: ningún objeto o saldo definitivo se muestra antes de confirmación; la compra se conserva y no se duplica al recargar o reintentar. Detente para revisión de R6.
CIERRE OBLIGATORIO: entrega el reporte del manual con Campo 0 COMMIT real, commit base, CI real o no ejecutada, contador N/20 verificado, archivos, pruebas con logs, capturas, DELTA e hipótesis causal, FALLOS y HUMAN_REVIEW. Commit y push sólo con rama y remoto autorizados; si no se pueden completar, reporta entrega pendiente sin inventar evidencia. Finaliza LISTO PARA REVISIÓN o BLOQUEADO. No te autoapruebes, no ejecutes el siguiente brief y no cambies de fase.
FIN DEL PROMPT R6
```

---

## R7 Implementar el combate táctico

```text
INICIO DEL PROMPT R7
Actúa como responsable de implementación UI de Path to Godhood. Lee las versiones vigentes del manual operativo, AGENTS.md, la Biblia técnica y el plan. Desde R1 verifica la aprobación del brief anterior; R0 sólo requiere su orden de inicio. Inspecciona el código real; no uses un reporte histórico como prueba de ejecución actual.
REGLAS: Fase 1 ABIERTA. Mantén React/TypeScript/Vite, Fool y Visionary, seis orígenes y la era autorizada. Tier L, balance y motores core están fuera de alcance. No Three.js, contenido de relleno ni azar no reproducible. ESTADO = OBJETO; MOMENTO = PROSA; etiquetas de reposo de máximo siete palabras; cero stats mecánicos visibles. Respeta accesibilidad y datos ocultos.
Opera sólo en el brief indicado. Antes de editar, enumera archivos y dependencias; conserva cambios ajenos. No instales, publiques ni cambies API, permisos o referencias aprobadas sin orden específica. Un hueco, conflicto o acceso denegado requiere un bloqueo documentado, nunca un atajo. No crees subagentes ni coordines terceros sin autorización.
MISIÓN: BRIEF-10.VISUAL-R7. Conecta el teatro táctico existente a una UI espacial legible y persistente. Verifica R6 aprobado. La rejilla tiene cinco filas y siete columnas; no reconstruyas reglas de combate dentro de React.
ALCANCE: features/combat, assets aprobados, cliente API y navegación de UI, pruebas de integración y restauración. Quedan fuera damage, PA, habilidades, alcance, opacidad y matriz de estados del motor.
1. Renderiza posiciones y estados del snapshot. Usa identidad estable de combatientes y casillas; la deformación artística no debe desalinear el área interactiva.
2. Implementa unidad → acción → objetivo → previsualización permitida → confirmar. Distingue selección visual de ejecución. No añadas un coste de movimiento ni un pronóstico de daño no entregados por contrato.
3. Presenta alcance, objetivos disponibles, impedimentos y orden de turno con lenguaje visual/cualitativo aprobado. Sin HP, PA, porcentajes o números de daño visibles. No sustituyas números por una colección de marcas que revele indirectamente un contador prohibido.
4. Respeta la opacidad del enemigo y SCRUTINIZE. La revelación se ejecuta sólo cuando el motor la confirma. Comprueba también accesibilidad, tooltips y atributos DOM; ocultar visualmente un secreto no basta.
5. Representa STUN, FEAR, FROZEN, BLEED, CORRUPTED, HYPNOTIZED, CONCEALED y EMPOWERED con forma, pose, símbolo o patrón y descripción equivalente. No calcules interacciones entre esos estados en la UI.
6. Conserva un único comando pendiente por batalla. No permitas que una animación termine un turno o aplique daño. Resolver y persistir precede a reproducir consecuencias. Recupera el snapshot después de una desconexión sin reenviar a ciegas el turno.
7. Resuelve victoria, derrota, huida y RAMPAGE_TERMINAL usando salidas reales. El menú de pausa no pausa un servidor por su cuenta. Explica en la UI lo que efectivamente se detiene.
8. Prueba recarga en selección y después de un comando. Ejecuta Kill-9 sólo mediante el harness G3 existente en procesos y base de prueba aislados; jamás mates un servicio compartido o uses una partida personal.
ENTREGA: batalla reproducible completa, escrutinio, estados alterados, al menos las salidas terminales disponibles con fixtures canónicos, prueba de reanudación y capturas de cinco viewports.
ACEPTACIÓN: combate íntegro con mouse y teclado, sin stats prohibidos, sin lógica duplicada y sin pérdida ni repetición del turno. Reporta G3 como ejecutado, fallido o no ejecutado con evidencia; no lo deduzcas de una recarga del navegador. Detente antes de R8.
CIERRE OBLIGATORIO: entrega el reporte del manual con Campo 0 COMMIT real, commit base, CI real o no ejecutada, contador N/20 verificado, archivos, pruebas con logs, capturas, DELTA e hipótesis causal, FALLOS y HUMAN_REVIEW. Commit y push sólo con rama y remoto autorizados; si no se pueden completar, reporta entrega pendiente sin inventar evidencia. Finaliza LISTO PARA REVISIÓN o BLOQUEADO. No te autoapruebes, no ejecutes el siguiente brief y no cambies de fase.
FIN DEL PROMPT R7
```

---

## R8 Implementar prólogo y ascensión

```text
INICIO DEL PROMPT R8
Actúa como responsable de implementación UI de Path to Godhood. Lee las versiones vigentes del manual operativo, AGENTS.md, la Biblia técnica y el plan. Desde R1 verifica la aprobación del brief anterior; R0 sólo requiere su orden de inicio. Inspecciona el código real; no uses un reporte histórico como prueba de ejecución actual.
REGLAS: Fase 1 ABIERTA. Mantén React/TypeScript/Vite, Fool y Visionary, seis orígenes y la era autorizada. Tier L, balance y motores core están fuera de alcance. No Three.js, contenido de relleno ni azar no reproducible. ESTADO = OBJETO; MOMENTO = PROSA; etiquetas de reposo de máximo siete palabras; cero stats mecánicos visibles. Respeta accesibilidad y datos ocultos.
Opera sólo en el brief indicado. Antes de editar, enumera archivos y dependencias; conserva cambios ajenos. No instales, publiques ni cambies API, permisos o referencias aprobadas sin orden específica. Un hueco, conflicto o acceso denegado requiere un bloqueo documentado, nunca un atajo. No crees subagentes ni coordines terceros sin autorización.
MISIÓN: BRIEF-10.VISUAL-R8. Integra onboarding y ceremonias con las máquinas de dominio existentes. Verifica R7 aprobado y el orden del prólogo aclarado en R0. No alteres la secuencia de llamadas para hacerla coincidir con una enumeración ilustrativa del plan.
ALCANCE: features/prologue y ascension, activos ceremoniales, navegación y cliente API de UI, pruebas de esos flujos. No modifiques puertas, probabilidades, ingredientes o progresión.
1. Conserva la elección de los seis orígenes y la aplicación de sus anclas según el motor. Presenta carta del Benefactor, dilema prudencia/curiosidad, pista tutorial, elección críptica y Primer Trago en el orden real permitido.
2. Durante la elección no reveles FOOL/VISIONARY, alineaciones o ventajas numéricas. Usa los nombres y descripciones crípticos canónicos. La interfaz de accesibilidad tampoco puede revelar información adicional.
3. Implementa Hold-to-Drink con la duración aprobada de 3.0 segundos para el Primer Trago según la especificación vigente; comprueba su fuente en el repositorio. No cambies tiempos de otro ritual por analogía. Muestra avance sin porcentaje mecánico.
4. Trata pointerdown, pointerup, pointercancel, pérdida de foco y pestaña oculta. Soltar antes de completar cancela el gesto y no consume poción. Ignora repetición de tecla y evita doble envío. La animación puede reducirse sin eliminar la confirmación ni disparar una bebida instantánea.
5. Conserva presentedAt, confirmedAt y el cálculo canónico de hesitación. No reemplaces hesitación por los 3 segundos del gesto ni uses un reloj de animación como reloj de persistencia. Si la telemetría no permite distinguir accesibilidad, documenta la limitación; no la corrijas en el core.
6. Para ascender S9 a S8, representa las Cinco Puertas: fórmula, ingredientes, digestión completa, preparación y Trago. Hay cuatro preparativos dentro de la cuarta puerta; no confundirlos con cinco objetos independientes ni convertirlos en una lista porcentual.
7. El servidor determina disponibilidad y resultado. No muestres estimatedSuccessRate ni digestión numérica. Tras respuesta, representa éxito o descontrol y su recuperación forense según datos existentes. No omitas fallo para embellecer la demo.
8. El Primer Trago confirmado comienza con corrupción limpia y Ruina Marcado conforme a la fuente vigente. No aplique esos valores desde React; comprueba su proyección visual.
PRUEBAS: gesto interrumpido, completo y duplicado; teclado; reduced motion; recarga antes/después del envío; paso fuera de orden; requisito ausente; éxito y fallo persistentes en fixtures de prueba.
ENTREGA: prólogo completo de ambas vías, ambas ramas de ritual verificables y registros de telemetría preservados. La ascensión tardía se prueba con una partida preparada canónicamente, sin acelerar balance del juego. Detente para revisar R8.
CIERRE OBLIGATORIO: entrega el reporte del manual con Campo 0 COMMIT real, commit base, CI real o no ejecutada, contador N/20 verificado, archivos, pruebas con logs, capturas, DELTA e hipótesis causal, FALLOS y HUMAN_REVIEW. Commit y push sólo con rama y remoto autorizados; si no se pueden completar, reporta entrega pendiente sin inventar evidencia. Finaliza LISTO PARA REVISIÓN o BLOQUEADO. No te autoapruebes, no ejecutes el siguiente brief y no cambies de fase.
FIN DEL PROMPT R8
```

---

## R9 Integrar probar y pulir

```text
INICIO DEL PROMPT R9
Actúa como responsable de implementación UI de Path to Godhood. Lee las versiones vigentes del manual operativo, AGENTS.md, la Biblia técnica y el plan. Desde R1 verifica la aprobación del brief anterior; R0 sólo requiere su orden de inicio. Inspecciona el código real; no uses un reporte histórico como prueba de ejecución actual.
REGLAS: Fase 1 ABIERTA. Mantén React/TypeScript/Vite, Fool y Visionary, seis orígenes y la era autorizada. Tier L, balance y motores core están fuera de alcance. No Three.js, contenido de relleno ni azar no reproducible. ESTADO = OBJETO; MOMENTO = PROSA; etiquetas de reposo de máximo siete palabras; cero stats mecánicos visibles. Respeta accesibilidad y datos ocultos.
Opera sólo en el brief indicado. Antes de editar, enumera archivos y dependencias; conserva cambios ajenos. No instales, publiques ni cambies API, permisos o referencias aprobadas sin orden específica. Un hueco, conflicto o acceso denegado requiere un bloqueo documentado, nunca un atajo. No crees subagentes ni coordines terceros sin autorización.
MISIÓN: BRIEF-10.VISUAL-R9. Verifica el vertical slice integrado y corrige defectos de UI dentro del contrato aprobado. Comprueba R8 aprobado. No conviertas esta fase de pulido en un nuevo rediseño ni cambies contenido o dificultad.
ALCANCE: componentes ya intervenidos, shared/audio/motion/a11y, carga de activos, pruebas y documentación. Justifica cada archivo por un hallazgo reproducido. Instalaciones, cambios de CI y actualizaciones de dependencias requieren orden específica.
1. Ejecuta el recorrido de humo de 15–20 minutos como objetivo de sesión: prólogo en orden real, regreso al Desván, franja, pista, corcho, dilema, compra o rechazo, combate con escrutinio, recarga y regreso. Si el progreso canónico impide ese tiempo, informa duración real y usa escenarios separados; no reduzcas costes ni fuerces desbloqueos.
2. Audita cada objeto y pantalla en los cinco viewports, teclado, foco, texto al 200%, Atención, reduced motion y audio desactivado. Ninguna señal necesaria depende exclusivamente de color, sonido, hover o arrastre.
3. Revisa legibilidad del combate sin números y claridad de confirmaciones. Si no se entiende una decisión, mejora su representación y texto aprobado; no expongas fórmulas ni cambies las reglas.
4. Mezcla audio con controles de ambiente, efectos y música cuando existan. Inicia reproducción conforme a la interacción y permisos del navegador. Cualquier pista faltante se registra; no afirmes que el sonido existe a partir de un import roto.
5. Compara capturas con baselines aprobadas en entorno fijo. Revisa antes/después y diffs sin ampliar tolerancias o enmascarar controles para hacer pasar la prueba. Congelar una llama para screenshot no sustituye probar el movimiento real.
6. Mide JS inicial, chunks, imágenes, audio y respuesta de interacción de forma separada. Usa el hardware, red y límites ratificados en R1. Si no se han ratificado, entrega medidas y solicita decisión; no inventes un PASS de rendimiento.
7. Ejecuta types, linters, audit diegético, tests, builds, E2E y gates de motor aplicables sobre entorno aislado. Diferencia regresiones propias y fallos preexistentes; ambos quedan visibles. Verifica ausencia de errores de consola no resueltos.
8. Corrige P0/P1 de UI, repite pruebas afectadas y reporta DELTA. Un P1 backend se escala; no se cierra con un parche cosmético. Documenta tolerancias y excepciones, nunca omisiones ocultas.
ENTREGA: matriz de pruebas completa, capturas y videos, reporte de rendimiento, fallos restantes y build candidata a G4. No llames G4 a una simulación automática.
ACEPTACIÓN: recorrido real integrado, ningún bloqueo crítico abierto para pruebas humanas y evidencia revisable. Si falta una verificación esencial, marca CANDIDATA BLOQUEADA. Detente antes de R10.
CIERRE OBLIGATORIO: entrega el reporte del manual con Campo 0 COMMIT real, commit base, CI real o no ejecutada, contador N/20 verificado, archivos, pruebas con logs, capturas, DELTA e hipótesis causal, FALLOS y HUMAN_REVIEW. Commit y push sólo con rama y remoto autorizados; si no se pueden completar, reporta entrega pendiente sin inventar evidencia. Finaliza LISTO PARA REVISIÓN o BLOQUEADO. No te autoapruebes, no ejecutes el siguiente brief y no cambies de fase.
FIN DEL PROMPT R9
```

---

## R10 Evaluar con personas y cerrar la entrega

```text
INICIO DEL PROMPT R10
Actúa como responsable de implementación UI de Path to Godhood. Lee las versiones vigentes del manual operativo, AGENTS.md, la Biblia técnica y el plan. Desde R1 verifica la aprobación del brief anterior; R0 sólo requiere su orden de inicio. Inspecciona el código real; no uses un reporte histórico como prueba de ejecución actual.
REGLAS: Fase 1 ABIERTA. Mantén React/TypeScript/Vite, Fool y Visionary, seis orígenes y la era autorizada. Tier L, balance y motores core están fuera de alcance. No Three.js, contenido de relleno ni azar no reproducible. ESTADO = OBJETO; MOMENTO = PROSA; etiquetas de reposo de máximo siete palabras; cero stats mecánicos visibles. Respeta accesibilidad y datos ocultos.
Opera sólo en el brief indicado. Antes de editar, enumera archivos y dependencias; conserva cambios ajenos. No instales, publiques ni cambies API, permisos o referencias aprobadas sin orden específica. Un hueco, conflicto o acceso denegado requiere un bloqueo documentado, nunca un atajo. No crees subagentes ni coordines terceros sin autorización.
MISIÓN: BRIEF-10.VISUAL-R10. Prepara y documenta G4 humano, luego corrige los hallazgos autorizados y presenta la demo para decisión del Director. Requiere R9 aprobado. No declares que tú eres un tester ciego ni inventes observaciones humanas.
ALCANCE: protocolo, formularios, evidencias y correcciones concretas de UI. No contactes, invites o grabes personas por iniciativa propia. El Director coordina los tres perfiles y obtiene su autorización para registrar la sesión.
PRIMERA EJECUCIÓN
1. Lee GATE_G4_HUMAN_TESTING_PROTOCOL.md. Conserva sus tres perfiles y los 90 minutos. Si no está disponible, entrega bloqueo: un resumen del plan no reemplaza el protocolo.
2. Congela commit candidato, build, semillas, datos de prueba, viewports y dispositivos. Prepara partidas limpias independientes y una hoja de incidencias sin datos personales innecesarios.
3. Añade observación UI compatible con el protocolo: objeto descubierto primero, siguiente acción, retorno, interpretación de vela/espejo/grietas, conexión de pistas, teclado y comprensión de confirmaciones. No reveles respuestas durante la prueba ciega.
4. Entrega las tareas y formularios al Director y detente con estado PENDIENTE DE EVIDENCIA HUMANA. No marques G4 PASS porque el paquete esté preparado.
REANUDACIÓN TRAS RECIBIR EVIDENCIA
5. Verifica que los registros corresponden al commit y build congelados. Clasifica cada hallazgo por tarea, persona anonimizada, reproducción y severidad. Separa opinión estética, dificultad intencional y fallo de interacción.
6. Evalúa los umbrales UI ratificados por el Director. Si V5, V6 o V7 no fueron aprobados, presenta resultados descriptivos y pide decisión; no los active retroactivamente. Con tres personas, estos resultados son diagnósticos, no una validación estadística del mercado.
7. Propón correcciones P0/P1 con archivos e impacto. Implementa únicamente las autorizadas; para una ampliación usa una solicitud separada. Repite pruebas automatizadas y capturas, y solicita retest humano de tareas afectadas.
8. Reporta DELTA respecto de la primera corrida, hipótesis causal y lo que sigue fallando. Una persona que ya vio la tarea no constituye otra prueba ciega; etiqueta correctamente el retest.
ENTREGA FINAL: commit candidato, CI y evidencias verificables, matriz por participante/tarea, incidencias resueltas y pendientes, resultados G1–G5 disponibles y solicitud de firma de la demo. La firma de demo y el cierre de Fase 1 son decisiones diferentes.
ACEPTACIÓN: exclusivamente por el Director con evidencia humana suficiente. Nunca conviertas ausencia de respuestas o silencio en aprobación. La Fase 1 continúa ABIERTA salvo una orden posterior explícita de cambio de fase.
CIERRE OBLIGATORIO: entrega el reporte del manual con Campo 0 COMMIT real, commit base, CI real o no ejecutada, contador N/20 verificado, archivos, pruebas con logs, capturas, DELTA e hipótesis causal, FALLOS y HUMAN_REVIEW. Commit y push sólo con rama y remoto autorizados; si no se pueden completar, reporta entrega pendiente sin inventar evidencia. Finaliza LISTO PARA REVISIÓN o BLOQUEADO. No te autoapruebes, no ejecutes el siguiente brief y no cambies de fase.
FIN DEL PROMPT R10
```

---

## Órdenes auxiliares (C01–C07)

### C01 Revisar una entrega sin modificarla

```text
INICIO DEL PROMPT C01
Audita el último brief entregado de Path to Godhood. No implementes cambios, no actualices capturas de referencia y no avances de etapa. Lee su orden autorizada, el manual, AGENTS.md, el contrato visual, el diff y la evidencia.
Identifica el brief y commit exactos. Contrasta cada criterio de aceptación con un archivo, resultado ejecutado, captura o prueba humana. Reproduce las comprobaciones seguras que puedas; las que no puedas ejecutar se marcan NO VERIFICADAS. No aceptes una descripción del agente como evidencia suficiente.
Revisa alcance por archivo, filtración de números/secretos, navegación, retorno, persistencia, pruebas, assets y diferencias visuales. Confirma que los cambios ajenos se preservaron y que el backend y los datos protegidos no fueron editados sin permiso.
Entrega: criterios cumplidos; incumplidos con reproducción; riesgos no probados; bloqueos P0/P1; decisión técnica recomendada APROBABLE, REQUIERE CORRECCIÓN o BLOQUEADO. Sólo el Director aprueba. No redactes en su nombre una firma.
FIN DEL PROMPT C01
```

### C02 Corregir el brief activo

```text
INICIO DEL PROMPT C02
Continúa únicamente la corrección del brief activo de Path to Godhood que figura en el registro. Lee la revisión más reciente y aplica sólo las correcciones aprobadas por el Director. Si existen varias entregas o falta la autorización, solicita identificarla.
Antes de editar, enumera hallazgo, causa comprobada o hipótesis, archivos afectados y prueba que demostrará la corrección. Mantén los límites del brief. No refactorices zonas ajenas, no reduzcas tests, no cambies balance ni actualices golden images automáticamente.
Reproduce el fallo, implementa el cambio mínimo suficiente y prueba el caso fallido más las rutas vecinas. Presenta antes/después, DELTA, resultados y fallos pendientes. Los cambios de diseño necesitan aprobar un nuevo contrato, no esconderse como bugfix.
Cierra con commit y push sólo en la rama y remoto autorizados. Si falta permiso o falla CI, declara entrega pendiente. Solicita una nueva revisión del mismo brief y detente; no abras el siguiente.
FIN DEL PROMPT C02
```

### C03 Detener una desviación

```text
INICIO DEL PROMPT C03
Detén la implementación de Path to Godhood. No borres, reviertas, comitees cambios ajenos ni continúes al siguiente brief. Conserva los archivos y cancela sólo los procesos que tú hayas iniciado si es seguro hacerlo.
Compara tu trabajo con el último brief autorizado, AGENTS.md, el manual y el contrato visual. Enumera cada desviación: archivo, cambio, regla vulnerada, efecto y si todavía no fue confirmado. Diferencia trabajo útil dentro del alcance y trabajo no autorizado.
Propón un plan de recuperación que preserve cambios del usuario y use operaciones reversibles. No lo ejecutes sin la aprobación del Director. Si hace falta modificar historia Git, restaurar datos, cambiar permisos o tocar una ruta protegida, detente y solicita la autorización concreta. Nunca uses force push, reset destructivo o borrado masivo como atajo.
Entrega inventario, evidencia, riesgos y una única siguiente decisión necesaria. Mantén Fase 1 abierta.
FIN DEL PROMPT C03
```

### C04 Reanudar después de perder contexto

```text
INICIO DEL PROMPT C04
Reanuda Path to Godhood sin reiniciar el proyecto. No modifiques archivos en la fase de reconstrucción. Lee los dos documentos operativos, el plan, AGENTS.md, la Biblia, el registro de aprobaciones, el último reporte y el estado Git actual.
Determina cuál fue el último brief aprobado, cuál está activo y qué cambios no están entregados. Verifica hashes y evidencias; no deduzcas una aprobación de que exista un archivo o de que el agente anterior escribió PASS. Señala discrepancias sin reemplazar datos.
Devuelve un resumen: estado confirmado; trabajo pendiente; bloqueos; archivos que no debes tocar; siguiente paso dentro del brief vigente. Si existe una autorización de continuación inequívoca, sigue únicamente ese paso con sus pruebas. Si no existe, espera el prompt correspondiente. No recorra de nuevo tareas cerradas salvo para verificar una dependencia real.
FIN DEL PROMPT C04
```

### C05 Solicitar una excepción técnica

```text
INICIO DEL PROMPT C05
Prepara una solicitud de cambio para la necesidad técnica pendiente del brief activo. No implementes la excepción. Identifica el hueco verificable y por qué el frontend no puede resolverlo dentro de sus límites.
Documenta: necesidad; contrato o dependencia actual; propuesta mínima; alternativas; archivos exactos; nuevos campos o paquetes; compatibilidad; pruebas; riesgo; coste de mantenimiento; efecto sobre bundle, persistencia y determinismo; recuperación segura. No mezcles una ampliación de contenido o balance con un cambio de presentación.
Para un endpoint o DTO, usa nombres reales observados y separa los campos propuestos. Para una dependencia, identifica una versión estable compatible, licencia y razón; no uses latest ni alfa por conveniencia. No asumas que elegir una librería autoriza su instalación.
Finaliza con la pregunta concreta que debe resolver el Director. Hasta que exista orden explícita, continúa sólo tareas independientes ya autorizadas y no declares completo el brief afectado.
FIN DEL PROMPT C05
```

### C06 Aceptar capturas de referencia

```text
INICIO DEL PROMPT C06
Revisa las capturas candidatas del brief activo sin sustituir las golden images. Identifica commit, build, viewport, navegador, fuentes, semilla, reloj y estado de interfaz. Comprueba que la captura salió de la aplicación y no de un mockup generado.
Presenta antes, después y diff; explica cada diferencia intencional y cada diferencia imprevista. Incluye foco, reduced motion y estados extremos relevantes. No enmascares objetos o textos importantes ni amplíes tolerancias para ocultar errores.
Solicita al Director aprobar la lista exacta de imágenes candidatas. Sólo después de recibir esa lista firmada, reemplaza las referencias correspondientes, conserva la trazabilidad anterior y repite la suite. Si cambió el código después de la captura, genera nuevas candidatas y vuelve a solicitar revisión. No apruebes por ti mismo ni hagas avanzar el brief.
FIN DEL PROMPT C06
```

### C07 Producir activos de arte aprobados

```text
INICIO DEL PROMPT C07
Trabaja únicamente en los activos pendientes del brief vigente de Path to Godhood. Lee la composición y las fichas aprobadas de R1. Si no hay una lista concreta de activos autorizados, solicítala antes de producirlos. No edites gameplay ni integres candidatos como finales.
Para cada activo, conserva perspectiva, paleta, luz, escala, pivote, silueta, variantes, transparencia y espacio negativo. Entrega fondo separado de objetos, sombras y efectos cuando la ficha lo requiera. No hornees etiquetas o texto interactivo dentro de una imagen. Un cambio de tier debe respetar el diseño canónico, no inventar otro nivel de corrupción.
Usa arte propio o con procedencia y licencia verificables. Si utilizas generación de imagen, identifica los resultados como candidatos de arte y revísalos visualmente; no son capturas de una UI funcionando. SVG de interacción, tipografía y hit areas deben seguir siendo precisos y editables.
Entrega archivos, dimensiones, formatos, tamaño, transparencias comprobadas, variantes, licencia/procedencia y contacto visual sobre la composición. Un activo faltante queda en HUMAN_REVIEW. Solicita aprobación antes de integrarlo en R3 o en la feature correspondiente. No compres recursos, cambies sus permisos ni contactes artistas sin autorización.
FIN DEL PROMPT C07
```

---

## Órdenes del Director para avanzar

Estos textos son plantillas de autorización humana. Completa los campos con los identificadores reales; no forman parte de lo que un agente puede aprobar por sí solo. Enviar el prompt siguiente sin un registro inequívoco de aprobación debe provocar una pausa, no una inferencia.

### Aprobar un brief
> He revisado BRIEF-10.VISUAL-[R NÚMERO], commit [HASH REAL] y las evidencias [IDENTIFICADORES]. Lo apruebo dentro de su alcance. Pendientes aceptados: [LISTA O NINGUNO]. No autorizo cambios de backend, dependencias, balance, contenido ni fase fuera de lo expresamente registrado. Registra esta decisión. La ejecución del siguiente brief comenzará sólo cuando envíe su prompt.

### Aprobar la dirección visual
> Apruebo la composición [A O B], versión [VERSIÓN], y el contrato visual [RUTA Y HASH]. Apruebo estas fichas, tokens, interacciones y criterios numéricos: [LISTA EXACTA]. No apruebo los restantes. Los conflictos [IDS] quedan resueltos así: [DECISIONES]. Usa esta referencia para R2 y R3; no combines direcciones ni alteres el contrato sin una nueva orden.

### Autorizar una excepción limitada
> Autorizo exclusivamente la solicitud [ID] en el brief [R NÚMERO], para los archivos [RUTAS], el contrato o versión [DETALLE] y las pruebas [LISTA]. Esta autorización no permite otros cambios ni rebaja los gates. Presenta evidencia y plan de recuperación. Detente si aparece una ampliación adicional.

### Aprobar las capturas
> Apruebo como nuevas referencias únicamente las capturas [LISTA DE IDS], obtenidas del commit [HASH], bajo la configuración [ID]. Se aceptan los cambios visuales [LISTA]. Conserva la evidencia previa, actualiza sólo esas referencias y repite las pruebas. No se autorizan máscaras ni nuevas tolerancias.

### Rechazar una entrega
> No apruebo BRIEF-10.VISUAL-[R NÚMERO], commit [HASH]. Debes corregir los hallazgos [IDS] con estos criterios: [LISTA]. No avances al siguiente brief. Usa C02 y conserva las restricciones vigentes. La nueva entrega necesita otra revisión.

### Firmar la demo
> Apruebo la demo diegética del commit [HASH] tras revisar las evidencias G4 [IDS] y los gates [RESULTADOS]. Los pendientes aceptados son [LISTA O NINGUNO]. Esta firma aprueba la demo indicada y no cambia por sí sola el estado de Fase 1. Cualquier cambio de fase requiere una orden separada explícita.

