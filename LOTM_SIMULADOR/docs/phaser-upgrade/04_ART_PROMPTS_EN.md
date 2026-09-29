# PATH TO GODHOOD · Art production and generation prompts

24 September 2026 · Prompts in English; player-facing sample copy in Spanish.

## Cómo utilizarlos

A00–A04 son órdenes para el agente de producción. V01–V08 generan las ocho imágenes ancla. Los prompts de recursos utilizan el contrato común más la ficha específica. Los JSON y archivos individuales contienen el texto completo, listo para copiar. Los recursos del manifest están PLANNED: esta entrega genera conceptos de recorrido, no todos los sprites finales.

Para variantes, adjunta la imagen aprobada como referencia y exige conservar sus invariantes. Si el proveedor no admite alpha o dimensiones exactas, aplica la preparación manual del documento 03; nunca declares una prestación que la herramienta no ofrece.

## A00 · Lock the visual direction

```text
Act as art director for the EXISTING Path to Godhood Phaser upgrade. Read documents 01 and 03, inspect the current refuge screenshot, and review V01-V08. Separate immutable lore from redesignable composition. Create a short approval sheet containing palette tokens, material examples, camera/light direction per scene, UI safe areas and one original protagonist identity sheet. Do not generate the entire asset library yet.
Use V01 as the primary material and interface anchor. Identify any concept artifact, unreadable word, inappropriate power, contradictory perspective, or impossible UI state. Treat generated text as a layout cue, never as source content. Approve or correct one refuge composition and a candle/mirror family before authorizing later batches.
Deliver an annotated reference sheet, a prioritized defect list, an asset dependency map and the first production batch. Record actual reference files and tool/model settings. The pass condition is a coherent scene plan that an integrator can reproduce, not a subjective percentage or a promise of AAA quality.
```

## A01 · Produce and prepare the refuge asset batch

```text
Act as a production artist. Use the approved V01 and BG01/OBJ01/OBJ02 specifications. Inspect the actual existing JPEGs before generating replacements. Create a clean plate with all dynamic-object pixels, glow and contact shadows removed. Preserve structural geometry and restore the support surface consistently.
Prepare the candle holder and mirror as independent layers with genuine alpha. Keep illumination aligned with the clean plate. Build mirror variants by editing the same approved source, changing only the glass. Export contact shadows separately where needed. Do not repaint the entire mirror independently for every state.
Use layered raster editing for masks and corrections; do not accept a painted checkerboard as transparency. Record canvas size, visible bounds, source frame, trim offset and measured pivot. Provide white/dark/final-scene edge checks. Keep editable masters outside ui/public.
Deliver source layers, runtime candidates, manifest updates and an integration preview. Mark the batch PREPARED until it is tested in Phaser. Fail the batch if objects float, perspective drifts, shadows double, or any state changes the object's apparent support point.
```

## A02 · Integrate a prepared art batch in Phaser

```text
Act as the art integrator for the existing game. Read the prepared asset manifest and relevant scene code. Verify each actual file's dimensions, alpha, hash, trim offsets and pivot before use. Map stable asset IDs to the scene; do not hardcode arbitrary offsets in multiple components.
Load only the scene's needed group plus documented shared resources. Place ground/support, contact shadows, object bodies, highlights and effects at explicit depths. Reuse the common coordinate transform for scene geometry and interaction masks. Keep HTML text, controls, numbers, tactical cells and focus indicators as functional code.
Check normal, focus, selected, disabled, pending and state-changed views. Compare with the accepted reference at the same viewport and lighting; list specific defects. Verify enlarged text and reduced motion. If a placeholder remains, report it and keep its production status honest.
Deliver actual screenshots from the running game, measured transfer/texture estimates, cleanup behavior after scene transitions and updated manifest status. An import that compiles is not an art acceptance. Do not ship a full concept screenshot as a fake interactive scene.
```

## A03 · Review the complete artistic journey

```text
Review V01-V08 against genuine screenshots of the integrated game. Evaluate each scene's focal point, legibility, light direction, material consistency, original character identity, scale, alpha quality and interaction affordances. Review at gameplay size as well as 100 percent crop. Verify that grids, labels and selection effects match actual behavior.
Create a scene-by-scene table with PASS, FIX or NOT IMPLEMENTED for concrete requirements. List a maximum of five highest-impact fixes per scene, with exact asset/component and expected correction. Do not write blanket praise, invented fidelity percentages or claim persistence from a screenshot.
Check transitions as a short recorded journey: refuge, city, clue acquisition, board, purchase, tactical action, return and preparation. Confirm audio does not duplicate and atmosphere does not hide targets. Identify canon concerns separately from visual polish so an art correction does not silently alter the story.
Approve only the states actually reviewed. Preserve the version of each approved anchor and integrated screenshot. The release art pack includes provenance, editable masters, optimized exports and a manifest; rejected variants remain outside the public bundle.
```

## A04 · Build vector UI and procedural effects without rasterizing gameplay

```text
Implement the shared UI ornament and effect system using editable vectors and code. Reuse the project's existing icon language where suitable. Create fine corner brackets, separators, pin/relationship symbols and panel borders as SVG or CSS; use semantic HTML text and real controls. Do not ask an image generator to paint prices, ability descriptions, action buttons or an exact tactical grid.
Create candle flame motion, dust, rain, focus glow and restrained perception effects using Phaser-supported primitives or small purpose-built textures. Verify API compatibility with the installed 4.2.1 types. Give each effect a reduced-motion/no-flash alternative, a clear lifecycle and visual-only state. Effects must not consume domain RNG or advance game time.
Derive tactical cells and hit-tests from the same projection. Give relationship lines text or pattern distinctions in addition to color. Keep overlays keyboard-accessible and block scene input while appropriate.
Deliver editable vector sources, effect parameters, a running state gallery and scene integration evidence. Do not mark generated sprite sheets accepted without checking frame continuity, support point and anatomy. Prefer a few stable poses and controlled motion over incoherent multi-frame generation.
```

