"use client";

import { useState } from "react";
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
      <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-2">
        Opciones
      </p>
      <div className="space-y-2">
        {options.map((opt) => (
          <div key={opt.optionId} className="flex items-center gap-2">
            <input
              type="text"
              defaultValue={opt.text}
              onBlur={(e) => handleTextBlur(opt, e.target.value)}
              className="flex-1 rounded-lg border border-neutral-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
            />
            {opt.isOther && (
              <span className="text-xs text-neutral-400 shrink-0">Otro</span>
            )}
            <button
              type="button"
              onClick={() =>
                removeOptionFromStore(questionId, sectionId, opt.optionId)
              }
              className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-colors shrink-0"
              title="Eliminar opción"
            >
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" />
                <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      <div className="mt-3 flex gap-2">
        <input
          type="text"
          placeholder="Texto de la nueva opción"
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          className="flex-1 rounded-lg border border-neutral-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={!newText.trim()}
          className="rounded-lg bg-green-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-800 transition-colors disabled:opacity-40"
        >
          Agregar
        </button>
      </div>

      <button
        type="button"
        onClick={handleAddOther}
        disabled={hasOtherOption}
        className="mt-2 w-full rounded-lg border border-dashed border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-600 hover:border-green-700 hover:text-green-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        title={hasOtherOption ? "Esta pregunta ya tiene una opción Otros" : undefined}
      >
        + Agregar opción &quot;Otros&quot;
      </button>
    </div>
  );
}
