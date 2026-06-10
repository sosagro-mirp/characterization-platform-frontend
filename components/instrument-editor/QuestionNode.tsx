"use client";

import { QuestionDetail } from "@/app/(admin)/types";
import { EditorSelection, useInstrumentEditorStore } from "@/store/useInstrumentEditorStore";

const TYPE_LABELS: Record<string, string> = {
  open_text: "Texto",
  numeric: "Número",
  yes_no: "Sí/No",
  single_choice: "Única",
  likert: "Likert",
  multiple_choice: "Múltiple",
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
  const { setSelection, reorderQuestion, removeQuestionFromStore, duplicateQuestion } =
    useInstrumentEditorStore();

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
          onClick={(e) => {
            e.stopPropagation();
            duplicateQuestion(sectionId, question.questionId);
          }}
          className="p-1 rounded hover:bg-[var(--border)]"
          title="Duplicar"
        >
          <svg className="w-3 h-3" viewBox="0 0 16 16" fill="currentColor">
            <path d="M4 2a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h5a2 2 0 0 0 2-2V8l-4-4H4zm4 1v3h3L8 3zM2 4a1 1 0 0 1 1-1h4l3 3v6a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4z"/>
            <path d="M9 1H5a1 1 0 0 0-1 1v1h1V2h4v1h1V2a1 1 0 0 0-1-1z" opacity=".5"/>
          </svg>
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            removeQuestionFromStore(sectionId, question.questionId);
          }}
          className="p-1 rounded hover:bg-[var(--danger-bg)] text-[var(--danger-fg)]"
          title="Eliminar"
        >
          <svg className="w-3 h-3" viewBox="0 0 16 16" fill="currentColor">
            <path d="M6 2h4a1 1 0 0 1 0 2H6a1 1 0 0 1 0-2zM3 5h10l-1 9H4L3 5zm3 2v5h1V7H6zm3 0v5h1V7H9z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
