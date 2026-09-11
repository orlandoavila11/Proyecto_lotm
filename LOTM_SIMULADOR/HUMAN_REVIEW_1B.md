# COLA DE CURADURIA 1B — AUDITORIA EXHAUSTIVA DE NARRATIVE OUTCOMES
**Autoridad:** Director Canonico
**Objetivo:** Revision completa, sin resumen y sin omision de todos los narrativeOutcome de las Vias FOOL y VISIONARY (Secuencias 9 y 8).

---

# VIA FOOL (EL LOCO)

## DIL_FOOL_9_1 — El Presagio de la Flota de Bayam
- **Via:** FOOL
- **Secuencia:** 9
- **Situacion:** Un comerciante de ultramar te pide consultar las cartas del tarot sobre una flota mercante que zarpó de Bayam. Las cartas revelan naufragio inminente por temporal.
- **Confianza Canonica:** canon
- **Nota de Derivacion:** {"source":"ActingDilemmaEngine:DIL_FOOL_9_1","eraAdaptations":"Adaptado a 1353: rutas comerciales de Bayam restablecidas tras la Guerra de los Dioses."}
- **Anti-Exploit:** {"decay":0.2,"minCost":5,"variety":"TAROT_TRUTH_VS_DECEIT"}

### Opciones y Resultados Narrativos (narrativeOutcome):

#### Opcion: CHOICE_FOOL_9_TRUTH
- **Texto de la Opcion:** Interpretar la revelación con sobriedad y comunicar el peligro real
- **Clave de Efecto (effectKey):** SEER_TRUTH_RIGOR
- **Costes:** {"spirituality":5}
- **Pesos:** {"alignment":1,"actingWeight":1}
- **Trade-offs:**
  - *Ganancia:* Alta asimilación de la poción de Vidente
  - *Coste:* Atención eclesiástica por acierto profético
  - *Riesgo:* Pérdida de clientela si la verdad resulta desagradable
- **narrativeOutcome:**
  > El comerciante cancela sus contratos de carga. Dos días después la gaceta confirma el hundimiento. Tu espiritualidad fluye con armonía: has actuado como un verdadero Vidente.

#### Opcion: CHOICE_FOOL_9_LIE
- **Texto de la Opcion:** Suavizar el augurio prometiendo un viaje tranquilo a cambio de propina
- **Clave de Efecto (effectKey):** SEER_FALSEHOOD_TRANSGRESSION
- **Costes:** {"spirituality":0}
- **Pesos:** {"alignment":-1,"actingWeight":0.8}
- **Trade-offs:**
  - *Ganancia:* Propina inmediata sin confrontación
  - *Coste:* Disonancia espiritual y retroceso de digestión
  - *Riesgo:* Violación flagrante del principio de actuar
- **narrativeOutcome:**
  > La poción hierve con disonancia mercurial en tu garganta: has violado la ley del Vidente mintiendo sobre el destino.

---

## DIL_FOOL_9_2 — La Aguja Zahorí en el Pozo de Cherwood
- **Via:** FOOL
- **Secuencia:** 9
- **Situacion:** Vecinos de una barriada empobrecida en Cherwood temen que el pozo comunal haya sido envenenado con efluvios de alquimia clandestina tras los bombardeos.
- **Confianza Canonica:** library
- **Nota de Derivacion:** {"source":"pathway_events:EV_FOOL_DIGESTIÓN_01","eraAdaptations":"Contaminación química contextualizada en la posguerra aérea de Backlund (1353)."}
- **Anti-Exploit:** {"decay":0.25,"minCost":8,"variety":"DOWSING_INVESTIGATION"}

### Opciones y Resultados Narrativos (narrativeOutcome):

#### Opcion: CHOICE_FOOL_9_DOWSING_PUBLIC
- **Texto de la Opcion:** Suspender el péndulo de cuarzo ante los vecinos para señalar el manantial puro
- **Clave de Efecto (effectKey):** SEER_DIVINE_OMEN_DEEP
- **Costes:** {"spirituality":8}
- **Pesos:** {"alignment":1,"actingWeight":1}
- **Trade-offs:**
  - *Ganancia:* Asimilación mística por actuar como guía intuitivo
  - *Coste:* Desgaste de concentración espiritual
  - *Riesgo:* Exposición ante vigilantes barriales
- **narrativeOutcome:**
  > El péndulo de cuarzo gira con frenesí hasta detenerse sobre la veta pura de agua subterránea. Los vecinos celebran con lágrimas, y una corriente etérea disuelve la frialdad de la poción en tus órganos astrales.

#### Opcion: CHOICE_FOOL_9_SAMPLE_CHEMICAL
- **Texto de la Opcion:** Recoger muestras de lodo y costear un análisis químico forense en un boticario de Cherwood
- **Clave de Efecto (effectKey):** SEER_CAUTIOUS_ABSTAIN
- **Costes:** {"spirituality":0}
- **Pesos:** {"alignment":0.4,"actingWeight":0.6}
- **Trade-offs:**
  - *Ganancia:* Investigación mundana rigurosa que destapa la fuente física de la polución
  - *Coste:* Gasto de chelines de tu bolsillo y demora de dos días
  - *Riesgo:* Destapas un laboratorio alquímico clandestino en los desagües que alerta a contrabandistas
- **narrativeOutcome:**
  > Pagas el análisis al boticario y dos días después el informe confirma vertidos de ácido sulfúrico procedentes de un laboratorio clandestino bajo las cloacas de Cherwood. Tu indagación mundana abre una nueva pista criminal en el distrito, aunque tu digestión mística de Vidente permanece inmóvil.

---

