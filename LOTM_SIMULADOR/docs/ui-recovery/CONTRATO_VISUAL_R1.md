# CONTRATO VISUAL Y DE INTERACCIÓN — BRIEF-10.VISUAL-R1
**Proyecto:** Path to Godhood (*LOTM_ENGINE_REBORN*)  
**Versión del Contrato:** 1.0  
**Fecha:** 18 de septiembre de 2026  
**Lienzo Lógico:** `1920 × 1080` (Escala 1:1)  
**Estado:** LISTO PARA REVISIÓN Y FIRMA DEL DIRECTOR  

---

## 1. Declaración de Principios Inviolables

1. **ESTADO = OBJETO:** Todo estado somático, mágico o material se manifiesta como un objeto físico en El Desván. No existen tarjetas de estadísticas abstractas ni barras de salud o maná en el plano principal.
2. **MOMENTO = PROSA:** En reposo, las etiquetas ambientales no superan las siete (7) palabras. La prosa descriptiva, reflexiones y susurros emergen exclusivamente al interactuar o durante momentos ceremoniales.
3. **CERO STATS MECÁNICOS:** Prohibido mostrar números crudos de atributos, fórmulas, probabilidades matemáticas o modificadores de sistema.
4. **AUTORIDAD ÚNICA DE NAVEGACIÓN:** Se erradican los booleanos y modales locales dispersos. La navegación está gobernada por una máquina central de estados tipada.
5. **INTEGRIDAD TRANSACCIONAL:** Toda mutación irreversible (compras, turnos de combate, actuaciones, ascensión) exige confirmación en el servidor antes de proyectar consecuencias visuales exitosas.

---

## 2. Composición Aprobada y Presets de Cámara 2.5D (Propuesta B)

La interfaz se estructura sobre la **Propuesta B ("El Desván de Backlund — Encuadre Espacial 2.5D por Capas")** en lienzo lógico `1920 × 1080` con cámara tipada:

### Presets de Cámara Espacial
- **`WIDE_OVERVIEW`** `(X: 0, Y: 0, Zoom: 1.0)`: Vista arquitectónica completa del Desván (claraboya abuhardillada con niebla, vigas de roble, escalera de caracol a la izquierda, hornacina ritual al fondo, mesa central de caoba y corcho a la derecha).
- **`FOCUS_DESK`** `(X: 0, Y: 180, Zoom: 1.35)`: Enfoque suave hacia la mesa de caoba para interactuar con la vela, los pliegos de identidad, el diario de actuación, el reloj de faltriquera y el monedero.
- **`FOCUS_CORKBOARD`** `(X: 520, Y: -80, Zoom: 1.50)`: Enfoque hacia la pared lateral de ladrillo para conectar pistas y formular hipótesis en el Expediente Cherwood.
- **`FOCUS_HORNACINA`** `(X: 0, Y: -260, Zoom: 1.65)`: Enfoque hacia la hornacina gótica de la pared para el Cáliz de Plata y el ritual de ascensión.
- **`FOCUS_STAIRCASE`** `(X: -540, Y: 40, Zoom: 1.40)`: Enfoque hacia la escalera de caracol hacia el zaguán para preparación táctica y combate ante intrusos.

### Estados de Navegación de la Máquina Central
- `DESK_WIDE` — Vista general del desván en reposo.
- `DESK_FOCUS(targetPreset)` — Transición de cámara hacia la zona de interés (300 ms).
- `INSPECTION_LAYER(targetId)` — Capa de lectura e interacción focal (pliego notarial, diario, misiva del bazar).
- `CORKBOARD_STAGE` — Vista ampliada interactiva del tablero de pistas.
- `COMBAT_STAGE` — Teatro táctico 5x7 integrado en la zona del umbral/zaguán.
- `CEREMONY_STAGE(ceremonyType)` — Ritual de las Cinco Puertas en la hornacina ceremonial.

### Ciclo de Vida Estandarizado por Superficie

| Fase del Ciclo | Comportamiento del Cliente | Comportamiento del Servidor |
|---|---|---|
| **1. Entrada** | Foco visual en el objeto, elevación suave y transición de cámara (250–350 ms). | Consulta o recuperación de snapshot persistido. |
| **2. Acción** | El jugador selecciona una opción canónica o conecta pistas. | Validación local preliminar de contrato (tipos). |
| **3. Cancelación** | Tecla `Escape` o botón físico de retorno; restaura el foco exacto en el Desván. | Ningún efecto en el estado persistente. |
| **4. Confirmación** | Diálogo o gesto deliberado (Hold-to-Drink en poción, botón explícito en transacciones). | Ninguna mutación ejecutada hasta confirmación. |
| **5. Envío** | Animación de tinta/pulso; controles deshabilitados temporalmente para evitar doble clic. | Ejecución transaccional determinista en SQLite. |
| **6. Espera / Error** | Si hay fallo de red o rechazo de regla, se expone mensaje diegético y opción de reintento seguro. | Reconciliación de snapshot sin duplicar estado. |
| **7. Consecuencia** | Actualización física de la escena (vela, azogue, madera, monedas, notas) con datos confirmados. | Estado guardado en base de datos. |
| **8. Retorno** | Despliegue inverso suave hacia `DESK_WIDE` con foco restaurado en el objeto accionado. | Listo para siguiente interacción. |

---

## 3. Tokens de Diseño y Sistema Visual

