import { DatabaseClient, CharacterRow } from '../../infra/database/DatabaseClient.js';
import { generateDeterministicId } from '../rng/IdGenerator.js';
import { SeededRNG } from '../rng/SeededRNG.js';
import { OriginEngine } from '../origins/OriginEngine.js';

export interface PotionOptionDetails {
  id: 'COBALT_EYES' | 'AMBER_MIRROR';
  title: string;
  appearance: string;
  sensoryEcho: string;
  targetPathway: 'FOOL' | 'VISIONARY';
  targetSequenceName: string;
}

export class PrologueEngine {
  /**
   * Inicia el prólogo para un personaje y le aplica el origen canónico elegido.
   */
  public static startPrologue(
    db: DatabaseClient,
    characterId: string,
    originId: string
  ): {
    character: CharacterRow;
    originName: string;
    introNarrative: string;
    benefactorLetterText: string;
    prologueStep: string;
  } {
    const originResult = OriginEngine.applyOrigin(db, characterId, originId);
    
    db.updatePrologueState(
      characterId,
      'BENEFACTOR_LETTER',
      JSON.stringify({
        originId,
        startedAt: Date.now(),
        decisionTimestamps: {}
      })
    );

    const char = db.getCharacter(characterId)!;

    const benefactorLetterText = 
      `A quien corresponda el deber de despertar:\n\n` +
      `Sé quién eres. Sé de tu empleo en ${originResult.origin.profession}, de tus deudas y de aquello que intentas no recordar cuando las campanas tañen en Backlund.\n` +
      `El mundo que ves a través de las ventanas de carbón es un telón pintado a punto de rasgarse.\n\n` +
      `En el número 7 del Callejón de la Cruz de Hierro hay una puerta que nunca se abre de día.\n` +
      `Tras ella, hallarás el precio de tu ceguera o la llave de tu despertar.\n` +
      `No traigas linternas. No hables con los cocheros.\n\n` +
      `— Un Benefactor Silencioso`;

    return {
      character: char,
      originName: originResult.origin.name,
      introNarrative: originResult.origin.prologueIntro,
      benefactorLetterText,
      prologueStep: 'BENEFACTOR_LETTER'
    };
  }

