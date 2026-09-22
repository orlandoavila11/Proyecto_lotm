# Catálogo de prompts para los recursos gráficos de Path to Godhood

**Versión:** 1.0  
**Fecha:** 18 de septiembre de 2026  
**Documento:** 3 de 3  
**Estado del proyecto:** Fase 1 abierta  
**Complemento de:** Plan de producción gráfica (Doc 1) y Manual de herramientas (Doc 2)  

Este catálogo contiene órdenes listas para copiar para imágenes, vectores, preparación, integración y control. Los prompts de **Nano Banana Pro** se envían al generador con sus referencias. Las órdenes de **Krita**, **SVG** o **Antigravity** se entregan al agente o al artista que use esas herramientas. Pedir una cuadrícula exacta o una interfaz completa al generador raster no forma parte de este flujo.

---

## Cómo ejecutar el catálogo

1. **Secuencia inicial:** Ejecutar `GFX00` y `GFX01` antes de producir; después realizar el piloto `GFX02` y `GFX03`.
2. **Autoridad de referencias:** `C0` es la composición aprobada, `S0` la muestra de materiales y `O0` la referencia de los tres objetos piloto. Cuando una referencia se denomina *aprobada*, debe existir una decisión registrada y un archivo concreto; no basta con usar la última imagen generada.
3. **Parámetros:** Cada entrada indica destino, formato propuesto, referencias y dependencias. Las opciones de resolución y proporción se configuran en la herramienta además de copiar el prompt. Los textos ya incluyen las reglas comunes: no hace falta concatenar otro bloque. El ZIP ofrece exactamente el mismo texto en un TXT independiente por orden y sus metadatos en `manifest.json`.
4. **Condiciones y plantillas:** Las entradas condicionales sólo se ejecutan cuando el diseño y el contenido las requieren. Los campos de plantilla se completan con `GFX70`. Una ficha de apariencia faltante no se reemplaza por una suposición. Las ocho pistas y las viñetas narrativas sólo usan información pública o revelada para el estado autorizado.
5. **Criterio de aceptación:** El texto busca reducir ambigüedad y facilitar correcciones; no garantiza una imagen perfecta en el primer intento. Cada salida pasa por preparación y revisión dentro del juego. Los resultados nuevos son candidatos, aunque el generador cumpla la descripción.

---

## Índice de órdenes

| Rango | Función |
| :--- | :--- |
| **GFX00 a GFX04** | Inventario, contrato y composición. |
| **GFX05 a GFX11** | Capas del entorno e iluminación. |
| **GFX12 a GFX29** | Objetos y estados del Desván. |
| **GFX30 a GFX35H** | Superficies e investigación. |
| **GFX36A a GFX36F** | Seis orígenes. |
| **GFX37 a GFX46** | Bazar y combate. |
| **GFX47 a GFX55** | Prólogo y ascensión. |
| **GFX56 a GFX61** | Sistema y contenido variable. |
| **GFX62 a GFX72** | Exportación, automatización, corrección, revisión y tipografía. |

---

## Catálogo detallado de órdenes

### GFX00 Inventario real de recursos
- **Destino:** Antigravity.
- **Salida:** Según contrato.

```text
INICIO DEL PROMPT GFX00
Trabaja en la preparación gráfica de Path to Godhood. Lee las reglas operativas vigentes y conserva cambios existentes, canon y datos ocultos. Si aún no existe contrato visual aprobado, documenta las propuestas sin bloquear el inventario ni tratarlas como decisiones definitivas. Entrega evidencia verificable y no te autoapruebes. Inspecciona el repositorio actual y las fuentes Biblia técnica, UI.txt, AGENTS.md y plan de recuperación UI. Extrae pantallas, once objetos del Desván, estados observables y recursos existentes. Lista por ID canónico los personajes, objetos, habilidades, localizaciones y pistas usados en la porción jugable. Distingue ilustración necesaria, reutilización y construcción SVG o CSS. Registra fuente, visibilidad, dependencia y brief R0 a R10. Señala los conflictos de claves de vela, tiempo, fechas e importes. No uses recuentos históricos como inventario vigente. Entrega production_inventory.json y una lista de decisiones pendientes; no generes imágenes ni cambies código de juego.
FIN DEL PROMPT GFX00
```

---

### GFX01 Contrato visual y prueba de lectura
- **Destino:** Antigravity.
- **Salida:** Según contrato.
- **Depende de:** GFX00.

```text
INICIO DEL PROMPT GFX01
Trabaja en la preparación gráfica de Path to Godhood. Lee las reglas operativas vigentes y conserva cambios existentes, canon y datos ocultos. Si aún no existe contrato visual aprobado, documenta las propuestas sin bloquear el inventario ni tratarlas como decisiones definitivas. Entrega evidencia verificable y no te autoapruebes. Con el inventario vigente redacta art_contract.md. Propón cámara tres cuartos, luz cálida izquierda y relleno frío derecho, paleta del plan, escala lógica 1920 por 1080, capas, pivotes y zonas seguras. Dibuja un bloqueo vectorial sencillo con los once objetos y comprueba que haya sitio para prosa y foco. Separa elecciones propuestas de decisiones ya aprobadas. Define C0 como composición, S0 como materiales y O0 como vela, espejo y libro terminados. Incluye prueba a 1280 por 720 y 2560 por 1440. Presenta el contrato para revisión y conserva los presets wide, desk-left, desk-center, desk-right, wall-board, ritual y combat.
FIN DEL PROMPT GFX01
```

---

### GFX02 Muestra de materiales
- **Destino:** Nano Banana Pro.
- **Salida:** Exploración 2K 4:3; candidata a S0.
- **Depende de:** GFX01.

```text
INICIO DEL PROMPT GFX02
Produce una exploración material para la interfaz de Path to Godhood, ambientada en el Backlund autorizado. Todavía no hay referencias aprobadas. Realismo pictórico contenido y desgaste localizado. Luz cálida desde la izquierda y relleno frío tenue desde la derecha. Sin letras, números, logotipos ni emblemas narrativos inventados. Esta es una exploración inicial, todavía sin maestro aprobado. Crea una muestra material continua, sin rótulos: caoba envejecida, latón mate, papel de fibra marfil, cuero marrón oscuro, cera de sebo y azogue plateado. Presenta seis zonas amplias de material, sin marcos de aplicación, sobre una superficie de trabajo sobria. Muestra rugosidad y bordes reconocibles sin ruido uniforme. Paleta de marrones cálidos, marfil y sombras carbón; acento violeta muy contenido. Cámara ligeramente elevada y una única dirección de luz. No representar personajes ni inventar objetos de lore.
FIN DEL PROMPT GFX02
```

---

### GFX03 Composición del Desván
- **Destino:** Nano Banana Pro.
- **Salida:** 2K 16:9; candidata a C0.
- **Referencias:** S0 candidata o aprobada; bloqueo de GFX01.
- **Depende de:** GFX02.

```text
INICIO DEL PROMPT GFX03
Produce un recurso de pintura digital para la interfaz de Path to Godhood, ambientada en el Backlund autorizado. Sigue las referencias adjuntas de composición y materiales. Realismo pictórico contenido, silueta clara, desgaste localizado y detalle legible al tamaño de juego. Conserva perspectiva y luz del maestro: cálida desde la izquierda de pantalla y relleno frío tenue desde la derecha, salvo una vista plana expresamente indicada. No añadas texto, letras, números, logotipos, controles, estadísticas ni emblemas narrativos inventados. Entrega una sola imagen del recurso solicitado; no una lámina con varias variantes. Explora un desván íntimo con pared, estante, ventana derecha, escalera al fondo y gran mesa de caoba en primer término. Cámara tres cuartos ligeramente elevada, perspectiva moderada. Distribuye once puntos reconocibles: vela, espejo de azogue, una marca de grieta en la mesa, libro, papeles, bolsa de cuero, almanaque con reloj, carta sellada, corcho de investigación, cáliz y acceso a la escalera. Deja separación entre siluetas y zonas tranquilas para lectura superpuesta. El objeto central de trabajo concentra la luz sin ocultar los demás. Papeles y páginas totalmente en blanco. Evita ornamentos que parezcan objetivos pulsables. Esta composición es referencia para separar capas después.
FIN DEL PROMPT GFX03
```

---

### GFX04 Alternativa de composición
- **Destino:** Nano Banana Pro edición.
- **Salida:** 2K 16:9; comparación opcional.
- **Referencias:** candidata GFX03.
- **Depende de:** GFX03.
- **Ejecución condicional:** según diseño, contenido o defecto confirmado.

```text
INICIO DEL PROMPT GFX04
Edita el recurso adjunto de Path to Godhood. Usa la imagen base como autoridad de identidad, cámara, silueta, escala, posición y material, salvo el cambio expresamente pedido. Modifica únicamente ese aspecto; conserva las demás regiones y deja espacio para el texto vivo de la aplicación. Mantén el realismo pictórico contenido del maestro. No añadas letras, números, logotipos, controles ni emblemas narrativos inventados. Entrega una sola variante, sin comparativas dentro de la imagen. Usa la composición candidata adjunta. Reduce la saturación de objetos secundarios y despeja la zona central de lectura sin eliminar ninguno de los once puntos funcionales. Aumenta ligeramente la separación visual entre espejo, libro y vela. Conserva arquitectura, cámara y materiales. No añadas más lámparas, símbolos ni accesorios. El objetivo es comparar claridad espacial con la candidata original; no cambiar la identidad del lugar.
FIN DEL PROMPT GFX04
```

---

### GFX05 Separación de la escena maestra
- **Destino:** Krita y Antigravity.
- **Salida:** Según contrato.
- **Referencias:** C0; S0.
- **Depende de:** GFX03.

```text
INICIO DEL PROMPT GFX05
Trabaja en el lote gráfico indicado de Path to Godhood. Lee el contrato visual vigente y las reglas operativas del proyecto antes de editar. Conserva los cambios existentes, el canon, los datos ocultos y la lógica de dominio. Usa las referencias aprobadas; si falta una entrada obligatoria, registra el bloqueo concreto. Entrega archivos y evidencia verificable. No te autoapruebes ni ejecutes el lote siguiente. Con C0 aprobada construye un maestro de capas: fondo limpio, estante, escalera y puerta, mesa, objetos, sombras, iluminación y primer plano. Identifica qué regiones se extraen y cuáles se reconstruyen con GFX06 y GFX07. Conserva origen de lienzo y escala. Ningún objeto desmontable queda pintado por segunda vez detrás de su capa. Completa superficies ocultas donde el movimiento las revele. Entrega KRA, PNG de cada capa, máscaras y logicalBounds; compara la recomposición con C0 y señala cualquier diferencia no aprobada.
FIN DEL PROMPT GFX05
```

---

### GFX06 Fondo limpio de la habitación
- **Destino:** Nano Banana Pro edición.
- **Salida:** 4K 16:9; preparar maestro 3840 × 2160.
- **Referencias:** C0; máscara de extracción GFX05.
- **Depende de:** GFX05.

```text
INICIO DEL PROMPT GFX06
Edita el recurso adjunto de Path to Godhood. Usa la imagen base como autoridad de identidad, cámara, silueta, escala, posición y material, salvo el cambio expresamente pedido. Modifica únicamente ese aspecto; conserva las demás regiones y deja espacio para el texto vivo de la aplicación. Mantén el realismo pictórico contenido del maestro. No añadas letras, números, logotipos, controles ni emblemas narrativos inventados. Entrega una sola variante, sin comparativas dentro de la imagen. A partir de C0 crea un fondo limpio del mismo desván. Retira mesa de primer término, objetos desmontables y elementos sueltos que tendrán capa propia. Conserva pared, suelo, ventana y arquitectura fija. Reconstruye con continuidad las superficies antes ocultas, siguiendo las mismas líneas de fuga. No inventes otra puerta ni otra ventana. La máscara de extracción adjunta indica las zonas que deben vaciarse; es una guía, no un contorno que deba aparecer en el resultado.
FIN DEL PROMPT GFX06
```

---

### GFX07 Mesa limpia de caoba
- **Destino:** Nano Banana Pro edición.
- **Salida:** 4K 16:9; recorte y alpha en Krita.
- **Referencias:** C0; recorte de mesa.
- **Depende de:** GFX05.

```text
INICIO DEL PROMPT GFX07
Edita el recurso adjunto de Path to Godhood. Usa la imagen base como autoridad de identidad, cámara, silueta, escala, posición y material, salvo el cambio expresamente pedido. Modifica únicamente ese aspecto; conserva las demás regiones y deja espacio para el texto vivo de la aplicación. Mantén el realismo pictórico contenido del maestro. No añadas letras, números, logotipos, controles ni emblemas narrativos inventados. Entrega una sola variante, sin comparativas dentro de la imagen. Extrae visualmente la mesa de C0 y reconstruye su superficie sin objetos, sin sombras de objetos ausentes y sin grietas de estado. Conserva exactamente su contorno, espesor, vetas principales y perspectiva. Deja margen alrededor para separar la silueta. Usa un fondo gris neutro uniforme distinguible de la madera; el alpha se preparará manualmente. No cambiar la mesa por un escritorio nuevo ni introducir herrajes. La variante de Ruina se añadirá como capa independiente.
FIN DEL PROMPT GFX07
```

---

### GFX08 Estante independiente
- **Destino:** Krita.
- **Salida:** Según contrato.
- **Referencias:** C0.
- **Depende de:** GFX05.

```text
INICIO DEL PROMPT GFX08
Trabaja en el lote gráfico indicado de Path to Godhood. Lee el contrato visual vigente y las reglas operativas del proyecto antes de editar. Conserva los cambios existentes, el canon, los datos ocultos y la lógica de dominio. Usa las referencias aprobadas; si falta una entrada obligatoria, registra el bloqueo concreto. Entrega archivos y evidencia verificable. No te autoapruebes ni ejecutes el lote siguiente. Extrae de C0 el estante y sus soportes; retirar adornos que no tengan función aprobada. Trabaja con máscara y retoque sobre el maestro. Mantén las coordenadas originales y separa sombra cuando corresponda. Completa sólo las superficies que pueda revelar el desplazamiento aprobado. Entrega cuerpo RGBA, máscara de oclusión y logicalBounds. Comprueba que no cubra áreas de interacción ni prosa en los cinco tamaños de pantalla. No regeneres toda la habitación para resolver esta capa.
FIN DEL PROMPT GFX08
```

---

### GFX09 Escalera y picaporte
- **Destino:** Krita.
- **Salida:** Según contrato.
- **Referencias:** C0.
- **Depende de:** GFX05.

