import type { InstrumentDraftAnswer } from "@/app/(instrument)/types";

/**
 * Spec 79 — arma el envío único y atómico de una encuesta pública
 * (POST /api/public/surveys). A diferencia de
 * useInstrumentSurveyStore.buildResponsesPayload, ninguna respuesta lleva
 * `surveyId`: la encuesta no existe todavía en el momento del envío, la crea
 * el propio backend dentro de la misma transacción.
 *
 * Función pura, separada del componente, para poder probarla sin renderizar
 * (mismo patrón que lib/isQuestionVisible.ts y lib/consents/*).
 */

export interface PublicSurveyConsentInput {
  consentDocumentId?: string;
  acceptedDataProcessing: boolean;
  acceptedPhoto?: boolean;
  acceptedAudio?: boolean;
  acceptedVideo?: boolean;
  acceptedFollowUpContact?: boolean;
}

export interface PublicSurveyResponseItem {
  questionId: string;
  optionId?: string;
  textValue?: string;
  numericValue?: number;
  booleanValue?: boolean;
}

export interface PublicSubmissionPayload {
  instrumentId: string;
  consent: {
    consentDocumentId?: string;
    acceptedDataProcessing: boolean;
    acceptedPhoto: boolean;
    acceptedAudio: boolean;
    acceptedVideo: boolean;
    acceptedFollowUpContact: boolean;
  };
  responses: PublicSurveyResponseItem[];
}

export interface BuildPublicSubmissionPayloadParams {
  instrumentId: string;
  consent: PublicSurveyConsentInput;
  answers: Record<string, InstrumentDraftAnswer>;
}

export function buildPublicSubmissionPayload({
  instrumentId,
  consent,
  answers,
}: BuildPublicSubmissionPayloadParams): PublicSubmissionPayload {
  if (!consent.acceptedDataProcessing) {
    throw new Error(
      "La autorización de tratamiento de datos es obligatoria para enviar la encuesta.",
    );
  }

  const responses: PublicSurveyResponseItem[] = [];

  Object.values(answers).forEach((answer) => {
    // multiple_choice: una fila por opción seleccionada, igual que
    // buildResponsesPayload en useInstrumentSurveyStore.
    if (answer.optionIds && answer.optionIds.length > 0) {
      answer.optionIds.forEach((optionId) => {
        responses.push({ questionId: answer.questionId, optionId });
      });
      return;
    }

    const trimmedText = answer.textValue?.trim();
    const item: PublicSurveyResponseItem = {
      questionId: answer.questionId,
      ...(answer.optionId !== undefined && { optionId: answer.optionId }),
      ...(trimmedText ? { textValue: trimmedText } : {}),
      ...(answer.numericValue !== undefined && {
        numericValue: answer.numericValue,
      }),
      ...(answer.booleanValue !== undefined && {
        booleanValue: answer.booleanValue,
      }),
    };

    const hasValue =
      "optionId" in item ||
      "textValue" in item ||
      "numericValue" in item ||
      "booleanValue" in item;

    if (hasValue) responses.push(item);
  });

  if (responses.length === 0) {
    throw new Error("No hay respuestas para enviar.");
  }

  return {
    instrumentId,
    consent: {
      ...(consent.consentDocumentId && {
        consentDocumentId: consent.consentDocumentId,
      }),
      acceptedDataProcessing: consent.acceptedDataProcessing,
      acceptedPhoto: consent.acceptedPhoto ?? false,
      acceptedAudio: consent.acceptedAudio ?? false,
      acceptedVideo: consent.acceptedVideo ?? false,
      acceptedFollowUpContact: consent.acceptedFollowUpContact ?? false,
    },
    responses,
  };
}