## DIL_FOOL_9_3 — Visión Espiritual en la Pensión de East Borough
- **Via:** FOOL
- **Secuencia:** 9
- **Situacion:** Tu casera afirma escuchar llantos desde una habitación cerrada donde falleció un soldado feysakiano capturado durante la guerra.
- **Confianza Canonica:** library
- **Nota de Derivacion:** {"source":"pathway_events:EV_FOOL_PELIGRO_09","eraAdaptations":"Remanente espectral derivado de bajas de la guerra continental en Backlund (1353)."}
- **Anti-Exploit:** {"decay":0.2,"minCost":6,"variety":"SPIRIT_VISION_ROOM"}

### Opciones y Resultados Narrativos (narrativeOutcome):

#### Opcion: CHOICE_FOOL_9_SPIRIT_VISION_ACTIVE
- **Texto de la Opcion:** Abrir la Visión Espiritual y descifrar los colores aurales del remanente
- **Clave de Efecto (effectKey):** SEER_DIVINE_OMEN_DEEP
- **Costes:** {"spirituality":10}
- **Pesos:** {"alignment":1,"actingWeight":1}
- **Trade-offs:**
  - *Ganancia:* Comprensión directa del mundo incorpóreo y progreso de digestión
  - *Coste:* Fatiga ocular y roce con el plano astral
  - *Riesgo:* Ver entidades más allá de tu tolerancia mental
- **narrativeOutcome:**
  > El mundo físico se desdibuja bajo capas de luz astral y halos esmeralda. El espectro del conscripto, atado por el dolor de la metralla, se disuelve en paz tras tu susurro místico; la poción de Vidente fluye como savia luminosa.

#### Opcion: CHOICE_FOOL_9_RITUAL_PURIFY
- **Texto de la Opcion:** Encender polvo de lavanda y manzanilla para apaciguar el ambiente sin mirar
- **Clave de Efecto (effectKey):** SEER_PRUDENT_DIVINATION
- **Costes:** {"spirituality":4}
- **Pesos:** {"alignment":0.5,"actingWeight":0.8}
- **Trade-offs:**
  - *Ganancia:* Estabilidad psicológica y gratitud de la casera
  - *Coste:* Gasto de ingredientes mundanos
  - *Riesgo:* El residuo espiritual no se resuelve y volverá
- **narrativeOutcome:**
  > El humo denso de hierbas aromáticas perfuma las vigas de madera vieja. El llanto cesa temporalmente bajo un bálsamo mundano; tu mente descansa sin arriesgar la cordura, aunque el misterio sigue latente tras los tabiques.

---

## DIL_FOOL_9_4 — La Dama Desesperada del Puente de Backlund
- **Via:** FOOL
- **Secuencia:** 9
- **Situacion:** Una joven viuda con un niño en brazos te implora una lectura sobre el paradero de su hermano, desaparecido en la batalla de la cordillera Amantha.
- **Confianza Canonica:** library
- **Nota de Derivacion:** {"source":"pathway_events:EV_FOOL_IDENTIDAD_17","eraAdaptations":"Bajas de la cordillera Amantha (combates de la Quinta Época ~1352)."}
- **Anti-Exploit:** {"decay":0.3,"minCost":5,"variety":"WAR_LOSS_CONSULT"}

### Opciones y Resultados Narrativos (narrativeOutcome):

#### Opcion: CHOICE_FOOL_9_CARDS_SOLEMN
- **Texto de la Opcion:** Disponer las cartas del tarot con dignidad e informarle con tacto de su reposo eterno
- **Clave de Efecto (effectKey):** SEER_TRUTH_RIGOR
- **Costes:** {"spirituality":5}
- **Pesos:** {"alignment":1,"actingWeight":1}
- **Trade-offs:**
  - *Ganancia:* Digestión de Vidente por encarar el destino con compasión objetiva
  - *Coste:* Pequeño desgaste emocional
  - *Riesgo:* Rechazo del honorario por parte de la indigente
- **narrativeOutcome:**
  > La carta de La Torre invertida se posa con suavidad sobre el terciopelo oscuro. La mujer aprieta a su hijo en silencio y agacha la cabeza; has cumplido con revelar la amarga verdad cósmica, y el Vidente en ti se enraíza con solemnidad.

#### Opcion: CHOICE_FOOL_9_DIRECT_REFUSAL
- **Texto de la Opcion:** Rechazar tajantemente la consulta advirtiendo que el destino de los caídos en combate es intocable
- **Clave de Efecto (effectKey):** SEER_CAUTIOUS_ABSTAIN
- **Costes:** {"spirituality":0}
- **Pesos:** {"alignment":0.1,"actingWeight":0.4}
- **Trade-offs:**
  - *Ganancia:* Preservación estricta del misterio y evasión de ataduras espectrales
  - *Coste:* Nula asimilación de la vía de Vidente
  - *Riesgo:* La viuda desesperada cae en manos de un charlatán del Puente que la estafa y huye
- **narrativeOutcome:**
  > Guardas la baraja en la funda de terciopelo y rechazas la consulta con severidad ascética. Dos días después, rumores del Puente confirman que la viuda entregó sus últimos ahorros a un charlatán callejero que la engañó con falsas esperanzas antes de desaparecer; tu negativa protegió tu seguridad espiritual, pero el eco del abuso ajeno deja una sombra amarga en tu vecindario.

---

## DIL_FOOL_8_1 — La Máscara Rota del Circo de Barrio Este
- **Via:** FOOL
- **Secuencia:** 8
- **Situacion:** Durante un número acrobático en una carpa improvisada de Backlund, recuerdas una escena de muerte atroz. La locura aprieta tus sienes ante una multitud de niños.
- **Confianza Canonica:** adapted
- **Nota de Derivacion:** {"source":"ActingDilemmaEngine:DIL_FOOL_8_1","eraAdaptations":"Opciones B y C redactadas por el compilador para reparar dilema roto; entra a cola 1b."}
- **Anti-Exploit:** {"decay":0.25,"minCost":10,"variety":"CIRCUS_STAGE_TRAUMA"}

