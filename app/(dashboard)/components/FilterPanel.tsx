"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { fetchDashboardSummary, fetchPublicTowns } from "../api";
import { DepartmentSummary } from "@/services/departments.service";
import { TownSummary } from "@/services/towns.service";
import { CropSummary } from "@/app/(instrument)/types";
import { ActorTypeSummary } from "@/app/(admin)/types";
import { DashboardFilters, DashboardSummary, InstrumentSummary } from "../types";

interface FilterPanelProps {
  instruments: InstrumentSummary[];
  departments: DepartmentSummary[];
  crops: CropSummary[];
  actorTypes: ActorTypeSummary[];
}

const FILTER_KEYS: (keyof DashboardFilters)[] = [
  "instrumentId",
  "departmentId",
  "townId",
  "cropId",
  "actorTypeId",
];

const selectClass =
  "w-full rounded-lg border border-[var(--border)] bg-surface px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand disabled:opacity-50 disabled:cursor-not-allowed";

const labelClass = "block text-xs font-medium text-text-muted mb-1";

export default function FilterPanel({
  instruments,
  departments,
  crops,
  actorTypes,
}: FilterPanelProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamsKey = searchParams.toString();

  const filters: DashboardFilters = {
    instrumentId: searchParams.get("instrumentId") ?? undefined,
    departmentId: searchParams.get("departmentId") ?? undefined,
    townId: searchParams.get("townId") ?? undefined,
    cropId: searchParams.get("cropId") ?? undefined,
    actorTypeId: searchParams.get("actorTypeId") ?? undefined,
  };

  const [towns, setTowns] = useState<TownSummary[]>([]);
  const [townsLoading, setTownsLoading] = useState(false);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  useEffect(() => {
    if (!filters.departmentId) {
      setTowns([]);
      return;
    }
    let cancelled = false;
    setTownsLoading(true);
    fetchPublicTowns(filters.departmentId)
      .then((result) => {
        if (!cancelled) setTowns(result);
      })
      .finally(() => {
        if (!cancelled) setTownsLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.departmentId]);

  useEffect(() => {
    let cancelled = false;
    setSummaryLoading(true);
    fetchDashboardSummary(filters)
      .then((result) => {
        if (!cancelled) setSummary(result);
      })
      .finally(() => {
        if (!cancelled) setSummaryLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParamsKey]);

  function updateFilter(key: keyof DashboardFilters, value: string) {
    const params = new URLSearchParams(searchParamsKey);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    if (key === "departmentId") {
      params.delete("townId");
    }
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  function clearFilters() {
    router.push(pathname);
  }

  const hasActiveFilters = FILTER_KEYS.some((key) => Boolean(filters[key]));

  return (
    <aside className="w-full lg:w-72 shrink-0 space-y-5">
      <div>
        <label htmlFor="instrumentId" className={labelClass}>
          Instrumento
        </label>
        <select
          id="instrumentId"
          value={filters.instrumentId ?? ""}
          onChange={(e) => updateFilter("instrumentId", e.target.value)}
          className={selectClass}
        >
          <option value="">Selecciona un instrumento</option>
          {instruments.map((instrument) => (
            <option key={instrument.instrumentId} value={instrument.instrumentId}>
              {instrument.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="departmentId" className={labelClass}>
          Departamento
        </label>
        <select
          id="departmentId"
          value={filters.departmentId ?? ""}
          onChange={(e) => updateFilter("departmentId", e.target.value)}
          className={selectClass}
        >
          <option value="">Todos</option>
          {departments.map((department) => (
            <option key={department.departmentId} value={department.departmentId}>
              {department.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="townId" className={labelClass}>
          Municipio
        </label>
        <select
          id="townId"
          value={filters.townId ?? ""}
          onChange={(e) => updateFilter("townId", e.target.value)}
          disabled={!filters.departmentId || townsLoading}
          className={selectClass}
        >
          <option value="">
            {!filters.departmentId
              ? "Selecciona un departamento primero"
              : townsLoading
                ? "Cargando…"
                : "Todos"}
          </option>
          {towns.map((town) => (
            <option key={town.townId} value={town.townId}>
              {town.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="cropId" className={labelClass}>
          Cultivo
        </label>
        <select
          id="cropId"
          value={filters.cropId ?? ""}
          onChange={(e) => updateFilter("cropId", e.target.value)}
          className={selectClass}
        >
          <option value="">Todos</option>
          {crops.map((crop) => (
            <option key={crop.cropId} value={crop.cropId}>
              {crop.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="actorTypeId" className={labelClass}>
          Tipo de actor
        </label>
        <select
          id="actorTypeId"
          value={filters.actorTypeId ?? ""}
          onChange={(e) => updateFilter("actorTypeId", e.target.value)}
          className={selectClass}
        >
          <option value="">Todos</option>
          {actorTypes.map((actorType) => (
            <option key={actorType.actorTypeId} value={actorType.actorTypeId}>
              {actorType.name}
            </option>
          ))}
        </select>
      </div>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={clearFilters}
          className="text-sm text-brand hover:underline"
        >
          Limpiar filtros
        </button>
      )}

      <div className="rounded-lg border border-[var(--border)] bg-surface-muted px-3 py-2 text-sm text-text-muted">
        {summaryLoading
          ? "Calculando tamaño de la muestra…"
          : summary
            ? summary.suppressed
              ? `Muestra insuficiente (${summary.count} encuestas)`
              : `${summary.count} encuestas en la muestra`
            : "—"}
      </div>
    </aside>
  );
}
