import OpenInput from "@/components/inputs/OpenInput";
import CheckboxGroup from "@/components/inputs/CheckboxGroup";
import SingleChoiceGroup from "@/components/inputs/SingleChoiceGroup";
import type { InstrumentDraftAnswer, InstrumentQuestion } from "@/app/(instrument)/types";

interface InstrumentQuestionRendererProps {
    question: InstrumentQuestion;
    answer?: InstrumentDraftAnswer;
    onAnswerChange: (answer: InstrumentDraftAnswer) => void;
}

export default function InstrumentQuestionRenderer({
    question,
    answer,
    onAnswerChange,
}: InstrumentQuestionRendererProps) {
    if (question.type.name === "open_text") {
        return (
            <OpenInput
                id={question.questionId}
                name={question.questionId}
                label={question.text}
                isRequired={question.isRequired}
                type="text"
                value={answer?.textValue ?? ""}
                onChange={(event) =>
                    onAnswerChange({
                        questionId: question.questionId,
                        textValue: event.target.value,
                    })
                }
            />
        );
    }

    if (question.type.name === "numeric") {
        return (
            <OpenInput
                id={question.questionId}
                name={question.questionId}
                label={question.text}
                isRequired={question.isRequired}
                type="number"
                value={answer?.numericValue ?? ""}
                onChange={(event) =>
                    onAnswerChange({
                        questionId: question.questionId,
                        numericValue:
                            event.target.value === "" ? undefined : Number(event.target.value),
                    })
                }
            />
        );
    }

    if (question.type.name === "single-choice" || question.type.name === "likert") {
        return (
            <SingleChoiceGroup
                name={question.questionId}
                label={question.text}
                isRequired={question.isRequired}
                options={question.options.map((option) => ({
                    id: option.optionId,
                    label: option.text,
                }))}
                selectedOptionId={answer?.optionId}
                onChange={(optionId) =>
                    onAnswerChange({
                        questionId: question.questionId,
                        optionId,
                    })
                }
            />
        );
    }

    if (question.type.name === "yes_no") {
        return (
            <SingleChoiceGroup
                name={question.questionId}
                label={question.text}
                isRequired={question.isRequired}
                options={[
                    { id: "yes", label: "Si" },
                    { id: "no", label: "No" },
                ]}
                selectedOptionId={
                    answer?.booleanValue === undefined
                        ? undefined
                        : answer.booleanValue
                            ? "yes"
                            : "no"
                }
                onChange={(selectedId) =>
                    onAnswerChange({
                        questionId: question.questionId,
                        booleanValue: selectedId === "yes",
                    })
                }
            />
        );
    }

    if (question.type.name === "multiple_choice") {
        return (
            <CheckboxGroup
                name={question.questionId}
                label={question.text}
                isRequired={question.isRequired}
                options={question.options.map((option) => ({
                    id: option.optionId,
                    label: option.text,
                }))}
                selectedOptionIds={answer?.optionIds ?? []}
                onChange={(optionIds) =>
                    onAnswerChange({
                        questionId: question.questionId,
                        optionIds,
                    })
                }
            />
        );
    }

    return (
        <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-amber-900">
            Tipo de pregunta no soportado: {question.type.name}
        </div>
    );
}
