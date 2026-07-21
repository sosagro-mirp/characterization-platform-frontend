import { describe, expect, it, beforeEach } from "vitest";
import { useInstrumentSurveyStore } from "./useInstrumentSurveyStore";
import type { InstrumentSection } from "@/app/(instrument)/types";

const SECTIONS: InstrumentSection[] = [
  {
    sectionId: "s1",
    name: "Sección 1",
    order: 1,
    questions: [
      {
        questionId: "q-text",
        text: "¿Nombre?",
        isRequired: false,
        order: 1,
        type: { typeId: "t-text", name: "open_text" },
        options: [],
      },
      {
        questionId: "q-multi",
        text: "¿Cultivos?",
        isRequired: false,
        order: 2,
        type: { typeId: "t-multi", name: "multiple_choice" },
        options: [],
      },
      {
        questionId: "q-conditional",
        text: "Solo si aplica",
        isRequired: false,
        order: 3,
        type: { typeId: "t-text", name: "open_text" },
        options: [],
        conditionQuestionId: "q-text",
        conditionValue: "trigger-value",
      },
    ],
  },
];

describe("useInstrumentSurveyStore.buildResponsesPayload", () => {
  beforeEach(() => {
    useInstrumentSurveyStore.getState().resetSurvey();
  });

  it("returns an empty payload when there is no active surveyId", () => {
    useInstrumentSurveyStore
      .getState()
      .initializeSurvey({
        localId: "local-1",
        instrumentId: "instr-1",
        instrumentName: "Instrumento",
        sections: SECTIONS,
      });

    expect(useInstrumentSurveyStore.getState().buildResponsesPayload()).toEqual(
      [],
    );
  });

  it("fans out multiple_choice answers into one payload item per option", () => {
    const store = useInstrumentSurveyStore.getState();
    store.initializeSurvey({
      localId: "local-1",
      instrumentId: "instr-1",
      instrumentName: "Instrumento",
      sections: SECTIONS,
    });
    useInstrumentSurveyStore.setState({ surveyId: "survey-1" });
    store.setAnswer({ questionId: "q-multi", optionIds: ["opt-a", "opt-b"] });

    const payload = useInstrumentSurveyStore.getState().buildResponsesPayload();

    expect(payload).toEqual([
      { surveyId: "survey-1", questionId: "q-multi", optionId: "opt-a" },
      { surveyId: "survey-1", questionId: "q-multi", optionId: "opt-b" },
    ]);
  });

  it("trims textValue and omits fields with no value", () => {
    const store = useInstrumentSurveyStore.getState();
    store.initializeSurvey({
      localId: "local-1",
      instrumentId: "instr-1",
      instrumentName: "Instrumento",
      sections: SECTIONS,
    });
    useInstrumentSurveyStore.setState({ surveyId: "survey-1" });
    store.setAnswer({ questionId: "q-text", textValue: "  Juan Pérez  " });

    const payload = useInstrumentSurveyStore.getState().buildResponsesPayload();

    expect(payload).toEqual([
      { surveyId: "survey-1", questionId: "q-text", textValue: "Juan Pérez" },
    ]);
  });

  it("excludes questions hidden by isQuestionVisible from the payload", () => {
    const store = useInstrumentSurveyStore.getState();
    store.initializeSurvey({
      localId: "local-1",
      instrumentId: "instr-1",
      instrumentName: "Instrumento",
      sections: SECTIONS,
    });
    useInstrumentSurveyStore.setState({ surveyId: "survey-1" });
    // q-text no dispara el valor que habilita q-conditional
    store.setAnswer({ questionId: "q-text", textValue: "otro valor" });
    store.setAnswer({ questionId: "q-conditional", textValue: "no debería enviarse" });

    const payload = useInstrumentSurveyStore.getState().buildResponsesPayload();

    expect(payload.some((r) => r.questionId === "q-conditional")).toBe(false);
  });
});
