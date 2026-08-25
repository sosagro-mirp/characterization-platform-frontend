"use client";

import { useState } from "react";
import { QuestionDetail } from "@/app/(admin)/types";
import { EditorSelection, useInstrumentEditorStore } from "@/store/useInstrumentEditorStore";
import { ChevronDown, ChevronUp, CopyPlus, GitBranch, Star, Trash2 } from "lucide-react";
import ConfirmDialog from "./ConfirmDialog";

const TYPE_LABELS: Record<string, string> = {
  open_text: "Texto",
  numeric: "Número",
  numeric_with_unit: "Nº + unidad",
  yes_no: "Sí/No",
  single_choice: "Única",
  likert: "Likert",
  multiple_choice: "Múltiple",
  compliance: "Cumplimiento",
  image: "Imagen",
  voice_recording: "Voz",
  document: "PDF",
  video: "Video",
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
      className={`group flex items-center gap-2 border-b border-[var(--border)] py-2 pl-9 pr-3 cursor-pointer transition-colors ${isSelected ? "bg-[var(--brand-subtle-bg)] text-[var(--brand-subtle-fg)]" : "hover:bg-[var(--surface-muted)]"
        }`}
      onClick={() =>
        setSelection({ kind: "question", sectionId, questionId: question.questionId })
      }
    >
      <span className="text-xs text-[var(--text-muted)] w-4 shrink-0">
        {question.order}.
      </span>
      <div className="flex min-w-0 flex-1 items-center gap-1.5">
        <p className="min-w-0 flex-1 truncate text-sm text-[var(--text-primary)]">
          {question.text}
          {question.isRequired && (
            <span className="ml-0.5 text-[var(--danger-fg)]"> *</span>
          )}
        </p>
        <span className="shrink-0 rounded-full bg-[var(--surface-muted)] px-1.5 py-0.5 text-[9px] font-medium text-[var(--text-muted)] whitespace-nowrap">
          {TYPE_LABELS[question.type?.name] ?? question.type?.name}
        </span>
        {question.isSelectionCriteria && (
          <span
            className="shrink-0 rounded bg-[var(--warning-bg)] px-1.5 py-0.5 text-[9px] font-medium text-[var(--warning-fg)] whitespace-nowrap"
            title="Criterio de selección de unidades productivas"
          >
            Criterio
          </span>
        )}
        {question.isKeyQuestion && (
          <Star
            className="size-3 shrink-0 fill-[var(--warning-fg)] text-[var(--warning-fg)]"
            aria-hidden="true"
          >
            <title>Pregunta estratégica de caracterización tecnológica</title>
          </Star>
        )}
        {question.conditionQuestionId && (
          <span className="shrink-0" title="Pregunta condicional">
            <GitBranch className="size-3 text-[var(--info-fg)]" aria-hidden="true" />
          </span>
        )}
      </div>
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <button
          type="button"
          disabled={isFirst}
          onClick={(e) => {
            e.stopPropagation();
            reorderQuestion(sectionId, question.questionId, "up");
          }}
          className="rounded p-1 text-[var(--text-muted)] hover:bg-[var(--border)] disabled:opacity-30"
          title="Subir"
          aria-label="Subir pregunta"
        >
          <ChevronUp className="size-3" aria-hidden="true" />
        </button>
        <button
          type="button"
          disabled={isLast}
          onClick={(e) => {
            e.stopPropagation();
            reorderQuestion(sectionId, question.questionId, "down");
          }}
          className="rounded p-1 text-[var(--text-muted)] hover:bg-[var(--border)] disabled:opacity-30"
          title="Bajar"
          aria-label="Bajar pregunta"
        >
          <ChevronDown className="size-3" aria-hidden="true" />
        </button>
        <button
          type="button"
          disabled={duplicating}
          onClick={handleDuplicate}
          className="rounded p-1 text-[var(--text-muted)] hover:bg-[var(--border)] disabled:opacity-30"
          title="Duplicar"
          aria-label="Duplicar pregunta"
        >
          <CopyPlus className="size-3" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={handleDeleteClick}
          className="rounded p-1 text-[var(--danger-fg)] hover:bg-[var(--danger-bg)]"
          title="Eliminar"
          aria-label="Eliminar pregunta"
        >
          <Trash2 className="size-3" aria-hidden="true" />
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
