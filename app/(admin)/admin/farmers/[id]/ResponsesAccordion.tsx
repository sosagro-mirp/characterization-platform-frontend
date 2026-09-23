"use client";

import type { SurveyResponseItem } from "@/app/(admin)/types";
import { MediaEvidence } from "@/components/inputs/MediaAttachmentViewer";

function formatValue(r: SurveyResponseItem): string {
  switch (r.questionType) {
    case "yes_no":
      if (r.booleanValue === true) return "Sí";
      if (r.booleanValue === false) return "No";
      return r.optionText ?? "—";
    case "numeric":
      return r.numericValue != null ? String(r.numericValue) : "—";
    case "numeric_with_unit":
      return r.numericValue != null && r.optionText
        ? `${r.numericValue} ${r.optionText}`
        : r.numericValue != null
          ? String(r.numericValue)
          : "—";
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

const MULTIMEDIA_TYPES = new Set(["image", "voice_recording", "document", "video"]);

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
          <p className="mb-2.5 text-[10.5px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            {sectionTitle}
          </p>
          <div className="overflow-hidden rounded-md border border-[var(--border)] bg-[var(--surface)]">
            {items.map((r, idx) => (
              <div
                key={r.responseId}
                className={`grid grid-cols-[1.3fr_1fr] items-start gap-4 px-3.5 py-3 ${
                  idx < items.length - 1 ? "border-b border-[var(--border)]" : ""
                }`}
              >
                <p className="text-xs leading-relaxed text-[var(--text-muted)]">
                  {r.questionText}
                </p>
                {MULTIMEDIA_TYPES.has(r.questionType) ? (
                  <div className="mt-1">
                    <MediaEvidence
                      attachmentId={r.attachmentId}
                      mimeType={r.mimeType}
                      originalFilename={r.originalFilename}
                    />
                  </div>
                ) : (
                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    {formatValue(r)}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
