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
    instrumentId: string;
    instrumentName: string;
    sections: InstrumentSection[];
    apiBaseUrl: string;
    campaignSessionId?: string;
    stepOrder?: number;
    previewMode?: boolean;
    existingSurveyId?: string;
    onPreviewComplete?: () => void;
}

export default function InstrumentQuestionFlow({
    localId,
    instrumentId,
    instrumentName,
    sections,
    apiBaseUrl,
    campaignSessionId,
    stepOrder,
    previewMode = false,
    existingSurveyId,
    onPreviewComplete,
}: InstrumentQuestionFlowProps) {
    const router = useRouter();
    const [validationError, setValidationError] = useState<string>();
    const [completed, setCompleted] = useState(false);
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
            instrumentId,
            instrumentName,
            sections,
        });
    }, [initializeSurvey, localId, instrumentId, instrumentName, sections]);

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

    const handleNext = async () => {
        if (currentQuestion && !isQuestionVisible(currentQuestion, answers)) {
            goNext();
            return;
        }

        if (!previewMode && currentQuestion && !isAnswerComplete(currentQuestion, currentAnswer)) {
            setValidationError("Debes responder esta pregunta antes de continuar.");
            return;
        }

        if (isLastQuestion) {
            if (previewMode) {
                if (onPreviewComplete) {
                    onPreviewComplete();
                } else {
                    setCompleted(true);
                }
                return;
            }

            const result = await submitResponses({
                campaignSessionId,
                stepOrder,
                existingSurveyId,
            });

            if (result.outcome === "submitted") {
                setCompleted(true);
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
        router.push("/campaign");
    };

    if (completed) {
        if (previewMode) {
            return (
                <SurveyCompletedCard
                    title="Vista previa completada"
                    message="Ningún dato fue enviado al servidor. Esta es una vista de revisión del instrumento."
                    ctaText="Volver a instrumentos"
                    ctaHref="/admin/instruments"
                />
            );
        }
        return (
            <SurveyCompletedCard
                campaignSessionId={campaignSessionId}
            />
        );
    }

    return (
        <div
            className="min-h-[calc(100dvh-4rem)] sm:min-h-[calc(100dvh-3.5rem)] bg-gray-100 flex flex-col"
            data-answers-count={Object.keys(answers).length}
        >
            {/* Banners de estado */}
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
            {previewMode && (
                <div className="bg-amber-50 border-b border-amber-300 px-4 py-2 text-sm text-amber-800 text-center flex items-center justify-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-4 shrink-0">
                        <path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
                        <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 0 1 0-1.186A10.004 10.004 0 0 1 10 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0 1 10 17c-4.257 0-7.893-2.66-9.336-6.41ZM14 10a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" clipRule="evenodd" />
                    </svg>
                    Modo vista previa — sin datos enviados
                </div>
            )}

            {/* Contenido scrollable */}
            <div className="flex-1">
                <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">

                    {/* Tarjeta de marca / header */}
                    <div className="bg-white rounded-lg shadow-sm px-6 py-4 flex items-center gap-3 justify-center">
                        <div>
                            <p className="text-4xl font-semibold text-green-700 uppercase tracking-widest text-center">SosAgro 4.C</p>
                            <p className="text-xs text-gray-400 leading-tight text-center">Plataforma de Caracterización Agrícola</p>
                        </div>
                    </div>

                    {/* Tarjeta de encabezado del instrumento */}
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <div className="h-2 bg-green-700" />
                        <div className="px-6 py-5 flex items-start justify-between gap-4">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">{instrumentName}</h2>
                                {currentSectionName && (
                                    <p className="mt-1 text-sm text-gray-500 uppercase tracking-wide">
                                        {currentSectionName}
                                    </p>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() => previewMode ? router.push("/admin/instruments") : setShowExitConfirm(true)}
                                aria-label={previewMode ? "Salir de la vista previa" : "Salir de la encuesta"}
                                className="shrink-0 p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth="1.5"
                                    stroke="currentColor"
                                    className="size-5"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Tarjeta de la pregunta */}
                    {currentQuestion ? (
                        <InstrumentQuestionRenderer
                            question={currentQuestion}
                            answer={currentAnswer}
                            onAnswerChange={handleAnswerChange}
                        />
                    ) : (
                        <div className="bg-white rounded-lg shadow-sm px-6 py-8 text-center text-gray-500">
                            No hay preguntas disponibles en esta sección.
                        </div>
                    )}

                    {/* Error de validación */}
                    {(validationError || error) && (
                        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                            {validationError || error}
                        </div>
                    )}

                    {/* Barra de progreso y navegación */}
                    <div className="bg-white rounded-lg shadow-sm px-6 py-4">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="flex-1 bg-gray-200 h-1.5 rounded-full overflow-hidden">
                                <div
                                    className="bg-green-600 h-1.5 rounded-full transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <span className="text-sm text-gray-500 shrink-0 tabular-nums">
                                {totalVisible === 0 ? 0 : visibleIndex + 1} / {totalVisible}
                            </span>
                        </div>

                        <div className="flex justify-between items-center">
                            <button
                                type="button"
                                onClick={handlePrevious}
                                disabled={currentIndex === 0}
                                className="px-5 py-2 rounded-md text-sm font-medium text-green-700 hover:bg-green-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                Atrás
                            </button>
                            <button
                                type="button"
                                onClick={handleNext}
                                disabled={submitting}
                                className="px-5 py-2 rounded-md text-sm font-medium text-green-700 hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {submitting
                                    ? "Enviando..."
                                    : isLastQuestion
                                        ? previewMode ? "Finalizar vista previa" : "Finalizar"
                                        : "Siguiente"}
                            </button>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="text-center py-4 space-y-1">
                        <p className="text-xs text-gray-400">
                            Instituto Tecnológico Metropolitano · Proyecto SOSAgro 4C
                        </p>
                        <p className="text-xs text-gray-300">
                            Código SIGP 108927 · Convocatoria SGR 2023–2024
                        </p>
                    </div>

                </div>
            </div>

            {/* Modal de salida */}
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
        </div>
    );
}
