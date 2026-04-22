"use client";

import { useState } from "react";
import { SectionDetail } from "@/app/(admin)/types";
import { EditorSelection, useInstrumentEditorStore } from "@/store/useInstrumentEditorStore";
import QuestionNode from "./QuestionNode";

interface SectionNodeProps {
  section: SectionDetail;
  isFirst: boolean;
  isLast: boolean;
  selection: EditorSelection;
}

export default function SectionNode({
  section,
  isFirst,
  isLast,
  selection,
}: SectionNodeProps) {
  const [expanded, setExpanded] = useState(true);
  const {
    setSelection,
    reorderSection,
    removeSectionFromStore,
  } = useInstrumentEditorStore();

  const isSelected =
    selection?.kind === "section" && selection.sectionId === section.sectionId;

  const handleAddQuestion = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelection({ kind: "new-question", sectionId: section.sectionId });
  };

  return (
    <div>
      <div
        className={`group flex items-center gap-1.5 rounded-lg px-2 py-2 cursor-pointer transition-colors ${
          isSelected ? "bg-green-50 text-green-800" : "hover:bg-neutral-50"
        }`}
        onClick={() =>
          setSelection({ kind: "section", sectionId: section.sectionId })
        }
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setExpanded((v) => !v);
          }}
          className="p-0.5 rounded hover:bg-neutral-200 shrink-0"
        >
          <svg
            className={`w-3 h-3 transition-transform ${expanded ? "rotate-90" : ""}`}
            viewBox="0 0 16 16"
            fill="currentColor"
          >
            <path d="M6 4l5 4-5 4V4z" />
          </svg>
        </button>
        <span className="flex-1 text-sm font-medium truncate">{section.name}</span>
        <span className="text-xs text-neutral-400 shrink-0">
          {section.questions.length}p
        </span>
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            type="button"
            disabled={isFirst}
            onClick={(e) => {
              e.stopPropagation();
              reorderSection(section.sectionId, "up");
            }}
            className="p-1 rounded hover:bg-neutral-200 disabled:opacity-30"
            title="Subir sección"
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
              reorderSection(section.sectionId, "down");
            }}
            className="p-1 rounded hover:bg-neutral-200 disabled:opacity-30"
            title="Bajar sección"
          >
            <svg className="w-3 h-3" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 12L3 6h10l-5 6z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              removeSectionFromStore(section.sectionId);
            }}
            className="p-1 rounded hover:bg-red-100 text-red-500"
            title="Eliminar sección"
          >
            <svg className="w-3 h-3" viewBox="0 0 16 16" fill="currentColor">
              <path d="M6 2h4a1 1 0 0 1 0 2H6a1 1 0 0 1 0-2zM3 5h10l-1 9H4L3 5zm3 2v5h1V7H6zm3 0v5h1V7H9z" />
            </svg>
          </button>
        </div>
      </div>

      {expanded && (
        <div className="ml-4 mt-0.5 space-y-0.5">
          {section.questions.map((q, qi) => (
            <QuestionNode
              key={q.questionId}
              question={q}
              sectionId={section.sectionId}
              isFirst={qi === 0}
              isLast={qi === section.questions.length - 1}
              selection={selection}
            />
          ))}
          <button
            type="button"
            onClick={handleAddQuestion}
            className="w-full text-left px-2 py-1 text-xs text-neutral-400 hover:text-green-700 hover:bg-neutral-50 rounded-lg transition-colors"
          >
            + Agregar pregunta
          </button>
        </div>
      )}
    </div>
  );
}
