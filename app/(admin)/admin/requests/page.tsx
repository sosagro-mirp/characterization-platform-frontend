"use client";

import { useEffect, useState } from "react";
import { listRequests, resolveRequest } from "@/services/change-requests.service";
import type { ChangeRequestListItem } from "@/app/(admin)/types";
import ChangeRequestsTable from "@/components/admin/requests/ChangeRequestsTable";
import ResolveConfirmDialog from "@/components/admin/requests/ResolveConfirmDialog";

type StatusFilter = "all" | "open" | "resolved";
type SourceFilter = "all" | "mobile" | "web";

export default function RequestsPage() {
  const [requests, setRequests] = useState<ChangeRequestListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("open");
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");

  const [resolving, setResolving] = useState<ChangeRequestListItem | null>(null);
  const [resolvingLoading, setResolvingLoading] = useState(false);

  async function load(status: StatusFilter, source: SourceFilter) {
    setLoading(true);
    setError(null);
    try {
      const data = await listRequests(status, source);
      setRequests(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar solicitudes.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(statusFilter, sourceFilter);
  }, [statusFilter, sourceFilter]);

  async function handleResolve() {
    if (!resolving) return;
    setResolvingLoading(true);
    try {
      const updated = await resolveRequest(resolving.changeRequestId);
      setRequests((prev) =>
        prev.map((r) => (r.changeRequestId === updated.changeRequestId ? updated : r)),
      );
      setResolving(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al resolver.");
    } finally {
      setResolvingLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
          Solicitudes de cambio
        </h1>
        <p className="text-sm text-[var(--text-muted)]">
          {loading
            ? "Cargando solicitudes…"
            : `${requests.length} solicitud${requests.length === 1 ? "" : "es"} reportada${requests.length === 1 ? "" : "s"} desde web y mobile`}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-6">
        <div>
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
            Estado
          </p>
          <div className="flex overflow-hidden rounded-md border border-[var(--border)]">
            {(["open", "all", "resolved"] as StatusFilter[]).map((s, i) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatusFilter(s)}
                className={`px-3.5 py-2 text-xs font-medium transition-colors ${i > 0 ? "border-l border-[var(--border)]" : ""} ${
                  statusFilter === s
                    ? "bg-[var(--brand)] text-[var(--brand-foreground)] font-semibold"
                    : "bg-[var(--surface)] text-[var(--text-muted)] hover:bg-[var(--surface-muted)]"
                }`}
              >
                {s === "open" ? "Abiertas" : s === "resolved" ? "Resueltas" : "Todas"}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
            Origen
          </p>
          <div className="flex overflow-hidden rounded-md border border-[var(--border)]">
            {(["all", "mobile", "web"] as SourceFilter[]).map((s, i) => (
              <button
                key={s}
                type="button"
                onClick={() => setSourceFilter(s)}
                className={`px-3.5 py-2 text-xs font-medium transition-colors ${i > 0 ? "border-l border-[var(--border)]" : ""} ${
                  sourceFilter === s
                    ? "bg-[var(--brand)] text-[var(--brand-foreground)] font-semibold"
                    : "bg-[var(--surface)] text-[var(--text-muted)] hover:bg-[var(--surface-muted)]"
                }`}
              >
                {s === "all" ? "Todas" : s === "mobile" ? "Mobile" : "Web"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading && (
        <p className="text-sm text-[var(--text-muted)]">Cargando…</p>
      )}
      {error && (
        <p className="rounded-lg bg-[var(--danger-bg)] px-4 py-3 text-sm text-[var(--danger-fg)]">
          {error}
        </p>
      )}
      {!loading && !error && (
        <ChangeRequestsTable requests={requests} onResolve={setResolving} />
      )}

      {resolving && (
        <ResolveConfirmDialog
          item={resolving}
          onConfirm={handleResolve}
          onCancel={() => setResolving(null)}
          loading={resolvingLoading}
        />
      )}
    </div>
  );
}
