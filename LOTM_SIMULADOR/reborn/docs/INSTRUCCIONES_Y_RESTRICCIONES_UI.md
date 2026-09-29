# Instrucciones y restricciones para la interfaz de Path to Godhood

**Documento 2 de 2**  
**Versión 1.0 | 17 de septiembre de 2026**

Este manual dirige la implementación del plan de recuperación de la UI. El Director lo usa para autorizar y revisar entregas; el agente lo usa para limitar cambios, reunir evidencia y saber cuándo detenerse. Su complemento es `PROMPTS_IMPLEMENTACION_UI_PATH_TO_GODHOOD.docx`, que contiene P00, los once briefs R0–R10 y las órdenes auxiliares listas para copiar.

La dirección aprobada es conservar el RPG web existente y convertir El Desván en una escena interactiva coherente. Se mantienen el motor, las reglas de juego y la Fase 1 abierta. El trabajo avanza mediante entregas comprobables, con aprobación humana entre etapas. Este manual complementa las fuentes originales; no reemplaza `AGENTS.md` ni autoriza modificarlo.

---

## 1. Inicio y documentos necesarios

Primero reúne el repositorio LOTM_SIMULADOR, la Biblia técnica LEGADO v4.0, `AGENTS.md`, el plan de recuperación y los dos documentos operativos. `UI.txt` sirve para contrastar los fragmentos entregados con el código real. No permite arrancar ni certificar por sí solo la aplicación.

Entrega P00 al agente. Si confirma acceso suficiente, entrega R0. En R0 se audita, se ejecutan las verificaciones existentes que sean seguras y se captura el estado actual. No se reescribe la UI. Una vez revisada esa evidencia, puedes aprobar R0 y enviar R1.

R1 produce las composiciones y el contrato visual. Elige una propuesta y aprueba su versión precisa antes de R2. R2 construye los fundamentos, R3 materializa El Desván y R4–R8 conectan los sistemas. R9 integra y verifica; R10 prepara y documenta las pruebas humanas G4. Ninguna etapa autoriza automáticamente la siguiente.

Mantén un solo brief activo. Un brief puede ocupar varias sesiones, pero cada sesión debe permanecer dentro del mismo objetivo. Si el contexto se pierde, usa C04; no ordenes empezar de nuevo ni reejecutar etapas ya aprobadas sin motivo.

---

## 2. Autoridad y resolución de conflictos

La instrucción explícita más reciente del Director gobierna las decisiones del proyecto dentro de los permisos reales del entorno. Después se consultan `AGENTS.md`, la Biblia técnica y constitución, el plan aceptado, este manual, el contrato visual firmado y el brief activo. Ningún documento puede eliminar protecciones de acceso ni facultar al agente a inventar evidencia.

El código y los logs muestran qué existe actualmente; no convierten automáticamente una desviación en una decisión aprobada. Una diferencia entre código y especificación debe registrarse. Una preferencia estética del agente no tiene autoridad para sustituir una composición firmada.

Cuando dos fuentes normativas se contradigan, el agente registra `CONFLICTO_DE_AUTORIDAD` con ambas citas, impacto y pregunta concreta. Detiene únicamente el trabajo afectado. Puede seguir tareas independientes que ya estén autorizadas, pero no declarar completo el brief bloqueado.

### Registro de decisiones

R0 propone `docs/ui-recovery` como carpeta de coordinación. Si existe un directorio equivalente, conserva el existente y registra la equivalencia. Dentro de él se mantienen el registro de aprobaciones, HUMAN_REVIEW, reportes por brief, contrato visual, fichas de activos y manifest de evidencia.

Cada aprobación debe identificar: brief; commit o versión revisada; archivos o evidencias; decisión del Director; fecha; alcance autorizado; pendientes aceptados; siguiente acción. El agente transcribe decisiones recibidas, no las firma. La presencia de una captura, un mensaje sin respuesta o un PASS automatizado no constituye aprobación.

Los estados son NO INICIADO, EN CURSO, BLOQUEADO, LISTO PARA REVISIÓN, RECHAZADO y APROBADO. Sólo el Director cambia LISTO PARA REVISIÓN a APROBADO. La corrección de una entrega rechazada vuelve al mismo brief.

---

## 3. Responsabilidades

