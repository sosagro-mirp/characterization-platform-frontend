'use client';

import { useEffect } from 'react';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { resetStaleSync } from '@/lib/db/offlineSurveyService';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000';

export default function InstrumentLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { syncState, runSync } = useOfflineSync(apiBaseUrl);

  // * Al montar el layout, reseteamos cualquier encuesta que haya quedado en estado "syncing" 
  useEffect(() => {
    resetStaleSync();
  }, []);

  return (
    <>
      <SyncBanner syncState={syncState} onManualSync={runSync} />
      {children}
    </>
  );
}

type SyncBannerProps = {
  syncState: ReturnType<typeof useOfflineSync>['syncState'];
  onManualSync: () => Promise<void>;
};

function SyncBanner({ syncState, onManualSync }: SyncBannerProps) {
  if (syncState.status === 'idle') return null;

  if (syncState.status === 'syncing') {
    return (
      <div className="bg-blue-50 border-b border-blue-200 px-4 py-2 text-sm text-blue-800 text-center">
        Sincronizando encuestas pendientes… ({syncState.done}/{syncState.total})
      </div>
    );
  }

  if (syncState.status === 'completed') {
    return (
      <div className="bg-green-50 border-b border-green-200 px-4 py-2 text-sm text-green-800 text-center">
        {syncState.synced === 1
          ? '1 encuesta sincronizada exitosamente.'
          : `${syncState.synced} encuestas sincronizadas exitosamente.`}
      </div>
    );
  }

  if (syncState.status === 'partial') {
    return (
      <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2 text-sm text-yellow-800 text-center flex items-center justify-center gap-3">
        <span>
          {syncState.synced} sincronizada{syncState.synced !== 1 ? 's' : ''},{' '}
          {syncState.failed} con error.
        </span>
        <button
          onClick={onManualSync}
          className="underline font-medium hover:text-yellow-900"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return null;
}
