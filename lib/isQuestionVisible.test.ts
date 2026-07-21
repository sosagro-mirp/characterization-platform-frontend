import { describe, expect, it } from "vitest";
import { isQuestionVisible } from "./isQuestionVisible";
import type {
  InstrumentDraftAnswer,
  InstrumentQuestion,
} from "@/app/(instrument)/types";

function makeQuestion(
  overrides: Partial<InstrumentQuestion> = {},
): InstrumentQuestion {
  return {
    questionId: "q-target",
    text: "¿Pregunta condicional?",
    isRequired: false,
    order: 1,
    type: { typeId: "t1", name: "open_text" },
    options: [],
    ...overrides,
  };
}

describe("isQuestionVisible", () => {
  it("is visible when the question has no condition", () => {
    const question = makeQuestion();
    expect(isQuestionVisible(question, {})).toBe(true);
  });

  it("is hidden when the trigger question has no answer yet", () => {
    const question = makeQuestion({
      conditionQuestionId: "q-trigger",
      conditionValue: "true",
    });
    expect(isQuestionVisible(question, {})).toBe(false);
  });

  it("evaluates yes_no conditions against booleanValue", () => {
    const question = makeQuestion({
      conditionQuestionId: "q-trigger",
      conditionValue: "true",
    });
    const answers: Record<string, InstrumentDraftAnswer> = {
      "q-trigger": { questionId: "q-trigger", booleanValue: true },
    };
    expect(isQuestionVisible(question, answers)).toBe(true);

    answers["q-trigger"] = { questionId: "q-trigger", booleanValue: false };
    expect(isQuestionVisible(question, answers)).toBe(false);
  });

  it("evaluates single_choice conditions against optionId", () => {
    const question = makeQuestion({
      conditionQuestionId: "q-trigger",
      conditionValue: "option-a",
    });
    const answers: Record<string, InstrumentDraftAnswer> = {
      "q-trigger": { questionId: "q-trigger", optionId: "option-a" },
    };
    expect(isQuestionVisible(question, answers)).toBe(true);

    answers["q-trigger"] = { questionId: "q-trigger", optionId: "option-b" };
    expect(isQuestionVisible(question, answers)).toBe(false);
  });

  it("is hidden when the trigger answer matches neither boolean nor optionId shape", () => {
    const question = makeQuestion({
      conditionQuestionId: "q-trigger",
      conditionValue: "some-value",
    });
    const answers: Record<string, InstrumentDraftAnswer> = {
      "q-trigger": { questionId: "q-trigger", textValue: "some-value" },
    };
    expect(isQuestionVisible(question, answers)).toBe(false);
  });
});
