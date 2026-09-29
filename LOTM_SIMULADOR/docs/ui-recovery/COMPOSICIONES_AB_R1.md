# COMPOSICIONES CONCEPTUALES A Y B — BRIEF-10.VISUAL-R1
**Proyecto:** Path to Godhood (*LOTM_ENGINE_REBORN*)  
**Fecha:** 18 de septiembre de 2026  
**Lienzo Lógico:** `1920 × 1080` (Desktop-First, escala proporcional uniforme)  
**Viewport Principal de Verificación:** `1440 × 900`  
**Viewports de Compatibilidad:** `1280 × 720`, `1366 × 768`, `1920 × 1080`, `2560 × 1440`  

---

## 1. Principio Rector de Diseño

Ambas composiciones representan **el mismo lugar canónico**: *El Desván de Backlund en el año 1353 de la Quinta Época*, el refugio secreto donde el protagonista vive su doble vida como civil y Beyonder.

En ambas opciones se cumple estrictamente:
- **ESTADO = OBJETO:** Vela (Sanidad), Espejo (Corrupción), Caoba (Ruina), Bolsa (Dinero), Papeles (Identidad/Anclas), Libro (Actuación), Corcho (Investigación), Reloj/Almanaque (Calendario), Carta sellada (Bazar), Picaporte/Arma (Combate), Cáliz (Ascensión).
- **MOMENTO = PROSA:** En reposo, etiquetas de máximo 7 palabras; la prosa descriptiva surge al tocar o en ceremonias.
- **CERO STATS MECÁNICOS:** Prohibido mostrar HP, barras de widgets, porcentajes o modificadores numéricos.
- **ELIMINACIÓN DE BOTONES FLOTANTES:** Mueren los pills de "Velo", "Bazar", "Calendario" y "Guardia". Cada acción nace de un objeto físico en el espacio.

---

## 2. Propuesta A: "El Escritorio del Investigador" (Encuadre Táctil en Primer Plano)

### A. Concepto y Atmósfera
- **Perspectiva:** Primer plano cinematográfico ligeramente cenital (inclinación de 15° hacia la mesa). La sensación es la de estar sentado físicamente frente al escritorio de caoba con las manos listas para interactuar.
- **Distribución Espacial del Lienzo 1920x1080:**
  - **35% Superior (Pared del Desván):** Papel tapiz damasco envejecido, ventana gótica con lluvia y niebla de Backlund a la izquierda, espejo ovalado con marco de latón en el centro, y corcho de notas policiales a la derecha.
  - **65% Inferior (Mesa de Caoba):** Tablero de madera pulida con vetas oscuras que alberga todos los objetos interactivos principales con sombras proyectadas por la vela.

### B. Esquema ASCII de Disposición — Propuesta A

```
+-----------------------------------------------------------------------------------------+
| [VENTANA GÓTICA]                [ESPEJO DE AZOGUE]               [TABLERO DE CORCHO]    |
| Luz de gas lejana               Reflejo de Corrupción            Expediente Cherwood    |
| Lluvia y niebla                 Marco de latón victoriano        Chinchetas e hilos     |
|                                                                                         |
|-----------------------------------------------------------------------------------------|
| [LA VELA DE SEBO]       [PLIEGOS NOTARIALES]   [CUADERNO CUERO]    [MONEDERO CUERO]     |
| Llama viva de Sanidad   Identidad y 3 Anclas   Diario de Actuación  Monedas de Loen     |
| Candelero de peltre     Firma y Carga Civil    Digestión y Principio                    |
|                                                                    [CARTA DEL BAZAR]    |
| [RELOJ / ALMANAQUE]                                                Misiva sellada       |
| Reloj de faltriquera                                                                    |
| Franja Horaria                                                     [CAJÓN / PICAPORTE]  |
|                                                                    Alerta de Combate    |
|                       ~~~ GRIETAS DE RUINA EN LA CAOBA ~~~                              |
+-----------------------------------------------------------------------------------------+
```

### C. Ventajas y Características de la Propuesta A
1. **Máxima Inmersión Táctil:** Los documentos, pliegos, libro y monedas se leen con naturalidad a escala humana.
2. **Claridad de Lectura:** El área central de la mesa permite desplegar hojas y cartas sin tapar los objetos de los extremos.
3. **Ergonomía de Entrada:** Objetos grandes con hit areas holgadas (`>= 64x64px`), ideales para interacción precisa con mouse y navegación fluida con teclado.

---

## 3. Propuesta B: "El Desván de Backlund" (Encuadre Espacial 2.5D por Capas)

