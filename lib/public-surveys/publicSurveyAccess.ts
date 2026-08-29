/**
 * Spec 79 — decide qué pantalla mostrar al abrir /encuesta/{instrumentId}
 * a partir de la respuesta de `GET /api/public/surveys/:instrumentId` (o del
 * `POST` de envío, que puede fallar con el mismo tipo de motivo si el enlace
 * se cerró entre la carga y el envío — criterio 9).
 *
 * Función pura, separada del componente, para poder probarla sin renderizar
 * (mismo patrón que lib/isQuestionVisible.ts y lib/consents/*).
 */

export interface PublicSurveyLoadResult {
  /** HTTP status de la respuesta. Un valor no numérico representa un id con formato inválido, rechazado antes de llamar al servidor. */
  status: number | string;
  body: unknown;
}

export type PublicSurveyAccessState = "available" | "closed" | "not_found" | "error";

export interface PublicSurveyAccess {
  state: PublicSurveyAccessState;
  message?: string;
}

const CLOSED_MESSAGE = "Esta encuesta ya no está recibiendo respuestas.";
const NOT_FOUND_MESSAGE = "El enlace no es válido o la encuesta no existe.";
const ERROR_MESSAGE = "No se pudo cargar el formulario. Intenta de nuevo.";

export function resolvePublicSurveyAccess(
  result: PublicSurveyLoadResult,
): PublicSurveyAccess {
  if (typeof result.status !== "number") {
    return { state: "not_found", message: NOT_FOUND_MESSAGE };
  }

  if (result.status === 200) {
    return { state: "available" };
  }

  if (result.status === 404) {
    const reason = (result.body as { reason?: string } | null)?.reason;
    if (reason === "closed") {
      return { state: "closed", message: CLOSED_MESSAGE };
    }
    return { state: "not_found", message: NOT_FOUND_MESSAGE };
  }

  // Criterio 9 — el envío puede rechazarse con 403 si el enlace se cerró
  // entre la carga del formulario y el clic en "Finalizar".
  if (result.status === 403) {
    return { state: "closed", message: CLOSED_MESSAGE };
  }

  return { state: "error", message: ERROR_MESSAGE };
}