## Visual anchor master contract

```text
Use case: stylized-concept / ui-mockup.
Create one finished, premium game-screen concept for PATH TO GODHOOD, the existing illustrated Victorian occult investigation RPG. It is an original game situation compatible with Lord of the Mysteries, not a recreation of a novel scene. Landscape 16:9, full screen, no device mockup, no montage. The style is high-definition painterly realism: deliberate brushwork, crisp silhouettes, tactile dark wood, aged brass, pewter, cream paper, wool, glass and wet stone. Strong spatial composition and readable interactive intent, suitable for a layered 2D Phaser production. Deep ink and charcoal, ivory, muted brass, restrained blue-green fog, tiny oxblood accents. Warm practical light balanced by cool environmental light. Keep shadows readable. Avoid generic all-brown darkness, neon purple fantasy, excessive gold filigree, modern dashboard cards, photographic collage, anime, pixel art, giant floating icons, illegible dense text, invented sacred emblems, and famous canon characters.
The UI is bespoke and restrained: fine brass rules, ivory type, charcoal translucent surfaces, editorial serif headings and clean readable body copy. Functional labels are Spanish, short, and exact where specified. Most of the image is the game world. The character shown, if any, is an original adult investigator with short dark-brown hair, a lean face, charcoal coat, ivory shirt and a muted oxblood neckcloth; not Klein or another book character. Concept art is not a proof of implemented gameplay. Do not print that disclaimer inside the image. Do not add a logo watermark, decorative paragraphs, or unrequested cosmic beings.
```

## V01 · El Desván: preparar la salida

Prepend the visual anchor master contract. The JSON and individual prompt files already include it.

```text
REFERENCE ROLE: the provided current Desvan screenshot is a spatial and object reference only. Reimagine it at a substantially higher production level. Preserve recognizable refuge motifs: timber attic, a stair exit at left, cool upper-right window, wooden desk, candle, oval mercury mirror, journal, sealed letter, coin pouch, clock and background case board. You may rebalance proportions and simplify clutter.
CAMERA AND COMPOSITION: intimate eye-level three-quarter view, richly painted room depth. The desk occupies the lower half, with clear space between useful objects. The candle is modest in scale, not a towering centerpiece. Warm light from upper-left, cool atmospheric light from the window. A tiny dust layer, grounded shadows, a subtle wax seal. Keep the staircase visibly usable. A selected envelope near the center-right of the desk has one restrained focus outline. The room occupies roughly 82 percent of the screen.
UI: top-left small heading "EL DESVÁN"; beneath it "Cherwood · Noche". A compact right-side objective card, no more than 23 percent width, reads "UNA CARTA SIN REMITENTE" and "Examinar la carta" with a single clear action. Bottom edge has three discreet labeled controls: "Diario", "Ciudad", "Ajustes". A small status "Partida guardada" may sit bottom-left. Do not reproduce the old unreadably tiny object labels or numeric sequence mismatch. The final frame should feel like a polished playable adventure, not an illustration with a website pasted over it.
```

## V02 · Cherwood: elegir una ruta

Prepend the visual anchor master contract. The JSON and individual prompt files already include it.

```text
REFERENCE ROLE: use the approved refuge image as the style, material, color and UI family reference; do not reproduce the attic composition.
SCENE: a richly painted rain-damp street in Cherwood at blue hour. Victorian fantasy masonry, gas lamps, a carriage at mid-distance, restrained pedestrians, an apothecary window and a side entrance toward a residential courtyard. No famous real London landmark. Strong foreground-midground-background separation, charcoal stone and warm pools of lamplight. The street is an authored investigation location, not an open-world action scene. No large player avatar, no minimap full of quest markers.
COMPOSITION: the world fills most of the frame. Three architectural routes are discoverable through modest small markers placed beside entrances, never floating over faces. Leave the rightmost quarter calm for a selected destination card. The carriage and leading street lines guide attention toward the chosen route.
UI EXACT COPY: top-left "CHERWOOD" with subtitle "Elegir destino". Three small labels: "Pensión", "Orfanato", "Bazar". Right card: "ORFANATO", a short atmospheric line "Una luz sigue encendida.", and buttons "Viajar" and "Cancelar". A small bottom-left "Volver al Desván". Do not invent a price or time cost in the concept; those values come from the live game. Preserve the same brass line weight, ivory type and refined dark panels as V01.
```

## V03 · Una localización: encontrar evidencia

Prepend the visual anchor master contract. The JSON and individual prompt files already include it.

```text
REFERENCE ROLE: maintain the established painterly style, colors and interface language from the previous reference. This is a new scene, not a rearranged street.
SCENE: an original quiet room associated with the existing Cherwood investigation, an old orphanage office with a cold fireplace, rain on a tall window, shelves, a worn chair and a small side table. A few burned wooden toy fragments rest near the fireplace, readable but not sensational. No injured children, no gore, no ghost revealing the culprit, no occult artifact explaining the whole mystery. Warm desk lamp and cool window light.
COMPOSITION: approximately 72 percent environment at left and center. Selected toy fragments receive a fine, restrained outline and a small magnified inspection inset. A narrow right-hand reading surface made of ivory paper in a dark frame contains the clue. The investigator may be present only as a small original portrait next to the observation, not a giant cinematic face.
UI EXACT COPY: "INSPECCIÓN"; title "Juguete quemado"; body "La madera conserva marcas recientes."; source line "Chimenea del despacho"; actions "Examinar" and "Guardar observación"; bottom-left "Volver". Ensure these few words are readable and leave generous spacing. The image should show what the player can inspect and record, not imply every decorative object is a clue.
```

## V04 · Investigación: contrastar una hipótesis

Prepend the visual anchor master contract. The JSON and individual prompt files already include it.

