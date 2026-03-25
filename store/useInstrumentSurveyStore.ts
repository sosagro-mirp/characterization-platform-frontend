import { create } from "zustand";
import type {
  CreateResponsePayload,
  InitializeSurveyPayload,
  InstrumentDraftAnswer,
  InstrumentQuestion,
} from "@/app/(instrument)/types";

interface FlattenedQuestionItem {
  sectionId: string;
  sectionName: string;
  sectionOrder: number;
  question: InstrumentQuestion;
}

interface InstrumentSurveyState {
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
  submitResponses: (apiBaseUrl: string) => Promise<boolean>;
}

const initialState = {
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

    initializeSurvey: ({ surveyId, instrumentName, sections }) => {
      const state = get();

      if (state.initialized && state.surveyId === surveyId) {
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
        surveyId,
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
        answers: {
          ...state.answers,
          [answer.questionId]: answer,
        },
      }));
    },

    goNext: () => {
      set((state) => ({
        currentIndex:
          state.currentIndex < state.flattenedQuestions.length - 1
            ? state.currentIndex + 1
            : state.currentIndex,
      }));
    },

    goPrevious: () => {
      set((state) => ({
        currentIndex: state.currentIndex > 0 ? state.currentIndex - 1 : 0,
      }));
    },

    clearError: () => set({ error: undefined }),

    resetSurvey: () => set(initialState),

    buildResponsesPayload: () => {
      const { surveyId, flattenedQuestions, answers } = get();

      if (!surveyId) {
        return [];
      }

      const payload: CreateResponsePayload[] = [];

      flattenedQuestions.forEach(({ question }) => {
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

    submitResponses: async (apiBaseUrl: string) => {
      const { buildResponsesPayload } = get();
      const payload = buildResponsesPayload();

      if (payload.length === 0) {
        set({ error: "No hay respuestas para enviar" });
        return false;
      }

      set({ submitting: true, error: undefined });

      try {
        const response = await fetch(`${apiBaseUrl}/api/responses/batch`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error("Failed to submit responses");
        }

        await response.json();
        return true;
      } catch (error) {
        console.error("Error submitting responses:", error);
        set({ error: "Error al enviar respuestas. Intenta nuevamente." });
        return false;
      } finally {
        set({ submitting: false });
      }
    },
  }),
);
