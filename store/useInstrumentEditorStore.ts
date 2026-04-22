import { create } from "zustand";
import {
  ActorTypeSummary,
  CreateOptionRequest,
  CreateQuestionRequest,
  CreateSectionRequest,
  OptionDetail,
  QuestionDetail,
  SectionDetail,
  TypeOfQuestionSummary,
  UpdateInstrumentRequest,
  UpdateOptionRequest,
  UpdateQuestionRequest,
  UpdateSectionRequest,
} from "@/app/(admin)/types";
import { deleteInstrument, updateInstrument } from "@/services/instruments.service";
import {
  createSection,
  deleteSection,
  updateSection,
} from "@/services/sections.service";
import {
  createQuestion,
  deleteQuestion,
  updateQuestion,
} from "@/services/questions.service";
import {
  batchCreateOptions,
  deleteOption,
  updateOption,
} from "@/services/options.service";
import { SaveStatus } from "@/components/instrument-editor/SaveStatusIndicator";

export type EditorSelection =
  | { kind: "instrument" }
  | { kind: "section"; sectionId: string }
  | { kind: "question"; sectionId: string; questionId: string }
  | { kind: "new-question"; sectionId: string }
  | null;

interface InstrumentEditorState {
  instrumentId: string;
  instrumentName: string;
  instrumentVersion: number;
  instrumentPublishDate: string;
  instrumentIsActive: boolean;
  instrumentActorTypes: ActorTypeSummary[];
  questionTypes: TypeOfQuestionSummary[];
  sections: SectionDetail[];
  selection: EditorSelection;
  saveStatus: SaveStatus;
  saveError: string | undefined;

  initialize: (payload: {
    instrumentId: string;
    name: string;
    version: number;
    publishDate: string;
    isActive: boolean;
    actorTypes: ActorTypeSummary[];
    sections: SectionDetail[];
    questionTypes: TypeOfQuestionSummary[];
  }) => void;

  setSelection: (selection: EditorSelection) => void;

  // Instrument
  updateInstrumentMeta: (data: UpdateInstrumentRequest) => Promise<void>;

  // Sections
  addSection: (data: CreateSectionRequest) => Promise<void>;
  updateSectionInStore: (sectionId: string, data: UpdateSectionRequest) => Promise<void>;
  removeSectionFromStore: (sectionId: string) => Promise<void>;
  reorderSection: (sectionId: string, direction: "up" | "down") => Promise<void>;

  // Questions
  addQuestion: (sectionId: string, data: CreateQuestionRequest) => Promise<void>;
  updateQuestionInStore: (
    sectionId: string,
    questionId: string,
    data: UpdateQuestionRequest
  ) => Promise<void>;
  removeQuestionFromStore: (sectionId: string, questionId: string) => Promise<void>;
  reorderQuestion: (
    sectionId: string,
    questionId: string,
    direction: "up" | "down"
  ) => Promise<void>;

  // Options
  addOptions: (questionId: string, sectionId: string, options: CreateOptionRequest[]) => Promise<void>;
  updateOptionInStore: (
    questionId: string,
    sectionId: string,
    optionId: string,
    data: UpdateOptionRequest
  ) => Promise<void>;
  removeOptionFromStore: (
    questionId: string,
    sectionId: string,
    optionId: string
  ) => Promise<void>;
}

