"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { X } from "lucide-react";
import {
  AGE_RANGE_BUCKETS,
  buildDashboardQuery,
  clearDashboardFilters,
  DashboardPageState,
} from "@/lib/dashboard/filters";
import { cropColor } from "@/lib/dashboard/palette";
import { fetchPublicTowns } from "../api";
import { DepartmentSummary } from "@/services/departments.service";
import { TownSummary } from "@/services/towns.service";
import { CampaignActiveSummary, CropSummary } from "@/app/(instrument)/types";
import { ActorTypeSummary } from "@/app/(admin)/types";
import { DashboardFilters } from "../types";

interface GlobalFilterBarProps {
  state: DashboardPageState;
  departments: DepartmentSummary[];
  crops: CropSummary[];
  actorTypes: ActorTypeSummary[];
  campaigns: CampaignActiveSummary[];
}

/** `farmer.educationLevel` (S11-DB) — opciones sembradas, verificadas en la Fase 3/4. */
const EDUCATION_LEVEL_OPTIONS = [
  "Sin escolaridad",
  "Primaria (1°–5°)",
  "Secundaria (6°–9°)",
  "Media (10°–11°)",
  "Técnico o tecnológico",
  "Universitario",
  "Posgrado",
];

/** "¿Cómo describiría la calidad de la señal móvil en la finca?" (S8E). */
const CONNECTIVITY_OPTIONS = [
  "Sin señal",
  "Señal mala (llama pero no navega)",
  "Señal buena",
  "Señal regular (navega lento)",
  "No usa celular",
];


const selectClass =
  "rounded-md border border-[var(--border)] bg-surface px-2.5 py-1.5 text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-brand disabled:opacity-50 disabled:cursor-not-allowed";

/**
 * Barra de filtros global horizontal (spec 43, Fase 5): reemplaza el
 * `FilterPanel` lateral del spec 30. Toda actualización preserva `view`/
 * `categoryId` (D6) — solo cambian los filtros. El indicador reactivo de
 * tamaño de muestra queda para la Fase 8 (no es parte de esta fase).
 *
 * DEBT: "Departamento" es selección única — el diseño lo dibuja como
 * multiselección, pero `departmentId` en el backend es un único UUID
 * (spec 30, sin cambios en este spec). Ampliarlo a multiselección requeriría
 * un cambio de contrato en el backend, fuera de alcance de esta fase.
 */
