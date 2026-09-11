import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CanonicalPathwayId } from '../types/pathway.js';
import { DatabaseClient } from '../../infra/database/DatabaseClient.js';
import { DilemmaG } from '../../infra/content/schemas/dilemma.schema.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '../../..');

export interface ClientDilemmaOption {
  id: string;
  texto: string;
  costes: Record<string, any>;
  isWhisper?: boolean;
}

export interface ClientDilemma {
  id: string;
  title: string;
  situation: string;
  options: ClientDilemmaOption[];
}

export interface ActingChoice {
  id: string;
  label: string;
  description: string;
  isAlignedWithPrinciple: boolean;
  digestionGain: number;
  sanityDelta: number;
  policeSuspicionDelta: number;
  churchSuspicionDelta: number;
  penceReward: number;
  narrativeOutcome: string;
}

export interface ActingDilemma {
  id: string;
  pathway: CanonicalPathwayId;
  sequence: number;
  sequenceName: string;
  principleText: string;
  clientOrContext: string;
  situation: string;
  choices: ActingChoice[];
}

export class ActingDilemmaEngine {
  private static dilemmas: Map<string, ActingDilemma[]> = new Map();
  private static tierGDilemmas: Map<string, DilemmaG[]> = new Map();
  private static effectProfiles: Map<string, any> = new Map();
  private static initializedTierG: boolean = false;

  static {
    this.initAllCanonicalDilemmas();
  }

  private static addDilemma(d: ActingDilemma): void {
    const key = `${d.pathway}_${d.sequence}`;
    const existing = this.dilemmas.get(key) || [];
    existing.push(d);
    this.dilemmas.set(key, existing);
  }

