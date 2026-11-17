"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Users } from "lucide-react";
import type {
  FarmerCoverageList,
  FarmerCoverageRow,
} from "@/app/(admin)/types";
import { listFarmersCoverage } from "@/services/farmers.service";
import { listCrops } from "@/services/types-of-crops.service";
import {
  applyFarmerCoverageFilters,
  summarizeFarmerCoverage,
  type FarmerCoverageFilters,
} from "@/lib/farmers/coverageFilters";

const selectClass =
  "rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]";

type StatusFilter = NonNullable<FarmerCoverageFilters["status"]>;

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "—";
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}

function locationText(row: FarmerCoverageRow): string {
  const farm = row.primaryFarm;
  if (!farm) return "—";
  const base =
    [farm.town?.name, farm.department?.name].filter(Boolean).join(", ") || "—";
  return row.farmsCount > 1 ? `${base} (+${row.farmsCount - 1} finca${row.farmsCount - 1 === 1 ? "" : "s"})` : base;
}

const byName = (a: [string, string], b: [string, string]) =>
  a[1].localeCompare(b[1], "es");

export default function ProductoresPage() {
  const router = useRouter();
  const [data, setData] = useState<FarmerCoverageList | null>(null);
  const [cropNames, setCropNames] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Los filtros viven en el estado de la página (sin persistir en la URL).
  const [search, setSearch] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [townId, setTownId] = useState("");
  const [cropId, setCropId] = useState("");
  const [instrumentId, setInstrumentId] = useState("");
  const [status, setStatus] = useState<StatusFilter | "">("");

  useEffect(() => {
    let cancelled = false;
    Promise.all([listFarmersCoverage(), listCrops().catch(() => [])])
      .then(([list, crops]) => {
        if (cancelled) return;
        setData(list);
        setCropNames(new Map(crops.map((c) => [c.cropId, c.name])));
      })
      .catch((err) => {
        if (!cancelled)
          setError(
            err instanceof Error ? err.message : "Error al cargar productores.",
          );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const rows = useMemo(() => data?.rows ?? [], [data]);

  const options = useMemo(() => {
    const departments = new Map<string, string>();
    const towns = new Map<string, string>();
    const crops = new Set<string>();
    for (const row of rows) {
      const d = row.primaryFarm?.department;
      const t = row.primaryFarm?.town;
      if (d) departments.set(d.departmentId, d.name);
      if (t && (!departmentId || d?.departmentId === departmentId)) {
        towns.set(t.townId, t.name);
      }
      row.cropIds.forEach((c) => crops.add(c));
    }
    return {
      departments: [...departments].sort(byName),
      towns: [...towns].sort(byName),
      crops: [...crops]
        .map((id) => [id, cropNames.get(id) ?? id] as [string, string])
        .sort(byName),
    };
  }, [rows, departmentId, cropNames]);

  const filtered = useMemo(
    () =>
      applyFarmerCoverageFilters(rows, {
        search,
        departmentIds: departmentId ? [departmentId] : [],
        townIds: townId ? [townId] : [],
        cropIds: cropId ? [cropId] : [],
        missingInstrumentId: instrumentId || null,
        status: status || null,
      }),
    [rows, search, departmentId, townId, cropId, instrumentId, status],
  );

  const hasFilters = Boolean(
    search || departmentId || townId || cropId || instrumentId || status,
  );

  function clearFilters() {
    setSearch("");
    setDepartmentId("");
    setTownId("");
    setCropId("");
    setInstrumentId("");
    setStatus("");
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
          Productores
        </h1>
        <p className="text-sm text-[var(--text-muted)]">
          {loading || !data
            ? "Cobertura de instrumentos por productor."
            : `${filtered.length} de ${rows.length} productor${rows.length === 1 ? "" : "es"} · ${data.summary.fullyCovered} con cobertura completa · ${data.summary.withoutFarm} sin finca`}
        </p>
      </div>

      <div>
        <Link
          href="/productores/nuevo"
          className="inline-flex rounded-md bg-brand px-3 py-2 text-xs font-semibold text-brand-foreground hover:bg-brand-hover"
        >
          Nuevo productor
        </Link>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="relative w-full max-w-xs">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-[var(--text-muted)]"
            aria-hidden="true"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o documento…"
            aria-label="Buscar por nombre o documento"
            className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] py-2 pl-9 pr-4 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
          />
        </div>
        <select
          aria-label="Departamento"
          value={departmentId}
          onChange={(e) => {
            setDepartmentId(e.target.value);
            setTownId("");
          }}
          className={selectClass}
        >
          <option value="">Todos los departamentos</option>
          {options.departments.map(([id, name]) => (
            <option key={id} value={id}>{name}</option>
          ))}
        </select>
        <select
          aria-label="Municipio"
          value={townId}
          onChange={(e) => setTownId(e.target.value)}
          className={selectClass}
        >
          <option value="">Todos los municipios</option>
          {options.towns.map(([id, name]) => (
            <option key={id} value={id}>{name}</option>
          ))}
        </select>
        <select
          aria-label="Cultivo"
          value={cropId}
          onChange={(e) => setCropId(e.target.value)}
          className={selectClass}
        >
          <option value="">Todos los cultivos</option>
          {options.crops.map(([id, name]) => (
            <option key={id} value={id}>{name}</option>
          ))}
        </select>
        <select
          aria-label="Le falta el instrumento"
          value={instrumentId}
          onChange={(e) => setInstrumentId(e.target.value)}
          className={selectClass}
        >
          <option value="">Le falta…</option>
          {(data?.instruments ?? []).map((i) => (
            <option key={i.instrumentId} value={i.instrumentId}>
              {i.coverageGroup ?? i.code ?? i.name}
            </option>
          ))}
        </select>
        <select
          aria-label="Estado"
          value={status}
          onChange={(e) => setStatus(e.target.value as StatusFilter | "")}
          className={selectClass}
        >
          <option value="">Cualquier estado</option>
          <option value="completo">Completo</option>
          <option value="con_pendientes">Con pendientes</option>
          <option value="sin_finca">Sin finca</option>
        </select>
        {hasFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="rounded-md px-3 py-2 text-xs font-medium text-[var(--text-muted)] hover:bg-[var(--surface-muted)]"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {error && (
        <p className="text-sm text-[var(--danger-fg)] rounded-lg bg-[var(--danger-bg)] px-3 py-2">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-[var(--text-muted)]">Cargando…</p>
      ) : (
        <div className="overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--surface)]">
          {filtered.length > 0 && (
            <table className="w-full text-xs">
              <thead className="border-b border-[var(--border)] bg-[var(--surface-muted)] text-[10.5px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                <tr>
                  <th className="px-3 py-2.5 text-left">Productor</th>
                  <th className="px-3 py-2.5 text-left">Documento</th>
                  <th className="px-3 py-2.5 text-left">Cobertura</th>
                  <th className="px-3 py-2.5 text-left">Pendientes</th>
                  <th className="px-3 py-2.5 text-left">Fincas</th>
                  <th className="px-3 py-2.5 text-left">Ubicación</th>
                  <th className="px-3 py-2.5 text-left">Consentimiento</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {filtered.map((row) => {
                  const s = summarizeFarmerCoverage(row);
                  return (
                    <tr
                      key={row.farmerId}
                      onClick={() => router.push(`/productores/${row.farmerId}`)}
                      className="cursor-pointer transition-colors hover:bg-[var(--surface-muted)]"
                    >
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2.5">
                          <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-[var(--surface-muted)] text-[10px] font-bold text-[var(--text-muted)]">
                            {initials(row.name)}
                          </span>
                          <span className="font-medium text-[var(--text-primary)]">
                            {row.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-[var(--text-muted)]">
                        {row.documentId ?? "—"}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-[var(--text-primary)]">
                        {s.label}
                      </td>
                      <td className="px-3 py-2.5">
                        {s.pending > 0 ? (
                          <span className="inline-flex rounded-full bg-[var(--warning-bg)] px-2 py-0.5 text-[10.5px] font-medium text-[var(--warning-fg)]">
                            {s.pending}
                          </span>
                        ) : (
                          <span className="text-[var(--text-muted)]">0</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-[var(--text-muted)]">
                        {row.warnings.includes("sin_finca") ? (
                          <span className="inline-flex rounded-full bg-[var(--danger-bg)] px-2 py-0.5 text-[10.5px] font-medium text-[var(--danger-fg)]">
                            Sin finca
                          </span>
                        ) : (
                          row.farmsCount
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-[var(--text-muted)]">
                        {locationText(row)}
                      </td>
                      <td className="px-3 py-2.5">
                        {row.hasPendingConsent ? (
                          <span className="inline-flex items-center rounded-full bg-[var(--warning-bg)] px-2 py-0.5 text-[10.5px] font-medium text-[var(--warning-fg)]">
                            Pendiente
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-[var(--surface-muted)] px-2 py-0.5 text-[10.5px] font-medium text-[var(--text-muted)]">
                            Vigente
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {filtered.length === 0 && (
            <div className="flex flex-col items-center px-6 py-16 text-center">
              <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-[var(--surface-muted)]">
                <Users className="size-5 text-[var(--text-muted)]" aria-hidden="true" />
              </div>
              <p className="mb-1.5 text-sm font-semibold text-[var(--text-primary)]">
                {hasFilters ? "Ningún productor coincide con los filtros" : "No hay productores registrados"}
              </p>
              <p className="max-w-sm text-xs text-[var(--text-muted)]">
                {hasFilters
                  ? "Prueba con otros filtros o límpialos para ver la lista completa."
                  : "Los productores aparecen aquí cuando se aplica una encuesta en campo."}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
