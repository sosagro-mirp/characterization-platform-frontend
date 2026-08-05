"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { X } from "lucide-react";
import { buildDashboardQuery, clearDashboardFilters, DashboardPageState } from "@/lib/dashboard/filters";
import { downloadCsv, kpisToCsv, questionsToCsv } from "@/lib/dashboard/csv";
import {
  fetchDashboardAnalytics,
  fetchDashboardSummary,
  fetchKpis,
  fetchPublicTowns,
} from "../api";
import { DepartmentSummary } from "@/services/departments.service";
import { TownSummary } from "@/services/towns.service";
import { CropSummary } from "@/app/(instrument)/types";
import { ActorTypeSummary } from "@/app/(admin)/types";
import { DashboardFilters, DashboardSummary } from "../types";

interface GlobalFilterBarProps {
  state: DashboardPageState;
  /** Título de la vista activa: nombre de la categoría (catálogo,
   * `state.categoryId`) o "Resumen general" cuando no hay categoría. */
  categoryTitle?: string;
  departments: DepartmentSummary[];
  crops: CropSummary[];
  actorTypes: ActorTypeSummary[];
}

/** Selects tipo "pill" (etiqueta fija + valor actual), adaptados del diseño
 * (`Dashboard SosAgro.html`, proyecto de diseño): un contenedor con borde
 * agrupa la etiqueta y el `<select>` nativo sin su propio borde. `flex-1`
 * (a pedido del usuario) para que los filtros ocupen todo el ancho
 * disponible de la barra en vez de quedar apretados a la izquierda;
 * `justify-between` separa la etiqueta del valor+caret a medida que crece. */
const pillContainerClass =
  "flex flex-1 min-w-[180px] items-center justify-between gap-1.5 rounded-lg border border-[var(--border)] bg-surface-muted pl-3 pr-2 py-2";
const pillLabelClass = "text-sm lg:text-xs 2xl:text-base font-medium text-text-primary shrink-0";
const pillSelectClass =
  "w-full appearance-none bg-transparent text-sm lg:text-xs 2xl:text-base text-text-muted focus:outline-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 text-right";

/**
 * Barra de filtros global horizontal (spec 43, Fase 5): reemplaza el
 * `FilterPanel` lateral del spec 30. Toda actualización preserva `view`/
 * `categoryId` (D6) — solo cambian los filtros. El indicador reactivo de
 * tamaño de muestra queda para la Fase 8 (no es parte de esta fase).
 *
 * Alcance de filtros ajustado (2026-08-05, criterio 4 de `spec/43` actualizado
 * con aprobación del usuario tras la revisión de `@reviewer`): expone
 * Departamento, Municipio, Cultivo y Tipo de actor — este último se restauró
 * porque ya existía desde el spec 30 y su remoción había sido una regresión,
 * no un recorte deliberado. Género, Rango edad, Nivel educativo,
 * Conectividad, Campaña y Fecha siguen fuera de la UI (formalizado como el
 * alcance final de este spec), aunque siguen soportados por
 * `DashboardFilters`/la API si se navega directo por URL.
 *
 * DEBT: "Departamento" es selección única — el diseño lo dibuja como
 * multiselección, pero `departmentId` en el backend es un único UUID
 * (spec 30, sin cambios en este spec). Ampliarlo a multiselección requeriría
 * un cambio de contrato en el backend, fuera de alcance de esta fase.
 */
