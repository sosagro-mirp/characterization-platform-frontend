"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FarmerDetail } from "@/app/(admin)/types";
import { apiClient } from "@/lib/apiClient";

export default function FarmersListPage() {
  const router = useRouter();
  const [farmers, setFarmers] = useState<FarmerDetail[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function load(search: string) {
    setLoading(true);
    setError(null);
    try {
      const params = search ? `?search=${encodeURIComponent(search)}` : "";
      const data = await apiClient.get<FarmerDetail[]>(`/api/farmers${params}`);
      setFarmers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar agricultores.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load("");
  }, []);

  function handleSearch(value: string) {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => load(value), 300);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
          Agricultores
        </h1>
        <p className="text-sm text-[var(--text-muted)]">
          Busca y edita los datos de agricultores registrados.
        </p>
      </div>

      <input
        type="text"
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Buscar por nombre o documento…"
        className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
      />

      {error && (
        <p className="text-sm text-[var(--danger-fg)] rounded-lg bg-[var(--danger-bg)] px-3 py-2">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-[var(--text-muted)]">Cargando…</p>
      ) : farmers.length === 0 ? (
        <p className="text-sm text-[var(--text-muted)]">
          {query ? "Sin resultados para la búsqueda." : "No hay agricultores registrados."}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
          <table className="w-full text-sm">
            <thead className="bg-[var(--surface-raised)] text-[var(--text-muted)]">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Nombre</th>
                <th className="px-4 py-3 text-left font-medium">Documento</th>
                <th className="px-4 py-3 text-left font-medium">Teléfono</th>
                <th className="px-4 py-3 text-left font-medium">Finca</th>
                <th className="px-4 py-3 text-left font-medium">Creación</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {farmers.map((farmer) => (
                <tr key={farmer.id} className="bg-[var(--surface)] hover:bg-[var(--surface-raised)] transition-colors">
                  <td className="px-4 py-3 text-[var(--text-primary)]">
                    {farmer.name}{farmer.lastName ? ` ${farmer.lastName}` : ""}
                  </td>
                  <td className="px-4 py-3 text-[var(--text-muted)]">
                    {farmer.documentId ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-[var(--text-muted)]">
                    {farmer.phone ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-[var(--text-muted)]">
                    {farmer.farm?.name ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-[var(--text-muted)]">
                    {new Date(farmer.createdAt).toLocaleDateString("es-CO")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => router.push(`/admin/farmers/${farmer.id}`)}
                      className="rounded-lg border border-[var(--border)] px-3 py-1 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--surface-raised)] transition-colors"
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