### Opciones y Resultados Narrativos (narrativeOutcome):

#### Opcion: CHOICE_FOOL_8_SMILE
- **Texto de la Opcion:** Forzar una mueca cómica exagerada y rematar la escena con una voltereta ridícula
- **Clave de Efecto (effectKey):** CLOWN_STAGE_LAUGHTER
- **Costes:** {"spirituality":10}
- **Pesos:** {"alignment":1,"actingWeight":1}
- **Trade-offs:**
  - *Ganancia:* Máxima digestión de Payaso por esconder el dolor tras la farsa
  - *Coste:* Tensión neuromuscular extrema
  - *Riesgo:* La risa forzada roza la histeria
- **narrativeOutcome:**
  > Los aplausos estallan. Bajo el maquillaje blanco y rojo, tus músculos tiemblan, pero la poción de Payaso se absorbe con voracidad.

#### Opcion: CHOICE_FOOL_8_BREAKDOWN
- **Texto de la Opcion:** Paralizarse en la pista y dejar que las lágrimas arruinen el maquillaje ante el público
- **Clave de Efecto (effectKey):** CLOWN_BREAKDOWN_TEARS
- **Costes:** {"spirituality":0}
- **Pesos:** {"alignment":-1,"actingWeight":0.8}
- **Trade-offs:**
  - *Ganancia:* Alivio temporal del ahogo emocional
  - *Coste:* Severa pérdida de cordura y disonancia de la poción
  - *Riesgo:* Escándalo público y sospechas de los vigilantes locales
- **narrativeOutcome:**
  > El llanto desbarata la pintura blanca y escarlata ante las miradas atónitas de los niños. Un silencio gélido recorre la carpa mientras la poción de Payaso se agita con convulsiones disonantes en tu pecho.

#### Opcion: CHOICE_FOOL_8_ABRUPT_EXIT
- **Texto de la Opcion:** Fingir un tropiezo hacia los bastidores y escapar del escenario sin mirar atrás
- **Clave de Efecto (effectKey):** CLOWN_CYNICAL_FLEE
- **Costes:** {"spirituality":0}
- **Pesos:** {"alignment":0.2,"actingWeight":0.5}
- **Trade-offs:**
  - *Ganancia:* Evitas el colapso total en escena
  - *Coste:* Digestión mínima y pérdida de la paga del día
  - *Riesgo:* Despido del espectáculo y rumores entre los tramoyistas
- **narrativeOutcome:**
  > Un tropiezo fingido te permite desaparecer tras el cortinaje polvoriento. Los abucheos de la grada se apagan en la niebla del callejón; tu cuerpo se estremece con alivio cobarde mientras pierdes la paga del espectáculo.

---

## DIL_FOOL_8_2 — El Duelo de Muecas en la Taberna del Jabalí
- **Via:** FOOL
- **Secuencia:** 8
- **Situacion:** Un estibador borracho y violento te arroja una jarra de cerveza a la cara en una taberna portuaria, exigiendo que dejes de reírte de su miseria.
- **Confianza Canonica:** library
- **Nota de Derivacion:** {"source":"pathway_events:EV_FOOL_ACTING_03","eraAdaptations":"Distrito portuario de Backlund bajo racionamiento y desempleo posguerra (1353)."}
- **Anti-Exploit:** {"decay":0.2,"minCost":8,"variety":"TAVERN_AGILITY_CLOWN"}

### Opciones y Resultados Narrativos (narrativeOutcome):

#### Opcion: CHOICE_FOOL_8_DODGE_MOCK
- **Texto de la Opcion:** Esquivar la jarra con torsión acrobática y responder con reverencia burlesca
- **Clave de Efecto (effectKey):** CLOWN_ACROBATIC_DEFLECTION
- **Costes:** {"spirituality":12}
- **Pesos:** {"alignment":1,"actingWeight":1}
- **Trade-offs:**
  - *Ganancia:* Asimilación motora de Payaso y ovación de la clientela
  - *Coste:* Gasto de reflejos sobrenaturales
  - *Riesgo:* Enfurecer aún más al agresor
- **narrativeOutcome:**
  > La jarra de peltre silba a un centímetro de tu oreja mientras tu columna se arquea como un junco elástico. La carcajada de los marineros resuena en la taberna y el principio del Payaso se funde en tus tendones sobrehumanos.

#### Opcion: CHOICE_FOOL_8_BRAWL_FISTS
- **Texto de la Opcion:** Engancharse en una pelea callejera a puñetazos limpia para probar tu fuerza física
- **Clave de Efecto (effectKey):** CLOWN_BOLD_PERFORMANCE
- **Costes:** {"spirituality":5}
- **Pesos:** {"alignment":-0.6,"actingWeight":0.7}
- **Trade-offs:**
  - *Ganancia:* Resuelve la amenaza por vía violenta directa
  - *Coste:* Dañar la máscara de Payaso y contusiones
  - *Riesgo:* Intervención de la policía fluvial
- **narrativeOutcome:**
  > Tu puño impacta en la mandíbula del gigante con estrépito de huesos y mesas rotas. La violencia vulgar rompe la elegancia bufonesca; la policía acude al silbato y tu sangre arde con disonancia abrasiva.

---

## DIL_FOOL_8_3 — El Control de los Nighthawks en la Calle Williams
- **Via:** FOOL
- **Secuencia:** 8
- **Situacion:** Un equipo de patrulla del Nighthawk detiene a los transeúntes tras un incidente sobrenatural en una joyería cercana. Un sabueso de la policía olfatea tu abrigo.
- **Confianza Canonica:** library
- **Nota de Derivacion:** {"source":"pathway_events:EV_FOOL_ORGANIZACIÓN_11","eraAdaptations":"Vigilancia reforzada de Evernight Nighthawks en Backlund tras la guerra (1353)."}
- **Anti-Exploit:** {"decay":0.3,"minCost":12,"variety":"CHECKPOINT_DECEPTION"}

