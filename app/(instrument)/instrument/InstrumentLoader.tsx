'use client';

import { useEffect, useState } from 'react';
import InstrumentQuestionFlow from '@/components/instrument/InstrumentQuestionFlow';
import {
  cacheInstrument,
  getCachedInstrument,
  createPendingSurvey,
} from '@/lib/db/offlineSurveyService';
import { offlineDb } from '@/lib/db/offlineDb';
import type { InstrumentResponse } from '@/app/(instrument)/types';
import type { PendingSurvey } from '@/lib/db/offlineDb';

// TODO: obtener desde URL params o configuración cuando se soporte multi-instrumento
const INSTRUMENT_ID = '3b7bae0d-4bea-4a56-af4c-bfe65a9f887c';

// * Distintos estados de carga 
type LoaderState =
  | { phase: 'loading' }
  | { phase: 'error'; message: string }
  | {
    phase: 'resume_prompt';
    instrument: InstrumentResponse;
    existing: PendingSurvey;
    isOffline: boolean;
  }
  | {
    phase: 'ready';
    instrument: InstrumentResponse;
    localId: string;
    isOffline: boolean;
  };

interface InstrumentLoaderProps {
  apiBaseUrl: string;
}

export default function InstrumentLoader({ apiBaseUrl }: InstrumentLoaderProps) {
  const [state, setState] = useState<LoaderState>({ phase: 'loading' });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      let instrument: InstrumentResponse | null = null;
      let isOffline = false;

      // Paso 1: intentar fetch al servidor
      try {
        const res = await fetch(
          `${apiBaseUrl}/api/instruments/${INSTRUMENT_ID}/render`,
        );
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        instrument = await res.json() as InstrumentResponse;

        // Paso 2: guardar en caché si se pudo obtener
        await cacheInstrument(instrument);
      } catch {
        isOffline = true;

        // Paso 3: intentar leer desde caché
        instrument = await getCachedInstrument(INSTRUMENT_ID);
      }

      // Paso 4: sin red y sin caché → error irrecuperable
      if (!instrument) {
        if (!cancelled) {
          setState({
            phase: 'error',
            message:
              'Sin conexión y sin datos en caché. Conéctate a internet e intenta de nuevo.',
          });
        }
        return;
      }

      // Paso 5: buscar encuesta local pendiente para el mismo instrumento
      const existing = await offlineDb.pendingSurveys
        .where('instrumentId')
        .equals(INSTRUMENT_ID)
        .and((s) => s.syncStatus === 'pending')
        .first();

      if (cancelled) return;

      if (existing) {
        setState({ phase: 'resume_prompt', instrument, existing, isOffline });
      } else {
        // Paso 6: crear nueva encuesta local
        const localId = await createPendingSurvey({
          instrumentId: instrument.instrumentId,
          instrumentName: instrument.name,
          instrumentVersion: instrument.version,
        });
        setState({ phase: 'ready', instrument, localId, isOffline });
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [apiBaseUrl]);

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

  if (state.phase === 'resume_prompt') {
    const { instrument, existing, isOffline } = state;

    const handleResume = () => {
      setState({ phase: 'ready', instrument, localId: existing.localId, isOffline });
    };

    const handleFresh = async () => {
      const localId = await createPendingSurvey({
        instrumentId: instrument.instrumentId,
        instrumentName: instrument.name,
        instrumentVersion: instrument.version,
      });
      setState({ phase: 'ready', instrument, localId, isOffline });
    };

    return (
      <div className="flex flex-col items-center justify-center h-screen gap-6 p-8 max-w-md mx-auto text-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="size-12 text-green-700"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
          />
        </svg>
        <h2 className="text-xl font-bold text-gray-800">Encuesta en progreso</h2>
        <p className="text-gray-600">
          Tienes una encuesta sin terminar de{' '}
          <strong>{instrument.name}</strong>. ¿Deseas continuar donde lo
          dejaste?
        </p>
        <div className="flex flex-col w-full gap-3">
          <button
            type="button"
            onClick={handleResume}
            className="bg-green-900 text-white px-4 py-3 rounded-xl font-medium"
          >
            Continuar encuesta
          </button>
          <button
            type="button"
            onClick={handleFresh}
            className="border border-gray-300 px-4 py-3 rounded-xl text-gray-700"
          >
            Empezar de cero
          </button>
        </div>
      </div>
    );
  }

  // phase === 'ready'
  const { instrument, localId, isOffline } = state;

  return (
    <InstrumentQuestionFlow
      localId={localId}
      instrumentName={instrument.name}
      sections={instrument.sections}
      isOffline={isOffline}
      apiBaseUrl={apiBaseUrl}
    />
  );
}
