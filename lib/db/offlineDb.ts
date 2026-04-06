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

  constructor() {
    super('sosagro_offline');
    this.version(1).stores({
      instruments: 'instrumentId',
      pendingSurveys: 'localId, syncStatus, instrumentId',
      pendingOptions: 'localOptionKey, questionId',
    });
  }
}

export const offlineDb = new OfflineDb();
