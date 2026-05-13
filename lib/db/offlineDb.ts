import Dexie, { type Table } from 'dexie';
import type {
  InstrumentResponse,
  InstrumentDraftAnswer,
} from '@/app/(instrument)/types';

export interface CachedInstrument {
  instrumentId: string;
  data: InstrumentResponse;
  cachedAt: number;
}

export interface PendingSurvey {
  localId: string;
  instrumentId: string;
  instrumentName: string;
  instrumentVersion: number;
  startedAt: number;
  answers: Record<string, InstrumentDraftAnswer>;
  currentIndex: number;
  surveyId?: string;
  syncStatus: 'pending' | 'syncing' | 'done' | 'error';
  syncError?: string;
  /** localSessionId offline (mapeado a sessionId real al sincronizar). */
  campaignLocalSessionId?: string;
  /** sessionId real del backend si la sesión ya fue creada online. */
  campaignSessionId?: string;
  /** Orden del paso dentro de la campaña, si aplica. */
  stepOrder?: number;
}

export interface PendingCampaignSession {
  localSessionId: string;
  campaignId: string;
  startedAt: number;
  context: {
    farmerId?: string;
    userId?: string;
    actorTypeId?: string;
    departmentId?: string;
    townId?: string;
    vereda?: string;
    cropId?: string;
  };
  /** Una vez la sesión exista en backend, se guarda el sessionId real. */
  sessionId?: string;
  syncStatus: 'pending' | 'syncing' | 'done' | 'error';
  syncError?: string;
}

export interface PendingOption {
  localOptionKey: string;
  questionId: string;
  originalOtherOptionId: string;
  text: string;
  resolvedOptionId?: string;
}

class OfflineDb extends Dexie {
  instruments!: Table<CachedInstrument>;
  pendingSurveys!: Table<PendingSurvey>;
  pendingOptions!: Table<PendingOption>;
  pendingCampaignSessions!: Table<PendingCampaignSession>;

  constructor() {
    super('sosagro_offline');
    this.version(1).stores({
      instruments: 'instrumentId',
      pendingSurveys: 'localId, syncStatus, instrumentId',
      pendingOptions: 'localOptionKey, questionId',
    });
    // v2: añade pendingCampaignSessions y extiende pendingSurveys con
    // campaignLocalSessionId/campaignSessionId/stepOrder. Dexie no requiere
    // declarar nuevas columnas de payload — solo los índices listados.
    this.version(2).stores({
      instruments: 'instrumentId',
      pendingSurveys:
        'localId, syncStatus, instrumentId, campaignLocalSessionId, campaignSessionId',
      pendingOptions: 'localOptionKey, questionId',
      pendingCampaignSessions: 'localSessionId, syncStatus, campaignId, sessionId',
    });
  }
}

export const offlineDb = new OfflineDb();