| Responsable | Debe hacer | No puede asumir |
| :--- | :--- | :--- |
| **Director** | Elegir composición, aprobar alcance y evidencia, resolver conflictos, coordinar G4 y firmar demo | Que aceptar el plan ya aprueba entregables futuros |
| **Agente implementador** | Inspeccionar, ejecutar el brief, probar, reportar fallos y pedir revisión | Firmar su propia entrega o cambiar de fase |
| **Revisión técnica** | Contrastar diff, criterios y evidencia mediante C01 | Aprobar estéticamente en nombre del Director |
| **Producción de arte** | Entregar activos de fichas aprobadas con procedencia | Crear canon o sustituir la dirección visual |
| **Evaluadores humanos** | Realizar tareas del protocolo G4 y aportar observaciones | Ser reemplazados por agentes o bots |

Estas son funciones del proceso, no una orden de contratar, invitar o crear subagentes. La revisión técnica puede hacerse en otra sesión del mismo agente. Cualquier delegación o comunicación externa necesita autorización propia.

---

## 4. Alcance del producto que se conserva

La fantasía sigue siendo vivir una doble vida Beyonder en Backlund: empleo, deudas e identidad civil conviven con investigación, actuación, corrupción y ascensión. El conocimiento tiene utilidad y riesgo. No se introducen XP, barras genéricas ni un nuevo loop de progresión.

El stack permanece en React, TypeScript y Vite para UI, con Fastify, dominio determinista y SQLite como autoridad de juego. La dirección visual es 2D o 2.5D por capas. No se cambia a Godot, Unity, otra SPA, un canvas total ni Three.js durante esta recuperación.

El slice implementa activamente Fool y Visionary. El catálogo mayor de vías no autoriza expandir su número jugable. Se conservan los seis orígenes ratificados: Escribiente Notarial, Estudiante de Medicina, Corresponsal de Sucesos, Espiritista de Salón, Estibador de Muelles y Detective Privado, con sus tres anclas iniciales. No se sustituyen por plantillas genéricas.

La era permanece POST-LOTM y PRE-COI. Personajes mayores, iglesias o fuerzas latentes no se convierten en NPC o facciones operativas por conveniencia visual. El agente no rellena huecos narrativos con nuevas misiones, diálogos decisivos, objetos, poderes o finales.

---

## 5. Matriz de permisos por archivo

| Área | Regla | Condición adicional |
| :--- | :--- | :--- |
| **`ui/src` de la feature activa** | Editable desde R2 | Enumerar archivos antes de editar |
| **Shell, scene y shared** | Cambios mínimos necesarios | Explicar consumidores afectados y probar regresiones |
| **Assets de UI** | Crear e integrar según ficha | Aprobación visual, procedencia y versión |
| **Tests y harness de UI** | Permitidos en briefs técnicos | Fixtures aislados, no contenido de relleno |
| **Documentación y evidencia** | Permitidas desde R0 | No sobrescribir fuentes originales |
| **`package.json` y lockfile** | Sólo con autorización concreta | Sin upgrades globales ni latest |
| **Configuración CI o auditorías** | Revisión específica previa | No rebajar reglas para hacer pasar builds |
| **`reborn/src/server` y DTOs** | Excepción por C05 | Orden con campos, archivos, compatibilidad y pruebas |
| **`reborn/src/core`** | Fuera del plan UI | Escalar defectos, no parchear indirectamente |
| **Tier G y balance** | Fuera del plan UI | No tocar probabilidades, costes o gating |
| **Tier L y manifest** | Inmutables | No editar, regenerar ni completar |
| **Partidas y bases personales** | No usar en pruebas destructivas | Trabajar con copias o entornos aislados autorizados |

Las rutas legadas `/src` y `reborn/data/canonical` no deben buscarse, recrearse ni reutilizarse. Las rutas de datos del producto siguen `import.meta` y la raíz del paquete; no se introducen heurísticas basadas en el directorio de ejecución.

En R0 y R1 no se modifica código de producción. Crear reportes, referencias o composiciones en la carpeta acordada no equivale a cambiar la aplicación. Una excepción fuera del plan requiere una orden separada; no se obtiene por pegar un prompt de etapa posterior.

---

## 6. Restricciones inviolables de implementación

