import { describe, expect, it } from "vitest";
import type { InstrumentDraftAnswer, InstrumentQuestion } from "@/app/(instrument)/types";
import type { SurveyResponseItem } from "@/app/(admin)/types";
import { buildPublicSubmissionPayload } from "@/lib/public-surveys/publicSurveyPayload";
import { buildResponsesPayload } from "./buildResponsesPayload";
import { isAnswerComplete } from "./isAnswerComplete";
import { formatResponseValue } from "@/lib/responses/formatResponseValue";

/**
 * Spec 86 — la opción "Otros" guarda el texto personalizado en la propia
 * respuesta (fila de la opción isOther, campo textValue) y el cliente web ya
 * no crea opciones nuevas.
 *
 * ESTAS PRUEBAS NACEN EN ROJO: no existen todavía
 *   - lib/instrument/buildResponsesPayload.ts (se extrae del store),
 *   - lib/instrument/isAnswerComplete.ts (se extrae de InstrumentQuestionFlow),
 *   - lib/responses/formatResponseValue.ts (se extrae de ResponsesAccordion),
 *   - el parámetro `questions` de buildPublicSubmissionPayload,
 *   - `isOther` en SurveyResponseItem.
 *
 * Contrato que asume esta suite:
 *   buildResponsesPayload(surveyId, flattenedQuestions, answers) => CreateResponsePayload[]
 *   isAnswerComplete(question, answer | undefined) => boolean
 *   buildPublicSubmissionPayload({ instrumentId, consent, answers, questions })
 *   formatResponseValue(item: SurveyResponseItem) => string
 */

// ─── fixtures ────────────────────────────────────────────────────────────────

const OTHER_TEXT_MAX = 255;

function makeQuestion(
  questionId: string,
  typeName: "multiple_choice" | "single_choice",
): InstrumentQuestion {
  return {
    questionId,
    text: `Pregunta ${questionId}`,
    isRequired: true,
    order: 1,
    type: { typeId: `t-${typeName}`, name: typeName },
    options: [
      { optionId: `${questionId}-a`, text: "Café", value: 1 },
      { optionId: `${questionId}-b`, text: "Cacao", value: 2 },
      { optionId: `${questionId}-other`, text: "Otros", value: 99, isOther: true },
    ],
    conditionQuestionId: null,
    conditionValue: null,
  } as InstrumentQuestion;
}

const qMulti = makeQuestion("qm", "multiple_choice");
const qSingle = makeQuestion("qs", "single_choice");

const flattened = [
  { sectionId: "s1", question: qMulti },
  { sectionId: "s1", question: qSingle },
] as unknown as Parameters<typeof buildResponsesPayload>[1];

const multiAnswer: InstrumentDraftAnswer = {
  questionId: "qm",
  optionIds: ["qm-a", "qm-other"],
  otherText: "  Arroz  ",
};

const singleAnswer: InstrumentDraftAnswer = {
  questionId: "qs",
  optionId: "qs-other",
  otherText: "Aljibe",
};

// ─── criterio 14: payload de la encuesta de campo ────────────────────────────

describe("spec-086 · buildResponsesPayload (encuesta web)", () => {
  it("TC-086-W1 · multiple_choice: la fila isOther lleva el texto recortado y las demás no", () => {
    const payload = buildResponsesPayload("survey-1", flattened, { qm: multiAnswer });

    expect(payload).toEqual(
      expect.arrayContaining([
        { surveyId: "survey-1", questionId: "qm", optionId: "qm-a" },
        {
          surveyId: "survey-1",
          questionId: "qm",
          optionId: "qm-other",
          textValue: "Arroz",
        },
      ]),
    );
    expect(payload).toHaveLength(2);
    expect(payload.find((p) => p.optionId === "qm-a")).not.toHaveProperty("textValue");
  });

  it("TC-086-W2 · single_choice: la respuesta conserva el optionId de Otros y lleva el texto", () => {
    const payload = buildResponsesPayload("survey-1", flattened, { qs: singleAnswer });

    expect(payload).toEqual([
      {
        surveyId: "survey-1",
        questionId: "qs",
        optionId: "qs-other",
        textValue: "Aljibe",
      },
    ]);
  });

  it("TC-086-W3 · no envía textValue si Otros no está seleccionado aunque quede texto residual", () => {
    const payload = buildResponsesPayload("survey-1", flattened, {
      qm: { questionId: "qm", optionIds: ["qm-b"], otherText: "residuo" },
    });

    expect(payload).toEqual([{ surveyId: "survey-1", questionId: "qm", optionId: "qm-b" }]);
  });
});

