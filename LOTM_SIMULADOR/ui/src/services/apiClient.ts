/**
 * CLIENTE API DIEGÉTICO — PATH TO GODHOOD (BRIEF-10.VISUAL-R4)
 * Conexión tipada con Fastify / SQLite.
 * Sanitiza y filtra metadatos matemáticos antes de exponer datos al renderizado UI.
 */


export interface SanitizedCalendarOutcome {
  actionType: string;
  day: number;
  slot: number;
  slotName: string;
  narrative: string;
  datedEventTriggered?: {
    type: string;
    title: string;
    description: string;
  };
  weeklyTickExecuted?: {
    weekNumber: number;
    actingSummary: string;
    rentPaid: boolean;
    salaryCollected: boolean;
    marketRotated: boolean;
    convergenceChecked: boolean;
    decayProcessed: boolean;
  };
}

export interface SanitizedDilemmaChoice {
  id: string;
  label: string;
  description: string;
}

export interface SanitizedActingDilemma {
  id: string;
  title: string;
  description: string;
  corePrinciple: string;
  choices: SanitizedDilemmaChoice[];
}

export interface SanitizedActingResolution {
  success: boolean;
  message: string;
  isFullyDigested: boolean;
}

export interface SanitizedIdentityEventOption {
  label: string;
  description: string;
}

export interface SanitizedIdentityEvent {
  id: string;
  title: string;
  situation: string;
  options: SanitizedIdentityEventOption[];
}

export interface SanitizedIdentityResolution {
  success: boolean;
  narrativeOutcome?: string;
  error?: string;
}