```text
INICIO DEL PROMPT GFX09
Trabaja en el lote gráfico indicado de Path to Godhood. Lee el contrato visual vigente y las reglas operativas del proyecto antes de editar. Conserva los cambios existentes, el canon, los datos ocultos y la lógica de dominio. Usa las referencias aprobadas; si falta una entrada obligatoria, registra el bloqueo concreto. Entrega archivos y evidencia verificable. No te autoapruebes ni ejecutes el lote siguiente. Extrae de C0 la escalera, el marco del acceso y el picaporte; reservar una región de amenaza visible sin cambiar la arquitectura. Trabaja con máscara y retoque sobre el maestro. Mantén las coordenadas originales y separa sombra cuando corresponda. Completa sólo las superficies que pueda revelar el desplazamiento aprobado. Entrega cuerpo RGBA, máscara de oclusión y logicalBounds. Comprueba que no cubra áreas de interacción ni prosa en los cinco tamaños de pantalla. No regeneres toda la habitación para resolver esta capa.
FIN DEL PROMPT GFX09
```

---

### GFX10 Primer plano y oclusiones
- **Destino:** Krita.
- **Salida:** Según contrato.
- **Referencias:** C0.
- **Depende de:** GFX05.

```text
INICIO DEL PROMPT GFX10
Trabaja en el lote gráfico indicado de Path to Godhood. Lee el contrato visual vigente y las reglas operativas del proyecto antes de editar. Conserva los cambios existentes, el canon, los datos ocultos y la lógica de dominio. Usa las referencias aprobadas; si falta una entrada obligatoria, registra el bloqueo concreto. Entrega archivos y evidencia verificable. No te autoapruebes ni ejecutes el lote siguiente. Extrae de C0 el borde frontal y las oclusiones existentes; no añadir cortinas ni objetos nuevos. Trabaja con máscara y retoque sobre el maestro. Mantén las coordenadas originales y separa sombra cuando corresponda. Completa sólo las superficies que pueda revelar el desplazamiento aprobado. Entrega cuerpo RGBA, máscara de oclusión y logicalBounds. Comprueba que no cubra áreas de interacción ni prosa en los cinco tamaños de pantalla. No regeneres toda la habitación para resolver esta capa.
FIN DEL PROMPT GFX10
```

---

### GFX11 Iluminación según el tiempo
- **Destino:** SVG CSS y Krita.
- **Salida:** Según contrato.
- **Referencias:** C0; S0.
- **Depende de:** GFX06.

```text
INICIO DEL PROMPT GFX11
Trabaja en el lote gráfico indicado de Path to Godhood. Lee el contrato visual vigente y las reglas operativas del proyecto antes de editar. Conserva los cambios existentes, el canon, los datos ocultos y la lógica de dominio. Usa las referencias aprobadas; si falta una entrada obligatoria, registra el bloqueo concreto. Entrega archivos y evidencia verificable. No te autoapruebes ni ejecutes el lote siguiente. Construye mapas de luz independientes para las cuatro franjas de tiempo reales del proyecto. Primero documenta la correspondencia entre claves del dominio y nombres artísticos; no la infieras. Reutiliza la misma habitación. Ajusta relleno, temperatura y luz de ventana sin borrar siluetas. Entrega cuatro presets y una transición reducida a cambio estable cuando se solicite menos movimiento. No avances el tiempo por inspeccionar un objeto. Mantén disponibles los mapas sin hornearlos en cada recurso individual.
FIN DEL PROMPT GFX11
```

---

### GFX12 Vela de sebo
- **Destino:** Nano Banana Pro.
- **Salida:** 2K 1:1; RGBA tras preparación.
- **Referencias:** C0; S0.
- **Depende de:** GFX03.

```text
INICIO DEL PROMPT GFX12
Produce un recurso de pintura digital para la interfaz de Path to Godhood, ambientada en el Backlund autorizado. Sigue las referencias adjuntas de composición y materiales. Realismo pictórico contenido, silueta clara, desgaste localizado y detalle legible al tamaño de juego. Conserva perspectiva y luz del maestro: cálida desde la izquierda de pantalla y relleno frío tenue desde la derecha, salvo una vista plana expresamente indicada. No añadas texto, letras, números, logotipos, controles, estadísticas ni emblemas narrativos inventados. Entrega una sola imagen del recurso solicitado; no una lámina con varias variantes. Una sola vela de sebo usada en un soporte discreto. Cuerpo de cera estable, mecha legible y goterones contenidos. Representa el cuerpo sin llama ni humo para animarlos aparte. No incluir chispas ni adornos. La base debe asentarse en la mesa y conservar espacio para cuatro estados de llama. Presenta el objeto aislado sobre gris neutro uniforme, con margen alrededor y sin una sombra extensa; el recorte y la sombra de contacto se terminarán aparte.
FIN DEL PROMPT GFX12
```

---

### GFX13 Espejo de azogue limpio
- **Destino:** Nano Banana Pro.
- **Salida:** 2K 1:1; RGBA tras preparación.
- **Referencias:** C0; S0.
- **Depende de:** GFX03.

```text
INICIO DEL PROMPT GFX13
Produce un recurso de pintura digital para la interfaz de Path to Godhood, ambientada en el Backlund autorizado. Sigue las referencias adjuntas de composición y materiales. Realismo pictórico contenido, silueta clara, desgaste localizado y detalle legible al tamaño de juego. Conserva perspectiva y luz del maestro: cálida desde la izquierda de pantalla y relleno frío tenue desde la derecha, salvo una vista plana expresamente indicada. No añadas texto, letras, números, logotipos, controles, estadísticas ni emblemas narrativos inventados. Entrega una sola imagen del recurso solicitado; no una lámina con varias variantes. Un solo espejo de azogue con marco sobrio de material aprobado, apoyado de forma estable. Estado LIMPIO: plata clara, reflejo ambiental suave sin persona ni rostro. Plano interior amplio para futuras anomalías. Separa visualmente marco, cristal y soporte; evita reflejar texto, una cámara fotográfica o detalles que revelen contenido narrativo. Presenta el objeto aislado sobre gris neutro uniforme, con margen alrededor y sin una sombra extensa; el recorte y la sombra de contacto se terminarán aparte.
FIN DEL PROMPT GFX13
```

---

### GFX14 Libro de acting cerrado
- **Destino:** Nano Banana Pro.
- **Salida:** 2K 1:1; RGBA tras preparación.
- **Referencias:** C0; S0.
- **Depende de:** GFX03.

```text
INICIO DEL PROMPT GFX14
Produce un recurso de pintura digital para la interfaz de Path to Godhood, ambientada en el Backlund autorizado. Sigue las referencias adjuntas de composición y materiales. Realismo pictórico contenido, silueta clara, desgaste localizado y detalle legible al tamaño de juego. Conserva perspectiva y luz del maestro: cálida desde la izquierda de pantalla y relleno frío tenue desde la derecha, salvo una vista plana expresamente indicada. No añadas texto, letras, números, logotipos, controles, estadísticas ni emblemas narrativos inventados. Entrega una sola imagen del recurso solicitado; no una lámina con varias variantes. Un solo libro de trabajo encuadernado en cuero oscuro, cerrado, con canto gastado y lomo funcional. Cubierta sin título, letras ni símbolos. La silueta permite reconocerlo al tamaño de mesa. Reserva su bisagra para una apertura posterior sin cambiar la encuadernación. Presenta el objeto aislado sobre gris neutro uniforme, con margen alrededor y sin una sombra extensa; el recorte y la sombra de contacto se terminarán aparte.
FIN DEL PROMPT GFX14
```

---

### GFX15 Libro abierto
- **Destino:** Nano Banana Pro edición.
- **Salida:** 2K 4:3.
- **Referencias:** GFX14 aprobado; C0.
- **Depende de:** GFX14.

```text
INICIO DEL PROMPT GFX15
Edita el recurso adjunto de Path to Godhood. Usa la imagen base como autoridad de identidad, cámara, silueta, escala, posición y material, salvo el cambio expresamente pedido. Modifica únicamente ese aspecto; conserva las demás regiones y deja espacio para el texto vivo de la aplicación. Mantén el realismo pictórico contenido del maestro. No añadas letras, números, logotipos, controles ni emblemas narrativos inventados. Entrega una sola variante, sin comparativas dentro de la imagen. Abre el mismo libro de la referencia sobre la mesa, conservando cuero, grosor, escala y perspectiva. Muestra dos páginas en blanco con un canal central discreto, bordes cálidos y fibra fina. Las zonas de lectura deben ser lisas. No generar letras ni garabatos que imiten escritura. Conserva margen completo alrededor; la sombra de contacto se separará en preparación.
FIN DEL PROMPT GFX15
```

---

### GFX16 Papeles de identidad
- **Destino:** Nano Banana Pro.
- **Salida:** 2K 1:1; RGBA tras preparación.
- **Referencias:** C0; S0.
- **Depende de:** GFX03.

```text
INICIO DEL PROMPT GFX16
Produce un recurso de pintura digital para la interfaz de Path to Godhood, ambientada en el Backlund autorizado. Sigue las referencias adjuntas de composición y materiales. Realismo pictórico contenido, silueta clara, desgaste localizado y detalle legible al tamaño de juego. Conserva perspectiva y luz del maestro: cálida desde la izquierda de pantalla y relleno frío tenue desde la derecha, salvo una vista plana expresamente indicada. No añadas texto, letras, números, logotipos, controles, estadísticas ni emblemas narrativos inventados. Entrega una sola imagen del recurso solicitado; no una lámina con varias variantes. Un pequeño conjunto de papeles de identidad del mismo tamaño y material aprobados, con bordes limpios y desgaste discreto. El documento superior está totalmente en blanco. Sin retratos, sellos oficiales inventados, firmas ni símbolos. La composición permite superponer la identidad y sus anclas como texto vivo y regiones independientes. Presenta el objeto aislado sobre gris neutro uniforme, con margen alrededor y sin una sombra extensa; el recorte y la sombra de contacto se terminarán aparte.
FIN DEL PROMPT GFX16
```

---

### GFX17 Bolsa de cuero
- **Destino:** Nano Banana Pro.
- **Salida:** 2K 1:1; RGBA tras preparación.
- **Referencias:** C0; S0.
- **Depende de:** GFX03.

```text
INICIO DEL PROMPT GFX17
Produce un recurso de pintura digital para la interfaz de Path to Godhood, ambientada en el Backlund autorizado. Sigue las referencias adjuntas de composición y materiales. Realismo pictórico contenido, silueta clara, desgaste localizado y detalle legible al tamaño de juego. Conserva perspectiva y luz del maestro: cálida desde la izquierda de pantalla y relleno frío tenue desde la derecha, salvo una vista plana expresamente indicada. No añadas texto, letras, números, logotipos, controles, estadísticas ni emblemas narrativos inventados. Entrega una sola imagen del recurso solicitado; no una lámina con varias variantes. Una sola bolsa pequeña de cuero con cierre de cordón, cerrada y ligeramente deformada por su contenido. Cuero mate, costuras legibles y base estable. No mostrar monedas con denominaciones ni cantidad visible. Mantén espacio para animar el cordón o el gesto de apertura sin cambiar tamaño según la riqueza del personaje. Presenta el objeto aislado sobre gris neutro uniforme, con margen alrededor y sin una sombra extensa; el recorte y la sombra de contacto se terminarán aparte.
FIN DEL PROMPT GFX17
```

---

### GFX18 Almanaque
- **Destino:** Nano Banana Pro.
- **Salida:** 2K 1:1; RGBA tras preparación.
- **Referencias:** C0; S0.
- **Depende de:** GFX03.

```text
INICIO DEL PROMPT GFX18
Produce un recurso de pintura digital para la interfaz de Path to Godhood, ambientada en el Backlund autorizado. Sigue las referencias adjuntas de composición y materiales. Realismo pictórico contenido, silueta clara, desgaste localizado y detalle legible al tamaño de juego. Conserva perspectiva y luz del maestro: cálida desde la izquierda de pantalla y relleno frío tenue desde la derecha, salvo una vista plana expresamente indicada. No añadas texto, letras, números, logotipos, controles, estadísticas ni emblemas narrativos inventados. Entrega una sola imagen del recurso solicitado; no una lámina con varias variantes. Un almanaque de papel de fibra con soporte sobrio, abierto sobre una hoja completamente en blanco. Evita cuadrículas, fechas, letras y números pintados. Área central lisa para el calendario vivo; textura más marcada hacia los bordes. Mostrar su volumen sin inclinar tanto el plano que impida leer la información superpuesta. Presenta el objeto aislado sobre gris neutro uniforme, con margen alrededor y sin una sombra extensa; el recorte y la sombra de contacto se terminarán aparte.
FIN DEL PROMPT GFX18
```

---

### GFX19 Reloj
- **Destino:** Nano Banana Pro.
- **Salida:** 2K 1:1; RGBA tras preparación.
- **Referencias:** C0; S0.
- **Depende de:** GFX03.

```text
INICIO DEL PROMPT GFX19
Produce un recurso de pintura digital para la interfaz de Path to Godhood, ambientada en el Backlund autorizado. Sigue las referencias adjuntas de composición y materiales. Realismo pictórico contenido, silueta clara, desgaste localizado y detalle legible al tamaño de juego. Conserva perspectiva y luz del maestro: cálida desde la izquierda de pantalla y relleno frío tenue desde la derecha, salvo una vista plana expresamente indicada. No añadas texto, letras, números, logotipos, controles, estadísticas ni emblemas narrativos inventados. Entrega una sola imagen del recurso solicitado; no una lámina con varias variantes. Un reloj pequeño de latón opaco con carcasa y esfera vacía. No dibujar agujas, índices, números ni letras: se añadirán como vectores según el contrato de tiempo. Un único objeto sin cadena ornamental que compita con la interacción. Reflejos suaves, silueta reconocible. Presenta el objeto aislado sobre gris neutro uniforme, con margen alrededor y sin una sombra extensa; el recorte y la sombra de contacto se terminarán aparte.
FIN DEL PROMPT GFX19
```

---

### GFX20 Carta sellada
- **Destino:** Nano Banana Pro.
- **Salida:** 2K 1:1; RGBA tras preparación.
- **Referencias:** C0; S0.
- **Depende de:** GFX03.

```text
INICIO DEL PROMPT GFX20
Produce un recurso de pintura digital para la interfaz de Path to Godhood, ambientada en el Backlund autorizado. Sigue las referencias adjuntas de composición y materiales. Realismo pictórico contenido, silueta clara, desgaste localizado y detalle legible al tamaño de juego. Conserva perspectiva y luz del maestro: cálida desde la izquierda de pantalla y relleno frío tenue desde la derecha, salvo una vista plana expresamente indicada. No añadas texto, letras, números, logotipos, controles, estadísticas ni emblemas narrativos inventados. Entrega una sola imagen del recurso solicitado; no una lámina con varias variantes. Un único sobre de papel marfil cerrado con un sello de lacre liso. Sin destinatario, remitente, caligrafía, escudo ni emblema. Papel con pliegues plausibles y un borde fácil de seleccionar. El lacre debe poder separarse como capa. Conservar una gran zona de papel tranquila para el foco y la descripción de la aplicación. Presenta el objeto aislado sobre gris neutro uniforme, con margen alrededor y sin una sombra extensa; el recorte y la sombra de contacto se terminarán aparte.
FIN DEL PROMPT GFX20
```

