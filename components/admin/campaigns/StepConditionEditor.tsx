"use client";

import { useState } from "react";
import { CropRef, StepConditionDetail } from "@/app/(admin)/types";
import {
  createStepCondition,
  deleteStepCondition,
  updateStepCondition,
} from "@/services/campaigns.service";
import StepConditionRow from "./StepConditionRow";

export interface QuestionGroup {
  stepOrder: number;
  instrumentName: string;
  questions: {
    questionId: string;
    text: string;
    typeName: string;
    options: { optionId: string; text: string }[];
  }[];
}

interface StepConditionEditorProps {
  campaignId: string;
  stepId: string;
  initialConditions: StepConditionDetail[];
  questionGroups: QuestionGroup[];
  loadingQuestions?: boolean;
  availableCrops: CropRef[];
  onChanged: () => Promise<void>;
}

export default function StepConditionEditor({
  campaignId,
  stepId,
  initialConditions,
  questionGroups,
  loadingQuestions = false,
  availableCrops,
  onChanged,
}: StepConditionEditorProps) {
  const [showNewRow, setShowNewRow] = useState(false);

  const sorted = [...initialConditions].sort((a, b) => a.order - b.order);

  if (loadingQuestions) {
    return (
      <p className="text-xs text-[var(--text-muted)] italic py-2">
        Cargando preguntas de pasos anteriores…
      </p>
    );
  }

  return (
    <div className="space-y-2 border-t border-[var(--border)] pt-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
        Condiciones de visibilidad
      </p>

      {sorted.map((cond, idx) => (
        <StepConditionRow
          key={cond.conditionId}
          condition={cond}
          isFirst={idx === 0}
          questionGroups={questionGroups}
          availableCrops={availableCrops}
          onSave={async (data) => {
            await updateStepCondition(campaignId, stepId, cond.conditionId, data);
            await onChanged();
          }}
          onRemove={async () => {
            await deleteStepCondition(campaignId, stepId, cond.conditionId);
            await onChanged();
          }}
        />
      ))}

      {showNewRow && (
        <StepConditionRow
          condition={null}
          isFirst={sorted.length === 0}
          questionGroups={questionGroups}
          availableCrops={availableCrops}
          onSave={async (data) => {
            await createStepCondition(campaignId, stepId, {
              order: sorted.length + 1,
              ...data,
            });
            setShowNewRow(false);
            await onChanged();
          }}
          onRemove={async () => {
            setShowNewRow(false);
          }}
        />
      )}

      {!showNewRow && (
        <button
          type="button"
          onClick={() => setShowNewRow(true)}
          className="w-full rounded-md border border-dashed border-[var(--border-strong)] px-3 py-2 text-xs font-medium text-[var(--brand)] hover:bg-[var(--brand-subtle-bg)] transition-colors"
        >
          + Agregar condición
        </button>
      )}
    </div>
  );
}
