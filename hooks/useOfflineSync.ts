import { useState, useEffect, useCallback } from "react";
import type { PendingSurvey } from "@/lib/db/offlineDb";
import type {
  InstrumentDraftAnswer,
  CreateResponsePayload,
} from "@/app/(instrument)/types";
import {
  getPendingSurveys,
  markSurveyAsSyncing,
  markSurveyAsDone,
  markSurveyAsError,
  getPendingOption,
  deletePendingOption,
} from "@/lib/db/offlineSurveyService";
import { useAuthStore } from "@/store/useAuthStore";

// * idle: no hay sincronización en curso
// * syncing: se está sincronizando, con conteo de total y completados
// * completed: se sincronizaron todas las encuestas pendientes exitosamente
// * partial: se intentó sincronizar todo pero hubo errores, con conteo de exitosos y fallidos
export type SyncState =
  | { status: "idle" }
  | { status: "syncing"; total: number; done: number }
  | { status: "completed"; synced: number }
  | { status: "partial"; synced: number; failed: number };

// * Construye el payload de respuestas directamente desde los answers del PendingSurvey.
// No usa el store de Zustand para evitar acoplar la lógica de sync al estado de UI.
function buildPayload(
  surveyId: string,
  answers: Record<string, InstrumentDraftAnswer>,
): CreateResponsePayload[] {
  const payload: CreateResponsePayload[] = [];

  for (const answer of Object.values(answers)) {
    if (answer.optionIds !== undefined) {
      // multiple_choice: una entrada por cada opción seleccionada
      for (const optionId of answer.optionIds) {
        payload.push({ surveyId, questionId: answer.questionId, optionId });
      }
    } else {
      payload.push({
        surveyId,
        questionId: answer.questionId,
        optionId: answer.optionId,
        textValue: answer.textValue,
        numericValue: answer.numericValue,
        booleanValue: answer.booleanValue,
      });
    }
  }

  return payload;
}

async function syncOne(
  survey: PendingSurvey,
  apiBaseUrl: string,
): Promise<void> {
  const accessToken = useAuthStore.getState().accessToken;
  const authHeaders: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (accessToken) {
    authHeaders["Authorization"] = `Bearer ${accessToken}`;
  }

  // * 1. Marcar como en proceso de sincronización
  await markSurveyAsSyncing(survey.localId);

  // * 2. Crear encuesta en el servidor para obtener surveyId real
  const surveyRes = await fetch(`${apiBaseUrl}/api/surveys`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({ instrumentIds: [survey.instrumentId] }),
  });

  if (!surveyRes.ok) {
    throw new Error(`POST /surveys falló: ${surveyRes.status}`);
  }

  const { surveyId } = (await surveyRes.json()) as { surveyId: string };

  // * 3. Resolver opciones "Otros" pendientes en IndexedDB
  const resolvedAnswers = { ...survey.answers };

  for (const answer of Object.values(resolvedAnswers)) {
    if (!answer.otherText?.trim()) continue;

    const pending = await getPendingOption(answer.questionId);
    if (!pending) continue;

    const optionRes = await fetch(
      `${apiBaseUrl}/api/questions/${answer.questionId}/options`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: pending.text }),
      },
    );

    if (!optionRes.ok) {
      throw new Error(`POST /options falló: ${optionRes.status}`);
    }

    const newOption = (await optionRes.json()) as { optionId: string };

    resolvedAnswers[answer.questionId] = {
      ...answer,
      optionIds: [
        ...(answer.optionIds ?? []).filter(
          (id) => id !== pending.originalOtherOptionId,
        ),
        newOption.optionId,
      ],
      otherText: undefined,
    };

    await deletePendingOption(answer.questionId);
  }

  // * 4. Construir y enviar el payload de respuestas
  const payload = buildPayload(surveyId, resolvedAnswers);

  const batchRes = await fetch(`${apiBaseUrl}/api/responses/batch`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify(payload),
  });

  if (!batchRes.ok) {
    throw new Error(`POST /responses/batch falló: ${batchRes.status}`);
  }

  // * 6. Marcar survey como sincronizada en el backend
  const syncRes = await fetch(`${apiBaseUrl}/api/surveys/${surveyId}/sync`, {
    method: "PATCH",
    headers: authHeaders,
  });

  if (!syncRes.ok) {
    throw new Error(`PATCH /surveys/${surveyId}/sync falló: ${syncRes.status}`);
  }

  // * 7. Marcar como completada en IndexedDB
  await markSurveyAsDone(survey.localId, surveyId);
}

export function useOfflineSync(apiBaseUrl: string): {
  syncState: SyncState;
  runSync: () => Promise<void>;
} {
  const [syncState, setSyncState] = useState<SyncState>({ status: "idle" });

  const runSync = useCallback(async () => {
    const pending = await getPendingSurveys();

    if (pending.length === 0) return;

    setSyncState({ status: "syncing", total: pending.length, done: 0 });

    let synced = 0;
    let failed = 0;

    for (const survey of pending) {
      try {
        await syncOne(survey, apiBaseUrl);
        synced++;
      } catch (e) {
        const message = e instanceof Error ? e.message : "Error desconocido";
        await markSurveyAsError(survey.localId, message);
        failed++;
      }

      setSyncState({
        status: "syncing",
        total: pending.length,
        done: synced + failed,
      });
    }

    setSyncState(
      failed === 0
        ? { status: "completed", synced }
        : { status: "partial", synced, failed },
    );
  }, [apiBaseUrl]);

  useEffect(() => {
    window.addEventListener("online", runSync);
    return () => window.removeEventListener("online", runSync);
  }, [runSync]);

  return { syncState, runSync };
}