---

### GFX21 Corcho de investigación
- **Destino:** Nano Banana Pro.
- **Salida:** 2K 1:1; RGBA tras preparación.
- **Referencias:** C0; S0.
- **Depende de:** GFX03.

```text
INICIO DEL PROMPT GFX21
Produce un recurso de pintura digital para la interfaz de Path to Godhood, ambientada en el Backlund autorizado. Sigue las referencias adjuntas de composición y materiales. Realismo pictórico contenido, silueta clara, desgaste localizado y detalle legible al tamaño de juego. Conserva perspectiva y luz del maestro: cálida desde la izquierda de pantalla y relleno frío tenue desde la derecha, salvo una vista plana expresamente indicada. No añadas texto, letras, números, logotipos, controles, estadísticas ni emblemas narrativos inventados. Entrega una sola imagen del recurso solicitado; no una lámina con varias variantes. Un tablero de corcho vacío con marco de madera sobrio. Superficie uniforme y suficientemente clara para tarjetas y hilos. Sin tarjetas, fotos, cuerdas ni alfileres pintados. Conserva las proporciones del lugar reservado en C0. La textura de corcho no debe crear falsos puntos brillantes ni reducir la lectura de las conexiones. Presenta el objeto aislado sobre gris neutro uniforme, con margen alrededor y sin una sombra extensa; el recorte y la sombra de contacto se terminarán aparte.
FIN DEL PROMPT GFX21
```

---

### GFX22 Cáliz
- **Destino:** Nano Banana Pro.
- **Salida:** 2K 1:1; RGBA tras preparación.
- **Referencias:** C0; S0.
- **Depende de:** GFX03.

```text
INICIO DEL PROMPT GFX22
Produce un recurso de pintura digital para la interfaz de Path to Godhood, ambientada en el Backlund autorizado. Sigue las referencias adjuntas de composición y materiales. Realismo pictórico contenido, silueta clara, desgaste localizado y detalle legible al tamaño de juego. Conserva perspectiva y luz del maestro: cálida desde la izquierda de pantalla y relleno frío tenue desde la derecha, salvo una vista plana expresamente indicada. No añadas texto, letras, números, logotipos, controles, estadísticas ni emblemas narrativos inventados. Entrega una sola imagen del recurso solicitado; no una lámina con varias variantes. Un único cáliz ritual de material aprobado, con copa y base estables, sin inscripciones ni símbolos añadidos. Superficie sobria y reflejos controlados. La cavidad está vacía y se distingue del borde. Debe admitir líquido como capa independiente y sostener una animación de aproximación sin variar su forma. No representar ingredientes ni manos. Presenta el objeto aislado sobre gris neutro uniforme, con margen alrededor y sin una sombra extensa; el recorte y la sombra de contacto se terminarán aparte.
FIN DEL PROMPT GFX22
```

---

### GFX23 Cuatro estados de la vela
- **Destino:** SVG CSS y Krita.
- **Salida:** Según contrato.
- **Referencias:** GFX12 aprobado.
- **Depende de:** GFX12.

```text
INICIO DEL PROMPT GFX23
Trabaja en el lote gráfico indicado de Path to Godhood. Lee el contrato visual vigente y las reglas operativas del proyecto antes de editar. Conserva los cambios existentes, el canon, los datos ocultos y la lógica de dominio. Usa las referencias aprobadas; si falta una entrada obligatoria, registra el bloqueo concreto. Entrega archivos y evidencia verificable. No te autoapruebes ni ejecutes el lote siguiente. Antes de dibujar, resuelve la discrepancia de nombres y colores entre Biblia y UI.txt mediante el contrato R1. Los nombres siguientes describen la propuesta de la Biblia, no claves de código confirmadas. Sobre GFX12 crea llama y humo para PLENA, VACILANTE, HUMEANTE y MORIBUNDA. PLENA: llama dorada viva y halo suave; VACILANTE: oscilación naranja; HUMEANTE: llama azulada temblorosa y humo más denso; MORIBUNDA: brasa roja casi extinguida. Mantén pivote en la mecha y área de efecto acotada. Entrega SVG editables, parámetros CSS y cuatro fotogramas estáticos para movimiento reducido. Ratifica el mapeo canónico antes de conectarlo. No encoger el cuerpo de cera al cambiar de estado ni revelar valores mecánicos.
FIN DEL PROMPT GFX23
```

---

### GFX24 Espejo turbio
- **Destino:** Nano Banana Pro edición.
- **Salida:** 2K 1:1; alinear y recortar interior.
- **Referencias:** GFX13 aprobado; máscara interior.
- **Depende de:** GFX13.

```text
INICIO DEL PROMPT GFX24
Edita el recurso adjunto de Path to Godhood. Usa la imagen base como autoridad de identidad, cámara, silueta, escala, posición y material, salvo el cambio expresamente pedido. Modifica únicamente ese aspecto; conserva las demás regiones y deja espacio para el texto vivo de la aplicación. Mantén el realismo pictórico contenido del maestro. No añadas letras, números, logotipos, controles ni emblemas narrativos inventados. Entrega una sola variante, sin comparativas dentro de la imagen. Estado TURBIO: añade un velo gris suave dentro del azogue y sombras discretas en sus bordes; sin figura identificable. Conserva el contorno y soporte de GFX13. Cambia sólo la superficie interior indicada por la máscara de trabajo. No añadas iluminación global distinta. El resultado se compondrá sobre el marco original para fijar píxeles externos; deja una transición interna suave.
FIN DEL PROMPT GFX24
```

---

### GFX25 Espejo ondulante
- **Destino:** Nano Banana Pro edición.
- **Salida:** 2K 1:1; alinear y recortar interior.
- **Referencias:** GFX13 aprobado; máscara interior.
- **Depende de:** GFX13.

```text
INICIO DEL PROMPT GFX25
Edita el recurso adjunto de Path to Godhood. Usa la imagen base como autoridad de identidad, cámara, silueta, escala, posición y material, salvo el cambio expresamente pedido. Modifica únicamente ese aspecto; conserva las demás regiones y deja espacio para el texto vivo de la aplicación. Mantén el realismo pictórico contenido del maestro. No añadas letras, números, logotipos, controles ni emblemas narrativos inventados. Entrega una sola variante, sin comparativas dentro de la imagen. Estado ONDULANTE: el azogue parece líquido, con una deformación suave del reflejo ambiental; no cambia el marco ni aparece un rostro. Conserva el contorno y soporte de GFX13. Cambia sólo la superficie interior indicada por la máscara de trabajo. No añadas iluminación global distinta. El resultado se compondrá sobre el marco original para fijar píxeles externos; deja una transición interna suave.
FIN DEL PROMPT GFX25
```

---

### GFX26 Espejo monstruoso
- **Destino:** Nano Banana Pro edición.
- **Salida:** 2K 1:1; alinear y recortar interior.
- **Referencias:** GFX13 aprobado; máscara interior.
- **Depende de:** GFX13.

```text
INICIO DEL PROMPT GFX26
Edita el recurso adjunto de Path to Godhood. Usa la imagen base como autoridad de identidad, cámara, silueta, escala, posición y material, salvo el cambio expresamente pedido. Modifica únicamente ese aspecto; conserva las demás regiones y deja espacio para el texto vivo de la aplicación. Mantén el realismo pictórico contenido del maestro. No añadas letras, números, logotipos, controles ni emblemas narrativos inventados. Entrega una sola variante, sin comparativas dentro de la imagen. Estado MONSTRUOSO: dentro del azogue aparecen ojos carmesí y formas de tentáculos astrales contenidas; no invaden el marco ni revelan una identidad concreta. Conserva el contorno y soporte de GFX13. Cambia sólo la superficie interior indicada por la máscara de trabajo. No añadas iluminación global distinta. El resultado se compondrá sobre el marco original para fijar píxeles externos; deja una transición interna suave.
FIN DEL PROMPT GFX26
```

---

### GFX27 Cinco niveles de grietas
- **Destino:** SVG y Krita.
- **Salida:** Según contrato.
- **Referencias:** GFX07 aprobado.
- **Depende de:** GFX07.

```text
INICIO DEL PROMPT GFX27
Trabaja en el lote gráfico indicado de Path to Godhood. Lee el contrato visual vigente y las reglas operativas del proyecto antes de editar. Conserva los cambios existentes, el canon, los datos ocultos y la lógica de dominio. Usa las referencias aprobadas; si falta una entrada obligatoria, registra el bloqueo concreto. Entrega archivos y evidencia verificable. No te autoapruebes ni ejecutes el lote siguiente. Sobre GFX07 dibuja cinco máscaras acumulativas de Ruina: INTEGRO sin grietas; MARCADO con una marca inicial; EROSIONADO con ramificaciones de esa misma marca; ROTO con daño más profundo; PERDIDO con deterioro extremo que siga permitiendo reconocer la mesa. No regenerar vetas, contorno o cámara. Las grietas nuevas continúan las anteriores y no cortan zonas de lectura. Entrega máscaras alineadas y una variante estática por nivel; la progresión responde al estado autorizado del dominio, sin valores visibles.
FIN DEL PROMPT GFX27
```

---

### GFX28 Máscaras de interacción
- **Destino:** SVG y Antigravity.
- **Salida:** Según contrato.
- **Referencias:** C0; capas terminadas.
- **Depende de:** GFX05.

```text
INICIO DEL PROMPT GFX28
Trabaja en el lote gráfico indicado de Path to Godhood. Lee el contrato visual vigente y las reglas operativas del proyecto antes de editar. Conserva los cambios existentes, el canon, los datos ocultos y la lógica de dominio. Usa las referencias aprobadas; si falta una entrada obligatoria, registra el bloqueo concreto. Entrega archivos y evidencia verificable. No te autoapruebes ni ejecutes el lote siguiente. Traza las once regiones interactivas reales del Desván en el sistema lógico de la escena. Relaciona cada polígono con su objeto y control semántico. Almanaque y reloj comparten la función de tiempo, aunque tengan subregiones si el diseño lo requiere. Amplía objetivos pequeños sin solapar vecinos; excluye oclusiones. Entrega SVG de depuración, datos de coordenadas, orden de foco y capturas en los cinco tamaños. La máscara no se obtiene simplemente del alpha si éste hace el objetivo difícil de pulsar.
FIN DEL PROMPT GFX28
```

---

### GFX29 Foco y estados de interacción
- **Destino:** SVG CSS y Antigravity.
- **Salida:** Según contrato.
- **Referencias:** S0; objetos aprobados.
- **Depende de:** GFX28.

```text
INICIO DEL PROMPT GFX29
Trabaja en el lote gráfico indicado de Path to Godhood. Lee el contrato visual vigente y las reglas operativas del proyecto antes de editar. Conserva los cambios existentes, el canon, los datos ocultos y la lógica de dominio. Usa las referencias aprobadas; si falta una entrada obligatoria, registra el bloqueo concreto. Entrega archivos y evidencia verificable. No te autoapruebes ni ejecutes el lote siguiente. Define reposo, hover, focus-visible, pulsado, no disponible, cambio reciente y urgencia para los objetos aprobados. Usa luz de borde o sombra localizada y un indicador de foco visible. No generar una imagen completa por estado. Distingue urgencia de selección y bloqueo de error. Con movimiento reducido elimina pulsaciones y mantiene el significado. Entrega tokens y una galería de estados sobre fondos claros y oscuros con etiquetas accesibles; no mostrar controles deshabilitados sin explicar el motivo permitido por el dominio.
FIN DEL PROMPT GFX29
```

---

### GFX30 Papel común para lectura
- **Destino:** Nano Banana Pro.
- **Salida:** 2K 4:3.
- **Referencias:** S0.
- **Depende de:** GFX02.

```text
INICIO DEL PROMPT GFX30
Produce un recurso de pintura digital para la interfaz de Path to Godhood, ambientada en el Backlund autorizado. Sigue las referencias adjuntas de composición y materiales. Realismo pictórico contenido, silueta clara, desgaste localizado y detalle legible al tamaño de juego. Conserva perspectiva y luz del maestro: cálida desde la izquierda de pantalla y relleno frío tenue desde la derecha, salvo una vista plana expresamente indicada. No añadas texto, letras, números, logotipos, controles, estadísticas ni emblemas narrativos inventados. Entrega una sola imagen del recurso solicitado; no una lámina con varias variantes. Vista plana perpendicular de una única hoja de papel marfil envejecido con moderación. Centro casi uniforme y claro; fibra fina y borde sutilmente irregular. Ninguna mancha oscura cruza el área central de lectura. Sin letras, líneas, sellos, pliegues fuertes ni sombra pintada. Fondo neutro fácil de separar. Esta textura se reutilizará para prosa, tarjetas y documentos; no simular una página escrita.
FIN DEL PROMPT GFX30
```

---

### GFX31 Sello de lacre liso
- **Destino:** Nano Banana Pro.
- **Salida:** 2K 1:1; reducir según tamaño real.
- **Referencias:** GFX20 aprobado; S0.
- **Depende de:** GFX20.

```text
INICIO DEL PROMPT GFX31
Produce un recurso de pintura digital para la interfaz de Path to Godhood, ambientada en el Backlund autorizado. Sigue las referencias adjuntas de composición y materiales. Realismo pictórico contenido, silueta clara, desgaste localizado y detalle legible al tamaño de juego. Conserva perspectiva y luz del maestro: cálida desde la izquierda de pantalla y relleno frío tenue desde la derecha, salvo una vista plana expresamente indicada. No añadas texto, letras, números, logotipos, controles, estadísticas ni emblemas narrativos inventados. Entrega una sola imagen del recurso solicitado; no una lámina con varias variantes. Un único sello de lacre de rojo apagado, visto según el plano de la carta aprobada. Borde orgánico sencillo y zona central lisa, sin iniciales, escudos ni símbolos. Brillo suave y pequeñas marcas materiales. Objeto aislado en gris neutro con margen suficiente para extraerlo. Mantener la escala visual del sello de GFX20; no crear una joya metálica.
FIN DEL PROMPT GFX31
```

---

### GFX32 Marcos y superficies adaptables
- **Destino:** SVG y CSS.
- **Salida:** Según contrato.
- **Referencias:** S0; GFX30 aprobado.
- **Depende de:** GFX30.

