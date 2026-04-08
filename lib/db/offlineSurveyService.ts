import type { InstrumentResponse, InstrumentDraftAnswer } from '@/app/(instrument)/types';
import { offlineDb, type PendingSurvey, type PendingOption } from './offlineDb';

export async function cacheInstrument(data: InstrumentResponse): Promise<void> {
  await offlineDb.instruments.put({
    instrumentId: data.instrumentId,
    data,
    cachedAt: Date.now(),
  });
}

export async function getCachedInstrument(instrumentId: string): Promise<InstrumentResponse | null> {
  const record = await offlineDb.instruments.get(instrumentId);
  return record?.data ?? null;
}

interface CreatePendingSurveyParams {
  instrumentId: string;
  instrumentName: string;
  instrumentVersion: number;
}

export async function createPendingSurvey(
  params: CreatePendingSurveyParams,
): Promise<string> {
  const localId = crypto.randomUUID();

  const record: PendingSurvey = {
    localId,
    instrumentId: params.instrumentId,
    instrumentName: params.instrumentName,
    instrumentVersion: params.instrumentVersion,
    startedAt: Date.now(),
    answers: {},
    currentIndex: 0,
    syncStatus: 'pending',
  };

  await offlineDb.pendingSurveys.add(record);

  return localId;
}

export async function updateSurveyProgress(
  localId: string,
  answers: Record<string, InstrumentDraftAnswer>,
  currentIndex: number,
): Promise<void> {
  await offlineDb.pendingSurveys.update(localId, { answers, currentIndex });
}

export async function getPendingSurveys(): Promise<PendingSurvey[]> {
  return offlineDb.pendingSurveys
    .where('syncStatus')
    .anyOf('pending', 'error')
    .toArray();
}

export async function markSurveyAsSyncing(localId: string): Promise<void> {
  await offlineDb.pendingSurveys.update(localId, {
    syncStatus: 'syncing',
    syncError: undefined,
  });
}

export async function markSurveyAsDone(
  localId: string,
  surveyId: string,
): Promise<void> {
  await offlineDb.pendingSurveys.update(localId, {
    syncStatus: 'done',
    surveyId,
    syncError: undefined,
  });
}

export async function markSurveyAsError(
  localId: string,
  message: string,
): Promise<void> {
  await offlineDb.pendingSurveys.update(localId, {
    syncStatus: 'error',
    syncError: message,
  });
}

export async function savePendingOption(
  questionId: string,
  originalOtherOptionId: string,
  text: string,
): Promise<void> {
  await offlineDb.pendingOptions.put({
    localOptionKey: `${questionId}_other`,
    questionId,
    originalOtherOptionId,
    text,
  });
}

export async function getPendingOption(
  questionId: string,
): Promise<PendingOption | null> {
  const record = await offlineDb.pendingOptions.get(`${questionId}_other`);
  return record ?? null;
}

export async function deletePendingOption(questionId: string): Promise<void> {
  await offlineDb.pendingOptions.delete(`${questionId}_other`);
}

export async function resetStaleSync(): Promise<void> {
  await offlineDb.pendingSurveys
    .where('syncStatus')
    .equals('syncing')
    .modify({ syncStatus: 'pending' });
}
