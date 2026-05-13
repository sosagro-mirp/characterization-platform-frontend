"use client";

import { useState } from "react";

interface StepConditionEditorProps {
  initialQuestionId: string | null;
  initialValue: string | null;
  availableQuestions: { questionId: string; text: string }[];
  onSave: (data: {
    conditionQuestionId: string | null;
    conditionValue: string | null;
  }) => Promise<void>;
  onCancel: () => void;
}

export default function StepConditionEditor({
  initialQuestionId,
  initialValue,
  availableQuestions,
  onSave,
  onCancel,
}: StepConditionEditorProps) {
  const [qid, setQid] = useState(initialQuestionId ?? "");
  const [val, setVal] = useState(initialValue ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      if (!qid) {
        await onSave({ conditionQuestionId: null, conditionValue: null });
      } else {
        await onSave({
          conditionQuestionId: qid,
          conditionValue: val.trim() || null,
        });
      }
      onCancel();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-3 rounded-lg border border-[var(--border)] p-4 bg-[var(--surface-muted)]/40">
      <p className="text-sm font-medium text-[var(--text-primary)]">
        Condición de visibilidad
      </p>
      <div>
        <label className="block text-xs text-[var(--text-muted)] mb-1">
          Mostrar este paso solo si la respuesta a…
        </label>
        <select
          value={qid}
          onChange={(e) => setQid(e.target.value)}
          className="w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm bg-[var(--surface)]"
        >
          <option value="">Sin condición (siempre se aplica)</option>
          {availableQuestions.map((q) => (
            <option key={q.questionId} value={q.questionId}>
              {q.text.slice(0, 80)}
              {q.text.length > 80 ? "…" : ""}
            </option>
          ))}
        </select>
      </div>

      {qid && (
        <div>
          <label className="block text-xs text-[var(--text-muted)] mb-1">
            …es igual a
          </label>
          <input
            type="text"
            value={val}
            maxLength={50}
            onChange={(e) => setVal(e.target.value)}
            placeholder="optionId, valor de texto, 'true'/'false'…"
            className="w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm"
          />
        </div>
      )}

      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg bg-[var(--brand)] px-3 py-1.5 text-xs font-medium text-white hover:bg-[var(--brand-hover)] disabled:opacity-50"
        >
          {saving ? "Guardando…" : "Guardar condición"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--surface-muted)]"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
