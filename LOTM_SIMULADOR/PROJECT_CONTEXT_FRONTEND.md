# PROJECT_CONTEXT_FRONTEND
## Documento Maestro de Transferencia Visual, Filosofía Diegética y Arquitectura UX (v4.0)
### Proyecto: Path to Godhood (*LOTM_ENGINE_REBORN*)
**Destinatario Exclusivo:** Dirección de Integración Visual UI / Modelo Senior Entrante (Opus 5.5)  
**Autoridad:** Dirección Técnica y de Producto  
**Fecha de Emisión:** 23 de Septiembre de 2026  
**Jerarquía Constitucional:** DOCUMENTO SUPREMO DE FRONTEND Y EXPERIENCIA DE USUARIO  
**Estado de Validación:** 173/173 tests PASS · 0 violaciones diegéticas · 0 `Math.random` · 22/22 contratos Tier G conformes · Briefs R1–R4 implementados

---

## 1. Resumen Ejecutivo

### 1.1 Objetivo Visual del Proyecto
El objetivo visual y de experiencia de usuario de *Path to Godhood* es construir un videojuego web diegético, táctil y de atmósfera opresiva ambientado en el universo de *Lord of the Mysteries* (Backlund, ~1353 de la Quinta Época). La interfaz rechaza categóricamente el formato de "aplicación web" o "dashboard administrativo victoriano". El jugador no gestiona un personaje mediante formularios, menús desplegables o barras de estado: **el jugador habita físicamente un lugar**.

Ese lugar es **El Desván de Backlund**, un ático precario, sombrío y vulnerable que funciona como refugio clandestino, laboratorio ocultista y centro de investigación. Toda la interfaz se concibe como una pintura digital interactiva en perspectiva 2.5D por capas sobre un lienzo lógico de **1920 × 1080** píxeles. En este entorno, los estados físicos y mentales del personaje son objetos materiales colocados sobre el mobiliario (la vela de sebo, el espejo de azogue, las grietas del escritorio de caoba), y las interacciones con el mundo exterior se producen a través de cartas manuscritas, expedientes policiales, recortes de prensa y la observación atenta de la niebla a través de la claraboya.

### 1.2 Estado Actual del Frontend
- **Fase del Proyecto:** La **Fase 1 continúa ABIERTA** bajo mandato constitucional. No se autoriza el cierre de fase hasta completar los briefs visuales pendientes (R5 a R10), la prueba ciega con evaluadores humanos (Gate G4) y la demo jugable firmada por la Dirección.
- **Briefs Visuales Ejecutados:** Se han completado y validado en producción los briefs **R0, R1, R2, R3 y R4**.
- **Infraestructura Técnica UI:** React 19 + TypeScript 5.7+ + Vite 8 + Tailwind CSS v4.
- **Métricas de Conformidad:**
  - 173 tests de integración y dominio pasando al 100%.
  - 0 violaciones en el linter diegético (`npm run audit:diegetic`) sobre los 27 archivos del frontend.
  - 0 llamadas a `Math.random()` en el motor (`npm run lint:determinism`).
  - Lienzo maestro con safe area de 1440×900 verificada en 5 viewports estándar (1280×720 a 2560×1440).
  - Grafo espacial continuo de 11 hotspots interactivos con soporte completo para ratón y teclado accesible.

### 1.3 Principales Problemas Históricos
El proyecto atravesó una crisis de identidad visual severa antes de la purga y el inicio del Plan de Recuperación UI:
1. **La Paradoja del "Dashboard Disfrazado":** A pesar de declarar conceptualmente que "el estado es un objeto", la implementación inicial colocaba tarjetas grises (`cards`), etiquetas flotantes (`pills`), modales estándar de Bootstrap/Tailwind y botones genéricos de Lucide React ("Velo", "Almanaque", "Bazar", "Guardia").
2. **Desconexión Espacial:** Abrir el diario de actuación o los papeles notariales abría un modal centrado en pantalla con fondo negro translúcido (`backdrop-blur`), destruyendo por completo la ilusión de estar sentado en una habitación real.
3. **Proliferación de Métricas Mecánicas:** La interfaz mostraba barras de vida ("HP: 100/100"), porcentajes numéricos de sanidad ("Sanidad: 85%"), contadores de ruina y modificadores matemáticos, traicionando el principio fundamental de opacidad y misterio de *Lord of the Mysteries*.
4. **Falta de Dirección Artística Unificada:** Los objetos eran divs planos con bordes redondeados y gradientes CSS básicos, carentes de volumen, textura, sombras de contacto o iluminación coherente.

---

## 2. Historia de la Recuperación UI (R0 a R4)

El proceso de rescate del frontend se estructuró a través de briefs iterativos con control de calidad estricto, impidiendo avanzar a la siguiente etapa sin evidencia verificable y firmas de revisión:

```
[R0: Auditoría y Línea Base]
           │
           ▼
[R1: Contrato Visual y Decisión de Composición (Propuesta B)]
           │
           ▼
[R2: Fundamentos de Escena, Viewport 1920x1080 y Navegación]
           │
           ▼
[R3: El Desván Completo y 11 Objetos Físicos con GFX]
           │
           ▼
[R4: Superficies de Actuación, Calendario e Identidad Notarial]
```

### R0 — Auditoría del Estado Real y Línea Base
- **Objetivo:** Radiografiar el frontend existente sin modificar una sola línea de código de producción, documentando con capturas los defectos ergonómicos y estéticos.
- **Logros:**
  - Se identificaron bloqueos críticos: alturas y anchos rígidos (`h-[36vh]`, `h-[64vh]`) que rompían la pantalla fuera de una sola resolución.
  - Se detectó el uso abusivo de `flex justify-between`, transformando el escritorio en una fila horizontal de widgets.
  - Se documentaron colisiones de eventos por un overlay de grietas (`DeskCracksOverlay`) que interceptaba clics en toda la pantalla.
  - Se estableció el inventario de scripts de CI y el presupuesto de bundle inicial (330 kB uncompressed / 100 kB gzip).

### R1 — Diseño y Contrato Visual Aprobado
- **Objetivo:** Formalizar la dirección estética y resolver la disputa compositiva entre dos opciones conceptuales.
- **Logros:**
  - Confrontación entre la **Propuesta A** ("El Escritorio Táctil", encuadre cerrado) y la **Propuesta B** ("El Desván de Backlund", encuadre espacial 2.5D).
  - **Adopción Oficial de la Propuesta B:** El Director ratificó la Propuesta B como la autoridad canónica para dotar al juego de un sentido arquitectónico de lugar.
  - Firma del **Contrato Visual v1.0** (`CONTRATO_VISUAL_R1.md`), formalizando la paleta de tokens victorianos, los 5 presets de cámara, la tipografía canónica (`Cinzel` y `EB Garamond`), los criterios V1 a V8 y la matriz de estados somáticos para la Vela, el Espejo y la Ruina.

