/**
 * Spec 79 — construye la URL pública que el panel administrativo copia para
 * compartir un instrumento (/encuesta/{instrumentId}). Función pura,
 * separada del componente que la usa (patrón ya establecido en este
 * repositorio: ver lib/isQuestionVisible.ts, lib/consents/*).
 */
export function buildPublicSurveyUrl(origin: string, instrumentId: string): string {
  const trimmedOrigin = origin.replace(/\/+$/, "");
  return `${trimmedOrigin}/encuesta/${instrumentId}`;
}
