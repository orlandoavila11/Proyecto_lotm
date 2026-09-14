# PROTOCOLO DE TESTEO HUMANO CIEGO · GATE G4
## Path to Godhood — Vertical Slice Honesto (Fase 1)

---

### 1. RECLUTAMIENTO Y PERFIL DE LOS 3 TESTERS CIEGOS

Para asegurar una auditoría honesta de la experiencia de juego, los 3 evaluadores deben cumplir con la condición de **testeo ciego** (sin conocimiento del código fuente, del Truth Model del Caso Cherwood ni de los sistemas numéricos de balance):

- **Tester Alpha (Perfil Narrativo / RPG de Mesa):** Familiarizado con ficción victoriana o Lovecraft/Cthulhu. Criterio de foco: inmersión diegética, impacto de las cartas del Benefactor, comprensión del misterio sin números.
- **Tester Beta (Perfil Mecánico / Estrategia):** Acostumbrado a juegos de gestión de recursos y deducción (Return of the Obra Dinn, Sunless Sea). Criterio de foco: equilibrio entre jornada laboral, sumideros económicos y franjas horarias.
- **Tester Gamma (Perfil Novato / Lector Canónico LOTM):** Conoce la novela o llega atraído por la fantasía de la doble vida beyonder. Criterio de foco: fricción en el onboarding, claridad de los principios de actuación de Vía y tiempo de vacilación en el Primer Trago.

---

### 2. ESTRUCTURA TEMPORAL DE LA SESIÓN (90 MINUTOS)

| Franja | Minutos | Objetivo Operativo | Telemetría Registrada |
| :--- | :--- | :--- | :--- |
| **Fase 1: Onboarding y Despertar** | 00:00 – 15:00 | Prólogo diegético: Selección de Origen canónico, lectura de la carta lacrada del Benefactor, dilema del zaguán y El Trago S9. | Embudo de prólogo, tiempo de lectura, hesitación ante el cáliz (`potionDrinkHesitationMs`). |
| **Fase 2: El Desván y Doble Vida** | 15:00 – 40:00 | Inspección del escritorio: vela de sebo, espejo de azogue, grietas del marco, asistencia al trabajo civil, cobro de salario y primer dilema actoral. | Decisiones en espejo, cambios en tiers somáticos, balance de la billetera y anclas consultadas. |
| **Fase 3: El Caso Cherwood** | 40:00 – 75:00 | Apertura del corcho de hilos: investigación de *El Eco en el Nido Vacío*. Visita a fuentes de pistas según vector de vía (FOOL o VISIONARY). | Pistas accedidas, rechazos por gating de vía/agenda, conexiones de pistas formuladas. |
| **Fase 4: Deliberación y Clímax** | 75:00 – 80:00 | Elección de resolución del caso (Justicia oficial, Verdad eclesiástica, Estabilidad o Heredero) o interacción con el bazar clandestino. | Veredicto final emitido, consecuencias en sospecha y fin de la sesión de juego. |
| **Fase 5: Entrevista Post-Mortem** | 80:00 – 90:00 | Cuestionario ciego de 10 minutos con el Director / Facilitador. | Transcripción de respuestas cualitativas y reporte G4. |

---

### 3. CUESTIONARIO DE ENTREVISTA CIEGA (10 MINUTOS)

El facilitador no explica mecánicas ni asiste al jugador; se limita a formular las siguientes 5 preguntas al término de la sesión:

1. **Comprensión Somática Sin Cifras:**
   - *"Cuando miraste la vela sobre tu mesa y el reflejo en el espejo de azogue, ¿qué entendiste que le estaba ocurriendo a tu cuerpo y a tu cordura?"*
   - *Criterio de éxito:* El tester identifica el peligro de colapso mental y pérdida de humanidad a través de las metáforas visuales (llama vacilante, reflejo desfasado, marco agrietado) sin demandar porcentajes o barras de HP.

2. **Tensión de la Doble Vida:**
   - *"¿Sentiste el conflicto entre asistir a tu empleo civil en Backlund y utilizar las franjas horarias para tus asuntos sobrenaturales?"*
   - *Criterio de éxito:* El tester reporta ansiedad real por el tiempo escaso, la necesidad de pagar deudas o el riesgo de perder el empleo.

3. **El Dilema del Primer Trago:**
   - *"Cuando viste los frascos en el zaguán y leíste las advertencias del Benefactor, ¿qué te hizo dudar antes de beber?"*
   - *Criterio de éxito:* Correlación cualitativa con el tiempo de hesitación registrado en la telemetría (`hesitationMs`).

4. **La Verdad de Cherwood:**
   - *"Al descubrir el secreto del Dr. Avery Sterling y los huérfanos, ¿cuál fue tu motivación para elegir esa resolución?"*
   - *Criterio de éxito:* La decisión responde a un juicio moral genuino (piedad, deber, autopreservación) y no a la optimización de un stat matemático.

5. **Fricciones y Vacíos Diegéticos:**
   - *"¿Hubo algún momento donde te sentiste desorientado o donde la interfaz rompió la atmósfera victoriana?"*
   - *Criterio de éxito:* Registro exhaustivo de fricciones para retroalimentar la lista del Director.

---

### 4. CRITERIOS FORMALES DE APROBACIÓN (GATE G4)

- **G4.1:** $3 / 3$ evaluadores completan el Prólogo e inician su doble vida en $\le 15$ minutos.
- **G4.2:** $\ge 2 / 3$ evaluadores interpretan con exactitud el estado somático y el riesgo de locura a través del Desván diegético.
- **G4.3:** Cero crashes fatales de UI y cero bloqueos irreversibles (dead-ends) en la resolución del Caso #1.
- **G4.4:** Generación exitosa del archivo de telemetría Markdown y JSON (`SessionTelemetry`) para cada sesión.
