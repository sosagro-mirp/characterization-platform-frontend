import QuestionChartFactory from "./QuestionChartFactory";
import { DashboardQuestion } from "../types";

interface QuestionCardProps {
  question: DashboardQuestion;
}

/** Spec 66 (Fase 3, ajuste de estilo 2026-08-05): se quitó la línea de
 * sección/instrumento y el badge de tipo de pregunta — solo queda el
 * título de la pregunta como encabezado. Ver bitácora de ajustes del spec. */
export default function QuestionCard({ question }: QuestionCardProps) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-surface p-4 flex flex-col gap-3">
      <h3 className="text-sm font-light uppercase tracking-wide text-text-primary">
        {question.questionText}
      </h3>

      {question.suppressed ? (
        <p className="text-sm text-warning-fg bg-warning-bg/40 rounded-md px-3 py-2">
          Muestra insuficiente para esta pregunta (n = {question.answeredCount},
          se requieren al menos 5).
        </p>
      ) : (
        <QuestionChartFactory question={question} />
      )}
    </div>
  );
}
