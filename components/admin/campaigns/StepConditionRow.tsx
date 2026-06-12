"use client";

import { useState } from "react";
import {
  ConditionType,
  CropRef,
  LogicalOperator,
  StepConditionDetail,
} from "@/app/(admin)/types";
import { QuestionGroup } from "./StepConditionEditor";

interface StepConditionRowProps {
  condition: StepConditionDetail | null;
  isFirst: boolean;
  questionGroups: QuestionGroup[];
  availableCrops: CropRef[];
  onSave: (data: {
    logicalOperator?: LogicalOperator;
    conditionType: ConditionType;
    conditionQuestionId?: string;
    conditionValue?: string;
    conditionCropId?: string;
  }) => Promise<void>;
  onRemove: () => Promise<void>;
}

export default function StepConditionRow({
  condition,
  isFirst,
  questionGroups,
  availableCrops,
  onSave,
  onRemove,
}: StepConditionRowProps) {
  const [logicalOperator, setLogicalOperator] = useState<LogicalOperator>(
    condition?.logicalOperator ?? "AND",
  );
  const [conditionType, setConditionType] = useState<ConditionType>(
    condition?.conditionType ?? "question",
  );
  const [questionId, setQuestionId] = useState(
    condition?.conditionQuestion?.questionId ?? "",
  );
  const [conditionValue, setConditionValue] = useState(
    condition?.conditionValue ?? "",
  );
  const [cropId, setCropId] = useState(
    condition?.conditionCrop?.cropId ?? "",
  );
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  function showToast(message: string, type: "success" | "error") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2500);
  }

  const allQuestions = questionGroups.flatMap((g) => g.questions);
  const selectedQuestion = allQuestions.find((q) => q.questionId === questionId);
  const typeName = selectedQuestion?.typeName ?? "";
  const hasOptions = ["single_choice", "likert", "compliance"].includes(typeName);

  async function handleSave() {
    setSaving(true);
    try {
      await onSave({
        ...(!isFirst && { logicalOperator }),
        conditionType,
        ...(conditionType === "question" && {
          conditionQuestionId: questionId || undefined,
          conditionValue: conditionValue || undefined,
        }),
        ...(conditionType === "crop" && {
          conditionCropId: cropId || undefined,
        }),
      });
      showToast("Condición guardada", "success");
    } catch {
      showToast("Error al guardar la condición", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove() {
    setRemoving(true);
    try {
      await onRemove();
      showToast("Condición eliminada", "success");
    } catch {
      showToast("Error al eliminar la condición", "error");
    } finally {
      setRemoving(false);
    }
  }

  return (
    <div className="rounded-lg border border-[var(--border)] p-3 bg-[var(--surface-muted)]/30 space-y-3">
      {!isFirst && (
        <div>
          <label className="block text-xs text-[var(--text-muted)] mb-1">
            Operador lógico
          </label>
          <select
            value={logicalOperator}
            onChange={(e) => setLogicalOperator(e.target.value as LogicalOperator)}
            className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-sm bg-[var(--surface)]"
          >
            <option value="AND">AND</option>
            <option value="OR">OR</option>
          </select>
        </div>
      )}

      <div>
        <label className="block text-xs text-[var(--text-muted)] mb-1">
          Tipo de condición
        </label>
        <select
          value={conditionType}
          onChange={(e) => setConditionType(e.target.value as ConditionType)}
          className="w-full rounded-lg border border-[var(--border)] px-3 py-1.5 text-sm bg-[var(--surface)]"
        >
          <option value="question">Respuesta a pregunta</option>
          <option value="crop">Tipo de cultivo</option>
        </select>
      </div>

      {conditionType === "question" && (
        <>
          <div>
            <label className="block text-xs text-[var(--text-muted)] mb-1">
              Pregunta
            </label>
            <select
              value={questionId}
              onChange={(e) => { setQuestionId(e.target.value); setConditionValue(""); }}
              className="w-full rounded-lg border border-[var(--border)] px-3 py-1.5 text-sm bg-[var(--surface)]"
            >
              <option value="">Seleccionar pregunta…</option>
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
                ) : null,
              )}
            </select>
          </div>

          {questionId && (
            <div>
              <label className="block text-xs text-[var(--text-muted)] mb-1">
                Valor esperado
              </label>
              {typeName === "yes_no" ? (
                <select
                  value={conditionValue}
                  onChange={(e) => setConditionValue(e.target.value)}
                  className="w-full rounded-lg border border-[var(--border)] px-3 py-1.5 text-sm bg-[var(--surface)]"
                >
                  <option value="">Seleccionar…</option>
                  <option value="true">Sí</option>
                  <option value="false">No</option>
                </select>
              ) : hasOptions ? (
                <select
                  value={conditionValue}
                  onChange={(e) => setConditionValue(e.target.value)}
                  className="w-full rounded-lg border border-[var(--border)] px-3 py-1.5 text-sm bg-[var(--surface)]"
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
                  value={conditionValue}
                  maxLength={50}
                  onChange={(e) => setConditionValue(e.target.value)}
                  placeholder={typeName === "numeric" ? "Ej: 3" : "Valor esperado"}
                  className="w-full rounded-lg border border-[var(--border)] px-3 py-1.5 text-sm"
                />
              )}
            </div>
          )}
        </>
      )}

      {conditionType === "crop" && (
        <div>
          <label className="block text-xs text-[var(--text-muted)] mb-1">
            Cultivo
          </label>
          <select
            value={cropId}
            onChange={(e) => setCropId(e.target.value)}
            className="w-full rounded-lg border border-[var(--border)] px-3 py-1.5 text-sm bg-[var(--surface)]"
          >
            <option value="">Seleccionar cultivo…</option>
            {availableCrops.map((c) => (
              <option key={c.cropId} value={c.cropId}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex items-center gap-3 pt-1">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || removing}
          className="rounded-lg bg-[var(--brand)] px-3 py-1.5 text-xs font-medium text-white hover:bg-[var(--brand-hover)] disabled:opacity-50"
        >
          {saving ? "Guardando…" : "Guardar"}
        </button>
        <button
          type="button"
          onClick={handleRemove}
          disabled={saving || removing}
          className="rounded-lg border border-[var(--danger-fg)]/40 px-3 py-1.5 text-xs font-medium text-[var(--danger-fg)] hover:bg-[var(--danger-bg)] disabled:opacity-50"
        >
          {removing ? "Eliminando…" : "Eliminar"}
        </button>
        {toast && (
          <span
            className={`text-xs font-medium ${
              toast.type === "success"
                ? "text-[var(--success-fg,#16a34a)]"
                : "text-[var(--danger-fg)]"
            }`}
          >
            {toast.message}
          </span>
        )}
      </div>
    </div>
  );
}
