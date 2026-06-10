"use client";

import { useEffect, useState } from "react";

interface AvailableQuestion {
  questionId: string;
  text: string;
  typeName: string;
  options: { optionId: string; text: string }[];
}

export interface QuestionGroup {
  stepOrder: number;
  instrumentName: string;
  questions: AvailableQuestion[];
}

interface StepConditionEditorProps {
  initialQuestionId: string | null;
  initialValue: string | null;
  questionGroups: QuestionGroup[];
  loadingQuestions?: boolean;
  onSave: (data: {
    conditionQuestionId: string | null;
    conditionValue: string | null;
  }) => Promise<void>;
  onCancel: () => void;
}

export default function StepConditionEditor({
  initialQuestionId,
  initialValue,
  questionGroups,
  loadingQuestions = false,
  onSave,
  onCancel,
}: StepConditionEditorProps) {
  const [qid, setQid] = useState(initialQuestionId ?? "");
  const [val, setVal] = useState(initialValue ?? "");
  const [saving, setSaving] = useState(false);

  const allQuestions = questionGroups.flatMap((g) => g.questions);

  useEffect(() => {
    if (qid !== initialQuestionId) setVal("");
  }, [qid, initialQuestionId]);

  const selectedQuestion = allQuestions.find((q) => q.questionId === qid);
  const typeName = selectedQuestion?.typeName ?? "";
  const hasOptions = ["single_choice", "likert", "compliance"].includes(typeName);

  async function handleSave() {
    setSaving(true);
    try {
      await onSave({
        conditionQuestionId: qid || null,
        conditionValue: qid && val ? val : null,
      });
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
        {loadingQuestions ? (
          <p className="text-xs text-[var(--text-muted)] italic py-2">
            Cargando preguntas de pasos anteriores…
          </p>
        ) : (
          <select
            value={qid}
            onChange={(e) => setQid(e.target.value)}
            className="w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm bg-[var(--surface)]"
          >
            <option value="">Sin condición (siempre se aplica)</option>
            {questionGroups.map((group) =>
              group.questions.length > 0 ? (
                <optgroup
                  key={`${group.stepOrder}-${group.instrumentName}`}
                  label={`Paso ${group.stepOrder} · ${group.instrumentName}`}
                >
                  {group.questions.map((q) => (
                    <option key={q.questionId} value={q.questionId}>
                      {q.text.slice(0, 80)}{q.text.length > 80 ? "…" : ""}
                    </option>
                  ))}
                </optgroup>
              ) : null
            )}
          </select>
        )}
        {!loadingQuestions && allQuestions.length === 0 && (
          <p className="mt-1 text-xs text-[var(--text-muted)] italic">
            No hay pasos anteriores con preguntas disponibles.
          </p>
        )}
      </div>

      {qid && (
        <div>
          <label className="block text-xs text-[var(--text-muted)] mb-1">
            …es igual a
          </label>

          {typeName === "yes_no" ? (
            <select
              value={val}
              onChange={(e) => setVal(e.target.value)}
              className="w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm bg-[var(--surface)]"
            >
              <option value="">Seleccionar…</option>
              <option value="true">Sí</option>
              <option value="false">No</option>
            </select>
          ) : hasOptions ? (
            <select
              value={val}
              onChange={(e) => setVal(e.target.value)}
              className="w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm bg-[var(--surface)]"
            >
              <option value="">Seleccionar opción…</option>
              {(selectedQuestion?.options ?? []).map((opt) => (
                <option key={opt.optionId} value={opt.optionId}>
                  {opt.text}
                </option>
              ))}
            </select>
          ) : (
            <input
              type={typeName === "numeric" ? "number" : "text"}
              value={val}
              maxLength={50}
              onChange={(e) => setVal(e.target.value)}
              placeholder={
                typeName === "numeric" ? "Ej: 3" : "Valor de texto esperado"
              }
              className="w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm"
            />
          )}
        </div>
      )}

      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || loadingQuestions}
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
