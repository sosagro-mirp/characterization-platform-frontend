"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import { DashboardMetadata } from "../types";

interface MetadataBarProps {
  metadata: DashboardMetadata;
}

const FILTER_BADGES: {
  key: "departmentName" | "townName" | "cropName" | "actorTypeName";
  paramKey: string;
  prefix: string;
}[] = [
  { key: "departmentName", paramKey: "departmentId", prefix: "Departamento" },
  { key: "townName", paramKey: "townId", prefix: "Municipio" },
  { key: "cropName", paramKey: "cropId", prefix: "Cultivo" },
  { key: "actorTypeName", paramKey: "actorTypeId", prefix: "Tipo de actor" },
];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-CO", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function MetadataBar({ metadata }: MetadataBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function removeFilter(paramKey: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(paramKey);
    // Un municipio pertenece a un departamento: quitar el departamento invalida
    // el municipio seleccionado, igual que en FilterPanel.
    if (paramKey === "departmentId") params.delete("townId");
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  const activeBadges = FILTER_BADGES.filter(({ key }) => Boolean(metadata[key]));

  return (
    <div className="rounded-lg border border-[var(--border)] bg-surface px-4 py-3 mb-6 space-y-2">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-xl font-semibold text-text-primary">
          {metadata.instrumentName ?? "Instrumento"}
        </h1>
        <p className="text-sm text-text-muted">
          {metadata.totalCount} encuestas en la muestra
          {metadata.dateRange && (
            <>
              {" "}
              · {formatDate(metadata.dateRange.from)} –{" "}
              {formatDate(metadata.dateRange.to)}
            </>
          )}
        </p>
      </div>

      {activeBadges.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeBadges.map(({ key, paramKey, prefix }) => (
            <button
              key={paramKey}
              type="button"
              onClick={() => removeFilter(paramKey)}
              className="flex items-center gap-1 text-xs rounded-full bg-brand-light text-brand-dark px-2 py-1 hover:opacity-80 transition-opacity"
            >
              {prefix}: {metadata[key]}
              <X size={12} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
