"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import { DashboardMetadata } from "../types";

interface ViewHeaderProps {
  title: string;
  /** Código de categoría (C1–C15) para el badge; omitido en la vista de resumen general. */
  badge?: string;
  subtitle?: string;
  metadata?: DashboardMetadata;
}

/** Filtros con nombre resuelto por el backend (UUID → texto). */
const RESOLVED_NAME_FILTERS: {
  key: "departmentName" | "townName" | "cropName" | "actorTypeName";
  paramKey: string;
  prefix: string;
}[] = [
  { key: "departmentName", paramKey: "departmentId", prefix: "Departamento" },
  { key: "townName", paramKey: "townId", prefix: "Municipio" },
  { key: "cropName", paramKey: "cropId", prefix: "Cultivo" },
  { key: "actorTypeName", paramKey: "actorTypeId", prefix: "Tipo de actor" },
];

/** Filtros globales (spec 43, D3) cuyo valor ya es el texto a mostrar — no
 * necesitan resolución de nombre en el backend (a diferencia de los UUID de
 * arriba). `campaignId` es la excepción: es un UUID sin `campaignName` en
 * `DashboardMetadataDto` hoy, así que se etiqueta genérico. */
const VALUE_FILTERS: { paramKey: string; prefix: string }[] = [
  { paramKey: "gender", prefix: "Género" },
  { paramKey: "ageRange", prefix: "Edad" },
  { paramKey: "educationLevel", prefix: "Nivel educativo" },
  { paramKey: "connectivity", prefix: "Conectividad" },
  { paramKey: "populationGroup", prefix: "Grupo poblacional" },
  { paramKey: "profile", prefix: "Perfil" },
  { paramKey: "tenure", prefix: "Tenencia" },
  { paramKey: "chainStage", prefix: "Etapa" },
  { paramKey: "dateFrom", prefix: "Desde" },
  { paramKey: "dateTo", prefix: "Hasta" },
];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-CO", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Encabezado de vista (spec 43, D9): sustituye a `MetadataBar`. A diferencia
 * de esta, titula por categoría o por instrumento según cuál esté activo
 * (`MetadataBar` asumía siempre instrumento y quedaba vacío al navegar por
 * categoría), y agrega el badge `Cx`.
 */
export default function ViewHeader({
  title,
  badge,
  subtitle,
  metadata,
}: ViewHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function removeFilter(paramKey: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(paramKey);
    if (paramKey === "departmentId") params.delete("townId");
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  const resolvedChips = metadata
    ? RESOLVED_NAME_FILTERS.filter(({ key }) => Boolean(metadata[key])).map(
        ({ key, paramKey, prefix }) => ({
          paramKey,
          label: `${prefix}: ${metadata[key]}`,
        }),
      )
    : [];

  const valueChips = VALUE_FILTERS.filter(({ paramKey }) =>
    Boolean(searchParams.get(paramKey)),
  ).map(({ paramKey, prefix }) => ({
    paramKey,
    label: `${prefix}: ${searchParams.get(paramKey)}`,
  }));

  const campaignChip = searchParams.get("campaignId")
    ? [{ paramKey: "campaignId", label: "Campaña activa" }]
    : [];

  const chips = [...resolvedChips, ...valueChips, ...campaignChip];

  return (
    <div className="rounded-lg border border-[var(--border)] bg-surface px-4 py-3 space-y-2">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="flex items-center gap-2">
          {badge && (
            <span className="rounded px-1.5 py-0.5 text-[10px] font-bold bg-brand-subtle-bg text-brand-subtle-fg">
              {badge}
            </span>
          )}
          <h1 className="text-xl font-semibold text-text-primary">{title}</h1>
        </div>
        {metadata && (
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
        )}
      </div>

      {subtitle && <p className="text-xs text-text-muted">{subtitle}</p>}

      {chips.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {chips.map(({ paramKey, label }) => (
            <button
              key={paramKey}
              type="button"
              onClick={() => removeFilter(paramKey)}
              className="flex items-center gap-1 text-xs rounded-full bg-brand-light text-brand-dark px-2 py-1 hover:opacity-80 transition-opacity"
            >
              {label}
              <X size={12} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
