import { create } from "zustand";
import type {
  CreateResponsePayload,
  InitializeSurveyPayload,
  InstrumentDraftAnswer,
  InstrumentQuestion,
  SubmitResult,
} from "@/app/(instrument)/types";
import { isQuestionVisible } from "@/lib/isQuestionVisible";
import { createSurvey, submitBatchResponses } from "@/services/surveys.service";
import { createOption } from "@/services/options.service";
import { ApiError } from "@/lib/apiClient";
import { submitPublicSurvey } from "@/services/public-surveys.service";
import {
  buildPublicSubmissionPayload,
  type PublicSurveyConsentInput,
} from "@/lib/public-surveys/publicSurveyPayload";

interface FlattenedQuestionItem {
  sectionId: string;
  sectionName: string;
  sectionOrder: number;
  question: InstrumentQuestion;
}

/**
 * Compartido por submitResponses (autenticado) y submitPublicResponses
 * (canal público, spec 79): resuelve las opciones dinámicas de "Otro" antes
 * de armar el payload de envío. `createOption` es un endpoint @Public() en
 * el backend, así que funciona igual sin sesión.
 */
async function resolveOtherTextAnswers(
  flattenedQuestions: FlattenedQuestionItem[],
  answers: Record<string, InstrumentDraftAnswer>,
): Promise<
  | { ok: true; answers: Record<string, InstrumentDraftAnswer> }
  | { ok: false; message: string }
> {
  const updatedAnswers = { ...answers };

  for (const { question } of flattenedQuestions) {
    const answer = answers[question.questionId];
    if (!answer?.otherText?.trim()) continue;

    const otherOption = question.options.find((o) => o.isOther);
    if (!otherOption) continue;

    const isMultiple = question.type.name === "multiple_choice";
    const otherSelected = isMultiple
      ? (answer.optionIds ?? []).includes(otherOption.optionId)
      : answer.optionId === otherOption.optionId;

    if (!otherSelected) continue;

    try {
      const newOption = await createOption(
        question.questionId,
        answer.otherText.trim(),
      );
      updatedAnswers[question.questionId] = isMultiple
        ? {
            ...answer,
            optionIds: [
              ...(answer.optionIds ?? []).filter(
                (id) => id !== otherOption.optionId,
              ),
              newOption.optionId,
            ],
            otherText: undefined,
          }
        : {
            ...answer,
            optionId: newOption.optionId,
            otherText: undefined,
          };
    } catch {
      return {
        ok: false,
        message: "Error al guardar la nueva opción. Intenta nuevamente.",
      };
    }
  }

  return { ok: true, answers: updatedAnswers };
}

// Spec 79 — resultado del envío público. Deliberadamente distinto de
// SubmitResult: no hay "session_expired" (no hay sesión que expire) y sí
// "closed", el equivalente a que el enlace se haya desactivado entre la
// carga del formulario y el envío (criterio 9).
export type PublicSubmitResult =
  | { outcome: "submitted"; surveyId: string }
  | { outcome: "closed" }
  | { outcome: "error"; message: string };

interface InstrumentSurveyState {
  localId?: string;
  surveyId?: string;
  instrumentId?: string;
  instrumentName: string;
  flattenedQuestions: FlattenedQuestionItem[];
  currentIndex: number;
  answers: Record<string, InstrumentDraftAnswer>;
  submitting: boolean;
  error?: string;
  initialized: boolean;
  initializeSurvey: (payload: InitializeSurveyPayload) => void;
  setAnswer: (answer: InstrumentDraftAnswer) => void;
  goNext: () => void;
  goPrevious: () => void;
  clearError: () => void;
  resetSurvey: () => void;
  buildResponsesPayload: () => CreateResponsePayload[];
  submitResponses: (
    campaignContext?: { campaignSessionId?: string; stepOrder?: number; existingSurveyId?: string },
  ) => Promise<SubmitResult>;
  submitPublicResponses: (
    consent: PublicSurveyConsentInput,
  ) => Promise<PublicSubmitResult>;
}

