"use client";

import { useMemo } from "react";
import { useSystemFieldCatalog } from "@/hooks/useSystemFieldCatalog";
import {
  canonicalSystemField,
  duplicateWarning,
  groupSystemFields,
  SystemFieldUsage,
} from "@/lib/system-fields/systemFieldOptions";
import { useInstrumentEditorStore } from "@/store/useInstrumentEditorStore";

interface SystemFieldSelectProps {
  id: string;
  /** Nombre del tipo de pregunta (`open_text`, `yes_no`…); filtra los destinos compatibles. */
  questionTypeName: string;
  /** Valor guardado en la pregunta (clave canónica o alias); `null` si no tiene destino. */
  value: string | null | undefined;
  /** `null` en una pregunta que aún no existe. */
  currentQuestionId: string | null;
  onChange: (systemField: string | null) => void;
  disabled?: boolean;
}

/** Spec 97 — selector «Destino del dato», agrupado por entidad y filtrado por tipo de pregunta. */
export function SystemFieldSelect({
  id,
  questionTypeName,
  value,
  currentQuestionId,
  onChange,
  disabled,
}: SystemFieldSelectProps) {
  const { catalog, loading } = useSystemFieldCatalog();
  const { sections, instrumentName } = useInstrumentEditorStore();

  const groups = useMemo(
    () => groupSystemFields(catalog, questionTypeName),
    [catalog, questionTypeName],
  );

  const selectedKey = value ? (canonicalSystemField(catalog, value) ?? value) : "";
  const isOffered = groups.some((g) => g.fields.some((f) => f.key === selectedKey));

  // Solo se conocen las preguntas de este instrumento; el backend avisa
  // (`warnings[]`) si el destino también existe en otro.
  const usages: SystemFieldUsage[] = useMemo(
    () =>
      sections.flatMap((section) =>
        section.questions.flatMap((q) => {
          const key = q.systemField
            ? (canonicalSystemField(catalog, q.systemField) ?? q.systemField)
            : null;
          return key && !q.archivedAt
            ? [{ questionId: q.questionId, systemField: key, instrumentName }]
            : [];
        }),
      ),
    [sections, catalog, instrumentName],
  );
  const warning = selectedKey
    ? duplicateWarning(selectedKey, usages, currentQuestionId)
    : null;

  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-[var(--text-primary)] mb-1"
      >
        Destino del dato
      </label>
      <select
        id={id}
        value={selectedKey}
        disabled={disabled || loading}
        onChange={(e) => onChange(e.target.value || null)}
        className="w-full rounded-md border border-[var(--border)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)] bg-[var(--surface)] disabled:opacity-60"
      >
        <option value="">Sin destino</option>
        {selectedKey && !isOffered && (
          <option value={selectedKey}>
            {selectedKey} (no disponible para este tipo)
          </option>
        )}
        {groups.map((group) => (
          <optgroup key={group.entity} label={group.label}>
            {group.fields.map((field) => (
              <option key={field.key} value={field.key}>
                {field.label}
                {field.status === "noSource" ? " (sin fuente vigente)" : ""}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
      <p className="mt-1 text-[10.5px] text-[var(--text-muted)]">
        Dónde se guarda la respuesta en la ficha del productor o de la finca.
      </p>
      {warning && (
        <p
          role="status"
          className="mt-2 rounded-md bg-[var(--warning-bg)] px-3 py-2 text-xs text-[var(--warning-fg)]"
        >
          {warning}
        </p>
      )}
    </div>
  );
}