### A. Paleta de Colores Victoriana / Ocultista
- `--lotm-ebon-void`: `#090807` (Fondo abisal, sombras profundas)
- `--lotm-mahogany-desk`: `#1c130c` (Madera noble del escritorio)
- `--lotm-mahogany-border`: `#2b1b10` (Bordes y molduras de madera)
- `--lotm-antique-gold`: `#d4af37` (Latón envejecido, acentos arcanos, anillos de foco)
- `--lotm-parchment-base`: `#ede4d1` (Papel vitela, cartas, pliegos)
- `--lotm-ink-black`: `#1a1612` (Tinta ferrogálica de escritura)
- `--lotm-crimson-blood`: `#851c22` (Lacre rojo, peligro, confirmación deliberada)
- `--lotm-spirit-purple`: `#c084fc` (Aura del Velo espiritual, visión mística)
- `--lotm-cobalt-blue`: `#0284c7` (Esencia de The Fool / Vidente)
- `--lotm-amber-gold`: `#d97706` (Esencia de Visionary / Espectador)

### B. Tipografía Canónica
- **Títulos Arcanos y Nombres Ceremoniales:** `Cinzel`, `serif` (mayúsculas, tracking amplio `0.15em`).
- **Prosa Narrativa y Correspondencia:** `EB Garamond` / `Merriweather`, `serif` (interlineado generoso `1.6`, estilo editorial victoriano).
- **Cifras Diegéticas y Recibos:** Tipografía serif clásica de imprenta (sin fuentes digitales monospace contemporáneas en el plano diegético).

### C. Elevación y Capas (Z-Index)
- `z-index: 10` — Mobiliario y fondo ambiental (Capa 0 y 1).
- `z-index: 20` — Objetos interactivos en reposo (Capa 2).
- `z-index: 30` — Iluminación dinámica y halos de vela (Capa 3).
- `z-index: 40` — Superficies de inspección focal y diálogos (Capa 4).
- `z-index: 50` — Velo espiritual y transiciones ceremoniales (Capa 5).

### D. Duraciones de Movimiento y Animación
- Micro-interacciones de hover/foco: `120 ms` (`ease-out`).
- Transiciones de cámara y enfoque de objeto: `300 ms` (`cubic-bezier(0.16, 1, 0.3, 1)`).
- Despliegue de pliegos e inspecciones: `400 ms`.
- Gesto Hold-to-Drink: Estrictamente `3000 ms` continuos (conforme a la regla de dominio).
- `prefers-reduced-motion: reduce`: Desactiva traslaciones espaciales y sustituye por disolvencias directas de `100 ms`.

---

## 4. Accesibilidad y Navegación por Teclado

1. **Orden de Foco Espacial:**
   - La navegación con `Tab` / `Shift+Tab` recorre los objetos en orden lógico de izquierda a derecha y de arriba a abajo:
     1. Espejo de Azogue -> 2. El Cáliz -> 3. Tablero de Corcho -> 4. La Vela -> 5. Almanaque -> 6. Pliegos de Identidad -> 7. Cuaderno de Actuación -> 8. Monedero -> 9. Misiva del Bazar -> 10. Picaporte de Guardia.
2. **Foco Visible de Alto Contraste:**
   - Todo elemento enfocado muestra un anillo de latón dorado: `outline: 2px solid #d4af37; outline-offset: 3px; box-shadow: 0 0 10px rgba(212,175,55,0.4)`.
3. **Modo Atención:**
   - Activación con tecla `A` o clic. Permite alternar la visualización de las etiquetas ambientales de todos los objetos en pantalla sin requerir sostener una pulsación continua.
4. **Soporte Zoom 200%:**
   - Los contenedores de texto refluible en la Capa 4 permiten escalado al 200% sin truncamiento ni desbordamiento de pantalla.

---

## 5. Criterios de Aceptación UI (V1 a V8)

| Criterio | Nombre | Umbral Exigido | Método de Verificación |
|---|---|---|---|
| **V1** | **Composición** | Cero recortes o solapamientos funcionales en las 5 resoluciones (`1280x720`, `1366x768`, `1440x900`, `1920x1080`, `2560x1440`). | Capturas en navegador real automatizado. |
| **V2** | **Control** | 100% de acciones críticas ejecutables exclusivamente por teclado (`Tab`, `Enter`, `Space`, `Escape`, flechas). | Recorrido automatizado de accesibilidad. |
| **V3** | **Diegesis** | Cero stats mecánicos o términos numéricos de sistema visibles en la interfaz. | Script `audit:diegetic` + inspección visual. |
| **V4** | **Integridad** | Cero éxitos irreversibles antes de respuesta persistida en servidor SQLite. | Pruebas de integración y timeout simulado. |
| **V5** | **Descubrimiento** | Al menos 2 de 3 evaluadores descubren los objetos primarios sin asistencia. | Protocolo de prueba humana ciega G4. |
| **V6** | **Retorno** | 3 de 3 evaluadores regresan al Desván desde cualquier superficie sin asistencia. | Protocolo de prueba humana ciega G4. |
| **V7** | **Interpretación** | Al menos 2 de 3 evaluadores ordenan correctamente los estados de vela y espejo sin números. | Tarea diegética en sesión G4. |
| **V8** | **Referencias** | Ninguna golden image cambia sin aprobación previa y reporte de DELTA. | CI visual diff versionado. |

---

## 6. Presupuestos Técnicos Sometidos a Ratificación

- **Tamaño de Bundle JS Inicial (Uncompressed):** Máximo `400.00 kB` (Medición real R0: `330.46 kB` — **Cumplido**).
- **Tamaño de Bundle JS (Gzip):** Máximo `120.00 kB` (Medición real R0: `100.03 kB` — **Cumplido**).
- **CSS Total:** Máximo `30.00 kB` (Medición real R0: `7.48 kB` — **Cumplido**).
- **Tiempo de Respuesta Percibida en Interacción:** `< 100 ms`.

