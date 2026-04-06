import type { InstrumentResponse } from '@/app/(instrument)/types';
import { offlineDb } from './offlineDb';

export async function cacheInstrument(data: InstrumentResponse): Promise<void> {
  await offlineDb.instruments.put({
    instrumentId: data.instrumentId,
    data,
    cachedAt: Date.now(),
  });
}