### R2 — Fundamentos de Escena, Viewport y Navegación Central
- **Objetivo:** Construir la infraestructura técnica de presentación antes de colocar activos de arte definitivos.
- **Logros:**
  - Implementación del `SceneViewport.tsx` con lienzo lógico de 1920×1080, cálculo automático de escala proporcional (`scaleFactor`) y letterboxing uniforme en los 5 viewports estándar.
  - Creación de la **Máquina Central de Navegación** (`gameUi.machine.ts` / reducer puro en `types.ts`), eliminando la proliferación de `useState` locales y modales dispersos.
  - Construcción del grafo espacial de teclado (`spatialNavigation.ts`), permitiendo navegar secuencialmente con `Tab` / `Shift+Tab` y bidireccionalmente con teclas de flecha entre los 11 hotspots.
  - Implementación del **Modo Atención** (tecla `A`), que conmuta la visibilidad de las etiquetas en reposo sin necesidad de mantener el ratón encima de cada objeto.

### R3 — El Desván Completo con Activos de Arte Aprobados
- **Objetivo:** Sustituir las cajas y siluetas geométricas por los activos pictóricos reales derivados de la composición maestra.
- **Logros:**
  - Integración del fondo limpio arquitectónico (`GFX06_desvan_background_clean.jpg`) y de la mesa de caoba pura (`GFX07_mahogany_desk_clean.jpg`).
  - Posicionamiento en coordenadas de píxel exactas de los **11 objetos físicos** del desván (`GFX12` a `GFX22`).
  - Implementación de la capa de iluminación horaria (`TimeLightingLayer`), modificando la temperatura de color y luz de ventana según los 4 momentos del día (Mañana, Tarde, Noche, Madrugada).
  - Integración del overlay acumulativo de Ruina de la caoba (`DeskCracksOverlay`) con 5 niveles de deterioro permanente (`GFX27`).

### R4 — Superficies de Calendario, Identidad y Actuación Conectadas
- **Objetivo:** Conectar las tres grandes superficies de decisión del día a día civil y sobrenatural con el backend persistente.
- **Logros:**
  - **`CalendarView`:** Almanaque de escritorio (`GFX18`) y reloj de faltriquera (`GFX19`) para planificar y resolver las franjas horarias del día y cobrar el salario semanal.
  - **`IdentityDossierView`:** Expediente notarial con textura de papiro (`GFX30`), sello de lacre auténtico (`GFX31`), las 6 viñetas de oficio civil (`GFX36A–F`) y gestión de sospecha policial/eclesiástica y anclas de humanidad.
  - **`ActingMirrorView`:** Cuaderno encuadernado en piel a dos páginas (`GFX15`) para afrontar dilemas morales del *Método de Actuación* y digerir la poción.
  - **Limpieza Quirúrgica:** Desmantelamiento de modales residuales de R0 en `IdentityPapersObject` y `ActingBookObject`, y eliminación de márgenes grises de estudio en los fondos raster de vitela.
  - Generación de las 7 capturas de evidencia Playwright en `docs/ui-recovery/evidence/r4/`.

---

## 3. Problema Histórico Principal: "La UI funcionaba como dashboard web oscuro"

El fallo más grave de las iteraciones pre-purga no fue técnico ni de rendimiento; fue una **traición conceptual al género y a la ambientación**. La interfaz parecía un panel de control de administración en la nube con temática oscura (tipo linear/dashboard) al que se le habían añadido adjetivos arcanos:

```
[DISEÑO PRE-PURGA (ERRÓNEO)]                     [DISEÑO ACTUAL (CORRECTO)]
┌──────────────────────────────────────────┐    ┌──────────────────────────────────────────┐
│ [HP: 100/100] [Sanidad: 85%] [Ruina: 5] │    │           (Escena del Desván)            │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐   │    │  Claraboya con niebla · Vigas de roble   │
│ │ Card 1   │ │ Card 2   │ │ Card 3   │   │    │  Escalera de caracol  · Hornacina cáliz  │
│ │ Acting   │ │ Dossier  │ │ Bazar    │   │    │  Mesa de caoba pulida con objetos:       │
│ └──────────┘ └──────────┘ └──────────┘   │    │    - Vela viva (Miras la llama)          │
│ (Botones: [Abrir Velo] [Ver Almanaque])  │    │    - Espejo azogue (Miras el reflejo)    │
│ ┌──────────────────────────────────────┐ │    │    - Papeles con sello de lacre          │
│ │ Modal Flotante Centrado              │ │    │  CERO barras · CERO cards · CERO HUD     │
│ └──────────────────────────────────────┘ │    │  Navegación espacial por cámara 2.5D     │
└──────────────────────────────────────────┘    └──────────────────────────────────────────┘
```

### 3.1 Las "Cards" (Tarjetas)
En lugar de objetos apoyados en la madera con sombras de contacto y perspectiva, la pantalla estaba fragmentada en rectángulos rígidos con esquinas redondeadas (`rounded-xl`), fondos oscuros semitransparentes (`bg-neutral-900/80`) y bordes iluminados (`border border-neutral-800`). Parecían paneles de Jira o widgets de métricas financieras.

### 3.2 Las "Pills" (Píldoras)
El jugador saltaba de una pantalla a otra mediante botones con forma de cápsula (`rounded-full py-1 px-4`) que flotaban fijos en la parte superior o inferior de la pantalla: "Abrir Tercer Ojo", "Velo", "Almanaque", "Bazar", "Guardia". Cada píldora lucía un icono genérico de Lucide (un ojo, un libro, una balanza, un escudo), rompiendo la sensación de época victoriana.

### 3.3 Los Botones Modernos
Las interacciones cruciales se ejecutaban con botones estándar de formulario web: rectángulos planos con texto centrado como "Confirmar Elección", "Enviar Veredicto" o "Avanzar Día". En un universo como LOTM, las acciones deben sentirse como decisiones irreversibles: romper un sello de lacre, mojar la pluma en tinta ferrogálica o sostener físicamente un cáliz durante tres segundos para beber.

### 3.4 Los Modales Centrados Desconectados
Cuando el jugador hacía clic en el diario o en un caso, la pantalla se oscurecía con un overlay negro y aparecía una caja flotante en el centro del monitor (`fixed inset-0 flex items-center justify-center`). Al cerrarla, la escena del fondo no había cambiado en absoluto. No había sensación de abrir un libro sobre la mesa, ni de hojear páginas, ni de que el tiempo hubiera avanzado en la habitación.

### 3.5 El HUD Numérico
Cabeceras con textos como `"HP: 100"`, `"Sanidad: 85%"`, `"Corrupción: 12%"`, `"Ruina: 5"` o `"Secuencia: 9 (Vidente)"`. Estos indicadores destruían la esencia de la obra: en LOTM, un Beyonder **nunca sabe con certeza matemática cuánta cordura le queda**. Descubre que está perdiendo la cabeza cuando su reflejo en el espejo sonríe a destiempo, cuando la vela crepita con humo azulado o cuando escucha susurros en la oscuridad.

