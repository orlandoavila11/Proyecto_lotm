# PAQUETE DE REVISIÓN CANÓNICA Y AUDITORÍA DE COMPLETITUD DEL DIRECTOR (BRIEF-02.3-BIS)

> **Autoridad:** El Director Humano.  
> **Era Oficial Ratificada:** **POST-LOTM · PRE-COI** (~1353 Quinta Época, ~1 año post-Guerra de los Dioses).  
> **Propósito:** Formalización de la biblia canónica de era, auditoría de completitud de fuerzas y familias, clasificación de seres míticos, catálogo de Dioses Exteriores y veredictos propuestos para las 3 familias pendientes de ratificación (§3.8).

---

## 0. ESTADO DE RESOLUCIONES PREVIAS (DECRETOS DEL DIRECTOR)

1. **Redefinición de Era Oficial:** Toda mención a la *"era pre-novela / ~1339"* ha quedado OBSOLETA. La ambientación oficial es **POST-LOTM · PRE-COI (~1353)**. Reglas canónicas R1, R2, R3 y R4 integradas en `AGENTS.md` y formalizadas en `reborn/data/gameplay/world_state.json`.
2. **Roselle Gustav (`GOD_ROSELLE_BLACK_EMPEROR`):** Actualizado formalmente a `status: "SEALED_MAUSOLEUM"`, `powerTier: "mythic"`, `interactionModes: ["narrative", "lore", "telar_root"]` y nota canónica: `"HISTORICAL_EMPEROR_CORRUPTED · vía del Emperador Negro sin características · influye solo por telar_root"`.
3. **Precursores de Danzantes (`ORG_DANCERS_PRECURSOR`):** Renombrado desde `ORG_COI_DANCERS`, categorizado en `powerTier: "telar"` con nota canónica: `"semilla pre-CoI (R3); manifestación plena fuera de era"`, permaneciendo en `key_of_light` (`eraVerified: true`).
4. **Sol Eterno Llameante (`GOD_ETERNAL_BLAZING_SUN`):** Añadido a `chaos_sea` (`powerTier: "mythic"`, `canonRef: "reborn/data/content/world/gods.json"`), elevando los seres míticos a exactamente **20**.
5. **Iglesia del Combate (`CHURCH_COMBAT`):** Excluida formalmente de las fuerzas activas en `convergence_forces.json`. Su absorción total por la Iglesia de la Noche tras la caída de Badheil quedó documentada en `world_state.json`.
6. **Balance Numérico:** Las fuerzas de convergencia se mantienen en exactamente **84** (81 verificadas en era, 3 en cola `HUMAN_REVIEW`).

---

## 1. LOS 20 SERES MÍTICOS (CLASIFICACIÓN REFINADA NOVELA / BIBLIOTECA)

Excluidos formalmente de la generación de encuentros ordinarios (`powerTier: "mythic"`, interacción restringida a `['narrative', 'lore', 'telar_root']`).

