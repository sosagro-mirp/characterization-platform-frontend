"use client";

import { useState } from "react";
import { QuestionDetail } from "@/app/(admin)/types";
import { EditorSelection, useInstrumentEditorStore } from "@/store/useInstrumentEditorStore";
import { CopyPlus, GitBranch } from "lucide-react";
import ConfirmDialog from "./ConfirmDialog";

const TYPE_LABELS: Record<string, string> = {
  open_text: "Texto",
  numeric: "Número",
  yes_no: "Sí/No",
  single_choice: "Única",
  likert: "Likert",
  multiple_choice: "Múltiple",
  compliance: "Cumplimiento",
};

interface QuestionNodeProps {
  question: QuestionDetail;
  sectionId: string;
  isFirst: boolean;
  isLast: boolean;
  selection: EditorSelection;
}

export default function QuestionNode({
  question,
  sectionId,
  isFirst,
  isLast,
  selection,
}: QuestionNodeProps) {
  const { sections, setSelection, reorderQuestion, removeQuestionFromStore, duplicateQuestion } =
    useInstrumentEditorStore();

  const [duplicating, setDuplicating] = useState(false);
  const [showDeleteWarning, setShowDeleteWarning] = useState(false);
  const [affectedQuestions, setAffectedQuestions] = useState<QuestionDetail[]>([]);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const dependents = sections
      .flatMap((s) => s.questions)
      .filter((q) => q.conditionQuestionId === question.questionId);
    if (dependents.length > 0) {
      setAffectedQuestions(dependents);
      setShowDeleteWarning(true);
    } else {
      removeQuestionFromStore(sectionId, question.questionId);
    }
  };

  const handleDuplicate = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (duplicating) return;
    setDuplicating(true);
    try {
      await duplicateQuestion(sectionId, question.questionId);
    } finally {
      setDuplicating(false);
    }
  };

  const isSelected =
    selection?.kind === "question" &&
    selection.questionId === question.questionId;

  return (
    <div
      className={`group flex items-start gap-2 rounded-lg px-2 py-1.5 cursor-pointer transition-colors ${isSelected ? "bg-[var(--success-bg)] text-[var(--success-fg)]" : "hover:bg-[var(--surface-muted)]"
        }`}
      onClick={() =>
        setSelection({ kind: "question", sectionId, questionId: question.questionId })
      }
    >
      <span className="mt-0.5 text-xs text-[var(--text-muted)] w-4 shrink-0">
        {question.order}.
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm truncate text-[var(--text-primary)]">{question.text}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-[10px] font-medium rounded-full bg-[var(--surface-muted)] px-1.5 py-0.5 text-[var(--text-muted)]">
            {TYPE_LABELS[question.type?.name] ?? question.type?.name}
          </span>
          {question.isRequired && (
            <span className="text-[10px] text-[var(--danger-fg)] font-medium">*</span>
          )}
          {question.isSelectionCriteria && (
            <span
              className="text-[10px] font-medium rounded-full bg-indigo-100 px-1.5 py-0.5 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300"
              title="Criterio de selección de unidades productivas"
            >
              Criterio
            </span>
          )}
          {question.conditionQuestionId && (
            <span title="Pregunta condicional">
              <GitBranch className="w-2.5 h-2.5 text-[var(--text-muted)]" />
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <button
          type="button"
          disabled={isFirst}
          onClick={(e) => {
            e.stopPropagation();
            reorderQuestion(sectionId, question.questionId, "up");
          }}
          className="p-1 rounded hover:bg-[var(--border)] disabled:opacity-30"
          title="Subir"
        >
          <svg className="w-3 h-3" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 4l5 6H3l5-6z" />
          </svg>
        </button>
        <button
          type="button"
          disabled={isLast}
          onClick={(e) => {
            e.stopPropagation();
            reorderQuestion(sectionId, question.questionId, "down");
          }}
          className="p-1 rounded hover:bg-[var(--border)] disabled:opacity-30"
          title="Bajar"
        >
          <svg className="w-3 h-3" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 12L3 6h10l-5 6z" />
          </svg>
        </button>
        <button
          type="button"
          disabled={duplicating}
          onClick={handleDuplicate}
          className="p-1 rounded hover:bg-[var(--border)] disabled:opacity-30"
          title="Duplicar"
        >
          <CopyPlus className="w-3 h-3" />
        </button>
        <button
          type="button"
          onClick={handleDeleteClick}
          className="p-1 rounded hover:bg-[var(--danger-bg)] text-[var(--danger-fg)]"
          title="Eliminar"
        >
          <svg className="w-3 h-3" viewBox="0 0 16 16" fill="currentColor">
            <path d="M6 2h4a1 1 0 0 1 0 2H6a1 1 0 0 1 0-2zM3 5h10l-1 9H4L3 5zm3 2v5h1V7H6zm3 0v5h1V7H9z" />
          </svg>
        </button>
      </div>

      <ConfirmDialog
        open={showDeleteWarning}
        title="Eliminar pregunta referenciada"
        description="Las siguientes preguntas usan esta pregunta como condición de visibilidad. Al eliminarla, perderán su condición y siempre serán visibles:"
        confirmLabel="Eliminar de todas formas"
        destructive
        onConfirm={() => {
          setShowDeleteWarning(false);
          removeQuestionFromStore(sectionId, question.questionId);
        }}
        onCancel={() => setShowDeleteWarning(false)}
      >
        <ul className="space-y-1 text-sm text-[var(--text-primary)]">
          {affectedQuestions.map((q) => (
            <li key={q.questionId} className="flex items-start gap-1.5">
              <span className="text-[var(--text-muted)] shrink-0">{q.order}.</span>
              <span className="truncate">{q.text}</span>
            </li>
          ))}
        </ul>
      </ConfirmDialog>
    </div>
  );
}
