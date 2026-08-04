"use client";

import { useState } from "react";
import { ChangeRequestListItem } from "@/app/(admin)/types";
import RequestDetailModal from "./RequestDetailModal";

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
  const [detail, setDetail] = useState<ChangeRequestListItem | null>(null);

  if (requests.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-md border border-[var(--border)] bg-[var(--surface)] px-6 py-16 text-center">
        <p className="text-sm font-semibold text-[var(--text-primary)]">
          No hay solicitudes
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-md border border-[var(--border)] bg-[var(--surface)]">
        <table className="w-full text-xs">
          <thead className="border-b border-[var(--border)] bg-[var(--surface-muted)] text-[10.5px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
            <tr>
              <th className="px-3 py-2.5 text-left">Origen</th>
              <th className="px-3 py-2.5 text-left">Categoría</th>
              <th className="px-3 py-2.5 text-left">Descripción</th>
              <th className="px-3 py-2.5 text-left">Estado</th>
              <th className="px-3 py-2.5 text-right">Fecha</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {requests.map((r) => (
              <tr
                key={r.changeRequestId}
                onClick={() => setDetail(r)}
                className="cursor-pointer hover:bg-[var(--surface-muted)] transition-colors"
              >
                <td className="px-3 py-2.5">
                  <span
                    className={`inline-flex rounded px-2 py-0.5 text-[10.5px] font-medium whitespace-nowrap ${
                      r.source === "mobile"
                        ? "bg-[var(--info-bg)] text-[var(--info-fg)]"
                        : "bg-[var(--surface-muted)] text-[var(--text-muted)]"
                    }`}
                  >
                    {SOURCE_LABELS[r.source] ?? r.source}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-[var(--text-muted)] whitespace-nowrap">
                  {r.category ? (CATEGORY_LABELS[r.category] ?? r.category) : "—"}
                </td>
                <td className="max-w-xs truncate px-3 py-2.5 text-[var(--text-primary)]">
                  {r.description}
                </td>
                <td className="px-3 py-2.5">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-[10.5px] font-medium whitespace-nowrap ${
                      r.status === "resolved"
                        ? "bg-[var(--success-bg)] text-[var(--success-fg)]"
                        : "bg-[var(--warning-bg)] text-[var(--warning-fg)]"
                    }`}
                  >
                    {r.status === "resolved" ? "Resuelta" : "Abierta"}
                  </span>
                </td>
                <td className="whitespace-nowrap px-3 py-2.5 text-right text-[var(--text-muted)]">
                  {new Date(r.createdAt).toLocaleDateString("es-CO")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {detail && (
        <RequestDetailModal
          item={detail}
          onClose={() => setDetail(null)}
          onResolve={(item) => {
            setDetail(null);
            onResolve(item);
          }}
        />
      )}
    </>
  );
}