| # | ID / Nombre | Séfira (Grupo) | Tipo | Referencia Tier L | Clasificación de Procedencia |
|---|---|---|---|---|---|
| 1 | `KOA_AMON` (Amon, El Blasfemo) | `sefirah_castle` (`LOTM`) | `entity` | `reborn/data/content/world/kings_of_angels.json` | *novel-native* (Rey de los Ángeles del Error; exiliado en el cosmos) |
| 2 | `KOA_BETHEL_ABRAHAM` (Mr. Door) | `sefirah_castle` (`LOTM`) | `entity` | `reborn/data/content/world/kings_of_angels.json` | *novel-native* (Rey de los Ángeles de la Puerta; mártir caído/sacrificado) |
| 3 | `KOA_ANTIGONUS` (El Medio-Loco) | `sefirah_castle` (`LOTM`) | `entity` | `reborn/data/content/world/kings_of_angels.json` | *novel-native* (Medio-Loco de la Cuarta Época; dormido bajo velo de Evernight) |
| 4 | `ENTITY_LORD_OF_MYSTERIES` (Mito LOTM) | `sefirah_castle` (`LOTM`) | `entity` | `legend` | *novel-native* (Voluntad primordial disputando el letargo de Klein en Sefirah) |
| 5 | `KOA_SASRIR` (Mano Derecha de Dios) | `chaos_sea` (`GOD_ALMIGHTY`) | `entity` | `reborn/data/content/world/kings_of_angels.json` | *novel-native* (Ángel Oscuro; remanente mítico de la Corte del Rey Gigante) |
| 6 | `GOD_ADAM_TRUE_CREATOR` (Adam / Creador) | `chaos_sea` (`GOD_ALMIGHTY`) | `entity` | `reborn/data/content/world/gods.json` | *novel-native* (Semi-pilar unificado en el Mar del Caos) |
| 7 | `GOD_LORD_STORMS` (Leodero) | `chaos_sea` (`GOD_ALMIGHTY`) | `entity` | `reborn/data/content/world/gods.json` | *novel-native* (Deidad Ortodoxa S0 del Marinero) |
| 8 | `GOD_ETERNAL_BLAZING_SUN` (Aucuses) | `chaos_sea` (`GOD_ALMIGHTY`) | `entity` | `reborn/data/content/world/gods.json` | *novel-native* (Deidad Ortodoxa S0 del Sol) |
| 9 | `GOD_EVERNIGHT` (Amanises) | `river_of_eternal_darkness` (`DEATH_CLUSTER`) | `entity` | `reborn/data/content/world/gods.json` | *novel-native* (Deidad Triunfante S0 de la Noche, Muerte y Crepúsculo) |
| 10 | `ANGEL_AZIK_EGGER` (Cónsul de la Muerte) | `river_of_eternal_darkness` (`DEATH_CLUSTER`) | `entity` | `reborn/data/content/world/angels.json` | *novel-native* (Secuencia 1 de la Muerte; letargo de sanación anímica) |
| 11 | `GOD_EARTH_MOTHER` (Lilith / Omebella) | `brood_hive` (`MOTHER_CLUSTER`) | `entity` | `reborn/data/content/world/gods.json` | *novel-native* (Deidad Ortodoxa S0 de la Luna/Madre; reina vampírica) |
| 12 | `GOD_ROSELLE_BLACK_EMPEROR` (Roselle Gustav) | `nation_of_disorder` (`ORDER_CLUSTER`) | `entity` | `reborn/data/content/world/great_old_ones.json` | *híbrido novel/biblioteca-native* (Emperador sellado en el mausoleo insular) |
| 13 | `GOD_DARK_SIDE_UNIVERSE` (Farbauti) | `tenebrous_world` (`ABYSS_CLUSTER`) | `entity` | `reborn/data/content/world/gods.json` | *novel-native* (Deidad S0 del Abismo; corrompida por el cosmos) |
| 14 | `ENTITY_CHAINED_GOD` (Tolzna) | `tenebrous_world` (`ABYSS_CLUSTER`) | `entity` | `reborn/data/content/world/gods.json` | *novel-native* (Deidad S0 Encadenada; bajo martirio de MTOD) |
| 15 | `GOD_STEAM_MACHINERY` (Dios del Vapor) | `knowledge_moor` (`HERMIT_CLUSTER`) | `entity` | `reborn/data/content/world/gods.json` | *novel-native* (Deidad Ortodoxa S0 de la Maquinaria) |
| 16 | `GOD_HIDDEN_SAGE` (Sabio Oculto) | `knowledge_moor` (`HERMIT_CLUSTER`) | `entity` | `reborn/data/content/world/gods.json` | *novel-native* (Unicidad viviente del Ermitaño; susurros cognoscitivos) |
| 17 | `KOA_MEDICI` (Ángel Rojo) | `city_of_calamity` (`CALAMITY_CLUSTER`) | `entity` | `reborn/data/content/world/kings_of_angels.json` | *novel-native* (Espíritu maligno triple renacido en Backlund) |
| 18 | `GOD_CHEEK_DEMONESS` (Cheek) | `city_of_calamity` (`CALAMITY_CLUSTER`) | `entity` | `reborn/data/content/world/gods.json` | *novel-native* (Deidad S0 de las Demonias; latente tras la Guerra de Dioses) |
| 19 | `KOA_OUROBOROS` (Devorador de Colas) | `key_of_light` (`FATE_CLUSTER`) | `entity` | `reborn/data/content/world/kings_of_angels.json` | *novel-native* (Rey de los Ángeles del Destino / Rueda de la Fortuna) |
| 20 | `ANGEL_WILL_AUCEPTIN` (Will Ceres) | `key_of_light` (`FATE_CLUSTER`) | `entity` | `reborn/data/content/world/angels.json` | *novel-native* (Serpiente de Mercurio reencarnada como infante en Backlund) |

---

## 2. AUDITORÍA DE COMPLETITUD DE FUERZAS Y FAMILIAS HISTÓRICAS

