"use client";

import type { SurveyResponseItem } from "@/app/(admin)/types";
import { formatResponseValue } from "@/lib/responses/formatResponseValue";

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
                  <MediaValue r={r} />
                ) : (
                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    {formatResponseValue(r)}
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