---

## 4. Filosofía Visual Aprobada

El diseño visual de *Path to Godhood* descansa sobre cinco pilares irrenunciables:

### 4.1 ESTADO = OBJETO
Ningún estado interno del personaje se representa mediante indicadores numéricos abstractos en reposo. **El estado ES un objeto físico perceptible** en el Desván:
- **Sanidad y Estabilidad Mental:** Se manifiesta en **La Vela de Sebo**. Miras la altura de la llama, su estabilidad contra las corrientes y la cera derretida.
- **Corrupción e Invasión Espiritual:** Se manifiesta en **El Espejo de Azogue**. Miras la claridad del cristal, la presencia de vaho espectral o las sombras que se mueven tras de ti.
- **Ruina y Destino:** Se manifiesta en **Las Grietas de la Mesa de Caoba**. Cada transgresión arcana y cada poción ingerida talla una cicatriz física e imborrable en la madera del escritorio.
- **Economía y Solvencia:** Se manifiesta en **El Monedero de Cuero**. Sientes el peso, volumen y tintineo de las monedas de Loen; lees notas de pago en papel arrugado.
- **Actuación y Principios:** Se manifiesta en **El Cuaderno de Cuero**. La tensión de la cinta marcapáginas y la pulcritud de las notas reflejan si estás asimilando el papel o perdiendo tu identidad.
- **Identidad y Anclas de Humanidad:** Se manifiesta en **Los Pliegos Notariales**. El estado de los sellos de lacre y las firmas demuestra la firmeza o quebranto de tus lazos con el mundo civil.

### 4.2 MOMENTO = PROSA
En reposo, la interfaz guarda silencio solemne. Las etiquetas identificativas de los objetos en la mesa tienen un límite constitucional estricto de **máximo siete (7) palabras** (ejemplo: *"Llama viva y clara sobre peltre"*, *"El azogue refleja tu semblante humano"*).

La prosa profunda, rica en atmósfera victoriana, reflexiones del protagonista y ecos sobrenaturales, entra en juego **únicamente cuando el jugador interactúa de forma directa**: al abrir el cuaderno, al inspeccionar una pista en el corcho, al leer una carta timbrada o al participar en un ritual solemne.

### 4.3 El Desván es el Nivel Cero
El Desván no es el menú principal ni una sala de espera estéril. **Es el primer mapa del videojuego.** Es el epicentro donde convergen las presiones de la doble vida: las deudas de alquiler impagadas que desliza la casera bajo la puerta, los recortes periodísticos de asesinatos sin resolver en Backlund y el miedo constante a que Scotland Yard o los Halcones Nocturnos identifiquen tu guarida.

### 4.4 El Desván es un Lugar
El espacio tiene tridimensionalidad, peso y atmósfera. La luz entra oblicua por la claraboya abuhardillada; la lluvia golpea los cristales; las vigas crujen; la escalera de caracol conecta con el zaguán de abajo; el polvo flota en los haces de luz de gas. Todo lo que ocurre en el juego deja huellas materiales en esta habitación: cartas abiertas, manchas de cera derramada, nuevas fisuras en la caoba o pistas clavadas con alfileres en el corcho.

### 4.5 Ausencia de HUD Mecánico
Prohibición taxativa de etiquetas de videojuego tradicional. Prohibido añadir barras de vida, números de maná, modificadores de combate ("+10% Sigilo") o porcentajes de digestión. La interfaz comunica mediante metáforas sensoriales victorianas.

---

## 5. Composición Oficial: PROPUESTA B ("El Desván de Backlund")

La composición oficial aprobada por la Dirección tras la comparativa de R1 es la **Propuesta B: "El Desván de Backlund (Encuadre Espacial 2.5D por Capas)"**.

```
+─────────────────────────────────────────────────────────────────────────────────────────+
│ [CLARABOYA ABUHARDILLADA] (X: 180, Y: 40)                    [VIGAS DE ROBLE]           │
│ Entrada de luz cenital, lluvia y niebla                      Polvo ambiental en suspensión│
│                                                                                         │
│ [ESCALERA DE CARACOL]           [HORNACINA GÓTICA]           [TABLERO DE CORCHO]        │
│ (X: 20, Y: 80, W: 280, H: 720)  (X: 800, Y: 220, W: 220)     (X: 1460, Y: 220, W: 420)  │
│ Bajada al zaguán y calle        El Cáliz de Plata            Expediente Cherwood        │
│ Acceso táctico (COMBATE)        Ritual de Ascensión          Pistas e hilos rojos       │
│                                                                                         │
│                     ┌───────────────────────────────────────────────┐                   │
│                     │             MESA CENTRAL DE CAOBA             │                   │
│                     │         (X: 350, Y: 320, W: 1220, H: 660)     │                   │
│                     │                                               │                   │
│                     │  [LA VELA]       [ESPEJO AZOGUE]   [RELOJ]    │                   │
│                     │  (Sanidad)       (Corrupción/Velo) (Tiempo)   │                   │
│                     │                                               │                   │
│                     │  [CUADERNO]      [PLIEGOS]         [BOLSA]    │                   │
│                     │  (Actuación)     (Identidad/Anclas)(Monedas)  │                   │
│                     │                                               │                   │
│                     │  [CARTA DEL BAZAR] (Mercado clandestino)      │                   │
│                     │                                               │                   │
│                     │  ~~~~~~~~ GRIETAS DE RUINA EN LA CAOBA ~~~~~~ │                   │
│                     └───────────────────────────────────────────────┘                   │
+─────────────────────────────────────────────────────────────────────────────────────────+
```

### 5.1 Elementos Arquitectónicos Principales
1. **La Escalera de Caracol (Lateral Izquierdo):**
   - Peldaños de roble oscuro que descienden en espiral hacia la puerta del zaguán.
   - Función diegética: Punto de alerta exterior. Si Scotland Yard o intrusos asaltan la morada, la amenaza sube por aquí. Conduce al escenario de combate táctico.
2. **La Claraboya Abuhardillada (Techo / Zona Superior Izquierda):**
   - Ventanal inclinado de hierro forjado que deja ver la lluvia ácida y el cielo plomizo de Backlund.
   - Función diegética: Proyecta el haz de luz principal sobre la mesa, modulando su tonalidad según la franja horaria (luz fría matutina, dorada vespertina o azulada nocturna).
3. **La Hornacina Gótica (Pared Frontal Superior):**
   - Nicho de piedra tallado en el muro maestro, alejado del desorden de la mesa de trabajo.
   - Función diegética: Aloja exclusivamente el **Cáliz de Plata** (`hotspot_chalice`). Es el espacio solemne reservado para la preparación de pociones y la ceremonia del Trago.
4. **El Tablero de Corcho (Pared Lateral Derecha de Ladrillo Visto):**
   - Gran panel enmarcado en madera rústica colgado en el muro derecho.
   - Función diegética: Superficie de investigación del Caso Mayor (Expediente Cherwood). Aloja tarjetas de sospechosos, informes forenses, fotografías y los hilos conectores de colores.
