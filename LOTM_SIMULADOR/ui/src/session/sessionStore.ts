import { create } from 'zustand';
import { apiClient } from '../services/apiClient';
import { mapSanityToVisual, mapCorruptionToVisual, mapRuinaToVisual } from '../services/somaticsMapper';
import { resolvePathwayDisplayName, resolveSequenceTitle } from './sequenceRegistry';
import type {
  PublicCharacterProjection,
  PublicCalendarProjection,
  PublicBattleProjection,
  PublicCaseProjection,
  PublicAscensionProjection
} from './types';

export interface SessionStore {
  activeCharacterId: string | null;
  character: PublicCharacterProjection | null;
  calendar: PublicCalendarProjection;
  activeBattle: PublicBattleProjection | null;
  activeCase: PublicCaseProjection | null;
  ascensionStatus: PublicAscensionProjection | null;
  status: 'IDLE' | 'LOADING' | 'READY' | 'NO_SESSION' | 'ERROR';
  errorMessage: string | null;
  isPendingOperation: boolean;

  // Actions
  initializeSession: (explicitId?: string) => Promise<boolean>;
  refreshCharacter: () => Promise<void>;
  setActiveCharacterId: (id: string | null) => void;
  clearSession: () => void;
  setPendingOperation: (isPending: boolean) => void;
  setErrorMessage: (msg: string | null) => void;
  syncCalendar: (cal: Partial<PublicCalendarProjection>) => void;
}

const STORAGE_KEY = 'lotm_active_character_id';

export const useSessionStore = create<SessionStore>((set, get) => ({
  activeCharacterId: null,
  character: null,
  calendar: {
    day: 1,
    slot: 2,
    slotName: 'TARDE'
  },
  activeBattle: null,
  activeCase: null,
  ascensionStatus: null,
  status: 'IDLE',
  errorMessage: null,
  isPendingOperation: false,

  initializeSession: async (explicitId?: string) => {
    const targetId = explicitId || localStorage.getItem(STORAGE_KEY);
    if (!targetId) {
      set({
        activeCharacterId: null,
        character: null,
        status: 'NO_SESSION',
        errorMessage: null
      });
      return false;
    }

    set({ status: 'LOADING', errorMessage: null });
    try {
      const data = await apiClient.getCharacter(targetId);
      if (!data?.character) {
        localStorage.removeItem(STORAGE_KEY);
        set({
          activeCharacterId: null,
          character: null,
          status: 'NO_SESSION',
          errorMessage: 'No se encontró el personaje guardado.'
        });
        return false;
      }

      const rawChar = data.character;
      const rawPathway = rawChar.pathway || 'FOOL';
      const seqNum = Number(rawChar.sequence) || 9;
      const pathwayDisplayName = resolvePathwayDisplayName(rawPathway);
      const sequenceTitle = resolveSequenceTitle(rawPathway, seqNum);

      const mappedSanity = mapSanityToVisual(data.somatics?.sanityTier || 'LUCID');
      const mappedCorruption = mapCorruptionToVisual(data.somatics?.corruptionTier || 'PRISTINE');
      const mappedRuina = mapRuinaToVisual(data.somatics?.ruinaTier || 0);

      const walletPounds = data.wallet?.pounds ?? Math.floor((rawChar.raw_pence || 0) / 240);
      const walletSoli = data.wallet?.soli ?? Math.floor(((rawChar.raw_pence || 0) % 240) / 12);
      const walletPence = data.wallet?.pence ?? ((rawChar.raw_pence || 0) % 12);
      const walletText = `${walletPounds} £, ${walletSoli} s y ${walletPence} d`;

      const projection: PublicCharacterProjection = {
        id: rawChar.id,
        name: rawChar.name,
        pathway: rawPathway,
        pathwayDisplayName,
        sequence: seqNum,
        sequenceTitle,
        profession: data.activePersona?.profession || 'Detective Privado',
        originTitle: data.activePersona?.profession || 'Origen Civil',
        district: rawChar.current_location || 'Backlund - Cherwood',
        wallet: {
          pounds: walletPounds,
          soli: walletSoli,
          pence: walletPence,
          rawPence: rawChar.raw_pence || 0,
          displayText: walletText
        },
        somatics: {
          sanityTier: mappedSanity.tier,
          candleDescription: mappedSanity.description,
          corruptionTier: mappedCorruption.tier,
          mirrorDescription: mappedCorruption.description,
          ruinaTier: mappedRuina.tier,
          woodDescription: mappedRuina.description
        },
        initialBurden: {
          type: 'DEUDA',
          description: 'Alquiler y compromisos notariales en Backlund.',
          details: 'Compromiso formal que pesa sobre tu rutina civil.'
        },
        anchors: (data.anchors || []).map((a: any) => ({
          id: a.id,
          tipo: a.type || 'persona',
          nombre: a.name || a.title || 'Ancla',
          descripcion: a.description || 'Lazo humano',
          fuerza: (a.strength ?? 20) > 25 ? 'FIRME' : (a.strength ?? 20) > 10 ? 'TENUE' : 'QUEBRADIZA'
        })),
        policeSuspicionText: (data.activePersona?.police_suspicion ?? 5) > 20
          ? 'Vigilancia en las esquinas de tu calle.'
          : 'Sin sospechas policiales aparentes.',
        churchSuspicionText: (data.activePersona?.church_suspicion ?? 5) > 20
          ? 'Sombras inquisitorias rondan tu vecindario.'
          : 'Los clérigos no han registrado tu nombre.'
      };

      localStorage.setItem(STORAGE_KEY, rawChar.id);
      set({
        activeCharacterId: rawChar.id,
        character: projection,
        status: 'READY',
        errorMessage: null,
        calendar: {
          day: rawChar.current_day || 1,
          slot: rawChar.current_slot || 2,
          slotName: rawChar.current_slot === 1 ? 'MAÑANA' : rawChar.current_slot === 2 ? 'TARDE' : rawChar.current_slot === 3 ? 'NOCHE' : 'MADRUGADA'
        }
      });
      return true;
    } catch (err: any) {
      set({
        status: 'ERROR',
        errorMessage: err.message || 'Error al conectar con el servidor de la sesión.'
      });
      return false;
    }
  },

  refreshCharacter: async () => {
    const currentId = get().activeCharacterId;
    if (currentId) {
      await get().initializeSession(currentId);
    }
  },

  setActiveCharacterId: (id: string | null) => {
    if (id) {
      localStorage.setItem(STORAGE_KEY, id);
      get().initializeSession(id);
    } else {
      localStorage.removeItem(STORAGE_KEY);
      set({
        activeCharacterId: null,
        character: null,
        status: 'NO_SESSION'
      });
    }
  },

  clearSession: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({
      activeCharacterId: null,
      character: null,
      status: 'NO_SESSION',
      activeBattle: null,
      activeCase: null,
      ascensionStatus: null
    });
  },

  setPendingOperation: (isPending: boolean) => {
    set({ isPendingOperation: isPending });
  },

  setErrorMessage: (msg: string | null) => {
    set({ errorMessage: msg });
  },

  syncCalendar: (cal: Partial<PublicCalendarProjection>) => {
    set(state => ({
      calendar: { ...state.calendar, ...cal }
    }));
  }
}));