```text
REFERENCE ROLE: use the established art and UI family. Build a polished investigation screen, not a generic corkboard stock photo.
SCENE: a physical dark cork and walnut board in the refuge with three large discovered evidence cards: a burned wooden toy, a folded document with no readable embedded handwriting, and a closed ledger. Two carefully routed brass pins and muted red threads connect only relevant cards. Plenty of negative space; no wall packed with eight paragraphs or a revealed answer. Warm angled light on paper texture.
COMPOSITION: board fills the left 68 percent, a readable ivory detail panel fills the right 28 percent. Card titles are typeset cleanly as interface, distinct from the drawn paper. The selected document is brighter, not enormous. Show a compact relationship chooser at the bottom using text plus distinct line samples.
UI EXACT COPY: header "EL ECO EN EL NIDO VACÍO". Card names "Juguete quemado", "Documento alterado", "Registro de pagos". Right panel heading "HIPÓTESIS" and sentence "¿Las fechas describen el mismo traslado?". Buttons "Contrastar" and "Volver al Desván". Relationship labels "Explica", "Contradice", "Relaciona". Do not print the culprit, hidden case truth, future evidence or a fake solved verdict. This is a clear, elegant tool for reasoning that remains part of the illustrated world.
```

## V05 · Bazar: preparar el siguiente riesgo

Prepend the visual anchor master contract. The JSON and individual prompt files already include it.

```text
REFERENCE ROLE: retain the same restrained brass/ivory interface, painterly finish and charcoal/teal atmosphere from the established references.
SCENE: a clandestine Victorian-fantasy apothecary counter under warm lamplight, shelves receding into cool darkness. One original middle-aged merchant, sober dark waistcoat, calm guarded expression; no famous novel character, plague mask or caricature. On the counter, three carefully separated objects: an amber reagent bottle, a small mineral sample, and a wrapped botanical specimen. Grounded shadows, believable glass and velvet. No giant magical treasure chest or neon glowing potions.
COMPOSITION: merchant and counter fill the left two-thirds; a clean selected-product panel fills the right third, integrated with the world but readable. The selected amber bottle has a restrained highlight. A bottom strip offers a few product thumbnails, not a huge spreadsheet.
UI EXACT COPY: top "BAZAR CLANDESTINO". Detail heading "Reactivo preparado". One short sentence "Un frasco sellado para tu próxima preparación.". Interface labels "Precio", "Saldo", "Cantidad" with simple placeholder em dashes rather than invented gameplay values. Buttons "Comprar" and "Volver". Maintain clear hierarchy, generous line spacing and tangible materials. The image expresses comparison and a deliberate transaction, not automatic purchase success.
```

## V06 · Combate: decidir sobre el terreno

Prepend the visual anchor master contract. The JSON and individual prompt files already include it.

```text
REFERENCE ROLE: retain the established visual quality and UI language, but switch to a coherent elevated three-quarter tactical camera.
SCENE: a rain-dark cobblestone alley bounded by Victorian brick, warm gas lamps and restrained cold ground mist. A compact, clearly readable tactical stage dominates approximately 75 percent of the frame. One original adult investigator in charcoal coat and muted oxblood neckcloth stands toward the near-left side with a modest revolver lowered; one original hooded human adversary stands toward the far-right side. Both are full-body painted game actors with grounded feet and matching scale, not tokens or circular portraits. Include two low wooden crates as cover.
GRID: show a subtle 7-column by 5-row parallelogram ground grid aligned to the alley floor; highlight a small set of reachable cells in desaturated teal. The precise production grid will be code-generated, so emphasize coherent spatial alignment and visible feet, not decorative coordinates. No labels like x,y, no giant black grid panel on top of another perspective.
UI EXACT COPY: top-left "ENCUENTRO EN EL CALLEJÓN"; compact status "Tu turno"; bottom actions "Mover", "Atacar", "Observar", "Huir", and a clear "Terminar turno". Right compact panel "Objetivo seleccionado" with "Información incompleta". Do not show invented astral strings, psychic laser waves, enemy hidden statistics or a victory screen. The frame must communicate a deliberate tactical decision in the scene itself.
```

## V07 · Regreso: identidad y actuación

Prepend the visual anchor master contract. The JSON and individual prompt files already include it.

```text
REFERENCE ROLE: maintain the refuge materials, mirror shape, lighting family and UI established earlier. This is an intimate journal inspection, not a different art style.
SCENE: close three-quarter view of the same wooden desk, open leather journal, oval aged-brass mirror, low candle and a sealed civil document. In the mirror, a subtle partial reflection of the same original adult investigator: short dark-brown hair, lean face, ivory shirt, charcoal coat, muted oxblood neckcloth. The reflection is human and weary, without monster eyes or a forced clown face. Rain-muted cool light balances the warm flame.
COMPOSITION: tangible journal and mirror at left and center; a readable cream writing panel integrated over the right 35 percent. The page art itself contains no long baked handwriting. A tiny calendar tab hints at ordinary obligations without a dashboard of numbers. This scene should communicate the emotional cost of maintaining a role.
UI EXACT COPY: heading "DIARIO DE ACTUACIÓN". Small date label "Al regresar". Entry title "Respetar lo que todavía no sabes". Body "La observación cambió tu interpretación del caso.". A small secondary line "Un compromiso civil sigue pendiente.". Buttons "Revisar compromiso" and "Cerrar". No digestibility percentage or automatic reward declaration. Keep the restrained paper-and-brass layout and unusually good reading contrast.
```

## V08 · Ascensión: una decisión consciente

Prepend the visual anchor master contract. The JSON and individual prompt files already include it.