```text
INICIO DEL PROMPT GFX32
Trabaja en el lote gráfico indicado de Path to Godhood. Lee el contrato visual vigente y las reglas operativas del proyecto antes de editar. Conserva los cambios existentes, el canon, los datos ocultos y la lógica de dominio. Usa las referencias aprobadas; si falta una entrada obligatoria, registra el bloqueo concreto. Entrega archivos y evidencia verificable. No te autoapruebes ni ejecutes el lote siguiente. Construye marcos discretos para papel, ficha y panel de lectura con SVG o border-image según el patrón existente. Preserva esquinas y grosor al cambiar de tamaño; evita estirar una textura completa. Usa el papel GFX30 con centro de contraste estable. Entrega variantes de tamaño que soporten prosa larga, localización y zoom. No introducir tarjetas de dashboard ni adornos que compitan con el mundo. Texto y controles deben seguir siendo elementos semánticos.
FIN DEL PROMPT GFX32
```

---

### GFX33 Ensamblaje del corcho
- **Destino:** Antigravity y SVG.
- **Salida:** Según contrato.
- **Referencias:** GFX21 aprobado; GFX30 aprobado.
- **Depende de:** GFX21, GFX30.

```text
INICIO DEL PROMPT GFX33
Trabaja en el lote gráfico indicado de Path to Godhood. Lee el contrato visual vigente y las reglas operativas del proyecto antes de editar. Conserva los cambios existentes, el canon, los datos ocultos y la lógica de dominio. Usa las referencias aprobadas; si falta una entrada obligatoria, registra el bloqueo concreto. Entrega archivos y evidencia verificable. No te autoapruebes ni ejecutes el lote siguiente. Construye los recursos visuales del corcho usando GFX21, papel común y conexiones vectoriales. Separa evidencia colocada, cajón de pistas sin colocar e hipótesis. Incluye vacío, seleccionado, bloqueado y expirado cuando el dominio los permita. No hornear tarjetas ni hilos en el fondo. Comprueba que textos largos no alteren el punto de anclaje de las conexiones y que exista una lectura accesible del grafo. No añadir inferencias ni revelar relaciones del truth model.
FIN DEL PROMPT GFX33
```

---

### GFX34 Alfileres y cuatro relaciones
- **Destino:** SVG.
- **Salida:** Según contrato.
- **Referencias:** S0.
- **Depende de:** GFX33.

```text
INICIO DEL PROMPT GFX34
Trabaja en el lote gráfico indicado de Path to Godhood. Lee el contrato visual vigente y las reglas operativas del proyecto antes de editar. Conserva los cambios existentes, el canon, los datos ocultos y la lógica de dominio. Usa las referencias aprobadas; si falta una entrada obligatoria, registra el bloqueo concreto. Entrega archivos y evidencia verificable. No te autoapruebes ni ejecutes el lote siguiente. Crea un alfiler reutilizable y cuatro trazos de relación: ACUSA rojo continuo, EXPLICA azul discontinuo, LOCALIZA verde con marca de dirección, CONTRADICE amarillo con doble marca. Ratifica estas formas con el contrato. Construye extremos que se anclen a las tarjetas sin ocultar su texto. Entrega vectores y una muestra en escala de grises; todas las relaciones deben distinguirse por forma además de color. El texto accesible proviene del grafo real, no de la geometría dibujada.
FIN DEL PROMPT GFX34
```

---

### GFX35A Juguetes quemados
- **Destino:** Nano Banana Pro.
- **Salida:** 2K 4:3; ilustración condicional tras descubrimiento.
- **Referencias:** S0; FICHA_PUBLICA_APROBADA de `CLUE_BURNED_TOYS`.
- **Depende de:** GFX33.
- **Ejecución condicional:** según diseño, contenido o defecto confirmado.
- **Completar antes de ejecutar:** `FICHA_PUBLICA_APROBADA`.

```text
INICIO DEL PROMPT GFX35A
Produce un recurso de pintura digital para la interfaz de Path to Godhood, ambientada en el Backlund autorizado. Sigue las referencias adjuntas de composición y materiales. Realismo pictórico contenido, silueta clara, desgaste localizado y detalle legible al tamaño de juego. Conserva perspectiva y luz del maestro: cálida desde la izquierda de pantalla y relleno frío tenue desde la derecha, salvo una vista plana expresamente indicada. No añadas texto, letras, números, logotipos, controles, estadísticas ni emblemas narrativos inventados. Entrega una sola imagen del recurso solicitado; no una lámina con varias variantes. Recurso de la pista CLUE_BURNED_TOYS. Un detalle de juguetes de madera parcialmente quemados, aislados sobre una superficie neutra. Mostrar material carbonizado y formas reconocibles sin reconstruir un incendio, víctimas o culpables. Encuadre de detalle sobrio, adecuado a una tarjeta de investigación. Usa sólo la ficha pública aprobada adjunta y respeta su nivel de revelación. Si la pista no aparece ilustrada en el diseño aprobado, omite esta generación.
FIN DEL PROMPT GFX35A
```

---

### GFX35B Borrador de testamento
- **Destino:** Nano Banana Pro.
- **Salida:** 2K 4:3; ilustración condicional tras descubrimiento.
- **Referencias:** S0; FICHA_PUBLICA_APROBADA de `CLUE_WILL_DRAFT`.
- **Depende de:** GFX33.
- **Ejecución condicional:** según diseño, contenido o defecto confirmado.
- **Completar antes de ejecutar:** `FICHA_PUBLICA_APROBADA`.

```text
INICIO DEL PROMPT GFX35B
Produce un recurso de pintura digital para la interfaz de Path to Godhood, ambientada en el Backlund autorizado. Sigue las referencias adjuntas de composición y materiales. Realismo pictórico contenido, silueta clara, desgaste localizado y detalle legible al tamaño de juego. Conserva perspectiva y luz del maestro: cálida desde la izquierda de pantalla y relleno frío tenue desde la derecha, salvo una vista plana expresamente indicada. No añadas texto, letras, números, logotipos, controles, estadísticas ni emblemas narrativos inventados. Entrega una sola imagen del recurso solicitado; no una lámina con varias variantes. Recurso de la pista CLUE_WILL_DRAFT. Un documento legal antiguo con hojas y pliegues sobrios. Todo el papel está en blanco; el texto legal lo dibuja la aplicación. No añadir nombres, firmas, sellos ni cláusulas visibles. Encuadre de detalle sobrio, adecuado a una tarjeta de investigación. Usa sólo la ficha pública aprobada adjunta y respeta su nivel de revelación. Si la pista no aparece ilustrada en el diseño aprobado, omite esta generación.
FIN DEL PROMPT GFX35B
```

---

### GFX35C Rastros mentales
- **Destino:** Nano Banana Pro.
- **Salida:** 2K 4:3; ilustración condicional tras descubrimiento.
- **Referencias:** S0; FICHA_PUBLICA_APROBADA de `CLUE_MIND_TRACES`; `RETRATO_EVANGELINE_APROBADO`.
- **Depende de:** GFX33.
- **Ejecución condicional:** según diseño, contenido o defecto confirmado.
- **Completar antes de ejecutar:** `FICHA_PUBLICA_APROBADA`, `RETRATO_EVANGELINE_APROBADO`.

```text
INICIO DEL PROMPT GFX35C
Produce un recurso de pintura digital para la interfaz de Path to Godhood, ambientada en el Backlund autorizado. Sigue las referencias adjuntas de composición y materiales. Realismo pictórico contenido, silueta clara, desgaste localizado y detalle legible al tamaño de juego. Conserva perspectiva y luz del maestro: cálida desde la izquierda de pantalla y relleno frío tenue desde la derecha, salvo una vista plana expresamente indicada. No añadas texto, letras, números, logotipos, controles, estadísticas ni emblemas narrativos inventados. Entrega una sola imagen del recurso solicitado; no una lámina con varias variantes. Recurso de la pista CLUE_MIND_TRACES. Utiliza exclusivamente el rostro aprobado de Evangeline y la ficha pública de esta pista. Representa la microexpresión o tensión descrita, sin inventar su apariencia, dramatizar lesiones ni sugerir culpabilidad. Si falta el retrato aprobado, no generar esta ilustración. Encuadre de detalle sobrio, adecuado a una tarjeta de investigación. Usa sólo la ficha pública aprobada adjunta y respeta su nivel de revelación. Si la pista no aparece ilustrada en el diseño aprobado, omite esta generación.
FIN DEL PROMPT GFX35C
```

---

### GFX35D Registro de astrología
- **Destino:** Nano Banana Pro.
- **Salida:** 2K 4:3; ilustración condicional tras descubrimiento.
- **Referencias:** S0; FICHA_PUBLICA_APROBADA de `CLUE_ASTROLOGY_RECORD`.
- **Depende de:** GFX33.
- **Ejecución condicional:** según diseño, contenido o defecto confirmado.
- **Completar antes de ejecutar:** `FICHA_PUBLICA_APROBADA`.

```text
INICIO DEL PROMPT GFX35D
Produce un recurso de pintura digital para la interfaz de Path to Godhood, ambientada en el Backlund autorizado. Sigue las referencias adjuntas de composición y materiales. Realismo pictórico contenido, silueta clara, desgaste localizado y detalle legible al tamaño de juego. Conserva perspectiva y luz del maestro: cálida desde la izquierda de pantalla y relleno frío tenue desde la derecha, salvo una vista plana expresamente indicada. No añadas texto, letras, números, logotipos, controles, estadísticas ni emblemas narrativos inventados. Entrega una sola imagen del recurso solicitado; no una lámina con varias variantes. Recurso de la pista CLUE_ASTROLOGY_RECORD. Ilustra únicamente la parte del registro astrológico que la ficha visible autorice. Usa una superficie de registro en blanco con trazas abstractas permitidas por esa ficha. No reconstruir la escena completa, conexiones humanas ni el desenlace a partir del truth model. Encuadre de detalle sobrio, adecuado a una tarjeta de investigación. Usa sólo la ficha pública aprobada adjunta y respeta su nivel de revelación. Si la pista no aparece ilustrada en el diseño aprobado, omite esta generación.
FIN DEL PROMPT GFX35D
```

---

### GFX35E Registro oculto
- **Destino:** Nano Banana Pro.
- **Salida:** 2K 4:3; ilustración condicional tras descubrimiento.
- **Referencias:** S0; FICHA_PUBLICA_APROBADA de `CLUE_CONCEALED_SAFE`.
- **Depende de:** GFX33.
- **Ejecución condicional:** según diseño, contenido o defecto confirmado.
- **Completar antes de ejecutar:** `FICHA_PUBLICA_APROBADA`.

```text
INICIO DEL PROMPT GFX35E
Produce un recurso de pintura digital para la interfaz de Path to Godhood, ambientada en el Backlund autorizado. Sigue las referencias adjuntas de composición y materiales. Realismo pictórico contenido, silueta clara, desgaste localizado y detalle legible al tamaño de juego. Conserva perspectiva y luz del maestro: cálida desde la izquierda de pantalla y relleno frío tenue desde la derecha, salvo una vista plana expresamente indicada. No añadas texto, letras, números, logotipos, controles, estadísticas ni emblemas narrativos inventados. Entrega una sola imagen del recurso solicitado; no una lámina con varias variantes. Recurso de la pista CLUE_CONCEALED_SAFE. Un registro clínico de papel con cantos y encuadernación coherentes. Páginas en blanco, sin personas, operaciones, nombres ni cifras. El contenido descubierto aparece sólo mediante texto vivo autorizado; la portada no anticipa qué demuestra la pista. Encuadre de detalle sobrio, adecuado a una tarjeta de investigación. Usa sólo la ficha pública aprobada adjunta y respeta su nivel de revelación. Si la pista no aparece ilustrada en el diseño aprobado, omite esta generación.
FIN DEL PROMPT GFX35E
```

---

### GFX35F Cartas de adopción
- **Destino:** Nano Banana Pro.
- **Salida:** 2K 4:3; ilustración condicional tras descubrimiento.
- **Referencias:** S0; FICHA_PUBLICA_APROBADA de `CLUE_FORGED_LETTERS`.
- **Depende de:** GFX33.
- **Ejecución condicional:** según diseño, contenido o defecto confirmado.
- **Completar antes de ejecutar:** `FICHA_PUBLICA_APROBADA`.

```text
INICIO DEL PROMPT GFX35F
Produce un recurso de pintura digital para la interfaz de Path to Godhood, ambientada en el Backlund autorizado. Sigue las referencias adjuntas de composición y materiales. Realismo pictórico contenido, silueta clara, desgaste localizado y detalle legible al tamaño de juego. Conserva perspectiva y luz del maestro: cálida desde la izquierda de pantalla y relleno frío tenue desde la derecha, salvo una vista plana expresamente indicada. No añadas texto, letras, números, logotipos, controles, estadísticas ni emblemas narrativos inventados. Entrega una sola imagen del recurso solicitado; no una lámina con varias variantes. Recurso de la pista CLUE_FORGED_LETTERS. Un pequeño conjunto de cartas de papel dobladas, completamente en blanco. Muestra material y uso, sin señales visuales inventadas que delaten falsificación, firmas o instituciones. Encuadre de detalle sobrio, adecuado a una tarjeta de investigación. Usa sólo la ficha pública aprobada adjunta y respeta su nivel de revelación. Si la pista no aparece ilustrada en el diseño aprobado, omite esta generación.
FIN DEL PROMPT GFX35F
```

---

### GFX35G Registro financiero
- **Destino:** Nano Banana Pro.
- **Salida:** 2K 4:3; ilustración condicional tras descubrimiento.
- **Referencias:** S0; FICHA_PUBLICA_APROBADA de `CLUE_FINANCIAL_BLACKMAIL`.
- **Depende de:** GFX33.
- **Ejecución condicional:** según diseño, contenido o defecto confirmado.
- **Completar antes de ejecutar:** `FICHA_PUBLICA_APROBADA`.

```text
INICIO DEL PROMPT GFX35G
Produce un recurso de pintura digital para la interfaz de Path to Godhood, ambientada en el Backlund autorizado. Sigue las referencias adjuntas de composición y materiales. Realismo pictórico contenido, silueta clara, desgaste localizado y detalle legible al tamaño de juego. Conserva perspectiva y luz del maestro: cálida desde la izquierda de pantalla y relleno frío tenue desde la derecha, salvo una vista plana expresamente indicada. No añadas texto, letras, números, logotipos, controles, estadísticas ni emblemas narrativos inventados. Entrega una sola imagen del recurso solicitado; no una lámina con varias variantes. Recurso de la pista CLUE_FINANCIAL_BLACKMAIL. Un registro de papel y un sobre sencillo, sin texto ni cantidades. No representar a los participantes, dinero con valor reconocible ni una conclusión sobre chantaje. La evidencia concreta queda en la ficha textual visible. Encuadre de detalle sobrio, adecuado a una tarjeta de investigación. Usa sólo la ficha pública aprobada adjunta y respeta su nivel de revelación. Si la pista no aparece ilustrada en el diseño aprobado, omite esta generación.
FIN DEL PROMPT GFX35G
```

---