### Opciones y Resultados Narrativos (narrativeOutcome):

#### Opcion: CHOICE_FOOL_8_CONTROL_HEARTBEAT
- **Texto de la Opcion:** Manipular la expresión facial y pulso cardíaco para fingir ser un civil aturdido
- **Clave de Efecto (effectKey):** CLOWN_PAIN_ENDURANCE
- **Costes:** {"spirituality":15}
- **Pesos:** {"alignment":1,"actingWeight":1}
- **Trade-offs:**
  - *Ganancia:* Maestría en control biológico de Payaso y escape ileso
  - *Coste:* Estrés psíquico por engañar a sabuesos más allá de lo normal
  - *Riesgo:* Si el inquisidor usa adivinación directa puede notar la disonancia
- **narrativeOutcome:**
  > Relajas la musculatura facial en una mueca de bobalicona timidez mientras ralentizas el pulso a cincuenta latidos por minuto. El sabueso pierde el rastro y el inquisidor sigue de largo; la digestión de Payaso avanza al dominar tu propio cuerpo.

#### Opcion: CHOICE_FOOL_8_DRUNKEN_BUFFOON
- **Texto de la Opcion:** Fingir una embriaguez ridícula tropezando de bruces y esparciendo flores de tela ante el sabueso
- **Clave de Efecto (effectKey):** CLOWN_STAGE_LAUGHTER
- **Costes:** {"spirituality":10}
- **Pesos:** {"alignment":0.8,"actingWeight":0.9}
- **Trade-offs:**
  - *Ganancia:* Desarma la tensión policial transformando el control inquisitorial en una bufonada callejera
  - *Coste:* Gasto de espiritualidad para modular el patetismo cómico y empujones de la guardia
  - *Riesgo:* Pérdida de dignidad civil y magulladuras al ser arrojado al fango de la calzada
- **narrativeOutcome:**
  > Tropiezas de forma cómica contra un farol de gas con hipo teatral y derramas un ramo de flores de tela sobre el hocico del sabueso policial. Los guardias sueltan una carcajada despectiva y te apartan de una patada al grito de '¡muévete, payaso borracho!'. Te arrastras entre la niebla sonriendo bajo la suciedad: has burlado a los Nighthawks abrazando el ridículo del Payaso.

---

## DIL_FOOL_8_4 — El Funeral del Viejo Ilusionista
- **Via:** FOOL
- **Secuencia:** 8
- **Situacion:** Asistes al sepelio de un colega veterano del espectáculo que murió en la indigencia. Su viuda solloza mientras los acreedores murmuran reclamos frente al féretro.
- **Confianza Canonica:** library
- **Nota de Derivacion:** {"source":"pathway_events:EV_FOOL_DESTINO_19","eraAdaptations":"Pobreza urbana y entierros colectivos en los suburbios de Backlund (1353)."}
- **Anti-Exploit:** {"decay":0.2,"minCost":10,"variety":"FUNERAL_LAUGHTER_HONOR"}

### Opciones y Resultados Narrativos (narrativeOutcome):

#### Opcion: CHOICE_FOOL_8_EULOGY_JEST
- **Texto de la Opcion:** Ofrecer un discurso fúnebre cargado de anécdotas cómicas que arranque sonrisas entre las lágrimas
- **Clave de Efecto (effectKey):** CLOWN_STAGE_LAUGHTER
- **Costes:** {"spirituality":10}
- **Pesos:** {"alignment":1,"actingWeight":1}
- **Trade-offs:**
  - *Ganancia:* Profunda digestión del principio de actuar del Payaso ante la muerte
  - *Coste:* Sobrecarga de autocontrol para no quebrarse
  - *Riesgo:* Miradas de escándalo por parte de vecinos conservadores
- **narrativeOutcome:**
  > Relatas los disparatados tropiezos del difunto con una voz vibrante que arranca carcajadas sofocadas a los dolientes. La mueca burlona sobre la fosa abierta sacude el aire sombrío, y la esencia del Payaso se asimila con reverente locura.

#### Opcion: CHOICE_FOOL_8_SILENT_MONEY
- **Texto de la Opcion:** Depositar un sobre con chelines en el abrigo de la viuda y marcharte en silencio sombrío
- **Clave de Efecto (effectKey):** SEER_DISCREET_RETREAT
- **Costes:** {"spirituality":0}
- **Pesos:** {"alignment":0.3,"actingWeight":0.5}
- **Trade-offs:**
  - *Ganancia:* Alivio moral civil y mantenimiento del perfil bajo
  - *Coste:* Gasto económico personal
  - *Riesgo:* Poco avance en la digestión sobrenatural de la fórmula
- **narrativeOutcome:**
  > Deslizas el sobre entre los pliegues del chal de la viuda sin pronunciar palabra y te pierdes entre los cipreses del cementerio. Cumples con la decencia civil, mas la poción clama por la audacia de quien ríe ante el abismo.

---

# VIA VISIONARY (EL VISIONARIO)

## DIL_VISIONARY_9_1 — La Partida de Ajedrez en el Salón Glacis
- **Via:** VISIONARY
- **Secuencia:** 9
- **Situacion:** Dos diplomáticos de Feysac e Intis discuten en voz baja mientras fingen jugar al ajedrez en un rincón del salón de té. Sospechas que uno de ellos planea un sabotaje.
- **Confianza Canonica:** adapted
- **Nota de Derivacion:** {"source":"ActingDilemmaEngine:DIL_VISIONARY_9_1","eraAdaptations":"Opciones B y C redactadas para completar dilema roto; tensiones diplomáticas Feysac-Intis en Backlund (1353). Entra a cola 1b."}
- **Anti-Exploit:** {"decay":0.25,"minCost":5,"variety":"TEA_SALON_DIPLOMATS"}

