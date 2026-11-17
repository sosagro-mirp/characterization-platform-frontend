/**
 * Spec 102 — ancla del consentimiento sin sesión de campaña, y aviso (no
 * bloqueante) de la ficha del encuestador. Funciones puras.
 */
import type { ConsentVigencyStatus } from "./resolveConsentRequirement";

export type ConsentAnchor =
  | { sessionId: string }
  | { farmerId: string }
  | { surveyId: string };

export function resolveConsentAnchor(input: {
  sessionId?: string | null;
  farmerId?: string | null;
  surveyId?: string | null;
}): ConsentAnchor {
  const present = (
    [
      ["sessionId", input.sessionId],
      ["farmerId", input.farmerId],
      ["surveyId", input.surveyId],
    ] as const
  ).filter(([, value]) => Boolean(value));
  if (present.length !== 1) {
    throw new Error(
      "El consentimiento requiere exactamente un ancla: sessionId, farmerId o surveyId",
    );
  }
  const [key, value] = present[0];
  return { [key]: value } as ConsentAnchor;
}

export type ConsentNotice = "none" | "pending" | "outdated" | "unknown";

export function consentNoticeForFarmer(
  status: { status: ConsentVigencyStatus; acceptedVersion: string | null } | null,
): ConsentNotice {
  if (!status) return "unknown";
  switch (status.status) {
    case "valid":
      return "none";
    case "outdated_version":
      return "outdated";
    default:
      return "pending";
  }
}