export default function GlobalFilterBar({
  state,
  departments,
  crops,
  actorTypes,
  campaigns,
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

  function toggleCrop(cropId: string) {
    updateFilter("cropId", filters.cropId === cropId ? "" : cropId);
  }

  function handleClear() {
    const cleared = clearDashboardFilters(state);
    const query = buildDashboardQuery(cleared);
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  const hasActiveFilters = Object.values(filters).some(Boolean);

  return (
    <div className="bg-surface border-b border-[var(--border)] px-4 sm:px-6 py-3 space-y-2.5">
      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          disabled
          title="Disponible en una fase posterior del spec 43"
          className="rounded-md border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-text-muted opacity-60 cursor-not-allowed"
        >
          Exportar
        </button>
        <button
          type="button"
          disabled
          title="Disponible en una fase posterior del spec 43"
          className="rounded-md bg-brand px-3 py-1.5 text-xs font-medium text-brand-foreground opacity-60 cursor-not-allowed"
        >
          Descargar reporte
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[9px] font-semibold tracking-wide text-text-muted uppercase">
          Filtros
        </span>

        <select
          aria-label="Departamento"
          value={filters.departmentId ?? ""}
          onChange={(e) => updateFilter("departmentId", e.target.value)}
          className={selectClass}
        >
          <option value="">Departamento</option>
          {departments.map((d) => (
            <option key={d.departmentId} value={d.departmentId}>
              {d.name}
            </option>
          ))}
        </select>

        <select
          aria-label="Municipio"
          value={filters.townId ?? ""}
          onChange={(e) => updateFilter("townId", e.target.value)}
          disabled={!filters.departmentId || townsLoading}
          className={selectClass}
        >
          <option value="">
            {!filters.departmentId
              ? "Municipio"
              : townsLoading
                ? "Cargando…"
                : "Municipio: todos"}
          </option>
          {visibleTowns.map((t) => (
            <option key={t.townId} value={t.townId}>
              {t.name}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-1.5 rounded-md border border-[var(--border)] bg-surface-muted px-2 py-1">
          <span className="text-[10px] font-semibold text-text-muted">Cultivo:</span>
          {crops.map((crop) => {
            const active = filters.cropId === crop.cropId;
            const color = cropColor(crop.name);
            return (
              <button
                key={crop.cropId}
                type="button"
                onClick={() => toggleCrop(crop.cropId)}
                aria-pressed={active}
                style={
                  active
                    ? { backgroundColor: color, color: "#fff" }
                    : { color, borderColor: color }
                }
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold transition-colors ${
                  active ? "" : "border bg-transparent"
                }`}
              >
                {crop.name}
              </button>
            );
          })}
        </div>

        <select
          aria-label="Rango de edad"
          value={filters.ageRange ?? ""}
          onChange={(e) => updateFilter("ageRange", e.target.value)}
          className={selectClass}
        >
          <option value="">Rango edad</option>
          {AGE_RANGE_BUCKETS.map((bucket) => (
            <option key={bucket} value={bucket}>
              {bucket}
            </option>
          ))}
        </select>

        <select
          aria-label="Nivel educativo"
          value={filters.educationLevel ?? ""}
          onChange={(e) => updateFilter("educationLevel", e.target.value)}
          className={selectClass}
        >
          <option value="">Nivel educativo</option>
          {EDUCATION_LEVEL_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <select
          aria-label="Conectividad"
          value={filters.connectivity ?? ""}
          onChange={(e) => updateFilter("connectivity", e.target.value)}
          className={selectClass}
        >
          <option value="">Conectividad</option>
          {CONNECTIVITY_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <select
          aria-label="Tipo de actor"
          value={filters.actorTypeId ?? ""}
          onChange={(e) => updateFilter("actorTypeId", e.target.value)}
          className={selectClass}
        >
          <option value="">Tipo de actor</option>
          {actorTypes.map((actorType) => (
            <option key={actorType.actorTypeId} value={actorType.actorTypeId}>
              {actorType.name}
            </option>
          ))}
        </select>

        <select
          aria-label="Campaña"
          value={filters.campaignId ?? ""}
          onChange={(e) => updateFilter("campaignId", e.target.value)}
          className={selectClass}
        >
          <option value="">Campaña</option>
          {campaigns.map((campaign) => (
            <option key={campaign.campaignId} value={campaign.campaignId}>
              {campaign.name}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-1 rounded-md border border-[var(--border)] bg-surface-muted px-2 py-1">
          <label className="sr-only" htmlFor="dateFrom">
            Fecha desde
          </label>
          <input
            id="dateFrom"
            type="date"
            value={filters.dateFrom ?? ""}
            onChange={(e) => updateFilter("dateFrom", e.target.value)}
            className="bg-transparent text-[10px] text-text-primary focus:outline-none"
          />
          <span className="text-text-muted text-[10px]">–</span>
          <label className="sr-only" htmlFor="dateTo">
            Fecha hasta
          </label>
          <input
            id="dateTo"
            type="date"
            value={filters.dateTo ?? ""}
            onChange={(e) => updateFilter("dateTo", e.target.value)}
            className="bg-transparent text-[10px] text-text-primary focus:outline-none"
          />
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleClear}
            className="flex items-center gap-1 text-xs font-medium text-[var(--danger-fg)] hover:underline"
          >
            <X size={12} />
            Limpiar
          </button>
        )}
      </div>
    </div>
  );
}
