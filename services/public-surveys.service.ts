import { apiClient, ApiError } from "@/lib/apiClient";
import type { InstrumentResponse } from "@/app/(instrument)/types";
import type { ConsentDocument } from "@/services/consents.service";
import type {
  PublicSubmissionPayload,
} from "@/lib/public-surveys/publicSurveyPayload";
import type { PublicSurveyLoadResult } from "@/lib/public-surveys/publicSurveyAccess";

/**
 * Spec 79 — cliente del canal público. Sin JWT: `withAuth: false` en cada
 * llamada, aunque no sería estrictamente necesario (un visitante público no
 * tiene token en el store), lo deja explícito en vez de depender de la
 * ausencia accidental de sesión.
 */

export interface PublicInstrumentResponse extends InstrumentResponse {
  consentDocument: ConsentDocument;
}

export interface PublicSurveySubmitResult {
  surveyId: string;
}

/**
 * Traduce cualquier resultado (éxito o error) a la forma que
 * `resolvePublicSurveyAccess` espera, sin lanzar — la carga inicial nunca
 * debe tirar una excepción no capturada a React.
 */
export async function loadPublicInstrument(
  instrumentId: string,
): Promise<{ result: PublicSurveyLoadResult; data: PublicInstrumentResponse | null }> {
  try {
    const data = await apiClient.get<PublicInstrumentResponse>(
      `/api/public/surveys/${instrumentId}`,
      { cache: "no-store", withAuth: false },
    );
    return { result: { status: 200, body: data }, data };
  } catch (err) {
    if (err instanceof ApiError) {
      return { result: { status: err.status, body: err.body }, data: null };
    }
    return { result: { status: 0, body: null }, data: null };
  }
}

/**
 * A diferencia de loadPublicInstrument, este SÍ propaga la excepción: el
 * llamador (useInstrumentSurveyStore.submitPublicResponses) necesita
 * distinguir el resultado con su propio manejo de estado de envío.
 */
export function submitPublicSurvey(
  payload: PublicSubmissionPayload,
): Promise<PublicSurveySubmitResult> {
  return apiClient.post<PublicSurveySubmitResult>("/api/public/surveys", payload, {
    withAuth: false,
  });
}