1. **Tier L se lee y no se modifica.** Un manifest inconsistente se investiga sin regenerarlo.
2. **El balance se consulta en su autoridad actual;** no se replica en React ni se cambia para facilitar una demo.
3. **El estado crítico persiste en el servidor.** Cámara, foco y selección temporal sí pueden residir en memoria de UI.
4. **No se usa `Math.random` en `reborn/src`.** La recuperación tampoco introduce azar cosmético no reproducible; utiliza semilla o patrones deterministas.
5. **Una carencia de contenido se registra y bloquea la ruta afectada.** No se genera una respuesta canónica al vuelo.
6. **Una transición visual no consume recursos, avanza días ni decide resultados por su cuenta.**
7. **Ninguna mutación irreversible se presenta como exitosa antes de confirmar persistencia.**
8. **No se exponen stats mecánicos, fórmulas, porcentajes o resultados ocultos** por pantalla, tooltip, accesibilidad ni atributos reveladores.
9. **No se eliminan pruebas, se amplían tolerancias o se enmascara contenido** para obtener un PASS.
10. **No se presenta arte conceptual, un video simulado o un harness con mocks como juego integrado.**
11. **No se modifica la fase, se aprueba una entrega o se simula una sesión humana desde el agente.**
12. **No se publican demos, se compran assets ni se cambia audiencia, permisos o remotos sin una orden específica.**

---

## 7. Contrato visual y legibilidad

**ESTADO = OBJETO** y **MOMENTO = PROSA** se aplican como reglas funcionales. En reposo, vela, espejo, madera, bolsa y documentos muestran estado mediante materia y comportamiento. La explicación aparece al interactuar o en una escena ceremonial. Las etiquetas ambientales no exceden siete palabras por objeto.

La UI principal no tendrá tarjetas de métricas, pestañas abstractas, pills, banners o iconos genéricos reemplazando objetos. Esta restricción visual no prohíbe usar `button`, `dialog`, `portal` o un componente accesible internamente. Tampoco prohíbe CSS Grid o Flexbox como herramientas de maquetación; prohíbe que la composición parezca una cuadrícula de widgets.

No conviertas las estadísticas ocultas en barras disfrazadas, puntos contables o luces cuyo único propósito sea revelar el mismo número. Un signo físico debe ser interpretable cualitativamente. Para decidir en combate se necesitan acciones posibles, objetivos válidos, peligro y consecuencias conocidas, aunque las fórmulas permanezcan ocultas.

El horror puede afectar reflejos, luz y ambiente, pero nunca hace ilegible una elección, oculta el botón de retorno o altera el hit area. Un usuario debe poder reducir movimiento y reforzar contraste sin obtener información adicional de juego.

### Composición y adaptación

El lienzo lógico es **1920 × 1080**. El viewport principal es **1440 × 900** y también se verifica **1280 × 720**, **1366 × 768**, **1920 × 1080** y **2560 × 1440**. El agente debe demostrar cómo conserva áreas funcionales cuando las proporciones difieren. Una captura bonita sólo en 16:9 no es suficiente.

El arte ambiental puede recortarse; los objetos esenciales no. Un criterio de cover indiscriminado puede cortar controles. El contrato debe definir escala, márgenes y encuadre seguro. Los textos largos de inspección pueden refluír en una capa separada de la transformación de la escena. No se reduce todo el texto hasta hacerlo ilegible para que quepa.

Se conserva desktop-first. Por debajo de 1024 px se mantiene el modo de compatibilidad propuesto, con información clara y acceso al ajuste necesario; no se promete paridad móvil completa. Si se requiere movilidad como objetivo de lanzamiento, será una decisión de alcance independiente.

### Números de presentación y de juego

Los tamaños, z-index, colores, duraciones cosméticas y distancias de foco pertenecen a tokens de UI. Los daños, costes, probabilidades y umbrales de dominio pertenecen al balance del motor. Centralizar tokens no permite copiar números de balance a un archivo de estilos.

La prohibición de estadísticas no significa necesariamente prohibir una fecha o un importe escrito en un recibo. R1 necesita ratificar esa distinción para dinero, cantidades, días y secuencias. Hasta entonces, no se introduce una excepción silenciosa ni se oculta información indispensable para una transacción: se marca el punto como pendiente.

### Arte y sonido

Antes de integrar, cada asset tiene ID, ficha, perspectiva, dimensiones, formato, pivote, variantes, sombra, hit area asociada, procedencia y estado de aprobación. Se conservan candidatos rechazados sólo como evidencia de diseño, sin empaquetarlos en producción.

Una composición generada o ilustrada sirve para elegir dirección, no como sustituto de la app. Para implementar se necesitan las capas separadas y activos consistentes. Los textos interactivos no se hornean en las imágenes. No se usan imágenes sin licencia o permiso comprobable como arte final.

El sonido puede reforzar papel, cuero, vidrio, madera o amenaza; no es el único portador de información crítica. El reproductor respeta permisos del navegador, volumen y desactivación. Si no existe una pista final, se registra; no se inventa que fue escuchada o validada.

