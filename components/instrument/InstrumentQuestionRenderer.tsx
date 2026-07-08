import OpenInput from "@/components/inputs/OpenInput";
import CheckboxGroup from "@/components/inputs/CheckboxGroup";
import SingleChoiceGroup from "@/components/inputs/SingleChoiceGroup";
import MediaAttachmentViewer from "@/components/inputs/MediaAttachmentViewer";
import GpsCoordinateInput from "@/components/inputs/GpsCoordinateInput";
import type { InstrumentDraftAnswer, InstrumentQuestion, InstrumentOption } from "@/app/(instrument)/types";

type InstrumentOptionValue = InstrumentOption["value"];

const GPS_SYSTEM_FIELDS: Record<string, "latitude" | "longitude"> = {
    "farm.latitude": "latitude",
    "farm.longitude": "longitude",
};

interface InstrumentQuestionRendererProps {
    question: InstrumentQuestion;
    answer?: InstrumentDraftAnswer;
    onAnswerChange: (answer: InstrumentDraftAnswer) => void;
    filteredOptions?: InstrumentOption[];
}

export default function InstrumentQuestionRenderer({
    question,
    answer,
    onAnswerChange,
    filteredOptions,
}: InstrumentQuestionRendererProps) {
    if (question.systemField && question.systemField in GPS_SYSTEM_FIELDS) {
        const fieldType = GPS_SYSTEM_FIELDS[question.systemField];
        return (
            <GpsCoordinateInput
                questionId={question.questionId}
                fieldType={fieldType}
                label={question.text}
                isRequired={question.isRequired}
                value={answer?.numericValue}
                onChange={onAnswerChange}
            />
        );
    }

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

    if (question.type.name === "numeric_with_unit") {
        return (
            <div className="space-y-3">
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
                            optionId: answer?.optionId,
                        })
                    }
                />
                <SingleChoiceGroup
                    name={`${question.questionId}-unit`}
                    label="Unidad"
                    isRequired={question.isRequired}
                    options={question.options.map((option) => ({
                        id: option.optionId,
                        label: option.text,
                    }))}
                    selectedOptionId={answer?.optionId}
                    onChange={(optionId) =>
                        onAnswerChange({
                            questionId: question.questionId,
                            numericValue: answer?.numericValue,
                            optionId,
                        })
                    }
                />
            </div>
        );
    }


    if (question.type.name === "likert") {
        const sortedOptions = [...question.options].sort((a, b) => {
            const aVal = typeof a.value === "number" ? a.value : Number(a.value);
            const bVal = typeof b.value === "number" ? b.value : Number(b.value);
            return aVal - bVal;
        });
        return (
            <SingleChoiceGroup
                name={question.questionId}
                label={question.text}
                isRequired={question.isRequired}
                options={sortedOptions.map((option) => ({
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

    if (question.type.name === "single_choice") {
        const optionsToRender = filteredOptions ?? question.options;
        const otherOption = optionsToRender.find((o) => o.isOther);
        const sortedOptions = [
            ...optionsToRender.filter((o) => !o.isOther),
            ...optionsToRender.filter((o) => o.isOther),
        ];
        return (
            <SingleChoiceGroup
                name={question.questionId}
                label={question.text}
                isRequired={question.isRequired}
                options={sortedOptions.map((option) => ({
                    id: option.optionId,
                    label: option.text,
                    isOther: option.isOther,
                }))}
                selectedOptionId={answer?.optionId}
                otherText={answer?.otherText}
                onChange={(optionId) =>
                    onAnswerChange({
                        questionId: question.questionId,
                        optionId,
                        otherText:
                            optionId === otherOption?.optionId
                                ? (answer?.otherText ?? "")
                                : undefined,
                    })
                }
                onOtherTextChange={(text) =>
                    onAnswerChange({
                        questionId: question.questionId,
                        optionId: answer?.optionId,
                        otherText: text,
                    })
                }
            />
        );
    }

    if (question.type.name === "compliance") {
        const styleByValue = (value: InstrumentOptionValue): { containerClassName: string; accentClassName: string } => {
            const numeric = value === null || value === undefined ? null : Number(value);
            if (numeric === 2) {
                return { containerClassName: "border-green-300 bg-green-50", accentClassName: "accent-green-700" };
            }
            if (numeric === 1) {
                return { containerClassName: "border-amber-300 bg-amber-50", accentClassName: "accent-amber-600" };
            }
            if (numeric === 0) {
                return { containerClassName: "border-red-300 bg-red-50", accentClassName: "accent-red-700" };
            }
            return { containerClassName: "border-gray-200 bg-gray-50", accentClassName: "accent-gray-500" };
        };

        return (
            <SingleChoiceGroup
                name={question.questionId}
                label={question.text}
                isRequired={question.isRequired}
                options={question.options.map((option) => {
                    const style = styleByValue(option.value);
                    return {
                        id: option.optionId,
                        label: option.text,
                        containerClassName: style.containerClassName,
                        accentClassName: style.accentClassName,
                    };
                })}
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
        const otherOption = question.options.find((o) => o.isOther);
        const sortedOptions = [
            ...question.options.filter((o) => !o.isOther),
            ...question.options.filter((o) => o.isOther),
        ];
        return (
            <CheckboxGroup
                name={question.questionId}
                label={question.text}
                isRequired={question.isRequired}
                options={sortedOptions.map((option) => ({
                    id: option.optionId,
                    label: option.text,
                    isOther: option.isOther,
                }))}
                selectedOptionIds={answer?.optionIds ?? []}
                otherText={answer?.otherText}
                onChange={(optionIds) =>
                    onAnswerChange({
                        questionId: question.questionId,
                        optionIds,
                        otherText: optionIds.includes(otherOption?.optionId ?? "")
                            ? (answer?.otherText ?? "")
                            : undefined,
                    })
                }
                onOtherTextChange={(text) =>
                    onAnswerChange({
                        questionId: question.questionId,
                        optionIds: answer?.optionIds ?? [],
                        otherText: text,
                    })
                }
            />
        );
    }

    if (
        question.type.name === "image" ||
        question.type.name === "voice_recording" ||
        question.type.name === "document" ||
        question.type.name === "video"
    ) {
        return (
            <MediaAttachmentViewer
                label={question.text}
                isRequired={question.isRequired}
                publicUrl={answer?.publicUrl}
                mimeType={answer?.mimeType}
                originalFilename={answer?.originalFilename}
            />
        );
    }

    return (
        <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-amber-900">
            Tipo de pregunta no soportado: {question.type.name}
        </div>
    );
}