export default function GlobalFilterBar({
  state,
  categoryTitle,
  departments,
  crops,
  actorTypes,
}: GlobalFilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { filters } = state;

  /**
   * `react-hooks/set-state-in-effect` (eslint-config-next 16) prohíbe
   * setState sincrónico en el cuerpo del efecto (ej. `setTownsLoading(true)`
   * antes del fetch) — solo permite setState dentro de callbacks async
   * (`.then`/`.finally`). Por eso "cargando" se **deriva** comparando
   * `townsData.departmentId` contra el filtro activo, en vez de guardarse
   * en un booleano propio seteado sincrónicamente.
   */
  const [townsData, setTownsData] = useState<{
    departmentId: string;
    towns: TownSummary[];
  } | null>(null);

  useEffect(() => {
    if (!filters.departmentId) return;
    let cancelled = false;
    fetchPublicTowns(filters.departmentId).then((result) => {
      if (!cancelled) {
        setTownsData({ departmentId: filters.departmentId!, towns: result });
      }
    });
    return () => {
      cancelled = true;
    };
  }, [filters.departmentId]);

  const townsLoading =
    Boolean(filters.departmentId) && townsData?.departmentId !== filters.departmentId;
  const visibleTowns =
    filters.departmentId && townsData?.departmentId === filters.departmentId
      ? townsData.towns
      : [];

  /**
   * Fase 8 (spec 43): indicador reactivo de tamaño de muestra. Mismo patrón
   * de estado derivado que `townsData` — la clave (`query`) identifica a qué
   * combinación de filtros pertenece la última respuesta cargada, en vez de
   * un booleano `loading` seteado sincrónicamente en el efecto.
   */
  const summaryFilters: DashboardFilters = { ...filters, categoryId: state.categoryId };
  const summaryQuery = buildDashboardQuery({
    view: state.view,
    categoryId: state.categoryId,
    filters,
  });
  const [summaryData, setSummaryData] = useState<{
    query: string;
    summary: DashboardSummary;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchDashboardSummary(summaryFilters).then((result) => {
      if (!cancelled) setSummaryData({ query: summaryQuery, summary: result });
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [summaryQuery]);

  const summaryLoading = summaryData?.query !== summaryQuery;
  const summary = summaryLoading ? null : summaryData!.summary;

  function navigate(nextFilters: DashboardFilters) {
    const query = buildDashboardQuery({
      view: state.view,
      categoryId: state.categoryId,
      filters: nextFilters,
    });
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  function updateFilter(key: keyof DashboardFilters, value: string) {
    const nextFilters: DashboardFilters = { ...filters, [key]: value || undefined };
    if (key === "departmentId") nextFilters.townId = undefined;
    navigate(nextFilters);
  }

  function handleClear() {
    const cleared = clearDashboardFilters(state);
    const query = buildDashboardQuery(cleared);
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  const hasActiveFilters = Object.values(filters).some(Boolean);

  /**
   * Fase 10 (spec 43): CSV client-side de la vista actual, sin endpoint
   * nuevo — re-pide los mismos datos que ya renderiza la vista (`/kpis`
   * para "Resumen general", que no tiene un `questions[]` propio;
   * `/analytics` para categoría/instrumento) y los serializa en el navegador.
   */
  const [exporting, setExporting] = useState(false);

  async function handleExport() {
    setExporting(true);
    try {
      const exportFilters: DashboardFilters = { ...filters, categoryId: state.categoryId };
      const stamp = new Date().toISOString().slice(0, 10);

      if (!state.categoryId && !filters.instrumentId) {
        const kpis = await fetchKpis(exportFilters);
        downloadCsv(`sosagro-resumen-general-${stamp}.csv`, kpisToCsv(kpis));
      } else {
        const data = await fetchDashboardAnalytics(exportFilters);
        const slug = state.categoryId ?? "instrumento";
        downloadCsv(`sosagro-${slug}-${stamp}.csv`, questionsToCsv(data.questions));
      }
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="bg-surface border-b border-[var(--border)] px-4 sm:px-6 lg:px-8 py-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          {categoryTitle && (
            <h1 className="text-lg lg:text-base 2xl:text-xl font-semibold text-text-primary">{categoryTitle}</h1>
          )}
          <p className="text-sm lg:text-xs 2xl:text-base text-text-muted" role="status" aria-live="polite">
            {summaryLoading
              ? "Calculando tamaño de la muestra…"
              : summary!.suppressed
                ? `Muestra insuficiente (${summary!.count} encuestas)`
                : `${summary!.count} encuestas en la muestra`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExport}
            disabled={exporting}
            className="rounded-md border border-[var(--border)] px-4 py-2 text-sm lg:text-xs 2xl:text-base font-medium text-text-primary hover:bg-surface-muted disabled:opacity-60 disabled:cursor-wait transition-colors"
          >
            {exporting ? "Exportando…" : "Exportar CSV"}
          </button>
          <button
            type="button"
            disabled
            title="Reporte en PDF: pendiente de un spec posterior (requiere maquetación de reporte imprimible, fuera de alcance del spec 43)"
            className="rounded-md bg-brand px-4 py-2 text-sm lg:text-xs 2xl:text-base font-medium text-brand-foreground opacity-60 cursor-not-allowed"
          >
            Descargar reporte
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-stretch gap-2.5">
        <span className="shrink-0 self-center text-xs lg:text-[10px] 2xl:text-sm font-semibold tracking-wide text-text-muted uppercase">
          Filtros
        </span>

        <div className={pillContainerClass}>
          <label htmlFor="departmentId" className={pillLabelClass}>
            Departamento
          </label>
          <div className="flex min-w-0 flex-1 items-center justify-end gap-1">
            <select
              id="departmentId"
              value={filters.departmentId ?? ""}
              onChange={(e) => updateFilter("departmentId", e.target.value)}
              className={pillSelectClass}
            >
              <option value="">Todos</option>
              {departments.map((d) => (
                <option key={d.departmentId} value={d.departmentId}>
                  {d.name}
                </option>
              ))}
            </select>
            <span className="text-text-muted text-xs pointer-events-none shrink-0" aria-hidden="true">
              ▾
            </span>
          </div>
        </div>

        <div className={pillContainerClass}>
          <label htmlFor="townId" className={pillLabelClass}>
            Municipio
          </label>
          <div className="flex min-w-0 flex-1 items-center justify-end gap-1">
            <select
              id="townId"
              value={filters.townId ?? ""}
              onChange={(e) => updateFilter("townId", e.target.value)}
              disabled={!filters.departmentId || townsLoading}
              className={pillSelectClass}
            >
              <option value="">
                {!filters.departmentId ? "—" : townsLoading ? "Cargando…" : "Todos"}
              </option>
              {visibleTowns.map((t) => (
                <option key={t.townId} value={t.townId}>
                  {t.name}
                </option>
              ))}
            </select>
            <span className="text-text-muted text-xs pointer-events-none shrink-0" aria-hidden="true">
              ▾
            </span>
          </div>
        </div>

        <div className={pillContainerClass}>
          <label htmlFor="cropId" className={pillLabelClass}>
            Cultivo
          </label>
          <div className="flex min-w-0 flex-1 items-center justify-end gap-1">
            <select
              id="cropId"
              value={filters.cropId ?? ""}
              onChange={(e) => updateFilter("cropId", e.target.value)}
              className={pillSelectClass}
            >
              <option value="">Todos</option>
              {crops.map((crop) => (
                <option key={crop.cropId} value={crop.cropId}>
                  {crop.name}
                </option>
              ))}
            </select>
            <span className="text-text-muted text-xs pointer-events-none shrink-0" aria-hidden="true">
              ▾
            </span>
          </div>
        </div>

        <div className={pillContainerClass}>
          <label htmlFor="actorTypeId" className={pillLabelClass}>
            Tipo de actor
          </label>
          <div className="flex min-w-0 flex-1 items-center justify-end gap-1">
            <select
              id="actorTypeId"
              value={filters.actorTypeId ?? ""}
              onChange={(e) => updateFilter("actorTypeId", e.target.value)}
              className={pillSelectClass}
            >
              <option value="">Todos</option>
              {actorTypes.map((actorType) => (
                <option key={actorType.actorTypeId} value={actorType.actorTypeId}>
                  {actorType.name}
                </option>
              ))}
            </select>
            <span className="text-text-muted text-xs pointer-events-none shrink-0" aria-hidden="true">
              ▾
            </span>
          </div>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleClear}
            className="flex shrink-0 items-center gap-1 text-sm lg:text-xs 2xl:text-base font-medium text-[var(--danger-fg)] hover:underline"
          >
            <X size={14} />
            Limpiar
          </button>
        )}
      </div>
    </div>
  );
}