### 2.1 Comparación: Familias en Tier G vs Biblioteca Canónica (Tier L)
Actualmente en `convergence_forces.json` existen 9 entidades de tipo `family` u organizaciones de remanente familiar:
1. `FAM_ABRAHAM` (`sefirah_castle`): Familia noble de la Puerta; supervivientes en Loen.
2. `FAM_ZOROAST` (`sefirah_castle`): Familia noble del Error; linaje de Pallez Zoroast en Backlund.
3. `ORG_TAMARA_REMNANTS` (`sefirah_castle`): Remanentes de la familia Tamara (Puerta/Arbiter).
4. `FAM_EGGER` (`river_of_eternal_darkness`): Linaje del Imperio Balam y la Muerte.
5. `FAM_AUGUSTUS` (`nation_of_disorder`): Familia imperial gobernante del Reino de Loen.
6. `FAM_CASTIYA` (`nation_of_disorder`): Familia real del Reino de Fenepot (*en cola HUMAN_REVIEW*).
7. `FAM_BERIA` (`tenebrous_world`): Linaje demoníaco de la Cuarta Época (*en cola HUMAN_REVIEW*).
8. `ORG_SAURON_REMNANTS` (`city_of_calamity`): Antigua familia real de Intis (Cazador).
9. `FAM_EINHORN` (`city_of_calamity`): Familia imperial gobernante de Feysac (*en cola HUMAN_REVIEW*).

### 2.2 Familias Históricas de la Cuarta Época Evaluadas
- **Familia Antigonus:** Extinta como clan mortal viviente. Solo sobrevive `KOA_ANTIGONUS` (clasificado como ser mítico) y el Cuaderno de la Familia Antigonus (`ART_ANTIGONUS_NOTEBOOK`). No procede crear `FAM_ANTIGONUS` como fuerza interactiva en 1353.
- **Familia Jacob:** Mencionada en `npc.json` y la novela como supervivientes dispersos de la Vía del Saqueador/Error perseguidos por Amon. Se recomienda mantenerla en el catálogo de candidatos para futura expansión si se requieren más células de ladrones mortales en `sefirah_castle`.
- **Familias Tudor, Trunsoest y Solomon:** Extintas como entidades familiares vivientes. Su influencia es histórica y arqueológica (ruinas subterráneas de Backlund, Orden Secreta).
- **Conclusión de Completitud:** El catálogo actual de 9 familias cubre el 100% de las casas reales y aristocráticas operativas vivas en la era 1353 Quinta Época.

---

## 3. VEREDICTO PROPUESTO PARA LAS 3 FUERZAS EN COLA HUMAN_REVIEW

Las 3 entidades restantes con `eraVerified: "PENDING_ERA_REVIEW"` son familias aristocráticas legítimas del canon. Propuesta de ratificación para firma del Director:

### 1. `FAM_CASTIYA` (Familia Real de Fenepot / Vía Justiciar)
- **Séfira:** `nation_of_disorder` (ORDER_CLUSTER).
- **Referencia Canónica:** `reborn/data/content/world/secret_organizations.json`, `countries.json`.
- **Estatus en ~1353:** Familia reinante en el Reino de Fenepot. Tras la Guerra de los Dioses, mantiene embajada, diplomáticos y agentes de la vía Arbiter/Justiciar en Backlund coordinando relaciones interestatales.
- **Veredicto Propuesto:** **RATIFICAR** (`eraVerified: true`, `powerTier: "telar"`).  
  *Contexto:* Embajada y red de influencia nobiliaria de Fenepot en Loen.

### 2. `FAM_BERIA` (Familia Demoníaca / Vía del Criminal-Abismo)
- **Séfira:** `tenebrous_world` (ABYSS_CLUSTER).
- **Referencia Canónica:** `reborn/data/content/world/secret_organizations.json`.
- **Estatus en ~1353:** Linaje demoníaco milenario originario de la Cuarta Época. Opera de forma clandestina en el inframundo de Backlund (East Borough, Muelles, logias de juego y contrabando).
- **Veredicto Propuesto:** **RATIFICAR** (`eraVerified: true`, `powerTier: "telar"`).  
  *Contexto:* Sindicatos del crimen y linaje de diablos encubiertos en los bajos fondos metropolitanos.

### 3. `FAM_EINHORN` (Familia Imperial de Feysac / Vía del Cazador)
- **Séfira:** `city_of_calamity` (CALAMITY_CLUSTER).
- **Referencia Canónica:** `reborn/data/content/lore_knowledge/rumors.json`, `countries.json`.
- **Estatus en ~1353:** Casa imperial de Feysac. A pesar de la derrota militar del imperio y la muerte de Badheil, la familia Einhorn retiene el trono en San Petersburgo y despliega agregadurías militares, espías y círculos revanchistas en Backlund.
- **Veredicto Propuesto:** **RATIFICAR** (`eraVerified: true`, `powerTier: "telar"`).  
  *Contexto:* Agregaduría militar feysakiana, veteranos de guerra y células secretas de espionaje en Loen.

