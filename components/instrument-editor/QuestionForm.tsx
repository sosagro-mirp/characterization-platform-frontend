"use client";

import { useState } from "react";
import { GitBranch } from "lucide-react";
import { QuestionDetail, TypeOfQuestionSummary } from "@/app/(admin)/types";
import { useInstrumentEditorStore } from "@/store/useInstrumentEditorStore";
import OptionsEditor from "./OptionsEditor";
import ConfirmDialog from "./ConfirmDialog";

const TYPES_WITH_OPTIONS = ["single_choice", "likert", "multiple_choice", "numeric_with_unit"];

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

interface QuestionFormProps {
  question: QuestionDetail;
  sectionId: string;
  questionTypes: TypeOfQuestionSummary[];
}

export default function QuestionForm({
  question,
  sectionId,
  questionTypes,
}: QuestionFormProps) {
  const { sections, updateQuestionInStore } = useInstrumentEditorStore();

  const [text, setText] = useState(question.text);
  const [typeId, setTypeId] = useState(question.type?.typeId ?? "");
  const [isRequired, setIsRequired] = useState(question.isRequired);
  const [isSelectionCriteria, setIsSelectionCriteria] = useState(
    question.isSelectionCriteria
  );
  const [isKeyQuestion, setIsKeyQuestion] = useState(question.isKeyQuestion);
  const [conditionQuestionId, setConditionQuestionId] = useState<string>(
    question.conditionQuestionId ?? ""
  );
  const [conditionValue, setConditionValue] = useState(
    question.conditionValue ?? ""
  );
  const [showTypeWarning, setShowTypeWarning] = useState(false);
  const [pendingTypeId, setPendingTypeId] = useState<string | null>(null);

  const orderedQuestions = [...sections]
    .sort((a, b) => a.order - b.order)
    .flatMap((s) => [...s.questions].sort((a, b) => a.order - b.order));
  const currentIdx = orderedQuestions.findIndex(
    (q) => q.questionId === question.questionId
  );
  const precedingQuestions = currentIdx > 0 ? orderedQuestions.slice(0, currentIdx) : [];

  const conditionQuestion = precedingQuestions.find(
    (q) => q.questionId === conditionQuestionId
  );
  const conditionTypeName = conditionQuestion?.type?.name ?? "";

  const currentTypeName =
    questionTypes.find((t) => t.typeId === typeId)?.name ?? "";
  const showOptions = TYPES_WITH_OPTIONS.includes(currentTypeName);

  const handleTypeChange = (newTypeId: string) => {
    const newTypeName = questionTypes.find((t) => t.typeId === newTypeId)?.name ?? "";
    const newHasOptions = TYPES_WITH_OPTIONS.includes(newTypeName);
    const currentHasOptions = TYPES_WITH_OPTIONS.includes(currentTypeName);

    if (currentHasOptions && !newHasOptions && question.options.length > 0) {
      setPendingTypeId(newTypeId);
      setShowTypeWarning(true);
    } else {
      applyTypeChange(newTypeId);
    }
  };

  const applyTypeChange = async (newTypeId: string) => {
    setTypeId(newTypeId);
    await updateQuestionInStore(sectionId, question.questionId, {
      typeId: newTypeId,
    });
  };

  const handleBlurText = async () => {
    if (text.trim() === question.text) return;
    await updateQuestionInStore(sectionId, question.questionId, {
      text: text.trim(),
    });
  };

  const handleRequiredChange = async (checked: boolean) => {
    setIsRequired(checked);
    await updateQuestionInStore(sectionId, question.questionId, {
      isRequired: checked,
    });
  };

  const handleSelectionCriteriaChange = async (checked: boolean) => {
    setIsSelectionCriteria(checked);
    await updateQuestionInStore(sectionId, question.questionId, {
      isSelectionCriteria: checked,
    });
  };

  const handleKeyQuestionChange = async (checked: boolean) => {
    setIsKeyQuestion(checked);
    await updateQuestionInStore(sectionId, question.questionId, {
      isKeyQuestion: checked,
    });
  };

  const saveCondition = async (newQuestionId: string, newValue: string) => {
    await updateQuestionInStore(sectionId, question.questionId, {
      conditionQuestionId: newQuestionId || null,
      conditionValue: newQuestionId ? newValue || null : null,
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)] mb-1">
            Pregunta
          </p>
          <h2 className="text-base font-semibold text-[var(--text-primary)] truncate">
            {question.text}
          </h2>
        </div>
        <span className="shrink-0 text-[10.5px] text-[var(--text-muted)] whitespace-nowrap">
          Los cambios se guardan solos
        </span>
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
          Texto de la pregunta
        </label>
        <textarea
          rows={3}
          maxLength={255}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={handleBlurText}
          className="w-full rounded-md border border-[var(--border)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)] resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
          Tipo de pregunta
        </label>
        <select
          value={typeId}
          onChange={(e) => handleTypeChange(e.target.value)}
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
        <label htmlFor="isRequired" className="flex items-start gap-2.5 text-sm text-[var(--text-primary)] cursor-pointer">
          <input
            type="checkbox"
            id="isRequired"
            checked={isRequired}
            onChange={(e) => handleRequiredChange(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-[var(--border)] accent-[var(--brand)]"
          />
          <span>
            Pregunta obligatoria
            <span className="mt-0.5 block text-[10.5px] text-[var(--text-muted)]">
              No se puede continuar sin responderla.
            </span>
          </span>
        </label>

        <label htmlFor="isSelectionCriteria" className="flex items-start gap-2.5 text-sm text-[var(--text-primary)] cursor-pointer">
          <input
            type="checkbox"
            id="isSelectionCriteria"
            checked={isSelectionCriteria}
            onChange={(e) => handleSelectionCriteriaChange(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-[var(--border)] accent-[var(--brand)]"
          />
          <span>
            Criterio de selección de unidades productivas
            <span className="mt-0.5 block text-[10.5px] text-[var(--text-muted)]">
              Su respuesta define qué unidad productiva se está caracterizando.
            </span>
          </span>
        </label>

        <label htmlFor="isKeyQuestion" className="flex items-start gap-2.5 text-sm text-[var(--text-primary)] cursor-pointer">
          <input
            type="checkbox"
            id="isKeyQuestion"
            checked={isKeyQuestion}
            onChange={(e) => handleKeyQuestionChange(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-[var(--border)] accent-[var(--brand)]"
          />
          <span>
            Pregunta estratégica de caracterización tecnológica
            <span className="mt-0.5 block text-[10.5px] text-[var(--text-muted)]">
              Se incluye en los indicadores agregados del proyecto.
            </span>
          </span>
        </label>
      </div>

      {precedingQuestions.length > 0 && (
        <div className="overflow-hidden rounded-md border border-[var(--info-fg)]/40">
          <div className="flex items-center gap-2 border-b border-[var(--info-fg)]/40 bg-[var(--info-bg)] px-3.5 py-2.5">
            <GitBranch className="size-3.5 shrink-0 text-[var(--info-fg)]" aria-hidden="true" />
            <span className="text-xs font-semibold text-[var(--info-fg)]">
              Visibilidad condicional
            </span>
          </div>
          <div className="space-y-3 p-3.5">
          <div>
            <label className="block text-xs text-[var(--text-muted)] mb-1">
              Mostrar solo si la respuesta a…
            </label>
            <select
              value={conditionQuestionId}
              onChange={(e) => {
                const newId = e.target.value;
                setConditionQuestionId(newId);
                setConditionValue("");
                saveCondition(newId, "");
              }}
              className="w-full rounded-md border border-[var(--border)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)] bg-[var(--surface)]"
            >
              <option value="">Siempre visible</option>
              {precedingQuestions.map((q) => (
                <option key={q.questionId} value={q.questionId}>
                  {q.order}. {q.text.slice(0, 60)}
                  {q.text.length > 60 ? "…" : ""}
                </option>
              ))}
            </select>
          </div>
          {conditionQuestionId && (
            <div>
              <label className="block text-xs text-[var(--text-muted)] mb-1">
                …es igual a (valor de condición)
              </label>

              {conditionTypeName === "yes_no" && (
                <div className="flex gap-3">
                  {[
                    { label: "Sí", value: "true" },
                    { label: "No", value: "false" },
                  ].map((opt) => (
                    <label key={opt.value} className="flex items-center gap-1.5 text-sm cursor-pointer">
                      <input
                        type="radio"
                        name={`condition-yesno-${question.questionId}`}
                        value={opt.value}
                        checked={conditionValue === opt.value}
                        onChange={() => {
                          setConditionValue(opt.value);
                          saveCondition(conditionQuestionId, opt.value);
                        }}
                        className="accent-[var(--brand)]"
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
              )}

              {["single_choice", "likert", "compliance"].includes(conditionTypeName) && (
                <select
                  value={conditionValue}
                  onChange={(e) => {
                    const newVal = e.target.value;
                    setConditionValue(newVal);
                    saveCondition(conditionQuestionId, newVal);
                  }}
                  className="w-full rounded-md border border-[var(--border)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)] bg-[var(--surface)]"
                >
                  <option value="">Seleccionar opción…</option>
                  {conditionQuestion?.options.map((opt) => (
                    <option key={opt.optionId} value={opt.optionId}>
                      {opt.text}
                    </option>
                  ))}
                </select>
              )}

              {conditionTypeName === "numeric" && (
                <input
                  type="number"
                  value={conditionValue}
                  onChange={(e) => setConditionValue(e.target.value)}
                  onBlur={(e) => saveCondition(conditionQuestionId, e.target.value)}
                  className="w-full rounded-md border border-[var(--border)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
                />
              )}

              {(conditionTypeName === "open_text" || conditionTypeName === "") && (
                <input
                  type="text"
                  maxLength={50}
                  value={conditionValue}
                  onChange={(e) => setConditionValue(e.target.value)}
                  onBlur={(e) => saveCondition(conditionQuestionId, e.target.value)}
                  placeholder="Valor esperado…"
                  className="w-full rounded-md border border-[var(--border)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
                />
              )}
            </div>
          )}
          </div>
        </div>
      )}

      {showOptions && (
        <OptionsEditor
          questionId={question.questionId}
          sectionId={sectionId}
          options={question.options}
        />
      )}

      <ConfirmDialog
        open={showTypeWarning}
        title="Cambiar tipo de pregunta"
        description="Al cambiar el tipo a uno que no usa opciones, las opciones existentes serán eliminadas permanentemente. ¿Continuar?"
        confirmLabel="Sí, cambiar"
        destructive
        onConfirm={async () => {
          setShowTypeWarning(false);
          if (pendingTypeId) await applyTypeChange(pendingTypeId);
          setPendingTypeId(null);
        }}
        onCancel={() => {
          setShowTypeWarning(false);
          setPendingTypeId(null);
        }}
      />
    </div>
  );
}