// ─── criterio 14: payload del formulario público ─────────────────────────────

describe("spec-086 · buildPublicSubmissionPayload (canal público)", () => {
  it("TC-086-W4 · la fila isOther lleva el texto en selección múltiple y única", () => {
    const { responses } = buildPublicSubmissionPayload({
      instrumentId: "inst-1",
      consent: { acceptedDataProcessing: true },
      answers: { qm: multiAnswer, qs: singleAnswer },
      questions: [qMulti, qSingle],
    });

    expect(responses).toEqual(
      expect.arrayContaining([
        { questionId: "qm", optionId: "qm-a" },
        { questionId: "qm", optionId: "qm-other", textValue: "Arroz" },
        { questionId: "qs", optionId: "qs-other", textValue: "Aljibe" },
      ]),
    );
    expect(responses).toHaveLength(3);
  });
});

// ─── criterio 14: validación de respuesta completa ───────────────────────────

describe("spec-086 · isAnswerComplete", () => {
  it("TC-086-W5 · single_choice con Otros marcado y sin texto no está completa", () => {
    expect(isAnswerComplete(qSingle, { questionId: "qs", optionId: "qs-other" })).toBe(false);
    expect(
      isAnswerComplete(qSingle, { questionId: "qs", optionId: "qs-other", otherText: "   " }),
    ).toBe(false);
  });

  it("TC-086-W6 · single_choice con Otros y texto, o con otra opción, está completa", () => {
    expect(isAnswerComplete(qSingle, singleAnswer)).toBe(true);
    expect(isAnswerComplete(qSingle, { questionId: "qs", optionId: "qs-a" })).toBe(true);
  });

  it("TC-086-W7 · multiple_choice con Otros marcado exige el texto", () => {
    expect(
      isAnswerComplete(qMulti, { questionId: "qm", optionIds: ["qm-other"] }),
    ).toBe(false);
    expect(isAnswerComplete(qMulti, multiAnswer)).toBe(true);
  });

  it(`TC-086-W8 · un texto de Otros de más de ${OTHER_TEXT_MAX} caracteres no está completo`, () => {
    expect(
      isAnswerComplete(qSingle, {
        questionId: "qs",
        optionId: "qs-other",
        otherText: "a".repeat(OTHER_TEXT_MAX + 1),
      }),
    ).toBe(false);
  });
});

// ─── criterio 11: detalle de respuestas en el admin ──────────────────────────

describe("spec-086 · formatResponseValue (admin)", () => {
  const base: SurveyResponseItem = {
    responseId: "r1",
    questionId: "qs",
    questionText: "Pregunta",
    questionType: "single_choice",
    sectionTitle: "Sección",
    textValue: null,
    numericValue: null,
    booleanValue: null,
    optionText: "Otros",
    isOther: false,
    publicUrl: null,
    mimeType: null,
    originalFilename: null,
  } as SurveyResponseItem;

  it('TC-086-W9 · muestra "Otros: {texto}" en una respuesta isOther con texto', () => {
    expect(
      formatResponseValue({ ...base, isOther: true, textValue: "Pozo profundo" }),
    ).toBe("Otros: Pozo profundo");
  });

  it('TC-086-W10 · muestra solo "Otros" si la respuesta isOther no tiene texto', () => {
    expect(formatResponseValue({ ...base, isOther: true, textValue: null })).toBe("Otros");
  });

  it("TC-086-W11 · una opción normal se muestra con su texto", () => {
    expect(
      formatResponseValue({ ...base, optionText: "Acueducto", isOther: false }),
    ).toBe("Acueducto");
  });
});
