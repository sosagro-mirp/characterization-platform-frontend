"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { DepartmentSummary } from "@/services/departments.service";
import type { CropSummary } from "@/app/(instrument)/types";
import type { ActorTypeSummary } from "@/app/(admin)/types";
import {
  fetchPrivateCategories,
  fetchPrivateCharts,
  fetchPublicActorTypes,
  fetchPublicCrops,
  fetchPublicDepartments,
} from "@/app/(dashboard)/api";
import type { ServedCategory, ServedChartsResponse } from "@/app/(dashboard)/types";
import {
  buildDashboardQuery,
  OVERVIEW_CATEGORY_CODE,
  parseDashboardParams,
} from "@/lib/dashboard/filters";
import ChartsGrid from "@/app/(dashboard)/components/ChartsGrid";
import GlobalFilterBar from "@/app/(dashboard)/components/GlobalFilterBar";
import { errorMessage } from "@/components/admin/dashboard-builder/ui";

/**
 * Spec 109 (P8, P19) — dashboard privado para ADMIN y RESEARCHER: los
 * gráficos públicos y privados publicados, con las mismas barreras y
 * umbrales que el público y sin caché compartida. Reutiliza la grilla, las
 * tarjetas y la barra de filtros del dashboard público. El layout `(admin)`
 * ya restringe la ruta a esos dos roles.
 */
export default function PrivateDashboardPage() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [categories, setCategories] = useState<ServedCategory[] | null>(null);
  const [data, setData] = useState<ServedChartsResponse | null>(null);
  const [catalogs, setCatalogs] = useState<{
    departments: DepartmentSummary[];
    crops: CropSummary[];
    actorTypes: ActorTypeSummary[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const raw = useMemo(
    () => Object.fromEntries(searchParams.entries()) as Record<string, string>,
    [searchParams],
  );
  const codes = useMemo(() => (categories ?? []).map((c) => c.code), [categories]);
  const state = useMemo(() => parseDashboardParams(raw, codes), [raw, codes]);
  // Sin categoría elegida se muestra el resumen (OVERVIEW) si tiene gráficos.
  const activeCode =
    state.categoryId ?? (codes.includes(OVERVIEW_CATEGORY_CODE) ? OVERVIEW_CATEGORY_CODE : codes[0]);
  const filtersKey = JSON.stringify(state.filters);

  useEffect(() => {
    Promise.all([
      fetchPrivateCategories(),
      fetchPublicDepartments(),
      fetchPublicCrops(),
      fetchPublicActorTypes(),
    ])
      .then(([cats, departments, crops, actorTypes]) => {
        setCategories(cats);
        setCatalogs({ departments, crops, actorTypes });
      })
      .catch((err) => setError(errorMessage(err, "No se pudieron cargar las categorías.")));
  }, []);

  useEffect(() => {
    if (!activeCode) return;
    let cancelled = false;
    fetchPrivateCharts(activeCode, JSON.parse(filtersKey))
      .then((result) => {
        if (!cancelled) {
          setData(result);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(errorMessage(err, "No se pudieron cargar los gráficos."));
      });
    return () => {
      cancelled = true;
    };
  }, [activeCode, filtersKey]);

  const activeName =
    activeCode === OVERVIEW_CATEGORY_CODE
      ? "Resumen general"
      : (categories?.find((c) => c.code === activeCode)?.name ?? "");

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-4">
      <header>
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Dashboard</h1>
        <p className="text-sm text-[var(--text-muted)]">
          Incluye los gráficos privados, que no se publican en el dashboard abierto.
        </p>
      </header>

      {error && (
        <p role="alert" className="rounded-md bg-[var(--danger-bg)] px-3 py-2 text-sm text-[var(--danger-fg)]">
          {error}
        </p>
      )}

      {categories && categories.length === 0 && (
        <p className="rounded-md border border-dashed border-[var(--border)] px-4 py-8 text-center text-sm text-[var(--text-muted)]">
          Todavía no hay gráficos publicados. Arma los primeros en el constructor de dashboard.
        </p>
      )}

      {categories && categories.length > 0 && (
        <div className="flex flex-col gap-6 lg:flex-row">
          <nav aria-label="Categorías del dashboard" className="lg:w-56 lg:shrink-0">
            <ul className="flex flex-col gap-1">
              {categories.map((category) => {
                const isOverview = category.code === OVERVIEW_CATEGORY_CODE;
                const href = `${pathname}?${buildDashboardQuery({
                  view: isOverview ? "overview" : "category",
                  categoryId: isOverview ? undefined : category.code,
                  filters: state.filters,
                })}`;
                const active = category.code === activeCode;
                return (
                  <li key={category.code}>
                    <Link
                      href={href}
                      aria-current={active ? "page" : undefined}
                      className={`block rounded-md border-l-4 px-3 py-2 text-sm ${
                        active
                          ? "border-brand bg-brand-subtle-bg text-brand-subtle-fg"
                          : "border-transparent hover:bg-[var(--surface-muted)]"
                      }`}
                    >
                      {isOverview ? "Resumen general" : category.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <section className="min-w-0 flex-1 space-y-4">
            {catalogs && (
              <GlobalFilterBar
                state={state}
                categoryTitle={activeName}
                departments={catalogs.departments}
                crops={catalogs.crops}
                actorTypes={catalogs.actorTypes}
              />
            )}
            {data && (
              <>
                {data.suppressed && (
                  <p className="rounded-md bg-[var(--warning-bg)] px-3 py-2 text-sm text-[var(--warning-fg)]">
                    La muestra con estos filtros es insuficiente: los gráficos de preguntas se
                    muestran suprimidos.
                  </p>
                )}
                <ChartsGrid charts={data.charts} />
              </>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
