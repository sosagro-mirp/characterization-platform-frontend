import { beforeEach, describe, expect, it, vi } from "vitest";
import type { QuestionDetail, SectionDetail } from "@/app/(admin)/types";
import { ApiError } from "@/lib/apiClient";
import { getDeleteQuestionConflict } from "@/lib/instrument-editor/deleteQuestionConflict";
import {
  archiveQuestion,
  deleteQuestion,
  moveQuestionToSection as moveQuestionToSectionRequest,
  unarchiveQuestion,
  updateQuestion,
} from "@/services/questions.service";
import { useInstrumentEditorStore } from "./useInstrumentEditorStore";

/**
 * Spec 84 — transformaciones del store del editor (Fase 4): borrar (sin tocar
 * condiciones si el backend lo rechaza), mover entre secciones y archivar.
 * Los servicios HTTP se sustituyen por mocks: aquí solo se prueba qué envía
 * el store y cómo queda el árbol en memoria.
 */

vi.mock("@/services/questions.service", () => ({
  archiveQuestion: vi.fn(),
  copyQuestionToSection: vi.fn(),
  createQuestion: vi.fn(),
  deleteQuestion: vi.fn(),
  moveQuestionToSection: vi.fn(),
  unarchiveQuestion: vi.fn(),
  updateQuestion: vi.fn(),
}));
vi.mock("@/services/options.service", () => ({
  archiveOption: vi.fn(),
  batchCreateOptions: vi.fn(),
  deleteOption: vi.fn(),
  unarchiveOption: vi.fn(),
  updateOption: vi.fn(),
}));
vi.mock("@/services/sections.service", () => ({
  createSection: vi.fn(),
  deleteSection: vi.fn(),
  updateSection: vi.fn(),
}));
vi.mock("@/services/instruments.service", () => ({
  deleteInstrument: vi.fn(),
  updateInstrument: vi.fn(),
}));

type MovedQuestion = Awaited<ReturnType<typeof moveQuestionToSectionRequest>>;
type ArchivedQuestion = Awaited<ReturnType<typeof archiveQuestion>>;

function question(
  questionId: string,
  order: number,
  extra: Partial<QuestionDetail> = {},
): QuestionDetail {
  return {
    questionId,
    text: questionId,
    isRequired: false,
    isSelectionCriteria: false,
    isKeyQuestion: false,
    order,
    type: { typeId: "t-yes-no", name: "yes_no" },
    options: [],
    conditionQuestionId: null,
    conditionValue: null,
    archivedAt: null,
    createdAt: "2026-09-01T00:00:00.000Z",
    updatedAt: "2026-09-01T00:00:00.000Z",
    ...extra,
  };
}

function section(sectionId: string, order: number, questions: QuestionDetail[]): SectionDetail {
  return {
    sectionId,
    name: sectionId,
    order,
    questions,
    createdAt: "2026-09-01T00:00:00.000Z",
    updatedAt: "2026-09-01T00:00:00.000Z",
  };
}

/**
 * s1: q1 (fuente), q2 (depende de q1, archivada), q3
 * s2: q4 (depende de q1, activa), q5
 */
function seed() {
  const sections = [
    section("s1", 1, [
      question("q1", 1),
      question("q2", 2, {
        conditionQuestionId: "q1",
        conditionValue: "true",
        archivedAt: "2026-09-10T00:00:00.000Z",
      }),
      question("q3", 3),
    ]),
    section("s2", 2, [
      question("q4", 1, { conditionQuestionId: "q1", conditionValue: "true" }),
      question("q5", 2),
    ]),
  ];
  useInstrumentEditorStore.getState().initialize({
    instrumentId: "instr-1",
    name: "Instrumento TEST",
    version: 1,
    publishDate: "2026-09-01",
    isActive: true,
    isPublic: false,
    actorTypes: [],
    sections,
    questionTypes: [],
  });
  return sections;
}

const state = () => useInstrumentEditorStore.getState();
const findQuestion = (id: string) =>
  state().sections.flatMap((s) => s.questions).find((q) => q.questionId === id);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("removeQuestionFromStore — borrado primero (hallazgo mayor 1)", () => {
  it("rechazo 409 por respuestas: no toca condiciones ni en el servidor ni en el store", async () => {
    const before = seed();
    const conflict = new ApiError(
      409,
      "Esta pregunta tiene respuestas y no se puede borrar. Archívela en su lugar.",
      { questionId: "q1", responseCount: 3 },
    );
    vi.mocked(deleteQuestion).mockRejectedValueOnce(conflict);

    await expect(state().removeQuestionFromStore("s1", "q1")).rejects.toBe(conflict);

    expect(deleteQuestion).toHaveBeenCalledWith("s1", "q1");
    expect(updateQuestion).not.toHaveBeenCalled();
    expect(state().sections).toEqual(before);
    expect(findQuestion("q4")?.conditionQuestionId).toBe("q1");
    expect(state().saveStatus).toBe("error");
    expect(state().saveError).toBe(conflict.message);
    expect(getDeleteQuestionConflict(conflict)).toBe("responses");
  });

  it("rechazo 409 por dependientes activos: tampoco modifica nada", async () => {
    const before = seed();
    const conflict = new ApiError(
      409,
      "Otras preguntas o pasos de campaña dependen de esta pregunta.",
      { questionId: "q1", dependentQuestions: ["q4"], stepConditions: 0 },
    );
    vi.mocked(deleteQuestion).mockRejectedValueOnce(conflict);

    await expect(state().removeQuestionFromStore("s1", "q1")).rejects.toBe(conflict);

    expect(updateQuestion).not.toHaveBeenCalled();
    expect(state().sections).toEqual(before);
    expect(getDeleteQuestionConflict(conflict)).toBe("dependents");
  });

  it("borrado aceptado: quita la pregunta, recompacta su sección y refleja el SET NULL de la FK", async () => {
    seed();
    vi.mocked(deleteQuestion).mockResolvedValueOnce(undefined);

    await state().removeQuestionFromStore("s1", "q1");

    expect(updateQuestion).not.toHaveBeenCalled();
    expect(findQuestion("q1")).toBeUndefined();
    const s1 = state().sections.find((s) => s.sectionId === "s1")!;
    expect(s1.questions.map((q) => [q.questionId, q.order])).toEqual([
      ["q2", 1],
      ["q3", 2],
    ]);
    // La FK solo anula `condition_question_id`; `condition_value` se conserva.
    expect(findQuestion("q2")).toMatchObject({ conditionQuestionId: null, conditionValue: "true" });
    // El orden de las otras secciones no cambia.
    const s2 = state().sections.find((s) => s.sectionId === "s2")!;
    expect(s2.questions.map((q) => q.order)).toEqual([1, 2]);
    expect(state().selection).toEqual({ kind: "section", sectionId: "s1" });
    expect(state().saveStatus).toBe("saved");
  });
});

