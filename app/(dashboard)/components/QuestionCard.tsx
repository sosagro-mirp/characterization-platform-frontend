import QuestionChartFactory from "./QuestionChartFactory";
import { DashboardQuestion } from "../types";

const TYPE_LABELS: Record<string, string> = {
  yes_no: "Sí/No",
  single_choice: "Selección única",
  multiple_choice: "Selección múltiple",
  likert: "Escala de acuerdo",
  compliance: "Cumplimiento",
  numeric: "Numérica",
};

interface QuestionCardProps {
  question: DashboardQuestion;
}

export default function QuestionCard({ question }: QuestionCardProps) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-surface p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs text-text-muted uppercase tracking-wide">
            {question.sectionName}
          </p>
          <h3 className="font-medium text-text-primary mt-0.5">
            {question.questionText}
          </h3>
        </div>
        <span className="shrink-0 text-xs rounded-full bg-brand-light text-brand-dark px-2 py-0.5">
          {TYPE_LABELS[question.questionType] ?? question.questionType}
        </span>
      </div>

      {question.suppressed ? (
        <p className="text-sm text-warning-fg bg-warning-bg/40 rounded-md px-3 py-2">
          Muestra insuficiente para esta pregunta (n = {question.answeredCount},
          se requieren al menos 5).
        </p>
      ) : (
        <>
          <QuestionChartFactory question={question} />
          <p className="text-xs text-text-muted">n = {question.answeredCount}</p>
        </>
      )}
    </div>
  );
}