---

## 8. Arquitectura y datos

Existe una sola autoridad de navegación. Los objetos envían eventos tipados a la máquina central; no abren ventanas incompatibles mediante booleanos distribuidos. Un estado local para hover o animación es válido si no decide la navegación global ni el estado de juego.

El view model convierte datos confirmados en señales diegéticas mediante mapeos explícitos. El cliente no ejecuta fórmulas de balance ni accede al truth model para elegir qué mostrar. Un método TypeScript del motor descrito en la Biblia no prueba que exista un endpoint REST con ese nombre; R0 debe identificar rutas y contratos reales.

### Mutaciones y recuperación

El orden es elección, confirmación, envío, respuesta persistida, consecuencia visual y retorno. Una animación puede reconocer de inmediato la pulsación sin afirmar que la acción tuvo éxito. Dinero, ascensión, daño, deducciones y turnos no usan éxito optimista.

Deshabilitar el botón evita parte de los dobles clics, pero no garantiza idempotencia de servidor. Una respuesta perdida puede corresponder a una acción ya guardada. En ese caso se reconcilia el snapshot o el estado de transacción antes de reintentar. Si el contrato no permite distinguirlo, se solicita C05. No se agrega una caché local para encubrir el hueco.

Foco, cámara o disposición cosmética de tarjetas pueden ser preferencias de cliente. Pistas descubiertas, relaciones lógicas, inventario, batalla y calendario deben restaurarse desde el servidor. Cualquier distinción nueva debe quedar en el contrato técnico.

### Errores

Un error de carga conserva una salida y el contexto. Un rechazo del motor no debe parecer un timeout. Un resultado incierto no debe etiquetarse como fallo definitivo ni reintentarse automáticamente. Los detalles técnicos van a evidencia o un panel de diagnóstico separado, no al plano diegético.

Fail-loud significa que el hueco es identificable y trazable; no exige destruir toda la sesión ni inventar una frase canónica. Puede utilizarse un estado operativo ya aprobado mientras se conserva el estado del personaje. Si no existe copy aprobado, su elaboración y firma forman parte del bloqueo.

---

## 9. Input y accesibilidad

Todos los objetos esenciales deben alcanzarse mediante Tab/Shift+Tab y activarse mediante Enter o Space según su semántica. Escape cancela o vuelve un nivel y restaura el foco. Las flechas tienen alcance local a la región espacial o rejilla y no interfieren con texto ni controles nativos.

El foco visible debe ser claro con y sin hover. El título HTML no sustituye una etiqueta o descripción accesible. El modo Atención se puede mantener o alternar de acuerdo con el contrato para no depender de una pulsación sostenida permanente.

Se verifican texto al 200%, reduced motion, sonido desactivado y estados distinguibles sin color. El plan propone objetivos cómodos de 44 × 44 píxeles; su tamaño real debe evaluarse después de transformar la escena y evitar regiones solapadas.

El corcho ofrece arrastre, teclado y selección secuencial con puntero sin arrastrar. Los anuncios de estado comunican la misma información que el dibujo, sin descubrir poderes o pistas ocultas. El foco no queda atrapado por overlays decorativos.

Hold-to-Drink conserva el gesto y duración aprobados. Debe cancelar correctamente al soltar, perder foco o recibir pointercancel; no consumir dos veces ni confundir el tiempo del gesto con hesitación. Una alternativa motriz que conserve deliberación requiere diseño y aprobación específica; no se convierte silenciosamente en un clic instantáneo.

---

## 10. Seguridad de trabajo y control Git

Antes de escribir, el agente consulta el estado Git y enumera qué archivos propone cambiar. Conserva cambios preexistentes del usuario. No usa `git add` de todo el repositorio por comodidad ni mezcla modificaciones ajenas en su entrega.

La rama y el remoto deben estar identificados y autorizados. El cierre operativo exige commit y push según `AGENTS.md`, pero esa regla no permite inventar credenciales, cambiar remotos, desactivar protecciones, forzar pushes o saltar revisiones. Si el envío no está permitido, el reporte queda PENDIENTE DE PUSH y el brief no se declara cerrado.

Antes de destrucción, reescritura masiva o migración se requiere autorización específica y testigo recuperable: commit primero, tag después y sólo entonces la operación aprobada. El testigo por sí solo no autoriza borrar. Una refactorización ordinaria debe seguir siendo pequeña y revisable; no elimina carpetas completas como atajo.

