/**
 * Envío de una encuesta web: respuestas en batch y, después, marca de
 * sincronizada (`PATCH /api/surveys/:id/sync`).
 *
 * Bug `web-survey-sync` (2026-11-07): la web nunca marcaba sus encuestas como
 * sincronizadas, así que quedaban con `sincronized = false` y no contaban en la
 * cobertura (`isCountableSurvey`) ni en el dashboard. El móvil sí lo hace al
 * terminar de subir cada encuesta.
 *
 * La marca va después del batch para no contar una encuesta sin respuestas. Si
 * falla, se reintenta una vez; un segundo fallo no invalida el envío (las
 * respuestas ya están guardadas) y se informa en `synced: false` para que quien
 * llama lo registre. Función pura con dependencias inyectadas, para probarla
 * sin red.
 */

export interface SubmitAndSyncDeps<TPayload> {
  submitBatch: (payload: TPayload) => Promise<unknown>;
  markSynced: (surveyId: string) => Promise<unknown>;
}

export interface SubmitAndSyncResult {
  synced: boolean;
}

export async function submitAndSync<TPayload>(
  deps: SubmitAndSyncDeps<TPayload>,
  surveyId: string,
  payload: TPayload,
): Promise<SubmitAndSyncResult> {
  // Un error del batch se propaga tal cual: el llamador ya distingue 401.
  await deps.submitBatch(payload);

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      await deps.markSynced(surveyId);
      return { synced: true };
    } catch {
      // reintento único
    }
  }
  return { synced: false };
}