  private static initAllCanonicalDilemmas(): void {
    // =========================================================================
    // 1. FOOL (Vidente, Payaso, Mago)
    // =========================================================================
    this.addDilemma({
      id: 'DIL_FOOL_9_1',
      pathway: 'FOOL',
      sequence: 9,
      sequenceName: 'Seer',
      principleText: 'El destino debe ser interpretado con respeto, pero sin sumisión ciega. Revela la verdad sin añadir falsas esperanzas.',
      clientOrContext: 'Club de Adivinación de Backlund - Calle Williams',
      situation: 'Un comerciante de ultramar te pide consultar las cartas del tarot sobre una flota mercante que zarpó de Bayam. Las cartas revelan naufragio inminente por temporal.',
      choices: [
        {
          id: 'CHOICE_FOOL_9_TRUTH',
          label: 'Interpretar la revelación con sobriedad y verdad',
          description: 'Explicas al comerciante el augurio exacto del naufragio sin exagerar ni ocultar la tragedia.',
          isAlignedWithPrinciple: true,
          digestionGain: 20.0,
          sanityDelta: 2,
          policeSuspicionDelta: 0,
          churchSuspicionDelta: 2,
          penceReward: 60,
          narrativeOutcome: 'El comerciante cancela sus contratos de carga. Dos días después la gaceta confirma el hundimiento. Tu espiritualidad fluye con armonía: has actuado como un verdadero Vidente.'
        },
        {
          id: 'CHOICE_FOOL_9_LIE',
          label: 'Suavizar el augurio para calmar al cliente',
          description: 'Le dices que habrá dificultades menores pero que la mercancía llegará a salvo.',
          isAlignedWithPrinciple: false,
          digestionGain: 2.0,
          sanityDelta: -5,
          policeSuspicionDelta: 0,
          churchSuspicionDelta: 0,
          penceReward: 60,
          narrativeOutcome: 'La poción hierve con disonancia mercurial en tu garganta: has violado la ley del Vidente mintiendo sobre el destino.'
        }
      ]
    });

    this.addDilemma({
      id: 'DIL_FOOL_8_1',
      pathway: 'FOOL',
      sequence: 8,
      sequenceName: 'Clown',
      principleText: 'Oculta tu angustia y desgarro interno tras una mueca pintada de risa. Haz reír a otros mientras soportas el peso del abismo.',
      clientOrContext: 'Circo Clandestino de Barrio Este - Backlund',
      situation: 'Durante un número acrobático, recuerdas una escena de muerte atroz. La locura aprieta tus sienes ante una multitud de niños.',
      choices: [
        {
          id: 'CHOICE_FOOL_8_SMILE',
          label: 'Pintar una mueca bufonesca y forzar la carcajada pública',
          description: 'Canalizas el horror en una caída cómica, arrancando risas ruidosas al auditorio.',
          isAlignedWithPrinciple: true,
          digestionGain: 22.0,
          sanityDelta: 5,
          policeSuspicionDelta: 0,
          churchSuspicionDelta: 0,
          penceReward: 36,
          narrativeOutcome: 'Los aplausos estallan. Bajo el maquillaje blanco y rojo, tus músculos tiemblan, pero la poción de Payaso se absorbe con voracidad.'
        }
      ]
    });

    // =========================================================================
    // 2. RED PRIEST (Cazador, Provocador, Pirómano)
    // =========================================================================
    this.addDilemma({
      id: 'DIL_RED_PRIEST_9_1',
      pathway: 'RED_PRIEST',
      sequence: 9,
      sequenceName: 'Hunter',
      principleText: 'Conoce la debilidad biológica de tu presa. El cazador no carga a ciegas; embosca y rastrea pacientemente.',
      clientOrContext: 'Taberna del Jabalí Herido - Muelles de Backlund',
      situation: 'Un contrabandista armado ha estafado a tu socio civil. Se oculta en un almacén cerca del río Tussock.',
      choices: [
        {
          id: 'CHOICE_HUNTER_9_TRACK',
          label: 'Rastrear sus puntos de fuga y emboscarlo con trampas en la niebla',
          description: 'Estudias sus movimientos, cortas las lámparas de carburo y lo aíslas en un callejón ciego.',
          isAlignedWithPrinciple: true,
          digestionGain: 20.0,
          sanityDelta: 1,
          policeSuspicionDelta: 4,
          churchSuspicionDelta: 0,
          penceReward: 240,
          narrativeOutcome: 'El contrabandista cae en tu lazo de alambre de cobre. La poción ardiente de Cazador ruge con vigor en tus venas.'
        },
        {
          id: 'CHOICE_HUNTER_9_RUSH',
          label: 'Patear la puerta principal del almacén a los gritos y batirse a tiros a ciegas',
          description: 'Cargas frontalmente sin estudiar el terreno ni asegurar las rutas de escape.',
          isAlignedWithPrinciple: false,
          digestionGain: 2.0,
          sanityDelta: -4,
          policeSuspicionDelta: 10,
          churchSuspicionDelta: 2,
          penceReward: 120,
          narrativeOutcome: 'El contrabandista escapa por una trampilla y la policía acude al tiroteo. Has violado la prudencia del Cazador; la poción arde con disonancia.'
        }
      ]
    });

    this.addDilemma({
      id: 'DIL_RED_PRIEST_8_1',
      pathway: 'RED_PRIEST',
      sequence: 8,
      sequenceName: 'Provoker',
      principleText: 'La lengua es un estilete envenenado. Desestabiliza el orgullo del enemigo hasta que cometa un error fatal.',
      clientOrContext: 'Club de Caballeros de Loen - Distrito de Cherwood',
      situation: 'Un rival aristocrático intenta arruinar tu cobertura civil acusándote de fraude ante posibles clientes influyentes.',
      choices: [
        {
          id: 'CHOICE_HUNTER_8_TAUNT',
          label: 'Desmantelar su honor con burlas punzantes calculadas',
          description: 'Mencionas en voz alta sus deudas secretas de juego con una sonrisa desdeñosa, haciéndole perder el control en público.',
          isAlignedWithPrinciple: true,
          digestionGain: 22.0,
          sanityDelta: 2,
          policeSuspicionDelta: -2,
          churchSuspicionDelta: 0,
          penceReward: 100,
          narrativeOutcome: 'El aristócrata es expulsado del club por escándalo. La esencia de Provocador se funde con tu voluntad.'
        }
      ]
    });

    // =========================================================================
    // 3. WHITE TOWER (Lector, Estudiante de Raciocinio, Detective)
    // =========================================================================
    this.addDilemma({
      id: 'DIL_WHITE_TOWER_9_1',
      pathway: 'WHITE_TOWER',
      sequence: 9,
      sequenceName: 'Reader',
      principleText: 'El conocimiento debe ser analizado, clasificado y verificado sin prejuicios ideológicos. La lectura es el portal de la verdad.',
      clientOrContext: 'Biblioteca Real de Backlund - Sala de Manuscritos Raros',
      situation: 'Descubres un texto apócrifo de la Cuarta Época que contradice la historia oficial de la Iglesia del Dios del Conocimiento sobre el Cataclismo.',
      choices: [
        {
          id: 'CHOICE_READER_9_STUDY',
          label: 'Copiar meticulosamente el manuscrito comparándolo con registros filológicos',
          description: 'Analizas la sintaxis y los sellos sin destruir el documento ni denunciarlo ciegamente.',
          isAlignedWithPrinciple: true,
          digestionGain: 20.0,
          sanityDelta: 2,
          policeSuspicionDelta: 0,
          churchSuspicionDelta: 3,
          penceReward: 50,
          narrativeOutcome: 'Comprendes las raíces lingüísticas ocultas. Tu intelecto se expande; la poción de Lector se absorbe en tus neuronas.'
        }
      ]
    });

    this.addDilemma({
      id: 'DIL_WHITE_TOWER_8_1',
      pathway: 'WHITE_TOWER',
      sequence: 8,
      sequenceName: 'Student of Ratiocination',
      principleText: 'Reconstruye la cadena de causalidad a partir de fragmentos dispersos. La lógica fría desmantela cualquier ilusión.',
      clientOrContext: 'Escena de un Crimen Ritual en Cherwood',
      situation: 'La policía sospecha de un vagabundo ebrio por el asesinato de un banquero. La disposición de la sangre sugiere una estafa geométrica.',
      choices: [
        {
          id: 'CHOICE_READER_8_DEDUCE',
          label: 'Demostrar mediante ángulos de impacto y balística la inocencia del vagabundo',
          description: 'Presentas una reconstrucción matemática del ángulo de disparo que señala al mayordomo.',
          isAlignedWithPrinciple: true,
          digestionGain: 22.0,
          sanityDelta: 3,
          policeSuspicionDelta: -3,
          churchSuspicionDelta: 0,
          penceReward: 120,
          narrativeOutcome: 'La verdad geométrica se impone. La mente del Estudiante de Raciocinio resuena con la armonía del orden lógico.'
        }
      ]
    });

    // =========================================================================
    // 4. JUSTICIAR (Árbitro, Alguacil, Interrogador)
    // =========================================================================
    this.addDilemma({
      id: 'DIL_JUSTICIAR_9_1',
      pathway: 'JUSTICIAR',
      sequence: 9,
      sequenceName: 'Arbiter',
      principleText: 'La ley debe mantenerse sin favoritismos. Donde hay desorden, el Árbitro restaura el equilibrio y dicta la sentencia justa.',
      clientOrContext: 'Mercado de Verduras de Barrio Este - Pelea Callejera',
      situation: 'Dos bandas de estibadores se enfrentan con cuchillos por el control de un muelle de carga, amenazando la vida de puesteros inocentes.',
      choices: [
        {
          id: 'CHOICE_ARBITER_9_MEDIATE',
          label: 'Imponer tu presencia con autoridad y decretar una división estricta de horarios',
          description: 'Te colocas entre ambos bandos, desarmas al cabecilla y estableces un pacto vinculante con castigo al infractor.',
          isAlignedWithPrinciple: true,
          digestionGain: 20.0,
          sanityDelta: 2,
          policeSuspicionDelta: -2,
          churchSuspicionDelta: 0,
          penceReward: 60,
          narrativeOutcome: 'Los estibadores bajan las armas intimidados por tu porte marcial. La poción de Árbitro solidifica tu aura de autoridad.'
        }
      ]
    });

    // =========================================================================
    // 5. DEMONESS (Asesino, Instigador, Bruja)
    // =========================================================================
    this.addDilemma({
      id: 'DIL_DEMONESS_9_1',
      pathway: 'DEMONESS',
      sequence: 9,
      sequenceName: 'Assassin',
      principleText: 'El golpe mortal debe ser invisible, letal y sin vanidad. Fúndete en las sombras y golpea el punto vital con frialdad.',
      clientOrContext: 'Mansión en Hillston - Encargo Clandestino',
      situation: 'Un traficante de opio protegido por guardaespaldas duerme en su alcoba vigilada por dos mastines.',
      choices: [
        {
          id: 'CHOICE_ASSASSIN_9_SILENT',
          label: 'Infiltrarte por la chimenea y ejecutar un corte arterial indetectable',
          description: 'Silencias a los mastines con carne sedada y terminas la vida del objetivo sin emitir un crujido.',
          isAlignedWithPrinciple: true,
          digestionGain: 20.0,
          sanityDelta: 1,
          policeSuspicionDelta: 3,
          churchSuspicionDelta: 0,
          penceReward: 360,
          narrativeOutcome: 'El cuerpo no es descubierto hasta la mañana. Tu agilidad y sigilo se perfeccionan: la poción de Asesino se enfría en tu pecho.'
        }
      ]
    });

    // =========================================================================
    // 6. DEATH (Recolector de Cadáveres, Sepulturero, Médium Espiritual)
    // =========================================================================
    this.addDilemma({
      id: 'DIL_DEATH_9_1',
      pathway: 'DEATH',
      sequence: 9,
      sequenceName: 'Corpse Collector',
      principleText: 'La muerte no es un horror, sino el reposo final. Trata a los restos mortales con dignidad y escucha el eco de los que partieron.',
      clientOrContext: 'Cementerio de Raphael - Backlund',
      situation: 'Un sepulturero inexperto ha profanado una fosa común, dejando al descubierto cadáveres descompuestos que emanan peste cadavérica.',
      choices: [
        {
          id: 'CHOICE_CORPSE_9_BURIAL',
          label: 'Purificar los restos con ungüentos funerarios y sellar la tumba en paz',
          description: 'Coges las herramientas, amortajas los cuerpos con respeto y rezas una plegaria de descanso eterno.',
          isAlignedWithPrinciple: true,
          digestionGain: 20.0,
          sanityDelta: 3,
          policeSuspicionDelta: 0,
          churchSuspicionDelta: -2,
          penceReward: 48,
          narrativeOutcome: 'La frialdad de la muerte acaricia tus dedos con gratitud. La poción de Recolector de Cadáveres se asienta con serenidad.'
        }
      ]
    });

    // =========================================================================
    // 7. HERMIT (Inquisidor de Misterios, Erudito Melée, Brujo)
    // =========================================================================
    this.addDilemma({
      id: 'DIL_HERMIT_9_1',
      pathway: 'HERMIT',
      sequence: 9,
      sequenceName: 'Mystery Pryer',
      principleText: 'Indaga en lo oculto con reverencia y cautela extrema. Conoce los peligros de mirar hacia el abismo sin protección.',
      clientOrContext: 'Taller de Grabado Ocultista - Distrito del Puente',
      situation: 'Un anticuario intenta venderte un espejo de bronce antiguo con grabados de ojos que sangran. Una voz tentadora promete secretos arcanos.',
      choices: [
        {
          id: 'CHOICE_HERMIT_9_ANALYZE',
          label: 'Proteger tu visión espiritual con cuarzo y decodificar los símbolos sin mirar el reflejo',
          description: 'Aíslas el objeto en un círculo de sal y descifras las runas sin ceder a la curiosidad destructiva.',
          isAlignedWithPrinciple: true,
          digestionGain: 20.0,
          sanityDelta: 2,
          policeSuspicionDelta: 0,
          churchSuspicionDelta: 1,
          penceReward: 70,
          narrativeOutcome: 'Descifras el ritual sin caer en la maldición del espejo. El Inquisidor de Misterios ha sabido buscar la verdad con prudencia.'
        }
      ]
    });

    // =========================================================================
    // 8. WHEEL OF FORTUNE (Monstruo, Robot, Afortunado)
    // =========================================================================
    this.addDilemma({
      id: 'DIL_WHEEL_OF_FORTUNE_9_1',
      pathway: 'WHEEL_OF_FORTUNE',
      sequence: 9,
      sequenceName: 'Monster',
      principleText: 'Percibe el pulso del destino y la calamidad. Sigue tu intuición visceral aunque parezca locura ante los ojos mortales.',
      clientOrContext: 'Estación Central de Ferrocarril de Vapor - Backlund',
      situation: 'Estás a punto de abordar el tren de las 5:15 PM hacia Cherwood. Una súbita premonición de fuego y sangre hace vibrar tu cráneo con náuseas.',
      choices: [
        {
          id: 'CHOICE_MONSTER_9_INTUITION',
          label: 'Tirar el boleto, retroceder y alejarte de los andenes de inmediato',
          description: 'Confías ciegamente en el escalofrío de tu intuición sin pedir explicaciones racionales.',
          isAlignedWithPrinciple: true,
          digestionGain: 20.0,
          sanityDelta: 3,
          policeSuspicionDelta: 0,
          churchSuspicionDelta: 0,
          penceReward: 0,
          narrativeOutcome: 'Diez minutos después la caldera de la locomotora estalla en el andén 4. La suerte te sonríe: el Monstruo ha respetado el río del destino.'
        }
      ]
    });

    // =========================================================================
    // 9. MOON (Boticario, Domador de Bestias, Vampiro)
    // =========================================================================
    this.addDilemma({
      id: 'DIL_MOON_9_1',
      pathway: 'MOON',
      sequence: 9,
      sequenceName: 'Apothecary',
      principleText: 'Comprende las propiedades biológicas de plantas y animales. Alivia las dolencias físicas respetando los ciclos de la luna.',
      clientOrContext: 'Botica del Sauce Plateado - Barrio Sur',
      situation: 'Una madre desesperada trae a su hija con fiebre convulsiva causada por una picadura de escorpión de las alcantarillas.',
      choices: [
        {
          id: 'CHOICE_MOON_9_CURE',
          label: 'Destilar un antídoto con hojas de campanilla y corteza de sauce bajo luz lunar',
          description: 'Preparas una infusión calmante exacta que neutraliza el veneno sin provocar shock en la niña.',
          isAlignedWithPrinciple: true,
          digestionGain: 20.0,
          sanityDelta: 3,
          policeSuspicionDelta: -2,
          churchSuspicionDelta: 0,
          penceReward: 40,
          narrativeOutcome: 'La fiebre cede de inmediato. La calidez de la sanación biológica nutre tu espíritu: el Boticario comprende los ritmos de la vida.'
        }
      ]
    });

    // =========================================================================
    // 10. MOTHER (Plantador, Médico, Sacerdote de la Cosecha)
    // =========================================================================
    this.addDilemma({
      id: 'DIL_MOTHER_9_1',
      pathway: 'MOTHER',
      sequence: 9,
      sequenceName: 'Planter',
      principleText: 'Siembra en tierra fértil, cuida el brote y celebra la generosidad de la tierra. Fomenta la vida que alimenta al mundo.',
      clientOrContext: 'Granja Comunitaria en las Afueras de Backlund',
      situation: 'Una plaga de hongos negros amenaza con pudrir los sembradíos de trigo que alimentan a los asilos obreros del distrito este.',
      choices: [
        {
          id: 'CHOICE_MOTHER_9_NOURISH',
          label: 'Inocular la tierra con micorrizas benéficas y canalizar vitalidad orgánica',
          description: 'Trabajas la tierra con tus manos durante toda la noche fortaleciendo las raíces del cultivo.',
          isAlignedWithPrinciple: true,
          digestionGain: 20.0,
          sanityDelta: 3,
          policeSuspicionDelta: 0,
          churchSuspicionDelta: -2,
          penceReward: 60,
          narrativeOutcome: 'Las espigas brotan doradas y resistentes al hongo. El aroma a tierra fértil y lluvia asienta la poción de Plantador.'
        }
      ]
    });

    // =========================================================================
    // 11. PARAGON (Sabio / Erudito, Arqueólogo, Tasador)
    // =========================================================================
    this.addDilemma({
      id: 'DIL_PARAGON_9_1',
      pathway: 'PARAGON',
      sequence: 9,
      sequenceName: 'Savant',
      principleText: 'Inventa, mejora y domina las leyes de la física y la mecánica. El progreso técnico es la manifestación de la mente divina.',
      clientOrContext: 'Taller Mecánico de Vapor de Backlund',
      situation: 'El mecanismo de presión de un telar a vapor industrial sufre vibraciones críticas que amenazan con desmembrar a los operarios.',
      choices: [
        {
          id: 'CHOICE_PARAGON_9_IMPROVE',
          label: 'Diseñar un sistema de válvulas compensadas de bronce y recalibrar los engranajes',
          description: 'Calculas el torque exacto y construyes un disipador térmico que triplica la vida útil de la máquina.',
          isAlignedWithPrinciple: true,
          digestionGain: 20.0,
          sanityDelta: 2,
          policeSuspicionDelta: 0,
          churchSuspicionDelta: 0,
          penceReward: 200,
          narrativeOutcome: 'El telar opera con un zumbido perfecto y silencioso. El orden de los engranajes acelera la digestión de la poción de Sabio.'
        }
      ]
    });

    // =========================================================================
    // 12. TYRANT (Marinero, Hombre de Furia, Navegante)
    // =========================================================================
    this.addDilemma({
      id: 'DIL_TYRANT_9_1',
      pathway: 'TYRANT',
      sequence: 9,
      sequenceName: 'Sailor',
      principleText: 'El mar no respeta la debilidad. Enfréntate a la tempestad con coraje indómito y somete las olas a tu voluntad.',
      clientOrContext: 'Balandro Mercante en el Estuario del Tussock - Tormenta Eléctrica',
      situation: 'Un vendaval huracanado amenaza con volcar la nave contra los arrecifes mientras la tripulación reza presa del pánico.',
      choices: [
        {
          id: 'CHOICE_SAILOR_9_BRAVE',
          label: 'Subir al palo mayor bajo los rayos, tensar el foque y gobernar el timón',
          description: 'Reta a la tormenta a gritos, mantén el rumbo con fuerza sobrehumana y cruza el oleaje.',
          isAlignedWithPrinciple: true,
          digestionGain: 20.0,
          sanityDelta: 2,
          policeSuspicionDelta: 0,
          churchSuspicionDelta: 0,
          penceReward: 120,
          narrativeOutcome: 'La nave corta las olas y entra al puerto a salvo. La furia del océano despierta el orgullo del Marinero en tus entrañas.'
        }
      ]
    });

    // =========================================================================
    // 13. CHAINED (Prisionero, Lunático, Hombre Lobo)
    // =========================================================================
    this.addDilemma({
      id: 'DIL_CHAINED_9_1',
      pathway: 'CHAINED',
      sequence: 9,
      sequenceName: 'Prisoner',
      principleText: 'El cuerpo es una jaula; el alma debe soportar las cadenas. La moderación y la templanza son tu única defensa contra la locura.',
      clientOrContext: 'Celda Fría de Aislamiento en el Manicomio de Cherwood',
      situation: 'Una noche de luna llena desata en tu mente impulsos voraces de despedazar a tus guardias y huir en una orgía de sangre.',
      choices: [
        {
          id: 'CHOICE_CHAINED_9_RESTRAIN',
          label: 'Apretar los dientes, arrodillarte sobre la piedra y abrazar el dolor del autocontrol',
          description: 'Soportas las convulsiones durante horas sin emitir un alarido ni romper tus grilletes de hierro.',
          isAlignedWithPrinciple: true,
          digestionGain: 20.0,
          sanityDelta: 3,
          policeSuspicionDelta: -2,
          churchSuspicionDelta: 0,
          penceReward: 0,
          narrativeOutcome: 'Al amanecer la fiebre pasa. Has dominado el deseo bestial: la poción de Prisionero se ancla firmemente en tu espíritu.'
        }
      ]
    });

    // =========================================================================
    // 14. ABYSS (Criminal, Ángel Desflorado, Asesino en Serie)
    // =========================================================================
    this.addDilemma({
      id: 'DIL_ABYSS_9_1',
      pathway: 'ABYSS',
      sequence: 9,
      sequenceName: 'Criminal',
      principleText: 'El bajo fondo premia la astucia depredadora y el instinto de preservación. Golpea sin piedad a quien intente traicionarte.',
      clientOrContext: 'Callejón de los Ahorcados - Barrio Este',
      situation: 'Un matón de poca monta que contrataste como informante planea delatarte a Scotland Yard para cobrar una recompensa de 10 libras.',
      choices: [
        {
          id: 'CHOICE_CRIMINAL_9_PREEMPT',
          label: 'Sorprender al traidor antes de que llegue a la comisaría y neutralizar la amenaza',
          description: 'Lo emboscas en la oscuridad, le sustraes las notas incriminatorias y dejas una advertencia indeleble.',
          isAlignedWithPrinciple: true,
          digestionGain: 20.0,
          sanityDelta: 1,
          policeSuspicionDelta: 4,
          churchSuspicionDelta: 0,
          penceReward: 80,
          narrativeOutcome: 'El inframundo aprende a respetarte. La poción de Criminal se adapta con frialdad a tu instinto depredador.'
        }
      ]
    });

    // =========================================================================
    // 15. TWILIGHT GIANT (Guerrero, Pugilista, Maestro de Armas)
    // =========================================================================
    this.addDilemma({
      id: 'DIL_TWILIGHT_GIANT_9_1',
      pathway: 'TWILIGHT_GIANT',
      sequence: 9,
      sequenceName: 'Warrior',
      principleText: 'Tu cuerpo es un escudo para los indefensos y tu espada un pilar en la vanguardia. Enfréntate al combate con disciplina de hierro.',
      clientOrContext: 'Guardia de Seguridad en un Depósito de Alimentos - Barrio Norte',
      situation: 'Una horda de bandidos armados con machetes intenta saquear las raciones destinadas a familias obreras.',
      choices: [
        {
          id: 'CHOICE_WARRIOR_9_STAND',
          label: 'Plantar los pies en el umbral, levantar el escudo y repeler a los agresores sin retroceder',
          description: 'Absorbes los golpes con tu robustez sobrenatural y desarmas a los líderes de la banda.',
          isAlignedWithPrinciple: true,
          digestionGain: 20.0,
          sanityDelta: 3,
          policeSuspicionDelta: -1,
          churchSuspicionDelta: 0,
          penceReward: 100,
          narrativeOutcome: 'Los bandidos huyen despavoridos ante tu fortaleza inamovible. La sangre de Guerrero hierve con gloria en tus músculos.'
        }
      ]
    });

    // =========================================================================
    // 16. HANGED MAN (Suplicante de Secretos, Oyente, Asceta de Sombras)
    // =========================================================================
    this.addDilemma({
      id: 'DIL_HANGED_MAN_9_1',
      pathway: 'HANGED_MAN',
      sequence: 9,
      sequenceName: 'Secrets Suppliant',
      principleText: 'Soporta el tormento y escucha los susurros de lo divino. La penitencia y el sacrificio personal te acercan al Creador.',
      clientOrContext: 'Cripta Abandonada de la Orden Aurora - Subterráneos de Backlund',
      situation: 'Durante una vigilia devota en la oscuridad, murmullos divinos incomprensibles raspan tu mente con visiones de sangre y creación.',
      choices: [
        {
          id: 'CHOICE_SECRETS_9_ENDURE',
          label: 'Arrodillarte en el fango, ofrecer tu devoción y soportar el dolor sin desesperar',
          description: 'Aceptas la revelación mística como una prueba sagrada, grabando los secretos en tu carne.',
          isAlignedWithPrinciple: true,
          digestionGain: 20.0,
          sanityDelta: 2,
          policeSuspicionDelta: 0,
          churchSuspicionDelta: 4,
          penceReward: 0,
          narrativeOutcome: 'Los murmullos se apaciguan en un eco sublime. La poción de Suplicante de Secretos se integra en lo más profundo de tu fe.'
        }
      ]
    });

    // =========================================================================
    // 17. APPRENTICE / DOOR (Aprendiz, Prestidigitador, Astrólogo)
    // =========================================================================
    this.addDilemma({
      id: 'DIL_DOOR_9_1',
      pathway: 'DOOR',
      sequence: 9,
      sequenceName: 'Apprentice',
      principleText: 'Ninguna cerradura o confinamiento físico debe retenerte. Busca la libertad y desentraña los secretos del espacio.',
      clientOrContext: 'Residencia de un Coleccionista de Libros Antiguos - Backlund',
      situation: 'Quedas encerrado en una cámara secreta con cerradura mecánica de siete pasadores mientras revisabas un manuscrito.',
      choices: [
        {
          id: 'CHOICE_DOOR_9_PICK',
          label: 'Canalizar espiritualidad a través del cerrojo para entender su mecanismo',
          description: 'Sientes la estructura interna de los metales y haces saltar los pasadores sin forzar nada.',
          isAlignedWithPrinciple: true,
          digestionGain: 20.0,
          sanityDelta: 2,
          policeSuspicionDelta: 0,
          churchSuspicionDelta: 0,
          penceReward: 0,
          narrativeOutcome: 'La pesada puerta de roble se abre con un clic suave. La poción de Aprendiz se disuelve placenteramente.'
        }
      ]
    });

    // =========================================================================
    // 18. MARAUDER / ERROR (Merodeador, Estafador, Criptólogo)
    // =========================================================================
    this.addDilemma({
      id: 'DIL_ERROR_9_1',
      pathway: 'ERROR',
      sequence: 9,
      sequenceName: 'Marauder',
      principleText: 'Aprovecha las lagunas y debilidades ajenas. El hurto elegante es una demostración de superioridad intelectual.',
      clientOrContext: 'Bolsa de Valores de Backlund - Distrito Norte',
      situation: 'Un usurero corrupto guarda pagarés fraudulentos de familias trabajadoras en su caja fuerte de despacho mientras almuerza.',
      choices: [
        {
          id: 'CHOICE_ERROR_9_STEAL',
          label: 'Sustraer los pagarés y las libras sin dejar rastro forzado',
          description: 'Explotas el descuido del portero, deslizas los documentos bajo tu abrigo y dejas la caja intacta.',
          isAlignedWithPrinciple: true,
          digestionGain: 20.0,
          sanityDelta: 2,
          policeSuspicionDelta: 3,
          churchSuspicionDelta: 0,
          penceReward: 480,
          narrativeOutcome: 'El usurero enloquece al ver la caja intacta pero vacía. La poción de Merodeador se digiere con rapidez.'
        }
      ]
    });

    // =========================================================================
    // 19. VISIONARY / SPECTATOR (Espectador, Telépata, Psiquiatra)
    // =========================================================================
    this.addDilemma({
      id: 'DIL_VISIONARY_9_1',
      pathway: 'VISIONARY',
      sequence: 9,
      sequenceName: 'Spectator',
      principleText: 'Sé el observador invisible del drama humano. Mira las pupilas, las manos y la respiración; no te conviertas en actor del escenario.',
      clientOrContext: 'Salón de Té de la Señora Glacis - Distrito Oeste',
      situation: 'Dos diplomáticos de Feysac e Intis discuten en voz baja mientras fingen jugar al ajedrez.',
      choices: [
        {
          id: 'CHOICE_SPECTATOR_9_OBSERVE',
          label: 'Permanecer inmóvil degustando el té y leyendo sus microexpresiones',
          description: 'No intervienes ni hablas. Decodificas por completo el engaño del tratado sólo analizando sus miradas.',
          isAlignedWithPrinciple: true,
          digestionGain: 20.0,
          sanityDelta: 3,
          policeSuspicionDelta: -2,
          churchSuspicionDelta: 0,
          penceReward: 48,
          narrativeOutcome: 'Nadie nota tu presencia en el rincón. Tu cuerpo astral se siente ligero: el Espectador comprende la escena.'
        }
      ]
    });

    // =========================================================================
    // 20. SUN / BARD (Bardo, Cantante de Luz, Sacerdote Solar)
    // =========================================================================
    this.addDilemma({
      id: 'DIL_SUN_9_1',
      pathway: 'SUN',
      sequence: 9,
      sequenceName: 'Bard',
      principleText: 'Canta a la esperanza y al sol inquebrantable. Disipa las sombras y el desánimo de los corazones temerosos.',
      clientOrContext: 'Hospital de la Misericordia de Cherwood - Backlund',
      situation: 'Un pabellón de enfermos de tuberculosis está sumido en una depresión mortal bajo la niebla ácida de Backlund.',
      choices: [
        {
          id: 'CHOICE_SUN_9_SING',
          label: 'Entonar un himno solar que infunda valor y vitalidad',
          description: 'Proyectas tu voz cargada de calor espiritual, iluminando el ánimo de los enfermos.',
          isAlignedWithPrinciple: true,
          digestionGain: 20.0,
          sanityDelta: 4,
          policeSuspicionDelta: 0,
          churchSuspicionDelta: -2,
          penceReward: 24,
          narrativeOutcome: 'El ambiente opresivo se despeja como si un rayo de sol rompiera el smog. La poción de Bardo resuena como un coro celestial.'
        }
      ]
    });

    // =========================================================================
    // 21. DARKNESS / SLEEPLESS (Desvelado, Poeta de Medianoche, Pesadilla)
    // =========================================================================
    this.addDilemma({
      id: 'DIL_DARKNESS_9_1',
      pathway: 'DARKNESS',
      sequence: 9,
      sequenceName: 'Sleepless',
      principleText: 'La noche es tu dominio. Vela en el silencio mientras los otros duermen; custodia la paz en la oscuridad.',
      clientOrContext: 'Callejones de San Jorge - Vigilancia Nocturna',
      situation: 'A las 3 de la madrugada, detectas a una entidad espectral acechando la ventana de un orfanato.',
      choices: [
        {
          id: 'CHOICE_DARKNESS_9_WATCH',
          label: 'Purificar silenciosamente a la sombra espectral sin despertar a los niños',
          description: 'Te deslizas en la penumbra con paso insonoro y disuelves la entidad con espiritualidad nocturna.',
          isAlignedWithPrinciple: true,
          digestionGain: 20.0,
          sanityDelta: 3,
          policeSuspicionDelta: 0,
          churchSuspicionDelta: -3,
          penceReward: 72,
          narrativeOutcome: 'Los niños duermen en paz ignorando el peligro evitado. El Desvelado cumple su deber en silencio.'
        }
      ]
    });

    // =========================================================================
    // 22. BLACK EMPEROR / LAWYER (Abogado, Bribón, Sobornador)
    // =========================================================================
    this.addDilemma({
      id: 'DIL_BLACK_EMPEROR_9_1',
      pathway: 'BLACK_EMPEROR',
      sequence: 9,
      sequenceName: 'Lawyer',
      principleText: 'Las leyes existen para ser dobladas y explotadas. Encuentra la contradicción en el texto para imponer tu orden.',
      clientOrContext: 'Tribunal Municipal de Scotland Yard - Backlund',
      situation: 'Un cliente humilde es acusado de infringir las ordenanzas de comercio ambulante por un inspector corrupto.',
      choices: [
        {
          id: 'CHOICE_LAWYER_9_EXPLOIT',
          label: 'Citar una cláusula arcaica del Acta Comercial de 1284 que anula la ordenanza',
          description: 'Dejas atónito al juez y al inspector evidenciando el vacío legal en las actas de la corona.',
          isAlignedWithPrinciple: true,
          digestionGain: 20.0,
          sanityDelta: 2,
          policeSuspicionDelta: 2,
          churchSuspicionDelta: 0,
          penceReward: 120,
          narrativeOutcome: 'El caso es desestimado inmediatamente. Tu espíritu saborea la distorsión del orden: la poción de Abogado se asienta con fuerza.'
        }
      ]
    });
  }

