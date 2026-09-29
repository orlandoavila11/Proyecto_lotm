# HUMAN_REVIEW_07.md — COLA DE APROBACIÓN DEL DIRECTOR (BRIEF-07)

**Fecha:** 11 de Septiembre, 2026  
**Época Canónica:** POST-LOTM · PRE-COI (~1353 Quinta Época, ~1 año post-Guerra de los Dioses)  
**Autoridad:** Director Humano

---

## 1. COMPILACIÓN DE COMBATIENTES HALCONES NOCTURNOS (VÍA DARKNESS / POOL RIVER)

Se compilaron 3 combatientes inquisitoriales en `reborn/data/gameplay/combatants/combatants.json` bajo la vía `DARKNESS` y séfira `DEATH_CLUSTER` (`river_of_eternal_darkness`).

> [!NOTE]
> **Coherencia de Era y Restricción de Pool:**
> El pool RIVER entra al bestiario exclusivamente como fuerza de choque institucional (la mano ejecutora de la Iglesia de la Noche en Backlund), **NO como vía jugable**.

### A. Patrullero Sin Sueño (`nighthawk_sleepless_patrol`)
- **Secuencia / Rango:** Secuencia 9 Sin Sueño (Sleepless).
- **Rol Táctico:** Escaramuzador de vanguardia y centinela anti-sigilo.
- **Estadísticas:** HP 50/50, Espiritualidad 40/40, AP 3, Velocidad 9.
- **Habilidad 1:** `ABILITY_NIGHTHAWK_REVOLVER_PURIFYING`
  - *Nombre:* Disparo Purificador de Plata
  - *Átomo:* `ATOM_DAMAGE_PHYSICAL` (baseDamage: 15). Rango 4.
  - *Nota:* Munición de plata grabada con runas solares/nocturnas, estándar reglamentario de la policía especial.
- **Habilidad 2:** `ABILITY_NIGHTHAWK_VIGILANT_GLARE`
  - *Nombre:* Mirada Vigilante de Medianoche
  - *Átomos:* `ATOM_REMOVE_STATUS` (status: `CONCEALED`) + `ATOM_APPLY_STATUS` (status: `WEAKENED`, duration: 2).
  - *Nota:* Visión espiritual hiperalerta que detecta sombras y disipa sigilo místico.

### B. Poeta de Medianoche (`nighthawk_midnight_poet`)
- **Secuencia / Rango:** Secuencia 8 Poeta de Medianoche (Midnight Poet).
- **Rol Táctico:** Invocador de control mental y daño directo al cuerpo astral.
- **Estadísticas:** HP 55/55, Espiritualidad 65/65, AP 3, Velocidad 8.
- **Habilidad 1:** `ABILITY_NIGHTHAWK_POETIC_SOOTHING`
  - *Nombre:* Cántico Somnífero de Medianoche
  - *Átomos:* `ATOM_APPLY_STATUS` (status: `STUN`, duration: 1) + `ATOM_DAMAGE_SPIRITUAL` (baseDamage: 10). Rango 4.
  - *Nota:* Poemas fúnebres recitados que inducen sopor espiritual en los agresores.
- **Habilidad 2:** `ABILITY_NIGHTHAWK_REQUIEM_PROJECTION`
  - *Nombre:* Réquiem Carmesí
  - *Átomo:* `ATOM_DAMAGE_SPIRITUAL` (baseDamage: 18). Rango 3.
  - *Nota:* Descarga litúrgica que castiga directamente el cuerpo astral de los transgresores.

### C. Capitán Ejecutor (`nighthawk_squad_captain`)
- **Secuencia / Rango:** Secuencia 8 Veterano / Oficial al mando de escuadra.
- **Rol Táctico:** Supresor táctico de alto impacto y arresto forzoso.
- **Estadísticas:** HP 65/65, Espiritualidad 75/75, AP 3, Velocidad 10.
- **Habilidad 1:** `ABILITY_NIGHTHAWK_CEREMONIAL_CANON`
  - *Nombre:* Decreto del Silencio Nocturno
  - *Átomos:* `ATOM_APPLY_STATUS` (status: `WEAKENED`, duration: 2) + `ATOM_APPLY_STATUS` (status: `FEAR`, duration: 2). Rango 4.
  - *Nota:* Intimidación eclesiástica ceremonial que quiebra la determinación del hereje.
- **Habilidad 2:** `ABILITY_NIGHTHAWK_EXECUTION_STRIKE`
  - *Nombre:* Castigo Sombrío Penitencial
  - *Átomo:* `ATOM_DAMAGE_PHYSICAL` (baseDamage: 22). Rango 2.
  - *Nota:* Procedimiento de neutralización letal a quemarropa durante allanamientos de refugio.

---

## 2. AVISO DIEGÉTICO DE INCURSIÓN AL REFUGIO (`church_suspicion > 60`)

Cuando la sospecha eclesiástica de la persona activa supera el umbral crítico de 60, los Halcones Nocturnos ejecutan un allanamiento forzoso. El jugador recibe el siguiente aviso diegético previo a la inicialización de la batalla táctica:

```
[AVISO DIEGÉTICO · ALLANAMIENTO ECLESIÁSTICO]
"Un golpe seco y pesado retumba contra la puerta reforzada de tu refugio. Entre las rendijas carcomidas del marco se filtra un perfume helado a lavanda, serenidad y noche profunda. 
Los latidos de tu corazón se aceleran cuando una voz pausada, severa y sin titubeos corta la quietud del callejón:

'Abra en nombre de la Policía Especial del Buró de Backlund y la Sagrada Catedral de San Samuel. Sabemos exactamente qué secretos y perturbaciones esconde tras ese cerrojo.'

Sombras armadas con gabardinas negras y revólveres de plata rodean las salidas. El tiempo del disimulo ha terminado."
```

### Mecánica de Resolución de la Incursión:
- Si el jugador triunfa en el combate táctico contra la escuadra o logra huir/reubicar su refugio:
  - Se purgan **-35 puntos de `church_suspicion`** (la célula atacante ha sido neutralizada o despistada temporalmente, forzando a la Iglesia a reorganizar su red de informantes).
  - Se añade un log diegético de escape o victoria clandestina.
