/**
 * Spec 78 — lógica pura de cuándo pedir el consentimiento informado y cuándo
 * el botón de "Continuar" de esa pantalla puede habilitarse.
 *
 * Función pura para poder probarla sin renderizar (mismo patrón que
 * `isQuestionVisible.ts`).
 */

export type ConsentVigencyStatus = "valid" | "outdated_version" | "revoked" | "none";

export interface ConsentStatus {
  status: ConsentVigencyStatus;
  acceptedVersion: string | null;
}

interface ResolveConsentRequirementParams {
  mode: "new" | "existing";
  /** Respuesta de `GET /api/farmers/:id/consent`, o `null` si no se pudo consultar. */
  consentStatus: ConsentStatus | null;
  activeVersion: string | null;
}

/**
 * Un encuestado nuevo siempre lo requiere (criterio 1). Uno ya conocido solo
 * lo requiere si su última constancia no está "valid" para la versión
 * activa — ante cualquier duda (estado desconocido, consulta fallida) se
 * exige el consentimiento: nunca se omite por defecto.
 */
export function resolveConsentRequirement({
  mode,
  consentStatus,
}: ResolveConsentRequirementParams): boolean {
  if (mode === "new") return true;
  if (!consentStatus) return true;
  return consentStatus.status !== "valid";
}

export interface ConsentFormValues {
  acceptedDataProcessing: boolean;
  acceptedPhoto: boolean;
  acceptedAudio: boolean;
  acceptedVideo: boolean;
}

/**
 * Único requisito para continuar: la autorización de tratamiento de datos.
 * Las autorizaciones multimedia son independientes y nunca bloquean (criterio 3).
 */
export function isConsentSubmittable(values: ConsentFormValues): boolean {
  return values.acceptedDataProcessing === true;
}
