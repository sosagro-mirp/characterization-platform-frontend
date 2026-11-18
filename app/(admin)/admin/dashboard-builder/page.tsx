"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Eye, Plus } from "lucide-react";
import type { BuilderCategory, BuilderChart } from "@/app/(admin)/types";
import {
  listBuilderCategories,
  listBuilderCharts,
} from "@/services/dashboard-builder.service";
import ChartList from "@/components/admin/dashboard-builder/ChartList";
import CategoryManager from "@/components/admin/dashboard-builder/CategoryManager";
import {
  CacheNotice,
  errorMessage,
  primaryButton,
  secondaryButton,
} from "@/components/admin/dashboard-builder/ui";

/** Spec 109, Fase 2 — constructor de dashboard: categorías y sus gráficos. */
export default function DashboardBuilderPage() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const selectedId = params.get("categoryId");
  const archived = params.get("archived") === "true";

  const [categories, setCategories] = useState<BuilderCategory[]>([]);
  const [charts, setCharts] = useState<BuilderChart[]>([]);
  // Clave (categoría + archivados) de la última lista cargada: mientras no
  // coincide con la vista pedida se muestra «Cargando…», no «sin gráficos».
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const [failedKey, setFailedKey] = useState<string | null>(null);
  const viewKey = `${selectedId}|${archived}`;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [managing, setManaging] = useState(false);

  const setQuery = useCallback(
    (next: { categoryId?: string; archived?: boolean }) => {
      const q = new URLSearchParams();
      const cat = next.categoryId ?? selectedId;
      if (cat) q.set("categoryId", cat);
      if (next.archived ?? archived) q.set("archived", "true");
      router.replace(`${pathname}?${q}`);
    },
    [archived, pathname, router, selectedId],
  );

  const loadCategories = useCallback(async () => {
    const list = (await listBuilderCategories()).toSorted(
      (a, b) => a.position - b.position || a.code.localeCompare(b.code),
    );
    setCategories(list);
    return list;
  }, []);

  useEffect(() => {
    loadCategories()
      .then((list) => {
        if (!selectedId && list[0]) setQuery({ categoryId: list[0].categoryId });
      })
      .catch((err) => setError(errorMessage(err, "No se pudieron cargar las categorías.")))
      .finally(() => setLoading(false));
    // Solo al montar: la selección por defecto no debe pisar la del usuario.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Solo cuenta la última petición: una respuesta tardía de otra categoría o
  // vista no debe pisar la actual (revisión 107, hallazgo 2).
  const latestRequest = useRef(0);

  const loadCharts = useCallback(async () => {
    if (!selectedId) return;
    const key = `${selectedId}|${archived}`;
    const request = ++latestRequest.current;
    try {
      const list = await listBuilderCharts({ categoryId: selectedId, archived });
      if (request !== latestRequest.current) return;
      setCharts(list);
      setLoadedKey(key);
      setFailedKey(null);
      setError(null);
    } catch (err) {
      if (request !== latestRequest.current) return;
      setFailedKey(key);
      setError(errorMessage(err, "No se pudieron cargar los gráficos."));
    }
  }, [archived, selectedId]);

  useEffect(() => {
    loadCharts();
  }, [loadCharts]);

  const selected = categories.find((c) => c.categoryId === selectedId);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
            Constructor de dashboard
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            Arma los gráficos que ven el dashboard público y el privado.
          </p>
        </div>
        <button
          type="button"
          className={secondaryButton}
          aria-expanded={managing}
          aria-controls="category-manager"
          onClick={() => setManaging((v) => !v)}
        >
          {managing ? "Cerrar gestión de categorías" : "Gestionar categorías"}
        </button>
      </header>

      <CacheNotice />

      {error && (
        <p className="rounded-md bg-[var(--danger-bg)] px-3 py-2 text-sm text-[var(--danger-fg)]">
          {error}
        </p>
      )}

      {managing && (
        <section
          id="category-manager"
          aria-labelledby="category-manager-title"
          className="rounded-md border border-[var(--border)] bg-[var(--surface)] p-4"
        >
          <h2 id="category-manager-title" className="mb-3 text-lg font-semibold">
            Categorías
          </h2>
          <CategoryManager
            categories={categories}
            onChanged={(categoryId) => {
              loadCategories().catch((err) =>
                setError(errorMessage(err, "No se pudieron cargar las categorías.")),
              );
              if (categoryId) setQuery({ categoryId });
            }}
          />
        </section>
      )}

      <div className="flex flex-col gap-6 lg:flex-row">
        <nav aria-label="Categorías del dashboard" className="lg:w-60 lg:shrink-0">
          {loading ? (
            <p className="text-sm text-[var(--text-muted)]">Cargando…</p>
          ) : (
            <ul className="flex flex-col gap-1">
              {categories.map((category) => {
                const active = category.categoryId === selectedId;
                return (
                  <li key={category.categoryId}>
                    <Link
                      href={`${pathname}?categoryId=${category.categoryId}`}
                      aria-current={active ? "page" : undefined}
                      className={`block rounded-md border-l-4 px-3 py-2 text-sm ${
                        active
                          ? "border-brand bg-brand-subtle-bg text-brand-subtle-fg"
                          : "border-transparent hover:bg-[var(--surface-muted)]"
                      }`}
                    >
                      <span className="font-mono text-xs text-[var(--text-muted)]">
                        {category.code}
                      </span>{" "}
                      <span className={category.isActive ? "" : "line-through"}>
                        {category.name}
                      </span>
                      {!category.isActive && <span className="sr-only"> (inactiva)</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </nav>

        <section className="min-w-0 flex-1" aria-labelledby="charts-title">
          {selected ? (
            <>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h2 id="charts-title" className="text-lg font-semibold">
                  {selected.name}
                  {!selected.isActive && (
                    <span className="ml-2 text-sm font-normal text-[var(--text-muted)]">
                      (inactiva: no se muestra en ningún dashboard)
                    </span>
                  )}
                </h2>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/admin/dashboard-builder/preview?categoryId=${selected.categoryId}`}
                    className={secondaryButton}
                  >
                    <Eye size={16} aria-hidden="true" /> Vista previa
                  </Link>
                  <Link
                    href={`/admin/dashboard-builder/charts/new?categoryId=${selected.categoryId}`}
                    className={primaryButton}
                  >
                    <Plus size={16} aria-hidden="true" /> Nuevo gráfico
                  </Link>
                </div>
              </div>
              <div role="group" aria-label="Mostrar" className="mb-3 flex gap-2 text-sm">
                <button
                  type="button"
                  aria-pressed={!archived}
                  onClick={() => setQuery({ archived: false })}
                  className={`rounded-full px-3 py-1 ${!archived ? "bg-brand text-brand-foreground" : "border border-[var(--border)]"}`}
                >
                  Activos
                </button>
                <button
                  type="button"
                  aria-pressed={archived}
                  onClick={() => setQuery({ archived: true })}
                  className={`rounded-full px-3 py-1 ${archived ? "bg-brand text-brand-foreground" : "border border-[var(--border)]"}`}
                >
                  Archivados
                </button>
              </div>
              {loadedKey === viewKey ? (
                <ChartList
                  key={`${selected.categoryId}-${archived}`}
                  categoryId={selected.categoryId}
                  charts={charts}
                  archived={archived}
                  onChanged={loadCharts}
                />
              ) : failedKey === viewKey ? (
                <button type="button" className={secondaryButton} onClick={loadCharts}>
                  Reintentar
                </button>
              ) : null}
              {/* Región viva siempre presente: solo cambia su texto (se anuncia mejor). */}
              <p role="status" className="text-sm text-[var(--text-muted)]">
                {loadedKey !== viewKey && failedKey !== viewKey ? "Cargando gráficos…" : ""}
              </p>
            </>
          ) : (
            !loading && (
              <p id="charts-title" className="text-sm text-[var(--text-muted)]">
                Elige una categoría.
              </p>
            )
          )}
        </section>
      </div>
    </div>
  );
}