```text
REFERENCE ROLE: maintain the established room materials and painterly realism, with the same original investigator only as a restrained partial reflection if needed.
SCENE: a prepared quiet attic alcove with a modest pewter chalice on a dark table, a folded formula sheet with no readable invented symbols, two sealed ingredient containers and a small mirror. Focus on believable pewter, slightly iridescent liquid, candlelight and the pressure of a personal decision. The camera is intimate, three-quarter, not a throne-room epic. No deities, giant magic circles, tentacles, wings, sacred emblems, higher-sequence powers, or cosmic explosion. This is preparation for a low-sequence Beyonder ascension.
COMPOSITION: chalice and tangible preparation occupy the left two-thirds; a crisp dark/ivory readiness panel occupies the right third. Three small requirement rows feel like a considered checklist, not invented universal religious gates. Leave visible negative space around the cup for later animation layers.
UI EXACT COPY: "EL SIGUIENTE UMBRAL"; subtitle "Preparación de la ascensión". Rows "Fórmula", "Ingredientes", "Digestión". Prompt "La decisión aún es tuya.". Primary button "Confirmar preparación" and secondary "Todavía no". Do not claim success before consumption or show a fake new sequence. Preserve the quiet, expensive-looking material fidelity and typography of the earlier frames.
```

## Runtime asset master contract

```text
Create a production-oriented art source for the existing Path to Godhood illustrated Victorian occult investigation RPG. Use the supplied approved V01-V08 reference for style only and the designated scene for exact camera/light alignment. Painterly realism, crisp silhouette, aged brass/pewter, dark wood, ivory paper, restrained teal atmosphere and muted oxblood accents. No pixel art, anime, modern UI, random sacred symbols, famous canon characters, excessive filigree or exaggerated magical glow. Do not bake functional text, buttons, labels, grids, clue conclusions, or inventory values into the artwork. Preserve subject identity and exact framing across variants. Output one requested asset, not a collage or an animation contact sheet. If transparency is requested, use genuine alpha, never a painted checkerboard; if the selected tool cannot provide it, return a clean separable source and flag it for manual masking rather than claiming it is transparent. A human will validate scale, lighting, alpha, pivots, and canon before runtime export.
```

### BG01 · Clean Desvan room and desk plate

Prepend the runtime asset master contract.

```text
ASSET ID: BG01.
REFERENCE: V01.
SUBJECT: Clean Desvan room and desk plate.
SPECIFICATION: Match V01 architecture and camera exactly. Remove all movable desk objects, their cast shadows and baked glow, while retaining structural wood, stairs, window and empty alcove. Restore continuous wood grain. The desk is included in this plate for the first version; do not also place a duplicate desk sprite. A separate desk variant is optional only if this plate is correspondingly empty.
TARGET SOURCE CANVAS: 3840x2160; preserve aspect ratio if exact dimensions are unavailable.
BACKGROUND: opaque complete clean plate; no UI, no borders, no watermark.
DELIVERY: one source image; record actual dimensions and generation settings. Do not invent a completed export or technical approval.
```

### BG02 · Cherwood street clean plate

Prepend the runtime asset master contract.

```text
ASSET ID: BG02.
REFERENCE: V02.
SUBJECT: Cherwood street clean plate.
SPECIFICATION: Match V02 street framing, warm lamps and cool rain. Keep three readable door destinations and free right-side negative space. No route markers, words, carriage UI or recognizable real London monument. Static distant pedestrians may remain if not animated.
TARGET SOURCE CANVAS: 3840x2160; preserve aspect ratio if exact dimensions are unavailable.
BACKGROUND: opaque complete clean plate; no UI, no borders, no watermark.
DELIVERY: one source image; record actual dimensions and generation settings. Do not invent a completed export or technical approval.
```

### BG03 · Case office clean plate

Prepend the runtime asset master contract.

```text
ASSET ID: BG03.
REFERENCE: V03.
SUBJECT: Case office clean plate.
SPECIFICATION: Match V03 orphanage office. Empty fireplace foreground and side table for independently placed evidence. No harmed children, reveal of the culprit, labels or spectral answer. Keep the right reading region low-contrast.
TARGET SOURCE CANVAS: 3840x2160; preserve aspect ratio if exact dimensions are unavailable.
BACKGROUND: opaque complete clean plate; no UI, no borders, no watermark.
DELIVERY: one source image; record actual dimensions and generation settings. Do not invent a completed export or technical approval.
```

### BG04 · Empty walnut and cork board

Prepend the runtime asset master contract.

```text
ASSET ID: BG04.
REFERENCE: V04.
SUBJECT: Empty walnut and cork board.
SPECIFICATION: Match V04 front-facing board framing. No pins, threads, cards, text or solved clues. Moderate cork detail that will not compete with cards. Leave stable clean margins.
TARGET SOURCE CANVAS: 2560x1440; preserve aspect ratio if exact dimensions are unavailable.
BACKGROUND: opaque complete clean plate; no UI, no borders, no watermark.
DELIVERY: one source image; record actual dimensions and generation settings. Do not invent a completed export or technical approval.
```

### BG05 · Clandestine apothecary clean plate

Prepend the runtime asset master contract.

```text
ASSET ID: BG05.
REFERENCE: V05.
SUBJECT: Clandestine apothecary clean plate.
SPECIFICATION: Match V05 counter and shelf perspective. Remove merchant and all selectable counter products and their shadows. Keep muted bottles on distant shelves purely decorative. No prices or labels.
TARGET SOURCE CANVAS: 3840x2160; preserve aspect ratio if exact dimensions are unavailable.
BACKGROUND: opaque complete clean plate; no UI, no borders, no watermark.
DELIVERY: one source image; record actual dimensions and generation settings. Do not invent a completed export or technical approval.
```

### BG06 · Tactical alley floor clean plate

Prepend the runtime asset master contract.

```text
ASSET ID: BG06.
REFERENCE: V06.
SUBJECT: Tactical alley floor clean plate.
SPECIFICATION: Match V06 elevated three-quarter affine stage. Clear uninterrupted ground for a code-rendered 7x5 grid. No characters, grid lines, coordinate labels, fog painted over the playable ground or movable crates. Keep perimeter architecture and lamps.
TARGET SOURCE CANVAS: 3840x2160; preserve aspect ratio if exact dimensions are unavailable.
BACKGROUND: opaque complete clean plate; no UI, no borders, no watermark.
DELIVERY: one source image; record actual dimensions and generation settings. Do not invent a completed export or technical approval.
```