5. **La Mesa Central de Caoba (Plano Medio e Inferior):**
   - Tablero macizo de madera noble con vetas profundas y sombras proyectadas.
   - Función diegética: La superficie táctil principal del protagonista. Aquí reposan los 7 objetos cotidianos de gestión mental, civil y económica.

---

## 6. Presets de Cámara Espacial (Navegación 2.5D)

La navegación no recorta pantallas ni abre páginas web independientes: **la cámara virtual se traslada suavemente dentro del Desván** mediante transformaciones CSS (`translate3d` y `scale`) aceleradas por hardware:

| Preset de Cámara | Coordenadas Lógicas | Zoom | Propósito y Comportamiento Funcional |
|---|---|---|---|
| **`WIDE_OVERVIEW`** | `X: 0, Y: 0` | `1.00×` | **Vista Maestra en Reposo:** Muestra la totalidad de la habitación. Permite contemplar la atmósfera general, el avance del tiempo y seleccionar cualquier objeto disponible mediante ratón o teclado. |
| **`FOCUS_DESK`** | `X: 0, Y: -220` | `1.35×` | **Enfoque de Trabajo Cotidiano:** La cámara desciende y se aproxima hacia la mesa de caoba. Destaca la Vela, el Espejo, el Cuaderno de Actuación, los Pliegos Notariales, el Reloj y el Monedero, preparando la superficie para inspecciones focales. |
| **`FOCUS_CORKBOARD`**| `X: -750, Y: 140` | `1.50×` | **Enfoque de Investigación:** La cámara se desplaza hacia la pared derecha y se eleva. El tablero de corcho ocupa el 85% del área útil para permitir la conexión de pistas, lectura de testimonios e inserción de alfileres sin solapamientos. |
| **`FOCUS_HORNACINA`**| `X: 80, Y: 260` | `1.65×` | **Enfoque Ceremonial:** La cámara asciende hacia el nicho frontal. La iluminación circundante se atenúa en viñeteado oscuro, destacando el brillo sacro del Cáliz de Plata y el ritual de las Cinco Puertas. |
| **`FOCUS_STAIRCASE`**| `X: 720, Y: -40` | `1.45×` | **Enfoque de Alerta y Vigilancia:** La cámara enfoca los peldaños de caracol y el picaporte de hierro del zaguán. Utilizado ante alertas de sospecha eclesiástica, vigilancia nocturna o transición hacia el escenario de combate táctico. |

*Nota de Implementación:* Las transiciones entre presets duran estrictamente **300 ms** utilizando una curva de aceleración física `cubic-bezier(0.16, 1, 0.3, 1)`. Si el usuario tiene activo `prefers-reduced-motion: reduce`, la traslación se cancela y se sustituye por una disolvencia cruzada limpia de **100 ms**.

---

## 7. Estados Somáticos (Vela, Espejo y Ruina)

Los tres sistemas fisiológicos y espirituales del motor de dominio se expresan visualmente con variantes escalonadas de arte y efectos cinéticos locales:

### 7.1 La Vela de Sebo (Sanidad / Estabilidad Mental)
Representa la cordura y el control de los pensamientos del protagonista frente a la locura inherente de las características Beyonder:

| Tier Somático | Clave Visual | Aspecto Físico y Comportamiento | Etiqueta en Reposo (≤ 7 palabras) | Prosa al Tocar / Inspeccionar |
|---|---|---|---|---|
| **Tier 1 (Óptimo)** | `BRILLANTE` | Llama dorada, alta y firme. Cera de sebo sólida e intacta. Halo cálido amplio sobre la madera. | *Llama viva y clara sobre peltre.* | "La llama se eleva erguida sin vacilar; tus pensamientos fluyen lúcidos y en calma." |
| **Tier 2 (Alterado)** | `PARPADEANTE` | Llama inquieta que ondea ante corrientes invisibles. Goterones de cera cayendo. Sombras dobles. | *La llama oscila inquieta contra sombras.* | "El fuego titila ante corrientes invisibles; un leve murmullo parece rozar el borde de tu mente." |
| **Tier 3 (Crítico)** | `AHOGADA` | Llama diminuta, azulada y ahogada en un charco de cera derretida. Humo denso y oscuro. | *Llama azulada al borde del ahogo.* | "Apenas una brasa azulada lucha contra el sebo; el aire se siente denso y las sombras se alargan hacia ti." |
| **Tier 4 (Terminal)** | `EXTINTA` | Mecha carbonizada y fría. Espiral de humo gris errante. Penumbra casi total en el escritorio. | *Mecha fría; solo queda humo errante.* | "La luz ha muerto. El frío de la locura se arrastra por tus sienes; cualquier susurro puede ser el abismo." |

### 7.2 El Espejo de Azogue (Corrupción / Invasión Extraña)
Representa la contaminación mística del cuerpo espiritual y la proximidad del descontrol o la mutación monstruosa:

| Tier Somático | Clave Visual | Aspecto Físico y Comportamiento | Etiqueta en Reposo (≤ 7 palabras) | Prosa al Tocar / Inspeccionar |
|---|---|---|---|---|
| **Tier 1 (Puro)** | `AZOGUE_LIMPIO` | Cristal de azogue pulido y brillante. Reflejo humano nítido sin distorsión anatómica. | *El azogue refleja tu semblante humano.* | "Tu rostro en el cristal muestra la fatiga de la noche, pero tus ojos te pertenecen por entero." |
| **Tier 2 (Turbio)** | `SOMBRAS_ESPECTRALES` | Manchas de vaho grisáceo en las esquinas del marco. Siluetas borrosas que se mueven con retraso. | *Sombras tenues flotan tras tu reflejo.* | "Al parpadear, jurarías que tu reflejo no cerró los ojos a tiempo. Una presencia velada aguarda detrás." |
| **Tier 3 (Fracturado)**| `GRIETAS_EN_VIDRIO` | Telaraña de fisuras en el cristal. El reflejo se quiebra en múltiples facetas con pupilas anómalas. | *Vidrio quebrado; pupilas ajenas te miran.* | "La superficie está hendida. En cada fragmento de vidrio, un rostro distinto ensaya una mueca que tú no ordenaste." |
| **Tier 4 (Monstruoso)**| `AZOGUE_NEGRO` | Vidrio opaco y negro como obsidiana. Ojos inhumanos carmesí o tentáculos brillando en el fondo. | *Azogue corrompido; el abismo te contempla.* | "El espejo ya no te devuelve tu carne. Algo colosal y antiguo ocupa el cristal y devora tu identidad." |

### 7.3 Las Grietas en la Caoba (Ruina Acumulada / Destino)
La Ruina representa el peaje cósmico permanente por ascender de secuencia y manipular fuerzas prohibidas. Es **estrictamente irreversible**:

