"use client";

import { useState } from "react";
import { ChevronRight, ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
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
        className={`group flex items-center gap-2 border-b border-[var(--border)] px-3 py-2.5 cursor-pointer transition-colors ${
          isSelected ? "bg-[var(--brand-subtle-bg)] text-[var(--brand-subtle-fg)]" : "hover:bg-[var(--surface-muted)]"
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
          className="shrink-0 rounded p-0.5 text-[var(--text-muted)] hover:bg-[var(--border)]"
        >
          <ChevronRight
            className={`size-3.5 transition-transform ${expanded ? "rotate-90" : ""}`}
            aria-hidden="true"
          />
        </button>
        <span className="flex-1 truncate text-sm font-medium">{section.name}</span>
        <span className="shrink-0 rounded-full border border-[var(--border)] px-1.5 py-0.5 text-[9.5px] text-[var(--text-muted)]">
          {section.questions.length}
        </span>
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            type="button"
            disabled={isFirst}
            onClick={(e) => {
              e.stopPropagation();
              reorderSection(section.sectionId, "up");
            }}
            className="rounded p-1 text-[var(--text-muted)] hover:bg-[var(--border)] disabled:opacity-30"
            title="Subir sección"
            aria-label="Subir sección"
          >
            <ChevronUp className="size-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            disabled={isLast}
            onClick={(e) => {
              e.stopPropagation();
              reorderSection(section.sectionId, "down");
            }}
            className="rounded p-1 text-[var(--text-muted)] hover:bg-[var(--border)] disabled:opacity-30"
            title="Bajar sección"
            aria-label="Bajar sección"
          >
            <ChevronDown className="size-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              removeSectionFromStore(section.sectionId);
            }}
            className="rounded p-1 text-[var(--danger-fg)] hover:bg-[var(--danger-bg)]"
            title="Eliminar sección"
            aria-label="Eliminar sección"
          >
            <Trash2 className="size-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>

      {expanded && (
        <div>
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
            className="flex w-full items-center gap-1.5 border-b border-[var(--border)] py-2 pl-9 pr-3 text-left text-xs font-medium text-[var(--brand)] hover:bg-[var(--brand-subtle-bg)] transition-colors"
          >
            <Plus className="size-3" aria-hidden="true" />
            Agregar pregunta
          </button>
        </div>
      )}
    </div>
  );
}