### BG07 · Prepared alcove clean plate

Prepend the runtime asset master contract.

```text
ASSET ID: BG07.
REFERENCE: V08.
SUBJECT: Prepared alcove clean plate.
SPECIFICATION: Match V08 intimate camera. Empty supporting table and alcove. Remove cup, paper, bottles, their shadows and magic glow. Keep believable candlelight from outside the object area; no ritual glyph circle.
TARGET SOURCE CANVAS: 3840x2160; preserve aspect ratio if exact dimensions are unavailable.
BACKGROUND: opaque complete clean plate; no UI, no borders, no watermark.
DELIVERY: one source image; record actual dimensions and generation settings. Do not invent a completed export or technical approval.
```

### OBJ01 · Modest brass candle holder

Prepend the runtime asset master contract.

```text
ASSET ID: OBJ01.
REFERENCE: V01.
SUBJECT: Modest brass candle holder.
SPECIFICATION: Same geometry and desk perspective as V01; tallow candle with unlit wick, warm left key and cool right fill; no flame or halo.
TARGET SOURCE CANVAS: 1024x1536; preserve aspect ratio if exact dimensions are unavailable.
BACKGROUND: transparent alpha; object only; exclude cast/contact shadow so it can be authored as a separate layer.
DELIVERY: one source image; record actual dimensions and generation settings. Do not invent a completed export or technical approval.
```

### OBJ02 · Oval aged-brass mercury mirror

Prepend the runtime asset master contract.

```text
ASSET ID: OBJ02.
REFERENCE: V01.
SUBJECT: Oval aged-brass mercury mirror.
SPECIFICATION: Same frame as V01, stable upright support and translucent-looking but opaque reflective glass; empty neutral reflection, no invented face.
TARGET SOURCE CANVAS: 1024x1536; preserve aspect ratio if exact dimensions are unavailable.
BACKGROUND: transparent alpha; object only; exclude cast/contact shadow so it can be authored as a separate layer.
DELIVERY: one source image; record actual dimensions and generation settings. Do not invent a completed export or technical approval.
```

### OBJ03 · Closed acting journal

Prepend the runtime asset master contract.

```text
ASSET ID: OBJ03.
REFERENCE: V01.
SUBJECT: Closed acting journal.
SPECIFICATION: Deep brown leather, restrained embossed border, no words; match the V01 tabletop plane and right-edge thickness.
TARGET SOURCE CANVAS: 1024x1024; preserve aspect ratio if exact dimensions are unavailable.
BACKGROUND: transparent alpha; object only; exclude cast/contact shadow so it can be authored as a separate layer.
DELIVERY: one source image; record actual dimensions and generation settings. Do not invent a completed export or technical approval.
```

### OBJ04 · Open acting journal

Prepend the runtime asset master contract.

```text
ASSET ID: OBJ04.
REFERENCE: V07.
SUBJECT: Open acting journal.
SPECIFICATION: Same binding as OBJ03, two mostly blank ivory pages, convincing hinge and page thickness; match V07 camera; do not paint paragraphs.
TARGET SOURCE CANVAS: 1536x1024; preserve aspect ratio if exact dimensions are unavailable.
BACKGROUND: transparent alpha; object only; exclude cast/contact shadow so it can be authored as a separate layer.
DELIVERY: one source image; record actual dimensions and generation settings. Do not invent a completed export or technical approval.
```

### OBJ05 · Civil identity papers

Prepend the runtime asset master contract.

```text
ASSET ID: OBJ05.
REFERENCE: V01.
SUBJECT: Civil identity papers.
SPECIFICATION: Two slightly offset cream sheets with neutral embossed seal area, blank readable center, no false official symbol or text.
TARGET SOURCE CANVAS: 1024x1024; preserve aspect ratio if exact dimensions are unavailable.
BACKGROUND: transparent alpha; object only; exclude cast/contact shadow so it can be authored as a separate layer.
DELIVERY: one source image; record actual dimensions and generation settings. Do not invent a completed export or technical approval.
```

### OBJ06 · Leather coin pouch

Prepend the runtime asset master contract.

```text
ASSET ID: OBJ06.
REFERENCE: V01.
SUBJECT: Leather coin pouch.
SPECIFICATION: Small dark brown soft leather pouch, credible folds and brass drawstring ends; no coins floating outside.
TARGET SOURCE CANVAS: 1024x1024; preserve aspect ratio if exact dimensions are unavailable.
BACKGROUND: transparent alpha; object only; exclude cast/contact shadow so it can be authored as a separate layer.
DELIVERY: one source image; record actual dimensions and generation settings. Do not invent a completed export or technical approval.
```

### OBJ07 · Brass pocket watch

Prepend the runtime asset master contract.

```text
ASSET ID: OBJ07.
REFERENCE: V01.
SUBJECT: Brass pocket watch.
SPECIFICATION: Small physically plausible open-faced pocket watch on the tabletop plane. Use simple dial marks rather than garbled numerals; hands may be replaced in code.
TARGET SOURCE CANVAS: 1024x1024; preserve aspect ratio if exact dimensions are unavailable.
BACKGROUND: transparent alpha; object only; exclude cast/contact shadow so it can be authored as a separate layer.
DELIVERY: one source image; record actual dimensions and generation settings. Do not invent a completed export or technical approval.
```

### OBJ08 · Sealed original letter

Prepend the runtime asset master contract.

```text
ASSET ID: OBJ08.
REFERENCE: V01.
SUBJECT: Sealed original letter.
SPECIFICATION: Cream envelope and muted oxblood wax seal, no crest or readable handwriting; preserve folds and tabletop perspective from V01.
TARGET SOURCE CANVAS: 1024x1024; preserve aspect ratio if exact dimensions are unavailable.
BACKGROUND: transparent alpha; object only; exclude cast/contact shadow so it can be authored as a separate layer.
DELIVERY: one source image; record actual dimensions and generation settings. Do not invent a completed export or technical approval.
```