const initialState = {
  localId: undefined,
  surveyId: undefined,
  instrumentId: undefined,
  instrumentName: "",
  flattenedQuestions: [],
  currentIndex: 0,
  answers: {},
  submitting: false,
  error: undefined,
  initialized: false,
};

export const useInstrumentSurveyStore = create<InstrumentSurveyState>(
  (set, get) => ({
    ...initialState,

    initializeSurvey: ({ localId, instrumentId, instrumentName, sections }) => {
      const state = get();

      const flattenedQuestions = [...sections]
        .sort((a, b) => a.order - b.order)
        .flatMap((section) =>
          [...section.questions]
            .sort((a, b) => a.order - b.order)
            .map((question) => ({
              sectionId: section.sectionId,
              sectionName: section.name,
              sectionOrder: section.order,
              question,
            })),
        );

      if (state.initialized && state.localId === localId) {
        set({ flattenedQuestions });
        return;
      }

      set({
        localId,
        surveyId: undefined,
        instrumentId,
        instrumentName,
        flattenedQuestions,
        currentIndex: 0,
        answers: {},
        submitting: false,
        error: undefined,
        initialized: true,
      });
    },

    setAnswer: (answer) => {
      set((state) => ({
        answers: { ...state.answers, [answer.questionId]: answer },
      }));
    },

    goNext: () => {
      set((state) => {
        const { currentIndex, flattenedQuestions, answers } = state;
        let next = currentIndex + 1;
        while (
          next < flattenedQuestions.length &&
          !isQuestionVisible(flattenedQuestions[next].question, answers)
        ) {
          next++;
        }
        return {
          currentIndex: next < flattenedQuestions.length ? next : currentIndex,
        };
      });
    },

    goPrevious: () => {
      set((state) => {
        const { currentIndex, flattenedQuestions, answers } = state;
        let prev = currentIndex - 1;
        while (
          prev >= 0 &&
          !isQuestionVisible(flattenedQuestions[prev].question, answers)
        ) {
          prev--;
        }
        return { currentIndex: prev >= 0 ? prev : currentIndex };
      });
    },

    clearError: () => set({ error: undefined }),

    resetSurvey: () => set(initialState),

    buildResponsesPayload: () => {
      const { surveyId, flattenedQuestions, answers } = get();

      if (!surveyId) {
        return [];
      }

      const payload: CreateResponsePayload[] = [];

      flattenedQuestions
        .filter(({ question }) => isQuestionVisible(question, answers))
        .forEach(({ question }) => {
          const answer = answers[question.questionId];

          if (!answer) {
            return;
          }

          if (question.type.name === "multiple_choice") {
            const selectedOptionIds = answer.optionIds ?? [];

            selectedOptionIds.forEach((optionId) => {
              payload.push({
                surveyId,
                questionId: question.questionId,
                optionId,
              });
            });

            return;
          }

          const trimmedText = answer.textValue?.trim();
          const item = {
            surveyId,
            questionId: answer.questionId,
            ...(answer.optionId !== undefined && { optionId: answer.optionId }),
            ...(trimmedText ? { textValue: trimmedText } : {}),
            ...(answer.numericValue !== undefined && { numericValue: answer.numericValue }),
            ...(answer.booleanValue !== undefined && { booleanValue: answer.booleanValue }),
          };

          const hasValue =
            "optionId" in item ||
            "textValue" in item ||
            "numericValue" in item ||
            "booleanValue" in item;

          if (hasValue) payload.push(item);
        });

      return payload;
    },

    submitResponses: async (
      campaignContext?: { campaignSessionId?: string; stepOrder?: number; existingSurveyId?: string },
    ): Promise<SubmitResult> => {
      const { instrumentId, flattenedQuestions, answers, buildResponsesPayload } = get();

      if (!instrumentId) {
        return { outcome: "error", message: "No hay encuesta activa" };
      }

      set({ submitting: true, error: undefined });

      const otherTextResult = await resolveOtherTextAnswers(
        flattenedQuestions,
        answers,
      );
      if (!otherTextResult.ok) {
        set({ error: otherTextResult.message, submitting: false });
        return { outcome: "error", message: otherTextResult.message };
      }
      const updatedAnswers = otherTextResult.answers;

      set({ answers: updatedAnswers });

      // Obtener surveyId: usar el existente (overwrite) o crear uno nuevo
      let surveyId: string;

      if (campaignContext?.existingSurveyId) {
        surveyId = campaignContext.existingSurveyId;
        set({ surveyId });
      } else {
        try {
          const surveyData = await createSurvey({
            instrumentIds: [instrumentId],
            ...(campaignContext?.campaignSessionId && { campaignSessionId: campaignContext.campaignSessionId }),
            ...(typeof campaignContext?.stepOrder === "number" && { stepOrder: campaignContext.stepOrder }),
          });

          surveyId = surveyData.surveyId;
          set({ surveyId });
        } catch (e) {
          const isUnauthorized = e instanceof Error && e.message.includes("401");
          if (isUnauthorized) {
            set({ submitting: false });
            return { outcome: "session_expired" };
          }
          const message =
            e instanceof Error
              ? e.message
              : "Error al crear la encuesta en el servidor";
          set({ error: message, submitting: false });
          return { outcome: "error", message };
        }
      }

      const payload = buildResponsesPayload();

      if (payload.length === 0) {
        set({ error: "No hay respuestas para enviar", submitting: false });
        return { outcome: "error", message: "No hay respuestas para enviar" };
      }

      try {
        await submitBatchResponses(payload);
        set({ submitting: false });
        return { outcome: "submitted" };
      } catch (e) {
        const isUnauthorized = e instanceof Error && e.message.includes("401");
        if (isUnauthorized) {
          set({ submitting: false });
          return { outcome: "session_expired" };
        }
        const message =
          e instanceof Error ? e.message : "Error al enviar respuestas";
        set({ error: message, submitting: false });
        return { outcome: "error", message };
      }
    },

    // Spec 79 — envío del canal público: una sola llamada atómica
    // (instrumento + consentimiento + respuestas), sin crear un survey
    // aparte primero. No hay campaignContext ni existingSurveyId: el canal
    // público no tiene sesión de campaña ni permite reanudar un borrador.
    submitPublicResponses: async (
      consent: PublicSurveyConsentInput,
    ): Promise<PublicSubmitResult> => {
      const { instrumentId, flattenedQuestions, answers } = get();

      if (!instrumentId) {
        return { outcome: "error", message: "No hay encuesta activa" };
      }

      set({ submitting: true, error: undefined });

      const otherTextResult = await resolveOtherTextAnswers(
        flattenedQuestions,
        answers,
      );
      if (!otherTextResult.ok) {
        set({ error: otherTextResult.message, submitting: false });
        return { outcome: "error", message: otherTextResult.message };
      }
      const updatedAnswers = otherTextResult.answers;
      set({ answers: updatedAnswers });

      let payload;
      try {
        payload = buildPublicSubmissionPayload({
          instrumentId,
          consent,
          answers: updatedAnswers,
        });
      } catch (e) {
        const message =
          e instanceof Error ? e.message : "No hay respuestas para enviar";
        set({ error: message, submitting: false });
        return { outcome: "error", message };
      }

      try {
        const result = await submitPublicSurvey(payload);
        set({ submitting: false, surveyId: result.surveyId });
        return { outcome: "submitted", surveyId: result.surveyId };
      } catch (e) {
        // 403 (enlace cerrado a mitad de camino) y 404 (instrumento ya no
        // existe/dejó de ser público) se tratan igual del lado del cliente:
        // ver criterio 9 y resolvePublicSurveyAccess.
        if (e instanceof ApiError && (e.status === 403 || e.status === 404)) {
          set({ submitting: false });
          return { outcome: "closed" };
        }
        const message =
          e instanceof Error ? e.message : "Error al enviar la encuesta";
        set({ error: message, submitting: false });
        return { outcome: "error", message };
      }
    },
  }),
);
