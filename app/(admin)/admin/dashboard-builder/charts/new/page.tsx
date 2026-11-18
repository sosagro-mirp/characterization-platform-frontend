"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createBuilderChart } from "@/services/dashboard-builder.service";
import ChartForm, { emptyChartForm } from "@/components/admin/dashboard-builder/ChartForm";
import { useBuilderCatalogs } from "@/components/admin/dashboard-builder/useBuilderCatalogs";

/** Spec 109, Fase 2 — nuevo gráfico (nace como borrador). */
export default function NewChartPage() {
  const router = useRouter();
  const categoryId = useSearchParams().get("categoryId") ?? "";
  const { catalogs, error } = useBuilderCatalogs();
  const back = `/admin/dashboard-builder${categoryId ? `?categoryId=${categoryId}` : ""}`;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4">
      <Link href={back} className="inline-flex items-center gap-1 text-sm text-brand hover:underline">
        <ArrowLeft size={16} aria-hidden="true" /> Volver al constructor
      </Link>
      <h1 className="text-2xl font-semibold">Nuevo gráfico</h1>
      <p className="text-sm text-[var(--text-muted)]">
        Se guarda como borrador: no aparece en ningún dashboard hasta que lo publiques.
      </p>
      {error && <p className="text-sm text-[var(--danger-fg)]">{error}</p>}
      {catalogs ? (
        <ChartForm
          initial={emptyChartForm(categoryId)}
          categories={catalogs.categories}
          matrix={catalogs.matrix}
          metrics={catalogs.metrics}
          submitLabel="Guardar borrador"
          onSubmit={async (payload) => {
            const { chartId } = await createBuilderChart(payload);
            router.push(`/admin/dashboard-builder/charts/${chartId}`);
          }}
        />
      ) : (
        !error && <p className="text-sm text-[var(--text-muted)]">Cargando…</p>
      )}
    </div>
  );
}