### OBJ09 · Opened original letter

Prepend the runtime asset master contract.

```text
ASSET ID: OBJ09.
REFERENCE: V01.
SUBJECT: Opened original letter.
SPECIFICATION: Same paper and envelope as OBJ08, opened with a folded blank inner sheet; no text, same support plane.
TARGET SOURCE CANVAS: 1024x1024; preserve aspect ratio if exact dimensions are unavailable.
BACKGROUND: transparent alpha; object only; exclude cast/contact shadow so it can be authored as a separate layer.
DELIVERY: one source image; record actual dimensions and generation settings. Do not invent a completed export or technical approval.
```

### OBJ10 · Pewter chalice body

Prepend the runtime asset master contract.

```text
ASSET ID: OBJ10.
REFERENCE: V08.
SUBJECT: Pewter chalice body.
SPECIFICATION: Modest cup matching V08, sober stem and worn rim, empty interior, no halo, no giant jeweled sacred vessel. Liquid will be a separate masked layer.
TARGET SOURCE CANVAS: 1024x1536; preserve aspect ratio if exact dimensions are unavailable.
BACKGROUND: transparent alpha; object only; exclude cast/contact shadow so it can be authored as a separate layer.
DELIVERY: one source image; record actual dimensions and generation settings. Do not invent a completed export or technical approval.
```

### OBJ11 · Amber reagent bottle

Prepend the runtime asset master contract.

```text
ASSET ID: OBJ11.
REFERENCE: V05.
SUBJECT: Amber reagent bottle.
SPECIFICATION: Small sealed amber glass bottle, neutral blank label, no claimed therapeutic effect; match V05 counter lighting and camera.
TARGET SOURCE CANVAS: 1024x1024; preserve aspect ratio if exact dimensions are unavailable.
BACKGROUND: transparent alpha; object only; exclude cast/contact shadow so it can be authored as a separate layer.
DELIVERY: one source image; record actual dimensions and generation settings. Do not invent a completed export or technical approval.
```

### OBJ12 · Wrapped botanical sample

Prepend the runtime asset master contract.

```text
ASSET ID: OBJ12.
REFERENCE: V05.
SUBJECT: Wrapped botanical sample.
SPECIFICATION: A restrained thorned botanical stem in folded ivory cloth, based only on the approved gameplay item description supplied at production; do not invent faces, symbols or new powers.
TARGET SOURCE CANVAS: 1024x1024; preserve aspect ratio if exact dimensions are unavailable.
BACKGROUND: transparent alpha; object only; exclude cast/contact shadow so it can be authored as a separate layer.
DELIVERY: one source image; record actual dimensions and generation settings. Do not invent a completed export or technical approval.
```

### OBJ13 · Mineral ingredient sample

Prepend the runtime asset master contract.

```text
ASSET ID: OBJ13.
REFERENCE: V05.
SUBJECT: Mineral ingredient sample.
SPECIFICATION: Small pale mineral sample in a shallow dark tray, natural restrained sheen, approved item shape at production, no neon magic crystal cluster.
TARGET SOURCE CANVAS: 1024x1024; preserve aspect ratio if exact dimensions are unavailable.
BACKGROUND: transparent alpha; object only; exclude cast/contact shadow so it can be authored as a separate layer.
DELIVERY: one source image; record actual dimensions and generation settings. Do not invent a completed export or technical approval.
```

### OBJ14 · Low wooden cover crate

Prepend the runtime asset master contract.

```text
ASSET ID: OBJ14.
REFERENCE: V06.
SUBJECT: Low wooden cover crate.
SPECIFICATION: Aged crate with clean silhouette seen at the same elevated three-quarter angle as V06; top and two sides visible; no floor or grid.
TARGET SOURCE CANVAS: 1024x1024; preserve aspect ratio if exact dimensions are unavailable.
BACKGROUND: transparent alpha; object only; exclude cast/contact shadow so it can be authored as a separate layer.
DELIVERY: one source image; record actual dimensions and generation settings. Do not invent a completed export or technical approval.
```

### ST01 · Mirror clear variant

Prepend the runtime asset master contract.

```text
ASSET ID: ST01.
REFERENCE: OBJ02 + V01.
SUBJECT: Mirror clear variant.
SPECIFICATION: Neutral intact mercury surface, soft cool reflection, no glow. Use the approved OBJ02 as the edit target. Change only glass appearance; preserve frame, size, support, light and alpha exactly.
TARGET SOURCE CANVAS: 1024x1536; preserve aspect ratio if exact dimensions are unavailable.
BACKGROUND: transparent alpha; object only; exclude cast/contact shadow so it can be authored as a separate layer.
DELIVERY: one source image; record actual dimensions and generation settings. Do not invent a completed export or technical approval.
```

### ST02 · Mirror clouded variant

Prepend the runtime asset master contract.

```text
ASSET ID: ST02.
REFERENCE: OBJ02 + V01.
SUBJECT: Mirror clouded variant.
SPECIFICATION: Subtle localized condensation and a faint loss of clarity in the glass only. Use the approved OBJ02 as the edit target. Change only glass appearance; preserve frame, size, support, light and alpha exactly.
TARGET SOURCE CANVAS: 1024x1536; preserve aspect ratio if exact dimensions are unavailable.
BACKGROUND: transparent alpha; object only; exclude cast/contact shadow so it can be authored as a separate layer.
DELIVERY: one source image; record actual dimensions and generation settings. Do not invent a completed export or technical approval.
```

### ST03 · Mirror disturbed variant

Prepend the runtime asset master contract.

