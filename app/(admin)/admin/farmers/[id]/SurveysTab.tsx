"use client";

import { useEffect, useState } from "react";
import { ChevronRight, ClipboardList } from "lucide-react";
import type { SurveyListItem, SurveyResponsesResult } from "@/app/(admin)/types";
import { getSurveysByFarmer, getSurveyResponses } from "@/services/surveys.service";
import { ResponsesAccordion } from "./ResponsesAccordion";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-CO", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function SurveysTab({ farmerId }: { farmerId: string }) {
  const [surveys, setSurveys] = useState<SurveyListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [responsesMap, setResponsesMap] = useState<Record<string, SurveyResponsesResult>>({});
  const [loadingResponses, setLoadingResponses] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getSurveysByFarmer(farmerId)
      .then((data) => {
        if (!cancelled) setSurveys(data);
      })
      .catch((err) => {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Error al cargar encuestas.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [farmerId]);

  async function handleExpand(surveyId: string) {
    if (expandedId === surveyId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(surveyId);
    if (responsesMap[surveyId]) return;
    setLoadingResponses(surveyId);
    try {
      const data = await getSurveyResponses(surveyId);
      setResponsesMap((prev) => ({ ...prev, [surveyId]: data }));
    } catch {
      // keep expandedId to show the empty state
    } finally {
      setLoadingResponses(null);
    }
  }

  if (loading)
    return <p className="text-sm text-[var(--text-muted)]">Cargando encuestas…</p>;

  if (error)
    return <p className="text-sm text-[var(--danger-fg)]">{error}</p>;

  if (surveys.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-md border border-[var(--border)] bg-[var(--surface)] px-6 py-16 text-center">
        <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-[var(--surface-muted)]">
          <ClipboardList className="size-5 text-[var(--text-muted)]" aria-hidden="true" />
        </div>
        <p className="text-sm font-semibold text-[var(--text-primary)]">
          Este agricultor no tiene encuestas registradas
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      {surveys.map((survey) => {
        const instrumentName = survey.instruments?.[0]?.name ?? "Sin instrumento";
        const isExpanded = expandedId === survey.surveyId;
        const result = responsesMap[survey.surveyId];
        const isLoadingThis = loadingResponses === survey.surveyId;

        return (
          <div
            key={survey.surveyId}
            className="overflow-hidden rounded-md border border-[var(--border)]"
          >
            <button
              type="button"
              onClick={() => handleExpand(survey.surveyId)}
              className="flex w-full items-center gap-3 bg-[var(--surface-muted)] px-4 py-3 text-left transition-colors hover:bg-[var(--surface)]"
            >
              <ChevronRight
                className={`size-3.5 shrink-0 text-[var(--text-muted)] transition-transform ${isExpanded ? "rotate-90" : ""}`}
                aria-hidden="true"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-[var(--text-primary)]">
                  {instrumentName}
                </p>
                <p className="mt-0.5 text-[10.5px] text-[var(--text-muted)]">
                  Aplicada el {formatDate(survey.createdAt)}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap ${
                  survey.sincronized
                    ? "bg-[var(--success-bg)] text-[var(--success-fg)]"
                    : "bg-[var(--warning-bg)] text-[var(--warning-fg)]"
                }`}
              >
                {survey.sincronized ? "Sincronizada" : "Pendiente"}
              </span>
            </button>

            {isExpanded && (
              <div className="border-t border-[var(--border)] bg-[var(--surface)] px-4 py-4">
                {isLoadingThis ? (
                  <p className="text-sm text-[var(--text-muted)]">
                    Cargando respuestas…
                  </p>
                ) : result ? (
                  <ResponsesAccordion responses={result.responses} />
                ) : (
                  <p className="text-sm text-[var(--danger-fg)]">
                    No se pudieron cargar las respuestas.
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
