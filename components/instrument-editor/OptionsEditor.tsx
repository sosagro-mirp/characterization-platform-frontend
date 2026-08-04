"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { OptionDetail } from "@/app/(admin)/types";
import { useInstrumentEditorStore } from "@/store/useInstrumentEditorStore";

interface OptionsEditorProps {
  questionId: string;
  sectionId: string;
  options: OptionDetail[];
}

export default function OptionsEditor({
  questionId,
  sectionId,
  options,
}: OptionsEditorProps) {
  const { addOptions, updateOptionInStore, removeOptionFromStore } =
    useInstrumentEditorStore();
  const [newText, setNewText] = useState("");

  const hasOtherOption = options.some((o) => o.isOther);

  const handleAdd = async () => {
    const text = newText.trim();
    if (!text) return;
    await addOptions(questionId, sectionId, [{ text }]);
    setNewText("");
  };

  const handleAddOther = async () => {
    if (hasOtherOption) return;
    await addOptions(questionId, sectionId, [
      { text: "Otros", isOther: true },
    ]);
  };

  const handleTextBlur = async (option: OptionDetail, value: string) => {
    if (value.trim() === option.text) return;
    await updateOptionInStore(questionId, sectionId, option.optionId, {
      text: value.trim(),
    });
  };

  return (
    <div className="mt-4">
      <div className="mb-2.5 flex items-center justify-between">
        <p className="text-xs text-[var(--text-muted)]">Opciones de respuesta</p>
        <span className="text-[10.5px] text-[var(--text-muted)]">
          {options.length} opci{options.length === 1 ? "ón" : "ones"}
        </span>
      </div>
      <div className="overflow-hidden rounded-md border border-[var(--border)]">
        {options.map((opt, idx) => (
          <div
            key={opt.optionId}
            className="flex items-center gap-2.5 border-b border-[var(--border)] px-3 py-2"
          >
            <span className="w-3.5 shrink-0 text-[10.5px] text-[var(--text-muted)]">
              {idx + 1}
            </span>
            <input
              type="text"
              defaultValue={opt.text}
              onBlur={(e) => handleTextBlur(opt, e.target.value)}
              className="flex-1 border-none bg-transparent text-sm text-[var(--text-primary)] outline-none"
            />
            {opt.isOther && (
              <span className="shrink-0 rounded bg-[var(--info-bg)] px-1.5 py-0.5 text-[9px] text-[var(--info-fg)] whitespace-nowrap">
                Otro (texto libre)
              </span>
            )}
            <button
              type="button"
              onClick={() =>
                removeOptionFromStore(questionId, sectionId, opt.optionId)
              }
              className="shrink-0 rounded p-1 text-[var(--text-muted)] hover:bg-[var(--danger-bg)] hover:text-[var(--danger-fg)] transition-colors"
              title="Eliminar opción"
              aria-label="Eliminar opción"
            >
              <Trash2 className="size-3.5" aria-hidden="true" />
            </button>
          </div>
        ))}
        <div className="flex items-center gap-2.5 bg-[var(--surface-muted)] px-3 py-2">
          <input
            type="text"
            placeholder="Texto de la nueva opción"
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            className="flex-1 border-none bg-transparent text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
          />
          <button
            type="button"
            onClick={handleAdd}
            disabled={!newText.trim()}
            className="shrink-0 rounded-md bg-[var(--brand)] px-3 py-1 text-xs font-semibold text-[var(--brand-foreground)] hover:bg-[var(--brand-hover)] transition-colors disabled:opacity-40"
          >
            Agregar
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={handleAddOther}
        disabled={hasOtherOption}
        className="mt-2 flex w-full items-center gap-1.5 rounded-md border border-dashed border-[var(--border-strong)] px-3 py-2 text-xs font-medium text-[var(--brand)] hover:bg-[var(--brand-subtle-bg)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        title={hasOtherOption ? "Esta pregunta ya tiene una opción Otros" : undefined}
      >
        <Plus className="size-3.5 shrink-0" aria-hidden="true" />
        Agregar opción &quot;Otros&quot;
      </button>
    </div>
  );
}
