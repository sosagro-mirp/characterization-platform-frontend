/**
 * Spec 102 — registro de un productor nuevo desde `/productores/nuevo`.
 * El consentimiento se captura antes de S_REG y se registra con `surveyId`
 * justo después de crear la encuesta, antes del batch. Como S_REG se aplica
 * en otra ruta (`/instrument/[id]`), los valores viajan en `sessionStorage`.
 */
import type { ConsentPayload } from "@/lib/consents/consentSubmission";

const KEY = "sosagro.pendingRegistrationConsent";

export const REGISTRO_QUERY = "registro=1";
export const NEW_PRODUCER_PATH = "/productores/nuevo";

export function savePendingConsent(values: ConsentPayload): void {
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(values));
  } catch {
    // sin storage: el registro avisará que falta el consentimiento
  }
}

export function loadPendingConsent(): ConsentPayload | null {
  try {
    const raw = window.sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as ConsentPayload) : null;
  } catch {
    return null;
  }
}

export function clearPendingConsent(): void {
  try {
    window.sessionStorage.removeItem(KEY);
  } catch {
    // nada que limpiar
  }
}

export function registroInstrumentPath(instrumentId: string): string {
  return `/instrument/${instrumentId}?${REGISTRO_QUERY}`;
}

export function afterRegistroPath(surveyId: string): string {
  return `${NEW_PRODUCER_PATH}?completedSurveyId=${surveyId}`;
}