### Opciones y Resultados Narrativos (narrativeOutcome):

#### Opcion: CHOICE_SPECTATOR_9_OBSERVE
- **Texto de la Opcion:** Permanecer inmóvil degustando el té y leyendo sus microexpresiones y respiración
- **Clave de Efecto (effectKey):** SPECTATOR_QUIET_ANALYSIS
- **Costes:** {"spirituality":5}
- **Pesos:** {"alignment":1,"actingWeight":1}
- **Trade-offs:**
  - *Ganancia:* Digestión de Espectador impecable al mantenerte fuera del escenario
  - *Coste:* Gasto sutil de concentración ocular
  - *Riesgo:* No intervienes aunque preveas una traición inminente
- **narrativeOutcome:**
  > Sentado en la butaca de terciopelo, descifras el sudor frío y la contracción en el cuello del diplomático mientras mueve el caballo blanco. El teatro del mundo se despliega ante tus ojos desapegados; la poción de Espectador se asienta en tu visión astral.

#### Opcion: CHOICE_SPECTATOR_9_INTERVENE_CHESS
- **Texto de la Opcion:** Acercarse fingiendo sugerir una jugada maestra para interrumpir su conspiración
- **Clave de Efecto (effectKey):** SPECTATOR_IMPULSIVE_ACT
- **Costes:** {"spirituality":8}
- **Pesos:** {"alignment":-1,"actingWeight":0.8}
- **Trade-offs:**
  - *Ganancia:* Neutraliza el acuerdo secreto de inmediato
  - *Coste:* Violación del rol de observador pasivo y disonancia de vía
  - *Riesgo:* Ambos diplomáticos centran su sospecha en ti
- **narrativeOutcome:**
  > Tu mano irrumpe sobre el tablero y las dos miradas hostiles se clavan en tu rostro como bayonetas. Has abandonado la platea para pisar el escenario; la mente se nubla con una punzada de disonancia por violar el rol de observador.

#### Opcion: CHOICE_SPECTATOR_9_LEAVE_EARLY
- **Texto de la Opcion:** Pagar la cuenta apresuradamente y abandonar el establecimiento para no involucrarse
- **Clave de Efecto (effectKey):** SPECTATOR_COLD_WITHDRAWAL
- **Costes:** {"spirituality":0}
- **Pesos:** {"alignment":0.3,"actingWeight":0.5}
- **Trade-offs:**
  - *Ganancia:* Seguridad civil absoluta y anonimato
  - *Coste:* Progreso mínimo de digestión
  - *Riesgo:* Pérdida de información geopolítica valiosa
- **narrativeOutcome:**
  > Dejas dos monedas sobre la bandeja de plata y sales discretamente a la acera empapada de lluvia. Mantienes la seguridad civil y el anonimato intacto, aunque la poción susurra con apatía ante la trama abandonada.

---

## DIL_VISIONARY_9_2 — El Pánico en la Bolsa de Cereales
- **Via:** VISIONARY
- **Secuencia:** 9
- **Situacion:** En el parqué de la Bolsa de Backlund, corredores de comercio gritan aterrados ante los rumores de escasez de trigo proveniente de Fenepot tras la guerra.
- **Confianza Canonica:** library
- **Nota de Derivacion:** {"source":"pathway_events:EV_VISIONARY_DIGESTIÓN_01","eraAdaptations":"Racionamiento y crisis de granos en Loen posguerra (1353)."}
- **Anti-Exploit:** {"decay":0.2,"minCost":8,"variety":"GRAIN_EXCHANGE_PANIC"}

### Opciones y Resultados Narrativos (narrativeOutcome):

#### Opcion: CHOICE_SPECTATOR_9_ANALYZE_PANIC
- **Texto de la Opcion:** Subir a la galería superior para observar el flujo de histeria colectiva y gestos de avaricia
- **Clave de Efecto (effectKey):** SPECTATOR_DECIPHER_MOTIVE
- **Costes:** {"spirituality":8}
- **Pesos:** {"alignment":1,"actingWeight":1}
- **Trade-offs:**
  - *Ganancia:* Excelente asimilación de la psicología de masas sin participar en la compra
  - *Coste:* Esfuerzo mental por no dejarse contagiar por el estrés ambiental
  - *Riesgo:* Empujones o extravío de pertenencias personales en la masa
- **narrativeOutcome:**
  > Apoyado en la barandilla de hierro, mapeas el contagio del pavor como una ola biológica que sacude a cien hombres adultos. Comprendes los engranajes del miedo colectivo y la poción de Espectador se funde con claridad cristalina en tu percepción.

#### Opcion: CHOICE_SPECTATOR_9_SPECULATE_GOLD
- **Texto de la Opcion:** Descender al tumulto y usar la ventaja de lectura gestual para especular con contratos
- **Clave de Efecto (effectKey):** SPECTATOR_AUDACIOUS_OBSERVE
- **Costes:** {"spirituality":10}
- **Pesos:** {"alignment":-0.8,"actingWeight":0.7}
- **Trade-offs:**
  - *Ganancia:* Ganancia monetaria significativa en chelines y libras
  - *Coste:* Inmersión como actor egoísta que enturbia la serenidad de Espectador
  - *Riesgo:* Rencor de corredores arruinados que memorizan tu rostro
- **narrativeOutcome:**
  > Bajas al parqué gritando ofertas con billetes en mano y arrebatas los contratos de grano a precio de saldo. Los bolsillos se llenan de libras, pero el tumulto visceral ahoga tu calma psíquica en una marea de codicia ajena.