| Tier de Ruina | Clave Visual | Aspecto Físico de la Madera | Etiqueta en Reposo (≤ 7 palabras) | Prosa al Tocar / Inspeccionar |
|---|---|---|---|---|
| **Nivel 0** | `INTEGRO` | Caoba pulida sin una sola marca. Vetas naturales limpias (estado previo a la primera poción). | *Tablero de caoba pulida y firme.* | "La madera está intacta; el peso de lo sobrenatural aún no ha tocado este rincón profano." |
| **Nivel 1 (Canónico S9)** | `MARCADO` | Una hendidura delgada y oscura que nace en la esquina izquierda y recorre 15 cm de madera. | *Hendidura oscura tallada en la caoba.* | "Una fisura delgada recorre la caoba: el peso de lo sobrenatural ha dejado una marca imborrable." |
| **Nivel 2** | `EROSIONADO` | La hendidura inicial se ramifica en dos grietas secundarias que penetran hacia el centro. | *Grietas vivas carcomen la madera noble.* | "Las vetas de la caoba se abren como heridas secas. Cada secreto oculto ha cobrado su tributo en la materia." |
| **Nivel 3** | `ROTO` | Hendiduras profundas con bordes astillados y sombras ennegrecidas en el fondo de la madera. | *Fisuras profundas desgarran el tablero.* | "La madera cruje bajo un peso que los ojos profanos no ven. El destino se estrecha con cada elección." |
| **Nivel 4** | `PERDIDO` | Fractura casi total que divide visualmente la mesa de lado a lado con polvo negro en las juntas. | *Madera quebrada al borde del colapso.* | "La mesa amenaza con partirse en dos. El destino está a punto de quebrarse; el velo entre mundos es casi transparente." |

---

## 8. Catálogo Canónico de Objetos (Los 11 Hotspots del Desván)

Cada punto de interacción posee coordenadas exactas en el lienzo de 1920×1080, capa de profundidad (`depthLayer`), preset de cámara asociado y función diegética en el flujo de juego:

```typescript
CANONICAL_HOTSPOTS (Lienzo 1920x1080)
├── 1. hotspot_staircase_door  (X:   20, Y:  80, W: 280, H: 720) -> Escalera (Combate / Alerta)
├── 2. hotspot_chalice         (X:  800, Y: 220, W: 220, H: 300) -> Cáliz (Ascensión / Cinco Puertas)
├── 3. hotspot_corkboard       (X: 1460, Y: 220, W: 420, H: 380) -> Corcho (Expediente Cherwood)
├── 4. hotspot_candle          (X:  420, Y: 320, W: 160, H: 380) -> Vela de Sebo (Sanidad)
├── 5. hotspot_mirror          (X:  580, Y: 390, W: 240, H: 290) -> Espejo de Azogue (Corrupción / Velo)
├── 6. hotspot_almanack        (X: 1160, Y: 390, W: 330, H: 250) -> Reloj y Almanaque (Calendario)
├── 7. hotspot_money_pouch     (X: 1470, Y: 610, W: 210, H: 130) -> Monedero de Cuero (Economía)
├── 8. hotspot_identity_papers (X:  830, Y: 660, W: 450, H: 190) -> Pliegos Notariales (Identidad / Anclas)
├── 9. hotspot_acting_diary    (X:  530, Y: 690, W: 390, H: 220) -> Cuaderno de Actuación (Acting / Digestión)
├── 10. hotspot_bazaar_letter  (X: 1290, Y: 720, W: 310, H: 110) -> Misiva Sellada (Bazar Clandestino)
└── 11. hotspot_mahogany_cracks(X:  350, Y: 860, W:1200, H: 110) -> Grietas en la Caoba (Ruina)
```

1. **`hotspot_candle` (La Vela de Sebo):**  
   *Función:* Informa del estado de cordura y estabilidad. Al tocar, permite realizar una meditación menor para calmar la agitación del espíritu.
2. **`hotspot_mirror` (El Espejo de Azogue):**  
   *Función:* Muestra la deformación corrupta del rostro. Mediante un gesto sostenido (*Hold*), permite abrir la **Visión Espiritual** para revelar anomalías y auras astrales en la habitación.
3. **`hotspot_mahogany_cracks` (Las Grietas en la Caoba):**  
   *Función:* Registro físico de la Ruina acumulada. Al tocar, inspecciona las cicatrices metafísicas dejadas por los ascensos de secuencia.
4. **`hotspot_acting_diary` (El Cuaderno de Cuero de Actuación):**  
   *Función:* Abre la vista en dos páginas (`ActingMirrorView`). Presenta los dilemas de actuación del día, permitiendo al jugador interpretar el papel de su vía (Vidente o Espectador) para digerir la poción sin descarrilar su coherencia.
5. **`hotspot_identity_papers` (Los Pliegos Notariales de Identidad):**  
   *Función:* Despliega el expediente notarial (`IdentityDossierView`). Permite revisar el estado de las 3 anclas humanas civiles, la profesión, el salario, la carga inicial (secreto o deuda) y la sospecha de Scotland Yard y las Iglesias.
6. **`hotspot_money_pouch` (El Monedero de Cuero de Loen):**  
   *Función:* Administra la economía victoriana (Libras, Chelines, Peniques). Informa de los fondos disponibles y alerta sobre la proximidad del cobro del alquiler semanal.
7. **`hotspot_almanack` (El Reloj de Faltriquera y Almanaque):**  
   *Función:* Abre la planificación temporal (`CalendarView`). Permite seleccionar actividades civiles u ocultas para cada una de las 4 franjas del día (Mañana, Tarde, Noche, Madrugada) y avanzar los ticks semanales.
8. **`hotspot_bazaar_letter` (La Misiva Sellada del Bazar):**  
   *Función:* Permite trasladarse al mostrador del mercado clandestino del Área del Puente para comprar reactivos alquímicos o contratar curas de emergencia.
9. **`hotspot_corkboard` (El Tablero de Corcho de Investigación):**  
   *Función:* Abre el escenario interactivo de deducción policial/esotérica (`CorkboardStage`). El jugador conecta pistas descubiertas mediante alfileres e hilos de colores para formular acusaciones en el Caso Cherwood.
10. **`hotspot_chalice` (El Cáliz de Plata):**  
    *Función:* Abre la ceremonia solemne de ascensión (`CeremonyStage`). Permite verificar los requisitos de las Cinco Puertas y ejecutar el gesto sostenido de beber la poción (*Hold-to-Drink* de 3000 ms) con telemetría de hesitación.
11. **`hotspot_staircase_door` (La Escalera de Caracol y Picaporte):**  
    *Función:* Vigilancia de la entrada y acceso al escenario de combate táctico por turnos en rejilla 5×7 ante incursiones de enemigos o agentes de la ley.

---

## 7. Producción Gráfica: S0, C0, O0 y el Pipeline GFX

El arte del proyecto no se improvisa mediante prompts aislados sin coherencia. Sigue un **pipeline estricto en cuatro etapas**:

