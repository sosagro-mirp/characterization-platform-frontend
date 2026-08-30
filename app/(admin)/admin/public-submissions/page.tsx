"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Inbox } from "lucide-react";
import {
  getPublicSubmissions,
} from "@/services/surveys.service";
import type {
  PublicSubmissionListItem,
  PublicSubmissionReviewStatus,
} from "@/app/(admin)/types";

const STATUS_LABEL: Record<PublicSubmissionReviewStatus, string> = {
  pending: "Pendiente",
  processed: "Procesado",
  discarded: "Descartado",
};

const STATUS_CLASS: Record<PublicSubmissionReviewStatus, string> = {
  pending: "bg-[var(--warning-bg)] text-[var(--warning-fg)]",
  processed: "bg-[var(--success-bg)] text-[var(--success-fg)]",
  discarded: "bg-[var(--surface-muted)] text-[var(--text-muted)]",
};

/**
 * Spec 79, Fase 6 — bandeja de envíos públicos. Un instrumento marcado
 * público recibe respuestas anónimas (sin agricultor, sin usuario); esta
 * lista es el único punto donde un administrador las ve y decide procesarlas
 * o descartarlas. Ver criterios 10-13 del spec.
 */
export default function PublicSubmissionsPage() {
  const router = useRouter();
  const [submissions, setSubmissions] = useState<PublicSubmissionListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [instrumentFilter, setInstrumentFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<PublicSubmissionReviewStatus | "">(
    "pending",
  );

  function reload() {
    setLoading(true);
    return getPublicSubmissions({
      instrumentId: instrumentFilter || undefined,
      reviewStatus: statusFilter || undefined,
    })
      .then(setSubmissions)
      .catch((err) =>
        setError(
          err instanceof Error ? err.message : "Error al cargar los envíos públicos.",
        ),
      )
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instrumentFilter, statusFilter]);

  // Opciones del filtro de instrumento: solo los que ya aparecen en la
  // bandeja sin filtrar, para no ofrecer instrumentos sin envíos.
  const [allInstruments, setAllInstruments] = useState<
    { instrumentId: string; instrumentName: string }[]
  >([]);
  useEffect(() => {
    getPublicSubmissions().then((rows) => {
      const seen = new Map<string, string>();
      rows.forEach((r) => seen.set(r.instrumentId, r.instrumentName));
      setAllInstruments(
        [...seen.entries()].map(([instrumentId, instrumentName]) => ({
          instrumentId,
          instrumentName,
        })),
      );
    });
  }, []);

  const dateFormatter = useMemo(
    () => new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short" }),
    [],
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
          Envíos públicos
        </h1>
        <p className="text-sm text-[var(--text-muted)]">
          Respuestas recibidas por enlace público, sin agricultor asociado.
          Procésalas para crear el agricultor o descártalas si son ruido.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <select
          value={instrumentFilter}
          onChange={(e) => setInstrumentFilter(e.target.value)}
          className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
        >
          <option value="">Todos los instrumentos</option>
          {allInstruments.map((i) => (
            <option key={i.instrumentId} value={i.instrumentId}>
              {i.instrumentName}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as PublicSubmissionReviewStatus | "")
          }
          className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
        >
          <option value="">Todos los estados</option>
          <option value="pending">Pendiente</option>
          <option value="processed">Procesado</option>
          <option value="discarded">Descartado</option>
        </select>
      </div>

      {error && (
        <p className="text-sm text-[var(--danger-fg)] rounded-lg bg-[var(--danger-bg)] px-3 py-2">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-[var(--text-muted)]">Cargando…</p>
      ) : (
        <div className="overflow-hidden rounded-md border border-[var(--border)] bg-[var(--surface)]">
          {submissions.length > 0 ? (
            <table className="w-full text-xs">
              <thead className="border-b border-[var(--border)] bg-[var(--surface-muted)] text-[10.5px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                <tr>
                  <th className="px-3 py-2.5 text-left">Instrumento</th>
                  <th className="px-3 py-2.5 text-left">Recibido</th>
                  <th className="px-3 py-2.5 text-left">Respuestas</th>
                  <th className="px-3 py-2.5 text-left">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {submissions.map((s) => (
                  <tr
                    key={s.surveyId}
                    onClick={() => router.push(`/admin/public-submissions/${s.surveyId}`)}
                    className="cursor-pointer hover:bg-[var(--surface-muted)] transition-colors"
                  >
                    <td className="px-3 py-2.5 font-medium text-[var(--text-primary)]">
                      {s.instrumentName}
                    </td>
                    <td className="px-3 py-2.5 text-[var(--text-muted)]">
                      {dateFormatter.format(new Date(s.createdAt))}
                    </td>
                    <td className="px-3 py-2.5 text-[var(--text-muted)]">
                      {s.responseCount}
                    </td>
                    <td className="px-3 py-2.5">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[10.5px] font-semibold ${STATUS_CLASS[s.reviewStatus]}`}
                      >
                        {STATUS_LABEL[s.reviewStatus]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="flex flex-col items-center px-6 py-12 text-center">
              <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-[var(--surface-muted)]">
                <Inbox className="size-5 text-[var(--text-muted)]" aria-hidden="true" />
              </div>
              <p className="mb-1.5 text-sm font-semibold text-[var(--text-primary)]">
                Sin envíos {statusFilter ? STATUS_LABEL[statusFilter].toLowerCase() : ""}
              </p>
              <p className="max-w-sm text-xs text-[var(--text-muted)]">
                Los envíos que lleguen por los enlaces públicos activos aparecerán aquí.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
