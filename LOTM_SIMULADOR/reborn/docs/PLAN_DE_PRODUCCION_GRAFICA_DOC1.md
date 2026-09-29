# Plan de producción gráfica de Path to Godhood

**Versión:** 1.0  
**Fecha:** 18 de septiembre de 2026  
**Documento:** 1 de 3  
**Estado del proyecto:** Fase 1 abierta  
**Complemento de:** Plan de recuperación UI y sus briefs R0 a R10  

El objetivo es construir una interfaz que se pueda jugar y leer dentro de una escena coherente. La producción seguirá una ruta híbrida: **Nano Banana Pro** para la pintura y los materiales; **Krita** para separar, corregir y preparar capas; **Inkscape y SVG** para geometría exacta; **React y CSS** para texto, interacción y movimiento. Primero se validará una composición del Desván con tres objetos funcionales. Esa prueba fijará el lenguaje visual de los demás recursos.

Este plan complementa el plan de recuperación UI y sus briefs R0 a R10. La Fase 1 continúa abierta. Las propuestas de cámara, paleta, tamaños y presupuesto de este documento se ratifican en R1; producir referencias no equivale a aprobarlas. No se cambia el motor, el balance, Tier L, los caminos activos ni el contenido narrativo.

---

## 1. Resultado que debemos conseguir

El jugador debe reconocer los objetos importantes, entender su estado cualitativo y encontrar la siguiente acción sin depender de un HUD numérico. El arte tiene que soportar foco con teclado, ampliación, lectura de prosa, estados bloqueados y movimiento reducido. Una imagen atractiva sólo se acepta cuando funciona dentro de la interfaz.

La primera entrega jugable reúne habitación, mesa, vela, espejo y libro. Permite enfocar cada objeto, leer su descripción, abrir y cerrar el libro y ver cambios de estado suministrados por fixtures autorizadas. Después se incorporan identidad, economía y tiempo; investigación; bazar; combate; prólogo y ascensión. Las pruebas de arte no inventan efectos de dominio ni adelantan el calendario.

Quedan fuera de este lote las ilustraciones promocionales, vídeos, audio, un mundo 3D y retratos de todo el reparto. Los retratos, objetos y escenarios que sí use la UI se incorporan por sus identificadores reales. Una cifra histórica de personajes o artefactos no determina automáticamente cuántas imágenes hacen falta.

---

## 2. Qué herramienta conviene para cada trabajo

| Trabajo | Opción principal | Motivo y alternativa |
| :--- | :--- | :--- |
| **Dirección de arte y pintura** | Nano Banana Pro | Buen encaje para explorar composición y editar con referencias. Seleccionar el modelo explícitamente; no sustituirlo automáticamente. |
| **Recorte y pintura correctiva** | Krita | Control de máscaras, bordes y capas. Photoshop puede ocupar este puesto si ya forma parte del equipo. |
| **Iconos y geometría** | Inkscape y SVG | Formas editables y medidas exactas. Figma sirve para revisar componentes si ya está disponible. |
| **Texto y controles** | React y CSS | Localización, accesibilidad, selección y escalado; las palabras no se hornean en el arte. |
| **Llama, humo, foco y transiciones** | SVG y CSS | Variantes consistentes, respuesta inmediata y alternativa de movimiento reducido. |
| **Cámara difícil de mantener** | Blender fuera del juego | Bloqueo opcional de cámara y luces mediante un modelo sencillo; se exportan imágenes 2D. |
| **Producción repetida** | Gemini API y registro local | Permite conservar parámetros y referencias. MCP es una capa opcional de control. |
| **Revisión de diseños** | Figma opcional | Útil para comparar composiciones; no es necesario para producir o integrar el arte. |

