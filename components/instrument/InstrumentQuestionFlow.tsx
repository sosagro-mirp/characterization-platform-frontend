"use client";

import { useEffect, useMemo, useState } from "react";
import InstrumentQuestionRenderer from "@/components/instrument/InstrumentQuestionRenderer";
import SurveyCompletedCard from "@/components/instrument/SurveyCompletedCard";
import type {
    InstrumentDraftAnswer,
    InstrumentQuestion,
    InstrumentSection,
} from "@/app/(instrument)/types";
import { useInstrumentSurveyStore } from "@/store/useInstrumentSurveyStore";

interface InstrumentQuestionFlowProps {
    localId: string;
    instrumentName: string;
    sections: InstrumentSection[];
    isOffline: boolean;
    apiBaseUrl: string;
}

export default function InstrumentQuestionFlow({
    localId,
    instrumentName,
    sections,
    isOffline,
    apiBaseUrl,
}: InstrumentQuestionFlowProps) {
    const [validationError, setValidationError] = useState<string>();
    const [completed, setCompleted] = useState(false);
    const [savedOffline, setSavedOffline] = useState(false);
    const {
        initializeSurvey,
        flattenedQuestions,
        currentIndex,
        answers,
        setAnswer,
        goNext,
        goPrevious,
        submitResponses,
        submitting,
        error,
        clearError,
    } = useInstrumentSurveyStore();

    useEffect(() => {
        initializeSurvey({
            localId,
            instrumentName,
            sections,
        });
    }, [initializeSurvey, localId, instrumentName, sections]);

    const totalQuestions = flattenedQuestions.length;
    const currentItem = flattenedQuestions[currentIndex];
    const currentQuestion = currentItem?.question as InstrumentQuestion | undefined;
    const currentAnswer = currentQuestion ? answers[currentQuestion.questionId] : undefined;
    const isLastQuestion = currentIndex === totalQuestions - 1;
    const progress = totalQuestions > 0 ? ((currentIndex + 1) / totalQuestions) * 100 : 0;

    const sortedSections = useMemo(
        () => [...sections].sort((a, b) => a.order - b.order),
        [sections],
    );
    const currentSectionName = currentItem?.sectionName ?? sortedSections[0]?.name ?? "";

    const isAnswerComplete = (question: InstrumentQuestion, answer?: InstrumentDraftAnswer) => {
        if (!question.isRequired) {
            return true;
        }

        if (!answer) {
            return false;
        }

        switch (question.type.name) {
            case "open_text":
                return Boolean(answer.textValue?.trim());
            case "numeric":
                return answer.numericValue !== undefined;
            case "yes_no":
                return answer.booleanValue !== undefined;
            case "multiple_choice": {
                const selectedIds = answer.optionIds ?? [];
                if (selectedIds.length === 0) return false;
                const otherOption = question.options.find((o) => o.isOther);
                if (otherOption && selectedIds.includes(otherOption.optionId)) {
                    return Boolean(answer.otherText?.trim());
                }
                return true;
            }
            case "single-choice":
            case "likert":
                return Boolean(answer.optionId);
            default:
                return Boolean(
                    answer.optionId ||
                    answer.textValue ||
                    answer.numericValue !== undefined ||
                    answer.booleanValue !== undefined,
                );
        }
    };

    const handleAnswerChange = (answer: InstrumentDraftAnswer) => {
        setValidationError(undefined);
        clearError();
        setAnswer(answer);
    };

    // * Validar respuesta antes de avanzar o enviar
    const handleNext = async () => {
        // * Validar que la respuesta actual esté completa antes de avanzar
        if (currentQuestion && !isAnswerComplete(currentQuestion, currentAnswer)) {
            setValidationError("Debes responder esta pregunta antes de continuar.");
            return;
        }

        // * Si es la última pregunta, enviar respuestas al servidor
        if (isLastQuestion) {
            const result = await submitResponses(apiBaseUrl);

            if (result.outcome === "submitted") {
                // * Si se envió correctamente, marcar como completado
                setCompleted(true);
            } else if (result.outcome === "saved_offline") {
                // * Si se guardó offline, marcar como completado y guardado offline
                setCompleted(true);
                setSavedOffline(true);
            }
            return;
        }
        goNext();
    };

    const handlePrevious = () => {
        setValidationError(undefined);
        clearError();
        goPrevious();
    };

    if (completed) {
        return <SurveyCompletedCard savedOffline={savedOffline} />;
    }

    return (
        <section className=" h-screen bg-white flex flex-col justify-between" data-answers-count={Object.keys(answers).length}>
            {isOffline && (
                <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2 text-sm text-yellow-800 text-center">
                    Sin conexion. Las respuestas se guardaran localmente y se enviaran cuando haya red.
                </div>
            )}
            <div className="border-b border-b-gray-200 p-4">
                <div className="w-full flex items-center justify-between max-w-xl mx-auto">
                    <div>
                        <h3 className="uppercase text-gray-400">{currentSectionName}</h3>
                        <h2 className="font-bold">{instrumentName}</h2>
                    </div>
                    <div className="text-gray-400 ">
                        <span>
                            {totalQuestions === 0 ? 0 : currentIndex + 1} / {totalQuestions}
                        </span>
                    </div>
                </div>
                <div className="bg-gray-200 h-2 rounded-xl mt-4 max-w-xl mx-auto">
                    <div
                        className="bg-green-500 h-2 rounded-xl"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            <div className="p-4 max-w-xl mx-auto ">
                {currentQuestion ? (
                    <>
                        <InstrumentQuestionRenderer
                            question={currentQuestion}
                            answer={currentAnswer}
                            onAnswerChange={handleAnswerChange}
                        />
                        {(validationError || error) && (
                            <p className="mt-4 rounded-md bg-red-50 px-4 py-2 text-sm text-red-700">
                                {validationError || error}
                            </p>
                        )}
                    </>
                ) : (
                    <p className="text-gray-500">No hay preguntas disponibles en esta seccion.</p>
                )}
            </div>

            <div className="px-4 py-6 border-t border-t-gray-200 items-center">
                <div className="flex w-full max-w-xl mx-auto justify-between">
                    <button
                        type="button"
                        onClick={handlePrevious}
                        disabled={currentIndex === 0}
                        aria-label="Pregunta anterior"
                        className="disabled:opacity-40"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="size-6 text-gray-500"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
                            />
                        </svg>
                    </button>

                    <button
                        type="button"
                        onClick={handleNext}
                        disabled={submitting}
                        className="bg-green-900 px-4 py-3 rounded-xl text-gray-200 flex items-center gap-2 disabled:opacity-50"
                    >
                        {submitting ? "Enviando..." : isLastQuestion ? "Finalizar" : "Siguiente"}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="size-6"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                            />
                        </svg>
                    </button>

                </div>

            </div>
        </section>
    );
}