  public static getDilemma(pathway: CanonicalPathwayId, sequence: number): ActingDilemma {
    const key = `${pathway}_${sequence}`;
    const found = this.dilemmas.get(key);
    if (found && found.length > 0) {
      return found[0];
    }

    throw new Error(`Dilema canónico no registrado para la vía ${pathway} en Secuencia ${sequence}`);
  }

  public static hasBespokeDilemma(pathway: CanonicalPathwayId, sequence: number): boolean {
    return this.dilemmas.has(`${pathway}_${sequence}`);
  }

  // =========================================================================
  // TIER G: CARGA CANÓNICA Y MOTOR DE ACTING DINÁMICO (Brief-05)
  // =========================================================================
  public static ensureTierGLoaded(): void {
    if (this.initializedTierG) return;
    this.initializedTierG = true;

    // 1. Cargar perfiles de balance desde dilemma_effects.json
    const effectsPath = path.join(ROOT_DIR, 'data/gameplay/balance/dilemma_effects.json');
    if (fs.existsSync(effectsPath)) {
      const raw = JSON.parse(fs.readFileSync(effectsPath, 'utf8'));
      for (const [k, v] of Object.entries(raw.profiles || {})) {
        this.effectProfiles.set(k, v);
      }
    }

    // 2. Cargar dilemas Tier G desde data/gameplay/dilemmas/*.json
    const dilemmasDir = path.join(ROOT_DIR, 'data/gameplay/dilemmas');
    if (fs.existsSync(dilemmasDir)) {
      const files = fs.readdirSync(dilemmasDir).filter(f => f.endsWith('.json'));
      for (const file of files) {
        const fullPath = path.join(dilemmasDir, file);
        const list = JSON.parse(fs.readFileSync(fullPath, 'utf8')) as DilemmaG[];
        for (const d of list) {
          const key = `${d.pathway}_${d.sequence}`;
          const existing = this.tierGDilemmas.get(key) || [];
          existing.push(d);
          this.tierGDilemmas.set(key, existing);
        }
      }
    }
  }

