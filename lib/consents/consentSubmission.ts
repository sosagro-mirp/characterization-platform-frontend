/**
 * Spec 78 — construcción del payload de `POST /api/consents` a partir de lo
 * que el encuestador capturó en `ConsentForm`. Función pura, separada del
 * componente, para poder probarla sin renderizar.
 */

export interface BuildConsentPayloadParams {
  sessionId: string;
  consentDocumentId: string;
  respondentName: string;
  acceptedDataProcessing: boolean;
  acceptedPhoto: boolean;
  acceptedAudio: boolean;
  acceptedVideo: boolean;
  acceptedFollowUpContact: boolean;
  acceptedAt: Date;
}

export interface ConsentPayload {
  sessionId: string;
  consentDocumentId: string;
  respondentName: string;
  acceptedDataProcessing: boolean;
  acceptedPhoto: boolean;
  acceptedAudio: boolean;
  acceptedVideo: boolean;
  acceptedFollowUpContact: boolean;
  acceptedAt: string;
}

/**
 * No incluye `respondentDocumentId`: esta pantalla precede a S1 (donde se
 * captura el documento formalmente) y no debe duplicar esa captura.
 */
export function buildConsentPayload(params: BuildConsentPayloadParams): ConsentPayload {
  return {
    sessionId: params.sessionId,
    consentDocumentId: params.consentDocumentId,
    respondentName: params.respondentName,
    acceptedDataProcessing: params.acceptedDataProcessing,
    acceptedPhoto: params.acceptedPhoto,
    acceptedAudio: params.acceptedAudio,
    acceptedVideo: params.acceptedVideo,
    acceptedFollowUpContact: params.acceptedFollowUpContact,
    acceptedAt: params.acceptedAt.toISOString(),
  };
}
