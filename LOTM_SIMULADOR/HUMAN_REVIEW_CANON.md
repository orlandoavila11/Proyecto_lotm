# Revisión de canon pendiente de firma

La historia es lo único canónico del proyecto. Este registro recoge **cada cambio de texto de historia** hecho
por agentes, para que el dueño lo acepte o lo corrija. Un cambio sin firma se considera provisional.

Formato: qué había, qué hay ahora, por qué, y dónde. Firma: añade `Aceptado — <fecha>` o la corrección.

## 29 sep 2026 · aplicación de la auditoría general (§3.2)

| # | Antes | Ahora | Motivo | Dónde |
|---|---|---|---|---|
| C1 | "Inspector Lestrade" | **"Inspector Jonas Kettle"** (nombre inventado) | Lestrade es un personaje de Sherlock Holmes: cruce con otra ficción. El ancla necesita un nombre propio; el elegido es neutro y **provisional**. | `reborn/data/gameplay/origins/origins.json` (Detective Privado) y migración `011` para partidas existentes |
| C2 | "Scotland Yard" (×7) | "la Policía Metropolitana de Backlund", "la comisaría de Cherwood", "la policía" | Institución del mundo real. | `origins.json`, `CalendarEngine.ts`, `ActingDilemmaEngine.ts` (2), `ProceduralInvestigationService.ts` |
| C3 | Veredicto `SCOTLAND_YARD` | `POLICE` | Igual que C2 (identificador interno). | `ProceduralInvestigationService.ts` y sus tests |
| C4 | "libras esterlinas" (×2) | "libras" | La moneda de Loen son libras, soli y peniques; "esterlina" es del mundo real. | `case_cherwood_heirloom.json`, `case_cherwood_heirloom.narrative.md` |
| C5 | "Niebla del Támesis" | "niebla del Tussock" | El río de Backlund es el Tussock. | ahora en `reborn/data/gameplay/city/districts.json` |
| C6 | Distrito "Bayam" alcanzable en carruaje | Retirado; se añade **Distrito Norte** | Bayam es una ciudad del archipiélago de Rorsted, al otro lado del mar. El Distrito Norte ya tenía mercado (ingredientes del Espectador) pero no se podía llegar. | `DatabaseClient.ts`, migración `011`, `city/districts.json` |
| C7 | "TRANSFORMACIÓN ASTRICA" | "TRANSFORMACIÓN ASTRAL" | Errata. | `AscensionEngine.ts` |
| C8 | Ancla "Trait Permanente: Los Susurros del Nido (-15% Sanity Cap)" | "Los Susurros del Nido" | Texto mecánico en inglés dentro de un nombre de la historia. | `InvestigationEngine.ts` (resolución D) |
| C9 | Descripciones de distritos en código | Mismas ideas, reescritas en `city/districts.json` | Pasan a datos; se corrigen C5 y "Halcones Nocturnos de la Noche" (redundante) → "miradas que lo registran todo". | `city/districts.json` |

## Pendiente de revisión humana (no cambiado)

- Alias y dominios de los dioses en `reborn/data/gameplay/world_state.json` (revisar con la novela delante).
- El origen "Detective Privado" en Cherwood con pelo oscuro y corbata carmesí (`ui3d/ASSET_PROMPTS.md` §2.2) evoca a
  Sherlock Moriarty, identidad de Klein en ese distrito. No viola R2, pero conviene decidir si es un guiño buscado.
- "Catedral de San Samuel" como hito del Distrito de la Reina: confirmar ubicación en la novela.

## Cómo se protege a partir de ahora

`npm --prefix reborn run lint:canon` (también dentro de `lint:tier-g`) falla si reaparece un anacronismo o un término
de *Circle of Inevitability* fuera de las semillas. Las listas están en `reborn/data/canon/canon_lists.json`.
