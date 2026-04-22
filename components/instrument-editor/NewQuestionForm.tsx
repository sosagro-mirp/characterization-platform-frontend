"use client";

import { useState } from "react";
import { useInstrumentEditorStore } from "@/store/useInstrumentEditorStore";

interface NewQuestionFormProps {
  sectionId: string;
}

export default function NewQuestionForm({ sectionId }: NewQuestionFormProps) {
  const { questionTypes, sections, addQuestion, setSelection } =
    useInstrumentEditorStore();

  const section = sections.find((s) => s.sectionId === sectionId);
  const [text, setText] = useState("");
  const [typeId, setTypeId] = useState(questionTypes[0]?.typeId ?? "");
  const [isRequired, setIsRequired] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !typeId) return;
    setSaving(true);
    setError(undefined);
    try {
      const nextOrder = (section?.questions.length ?? 0) + 1;
      await addQuestion(sectionId, {
        text: text.trim(),
        typeId,
        isRequired,
        order: nextOrder,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear la pregunta");
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400 mb-1">
          Nueva pregunta
        </p>
        <p className="text-sm text-neutral-500">
          Sección: <span className="font-medium text-neutral-700">{section?.name}</span>
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          Texto de la pregunta <span className="text-red-500">*</span>
        </label>
        <textarea
          rows={3}
          maxLength={255}
          required
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escribe la pregunta aquí…"
          className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          Tipo de pregunta <span className="text-red-500">*</span>
        </label>
        <select
          required
          value={typeId}
          onChange={(e) => setTypeId(e.target.value)}
          className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 bg-white"
        >
          <option value="">Seleccionar tipo…</option>
          {questionTypes.map((t) => (
            <option key={t.typeId} value={t.typeId}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="newIsRequired"
          checked={isRequired}
          onChange={(e) => setIsRequired(e.target.checked)}
          className="h-4 w-4 rounded border-neutral-300 accent-green-700"
        />
        <label htmlFor="newIsRequired" className="text-sm text-neutral-700">
          Pregunta obligatoria
        </label>
      </div>

      {error && (
        <p className="text-sm text-red-600 rounded-lg bg-red-50 px-3 py-2">{error}</p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving || !text.trim() || !typeId}
          className="rounded-xl bg-green-700 px-5 py-2 text-sm font-medium text-white hover:bg-green-800 transition-colors disabled:opacity-50"
        >
          {saving ? "Creando…" : "Crear pregunta"}
        </button>
        <button
          type="button"
          onClick={() => setSelection({ kind: "section", sectionId })}
          className="rounded-xl border border-neutral-200 px-5 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
