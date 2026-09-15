import { create } from "zustand";
import {
  ActorTypeSummary,
  CopyQuestionResponse,
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
  archiveQuestion,
  copyQuestionToSection,
  createQuestion,
  deleteQuestion,
  moveQuestionToSection as moveQuestionToSectionRequest,
  unarchiveQuestion,
  updateQuestion,
} from "@/services/questions.service";
import {
  archiveOption,
  batchCreateOptions,
  deleteOption,
  unarchiveOption,
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
  /** Spec 79 — este instrumento se puede compartir por /encuesta/{instrumentId}. */
  instrumentIsPublic: boolean;
  instrumentActorTypes: ActorTypeSummary[];
  questionTypes: TypeOfQuestionSummary[];
  sections: SectionDetail[];
  selection: EditorSelection;
  saveStatus: SaveStatus;
  saveError: string | undefined;
  /** Spec 84 — muestra preguntas y opciones archivadas en el árbol. */
  showArchived: boolean;

  initialize: (payload: {
    instrumentId: string;
    name: string;
    version: number;
    publishDate: string;
    isActive: boolean;
    isPublic: boolean;
    actorTypes: ActorTypeSummary[];
    sections: SectionDetail[];
    questionTypes: TypeOfQuestionSummary[];
  }) => void;

  setSelection: (selection: EditorSelection) => void;
  toggleShowArchived: () => void;

  // Instrument
  updateInstrumentMeta: (data: UpdateInstrumentRequest) => Promise<void>;

  // Sections
  addSection: (data: CreateSectionRequest) => Promise<void>;
  updateSectionInStore: (sectionId: string, data: UpdateSectionRequest) => Promise<void>;
  removeSectionFromStore: (sectionId: string) => Promise<void>;
  reorderSection: (sectionId: string, direction: "up" | "down") => Promise<void>;

  // Questions
  addQuestion: (sectionId: string, data: CreateQuestionRequest) => Promise<void>;
  duplicateQuestion: (sectionId: string, questionId: string) => Promise<void>;
  copyQuestionToInstrument: (
    targetInstrumentId: string,
    targetSectionId: string,
    sourceQuestionId: string
  ) => Promise<CopyQuestionResponse>;
  updateQuestionInStore: (
    sectionId: string,
    questionId: string,
    data: UpdateQuestionRequest
  ) => Promise<void>;
  removeQuestionFromStore: (sectionId: string, questionId: string) => Promise<void>;
  /** Spec 84 — alternativa a borrar cuando la pregunta ya tiene respuestas. */
  archiveQuestionInStore: (sectionId: string, questionId: string) => Promise<void>;
  unarchiveQuestionInStore: (sectionId: string, questionId: string) => Promise<void>;
  /** Spec 84 — mueve la pregunta a otra sección del mismo instrumento. */
  moveQuestionToSection: (
    sourceSectionId: string,
    questionId: string,
    targetSectionId: string
  ) => Promise<void>;
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
  /** Spec 84 — alternativa a borrar cuando la opción ya tiene respuestas. */
  archiveOptionInStore: (
    questionId: string,
    sectionId: string,
    optionId: string
  ) => Promise<void>;
  unarchiveOptionInStore: (
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
      instrumentIsPublic: false,
      instrumentActorTypes: [],
      questionTypes: [],
      sections: [],
      selection: { kind: "instrument" },
      saveStatus: "idle",
      saveError: undefined,
      showArchived: false,

      initialize: (payload) =>
        set({
          instrumentId: payload.instrumentId,
          instrumentName: payload.name,
          instrumentVersion: payload.version,
          instrumentPublishDate: payload.publishDate,
          instrumentIsActive: payload.isActive,
          instrumentIsPublic: payload.isPublic,
          instrumentActorTypes: payload.actorTypes ?? [],
          questionTypes: payload.questionTypes ?? [],
          sections: payload.sections,
          selection: { kind: "instrument" },
          saveStatus: "idle",
          saveError: undefined,
        }),

      setSelection: (selection) => set({ selection }),
      toggleShowArchived: () => set((s) => ({ showArchived: !s.showArchived })),

      updateInstrumentMeta: async (data) => {
        await withSave(async () => {
          const updated = await updateInstrument(get().instrumentId, data);
          set({
            instrumentName: updated.name,
            instrumentVersion: updated.version,
            instrumentPublishDate: updated.publishDate,
            instrumentIsActive: updated.isActive,
            instrumentIsPublic: updated.isPublic,
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

      // Spec 84 — a diferencia del resto de acciones, no usa `withSave`: el
      // 409 (sección con preguntas respondidas) lo necesita atrapar el
      // componente para ofrecer archivar en su lugar, y `withSave` no relanza.
      removeSectionFromStore: async (sectionId) => {
        setSaveStatus("saving");
        try {
          await deleteSection(get().instrumentId, sectionId);
          set((s) => ({
            sections: s.sections
              .filter((sec) => sec.sectionId !== sectionId)
              .map((sec, i) => ({ ...sec, order: i + 1 })),
            selection: { kind: "instrument" },
          }));
          setSaveStatus("saved");
          setTimeout(() => set({ saveStatus: "idle" }), 2000);
        } catch (err) {
          setSaveStatus(
            "error",
            err instanceof Error ? err.message : "Error al borrar la sección"
          );
          throw err;
        }
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

      duplicateQuestion: async (sectionId, questionId) => {
        const section = get().sections.find((s) => s.sectionId === sectionId);
        const original = section?.questions.find((q) => q.questionId === questionId);
        if (!section || !original) return;

        await withSave(async () => {
          const created = await createQuestion(sectionId, {
            text: original.text,
            typeId: original.type.typeId,
            isRequired: original.isRequired,
            isSelectionCriteria: original.isSelectionCriteria,
            order: section.questions.length + 1,
          });

          let options = created.options ?? [];
          if (original.options.length > 0) {
            options = await batchCreateOptions(
              created.questionId,
              original.options.map(({ text, value, isOther }) => ({
                text,
                ...(value !== null && { value }),
                isOther,
              }))
            );
          }

          const duplicate: QuestionDetail = {
            ...created,
            options,
            conditionQuestionId: null,
            conditionValue: null,
          };

          set((s) => ({
            sections: s.sections.map((sec) =>
              sec.sectionId === sectionId
                ? { ...sec, questions: [...sec.questions, duplicate] }
                : sec
            ),
            selection: { kind: "question", sectionId, questionId: created.questionId },
          }));
        });
      },

      // A diferencia del resto de acciones del editor, esta NO usa `withSave`:
      // el diálogo que la invoca necesita saber si la copia falló para
      // mostrar el error, y `withSave` atrapa los errores sin relanzarlos.
      copyQuestionToInstrument: async (
        targetInstrumentId,
        targetSectionId,
        sourceQuestionId
      ) => {
        setSaveStatus("saving");
        try {
          const response = await copyQuestionToSection(targetSectionId, sourceQuestionId);

          if (targetInstrumentId === get().instrumentId) {
            set((s) => ({
              sections: s.sections.map((sec) =>
                sec.sectionId === targetSectionId
                  ? { ...sec, questions: [...sec.questions, response.question] }
                  : sec
              ),
            }));
          }

          setSaveStatus("saved");
          setTimeout(() => set({ saveStatus: "idle" }), 2000);
          return response;
        } catch (err) {
          setSaveStatus(
            "error",
            err instanceof Error ? err.message : "Error al copiar la pregunta"
          );
          throw err;
        }
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
                            // Preserve explicitly sent values in case the
                            // backend response omits or nullifies them
                            ...(data.conditionQuestionId !== undefined && {
                              conditionQuestionId: data.conditionQuestionId,
                            }),
                            ...(data.conditionValue !== undefined && {
                              conditionValue: data.conditionValue,
                            }),
                          }
                        : q
                    ),
                  }
                : sec
            ),
          }));
        });
      },

      // Spec 84 — sin `withSave`: el 409 (pregunta con respuestas o con
      // dependientes activos) lo necesita atrapar el componente para ofrecer
      // archivar en su lugar.
      //
      // El borrado va primero y es lo único que se envía: si el backend lo
      // rechaza, no se ha tocado nada ni en el servidor ni en el store. El
      // backend solo borra si ninguna pregunta no archivada ni ningún paso de
      // campaña depende de esta; las archivadas que la usaban como condición
      // pierden `conditionQuestionId` por la FK (`ON DELETE SET NULL`), pero
      // conservan `conditionValue`. El store replica exactamente eso.
      removeQuestionFromStore: async (sectionId, questionId) => {
        setSaveStatus("saving");
        try {
          await deleteQuestion(sectionId, questionId);

          set((s) => ({
            sections: s.sections.map((sec) => ({
              ...sec,
              questions: sec.questions
                .filter((q) => q.questionId !== questionId)
                .map((q, i) => ({
                  ...q,
                  // El backend recompacta el orden solo en la sección de origen.
                  order: sec.sectionId === sectionId ? i + 1 : q.order,
                  conditionQuestionId:
                    q.conditionQuestionId === questionId
                      ? null
                      : q.conditionQuestionId,
                })),
            })),
            selection: { kind: "section", sectionId },
          }));
          setSaveStatus("saved");
          setTimeout(() => set({ saveStatus: "idle" }), 2000);
        } catch (err) {
          setSaveStatus(
            "error",
            err instanceof Error ? err.message : "Error al borrar la pregunta"
          );
          throw err;
        }
      },

      archiveQuestionInStore: async (sectionId, questionId) => {
        setSaveStatus("saving");
        try {
          const updated = await archiveQuestion(sectionId, questionId);
          set((s) => ({
            sections: s.sections.map((sec) =>
              sec.sectionId === sectionId
                ? {
                    ...sec,
                    questions: sec.questions.map((q) =>
                      q.questionId === questionId
                        ? { ...q, archivedAt: updated.archivedAt }
                        : q
                    ),
                  }
                : sec
            ),
          }));
          setSaveStatus("saved");
          setTimeout(() => set({ saveStatus: "idle" }), 2000);
        } catch (err) {
          setSaveStatus(
            "error",
            err instanceof Error ? err.message : "Error al archivar la pregunta"
          );
          throw err;
        }
      },

      unarchiveQuestionInStore: async (sectionId, questionId) => {
        await withSave(async () => {
          const updated = await unarchiveQuestion(sectionId, questionId);
          set((s) => ({
            sections: s.sections.map((sec) =>
              sec.sectionId === sectionId
                ? {
                    ...sec,
                    questions: sec.questions.map((q) =>
                      q.questionId === questionId
                        ? { ...q, archivedAt: updated.archivedAt ?? null }
                        : q
                    ),
                  }
                : sec
            ),
          }));
        });
      },

      moveQuestionToSection: async (sourceSectionId, questionId, targetSectionId) => {
        if (sourceSectionId === targetSectionId) return;
        await withSave(async () => {
          const updated = await moveQuestionToSectionRequest(
            sourceSectionId,
            questionId,
            targetSectionId
          );
          set((s) => {
            const source = s.sections.find((sec) => sec.sectionId === sourceSectionId);
            const original = source?.questions.find((q) => q.questionId === questionId);
            if (!original) return s;
            const moved: QuestionDetail = {
              ...original,
              ...updated,
              options: updated.options ?? original.options,
            };
            return {
              sections: s.sections.map((sec) => {
                if (sec.sectionId === sourceSectionId) {
                  return {
                    ...sec,
                    questions: sec.questions
                      .filter((q) => q.questionId !== questionId)
                      .map((q, i) => ({ ...q, order: i + 1 })),
                  };
                }
                if (sec.sectionId === targetSectionId) {
                  return { ...sec, questions: [...sec.questions, moved] };
                }
                return sec;
              }),
              selection: { kind: "question", sectionId: targetSectionId, questionId },
            };
          });
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

      // Spec 84 — sin `withSave`: el 409 (opción con respuestas) lo necesita
      // atrapar el componente para ofrecer archivar en su lugar.
      removeOptionFromStore: async (questionId, sectionId, optionId) => {
        setSaveStatus("saving");
        try {
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
          setSaveStatus("saved");
          setTimeout(() => set({ saveStatus: "idle" }), 2000);
        } catch (err) {
          setSaveStatus(
            "error",
            err instanceof Error ? err.message : "Error al borrar la opción"
          );
          throw err;
        }
      },

      archiveOptionInStore: async (questionId, sectionId, optionId) => {
        setSaveStatus("saving");
        try {
          const updated = await archiveOption(questionId, optionId);
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
                              o.optionId === optionId
                                ? { ...o, archivedAt: updated.archivedAt }
                                : o
                            ),
                          }
                        : q
                    ),
                  }
                : sec
            ),
          }));
          setSaveStatus("saved");
          setTimeout(() => set({ saveStatus: "idle" }), 2000);
        } catch (err) {
          setSaveStatus(
            "error",
            err instanceof Error ? err.message : "Error al archivar la opción"
          );
          throw err;
        }
      },

      unarchiveOptionInStore: async (questionId, sectionId, optionId) => {
        await withSave(async () => {
          const updated = await unarchiveOption(questionId, optionId);
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
                              o.optionId === optionId
                                ? { ...o, archivedAt: updated.archivedAt ?? null }
                                : o
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
