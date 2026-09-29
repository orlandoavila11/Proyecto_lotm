# CATÁLOGO Y FICHAS TÉCNICAS DE ACTIVOS — BRIEF-10.VISUAL-R1
**Proyecto:** Path to Godhood (*LOTM_ENGINE_REBORN*)  
**Lienzo Lógico:** `1920 × 1080` (Escala 1:1)  
**Profundidad por Capas:** Capas 0 a 5  

---

## 1. Estructura del Sistema de Capas

```
[CAPA 5] — Velo Espiritual y Efectos Astrales (Overlay ceremonial a pantalla completa)
[CAPA 4] — Diálogos de Inspección y Textos Refluibles (MOMENTO = PROSA, Focus UI)
[CAPA 3] — Iluminación Dinámica y Sombras (Luz viva de vela, halo de gas, penumbra)
[CAPA 2] — Objetos Interactivos del Escritorio y Pared (Vela, Espejo, Papeles, Libro, etc.)
[CAPA 1] — Mobiliario Fijo y Estructuras (Mesa de caoba, estantería, repisas, marcos)
[CAPA 0] — Fondo Ambiental (Pared de damasco, ventanal de lluvia, niebla de Backlund)
```

---

## 2. Fichas Técnicas de Objetos Interactivos

### FICHA-01: La Vela de Sebo con Candelero de Peltre
- **ID:** `ASSET_CANDLE_PEWTER`
- **Rol Diegético:** Representación de Sanidad / Estabilidad Mental.
- **Capa:** Capa 2 (Mesa Central) + Capa 3 (Halo de Luz Dinámico).
- **Dimensiones Lógicas:** `96 × 160 px` (Hit Area: `96 × 160 px`).
- **Coordenadas Base (1920x1080):** `X: 520 px`, `Y: 520 px` (Esquina izquierda de la mesa central).
- **Formato:** SVG vectorial interactivo por componentes + CSS keyframes deterministas para la llama viva.
- **Pivote:** `(48px, 160px)` (Base del candelero sobre la madera).
- **Variantes de Estado:**
  1. `CANDLE_BRILLIANT` — Llama viva dorada (altura 36px, halo 120px radio).
  2. `CANDLE_FLICKERING` — Llama oscilante con sombra doble y 2 gotas de cera.
  3. `CANDLE_DROWNED` — Llama diminuta azulada (altura 12px, siseo).
  4. `CANDLE_EXTINCT` — Mecha negra apagada con voluta de humo SVG ascendente.
- **Sombra Asociada:** Elipse suave difusa en la base `(rgba(0,0,0,0.6), blur: 8px)`.
- **Procedencia:** Componente procedural SVG/React (aprobado en R1).

---

### FICHA-02: El Espejo de Azogue Victoriano
- **ID:** `ASSET_SOMATIC_MIRROR`
- **Rol Diegético:** Representación de Corrupción / Invasión Extraña.
- **Capa:** Capa 2 (Mesa Central, sobre caballete de latón).
- **Dimensiones Lógicas:** `180 × 240 px` (Hit Area: `180 × 240 px`).
- **Coordenadas Base (1920x1080):** `X: 740 px`, `Y: 420 px` (Centro-fondo de la mesa de caoba).
- **Formato:** Marco SVG en latón repujado con textura de cristal azogado y shader CSS de reflejo.
- **Pivote:** `(90px, 120px)` (Centro del óvalo).
- **Variantes de Estado:**
  1. `MIRROR_CLEAN` — Reflejo humano nítido sin artefactos.
  2. `MIRROR_SHADOWS` — Capa de vaho perimetral con silueta espectral desfasada.
  3. `MIRROR_CRACKED` — Fracturas radiales en el cristal con pupilas anómalas.
  4. `MIRROR_ABYSS` — Azogue negro obsidiana con ojos míticos en el fondo.
- **Sombra Asociada:** Sombra proyectada en diagonal sobre el tablero `(blur: 14px)`.
- **Procedencia:** Componente procedural SVG/CSS (aprobado en R1).

