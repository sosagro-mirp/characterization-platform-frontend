import { create } from "zustand";
import type {
  CreateResponsePayload,
  InitializeSurveyPayload,
  InstrumentDraftAnswer,
  InstrumentQuestion,
  SubmitResult,
} from "@/app/(instrument)/types";
import {
  updateSurveyProgress,
  markSurveyAsDone,
  savePendingOption,
} from "@/lib/db/offlineSurveyService";
import { offlineDb } from "@/lib/db/offlineDb";
import { isQuestionVisible } from "@/lib/isQuestionVisible";
import { useAuthStore } from "@/store/useAuthStore";

interface FlattenedQuestionItem {
  sectionId: string;
  sectionName: string;
  sectionOrder: number;
  question: InstrumentQuestion;
}

interface InstrumentSurveyState {
  localId?: string;
  surveyId?: string;
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
    apiBaseUrl: string,
    campaignContext?: { campaignSessionId?: string; stepOrder?: number },
  ) => Promise<SubmitResult>;
}

const initialState = {
  localId: undefined,
  surveyId: undefined,
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

    initializeSurvey: ({ localId, instrumentName, sections }) => {
      const state = get();

      if (state.initialized && state.localId === localId) {
        return;
      }

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

      set({
        localId,
        surveyId: undefined,
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
      set((state) => {
        const updatedAnswers = {
          ...state.answers,
          [answer.questionId]: answer,
        };

        if (state.localId) {
          updateSurveyProgress(
            state.localId,
            updatedAnswers,
            state.currentIndex,
          ).catch((e) =>
            console.warn("[offlineDb] updateSurveyProgress failed:", e),
          );
        }

        return { answers: updatedAnswers };
      });
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

    // * Convertir las respuestas guardadas en el store en una lista para enviar al servidor
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

        payload.push({
          surveyId,
          questionId: answer.questionId,
          optionId: answer.optionId,
          textValue: answer.textValue,
          numericValue: answer.numericValue,
          booleanValue: answer.booleanValue,
        });
      });

      return payload;
    },

    // * Enviar respuestas al servidor
    submitResponses: async (
      apiBaseUrl: string,
      campaignContext?: { campaignSessionId?: string; stepOrder?: number },
    ): Promise<SubmitResult> => {
      // * 1. Validaciones iniciales
      const { localId, flattenedQuestions, answers, buildResponsesPayload } =
        get();

      if (!localId) {
        return { outcome: "error", message: "No hay encuesta activa" };
      }

      set({ submitting: true, error: undefined });

      // * 2. Pre-paso: crear opciones dinámicas para respuestas con otherText
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
          const res = await fetch(
            `${apiBaseUrl}/api/questions/${question.questionId}/options`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ text: answer.otherText.trim() }),
            },
          );

          if (!res.ok) throw new Error(`Server error: ${res.status}`);

          const newOption = await res.json();
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
        } catch (e) {
          if (e instanceof TypeError) {
            // * Sin red: guardar opción "Otros" en IndexedDB para resolver en sync
            await savePendingOption(
              question.questionId,
              otherOption.optionId,
              answer.otherText.trim(),
            );
            set({ submitting: false });
            return { outcome: "saved_offline" };
          }
          const message =
            "Error al guardar la nueva opción. Intenta nuevamente.";
          set({ error: message, submitting: false });
          return { outcome: "error", message };
        }
      }

      set({ answers: updatedAnswers });

      // *3. Crear encuesta en el servidor para obtener surveyId real
      let surveyId: string;

      try {
        const pendingSurvey = await offlineDb.pendingSurveys.get(localId);
        if (!pendingSurvey) {
          throw new Error("No se encontró la encuesta local");
        }

        const accessToken = useAuthStore.getState().accessToken;
        const surveyHeaders: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (accessToken) {
          surveyHeaders["Authorization"] = `Bearer ${accessToken}`;
        }

        const surveyBody: Record<string, unknown> = {
          instrumentIds: [pendingSurvey.instrumentId],
        };
        if (campaignContext?.campaignSessionId) {
          surveyBody.campaignSessionId = campaignContext.campaignSessionId;
        }
        if (typeof campaignContext?.stepOrder === "number") {
          surveyBody.stepOrder = campaignContext.stepOrder;
        }

        const surveyRes = await fetch(`${apiBaseUrl}/api/surveys`, {
          method: "POST",
          headers: surveyHeaders,
          body: JSON.stringify(surveyBody),
        });

        if (surveyRes.status === 401) {
          set({ submitting: false });
          return { outcome: "session_expired" };
        }
        if (!surveyRes.ok) throw new Error(`Server error: ${surveyRes.status}`);

        const surveyData = await surveyRes.json();
        surveyId = surveyData.surveyId;
        set({ surveyId });
      } catch (e) {
        if (e instanceof TypeError) {
          set({ submitting: false });
          return { outcome: "saved_offline" };
        }
        const message =
          e instanceof Error
            ? e.message
            : "Error al crear la encuesta en el servidor";
        set({ error: message, submitting: false });
        return { outcome: "error", message };
      }

      // *4. Construir payload con el surveyId real ya disponible en state
      const payload = buildResponsesPayload();

      if (payload.length === 0) {
        set({ error: "No hay respuestas para enviar", submitting: false });
        return { outcome: "error", message: "No hay respuestas para enviar" };
      }

      // *5. Enviar respuestas al servidor
      try {
        const accessToken = useAuthStore.getState().accessToken;
        const batchHeaders: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (accessToken) {
          batchHeaders["Authorization"] = `Bearer ${accessToken}`;
        }

        const res = await fetch(`${apiBaseUrl}/api/responses/batch`, {
          method: "POST",
          headers: batchHeaders,
          body: JSON.stringify(payload),
        });

        if (res.status === 401) {
          set({ submitting: false });
          return { outcome: "session_expired" };
        }
        if (!res.ok) throw new Error(`Server error: ${res.status}`);

        await markSurveyAsDone(localId, surveyId);
        set({ submitting: false });
        return { outcome: "submitted" };
      } catch (e) {
        if (e instanceof TypeError) {
          set({ submitting: false });
          return { outcome: "saved_offline" };
        }
        const message =
          e instanceof Error ? e.message : "Error al enviar respuestas";
        set({ error: message, submitting: false });
        return { outcome: "error", message };
      }
    },
  }),
);