  public static findDilemma(dilemmaId: string): DilemmaG | null {
    this.ensureTierGLoaded();
    for (const list of this.tierGDilemmas.values()) {
      const found = list.find(d => d.id === dilemmaId);
      if (found) return found;
    }
    return null;
  }

  /**
   * Presentación de dilemas: estrictamente NO telegrafiado.
   * Cero campos de scoring, alignment, pesos o effectKey.
   * Opciones de susurros inyectadas SI Y SOLO SI corrupción >= 30.
   */
  public static getAvailableDilemmas(
    db: DatabaseClient,
    characterId: string
  ): ClientDilemma[] {
    this.ensureTierGLoaded();
    const char = db.getCharacter(characterId);
    if (!char) {
      throw new Error(`Personaje no encontrado: ${characterId}`);
    }

    const key = `${char.pathway}_${char.sequence}`;
    const rawDilemmas = this.tierGDilemmas.get(key) || [];

    const result: ClientDilemma[] = [];
    const showWhispers = (char.corruption || 0) >= 30;

    for (const d of rawDilemmas) {
      const clientOptions: ClientDilemmaOption[] = d.options.map(opt => ({
        id: opt.id,
        texto: opt.texto,
        costes: opt.costes || {}
      }));

      if (showWhispers && d.whisperOptions && d.whisperOptions.length > 0) {
        for (const w of d.whisperOptions) {
          clientOptions.push({
            id: w.id,
            texto: w.texto,
            costes: w.costes || {},
            isWhisper: true
          });
        }
      }

      result.push({
        id: d.id,
        title: d.title || d.id,
        situation: d.situation || '',
        options: clientOptions
      });
    }

    return result;
  }

