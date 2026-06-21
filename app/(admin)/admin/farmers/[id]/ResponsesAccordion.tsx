"use client";

import type { SurveyResponseItem } from "@/app/(admin)/types";

function formatValue(r: SurveyResponseItem): string {
  switch (r.questionType) {
    case "yes_no":
      if (r.booleanValue === true) return "Sí";
      if (r.booleanValue === false) return "No";
      return r.optionText ?? "—";
    case "numeric":
      return r.numericValue != null ? String(r.numericValue) : "—";
    case "open_text":
      return r.textValue ?? "—";
    case "single_choice":
    case "likert":
    case "compliance":
    case "multiple_choice":
      return r.optionText ?? r.textValue ?? "—";
    default:
      return (
        r.textValue ??
        r.optionText ??
        (r.numericValue != null ? String(r.numericValue) : "—")
      );
  }
}

export function ResponsesAccordion({
  responses,
}: {
  responses: SurveyResponseItem[];
}) {
  if (responses.length === 0) {
    return (
      <p className="py-2 text-sm text-[var(--text-muted)]">
        Esta encuesta no tiene respuestas registradas.
      </p>
    );
  }

  const sections: Record<string, SurveyResponseItem[]> = {};
  for (const r of responses) {
    const key = r.sectionTitle ?? "Sin sección";
    if (!sections[key]) sections[key] = [];
    sections[key].push(r);
  }

  return (
    <div className="space-y-5">
      {Object.entries(sections).map(([sectionTitle, items]) => (
        <div key={sectionTitle}>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            {sectionTitle}
          </p>
          <div className="space-y-2">
            {items.map((r) => (
              <div
                key={r.responseId}
                className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2"
              >
                <p className="mb-0.5 text-xs text-[var(--text-muted)]">
                  {r.questionText}
                </p>
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  {formatValue(r)}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
