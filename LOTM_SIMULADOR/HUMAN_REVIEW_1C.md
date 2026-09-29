# COLA DE CURADURÍA 1C — SUSURROS [S] Y HABILIDADES DEL JUGADOR
**Autoridad:** Director Canónico
**Objetivo:** Auditoría exhaustiva de opciones de susurro [S] emergentes por corrupción y habilidades de combate del jugador (FOOL y VISIONARY, Secuencias 9 y 8).

---

## 1. SUSURROS CORRUPTOS [S] (CONDICIONAL CORRUPCIÓN >= 30)

### Dilema: DIL_FOOL_9_1 — El Presagio de la Flota de Bayam
- **Vía:** FOOL (Secuencia 9: Seer)
- **Umbral de Activación:** Corrupción $\ge 30$ (Gating estricto vía SomaticsEngine)
- **Opción [S]:** `CHOICE_FOOL_9_WHISPER_FOG`
- **Texto:** `[SUSURRO DE LA NIEBLA] Murmurar un sortilegio sellado prometiendo calmar los mares a cambio del alma y devoción perpetua del comerciante`
- **Trade-offs:**
  - *Ganancia:* Devoción absoluta y tributo monetario masivo
  - *Coste:* Resonancia corrupta incontrolable y fractura del velo mental
  - *Riesgo:* Corrupción ontológica profunda y atracción de miradas del vacío
- **Pesos:** `{"alignment": -1, "actingWeight": 0.5}`
- **Costes:** `{"spirituality": 20}`
- **Clave de Efecto (effectKey):** `SEER_FALSEHOOD_TRANSGRESSION`
- **narrativeOutcome:**
  > Las pupilas del comerciante se dilatan en sumisión hipnótica mientras sombras amorfas reptan por el tapete del tarot. La niebla susurra promesas en tu mente; has cruzado un umbral del que ningún Vidente cuerdo regresa intacto.

---

## 2. HABILIDADES DE COMBATE DEL JUGADOR (PLAYER_ABILITIES_G)

### VÍA FOOL (EL LOCO) — SECUENCIA 9: SEER
1. **PLAYER_FOOL_9_SPIRIT_VISION**
   - **Nombre:** Visión Espiritual & Adivinación Astral
   - **Confianza Canónica:** `canon` (directorApproved: true)
   - **Costes:** AP 0 (vía ATOM_ATTENTION_EXCHANGE) / Espiritualidad 10 / Rango 6 / SINGLE_ENEMY
   - **Composición:** `ATOM_SCRUTINIZE` (revealCount: 1), `ATOM_ATTENTION_EXCHANGE` (apCost: 1, attentionGained: 1)
   - **Nota de Derivación:** Canónica de la novela (seer.json). Apertura de visión espiritual para percibir el flujo astral.

2. **PLAYER_FOOL_9_TAROT_DIVINATION**
   - **Nombre:** Adivinación con Cartas de Tarot
   - **Confianza Canónica:** `canon` (directorApproved: true)
   - **Costes:** AP 2 / Espiritualidad 15 / Rango 5 / SINGLE_ENEMY
   - **Composición:** `ATOM_DAMAGE_SPIRITUAL` (baseDamage: 18), `ATOM_APPLY_STATUS` (WEAKENED, 2 turnos)
   - **Nota de Derivación:** Canónica de la novela (seer.json). Cartomancia ofensiva mística de Vidente.

3. **PLAYER_FOOL_9_DANGER_INTUITION**
   - **Nombre:** Intuición de Peligro Premonitoria
   - **Confianza Canónica:** `canon` (directorApproved: true)
   - **Costes:** AP 0 (vía ATOM_ATTENTION_EXCHANGE) / Espiritualidad 10 / Rango 1 / SELF
   - **Composición:** `ATOM_ATTENTION_EXCHANGE` (apCost: 1, attentionGained: 2), `ATOM_APPLY_STATUS` (CONCEALED, 1 turno)
   - **Nota de Derivación:** Canónica de la novela (seer.json). Premonición de peligro pasiva convertida en maniobra reactiva.

### VÍA FOOL (EL LOCO) — SECUENCIA 8: CLOWN
4. **PLAYER_FOOL_8_PAPER_PROJECTILE**
   - **Nombre:** Dagas de Papel Arrojadizas
   - **Confianza Canónica:** `canon` (directorApproved: true)
   - **Costes:** AP 2 / Espiritualidad 15 / Rango 5 / SINGLE_ENEMY
   - **Composición:** `ATOM_DAMAGE_PHYSICAL` (baseDamage: 24), `ATOM_DISPLACE_PUSH` (distance: 1, away)
   - **Nota de Derivación:** Canónica de la novela (seer.json - Paper Projectile Mastery). Papel templado que corta como metal quirúrgico.