```
[Paso 1: Nano Banana Pro] ──► [Paso 2: Krita] ──► [Paso 3: Inkscape / SVG] ──► [Paso 4: React / CSS]
Pintura digital y texturas     Separación de capas,   Máscaras poligonales,        Integración en escena,
a partir de referencias        alpha y sombras        vectores de interacción      texto vivo y transiciones
```

### 9.1 S0 — Muestra Maestra de Materiales
Es la referencia pictórica inicial aprobada (`S0_materials_sample.jpg`). Define el comportamiento lumínico, rugosidad, desgaste y paleta cromática de los seis materiales fundamentales:
1. *Madera de caoba envejecida* (tablero de mesa con barniz oscuro gastado).
2. *Latón mate oxidado* (marcos, bisagras, esfera del reloj, candelabros).
3. *Papel de fibra de vitela marfil* (pliegos notariales, cartas, hojas del grimorio).
4. *Cuero marrón oscuro tratado* (encuadernación del cuaderno, bolsa de monedas).
5. *Cera de sebo opaca con gotas* (cuerpo de la vela).
6. *Azogue plateado líquido* (cristal del espejo).

### 9.2 C0 — Composición Maestra Aprobada
Es la pintura digital de referencia general en 2K 16:9 (`C0_desvan_composition.jpg`). Establece el ángulo de cámara (tres cuartos ligeramente elevado, 25° de inclinación), la iluminación dominante (luz cálida desde la izquierda y relleno frío tenue desde la claraboya a la derecha) y la ubicación espacial de los 11 elementos sin textos ni controles superpuestos.

### 9.3 O0 — Tríada Piloto de Objetos Terminados
Es la prueba de fuego de integración de activos: la Vela de sebo (`GFX12`), el Espejo de azogue (`GFX13`) y el Libro encuadernado (`GFX14`) recortados en capas transparentes independientes con sus sombras de contacto y probados sobre la mesa limpia de caoba. Estableció la escala y nitidez para todo el trabajo posterior.

---

## 10. Catálogo Exhaustivo de Activos Aprobados (GFX)

Todos los activos residen en `ui/public/art/` y responden a órdenes formales del Plan de Producción Gráfica:

| Código GFX | Nombre de Archivo / Identificador | Descripción Técnica y Función en la UI |
|---|---|---|
| **`GFX06`** | `GFX06_desvan_background_clean.jpg` | Fondo arquitectónico limpio en resolución 4K: claraboya, vigas, pared de ladrillo y escalera sin mesa ni objetos. |
| **`GFX07`** | `GFX07_mahogany_desk_clean.jpg` | Mesa de caoba aislada y recortada sin objetos ni sombras impresas. Capa física sobre la que se asientan los hotspots. |
| **`GFX12`** | `GFX12_tallow_candle_clean.png` | Cuerpo de la vela de sebo sobre candelero de peltre. Generada sin llama para permitir la animación procedural de fuego. |
| **`GFX13`** | `GFX13_mercury_mirror_clean.png` | Espejo ovalado con marco de latón victoriano en estado puro (`AZOGUE_LIMPIO`). Reflejo nítido sin distorsiones. |
| **`GFX14`** | `GFX14_acting_diary_closed.png` | Cuaderno encuadernado en cuero marrón cerrado, con cinta marcapáginas carmesí visible sobre la mesa. |
| **`GFX15`** | `GFX15_acting_book_open.png` | Grimorio abierto a dos páginas con canal central y vitela marfil en blanco, base de la vista `ActingMirrorView`. |
| **`GFX16`** | `GFX16_identity_papers.png` | Mazo de pliegos notariales con bordes doblados y papel timbrado sobre el tablero de caoba. |
| **`GFX17`** | `GFX17_leather_pouch.png` | Bolsa pequeña de cuero marrón con cordel de cierre ajustado, deformada por el peso de las monedas de Loen. |
| **`GFX18`** | `GFX18_victorian_almanac_v2.jpg`| Almanaque victoriano con soporte de madera y hoja despejada para la vista interactiva `CalendarView`. |
| **`GFX19`** | `GFX19_pocket_watch.jpg` | Reloj de faltriquera de latón con cristal convexo y esfera despejada para animación de manecillas. |
| **`GFX20`** | `GFX20_sealed_letter.png` | Sobre cerrado de papel marfil con dobleces manuales y sello de lacre liso sobre la mesa. |
| **`GFX21`** | `GFX21_corkboard_empty.jpg` | Tablero de corcho limpio con marco de roble sobrio colgado en la pared derecha para la vista de investigación. |
| **`GFX22`** | `GFX22_silver_chalice.png` | Cáliz de plata ritual grabado con base firme ubicado en la hornacina para la ceremonia de ascensión. |
| **`GFX23`** | Variantes cinéticas de Vela | Conjunto de 4 estados visuales de llama y humo SVG: Plena, Vacilante, Humeante y Moribunda. |
| **`GFX24`** | `GFX24_mirror_turbid.png` | Espejo de azogue en estado alterado: velo grisáceo y sombras espectrales en los bordes. |
| **`GFX25`** | `GFX25_mirror_rippling.png` | Espejo de azogue en estado crítico: superficie líquida ondulante que distorsiona la figura humana. |
| **`GFX26`** | `GFX26_mirror_monstrous.png` | Espejo de azogue en estado terminal: cristal negro con ojos carmesí y tentáculos astrales. |
| **`GFX27`** | Variantes de Grietas | Máscaras vectoriales de Ruina acumulativa (Íntegro, Marcado, Erosionado, Roto, Perdido) en `DeskCracksOverlay`. |
| **`GFX28`** | Máscaras de Interacción | Polígonos SVG de coordenadas exactas para los 11 hotspots en el lienzo de 1920×1080. |
| **`GFX29`** | Sistema de Foco y Luz | Anillo de latón dorado envejecido (`#d4af37`) y luz de borde para teclado y hover de ratón. |
| **`GFX30`** | `GFX30_flat_paper.jpg` | Textura perpendicular de papel de vitela marfil de alta resolución para fondos de lectura y expedientes. |
| **`GFX31`** | `GFX31_wax_seal.jpg` | Sello de lacre rojo oscuro circular auténtico sin heráldica moderna, utilizado en los pliegos notariales. |
| **`GFX35A–H`**| Pistas Caso Cherwood | Las 8 ilustraciones condicionales de evidencias descubiertas: Juguetes quemados (`35A`), Borrador de testamento (`35B`), Rastros mentales (`35C`), Registro de astrología (`35D`), Registro oculto (`35E`), Cartas de adopción (`35F`), Registro financiero (`35G`) y Residuos alquímicos (`35H`). |
| **`GFX36A–F`**| Viñetas de Oficio Civil | Las 6 naturalezas muertas canónicas de origen: Escribiente Notarial (`36A`), Estudiante de Medicina (`36B`), Corresponsal (`36C`), Espiritista (`36D`), Estibador (`36E`) y Detective Privado (`36F`). |
| **`GFX37–38`**| Mostrador y Bandeja Bazar | Mostrador de madera oscura (`GFX37`) y bandeja de paño de terciopelo (`GFX38`) para exposición de artefactos. |
| **`GFX40`** | Suelo de Combate Táctico | Superficie de adoquines húmedos y zaguán de piedra para la rejilla táctica de combate 5×7. |
| **`GFX47`** | Zaguán del Prólogo | Escenario del callejón y zaguán victoriano donde el protagonista halla la primera carta del Benefactor. |
| **`GFX49–52`**| Elementos del Prólogo | Lámpara de gas de pared (`GFX49`), Poción Ojos de Cobalto (`GFX50`, Vía Fool), Poción Espejo de Ámbar (`GFX51`, Vía Visionary) y Encuadre ritual del Desván (`GFX52`). |
| **`GFX59–61`**| Plantillas Dinámicas | Retrato canónico de busto (`GFX59`), Objeto de inventario revelado (`GFX60`) y Viñeta narrativa de momento (`GFX61`). |

