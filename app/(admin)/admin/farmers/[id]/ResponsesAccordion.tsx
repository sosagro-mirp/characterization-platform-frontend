"use client";

import type { SurveyResponseItem } from "@/app/(admin)/types";

function MediaValue({ r }: { r: SurveyResponseItem }) {
  if (!r.publicUrl) {
    return <span className="text-sm font-medium text-[var(--text-muted)]">Sin evidencia capturada</span>;
  }

  if (r.questionType === "image") {
    return (
      <div className="mt-1 space-y-1">
        <a href={r.publicUrl} target="_blank" rel="noopener noreferrer">
          <img
            src={r.publicUrl}
            alt={r.originalFilename ?? "imagen"}
            className="max-h-40 rounded-lg border border-[var(--border)] object-contain"
          />
        </a>
        {r.originalFilename && (
          <p className="text-xs text-[var(--text-muted)]">{r.originalFilename}</p>
        )}
      </div>
    );
  }

  if (r.questionType === "voice_recording") {
    return (
      <div className="mt-1 space-y-1">
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <audio controls src={r.publicUrl} className="w-full" />
        {r.originalFilename && (
          <p className="text-xs text-[var(--text-muted)]">{r.originalFilename}</p>
        )}
      </div>
    );
  }

  if (r.questionType === "document") {
    return (
      <a
        href={r.publicUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--brand)] underline underline-offset-2"
      >
        📄 {r.originalFilename ?? "Abrir documento"}
      </a>
    );
  }

  return <span className="text-sm font-medium text-[var(--text-primary)]">{r.publicUrl}</span>;
}

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

const MULTIMEDIA_TYPES = new Set(["image", "voice_recording", "document"]);

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
                {MULTIMEDIA_TYPES.has(r.questionType) ? (
                  <MediaValue r={r} />
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