  /**
   * Resolución de dilema: aplica efecto de dilemma_effects.json, calcula decaimiento
   * de farmeo y registra en acting_records.
   */
  public static resolveDilemma(
    db: DatabaseClient,
    characterId: string,
    dilemmaId: string,
    choiceId: string
  ): {
    success: boolean;
    digestionGained: number;
    sanityDelta: number;
    corruptionDelta: number;
    decayApplied: number;
    alignment: number;
    actingWeight: number;
    narrativeOutcome: string;
    penceRewarded: number;
  } {
    this.ensureTierGLoaded();
    const char = db.getCharacter(characterId);
    if (!char) {
      throw new Error(`Personaje no encontrado: ${characterId}`);
    }

    // 1. Localizar dilema y opción
    let matchedDilemma: DilemmaG | null = null;
    let matchedOption: any = null;

    for (const list of this.tierGDilemmas.values()) {
      const found = list.find(d => d.id === dilemmaId);
      if (found) {
        matchedDilemma = found;
        const opt = found.options.find(o => o.id === choiceId) || 
                    found.whisperOptions?.find(w => w.id === choiceId);
        if (opt) {
          matchedOption = opt;
          break;
        }
      }
    }

    if (!matchedDilemma || !matchedOption) {
      throw new Error(`Dilema o elección no encontrada: ${dilemmaId} / ${choiceId}`);
    }

    // 2. Decaimiento por farmeo repetido (Gate 2b: x1, x0.5, x0.25, x0.1, 0)
    const records = db.getActingRecords(characterId);
    const repeats = records.filter(r => r.dilemma_id === dilemmaId).length;
    let decayApplied = 1.0;
    if (repeats === 1) decayApplied = 0.5;
    else if (repeats === 2) decayApplied = 0.25;
    else if (repeats === 3) decayApplied = 0.1;
    else if (repeats >= 4) decayApplied = 0.0;

    // 3. Perfil de efectos desde dilemma_effects.json
    const effectProfile = this.effectProfiles.get(matchedOption.effectKey) || {
      digestion: 10,
      sanity: 0,
      policeSuspicion: 0,
      churchSuspicion: 0,
      penceReward: 0,
      spiritualityCost: 0
    };

    const alignment = matchedOption.pesos?.alignment ?? 0;
    const actingWeight = matchedOption.pesos?.actingWeight ?? 1.0;
    const baseDigestion = effectProfile.digestion ?? 10;
    const digestionGained = Number((baseDigestion * decayApplied).toFixed(1));

    // Transgresión causa ganancia medible de corrupción (Gate 2c)
    let corruptionDelta = 0;
    if (alignment < 0) {
      corruptionDelta = 3;
    }

    // Coste de espiritualidad
    const spCost = effectProfile.spiritualityCost || matchedOption.costes?.spirituality || 0;
    if (char.current_spirituality < spCost) {
      throw new Error(`Espiritualidad insuficiente (${char.current_spirituality}/${spCost} requerida).`);
    }

    // 4. Aplicar cambios a personaje y persona activa
    const newDigestion = Math.min(100.0, Number((char.digestion_progress + digestionGained).toFixed(1)));
    const newSanity = Math.max(0, Math.min(100, char.sanity + (effectProfile.sanity || 0)));
    const newCorruption = Math.min(100, (char.corruption || 0) + corruptionDelta);
    const newSpirituality = char.current_spirituality - spCost;

    db.updateCharacterSomatics(characterId, {
      digestion: newDigestion,
      sanity: newSanity,
      corruption: newCorruption,
      spirituality: newSpirituality
    });

    if (effectProfile.penceReward > 0) {
      db.updateCharacterWealth(characterId, effectProfile.penceReward);
    }

    const activePersona = db.getActivePersona(characterId);
    if (activePersona && (effectProfile.policeSuspicion !== 0 || effectProfile.churchSuspicion !== 0)) {
      db.updatePersonaSuspicion(activePersona.id, effectProfile.policeSuspicion, effectProfile.churchSuspicion);
    }

    // 5. Registrar en acting_records
    const randomSuffix = Math.random().toString(36).substring(2, 9);
    const recordId = `act_${characterId}_${dilemmaId}_${Date.now()}_${randomSuffix}`;
    db.logActing({
      id: recordId,
      character_id: characterId,
      pathway: char.pathway,
      sequence: char.sequence,
      dilemma_id: dilemmaId,
      choice_id: choiceId,
      digestion_gained: digestionGained,
      sanity_delta: effectProfile.sanity || 0,
      alignment,
      acting_weight: actingWeight,
      decay_applied: decayApplied,
      day: char.current_day,
      narrative_log: matchedOption.narrativeOutcome
    });

    return {
      success: true,
      digestionGained,
      sanityDelta: effectProfile.sanity || 0,
      corruptionDelta,
      decayApplied,
      alignment,
      actingWeight,
      narrativeOutcome: matchedOption.narrativeOutcome,
      penceRewarded: effectProfile.penceReward || 0
    };
  }

