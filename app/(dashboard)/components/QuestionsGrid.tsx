"use client";

import QuestionCard from "./QuestionCard";
import CropCultivationCard from "./CropCultivationCard";
import { DashboardQuestion } from "../types";
import { resolveChartKind } from "@/lib/dashboard/chartHint";
import { isCropCultivationQuestion } from "@/lib/dashboard/cropCultivation";

interface QuestionsGridProps {
  questions: DashboardQuestion[];
  hasInstrument: boolean;
}

export default function QuestionsGrid({ questions, hasInstrument }: QuestionsGridProps) {
  if (!hasInstrument) {
    return (
      <div className="rounded-lg border border-[var(--border)] bg-surface-muted px-4 py-6 text-center text-text-muted">
        Selecciona un instrumento en el panel de filtros para explorar los datos
        agregados y anonimizados recolectados en campo.
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="rounded-lg border border-[var(--border)] bg-surface-muted px-4 py-6 text-center text-text-muted">
        No hay preguntas visualizables para este instrumento con los filtros
        actuales.
      </div>
    );
  }

  // Spec 66 (Fase 3, D8, 2026-08-10): las 4 preguntas "¿Cultiva actualmente
  // X?" se combinan en una sola tarjeta (`CropCultivationCard`) en vez de
  // renderizarse una por una — se extraen acá y se insertan como una sola
  // entrada en el punto donde apareció la primera, para no alterar el orden
  // de lectura del resto de la grilla.
  const cropCultivationQuestions = questions.filter((q) =>
    isCropCultivationQuestion(q.questionText),
  );
  const firstCropIndex = questions.findIndex((q) =>
    isCropCultivationQuestion(q.questionText),
  );

  const items = questions.reduce<React.ReactNode[]>((acc, question, index) => {
    if (isCropCultivationQuestion(question.questionText)) {
      if (index === firstCropIndex) {
        acc.push(
          <li key="crop-cultivation">
            <CropCultivationCard questions={cropCultivationQuestions} />
          </li>,
        );
      }
      return acc;
    }

    // Ajuste de estilo (spec 66, Fase 4, 2026-08-10): "Departamento"
    // (mapa + BarrasH lado a lado, `DepartmentMap`) necesita más ancho que
    // una tarjeta a media grilla — ocupa las dos columnas en vez de una.
    // Genérico a todo `chartHint: "map"`, no solo a esta pregunta.
    const kind = resolveChartKind({
      questionType: question.questionType,
      chartHint: question.chartHint,
    });
    const spanFull = kind === "map";
    acc.push(
      <li key={question.questionId} className={spanFull ? "lg:col-span-2" : undefined}>
        <QuestionCard question={question} />
      </li>,
    );
    return acc;
  }, []);

  return <ul className="grid grid-cols-1 lg:grid-cols-2 gap-4">{items}</ul>;
}