---

## 11. Referencias Visuales Obligatorias

En cualquier discusión sobre diseño, fidelidad o maquetación, existe una **cadena de mando visual incuestionable**:

1. **`S0` (Muestra Maestra de Materiales):** Determina cómo debe verse la caoba, el latón, el papel, el cuero, el sebo y el azogue. Si un botón o tarjeta parece plástico o metal cromado moderno, **viola S0**.
2. **`C0` (Composición Maestra Aprobada):** Determina la jerarquía de la habitación, las líneas de fuga, la posición de los puntos focales y el balance de masas. Si un elemento altera la perspectiva o rompe el vacío dramático del desván, **viola C0**.
3. **`O0` (Tríada Piloto Terminada):** Determina la escala de los objetos respecto a la mesa, la intensidad de sus sombras de contacto y la nitidez de silueta.
4. **Catálogo de Activos Aprobados (`ui/public/art/`):** Todo asset utilizado en el juego debe derivar de estas órdenes autorizadas.

> [!CAUTION]
> **REGLA SAGRADA DE IMPLEMENTACIÓN:**  
> **"La implementación debe adaptarse a estas referencias, no al revés."**  
> Jamás se permite degradar, recortar o reinterpretar el estilo de las referencias aprobadas para que encajen en limitaciones de un div o una librería CSS. Si el código no reproduce fielmente a C0 y S0, el código es defectuoso y debe corregirse.

---

## 12. Diferencia Entre Arte y UI Actual (Auditoría Crítica)

La implementación actual en los briefs R1–R4 ha resuelto la arquitectura lógica, la accesibilidad de teclado y el montaje básico, pero aún existe una **brecha perceptible entre la pintura aprobada en C0 y la UI ejecutable**:

### 12.1 Qué tan cerca está la UI actual de C0
- **Estructura y Coordenadas:** ~90% de coincidencia espacial. Los 11 objetos se ubican exactamente donde C0 los concibió.
- **Atmósfera y Fusión:** ~65% de coincidencia. La escena actual todavía delata en ciertas zonas que los objetos son capas PNG independientes recortadas y superpuestas mediante CSS sobre el fondo, en lugar de parecer pintados dentro del mismo óleo.

### 12.2 Qué problemas siguen presentes
1. **Sombras de Contacto Incompletas:** Algunos objetos de la mesa (especialmente el monedero y los pliegos de identidad) carecen de una sombra proyectada suave (`drop-shadow` / capa alpha) en su base, pareciendo flotar ligeramente sobre la caoba.
2. **Homogeneidad de Iluminación:** La luz cálida que entra por la izquierda baña a C0 con una gradación continua. En la UI actual, los objetos recortados a veces conservan brillos propios que no coinciden al 100% con la posición del candelabro y la ventana.
3. **Bordes de Recorte Duros:** Aunque se corrigieron los bordes grises de estudio en las vitelas, algunas siluetas recortadas presentan una transición demasiado cortante contra la madera en pantallas de alta densidad de píxeles (HiDPI / Retina).

### 12.3 Elementos que pierden jerarquía visual
- **El Cáliz en la Hornacina:** Al estar ubicado en el fondo superior sobre lienzo 1920×1080, en la vista general `WIDE_OVERVIEW` se percibe pequeño y oscuro si la hornacina no recibe un halo sutil de luz de luna.
- **La Misiva del Bazar y el Monedero:** Quedan apretados en el sector inferior derecho de la mesa; requieren un micro-ajuste de margen para destacar su silueta táctil sin competir con el cuaderno de actuación.

---

## 13. Problema Actual Más Importante

> [!IMPORTANT]
> **EL PRINCIPAL PROBLEMA YA NO ES GENERAR ASSETS.**  
> **EL PRINCIPAL PROBLEMA ES INTEGRAR CORRECTAMENTE LOS ASSETS APROBADOS DENTRO DE LA UI.**

Un error típico de los agentes inexpertos es creer que un problema visual se resuelve abriendo Google AI Studio o Nano Banana Pro para generar otra docena de imágenes. **Eso está terminantemente prohibido.** El repositorio ya cuenta con los activos de producción aprobados por el Director.

El reto que define el éxito del proyecto es **la integración técnica en el frontend**:
- Ajustar las escalas lógicas relativas.
- Proyectar sombras de contacto fotorrealistas con CSS y SVG.
- Ajustar viñeteados ambientales y gradientes de máscara (`mask-image`).
- Perfeccionar las transiciones de cámara cinemáticas hacia cada superficie.
- Asegurar que el paso de reposo a inspección se sienta como aproximar la mirada a una mesa victoriana real, sin tirones, sin artefactos gráficos y sin modales web.

---

## 14. Prioridades Futuras (Hoja de Ruta Ordenada)

El Director de Frontend entrante debe abordar el trabajo restante en este orden estricto de precedencia:

1. **Prioridad 1 (P0 — Perfeccionamiento de la Escena del Desván):**
   - Integración de sombras de contacto ambientales independientes bajo los 11 objetos en `DeskScene.tsx`.
   - Ajuste fino del mapa de luz cálida izquierda / fría derecha en `TimeLightingLayer.tsx`.
2. **Prioridad 2 (P0 — BRIEF-10.VISUAL-R5: Tablero de Corcho e Investigación):**
   - Construcción de la superficie ampliada del corcho (`CorkboardStage`) sobre `GFX21`.
   - Conexión de las 8 pistas canónicas del Caso Cherwood (`GFX35A–H`) mediante hilos SVG dinámicos (rojos, azules, verdes y amarillos según el tipo de relación).
   - Mecánica de arrastre o selección por teclado de pistas hacia los slots de hipótesis y acusación final.
3. **Prioridad 3 (P1 — BRIEF-10.VISUAL-R6: Bazar Clandestino del Área del Puente):**
   - Implementación de la vista comercial sobre el mostrador `GFX37` y bandeja `GFX38`.
   - Transacciones económicas transaccionales confirmadas contra el backend SQLite.
