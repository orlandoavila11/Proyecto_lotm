# Contrato Visual y Especificación Técnica de Escena — GFX01

**Proyecto:** Path to Godhood (*LOTM_ENGINE_REBORN*)  
**Versión:** 1.0.0  
**Fecha:** 21 de septiembre de 2026  
**Orden del Catálogo:** `GFX01` (Depende de `GFX00`)  
**Estado:** LOTE 0 COMPLETADO — LISTO PARA REVISIÓN DEL DIRECTOR  
**Lienzo Lógico:** `1920 × 1080` (Escala 1:1, zonas seguras adaptables)  

---

## 1. Fundamentos de Dirección de Arte y Cámara

1. **Encuadre:** Perspectiva de tres cuartos ligeramente elevada, con profundidad moderada y líneas de fuga coherentes hacia la ventana derecha y la escalera al fondo a la izquierda.
2. **Iluminación Principal:** Luz cálida principal (3200K) incidiendo desde la izquierda de pantalla; luz de relleno fría tenue (6500K) difusa desde la ventana de claraboya derecha.
3. **Jerarquía Visual:** El foco dominante en reposo descansa sobre la mesa de caoba central y sus objetos inmediatos (vela, libro, espejo), manteniendo los demás elementos del entorno perceptibles sin competir con la acción activa.
4. **Paleta Base Oficial:**
   - **Vacío abisal:** `#090807`
   - **Tinta profunda:** `#17120e`
   - **Caoba noble:** `#402717`
   - **Latón mate:** `#a68444`
   - **Papel de fibra:** `#e8dcc4`
   - **Tinta de papel:** `#241d16`
   - **Peligro / Carmesí:** `#8f2f31`
   - **Éter / Arcano:** `#7961a8`
   - **Anillo de Foco:** `#f0d48d`

---

## 2. Definición de Hitos de Verificación (C0, S0, O0)

Para garantizar consistencia absoluta antes de la producción en serie:

- **`C0` (Composición Maestra Aprobada):** Render de exploración aprobado del Desván completo con los 11 puntos funcionales en reposo, iluminación base y arquitectura fija.
- **`S0` (Muestra de Materiales Aprobada):** Lámina continua con las 6 texturas arquetípicas del mundo victoriano-ocultista: caoba envejecida, latón opaco, papel marfil, cuero oscuro, cera de sebo y azogue plateado.
- **`O0` (Trío Piloto Terminado):** Integración verificada de los tres primeros objetos funcionales terminados:
  1. *Vela de sebo* (`GFX12` + `GFX23`)
  2. *Espejo de azogue* (`GFX13` + `GFX24–26`)
  3. *Libro de actuación* (`GFX14` + `GFX15`)

---

## 3. Presets de Cámara Espacial 2.5D (7 Presets)

El Desván no se regenera para cada encuadre; es una única escena tridimensional/2.5D con transformaciones uniformes:

```text
+-----------------------------------------------------------------------------------+
| PRESET          | TARGET / PROPÓSITO                      | COORDENADAS (X, Y) | ZOOM |
+-----------------------------------------------------------------------------------+
| wide            | Vista arquitectónica completa           | (0, 0)             | 1.00 |
| desk-left       | Pliegos notarial, monedero, anclas      | (-380, 140)        | 1.35 |
| desk-center     | Mesa de trabajo: vela, libro, espejo    | (0, 160)           | 1.40 |
| desk-right      | Almanaque, reloj de latón, bazar        | (380, 140)         | 1.35 |
| wall-board      | Tablero de corcho e investigación       | (520, -100)        | 1.50 |
| ritual          | Hornacina ceremonial y cáliz de plata   | (0, -260)          | 1.60 |
| combat          | Umbral de escalera y rejilla táctica    | (-520, 20)         | 1.40 |
+-----------------------------------------------------------------------------------+
```

---

## 4. Bloqueo Espacial de los Once Objetos (Lienzo Lógico 1920 × 1080)

```text
+-----------------------------------------------------------------------------------+
|  [VENTANA CLARABOYA DERECHA - Relleno Frío]                                       |
|                                                                                   |
|  [HORNACINA RITUAL: Cáliz de Plata (GFX22)]                                       |
|                                                                                   |
|  [ESCALERA CARACOL (GFX09)]                          [CORCHO INVESTIGACIÓN (GFX21)]|
|   (Umbral táctico / combate)                           (Grafo Cherwood: 8 pistas) |
|                                                                                   |
|                         +-----------------------------------+                     |
|                         |       MESA DE CAOBA (GFX07)       |                     |
|                         | [Vela (GFX12)]     [Espejo(GFX13)]|                     |
|  [PLIEGOS IDENTIDAD]    |      [LIBRO DE ACTUACIÓN (GFX14)] |   [ALMANAQUE/RELOJ] |
|   (6 orígenes / anclas) |      [Carta Sellada (GFX20)]      |    (GFX18 / GFX19)  |
|  [BOLSA CUERO (GFX17)]  |      [Grietas Ruina (GFX27)]      |   [ACCESO AL BAZAR] |
|                         +-----------------------------------+                     |
|                                                                                   |
|  [BORDE FRONTAL Y PRIMER PLANO (GFX10)]                                           |
+-----------------------------------------------------------------------------------+
```