Google identifica Nano Banana Pro como `gemini-3-pro-image`. Confirmar disponibilidad en la cuenta antes de generar y registrar el identificador devuelto. La capacidad de generar PNG no garantiza transparencia utilizable, capas editables ni repetición exacta de píxeles. La ficha y las opciones vigentes se consultan en el [modelo oficial](https://ai.google.dev/gemini-api/docs/models/gemini-3-pro-image) y la [guía de generación](https://ai.google.dev/gemini-api/docs/image-generation).

La selección de herramientas responde a las necesidades del proyecto; no presupone que exista un ganador universal ni que un prompt garantice un resultado perfecto. La calidad final se consigue fijando referencias, corrigiendo el material y verificándolo en la escena.

---

## 3. Contrato visual antes del trabajo en serie

La dirección propuesta es una pintura digital de realismo contenido, con objetos táctiles y desgaste localizado: madera de caoba, latón opaco, cuero, sebo, papel de fibra y azogue. La cámara mira una mesa de trabajo dentro de un desván de Backlund. El misterio se expresa mediante materiales, sombras y anomalías pequeñas. La luz debe permitir distinguir los objetos incluso cuando la escena está oscura.

El Director ratifica una composición maestra, una muestra de materiales y una hoja con tres objetos terminados. Se registran como **C0**, **S0** y **O0** con versión y hash. Cada nueva generación recibe las referencias pertinentes; repetir adjetivos en un prompt no sustituye esa evidencia visual.

| Elemento | Propuesta que se ratifica en R1 |
| :--- | :--- |
| **Encuadre** | Tres cuartos ligeramente elevado; perspectiva consistente y profundidad moderada. |
| **Luz principal** | Cálida desde la izquierda de pantalla; relleno frío tenue desde la ventana derecha. |
| **Jerarquía** | Un foco dominante; los demás objetos visibles sin competir con la acción activa. |
| **Distribución** | Mesa para cuerpo e identidad; pared para investigación y amenaza; estante para ascensión. |
| **Contraste** | Siluetas separadas del fondo; papel de lectura suficientemente claro. |
| **Ornamentación** | Marcas materiales y herrajes sobrios; ningún emblema narrativo inventado. |
| **Lenguaje** | Texto vivo; etiquetas de reposo de hasta siete palabras; estados expresados con objetos. |

**Paleta inicial del plan UI:**
- Vacío `#090807`
- Tinta `#17120e`
- Caoba `#402717`
- Latón `#a68444`
- Papel `#e8dcc4`
- Tinta de papel `#241d16`
- Peligro `#8f2f31`
- Éter `#7961a8`
- Foco `#f0d48d`

*Son referencias de color, no una instrucción para teñirlo todo del mismo tono. Se comprobarán contraste y distinción de estados en la UI.*

**Presets de cámara:** `wide`, `desk-left`, `desk-center`, `desk-right`, `wall-board`, `ritual` y `combat`. Son transformaciones de una composición aprobada; no siete habitaciones regeneradas por separado. Un cambio de encuadre que descubra superficies antes ocultas requiere completar esas superficies antes de integrar el movimiento.

---

## 4. Estructura de capas y formatos

La escena se compone de pared y ventana, estante, escalera o puerta, mesa, objetos, sombras de contacto, efectos locales y primer plano. La iluminación y la atmósfera tienen capas independientes. El texto, los botones semánticos y las áreas interactivas viven por encima y no forman parte de la pintura.

Un archivo plano puede servir como referencia de composición. Para producción, cada objeto que se mueve o cambia de estado necesita su propia capa y una superficie limpia detrás. No se aceptará una mesa con objetos impresos bajo los objetos interactivos: produce duplicados al enfocarlos o retirarlos.

| Familia | Maestro propuesto | Entrega para la UI |
| :--- | :--- | :--- |
| **Escena completa** | 3840 × 2160 tras preparación | Versiones 1920 y 2560 de ancho según prueba de nitidez y peso. |
| **Objetos principales** | Lienzo hasta 2048 × 2048 | Recorte con alpha y metadatos de posición; tamaño según su ampliación real. |
| **Libro o papel abierto** | Hasta 2048 × 1536 | Textura sin texto y máscara; prosa HTML encima. |
| **Retratos o fichas** | Hasta 1536 × 2048 | Recortes del mismo maestro para los tamaños necesarios. |
| **Iconos y estados** | SVG con viewBox estable | Tamaños de uso 24, 32 y 48; forma legible en el menor. |
| **Máscaras y sombras** | Tamaño y origen del maestro | Alpha o SVG; sombra separada del cuerpo del objeto. |
| **Material repetible** | 1024 o 2048 de lado | Exportación sólo después de comprobar las uniones. |

Estos son tamaños de preparación, no dimensiones que el modelo garantice por escribirlas en el prompt. Solicitar el nivel 2K o 4K y la proporción admitida; medir la respuesta y ajustar de forma controlada. No estirar una imagen para hacerla coincidir. Si el recorte elimina una parte útil, corregir el encuadre antes de reducirla.

Maestros conservados en KRA o PSD si se utiliza Photoshop, SVG y PNG sin pérdida. Exportaciones web en WebP, AVIF o PNG según transparencia, nitidez, decodificación y soporte real del proyecto. Comparar sobre el fondo de destino. Mantener perfil sRGB y evitar halos causados por bordes contaminados de color.

Para todos los tamaños de ventana, utilizar el mismo sistema lógico de 1920 × 1080, con escala uniforme y zonas seguras. Verificar 1280 × 720, 1366 × 768, 1440 × 900, 1920 × 1080 y 2560 × 1440. Los controles no desaparecen al recortar el entorno; bajo 1024 píxeles se mantiene la estrategia de compatibilidad del plan UI.

---

## 5. Inventario de recursos y cobertura

El catálogo del Documento 3 y `manifest.json` identifican las órdenes exactas. Una orden puede producir una familia de variantes; una plantilla puede expandirse a varios IDs reales. El número de prompts no equivale al número final de imágenes.

| Familia | Recursos y estados | Dependencia |
| :--- | :--- | :--- |
| **Entorno** | Composición, fondo limpio, mesa, estante, escalera, primer plano y luz. | R1 y cámara aprobada. |
| **Once objetos del Desván** | Vela, espejo, grietas, libro, identidad, bolsa, tiempo, carta, corcho, cáliz y escalera. | R3; almanaque y reloj comparten la función de tiempo. |
| **Estados somáticos** | Vela con cuatro estados; espejo con cuatro; mesa con cinco niveles de grietas. | Mapeo canónico ratificado y fixtures autorizadas. |
| **Superficies compartidas** | Papeles, lacre, marcos, páginas, sombras y máscaras. | Materiales y escala aprobados. |
| **Investigación** | Corcho, tarjetas, alfileres, cuatro relaciones, cajón, hipótesis y ocho pistas del primer caso. | Sólo información descubierta y visible. |
| **Seis orígenes** | Viñetas de oficios sin adjudicar rostro al protagonista. | Correspondencia con los seis IDs canónicos. |
| **Bazar** | Mostrador, bandeja, exposición y plantilla de objetos reales. | Catálogo vigente y estado revelado. |
| **Combate** | Suelo, rejilla de cinco filas y siete columnas, unidades, ocho estados y efectos autorizados. | Encuentros de la porción jugable. |
| **Prólogo** | Zaguán, carta reutilizada, lámpara y dos pociones. | Secuencia y elecciones vigentes. |
| **Ascensión** | Escena ritual, cáliz, cinco puertas lógicas y cuatro elementos de preparación. | Gates y requisitos del dominio. |
| **Sistema** | Foco, cursores, carga, error, vacío, ajustes y movimiento reducido. | Controles semánticos y diseño UI. |
| **Contenido variable** | Retratos, objetos, localizaciones y dilemas realmente usados. | Ficha pública y apariencia aprobada por cada ID. |

La Biblia describe la vela como *Plena, Vacilante, Humeante y Moribunda*; son nombres artísticos, no claves de código confirmadas. `UI.txt` utiliza `BRILLANTE`, `VACILANTE`, `CREPITANTE` y `AHOGADA_EN_CERA`, con diferencias de color. R1 resuelve esa discrepancia antes de preparar estados finales. El espejo contempla *Limpio, Turbio, Ondulante y Monstruoso*; las grietas, `INTEGRO`, `MARCADO`, `EROSIONADO`, `ROTO` y `PERDIDO`. El mapeo al código se registra explícitamente y no crea umbrales.

El combate usa `STUN`, `FEAR`, `FROZEN`, `BLEED`, `CORRUPTED`, `HYPNOTIZED`, `CONCEALED` y `EMPOWERED`, únicamente cuando sean observables para el jugador. Las conexiones del corcho son `ACUSA`, `EXPLICA`, `LOCALIZA` y `CONTRADICE`, distinguidas además por trazo o símbolo. La cuadrícula y los hilos se construyen como vectores.

En ascensión se representan conocimiento de fórmula, dos ingredientes principales exactos más los suplementarios requeridos, digestión completa, preparación y bebida. *Lugar, Momento, Materiales y Anclaje* pertenecen a la preparación. No convertir esos cuatro elementos en cuatro de las cinco puertas ni añadir un objeto mágico para rellenar la quinta.

---

## 6. Orden detallado de producción

### Lote 0: Inventario y contrato
Ejecutar GFX00 y GFX01. Extraer del repositorio real los IDs, las rutas de pantalla, las variantes observables y los recursos existentes reutilizables. Registrar qué requiere un recurso nuevo, qué se resuelve con CSS y qué necesita una decisión de canon. Resolver los conflictos de estados, tiempo, fechas e importes. GFX72 prepara la muestra tipográfica.  
**Entrega:** inventario, dependencias y propuesta visual; ninguna imagen pasa todavía a producción.

### Lote 1: Prueba de dirección de arte
Ejecutar GFX02, GFX03 y, sólo para comparar, GFX04. Producir una hoja de materiales y dos composiciones como máximo en la primera exploración. Elegir una; preparar vela, espejo y libro con la misma cámara. Integrar esos tres objetos en un visor con foco y papel de lectura.  
**Entrega:** captura general, ampliaciones y prueba en los dos tamaños extremos. La aprobación de este lote fija C0, S0 y O0.

### Lote 2: Habitación y objetos funcionales
Preparar las capas de GFX05 a GFX22, después los estados de GFX23 a GFX29. Completar la superficie que queda detrás de cada objeto y comprobar contacto, escala y oclusión. No regenerar el fondo para conseguir una variante de espejo.  
**Entrega:** el Desván sin textos pintados, con máscaras e identificación de cada zona; integración en R3 y ampliación en R4.

### Lote 3: Superficies e investigación
Completar GFX30 a GFX35H. Reutilizar papel y alfileres. Las ocho ilustraciones de pistas son opcionales donde el texto y el objeto ya expliquen la evidencia; sólo se generan las que aparezcan en el diseño aprobado. Comprobar legibilidad del grafo con muchas tarjetas y distinción entre evidencia e hipótesis.  
**Entrega:** en R5, con pruebas de información oculta.

### Lote 4: Identidad y bazar
Preparar las seis viñetas GFX36A a GFX36F, el mostrador y las bandejas GFX37 a GFX39. Expandir GFX60 únicamente para objetos expuestos por la porción jugable.  
**Entrega:** selección de origen consistente y bazar cuyo estado se entienda sin insignias numéricas inventadas; integración según R4 y R6.

### Lote 5: Combate
Completar GFX40 a GFX46 con el escenario y los combatientes reales. Construir rejilla, rangos, selección y ocho marcas vectoriales. Las unidades parten de una ficha de apariencia aprobada; usar fichas recortadas es la propuesta inicial que se ratifica antes de dibujar.  
**Entrega en R7:** mapa legible, blancos identificables y animación que no tape decisiones.

### Lote 6: Prólogo y ascensión
Completar GFX47 a GFX55. Reutilizar carta, lacre y cáliz. Distinguir Ojos de Cobalto y Espejo de Ámbar por material y silueta; los nombres son texto vivo cuando correspondan. Ensayar el gesto de beber sostenido durante tres segundos con las reglas del juego.  
**Entrega en R8:** con los cinco gates representados fielmente.

### Lote 7: Acabado y revisión humana
Aplicar GFX56 a GFX58 y las correcciones GFX68 y GFX69 sólo donde exista un defecto concreto. Exportar mediante GFX63, integrar con GFX66 y revisar con GFX67. R9 incorpora acabado; R10 conserva la revisión humana G4. El agente entrega evidencia y defectos pendientes, sin aprobar su propio trabajo.

---

## 7. Estimación y control del gasto

Propuesta de esfuerzo para una persona con capacidad de retoque e integración:
- **2 a 3 días:** inventario y dirección
- **4 a 6 días:** Desván y estados
- **3 a 5 días:** investigación, identidad y bazar
- **3 a 5 días:** combate y secuencia ritual
- **2 a 4 días:** acabado y pruebas  
**Total orientativo:** 14 a 23 jornadas. No incluye modelado complejo, animación de personajes ni retrasos por decisiones de canon. Reestimar después del piloto.

La variable útil es el **coste por recurso aceptado**, que incluye intentos fallidos y retoque. Registrar intentos, resolución, referencias, tiempo de corrección y motivo de descarte. Propuesta inicial: dos candidatas por recurso nuevo y una corrección dirigida; si sigue fallando, ajustar el brief o pasar a retoque manual antes de gastar en más variantes.

Como referencia de presupuesto, la tarifa Standard consultada indica 0,134 USD de salida por imagen 1K o 2K y 0,24 USD por 4K. Por ejemplo, 120 salidas 2K y 20 salidas 4K suman 20,88 USD sólo en imágenes de salida. Faltan entradas, texto o razonamiento, impuestos y trabajo humano. Revalidar precio y disponibilidad antes de contratar el lote; esta estimación no autoriza gasto. ([Tarifas oficiales de Gemini](https://ai.google.dev/gemini-api/docs/pricing)).

Establecer límites por lote y por día en el ejecutor. Una alerta de facturación no se trata como un corte automático. Si el resultado de una petición es incierto, conservar su registro y comprobarlo antes de reenviarla para evitar cobros duplicados.

---

## 8. Calidad que debe superar cada recurso

| Control | Evidencia de aceptación |
| :--- | :--- |
| **Canon** | ID y ficha de origen; ninguna identidad, pista o propiedad inventada. |
| **Coherencia** | Comparación con C0, S0 y O0; misma perspectiva, material y dirección de luz. |
| **Silueta** | Reconocible al tamaño real; no sólo ampliada en el editor. |
| **Recorte** | Bordes limpios sobre blanco, negro, magenta y el fondo final. |
| **Transparencia** | Alpha real; el damero no está pintado; cristal y sombra se revisan por separado. |
| **Estados** | Diferencia cualitativa visible; misma posición, pivote y tamaño entre variantes. |
| **Información** | Sin texto horneado ni revelaciones del truth model en imágenes o metadatos públicos. |
| **Interacción** | Foco visible, objetivo pulsable suficiente y equivalente textual. |
| **Movimiento** | Animación reversible o estable según el estado; versión de movimiento reducido. |
| **Rendimiento** | Peso, dimensiones y memoria decodificada medidos dentro del juego. |

**Objetivos iniciales a ratificar:** escena inicial comprimida por debajo de 4 MB y crecimiento de JavaScript dentro del límite del plan UI. El peso de descarga no representa la memoria: una capa RGBA de 3840 × 2160 ocupa aproximadamente 31,6 MiB decodificada. Recortar capas a sus límites y cargar los detalles al necesitarlos; no apilar diez lienzos completos por comodidad.

Un recurso se rechaza si falla canon, información oculta, alpha o lectura funcional. Un promedio estético alto no compensa esos fallos. Los defectos se describen con ubicación y cambio requerido: *“el borde del espejo tiene halo claro sobre la pared”*, en lugar de *“se ve raro”*.

---

## 9. Organización de archivos y trazabilidad

Separar referencias aprobadas, candidatos, maestros, exportaciones y QA. Mantener el material de autoría fuera del paquete web. En el repositorio usar la ruta de recursos ya existente; no imponer una migración para adoptar esta estructura propuesta.

| Carpeta propuesta | Contenido |
| :--- | :--- |
| `art/reference` | C0, S0, O0 y fichas públicas de apariencia. |
| `art/jobs` | Prompt, parámetros, referencias por hash y resultado por intento. |
| `art/source` | KRA, SVG, PNG maestros y capas corregidas. |
| `art/review` | Comparativas, capturas y decisiones humanas. |
| `art/manifest` | Inventario, dependencias y estado de aprobación. |
| `assets/ui` | Sólo exportaciones aprobadas que use la aplicación. |

**Nombre de autoría:** `familia_id_estado_v001.ext`. Las variantes conservan el ID y cambian versión. En la distribución utilizar nombres opacos cuando un nombre canónico revele una pista; además, no incluir recursos secretos antes de que el contrato de carga permita mostrarlos. Ofuscar un nombre por sí solo no protege un spoiler.

Cada registro contiene ID, función, fuente canónica, visibilidad, prompt, modelo, fecha, referencias, dimensiones, pivote, posición, área interactiva, sombra, animación, licencia o procedencia, aprobador y exportaciones. El ZIP entregado aporta el catálogo de órdenes; el inventario de producción se completa con GFX00 y GFX70.

---

## 10. Orden para comenzar

1. Leer el Documento 2 y ejecutar GFX00.
2. Completar el contrato propuesto mediante GFX01, producir S0 y las composiciones de exploración y presentar el piloto con vela, espejo y libro.
3. La primera decisión visual se toma sobre esa evidencia. Las siguientes órdenes operan únicamente sobre referencias aprobadas y conservan el avance de R0 a R10.

**Fuentes de proyecto:** Biblia técnica, `UI.txt`, `AGENTS.md`, Plan de recuperación UI y manuales de implementación. El Documento 2 incluye las fuentes técnicas y la configuración de herramientas.

