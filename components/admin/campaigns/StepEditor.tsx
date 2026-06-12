"use client";

import { useEffect, useState } from "react";
import {
  CampaignStepDetail,
  CropRef,
  InstrumentListItem,
  QuestionDetail,
  StepConditionDetail,
} from "@/app/(admin)/types";
import {
  createStep,
  deleteStep,
  updateStep,
} from "@/services/campaigns.service";
import { apiClient } from "@/lib/apiClient";
import StepConditionEditor, { QuestionGroup } from "./StepConditionEditor";

interface StepEditorProps {
  campaignId: string;
  steps: CampaignStepDetail[];
  instruments: InstrumentListItem[];
  availableCrops: CropRef[];
  onChanged: () => Promise<void>;
}

export default function StepEditor({
  campaignId,
  steps,
  instruments,
  availableCrops,
  onChanged,
}: StepEditorProps) {
  const [newInstrumentId, setNewInstrumentId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pendingStepId, setPendingStepId] = useState<string | null>(null);
  const [editingConditionStepId, setEditingConditionStepId] = useState<string | null>(null);
  const [questionsCache, setQuestionsCache] = useState<Record<string, QuestionDetail[]>>({});
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  useEffect(() => {
    const allIds = steps
      .map((s) => s.instrument.instrumentId)
      .filter((id, i, arr) => arr.indexOf(id) === i);

    const uncached = allIds.filter((id) => !(id in questionsCache));
    if (uncached.length === 0) return;

    setLoadingQuestions(true);
    Promise.all(
      uncached.map((id) =>
        apiClient
          .get<{ sections?: { questions: QuestionDetail[] }[] }>(
            `/api/instruments/${id}/render`,
            { cache: "no-store" },
          )
          .then((render) => ({
            id,
            questions: (render.sections ?? []).flatMap((s) => s.questions ?? []),
          })),
      ),
    )
      .then((results) => {
        setQuestionsCache((prev) => {
          const next = { ...prev };
          for (const { id, questions } of results) next[id] = questions;
          return next;
        });
      })
      .catch(() => {})
      .finally(() => setLoadingQuestions(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [steps]);

  function getConditionsSummary(conditions: StepConditionDetail[]): string | null {
    const sorted = [...conditions].sort((a, b) => a.order - b.order);
    if (sorted.length === 0) return null;

    const parts = sorted.map((c, idx) => {
      const prefix = idx === 0 ? "" : `${c.logicalOperator} `;
      if (c.conditionType === "crop") {
        return `${prefix}Cultiva ${c.conditionCrop?.name ?? "—"}`;
      }
      const qText = c.conditionQuestion?.text?.slice(0, 40) ?? "—";
      const val = c.conditionValue ?? "—";
      return `${prefix}${qText} = ${val}`;
    });

    return parts.join(" ");
  }

  function buildQuestionGroups(step: CampaignStepDetail): QuestionGroup[] {
    return steps
      .filter((s) => s.order < step.order)
      .map((s) => ({
        stepOrder: s.order,
        instrumentName: s.instrument.name,
        questions: (questionsCache[s.instrument.instrumentId] ?? []).map((q) => ({
          questionId: q.questionId,
          text: q.text,
          typeName: q.type?.name ?? "",
          options: (q.options ?? []).map((o) => ({
            optionId: o.optionId,
            text: o.text,
          })),
        })),
      }));
  }

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
          const conditionsSummary = getConditionsSummary(step.conditions ?? []);
          const condCount = (step.conditions ?? []).length;

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

              <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] flex-wrap">
                {condCount > 0 ? (
                  <>
                    <span className="font-medium text-[var(--text-primary)]">
                      {condCount} {condCount === 1 ? "condición" : "condiciones"}
                    </span>
                    {conditionsSummary && (
                      <span className="truncate max-w-xs" title={conditionsSummary}>
                        · {conditionsSummary}
                      </span>
                    )}
                  </>
                ) : (
                  <span>Sin condición (siempre se aplica)</span>
                )}
                <span className="text-[var(--border)]">·</span>
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
                  campaignId={campaignId}
                  stepId={step.stepId}
                  initialConditions={step.conditions ?? []}
                  questionGroups={buildQuestionGroups(step)}
                  loadingQuestions={loadingQuestions}
                  availableCrops={availableCrops}
                  onChanged={onChanged}
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
      </div>
    </div>
  );
}