5. **PLAYER_FOOL_8_ACROBATIC_TUMBLE**
   - **Nombre:** Salto y Finta Acrobática
   - **Confianza Canónica:** `canon` (directorApproved: true)
   - **Costes:** AP 1 / Espiritualidad 10 / Rango 2 / GRID_CELL
   - **Composición:** `ATOM_DISPLACE_MOVE` (maxDistance: 2), `ATOM_GAIN_AP` (amount: 1)
   - **Nota de Derivación:** Canónica de la novela (seer.json - Enhanced Agility, Balance & Coordination). Gimnasia táctica de Payaso.

6. **PLAYER_FOOL_8_STAGE_PERFORMANCE**
   - **Nombre:** Actuación Escénica del Payaso
   - **Confianza Canónica:** `library` (directorApproved: true)
   - **Costes:** AP 1 / Espiritualidad 12 / Rango 1 / SELF
   - **Composición:** `ATOM_REMOVE_STATUS` (FEAR), `ATOM_APPLY_STATUS` (BLESSING, 2 turnos)
   - **Nota de Derivación:** Máscara del Payaso; backlog: CONCEALED bloqueando observación enemiga como regla futura. Aprobada por el Director en 04.FIX.

### VÍA VISIONARY (VISIONARIO) — SECUENCIA 9: SPECTATOR
7. **PLAYER_VISIONARY_9_ACUTE_OBSERVATION**
   - **Nombre:** Observación Aguda y Calibración Psicológica
   - **Confianza Canónica:** `canon` (directorApproved: true)
   - **Costes:** AP 0 (vía ATOM_ATTENTION_EXCHANGE) / Espiritualidad 8 / Rango 6 / SINGLE_ENEMY
   - **Composición:** `ATOM_SCRUTINIZE` (revealCount: 1), `ATOM_ATTENTION_EXCHANGE` (apCost: 1, attentionGained: 1)
   - **Nota de Derivación:** Canónica de la novela (spectator.json). Observación pasiva para discernir intenciones y emociones.

8. **PLAYER_VISIONARY_9_EMOTION_READING**
   - **Nombre:** Lectura de Microexpresiones y Emociones
   - **Confianza Canónica:** `canon` (directorApproved: true)
   - **Costes:** AP 1 / Espiritualidad 15 / Rango 5 / SINGLE_ENEMY
   - **Composición:** `ATOM_SCRUTINIZE` (revealCount: 2), `ATOM_APPLY_STATUS` (WEAKENED, 2 turnos)
   - **Nota de Derivación:** Canónica de la novela (spectator.json). Análisis ocular que anticipa movimientos hostiles.

9. **PLAYER_VISIONARY_9_DISENGAGE**
   - **Nombre:** Desconexión y Retiro a la Platea
   - **Confianza Canónica:** `canon` (directorApproved: true)
   - **Costes:** AP 1 / Espiritualidad 10 / Rango 2 / GRID_CELL
   - **Composición:** `ATOM_DISPLACE_MOVE` (maxDistance: 2), `ATOM_APPLY_STATUS` (CONCEALED, 1 turno)
   - **Nota de Derivación:** Canónica de la novela (spectator.json). El Espectador abandona el escenario y se desvanece entre el público.

### VÍA VISIONARY (VISIONARY) — SECUENCIA 8: TELEPATHIST
10. **PLAYER_VISIONARY_8_MIND_SPIKE**
    - **Nombre:** Espina Mental Silenciosa
    - **Confianza Canónica:** `canon` (directorApproved: true)
    - **Costes:** AP 2 / Espiritualidad 20 / Rango 5 / SINGLE_ENEMY
    - **Composición:** `ATOM_DAMAGE_SPIRITUAL` (baseDamage: 26), `ATOM_APPLY_STATUS` (STUN, 1 turno)
    - **Nota de Derivación:** Canónica de la novela (spectator.json). Ataque telepático invisible que perfora la conciencia.

11. **PLAYER_VISIONARY_8_PACIFY**
    - **Nombre:** Pacificación Psíquica
    - **Confianza Canónica:** `canon` (directorApproved: true)
    - **Costes:** AP 1 / Espiritualidad 16 / Rango 4 / SINGLE_ENEMY
    - **Composición:** `ATOM_REMOVE_STATUS` (FRENZY), `ATOM_APPLY_STATUS` (BLESSING, 2 turnos)
    - **Nota de Derivación:** Canónica de la novela (spectator.json). Calma forzada que aplaca la hostilidad del objetivo.

12. **PLAYER_VISIONARY_8_TELEPATHIC_AURA**
    - **Nombre:** Velo Telepático y Detección
    - **Confianza Canónica:** `canon` (directorApproved: true)
    - **Costes:** AP 0 (vía ATOM_ATTENTION_EXCHANGE) / Espiritualidad 15 / Rango 1 / SELF
    - **Composición:** `ATOM_ATTENTION_EXCHANGE` (apCost: 1, attentionGained: 2), `ATOM_APPLY_STATUS` (BLESSING, 1 turno)
    - **Nota de Derivación:** Canónica de la novela (spectator.json). Sentido telepático que anticipa todas las acciones enemigas.