export const useInstrumentEditorStore = create<InstrumentEditorState>()(
  (set, get) => {
    const setSaveStatus = (status: SaveStatus, error?: string) =>
      set({ saveStatus: status, saveError: error });

    const withSave = async (fn: () => Promise<void>) => {
      setSaveStatus("saving");
      try {
        await fn();
        setSaveStatus("saved");
        setTimeout(() => set({ saveStatus: "idle" }), 2000);
      } catch (err) {
        setSaveStatus(
          "error",
          err instanceof Error ? err.message : "Error al guardar"
        );
      }
    };

    return {
      instrumentId: "",
      instrumentName: "",
      instrumentVersion: 1,
      instrumentPublishDate: "",
      instrumentIsActive: false,
      instrumentActorTypes: [],
      questionTypes: [],
      sections: [],
      selection: { kind: "instrument" },
      saveStatus: "idle",
      saveError: undefined,

      initialize: (payload) =>
        set({
          instrumentId: payload.instrumentId,
          instrumentName: payload.name,
          instrumentVersion: payload.version,
          instrumentPublishDate: payload.publishDate,
          instrumentIsActive: payload.isActive,
          instrumentActorTypes: payload.actorTypes ?? [],
          questionTypes: payload.questionTypes ?? [],
          sections: payload.sections,
          selection: { kind: "instrument" },
          saveStatus: "idle",
          saveError: undefined,
        }),

      setSelection: (selection) => set({ selection }),

      updateInstrumentMeta: async (data) => {
        await withSave(async () => {
          const updated = await updateInstrument(get().instrumentId, data);
          set({
            instrumentName: updated.name,
            instrumentVersion: updated.version,
            instrumentPublishDate: updated.publishDate,
            instrumentIsActive: updated.isActive,
            instrumentActorTypes: updated.actorTypes,
          });
        });
      },

      addSection: async (data) => {
        if (!get().instrumentId) return;
        await withSave(async () => {
          const created = await createSection(get().instrumentId, data);
          const newSection: SectionDetail = { ...created, questions: [] };
          set((s) => ({ sections: [...s.sections, newSection] }));
          set({ selection: { kind: "section", sectionId: created.sectionId } });
        });
      },

      updateSectionInStore: async (sectionId, data) => {
        await withSave(async () => {
          const updated = await updateSection(
            get().instrumentId,
            sectionId,
            data
          );
          set((s) => ({
            sections: s.sections.map((sec) =>
              sec.sectionId === sectionId
                ? { ...sec, ...updated }
                : sec
            ),
          }));
        });
      },

      removeSectionFromStore: async (sectionId) => {
        await withSave(async () => {
          await deleteSection(get().instrumentId, sectionId);
          set((s) => ({
            sections: s.sections
              .filter((sec) => sec.sectionId !== sectionId)
              .map((sec, i) => ({ ...sec, order: i + 1 })),
            selection: { kind: "instrument" },
          }));
        });
      },

      reorderSection: async (sectionId, direction) => {
        const { sections, instrumentId } = get();
        const idx = sections.findIndex((s) => s.sectionId === sectionId);
        if (idx === -1) return;
        const targetIdx = direction === "up" ? idx - 1 : idx + 1;
        if (targetIdx < 0 || targetIdx >= sections.length) return;

        const newOrder = targetIdx + 1;
        await withSave(async () => {
          await updateSection(instrumentId, sectionId, { order: newOrder });
          const reordered = [...sections];
          [reordered[idx], reordered[targetIdx]] = [
            reordered[targetIdx],
            reordered[idx],
          ];
          set({
            sections: reordered.map((s, i) => ({ ...s, order: i + 1 })),
          });
        });
      },

      addQuestion: async (sectionId, data) => {
        if (!sectionId || !data.typeId) return;
        await withSave(async () => {
          const created = await createQuestion(sectionId, data);
          const question: QuestionDetail = {
            ...created,
            options: created.options ?? [],
            conditionQuestionId: created.conditionQuestionId ?? null,
            conditionValue: created.conditionValue ?? null,
          };
          set((s) => ({
            sections: s.sections.map((sec) =>
              sec.sectionId === sectionId
                ? { ...sec, questions: [...sec.questions, question] }
                : sec
            ),
            selection: { kind: "question", sectionId, questionId: created.questionId },
          }));
        });
      },

      updateQuestionInStore: async (sectionId, questionId, data) => {
        await withSave(async () => {
          const updated = await updateQuestion(sectionId, questionId, data);
          set((s) => ({
            sections: s.sections.map((sec) =>
              sec.sectionId === sectionId
                ? {
                    ...sec,
                    questions: sec.questions.map((q) =>
                      q.questionId === questionId
                        ? {
                            ...q,
                            ...updated,
                            options: updated.options ?? q.options,
                          }
                        : q
                    ),
                  }
                : sec
            ),
          }));
        });
      },

      removeQuestionFromStore: async (sectionId, questionId) => {
        await withSave(async () => {
          await deleteQuestion(sectionId, questionId);
          set((s) => ({
            sections: s.sections.map((sec) =>
              sec.sectionId === sectionId
                ? {
                    ...sec,
                    questions: sec.questions
                      .filter((q) => q.questionId !== questionId)
                      .map((q, i) => ({ ...q, order: i + 1 })),
                  }
                : sec
            ),
            selection: { kind: "section", sectionId },
          }));
        });
      },

      reorderQuestion: async (sectionId, questionId, direction) => {
        const section = get().sections.find((s) => s.sectionId === sectionId);
        if (!section) return;
        const idx = section.questions.findIndex(
          (q) => q.questionId === questionId
        );
        if (idx === -1) return;
        const targetIdx = direction === "up" ? idx - 1 : idx + 1;
        if (targetIdx < 0 || targetIdx >= section.questions.length) return;

        const newOrder = targetIdx + 1;
        await withSave(async () => {
          await updateQuestion(sectionId, questionId, { order: newOrder });
          set((s) => ({
            sections: s.sections.map((sec) => {
              if (sec.sectionId !== sectionId) return sec;
              const qs = [...sec.questions];
              [qs[idx], qs[targetIdx]] = [qs[targetIdx], qs[idx]];
              return { ...sec, questions: qs.map((q, i) => ({ ...q, order: i + 1 })) };
            }),
          }));
        });
      },

      addOptions: async (questionId, sectionId, options) => {
        await withSave(async () => {
          const created = await batchCreateOptions(questionId, options);
          set((s) => ({
            sections: s.sections.map((sec) =>
              sec.sectionId === sectionId
                ? {
                    ...sec,
                    questions: sec.questions.map((q) =>
                      q.questionId === questionId
                        ? { ...q, options: [...q.options, ...created] }
                        : q
                    ),
                  }
                : sec
            ),
          }));
        });
      },

      updateOptionInStore: async (questionId, sectionId, optionId, data) => {
        await withSave(async () => {
          const updated = await updateOption(questionId, optionId, data);
          set((s) => ({
            sections: s.sections.map((sec) =>
              sec.sectionId === sectionId
                ? {
                    ...sec,
                    questions: sec.questions.map((q) =>
                      q.questionId === questionId
                        ? {
                            ...q,
                            options: q.options.map((o) =>
                              o.optionId === optionId ? updated : o
                            ),
                          }
                        : q
                    ),
                  }
                : sec
            ),
          }));
        });
      },

      removeOptionFromStore: async (questionId, sectionId, optionId) => {
        await withSave(async () => {
          await deleteOption(questionId, optionId);
          set((s) => ({
            sections: s.sections.map((sec) =>
              sec.sectionId === sectionId
                ? {
                    ...sec,
                    questions: sec.questions.map((q) =>
                      q.questionId === questionId
                        ? {
                            ...q,
                            options: q.options.filter(
                              (o) => o.optionId !== optionId
                            ),
                          }
                        : q
                    ),
                  }
                : sec
            ),
          }));
        });
      },
    };
  }
);
