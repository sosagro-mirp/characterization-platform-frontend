"use client";

import { useState } from "react";
import { useInstrumentEditorStore } from "@/store/useInstrumentEditorStore";

const TYPE_LABELS: Record<string, string> = {
  open_text: "Texto abierto",
  numeric: "Número",
  numeric_with_unit: "Nº + unidad",
  yes_no: "Sí / No",
  single_choice: "Selección única",
  likert: "Likert",
  multiple_choice: "Selección múltiple",
  compliance: "Cumplimiento",
  image: "Imagen",
  voice_recording: "Grabación de voz",
  document: "Documento PDF",
  video: "Video",
};

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
  const [isSelectionCriteria, setIsSelectionCriteria] = useState(false);
  const [isKeyQuestion, setIsKeyQuestion] = useState(false);
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
        isSelectionCriteria,
        isKeyQuestion,
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
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)] mb-1">
          Nueva pregunta
        </p>
        <p className="text-sm text-[var(--text-muted)]">
          Sección: <span className="font-medium text-[var(--text-primary)]">{section?.name}</span>
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
          Texto de la pregunta <span className="text-[var(--danger-fg)]">*</span>
        </label>
        <textarea
          rows={3}
          maxLength={255}
          required
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escribe la pregunta aquí…"
          className="w-full rounded-md border border-[var(--border)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)] resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
          Tipo de pregunta <span className="text-[var(--danger-fg)]">*</span>
        </label>
        <select
          required
          value={typeId}
          onChange={(e) => setTypeId(e.target.value)}
          className="w-full rounded-md border border-[var(--border)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)] bg-[var(--surface)]"
        >
          <option value="">Seleccionar tipo…</option>
          {questionTypes.map((t) => (
            <option key={t.typeId} value={t.typeId}>
              {TYPE_LABELS[t.name] ?? t.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-3 rounded-md border border-[var(--border)] bg-[var(--surface-muted)] p-3.5">
        <label htmlFor="newIsRequired" className="flex items-center gap-2.5 text-sm text-[var(--text-primary)] cursor-pointer">
          <input
            type="checkbox"
            id="newIsRequired"
            checked={isRequired}
            onChange={(e) => setIsRequired(e.target.checked)}
            className="h-4 w-4 shrink-0 rounded border-[var(--border)] accent-[var(--brand)]"
          />
          Pregunta obligatoria
        </label>

        <label htmlFor="newIsSelectionCriteria" className="flex items-center gap-2.5 text-sm text-[var(--text-primary)] cursor-pointer">
          <input
            type="checkbox"
            id="newIsSelectionCriteria"
            checked={isSelectionCriteria}
            onChange={(e) => setIsSelectionCriteria(e.target.checked)}
            className="h-4 w-4 shrink-0 rounded border-[var(--border)] accent-[var(--brand)]"
          />
          Criterio de selección de unidades productivas
        </label>

        <label htmlFor="newIsKeyQuestion" className="flex items-center gap-2.5 text-sm text-[var(--text-primary)] cursor-pointer">
          <input
            type="checkbox"
            id="newIsKeyQuestion"
            checked={isKeyQuestion}
            onChange={(e) => setIsKeyQuestion(e.target.checked)}
            className="h-4 w-4 shrink-0 rounded border-[var(--border)] accent-[var(--brand)]"
          />
          Pregunta estratégica de caracterización tecnológica
        </label>
      </div>

      {error && (
        <p className="text-sm text-[var(--danger-fg)] rounded-md bg-[var(--danger-bg)] px-3 py-2">{error}</p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving || !text.trim() || !typeId}
          className="rounded-md bg-[var(--brand)] px-5 py-2 text-sm font-medium text-[var(--brand-foreground)] hover:bg-[var(--brand-hover)] transition-colors disabled:opacity-50"
        >
          {saving ? "Creando…" : "Crear pregunta"}
        </button>
        <button
          type="button"
          onClick={() => setSelection({ kind: "section", sectionId })}
          className="rounded-md border border-[var(--border)] px-5 py-2 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--surface-muted)] transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