---

## 4. CATÁLOGO SEPARADO DE DIOSES EXTERIORES (GREAT OLD ONES CÓSMICOS)

> **Regla de Aislamiento de Era (§Reglas de Era R3):** Los Dioses Exteriores (Outer Deities) se encuentran al otro lado de la Barrera del Creador Original en el Cosmos. En el año 1353, la barrera sigue en pie gracias al sacrificio de los dioses ortodoxos y la voluntad de Klein. Sus cultos son semillas embrionarias o susurros latentes. Ningún Dios Exterior posee ficha de combatiente ni encuentro callejero directo.

### Catálogo de Amenazas Cósmicas Fuera de las Séfiras Terrestres:

1. **`OD_MOTHER_GODDESS_DEPRAVITY` (Mother Goddess of Depravity):**
   - *Títulos:* Origen del Mal, El Sufrimiento Indescriptible.
   - *Vínculo Terrestre:* Parte de su séfira original (`brood_hive`) y unicidades de Luna y Madre fueron arrancadas y selladas en la Tierra.
   - *Manifestación 1353:* Corrupción biológica latente y presagios en el plano astral.
2. **`OD_MOTHER_TREE_DESIRE` (Mother Tree of Desire - MTOD):**
   - *Títulos:* Árbol Madre del Deseo, Corazón del Desenfreno.
   - *Vínculo Terrestre:* Control parcial sobre el Dios Encadenado (`ENTITY_CHAINED_GOD`) y facción indulgente de la Escuela de la Rosa (`ORG_ROSE_SCHOOL`).
   - *Manifestación 1353:* La mayor amenaza de infiltración activa a través de los cultos del sufrimiento y la perversión en el Continente Sur y Backlund.
3. **`OD_SON_OF_CHAOS` (Son of Chaos / Indefinite Fog):**
   - *Títulos:* Hijo del Caos, Niebla Indefinida.
   - *Vínculo Terrestre:* Propietario cósmico de la Nación del Desorden (`nation_of_disorder`). Sellado en la Lámpara Mágica de los Deseos.
   - *Manifestación 1353:* Reliquia sellada bajo control de los durmientes de Sefirah.
4. **`OD_CIRCLE_OF_INEVITABILITY` (Circle of Inevitability):**
   - *Títulos:* Círculo de la Inevitabilidad, Señor del Pasado y Futuro.
   - *Vínculo Terrestre:* Vía del Danzante / Contratos del Destino.
   - *Manifestación 1353:* Semilla cósmica precursora representada exclusivamente por `ORG_DANCERS_PRECURSOR` (R3); manifestación plena en 1358 (CoI).
5. **`OD_PRIMORDIAL_MOON` (Primordial Moon):**
   - *Manifestación 1353:* Corrupción del brillo lunar que afectó históricamente a Roselle y perturba las adivinaciones nocturnas.
6. **`OD_SUPERNOVA_DOMINATOR` (Supernova Dominator):**
   - *Manifestación 1353:* Radiación cósmica gravitacional visible solo en observaciones astrológicas avanzadas.
7. **`OD_INEXTINGUISHABLE_RAVINGS` (Inextinguishable Ravings):**
   - *Manifestación 1353:* Susurros de locura que interceptan comunicaciones de largo alcance en el Mundo Espiritual.
8. **`OD_MONARCH_OF_DECAY` (Monarch of Decay):**
   - *Manifestación 1353:* Decaimiento entrópico cósmico que acelera la corrupción en artefactos de alto grado abandonados.
9. **`OD_GODDESS_OF_FATE` (Goddess of Fate):**
   - *Manifestación 1353:* Turbulencias en el río del destino detectadas por las Serpientes de Mercurio.

---

## 5. ESPACIO PARA FIRMA Y DECRETOS DEL DIRECTOR

- `[ ]` **RATIFICAR** `FAM_CASTIYA` en `nation_of_disorder` (`eraVerified: true`).
- `[ ]` **RATIFICAR** `FAM_BERIA` en `tenebrous_world` (`eraVerified: true`).
- `[ ]` **RATIFICAR** `FAM_EINHORN` en `city_of_calamity` (`eraVerified: true`).

**Firma del Director:** ______________________________  
**Fecha:** ____ / ____ / 2026