  /**
   * Tick Semanal (cada 7 días):
   * COHERENCIA = media(actingWeight * decay * costFactor * witnessFactor)
   * VARIEDAD = penalizador si la ventana cae en una sola categoría
   * ASIMILACIÓN += g(Coherence)
   * TRANSGRESIÓN -> incremento de corrupción
   * ESTANCAMIENTO (Coherence < 0.35) -> instability_flag
   * SOBRE-ACTUACIÓN (Coherence > 1.0 && anchor < 50) -> loss_of_self_risk_flag
   */
  public static processWeeklyTick(
    db: DatabaseClient,
    characterId: string
  ): {
    currentWeek: number;
    coherence: number;
    varietyPenalty: number;
    assimilationGain: number;
    transgressionCorruptionGain: number;
    instabilityFlag: boolean;
    lossOfSelfRiskFlag: boolean;
  } {
    this.ensureTierGLoaded();
    const char = db.getCharacter(characterId);
    if (!char) {
      throw new Error(`Personaje no encontrado: ${characterId}`);
    }

    const existingWeeklyState = db.getActingWeeklyState(characterId);
    const currentWeek = (existingWeeklyState?.current_week || 1);

    const allRecords = db.getActingRecords(characterId);
    const minDay = (currentWeek - 1) * 7 + 1;
    const maxDay = currentWeek * 7;
    let weekRecords = allRecords.filter(r => r.day >= minDay && r.day <= maxDay);
    if (weekRecords.length === 0 && allRecords.length > 0) {
      weekRecords = allRecords.slice(-7);
    }

    let coherence = 0.0;
    let varietyPenalty = 0.0;
    let assimilationGain = 0.0;
    let transgressionCorruptionGain = 0;

    if (weekRecords.length > 0) {
      // 1. Variedad: monocategoría recibe 40% de penalizador
      const varieties = new Set<string>();
      for (const r of weekRecords) {
        const dDef = this.findDilemma(r.dilemma_id);
        const v = dDef?.antiExploit?.variety ? String(dDef.antiExploit.variety) : r.dilemma_id;
        varieties.add(v);
      }

      if (weekRecords.length >= 2 && varieties.size === 1) {
        varietyPenalty = 0.40;
      }

      // 2. Coherencia
      let sumWeight = 0;
      for (const r of weekRecords) {
        const dDef = this.findDilemma(r.dilemma_id);
        const opt = dDef?.options.find(o => o.id === r.choice_id);
        const spCost = opt?.costes?.spirituality || 0;
        const costFactor = spCost >= 10 ? 1.15 : (spCost > 0 ? 1.05 : 1.0);
        const witnessFactor = 1.0;
        sumWeight += (r.acting_weight * r.decay_applied * costFactor * witnessFactor);
      }

      const rawCoherence = sumWeight / weekRecords.length;
      coherence = Number((rawCoherence * (1.0 - varietyPenalty)).toFixed(3));

      // 3. Asimilación += g(Coherence)
      assimilationGain = Number((coherence * 15).toFixed(1));
      const newDigestion = Math.min(100.0, Number((char.digestion_progress + assimilationGain).toFixed(1)));

      // 4. Transgresión
      const negativeCount = weekRecords.filter(r => r.alignment < 0).length;
      transgressionCorruptionGain = negativeCount * 2;
      const newCorruption = Math.min(100, (char.corruption || 0) + transgressionCorruptionGain);

      db.updateCharacterSomatics(characterId, {
        digestion: newDigestion,
        corruption: newCorruption
      });
    }

    // 5. Estancamiento (Coherence < 0.35) -> instability_flag
    const instabilityFlag = coherence < 0.35;

    // 6. Sobre-actuación (Coherence > 1.0 && anchor < 50) -> loss_of_self_risk_flag
    const totalAnchorStrength = db.getTotalAnchorStrength(characterId);
    const lossOfSelfRiskFlag = (coherence > 1.0 && totalAnchorStrength < 50);

    // 7. Persistir estado semanal en SQLite
    db.saveActingWeeklyState({
      character_id: characterId,
      current_week: currentWeek + 1,
      coherence,
      variety_penalty: varietyPenalty,
      instability_flag: instabilityFlag ? 1 : 0,
      loss_of_self_risk_flag: lossOfSelfRiskFlag ? 1 : 0,
      weekly_records_json: JSON.stringify(weekRecords),
      history_json: JSON.stringify(allRecords)
    });

    return {
      currentWeek,
      coherence,
      varietyPenalty,
      assimilationGain,
      transgressionCorruptionGain,
      instabilityFlag,
      lossOfSelfRiskFlag
    };
  }
}
