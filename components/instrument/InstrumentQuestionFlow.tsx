"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import InstrumentQuestionRenderer from "@/components/instrument/InstrumentQuestionRenderer";
import SurveyCompletedCard from "@/components/instrument/SurveyCompletedCard";
import type {
    InstrumentDraftAnswer,
    InstrumentQuestion,
    InstrumentSection,
} from "@/app/(instrument)/types";
import { useInstrumentSurveyStore } from "@/store/useInstrumentSurveyStore";
import { isQuestionVisible } from "@/lib/isQuestionVisible";

interface InstrumentQuestionFlowProps {
    localId: string;
    instrumentName: string;
    sections: InstrumentSection[];
    isOffline: boolean;
    apiBaseUrl: string;
    campaignSessionId?: string;
    stepOrder?: number;
}

export default function InstrumentQuestionFlow({
    localId,
    instrumentName,
    sections,
    isOffline,
    apiBaseUrl,
    campaignSessionId,
    stepOrder,
}: InstrumentQuestionFlowProps) {
    const router = useRouter();
    const [validationError, setValidationError] = useState<string>();
    const [completed, setCompleted] = useState(false);
    const [savedOffline, setSavedOffline] = useState(false);
    const [showExitConfirm, setShowExitConfirm] = useState(false);
    const [sessionExpired, setSessionExpired] = useState(false);
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

    const currentItem = flattenedQuestions[currentIndex];
    const currentQuestion = currentItem?.question as InstrumentQuestion | undefined;
    const currentAnswer = currentQuestion ? answers[currentQuestion.questionId] : undefined;

    const visibleQuestions = useMemo(
        () => flattenedQuestions.filter(({ question }) => isQuestionVisible(question, answers)),
        [flattenedQuestions, answers],
    );
    const totalVisible = visibleQuestions.length;
    const visibleIndex = visibleQuestions.findIndex(
        ({ question }) => question.questionId === currentQuestion?.questionId,
    );
    const isLastQuestion = visibleIndex === totalVisible - 1;
    const progress = totalVisible > 0 ? ((visibleIndex + 1) / totalVisible) * 100 : 0;

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
            case "single_choice":
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
        // * Salvaguarda: si la pregunta actual no es visible, saltar sin validar
        if (currentQuestion && !isQuestionVisible(currentQuestion, answers)) {
            goNext();
            return;
        }

        // * Validar que la respuesta actual esté completa antes de avanzar
        if (currentQuestion && !isAnswerComplete(currentQuestion, currentAnswer)) {
            setValidationError("Debes responder esta pregunta antes de continuar.");
            return;
        }

        // * Si es la última pregunta, enviar respuestas al servidor
        if (isLastQuestion) {
            const result = await submitResponses(apiBaseUrl, {
                campaignSessionId,
                stepOrder,
            });

            if (result.outcome === "submitted") {
                // * Si se envió correctamente, marcar como completado
                setCompleted(true);
            } else if (result.outcome === "saved_offline") {
                // * Si se guardó offline, marcar como completado y guardado offline
                setCompleted(true);
                setSavedOffline(true);
            } else if (result.outcome === "session_expired") {
                setSessionExpired(true);
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

    const handleConfirmExit = () => {
        setShowExitConfirm(false);
        router.push("/");
    };

    if (completed) {
        return (
            <SurveyCompletedCard
                savedOffline={savedOffline}
                campaignSessionId={campaignSessionId}
            />
        );
    }

    return (
        <section className="h-[calc(100dvh-4rem)] sm:h-[calc(100dvh-3.5rem)] flex flex-col justify-between" data-answers-count={Object.keys(answers).length}>
            {/* Barra de progreso y encabezado */}
            <div>
                {sessionExpired && (
                    <div className="bg-red-50 border-b border-red-200 px-4 py-2 text-sm text-red-800 text-center flex items-center justify-center gap-3">
                        <span>Tu sesión expiró. Tus respuestas están guardadas localmente.</span>
                        <button
                            type="button"
                            onClick={() => router.push("/login")}
                            className="rounded-md bg-red-700 px-3 py-1 text-xs font-medium text-white hover:bg-red-800 transition-colors"
                        >
                            Iniciar sesión
                        </button>
                    </div>
                )}
                {isOffline && (
                    <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2 text-sm text-yellow-800 text-center">
                        Sin conexion. Las respuestas se guardaran localmente y se enviaran cuando haya red.
                    </div>
                )}
                <div className="border-b border-b-gray-200 p-4">
                    <div className="w-full flex items-center justify-between max-w-xl mx-auto gap-4">
                        <div>
                            <h3 className="uppercase text-gray-400">{currentSectionName}</h3>
                            <h2 className="font-bold">{instrumentName}</h2>
                        </div>
                        <div className="flex items-center gap-0">
                            <button
                                type="button"
                                onClick={() => setShowExitConfirm(true)}
                                aria-label="Salir de la encuesta"
                                className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            >
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
                                        d="M6 18 18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div className="bg-gray-200 h-2 rounded-xl mt-4 max-w-xl mx-auto">
                        <div
                            className="bg-green-500 h-2 rounded-xl"
                            style={{ width: `${progress}%` }}
                        />

                    </div>
                </div>
            </div>



            <div>
                {currentQuestion ? (
                    <>
                        <InstrumentQuestionRenderer
                            question={currentQuestion}
                            answer={currentAnswer}
                            onAnswerChange={handleAnswerChange}
                        />
                        <p className="text-gray-400 text-sm max-w-xl mx-auto mt-2 px-6">
                            Pregunta {totalVisible === 0 ? 0 : visibleIndex + 1} de {totalVisible}
                        </p>
                        {(validationError || error) && (
                            <p className="mt-4 max-w-xl mx-auto rounded-md bg-red-50 px-6 py-2 text-sm text-red-700">
                                {validationError || error}
                            </p>
                        )}
                    </>
                ) : (
                    <p className="text-gray-500">No hay preguntas disponibles en esta seccion.</p>
                )}
            </div>

            <div className="px-6 py-6 border-t border-t-gray-200 items-center">
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

            {showExitConfirm && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="exit-confirm-title"
                >
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                        <h3 id="exit-confirm-title" className="text-lg font-bold text-gray-900">
                            ¿Salir de la encuesta?
                        </h3>
                        <p className="mt-3 text-sm text-gray-600">
                            La encuesta está sin terminar y es posible que los cambios no se guarden. ¿Estás seguro de que deseas salir?
                        </p>
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setShowExitConfirm(false)}
                                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmExit}
                                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
                            >
                                Salir
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