4. **Prioridad 4 (P1 — BRIEF-10.VISUAL-R7: Escenario de Combate Táctico 5×7):**
   - Montaje del teatro táctico sobre el suelo de adoquines `GFX40`.
   - Superposición de la rejilla lógica de 7 columnas y 5 filas (`GFX41`), unidades recortadas (`GFX42`) y pictogramas de estado alterado (`GFX43`).
5. **Prioridad 5 (P1 — BRIEF-10.VISUAL-R8: Prólogo Universal y Escena Ritual del Cáliz):**
   - Implementación de la escena interactiva del zaguán (`GFX47`) con la lámpara de gas (`GFX49`) y la elección de pociones (`GFX50`/`GFX51`).
   - Construcción del ritual de las Cinco Puertas en la hornacina (`GFX52`) con el gesto de beber de 3000 ms y telemetría de hesitación conectada al backend.
6. **Prioridad 6 (P2 — BRIEF-10.VISUAL-R9 y R10: Pulido Integral y Gate G4):**
   - Auditoría de rendimiento (bundle < 400 kB, 60 fps constantes en transiciones).
   - Sesión de pruebas ciegas con 3 evaluadores humanos externos sin asistencia (Gate G4).

---

## 15. Qué NO debe hacer Opus (Lista Explícita de Prohibiciones)

Como Director de Frontend, el modelo entrante tiene estrictamente prohibido realizar cualquiera de las siguientes acciones:

- ❌ **NO rediseñar el producto:** No se autorizan cambios en el concepto del juego, en la narrativa de Backlund ni en el alcance de la Fase 1.
- ❌ **NO cambiar la Composición B ("El Desván de Backlund"):** La distribución espacial de la claraboya, escalera, hornacina, corcho y mesa es ley constitucional aprobada.
- ❌ **NO sustituir los activos aprobados:** Prohibido reemplazar `C0`, `S0`, `O0` o los activos `GFX` por imágenes generadas en el momento con estilos diferentes.
- ❌ **NO reintroducir componentes HUD:** Prohibido agregar barras de vida, porcentajes numéricos de cordura, contadores flotantes o badges de rareza estilo RPG coreano.
- ❌ **NO reintroducir modales web clásicos:** Toda inspección de documentos debe ocurrir sobre superficies físicas integradas en la escena (como `IdentityDossierView` o `ActingMirrorView`).
- ❌ **NO ignorar C0 como referencia de fidelidad suprema:** Cualquier cambio visual debe evaluarse comparando una captura de pantalla real contra la imagen maestra de C0.
- ❌ **NO utilizar Three.js ni motores 3D:** El proyecto es 2.5D por capas sobre SVG, CSS y React. Introducir WebGL o 3D masivo violaría el alcance técnico.
- ❌ **NO modificar el backend, Tier L ni el balance:** El motor de dominio (`reborn/src/core/`), la biblioteca inmutable (`reborn/data/content/`) y las tablas matemáticas (`balance/`) son intocables desde el frontend.
- ❌ **NO permitir etiquetas de reposo de más de siete palabras:** La regla constitucional de la Ley del Objeto se audita de forma estricta en el script de CI.

---

## 16. Estado Actual del Proyecto

Matriz de situación para la toma de posesión del liderazgo técnico de frontend:

### 16.1 Completado (100% Operativo y Testeado)
- [x] Contrato Visual v1.0 y selección unánime de la Propuesta B.
- [x] Arquitectura de lienzo 1920×1080 con carta de navegación de 5 viewports de compatibilidad.
- [x] Máquina Central de Navegación pura (`SceneNavigationState`), foco tipado e historial de retorno.
- [x] Grafo espacial continuo de 11 hotspots accesibles con soporte integral para teclado (`Tab`, `Shift+Tab`, flechas).
- [x] Montaje del Desván 2.5D con capas de arquitectura, mesa de caoba pura e iluminación horaria por franjas.
- [x] Los 11 objetos físicos colocados con etiquetas en reposo $\le 7$ palabras.
- [x] Superficie de Calendario (`CalendarView`) conectada al motor de tiempo del backend.
- [x] Superficie de Identidad (`IdentityDossierView`) con sello de lacre, anclas de humanidad y las 6 viñetas de oficio civil (`GFX36A–F`).
- [x] Superficie de Actuación (`ActingMirrorView`) con cuaderno de cuero a dos páginas y digestión sin telegrafiado.
- [x] 173 tests core pasando al 100%, 0 violaciones de determinismo y 0 violaciones diegéticas.

### 16.2 Pendiente (Fase 1 Abierta)
- [ ] **BRIEF-10.VISUAL-R5:** Construcción del tablero de corcho (`CorkboardStage`) y conexión del grafo de pistas del Caso Cherwood.
- [ ] **BRIEF-10.VISUAL-R6:** Implementación de la vista del Bazar clandestino sobre el mostrador y bandeja de exposición.
- [ ] **BRIEF-10.VISUAL-R7:** Escenario de combate táctico 5×7 en la escalera/zaguán con tokens de unidades y estados.
- [ ] **BRIEF-10.VISUAL-R8:** Prólogo universal (zaguán y lámpara de gas) y ritual de las Cinco Puertas en la hornacina ceremonial.
- [ ] **BRIEF-10.VISUAL-R9:** Pulido general de animaciones, accesibilidad ARIA y optimización de bundle.
- [ ] **BRIEF-10.VISUAL-R10 / Gate G4:** Prueba formal con 3 evaluadores humanos ciegos midiendo la comprensión de objetos sin HUD y la hesitación del Trago.

### 16.3 Bloqueado
- **Ningún bloqueo técnico activo.** El entorno de desarrollo (React 19 + Vite 8), el servidor backend en Fastify 5 y la base de datos relacional SQLite WAL compilan y ejecutan limpiamente sin errores de dependencias ni de tipado TypeScript.

### 16.4 Riesgos Identificados
1. **Deriva Estilística por Inyección de Prompts No Controlados:** Si un nuevo agente intenta "mejorar" la apariencia generando imágenes sueltas sin respetar S0 y C0, la cohesión pictórica del desván se romperá. **Mitigación:** Usar exclusivamente los activos existentes en `ui/public/art/` y seguir el pipeline GFX formalizado.
2. **Degradación de Rendimiento por Filtros CSS en Pantallas Grandes:** El uso excesivo de `filter: drop-shadow` o `backdrop-filter` puede causar caídas de frames en resoluciones 4K (2560×1440 o superiores). **Mitigación:** Emplear sombras horneadas en canales alpha independientes y medir los 60 fps en cada pull request.
3. **Ergonomía en Resoluciones Compactas (1280×720):** En portátiles con pantallas pequeñas, los hotspots de la mesa de caoba pueden quedar muy próximos si la escala se reduce indebidamente. **Mitigación:** Mantener la safe area lógica estricta de 1440×900 y verificar siempre la legibilidad de la vitela en la prueba de compatibilidad V1.

---
*Fin del Documento Maestro de Contexto de Frontend — Path to Godhood v4.0*