---

## DIL_VISIONARY_9_3 — El Cirujano Temblando en el Dispensario
- **Via:** VISIONARY
- **Secuencia:** 9
- **Situacion:** Un médico de caridad en Cherwood atiende amputados de guerra. Notas que sus manos tiemblan y sus pupilas se dilatan de forma no natural antes de operar.
- **Confianza Canonica:** library
- **Nota de Derivacion:** {"source":"pathway_events:EV_VISIONARY_PELIGRO_09","eraAdaptations":"Hospitales saturados de veteranos mutilados en Backlund (1353)."}
- **Anti-Exploit:** {"decay":0.2,"minCost":6,"variety":"CHARITY_DOCTOR_TREMOR"}

### Opciones y Resultados Narrativos (narrativeOutcome):

#### Opcion: CHOICE_SPECTATOR_9_STUDY_SURGEON
- **Texto de la Opcion:** Observar en penumbra el temblor de sus dedos y el ritmo respiratorio para evaluar su colapso
- **Clave de Efecto (effectKey):** SPECTATOR_QUIET_ANALYSIS
- **Costes:** {"spirituality":6}
- **Pesos:** {"alignment":1,"actingWeight":1}
- **Trade-offs:**
  - *Ganancia:* Comprensión clínica de la degradación nerviosa humana y digestión constante
  - *Coste:* Sobrecarga de empatía contenida
  - *Riesgo:* El paciente corre peligro si el médico comete una negligencia crítica
- **narrativeOutcome:**
  > Inmóvil en la esquina del quirófano, observas la pupila dilatada del cirujano y el ritmo entrecortado de su respiración sobre el cloroformo. Desarmas la psicología del colapso humano sin intervenir, nutriendo la fría lucidez del Espectador.

#### Opcion: CHOICE_SPECTATOR_9_HOLD_HAND
- **Texto de la Opcion:** Sujetar el brazo del médico con firmeza civil y exigirle que descanse antes de cortar
- **Clave de Efecto (effectKey):** SPECTATOR_COVERT_INQUIRY
- **Costes:** {"spirituality":0}
- **Pesos:** {"alignment":0.3,"actingWeight":0.6}
- **Trade-offs:**
  - *Ganancia:* Salva la vida del paciente herido
  - *Coste:* Pérdida de la postura de observador distanciado
  - *Riesgo:* Gritos del personal médico y expulsión de la sala
- **narrativeOutcome:**
  > Detienes el bisturí en seco con un apretón firme en su muñeca. El médico parpadea aturdido y agradece el rescate ético; salvas la carne del herido, pero la necesidad de actuar como salvador enturbia la pura contemplación de la vía.

---

## DIL_VISIONARY_9_4 — La Tertulia Ocultista de Empress Borough
- **Via:** VISIONARY
- **Secuencia:** 9
- **Situacion:** Asistes como invitado menor a una velada aristocrática donde nobles ociosos juegan con una tabla de espiritismo comprada a un buhonero.
- **Confianza Canonica:** library
- **Nota de Derivacion:** {"source":"pathway_events:EV_VISIONARY_IDENTIDAD_17","eraAdaptations":"Salones nobiliarios de Loen buscando consuelo en modas espiritistas tras la guerra."}
- **Anti-Exploit:** {"decay":0.25,"minCost":5,"variety":"ARISTOCRATIC_SEANCE_DISSECT"}

### Opciones y Resultados Narrativos (narrativeOutcome):

#### Opcion: CHOICE_SPECTATOR_9_DISSECT_FAKES
- **Texto de la Opcion:** Mapear los micromovimientos musculares del anfitrión para confirmar que manipula la aguja
- **Clave de Efecto (effectKey):** SPECTATOR_QUIET_ANALYSIS
- **Costes:** {"spirituality":5}
- **Pesos:** {"alignment":1,"actingWeight":1}
- **Trade-offs:**
  - *Ganancia:* Perfección en el discernimiento del autoengaño y asimilación de la fórmula
  - *Coste:* Fatiga de atención perceptual continua
  - *Riesgo:* Sentimiento de cinismo y aislamiento psicológico
- **narrativeOutcome:**
  > Sigues con mirada clínica el pulgar del anfitrión bajo el mantel de seda que empuja la aguja hacia las letras de respuesta. Saboreas el placer cerebral de desmantelar la farsa humana en silencio; tu espiritualidad resuena con comprensión serena.

#### Opcion: CHOICE_SPECTATOR_9_CALL_OUT_FRAUD
- **Texto de la Opcion:** Denunciar públicamente el truco mecánico dejando en ridículo a la nobleza anfitriona
- **Clave de Efecto (effectKey):** SPECTATOR_VULGAR_EXPOSURE
- **Costes:** {"spirituality":0}
- **Pesos:** {"alignment":-1,"actingWeight":0.8}
- **Trade-offs:**
  - *Ganancia:* Satisfacción de orgullo civil intelectual
  - *Coste:* Quiebre absoluto de la discreción de Espectador
  - *Riesgo:* Enemistad duradera con una familia noble influyente de Backlund
- **narrativeOutcome:**
  > Tu voz denuncia el alambre oculto y el salón estalla en reproches e insultos aristocráticos. El mayordomo te escolta a la puerta con desdén; has alimentado el ego civil a costa de romper la regla áurea del Espectador silencioso.

---

## DIL_VISIONARY_8_1 — El Eco del Bombardeo en la Mente del Artillero
- **Via:** VISIONARY
- **Secuencia:** 8
- **Situacion:** Un exartillero del ejército de Loen sufre un ataque de pánico en la estación de tren al escuchar el silbato de la locomotora, creyendo que es una bomba aérea.
- **Confianza Canonica:** library
- **Nota de Derivacion:** {"source":"pathway_events:EV_VISIONARY_ACTING_03","eraAdaptations":"Trauma psicológico por bombardeos de dirigibles en la Quinta Época (1353)."}
- **Anti-Exploit:** {"decay":0.2,"minCost":15,"variety":"SHELLSHOCK_TELEPATHY"}

