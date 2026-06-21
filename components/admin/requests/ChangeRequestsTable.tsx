"use client";

import { ChangeRequestListItem } from "@/app/(admin)/types";

const SOURCE_LABELS: Record<string, string> = {
  mobile: "Mobile",
  web: "Web",
};

const CATEGORY_LABELS: Record<string, string> = {
  bug_ui: "Bug UI",
  data_error: "Error de datos",
  suggestion: "Sugerencia",
  other: "Otro",
};

interface Props {
  requests: ChangeRequestListItem[];
  onResolve: (item: ChangeRequestListItem) => void;
}

export default function ChangeRequestsTable({ requests, onResolve }: Props) {
  if (requests.length === 0) {
    return (
      <p className="text-sm text-[var(--text-muted)] py-12 text-center">
        No hay solicitudes.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--surface)]">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--border)] text-left text-xs uppercase tracking-wide text-[var(--text-muted)]">
            <th className="px-4 py-3 font-medium">Fuente</th>
            <th className="px-4 py-3 font-medium">Categoría</th>
            <th className="px-4 py-3 font-medium">Descripción</th>
            <th className="px-4 py-3 font-medium">Agricultor</th>
            <th className="px-4 py-3 font-medium">Creado por</th>
            <th className="px-4 py-3 font-medium">Fecha</th>
            <th className="px-4 py-3 font-medium">Estado</th>
            <th className="px-4 py-3 font-medium text-right">Acción</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((r) => (
            <tr
              key={r.changeRequestId}
              className="border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--surface-muted)]/40 transition-colors"
            >
              <td className="px-4 py-3">
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                    r.source === "mobile"
                      ? "bg-[var(--info-bg)] text-[var(--info-fg)]"
                      : "bg-[var(--warning-bg)] text-[var(--warning-fg)]"
                  }`}
                >
                  {SOURCE_LABELS[r.source] ?? r.source}
                </span>
              </td>
              <td className="px-4 py-3 text-[var(--text-muted)]">
                {r.category ? (CATEGORY_LABELS[r.category] ?? r.category) : "—"}
              </td>
              <td className="px-4 py-3 text-[var(--text-primary)] max-w-xs">
                <span className="line-clamp-2">{r.description}</span>
              </td>
              <td className="px-4 py-3 text-[var(--text-muted)]">
                {r.farmer ? `${r.farmer.name}${r.farmer.lastName ? ` ${r.farmer.lastName}` : ""}` : "—"}
              </td>
              <td className="px-4 py-3 text-[var(--text-muted)]">
                {r.createdBy.name} {r.createdBy.lastName}
              </td>
              <td className="px-4 py-3 text-[var(--text-muted)] whitespace-nowrap">
                {new Date(r.createdAt).toLocaleDateString("es-CO")}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                    r.status === "resolved"
                      ? "bg-[var(--success-bg)] text-[var(--success-fg)]"
                      : "bg-[var(--warning-bg)] text-[var(--warning-fg)]"
                  }`}
                >
                  {r.status === "resolved" ? "Resuelta" : "Abierta"}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                {r.status === "open" ? (
                  <button
                    type="button"
                    onClick={() => onResolve(r)}
                    className="rounded-lg border border-[var(--brand)]/40 px-3 py-1 text-xs font-medium text-[var(--brand)] hover:bg-[var(--success-bg)] transition-colors"
                  >
                    Resolver
                  </button>
                ) : (
                  <span className="text-xs text-[var(--text-muted)]">
                    {r.resolvedAt ? new Date(r.resolvedAt).toLocaleDateString("es-CO") : "—"}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
