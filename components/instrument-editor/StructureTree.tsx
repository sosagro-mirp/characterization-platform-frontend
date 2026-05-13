"use client";

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
      <div className="px-3 py-3 border-b border-[var(--border)]">
        <button
          type="button"
          onClick={() => setSelection({ kind: "instrument" })}
          className={`w-full text-left rounded-lg px-2 py-1.5 text-sm font-semibold transition-colors ${
            selection?.kind === "instrument"
              ? "bg-[var(--success-bg)] text-[var(--success-fg)]"
              : "text-[var(--text-primary)] hover:bg-[var(--surface-muted)]"
          }`}
        >
          Configuración general
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
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

      <div className="px-3 py-3 border-t border-[var(--border)]">
        <button
          type="button"
          onClick={handleAddSection}
          className="w-full rounded-lg border border-dashed border-[var(--border)] px-3 py-2 text-xs font-medium text-[var(--text-muted)] hover:border-green-400 hover:text-[var(--success-fg)] transition-colors"
        >
          + Agregar sección
        </button>
      </div>
    </nav>
  );
}
