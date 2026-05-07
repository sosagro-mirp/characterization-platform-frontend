"use client";

import { useEffect, useState } from "react";
import { QuestionDetail, TypeOfQuestionSummary } from "@/app/(admin)/types";
import { useInstrumentEditorStore } from "@/store/useInstrumentEditorStore";
import OptionsEditor from "./OptionsEditor";
import ConfirmDialog from "./ConfirmDialog";

const TYPES_WITH_OPTIONS = ["single_choice", "likert", "multiple_choice"];

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
  const [conditionQuestionId, setConditionQuestionId] = useState<string>(
    question.conditionQuestionId ?? ""
  );
  const [conditionValue, setConditionValue] = useState(
    question.conditionValue ?? ""
  );
  const [showTypeWarning, setShowTypeWarning] = useState(false);
  const [pendingTypeId, setPendingTypeId] = useState<string | null>(null);

  useEffect(() => {
    setText(question.text);
    setTypeId(question.type?.typeId ?? "");
    setIsRequired(question.isRequired);
    setConditionQuestionId(question.conditionQuestionId ?? "");
    setConditionValue(question.conditionValue ?? "");
  }, [question.questionId]);

  const allQuestions = sections.flatMap((s) => s.questions);
  const precedingQuestions = allQuestions.filter(
    (q) =>
      q.questionId !== question.questionId &&
      q.order < question.order
  );

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

  const handleConditionChange = async () => {
    await updateQuestionInStore(sectionId, question.questionId, {
      conditionQuestionId: conditionQuestionId || null,
      conditionValue: conditionQuestionId ? conditionValue || null : null,
    });
  };

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)] mb-1">
          Pregunta
        </p>
        <h2 className="text-base font-semibold text-[var(--text-primary)] truncate">
          {question.text}
        </h2>
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
          className="w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)] resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
          Tipo de pregunta
        </label>
        <select
          value={typeId}
          onChange={(e) => handleTypeChange(e.target.value)}
          className="w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)] bg-[var(--surface)]"
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
          id="isRequired"
          checked={isRequired}
          onChange={(e) => handleRequiredChange(e.target.checked)}
          className="h-4 w-4 rounded border-[var(--border)] accent-green-700"
        />
        <label htmlFor="isRequired" className="text-sm text-[var(--text-primary)]">
          Pregunta obligatoria
        </label>
      </div>

      {precedingQuestions.length > 0 && (
        <div className="space-y-3 rounded-lg border border-[var(--border)] p-4">
          <p className="text-sm font-medium text-[var(--text-primary)]">
            Condición de visibilidad (opcional)
          </p>
          <div>
            <label className="block text-xs text-[var(--text-muted)] mb-1">
              Mostrar solo si la respuesta a…
            </label>
            <select
              value={conditionQuestionId}
              onChange={(e) => setConditionQuestionId(e.target.value)}
              onBlur={handleConditionChange}
              className="w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)] bg-[var(--surface)]"
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
              <input
                type="text"
                maxLength={50}
                value={conditionValue}
                onChange={(e) => setConditionValue(e.target.value)}
                onBlur={handleConditionChange}
                placeholder="Ej: true, false, optionId…"
                className="w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
              />
            </div>
          )}
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