---

### FICHA-03: Grietas de Ruina sobre la Caoba
- **ID:** `ASSET_MAHOGANY_CRACKS`
- **Rol Diegético:** Representación de Ruina acumulada (Destino sellado).
- **Capa:** Capa 1 (Incrustado en la perspectiva de la mesa central).
- **Dimensiones Lógicas:** `1200 × 500 px` (Área de tablero de caoba con `pointer-events: none` salvo región activa).
- **Formato:** Trazados vectoriales SVG con filtro de hendidura en relieve y brillo interior oscuro.
- **Variantes de Estado:**
  1. `RUINA_INTEGRO` — Cero trazados (madera limpia).
  2. `RUINA_MARCADO` — Una sola fisura delgada de 120px que nace en la esquina izquierda.
  3. `RUINA_FISURADO` — Red de 6 fisuras que convergen hacia el centro de la caoba.
  4. `RUINA_QUEBRADO` — Grieta mayor transversal con astillas expuestas.
- **Procedencia:** Procedural SVG determinista (aprobado en R1).

---

### FICHA-04: Pliegos Notariales y Anclas de Identidad
- **ID:** `ASSET_IDENTITY_PAPERS`
- **Rol Diegético:** Identidad civil, profesión, salario, carga y las 3 anclas de origen.
- **Capa:** Capa 2 (Mesa central, izquierda).
- **Dimensiones Lógicas:** `220 × 280 px` (Hit Area: `220 × 280 px`).
- **Coordenadas Base (1920x1080):** `X: 780 px`, `Y: 560 px`.
- **Formato:** Pliego de papel vitela con bordes ligeramente desgastados, sello de lacre rojo y escritura en tinta ferrogálica.
- **Pivote:** `(110px, 140px)`.
- **Interacción:** Al activar, despliega la capa de inspección `INSPECTION_LAYER(IDENTITY)` con reencuadre suave de cámara.
- **Procedencia:** Componente nativo vector/CSS (aprobado en R1).

---

### FICHA-05: Cuaderno de Cuero del Intérprete
- **ID:** `ASSET_ACTING_BOOK`
- **Rol Diegético:** Principios de la vía, diario de actuación y digestión de la poción.
- **Capa:** Capa 2 (Mesa central, derecha).
- **Dimensiones Lógicas:** `200 × 260 px` (Hit Area: `200 × 260 px`).
- **Coordenadas Base (1920x1080):** `X: 1040 px`, `Y: 560 px`.
- **Formato:** Encuadernación en cuero marrón oscuro repujado con marcapáginas de seda carmesí.
- **Pivote:** `(100px, 130px)`.
- **Interacción:** Abre el diario ceremonial de principios y registros semanales de actuación.
- **Procedencia:** Componente nativo vector/CSS (aprobado en R1).

---

### FICHA-06: Tablero de Corcho en Pared de Ladrillo
- **ID:** `ASSET_CORKBOARD_CHERWOOD`
- **Rol Diegético:** Acceso y espacio de trabajo del Caso de Investigación.
- **Capa:** Capa 2 (Pared lateral derecha de ladrillo visto).
- **Dimensiones Lógicas:** `360 × 260 px` (Hit Area: `360 × 260 px`).
- **Coordenadas Base (1920x1080):** `X: 1460 px`, `Y: 180 px`.
- **Formato:** Tablero de corcho con marco de roble oscuro, chinchetas de latón e hilos rojos entrelazados entre notas policiales.
- **Pivote:** `(180px, 130px)`.
- **Interacción:** Transición de cámara hacia `FOCUS_CORKBOARD` / `CORKBOARD_STAGE`.
- **Procedencia:** Componente nativo (aprobado en R1).

---

