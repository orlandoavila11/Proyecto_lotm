# Manual de herramientas y producción gráfica de Path to Godhood

**Versión:** 1.0  
**Fecha:** 18 de septiembre de 2026  
**Documento:** 2 de 3  
**Estado del proyecto:** Fase 1 abierta  
**Complemento de:** Plan de producción gráfica (Doc 1) y Plan de recuperación UI (R0–R10)  

Este manual permite producir, preparar e integrar los recursos del plan gráfico. La ruta inicial recomendada es **Google AI Studio** para seleccionar el estilo, **Krita** para terminar las imágenes e **Inkscape con SVG** para construir los elementos precisos. Cuando el piloto funcione, **Gemini API** puede automatizar los lotes. **Antigravity** puede coordinar esa automatización mediante un adaptador MCP local.

Figma se ha conectado durante la preparación de este paquete. La generación mediante Gemini y el adaptador MCP local todavía requieren configuración y prueba; el adaptador descrito aquí es una especificación por implementar. No se necesita esperar a esa integración para empezar a trabajar manualmente con las referencias y los prompts.

---

## 1. Orden de autoridad y restricciones

Aplicar las decisiones del Director y el contrato visual vigente, el mapa operativo `AGENTS.md`, la Biblia técnica y el plan UI. Ante un conflicto real, documentar las dos fuentes y la decisión necesaria; no reinterpretar el canon para facilitar una imagen. Conservar Fase 1 abierta, React y TypeScript, Fool y Visionary y los seis orígenes. No alterar balance, motores core, Tier L ni información secreta.

El agente trabaja sobre un lote. Antes de modificar el repositorio identifica archivos y cambios existentes; al terminar entrega imágenes, rutas, pruebas y defectos. No se autoaprueba, no cierra R10 y no presenta una captura generada como prueba de una pantalla implementada. Las órdenes de este paquete no sustituyen los cierres y controles del manual operativo anterior.

La prosa, las fechas, los importes permitidos y las etiquetas se construyen en la UI. No generar barras de estadísticas, porcentajes, números mecánicos ni insignias de rareza inventadas. La decisión sobre importes diegéticos sigue el contrato de R1. Un efecto visual sólo refleja el estado observable que entregue el dominio.

Las skills ya seleccionadas para diseño, React y pruebas pueden ayudar a ejecutar estas tareas dentro de sus funciones. Ninguna skill modifica el contrato visual ni convierte en oficial un servidor comunitario. No hace falta instalar otra colección de skills para producir este lote.

---

## 2. Preparar las herramientas

Instalar Krita desde su sitio oficial e Inkscape desde el suyo, usando los instaladores del sistema operativo. Registrar versiones antes del piloto. Blender sólo se incorpora si es necesario fijar una cámara o resolver perspectiva que el trabajo 2D no mantenga. Las tres aplicaciones pueden utilizarse sin un conector MCP.

En Krita se mantiene un archivo de capas por recurso o familia. En Inkscape se conservan los vectores editables. En el repositorio se prepara un visor de recursos aislado o una ruta de desarrollo existente, con fondo final, selector de estado, escala de inspección y simulación de foco. No abrir una nueva arquitectura de aplicación para este visor.

