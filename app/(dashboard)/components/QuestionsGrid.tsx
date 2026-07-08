"use client";

import QuestionCard from "./QuestionCard";
import { DashboardQuestion } from "../types";

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

  return (
    <ul className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {questions.map((question) => (
        <li key={question.questionId}>
          <QuestionCard question={question} />
        </li>
      ))}
    </ul>
  );
}