### GFX35H Residuos alquímicos
- **Destino:** Nano Banana Pro.
- **Salida:** 2K 4:3; ilustración condicional tras descubrimiento.
- **Referencias:** S0; FICHA_PUBLICA_APROBADA de `CLUE_ALCHEMICAL_RESIDUES`.
- **Depende de:** GFX33.
- **Ejecución condicional:** según diseño, contenido o defecto confirmado.
- **Completar antes de ejecutar:** `FICHA_PUBLICA_APROBADA`.

```text
INICIO DEL PROMPT GFX35H
Produce un recurso de pintura digital para la interfaz de Path to Godhood, ambientada en el Backlund autorizado. Sigue las referencias adjuntas de composición y materiales. Realismo pictórico contenido, silueta clara, desgaste localizado y detalle legible al tamaño de juego. Conserva perspectiva y luz del maestro: cálida desde la izquierda de pantalla y relleno frío tenue desde la derecha, salvo una vista plana expresamente indicada. No añadas texto, letras, números, logotipos, controles, estadísticas ni emblemas narrativos inventados. Entrega una sola imagen del recurso solicitado; no una lámina con varias variantes. Recurso de la pista CLUE_ALCHEMICAL_RESIDUES. Un estudio material discreto de restos de manzanilla y un residuo de esencia plateada sobre soporte neutro. Sólo las sustancias descritas en la ficha pública; sin símbolos, etiquetas, herramientas adicionales ni efectos mágicos que añadan evidencia. Encuadre de detalle sobrio, adecuado a una tarjeta de investigación. Usa sólo la ficha pública aprobada adjunta y respeta su nivel de revelación. Si la pista no aparece ilustrada en el diseño aprobado, omite esta generación.
FIN DEL PROMPT GFX35H
```

---

### GFX36A Escribiente notarial
- **Destino:** Nano Banana Pro.
- **Salida:** 2K 4:3; mismo recorte para seis orígenes.
- **Referencias:** S0; encuadre común de orígenes aprobado.
- **Depende de:** GFX01.

```text
INICIO DEL PROMPT GFX36A
Produce un recurso de pintura digital para la interfaz de Path to Godhood, ambientada en el Backlund autorizado. Sigue las referencias adjuntas de composición y materiales. Realismo pictórico contenido, silueta clara, desgaste localizado y detalle legible al tamaño de juego. Conserva perspectiva y luz del maestro: cálida desde la izquierda de pantalla y relleno frío tenue desde la derecha, salvo una vista plana expresamente indicada. No añadas texto, letras, números, logotipos, controles, estadísticas ni emblemas narrativos inventados. Entrega una sola imagen del recurso solicitado; no una lámina con varias variantes. Viñeta de oficio para ORIGIN_CLERK: papeles en blanco, pluma sencilla, tintero y carpeta de oficio. Composición de naturaleza muerta compacta, con el mismo encuadre y peso visual que las otras cinco viñetas de origen. No mostrar personas ni asignar apariencia al protagonista o a sus anclas. No revelar secretos del trasfondo. Estos utensilios son una propuesta decorativa; no se incorporan al inventario del personaje ni otorgan habilidades.
FIN DEL PROMPT GFX36A
```

---

### GFX36B Estudiante de medicina
- **Destino:** Nano Banana Pro.
- **Salida:** 2K 4:3; mismo recorte para seis orígenes.
- **Referencias:** S0; encuadre común de orígenes aprobado.
- **Depende de:** GFX01.

```text
INICIO DEL PROMPT GFX36B
Produce un recurso de pintura digital para la interfaz de Path to Godhood, ambientada en el Backlund autorizado. Sigue las referencias adjuntas de composición y materiales. Realismo pictórico contenido, silueta clara, desgaste localizado y detalle legible al tamaño de juego. Conserva perspectiva y luz del maestro: cálida desde la izquierda de pantalla y relleno frío tenue desde la derecha, salvo una vista plana expresamente indicada. No añadas texto, letras, números, logotipos, controles, estadísticas ni emblemas narrativos inventados. Entrega una sola imagen del recurso solicitado; no una lámina con varias variantes. Viñeta de oficio para ORIGIN_MEDICAL_STUDENT: cuaderno en blanco, venda limpia y estuche sobrio de instrumental de estudio sin marcas. Composición de naturaleza muerta compacta, con el mismo encuadre y peso visual que las otras cinco viñetas de origen. No mostrar personas ni asignar apariencia al protagonista o a sus anclas. No revelar secretos del trasfondo. Estos utensilios son una propuesta decorativa; no se incorporan al inventario del personaje ni otorgan habilidades.
FIN DEL PROMPT GFX36B
```

---

### GFX36C Corresponsal de sucesos
- **Destino:** Nano Banana Pro.
- **Salida:** 2K 4:3; mismo recorte para seis orígenes.
- **Referencias:** S0; encuadre común de orígenes aprobado.
- **Depende de:** GFX01.

```text
INICIO DEL PROMPT GFX36C
Produce un recurso de pintura digital para la interfaz de Path to Godhood, ambientada en el Backlund autorizado. Sigue las referencias adjuntas de composición y materiales. Realismo pictórico contenido, silueta clara, desgaste localizado y detalle legible al tamaño de juego. Conserva perspectiva y luz del maestro: cálida desde la izquierda de pantalla y relleno frío tenue desde la derecha, salvo una vista plana expresamente indicada. No añadas texto, letras, números, logotipos, controles, estadísticas ni emblemas narrativos inventados. Entrega una sola imagen del recurso solicitado; no una lámina con varias variantes. Viñeta de oficio para ORIGIN_REPORTER: libreta en blanco, lápiz y recortes sin texto. Composición de naturaleza muerta compacta, con el mismo encuadre y peso visual que las otras cinco viñetas de origen. No mostrar personas ni asignar apariencia al protagonista o a sus anclas. No revelar secretos del trasfondo. Estos utensilios son una propuesta decorativa; no se incorporan al inventario del personaje ni otorgan habilidades.
FIN DEL PROMPT GFX36C
```

---

### GFX36D Espiritista de salón
- **Destino:** Nano Banana Pro.
- **Salida:** 2K 4:3; mismo recorte para seis orígenes.
- **Referencias:** S0; encuadre común de orígenes aprobado.
- **Depende de:** GFX01.

```text
INICIO DEL PROMPT GFX36D
Produce un recurso de pintura digital para la interfaz de Path to Godhood, ambientada en el Backlund autorizado. Sigue las referencias adjuntas de composición y materiales. Realismo pictórico contenido, silueta clara, desgaste localizado y detalle legible al tamaño de juego. Conserva perspectiva y luz del maestro: cálida desde la izquierda de pantalla y relleno frío tenue desde la derecha, salvo una vista plana expresamente indicada. No añadas texto, letras, números, logotipos, controles, estadísticas ni emblemas narrativos inventados. Entrega una sola imagen del recurso solicitado; no una lámina con varias variantes. Viñeta de oficio para ORIGIN_FRAUDULENT_MEDIUM: paño de mesa, vaso de cristal y accesorios de salón sin emblemas sobrenaturales. Composición de naturaleza muerta compacta, con el mismo encuadre y peso visual que las otras cinco viñetas de origen. No mostrar personas ni asignar apariencia al protagonista o a sus anclas. No revelar secretos del trasfondo. Estos utensilios son una propuesta decorativa; no se incorporan al inventario del personaje ni otorgan habilidades.
FIN DEL PROMPT GFX36D
```

---

### GFX36E Estibador de muelles
- **Destino:** Nano Banana Pro.
- **Salida:** 2K 4:3; mismo recorte para seis orígenes.
- **Referencias:** S0; encuadre común de orígenes aprobado.
- **Depende de:** GFX01.

```text
INICIO DEL PROMPT GFX36E
Produce un recurso de pintura digital para la interfaz de Path to Godhood, ambientada en el Backlund autorizado. Sigue las referencias adjuntas de composición y materiales. Realismo pictórico contenido, silueta clara, desgaste localizado y detalle legible al tamaño de juego. Conserva perspectiva y luz del maestro: cálida desde la izquierda de pantalla y relleno frío tenue desde la derecha, salvo una vista plana expresamente indicada. No añadas texto, letras, números, logotipos, controles, estadísticas ni emblemas narrativos inventados. Entrega una sola imagen del recurso solicitado; no una lámina con varias variantes. Viñeta de oficio para ORIGIN_DOCKWORKER: cabo de cuerda, guantes de trabajo y tablón de muelle desgastado. Composición de naturaleza muerta compacta, con el mismo encuadre y peso visual que las otras cinco viñetas de origen. No mostrar personas ni asignar apariencia al protagonista o a sus anclas. No revelar secretos del trasfondo. Estos utensilios son una propuesta decorativa; no se incorporan al inventario del personaje ni otorgan habilidades.
FIN DEL PROMPT GFX36E
```

---

### GFX36F Detective privado
- **Destino:** Nano Banana Pro.
- **Salida:** 2K 4:3; mismo recorte para seis orígenes.
- **Referencias:** S0; encuadre común de orígenes aprobado.
- **Depende de:** GFX01.

```text
INICIO DEL PROMPT GFX36F
Produce un recurso de pintura digital para la interfaz de Path to Godhood, ambientada en el Backlund autorizado. Sigue las referencias adjuntas de composición y materiales. Realismo pictórico contenido, silueta clara, desgaste localizado y detalle legible al tamaño de juego. Conserva perspectiva y luz del maestro: cálida desde la izquierda de pantalla y relleno frío tenue desde la derecha, salvo una vista plana expresamente indicada. No añadas texto, letras, números, logotipos, controles, estadísticas ni emblemas narrativos inventados. Entrega una sola imagen del recurso solicitado; no una lámina con varias variantes. Viñeta de oficio para ORIGIN_PRIVATE_INVESTIGATOR: libreta de notas en blanco, lupa sencilla y sobre sin marcas. Composición de naturaleza muerta compacta, con el mismo encuadre y peso visual que las otras cinco viñetas de origen. No mostrar personas ni asignar apariencia al protagonista o a sus anclas. No revelar secretos del trasfondo. Estos utensilios son una propuesta decorativa; no se incorporan al inventario del personaje ni otorgan habilidades.
FIN DEL PROMPT GFX36F
```

---

### GFX37 Mostrador del bazar
- **Destino:** Nano Banana Pro.
- **Salida:** 2K 16:9.
- **Referencias:** S0; `FICHA_LOCALIZACION_APROBADA`.
- **Depende de:** GFX01.
- **Ejecución condicional:** según diseño, contenido o defecto confirmado.
- **Completar antes de ejecutar:** `FICHA_LOCALIZACION_APROBADA`.

```text
INICIO DEL PROMPT GFX37
Produce un recurso de pintura digital para la interfaz de Path to Godhood, ambientada en el Backlund autorizado. Sigue las referencias adjuntas de composición y materiales. Realismo pictórico contenido, silueta clara, desgaste localizado y detalle legible al tamaño de juego. Conserva perspectiva y luz del maestro: cálida desde la izquierda de pantalla y relleno frío tenue desde la derecha, salvo una vista plana expresamente indicada. No añadas texto, letras, números, logotipos, controles, estadísticas ni emblemas narrativos inventados. Entrega una sola imagen del recurso solicitado; no una lámina con varias variantes. Superficie de exposición del bazar de la localización pública aprobada. Mostrador de madera oscura con paño discreto y fondo poco contrastado. Cámara alineada con el diseño de esta pantalla, sin mercancías, dependientes, cartelera ni precios pintados. Deja espacio para exponer objetos con siluetas separadas y para su descripción. No inventar una nueva tienda o facción; si falta la ficha de localización, preparar sólo una propuesta material para revisar.
FIN DEL PROMPT GFX37
```

---

### GFX38 Bandeja de exposición
- **Destino:** Nano Banana Pro.
- **Salida:** 2K 4:3.
- **Referencias:** GFX37 aprobado; S0.
- **Depende de:** GFX37.

```text
INICIO DEL PROMPT GFX38
Produce un recurso de pintura digital para la interfaz de Path to Godhood, ambientada en el Backlund autorizado. Sigue las referencias adjuntas de composición y materiales. Realismo pictórico contenido, silueta clara, desgaste localizado y detalle legible al tamaño de juego. Conserva perspectiva y luz del maestro: cálida desde la izquierda de pantalla y relleno frío tenue desde la derecha, salvo una vista plana expresamente indicada. No añadas texto, letras, números, logotipos, controles, estadísticas ni emblemas narrativos inventados. Entrega una sola imagen del recurso solicitado; no una lámina con varias variantes. Una bandeja sobria vacía para exponer un objeto del bazar, con interior oscuro mate y borde de material aprobado. Sin rótulos, ranuras de cantidad ni adornos de rareza. Perspectiva idéntica a la superficie aprobada de GFX37. Objeto aislado sobre gris uniforme, margen alrededor y sombra suave que pueda separarse. El centro no debe competir con la mercancía.
FIN DEL PROMPT GFX38
```

---

### GFX39 Estados del bazar
- **Destino:** SVG CSS y Antigravity.
- **Salida:** Según contrato.
- **Referencias:** GFX37 aprobado; GFX38 aprobado.
- **Depende de:** GFX38.

```text
INICIO DEL PROMPT GFX39
Trabaja en el lote gráfico indicado de Path to Godhood. Lee el contrato visual vigente y las reglas operativas del proyecto antes de editar. Conserva los cambios existentes, el canon, los datos ocultos y la lógica de dominio. Usa las referencias aprobadas; si falta una entrada obligatoria, registra el bloqueo concreto. Entrega archivos y evidencia verificable. No te autoapruebes ni ejecutes el lote siguiente. Construye exposición, selección, no disponible y transacción pendiente sobre mostrador y bandejas aprobadas. Utiliza la bolsa y los objetos canónicos; no crear estrellas, colores de rareza ni cantidades inventadas. Los importes diegéticos sólo se muestran si R1 los permite y llegan del contrato real. Entrega estados de vacío, error y operación completada sin alterar inventario ni economía desde animaciones. Mantén descripciones legibles y foco de teclado claro.
FIN DEL PROMPT GFX39
```

---

### GFX40 Suelo del escenario de combate
- **Destino:** Nano Banana Pro.
- **Salida:** 2K 4:3; recorte según tablero.
- **Referencias:** S0; `FICHA_PUBLICA_APROBADA`; bloqueo de combate aprobado.
- **Depende de:** GFX00.
- **Ejecución condicional:** según diseño, contenido o defecto confirmado.
- **Completar antes de ejecutar:** `ID_REAL`, `FICHA_PUBLICA_APROBADA`.

