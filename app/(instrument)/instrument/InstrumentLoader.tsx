'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import InstrumentQuestionFlow from '@/components/instrument/InstrumentQuestionFlow';
import { useCampaignSessionStore } from '@/store/useCampaignSessionStore';
import type { InstrumentResponse } from '@/app/(instrument)/types';

type LoaderState =
  | { phase: 'loading' }
  | { phase: 'error'; message: string }
  | { phase: 'ready'; instrument: InstrumentResponse };

interface InstrumentLoaderProps {
  instrumentId: string;
  apiBaseUrl: string;
  campaignSessionId?: string;
  stepOrder?: number;
  previewMode?: boolean;
  existingSurveyId?: string;
}

export default function InstrumentLoader({
  instrumentId,
  apiBaseUrl,
  campaignSessionId,
  stepOrder,
  previewMode = false,
  existingSurveyId,
}: InstrumentLoaderProps) {
  const router = useRouter();
  const clearSession = useCampaignSessionStore((s) => s.clearSession);
  const [state, setState] = useState<LoaderState>({ phase: 'loading' });

  useEffect(() => {
    if (!campaignSessionId) clearSession();
  }, [campaignSessionId, clearSession]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(
          `${apiBaseUrl}/api/instruments/${instrumentId}/render`,
        );
        if (!res.ok) throw new Error(`Error al cargar el instrumento (${res.status})`);
        const instrument = await res.json() as InstrumentResponse;
        if (!cancelled) setState({ phase: 'ready', instrument });
      } catch (e) {
        if (!cancelled) {
          setState({
            phase: 'error',
            message: e instanceof Error ? e.message : 'No se pudo cargar el instrumento.',
          });
        }
      }
    }

    load();
    return () => { cancelled = true; };
  }, [instrumentId, apiBaseUrl]);

  if (state.phase === 'loading') {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Cargando encuesta...</p>
      </div>
    );
  }

  if (state.phase === 'error') {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4 p-8 text-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="size-12 text-red-400"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
          />
        </svg>
        <p className="text-red-600 font-medium">{state.message}</p>
      </div>
    );
  }

  const { instrument } = state;

  return (
    <InstrumentQuestionFlow
      localId={instrument.instrumentId}
      instrumentId={instrument.instrumentId}
      instrumentName={instrument.name}
      sections={instrument.sections}
      apiBaseUrl={apiBaseUrl}
      campaignSessionId={campaignSessionId}
      stepOrder={stepOrder}
      previewMode={previewMode}
      existingSurveyId={existingSurveyId}
      onPreviewComplete={previewMode ? () => router.replace('/admin/instruments') : undefined}
    />
  );
}