export const apiClient = {
  /**
   * Obtiene el estado consolidado del personaje
   */
  async getCharacter(characterId: string): Promise<any> {
    const res = await fetch(`/api/character/${characterId}`);
    if (!res.ok) {
      throw new Error(`Error al cargar personaje: ${res.statusText}`);
    }
    return res.json();
  },

  /**
   * Ejecuta una acción canónica de franja horaria en el calendario.
   * El servidor avanza el slot de manera transaccional.
   */
  async performCalendarAction(
    characterId: string,
    actionType: 'WORK' | 'INVESTIGATE' | 'SOCIALIZE' | 'OPERATE',
    details?: { targetId?: string; customNote?: string }
  ): Promise<SanitizedCalendarOutcome> {
    const res = await fetch('/api/calendar/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ characterId, actionType, details })
    });

    if (!res.ok) {
      throw new Error(`Error en acción de calendario: ${res.statusText}`);
    }

    const raw = await res.json();

    // Sanitizar filtrando números de balance
    return {
      actionType: raw.actionType,
      day: raw.day,
      slot: raw.slot,
      slotName: raw.slotName,
      narrative: raw.narrative || 'La jornada transcurre entre las sombras de Backlund.',
      datedEventTriggered: raw.datedEventTriggered ? {
        type: raw.datedEventTriggered.type,
        title: raw.datedEventTriggered.title,
        description: raw.datedEventTriggered.description
      } : undefined,
      weeklyTickExecuted: raw.weeklyTickExecuted ? {
        weekNumber: raw.weeklyTickExecuted.weekNumber,
        actingSummary: 'Evaluación de principios y coherencia de la máscara completada.',
        rentPaid: !!raw.weeklyTickExecuted.rentPaid,
        salaryCollected: !!raw.weeklyTickExecuted.salaryCollected,
        marketRotated: !!raw.weeklyTickExecuted.marketRotated,
        convergenceChecked: !!raw.weeklyTickExecuted.convergenceChecked,
        decayProcessed: !!raw.weeklyTickExecuted.decayProcessed
      } : undefined
    };
  },

  /**
   * Consulta los registros históricos del calendario
   */
  async getCalendarLogs(characterId: string, limit = 20): Promise<any[]> {
    const res = await fetch(`/api/calendar/logs/${characterId}?limit=${limit}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.logs || [];
  },

  /**
   * Tira o consulta un evento de identidad civil para el personaje
   */
  async rollIdentityEvent(characterId: string): Promise<SanitizedIdentityEvent | null> {
    try {
      const res = await fetch(`/api/identity/roll/${characterId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.event) {
          const raw = data.event;
          return {
            id: raw.id,
            title: raw.title,
            situation: raw.description || raw.situation || 'Fricción en la vida civil de Backlund.',
            options: (raw.options || []).map((opt: any) => ({
              label: opt.text || opt.label || 'Proceder con cautela',
              description: opt.description || ''
            }))
          };
        }
      }
    } catch {
      // Continuar al fallback canónico diegético
    }

    // Fallback canónico de Tier G / Tier L para modo fixture o desconectado
    return {
      id: 'ID_EV_EXPOSICION_ACCIDENTAL_01',
      title: 'Huellas de Tinta Arcana en la Escalera de West Hillston',
      situation: 'La patrona de la pensión y un vecino han notado manchas oscuras y un persistente olor a ceniza e incienso cerca del umbral de tu habitación. Se requiere templanza civil para disipar las conjeturas vecinales.',
      options: [
        {
          label: 'Responder con diplomacia formal y aplomo burgués',
          description: 'Aduces que se trata de reactivos de encuadernación y fórmulas químicas para el tratamiento de pergaminos notariales.'
        },
        {
          label: 'Satisfacer una propina compensatoria a la patrona',
          description: 'Unas monedas de plata compensan el disgusto de la dueña y sofocan preguntas indiscretas.'
        },
        {
          label: 'Empacar las pertenencias comprometedoras y quemar notas',
          description: 'Aseguras la clandestinidad del Desván reduciendo al mínimo cualquier cabo suelto en la habitación.'
        }
      ]
    };
  },

  /**
   * Resuelve un evento de identidad civil
   */
  async resolveIdentityEvent(
    characterId: string,
    eventId: string,
    optionIndex: number
  ): Promise<SanitizedIdentityResolution> {
    try {
      const res = await fetch('/api/identity/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ characterId, eventId, optionIndex })
      });

      if (res.ok) {
        const data = await res.json();
        return {
          success: true,
          narrativeOutcome: data.chosenOption?.narrativeOutcome || data.chosenOption?.text || 'La situación civil ha sido atendida.'
        };
      }
      return {
        success: false,
        narrativeOutcome: undefined,
        error: `Error al resolver evento civil: ${res.status}`
      };
    } catch (err: any) {
      return {
        success: false,
        narrativeOutcome: undefined,
        error: err.message || 'Error de conexión con el servidor.'
      };
    }
  },

  /**
   * Obtiene el dilema de actuación para el personaje
   */
  async getActingDilemma(characterId: string): Promise<SanitizedActingDilemma | null> {
    try {
      const res = await fetch(`/api/acting/dilemma/${characterId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.dilemma) {
          const raw = data.dilemma;
          return {
            id: raw.id,
            title: raw.title || 'Dilema de Interpretación',
            description: raw.description || raw.situation || '',
            corePrinciple: raw.corePrinciple || raw.principleText || '',
            choices: (raw.choices || []).map((c: any) => ({
              id: c.id,
              label: c.label || c.text || 'Actuar según el instinto',
              description: c.description || ''
            }))
          };
        }
      }
    } catch {
      // Fallback
    }

    // Fallback canónico Tier G para Vidente / Espectador
    return {
      id: 'dilemma_seer_divination_warning',
      title: 'El Consultante y el Velo del Destino',
      description: 'Un caballero adinerado acude a tu consulta clandestina en North Borough. Sus cartas revelan un augurio funesto en los muelles antes del amanecer. La ley del Vidente te prohíbe manipular deliberadamente el curso de los acontecimientos para lucro propio.',
      corePrinciple: 'El Vidente interpreta el destino, pero no interviene en sus hilos.',
      choices: [
        {
          id: 'choice_reveal_veiled',
          label: 'Transmitir la advertencia en metáforas elípticas',
          description: 'Cumples la función del intérprete sin quebrar la distancia solemne que exige el misterio.'
        },
        {
          id: 'choice_direct_intervention',
          label: 'Advertirle directamente e intentar salvar su vida',
          description: 'Cedes a la compasión mundana, alterando el cauce previsto por las estrellas.'
        },
        {
          id: 'choice_cold_silence',
          label: 'Callar el augurio y limitarte a cobrar los chelines',
          description: 'Te desentiendes con cinismo de la suerte de quien te confió su inquietud.'
        }
      ]
    };
  },

  /**
   * Resuelve una elección de actuación
   */
  async resolveActingDilemma(
    characterId: string,
    dilemmaId: string,
    choiceId: string
  ): Promise<SanitizedActingResolution> {
    try {
      const res = await fetch('/api/acting/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ characterId, dilemmaId, choiceId })
      });

      if (res.ok) {
        const data = await res.json();
        return {
          success: !!data.success,
          message: data.message || 'Has interpretado tu papel ante el abismo.',
          isFullyDigested: !!data.isFullyDigested
        };
      }
      return {
        success: false,
        message: `Error al resolver interpretación: ${res.status}`,
        isFullyDigested: false
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Error de conexión con el servidor.',
        isFullyDigested: false
      };
    }
  },

  // =========================================================================
  // F04: INTEGRACIÓN REAL DE SISTEMAS (ECONOMÍA, COMBATE, CASOS, ASCENSO)
  // =========================================================================

  /**
   * Obtiene catálogo de mercancías para un distrito con modificadores de balance
   */
  async getDistrictMarket(districtId: string): Promise<{ market: any; qualityModifiers?: Record<string, { priceMultiplier: number; successBonus: number; corruptionRisk: number }> } | null> {
    try {
      const res = await fetch(`/api/economy/market/${encodeURIComponent(districtId)}`);
      if (res.ok) {
        const data = await res.json();
        return {
          market: data.market,
          qualityModifiers: data.qualityModifiers
        };
      }
    } catch {
      // Fallback
    }
    return null;
  },

  /**
   * Compra un ítem del mercado con persistencia transaccional SQLite
   */
  async buyMarketItem(params: {
    characterId: string;
    districtId: string;
    itemCode: string;
    quality: 'PRISTINE' | 'DAMAGED' | 'CONTAMINATED';
    commandId?: string;
    expectedRevision?: number;
  }): Promise<{ success: boolean; item?: any; penceSpent: number; remainingBalance: number; error?: string; fromReceipt?: boolean; revision?: number }> {
    const res = await fetch('/api/economy/buy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error(data.error || `Error en la compra: ${res.statusText}`) as any;
      err.status = res.status;
      err.code = data.code;
      throw err;
    }
    return data;
  },

  /**
   * Inicia o recupera combate táctico activo en SQLite
   */
  async startCombat(params: {
    characterId: string;
    enemyName?: string;
    enemyHp?: number;
    enemySpeed?: number;
    commandId?: string;
    expectedRevision?: number;
    forceNew?: boolean;
  }): Promise<any> {
    const res = await fetch('/api/combat/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Error al iniciar combate: ${res.statusText}`);
    }
    return res.json();
  },

  /**
   * Obtiene combate activo de SQLite
   */
  async getActiveCombat(characterId: string): Promise<any> {
    const res = await fetch(`/api/combat/active/${encodeURIComponent(characterId)}`);
    if (!res.ok) return null;
    return res.json();
  },

  /**
   * Ejecuta una acción de combate persistida en SQLite
   */
  async executeCombatAction(params: {
    characterId: string;
    actionType: 'SKILL' | 'MOVE' | 'SCRUTINIZE' | 'NEGOTIATE' | 'FLEE';
    skillId?: string;
    targetPosition?: { x: number; y: number };
    commandId?: string;
    expectedRevision?: number;
  }): Promise<any> {
    const res = await fetch('/api/combat/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || data.message || `Error en acción de combate: ${res.statusText}`);
    }
    return data;
  },

  /**
   * Activa o recupera caso de investigación en SQLite
   */
  async activateInvestigationCase(characterId: string, caseId = 'CASE_CHERWOOD_HEIRLOOM'): Promise<any> {
    const res = await fetch('/api/investigation/case/activate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ characterId, caseId })
    });
    if (!res.ok) return null;
    return res.json();
  },

  /**
   * Conecta pistas de investigación persistidas en SQLite
   */
  async connectInvestigationClues(params: {
    instanceId: string;
    clueA: string;
    clueB: string;
    relation: 'acusa' | 'explica' | 'localiza' | 'contradice';
  }): Promise<any> {
    const res = await fetch('/api/investigation/clues/connect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Error al conectar pistas');
    }
    return res.json();
  },

  /**
   * Envía y persiste una hipótesis de investigación en SQLite
   */
  async submitInvestigationHypothesis(params: {
    instanceId: string;
    hypothesisId: string;
  }): Promise<any> {
    const res = await fetch('/api/investigation/hypothesis/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Error al someter hipótesis');
    }
    return res.json();
  },

  /**
   * Añade y persiste una nota libre de investigación en SQLite (P09)
   */
  async addInvestigationNote(params: {
    instanceId: string;
    text: string;
    x?: number;
    y?: number;
    commandId?: string;
  }): Promise<any> {
    const res = await fetch('/api/investigation/notes/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Error al añadir nota libre');
    }
    return res.json();
  },

  /**
   * Elimina una nota libre de investigación en SQLite (P09)
   */
  async deleteInvestigationNote(params: {
    instanceId: string;
    noteId: string;
    commandId?: string;
  }): Promise<any> {
    const res = await fetch('/api/investigation/notes/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Error al eliminar nota');
    }
    return res.json();
  },

  /**
   * Resuelve formalmente el caso de investigación en SQLite (P09)
   */
  async resolveInvestigationCase(params: {
    instanceId: string;
    resolutionId: 'RESOLUTION_A_JUSTICE' | 'RESOLUTION_B_TRUTH' | 'RESOLUTION_C_STABILITY' | 'RESOLUTION_D_HEIR';
    commandId?: string;
  }): Promise<any> {
    const res = await fetch('/api/investigation/case/resolve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.message || 'Error al resolver el caso');
    }
    return res.json();
  },

  /**
   * Evalúa el estado de las Cinco Puertas del ascenso en SQLite
   */
  async getAscensionStatus(characterId: string): Promise<any> {
    const res = await fetch(`/api/ascension/status/${encodeURIComponent(characterId)}`);
    if (!res.ok) return null;
    return res.json();
  },

  /**
   * Prepara los requerimientos rituales de ascenso en SQLite
   */
  async prepareAscension(params: {
    characterId: string;
    checklist: {
      lugar?: boolean;
      momento?: boolean;
      materiales_rituales?: boolean;
      costos_anclaje?: boolean;
    };
    markPresented?: boolean;
  }): Promise<any> {
    const res = await fetch('/api/ascension/prepare', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Error en preparación de ascenso');
    }
    return res.json();
  },

  /**
   * Ingesta ceremonial de la poción y avance de secuencia en SQLite
   */
  async drinkAscensionPotion(params: {
    characterId: string;
    confirmedAt?: number;
    seed?: number;
    commandId?: string;
    expectedRevision?: number;
  }): Promise<any> {
    const res = await fetch('/api/ascension/drink', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || `Error al ingerir poción: ${res.statusText}`);
    }
    return data;
  },

  /**
   * Viaje a otro distrito de la ciudad mediante carruaje de alquiler (2 chelines)
   */
  async travelToDistrict(params: {
    characterId: string;
    destinationDistrict: string;
    commandId?: string;
    expectedRevision?: number;
  }): Promise<any> {
    const res = await fetch('/api/city/travel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || 'Error al viajar en carruaje');
    }
    return data;
  },

  /**
   * Consulta el recibo de un comando por su ID para recuperación tras timeout de red
   */
  async getCommandReceipt(commandId: string): Promise<any> {
    const res = await fetch(`/api/commands/receipt/${encodeURIComponent(commandId)}`);
    if (!res.ok) return null;
    return res.json();
  },

  // =========================================================================
  // P07: PRÓLOGO CANÓNICO Y ONBOARDING
  // =========================================================================

  /**
   * Obtiene la lista de los 6 orígenes canónicos disponibles
   */
  async getPrologueOrigins(): Promise<{ origins: any[] }> {
    const res = await fetch('/api/prologue/origins');
    if (!res.ok) throw new Error(`Error al cargar orígenes: ${res.statusText}`);
    return res.json();
  },

  /**
   * Inicia el prólogo canónico, creando o asignando el personaje de forma transaccional
   */
  async startPrologue(params: { characterId?: string; name?: string; originId: string }): Promise<any> {
    const res = await fetch('/api/prologue/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Error al iniciar prólogo: ${res.statusText}`);
    }
    return res.json();
  },

  /**
   * Resuelve el dilema tutorial del zaguán
   */
  async resolvePrologueDilemma(params: { characterId: string; choice: 'PRUDENCE' | 'CURIOSITY' }): Promise<any> {
    const res = await fetch('/api/prologue/tutorial/dilemma', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Error en dilema del prólogo: ${res.statusText}`);
    }
    return res.json();
  },

  /**
   * Obtiene la descripción críptica de las pociones en el desván
   */
  async getProloguePotions(): Promise<any> {
    const res = await fetch('/api/prologue/potions');
    if (!res.ok) throw new Error(`Error al consultar pociones: ${res.statusText}`);
    return res.json();
  },

  /**
   * Realiza la ingesta de la primera poción S9
   */
  async drinkProloguePotion(params: { characterId: string; potionChoice: 'COBALT_EYES' | 'AMBER_MIRROR' }): Promise<any> {
    const res = await fetch('/api/prologue/drink', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Error en ingesta de poción: ${res.statusText}`);
    }
    return res.json();
  },

  /**
   * Consulta el estado del prólogo para un personaje guardado
   */
  async getPrologueStatus(characterId: string): Promise<any> {
    const res = await fetch(`/api/prologue/status/${encodeURIComponent(characterId)}`);
    if (!res.ok) return null;
    return res.json();
  },

  /**
   * Obtiene la lista autoritativa de distritos de Backlund con enriquecimiento narrativo
   */
  async getCityDistricts(): Promise<{ districts: any[] }> {
    const res = await fetch('/api/city/districts');
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Error al obtener distritos');
    }
    return res.json();
  },

  /**
   * Obtiene el caso activo actual para un personaje en SQLite
   */
  async getActiveInvestigationCase(characterId: string): Promise<any> {
    const res = await fetch(`/api/investigation/case/active/${encodeURIComponent(characterId)}`);
    if (!res.ok) return null;
    return res.json();
  },

  /**
   * Visita e inspecciona una fuente física de pista autoritativa en SQLite
   */
  async visitClueSource(params: {
    instanceId: string;
    clueId: string;
    sourceIndex?: number;
    commandId?: string;
  }): Promise<any> {
    const res = await fetch('/api/investigation/clue/visit-source', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || data.reason || 'Error al inspeccionar la fuente de pista');
    }
    return data;
  }
};