```text
ASSET ID: ST03.
REFERENCE: OBJ02 + V01.
SUBJECT: Mirror disturbed variant.
SPECIFICATION: A narrowly approved distressed reflection treatment in the glass; no demon face and no reshaped frame. Use the approved OBJ02 as the edit target. Change only glass appearance; preserve frame, size, support, light and alpha exactly.
TARGET SOURCE CANVAS: 1024x1536; preserve aspect ratio if exact dimensions are unavailable.
BACKGROUND: transparent alpha; object only; exclude cast/contact shadow so it can be authored as a separate layer.
DELIVERY: one source image; record actual dimensions and generation settings. Do not invent a completed export or technical approval.
```

### NPC01 · Original investigator portrait

Prepend the runtime asset master contract.

```text
ASSET ID: NPC01.
REFERENCE: V07.
SUBJECT: Original investigator portrait.
SPECIFICATION: Original adult man around thirty, short dark-brown hair, lean face, charcoal coat, ivory shirt, muted oxblood neckcloth. Quiet attentive expression, three-quarter bust; no resemblance to a named LOTM protagonist.
TARGET SOURCE CANVAS: 1024x1536; preserve aspect ratio if exact dimensions are unavailable.
BACKGROUND: transparent alpha; object only; exclude cast/contact shadow so it can be authored as a separate layer.
DELIVERY: one source image; record actual dimensions and generation settings. Do not invent a completed export or technical approval.
```

### NPC02 · Original merchant portrait

Prepend the runtime asset master contract.

```text
ASSET ID: NPC02.
REFERENCE: V05.
SUBJECT: Original merchant portrait.
SPECIFICATION: Middle-aged original merchant in a sober dark waistcoat, guarded but human expression, same individual as V05; no mask, monocle, caricature or named canon identity.
TARGET SOURCE CANVAS: 1024x1536; preserve aspect ratio if exact dimensions are unavailable.
BACKGROUND: transparent alpha; object only; exclude cast/contact shadow so it can be authored as a separate layer.
DELIVERY: one source image; record actual dimensions and generation settings. Do not invent a completed export or technical approval.
```

### NPC03 · Original witness portrait

Prepend the runtime asset master contract.

```text
ASSET ID: NPC03.
REFERENCE: V03.
SUBJECT: Original witness portrait.
SPECIFICATION: Original adult female clerk with chestnut hair in a practical bun, dark wool dress and cream collar, worried but composed, no bruises or fantasy ornament. The narrative team will assign the approved NPC identity.
TARGET SOURCE CANVAS: 1024x1536; preserve aspect ratio if exact dimensions are unavailable.
BACKGROUND: transparent alpha; object only; exclude cast/contact shadow so it can be authored as a separate layer.
DELIVERY: one source image; record actual dimensions and generation settings. Do not invent a completed export or technical approval.
```

### ACT01 · Investigator tactical actor

Prepend the runtime asset master contract.

```text
ASSET ID: ACT01.
REFERENCE: V06 + NPC01.
SUBJECT: Investigator tactical actor.
SPECIFICATION: Same person and clothes as NPC01; full body, feet fully visible, elevated three-quarter camera matching V06, restrained ready pose with ordinary revolver lowered, no muzzle flash or magic.
TARGET SOURCE CANVAS: 1024x1536; preserve aspect ratio if exact dimensions are unavailable.
BACKGROUND: transparent alpha; object only; exclude cast/contact shadow so it can be authored as a separate layer.
DELIVERY: one source image; record actual dimensions and generation settings. Do not invent a completed export or technical approval.
```

### ACT02 · Original hooded human opponent

Prepend the runtime asset master contract.

```text
ASSET ID: ACT02.
REFERENCE: V06.
SUBJECT: Original hooded human opponent.
SPECIFICATION: Adult human in a weathered charcoal cloak, readable silhouette, elevated three-quarter view matching ACT01, full body and visible feet, concealed face without supernatural anatomy.
TARGET SOURCE CANVAS: 1024x1536; preserve aspect ratio if exact dimensions are unavailable.
BACKGROUND: transparent alpha; object only; exclude cast/contact shadow so it can be authored as a separate layer.
DELIVERY: one source image; record actual dimensions and generation settings. Do not invent a completed export or technical approval.
```

### EV01 · CLUE_BURNED_TOYS evidence thumbnail

Prepend the runtime asset master contract.

```text
ASSET ID: EV01.
REFERENCE: V04.
SUBJECT: CLUE_BURNED_TOYS evidence thumbnail.
SPECIFICATION: A few burned wooden toy fragments, recognizable carving and charred edges; no readable names. Close, simple composition readable at 256 pixels. Match V04 materials. Discovery and interpretation text will be rendered by the game.
TARGET SOURCE CANVAS: 768x768; preserve aspect ratio if exact dimensions are unavailable.
BACKGROUND: transparent alpha; object only; exclude cast/contact shadow so it can be authored as a separate layer.
DELIVERY: one source image; record actual dimensions and generation settings. Do not invent a completed export or technical approval.
```

### EV02 · CLUE_WILL_DRAFT evidence thumbnail

Prepend the runtime asset master contract.

```text
ASSET ID: EV02.
REFERENCE: V04.
SUBJECT: CLUE_WILL_DRAFT evidence thumbnail.
SPECIFICATION: A folded cream draft document, neutral old ink strokes only, no legible case answer or fake official seal. Close, simple composition readable at 256 pixels. Match V04 materials. Discovery and interpretation text will be rendered by the game.
TARGET SOURCE CANVAS: 768x768; preserve aspect ratio if exact dimensions are unavailable.
BACKGROUND: transparent alpha; object only; exclude cast/contact shadow so it can be authored as a separate layer.
DELIVERY: one source image; record actual dimensions and generation settings. Do not invent a completed export or technical approval.
```

### EV03 · CLUE_MIND_TRACES evidence thumbnail

Prepend the runtime asset master contract.