En R0 el código de producto permanece intacto. Se puede comitear documentación y evidencia nuevas en el destino autorizado. El hash auditado y el hash que contiene el informe pueden ser distintos; ambos deben quedar identificados. Nunca se usa el hash de un commit anterior como si contuviera una entrega nueva.

Las pruebas de procesos y Kill-9 se ejecutan únicamente contra instancias creadas para pruebas y datos aislados. No se detienen servicios compartidos. No se aplican migraciones a partidas del usuario, no se borra una base para “arreglar” un test y no se publican secretos, tokens o URLs firmadas en reportes.

---

## 11. Rutina obligatoria por sesión

1. **Lee fuentes, brief activo y última aprobación.** Confirma que el objetivo no ha cambiado.
2. **Comprueba entorno, rama y cambios preexistentes.** Registra el commit de partida.
3. **Enumera archivos que tocarás y vínculo de cada uno con el brief.** Para salir del ámbito, solicita C05 antes de editar.
4. **Comprueba dependencias del brief, activos y contrato visual.** No marques como disponible un archivo que no has inspeccionado.
5. **Implementa la unidad más pequeña que permita una prueba jugable completa del objetivo.** No abras varias etapas.
6. **Ejecuta las verificaciones aplicables y captura resultados reales con entorno y comando.**
7. **Recorre la UI funcionando, recoge capturas y prueba errores, cancelación, teclado y recarga.**
8. **Compara con el baseline aprobado.** Explica DELTA e hipótesis causal; no autorices tú mismo nuevas golden images.
9. **Registra fallos, pendientes y HUMAN_REVIEW.** Diferencia no ejecutado de aprobado.
10. **Crea commit y push dentro de los permisos definidos.** Verifica que el commit contiene los cambios descritos.
11. **Entrega reporte y solicita revisión.** Detente antes del siguiente brief.

### Comandos y reproducibilidad

Consulta `package.json` antes de ejecutar scripts. La Biblia enumera `verify:tier-l`, `lint:tier-g`, `lint:determinism`, `audit:diegetic`, `test`, `build:server` y `build:ui`. Son nombres a verificar, no garantía de disponibilidad. Usa `npm` o `npm.cmd` según el entorno observado; no cambies de gestor ni lockfile por iniciativa propia.

No ejecutes una instalación para “hacer funcionar” R0: ese brief la prohíbe. Si falta una dependencia, registra la necesidad y pide autorización. A partir de R2, cualquier dependencia de producción nueva sigue necesitando versión y alcance aprobados. No actualices React, Vite, Tailwind o Node sólo por modernización.

Las rutas de tests y capturas propuestas se adaptan a la estructura real con trazabilidad. Un harness de UI puede usar dobles de red para verificar presentación y fallos; esos tests nunca certifican persistencia real, G3 o G4.

---

## 12. Evidencia y pruebas exigidas

Cada resultado registra brief, commit, build, navegador/versión, viewport, entorno, semilla, escenario y fecha. Para comparar capturas, conserva fuentes cargadas, escala, reloj y animaciones controlados. Los cambios de navegador o sistema operativo pueden necesitar nuevas referencias revisadas, no una tolerancia arbitrariamente mayor.

Las imágenes de revisión muestran la aplicación completa, sin recortar errores fuera de cuadro. Mantén antes/después y diff. El Director debe aprobar la lista exacta antes de reemplazar golden images. Si el código cambió después de las capturas, su aprobación no se transfiere automáticamente a la nueva build.

### Capas de verificación

| Prueba | Demuestra | No demuestra |
| :--- | :--- | :--- |
| **Tipos y unitarias** | Contratos y mapeos bajo entradas probadas | Calidad visual o facilidad de uso |
| **Harness de objetos** | Estados y gestos aislados | Backend real o partida persistente |
| **Integración con servidor** | Flujo de intención y resultado guardado | Comprensión de una persona nueva |
| **E2E en navegador** | Recorrido automatizado y restauración probada | G4 humano o mérito artístico |
| **Comparación de capturas** | Cambios visibles frente a una referencia | Que la referencia sea buena o funcional |
| **Prueba humana** | Dificultades observadas en tareas reales | Cobertura total ni conclusiones estadísticas amplias |

Las cifras históricas de la Biblia, como 136 tests, 67 archivos o 330.46 kB, son antecedentes a contrastar. El reporte nuevo usa los resultados actuales. No reutiliza “136/136 PASS” sin correr esa suite ni afirma un bundle menor a 400 kB mezclando unidades.

