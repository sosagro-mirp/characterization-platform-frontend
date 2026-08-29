"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Users } from "lucide-react";
import { FarmerDetail } from "@/app/(admin)/types";
import { apiClient } from "@/lib/apiClient";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "—";
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}

export default function FarmersListPage() {
  const router = useRouter();
  const [allFarmers, setAllFarmers] = useState<FarmerDetail[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiClient
      .get<FarmerDetail[]>("/api/farmers")
      .then(setAllFarmers)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Error al cargar agricultores."),
      )
      .finally(() => setLoading(false));
  }, []);

  const q = query.trim().toLowerCase();
  const farmers = q
    ? allFarmers.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          (f.documentId ?? "").toLowerCase().includes(q),
      )
    : allFarmers;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
          Agricultores
        </h1>
        <p className="text-sm text-[var(--text-muted)]">
          {loading
            ? "Busca y edita los datos de agricultores registrados."
            : `${allFarmers.length} agricultor${allFarmers.length === 1 ? "" : "es"} registrado${allFarmers.length === 1 ? "" : "s"}`}
        </p>
      </div>

      <div className="relative max-w-sm">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-[var(--text-muted)]"
          aria-hidden="true"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nombre o documento…"
          className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] py-2 pl-9 pr-4 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
        />
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
          {farmers.length > 0 && (
            <table className="w-full text-xs">
              <thead className="border-b border-[var(--border)] bg-[var(--surface-muted)] text-[10.5px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                <tr>
                  <th className="px-3 py-2.5 text-left">Nombre</th>
                  <th className="px-3 py-2.5 text-left">Documento</th>
                  <th className="px-3 py-2.5 text-left">Teléfono</th>
                  <th className="px-3 py-2.5 text-left">Finca</th>
                  <th className="px-3 py-2.5 text-left">Consentimiento</th>
                  <th className="px-3 py-2.5 text-left">Creación</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {farmers.map((farmer) => (
                  <tr
                    key={farmer.id}
                    onClick={() => router.push(`/admin/farmers/${farmer.id}`)}
                    className="cursor-pointer hover:bg-[var(--surface-muted)] transition-colors"
                  >
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-[var(--surface-muted)] text-[10px] font-bold text-[var(--text-muted)]">
                          {initials(farmer.name)}
                        </span>
                        <span className="font-medium text-[var(--text-primary)]">
                          {farmer.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-[var(--text-muted)]">
                      {farmer.documentId ?? "—"}
                    </td>
                    <td className="px-3 py-2.5 text-[var(--text-muted)]">
                      {farmer.phone ?? "—"}
                    </td>
                    <td className="px-3 py-2.5 text-[var(--text-muted)]">
                      {farmer.farm?.name ?? "—"}
                    </td>
                    <td className="px-3 py-2.5">
                      {farmer.hasPendingConsent ? (
                        <span className="inline-flex items-center rounded-full bg-[var(--warning-bg)] px-2 py-0.5 text-[10.5px] font-medium text-[var(--warning-fg)]">
                          Pendiente
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-[var(--surface-muted)] px-2 py-0.5 text-[10.5px] font-medium text-[var(--text-muted)]">
                          Vigente
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-[var(--text-muted)]">
                      {new Date(farmer.createdAt).toLocaleDateString("es-CO")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {farmers.length === 0 && (
            <div className="flex flex-col items-center px-6 py-16 text-center">
              <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-[var(--surface-muted)]">
                <Users className="size-5 text-[var(--text-muted)]" aria-hidden="true" />
              </div>
              <p className="mb-1.5 text-sm font-semibold text-[var(--text-primary)]">
                {query ? `Sin resultados para “${query}”` : "No hay agricultores registrados"}
              </p>
              <p className="max-w-sm text-xs text-[var(--text-muted)]">
                {query
                  ? "Probá con otro término o revisá la ortografía."
                  : "Los agricultores aparecen aquí cuando se aplica una encuesta en campo."}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
