"use client";

import { useState } from "react";
import {
  CampaignStepDetail,
} from "@/app/(admin)/types";
import { InstrumentListItem } from "@/app/(admin)/types";
import {
  createStep,
  deleteStep,
  updateStep,
} from "@/services/campaigns.service";
import StepConditionEditor from "./StepConditionEditor";

interface StepEditorProps {
  campaignId: string;
  steps: CampaignStepDetail[];
  instruments: InstrumentListItem[];
  onChanged: () => Promise<void>;
}

export default function StepEditor({
  campaignId,
  steps,
  instruments,
  onChanged,
}: StepEditorProps) {
  const [newInstrumentId, setNewInstrumentId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pendingStepId, setPendingStepId] = useState<string | null>(null);
  const [editingConditionStepId, setEditingConditionStepId] = useState<string | null>(null);

  async function handleAdd() {
    if (!newInstrumentId) return;
    setError(null);
    try {
      await createStep(campaignId, {
        instrumentId: newInstrumentId,
        order: steps.length + 1,
      });
      setNewInstrumentId("");
      await onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear paso.");
    }
  }

  async function handleMove(stepId: string, direction: "up" | "down") {
    const step = steps.find((s) => s.stepId === stepId);
    if (!step) return;
    const newOrder = direction === "up" ? step.order - 1 : step.order + 1;
    if (newOrder < 1 || newOrder > steps.length) return;
    setPendingStepId(stepId);
    try {
      await updateStep(campaignId, stepId, { order: newOrder });
      await onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al mover paso.");
    } finally {
      setPendingStepId(null);
    }
  }

  async function handleRemove(stepId: string) {
    if (!confirm("¿Eliminar este paso de la campaña?")) return;
    setPendingStepId(stepId);
    try {
      await deleteStep(campaignId, stepId);
      await onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar paso.");
    } finally {
      setPendingStepId(null);
    }
  }

  async function handleChangeInstrument(stepId: string, instrumentId: string) {
    setPendingStepId(stepId);
    try {
      await updateStep(campaignId, stepId, { instrumentId });
      await onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cambiar instrumento.");
    } finally {
      setPendingStepId(null);
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-[var(--text-primary)]">
        Pasos
      </h2>

      {error && (
        <p className="text-sm text-[var(--danger-fg)] rounded-lg bg-[var(--danger-bg)] px-3 py-2">
          {error}
        </p>
      )}

      <ul className="space-y-3">
        {steps.map((step, idx) => {
          const previousQuestions = steps
            .filter((s) => s.order < step.order)
            .flatMap(() => []); // El render no trae las questions detalladas; se rellena vacío.
          // (Mejora futura: cargar render de cada instrumento previo para listar sus preguntas.)
          void previousQuestions;

          return (
            <li
              key={step.stepId}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 space-y-3"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-[var(--text-muted)] w-6">
                    #{step.order}
                  </span>
                  <select
                    value={step.instrument.instrumentId}
                    disabled={pendingStepId === step.stepId}
                    onChange={(e) =>
                      handleChangeInstrument(step.stepId, e.target.value)
                    }
                    className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-sm bg-[var(--surface)]"
                  >
                    {instruments.map((inst) => (
                      <option key={inst.instrumentId} value={inst.instrumentId}>
                        {inst.name} (v{inst.version})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="inline-flex gap-1">
                  <button
                    type="button"
                    disabled={idx === 0 || pendingStepId === step.stepId}
                    onClick={() => handleMove(step.stepId, "up")}
                    className="rounded-lg border border-[var(--border)] px-2 py-1 text-xs disabled:opacity-30"
                    title="Subir"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    disabled={idx === steps.length - 1 || pendingStepId === step.stepId}
                    onClick={() => handleMove(step.stepId, "down")}
                    className="rounded-lg border border-[var(--border)] px-2 py-1 text-xs disabled:opacity-30"
                    title="Bajar"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    disabled={pendingStepId === step.stepId}
                    onClick={() => handleRemove(step.stepId)}
                    className="rounded-lg border border-[var(--danger-fg)]/40 px-2 py-1 text-xs text-[var(--danger-fg)] hover:bg-[var(--danger-bg)] disabled:opacity-50"
                  >
                    Eliminar
                  </button>
                </div>
              </div>

              <div className="text-xs text-[var(--text-muted)]">
                {step.conditionQuestion ? (
                  <span>
                    Condición: respuesta a “{step.conditionQuestion.text.slice(0, 60)}
                    {step.conditionQuestion.text.length > 60 ? "…" : ""}” ={" "}
                    <code>{step.conditionValue ?? "—"}</code>
                  </span>
                ) : (
                  <span>Sin condición (siempre se aplica)</span>
                )}
                {" · "}
                <button
                  type="button"
                  onClick={() =>
                    setEditingConditionStepId(
                      editingConditionStepId === step.stepId ? null : step.stepId,
                    )
                  }
                  className="text-[var(--brand)] underline"
                >
                  {editingConditionStepId === step.stepId ? "Cerrar" : "Configurar"}
                </button>
              </div>

              {editingConditionStepId === step.stepId && (
                <StepConditionEditor
                  initialQuestionId={step.conditionQuestion?.questionId ?? null}
                  initialValue={step.conditionValue}
                  availableQuestions={[]}
                  onSave={async ({ conditionQuestionId, conditionValue }) => {
                    await updateStep(campaignId, step.stepId, {
                      conditionQuestionId,
                      conditionValue,
                    });
                    await onChanged();
                  }}
                  onCancel={() => setEditingConditionStepId(null)}
                />
              )}
            </li>
          );
        })}
      </ul>

      <div className="rounded-xl border border-dashed border-[var(--border)] p-4 space-y-3">
        <p className="text-sm font-medium text-[var(--text-primary)]">
          Agregar paso
        </p>
        <div className="flex gap-2">
          <select
            value={newInstrumentId}
            onChange={(e) => setNewInstrumentId(e.target.value)}
            className="flex-1 rounded-lg border border-[var(--border)] px-3 py-2 text-sm bg-[var(--surface)]"
          >
            <option value="">Seleccionar instrumento…</option>
            {instruments.map((inst) => (
              <option key={inst.instrumentId} value={inst.instrumentId}>
                {inst.name} (v{inst.version})
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={!newInstrumentId}
            onClick={handleAdd}
            className="rounded-xl bg-[var(--brand)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--brand-hover)] disabled:opacity-50"
          >
            Agregar
          </button>
        </div>
        <p className="text-xs text-[var(--text-muted)]">
          Nota: el selector de pregunta para condicionar un paso muestra el
          listado de preguntas de pasos previos. En esta versión se ingresa el
          UUID/valor de condición directamente; la integración del catálogo
          completo de preguntas por paso queda como mejora menor.
        </p>
      </div>
    </div>
  );
}