### FICHA-07: Reloj de Faltriquera y Almanaque Civil
- **ID:** `ASSET_POCKET_WATCH_CALENDAR`
- **Rol Diegético:** Rutina diaria, franja horaria (Mañana, Tarde, Noche, Madrugada) y calendario de Backlund.
- **Capa:** Capa 2 (Mesa central, junto a la vela).
- **Dimensiones Lógicas:** `120 × 80 px` (Hit Area: `120 × 80 px`).
- **Coordenadas Base (1920x1080):** `X: 580 px`, `Y: 700 px`.
- **Formato:** Reloj de bolsillo de latón abierto con esfera grabada y pequeño almanaque de pergamino.
- **Sustituye:** Al botón flotante "Almanaque de Franjas".
- **Procedencia:** Componente nativo (aprobado en R1).

---

### FICHA-08: Saquito de Monedas de Loen
- **ID:** `ASSET_LEATHER_POUCH`
- **Rol Diegético:** Fondos y recursos económicos civiles.
- **Capa:** Capa 2 (Mesa central, extremo derecho).
- **Dimensiones Lógicas:** `140 × 140 px` (Hit Area: `140 × 140 px`).
- **Coordenadas Base (1920x1080):** `X: 1300 px`, `Y: 580 px`.
- **Formato:** Saquito de terciopelo marrón con cordel y 3 monedas visibles (soberano de oro, chelín de plata, penique de cobre).
- **Procedencia:** Componente nativo (aprobado en R1).

---

### FICHA-09: Misiva Lacrada del Bazar Clandestino
- **ID:** `ASSET_BAZAAR_LETTER`
- **Rol Diegético:** Acceso al mercado místico y transacciones de ingredientes/artefactos.
- **Capa:** Capa 2 (Mesa central, junto al monedero).
- **Dimensiones Lógicas:** `160 × 100 px` (Hit Area: `160 × 100 px`).
- **Coordenadas Base (1920x1080):** `X: 1260 px`, `Y: 700 px`.
- **Formato:** Sobre de papel grueso sellado con lacre negro y el símbolo del Ojo sin Pestañas.
- **Sustituye:** Al botón flotante "Bazar de la Niebla".
- **Procedencia:** Componente nativo (aprobado en R1).

---

### FICHA-10: Escalera de Caracol al Zaguán / Guardia Táctica
- **ID:** `ASSET_TACTICAL_STAIRCASE`
- **Rol Diegético:** Alerta defensiva y acceso al combate táctico 5x7 ante sospechas de intrusos.
- **Capa:** Capa 2 (Lateral izquierdo del fondo arquitectónico).
- **Dimensiones Lógicas:** `240 × 360 px` (Hit Area: `240 × 360 px`).
- **Coordenadas Base (1920x1080):** `X: 120 px`, `Y: 240 px`.
- **Formato:** Escalera de caracol de hierro forjado y madera que desciende a la penumbra del zaguán.
- **Sustituye:** Al botón flotante "Ponerse en Guardia".
- **Interacción:** Transición de cámara hacia `FOCUS_STAIRCASE` / `COMBAT_STAGE`.
- **Procedencia:** Componente nativo (aprobado en R1).

---

### FICHA-11: El Cáliz Ritual en Hornacina Gótica
- **ID:** `ASSET_RITUAL_CHALICE`
- **Rol Diegético:** Acceso a la ascensión de secuencia (Cinco Puertas).
- **Capa:** Capa 2 (Pared de fondo, hornacina de piedra tallada).
- **Dimensiones Lógicas:** `80 × 120 px` (Hit Area: `80 × 120 px`).
- **Coordenadas Base (1920x1080):** `X: 960 px`, `Y: 120 px`.
- **Formato:** Hornacina en arco ojival con Cáliz de plata cincelada y tenue resplandor místico.
- **Interacción:** Transición de cámara hacia `FOCUS_HORNACINA` / `CEREMONY_STAGE(ASCENSION)`.
- **Procedencia:** Componente nativo (aprobado en R1).

- **Formato:** Cáliz de plata cincelada con brillo tenue interior sobre repisa de roble.
- **Procedencia:** Componente nativo (aprobado en R1).