```text
INICIO DEL PROMPT GFX40
Produce un recurso de pintura digital para la interfaz de Path to Godhood, ambientada en el Backlund autorizado. Sigue las referencias adjuntas de composición y materiales. Realismo pictórico contenido, silueta clara, desgaste localizado y detalle legible al tamaño de juego. Conserva perspectiva y luz del maestro: cálida desde la izquierda de pantalla y relleno frío tenue desde la derecha, salvo una vista plana expresamente indicada. No añadas texto, letras, números, logotipos, controles, estadísticas ni emblemas narrativos inventados. Entrega una sola imagen del recurso solicitado; no una lámina con varias variantes. Construye sólo el suelo y los bordes ambientales de la localización pública aprobada del encuentro ID_REAL. Vista cenital o proyección fijada por el contrato de combate. Centro de contraste moderado, sin unidades, rejilla, números, casillas, flechas ni marcas tácticas. No introducir obstáculos nuevos: reproduce exclusivamente los definidos en FICHA_PUBLICA_APROBADA. El terreno es soporte visual para una rejilla exacta añadida con SVG.
FIN DEL PROMPT GFX40
```

---

### GFX41 Rejilla exacta de combate
- **Destino:** SVG y Antigravity.
- **Salida:** Según contrato.
- **Referencias:** Bloqueo de combate aprobado.
- **Depende de:** GFX00.

```text
INICIO DEL PROMPT GFX41
Trabaja en el lote gráfico indicado de Path to Godhood. Lee el contrato visual vigente y las reglas operativas del proyecto antes de editar. Conserva los cambios existentes, el canon, los datos ocultos y la lógica de dominio. Usa las referencias aprobadas; si falta una entrada obligatoria, registra el bloqueo concreto. Entrega archivos y evidencia verificable. No te autoapruebes ni ejecutes el lote siguiente. Genera por código una rejilla de siete columnas y cinco filas. Usa coordenadas x de 0 a 6 e y de 0 a 4, y la transformación de cámara aprobada. Entrega 35 regiones de selección sin huecos ni solapamientos, con bordes visuales discretos y controles accesibles equivalentes. La decoración no cambia alcance ni ocupación. Comprueba esquinas y centros de celda después del escalado. No pedir a un generador raster que dibuje esta cuadrícula.
FIN DEL PROMPT GFX41
```

---

### GFX42 Unidad de combate canónica
- **Destino:** Nano Banana Pro.
- **Salida:** 2K 3:4; plantilla por unidad.
- **Referencias:** S0; `REFERENCIA_APARIENCIA`; `FICHA_PUBLICA_APROBADA`.
- **Depende de:** GFX00.
- **Ejecución condicional:** según diseño, contenido o defecto confirmado.
- **Completar antes de ejecutar:** `ID_REAL`, `FICHA_PUBLICA_APROBADA`, `REFERENCIA_APARIENCIA`, `CAMARA_APROBADA`.

```text
INICIO DEL PROMPT GFX42
Produce un recurso de pintura digital para la interfaz de Path to Godhood, ambientada en el Backlund autorizado. Sigue las referencias adjuntas de composición y materiales. Realismo pictórico contenido, silueta clara, desgaste localizado y detalle legible al tamaño de juego. Conserva perspectiva y luz del maestro: cálida desde la izquierda de pantalla y relleno frío tenue desde la derecha, salvo una vista plana expresamente indicada. No añadas texto, letras, números, logotipos, controles, estadísticas ni emblemas narrativos inventados. Entrega una sola imagen del recurso solicitado; no una lámina con varias variantes. Crea la unidad ID_REAL a partir de FICHA_PUBLICA_APROBADA y REFERENCIA_APARIENCIA. Representación de ficha recortada según el contrato, pose neutral legible, orientación CAMARA_APROBADA y silueta completa. No añadir equipo, heridas, poderes, anatomía o rango que la ficha no indique. Fondo gris uniforme y margen amplio. La identificación de aliado, enemigo y selección se añadirá con vectores. Mantén el parecido con la referencia; si no existe apariencia aprobada, no inventar un retrato.
FIN DEL PROMPT GFX42
```

---

### GFX43 Ocho marcas de estado
- **Destino:** SVG.
- **Salida:** Según contrato.
- **Referencias:** S0.
- **Depende de:** GFX01.

```text
INICIO DEL PROMPT GFX43
Trabaja en el lote gráfico indicado de Path to Godhood. Lee el contrato visual vigente y las reglas operativas del proyecto antes de editar. Conserva los cambios existentes, el canon, los datos ocultos y la lógica de dominio. Usa las referencias aprobadas; si falta una entrada obligatoria, registra el bloqueo concreto. Entrega archivos y evidencia verificable. No te autoapruebes ni ejecutes el lote siguiente. Dibuja ocho iconos con la misma familia de trazo y márgenes: STUN con estrella angular interrumpida, FEAR con ojo retraído, FROZEN con cristal, BLEED con gota, CORRUPTED con espiral rota, HYPNOTIZED con anillos concéntricos, CONCEALED con velo y EMPOWERED con destello ascendente. Son propuestas de pictogramas, no símbolos del lore. Usa viewBox 0 0 32 32 y verifica a 24, 32 y 48 píxeles. Entrega cada SVG por separado, monocromo y semántica accesible externa. No mostrar estados que el jugador no conoce.
FIN DEL PROMPT GFX43
```

---

### GFX44 Selección y alcance táctico
- **Destino:** SVG CSS y Antigravity.
- **Salida:** Según contrato.
- **Referencias:** GFX41; S0.
- **Depende de:** GFX41.

```text
INICIO DEL PROMPT GFX44
Trabaja en el lote gráfico indicado de Path to Godhood. Lee el contrato visual vigente y las reglas operativas del proyecto antes de editar. Conserva los cambios existentes, el canon, los datos ocultos y la lógica de dominio. Usa las referencias aprobadas; si falta una entrada obligatoria, registra el bloqueo concreto. Entrega archivos y evidencia verificable. No te autoapruebes ni ejecutes el lote siguiente. Construye marcas independientes para unidad seleccionada, aliado, enemigo, destino válido, destino inválido, objetivo confirmado y rango autorizado. Distingue categorías por patrón además de color, sin ocultar la unidad ni las fronteras de celda. Los conjuntos de celdas provienen del dominio; la capa visual no recalcula reglas. Entrega galería en escala de grises, controles por teclado y estado estático de cada marca.
FIN DEL PROMPT GFX44
```

---

### GFX45 Efecto de habilidad autorizada
- **Destino:** SVG CSS y Antigravity.
- **Salida:** Según contrato.
- **Referencias:** S0; `DESCRIPCION_VISIBLE`.
- **Depende de:** GFX44.
- **Ejecución condicional:** según diseño, contenido o defecto confirmado.
- **Completar antes de ejecutar:** `HABILIDAD_ID`, `DESCRIPCION_VISIBLE`.

```text
INICIO DEL PROMPT GFX45
Trabaja en el lote gráfico indicado de Path to Godhood. Lee el contrato visual vigente y las reglas operativas del proyecto antes de editar. Conserva los cambios existentes, el canon, los datos ocultos y la lógica de dominio. Usa las referencias aprobadas; si falta una entrada obligatoria, registra el bloqueo concreto. Entrega archivos y evidencia verificable. No te autoapruebes ni ejecutes el lote siguiente. Prepara el efecto de HABILIDAD_ID con sólo su DESCRIPCION_VISIBLE y alcance suministrado. Construye origen, trayecto si existe, impacto y reposo como capas temporales ligeras. No inventes proyectiles, fuego o poderes que la habilidad no describa. Mantén visibles objetivo y celdas; el efecto no decide daño ni tiempo de turno. Entrega parámetros, duración, límites de área, limpieza al terminar y una alternativa de movimiento reducido. Reutiliza recursos entre habilidades cuando compartan semántica visual aprobada.
FIN DEL PROMPT GFX45
```

---

### GFX46 Resolución de combate
- **Destino:** SVG CSS y Antigravity.
- **Salida:** Según contrato.
- **Referencias:** Arte de combate aprobado.
- **Depende de:** GFX44.

```text
INICIO DEL PROMPT GFX46
Trabaja en el lote gráfico indicado de Path to Godhood. Lee el contrato visual vigente y las reglas operativas del proyecto antes de editar. Conserva los cambios existentes, el canon, los datos ocultos y la lógica de dominio. Usa las referencias aprobadas; si falta una entrada obligatoria, registra el bloqueo concreto. Entrega archivos y evidencia verificable. No te autoapruebes ni ejecutes el lote siguiente. Representa victoria, huida, muerte y pérdida de control sólo donde existan esos resultados en el contrato vigente. Reutiliza terreno, unidades y cambios de iluminación aprobados con prosa viva. No generar nuevas escenas narrativas ni una pantalla de puntuación. Mantén clara la acción siguiente y deja terminar o reducir cualquier transición según las reglas de la UI. Entrega estados reales o fixtures autorizadas y prueba que la animación no sustituya la resolución del dominio.
FIN DEL PROMPT GFX46
```

---

### GFX47 Zaguán del prólogo
- **Destino:** Nano Banana Pro.
- **Salida:** 2K 16:9.
- **Referencias:** S0; ficha pública del prólogo.
- **Depende de:** GFX01.

```text
INICIO DEL PROMPT GFX47
Produce un recurso de pintura digital para la interfaz de Path to Godhood, ambientada en el Backlund autorizado. Sigue las referencias adjuntas de composición y materiales. Realismo pictórico contenido, silueta clara, desgaste localizado y detalle legible al tamaño de juego. Conserva perspectiva y luz del maestro: cálida desde la izquierda de pantalla y relleno frío tenue desde la derecha, salvo una vista plana expresamente indicada. No añadas texto, letras, números, logotipos, controles, estadísticas ni emblemas narrativos inventados. Entrega una sola imagen del recurso solicitado; no una lámina con varias variantes. Un zaguán de Backlund de la ficha pública aprobada, con puerta, sombras y un punto de luz de gas. Cámara coherente con la dirección de arte. Deja áreas tranquilas para la carta y las elecciones de texto. No representar al Benefactor, transeúntes ni detalles que revelen una identidad. La lámpara tendrá capa aparte, por lo que deja su soporte y reserva el área luminosa sin quemarla. Sin letreros, nombres ni símbolos.
FIN DEL PROMPT GFX47
```

---

### GFX48 Carta del Benefactor
- **Destino:** Krita y Antigravity.
- **Salida:** Según contrato.
- **Referencias:** GFX20 aprobado; GFX30 aprobado; GFX31 aprobado.
- **Depende de:** GFX31.

```text
INICIO DEL PROMPT GFX48
Trabaja en el lote gráfico indicado de Path to Godhood. Lee el contrato visual vigente y las reglas operativas del proyecto antes de editar. Conserva los cambios existentes, el canon, los datos ocultos y la lógica de dominio. Usa las referencias aprobadas; si falta una entrada obligatoria, registra el bloqueo concreto. Entrega archivos y evidencia verificable. No te autoapruebes ni ejecutes el lote siguiente. Reutiliza sobre, papel y lacre aprobados para la carta del Benefactor. Prepara cerrado, abierto y papel desplegado manteniendo el mismo material. El contenido procede de la prosa canónica y se muestra en HTML; no lo pintes. No introducir un emblema, firma o silueta del remitente. Entrega capas, transición breve, foco y versión estática. La misma familia material puede servir a la carta del bazar sin confundir sus IDs.
FIN DEL PROMPT GFX48
```

---

### GFX49 Lámpara de gas
- **Destino:** Nano Banana Pro.
- **Salida:** 2K 3:4.
- **Referencias:** GFX47 aprobado; S0.
- **Depende de:** GFX47.

```text
INICIO DEL PROMPT GFX49
Produce un recurso de pintura digital para la interfaz de Path to Godhood, ambientada en el Backlund autorizado. Sigue las referencias adjuntas de composición y materiales. Realismo pictórico contenido, silueta clara, desgaste localizado y detalle legible al tamaño de juego. Conserva perspectiva y luz del maestro: cálida desde la izquierda de pantalla y relleno frío tenue desde la derecha, salvo una vista plana expresamente indicada. No añadas texto, letras, números, logotipos, controles, estadísticas ni emblemas narrativos inventados. Entrega una sola imagen del recurso solicitado; no una lámina con varias variantes. Una lámpara de gas del zaguán aprobado, aislada, con carcasa sobria y vidrio legible. Representa el cuerpo apagado, sin llama ni halo intenso: ambos se construirán aparte para la extinción del prólogo. Misma perspectiva que su soporte en GFX47. Sin inscripciones, emblemas ni reflejos de personajes. Fondo gris neutro con margen para recortar; preservar cristal y estructura como regiones distinguibles.
FIN DEL PROMPT GFX49
```

---

### GFX50 Poción Ojos de Cobalto
- **Destino:** Nano Banana Pro.
- **Salida:** 2K 3:4; alpha y transmisión en Krita.
- **Referencias:** S0; ficha de recipiente aprobada.
- **Depende de:** GFX01.

```text
INICIO DEL PROMPT GFX50
Produce un recurso de pintura digital para la interfaz de Path to Godhood, ambientada en el Backlund autorizado. Sigue las referencias adjuntas de composición y materiales. Realismo pictórico contenido, silueta clara, desgaste localizado y detalle legible al tamaño de juego. Conserva perspectiva y luz del maestro: cálida desde la izquierda de pantalla y relleno frío tenue desde la derecha, salvo una vista plana expresamente indicada. No añadas texto, letras, números, logotipos, controles, estadísticas ni emblemas narrativos inventados. Entrega una sola imagen del recurso solicitado; no una lámina con varias variantes. Una sola botella para la poción Ojos de Cobalto, asociada a Fool: líquido de cobalto profundo y reflejos controlados. Usa la forma de recipiente propuesta y ratificada en la ficha adjunta; no inventar ojos físicos, un rostro, un símbolo de camino ni propiedades extra. Sin etiqueta pintada. Cámara y escala idénticas a la otra poción. Deja el vidrio, el líquido, el tapón y los brillos claramente separables. Fondo neutro; el cristal se reconstruirá en capas para usarlo sobre la escena.
FIN DEL PROMPT GFX50
```

---

### GFX51 Poción Espejo de Ámbar
- **Destino:** Nano Banana Pro.
- **Salida:** 2K 3:4; alpha y transmisión en Krita.
- **Referencias:** S0; ficha de recipiente aprobada.
- **Depende de:** GFX01.

```text
INICIO DEL PROMPT GFX51
Produce un recurso de pintura digital para la interfaz de Path to Godhood, ambientada en el Backlund autorizado. Sigue las referencias adjuntas de composición y materiales. Realismo pictórico contenido, silueta clara, desgaste localizado y detalle legible al tamaño de juego. Conserva perspectiva y luz del maestro: cálida desde la izquierda de pantalla y relleno frío tenue desde la derecha, salvo una vista plana expresamente indicada. No añadas texto, letras, números, logotipos, controles, estadísticas ni emblemas narrativos inventados. Entrega una sola imagen del recurso solicitado; no una lámina con varias variantes. Una sola botella para la poción Espejo de Ámbar, asociada a Visionary: líquido ámbar y superficie reflectante contenida. Usa la forma de recipiente propuesta y ratificada en la ficha adjunta; no inventar ojos físicos, un rostro, un símbolo de camino ni propiedades extra. Sin etiqueta pintada. Cámara y escala idénticas a la otra poción. Deja el vidrio, el líquido, el tapón y los brillos claramente separables. Fondo neutro; el cristal se reconstruirá en capas para usarlo sobre la escena.
FIN DEL PROMPT GFX51
```