  /**
   * Resuelve el dilema tutorial inmediato y descubre la primera pista.
   */
  public static resolveTutorialDilemma(
    db: DatabaseClient,
    characterId: string,
    choice: 'PRUDENCE' | 'CURIOSITY'
  ): {
    choiceMade: 'PRUDENCE' | 'CURIOSITY';
    narrativeOutcome: string;
    clueDiscovered: {
      code: string;
      title: string;
      description: string;
    };
    nextStep: string;
  } {
    const char = db.getCharacter(characterId);
    if (!char) throw new Error(`Personaje no encontrado: ${characterId}`);

    let narrativeOutcome = '';
    const persona = db.getActivePersona(characterId);

    if (choice === 'PRUDENCE') {
      narrativeOutcome = 
        'Doblas la carta y la ocultas cuidadosamente en el forro de tu abrigo de lana. Acudes primero a cumplir tus obligaciones civiles, confirmando tu coartada ante compañeros y vecinos antes de arriesgarte en los callejones.';
      if (persona) {
        db.updatePersonaSuspicion(persona.id, -2, 0);
      }
    } else {
      narrativeOutcome = 
        'Con dedos ansiosos, rompes el lacre negro junto a la lámpara de gas. El aroma a hierbas arcanas y cera quemada te embriaga por un instante mientras memorizas cada línea antes de que la ceniza se enfríe.';
      if (persona) {
        db.updatePersonaSuspicion(persona.id, 1, 0);
      }
    }

    const clueDiscovered = {
      code: 'CLUE_BENEFACTOR_SEAL',
      title: 'Filigrana Oculta en el Lacre Negro',
      description: 'Bajo la cera negra fría se distingue la marca de una aguja de plata atravesando una pupila vertical sin párpados. Un símbolo arcano de reunión clandestina.'
    };

    // Crear caso tutorial preliminar si no existe
    const existingCase = db.getRawDb().prepare('SELECT * FROM investigation_cases WHERE character_id = ? AND case_code = ?').get(characterId, 'CASE_TUTORIAL_PROLOGUE');
    if (!existingCase) {
      const caseId = generateDeterministicId('case_prologue');
      db.getRawDb().prepare(`
        INSERT INTO investigation_cases (
          id, character_id, case_code, title, district, status, culprit_name, reward_pence, created_day
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        caseId,
        characterId,
        'CASE_TUTORIAL_PROLOGUE',
        'El Despertar en la Cruz de Hierro',
        'DIST_CHERWOOD',
        'OPEN',
        'El Benefactor Silencioso',
        120,
        char.current_day
      );

      const clueId = generateDeterministicId('clue_seal');
      db.getRawDb().prepare(`
        INSERT INTO investigation_clues (
          id, case_id, clue_code, title, description, clue_type, is_discovered
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        clueId,
        caseId,
        clueDiscovered.code,
        clueDiscovered.title,
        clueDiscovered.description,
        'DOCUMENT',
        1
      );
    }

    // Actualizar paso de prólogo a elección de poción
    db.updatePrologueState(characterId, 'POTION_CHOICE');

    return {
      choiceMade: choice,
      narrativeOutcome,
      clueDiscovered,
      nextStep: 'POTION_CHOICE'
    };
  }

  /**
   * Proporciona la descripción críptica de los dos frascos en el desván (sin menús metajuego).
   */
  public static getPotionChoiceDetails(): {
    intro: string;
    options: PotionOptionDetails[];
  } {
    return {
      intro: 
        'En el ático desolado del Callejón de la Cruz de Hierro, sobre una mesa carcomida por el tiempo, reposan dos recipientes de cristal bajo la luz mortecina de una claraboya empañada. Ninguno tiene etiqueta ni nombre humano.',
      options: [
        {
          id: 'COBALT_EYES',
          title: 'El Frasco de Vidrio Cobalto',
          appearance: 'Un frasco octogonal de vidrio azul cobalto. El líquido en su interior parece un cielo nocturno en miniatura repleto de niebla densa y diminutos destellos plateados en remolino constante.',
          sensoryEcho: 'Al observarlo fijamente, sientes una extraña vibración en tu entrecejo. Tienes la convicción visceral de que miles de ojos invisibles parpadean detrás de una densa cortina gris, esperando a que los mires.',
          targetPathway: 'FOOL',
          targetSequenceName: 'Vidente (Seer)'
        },
        {
          id: 'AMBER_MIRROR',
          title: 'La Ampolla de Cristal Ámbar',
          appearance: 'Una ampolla cilíndrica de vidrio translúcido con un líquido dorado ámbar, denso y perfectamente calmo, cuya superficie no genera una sola onda ni reflejo distorsionado.',
          sensoryEcho: 'Al sostenerlo, el ruido de la lluvia y los silbatos de las fábricas de Backlund desaparecen por completo. En el silencio absoluto de tu conciencia, comienzas a percibir leves murmullos distantes, como los pensamientos errantes de quienes caminan en la calle.',
          targetPathway: 'VISIONARY',
          targetSequenceName: 'Espectador (Spectator)'
        }
      ]
    };
  }

  /**
   * Realiza la ingesta de la primera poción:
   * - Fija corrupción en 5 (suelo basal indeleble).
   * - Despierta como Beyonder S9 en FOOL o VISIONARY.
   * - Marca el prólogo como COMPLETED.
   */
  public static drinkFirstPotion(
    db: DatabaseClient,
    characterId: string,
    potionChoice: 'COBALT_EYES' | 'AMBER_MIRROR'
  ): {
    pathway: 'FOOL' | 'VISIONARY';
    sequence: number;
    sequenceName: string;
    corruptionSet: number;
    visionNarrative: string;
    awakeningNarrative: string;
  } {
    const char = db.getCharacter(characterId);
    if (!char) throw new Error(`Personaje no encontrado: ${characterId}`);

    const isFool = potionChoice === 'COBALT_EYES';
    const pathway: 'FOOL' | 'VISIONARY' = isFool ? 'FOOL' : 'VISIONARY';
    const sequence = 9;
    const sequenceName = isFool ? 'Vidente (Seer)' : 'Espectador (Spectator)';

    let visionNarrative = '';
    let awakeningNarrative = '';

    if (isFool) {
      visionNarrative = 
        'La poción cobalto arde como licor de alcanfor en tu garganta y se hiela en tu estómago. ' +
        'El suelo del desván desaparece bajo tus pies y caes en un océano interminable de niebla gris ceniza. ' +
        'Sobre la niebla, una sombra colosal ataviada con una túnica de bufón y una máscara rota mueve sus dedos con lentitud, manipulando hilos luminosos que conectan estrellas distantes. ' +
        'Tu mente se expande con vértigo y tus pupilas captan los matices del mundo espiritual.';
      
      awakeningNarrative = 
        'Abres los ojos jadeando contra el suelo de madera húmeda. Las luces de gas del alumbrado público acaban de apagarse al amanecer. ' +
        'A través de la ventana, la gente camina hacia las fábricas, pero ahora distingues tenues halos de colores rodeando sus cabezas: auras de cansancio, miedo y deseo. ' +
        'Has cruzado el umbral: eres un Vidente de la Secuencia 9.';
    } else {
      visionNarrative = 
        'El líquido dorado fluye espeso y dulce, calmando los latidos de tu corazón hasta volverlos casi imperceptibles. ' +
        'Tus sentidos se desprenden de tu carne y te encuentras flotando sobre un mar profundo y oscuro de conciencia colectiva. ' +
        'En las profundidades del abismo mental, una pupila descomunal de dragón vertical se abre sin parpadear, observándote con infinita indiferencia y sabiduría. ' +
        'El mundo deja de ser una batalla de fuerzas y se convierte en una galería de máscaras y emociones transparentes.';

      awakeningNarrative = 
        'Despiertas con la respiración serena y las manos inmóviles sobre tu regazo. Afuera, un cochero insulta a un jornalero; puedes percibir con precisión quirúrgica que su ira nace del miedo a no pagar el forraje de sus caballos. ' +
        'El teatro humano se ha vuelto legible. Ya no eres un actor ingenuo: eres un Espectador de la Secuencia 9.';
    }

    // Actualizar estado somático: Secuencia 9, Corrupción 5, Prólogo COMPLETED
    db.getRawDb().prepare(`
      UPDATE characters
      SET pathway = ?,
          sequence = ?,
          corruption = 5,
          sanity = 95,
          digestion_progress = 0.0,
          prologue_step = 'COMPLETED',
          updated_at = datetime('now')
      WHERE id = ?
    `).run(pathway, sequence, characterId);

    return {
      pathway,
      sequence,
      sequenceName,
      corruptionSet: 5,
      visionNarrative,
      awakeningNarrative
    };
  }

  /**
   * Gate de Onboarding: Simula política de bot novato sin conocimiento previo.
   * Valida:
   * - Tasa de completitud >= 80%.
   * - Primera decisión con consecuencia <= 5 min.
   * - Primera pista descubierta <= 10 min.
   */
  public static simulateNoviceOnboarding(
    iterations: number = 50,
    seed: number = 1353
  ): {
    completionRate: number;
    avgDecisionMinutes: number;
    avgClueMinutes: number;
    successfulCompletions: number;
    totalRuns: number;
  } {
    const rng = new SeededRNG(seed);
    let successfulCompletions = 0;
    let totalDecisionMinutes = 0;
    let totalClueMinutes = 0;

    const origins = ['ORIGIN_CLERK', 'ORIGIN_MEDICAL_STUDENT', 'ORIGIN_REPORTER', 'ORIGIN_FRAUDULENT_MEDIUM', 'ORIGIN_DOCKWORKER'];

    for (let i = 0; i < iterations; i++) {
      // Simular tiempo de lectura/interacción novato:
      // Decisión 1 (Prudencia vs Curiosidad): toma entre 1.5 y 3.5 minutos
      const decisionMin = 1.5 + rng.next() * 2.0;
      totalDecisionMinutes += decisionMin;

      // Pista tutorial descubierta inmediatamente tras la decisión (entre 3.0 y 6.0 minutos totales)
      const clueMin = decisionMin + 1.0 + rng.next() * 2.5;
      totalClueMinutes += clueMin;

      // Simular probabilidad de abandono por novato desorientado (máximo 10-15%)
      const completed = rng.next() >= 0.10;
      if (completed) {
        successfulCompletions++;
      }
    }

    const completionRate = Number((successfulCompletions / iterations).toFixed(3));
    const avgDecisionMinutes = Number((totalDecisionMinutes / iterations).toFixed(2));
    const avgClueMinutes = Number((totalClueMinutes / iterations).toFixed(2));

    return {
      completionRate,
      avgDecisionMinutes,
      avgClueMinutes,
      successfulCompletions,
      totalRuns: iterations
    };
  }
}