Los procedimientos de selección de Krita y exportación de Inkscape están documentados por sus proyectos:
- [Selecciones de Krita](https://docs.krita.org/en/user_manual/selections.html)
- [Exportación por consola en Inkscape](https://wiki.inkscape.org/wiki/Using_the_Command_Line)

*El renderizado opcional en Blender se prepararía fuera del runtime del juego.*

---

## 3. Producir el piloto con Nano Banana Pro

1. **Acceso al modelo:** Abrir Google AI Studio con la cuenta destinada al proyecto. Revisar que el modelo Nano Banana Pro está disponible y seleccionar `gemini-3-pro-image`, identificado en la ficha oficial. Si la cuenta sólo ofrece otro modelo, registrar el bloqueo antes de cambiarlo.
2. **Facturación y límites:** Revisar facturación, límites y condiciones aplicables a esa cuenta. Una suscripción a otra aplicación no acredita que exista cuota de API. Consultar la tarifa vigente y fijar el presupuesto del lote antes de generar.
3. **Exploración inicial:** Empezar por GFX02 y GFX03. En esta exploración todavía no existe una referencia aprobada. Usar las propuestas del contrato y guardar cada candidata con sus parámetros. GFX04 sirve para comparar una alternativa controlada.
4. **Fijar C0, S0 y O0:** Tras seleccionar la composición, guardar C0 y la muestra de materiales S0. Producir la vela, el espejo y el libro. Presentarlos juntos y a tamaño de juego antes de aprobar el conjunto O0. Desde ese punto, adjuntar las referencias que indique cada entrada del catálogo.
5. **Configuración de la petición:** Copiar el archivo TXT del prompt correspondiente. La proporción, el tamaño de salida y las referencias se configuran también en la herramienta o petición; escribir “4K” en el texto no fija por sí solo esos parámetros.
6. **Resolución progresiva:** Pedir primero una candidata a 2K. Corregir un defecto cada vez mediante edición con el original como referencia. Reservar 4K para el fondo aprobado y los detalles que realmente se amplíen. Descargar el archivo original del resultado; no usar una captura de pantalla como maestro.
7. **Registro y pase a Krita:** Registrar modelo real, fecha, prompt, parámetros, referencias y coste conocido. Llevar el resultado a Krita para preparar las capas. El estado de un resultado nuevo es `CANDIDATE`, nunca `APPROVED`.

Las opciones de formato, proporción y resolución y el uso de imágenes de referencia están descritos en la [guía oficial de generación](https://ai.google.dev/gemini-api/docs/image-generation). El modelo concreto se verifica en su [ficha oficial](https://ai.google.dev/gemini-api/docs/models/gemini-3-pro-image). No asumir una semilla determinista, un campo separado de negative prompt o exportación PSD si la interfaz utilizada no los documenta.

---

## 4. Automatizar mediante Gemini API

Crear una clave desde Google AI Studio para el proyecto adecuado. Configurar `GEMINI_API_KEY` en el entorno del proceso local que ejecutará la generación. No introducirla en un prompt, en el frontend, en un archivo de recursos público o en el JSON versionado del proyecto. Si también existe `GOOGLE_API_KEY`, comprobar cuál usará el SDK para evitar una cuenta de facturación equivocada. ([Configuración oficial de claves](https://ai.google.dev/gemini-api/docs/api-key)).

Usar un entorno de Python separado del juego. Instalar `google-genai` desde su distribución oficial, registrar la versión resuelta y fijarla en el archivo de dependencias después de verificar la integración. Si se desarrolla el puente MCP, añadir el SDK oficial de MCP en ese mismo entorno. No copiar una clave a un ejemplo de código para resolver un problema de autenticación.

La documentación consultada muestra la API Interactions. Este es el cuerpo orientativo de una petición de imagen (`PROMPT_COMPLETO` se sustituye por el TXT y no se envía como literal. Para las imágenes de referencia se sigue el esquema multimodal de la versión del SDK instalada):

```json
{
  "model": "gemini-3-pro-image",
  "input": "PROMPT_COMPLETO",
  "response_format": {
    "type": "image",
    "mime_type": "image/png",
    "aspect_ratio": "16:9",
    "image_size": "2K"
  }
}
```

- **Endpoint documentado:** `https://generativelanguage.googleapis.com/v1beta/interactions`
- La clave se envía mediante autenticación del cliente, nunca dentro del texto del prompt.
- El puente debe comprobar la presencia de una imagen válida en la respuesta y conservar el identificador de la interacción cuando exista. Un HTTP correcto sin archivo decodificable no se registra como recurso generado. ([Referencia de generación](https://ai.google.dev/gemini-api/docs/image-generation)).

El primer ensayo de la integración es local y sin gasto: validar configuración, leer una referencia permitida y simular una respuesta. Después ejecutar una única imagen con presupuesto asignado. No procesar el catálogo completo como prueba de conexión. En errores de cuota, autenticación, política o modelo no disponible, devolver la causa y no cambiar de proveedor ni repetir indefinidamente.

---

## 5. Conectar Antigravity mediante MCP

El recorrido propuesto es: **Antigravity → servidor local por stdio → Gemini API → carpeta de candidatos**. El servidor recibe tareas de imagen limitadas; Gemini produce la imagen; el servidor la valida y devuelve ruta y metadatos. MCP no añade capacidades de dibujo al modelo ni sustituye la preparación manual.

No se ha validado en esta sesión un conector de Nano Banana listo para instalar. La opción verificable es la API oficial y un adaptador local pequeño. GFX64 contiene la orden detallada para implementarlo; GFX65 prueba su conexión. Si posteriormente se elige un servidor comunitario, revisar código, versión, permisos y mantenimiento antes de sustituir esta ruta.

### Configuración en clientes Antigravity:
- **Antigravity IDE:** Menú de tres puntos del panel del agente → *MCP Servers* → *Manage MCP Servers* → *View raw config*.
- **Antigravity 2.0:** *Settings* → *Customizations* → *Installed MCP Servers*.
- **CLI:** `/mcp`.
- **Rutas de configuración:** Global en `~/.gemini/config/mcp_config.json` y del proyecto en `.agents/mcp_config.json`. Si la instalación difiere, abrir su configuración desde la UI; no crear varios archivos por ensayo. ([MCP de Antigravity](https://antigravity.google/docs/mcp)).

Añadir una entrada al objeto `mcpServers` existente, conservando los demás servidores. Este ejemplo permanece desactivado hasta que el archivo del servidor exista, las rutas sean reales y GFX65 supere la prueba. `GEMINI_API_KEY` se obtiene del entorno local seguro; no se pega en este bloque:

```json
{
  "mcpServers": {
    "ptg-art": {
      "command": "/RUTA/AL/ENTORNO/bin/python",
      "args": ["/RUTA/AL/PUENTE/ptg_art_mcp.py"],
      "cwd": "/RUTA/AL/PUENTE",
      "env": {
        "PTG_ART_ROOT": "/RUTA/AL/PROYECTO/art",
        "PTG_ART_DRY_RUN": "1"
      },
      "disabled": true
    }
  }
}
```

*En Windows se utilizan rutas absolutas al ejecutable `python.exe` del entorno y al archivo del servidor, con barras válidas en JSON. La clave debe estar disponible para el proceso que abre Antigravity; una terminal distinta puede tener otro entorno. El servidor sólo informa si existe una credencial, nunca muestra su contenido.*

Después de implementar y probar el adaptador: cambiar `disabled` a `false`, recargar servidores, inspeccionar las herramientas expuestas y ejecutar `get_capabilities` y `validate_job`. Mantener `PTG_ART_DRY_RUN` en `1` hasta que el lote tenga un límite de gasto. Una conexión se considera comprobada cuando devuelve un resultado local verificable; figurar como “instalado” no demuestra una generación.

### Contrato del adaptador propuesto

| Herramienta propia | Entrada y resultado requerido |
| :--- | :--- |
| `get_capabilities` | Informa versión, modelo configurado, formatos y modo simulado; nunca secretos. |
| `validate_job` | Comprueba ID, referencias, campos, coste y salida permitida sin llamar a generación. |
| `generate_asset` | Recibe un job validado; devuelve ID de trabajo y resultado o estado en curso. |
| `edit_asset` | Añade una referencia base explícita y el cambio localizado; no promete inmovilidad perfecta. |
| `get_job` | Devuelve estado, archivo, dimensiones, hash y error real si existe. |

*Estos nombres son el contrato a implementar, no herramientas de Google ya disponibles. Cada trabajo guarda una clave local de deduplicación basada en prompt, referencias y parámetros. Ante un timeout, marcar `UNKNOWN` y reconciliar el estado antes de reenviar; la deduplicación local no garantiza idempotencia del proveedor.*

Limitar referencias y salidas a `PTG_ART_ROOT` después de resolver rutas y enlaces simbólicos. No exponer una herramienta de shell genérica. Validar MIME, tamaño y decodificación; escribir con nombres nuevos y no sobreescribir maestros. Los logs van a `stderr` para no corromper el protocolo stdio. Fijar concurrencia inicial en una petición y aplicar límites de intentos y presupuesto.

El servidor se construye siguiendo la guía y el SDK oficial de MCP, con sus versiones fijadas tras la prueba. ([Guía de creación de servidores MCP](https://modelcontextprotocol.io/docs/develop/build-server)).

---

## 6. Figma y otras conexiones opcionales

Figma puede alojar el contrato visual, variantes de componentes y comparativas. Su plugin ya está conectado para esta solicitud. La conexión en ChatGPT no configura automáticamente Figma en Antigravity ni demuestra que se haya leído o editado un archivo. Antes de producir en un lienzo, identificar el archivo de trabajo y probar las herramientas efectivamente expuestas para esa operación.

El servidor remoto oficial utiliza `https://mcp.figma.com/mcp` y autenticación. Su documentación limita la conexión a clientes incluidos en el catálogo de Figma; comprobar allí la admisión de la versión concreta de Antigravity antes de prometer compatibilidad. La escritura en el lienzo también depende de las capacidades disponibles. ([Instalación oficial de Figma MCP](https://developers.figma.com/docs/figma-mcp-server/remote-server-installation/)).

Si se admite ese cliente, configurar la dirección remota con `serverUrl` en Antigravity y completar el flujo de autenticación que muestre. No copiar literalmente un ejemplo de otro editor que use otra clave de configuración. Si no se admite, usar Figma manualmente, el plugin disponible en un cliente compatible o Inkscape con exportaciones SVG. Ninguna de estas alternativas bloquea la producción de imágenes.

Krita e Inkscape no necesitan un MCP para este plan. El agente puede preparar SVG y tareas de exportación; el artista realiza el retoque y revisa el resultado. Un futuro adaptador local puede exponer operaciones concretas, pero no se considera instalado por aparecer en el documento. Tampoco se necesita un MCP de Blender para su función opcional de referencia de cámara.

---

## 7. Separar y terminar las capas en Krita

1. **Estructura inicial:** Abrir la imagen descargada y conservar una copia intacta. Crear capas separadas para cuerpo del objeto, material transparente, reflejos, sombra de contacto y efectos. Nombrarlas con el ID de autoría.
2. **Máscara y bordes:** Crear una máscara de selección y revisar la silueta al 100 % y 200 %. Retirar el fondo sobre pruebas blanca, negra, magenta y final. Corregir manualmente cabello fino, cera, cordones y bordes metálicos. No confundir un damero generado con un canal alpha.
3. **Sombras de contacto:** Separar la sombra del cuerpo. Evitar una sombra pintada dos veces al integrar. Si el recorte altera la luz del borde, descontaminar ese borde con color local. Mantener los huecos interiores realmente transparentes.
4. **Cristal y líquidos:** Para cristal y líquido, reconstruir transmisión, borde, brillo y sombra en capas distintas. Una botella recortada de un fondo gris puede conservar ese gris dentro del cristal; no basta con borrar el contorno. Comprobar el objeto sobre el tablero y sobre un fondo de contraste.
5. **Superficie detrás del objeto:** Completar la superficie situada detrás de los objetos extraídos. Si se usa relleno generativo, compararlo con la perspectiva original y limpiar geometrías inventadas. Exportar la capa y su origen dentro del lienzo lógico, incluso cuando se recorte a límites ajustados.
6. **Alineación y pivotes:** Fijar pivote y encuadre antes de producir variantes. Abrir dos estados superpuestos para detectar desplazamientos. Una edición que cambie tamaño, cámara o marcos vuelve a corrección. Para cambios leves conviene pintar una capa sobre el maestro aprobado.
7. **Exportación y procedencia:** Guardar el maestro editable y exportar un PNG de referencia sin pérdida. La compresión web se realiza después. Conservar la procedencia del archivo y las referencias; no intentar eliminar mecanismos de procedencia del proveedor.

---

## 8. Construir vectores y movimiento

Los iconos de estados, hilos de investigación, áreas de interacción, marcos, cursores y rejilla se trazan con SVG. No se vectorizan automáticamente letras o formas defectuosas generadas. Adoptar una misma familia de grosores, remates, márgenes y tamaños ópticos. Los iconos no incluyen texto; su nombre accesible se añade en el control de la aplicación.

La rejilla de combate tiene siete columnas y cinco filas. Cada celda parte de sus coordenadas del dominio, `x` entre 0 y 6 e `y` entre 0 y 4. Dibujar la malla con geometría calculada, y mantener la transformación entre coordenadas lógicas y pantalla. Las marcas de selección y rango no alteran la posición de las unidades.

**Relaciones en el corcho (propuesta gráfica a ratificar):**
- `ACUSA`: Rojo con trazo continuo
- `EXPLICA`: Azul con guiones
- `LOCALIZA`: Verde con marcas de dirección
- `CONTRADICE`: Amarillo con doble marca  
*(Acompañar las relaciones de texto accesible y comprobarlas en escala de grises).*

Crear llama, humo, polvo, ondulación del azogue y foco con capas SVG o CSS. Mantener separado el estado estable de su transición. Con movimiento reducido, mostrar el estado final sin oscilación ni desplazamiento de cámara. El feedback no debe depender de una animación para ser entendido.

**Tiempos iniciales del plan:**
- Respuesta: 80 a 120 ms
- Objeto: 180 a 260 ms
- Cámara: 380 a 550 ms
- Consecuencia: 600 a 1200 ms  
*(Son límites de diseño por validar, no esperas obligatorias antes de habilitar controles. La bebida del prólogo conserva su gesto sostenido de tres segundos y las reglas de interrupción del juego).*

---

## 9. Instanciar prompts y proteger el contenido

El ZIP contiene un TXT por orden y `manifest.json` con ruta, tipo, referencias y condiciones. Los prompts de imagen conocidos están completos. Las plantillas de contenido variable declaran sus campos pendientes: `ID_REAL`, `FICHA_PUBLICA_APROBADA` y referencias específicas. GFX70 los sustituye usando el inventario real y produce los prompts finales por ID. No enviar una plantilla con campos sin resolver al modelo.

No subir la Biblia completa ni el truth model para generar un objeto. Preparar una ficha visual con sólo la apariencia y la información que el jugador puede conocer en ese estado. Una pista oculta puede existir en autoría, pero su imagen, nombre y texto alternativo no deben publicarse antes de tiempo. Revisar también precargas, índices y manifiestos del cliente.

Los retratos requieren una ficha de apariencia aprobada. Si sólo se conoce el nombre o el cargo, utilizar temporalmente un recurso neutral acordado o dejar la ilustración pendiente. No deducir edad, rostro, género o vestimenta particular de un personaje que el canon no describe. Las viñetas de orígenes muestran herramientas del oficio, no rostros adjudicados al jugador.

---

## 10. Exportar e integrar en la UI

Crear por recurso un manifiesto de producción que incluya:
- `sourceId`
- `stateKey`
- `visibility`
- `sourceFile`
- `exportFile`
- `width`
- `height`
- `pivot`
- `logicalBounds`
- `hitRegion`
- `shadowFile`
- `motionRegion`
- `altKey`
- `promptId`
- `references`
- `model`
- `provenance`
- `approval`

*Los nombres internos no deben filtrarse a la versión pública cuando revelen contenido.*

Las variantes de resolución se obtienen del mismo maestro aprobado. Elegir un solo formato servido por variante para evitar descargar duplicados; conservar alternativas fuera del bundle o seleccionarlas con mecanismos existentes. Las imágenes de detalle se cargan al abrir el objeto. Evitar descargar todos los estados y todas las pistas durante la entrada al Desván.

Montar las capas en el orden aprobado y comparar con C0. Aplicar las transformaciones a pintura y objetivos interactivos de forma coordinada. El área pulsable puede ser mayor que la silueta cuando haga falta, pero nunca debe invadir un objetivo vecino. El foco permanece visible sobre fondos claros y oscuros.

No elegir un estado artístico calculando de nuevo reglas del dominio en la UI. El adaptador visual consume el estado observable, selecciona el recurso correspondiente y tiene un fallback explícito para datos desconocidos. Un fallback neutral no oculta un error de contrato: éste se registra en desarrollo.

---

## 11. Pruebas y criterios de cierre

1. **Orden de pruebas:** Primero revisar el objeto aislado y sus estados; después la escena completa; finalmente la acción jugable que lo utiliza.
2. **Entornos de verificación:** Hacer capturas en las cinco resoluciones del plan, probar teclado y movimiento reducido, revisar lectura de prosa y verificar que ningún recurso desconocido revela contenido. Medir carga real, memoria estimada y fluidez en el equipo de referencia, dejando constancia de sus características.
3. **Puntos de control:** Probar alpha en cuatro fondos, alineación entre estados y sombras, legibilidad de iconos al tamaño de uso, exactitud de la rejilla 5 × 7, mapeo de los cinco gates y las cuatro piezas de preparación, y ausencia de texto horneado. OCR puede ayudar a encontrar letras accidentales, pero la revisión visual decide si se han eliminado.
4. **Estados de producción:** `PLANNED`, `CANDIDATE`, `IN_REVIEW`, `APPROVED` o `REJECTED`. Un error de servicio puede tener estado `FAILED` o `UNKNOWN` en el registro de ejecución; esos estados no aprueban ni rechazan artísticamente un recurso. Sólo el Director o revisor designado aprueba. Una nueva versión del maestro invalida la aprobación de las exportaciones afectadas.
5. **Reporte final:** Incluye lote y brief, versión de referencias, recursos entregados, intentos y gasto conocido, defectos corregidos, capturas reales, pruebas ejecutadas o pendientes y `HUMAN_REVIEW`. En cambios de código conserva los campos de cierre del manual operativo UI, con commit y CI reales cuando existan. No inventar evidencia para completar un formato.

---

## 12. Primer trabajo que debe ejecutar el agente

1. Ejecutar **GFX00** para inventariar y **GFX01** para formular el contrato.
2. Producir el piloto con **GFX02** y **GFX03**, usando **GFX04** sólo si aporta una comparación útil.
3. Preparar vela, espejo y libro y mostrarlos en la escena con controles reales.
4. Después de la decisión sobre **C0**, **S0** y **O0**, avanzar por los lotes del Documento 1.
5. La automatización por MCP se añade cuando esa producción manual ya sea consistente.