---

### GFX52 Encuadre ritual del Desván
- **Destino:** Nano Banana Pro edición.
- **Salida:** 4K 16:9 si el detalle lo exige.
- **Referencias:** C0; GFX22 aprobado; bloqueo del preset ritual.
- **Depende de:** GFX22.

```text
INICIO DEL PROMPT GFX52
Edita el recurso adjunto de Path to Godhood. Usa la imagen base como autoridad de identidad, cámara, silueta, escala, posición y material, salvo el cambio expresamente pedido. Modifica únicamente ese aspecto; conserva las demás regiones y deja espacio para el texto vivo de la aplicación. Mantén el realismo pictórico contenido del maestro. No añadas letras, números, logotipos, controles ni emblemas narrativos inventados. Entrega una sola variante, sin comparativas dentro de la imagen. Prepara la zona ritual dentro de la misma habitación aprobada, usando el preset ritual y el cáliz existente. Conserva arquitectura, materiales y posición de las referencias espaciales. Despeja la zona de interacción y reduce distracciones. No inventar círculos mágicos, altares, fórmulas, símbolos o ingredientes. Si la ampliación descubre superficies nuevas, completarlas respetando el maestro. El resultado sirve como apoyo pictórico; los requisitos de ascensión se componen después.
FIN DEL PROMPT GFX52
```

---

### GFX53 Cinco puertas de ascensión
- **Destino:** SVG CSS y Antigravity.
- **Salida:** Según contrato.
- **Referencias:** GFX52 aprobado; contrato de ascensión.
- **Depende de:** GFX52.

```text
INICIO DEL PROMPT GFX53
Trabaja en el lote gráfico indicado de Path to Godhood. Lee el contrato visual vigente y las reglas operativas del proyecto antes de editar. Conserva los cambios existentes, el canon, los datos ocultos y la lógica de dominio. Usa las referencias aprobadas; si falta una entrada obligatoria, registra el bloqueo concreto. Entrega archivos y evidencia verificable. No te autoapruebes ni ejecutes el lote siguiente. Construye la representación de cinco gates: conocimiento de fórmula, dos ingredientes principales exactos más los suplementarios requeridos, digestión completa, preparación y bebida. Lugar, Momento, Materiales y Anclaje pertenecen juntos a preparación. Usa papeles, ingredientes canónicos, libro o recipiente sólo según el contrato aprobado; no sustituir el dominio con cinco emblemas decorativos. Entrega mapeo gate a estado observable y recurso, con bloqueado, disponible y cumplido cuando corresponda. Los nombres y motivos se leen como texto vivo; no mostrar porcentajes mecánicos.
FIN DEL PROMPT GFX53
```

---

### GFX54 Elemento de preparación ritual
- **Destino:** Nano Banana Pro.
- **Salida:** 2K 1:1 cuando sea objeto.
- **Referencias:** S0; `FICHA_PUBLICA_APROBADA`; preset ritual.
- **Depende de:** GFX53.
- **Ejecución condicional:** según diseño, contenido o defecto confirmado.
- **Completar antes de ejecutar:** `ELEMENTO_ID`, `CATEGORIA_PREPARACION`, `FICHA_PUBLICA_APROBADA`.

```text
INICIO DEL PROMPT GFX54
Produce un recurso de pintura digital para la interfaz de Path to Godhood, ambientada en el Backlund autorizado. Sigue las referencias adjuntas de composición y materiales. Realismo pictórico contenido, silueta clara, desgaste localizado y detalle legible al tamaño de juego. Conserva perspectiva y luz del maestro: cálida desde la izquierda de pantalla y relleno frío tenue desde la derecha, salvo una vista plana expresamente indicada. No añadas texto, letras, números, logotipos, controles, estadísticas ni emblemas narrativos inventados. Entrega una sola imagen del recurso solicitado; no una lámina con varias variantes. Representa únicamente ELEMENTO_ID de la categoría CATEGORIA_PREPARACION, según FICHA_PUBLICA_APROBADA. Puede pertenecer a Lugar, Momento, Materiales o Anclaje; si la categoría se expresa mejor con iluminación o texto, no generar un objeto nuevo. Para un objeto físico, reproducir sólo apariencia y material autorizados, aislado sobre gris neutro y con la cámara ritual. Sin inscripciones, poderes o ingredientes adicionales. Un ancla humana no recibe un rostro sin referencia aprobada.
FIN DEL PROMPT GFX54
```

---

### GFX55 Gesto de beber y vacilación
- **Destino:** SVG CSS y Antigravity.
- **Salida:** Según contrato.
- **Referencias:** GFX22; GFX50; GFX51.
- **Depende de:** GFX53.

```text
INICIO DEL PROMPT GFX55
Trabaja en el lote gráfico indicado de Path to Godhood. Lee el contrato visual vigente y las reglas operativas del proyecto antes de editar. Conserva los cambios existentes, el canon, los datos ocultos y la lógica de dominio. Usa las referencias aprobadas; si falta una entrada obligatoria, registra el bloqueo concreto. Entrega archivos y evidencia verificable. No te autoapruebes ni ejecutes el lote siguiente. Usa cáliz o poción aprobada para preparar el gesto sostenido de beber del prólogo durante tres segundos, con su vacilación e interrupción según el contrato vigente. Anima aproximación, inclinación y líquido por capas; no generar manos o fotogramas independientes que cambien el recipiente. La lógica confirma la acción y la UI responde. Diseña feedback equivalente por teclado y movimiento reducido. Entrega estados de inicio, sostener, interrumpir y completar sin inventar consecuencias ni permitir que un clic breve active la bebida.
FIN DEL PROMPT GFX55
```

---

### GFX56 Atmósfera y efectos locales
- **Destino:** SVG CSS y Krita.
- **Salida:** Según contrato.
- **Referencias:** C0; estados aprobados.
- **Depende de:** GFX23, GFX25.

```text
INICIO DEL PROMPT GFX56
Trabaja en el lote gráfico indicado de Path to Godhood. Lee el contrato visual vigente y las reglas operativas del proyecto antes de editar. Conserva los cambios existentes, el canon, los datos ocultos y la lógica de dominio. Usa las referencias aprobadas; si falta una entrada obligatoria, registra el bloqueo concreto. Entrega archivos y evidencia verificable. No te autoapruebes ni ejecutes el lote siguiente. Prepara polvo escaso en el haz de luz, humo localizado, respiración de la llama y reflejo del azogue con capas pequeñas. No cubrir prosa ni convertir la habitación en niebla uniforme. Las secuencias ambientales propuestas duran entre cuatro y catorce segundos y se ajustan tras medir rendimiento. Pausa efectos fuera de vista y desactiva desplazamientos con movimiento reducido. Entrega estados estáticos equivalentes y límites de área. La animación no avanza el calendario ni decide estados.
FIN DEL PROMPT GFX56
```

---

### GFX57 Controles y cursores
- **Destino:** SVG y Antigravity.
- **Salida:** Según contrato.
- **Referencias:** S0; inventario de controles.
- **Depende de:** GFX00.

```text
INICIO DEL PROMPT GFX57
Trabaja en el lote gráfico indicado de Path to Godhood. Lee el contrato visual vigente y las reglas operativas del proyecto antes de editar. Conserva los cambios existentes, el canon, los datos ocultos y la lógica de dominio. Usa las referencias aprobadas; si falta una entrada obligatoria, registra el bloqueo concreto. Entrega archivos y evidencia verificable. No te autoapruebes ni ejecutes el lote siguiente. Dibuja una familia mínima para volver, cerrar, avanzar, ayuda, ajustes, sonido y movimiento, sólo si esos controles existen en la UI. Conserva la semántica nativa de botones y cursores; un cursor decorativo opcional no oculta el foco ni impide usar teclado. Iconos simples, viewBox común y reconocimiento a 24 píxeles. Entrega SVG separados y ejemplos de foco y pulsación. Ningún icono funciona como estadística, rareza o nuevo sistema de juego.
FIN DEL PROMPT GFX57
```

---

### GFX58 Carga vacío y error
- **Destino:** SVG CSS y Antigravity.
- **Salida:** Según contrato.
- **Referencias:** GFX30; GFX57.
- **Depende de:** GFX57.

```text
INICIO DEL PROMPT GFX58
Trabaja en el lote gráfico indicado de Path to Godhood. Lee el contrato visual vigente y las reglas operativas del proyecto antes de editar. Conserva los cambios existentes, el canon, los datos ocultos y la lógica de dominio. Usa las referencias aprobadas; si falta una entrada obligatoria, registra el bloqueo concreto. Entrega archivos y evidencia verificable. No te autoapruebes ni ejecutes el lote siguiente. Prepara recursos discretos de carga, vacío, error recuperable, desconexión y reintento para las pantallas existentes. Reutiliza papel, luz y un indicador simple. El mensaje es texto vivo y explica la acción disponible. No inventar datos de jugador durante carga ni presentar error como estado narrativo. Respeta anuncios accesibles y movimiento reducido. Entrega una galería y verifica que un fallo de imagen conserve un control utilizable.
FIN DEL PROMPT GFX58
```

---

### GFX59 Retrato de personaje canónico
- **Destino:** Nano Banana Pro.
- **Salida:** 2K 3:4; plantilla por ID.
- **Referencias:** S0; `FICHA_PUBLICA_APROBADA`; `REFERENCIA_APARIENCIA`.
- **Depende de:** GFX00.
- **Ejecución condicional:** según diseño, contenido o defecto confirmado.
- **Completar antes de ejecutar:** `ID_REAL`, `FICHA_PUBLICA_APROBADA`, `REFERENCIA_APARIENCIA`, `EXPRESION_AUTORIZADA`.

```text
INICIO DEL PROMPT GFX59
Produce un recurso de pintura digital para la interfaz de Path to Godhood, ambientada en el Backlund autorizado. Sigue las referencias adjuntas de composición y materiales. Realismo pictórico contenido, silueta clara, desgaste localizado y detalle legible al tamaño de juego. Conserva perspectiva y luz del maestro: cálida desde la izquierda de pantalla y relleno frío tenue desde la derecha, salvo una vista plana expresamente indicada. No añadas texto, letras, números, logotipos, controles, estadísticas ni emblemas narrativos inventados. Entrega una sola imagen del recurso solicitado; no una lámina con varias variantes. Retrato de ID_REAL según FICHA_PUBLICA_APROBADA y REFERENCIA_APARIENCIA. Encuadre de busto, pose neutral y expresión EXPRESION_AUTORIZADA. Mantén todos los rasgos de identidad aprobados; no inferir edad, género, etnia, vestimenta o cicatrices ausentes de la ficha. Fondo discreto que facilite recorte, sin accesorios nuevos ni señales que revelen motivaciones ocultas. Usar sólo si el personaje aparece en una pantalla de la porción jugable y el diseño exige retrato.
FIN DEL PROMPT GFX59
```

---

### GFX60 Objeto canónico de inventario
- **Destino:** Nano Banana Pro.
- **Salida:** 2K 1:1; plantilla por ID y estado revelado.
- **Referencias:** S0; `FICHA_PUBLICA_APROBADA`; maestro del objeto si existe.
- **Depende de:** GFX00.
- **Ejecución condicional:** según diseño, contenido o defecto confirmado.
- **Completar antes de ejecutar:** `ID_REAL`, `FICHA_PUBLICA_APROBADA`, `ESTADO_VISIBLE`, `CAMARA_APROBADA`.

```text
INICIO DEL PROMPT GFX60
Produce un recurso de pintura digital para la interfaz de Path to Godhood, ambientada en el Backlund autorizado. Sigue las referencias adjuntas de composición y materiales. Realismo pictórico contenido, silueta clara, desgaste localizado y detalle legible al tamaño de juego. Conserva perspectiva y luz del maestro: cálida desde la izquierda de pantalla y relleno frío tenue desde la derecha, salvo una vista plana expresamente indicada. No añadas texto, letras, números, logotipos, controles, estadísticas ni emblemas narrativos inventados. Entrega una sola imagen del recurso solicitado; no una lámina con varias variantes. Un solo objeto ID_REAL, descrito en FICHA_PUBLICA_APROBADA para ESTADO_VISIBLE. Representa forma, material, desgaste y componentes autorizados sin añadir propiedades, escrituras, brillos mágicos ni rareza. Usa la cámara de exposición CAMARA_APROBADA y fondo gris neutro; margen completo para recorte. La versión no identificada conserva únicamente la apariencia que el jugador conoce. Mantén silueta y escala entre variantes del mismo objeto, usando su maestro aprobado como referencia si ya existe.
FIN DEL PROMPT GFX60
```

---

### GFX61 Viñeta narrativa autorizada
- **Destino:** Nano Banana Pro.
- **Salida:** 2K 16:9 o recorte aprobado.
- **Referencias:** S0; `ESCENA_PUBLICA_APROBADA`; referencias de entidades presentes.
- **Depende de:** GFX00.
- **Ejecución condicional:** según diseño, contenido o defecto confirmado.
- **Completar antes de ejecutar:** `ID_REAL`, `ESCENA_PUBLICA_APROBADA`.

```text
INICIO DEL PROMPT GFX61
Produce un recurso de pintura digital para la interfaz de Path to Godhood, ambientada en el Backlund autorizado. Sigue las referencias adjuntas de composición y materiales. Realismo pictórico contenido, silueta clara, desgaste localizado y detalle legible al tamaño de juego. Conserva perspectiva y luz del maestro: cálida desde la izquierda de pantalla y relleno frío tenue desde la derecha, salvo una vista plana expresamente indicada. No añadas texto, letras, números, logotipos, controles, estadísticas ni emblemas narrativos inventados. Entrega una sola imagen del recurso solicitado; no una lámina con varias variantes. Ilustra el momento ID_REAL exclusivamente con ESCENA_PUBLICA_APROBADA y las referencias aprobadas de lugar y personajes. Representa el instante que el jugador ya está viendo, sin anticipar elecciones, consecuencias, culpabilidad ni secretos. Composición sobria con área tranquila para prosa viva. No inventar personajes, vestuario, objetos o nuevas localizaciones. Generar sólo si R1 o el brief de esa pantalla solicita una viñeta; un dilema textual no exige por sí solo una ilustración.
FIN DEL PROMPT GFX61
```

---

### GFX62 Recortes por cámara y pantalla
- **Destino:** Krita y Antigravity.
- **Salida:** Según contrato.
- **Referencias:** C0; maestros aprobados.
- **Depende de:** GFX28.

