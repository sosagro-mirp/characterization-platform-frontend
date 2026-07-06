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
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-[var(--text-primary)]">
          Solicitudes de cambio
        </h1>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <div className="flex gap-1 rounded-lg border border-[var(--border)] p-1 bg-[var(--surface)]">
          {(["open", "all", "resolved"] as StatusFilter[]).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                statusFilter === s
                  ? "bg-[var(--brand)] text-white"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
            >
              {s === "open" ? "Abiertas" : s === "resolved" ? "Resueltas" : "Todas"}
            </button>
          ))}
        </div>

        <div className="flex gap-1 rounded-lg border border-[var(--border)] p-1 bg-[var(--surface)]">
          {(["all", "mobile", "web"] as SourceFilter[]).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSourceFilter(s)}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                sourceFilter === s
                  ? "bg-[var(--brand)] text-white"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
            >
              {s === "all" ? "Todas las fuentes" : s === "mobile" ? "Mobile" : "Web"}
            </button>
          ))}
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