### Opciones y Resultados Narrativos (narrativeOutcome):

#### Opcion: CHOICE_TELEPATH_8_PACIFY_TRAUMA
- **Texto de la Opcion:** Extender una onda de apaciguamiento telepático que sincronice sus pensamientos con calma
- **Clave de Efecto (effectKey):** TELEPATH_EMPATHIC_RESONANCE
- **Costes:** {"spirituality":15}
- **Pesos:** {"alignment":1,"actingWeight":1}
- **Trade-offs:**
  - *Ganancia:* Máxima digestión de Telépata por moldear serenidad en un mar mental turbulento
  - *Coste:* Gasto notable de energía espiritual
  - *Riesgo:* Filtración leve del trauma bélico hacia tu propia psique
- **narrativeOutcome:**
  > Extiendes un susurro psíquico invisible que calma las crestas de pánico en la mente del artillero como aceite sobre olas bravías. El hombre exhala con alivio y la poción de Telépata se expande como un manto sobre las almas quebradas.

#### Opcion: CHOICE_TELEPATH_8_FORCE_SLEEP
- **Texto de la Opcion:** Golpear su corteza superficial con un choque mental tosco para noquearlo al instante
- **Clave de Efecto (effectKey):** TELEPATH_FORCED_PROBE
- **Costes:** {"spirituality":20}
- **Pesos:** {"alignment":-0.7,"actingWeight":0.7}
- **Trade-offs:**
  - *Ganancia:* Detiene el escándalo público de forma fulminante
  - *Coste:* Dañar el tejido mental ajeno y disonancia de vía
  - *Riesgo:* El hombre convulsiona ante los transeúntes asustados
- **narrativeOutcome:**
  > Descargas un martillazo mental tosco que derriba al veterano de bruces contra las baldosas de la estación. Los transeúntes retroceden horrorizados al ver sangrar su nariz; has impuesto orden por la fuerza bruta, desgarrando la finura de tu propia vía.

---

## DIL_VISIONARY_8_2 — La Conspiración del Gremio del Carbón
- **Via:** VISIONARY
- **Secuencia:** 8
- **Situacion:** Durante una reunión en la Cámara de Comercio, sondeas los pensamientos superficiales de los directores y detectas un plan para desviar carbón destinado a calefacción de hospitales.
- **Confianza Canonica:** library
- **Nota de Derivacion:** {"source":"pathway_events:EV_VISIONARY_ORGANIZACIÓN_11","eraAdaptations":"Crisis de combustible y carbón mineral durante el invierno posguerra en Backlund."}
- **Anti-Exploit:** {"decay":0.2,"minCost":12,"variety":"COAL_GUILD_INTRUSION"}

### Opciones y Resultados Narrativos (narrativeOutcome):

#### Opcion: CHOICE_TELEPATH_8_SKIM_MEMORIES
- **Texto de la Opcion:** Leer con sigilo los nombres de los intermediarios en su memoria superficial sin alertarlos
- **Clave de Efecto (effectKey):** TELEPATH_EMPATHIC_RESONANCE
- **Costes:** {"spirituality":12}
- **Pesos:** {"alignment":1,"actingWeight":1}
- **Trade-offs:**
  - *Ganancia:* Información investigativa crítica y asimilación de Telépata
  - *Coste:* Riesgo de que un Beyonder protector sienta la intrusión mental
  - *Riesgo:* Jaqueca temporal por absorber datos mercantiles densos
- **narrativeOutcome:**
  > Tus tentáculos de conciencia rozan la superficie mental de los directores mercantiles, extrayendo las cifras de los barcos de carbón sin dejar huella. La información fluye con elegancia telepática y la poción se asimila con gozo intelectual.

#### Opcion: CHOICE_TELEPATH_8_CONFRONT_DIRECTOR
- **Texto de la Opcion:** Mirar fijamente al cabecilla y amenazarlo susurrando detalles que solo él conoce
- **Clave de Efecto (effectKey):** TELEPATH_RISKY_SOUL_TOUCH
- **Costes:** {"spirituality":10}
- **Pesos:** {"alignment":-0.8,"actingWeight":0.8}
- **Trade-offs:**
  - *Ganancia:* Aterroriza al culpable forzando una concesión inmediata
  - *Coste:* Delatas tu condición de Beyonder mental ante extraños
  - *Riesgo:* El gremio contrata sicarios de la Vía del Asesino para eliminarte
- **narrativeOutcome:**
  > Clavas la mirada en el presidente del gremio y proyectas un murmullo de acusación directa en su mente. El hombre palidece y accede aterrorizado, pero su guardia privada nota tu postura fija y memoriza tu silueta para cazar al hechicero.

---

## DIL_VISIONARY_8_3 — La Pesadilla del Niño Huérfano
- **Via:** VISIONARY
- **Secuencia:** 8
- **Situacion:** En un orfanato de caridad patrocinado por la Iglesia de Steam, un niño huérfano de guerra grita en sueños proyectando terrores que perturban el descanso de toda la sala.
- **Confianza Canonica:** library
- **Nota de Derivacion:** {"source":"pathway_events:EV_VISIONARY_DESTINO_19","eraAdaptations":"Orfanatos abarrotados por hijos de conscriptos fallecidos en el conflicto de los dioses."}
- **Anti-Exploit:** {"decay":0.25,"minCost":12,"variety":"ORPHAN_NIGHTMARE_SOOTHE"}

### Opciones y Resultados Narrativos (narrativeOutcome):

