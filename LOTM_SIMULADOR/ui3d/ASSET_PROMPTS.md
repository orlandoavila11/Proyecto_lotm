# Path to Godhood — Encargo de imágenes para el cliente Three.js (ui3d)

Las 8 láminas del Atlas son la **ancla**. El motor necesita esas mismas pinturas **sin interfaz pintada**
y con algunos objetos separados, para que la hora, las pistas, los actores, los objetos del bazar y
la llama de la vela se generen desde la sesión real.

## Cómo entregar

1. Guarda cada imagen en `ui3d/art-source/generated/` con **el nombre exacto** indicado (`.png`, `.jpg` o `.webp`).
2. Ejecuta `npm --prefix ui3d run assets`. El script recorta, quita el fondo verde (#00FF00), redimensiona
   y publica en `ui3d/public/`. Mientras falte una imagen, el juego usa la lámina del Atlas como provisional.
3. Recortes: si tu herramienta admite **fondo transparente**, úsalo. Si no, pide **fondo verde plano #00FF00**
   sin sombras proyectadas sobre el verde.

**Herramienta recomendada para las láminas limpias:** un modelo de *edición* (GPT-Image edit, Gemini/Nano Banana,
Flux Kontext o Relleno generativo de Photoshop) usando como entrada la lámina del Atlas que está en
`ui3d/art-source/atlas/`. Es una edición, no una imagen nueva: el prompt insiste en conservar todo lo demás.

Estilo común (se añade al final de cada prompt de objetos o recortes):

> `STYLE: painterly realism, Victorian occult noir, 1850s Backlund, warm tallow-candle key light (3200K) against cold blue moonlit fill, rich mahogany, dull brass, aged ivory paper, deep shadows, fine brush texture, cinematic, no text, no watermark, no signature, no UI.`

---

## PRIORIDAD 1 — Láminas limpias (16:9, mínimo 2560×1440, ideal 3840×2160)

Entrada: la lámina del Atlas indicada. Prompt base común para todas (pégalo delante del específico):

> `Edit this painting. Keep the exact same composition, camera, perspective, lighting, colors and brushwork. Every object not mentioned must remain identical in position, size and shape. Remove only what is listed below and repaint the area underneath as it would naturally continue. No new objects, no text, no UI, no frames.`

| Archivo | Entrada | Qué eliminar / cambiar |
|---|---|---|
| `plate_v01_desvan.png` | V01_desvan | `Remove: the "EL DESVÁN" title box top-left, the "Una Carta sin Remitente" panel on the right (repaint the corkboard with its map and notes behind it), the bottom navigation bar with Diario/Ciudad/Ajustes, and the "Partida guardada" badge bottom-left (repaint the chair and floor). Remove the glowing golden outline around the envelope (keep the envelope and red wax seal). Remove the two hands of the desk clock: keep the clock face with its Roman numerals clean and empty. Remove the flame of the candle on the left of the desk, keep the candle and a short black wick (the warm light on the room stays).` |
| `plate_v02_cherwood.png` | V02_cherwood | `Remove: the "CHERWOOD / Elegir destino" title box, the whole "ORFANATO" panel on the right (continue the gothic buildings, street lamp, market awning and wet cobblestones behind it), the three small label tags "Pensión", "Orfanato", "Bazar" with their diamond pins, and the "Volver al Desván" button bottom-left (continue the wet pavement).` |
| `plate_v03_despacho.png` | V03_localizacion | `Remove: the whole "INSPECCIÓN" parchment panel on the right (continue the study: panelled wall, fireplace side, a bookshelf and the Persian rug), the thin golden leader line and its dot, and the "Volver" button bottom-left. Keep the burnt wooden toy wheel and charred wood in front of the fireplace exactly as they are.` |
| `plate_v04_tablero.png` | V04_investigacion | `Remove: the title box top-left, the whole "HIPÓTESIS" panel on the right (continue the bookshelves, window with gothic spires and desk), the bottom legend bar, AND the three large photo cards on the cork board ("Juguete quemado", "Documento alterado", "Registro de pagos") together with their brass pins and the red strings. Keep the old map, sketches, small notes and the building drawing pinned on the cork; repaint bare cork where the cards were. Remove the candle flame (keep the wick).` |
| `plate_v05_bazar.png` | V05_bazar | `Remove: the title box, the whole right panel (continue the apothecary shelves, jars and window), the bottom thumbnail strip with arrows, AND the three featured goods on the counter (the amber bottle, the dark ore on the brass plate, the wrapped lavender bundle) together with their small paper labels. Keep the merchant exactly the same, keep the embroidered red cloth and the counter surface, repaint them clean where the goods were.` |
| `plate_v06_callejon.png` | V06_combate | `Remove: the title box, the "Objetivo seleccionado" panel, the bottom action bar, ALL painted grid lines and the cyan highlighted floor squares, AND both characters (the man in the long coat with the revolver and the hooded figure with the knife). Keep crates, barrel, lamps, fog, carriage, gate and wet cobblestones; repaint clean cobblestones where the grid and the characters were.` |
| `plate_v07_diario.png` | V07_regreso | `Remove: the whole "DIARIO DE ACTUACIÓN" stack of papers on the right (continue the desk, the rainy window and the dark room). Inside the oval mirror, remove the man: leave only a misty, darkened quicksilver reflection of the room with the candle glow. Remove the candle flame (keep the wick).` |
| `plate_v08_umbral.png` | V08_ascension | `Remove: the whole "EL SIGUIENTE UMBRAL" panel on the right (continue the rainy window, velvet cloth, books and desk). Inside the oval mirror, remove the man: leave only a misty, darkened quicksilver reflection. Make the liquid inside the silver chalice a flat, dark, still surface (no swirls). Remove the candle flame (keep the wick).` |

> Si una herramienta no respeta la composición, genera la lámina a la misma resolución del Atlas (1672×941)
> y yo la reescalo; es preferible fidelidad a resolución.

---

## PRIORIDAD 2 — Recortes y fotografías de juego

### 2.1 Actores del combate (recorte, 1024×2048 vertical, pies completos visibles)

Deben encajar en `plate_v06_callejon`: cámara elevada ¾, luz cálida de farol desde la izquierda, bruma fría al fondo.

- `actor_player.png` — `Full body of a young Victorian private investigator in a long dark wool greatcoat and a deep crimson scarf, dark tousled hair, seen from behind at three-quarters, walking stance, holding an old revolver low in his right hand, boots wet, camera looking down at 35 degrees, warm lamplight rim on the left side of the coat, isolated on flat pure #00FF00 green background, no ground, no shadow.` + STYLE
- `actor_enemy.png` — `Full body of a menacing hooded cultist in a long black leather coat, face hidden in the shadow of the hood with only a pale chin visible, crouched combat stance, holding a thin curved knife, facing the camera, camera looking down at 35 degrees, cold blue fog light from behind, isolated on flat pure #00FF00 green background, no ground, no shadow.` + STYLE
- `actor_enemy_portrait.png` — (512×512) `Close portrait of the same hooded figure, face in total shadow, dark background.` + STYLE

### 2.2 Retratos del espejo (V07/V08) — uno por origen (768×1024, fondo oscuro, rostro centrado)

Prompt base: `Head and shoulders portrait of <PERSONA>, pensive, hand near the chin, looking slightly away, lit by a single candle from the lower left, Victorian 1850s clothing, dark background fading to black at the edges, oil painting texture.` + STYLE

| Archivo | `<PERSONA>` |
|---|---|
| `portrait_ORIGIN_CLERK.png` | `a thin notarial clerk in his late twenties, ink-stained fingers, starched collar, tired eyes` |
| `portrait_ORIGIN_MEDICAL_STUDENT.png` | `a young medical student, sleeves rolled, loose cravat, sharp analytical gaze` |
| `portrait_ORIGIN_REPORTER.png` | `a crime reporter in his early thirties, crumpled waistcoat, pencil behind the ear` |
| `portrait_ORIGIN_FRAUDULENT_MEDIUM.png` | `a parlour medium woman in her thirties, dark lace high collar, pale skin, distant eyes` |
| `portrait_ORIGIN_DOCKWORKER.png` | `a broad-shouldered dockworker, weathered skin, short beard, rough wool coat` |
| `portrait_ORIGIN_PRIVATE_INVESTIGATOR.png` | `a young private detective with dark tousled hair and a crimson silk cravat (like the man in the Atlas mirror)` |

### 2.3 Fotografías de pistas (V03 inspección y V04 tablero) — 1600×1200 (4:3), primer plano cinematográfico

Prompt base: `Cinematic close-up still life photograph-like painting of <OBJETO>, shallow depth of field, lit by a warm oil lamp from the left, dark background.` + STYLE

| Archivo | `<OBJETO>` |
|---|---|
| `clue_CLUE_BURNED_TOYS.png` | `a charred wooden toy cart with a scorched wheel lying in fireplace ashes` |
| `clue_CLUE_WILL_DRAFT.png` | `a crossed-out draft of a will on legal paper with a fountain pen and a mahogany desk corner` |
| `clue_CLUE_MIND_TRACES.png` | `a lady's vanity table with sedative bottles, spilled powder and a small open diary with hurried handwriting` |
| `clue_CLUE_ASTROLOGY_RECORD.png` | `chalk astrological circles and symbols drawn on dusty attic beams of an orphanage dormitory` |
| `clue_CLUE_CONCEALED_SAFE.png` | `a small iron safe hidden behind a swung-open family portrait, a leather ledger inside` |
| `clue_CLUE_FINANCIAL_BLACKMAIL.png` | `an open bank ledger with columns of transfers, a red wax seal and a spiritualist's calling card` |
| `clue_CLUE_FORGED_LETTERS.png` | `parish health records with altered dates and a folded letter sealed with red wax (like the "Documento alterado" card)` |
| `clue_CLUE_BLOODLINE_TALISMAN.png` | `a small ornate hand mirror resting in an open lead-lined case in a cellar, faint cold glow` |

### 2.4 Destinos de Cherwood y distritos (panel V02) — 1200×800

Prompt base: `Night view of <LUGAR> in a rainy Victorian gothic city, gas lamps, wet reflections.` + STYLE

`dest_pension.png` (`a narrow four-storey boarding house with an attic skylight and a lit window`) ·
`dest_orfanato.png` (`the San Dionisio orphanage behind a wrought iron gate, one lit window` — igual que el recuadro del Atlas) ·
`dest_bazar.png` (`a covered clandestine apothecary bazaar stall with a red awning and lanterns`) ·
`dest_mansion.png` (`the Sterling family mansion, stone facade, a single lit study window`) ·
`dest_east_borough.png` (`the soot-black docks and workers' tenements of East Borough`) ·
`dest_queen.png` (`the white cathedral and palaces of Queen's District in thin fog`) ·
`dest_bridge.png` (`the Bridge District black market under the great iron bridge`) ·
`dest_callejon.png` (`a narrow alley under a stone arch, crates, a hooded figure waiting in the fog`) ·
`dest_carriage.png` (`a black hansom cab with red lanterns waiting in the rain, the cabman in a top hat`).

> Los destinos del bazar y del callejón usan también los recortes de la lámina V02 mientras faltan.

### 2.5 Mercancías del bazar (recorte, 1024×1024, vista ¾ ligeramente elevada como en V05)

Prompt base: `Single <MERCANCÍA>, isolated on flat pure #00FF00 green background, three-quarter view from slightly above, warm lamplight from the left, no labels with readable text, no shadow on the background.` + STYLE

| Archivo | `<MERCANCÍA>` |
|---|---|
| `item_ING_JIMSONWEED_JUICE.png` | `amber glass apothecary bottle with cork, filled with pale green juice` |
| `item_ING_CHESTNUT_BUDS.png` | `small paper packet tied with twine, spilling dark green chestnut buds` |
| `item_ING_BLACK_SUNFLOWER_POWDER.png` | `small brass tin with dark powder and a black-rimmed dried sunflower` |
| `item_ING_ELVEN_FLOWERS.png` | `bundle of pure white delicate flowers wrapped in parchment, tied with string` |
| `item_RITUAL_PURIFIED_WATER.png` | `clear stoppered glass flask with luminous clean water` |
| `item_ING_GOAT_HORN_CRYSTAL.png` | `grey crystalline shard grown from a goat horn on a brass plate` |
| `item_ING_HUMAN_FACED_ROSE_STALK.png` | `long dark rose stalk whose closed bloom faintly resembles a human face` |
| `item_ING_GOLDEN_CLOAK_GRASS_POWDER.png` | `small glass jar of shimmering golden powder` |
| `item_ING_POISON_HEMLOCK.png` | `dark glass vial with a skull-less plain black label and hemlock sprig` |
| `item_ING_LIZARD_DRAGON_GLAND.png` | `iridescent seven-coloured gland in a sealed jar of liquid` |
| `item_ING_FALSMAN_RABBIT_SPINAL_FLUID.png` | `slender 10ml glass ampoule with milky fluid` |
| `item_ING_DRAGON_TOOTH_GRASS_POWDER.png` | `ceramic mortar with pale green powder and a jagged leaf` |

Y un fondo para la vista previa del panel: `bazaar_preview_bg.png` (1024×768) — `Empty embroidered crimson velvet cloth on a dark wooden counter, soft warm lamplight, blurred apothecary shelves behind, nothing on the cloth.` + STYLE

### 2.6 Umbral de ascensión y prólogo (recorte, 512×512)

- `icon_formula.png` — `an aged folded parchment with a handwritten potion formula` (verde #00FF00)
- `icon_ingredients.png` — `two small glass jars, one with dried red petals, one with dark red liquid` (verde)
- `icon_digestion.png` — `a small worn leather journal with a brass clasp` (verde)
- `potion_cobalt.png` (1024×1536) — `an octagonal cobalt blue glass flask whose liquid looks like a miniature night sky with silver sparks` (verde)
- `potion_amber.png` (1024×1536) — `a cylindrical amber glass ampoule with perfectly still golden liquid` (verde)

### 2.7 Materiales de interfaz

- `paper_texture.png` (2048×2048, **seamless tileable**) — `Aged ivory laid paper texture, subtle fibers, faint foxing stains, flat even lighting, seamless tileable.` (sin STYLE)
- `panel_texture.png` (2048×2048, **seamless**) — `Very dark ebony lacquered wood with extremely subtle grain, almost black, flat lighting, seamless tileable.` (sin STYLE)

---

### 2.8 Lámina extra (recomendada): el orfanato de San Dionisio

- `plate_v03b_orfanato.png` (2560×1440) — `Interior of a poor Victorian orphanage attic dormitory at night: rows of small iron beds, dusty wooden beams with faint chalk astrological circles and symbols drawn on them, a narrow stair down to a parish archive crypt, a single candle, cold moonlight through a small dormer window. Same camera height and composition language as the Sterling study painting: three-quarter view, painted interior, empty right third for a reading panel.` + STYLE
  (Hoy el orfanato se visita enfocando la verja de la calle; con esta lámina tendrá escena propia.)

## PRIORIDAD 3 — Mapas de profundidad (opcional, gran mejora de paralaje)

Para cada `plate_v0X_*.png` final: súbelo a **Depth Anything V2** (Hugging Face Space
`depth-anything/Depth-Anything-V2`, modelo *Large*) y guarda el resultado en escala de grises (blanco = cerca)
como `depth_v0X_<mismo nombre>.png`. Ejemplo: `depth_v01_desvan.png`.

## PRIORIDAD 3b — Mapas de emisión (opcional, gran mejora de brillo)

Para cada `plate_v0X_*.png` final, una imagen del mismo tamaño en blanco y negro donde **sólo** son blancas
las fuentes de luz pintadas (llamas, faroles, ventanas iluminadas, brasas) y todo lo demás es negro puro.
Nombre: `emit_v0X_<mismo nombre>.png` (ej. `emit_v01_desvan.png`). Prompt para un editor de imágenes:

> `Convert this painting into an emission mask: pure white only where light sources are (candle flames, gas lamps, lit windows, glowing embers), with a soft falloff of a few pixels; everything else pure black. Same size and alignment, no other changes.`

El cliente ya las usa (sesión 2): con `plate_*` limpia y su `emit_*`, el bloom selectivo toma la máscara pintada;
sin ella la estima de la pintura (núcleos casi blancos y halos cálidos saturados). Revísala en desarrollo con
`__stage.setGlowSource('mask')` en la consola.

## PRIORIDAD 4 — Variantes de hora (opcional)

`plate_v01_desvan_dawn.png` y `plate_v01_desvan_day.png`: misma edición que `plate_v01_desvan`, añadiendo
`Change the time of day to early morning: pale grey-blue daylight through the skylight, the candle unlit, cooler and brighter room`
(o `midday overcast daylight`). Si no existen, el motor gradúa la lámina nocturna.