```text
ASSET ID: EV03.
REFERENCE: V04.
SUBJECT: CLUE_MIND_TRACES evidence thumbnail.
SPECIFICATION: A neutral notebook with observational marks and a simple human-profile sketch; no X-ray brain, psychic rays or diagnosis. Close, simple composition readable at 256 pixels. Match V04 materials. Discovery and interpretation text will be rendered by the game.
TARGET SOURCE CANVAS: 768x768; preserve aspect ratio if exact dimensions are unavailable.
BACKGROUND: transparent alpha; object only; exclude cast/contact shadow so it can be authored as a separate layer.
DELIVERY: one source image; record actual dimensions and generation settings. Do not invent a completed export or technical approval.
```

### EV04 · CLUE_ASTROLOGY_RECORD evidence thumbnail

Prepend the runtime asset master contract.

```text
ASSET ID: EV04.
REFERENCE: V04.
SUBJECT: CLUE_ASTROLOGY_RECORD evidence thumbnail.
SPECIFICATION: An old astronomical observation page with restrained neutral star dots, no invented sacred alphabet or clues written as text. Close, simple composition readable at 256 pixels. Match V04 materials. Discovery and interpretation text will be rendered by the game.
TARGET SOURCE CANVAS: 768x768; preserve aspect ratio if exact dimensions are unavailable.
BACKGROUND: transparent alpha; object only; exclude cast/contact shadow so it can be authored as a separate layer.
DELIVERY: one source image; record actual dimensions and generation settings. Do not invent a completed export or technical approval.
```

### EV05 · CLUE_CONCEALED_SAFE evidence thumbnail

Prepend the runtime asset master contract.

```text
ASSET ID: EV05.
REFERENCE: V04.
SUBJECT: CLUE_CONCEALED_SAFE evidence thumbnail.
SPECIFICATION: A closed dark clinical ledger next to an ordinary small iron safe edge; no readable contents. Close, simple composition readable at 256 pixels. Match V04 materials. Discovery and interpretation text will be rendered by the game.
TARGET SOURCE CANVAS: 768x768; preserve aspect ratio if exact dimensions are unavailable.
BACKGROUND: transparent alpha; object only; exclude cast/contact shadow so it can be authored as a separate layer.
DELIVERY: one source image; record actual dimensions and generation settings. Do not invent a completed export or technical approval.
```

### EV06 · CLUE_FINANCIAL_BLACKMAIL evidence thumbnail

Prepend the runtime asset master contract.

```text
ASSET ID: EV06.
REFERENCE: V04.
SUBJECT: CLUE_FINANCIAL_BLACKMAIL evidence thumbnail.
SPECIFICATION: A restrained ledger, several receipts and one wax-sealed strip; no amounts, names or hidden conclusion. Close, simple composition readable at 256 pixels. Match V04 materials. Discovery and interpretation text will be rendered by the game.
TARGET SOURCE CANVAS: 768x768; preserve aspect ratio if exact dimensions are unavailable.
BACKGROUND: transparent alpha; object only; exclude cast/contact shadow so it can be authored as a separate layer.
DELIVERY: one source image; record actual dimensions and generation settings. Do not invent a completed export or technical approval.
```

### EV07 · CLUE_FORGED_LETTERS evidence thumbnail

Prepend the runtime asset master contract.

```text
ASSET ID: EV07.
REFERENCE: V04.
SUBJECT: CLUE_FORGED_LETTERS evidence thumbnail.
SPECIFICATION: Two overlapping cream parish-style documents with visually different paper/ink but no invented institutional emblems or legible text. Close, simple composition readable at 256 pixels. Match V04 materials. Discovery and interpretation text will be rendered by the game.
TARGET SOURCE CANVAS: 768x768; preserve aspect ratio if exact dimensions are unavailable.
BACKGROUND: transparent alpha; object only; exclude cast/contact shadow so it can be authored as a separate layer.
DELIVERY: one source image; record actual dimensions and generation settings. Do not invent a completed export or technical approval.
```

### EV08 · CLUE_BLOODLINE_TALISMAN evidence thumbnail

Prepend the runtime asset master contract.

```text
ASSET ID: EV08.
REFERENCE: V04.
SUBJECT: CLUE_BLOODLINE_TALISMAN evidence thumbnail.
SPECIFICATION: A small oxidized silver reflective object, neutral obscure detail. Use the approved case description at production; do not invent a divine insignia, depict its hidden mechanism or label it as novel canon. Close, simple composition readable at 256 pixels. Match V04 materials. Discovery and interpretation text will be rendered by the game.
TARGET SOURCE CANVAS: 768x768; preserve aspect ratio if exact dimensions are unavailable.
BACKGROUND: transparent alpha; object only; exclude cast/contact shadow so it can be authored as a separate layer.
DELIVERY: one source image; record actual dimensions and generation settings. Do not invent a completed export or technical approval.
```

## Herramientas verificadas y conexión

La documentación oficial consultada el 24/09/2026 identifica Nano Banana Pro con Gemini 3 Pro Image. Las páginas actuales y antiguas pueden mostrar nombres de modelo diferentes; comprueba el identificador disponible en tu cuenta antes de automatizar. La generación de las anclas de esta entrega utiliza la herramienta de imagen de esta sesión, no una conexión declarada a Google.

- Google, generación de imagen: https://ai.google.dev/gemini-api/docs/image-generation
- Google, ficha del modelo: https://ai.google.dev/gemini-api/docs/models/gemini-3-pro-image
- TexturePacker, CLI: https://www.codeandweb.com/texturepacker/documentation/commandline
- TexturePacker, trim y metadata: https://www.codeandweb.com/texturepacker/documentation/texture-settings
- Krita, PNG y transparencia: https://docs.krita.org/en/general_concepts/file_formats/file_png.html

Flujo API/MCP recomendado: proveedor disponible → modelo y capacidades verificados → credenciales en entorno local → un ensayo con referencia → exportación → revisión → manifest → Phaser. No se necesita un MCP para dibujar en Krita ni para entregar archivos manualmente. La publicación y los costes de servicios se deciden sobre herramientas realmente disponibles.