#### Opcion: CHOICE_TELEPATH_8_PACIFY_EMOTIONAL
- **Texto de la Opcion:** Extender una onda de apaciguamiento telepático directo para disolver el pánico en su mente
- **Clave de Efecto (effectKey):** TELEPATH_PACIFY_MINDS
- **Costes:** {"spirituality":12}
- **Pesos:** {"alignment":1,"actingWeight":1}
- **Trade-offs:**
  - *Ganancia:* Alta asimilación de la poción de Telépata por aliviar el sufrimiento psíquico
  - *Coste:* Gasto considerable de espiritualidad y fatiga empática
  - *Riesgo:* Riesgo de absorción involuntaria y filtración del trauma bélico hacia tu propia psique
- **narrativeOutcome:**
  > Sincronizas tu respiración con la suya y proyectas un bálsamo de calma psíquica que disuelve el nudo de terror en su pecho. El niño afloja las manos y duerme plácidamente, pero un eco sordo de metralla resuena en tus sienes: has cargado con parte de su espanto.

#### Opcion: CHOICE_TELEPATH_8_CLINICAL_OBSERVE
- **Texto de la Opcion:** Permanecer en penumbra analizando clínicamente el patrón de espasmos y proyecciones del terror
- **Clave de Efecto (effectKey):** SPECTATOR_QUIET_ANALYSIS
- **Costes:** {"spirituality":5}
- **Pesos:** {"alignment":0.5,"actingWeight":0.8}
- **Trade-offs:**
  - *Ganancia:* Obtención de conocimiento profundo sobre la anatomía del trauma en la mente infantil
  - *Coste:* Cero intervención compasiva
  - *Riesgo:* Riesgo de daño psicológico prolongado y convulsiones febriles para el huérfano
- **narrativeOutcome:**
  > Observas inmóvil desde el vano de la puerta, registrando cada contracción de sus párpados y la cadencia de sus quejidos. Desentrañas los mecanismos del miedo con frialdad científica, asimilando datos invaluables mientras el huérfano gime exhausto hasta el amanecer.

#### Opcion: CHOICE_TELEPATH_8_INSTITUTIONAL_CARE
- **Texto de la Opcion:** Avisar a la enfermera de guardia para que aplique el protocolo institucional de sedantes
- **Clave de Efecto (effectKey):** TELEPATH_SHIELD_EGO
- **Costes:** {"spirituality":0}
- **Pesos:** {"alignment":0.2,"actingWeight":0.4}
- **Trade-offs:**
  - *Ganancia:* Resolución externa reglamentaria sin exponerte ante la institución
  - *Coste:* Digestión mínima de la poción por delegar la acción mística
  - *Riesgo:* Efectos secundarios nocivos del bromuro y láudano en la salud del menor
- **narrativeOutcome:**
  > Avisas a la monja de guardia y contemplas cómo fuerzan al niño a tragar una cucharada de jarabe amargo. El infante queda aletargado en un estupor químico; preservas tu reserva espiritual y la neutralidad civil, pero el procedimiento deja un rastro de frialdad estéril.

---

## DIL_VISIONARY_8_4 — El Interrogatorio del Inspector de MI9
- **Via:** VISIONARY
- **Secuencia:** 8
- **Situacion:** Un agente del Servicio de Inteligencia Militar (MI9) te cita como testigo de una explosión en una imprenta. Notas que el agente intenta leer tus microreacciones.
- **Confianza Canonica:** library
- **Nota de Derivacion:** {"source":"pathway_events:EV_VISIONARY_ORGANIZACIÓN_12","eraAdaptations":"Interrogatorios de MI9 en Backlund vigilando infiltrados de Feysac e Intis (1353)."}
- **Anti-Exploit:** {"decay":0.3,"minCost":15,"variety":"MI9_SURFACE_DUEL"}

### Opciones y Resultados Narrativos (narrativeOutcome):

#### Opcion: CHOICE_TELEPATH_8_PROJECT_FALSE_THOUGHT
- **Texto de la Opcion:** Construir una capa superficial de pensamientos triviales sobre deudas y frío para engañar su sondeo
- **Clave de Efecto (effectKey):** TELEPATH_EMPATHIC_RESONANCE
- **Costes:** {"spirituality":18}
- **Pesos:** {"alignment":1,"actingWeight":1}
- **Trade-offs:**
  - *Ganancia:* Triunfo absoluto en el contraespionaje mental y progreso de vía
  - *Coste:* Doble esfuerzo cognitivo: sostener la mentira mental mientras respondes
  - *Riesgo:* Si el inspector posee artefactos de detección de mentiras puede notar la barrera
- **narrativeOutcome:**
  > Edificas una muralla de pensamientos anodinos sobre precios de carbón y alquileres atrasados que confunden la sonda del inspector de MI9. El oficial no halla nada sospechoso y firma el pase; tu maestría en escudos cognitivos se consolida magistralmente.

#### Opcion: CHOICE_TELEPATH_8_PANIC_CONFESS
- **Texto de la Opcion:** Romper el contacto visual y titubear fingiendo ignorancia de forma torpe
- **Clave de Efecto (effectKey):** TELEPATH_INTERROGATION_BLUNDER
- **Costes:** {"spirituality":0}
- **Pesos:** {"alignment":-1,"actingWeight":0.9}
- **Trade-offs:**
  - *Ganancia:* Evitas el choque psíquico frontal contra el oficial
  - *Coste:* Pérdida de dignidad de Telépata y sospecha policial aumentada
  - *Riesgo:* El inspector abre un expediente formal de seguimiento sobre ti
- **narrativeOutcome:**
  > Bajas la mirada y respondes con titubeos contradictorios que hacen sonar las alarmas del inquisidor militar. El expediente queda abierto y los agentes toman nota de tu domicilio; la poción de Telépata sufre la humillación del engaño fallido.

---