### Estados mínimos por superficie

Para todo objeto esencial se prueban reposo, foco, interacción, disponibilidad, motivo de bloqueo, urgencia y cambio reciente cuando apliquen. Para una operación se prueban inicio, cancelación, envío, éxito confirmado, rechazo, conexión perdida, respuesta incierta y reanudación.

La matriz visual cubre los cinco tamaños del plan, franjas del día, tiers somáticos extremos, teclado, movimiento reducido y texto ampliado. Los cruces exactos se registran para controlar el volumen de pruebas. Ninguna combinación se omite silenciosamente; una selección por riesgo necesita quedar aprobada.

---

## 13. Gates y criterios de aceptación

Los gates G1–G5 del proyecto permanecen como autoridad de validación del motor y del slice. V1–V8 son criterios adicionales de UI del plan; no sustituyen G1–G5 ni autorizan inventar G6 o G7 a partir de referencias incompletas.

R0 verifica scripts y procedencia. R1 registra la ratificación pendiente de los umbrales UI. Un presupuesto sin hardware, red, unidad o fuente no puede producir un PASS. Los objetivos de 10–12 semanas y 15–20 minutos son estimaciones de planificación, no resultados verificados.

| Criterio UI | Umbral del plan | Evidencia requerida |
| :--- | :--- | :--- |
| **V1 Composición** | Cero recortes o solapamientos funcionales | Capturas de la matriz acordada |
| **V2 Control** | Todas las acciones críticas por teclado | Tareas completadas y foco restaurado |
| **V3 Diegesis** | Cero stats prohibidos ni dashboard principal | Auditoría y revisión de pantallas reales |
| **V4 Integridad** | Cero éxito irreversible antes de persistir | Integración, fallos y respuestas inciertas |
| **V5 Descubrimiento** | Al menos 2 de 3 testers en las primeras tres tareas | Observaciones por persona y tarea |
| **V6 Retorno** | Los 3 testers regresan desde superficies primarias | Registros de G4 sin asistencia |
| **V7 Interpretación** | Al menos 2 de 3 ordenan los cuatro estados | Tarea de vela y espejo sin números |
| **V8 Referencias** | Ninguna golden cambia sin aprobación y DELTA | Lista aprobada y comparación versionada |

Las pruebas V5–V7 se aplican según su ratificación y el protocolo G4. No se cambian sus umbrales después de ver resultados para facilitar aprobación. Los datos faltantes quedan faltantes.

### Presupuestos pendientes de medición y firma

El plan propone escena crítica comprimida menor a 4 MB, incremento de JavaScript no superior al 15% sin decisión técnica y respuesta perceptible menor a 100 ms. Antes de usarlos se fija qué archivos se incluyen, compresión, escenario, equipo y cómo se mide la respuesta. Se conserva cualquier límite de CI existente más estricto; una propuesta nueva no lo deroga.

Las duraciones de respuesta, objeto, cámara, consecuencia y ambiente son rangos de diseño. Se centralizan y validan perceptualmente. No se confunden con la temporización canónica del Trago ni con tiempos de acciones del calendario.

---

## 14. Guía de revisión por etapa

| Brief | Pregunta que debes poder responder | Evidencia principal |
| :--- | :--- | :--- |
| **R0** | Qué funciona realmente y qué falta | Capturas actuales, logs, inventario y bloqueos |
| **R1** | Qué composición exacta vamos a construir | A/B, contrato elegido y fichas |
| **R2** | La base navega y escala sin conflicto | Harness, coordenadas, teclado y errores |
| **R3** | El Desván respeta la dirección aprobada | Arte final, estados, luz y retorno |
| **R4** | Una acción civil u oculta cambia el estado correcto | Calendario, anclas, actuación y recarga |
| **R5** | Investigar permite deducir sin filtrar secretos | Pistas, hilos, hipótesis y expiración |
| **R6** | Una compra ocurre una vez y persiste | Cancelación, compra y timeout reconciliado |
| **R7** | El combate completo se entiende y se recupera | Turnos, escrutinio, terminales y restauración |
| **R8** | El ritual respeta el motor y la deliberación | Prólogo, puertas, gesto y telemetría |
| **R9** | El conjunto se puede probar con personas | Smoke, accesibilidad, regresión y rendimiento |
| **R10** | Personas reales entienden y juegan el slice | G4, correcciones, retest y firma |