### A. Concepto y Atmósfera
- **Perspectiva:** Plano general isométrico-frontal (cámara con 25° de elevación y lente de 50mm). Muestra la arquitectura completa del ático: vigas de roble, claraboya abuhardillada, escalera de caracol al fondo y la mesa en el centro del espacio.
- **Distribución Espacial del Lienzo 1920x1080:**
  - **Fondo (Arquitectura del Desván):** Tejado inclinado, claraboya con luz de luna/niebla, escalera de bajada a la izquierda (que actúa como acceso a la guardia/combate), hornacina ritual en la pared para el cáliz.
  - **Plano Medio (Mobiliario):** Mesa central de caoba con la vela, el espejo apoyado en un caballete, los documentos y el libro.
  - **Lateral Derecho:** Pared de ladrillo visto con el corcho de investigación en gran formato.

### B. Esquema ASCII de Disposición — Propuesta B

```
+-----------------------------------------------------------------------------------------+
| [CLARABOYA ABUHARDILLADA]                                        [VIGAS DE ROBLE]       |
| Entrada de luz cenital                                           Polvo y telarañas      |
| Niebla exterior                                                                         |
|                                                                  [TABLERO DE CORCHO]    |
| [ESCALERA DE CARACOL]           [HORNACINA GÓTICA]               Pared de ladrillo      |
| Bajada al zaguán                El Cáliz de Plata                Hilos y pistas         |
| Alerta táctica (Combate)        Ritual de Ascensión                                     |
|                                                                                         |
|                    +-------------------------------------+                              |
|                    | [VELA]     [DOCUMENTOS]    [LIBRO]  |                              |
|                    | Sanidad    Identidad       Actuación|                              |
|                    |                                     |                              |
|                    | [ESPEJO]   [RELOJ]         [BOLSA]  |                              |
|                    | Azogue     Almanaque       Monedas  |                              |
|                    +-------------------------------------+                              |
|                              (Mesa Central de Caoba)                                    |
+-----------------------------------------------------------------------------------------+
```

### C. Ventajas y Características de la Propuesta B
1. **Sensación Arquitectónica de Lugar:** El Desván se percibe como una habitación habitable y vulnerable.
2. **Dramatismo Espacial:** Las transiciones de cámara (zoom in a la mesa al investigar o al cáliz al ascender) son visualmente impactantes.
3. **Desafío Técnico:** Al estar los objetos más integrados en la perspectiva tridimensional, requiere mayor separación de planos y escalas cuidadas para no comprometer la legibilidad del texto en viewports compactos (`1280x720`).

---

## 4. Tabla Comparativa de Selección

| Criterio de Evaluación | Propuesta A (Escritorio Táctil) | Propuesta B (Desván Espacial 2.5D) |
|---|---|---|
| **Enfoque Principal** | Inmersión directa sobre los objetos y documentos | Arquitectura y atmósfera del lugar completo |
| **Legibilidad Textual** | **Excelente** (tamaño de fuente amplio y directo) | Buena (requiere capas de zoom/inspección) |
| **Ergonomía de Teclado** | **Muy Directa** (rejilla natural 2D de hotspots) | Requiere orden espacial por profundidad |
| **Adaptación 1280x720** | **Fluida** (margen seguro perimetral de 5%) | Requiere reencuadre de claraboya y escalera |
| **Complejidad de Arte** | 12 capas de objetos + fondo estático | 18 capas (arquitectura + objetos + volumetría) |
| **Cumplimiento Anti-Mecánico** | 100% (todos los estados son materia en la mesa) | 100% (objetos ubicados en el mobiliario) |

---

## 5. Decisión del Director: Adopción Oficial de la Propuesta B

El Director de Proyecto ha seleccionado formalmente la **Propuesta B: "El Desván de Backlund (Encuadre Espacial 2.5D por Capas)"** como la composición canónica para la implementación en `BRIEF-10.VISUAL-R2` y `R3`.

### Fundamentos del Diseño Adoptado:
1. **Identidad Diegética Superior:** El Desván se percibe como un espacio arquitectónico real, habitable, sombrío y vulnerable en Backlund, no como un plano estático recortado.
2. **Coherencia de Puntos de Interacción Físicos:**
   - **Combate / Alerta:** La **Escalera de Caracol** que desciende al zaguán conecta de forma inmediata con la amenaza de intrusos o patrullas subiendo los peldaños.
   - **Ascensión Ritual:** La **Hornacina Gótica** tallada en la pared de ladrillo dignifica el Cáliz de Plata como un objeto ceremonial solemne.
   - **Investigación:** El **Tablero de Corcho** en la pared lateral de ladrillo aprovecha la profundidad de la sala para trazar conexiones a gran escala.
   - **Doble Vida y Rutina:** La **Mesa Central de Caoba** agrupa la vela, los pliegos de identidad, el diario de actuación, el reloj de faltriquera y el monedero.
3. **Cámara 2.5D Dinámica:** Las transiciones de navegación operan mediante zooms y reencuadres suaves hacia la mesa, el corcho, la hornacina o la escalera sin desmontar la atmósfera de la estancia.