---

## 5. Estructura de Capas y Reglas de Alpha en Krita/SVG

```text
CAPA 8: Capa Semántica e Interacción (HTML/CSS + SVG hit regions + Anillos de foco)
CAPA 7: Primer Plano y Oclusiones Frontales (GFX10)
CAPA 6: Mapas Lumínicos por Franja Horaria (GFX11: Morning, Afternoon, Evening, LateNight)
CAPA 5: Efectos Atmosféricos Locales (GFX56: Polvo en haz, humo de vela, ondulación de azogue)
CAPA 4: 11 Objetos Funcionales Aislados (GFX12–GFX22 + Sombras de contacto separadas)
CAPA 3: Mesa Limpia de Caoba (GFX07) + Máscaras SVG de Grietas de Ruina (GFX27)
CAPA 2: Escalera de Caracol y Picaporte (GFX09)
CAPA 1: Estante de Libros y Hornacina (GFX08)
CAPA 0: Fondo Arquitectónico Limpio (Pared de ladrillo, ventana, vigas) (GFX06)
```

### Reglas Inviolables de Capa:
1. **Superficie Limpia:** Toda capa inferior a un objeto desmontable debe estar completamente pintada y reconstruida. Prohibidos objetos "fantasma" horneados en la madera.
2. **Sombras de Contacto Desacopladas:** La sombra de la vela, el espejo o el libro reside en una subcapa multiplicativa independiente; cambiar de estado somático no altera la sombra de la base ni genera dobles proyecciones.
3. **Alpha Real:** Prohibido damero pintado en exportaciones raster. Las capas de cristal o líquidos usan canales alfa limpios validados sobre fondos blanco, negro, magenta y caoba.

---

## 6. Adaptabilidad y Zonas Seguras Multi-Resolución

El lienzo lógico es `1920 × 1080` (proporción 16:9). El comportamiento en resoluciones auditadas se define así:

| Resolución | Aspect Ratio | Comportamiento | Zona Segura Crítica |
| :--- | :--- | :--- | :--- |
| **1280 × 720** | 16:9 | Escala uniforme 0.666x; botones y texto conservan tamaño accesible mínimo (16px base). | Central 100% visible sin scroll. |
| **1366 × 768** | 16:9 aprox. | Escala uniforme centrada con márgenes de compensación imperceptibles. | Mesa y corcho 100% visibles. |
| **1440 × 900** | 16:10 | Apertura de campo vertical leve en vigas/suelo sin desplazar pivotes interactivos. | Objetos de mesa en posición fija. |
| **1920 × 1080** | 16:9 | **Referencia nativa 1:1 (Master UI).** | Coincidencia pixel-perfect. |
| **2560 × 1440** | 16:9 | Escala uniforme 1.333x; se sirven capas 2K/4K sin pérdida de nitidez ni pixelación. | Máxima fidelidad de textura. |
| **< 1024 px** | Móvil/Compacto | Modo de inspección focal asistido: tabs diegéticos directos a objetos de mesa sin perder diegesis. | Accesibilidad garantizada. |

---

## 7. Muestra Tipográfica y Jerarquía de Texto (GFX72)

- **Tipografía Ceremonial / Títulos:** `Cinzel` (Capitales con soporte completo de tildes y diéresis en español).
- **Tipografía de Lectura / Prosa Notarial:** `Merriweather` / Serif clásica de alta legibilidad en pantalla (cuerpo 16px, interlineado 1.55).
- **Tipografía de Metadatos / Etiquetas de Reposo:** Serif sobria 13px (máximo 7 palabras en reposo).
- **Cero Texto Horneado:** Ningún cartel, carta, acta ni página contiene caligrafía horneada en la pintura digital. Todo texto es DOM vivo accesible y traducible.

---

## 8. Criterios de Aceptación para Lote 1 (Piloto GFX02–GFX04)

1. `S0` debe exhibir las 6 texturas en iluminación coherente.
2. `C0` debe situar inequívocamente los 11 objetos en reposo sin amontonamiento.
3. El trío piloto `O0` (vela, espejo, libro) debe montarse sobre la mesa limpia y responder al foco de teclado (`Tab`, `Shift+Tab`, `Enter`, `Escape`) con retroalimentación visual inmediata (<100 ms).