Puedes usar C01 para que el agente confronte una entrega con estos criterios. Su dictamen APROBABLE es una recomendación técnica. Tu aprobación debe citar el commit y la evidencia; no basta con “continúa” si existen varias candidatas o conflictos pendientes.

---

## 15. Bloqueos y solicitudes de cambio

Se bloquea una tarea cuando falta autoridad, contenido canónico, activo necesario, contrato de datos, acceso o evidencia esencial. El reporte describe qué se intentó, qué impide continuar, qué parte no está afectada y cuál es la decisión mínima requerida. Un bloqueo no habilita un fallback silencioso.

HUMAN_REVIEW contiene ID, brief, fuente, descripción, impacto, opciones, recomendación y estado. C05 prepara la solicitud técnica sin implementarla. El Director puede autorizar una excepción acotada con archivos, campos o versión, pruebas y condiciones de recuperación.

El agente no debe preguntar por cada detalle de código si ya está cubierto por el brief. Puede decidir nombres internos, extraer una función o ajustar una prueba dentro del contrato. Debe consultar cambios de producto, alcance, dirección visual, dependencia, persistencia o autoridad.

Si el agente se desvía, usa C03. Primero se preserva el estado y se identifica el diff no autorizado. No ordenes borrar todo ni volver a un tag histórico sin revisar qué se perdería. La recuperación debe ser reversible y respetar el trabajo ajeno.

### Severidad de hallazgos

- **P0:** bloquea juego, pierde o duplica estado, permite una acción indebida o impide completar un flujo crítico.
- **P1:** afecta fuertemente comprensión, acceso o continuidad aunque exista una salida.
- **P2:** es un defecto secundario de acabado sin pérdida funcional.

La clasificación se justifica con un caso reproducible, no sólo con una etiqueta.

Los P0/P1 dentro del alcance de UI se corrigen y retestean antes de firma final. Los que pertenecen al motor se escalan. El Director puede aceptar pendientes acotados, pero no convertir un dato falso o una prueba no ejecutada en PASS.

---

## 16. Conflictos conocidos que R0 debe aclarar

1. `AGENTS.md` identifica manifest v1.1 y la Biblia menciona v2.0. Se inspecciona la autoridad real y se consulta; nunca se regenera el manifest para alinearlo.
2. Hay referencias a G1–G7 y una descripción operativa G1–G5. Sólo se ejecutan gates identificados; no se inventan G6/G7 ni se afirma su cobertura.
3. El plan incluye importes en transacciones y una prohibición de stats mecánicos. R1 debe ratificar la diferencia entre cifras diegéticas y HUD matemático.
4. El recorrido ilustrativo del plan ubica carta y origen en un orden que puede no coincidir con `startPrologue(originId)`. El orden real autorizado del motor manda; la UI no cambia el dominio para ajustarlo a la lista.
5. Los nombres y tratamientos de tiers de la vela no coinciden literalmente entre fragmentos y Biblia. Se acuerda un mapeo único antes de producir variantes finales.
6. La Biblia contiene cifras generales de anclas y a la vez orígenes con tres anclas firmadas. El frontend muestra las realmente asignadas; no corrige cantidades por su cuenta.
7. Un ID de petición en cliente no prueba idempotencia de servidor. R0 identifica garantías reales y posibles huecos contractuales.
8. La UI no debe fingir que toda inspección consume una franja porque al regresar cambie el ambiente. Sólo el motor hace avanzar el tiempo.

Estas precisiones hacen ejecutable el plan sin ampliar producto. Las decisiones no resueltas se conservan visibles y no se imponen mediante este manual.

---

## 17. Protocolo humano G4

El archivo `GATE_G4_HUMAN_TESTING_PROTOCOL.md` gobierna la sesión ciega de 90 minutos con los tres perfiles existentes. R10 prepara materiales y luego espera personas reales. Los bots de G1, capturas o recorridos automatizados no cumplen G4.

El Director coordina disponibilidad y consentimiento. Los registros usan identificadores como Alpha, Beta y Gamma, evitando datos personales innecesarios. No se graba sin autorización. El facilitador sigue el protocolo y anota la asistencia; no transforma una tarea asistida en una tarea completada de forma autónoma.

Se congela build, commit, semillas y partidas. Se observan descubrimiento, retorno, interpretación de estados, decisión, confirmación, teclado y confusión. Los resultados se presentan por persona y tarea, incluyendo abandonos y errores. No se promedian para ocultar un bloqueo.