```text
INICIO DEL PROMPT GFX62
Trabaja en el lote gráfico indicado de Path to Godhood. Lee el contrato visual vigente y las reglas operativas del proyecto antes de editar. Conserva los cambios existentes, el canon, los datos ocultos y la lógica de dominio. Usa las referencias aprobadas; si falta una entrada obligatoria, registra el bloqueo concreto. Entrega archivos y evidencia verificable. No te autoapruebes ni ejecutes el lote siguiente. Deriva los presets wide, desk-left, desk-center, desk-right, wall-board, ritual y combat de sus maestros aprobados. Conserva la escala uniforme y los pivotes. Registra zonas seguras y superficies que quedan descubiertas. Verifica las cinco resoluciones del plan y la estrategia bajo 1024 píxeles. No regenerar una habitación por resolución ni estirar ejes de forma independiente. Entrega coordenadas, versiones de exportación y capturas con objetivos interactivos alineados al arte.
FIN DEL PROMPT GFX62
```

---

### GFX63 Preparación y exportación final
- **Destino:** Krita, Inkscape y Antigravity.
- **Salida:** Según contrato.
- **Referencias:** Maestros y aprobaciones.
- **Depende de:** GFX62.

```text
INICIO DEL PROMPT GFX63
Trabaja en el lote gráfico indicado de Path to Godhood. Lee el contrato visual vigente y las reglas operativas del proyecto antes de editar. Conserva los cambios existentes, el canon, los datos ocultos y la lógica de dominio. Usa las referencias aprobadas; si falta una entrada obligatoria, registra el bloqueo concreto. Entrega archivos y evidencia verificable. No te autoapruebes ni ejecutes el lote siguiente. Procesa sólo maestros aprobados. Valida alpha real y bordes en blanco, negro, magenta y fondo final; separa cristal, reflejos y sombras cuando proceda. Conserva sRGB, pivote y logicalBounds al recortar. Exporta formatos web según comparación visual y soporte real; no declares pérdida imperceptible sin inspección. Mide peso y dimensiones y estima memoria decodificada. Entrega manifiesto de producción, hashes y miniaturas de revisión. Excluye candidatos, fuentes editables y recursos secretos del bundle público.
FIN DEL PROMPT GFX63
```

---

### GFX64 Implementación del adaptador MCP
- **Destino:** Antigravity.
- **Salida:** Según contrato.
- **Depende de:** GFX00.

```text
INICIO DEL PROMPT GFX64
Trabaja en el lote gráfico indicado de Path to Godhood. Lee el contrato visual vigente y las reglas operativas del proyecto antes de editar. Conserva los cambios existentes, el canon, los datos ocultos y la lógica de dominio. Usa las referencias aprobadas; si falta una entrada obligatoria, registra el bloqueo concreto. Entrega archivos y evidencia verificable. No te autoapruebes ni ejecutes el lote siguiente. Implementa un adaptador local por stdio en ptg_art_mcp.py, separado del juego, siguiendo las versiones vigentes del SDK oficial MCP y google-genai. Antes de programar comprueba en documentación oficial el contrato Interactions para gemini-3-pro-image. Expón get_capabilities, validate_job, generate_asset, edit_asset y get_job. Las dos operaciones de generación aceptan asset_id, prompt_file, reference_files, aspect_ratio, image_size y budget_id; edit_asset exige base_image. Devuelve job_id, status, output_path, dimensiones, SHA256 y uso conocido, sin inventar costes. Usa GEMINI_API_KEY desde entorno y PTG_ART_ROOT para confinar lecturas y escrituras después de resolver enlaces. Implementa PTG_ART_DRY_RUN, límites por lote, concurrencia uno, cancelación local cuando sea posible y deduplicación local de solicitudes. No prometas cancelación de cobros ni idempotencia remota. Marca UNKNOWN ante resultados inciertos y no reenvíes automáticamente. No exponer shell genérica, secretos ni archivos externos. Logs a stderr; protocolo a stdout. Prueba validación de rutas, respuesta sin imagen y deduplicación con respuestas simuladas. Entrega código, dependencias fijadas, instrucciones por sistema y config desactivada con rutas reales o campos marcados. No llames a la API con gasto durante esta implementación.
FIN DEL PROMPT GFX64
```

---

### GFX65 Prueba de la conexión MCP
- **Destino:** Antigravity.
- **Salida:** Según contrato.
- **Depende de:** GFX64.

```text
INICIO DEL PROMPT GFX65
Trabaja en el lote gráfico indicado de Path to Godhood. Lee el contrato visual vigente y las reglas operativas del proyecto antes de editar. Conserva los cambios existentes, el canon, los datos ocultos y la lógica de dominio. Usa las referencias aprobadas; si falta una entrada obligatoria, registra el bloqueo concreto. Entrega archivos y evidencia verificable. No te autoapruebes ni ejecutes el lote siguiente. Verifica que el adaptador GFX64 exista y que sus pruebas locales pasen. Conserva la configuración MCP actual y añade sólo ptg-art con rutas absolutas verificadas. Inicia en modo simulado, descubre las cinco herramientas y ejecuta validate_job con un prompt y referencias locales permitidas. Comprueba salida, hash y errores esperados sin mostrar credenciales. Para una prueba real exige un budget_id con límite ya asignado; ejecuta una sola candidata 2K y verifica el archivo. Si no existe presupuesto, termina con conexión local probada y generación real pendiente. No activar un lote completo ni instalar servidores alternativos para ocultar un fallo.
FIN DEL PROMPT GFX65
```

---

### GFX66 Integración visual jugable
- **Destino:** Antigravity.
- **Salida:** Según contrato.
- **Referencias:** Exportaciones aprobadas; contrato UI.
- **Depende de:** GFX63.

```text
INICIO DEL PROMPT GFX66
Trabaja en el lote gráfico indicado de Path to Godhood. Lee el contrato visual vigente y las reglas operativas del proyecto antes de editar. Conserva los cambios existentes, el canon, los datos ocultos y la lógica de dominio. Usa las referencias aprobadas; si falta una entrada obligatoria, registra el bloqueo concreto. Entrega archivos y evidencia verificable. No te autoapruebes ni ejecutes el lote siguiente. Integra las exportaciones aprobadas en la UI existente, empezando por vela, espejo y libro dentro del Desván. Mantén texto vivo, controles semánticos, regiones de interacción y lectura del estado observable. No cambiar backend ni fórmulas para acomodar el arte. Prueba foco, apertura y cierre, estados, teclado y movimiento reducido. Captura la UI real en las cinco resoluciones y mide carga de recursos. Si una composición no permite jugar con claridad, describe el defecto y corrige su capa; no maquilles la captura fuera del juego.
FIN DEL PROMPT GFX66
```

---

### GFX67 Revisión y entrega del lote
- **Destino:** Antigravity.
- **Salida:** Según contrato.
- **Referencias:** Inventario; evidencia de GFX66.
- **Depende de:** GFX66.

```text
INICIO DEL PROMPT GFX67
Trabaja en el lote gráfico indicado de Path to Godhood. Lee el contrato visual vigente y las reglas operativas del proyecto antes de editar. Conserva los cambios existentes, el canon, los datos ocultos y la lógica de dominio. Usa las referencias aprobadas; si falta una entrada obligatoria, registra el bloqueo concreto. Entrega archivos y evidencia verificable. No te autoapruebes ni ejecutes el lote siguiente. Revisa el lote contra canon, referencias, silueta, alpha, estados, información oculta, interacción, movimiento y rendimiento. Comprueba 35 celdas de combate, ocho iconos, cuatro estados de vela, cuatro de espejo, cinco niveles de grietas y el mapeo de ascensión cuando correspondan al lote. Entrega lista por ID con aprobado previamente, pendiente o rechazado; pruebas reales, capturas, límites y defectos. Conserva el cierre del manual UI con commit y CI sólo si existen. Solicita revisión humana del resultado concreto sin autoaprobar R1, G4, R10 ni cambiar de fase.
FIN DEL PROMPT GFX67
```

---

### GFX68 Corrección localizada de una imagen
- **Destino:** Nano Banana Pro edición.
- **Salida:** Misma proporción y nivel de tamaño que la base.
- **Referencias:** `BASE_APROBADA`; `GUIA_DE_ZONA`.
- **Ejecución condicional:** según diseño, contenido o defecto confirmado.
- **Completar antes de ejecutar:** `DEFECTO_CONCRETO`, `REGION_DESCRITA`, `CAMBIO_SOLICITADO`.

```text
INICIO DEL PROMPT GFX68
Edita el recurso adjunto de Path to Godhood. Usa la imagen base como autoridad de identidad, cámara, silueta, escala, posición y material, salvo el cambio expresamente pedido. Modifica únicamente ese aspecto; conserva las demás regiones y deja espacio para el texto vivo de la aplicación. Mantén el realismo pictórico contenido del maestro. No añadas letras, números, logotipos, controles ni emblemas narrativos inventados. Entrega una sola variante, sin comparativas dentro de la imagen. La imagen base aprobada y la guía de zona se adjuntan. Corrige únicamente DEFECTO_CONCRETO dentro de REGION_DESCRITA aplicando CAMBIO_SOLICITADO. No alterar el resto de la composición, el material o la silueta. Si una corrección exige rediseñar el objeto, no introducir ese rediseño de forma implícita. Mantén el lienzo completo y la escala para comparar la edición con el original; la preparación final restaurará las regiones externas desde el maestro cuando se requieran píxeles exactos.
FIN DEL PROMPT GFX68
```

---

### GFX69 Ajuste material a la referencia
- **Destino:** Nano Banana Pro edición.
- **Salida:** Misma proporción que la base.
- **Referencias:** `BASE_APROBADA`; `S0`; `OBJETO_REFERENCIA`.
- **Ejecución condicional:** según diseño, contenido o defecto confirmado.
- **Completar antes de ejecutar:** `OBJETO_REFERENCIA`, `DIFERENCIA_MATERIAL_OBSERVADA`.

```text
INICIO DEL PROMPT GFX69
Edita el recurso adjunto de Path to Godhood. Usa la imagen base como autoridad de identidad, cámara, silueta, escala, posición y material, salvo el cambio expresamente pedido. Modifica únicamente ese aspecto; conserva las demás regiones y deja espacio para el texto vivo de la aplicación. Mantén el realismo pictórico contenido del maestro. No añadas letras, números, logotipos, controles ni emblemas narrativos inventados. Entrega una sola variante, sin comparativas dentro de la imagen. Ajusta el recurso a la muestra material S0 y a OBJETO_REFERENCIA. Corrige sólo DIFERENCIA_MATERIAL_OBSERVADA, manteniendo contorno, escala, cámara y desgaste estructural de la base. No añadir detalles para hacerlo más ornamentado ni aumentar contraste global. La corrección debe lograr el mismo comportamiento de madera, metal, papel o cuero que la referencia indicada. Conserva el fondo y el margen para comparar y recortar.
FIN DEL PROMPT GFX69
```

---

### GFX70 Expansión del catálogo por contenido real
- **Destino:** Antigravity.
- **Salida:** Según contrato.
- **Depende de:** GFX00.

```text
INICIO DEL PROMPT GFX70
Trabaja en el lote gráfico indicado de Path to Godhood. Lee el contrato visual vigente y las reglas operativas del proyecto antes de editar. Conserva los cambios existentes, el canon, los datos ocultos y la lógica de dominio. Usa las referencias aprobadas; si falta una entrada obligatoria, registra el bloqueo concreto. Entrega archivos y evidencia verificable. No te autoapruebes ni ejecutes el lote siguiente. Toma production_inventory.json de GFX00 y las plantillas del catálogo. Para cada entidad realmente usada resuelve los campos requeridos sólo con su ficha pública y referencias aprobadas. Crea un TXT completo por ID y estado visible, copia el prompt base y sustituye todas las variables en mayúsculas declaradas en required_bindings. Registra la relación plantilla a instancia y las dependencias. Valida que no queden campos pendientes, que toda imagen tenga fuente y que no se copie el truth model. Si faltan apariencias, marca NEEDS_REFERENCE y conserva la tarea pendiente. Informa cuántos recursos son fijos, condicionales y reutilizados. No generar imágenes ni inventar contenido para lograr una cifra.
FIN DEL PROMPT GFX70
```

---

### GFX71 Revisión opcional en Figma
- **Destino:** Antigravity o cliente Figma conectado.
- **Salida:** Según contrato.
- **Depende de:** GFX01.
- **Ejecución condicional:** según diseño, contenido o defecto confirmado.

```text
INICIO DEL PROMPT GFX71
Trabaja en el lote gráfico indicado de Path to Godhood. Lee el contrato visual vigente y las reglas operativas del proyecto antes de editar. Conserva los cambios existentes, el canon, los datos ocultos y la lógica de dominio. Usa las referencias aprobadas; si falta una entrada obligatoria, registra el bloqueo concreto. Entrega archivos y evidencia verificable. No te autoapruebes ni ejecutes el lote siguiente. Usa únicamente las herramientas Figma efectivamente disponibles en el cliente conectado. Identifica el archivo de trabajo autorizado y comprueba primero su lectura. Prepara páginas de contrato visual, comparación de composiciones, objetos y estados, y capturas de UI real. Si hay escritura disponible para ese archivo, crea componentes y variantes con nombres correspondientes al inventario; si sólo hay lectura, entrega SVG y una guía de importación. No fingir edición de lienzo con una captura plana. Conserva las referencias aprobadas y añade notas de diferencias. No configurar Antigravity como compatible por el solo hecho de que el plugin esté conectado en ChatGPT.
FIN DEL PROMPT GFX71
```

---

### GFX72 Tipografía y nombre del juego
- **Destino:** SVG CSS y Antigravity.
- **Salida:** Según contrato.
- **Referencias:** Contrato R1; textos reales.
- **Depende de:** GFX01.

```text
INICIO DEL PROMPT GFX72
Trabaja en el lote gráfico indicado de Path to Godhood. Lee el contrato visual vigente y las reglas operativas del proyecto antes de editar. Conserva los cambios existentes, el canon, los datos ocultos y la lógica de dominio. Usa las referencias aprobadas; si falta una entrada obligatoria, registra el bloqueo concreto. Entrega archivos y evidencia verificable. No te autoapruebes ni ejecutes el lote siguiente. Prepara una muestra tipográfica con los textos reales de la UI: título Path to Godhood, etiqueta breve, prosa, fecha y controles permitidos. Parte de Cinzel para el uso ceremonial y una serif legible para lectura, respetando la selección final de R1 y un máximo de dos familias. Comprueba licencias de los archivos de fuente concretos, acentos y caracteres españoles. Propón cuerpo de 16 píxeles y secundario de 13 como mínimos del plan, con interlineado de 1,45 a 1,65; verificar en los tamaños de pantalla reales. Si hace falta una marca del título, componerla como tipografía o SVG editable sin inventar un emblema. No usar Nano Banana para dibujar letras. Conserva el nombre accesible y no convertir párrafos de lectura en contornos.
FIN DEL PROMPT GFX72
```

