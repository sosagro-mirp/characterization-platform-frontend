"use client";

import { Plus, Settings } from "lucide-react";
import { useInstrumentEditorStore } from "@/store/useInstrumentEditorStore";
import SectionNode from "./SectionNode";

export default function StructureTree() {
  const { sections, selection, setSelection, addSection } =
    useInstrumentEditorStore();

  const handleAddSection = () => {
    const nextOrder = sections.length + 1;
    addSection({ name: "Nueva sección", order: nextOrder });
  };

  return (
    <nav className="flex flex-col h-full">
      <div className="border-b border-[var(--border)] px-2 py-2">
        <button
          type="button"
          onClick={() => setSelection({ kind: "instrument" })}
          className={`flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-xs font-medium transition-colors ${
            selection?.kind === "instrument"
              ? "bg-[var(--brand-subtle-bg)] text-[var(--brand-subtle-fg)]"
              : "text-[var(--text-muted)] hover:bg-[var(--surface-muted)]"
          }`}
        >
          <Settings className="size-3.5 shrink-0" aria-hidden="true" />
          Configuración general
        </button>
      </div>

      <div className="scrollbar-hide flex-1 overflow-y-auto">
        {sections.map((section, si) => (
          <SectionNode
            key={section.sectionId}
            section={section}
            isFirst={si === 0}
            isLast={si === sections.length - 1}
            selection={selection}
          />
        ))}
      </div>

      <div className="px-2 py-2 border-t border-[var(--border)]">
        <button
          type="button"
          onClick={handleAddSection}
          className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-xs font-semibold text-[var(--brand)] hover:bg-[var(--brand-subtle-bg)] transition-colors"
        >
          <Plus className="size-3.5 shrink-0" aria-hidden="true" />
          Agregar sección
        </button>
      </div>
    </nav>
  );
}
