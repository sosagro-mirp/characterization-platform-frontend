"use client";

import { QuestionDetail } from "@/app/(admin)/types";
import { EditorSelection, useInstrumentEditorStore } from "@/store/useInstrumentEditorStore";

const TYPE_LABELS: Record<string, string> = {
  open_text: "Texto",
  numeric: "Número",
  yes_no: "Sí/No",
  single_choice: "Única",
  "single-choice": "Única",
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
  const { setSelection, reorderQuestion, removeQuestionFromStore } =
    useInstrumentEditorStore();

  const isSelected =
    selection?.kind === "question" &&
    selection.questionId === question.questionId;

  return (
    <div
      className={`group flex items-start gap-2 rounded-lg px-2 py-1.5 cursor-pointer transition-colors ${
        isSelected ? "bg-green-50 text-green-800" : "hover:bg-neutral-50"
      }`}
      onClick={() =>
        setSelection({ kind: "question", sectionId, questionId: question.questionId })
      }
    >
      <span className="mt-0.5 text-xs text-neutral-400 w-4 shrink-0">
        {question.order}.
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm truncate text-neutral-800">{question.text}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-[10px] font-medium rounded-full bg-neutral-100 px-1.5 py-0.5 text-neutral-500">
            {TYPE_LABELS[question.type?.name] ?? question.type?.name}
          </span>
          {question.isRequired && (
            <span className="text-[10px] text-red-500 font-medium">*</span>
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
          className="p-1 rounded hover:bg-neutral-200 disabled:opacity-30"
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
          className="p-1 rounded hover:bg-neutral-200 disabled:opacity-30"
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
            removeQuestionFromStore(sectionId, question.questionId);
          }}
          className="p-1 rounded hover:bg-red-100 text-red-500"
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