Después, se aprueban correcciones y se realiza retest focalizado. Una persona que ya conoce la interfaz no vuelve a ser una participante ciega para esa misma tarea. El informe distingue primera exposición y retest y explica DELTA e hipótesis causal.

La firma de la demo exige evidencia suficiente y una decisión explícita del Director. El estado de Fase 1 no cambia automáticamente. Hasta esa decisión, el agente termina con Fase 1 ABIERTA.

---

## 18. Reporte obligatorio de entrega

El reporte mantiene Campo 0, CI, contador N/20 y FALLOS, como exige `AGENTS.md`. No completa un dato ausente con una conjetura. Si no puede obtener el hash que contiene el trabajo, reporta un bloqueo de entrega; no emite un reporte válido ficticio.

El contador N/20 se toma del registro vigente; no se reinicia ni se equipara al número de brief. Si su valor no está disponible, se indica PENDIENTE DE DATO y se pide al Director. Si no hay CI, el reporte distingue verificación local de verificación remota y no inventa una URL.

### Campos que siempre deben aparecer

- **REPORTE DE SESIÓN:** identificador BRIEF-10.VISUAL-Rn y sesión.
- **CAMPO 0 COMMIT:** hash que contiene el trabajo; commit base auditado; rama; estado de push.
- **CI URL Y ESTADO:** enlace real y resultado, o NO EJECUTADA con motivo.
- **CONTADOR DE NOCHES:** N/20 verificado o dato pendiente.
- **OBJETIVO AUTORIZADO:** orden del Director, alcance y criterios aplicables.
- **FUENTES:** versiones y secciones consultadas; conflictos y decisiones que los resolvieron.
- **ARCHIVOS:** ruta, razón del cambio y relación con el brief; cambios ajenos preservados.
- **RESULTADO JUGABLE:** recorrido concreto que se puede reproducir y lo que aún no funciona.
- **VERIFICACIÓN:** comando, entorno, resultado, código de salida y enlace a log por prueba; diferencia entre real, fixture y no ejecutada.
- **CAPTURAS Y DELTA:** identificadores antes/después, viewport y explicación causal de las variaciones; estado de aprobación de referencias.
- **FALLOS E INCIDENCIAS:** cada fallo y reproducción. Si no se detectaron, indicar dónde se buscó y adjuntar evidencia; no escribir sólo “sin errores”.
- **HUMAN_REVIEW:** IDs pendientes, impacto y decisión solicitada.
- **ESTADO:** LISTO PARA REVISIÓN o BLOQUEADO; nunca autoaprobado.
- **FASE:** Fase 1 ABIERTA.

---

## 19. Lista final del Director

Antes de aprobar la demo confirma que has visto El Desván en las cinco resoluciones, los estados de sus objetos y al menos un flujo real por sistema. Confirma que la composición coincide con la elegida y que sus materiales no son placeholders de otra etapa.

Comprueba teclado, retorno, lectura ampliada, movimiento reducido y juego sin audio. La interfaz debe comunicar acciones y peligro aunque no muestre estadísticas. Revisa que las consecuencias no aparezcan antes de la respuesta real y que recargar conserve partida, caso y batalla.

Comprueba los resultados actuales de auditorías y gates, no cifras copiadas de la Biblia. Revisa los fallos preexistentes y los nuevos, los pendientes aceptados y las limitaciones del entorno. Confirma que G4 se realizó con personas y que se retestearon las tareas fallidas.

Firma sólo un commit y paquete de evidencia identificados. Una nueva build que cambia comportamiento o arte requiere revisión de lo afectado. La siguiente fase será una orden distinta, no una frase de cierre del agente.

---

## 20. Fuentes de autoridad del paquete

Este paquete desarrolla `PLAN_DE_RECUPERACION_UI_PATH_TO_GODHOOD.md` (o `PLAN_DE_RECUPERACION_UI.md`), versión 1.0 del 15 de septiembre de 2026, especialmente sus secciones 1, 4, 6, 8–14 y 16.

Conserva las restricciones de `AGENTS.md` MAPA OPERATIVO POST-PURGA v4.0 y de PATH TO GODHOOD BIBLIA TÉCNICA DEL MOTOR LEGADO v4.0. `UI.txt` aporta los fragmentos de interfaz que motivaron el diagnóstico; la ejecución R0 debe contrastarlos con el repositorio real.

Los enlaces técnicos del plan son referencias de consulta. Este manual no impone nuevas versiones de herramientas ni certifica por sí solo conformidad de accesibilidad, rendimiento, gates o calidad jugable.

