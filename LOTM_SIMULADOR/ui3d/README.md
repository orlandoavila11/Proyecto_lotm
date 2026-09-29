# ui3d — cliente Three.js WebGPU del Atlas Visual (V01–V08)

Cliente nuevo de *Path to Godhood*. La UI anterior (`ui/`) queda intacta como referencia.

```
npm install                      # en la raíz del workspace
npm run dev:server               # motor Fastify + SQLite en :3456
npm run dev:ui3d                 # cliente en http://localhost:5174
npm --prefix ui3d run assets     # procesa las imágenes de art-source/ → public/
```

Sólo en desarrollo: `?char=<id>&place=<lugar>[&arg=mansion|orfanato]` abre una escena directamente.

## Arquitectura

| Capa | Dónde | Qué hace |
|---|---|---|
| Escenario | `src/engine/Stage.ts` | `WebGPURenderer` (respaldo WebGL 2 automático), cámara ortográfica sobre el lienzo 1920×1080 en modo *cover*, balanceo con el puntero, transiciones "papel que arde", post-producción `RenderPipeline` (bloom, aberración de lente en bordes, viñeta, grano, pulso carmesí de peligro). |
| Lámina viva | `src/engine/PlateLayer.ts` | Material TSL de la pintura: paralaje por mapa de profundidad, reiluminación de velas/farolas con parpadeo, azogue del espejo (corrupción), lluvia en cristales, ondas en charcos, líquido del cáliz, brasas, contorno dorado de hover/objetivo. |
| Máscara semántica | `src/engine/PlateMask.ts` | Polígonos → textura de índices a resolución completa. El mismo buffer sirve al shader y al hit-testing: lo que brilla es exactamente lo que se pulsa. |
| Efectos | `src/engine/effects.ts` | Llama de vela (vigor = cordura), halos de gas, haz de claraboya con motas instanciadas, cortina de lluvia en tres profundidades, bancos de niebla, ascuas. |
| Objetos de juego | `engine/props.ts`, `board.ts`, `combat.ts` | Manecillas del reloj (franja real), retrato en el espejo, mercancía del bazar, tablero de corcho por homografía (tarjetas en canvas, hilos con catenaria), rejilla táctica 7×5 por homografía inversa en el shader y actores. |
| HUD | `src/hud/` | React + SVG vectorial: marcos dorados, cartela, paneles de ébano y pergamino, botones, iconografía propia. Se escribe en px del lienzo de referencia y escala con la ventana (móvil vertical: lienzo lógico de 600 px). |
| Lugares | `src/places/` | Una vista por lámina del Atlas + portada, registro de origen y prólogo. `specs/` guarda la geometría medida sobre el Atlas. |
| Motor | `src/api/client.ts` | Cliente estricto: sin datos de respaldo; toda mutación lleva `commandId` y consulta el recibo si la red falla. |

## Assets

`art-source/atlas/` contiene las 8 láminas del Atlas (entradas para edición). Las imágenes generadas
van a `art-source/generated/` con los nombres de `ASSET_PROMPTS.md`. Hasta que existan, el cliente usa
la lámina del Atlas (con su UI pintada debajo del HUD real) y el arte heredado de `ui/public/art` en
`art-source/provisional/`.