describe("getDeleteQuestionConflict", () => {
  it("devuelve null para errores que no son 409", () => {
    expect(getDeleteQuestionConflict(new ApiError(500, "x", null))).toBeNull();
    expect(getDeleteQuestionConflict(new Error("red"))).toBeNull();
  });

  it("trata un 409 sin cuerpo como 'tiene respuestas'", () => {
    expect(getDeleteQuestionConflict(new ApiError(409, "Conflict", "Conflict"))).toBe("responses");
  });
});

describe("moveQuestionToSection", () => {
  it("saca la pregunta del origen recompactando el orden y la agrega al final del destino", async () => {
    seed();
    vi.mocked(moveQuestionToSectionRequest).mockResolvedValueOnce(
      { ...question("q1", 3), text: "q1 movida" } as MovedQuestion,
    );

    await state().moveQuestionToSection("s1", "q1", "s2");

    expect(moveQuestionToSectionRequest).toHaveBeenCalledWith("s1", "q1", "s2");
    const s1 = state().sections.find((s) => s.sectionId === "s1")!;
    const s2 = state().sections.find((s) => s.sectionId === "s2")!;
    expect(s1.questions.map((q) => [q.questionId, q.order])).toEqual([
      ["q2", 1],
      ["q3", 2],
    ]);
    expect(s2.questions.map((q) => [q.questionId, q.order])).toEqual([
      ["q4", 1],
      ["q5", 2],
      ["q1", 3],
    ]);
    expect(s2.questions[2].text).toBe("q1 movida");
    expect(state().selection).toEqual({ kind: "question", sectionId: "s2", questionId: "q1" });
  });

  it("no llama al backend si origen y destino son la misma sección", async () => {
    const before = seed();

    await state().moveQuestionToSection("s1", "q1", "s1");

    expect(moveQuestionToSectionRequest).not.toHaveBeenCalled();
    expect(state().sections).toEqual(before);
  });

  it("si el backend rechaza el movimiento, el árbol no cambia", async () => {
    const before = seed();
    vi.mocked(moveQuestionToSectionRequest).mockRejectedValueOnce(
      new ApiError(409, "Dependencias", null),
    );

    await state().moveQuestionToSection("s1", "q1", "s2");

    expect(state().sections).toEqual(before);
    expect(state().saveStatus).toBe("error");
  });
});

describe("archivar / desarchivar pregunta", () => {
  it("archivar marca archivedAt solo en esa pregunta", async () => {
    seed();
    vi.mocked(archiveQuestion).mockResolvedValueOnce(
      question("q3", 3, { archivedAt: "2026-09-15T12:00:00.000Z" }) as ArchivedQuestion,
    );

    await state().archiveQuestionInStore("s1", "q3");

    expect(archiveQuestion).toHaveBeenCalledWith("s1", "q3");
    expect(findQuestion("q3")?.archivedAt).toBe("2026-09-15T12:00:00.000Z");
    expect(findQuestion("q1")?.archivedAt).toBeNull();
  });

  it("archivar rechazado con 409 relanza el error y no cambia el árbol", async () => {
    const before = seed();
    const conflict = new ApiError(409, "Otras preguntas o pasos de campaña dependen de esta pregunta.", {
      dependentQuestions: ["q4"],
    });
    vi.mocked(archiveQuestion).mockRejectedValueOnce(conflict);

    await expect(state().archiveQuestionInStore("s1", "q1")).rejects.toBe(conflict);
    expect(state().sections).toEqual(before);
  });

  it("desarchivar deja archivedAt en null", async () => {
    seed();
    vi.mocked(unarchiveQuestion).mockResolvedValueOnce(
      question("q2", 2, { archivedAt: null }) as ArchivedQuestion,
    );

    await state().unarchiveQuestionInStore("s1", "q2");

    expect(unarchiveQuestion).toHaveBeenCalledWith("s1", "q2");
    expect(findQuestion("q2")?.archivedAt).toBeNull();
    // Desarchivar no toca la condición.
    expect(findQuestion("q2")?.conditionQuestionId).toBe("q1");
  });
});
